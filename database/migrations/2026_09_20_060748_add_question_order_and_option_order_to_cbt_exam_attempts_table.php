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
        Schema::table('cbt_exam_attempts', function (Blueprint $table) {
            $table->json('question_order')->nullable()->after('answers');
            $table->json('option_order')->nullable()->after('question_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cbt_exam_attempts', function (Blueprint $table) {
            $table->dropColumn(['question_order', 'option_order']);
        });
    }
};
