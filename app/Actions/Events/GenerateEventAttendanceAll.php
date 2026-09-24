<?php

namespace App\Actions\Events;

use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\EventParticipant;
use App\Models\EventSession;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class GenerateEventAttendanceAll
{
    /**
     * @param  array{
     *     status?: string,
     *     method?: string,
     *     include_arrival?: bool,
     *     include_daily?: bool,
     *     include_sessions?: bool,
     *     target_track?: ?string,
     *     recorded_by?: ?int,
     *     day_number?: int|string|null,
     * }  $options
     * @return array{
     *     attendance_count: int,
     *     participant_count: int,
     *     session_count: int,
     * }
     */
    public function execute(Event $event, array $options = []): array
    {
        $status = $options['status'] ?? 'present';
        $method = $options['method'] ?? 'manual_admin';
        $recordedBy = $options['recorded_by'] ?? Auth::id() ?? 1;
        $includeArrival = $options['include_arrival'] ?? true;
        $includeDaily = $options['include_daily'] ?? true;
        $includeSessions = $options['include_sessions'] ?? true;
        $targetTrack = $options['target_track'] ?? null;
        $dayNumber = isset($options['day_number']) && $options['day_number'] !== '' && $options['day_number'] !== 'all'
            ? (int) $options['day_number']
            : null;

        return DB::transaction(function () use (
            $event,
            $status,
            $method,
            $recordedBy,
            $includeArrival,
            $includeDaily,
            $includeSessions,
            $targetTrack,
            $dayNumber
        ): array {
            $participants = EventParticipant::query()
                ->where('event_id', $event->id)
                ->when($targetTrack && $targetTrack !== 'all', fn ($q) => $q->where('track_code', $targetTrack))
                ->with(['participant', 'track'])
                ->lockForUpdate()
                ->get();

            if ($participants->isEmpty()) {
                return [
                    'attendance_count' => 0,
                    'participant_count' => 0,
                    'session_count' => 0,
                ];
            }

            $sessions = EventSession::query()
                ->where('event_id', $event->id)
                ->where('status', '!=', 'cancelled')
                ->orderBy('day_number')
                ->orderBy('start_time')
                ->get();

            // Filter sessions based on scope
            $targetSessions = $sessions->filter(function (EventSession $session) use ($includeArrival, $includeDaily, $includeSessions, $dayNumber) {
                if ($dayNumber !== null && (int) $session->day_number !== $dayNumber) {
                    return false;
                }

                if ($session->session_type_code === 'KEHADIRAN_AWAL') {
                    return $includeArrival;
                }
                if ($session->session_type_code === 'KEHADIRAN_HARIAN') {
                    return $includeDaily;
                }
                if ($session->attendance_setting === 'disabled') {
                    return false;
                }

                return $includeSessions;
            });

            $recordsToUpsert = [];
            $now = now();
            $attendedSessionIds = [];

            // Find arrival session for participant check-in timestamp
            $arrivalSession = $sessions->firstWhere('session_type_code', 'KEHADIRAN_AWAL');
            $arrivalTimestamp = $arrivalSession && $arrivalSession->date && $arrivalSession->start_time
                ? Carbon::parse($arrivalSession->date->format('Y-m-d').' '.$arrivalSession->start_time)
                : $now;

            foreach ($participants as $ep) {
                $pTrack = $ep->track_code;
                $pId = $ep->participant_id;
                $pRecords = $ep->attendance_records ?? [];

                foreach ($targetSessions as $session) {
                    $trackCodes = $session->track_codes ?? [];
                    $isMatch = empty($trackCodes)
                        || in_array('ALL', $trackCodes, true)
                        || in_array('SEMUA', $trackCodes, true)
                        || in_array($pTrack, $trackCodes, true);

                    if (! $isMatch) {
                        continue;
                    }

                    $sessionTime = $session->date && $session->start_time
                        ? Carbon::parse($session->date->format('Y-m-d').' '.$session->start_time)
                        : $now;

                    $recordsToUpsert[] = [
                        'event_id' => $event->id,
                        'event_session_id' => $session->id,
                        'participant_id' => $pId,
                        'attendance_type' => 'check_in',
                        'status' => $status,
                        'checked_in_at' => $sessionTime,
                        'checked_out_at' => null,
                        'method' => $method,
                        'recorded_by' => $recordedBy,
                        'notes' => 'Presensi lengkap digenerate otomatis oleh admin.',
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];

                    $attendedSessionIds[$session->id] = true;

                    $pRecords["session_{$session->id}"] = [
                        'status' => $status,
                        'type' => 'check_in',
                        'time' => $sessionTime->toIso8601String(),
                        'by' => Auth::user()?->name ?? 'Admin',
                        'reason' => 'Generate absensi otomatis',
                    ];
                }

                $ep->update([
                    'checked_in_at' => $ep->checked_in_at ?? $arrivalTimestamp,
                    'checkin_status' => 'checked_in',
                    'checkin_method' => $ep->checkin_method ?? $method,
                    'attendance_status' => 'present',
                    'attendance_records' => $pRecords,
                ]);
            }

            // Chunk upsert into batches of 500 for high database performance
            foreach (array_chunk($recordsToUpsert, 500) as $chunk) {
                EventAttendance::upsert(
                    $chunk,
                    ['event_session_id', 'participant_id', 'attendance_type'],
                    ['status', 'checked_in_at', 'method', 'recorded_by', 'notes', 'updated_at']
                );
            }

            return [
                'attendance_count' => count($recordsToUpsert),
                'participant_count' => $participants->count(),
                'session_count' => count($attendedSessionIds),
            ];
        });
    }
}
