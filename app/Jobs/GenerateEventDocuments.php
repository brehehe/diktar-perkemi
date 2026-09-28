<?php

namespace App\Jobs;

use App\Models\EventIntegrityPact;
use App\Models\EventParticipant;
use App\Services\EventDocumentGenerator;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class GenerateEventDocuments implements ShouldBeUnique, ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 240;

    /** @var array<int, int> */
    public array $backoff = [10, 30, 60];

    public int $uniqueFor = 300;

    public function __construct(
        public int $eventParticipantId,
        public string $type,
        public string $documentTrack,
        public ?string $number = null,
        public bool $regenerate = false,
        public bool $syncNumber = false,
    ) {}

    public function uniqueId(): string
    {
        return implode(':', [$this->eventParticipantId, $this->type, $this->documentTrack]);
    }

    /**
     * Execute the job.
     */
    public function handle(EventDocumentGenerator $generator): void
    {
        $eventParticipant = EventParticipant::query()->with(['event.modules', 'participant'])->findOrFail($this->eventParticipantId);
        $event = $eventParticipant->event;
        $track = EventDocumentGenerator::resolveDocumentTrack($eventParticipant->track_code, $this->documentTrack);
        if (! $event || ! $track || ! in_array($this->type, ['certificate', 'transcript'], true)) {
            throw new RuntimeException('Target dokumen event tidak valid.');
        }

        $pathField = EventDocumentGenerator::documentField($this->type, 'file_path', $eventParticipant->track_code, $track);
        $numberField = EventDocumentGenerator::documentField($this->type, 'number', $eventParticipant->track_code, $track);
        $issuedAtField = EventDocumentGenerator::documentField($this->type, 'issued_at', $eventParticipant->track_code, $track);
        if (! $this->regenerate && $eventParticipant->{$pathField}) {
            return;
        }
        if (! EventDocumentGenerator::supportsForEvent($event, $this->type, $track)) {
            throw new RuntimeException(EventDocumentGenerator::generationUnavailableReason($event, $this->type, $track) ?? 'Template dokumen tidak tersedia.');
        }

        $number = $this->number;
        if (! $number || $this->syncNumber) {
            $number = $generator->configuredNumber($event, $eventParticipant, $this->type, $track)
                ?? $generator->suggestedNumber($event, $eventParticipant, $this->type, $track);
        }
        if (! $number) {
            throw new RuntimeException('Nomor dokumen tidak dapat ditentukan.');
        }

        $directory = $this->type === 'certificate' ? 'event-certificates' : 'event-transcripts';
        $path = "{$directory}/{$event->id}/{$eventParticipant->id}/{$track}/".Str::uuid().'.pdf';
        $oldPath = $eventParticipant->{$pathField};

        try {
            $pdf = $this->type === 'certificate'
                ? $generator->generateCertificate($eventParticipant, $number, $track)
                : $generator->generateTranscript($eventParticipant, $number, $track);
            if (! Storage::disk('local')->put($path, $pdf)) {
                throw new RuntimeException('Dokumen hasil generate tidak dapat disimpan.');
            }

            $signatureSettings = $generator->effectiveSignatureSettings($event);
            $issuedAt = $this->type === 'certificate'
                ? ($signatureSettings['parsed_date'] ?? $event->end_date ?? today())
                : ($event->end_date ?? today());
            $eventParticipant->update([$pathField => $path, $issuedAtField => $issuedAt, $numberField => $number]);

            if ($this->type === 'certificate') {
                EventIntegrityPact::query()->where('event_id', $event->id)->where('participant_id', $eventParticipant->participant_id)->update([
                    'certificate_number' => $number,
                    'valid_start_date' => $issuedAt,
                    'valid_end_date' => Carbon::parse($issuedAt)->copy()->addYears(3)->endOfYear(),
                ]);
            }
            if ($oldPath && $oldPath !== $path) {
                Storage::disk('local')->delete($oldPath);
            }
        } catch (Throwable $exception) {
            Storage::disk('local')->delete($path);

            throw $exception;
        }
    }
}
