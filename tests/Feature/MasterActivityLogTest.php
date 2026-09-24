<?php

use App\Models\ActivityLog;
use App\Models\Event;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    Cache::flush();
});

test('user login records auth.login in activity log', function () {
    $user = User::factory()->create([
        'email' => 'kenshi@perkemi.id',
        'password' => bcrypt('Secret123!'),
        'role' => 'Peserta',
    ]);

    $response = $this->post(route('login'), [
        'email' => 'kenshi@perkemi.id',
        'password' => 'Secret123!',
    ]);

    $response->assertRedirect();

    $log = ActivityLog::where('event', 'auth.login')->first();
    expect($log)->not->toBeNull();
    expect($log->actor_id)->toBe($user->id);
    expect($log->properties['email'])->toBe('kenshi@perkemi.id');
    expect($log->properties['role'])->toBe('Peserta');
    expect($log->description)->toContain('berhasil masuk ke portal');
});

test('user logout records auth.logout in activity log', function () {
    $user = User::factory()->create([
        'email' => 'logout.user@perkemi.id',
        'role' => 'Pemateri',
    ]);

    $response = $this->actingAs($user)->post(route('logout'));
    $response->assertRedirect('/');

    $log = ActivityLog::where('event', 'auth.logout')->first();
    expect($log)->not->toBeNull();
    expect($log->actor_id)->toBe($user->id);
    expect($log->properties['role'])->toBe('Pemateri');
    expect($log->description)->toContain('keluar dari portal');
});

test('accessing admin event menu records menu.event_accessed in activity log', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
    ]);

    $response = $this->actingAs($admin)->get(route('admin.event.index'));
    $response->assertOk();

    $log = ActivityLog::where('event', 'menu.event_accessed')->first();
    expect($log)->not->toBeNull();
    expect($log->actor_id)->toBe($admin->id);
    expect($log->properties['menu'])->toBe('Manajemen Event');
});

test('accessing admin event show records event.viewed in activity log', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
    ]);

    $event = Event::create([
        'title' => 'Penataran Tingkat Nasional 2026',
        'slug' => 'penataran-nasional-2026-'.uniqid(),
        'start_date' => '2026-09-24',
        'end_date' => '2026-09-25',
        'location' => 'Pusdiklat Pondok Gede',
        'status' => 'ongoing',
    ]);

    $response = $this->actingAs($admin)->get(route('admin.event.show', $event));
    $response->assertOk();

    $log = ActivityLog::where('event', 'event.viewed')->first();
    expect($log)->not->toBeNull();
    expect($log->actor_id)->toBe($admin->id);
    expect($log->subject_id)->toBe($event->id);
    expect($log->properties['event_title'])->toBe($event->title);
});

test('activity helper function works with spatie syntax', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
    ]);

    $log = activity('custom.action')
        ->causedBy($admin)
        ->withProperties(['key' => 'value123'])
        ->log('Tindakan kustom administrator');

    expect($log)->not->toBeNull();
    expect($log->event)->toBe('custom.action');
    expect($log->actor_id)->toBe($admin->id);
    expect($log->properties['key'])->toBe('value123');
    expect($log->description)->toBe('Tindakan kustom administrator');
});

test('master log page renders activities with filters', function () {
    $admin = User::factory()->create([
        'name' => 'Admin Utama',
        'role' => 'Admin',
    ]);

    $pemateri = User::factory()->create([
        'name' => 'Sensei Hartono',
        'role' => 'Pemateri',
    ]);

    // Create some logs
    ActivityLog::create([
        'actor_id' => $admin->id,
        'event' => 'menu.event_accessed',
        'properties' => ['description' => 'Admin membuka menu event'],
        'created_at' => now()->subDay(),
    ]);

    ActivityLog::create([
        'actor_id' => $pemateri->id,
        'event' => 'auth.login',
        'properties' => ['description' => 'Sensei Hartono login'],
        'created_at' => now(),
    ]);

    // 1. Visit unfiltered
    $response = $this->actingAs($admin)->get(route('admin.activities.index'));
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Activities/Index')
        ->has('activities.data', 2)
        ->has('categories', 5)
        ->has('roles', 5)
    );

    // 2. Filter by category 'auth'
    $responseAuth = $this->actingAs($admin)->get(route('admin.activities.index', ['category' => 'auth']));
    $responseAuth->assertInertia(fn (Assert $page) => $page
        ->has('activities.data', 1)
        ->where('activities.data.0.event', 'auth.login')
    );

    // 3. Filter by role 'Admin'
    $responseRole = $this->actingAs($admin)->get(route('admin.activities.index', ['role' => 'Admin']));
    $responseRole->assertInertia(fn (Assert $page) => $page
        ->has('activities.data', 1)
        ->where('activities.data.0.event', 'menu.event_accessed')
    );

    // 4. Search keyword 'Hartono'
    $responseSearch = $this->actingAs($admin)->get(route('admin.activities.index', ['q' => 'Hartono']));
    $responseSearch->assertInertia(fn (Assert $page) => $page
        ->has('activities.data', 1)
        ->where('activities.data.0.event', 'auth.login')
    );
});
