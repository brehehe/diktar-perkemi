<?php

use App\Models\Event;
use App\Models\EventSession;
use App\Models\User;
use Database\Seeders\TonightEventSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('TonightEventSeeder seeds tonight event with active sessions, materials, and participants', function () {
    $this->seed(TonightEventSeeder::class);

    $event = Event::where('slug', TonightEventSeeder::EVENT_SLUG)->first();
    expect($event)->not->toBeNull()
        ->and($event->status)->toBe('published')
        ->and($event->start_date->toDateString())->toBe(now()->toDateString());

    // 3 active sessions with short codes
    $sessions = EventSession::where('event_id', $event->id)->orderBy('session_number')->get();
    expect($sessions)->toHaveCount(3);

    $s1 = $sessions->firstWhere('session_number', 1);
    expect($s1->session_type_code)->toBe('KEHADIRAN_AWAL')
        ->and($s1->qr_short_code)->toBe('MALAM01')
        ->and($s1->is_attendance_open)->toBeTrue();

    $s2 = $sessions->firstWhere('session_number', 2);
    expect($s2->qr_short_code)->toBe('MALAM02')
        ->and($s2->is_attendance_open)->toBeTrue()
        ->and($s2->event_module_id)->not->toBeNull();

    $s3 = $sessions->firstWhere('session_number', 3);
    expect($s3->qr_short_code)->toBe('MALAM03')
        ->and($s3->is_attendance_open)->toBeTrue();

    // Check modules
    expect($event->modules()->count())->toBeGreaterThanOrEqual(1);

    // Test Peserta 1 (Belum Absen) can login with NIK and record arrival attendance
    $tester1 = User::where('email', 'tester.malam@perkemi.id')->first();
    expect($tester1)->not->toBeNull();

    $loginResponse = $this->post('/login', [
        'email' => 'TEST-MALAM-01', // login via NIK
        'password' => 'password',
    ]);
    $this->assertAuthenticatedAs($tester1);

    // Record attendance for session 1 using short code MALAM01
    $attendanceResponse = $this->actingAs($tester1)->post("/event/{$event->slug}/absensi/catat", [
        'short_code' => 'MALAM01',
        'attendance_type' => 'check_in',
    ]);
    $attendanceResponse->assertSessionHas('success');

    // Test Peserta 2 (Sudah Hadir) can access learning room immediately
    $tester2 = User::where('email', 'hadir.malam@perkemi.id')->first();
    expect($tester2)->not->toBeNull();

    $roomResponse = $this->actingAs($tester2)->get("/event/{$event->slug}/ruang-belajar");
    $roomResponse->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Event/LearningRoom')
            ->where('event.slug', $event->slug)
            ->has('sessions')
        );
});
