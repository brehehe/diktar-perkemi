<?php

use App\Models\Event;
use App\Models\EventAssessment;
use App\Models\EventParticipant;
use App\Models\User;
use App\Services\EventKenshiExamService;
use Database\Seeders\EventManagementSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function createKenshiAssessmentContext(): array
{
    test()->seed(EventManagementSeeder::class);
    $event = Event::firstOrFail();
    $event->update([
        'event_type' => 'ukt',
        'title' => 'Ujian Kenaikan Tingkat Surabaya',
        'slug' => 'ujian-kenaikan-tingkat-surabaya',
    ]);
    $enrollment = EventParticipant::whereBelongsTo($event)->firstOrFail();
    $enrollment->update(['track_code' => 'KYU-8']);
    $admin = User::factory()->create(['role' => 'Admin']);

    return compact('event', 'enrollment', 'admin');
}

function completeKyuEightScores(): array
{
    return [
        'theory_history' => 50,
        'theory_philosophy' => 50,
        'etika_tata_krama' => 40,
        'tai_gamae' => 20,
        'tai_sabaki' => 20,
        'umpo_ho' => 20,
        'teknik_menyerang' => 20,
        'teknik_bertahan' => 20,
        'bertahan_bergerak' => 10,
        'do_zuki_do_geri' => 10,
        'ken_tandoku' => 40,
        'uchi_uke_zuki_ura' => 30,
        'kote_nuki' => 30,
        'tenchi_ken_1_tandoku' => 40,
    ];
}

test('admin can view kenshi scoring data in the event tabs', function () {
    ['event' => $event, 'enrollment' => $enrollment, 'admin' => $admin] = createKenshiAssessmentContext();

    $this->actingAs($admin)
        ->get(route('admin.event.show', ['event' => $event, 'tab' => 'kenshi-penilaian']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Events/Show')
            ->where('kenshiExamData.configs.KYU-8.label', 'KYU 8')
            ->where('kenshiExamData.participants_by_category.KYU-8.0.event_participant_id', $enrollment->id)
            ->where('kenshiExamData.stats.total_participants', 1)
            ->where('kenshiExamData.can_update', true)
        );
});

test('admin can save complete kenshi scores and synchronize the participant result', function () {
    ['event' => $event, 'enrollment' => $enrollment, 'admin' => $admin] = createKenshiAssessmentContext();

    $this->actingAs($admin)
        ->post(route('admin.event.kenshi-exam-assessments.store', $event), [
            'category' => 'KYU-8',
            'assessments' => [[
                'event_participant_id' => $enrollment->id,
                'scores' => completeKyuEightScores(),
                'status_override' => 'auto',
                'notes' => 'Teknik lengkap dan stabil.',
            ]],
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $assessment = EventAssessment::query()
        ->whereBelongsTo($event)
        ->where('event_participant_id', $enrollment->id)
        ->where('category', EventKenshiExamService::ASSESSMENT_CATEGORY)
        ->firstOrFail();

    expect((float) $assessment->subtotal_dasar)->toBe(100.0)
        ->and((float) $assessment->subtotal_pribadi)->toBe(300.0)
        ->and((float) $assessment->total_score)->toBe(400.0)
        ->and($assessment->is_passed)->toBeTrue()
        ->and($assessment->scores['_status'])->toBe('LULUS')
        ->and($assessment->notes)->toBe('Teknik lengkap dan stabil.');

    $enrollment->refresh();
    expect((float) $enrollment->score_theory)->toBe(100.0)
        ->and((float) $enrollment->score_practice)->toBe(100.0)
        ->and($enrollment->graduation_status)->toBe('passed');
});

test('manual absence status is stored as the final exam decision', function () {
    ['event' => $event, 'enrollment' => $enrollment, 'admin' => $admin] = createKenshiAssessmentContext();

    $this->actingAs($admin)
        ->post(route('admin.event.kenshi-exam-assessments.store', $event), [
            'category' => 'KYU-8',
            'assessments' => [[
                'event_participant_id' => $enrollment->id,
                'scores' => [],
                'status_override' => 'absent',
            ]],
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $assessment = EventAssessment::where('event_participant_id', $enrollment->id)
        ->where('category', EventKenshiExamService::ASSESSMENT_CATEGORY)
        ->firstOrFail();

    expect($assessment->scores['_status'])->toBe('TIDAK HADIR')
        ->and($assessment->is_passed)->toBeFalse();
});

test('admin can override the automatic final score without changing component scores', function () {
    ['event' => $event, 'enrollment' => $enrollment, 'admin' => $admin] = createKenshiAssessmentContext();

    $this->actingAs($admin)
        ->post(route('admin.event.kenshi-exam-assessments.store', $event), [
            'category' => 'KYU-8',
            'assessments' => [[
                'event_participant_id' => $enrollment->id,
                'scores' => completeKyuEightScores(),
                'total_score_override' => 350,
                'status_override' => 'auto',
            ]],
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $assessment = EventAssessment::where('event_participant_id', $enrollment->id)
        ->where('category', EventKenshiExamService::ASSESSMENT_CATEGORY)
        ->firstOrFail();

    expect((float) $assessment->total_score)->toBe(350.0)
        ->and((float) $assessment->subtotal_dasar)->toBe(100.0)
        ->and((float) $assessment->subtotal_pribadi)->toBe(300.0)
        ->and((float) $assessment->scores['_total_score_override'])->toBe(350.0);

    $this->actingAs($admin)
        ->get(route('admin.event.show', ['event' => $event, 'tab' => 'kenshi-hasil']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('kenshiExamData.participants_by_category.KYU-8.0.total_score_override', 350)
            ->where('kenshiExamData.participants_by_category.KYU-8.0.automatic_total_score', 400)
            ->where('kenshiExamData.participants_by_category.KYU-8.0.total_score', 350)
            ->where('kenshiExamData.participants_by_category.KYU-8.0.has_total_override', true)
        );
});

test('clearing the manual final score restores the automatic total', function () {
    ['event' => $event, 'enrollment' => $enrollment, 'admin' => $admin] = createKenshiAssessmentContext();

    $payload = [
        'category' => 'KYU-8',
        'assessments' => [[
            'event_participant_id' => $enrollment->id,
            'scores' => completeKyuEightScores(),
            'total_score_override' => 350,
            'status_override' => 'auto',
        ]],
    ];

    $this->actingAs($admin)
        ->post(route('admin.event.kenshi-exam-assessments.store', $event), $payload)
        ->assertRedirect();

    $payload['assessments'][0]['total_score_override'] = '';

    $this->actingAs($admin)
        ->post(route('admin.event.kenshi-exam-assessments.store', $event), $payload)
        ->assertRedirect()
        ->assertSessionHas('success');

    $assessment = EventAssessment::where('event_participant_id', $enrollment->id)
        ->where('category', EventKenshiExamService::ASSESSMENT_CATEGORY)
        ->firstOrFail();

    expect((float) $assessment->total_score)->toBe(400.0)
        ->and($assessment->scores)->not->toHaveKey('_total_score_override');
});

test('manual final score cannot exceed the category maximum', function () {
    ['event' => $event, 'enrollment' => $enrollment, 'admin' => $admin] = createKenshiAssessmentContext();

    $this->actingAs($admin)
        ->post(route('admin.event.kenshi-exam-assessments.store', $event), [
            'category' => 'KYU-8',
            'assessments' => [[
                'event_participant_id' => $enrollment->id,
                'scores' => completeKyuEightScores(),
                'total_score_override' => 401,
                'status_override' => 'auto',
            ]],
        ])
        ->assertRedirect()
        ->assertSessionHasErrors('assessments.0.total_score_override');

    $this->assertDatabaseCount('event_assessments', 0);
});

test('admin can save document header details without creating an empty assessment', function () {
    ['event' => $event, 'admin' => $admin] = createKenshiAssessmentContext();

    $this->actingAs($admin)
        ->post(route('admin.event.kenshi-exam-assessments.store', $event), [
            'category' => 'KYU-8',
            'document_details' => [
                'mandate_number' => '045/PB-PERKEMI/IX/2026',
                'mandate_date' => '2026-09-20',
                'examiners' => [
                    ['name' => 'Sensei Utama', 'rank' => 'V DAN', 'certificate_number' => 'SP-001'],
                    ['name' => 'Sensei Kedua', 'rank' => 'IV DAN', 'certificate_number' => 'SP-002'],
                    ['name' => 'Sensei Ketiga', 'rank' => 'III DAN', 'certificate_number' => 'SP-003'],
                ],
                'coordinator_name' => 'Koordinator Penguji',
                'coordinator_rank' => 'V DAN',
                'organizer_representative_name' => 'Ketua Panitia',
                'organizer_representative_rank' => 'III DAN',
                'organizer_representative_role' => 'Ketua Pengkot',
            ],
            'assessments' => [],
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $details = $event->refresh()->assessment_settings['kenshi_exam']['KYU-8'];

    expect($details['mandate_number'])->toBe('045/PB-PERKEMI/IX/2026')
        ->and($details['examiners'][0]['name'])->toBe('Sensei Utama')
        ->and($details['coordinator_name'])->toBe('Koordinator Penguji')
        ->and($details['organizer_representative_role'])->toBe('Ketua Pengkot');

    $this->assertDatabaseCount('event_assessments', 0);
});

test('viewer cannot change kenshi scores or document headers', function () {
    ['event' => $event, 'enrollment' => $enrollment] = createKenshiAssessmentContext();
    $viewer = User::factory()->create(['role' => 'Pemateri']);

    $this->actingAs($viewer)
        ->get(route('admin.event.show', ['event' => $event, 'tab' => 'kenshi-penilaian']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('kenshiExamData.can_update', false)
        );

    $this->actingAs($viewer)
        ->post(route('admin.event.kenshi-exam-assessments.store', $event), [
            'category' => 'KYU-8',
            'assessments' => [[
                'event_participant_id' => $enrollment->id,
                'scores' => completeKyuEightScores(),
            ]],
        ])
        ->assertForbidden();

    $this->assertDatabaseCount('event_assessments', 0);
});

test('kenshi scoring rejects a participant from another event', function () {
    ['event' => $event, 'enrollment' => $enrollment, 'admin' => $admin] = createKenshiAssessmentContext();
    $otherEvent = $event->replicate();
    $otherEvent->title = 'UKT Event Lain';
    $otherEvent->slug = 'ukt-event-lain';
    $otherEvent->save();
    $otherEnrollment = $enrollment->replicate();
    $otherEnrollment->event_id = $otherEvent->id;
    $otherEnrollment->save();

    $this->actingAs($admin)
        ->post(route('admin.event.kenshi-exam-assessments.store', $event), [
            'category' => 'KYU-8',
            'assessments' => [[
                'event_participant_id' => $otherEnrollment->id,
                'scores' => completeKyuEightScores(),
                'status_override' => 'auto',
            ]],
        ])
        ->assertRedirect()
        ->assertSessionHasErrors('assessments');

    $this->assertDatabaseMissing('event_assessments', [
        'event_id' => $event->id,
        'event_participant_id' => $otherEnrollment->id,
        'category' => EventKenshiExamService::ASSESSMENT_CATEGORY,
    ]);
});
