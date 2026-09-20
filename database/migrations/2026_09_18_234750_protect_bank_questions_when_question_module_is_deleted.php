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
            $table->dropForeign(['question_module_id']);
            $table->foreign('question_module_id')->references('id')->on('question_modules')->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('question_bank', function (Blueprint $table) {
            $table->dropForeign(['question_module_id']);
            $table->foreign('question_module_id')->references('id')->on('question_modules')->cascadeOnDelete();
        });
    }
};
