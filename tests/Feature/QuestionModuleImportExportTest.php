<?php

use App\Models\QuestionBank;
use App\Models\QuestionModule;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\EventManagementSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia as Assert;
use PhpOffice\PhpSpreadsheet\IOFactory;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
    $this->seed(EventManagementSeeder::class);
    $this->admin = User::factory()->create([
        'role' => 'Admin',
    ]);
    $this->user = User::factory()->create([
        'role' => 'User',
    ]);
});

test('admin can download blank template xlsx with all 5 sheets', function () {
    $response = $this->actingAs($this->admin)->get('/admin/master/modul-soal/format-kosong');

    $response->assertStatus(200);
    $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    // Verify template structure using PhpSpreadsheet
    $tempStream = fopen('php://memory', 'r+');
    fwrite($tempStream, $response->streamedContent());
    rewind($tempStream);

    $meta = stream_get_meta_data($tempStream);
    $tempFile = tempnam(sys_get_temp_dir(), 'test_dl_');
    file_put_contents($tempFile, stream_get_contents($tempStream));
    fclose($tempStream);

    $spreadsheet = IOFactory::load($tempFile);
    $sheetNames = $spreadsheet->getSheetNames();
    unlink($tempFile);

    expect($sheetNames)->toContain('PETUNJUK', 'PRE-TEST', 'KUIS', 'POST-TEST', 'REFERENSI');
});

test('non-admin cannot download template or import bank soal', function () {
    $response = $this->actingAs($this->user)->get('/admin/master/modul-soal/format-kosong');
    $response->assertStatus(403);

    $responsePost = $this->actingAs($this->user)->post('/admin/master/modul-soal/impor', []);
    $responsePost->assertStatus(403);
});

test('admin can import Bank_Soal_PED_PEN_PERKEMI_2026_TERINTEGRASI.xlsx successfully', function () {
    $sourcePath = base_path('public/xlsx/Bank_Soal_PED_PEN_PERKEMI_2026_TERINTEGRASI.xlsx');
    expect(file_exists($sourcePath))->toBeTrue();

    $uploadedFile = new UploadedFile(
        $sourcePath,
        'Bank_Soal_PED_PEN_PERKEMI_2026_TERINTEGRASI.xlsx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        null,
        true
    );

    $response = $this->actingAs($this->admin)->post('/admin/master/modul-soal/impor', [
        'file' => $uploadedFile,
    ]);

    $response->assertRedirect('/admin/master/modul-soal');
    $response->assertSessionHas('success');

    // 6 modules per Program & Stage (QM-PED-PRE, QM-PEN-PRE, QM-PED-KUIS, QM-PEN-KUIS, QM-PED-POST, QM-PEN-POST)
    $pedPre = QuestionModule::where('code', 'QM-PED-PRE')->first();
    expect($pedPre)->not->toBeNull();
    expect($pedPre->title)->toBe('Pre-Test Penguji Daerah (PED)');
    expect($pedPre->category)->toBe('Penguji Daerah');
    expect($pedPre->track_codes)->toContain('PED');
    expect($pedPre->metadata)->toHaveKey('petunjuk');

    // Check questions in QM-PED-PRE (exactly 30 questions)
    expect($pedPre->questions()->count())->toBe(30);

    // Total questions across PED & PEN is 260
    $totalQuestions = QuestionBank::whereIn('exam_stage', ['pre_test', 'quiz', 'post_test'])->count();
    expect($totalQuestions)->toBe(260);

    $preCount = QuestionBank::where('exam_stage', 'pre_test')->count();
    $quizCount = QuestionBank::where('exam_stage', 'quiz')->count();
    $postCount = QuestionBank::where('exam_stage', 'post_test')->count();

    expect($preCount)->toBe(80);
    expect($quizCount)->toBe(50);
    expect($postCount)->toBe(130);
});

test('admin can import Bank_Soal_WAD_WAN_PERKEMI_2026.xlsx successfully', function () {
    $sourcePath = base_path('public/xlsx/Bank_Soal_WAD_WAN_PERKEMI_2026.xlsx');
    expect(file_exists($sourcePath))->toBeTrue();

    $uploadedFile = new UploadedFile(
        $sourcePath,
        'Bank_Soal_WAD_WAN_PERKEMI_2026.xlsx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        null,
        true
    );

    $response = $this->actingAs($this->admin)->post('/admin/master/modul-soal/impor', [
        'file' => $uploadedFile,
    ]);

    $response->assertRedirect('/admin/master/modul-soal');
    $response->assertSessionHas('success');

    $wadPre = QuestionModule::where('code', 'QM-WAD-PRE')->first();
    expect($wadPre)->not->toBeNull();
    expect($wadPre->title)->toBe('Pre-Test Wasit Daerah (WAD)');
    expect($wadPre->category)->toBe('Wasit Daerah');
    expect($wadPre->track_codes)->toContain('WAD');
    expect($wadPre->questions()->count())->toBe(30);

    $totalQuestions = QuestionBank::whereIn('exam_stage', ['pre_test', 'quiz', 'post_test'])->count();
    expect($totalQuestions)->toBe(260);
});

test('admin can import Bank_Soal_Gabungan_Penguji_Wasit_PERKEMI_2026.xlsx successfully', function () {
    $sourcePath = base_path('public/xlsx/Bank_Soal_Gabungan_Penguji_Wasit_PERKEMI_2026.xlsx');
    expect(file_exists($sourcePath))->toBeTrue();

    $uploadedFile = new UploadedFile(
        $sourcePath,
        'Bank_Soal_Gabungan_Penguji_Wasit_PERKEMI_2026.xlsx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        null,
        true
    );

    $response = $this->actingAs($this->admin)->post('/admin/master/modul-soal/impor', [
        'file' => $uploadedFile,
    ]);

    $response->assertRedirect('/admin/master/modul-soal');
    $response->assertSessionHas('success');

    $pwadPre = QuestionModule::where('code', 'QM-PWAD-PRE')->first();
    expect($pwadPre)->not->toBeNull();
    expect($pwadPre->questions()->count())->toBe(60);

    $totalQuestions = QuestionBank::whereIn('exam_stage', ['pre_test', 'quiz', 'post_test'])->count();
    expect($totalQuestions)->toBe(520);
});

test('imported module displays petunjuk and question details in show page', function () {
    $sourcePath = base_path('public/xlsx/Bank_Soal_PED_PEN_PERKEMI_2026_TERINTEGRASI.xlsx');
    $uploadedFile = new UploadedFile(
        $sourcePath,
        'Bank_Soal_PED_PEN_PERKEMI_2026_TERINTEGRASI.xlsx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        null,
        true
    );

    $this->actingAs($this->admin)->post('/admin/master/modul-soal/impor', [
        'file' => $uploadedFile,
    ]);

    $pedPre = QuestionModule::where('code', 'QM-PED-PRE')->firstOrFail();

    $response = $this->actingAs($this->admin)->get("/admin/master/modul-soal/{$pedPre->id}");

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Master/QuestionModules/Show')
        ->has('module')
        ->where('module.code', 'QM-PED-PRE')
        ->has('module.metadata.petunjuk.items')
        ->has('module.questions')
    );
});

test('import rejects invalid non-excel file', function () {
    $invalidFile = UploadedFile::fake()->create('invalid.txt', 10, 'text/plain');

    $response = $this->actingAs($this->admin)->post('/admin/master/modul-soal/impor', [
        'file' => $invalidFile,
    ]);

    $response->assertSessionHasErrors('file');
});
