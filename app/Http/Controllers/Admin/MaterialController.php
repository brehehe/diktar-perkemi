<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Materials\SaveMaterial;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReplaceMaterialFileRequest;
use App\Http\Requests\Admin\StoreMaterialRequest;
use App\Http\Requests\Admin\UpdateMaterialRequest;
use App\Http\Requests\Admin\UpdateMaterialStatusRequest;
use App\Models\ActivityLog;
use App\Models\Audience;
use App\Models\Category;
use App\Models\Material;
use App\Models\MaterialFile;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class MaterialController extends Controller
{
    public function __construct(
        private readonly SaveMaterial $saveMaterial,
    ) {}

    /**
     * Display a listing of digital collections.
     */
    public function index(Request $request): Response
    {
        $query = Material::query()->with(['categories', 'creator', 'activeFile', 'audiences'])->latest('updated_at');

        if ($request->filled('q')) {
            $search = trim((string) $request->input('q'));
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                    ->orWhere('author', 'ilike', "%{$search}%")
                    ->orWhere('code', 'ilike', "%{$search}%")
                    ->orWhere('summary', 'ilike', "%{$search}%")
                    ->orWhere('keywords', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('category')) {
            $categoryId = (int) $request->input('category');
            $query->whereHas('categories', function ($q) use ($categoryId) {
                $q->where('categories.id', $categoryId);
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->filled('source_type')) {
            $query->where('source_type', $request->input('source_type'));
        }

        if ($request->filled('year')) {
            $query->where('publication_year', (int) $request->input('year'));
        }

        $materials = $query->paginate(10)->withQueryString()->through(fn (Material $m) => [
            'id' => $m->id,
            'title' => $m->title,
            'slug' => $m->slug,
            'code' => $m->code,
            'author' => $m->author ?: '-',
            'type' => $m->type,
            'type_label' => $m->type_label,
            'source_type' => $m->source_type ?? 'uploaded_pdf',
            'source_type_label' => $m->source_type_label,
            'source_badge_class' => $m->source_badge_class,
            'external_url' => $m->external_url,
            'video_provider' => $m->video_provider,
            'status' => $m->status,
            'status_label' => $m->status_label,
            'cover_path' => $m->cover_path,
            'publication_year' => $m->publication_year,
            'is_downloadable' => $m->is_downloadable,
            'allow_download' => (bool) ($m->allow_download || $m->is_downloadable),
            'is_featured' => $m->is_featured,
            'has_file' => $m->hasActiveFile(),
            'file_status' => $m->file_status,
            'file_status_label' => $m->file_status_label,
            'file_format' => match ($m->source_type) {
                'video' => 'Video',
                'external_link' => 'Link',
                default => 'PDF',
            },
            'active_version' => $m->activeFile ? 'v'.$m->activeFile->version.'.0' : '-',
            'file_size' => $m->activeFile ? $m->activeFile->formatted_size : '-',
            'category' => $m->categories->first() ? [
                'id' => $m->categories->first()->id,
                'name' => $m->categories->first()->name,
                'color' => $m->categories->first()->color,
            ] : null,
            'audiences' => $m->audiences->map(fn (Audience $aud) => [
                'id' => $aud->id,
                'name' => $aud->name,
                'code' => $aud->code,
            ])->values()->all(),
            'has_peserta_audience' => $m->audiences->contains(fn ($aud) => $aud->code === 'participant' || $aud->name === 'Peserta'),
            'updated_at' => $m->updated_at?->format('d M Y, H:i') ?? '-',
        ]);

        $categories = Category::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'color']);

        $availableYears = Material::select('publication_year')
            ->whereNotNull('publication_year')
            ->distinct()
            ->orderByDesc('publication_year')
            ->pluck('publication_year');

        $sourceOptions = [
            ['value' => 'uploaded_pdf', 'label' => 'Upload File PDF', 'description' => 'Unggah berkas PDF buku digital ke penyimpanan privat PERKEMI.'],
            ['value' => 'external_link', 'label' => 'Tautan Buku Digital', 'description' => 'Tautkan buku digital dari URL HTTPS eksternal resmi.'],
            ['value' => 'video', 'label' => 'Video Pembelajaran', 'description' => 'Sematkan video pembelajaran resmi dari YouTube, Shorts, atau Vimeo.'],
        ];

        return Inertia::render('Admin/Collections/Index', [
            'materials' => $materials,
            'categories' => $categories,
            'available_years' => $availableYears,
            'filters' => [
                'q' => $request->input('q', ''),
                'status' => $request->input('status', ''),
                'category' => $request->input('category', ''),
                'type' => $request->input('type', ''),
                'source_type' => $request->input('source_type', ''),
                'year' => $request->input('year', ''),
            ],
            'source_types' => $sourceOptions,
            'material_types' => [
                ['value' => 'module', 'label' => 'Modul Penataran'],
                ['value' => 'book', 'label' => 'Buku & Monograf'],
                ['value' => 'speaker_material', 'label' => 'Bahan Ajar Pemateri'],
                ['value' => 'guideline', 'label' => 'Pedoman Teknis'],
                ['value' => 'video', 'label' => 'Materi Video'],
                ['value' => 'document', 'label' => 'Dokumen / SK'],
            ],
            'status_options' => [
                ['value' => 'draft', 'label' => 'Draf'],
                ['value' => 'review', 'label' => 'Dalam Tinjauan'],
                ['value' => 'published', 'label' => 'Terbit'],
                ['value' => 'archived', 'label' => 'Diarsipkan'],
            ],
            'audiences_list' => Audience::where('is_active', true)->orderBy('id')->get(['id', 'name', 'code']),
            'sync_peserta_stats' => [
                'total' => Material::count(),
                'with_peserta' => Material::whereHas('audiences', fn ($q) => $q->where('audiences.code', 'participant')->orWhere('audiences.name', 'Peserta'))->count(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new material.
     */
    public function create(): Response
    {
        $categories = Category::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'color']);

        $audiences = Audience::where('is_active', true)
            ->orderBy('id')
            ->get(['id', 'name', 'code']);

        $sourceOptions = [
            ['value' => 'uploaded_pdf', 'label' => 'Upload File PDF', 'description' => 'Unggah dokumen buku digital PDF ke penyimpanan privat portal.'],
            ['value' => 'external_link', 'label' => 'Tautan Buku Digital', 'description' => 'Tautkan buku digital dari URL HTTPS resmi eksternal.'],
            ['value' => 'video', 'label' => 'Video Pembelajaran', 'description' => 'Video rekaman pembelajaran resmi dari YouTube, Shorts, atau Vimeo.'],
        ];

        return Inertia::render('Admin/Collections/Create', [
            'categories' => $categories,
            'audiences' => $audiences,
            'max_file_size_mb' => round(config('pustaka.max_file_size_kb', 51200) / 1024),
            'source_types' => $sourceOptions,
            'material_types' => [
                ['value' => 'module', 'label' => 'Modul Penataran'],
                ['value' => 'book', 'label' => 'Buku & Monograf'],
                ['value' => 'speaker_material', 'label' => 'Bahan Ajar Pemateri'],
                ['value' => 'guideline', 'label' => 'Pedoman Teknis'],
                ['value' => 'video', 'label' => 'Materi Video'],
                ['value' => 'document', 'label' => 'Dokumen / SK'],
            ],
            'status_options' => [
                ['value' => 'draft', 'label' => 'Draf'],
                ['value' => 'review', 'label' => 'Dalam Tinjauan'],
                ['value' => 'published', 'label' => 'Terbit'],
            ],
        ]);
    }

    /**
     * Store a newly created material in storage with private PDF file.
     */
    public function store(StoreMaterialRequest $request): RedirectResponse
    {
        try {
            $material = $this->saveMaterial->handle($request);
        } catch (Throwable $exception) {
            Log::error('Gagal menyimpan materi baru.', ['exception' => $exception]);

            return back()->withInput()->with('error', 'Terjadi kesalahan sistem saat menyimpan materi dan berkas.');
        }

        return redirect()->route('admin.materials.index')->with('success', 'Materi "'.$material->title.'" berhasil disimpan.');
    }

    /**
     * Show the form for editing the specified material.
     */
    public function edit(Material $material): Response
    {
        $material->load(['categories', 'audiences', 'activeFile.uploader', 'files.uploader']);

        $categories = Category::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'color']);

        $audiences = Audience::where('is_active', true)
            ->orderBy('id')
            ->get(['id', 'name', 'code']);

        $selectedCategoryId = $material->categories->first()?->id;
        $selectedAudiences = $material->audiences->pluck('id')->all();

        // Active file details
        $activeFile = $material->activeFile ? [
            'id' => $material->activeFile->id,
            'original_name' => $material->activeFile->original_name,
            'formatted_size' => $material->activeFile->formatted_size,
            'version' => $material->activeFile->version,
            'uploaded_at' => $material->activeFile->created_at?->format('d M Y, H:i') ?? '-',
            'uploader_name' => $material->activeFile->uploader?->name ?? 'Administrator',
        ] : null;

        // Version history list
        $fileHistory = $material->files->map(fn (MaterialFile $f) => [
            'id' => $f->id,
            'original_name' => $f->original_name,
            'version' => $f->version,
            'formatted_size' => $f->formatted_size,
            'is_active' => (bool) $f->is_active,
            'uploaded_at' => $f->created_at?->format('d M Y, H:i') ?? '-',
            'uploader_name' => $f->uploader?->name ?? 'Administrator',
        ]);

        $keyPoints = $material->key_points ?: ($material->metadata['key_points'] ?? []);
        $learningObjectives = $material->learning_objectives ?: ($material->metadata['learning_objectives'] ?? []);

        $sourceOptions = [
            ['value' => 'uploaded_pdf', 'label' => 'Upload File PDF', 'description' => 'Unggah dokumen buku digital PDF ke penyimpanan privat portal.'],
            ['value' => 'external_link', 'label' => 'Tautan Buku Digital', 'description' => 'Tautkan buku digital dari URL HTTPS resmi eksternal.'],
            ['value' => 'video', 'label' => 'Video Pembelajaran', 'description' => 'Video rekaman pembelajaran resmi dari YouTube, Shorts, atau Vimeo.'],
        ];

        return Inertia::render('Admin/Collections/Edit', [
            'material' => [
                'id' => $material->id,
                'title' => $material->title,
                'slug' => $material->slug,
                'code' => $material->code,
                'author' => $material->author ?? '',
                'type' => $material->type,
                'source_type' => $material->source_type ?? 'uploaded_pdf',
                'external_url' => $material->external_url ?? '',
                'external_source_name' => $material->external_source_name ?? '',
                'external_open_mode' => $material->external_open_mode ?? 'new_tab',
                'video_provider' => $material->video_provider ?? '',
                'video_id' => $material->video_id ?? '',
                'video_url' => $material->video_url ?? '',
                'video_allow_portal' => (bool) ($material->video_allow_portal ?? true),
                'access_scope' => $material->access_scope ?? 'all',
                'publication_year' => $material->publication_year,
                'page_count' => $material->page_count,
                'summary' => $material->summary,
                'description' => $material->description,
                'keywords' => $material->keywords ?? '',
                'admin_notes' => $material->admin_notes ?? '',
                'status' => $material->status,
                'cover_path' => $material->cover_path,
                'is_downloadable' => (bool) ($material->allow_download || $material->is_downloadable),
                'allow_download' => (bool) ($material->allow_download || $material->is_downloadable),
                'is_featured' => (bool) $material->is_featured,
                'category_id' => $selectedCategoryId,
                'audiences' => $selectedAudiences,
                'key_points' => $keyPoints,
                'learning_objectives' => $learningObjectives,
                'table_of_contents' => $material->metadata['table_of_contents'] ?? [],
            ],
            'active_file' => $activeFile,
            'file_history' => $fileHistory,
            'categories' => $categories,
            'audiences' => $audiences,
            'max_file_size_mb' => round(config('pustaka.max_file_size_kb', 51200) / 1024),
            'source_types' => $sourceOptions,
            'material_types' => [
                ['value' => 'module', 'label' => 'Modul Penataran'],
                ['value' => 'book', 'label' => 'Buku & Monograf'],
                ['value' => 'speaker_material', 'label' => 'Bahan Ajar Pemateri'],
                ['value' => 'guideline', 'label' => 'Pedoman Teknis'],
                ['value' => 'video', 'label' => 'Materi Video'],
                ['value' => 'document', 'label' => 'Dokumen / SK'],
            ],
            'status_options' => [
                ['value' => 'draft', 'label' => 'Draf'],
                ['value' => 'review', 'label' => 'Dalam Tinjauan'],
                ['value' => 'published', 'label' => 'Terbit'],
                ['value' => 'archived', 'label' => 'Diarsipkan'],
            ],
        ]);
    }

    /**
     * Update the specified material in storage.
     */
    public function update(UpdateMaterialRequest $request, Material $material): RedirectResponse
    {
        try {
            $material = $this->saveMaterial->handle($request, $material);
        } catch (Throwable $exception) {
            Log::error('Gagal memperbarui materi.', ['exception' => $exception]);

            return back()->withInput()->with('error', 'Gagal memperbarui materi.');
        }

        return redirect()->route('admin.materials.index')->with('success', 'Materi "'.$material->title.'" berhasil diperbarui.');
    }

    /**
     * Replace or upload new version of book file for material.
     */
    public function replaceFile(ReplaceMaterialFileRequest $request, Material $material): RedirectResponse
    {
        $bookFile = $request->file('book_file');
        $disk = config('pustaka.disk', 'local');
        $nextVersion = null;
        $savedFilePath = null;

        try {
            DB::transaction(function () use ($material, $disk, $bookFile, &$nextVersion, &$savedFilePath): void {
                $lockedMaterial = Material::query()->lockForUpdate()->findOrFail($material->id);
                $nextVersion = ((int) $lockedMaterial->files()->max('version')) + 1;
                $storageName = "v{$nextVersion}_".Str::random(24).'.pdf';
                $targetDirectory = "books/{$material->id}";
                $savedFilePath = $bookFile->storeAs($targetDirectory, $storageName, $disk);

                $lockedMaterial->files()->update(['is_active' => false]);

                MaterialFile::create([
                    'material_id' => $material->id,
                    'kind' => 'primary',
                    'disk' => $disk,
                    'path' => $savedFilePath,
                    'storage_name' => $storageName,
                    'original_name' => $bookFile->getClientOriginalName(),
                    'mime_type' => 'application/pdf',
                    'extension' => 'pdf',
                    'size_bytes' => $bookFile->getSize(),
                    'version' => $nextVersion,
                    'is_active' => true,
                    'uploaded_by' => auth()->id(),
                ]);

                ActivityLog::record('material.file_replaced', $material, [
                    'title' => $material->title,
                    'version' => $nextVersion,
                    'file_name' => $bookFile->getClientOriginalName(),
                ]);
            });
        } catch (Exception $e) {
            if ($savedFilePath !== null && Storage::disk($disk)->exists($savedFilePath)) {
                Storage::disk($disk)->delete($savedFilePath);
            }
            Log::error('Gagal mengganti berkas buku: '.$e->getMessage());

            return back()->with('error', 'Gagal menyimpan versi berkas baru.');
        }

        return back()->with('success', 'Berkas buku berhasil diperbarui ke versi '.$nextVersion.'.0.');
    }

    /**
     * Quick update of material publication status.
     */
    public function updateStatus(UpdateMaterialStatusRequest $request, Material $material): RedirectResponse
    {
        $validated = $request->validated();

        $oldStatus = $material->status;
        $material->status = $validated['status'];

        if ($validated['status'] === 'published' && ! $material->published_at) {
            $material->published_at = now();
            $material->reviewed_by = auth()->id();
            $material->reviewed_at = now();
        }

        DB::transaction(function () use ($material, $oldStatus): void {
            $material->save();

            ActivityLog::record('material.status_updated', $material, [
                'from' => $oldStatus,
                'to' => $material->status,
            ]);
        });

        return back()->with('success', 'Status materi "'.$material->title.'" diubah menjadi '.$material->status_label.'.');
    }

    /**
     * Remove the specified material from storage.
     */
    public function destroy(Material $material): RedirectResponse
    {
        Gate::authorize('delete', $material);

        $title = $material->title;
        DB::transaction(function () use ($material, $title): void {
            $material->delete();

            ActivityLog::record('material.deleted', null, [
                'title' => $title,
            ]);
        });

        return redirect()->route('admin.materials.index')->with('success', 'Materi "'.$title.'" berhasil dihapus dari sistem.');
    }

    /**
     * Ensure Peserta role audience is attached to all existing materials.
     */
    public function syncPesertaAudienceToAll(Request $request): RedirectResponse
    {
        $pesertaAudience = Audience::where('code', 'participant')
            ->orWhere('name', 'Peserta')
            ->first();

        if (! $pesertaAudience) {
            return back()->with('error', 'Peran sasaran Peserta tidak ditemukan di sistem.');
        }

        $materials = Material::all();
        $updatedCount = 0;

        foreach ($materials as $material) {
            $currentAudienceIds = $material->audiences()->pluck('audiences.id')->all();
            if (! in_array($pesertaAudience->id, $currentAudienceIds, true)) {
                $material->audiences()->syncWithoutDetaching([$pesertaAudience->id]);
                $updatedCount++;
            }
        }

        ActivityLog::record('material.sync_peserta_audience', null, [
            'total_materials' => $materials->count(),
            'updated_materials' => $updatedCount,
            'audience_id' => $pesertaAudience->id,
        ]);

        return back()->with(
            'success',
            "Hak akses peran Peserta berhasil di-checklist untuk seluruh {$materials->count()} materi koleksi ({$updatedCount} materi baru ditambahkan)."
        );
    }
}
