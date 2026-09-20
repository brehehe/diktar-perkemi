<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UploadEventCertificateRequest;
use App\Models\Event;
use App\Models\EventParticipant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class EventCertificateController extends Controller
{
    public function store(UploadEventCertificateRequest $request, Event $event, EventParticipant $eventParticipant): RedirectResponse
    {
        $validated = $request->validated();
        $oldPath = $eventParticipant->certificate_file_path;
        $path = $request->file('certificate')->store("event-certificates/{$event->id}/{$eventParticipant->id}", 'local');

        try {
            $eventParticipant->update([
                'certificate_file_path' => $path,
                'certificate_issued_at' => $eventParticipant->certificate_issued_at ?? today(),
                'certificate_number' => ($validated['certificate_number'] ?? null) ?: $eventParticipant->certificate_number,
            ]);
        } catch (Throwable $exception) {
            Storage::disk('local')->delete($path);

            throw $exception;
        }

        if ($oldPath) {
            Storage::disk('local')->delete($oldPath);
        }

        return back()->with('success', 'Sertifikat peserta berhasil diunggah.');
    }

    public function download(Event $event, EventParticipant $eventParticipant): StreamedResponse
    {
        abort_unless($eventParticipant->event_id === $event->id
            && $eventParticipant->certificate_file_path
            && Storage::disk('local')->exists($eventParticipant->certificate_file_path), 404);

        return Storage::disk('local')->download(
            $eventParticipant->certificate_file_path,
            "sertifikat-{$event->slug}-{$eventParticipant->id}.pdf"
        );
    }
}
