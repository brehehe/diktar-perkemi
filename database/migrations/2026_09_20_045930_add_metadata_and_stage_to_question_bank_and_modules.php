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
        Schema::table('question_bank', function (Blueprint $table) {
            $table->string('exam_stage', 30)->nullable()->after('difficulty_level');
            $table->json('metadata')->nullable()->after('explanation');
        });

        Schema::table('question_modules', function (Blueprint $table) {
            $table->json('metadata')->nullable()->after('evaluation_purpose');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('question_bank', function (Blueprint $table) {
            $table->dropColumn(['exam_stage', 'metadata']);
        });

        Schema::table('question_modules', function (Blueprint $table) {
            $table->dropColumn(['metadata']);
        });
    }
};
