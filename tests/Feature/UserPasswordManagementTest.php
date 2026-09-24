<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

test('admin can update user password successfully', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
    ]);

    $targetUser = User::factory()->create([
        'role' => 'Pemateri',
        'password' => Hash::make('OldPassword123!'),
    ]);

    $response = $this->actingAs($admin)
        ->patch(route('admin.users.password', $targetUser), [
            'password' => 'NewSecretPassword123!',
            'password_confirmation' => 'NewSecretPassword123!',
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $targetUser->refresh();
    expect(Hash::check('NewSecretPassword123!', $targetUser->password))->toBeTrue();
});

test('non-admin cannot update user password', function () {
    $peserta = User::factory()->create([
        'role' => 'Peserta',
    ]);

    $targetUser = User::factory()->create([
        'role' => 'Pemateri',
    ]);

    $response = $this->actingAs($peserta)
        ->patch(route('admin.users.password', $targetUser), [
            'password' => 'NewSecretPassword123!',
            'password_confirmation' => 'NewSecretPassword123!',
        ]);

    $response->assertForbidden();
});

test('password update requires minimum 8 characters and confirmation', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
    ]);

    $targetUser = User::factory()->create([
        'role' => 'Peserta',
    ]);

    $response = $this->actingAs($admin)
        ->patch(route('admin.users.password', $targetUser), [
            'password' => 'short',
            'password_confirmation' => 'mismatch',
        ]);

    $response->assertSessionHasErrors(['password']);
});

test('admin can update user role to pemateri with supervisor status', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $user = User::factory()->create(['role' => 'Peserta']);

    $response = $this->actingAs($admin)->patch(route('admin.users.role', $user), [
        'role' => 'Pemateri',
        'is_supervisor' => true,
    ]);

    $response->assertRedirect();
    $user->refresh();
    expect($user->role)->toBe('Pemateri');
    expect($user->speaker)->not->toBeNull();
    expect($user->speaker->is_supervisor)->toBeTrue();

    // Toggle supervisor to false
    $response2 = $this->actingAs($admin)->patch(route('admin.users.role', $user), [
        'role' => 'Pemateri',
        'is_supervisor' => false,
    ]);

    $response2->assertRedirect();
    $user->refresh();
    expect($user->speaker->is_supervisor)->toBeFalse();
});
