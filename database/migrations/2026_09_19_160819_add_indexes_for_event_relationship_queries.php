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
        Schema::table('event_modules', function (Blueprint $table) {
            $table->index('event_id', 'event_modules_event_idx');
            $table->index('speaker_id', 'event_modules_speaker_idx');
            $table->index('material_id', 'event_modules_material_idx');
        });

        Schema::table('event_sessions', function (Blueprint $table) {
            $table->index('speaker_id', 'event_sessions_speaker_idx');
            $table->index('event_room_id', 'event_sessions_room_idx');
            $table->index('learning_module_id', 'event_sessions_learning_module_idx');
            $table->index('event_module_id', 'event_sessions_event_module_idx');
        });

        Schema::table('event_learning_modules', function (Blueprint $table) {
            $table->unique(['event_id', 'learning_module_id'], 'event_learning_modules_event_module_unique');
            $table->index(['learning_module_id', 'event_id'], 'event_learning_modules_module_event_idx');
        });

        Schema::table('learning_module_materials', function (Blueprint $table) {
            $table->index('material_id', 'learning_module_materials_material_idx');
        });

        Schema::table('cbt_package_questions', function (Blueprint $table) {
            $table->index('question_id', 'cbt_package_questions_question_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cbt_package_questions', function (Blueprint $table) {
            $table->dropIndex('cbt_package_questions_question_idx');
        });

        Schema::table('learning_module_materials', function (Blueprint $table) {
            $table->dropIndex('learning_module_materials_material_idx');
        });

        Schema::table('event_learning_modules', function (Blueprint $table) {
            $table->dropUnique('event_learning_modules_event_module_unique');
            $table->dropIndex('event_learning_modules_module_event_idx');
        });

        Schema::table('event_sessions', function (Blueprint $table) {
            $table->dropIndex('event_sessions_speaker_idx');
            $table->dropIndex('event_sessions_room_idx');
            $table->dropIndex('event_sessions_learning_module_idx');
            $table->dropIndex('event_sessions_event_module_idx');
        });

        Schema::table('event_modules', function (Blueprint $table) {
            $table->dropIndex('event_modules_event_idx');
            $table->dropIndex('event_modules_speaker_idx');
            $table->dropIndex('event_modules_material_idx');
        });
    }
};
