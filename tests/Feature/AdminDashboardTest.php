<?php

use App\Models\Category;
use App\Models\Material;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('guest cannot access admin dashboard and is redirected to login', function () {
    $response = $this->get('/admin');

    $response->assertRedirect('/login');
});

test('non-admin user cannot access admin dashboard (403 forbidden)', function () {
    $user = User::factory()->create([
        'role' => 'Peserta',
    ]);

    $response = $this->actingAs($user)->get('/admin');

    $response->assertStatus(403);
});

test('admin user can view dashboard overview with real metrics via inertia', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
    ]);

    $response = $this->actingAs($admin)->get('/admin');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Dashboard')
        ->has('metrics')
        ->has('pending_reviews')
        ->has('recent_activities')
        ->has('recent_materials')
        ->has('category_distribution')
    );
});

test('admin can view materials collection with search and filters via inertia', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
    ]);

    $response = $this->actingAs($admin)->get('/admin/koleksi');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Collections/Index')
        ->has('materials.data')
        ->has('categories')
        ->has('available_years')
        ->has('filters')
    );
});

test('admin can create a new material', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
    ]);

    $category = Category::create([
        'name' => 'Modul Penataran',
        'slug' => 'modul-penataran',
    ]);

    Storage::fake('local');
    $file = UploadedFile::fake()->create('pedoman.pdf', 1024, 'application/pdf');

    $response = $this->actingAs($admin)->post('/admin/koleksi', [
        'title' => 'Pedoman Penataran Nasional 2026',
        'code' => 'PPN-2026',
        'category_id' => $category->id,
        'type' => 'module',
        'publication_year' => 2026,
        'page_count' => 150,
        'summary' => 'Ringkasan modul penataran nasional.',
        'status' => 'published',
        'book_file' => $file,
    ]);

    $response->assertRedirect('/admin/koleksi');
    $this->assertDatabaseHas('materials', [
        'title' => 'Pedoman Penataran Nasional 2026',
        'code' => 'PPN-2026',
        'status' => 'published',
    ]);
});

test('admin can update material status', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
    ]);

    $material = Material::create([
        'title' => 'Buku Panduan Wasit',
        'slug' => 'buku-panduan-wasit',
        'type' => 'book',
        'status' => 'draft',
        'created_by' => $admin->id,
    ]);

    $response = $this->actingAs($admin)->patch('/admin/koleksi/'.$material->id.'/status', [
        'status' => 'published',
    ]);

    $response->assertSessionHas('success');
    $this->assertDatabaseHas('materials', [
        'id' => $material->id,
        'status' => 'published',
    ]);
});

test('admin can delete a material', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
    ]);

    $material = Material::create([
        'title' => 'Draft Modul Kadaluarsa',
        'slug' => 'draft-modul-kadaluarsa',
        'type' => 'document',
        'status' => 'draft',
        'created_by' => $admin->id,
    ]);

    $response = $this->actingAs($admin)->delete('/admin/koleksi/'.$material->id);

    $response->assertRedirect('/admin/koleksi');
    $this->assertSoftDeleted('materials', [
        'id' => $material->id,
    ]);
});

test('admin can create category', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
    ]);

    $response = $this->actingAs($admin)->post('/admin/kategori', [
        'name' => 'Perwasitan Shorinji Kempo',
        'description' => 'Materi dan standar wasit resmi.',
        'color' => '#EE9B25',
        'is_active' => '1',
    ]);

    $response->assertRedirect('/admin/kategori');
    $this->assertDatabaseHas('categories', [
        'name' => 'Perwasitan Shorinji Kempo',
        'slug' => 'perwasitan-shorinji-kempo',
    ]);
});

test('admin can update category slug and duplicate slugs are rejected', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
    ]);
    $category = Category::create([
        'name' => 'Perwasitan Daerah',
        'slug' => 'perwasitan-daerah',
    ]);
    Category::create([
        'name' => 'Kepelatihan Nasional',
        'slug' => 'kepelatihan-nasional',
    ]);

    $response = $this->actingAs($admin)->put('/admin/kategori/'.$category->id, [
        'name' => 'Perwasitan Daerah',
        'slug' => 'Pedoman Wasit Daerah 2026',
        'description' => 'Pedoman terbaru untuk wasit daerah.',
        'color' => '#0B63CE',
        'is_active' => true,
    ]);

    $response->assertRedirect('/admin/kategori');
    $this->assertDatabaseHas('categories', [
        'id' => $category->id,
        'slug' => 'pedoman-wasit-daerah-2026',
    ]);

    $duplicateResponse = $this->put('/admin/kategori/'.$category->id, [
        'name' => 'Perwasitan Daerah',
        'slug' => 'kepelatihan-nasional',
        'color' => '#0B63CE',
        'is_active' => true,
    ]);

    $duplicateResponse->assertSessionHasErrors('slug');
    expect($category->fresh()->slug)->toBe('pedoman-wasit-daerah-2026');
});

test('admin cannot delete category with existing materials', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
    ]);

    $category = Category::create([
        'name' => 'Kepelatihan',
        'slug' => 'kepelatihan',
    ]);

    $material = Material::create([
        'title' => 'Materi Latihan Dasar',
        'slug' => 'materi-latihan-dasar',
        'type' => 'module',
        'status' => 'published',
        'created_by' => $admin->id,
    ]);

    $category->materials()->attach($material->id);

    $response = $this->actingAs($admin)->delete('/admin/kategori/'.$category->id);

    $response->assertSessionHas('error');
    $this->assertDatabaseHas('categories', [
        'id' => $category->id,
    ]);
});

test('admin can change user role', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
    ]);

    $kenshi = User::factory()->create([
        'name' => 'Kenshi Raharja',
        'email' => 'kenshi.raharja@perkemi.id',
        'role' => 'Peserta',
    ]);

    $response = $this->actingAs($admin)->patch('/admin/pengguna/'.$kenshi->id.'/role', [
        'role' => 'Pelatih',
    ]);

    $response->assertSessionHas('success');
    $this->assertDatabaseHas('users', [
        'id' => $kenshi->id,
        'role' => 'Pelatih',
    ]);
});

test('admin can view and update permission matrix via inertia', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
    ]);

    $role = Role::create(['name' => 'coach', 'guard_name' => 'web']);
    $perm = Permission::create(['name' => 'materials.view', 'guard_name' => 'web']);

    $response = $this->actingAs($admin)->get('/admin/hak-akses');
    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Permissions/Index')
        ->has('roles')
        ->has('permissions')
    );

    $response = $this->actingAs($admin)->put('/admin/hak-akses', [
        'matrix' => [
            $role->id => [
                $perm->id => '1',
            ],
        ],
    ]);

    $response->assertSessionHas('success');
    $this->assertDatabaseHas('role_has_permissions', [
        'role_id' => $role->id,
        'permission_id' => $perm->id,
    ]);
});

test('admin can view activities audit log via inertia', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
    ]);

    $response = $this->actingAs($admin)->get('/admin/aktivitas');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Activities/Index')
        ->has('activities.data')
        ->has('actors')
        ->has('events')
    );
});

test('admin can view and update portal settings via inertia', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
    ]);

    $response = $this->actingAs($admin)->get('/admin/pengaturan');
    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Settings/Index')
        ->has('settings')
    );

    $response = $this->actingAs($admin)->put('/admin/pengaturan', [
        'settings_group' => 'identity',
        'site_name' => 'Pustaka Penataran Indonesia',
        'site_tagline' => 'Portal Buku Digital PB PERKEMI',
    ]);

    $response->assertSessionHas('success');
    $this->assertDatabaseHas('settings', [
        'key' => 'site_name',
        'value' => 'Pustaka Penataran Indonesia',
    ]);
});

test('admin can view help guide and faq via inertia', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
    ]);

    $response = $this->actingAs($admin)->get('/admin/bantuan');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Help/Index')
    );
});
