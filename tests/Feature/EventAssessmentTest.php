<?php

use App\Models\Event;
use App\Models\EventAssessment;
use App\Models\User;
use Database\Seeders\EventManagementSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(EventManagementSeeder::class);
    $this->event = Event::firstOrFail();
    $this->admin = User::factory()->create([
        'role' => 'Admin',
    ]);
});

test('admin can view assessment data on event show page', function () {
    $this->actingAs($this->admin)
        ->get("/admin/event/{$this->event->id}?tab=penilaian")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Events/Show')
            ->has('assessmentData')
            ->has('assessmentData.criteria')
            ->has('assessmentData.participants_by_category')
            ->has('assessmentData.settings')
        );
});

test('admin can save participant assessment and synchronize practice score', function () {
    $ep = $this->event->eventParticipants()->firstOrFail();

    $scores = [
        'teori_sejarah' => 9,
        'teori_administrasi' => 8,
        'teori_kepelatihan' => 18,
        'teori_tokuhon' => 9,
        'praktek_gerakan_dasar' => 9,
        'praktek_goho_kihon' => 8.5,
        'praktek_juho' => 8.5,
        'praktek_ken_berpasangan' => 9,
        'praktek_kumi_embu' => 9,
        'pribadi_keterampilan' => 52,
        'pribadi_ekspresi_sikap' => 35,
    ];

    $this->actingAs($this->admin)
        ->post("/admin/event/{$this->event->id}/penilaian", [
            'event_participant_id' => $ep->id,
            'category' => 'PELATIH',
            'examiner_name' => 'Sensei Penguji Test',
            'examiner_rank' => 'VI DAN',
            'scores' => $scores,
            'notes' => 'Gerakan sangat baik dan berwibawa.',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $assessment = EventAssessment::where('event_participant_id', $ep->id)
        ->where('category', 'PELATIH')
        ->first();

    expect($assessment)->not->toBeNull()
        ->and((float) $assessment->subtotal_dasar)->toBe(88.0)
        ->and((float) $assessment->subtotal_pribadi)->toBe(87.0)
        ->and((float) $assessment->total_score)->toBe(175.0)
        ->and($assessment->is_passed)->toBeTrue()
        ->and($assessment->examiner_name)->toBe('Sensei Penguji Test');

    $ep->refresh();
    expect((float) $ep->score_practice)->toBe(87.5);
});

test('admin can bulk save assessments for a category', function () {
    $ep = $this->event->eventParticipants()->firstOrFail();

    $this->actingAs($this->admin)
        ->post("/admin/event/{$this->event->id}/penilaian/bulk", [
            'category' => 'WASIT',
            'examiner_name' => 'Sensei Wasit Nasional',
            'examiner_rank' => 'VII DAN',
            'assessments' => [
                [
                    'event_participant_id' => $ep->id,
                    'scores' => [
                        'teori_administrasi' => 8,
                        'teori_peraturan' => 8,
                        'teori_tata_cara' => 8,
                        'teori_tokuhon' => 8,
                        'praktek_kepemimpinan' => 8,
                        'praktek_kewibawaan' => 8,
                        'praktek_randori' => 16,
                        'praktek_embu' => 16,
                        'pribadi_keterampilan' => 50,
                        'pribadi_ekspresi_sikap' => 30,
                    ],
                    'notes' => 'Cukup tegas.',
                ],
            ],
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->event->refresh();
    expect($this->event->assessment_settings['WASIT']['examiner_name'])->toBe('Sensei Wasit Nasional');
});

test('admin can export assessment excel for a category', function () {
    $this->actingAs($this->admin)
        ->get("/admin/event/{$this->event->id}/penilaian/export-excel?category=PELATIH")
        ->assertOk()
        ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
});
