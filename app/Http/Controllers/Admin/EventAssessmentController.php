<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Services\EventAssessmentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class EventAssessmentController extends Controller
{
    public function __construct(private readonly EventAssessmentService $assessmentService) {}

    /**
     * Save an individual participant assessment.
     */
    public function save(Request $request, Event $event): RedirectResponse
    {
        $validated = $request->validate([
            'event_participant_id' => ['required', 'exists:event_participants,id'],
            'category' => ['required', 'string', 'in:PELATIH,PENGUJI,WASIT'],
            'examiner_name' => ['nullable', 'string', 'max:255'],
            'examiner_rank' => ['nullable', 'string', 'max:100'],
            'scores' => ['nullable', 'array'],
            'notes' => ['nullable', 'string'],
        ]);

        $this->assessmentService->saveAssessment($event, $validated);

        return back()->with('success', 'Penilaian peserta berhasil disimpan.');
    }

    /**
     * Save bulk assessments for a category.
     */
    public function saveBulk(Request $request, Event $event): RedirectResponse
    {
        $validated = $request->validate([
            'category' => ['required', 'string', 'in:PELATIH,PENGUJI,WASIT'],
            'examiner_name' => ['nullable', 'string', 'max:255'],
            'examiner_rank' => ['nullable', 'string', 'max:100'],
            'assessments' => ['required', 'array'],
            'assessments.*.event_participant_id' => ['required', 'exists:event_participants,id'],
            'assessments.*.scores' => ['nullable', 'array'],
            'assessments.*.notes' => ['nullable', 'string'],
        ]);

        $result = $this->assessmentService->saveBulkAssessments($event, $validated);

        return back()->with('success', "Penilaian {$result['saved_count']} peserta kategori {$validated['category']} berhasil disimpan.");
    }

    /**
     * Export assessment sheet to Excel matching the official template.
     */
    public function exportExcel(Request $request, Event $event): BinaryFileResponse
    {
        $category = strtoupper(trim((string) $request->input('category', 'PELATIH')));
        if (! in_array($category, [EventAssessmentService::CATEGORY_PELATIH, EventAssessmentService::CATEGORY_PENGUJI, EventAssessmentService::CATEGORY_WASIT], true)) {
            abort(404, 'Kategori penilaian tidak valid.');
        }

        $filePath = $this->assessmentService->exportExcel($event, $category);
        $fileName = basename($filePath);

        return response()->download($filePath, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])->deleteFileAfterSend(true);
    }
}
