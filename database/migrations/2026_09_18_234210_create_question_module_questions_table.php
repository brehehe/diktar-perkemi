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
        Schema::create('question_module_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_module_id')->constrained('question_modules')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('question_bank')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['question_module_id', 'question_id']);
            $table->index('question_id');
        });

        DB::table('question_bank')->orderBy('id')->chunkById(500, function ($questions): void {
            $now = now();
            DB::table('question_module_questions')->insert($questions->map(fn ($question): array => [
                'question_module_id' => $question->question_module_id,
                'question_id' => $question->id,
                'created_at' => $now,
                'updated_at' => $now,
            ])->all());
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('question_module_questions');
    }
};
