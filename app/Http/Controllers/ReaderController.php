<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Bookmark;
use App\Models\Event;
use App\Models\Material;
use App\Models\ReadingProgress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReaderController extends Controller
{
    /**
     * Display the secure interactive digital book reader page.
     */
    public function show(Request $request, string $slug): Response|RedirectResponse
    {
        $material = Material::where('slug', $slug)
            ->with(['categories', 'audiences', 'activeFile'])
            ->firstOrFail();

        Gate::authorize('read', $material);

        // 1. Guard against non-PDF materials accessing the flipbook reader
        if ($material->source_type === 'external_link') {
            if ($material->external_open_mode === 'new_tab' && $material->external_url) {
                return redirect()->away($material->external_url);
            }

            return redirect()->route('portal.collections.show', $material->slug);
        }

        if ($material->source_type === 'video') {
            return redirect()->route('portal.collections.show', $material->slug);
        }

        if (! $material->activeFile) {
            return redirect()->route('portal.collections.show', $material->slug)
                ->with('error', 'Berkas PDF buku digital belum tersedia untuk materi ini.');
        }

        $activeFile = $material->activeFile;
        $primaryCategory = $material->categories->first();

        $relatedMaterials = Material::where('id', '!=', $material->id)
            ->published()
            ->when($primaryCategory, function ($q) use ($primaryCategory) {
                $q->whereHas('categories', function ($catQuery) use ($primaryCategory) {
                    $catQuery->where('categories.id', $primaryCategory->id);
                });
            })
            ->take(4)
            ->get()
            ->map(fn (Material $m) => [
                'id' => $m->id,
                'title' => $m->title,
                'slug' => $m->slug,
                'type_label' => $m->type_label,
                'cover_path' => $m->cover_path,
                'publication_year' => $m->publication_year,
            ]);

        $user = $request->user();
        $canDownload = $user ? $user->can('download', $material) : false;

        $lastReadPage = 1;
        $bookmarks = [];

        if ($user) {
            $progress = ReadingProgress::where('user_id', $user->id)
                ->where('material_id', $material->id)
                ->first();

            if ($progress) {
                $lastReadPage = $progress->current_page ?? 1;
            }

            $bookmarks = Bookmark::where('user_id', $user->id)
                ->where('material_id', $material->id)
                ->orderBy('page_number')
                ->get(['id', 'page_number', 'position_data', 'note', 'created_at'])
                ->map(fn (Bookmark $b) => [
                    'id' => $b->id,
                    'page_number' => $b->page_number,
                    'title' => $b->title,
                    'note' => $b->note,
                    'created_at' => $b->created_at?->toDateTimeString(),
                ])
                ->values()
                ->all();
        }

        $metadata = is_array($material->metadata) ? $material->metadata : [];
        $tableOfContents = $metadata['table_of_contents'] ?? [];
        $keyPoints = $metadata['key_points'] ?? [];
        $learningObjectives = $metadata['learning_objectives'] ?? [];
        $targetAudiences = $material->audiences->map(fn ($aud) => [
            'id' => $aud->id,
            'name' => $aud->name,
            'code' => $aud->code,
        ]);
        $backNavigation = $this->backNavigation($request, $material);

        return Inertia::render('Portal/Reader/Show', [
            'material' => [
                'id' => $material->id,
                'title' => $material->title,
                'slug' => $material->slug,
                'code' => $material->code,
                'author' => $material->author ?: 'Pengurus Besar PERKEMI',
                'publication_year' => $material->publication_year,
                'page_count' => $material->page_count,
                'summary' => $material->summary,
                'description' => $material->description,
                'cover_path' => $material->cover_path,
                'type' => $material->type,
                'type_label' => $material->type_label,
                'status' => $material->status,
                'status_label' => $material->status_label,
                'is_downloadable' => (bool) $material->is_downloadable,
                'category' => $primaryCategory ? [
                    'id' => $primaryCategory->id,
                    'name' => $primaryCategory->name,
                    'color' => $primaryCategory->color,
                ] : null,
            ],
            'has_file' => (bool) $activeFile,
            'file_info' => $activeFile ? [
                'id' => $activeFile->id,
                'original_name' => $activeFile->original_name,
                'formatted_size' => $activeFile->formatted_size,
                'version' => $activeFile->version,
            ] : null,
            'file_url' => "/koleksi/{$material->slug}/file",
            'download_url' => "/koleksi/{$material->slug}/unduh",
            'can_download' => $canDownload,
            'last_read_page' => $lastReadPage,
            'bookmarks' => $bookmarks,
            'table_of_contents' => $tableOfContents,
            'key_points' => $keyPoints,
            'learning_objectives' => $learningObjectives,
            'target_audiences' => $targetAudiences,
            'related_materials' => $relatedMaterials,
            'back_url' => $backNavigation['url'],
            'back_label' => $backNavigation['label'],
        ]);
    }

    /**
     * @return array{url: string, label: string}
     */
    private function backNavigation(Request $request, Material $material): array
    {
        $collectionNavigation = [
            'url' => route('portal.collections.show', $material->slug),
            'label' => 'Kembali ke detail koleksi',
        ];
        $eventSlug = trim((string) $request->query('event'));

        if ($eventSlug === '' || ! $request->user()) {
            return $collectionNavigation;
        }

        $event = Event::query()
            ->where('slug', $eventSlug)
            ->whereHas('eventParticipants', fn ($enrollments) => $enrollments
                ->where('admin_status', 'verified')
                ->whereHas('participant', fn ($participants) => $participants
                    ->where('user_id', $request->user()->id)))
            ->first(['id', 'slug']);

        if (! $event) {
            return $collectionNavigation;
        }

        return [
            'url' => route('event.learning-room', $event->slug),
            'label' => 'Kembali ke ruang belajar event',
        ];
    }

    /**
     * Authorized inline stream of digital PDF file for browser viewing.
     */
    public function streamFile(Request $request, string $slug): BinaryFileResponse
    {
        $material = Material::where('slug', $slug)
            ->with('activeFile')
            ->firstOrFail();

        Gate::authorize('read', $material);

        $file = $material->activeFile;
        if (! $file || ! Storage::disk($file->disk)->exists($file->path)) {
            abort(404, 'Berkas buku digital belum diunggah atau tidak ditemukan di penyimpanan privat.');
        }

        $fullPath = Storage::disk($file->disk)->path($file->path);

        ActivityLog::record('material.read', $material, [
            'title' => $material->title,
            'version' => $file->version,
            'ip' => $request->ip(),
        ]);

        return response()->file($fullPath, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.addslashes($file->original_name).'"',
            'Cache-Control' => 'private, no-transform, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    /**
     * Authorized download of raw digital book file.
     */
    public function downloadFile(Request $request, string $slug): StreamedResponse
    {
        $material = Material::where('slug', $slug)
            ->with('activeFile')
            ->firstOrFail();

        Gate::authorize('download', $material);

        $file = $material->activeFile;
        if (! $file || ! Storage::disk($file->disk)->exists($file->path)) {
            abort(404, 'Berkas tidak tersedia untuk diunduh.');
        }

        ActivityLog::record('material.download', $material, [
            'title' => $material->title,
            'version' => $file->version,
            'ip' => $request->ip(),
        ]);

        return Storage::disk($file->disk)->download(
            $file->path,
            $file->original_name,
            [
                'Content-Type' => 'application/pdf',
                'X-Content-Type-Options' => 'nosniff',
            ]
        );
    }

    /**
     * Save reading progress for authenticated user.
     */
    public function saveProgress(Request $request, string $slug): JsonResponse
    {
        $material = Material::where('slug', $slug)->firstOrFail();
        Gate::authorize('read', $material);

        $validated = $request->validate([
            'page' => ['required', 'integer', 'min:1'],
            'total_pages' => ['nullable', 'integer', 'min:1'],
        ]);

        $page = (int) $validated['page'];
        $totalPages = isset($validated['total_pages']) ? (int) $validated['total_pages'] : null;
        $percent = ($totalPages && $totalPages > 0)
            ? (int) min(100, round(($page / $totalPages) * 100))
            : 0;

        $progress = ReadingProgress::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'material_id' => $material->id,
            ],
            [
                'current_page' => $page,
                'total_pages' => $totalPages,
                'progress_percent' => $percent,
                'last_read_at' => now(),
                'started_at' => now(),
            ]
        );

        return response()->json([
            'success' => true,
            'progress' => [
                'user_id' => $progress->user_id,
                'material_id' => $progress->material_id,
                'last_page' => $progress->current_page,
                'total_pages' => $progress->total_pages,
                'percentage' => $progress->progress_percent,
            ],
        ]);
    }

    /**
     * Store a bookmark for authenticated user.
     */
    public function storeBookmark(Request $request, string $slug): JsonResponse|RedirectResponse
    {
        $material = Material::where('slug', $slug)->firstOrFail();
        Gate::authorize('read', $material);

        $validated = $request->validate([
            'page_number' => ['required', 'integer', 'min:1'],
            'title' => ['nullable', 'string', 'max:255'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $pageNumber = (int) $validated['page_number'];
        $title = ! empty($validated['title']) ? trim($validated['title']) : "Halaman {$pageNumber}";

        $bookmark = Bookmark::withTrashed()->updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'material_id' => $material->id,
                'page_number' => $pageNumber,
            ],
            [
                'position_data' => ['title' => $title],
                'note' => $validated['note'] ?? null,
                'deleted_at' => null,
            ]
        );

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'bookmark' => [
                    'id' => $bookmark->id,
                    'page_number' => $bookmark->page_number,
                    'title' => $bookmark->title,
                    'note' => $bookmark->note,
                    'created_at' => $bookmark->created_at?->toDateTimeString(),
                ],
            ]);
        }

        return back()->with('success', 'Penanda halaman berhasil disimpan.');
    }

    /**
     * Remove a bookmark for authenticated user.
     */
    public function destroyBookmark(Request $request, string $slug, Bookmark $bookmark): JsonResponse|RedirectResponse
    {
        $material = Material::where('slug', $slug)->firstOrFail();
        Gate::authorize('read', $material);

        if ($bookmark->user_id !== $request->user()->id || $bookmark->material_id !== $material->id) {
            abort(403, 'Akses penanda halaman tidak diizinkan.');
        }

        $bookmark->delete();

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return back()->with('success', 'Penanda halaman berhasil dihapus.');
    }
}
