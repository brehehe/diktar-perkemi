<?php

use App\Models\CbtExamAttempt;
use App\Models\CbtExamPackage;
use App\Models\CbtProctoringEvent;
use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\EventParticipant;
use App\Models\EventSession;
use App\Models\LearningModule;
use App\Models\Material;
use App\Models\Participant;
use App\Models\QuestionBank;
use App\Models\User;
use App\Services\EventAttendanceScheduleService;
use App\Services\EventLearningRoomService;
use App\Services\QrCodeService;
use Database\Seeders\EventManagementSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(EventManagementSeeder::class);
    $this->admin = User::factory()->create([
        'role' => 'Admin',
    ]);
    $this->participantUser = User::factory()->create(['role' => 'Peserta']);
    Participant::first()->update(['user_id' => $this->participantUser->id]);
});

test('admin can open and close attendance for an event session', function () {
    $event = Event::first();
    $session = $event->sessions()->first();

    // 1. Open attendance
    $openResponse = $this->actingAs($this->admin)
        ->post("/admin/event/{$event->id}/sesi/{$session->id}/absensi/buka", [
            'attendance_setting' => 'check_in',
        ]);

    $openResponse->assertSessionHasNoErrors();
    $session->refresh();

    expect($session->is_attendance_open)->toBeTrue()
        ->and($session->qr_token)->not->toBeEmpty()
        ->and($session->qr_short_code)->not->toBeEmpty();

    // 2. Close attendance
    $closeResponse = $this->actingAs($this->admin)
        ->post("/admin/event/{$event->id}/sesi/{$session->id}/absensi/tutup");

    $closeResponse->assertSessionHasNoErrors();
    $session->refresh();

    expect($session->is_attendance_open)->toBeFalse();
});

test('admin can view printable QR code page for an event session', function () {
    $event = Event::first();
    $event->update([
        'slug' => str_repeat('workshop-kualifikasi-', 8).'2026',
    ]);
    $session = $event->sessions()->first();
    $session->update(['is_attendance_open' => false, 'qr_token' => null, 'attendance_close_at' => null]);

    expect(strlen(route('event.scan', [
        'slug' => $event->slug,
        'code' => 'ABC123',
    ])))->toBeGreaterThan(134);

    $this->actingAs($this->admin)
        ->get("/admin/event/{$event->id}/sesi/{$session->id}/cetak-qr")
        ->assertForbidden();

    $this->actingAs($this->admin)
        ->post("/admin/event/{$event->id}/sesi/{$session->id}/absensi/buka")
        ->assertSessionHasNoErrors();

    $response = $this->actingAs($this->admin)
        ->get("/admin/event/{$event->id}/sesi/{$session->id}/cetak-qr");

    $session->refresh();
    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Events/PrintQr')
        ->has('event')
        ->has('session')
        ->where('scanUrl', route('event.scan', [
            'slug' => $event->slug,
            'code' => $session->qr_short_code,
        ]))
        ->where('qrSvg', QrCodeService::svg($session->qr_short_code, 320, '#0E2747', '#FFFFFF'))
    );

    $session->update(['attendance_close_at' => now()->subMinute()]);
    $this->actingAs($this->admin)
        ->get("/admin/event/{$event->id}/sesi/{$session->id}/cetak-qr")
        ->assertForbidden()
        ->assertSee('Waktu absensi telah berakhir');

    $this->actingAs($this->admin)
        ->post("/admin/event/{$event->id}/sesi/{$session->id}/absensi/buka")
        ->assertSessionHasNoErrors();
    $this->get("/admin/event/{$event->id}/sesi/{$session->id}/cetak-qr")->assertOk();

    $this->actingAs($this->admin)
        ->post("/admin/event/{$event->id}/sesi/{$session->id}/absensi/tutup")
        ->assertSessionHasNoErrors();
    $this->get("/admin/event/{$event->id}/sesi/{$session->id}/cetak-qr")->assertForbidden();
});

test('arrival daily and room attendance use separate QR records in order', function () {
    $event = Event::first();
    $session = $event->sessions()->where('session_type_code', '!=', 'KEHADIRAN_HARIAN')->firstOrFail();
    $participant = Participant::firstOrFail();
    EventAttendance::where('event_session_id', $session->id)->where('participant_id', $participant->id)->delete();

    $this->actingAs($this->admin)->post("/admin/event/{$event->id}/kehadiran-awal")->assertSessionHasNoErrors();
    $arrival = $event->sessions()->where('session_type_code', 'KEHADIRAN_AWAL')->firstOrFail();
    $daily = $event->sessions()->where('session_type_code', 'KEHADIRAN_HARIAN')
        ->where('day_number', $session->day_number)->firstOrFail();
    $this->travelTo($daily->date->copy()->setTime(9, 0));

    foreach ([$arrival, $daily, $session] as $attendanceSession) {
        $this->post("/admin/event/{$event->id}/sesi/{$attendanceSession->id}/absensi/buka")
            ->assertSessionHasNoErrors();
    }

    $scan = fn (EventSession $attendanceSession) => $this->actingAs($this->participantUser)
        ->post("/event/{$event->slug}/absensi/catat", [
            'short_code' => $attendanceSession->fresh()->qr_short_code,
            'attendance_type' => 'check_in',
        ]);

    $scan($daily)
        ->assertRedirect()
        ->assertSessionHasInput('short_code', $daily->fresh()->qr_short_code)
        ->assertSessionHas('error', 'Pindai QR kedatangan awal event sebelum absensi harian, sesi, materi, atau ujian.');
    $scan($session)
        ->assertRedirect()
        ->assertSessionHas('error', 'Pindai QR kedatangan awal event sebelum absensi harian, sesi, materi, atau ujian.');
    $scan($arrival)->assertRedirect("/event/{$event->slug}/ruang-belajar");
    $scan($session)
        ->assertRedirect()
        ->assertSessionHas('error', "Catat kehadiran hari ke-{$session->day_number} sebelum melakukan absensi sesi ini.");
    $scan($daily)->assertRedirect("/event/{$event->slug}/ruang-belajar");
    $scan($session)->assertRedirect("/event/{$event->slug}/ruang-belajar");

    foreach ([$arrival, $daily, $session] as $attendanceSession) {
        $this->assertDatabaseHas('event_attendances', [
            'event_session_id' => $attendanceSession->id,
            'participant_id' => $participant->id,
            'attendance_type' => 'check_in',
        ]);
    }
});

test('session with an exam cannot disable attendance', function () {
    $event = Event::firstOrFail();
    $package = CbtExamPackage::where('code', 'CBT-KEMPO-2026')->firstOrFail();
    $payload = [
        'day_number' => 1,
        'session_number' => 'Ujian baru',
        'session_type_code' => 'UJIAN',
        'start_time' => '10:00',
        'end_time' => '11:00',
        'duration_jp' => 1,
        'topic' => 'Ujian baru',
        'status' => 'scheduled',
        'cbt_exam_package_id' => $package->id,
        'attendance_setting' => 'none',
    ];

    $this->actingAs($this->admin)
        ->post("/admin/event/{$event->id}/sesi", $payload)
        ->assertSessionHasErrors('attendance_setting');

    $this->assertDatabaseMissing('event_sessions', [
        'event_id' => $event->id,
        'session_number' => 'Ujian baru',
    ]);

    $this->post("/admin/event/{$event->id}/sesi", [
        ...$payload,
        'attendance_setting' => 'check_in',
    ])->assertSessionHasNoErrors();

    $this->assertDatabaseHas('event_sessions', [
        'event_id' => $event->id,
        'session_number' => 'Ujian baru',
        'attendance_setting' => 'check_in',
    ]);
});

test('admin can perform manual attendance override with audit log', function () {
    $event = Event::first();
    $session = $event->sessions()->first();
    $participant = Participant::first();

    $response = $this->actingAs($this->admin)
        ->post("/admin/event/{$event->id}/absensi/override", [
            'event_session_id' => $session->id,
            'participant_id' => $participant->id,
            'attendance_type' => 'check_in',
            'status' => 'manual_override',
            'notes' => 'Peserta mengalami kendala kamera, diverifikasi manual oleh ketua panitia.',
        ]);

    $response->assertSessionHasNoErrors();

    $this->assertDatabaseHas('event_attendances', [
        'event_session_id' => $session->id,
        'participant_id' => $participant->id,
        'status' => 'manual_override',
        'method' => 'manual_admin',
        'recorded_by' => $this->admin->id,
    ]);
});

test('admin can reset all results for one participant without affecting another participant', function () {
    $event = Event::firstOrFail();
    app(EventAttendanceScheduleService::class)->ensureDefaultSessions($event);
    $participant = Participant::firstOrFail();
    $otherParticipant = Participant::query()->whereKeyNot($participant->id)->firstOrFail();
    $enrollment = EventParticipant::query()
        ->where('event_id', $event->id)
        ->where('participant_id', $participant->id)
        ->firstOrFail();
    $otherEnrollment = EventParticipant::query()
        ->where('event_id', $event->id)
        ->where('participant_id', $otherParticipant->id)
        ->firstOrFail();
    $arrivalSession = $event->sessions()->where('session_type_code', 'KEHADIRAN_AWAL')->firstOrFail();
    $regularSession = $event->sessions()->whereNotIn('session_type_code', ['KEHADIRAN_AWAL', 'KEHADIRAN_HARIAN'])->firstOrFail();
    EventAttendance::query()
        ->where('event_id', $event->id)
        ->where('participant_id', $participant->id)
        ->delete();
    $arrivalAttendance = EventAttendance::create([
        'event_id' => $event->id,
        'event_session_id' => $arrivalSession->id,
        'participant_id' => $participant->id,
        'attendance_type' => 'check_in',
        'status' => 'present',
        'checked_in_at' => now()->subMinute(),
        'method' => 'qr_scan',
        'recorded_by' => $this->participantUser->id,
    ]);
    EventAttendance::create([
        'event_id' => $event->id,
        'event_session_id' => $regularSession->id,
        'participant_id' => $participant->id,
        'attendance_type' => 'check_in',
        'status' => 'present',
        'checked_in_at' => now(),
        'method' => 'short_code',
        'recorded_by' => $this->participantUser->id,
    ]);
    $otherAttendance = EventAttendance::updateOrCreate([
        'event_session_id' => $regularSession->id,
        'participant_id' => $otherParticipant->id,
        'attendance_type' => 'check_in',
    ], [
        'event_id' => $event->id,
        'status' => 'present',
        'checked_in_at' => now(),
        'method' => 'manual_admin',
        'recorded_by' => $this->admin->id,
    ]);
    $package = CbtExamPackage::firstOrFail();
    $attempt = CbtExamAttempt::create([
        'cbt_exam_package_id' => $package->id,
        'event_id' => $event->id,
        'event_session_id' => $regularSession->id,
        'participant_id' => $participant->id,
        'user_id' => $this->participantUser->id,
        'attempt_number' => 1,
        'started_at' => now()->subHour(),
        'submitted_at' => now(),
        'status' => 'submitted',
        'total_score' => 88,
        'is_passed' => true,
        'answers' => ['1' => 'A'],
        'revision_file_path' => 'event-revisions/target.pdf',
        'revision_status' => 'submitted',
        'revision_submitted_at' => now(),
    ]);
    $otherAttempt = CbtExamAttempt::create([
        'cbt_exam_package_id' => $package->id,
        'event_id' => $event->id,
        'event_session_id' => $regularSession->id,
        'participant_id' => $otherParticipant->id,
        'attempt_number' => 1,
        'started_at' => now()->subHour(),
        'submitted_at' => now(),
        'status' => 'submitted',
        'total_score' => 90,
        'is_passed' => true,
        'answers' => ['1' => 'B'],
    ]);
    $proctoringEvent = CbtProctoringEvent::create([
        'cbt_exam_attempt_id' => $attempt->id,
        'event_id' => $event->id,
        'participant_id' => $participant->id,
        'type' => 'window_blur',
        'severity' => 'warning',
        'occurred_at' => now(),
    ]);
    $enrollment->update([
        'attendance_status' => 'present',
        'attendance_records' => [
            "session_{$arrivalSession->id}" => ['status' => 'present'],
            "session_{$regularSession->id}" => ['status' => 'present'],
        ],
        'checked_in_at' => $arrivalAttendance->checked_in_at,
        'checkin_method' => 'qr_scan',
        'checkin_status' => 'checked_in',
        'score_theory' => 88,
        'score_practice' => 92,
        'evaluation_notes' => 'Lulus evaluasi',
        'graduation_status' => 'graduated',
        'certificate_number' => 'CERT-TARGET',
        'certificate_file_path' => 'event-certificates/target.pdf',
        'certificate_issued_at' => today(),
    ]);
    $otherEnrollment->update(['score_theory' => 90, 'graduation_status' => 'graduated']);

    $response = $this->actingAs($this->admin)
        ->delete("/admin/event/{$event->id}/absensi/{$arrivalAttendance->id}");

    $response->assertRedirect()->assertSessionHas('success', 'Seluruh presensi, nilai, dan hasil ujian peserta berhasil direset.');
    expect(EventAttendance::where('event_id', $event->id)->where('participant_id', $participant->id)->count())->toBe(0);
    $this->assertModelExists($otherAttendance);
    $this->assertModelMissing($attempt);
    $this->assertModelExists($otherAttempt);
    $this->assertModelMissing($proctoringEvent);
    $enrollment->refresh();
    expect($enrollment->checked_in_at)->toBeNull()
        ->and($enrollment->checkin_method)->toBeNull()
        ->and($enrollment->checkin_status)->toBe('registered')
        ->and($enrollment->attendance_status)->toBe('registered')
        ->and($enrollment->attendance_records)->toBeNull()
        ->and($enrollment->score_theory)->toBeNull()
        ->and($enrollment->score_practice)->toBeNull()
        ->and($enrollment->evaluation_notes)->toBeNull()
        ->and($enrollment->graduation_status)->toBe('in_training')
        ->and($enrollment->certificate_number)->toBeNull()
        ->and($enrollment->certificate_file_path)->toBeNull()
        ->and($enrollment->certificate_issued_at)->toBeNull();
    expect((float) $otherEnrollment->fresh()->score_theory)->toBe(90.0);
    $this->assertDatabaseHas('activity_logs', [
        'event' => 'event.participant_results.reset',
        'subject_type' => Event::class,
        'subject_id' => $event->id,
        'actor_id' => $this->admin->id,
    ]);
});

test('admin can reset participant results when the participant has no attendance record', function () {
    $event = Event::firstOrFail();
    $enrollment = $event->eventParticipants()->firstOrFail();
    $participant = $enrollment->participant;
    $package = CbtExamPackage::firstOrFail();

    EventAttendance::query()
        ->where('event_id', $event->id)
        ->where('participant_id', $participant->id)
        ->delete();
    CbtExamAttempt::query()
        ->where('event_id', $event->id)
        ->where('participant_id', $participant->id)
        ->delete();
    $attempt = CbtExamAttempt::create([
        'cbt_exam_package_id' => $package->id,
        'event_id' => $event->id,
        'participant_id' => $participant->id,
        'user_id' => $participant->user_id,
        'attempt_number' => 1,
        'started_at' => now()->subMinutes(15),
        'submitted_at' => now(),
        'status' => 'submitted',
        'total_score' => 82,
        'is_passed' => true,
        'answers' => ['1' => 'A'],
    ]);
    $enrollment->update([
        'score_theory' => 82,
        'score_practice' => 84,
        'graduation_status' => 'graduated',
        'certificate_number' => 'CERT-NO-ATTENDANCE',
    ]);

    $response = $this->actingAs($this->admin)
        ->delete("/admin/event/{$event->id}/peserta/{$enrollment->id}/hasil");

    $response->assertRedirect()
        ->assertSessionHas('success', 'Seluruh presensi, nilai, dan hasil ujian peserta berhasil direset.');
    $this->assertModelMissing($attempt);
    $enrollment->refresh();
    expect($enrollment->score_theory)->toBeNull()
        ->and($enrollment->score_practice)->toBeNull()
        ->and($enrollment->graduation_status)->toBe('in_training')
        ->and($enrollment->certificate_number)->toBeNull();
});

test('admin can reset all participant results without deleting event setup', function () {
    $event = Event::firstOrFail();
    app(EventAttendanceScheduleService::class)->ensureDefaultSessions($event);
    $participant = Participant::firstOrFail();
    $enrollment = EventParticipant::query()
        ->where('event_id', $event->id)
        ->where('participant_id', $participant->id)
        ->firstOrFail();
    $session = $event->sessions()->where('session_type_code', 'KEHADIRAN_AWAL')->firstOrFail();
    EventAttendance::updateOrCreate([
        'event_session_id' => $session->id,
        'participant_id' => $participant->id,
        'attendance_type' => 'check_in',
    ], [
        'event_id' => $event->id,
        'status' => 'present',
        'checked_in_at' => now(),
        'method' => 'manual_admin',
        'recorded_by' => $this->admin->id,
    ]);
    $enrollment->update([
        'attendance_status' => 'present',
        'attendance_records' => ["session_{$session->id}" => ['status' => 'present']],
        'checked_in_at' => now(),
        'checkin_method' => 'manual_admin',
        'checkin_status' => 'checked_in',
        'checkin_notes' => 'Verifikasi panitia',
        'score_theory' => 75,
        'score_practice' => 80,
        'graduation_status' => 'graduated',
        'certificate_number' => 'CERT-ALL',
        'certificate_file_path' => 'event-certificates/all.pdf',
        'certificate_issued_at' => today(),
    ]);
    $package = CbtExamPackage::firstOrFail();
    $attempt = CbtExamAttempt::create([
        'cbt_exam_package_id' => $package->id,
        'event_id' => $event->id,
        'event_session_id' => $session->id,
        'participant_id' => $participant->id,
        'user_id' => $this->participantUser->id,
        'attempt_number' => 1,
        'started_at' => now()->subHour(),
        'submitted_at' => now(),
        'status' => 'submitted',
        'total_score' => 75,
        'is_passed' => true,
        'answers' => ['1' => 'A'],
        'revision_file_path' => 'event-revisions/all.pdf',
    ]);
    CbtProctoringEvent::create([
        'cbt_exam_attempt_id' => $attempt->id,
        'event_id' => $event->id,
        'participant_id' => $participant->id,
        'type' => 'tab_hidden',
        'severity' => 'warning',
        'occurred_at' => now(),
    ]);
    $sessionCount = $event->sessions()->count();
    $participantCount = $event->eventParticipants()->count();
    $attendanceCount = $event->attendances()->count();
    $attemptCount = CbtExamAttempt::where('event_id', $event->id)->count();
    $learningRoomBeforeReset = app(EventLearningRoomService::class)
        ->data($this->participantUser, $event->slug);

    expect($learningRoomBeforeReset['participant']['is_checked_in'])->toBeTrue();

    $response = $this->actingAs($this->admin)
        ->delete("/admin/event/{$event->id}/absensi");

    $response->assertRedirect()->assertSessionHas(
        'success',
        "Hasil {$participantCount} peserta berhasil direset, termasuk {$attendanceCount} presensi dan {$attemptCount} percobaan ujian.",
    );
    expect($event->attendances()->count())->toBe(0)
        ->and($event->sessions()->count())->toBe($sessionCount)
        ->and($event->eventParticipants()->count())->toBe($participantCount);
    expect($event->eventParticipants()->whereNotNull('checked_in_at')->count())->toBe(0)
        ->and($event->eventParticipants()->whereNotNull('attendance_records')->count())->toBe(0)
        ->and($event->eventParticipants()->where('checkin_status', '!=', 'registered')->count())->toBe(0)
        ->and($event->eventParticipants()->whereNotNull('score_theory')->count())->toBe(0)
        ->and($event->eventParticipants()->whereNotNull('score_practice')->count())->toBe(0)
        ->and($event->eventParticipants()->whereNotNull('certificate_file_path')->count())->toBe(0)
        ->and(CbtExamAttempt::where('event_id', $event->id)->count())->toBe(0)
        ->and(CbtProctoringEvent::where('event_id', $event->id)->count())->toBe(0);
    $this->assertDatabaseHas('activity_logs', [
        'event' => 'event.participant_results.reset_all',
        'subject_type' => Event::class,
        'subject_id' => $event->id,
        'actor_id' => $this->admin->id,
    ]);
    $this->actingAs($this->participantUser)
        ->get("/event/{$event->slug}/ruang-belajar")
        ->assertInertia(fn (Assert $page) => $page
            ->component('Event/LearningRoom')
            ->where('participant.is_checked_in', false)
            ->where('participant.can_access_learning', false)
            ->has('attendanceRecords', 0)
            ->has('modules', 0)
            ->has('myLearningModules', 0)
            ->has('myCbtExams', 0)
        );
});

test('attendance from another event cannot be reset through the current event', function () {
    $event = Event::firstOrFail();
    $otherEvent = Event::create([
        'title' => 'Event Lain',
        'slug' => 'event-lain',
        'start_date' => '2026-10-01',
        'end_date' => '2026-10-01',
        'location' => 'Jakarta',
    ]);
    $otherSession = $otherEvent->sessions()->create([
        'day_number' => 1,
        'date' => '2026-10-01',
        'start_time' => '08:00',
        'end_time' => '09:00',
        'session_number' => 'Sesi 1',
        'duration_jp' => 1,
        'session_type_code' => 'PLENO',
        'topic' => 'Sesi event lain',
        'status' => 'scheduled',
    ]);
    $otherAttendance = EventAttendance::create([
        'event_id' => $otherEvent->id,
        'event_session_id' => $otherSession->id,
        'participant_id' => Participant::firstOrFail()->id,
        'attendance_type' => 'check_in',
        'status' => 'present',
        'checked_in_at' => now(),
        'method' => 'qr_scan',
    ]);

    $response = $this->actingAs($this->admin)
        ->delete("/admin/event/{$event->id}/absensi/{$otherAttendance->id}");

    $response->assertNotFound();
    $this->assertModelExists($otherAttendance);
});

test('participant cannot reset event attendance', function () {
    $event = Event::firstOrFail();
    $attendance = $event->attendances()->firstOrFail();

    $response = $this->actingAs($this->participantUser)
        ->delete("/admin/event/{$event->id}/absensi/{$attendance->id}");

    $response->assertForbidden();
    $this->assertModelExists($attendance);
});

test('participant cannot bypass QR attendance with direct event check-in', function () {
    $event = Event::first();
    $ep = EventParticipant::first();
    $ep->update(['checked_in_at' => null, 'checkin_status' => 'registered']);

    $response = $this->actingAs($this->participantUser)->post("/event/{$event->slug}/check-in");

    $response->assertRedirect("/event/{$event->slug}/scan");
    $ep->refresh();

    expect($ep->checked_in_at)->toBeNull();
});

test('participant can record attendance using QR token and duplicate is prevented', function () {
    $event = Event::first();
    // Choose session 2 which has no pre-existing attendance
    $session = $event->sessions()->skip(1)->first();
    $participant = Participant::first();
    EventAttendance::where('event_session_id', $session->id)->delete();

    $session->update([
        'is_attendance_open' => true,
        'qr_token' => 'TEST-QR-TOKEN-123',
        'attendance_close_at' => now()->addHour(),
        'track_codes' => null, // allow all tracks
    ]);

    // First scan succeeds
    $response = $this->actingAs($this->participantUser)->post("/event/{$event->slug}/absensi/catat", [
        'token' => 'TEST-QR-TOKEN-123',
        'attendance_type' => 'check_in',
    ]);

    $response->assertRedirect("/event/{$event->slug}/ruang-belajar");
    $this->assertDatabaseHas('event_attendances', [
        'event_session_id' => $session->id,
        'participant_id' => $participant->id,
        'attendance_type' => 'check_in',
    ]);
    expect(EventParticipant::first()->fresh()->checked_in_at)->not->toBeNull();

    // Second scan with same type is rejected as duplicate
    $duplicateResponse = $this->post("/event/{$event->slug}/absensi/catat", [
        'token' => 'TEST-QR-TOKEN-123',
        'attendance_type' => 'check_in',
    ]);

    $duplicateResponse->assertSessionHas('info');
    expect(EventAttendance::where('event_session_id', $session->id)->where('participant_id', $participant->id)->count())->toBe(1);
});

test('participant can view mobile-first learning room with complete sections', function () {
    $event = Event::first();

    $response = $this->actingAs($this->participantUser)->get("/event/{$event->slug}/ruang-belajar");

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Event/LearningRoom')
        ->has('event')
        ->has('participant')
        ->has('sessions')
        ->has('modules')
        ->has('cbtPackages')
        ->has('attendanceRecords')
    );
});

test('attended learning module linked directly to a rundown session appears in learning room', function () {
    $event = Event::firstOrFail();
    app(EventAttendanceScheduleService::class)->ensureDefaultSessions($event);

    $participant = Participant::firstOrFail();
    EventAttendance::where('event_id', $event->id)
        ->where('participant_id', $participant->id)
        ->delete();
    $learningModule = LearningModule::with('materials')->firstOrFail();
    $material = Material::create([
        'title' => 'Materi Sesi Langsung',
        'slug' => 'materi-sesi-langsung',
        'code' => 'MAT-SESI-01',
        'type' => 'book',
        'status' => 'published',
        'created_by' => $this->admin->id,
    ]);
    $learningModule->materials()->syncWithoutDetaching([
        $material->id => [
            'sort_order' => 1,
            'is_required' => true,
        ],
    ]);
    $learningModule->load('materials');
    $learningModule->update(['track_codes' => null]);
    $event->learningModules()->detach($learningModule->id);
    $event->sessions()->where('learning_module_id', $learningModule->id)->update([
        'learning_module_id' => null,
    ]);

    $session = $event->sessions()
        ->whereNotIn('session_type_code', ['KEHADIRAN_AWAL', 'KEHADIRAN_HARIAN'])
        ->firstOrFail();
    $session->update([
        'day_number' => 1,
        'date' => $event->start_date,
        'learning_module_id' => $learningModule->id,
        'material_id' => $learningModule->materials->firstOrFail()->id,
        'attendance_setting' => 'check_in',
    ]);

    $arrivalSession = $event->sessions()->where('session_type_code', 'KEHADIRAN_AWAL')->firstOrFail();
    $dailySession = $event->sessions()
        ->where('session_type_code', 'KEHADIRAN_HARIAN')
        ->where('day_number', 1)
        ->firstOrFail();

    foreach ([$arrivalSession, $dailySession] as $attendanceSession) {
        EventAttendance::create([
            'event_id' => $event->id,
            'event_session_id' => $attendanceSession->id,
            'participant_id' => $participant->id,
            'attendance_type' => 'check_in',
            'status' => 'present',
            'checked_in_at' => now(),
            'method' => 'qr_scan',
            'recorded_by' => $this->participantUser->id,
        ]);
    }

    $beforeAttendance = app(EventLearningRoomService::class)
        ->data($this->participantUser, $event->slug);
    expect(collect($beforeAttendance['myLearningModules'])->pluck('id'))
        ->not->toContain($learningModule->id);

    EventAttendance::create([
        'event_id' => $event->id,
        'event_session_id' => $session->id,
        'participant_id' => $participant->id,
        'attendance_type' => 'check_in',
        'status' => 'present',
        'checked_in_at' => now(),
        'method' => 'qr_scan',
        'recorded_by' => $this->participantUser->id,
    ]);

    $afterAttendance = app(EventLearningRoomService::class)
        ->data($this->participantUser, $event->slug);
    $visibleModule = collect($afterAttendance['myLearningModules'])->firstWhere('id', $learningModule->id);

    expect($visibleModule)->not->toBeNull()
        ->and($visibleModule['materials'])->not->toBeEmpty()
        ->and($visibleModule['materials']->first()['slug'])->toBe($learningModule->materials->first()->slug)
        ->and($visibleModule['materials']->first()['reader_url'])
        ->toContain('event='.$event->slug);
});

test('attended CBT package linked directly to a rundown session appears and can be opened', function () {
    $event = Event::firstOrFail();
    app(EventAttendanceScheduleService::class)->ensureDefaultSessions($event);

    $participant = Participant::firstOrFail();
    EventAttendance::where('event_id', $event->id)
        ->where('participant_id', $participant->id)
        ->delete();
    $package = CbtExamPackage::create([
        'event_id' => null,
        'title' => 'Ujian Sesi Langsung',
        'code' => 'CBT-SESI-LANGSUNG',
        'exam_type' => 'theory',
        'duration_minutes' => 30,
        'passing_score' => 70,
        'attempts_allowed' => 1,
        'status' => 'ready',
    ]);
    $event->linkedCbtPackages()->detach($package->id);

    $session = $event->sessions()
        ->whereNotIn('session_type_code', ['KEHADIRAN_AWAL', 'KEHADIRAN_HARIAN'])
        ->firstOrFail();
    $session->update([
        'day_number' => 1,
        'date' => $event->start_date,
        'cbt_exam_package_id' => $package->id,
        'attendance_setting' => 'check_in',
    ]);

    $arrivalSession = $event->sessions()->where('session_type_code', 'KEHADIRAN_AWAL')->firstOrFail();
    $dailySession = $event->sessions()
        ->where('session_type_code', 'KEHADIRAN_HARIAN')
        ->where('day_number', 1)
        ->firstOrFail();

    foreach ([$arrivalSession, $dailySession, $session] as $attendanceSession) {
        EventAttendance::create([
            'event_id' => $event->id,
            'event_session_id' => $attendanceSession->id,
            'participant_id' => $participant->id,
            'attendance_type' => 'check_in',
            'status' => 'present',
            'checked_in_at' => now(),
            'method' => 'qr_scan',
            'recorded_by' => $this->participantUser->id,
        ]);
    }

    $learningRoom = app(EventLearningRoomService::class)
        ->data($this->participantUser, $event->slug);
    $visiblePackage = collect($learningRoom['myCbtExams'])->firstWhere('id', $package->id);

    expect($visiblePackage)->not->toBeNull()
        ->and($visiblePackage['is_accessible'])->toBeTrue();

    $this->actingAs($this->participantUser)
        ->get("/event/{$event->slug}/cbt/{$package->code}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Event/CbtExam')
            ->where('package.id', $package->id)
        );
});

test('learning room loads participant CBT attempts in one batched query', function () {
    $event = Event::firstOrFail();

    foreach (range(1, 4) as $number) {
        CbtExamPackage::create([
            'event_id' => $event->id,
            'title' => "Paket Query {$number}",
            'code' => "QUERY-BATCH-{$number}",
            'exam_type' => 'theory',
            'duration_minutes' => 30,
            'passing_score' => 70,
            'attempts_allowed' => 1,
            'status' => 'ready',
        ]);
    }

    DB::flushQueryLog();
    DB::enableQueryLog();
    $this->actingAs($this->participantUser)
        ->get("/event/{$event->slug}/ruang-belajar")
        ->assertOk();
    $attemptQueries = collect(DB::getQueryLog())
        ->filter(fn (array $query) => str_contains($query['query'], 'from "cbt_exam_attempts"'));
    DB::disableQueryLog();

    expect($attemptQueries)->toHaveCount(1);
});

test('participant can view scanner page with camera and shortcode options', function () {
    $event = Event::first();
    $session = $event->sessions()->firstOrFail();

    $this->actingAs($this->admin)
        ->post("/admin/event/{$event->id}/sesi/{$session->id}/absensi/buka")
        ->assertSessionHasNoErrors();
    $session->refresh();

    $response = $this->actingAs($this->participantUser)
        ->get(route('event.scan', [
            'slug' => $event->slug,
            'code' => $session->qr_short_code,
        ]));

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Event/Scan')
        ->has('event')
        ->has('participant')
        ->where('prefilledCode', $session->qr_short_code)
        ->where('matchedSession.id', $session->id)
    );
});

test('participant can take CBT exam and system calculates automated score', function () {
    $event = Event::first();
    $pkg = CbtExamPackage::where('code', 'CBT-KEMPO-2026')->first();
    $examSession = $event->sessions()->where('cbt_exam_package_id', $pkg->id)->firstOrFail();

    $this->actingAs($this->participantUser)
        ->get("/event/{$event->slug}/cbt/{$pkg->code}")
        ->assertForbidden();

    EventAttendance::create([
        'event_id' => $event->id,
        'event_session_id' => $examSession->id,
        'participant_id' => Participant::firstOrFail()->id,
        'attendance_type' => 'check_in',
        'status' => 'present',
        'checked_in_at' => now(),
        'method' => 'qr_scan',
        'recorded_by' => $this->participantUser->id,
    ]);

    // 1. Open exam runner
    $examResponse = $this->actingAs($this->participantUser)->get("/event/{$event->slug}/cbt/{$pkg->code}");
    $examResponse->assertStatus(200);
    $examResponse->assertInertia(fn (Assert $page) => $page
        ->component('Event/CbtExam')
        ->has('package')
        ->where('attempt.remaining_seconds', fn ($seconds) => is_int($seconds)
            && $seconds > 0
            && $seconds <= $pkg->duration_minutes * 60)
        ->where('attempt.expires_at', fn ($expiresAt) => is_string($expiresAt) && $expiresAt !== '')
        ->has('questions', 4)
    );

    // 2. Submit all correct answers
    $questions = $pkg->questions()->get();
    $answers = [];
    foreach ($questions as $q) {
        $answers[(string) $q->id] = $q->correct_answer;
    }

    $submitResponse = $this->post("/event/{$event->slug}/cbt/{$pkg->code}/submit", [
        'answers' => $answers,
    ]);

    $submitResponse->assertRedirect("/event/{$event->slug}/ruang-belajar");

    $this->assertDatabaseHas('cbt_exam_attempts', [
        'cbt_exam_package_id' => $pkg->id,
        'status' => 'submitted',
        'total_score' => 100.00,
        'is_passed' => true,
    ]);
});

test('server enforces CBT deadline and submits only answers saved before timeout', function () {
    $event = Event::firstOrFail();
    $package = CbtExamPackage::where('code', 'CBT-KEMPO-2026')->firstOrFail();
    $examSession = $event->sessions()->where('cbt_exam_package_id', $package->id)->firstOrFail();
    $participant = Participant::firstOrFail();

    EventAttendance::updateOrCreate([
        'event_session_id' => $examSession->id,
        'participant_id' => $participant->id,
        'attendance_type' => 'check_in',
    ], [
        'event_id' => $event->id,
        'status' => 'present',
        'checked_in_at' => now(),
        'method' => 'qr_scan',
        'recorded_by' => $this->participantUser->id,
    ]);

    CbtExamAttempt::query()
        ->where('event_id', $event->id)
        ->where('cbt_exam_package_id', $package->id)
        ->where('participant_id', $participant->id)
        ->delete();

    $question = $package->questions()->firstOrFail();
    $attempt = CbtExamAttempt::create([
        'cbt_exam_package_id' => $package->id,
        'event_id' => $event->id,
        'participant_id' => $participant->id,
        'user_id' => $this->participantUser->id,
        'attempt_number' => 1,
        'started_at' => now()->subMinutes($package->duration_minutes)->subSecond(),
        'status' => 'in_progress',
        'answers' => [],
    ]);

    $this->actingAs($this->participantUser)
        ->get("/event/{$event->slug}/cbt/{$package->code}")
        ->assertRedirect("/event/{$event->slug}/ruang-belajar")
        ->assertSessionHas('info');

    expect($attempt->fresh()->status)->toBe('timed_out');

    $attempt->delete();
    $attempt = CbtExamAttempt::create([
        'cbt_exam_package_id' => $package->id,
        'event_id' => $event->id,
        'participant_id' => $participant->id,
        'user_id' => $this->participantUser->id,
        'attempt_number' => 1,
        'started_at' => now()->subMinutes($package->duration_minutes)->subSecond(),
        'status' => 'in_progress',
        'answers' => [],
    ]);

    $this->actingAs($this->participantUser)
        ->post("/event/{$event->slug}/cbt/{$package->code}/jawaban", [
            'question_id' => $question->id,
            'answer' => $question->correct_answer,
        ])
        ->assertRedirect("/event/{$event->slug}/ruang-belajar")
        ->assertSessionHas('info');

    $attempt->refresh();
    expect($attempt->status)->toBe('timed_out')
        ->and($attempt->answers)->toBe([])
        ->and((float) $attempt->total_score)->toBe(0.0)
        ->and($attempt->submitted_at)->not->toBeNull();
});

test('participant can take an event exam using questions selected from the master bank', function () {
    $event = Event::first();
    $question = QuestionBank::where('status', 'active')->firstOrFail();

    $this->actingAs($this->admin)->post("/admin/event/{$event->id}/cbt", [
        'title' => 'Ujian dari Bank Soal',
        'code' => 'CBT-BANK-ONLY-TEST',
        'exam_type' => 'theory',
        'question_module_id' => $question->question_module_id,
        'duration_minutes' => 60,
        'passing_score' => 75,
        'attempts_allowed' => 1,
        'revision_method' => 'none',
        'status' => 'ready',
        'result_display' => 'immediate',
    ])->assertSessionHasNoErrors();

    $package = CbtExamPackage::where('code', 'CBT-BANK-ONLY-TEST')->firstOrFail();
    expect($package->bankQuestions()->count())->toBeGreaterThan(0);

    $this->actingAs($this->participantUser)
        ->get("/event/{$event->slug}/cbt/{$package->code}")
        ->assertInertia(fn (Assert $page) => $page
            ->component('Event/CbtExam')
            ->has('questions', $package->bankQuestions()->count())
            ->where('questions.0.id', $question->id)
        );

    $answers = $package->bankQuestions->mapWithKeys(fn ($bankQuestion) => [(string) $bankQuestion->id => $bankQuestion->correct_answer])->all();
    $this->post("/event/{$event->slug}/cbt/{$package->code}/submit", [
        'answers' => $answers,
    ])->assertRedirect("/event/{$event->slug}/ruang-belajar");

    $this->assertDatabaseHas('cbt_exam_attempts', [
        'cbt_exam_package_id' => $package->id,
        'total_score' => 100.00,
        'is_passed' => true,
    ]);
});

test('CBT exam locks randomized question and option order deterministically once at attempt start', function () {
    $event = Event::first();
    $module = LearningModule::firstOrFail();
    $questions = QuestionBank::where('status', 'active')->where('question_module_id', $module->id)->take(5)->get();

    $package = CbtExamPackage::create([
        'title' => 'Ujian Acak Terkunci',
        'code' => 'CBT-RANDOM-LOCK-TEST',
        'exam_type' => 'theory_exam',
        'duration_minutes' => 60,
        'passing_score' => 75,
        'randomize_questions' => true,
        'randomize_answers' => true,
        'status' => 'ready',
        'question_module_id' => $module->id,
    ]);
    $package->bankQuestions()->sync($questions->pluck('id'));
    $event->linkedCbtPackages()->attach($package->id, ['is_required' => true, 'sort_order' => 1]);

    // 1. First visit initializes attempt and locks question_order & option_order
    $response1 = $this->actingAs($this->participantUser)
        ->get("/event/{$event->slug}/cbt/{$package->code}");

    $attempt = CbtExamAttempt::where('cbt_exam_package_id', $package->id)->firstOrFail();
    expect($attempt->question_order)->toBeArray()
        ->and(count($attempt->question_order))->toBe($questions->count())
        ->and($attempt->option_order)->toBeArray()
        ->and(count($attempt->option_order))->toBe($questions->count());

    $lockedQuestionOrder = $attempt->question_order;
    $lockedOptionOrder = $attempt->option_order;

    // Verify first response has normalized option structure
    $response1->assertInertia(function (Assert $page) use ($package, $lockedQuestionOrder) {
        $page->component('Event/CbtExam')
            ->has('questions', $package->bankQuestions()->count())
            ->where('questions.0.id', $lockedQuestionOrder[0])
            ->has('questions.0.options.0.key')
            ->has('questions.0.options.0.id')
            ->has('questions.0.options.0.label')
            ->has('questions.0.options.0.text');
    });

    // 2. Second visit must yield the EXACT same question order and option order
    $this->actingAs($this->participantUser)
        ->get("/event/{$event->slug}/cbt/{$package->code}")
        ->assertInertia(fn (Assert $page) => $page
            ->component('Event/CbtExam')
            ->where('questions.0.id', $lockedQuestionOrder[0])
            ->where('questions.1.id', $lockedQuestionOrder[1])
        );

    $attempt->refresh();
    expect($attempt->question_order)->toBe($lockedQuestionOrder)
        ->and($attempt->option_order)->toBe($lockedOptionOrder);

    // 3. Saving answer does not alter question order or option order
    $firstQId = $lockedQuestionOrder[0];
    $saveResponse = $this->actingAs($this->participantUser)
        ->post("/event/{$event->slug}/cbt/{$package->code}/jawaban", [
            'question_id' => $firstQId,
            'answer' => 'B',
        ]);
    $saveResponse->assertSessionHasNoErrors();

    $attempt->refresh();
    expect($attempt->answers)->toBe([(string) $firstQId => 'B'])
        ->and($attempt->question_order)->toBe($lockedQuestionOrder)
        ->and($attempt->option_order)->toBe($lockedOptionOrder);
});

test('participant exam is automatically submitted when beacon request is sent on page exit', function () {
    $event = Event::first();
    $package = CbtExamPackage::where('code', 'CBT-KEMPO-2026')->firstOrFail();
    $examSession = $event->sessions()->where('cbt_exam_package_id', $package->id)->firstOrFail();

    EventAttendance::create([
        'event_id' => $event->id,
        'event_session_id' => $examSession->id,
        'participant_id' => Participant::firstOrFail()->id,
        'attendance_type' => 'check_in',
        'status' => 'present',
        'checked_in_at' => now(),
        'method' => 'qr_scan',
        'recorded_by' => $this->participantUser->id,
    ]);

    // Start exam
    $this->actingAs($this->participantUser)
        ->get("/event/{$event->slug}/cbt/{$package->code}")
        ->assertStatus(200);

    $attempt = CbtExamAttempt::where('cbt_exam_package_id', $package->id)
        ->where('participant_id', Participant::first()->id)
        ->firstOrFail();

    expect($attempt->status)->toBe('in_progress');

    // Simulate page exit beacon submit
    $response = $this->actingAs($this->participantUser)
        ->post("/event/{$event->slug}/cbt/{$package->code}/submit", [
            'beacon' => '1',
        ]);

    $response->assertStatus(200)
        ->assertJson([
            'status' => 'submitted',
        ]);

    $attempt->refresh();
    expect($attempt->status)->toBe('submitted')
        ->and($attempt->submitted_at)->not->toBeNull();
});

test('participant with in-progress exam attempt is locked to exam room when accessing portal pages', function () {
    $event = Event::first();
    $package = CbtExamPackage::where('code', 'CBT-KEMPO-2026')->firstOrFail();
    $examSession = $event->sessions()->where('cbt_exam_package_id', $package->id)->firstOrFail();
    $participant = Participant::firstOrFail();

    EventAttendance::create([
        'event_id' => $event->id,
        'event_session_id' => $examSession->id,
        'participant_id' => $participant->id,
        'attendance_type' => 'check_in',
        'status' => 'present',
        'checked_in_at' => now(),
        'method' => 'qr_scan',
        'recorded_by' => $this->participantUser->id,
    ]);

    // Create an in-progress unexpired attempt
    CbtExamAttempt::create([
        'cbt_exam_package_id' => $package->id,
        'event_id' => $event->id,
        'participant_id' => $participant->id,
        'user_id' => $this->participantUser->id,
        'attempt_number' => 1,
        'status' => 'in_progress',
        'started_at' => now(),
        'answers' => [],
    ]);

    $examUrl = route('event.cbt.exam', [$event->slug, $package->code]);

    // 1. Learning room redirects to active exam
    $this->actingAs($this->participantUser)
        ->get("/event/{$event->slug}/ruang-belajar")
        ->assertRedirect($examUrl);

    // 2. Welcome screen redirects to active exam
    $this->actingAs($this->participantUser)
        ->get("/event/{$event->slug}/welcome")
        ->assertRedirect($examUrl);

    // 3. Scanner page redirects to active exam
    $this->actingAs($this->participantUser)
        ->get("/event/{$event->slug}/scan")
        ->assertRedirect($examUrl);

    // 4. Global portal events index redirects to active exam
    $this->actingAs($this->participantUser)
        ->get('/event-saya')
        ->assertRedirect($examUrl);

    // 5. Global certificates page redirects to active exam
    $this->actingAs($this->participantUser)
        ->get('/sertifikat-saya')
        ->assertRedirect($examUrl);
});

test('admin can update rundown session to CBT exam package with empty speaker and string values', function () {
    $event = Event::first();
    $session = $event->sessions()->where('session_type_code', '!=', 'KEHADIRAN_AWAL')->first();
    $package = CbtExamPackage::create([
        'code' => 'CBT-TEST-UPDATE',
        'title' => 'Ujian Update Session Test',
        'exam_type' => 'theory',
        'duration_minutes' => 60,
        'passing_score' => 70,
        'status' => 'draft',
    ]);

    $response = $this->actingAs($this->admin)
        ->put("/admin/event/{$event->id}/sesi/{$session->id}", [
            'day_number' => 1,
            'session_number' => '3',
            'duration_jp' => 1,
            'start_time' => '21:30',
            'end_time' => '22:30',
            'event_session_type_id' => '',
            'session_type_code' => 'UJIAN',
            'topic' => 'Ujian Evaluasi Malam',
            'speaker_id' => '',
            'status' => 'ready',
            'attendance_setting' => 'mandatory',
            'cbt_exam_package_id' => (string) $package->id,
            'learning_module_id' => '',
            'material_id' => '',
            'room' => 'Dojo Utama Pusdiklat',
            'requires_attendance_before_cbt' => false,
        ]);

    $response->assertSessionHasNoErrors();
    $session->refresh();

    expect($session->session_type_code)->toBe('UJIAN')
        ->and($session->cbt_exam_package_id)->toBe($package->id)
        ->and($session->speaker_id)->toBeNull()
        ->and($session->status)->toBe('scheduled')
        ->and($session->attendance_setting)->toBe('check_in')
        ->and($event->linkedCbtPackages()->where('cbt_exam_packages.id', $package->id)->exists())->toBeTrue();
});
