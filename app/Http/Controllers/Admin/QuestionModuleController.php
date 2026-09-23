<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ImportQuestionModuleRequest;
use App\Http\Requests\Admin\StoreQuestionModuleRequest;
use App\Http\Requests\Admin\UpdateQuestionModuleRequest;
use App\Models\ActivityLog;
use App\Models\CbtExamAttempt;
use App\Models\CbtExamPackage;
use App\Models\Event;
use App\Models\LearningModule;
use App\Models\ParticipantTrack;
use App\Models\QuestionBank;
use App\Models\QuestionModule;
use App\Services\QuestionModuleExportService;
use App\Services\QuestionModuleImportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class QuestionModuleController extends Controller
{
    /**
     * Display listing of question blueprint modules.
     */
    public function index(Request $request): Response
    {
        $query = QuestionModule::query()
            ->with(['learningModule:id,title,code', 'creator:id,name', 'event:id,title'])
            ->withCount(['questions', 'cbtPackages']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                    ->orWhere('code', 'ilike', "%{$search}%")
                    ->orWhere('category', 'ilike', "%{$search}%");
            });
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
        $learningModules = LearningModule::select('id', 'title', 'code')->orderBy('title')->get();
        $events = Event::select('id', 'title', 'slug', 'start_date')->latest('start_date')->get();

        $moduleStats = QuestionModule::query()->selectRaw(
            "COUNT(*) as total,
             SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
             SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft",
        )->firstOrFail();
        $stats = [
            'total' => (int) $moduleStats->total,
            'active' => (int) $moduleStats->active,
            'draft' => (int) $moduleStats->draft,
            'total_questions' => \DB::table('question_bank')->count(),
        ];

        return Inertia::render('Admin/Master/QuestionModules/Index', [
            'modules' => $modules,
            'tracks' => $tracks,
            'learningModules' => $learningModules,
            'events' => $events,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'track', 'scope']),
        ]);
    }

    /**
     * Download blank template (.xlsx) for import.
     */
    public function downloadBlankTemplate(QuestionModuleExportService $exportService): BinaryFileResponse
    {
        $tempFile = $exportService->generateBlankTemplateFile();

        return response()->download($tempFile, 'format-master-bank-soal-perkemi.xlsx', [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])->deleteFileAfterSend(true);
    }

    /**
     * Import question module and bank soal from multi-sheet Excel (.xlsx).
     */
    public function import(ImportQuestionModuleRequest $request, QuestionModuleImportService $importService): RedirectResponse
    {
        $file = $request->file('file');
        $userId = $request->user()?->id;
        $eventId = $request->filled('event_id') ? (int) $request->input('event_id') : null;

        $stats = $importService->import($file, $userId, $eventId);

        $scopeLabel = $eventId ? 'khusus event' : 'Master Diktar';
        $msg = "Impor {$scopeLabel} berhasil! Total {$stats['total_questions']} butir soal ({$stats['pre_test_count']} Pre-test, {$stats['quiz_count']} Kuis, {$stats['post_test_count']} Post-test) ke dalam {$stats['modules_count']} modul soal.";

        return redirect()->route('admin.master.modul-soal.index')->with('success', $msg);
    }

    /**
     * Export filtered question modules as CSV.
     */
    public function export(Request $request): StreamedResponse
    {
        $query = QuestionModule::query()->with(['event:id,title'])->withCount('questions');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                    ->orWhere('code', 'ilike', "%{$search}%")
                    ->orWhere('category', 'ilike', "%{$search}%");
            });
        }
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }
        if ($request->filled('track') && $request->input('track') !== 'all') {
            $query->whereJsonContains('track_codes', $request->input('track'));
        }
        if ($request->filled('scope') && $request->input('scope') !== 'all') {
            $scope = $request->input('scope');
            if ($scope === 'master') {
                $query->whereNull('event_id');
            } elseif (is_numeric($scope)) {
                $query->where('event_id', (int) $scope);
            }
        }

        $modules = $query->latest('id')->get();

        return response()->streamDownload(function () use ($modules): void {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Kode', 'Judul Modul Soal', 'Kategori', 'Cakupan', 'Jalur', 'Passing Grade', 'Bobot', 'Total Soal', 'Status', 'Deskripsi']);
            foreach ($modules as $m) {
                fputcsv($out, [
                    $m->code,
                    $m->title,
                    $m->category ?? '-',
                    $m->event ? "Event: {$m->event->title}" : 'Master Diktar (Lintas Event)',
                    is_array($m->track_codes) ? implode(', ', $m->track_codes) : '-',
                    $m->passing_grade,
                    $m->default_weight,
                    $m->questions_count,
                    $m->status,
                    $m->description ?? '',
                ]);
            }
            fclose($out);
        }, 'master-modul-soal-'.date('Ymd-His').'.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * Show detail view with the exact 5 tabs:
     * 1. Ringkasan
     * 2. Indikator Kompetensi
     * 3. Bank Soal
     * 4. Paket CBT yang Menggunakan Modul
     * 5. Riwayat Perubahan
     */
    public function show(QuestionModule $module): Response
    {
        $module->load([
            'learningModule:id,title,code,category,total_jp',
            'creator:id,name',
            'questions' => function ($q) {
                $q->latest('question_bank.created_at')->select([
                    'question_bank.id',
                    'question_bank.code',
                    'question_bank.question_text',
                    'question_bank.question_type',
                    'question_bank.points',
                    'question_bank.difficulty_level',
                    'question_bank.exam_stage',
                    'question_bank.metadata',
                    'question_bank.status',
                    'question_bank.updated_at',
                ]);
            },
            'cbtPackages' => function ($q) {
                $q->latest()->select([
                    'id',
                    'question_module_id',
                    'title',
                    'code',
                    'exam_type',
                    'duration_minutes',
                    'passing_score',
                    'status',
                ]);
            },
        ]);

        $auditLogs = ActivityLog::where('subject_type', QuestionModule::class)
            ->where('subject_id', $module->id)
            ->with('actor:id,name')
            ->latest('created_at')
            ->take(20)
            ->get();

        $tracks = ParticipantTrack::orderBy('sort_order')->get(['id', 'code', 'name', 'color']);
        $learningModules = LearningModule::select('id', 'title', 'code')->orderBy('title')->get();

        return Inertia::render('Admin/Master/QuestionModules/Show', [
            'module' => $module,
            'auditLogs' => $auditLogs,
            'tracks' => $tracks,
            'learningModules' => $learningModules,
        ]);
    }

    /**
     * Store newly created question module.
     */
    public function store(StoreQuestionModuleRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['slug'] = Str::slug($validated['title']).'-'.strtolower(Str::random(5));
        $validated['created_by'] = $request->user()?->id;

        $module = DB::transaction(function () use ($validated): QuestionModule {
            $module = QuestionModule::create($validated);

            ActivityLog::record('question_module.created', $module, [
                'code' => $module->code,
                'title' => $module->title,
            ]);

            return $module;
        });

        return redirect()->route('admin.master.modul-soal.index')
            ->with('success', "Modul Soal '{$module->title}' berhasil dibuat.");
    }

    /**
     * Update an existing question module.
     */
    public function update(UpdateQuestionModuleRequest $request, QuestionModule $module): RedirectResponse
    {
        $validated = $request->validated();
        if ($module->title !== $validated['title']) {
            $validated['slug'] = Str::slug($validated['title']).'-'.strtolower(Str::random(5));
        }

        DB::transaction(function () use ($module, $validated): void {
            $module->update($validated);

            ActivityLog::record('question_module.updated', $module, [
                'code' => $module->code,
                'title' => $module->title,
                'changes' => array_keys($validated),
            ]);
        });

        return back()->with('success', "Modul Soal '{$module->title}' berhasil diperbarui.");
    }

    /**
     * Archive question module.
     */
    public function archive(QuestionModule $module): RedirectResponse
    {
        $module->update(['status' => 'archived']);

        return back()->with('success', "Modul Soal '{$module->title}' telah diarsipkan.");
    }

    /**
     * Delete question module.
     */
    public function destroy(Request $request, QuestionModule $module): RedirectResponse
    {
        $hasAttempts = CbtExamAttempt::whereHas('package', function ($q) use ($module) {
            $q->where('question_module_id', $module->id)
                ->orWhereJsonContains('question_module_ids', $module->id);
        })->exists();

        if ($hasAttempts && ! $request->boolean('force')) {
            return back()->with('error', "Modul Soal '{$module->title}' tidak dapat dihapus karena paket CBT terkait sudah memiliki rekaman pengerjaan ujian peserta. Silakan gunakan opsi arsipkan.");
        }

        $title = $module->title;

        DB::transaction(function () use ($module, $title): void {
            // Detach questions from module
            $module->questions()->detach();

            // Clear legacy question_module_id on question_bank if any points to this module
            QuestionBank::where('question_module_id', $module->id)->update(['question_module_id' => null]);

            // Nullify or detach from CBT packages
            CbtExamPackage::where('question_module_id', $module->id)->update(['question_module_id' => null]);

            // Delete module
            $module->delete();

            ActivityLog::record('question_module.deleted', $module, [
                'code' => $module->code,
                'title' => $title,
            ]);
        });

        if ($request->header('Referer') && str_contains($request->header('Referer'), "/admin/master/modul-soal/{$module->id}")) {
            return redirect()->route('master.modul-soal.index')
                ->with('success', "Modul Soal '{$title}' berhasil dihapus.");
        }

        return back()->with('success', "Modul Soal '{$title}' berhasil dihapus.");
    }
}
