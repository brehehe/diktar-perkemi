<?php

use App\Models\CbtExamPackage;
use App\Models\Event;
use App\Models\EventSession;
use App\Models\User;
use Database\Seeders\Jatim2026PenataranSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(Jatim2026PenataranSeeder::class);
    $this->event = Event::where('slug', Jatim2026PenataranSeeder::EVENT_SLUG)->firstOrFail();
    $this->admin = User::where('role', 'Admin')->first() ?? User::factory()->create(['role' => 'Admin']);
});

test('cbt packages are seeded with exact required durations and tracks', function () {
    // 1. Pre-Test Daerah (30 menit)
    $preDaerah = ['CBT-PRE-WAD-26' => ['WAD'], 'CBT-PRE-PED-26' => ['PED'], 'CBT-PRE-PD-26' => ['PD']];
    foreach ($preDaerah as $code => $tracks) {
        $pkg = CbtExamPackage::where('code', $code)->first();
        expect($pkg)->not->toBeNull()
            ->and($pkg->duration_minutes)->toBe(30)
            ->and($pkg->exam_type)->toBe('pre_test')
            ->and($pkg->target_tracks)->toBe($tracks)
            ->and($pkg->bankQuestions()->count())->toBeGreaterThan(0);
    }

    // 2. Pre-Test Nasional (45 menit)
    $preNasional = ['CBT-PRE-WAN-26' => ['WAN'], 'CBT-PRE-PEN-26' => ['PEN'], 'CBT-PRE-PN-26' => ['PN']];
    foreach ($preNasional as $code => $tracks) {
        $pkg = CbtExamPackage::where('code', $code)->first();
        expect($pkg)->not->toBeNull()
            ->and($pkg->duration_minutes)->toBe(45)
            ->and($pkg->exam_type)->toBe('pre_test')
            ->and($pkg->target_tracks)->toBe($tracks)
            ->and($pkg->bankQuestions()->count())->toBeGreaterThan(0);
    }

    // 3. Kuis Formatif (15 menit)
    $quizList = [
        'CBT-QUIZ-WAD-26' => ['WAD'],
        'CBT-QUIZ-WAN-26' => ['WAN'],
        'CBT-QUIZ-PED-26' => ['PED'],
        'CBT-QUIZ-PEN-26' => ['PEN'],
        'CBT-QUIZ-PD-26' => ['PD'],
        'CBT-QUIZ-PN-26' => ['PN'],
    ];
    foreach ($quizList as $code => $tracks) {
        $pkg = CbtExamPackage::where('code', $code)->first();
        expect($pkg)->not->toBeNull()
            ->and($pkg->duration_minutes)->toBe(15)
            ->and($pkg->exam_type)->toBe('module_eval')
            ->and($pkg->target_tracks)->toBe($tracks)
            ->and($pkg->bankQuestions()->count())->toBeGreaterThan(0);
    }

    // 4. Post-Test Daerah (60 menit)
    $postDaerah = ['CBT-POST-WAD-26' => ['WAD'], 'CBT-POST-PED-26' => ['PED'], 'CBT-POST-PD-26' => ['PD']];
    foreach ($postDaerah as $code => $tracks) {
        $pkg = CbtExamPackage::where('code', $code)->first();
        expect($pkg)->not->toBeNull()
            ->and($pkg->duration_minutes)->toBe(60)
            ->and($pkg->exam_type)->toBe('post_test')
            ->and($pkg->target_tracks)->toBe($tracks)
            ->and($pkg->bankQuestions()->count())->toBeGreaterThan(0);
    }

    // 5. Post-Test Nasional (90 menit)
    $postNasional = ['CBT-POST-WAN-26' => ['WAN'], 'CBT-POST-PEN-26' => ['PEN'], 'CBT-POST-PN-26' => ['PN']];
    foreach ($postNasional as $code => $tracks) {
        $pkg = CbtExamPackage::where('code', $code)->first();
        expect($pkg)->not->toBeNull()
            ->and($pkg->duration_minutes)->toBe(90)
            ->and($pkg->exam_type)->toBe('post_test')
            ->and($pkg->target_tracks)->toBe($tracks)
            ->and($pkg->bankQuestions()->count())->toBeGreaterThan(0);
    }
});

test('master modul soal, bank soal, and cbt paket ujian routes list seeded records', function () {
    // 1. Master Modul Soal
    $this->actingAs($this->admin)->get('/admin/master/modul-soal')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Master/QuestionModules/Index')
            ->has('modules.data')
        );

    // 2. Master Bank Soal
    $this->actingAs($this->admin)->get('/admin/master/bank-soal')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Master/QuestionBank/Index')
            ->has('questions.data')
        );

    // 3. Master CBT Paket Ujian
    $this->actingAs($this->admin)->get('/admin/cbt/paket-ujian')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Cbt/Packages/Index')
            ->has('packages.data')
        );
});

test('event rundown sessions match rundown csv tracks and support track updates', function () {
    // Check parallel sessions on Day 2
    $pltSession = EventSession::where('event_id', $this->event->id)
        ->where('session_type_code', 'PAR_PELATIH')
        ->firstOrFail();
    expect($pltSession->track_codes)->toBe(['PD', 'PN']);

    $pgjSession = EventSession::where('event_id', $this->event->id)
        ->where('session_type_code', 'PAR_PENGUJI')
        ->firstOrFail();
    expect($pgjSession->track_codes)->toBe(['PED', 'PEN']);

    $wstSession = EventSession::where('event_id', $this->event->id)
        ->where('session_type_code', 'PAR_WASIT')
        ->firstOrFail();
    expect($wstSession->track_codes)->toBe(['WAD', 'WAN']);

    // Check Pleno session has all tracks
    $plenoSession = EventSession::where('event_id', $this->event->id)
        ->where('session_type_code', 'PLENO')
        ->firstOrFail();
    expect($plenoSession->track_codes)->toEqualCanonicalizing(['PD', 'PN', 'PED', 'PEN', 'WAD', 'WAN']);

    // Update session target_tracks via PUT
    $response = $this->actingAs($this->admin)->put("/admin/event/{$this->event->id}/sesi/{$pltSession->id}", [
        'day_number' => $pltSession->day_number,
        'session_number' => $pltSession->session_number,
        'session_type_code' => $pltSession->session_type_code,
        'start_time' => '10:00',
        'end_time' => '11:30',
        'duration_jp' => 2,
        'topic' => $pltSession->topic,
        'subtopic' => $pltSession->subtopic,
        'room' => $pltSession->room,
        'target_tracks' => ['PD'], // updated to single track
        'attendance_setting' => 'check_in',
        'status' => 'scheduled',
    ]);

    $response->assertRedirect();
    $pltSession->refresh();
    expect($pltSession->track_codes)->toBe(['PD']);
});
