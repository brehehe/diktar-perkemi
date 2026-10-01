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
        if (Schema::hasTable('events') && ! Schema::hasColumn('events', 'event_type')) {
            Schema::table('events', function (Blueprint $table) {
                $table->string('event_type', 30)->default('penataran')->after('status');
                $table->index('event_type');
            });
        }

        if (Schema::hasTable('event_registration_forms')) {
            Schema::table('event_registration_forms', function (Blueprint $table) {
                if (! Schema::hasColumn('event_registration_forms', 'target_level')) {
                    $table->string('target_level', 50)->nullable()->after('penataran_level');
                }
                if (! Schema::hasColumn('event_registration_forms', 'last_exam_date')) {
                    $table->date('last_exam_date')->nullable()->after('certificate_records');
                }
                if (! Schema::hasColumn('event_registration_forms', 'last_certificate_number')) {
                    $table->string('last_certificate_number', 100)->nullable()->after('last_exam_date');
                }
                if (! Schema::hasColumn('event_registration_forms', 'last_certificate_date')) {
                    $table->date('last_certificate_date')->nullable()->after('last_certificate_number');
                }
                if (! Schema::hasColumn('event_registration_forms', 'dojo_name')) {
                    $table->string('dojo_name')->nullable()->after('last_certificate_date');
                }
                if (! Schema::hasColumn('event_registration_forms', 'dojo_leader_name')) {
                    $table->string('dojo_leader_name')->nullable()->after('dojo_name');
                }
                if (! Schema::hasColumn('event_registration_forms', 'dojo_leader_position')) {
                    $table->string('dojo_leader_position')->nullable()->after('dojo_leader_name');
                }
                if (! Schema::hasColumn('event_registration_forms', 'exam_fee')) {
                    $table->string('exam_fee', 50)->nullable()->after('dojo_leader_position');
                }
                if (! Schema::hasColumn('event_registration_forms', 'extra_fields')) {
                    $table->json('extra_fields')->nullable()->after('exam_fee');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('events') && Schema::hasColumn('events', 'event_type')) {
            Schema::table('events', function (Blueprint $table) {
                $table->dropIndex(['event_type']);
                $table->dropColumn('event_type');
            });
        }

        if (Schema::hasTable('event_registration_forms')) {
            Schema::table('event_registration_forms', function (Blueprint $table) {
                $columns = [
                    'target_level',
                    'last_exam_date',
                    'last_certificate_number',
                    'last_certificate_date',
                    'dojo_name',
                    'dojo_leader_name',
                    'dojo_leader_position',
                    'exam_fee',
                    'extra_fields',
                ];
                $existing = array_filter($columns, fn ($col) => Schema::hasColumn('event_registration_forms', $col));
                if (! empty($existing)) {
                    $table->dropColumn(array_values($existing));
                }
            });
        }
    }
};
