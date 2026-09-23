<?php

use App\Models\CbtExamPackage;
use App\Models\Event;
use App\Models\EventIntegrityPact;
use App\Models\Participant;
use App\Models\QuestionBank;
use App\Models\QuestionModule;
use Database\Seeders\Jatim2026PenataranSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(Jatim2026PenataranSeeder::class);
    $this->event = Event::where('slug', Jatim2026PenataranSeeder::EVENT_SLUG)->firstOrFail();
});

test('participant Pangesti Nurmadiah has exact profile and birthdate from simperkemi json', function () {
    $participant = Participant::where('kenshi_id_number', '07.1.13.01.24.012')->firstOrFail();

    expect($participant->name)->toContain('Pangesti Nurmadiah')
        ->and($participant->birth_date?->format('Y-m-d'))->toBe('1996-06-05')
        ->and($participant->birth_place)->toBe('Surabaya')
        ->and($participant->gender)->toBe('Female')
        ->and($participant->address)->toBe('Teluk Aru Utara No.61 B Surabaya')
        ->and($participant->phone)->toBe('083830248054')
        ->and($participant->occupation)->toBe('Pelajar / Mahasiswa')
        ->and($participant->last_certificate)->toBe('Pelatih Daerah')
        ->and($participant->last_certificate_number)->toBe('073/PLT-DRH/XII/2024')
        ->and($participant->target_certification)->toBe('Penguji Daerah')
        ->and($participant->simperkemi_data)->toBeArray()
        ->and($participant->simperkemi_data['bio_birthdate'])->toBe('1996-06-05');
});

test('all seeded participants have non-null birth_date and birth_place', function () {
    $total = Participant::count();
    expect($total)->toBeGreaterThanOrEqual(87);

    $withBirthdate = Participant::whereNotNull('birth_date')->count();
    expect($withBirthdate)->toBe($total);

    $withBirthplace = Participant::whereNotNull('birth_place')->count();
    expect($withBirthplace)->toBe($total);
});

test('cbt question banks and modules are seeded from excel files', function () {
    // Memastikan modul-modul CBT dari Excel ada
    $wadPre = QuestionModule::where('code', 'QM-WAD-PRE')->first();
    expect($wadPre)->not->toBeNull()
        ->and($wadPre->questions()->count())->toBeGreaterThan(0);

    $pedPre = QuestionModule::where('code', 'QM-PED-PRE')->first();
    expect($pedPre)->not->toBeNull()
        ->and($pedPre->questions()->count())->toBeGreaterThan(0);

    $wadPost = QuestionModule::where('code', 'QM-WAD-POST')->first();
    expect($wadPost)->not->toBeNull()
        ->and($wadPost->questions()->count())->toBeGreaterThan(0);

    // Memastikan total butir soal di QuestionBank terisi ratusan soal dari Excel
    $totalQuestions = QuestionBank::count();
    expect($totalQuestions)->toBeGreaterThan(200);

    // Memastikan paket CBT terhubung ke butir soal
    $package = CbtExamPackage::where('code', 'CBT-PRE-WAD-26')->first();
    expect($package)->not->toBeNull()
        ->and($package->bankQuestions()->count())->toBeGreaterThan(0);
});

test('past event graduates have digitally signed integrity pacts seeded', function () {
    $pacts = EventIntegrityPact::where('status', 'signed')->get();

    expect($pacts->count())->toBeGreaterThan(0);

    $samplePact = $pacts->first();
    expect($samplePact->signature_data)->not->toBeNull()
        ->and($samplePact->signature_data)->toStartWith('data:image/')
        ->and($samplePact->signed_at)->not->toBeNull()
        ->and($samplePact->full_name)->not->toBeEmpty();
});
