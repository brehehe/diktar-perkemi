<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Services\EventPracticalExamService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class EventPracticalExamController extends Controller
{
    public function __construct(private readonly EventPracticalExamService $practicalExamService) {}

    /**
     * Save an individual participant practical exam assessment.
     */
    public function save(Request $request, Event $event): RedirectResponse
    {
        $validCategories = implode(',', array_keys($this->practicalExamService->getCriteriaConfig()));

        $validated = $request->validate([
            'event_participant_id' => ['required', 'exists:event_participants,id'],
            'category' => ['required', 'string', 'in:'.$validCategories],
            'examiner_name' => ['nullable', 'string', 'max:255'],
            'scores' => ['nullable', 'array'],
            'notes' => ['nullable', 'string'],
        ]);

        $this->practicalExamService->saveAssessment($event, $validated);

        return back()->with('success', 'Nilai ujian praktik peserta berhasil disimpan.');
    }

    /**
     * Save bulk assessments for a category.
     */
    public function saveBulk(Request $request, Event $event): RedirectResponse
    {
        $validCategories = implode(',', array_keys($this->practicalExamService->getCriteriaConfig()));

        $validated = $request->validate([
            'category' => ['required', 'string', 'in:'.$validCategories],
            'examiner_name' => ['nullable', 'string', 'max:255'],
            'assessments' => ['required', 'array'],
            'assessments.*.event_participant_id' => ['required', 'exists:event_participants,id'],
            'assessments.*.scores' => ['nullable', 'array'],
            'assessments.*.notes' => ['nullable', 'string'],
        ]);

        $result = $this->practicalExamService->saveBulkAssessments($event, $validated);

        $catConfig = $this->practicalExamService->getCriteriaConfig()[$validated['category']] ?? null;
        $sheetTitle = $catConfig['tab_title'] ?? $validated['category'];

        return back()->with('success', "Nilai ujian praktik {$result['saved_count']} peserta kategori {$sheetTitle} berhasil disimpan.");
    }

    /**
     * Export practical exam workbook matching the official template.
     */
    public function exportExcel(Request $request, Event $event): BinaryFileResponse
    {
        $category = $request->query('category');
        $validCategories = array_keys($this->practicalExamService->getCriteriaConfig());

        if ($category && ! in_array($category, $validCategories, true)) {
            $category = null;
        }

        $filePath = $this->practicalExamService->exportExcel($event, $category);
        $fileName = basename($filePath);

        return response()->download($filePath, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])->deleteFileAfterSend(true);
    }
}
