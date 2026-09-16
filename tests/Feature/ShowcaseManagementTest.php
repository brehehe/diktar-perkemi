<?php

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('guest cannot access showcase management and is redirected to login', function () {
    $response = $this->get('/admin/showcase');

    $response->assertRedirect('/login');
});

test('non-admin user cannot access showcase management', function () {
    $user = User::factory()->create([
        'role' => 'Peserta',
    ]);

    $response = $this->actingAs($user)->get('/admin/showcase');

    $response->assertStatus(403);
});

test('admin can view showcase management page via inertia', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
    ]);

    $response = $this->actingAs($admin)->get('/admin/showcase');

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Showcase/Index')
        ->has('hero_books')
        ->has('available_materials')
    );
});

test('admin can update showcase books with uploaded image files', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
    ]);

    $fakeImage1 = UploadedFile::fake()->image('custom_book_1.jpg', 600, 800);
    $fakeImage2 = UploadedFile::fake()->image('custom_book_2.png', 600, 800);
    $fakeImage3 = UploadedFile::fake()->image('custom_book_3.webp', 600, 800);

    $response = $this->actingAs($admin)->post('/admin/showcase', [
        'book_1_image_file' => $fakeImage1,
        'book_1_title' => 'Panduan Wasit Baru',
        'book_1_link' => '/koleksi/panduan-wasit',

        'book_2_image_file' => $fakeImage2,
        'book_2_title' => 'Teknik Dasar Kempo',
        'book_2_link' => '/koleksi/teknik-dasar',

        'book_3_image_file' => $fakeImage3,
        'book_3_title' => 'Kurikulum Master 2026',
        'book_3_link' => '/koleksi/kurikulum-master',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    // Verify settings updated in database
    expect(Setting::get('hero_book_1_title'))->toBe('Panduan Wasit Baru');
    expect(Setting::get('hero_book_1_link'))->toBe('/koleksi/panduan-wasit');
    expect(Setting::get('hero_book_1_image'))->toContain('/images/hero/');

    expect(Setting::get('hero_book_2_title'))->toBe('Teknik Dasar Kempo');
    expect(Setting::get('hero_book_2_image'))->toContain('/images/hero/');

    expect(Setting::get('hero_book_3_title'))->toBe('Kurikulum Master 2026');
    expect(Setting::get('hero_book_3_image'))->toContain('/images/hero/');
});

test('admin can update showcase books using existing cover paths', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
    ]);

    $response = $this->actingAs($admin)->post('/admin/showcase', [
        'book_1_existing_image' => '/storage/covers/sample-1.jpg',
        'book_1_title' => 'Buku Koleksi Satu',
        'book_1_link' => '/koleksi/buku-satu',

        'book_2_existing_image' => '/storage/covers/sample-2.jpg',
        'book_2_title' => 'Buku Koleksi Dua',
        'book_2_link' => '/koleksi/buku-dua',

        'book_3_existing_image' => '/storage/covers/sample-3.jpg',
        'book_3_title' => 'Buku Koleksi Tiga',
        'book_3_link' => '/koleksi/buku-tiga',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    expect(Setting::get('hero_book_1_image'))->toBe('/storage/covers/sample-1.jpg');
    expect(Setting::get('hero_book_1_title'))->toBe('Buku Koleksi Satu');
    expect(Setting::get('hero_book_2_image'))->toBe('/storage/covers/sample-2.jpg');
    expect(Setting::get('hero_book_3_image'))->toBe('/storage/covers/sample-3.jpg');
});

test('admin can reset showcase books to factory default covers', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
    ]);

    // Set custom first
    Setting::set('hero_book_1_image', '/images/custom-1.jpg', 'appearance');
    Setting::set('hero_book_2_image', '/images/custom-2.jpg', 'appearance');
    Setting::set('hero_book_3_image', '/images/custom-3.jpg', 'appearance');

    $response = $this->actingAs($admin)->post('/admin/showcase/reset');

    $response->assertRedirect();
    $response->assertSessionHas('success');

    expect(Setting::get('hero_book_1_image'))->toBe('/images/cover-1.jpg');
    expect(Setting::get('hero_book_2_image'))->toBe('/images/cover-2.jpg');
    expect(Setting::get('hero_book_3_image'))->toBe('/images/cover-3.jpg');
});

test('public home page includes configured hero books data', function () {
    Setting::set('hero_book_1_title', 'Buku Spesial Uji', 'appearance');

    $response = $this->get('/');

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Portal/Home')
        ->has('hero_books')
        ->where('hero_books.book_1.title', 'Buku Spesial Uji')
    );
});
