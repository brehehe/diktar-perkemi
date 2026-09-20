<?php

use App\Models\CbtExamPackage;
use App\Models\QuestionBank;
use App\Models\QuestionModule;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\EventManagementSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
    $this->seed(EventManagementSeeder::class);

    $this->admin = User::factory()->create([
        'role' => 'Admin',
    ]);

    // Create 2 test question modules
    $this->moduleA = QuestionModule::create([
        'code' => 'QM-TEST-WAD',
        'title' => 'Pre-Test Wasit Daerah (WAD)',
        'slug' => 'qm-test-wad-'.uniqid(),
        'category' => 'Wasit Daerah',
        'status' => 'active',
    ]);

    $this->moduleB = QuestionModule::create([
        'code' => 'QM-TEST-PED',
        'title' => 'Pre-Test Penguji Daerah (PED)',
        'slug' => 'qm-test-ped-'.uniqid(),
        'category' => 'Penguji Daerah',
        'status' => 'active',
    ]);

    // Create 3 questions in Module A
    $this->qA1 = QuestionBank::create([
        'code' => 'WAD-SOAL-001',
        'question_module_id' => $this->moduleA->id,
        'question_text' => 'Soal 1 Wasit Daerah',
        'question_type' => 'single_choice',
        'options' => [['key' => 'A', 'text' => 'Pilihan A'], ['key' => 'B', 'text' => 'Pilihan B']],
        'correct_answer' => 'A',
        'points' => 1.0,
        'exam_stage' => 'pre_test',
        'status' => 'active',
    ]);
    $this->moduleA->questions()->attach($this->qA1->id);

    $this->qA2 = QuestionBank::create([
        'code' => 'WAD-SOAL-002',
        'question_module_id' => $this->moduleA->id,
        'question_text' => 'Soal 2 Wasit Daerah',
        'question_type' => 'single_choice',
        'options' => [['key' => 'A', 'text' => 'Pilihan A'], ['key' => 'B', 'text' => 'Pilihan B']],
        'correct_answer' => 'B',
        'points' => 1.0,
        'exam_stage' => 'pre_test',
        'status' => 'active',
    ]);
    $this->moduleA->questions()->attach($this->qA2->id);

    // Create 2 questions in Module B
    $this->qB1 = QuestionBank::create([
        'code' => 'PED-SOAL-001',
        'question_module_id' => $this->moduleB->id,
        'question_text' => 'Soal 1 Penguji Daerah',
        'question_type' => 'single_choice',
        'options' => [['key' => 'A', 'text' => 'Pilihan A'], ['key' => 'B', 'text' => 'Pilihan B']],
        'correct_answer' => 'A',
        'points' => 1.0,
        'exam_stage' => 'pre_test',
        'status' => 'active',
    ]);
    $this->moduleB->questions()->attach($this->qB1->id);

    $this->qB2 = QuestionBank::create([
        'code' => 'PED-SOAL-002',
        'question_module_id' => $this->moduleB->id,
        'question_text' => 'Soal 2 Penguji Daerah',
        'question_type' => 'single_choice',
        'options' => [['key' => 'A', 'text' => 'Pilihan A'], ['key' => 'B', 'text' => 'Pilihan B']],
        'correct_answer' => 'B',
        'points' => 1.0,
        'exam_stage' => 'pre_test',
        'status' => 'active',
    ]);
    $this->moduleB->questions()->attach($this->qB2->id);
});

test('admin can create a single cbt package combining two question modules with auto sync', function () {
    $response = $this->actingAs($this->admin)->post('/admin/cbt/paket-ujian', [
        'code' => 'CBT-GABUNG-01',
        'title' => 'Ujian Gabungan Wasit & Penguji Daerah',
        'exam_type' => 'pre_test',
        'question_module_ids' => [$this->moduleA->id, $this->moduleB->id],
        'auto_sync_module_questions' => true,
        'duration_minutes' => 90,
        'passing_score' => 75.0,
        'attempts_allowed' => 1,
        'result_display' => 'immediate',
        'status' => 'draft',
    ]);

    $response->assertRedirect();

    $package = CbtExamPackage::where('code', 'CBT-GABUNG-01')->firstOrFail();
    expect($package->question_module_ids)->toBe([$this->moduleA->id, $this->moduleB->id]);
    expect($package->blueprint_modules)->toHaveCount(2);

    // All 4 questions from both modules should be automatically synced into this single package
    expect($package->bankQuestions)->toHaveCount(4);
    expect($package->total_questions)->toBe(4);

    $questionCodes = $package->bankQuestions->pluck('code')->all();
    expect($questionCodes)->toContain('WAD-SOAL-001', 'WAD-SOAL-002', 'PED-SOAL-001', 'PED-SOAL-002');
});

test('admin can manually select questions from multiple modules into one package', function () {
    $package = CbtExamPackage::create([
        'code' => 'CBT-MANUAL-01',
        'title' => 'Paket Ujian Kombinasi Manual',
        'exam_type' => 'pre_test',
        'question_module_ids' => [$this->moduleA->id, $this->moduleB->id],
        'duration_minutes' => 60,
        'passing_score' => 70.0,
        'attempts_allowed' => 1,
        'result_display' => 'immediate',
        'status' => 'draft',
    ]);

    // Select 1 from Module A and 1 from Module B
    $selectedIds = [$this->qA1->id, $this->qB1->id];

    $response = $this->actingAs($this->admin)->post("/admin/cbt/paket-ujian/{$package->id}/soal", [
        'question_ids' => $selectedIds,
    ]);

    $response->assertRedirect();

    $package->refresh();
    expect($package->bankQuestions)->toHaveCount(2);
    expect($package->bankQuestions->pluck('code')->all())->toContain('WAD-SOAL-001', 'PED-SOAL-001');
});

test('cbt package show page returns available questions from all modules and blueprint modules collection', function () {
    $package = CbtExamPackage::create([
        'code' => 'CBT-VIEW-01',
        'title' => 'Paket Ujian View Test',
        'exam_type' => 'pre_test',
        'question_module_ids' => [$this->moduleA->id, $this->moduleB->id],
        'duration_minutes' => 60,
        'passing_score' => 70.0,
        'attempts_allowed' => 1,
        'result_display' => 'immediate',
        'status' => 'draft',
    ]);

    $response = $this->actingAs($this->admin)->get("/admin/cbt/paket-ujian/{$package->id}");

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Cbt/Packages/Show')
        ->has('package.blueprint_modules', 2)
        ->where('availableQuestions', fn ($questions) => collect($questions)->contains('code', 'WAD-SOAL-001') &&
            collect($questions)->contains('code', 'PED-SOAL-001')
        )
    );
});

test('admin can create cbt package with custom question quotas per module', function () {
    // Module A has 2 questions, Module B has 2 questions.
    // We request quota: 1 from Module A (custom), all from Module B. Total should be 1 + 2 = 3 questions.
    $response = $this->actingAs($this->admin)->post('/admin/cbt/paket-ujian', [
        'code' => 'CBT-QUOTA-01',
        'title' => 'Ujian dengan Kuota Modul',
        'exam_type' => 'pre_test',
        'question_module_ids' => [$this->moduleA->id, $this->moduleB->id],
        'question_module_quotas' => [
            $this->moduleA->id => ['mode' => 'custom', 'count' => 1],
            $this->moduleB->id => ['mode' => 'all', 'count' => null],
        ],
        'selection_method' => 'sequential',
        'duration_minutes' => 60,
        'passing_score' => 75.0,
        'attempts_allowed' => 1,
        'result_display' => 'immediate',
        'status' => 'draft',
    ]);

    $response->assertRedirect();

    $package = CbtExamPackage::where('code', 'CBT-QUOTA-01')->firstOrFail();
    expect($package->total_questions)->toBe(3);
    expect($package->bankQuestions)->toHaveCount(3);

    // Module A should contribute 1 question, Module B should contribute 2 questions
    $wadCount = $package->bankQuestions->filter(fn ($q) => $q->code === 'WAD-SOAL-001' || $q->code === 'WAD-SOAL-002')->count();
    $pedCount = $package->bankQuestions->filter(fn ($q) => $q->code === 'PED-SOAL-001' || $q->code === 'PED-SOAL-002')->count();
    expect($wadCount)->toBe(1);
    expect($pedCount)->toBe(2);
});

test('admin can pull questions from blueprint modules with updated quotas', function () {
    $package = CbtExamPackage::create([
        'code' => 'CBT-PULL-01',
        'title' => 'Ujian Re-Pull Kuota',
        'exam_type' => 'pre_test',
        'question_module_ids' => [$this->moduleA->id, $this->moduleB->id],
        'duration_minutes' => 60,
        'passing_score' => 70.0,
        'attempts_allowed' => 1,
        'result_display' => 'immediate',
        'status' => 'draft',
    ]);

    // Initial state: 0 questions
    expect($package->bankQuestions)->toHaveCount(0);

    // Call pull with 1 question from module A and 1 question from module B
    $response = $this->actingAs($this->admin)->post("/admin/cbt/paket-ujian/{$package->id}/tarik-soal-modul", [
        'question_module_quotas' => [
            $this->moduleA->id => ['mode' => 'custom', 'count' => 1],
            $this->moduleB->id => ['mode' => 'custom', 'count' => 1],
        ],
        'selection_method' => 'sequential',
    ]);

    $response->assertRedirect();

    $package->refresh();
    expect($package->total_questions)->toBe(2);
    expect($package->bankQuestions)->toHaveCount(2);

    $blueprintModules = $package->blueprint_modules;
    expect($blueprintModules)->toHaveCount(2);
    $modAData = $blueprintModules->firstWhere('id', $this->moduleA->id);
    expect($modAData->quota_mode)->toBe('custom');
    expect($modAData->quota_count)->toBe(1);
    expect($modAData->selected_count)->toBe(1);
    expect($modAData->active_questions_count)->toBe(2);
});
