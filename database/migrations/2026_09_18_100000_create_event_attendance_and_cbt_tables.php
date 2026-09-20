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
        // 1. CBT Exam Packages (Paket Ujian CBT)
        if (! Schema::hasTable('cbt_exam_packages')) {
            Schema::create('cbt_exam_packages', function (Blueprint $table) {
                $table->id();
                $table->foreignId('event_id')->nullable()->constrained('events')->nullOnDelete();
                $table->string('title');
                $table->string('code', 50)->unique();
                $table->text('description')->nullable();
                $table->string('exam_type', 30)->default('theory'); // pre_test, post_test, theory, module_eval, remedial
                $table->integer('duration_minutes')->default(60);
                $table->decimal('passing_score', 5, 2)->default(70.00);
                $table->integer('attempts_allowed')->default(1);
                $table->timestamp('start_time')->nullable();
                $table->timestamp('end_time')->nullable();
                $table->text('instructions')->nullable();
                $table->string('status', 30)->default('ready'); // draft, ready, open, closed, archived
                $table->boolean('randomize_questions')->default(false);
                $table->boolean('randomize_answers')->default(false);
                $table->string('result_display', 30)->default('immediate'); // immediate, after_closed, admin_only
                $table->timestamps();
                $table->softDeletes();
            });
        }

        // 2. CBT Questions (Bank Soal CBT)
        if (! Schema::hasTable('cbt_questions')) {
            Schema::create('cbt_questions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('cbt_exam_package_id')->constrained('cbt_exam_packages')->cascadeOnDelete();
                $table->text('question_text');
                $table->string('question_type', 30)->default('single_choice'); // single_choice, multiple_choice, boolean, essay
                $table->json('options')->nullable(); // [{"id": "A", "text": "Jawaban A"}, ...]
                $table->json('correct_answer')->nullable(); // "A" or ["A", "B"] or "true"
                $table->decimal('points', 5, 2)->default(10.00);
                $table->text('explanation')->nullable();
                $table->string('category', 50)->nullable();
                $table->foreignId('material_id')->nullable()->constrained('materials')->nullOnDelete();
                $table->integer('sort_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // 3. CBT Exam Attempts (Pengerjaan Ujian Peserta)
        if (! Schema::hasTable('cbt_exam_attempts')) {
            Schema::create('cbt_exam_attempts', function (Blueprint $table) {
                $table->id();
                $table->foreignId('cbt_exam_package_id')->constrained('cbt_exam_packages')->cascadeOnDelete();
                $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
                $table->foreignId('event_session_id')->nullable()->constrained('event_sessions')->nullOnDelete();
                $table->foreignId('participant_id')->constrained('participants')->cascadeOnDelete();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->integer('attempt_number')->default(1);
                $table->timestamp('started_at');
                $table->timestamp('submitted_at')->nullable();
                $table->string('status', 30)->default('in_progress'); // in_progress, submitted, evaluated, timed_out
                $table->decimal('total_score', 5, 2)->nullable();
                $table->boolean('is_passed')->nullable();
                $table->json('answers')->nullable(); // {"1": "A", "2": "C"}
                $table->text('feedback')->nullable();
                $table->timestamps();
            });
        }

        // 4. Update Event Sessions with QR, Attendance & CBT integration
        Schema::table('event_sessions', function (Blueprint $table) {
            if (! Schema::hasColumn('event_sessions', 'attendance_setting')) {
                $table->string('attendance_setting', 30)->default('check_in')->after('status'); // none, check_in, check_in_out
            }
            if (! Schema::hasColumn('event_sessions', 'is_attendance_open')) {
                $table->boolean('is_attendance_open')->default(false)->after('attendance_setting');
            }
            if (! Schema::hasColumn('event_sessions', 'attendance_open_at')) {
                $table->timestamp('attendance_open_at')->nullable()->after('is_attendance_open');
            }
            if (! Schema::hasColumn('event_sessions', 'attendance_close_at')) {
                $table->timestamp('attendance_close_at')->nullable()->after('attendance_open_at');
            }
            if (! Schema::hasColumn('event_sessions', 'qr_token')) {
                $table->string('qr_token', 64)->nullable()->after('attendance_close_at');
            }
            if (! Schema::hasColumn('event_sessions', 'qr_short_code')) {
                $table->string('qr_short_code', 10)->nullable()->after('qr_token');
            }
            if (! Schema::hasColumn('event_sessions', 'material_id')) {
                $table->foreignId('material_id')->nullable()->after('event_module_id')->constrained('materials')->nullOnDelete();
            }
            if (! Schema::hasColumn('event_sessions', 'cbt_exam_package_id')) {
                $table->foreignId('cbt_exam_package_id')->nullable()->after('material_id')->constrained('cbt_exam_packages')->nullOnDelete();
            }
            if (! Schema::hasColumn('event_sessions', 'requires_attendance_before_cbt')) {
                $table->boolean('requires_attendance_before_cbt')->default(false)->after('cbt_exam_package_id');
            }
        });

        // 5. Update Event Participants with Check-in status
        Schema::table('event_participants', function (Blueprint $table) {
            if (! Schema::hasColumn('event_participants', 'checked_in_at')) {
                $table->timestamp('checked_in_at')->nullable()->after('has_seen_welcome');
            }
            if (! Schema::hasColumn('event_participants', 'checkin_method')) {
                $table->string('checkin_method', 30)->nullable()->after('checked_in_at'); // web_portal, manual_admin
            }
            if (! Schema::hasColumn('event_participants', 'checkin_status')) {
                $table->string('checkin_status', 30)->default('registered')->after('checkin_method'); // registered, checked_in
            }
            if (! Schema::hasColumn('event_participants', 'checkin_notes')) {
                $table->text('checkin_notes')->nullable()->after('checkin_status');
            }
        });

        // 6. Event Attendances (Pencatatan Kehadiran Sesi Mandiri / QR)
        if (! Schema::hasTable('event_attendances')) {
            Schema::create('event_attendances', function (Blueprint $table) {
                $table->id();
                $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
                $table->foreignId('event_session_id')->constrained('event_sessions')->cascadeOnDelete();
                $table->foreignId('participant_id')->constrained('participants')->cascadeOnDelete();
                $table->string('attendance_type', 20)->default('check_in'); // check_in, check_out
                $table->string('status', 30)->default('present'); // present, late, excused, absent, manual_override
                $table->timestamp('checked_in_at')->nullable();
                $table->timestamp('checked_out_at')->nullable();
                $table->string('method', 30)->default('qr_scan'); // qr_scan, short_code, manual_admin
                $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->unique(['event_session_id', 'participant_id', 'attendance_type'], 'uniq_session_part_att');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_attendances');

        Schema::table('event_participants', function (Blueprint $table) {
            $table->dropColumn(['checked_in_at', 'checkin_method', 'checkin_status', 'checkin_notes']);
        });

        Schema::table('event_sessions', function (Blueprint $table) {
            $table->dropForeign(['cbt_exam_package_id']);
            $table->dropForeign(['material_id']);
            $table->dropColumn([
                'attendance_setting',
                'is_attendance_open',
                'attendance_open_at',
                'attendance_close_at',
                'qr_token',
                'qr_short_code',
                'material_id',
                'cbt_exam_package_id',
                'requires_attendance_before_cbt',
            ]);
        });

        Schema::dropIfExists('cbt_exam_attempts');
        Schema::dropIfExists('cbt_questions');
        Schema::dropIfExists('cbt_exam_packages');
    }
};
