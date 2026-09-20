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
        DB::table('participants')
            ->whereNotNull('kenshi_id_number')
            ->update([
                'kenshi_id_number' => DB::raw("NULLIF(UPPER(TRIM(kenshi_id_number)), '')"),
            ]);

        Schema::table('participants', function (Blueprint $table) {
            $table->unique('kenshi_id_number', 'participants_kenshi_id_number_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('participants', function (Blueprint $table) {
            $table->dropUnique('participants_kenshi_id_number_unique');
        });
    }
};
