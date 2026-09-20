<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Events\SaveEvent;
use App\Actions\Events\SaveEventSession;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveEventSessionRequest;
use App\Http\Requests\Admin\StoreEventParticipantRequest;
use App\Http\Requests\Admin\StoreEventRequest;
use App\Http\Requests\Admin\UpdateEventRequest;
use App\Models\CbtExamPackage;
use App\Models\Event;
use App\Models\EventLegend;
use App\Models\EventModule;
use App\Models\EventParticipant;
use App\Models\EventRoom;
use App\Models\EventSession;
use App\Models\LearningModule;
use App\Models\Participant;
use App\Models\ParticipantTrack;
use App\Models\Speaker;
use App\Models\User;
use App\Services\AdminEventDetailService;
use App\Services\EventAttendanceScheduleService;
use App\Services\MaterialSourceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class EventController extends Controller
{
    public function __construct(
        private readonly SaveEvent $saveEvent,
        private readonly SaveEventSession $saveEventSession,
        private readonly EventAttendanceScheduleService $attendanceSchedule,
        private readonly AdminEventDetailService $eventDetail,
    ) {}

    /**
     * Display a listing of events with search and filters.
     */
    public function index(Request $request): Response
    {
        $scope = Event::query()->when(
            $request->user()->role === 'Penyelenggara',
            fn ($query) => $query->where('responsible_user_id', $request->user()->id)
        );
        $query = (clone $scope)->withCount('participants')->latest('start_date');

        if ($request->filled('q')) {
            $search = trim((string) $request->input('q'));
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                    ->orWhere('location', 'ilike', "%{$search}%")
                    ->orWhere('organizer', 'ilike', "%{$search}%")
                    ->orWhere('description', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('year')) {
            $year = (int) $request->input('year');
            $query->whereYear('start_date', $year);
        }

        if ($request->filled('organizer')) {
            $query->where('organizer', 'ilike', '%'.trim((string) $request->input('organizer')).'%');
        }

        $events = $query->paginate(10)->withQueryString()->through(fn (Event $event) => [
            'id' => $event->id,
            'name' => $event->name,
            'slug' => $event->slug,
            'date_formatted' => $event->date_formatted,
            'start_date' => $event->start_date?->format('Y-m-d'),
            'end_date' => $event->end_date?->format('Y-m-d'),
            'place' => $event->place,
            'organizer' => $event->organizer,
            'duration_days' => $event->duration_days,
            'total_effective_jp' => $event->total_effective_jp,
            'total_schedule_jp' => $event->total_schedule_jp,
            'participants_count' => $event->participants_count,
            'participant_quota' => $event->participant_quota,
            'status' => $event->status,
            'status_label' => $event->status_label,
            'status_color' => $event->status_color,
            'cover_image' => $event->cover_image,
        ]);

        $eventStats = (clone $scope)->selectRaw(
            "COUNT(*) as total_events,
             SUM(CASE WHEN status IN ('ongoing', 'open_registration') THEN 1 ELSE 0 END) as active_events,
             COALESCE(SUM(total_effective_jp), 0) as total_jp_sum",
        )->firstOrFail();
        $stats = [
            'total_events' => (int) $eventStats->total_events,
            'active_events' => (int) $eventStats->active_events,
            'total_participants' => EventParticipant::whereIn('event_id', (clone $scope)->select('id'))->count(),
            'total_jp_sum' => (int) $eventStats->total_jp_sum,
        ];

        $years = (clone $scope)->whereNotNull('start_date')
            ->pluck('start_date')
            ->map(fn ($d) => (int) date('Y', strtotime((string) $d)))
            ->unique()
            ->sortDesc()
            ->values();

        return Inertia::render('Admin/Events/Index', [
            'events' => $events,
            'filters' => $request->only(['q', 'status', 'year', 'organizer']),
            'stats' => $stats,
            'availableYears' => $years,
            'canCreateEvent' => $request->user()->can('create', Event::class),
            'canDeleteEvent' => $request->user()->isAdmin() || $request->user()->role === 'Diktar',
        ]);
    }

    /**
     * Show the form for creating a new event.
     */
    public function create(Request $request): Response
    {
        $canAssignOrganizer = $request->user()->role !== 'Penyelenggara';

        return Inertia::render('Admin/Events/Create', [
            'organizers' => $canAssignOrganizer
                ? User::where('role', 'Penyelenggara')->orderBy('name')->get(['id', 'name', 'email'])
                : [],
            'canAssignOrganizer' => $canAssignOrganizer,
            'currentOrganizer' => $canAssignOrganizer ? null : $request->user()->only(['id', 'name', 'email']),
        ]);
    }

    /**
     * Store a newly created event.
     */
    public function store(StoreEventRequest $request): RedirectResponse
    {
        $event = $this->saveEvent->handle($request->validated(), $request->user());

        return redirect()->route('admin.event.show', $event->id)
            ->with('success', 'Event penataran berhasil dibuat.');
    }

    public function storeArrivalSession(Event $event): RedirectResponse
    {
        if ($event->sessions()->where('session_type_code', 'KEHADIRAN_AWAL')->exists()) {
            return back()->withErrors(['arrival' => 'QR kedatangan awal sudah disiapkan untuk event ini.']);
        }

        DB::transaction(fn () => $this->attendanceSchedule->ensureDefaultSessions($event));

        return back()->with('success', 'QR kedatangan awal dan kehadiran harian berhasil disiapkan. Buka absensi saat peserta mulai tiba.');
    }

    /**
     * Display the specified event with all 10 tabs loaded with real relations.
     */
    public function show(Event $event): Response
    {
        return Inertia::render('Admin/Events/Show', $this->eventDetail->data($event));
    }

    /**
     * Show the form for editing an event.
     */
    public function edit(Event $event): Response
    {
        return Inertia::render('Admin/Events/Edit', [
            'organizers' => User::where('role', 'Penyelenggara')->orderBy('name')->get(['id', 'name', 'email']),
            'canAssignOrganizer' => auth()->user()->role !== 'Penyelenggara',
            'event' => [
                'id' => $event->id,
                'name' => $event->name ?? $event->title,
                'title' => $event->title,
                'slug' => $event->slug,
                'description' => $event->description,
                'start_date' => $event->start_date?->format('Y-m-d') ?? ($event->start_date ? substr((string) $event->start_date, 0, 10) : ''),
                'end_date' => $event->end_date?->format('Y-m-d') ?? ($event->end_date ? substr((string) $event->end_date, 0, 10) : ''),
                'place' => $event->place ?? $event->location,
                'location' => $event->location,
                'organizer' => $event->organizer,
                'responsible_user_id' => $event->responsible_user_id,
                'duration_days' => $event->duration_days ?? $event->duration_text,
                'duration_text' => $event->duration_text,
                'total_effective_jp' => $event->total_effective_jp,
                'total_schedule_jp' => $event->total_schedule_jp,
                'jp_duration_minutes' => $event->jp_duration_minutes,
                'learning_method' => $event->learning_method,
                'participant_quota' => $event->participant_quota ?? $event->quota,
                'quota' => $event->quota,
                'status' => $event->status,
                'cover_image' => $event->cover_image ?? $event->banner_path,
                'banner_image' => $event->banner_image ?? $event->banner_path,
                'banner_path' => $event->banner_path,
                'facilities_checklist' => $event->facilities_checklist ?? [],
                'requirements_checklist' => $event->requirements_checklist ?? [],
            ],
        ]);
    }

    /**
     * Update the specified event.
     */
    public function update(UpdateEventRequest $request, Event $event): RedirectResponse
    {
        $this->saveEvent->handle($request->validated(), $request->user(), $event);

        return redirect()->route('admin.event.show', $event->id)
            ->with('success', 'Informasi event penataran berhasil diperbarui.');
    }

    /**
     * Delete the specified event.
     */
    public function destroy(Event $event): RedirectResponse
    {
        $event->delete();

        return redirect()->route('admin.event.index')
            ->with('success', 'Event penataran berhasil dihapus.');
    }

    /**
     * Add or update an event session.
     */
    public function storeSession(SaveEventSessionRequest $request, Event $event): RedirectResponse
    {
        $this->saveEventSession->handle($event, $request->validated());

        return back()->with('success', 'Sesi rundown berhasil ditambahkan.');
    }

    /**
     * Update an event session.
     */
    public function updateSession(
        SaveEventSessionRequest $request,
        Event $event,
        EventSession $session,
    ): RedirectResponse {
        $this->saveEventSession->handle($event, $request->validated(), $session);

        return back()->with('success', 'Sesi rundown berhasil diperbarui.');
    }

    /**
     * Delete an event session.
     */
    public function destroySession(Event $event, EventSession $session): RedirectResponse
    {
        abort_unless($session->event_id === $event->id, 404);
        abort_if($session->session_type_code === 'KEHADIRAN_AWAL', 403);
        $session->delete();

        return back()->with('success', 'Sesi rundown berhasil dihapus.');
    }

    public function storeRoom(Request $request, Event $event): RedirectResponse
    {
        $request->merge(['name' => trim((string) $request->input('name'))]);
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique('event_rooms')->where('event_id', $event->id)],
        ]);

        $event->rooms()->create(['name' => trim($validated['name'])]);

        return back()->with('success', 'Ruang event berhasil ditambahkan.');
    }

    public function destroyRoom(Event $event, EventRoom $room): RedirectResponse
    {
        abort_unless($room->event_id === $event->id, 404);
        if ($room->sessions()->exists()) {
            return back()->withErrors(['room' => 'Ruang masih digunakan oleh sesi rundown.']);
        }

        $room->delete();

        return back()->with('success', 'Ruang event berhasil dihapus.');
    }

    public function storeLegend(Request $request, Event $event): RedirectResponse
    {
        $validated = $request->validate([
            'acronym' => ['required', 'string', 'max:30'],
            'full_name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:30'],
            'description' => ['nullable', 'string'],
        ]);

        $event->legends()->create($validated);

        return back()->with('success', 'Singkatan event berhasil ditambahkan.');
    }

    public function destroyLegend(Event $event, EventLegend $legend): RedirectResponse
    {
        abort_unless($legend->event_id === $event->id, 404);
        $legend->delete();

        return back()->with('success', 'Singkatan event berhasil dihapus.');
    }

    public function storeSpeaker(Request $request, Event $event): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:internal,external'],
            'title_degree' => ['nullable', 'string', 'max:100'],
            'specialization' => ['nullable', 'string', 'max:255'],
        ]);

        $event->ownedSpeakers()->create([...$validated, 'is_active' => true]);

        return back()->with('success', 'Pemateri event berhasil ditambahkan.');
    }

    public function destroySpeaker(Event $event, Speaker $speaker): RedirectResponse
    {
        abort_unless($speaker->event_id === $event->id, 404);
        if ($speaker->sessions()->exists() || $speaker->modules()->exists()) {
            return back()->withErrors(['speaker' => 'Pemateri masih ditugaskan pada sesi atau modul event.']);
        }

        $speaker->delete();

        return back()->with('success', 'Pemateri event berhasil dihapus.');
    }

    public function storeRequirement(Request $request, Event $event): RedirectResponse
    {
        $validated = $request->validate([
            'item' => ['required', 'string', 'max:255'],
            'mandatory' => ['required', 'boolean'],
        ]);
        $requirements = $event->requirements_checklist ?? [];
        $requirements[] = $validated;
        $event->update(['requirements_checklist' => $requirements]);

        return back()->with('success', 'Persyaratan event berhasil ditambahkan.');
    }

    public function destroyRequirement(Event $event, int $index): RedirectResponse
    {
        $requirements = $event->requirements_checklist ?? [];
        abort_unless(array_key_exists($index, $requirements), 404);
        array_splice($requirements, $index, 1);
        $event->update(['requirements_checklist' => $requirements]);

        return back()->with('success', 'Persyaratan event berhasil dihapus.');
    }

    public function storeFacility(Request $request, Event $event): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'status' => ['required', 'in:ready,prepared,unavailable'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);
        $facilities = $event->facilities_checklist ?? [];
        $facilities[] = $validated;
        $event->update(['facilities_checklist' => $facilities]);

        return back()->with('success', 'Fasilitas event berhasil ditambahkan.');
    }

    public function destroyFacility(Event $event, int $index): RedirectResponse
    {
        $facilities = $event->facilities_checklist ?? [];
        abort_unless(array_key_exists($index, $facilities), 404);
        array_splice($facilities, $index, 1);
        $event->update(['facilities_checklist' => $facilities]);

        return back()->with('success', 'Fasilitas event berhasil dihapus.');
    }

    /**
     * Add an event curriculum module.
     */
    public function storeModule(Request $request, Event $event): RedirectResponse
    {
        $sourceType = $request->input('source_type', 'collection');
        $request->merge(['source_type' => $sourceType]);
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50'],
            'title' => ['required', 'string', 'max:255'],
            'speaker_id' => ['nullable', Rule::exists('speakers', 'id')->where(fn ($query) => $query->whereNull('event_id')->orWhere('event_id', $event->id))],
            'material_id' => ['nullable', 'exists:materials,id'],
            'target_tracks' => ['nullable', 'array'],
            'duration_jp' => ['required', 'integer', 'min:1'],
            'target_tracks.*' => ['string', 'exists:participant_tracks,code'],
            'delivery_method' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'learning_indicators' => ['nullable', 'string'],
            'publication_status' => ['required', 'in:draft,review,published'],
            'source_type' => ['required', 'in:collection,uploaded_pdf,external_link,video'],
            'source_file' => [Rule::requiredIf($sourceType === 'uploaded_pdf'), 'nullable', 'file', 'mimes:pdf', 'max:51200'],
            'source_url' => [Rule::requiredIf(in_array($sourceType, ['external_link', 'video'], true)), 'nullable', 'string', 'max:2048', function (string $attribute, mixed $value, \Closure $fail) use ($sourceType): void {
                if ($sourceType === 'external_link' && ! MaterialSourceService::isValidExternalUrl($value)) {
                    $fail('Gunakan tautan HTTPS publik yang valid.');
                }
                if ($sourceType === 'video' && ! MaterialSourceService::parseVideoUrl($value)) {
                    $fail('Gunakan URL video YouTube atau Vimeo yang valid.');
                }
            }],
        ]);

        $filePath = null;
        try {
            if ($sourceType === 'uploaded_pdf') {
                $filePath = $request->file('source_file')->store("event-modules/{$event->id}", 'local');
            }

            $event->modules()->create([
                'code' => $validated['code'],
                'title' => $validated['title'],
                'speaker_id' => $validated['speaker_id'] ?? null,
                'material_id' => $sourceType === 'collection' ? ($validated['material_id'] ?? null) : null,
                'track_codes' => $validated['target_tracks'] ?? [],
                'jp' => $validated['duration_jp'],
                'fulfillment_method' => $validated['delivery_method'] ?? null,
                'description' => $validated['description'] ?? null,
                'learning_indicators' => $validated['learning_indicators'] ?? null,
                'publication_status' => $validated['publication_status'],
                'is_published' => $validated['publication_status'] === 'published',
                'source_type' => $sourceType,
                'source_url' => $validated['source_url'] ?? null,
                'source_file_path' => $filePath,
            ]);
        } catch (Throwable $exception) {
            if ($filePath) {
                Storage::disk('local')->delete($filePath);
            }

            throw $exception;
        }

        return back()->with('success', 'Modul pembelajaran berhasil ditambahkan.');
    }

    public function downloadModuleFile(Event $event, EventModule $module): StreamedResponse
    {
        abort_unless($module->event_id === $event->id && $module->source_file_path
            && Storage::disk('local')->exists($module->source_file_path), 404);

        return Storage::disk('local')->download($module->source_file_path, "materi-{$module->id}.pdf");
    }

    /**
     * Update an event participant enrollment.
     */
    public function updateParticipant(Request $request, Event $event, EventParticipant $eventParticipant): RedirectResponse
    {
        $validated = $request->validate([
            'participant_track_id' => ['sometimes', Rule::exists('participant_tracks', 'id')->where(fn ($query) => $query->whereNull('event_id')->orWhere('event_id', $event->id))],
            'rotation_group' => ['nullable', 'in:A1,A2'],
            'admin_status' => ['sometimes', 'in:pending,verified,rejected'],
            'attendance_status' => ['sometimes', 'in:registered,present,absent,permitted'],
            'attendance_by_day' => ['nullable', 'array'],
            'theory_score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'practice_score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'graduation_status' => ['sometimes', 'in:pending,graduated,not_graduated,remedial'],
            'certificate_number' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
        ]);

        if (isset($validated['participant_track_id'])) {
            $validated['track_code'] = ParticipantTrack::findOrFail($validated['participant_track_id'])->code;
            unset($validated['participant_track_id']);
        }

        // Auto calculate final grade if scores provided
        if (isset($validated['theory_score']) && isset($validated['practice_score'])) {
            $avg = ($validated['theory_score'] * 0.4) + ($validated['practice_score'] * 0.6);
            if ($avg >= 85) {
                $validated['final_grade'] = 'A';
            } elseif ($avg >= 75) {
                $validated['final_grade'] = 'B';
            } elseif ($avg >= 60) {
                $validated['final_grade'] = 'C';
            } else {
                $validated['final_grade'] = 'D';
            }
        }

        $eventParticipant->update($validated);

        return back()->with('success', 'Data peserta event berhasil diperbarui.');
    }

    /**
     * Add a participant to the event.
     */
    public function addParticipant(Request $request, Event $event): RedirectResponse
    {
        $validated = $request->validate([
            'participant_id' => ['required', 'exists:participants,id'],
            'participant_track_id' => ['required', Rule::exists('participant_tracks', 'id')->where(fn ($query) => $query->whereNull('event_id')->orWhere('event_id', $event->id))],
            'rotation_group' => ['nullable', 'in:A1,A2'],
            'admin_status' => ['required', 'in:pending,verified'],
        ]);

        // Ensure unique
        $exists = EventParticipant::where('event_id', $event->id)
            ->where('participant_id', $validated['participant_id'])
            ->exists();

        if ($exists) {
            return back()->withErrors(['participant_id' => 'Peserta sudah terdaftar dalam event ini.']);
        }

        $event->eventParticipants()->create([
            'participant_id' => $validated['participant_id'],
            'track_code' => ParticipantTrack::findOrFail($validated['participant_track_id'])->code,
            'rotation_group' => $validated['rotation_group'] ?? null,
            'admin_status' => $validated['admin_status'],
        ]);

        return back()->with('success', 'Peserta berhasil didaftarkan ke event.');
    }

    public function createAndAddParticipant(StoreEventParticipantRequest $request, Event $event): RedirectResponse
    {
        $validated = $request->validated();
        DB::transaction(function () use ($validated, $event): void {
            $matchingUser = User::where('email', $validated['email'])
                ->where('role', 'Peserta')
                ->whereDoesntHave('participants')
                ->first();

            $participant = Participant::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'kenshi_id_number' => $validated['kenshi_id'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'origin_province' => $validated['origin'],
                'origin_dojo' => $validated['dojo'] ?? null,
                'dan_rank' => ! empty($validated['dan_level']) ? "{$validated['dan_level']}-DAN" : null,
                'user_id' => $matchingUser?->id,
            ]);

            $event->eventParticipants()->create([
                'participant_id' => $participant->id,
                'track_code' => ParticipantTrack::findOrFail($validated['participant_track_id'])->code,
                'rotation_group' => $validated['rotation_group'] ?? null,
                'admin_status' => $validated['admin_status'],
            ]);
        });

        return back()->with('success', 'Peserta baru berhasil dibuat dan didaftarkan ke event.');
    }

    public function storeTrack(Request $request, Event $event): RedirectResponse
    {
        $request->merge(['code' => strtoupper(trim((string) $request->input('code')))]);
        $validated = $request->validate([
            'code' => ['required', 'alpha_dash:ascii', 'max:20', 'unique:participant_tracks,code'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        ParticipantTrack::create([
            ...$validated,
            'event_id' => $event->id,
            'color' => 'bg-blue-100 text-blue-800',
            'is_active' => true,
        ]);

        return back()->with('success', 'Jalur peserta event berhasil ditambahkan.');
    }

    /**
     * Remove a participant from the event.
     */
    public function removeParticipant(Event $event, EventParticipant $eventParticipant): RedirectResponse
    {
        $eventParticipant->delete();

        return back()->with('success', 'Peserta berhasil dikeluarkan dari event.');
    }

    /**
     * Attach a learning module to the event.
     */
    public function attachLearningModule(Request $request, Event $event): RedirectResponse
    {
        $validated = $request->validate([
            'learning_module_id' => ['required', 'exists:learning_modules,id'],
            'participant_path_id' => ['nullable', 'string'],
            'is_required' => ['nullable', 'boolean'],
        ]);

        $sortOrder = $event->learningModules()->count() + 1;

        $event->learningModules()->syncWithoutDetaching([
            $validated['learning_module_id'] => [
                'participant_path_id' => $validated['participant_path_id'] ?? null,
                'is_required' => $validated['is_required'] ?? true,
                'sort_order' => $sortOrder,
            ],
        ]);

        return back()->with('success', 'Modul pembelajaran berhasil ditautkan ke event.');
    }

    /**
     * Detach a learning module from the event.
     */
    public function detachLearningModule(Event $event, LearningModule $module): RedirectResponse
    {
        $event->learningModules()->detach($module->id);

        return back()->with('success', 'Modul pembelajaran dilepas dari event.');
    }

    /**
     * Attach a CBT package to the event.
     */
    public function attachCbtPackage(Request $request, Event $event): RedirectResponse
    {
        $validated = $request->validate([
            'cbt_exam_package_id' => ['required', 'exists:cbt_exam_packages,id'],
            'participant_path_id' => ['nullable', 'string'],
            'is_required' => ['nullable', 'boolean'],
            'requires_attendance_session_id' => ['nullable', 'exists:event_sessions,id'],
        ]);

        $sortOrder = $event->linkedCbtPackages()->count() + 1;

        $event->linkedCbtPackages()->syncWithoutDetaching([
            $validated['cbt_exam_package_id'] => [
                'participant_path_id' => $validated['participant_path_id'] ?? null,
                'is_required' => $validated['is_required'] ?? true,
                'sort_order' => $sortOrder,
                'requires_attendance_session_id' => $validated['requires_attendance_session_id'] ?? null,
            ],
        ]);

        return back()->with('success', 'Paket ujian CBT berhasil ditautkan ke event.');
    }

    /**
     * Detach a CBT package from the event.
     */
    public function detachCbtPackage(Event $event, CbtExamPackage $package): RedirectResponse
    {
        $event->linkedCbtPackages()->detach($package->id);

        return back()->with('success', 'Paket ujian CBT dilepas dari event.');
    }
}
