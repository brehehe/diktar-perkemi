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
        Schema::create('event_integrity_pacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('participant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('event_participant_id')->nullable()->constrained('event_participants')->nullOnDelete();

            $table->string('pact_type', 30); // pelatih, penguji, wasit
            $table->string('track_code', 20)->nullable(); // PD, PN, PED, PEN, WAD, WAN

            // Data Kenshi
            $table->string('full_name');
            $table->string('birth_place')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('kenshi_id_number', 50)->nullable();
            $table->string('dan_level', 50)->nullable();
            $table->string('religion', 50)->nullable();
            $table->string('dojo')->nullable();
            $table->string('city')->nullable();
            $table->string('province')->nullable();

            // Sertifikat & Lisensi
            $table->string('certificate_number')->nullable();
            $table->date('valid_start_date')->nullable();
            $table->date('valid_end_date')->nullable();

            // Alamat
            $table->text('id_card_address')->nullable();
            $table->text('current_address')->nullable();

            // Kepengurusan
            $table->string('management_organization')->nullable();
            $table->string('management_position')->nullable();

            // Tanda Tangan Digital
            $table->string('sign_place')->default('Mojokerto');
            $table->date('sign_date');
            $table->longText('signature_data')->nullable(); // Base64 Canvas data URI
            $table->timestamp('signed_at')->nullable();

            // Status
            $table->string('status', 30)->default('draft'); // draft, signed, verified
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->text('admin_notes')->nullable();

            $table->timestamps();

            $table->unique(['event_id', 'participant_id', 'pact_type'], 'uniq_event_participant_pact');
            $table->index(['event_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_integrity_pacts');
    }
};
