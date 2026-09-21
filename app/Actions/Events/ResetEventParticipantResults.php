<?php

namespace App\Actions\Events;

use App\Models\ActivityLog;
use App\Models\CbtExamAttempt;
use App\Models\CbtProctoringEvent;
use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\EventParticipant;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ResetEventParticipantResults
{
    /**
     * @return array{attendance_count: int, attempt_count: int, proctoring_count: int, participant_count: int}
     */
    public function resetParticipant(Event $event, EventAttendance $attendance): array
    {
        abort_unless($attendance->event_id === $event->id, 404);

        return DB::transaction(function () use ($event, $attendance): array {
            $enrollment = EventParticipant::query()
                ->where('event_id', $event->id)
                ->where('participant_id', $attendance->participant_id)
                ->lockForUpdate()
                ->firstOrFail();

            return $this->deleteResults($event, new Collection([$enrollment]), $enrollment->participant_id);
        });
    }

    /**
     * @return array{attendance_count: int, attempt_count: int, proctoring_count: int, participant_count: int}
     */
    public function resetEnrollment(Event $event, EventParticipant $eventParticipant): array
    {
        abort_unless($eventParticipant->event_id === $event->id, 404);

        return DB::transaction(function () use ($event, $eventParticipant): array {
            $enrollment = EventParticipant::query()
                ->where('event_id', $event->id)
                ->lockForUpdate()
                ->findOrFail($eventParticipant->id);

            return $this->deleteResults($event, new Collection([$enrollment]), $enrollment->participant_id);
        });
    }

    /**
     * @return array{attendance_count: int, attempt_count: int, proctoring_count: int, participant_count: int}
     */
    public function resetAll(Event $event): array
    {
        return DB::transaction(function () use ($event): array {
            $enrollments = EventParticipant::query()
                ->where('event_id', $event->id)
                ->lockForUpdate()
                ->get();

            return $this->deleteResults($event, $enrollments);
        });
    }

    /**
     * @param  Collection<int, EventParticipant>  $enrollments
     * @return array{attendance_count: int, attempt_count: int, proctoring_count: int, participant_count: int}
     */
    private function deleteResults(Event $event, Collection $enrollments, ?int $participantId = null): array
    {
        $attempts = CbtExamAttempt::query()
            ->where('event_id', $event->id)
            ->when($participantId, fn ($query) => $query->where('participant_id', $participantId));
        $attendances = EventAttendance::query()
            ->where('event_id', $event->id)
            ->when($participantId, fn ($query) => $query->where('participant_id', $participantId));
        $proctoringEvents = CbtProctoringEvent::query()
            ->where('event_id', $event->id)
            ->when($participantId, fn ($query) => $query->where('participant_id', $participantId));

        $filePaths = $enrollments->pluck('certificate_file_path')
            ->merge($enrollments->pluck('transcript_file_path'))
            ->merge($enrollments->pluck('secondary_certificate_file_path'))
            ->merge($enrollments->pluck('secondary_transcript_file_path'))
            ->merge((clone $attempts)->whereNotNull('revision_file_path')->pluck('revision_file_path'))
            ->filter()
            ->unique()
            ->values()
            ->all();
        $counts = [
            'attendance_count' => (clone $attendances)->count(),
            'attempt_count' => (clone $attempts)->count(),
            'proctoring_count' => (clone $proctoringEvents)->count(),
            'participant_count' => $enrollments->count(),
        ];

        $attendances->delete();
        $attempts->delete();
        EventParticipant::query()
            ->whereIn('id', $enrollments->modelKeys())
            ->update([
                'attendance_status' => 'registered',
                'attendance_records' => null,
                'checked_in_at' => null,
                'checkin_method' => null,
                'checkin_status' => 'registered',
                'checkin_notes' => null,
                'score_theory' => null,
                'score_practice' => null,
                'evaluation_notes' => null,
                'graduation_status' => 'in_training',
                'certificate_number' => null,
                'certificate_file_path' => null,
                'certificate_issued_at' => null,
                'transcript_number' => null,
                'transcript_file_path' => null,
                'transcript_issued_at' => null,
                'secondary_certificate_number' => null,
                'secondary_certificate_file_path' => null,
                'secondary_certificate_issued_at' => null,
                'secondary_transcript_number' => null,
                'secondary_transcript_file_path' => null,
                'secondary_transcript_issued_at' => null,
            ]);

        ActivityLog::record(
            $participantId ? 'event.participant_results.reset' : 'event.participant_results.reset_all',
            $event,
            [...$counts, 'participant_id' => $participantId],
        );

        if ($filePaths !== []) {
            DB::afterCommit(static fn () => Storage::disk('local')->delete($filePaths));
        }

        return $counts;
    }
}
