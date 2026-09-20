<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('event_modules', function (Blueprint $table) {
            $table->text('learning_indicators')->nullable();
            $table->string('publication_status', 20)->default('published');
            $table->string('source_type', 20)->default('collection');
            $table->text('source_url')->nullable();
            $table->string('source_file_path')->nullable();
        });

        DB::table('event_modules')->where('is_published', false)->update(['publication_status' => 'draft']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_modules', function (Blueprint $table) {
            $table->dropColumn(['learning_indicators', 'publication_status', 'source_type', 'source_url', 'source_file_path']);
        });
    }
};
