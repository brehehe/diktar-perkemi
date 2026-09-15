<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

test('login screen can be rendered', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
    $response->assertSee('Masuk ke Portal');
    $response->assertSee('DIGITAL LEARNING CENTER');
    $response->assertSee('Email atau Nama Pengguna');
    $response->assertSee('Kata Sandi');
    $response->assertSee('Masuk Portal');
});

test('users can authenticate using the login screen', function () {
    $user = User::create([
        'name' => 'Kenshi Pratama',
        'email' => 'kenshi@perkemi.id',
        'role' => 'Pelatih',
        'password' => Hash::make('rahasia123'),
    ]);

    $response = $this->post('/login', [
        'email' => 'kenshi@perkemi.id',
        'password' => 'rahasia123',
    ]);

    $this->assertAuthenticatedAs($user);
    $response->assertRedirect('/');
});

test('users can authenticate via ajax fetch json', function () {
    $user = User::create([
        'name' => 'Admin Test',
        'email' => 'admin@perkemi.id',
        'role' => 'Admin',
        'password' => Hash::make('password'),
    ]);

    $response = $this->postJson('/login', [
        'email' => 'admin@perkemi.id',
        'password' => 'password',
    ]);

    $this->assertAuthenticatedAs($user);
    $response->assertOk()
        ->assertJson([
            'success' => true,
        ]);
});

test('users cannot authenticate with invalid password', function () {
    User::create([
        'name' => 'Kenshi Pratama',
        'email' => 'kenshi@perkemi.id',
        'role' => 'Peserta',
        'password' => Hash::make('rahasia123'),
    ]);

    $response = $this->from('/login')->post('/login', [
        'email' => 'kenshi@perkemi.id',
        'password' => 'passwordsalah',
    ]);

    $this->assertGuest();
    $response->assertRedirect('/login');
    $response->assertSessionHasErrors('email');
});

test('registration screen can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
    $response->assertSee('Daftar Akun');
    $response->assertSee('BUAT AKUN');
    $response->assertSee('Nama Lengkap');
    $response->assertSee('Peran Utama dalam Kegiatan PERKEMI');
    $response->assertSee('Buat Akun');
});

test('new users can register with role and are authenticated', function () {
    $response = $this->post('/register', [
        'name' => 'Dewi Sartika',
        'email' => 'dewi@perkemi.id',
        'role' => 'Penguji',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'terms' => '1',
    ]);

    $this->assertAuthenticated();
    $this->assertDatabaseHas('users', [
        'name' => 'Dewi Sartika',
        'email' => 'dewi@perkemi.id',
        'role' => 'Penguji',
    ]);
    $response->assertRedirect('/');
});

test('registration requires terms acceptance and valid fields', function () {
    $response = $this->from('/register')->post('/register', [
        'name' => '',
        'email' => 'not-an-email',
        'role' => 'PeranPalsu',
        'password' => 'short',
        'password_confirmation' => 'mismatch',
    ]);

    $this->assertGuest();
    $response->assertRedirect('/register');
    $response->assertSessionHasErrors(['name', 'email', 'role', 'password', 'terms']);
});

test('authenticated user can logout', function () {
    $user = User::create([
        'name' => 'Sensei Hartono',
        'email' => 'hartono@perkemi.id',
        'role' => 'Pelatih',
        'password' => Hash::make('password123'),
    ]);

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
    $response->assertRedirect('/');
});
