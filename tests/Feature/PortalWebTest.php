<?php

use App\Models\Audience;
use App\Models\Category;
use App\Models\Material;
use App\Models\MaterialFile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('local');
});

test('home page renders Inertia Portal/Home with live database stats and materials', function () {
    $category = Category::create(['name' => 'Perwasitan', 'slug' => 'perwasitan']);
    $audience = Audience::create(['name' => 'Wasit', 'code' => 'referee']);

    // Published material with file
    $pdf = UploadedFile::fake()->create('modul-wasit.pdf', 1000, 'application/pdf');
    $path = $pdf->storeAs('books/1', 'v1_test.pdf', 'local');

    $material = Material::create([
        'title' => 'Modul Wasit Nasional',
        'slug' => 'modul-wasit-nasional',
        'code' => 'WST-01',
        'type' => 'module',
        'status' => 'published',
        'is_featured' => true,
        'created_by' => 1,
    ]);
    $material->categories()->sync([$category->id]);
    $material->audiences()->sync([$audience->id]);

    MaterialFile::create([
        'material_id' => $material->id,
        'kind' => 'primary',
        'disk' => 'local',
        'path' => $path,
        'original_name' => 'modul-wasit.pdf',
        'mime_type' => 'application/pdf',
        'size_bytes' => 1000,
        'version' => 1,
        'is_active' => true,
    ]);

    // Draft material without active file should NEVER appear on home
    Material::create([
        'title' => 'Draf Rahasia',
        'slug' => 'draf-rahasia',
        'code' => 'DRAFT-99',
        'type' => 'book',
        'status' => 'draft',
        'created_by' => 1,
    ]);

    $response = $this->get('/');
    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Portal/Home')
            ->has('stats')
            ->where('stats.total_materials', 1)
            ->has('featured_materials', 1)
            ->where('featured_materials.0.title', 'Modul Wasit Nasional')
            ->has('categories', 1)
            ->has('latest_materials', 1)
            ->has('roles', 1)
        );
});

test('collections catalog page supports search, filtering, and sorting', function () {
    $categoryA = Category::create(['name' => 'Teknik Goho', 'slug' => 'teknik-goho']);
    $categoryB = Category::create(['name' => 'Perwasitan', 'slug' => 'perwasitan']);

    // Item 1
    $pdf1 = UploadedFile::fake()->create('doc1.pdf', 500, 'application/pdf');
    $m1 = Material::create([
        'title' => 'Standarisasi Goho Lanjutan',
        'slug' => 'standarisasi-goho-lanjutan',
        'code' => 'GH-02',
        'type' => 'module',
        'status' => 'published',
        'publication_year' => 2025,
        'created_by' => 1,
    ]);
    $m1->categories()->sync([$categoryA->id]);
    MaterialFile::create([
        'material_id' => $m1->id,
        'kind' => 'primary',
        'disk' => 'local',
        'path' => $pdf1->storeAs("books/{$m1->id}", 'v1_doc1.pdf', 'local'),
        'original_name' => 'doc1.pdf',
        'mime_type' => 'application/pdf',
        'size_bytes' => 500,
        'version' => 1,
        'is_active' => true,
    ]);

    // Item 2
    $pdf2 = UploadedFile::fake()->create('doc2.pdf', 800, 'application/pdf');
    $m2 = Material::create([
        'title' => 'Pedoman Wasit Shorinji Kempo',
        'slug' => 'pedoman-wasit-shorinji-kempo',
        'code' => 'WST-05',
        'type' => 'guideline',
        'status' => 'published',
        'publication_year' => 2026,
        'created_by' => 1,
    ]);
    $m2->categories()->sync([$categoryB->id]);
    MaterialFile::create([
        'material_id' => $m2->id,
        'kind' => 'primary',
        'disk' => 'local',
        'path' => $pdf2->storeAs("books/{$m2->id}", 'v1_doc2.pdf', 'local'),
        'original_name' => 'doc2.pdf',
        'mime_type' => 'application/pdf',
        'size_bytes' => 800,
        'version' => 1,
        'is_active' => true,
    ]);

    // 1. General list
    $responseAll = $this->get('/koleksi');
    $responseAll->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Portal/Collections/Index')
            ->has('materials.data', 2)
        );

    // 2. Search query filter
    $responseSearch = $this->get('/koleksi?search=Wasit');
    $responseSearch->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Portal/Collections/Index')
            ->has('materials.data', 1)
            ->where('materials.data.0.title', 'Pedoman Wasit Shorinji Kempo')
        );

    // 3. Category filter
    $responseCat = $this->get('/koleksi?category=teknik-goho');
    $responseCat->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Portal/Collections/Index')
            ->has('materials.data', 1)
            ->where('materials.data.0.title', 'Standarisasi Goho Lanjutan')
        );

    // 4. Type filter
    $responseType = $this->get('/koleksi?type=guideline');
    $responseType->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Portal/Collections/Index')
            ->has('materials.data', 1)
            ->where('materials.data.0.type', 'guideline')
        );
});

test('collection detail page displays metadata and checks reader permission', function () {
    $category = Category::create(['name' => 'Perwasitan', 'slug' => 'perwasitan']);
    $audience = Audience::create(['name' => 'Wasit', 'code' => 'referee']);

    $pdf = UploadedFile::fake()->create('panduan-wasit.pdf', 600, 'application/pdf');
    $material = Material::create([
        'title' => 'Panduan Wasit Tingkat Nasional',
        'slug' => 'panduan-wasit-tingkat-nasional',
        'code' => 'PWTN-01',
        'type' => 'book',
        'status' => 'published',
        'is_downloadable' => false,
        'created_by' => 1,
    ]);
    $material->categories()->sync([$category->id]);
    $material->audiences()->sync([$audience->id]);

    MaterialFile::create([
        'material_id' => $material->id,
        'kind' => 'primary',
        'disk' => 'local',
        'path' => $pdf->storeAs("books/{$material->id}", 'v1_file.pdf', 'local'),
        'original_name' => 'panduan-wasit.pdf',
        'mime_type' => 'application/pdf',
        'size_bytes' => 600,
        'version' => 1,
        'is_active' => true,
    ]);

    // Unauthenticated guest: can_read is false because audience is restricted
    $responseGuest = $this->get("/koleksi/{$material->slug}");
    $responseGuest->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Portal/Collections/Show')
            ->where('material.title', 'Panduan Wasit Tingkat Nasional')
            ->where('can_read', false)
            ->where('can_download', false)
        );

    // Authenticated user with role 'Wasit': can_read is true
    $wasitUser = User::factory()->create(['role' => 'Wasit']);
    $responseWasit = $this->actingAs($wasitUser)->get("/koleksi/{$material->slug}");
    $responseWasit->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Portal/Collections/Show')
            ->where('can_read', true)
        );

    // Authenticated user with role 'Peserta': can_read is false
    $pesertaUser = User::factory()->create(['role' => 'Peserta']);
    $responsePeserta = $this->actingAs($pesertaUser)->get("/koleksi/{$material->slug}");
    $responsePeserta->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Portal/Collections/Show')
            ->where('can_read', false)
        );
});

test('category show page renders materials in that category', function () {
    $cat = Category::create(['name' => 'Materi Pengujian', 'slug' => 'materi-pengujian']);

    $pdf = UploadedFile::fake()->create('modul-uji.pdf', 500, 'application/pdf');
    $material = Material::create([
        'title' => 'Pedoman Ujian Kenshi Tingkat I',
        'slug' => 'pedoman-ujian-kenshi-tingkat-i',
        'type' => 'module',
        'status' => 'published',
        'created_by' => 1,
    ]);
    $material->categories()->sync([$cat->id]);
    MaterialFile::create([
        'material_id' => $material->id,
        'kind' => 'primary',
        'disk' => 'local',
        'path' => $pdf->storeAs("books/{$material->id}", 'v1_uji.pdf', 'local'),
        'original_name' => 'modul-uji.pdf',
        'mime_type' => 'application/pdf',
        'size_bytes' => 500,
        'version' => 1,
        'is_active' => true,
    ]);

    $response = $this->get('/kategori/materi-pengujian');
    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Portal/Categories/Show')
            ->where('category.slug', 'materi-pengujian')
            ->has('materials.data', 1)
        );
});

test('role show page renders materials matching audience role', function () {
    $audience = Audience::create(['name' => 'Pelatih', 'code' => 'coach']);

    $pdf = UploadedFile::fake()->create('pelatih.pdf', 700, 'application/pdf');
    $material = Material::create([
        'title' => 'Metodologi Melatih Shorinji Kempo',
        'slug' => 'metodologi-melatih-shorinji-kempo',
        'type' => 'book',
        'status' => 'published',
        'created_by' => 1,
    ]);
    $material->audiences()->sync([$audience->id]);
    MaterialFile::create([
        'material_id' => $material->id,
        'kind' => 'primary',
        'disk' => 'local',
        'path' => $pdf->storeAs("books/{$material->id}", 'v1_pelatih.pdf', 'local'),
        'original_name' => 'pelatih.pdf',
        'mime_type' => 'application/pdf',
        'size_bytes' => 700,
        'version' => 1,
        'is_active' => true,
    ]);

    $response = $this->get('/untuk/pelatih');
    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Portal/Roles/Show')
            ->where('role_name', 'Pelatih')
            ->has('materials.data', 1)
        );
});

test('categories index page renders active categories directory', function () {
    Category::create(['name' => 'Perwasitan', 'slug' => 'perwasitan', 'is_active' => true]);
    Category::create(['name' => 'Kepelatihan', 'slug' => 'kepelatihan', 'is_active' => true]);

    $response = $this->get('/kategori');
    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Portal/Categories/Index')
            ->has('categories', 2)
            ->where('total_categories', 2)
        );
});

test('roles index page renders 6 audience roles with learning needs', function () {
    Audience::create(['name' => 'Peserta', 'code' => 'participant', 'is_active' => true]);
    Audience::create(['name' => 'Pelatih', 'code' => 'coach', 'is_active' => true]);
    Audience::create(['name' => 'Wasit', 'code' => 'referee', 'is_active' => true]);

    $response = $this->get('/untuk');
    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Portal/Roles/Index')
            ->has('roles', 3)
            ->where('total_roles', 3)
        );
});

test('about and help pages are publicly accessible via Inertia', function () {
    $responseAbout = $this->get('/tentang');
    $responseAbout->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Portal/About'));

    $responseHelp = $this->get('/bantuan');
    $responseHelp->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Portal/Help'));
});

test('reader route enforces authentication and role authorization', function () {
    $audience = Audience::create(['name' => 'Wasit', 'code' => 'referee']);

    $pdf = UploadedFile::fake()->create('modul-wasit.pdf', 800, 'application/pdf');
    $material = Material::create([
        'title' => 'Buku Wasit Rahasia',
        'slug' => 'buku-wasit-rahasia',
        'code' => 'BWR-01',
        'type' => 'book',
        'status' => 'published',
        'created_by' => 1,
    ]);
    $material->audiences()->sync([$audience->id]);

    MaterialFile::create([
        'material_id' => $material->id,
        'kind' => 'primary',
        'disk' => 'local',
        'path' => $pdf->storeAs("books/{$material->id}", 'v1_file.pdf', 'local'),
        'original_name' => 'modul-wasit.pdf',
        'mime_type' => 'application/pdf',
        'size_bytes' => 800,
        'version' => 1,
        'is_active' => true,
    ]);

    // 1. Unauthenticated guest is redirected to login
    $guestResponse = $this->get("/koleksi/{$material->slug}/baca");
    $guestResponse->assertRedirect('/login');

    // 2. Authenticated user without matching role gets 403 Forbidden
    $peserta = User::factory()->create(['role' => 'Peserta']);
    $forbiddenResponse = $this->actingAs($peserta)->get("/koleksi/{$material->slug}/baca");
    $forbiddenResponse->assertForbidden();

    // 3. Authenticated user with matching role can access reader
    $wasit = User::factory()->create(['role' => 'Wasit']);
    $authorizedResponse = $this->actingAs($wasit)->get("/koleksi/{$material->slug}/baca");
    $authorizedResponse->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Reader/Show')
            ->where('material.title', 'Buku Wasit Rahasia')
            ->where('has_file', true)
        );
});
