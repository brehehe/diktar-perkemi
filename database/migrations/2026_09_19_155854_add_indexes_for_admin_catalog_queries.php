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
        Schema::table('learning_modules', function (Blueprint $table) {
            $table->index(['status', 'created_at'], 'learning_modules_status_created_idx');
        });

        Schema::table('question_modules', function (Blueprint $table) {
            $table->index(['status', 'created_at'], 'question_modules_status_created_idx');
        });

        Schema::table('question_bank', function (Blueprint $table) {
            $table->index(['status', 'id'], 'question_bank_status_id_idx');
            $table->index(['question_type', 'id'], 'question_bank_type_id_idx');
            $table->index(['difficulty_level', 'id'], 'question_bank_difficulty_id_idx');
        });

        Schema::table('speakers', function (Blueprint $table) {
            $table->index(['event_id', 'name'], 'speakers_event_name_idx');
            $table->index(['is_active', 'name'], 'speakers_active_name_idx');
            $table->index(['type', 'name'], 'speakers_type_name_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('speakers', function (Blueprint $table) {
            $table->dropIndex('speakers_event_name_idx');
            $table->dropIndex('speakers_active_name_idx');
            $table->dropIndex('speakers_type_name_idx');
        });

        Schema::table('question_bank', function (Blueprint $table) {
            $table->dropIndex('question_bank_status_id_idx');
            $table->dropIndex('question_bank_type_id_idx');
            $table->dropIndex('question_bank_difficulty_id_idx');
        });

        Schema::table('question_modules', function (Blueprint $table) {
            $table->dropIndex('question_modules_status_created_idx');
        });

        Schema::table('learning_modules', function (Blueprint $table) {
            $table->dropIndex('learning_modules_status_created_idx');
        });
    }
};
