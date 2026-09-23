<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCbtPackageRequest;
use App\Http\Requests\Admin\UpdateCbtPackageRequest;
use App\Models\CbtExamPackage;
use App\Models\Event;
use App\Models\ParticipantTrack;
use App\Models\QuestionBank;
use App\Models\QuestionModule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CbtPackageController extends Controller
{
    /**
     * Display master listing of CBT exam packages.
     */
    public function index(Request $request): Response
    {
        $query = CbtExamPackage::query()
            ->with(['questionModule:id,title,code', 'event:id,title,slug'])
            ->withCount(['bankQuestions', 'attempts']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                    ->orWhere('code', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('exam_type') && $request->input('exam_type') !== 'all') {
            $query->where('exam_type', $request->input('exam_type'));
        }

        if ($request->filled('scope') && $request->input('scope') !== 'all') {
            $scope = $request->input('scope');
            if ($scope === 'master') {
                $query->whereNull('event_id');
            } elseif (is_numeric($scope)) {
                $query->where('event_id', (int) $scope);
            }
        }

        $packages = $query->latest('id')->paginate(15)->withQueryString();
        $packages->getCollection()->each->append('blueprint_modules');

        $modules = QuestionModule::withCount(['questions' => fn ($q) => $q->where('status', 'active')])
            ->orderBy('title')
            ->get(['id', 'title', 'code']);
        $tracks = ParticipantTrack::orderBy('sort_order')->get(['id', 'code', 'name', 'color']);
        $events = Event::select('id', 'title', 'slug')->latest('start_date')->get();

        $packageStats = CbtExamPackage::query()->selectRaw(
            "COUNT(*) as total,
             SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) as ready,
             SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open",
        )->firstOrFail();
        $stats = [
            'total' => (int) $packageStats->total,
            'ready' => (int) $packageStats->ready,
            'open' => (int) $packageStats->open,
            'total_attempts' => DB::table('cbt_exam_attempts')->count(),
        ];

        return Inertia::render('Admin/Cbt/Packages/Index', [
            'packages' => $packages,
            'questionModules' => $modules,
            'tracks' => $tracks,
            'events' => $events,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'exam_type', 'scope']),
        ]);
    }

    /**
     * Show detail and question manager for a CBT package.
     */
    public function show(CbtExamPackage $package): Response
    {
        $package->load([
            'event:id,title,slug',
            'questionModule:id,title,code',
            'bankQuestions' => function ($q) {
                $q->with('questionModule:id,title,code')
                    ->select([
                        'question_bank.id',
                        'question_bank.question_module_id',
                        'question_bank.code',
                        'question_bank.question_text',
                        'question_bank.question_type',
                        'question_bank.points',
                        'question_bank.difficulty_level',
                        'question_bank.exam_stage',
                        'question_bank.metadata',
                        'question_bank.status',
                    ]);
            },
            'attempts' => function ($q) {
                $q->with('participant:id,name,dan_rank')
                    ->latest()
                    ->take(50);
            },
        ]);
        $package->append('blueprint_modules');

        $availableQuestions = QuestionBank::where('status', 'active')
            ->with('questionModule:id,title,code')
            ->select(['id', 'question_module_id', 'code', 'question_text', 'question_type', 'points', 'difficulty_level', 'exam_stage', 'metadata', 'status'])
            ->orderBy('id', 'desc')
            ->get();

        $tracks = ParticipantTrack::orderBy('sort_order')->get(['id', 'code', 'name', 'color']);
        $modules = QuestionModule::withCount(['questions' => fn ($q) => $q->where('status', 'active')])
            ->orderBy('title')
            ->get(['id', 'title', 'code']);

        return Inertia::render('Admin/Cbt/Packages/Show', [
            'package' => $package,
            'availableQuestions' => $availableQuestions,
            'tracks' => $tracks,
            'questionModules' => $modules,
        ]);
    }

    /**
     * Store newly created CBT package.
     */
    public function store(StoreCbtPackageRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        if (empty($validated['question_module_id']) && ! empty($validated['question_module_ids'])) {
            $validated['question_module_id'] = $validated['question_module_ids'][0];
        }

        // Auto-sync questions from selected modules by default whenever modules are chosen
        if (empty($validated['question_ids'])) {
            $moduleIds = (array) ($validated['question_module_ids'] ?? []);
            if (! empty($validated['question_module_id']) && ! in_array($validated['question_module_id'], $moduleIds, false)) {
                $moduleIds[] = $validated['question_module_id'];
            }

            if (! empty($moduleIds)) {
                $quotas = $validated['question_module_quotas'] ?? [];
                $method = $validated['selection_method'] ?? 'random';
                $validated['question_ids'] = $this->resolveQuestionsFromModules($moduleIds, $quotas, $method);
            }
        }

        $package = DB::transaction(function () use ($validated): CbtExamPackage {
            $package = CbtExamPackage::create($validated);
            $this->syncQuestionSelection($package, $validated['question_ids'] ?? null);

            return $package;
        });

        return redirect()->route('admin.cbt.paket-ujian.show', $package->id)
            ->with('success', "Paket Ujian '{$package->title}' berhasil dibuat dengan {$package->total_questions} butir soal.");
    }

    /**
     * Pull and sync questions from the package's blueprint modules according to quotas.
     */
    public function pullFromBlueprintModules(Request $request, CbtExamPackage $package): RedirectResponse
    {
        if ($package->attempts()->exists()) {
            return back()->with('error', 'Susunan soal tidak dapat diubah karena peserta sudah mulai mengerjakan.');
        }

        $moduleIds = (array) ($package->question_module_ids ?? []);
        if ($package->question_module_id && ! in_array($package->question_module_id, $moduleIds, false)) {
            $moduleIds[] = $package->question_module_id;
        }

        if (empty($moduleIds)) {
            return back()->with('error', 'Paket ujian ini belum memiliki modul blueprint yang terhubung.');
        }

        $quotas = $request->input('question_module_quotas', $package->question_module_quotas ?? []);
        $method = $request->input('selection_method', 'random');

        $questionIds = $this->resolveQuestionsFromModules($moduleIds, $quotas, $method);

        if (empty($questionIds)) {
            return back()->with('error', 'Tidak ditemukan butir soal aktif pada modul blueprint yang terhubung.');
        }

        DB::transaction(function () use ($package, $quotas, $questionIds): void {
            if ($quotas !== null) {
                $package->update(['question_module_quotas' => $quotas]);
            }
            $this->syncQuestionSelection($package, $questionIds);
        });

        return back()->with('success', 'Berhasil menyinkronkan '.count($questionIds).' butir soal dari modul blueprint.');
    }

    /**
     * Update an existing CBT package.
     */
    public function update(UpdateCbtPackageRequest $request, CbtExamPackage $package): RedirectResponse
    {
        // Snapshot protection: if attempts already exist, do not modify question composition directly
        if ($package->attempts()->exists() && ($request->has('question_ids') || $request->boolean('sync_questions'))) {
            return back()->with('error', 'Paket ujian sudah memiliki rekaman pengerjaan peserta. Susunan soal telah terkunci.');
        }

        $validated = $request->validated();
        if (empty($validated['question_module_id']) && ! empty($validated['question_module_ids'])) {
            $validated['question_module_id'] = $validated['question_module_ids'][0];
        }

        DB::transaction(function () use ($package, $validated, $request): void {
            $package->update($validated);
            if (array_key_exists('question_ids', $validated)) {
                $this->syncQuestionSelection($package, $validated['question_ids']);
            } elseif ($request->boolean('sync_questions') && ! empty($validated['question_module_ids'] ?? $package->question_module_ids)) {
                $moduleIds = (array) ($validated['question_module_ids'] ?? $package->question_module_ids);
                $quotas = $validated['question_module_quotas'] ?? $package->question_module_quotas ?? [];
                $method = $request->input('selection_method', 'random');
                $questionIds = $this->resolveQuestionsFromModules($moduleIds, $quotas, $method);
                $this->syncQuestionSelection($package, $questionIds);
            }
        });

        return back()->with('success', "Paket Ujian '{$package->title}' berhasil diperbarui.");
    }

    /**
     * Resolve question IDs from given module IDs according to quotas and selection method.
     *
     * @param  array<int|string>  $moduleIds
     * @param  array<string|int, mixed>|null  $quotas
     * @return array<int>
     */
    protected function resolveQuestionsFromModules(
        array $moduleIds,
        ?array $quotas = null,
        string $selectionMethod = 'random'
    ): array {
        $selectedQuestionIds = [];

        foreach ($moduleIds as $moduleId) {
            $rawQuota = $quotas[$moduleId] ?? $quotas[(string) $moduleId] ?? null;
            $count = is_array($rawQuota) ? ($rawQuota['count'] ?? null) : $rawQuota;
            $mode = is_array($rawQuota) ? ($rawQuota['mode'] ?? ($count ? 'custom' : 'all')) : ($count ? 'custom' : 'all');

            $count = ($mode === 'custom' && is_numeric($count) && (int) $count > 0)
                ? (int) $count
                : null;

            $query = QuestionBank::where('status', 'active')
                ->whereHas('questionModules', fn ($q) => $q->where('question_modules.id', $moduleId));

            if ($selectionMethod === 'random') {
                $query->inRandomOrder();
            } else {
                $query->orderBy('id', 'asc');
            }

            if ($count !== null) {
                $moduleQuestionIds = $query->take($count)->pluck('id')->all();
            } else {
                $moduleQuestionIds = $query->pluck('id')->all();
            }

            $selectedQuestionIds = array_merge($selectedQuestionIds, $moduleQuestionIds);
        }

        return array_values(array_unique($selectedQuestionIds));
    }

    /**
     * Set status to ready with strict validations:
     * - Minimum 1 active question
     * - No inactive or archived questions
     * - Valid duration and attempts
     */
    public function setReady(CbtExamPackage $package): RedirectResponse
    {
        $questions = $package->bankQuestions;

        if ($questions->isEmpty()) {
            return back()->with('error', 'Paket CBT harus memiliki minimal satu soal sebelum dapat disiapkan.');
        }

        $hasInactive = $questions->contains(fn ($q) => $q->status !== 'active');
        if ($hasInactive) {
            return back()->with('error', 'Paket CBT memuat soal yang nonaktif atau diarsipkan. Harap periksa kembali butir soal.');
        }

        $package->update([
            'status' => 'ready',
            'total_questions' => $questions->count(),
        ]);

        return back()->with('success', "Paket Ujian '{$package->title}' telah divalidasi dan Siap Digunakan.");
    }

    /**
     * Update package status directly (open / closed / archived).
     */
    public function updateStatus(Request $request, CbtExamPackage $package): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:draft,ready,open,closed,archived'],
        ]);

        if ($validated['status'] === 'ready') {
            return $this->setReady($package);
        }

        $package->update(['status' => $validated['status']]);

        return back()->with('success', "Status Paket Ujian '{$package->title}' diubah menjadi {$package->status_label}.");
    }

    /**
     * Sync / attach questions to CBT package.
     */
    public function syncQuestions(Request $request, CbtExamPackage $package): RedirectResponse
    {
        if ($package->attempts()->exists()) {
            return back()->with('error', 'Susunan soal tidak dapat diubah karena peserta sudah mulai mengerjakan.');
        }

        $validated = $request->validate([
            'question_ids' => ['required', 'array'],
            'question_ids.*' => ['exists:question_bank,id'],
        ]);

        DB::transaction(fn () => $this->syncQuestionSelection($package, $validated['question_ids']));

        return back()->with('success', 'Butir soal paket ujian berhasil diperbarui.');
    }

    /**
     * Delete a CBT package.
     */
    public function destroy(Request $request, CbtExamPackage $package): RedirectResponse
    {
        $attemptsCount = $package->attempts()->count();
        $sessionsCount = $package->sessions()->count();

        if (($attemptsCount > 0 || $sessionsCount > 0) && ! $request->boolean('force')) {
            $reason = $attemptsCount > 0
                ? "sudah memiliki {$attemptsCount} rekaman pengerjaan ujian peserta"
                : "terhubung ke {$sessionsCount} sesi rundown acara";

            return back()->with('error', "Paket Ujian '{$package->title}' tidak dapat dihapus karena {$reason}.");
        }

        $title = $package->title;

        DB::transaction(function () use ($package, $attemptsCount): void {
            if ($attemptsCount > 0) {
                foreach ($package->attempts as $attempt) {
                    $attempt->answers()->delete();
                    $attempt->proctoringEvents()->delete();
                    $attempt->delete();
                }
            }

            $package->bankQuestions()->detach();
            $package->events()->detach();
            $package->questions()->delete();
            $package->delete();
        });

        if ($request->header('Referer') && str_contains($request->header('Referer'), "/admin/cbt/paket-ujian/{$package->id}")) {
            return redirect()->route('cbt.paket-ujian.index')
                ->with('success', "Paket Ujian CBT '{$title}' berhasil dihapus.");
        }

        return back()->with('success', "Paket Ujian CBT '{$title}' berhasil dihapus.");
    }

    /**
     * @param  array<int, int|string>|null  $questionIds
     */
    private function syncQuestionSelection(CbtExamPackage $package, ?array $questionIds): void
    {
        if ($questionIds === null) {
            return;
        }

        $sync = [];
        foreach ($questionIds as $index => $questionId) {
            $sync[$questionId] = ['sort_order' => $index + 1, 'points' => 1.00];
        }

        $package->bankQuestions()->sync($sync);
        $package->update(['total_questions' => count($questionIds)]);
    }

    /**
     * Download blank CSV template for CBT package import.
     */
    public function downloadTemplate(): StreamedResponse
    {
        return response()->streamDownload(function (): void {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['code', 'title', 'exam_type', 'duration_minutes', 'passing_score', 'attempts_allowed', 'randomize_questions', 'randomize_answers', 'description', 'instructions']);
            fputcsv($out, ['CBT-CONTOH-01', 'Ujian Teori Wasit Daerah 2026', 'theory', '60', '75.0', '1', '1', '1', 'Evaluasi teori tertulis untuk peserta wasit daerah', 'Kerjakan dengan teliti dan jujur']);
            fclose($out);
        }, 'format-paket-cbt.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * Import CBT exam packages from CSV.
     */
    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:10240'],
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
                    if (! isset($row['title']) || empty($row['title'])) {
                        continue;
                    }

                    $code = ! empty($row['code']) ? $row['code'] : 'CBT-'.strtoupper(Str::random(8));

                    CbtExamPackage::updateOrCreate(
                        ['code' => $code],
                        [
                            'event_id' => $targetEventId,
                            'title' => $row['title'],
                            'exam_type' => $row['exam_type'] ?? 'theory',
                            'duration_minutes' => (int) ($row['duration_minutes'] ?? 60),
                            'passing_score' => (float) ($row['passing_score'] ?? 75.0),
                            'attempts_allowed' => (int) ($row['attempts_allowed'] ?? 1),
                            'randomize_questions' => ! empty($row['randomize_questions']) && $row['randomize_questions'] != '0',
                            'randomize_answers' => ! empty($row['randomize_answers']) && $row['randomize_answers'] != '0',
                            'description' => $row['description'] ?? null,
                            'instructions' => $row['instructions'] ?? 'Bacalah setiap butir soal dengan cermat.',
                            'status' => 'draft',
                        ]
                    );
                    $count++;
                }
            });

            $scopeLabel = $targetEventId ? 'khusus event' : 'Master Diktar';

            return back()->with('success', "{$count} paket ujian CBT {$scopeLabel} berhasil diimpor.");
        } finally {
            fclose($handle);
        }
    }

    /**
     * Export CBT exam packages to CSV based on active filters.
     */
    public function export(Request $request): StreamedResponse
    {
        $query = CbtExamPackage::query()->with(['event:id,title'])->withCount(['bankQuestions', 'attempts']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                    ->orWhere('code', 'ilike', "%{$search}%");
            });
        }
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }
        if ($request->filled('exam_type') && $request->input('exam_type') !== 'all') {
            $query->where('exam_type', $request->input('exam_type'));
        }
        if ($request->filled('scope') && $request->input('scope') !== 'all') {
            $scope = $request->input('scope');
            if ($scope === 'master') {
                $query->whereNull('event_id');
            } elseif (is_numeric($scope)) {
                $query->where('event_id', (int) $scope);
            }
        }

        $packages = $query->latest('id')->get();

        return response()->streamDownload(function () use ($packages): void {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Kode', 'Judul Paket Ujian', 'Tipe Ujian', 'Cakupan', 'Durasi (Menit)', 'Nilai Kelulusan', 'Total Soal', 'Total Peserta Mengerjakan', 'Status']);
            foreach ($packages as $p) {
                fputcsv($out, [
                    $p->code,
                    $p->title,
                    $p->exam_type,
                    $p->event ? "Event: {$p->event->title}" : 'Master Diktar (Lintas Event)',
                    $p->duration_minutes,
                    $p->passing_score,
                    $p->bank_questions_count,
                    $p->attempts_count,
                    $p->status,
                ]);
            }
            fclose($out);
        }, 'master-paket-cbt-'.date('Ymd-His').'.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
