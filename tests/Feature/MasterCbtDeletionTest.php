<?php

use App\Models\CbtExamAttempt;
use App\Models\CbtExamPackage;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\QuestionBank;
use App\Models\QuestionModule;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\EventManagementSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
    $this->seed(EventManagementSeeder::class);

    $this->admin = User::factory()->create([
        'role' => 'Admin',
    ]);
});

test('admin can delete cbt exam package without attempts', function () {
    $module = QuestionModule::create([
        'code' => 'MOD-DEL-01',
        'title' => 'Modul Uji Hapus',
        'slug' => 'mod-del-01',
        'category' => 'Evaluasi Teori',
        'status' => 'draft',
    ]);

    $question = QuestionBank::create([
        'code' => 'SOAL-DEL-01',
        'question_text' => 'Apakah ini butir soal uji coba?',
        'question_type' => 'single_choice',
        'options' => [
            ['key' => 'A', 'text' => 'Ya'],
            ['key' => 'B', 'text' => 'Tidak'],
        ],
        'correct_answer' => 'A',
        'points' => 1.0,
        'difficulty_level' => 'basic',
        'status' => 'active',
    ]);

    $module->questions()->attach($question->id);

    $package = CbtExamPackage::create([
        'code' => 'CBT-DEL-01',
        'title' => 'Paket CBT Hapus Uji',
        'slug' => 'cbt-del-01',
        'question_module_id' => $module->id,
        'exam_type' => 'theory_exam',
        'status' => 'draft',
    ]);

    $package->bankQuestions()->attach($question->id, ['points' => 1.0, 'sort_order' => 1]);

    $response = $this->actingAs($this->admin)->delete("/admin/cbt/paket-ujian/{$package->id}");

    $response->assertSessionHas('success');
    $this->assertSoftDeleted('cbt_exam_packages', ['id' => $package->id]);
    $this->assertDatabaseMissing('cbt_package_questions', ['cbt_exam_package_id' => $package->id]);
});

test('admin cannot delete cbt exam package with attempts without force flag', function () {
    $package = CbtExamPackage::create([
        'code' => 'CBT-DEL-02',
        'title' => 'Paket CBT Memiliki Attempt',
        'slug' => 'cbt-del-02',
        'exam_type' => 'theory_exam',
        'status' => 'ready',
    ]);

    $attemptUser = User::factory()->create(['role' => 'User']);

    $event = Event::first();
    $participant = EventParticipant::first();

    CbtExamAttempt::create([
        'cbt_exam_package_id' => $package->id,
        'event_id' => $event?->id,
        'participant_id' => $participant?->participant_id ?? 1,
        'user_id' => $attemptUser->id,
        'attempt_number' => 1,
        'status' => 'completed',
        'started_at' => now(),
        'completed_at' => now(),
        'score' => 80.0,
        'is_passed' => true,
    ]);

    $response = $this->actingAs($this->admin)->delete("/admin/cbt/paket-ujian/{$package->id}");

    $response->assertSessionHas('error');
    $this->assertDatabaseHas('cbt_exam_packages', [
        'id' => $package->id,
        'deleted_at' => null,
    ]);
});

test('admin can delete question module and detach associated questions', function () {
    $module = QuestionModule::create([
        'code' => 'MOD-DEL-03',
        'title' => 'Modul Hapus Mandiri',
        'slug' => 'mod-del-03',
        'category' => 'Evaluasi Teori',
        'status' => 'draft',
    ]);

    $question = QuestionBank::create([
        'code' => 'SOAL-DEL-02',
        'question_text' => 'Soal independen modul',
        'question_type' => 'single_choice',
        'options' => [
            ['key' => 'A', 'text' => 'Pilihan A'],
            ['key' => 'B', 'text' => 'Pilihan B'],
        ],
        'correct_answer' => 'A',
        'points' => 1.0,
        'difficulty_level' => 'basic',
        'status' => 'active',
    ]);

    $module->questions()->attach($question->id);

    $response = $this->actingAs($this->admin)->delete("/admin/master/modul-soal/{$module->id}");

    $response->assertSessionHas('success');
    $this->assertSoftDeleted('question_modules', ['id' => $module->id]);
    $this->assertDatabaseMissing('question_module_questions', ['question_module_id' => $module->id]);
    // The question itself in question_bank must still exist
    $this->assertDatabaseHas('question_bank', ['id' => $question->id, 'deleted_at' => null]);
});

test('admin can delete single question from question bank', function () {
    $question = QuestionBank::create([
        'code' => 'SOAL-DEL-03',
        'question_text' => 'Soal tunggal untuk dihapus',
        'question_type' => 'single_choice',
        'options' => [
            ['key' => 'A', 'text' => 'Benar'],
            ['key' => 'B', 'text' => 'Salah'],
        ],
        'correct_answer' => 'A',
        'points' => 1.0,
        'difficulty_level' => 'basic',
        'status' => 'active',
    ]);

    $response = $this->actingAs($this->admin)->delete("/admin/master/bank-soal/{$question->id}");

    $response->assertSessionHas('success');
    $this->assertSoftDeleted('question_bank', ['id' => $question->id]);
});

test('admin can bulk delete questions from question bank', function () {
    $q1 = QuestionBank::create([
        'code' => 'SOAL-BULK-01',
        'question_text' => 'Soal massal 1',
        'question_type' => 'single_choice',
        'options' => [['key' => 'A', 'text' => 'A']],
        'correct_answer' => 'A',
        'points' => 1.0,
        'difficulty_level' => 'basic',
        'status' => 'active',
    ]);

    $q2 = QuestionBank::create([
        'code' => 'SOAL-BULK-02',
        'question_text' => 'Soal massal 2',
        'question_type' => 'single_choice',
        'options' => [['key' => 'A', 'text' => 'A']],
        'correct_answer' => 'A',
        'points' => 1.0,
        'difficulty_level' => 'basic',
        'status' => 'active',
    ]);

    $response = $this->actingAs($this->admin)->post('/admin/master/bank-soal/hapus-massal', [
        'ids' => [$q1->id, $q2->id],
    ]);

    $response->assertSessionHas('success');
    $this->assertSoftDeleted('question_bank', ['id' => $q1->id]);
    $this->assertSoftDeleted('question_bank', ['id' => $q2->id]);
});
