<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Speaker;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SpeakerController extends Controller
{
    /**
     * Display a listing of speakers with filters and metrics.
     */
    public function index(Request $request): Response
    {
        $query = Speaker::query()->with('event:id,title')->withCount(['modules', 'sessions']);

        if ($request->filled('q')) {
            $search = trim((string) $request->input('q'));
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('title_degree', 'ilike', "%{$search}%")
                    ->orWhere('position', 'ilike', "%{$search}%")
                    ->orWhere('organization', 'ilike', "%{$search}%")
                    ->orWhere('specialization', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->filled('expertise')) {
            $query->where('specialization', 'ilike', '%'.trim((string) $request->input('expertise')).'%');
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->input('status') === 'active');
        }

        if ($request->filled('scope') && $request->input('scope') !== 'all') {
            $scope = $request->input('scope');
            if ($scope === 'master') {
                $query->whereNull('event_id');
            } elseif (is_numeric($scope)) {
                $query->where('event_id', (int) $scope);
            }
        } elseif ($request->filled('event_id')) {
            $eventId = (int) $request->input('event_id');
            $query->where(function ($q) use ($eventId) {
                $q->where('event_id', $eventId)
                    ->orWhereHas('sessions', fn ($sq) => $sq->where('event_id', $eventId))
                    ->orWhereHas('modules', fn ($mq) => $mq->where('event_id', $eventId));
            });
        }

        $speakers = $query->orderBy('name')->paginate(10)->withQueryString()->through(fn (Speaker $s) => [
            'id' => $s->id,
            'event_id' => $s->event_id,
            'event_title' => $s->event?->title,
            'name' => $s->name,
            'title_suffix' => $s->title_suffix,
            'full_name' => $s->full_name_with_title,
            'type' => $s->type,
            'type_label' => $s->type_label,
            'dan_level' => $s->dan_level,
            'dan_roman' => $s->dan_roman,
            'perkemi_position' => $s->perkemi_position,
            'institution' => $s->institution,
            'role_info' => $s->role_info,
            'primary_expertise' => $s->primary_expertise,
            'bio' => $s->bio,
            'photo_url' => $s->photo_url,
            'internal_contact' => $s->internal_contact,
            'is_active' => $s->is_active,
            'modules_count' => $s->modules_count,
            'sessions_count' => $s->sessions_count,
        ]);

        $speakerStats = Speaker::query()->selectRaw(
            "COUNT(*) as total_speakers,
             SUM(CASE WHEN type = 'internal' THEN 1 ELSE 0 END) as internal_count,
             SUM(CASE WHEN type = 'external' THEN 1 ELSE 0 END) as external_count,
             SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_count",
        )->firstOrFail();
        $stats = [
            'total_speakers' => (int) $speakerStats->total_speakers,
            'internal_count' => (int) $speakerStats->internal_count,
            'external_count' => (int) $speakerStats->external_count,
            'active_count' => (int) $speakerStats->active_count,
        ];

        $events = Event::select('id', 'title')->latest('start_date')->get()->map(fn ($e) => [
            'id' => $e->id,
            'name' => $e->title,
        ]);

        return Inertia::render('Admin/Speakers/Index', [
            'speakers' => $speakers,
            'filters' => $request->only(['q', 'type', 'expertise', 'status', 'event_id', 'scope']),
            'stats' => $stats,
            'availableEvents' => $events,
        ]);
    }

    /**
     * Store a newly created speaker.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'event_id' => ['nullable', 'integer', 'exists:events,id'],
            'name' => ['required', 'string', 'max:255'],
            'title_suffix' => ['nullable', 'string', 'max:100'],
            'type' => ['required', 'in:internal,external'],
            'dan_level' => ['nullable'],
            'perkemi_position' => ['nullable', 'string', 'max:255'],
            'institution' => ['nullable', 'string', 'max:255'],
            'primary_expertise' => ['required', 'string', 'max:255'],
            'bio' => ['nullable', 'string'],
            'internal_contact' => ['nullable', 'string', 'max:255'],
            'photo_url' => ['nullable', 'string'],
            'is_active' => ['required', 'boolean'],
        ]);

        $speakerData = [
            'event_id' => $validated['event_id'] ?? null,
            'name' => $validated['name'],
            'title_degree' => $validated['title_suffix'] ?? null,
            'type' => $validated['type'],
            'dan_rank' => ! empty($validated['dan_level']) ? "{$validated['dan_level']}-DAN" : null,
            'position' => $validated['perkemi_position'] ?? null,
            'organization' => $validated['institution'] ?? null,
            'specialization' => $validated['primary_expertise'],
            'bio' => $validated['bio'] ?? null,
            'contact_phone' => $validated['internal_contact'] ?? null,
            'avatar_path' => $validated['photo_url'] ?? null,
            'is_active' => $validated['is_active'],
        ];

        Speaker::create($speakerData);

        return back()->with('success', 'Pemateri berhasil ditambahkan.');
    }

    /**
     * Update the specified speaker.
     */
    public function update(Request $request, Speaker $speaker): RedirectResponse
    {
        $validated = $request->validate([
            'event_id' => ['nullable', 'integer', 'exists:events,id'],
            'name' => ['required', 'string', 'max:255'],
            'title_suffix' => ['nullable', 'string', 'max:100'],
            'type' => ['required', 'in:internal,external'],
            'dan_level' => ['nullable'],
            'perkemi_position' => ['nullable', 'string', 'max:255'],
            'institution' => ['nullable', 'string', 'max:255'],
            'primary_expertise' => ['required', 'string', 'max:255'],
            'bio' => ['nullable', 'string'],
            'internal_contact' => ['nullable', 'string', 'max:255'],
            'photo_url' => ['nullable', 'string'],
            'is_active' => ['required', 'boolean'],
        ]);

        $speakerData = [
            'event_id' => array_key_exists('event_id', $validated) ? $validated['event_id'] : $speaker->event_id,
            'name' => $validated['name'],
            'title_degree' => $validated['title_suffix'] ?? null,
            'type' => $validated['type'],
            'dan_rank' => ! empty($validated['dan_level']) ? "{$validated['dan_level']}-DAN" : null,
            'position' => $validated['perkemi_position'] ?? null,
            'organization' => $validated['institution'] ?? null,
            'specialization' => $validated['primary_expertise'],
            'bio' => $validated['bio'] ?? null,
            'contact_phone' => $validated['internal_contact'] ?? null,
            'avatar_path' => $validated['photo_url'] ?? null,
            'is_active' => $validated['is_active'],
        ];

        $speaker->update($speakerData);

        return back()->with('success', 'Data pemateri berhasil diperbarui.');
    }

    /**
     * Remove the specified speaker.
     */
    public function destroy(Speaker $speaker): RedirectResponse
    {
        $speaker->delete();

        return back()->with('success', 'Pemateri berhasil dihapus.');
    }

    /**
     * Download CSV template for speaker import.
     */
    public function downloadTemplate(): StreamedResponse
    {
        return response()->streamDownload(function (): void {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['name', 'title_suffix', 'type', 'dan_level', 'perkemi_position', 'institution', 'primary_expertise', 'bio', 'internal_contact', 'is_active']);
            fputcsv($out, ['Sensei Budi Santoso', 'VII-DAN', 'internal', '7', 'Anggota Dewan Guru', 'PB PERKEMI', 'Teknik Embu Beregu', 'Pelatih Senior Nasional', '08123456789', '1']);
            fclose($out);
        }, 'format-pemateri.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * Import speakers from CSV.
     */
    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
            'event_id' => ['nullable', 'integer', 'exists:events,id'],
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');
        $targetEventId = $request->filled('event_id') ? (int) $request->input('event_id') : null;

        try {
            $headers = fgetcsv($handle, 0, ',', '"', '');
            if (! is_array($headers)) {
                return back()->withErrors(['file' => 'Berkas CSV kosong.']);
            }
            $headers = array_map(fn ($h) => trim(str_replace("\xEF\xBB\xBF", '', $h)), $headers);

            $count = 0;
            DB::transaction(function () use ($handle, $headers, &$count, $targetEventId): void {
                while (($values = fgetcsv($handle, 0, ',', '"', '')) !== false) {
                    if ($values === [null] || empty(array_filter($values))) {
                        continue;
                    }
                    $row = array_combine($headers, array_map('trim', $values));
                    if (! isset($row['name']) || empty($row['name'])) {
                        continue;
                    }

                    Speaker::create([
                        'event_id' => $targetEventId,
                        'name' => $row['name'],
                        'title_degree' => $row['title_suffix'] ?? null,
                        'type' => in_array($row['type'] ?? '', ['internal', 'external'], true) ? $row['type'] : 'internal',
                        'dan_rank' => ! empty($row['dan_level']) ? "{$row['dan_level']}-DAN" : null,
                        'position' => $row['perkemi_position'] ?? null,
                        'organization' => $row['institution'] ?? null,
                        'specialization' => $row['primary_expertise'] ?? 'Materi Umum',
                        'bio' => $row['bio'] ?? null,
                        'contact_phone' => $row['internal_contact'] ?? null,
                        'is_active' => ! empty($row['is_active']) && $row['is_active'] != '0',
                    ]);
                    $count++;
                }
            });

            $scopeLabel = $targetEventId ? 'khusus event' : 'Master Diktar';

            return back()->with('success', "{$count} data pemateri {$scopeLabel} berhasil diimpor.");
        } finally {
            fclose($handle);
        }
    }

    /**
     * Export speakers to CSV.
     */
    public function export(Request $request): StreamedResponse
    {
        $query = Speaker::query()->with('event:id,title');

        if ($request->filled('q')) {
            $search = trim((string) $request->input('q'));
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('title_degree', 'ilike', "%{$search}%")
                    ->orWhere('position', 'ilike', "%{$search}%")
                    ->orWhere('organization', 'ilike', "%{$search}%")
                    ->orWhere('specialization', 'ilike', "%{$search}%");
            });
        }
        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }
        if ($request->filled('status')) {
            $query->where('is_active', $request->input('status') === 'active');
        }
        if ($request->filled('scope') && $request->input('scope') !== 'all') {
            $scope = $request->input('scope');
            if ($scope === 'master') {
                $query->whereNull('event_id');
            } elseif (is_numeric($scope)) {
                $query->where('event_id', (int) $scope);
            }
        }

        $speakers = $query->orderBy('name')->get();

        return response()->streamDownload(function () use ($speakers): void {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Nama', 'Gelar', 'Tipe', 'Tingkatan DAN', 'Jabatan / Instansi', 'Keahlian Utama', 'Cakupan', 'Kontak', 'Status']);
            foreach ($speakers as $s) {
                fputcsv($out, [
                    $s->name,
                    $s->title_degree ?? '',
                    $s->type,
                    $s->dan_rank ?? '',
                    $s->position ?? $s->organization ?? '',
                    $s->specialization,
                    $s->event ? "Event: {$s->event->title}" : 'Master Diktar (Lintas Event)',
                    $s->contact_phone ?? '',
                    $s->is_active ? 'Aktif' : 'Nonaktif',
                ]);
            }
            fclose($out);
        }, 'master-pemateri-'.date('Ymd-His').'.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
