<?php

namespace App\Http\Controllers\Admin;

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

class MaterialController extends Controller
{
    /**
     * Display a listing of digital collections.
     */
    public function index(Request $request): Response
    {
        $query = Material::query()->with(['categories', 'creator', 'activeFile'])->latest('updated_at');

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
            'status' => $m->status,
            'status_label' => $m->status_label,
            'cover_path' => $m->cover_path,
            'publication_year' => $m->publication_year,
            'is_downloadable' => $m->is_downloadable,
            'is_featured' => $m->is_featured,
            'has_file' => $m->hasActiveFile(),
            'file_status' => $m->file_status,
            'file_status_label' => $m->file_status_label,
            'file_format' => 'PDF',
            'active_version' => $m->activeFile ? 'v'.$m->activeFile->version.'.0' : '-',
            'file_size' => $m->activeFile ? $m->activeFile->formatted_size : '-',
            'category' => $m->categories->first() ? [
                'id' => $m->categories->first()->id,
                'name' => $m->categories->first()->name,
                'color' => $m->categories->first()->color,
            ] : null,
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

        return Inertia::render('Admin/Collections/Index', [
            'materials' => $materials,
            'categories' => $categories,
            'available_years' => $availableYears,
            'filters' => [
                'q' => $request->input('q', ''),
                'status' => $request->input('status', ''),
                'category' => $request->input('category', ''),
                'type' => $request->input('type', ''),
                'year' => $request->input('year', ''),
            ],
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

        return Inertia::render('Admin/Collections/Create', [
            'categories' => $categories,
            'audiences' => $audiences,
            'max_file_size_mb' => round(config('pustaka.max_file_size_kb', 51200) / 1024),
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
        $validated = $request->validated();
        $disk = config('pustaka.disk', 'local');
        $savedFilePath = null;

        // Handle cover image
        $coverPath = null;
        if ($request->hasFile('cover_file')) {
            $file = $request->file('cover_file');
            $filename = time().'_'.Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)).'.'.$file->getClientOriginalExtension();
            $file->move(public_path('images'), $filename);
            $coverPath = '/images/'.$filename;
        }

        $baseSlug = Str::slug($validated['title']);
        $slug = $baseSlug;
        $counter = 1;
        while (Material::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        try {
            $material = DB::transaction(function () use ($validated, $slug, $coverPath, $request, $disk, &$savedFilePath) {
                $created = Material::create([
                    'title' => $validated['title'],
                    'slug' => $slug,
                    'code' => $validated['code'] ?? strtoupper(Str::random(6)),
                    'author' => $validated['author'] ?? null,
                    'type' => $validated['type'],
                    'publication_year' => $validated['publication_year'] ?? date('Y'),
                    'page_count' => $validated['page_count'] ?? null,
                    'summary' => $validated['summary'] ?? null,
                    'description' => $validated['description'] ?? null,
                    'keywords' => $validated['keywords'] ?? null,
                    'admin_notes' => $validated['admin_notes'] ?? null,
                    'status' => $validated['status'],
                    'cover_path' => $coverPath,
                    'is_downloadable' => $request->boolean('is_downloadable'),
                    'is_featured' => $request->boolean('is_featured'),
                    'created_by' => auth()->id() ?? 1,
                    'published_at' => $validated['status'] === 'published' ? now() : null,
                ]);

                $created->categories()->sync([$validated['category_id'] => ['is_primary' => true]]);

                if ($request->filled('audiences')) {
                    $created->audiences()->sync((array) $request->input('audiences'));
                }

                // Handle private book PDF upload
                if ($request->hasFile('book_file')) {
                    $bookFile = $request->file('book_file');
                    $storageName = 'v1_'.Str::random(24).'.pdf';
                    $targetDirectory = "books/{$created->id}";
                    $savedFilePath = $bookFile->storeAs($targetDirectory, $storageName, $disk);

                    MaterialFile::create([
                        'material_id' => $created->id,
                        'kind' => 'primary',
                        'disk' => $disk,
                        'path' => $savedFilePath,
                        'storage_name' => $storageName,
                        'original_name' => $bookFile->getClientOriginalName(),
                        'mime_type' => 'application/pdf',
                        'extension' => 'pdf',
                        'size_bytes' => $bookFile->getSize(),
                        'version' => 1,
                        'is_active' => true,
                        'uploaded_by' => auth()->id(),
                    ]);
                }

                return $created;
            });
        } catch (Exception $e) {
            // Cleanup private storage file on database failure
            if ($savedFilePath && Storage::disk($disk)->exists($savedFilePath)) {
                Storage::disk($disk)->delete($savedFilePath);
            }
            Log::error('Gagal menyimpan materi baru: '.$e->getMessage(), ['exception' => $e]);

            return back()->withInput()->with('error', 'Terjadi kesalahan sistem saat menyimpan materi dan berkas.');
        }

        ActivityLog::record('material.created', $material, [
            'title' => $material->title,
            'status' => $material->status,
        ]);

        return redirect()->route('admin.materials.index')->with('success', 'Materi "'.$material->title.'" dan berkas digital berhasil disimpan.');
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

        $selectedCategoryId = $material->categories()->first()?->id;
        $selectedAudiences = $material->audiences()->pluck('audiences.id')->toArray();

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

        return Inertia::render('Admin/Collections/Edit', [
            'material' => [
                'id' => $material->id,
                'title' => $material->title,
                'slug' => $material->slug,
                'code' => $material->code,
                'author' => $material->author ?? '',
                'type' => $material->type,
                'publication_year' => $material->publication_year,
                'page_count' => $material->page_count,
                'summary' => $material->summary,
                'description' => $material->description,
                'keywords' => $material->keywords ?? '',
                'admin_notes' => $material->admin_notes ?? '',
                'status' => $material->status,
                'cover_path' => $material->cover_path,
                'is_downloadable' => (bool) $material->is_downloadable,
                'is_featured' => (bool) $material->is_featured,
                'category_id' => $selectedCategoryId,
                'audiences' => $selectedAudiences,
            ],
            'active_file' => $activeFile,
            'file_history' => $fileHistory,
            'categories' => $categories,
            'audiences' => $audiences,
            'max_file_size_mb' => round(config('pustaka.max_file_size_kb', 51200) / 1024),
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
        $validated = $request->validated();
        $disk = config('pustaka.disk', 'local');
        $savedFilePath = null;

        if ($request->hasFile('cover_file')) {
            $file = $request->file('cover_file');
            $filename = time().'_'.Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)).'.'.$file->getClientOriginalExtension();
            $file->move(public_path('images'), $filename);
            $material->cover_path = '/images/'.$filename;
        }

        $wasPublished = $material->status === 'published';
        $nowPublished = $validated['status'] === 'published';

        $material->fill([
            'title' => $validated['title'],
            'code' => $validated['code'] ?? $material->code,
            'author' => $validated['author'] ?? null,
            'type' => $validated['type'],
            'publication_year' => $validated['publication_year'],
            'page_count' => $validated['page_count'],
            'summary' => $validated['summary'],
            'description' => $validated['description'],
            'keywords' => $validated['keywords'] ?? null,
            'admin_notes' => $validated['admin_notes'] ?? null,
            'status' => $validated['status'],
            'is_downloadable' => $request->boolean('is_downloadable'),
            'is_featured' => $request->boolean('is_featured'),
        ]);

        if (! $wasPublished && $nowPublished) {
            $material->published_at = now();
            $material->reviewed_by = auth()->id();
            $material->reviewed_at = now();
        }

        try {
            DB::transaction(function () use ($material, $validated, $request, $disk, &$savedFilePath) {
                $material->save();
                $material->categories()->sync([$validated['category_id'] => ['is_primary' => true]]);

                if ($request->has('audiences')) {
                    $material->audiences()->sync((array) $request->input('audiences'));
                }

                // If new book file is provided during update, create next version
                if ($request->hasFile('book_file')) {
                    $bookFile = $request->file('book_file');
                    $nextVersion = ((int) $material->files()->max('version')) + 1;

                    // Deactivate existing files
                    $material->files()->update(['is_active' => false]);

                    $storageName = "v{$nextVersion}_".Str::random(24).'.pdf';
                    $targetDirectory = "books/{$material->id}";
                    $savedFilePath = $bookFile->storeAs($targetDirectory, $storageName, $disk);

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
                }
            });
        } catch (Exception $e) {
            if ($savedFilePath && Storage::disk($disk)->exists($savedFilePath)) {
                Storage::disk($disk)->delete($savedFilePath);
            }
            Log::error('Gagal memperbarui materi: '.$e->getMessage(), ['exception' => $e]);

            return back()->withInput()->with('error', 'Gagal memperbarui materi.');
        }

        ActivityLog::record('material.updated', $material, [
            'title' => $material->title,
            'status' => $material->status,
        ]);

        return redirect()->route('admin.materials.index')->with('success', 'Materi "'.$material->title.'" berhasil diperbarui.');
    }

    /**
     * Replace or upload new version of book file for material.
     */
    public function replaceFile(ReplaceMaterialFileRequest $request, Material $material): RedirectResponse
    {
        $bookFile = $request->file('book_file');
        $disk = config('pustaka.disk', 'local');
        $nextVersion = ((int) $material->files()->max('version')) + 1;

        $storageName = "v{$nextVersion}_".Str::random(24).'.pdf';
        $targetDirectory = "books/{$material->id}";
        $savedFilePath = $bookFile->storeAs($targetDirectory, $storageName, $disk);

        try {
            DB::transaction(function () use ($material, $disk, $savedFilePath, $storageName, $bookFile, $nextVersion) {
                // Set existing active files to inactive
                $material->files()->update(['is_active' => false]);

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
            });
        } catch (Exception $e) {
            if (Storage::disk($disk)->exists($savedFilePath)) {
                Storage::disk($disk)->delete($savedFilePath);
            }
            Log::error('Gagal mengganti berkas buku: '.$e->getMessage());

            return back()->with('error', 'Gagal menyimpan versi berkas baru.');
        }

        ActivityLog::record('material.file_replaced', $material, [
            'title' => $material->title,
            'version' => $nextVersion,
            'file_name' => $bookFile->getClientOriginalName(),
        ]);

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

        $material->save();

        ActivityLog::record('material.status_updated', $material, [
            'from' => $oldStatus,
            'to' => $material->status,
        ]);

        return back()->with('success', 'Status materi "'.$material->title.'" diubah menjadi '.$material->status_label.'.');
    }

    /**
     * Remove the specified material from storage.
     */
    public function destroy(Material $material): RedirectResponse
    {
        Gate::authorize('delete', $material);

        $title = $material->title;
        $material->delete();

        ActivityLog::record('material.deleted', null, [
            'title' => $title,
        ]);

        return redirect()->route('admin.materials.index')->with('success', 'Materi "'.$title.'" berhasil dihapus dari sistem.');
    }
}
