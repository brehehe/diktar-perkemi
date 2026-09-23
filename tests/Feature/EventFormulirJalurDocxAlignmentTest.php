<?php

use App\Http\Controllers\EventRegistrationFormController;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\EventRegistrationForm;
use App\Models\Participant;
use App\Models\User;
use Database\Seeders\Jatim2026PenataranSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(Jatim2026PenataranSeeder::class);
    $this->event = Event::where('slug', Jatim2026PenataranSeeder::EVENT_SLUG)->firstOrFail();
});

test('tab formulir on admin event 7 starts completely clean with 0 submitted and 87 unfilled participants', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
        'email' => 'admin.test@perkemi.test',
    ]);

    $response = $this->actingAs($admin)->get(route('admin.event.show', [$this->event->id, 'tab' => 'formulir']));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Events/Show')
        ->has('registrationForms', 87)
        ->where('stats.total_registration_forms', 87)
        ->where('stats.submitted_registration_forms', 0)
        ->where('stats.verified_registration_forms', 0)
        ->where('stats.unfilled_registration_forms', 87)
    );
});

test('resolveFormType accurately maps each jalur and tingkatan to exact DOCX lampiran codes and photo requirements', function () {
    // Pelatih Daerah
    $pd = EventRegistrationFormController::resolveFormType('PD');
    expect($pd['form_type'])->toBe('PELATIH');
    expect($pd['penataran_level'])->toBe('Daerah');
    expect($pd['lampiran_label'])->toBe('LAMPIRAN-A');
    expect($pd['waiver_lampiran_label'])->toBe('LAMPIRAN-E');

    // Pelatih Nasional
    $pn = EventRegistrationFormController::resolveFormType('PN');
    expect($pn['form_type'])->toBe('PELATIH');
    expect($pn['penataran_level'])->toBe('Nasional');
    expect($pn['lampiran_label'])->toBe('LAMPIRAN-B');
    expect($pn['waiver_lampiran_label'])->toBe('LAMPIRAN-E');

    // Penguji Daerah
    $ped = EventRegistrationFormController::resolveFormType('PED');
    expect($ped['form_type'])->toBe('PENGUJI');
    expect($ped['penataran_level'])->toBe('Daerah');
    expect($ped['lampiran_label'])->toBe('LAMPIRAN-C');
    expect($ped['waiver_lampiran_label'])->toBe('LAMPIRAN-E');

    // Penguji Nasional
    $pen = EventRegistrationFormController::resolveFormType('PEN');
    expect($pen['form_type'])->toBe('PENGUJI');
    expect($pen['penataran_level'])->toBe('Nasional');
    expect($pen['lampiran_label'])->toBe('LAMPIRAN-D');
    expect($pen['waiver_lampiran_label'])->toBe('LAMPIRAN-E');

    // Wasit Daerah
    $wad = EventRegistrationFormController::resolveFormType('WAD');
    expect($wad['form_type'])->toBe('WASIT');
    expect($wad['penataran_level'])->toBe('Daerah');
    expect($wad['lampiran_label'])->toBe('LAMPIRAN-A');
    expect($wad['waiver_lampiran_label'])->toBe('LAMPIRAN-C');
    expect($wad['photo_requirements'])->toContain('2 1/2 x 3');

    // Wasit Nasional
    $wan = EventRegistrationFormController::resolveFormType('WAN');
    expect($wan['form_type'])->toBe('WASIT');
    expect($wan['penataran_level'])->toBe('Nasional');
    expect($wan['lampiran_label'])->toBe('LAMPIRAN-B');
    expect($wan['waiver_lampiran_label'])->toBe('LAMPIRAN-C');
    expect($wan['photo_requirements'])->toContain('2 1/2 x 3');
});

test('participant can submit and print registration form with verification details', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
        'name' => 'Budi Santoso',
        'email' => 'budi.santoso@perkemi.test',
    ]);

    $participant = Participant::where('name', 'like', '%Victor Leonard%')->firstOrFail();
    $user = $participant->user;

    $enrollment = EventParticipant::where('event_id', $this->event->id)
        ->where('participant_id', $participant->id)
        ->firstOrFail();

    $form = EventRegistrationForm::create([
        'event_id' => $this->event->id,
        'participant_id' => $participant->id,
        'event_participant_id' => $enrollment->id,
        'form_type' => 'PELATIH',
        'penataran_level' => 'Nasional',
        'full_name' => $participant->name,
        'kenshi_id_number' => $participant->kenshi_id_number,
        'dan_level' => '3 DAN',
        'home_address' => 'Jl. Kenshi No. 1',
        'emergency_phone' => '081234567890',
        'sign_place' => 'Mojokerto',
        'sign_date' => now()->toDateString(),
        'applicant_name' => $participant->name,
        'signature_data' => 'data:image/svg+xml;utf8,<svg></svg>',
        'waiver_agreed' => true,
        'status' => 'verified',
        'submitted_at' => now(),
        'verified_at' => now(),
        'verified_by' => $admin->id,
    ]);

    $response = $this->actingAs($user)->get(route('event.registration-form.print', $this->event->slug));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Event/PrintRegistrationForm')
        ->where('form.status', 'verified')
        ->where('form.verified_by_name', 'Budi Santoso')
        ->where('lampiranLabel', 'LAMPIRAN-B')
        ->where('waiverLampiranLabel', 'LAMPIRAN-E')
    );
});
