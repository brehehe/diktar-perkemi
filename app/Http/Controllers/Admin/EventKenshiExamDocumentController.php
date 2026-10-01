<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Services\EventKenshiExamDocumentService;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class EventKenshiExamDocumentController extends Controller
{
    public function __construct(private readonly EventKenshiExamDocumentService $documentService) {}

    public function show(Event $event, string $document): BinaryFileResponse
    {
        abort_unless($this->documentService->supports($document), 404);

        $filePath = $this->documentService->export($event, $document);

        return response()->download($filePath, basename($filePath), [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])->deleteFileAfterSend(true);
    }
}
