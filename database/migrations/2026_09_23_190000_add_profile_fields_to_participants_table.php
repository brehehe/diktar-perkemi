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
        Schema::table('participants', function (Blueprint $table) {
            $table->date('birth_date')->nullable()->after('dan_rank');
            $table->string('birth_place')->nullable()->after('birth_date');
            $table->string('gender', 20)->nullable()->after('birth_place');
            $table->text('address')->nullable()->after('gender');
            $table->string('occupation')->nullable()->after('address');
            $table->string('occupation_phone', 50)->nullable()->after('occupation');
            $table->string('last_certificate')->nullable()->after('occupation_phone');
            $table->string('last_certificate_number')->nullable()->after('last_certificate');
            $table->string('target_certification')->nullable()->after('last_certificate_number');
            $table->jsonb('simperkemi_data')->nullable()->after('target_certification');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('participants', function (Blueprint $table) {
            $table->dropColumn([
                'birth_date',
                'birth_place',
                'gender',
                'address',
                'occupation',
                'occupation_phone',
                'last_certificate',
                'last_certificate_number',
                'target_certification',
                'simperkemi_data',
            ]);
        });
    }
};
