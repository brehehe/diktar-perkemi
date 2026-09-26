<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Setting;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\Storage;
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

    public const DEFAULT_SIGNATURE_SETTINGS = [
        'city' => 'Jakarta',
        'organization' => 'Pengurus Besar PERKEMI',
        'position' => 'Ketua Umum,',
        'signer_name' => 'Laksdya TNI (Purn) Prof. Dr. Agus Setiadji, S.A.P., M.A.',
        'signature_path' => null,
    ];

    /** @return array{city: string, organization: string, position: string, signer_name: string, signature_path: ?string, signature_url: ?string} */
    public function adminSignatureSettings(): array
    {
        $saved = Setting::query()
            ->where('group', 'certificate_signatures')
            ->pluck('value', 'key')
            ->all();

        $path = $saved['signature_path'] ?? null;

        return [
            'city' => filled($saved['signature_city'] ?? null) ? trim($saved['signature_city']) : self::DEFAULT_SIGNATURE_SETTINGS['city'],
            'organization' => filled($saved['signature_organization'] ?? null) ? trim($saved['signature_organization']) : self::DEFAULT_SIGNATURE_SETTINGS['organization'],
            'position' => filled($saved['signature_position'] ?? null) ? trim($saved['signature_position']) : self::DEFAULT_SIGNATURE_SETTINGS['position'],
            'signer_name' => filled($saved['signature_signer_name'] ?? null) ? trim($saved['signature_signer_name']) : self::DEFAULT_SIGNATURE_SETTINGS['signer_name'],
            'signature_path' => $path,
            'signature_url' => ! empty($path) && Storage::disk('public')->exists($path)
                ? Storage::disk('public')->url($path)
                : null,
        ];
    }

    /** @return array{city: string, date: string, date_formatted: string, parsed_date: ?CarbonInterface, organization: string, position: string, signer_name: string, signature_path: ?string, signature_url: ?string} */
    public function effectiveSignatureSettings(Event $event): array
    {
        $defaults = $this->adminSignatureSettings();
        $override = $event->certificate_signature_settings ?? [];

        $city = filled($override['city'] ?? null) ? trim($override['city']) : $defaults['city'];
        $organization = filled($override['organization'] ?? null) ? trim($override['organization']) : $defaults['organization'];
        $position = filled($override['position'] ?? null) ? trim($override['position']) : $defaults['position'];
        $signerName = filled($override['signer_name'] ?? null) ? trim($override['signer_name']) : $defaults['signer_name'];
        $signaturePath = filled($override['signature_path'] ?? null) ? $override['signature_path'] : $defaults['signature_path'];

        $rawDate = $override['date'] ?? null;
        $dateFormatted = null;
        $parsedDate = null;

        if (filled($rawDate)) {
            try {
                $parsedDate = Carbon::parse($rawDate);
                $dateFormatted = $this->indonesianDate($parsedDate);
            } catch (\Throwable) {
                $dateFormatted = trim($rawDate);
            }
        }

        if (! $dateFormatted) {
            $parsedDate = $event->end_date ?? today();
            $dateFormatted = $this->indonesianDate($parsedDate);
        }

        $signatureUrl = null;
        if (! empty($signaturePath) && Storage::disk('public')->exists($signaturePath)) {
            $signatureUrl = Storage::disk('public')->url($signaturePath);
        }

        return [
            'city' => $city,
            'date' => $rawDate ?: ($event->end_date ? $event->end_date->format('Y-m-d') : today()->format('Y-m-d')),
            'date_formatted' => $dateFormatted,
            'parsed_date' => $parsedDate,
            'organization' => $organization,
            'position' => $position,
            'signer_name' => $signerName,
            'signature_path' => $signaturePath,
            'signature_url' => $signatureUrl,
        ];
    }

    public function indonesianDate(CarbonInterface $date): string
    {
        $months = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ];

        return $date->format('j').' '.($months[$date->month] ?? $date->format('F')).' '.$date->format('Y');
    }

    public function indonesianDayMonth(CarbonInterface $date): string
    {
        $months = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ];

        return $date->format('j').' '.($months[$date->month] ?? $date->format('F'));
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
        $eventParticipant->loadMissing(['participant', 'event']);
        $participant = $eventParticipant->participant;
        $event = $eventParticipant->event ?? Event::query()->find($eventParticipant->event_id);
        $sigSettings = $event ? $this->effectiveSignatureSettings($event) : [
            'city' => self::DEFAULT_SIGNATURE_SETTINGS['city'],
            'organization' => self::DEFAULT_SIGNATURE_SETTINGS['organization'],
            'position' => self::DEFAULT_SIGNATURE_SETTINGS['position'],
            'signer_name' => self::DEFAULT_SIGNATURE_SETTINGS['signer_name'],
            'date_formatted' => $this->indonesianDate(today()),
            'parsed_date' => today(),
            'signature_path' => null,
        ];

        $overlays = $trackCode === 'PD' ? $this->pdCertificateOverlays() : [];

        // 1. Nomor Sertifikat: Starts right after "Nomor : " (ends ~688 on PED/PEN)
        $certNumTop = match ($trackCode) {
            'PN', 'PD' => 285,
            'WAD' => 292,
            'WAN' => 274,
            default => 304,
        };
        $overlays[] = $this->text($certificateNumber, 708, $certNumTop, 26, true);

        // 2. Colons & Data Peserta alignment
        $colonX = match ($trackCode) {
            'PN', 'PD' => 700,
            'PEN' => 720,
            default => 730,
        };
        $dataX = $colonX + 18;

        if ($participant?->name) {
            $overlays[] = $this->text($participant->name, $dataX, 417, $this->participantNameSize($participant->name), true);
        }

        // Tingkat (y=460)
        // Keep Dan Roman numeral strictly aligned with all other participant details at $dataX
        $danRoman = $this->danRoman($participant?->dan_rank);
        if ($danRoman) {
            $overlays[] = $this->text($danRoman, $dataX, 460, 25);
        }

        if ($participant?->kenshi_id_number) {
            $overlays[] = $this->text($participant->kenshi_id_number, $dataX, 502, 25);
        }

        // Tempat/Tanggal Lahir
        $birthPlace = trim((string) ($participant?->birth_place ?? ''));
        $birthDate = $participant?->birth_date;
        $formattedBirthDate = $birthDate ? $this->indonesianDate($birthDate) : '';
        $ttl = match (true) {
            $birthPlace !== '' && $formattedBirthDate !== '' => "{$birthPlace}, {$formattedBirthDate}",
            $birthPlace !== '' => $birthPlace,
            $formattedBirthDate !== '' => $formattedBirthDate,
            default => '-',
        };
        $overlays[] = $this->text($ttl, $dataX, 544, 25);

        if ($participant?->origin_province) {
            $overlays[] = $this->text($participant->origin_province, $dataX, 584, 25);
        }

        // 3. Masa Berlaku 3 Tahun
        $issueDate = $sigSettings['parsed_date'] ?? $event?->end_date ?? today();
        $validUntil = $issueDate->copy()->addYears(3);

        $dateTop = match ($trackCode) {
            'PEN' => 715,
            'PN', 'PD' => 713,
            'WAD' => 720,
            'WAN' => 701,
            default => 723, // PED
        };

        if ($validUntil->year === 2029) {
            // Template already prints "2029, kecuali ada ketentuan lain dari PB. PERKEMI"
            // Place day and month perfectly centered in the designated blank space without any white block
            $dayMonthStr = $this->indonesianDayMonth($validUntil);
            $dateX = match ($trackCode) {
                'PEN' => 480,
                'PN', 'PD' => 575,
                'WAD' => 370,
                'WAN' => 640,
                default => 500, // PED (gap is x=429..714, centered at ~500)
            };
            $overlays[] = $this->text($dayMonthStr, $dateX, $dateTop, 23, true);
        } else {
            // When expiration year is different from pre-printed 2029, only cover the 2029 digits
            $rectX = match ($trackCode) {
                'PEN' => 670,
                'PN', 'PD' => 745,
                'WAD' => 468,
                'WAN' => 790,
                default => 712,
            };
            $overlays[] = $this->whiteRectangle($rectX, $dateTop - 25, 65, 30);
            $overlays[] = $this->text($this->indonesianDayMonth($validUntil), 500, $dateTop, 23, true);
            $overlays[] = $this->text($validUntil->format('Y').',', $rectX, $dateTop, 23, true);
        }

        // 4. TTD Block
        $overlays[] = $this->whiteRectangle(650, 775, 750, 185);

        $centerX = 1020;
        // Line 1: Kota, Tanggal
        $cityDateLine = "{$sigSettings['city']}, {$sigSettings['date_formatted']}";
        $cityDateWidth = mb_strlen($cityDateLine) * 23 * 0.44;
        $overlays[] = $this->text($cityDateLine, $centerX - ($cityDateWidth / 2), 804, 23);

        // Line 2: Organisasi (bold)
        $orgLine = $sigSettings['organization'];
        $orgWidth = mb_strlen($orgLine) * 24 * 0.52;
        $overlays[] = $this->text($orgLine, $centerX - ($orgWidth / 2), 834, 24, true);

        // Line 3: Jabatan
        $posLine = $sigSettings['position'];
        $posWidth = mb_strlen($posLine) * 23 * 0.44;
        $overlays[] = $this->text($posLine, $centerX - ($posWidth / 2), 864, 23);

        // Signature image (if exists)
        if (! empty($sigSettings['signature_path']) && Storage::disk('public')->exists($sigSettings['signature_path'])) {
            $fullSigPath = Storage::disk('public')->path($sigSettings['signature_path']);
            if (is_readable($fullSigPath)) {
                $sigW = 180;
                $sigH = 65;
                $overlays[] = $this->imageOverlay($fullSigPath, $centerX - ($sigW / 2), 870, $sigW, $sigH);
            }
        }

        // Line 4: Nama Penandatangan
        $nameLine = $sigSettings['signer_name'];
        $nameWidth = mb_strlen($nameLine) * 22 * 0.41;
        $nameX = $centerX - ($nameWidth / 2);
        $overlays[] = $this->text($nameLine, $nameX, 946, 22);
        $overlays[] = $this->coloredRectangle($nameX, 949, $nameWidth, 1.5, [0, 0, 0]);

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

        $textX = match ($trackCode) {
            'WAD' => 698,
            'PEN' => 726,
            'PN', 'PD' => 733,
            'WAN' => 730,
            default => 740, // PED
        };

        $top = match ($trackCode) {
            'WAD' => 319,
            'PED', 'WAN' => 294,
            default => 304, // PEN, PN, PD
        };

        $overlays[] = $this->text($transcriptNumber, $textX, $top, 24, true);

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
     * @param  array<int, array{type: string, x: float, top: float, width?: float, height?: float, text?: string, size?: float, bold?: bool, color?: array<int, float>, path?: string}>  $overlays
     */
    private function createPdf(string $templatePath, array $overlays, string $title): string
    {
        $image = file_get_contents($templatePath);
        $dimensions = getimagesize($templatePath);

        if ($image === false || $dimensions === false) {
            throw new RuntimeException('Template dokumen tidak dapat dibaca.');
        }

        [$width, $height] = $dimensions;
        $pageWidth = 841.89;
        $pageHeight = 595.28;
        $scale = min($pageWidth / $width, $pageHeight / $height);
        $offsetX = ($pageWidth - $width * $scale) / 2;
        $offsetY = ($pageHeight - $height * $scale) / 2;
        $content = sprintf("q\n%.6F 0 0 %.6F %.6F %.6F cm\n", $scale, $scale, $offsetX, $offsetY);
        $content .= "q\n{$width} 0 0 {$height} 0 0 cm\n/Im0 Do\nQ\n";

        $extraObjects = [];
        $imageXObjects = [];
        $nextObjNum = 9;
        $imgCount = 0;

        foreach ($overlays as $overlay) {
            if ($overlay['type'] === 'image' && ! empty($overlay['path']) && is_readable($overlay['path'])) {
                $gd = @imagecreatefromstring((string) file_get_contents($overlay['path']));
                if ($gd) {
                    $imgCount++;
                    $imName = "/Im{$imgCount}";
                    $sw = imagesx($gd);
                    $sh = imagesy($gd);
                    $rgb = '';
                    $alpha = '';
                    // Detect if image has native alpha channel
                    for ($y = 0; $y < $sh; $y++) {
                        for ($x = 0; $x < $sw; $x++) {
                            $rgba = imagecolorat($gd, $x, $y);
                            $a = ($rgba >> 24) & 0x7F;
                            if ($a > 0) {
                                $hasAlpha = true;
                                break 2;
                            }
                        }
                    }

                    for ($y = 0; $y < $sh; $y++) {
                        for ($x = 0; $x < $sw; $x++) {
                            $rgba = imagecolorat($gd, $x, $y);
                            $r = ($rgba >> 16) & 0xFF;
                            $g = ($rgba >> 8) & 0xFF;
                            $b = $rgba & 0xFF;
                            $a = ($rgba >> 24) & 0x7F;

                            if ($hasAlpha) {
                                // Transparent image (e.g. digital signature): force ink to black, preserve antialiased alpha
                                $pixelAlpha = (int) round((127 - $a) * 255 / 127);
                                $rgb .= chr(0).chr(0).chr(0);
                                $alpha .= chr($pixelAlpha);
                            } else {
                                // White paper scan image: remove white background and render ink in pure black
                                $brightness = ($r * 299 + $g * 587 + $b * 114) / 1000;
                                if ($brightness < 235) {
                                    $hasAlpha = true;
                                    $pixelAlpha = (int) round(min(255, (235 - $brightness) * (255 / 180)));
                                    $rgb .= chr(0).chr(0).chr(0);
                                    $alpha .= chr($pixelAlpha);
                                } else {
                                    $rgb .= chr(0).chr(0).chr(0);
                                    $alpha .= chr(0);
                                }
                            }
                        }
                    }
                    imagedestroy($gd);

                    $rgbData = gzcompress($rgb);
                    $imgObjNum = $nextObjNum++;

                    if ($hasAlpha) {
                        $smaskData = gzcompress($alpha);
                        $smaskObjNum = $nextObjNum++;
                        $extraObjects[$imgObjNum] = "<< /Type /XObject /Subtype /Image /Width {$sw} /Height {$sh} /ColorSpace /DeviceRGB /BitsPerComponent 8 /SMask {$smaskObjNum} 0 R /Filter /FlateDecode /Length ".strlen($rgbData)." >>\nstream\n{$rgbData}\nendstream";
                        $extraObjects[$smaskObjNum] = "<< /Type /XObject /Subtype /Image /Width {$sw} /Height {$sh} /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode /Length ".strlen($smaskData)." >>\nstream\n{$smaskData}\nendstream";
                    } else {
                        $extraObjects[$imgObjNum] = "<< /Type /XObject /Subtype /Image /Width {$sw} /Height {$sh} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Length ".strlen($rgbData)." >>\nstream\n{$rgbData}\nendstream";
                    }

                    $pdfY = $height - $overlay['top'] - $overlay['height'];
                    $imageStream = "q\n{$overlay['width']} 0 0 {$overlay['height']} {$overlay['x']} {$pdfY} cm\n{$imName} Do\nQ\n";
                    $imageXObjects[$imName] = [
                        'objNum' => $imgObjNum,
                        'stream' => $imageStream,
                    ];
                }
            }
        }

        foreach ($overlays as $overlay) {
            if ($overlay['type'] === 'rectangle') {
                $pdfY = $height - $overlay['top'] - $overlay['height'];
                $color = implode(' ', $overlay['color'] ?? [1, 1, 1]);
                $content .= "{$color} rg\n{$overlay['x']} {$pdfY} {$overlay['width']} {$overlay['height']} re f\n";

                continue;
            }

            if ($overlay['type'] === 'image') {
                continue;
            }

            $pdfY = $height - $overlay['top'];
            $font = ($overlay['bold'] ?? false) ? '/F2' : '/F1';
            $text = $this->pdfText($overlay['text'] ?? '');
            $color = implode(' ', $overlay['color'] ?? [0, 0, 0]);
            $content .= "{$color} rg\nBT\n{$font} {$overlay['size']} Tf\n1 0 0 1 {$overlay['x']} {$pdfY} Tm\n({$text}) Tj\nET\n";
        }

        foreach ($imageXObjects as $imgData) {
            $content .= $imgData['stream'];
        }

        $content .= "Q\n";

        $xObjectsDict = '/Im0 4 0 R';
        foreach ($imageXObjects as $name => $imgData) {
            $xObjectsDict .= " {$name} {$imgData['objNum']} 0 R";
        }

        $objects = [
            1 => '<< /Type /Catalog /Pages 2 0 R >>',
            2 => '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
            3 => "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {$pageWidth} {$pageHeight}] /Resources << /XObject << {$xObjectsDict} >> /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 7 0 R >>",
            4 => "<< /Type /XObject /Subtype /Image /Width {$width} /Height {$height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ".strlen($image)." >>\nstream\n{$image}\nendstream",
            5 => '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>',
            6 => '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold /Encoding /WinAnsiEncoding >>',
            7 => '<< /Length '.strlen($content)." >>\nstream\n{$content}endstream",
            8 => '<< /Title ('.$this->pdfText($title).') /Creator (Pustaka Penataran) >>',
        ];

        foreach ($extraObjects as $num => $obj) {
            $objects[$num] = $obj;
        }

        ksort($objects);

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

    /** @return array{type: string, path: string, x: float, top: float, width: float, height: float} */
    private function imageOverlay(string $path, float $x, float $top, float $width, float $height): array
    {
        return compact('path', 'x', 'top', 'width', 'height') + ['type' => 'image'];
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
