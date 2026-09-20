<?php

use App\Models\CbtExamAttempt;
use App\Models\CbtExamPackage;
use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\EventParticipant;
use App\Models\Participant;
use App\Models\ParticipantTrack;
use App\Models\User;
use Database\Seeders\EventManagementSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(EventManagementSeeder::class);
    $this->event = Event::firstOrFail();
    $this->participant = Participant::firstOrFail();
    $this->participantUser = User::factory()->create(['role' => 'Peserta']);
    $this->participant->update(['user_id' => $this->participantUser->id]);
});

test('guest and unrelated accounts cannot enter a participant event', function () {
    $this->get('/event-saya')->assertRedirect('/login');
    $this->get("/event/{$this->event->slug}/ruang-belajar")->assertRedirect('/login');

    $otherUser = User::factory()->create(['role' => 'Peserta']);
    $this->actingAs($otherUser)
        ->get("/event/{$this->event->slug}/ruang-belajar?preview_participant=".EventParticipant::first()->id)
        ->assertForbidden();
});

test('participant event list uses only verified enrollments belonging to the account', function () {
    $otherEvent = $this->event->replicate();
    $otherEvent->slug = 'event-lain';
    $otherEvent->save();

    EventParticipant::create([
        'event_id' => $otherEvent->id,
        'participant_id' => $this->participant->id,
        'track_code' => EventParticipant::first()->track_code,
        'admin_status' => 'pending',
    ]);

    $this->actingAs($this->participantUser)->get('/event-saya')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Event/Index')
            ->has('events', 1)
            ->where('events.0.id', $this->event->id)
        );

    $this->get("/event/{$otherEvent->slug}/ruang-belajar")->assertForbidden();
});

test('event tracks can be created and assigned only within their event', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $otherEvent = $this->event->replicate();
    $otherEvent->slug = 'jalur-event-lain';
    $otherEvent->save();

    $this->actingAs($admin)->post("/admin/event/{$this->event->id}/jalur", [
        'code' => 'pelatih-khusus',
        'name' => 'Pelatih Khusus',
    ])->assertSessionHasNoErrors();

    $track = ParticipantTrack::where('code', 'PELATIH-KHUSUS')->firstOrFail();
    expect($track->event_id)->toBe($this->event->id);

    $participant = Participant::create(['name' => 'Peserta Jalur Khusus', 'email' => 'jalur-khusus@example.test']);
    $this->post("/admin/event/{$otherEvent->id}/peserta", [
        'participant_id' => $participant->id,
        'participant_track_id' => $track->id,
        'admin_status' => 'verified',
    ])->assertSessionHasErrors('participant_track_id');

    $this->post("/admin/event/{$this->event->id}/peserta", [
        'participant_id' => $participant->id,
        'participant_track_id' => $track->id,
        'admin_status' => 'verified',
    ])->assertSessionHasNoErrors();

    $this->assertDatabaseHas('event_participants', [
        'event_id' => $this->event->id,
        'participant_id' => $participant->id,
        'track_code' => 'PELATIH-KHUSUS',
    ]);

    $this->get('/admin/master/jalur')->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Master/Tracks')
        ->where('tracks', fn ($tracks) => collect($tracks)->contains(fn ($item) => $item['id'] === $track->id && $item['event_id'] === $this->event->id))
    );
});

test('diktar can read all event references while organizers and participants cannot', function () {
    $diktar = User::factory()->create(['role' => 'Diktar']);
    $organizer = User::factory()->create(['role' => 'Penyelenggara']);

    foreach (['modul', 'modul-event', 'modul-soal', 'bank-soal', 'soal-event', 'ujian-event', 'pemateri', 'peserta', 'jalur', 'legenda'] as $tab) {
        $this->actingAs($diktar)->get("/admin/referensi-event?tab={$tab}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/EventReferences')
                ->where('activeTab', $tab)
                ->has('items.data')
            );
    }

    $this->actingAs($organizer)->get('/admin/referensi-event')->assertForbidden();
    $this->actingAs($this->participantUser)->get('/admin/referensi-event')->assertForbidden();
    $this->actingAs($this->participantUser)->get('/admin/master/modul-pembelajaran')->assertForbidden();
    $this->actingAs($this->participantUser)->get('/admin/master/modul-pembelajaran/format-impor')->assertForbidden();

    // Diktar can access master learning modules and templates
    $this->actingAs($diktar)->get('/admin/master/modul-pembelajaran')->assertOk();
    $this->actingAs($diktar)->get('/admin/master/modul-pembelajaran/format-impor')->assertOk();

    // Organizer can access master learning modules and templates, but cannot access portal admin settings
    $this->actingAs($organizer)->get('/admin/master/modul-pembelajaran')->assertOk();
    $this->actingAs($organizer)->get('/admin/master/modul-pembelajaran/format-impor')->assertOk();
    $this->actingAs($organizer)->get('/admin/pengguna')->assertForbidden();
    $this->actingAs($organizer)->get('/admin/koleksi')->assertForbidden();
});

test('organizer can create participants only in their assigned event', function () {
    $organizer = User::factory()->create(['role' => 'Penyelenggara']);
    $this->event->update(['responsible_user_id' => $organizer->id]);
    $otherEvent = $this->event->replicate();
    $otherEvent->slug = 'event-tanpa-tugas-organizer';
    $otherEvent->responsible_user_id = null;
    $otherEvent->save();
    $track = ParticipantTrack::whereNull('event_id')->firstOrFail();

    $data = [
        'name' => 'Peserta Penyelenggara',
        'email' => 'peserta-penyelenggara@example.test',
        'origin' => 'Jawa Timur',
        'participant_track_id' => $track->id,
        'admin_status' => 'verified',
    ];

    $this->actingAs($organizer)->post("/admin/event/{$otherEvent->id}/peserta-baru", $data)->assertForbidden();
    $this->assertDatabaseMissing('participants', ['email' => $data['email']]);
    $this->post("/admin/event/{$this->event->id}/peserta-baru", $data)->assertSessionHasNoErrors();
    $this->assertDatabaseHas('participants', ['email' => $data['email']]);
});

test('admin can link a participant to one matching participant account', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $user = User::factory()->create(['role' => 'Peserta']);
    $participant = Participant::create([
        'name' => $user->name,
        'email' => $user->email,
    ]);

    $this->actingAs($admin)->get("/admin/master/peserta/{$participant->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Participants/Show')
            ->where('matchingUser.id', $user->id)
        );

    $this->patch("/admin/master/peserta/{$participant->id}/akun")->assertSessionHasNoErrors();
    expect($participant->fresh()->user_id)->toBe($user->id);

    $otherParticipant = Participant::create(['name' => 'Peserta lain', 'email' => $user->email]);
    $this->patch("/admin/master/peserta/{$otherParticipant->id}/akun")
        ->assertSessionHasErrors('account');
    expect($otherParticipant->fresh()->user_id)->toBeNull();
});

test('failed participant can submit a PDF revision for review within the deadline', function () {
    Storage::fake('local');
    $package = CbtExamPackage::where('event_id', $this->event->id)->firstOrFail();
    $package->update(['revision_method' => 'paper', 'revision_deadline' => now()->addDay()]);
    $attempt = CbtExamAttempt::create([
        'cbt_exam_package_id' => $package->id,
        'event_id' => $this->event->id,
        'participant_id' => $this->participant->id,
        'user_id' => $this->participantUser->id,
        'attempt_number' => 1,
        'started_at' => now()->subHour(),
        'submitted_at' => now(),
        'status' => 'submitted',
        'total_score' => 60,
        'is_passed' => false,
    ]);
    $url = "/event/{$this->event->slug}/revisi/{$attempt->id}";

    $this->actingAs(User::factory()->create(['role' => 'Peserta']))
        ->post($url, ['paper' => UploadedFile::fake()->create('makalah.pdf', 100, 'application/pdf')])
        ->assertForbidden();

    $this->actingAs($this->participantUser)
        ->post($url, ['paper' => UploadedFile::fake()->create('makalah.pdf', 100, 'application/pdf')])
        ->assertSessionHasNoErrors();
    expect($attempt->fresh()->revision_status)->toBe('pending');
    Storage::disk('local')->assertExists($attempt->fresh()->revision_file_path);

    $this->get("/event/{$this->event->slug}/revisi/{$attempt->id}/baca")
        ->assertInertia(fn (Assert $page) => $page
            ->component('Event/RevisionReader')
            ->where('fileUrl', route('event.revision.mine.preview', [$this->event->slug, $attempt]))
        );
    $this->get("/event/{$this->event->slug}/revisi/{$attempt->id}/pratinjau")
        ->assertOk()
        ->assertHeader('Content-Type', 'application/pdf');

    $this->actingAs(User::factory()->create(['role' => 'Peserta']))
        ->get("/event/{$this->event->slug}/revisi/{$attempt->id}/baca")
        ->assertForbidden();
    $this->actingAs($this->participantUser);

    $this->post($url, ['paper' => UploadedFile::fake()->create('ulang.pdf', 100, 'application/pdf')])
        ->assertSessionHasErrors('paper');

    $admin = User::factory()->create(['role' => 'Admin']);
    $this->actingAs($admin)->get("/admin/event/{$this->event->id}")
        ->assertInertia(fn (Assert $page) => $page->has('examRevisions', 1)
            ->where('examRevisions.0.id', $attempt->id));
    $this->get("/admin/event/{$this->event->id}/revisi/{$attempt->id}/baca")
        ->assertInertia(fn (Assert $page) => $page->component('Event/RevisionReader'));
    $this->get("/admin/event/{$this->event->id}/revisi/{$attempt->id}/pratinjau")
        ->assertOk()
        ->assertHeader('Content-Type', 'application/pdf');
    $this->actingAs($admin)
        ->get("/admin/event/{$this->event->id}/revisi/{$attempt->id}/pdf")
        ->assertOk();
    $this->patch("/admin/event/{$this->event->id}/revisi/{$attempt->id}", ['revision_status' => 'rejected'])
        ->assertSessionHasNoErrors();
    expect($attempt->fresh()->revision_status)->toBe('rejected');

    $package->update(['revision_deadline' => now()->subMinute()]);
    $this->actingAs($this->participantUser)
        ->post($url, ['paper' => UploadedFile::fake()->create('terlambat.pdf', 100, 'application/pdf')])
        ->assertSessionHasErrors('paper');
});

test('revision settings require a deadline for PDF and multiple attempts for retry', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $base = [
        'title' => 'Ujian Revisi',
        'exam_type' => 'theory',
        'duration_minutes' => 60,
        'passing_score' => 65,
        'attempts_allowed' => 1,
        'status' => 'draft',
        'result_display' => 'immediate',
    ];

    $this->actingAs($admin)
        ->post("/admin/event/{$this->event->id}/cbt", [...$base, 'revision_method' => 'paper'])
        ->assertSessionHasErrors('revision_deadline');
    $this->post("/admin/event/{$this->event->id}/cbt", [...$base, 'revision_method' => 'retry'])
        ->assertSessionHasErrors('attempts_allowed');
});

test('participant cannot mark another enrollment as seen or access an unrelated exam package', function () {
    $otherEnrollment = EventParticipant::where('participant_id', '!=', $this->participant->id)->firstOrFail();

    $this->actingAs($this->participantUser)
        ->post("/event/{$this->event->slug}/welcome/seen", ['event_participant_id' => $otherEnrollment->id])
        ->assertRedirect();

    expect($otherEnrollment->fresh()->has_seen_welcome)->toBeFalse();
    expect(EventParticipant::where('participant_id', $this->participant->id)->first()->has_seen_welcome)->toBeTrue();

    $otherEvent = $this->event->replicate();
    $otherEvent->slug = 'event-ujian-lain';
    $otherEvent->save();
    EventParticipant::create([
        'event_id' => $otherEvent->id,
        'participant_id' => $this->participant->id,
        'track_code' => EventParticipant::first()->track_code,
        'admin_status' => 'verified',
        'checked_in_at' => now(),
    ]);

    $package = CbtExamPackage::where('event_id', $this->event->id)->firstOrFail();
    $this->get("/event/{$otherEvent->slug}/cbt/{$package->code}")->assertNotFound();
});

test('diktar sees every event while organizer sees only assigned event and manages master data', function () {
    $diktar = User::factory()->create(['role' => 'Diktar']);
    $organizer = User::factory()->create(['role' => 'Penyelenggara']);
    $otherOrganizer = User::factory()->create(['role' => 'Penyelenggara']);
    $this->event->update(['responsible_user_id' => $organizer->id]);

    $otherEvent = $this->event->replicate();
    $otherEvent->slug = 'event-tanggung-jawab-lain';
    $otherEvent->responsible_user_id = $otherOrganizer->id;
    $otherEvent->save();

    expect($diktar->can('view', $otherEvent))->toBeTrue()
        ->and($organizer->can('view', $this->event))->toBeTrue()
        ->and($organizer->can('view', $otherEvent))->toBeFalse()
        ->and($organizer->can('create', Event::class))->toBeTrue()
        ->and($organizer->can('delete', $this->event))->toBeFalse();

    $rundownSessions = $this->event->sessions()->count();
    $this->actingAs($organizer)->post("/admin/event/{$this->event->id}/kehadiran-awal")
        ->assertSessionHasNoErrors();

    $this->actingAs($organizer)->get('/admin')->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Admin/EventDashboard')
            ->where('stats.events', 1)
            ->where('events.0.sessions_count', $rundownSessions));
    $this->get('/admin/event')->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('stats.total_events', 1)->has('events.data', 1));
    $this->get("/admin/event/{$otherEvent->id}")->assertForbidden();
    $this->get('/admin/master/peserta')->assertOk();
    $this->get('/admin/pengguna')->assertForbidden();

    $this->actingAs($diktar)->get('/admin/event')->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('stats.total_events', 2));
});

test('organizer can create an event that is automatically assigned to their account', function () {
    $organizer = User::factory()->create(['role' => 'Penyelenggara']);

    $this->actingAs($organizer)->get('/admin/event/create')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Events/Create')
            ->where('canAssignOrganizer', false)
            ->where('currentOrganizer.id', $organizer->id)
        );

    $this->post('/admin/event', [
        'name' => 'Penataran Penyelenggara September',
        'description' => 'Event yang dibuat langsung oleh penyelenggara.',
        'start_date' => '2026-09-19',
        'end_date' => '2026-09-20',
        'place' => 'Dojo Penyelenggara',
        'organizer' => 'Pengprov PERKEMI',
        'responsible_user_id' => null,
        'total_effective_jp' => 12,
        'total_schedule_jp' => 14,
        'jp_duration_minutes' => 45,
        'participant_quota' => 40,
        'status' => 'draft',
    ])->assertSessionHasNoErrors();

    $createdEvent = Event::where('title', 'Penataran Penyelenggara September')->firstOrFail();
    expect($createdEvent->responsible_user_id)->toBe($organizer->id)
        ->and($createdEvent->total_days)->toBe(2);
    $this->get("/admin/event/{$createdEvent->id}")->assertOk();
});

test('learning room days and sessions follow the event date range', function () {
    $this->event->update([
        'start_date' => '2026-09-19',
        'end_date' => '2026-09-20',
        'duration_text' => '2 hari',
    ]);
    $staleSession = $this->event->sessions()->firstOrFail()->replicate();
    $staleSession->day_number = 4;
    $staleSession->session_number = 'Sesi lama hari keempat';
    $staleSession->session_type_code = 'PLENO';
    $staleSession->save();

    $admin = User::factory()->create(['role' => 'Admin']);
    $this->actingAs($admin)->post("/admin/event/{$this->event->id}/sesi", [
        'day_number' => 3,
        'session_number' => 'Sesi hari ketiga',
        'session_type_code' => 'PLENO',
        'start_time' => '08:00',
        'end_time' => '09:00',
        'duration_jp' => 1,
        'topic' => 'Tidak boleh tersimpan',
        'status' => 'scheduled',
    ])->assertSessionHasErrors('day_number');

    $this->actingAs($this->participantUser)
        ->get("/event/{$this->event->slug}/ruang-belajar")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Event/LearningRoom')
            ->where('event.total_days', 2)
            ->has('scheduleDays', 2)
            ->where('scheduleDays.0.day_number', 1)
            ->where('scheduleDays.1.day_number', 2)
            ->where('sessions', fn ($sessions) => ! collect($sessions)->contains('day_number', 4))
        );
});

test('participant proctoring incidents are validated, deduplicated, and visible to event managers', function () {
    $package = CbtExamPackage::where('event_id', $this->event->id)->firstOrFail();
    $attempt = CbtExamAttempt::create([
        'cbt_exam_package_id' => $package->id,
        'event_id' => $this->event->id,
        'participant_id' => $this->participant->id,
        'user_id' => $this->participantUser->id,
        'attempt_number' => 1,
        'started_at' => now(),
        'status' => 'in_progress',
        'answers' => [],
    ]);
    $url = "/event/{$this->event->slug}/cbt/{$package->code}/pengawasan";

    $this->actingAs(User::factory()->create(['role' => 'Peserta']))
        ->postJson($url, ['type' => 'tab_hidden'])
        ->assertForbidden();
    $this->actingAs($this->participantUser)
        ->postJson($url, ['type' => 'unsupported_event'])
        ->assertUnprocessable();
    $this->postJson($url, ['type' => 'tab_hidden', 'metadata' => ['visibility_state' => 'hidden']])
        ->assertCreated()
        ->assertJsonPath('incident_count', 1);
    $this->postJson($url, ['type' => 'tab_hidden'])
        ->assertOk()
        ->assertJsonPath('recorded', false);
    $this->travel(4)->seconds();
    $this->postJson($url, ['type' => 'navigation_attempt', 'metadata' => ['trigger' => 'browser_back']])
        ->assertCreated()
        ->assertJsonPath('incident_count', 2);

    $this->assertDatabaseCount('cbt_proctoring_events', 2);
    $this->assertDatabaseHas('cbt_proctoring_events', [
        'cbt_exam_attempt_id' => $attempt->id,
        'event_id' => $this->event->id,
        'participant_id' => $this->participant->id,
        'type' => 'tab_hidden',
        'severity' => 'warning',
    ]);

    $admin = User::factory()->create(['role' => 'Admin']);
    $this->actingAs($admin)->get("/admin/event/{$this->event->id}?tab=pengawasan")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Events/Show')
            ->has('proctoringEvents', 2)
            ->where('proctoringEvents.0.type', 'navigation_attempt')
            ->where('proctoringEvents.0.participant_name', $this->participant->name)
        );
});

test('nested session action cannot modify a session from another event', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $otherEvent = $this->event->replicate();
    $otherEvent->slug = 'event-sesi-lain';
    $otherEvent->save();
    $session = $this->event->sessions()->firstOrFail();
    $session->update(['is_attendance_open' => false]);

    $this->actingAs($admin)
        ->post("/admin/event/{$otherEvent->id}/sesi/{$session->id}/absensi/buka")
        ->assertNotFound();
    expect($session->fresh()->is_attendance_open)->toBeFalse();
});

test('event rooms are scoped to their event and linked to rundown sessions', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $otherEvent = $this->event->replicate();
    $otherEvent->slug = 'ruang-event-lain';
    $otherEvent->save();

    $this->actingAs($admin)
        ->post("/admin/event/{$this->event->id}/ruang", ['name' => 'Ruang Latihan'])
        ->assertSessionHasNoErrors();
    $room = $this->event->rooms()->where('name', 'Ruang Latihan')->firstOrFail();

    $this->post("/admin/event/{$this->event->id}/sesi", [
        'day_number' => 1,
        'session_number' => 'Ruang 1',
        'session_type_code' => 'PLENO',
        'start_time' => '08:00',
        'end_time' => '09:00',
        'duration_jp' => 1,
        'topic' => 'Latihan',
        'room' => 'Ruang Latihan',
        'status' => 'scheduled',
    ])->assertSessionHasNoErrors();

    expect($this->event->sessions()->where('session_number', 'Ruang 1')->firstOrFail()->event_room_id)->toBe($room->id);
    $this->delete("/admin/event/{$otherEvent->id}/ruang/{$room->id}")->assertNotFound();
    $this->delete("/admin/event/{$this->event->id}/ruang/{$room->id}")->assertSessionHasErrors('room');
});

test('event module form persists curriculum fields and publication status', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $trackCode = EventParticipant::where('event_id', $this->event->id)->firstOrFail()->track_code;

    $this->actingAs($admin)->post("/admin/event/{$this->event->id}/modul", [
        'code' => 'MOD-BARU',
        'title' => 'Modul tambahan',
        'target_tracks' => [$trackCode],
        'duration_jp' => 3,
        'delivery_method' => 'Diskusi',
        'description' => 'Deskripsi materi',
        'learning_indicators' => 'Mampu menjelaskan materi',
        'publication_status' => 'draft',
    ])->assertSessionHasNoErrors();

    $module = $this->event->modules()->where('code', 'MOD-BARU')->firstOrFail();
    expect($module->jp)->toBe(3)
        ->and($module->track_codes)->toBe([$trackCode])
        ->and($module->fulfillment_method)->toBe('Diskusi')
        ->and($module->learning_indicators)->toBe('Mampu menjelaskan materi')
        ->and($module->publication_status)->toBe('draft')
        ->and($module->is_published)->toBeFalse();

    $this->get("/admin/event/{$this->event->id}")
        ->assertInertia(fn (Assert $page) => $page->has('modules', $this->event->modules()->count()));
});

test('event PDF module stays private until the enrolled participant checks in', function () {
    Storage::fake('local');
    $admin = User::factory()->create(['role' => 'Admin']);
    $trackCode = EventParticipant::where('event_id', $this->event->id)->where('participant_id', $this->participant->id)->firstOrFail()->track_code;

    $this->actingAs($admin)->post("/admin/event/{$this->event->id}/modul", [
        'code' => 'MOD-PDF',
        'title' => 'PDF Penataran',
        'duration_jp' => 2,
        'target_tracks' => [$trackCode],
        'publication_status' => 'published',
        'source_type' => 'uploaded_pdf',
        'source_file' => UploadedFile::fake()->create('materi.pdf', 100, 'application/pdf'),
    ])->assertSessionHasNoErrors();

    $module = $this->event->modules()->where('code', 'MOD-PDF')->firstOrFail();
    Storage::disk('local')->assertExists($module->source_file_path);
    $this->get("/admin/event/{$this->event->id}/modul/{$module->id}/pdf")->assertOk();

    $enrollment = EventParticipant::where('event_id', $this->event->id)
        ->where('participant_id', $this->participant->id)->firstOrFail();
    $enrollment->update(['checked_in_at' => null]);
    $this->actingAs($this->participantUser)
        ->get("/event/{$this->event->slug}/materi/{$module->id}/pdf")
        ->assertForbidden();
    $enrollment->update(['checked_in_at' => now()]);
    $session = $this->event->sessions()->firstOrFail();
    $session->update(['event_module_id' => $module->id, 'attendance_setting' => 'check_in']);
    EventAttendance::where('event_session_id', $session->id)->where('participant_id', $this->participant->id)->delete();
    $this->get("/event/{$this->event->slug}/materi/{$module->id}/pdf")->assertForbidden();
    EventAttendance::create([
        'event_id' => $this->event->id,
        'event_session_id' => $session->id,
        'participant_id' => $this->participant->id,
        'attendance_type' => 'check_in',
        'status' => 'present',
        'checked_in_at' => now(),
        'method' => 'qr_scan',
    ]);
    $this->get("/event/{$this->event->slug}/materi/{$module->id}/pdf")->assertOk();

    $otherUser = User::factory()->create(['role' => 'Peserta']);
    $this->actingAs($otherUser)
        ->get("/event/{$this->event->slug}/materi/{$module->id}/pdf")
        ->assertForbidden();
});

test('event material links reject unsafe URLs', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $this->actingAs($admin)->post("/admin/event/{$this->event->id}/modul", [
        'code' => 'MOD-LINK',
        'title' => 'Tautan Materi',
        'duration_jp' => 2,
        'publication_status' => 'published',
        'source_type' => 'external_link',
        'source_url' => 'http://localhost/private',
    ])->assertSessionHasErrors('source_url');
});

test('event abbreviations stay scoped to their event', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $otherEvent = $this->event->replicate();
    $otherEvent->slug = 'legenda-event-lain';
    $otherEvent->save();

    $this->actingAs($admin)->post("/admin/event/{$this->event->id}/legenda", [
        'acronym' => 'KHS',
        'full_name' => 'Kehadiran Sesi',
        'category' => 'sesi',
    ])->assertSessionHasNoErrors();
    $legend = $this->event->legends()->where('acronym', 'KHS')->firstOrFail();

    $this->get("/admin/event/{$otherEvent->id}")
        ->assertInertia(fn (Assert $page) => $page->where('legends', fn ($legends) => ! collect($legends)->contains('id', $legend->id)));
    $this->delete("/admin/event/{$otherEvent->id}/legenda/{$legend->id}")->assertNotFound();
    $this->delete("/admin/event/{$this->event->id}/legenda/{$legend->id}")->assertSessionHasNoErrors();
});

test('event requirements and facilities are saved on the selected event', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $otherEvent = $this->event->replicate();
    $otherEvent->slug = 'ketentuan-event-lain';
    $otherEvent->save();
    $initialRequirements = count($this->event->requirements_checklist ?? []);
    $initialFacilities = count($this->event->facilities_checklist ?? []);

    $this->actingAs($admin)->post("/admin/event/{$this->event->id}/persyaratan", [
        'item' => 'Surat tugas peserta', 'mandatory' => true,
    ])->assertSessionHasNoErrors();
    $this->post("/admin/event/{$this->event->id}/fasilitas", [
        'name' => 'Ruang Ujian', 'status' => 'prepared',
    ])->assertSessionHasNoErrors();

    expect($this->event->fresh()->requirements_checklist[$initialRequirements]['item'])->toBe('Surat tugas peserta')
        ->and($this->event->fresh()->facilities_checklist[$initialFacilities]['name'])->toBe('Ruang Ujian')
        ->and(collect($otherEvent->fresh()->requirements_checklist ?? [])->pluck('item')->contains('Surat tugas peserta'))->toBeFalse();

    $this->delete("/admin/event/{$this->event->id}/persyaratan/{$initialRequirements}")->assertSessionHasNoErrors();
    $this->delete("/admin/event/{$this->event->id}/fasilitas/{$initialFacilities}")->assertSessionHasNoErrors();
    expect(count($this->event->fresh()->requirements_checklist ?? []))->toBe($initialRequirements)
        ->and(count($this->event->fresh()->facilities_checklist ?? []))->toBe($initialFacilities);
});

test('event speaker can be assigned only inside its event', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $otherEvent = $this->event->replicate();
    $otherEvent->slug = 'pemateri-event-lain';
    $otherEvent->save();

    $this->actingAs($admin)->post("/admin/event/{$this->event->id}/pemateri", [
        'name' => 'Pemateri Khusus', 'type' => 'external',
    ])->assertSessionHasNoErrors();
    $speaker = $this->event->ownedSpeakers()->where('name', 'Pemateri Khusus')->firstOrFail();

    $sessionData = [
        'day_number' => 1,
        'session_number' => 'Materi pemateri',
        'session_type_code' => 'PLENO',
        'speaker_id' => $speaker->id,
        'start_time' => '08:00',
        'end_time' => '09:00',
        'duration_jp' => 1,
        'topic' => 'Paparan',
        'status' => 'scheduled',
    ];
    $this->post("/admin/event/{$otherEvent->id}/sesi", $sessionData)->assertSessionHasErrors('speaker_id');
    $this->post("/admin/event/{$this->event->id}/sesi", $sessionData)->assertSessionHasNoErrors();
    $this->delete("/admin/event/{$this->event->id}/pemateri/{$speaker->id}")->assertSessionHasErrors('speaker');
    $this->delete("/admin/event/{$otherEvent->id}/pemateri/{$speaker->id}")->assertNotFound();
});

test('daily QR attendance unlocks sessions for that day', function () {
    Carbon::setTestNow($this->event->start_date->copy()->setTime(8, 0));
    $admin = User::factory()->create(['role' => 'Admin']);

    $this->actingAs($admin)->post("/admin/event/{$this->event->id}/sesi", [
        'day_number' => 1,
        'session_number' => 'Kehadiran hari pertama',
        'session_type_code' => 'KEHADIRAN_HARIAN',
        'start_time' => '07:00',
        'end_time' => '09:00',
        'duration_jp' => 1,
        'topic' => 'Absensi awal hari pertama',
        'status' => 'scheduled',
    ])->assertSessionHasNoErrors();

    $daily = $this->event->sessions()->where('session_type_code', 'KEHADIRAN_HARIAN')->firstOrFail();
    $this->post("/admin/event/{$this->event->id}/sesi/{$daily->id}/absensi/buka")->assertSessionHasNoErrors();
    $daily->refresh();

    $session = $this->event->sessions()->where('id', '!=', $daily->id)->where('day_number', 1)->firstOrFail();
    EventAttendance::where('event_session_id', $session->id)->where('participant_id', $this->participant->id)->delete();
    $session->update(['is_attendance_open' => true, 'qr_token' => 'SESSION-TOKEN', 'attendance_close_at' => now()->addHour()]);
    EventParticipant::where('event_id', $this->event->id)->where('participant_id', $this->participant->id)
        ->update(['checked_in_at' => null]);

    $this->actingAs($this->participantUser)->post("/event/{$this->event->slug}/absensi/catat", [
        'token' => 'SESSION-TOKEN', 'attendance_type' => 'check_in',
    ])->assertRedirect()
        ->assertSessionHas('error', 'Catat kehadiran hari ke-1 sebelum melakukan absensi sesi ini.');

    $this->get("/event/{$this->event->slug}/ruang-belajar")
        ->assertInertia(fn (Assert $page) => $page
            ->where('participant.can_access_learning', false)
            ->has('myLearningModules', 0)
        );

    $this->post("/event/{$this->event->slug}/absensi/catat", [
        'token' => $daily->qr_token, 'attendance_type' => 'check_in',
    ])->assertRedirect("/event/{$this->event->slug}/ruang-belajar");

    $this->get("/event/{$this->event->slug}/ruang-belajar")
        ->assertInertia(fn (Assert $page) => $page->where('participant.can_access_learning', true));

    $this->post("/event/{$this->event->slug}/absensi/catat", [
        'token' => 'SESSION-TOKEN', 'attendance_type' => 'check_in',
    ])->assertRedirect("/event/{$this->event->slug}/ruang-belajar");

    $this->assertDatabaseHas('event_attendances', [
        'event_session_id' => $daily->id, 'participant_id' => $this->participant->id,
    ]);
    $this->assertDatabaseHas('event_attendances', [
        'event_session_id' => $session->id, 'participant_id' => $this->participant->id,
    ]);
    expect(EventParticipant::where('event_id', $this->event->id)->where('participant_id', $this->participant->id)->first()->checked_in_at)->not->toBeNull();
    Carbon::setTestNow();
});

test('uploaded certificate is private and downloadable only by its enrolled participant', function () {
    Storage::fake('local');
    $admin = User::factory()->create(['role' => 'Admin']);
    $enrollment = EventParticipant::where('event_id', $this->event->id)
        ->where('participant_id', $this->participant->id)->firstOrFail();

    $this->actingAs($admin)->post("/admin/event/{$this->event->id}/peserta/{$enrollment->id}/sertifikat", [
        'certificate' => UploadedFile::fake()->create('sertifikat.pdf', 100, 'application/pdf'),
        'certificate_number' => 'SK-2026-001',
    ])->assertSessionHasNoErrors();

    $enrollment->refresh();
    Storage::disk('local')->assertExists($enrollment->certificate_file_path);
    expect($enrollment->certificate_number)->toBe('SK-2026-001');

    $this->actingAs($this->participantUser)->get("/event/{$this->event->slug}/sertifikat")
        ->assertOk();
    $this->get('/sertifikat-saya')->assertInertia(fn (Assert $page) => $page
        ->component('Event/Certificates')
        ->has('certificates', 1)
        ->where('certificates.0.certificate_number', 'SK-2026-001'));

    $otherUser = User::factory()->create(['role' => 'Peserta']);
    Participant::where('id', '!=', $this->participant->id)->firstOrFail()->update(['user_id' => $otherUser->id]);
    $this->actingAs($otherUser)->get("/event/{$this->event->slug}/sertifikat")
        ->assertNotFound();
    $this->get('/sertifikat-saya')->assertInertia(fn (Assert $page) => $page->has('certificates', 0));
});

test('certificate upload rejects non PDF and unrelated organizer', function () {
    Storage::fake('local');
    $admin = User::factory()->create(['role' => 'Admin']);
    $enrollment = EventParticipant::where('event_id', $this->event->id)
        ->where('participant_id', $this->participant->id)->firstOrFail();

    $this->actingAs($admin)->post("/admin/event/{$this->event->id}/peserta/{$enrollment->id}/sertifikat", [
        'certificate' => UploadedFile::fake()->create('catatan.txt', 10, 'text/plain'),
    ])->assertSessionHasErrors('certificate');
    expect($enrollment->fresh()->certificate_file_path)->toBeNull();

    $organizer = User::factory()->create(['role' => 'Penyelenggara']);
    $this->actingAs($organizer)->post("/admin/event/{$this->event->id}/peserta/{$enrollment->id}/sertifikat", [
        'certificate' => UploadedFile::fake()->create('sertifikat.pdf', 100, 'application/pdf'),
    ])->assertForbidden();
});
