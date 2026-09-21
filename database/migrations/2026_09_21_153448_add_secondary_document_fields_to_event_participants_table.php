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
        Schema::table('event_participants', function (Blueprint $table) {
            $table->string('secondary_certificate_number')->nullable();
            $table->string('secondary_certificate_file_path')->nullable();
            $table->date('secondary_certificate_issued_at')->nullable();
            $table->string('secondary_transcript_number')->nullable();
            $table->string('secondary_transcript_file_path')->nullable();
            $table->date('secondary_transcript_issued_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_participants', function (Blueprint $table) {
            $table->dropColumn([
                'secondary_certificate_number',
                'secondary_certificate_file_path',
                'secondary_certificate_issued_at',
                'secondary_transcript_number',
                'secondary_transcript_file_path',
                'secondary_transcript_issued_at',
            ]);
        });
    }
};
