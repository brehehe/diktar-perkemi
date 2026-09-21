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
            $table->string('transcript_number')->nullable()->after('certificate_issued_at');
            $table->string('transcript_file_path')->nullable()->after('transcript_number');
            $table->date('transcript_issued_at')->nullable()->after('transcript_file_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_participants', function (Blueprint $table) {
            $table->dropColumn([
                'transcript_number',
                'transcript_file_path',
                'transcript_issued_at',
            ]);
        });
    }
};
