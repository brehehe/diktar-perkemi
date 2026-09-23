<?php

use App\Models\Event;
use App\Models\EventRegistrationForm;
use App\Models\Participant;
use App\Models\User;
use Database\Seeders\Jatim2026PenataranSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(Jatim2026PenataranSeeder::class);
    $this->event = Event::where('slug', Jatim2026PenataranSeeder::EVENT_SLUG)->firstOrFail();
});

test('participant can view registration form prefilled with their profile data', function () {
    $participant = Participant::where('name', 'like', '%Victor Leonard%')->firstOrFail();
    $user = $participant->user;

    $response = $this->actingAs($user)->get(route('event.registration-form', $this->event->slug));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Event/RegistrationForm')
        ->has('event')
        ->has('participant')
        ->has('formTypeInfo')
        ->where('participant.name', $participant->name)
        ->where('participant.kenshi_id_number', $participant->kenshi_id_number)
    );
});

test('participant can submit registration form with valid details and signature', function () {
    $participant = Participant::where('name', 'like', '%Victor Leonard%')->firstOrFail();
    $user = $participant->user;

    $payload = [
        'form_type' => 'PELATIH',
        'penataran_level' => 'Nasional',
        'start_date' => '2026-10-15',
        'end_date' => '2026-10-18',
        'location' => 'Gedung Astoria Mojokerto',
        'full_name' => $participant->name,
        'birth_place' => 'Surabaya',
        'birth_date' => '1990-05-12',
        'kenshi_id_number' => $participant->kenshi_id_number,
        'dan_level' => '4 DAN',
        'home_address' => 'Prapen Indah Timur III/AA-38, Surabaya',
        'phone_number' => '081234567890',
        'email' => 'victor@kempo.or.id',
        'occupation' => 'Wiraswasta',
        'occupation_address' => 'Jl. Pemuda No. 45 Surabaya',
        'occupation_phone' => '0315551234',
        'emergency_address' => 'Prapen Indah Timur III/AA-38, Surabaya',
        'emergency_phone' => '081987654321',
        'gasnas_records' => [
            ['nomor' => 'GASNAS/PB/2023/089', 'tanggal' => '2023-08-17'],
        ],
        'certificate_records' => [
            ['jenis' => 'Pelatih Daerah', 'nomor' => '102/SK/PENGPROV/2022', 'tanggal' => '2022-11-10'],
        ],
        'sign_place' => 'Mojokerto',
        'sign_date' => '2026-10-15',
        'applicant_name' => $participant->name,
        'signature_data' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'waiver_agreed' => true,
    ];

    $response = $this->actingAs($user)->post(route('event.registration-form.store', $this->event->slug), $payload);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $form = EventRegistrationForm::where('event_id', $this->event->id)
        ->where('participant_id', $participant->id)
        ->first();

    expect($form)->not->toBeNull();
    expect($form->full_name)->toBe($participant->name);
    expect($form->emergency_phone)->toBe('081987654321');
    expect($form->status)->toBe('submitted');
    expect($form->waiver_agreed)->toBeTrue();
    expect(count($form->gasnas_records))->toBe(1);
});

test('participant can access print view of their completed form', function () {
    $participant = Participant::where('name', 'like', '%Victor Leonard%')->firstOrFail();
    $user = $participant->user;

    // Fetch existing seeded or created form
    $form = EventRegistrationForm::firstOrCreate(
        [
            'event_id' => $this->event->id,
            'participant_id' => $participant->id,
        ],
        [
            'form_type' => 'PELATIH',
            'penataran_level' => 'Nasional',
            'start_date' => '2026-10-15',
            'end_date' => '2026-10-18',
            'location' => 'Gedung Astoria Mojokerto',
            'full_name' => $participant->name,
            'kenshi_id_number' => $participant->kenshi_id_number,
            'dan_level' => '4 DAN',
            'home_address' => 'Surabaya',
            'phone_number' => '081234567890',
            'emergency_phone' => '081987654321',
            'status' => 'submitted',
            'waiver_agreed' => true,
        ]
    );

    $response = $this->actingAs($user)->get(route('event.registration-form.print', $this->event->slug));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Event/PrintRegistrationForm')
        ->has('form')
        ->has('event')
        ->has('participant')
        ->where('form.full_name', $participant->name)
    );
});

test('admin can view registration forms tab in event detail and verify form', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
        'email' => 'admin.penataran@perkemi.test',
    ]);

    $participant = Participant::where('name', 'like', '%Victor Leonard%')->firstOrFail();

    $form = EventRegistrationForm::firstOrCreate(
        [
            'event_id' => $this->event->id,
            'participant_id' => $participant->id,
        ],
        [
            'form_type' => 'PELATIH',
            'penataran_level' => 'Nasional',
            'start_date' => '2026-10-15',
            'end_date' => '2026-10-18',
            'location' => 'Mojokerto',
            'full_name' => $participant->name,
            'kenshi_id_number' => $participant->kenshi_id_number,
            'dan_level' => '4 DAN',
            'home_address' => 'Surabaya',
            'phone_number' => '081234567890',
            'emergency_phone' => '081987654321',
            'status' => 'submitted',
            'waiver_agreed' => true,
        ]
    );

    // 1. Admin views event page with tab=formulir
    $response = $this->actingAs($admin)->get("/admin/event/{$this->event->id}?tab=formulir");
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Events/Show')
        ->has('registrationForms')
        ->has('stats.total_registration_forms')
    );

    // 2. Admin verifies the participant's form
    $verifyResponse = $this->actingAs($admin)->post(route('admin.event.registration-form.verify', [$this->event->id, $form->id]));
    $verifyResponse->assertRedirect();
    $verifyResponse->assertSessionHas('success');

    $form->refresh();
    expect($form->status)->toBe('verified');
    expect($form->verified_by)->toBe($admin->id);
    expect($form->verified_at)->not->toBeNull();
});

test('admin can submit registration form in preview mode without 403', function () {
    $admin = User::factory()->create([
        'role' => 'Admin',
        'email' => 'admin.super@perkemi.test',
    ]);

    $payload = [
        'form_type' => 'WASIT',
        'penataran_level' => 'Daerah',
        'start_date' => '2026-10-15',
        'end_date' => '2026-10-18',
        'location' => 'Gedung Olahraga',
        'full_name' => 'Kenshi Wasit Test',
        'birth_place' => 'Mojokerto',
        'birth_date' => '1992-04-10',
        'kenshi_id_number' => '12.3456.789',
        'dan_level' => '2 DAN',
        'phone_number' => '081234567890',
        'home_address' => 'Jl. Pahlawan No. 10 Mojokerto',
        'emergency_phone' => '081987654321',
        'sign_place' => 'Mojokerto',
        'sign_date' => '2026-10-15',
        'applicant_name' => 'Kenshi Wasit Test',
        'signature_data' => null, // Test auto-signature fallback
        'waiver_agreed' => true,
    ];

    $response = $this->actingAs($admin)->post(route('event.registration-form.store', $this->event->slug), $payload);

    $response->assertRedirect(route('event.registration-form', $this->event->slug));
    $response->assertSessionHas('success');

    $form = EventRegistrationForm::where('event_id', $this->event->id)->where('applicant_name', 'Kenshi Wasit Test')->first();
    expect($form)->not->toBeNull();
    expect($form->form_type)->toBe('WASIT');
    expect($form->signature_data)->not->toBeEmpty();
    expect($form->signature_data)->toContain('data:image/svg+xml;base64');
});

test('submitting registration form with missing required fields triggers validation errors', function () {
    $participant = Participant::where('name', 'like', '%Victor Leonard%')->firstOrFail();
    $user = $participant->user;

    $response = $this->actingAs($user)->post(route('event.registration-form.store', $this->event->slug), [
        'form_type' => 'PELATIH',
        'penataran_level' => 'Daerah',
        'full_name' => '',
        'kenshi_id_number' => '',
        'dan_level' => '',
        'birth_place' => '',
        'birth_date' => '',
        'phone_number' => '',
        'home_address' => '',
        'emergency_phone' => '',
        'waiver_agreed' => false,
    ]);

    $response->assertSessionHasErrors([
        'full_name',
        'kenshi_id_number',
        'dan_level',
        'birth_place',
        'birth_date',
        'phone_number',
        'home_address',
        'emergency_phone',
        'waiver_agreed',
    ]);
});

test('participant can upload scanned registration form file directly', function () {
    Storage::fake('public');

    $participant = Participant::where('name', 'like', '%Victor Leonard%')->firstOrFail();
    $user = $participant->user;

    $file = UploadedFile::fake()->create('formulir_pendaftaran_scan.pdf', 500, 'application/pdf');

    $response = $this->actingAs($user)->post(route('event.registration-form.upload', $this->event->slug), [
        'file' => $file,
        'form_type' => 'PELATIH',
        'penataran_level' => 'Daerah',
        'notes' => 'Formulir fisik ditandatangani basah oleh kenshi dan Pengdo',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $form = EventRegistrationForm::where('event_id', $this->event->id)
        ->where('participant_id', $participant->id)
        ->first();

    expect($form)->not->toBeNull();
    expect($form->status)->toBe('submitted');
    expect($form->submission_mode)->toBe('upload');
    expect($form->original_file_name)->toBe('formulir_pendaftaran_scan.pdf');
    expect($form->file_path)->not->toBeNull();
    expect($form->file_url)->toContain('/storage/registration_forms/');

    Storage::disk('public')->assertExists($form->file_path);
});

test('admin can upload scanned registration form on behalf of participant and auto-verify it', function () {
    Storage::fake('public');

    $admin = User::factory()->create([
        'role' => 'Admin',
        'email' => 'admin.upload@perkemi.test',
    ]);

    $participant = Participant::where('name', 'like', '%Victor Leonard%')->firstOrFail();

    $file = UploadedFile::fake()->create('scan_admin_victor.pdf', 800, 'application/pdf');

    $response = $this->actingAs($admin)->post(route('event.registration-form.upload', $this->event->slug), [
        'participant_id' => $participant->id,
        'file' => $file,
        'form_type' => 'PELATIH',
        'penataran_level' => 'Nasional',
        'auto_verify' => '1',
        'notes' => 'Diverifikasi langsung oleh Pengurus Besar saat pendaftaran fisik',
    ]);

    $response->assertRedirect(route('admin.event.show', ['event' => $this->event->id, 'tab' => 'formulir']));
    $response->assertSessionHas('success');

    $form = EventRegistrationForm::where('event_id', $this->event->id)
        ->where('participant_id', $participant->id)
        ->first();

    expect($form)->not->toBeNull();
    expect($form->status)->toBe('verified');
    expect($form->verified_at)->not->toBeNull();
    expect($form->original_file_name)->toBe('scan_admin_victor.pdf');
    expect($form->admin_notes)->toBe('Diverifikasi langsung oleh Pengurus Besar saat pendaftaran fisik');

    Storage::disk('public')->assertExists($form->file_path);
});
