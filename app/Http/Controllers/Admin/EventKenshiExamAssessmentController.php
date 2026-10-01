<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreEventKenshiExamAssessmentsRequest;
use App\Models\Event;
use App\Services\EventKenshiExamService;
use Illuminate\Http\RedirectResponse;

class EventKenshiExamAssessmentController extends Controller
{
    public function __construct(private readonly EventKenshiExamService $kenshiExamService) {}

    public function store(StoreEventKenshiExamAssessmentsRequest $request, Event $event): RedirectResponse
    {
        abort_unless($this->kenshiExamService->supportsEvent($event), 404);

        $result = $this->kenshiExamService->saveBulk($event, $request->validated());

        return back()->with(
            'success',
            "Nilai {$result['saved_count']} peserta kategori {$result['category']} berhasil disimpan.",
        );
    }
}
