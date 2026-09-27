<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DeleteEventDocumentRequest;
use App\Http\Requests\Admin\GenerateEventCertificateRequest;
use App\Http\Requests\Admin\GenerateEventTranscriptRequest;
use App\Http\Requests\Admin\UploadEventCertificateRequest;
use App\Http\Requests\Admin\UploadEventTranscriptRequest;
use App\Models\Event;
use App\Models\EventIntegrityPact;
use App\Models\EventParticipant;
use App\Services\EventDocumentGenerator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;
use ZipArchive;

class EventCertificateController extends Controller
{
    public function generateMissingDocuments(Event $event, EventDocumentGenerator $generator, Request $request): RedirectResponse
    {
        Gate::authorize('update', $event);

        $regenerate = $request->boolean('regenerate') || $request->boolean('force');
        $event->load(['modules', 'eventParticipants' => fn ($query) => $query->with('participant')->orderBy('id')]);
        $generated = ['certificate' => 0, 'transcript' => 0];
        $failed = 0;
        $unavailable = 0;

        foreach ($event->eventParticipants as $eventParticipant) {
            $eventParticipant->setRelation('event', $event);

            foreach (EventDocumentGenerator::documentTracks($eventParticipant->track_code) as $documentTrack) {
                foreach (['certificate', 'transcript'] as $type) {
                    $pathField = EventDocumentGenerator::documentField($type, 'file_path', $eventParticipant->track_code, $documentTrack);
                    $oldPath = $eventParticipant->{$pathField};

                    if (! $regenerate && $oldPath) {
                        continue;
                    }

                    if (! EventDocumentGenerator::supportsForEvent($event, $type, $documentTrack)) {
                        $unavailable++;

                        continue;
                    }

                    $numberField = EventDocumentGenerator::documentField($type, 'number', $eventParticipant->track_code, $documentTrack);
                    $issuedAtField = EventDocumentGenerator::documentField($type, 'issued_at', $eventParticipant->track_code, $documentTrack);
                    $syncNumbers = $request->boolean('sync_numbers', $regenerate);
                    $number = ($syncNumbers || ! $eventParticipant->{$numberField})
                        ? ($generator->configuredNumber($event, $eventParticipant, $type, $documentTrack) ?? $generator->suggestedNumber($event, $eventParticipant, $type, $documentTrack))
                        : $eventParticipant->{$numberField};

                    if (! $number) {
                        $failed++;

                        continue;
                    }

                    $directory = $type === 'certificate' ? 'event-certificates' : 'event-transcripts';
                    $path = "{$directory}/{$event->id}/{$eventParticipant->id}/{$documentTrack}/".Str::uuid().'.pdf';

                    $sigSettings = $generator->effectiveSignatureSettings($event);
                    $issuedAt = $sigSettings['parsed_date'] ?? $event->end_date ?? today();

                    try {
                        $pdf = $type === 'certificate'
                            ? $generator->generateCertificate($eventParticipant, $number, $documentTrack)
                            : $generator->generateTranscript($eventParticipant, $number, $documentTrack);

                        if (! Storage::disk('local')->put($path, $pdf)) {
                            throw new RuntimeException('Dokumen hasil generate tidak dapat disimpan.');
                        }

                        if ($oldPath && $oldPath !== $path) {
                            Storage::disk('local')->delete($oldPath);
                        }

                        $eventParticipant->update([
                            $pathField => $path,
                            $issuedAtField => $issuedAt,
                            $numberField => $number,
                        ]);

                        if ($type === 'certificate') {
                            EventIntegrityPact::where('event_id', $event->id)
                                ->where('participant_id', $eventParticipant->participant_id)
                                ->update([
                                    'certificate_number' => $number,
                                    'valid_start_date' => $issuedAt,
                                    'valid_end_date' => Carbon::parse($issuedAt)->copy()->addYears(3)->endOfYear(),
                                ]);
                        }
                        $generated[$type]++;
                    } catch (Throwable $exception) {
                        Storage::disk('local')->delete($path);
                        report($exception);
                        $failed++;
                    }
                }
            }
        }

        $message = $regenerate
            ? "Generate ulang selesai: {$generated['certificate']} sertifikat dan {$generated['transcript']} e-transkrip diperbarui dengan data \u{0026} TTD terbaru."
            : "Generate selesai: {$generated['certificate']} sertifikat dan {$generated['transcript']} e-transkrip dibuat.";

        if ($unavailable > 0) {
            $message .= " {$unavailable} dokumen dilewati karena template tidak tersedia.";
        }

        if ($failed > 0) {
            $message .= " {$failed} dokumen gagal dibuat; periksa template atau penyimpanan lalu coba lagi.";
        }

        return back()->with('success', $message);
    }

    public function generateCertificate(
        GenerateEventCertificateRequest $request,
        Event $event,
        EventParticipant $eventParticipant,
        EventDocumentGenerator $generator
    ): RedirectResponse {
        $validated = $request->validated();
        $eventParticipant->loadMissing('participant');
        $documentTrack = $this->documentTrack($eventParticipant, $validated['document_track'] ?? null);
        $numberField = EventDocumentGenerator::documentField('certificate', 'number', $eventParticipant->track_code, $documentTrack);
        $pathField = EventDocumentGenerator::documentField('certificate', 'file_path', $eventParticipant->track_code, $documentTrack);
        $issuedAtField = EventDocumentGenerator::documentField('certificate', 'issued_at', $eventParticipant->track_code, $documentTrack);
        $certificateNumber = trim((string) ($validated['certificate_number'] ?? ''))
            ?: $generator->suggestedNumber($event, $eventParticipant, 'certificate', $documentTrack);
        $path = "event-certificates/{$event->id}/{$eventParticipant->id}/{$documentTrack}/".Str::uuid().'.pdf';

        try {
            $pdf = $generator->generateCertificate($eventParticipant, $certificateNumber, $documentTrack);

            if (! Storage::disk('local')->put($path, $pdf)) {
                throw new RuntimeException('Sertifikat hasil generate tidak dapat disimpan.');
            }
        } catch (Throwable $exception) {
            report($exception);

            throw ValidationException::withMessages([
                'certificate_number' => 'Sertifikat otomatis gagal dibuat. Periksa file template dan penyimpanan server, lalu coba lagi atau unggah PDF manual.',
            ]);
        }

        $oldPath = $eventParticipant->{$pathField};
        $sigSettings = $generator->effectiveSignatureSettings($event);
        $issuedAt = $sigSettings['parsed_date'] ?? $event->end_date ?? today();

        try {
            $eventParticipant->update([
                $pathField => $path,
                $issuedAtField => $issuedAt,
                $numberField => $certificateNumber,
            ]);

            EventIntegrityPact::where('event_id', $event->id)
                ->where('participant_id', $eventParticipant->participant_id)
                ->update([
                    'certificate_number' => $certificateNumber,
                    'valid_start_date' => $issuedAt,
                    'valid_end_date' => Carbon::parse($issuedAt)->copy()->addYears(3)->endOfYear(),
                ]);
        } catch (Throwable $exception) {
            Storage::disk('local')->delete($path);

            throw $exception;
        }

        if ($oldPath) {
            Storage::disk('local')->delete($oldPath);
        }

        return back()->with('success', 'Sertifikat peserta berhasil dibuat dari template jalur.');
    }

    public function store(UploadEventCertificateRequest $request, Event $event, EventParticipant $eventParticipant): RedirectResponse
    {
        $validated = $request->validated();
        $documentTrack = $this->documentTrack($eventParticipant, $validated['document_track'] ?? null);
        $numberField = EventDocumentGenerator::documentField('certificate', 'number', $eventParticipant->track_code, $documentTrack);
        $pathField = EventDocumentGenerator::documentField('certificate', 'file_path', $eventParticipant->track_code, $documentTrack);
        $issuedAtField = EventDocumentGenerator::documentField('certificate', 'issued_at', $eventParticipant->track_code, $documentTrack);
        $oldPath = $eventParticipant->{$pathField};
        $path = $request->file('certificate')->store("event-certificates/{$event->id}/{$eventParticipant->id}/{$documentTrack}", 'local');

        try {
            $eventParticipant->update([
                $pathField => $path,
                $issuedAtField => $eventParticipant->{$issuedAtField} ?? today(),
                $numberField => ($validated['certificate_number'] ?? null) ?: $eventParticipant->{$numberField},
            ]);

            $certNum = ($validated['certificate_number'] ?? null) ?: $eventParticipant->{$numberField};
            $issuedDate = $eventParticipant->{$issuedAtField} ?? today();

            EventIntegrityPact::where('event_id', $event->id)
                ->where('participant_id', $eventParticipant->participant_id)
                ->update([
                    'certificate_number' => $certNum,
                    'valid_start_date' => $issuedDate,
                    'valid_end_date' => Carbon::parse($issuedDate)->copy()->addYears(3)->endOfYear(),
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

    public function download(Request $request, Event $event, EventParticipant $eventParticipant): StreamedResponse
    {
        $documentTrack = $this->documentTrack($eventParticipant, $request->query('document_track'));
        $pathField = EventDocumentGenerator::documentField('certificate', 'file_path', $eventParticipant->track_code, $documentTrack);
        $path = $eventParticipant->{$pathField};

        abort_unless($eventParticipant->event_id === $event->id
            && $path
            && Storage::disk('local')->exists($path), 404);

        return Storage::disk('local')->download(
            $path,
            "sertifikat-{$event->slug}-{$documentTrack}-{$eventParticipant->id}.pdf"
        );
    }

    public function previewCertificate(Request $request, Event $event, EventParticipant $eventParticipant): StreamedResponse
    {
        return $this->previewDocument($request, $event, $eventParticipant, 'certificate');
    }

    public function destroyCertificate(
        DeleteEventDocumentRequest $request,
        Event $event,
        EventParticipant $eventParticipant
    ): RedirectResponse {
        return $this->destroyDocument($eventParticipant, 'certificate', $request->query('document_track'));
    }

    public function storeTranscript(UploadEventTranscriptRequest $request, Event $event, EventParticipant $eventParticipant): RedirectResponse
    {
        $validated = $request->validated();
        $documentTrack = $this->documentTrack($eventParticipant, $validated['document_track'] ?? null);
        $numberField = EventDocumentGenerator::documentField('transcript', 'number', $eventParticipant->track_code, $documentTrack);
        $pathField = EventDocumentGenerator::documentField('transcript', 'file_path', $eventParticipant->track_code, $documentTrack);
        $issuedAtField = EventDocumentGenerator::documentField('transcript', 'issued_at', $eventParticipant->track_code, $documentTrack);
        $oldPath = $eventParticipant->{$pathField};
        $path = $request->file('transcript')->store("event-transcripts/{$event->id}/{$eventParticipant->id}/{$documentTrack}", 'local');

        try {
            $eventParticipant->update([
                $pathField => $path,
                $issuedAtField => $eventParticipant->{$issuedAtField} ?? today(),
                $numberField => ($validated['transcript_number'] ?? null) ?: $eventParticipant->{$numberField},
            ]);
        } catch (Throwable $exception) {
            Storage::disk('local')->delete($path);

            throw $exception;
        }

        if ($oldPath) {
            Storage::disk('local')->delete($oldPath);
        }

        return back()->with('success', 'Transkrip peserta berhasil diunggah.');
    }

    public function generateTranscript(
        GenerateEventTranscriptRequest $request,
        Event $event,
        EventParticipant $eventParticipant,
        EventDocumentGenerator $generator
    ): RedirectResponse {
        $validated = $request->validated();
        $eventParticipant->loadMissing('participant');
        $documentTrack = $this->documentTrack($eventParticipant, $validated['document_track'] ?? null);
        $numberField = EventDocumentGenerator::documentField('transcript', 'number', $eventParticipant->track_code, $documentTrack);
        $pathField = EventDocumentGenerator::documentField('transcript', 'file_path', $eventParticipant->track_code, $documentTrack);
        $issuedAtField = EventDocumentGenerator::documentField('transcript', 'issued_at', $eventParticipant->track_code, $documentTrack);
        $transcriptNumber = trim((string) ($validated['transcript_number'] ?? ''))
            ?: $generator->suggestedNumber($event, $eventParticipant, 'transcript', $documentTrack);
        $path = "event-transcripts/{$event->id}/{$eventParticipant->id}/{$documentTrack}/".Str::uuid().'.pdf';

        try {
            $pdf = $generator->generateTranscript($eventParticipant, $transcriptNumber, $documentTrack);

            if (! Storage::disk('local')->put($path, $pdf)) {
                throw new RuntimeException('Transkrip hasil generate tidak dapat disimpan.');
            }
        } catch (Throwable $exception) {
            report($exception);

            throw ValidationException::withMessages([
                'transcript_number' => 'Transkrip otomatis gagal dibuat. Periksa file template dan penyimpanan server, lalu coba lagi atau unggah PDF manual.',
            ]);
        }

        $oldPath = $eventParticipant->{$pathField};

        try {
            $eventParticipant->update([
                $pathField => $path,
                $issuedAtField => $event->end_date,
                $numberField => $transcriptNumber,
            ]);
        } catch (Throwable $exception) {
            Storage::disk('local')->delete($path);

            throw $exception;
        }

        if ($oldPath) {
            Storage::disk('local')->delete($oldPath);
        }

        return back()->with('success', 'Transkrip peserta berhasil dibuat dari template jalur.');
    }

    public function downloadTranscript(Request $request, Event $event, EventParticipant $eventParticipant): StreamedResponse
    {
        $documentTrack = $this->documentTrack($eventParticipant, $request->query('document_track'));
        $pathField = EventDocumentGenerator::documentField('transcript', 'file_path', $eventParticipant->track_code, $documentTrack);
        $path = $eventParticipant->{$pathField};

        abort_unless($eventParticipant->event_id === $event->id
            && $path
            && Storage::disk('local')->exists($path), 404);

        return Storage::disk('local')->download(
            $path,
            "transkrip-{$event->slug}-{$documentTrack}-{$eventParticipant->id}.pdf"
        );
    }

    public function previewTranscript(Request $request, Event $event, EventParticipant $eventParticipant): StreamedResponse
    {
        return $this->previewDocument($request, $event, $eventParticipant, 'transcript');
    }

    public function destroyTranscript(
        DeleteEventDocumentRequest $request,
        Event $event,
        EventParticipant $eventParticipant
    ): RedirectResponse {
        return $this->destroyDocument($eventParticipant, 'transcript', $request->query('document_track'));
    }

    private function destroyDocument(EventParticipant $eventParticipant, string $type, mixed $requestedTrack): RedirectResponse
    {
        $documentTrack = $this->documentTrack($eventParticipant, $requestedTrack);
        $pathField = EventDocumentGenerator::documentField($type, 'file_path', $eventParticipant->track_code, $documentTrack);
        $issuedAtField = EventDocumentGenerator::documentField($type, 'issued_at', $eventParticipant->track_code, $documentTrack);
        $path = $eventParticipant->{$pathField};

        abort_unless($path, 404);

        $eventParticipant->update([
            $pathField => null,
            $issuedAtField => null,
        ]);

        Storage::disk('local')->delete($path);

        return back()->with('success', $type === 'certificate'
            ? 'PDF sertifikat peserta berhasil dihapus. Nomor sertifikat tetap tersimpan.'
            : 'PDF transkrip peserta berhasil dihapus. Nomor transkrip tetap tersimpan.');
    }

    private function documentTrack(EventParticipant $eventParticipant, mixed $requestedTrack): string
    {
        abort_unless($requestedTrack === null || is_string($requestedTrack), 404);

        $documentTrack = EventDocumentGenerator::resolveDocumentTrack($eventParticipant->track_code, $requestedTrack);

        abort_unless($documentTrack, 404);

        return $documentTrack;
    }

    private function previewDocument(Request $request, Event $event, EventParticipant $eventParticipant, string $type): StreamedResponse
    {
        Gate::authorize('update', $event);

        $documentTrack = $this->documentTrack($eventParticipant, $request->query('document_track'));
        $pathField = EventDocumentGenerator::documentField($type, 'file_path', $eventParticipant->track_code, $documentTrack);
        $path = $eventParticipant->{$pathField};

        abort_unless($eventParticipant->event_id === $event->id
            && $path
            && Storage::disk('local')->exists($path), 404);

        $label = $type === 'certificate' ? 'sertifikat' : 'transkrip';

        return Storage::disk('local')->response($path, "{$label}-{$event->slug}-{$documentTrack}-{$eventParticipant->id}.pdf", [
            'Content-Type' => 'application/pdf',
        ]);
    }

    public function printAllDocuments(Request $request, Event $event, EventDocumentGenerator $generator): Response
    {
        Gate::authorize('view', $event);

        @ini_set('memory_limit', '512M');
        @set_time_limit(300);

        $type = $request->query('type') === 'transcript' ? 'transcript' : 'certificate';
        $trackFilter = strtoupper(trim((string) $request->query('track', '')));

        $query = $event->eventParticipants()
            ->with(['participant', 'event'])
            ->orderBy('id');

        if ($trackFilter !== '' && isset(EventDocumentGenerator::NUMBER_LABELS[$trackFilter])) {
            $query->where('track_code', $trackFilter);
        }

        $participants = $query->get();

        abort_if($participants->isEmpty(), 404, 'Tidak ada peserta yang terdaftar pada event ini.');

        $title = ($type === 'certificate' ? 'Semua Sertifikat - ' : 'Semua Transkrip - ').$event->title;
        $pdf = $generator->generateCombinedPdf($participants, $type, $title);
        $slug = Str::slug($event->title);
        $filename = ($type === 'certificate' ? 'sertifikat-semua-' : 'transkrip-semua-')."{$slug}.pdf";

        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$filename.'"',
        ]);
    }

    public function downloadAllZip(Request $request, Event $event, EventDocumentGenerator $generator): StreamedResponse
    {
        Gate::authorize('view', $event);

        @ini_set('memory_limit', '512M');
        @set_time_limit(300);

        $event->load(['eventParticipants' => fn ($q) => $q->with('participant')->orderBy('id')]);
        $tempZipPath = tempnam(sys_get_temp_dir(), 'diktar_docs_');
        $zip = new ZipArchive;

        if ($zip->open($tempZipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new RuntimeException('Gagal membuat berkas ZIP di server.');
        }

        foreach ($event->eventParticipants as $ep) {
            $ep->setRelation('event', $event);
            $participantName = Str::slug($ep->participant?->name ?? 'peserta');

            foreach (EventDocumentGenerator::documentTracks($ep->track_code) as $docTrack) {
                foreach (['certificate', 'transcript'] as $type) {
                    if (! EventDocumentGenerator::supportsForEvent($event, $type, $docTrack)) {
                        continue;
                    }

                    $pathField = EventDocumentGenerator::documentField($type, 'file_path', $ep->track_code, $docTrack);
                    $numField = EventDocumentGenerator::documentField($type, 'number', $ep->track_code, $docTrack);
                    $filePath = $ep->{$pathField};
                    $number = $ep->{$numField} ?: $generator->suggestedNumber($event, $ep, $type, $docTrack);
                    $cleanNum = Str::slug(str_replace('/', '-', $number ?? ''));

                    $pdfContent = null;
                    if ($filePath && Storage::disk('local')->exists($filePath)) {
                        $pdfContent = Storage::disk('local')->get($filePath);
                    } elseif ($number) {
                        try {
                            $pdfContent = $type === 'certificate'
                                ? $generator->generateCertificate($ep, $number, $docTrack)
                                : $generator->generateTranscript($ep, $number, $docTrack);
                        } catch (Throwable) {
                            // Skip ungeneratable
                        }
                    }

                    if ($pdfContent) {
                        $folder = $type === 'certificate' ? 'sertifikat' : 'transkrip';
                        $zipEntryName = "{$folder}/{$docTrack}_{$cleanNum}_{$participantName}.pdf";
                        $zip->addFromString($zipEntryName, $pdfContent);
                    }
                }
            }
        }

        $zip->close();

        $filename = "dokumen-{$event->slug}.zip";

        return response()->streamDownload(function () use ($tempZipPath) {
            $stream = fopen($tempZipPath, 'rb');
            fpassthru($stream);
            fclose($stream);
            @unlink($tempZipPath);
        }, $filename, [
            'Content-Type' => 'application/zip',
        ]);
    }
}
