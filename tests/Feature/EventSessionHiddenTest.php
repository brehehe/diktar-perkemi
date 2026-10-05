<?php

use App\Models\Event;
use App\Models\EventSession;
use App\Models\Participant;
use App\Models\User;
use Database\Seeders\EventManagementSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(EventManagementSeeder::class);
    $this->event = Event::firstOrFail();
    $this->admin = User::factory()->create(['role' => 'Admin']);
    $this->participantUser = User::factory()->create(['role' => 'Peserta']);
    $this->participant = Participant::firstOrFail();
    $this->participant->update(['user_id' => $this->participantUser->id]);
});

test('admin can store a session with is_hidden flag', function () {
    $sessionData = [
        'day_number' => 1,
        'session_number' => 'Sesi Rahasia',
        'start_time' => '13:00',
        'end_time' => '15:00',
        'duration_jp' => 2,
        'topic' => 'Sesi Khusus Panitia',
        'status' => 'scheduled',
        'attendance_setting' => 'none',
        'is_hidden' => true,
    ];

    $response = $this->actingAs($this->admin)
        ->post("/admin/event/{$this->event->id}/sesi", $sessionData);

    $response->assertRedirect();

    $this->assertDatabaseHas('event_sessions', [
        'event_id' => $this->event->id,
        'topic' => 'Sesi Khusus Panitia',
        'is_hidden' => 1,
    ]);
});

test('admin can update a session to toggle is_hidden', function () {
    $session = EventSession::create([
        'event_id' => $this->event->id,
        'day_number' => 1,
        'session_number' => 'Sesi Update Test',
        'start_time' => '10:00',
        'end_time' => '11:00',
        'duration_jp' => 1,
        'session_type_code' => 'PLENO',
        'topic' => 'Sesi Sebelum Hidden',
        'status' => 'scheduled',
        'attendance_setting' => 'none',
        'is_hidden' => false,
    ]);

    $updateData = [
        'day_number' => 1,
        'session_number' => 'Sesi Update Test',
        'start_time' => '10:00',
        'end_time' => '11:00',
        'duration_jp' => 1,
        'session_type_code' => 'PLENO',
        'topic' => 'Sesi Sebelum Hidden',
        'status' => 'scheduled',
        'attendance_setting' => 'none',
        'is_hidden' => true,
    ];

    $this->actingAs($this->admin)
        ->put("/admin/event/{$this->event->id}/sesi/{$session->id}", $updateData)
        ->assertRedirect();

    $this->assertTrue((bool) $session->fresh()->is_hidden);
});

test('admin can toggle session hidden status via patch route', function () {
    $session = EventSession::create([
        'event_id' => $this->event->id,
        'day_number' => 1,
        'session_number' => 'Sesi Test',
        'start_time' => '08:00',
        'end_time' => '10:00',
        'duration_jp' => 2,
        'session_type_code' => 'PLENO',
        'topic' => 'Topik Uji Hidden',
        'status' => 'scheduled',
        'attendance_setting' => 'none',
        'is_hidden' => false,
    ]);

    $this->assertFalse((bool) $session->fresh()->is_hidden);

    // Toggle to hidden
    $this->actingAs($this->admin)
        ->patch("/admin/event/{$this->event->id}/sesi/{$session->id}/toggle-hidden")
        ->assertRedirect();

    $this->assertTrue((bool) $session->fresh()->is_hidden);

    // Toggle back to visible
    $this->actingAs($this->admin)
        ->patch("/admin/event/{$this->event->id}/sesi/{$session->id}/toggle-hidden")
        ->assertRedirect();

    $this->assertFalse((bool) $session->fresh()->is_hidden);
});

test('hidden session does not appear in ruang-belajar', function () {
    $visibleSession = EventSession::create([
        'event_id' => $this->event->id,
        'day_number' => 1,
        'session_number' => 'Sesi Tampil',
        'start_time' => '08:00',
        'end_time' => '09:00',
        'duration_jp' => 1,
        'session_type_code' => 'PLENO',
        'topic' => 'Sesi Publik Yang Muncul',
        'status' => 'scheduled',
        'attendance_setting' => 'none',
        'is_hidden' => false,
    ]);

    $hiddenSession = EventSession::create([
        'event_id' => $this->event->id,
        'day_number' => 1,
        'session_number' => 'Sesi Sembunyi',
        'start_time' => '09:00',
        'end_time' => '10:00',
        'duration_jp' => 1,
        'session_type_code' => 'PLENO',
        'topic' => 'Sesi Rahasia Tidak Boleh Muncul',
        'status' => 'scheduled',
        'attendance_setting' => 'none',
        'is_hidden' => true,
    ]);

    $response = $this->actingAs($this->participantUser)
        ->get("/event/{$this->event->slug}/ruang-belajar");

    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('Event/LearningRoom')
        ->has('sessions')
        ->where('sessions', fn ($sessions) => collect($sessions)->contains('id', $visibleSession->id)
            && ! collect($sessions)->contains('id', $hiddenSession->id)
            && ! collect($sessions)->contains('topic', 'Sesi Rahasia Tidak Boleh Muncul')
        )
    );
});
