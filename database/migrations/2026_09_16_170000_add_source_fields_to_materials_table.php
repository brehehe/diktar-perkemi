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
        Schema::table('materials', function (Blueprint $table) {
            if (! Schema::hasColumn('materials', 'source_type')) {
                $table->string('source_type')->default('uploaded_pdf')->after('type');
            }
            if (! Schema::hasColumn('materials', 'external_url')) {
                $table->text('external_url')->nullable()->after('cover_path');
            }
            if (! Schema::hasColumn('materials', 'external_source_name')) {
                $table->string('external_source_name')->nullable()->after('external_url');
            }
            if (! Schema::hasColumn('materials', 'external_open_mode')) {
                $table->string('external_open_mode')->default('new_tab')->after('external_source_name');
            }
            if (! Schema::hasColumn('materials', 'video_provider')) {
                $table->string('video_provider')->nullable()->after('external_open_mode');
            }
            if (! Schema::hasColumn('materials', 'video_id')) {
                $table->string('video_id')->nullable()->after('video_provider');
            }
            if (! Schema::hasColumn('materials', 'video_url')) {
                $table->text('video_url')->nullable()->after('video_id');
            }
            if (! Schema::hasColumn('materials', 'video_allow_portal')) {
                $table->boolean('video_allow_portal')->default(true)->after('video_url');
            }
            if (! Schema::hasColumn('materials', 'access_scope')) {
                $table->string('access_scope')->default('all')->after('status');
            }
            if (! Schema::hasColumn('materials', 'allow_download')) {
                $table->boolean('allow_download')->default(false)->after('is_downloadable');
            }
            if (! Schema::hasColumn('materials', 'key_points')) {
                $table->json('key_points')->nullable()->after('admin_notes');
            }
            if (! Schema::hasColumn('materials', 'learning_objectives')) {
                $table->json('learning_objectives')->nullable()->after('key_points');
            }
            if (! Schema::hasColumn('materials', 'target_roles')) {
                $table->json('target_roles')->nullable()->after('learning_objectives');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('materials', function (Blueprint $table) {
            $columns = [
                'source_type',
                'external_url',
                'external_source_name',
                'external_open_mode',
                'video_provider',
                'video_id',
                'video_url',
                'video_allow_portal',
                'access_scope',
                'allow_download',
                'key_points',
                'learning_objectives',
                'target_roles',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('materials', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
