<?php

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('admin can view master role index page', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
    ]);

    $response = $this->actingAs($admin)->get('/admin/role');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/Roles/Index')
        ->has('roles')
        ->has('metrics')
    );
});

test('non-admin cannot access master role page', function () {
    $user = User::factory()->create([
        'role' => 'Peserta',
    ]);

    $response = $this->actingAs($user)->get('/admin/role');

    $response->assertForbidden();
});

test('admin can create custom role', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
    ]);

    $response = $this->actingAs($admin)->post('/admin/role', [
        'name' => 'petugas-logistik',
        'label' => 'Petugas Logistik & Konsumsi',
        'description' => 'Mengelola ketersediaan sarana latihan dan konsumsi kegiatan.',
    ]);

    $response->assertRedirect('/admin/role');
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('roles', [
        'name' => 'petugas-logistik',
        'label' => 'Petugas Logistik & Konsumsi',
    ]);
});

test('admin can update role label and description', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
    ]);

    $role = Role::create([
        'name' => 'staf-lapangan',
        'label' => 'Staf Lapangan',
        'description' => 'Deskripsi lama',
        'guard_name' => 'web',
    ]);

    $response = $this->actingAs($admin)->put("/admin/role/{$role->id}", [
        'name' => 'staf-lapangan-utama',
        'label' => 'Staf Lapangan Utama',
        'description' => 'Deskripsi baru yang diperbarui',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $role->refresh();
    expect($role->label)->toBe('Staf Lapangan Utama')
        ->and($role->description)->toBe('Deskripsi baru yang diperbarui');
});

test('system role cannot be deleted', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
    ]);

    $systemRole = Role::firstOrCreate(
        ['name' => 'super-admin'],
        ['label' => 'Super Administrator', 'guard_name' => 'web']
    );

    $response = $this->actingAs($admin)->delete("/admin/role/{$systemRole->id}");

    $response->assertRedirect();
    $response->assertSessionHas('error');
    $this->assertDatabaseHas('roles', ['name' => 'super-admin']);
});

test('role assigned to active users cannot be deleted', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
    ]);

    $role = Role::create([
        'name' => 'koordinator-uji',
        'label' => 'Koordinator Uji',
        'guard_name' => 'web',
    ]);

    User::factory()->create([
        'role' => 'Koordinator Uji',
    ]);

    $response = $this->actingAs($admin)->delete("/admin/role/{$role->id}");

    $response->assertRedirect();
    $response->assertSessionHas('error');
    $this->assertDatabaseHas('roles', ['id' => $role->id]);
});

test('unused custom role can be deleted', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
    ]);

    $role = Role::create([
        'name' => 'role-uji-hapus',
        'label' => 'Role Uji Hapus',
        'guard_name' => 'web',
    ]);

    $response = $this->actingAs($admin)->delete("/admin/role/{$role->id}");

    $response->assertRedirect();
    $response->assertSessionHas('success');
    $this->assertDatabaseMissing('roles', ['id' => $role->id]);
});

test('admin pengguna index excludes users with role peserta', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
    ]);

    $pemateri = User::factory()->create([
        'name' => 'Pemateri Utama',
        'role' => 'Pemateri',
    ]);

    $peserta = User::factory()->create([
        'name' => 'Kenshi Peserta',
        'role' => 'Peserta',
    ]);

    $response = $this->actingAs($admin)->get('/admin/pengguna');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/Users/Index')
        ->has('users.data')
        ->where('users.data', fn ($users) => collect($users)->contains('id', $pemateri->id) &&
            ! collect($users)->contains('id', $peserta->id)
        )
        ->where('roles', fn ($roles) => ! collect($roles)->contains('Peserta')
        )
    );
});

test('event create organizers list includes admin, pemateri, and custom roles but excludes peserta, pelatih, penguji, wasit', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
    ]);

    $penyelenggara = User::factory()->create([
        'name' => 'Penyelenggara Satu',
        'role' => 'Penyelenggara',
    ]);

    $pemateri = User::factory()->create([
        'name' => 'Pemateri Dua',
        'role' => 'Pemateri',
    ]);

    $peserta = User::factory()->create([
        'name' => 'Peserta Kenshi',
        'role' => 'Peserta',
    ]);

    $pelatih = User::factory()->create([
        'name' => 'Pelatih Dojo',
        'role' => 'Pelatih',
    ]);

    $penguji = User::factory()->create([
        'name' => 'Penguji Dan',
        'role' => 'Penguji',
    ]);

    $wasit = User::factory()->create([
        'name' => 'Wasit Tanding',
        'role' => 'Wasit',
    ]);

    $response = $this->actingAs($admin)->get('/admin/event/create');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/Events/Create')
        ->has('organizers')
        ->where('organizers', fn ($organizers) => collect($organizers)->contains('id', $penyelenggara->id) &&
            collect($organizers)->contains('id', $pemateri->id) &&
            collect($organizers)->contains('id', $admin->id) &&
            ! collect($organizers)->contains('id', $peserta->id) &&
            ! collect($organizers)->contains('id', $pelatih->id) &&
            ! collect($organizers)->contains('id', $penguji->id) &&
            ! collect($organizers)->contains('id', $wasit->id)
        )
    );
});
