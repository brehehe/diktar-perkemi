<?php

use App\Jobs\GenerateEventDocuments;
use App\Models\CbtExamAttempt;
use App\Models\CbtExamPackage;
use App\Models\CbtQuestion;
use App\Models\Event;
use App\Models\EventFinance;
use App\Models\EventParticipant;
use App\Models\EventStaff;
use App\Models\FinanceCategory;
use App\Models\Participant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use PhpOffice\PhpSpreadsheet\IOFactory;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('local');
    $this->event = Event::create([
        'title' => 'Penataran Uji Laporan',
        'slug' => 'penataran-uji-laporan',
        'start_date' => '2026-09-20',
        'end_date' => '2026-09-22',
        'location' => 'Jakarta',
        'organizer' => 'PB PERKEMI',
        'status' => 'ongoing',
    ]);
    $this->admin = User::factory()->create(['role' => 'Admin']);
});

test('admin can open event reports and record a finance transaction', function () {
    $this->actingAs($this->admin)
        ->get(route('admin.event.reports.index', $this->event))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Events/Reports')
            ->where('event.id', $this->event->id)
            ->where('permissions.manage_finance', true)
            ->has('financeCategories', 9)
            ->where('financeAnalysis.transaction_count', 0));

    $this->post(route('admin.event.reports.finance.store', $this->event), [
        'type' => 'income',
        'category' => 'sponsorship',
        'description' => 'Dukungan sponsor utama',
        'sponsor_name' => 'Mitra Pendidikan',
        'amount' => 4000000,
        'occurred_on' => '2026-09-20',
    ])->assertRedirect()->assertSessionHasNoErrors();

    $this->assertDatabaseHas('event_finances', [
        'event_id' => $this->event->id,
        'created_by' => $this->admin->id,
        'amount' => 4000000,
    ]);
});

test('admin can manage finance categories and cannot delete a category in use', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.finance.categories.store'), [
            'name' => 'Dokumentasi Kegiatan',
            'transaction_type' => 'expense',
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $category = FinanceCategory::query()->where('code', 'dokumentasi_kegiatan')->firstOrFail();

    $this->put(route('admin.finance.categories.update', $category), [
        'name' => 'Dokumentasi & Publikasi',
        'transaction_type' => 'both',
    ])->assertRedirect()->assertSessionHasNoErrors();

    $this->assertDatabaseHas('finance_categories', [
        'id' => $category->id,
        'name' => 'Dokumentasi & Publikasi',
        'transaction_type' => 'both',
    ]);

    $unusedCategory = FinanceCategory::factory()->create([
        'code' => 'kategori_sementara',
        'name' => 'Kategori Sementara',
        'transaction_type' => 'expense',
    ]);

    $this->delete(route('admin.finance.categories.destroy', $unusedCategory))
        ->assertRedirect()
        ->assertSessionHas('success', 'Kategori keuangan berhasil dihapus.');

    $this->assertModelMissing($unusedCategory);

    EventFinance::create([
        'event_id' => $this->event->id,
        'type' => 'expense',
        'category' => $category->code,
        'description' => 'Dokumentasi acara',
        'amount' => 750000,
        'occurred_on' => '2026-09-20',
    ]);

    $this->delete(route('admin.finance.categories.destroy', $category))
        ->assertRedirect()
        ->assertSessionHas('error', 'Kategori tidak dapat dihapus karena sudah dipakai pada transaksi keuangan.');

    $this->assertModelExists($category);

    $this->put(route('admin.finance.categories.update', $category), [
        'name' => 'Dokumentasi & Publikasi',
        'transaction_type' => 'income',
    ])->assertSessionHasErrors('transaction_type');

    expect($category->refresh()->transaction_type)->toBe('both');
});

test('unassigned treasurer cannot change the finance category master', function () {
    $treasurer = User::factory()->create(['role' => 'Bendahara']);

    $this->actingAs($treasurer)
        ->post(route('admin.finance.categories.store'), [
            'name' => 'Kategori Tanpa Izin',
            'transaction_type' => 'expense',
        ])->assertForbidden();

    $this->assertDatabaseMissing('finance_categories', ['name' => 'Kategori Tanpa Izin']);
});

test('reporting staff cannot preview event finance without finance access', function () {
    $documentation = User::factory()->create(['role' => 'Dokumentasi']);
    EventStaff::create([
        'event_id' => $this->event->id,
        'user_id' => $documentation->id,
        'duty' => 'dokumentasi',
    ]);

    $this->actingAs($documentation)
        ->get(route('admin.event.reports.preview', ['event' => $this->event, 'report' => 'attendance']))
        ->assertOk();

    $this->get(route('admin.event.reports.preview', ['event' => $this->event, 'report' => 'finance']))
        ->assertForbidden();
});

test('finance transaction validation follows the selected master category type', function () {
    $category = FinanceCategory::factory()->create([
        'code' => 'dokumentasi',
        'name' => 'Dokumentasi',
        'transaction_type' => 'expense',
    ]);

    $this->actingAs($this->admin)
        ->post(route('admin.finance.store'), [
            'event_id' => $this->event->id,
            'type' => 'expense',
            'category' => $category->code,
            'description' => 'Dokumentasi kegiatan',
            'amount' => 800000,
            'occurred_on' => '2026-09-20',
        ])->assertRedirect()->assertSessionHasNoErrors();

    $this->post(route('admin.event.reports.finance.store', $this->event), [
        'type' => 'income',
        'category' => $category->code,
        'description' => 'Kategori tidak sesuai',
        'amount' => 800000,
        'occurred_on' => '2026-09-20',
    ])->assertSessionHasErrors('category');

    $this->assertDatabaseCount('event_finances', 1);
});

test('report previews use the same rows and labels as excel exports', function () {
    $participant = Participant::create(['name' => 'Kenshi Preview', 'kenshi_id_number' => '88.99.00']);
    EventParticipant::create([
        'event_id' => $this->event->id,
        'participant_id' => $participant->id,
        'track_code' => 'PD',
    ]);
    $category = FinanceCategory::query()->where('code', 'consumption')->firstOrFail();
    $category->update(['name' => 'Konsumsi Kegiatan']);
    EventFinance::create([
        'event_id' => $this->event->id,
        'created_by' => $this->admin->id,
        'type' => 'expense',
        'category' => $category->code,
        'description' => 'Konsumsi peserta',
        'amount' => 1250000,
        'occurred_on' => '2026-09-20',
    ]);

    $this->actingAs($this->admin)
        ->get(route('admin.event.reports.preview', ['event' => $this->event, 'report' => 'attendance']))
        ->assertOk()
        ->assertJsonPath('sheets.0.name', 'Absensi')
        ->assertJsonPath('sheets.0.rows.0.1', 'Kenshi Preview');

    $this->get(route('admin.event.reports.preview', ['event' => $this->event, 'report' => 'outcomes']))
        ->assertOk()
        ->assertJsonPath('sheets.0.name', 'Capaian')
        ->assertJsonPath('sheets.0.rows.0.1', 'Kenshi Preview');

    $this->get(route('admin.event.reports.preview', ['event' => $this->event, 'report' => 'completeness']))
        ->assertOk()
        ->assertJsonCount(2, 'sheets')
        ->assertJsonPath('sheets.1.name', 'Riwayat CBT');

    $financePreview = $this->get(route('admin.event.reports.preview', ['event' => $this->event, 'report' => 'finance']))
        ->assertOk()
        ->assertJsonPath('sheets.0.rows.0.3', 'Konsumsi Kegiatan');

    $export = $this->get(route('admin.event.reports.finance.export', $this->event))->assertOk();
    $workbook = IOFactory::load($export->baseResponse->getFile()->getPathname());

    expect($workbook->getActiveSheet()->getCell('D8')->getValue())
        ->toBe($financePreview->json('sheets.0.rows.0.3'));

    $workbook->disconnectWorksheets();
});

test('authorized user can export cbt exam results with provisional scores to excel', function () {
    $participant = Participant::create([
        'name' => 'Kenshi Nilai Sementara',
        'kenshi_id_number' => '00.12.345',
        'origin_dojo' => 'Dojo Pengujian',
    ]);
    EventParticipant::create([
        'event_id' => $this->event->id,
        'participant_id' => $participant->id,
        'track_code' => 'PD',
    ]);
    $package = CbtExamPackage::create([
        'event_id' => $this->event->id,
        'title' => 'Ujian Teori UKT Kyu 3',
        'code' => 'CBT-UKT-KYU3-EXPORT',
        'exam_type' => 'theory',
        'total_questions' => 2,
        'duration_minutes' => 60,
        'passing_score' => 70,
        'attempts_allowed' => 1,
        'status' => 'open',
    ]);
    $correctQuestion = CbtQuestion::create([
        'cbt_exam_package_id' => $package->id,
        'question_text' => 'Soal benar',
        'question_type' => 'single_choice',
        'options' => ['A' => 'Benar', 'B' => 'Salah'],
        'correct_answer' => ['A'],
        'points' => 1,
        'sort_order' => 1,
        'is_active' => true,
    ]);
    $incorrectQuestion = CbtQuestion::create([
        'cbt_exam_package_id' => $package->id,
        'question_text' => 'Soal salah',
        'question_type' => 'single_choice',
        'options' => ['A' => 'Benar', 'B' => 'Salah'],
        'correct_answer' => ['A'],
        'points' => 1,
        'sort_order' => 2,
        'is_active' => true,
    ]);
    CbtExamAttempt::create([
        'cbt_exam_package_id' => $package->id,
        'event_id' => $this->event->id,
        'participant_id' => $participant->id,
        'attempt_number' => 1,
        'started_at' => now()->subMinutes(10),
        'status' => 'in_progress',
        'answers' => [
            (string) $correctQuestion->id => 'A',
            (string) $incorrectQuestion->id => 'B',
        ],
        'question_order' => [$correctQuestion->id, $incorrectQuestion->id],
    ]);

    $response = $this->actingAs($this->admin)
        ->get(route('admin.event.reports.exam-attempts.export', $this->event))
        ->assertOk()
        ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    expect($response->headers->get('content-disposition'))->toContain('hasil-ujian-cbt-');

    $workbook = IOFactory::load($response->baseResponse->getFile()->getPathname());
    $sheet = $workbook->getSheetByName('Riwayat CBT');

    expect($sheet)->not->toBeNull()
        ->and($sheet->getCell('B8')->getValue())->toBe('Kenshi Nilai Sementara')
        ->and($sheet->getCell('C8')->getValue())->toBe('00.12.345')
        ->and($sheet->getCell('K8')->getValue())->toBe('Sementara')
        ->and((float) $sheet->getCell('L8')->getValue())->toBe(50.0)
        ->and((int) $sheet->getCell('O8')->getValue())->toBe(2)
        ->and((int) $sheet->getCell('P8')->getValue())->toBe(2);

    $workbook->disconnectWorksheets();

    $participantUser = User::factory()->create(['role' => 'Peserta']);
    $this->actingAs($participantUser)
        ->get(route('admin.event.reports.exam-attempts.export', $this->event))
        ->assertForbidden();
});

test('assigned reporting staff only manages the matching event duty', function () {
    $treasurer = User::factory()->create(['role' => 'Bendahara']);
    EventStaff::create(['event_id' => $this->event->id, 'user_id' => $treasurer->id, 'duty' => 'bendahara']);

    $this->actingAs($treasurer)
        ->post(route('admin.event.reports.finance.store', $this->event), [
            'type' => 'expense',
            'category' => 'consumption',
            'description' => 'Konsumsi peserta',
            'amount' => 1250000,
            'occurred_on' => '2026-09-21',
        ])->assertRedirect()->assertSessionHasNoErrors();

    $this->post(route('admin.event.reports.activity.store', $this->event), [
        'kind' => 'realisation',
        'title' => 'Pembukaan',
        'activity_type' => 'Seremoni',
        'occurred_on' => '2026-09-20',
    ])->assertForbidden();
});

test('admin cannot assign event reporting access to an unrelated role', function () {
    $participantUser = User::factory()->create(['role' => 'Peserta']);

    $this->actingAs($this->admin)
        ->post(route('admin.event.reports.staff.store', $this->event), [
            'user_id' => $participantUser->id,
            'duty' => 'bendahara',
        ])->assertSessionHasErrors('user_id');

    $this->assertDatabaseMissing('event_staff', [
        'event_id' => $this->event->id,
        'user_id' => $participantUser->id,
    ]);
});

test('documentation staff can upload media and cannot access another event', function () {
    $documentation = User::factory()->create(['role' => 'Dokumentasi']);
    EventStaff::create(['event_id' => $this->event->id, 'user_id' => $documentation->id, 'duty' => 'dokumentasi']);

    $this->actingAs($documentation)
        ->post(route('admin.event.reports.activity.store', $this->event), [
            'kind' => 'documentation',
            'title' => 'Pembukaan resmi',
            'activity_type' => 'Pembukaan',
            'occurred_on' => '2026-09-20',
            'media' => UploadedFile::fake()->image('pembukaan.jpg'),
        ])->assertRedirect()->assertSessionHasNoErrors();

    $record = $this->event->activityRecords()->firstOrFail();
    Storage::disk('local')->assertExists($record->file_path);

    $otherEvent = Event::create([
        'title' => 'Event Lain', 'slug' => 'event-lain', 'start_date' => '2026-10-01',
        'end_date' => '2026-10-02', 'location' => 'Bandung', 'organizer' => 'Pengprov',
    ]);
    $this->get(route('admin.event.reports.index', $otherEvent))->assertForbidden();
});

test('finance analysis and excel exports use persisted event data', function () {
    $participant = Participant::create(['name' => 'Kenshi Laporan', 'kenshi_id_number' => '10.20.30']);
    EventParticipant::create([
        'event_id' => $this->event->id,
        'participant_id' => $participant->id,
        'track_code' => 'PD',
    ]);
    EventFinance::create([
        'event_id' => $this->event->id, 'created_by' => $this->admin->id, 'type' => 'income',
        'category' => 'sponsorship', 'description' => 'Sponsor', 'sponsor_name' => 'Mitra',
        'amount' => 4000000, 'occurred_on' => '2026-09-20',
    ]);
    EventFinance::create([
        'event_id' => $this->event->id, 'created_by' => $this->admin->id, 'type' => 'expense',
        'category' => 'accommodation', 'description' => 'Hotel', 'amount' => 2500000, 'occurred_on' => '2026-09-21',
    ]);

    $this->actingAs($this->admin)
        ->get(route('admin.event.reports.index', $this->event))
        ->assertInertia(fn (Assert $page) => $page
            ->where('financeAnalysis.income', 4000000)
            ->where('financeAnalysis.expense', 2500000)
            ->where('financeAnalysis.sponsor_share', 100)
            ->where('financeAnalysis.dominant_expense.category', 'accommodation')
            ->where('financeAnalysis.projected_next_balance', null)
            ->where('financeAnalysis.projection_period_count', 1)
            ->where('financeAnalysis.recommendations', [
                'Negosiasi akomodasi dengan vendor untuk menekan biaya.',
                'Diversifikasi sumber dana dengan menjajaki sponsor sektor pendidikan dan teknologi.',
                'Gunakan survei digital untuk mengukur kepuasan peserta; data survei belum tersedia di laporan keuangan.',
            ]));

    foreach (['attendance', 'outcomes', 'completeness', 'finance'] as $export) {
        $response = $this->get(route("admin.event.reports.{$export}.export", $this->event))
            ->assertOk()
            ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        if ($export === 'attendance') {
            $workbook = IOFactory::load($response->baseResponse->getFile()->getPathname());
            expect($workbook->getActiveSheet()->getCell('B8')->getValue())->toBe('Kenshi Laporan');
            $workbook->disconnectWorksheets();
        }
    }
});

test('master finance is restricted and supports event filtering', function () {
    EventFinance::create([
        'event_id' => $this->event->id, 'created_by' => $this->admin->id, 'type' => 'expense',
        'category' => 'printing', 'description' => 'Cetak materi', 'amount' => 500000,
        'occurred_on' => '2026-09-20',
    ]);
    $unassignedTreasurer = User::factory()->create(['role' => 'Bendahara']);

    $this->actingAs($unassignedTreasurer)
        ->get(route('admin.finance.index'))
        ->assertForbidden();

    $this->actingAs($this->admin)
        ->get(route('admin.finance.index', ['event' => $this->event->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Finance/Index')
            ->where('transactions.total', 1)
            ->where('transactions.data.0.description', 'Cetak materi')
            ->where('filters.event', $this->event->id));
});

test('filtered finance analysis stays empty when another event has transactions', function () {
    $otherEvent = Event::create([
        'title' => 'Event Dengan Transaksi', 'slug' => 'event-dengan-transaksi',
        'start_date' => '2026-10-01', 'end_date' => '2026-10-02',
        'location' => 'Bandung', 'organizer' => 'Pengprov',
    ]);
    EventFinance::create([
        'event_id' => $otherEvent->id, 'type' => 'income', 'category' => 'sponsorship',
        'description' => 'Sponsor event lain', 'amount' => 4000000, 'occurred_on' => '2026-10-01',
    ]);

    $this->actingAs($this->admin)
        ->get(route('admin.finance.index', ['event' => $this->event->id]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('analysis.transaction_count', 0)
            ->where('analysis.sponsor_share', null)
            ->where('analysis.projected_next_balance', null)
            ->where('analysis.recommendations', [])
            ->where('overallAnalysis.income', 4000000));
});

test('finance insights calculate sponsor share and projection from three recorded periods', function () {
    foreach (['2026-07', '2026-08', '2026-09'] as $month) {
        foreach ([
            ['income', 'sponsorship', 800000],
            ['income', 'registration', 1200000],
            ['expense', 'accommodation', 1000000],
        ] as [$type, $category, $amount]) {
            EventFinance::create([
                'event_id' => $this->event->id,
                'type' => $type,
                'category' => $category,
                'description' => $category,
                'amount' => $amount,
                'occurred_on' => $month.'-15',
            ]);
        }
    }

    $this->actingAs($this->admin)
        ->get(route('admin.finance.index', ['event' => $this->event->id]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('analysis.income', 6000000)
            ->where('analysis.expense', 3000000)
            ->where('analysis.sponsor_share', 40)
            ->where('analysis.accommodation_consumption_share', 100)
            ->where('analysis.projected_next_balance_text', 'Rp 4.100.000 – Rp 4.150.000')
            ->where('analysis.projection_period_count', 3));
});

test('assigned treasurer sees only assigned event finances and export', function () {
    $treasurer = User::factory()->create(['role' => 'Bendahara']);
    EventStaff::create(['event_id' => $this->event->id, 'user_id' => $treasurer->id, 'duty' => 'bendahara']);
    $otherEvent = Event::create([
        'title' => 'Event Rahasia', 'slug' => 'event-rahasia',
        'start_date' => '2026-10-01', 'end_date' => '2026-10-02',
        'location' => 'Bandung', 'organizer' => 'Pengprov',
    ]);
    foreach ([$this->event, $otherEvent] as $event) {
        EventFinance::create([
            'event_id' => $event->id, 'type' => 'income', 'category' => 'registration',
            'description' => 'Dana '.$event->title, 'amount' => 1000000, 'occurred_on' => '2026-09-20',
        ]);
    }

    $this->actingAs($treasurer)
        ->get(route('admin.finance.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('transactions.total', 1)
            ->where('analysis.income', 1000000)
            ->has('eventSummaries', 1)
            ->has('events', 1));
    $this->get(route('admin.finance.index', ['event' => $otherEvent->id]))->assertNotFound();
    $this->get(route('admin.finance.export', ['event' => $otherEvent->id]))->assertNotFound();

    $response = $this->get(route('admin.finance.export'))->assertOk();
    $workbook = IOFactory::load($response->baseResponse->getFile()->getPathname());
    expect($workbook->getSheetByName('Rekap per Event')->getCell('B6')->getValue())->toBe($this->event->name);
    expect($workbook->getSheetByName('Rekap per Event')->getCell('B7')->getValue())->toBeNull();
    $workbook->disconnectWorksheets();
});

test('Sumopod narrative uses aggregate event data and is reused while finances are unchanged', function () {
    Config::set('services.sumopod.key', 'test-sumopod-key');
    Config::set('services.sumopod.finance_model', 'deepseek-v4-flash');
    Http::preventStrayRequests();
    Http::fake([
        'ai.sumopod.com/v1/chat/completions' => Http::response([
            'choices' => [
                ['message' => ['role' => 'assistant', 'content' => 'Biaya akomodasi perlu ditinjau bersama vendor.']],
            ],
        ]),
    ]);
    EventFinance::create([
        'event_id' => $this->event->id, 'type' => 'expense', 'category' => 'accommodation',
        'description' => 'Hotel Rahasia', 'amount' => 1500000, 'occurred_on' => '2026-09-20',
    ]);

    $this->actingAs($this->admin)
        ->post(route('admin.finance.ai.generate'), ['event' => $this->event->id])
        ->assertRedirect()
        ->assertSessionHas('success');
    $this->post(route('admin.finance.ai.generate'), ['event' => $this->event->id])
        ->assertRedirect();
    $this->get(route('admin.event.reports.index', $this->event))
        ->assertInertia(fn (Assert $page) => $page
            ->where('financeAnalysis.ai_configured', true)
            ->where('financeAnalysis.ai_narrative', 'Biaya akomodasi perlu ditinjau bersama vendor.'));
    $this->get(route('admin.finance.index', ['event' => $this->event->id]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('analysis.ai_narrative', 'Biaya akomodasi perlu ditinjau bersama vendor.'));
    $this->get(route('admin.event.show', ['event' => $this->event->id, 'tab' => 'keuangan']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('financeAnalysis.ai_narrative', 'Biaya akomodasi perlu ditinjau bersama vendor.'));

    Http::assertSentCount(1);
    Http::assertSent(fn ($request) => $request->url() === 'https://ai.sumopod.com/v1/chat/completions'
        && $request->hasHeader('Authorization', 'Bearer test-sumopod-key')
        && $request['model'] === 'deepseek-v4-flash'
        && $request['max_tokens'] === 300
        && $request['thinking'] === ['type' => 'disabled']
        && $request['messages'][0]['role'] === 'system'
        && $request['messages'][1]['role'] === 'user'
        && ! str_contains($request['messages'][1]['content'], 'Hotel Rahasia'));
});

test('Sumopod narrative requires configuration and finance access', function () {
    Config::set('services.sumopod.key', null);
    Http::preventStrayRequests();
    Http::fake(['ai.sumopod.com/v1/chat/completions' => Http::response([])]);
    EventFinance::create([
        'event_id' => $this->event->id, 'type' => 'income', 'category' => 'registration',
        'description' => 'Pendaftaran', 'amount' => 1000000, 'occurred_on' => '2026-09-20',
    ]);

    $this->actingAs($this->admin)
        ->post(route('admin.finance.ai.generate'), ['event' => $this->event->id])
        ->assertRedirect()
        ->assertSessionHas('error');

    $treasurer = User::factory()->create(['role' => 'Bendahara']);
    $this->actingAs($treasurer)
        ->post(route('admin.finance.ai.generate'), ['event' => $this->event->id])
        ->assertNotFound();

    Http::assertNothingSent();
});

test('Sumopod failure keeps the numeric finance dashboard available', function () {
    Config::set('services.sumopod.key', 'test-sumopod-key');
    Http::preventStrayRequests();
    Http::fake(['ai.sumopod.com/v1/chat/completions' => Http::response(['error' => ['message' => 'Unavailable']], 503)]);
    EventFinance::create([
        'event_id' => $this->event->id, 'type' => 'expense', 'category' => 'printing',
        'description' => 'Materi cetak', 'amount' => 725000, 'occurred_on' => '2026-09-20',
    ]);

    $this->actingAs($this->admin)
        ->post(route('admin.finance.ai.generate'), ['event' => $this->event->id])
        ->assertRedirect()
        ->assertSessionHas('error');
    $this->get(route('admin.event.reports.index', $this->event))
        ->assertInertia(fn (Assert $page) => $page
            ->where('financeAnalysis.expense', 725000)
            ->where('financeAnalysis.ai_narrative', null));

    Http::assertSentCount(1);
});

test('certificate generation is dispatched to the queue', function () {
    Queue::fake([GenerateEventDocuments::class]);
    $participant = Participant::create(['name' => 'Kenshi Queue', 'kenshi_id_number' => '01.02.03']);
    $enrollment = EventParticipant::create([
        'event_id' => $this->event->id,
        'participant_id' => $participant->id,
        'track_code' => 'PD',
    ]);

    $this->actingAs($this->admin)
        ->post(route('admin.event.certificate.generate', [$this->event, $enrollment]), [
            'certificate_number' => '001/PLT-DRH/IX/2026',
        ])->assertRedirect()->assertSessionHasNoErrors();

    Queue::assertPushed(GenerateEventDocuments::class, fn (GenerateEventDocuments $job) => $job->eventParticipantId === $enrollment->id
        && $job->type === 'certificate'
        && $job->documentTrack === 'PD');
});

test('admin can export master finance to excel', function () {
    EventFinance::create([
        'event_id' => $this->event->id, 'created_by' => $this->admin->id, 'type' => 'income',
        'category' => 'sponsorship', 'description' => 'Sponsor Nasional', 'amount' => 5000000,
        'occurred_on' => '2026-09-20',
    ]);

    $this->actingAs($this->admin)
        ->get(route('admin.finance.export'))
        ->assertOk()
        ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
});

test('event detail page contains unified reports payload directly in tabs', function () {
    EventFinance::create([
        'event_id' => $this->event->id, 'created_by' => $this->admin->id, 'type' => 'income',
        'category' => 'sponsorship', 'description' => 'Sponsor AI', 'amount' => 6000000,
        'occurred_on' => '2026-09-20',
    ]);

    $this->actingAs($this->admin)
        ->get(route('admin.event.show', ['event' => $this->event->id, 'tab' => 'keuangan']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Events/Show')
            ->where('event.id', $this->event->id)
            ->has('finances', 1)
            ->has('financeAnalysis')
            ->where('financeAnalysis.income', 6000000)
            ->has('activities')
            ->has('staff')
            ->has('reportPermissions')
            ->has('outcomesSummary')
            ->has('reportSessions'));
});

test('quick access routes redirect to matching event tab', function () {
    $this->actingAs($this->admin)
        ->get(route('admin.reports.documentation'))
        ->assertRedirect(route('admin.event.show', ['event' => $this->event->id, 'tab' => 'dokumentasi']));

    $this->actingAs($this->admin)
        ->get(route('admin.reports.realisation'))
        ->assertRedirect(route('admin.event.show', ['event' => $this->event->id, 'tab' => 'realisasi']));

    $this->actingAs($this->admin)
        ->get(route('admin.reports.staff'))
        ->assertRedirect(route('admin.event.show', ['event' => $this->event->id, 'tab' => 'petugas']));
});
