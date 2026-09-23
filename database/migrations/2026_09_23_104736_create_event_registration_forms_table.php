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
        Schema::create('event_registration_forms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignId('participant_id')->constrained('participants')->cascadeOnDelete();
            $table->foreignId('event_participant_id')->nullable()->constrained('event_participants')->nullOnDelete();

            // Jenis formulir & tingkat penataran
            $table->string('form_type', 30); // PELATIH, PENGUJI, WASIT
            $table->string('penataran_level', 30)->default('Daerah'); // Daerah, Nasional

            // Detail Penataran
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('location')->nullable();

            // Data Pribadi Peserta
            $table->string('full_name');
            $table->string('birth_place')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('kenshi_id_number', 50)->nullable();
            $table->string('dan_level', 30)->nullable();

            // Kontak & Alamat
            $table->text('home_address')->nullable();
            $table->string('phone_number', 50)->nullable();
            $table->string('email')->nullable();

            // Pekerjaan / Sekolah
            $table->string('occupation')->nullable();
            $table->text('occupation_address')->nullable();
            $table->string('occupation_phone', 50)->nullable();

            // Kontak Darurat
            $table->text('emergency_address')->nullable();
            $table->string('emergency_phone', 50)->nullable();

            // Riwayat Piagam Gasnas / Gasnaswil / Gasprov (JSON: [{ nomor, tanggal }])
            $table->json('gasnas_records')->nullable();

            // Sertifikat Prasyarat yang Dimiliki (JSON: [{ jenis, nomor, tanggal }])
            $table->json('certificate_records')->nullable();

            // Tanda Tangan & Pernyataan
            $table->string('sign_place')->nullable();
            $table->date('sign_date')->nullable();
            $table->string('applicant_name')->nullable();
            $table->longText('signature_data')->nullable(); // Base64 data URL PNG canvas signature

            // Surat Pernyataan & Pembebasan (Waiver)
            $table->boolean('waiver_agreed')->default(true);
            $table->timestamp('waiver_signed_at')->nullable();

            // Status Verifikasi Admin
            $table->string('status', 30)->default('submitted'); // draft, submitted, verified
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('admin_notes')->nullable();

            $table->timestamps();

            // Unique per event + participant
            $table->unique(['event_id', 'participant_id']);
            $table->index(['event_id', 'status']);
            $table->index(['event_id', 'form_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_registration_forms');
    }
};
