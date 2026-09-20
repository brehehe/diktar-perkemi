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
        Schema::create('event_rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->string('name', 100);
            $table->timestamps();
            $table->unique(['event_id', 'name']);
        });

        Schema::table('event_sessions', function (Blueprint $table) {
            $table->foreignId('event_room_id')->nullable()->constrained('event_rooms')->nullOnDelete();
        });

        DB::table('event_sessions')->whereNotNull('room')->where('room', '!=', '')
            ->select('event_id', 'room')->distinct()->get()->each(function (object $room): void {
                $roomId = DB::table('event_rooms')->insertGetId([
                    'event_id' => $room->event_id,
                    'name' => $room->room,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                DB::table('event_sessions')->where('event_id', $room->event_id)
                    ->where('room', $room->room)->update(['event_room_id' => $roomId]);
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_sessions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('event_room_id');
        });
        Schema::dropIfExists('event_rooms');
    }
};
