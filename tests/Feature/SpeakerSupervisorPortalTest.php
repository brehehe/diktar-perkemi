<?php

use App\Models\Event;
use App\Models\EventSession;
use App\Models\Material;
use App\Models\MaterialFile;
use App\Models\Speaker;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('local');
});

function createTestEvent(string $title = 'Event Penataran'): Event
{
    static $counter = 1;
    $slug = 'event-test-'.($counter++).'-'.uniqid();

    return Event::create([
        'title' => $title,
        'slug' => $slug,
        'start_date' => '2026-09-19',
        'end_date' => '2026-09-20',
        'location' => 'Pusdiklat PERKEMI',
        'status' => 'ongoing',
    ]);
}

function createTestMaterial(string $title = 'Materi Pelajaran'): Material
{
    static $mCounter = 1;
    $slug = 'materi-test-'.($mCounter++).'-'.uniqid();
    $material = Material::create([
        'title' => $title,
        'slug' => $slug,
        'code' => 'MAT-'.rand(100, 999),
        'type' => 'document',
        'status' => 'published',
        'created_by' => 1,
    ]);

    $filePath = 'materials/'.$slug.'.pdf';
    Storage::disk('local')->put($filePath, 'PDF test content');

    MaterialFile::create([
        'material_id' => $material->id,
        'kind' => 'primary',
        'disk' => 'local',
        'path' => $filePath,
        'original_name' => 'materi.pdf',
        'mime_type' => 'application/pdf',
        'size_bytes' => 1024,
        'version' => 1,
        'is_active' => true,
    ]);

    return $material;
}

test('regular speaker only sees their own sessions in schedule', function () {
    $userA = User::factory()->create(['role' => 'Pemateri', 'email' => 'speakerA@perkemi.id']);
    $speakerA = Speaker::create([
        'user_id' => $userA->id,
        'name' => 'Sensei A',
        'contact_email' => $userA->email,
        'type' => 'internal',
        'is_active' => true,
        'is_supervisor' => false,
    ]);

    $userB = User::factory()->create(['role' => 'Pemateri', 'email' => 'speakerB@perkemi.id']);
    $speakerB = Speaker::create([
        'user_id' => $userB->id,
        'name' => 'Sensei B',
        'contact_email' => $userB->email,
        'type' => 'internal',
        'is_active' => true,
        'is_supervisor' => false,
    ]);

    $event = createTestEvent();

    $sessionA = EventSession::create([
        'event_id' => $event->id,
        'speaker_id' => $speakerA->id,
        'session_type_code' => 'TEORI',
        'topic' => 'Topik Pelajaran A',
        'day_number' => 1,
        'start_time' => '08:00',
        'end_time' => '10:00',
        'duration_jp' => 2,
    ]);

    $sessionB = EventSession::create([
        'event_id' => $event->id,
        'speaker_id' => $speakerB->id,
        'session_type_code' => 'PRAKTIK',
        'topic' => 'Topik Pelajaran B',
        'day_number' => 1,
        'start_time' => '10:00',
        'end_time' => '12:00',
        'duration_jp' => 2,
    ]);

    $response = $this->actingAs($userA)->get(route('speaker.schedule'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Speaker/Schedule')
        ->where('speaker.is_supervisor', false)
        ->has('sessions', 1)
        ->where('sessions.0.id', $sessionA->id)
    );
});

test('supervisor speaker sees all sessions from other speakers', function () {
    $supervisorUser = User::factory()->create(['role' => 'Pemateri', 'email' => 'supervisor@perkemi.id']);
    $supervisorSpeaker = Speaker::create([
        'user_id' => $supervisorUser->id,
        'name' => 'Sensei Supervisor',
        'contact_email' => $supervisorUser->email,
        'type' => 'internal',
        'is_active' => true,
        'is_supervisor' => true,
    ]);

    $speakerB = Speaker::create([
        'name' => 'Sensei B',
        'type' => 'internal',
        'is_active' => true,
        'is_supervisor' => false,
    ]);

    $event = createTestEvent();

    $session1 = EventSession::create([
        'event_id' => $event->id,
        'speaker_id' => $supervisorSpeaker->id,
        'session_type_code' => 'TEORI',
        'topic' => 'Sesi Supervisor',
        'day_number' => 1,
        'start_time' => '08:00',
        'end_time' => '10:00',
        'duration_jp' => 2,
    ]);

    $session2 = EventSession::create([
        'event_id' => $event->id,
        'speaker_id' => $speakerB->id,
        'session_type_code' => 'PRAKTIK',
        'topic' => 'Sesi Pemateri Lain',
        'day_number' => 1,
        'start_time' => '10:00',
        'end_time' => '12:00',
        'duration_jp' => 2,
    ]);

    $response = $this->actingAs($supervisorUser)->get(route('speaker.schedule'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Speaker/Schedule')
        ->where('speaker.is_supervisor', true)
        ->where('isSupervisorMode', true)
        ->has('sessions', 2)
        ->has('availableSpeakers', 2)
    );
});

test('supervisor speaker can filter sessions by speaker_id', function () {
    $supervisorUser = User::factory()->create(['role' => 'Pemateri', 'email' => 'supervisor@perkemi.id']);
    $supervisorSpeaker = Speaker::create([
        'user_id' => $supervisorUser->id,
        'name' => 'Sensei Supervisor',
        'contact_email' => $supervisorUser->email,
        'type' => 'internal',
        'is_active' => true,
        'is_supervisor' => true,
    ]);

    $speakerB = Speaker::create([
        'name' => 'Sensei B',
        'type' => 'internal',
        'is_active' => true,
        'is_supervisor' => false,
    ]);

    $event = createTestEvent();

    EventSession::create([
        'event_id' => $event->id,
        'speaker_id' => $supervisorSpeaker->id,
        'session_type_code' => 'TEORI',
        'topic' => 'Sesi Supervisor',
        'day_number' => 1,
        'start_time' => '08:00',
        'end_time' => '10:00',
        'duration_jp' => 2,
    ]);

    $sessionB = EventSession::create([
        'event_id' => $event->id,
        'speaker_id' => $speakerB->id,
        'session_type_code' => 'PRAKTIK',
        'topic' => 'Sesi B',
        'day_number' => 1,
        'start_time' => '10:00',
        'end_time' => '12:00',
        'duration_jp' => 2,
    ]);

    $response = $this->actingAs($supervisorUser)->get(route('speaker.schedule', ['speaker_id' => $speakerB->id]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Speaker/Schedule')
        ->has('sessions', 1)
        ->where('sessions.0.id', $sessionB->id)
    );
});

test('supervisor speaker can read and download material from another speaker session while regular speaker cannot', function () {
    $regularUser = User::factory()->create(['role' => 'Pemateri', 'email' => 'reguler@perkemi.id']);
    $regularSpeaker = Speaker::create([
        'user_id' => $regularUser->id,
        'name' => 'Sensei Reguler',
        'contact_email' => $regularUser->email,
        'type' => 'internal',
        'is_active' => true,
        'is_supervisor' => false,
    ]);

    $supervisorUser = User::factory()->create(['role' => 'Pemateri', 'email' => 'supervisor@perkemi.id']);
    $supervisorSpeaker = Speaker::create([
        'user_id' => $supervisorUser->id,
        'name' => 'Sensei Supervisor',
        'contact_email' => $supervisorUser->email,
        'type' => 'internal',
        'is_active' => true,
        'is_supervisor' => true,
    ]);

    $otherSpeaker = Speaker::create([
        'name' => 'Sensei Lain',
        'type' => 'internal',
        'is_active' => true,
        'is_supervisor' => false,
    ]);

    $event = createTestEvent();
    $material = createTestMaterial('Materi Pengujian');

    $session = EventSession::create([
        'event_id' => $event->id,
        'speaker_id' => $otherSpeaker->id,
        'material_id' => $material->id,
        'session_type_code' => 'TEORI',
        'topic' => 'Sesi Lain',
        'day_number' => 1,
        'start_time' => '08:00',
        'end_time' => '10:00',
        'duration_jp' => 2,
    ]);

    // Regular speaker should be forbidden from reading other speaker's session material
    $responseReguler = $this->actingAs($regularUser)->get(route('speaker.material.read', [$session->id, $material->id]));
    $responseReguler->assertForbidden();

    // Regular speaker should be forbidden from downloading other speaker's session material
    $responseRegulerDownload = $this->actingAs($regularUser)->get(route('speaker.material.download', [$session->id, $material->id]));
    $responseRegulerDownload->assertForbidden();

    // Supervisor speaker should be allowed to read and download
    $responseSupervisor = $this->actingAs($supervisorUser)->get(route('speaker.material.read', [$session->id, $material->id]));
    $responseSupervisor->assertRedirect(route('reader.show', $material->slug));

    $responseSupervisorDownload = $this->actingAs($supervisorUser)->get(route('speaker.material.download', [$session->id, $material->id]));
    $responseSupervisorDownload->assertOk();
});

test('admin can toggle speaker supervisor status from event', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $event = createTestEvent();
    $speaker = Speaker::create([
        'event_id' => $event->id,
        'name' => 'Sensei Wartoyo',
        'type' => 'internal',
        'is_active' => true,
        'is_supervisor' => false,
    ]);

    $response = $this->actingAs($admin)->patch(route('admin.event.speaker.toggle-supervisor', [$event, $speaker]));
    $response->assertRedirect();
    $response->assertSessionHas('success');

    $speaker->refresh();
    expect($speaker->is_supervisor)->toBeTrue();

    // Toggle back
    $response2 = $this->actingAs($admin)->patch(route('admin.event.speaker.toggle-supervisor', [$event, $speaker]));
    $response2->assertRedirect();
    $speaker->refresh();
    expect($speaker->is_supervisor)->toBeFalse();
});

test('admin can create login account for speaker from event', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $event = createTestEvent();
    $speaker = Speaker::create([
        'event_id' => $event->id,
        'name' => 'Sensei Agus',
        'type' => 'internal',
        'is_active' => true,
        'is_supervisor' => true,
    ]);

    $response = $this->actingAs($admin)->post(route('admin.event.speaker.create-account', [$event, $speaker]), [
        'email' => 'agus.setiadji@perkemi.id',
        'password' => 'Pemateri2026!',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $speaker->refresh();
    expect($speaker->user_id)->not->toBeNull();
    expect($speaker->contact_email)->toBe('agus.setiadji@perkemi.id');

    $createdUser = User::find($speaker->user_id);
    expect($createdUser)->not->toBeNull();
    expect($createdUser->role)->toBe('Pemateri');
    expect(Hash::check('Pemateri2026!', $createdUser->password))->toBeTrue();
});

test('koordinator acara can access schedule portal and see management capabilities', function () {
    $coordinator = User::factory()->create(['role' => 'Koordinator Acara', 'email' => 'koordinator@perkemi.id']);
    $event = createTestEvent();

    EventSession::create([
        'event_id' => $event->id,
        'topic' => 'Sesi Penataran Dasar',
        'session_type_code' => 'TEORI',
        'day_number' => 1,
        'session_number' => 'Sesi 1',
        'start_time' => '08:00',
        'end_time' => '09:30',
        'duration_jp' => 2,
    ]);

    $response = $this->actingAs($coordinator)->get(route('speaker.schedule'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Speaker/Schedule')
        ->where('canManageSchedule', true)
        ->where('isSupervisorMode', true)
        ->has('sessions', 1)
    );
});

test('koordinator acara or admin can reschedule delayed session and shift subsequent sessions', function () {
    $coordinator = User::factory()->create(['role' => 'Koordinator Acara']);
    $event = createTestEvent();

    // Sesi 1: 08:00 - 09:30
    $session1 = EventSession::create([
        'event_id' => $event->id,
        'topic' => 'Sesi 1 (Molor)',
        'session_type_code' => 'TEORI',
        'day_number' => 1,
        'session_number' => 'Sesi 1',
        'start_time' => '08:00',
        'end_time' => '09:30',
        'duration_jp' => 2,
        'status' => 'scheduled',
    ]);

    // Sesi 2: 09:45 - 11:15
    $session2 = EventSession::create([
        'event_id' => $event->id,
        'topic' => 'Sesi 2 (Subsequent)',
        'session_type_code' => 'PRAKTIK',
        'day_number' => 1,
        'session_number' => 'Sesi 2',
        'start_time' => '09:45',
        'end_time' => '11:15',
        'duration_jp' => 2,
        'status' => 'scheduled',
    ]);

    // Sesi Hari 2 (should NOT be shifted)
    $sessionDay2 = EventSession::create([
        'event_id' => $event->id,
        'topic' => 'Sesi Hari 2',
        'session_type_code' => 'TEORI',
        'day_number' => 2,
        'session_number' => 'Sesi 1',
        'start_time' => '08:00',
        'end_time' => '09:30',
        'duration_jp' => 2,
        'status' => 'scheduled',
    ]);

    // Reschedule Session 1: extended by 30 mins (ends at 10:00 instead of 09:30) with shift_subsequent_sessions = true
    $response = $this->actingAs($coordinator)->post(route('speaker.session.reschedule', $session1), [
        'start_time' => '08:00',
        'end_time' => '10:00',
        'status' => 'delayed',
        'shift_subsequent_sessions' => true,
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $session1->refresh();
    $session2->refresh();
    $sessionDay2->refresh();

    expect($session1->status)->toBe('delayed');
    expect(substr($session1->end_time, 0, 5))->toBe('10:00');

    // Sesi 2 shifted forward by 30 minutes: 09:45 -> 10:15, 11:15 -> 11:45
    expect(substr($session2->start_time, 0, 5))->toBe('10:15');
    expect(substr($session2->end_time, 0, 5))->toBe('11:45');
    expect($session2->status)->toBe('delayed');

    // Sesi Day 2 remains intact
    expect(substr($sessionDay2->start_time, 0, 5))->toBe('08:00');
    expect(substr($sessionDay2->end_time, 0, 5))->toBe('09:30');
});

test('koordinator acara can create and update rundown session via speaker portal', function () {
    $coordinator = User::factory()->create(['role' => 'Koordinator Acara']);
    $event = createTestEvent();

    $storeResponse = $this->actingAs($coordinator)->post(route('speaker.session.store', $event), [
        'day_number' => 1,
        'session_number' => 'Sesi 1',
        'start_time' => '08:00',
        'end_time' => '09:30',
        'duration_jp' => 2,
        'topic' => 'Sesi Baru Dibuat Koordinator',
        'subtopic' => 'Pengenalan Shorinji Kempo',
        'status' => 'scheduled',
        'method' => 'Teori & Praktik',
    ]);

    $storeResponse->assertRedirect();
    $created = EventSession::where('topic', 'Sesi Baru Dibuat Koordinator')->first();
    expect($created)->not->toBeNull();
    expect($created->day_number)->toBe(1);

    // Update
    $updateResponse = $this->actingAs($coordinator)->put(route('speaker.session.update', $created), [
        'day_number' => 1,
        'session_number' => 'Sesi 1 Revisi',
        'start_time' => '08:30',
        'end_time' => '10:00',
        'duration_jp' => 2,
        'topic' => 'Sesi Diperbarui Koordinator',
        'status' => 'ongoing',
    ]);

    $updateResponse->assertRedirect();
    $created->refresh();
    expect($created->topic)->toBe('Sesi Diperbarui Koordinator');
    expect($created->status)->toBe('ongoing');
});

test('pemateri user has view only access and cannot manage schedule or mutate sessions', function () {
    $pemateriUser = User::factory()->create(['role' => 'Pemateri', 'email' => 'sensei.viewonly@perkemi.id']);
    $speaker = Speaker::create([
        'user_id' => $pemateriUser->id,
        'name' => 'Sensei View Only',
        'contact_email' => $pemateriUser->email,
        'type' => 'internal',
        'is_active' => true,
        'is_supervisor' => true,
    ]);

    $event = createTestEvent();
    $session = EventSession::create([
        'event_id' => $event->id,
        'speaker_id' => $speaker->id,
        'topic' => 'Sesi Penataran View Only',
        'session_type_code' => 'TEORI',
        'day_number' => 1,
        'start_time' => '08:00',
        'end_time' => '09:30',
        'duration_jp' => 2,
        'is_attendance_open' => true,
        'attendance_setting' => 'check_in',
        'qr_short_code' => 'ABC123',
    ]);

    // 1. Check schedule props: canManageSchedule is false, attendance fields are present and real
    $response = $this->actingAs($pemateriUser)->get(route('speaker.schedule'));
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Speaker/Schedule')
        ->where('canManageSchedule', false)
        ->has('sessions', 1)
        ->where('sessions.0.is_attendance_open', true)
        ->where('sessions.0.attendance_setting', 'check_in')
        ->where('sessions.0.qr_short_code', 'ABC123')
        ->where('sessions.0.attendances_count', 0)
    );

    // 2. Pemateri cannot store new session
    $this->actingAs($pemateriUser)
        ->post(route('speaker.session.store', $event), [
            'day_number' => 1,
            'topic' => 'Sesi Ilegal',
        ])
        ->assertForbidden();

    // 3. Pemateri cannot update session
    $this->actingAs($pemateriUser)
        ->put(route('speaker.session.update', $session), [
            'day_number' => 1,
            'topic' => 'Update Ilegal',
        ])
        ->assertForbidden();

    // 4. Pemateri cannot reschedule session
    $this->actingAs($pemateriUser)
        ->post(route('speaker.session.reschedule', $session), [
            'start_time' => '09:00',
            'end_time' => '10:30',
        ])
        ->assertForbidden();

    // 5. Pemateri cannot delete session
    $this->actingAs($pemateriUser)
        ->delete(route('speaker.session.destroy', $session))
        ->assertForbidden();
});
