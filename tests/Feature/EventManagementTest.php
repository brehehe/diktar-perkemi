<?php

use App\Actions\Events\SaveEvent;
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
