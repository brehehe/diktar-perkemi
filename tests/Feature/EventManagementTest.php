<?php

use App\Actions\Events\SaveEvent;
use App\Models\CbtExamAttempt;
use App\Models\CbtExamPackage;
use App\Models\CbtQuestion;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Participant;
use App\Models\User;
use App\Services\EventAttendanceScheduleService;
use Database\Seeders\EventManagementSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
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

test('admin can view event management list with metrics', function () {
    $response = $this->actingAs($this->admin)->get('/admin/event');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Events/Index')
        ->has('events.data')
        ->has('stats')
        ->where('stats.total_events', 1)
    );
});

test('new events prepare arrival and daily attendance sessions from their dates', function () {
    $this->actingAs($this->admin)->post('/admin/event', [
        'name' => 'Penataran Uji Kedatangan',
        'start_date' => '2026-10-05',
        'end_date' => '2026-10-06',
        'place' => 'Pusat Latihan PERKEMI',
        'organizer' => 'PERKEMI',
        'total_effective_jp' => 8,
        'total_schedule_jp' => 8,
        'jp_duration_minutes' => 45,
        'participant_quota' => 30,
        'status' => 'draft',
    ])->assertSessionHasNoErrors();

    $event = Event::where('title', 'Penataran Uji Kedatangan')->firstOrFail();
    expect($event->duration_text)->toBe('2 hari');
    $this->assertDatabaseHas('event_sessions', [
        'event_id' => $event->id,
        'session_type_code' => 'KEHADIRAN_AWAL',
        'attendance_setting' => 'check_in',
    ]);
    expect($event->sessions()->where('session_type_code', 'KEHADIRAN_HARIAN')->count())->toBe(2);
    $secondDay = $event->sessions()->where('session_type_code', 'KEHADIRAN_HARIAN')
        ->where('day_number', 2)->firstOrFail();
    expect($secondDay->date->toDateString())->toBe('2026-10-06')
        ->and($secondDay->attendance_setting)->toBe('check_in');
});

test('updating event dates synchronizes existing rundown and attendance dates', function () {
    $event = Event::firstOrFail();
    $rundownSession = $event->sessions()
        ->whereNotIn('session_type_code', ['KEHADIRAN_AWAL', 'KEHADIRAN_HARIAN'])
        ->firstOrFail();
    $originalTopic = $rundownSession->topic;
    $newStartDate = $event->start_date->copy()->subDay();
    $endDate = $event->end_date->copy();
    $expectedDays = (int) $newStartDate->diffInDays($endDate) + 1;

    $this->actingAs($this->admin)->put("/admin/event/{$event->id}", [
        'name' => $event->name,
        'description' => $event->description,
        'start_date' => $newStartDate->toDateString(),
        'end_date' => $endDate->toDateString(),
        'place' => $event->place,
        'organizer' => $event->organizer,
        'responsible_user_id' => $event->responsible_user_id,
        'total_effective_jp' => $event->total_effective_jp,
        'total_schedule_jp' => $event->total_schedule_jp,
        'jp_duration_minutes' => $event->jp_duration_minutes,
        'participant_quota' => $event->participant_quota,
        'status' => $event->status,
    ])->assertSessionHasNoErrors();

    $event->refresh();
    $rundownSession->refresh();
    $arrivalSession = $event->sessions()->where('session_type_code', 'KEHADIRAN_AWAL')->firstOrFail();
    $lastDailySession = $event->sessions()
        ->where('session_type_code', 'KEHADIRAN_HARIAN')
        ->where('day_number', $expectedDays)
        ->firstOrFail();

    expect($event->total_days)->toBe($expectedDays)
        ->and($arrivalSession->date->toDateString())->toBe($newStartDate->toDateString())
        ->and($rundownSession->date->toDateString())->toBe(
            $newStartDate->copy()->addDays($rundownSession->day_number - 1)->toDateString(),
        )
        ->and($rundownSession->topic)->toBe($originalTopic)
        ->and($lastDailySession->date->toDateString())->toBe($endDate->toDateString())
        ->and($event->sessions()->where('session_type_code', 'KEHADIRAN_HARIAN')->count())->toBe($expectedDays);
});

test('event creation rolls back when its default attendance schedule fails', function () {
    $schedule = Mockery::mock(EventAttendanceScheduleService::class);
    $schedule->shouldReceive('ensureDefaultSessions')
        ->once()
        ->andThrow(new RuntimeException('Simulated schedule failure'));
    $action = new SaveEvent($schedule);

    expect(fn () => $action->handle([
        'name' => 'Event Wajib Rollback',
        'description' => null,
        'start_date' => '2026-10-10',
        'end_date' => '2026-10-11',
        'place' => 'Dojo Pengujian',
        'organizer' => 'PERKEMI',
        'responsible_user_id' => null,
        'duration_days' => null,
        'total_effective_jp' => 8,
        'total_schedule_jp' => 10,
        'jp_duration_minutes' => 45,
        'learning_method' => null,
        'participant_quota' => 20,
        'status' => 'draft',
        'cover_image' => null,
        'banner_image' => null,
    ], $this->admin))->toThrow(RuntimeException::class, 'Simulated schedule failure');

    $this->assertDatabaseMissing('events', ['title' => 'Event Wajib Rollback']);
});

test('admin can view 10-tab event detail page with complete relations', function () {
    $event = Event::first();

    $response = $this->actingAs($this->admin)->get("/admin/event/{$event->id}");

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Events/Show')
        ->has('event')
        ->where('event.total_effective_jp', 34)
        ->where('event.total_schedule_jp', 38)
        ->has('modules')
        ->has('sessionsByDay')
        ->has('speakers')
        ->has('participants')
        ->has('tracks')
        ->has('legends')
        ->has('stats')
    );
});

test('admin event results show a provisional score for an in-progress theory exam', function () {
    $event = Event::firstOrFail();
    $enrollment = $event->eventParticipants()->firstOrFail();
    $participant = $enrollment->participant;
    $package = CbtExamPackage::create([
        'event_id' => $event->id,
        'title' => 'Ujian Teori UKT Kyu 3',
        'code' => 'CBT-UKT-KYU3-TEST',
        'exam_type' => 'theory',
        'total_questions' => 2,
        'duration_minutes' => 60,
        'passing_score' => 70,
        'attempts_allowed' => 1,
        'status' => 'open',
    ]);
    $correctQuestion = CbtQuestion::create([
        'cbt_exam_package_id' => $package->id,
        'question_text' => 'Soal benar',
        'question_type' => 'single_choice',
        'options' => ['A' => 'Benar', 'B' => 'Salah'],
        'correct_answer' => ['A'],
        'points' => 1,
        'sort_order' => 1,
        'is_active' => true,
    ]);
    $incorrectQuestion = CbtQuestion::create([
        'cbt_exam_package_id' => $package->id,
        'question_text' => 'Soal salah',
        'question_type' => 'single_choice',
        'options' => ['A' => 'Benar', 'B' => 'Salah'],
        'correct_answer' => ['A'],
        'points' => 1,
        'sort_order' => 2,
        'is_active' => true,
    ]);
    $attempt = CbtExamAttempt::create([
        'cbt_exam_package_id' => $package->id,
        'event_id' => $event->id,
        'participant_id' => $participant->id,
        'user_id' => $participant->user_id,
        'attempt_number' => 1,
        'started_at' => now()->subMinutes(10),
        'status' => 'in_progress',
        'answers' => [
            (string) $correctQuestion->id => 'A',
            (string) $incorrectQuestion->id => 'B',
        ],
        'question_order' => [$correctQuestion->id, $incorrectQuestion->id],
    ]);

    $response = $this->actingAs($this->admin)->get("/admin/event/{$event->id}?tab=hasil-ujian");

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->where('examAttempts', fn ($attempts) => collect($attempts)->contains(
            fn ($item) => $item['id'] === $attempt->id
                && (float) $item['score'] === 50.0
                && (float) $item['calculated_score'] === 50.0
                && $item['official_score'] === null
                && $item['score_is_provisional'] === true
                && $item['is_terminal'] === false
                && $item['total_answered'] === 2
                && $item['total_questions'] === 2,
        ))
        ->where('cbtCompletionMatrix', fn ($matrix) => collect($matrix)->contains(
            fn ($item) => $item['participant_id'] === $participant->id
                && $item['post_test']['has_attempted'] === true
                && (float) $item['post_test']['score'] === 50.0
                && $item['post_test']['score_is_provisional'] === true,
        ))
        ->where('stats.failed_exam_attempts', 0)
        ->where('stats.in_progress_exam_attempts', 1)
    );
});

test('admin can see and register an available master participant for an event', function () {
    $event = Event::firstOrFail();
    $enrollment = EventParticipant::where('event_id', $event->id)->firstOrFail();
    $participantId = $enrollment->participant_id;
    $enrollment->delete();
    $track = $event->eventParticipants()->firstOrFail()->track;

    $this->actingAs($this->admin)->get("/admin/event/{$event->id}")
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Events/Show')
            ->has('availableParticipants', 1)
            ->where('availableParticipants.0.id', $participantId)
        );

    $this->actingAs($this->admin)->post("/admin/event/{$event->id}/peserta", [
        'participant_id' => $participantId,
        'participant_track_id' => $track->id,
        'rotation_group' => 'A1',
        'admin_status' => 'verified',
    ])->assertSessionHasNoErrors();

    $this->assertDatabaseHas('event_participants', [
        'event_id' => $event->id,
        'participant_id' => $participantId,
        'track_code' => $track->code,
    ]);
});

test('admin can create a participant and enroll them in one event atomically', function () {
    $event = Event::firstOrFail();
    $track = $event->eventParticipants()->firstOrFail()->track;

    $this->actingAs($this->admin)->post("/admin/event/{$event->id}/peserta-baru", [
        'name' => 'Peserta Baru Event',
        'email' => 'peserta-baru-event@example.test',
        'origin' => 'Jawa Barat',
        'participant_track_id' => $track->id,
        'rotation_group' => 'A2',
        'admin_status' => 'verified',
    ])->assertSessionHasNoErrors();

    $participant = Participant::where('email', 'peserta-baru-event@example.test')->firstOrFail();
    $this->assertDatabaseHas('event_participants', [
        'event_id' => $event->id,
        'participant_id' => $participant->id,
        'track_code' => $track->code,
        'rotation_group' => 'A2',
    ]);

    $this->post("/admin/event/{$event->id}/peserta-baru", [
        'name' => 'Duplikat',
        'email' => 'peserta-baru-event@example.test',
        'origin' => 'Jawa Barat',
        'participant_track_id' => $track->id,
        'admin_status' => 'verified',
    ])->assertSessionHasErrors('email');

    expect(Participant::where('email', 'peserta-baru-event@example.test')->count())->toBe(1);
});

test('admin can add session to event rundown', function () {
    $event = Event::first();

    $response = $this->actingAs($this->admin)->post("/admin/event/{$event->id}/sesi", [
        'day_number' => 2,
        'session_number' => 'Sesi Uji Coba',
        'event_session_type_id' => 1,
        'start_time' => '13:00',
        'end_time' => '14:30',
        'duration_jp' => 2,
        'topic' => 'Sesi Uji Coba Standar Mutu',
        'status' => 'scheduled',
    ]);

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('event_sessions', [
        'event_id' => $event->id,
        'topic' => 'Sesi Uji Coba Standar Mutu',
    ]);
});

test('admin can view and filter master pemateri', function () {
    $response = $this->actingAs($this->admin)->get('/admin/master/pemateri');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Speakers/Index')
        ->has('speakers.data')
        ->has('stats')
    );
});

test('admin can create a new speaker', function () {
    $response = $this->actingAs($this->admin)->post('/admin/master/pemateri', [
        'name' => 'Dr. Bambang Irawan',
        'title_suffix' => 'Sp.KO',
        'type' => 'external',
        'institution' => 'Kemenpora RI',
        'primary_expertise' => 'Sport Science & Fisiologi',
        'is_active' => true,
    ]);

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('speakers', [
        'name' => 'Dr. Bambang Irawan',
        'type' => 'external',
    ]);
});

test('admin can view master peserta and 8-tab detail page', function () {
    $participant = Participant::first();

    $listResponse = $this->actingAs($this->admin)->get('/admin/master/peserta');
    $listResponse->assertStatus(200);

    $detailResponse = $this->actingAs($this->admin)->get("/admin/master/peserta/{$participant->id}");
    $detailResponse->assertStatus(200);
    $detailResponse->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Participants/Show')
        ->has('participant')
        ->has('enrolledEvents')
    );
});

test('user can open 3D welcome book opening screen', function () {
    $event = Event::first();

    $response = $this->actingAs($this->participantUser)->get("/event/{$event->slug}/welcome");

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Event/Welcome')
        ->has('event')
        ->has('participant')
    );
});

test('user can mark welcome seen and enter learning room', function () {
    $event = Event::first();
    $ep = EventParticipant::first();

    $response = $this->actingAs($this->participantUser)->post("/event/{$event->slug}/welcome/seen", [
        'event_participant_id' => $ep->id,
    ]);

    $response->assertRedirect("/event/{$event->slug}/ruang-belajar");
    $this->assertDatabaseHas('event_participants', [
        'id' => $ep->id,
        'has_seen_welcome' => true,
    ]);

    $roomResponse = $this->get("/event/{$event->slug}/ruang-belajar");
    $roomResponse->assertStatus(200);
    $roomResponse->assertInertia(fn (Assert $page) => $page
        ->component('Event/LearningRoom')
        ->has('event')
        ->has('modules')
    );
});

test('admin can view master tracks and legends', function () {
    $response = $this->actingAs($this->admin)->get('/admin/master/jalur');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Master/Tracks')
        ->has('tracks')
        ->has('legends')
    );
});

test('admin can update and delete an event module', function () {
    $event = Event::firstOrFail();
    $module = $event->modules()->firstOrFail();

    $response = $this->actingAs($this->admin)->put("/admin/event/{$event->id}/modul/{$module->id}", [
        'code' => 'MOD-UPDATED-01',
        'title' => 'Judul Modul Diperbarui',
        'duration_jp' => 4,
        'publication_status' => 'published',
        'source_type' => 'collection',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('event_modules', [
        'id' => $module->id,
        'code' => 'MOD-UPDATED-01',
        'title' => 'Judul Modul Diperbarui',
        'jp' => 4,
    ]);

    $deleteResponse = $this->actingAs($this->admin)->delete("/admin/event/{$event->id}/modul/{$module->id}");
    $deleteResponse->assertRedirect();
    $this->assertDatabaseMissing('event_modules', [
        'id' => $module->id,
    ]);
});

test('admin can view dedicated rundown page with event filter and default active event', function () {
    $event = Event::firstOrFail();

    $response = $this->actingAs($this->admin)->get('/admin/rundown');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Rundown/Index')
        ->has('availableEvents')
        ->has('event')
        ->where('event.id', $event->id)
        ->has('sessionsByDay')
    );
});

test('koordinator and pemateri can access admin rundown page and filter by event', function () {
    $event = Event::firstOrFail();
    $coordinator = User::factory()->create(['role' => 'Koordinator Acara']);

    $response = $this->actingAs($coordinator)->get("/admin/rundown?event_id={$event->id}&day=1");

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Rundown/Index')
        ->where('selectedEventId', $event->id)
        ->where('initialDay', 1)
        ->has('sessionsByDay')
    );
});

test('admin and coordinator can view printable rundown document without authorization error', function () {
    $event = Event::firstOrFail();

    $response = $this->actingAs($this->admin)->get("/admin/event/{$event->id}/rundown/cetak");

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Events/PrintRundown')
        ->where('event.id', $event->id)
        ->has('sessions')
    );
});

test('admin can move session to another day and adjust schedule', function () {
    $event = Event::firstOrFail();
    $session = $event->sessions()->where('session_type_code', '!=', 'KEHADIRAN_AWAL')->firstOrFail();

    $targetDay = $session->day_number === 1 ? 2 : 1;

    $this->actingAs($this->admin)->post("/admin/event/{$event->id}/sesi/{$session->id}/reschedule", [
        'day_number' => $targetDay,
        'start_time' => '10:00',
        'end_time' => '11:30',
        'status' => 'scheduled',
    ])->assertSessionHasNoErrors();

    $session->refresh();
    expect($session->day_number)->toBe($targetDay)
        ->and(substr($session->start_time, 0, 5))->toBe('10:00')
        ->and(substr($session->end_time, 0, 5))->toBe('11:30');
});

test('admin can print QR filtered to a specific session', function () {
    $event = Event::firstOrFail();
    $session = $event->sessions()->where('session_type_code', '!=', 'KEHADIRAN_AWAL')->firstOrFail();
    $session->update(['attendance_setting' => 'none']);

    $response = $this->actingAs($this->admin)->get("/admin/event/{$event->id}/absensi/cetak-semua-qr?session_id={$session->id}");

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Events/PrintAllQr')
        ->has('sessions', 1)
        ->where('sessions.0.id', $session->id)
    );
});
