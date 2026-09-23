<?php

namespace App\Services;

use App\Models\CbtExamPackage;
use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\EventParticipant;
use App\Models\EventSession;
use App\Models\Participant;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class EventAttendanceService
{
    /**
     * @return array{0: Participant, 1: EventParticipant}
     */
    public function resolveParticipant(User $user, Event $event): array
    {
        $participant = Participant::query()->where('user_id', $user->id)->first();

        // Admin, Diktar, and Penyelenggara can preview Ruang Belajar if not explicitly enrolled
        if ($user->isAdmin() || in_array($user->role, ['Admin', 'Diktar', 'Penyelenggara'], true)) {
            $enrollment = $participant ? EventParticipant::query()
                ->with('track')
                ->where('event_id', $event->id)
                ->where('participant_id', $participant->id)
                ->where('admin_status', 'verified')
                ->first() : null;

            if ($enrollment) {
                return [$participant, $enrollment];
            }

            $previewParticipant = $participant ?? new Participant([
                'id' => 0,
                'user_id' => $user->id,
                'name' => $user->name,
                'dan_rank' => 'IV-DAN',
                'dan_roman' => 'IV',
                'origin_province' => 'PB PERKEMI',
                'origin_city' => 'Pusat',
                'origin_dojo' => 'Pengurus Pusat',
            ]);

            $previewEnrollment = new EventParticipant([
                'id' => 0,
                'event_id' => $event->id,
                'participant_id' => $previewParticipant->id,
                'track_code' => 'ALL',
                'admin_status' => 'verified',
                'has_seen_welcome' => true,
                'checked_in_at' => now(),
                'checkin_status' => 'checked_in',
            ]);

            return [$previewParticipant, $previewEnrollment];
        }

        abort_unless($participant, 403, 'Akun Anda belum terhubung dengan data peserta. Hubungi penyelenggara.');

        $enrollment = EventParticipant::query()
            ->with('track')
            ->where('event_id', $event->id)
            ->where('participant_id', $participant->id)
            ->where('admin_status', 'verified')
            ->first();
        abort_unless($enrollment, 403, 'Anda belum terdaftar sebagai peserta terverifikasi pada event ini.');

        return [$participant, $enrollment];
    }

    public function hasArrivalAttendance(Event $event, EventParticipant $enrollment): bool
    {
        if ($enrollment->id === 0) {
            return true;
        }

        $arrivalSessionId = EventSession::query()
            ->where('event_id', $event->id)
            ->where('session_type_code', 'KEHADIRAN_AWAL')
            ->value('id');

        if (! $arrivalSessionId) {
            return (bool) $enrollment->checked_in_at;
        }

        return $this->hasAcceptedCheckIn($event->id, $enrollment->participant_id, $arrivalSessionId);
    }

    public function ensureArrivalAttendance(Event $event, EventParticipant $enrollment): void
    {
        $arrivalSession = EventSession::query()
            ->where('event_id', $event->id)
            ->where('session_type_code', 'KEHADIRAN_AWAL')
            ->first();

        // Jika sesi kedatangan awal tidak ada atau absensinya sudah ditutup / tidak aktif, absensi bisa dilewati
        if (! $arrivalSession || ! $arrivalSession->isAttendanceActive()) {
            return;
        }

        abort_unless(
            $this->hasArrivalAttendance($event, $enrollment),
            403,
            'Pindai QR kedatangan awal event sebelum absensi harian, sesi, materi, atau ujian.',
        );
    }

    public function ensureDayAttendance(Event $event, EventParticipant $enrollment, int $dayNumber): void
    {
        $dailySession = EventSession::query()
            ->where('event_id', $event->id)
            ->where('day_number', $dayNumber)
            ->where('session_type_code', 'KEHADIRAN_HARIAN')
            ->first();

        // Jika sesi harian tidak ada atau absensinya sudah ditutup / tidak aktif, absensi bisa dilewati
        if (! $dailySession || ! $dailySession->isAttendanceActive()) {
            return;
        }

        abort_unless(
            $this->hasDayAttendance($event, $enrollment, $dayNumber),
            403,
            "Absensi awal hari ke-{$dayNumber} wajib dicatat sebelum memasuki sesi.",
        );
    }

    public function hasDayAttendance(Event $event, EventParticipant $enrollment, int $dayNumber): bool
    {
        if ($enrollment->id === 0) {
            return true;
        }

        $dailySessionId = EventSession::query()
            ->where('event_id', $event->id)
            ->where('day_number', $dayNumber)
            ->where('session_type_code', 'KEHADIRAN_HARIAN')
            ->value('id');

        if (! $dailySessionId) {
            return true;
        }

        return $this->hasAcceptedCheckIn($event->id, $enrollment->participant_id, $dailySessionId);
    }

    public function ensureExamAttendance(Event $event, EventParticipant $enrollment, CbtExamPackage $package): void
    {
        $this->ensureArrivalAttendance($event, $enrollment);

        $examSessions = EventSession::query()
            ->where('event_id', $event->id)
            ->where('cbt_exam_package_id', $package->id)
            ->get(['id', 'day_number', 'attendance_setting', 'attendance_open_at', 'attendance_close_at', 'is_attendance_open']);

        $linkedRequirementId = $event->linkedCbtPackages()
            ->where('cbt_exam_packages.id', $package->id)
            ->value('event_cbt_packages.requires_attendance_session_id');

        $linkedRequirement = $linkedRequirementId
            ? EventSession::query()
                ->where('event_id', $event->id)
                ->whereKey($linkedRequirementId)
                ->first(['id', 'day_number', 'attendance_setting', 'attendance_open_at', 'attendance_close_at', 'is_attendance_open'])
            : null;

        $dayNumbers = $examSessions->pluck('day_number');
        if ($linkedRequirement) {
            $dayNumbers->push($linkedRequirement->day_number);
        }

        $todayDailySession = EventSession::query()
            ->where('event_id', $event->id)
            ->where('session_type_code', 'KEHADIRAN_HARIAN')
            ->whereDate('date', today())
            ->first(['id', 'day_number', 'attendance_open_at', 'attendance_close_at', 'is_attendance_open']);
        if ($todayDailySession) {
            $dayNumbers->push($todayDailySession->day_number);
        }

        $dailySessions = EventSession::query()
            ->where('event_id', $event->id)
            ->where('session_type_code', 'KEHADIRAN_HARIAN')
            ->whereIn('day_number', $dayNumbers->unique())
            ->get(['id', 'day_number', 'attendance_open_at', 'attendance_close_at', 'is_attendance_open']);

        // Hanya wajibkan absensi yang sedang aktif (sesi yang tertutup atau tanpa absensi bisa dilewati)
        $requiredSessionIds = $examSessions
            ->filter(fn (EventSession $s) => ! in_array($s->attendance_setting, ['none', 'disabled'], true) && $s->isAttendanceActive())
            ->pluck('id');

        if ($linkedRequirement && ! in_array($linkedRequirement->attendance_setting, ['none', 'disabled'], true) && $linkedRequirement->isAttendanceActive()) {
            $requiredSessionIds->push($linkedRequirement->id);
        }

        $activeDailySessions = $dailySessions->filter(fn (EventSession $s) => $s->isAttendanceActive());

        $attendanceSessionIds = $activeDailySessions->pluck('id')
            ->merge($requiredSessionIds)
            ->unique()
            ->values();

        if ($attendanceSessionIds->isEmpty()) {
            return;
        }

        $attendedSessionIds = EventAttendance::query()
            ->where('event_id', $event->id)
            ->where('participant_id', $enrollment->participant_id)
            ->where('attendance_type', 'check_in')
            ->whereIn('status', $this->acceptedStatuses())
            ->whereIn('event_session_id', $attendanceSessionIds)
            ->pluck('event_session_id');

        foreach ($activeDailySessions as $dailySession) {
            abort_unless(
                $attendedSessionIds->contains($dailySession->id),
                403,
                "Absensi awal hari ke-{$dailySession->day_number} wajib dicatat sebelum memasuki sesi.",
            );
        }

        abort_unless(
            $requiredSessionIds->unique()->diff($attendedSessionIds)->isEmpty(),
            403,
            'Absensi sesi wajib diselesaikan sebelum ujian dibuka.',
        );
    }

    public function record(
        Event $event,
        EventSession $session,
        Participant $participant,
        EventParticipant $enrollment,
        string $type,
        string $status,
        string $method,
        int $recordedBy,
    ): EventAttendance {
        return DB::transaction(function () use ($event, $session, $participant, $enrollment, $type, $status, $method, $recordedBy): EventAttendance {
            $lockedEnrollment = EventParticipant::query()->lockForUpdate()->findOrFail($enrollment->id);
            $attendance = EventAttendance::query()->firstOrCreate(
                [
                    'event_session_id' => $session->id,
                    'participant_id' => $participant->id,
                    'attendance_type' => $type,
                ],
                [
                    'event_id' => $event->id,
                    'status' => $status,
                    'checked_in_at' => now(),
                    'method' => $method,
                    'recorded_by' => $recordedBy,
                    'notes' => 'Pencatatan mandiri peserta via portal Pustaka Penataran',
                ],
            );

            if (! $attendance->wasRecentlyCreated) {
                return $attendance;
            }

            $records = $lockedEnrollment->attendance_records ?? [];
            $records["session_{$session->id}"] = [
                'status' => $status,
                'type' => $type,
                'time' => now()->toIso8601String(),
                'method' => $method,
            ];
            $updates = [
                'attendance_records' => $records,
                'attendance_status' => 'present',
            ];

            $hasArrivalSession = EventSession::query()
                ->where('event_id', $event->id)
                ->where('session_type_code', 'KEHADIRAN_AWAL')
                ->exists();
            if ($type === 'check_in' && ! $lockedEnrollment->checked_in_at
                && ($session->session_type_code === 'KEHADIRAN_AWAL' || ! $hasArrivalSession)) {
                $updates += [
                    'checked_in_at' => now(),
                    'checkin_method' => $method,
                    'checkin_status' => 'checked_in',
                ];
            }

            $lockedEnrollment->update($updates);

            return $attendance;
        });
    }

    private function hasAcceptedCheckIn(int $eventId, int $participantId, int $sessionId): bool
    {
        return EventAttendance::query()
            ->where('event_id', $eventId)
            ->where('event_session_id', $sessionId)
            ->where('participant_id', $participantId)
            ->where('attendance_type', 'check_in')
            ->whereIn('status', $this->acceptedStatuses())
            ->exists();
    }

    /**
     * @return list<string>
     */
    private function acceptedStatuses(): array
    {
        return ['present', 'late', 'manual_override'];
    }
}
