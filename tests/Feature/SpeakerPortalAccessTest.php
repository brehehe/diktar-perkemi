<?php

use App\Models\Event;
use App\Models\EventSession;
use App\Models\LearningModule;
use App\Models\Material;
use App\Models\Speaker;
use App\Models\User;
use Database\Seeders\EventManagementSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(EventManagementSeeder::class);
    $this->event = Event::firstOrFail();
});

test('pemateri user is redirected to schedule on login', function () {
    $user = User::factory()->create([
        'role' => 'Pemateri',
        'password' => bcrypt('password'),
    ]);

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertRedirect(route('speaker.schedule'));
});

test('pemateri can access their schedule and view assigned sessions and materials', function () {
    $pemateriUser = User::factory()->create(['role' => 'Pemateri']);

    $speaker = Speaker::create([
        'user_id' => $pemateriUser->id,
        'event_id' => $this->event->id,
        'name' => 'Sensei Guru',
        'title_degree' => 'VII-DAN',
        'contact_email' => $pemateriUser->email,
        'is_active' => true,
    ]);

    $material = Material::first() ?? Material::create([
        'title' => 'Materi Filosofi Kempo',
        'slug' => 'materi-filosofi-kempo',
        'code' => 'MAT-TEST-01',
        'author' => 'PERKEMI',
        'type' => 'document',
        'status' => 'published',
        'publication_year' => 2026,
    ]);

    $learningModule = LearningModule::first() ?? LearningModule::create([
        'code' => 'MOD-TEST-01',
        'title' => 'Modul Penataran Dasar',
        'slug' => 'modul-penataran-dasar',
        'category' => 'Teknik Dasar',
        'level' => 'Dasar',
        'total_jp' => 2,
        'status' => 'active',
    ]);

    $learningModule->materials()->syncWithoutDetaching([$material->id => ['sort_order' => 1]]);

    $session = EventSession::create([
        'event_id' => $this->event->id,
        'day_number' => 1,
        'session_number' => 'S-99',
        'date' => '2026-09-20',
        'start_time' => '08:00',
        'end_time' => '10:00',
        'duration_jp' => 2,
        'session_type_code' => 'PLENO',
        'topic' => 'Standarisasi Teknik Shorinji Kempo',
        'subtopic' => 'Pengenalan filosofi dasar',
        'speaker_id' => $speaker->id,
        'learning_module_id' => $learningModule->id,
        'status' => 'scheduled',
    ]);

    $this->actingAs($pemateriUser)
        ->get('/pemateri/jadwal')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Speaker/Schedule')
            ->has('speaker')
            ->where('speaker.name', 'Sensei Guru')
            ->has('sessions', 1)
            ->where('sessions.0.topic', 'Standarisasi Teknik Shorinji Kempo')
            ->where('sessions.0.materials.0.title', $material->title)
            ->where('stats.total_sessions', 1)
        );
});

test('unauthorized users cannot access speaker schedule or materials', function () {
    $participant = User::factory()->create(['role' => 'Peserta']);

    $this->actingAs($participant)
        ->get('/pemateri/jadwal')
        ->assertRedirect(route('home'));
});

test('pemateri can filter schedule by day and search query', function () {
    $pemateriUser = User::factory()->create(['role' => 'Pemateri']);

    $speaker = Speaker::create([
        'user_id' => $pemateriUser->id,
        'event_id' => $this->event->id,
        'name' => 'Sensei Guru 2',
        'title_degree' => 'VI-DAN',
        'contact_email' => $pemateriUser->email,
        'is_active' => true,
    ]);

    EventSession::create([
        'event_id' => $this->event->id,
        'day_number' => 1,
        'session_number' => 'S-01',
        'date' => '2026-09-20',
        'start_time' => '08:00',
        'end_time' => '10:00',
        'duration_jp' => 2,
        'session_type_code' => 'PLENO',
        'topic' => 'Kempo Filosofi Kongo Zen',
        'subtopic' => 'Karakteristik Kempo',
        'speaker_id' => $speaker->id,
        'status' => 'scheduled',
    ]);

    EventSession::create([
        'event_id' => $this->event->id,
        'day_number' => 2,
        'session_number' => 'S-02',
        'date' => '2026-09-21',
        'start_time' => '10:00',
        'end_time' => '12:00',
        'duration_jp' => 2,
        'session_type_code' => 'PRAKTIK',
        'topic' => 'Teknik Goho Dasar',
        'subtopic' => 'Tsuki dan Keri',
        'speaker_id' => $speaker->id,
        'status' => 'scheduled',
    ]);

    // Test filter day 1
    $this->actingAs($pemateriUser)
        ->get('/pemateri/jadwal?day=1')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('sessions', 1)
            ->where('sessions.0.day_number', 1)
            ->where('sessions.0.topic', 'Kempo Filosofi Kongo Zen')
        );

    // Test filter search 'Goho'
    $this->actingAs($pemateriUser)
        ->get('/pemateri/jadwal?q=Goho')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('sessions', 1)
            ->where('sessions.0.topic', 'Teknik Goho Dasar')
        );
});
