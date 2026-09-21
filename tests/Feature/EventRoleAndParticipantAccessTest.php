<?php

use App\Models\CbtExamAttempt;
use App\Models\CbtExamPackage;
use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\EventParticipant;
use App\Models\Participant;
use App\Models\ParticipantTrack;
use App\Models\User;
use App\Services\EventDocumentGenerator;
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

test('uploaded certificate and transcript are private and downloadable only by their enrolled participant', function () {
    Storage::fake('local');
    $admin = User::factory()->create(['role' => 'Admin']);
    $enrollment = EventParticipant::where('event_id', $this->event->id)
        ->where('participant_id', $this->participant->id)->firstOrFail();

    $this->actingAs($admin)->post("/admin/event/{$this->event->id}/peserta/{$enrollment->id}/sertifikat", [
        'certificate' => UploadedFile::fake()->create('sertifikat.pdf', 100, 'application/pdf'),
        'certificate_number' => 'SK-2026-001',
    ])->assertSessionHasNoErrors();
    $this->post("/admin/event/{$this->event->id}/peserta/{$enrollment->id}/transkrip", [
        'transcript' => UploadedFile::fake()->create('transkrip.pdf', 100, 'application/pdf'),
        'transcript_number' => 'TR-2026-001',
    ])->assertSessionHasNoErrors();

    $enrollment->refresh();
    Storage::disk('local')->assertExists($enrollment->certificate_file_path);
    Storage::disk('local')->assertExists($enrollment->transcript_file_path);
    expect($enrollment->certificate_number)->toBe('SK-2026-001');
    expect($enrollment->transcript_number)->toBe('TR-2026-001');

    $this->actingAs($this->participantUser)->get("/event/{$this->event->slug}/sertifikat")
        ->assertOk();
    $this->get("/event/{$this->event->slug}/transkrip")->assertOk();
    $this->get('/sertifikat-saya')->assertInertia(fn (Assert $page) => $page
        ->component('Event/Certificates')
        ->has('certificates', 1)
        ->where('certificates.0.certificate_number', 'SK-2026-001')
        ->where('certificates.0.transcript_number', 'TR-2026-001'));

    $otherUser = User::factory()->create(['role' => 'Peserta']);
    Participant::where('id', '!=', $this->participant->id)->firstOrFail()->update(['user_id' => $otherUser->id]);
    $this->actingAs($otherUser)->get("/event/{$this->event->slug}/sertifikat")
        ->assertNotFound();
    $this->get("/event/{$this->event->slug}/transkrip")->assertNotFound();
    $this->get('/sertifikat-saya')->assertInertia(fn (Assert $page) => $page->has('certificates', 0));
});

test('certificate and transcript can be generated from an available track template', function () {
    Storage::fake('local');
    $admin = User::factory()->create(['role' => 'Admin']);
    $enrollment = EventParticipant::query()
        ->where('event_id', $this->event->id)
        ->where('track_code', 'PN')
        ->with('participant')
        ->firstOrFail();

    $this->actingAs($admin)->post("/admin/event/{$this->event->id}/peserta/{$enrollment->id}/sertifikat/generate", [
        'certificate_number' => '002/PLT-NAS/IX/2026',
    ])->assertSessionHasNoErrors();

    $this->post("/admin/event/{$this->event->id}/peserta/{$enrollment->id}/transkrip/generate", [
        'transcript_number' => '002/PLT-NAS/IX/2026',
    ])->assertSessionHasNoErrors();

    $enrollment->refresh();
    Storage::disk('local')->assertExists($enrollment->certificate_file_path);
    Storage::disk('local')->assertExists($enrollment->transcript_file_path);

    $certificate = Storage::disk('local')->get($enrollment->certificate_file_path);
    $transcript = Storage::disk('local')->get($enrollment->transcript_file_path);

    expect($certificate)
        ->toStartWith('%PDF-1.4')
        ->toContain('002/PLT-NAS/IX/2026')
        ->toContain($enrollment->participant->name)
        ->toContain('(IV) Tj')
        ->not->toContain('(IV DAN) Tj')
        ->and($transcript)
        ->toStartWith('%PDF-1.4')
        ->toContain('002/PLT-NAS/IX/2026');
    expect($enrollment->certificate_issued_at?->toDateString())->toBe($this->event->end_date?->toDateString());
    expect($enrollment->transcript_issued_at?->toDateString())->toBe($this->event->end_date?->toDateString());
});

test('pelatih daerah documents use the regional title and event modules', function () {
    Storage::fake('local');
    $admin = User::factory()->create(['role' => 'Admin']);
    $enrollment = EventParticipant::query()
        ->where('event_id', $this->event->id)
        ->where('track_code', 'PD')
        ->firstOrFail();
    $enrollment->update(['certificate_number' => null, 'transcript_number' => null]);

    $this->actingAs($admin)->get("/admin/event/{$this->event->id}?tab=sertifikat")
        ->assertInertia(fn (Assert $page) => $page->where('participants', fn ($participants) => collect($participants)->contains(
            fn ($participant) => $participant['id'] === $enrollment->id
                && $participant['can_generate_certificate']
                && $participant['can_generate_transcript']
        )));

    $this->post("/admin/event/{$this->event->id}/peserta/{$enrollment->id}/sertifikat/generate")
        ->assertSessionHasNoErrors();
    $this->post("/admin/event/{$this->event->id}/peserta/{$enrollment->id}/transkrip/generate")
        ->assertSessionHasNoErrors();

    $enrollment->refresh();
    expect($enrollment->certificate_number)->toBe('001/PLT-DRH/IX/2026')
        ->and($enrollment->transcript_number)->toBe('001/PLT-DRH/IX/2026');
    expect(Storage::disk('local')->get($enrollment->certificate_file_path))
        ->toContain('SERTIFIKAT PELATIH SHORINJI KEMPO DAERAH');
    expect(Storage::disk('local')->get($enrollment->transcript_file_path))
        ->toContain('PENATARAN PELATIH DAERAH')
        ->toContain('TOTAL BEBAN PENATARAN');
});

test('dual tracks generate and expose separate penguji and wasit document pairs', function () {
    Storage::fake('local');
    $admin = User::factory()->create(['role' => 'Admin']);

    foreach (['PWAD' => ['PED', 'WAD'], 'PWAN' => ['PEN', 'WAN']] as $enrollmentTrack => $documentTracks) {
        $enrollment = EventParticipant::query()
            ->where('event_id', $this->event->id)
            ->where('track_code', $enrollmentTrack)
            ->with('participant')
            ->firstOrFail();

        $this->actingAs($admin)->get("/admin/event/{$this->event->id}?tab=sertifikat")
            ->assertInertia(fn (Assert $page) => $page->where('participants', fn ($participants) => collect($participants)->contains(
                fn ($participant) => $participant['id'] === $enrollment->id
                    && count($participant['document_variants']) === 2
                    && $participant['document_variants'][0]['track_code'] === $documentTracks[0]
                    && $participant['document_variants'][1]['track_code'] === $documentTracks[1]
            )));

        foreach ($documentTracks as $documentTrack) {
            $this->post("/admin/event/{$this->event->id}/peserta/{$enrollment->id}/sertifikat/generate", [
                'document_track' => $documentTrack,
            ])->assertSessionHasNoErrors();
            $this->post("/admin/event/{$this->event->id}/peserta/{$enrollment->id}/transkrip/generate", [
                'document_track' => $documentTrack,
            ])->assertSessionHasNoErrors();
        }

        $enrollment->refresh();
        $pengujiSuffix = $documentTracks[0] === 'PED' ? 'PGJ-DRH' : 'PGJ-NAS';
        $wasitSuffix = $documentTracks[1] === 'WAD' ? 'WST-DRH' : 'WST-NAS';
        expect($enrollment->certificate_number)->toContain("/{$pengujiSuffix}/")
            ->and($enrollment->secondary_certificate_number)->toContain("/{$wasitSuffix}/")
            ->and($enrollment->transcript_number)->toBe($enrollment->certificate_number)
            ->and($enrollment->secondary_transcript_number)->toBe($enrollment->secondary_certificate_number)
            ->and($enrollment->certificate_file_path)->not->toBe($enrollment->secondary_certificate_file_path)
            ->and($enrollment->transcript_file_path)->not->toBe($enrollment->secondary_transcript_file_path);

        foreach (['certificate_file_path', 'transcript_file_path', 'secondary_certificate_file_path', 'secondary_transcript_file_path'] as $pathField) {
            Storage::disk('local')->assertExists($enrollment->{$pathField});
        }

        $user = User::factory()->create(['role' => 'Peserta']);
        $enrollment->participant->update(['user_id' => $user->id]);
        $this->actingAs($user)->get('/sertifikat-saya')
            ->assertInertia(fn (Assert $page) => $page->where('certificates', fn ($certificates) => collect($certificates)->contains(
                fn ($certificate) => $certificate['id'] === $enrollment->id
                    && count($certificate['document_variants']) === 2
                    && $certificate['document_variants'][0]['certificate_download_url']
                    && $certificate['document_variants'][0]['transcript_download_url']
                    && $certificate['document_variants'][1]['certificate_download_url']
                    && $certificate['document_variants'][1]['transcript_download_url']
            )));
        $this->get("/event/{$this->event->slug}/sertifikat?document_track={$documentTracks[1]}")->assertOk();
        $this->get("/event/{$this->event->slug}/transkrip?document_track={$documentTracks[1]}")->assertOk();

        $this->actingAs($admin)->delete("/admin/event/{$this->event->id}/peserta/{$enrollment->id}/transkrip?document_track={$documentTracks[1]}")
            ->assertSessionHasNoErrors();
        $enrollment->refresh();
        expect($enrollment->secondary_transcript_file_path)->toBeNull()
            ->and($enrollment->secondary_transcript_number)->not->toBeNull()
            ->and($enrollment->transcript_file_path)->not->toBeNull();
    }
});

test('certificate and transcript PDFs can be removed without losing their official numbers', function () {
    Storage::fake('local');
    $admin = User::factory()->create(['role' => 'Admin']);
    $enrollment = EventParticipant::query()
        ->where('event_id', $this->event->id)
        ->where('track_code', 'PN')
        ->firstOrFail();

    $this->actingAs($admin)->post("/admin/event/{$this->event->id}/peserta/{$enrollment->id}/sertifikat/generate")
        ->assertSessionHasNoErrors();
    $this->post("/admin/event/{$this->event->id}/peserta/{$enrollment->id}/transkrip/generate")
        ->assertSessionHasNoErrors();

    $enrollment->refresh();
    $certificatePath = $enrollment->certificate_file_path;
    $transcriptPath = $enrollment->transcript_file_path;
    $certificateNumber = $enrollment->certificate_number;
    $transcriptNumber = $enrollment->transcript_number;

    $this->delete("/admin/event/{$this->event->id}/peserta/{$enrollment->id}/sertifikat")
        ->assertSessionHasNoErrors();
    $this->delete("/admin/event/{$this->event->id}/peserta/{$enrollment->id}/transkrip")
        ->assertSessionHasNoErrors();

    $enrollment->refresh();
    Storage::disk('local')->assertMissing($certificatePath);
    Storage::disk('local')->assertMissing($transcriptPath);
    expect($enrollment->certificate_file_path)->toBeNull()
        ->and($enrollment->transcript_file_path)->toBeNull()
        ->and($enrollment->certificate_issued_at)->toBeNull()
        ->and($enrollment->transcript_issued_at)->toBeNull()
        ->and($enrollment->certificate_number)->toBe($certificateNumber)
        ->and($enrollment->transcript_number)->toBe($transcriptNumber);

    $this->delete("/admin/event/{$this->event->id}/peserta/{$enrollment->id}/sertifikat")->assertNotFound();
});

test('document deletion is restricted to event managers and participants in that event', function () {
    Storage::fake('local');
    $enrollment = EventParticipant::query()->where('event_id', $this->event->id)->firstOrFail();
    $path = "event-certificates/{$this->event->id}/{$enrollment->id}/existing.pdf";
    Storage::disk('local')->put($path, '%PDF-1.4');
    $enrollment->update(['certificate_file_path' => $path, 'certificate_number' => '001/PLT-NAS/IX/2026']);

    $organizer = User::factory()->create(['role' => 'Penyelenggara']);
    $this->actingAs($organizer)->delete("/admin/event/{$this->event->id}/peserta/{$enrollment->id}/sertifikat")
        ->assertForbidden();

    $otherEvent = $this->event->replicate();
    $otherEvent->slug = 'event-dokumen-lain';
    $otherEvent->save();
    $admin = User::factory()->create(['role' => 'Admin']);
    $this->actingAs($admin)->delete("/admin/event/{$otherEvent->id}/peserta/{$enrollment->id}/sertifikat")
        ->assertNotFound();

    Storage::disk('local')->assertExists($path);
    expect($enrollment->fresh()->certificate_file_path)->toBe($path);
});

test('automatic document generation reports a server-side template failure as a form error', function () {
    Storage::fake('local');
    $admin = User::factory()->create(['role' => 'Admin']);
    $enrollment = EventParticipant::query()
        ->where('event_id', $this->event->id)
        ->where('track_code', 'PN')
        ->firstOrFail();
    $generator = Mockery::mock(EventDocumentGenerator::class)->makePartial();
    $generator->shouldReceive('generateCertificate')->once()->andThrow(new RuntimeException('Template tidak dapat dibaca.'));
    $generator->shouldReceive('generateTranscript')->once()->andThrow(new RuntimeException('Template tidak dapat dibaca.'));
    app()->instance(EventDocumentGenerator::class, $generator);

    $this->actingAs($admin)->post("/admin/event/{$this->event->id}/peserta/{$enrollment->id}/sertifikat/generate")
        ->assertSessionHasErrors('certificate_number');
    $this->actingAs($admin)->post("/admin/event/{$this->event->id}/peserta/{$enrollment->id}/transkrip/generate")
        ->assertSessionHasErrors('transcript_number');

    expect($enrollment->fresh()->certificate_file_path)->toBeNull()
        ->and($enrollment->transcript_file_path)->toBeNull();
});

test('automatic document generation suggests a number from the event and uses it when the field is empty', function () {
    Storage::fake('local');
    $admin = User::factory()->create(['role' => 'Admin']);
    $enrollment = EventParticipant::query()
        ->where('event_id', $this->event->id)
        ->where('track_code', 'WAD')
        ->firstOrFail();
    $enrollment->update(['certificate_number' => null, 'transcript_number' => null]);

    $this->actingAs($admin)->get("/admin/event/{$this->event->id}?tab=sertifikat")
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Events/Show')
            ->where('participants', fn ($participants) => collect($participants)->contains(
                fn ($participant) => $participant['id'] === $enrollment->id
                    && $participant['suggested_certificate_number'] === '001/WST-DRH/IX/2026'
                    && $participant['suggested_transcript_number'] === '001/WST-DRH/IX/2026'
                    && $participant['can_generate_certificate']
                    && $participant['can_generate_transcript']
            )));

    $this->post("/admin/event/{$this->event->id}/peserta/{$enrollment->id}/sertifikat/generate")
        ->assertSessionHasNoErrors();
    $this->post("/admin/event/{$this->event->id}/peserta/{$enrollment->id}/transkrip/generate")
        ->assertSessionHasNoErrors();

    $enrollment->refresh();
    expect($enrollment->certificate_number)->toBe('001/WST-DRH/IX/2026')
        ->and($enrollment->transcript_number)->toBe('001/WST-DRH/IX/2026');
    Storage::disk('local')->assertExists($enrollment->certificate_file_path);
    Storage::disk('local')->assertExists($enrollment->transcript_file_path);
    expect(Storage::disk('local')->get($enrollment->certificate_file_path))
        ->toContain('001/WST-DRH/IX/2026')
        ->toContain($enrollment->participant->name)
        ->toContain($enrollment->participant->kenshi_id_number)
        ->toContain($enrollment->participant->origin_province);
});

test('automatic certificate generation keeps an existing official number when the request omits it', function () {
    Storage::fake('local');
    $admin = User::factory()->create(['role' => 'Admin']);
    $enrollment = EventParticipant::query()
        ->where('event_id', $this->event->id)
        ->where('track_code', 'PN')
        ->firstOrFail();

    $this->actingAs($admin)->post("/admin/event/{$this->event->id}/peserta/{$enrollment->id}/sertifikat/generate")
        ->assertSessionHasNoErrors();

    $enrollment->refresh();
    expect($enrollment->certificate_number)->toBe('SK-PN-2026-002');
    Storage::disk('local')->assertExists($enrollment->certificate_file_path);
    expect(Storage::disk('local')->get($enrollment->certificate_file_path))->toContain('SK-PN-2026-002');
});

test('admin defaults set the code and initial sequence for all six document categories', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $numbers = ['PD' => 'PLT-DRH', 'PN' => 'PLT-NAS', 'PED' => 'PGJ-DRH', 'PEN' => 'PGJ-NAS', 'WAD' => 'WST-LOK', 'WAN' => 'WST-NAS'];
    $payload = ['settings_group' => 'certificate_numbers'];

    foreach ($numbers as $trackCode => $prefix) {
        $payload['document_number_'.strtolower($trackCode).'_prefix'] = $prefix;
        $payload['document_number_'.strtolower($trackCode).'_start'] = $trackCode === 'WAD' ? 50 : 1;
    }

    $this->actingAs($admin)->put('/admin/pengaturan', $payload)->assertSessionHasNoErrors();

    $this->assertDatabaseHas('settings', ['key' => 'document_number_wad_prefix', 'value' => 'WST-LOK']);
    $this->assertDatabaseHas('settings', ['key' => 'document_number_wad_start', 'value' => '50']);
    $this->get('/admin/pengaturan')->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Settings/Index')
        ->where('documentNumberDefaults.WAD.prefix', 'WST-LOK')
        ->where('documentNumberLabels.PD', 'Sertifikat Pelatih Daerah'));

    $enrollment = EventParticipant::query()->where('event_id', $this->event->id)->where('track_code', 'WAD')->firstOrFail();
    $enrollment->update(['certificate_number' => null]);
    $this->get("/admin/event/{$this->event->id}?tab=sertifikat")
        ->assertInertia(fn (Assert $page) => $page->where('participants', fn ($participants) => collect($participants)->contains(
            fn ($participant) => $participant['id'] === $enrollment->id
                && $participant['suggested_certificate_number'] === '050/WST-LOK/IX/2026'
        )));

    $this->put('/admin/pengaturan', array_replace($payload, ['document_number_wad_prefix' => 'WST/INVALID']))
        ->assertSessionHasErrors('document_number_wad_prefix');
    $this->assertDatabaseHas('settings', ['key' => 'document_number_wad_prefix', 'value' => 'WST-LOK']);
});

test('event number settings override admin defaults and preserve existing issued numbers', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $numbers = [];

    foreach (['PD', 'PN', 'PED', 'PEN', 'WAD', 'WAN'] as $trackCode) {
        $numbers[$trackCode] = ['prefix' => '', 'start' => ''];
    }

    $numbers['WAD'] = ['prefix' => 'WST-JABAR', 'start' => 7];
    $this->actingAs($admin)->put("/admin/event/{$this->event->id}/nomor-dokumen", ['numbers' => $numbers])
        ->assertSessionHasNoErrors();

    expect($this->event->fresh()->document_number_settings)->toBe(['WAD' => ['prefix' => 'WST-JABAR', 'start' => 7]]);

    $enrollment = EventParticipant::query()->where('event_id', $this->event->id)->where('track_code', 'WAD')->firstOrFail();
    $enrollment->update(['certificate_number' => null, 'transcript_number' => null]);
    $nextParticipant = Participant::create(['name' => 'Wasit Kedua', 'email' => 'wasit-kedua@example.test']);
    $nextEnrollment = EventParticipant::create([
        'event_id' => $this->event->id,
        'participant_id' => $nextParticipant->id,
        'track_code' => 'WAD',
        'admin_status' => 'verified',
    ]);
    $this->get("/admin/event/{$this->event->id}?tab=sertifikat")
        ->assertInertia(fn (Assert $page) => $page
            ->where('documentNumberOverrides.WAD.prefix', 'WST-JABAR')
            ->where('participants', fn ($participants) => collect($participants)->contains(
                fn ($participant) => $participant['id'] === $enrollment->id
                    && $participant['suggested_certificate_number'] === '007/WST-JABAR/IX/2026'
                    && $participant['suggested_transcript_number'] === '007/WST-JABAR/IX/2026'
            ) && collect($participants)->contains(
                fn ($participant) => $participant['id'] === $nextEnrollment->id
                    && $participant['suggested_certificate_number'] === '010/WST-JABAR/IX/2026'
            )));

    $issuedEnrollment = EventParticipant::query()->where('event_id', $this->event->id)->where('track_code', 'PN')->firstOrFail();
    $this->get("/admin/event/{$this->event->id}?tab=sertifikat")
        ->assertInertia(fn (Assert $page) => $page->where('participants', fn ($participants) => collect($participants)->contains(
            fn ($participant) => $participant['id'] === $issuedEnrollment->id
                && $participant['suggested_certificate_number'] === 'SK-PN-2026-002'
                && $participant['configured_certificate_number'] === '001/PLT-NAS/IX/2026'
        )));

    $this->post("/admin/event/{$this->event->id}/peserta/{$enrollment->id}/sertifikat/generate")
        ->assertSessionHasNoErrors();
    expect($enrollment->fresh()->certificate_number)->toBe('007/WST-JABAR/IX/2026');

    $numbers['WAD'] = ['prefix' => 'WST-BARU', 'start' => 10];
    $this->put("/admin/event/{$this->event->id}/nomor-dokumen", ['numbers' => $numbers])
        ->assertSessionHasNoErrors();
    expect($enrollment->fresh()->certificate_number)->toBe('007/WST-JABAR/IX/2026');
});

test('pelatih daerah uses the event month and year for suggested number and supports generation', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $enrollment = EventParticipant::query()->where('event_id', $this->event->id)->where('track_code', 'PD')->firstOrFail();
    $enrollment->update(['certificate_number' => null]);
    $this->event->update(['end_date' => '2027-02-15']);

    $this->actingAs($admin)->get("/admin/event/{$this->event->id}?tab=sertifikat")
        ->assertInertia(fn (Assert $page) => $page->where('participants', fn ($participants) => collect($participants)->contains(
            fn ($participant) => $participant['id'] === $enrollment->id
                && $participant['suggested_certificate_number'] === '001/PLT-DRH/II/2027'
                && $participant['can_generate_certificate']
        )));
});

test('event number settings reject invalid codes and unrelated organizers', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $numbers = [];

    foreach (['PD', 'PN', 'PED', 'PEN', 'WAD', 'WAN'] as $trackCode) {
        $numbers[$trackCode] = ['prefix' => '', 'start' => ''];
    }

    $numbers['WAD']['prefix'] = 'WST/INVALID';
    $this->actingAs($admin)->put("/admin/event/{$this->event->id}/nomor-dokumen", ['numbers' => $numbers])
        ->assertSessionHasErrors('numbers.WAD.prefix');
    expect($this->event->fresh()->document_number_settings)->toBeNull();

    $numbers['WAD']['prefix'] = 'WST-OK';
    $organizer = User::factory()->create(['role' => 'Penyelenggara']);
    $this->actingAs($organizer)->put("/admin/event/{$this->event->id}/nomor-dokumen", ['numbers' => $numbers])
        ->assertForbidden();
    expect($this->event->fresh()->document_number_settings)->toBeNull();
});

test('automatic document generation rejects an invalid or mismatched document track', function () {
    Storage::fake('local');
    $admin = User::factory()->create(['role' => 'Admin']);
    $unsupportedEnrollment = EventParticipant::query()
        ->where('event_id', $this->event->id)
        ->where('track_code', 'PD')
        ->firstOrFail();

    $this->actingAs($admin)->post("/admin/event/{$this->event->id}/peserta/{$unsupportedEnrollment->id}/sertifikat/generate", [
        'certificate_number' => '001/PLT-DRH/IX/2026',
        'document_track' => 'WAD',
    ])->assertSessionHasErrors('certificate_number');

    $invalidTrackEnrollment = EventParticipant::query()
        ->where('event_id', $this->event->id)
        ->where('track_code', 'WAD')
        ->firstOrFail();
    $invalidTrackEnrollment->update(['track_code' => 'XYZ']);

    $this->post("/admin/event/{$this->event->id}/peserta/{$invalidTrackEnrollment->id}/transkrip/generate")
        ->assertSessionHasErrors('transcript_number');

    expect($unsupportedEnrollment->fresh()->certificate_file_path)->toBeNull();
    expect($invalidTrackEnrollment->fresh()->transcript_file_path)->toBeNull();
});

test('certificate and transcript uploads reject non PDF files and unrelated organizers', function () {
    Storage::fake('local');
    $admin = User::factory()->create(['role' => 'Admin']);
    $enrollment = EventParticipant::where('event_id', $this->event->id)
        ->where('participant_id', $this->participant->id)->firstOrFail();

    $this->actingAs($admin)->post("/admin/event/{$this->event->id}/peserta/{$enrollment->id}/sertifikat", [
        'certificate' => UploadedFile::fake()->create('catatan.txt', 10, 'text/plain'),
    ])->assertSessionHasErrors('certificate');
    expect($enrollment->fresh()->certificate_file_path)->toBeNull();

    $this->post("/admin/event/{$this->event->id}/peserta/{$enrollment->id}/transkrip", [
        'transcript' => UploadedFile::fake()->create('catatan.txt', 10, 'text/plain'),
    ])->assertSessionHasErrors('transcript');
    expect($enrollment->fresh()->transcript_file_path)->toBeNull();

    $organizer = User::factory()->create(['role' => 'Penyelenggara']);
    $this->actingAs($organizer)->post("/admin/event/{$this->event->id}/peserta/{$enrollment->id}/sertifikat", [
        'certificate' => UploadedFile::fake()->create('sertifikat.pdf', 100, 'application/pdf'),
    ])->assertForbidden();
    $this->post("/admin/event/{$this->event->id}/peserta/{$enrollment->id}/transkrip", [
        'transcript' => UploadedFile::fake()->create('transkrip.pdf', 100, 'application/pdf'),
    ])->assertForbidden();
});
