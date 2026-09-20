<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ImportLearningModulesRequest;
use App\Http\Requests\Admin\StoreLearningModuleRequest;
use App\Http\Requests\Admin\UpdateLearningModuleRequest;
use App\Models\Category;
use App\Models\Event;
use App\Models\LearningModule;
use App\Models\Material;
use App\Models\MaterialFile;
use App\Models\ParticipantTrack;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class LearningModuleController extends Controller
{
    public function downloadImportTemplate(): StreamedResponse
    {
        return response()->streamDownload(function (): void {
            $output = fopen('php://output', 'w');
            fputcsv($output, ['code', 'title', 'category', 'level', 'total_jp', 'status', 'description', 'keywords']);
            fclose($output);
        }, 'format-modul-pembelajaran.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    public function import(ImportLearningModulesRequest $request): RedirectResponse
    {
        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');
        $requiredHeaders = ['code', 'title', 'category', 'level', 'total_jp', 'status', 'description', 'keywords'];

        try {
            $headers = fgetcsv($handle, 0, ',', '"', '');
            if (! is_array($headers)) {
                throw ValidationException::withMessages(['file' => 'Berkas CSV kosong. Unduh format lalu isi data modul.']);
            }

            $headers = array_map(fn ($header) => trim(str_replace("\xEF\xBB\xBF", '', $header)), $headers);
            if ($headers !== $requiredHeaders) {
                throw ValidationException::withMessages(['file' => 'Kolom CSV tidak sesuai format. Unduh format terbaru dan gunakan urutan kolom yang tersedia.']);
            }

            $rows = [];
            $seenCodes = [];
            $codeLines = [];
            $line = 1;
            while (($values = fgetcsv($handle, 0, ',', '"', '')) !== false) {
                $line++;
                if ($values === [null]) {
                    continue;
                }
                if ($line > 501) {
                    throw ValidationException::withMessages(['file' => 'Impor dibatasi 500 baris data per berkas.']);
                }
                if (count($values) !== count($requiredHeaders)) {
                    throw ValidationException::withMessages(['file' => "Baris {$line}: jumlah kolom tidak sesuai format."]);
                }

                $row = array_combine($requiredHeaders, array_map('trim', $values));
                $validator = Validator::make($row, [
                    'code' => ['required', 'string', 'max:50', 'alpha_dash:ascii'],
                    'title' => ['required', 'string', 'max:255'],
                    'category' => ['required', 'string', 'max:100'],
                    'level' => ['required', 'string', 'max:50'],
                    'total_jp' => ['required', 'integer', 'min:1'],
                    'status' => ['required', 'in:draft,active,inactive,archived'],
                    'description' => ['nullable', 'string'],
                    'keywords' => ['nullable', 'string', 'max:255'],
                ]);
                if ($validator->fails()) {
                    throw ValidationException::withMessages(['file' => "Baris {$line}: {$validator->errors()->first()}"]);
                }

                $codeKey = strtolower($row['code']);
                if (isset($seenCodes[$codeKey])) {
                    throw ValidationException::withMessages(['file' => "Baris {$line}: kode modul duplikat dalam berkas."]);
                }
                $seenCodes[$codeKey] = true;
                $codeLines[$row['code']] = $line;
                $rows[] = $row;
            }

            if ($rows === []) {
                throw ValidationException::withMessages(['file' => 'Belum ada baris modul untuk diimpor.']);
            }

            $existingCode = LearningModule::query()
                ->whereIn('code', array_keys($codeLines))
                ->value('code');

            if ($existingCode !== null) {
                throw ValidationException::withMessages([
                    'file' => "Baris {$codeLines[$existingCode]}: kode modul sudah digunakan.",
                ]);
            }

            $timestamp = now();
            $targetEventId = $request->filled('event_id') ? (int) $request->input('event_id') : null;
            $insertRows = collect($rows)
                ->map(fn (array $row) => [
                    ...$row,
                    'event_id' => $targetEventId,
                    'description' => $row['description'] ?: null,
                    'keywords' => $row['keywords'] ?: null,
                    'slug' => Str::slug($row['title']).'-'.strtolower(Str::random(5)),
                    'created_by' => $request->user()->id,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ])
                ->all();

            DB::transaction(fn () => LearningModule::query()->insert($insertRows));

            return back()->with('success', count($rows).' modul pembelajaran berhasil diimpor.');
        } finally {
            fclose($handle);
        }
    }

    /**
     * Display listing of learning modules with filters and stats.
     */
    public function index(Request $request): Response
    {
        $query = LearningModule::query()
            ->with(['creator:id,name', 'materials:id,title,slug,type,cover_path', 'event:id,title'])
            ->withCount(['materials', 'events', 'sessions', 'questionModules']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                    ->orWhere('code', 'ilike', "%{$search}%")
                    ->orWhere('category', 'ilike', "%{$search}%")
                    ->orWhere('keywords', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('category') && $request->input('category') !== 'all') {
            $query->where('category', $request->input('category'));
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('track') && $request->input('track') !== 'all') {
            $track = $request->input('track');
            $query->whereJsonContains('track_codes', $track);
        }

        if ($request->filled('scope') && $request->input('scope') !== 'all') {
            $scope = $request->input('scope');
            if ($scope === 'master') {
                $query->whereNull('event_id');
            } elseif (is_numeric($scope)) {
                $query->where('event_id', (int) $scope);
            }
        }

        $modules = $query->latest()->paginate(15)->withQueryString();

        $tracks = ParticipantTrack::orderBy('sort_order')->get(['id', 'code', 'name', 'color']);
        $categories = LearningModule::select('category')->distinct()->whereNotNull('category')->pluck('category');
        $availableMaterials = Material::where('status', 'published')
            ->select('id', 'title', 'slug', 'type', 'author', 'cover_path')
            ->orderBy('title')
            ->get();
        $events = Event::select('id', 'title', 'slug', 'start_date')->latest('start_date')->get();

        $moduleStats = LearningModule::query()->selectRaw(
            "COUNT(*) as total,
             SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
             SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft",
        )->firstOrFail();
        $stats = [
            'total' => (int) $moduleStats->total,
            'active' => (int) $moduleStats->active,
            'draft' => (int) $moduleStats->draft,
            'total_materials_linked' => \DB::table('learning_module_materials')->distinct('material_id')->count('material_id'),
        ];

        return Inertia::render('Admin/Master/LearningModules/Index', [
            'modules' => $modules,
            'tracks' => $tracks,
            'categories' => $categories,
            'materialCategories' => Category::select('id', 'name', 'slug')->orderBy('sort_order')->get(),
            'availableMaterials' => $availableMaterials,
            'events' => $events,
            'stats' => $stats,
            'filters' => $request->only(['search', 'category', 'status', 'track', 'scope']),
        ]);
    }

    /**
     * Store a newly created learning module.
     */
    public function store(StoreLearningModuleRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['slug'] = Str::slug($validated['title']).'-'.strtolower(Str::random(5));
        $validated['created_by'] = $request->user()?->id;
        $module = DB::transaction(function () use ($validated, $request): LearningModule {
            $module = LearningModule::create($validated);
            $this->syncMaterials($module, $validated['materials'] ?? null);

            if ($request->hasFile('material_file')) {
                $file = $request->file('material_file');
                $matTitle = $request->input('material_title') ?: $module->title;
                $disk = config('pustaka.disk', 'local');
                $slug = Str::slug($matTitle).'-'.strtolower(Str::random(5));
                $code = 'MAT-'.strtoupper(Str::random(6));

                $material = Material::create([
                    'title' => $matTitle,
                    'slug' => $slug,
                    'code' => $code,
                    'author' => $request->user()?->name ?: 'PERKEMI',
                    'type' => 'document',
                    'source_type' => 'uploaded_pdf',
                    'status' => 'published',
                    'publication_year' => (int) date('Y'),
                    'published_at' => now(),
                    'created_by' => $request->user()?->id,
                    'is_downloadable' => true,
                    'allow_download' => true,
                ]);

                $categoryId = Category::where('slug', 'modul-penataran')->value('id') ?? Category::value('id');
                if ($categoryId) {
                    $material->categories()->sync([$categoryId => ['is_primary' => true]]);
                }

                $nextVersion = 1;
                $storageName = "v{$nextVersion}_".Str::random(24).'.pdf';
                $savedFilePath = $file->storeAs("books/{$material->id}", $storageName, $disk);

                MaterialFile::create([
                    'material_id' => $material->id,
                    'kind' => 'primary',
                    'disk' => $disk,
                    'path' => $savedFilePath,
                    'storage_name' => $storageName,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => 'application/pdf',
                    'extension' => 'pdf',
                    'size_bytes' => $file->getSize(),
                    'version' => $nextVersion,
                    'is_active' => true,
                    'uploaded_by' => $request->user()?->id,
                ]);

                $module->materials()->attach($material->id, [
                    'sort_order' => 1,
                    'is_required' => true,
                    'estimated_duration_minutes' => 45,
                ]);
            }

            return $module;
        });

        return redirect()->route('admin.master.modul-pembelajaran.index')
            ->with('success', "Modul Pembelajaran '{$module->title}' berhasil dibuat.");
    }

    /**
     * Update an existing learning module.
     */
    public function update(UpdateLearningModuleRequest $request, LearningModule $module): RedirectResponse
    {
        $validated = $request->validated();
        if ($module->title !== $validated['title']) {
            $validated['slug'] = Str::slug($validated['title']).'-'.strtolower(Str::random(5));
        }

        DB::transaction(function () use ($module, $validated): void {
            $module->update($validated);
            if (array_key_exists('materials', $validated)) {
                $this->syncMaterials($module, $validated['materials']);
            }
        });

        return redirect()->route('admin.master.modul-pembelajaran.index')
            ->with('success', "Modul Pembelajaran '{$module->title}' berhasil diperbarui.");
    }

    /**
     * Archive learning module.
     */
    public function archive(LearningModule $module): RedirectResponse
    {
        $module->update(['status' => 'archived']);

        return back()->with('success', "Modul Pembelajaran '{$module->title}' telah diarsipkan.");
    }

    /**
     * Delete learning module if not utilized in event/rundown.
     */
    public function destroy(LearningModule $module): RedirectResponse
    {
        if ($module->events()->exists() || $module->sessions()->exists()) {
            return back()->with('error', 'Modul Pembelajaran tidak dapat dihapus karena sudah digunakan dalam Event atau Rundown Sesi. Silakan gunakan opsi arsipkan.');
        }

        $title = $module->title;
        DB::transaction(function () use ($module): void {
            $module->materials()->detach();
            $module->delete();
        });

        return redirect()->route('admin.master.modul-pembelajaran.index')
            ->with('success', "Modul Pembelajaran '{$title}' berhasil dihapus.");
    }

    /**
     * Link module to an event directly.
     */
    public function linkToEvent(Request $request, LearningModule $module): RedirectResponse
    {
        $validated = $request->validate([
            'event_id' => ['required', 'exists:events,id'],
            'participant_path_id' => ['nullable', 'string'],
            'is_required' => ['nullable', 'boolean'],
        ]);

        $event = DB::transaction(function () use ($validated, $module): Event {
            $event = Event::query()->lockForUpdate()->findOrFail($validated['event_id']);
            $sortOrder = $event->learningModules()->count() + 1;

            $event->learningModules()->syncWithoutDetaching([
                $module->id => [
                    'participant_path_id' => $validated['participant_path_id'] ?? null,
                    'is_required' => $validated['is_required'] ?? true,
                    'sort_order' => $sortOrder,
                ],
            ]);

            return $event;
        });

        return back()->with('success', "Modul '{$module->title}' berhasil dihubungkan ke event '{$event->title}'.");
    }

    /**
     * Upload a new material PDF directly and link to module.
     */
    public function uploadMaterial(Request $request, LearningModule $module): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'file' => ['required', 'file', 'mimes:pdf', 'max:51200'],
            'author' => ['nullable', 'string', 'max:255'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'is_required' => ['nullable', 'boolean'],
            'estimated_duration_minutes' => ['nullable', 'integer', 'min:1'],
            'instructor_notes' => ['nullable', 'string'],
        ], [
            'file.required' => 'Silakan pilih berkas materi PDF yang akan diunggah.',
            'file.mimes' => 'Format berkas materi harus berupa PDF.',
            'file.max' => 'Ukuran berkas materi maksimal 50 MB.',
        ]);

        $file = $request->file('file');
        $disk = config('pustaka.disk', 'local');
        $savedFilePath = null;

        try {
            DB::transaction(function () use ($request, $validated, $module, $file, $disk, &$savedFilePath): void {
                $slug = Str::slug($validated['title']).'-'.strtolower(Str::random(5));
                $code = 'MAT-'.strtoupper(Str::random(6));

                $material = Material::create([
                    'title' => $validated['title'],
                    'slug' => $slug,
                    'code' => $code,
                    'author' => $validated['author'] ?: ($request->user()?->name ?: 'PERKEMI'),
                    'type' => 'document',
                    'source_type' => 'uploaded_pdf',
                    'status' => 'published',
                    'publication_year' => (int) date('Y'),
                    'published_at' => now(),
                    'created_by' => $request->user()?->id,
                    'is_downloadable' => true,
                    'allow_download' => true,
                ]);

                $categoryId = $validated['category_id'] ?? (Category::where('slug', 'modul-penataran')->value('id') ?? Category::value('id'));
                if ($categoryId) {
                    $material->categories()->sync([$categoryId => ['is_primary' => true]]);
                }

                $nextVersion = 1;
                $storageName = "v{$nextVersion}_".Str::random(24).'.pdf';
                $savedFilePath = $file->storeAs("books/{$material->id}", $storageName, $disk);

                MaterialFile::create([
                    'material_id' => $material->id,
                    'kind' => 'primary',
                    'disk' => $disk,
                    'path' => $savedFilePath,
                    'storage_name' => $storageName,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => 'application/pdf',
                    'extension' => 'pdf',
                    'size_bytes' => $file->getSize(),
                    'version' => $nextVersion,
                    'is_active' => true,
                    'uploaded_by' => $request->user()?->id,
                ]);

                $sortOrder = $module->materials()->count() + 1;
                $module->materials()->syncWithoutDetaching([
                    $material->id => [
                        'sort_order' => $sortOrder,
                        'is_required' => $request->boolean('is_required', true),
                        'instructor_notes' => $validated['instructor_notes'] ?? null,
                        'estimated_duration_minutes' => $validated['estimated_duration_minutes'] ?? 45,
                    ],
                ]);
            });
        } catch (Throwable $e) {
            if ($savedFilePath !== null && Storage::disk($disk)->exists($savedFilePath)) {
                Storage::disk($disk)->delete($savedFilePath);
            }
            throw $e;
        }

        return back()->with('success', "Berkas materi '{$validated['title']}' berhasil diunggah dan terhubung ke modul.");
    }

    /**
     * Update connected materials list for a learning module.
     */
    public function updateMaterials(Request $request, LearningModule $module): RedirectResponse
    {
        $validated = $request->validate([
            'materials' => ['nullable', 'array'],
            'materials.*.material_id' => ['required', 'exists:materials,id'],
            'materials.*.sort_order' => ['nullable', 'integer'],
            'materials.*.is_required' => ['nullable', 'boolean'],
            'materials.*.instructor_notes' => ['nullable', 'string'],
            'materials.*.estimated_duration_minutes' => ['nullable', 'integer', 'min:1'],
        ]);

        $this->syncMaterials($module, $validated['materials'] ?? []);

        return back()->with('success', "Daftar materi modul '{$module->title}' berhasil diperbarui.");
    }

    /**
     * @param  array<int, array<string, mixed>>|null  $materials
     */
    private function syncMaterials(LearningModule $module, ?array $materials): void
    {
        if ($materials === null) {
            return;
        }

        $syncData = [];
        foreach ($materials as $index => $item) {
            $syncData[$item['material_id']] = [
                'sort_order' => $item['sort_order'] ?? ($index + 1),
                'is_required' => $item['is_required'] ?? true,
                'instructor_notes' => $item['instructor_notes'] ?? null,
                'estimated_duration_minutes' => $item['estimated_duration_minutes'] ?? null,
            ];
        }

        $module->materials()->sync($syncData);
    }
}
