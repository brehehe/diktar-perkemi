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
            'PD' => 'pn-certificate-background.png',
            'WAD' => 'wad-certificate-background.png',
            'WAN' => 'wan-certificate-background.png',
            'PED' => 'ped-certificate-background.png',
            'PEN' => 'pen-certificate-background.png',
            'PN' => 'pn-certificate-background.png',
        ],
        'transcript' => [
            'PD' => 'pn-transcript-background.png',
            'WAD' => 'wad-transcript-background.png',
            'WAN' => 'wan-transcript-background.png',
            'PED' => 'ped-transcript-background.png',
            'PEN' => 'pen-transcript-background.png',
            'PN' => 'pn-transcript-background.png',
        ],
    ];

    private const TEMPLATE_DIR = 'template-perkemi-clean';

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

        if (! is_readable(resource_path('document-templates/'.self::TEMPLATE_DIR."/{$template}"))) {
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

        // Background is clean/blank — write ALL content from code
        // Canvas: 1490 x 1055 px, landscape A4 PDF (841.89 x 595.28 pt)
        // Content area starts ~x=300 (after left decorative strip ~240px wide)

        $overlays = [];

        // --- Header block ---
        // Header text is centered in the open top area between PERKEMI badge and the ribbon (~x=745)
        $headerCenterX = 745;
        $dark = [0.05, 0.05, 0.05];

        $overlays[] = $this->centeredText('PENGURUS BESAR', $headerCenterX, 82, 25, true, $dark);
        $overlays[] = $this->centeredText('PERSAUDARAAN SHORINJI KEMPO INDONESIA', $headerCenterX, 118, 30, true, $dark);
        $overlays[] = $this->centeredText('(INDONESIA SHORINJI KEMPO FEDERATION)', $headerCenterX, 148, 20, false, $dark);

        $hasKomisi = in_array($trackCode, ['PED', 'PEN'], true);
        if ($hasKomisi) {
            $overlays[] = $this->centeredText('KOMISI PENDIDIKAN DAN PENATARAN', $headerCenterX, 178, 22, true, $dark);
        }

        // --- Certificate title (large & wide across the canvas) ---
        $certTitle = match ($trackCode) {
            'PED' => 'SERTIFIKAT PENGUJI SHORINJI KEMPO DAERAH',
            'PEN' => 'SERTIFIKAT PENGUJI SHORINJI KEMPO NASIONAL',
            'PN' => 'SERTIFIKAT PELATIH SHORINJI KEMPO NASIONAL',
            'PD' => 'SERTIFIKAT PELATIH SHORINJI KEMPO DAERAH',
            'WAD' => 'SERTIFIKAT WASIT SHORINJI KEMPO DAERAH',
            'WAN' => 'SERTIFIKAT WASIT SHORINJI KEMPO NASIONAL',
            default => 'SERTIFIKAT',
        };
        $titleCenterX = 845;
        $titleY = $hasKomisi ? 236 : 225;
        $titleFontSize = mb_strlen($certTitle) > 42 ? 37 : 41;
        $overlays[] = $this->centeredText($certTitle, $titleCenterX, $titleY, $titleFontSize, true, $dark);

        // --- Nomor line with flanking gold rules ---
        $nomorY = $hasKomisi ? 282 : 274;
        $nomorSize = 22;
        $nomorLabel = 'Nomor :';
        $nomorNum = (string) $certificateNumber;
        $nomorGap = 12;
        $labelWidth = $this->textWidth($nomorLabel, $nomorSize, true);
        $numWidth = $this->textWidth($nomorNum, $nomorSize, false);
        $totalNomorWidth = $labelWidth + $nomorGap + $numWidth;
        $nomorStartX = $titleCenterX - ($totalNomorWidth / 2);
        $nomorEndX = $nomorStartX + $totalNomorWidth;

        // Gold rule flanking left and right (aligned with paragraph content margins 266 to 1353)
        $contentLeft = 266;
        $contentRight = 1353;
        $goldColor = [0.85, 0.70, 0.20];
        $overlays[] = $this->coloredRectangle($contentLeft, $nomorY - 6, max(10, $nomorStartX - 18 - $contentLeft), 2.2, $goldColor);
        $overlays[] = $this->coloredRectangle($nomorEndX + 18, $nomorY - 6, max(10, $contentRight - ($nomorEndX + 18)), 2.2, $goldColor);

        // Nomor text (single instance, no duplicates)
        $overlays[] = $this->text($nomorLabel, $nomorStartX, $nomorY, $nomorSize, true, $dark);
        $overlays[] = $this->text($nomorNum, $nomorStartX + $labelWidth + $nomorGap, $nomorY, $nomorSize, false, $dark);

        // --- Body paragraph opening ---
        $overlays[] = $this->text(
            'Pengurus Besar Persaudaraan Shorinji Kempo Indonesia menyatakan bahwa :',
            $contentLeft, 335, 24.5, false, $dark
        );

        // --- Participant data fields (enlarged and well-aligned) ---
        $labelX = 320;
        $colonX = 700;
        $dataX = 740;
        $fieldSize = 25.5;

        $fields = [
            ['Nama Lengkap', 385],
            ['Tingkat', 428],
            ['Nomor Induk Kenshi (NIK)', 470],
            ['Tempat/Tanggal Lahir', 512],
            ['Provinsi', 555],
        ];

        foreach ($fields as [$label, $fieldY]) {
            $overlays[] = $this->text($label, $labelX, $fieldY, $fieldSize, false, $dark);
            $overlays[] = $this->text(':', $colonX, $fieldY, $fieldSize, false, $dark);
        }

        // --- Participant data values ---
        if ($participant?->name) {
            $overlays[] = $this->text(
                $participant->name,
                $dataX, 385,
                $this->participantNameSize($participant->name),
                true, $dark
            );
        }

        $danRoman = $this->danRoman($participant?->dan_rank);
        if ($danRoman) {
            $overlays[] = $this->text("{$danRoman} DAN", $dataX, 428, $fieldSize, true, $dark);
        }

        if ($participant?->kenshi_id_number) {
            $overlays[] = $this->text($participant->kenshi_id_number, $dataX, 470, $fieldSize, false, $dark);
        }

        $birthPlace = trim((string) ($participant?->birth_place ?? ''));
        $birthDate = $participant?->birth_date;
        $formattedBirthDate = $birthDate ? $this->indonesianDate($birthDate) : '';
        $ttl = match (true) {
            $birthPlace !== '' && $formattedBirthDate !== '' => "{$birthPlace}, {$formattedBirthDate}",
            $birthPlace !== '' => $birthPlace,
            $formattedBirthDate !== '' => $formattedBirthDate,
            default => '-',
        };
        $overlays[] = $this->text($ttl, $dataX, 512, $fieldSize, false, $dark);

        if ($participant?->origin_province) {
            $overlays[] = $this->text($participant->origin_province, $dataX, 555, $fieldSize, false, $dark);
        }

        // --- Body conclusion paragraph ---
        $issueDate = $sigSettings['parsed_date'] ?? $event?->end_date ?? today();
        $validUntil = $issueDate->copy()->addYears(3)->endOfYear();
        $validUntilStr = $this->indonesianDate($validUntil);

        $rolePhrase = match ($trackCode) {
            'PED' => 'PENGUJI SHORINJI KEMPO DAERAH',
            'PEN' => 'PENGUJI SHORINJI KEMPO NASIONAL',
            'PN' => 'PELATIH SHORINJI KEMPO NASIONAL',
            'PD' => 'PELATIH SHORINJI KEMPO DAERAH',
            'WAD' => 'WASIT SHORINJI KEMPO DAERAH',
            'WAN' => 'WASIT SHORINJI KEMPO NASIONAL',
            default => '',
        };

        [$line1End, $line2Middle] = match ($trackCode) {
            'WAD', 'WAN' => ['dan berhak mewasiti', 'pertandingan Shorinji Kempo'],
            'PED', 'PEN' => ['dan berhak memberikan', 'Ujian Shorinji Kempo'],
            default => ['dan berhak memberikan', 'latihan Shorinji Kempo'],
        };

        // Render body paragraph justified to align flush with the right gold line at 1353
        $bodySize = 25.5;
        $bodyY = 620;
        $lineSpacing = 38;

        // Line 1: Dikukuhkan sebagai [ROLE], [line1End] (justified from 266 to 1353)
        $line1Segments = [
            ['text' => 'Dikukuhkan sebagai ', 'bold' => false],
            ['text' => $rolePhrase.',', 'bold' => true],
            ['text' => ' '.$line1End, 'bold' => false],
        ];
        foreach ($this->justifiedLine($line1Segments, $contentLeft, $contentRight, $bodyY, $bodySize, $dark) as $ov) {
            $overlays[] = $ov;
        }

        // Line 2: [line2Middle] sesuai dengan peraturan PERKEMI yang berlaku. Sertifikat ini (justified)
        $line2Segments = [
            ['text' => "{$line2Middle} sesuai dengan peraturan PERKEMI yang berlaku. Sertifikat ini", 'bold' => false],
        ];
        foreach ($this->justifiedLine($line2Segments, $contentLeft, $contentRight, $bodyY + $lineSpacing, $bodySize, $dark) as $ov) {
            $overlays[] = $ov;
        }

        // Line 3: berlaku hingga tanggal [validUntilStr], kecuali dibatalkan/ dicabut berdasarkan (justified)
        $dateParts = explode(' ', $validUntilStr);
        if (count($dateParts) === 3) {
            $line3Segments = [
                ['text' => 'berlaku hingga tanggal '],
                ['text' => "{$dateParts[0]} {$dateParts[1]}", 'atomic' => true],
                ['text' => " {$dateParts[2]}, kecuali dibatalkan/ dicabut berdasarkan"],
            ];
        } else {
            $line3Segments = [
                ['text' => "berlaku hingga tanggal {$validUntilStr}, kecuali dibatalkan/ dicabut berdasarkan", 'bold' => false],
            ];
        }
        foreach ($this->justifiedLine($line3Segments, $contentLeft, $contentRight, $bodyY + ($lineSpacing * 2), $bodySize, $dark) as $ov) {
            $overlays[] = $ov;
        }

        // Line 4: keputusan PB.PERKEMI. (left-aligned)
        $overlays[] = $this->text('keputusan PB.PERKEMI.', $contentLeft, $bodyY + ($lineSpacing * 3), $bodySize, false, $dark);

        // --- Signature block ---
        $sigCenterX = 875;
        $sigY = 785;

        $cityDateLine = "{$sigSettings['city']}, {$sigSettings['date_formatted']}";
        $cityDateWidth = $this->textWidth($cityDateLine, 22, false);
        $cityDateX = $sigCenterX - ($cityDateWidth / 2);
        $overlays[] = $this->text($cityDateLine, $cityDateX, $sigY, 22, false, $dark);
        $overlays[] = $this->coloredRectangle($cityDateX, $sigY + 3, $cityDateWidth, 1.2, $dark);

        $orgLine = $sigSettings['organization'];
        $overlays[] = $this->centeredText($orgLine, $sigCenterX, $sigY + 32, 25, true, $dark);

        $posLine = $sigSettings['position'];
        $overlays[] = $this->centeredText($posLine, $sigCenterX, $sigY + 60, 23, false, $dark);

        // Signature image
        if (! empty($sigSettings['signature_path']) && Storage::disk('public')->exists($sigSettings['signature_path'])) {
            $fullSigPath = Storage::disk('public')->path($sigSettings['signature_path']);
            if (is_readable($fullSigPath)) {
                $sigW = 190;
                $sigH = 65;
                $overlays[] = $this->imageOverlay($fullSigPath, $sigCenterX - ($sigW / 2), $sigY + 65, $sigW, $sigH);
            }
        }

        // Signer name with underline
        $nameLine = $sigSettings['signer_name'];
        $nameWidth = $this->textWidth($nameLine, 24, false);
        $nameX = $sigCenterX - ($nameWidth / 2);
        $overlays[] = $this->text($nameLine, $nameX, $sigY + 150, 24, false, $dark);
        $overlays[] = $this->coloredRectangle($nameX, $sigY + 153, $nameWidth, 1.5, $dark);

        return $this->createPdf(
            $this->templatePath('certificate', $trackCode),
            $overlays,
            "Sertifikat {$participant?->name}"
        );
    }

    public function generateTranscript(EventParticipant $eventParticipant, string $transcriptNumber, ?string $documentTrackCode = null): string
    {
        $trackCode = self::resolveDocumentTrack($eventParticipant->track_code, $documentTrackCode);
        $eventParticipant->loadMissing(['participant', 'event']);
        $participant = $eventParticipant->participant;
        $event = $eventParticipant->event;

        // Background is clean/blank — write ALL content from code
        $overlays = [];

        // === Header block ===
        // Centered in the open space between PERKEMI badge and top-right ribbon (x = 745)
        $headerCenterX = 745;
        $dark = [0.05, 0.05, 0.05];
        $overlays[] = $this->centeredText('PENGURUS BESAR', $headerCenterX, 82, 25, true, $dark);
        $overlays[] = $this->centeredText('PERSAUDARAAN SHORINJI KEMPO INDONESIA', $headerCenterX, 118, 30, true, $dark);
        $overlays[] = $this->centeredText('(INDONESIA SHORINJI KEMPO FEDERATION)', $headerCenterX, 148, 20, false, $dark);
        $overlays[] = $this->centeredText('KOMISI PENDIDIKAN DAN PENATARAN', $headerCenterX, 178, 22, true, $dark);

        // === Transcript titles ===
        $titleCenterX = 845;
        $transcriptSubtitle = match ($trackCode) {
            'PED' => 'PENATARAN PENGUJI DAERAH',
            'PEN' => 'PENATARAN PENGUJI NASIONAL',
            'PN' => 'PENATARAN PELATIH NASIONAL',
            'PD' => 'PENATARAN PELATIH DAERAH',
            'WAD' => 'PENATARAN WASIT DAERAH',
            'WAN' => 'PENATARAN WASIT NASIONAL',
            default => 'PENATARAN',
        };

        // Title 1: TRANSKRIP KOMPETENSI & REKAPITULASI PROGRAM
        $overlays[] = $this->centeredText('TRANSKRIP KOMPETENSI & REKAPITULASI PROGRAM', $titleCenterX, 208, 32, true, $dark);

        // Title 2: Subtitle flanked by single gold rule on left and right
        $subW = $this->textWidth($transcriptSubtitle, 26, true);
        $subLeft = $titleCenterX - ($subW / 2);
        $subRight = $titleCenterX + ($subW / 2);
        $goldColor = [0.85, 0.70, 0.20];

        $overlays[] = $this->coloredRectangle(241, 239, max(10, $subLeft - 18 - 241), 2.2, $goldColor);
        $overlays[] = $this->coloredRectangle($subRight + 18, 239, max(10, 1445 - ($subRight + 18)), 2.2, $goldColor);
        $overlays[] = $this->centeredText($transcriptSubtitle, $titleCenterX, 245, 26, true, $dark);

        // Nomor
        $nomorLabel = 'Nomor :';
        $nomorNum = (string) $transcriptNumber;
        $nomorGap = 12;
        $labelWidth = $this->textWidth($nomorLabel, 21, true);
        $numWidth = $this->textWidth($nomorNum, 21, false);
        $totalNomorWidth = $labelWidth + $nomorGap + $numWidth;
        $nomorStartX = $titleCenterX - ($totalNomorWidth / 2);
        $overlays[] = $this->text($nomorLabel, $nomorStartX, 278, 21, true, $dark);
        $overlays[] = $this->text($nomorNum, $nomorStartX + $labelWidth + $nomorGap, 278, 21, false, $dark);

        // === Module table (wide: 1204px spanning from x=241 to x=1445) ===
        $tableTop = 308;
        $tableLeft = 241;
        $tableW = 1204;
        $headerH = 46;
        $darkNavy = [0.17, 0.23, 0.31];
        $borderColor = [0.85, 0.88, 0.93];

        // Column widths & boundaries: KODE (129), MODUL (441), JP (100), FOKUS (534)
        $colX = [241, 370, 811, 911, 1445];
        $colCenters = [
            241 + (129 / 2),  // 305.5
            370 + (441 / 2),  // 590.5
            811 + (100 / 2),  // 861.0
            911 + (534 / 2),  // 1178.0
        ];

        // Header row background
        $overlays[] = $this->coloredRectangle($tableLeft, $tableTop, $tableW, $headerH, $darkNavy);

        // Header titles (centered in each column)
        $overlays[] = $this->centeredText('KODE', $colCenters[0], $tableTop + 31, 19, true, [1, 1, 1]);
        $overlays[] = $this->centeredText('KOMPETENSI / MODUL', $colCenters[1], $tableTop + 31, 19, true, [1, 1, 1]);
        $overlays[] = $this->centeredText('JP', $colCenters[2], $tableTop + 31, 19, true, [1, 1, 1]);
        $overlays[] = $this->centeredText('FOKUS KOMPETENSI', $colCenters[3], $tableTop + 31, 19, true, [1, 1, 1]);

        // Get modules for this track
        $filterCode = $trackCode;
        $modules = $event?->modules
            ->filter(fn ($m) => in_array($filterCode, $m->track_codes ?? [], true))
            ->values()
            ?? collect();

        if ($modules->isEmpty()) {
            throw new RuntimeException("Tidak ada modul untuk jalur {$trackCode} pada event ini.");
        }

        $count = $modules->count();
        $availableH = 430;
        $rowH = min(74, max(46, (int) ($availableH / max($count, 1))));

        foreach ($modules as $idx => $module) {
            $rowTop = $tableTop + $headerH + ($idx * $rowH);

            // Alternating row background
            if ($idx % 2 === 1) {
                $overlays[] = $this->coloredRectangle($tableLeft, $rowTop, $tableW, $rowH, [0.965, 0.98, 1.0]);
            }

            // Row bottom border
            $overlays[] = $this->coloredRectangle($tableLeft, $rowTop + $rowH - 1, $tableW, 1.2, $borderColor);

            // Column dividers within the row
            foreach ($colX as $cx) {
                $overlays[] = $this->coloredRectangle($cx, $rowTop, 1, $rowH, $borderColor);
            }

            // Vertical center text baseline
            $centerTextY = $rowTop + (int) ($rowH * 0.58);

            // Col 0: Kode (centered)
            $overlays[] = $this->centeredText((string) $module->code, $colCenters[0], $centerTextY, 18, false, $dark);

            // Col 1: Modul title (left-aligned with padding)
            $titleLines = $this->wrapText((string) $module->title, 42, 2);
            if (count($titleLines) <= 1) {
                $overlays[] = $this->text($titleLines[0] ?? '', $colX[1] + 16, $centerTextY, 18, false, $dark);
            } else {
                $tY0 = $rowTop + (int) ($rowH * 0.40);
                $overlays[] = $this->text($titleLines[0], $colX[1] + 16, $tY0, 17, false, $dark);
                $overlays[] = $this->text($titleLines[1], $colX[1] + 16, $tY0 + 24, 17, false, $dark);
            }

            // Col 2: JP (centered)
            $overlays[] = $this->centeredText((string) $module->jp, $colCenters[2], $centerTextY, 19, false, $dark);

            // Col 3: Fokus kompetensi (left-aligned with padding)
            $fokus = (string) ($module->learning_indicators ?: $module->description ?: 'Kompetensi sesuai modul kegiatan.');
            $fokusLines = $this->wrapText($fokus, 54, 3);
            if (count($fokusLines) <= 1) {
                $overlays[] = $this->text($fokusLines[0] ?? '', $colX[3] + 16, $centerTextY, 17, false, $dark);
            } elseif (count($fokusLines) === 2) {
                $fY0 = $rowTop + (int) ($rowH * 0.40);
                $overlays[] = $this->text($fokusLines[0], $colX[3] + 16, $fY0, 16, false, $dark);
                $overlays[] = $this->text($fokusLines[1], $colX[3] + 16, $fY0 + 22, 16, false, $dark);
            } else {
                $fY0 = $rowTop + (int) ($rowH * 0.28);
                $overlays[] = $this->text($fokusLines[0], $colX[3] + 16, $fY0, 15, false, $dark);
                $overlays[] = $this->text($fokusLines[1], $colX[3] + 16, $fY0 + 20, 15, false, $dark);
                $overlays[] = $this->text($fokusLines[2], $colX[3] + 16, $fY0 + 40, 15, false, $dark);
            }
        }

        // Header column dividers (drawn on top of header)
        foreach ($colX as $cx) {
            $overlays[] = $this->coloredRectangle($cx, $tableTop, 1, $headerH, [0.35, 0.42, 0.52]);
        }

        // Total row
        $totalRowTop = $tableTop + $headerH + ($count * $rowH);
        $totalRowH = 46;
        $totalJP = $modules->sum('jp');

        // Total row background fill across the entire table
        $totalBg = [1.0, 0.97, 0.82];
        $overlays[] = $this->coloredRectangle($tableLeft, $totalRowTop, $tableW, $totalRowH, $totalBg);
        $overlays[] = $this->coloredRectangle($tableLeft, $totalRowTop + $totalRowH - 1, $tableW, 1.2, $borderColor);

        // Dividers for total row
        $overlays[] = $this->coloredRectangle($colX[0], $totalRowTop, 1, $totalRowH, $borderColor);
        $overlays[] = $this->coloredRectangle($colX[2], $totalRowTop, 1, $totalRowH, $borderColor);
        $overlays[] = $this->coloredRectangle($colX[3], $totalRowTop, 1, $totalRowH, $borderColor);
        $overlays[] = $this->coloredRectangle($colX[4], $totalRowTop, 1, $totalRowH, $borderColor);

        // Total text
        $overlays[] = $this->centeredText('TOTAL BEBAN PENATARAN', 526, $totalRowTop + 30, 20, true, $dark);
        $overlays[] = $this->centeredText((string) $totalJP, $colCenters[2], $totalRowTop + 30, 20, true, $dark);

        // Footer note (centered across the canvas, elegant italic matching wan-transcript.jpeg)
        $footerY = $totalRowTop + 65;
        $shortSubtitle = ucwords(strtolower(str_replace('PENATARAN ', '', $transcriptSubtitle)));
        $year = $event?->end_date?->format('Y') ?? date('Y');

        $line1 = "Total rancangan Program Penataran {$shortSubtitle}: {$totalJP} JP. Pembagian Teori/Praktik tidak ditampilkan karena sumber modul menetapkan alokasi per modul dalam JP total.";
        $line2 = "Basis: Modul {$shortSubtitle} PERKEMI {$year} dan kerangka kompetensi tenaga keolahragaan yang berlaku.";

        $overlays[] = $this->centeredText($line1, $titleCenterX, $footerY, 15, false, [0.25, 0.25, 0.25], true);
        $overlays[] = $this->centeredText($line2, $titleCenterX, $footerY + 22, 15, false, [0.25, 0.25, 0.25], true);

        return $this->createPdf(
            $this->templatePath('transcript', $trackCode),
            $overlays,
            "Transkrip {$participant?->name}"
        );
    }

    private function templatePath(string $type, ?string $trackCode): string
    {
        $template = self::TEMPLATES[$type][strtoupper((string) $trackCode)] ?? null;

        if (! $template) {
            throw new InvalidArgumentException('Template dokumen tidak tersedia untuk jalur peserta ini.');
        }

        $path = resource_path('document-templates/'.self::TEMPLATE_DIR."/{$template}");

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
        $dimensions = getimagesize($templatePath);

        if ($dimensions === false) {
            throw new RuntimeException('Template dokumen tidak dapat dibaca.');
        }

        // PNG cannot be embedded with DCTDecode — convert to JPEG in memory via GD
        $mimeType = $dimensions['mime'] ?? '';
        if ($mimeType === 'image/png') {
            $gd = @imagecreatefrompng($templatePath);
            if (! $gd) {
                throw new RuntimeException('Template PNG tidak dapat dibaca oleh GD.');
            }
            ob_start();
            imagejpeg($gd, null, 95);
            $image = ob_get_clean();
            imagedestroy($gd);
        } else {
            $image = file_get_contents($templatePath);
        }

        if ($image === false || $image === '') {
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
        $nextObjNum = 10;
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
            $font = match (true) {
                $overlay['italic'] ?? false => '/F3',
                $overlay['bold'] ?? false => '/F2',
                default => '/F1',
            };
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
            3 => "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {$pageWidth} {$pageHeight}] /Resources << /XObject << {$xObjectsDict} >> /Font << /F1 5 0 R /F2 6 0 R /F3 9 0 R >> >> /Contents 7 0 R >>",
            4 => "<< /Type /XObject /Subtype /Image /Width {$width} /Height {$height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ".strlen($image)." >>\nstream\n{$image}\nendstream",
            5 => '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>',
            6 => '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold /Encoding /WinAnsiEncoding >>',
            7 => '<< /Length '.strlen($content)." >>\nstream\n{$content}endstream",
            8 => '<< /Title ('.$this->pdfText($title).') /Creator (Pustaka Penataran) >>',
            9 => '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Italic /Encoding /WinAnsiEncoding >>',
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
     * @return array{type: string, x: float, top: float, text: string, size: float, bold: bool, color: array<int, float>, italic?: bool}
     */
    private function text(string $text, float $x, float $top, float $size, bool $bold = false, array $color = [0, 0, 0], bool $italic = false): array
    {
        return compact('text', 'x', 'top', 'size', 'bold', 'color', 'italic') + ['type' => 'text'];
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
            mb_strlen($name) > 38 => 24,
            mb_strlen($name) > 28 => 28,
            default => 32,
        };
    }

    /**
     * @param  array<int, array{text: string, bold?: bool, italic?: bool, atomic?: bool}>  $segments
     * @param  array<int, float>  $color
     * @return array<int, array<string, mixed>>
     */
    private function justifiedLine(array $segments, float $startX, float $endX, float $top, float $size, array $color = [0, 0, 0]): array
    {
        $words = [];
        foreach ($segments as $seg) {
            $bold = (bool) ($seg['bold'] ?? false);
            $italic = (bool) ($seg['italic'] ?? false);
            if (! empty($seg['atomic'])) {
                $text = trim($seg['text'] ?? '');
                if ($text !== '') {
                    $words[] = [
                        'text' => $text,
                        'bold' => $bold,
                        'italic' => $italic,
                    ];
                }

                continue;
            }

            $tokens = preg_split('/\s+/u', trim($seg['text'] ?? ''));
            if (! is_array($tokens)) {
                continue;
            }
            foreach ($tokens as $token) {
                if ($token !== '') {
                    $words[] = [
                        'text' => $token,
                        'bold' => $bold,
                        'italic' => $italic,
                    ];
                }
            }
        }

        if (empty($words)) {
            return [];
        }

        $numWords = count($words);
        if ($numWords === 1) {
            return [$this->text($words[0]['text'], $startX, $top, $size, $words[0]['bold'], $color, $words[0]['italic'])];
        }

        $totalWordWidth = 0.0;
        foreach ($words as &$w) {
            $w['width'] = $this->textWidth($w['text'], $size, $w['bold']);
            $totalWordWidth += $w['width'];
        }
        unset($w);

        $targetWidth = $endX - $startX;
        $numGaps = $numWords - 1;
        $gapWidth = max(0.0, ($targetWidth - $totalWordWidth) / $numGaps);

        $overlays = [];
        $currentX = $startX;
        foreach ($words as $w) {
            $overlays[] = $this->text($w['text'], $currentX, $top, $size, $w['bold'], $color, $w['italic']);
            $currentX += $w['width'] + $gapWidth;
        }

        return $overlays;
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

    private function textWidth(string $text, float $size, bool $bold = false): float
    {
        $len = mb_strlen($text);
        $upper = preg_match_all('/[A-Z]/', $text);
        $lower = preg_match_all('/[a-z0-9]/', $text);
        $punct = preg_match_all('/[ ,.:;\-_()\/]/', $text);
        $other = max(0, $len - $upper - $lower - $punct);

        $upperFactor = $bold ? 0.72 : 0.67;
        $lowerFactor = $bold ? 0.52 : 0.45;
        $punctFactor = $bold ? 0.28 : 0.25;
        $otherFactor = $bold ? 0.55 : 0.50;

        return ($upper * $upperFactor + $lower * $lowerFactor + $punct * $punctFactor + $other * $otherFactor) * $size;
    }

    /** @param array<int, float> $color */
    private function centeredText(string $text, float $centerX, float $top, float $size, bool $bold = false, array $color = [0, 0, 0], bool $italic = false): array
    {
        $width = $this->textWidth($text, $size, $bold);
        $x = $centerX - ($width / 2);

        return $this->text($text, $x, $top, $size, $bold, $color, $italic);
    }

    /**
     * @return array<int, string>
     */
    private function wrapText(string $text, int $charsPerLine, int $maxLines = 3): array
    {
        $lines = explode("\n", wordwrap($text, $charsPerLine, "\n", false));

        return array_slice($lines, 0, $maxLines);
    }
}
