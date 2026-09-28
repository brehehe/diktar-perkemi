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

test('admin can view practical exam data on event show page', function () {
    $this->actingAs($this->admin)
        ->get("/admin/event/{$this->event->id}?tab=ujian-praktik")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Events/Show')
            ->has('practicalExamData')
            ->has('practicalExamData.configs')
            ->has('practicalExamData.participants_by_category')
            ->has('practicalExamData.settings')
            ->has('practicalExamData.stats')
        );
});

test('admin can save practical exam assessment for a participant', function () {
    $ep = $this->event->eventParticipants()->firstOrFail();

    $scores = [
        'PD-01' => 5,
        'PD-02' => 4,
        'PD-03' => 4.5,
        'PD-04' => 4,
        'PD-05' => 5,
        'PD-06' => 4,
        'PD-07' => 5,
        'PD-08' => 4.5,
    ];

    $this->actingAs($this->admin)
        ->post("/admin/event/{$this->event->id}/ujian-praktik", [
            'event_participant_id' => $ep->id,
            'category' => 'UJIAN_PD',
            'examiner_name' => 'Sensei Pelatih Daerah Penguji',
            'scores' => $scores,
            'notes' => 'Penguasaan materi sangat baik.',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $assessment = EventAssessment::where('event_participant_id', $ep->id)
        ->where('category', 'UJIAN_PD')
        ->first();

    expect($assessment)->not->toBeNull()
        ->and((float) $assessment->total_score)->toBeGreaterThan(80.0)
        ->and($assessment->is_passed)->toBeTrue()
        ->and($assessment->scores['_status'])->toBe('LULUS')
        ->and($assessment->examiner_name)->toBe('Sensei Pelatih Daerah Penguji');
});

test('admin can bulk save practical exam assessments', function () {
    $ep = $this->event->eventParticipants()->firstOrFail();

    $this->actingAs($this->admin)
        ->post("/admin/event/{$this->event->id}/ujian-praktik/bulk", [
            'category' => 'UJIAN_WAD',
            'examiner_name' => 'Sensei Wasit Daerah',
            'assessments' => [
                [
                    'event_participant_id' => $ep->id,
                    'scores' => [
                        'WD-01' => 4,
                        'WD-02' => 4,
                        'WD-03' => 4,
                        'WD-04' => 4,
                        'WD-05' => 4,
                        'WD-06' => 4,
                        'WD-07' => 4,
                    ],
                    'notes' => 'Wasit berkinerja stabil.',
                ],
            ],
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $assessment = EventAssessment::where('event_participant_id', $ep->id)
        ->where('category', 'UJIAN_WAD')
        ->first();

    expect($assessment)->not->toBeNull()
        ->and((float) $assessment->total_score)->toBe(80.0)
        ->and($assessment->is_passed)->toBeTrue()
        ->and($assessment->scores['_status'])->toBe('LULUS');
});

test('admin can export practical exam excel workbook', function () {
    $this->actingAs($this->admin)
        ->get("/admin/event/{$this->event->id}/ujian-praktik/export-excel")
        ->assertOk()
        ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
});
