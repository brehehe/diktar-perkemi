<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventSession;

class EventAttendanceScheduleService
{
    public function ensureDefaultSessions(Event $event): void
    {
        $this->ensureArrivalSession($event);

        for ($dayNumber = 1; $dayNumber <= $event->total_days; $dayNumber++) {
            $event->sessions()->firstOrCreate(
                ['session_type_code' => 'KEHADIRAN_HARIAN', 'day_number' => $dayNumber],
                [
                    'date' => $event->start_date->copy()->addDays($dayNumber - 1),
                    'start_time' => '00:00',
                    'end_time' => '23:59',
                    'session_number' => "Harian {$dayNumber}",
                    'duration_jp' => 0,
                    'topic' => "Kehadiran hari ke-{$dayNumber}",
                    'attendance_setting' => 'check_in',
                    'status' => 'scheduled',
                ],
            );
        }

        $this->synchronizeSessionDates($event);
    }

    public function ensureArrivalSession(Event $event): EventSession
    {
        return $event->sessions()->firstOrCreate(
            ['session_type_code' => 'KEHADIRAN_AWAL'],
            [
                'day_number' => 1,
                'date' => $event->start_date,
                'start_time' => '00:00',
                'end_time' => '23:59',
                'session_number' => 'Kedatangan',
                'duration_jp' => 0,
                'topic' => 'Kehadiran awal event',
                'attendance_setting' => 'check_in',
                'status' => 'scheduled',
            ],
        );
    }

    private function synchronizeSessionDates(Event $event): void
    {
        $updatedAt = now();
        $updates = $event->sessions()
            ->whereBetween('day_number', [1, $event->total_days])
            ->get()
            ->map(function (EventSession $session) use ($event, $updatedAt): ?array {
                $expectedDate = $event->start_date->copy()
                    ->addDays($session->day_number - 1)
                    ->toDateString();

                if ($session->date?->toDateString() === $expectedDate) {
                    return null;
                }

                return [
                    ...$session->getAttributes(),
                    'date' => $expectedDate,
                    'updated_at' => $updatedAt,
                ];
            })
            ->filter()
            ->values()
            ->all();

        if ($updates !== []) {
            EventSession::query()->upsert($updates, ['id'], ['date', 'updated_at']);
        }
    }
}
