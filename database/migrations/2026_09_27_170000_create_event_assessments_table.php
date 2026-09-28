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
        Schema::create('event_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->foreignId('event_participant_id')->constrained('event_participants')->cascadeOnDelete();
            $table->string('category', 20); // 'PELATIH', 'PENGUJI', 'WASIT'
            $table->string('examiner_name')->nullable();
            $table->string('examiner_rank')->nullable();
            $table->json('scores')->nullable();
            $table->decimal('subtotal_dasar', 5, 2)->default(0);
            $table->decimal('subtotal_pribadi', 5, 2)->default(0);
            $table->decimal('total_score', 5, 2)->default(0);
            $table->boolean('is_passed')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['event_participant_id', 'category']);
            $table->index(['event_id', 'category']);
        });

        Schema::table('events', function (Blueprint $table) {
            $table->json('assessment_settings')->nullable()->after('certificate_signature_settings');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn('assessment_settings');
        });

        Schema::dropIfExists('event_assessments');
    }
};
