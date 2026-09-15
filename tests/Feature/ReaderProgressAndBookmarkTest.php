<?php

use App\Models\Bookmark;
use App\Models\Material;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('local');
});

test('authenticated user can save reading progress', function () {
    $user = User::factory()->create(['role' => 'Pelatih']);
    $material = Material::create([
        'title' => 'Buku Uji Progres',
        'slug' => 'buku-uji-progres',
        'status' => 'published',
        'type' => 'module',
    ]);

    $response = $this->actingAs($user)->postJson("/koleksi/{$material->slug}/progres", [
        'page' => 5,
        'total_pages' => 20,
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'progress' => [
                'user_id' => $user->id,
                'material_id' => $material->id,
                'last_page' => 5,
                'total_pages' => 20,
                'percentage' => 25,
            ],
        ]);

    $this->assertDatabaseHas('reading_progress', [
        'user_id' => $user->id,
        'material_id' => $material->id,
        'current_page' => 5,
        'progress_percent' => 25,
    ]);
});

test('authenticated user can create and delete bookmarks', function () {
    $user = User::factory()->create(['role' => 'Pelatih']);
    $material = Material::create([
        'title' => 'Buku Uji Bookmark',
        'slug' => 'buku-uji-bookmark',
        'status' => 'published',
        'type' => 'module',
    ]);

    // Create bookmark
    $createResponse = $this->actingAs($user)->postJson("/koleksi/{$material->slug}/bookmark", [
        'page_number' => 7,
        'title' => 'Teknik Randori Khusus',
        'note' => 'Catatan penting untuk ujian kenaikan tingkat.',
    ]);

    $createResponse->assertOk()
        ->assertJson([
            'success' => true,
            'bookmark' => [
                'page_number' => 7,
                'title' => 'Teknik Randori Khusus',
            ],
        ]);

    $bookmark = Bookmark::where('user_id', $user->id)
        ->where('material_id', $material->id)
        ->where('page_number', 7)
        ->first();

    expect($bookmark)->not->toBeNull();

    // Delete bookmark (soft delete)
    $deleteResponse = $this->actingAs($user)->deleteJson("/koleksi/{$material->slug}/bookmark/{$bookmark->id}");
    $deleteResponse->assertOk()
        ->assertJson(['success' => true]);

    // Soft deleted — row still exists in DB but deleted_at is set
    $this->assertSoftDeleted('bookmarks', ['id' => $bookmark->id]);
});

test('unauthenticated guest cannot save progress or create bookmarks', function () {
    $material = Material::create([
        'title' => 'Buku Tamu',
        'slug' => 'buku-tamu',
        'status' => 'published',
        'type' => 'module',
    ]);

    $this->postJson("/koleksi/{$material->slug}/progres", ['page' => 2])
        ->assertUnauthorized();

    $this->postJson("/koleksi/{$material->slug}/bookmark", ['page_number' => 2])
        ->assertUnauthorized();
});
