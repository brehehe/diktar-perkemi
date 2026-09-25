<?php

use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\EventSession;
use App\Models\Participant;
use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\EventManagementSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(EventManagementSeeder::class);
    Carbon::setTestNow('2026-09-25 10:00:00');
});

afterEach(function () {
    Carbon::setTestNow();
});

test('participant can record attendance directly using session_id shortcut without QR token', function () {
    $user = User::factory()->create(['role' => 'Peserta']);
    $participant = Participant::create([
        'user_id' => $user->id,
        'name' => 'Peserta Uji Shortcut',
        'gender' => 'L',
        'dan_rank' => 'II-DAN',
        'origin_province' => 'Jawa Timur',
        'origin_city' => 'Surabaya',
        'origin_dojo' => 'Dojo Pusat',
    ]);

    $event = Event::create([
        'title' => 'Event Uji Shortcut 2026',
        'slug' => 'event-uji-shortcut-2026',
        'start_date' => '2026-09-24',
        'end_date' => '2026-09-27',
        'location' => 'Surabaya',
        'status' => 'ongoing',
    ]);

    $enrollment = EventParticipant::create([
        'event_id' => $event->id,
        'participant_id' => $participant->id,
        'track_code' => 'ALL',
        'admin_status' => 'verified',
    ]);

    $session = EventSession::create([
        'event_id' => $event->id,
        'day_number' => 2,
        'date' => '2026-09-25',
        'start_time' => '10:00:00',
        'end_time' => '11:30:00',
        'session_number' => 'SESI-02-01',
        'duration_jp' => 2,
        'session_type_code' => 'MATERI',
        'topic' => 'Sesi Uji Absensi Langsung',
        'attendance_setting' => 'check_in',
        'is_attendance_open' => true,
    ]);

    $response = $this->actingAs($user)->post("/event/{$event->slug}/absensi/catat", [
        'session_id' => $session->id,
        'attendance_type' => 'check_in',
    ]);

    $response->assertRedirect("/event/{$event->slug}/ruang-belajar");
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('event_attendances', [
        'event_id' => $event->id,
        'event_session_id' => $session->id,
        'participant_id' => $participant->id,
        'attendance_type' => 'check_in',
        'method' => 'portal_direct',
        'status' => 'present',
    ]);

    $enrollment->refresh();
    expect($enrollment->checked_in_at)->not->toBeNull()
        ->and($enrollment->attendance_status)->toBe('present')
        ->and($enrollment->attendance_records["session_{$session->id}"]['method'])->toBe('portal_direct');
});

test('participant can record check_out directly for check_in_out session after check_in', function () {
    $user = User::factory()->create(['role' => 'Peserta']);
    $participant = Participant::create([
        'user_id' => $user->id,
        'name' => 'Peserta Uji Check Out',
        'gender' => 'L',
        'dan_rank' => 'II-DAN',
        'origin_province' => 'Jawa Timur',
        'origin_city' => 'Surabaya',
        'origin_dojo' => 'Dojo Pusat',
    ]);

    $event = Event::create([
        'title' => 'Event Uji Check Out 2026',
        'slug' => 'event-uji-checkout-2026',
        'start_date' => '2026-09-24',
        'end_date' => '2026-09-27',
        'location' => 'Surabaya',
        'status' => 'ongoing',
    ]);

    EventParticipant::create([
        'event_id' => $event->id,
        'participant_id' => $participant->id,
        'track_code' => 'ALL',
        'admin_status' => 'verified',
    ]);

    $session = EventSession::create([
        'event_id' => $event->id,
        'day_number' => 2,
        'date' => '2026-09-25',
        'start_time' => '10:00:00',
        'end_time' => '11:30:00',
        'session_number' => 'SESI-02-02',
        'duration_jp' => 2,
        'session_type_code' => 'MATERI',
        'topic' => 'Sesi Uji Absensi Masuk Keluar',
        'attendance_setting' => 'check_in_out',
        'is_attendance_open' => true,
    ]);

    // 1. Try checkout before checkin -> should fail
    $this->actingAs($user)->post("/event/{$event->slug}/absensi/catat", [
        'session_id' => $session->id,
        'attendance_type' => 'check_out',
    ])->assertSessionHas('error', 'Absensi masuk sesi harus tercatat sebelum absensi keluar.');

    // 2. Perform check_in
    $this->actingAs($user)->post("/event/{$event->slug}/absensi/catat", [
        'session_id' => $session->id,
        'attendance_type' => 'check_in',
    ])->assertRedirect("/event/{$event->slug}/ruang-belajar");

    // 3. Perform check_out
    $this->actingAs($user)->post("/event/{$event->slug}/absensi/catat", [
        'session_id' => $session->id,
        'attendance_type' => 'check_out',
    ])->assertRedirect("/event/{$event->slug}/ruang-belajar");

    $this->assertDatabaseHas('event_attendances', [
        'event_id' => $event->id,
        'event_session_id' => $session->id,
        'participant_id' => $participant->id,
        'attendance_type' => 'check_out',
        'method' => 'portal_direct',
    ]);
});

test('participant cannot record attendance for disabled or none sessions', function () {
    $user = User::factory()->create(['role' => 'Peserta']);
    $participant = Participant::create([
        'user_id' => $user->id,
        'name' => 'Peserta Uji Disabled',
        'gender' => 'L',
        'dan_rank' => 'I-DAN',
        'origin_province' => 'Jawa Timur',
        'origin_city' => 'Surabaya',
        'origin_dojo' => 'Dojo Pusat',
    ]);

    $event = Event::create([
        'title' => 'Event Uji Disabled',
        'slug' => 'event-uji-disabled',
        'start_date' => '2026-09-24',
        'end_date' => '2026-09-27',
        'location' => 'Surabaya',
        'status' => 'ongoing',
    ]);

    EventParticipant::create([
        'event_id' => $event->id,
        'participant_id' => $participant->id,
        'track_code' => 'ALL',
        'admin_status' => 'verified',
    ]);

    $session = EventSession::create([
        'event_id' => $event->id,
        'day_number' => 2,
        'date' => '2026-09-25',
        'start_time' => '12:00:00',
        'end_time' => '13:00:00',
        'session_number' => 'SESI-BREAK',
        'duration_jp' => 0,
        'session_type_code' => 'ISHOMA',
        'topic' => 'Coffee Break',
        'attendance_setting' => 'disabled',
        'is_attendance_open' => false,
    ]);

    $this->actingAs($user)->post("/event/{$event->slug}/absensi/catat", [
        'session_id' => $session->id,
        'attendance_type' => 'check_in',
    ])->assertSessionHas('error');
});

test('participant cannot attend sessions on future days prematurely', function () {
    $user = User::factory()->create(['role' => 'Peserta']);
    $participant = Participant::create([
        'user_id' => $user->id,
        'name' => 'Peserta Uji Future Day',
        'gender' => 'L',
        'dan_rank' => 'I-DAN',
        'origin_province' => 'Jawa Timur',
        'origin_city' => 'Surabaya',
        'origin_dojo' => 'Dojo Pusat',
    ]);

    $event = Event::create([
        'title' => 'Event Uji Future',
        'slug' => 'event-uji-future',
        'start_date' => '2026-09-24',
        'end_date' => '2026-09-27',
        'location' => 'Surabaya',
        'status' => 'ongoing',
    ]);

    EventParticipant::create([
        'event_id' => $event->id,
        'participant_id' => $participant->id,
        'track_code' => 'ALL',
        'admin_status' => 'verified',
    ]);

    $futureSession = EventSession::create([
        'event_id' => $event->id,
        'day_number' => 3,
        'date' => '2026-09-26', // Tomorrow
        'start_time' => '09:00:00',
        'end_time' => '10:30:00',
        'session_number' => 'SESI-D03-01',
        'duration_jp' => 2,
        'session_type_code' => 'MATERI',
        'topic' => 'Sesi Hari Esok',
        'attendance_setting' => 'check_in',
        'is_attendance_open' => true,
    ]);

    $this->actingAs($user)->post("/event/{$event->slug}/absensi/catat", [
        'session_id' => $futureSession->id,
        'attendance_type' => 'check_in',
    ])->assertSessionHas('error', "Absensi untuk sesi \"{$futureSession->topic}\" baru dapat diakses pada hari pelaksanaannya.");
});

test('ruang-belajar returns shortcut attendance props for today sessions', function () {
    $user = User::factory()->create(['role' => 'Peserta']);
    $participant = Participant::create([
        'user_id' => $user->id,
        'name' => 'Peserta Uji Props',
        'gender' => 'L',
        'dan_rank' => 'I-DAN',
        'origin_province' => 'Jawa Timur',
        'origin_city' => 'Surabaya',
        'origin_dojo' => 'Dojo Pusat',
    ]);

    $event = Event::create([
        'title' => 'Event Uji Props',
        'slug' => 'event-uji-props',
        'start_date' => '2026-09-24',
        'end_date' => '2026-09-27',
        'location' => 'Surabaya',
        'status' => 'ongoing',
    ]);

    EventParticipant::create([
        'event_id' => $event->id,
        'participant_id' => $participant->id,
        'track_code' => 'ALL',
        'admin_status' => 'verified',
    ]);

    $todaySession = EventSession::create([
        'event_id' => $event->id,
        'day_number' => 2,
        'date' => '2026-09-25',
        'start_time' => '10:00:00',
        'end_time' => '11:30:00',
        'session_number' => 'SESI-D02-PROPS',
        'duration_jp' => 2,
        'session_type_code' => 'MATERI',
        'topic' => 'Sesi Hari Ini Props',
        'attendance_setting' => 'check_in',
        'is_attendance_open' => true,
    ]);

    $futureSession = EventSession::create([
        'event_id' => $event->id,
        'day_number' => 3,
        'date' => '2026-09-26',
        'start_time' => '10:00:00',
        'end_time' => '11:30:00',
        'session_number' => 'SESI-D03-PROPS',
        'duration_jp' => 2,
        'session_type_code' => 'MATERI',
        'topic' => 'Sesi Besok Props',
        'attendance_setting' => 'check_in',
        'is_attendance_open' => true,
    ]);

    $response = $this->actingAs($user)->get("/event/{$event->slug}/ruang-belajar");

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Event/LearningRoom')
        ->where('sessions', function ($sessions) use ($todaySession, $futureSession) {
            $today = collect($sessions)->firstWhere('id', $todaySession->id);
            $future = collect($sessions)->firstWhere('id', $futureSession->id);

            return $today['can_shortcut_attend'] === true
                && $today['attendance_button_label'] === 'Absen Sekarang'
                && $today['next_attendance_type'] === 'check_in'
                && $future['can_shortcut_attend'] === false
                && $future['is_future'] === true;
        })
    );
});

test('admin in preview mode can click shortcut button without database constraint error', function () {
    $admin = User::factory()->create(['role' => 'Admin']);

    $event = Event::create([
        'title' => 'Event Preview Admin',
        'slug' => 'event-preview-admin',
        'start_date' => '2026-09-24',
        'end_date' => '2026-09-27',
        'location' => 'Surabaya',
        'status' => 'ongoing',
    ]);

    $session = EventSession::create([
        'event_id' => $event->id,
        'day_number' => 2,
        'date' => '2026-09-25',
        'start_time' => '10:00:00',
        'end_time' => '11:30:00',
        'session_number' => 'SESI-ADMIN-PREVIEW',
        'duration_jp' => 2,
        'session_type_code' => 'MATERI',
        'topic' => 'Sesi Preview Admin',
        'attendance_setting' => 'check_in',
        'is_attendance_open' => true,
    ]);

    $response = $this->actingAs($admin)->post("/event/{$event->slug}/absensi/catat", [
        'session_id' => $session->id,
        'attendance_type' => 'check_in',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('info');
});
