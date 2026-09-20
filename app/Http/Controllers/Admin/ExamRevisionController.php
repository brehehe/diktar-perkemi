<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CbtExamAttempt;
use App\Models\Event;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExamRevisionController extends Controller
{
    private function ensureStoredPdf(Event $event, CbtExamAttempt $attempt): void
    {
        abort_unless($attempt->event_id === $event->id && $attempt->revision_file_path
            && Storage::disk('local')->exists($attempt->revision_file_path), 404);
    }

    public function reader(Event $event, CbtExamAttempt $attempt): Response
    {
        $this->ensureStoredPdf($event, $attempt);
        $attempt->load(['participant', 'package']);

        return Inertia::render('Event/RevisionReader', [
            'title' => 'Makalah revisi '.$attempt->participant?->name,
            'subtitle' => $attempt->package?->title,
            'fileUrl' => route('admin.event.revision.preview', [$event, $attempt]),
            'downloadUrl' => route('admin.event.revision.download', [$event, $attempt]),
            'backUrl' => route('admin.event.show', $event),
        ]);
    }

    public function preview(Event $event, CbtExamAttempt $attempt): StreamedResponse
    {
        $this->ensureStoredPdf($event, $attempt);

        return Storage::disk('local')->response($attempt->revision_file_path, "revisi-ujian-{$attempt->id}.pdf", [
            'Content-Type' => 'application/pdf',
        ]);
    }

    public function download(Event $event, CbtExamAttempt $attempt): StreamedResponse
    {
        $this->ensureStoredPdf($event, $attempt);

        return Storage::disk('local')->download($attempt->revision_file_path, "revisi-ujian-{$attempt->id}.pdf");
    }

    public function review(Request $request, Event $event, CbtExamAttempt $attempt): RedirectResponse
    {
        abort_unless($attempt->event_id === $event->id && $attempt->revision_file_path, 404);

        $validated = $request->validate([
            'revision_status' => ['required', 'in:accepted,rejected'],
        ]);

        $attempt->update(['revision_status' => $validated['revision_status']]);

        return back()->with('success', 'Status revisi ujian berhasil diperbarui.');
    }
}
