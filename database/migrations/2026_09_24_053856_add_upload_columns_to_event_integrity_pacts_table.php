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
        Schema::table('event_integrity_pacts', function (Blueprint $table) {
            $table->string('file_path')->nullable()->after('signature_data');
            $table->string('original_file_name')->nullable()->after('file_path');
            $table->unsignedBigInteger('file_size')->nullable()->after('original_file_name');
            $table->string('submission_mode', 20)->default('online')->after('file_size'); // online, upload
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_integrity_pacts', function (Blueprint $table) {
            $table->dropColumn(['file_path', 'original_file_name', 'file_size', 'submission_mode']);
        });
    }
};
