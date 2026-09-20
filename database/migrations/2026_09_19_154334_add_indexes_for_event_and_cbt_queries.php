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
        Schema::table('events', function (Blueprint $table) {
            $table->index(['responsible_user_id', 'start_date'], 'events_responsible_start_idx');
            $table->index(['status', 'start_date'], 'events_status_start_idx');
        });

        Schema::table('participants', function (Blueprint $table) {
            $table->unique('user_id', 'participants_user_unique');
        });

        Schema::table('event_participants', function (Blueprint $table) {
            $table->unique(['event_id', 'participant_id'], 'event_participants_event_participant_unique');
            $table->index(['participant_id', 'admin_status'], 'event_participants_participant_status_idx');
        });

        Schema::table('event_sessions', function (Blueprint $table) {
            $table->index(['event_id', 'day_number', 'session_type_code'], 'event_sessions_event_day_type_idx');
            $table->index(['event_id', 'cbt_exam_package_id'], 'event_sessions_event_cbt_idx');
            $table->index(['event_id', 'qr_token'], 'event_sessions_event_qr_token_idx');
            $table->index(['event_id', 'qr_short_code'], 'event_sessions_event_qr_code_idx');
        });

        Schema::table('event_attendances', function (Blueprint $table) {
            $table->index(
                ['event_id', 'participant_id', 'attendance_type', 'status'],
                'event_attendances_event_participant_status_idx',
            );
        });

        Schema::table('cbt_exam_attempts', function (Blueprint $table) {
            $table->index(
                ['cbt_exam_package_id', 'participant_id', 'status'],
                'cbt_attempts_package_participant_status_idx',
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cbt_exam_attempts', function (Blueprint $table) {
            $table->dropIndex('cbt_attempts_package_participant_status_idx');
        });

        Schema::table('event_attendances', function (Blueprint $table) {
            $table->dropIndex('event_attendances_event_participant_status_idx');
        });

        Schema::table('event_sessions', function (Blueprint $table) {
            $table->dropIndex('event_sessions_event_day_type_idx');
            $table->dropIndex('event_sessions_event_cbt_idx');
            $table->dropIndex('event_sessions_event_qr_token_idx');
            $table->dropIndex('event_sessions_event_qr_code_idx');
        });

        Schema::table('event_participants', function (Blueprint $table) {
            $table->dropUnique('event_participants_event_participant_unique');
            $table->dropIndex('event_participants_participant_status_idx');
        });

        Schema::table('participants', function (Blueprint $table) {
            $table->dropUnique('participants_user_unique');
        });

        Schema::table('events', function (Blueprint $table) {
            $table->dropIndex('events_responsible_start_idx');
            $table->dropIndex('events_status_start_idx');
        });
    }
};
