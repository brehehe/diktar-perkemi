<?php

namespace App\Services;

use App\Http\Controllers\EventIntegrityPactController;
use App\Models\CbtExamAttempt;
use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\EventIntegrityPact;
use App\Models\EventModule;
use App\Models\EventRegistrationForm;
use App\Models\EventSession;
use App\Models\LearningModule;
use App\Models\User;

class EventLearningRoomService
{
    public function __construct(
        private readonly EventAttendanceService $attendanceService,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function data(User $user, string $slug): array
    {
        $event = Event::with([
            'modules.speaker',
            'modules.material',
            'learningModules.materials',
            'linkedCbtPackages',
            'sessions.speaker',
            'sessions.sessionType',
            'sessions.material',
            'sessions.learningModule.materials',
            'sessions.module.material',
            'sessions.cbtPackage',
            'cbtPackages',
        ])
            ->where('slug', $slug)
            ->firstOrFail();

        [$participant, $eventParticipant] = $this->attendanceService->resolveParticipant($user, $event);
        $trackCode = $eventParticipant->track_code;

        $totalDays = $event->total_days;
        $scheduleDays = collect(range(0, $totalDays - 1))->map(fn (int $offset) => [
            'day_number' => $offset + 1,
            'date' => $event->start_date?->copy()->addDays($offset)->format('Y-m-d'),
            'date_label' => $event->start_date?->copy()->addDays($offset)->locale('id')->translatedFormat('D, d M'),
        ]);

        $isAdminOrOrganizer = $user->isAdmin() || in_array($user->role, ['Admin', 'Diktar', 'Penyelenggara'], true);

        // The event date range is authoritative. Stale sessions outside that range are not exposed.
        // Guarantee strict chronological order (from earliest/oldest to latest/newest).
        $allEventSessions = $event->sessions
            ->filter(fn (EventSession $session) => $session->day_number >= 1 && $session->day_number <= $totalDays)
            ->sortBy([
                ['day_number', 'asc'],
                ['start_time', 'asc'],
                ['id', 'asc'],
            ])
            ->values();

        // For participants, filter sessions matching their track or plenary sessions
        $sessions = $isAdminOrOrganizer
            ? $allEventSessions
            : $allEventSessions->filter(function (EventSession $session) use ($trackCode) {
                if (empty($session->track_codes) || ! is_array($session->track_codes)) {
                    return true;
                }

                return in_array($trackCode, $session->track_codes, true);
            })->values();

        // Participant's attendance records for this event
        $attendanceRecords = [];
        if ($participant) {
            $attendanceRecords = EventAttendance::where('event_id', $event->id)
                ->where('participant_id', $participant->id)
                ->with('session')
                ->latest('checked_in_at')
                ->get()
                ->map(fn ($att) => [
                    'id' => $att->id,
                    'session_id' => $att->event_session_id,
                    'session_name' => $att->session?->topic ?? 'Sesi',
                    'session_number' => $att->session?->session_number,
                    'type' => $att->attendance_type,
                    'status' => $att->status,
                    'status_label' => $att->status_label,
                    'status_badge' => $att->status_badge,
                    'time' => $att->checked_in_at?->format('H:i, d M Y') ?? '-',
                    'method' => $att->method,
                ]);
        }

        $attendedSessionIds = collect($attendanceRecords)
            ->filter(fn ($record) => $record['type'] === 'check_in' && in_array($record['status'], ['present', 'late', 'manual_override'], true))
            ->pluck('session_id')->unique()->all();

        $checkedOutSessionIds = collect($attendanceRecords)
            ->filter(fn ($record) => $record['type'] === 'check_out' && in_array($record['status'], ['present', 'late', 'manual_override'], true))
            ->pluck('session_id')->unique()->all();

        $attendanceBySession = collect($attendanceRecords)->groupBy('session_id');

        $resolveSessionAttendanceMeta = function (EventSession $s) use ($attendedSessionIds, $checkedOutSessionIds, $attendanceBySession, $isAdminOrOrganizer, $event): array {
            $sessionRecords = $attendanceBySession->get($s->id, collect());
            $checkInRec = $sessionRecords->firstWhere('type', 'check_in');
            $checkOutRec = $sessionRecords->firstWhere('type', 'check_out');

            $hasCheckedIn = in_array($s->id, $attendedSessionIds, true);
            $hasCheckedOut = in_array($s->id, $checkedOutSessionIds, true);

            $sessionDate = $s->date ?? ($event->start_date ? $event->start_date->copy()->addDays($s->day_number - 1) : null);
            $isToday = $sessionDate ? $sessionDate->isToday() : true;
            $isFuture = $sessionDate ? ($sessionDate->isFuture() && ! $sessionDate->isToday()) : false;
            $isPast = $sessionDate ? ($sessionDate->isPast() && ! $sessionDate->isToday()) : false;

            $setting = $s->attendance_setting ?? 'check_in';
            $requiresAttendance = in_array($setting, ['check_in', 'check_in_out'], true);

            $nextAttendanceType = null;
            if ($requiresAttendance) {
                if (! $hasCheckedIn) {
                    $nextAttendanceType = 'check_in';
                } elseif ($setting === 'check_in_out' && ! $hasCheckedOut) {
                    $nextAttendanceType = 'check_out';
                }
            }

            $canShortcutAttend = $requiresAttendance
                && $nextAttendanceType !== null
                && $s->isAttendanceActive()
                && ($isToday || $isAdminOrOrganizer || ! $sessionDate);

            $buttonLabel = null;
            if ($nextAttendanceType === 'check_in') {
                $buttonLabel = $setting === 'check_in_out' ? 'Absen Masuk Sekarang' : 'Absen Sekarang';
            } elseif ($nextAttendanceType === 'check_out') {
                $buttonLabel = 'Absen Keluar Sekarang';
            }

            return [
                'attendance_setting' => $setting,
                'has_checked_in' => $hasCheckedIn,
                'has_checked_out' => $hasCheckedOut,
                'check_in_time' => $checkInRec['time'] ?? null,
                'check_out_time' => $checkOutRec['time'] ?? null,
                'session_date' => $sessionDate?->format('Y-m-d'),
                'session_date_label' => $sessionDate?->locale('id')->translatedFormat('D, d M'),
                'is_today' => $isToday,
                'is_future' => $isFuture,
                'is_past' => $isPast,
                'can_shortcut_attend' => $canShortcutAttend,
                'next_attendance_type' => $nextAttendanceType,
                'attendance_button_label' => $buttonLabel,
            ];
        };

        // Determine active or next upcoming session
        $unattendedActiveSession = $sessions->first(fn (EventSession $session) => $session->isAttendanceActive() && ! in_array($session->id, $attendedSessionIds, true));
        $activeSession = $unattendedActiveSession
            ?? $sessions->first(fn (EventSession $session) => $session->isAttendanceActive())
            ?? $sessions->firstWhere('status', 'ongoing')
            ?? $sessions->first();
        $dailySessions = $sessions->where('session_type_code', 'KEHADIRAN_HARIAN')->keyBy('day_number');
        $todayDailySession = $dailySessions->first(fn (EventSession $session) => $session->date?->isToday() && $session->isAttendanceActive());
        $hasArrivalAttendance = $isAdminOrOrganizer || $this->attendanceService->hasArrivalAttendance($event, $eventParticipant)
            || ! $sessions->where('session_type_code', 'KEHADIRAN_AWAL')->contains(fn ($s) => $s->isAttendanceActive());
        $canAccessLearning = true;
        $canAccessSessionContent = function (EventSession $session) use ($attendedSessionIds, $eventParticipant, $isAdminOrOrganizer): bool {
            if ($isAdminOrOrganizer) {
                return true;
            }

            if ($session->track_codes && ! in_array($eventParticipant->track_code, $session->track_codes, true)) {
                return false;
            }

            // Sesi tanpa absensi (none/disabled) dapat diakses langsung
            if (in_array($session->attendance_setting, ['none', 'disabled'], true)) {
                return true;
            }

            // Sesi yang mewajibkan absensi harus sudah dihadiri peserta
            return in_array($session->id, $attendedSessionIds, true);
        };
        $eventReaderUrl = fn (?string $materialSlug): ?string => $materialSlug
            ? route('reader.show', ['slug' => $materialSlug, 'event' => $event->slug])
            : null;

        $visibleEventModules = $event->modules->filter(fn (EventModule $module) => $module->publication_status === 'published'
            && ($isAdminOrOrganizer || ! $module->track_codes || in_array($trackCode, $module->track_codes, true)))->values();
        $canAccessModuleResource = function (EventModule $module) use ($sessions, $attendedSessionIds, $isAdminOrOrganizer): bool {
            if ($isAdminOrOrganizer) {
                return true;
            }

            $requiredSessions = $sessions->where('event_module_id', $module->id)
                ->filter(fn (EventSession $session) => ! in_array($session->attendance_setting, ['none', 'disabled'], true));

            return $requiredSessions->isEmpty() || $requiredSessions->contains(fn (EventSession $session) => in_array($session->id, $attendedSessionIds, true));
        };

        // 1. My Learning Modules (filtered by participant track)
        $availableLearningModules = $event->learningModules
            ->concat($sessions->pluck('learningModule')->filter())
            ->unique('id')
            ->values();
        $myLearningModules = $availableLearningModules
            ->filter(function ($lm) use ($trackCode, $isAdminOrOrganizer) {
                if ($isAdminOrOrganizer) {
                    return true;
                }

                if (! empty($lm->pivot?->participant_path_id) && $lm->pivot->participant_path_id !== 'all') {
                    return $lm->pivot->participant_path_id === $trackCode;
                }
                if (! empty($lm->track_codes) && is_array($lm->track_codes)) {
                    return in_array($trackCode, $lm->track_codes, true);
                }

                return true;
            })
            ->filter(function (LearningModule $module) use ($sessions, $attendedSessionIds, $isAdminOrOrganizer): bool {
                if ($isAdminOrOrganizer) {
                    return true;
                }

                $requiredSessions = $sessions->where('learning_module_id', $module->id)
                    ->filter(fn (EventSession $session) => ! in_array($session->attendance_setting, ['none', 'disabled'], true));

                return $requiredSessions->isEmpty()
                    || $requiredSessions->contains(fn (EventSession $session) => in_array($session->id, $attendedSessionIds, true));
            })
            ->values()
            ->map(fn (LearningModule $lm) => [
                'id' => $lm->id,
                'code' => $lm->code,
                'title' => $lm->title,
                'category' => $lm->category,
                'total_jp' => $lm->total_jp,
                'level' => $lm->level,
                'is_required' => (bool) ($lm->pivot?->is_required ?? true),
                'status' => $lm->status,
                'learning_objectives' => $lm->learning_objectives ?? [],
                'competency_outcomes' => $lm->competency_outcomes ?? [],
                'materials_count' => $lm->materials->count(),
                'materials' => $lm->materials->map(function ($mat) use ($eventReaderUrl, $sessions, $attendedSessionIds, $isAdminOrOrganizer) {
                    $matSessions = $sessions->where('material_id', $mat->id)
                        ->filter(fn (EventSession $session) => ! in_array($session->attendance_setting, ['none', 'disabled'], true));
                    $isMatLocked = ! $isAdminOrOrganizer && $matSessions->isNotEmpty()
                        && ! $matSessions->contains(fn (EventSession $session) => in_array($session->id, $attendedSessionIds, true));

                    return [
                        'id' => $mat->id,
                        'title' => $mat->title,
                        'slug' => $mat->slug,
                        'type' => $mat->type,
                        'cover_path' => $mat->cover_path,
                        'author' => $mat->author,
                        'sort_order' => $mat->pivot->sort_order,
                        'is_required' => (bool) $mat->pivot->is_required,
                        'is_locked' => $isMatLocked,
                        'instructor_notes' => $mat->pivot->instructor_notes,
                        'estimated_duration_minutes' => $mat->pivot->estimated_duration_minutes,
                        'cta_text' => match ($mat->type) {
                            'video' => 'Tonton Video',
                            'book', 'document' => 'Baca E-Book',
                            default => 'Buka Buku Digital',
                        },
                        'reader_url' => $isMatLocked ? null : $eventReaderUrl($mat->slug),
                    ];
                }),
            ]);

        // 2. My CBT Exams (filtered by participant track with accessibility rules)
        $participantSessionPackageIds = $sessions
            ->pluck('cbt_exam_package_id')
            ->filter()
            ->unique()
            ->all();

        $allPackages = $event->cbtPackages
            ->concat($event->linkedCbtPackages)
            ->concat($allEventSessions->pluck('cbtPackage')->filter())
            ->unique('id')
            ->values();
        $attemptsByPackage = CbtExamAttempt::query()
            ->where('event_id', $event->id)
            ->where('participant_id', $participant->id)
            ->whereIn('cbt_exam_package_id', $allPackages->pluck('id'))
            ->get()
            ->groupBy('cbt_exam_package_id');

        $activeAttempt = $attemptsByPackage->flatten()->first(function (CbtExamAttempt $attempt) use ($allPackages) {
            if ($attempt->status !== 'in_progress') {
                return false;
            }

            $pkg = $allPackages->firstWhere('id', $attempt->cbt_exam_package_id);

            return $pkg && ! $attempt->hasExpired($pkg);
        });
        $activeExamRedirectUrl = null;

        $packageMatchesTrack = function ($pkg) use ($trackCode, $isAdminOrOrganizer): bool {
            if ($isAdminOrOrganizer || empty($trackCode) || strtolower(trim((string) $trackCode)) === 'all') {
                return true;
            }

            $currentTrack = strtolower(trim((string) $trackCode));

            // 1. If package has pivot restriction in this event (event_cbt_packages)
            if ($pkg->pivot && ! empty($pkg->pivot->participant_path_id)) {
                $pivotPath = strtolower(trim((string) $pkg->pivot->participant_path_id));
                if ($pivotPath !== 'all' && $pivotPath !== $currentTrack) {
                    return false;
                }
            }

            // 2. If package has target_tracks restriction
            if (! empty($pkg->target_tracks) && is_array($pkg->target_tracks)) {
                $targetTracks = array_map(fn ($t) => strtolower(trim((string) $t)), $pkg->target_tracks);
                if (! in_array('all', $targetTracks, true) && ! in_array($currentTrack, $targetTracks, true)) {
                    return false;
                }
            }

            return true;
        };

        $myCbtExams = $allPackages
            ->filter(function ($pkg) use ($attemptsByPackage, $packageMatchesTrack) {
                // If participant already took this exam in this event, always show it so they can see results and locked status
                if ($attemptsByPackage->has($pkg->id)) {
                    return true;
                }

                return $packageMatchesTrack($pkg);
            })
            ->values()
            ->map(function ($pkg) use ($attemptsByPackage, $attendedSessionIds, $event, $isAdminOrOrganizer) {
                $userAttempts = $attemptsByPackage->get($pkg->id, collect());

                $attemptsCount = $userAttempts->whereIn('status', CbtExamAttempt::TERMINAL_STATUSES)->count();
                $lastAttempt = $userAttempts->sortByDesc('id')->first();
                $attemptsAllowed = $pkg->attempts_allowed ?? 1;

                // Check attendance prerequisite
                $attendanceReqSessionId = $pkg->pivot?->requires_attendance_session_id;
                $missingExamSession = $event->sessions->first(fn (EventSession $session) => $session->cbt_exam_package_id === $pkg->id
                    && ((bool) $session->requires_attendance_before_cbt || $session->session_type_code === 'UJIAN')
                    && ! in_array($session->attendance_setting, ['none', 'disabled'], true)
                    && ! in_array($session->id, $attendedSessionIds, true));
                $sessionPrereqMet = ! $missingExamSession;
                $sessionPrereqName = $missingExamSession?->topic;

                if ($attendanceReqSessionId) {
                    $reqSession = $event->sessions->firstWhere('id', $attendanceReqSessionId);
                    if ($reqSession && ! in_array($reqSession->attendance_setting, ['none', 'disabled'], true) && ! in_array($attendanceReqSessionId, $attendedSessionIds, true)) {
                        $sessionPrereqMet = false;
                        $sessionPrereqName = $reqSession->topic ?? "Sesi #{$attendanceReqSessionId}";
                    }
                }

                // Determine accessibility
                $isAllowed = true;
                $deniedReason = null;

                if ($pkg->status === 'closed') {
                    $isAllowed = false;
                    $deniedReason = 'Ujian telah ditutup.';
                } elseif ($pkg->status === 'draft') {
                    $isAllowed = false;
                    $deniedReason = 'Ujian belum dibuka.';
                } elseif (! $sessionPrereqMet) {
                    $isAllowed = false;
                    $deniedReason = "Anda belum melakukan absensi pada {$sessionPrereqName}. Silakan scan absensi sesi terlebih dahulu.";
                } elseif ($attemptsCount >= $attemptsAllowed) {
                    $isAllowed = false;
                    $deniedReason = ($lastAttempt?->is_passed)
                        ? 'Anda telah menyelesaikan ujian ini dan dinyatakan lulus.'
                        : 'Anda telah menyelesaikan ujian ini (jumlah percobaan telah habis).';
                } elseif ($pkg->revision_method === 'paper' && in_array($lastAttempt?->status, CbtExamAttempt::TERMINAL_STATUSES, true) && ! $lastAttempt->is_passed) {
                    $isAllowed = false;
                    $deniedReason = 'Revisi ujian ini menggunakan unggah makalah PDF.';
                }

                if ($isAdminOrOrganizer) {
                    if ($attemptsCount >= $attemptsAllowed) {
                        $isAllowed = false;
                        $deniedReason = ($lastAttempt?->is_passed)
                            ? 'Anda telah menyelesaikan ujian ini dan dinyatakan lulus.'
                            : 'Anda telah menyelesaikan ujian ini (jumlah percobaan telah habis).';
                    } else {
                        $isAllowed = true;
                        $deniedReason = null;
                    }
                }

                // Exam state for UI
                $examState = 'tersedia';
                if ($lastAttempt && in_array($lastAttempt->status, CbtExamAttempt::TERMINAL_STATUSES, true)) {
                    $examState = 'selesai';
                } elseif ($pkg->status === 'draft') {
                    $examState = 'akan_datang';
                } elseif ($pkg->status === 'closed') {
                    $examState = 'ditutup';
                } elseif (! $isAllowed) {
                    $examState = 'terkunci';
                }

                // Build per-attempt history (all terminal/completed attempts)
                $attemptHistory = $userAttempts
                    ->whereIn('status', CbtExamAttempt::TERMINAL_STATUSES)
                    ->sortByDesc('id')
                    ->values()
                    ->map(function (CbtExamAttempt $a, int $idx) use ($userAttempts, $pkg) {
                        $completedAt = $a->submitted_at ?? $a->updated_at;

                        return [
                            'attempt_id' => $a->id,
                            'attempt_number' => $userAttempts->whereIn('status', CbtExamAttempt::TERMINAL_STATUSES)->count() - $idx,
                            'score' => $pkg->result_display === 'hidden' ? null : (float) $a->total_score,
                            'is_passed' => $pkg->result_display === 'hidden' ? null : (bool) $a->is_passed,
                            'status' => $a->status,
                            'started_at' => $a->started_at?->format('d M Y, H:i'),
                            'finished_at' => $completedAt?->format('d M Y, H:i'),
                            'duration_seconds' => $completedAt && $a->started_at
                                ? $a->started_at->diffInSeconds($completedAt)
                                : null,
                            'revision_status' => $a->revision_status,
                            'revision_file_path' => $a->revision_file_path,
                        ];
                    })
                    ->values();

                return [
                    'id' => $pkg->id,
                    'title' => $pkg->title,
                    'code' => $pkg->code,
                    'description' => $pkg->description,
                    'exam_type' => $pkg->exam_type,
                    'exam_type_label' => $pkg->exam_type_label,
                    'duration_minutes' => $pkg->duration_minutes,
                    'passing_score' => (float) $pkg->passing_score,
                    'attempts_allowed' => $attemptsAllowed,
                    'attempts_count' => $attemptsCount,
                    'status' => $pkg->status,
                    'exam_state' => $examState,
                    'is_accessible' => $isAllowed,
                    'access_denied_reason' => $deniedReason,
                    'has_attempt' => ! empty($lastAttempt),
                    'last_score' => $pkg->result_display === 'hidden' ? null : $lastAttempt?->total_score,
                    'is_passed' => $pkg->result_display === 'hidden' ? null : $lastAttempt?->is_passed,
                    'attempt_status' => $lastAttempt?->status,
                    'attempt_history' => $attemptHistory,
                    'is_session_exam' => (bool) ($attendanceReqSessionId || in_array($pkg->exam_type, ['module_eval', 'kuis', 'sesi'], true) || $event->sessions->contains('cbt_exam_package_id', $pkg->id)),
                    'revision_method' => $pkg->revision_method,
                    'revision_deadline' => $pkg->revision_deadline?->format('d M Y, H:i'),
                    'revision_open' => ! $pkg->revision_deadline || now()->lte($pkg->revision_deadline),
                    'revision_attempt_id' => $lastAttempt && in_array($lastAttempt->status, CbtExamAttempt::TERMINAL_STATUSES, true) && ! $lastAttempt->is_passed ? $lastAttempt->id : null,
                    'revision_status' => $lastAttempt?->revision_status,
                    'revision_reader_url' => $lastAttempt?->revision_file_path
                        ? route('event.revision.mine.reader', [$event->slug, $lastAttempt->id]) : null,
                    'revision_upload_url' => $lastAttempt && in_array($lastAttempt->status, CbtExamAttempt::TERMINAL_STATUSES, true) && ! $lastAttempt->is_passed
                        ? route('event.revision.submit', [$event->slug, $lastAttempt->id]) : null,
                    'last_attempt_at' => ($lastAttempt?->submitted_at ?? $lastAttempt?->updated_at)?->format('d M Y, H:i'),
                    'instructions' => $pkg->instructions,
                    'exam_url' => route('event.cbt.exam', ['slug' => $event->slug, 'packageCode' => $pkg->code]),
                ];
            });

        $myCbtExamsById = $myCbtExams->keyBy('id');
        $activeSessionExam = $activeSession?->cbt_exam_package_id ? $myCbtExamsById->get($activeSession->cbt_exam_package_id) : null;

        // Calculate exam grade summary for participant
        $completedExams = $myCbtExams->filter(fn ($pkg) => ! empty($pkg['has_attempt']) && $pkg['exam_state'] === 'selesai');
        $validScores = $completedExams->pluck('last_score')->filter(fn ($s) => $s !== null);
        $avgScore = $validScores->isNotEmpty() ? round($validScores->avg(), 1) : null;
        $passedCount = $completedExams->where('is_passed', true)->count();

        $gradeSummary = [
            'total_exams' => $myCbtExams->count(),
            'completed_count' => $completedExams->count(),
            'passed_count' => $passedCount,
            'failed_count' => $completedExams->count() - $passedCount,
            'average_score' => $avgScore,
        ];

        // Calculate attendance stats
        $totalSessions = $sessions->count();
        $attendedSessions = count(array_intersect($attendedSessionIds, $sessions->pluck('id')->all()));
        $attendancePercentage = $totalSessions > 0 ? round(($attendedSessions / $totalSessions) * 100) : 0;

        return [
            'activeExamRedirectUrl' => $activeExamRedirectUrl,
            'event' => [
                'id' => $event->id,
                'name' => $event->name,
                'slug' => $event->slug,
                'date_formatted' => $event->date_formatted,
                'place' => $event->place,
                'organizer' => $event->organizer,
                'duration_days' => $totalDays.' hari',
                'total_days' => $totalDays,
                'total_effective_jp' => $event->total_effective_jp,
                'total_sessions' => $totalSessions,
                'total_modules' => $visibleEventModules->count(),
            ],
            'participant' => [
                'id' => $participant->id,
                'event_participant_id' => $eventParticipant->id,
                'name' => $participant->name,
                'dan_rank' => $participant->dan_rank,
                'track_code' => $eventParticipant->track_code,
                'track_name' => $eventParticipant->track?->name,
                'rotation_group' => $eventParticipant->rotation_group,
                'is_checked_in' => $hasArrivalAttendance,
                'can_access_learning' => $canAccessLearning,
                'checked_in_at' => $eventParticipant->checked_in_at?->format('d M Y, H:i'),
                'attendance_percentage' => $attendancePercentage,
                'attended_sessions_count' => $attendedSessions,
                'has_registration_form' => EventRegistrationForm::where('event_id', $event->id)->where('participant_id', $participant->id)->exists(),
                'registration_form_status' => EventRegistrationForm::where('event_id', $event->id)->where('participant_id', $participant->id)->value('status') ?? 'unfilled',
                'registration_form_url' => route('event.registration-form', $event->slug),
                'registration_form_print_url' => route('event.registration-form.print', $event->slug),
                'has_integrity_pact' => EventIntegrityPact::where('event_id', $event->id)->where('participant_id', $participant->id)->where('status', 'signed')->exists(),
                'integrity_pact_status' => EventIntegrityPact::where('event_id', $event->id)->where('participant_id', $participant->id)->value('status') ?? 'unfilled',
                'integrity_pact_url' => route('event.integrity-pact', $event->slug),
                'integrity_pact_print_url' => route('event.integrity-pact.print', $event->slug),
            ],
            'activeSession' => $activeSession ? array_merge([
                'id' => $activeSession->id,
                'session_number' => $activeSession->session_number,
                'day_number' => $activeSession->day_number,
                'time_slot' => $activeSession->time_slot,
                'topic' => $activeSession->topic,
                'subtopic' => $activeSession->subtopic,
                'method' => $activeSession->method,
                'room' => $activeSession->room,
                'session_type_code' => $activeSession->session_type_code,
                'session_type_name' => $activeSession->sessionType?->name ?? 'Sesi',
                'speaker_name' => $activeSession->speaker?->name,
                'is_attendance_open' => $activeSession->isAttendanceActive(),
                'has_material' => (bool) ($activeSession->material_id || $activeSession->learning_module_id || ($activeSession->module && ($activeSession->module->material_id || $activeSession->module->source_file_path || $activeSession->module->source_url))),
                'has_exam' => (bool) ($activeSession->cbt_exam_package_id || $activeSession->session_type_code === 'UJIAN' || $activeSessionExam),
                'module_id' => $activeSession->event_module_id,
                'module_code' => $activeSession->module?->code,
                'module_title' => $activeSession->module?->title,
                'material_slug' => $canAccessSessionContent($activeSession) ? ($activeSession->material?->slug ?? $activeSession->learningModule?->materials->first()?->slug ?? $activeSession->module?->material?->slug) : null,
                'material_reader_url' => $canAccessSessionContent($activeSession) ? $eventReaderUrl($activeSession->material?->slug ?? $activeSession->learningModule?->materials->first()?->slug ?? $activeSession->module?->material?->slug) : null,
                'event_material_url' => $canAccessSessionContent($activeSession) && $activeSession->module?->publication_status === 'published'
                    ? match ($activeSession->module->source_type) {
                        'uploaded_pdf' => route('event.module.file', [$event->slug, $activeSession->module->id]),
                        'external_link', 'video' => $activeSession->module->source_url,
                        default => null,
                    } : null,
                'material_title' => $canAccessSessionContent($activeSession) ? ($activeSession->material?->title ?? $activeSession->learningModule?->title ?? $activeSession->module?->material?->title ?? $activeSession->module?->title) : null,
                'material_type' => $activeSession->material?->type ?? 'book',
                'learning_module_id' => $activeSession->learning_module_id,
                'learning_module_title' => $activeSession->learningModule?->title,
                'cbt_package_code' => $activeSessionExam ? $activeSessionExam['code'] : null,
                'cbt_package_title' => $activeSessionExam ? $activeSessionExam['title'] : null,
                'cbt_is_accessible' => $activeSessionExam ? ($canAccessSessionContent($activeSession) && (bool) $activeSessionExam['is_accessible']) : true,
                'cbt_has_attempt' => $activeSessionExam ? (bool) $activeSessionExam['has_attempt'] : false,
                'cbt_exam_state' => $activeSessionExam['exam_state'] ?? null,
                'cbt_last_score' => $activeSessionExam['last_score'] ?? null,
                'cbt_is_passed' => $activeSessionExam['is_passed'] ?? null,
                'cbt_attempts_count' => $activeSessionExam['attempts_count'] ?? 0,
                'cbt_attempts_allowed' => $activeSessionExam['attempts_allowed'] ?? 1,
                'cbt_access_denied_reason' => (! $canAccessSessionContent($activeSession) && $activeSessionExam)
                    ? 'Absen sesi terlebih dahulu untuk membuka ujian ini'
                    : ($activeSessionExam['access_denied_reason'] ?? null),
                'has_attended' => in_array($activeSession->id, $attendedSessionIds),
                'can_access_content' => $canAccessSessionContent($activeSession),
            ], $resolveSessionAttendanceMeta($activeSession)) : null,
            'scheduleDays' => $scheduleDays,
            'sessions' => $sessions->map(function (EventSession $s) use ($canAccessSessionContent, $event, $eventReaderUrl, $attendedSessionIds, $myCbtExamsById, $resolveSessionAttendanceMeta) {
                $sExam = $s->cbt_exam_package_id ? $myCbtExamsById->get($s->cbt_exam_package_id) : null;
                $attendanceMeta = $resolveSessionAttendanceMeta($s);
                $sHasMaterial = (bool) ($s->material_id || $s->learning_module_id || ($s->module && ($s->module->material_id || $s->module->source_file_path || $s->module->source_url)));
                $sHasExam = (bool) ($s->cbt_exam_package_id || $s->session_type_code === 'UJIAN' || $sExam);

                return array_merge([
                    'id' => $s->id,
                    'day_number' => $s->day_number,
                    'session_number' => $s->session_number,
                    'time_slot' => $s->time_slot,
                    'topic' => $s->topic,
                    'subtopic' => $s->subtopic,
                    'room' => $s->room,
                    'session_type_code' => $s->session_type_code,
                    'session_type_name' => $s->sessionType?->name ?? 'Sesi',
                    'speaker_name' => $s->speaker?->name,
                    'is_attendance_open' => $s->isAttendanceActive(),
                    'has_material' => $sHasMaterial,
                    'has_exam' => $sHasExam,
                    'module_id' => $s->event_module_id,
                    'module_code' => $s->module?->code,
                    'module_title' => $s->module?->title,
                    'learning_module_id' => $s->learning_module_id,
                    'learning_module_title' => $s->learningModule?->title,
                    'material_slug' => $canAccessSessionContent($s) ? ($s->material?->slug ?? $s->learningModule?->materials->first()?->slug ?? $s->module?->material?->slug) : null,
                    'material_reader_url' => $canAccessSessionContent($s) ? $eventReaderUrl($s->material?->slug ?? $s->learningModule?->materials->first()?->slug ?? $s->module?->material?->slug) : null,
                    'event_material_url' => $canAccessSessionContent($s) && $s->module?->publication_status === 'published'
                        ? match ($s->module->source_type) {
                            'uploaded_pdf' => route('event.module.file', [$event->slug, $s->module->id]),
                            'external_link', 'video' => $s->module->source_url,
                            default => null,
                        } : null,
                    'material_title' => $canAccessSessionContent($s) ? ($s->material?->title ?? $s->learningModule?->title ?? $s->module?->material?->title ?? $s->module?->title) : null,
                    'material_type' => $s->material?->type ?? 'book',
                    'cbt_package_code' => $sExam ? $sExam['code'] : null,
                    'cbt_package_title' => $sExam ? $sExam['title'] : null,
                    'cbt_is_accessible' => $sExam ? ($canAccessSessionContent($s) && (bool) $sExam['is_accessible']) : true,
                    'cbt_has_attempt' => $sExam ? (bool) $sExam['has_attempt'] : false,
                    'cbt_exam_state' => $sExam['exam_state'] ?? null,
                    'cbt_last_score' => $sExam['last_score'] ?? null,
                    'cbt_is_passed' => $sExam['is_passed'] ?? null,
                    'cbt_attempts_count' => $sExam['attempts_count'] ?? 0,
                    'cbt_attempts_allowed' => $sExam['attempts_allowed'] ?? 1,
                    'cbt_access_denied_reason' => (! $canAccessSessionContent($s) && $sExam)
                        ? 'Absen sesi terlebih dahulu untuk membuka ujian ini'
                        : ($sExam['access_denied_reason'] ?? null),
                    'has_attended' => in_array($s->id, $attendedSessionIds),
                    'can_access_content' => $canAccessSessionContent($s),
                ], $attendanceMeta);
            }),
            'modules' => ($canAccessLearning ? $visibleEventModules : collect())->map(fn (EventModule $m) => [
                'id' => $m->id,
                'code' => $m->code,
                'title' => $m->title,
                'duration_jp' => $m->jp,
                'speaker' => $m->speaker?->full_name_with_title ?? $m->speaker?->name,
                'material_slug' => $m->material?->slug,
                'resource_url' => $canAccessModuleResource($m) ? match ($m->source_type) {
                    'uploaded_pdf' => route('event.module.file', [$event->slug, $m->id]),
                    'external_link', 'video' => $m->source_url,
                    default => $eventReaderUrl($m->material?->slug),
                } : null,
                'source_type' => $m->source_type,
                'resource_locked' => ! $canAccessModuleResource($m),
                'material_type' => $m->material?->type ?? 'book',
                'material_title' => $m->material?->title,
                'publication_status' => $m->publication_status,
            ]),
            'myLearningModules' => $canAccessLearning ? $myLearningModules : [],
            'myCbtExams' => $canAccessLearning ? $myCbtExams : [],
            'cbtPackages' => $canAccessLearning ? $myCbtExams : [],
            'gradeSummary' => $gradeSummary,
            'attendanceRecords' => $attendanceRecords,
            'certificate' => [
                'number' => $eventParticipant->certificate_number,
                'issued_at' => $eventParticipant->certificate_issued_at?->format('d M Y'),
                'download_url' => $eventParticipant->certificate_file_path
                    ? route('event.certificate.mine', $event->slug) : null,
            ],
            'transcript' => [
                'number' => $eventParticipant->transcript_number,
                'issued_at' => $eventParticipant->transcript_issued_at?->format('d M Y'),
                'download_url' => $eventParticipant->transcript_file_path
                    ? route('event.transcript.mine', $event->slug) : null,
            ],
            'integrityPact' => [
                'has_signed' => EventIntegrityPact::where('event_id', $event->id)->where('participant_id', $participant->id)->where('status', 'signed')->exists(),
                'status' => EventIntegrityPact::where('event_id', $event->id)->where('participant_id', $participant->id)->value('status') ?? 'unfilled',
                'title' => (EventIntegrityPact::where('event_id', $event->id)->where('participant_id', $participant->id)->first())?->pact_title ?? 'Pakta Integritas PB PERKEMI',
                'pact_type' => (EventIntegrityPact::where('event_id', $event->id)->where('participant_id', $participant->id)->value('pact_type')) ?? EventIntegrityPactController::resolvePactType($eventParticipant->track_code),
                'sign_url' => route('event.integrity-pact', $event->slug),
                'print_url' => route('event.integrity-pact.print', $event->slug),
            ],
        ];

    }
}
