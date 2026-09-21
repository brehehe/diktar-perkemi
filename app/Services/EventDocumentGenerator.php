<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Setting;
use InvalidArgumentException;
use RuntimeException;

class EventDocumentGenerator
{
    private const DUAL_TRACKS = [
        'PWAD' => ['PED', 'WAD'],
        'PWAN' => ['PEN', 'WAN'],
    ];

    /** @var array<string, array<string, string>> */
    private const TEMPLATES = [
        'certificate' => [
            'PD' => 'pn-certificate.jpeg',
            'WAD' => 'wad-certificate.jpeg',
            'WAN' => 'wan-certificate.jpeg',
            'PED' => 'ped-certificate.jpeg',
            'PEN' => 'pen-certificate.jpeg',
            'PN' => 'pn-certificate.jpeg',
        ],
        'transcript' => [
            'PD' => 'pn-transcript.jpeg',
            'WAD' => 'wad-transcript.jpeg',
            'WAN' => 'wan-transcript.jpeg',
            'PED' => 'ped-transcript.jpeg',
            'PEN' => 'pen-transcript.jpeg',
            'PN' => 'pn-transcript.jpeg',
        ],
    ];

    public const NUMBER_SUFFIXES = [
        'PD' => 'PLT-DRH',
        'WAD' => 'WST-DRH',
        'WAN' => 'WST-NAS',
        'PED' => 'PGJ-DRH',
        'PEN' => 'PGJ-NAS',
        'PN' => 'PLT-NAS',
    ];

    private const ROMAN_MONTHS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

    public const NUMBER_LABELS = [
        'PD' => 'Sertifikat Pelatih Daerah',
        'PN' => 'Sertifikat Pelatih Nasional',
        'PED' => 'Sertifikat Penguji Daerah',
        'PEN' => 'Sertifikat Penguji Nasional',
        'WAD' => 'Sertifikat Wasit Daerah',
        'WAN' => 'Sertifikat Wasit Nasional',
    ];

    /** @var array<string, string>|null */
    private ?array $adminNumberSettings = null;

    /** @var array<int, array<int, int>> */
    private array $sequenceOffsetsByEvent = [];

    public static function supports(string $type, ?string $trackCode): bool
    {
        return isset(self::TEMPLATES[$type][strtoupper((string) $trackCode)]);
    }

    /** @return array<int, string> */
    public static function documentTracks(?string $enrollmentTrackCode): array
    {
        $trackCode = strtoupper((string) $enrollmentTrackCode);

        return self::DUAL_TRACKS[$trackCode] ?? ($trackCode !== '' ? [$trackCode] : []);
    }

    public static function resolveDocumentTrack(?string $enrollmentTrackCode, ?string $requestedTrackCode): ?string
    {
        $tracks = self::documentTracks($enrollmentTrackCode);
        $resolved = strtoupper(trim((string) ($requestedTrackCode ?: ($tracks[0] ?? ''))));

        return in_array($resolved, $tracks, true) ? $resolved : null;
    }

    public static function isSecondaryDocumentTrack(?string $enrollmentTrackCode, string $documentTrackCode): bool
    {
        return isset(self::DUAL_TRACKS[strtoupper((string) $enrollmentTrackCode)])
            && self::DUAL_TRACKS[strtoupper((string) $enrollmentTrackCode)][1] === $documentTrackCode;
    }

    public static function documentField(string $type, string $field, ?string $enrollmentTrackCode, string $documentTrackCode): string
    {
        $prefix = self::isSecondaryDocumentTrack($enrollmentTrackCode, $documentTrackCode) ? 'secondary_' : '';

        return $prefix.$type.'_'.$field;
    }

    public static function supportsForEvent(Event $event, string $type, ?string $trackCode): bool
    {
        return self::generationUnavailableReason($event, $type, $trackCode) === null;
    }

    public static function generationUnavailableReason(Event $event, string $type, ?string $trackCode): ?string
    {
        $template = self::TEMPLATES[$type][strtoupper((string) $trackCode)] ?? null;

        if (! $template) {
            return 'Template resmi untuk jalur ini belum tersedia. Gunakan unggah PDF manual.';
        }

        if (! is_readable(resource_path("document-templates/perkemi/{$template}"))) {
            return 'File template belum terpasang atau tidak dapat dibaca di server. Hubungi admin server atau unggah PDF manual.';
        }

        if ($type === 'transcript' && $trackCode === 'PD') {
            $moduleCount = $event->modules
                ->filter(fn ($module) => in_array('PD', $module->track_codes ?? [], true))
                ->count();

            if ($moduleCount < 1 || $moduleCount > 8) {
                return 'Transkrip otomatis Pelatih Daerah memerlukan 1–8 modul PD pada event ini. Gunakan unggah PDF manual.';
            }
        }

        return null;
    }

    public function suggestedNumber(Event $event, EventParticipant $eventParticipant, string $type, ?string $documentTrackCode = null): ?string
    {
        $trackCode = self::resolveDocumentTrack($eventParticipant->track_code, $documentTrackCode);

        if (! $trackCode) {
            return null;
        }

        $numberField = self::documentField($type, 'number', $eventParticipant->track_code, $trackCode);
        $certificateNumberField = self::documentField('certificate', 'number', $eventParticipant->track_code, $trackCode);

        if ($eventParticipant->{$numberField} && ! $this->isLegacyDualPlaceholder($eventParticipant, $eventParticipant->{$numberField})) {
            return $eventParticipant->{$numberField};
        }

        if ($type === 'transcript' && $eventParticipant->{$certificateNumberField}
            && ! $this->isLegacyDualPlaceholder($eventParticipant, $eventParticipant->{$certificateNumberField})) {
            return $eventParticipant->{$certificateNumberField};
        }

        return $this->configuredNumber($event, $eventParticipant, $type, $trackCode);
    }

    public function configuredNumber(Event $event, EventParticipant $eventParticipant, string $type, ?string $documentTrackCode = null): ?string
    {
        $trackCode = self::resolveDocumentTrack($eventParticipant->track_code, $documentTrackCode);

        if (! in_array($type, ['certificate', 'transcript'], true)
            || ! isset(self::NUMBER_SUFFIXES[$trackCode])
            || ! $eventParticipant->exists
            || ! $event->end_date) {
            return null;
        }

        $issuedAt = $event->end_date;
        $settings = $this->effectiveNumberSettings($event, $trackCode);
        $sequence = $settings['start'] + $this->sequenceOffset($event, $eventParticipant, $trackCode);

        return sprintf(
            '%03d/%s/%s/%s',
            $sequence,
            $settings['prefix'],
            self::ROMAN_MONTHS[$issuedAt->month - 1],
            $issuedAt->format('Y')
        );
    }

    /** @return array<string, array{prefix: string, start: int}> */
    public function adminNumberSettings(): array
    {
        $saved = $this->savedAdminNumberSettings();
        $settings = [];

        foreach (self::NUMBER_LABELS as $trackCode => $label) {
            $prefix = trim($saved[$this->settingKey($trackCode, 'prefix')] ?? '');
            $start = (int) ($saved[$this->settingKey($trackCode, 'start')] ?? 1);
            $settings[$trackCode] = [
                'prefix' => $prefix !== '' ? $prefix : self::NUMBER_SUFFIXES[$trackCode],
                'start' => max(1, $start),
            ];
        }

        return $settings;
    }

    /** @return array{prefix: string, start: int} */
    public function effectiveNumberSettings(Event $event, string $trackCode): array
    {
        $defaults = $this->adminNumberSettings()[$trackCode];
        $override = $event->document_number_settings[$trackCode] ?? [];

        return [
            'prefix' => filled($override['prefix'] ?? null) ? trim($override['prefix']) : $defaults['prefix'],
            'start' => filled($override['start'] ?? null) ? (int) $override['start'] : $defaults['start'],
        ];
    }

    public static function settingKey(string $trackCode, string $field): string
    {
        return 'document_number_'.strtolower($trackCode).'_'.$field;
    }

    /** @return array<string, string> */
    private function savedAdminNumberSettings(): array
    {
        if ($this->adminNumberSettings === null) {
            $this->adminNumberSettings = Setting::query()
                ->where('group', 'certificate_numbers')
                ->pluck('value', 'key')
                ->all();
        }

        return $this->adminNumberSettings;
    }

    private function sequenceOffset(Event $event, EventParticipant $eventParticipant, string $trackCode): int
    {
        foreach (self::DUAL_TRACKS as $dualCode => $tracks) {
            if (in_array($trackCode, $tracks, true)) {
                if ($event->relationLoaded('eventParticipants')) {
                    return $event->eventParticipants
                        ->filter(fn (EventParticipant $participant) => in_array($participant->track_code, [$trackCode, $dualCode], true)
                            && $participant->id <= $eventParticipant->id)
                        ->count() - 1;
                }

                return EventParticipant::query()
                    ->where('event_id', $event->id)
                    ->whereIn('track_code', [$trackCode, $dualCode])
                    ->where('id', '<=', $eventParticipant->id)
                    ->count() - 1;
            }
        }

        if ($event->relationLoaded('eventParticipants')) {
            if (! isset($this->sequenceOffsetsByEvent[$event->id])) {
                $counts = [];
                $offsets = [];

                foreach ($event->eventParticipants->sortBy('id') as $participant) {
                    $code = strtoupper((string) $participant->track_code);
                    $counts[$code] = ($counts[$code] ?? 0) + 1;
                    $offsets[$participant->id] = $counts[$code] - 1;
                }

                $this->sequenceOffsetsByEvent[$event->id] = $offsets;
            }

            return $this->sequenceOffsetsByEvent[$event->id][$eventParticipant->id] ?? 0;
        }

        return EventParticipant::query()
            ->where('event_id', $event->id)
            ->where('track_code', $trackCode)
            ->where('id', '<=', $eventParticipant->id)
            ->count() - 1;
    }

    private function isLegacyDualPlaceholder(EventParticipant $eventParticipant, string $number): bool
    {
        $trackCode = strtoupper((string) $eventParticipant->track_code);

        return isset(self::DUAL_TRACKS[$trackCode]) && str_starts_with($number, "SK-{$trackCode}-")
            && ! $eventParticipant->certificate_file_path
            && ! $eventParticipant->transcript_file_path;
    }

    public function generateCertificate(EventParticipant $eventParticipant, string $certificateNumber, ?string $documentTrackCode = null): string
    {
        $trackCode = self::resolveDocumentTrack($eventParticipant->track_code, $documentTrackCode);
        $participant = $eventParticipant->participant;
        $overlays = $trackCode === 'PD' ? $this->pdCertificateOverlays() : [];
        $overlays[] = $this->whiteRectangle(750, 260, 440, 48);
        $overlays[] = $this->text($certificateNumber, 780, 297, 27, true);

        if ($participant?->name) {
            $overlays[] = $this->text($participant->name, 790, 410, $this->participantNameSize($participant->name), true);
        }

        $danRoman = $this->danRoman($participant?->dan_rank);

        if ($danRoman) {
            $overlays[] = $this->text($danRoman, 790, 452, 26);
        }

        if ($participant?->kenshi_id_number) {
            $overlays[] = $this->text($participant->kenshi_id_number, 790, 494, 25);
        }

        if ($participant?->origin_province) {
            $overlays[] = $this->text($participant->origin_province, 790, 577, 25);
        }

        return $this->createPdf(
            $this->templatePath('certificate', $trackCode),
            $overlays,
            "Sertifikat {$participant?->name}"
        );
    }

    public function generateTranscript(EventParticipant $eventParticipant, string $transcriptNumber, ?string $documentTrackCode = null): string
    {
        $trackCode = self::resolveDocumentTrack($eventParticipant->track_code, $documentTrackCode);
        $overlays = $trackCode === 'PD' ? $this->pdTranscriptOverlays($eventParticipant) : [];
        $overlays[] = $this->whiteRectangle(750, 267, 420, 40);
        $overlays[] = $this->text($transcriptNumber, 780, 297, 24, true);

        return $this->createPdf(
            $this->templatePath('transcript', $trackCode),
            $overlays,
            "Transkrip {$eventParticipant->participant?->name}"
        );
    }

    /** @return array<int, array<string, mixed>> */
    private function pdCertificateOverlays(): array
    {
        return [
            $this->coloredRectangle(1136, 38, 266, 54, [0.88, 0.02, 0.12]),
            $this->text('PELATIH DAERAH', 1163, 76, 27, true),
            $this->whiteRectangle(330, 202, 1040, 48),
            $this->text('SERTIFIKAT PELATIH SHORINJI KEMPO DAERAH', 370, 243, 42, true),
            $this->whiteRectangle(911, 615, 148, 37),
            $this->text('DAERAH,', 921, 645, 28, true),
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function pdTranscriptOverlays(EventParticipant $eventParticipant): array
    {
        $eventParticipant->loadMissing('event.modules');
        $modules = $eventParticipant->event->modules
            ->filter(fn ($module) => in_array('PD', $module->track_codes ?? [], true))
            ->values();

        if ($modules->isEmpty() || $modules->count() > 8) {
            throw new RuntimeException('Transkrip otomatis Pelatih Daerah memerlukan 1–8 modul PD pada event ini.');
        }

        $darkBlue = [0.14, 0.20, 0.27];
        $lightBlue = [0.86, 0.89, 0.93];
        $overlays = [
            $this->coloredRectangle(1136, 38, 266, 54, [0.88, 0.02, 0.12]),
            $this->text('PELATIH DAERAH', 1163, 76, 27, true),
            $this->whiteRectangle(610, 240, 450, 35),
            $this->text('PENATARAN PELATIH DAERAH', 625, 267, 29, true),
            $this->whiteRectangle(240, 303, 1209, 623),
            $this->coloredRectangle(240, 303, 1209, 51, $darkBlue),
            $this->text('KODE', 275, 338, 21, true, [1, 1, 1]),
            $this->text('KOMPETENSI / MODUL', 472, 338, 21, true, [1, 1, 1]),
            $this->text('JP', 850, 338, 21, true, [1, 1, 1]),
            $this->text('FOKUS KOMPETENSI', 1047, 338, 21, true, [1, 1, 1]),
        ];

        $rowHeight = 518 / $modules->count();

        foreach ($modules as $index => $module) {
            $top = 354 + ($index * $rowHeight);

            if ($index % 2 === 1) {
                $overlays[] = $this->coloredRectangle(240, $top, 1209, $rowHeight, [0.98, 0.99, 1]);
            }

            $overlays[] = $this->coloredRectangle(240, $top + $rowHeight - 1, 1209, 1, $lightBlue);
            $overlays[] = $this->text($module->code, 270, $top + 35, 20);
            $overlays[] = $this->text((string) $module->jp, 850, $top + 35, 21);

            foreach (array_slice(explode("\n", wordwrap($module->title, 38)), 0, 2) as $lineIndex => $line) {
                $overlays[] = $this->text($line, 385, $top + 34 + ($lineIndex * 27), 19);
            }

            $focus = mb_strimwidth((string) ($module->learning_indicators ?: $module->description ?: 'Kompetensi sesuai modul kegiatan.'), 0, 93, '...');

            foreach (array_slice(explode("\n", wordwrap($focus, 45)), 0, 2) as $lineIndex => $line) {
                $overlays[] = $this->text($line, 930, $top + 34 + ($lineIndex * 27), 18);
            }
        }

        $overlays[] = $this->coloredRectangle(240, 872, 1209, 53, [1, 0.97, 0.82]);
        $overlays[] = $this->text('TOTAL BEBAN PENATARAN', 432, 909, 24, true);
        $overlays[] = $this->text((string) $modules->sum('jp'), 850, 909, 24, true);
        $overlays[] = $this->whiteRectangle(160, 928, 1240, 49);
        $overlays[] = $this->text('Total JP berdasarkan modul Pelatih Daerah pada event: '.$modules->sum('jp').' JP.', 380, 950, 18);
        $overlays[] = $this->text('Basis: Modul kegiatan PERKEMI '.$eventParticipant->event->end_date?->format('Y').'.', 490, 973, 18);

        foreach ([240, 369, 810, 914, 1448] as $x) {
            $overlays[] = $this->coloredRectangle($x, 354, 1, 571, $lightBlue);
        }

        return $overlays;
    }

    private function templatePath(string $type, ?string $trackCode): string
    {
        $template = self::TEMPLATES[$type][strtoupper((string) $trackCode)] ?? null;

        if (! $template) {
            throw new InvalidArgumentException('Template dokumen tidak tersedia untuk jalur peserta ini.');
        }

        $path = resource_path("document-templates/perkemi/{$template}");

        if (! is_readable($path)) {
            throw new RuntimeException("Aset template dokumen tidak ditemukan atau tidak dapat dibaca: {$template}");
        }

        return $path;
    }

    /**
     * @param  array<int, array{type: string, x: float, top: float, width?: float, height?: float, text?: string, size?: float, bold?: bool, color?: array<int, float>}>  $overlays
     */
    private function createPdf(string $templatePath, array $overlays, string $title): string
    {
        $image = file_get_contents($templatePath);
        $dimensions = getimagesize($templatePath);

        if ($image === false || $dimensions === false) {
            throw new RuntimeException('Template dokumen tidak dapat dibaca.');
        }

        [$width, $height] = $dimensions;
        $content = "q\n{$width} 0 0 {$height} 0 0 cm\n/Im0 Do\nQ\n";

        foreach ($overlays as $overlay) {
            if ($overlay['type'] === 'rectangle') {
                $pdfY = $height - $overlay['top'] - $overlay['height'];
                $color = implode(' ', $overlay['color'] ?? [1, 1, 1]);
                $content .= "{$color} rg\n{$overlay['x']} {$pdfY} {$overlay['width']} {$overlay['height']} re f\n";

                continue;
            }

            $pdfY = $height - $overlay['top'];
            $font = ($overlay['bold'] ?? false) ? '/F2' : '/F1';
            $text = $this->pdfText($overlay['text'] ?? '');
            $color = implode(' ', $overlay['color'] ?? [0, 0, 0]);
            $content .= "{$color} rg\nBT\n{$font} {$overlay['size']} Tf\n1 0 0 1 {$overlay['x']} {$pdfY} Tm\n({$text}) Tj\nET\n";
        }

        $objects = [
            1 => '<< /Type /Catalog /Pages 2 0 R >>',
            2 => '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
            3 => "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {$width} {$height}] /Resources << /XObject << /Im0 4 0 R >> /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 7 0 R >>",
            4 => "<< /Type /XObject /Subtype /Image /Width {$width} /Height {$height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ".strlen($image)." >>\nstream\n{$image}\nendstream",
            5 => '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>',
            6 => '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold /Encoding /WinAnsiEncoding >>',
            7 => '<< /Length '.strlen($content)." >>\nstream\n{$content}endstream",
            8 => '<< /Title ('.$this->pdfText($title).') /Creator (Pustaka Penataran) >>',
        ];

        $pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
        $offsets = [0];

        foreach ($objects as $number => $object) {
            $offsets[$number] = strlen($pdf);
            $pdf .= "{$number} 0 obj\n{$object}\nendobj\n";
        }

        $xrefOffset = strlen($pdf);
        $pdf .= "xref\n0 ".(count($objects) + 1)."\n";
        $pdf .= "0000000000 65535 f \n";

        foreach (array_keys($objects) as $number) {
            $pdf .= sprintf("%010d 00000 n \n", $offsets[$number]);
        }

        $pdf .= "trailer\n";
        $pdf .= '<< /Size '.(count($objects) + 1).' /Root 1 0 R /Info 8 0 R >>'."\n";
        $pdf .= "startxref\n{$xrefOffset}\n%%EOF";

        return $pdf;
    }

    /** @param  array<int, float>  $color
     * @return array{type: string, x: float, top: float, text: string, size: float, bold: bool, color: array<int, float>}
     */
    private function text(string $text, float $x, float $top, float $size, bool $bold = false, array $color = [0, 0, 0]): array
    {
        return compact('text', 'x', 'top', 'size', 'bold', 'color') + ['type' => 'text'];
    }

    /** @return array{type: string, x: float, top: float, width: float, height: float} */
    private function whiteRectangle(float $x, float $top, float $width, float $height): array
    {
        return $this->coloredRectangle($x, $top, $width, $height, [1, 1, 1]);
    }

    /** @param  array<int, float>  $color
     * @return array{type: string, x: float, top: float, width: float, height: float, color: array<int, float>}
     */
    private function coloredRectangle(float $x, float $top, float $width, float $height, array $color): array
    {
        return compact('x', 'top', 'width', 'height', 'color') + ['type' => 'rectangle'];
    }

    private function participantNameSize(string $name): int
    {
        return match (true) {
            mb_strlen($name) > 38 => 19,
            mb_strlen($name) > 28 => 22,
            default => 26,
        };
    }

    private function danRoman(?string $danRank): ?string
    {
        if (! $danRank) {
            return null;
        }

        return trim((string) preg_replace('/(?:\s*-\s*|\s+)DAN$/iu', '', trim($danRank)));
    }

    private function pdfText(string $value): string
    {
        $encoded = iconv('UTF-8', 'Windows-1252//TRANSLIT//IGNORE', $value);

        return str_replace(
            ['\\', '(', ')', "\r", "\n"],
            ['\\\\', '\\(', '\\)', ' ', ' '],
            $encoded === false ? '' : $encoded
        );
    }
}
