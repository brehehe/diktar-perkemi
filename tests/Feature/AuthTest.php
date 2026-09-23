<?php

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('login screen can be rendered', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page->component('Auth/Login'));
});

test('guests can view the portal home page without redirect to login', function () {
    $response = $this->get('/');

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page->component('Portal/Home'));
    $this->assertGuest();
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
    $response->assertInertia(fn (Assert $page) => $page->component('Auth/Register'));
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

test('registration is disabled when is_register_off config is true', function () {
    config(['auth.is_register_off' => true]);

    // GET /register should redirect to /login with info message
    $response = $this->get('/register');
    $response->assertRedirect('/login');
    $response->assertSessionHas('info');

    // POST /register should be blocked and not create user
    $postResponse = $this->post('/register', [
        'name' => 'Budi Santoso',
        'email' => 'budi@perkemi.id',
        'role' => 'Peserta',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'terms' => '1',
    ]);
    $postResponse->assertRedirect('/login');
    $postResponse->assertSessionHas('error');
    $this->assertGuest();
    $this->assertDatabaseMissing('users', ['email' => 'budi@perkemi.id']);

    // Inertia shared props should expose can_register = false and is_register_off = true
    $homeResponse = $this->get('/');
    $homeResponse->assertInertia(fn (Assert $page) => $page
        ->where('portal.is_register_off', true)
        ->where('portal.can_register', false)
    );
});

test('registration is disabled when database allow_registration setting is 0', function () {
    config(['auth.is_register_off' => false]);
    Setting::set('allow_registration', '0', 'access');

    $response = $this->get('/register');
    $response->assertRedirect('/login');
    $response->assertSessionHas('info');

    $homeResponse = $this->get('/');
    $homeResponse->assertInertia(fn (Assert $page) => $page
        ->where('portal.is_register_off', true)
        ->where('portal.can_register', false)
    );
});
