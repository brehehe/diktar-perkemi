<?php

use App\Models\Event;
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

test('participant can view integrity pact form prefilled with their profile and birthdate', function () {
    $participant = Participant::where('kenshi_id_number', '07.1.13.01.24.012')->firstOrFail();
    $user = $participant->user;

    $response = $this->actingAs($user)->get(route('event.integrity-pact', $this->event->slug));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Event/IntegrityPactForm')
        ->has('event')
        ->has('participant')
        ->has('pact')
        ->has('pledgePoints')
        ->where('pact.full_name', $participant->name)
        ->where('pact.kenshi_id_number', '07.1.13.01.24.012')
        ->where('pact.birth_place', 'Surabaya')
        ->where('pact.birth_date', '1996-06-05')
    );
});

test('participant can submit integrity pact with digital signature and commitment agreement', function () {
    $participant = Participant::where('kenshi_id_number', '07.1.13.01.24.012')->firstOrFail();
    $user = $participant->user;

    $payload = [
        'pact_type' => 'penguji',
        'full_name' => $participant->name,
        'birth_place' => 'Surabaya',
        'birth_date' => '1996-06-05',
        'kenshi_id_number' => $participant->kenshi_id_number,
        'dan_level' => '3 DAN',
        'religion' => 'Islam',
        'dojo' => 'Perak Surabaya',
        'city' => 'Surabaya Kota',
        'province' => 'Jawa Timur',
        'certificate_number' => '073/PLT-DRH/XII/2024',
        'valid_start_date' => '2026-09-27',
        'valid_end_date' => '2030-09-27',
        'id_card_address' => 'Teluk Aru Utara No.61 B Surabaya',
        'current_address' => 'Teluk Aru Utara No.61 B Surabaya',
        'management_organization' => 'Pengkot Surabaya',
        'management_position' => 'Penguji Daerah',
        'sign_place' => 'Mojokerto',
        'sign_date' => '2026-09-27',
        'signature_data' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'agree_pledge' => true,
    ];

    $response = $this->actingAs($user)->post(route('event.integrity-pact.store', $this->event->slug), $payload);

    $response->assertRedirect(route('event.integrity-pact', $this->event->slug));
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('event_integrity_pacts', [
        'event_id' => $this->event->id,
        'participant_id' => $participant->id,
        'pact_type' => 'penguji',
        'status' => 'signed',
        'kenshi_id_number' => '07.1.13.01.24.012',
    ]);
});

test('integrity pact submission fails when signature data is missing', function () {
    $participant = Participant::where('kenshi_id_number', '07.1.13.01.24.012')->firstOrFail();
    $user = $participant->user;

    $payload = [
        'pact_type' => 'penguji',
        'full_name' => $participant->name,
        'birth_place' => 'Surabaya',
        'birth_date' => '1996-06-05',
        'kenshi_id_number' => $participant->kenshi_id_number,
        'dan_level' => '3 DAN',
        'religion' => 'Islam',
        'dojo' => 'Perak Surabaya',
        'city' => 'Surabaya Kota',
        'province' => 'Jawa Timur',
        'id_card_address' => 'Teluk Aru Utara No.61 B Surabaya',
        'sign_place' => 'Mojokerto',
        'sign_date' => '2026-09-27',
        'signature_data' => '', // Kosong
        'agree_pledge' => true,
    ];

    $response = $this->actingAs($user)->post(route('event.integrity-pact.store', $this->event->slug), $payload);

    $response->assertSessionHasErrors(['signature_data']);
});

test('integrity pact submission fails when agreement pledge is not accepted', function () {
    $participant = Participant::where('kenshi_id_number', '07.1.13.01.24.012')->firstOrFail();
    $user = $participant->user;

    $payload = [
        'pact_type' => 'penguji',
        'full_name' => $participant->name,
        'birth_place' => 'Surabaya',
        'birth_date' => '1996-06-05',
        'kenshi_id_number' => $participant->kenshi_id_number,
        'dan_level' => '3 DAN',
        'religion' => 'Islam',
        'dojo' => 'Perak Surabaya',
        'city' => 'Surabaya Kota',
        'province' => 'Jawa Timur',
        'id_card_address' => 'Teluk Aru Utara No.61 B Surabaya',
        'sign_place' => 'Mojokerto',
        'sign_date' => '2026-09-27',
        'signature_data' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'agree_pledge' => false,
    ];

    $response = $this->actingAs($user)->post(route('event.integrity-pact.store', $this->event->slug), $payload);

    $response->assertSessionHasErrors(['agree_pledge']);
});

test('participant can view print page of their integrity pact', function () {
    $participant = Participant::where('kenshi_id_number', '07.1.13.01.24.012')->firstOrFail();
    $user = $participant->user;

    $response = $this->actingAs($user)->get(route('event.integrity-pact.print', $this->event->slug));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Event/PrintIntegrityPact')
        ->has('event')
        ->has('participant')
        ->has('pact')
        ->has('pledgePoints')
        ->where('pact.full_name', $participant->name)
        ->where('pact.kenshi_id_number', '07.1.13.01.24.012')
    );
});

test('organizer can view print page of participant integrity pact', function () {
    $organizer = User::where('role', 'Penyelenggara')->first() ?? User::where('role', 'Admin')->first();
    $participant = Participant::where('kenshi_id_number', '07.1.13.01.24.012')->firstOrFail();

    $response = $this->actingAs($organizer)->get(route('admin.event.integrity-pact.admin-print', [
        'event' => $this->event->slug,
        'participant' => $participant->id,
    ]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Event/PrintIntegrityPact')
        ->where('participant.id', $participant->id)
        ->where('pact.full_name', $participant->name)
    );
});
