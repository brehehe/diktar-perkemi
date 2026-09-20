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
        // 1. Participant Tracks (Jalur Peserta)
        if (! Schema::hasTable('participant_tracks')) {
            Schema::create('participant_tracks', function (Blueprint $table) {
                $table->id();
                $table->string('code', 20)->unique(); // PD, PN, PED, PEN, WAD, WAN, PWAD, PWAN
                $table->string('name');
                $table->text('description')->nullable();
                $table->string('color', 20)->nullable();
                $table->smallInteger('sort_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // 2. Event Session Types (Jenis Sesi Rundown)
        if (! Schema::hasTable('event_session_types')) {
            Schema::create('event_session_types', function (Blueprint $table) {
                $table->id();
                $table->string('code', 30)->unique(); // PLENO, PAR_PELATIH, PAR_PENGUJI, PAR_WASIT, PAR_GANDA, UJIAN, REFLEKSI, PENUTUPAN
                $table->string('name');
                $table->string('color', 20)->nullable();
                $table->string('badge_color', 20)->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // 3. Speakers (Master Pemateri)
        if (! Schema::hasTable('speakers')) {
            Schema::create('speakers', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('title_degree')->nullable();
                $table->string('type', 20)->default('internal'); // internal, external
                $table->string('dan_rank', 20)->nullable();
                $table->string('position')->nullable(); // Jabatan di PERKEMI (internal)
                $table->string('organization')->nullable(); // Instansi / Lembaga (external)
                $table->string('specialization')->nullable(); // Keahlian utama
                $table->text('bio')->nullable();
                $table->string('avatar_path')->nullable();
                $table->string('contact_phone')->nullable();
                $table->string('contact_email')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                $table->softDeletes();
            });
        }

        // 4. Events (Event Penataran)
        if (! Schema::hasTable('events')) {
            Schema::create('events', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('slug')->unique();
                $table->text('description')->nullable();
                $table->date('start_date');
                $table->date('end_date');
                $table->string('location');
                $table->string('organizer')->default('PB PERKEMI');
                $table->string('duration_text')->default('3,5 hari');
                $table->integer('total_effective_jp')->default(34); // Total JP Efektif
                $table->integer('total_schedule_jp')->default(38); // Total JP Jadwal
                $table->integer('jp_duration_minutes')->default(45); // 1 JP = 45 menit
                $table->string('learning_method')->default('Pleno, paralel, dan rotasi peserta ganda');
                $table->integer('quota')->default(100);
                $table->string('status', 30)->default('draft'); // draft, registration_open, ongoing, completed, archived
                $table->string('banner_path')->nullable();
                $table->string('rundown_doc_path')->nullable();
                $table->json('access_roles')->nullable();
                $table->json('facilities_checklist')->nullable();
                $table->json('requirements_checklist')->nullable();
                $table->timestamps();
                $table->softDeletes();
            });
        }

        // 5. Event Modules (Modul Event)
        if (! Schema::hasTable('event_modules')) {
            Schema::create('event_modules', function (Blueprint $table) {
                $table->id();
                $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
                $table->string('code', 30);
                $table->string('title');
                $table->text('description')->nullable();
                $table->integer('jp')->default(2);
                $table->json('track_codes')->nullable();
                $table->foreignId('speaker_id')->nullable()->constrained('speakers')->nullOnDelete();
                $table->foreignId('material_id')->nullable()->constrained('materials')->nullOnDelete();
                $table->string('fulfillment_method')->nullable();
                $table->boolean('is_published')->default(true);
                $table->timestamps();
            });
        }

        // 6. Event Sessions (Sesi Rundown Event)
        if (! Schema::hasTable('event_sessions')) {
            Schema::create('event_sessions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
                $table->smallInteger('day_number')->default(1);
                $table->date('date')->nullable();
                $table->string('start_time', 10);
                $table->string('end_time', 10);
                $table->string('session_number', 20)->nullable();
                $table->integer('duration_jp')->default(1);
                $table->string('session_type_code', 30);
                $table->string('topic');
                $table->text('subtopic')->nullable();
                $table->string('method')->nullable();
                $table->foreignId('speaker_id')->nullable()->constrained('speakers')->nullOnDelete();
                $table->foreignId('event_module_id')->nullable()->constrained('event_modules')->nullOnDelete();
                $table->string('room')->nullable();
                $table->json('track_codes')->nullable();
                $table->string('status', 20)->default('scheduled');
                $table->timestamps();
            });
        }

        // 7. Participants (Master Peserta Kenshi)
        if (! Schema::hasTable('participants')) {
            Schema::create('participants', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('name');
                $table->string('kenshi_id_number', 50)->nullable(); // NIK / Nomor Kenshi
                $table->string('email')->nullable();
                $table->string('phone', 30)->nullable();
                $table->string('origin_province')->nullable();
                $table->string('origin_city')->nullable();
                $table->string('origin_dojo')->nullable();
                $table->string('dan_rank', 20)->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
                $table->softDeletes();
            });
        }

        // 8. Event Participants (Peserta Terdaftar dalam Event)
        if (! Schema::hasTable('event_participants')) {
            Schema::create('event_participants', function (Blueprint $table) {
                $table->id();
                $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
                $table->foreignId('participant_id')->constrained('participants')->cascadeOnDelete();
                $table->string('track_code', 20); // PD, PN, PED, PEN, WAD, WAN, PWAD, PWAN
                $table->string('rotation_group', 10)->nullable(); // A1, A2
                $table->string('admin_status', 30)->default('verified'); // pending, verified, rejected
                $table->string('attendance_status', 30)->default('present'); // present, absent, partial
                $table->json('attendance_records')->nullable();
                $table->string('graduation_status', 30)->default('in_training'); // in_training, passed, failed, conditional
                $table->string('certificate_number')->nullable();
                $table->date('certificate_issued_at')->nullable();
                $table->decimal('score_theory', 5, 2)->nullable();
                $table->decimal('score_practice', 5, 2)->nullable();
                $table->text('evaluation_notes')->nullable();
                $table->boolean('has_seen_welcome')->default(false);
                $table->timestamps();
            });
        }

        // 9. Event Legends & Abbreviations (Glosarium Singkatan Resmi)
        if (! Schema::hasTable('event_legends')) {
            Schema::create('event_legends', function (Blueprint $table) {
                $table->id();
                $table->string('acronym', 30);
                $table->string('full_name');
                $table->string('category', 30)->default('istilah'); // istilah, jalur, sesi
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_legends');
        Schema::dropIfExists('event_participants');
        Schema::dropIfExists('participants');
        Schema::dropIfExists('event_sessions');
        Schema::dropIfExists('event_modules');
        Schema::dropIfExists('events');
        Schema::dropIfExists('speakers');
        Schema::dropIfExists('event_session_types');
        Schema::dropIfExists('participant_tracks');
    }
};
