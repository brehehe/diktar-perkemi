<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CbtExamPackage;
use App\Models\CbtQuestion;
use App\Models\Event;
use App\Models\QuestionModule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class CbtController extends Controller
{
    /**
     * Store a new CBT Exam Package for an event.
     */
    public function storePackage(Request $request, Event $event): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:cbt_exam_packages,code',
            'exam_type' => 'required|in:pre_test,post_test,theory,module_eval,remedial',
            'question_module_id' => ['nullable', Rule::exists('question_modules', 'id')->where('status', 'active')->whereNull('deleted_at')],
            'duration_minutes' => 'required|integer|min:5|max:300',
            'passing_score' => 'required|numeric|min:0|max:100',
            'attempts_allowed' => $request->input('revision_method') === 'retry' ? 'required|integer|min:2|max:10' : 'required|integer|min:1|max:10',
            'revision_method' => 'required|in:none,retry,paper',
            'revision_deadline' => 'required_if:revision_method,paper|nullable|date',
            'description' => 'nullable|string',
            'instructions' => 'nullable|string',
            'status' => 'required|in:draft,ready,open,closed,archived',
            'randomize_questions' => 'boolean',
            'randomize_answers' => 'boolean',
            'result_display' => 'required|in:immediate,after_closed,admin_only',
        ]);

        if (empty($validated['code'])) {
            $validated['code'] = 'CBT-'.strtoupper(Str::slug($validated['title'])).'-'.rand(100, 999);
        }

        $validated['event_id'] = $event->id;

        $bankQuestions = collect();
        if (! empty($validated['question_module_id'])) {
            $bankQuestions = QuestionModule::findOrFail($validated['question_module_id'])
                ->questions()->where('status', 'active')->orderBy('question_bank.id')->get(['question_bank.id', 'question_bank.points']);

            if ($bankQuestions->isEmpty()) {
                throw ValidationException::withMessages([
                    'question_module_id' => 'Modul soal belum memiliki soal aktif yang dapat digunakan.',
                ]);
            }
        }

        $package = DB::transaction(function () use ($validated, $bankQuestions): CbtExamPackage {
            $package = CbtExamPackage::create($validated);

            if ($bankQuestions->isNotEmpty()) {
                $package->bankQuestions()->attach($bankQuestions->mapWithKeys(
                    fn ($question, $index) => [$question->id => ['sort_order' => $index + 1, 'points' => $question->points]]
                )->all());
                $package->update(['total_questions' => $bankQuestions->count()]);
            }

            return $package;
        });

        return back()->with('success', "Paket Ujian CBT \"{$package->title}\" berhasil dibuat.");
    }

    /**
     * Update an existing CBT Exam Package.
     */
    public function updatePackage(Request $request, Event $event, CbtExamPackage $package): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'exam_type' => 'required|in:pre_test,post_test,theory,module_eval,remedial',
            'duration_minutes' => 'required|integer|min:5|max:300',
            'passing_score' => 'required|numeric|min:0|max:100',
            'attempts_allowed' => $request->input('revision_method') === 'retry' ? 'required|integer|min:2|max:10' : 'required|integer|min:1|max:10',
            'revision_method' => 'required|in:none,retry,paper',
            'revision_deadline' => 'required_if:revision_method,paper|nullable|date',
            'description' => 'nullable|string',
            'instructions' => 'nullable|string',
            'status' => 'required|in:draft,ready,open,closed,archived',
            'randomize_questions' => 'boolean',
            'randomize_answers' => 'boolean',
            'result_display' => 'required|in:immediate,after_closed,admin_only',
        ]);

        $package->update($validated);

        return back()->with('success', "Paket Ujian CBT \"{$package->title}\" berhasil diperbarui.");
    }

    /**
     * Delete a CBT Exam Package.
     */
    public function destroyPackage(Event $event, CbtExamPackage $package): RedirectResponse
    {
        $title = $package->title;
        $package->delete();

        return back()->with('success', "Paket Ujian CBT \"{$title}\" berhasil dihapus.");
    }

    /**
     * Store a question for a CBT Exam Package.
     */
    public function storeQuestion(Request $request, CbtExamPackage $package): RedirectResponse
    {
        $validated = $request->validate([
            'question_text' => 'required|string',
            'question_type' => 'required|in:single_choice,multiple_choice,boolean,essay',
            'options' => 'nullable|array',
            'correct_answer' => 'required',
            'points' => 'required|numeric|min:1|max:100',
            'explanation' => 'nullable|string',
            'category' => 'nullable|string',
            'material_id' => 'nullable|exists:materials,id',
        ]);

        $validated['cbt_exam_package_id'] = $package->id;
        $validated['sort_order'] = ($package->questions()->max('sort_order') ?? 0) + 1;

        CbtQuestion::create($validated);

        return back()->with('success', 'Soal ujian berhasil ditambahkan ke bank soal.');
    }
}
