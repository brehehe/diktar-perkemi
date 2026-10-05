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
        Schema::table('event_sessions', function (Blueprint $table) {
            if (! Schema::hasColumn('event_sessions', 'is_hidden')) {
                $table->boolean('is_hidden')->default(false)->index();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_sessions', function (Blueprint $table) {
            if (Schema::hasColumn('event_sessions', 'is_hidden')) {
                $table->dropColumn('is_hidden');
            }
        });
    }
};
