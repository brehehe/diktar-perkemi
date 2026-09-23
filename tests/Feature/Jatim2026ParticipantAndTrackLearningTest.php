<?php

use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\Participant;
use App\Models\User;
use App\Services\EventLearningRoomService;
use Database\Seeders\Jatim2026PenataranSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(Jatim2026PenataranSeeder::class);
    $this->event = Event::where('slug', Jatim2026PenataranSeeder::EVENT_SLUG)->firstOrFail();
});

test('participant can login using formatted or unformatted NIK and password equals NIK', function () {
    $participant = Participant::where('name', 'like', '%Victor Leonard%')->firstOrFail();
    $user = $participant->user;
    expect($user)->not->toBeNull();

    // Verify password hash matches NIK
    expect(Hash::check($participant->kenshi_id_number, $user->password))->toBeTrue();

    // 1. Login using formatted NIK as identifier and formatted NIK as password
    $response = $this->post('/login', [
        'email' => $participant->kenshi_id_number,
        'password' => $participant->kenshi_id_number,
    ]);
    $response->assertRedirect();
    $this->assertAuthenticatedAs($user);

    auth()->logout();

    // 2. Login using unformatted NIK (digits only) as identifier and unformatted NIK as password
    $cleanNik = preg_replace('/[^a-zA-Z0-9]/', '', $participant->kenshi_id_number);
    $response2 = $this->post('/login', [
        'email' => $cleanNik,
        'password' => $cleanNik,
    ]);
    $response2->assertRedirect();
    $this->assertAuthenticatedAs($user);
});

test('learning room filters parallel sessions and CBT exams by participant track', function () {
    $victor = Participant::where('name', 'like', '%Victor Leonard%')->firstOrFail();
    $victorUser = $victor->user;

    // Ensure participant is verified so resolveParticipant grants access
    $this->event->eventParticipants()->where('participant_id', $victor->id)->update(['admin_status' => 'verified']);

    // Check in arrival so learning room opens
    $arrSession = $this->event->sessions()->where('session_type_code', 'KEHADIRAN_AWAL')->firstOrFail();
    EventAttendance::create([
        'event_id' => $this->event->id,
        'event_session_id' => $arrSession->id,
        'participant_id' => $victor->id,
        'attendance_type' => 'check_in',
        'status' => 'present',
        'checked_in_at' => now(),
        'method' => 'scan_qr',
    ]);

    $service = app(EventLearningRoomService::class);
    $victorData = $service->data($victorUser, $this->event->slug);

    // Victor is PN (Pelatih Nasional) -> only Pelatih parallel sessions and CBT-JTM26-PLT
    $victorParallelRooms = collect($victorData['sessions'])
        ->filter(fn ($s) => str_contains($s['topic'], 'Kelas'))
        ->pluck('room')
        ->unique()
        ->values();

    expect($victorParallelRooms->all())->toContain('Ruang 1 (Pelatih PD/PN)')
        ->and($victorParallelRooms->all())->not->toContain('Ruang 2 (Penguji PED/PEN)')
        ->and($victorParallelRooms->all())->not->toContain('Ruang 3 (Wasit WAD/WAN)');

    $cbtCodes = collect($victorData['myCbtExams'])->pluck('code');
    expect($cbtCodes->all())->toContain('CBT-JTM26-PLT')
        ->and($cbtCodes->all())->not->toContain('CBT-JTM26-PGJ')
        ->and($cbtCodes->all())->not->toContain('CBT-JTM26-WST');
});

test('admin master peserta index and show display certification history and target track', function () {
    $admin = User::where('role', 'Admin')->first() ?? User::factory()->create(['role' => 'Admin']);

    // Pangesti Nurmadiah has prior certificate Pelatih Daerah (PD) and current target Penguji Daerah (PED)
    $pangesti = Participant::where('name', 'like', '%Pangesti%')->firstOrFail();

    $this->actingAs($admin)->get('/admin/master/peserta?q=Pangesti')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Participants/Index')
            ->has('participants.data', 1)
            ->where('participants.data.0.target_track', 'Penguji Daerah')
            ->where('participants.data.0.events_count', 2)
            ->has('participants.data.0.certifications_history', 1)
        );

    $this->actingAs($admin)->get("/admin/master/peserta/{$pangesti->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Participants/Show')
            ->where('participant.name', $pangesti->name)
            ->has('participant.certifications_history', 1)
            ->has('enrolledEvents', 2)
        );
});
