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
        if (Schema::hasTable('question_modules') && ! Schema::hasColumn('question_modules', 'event_id')) {
            Schema::table('question_modules', function (Blueprint $table) {
                $table->foreignId('event_id')->nullable()->after('id')->constrained('events')->nullOnDelete();
                $table->index('event_id', 'question_modules_event_idx');
            });
        }

        if (Schema::hasTable('question_bank') && ! Schema::hasColumn('question_bank', 'event_id')) {
            Schema::table('question_bank', function (Blueprint $table) {
                $table->foreignId('event_id')->nullable()->after('id')->constrained('events')->nullOnDelete();
                $table->index('event_id', 'question_bank_event_idx');
            });
        }

        if (Schema::hasTable('participants') && ! Schema::hasColumn('participants', 'event_id')) {
            Schema::table('participants', function (Blueprint $table) {
                $table->foreignId('event_id')->nullable()->after('id')->constrained('events')->nullOnDelete();
                $table->index('event_id', 'participants_event_idx');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('participants') && Schema::hasColumn('participants', 'event_id')) {
            Schema::table('participants', function (Blueprint $table) {
                $table->dropForeign(['event_id']);
                $table->dropIndex('participants_event_idx');
                $table->dropColumn('event_id');
            });
        }

        if (Schema::hasTable('question_bank') && Schema::hasColumn('question_bank', 'event_id')) {
            Schema::table('question_bank', function (Blueprint $table) {
                $table->dropForeign(['event_id']);
                $table->dropIndex('question_bank_event_idx');
                $table->dropColumn('event_id');
            });
        }

        if (Schema::hasTable('question_modules') && Schema::hasColumn('question_modules', 'event_id')) {
            Schema::table('question_modules', function (Blueprint $table) {
                $table->dropForeign(['event_id']);
                $table->dropIndex('question_modules_event_idx');
                $table->dropColumn('event_id');
            });
        }
    }
};
