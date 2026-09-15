<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Material;
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
    public function show(Request $request, string $slug): Response
    {
        $material = Material::where('slug', $slug)
            ->with(['categories', 'audiences', 'activeFile'])
            ->firstOrFail();

        Gate::authorize('read', $material);

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

        return Inertia::render('Reader/Show', [
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
            'related_materials' => $relatedMaterials,
        ]);
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
}
