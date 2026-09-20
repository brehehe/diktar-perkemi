<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Master Modul Pembelajaran (Learning Modules)
        Schema::create('learning_modules', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('title', 255);
            $table->string('slug', 255)->unique();
            $table->text('description')->nullable();
            $table->string('category', 100);
            $table->json('track_codes')->nullable(); // e.g. ['PD', 'PN', 'PED', 'PEN', 'WAD', 'WAN']
            $table->json('target_roles')->nullable(); // e.g. ['Pelatih', 'Penguji', 'Wasit']
            $table->integer('total_jp')->default(2);
            $table->string('level', 50)->default('Dasar'); // Dasar, Menengah, Lanjutan, Spesialis
            $table->string('status', 30)->default('draft'); // draft, active, inactive, archived
            $table->json('learning_objectives')->nullable(); // Tujuan pembelajaran
            $table->json('competency_outcomes')->nullable(); // Capaian kompetensi
            $table->string('keywords', 255)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        // 2. Learning Module Materials (Pivot to Digital Collections)
        Schema::create('learning_module_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('learning_module_id')->constrained('learning_modules')->cascadeOnDelete();
            $table->foreignId('material_id')->constrained('materials')->cascadeOnDelete();
            $table->integer('sort_order')->default(1);
            $table->boolean('is_required')->default(true);
            $table->text('instructor_notes')->nullable();
            $table->integer('estimated_duration_minutes')->nullable();
            $table->timestamps();

            $table->unique(['learning_module_id', 'material_id']);
        });

        // 3. Master Modul Soal (Question Blueprint Modules)
        Schema::create('question_modules', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('title', 255);
            $table->string('slug', 255)->unique();
            $table->text('description')->nullable();
            $table->string('category', 100)->nullable();
            $table->json('track_codes')->nullable();
            $table->json('tested_competencies')->nullable();
            $table->json('assessment_indicators')->nullable();
            $table->text('evaluation_purpose')->nullable();
            $table->decimal('default_weight', 5, 2)->default(1.00);
            $table->decimal('passing_grade', 5, 2)->default(70.00);
            $table->string('status', 30)->default('draft'); // draft, active, inactive, archived
            $table->foreignId('learning_module_id')->nullable()->constrained('learning_modules')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        // 4. Master Bank Soal (Question Bank)
        Schema::create('question_bank', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->foreignId('question_module_id')->constrained('question_modules')->cascadeOnDelete();
            $table->text('question_text');
            $table->string('question_type', 30)->default('single_choice'); // single_choice, true_false, multiple_choice, essay
            $table->json('options')->nullable(); // [{'key':'A', 'text':'...'}, ...]
            $table->json('correct_answer')->nullable(); // ['A'] or ['A', 'C'] or 'A'
            $table->decimal('points', 5, 2)->default(1.00);
            $table->string('difficulty_level', 30)->default('basic'); // basic, intermediate, advanced
            $table->text('explanation')->nullable();
            $table->foreignId('material_id')->nullable()->constrained('materials')->nullOnDelete();
            $table->foreignId('learning_module_id')->nullable()->constrained('learning_modules')->nullOnDelete();
            $table->string('status', 30)->default('active'); // draft, active, inactive, archived
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        // 5. Enhance cbt_exam_packages with blueprint relation & target tracks
        Schema::table('cbt_exam_packages', function (Blueprint $table) {
            $table->foreignId('question_module_id')->nullable()->after('exam_type')->constrained('question_modules')->nullOnDelete();
            $table->json('target_tracks')->nullable()->after('question_module_id');
            $table->integer('total_questions')->default(0)->after('attempts_allowed');
        });

        // 6. CBT Package Questions Pivot (Connecting CBT Package to Bank Soal)
        Schema::create('cbt_package_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cbt_exam_package_id')->constrained('cbt_exam_packages')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('question_bank')->cascadeOnDelete();
            $table->integer('sort_order')->default(1);
            $table->decimal('points', 5, 2)->default(1.00);
            $table->timestamps();

            $table->unique(['cbt_exam_package_id', 'question_id']);
        });

        // 7. Event Learning Modules (Relating Events to Master Learning Modules)
        Schema::create('event_learning_modules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignId('learning_module_id')->constrained('learning_modules')->cascadeOnDelete();
            $table->string('participant_path_id', 50)->nullable(); // track_code e.g. PD, PN, or null for all
            $table->boolean('is_required')->default(true);
            $table->integer('sort_order')->default(1);
            $table->dateTime('availability_start_at')->nullable();
            $table->dateTime('availability_end_at')->nullable();
            $table->timestamps();
        });

        // 8. Event CBT Packages (Relating Events to CBT Packages)
        Schema::create('event_cbt_packages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignId('cbt_exam_package_id')->constrained('cbt_exam_packages')->cascadeOnDelete();
            $table->string('participant_path_id', 50)->nullable(); // track_code or null for all
            $table->boolean('is_required')->default(true);
            $table->integer('sort_order')->default(1);
            $table->dateTime('availability_start_at')->nullable();
            $table->dateTime('availability_end_at')->nullable();
            $table->foreignId('requires_attendance_session_id')->nullable()->constrained('event_sessions')->nullOnDelete();
            $table->timestamps();
        });

        // 9. Enhance event_sessions with learning_module_id
        Schema::table('event_sessions', function (Blueprint $table) {
            $table->foreignId('learning_module_id')->nullable()->after('material_id')->constrained('learning_modules')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_sessions', function (Blueprint $table) {
            $table->dropForeign(['learning_module_id']);
            $table->dropColumn('learning_module_id');
        });

        Schema::dropIfExists('event_cbt_packages');
        Schema::dropIfExists('event_learning_modules');
        Schema::dropIfExists('cbt_package_questions');

        Schema::table('cbt_exam_packages', function (Blueprint $table) {
            $table->dropForeign(['question_module_id']);
            $table->dropColumn(['question_module_id', 'target_tracks', 'total_questions']);
        });

        Schema::dropIfExists('question_bank');
        Schema::dropIfExists('question_modules');
        Schema::dropIfExists('learning_module_materials');
        Schema::dropIfExists('learning_modules');
    }
};
