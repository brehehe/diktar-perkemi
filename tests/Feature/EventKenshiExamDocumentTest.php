<?php

use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\User;
use App\Services\EventKenshiExamService;
use Database\Seeders\EventManagementSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use PhpOffice\PhpSpreadsheet\IOFactory;

uses(RefreshDatabase::class);

function saveKenshiDocumentScores(
    Event $event,
    EventParticipant $enrollment,
    string $statusOverride = 'auto',
    float|string|null $totalScoreOverride = null,
): void {
    app(EventKenshiExamService::class)->saveBulk($event, [
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
        'assessments' => [[
            'event_participant_id' => $enrollment->id,
            'status_override' => $statusOverride,
            'total_score_override' => $totalScoreOverride,
            'scores' => [
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
            ],
        ]],
    ]);
}

beforeEach(function () {
    $this->seed(EventManagementSeeder::class);
    $this->event = Event::firstOrFail();
    $this->event->update([
        'event_type' => 'ukt',
        'title' => 'Ujian Kenaikan Tingkat Surabaya',
        'slug' => 'ujian-kenaikan-tingkat-surabaya',
        'start_date' => '2026-10-03',
        'end_date' => '2026-10-04',
        'location' => 'Gelanggang Remaja Surabaya',
        'organizer' => 'Pengkot PERKEMI Surabaya',
    ]);

    $this->enrollment = EventParticipant::whereBelongsTo($this->event)->firstOrFail();
    $this->enrollment->update([
        'track_code' => 'KYU-8',
        'graduation_status' => 'Lulus',
    ]);
    $this->enrollment->participant->update([
        'name' => 'Kenshi Uji Surabaya',
        'kenshi_id_number' => '35.78.001',
        'gender' => 'female',
        'birth_date' => '2010-05-10',
        'origin_dojo' => 'Dojo Ketabang',
        'origin_city' => 'Kota Surabaya',
        'origin_province' => 'Jawa Timur',
    ]);

    $this->admin = User::factory()->create(['role' => 'Admin']);
});

test('event summary exposes the kenshi exam event type', function () {
    $this->actingAs($this->admin)
        ->get(route('admin.event.show', ['event' => $this->event, 'tab' => 'ringkasan']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Events/Show')
            ->where('event.event_type', 'ukt')
        );
});

test('admin can download a technique assessment populated by kyu category', function () {
    saveKenshiDocumentScores($this->event, $this->enrollment);

    $response = $this->actingAs($this->admin)
        ->get(route('admin.event.kenshi-exam-documents.show', [
            'event' => $this->event,
            'document' => 'penilaian-teknik',
        ]))
        ->assertOk()
        ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    $spreadsheet = IOFactory::load($response->baseResponse->getFile()->getPathname());
    $sheet = $spreadsheet->getSheetByName('8 KYU');
    $recapSheet = $spreadsheet->getSheetByName('F-27 Rekap');
    $danSheet = $spreadsheet->getSheetByName('1 DAN');

    expect($spreadsheet->getSheetNames())->toContain(
        '8 KYU',
        '7 KYU',
        '6 KYU',
        '5 KYU',
        '4 KYU',
        '3 KYU',
        '3 KYU (Hal 2)',
        '2 KYU',
        '2 KYU (Hal 2)',
        '1 KYU',
        '1 KYU (Hal 2)',
        '1 DAN',
        '1 DAN (Hal 2)',
        'F-27 Rekap',
    )->and($sheet)->not->toBeNull()
        ->and($sheet->getCell('B8')->getValue())->toBe('Kenshi Uji Surabaya')
        ->and($sheet->getCell('C8')->getValue())->toBe('35.78.001')
        ->and($sheet->getCell('E8')->getValue())->toBe('P')
        ->and($sheet->getCell('G8')->getValue())->toBe(40.0)
        ->and($sheet->getCell('K8')->getValue())->toBe(100.0)
        ->and($sheet->getCell('V8')->getValue())->toBe(300.0)
        ->and($sheet->getCell('C32')->getValue())->toBe('Sensei Utama')
        ->and($sheet->getCell('C33')->getValue())->toBe('V DAN')
        ->and($sheet->getCell('F32')->getValue())->toBe('Sensei Kedua')
        ->and($sheet->getCell('R32')->getValue())->toBe('Sensei Ketiga')
        ->and($recapSheet->getCell('B9')->getValue())->toBe('Kenshi Uji Surabaya')
        ->and($recapSheet->getCell('G9')->getValue())->toBe(100.0)
        ->and($recapSheet->getCell('I9')->getValue())->toBe(300.0)
        ->and($recapSheet->getCell('J9')->getValue())->toBe(400.0)
        ->and($recapSheet->getCell('K9')->getValue())->toBe('L')
        ->and($recapSheet->getCell('A51')->getValue())->toBe('1. Kegiatan : Ujian Kenaikan Tingkat Surabaya')
        ->and($recapSheet->getCell('E54')->getValue())->toBe('Nama : Koordinator Penguji')
        ->and($recapSheet->getCell('I54')->getValue())->toBe('Nama : Ketua Panitia')
        ->and($recapSheet->getCell('B417')->getValue())->toBeNull()
        ->and($danSheet->getCell('B8')->getValue())->toBeNull();
});

test('admin can download score tabulation with one sheet per kyu category', function () {
    saveKenshiDocumentScores($this->event, $this->enrollment);

    $response = $this->actingAs($this->admin)
        ->get(route('admin.event.kenshi-exam-documents.show', [
            'event' => $this->event,
            'document' => 'tabulasi-penilaian',
        ]))
        ->assertOk();

    $spreadsheet = IOFactory::load($response->baseResponse->getFile()->getPathname());
    $sheet = $spreadsheet->getSheetByName('KYU 8');

    expect($sheet)->not->toBeNull()
        ->and($sheet->getCell('A11')->getValue())->toBe('Menuju KYU 8')
        ->and($sheet->getCell('B15')->getValue())->toBe('Kenshi Uji Surabaya')
        ->and((float) $sheet->getCell('E15')->getValue())->toBe(50.0)
        ->and((float) $sheet->getCell('F15')->getValue())->toBe(50.0)
        ->and((float) $sheet->getCell('G15')->getValue())->toBe(200.0)
        ->and((float) $sheet->getCell('H15')->getValue())->toBe(100.0)
        ->and((float) $sheet->getCell('I15')->getValue())->toBe(400.0)
        ->and($sheet->getCell('J15')->getValue())->toBe('L')
        ->and($sheet->getCell('E37')->getValue())->toBe('Nama : Koordinator Penguji')
        ->and($sheet->getCell('H37')->getValue())->toBe('Nama : Ketua Panitia');
});

test('score tabulation export uses the manually corrected final score', function () {
    saveKenshiDocumentScores($this->event, $this->enrollment, 'auto', 350);

    $response = $this->actingAs($this->admin)
        ->get(route('admin.event.kenshi-exam-documents.show', [
            'event' => $this->event,
            'document' => 'tabulasi-penilaian',
        ]))
        ->assertOk();

    $spreadsheet = IOFactory::load($response->baseResponse->getFile()->getPathname());
    $sheet = $spreadsheet->getSheetByName('KYU 8');

    expect((float) $sheet->getCell('I15')->getValue())->toBe(350.0);
});

test('admin can download result report populated with names and graduation status', function () {
    saveKenshiDocumentScores($this->event, $this->enrollment, 'absent');

    $response = $this->actingAs($this->admin)
        ->get(route('admin.event.kenshi-exam-documents.show', [
            'event' => $this->event,
            'document' => 'laporan-hasil',
        ]))
        ->assertOk();

    $spreadsheet = IOFactory::load($response->baseResponse->getFile()->getPathname());
    $sheet = $spreadsheet->getSheetByName('KYU 8');

    expect($sheet)->not->toBeNull()
        ->and($sheet->getCell('D9')->getValue())->toBe('KYU 8')
        ->and($sheet->getCell('D11')->getValue())->toBe('045/PB-PERKEMI/IX/2026')
        ->and($sheet->getCell('H11')->getValue())->toBe('20-09-2026')
        ->and($sheet->getCell('E12')->getValue())->toBe('Sensei Utama')
        ->and($sheet->getCell('H12')->getValue())->toBe('SP-001')
        ->and($sheet->getCell('B17')->getValue())->toBe('Kenshi Uji Surabaya')
        ->and($sheet->getCell('G17')->getValue())->toBe('TIDAK HADIR')
        ->and($sheet->getCell('F43')->getValue())->toBe('Nama : Ketua Panitia')
        ->and($sheet->getCell('F44')->getValue())->toBe('Jabatan : Ketua Pengkot');
});

test('admin can download kyu dan report populated from event participants', function () {
    saveKenshiDocumentScores($this->event, $this->enrollment);

    $response = $this->actingAs($this->admin)
        ->get(route('admin.event.kenshi-exam-documents.show', [
            'event' => $this->event,
            'document' => 'laporan-kyu-dan',
        ]))
        ->assertOk();

    $spreadsheet = IOFactory::load($response->baseResponse->getFile()->getPathname());
    $sheet = $spreadsheet->getSheetByName('Data Kyu');
    $dataDanSheet = $spreadsheet->getSheetByName('Data Dan');
    $reportSheet = $spreadsheet->getSheetByName('KYU Report');

    expect($spreadsheet->getSheetNames())->toBe(['Data Kyu', 'KYU Report', 'Data Dan', '1st DAN Report', 'Masterdata'])
        ->and($sheet->getCell('B6')->getValue())->toBe('Kenshi Uji Surabaya')
        ->and($sheet->getCell('C6')->getValue())->toBe('35.78.001')
        ->and($sheet->getCell('D6')->getValue())->toBe('Female')
        ->and($sheet->getCell('I6')->getValue())->toBe('8 KYU')
        ->and($sheet->getCell('N6')->getValue())->toBe('LULUS')
        ->and($sheet->getCell('B7')->getValue())->toBeNull()
        ->and($dataDanSheet->getCell('B6')->getValue())->toBeNull()
        ->and($reportSheet->getCell('F65')->getValue())->toBe('Sensei Utama (V DAN)');
});
