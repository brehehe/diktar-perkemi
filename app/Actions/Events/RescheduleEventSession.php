<?php

namespace App\Actions\Events;

use App\Models\EventSession;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class RescheduleEventSession
{
    /**
     * Reschedule an event session and optionally shift subsequent sessions on the same day.
     *
     * @param  array{
     *     start_time?: string,
     *     end_time?: string,
     *     status?: string,
     *     speaker_id?: int|null,
     *     room?: string|null,
     *     topic?: string|null,
     *     subtopic?: string|null,
     *     shift_minutes?: int|null,
     *     shift_subsequent_sessions?: bool|null,
     * }  $data
     * @return array{
     *     session: EventSession,
     *     shifted_sessions_count: int,
     *     shift_minutes: int,
     * }
     */
    public function handle(EventSession $session, array $data): array
    {
        return DB::transaction(function () use ($session, $data) {
            $oldStartTime = substr((string) $session->start_time, 0, 5);
            $oldEndTime = substr((string) $session->end_time, 0, 5);

            $newStartTime = ! empty($data['start_time']) ? substr((string) $data['start_time'], 0, 5) : $oldStartTime;
            $newEndTime = ! empty($data['end_time']) ? substr((string) $data['end_time'], 0, 5) : $oldEndTime;
            $newStatus = $data['status'] ?? $session->status ?? 'scheduled';

            // Calculate shift minutes if not explicitly provided
            $shiftMinutes = isset($data['shift_minutes']) && $data['shift_minutes'] !== null
                ? (int) $data['shift_minutes']
                : 0;

            if ($shiftMinutes === 0 && $newEndTime !== $oldEndTime) {
                try {
                    $oldEndCarbon = Carbon::createFromFormat('H:i', $oldEndTime);
                    $newEndCarbon = Carbon::createFromFormat('H:i', $newEndTime);
                    $shiftMinutes = $oldEndCarbon->diffInMinutes($newEndCarbon, false);
                } catch (\Throwable $e) {
                    $shiftMinutes = 0;
                }
            }

            // Update session data
            $updateData = [
                'start_time' => $newStartTime,
                'end_time' => $newEndTime,
                'status' => $newStatus,
            ];

            if (array_key_exists('day_number', $data) && ! empty($data['day_number'])) {
                $newDayNumber = (int) $data['day_number'];
                $updateData['day_number'] = $newDayNumber;
                if ($session->event && $session->event->start_date) {
                    $updateData['date'] = $session->event->start_date->copy()->addDays($newDayNumber - 1);
                }
            }

            if (array_key_exists('speaker_id', $data)) {
                $updateData['speaker_id'] = $data['speaker_id'] ? (int) $data['speaker_id'] : null;
            }

            if (array_key_exists('room', $data)) {
                $roomName = trim((string) $data['room']);
                $updateData['room'] = $roomName ?: null;
                if ($roomName && $session->event) {
                    $updateData['event_room_id'] = $session->event->rooms()->firstOrCreate(['name' => $roomName])->id;
                } elseif (! $roomName) {
                    $updateData['event_room_id'] = null;
                }
            }

            if (! empty($data['topic'])) {
                $updateData['topic'] = trim((string) $data['topic']);
            }

            if (array_key_exists('subtopic', $data)) {
                $updateData['subtopic'] = trim((string) $data['subtopic']) ?: null;
            }

            $session->update($updateData);

            $shiftedCount = 0;
            $shouldShift = ! empty($data['shift_subsequent_sessions']) && $shiftMinutes !== 0;

            if ($shouldShift) {
                // Find subsequent sessions on the same event and day
                $subsequentSessions = EventSession::query()
                    ->where('event_id', $session->event_id)
                    ->where('day_number', $session->day_number)
                    ->where('id', '!=', $session->id)
                    ->where('start_time', '>=', $oldEndTime)
                    ->orderBy('start_time')
                    ->orderBy('id')
                    ->get();

                foreach ($subsequentSessions as $sub) {
                    try {
                        $subStartTime = substr((string) $sub->start_time, 0, 5);
                        $subEndTime = substr((string) $sub->end_time, 0, 5);

                        $subStartCarbon = Carbon::createFromFormat('H:i', $subStartTime)->addMinutes($shiftMinutes);
                        $subEndCarbon = Carbon::createFromFormat('H:i', $subEndTime)->addMinutes($shiftMinutes);

                        $sub->update([
                            'start_time' => $subStartCarbon->format('H:i'),
                            'end_time' => $subEndCarbon->format('H:i'),
                            'status' => ($sub->status === 'scheduled' && $shiftMinutes > 0) ? 'delayed' : $sub->status,
                        ]);
                        $shiftedCount++;
                    } catch (\Throwable $e) {
                        // Skip if invalid time format
                        continue;
                    }
                }
            }

            return [
                'session' => $session->refresh(),
                'shifted_sessions_count' => $shiftedCount,
                'shift_minutes' => $shiftMinutes,
            ];
        });
    }
}
