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
        Schema::create('event_staff', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('duty', 20);
            $table->timestamps();
            $table->unique(['event_id', 'user_id', 'duty']);
        });

        Schema::create('event_finances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('type', 10);
            $table->string('category', 30);
            $table->string('description');
            $table->string('sponsor_name')->nullable();
            $table->unsignedBigInteger('amount');
            $table->date('occurred_on');
            $table->string('evidence_path')->nullable();
            $table->timestamps();
            $table->index(['event_id', 'occurred_on']);
        });

        Schema::create('event_activity_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('event_session_id')->nullable()->constrained('event_sessions')->nullOnDelete();
            $table->string('kind', 20);
            $table->string('title');
            $table->string('activity_type', 60);
            $table->date('occurred_on');
            $table->text('notes')->nullable();
            $table->string('file_path')->nullable();
            $table->string('file_mime', 100)->nullable();
            $table->timestamps();
            $table->index(['event_id', 'kind']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_activity_records');
        Schema::dropIfExists('event_finances');
        Schema::dropIfExists('event_staff');
    }
};
