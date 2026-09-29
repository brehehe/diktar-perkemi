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
        Schema::create('finance_categories', function (Blueprint $table) {
            $table->id();
            $table->string('code', 30)->unique();
            $table->string('name', 100)->unique();
            $table->string('transaction_type', 10);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        $now = now();
        DB::table('finance_categories')->insert([
            ['code' => 'sponsorship', 'name' => 'Sponsor', 'transaction_type' => 'income', 'sort_order' => 10, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'registration', 'name' => 'Pendaftaran', 'transaction_type' => 'income', 'sort_order' => 20, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'grant', 'name' => 'Hibah / Bantuan', 'transaction_type' => 'income', 'sort_order' => 30, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'accommodation', 'name' => 'Akomodasi', 'transaction_type' => 'expense', 'sort_order' => 40, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'consumption', 'name' => 'Konsumsi', 'transaction_type' => 'expense', 'sort_order' => 50, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'printing', 'name' => 'Cetak & ATK', 'transaction_type' => 'expense', 'sort_order' => 60, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'venue', 'name' => 'Tempat / Venue', 'transaction_type' => 'expense', 'sort_order' => 70, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'transport', 'name' => 'Transportasi', 'transaction_type' => 'expense', 'sort_order' => 80, 'created_at' => $now, 'updated_at' => $now],
            ['code' => 'other', 'name' => 'Lainnya', 'transaction_type' => 'both', 'sort_order' => 90, 'created_at' => $now, 'updated_at' => $now],
        ]);

        Schema::table('event_finances', function (Blueprint $table) {
            $table->foreign('category')
                ->references('code')
                ->on('finance_categories')
                ->restrictOnUpdate()
                ->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_finances', function (Blueprint $table) {
            $table->dropForeign(['category']);
        });

        Schema::dropIfExists('finance_categories');
    }
};
