<?php

use App\Models\Participant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

test('linked participant can authenticate using their NIK', function () {
    $user = User::factory()->create([
        'email' => 'peserta@perkemi.id',
        'role' => 'Peserta',
        'password' => Hash::make('rahasia123'),
    ]);

    Participant::create([
        'user_id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'kenshi_id_number' => 'KNS-2026-001',
    ]);

    $response = $this->post('/login', [
        'email' => 'kns-2026-001',
        'password' => 'rahasia123',
    ]);

    $this->assertAuthenticatedAs($user);
    $response->assertRedirect('/event-saya');
});

test('unlinked participant cannot authenticate using their NIK', function () {
    Participant::create([
        'name' => 'Peserta Belum Terhubung',
        'email' => 'belum-terhubung@perkemi.id',
        'kenshi_id_number' => 'KNS-2026-002',
    ]);

    $response = $this->from('/login')->post('/login', [
        'email' => 'KNS-2026-002',
        'password' => 'rahasia123',
    ]);

    $this->assertGuest();
    $response->assertRedirect('/login');
    $response->assertSessionHasErrors('email');
});

test('participant NIK is normalized and must be unique', function () {
    $admin = User::factory()->create(['role' => 'Admin']);

    Participant::create([
        'name' => 'Peserta Pertama',
        'email' => 'pertama@perkemi.id',
        'kenshi_id_number' => 'KNS-2026-003',
    ]);

    $response = $this->actingAs($admin)->post('/admin/master/peserta', [
        'name' => 'Peserta Kedua',
        'email' => 'kedua@perkemi.id',
        'kenshi_id' => ' kns-2026-003 ',
        'origin' => 'DKI Jakarta',
    ]);

    $response->assertSessionHasErrors('kenshi_id');
    $this->assertDatabaseMissing('participants', ['email' => 'kedua@perkemi.id']);
});
