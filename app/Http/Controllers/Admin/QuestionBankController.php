<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreQuestionBankRequest;
use App\Http\Requests\Admin\UpdateQuestionBankRequest;
use App\Models\Event;
use App\Models\LearningModule;
use App\Models\Material;
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

class QuestionBankController extends Controller
{
    /**
     * Display listing of question bank items with filtering.
     */
    public function index(Request $request): Response
    {
        $query = QuestionBank::query()
            ->with([
                'questionModules:id,title,code,category,track_codes',
                'learningModule:id,title,code',
                'material:id,title,slug',
                'creator:id,name',
                'event:id,title',
            ])
            ->withCount('cbtPackages');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('question_text', 'ilike', "%{$search}%")
                    ->orWhere('code', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('module_id') && $request->input('module_id') !== 'all') {
            $query->whereHas('questionModules', fn ($modules) => $modules->where('question_modules.id', $request->input('module_id')));
        }

        if ($request->filled('type') && $request->input('type') !== 'all') {
            $query->where('question_type', $request->input('type'));
        }

        if ($request->filled('difficulty') && $request->input('difficulty') !== 'all') {
            $query->where('difficulty_level', $request->input('difficulty'));
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('track') && $request->input('track') !== 'all') {
            $track = $request->input('track');
            $query->whereHas('questionModules', function ($q) use ($track) {
                $q->whereJsonContains('track_codes', $track);
            });
        }

        if ($request->filled('scope') && $request->input('scope') !== 'all') {
            $scope = $request->input('scope');
            if ($scope === 'master') {
                $query->whereNull('event_id');
            } elseif (is_numeric($scope)) {
                $query->where('event_id', (int) $scope);
            }
        }

        $questions = $query->latest('id')->paginate(20)->withQueryString();

        $modules = QuestionModule::orderBy('title')->get(['id', 'title', 'code', 'category', 'track_codes', 'event_id']);
        $learningModules = LearningModule::orderBy('title')->get(['id', 'title', 'code']);
        $materials = Material::where('status', 'published')->orderBy('title')->get(['id', 'title', 'slug']);
        $tracks = ParticipantTrack::orderBy('sort_order')->get(['id', 'code', 'name', 'color']);
        $events = Event::select('id', 'title', 'slug', 'start_date')->latest('start_date')->get();

        $questionStats = QuestionBank::query()->selectRaw(
            "COUNT(*) as total,
             SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
             SUM(CASE WHEN question_type = 'single_choice' THEN 1 ELSE 0 END) as single_choice,
             SUM(CASE WHEN question_type = 'essay' THEN 1 ELSE 0 END) as essay",
        )->firstOrFail();
        $stats = [
            'total' => (int) $questionStats->total,
            'active' => (int) $questionStats->active,
            'single_choice' => (int) $questionStats->single_choice,
            'essay' => (int) $questionStats->essay,
        ];

        return Inertia::render('Admin/Master/QuestionBank/Index', [
            'questions' => $questions,
            'questionModules' => $modules,
            'learningModules' => $learningModules,
            'materials' => $materials,
            'tracks' => $tracks,
            'events' => $events,
            'stats' => $stats,
            'filters' => $request->only(['search', 'module_id', 'type', 'difficulty', 'status', 'track', 'scope']),
        ]);
    }

    /**
     * Download blank CSV template for bank soal import.
     */
    public function downloadTemplate(): StreamedResponse
    {
        return response()->streamDownload(function (): void {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['code', 'module_code', 'question_text', 'question_type', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'points', 'difficulty_level', 'exam_stage', 'explanation']);
            fputcsv($out, ['BS-CONTOH-01', 'QM-GEN-PRE', 'Berapa jumlah kenshi dalam satu regu embu beregu?', 'single_choice', '4 orang', '6 orang', '8 orang', '10 orang', 'B', '1.0', 'basic', 'pre_test', 'Sesuai aturan pertandingan PERKEMI']);
            fclose($out);
        }, 'format-bank-soal.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * Import bank soal from CSV.
     */
    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:10240'],
            'event_id' => ['nullable', 'integer', 'exists:events,id'],
            'question_module_id' => ['nullable', 'integer', 'exists:question_modules,id'],
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');
        $targetEventId = $request->filled('event_id') ? (int) $request->input('event_id') : null;
        $fallbackModuleId = $request->filled('question_module_id') ? (int) $request->input('question_module_id') : null;

        try {
            $headers = fgetcsv($handle, 0, ',', '"', '');
            if (! is_array($headers)) {
                return back()->withErrors(['file' => 'Berkas CSV kosong.']);
            }
            $headers = array_map(fn ($h) => trim(str_replace("\xEF\xBB\xBF", '', $h)), $headers);

            $count = 0;
            $moduleCodeMap = QuestionModule::pluck('id', 'code')->all();

            DB::transaction(function () use ($handle, $headers, &$count, $targetEventId, $fallbackModuleId, $moduleCodeMap, $request): void {
                while (($values = fgetcsv($handle, 0, ',', '"', '')) !== false) {
                    if ($values === [null] || empty(array_filter($values))) {
                        continue;
                    }
                    $row = array_combine($headers, array_map('trim', $values));
                    if (! isset($row['question_text']) || empty($row['question_text'])) {
                        continue;
                    }

                    $moduleId = null;
                    if (! empty($row['module_code']) && isset($moduleCodeMap[$row['module_code']])) {
                        $moduleId = $moduleCodeMap[$row['module_code']];
                    }
                    $moduleId = $moduleId ?: $fallbackModuleId;
                    if (! $moduleId) {
                        $firstModule = QuestionModule::first();
                        $moduleId = $firstModule?->id;
                    }

                    $options = [];
                    foreach (['a' => 'A', 'b' => 'B', 'c' => 'C', 'd' => 'D'] as $col => $key) {
                        if (isset($row['option_'.$col]) && $row['option_'.$col] !== '') {
                            $options[] = ['key' => $key, 'text' => $row['option_'.$col]];
                        }
                    }

                    $code = ! empty($row['code']) ? $row['code'] : 'BS-'.strtoupper(Str::random(8));

                    $q = QuestionBank::updateOrCreate(
                        ['code' => $code],
                        [
                            'event_id' => $targetEventId,
                            'question_module_id' => $moduleId,
                            'question_text' => $row['question_text'],
                            'question_type' => $row['question_type'] ?? 'single_choice',
                            'options' => $options,
                            'correct_answer' => strtoupper($row['correct_answer'] ?? 'A'),
                            'points' => (float) ($row['points'] ?? 1.0),
                            'difficulty_level' => $row['difficulty_level'] ?? 'basic',
                            'exam_stage' => $row['exam_stage'] ?? 'quiz',
                            'explanation' => $row['explanation'] ?? null,
                            'status' => 'active',
                            'created_by' => $request->user()?->id,
                        ]
                    );

                    if ($moduleId) {
                        $q->questionModules()->syncWithoutDetaching([$moduleId]);
                    }
                    $count++;
                }
            });

            $scopeLabel = $targetEventId ? 'khusus event' : 'Master Diktar';

            return back()->with('success', "{$count} butir soal {$scopeLabel} berhasil diimpor ke Bank Soal.");
        } finally {
            fclose($handle);
        }
    }

    /**
     * Export bank questions to CSV based on active filters.
     */
    public function export(Request $request): StreamedResponse
    {
        $query = QuestionBank::query()->with(['event:id,title', 'questionModules:id,code,title']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('question_text', 'ilike', "%{$search}%")
                    ->orWhere('code', 'ilike', "%{$search}%");
            });
        }
        if ($request->filled('module_id') && $request->input('module_id') !== 'all') {
            $query->whereHas('questionModules', fn ($modules) => $modules->where('question_modules.id', $request->input('module_id')));
        }
        if ($request->filled('type') && $request->input('type') !== 'all') {
            $query->where('question_type', $request->input('type'));
        }
        if ($request->filled('difficulty') && $request->input('difficulty') !== 'all') {
            $query->where('difficulty_level', $request->input('difficulty'));
        }
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }
        if ($request->filled('scope') && $request->input('scope') !== 'all') {
            $scope = $request->input('scope');
            if ($scope === 'master') {
                $query->whereNull('event_id');
            } elseif (is_numeric($scope)) {
                $query->where('event_id', (int) $scope);
            }
        }

        $questions = $query->latest('id')->get();

        return response()->streamDownload(function () use ($questions): void {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Kode', 'Pertanyaan', 'Tipe', 'Tahap', 'Tingkat Kesulitan', 'Poin', 'Kunci Jawaban', 'Cakupan', 'Modul Terkait', 'Status']);
            foreach ($questions as $q) {
                $moduleNames = $q->questionModules->pluck('code')->implode(', ');
                fputcsv($out, [
                    $q->code,
                    $q->question_text,
                    $q->question_type,
                    $q->exam_stage_label ?? $q->exam_stage,
                    $q->difficulty_level,
                    $q->points,
                    is_array($q->correct_answer) ? implode(',', $q->correct_answer) : (string) $q->correct_answer,
                    $q->event ? "Event: {$q->event->title}" : 'Master Diktar (Lintas Event)',
                    $moduleNames ?: '-',
                    $q->status,
                ]);
            }
            fclose($out);
        }, 'master-bank-soal-'.date('Ymd-His').'.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * Store newly created question into bank.
     */
    public function store(StoreQuestionBankRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $moduleIds = $validated['question_module_ids'];
        unset($validated['question_module_ids']);
        $validated['question_module_id'] = $moduleIds[0];
        $validated['created_by'] = $request->user()?->id;

        $question = DB::transaction(function () use ($validated, $moduleIds): QuestionBank {
            $question = QuestionBank::create($validated);
            $question->questionModules()->sync($moduleIds);

            return $question;
        });

        return back()->with('success', "Soal '{$question->code}' berhasil ditambahkan ke Bank Soal.");
    }

    /**
     * Update an existing question.
     */
    public function update(UpdateQuestionBankRequest $request, QuestionBank $question): RedirectResponse
    {
        $validated = $request->validated();
        $moduleIds = $validated['question_module_ids'];
        unset($validated['question_module_ids']);
        $validated['question_module_id'] = $moduleIds[0];

        DB::transaction(function () use ($question, $validated, $moduleIds): void {
            $question->update($validated);
            $question->questionModules()->sync($moduleIds);
        });

        return back()->with('success', "Soal '{$question->code}' berhasil diperbarui.");
    }

    /**
     * Delete a question if not in active attempts.
     */
    public function destroy(QuestionBank $question): RedirectResponse
    {
        $usedInAttempts = $question->cbtPackages()->whereHas('attempts')->exists();

        if ($usedInAttempts) {
            return back()->with('error', 'Soal tidak dapat dihapus karena sudah memiliki rekaman ujian peserta.');
        }

        $code = $question->code;
        DB::transaction(function () use ($question): void {
            $question->questionModules()->detach();
            $question->cbtPackages()->detach();
            $question->delete();
        });

        return back()->with('success', "Soal '{$code}' berhasil dihapus dari Bank Soal.");
    }
}
