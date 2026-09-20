<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventLegend;
use App\Models\ParticipantTrack;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MasterTrackController extends Controller
{
    /**
     * Display listing of participant tracks and institutional acronyms/legends.
     */
    public function index(Request $request): Response
    {
        $tracksQuery = ParticipantTrack::with('event:id,title')->withCount('eventParticipants')->orderBy('sort_order')->orderBy('id');
        $legendsQuery = EventLegend::with('event:id,title')->orderBy('category')->orderBy('acronym');

        if ($request->filled('scope') && $request->input('scope') !== 'all') {
            $scope = $request->input('scope');
            if ($scope === 'master') {
                $tracksQuery->whereNull('event_id');
                $legendsQuery->whereNull('event_id');
            } elseif (is_numeric($scope)) {
                $tracksQuery->where('event_id', (int) $scope);
                $legendsQuery->where('event_id', (int) $scope);
            }
        }

        if ($request->filled('q')) {
            $search = trim((string) $request->input('q'));
            $tracksQuery->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('code', 'ilike', "%{$search}%")
                    ->orWhere('description', 'ilike', "%{$search}%");
            });
            $legendsQuery->where(function ($q) use ($search) {
                $q->where('full_name', 'ilike', "%{$search}%")
                    ->orWhere('acronym', 'ilike', "%{$search}%")
                    ->orWhere('description', 'ilike', "%{$search}%");
            });
        }

        $tracks = $tracksQuery->get();
        $legends = $legendsQuery->get();
        $events = Event::select('id', 'title', 'slug', 'start_date')->latest('start_date')->get();

        return Inertia::render('Admin/Master/Tracks', [
            'tracks' => $tracks,
            'legends' => $legends,
            'events' => $events,
            'filters' => $request->only(['q', 'scope', 'tab']),
        ]);
    }

    /**
     * Store a participant track.
     */
    public function storeTrack(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'event_id' => ['nullable', 'integer', 'exists:events,id'],
            'code' => ['required', 'string', 'max:50', 'unique:participant_tracks,code'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'badge_color' => ['required', 'string', 'max:100'],
            'is_dual_track' => ['required', 'boolean'],
        ]);

        ParticipantTrack::create([
            'event_id' => $validated['event_id'] ?? null,
            'code' => $validated['code'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'color' => $validated['badge_color'],
        ]);

        return back()->with('success', 'Jalur peserta berhasil ditambahkan.');
    }

    /**
     * Update a participant track.
     */
    public function updateTrack(Request $request, ParticipantTrack $track): RedirectResponse
    {
        $validated = $request->validate([
            'event_id' => ['nullable', 'integer', 'exists:events,id'],
            'code' => ['required', 'string', 'max:50', 'unique:participant_tracks,code,'.$track->id],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'badge_color' => ['required', 'string', 'max:100'],
            'is_dual_track' => ['required', 'boolean'],
        ]);

        $track->update([
            'event_id' => array_key_exists('event_id', $validated) ? $validated['event_id'] : $track->event_id,
            'code' => $validated['code'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'color' => $validated['badge_color'],
        ]);

        return back()->with('success', 'Jalur peserta berhasil diperbarui.');
    }

    /**
     * Delete a participant track.
     */
    public function destroyTrack(ParticipantTrack $track): RedirectResponse
    {
        if ($track->eventParticipants()->exists()) {
            return back()->with('error', 'Jalur peserta ini tidak dapat dihapus karena sudah digunakan oleh peserta.');
        }

        $track->delete();

        return back()->with('success', 'Jalur peserta berhasil dihapus.');
    }

    /**
     * Store a legend / institutional acronym.
     */
    public function storeLegend(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'event_id' => ['nullable', 'integer', 'exists:events,id'],
            'category' => ['required', 'string', 'max:50'],
            'code' => ['required', 'string', 'max:50'],
            'term' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'badge_color' => ['nullable', 'string', 'max:100'],
        ]);

        EventLegend::create([
            'event_id' => $validated['event_id'] ?? null,
            'category' => $validated['category'],
            'acronym' => $validated['code'],
            'full_name' => $validated['term'],
            'description' => $validated['description'] ?? null,
        ]);

        return back()->with('success', 'Singkatan / Legenda berhasil ditambahkan.');
    }

    /**
     * Update a legend.
     */
    public function updateLegend(Request $request, EventLegend $legend): RedirectResponse
    {
        $validated = $request->validate([
            'event_id' => ['nullable', 'integer', 'exists:events,id'],
            'category' => ['required', 'string', 'max:50'],
            'code' => ['required', 'string', 'max:50'],
            'term' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'badge_color' => ['nullable', 'string', 'max:100'],
        ]);

        $legend->update([
            'event_id' => array_key_exists('event_id', $validated) ? $validated['event_id'] : $legend->event_id,
            'category' => $validated['category'],
            'acronym' => $validated['code'],
            'full_name' => $validated['term'],
            'description' => $validated['description'] ?? null,
        ]);

        return back()->with('success', 'Singkatan / Legenda berhasil diperbarui.');
    }

    /**
     * Delete a legend.
     */
    public function destroyLegend(EventLegend $legend): RedirectResponse
    {
        $legend->delete();

        return back()->with('success', 'Singkatan / Legenda berhasil dihapus.');
    }

    /**
     * Download CSV template for tracks.
     */
    public function downloadTrackTemplate(): StreamedResponse
    {
        return response()->streamDownload(function (): void {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['code', 'name', 'description', 'badge_color']);
            fputcsv($out, ['PD', 'Pelatih Daerah', 'Jalur sertifikasi pelatih tingkat daerah', 'bg-blue-100 text-blue-800']);
            fclose($out);
        }, 'format-jalur.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /**
     * Import tracks from CSV.
     */
    public function importTracks(Request $request): RedirectResponse
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
                    if (empty($row['code']) || empty($row['name'])) {
                        continue;
                    }

                    ParticipantTrack::updateOrCreate(
                        ['code' => $row['code']],
                        [
                            'event_id' => $targetEventId,
                            'name' => $row['name'],
                            'description' => $row['description'] ?? null,
                            'color' => $row['badge_color'] ?? 'bg-blue-100 text-blue-800',
                        ]
                    );
                    $count++;
                }
            });

            $scopeLabel = $targetEventId ? 'khusus event' : 'Master Diktar';

            return back()->with('success', "{$count} jalur peserta {$scopeLabel} berhasil diimpor.");
        } finally {
            fclose($handle);
        }
    }

    /**
     * Export tracks to CSV.
     */
    public function exportTracks(Request $request): StreamedResponse
    {
        $query = ParticipantTrack::query()->with('event:id,title')->withCount('eventParticipants');

        if ($request->filled('scope') && $request->input('scope') !== 'all') {
            $scope = $request->input('scope');
            if ($scope === 'master') {
                $query->whereNull('event_id');
            } elseif (is_numeric($scope)) {
                $query->where('event_id', (int) $scope);
            }
        }

        $tracks = $query->orderBy('sort_order')->get();

        return response()->streamDownload(function () use ($tracks): void {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Kode', 'Nama Jalur', 'Cakupan', 'Total Peserta Terdaftar', 'Deskripsi']);
            foreach ($tracks as $t) {
                fputcsv($out, [
                    $t->code,
                    $t->name,
                    $t->event ? "Event: {$t->event->title}" : 'Master Diktar (Lintas Event)',
                    $t->event_participants_count,
                    $t->description ?? '-',
                ]);
            }
            fclose($out);
        }, 'master-jalur-'.date('Ymd-His').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /**
     * Download CSV template for legends.
     */
    public function downloadLegendTemplate(): StreamedResponse
    {
        return response()->streamDownload(function (): void {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['category', 'code', 'term', 'description']);
            fputcsv($out, ['istilah', 'JP', 'Jam Pelajaran', 'Satuan durasi 1 JP = 45 menit']);
            fclose($out);
        }, 'format-legenda.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /**
     * Import legends from CSV.
     */
    public function importLegends(Request $request): RedirectResponse
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
                    if (empty($row['code']) || empty($row['term'])) {
                        continue;
                    }

                    EventLegend::create([
                        'event_id' => $targetEventId,
                        'category' => $row['category'] ?? 'istilah',
                        'acronym' => $row['code'],
                        'full_name' => $row['term'],
                        'description' => $row['description'] ?? null,
                    ]);
                    $count++;
                }
            });

            $scopeLabel = $targetEventId ? 'khusus event' : 'Master Diktar';

            return back()->with('success', "{$count} legenda/singkatan {$scopeLabel} berhasil diimpor.");
        } finally {
            fclose($handle);
        }
    }

    /**
     * Export legends to CSV.
     */
    public function exportLegends(Request $request): StreamedResponse
    {
        $query = EventLegend::query()->with('event:id,title');

        if ($request->filled('scope') && $request->input('scope') !== 'all') {
            $scope = $request->input('scope');
            if ($scope === 'master') {
                $query->whereNull('event_id');
            } elseif (is_numeric($scope)) {
                $query->where('event_id', (int) $scope);
            }
        }

        $legends = $query->orderBy('category')->orderBy('acronym')->get();

        return response()->streamDownload(function () use ($legends): void {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Kategori', 'Singkatan / Kode', 'Nama Lengkap / Istilah', 'Cakupan', 'Deskripsi']);
            foreach ($legends as $l) {
                fputcsv($out, [
                    $l->category,
                    $l->acronym,
                    $l->full_name,
                    $l->event ? "Event: {$l->event->title}" : 'Master Diktar (Lintas Event)',
                    $l->description ?? '-',
                ]);
            }
            fclose($out);
        }, 'master-legenda-'.date('Ymd-His').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }
}
