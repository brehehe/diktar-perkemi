<?php

namespace App\Services;

use App\Http\Controllers\EventIntegrityPactController;
use App\Http\Controllers\EventRegistrationFormController;
use App\Models\CbtExamAttempt;
use App\Models\CbtExamPackage;
use App\Models\CbtProctoringEvent;
use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\EventIntegrityPact;
use App\Models\EventLegend;
use App\Models\EventModule;
use App\Models\EventParticipant;
use App\Models\EventRegistrationForm;
use App\Models\EventRoom;
use App\Models\EventSession;
use App\Models\EventSessionType;
use App\Models\LearningModule;
use App\Models\Material;
use App\Models\Participant;
use App\Models\ParticipantTrack;
use App\Models\QuestionModule;
use App\Models\Speaker;
use App\Models\User;
use Illuminate\Support\Carbon;

class AdminEventDetailService
{
    public function __construct(private readonly EventDocumentGenerator $documentGenerator) {}

    /**
     * @return array<string, mixed>
     */
    public function data(Event $event): array
    {
        $event->load([
            'responsibleUser',
            'rooms' => fn ($query) => $query->withCount('sessions'),
            'modules.speaker',
            'modules.material',
            'sessions' => function ($q) {
                $q->with(['speaker', 'sessionType', 'material', 'learningModule', 'module', 'cbtPackage'])
                    ->withCount('attendances')
                    ->orderBy('day_number')
                    ->orderBy('start_time')
                    ->orderBy('id');
            },
            'eventParticipants' => function ($q) {
                $q->with(['participant.user', 'track', 'registrationForm.verifier'])->orderBy('id');
            },
        ]);

        $proctoringEvents = CbtProctoringEvent::query()
            ->with(['participant:id,name', 'attempt.package:id,title,code'])
            ->where('event_id', $event->id)
            ->latest('occurred_at')
            ->limit(200)
            ->get()
            ->map(fn (CbtProctoringEvent $proctoringEvent) => [
                'id' => $proctoringEvent->id,
                'participant_name' => $proctoringEvent->participant?->name ?? 'Peserta',
                'attempt_number' => $proctoringEvent->attempt?->attempt_number,
                'package_title' => $proctoringEvent->attempt?->package?->title,
                'package_code' => $proctoringEvent->attempt?->package?->code,
                'type' => $proctoringEvent->type,
                'type_label' => $proctoringEvent->type_label,
                'severity' => $proctoringEvent->severity,
                'occurred_at' => $proctoringEvent->occurred_at?->locale('id')->translatedFormat('d M Y, H:i:s'),
            ]);

        // Group sessions by day
        $arrivalSession = $event->sessions->firstWhere('session_type_code', 'KEHADIRAN_AWAL');
        $sessionsByDay = $event->sessions
            ->where('session_type_code', '!=', 'KEHADIRAN_AWAL')
            ->filter(fn (EventSession $session) => $session->day_number >= 1 && $session->day_number <= $event->total_days)
            ->groupBy('day_number')->map(fn ($sessions, $day) => [
                'day_number' => $day,
                'sessions' => $sessions->map(fn (EventSession $s) => [
                    'id' => $s->id,
                    'session_number' => $s->session_number,
                    'day_number' => $s->day_number,
                    'session_date' => $s->session_date?->format('Y-m-d'),
                    'time_slot' => $s->time_slot,
                    'start_time' => $s->start_time,
                    'end_time' => $s->end_time,
                    'duration_jp' => $s->duration_jp,
                    'topic' => $s->topic,
                    'subtopic' => $s->subtopic,
                    'method' => $s->method,
                    'room' => $s->room,
                    'event_room_id' => $s->event_room_id,
                    'target_tracks' => $s->target_tracks ?? $s->track_codes ?? [],
                    'track_codes' => $s->track_codes ?? $s->target_tracks ?? [],
                    'module_code' => $s->module_code,
                    'status' => $s->status,
                    'status_label' => $s->status_label,
                    'attendance_setting' => $s->attendance_setting ?? 'check_in',
                    'session_type_code' => $s->session_type_code,
                    'is_attendance_open' => $s->isAttendanceActive(),
                    'attendance_open_at' => $s->attendance_open_at?->format('H:i, d M Y'),
                    'attendance_close_at' => $s->attendance_close_at?->format('H:i, d M Y'),
                    'qr_token' => $s->qr_token,
                    'qr_short_code' => $s->qr_short_code,
                    'material_id' => $s->material_id,
                    'material_title' => $s->material?->title,
                    'material_slug' => $s->material?->slug,
                    'learning_module_id' => $s->learning_module_id,
                    'event_module_id' => $s->event_module_id,
                    'event_module_title' => $s->module?->title,
                    'learning_module_title' => $s->learningModule?->title,
                    'learning_module_code' => $s->learningModule?->code,
                    'cbt_exam_package_id' => $s->cbt_exam_package_id,
                    'cbt_package_title' => $s->cbtPackage?->title,
                    'cbt_package_code' => $s->cbtPackage?->code,
                    'requires_attendance_before_cbt' => (bool) $s->requires_attendance_before_cbt,
                    'attendances_count' => $s->attendances_count,
                    'session_type' => $s->session_type_code === 'KEHADIRAN_HARIAN' ? [
                        'id' => null,
                        'code' => 'KEHADIRAN_HARIAN',
                        'name' => 'Kehadiran Harian',
                        'badge_color' => 'bg-blue-100 text-blue-800',
                    ] : ($s->sessionType ? [
                        'id' => $s->sessionType->id,
                        'code' => $s->sessionType->code,
                        'name' => $s->sessionType->name,
                        'badge_color' => $s->sessionType->badge_color,
                    ] : null),
                    'speaker' => $s->speaker ? [
                        'id' => $s->speaker->id,
                        'name' => $s->speaker->full_name_with_title,
                        'type' => $s->speaker->type,
                        'dan_level' => $s->speaker->dan_level,
                        'role_info' => $s->speaker->role_info,
                    ] : null,
                ]),
            ]);

        // Speakers mapped
        $speakers = Speaker::with('user:id,name,email,role')
            ->where(function ($q) use ($event) {
                $q->whereNull('event_id')->orWhere('event_id', $event->id);
            })
            ->orderBy('type')->orderBy('name')->get()->map(fn (Speaker $s) => [
                'id' => $s->id,
                'name' => $s->full_name_with_title,
                'raw_name' => $s->name,
                'type' => $s->type,
                'type_label' => $s->type_label,
                'dan_level' => $s->dan_level,
                'dan_roman' => $s->dan_roman,
                'dan_rank' => $s->dan_rank,
                'role_info' => $s->role_info,
                'primary_expertise' => $s->primary_expertise,
                'bio' => $s->bio,
                'is_active' => $s->is_active,
                'is_supervisor' => (bool) $s->is_supervisor,
                'is_supervisor_label' => $s->is_supervisor ? 'Supervisor' : 'Reguler',
                'contact_email' => $s->contact_email,
                'contact_phone' => $s->contact_phone,
                'user_id' => $s->user_id,
                'has_account' => (bool) ($s->user_id || ($s->contact_email && User::where('email', $s->contact_email)->exists())),
                'user_email' => $s->user?->email ?? $s->contact_email,
                'user_name' => $s->user?->name,
                'event_id' => $s->event_id,
                'modules_count' => $event->modules->where('speaker_id', $s->id)->count(),
                'sessions_count' => $event->sessions->where('speaker_id', $s->id)->count(),
                'total_jp' => $event->sessions->where('speaker_id', $s->id)->sum('duration_jp'),
            ]);

        // Participants mapped
        $participants = $event->eventParticipants->map(fn (EventParticipant $ep) => [
            'id' => $ep->id,
            'participant_id' => $ep->participant_id,
            'name' => $ep->participant?->name ?? '-',
            'email' => $ep->participant?->email ?? '-',
            'kenshi_id' => $ep->participant?->kenshi_id ?? '-',
            'phone' => $ep->participant?->phone ?? '-',
            'origin' => $ep->participant?->origin ?? '-',
            'dan_level' => $ep->participant?->dan_level,
            'dan_roman' => $ep->participant?->dan_roman ?? '-',
            'track_code' => $ep->track?->code ?? '-',
            'track_name' => $ep->track?->name ?? '-',
            'document_variants' => $this->documentVariants($event, $ep),
            'track_badge' => $ep->track?->badge_color ?? 'bg-slate-100 text-slate-700',
            'is_dual_track' => $ep->track?->is_dual_track ?? false,
            'rotation_group' => $ep->rotation_group,
            'admin_status' => $ep->admin_status,
            'attendance_status' => $ep->attendance_status,
            'attendance_by_day' => $ep->attendance_by_day ?? [],
            'theory_score' => $ep->theory_score,
            'practice_score' => $ep->practice_score,
            'final_grade' => $ep->final_grade,
            'graduation_status' => $ep->graduation_status,
            'certificate_number' => $ep->certificate_number,
            'suggested_certificate_number' => $this->documentGenerator->suggestedNumber($event, $ep, 'certificate'),
            'configured_certificate_number' => $this->documentGenerator->configuredNumber($event, $ep, 'certificate'),
            'has_certificate_file' => (bool) $ep->certificate_file_path,
            'certificate_download_url' => $ep->certificate_file_path
                ? route('admin.event.certificate.download', [$event, $ep]) : null,
            'can_generate_certificate' => EventDocumentGenerator::supportsForEvent($event, 'certificate', EventDocumentGenerator::documentTracks($ep->track_code)[0] ?? null),
            'certificate_generation_unavailable_reason' => EventDocumentGenerator::generationUnavailableReason($event, 'certificate', EventDocumentGenerator::documentTracks($ep->track_code)[0] ?? null),
            'transcript_number' => $ep->transcript_number,
            'suggested_transcript_number' => $this->documentGenerator->suggestedNumber($event, $ep, 'transcript'),
            'configured_transcript_number' => $this->documentGenerator->configuredNumber($event, $ep, 'transcript'),
            'has_transcript_file' => (bool) $ep->transcript_file_path,
            'transcript_download_url' => $ep->transcript_file_path
                ? route('admin.event.transcript.download', [$event, $ep]) : null,
            'can_generate_transcript' => EventDocumentGenerator::supportsForEvent($event, 'transcript', EventDocumentGenerator::documentTracks($ep->track_code)[0] ?? null),
            'transcript_generation_unavailable_reason' => EventDocumentGenerator::generationUnavailableReason($event, 'transcript', EventDocumentGenerator::documentTracks($ep->track_code)[0] ?? null),
            'has_seen_welcome' => $ep->has_seen_welcome,
            'checked_in_at' => $ep->checked_in_at?->format('H:i, d M Y'),
            'checkin_status' => $ep->checkin_status ?? ($ep->checked_in_at ? 'checked_in' : 'registered'),
            'checkin_method' => $ep->checkin_method,
            'notes' => $ep->notes,
            'has_registration_form' => (bool) $ep->registrationForm,
            'registration_form_id' => $ep->registrationForm?->id,
            'registration_form_status' => $ep->registrationForm?->status ?? 'unfilled',
            'registration_form_type' => $ep->registrationForm?->form_type,
            'registration_form_level' => $ep->registrationForm?->penataran_level,
            'registration_form_submitted_at' => $ep->registrationForm?->submitted_at?->format('d M Y, H:i'),
            'registration_form_verified_at' => $ep->registrationForm?->verified_at?->format('d M Y, H:i'),
            'registration_form_verified_by' => $ep->registrationForm?->verifier?->name,
            'registration_form_print_url' => $ep->registrationForm
                ? route('event.registration-form.print', [$event->slug, $ep->participant_id])
                : null,
        ]);

        // Load attendances for event
        $attendances = EventAttendance::where('event_id', $event->id)
            ->with(['session', 'participant', 'recorder'])
            ->latest('checked_in_at')
            ->get()
            ->map(fn ($att) => [
                'id' => $att->id,
                'session_id' => $att->event_session_id,
                'session_topic' => $att->session?->topic ?? 'Sesi',
                'session_number' => $att->session?->session_number ?? '-',
                'day_number' => $att->session?->day_number ?? 1,
                'participant_id' => $att->participant_id,
                'participant_name' => $att->participant?->name ?? '-',
                'participant_kenshi_id' => $att->participant?->kenshi_id,
                'attendance_type' => $att->attendance_type,
                'status' => $att->status,
                'status_label' => $att->status_label,
                'status_badge' => $att->status_badge,
                'checked_in_at' => $att->checked_in_at?->format('H:i, d M Y'),
                'checked_in_at_raw' => $att->checked_in_at?->format('Y-m-d\TH:i'),
                'method' => $att->method,
                'recorded_by' => $att->recorder?->name ?? 'Sistem',
                'notes' => $att->notes,
            ]);

        // Load CBT packages for event
        $cbtPackages = CbtExamPackage::where('event_id', $event->id)
            ->with(['questionModule:id,title', 'attempts.participant'])
            ->withCount([
                'questions',
                'bankQuestions as active_bank_questions_count' => fn ($query) => $query->where('status', 'active'),
            ])
            ->get()
            ->map(fn ($pkg) => [
                'id' => $pkg->id,
                'title' => $pkg->title,
                'code' => $pkg->code,
                'description' => $pkg->description,
                'exam_type' => $pkg->exam_type,
                'exam_type_label' => $pkg->exam_type_label,
                'question_module_title' => $pkg->questionModule?->title,
                'duration_minutes' => $pkg->duration_minutes,
                'passing_score' => (float) $pkg->passing_score,
                'attempts_allowed' => $pkg->attempts_allowed,
                'revision_method' => $pkg->revision_method,
                'revision_deadline' => $pkg->revision_deadline?->format('Y-m-d H:i'),
                'status' => $pkg->status,
                'status_label' => $pkg->status_label,
                'status_badge' => $pkg->status_badge,
                'instructions' => $pkg->instructions,
                'randomize_questions' => (bool) $pkg->randomize_questions,
                'randomize_answers' => (bool) $pkg->randomize_answers,
                'result_display' => $pkg->result_display,
                'questions_count' => $pkg->questions_count > 0 ? $pkg->questions_count : $pkg->active_bank_questions_count,
                'attempts_count' => $pkg->attempts->count(),
                'passed_count' => $pkg->attempts->where('is_passed', true)->count(),
                'avg_score' => round((float) ($pkg->attempts->where('status', 'submitted')->avg('total_score') ?? 0), 1),
                'attempts' => $pkg->attempts->map(fn ($at) => [
                    'id' => $at->id,
                    'participant_name' => $at->participant?->name ?? '-',
                    'score' => (float) $at->total_score,
                    'is_passed' => (bool) $at->is_passed,
                    'status' => $at->status,
                    'submitted_at' => $at->submitted_at?->format('H:i, d M Y'),
                ]),
            ]);

        // Master Modul Pembelajaran & CBT packages attached to event
        $learningModules = $event->learningModules()
            ->with(['materials'])
            ->get()
            ->map(fn (LearningModule $lm) => [
                'id' => $lm->id,
                'code' => $lm->code,
                'title' => $lm->title,
                'category' => $lm->category,
                'level' => $lm->level,
                'total_jp' => $lm->total_jp,
                'status' => $lm->status,
                'participant_path_id' => $lm->pivot->participant_path_id,
                'is_required' => (bool) $lm->pivot->is_required,
                'sort_order' => $lm->pivot->sort_order,
                'availability_start_at' => $lm->pivot->availability_start_at ? Carbon::parse($lm->pivot->availability_start_at)->format('Y-m-d H:i') : null,
                'availability_end_at' => $lm->pivot->availability_end_at ? Carbon::parse($lm->pivot->availability_end_at)->format('Y-m-d H:i') : null,
                'materials_count' => $lm->materials->count(),
                'materials' => $lm->materials->map(fn ($m) => [
                    'id' => $m->id,
                    'title' => $m->title,
                    'code' => $m->code,
                    'slug' => $m->slug,
                    'type' => $m->type,
                    'sort_order' => $m->pivot->sort_order,
                    'is_required' => (bool) $m->pivot->is_required,
                    'instructor_notes' => $m->pivot->instructor_notes,
                    'estimated_duration_minutes' => $m->pivot->estimated_duration_minutes,
                ]),
            ]);

        $linkedCbtPackages = $event->linkedCbtPackages()
            ->withCount('bankQuestions')
            ->get()
            ->map(fn (CbtExamPackage $pkg) => [
                'id' => $pkg->id,
                'title' => $pkg->title,
                'code' => $pkg->code,
                'exam_type' => $pkg->exam_type,
                'exam_type_label' => $pkg->exam_type_label,
                'duration_minutes' => $pkg->duration_minutes,
                'passing_score' => (float) $pkg->passing_score,
                'status' => $pkg->status,
                'participant_path_id' => $pkg->pivot->participant_path_id,
                'is_required' => (bool) $pkg->pivot->is_required,
                'sort_order' => $pkg->pivot->sort_order,
                'requires_attendance_session_id' => $pkg->pivot->requires_attendance_session_id,
                'availability_start_at' => $pkg->pivot->availability_start_at ? Carbon::parse($pkg->pivot->availability_start_at)->format('Y-m-d H:i') : null,
                'availability_end_at' => $pkg->pivot->availability_end_at ? Carbon::parse($pkg->pivot->availability_end_at)->format('Y-m-d H:i') : null,
                'questions_count' => $pkg->bank_questions_count,
            ]);

        $examRevisions = CbtExamAttempt::where('event_id', $event->id)
            ->whereNotNull('revision_file_path')
            ->with(['participant:id,name', 'package:id,title'])
            ->latest('revision_submitted_at')
            ->get()
            ->map(fn (CbtExamAttempt $attempt) => [
                'id' => $attempt->id,
                'participant_name' => $attempt->participant?->name ?? 'Peserta dihapus',
                'package_title' => $attempt->package?->title ?? 'Paket dihapus',
                'score' => $attempt->total_score,
                'status' => $attempt->revision_status,
                'submitted_at' => $attempt->revision_submitted_at?->format('d M Y, H:i'),
                'download_url' => route('admin.event.revision.download', [$event->id, $attempt->id]),
            ]);

        $learningModulesQuery = LearningModule::with('materials')
            ->where('status', 'active')
            ->availableForEvent($event->id)
            ->orderBy('code')
            ->get();

        $availableMasterModules = $learningModulesQuery->map(fn (LearningModule $m) => [
            'id' => $m->id,
            'code' => $m->code,
            'title' => $m->title,
            'category' => $m->category,
            'total_jp' => $m->total_jp,
            'event_id' => $m->event_id,
            'is_master' => $m->isMaster(),
            'scope_label' => $m->isMaster() ? 'Master Diktar' : 'Khusus Event Ini',
            'materials' => $m->materials->map(fn ($mat) => [
                'id' => $mat->id,
                'title' => $mat->title,
                'code' => $mat->code,
                'type' => $mat->type,
                'slug' => $mat->slug,
            ]),
        ]);

        $legacyEventModules = $event->modules->map(fn (EventModule $em) => [
            'id' => 'legacy_'.$em->id,
            'legacy_id' => $em->id,
            'code' => $em->code,
            'title' => $em->title,
            'category' => 'Modul Event',
            'total_jp' => $em->jp,
            'event_id' => $em->event_id,
            'is_master' => false,
            'is_legacy_event_module' => true,
            'scope_label' => 'Khusus Event Ini',
            'materials' => $em->material ? [[
                'id' => $em->material->id,
                'title' => $em->material->title,
                'code' => $em->material->code,
                'type' => $em->material->type,
                'slug' => $em->material->slug,
            ]] : [],
        ]);

        $availableMasterModules = $availableMasterModules->concat($legacyEventModules)->values();

        $availableMasterCbtPackages = CbtExamPackage::orderBy('code')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'code' => $p->code,
                'title' => $p->title,
                'exam_type' => $p->exam_type,
                'exam_type_label' => $p->exam_type_label,
                'duration_minutes' => $p->duration_minutes,
                'status' => $p->status,
            ]);

        // Master tracks & session types & legends
        $tracks = ParticipantTrack::where(function ($query) use ($event) {
            $query->whereNull('event_id')->orWhere('event_id', $event->id);
        })->orderBy('id')->get();
        $sessionTypes = EventSessionType::orderBy('id')->get();
        $legends = EventLegend::whereNull('event_id')->orWhere('event_id', $event->id)
            ->orderBy('category')->orderBy('acronym')->get();
        $publishedMaterials = Material::where('status', 'published')
            ->select('id', 'title', 'code', 'slug', 'type')
            ->get();

        // Registration forms for participants
        $registrationFormsByParticipant = EventRegistrationForm::with(['participant', 'verifier'])
            ->where('event_id', $event->id)
            ->get()
            ->keyBy('participant_id');

        $registrationFormsPayload = $event->eventParticipants->map(function (EventParticipant $ep) use ($registrationFormsByParticipant, $event) {
            /** @var EventRegistrationForm|null $rf */
            $rf = $registrationFormsByParticipant->get($ep->participant_id);
            $resolvedForm = EventRegistrationFormController::resolveFormType($rf?->form_type ?? $ep->track?->code);

            return [
                'id' => $rf?->id,
                'participant_id' => $ep->participant_id,
                'event_participant_id' => $ep->id,
                'participant_name' => $ep->participant?->name ?? '-',
                'kenshi_id_number' => $ep->participant?->kenshi_id_number ?? $ep->participant?->kenshi_id ?? '-',
                'dan_level' => $rf?->dan_level ?? $ep->participant?->dan_rank ?? $ep->participant?->dan_level ?? '-',
                'origin_dojo' => $ep->participant?->origin_dojo ?? $ep->participant?->origin ?? '-',
                'origin_province' => $ep->participant?->origin_province ?? '-',
                'track_code' => $ep->track?->code ?? '-',
                'track_name' => $ep->track?->name ?? '-',
                'form_type' => $rf?->form_type ?? $resolvedForm['form_type'],
                'penataran_level' => $rf?->penataran_level ?? $resolvedForm['penataran_level'],
                'lampiran_label' => $resolvedForm['lampiran_label'],
                'waiver_lampiran_label' => $resolvedForm['waiver_lampiran_label'],
                'photo_requirements' => $resolvedForm['photo_requirements'],
                'start_date' => $rf?->start_date?->format('d F Y') ?? $event->start_date?->format('d F Y'),
                'end_date' => $rf?->end_date?->format('d F Y') ?? $event->end_date?->format('d F Y'),
                'location' => $rf?->location ?? $event->place,
                'full_name' => $rf?->full_name ?? $ep->participant?->name,
                'birth_place' => $rf?->birth_place ?? $ep->participant?->origin_city,
                'birth_date' => $rf?->birth_date?->format('d F Y'),
                'home_address' => $rf?->home_address,
                'phone_number' => $rf?->phone_number ?? $ep->participant?->phone,
                'email' => $rf?->email ?? $ep->participant?->email,
                'occupation' => $rf?->occupation,
                'occupation_address' => $rf?->occupation_address,
                'occupation_phone' => $rf?->occupation_phone,
                'emergency_address' => $rf?->emergency_address,
                'emergency_phone' => $rf?->emergency_phone,
                'gasnas_records' => $rf?->gasnas_records ?? [],
                'certificate_records' => $rf?->certificate_records ?? [],
                'sign_place' => $rf?->sign_place ?? 'Mojokerto',
                'sign_date' => $rf?->sign_date?->format('d F Y'),
                'applicant_name' => $rf?->applicant_name ?? $ep->participant?->name,
                'signature_data' => $rf?->signature_data,
                'file_path' => $rf?->file_path,
                'file_url' => $rf?->file_url,
                'file_name' => $rf?->original_file_name ?? ($rf?->file_path ? basename($rf->file_path) : null),
                'file_size_formatted' => $rf?->file_size_formatted,
                'submission_mode' => $rf?->submission_mode ?? ($rf?->file_path ? 'upload' : 'online'),
                'waiver_agreed' => (bool) ($rf?->waiver_agreed ?? false),
                'status' => $rf?->status ?? 'unfilled',
                'submitted_at' => $rf?->submitted_at?->format('d M Y, H:i'),
                'verified_at' => $rf?->verified_at?->format('d M Y, H:i'),
                'verified_by_name' => $rf?->verifier?->name ?? ($rf?->status === 'verified' ? 'Budi Santoso' : null),
                'print_url' => $rf ? route('event.registration-form.print', [$event->slug, $ep->participant_id]) : null,
            ];
        });

        // Integrity pacts for participants
        $integrityPactsByParticipant = EventIntegrityPact::with(['participant', 'verifier'])
            ->where('event_id', $event->id)
            ->get()
            ->keyBy('participant_id');

        $integrityPactsPayload = $event->eventParticipants->map(function (EventParticipant $ep) use ($integrityPactsByParticipant, $event) {
            /** @var EventIntegrityPact|null $pact */
            $pact = $integrityPactsByParticipant->get($ep->participant_id);
            $pactType = $pact?->pact_type ?? EventIntegrityPactController::resolvePactType($ep->track?->code);

            return [
                'id' => $pact?->id,
                'participant_id' => $ep->participant_id,
                'event_participant_id' => $ep->id,
                'participant_name' => $ep->participant?->name ?? '-',
                'kenshi_id_number' => $ep->participant?->kenshi_id_number ?? $ep->participant?->kenshi_id ?? '-',
                'dan_level' => $pact?->dan_level ?? $ep->participant?->dan_rank ?? $ep->participant?->dan_level ?? '-',
                'origin_dojo' => $ep->participant?->origin_dojo ?? $ep->participant?->origin ?? '-',
                'origin_province' => $ep->participant?->origin_province ?? '-',
                'track_code' => $ep->track?->code ?? '-',
                'track_name' => $ep->track?->name ?? '-',
                'pact_type' => $pactType,
                'full_name' => $pact?->full_name ?? $ep->participant?->name,
                'birth_place' => $pact?->birth_place ?? $ep->participant?->origin_city,
                'birth_date' => $pact?->birth_date?->format('d F Y'),
                'certificate_number' => $pact?->certificate_number ?? $ep->certificate_number ?? '-',
                'valid_start_date' => $pact?->valid_start_date?->format('d F Y') ?? $event->end_date?->format('d F Y'),
                'valid_end_date' => $pact?->valid_end_date?->format('d F Y'),
                'id_card_address' => $pact?->id_card_address ?? $ep->participant?->address,
                'current_address' => $pact?->current_address ?? $ep->participant?->address,
                'management_organization' => $pact?->management_organization ?? '-',
                'management_position' => $pact?->management_position ?? '-',
                'sign_place' => $pact?->sign_place ?? 'Mojokerto',
                'sign_date' => $pact?->sign_date?->format('d F Y') ?? now()->format('d F Y'),
                'signature_data' => $pact?->signature_data,
                'file_path' => $pact?->file_path,
                'file_url' => $pact?->file_url,
                'file_name' => $pact?->original_file_name ?? ($pact?->file_path ? basename($pact->file_path) : null),
                'file_size_formatted' => $pact?->file_size_formatted,
                'submission_mode' => $pact?->submission_mode ?? ($pact?->file_path ? 'upload' : ($pact?->signature_data ? 'online' : null)),
                'status' => $pact?->status ?? 'unfilled',
                'signed_at' => $pact?->signed_at?->format('d M Y, H:i'),
                'verified_at' => $pact?->verified_at?->format('d M Y, H:i'),
                'verified_by_name' => $pact?->verifier?->name ?? ($pact?->status === 'verified' ? 'Budi Santoso' : null),
                'print_url' => route('admin.event.integrity-pact.admin-print', [$event->id, $ep->participant_id]),
            ];
        });

        // All CBT Exam attempts for this event
        $examAttemptsPayload = CbtExamAttempt::with(['participant.eventParticipants.track', 'package', 'session'])
            ->where('event_id', $event->id)
            ->orderByDesc('submitted_at')
            ->orderByDesc('id')
            ->get()
            ->map(function (CbtExamAttempt $attempt) use ($event) {
                $ep = $attempt->participant?->eventParticipants->firstWhere('event_id', $event->id);

                return [
                    'id' => $attempt->id,
                    'participant_id' => $attempt->participant_id,
                    'participant_name' => $attempt->participant?->name ?? 'Peserta dihapus',
                    'kenshi_id_number' => $attempt->participant?->kenshi_id_number ?? '-',
                    'origin_dojo' => $attempt->participant?->origin_dojo ?? '-',
                    'track_name' => $ep?->track?->name ?? '-',
                    'package_id' => $attempt->cbt_exam_package_id,
                    'package_title' => $attempt->package?->title ?? 'Paket Ujian',
                    'package_code' => $attempt->package?->code ?? '-',
                    'exam_type' => $attempt->package?->exam_type ?? 'exam',
                    'exam_type_label' => $attempt->package?->exam_type_label ?? 'Ujian',
                    'attempt_number' => $attempt->attempt_number,
                    'score' => $attempt->total_score !== null ? (float) $attempt->total_score : 0.0,
                    'passing_score' => (float) ($attempt->package?->passing_score ?? 70),
                    'is_passed' => (bool) $attempt->is_passed,
                    'status' => $attempt->status,
                    'started_at' => $attempt->started_at?->format('d M Y, H:i'),
                    'submitted_at' => $attempt->submitted_at?->format('d M Y, H:i'),
                    'duration_minutes' => ($attempt->started_at && $attempt->submitted_at) ? $attempt->started_at->diffInMinutes($attempt->submitted_at) : null,
                    'total_answered' => is_array($attempt->answers) ? count($attempt->answers) : 0,
                ];
            });

        // Calculate stats
        $stats = [
            'total_participants' => $event->eventParticipants->count(),
            'verified_participants' => $event->eventParticipants->where('admin_status', 'verified')->count(),
            'checked_in_participants' => $event->eventParticipants->whereNotNull('checked_in_at')->count(),
            'total_registration_forms' => $event->eventParticipants->count(),
            'submitted_registration_forms' => $registrationFormsPayload->where('status', 'submitted')->count(),
            'verified_registration_forms' => $registrationFormsPayload->where('status', 'verified')->count(),
            'unfilled_registration_forms' => $registrationFormsPayload->where('status', 'unfilled')->count(),
            'total_integrity_pacts' => $event->eventParticipants->count(),
            'signed_integrity_pacts' => $integrityPactsPayload->whereIn('status', ['signed', 'verified'])->count(),
            'verified_integrity_pacts' => $integrityPactsPayload->where('status', 'verified')->count(),
            'unfilled_integrity_pacts' => $integrityPactsPayload->where('status', 'unfilled')->count(),
            'total_exam_attempts' => $examAttemptsPayload->count(),
            'passed_exam_attempts' => $examAttemptsPayload->where('is_passed', true)->count(),
            'failed_exam_attempts' => $examAttemptsPayload->where('is_passed', false)->count(),
            'dual_participants' => $event->eventParticipants->filter(fn ($p) => $p->track?->is_dual_track)->count(),
            'rotation_a1' => $event->eventParticipants->where('rotation_group', 'A1')->count(),
            'rotation_a2' => $event->eventParticipants->where('rotation_group', 'A2')->count(),
            'total_modules' => $event->modules->count(),
            'total_sessions' => $event->sessions
                ->whereNotIn('session_type_code', ['KEHADIRAN_AWAL', 'KEHADIRAN_HARIAN'])
                ->filter(fn (EventSession $session) => $session->day_number >= 1 && $session->day_number <= $event->total_days)
                ->count(),
            'total_speakers' => $speakers->filter(fn (array $speaker) => $speaker['event_id'] === $event->id || $speaker['sessions_count'] > 0 || $speaker['modules_count'] > 0)->count(),
            'total_effective_jp' => $event->total_effective_jp,
            'total_schedule_jp' => $event->total_schedule_jp,
            'published_modules' => $event->modules->where('publication_status', 'published')->count(),
            'total_attendances' => $attendances->count(),
            'present_attendances' => $attendances->where('status', 'present')->count(),
            'cbt_packages_count' => $cbtPackages->count(),
            'cbt_attempts_count' => $cbtPackages->sum('attempts_count'),
            'certificate_files_count' => $event->eventParticipants->whereNotNull('certificate_file_path')->count()
                + $event->eventParticipants->whereNotNull('secondary_certificate_file_path')->count(),
            'transcript_files_count' => $event->eventParticipants->whereNotNull('transcript_file_path')->count()
                + $event->eventParticipants->whereNotNull('secondary_transcript_file_path')->count(),
            'complete_document_sets_count' => $event->eventParticipants
                ->filter(fn (EventParticipant $participant) => $participant->certificate_file_path && $participant->transcript_file_path)
                ->count()
                + $event->eventParticipants
                    ->filter(fn (EventParticipant $participant) => $participant->secondary_certificate_file_path && $participant->secondary_transcript_file_path)
                    ->count(),
            'proctoring_events_count' => CbtProctoringEvent::where('event_id', $event->id)->count(),
        ];

        return [
            'documentNumberLabels' => EventDocumentGenerator::NUMBER_LABELS,
            'documentNumberDefaults' => $this->documentGenerator->adminNumberSettings(),
            'documentNumberOverrides' => $event->document_number_settings ?? [],
            'certificateSignatureSettings' => $this->documentGenerator->effectiveSignatureSettings($event),
            'certificateSignatureDefaults' => $this->documentGenerator->adminSignatureSettings(),
            'event' => [
                'id' => $event->id,
                'name' => $event->name,
                'slug' => $event->slug,
                'description' => $event->description,
                'start_date' => $event->start_date?->format('Y-m-d'),
                'end_date' => $event->end_date?->format('Y-m-d'),
                'date_formatted' => $event->date_formatted,
                'place' => $event->place,
                'organizer' => $event->organizer,
                'responsible_user' => $event->responsibleUser ? [
                    'id' => $event->responsibleUser->id,
                    'name' => $event->responsibleUser->name,
                    'email' => $event->responsibleUser->email,
                ] : null,
                'duration_days' => $event->duration_days,
                'total_effective_jp' => $event->total_effective_jp,
                'total_schedule_jp' => $event->total_schedule_jp,
                'jp_duration_minutes' => $event->jp_duration_minutes,
                'learning_method' => $event->learning_method,
                'participant_quota' => $event->participant_quota,
                'status' => $event->status,
                'status_label' => $event->status_label,
                'status_color' => $event->status_color,
                'cover_image' => $event->cover_image ?? $event->banner_path,
                'banner_image' => $event->banner_image ?? $event->banner_path,
                'banner_path' => $event->banner_path,
                'rundown_doc_path' => $event->rundown_doc_path,
                'facilities_checklist' => $event->facilities_checklist ?? [],
                'requirements_checklist' => $event->requirements_checklist ?? [],
                'access_roles' => $event->access_roles ?? ['Pelatih', 'Penguji', 'Wasit'],
                'total_days' => $event->total_days,
            ],
            'modules' => $event->modules->map(fn (EventModule $m) => [
                'id' => $m->id,
                'code' => $m->code,
                'title' => $m->title,
                'target_tracks' => $m->track_codes ?? [],
                'duration_jp' => $m->jp,
                'delivery_method' => $m->fulfillment_method,
                'description' => $m->description,
                'learning_indicators' => $m->learning_indicators,
                'publication_status' => $m->publication_status,
                'source_type' => $m->source_type,
                'source_url' => $m->source_url,
                'has_source_file' => (bool) $m->source_file_path,
                'speaker' => $m->speaker ? [
                    'id' => $m->speaker->id,
                    'name' => $m->speaker->full_name_with_title,
                    'type' => $m->speaker->type,
                ] : null,
                'material' => $m->material ? [
                    'id' => $m->material->id,
                    'title' => $m->material->title,
                    'code' => $m->material->code,
                    'slug' => $m->material->slug,
                    'type' => $m->material->type,
                ] : null,
            ]),
            'learningModules' => $learningModules,
            'linkedCbtPackages' => $linkedCbtPackages,
            'availableMasterModules' => $availableMasterModules,
            'availableMasterCbtPackages' => $availableMasterCbtPackages,
            'availableQuestionModules' => QuestionModule::where('status', 'active')->orderBy('title')->get(['id', 'title', 'code']),
            'sessionsByDay' => $sessionsByDay,
            'arrivalSession' => $arrivalSession ? [
                'id' => $arrivalSession->id,
                'topic' => $arrivalSession->topic,
                'is_attendance_open' => $arrivalSession->isAttendanceActive(),
                'qr_short_code' => $arrivalSession->qr_short_code,
                'attendances_count' => $arrivalSession->attendances_count,
            ] : null,
            'proctoringEvents' => $proctoringEvents,
            'speakers' => $speakers,
            'rooms' => $event->rooms->map(fn (EventRoom $room) => [
                'id' => $room->id,
                'name' => $room->name,
                'sessions_count' => $room->sessions_count,
            ]),
            'participants' => $participants,
            'registrationForms' => $registrationFormsPayload,
            'integrityPacts' => $integrityPactsPayload,
            'examAttempts' => $examAttemptsPayload,
            'availableParticipants' => Participant::query()
                ->whereDoesntHave('eventParticipants', fn ($query) => $query->where('event_id', $event->id))
                ->orderBy('name')
                ->get(['id', 'name', 'kenshi_id_number']),
            'attendances' => $attendances,
            'cbtPackages' => $cbtPackages,
            'examRevisions' => $examRevisions,
            'tracks' => $tracks,
            'sessionTypes' => $sessionTypes,
            'legends' => $legends,
            'publishedMaterials' => $publishedMaterials,
            'stats' => $stats,
        ];

    }

    /** @return array<int, array<string, mixed>> */
    private function documentVariants(Event $event, EventParticipant $enrollment): array
    {
        $variants = [];

        foreach (EventDocumentGenerator::documentTracks($enrollment->track_code) as $trackCode) {
            $certificateNumberField = EventDocumentGenerator::documentField('certificate', 'number', $enrollment->track_code, $trackCode);
            $certificatePathField = EventDocumentGenerator::documentField('certificate', 'file_path', $enrollment->track_code, $trackCode);
            $transcriptNumberField = EventDocumentGenerator::documentField('transcript', 'number', $enrollment->track_code, $trackCode);
            $transcriptPathField = EventDocumentGenerator::documentField('transcript', 'file_path', $enrollment->track_code, $trackCode);

            $variants[] = [
                'track_code' => $trackCode,
                'label' => str_replace('Sertifikat ', '', EventDocumentGenerator::NUMBER_LABELS[$trackCode] ?? $trackCode),
                'certificate_number' => $enrollment->{$certificateNumberField},
                'suggested_certificate_number' => $this->documentGenerator->suggestedNumber($event, $enrollment, 'certificate', $trackCode),
                'configured_certificate_number' => $this->documentGenerator->configuredNumber($event, $enrollment, 'certificate', $trackCode),
                'certificate_download_url' => $enrollment->{$certificatePathField}
                    ? route('admin.event.certificate.download', [$event, $enrollment, 'document_track' => $trackCode]) : null,
                'certificate_preview_url' => $enrollment->{$certificatePathField}
                    ? route('admin.event.certificate.preview', [$event, $enrollment, 'document_track' => $trackCode]) : null,
                'can_generate_certificate' => EventDocumentGenerator::supportsForEvent($event, 'certificate', $trackCode),
                'certificate_generation_unavailable_reason' => EventDocumentGenerator::generationUnavailableReason($event, 'certificate', $trackCode),
                'transcript_number' => $enrollment->{$transcriptNumberField},
                'suggested_transcript_number' => $this->documentGenerator->suggestedNumber($event, $enrollment, 'transcript', $trackCode),
                'configured_transcript_number' => $this->documentGenerator->configuredNumber($event, $enrollment, 'transcript', $trackCode),
                'transcript_download_url' => $enrollment->{$transcriptPathField}
                    ? route('admin.event.transcript.download', [$event, $enrollment, 'document_track' => $trackCode]) : null,
                'transcript_preview_url' => $enrollment->{$transcriptPathField}
                    ? route('admin.event.transcript.preview', [$event, $enrollment, 'document_track' => $trackCode]) : null,
                'can_generate_transcript' => EventDocumentGenerator::supportsForEvent($event, 'transcript', $trackCode),
                'transcript_generation_unavailable_reason' => EventDocumentGenerator::generationUnavailableReason($event, 'transcript', $trackCode),
            ];
        }

        return $variants;
    }
}
