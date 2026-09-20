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
        Schema::table('cbt_exam_packages', function (Blueprint $table) {
            $table->string('revision_method', 20)->default('none');
            $table->timestamp('revision_deadline')->nullable();
        });

        Schema::table('cbt_exam_attempts', function (Blueprint $table) {
            $table->string('revision_file_path')->nullable();
            $table->string('revision_status', 20)->nullable();
            $table->timestamp('revision_submitted_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cbt_exam_attempts', function (Blueprint $table) {
            $table->dropColumn(['revision_file_path', 'revision_status', 'revision_submitted_at']);
        });

        Schema::table('cbt_exam_packages', function (Blueprint $table) {
            $table->dropColumn(['revision_method', 'revision_deadline']);
        });
    }
};
