<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventModule;
use App\Models\EventSession;
use App\Models\Material;
use App\Models\Speaker;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SpeakerPortalController extends Controller
{
    /**
     * Resolve the current speaker profile for the authenticated user.
     */
    protected function resolveSpeaker(Request $request): ?Speaker
    {
        $user = $request->user();

        if (! $user) {
            return null;
        }

        $speaker = Speaker::where('user_id', $user->id)
            ->orWhere(function ($q) use ($user) {
                if ($user->email) {
                    $q->where('contact_email', $user->email);
                }
            })
            ->first();

        if (! $speaker && $user->role === 'Pemateri') {
            $speaker = Speaker::create([
                'user_id' => $user->id,
                'name' => $user->name,
                'contact_email' => $user->email,
                'type' => 'internal',
                'is_active' => true,
            ]);
        } elseif ($speaker && ! $speaker->user_id) {
            $speaker->update(['user_id' => $user->id]);
        }

        return $speaker;
    }

    /**
     * Display the speaker's teaching schedule, sessions, and learning materials.
     */
    public function schedule(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if (! in_array($user->role, ['Pemateri', 'Admin', 'Diktar', 'Penyelenggara'], true)) {
            return redirect()->route('home')->with('error', 'Akses khusus untuk Pemateri dan Pengelola Penataran.');
        }

        $speaker = $this->resolveSpeaker($request);

        if (! $speaker && ! $user->isAdmin() && ! in_array($user->role, ['Diktar', 'Penyelenggara'], true)) {
            return redirect()->route('home')->with('error', 'Profil pemateri belum terdaftar. Silakan hubungi sekretariat PB PERKEMI.');
        }

        $isSupervisor = (bool) ($speaker?->is_supervisor || $user->isAdmin() || in_array($user->role, ['Diktar', 'Penyelenggara'], true));

        $query = EventSession::query()
            ->with([
                'event:id,title,slug,start_date,end_date,location',
                'eventRoom:id,name',
                'speaker:id,name,title_degree,dan_rank,type,position,organization',
                'learningModule.materials.activeFile',
                'learningModule.materials.categories',
                'module',
                'material.activeFile',
                'material.categories',
            ]);

        if (! $isSupervisor && $speaker) {
            $query->where('speaker_id', $speaker->id);
        } elseif ($isSupervisor && $request->filled('speaker_id') && $request->input('speaker_id') !== 'all') {
            $query->where('speaker_id', (int) $request->input('speaker_id'));
        }

        if ($request->filled('event_id')) {
            $query->where('event_id', (int) $request->input('event_id'));
        }

        if ($request->filled('day')) {
            $query->where('day_number', (int) $request->input('day'));
        }

        if ($request->filled('q')) {
            $search = trim((string) $request->input('q'));
            $operator = DB::connection()->getDriverName() === 'pgsql' ? 'ilike' : 'like';
            $query->where(function ($q) use ($search, $operator) {
                $q->where('topic', $operator, "%{$search}%")
                    ->orWhere('subtopic', $operator, "%{$search}%")
                    ->orWhereHas('learningModule', fn ($mq) => $mq->where('title', $operator, "%{$search}%")->orWhere('code', $operator, "%{$search}%"));
            });
        }

        $allSessions = (clone $query)->orderBy('date')->orderBy('start_time')->get();

        $mappedSessions = $allSessions->map(function (EventSession $session) use ($speaker) {
            $materials = collect();

            if ($session->learningModule) {
                foreach ($session->learningModule->materials as $mat) {
                    $materials->push([
                        'id' => $mat->id,
                        'title' => $mat->title,
                        'slug' => $mat->slug,
                        'code' => $mat->code,
                        'author' => $mat->author,
                        'type' => $mat->type,
                        'source_type' => $mat->source_type,
                        'category_name' => $mat->categories->first()?->name ?? 'Modul Penataran',
                        'has_file' => (bool) $mat->activeFile,
                        'read_url' => route('speaker.material.read', [$session->id, $mat->id]),
                        'download_url' => route('speaker.material.download', [$session->id, $mat->id]),
                    ]);
                }
            }

            if ($session->material && ! $materials->contains('id', $session->material->id)) {
                $mat = $session->material;
                $materials->push([
                    'id' => $mat->id,
                    'title' => $mat->title,
                    'slug' => $mat->slug,
                    'code' => $mat->code,
                    'author' => $mat->author,
                    'type' => $mat->type,
                    'source_type' => $mat->source_type,
                    'category_name' => $mat->categories->first()?->name ?? 'Bahan Ajar',
                    'has_file' => (bool) $mat->activeFile,
                    'read_url' => route('speaker.material.read', [$session->id, $mat->id]),
                    'download_url' => route('speaker.material.download', [$session->id, $mat->id]),
                ]);
            }

            $dateFormatted = $session->date
                ? Carbon::parse($session->date)->locale('id')->isoFormat('dddd, D MMMM Y')
                : '-';

            return [
                'id' => $session->id,
                'event_id' => $session->event_id,
                'event_name' => $session->event?->title ?? '-',
                'event_slug' => $session->event?->slug ?? '',
                'event_date' => $session->event?->date_formatted ?? '-',
                'event_place' => $session->event?->place ?? '-',
                'day_number' => $session->day_number,
                'date_formatted' => $dateFormatted,
                'raw_date' => $session->date ? $session->date->format('Y-m-d') : null,
                'start_time' => $session->start_time ? substr($session->start_time, 0, 5) : '',
                'end_time' => $session->end_time ? substr($session->end_time, 0, 5) : '',
                'time_range' => $session->start_time && $session->end_time
                    ? substr($session->start_time, 0, 5).' — '.substr($session->end_time, 0, 5).' WIB'
                    : '-',
                'duration_jp' => $session->duration_jp,
                'session_number' => $session->session_number,
                'session_type_code' => $session->session_type_code,
                'session_type_name' => $session->session_type_code ?? 'SESI',
                'topic' => $session->topic,
                'subtopic' => $session->subtopic,
                'method' => $session->method ?? 'Teori & Praktik',
                'room' => $session->eventRoom?->name ?? $session->room ?? 'Dojo / Kelas',
                'track_codes' => $session->track_codes ?? [],
                'learning_module' => $session->learningModule ? [
                    'id' => $session->learningModule->id,
                    'code' => $session->learningModule->code,
                    'title' => $session->learningModule->title,
                    'category' => $session->learningModule->category,
                    'total_jp' => $session->learningModule->total_jp,
                    'level' => $session->learningModule->level,
                    'description' => $session->learningModule->description,
                    'learning_objectives' => $session->learningModule->learning_objectives ?? [],
                    'competency_outcomes' => $session->learningModule->competency_outcomes ?? [],
                ] : null,
                'event_module' => $session->module ? [
                    'id' => $session->module->id,
                    'title' => $session->module->title,
                    'code' => $session->module->code,
                    'download_url' => route('speaker.module.download', [$session->id, $session->module->id]),
                ] : null,
                'materials' => $materials->values(),
                'speaker' => $session->speaker ? [
                    'id' => $session->speaker->id,
                    'name' => $session->speaker->name,
                    'full_name' => $session->speaker->full_name_with_title,
                    'dan_rank' => $session->speaker->dan_rank,
                    'type' => $session->speaker->type,
                    'role_info' => $session->speaker->role_info,
                ] : null,
                'is_own_session' => $speaker ? ($session->speaker_id === $speaker->id) : false,
            ];
        });

        // Compute speaker stats
        $totalSessions = $mappedSessions->count();
        $totalJp = (int) $allSessions->sum('duration_jp');
        $totalEvents = $mappedSessions->pluck('event_id')->unique()->count();
        $totalMaterials = $mappedSessions->flatMap(fn ($s) => $s['materials'])->unique('id')->count();

        // Available events for filtering
        $eventIds = EventSession::when(! $isSupervisor && $speaker, fn ($q) => $q->where('speaker_id', $speaker->id))
            ->distinct()
            ->pluck('event_id');
        $availableEvents = Event::whereIn('id', $eventIds)
            ->select('id', 'title', 'slug', 'start_date')
            ->latest('start_date')
            ->get()
            ->map(fn ($e) => [
                'id' => $e->id,
                'name' => $e->title,
            ]);

        // Available days for filtering
        $availableDays = EventSession::when(! $isSupervisor && $speaker, fn ($q) => $q->where('speaker_id', $speaker->id))
            ->when($request->filled('event_id'), fn ($q) => $q->where('event_id', (int) $request->input('event_id')))
            ->whereNotNull('day_number')
            ->distinct()
            ->orderBy('day_number')
            ->pluck('day_number')
            ->values();

        // Available speakers for supervisor filter
        $availableSpeakers = $isSupervisor
            ? Speaker::whereHas('sessions')
                ->select('id', 'name', 'title_degree', 'dan_rank')
                ->orderBy('name')
                ->get()
                ->map(fn ($s) => [
                    'id' => $s->id,
                    'name' => $s->full_name_with_title ?: $s->name,
                ])
                ->values()
            : [];

        return Inertia::render('Speaker/Schedule', [
            'speaker' => $speaker ? [
                'id' => $speaker->id,
                'name' => $speaker->name,
                'full_name' => $speaker->full_name_with_title,
                'title_degree' => $speaker->title_degree,
                'dan_rank' => $speaker->dan_rank,
                'dan_roman' => $speaker->dan_roman,
                'position' => $speaker->position,
                'organization' => $speaker->organization,
                'specialization' => $speaker->specialization,
                'bio' => $speaker->bio,
                'type' => $speaker->type,
                'type_label' => $speaker->type_label,
                'role_info' => $speaker->role_info,
                'contact_email' => $speaker->contact_email ?? $request->user()->email,
                'contact_phone' => $speaker->contact_phone,
                'is_supervisor' => (bool) $speaker->is_supervisor,
            ] : null,
            'isSupervisorMode' => $isSupervisor,
            'sessions' => $mappedSessions,
            'stats' => [
                'total_sessions' => $totalSessions,
                'total_jp' => $totalJp,
                'total_events' => $totalEvents,
                'total_materials' => $totalMaterials,
            ],
            'availableEvents' => $availableEvents,
            'availableDays' => $availableDays,
            'availableSpeakers' => $availableSpeakers,
            'filters' => [
                'event_id' => $request->input('event_id', ''),
                'day' => $request->input('day', ''),
                'speaker_id' => $request->input('speaker_id', ''),
                'q' => $request->input('q', ''),
            ],
        ]);
    }

    /**
     * Open / read material securely for the speaker.
     */
    public function readMaterial(Request $request, EventSession $session, Material $material): RedirectResponse
    {
        $user = $request->user();
        $speaker = $this->resolveSpeaker($request);

        $canAccess = $user->isAdmin()
            || in_array($user->role, ['Diktar', 'Penyelenggara'], true)
            || ($speaker && $speaker->is_supervisor)
            || ($speaker && $session->speaker_id === $speaker->id);

        abort_unless(
            $canAccess,
            403,
            'Akses ditolak. Anda bukan pemateri yang ditugaskan untuk sesi ini atau belum memiliki akses supervisor.'
        );

        return redirect()->route('reader.show', $material->slug);
    }

    /**
     * Download material PDF file for the speaker.
     */
    public function downloadMaterial(Request $request, EventSession $session, Material $material): StreamedResponse|RedirectResponse
    {
        $user = $request->user();
        $speaker = $this->resolveSpeaker($request);

        $canAccess = $user->isAdmin()
            || in_array($user->role, ['Diktar', 'Penyelenggara'], true)
            || ($speaker && $speaker->is_supervisor)
            || ($speaker && $session->speaker_id === $speaker->id);

        abort_unless(
            $canAccess,
            403,
            'Akses ditolak. Anda bukan pemateri yang ditugaskan untuk sesi ini atau belum memiliki akses supervisor.'
        );

        $activeFile = $material->activeFile;
        if (! $activeFile || ! $activeFile->path) {
            return back()->with('error', 'Berkas materi tidak tersedia untuk diunduh.');
        }

        $disk = $activeFile->disk ?: config('pustaka.disk', 'local');
        abort_unless(Storage::disk($disk)->exists($activeFile->path), 404, 'Berkas materi tidak ditemukan pada penyimpanan.');

        $filename = "Materi-{$material->code}-{$material->slug}.pdf";

        return Storage::disk($disk)->download($activeFile->path, $filename, [
            'Content-Type' => 'application/pdf',
        ]);
    }

    /**
     * Download EventModule PDF file for the speaker.
     */
    public function downloadModulePdf(Request $request, EventSession $session, EventModule $module): StreamedResponse|RedirectResponse
    {
        $user = $request->user();
        $speaker = $this->resolveSpeaker($request);

        $canAccess = $user->isAdmin()
            || in_array($user->role, ['Diktar', 'Penyelenggara'], true)
            || ($speaker && $speaker->is_supervisor)
            || ($speaker && $session->speaker_id === $speaker->id);

        abort_unless(
            $canAccess,
            403,
            'Akses ditolak. Anda bukan pemateri yang ditugaskan untuk sesi ini atau belum memiliki akses supervisor.'
        );

        if (! $module->source_file_path || ! Storage::disk('local')->exists($module->source_file_path)) {
            return back()->with('error', 'Berkas modul tidak ditemukan.');
        }

        return Storage::disk('local')->download($module->source_file_path, "Modul-{$module->code}.pdf", [
            'Content-Type' => 'application/pdf',
        ]);
    }
}
