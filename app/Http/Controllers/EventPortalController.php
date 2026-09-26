<?php

namespace App\Http\Controllers;

use App\Actions\Events\SubmitCbtExam;
use App\Http\Requests\StoreCbtProctoringEventRequest;
use App\Http\Requests\SubmitExamRevisionRequest;
use App\Models\CbtExamAttempt;
use App\Models\CbtExamPackage;
use App\Models\CbtProctoringEvent;
use App\Models\CbtQuestion;
use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\EventModule;
use App\Models\EventParticipant;
use App\Models\EventSession;
use App\Models\Participant;
use App\Models\QuestionBank;
use App\Services\EventAttendanceService;
use App\Services\EventDocumentGenerator;
use App\Services\EventLearningRoomService;
use App\Services\QrCodeService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class EventPortalController extends Controller
{
    public function __construct(
        private readonly EventAttendanceService $attendanceService,
        private readonly EventLearningRoomService $learningRoom,
        private readonly SubmitCbtExam $submitCbtExam,
    ) {}

    /**
     * @return Collection<int, CbtQuestion|QuestionBank>
     */
    protected function examQuestions(CbtExamPackage $package): Collection
    {
        $questions = $package->questions()->where('is_active', true)->orderBy('sort_order')->get();

        if ($questions->isNotEmpty()) {
            return $questions;
        }

        return $package->bankQuestions()->where('status', 'active')->get();
    }

    /**
     * Normalize question options into standard shape with key, id, label, and text.
     *
     * @return array<int, array{key: string, id: string, text: string}>
     */
    protected function normalizeQuestionOptions(mixed $rawOptions): array
    {
        if (! is_array($rawOptions)) {
            return [];
        }

        $normalized = [];
        $letters = range('A', 'Z');
        $index = 0;

        foreach ($rawOptions as $key => $opt) {
            if (is_array($opt)) {
                $optKey = (string) ($opt['key'] ?? $opt['id'] ?? ($letters[$index] ?? $key));
                $optText = (string) ($opt['text'] ?? $opt['label'] ?? '');
            } else {
                $optKey = is_string($key) && ! is_numeric($key) ? (string) $key : ($letters[$index] ?? (string) $key);
                $optText = (string) $opt;
            }

            $normalized[] = [
                'key' => $optKey,
                'id' => $optKey,
                'text' => $optText,
            ];
            $index++;
        }

        return $normalized;
    }

    protected function eventPackage(Event $event, string $code): CbtExamPackage
    {
        return CbtExamPackage::where('code', $code)
            ->where(function ($query) use ($event) {
                $query->where('event_id', $event->id)
                    ->orWhereHas('events', fn ($events) => $events->whereKey($event->id))
                    ->orWhereHas('sessions', fn ($sessions) => $sessions->where('event_id', $event->id));
            })
            ->firstOrFail();
    }

    public function index(Request $request): Response|RedirectResponse
    {
        $participant = Participant::where('user_id', $request->user()->id)->first();

        $enrollments = $participant
            ? EventParticipant::with(['event', 'track', 'registrationForm'])
                ->where('participant_id', $participant->id)
                ->where('admin_status', 'verified')
                ->whereHas('event')
                ->get()
                ->sortByDesc(fn (EventParticipant $enrollment) => $enrollment->event->start_date)
                ->values()
            : collect();
        $arrivalSessions = EventSession::query()
            ->whereIn('event_id', $enrollments->pluck('event_id'))
            ->where('session_type_code', 'KEHADIRAN_AWAL')
            ->get(['id', 'event_id'])
            ->keyBy('event_id');
        $attendedArrivalEventIds = $participant
            ? EventAttendance::query()
                ->where('participant_id', $participant->id)
                ->where('attendance_type', 'check_in')
                ->whereIn('status', ['present', 'late', 'manual_override'])
                ->whereIn('event_session_id', $arrivalSessions->pluck('id'))
                ->pluck('event_id')
                ->flip()
            : collect();

        return Inertia::render('Event/Index', [
            'events' => $enrollments->map(fn (EventParticipant $enrollment) => [
                'id' => $enrollment->event->id,
                'name' => $enrollment->event->name,
                'slug' => $enrollment->event->slug,
                'date_formatted' => $enrollment->event->date_formatted,
                'place' => $enrollment->event->place,
                'status_label' => $enrollment->event->status_label,
                'track_name' => $enrollment->track?->name ?? $enrollment->track_code,
                'is_checked_in' => $arrivalSessions->has($enrollment->event_id)
                    ? $attendedArrivalEventIds->has($enrollment->event_id)
                    : (bool) $enrollment->checked_in_at,
                'has_registration_form' => (bool) $enrollment->registrationForm,
                'registration_form_status' => $enrollment->registrationForm?->status ?? 'unfilled',
                'registration_form_url' => route('event.registration-form', $enrollment->event->slug),
                'registration_form_print_url' => $enrollment->registrationForm
                    ? route('event.registration-form.print', $enrollment->event->slug)
                    : null,
                'certificate_number' => $enrollment->certificate_number,
                'certificate_download_url' => $enrollment->certificate_file_path
                    ? route('event.certificate.mine', $enrollment->event->slug) : null,
                'transcript_number' => $enrollment->transcript_number,
                'transcript_download_url' => $enrollment->transcript_file_path
                    ? route('event.transcript.mine', $enrollment->event->slug) : null,
            ]),
        ]);
    }

    public function certificates(Request $request): Response|RedirectResponse
    {
        $participant = Participant::where('user_id', $request->user()->id)->first();

        $documents = $participant ? EventParticipant::with('event')
            ->where('participant_id', $participant->id)
            ->where('admin_status', 'verified')
            ->where(function ($query) {
                $query->whereNotNull('certificate_file_path')
                    ->orWhereNotNull('transcript_file_path')
                    ->orWhereNotNull('secondary_certificate_file_path')
                    ->orWhereNotNull('secondary_transcript_file_path');
            })
            ->whereHas('event')
            ->get()
            ->sortByDesc(fn (EventParticipant $enrollment) => max(
                $enrollment->certificate_issued_at?->getTimestamp() ?? 0,
                $enrollment->transcript_issued_at?->getTimestamp() ?? 0,
                $enrollment->secondary_certificate_issued_at?->getTimestamp() ?? 0,
                $enrollment->secondary_transcript_issued_at?->getTimestamp() ?? 0,
            ))
            ->values() : collect();

        return Inertia::render('Event/Certificates', [
            'certificates' => $documents->map(fn (EventParticipant $enrollment) => [
                'id' => $enrollment->id,
                'event_name' => $enrollment->event->name,
                'event_date' => $enrollment->event->date_formatted,
                'certificate_number' => $enrollment->certificate_number,
                'issued_at' => $enrollment->certificate_issued_at?->format('d M Y'),
                'download_url' => $enrollment->certificate_file_path
                    ? route('event.certificate.mine', $enrollment->event->slug) : null,
                'transcript_number' => $enrollment->transcript_number,
                'transcript_issued_at' => $enrollment->transcript_issued_at?->format('d M Y'),
                'transcript_download_url' => $enrollment->transcript_file_path
                    ? route('event.transcript.mine', $enrollment->event->slug) : null,
                'document_variants' => collect(EventDocumentGenerator::documentTracks($enrollment->track_code))
                    ->map(function (string $trackCode) use ($enrollment): array {
                        $certificateNumberField = EventDocumentGenerator::documentField('certificate', 'number', $enrollment->track_code, $trackCode);
                        $certificatePathField = EventDocumentGenerator::documentField('certificate', 'file_path', $enrollment->track_code, $trackCode);
                        $certificateIssuedAtField = EventDocumentGenerator::documentField('certificate', 'issued_at', $enrollment->track_code, $trackCode);
                        $transcriptNumberField = EventDocumentGenerator::documentField('transcript', 'number', $enrollment->track_code, $trackCode);
                        $transcriptPathField = EventDocumentGenerator::documentField('transcript', 'file_path', $enrollment->track_code, $trackCode);
                        $transcriptIssuedAtField = EventDocumentGenerator::documentField('transcript', 'issued_at', $enrollment->track_code, $trackCode);

                        return [
                            'track_code' => $trackCode,
                            'label' => str_replace('Sertifikat ', '', EventDocumentGenerator::NUMBER_LABELS[$trackCode] ?? $trackCode),
                            'certificate_number' => $enrollment->{$certificateNumberField},
                            'certificate_issued_at' => $enrollment->{$certificateIssuedAtField}?->format('d M Y'),
                            'certificate_download_url' => $enrollment->{$certificatePathField}
                                ? route('event.certificate.mine', [$enrollment->event->slug, 'document_track' => $trackCode]) : null,
                            'transcript_number' => $enrollment->{$transcriptNumberField},
                            'transcript_issued_at' => $enrollment->{$transcriptIssuedAtField}?->format('d M Y'),
                            'transcript_download_url' => $enrollment->{$transcriptPathField}
                                ? route('event.transcript.mine', [$enrollment->event->slug, 'document_track' => $trackCode]) : null,
                        ];
                    })->all(),
            ]),
        ]);
    }

    /**
     * Get active in-progress exam attempt if participant must remain on exam page.
     */
    protected function activeInProgressExamAttempt(Event $event, ?Participant $participant): ?CbtExamAttempt
    {
        if (! $participant) {
            return null;
        }

        $attempt = CbtExamAttempt::query()
            ->with('package')
            ->where('event_id', $event->id)
            ->where('participant_id', $participant->id)
            ->where('status', 'in_progress')
            ->first();

        if ($attempt && $attempt->package && ! $attempt->hasExpired($attempt->package)) {
            return $attempt;
        }

        return null;
    }

    /**
     * Get active in-progress exam attempt across all events for a participant.
     */
    protected function anyActiveInProgressExamAttempt(?Participant $participant): ?CbtExamAttempt
    {
        if (! $participant) {
            return null;
        }

        $attempt = CbtExamAttempt::query()
            ->with(['package', 'event'])
            ->where('participant_id', $participant->id)
            ->where('status', 'in_progress')
            ->first();

        if ($attempt && $attempt->package && $attempt->event && ! $attempt->hasExpired($attempt->package)) {
            return $attempt;
        }

        return null;
    }

    /**
     * Show the 3D Welcome Book Opening Screen for an event.
     */
    public function welcome(Request $request, string $slug): Response|RedirectResponse
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        [$participant, $eventParticipant] = $this->attendanceService->resolveParticipant($request->user(), $event);

        $modulesCount = $event->modules()->count();
        $sessionsCount = $event->sessions()->count();

        return Inertia::render('Event/Welcome', [
            'event' => [
                'id' => $event->id,
                'name' => $event->name,
                'slug' => $event->slug,
                'date_formatted' => $event->date_formatted,
                'place' => $event->place,
                'organizer' => $event->organizer,
                'duration_days' => $event->total_days.' hari',
                'total_effective_jp' => $event->total_effective_jp,
                'modules_count' => $modulesCount,
                'sessions_count' => $sessionsCount,
            ],
            'participant' => [
                'id' => $participant->id,
                'event_participant_id' => $eventParticipant->id,
                'name' => $participant->name,
                'dan_roman' => $participant->dan_roman,
                'origin' => $participant->origin,
                'dojo' => $participant->dojo,
                'track_code' => $eventParticipant->track?->code ?? $eventParticipant->track_code,
                'track_name' => $eventParticipant->track?->name,
                'rotation_group' => $eventParticipant->rotation_group,
                'has_seen_welcome' => (bool) $eventParticipant->has_seen_welcome,
                'checked_in_at' => $eventParticipant->checked_in_at?->format('d M Y, H:i'),
                'is_checked_in' => $this->attendanceService->hasArrivalAttendance($event, $eventParticipant),
            ],
        ]);
    }

    /**
     * Mark welcome screen as seen so it doesn't show again on subsequent logins.
     */
    public function markSeen(Request $request, string $slug): RedirectResponse
    {
        $event = Event::where('slug', $slug)->firstOrFail();

        [, $eventParticipant] = $this->attendanceService->resolveParticipant($request->user(), $event);
        $eventParticipant->update(['has_seen_welcome' => true]);

        return redirect()->route('event.learning-room', $event->slug);
    }

    /**
     * Perform participant self check-in to the event.
     */
    public function checkIn(Request $request, string $slug): RedirectResponse
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        $this->attendanceService->resolveParticipant($request->user(), $event);

        return redirect()->route('event.scan', $event->slug)
            ->with('error', 'Kehadiran awal dicatat melalui QR atau kode sesi dari penyelenggara.');
    }

    /**
     * Display the participant event learning room (dashboard peserta mobile-first).
     */
    public function learningRoom(Request $request, string $slug): Response|RedirectResponse
    {
        $data = $this->learningRoom->data($request->user(), $slug);

        return Inertia::render('Event/LearningRoom', $data);
    }

    /**
     * Show QR Code Camera Scanner & Shortcode fallback page.
     */
    public function scan(Request $request, string $slug): Response|RedirectResponse
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        [$participant, $eventParticipant] = $this->attendanceService->resolveParticipant($request->user(), $event);

        $token = $request->query('token');
        $code = $request->query('code');

        // Check if token matches an active session immediately
        $prefilledSession = null;
        if ($token) {
            $prefilledSession = EventSession::where('event_id', $event->id)
                ->where('qr_token', $token)
                ->where('is_attendance_open', true)
                ->first();
        } elseif ($code) {
            $prefilledSession = EventSession::where('event_id', $event->id)
                ->where('qr_short_code', strtoupper($code))
                ->where('is_attendance_open', true)
                ->first();
        }

        return Inertia::render('Event/Scan', [
            'event' => [
                'id' => $event->id,
                'name' => $event->name,
                'slug' => $event->slug,
            ],
            'participant' => [
                'id' => $participant->id,
                'name' => $participant->name,
                'track_code' => $eventParticipant->track_code,
            ],
            'prefilledToken' => $token,
            'prefilledCode' => $code,
            'matchedSession' => $prefilledSession ? [
                'id' => $prefilledSession->id,
                'topic' => $prefilledSession->topic,
                'session_number' => $prefilledSession->session_number,
                'session_type_code' => $prefilledSession->session_type_code,
                'time_slot' => $prefilledSession->time_slot,
                'room' => $prefilledSession->room,
                'attendance_setting' => $prefilledSession->attendance_setting,
            ] : null,
        ]);
    }

    public function downloadCertificate(Request $request, string $slug): StreamedResponse|RedirectResponse
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        [$participant, $enrollment] = $this->attendanceService->resolveParticipant($request->user(), $event);

        $requestedTrack = $request->query('document_track');
        abort_unless($requestedTrack === null || is_string($requestedTrack), 404);
        $documentTrack = EventDocumentGenerator::resolveDocumentTrack($enrollment->track_code, $requestedTrack);
        abort_unless($documentTrack, 404);
        $pathField = EventDocumentGenerator::documentField('certificate', 'file_path', $enrollment->track_code, $documentTrack);
        $path = $enrollment->{$pathField};
        abort_unless($path && Storage::disk('local')->exists($path), 404);

        return Storage::disk('local')->download(
            $path,
            "sertifikat-{$event->slug}-{$documentTrack}.pdf"
        );
    }

    public function downloadTranscript(Request $request, string $slug): StreamedResponse|RedirectResponse
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        [$participant, $enrollment] = $this->attendanceService->resolveParticipant($request->user(), $event);

        $requestedTrack = $request->query('document_track');
        abort_unless($requestedTrack === null || is_string($requestedTrack), 404);
        $documentTrack = EventDocumentGenerator::resolveDocumentTrack($enrollment->track_code, $requestedTrack);
        abort_unless($documentTrack, 404);
        $pathField = EventDocumentGenerator::documentField('transcript', 'file_path', $enrollment->track_code, $documentTrack);
        $path = $enrollment->{$pathField};
        abort_unless($path && Storage::disk('local')->exists($path), 404);

        return Storage::disk('local')->download(
            $path,
            "transkrip-{$event->slug}-{$documentTrack}.pdf"
        );
    }

    public function moduleFile(Request $request, string $slug, EventModule $module): StreamedResponse|RedirectResponse
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        $user = $request->user();

        // Admin, Diktar, and Penyelenggara can preview/download module files directly
        if ($user && ($user->isAdmin() || in_array($user->role, ['Admin', 'Diktar', 'Penyelenggara'], true))) {
            abort_unless($module->event_id === $event->id && $module->source_file_path
                && Storage::disk('local')->exists($module->source_file_path), 404);

            return Storage::disk('local')->response($module->source_file_path, "materi-{$module->id}.pdf", [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline',
            ]);
        }

        [$participant, $enrollment] = $this->attendanceService->resolveParticipant($user, $event);

        abort_unless($module->event_id === $event->id && $module->publication_status === 'published'
            && $module->source_type === 'uploaded_pdf' && $module->source_file_path, 404);
        abort_unless((bool) $enrollment->checked_in_at, 403, 'Anda harus melakukan check-in terlebih dahulu sebelum membuka materi.');
        abort_unless(! $module->track_codes || in_array($enrollment->track_code, $module->track_codes, true), 403);

        $activeRequiredSessionIds = $event->sessions()
            ->where('event_module_id', $module->id)
            ->whereNotIn('attendance_setting', ['none', 'disabled'])
            ->pluck('id');
        if ($activeRequiredSessionIds->isNotEmpty()) {
            abort_unless(EventAttendance::where('event_id', $event->id)
                ->where('participant_id', $enrollment->participant_id)
                ->whereIn('event_session_id', $activeRequiredSessionIds)
                ->where('attendance_type', 'check_in')
                ->whereIn('status', ['present', 'late', 'manual_override'])->exists(), 403,
                'Absensi sesi wajib dicatat sebelum membuka materi.');
        }

        abort_unless(Storage::disk('local')->exists($module->source_file_path), 404);

        return Storage::disk('local')->response($module->source_file_path, "materi-{$module->id}.pdf", [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline',
        ]);
    }

    /**
     * Record participant attendance using QR token or shortcode.
     */
    public function recordAttendance(Request $request, string $slug): RedirectResponse
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        [$participant, $eventParticipant] = $this->attendanceService->resolveParticipant($request->user(), $event);

        if (! $participant || ! $eventParticipant) {
            return back()->with('error', 'Anda tidak terdaftar sebagai peserta resmi pada event ini.');
        }

        $token = $request->input('token');
        $shortCode = strtoupper(trim((string) $request->input('short_code')));
        $sessionId = $request->input('session_id');

        if (empty($token) && empty($shortCode) && empty($sessionId)) {
            return back()->with('error', 'Token QR, kode sesi, atau sesi harus disertakan.');
        }

        $session = null;
        if (! empty($token)) {
            $session = EventSession::where('event_id', $event->id)
                ->where('qr_token', $token)
                ->first();
        } elseif (! empty($shortCode)) {
            $session = EventSession::where('event_id', $event->id)
                ->where('qr_short_code', $shortCode)
                ->first();
        } elseif (! empty($sessionId)) {
            $session = EventSession::where('event_id', $event->id)
                ->where('id', $sessionId)
                ->first();
        }

        if (! $session) {
            return back()->with('error', 'Sesi tidak ditemukan atau kode sesi salah.');
        }

        if (! $session->is_attendance_open) {
            return back()->with('error', "Absensi untuk sesi \"{$session->topic}\" belum dibuka oleh panitia.");
        }

        if (in_array($session->attendance_setting, ['none', 'disabled'], true)) {
            return back()->with('error', 'Sesi ini tidak memerlukan absensi.');
        }

        if ($session->attendance_close_at && now()->isAfter($session->attendance_close_at)) {
            return back()->with('error', "Waktu absensi untuk sesi \"{$session->topic}\" telah berakhir.");
        }

        $isAdminOrOrganizer = $request->user()->isAdmin() || in_array($request->user()->role, ['Admin', 'Diktar', 'Penyelenggara'], true);

        // Verify day of the session for participants
        if (! $isAdminOrOrganizer) {
            $sessionDate = $session->date ?? ($event->start_date ? $event->start_date->copy()->addDays($session->day_number - 1) : null);
            if ($sessionDate && $sessionDate->isFuture() && ! $sessionDate->isToday()) {
                return back()->with('error', "Absensi untuk sesi \"{$session->topic}\" baru dapat diakses pada hari pelaksanaannya.");
            }
        }

        // Check if track matches (if session restricts tracks)
        if (! $isAdminOrOrganizer && ! empty($session->track_codes) && ! in_array($eventParticipant->track_code, $session->track_codes)) {
            return back()->with('error', "Anda berada di jalur {$eventParticipant->track_code}, sesi ini dikhususkan untuk jalur: ".implode(', ', $session->track_codes));
        }

        $validated = $request->validate([
            'attendance_type' => ['required', 'in:check_in,check_out'],
        ]);
        $type = $validated['attendance_type'];

        if ($type === 'check_out' && $session->attendance_setting !== 'check_in_out') {
            return back()->with('error', 'Absensi keluar tidak diaktifkan untuk sesi ini.');
        }

        if ($type === 'check_out' && ! EventAttendance::where('event_session_id', $session->id)
            ->where('participant_id', $participant->id)
            ->where('attendance_type', 'check_in')->exists()) {
            return back()->with('error', 'Absensi masuk sesi harus tercatat sebelum absensi keluar.');
        }

        // Admin preview without formal enrollment
        if (empty($participant->id) || empty($eventParticipant->id)) {
            return back()->with('info', 'Mode Pratinjau Admin: Tombol absensi aktif dan berfungsi. Untuk menyimpan catatan absensi peserta ke database, silakan gunakan akun peserta resmi.');
        }

        // Determine status (present vs late)
        $status = 'present';
        // If current time is more than 30 minutes after start_time
        if ($session->start_time && $session->date) {
            $sessionStartTime = $session->date->setTimeFromTimeString($session->start_time);
            if (now()->isAfter($sessionStartTime->addMinutes(30))) {
                $status = 'late';
            }
        }

        $method = ! empty($token) ? 'qr_scan' : (! empty($shortCode) ? 'short_code' : 'portal_direct');

        $attendance = $this->attendanceService->record(
            $event,
            $session,
            $participant,
            $eventParticipant,
            $type,
            $status,
            $method,
            $request->user()->id,
        );

        $actionLabel = $type === 'check_out' ? 'keluar' : 'masuk';

        if (! $attendance->wasRecentlyCreated) {
            return back()->with('info', "Anda sudah melakukan absensi {$actionLabel} untuk sesi \"{$session->topic}\" pada {$attendance->checked_in_at?->format('H:i')} WIB.");
        }

        $statusText = $status === 'late' ? ' (Terlambat)' : '';

        return redirect()->route('event.learning-room', $event->slug)
            ->with('success', "Absensi {$actionLabel} berhasil dicatat{$statusText} untuk sesi \"{$session->topic}\".");
    }

    /**
     * Show CBT Exam taking runner for participant.
     */
    public function cbtExam(Request $request, string $slug, string $packageCode): Response|RedirectResponse
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        [$participant, $eventParticipant] = $this->attendanceService->resolveParticipant($request->user(), $event);

        if (! $participant || ! $eventParticipant) {
            return redirect()->route('event.learning-room', $slug)
                ->with('error', 'Anda harus terdaftar pada event ini untuk mengikuti ujian.');
        }

        $package = $this->eventPackage($event, $packageCode);
        if ($request->header('X-Inertia')) {
            try {
                $this->attendanceService->ensureExamAttendance($event, $eventParticipant, $package);
            } catch (HttpException $e) {
                return redirect()->route('event.learning-room', $slug)
                    ->with('error', $e->getMessage() ?: 'Absensi wajib diselesaikan sebelum ujian dibuka.');
            }
        } else {
            $this->attendanceService->ensureExamAttendance($event, $eventParticipant, $package);
        }

        if ($activeAttempt = $this->activeInProgressExamAttempt($event, $participant)) {
            if ($activeAttempt->package && $activeAttempt->package->code !== $packageCode) {
                return redirect()->route('event.cbt.exam', [$slug, $activeAttempt->package->code])
                    ->with('error', "Anda sedang mengerjakan ujian \"{$activeAttempt->package->title}\". Selesaikan ujian tersebut terlebih dahulu.");
            }
        }

        if (! in_array($package->status, ['ready', 'open'])) {
            return redirect()->route('event.learning-room', $slug)
                ->with('error', "Ujian \"{$package->title}\" belum dibuka atau telah ditutup.");
        }

        $completedAttempts = CbtExamAttempt::query()
            ->where('event_id', $event->id)
            ->where('cbt_exam_package_id', $package->id)
            ->where('participant_id', $participant->id)
            ->whereIn('status', CbtExamAttempt::TERMINAL_STATUSES)
            ->latest('submitted_at')
            ->get();
        $completedAttemptsCount = $completedAttempts->count();
        $lastCompletedAttempt = $completedAttempts->first();

        if ($package->revision_method === 'paper' && $lastCompletedAttempt && ! $lastCompletedAttempt->is_passed) {
            return redirect()->route('event.learning-room', $slug)
                ->with('info', 'Revisi ujian ini menggunakan unggah makalah PDF.');
        }

        if ($completedAttemptsCount >= $package->attempts_allowed) {
            return redirect()->route('event.learning-room', $slug)
                ->with('info', "Anda telah menyelesaikan seluruh kesempatan ujian ({$completedAttemptsCount}/{$package->attempts_allowed}). Nilai akhir: {$lastCompletedAttempt?->total_score}.");
        }

        // Find existing in-progress attempt or start a new one
        $attempt = CbtExamAttempt::firstOrCreate(
            [
                'cbt_exam_package_id' => $package->id,
                'event_id' => $event->id,
                'participant_id' => $participant->id,
                'status' => 'in_progress',
            ],
            [
                'user_id' => Auth::id(),
                'attempt_number' => $completedAttemptsCount + 1,
                'started_at' => now(),
                'answers' => [],
            ]
        );

        // Fetch questions, intentionally hiding correct_answer to prevent client-side inspection
        $examQuestions = $this->examQuestions($package);

        // Ensure attempt has a persistent deterministic question and option order locked once at start
        $questionOrder = $attempt->question_order;
        $optionOrder = $attempt->option_order ?? [];
        $needsOrderUpdate = false;

        if (empty($questionOrder) || ! is_array($questionOrder)) {
            $questionIds = $examQuestions->pluck('id');
            $questionOrder = $package->randomize_questions
                ? $questionIds->shuffle()->values()->all()
                : $questionIds->values()->all();
            $needsOrderUpdate = true;
        }

        if (empty($optionOrder) || ! is_array($optionOrder)) {
            $optionOrder = [];
            foreach ($examQuestions as $q) {
                $normalized = $this->normalizeQuestionOptions($q->options);
                $keys = collect($normalized)->pluck('key');
                $optionOrder[(string) $q->id] = $package->randomize_answers
                    ? $keys->shuffle()->values()->all()
                    : $keys->values()->all();
            }
            $needsOrderUpdate = true;
        }

        if ($needsOrderUpdate) {
            $attempt->update([
                'question_order' => $questionOrder,
                'option_order' => $optionOrder,
            ]);
            $attempt->refresh();
        }

        // Sort questions strictly by the attempt's locked question order
        $questionOrderMap = array_flip($questionOrder);
        $examQuestions = $examQuestions
            ->sortBy(fn ($q) => $questionOrderMap[$q->id] ?? 999999)
            ->values();

        $displayLetters = range('A', 'Z');
        $questions = $examQuestions
            ->map(function ($q) use ($optionOrder, $displayLetters) {
                $normalized = $this->normalizeQuestionOptions($q->options);
                $qOptOrder = $optionOrder[(string) $q->id] ?? null;

                if (! empty($qOptOrder) && is_array($qOptOrder)) {
                    $optKeyMap = array_flip($qOptOrder);
                    $normalized = collect($normalized)
                        ->sortBy(fn ($opt) => $optKeyMap[$opt['key']] ?? 999999)
                        ->values()
                        ->all();
                }

                $optionsWithLabels = [];
                foreach ($normalized as $idx => $opt) {
                    $optionsWithLabels[] = [
                        'key' => $opt['key'],
                        'id' => $opt['id'],
                        'label' => $displayLetters[$idx] ?? $opt['key'],
                        'text' => $opt['text'],
                    ];
                }

                return [
                    'id' => $q->id,
                    'question_text' => $q->question_text,
                    'question_type' => $q->question_type,
                    'options' => $optionsWithLabels,
                    'points' => (float) $q->points,
                ];
            })
            ->values();

        $remainingSeconds = $attempt->remainingSeconds($package);

        if ($remainingSeconds === 0) {
            $timedOutAttempt = $this->submitCbtExam->handle(
                $event,
                $package,
                $participant,
                $eventParticipant,
                null,
                $examQuestions,
            );

            return redirect()->route('event.learning-room', $slug)
                ->with('info', "Waktu ujian telah berakhir. Jawaban tersimpan dikumpulkan otomatis dengan nilai {$timedOutAttempt->total_score}.");
        }

        return Inertia::render('Event/CbtExam', [
            'event' => [
                'id' => $event->id,
                'name' => $event->name,
                'slug' => $event->slug,
            ],
            'participant' => [
                'id' => $participant->id,
                'name' => $participant->name,
                'track_code' => $eventParticipant->track_code,
            ],
            'package' => [
                'id' => $package->id,
                'title' => $package->title,
                'code' => $package->code,
                'duration_minutes' => $package->duration_minutes,
                'passing_score' => (float) $package->passing_score,
                'instructions' => $package->instructions,
            ],
            'attempt' => [
                'id' => $attempt->id,
                'attempt_number' => $attempt->attempt_number,
                'started_at' => $attempt->started_at->toIso8601String(),
                'expires_at' => $attempt->expiresAt($package)->toIso8601String(),
                'answers' => (object) ($attempt->answers ?? []),
                'remaining_seconds' => $remainingSeconds,
                'proctoring_events_count' => $attempt->proctoringEvents()->where('severity', '!=', 'info')->count(),
            ],
            'questions' => $questions,
        ]);
    }

    public function storeCbtProctoringEvent(
        StoreCbtProctoringEventRequest $request,
        string $slug,
        string $packageCode
    ): JsonResponse {
        $event = Event::where('slug', $slug)->firstOrFail();
        [$participant] = $this->attendanceService->resolveParticipant($request->user(), $event);
        $package = $this->eventPackage($event, $packageCode);
        $attempt = CbtExamAttempt::where('cbt_exam_package_id', $package->id)
            ->where('event_id', $event->id)
            ->where('participant_id', $participant->id)
            ->where('status', 'in_progress')
            ->firstOrFail();

        $validated = $request->validated();
        $type = $validated['type'];
        $severity = match ($type) {
            'camera_started' => 'info',
            'camera_denied', 'camera_unavailable', 'camera_interrupted' => 'critical',
            default => 'warning',
        };

        $recentEvent = $attempt->proctoringEvents()
            ->where('type', $type)
            ->where('occurred_at', '>=', now()->subSeconds(3))
            ->first();

        if (! $recentEvent) {
            CbtProctoringEvent::create([
                'cbt_exam_attempt_id' => $attempt->id,
                'event_id' => $event->id,
                'participant_id' => $participant->id,
                'type' => $type,
                'severity' => $severity,
                'metadata' => $validated['metadata'] ?? null,
                'occurred_at' => now(),
            ]);
        }

        return response()->json([
            'recorded' => $recentEvent === null,
            'incident_count' => $attempt->proctoringEvents()->where('severity', '!=', 'info')->count(),
        ], $recentEvent ? 200 : 201);
    }

    public function submitRevision(SubmitExamRevisionRequest $request, string $slug, CbtExamAttempt $attempt): RedirectResponse
    {
        $package = $attempt->package;
        if ($package?->revision_method !== 'paper'
            || ! in_array($attempt->status, CbtExamAttempt::TERMINAL_STATUSES, true)
            || $attempt->is_passed) {
            return back()->withErrors(['paper' => 'Ujian ini tidak menerima revisi makalah.']);
        }

        if ($package->revision_deadline && now()->isAfter($package->revision_deadline)) {
            return back()->withErrors(['paper' => 'Batas unggah revisi telah berakhir.']);
        }

        if (in_array($attempt->revision_status, ['pending', 'accepted'], true)) {
            return back()->withErrors(['paper' => 'Makalah sudah dikirim dan sedang atau telah diperiksa.']);
        }

        $oldPath = $attempt->revision_file_path;
        $path = $request->file('paper')->store("event-revisions/{$attempt->event_id}/{$attempt->participant_id}", 'local');
        try {
            $attempt->update([
                'revision_file_path' => $path,
                'revision_status' => 'pending',
                'revision_submitted_at' => now(),
            ]);
        } catch (Throwable $exception) {
            Storage::disk('local')->delete($path);

            throw $exception;
        }
        if ($oldPath) {
            Storage::disk('local')->delete($oldPath);
        }

        return back()->with('success', 'Makalah revisi berhasil diunggah untuk diperiksa.');
    }

    private function ownedRevision(Request $request, Event $event, CbtExamAttempt $attempt): CbtExamAttempt
    {
        [$participant] = $this->attendanceService->resolveParticipant($request->user(), $event);
        abort_unless($participant && $attempt->event_id === $event->id
            && $attempt->participant_id === $participant->id && $attempt->revision_file_path
            && Storage::disk('local')->exists($attempt->revision_file_path), 404);

        return $attempt;
    }

    public function revisionReader(Request $request, string $slug, CbtExamAttempt $attempt): Response
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        $this->ownedRevision($request, $event, $attempt)->load('package');

        return Inertia::render('Event/RevisionReader', [
            'title' => 'Makalah revisi saya',
            'subtitle' => $attempt->package?->title,
            'fileUrl' => route('event.revision.mine.preview', [$event->slug, $attempt]),
            'downloadUrl' => route('event.revision.mine.preview', [$event->slug, $attempt]),
            'backUrl' => route('event.learning-room', $event->slug),
        ]);
    }

    public function revisionPreview(Request $request, string $slug, CbtExamAttempt $attempt): StreamedResponse
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        $this->ownedRevision($request, $event, $attempt);

        return Storage::disk('local')->response($attempt->revision_file_path, "revisi-ujian-{$attempt->id}.pdf", [
            'Content-Type' => 'application/pdf',
        ]);
    }

    /**
     * Autosave participant answer for a question.
     */
    public function saveCbtAnswer(Request $request, string $slug, string $packageCode): RedirectResponse|JsonResponse
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        [$participant, $eventParticipant] = $this->attendanceService->resolveParticipant($request->user(), $event);

        if (! $participant) {
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json(['error' => 'Otorisasi gagal.'], 403);
            }

            return back()->with('error', 'Otorisasi gagal.');
        }

        $package = $this->eventPackage($event, $packageCode);
        $this->attendanceService->ensureExamAttendance($event, $eventParticipant, $package);

        $validated = $request->validate([
            'question_id' => ['nullable', 'integer'],
            'answer' => ['nullable'],
            'answers' => ['nullable', 'array'],
        ]);

        $questions = $this->examQuestions($package);

        $incomingBatch = [];
        if (! empty($validated['answers']) && is_array($validated['answers'])) {
            foreach ($validated['answers'] as $qId => $ans) {
                $incomingBatch[(string) $qId] = $ans;
            }
        } elseif (isset($validated['question_id'])) {
            $incomingBatch[(string) $validated['question_id']] = $validated['answer'] ?? null;
        }

        $answerSaved = DB::transaction(function () use ($event, $package, $participant, $incomingBatch): bool {
            $attempt = CbtExamAttempt::query()
                ->where('event_id', $event->id)
                ->where('cbt_exam_package_id', $package->id)
                ->where('participant_id', $participant->id)
                ->where('status', 'in_progress')
                ->lockForUpdate()
                ->firstOrFail();

            if ($attempt->hasExpired($package)) {
                return false;
            }

            $answers = is_array($attempt->answers) ? $attempt->answers : [];
            foreach ($incomingBatch as $qId => $val) {
                if ($val === null || $val === '') {
                    unset($answers[(string) $qId]);
                } else {
                    $answers[(string) $qId] = (string) $val;
                }
            }
            $attempt->update(['answers' => $answers]);

            return true;
        });

        if (! $answerSaved) {
            $timedOutAttempt = $this->submitCbtExam->handle(
                $event,
                $package,
                $participant,
                $eventParticipant,
                null,
                $questions,
            );

            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'status' => 'expired',
                    'message' => 'Waktu ujian telah berakhir.',
                    'total_score' => $timedOutAttempt->total_score,
                ], 410);
            }

            return redirect()->route('event.learning-room', $slug)
                ->with('info', "Waktu ujian telah berakhir. Jawaban tersimpan dikumpulkan otomatis dengan nilai {$timedOutAttempt->total_score}.");
        }

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'status' => 'saved',
                'saved_count' => count($incomingBatch),
                'saved_at' => now()->toIso8601String(),
            ]);
        }

        return back();
    }

    /**
     * Submit and auto-grade the CBT exam.
     */
    public function submitCbtExam(Request $request, string $slug, string $packageCode): RedirectResponse|JsonResponse
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        [$participant, $eventParticipant] = $this->attendanceService->resolveParticipant($request->user(), $event);

        if (! $participant) {
            if ($request->wantsJson() || $request->has('beacon')) {
                return response()->json(['error' => 'Otorisasi gagal.'], 403);
            }

            return redirect()->route('event.learning-room', $slug)->with('error', 'Otorisasi gagal.');
        }

        $package = $this->eventPackage($event, $packageCode);
        $this->attendanceService->ensureExamAttendance($event, $eventParticipant, $package);

        $questions = $this->examQuestions($package);
        $validated = $request->validate(['answers' => ['nullable', 'array']]);
        $attempt = $this->submitCbtExam->handle(
            $event,
            $package,
            $participant,
            $eventParticipant,
            $validated['answers'] ?? null,
            $questions,
        );
        $finalScore = (float) $attempt->total_score;
        $isPassed = (bool) $attempt->is_passed;

        if ($request->wantsJson() || $request->has('beacon')) {
            return response()->json([
                'status' => 'submitted',
                'final_score' => $finalScore,
                'is_passed' => $isPassed,
            ]);
        }

        if ($attempt->status === 'timed_out') {
            return redirect()->route('event.learning-room', $slug)
                ->with('info', "Waktu ujian telah berakhir. Jawaban tersimpan dikumpulkan otomatis dengan nilai {$finalScore}.");
        }

        $statusMessage = $isPassed
            ? "Selamat! Anda LULUS dengan nilai {$finalScore} (Kriteria kelulusan: {$package->passing_score})."
            : "Ujian selesai. Nilai Anda: {$finalScore} (Kriteria kelulusan: {$package->passing_score}).";

        return redirect()->route('event.learning-room', $slug)->with('success', $statusMessage);
    }

    /**
     * View and print participant's own ID card.
     */
    public function myIdCard(Request $request, string $slug): Response|RedirectResponse
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        $participant = Participant::where('user_id', $request->user()->id)->first();

        if (! $participant) {
            return redirect()->route('event.mine')->with('error', 'Data kenshi Anda belum terdaftar.');
        }

        $ep = EventParticipant::with(['participant.user', 'track'])
            ->where('event_id', $event->id)
            ->where('participant_id', $participant->id)
            ->firstOrFail();

        $qrSvg = QrCodeService::svg($ep->participant?->kenshi_id_number ?? "KNS-{$ep->id}", 200, '#0E2747', '#FFFFFF');

        return Inertia::render('Admin/Events/PrintIdCard', [
            'event' => [
                'id' => $event->id,
                'title' => $event->title ?? $event->name,
                'name' => $event->name,
                'slug' => $event->slug,
                'place' => $event->place ?? $event->location,
                'start_date' => $event->start_date?->format('d F Y'),
                'end_date' => $event->end_date?->format('d F Y'),
                'date_formatted' => $event->date_formatted,
            ],
            'cards' => [
                [
                    'id' => $ep->id,
                    'name' => $ep->participant?->name ?? 'Peserta',
                    'kenshi_id' => $ep->participant?->kenshi_id ?? '-',
                    'dan_roman' => $ep->participant?->dan_roman ?? '-',
                    'origin' => $ep->participant?->origin ?? '-',
                    'dojo' => $ep->participant?->dojo ?? '-',
                    'track_name' => $ep->track?->name ?? $ep->track_code,
                    'track_code' => $ep->track_code,
                    'track_badge' => $ep->track?->badge_color ?? 'bg-slate-100 text-slate-700',
                    'rotation_group' => $ep->rotation_group,
                    'photo_url' => $ep->participant?->photo_url,
                    'qr_svg' => $qrSvg,
                ],
            ],
            'single' => true,
        ]);
    }
}
