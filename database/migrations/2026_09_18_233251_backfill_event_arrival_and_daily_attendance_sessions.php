<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('events')->whereNull('deleted_at')
            ->whereNotNull('start_date')->whereNotNull('end_date')
            ->select(['id', 'start_date', 'end_date'])
            ->orderBy('id')->chunkById(100, function ($events): void {
                foreach ($events as $event) {
                    $startDate = Carbon::parse($event->start_date)->startOfDay();
                    $endDate = Carbon::parse($event->end_date)->startOfDay();
                    if ($endDate->isBefore($startDate)) {
                        continue;
                    }

                    if (! DB::table('event_sessions')->where('event_id', $event->id)
                        ->where('session_type_code', 'KEHADIRAN_AWAL')->exists()) {
                        DB::table('event_sessions')->insert([
                            'event_id' => $event->id,
                            'day_number' => 1,
                            'date' => $startDate->toDateString(),
                            'start_time' => '00:00',
                            'end_time' => '23:59',
                            'session_number' => 'Kedatangan',
                            'duration_jp' => 0,
                            'session_type_code' => 'KEHADIRAN_AWAL',
                            'topic' => 'Kehadiran awal event',
                            'attendance_setting' => 'check_in',
                            'status' => 'scheduled',
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }

                    for ($date = $startDate->copy(), $dayNumber = 1; $date->lte($endDate); $date->addDay(), $dayNumber++) {
                        if (DB::table('event_sessions')->where('event_id', $event->id)
                            ->where('session_type_code', 'KEHADIRAN_HARIAN')
                            ->where('day_number', $dayNumber)->exists()) {
                            continue;
                        }

                        DB::table('event_sessions')->insert([
                            'event_id' => $event->id,
                            'day_number' => $dayNumber,
                            'date' => $date->toDateString(),
                            'start_time' => '00:00',
                            'end_time' => '23:59',
                            'session_number' => "Harian {$dayNumber}",
                            'duration_jp' => 0,
                            'session_type_code' => 'KEHADIRAN_HARIAN',
                            'topic' => "Kehadiran hari ke-{$dayNumber}",
                            'attendance_setting' => 'check_in',
                            'status' => 'scheduled',
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Attendance records can refer to these sessions, so rollback retains them.
    }
};
