<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateEventMandateRequest;
use App\Models\Event;
use App\Models\EventMandate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Throwable;

class EventMandateController extends Controller
{
    public function update(UpdateEventMandateRequest $request, Event $event): RedirectResponse
    {
        $this->ensureProdas();

        $validated = $request->validated();
        $attributes = Arr::except($validated, ['document']);
        $newDocumentPath = null;

        if ($request->hasFile('document')) {
            $file = $request->file('document');
            $newDocumentPath = $file->store("event-mandates/{$event->id}", 'local');
            abort_if($newDocumentPath === false, 500, 'Berkas mandat gagal disimpan.');

            $attributes = array_merge($attributes, [
                'document_disk' => 'local',
                'document_path' => $newDocumentPath,
                'document_original_name' => $file->getClientOriginalName(),
                'document_mime' => $file->getMimeType() ?: 'application/pdf',
                'document_size' => $file->getSize(),
                'uploaded_by' => $request->user()->id,
            ]);
        }

        $mandate = $event->mandate;
        $oldDisk = $mandate?->document_disk;
        $oldPath = $mandate?->document_path;

        try {
            $event->mandate()->updateOrCreate([], $attributes);
        } catch (Throwable $exception) {
            if ($newDocumentPath !== null) {
                Storage::disk('local')->delete($newDocumentPath);
            }

            throw $exception;
        }

        if ($newDocumentPath !== null && $oldDisk === 'local' && filled($oldPath) && $oldPath !== $newDocumentPath) {
            Storage::disk('local')->delete($oldPath);
        }

        return back()->with('success', 'Informasi dan bukti surat mandat berhasil disimpan.');
    }

    public function document(Request $request, Event $event): BinaryFileResponse
    {
        $this->ensureProdas();
        Gate::authorize('view', $event);

        $mandate = $event->mandate;
        abort_unless($mandate?->document_path, 404);

        $absolutePath = $this->absoluteDocumentPath($mandate);
        abort_unless($absolutePath !== null && is_file($absolutePath), 404);

        $response = response()->file($absolutePath, [
            'Content-Type' => $mandate->document_mime ?: 'application/pdf',
            'X-Content-Type-Options' => 'nosniff',
        ]);
        $response->setContentDisposition(
            $request->boolean('download') ? ResponseHeaderBag::DISPOSITION_ATTACHMENT : ResponseHeaderBag::DISPOSITION_INLINE,
            $mandate->document_original_name ?: basename($absolutePath),
        );

        return $response;
    }

    public function destroyDocument(Event $event): RedirectResponse
    {
        $this->ensureProdas();
        Gate::authorize('update', $event);

        $mandate = $event->mandate;
        abort_unless($mandate, 404);

        if ($mandate->document_disk === 'local' && filled($mandate->document_path)) {
            Storage::disk('local')->delete($mandate->document_path);
        }

        $mandate->update([
            'document_disk' => 'local',
            'document_path' => null,
            'document_original_name' => null,
            'document_mime' => null,
            'document_size' => null,
            'uploaded_by' => null,
        ]);

        return back()->with('success', 'Bukti surat mandat berhasil dilepas dari event.');
    }

    private function ensureProdas(): void
    {
        abort_unless(config('app.is_prodas'), 404);
    }

    private function absoluteDocumentPath(EventMandate $mandate): ?string
    {
        if ($mandate->document_disk === 'public_path') {
            $publicRoot = realpath(public_path());
            $documentPath = realpath(public_path($mandate->document_path));

            if ($publicRoot === false || $documentPath === false || ! str_starts_with($documentPath, $publicRoot.DIRECTORY_SEPARATOR)) {
                return null;
            }

            return $documentPath;
        }

        if ($mandate->document_disk !== 'local' || ! Storage::disk('local')->exists($mandate->document_path)) {
            return null;
        }

        return Storage::disk('local')->path($mandate->document_path);
    }
}
