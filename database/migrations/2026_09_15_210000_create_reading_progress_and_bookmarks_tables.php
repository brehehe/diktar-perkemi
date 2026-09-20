<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * The `if (!Schema::hasTable())` guards prevent re-creating tables that
     * already exist in the production PostgreSQL database. In test environments
     * (SQLite in-memory) these tables do not exist yet, so they are created
     * with the correct schema that matches production.
     */
    public function up(): void
    {
        if (! Schema::hasTable('reading_progress')) {
            Schema::create('reading_progress', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->foreignId('material_id')->constrained()->cascadeOnDelete();
                $table->foreignId('material_file_id')->nullable()->constrained()->nullOnDelete();
                $table->unsignedInteger('current_page')->default(1);
                $table->unsignedInteger('total_pages')->nullable();
                $table->unsignedTinyInteger('progress_percent')->default(0);
                $table->json('position_data')->nullable();
                $table->timestamp('started_at')->nullable();
                $table->timestamp('last_read_at')->nullable();
                $table->timestamp('completed_at')->nullable();
                $table->timestamps();

                $table->unique(['user_id', 'material_id']);
            });
        }

        if (! Schema::hasTable('bookmarks')) {
            Schema::create('bookmarks', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->foreignId('material_id')->constrained()->cascadeOnDelete();
                $table->unsignedInteger('page_number');
                $table->json('position_data')->nullable();
                $table->text('note')->nullable();
                $table->timestamps();
                $table->softDeletes();

                $table->unique(['user_id', 'material_id', 'page_number']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookmarks');
        Schema::dropIfExists('reading_progress');
    }
};
