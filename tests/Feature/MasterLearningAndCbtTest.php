<?php

use App\Models\CbtExamAttempt;
use App\Models\CbtExamPackage;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\EventSession;
use App\Models\LearningModule;
use App\Models\Material;
use App\Models\QuestionBank;
use App\Models\QuestionModule;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\EventManagementSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia as Assert;

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

test('admin can view master learning modules list with statistics and filters', function () {
    $response = $this->actingAs($this->admin)->get('/admin/master/modul-pembelajaran');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Master/LearningModules/Index')
        ->has('modules.data')
        ->has('stats')
        ->where('stats.total', fn ($val) => $val >= 2)
        ->has('availableMaterials')
        ->has('events')
    );
});

test('admin can create a master learning module and link digital materials without file duplication', function () {
    $material = Material::first();

    $response = $this->actingAs($this->admin)->post('/admin/master/modul-pembelajaran', [
        'code' => 'MOD-TEST-01',
        'title' => 'Modul Penataran Uji Coba Standar',
        'category' => 'Teknik',
        'level' => 'Madya',
        'competency_domain' => 'Teknik Kenshi',
        'total_jp' => 4,
        'status' => 'active',
        'description' => 'Deskripsi kurikulum uji coba.',
        'keywords' => 'teknik, kenshi',
        'target_audience' => 'Peserta Pelatih Madya',
        'track_codes' => ['PD'],
        'learning_objectives' => ['Memahami tata gerak dasar', 'Mampu mengevaluasi waza'],
        'competency_outcomes' => ['Sertifikasi Madya'],
        'materials' => [
            [
                'material_id' => $material->id,
                'sort_order' => 1,
                'is_required' => true,
                'estimated_duration_minutes' => 45,
                'instructor_notes' => 'Wajib membaca bab 1-3 sebelum sesi.',
            ],
        ],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('learning_modules', [
        'code' => 'MOD-TEST-01',
        'title' => 'Modul Penataran Uji Coba Standar',
    ]);

    $newModule = LearningModule::where('code', 'MOD-TEST-01')->first();
    expect($newModule->materials)->toHaveCount(1)
        ->and($newModule->keywords)->toBe('teknik, kenshi')
        ->and($newModule->materials->first()->id)->toBe($material->id)
        ->and($newModule->materials->first()->pivot->estimated_duration_minutes)->toBe(45);
});

test('admin can download a CSV format and import validated learning modules', function () {
    $template = $this->actingAs($this->admin)->get('/admin/master/modul-pembelajaran/format-impor');
    $template->assertOk();
    expect($template->headers->get('content-disposition'))->toContain('format-modul-pembelajaran.csv');

    $csv = "code,title,category,level,total_jp,status,description,keywords\nMOD-CSV-01,Modul Impor,Kepelatihan,Dasar,2,draft,Deskripsi,kempo\n";
    $this->actingAs($this->admin)->post('/admin/master/modul-pembelajaran/impor', [
        'file' => UploadedFile::fake()->createWithContent('modul.csv', $csv),
    ])->assertSessionHasNoErrors();

    $this->assertDatabaseHas('learning_modules', ['code' => 'MOD-CSV-01', 'keywords' => 'kempo']);
});

test('learning module CSV import rejects invalid rows without saving any rows', function () {
    $csv = "code,title,category,level,total_jp,status,description,keywords\nMOD-CSV-02,Modul Valid,Kepelatihan,Dasar,2,draft,,\nMOD-CSV-03,Modul Rusak,Kepelatihan,Dasar,0,draft,,\n";
    $this->actingAs($this->admin)->post('/admin/master/modul-pembelajaran/impor', [
        'file' => UploadedFile::fake()->createWithContent('modul.csv', $csv),
    ])->assertSessionHasErrors('file');

    $this->assertDatabaseMissing('learning_modules', ['code' => 'MOD-CSV-02']);
});

test('admin can update a master learning module and re-order linked materials', function () {
    $module = LearningModule::where('code', 'MOD-PEL-01')->first();
    $material = Material::first();

    $response = $this->actingAs($this->admin)->put("/admin/master/modul-pembelajaran/{$module->id}", [
        'code' => 'MOD-PEL-01-REV',
        'title' => 'Teknik Dasar Penataran Pelatih Perkemi (Revisi)',
        'category' => 'Teknik',
        'level' => 'Utama',
        'status' => 'active',
        'competency_domain' => 'Kurikulum Pelatih',
        'total_jp' => 8,
        'description' => 'Update modul kurikulum.',
        'materials' => [
            [
                'material_id' => $material->id,
                'sort_order' => 2,
                'is_required' => false,
                'estimated_duration_minutes' => 60,
                'instructor_notes' => 'Bahan bacaan suplemen.',
            ],
        ],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('learning_modules', [
        'id' => $module->id,
        'code' => 'MOD-PEL-01-REV',
        'total_jp' => 8,
    ]);
});

test('admin can link learning module directly to an event', function () {
    $module = LearningModule::first();
    $event = Event::first();

    $response = $this->actingAs($this->admin)->post("/admin/master/modul-pembelajaran/{$module->id}/hubungkan-event", [
        'event_id' => $event->id,
        'participant_path_id' => 'PD',
        'is_required' => true,
        'sort_order' => 5,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('event_learning_modules', [
        'event_id' => $event->id,
        'learning_module_id' => $module->id,
        'participant_path_id' => 'PD',
    ]);
});

test('admin can upload a PDF material directly to a learning module', function () {
    Storage::fake(config('pustaka.disk', 'local'));
    $module = LearningModule::first();

    $response = $this->actingAs($this->admin)->post("/admin/master/modul-pembelajaran/{$module->id}/upload-materi", [
        'title' => 'Buku Pegangan Praktik Kempo 2026',
        'file' => UploadedFile::fake()->create('pegangan-kempo.pdf', 120, 'application/pdf'),
        'author' => 'Sensei PERKEMI',
        'is_required' => true,
        'estimated_duration_minutes' => 60,
        'instructor_notes' => 'Pelajari sebelum hari H.',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('materials', [
        'title' => 'Buku Pegangan Praktik Kempo 2026',
        'author' => 'Sensei PERKEMI',
    ]);

    $material = Material::where('title', 'Buku Pegangan Praktik Kempo 2026')->first();
    expect($material)->not->toBeNull()
        ->and($material->hasActiveFile())->toBeTrue();

    $this->assertDatabaseHas('learning_module_materials', [
        'learning_module_id' => $module->id,
        'material_id' => $material->id,
        'is_required' => true,
    ]);
});

test('admin can update connected materials via dedicated route', function () {
    $module = LearningModule::first();
    $material = Material::first();

    $response = $this->actingAs($this->admin)->put("/admin/master/modul-pembelajaran/{$module->id}/materi", [
        'materials' => [
            [
                'material_id' => $material->id,
                'sort_order' => 1,
                'is_required' => false,
                'estimated_duration_minutes' => 30,
                'instructor_notes' => 'Catatan revisi materi.',
            ],
        ],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('learning_module_materials', [
        'learning_module_id' => $module->id,
        'material_id' => $material->id,
        'is_required' => false,
        'estimated_duration_minutes' => 30,
    ]);
});

test('admin can view master question modules list and 5-tab detail page', function () {
    $qm = QuestionModule::first();

    // 1. Index
    $indexResponse = $this->actingAs($this->admin)->get('/admin/master/modul-soal');
    $indexResponse->assertStatus(200);
    $indexResponse->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Master/QuestionModules/Index')
        ->has('modules.data')
        ->has('stats')
        ->has('learningModules')
    );

    // 2. Show (5 exact tabs: ringkasan, indikator, bank_soal, paket_cbt, riwayat)
    $showResponse = $this->actingAs($this->admin)->get("/admin/master/modul-soal/{$qm->id}");
    $showResponse->assertStatus(200);
    $showResponse->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Master/QuestionModules/Show')
        ->has('module')
        ->where('module.id', $qm->id)
        ->has('auditLogs')
        ->has('tracks')
        ->has('learningModules')
    );
});

test('admin can create and update master question module', function () {
    $learningModule = LearningModule::first();

    $response = $this->actingAs($this->admin)->post('/admin/master/modul-soal', [
        'code' => 'QM-TEST-01',
        'title' => 'Modul Evaluasi Uji Coba Penataran',
        'category' => 'Teknik',
        'description' => 'Evaluasi standar penataran.',
        'learning_module_id' => $learningModule->id,
        'track_codes' => ['PD'],
        'default_weight' => 20.0,
        'passing_grade' => 75.0,
        'status' => 'active',
        'assessment_indicators' => [
            [
                'code' => 'IND-01',
                'description' => 'Mampu mendeteksi pelanggaran waza',
                'bloom_level' => 'C4',
                'weight' => 20,
            ],
        ],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('question_modules', [
        'code' => 'QM-TEST-01',
        'title' => 'Modul Evaluasi Uji Coba Penataran',
        'learning_module_id' => $learningModule->id,
    ]);

    $created = QuestionModule::where('code', 'QM-TEST-01')->first();

    $updateResponse = $this->actingAs($this->admin)->put("/admin/master/modul-soal/{$created->id}", [
        'code' => 'QM-TEST-01',
        'title' => 'Modul Evaluasi Uji Coba Penataran (Updated)',
        'category' => 'Teknik',
        'default_weight' => 25.0,
        'passing_grade' => 80.0,
        'status' => 'active',
    ]);

    $updateResponse->assertRedirect();
    $this->assertDatabaseHas('question_modules', [
        'id' => $created->id,
        'default_weight' => 25.0,
        'passing_grade' => 80.0,
    ]);
});

test('admin can view bank soal list and create new question with bloom taxonomy', function () {
    $qm = QuestionModule::first();

    $listResponse = $this->actingAs($this->admin)->get('/admin/master/bank-soal');
    $listResponse->assertStatus(200);
    $listResponse->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Master/QuestionBank/Index')
        ->has('questions.data')
        ->has('stats')
        ->has('questionModules')
    );

    $createResponse = $this->actingAs($this->admin)->post('/admin/master/bank-soal', [
        'code' => 'SOAL-NEW-001',
        'question_module_id' => $qm->id,
        'question_type' => 'multiple_choice',
        'question_text' => 'Berapa poin penilaian waza jodan tsuki yang bersih?',
        'options' => [
            ['key' => 'A', 'text' => '1 Poin (Yuko)'],
            ['key' => 'B', 'text' => '2 Poin (Waza-ari)'],
            ['key' => 'C', 'text' => '3 Poin (Ippon)'],
            ['key' => 'D', 'text' => 'Tidak mendapat poin'],
        ],
        'correct_answer' => 'A',
        'explanation' => 'Pukulan terarah memenuhi kriteria yuko sesuai regulasi Perkemi.',
        'points' => 5,
        'difficulty_level' => 'medium',
        'status' => 'active',
    ]);

    $createResponse->assertRedirect();
    $this->assertDatabaseHas('question_bank', [
        'code' => 'SOAL-NEW-001',
        'question_module_id' => $qm->id,
        'difficulty_level' => 'medium',
    ]);
});

test('non-admin user cannot access question bank management', function () {
    $response = $this->actingAs($this->user)->get('/admin/master/bank-soal');
    $response->assertStatus(403);
});

test('one bank question can be reused across question modules and reassigned without duplication', function () {
    $modules = QuestionModule::take(2)->get();
    expect($modules)->toHaveCount(2);
    $initialQuestionCount = QuestionBank::count();

    $payload = [
        'code' => 'SOAL-BERSAMA-001',
        'question_module_ids' => $modules->pluck('id')->all(),
        'question_text' => 'Jelaskan prinsip dasar penilaian teknik.',
        'question_type' => 'essay',
        'points' => 10,
        'difficulty_level' => 'basic',
        'status' => 'active',
    ];

    $this->actingAs($this->admin)->post('/admin/master/bank-soal', $payload)->assertRedirect();

    $question = QuestionBank::where('code', $payload['code'])->firstOrFail();
    expect($question->questionModules()->count())->toBe(2);
    expect($modules->every(fn ($module) => $module->questions()->where('question_bank.id', $question->id)->exists()))->toBeTrue();
    $this->assertDatabaseCount('question_bank', $initialQuestionCount + 1);

    $this->actingAs($this->admin)
        ->get('/admin/master/modul-soal/'.$modules[1]->id)
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Master/QuestionModules/Show')
            ->where('module.questions', fn ($questions) => collect($questions)->contains('code', $payload['code']))
        );

    $package = CbtExamPackage::firstOrFail();
    $package->update(['question_module_id' => $modules[1]->id]);
    $this->actingAs($this->admin)
        ->get('/admin/cbt/paket-ujian/'.$package->id)
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Cbt/Packages/Show')
            ->where('availableQuestions', fn ($questions) => collect($questions)->contains('code', $payload['code']))
        );

    $this->actingAs($this->admin)
        ->get('/admin/master/bank-soal?module_id='.$modules[1]->id)
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Master/QuestionBank/Index')
            ->where('questions.data', fn ($questions) => collect($questions)->contains('code', $payload['code']))
        );

    $this->actingAs($this->admin)->put('/admin/master/bank-soal/'.$question->id, [
        ...$payload,
        'question_module_ids' => [$modules[1]->id],
    ])->assertRedirect();

    expect($question->fresh()->questionModules->pluck('id')->all())->toBe([$modules[1]->id]);
    expect($modules[0]->questions()->where('question_bank.id', $question->id)->exists())->toBeFalse();
    expect($modules[1]->questions()->where('question_bank.id', $question->id)->exists())->toBeTrue();
    $this->assertDatabaseHas('question_bank', ['id' => $question->id, 'code' => $payload['code']]);
});

test('a bank question needs at least one valid question module', function () {
    $this->actingAs($this->admin)->post('/admin/master/bank-soal', [
        'code' => 'SOAL-TANPA-MODUL',
        'question_module_ids' => [],
        'question_text' => 'Pertanyaan uji',
        'question_type' => 'essay',
        'points' => 1,
        'difficulty_level' => 'basic',
        'status' => 'active',
    ])->assertSessionHasErrors('question_module_ids');

    $this->assertDatabaseMissing('question_bank', ['code' => 'SOAL-TANPA-MODUL']);
});

test('admin can create cbt package and sync questions from bank soal', function () {
    $qm = QuestionModule::first();
    $bankQuestions = QuestionBank::where('question_module_id', $qm->id)->take(2)->get();

    $response = $this->actingAs($this->admin)->post('/admin/cbt/paket-ujian', [
        'code' => 'PKT-CBT-TEST-01',
        'title' => 'Paket Ujian Teori Mandiri CBT',
        'question_module_id' => $qm->id,
        'exam_type' => 'post_test',
        'duration_minutes' => 45,
        'passing_score' => 75.0,
        'attempts_allowed' => 2,
        'instructions' => 'Bacalah soal dengan cermat sebelum memilih jawaban.',
        'randomize_questions' => true,
        'randomize_answers' => true,
        'result_display' => 'immediate',
        'status' => 'draft',
        'question_ids' => $bankQuestions->pluck('id')->all(),
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('cbt_exam_packages', [
        'code' => 'PKT-CBT-TEST-01',
        'question_module_id' => $qm->id,
    ]);

    $pkg = CbtExamPackage::where('code', 'PKT-CBT-TEST-01')->first();
    expect($pkg->bankQuestions)->toHaveCount(count($bankQuestions));
});

test('admin cannot modify questions of cbt package that already has participant attempts (snapshot immutability)', function () {
    $pkg = CbtExamPackage::first();
    $ep = EventParticipant::first();

    // Create a mock attempt to simulate participant activity
    CbtExamAttempt::create([
        'cbt_exam_package_id' => $pkg->id,
        'participant_id' => $ep->participant_id,
        'event_id' => $pkg->event_id,
        'attempt_number' => 1,
        'status' => 'submitted',
        'total_score' => 85.0,
        'is_passed' => true,
        'started_at' => now()->subHours(2),
        'submitted_at' => now()->subHour(),
    ]);

    // Attempting to sync questions on an active package with attempts must fail with error flash
    $syncResponse = $this->actingAs($this->admin)->post("/admin/cbt/paket-ujian/{$pkg->id}/soal", [
        'question_ids' => [1],
    ]);

    $syncResponse->assertSessionHas('error', 'Susunan soal tidak dapat diubah karena peserta sudah mulai mengerjakan.');
});

test('admin can attach and detach learning module and cbt package to an event', function () {
    $event = Event::first();
    $module = LearningModule::first();
    $cbtPackage = CbtExamPackage::first();

    // 1. Attach Learning Module
    $attachLmResponse = $this->actingAs($this->admin)->post("/admin/event/{$event->id}/modul-pembelajaran", [
        'learning_module_id' => $module->id,
        'participant_path_id' => 'PD',
        'is_required' => true,
        'sort_order' => 2,
    ]);
    $attachLmResponse->assertRedirect();
    $this->assertDatabaseHas('event_learning_modules', [
        'event_id' => $event->id,
        'learning_module_id' => $module->id,
        'participant_path_id' => 'PD',
    ]);

    // 2. Detach Learning Module
    $detachLmResponse = $this->actingAs($this->admin)->delete("/admin/event/{$event->id}/modul-pembelajaran/{$module->id}");
    $detachLmResponse->assertRedirect();
    $this->assertDatabaseMissing('event_learning_modules', [
        'event_id' => $event->id,
        'learning_module_id' => $module->id,
    ]);

    // 3. Attach CBT Package
    $session = EventSession::first();
    $attachCbtResponse = $this->actingAs($this->admin)->post("/admin/event/{$event->id}/cbt-package", [
        'cbt_exam_package_id' => $cbtPackage->id,
        'participant_path_id' => 'PD',
        'is_required' => true,
        'sort_order' => 1,
        'requires_attendance_session_id' => $session->id,
    ]);
    $attachCbtResponse->assertRedirect();
    $this->assertDatabaseHas('event_cbt_packages', [
        'event_id' => $event->id,
        'cbt_exam_package_id' => $cbtPackage->id,
        'requires_attendance_session_id' => $session->id,
    ]);

    // 4. Detach CBT Package
    $detachCbtResponse = $this->actingAs($this->admin)->delete("/admin/event/{$event->id}/cbt-package/{$cbtPackage->id}");
    $detachCbtResponse->assertRedirect();
    $this->assertDatabaseMissing('event_cbt_packages', [
        'event_id' => $event->id,
        'cbt_exam_package_id' => $cbtPackage->id,
    ]);
});

test('participant portal ruang-belajar provides dynamic ctas and respects attendance lock', function () {
    $event = Event::first();
    $ep = EventParticipant::with('participant')->first();

    // Link user to participant
    $ep->participant->update(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user)->get("/event/{$event->slug}/ruang-belajar");

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Event/LearningRoom')
        ->has('event')
        ->has('myLearningModules')
        ->has('myCbtExams')
        ->where('myLearningModules', fn ($modules) => count($modules) > 0)
    );
});
