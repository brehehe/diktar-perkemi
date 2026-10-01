<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventParticipant;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class EventKenshiExamDocumentService
{
    public function __construct(private readonly EventKenshiExamService $kenshiExamService) {}

    public const DOCUMENT_TECHNIQUE_ASSESSMENT = 'penilaian-teknik';

    public const DOCUMENT_SCORE_TABULATION = 'tabulasi-penilaian';

    public const DOCUMENT_RESULT_REPORT = 'laporan-hasil';

    public const DOCUMENT_KYU_DAN_REPORT = 'laporan-kyu-dan';

    /** @var array<string, string> */
    private const TEMPLATE_FILES = [
        self::DOCUMENT_TECHNIQUE_ASSESSMENT => 'xlsx/new/Formulir-27 (Penilaian Ujian Teknik) Kyu+Dan1 (1).xlsx',
        self::DOCUMENT_SCORE_TABULATION => 'xlsx/new/Formulir-27 (Tabulasi Penilaian Ujian) (1).xlsx',
        self::DOCUMENT_RESULT_REPORT => 'xlsx/new/Formulir-28 (Laporan Hasil Ujian).xlsx',
        self::DOCUMENT_KYU_DAN_REPORT => 'xlsx/new/2020 Kyu-Dan Exam Report.xlsx',
    ];

    /** @var array<string, string> */
    private const TECHNIQUE_SHEETS = [
        'KYU-8' => '8 KYU',
        'KYU-7' => '7 KYU',
        'KYU-6' => '6 KYU',
        'KYU-5' => '5 KYU',
        'KYU-4' => '4 KYU',
        'KYU-3' => '3 KYU',
        'KYU-2' => '2 KYU',
        'KYU-1' => '1 KYU',
    ];

    /** @var array<string, int> */
    private const RECAP_START_ROWS = [
        'KYU-8' => 9,
        'KYU-7' => 60,
        'KYU-6' => 111,
        'KYU-5' => 162,
        'KYU-4' => 213,
        'KYU-3' => 264,
        'KYU-2' => 315,
        'KYU-1' => 366,
    ];

    /** @var array<string, string> */
    private const FILE_PREFIXES = [
        self::DOCUMENT_TECHNIQUE_ASSESSMENT => 'formulir-27-penilaian-teknik',
        self::DOCUMENT_SCORE_TABULATION => 'formulir-27-tabulasi-penilaian',
        self::DOCUMENT_RESULT_REPORT => 'formulir-28-laporan-hasil',
        self::DOCUMENT_KYU_DAN_REPORT => 'laporan-ujian-kyu-dan',
    ];

    public function supports(string $document): bool
    {
        return isset(self::TEMPLATE_FILES[$document]);
    }

    public function export(Event $event, string $document): string
    {
        if (! $this->supports($document)) {
            throw new \InvalidArgumentException("Dokumen ujian kenshi tidak didukung: {$document}");
        }

        $templatePath = public_path(self::TEMPLATE_FILES[$document]);
        if (! file_exists($templatePath)) {
            throw new \RuntimeException('Template dokumen ujian kenshi tidak ditemukan di '.$templatePath);
        }

        $spreadsheet = IOFactory::load($templatePath);
        $participantsByTrack = $this->participantsByTrack($event);

        match ($document) {
            self::DOCUMENT_TECHNIQUE_ASSESSMENT => $this->fillTechniqueAssessment($spreadsheet, $event, $participantsByTrack),
            self::DOCUMENT_SCORE_TABULATION => $this->fillScoreTabulation($spreadsheet, $event, $participantsByTrack),
            self::DOCUMENT_RESULT_REPORT => $this->fillResultReport($spreadsheet, $event, $participantsByTrack),
            self::DOCUMENT_KYU_DAN_REPORT => $this->fillKyuDanReport($spreadsheet, $event, $participantsByTrack),
        };

        $filePath = $this->temporaryPath($event, self::FILE_PREFIXES[$document]);
        $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
        $writer->setPreCalculateFormulas(false);
        $writer->save($filePath);
        $spreadsheet->disconnectWorksheets();

        return $filePath;
    }

    /**
     * @return array<string, Collection<int, array<string, mixed>>>
     */
    private function participantsByTrack(Event $event): array
    {
        $participants = EventParticipant::query()
            ->whereBelongsTo($event)
            ->with([
                'participant',
                'registrationForm',
                'assessments' => fn ($query) => $query->where('category', EventKenshiExamService::ASSESSMENT_CATEGORY),
            ])
            ->orderBy('track_code')
            ->orderBy('id')
            ->get()
            ->filter(fn (EventParticipant $enrollment): bool => isset(self::TECHNIQUE_SHEETS[$enrollment->track_code]))
            ->map(fn (EventParticipant $enrollment): array => $this->participantData($event, $enrollment))
            ->groupBy('track_code');

        $grouped = [];
        foreach (array_keys(self::TECHNIQUE_SHEETS) as $trackCode) {
            $grouped[$trackCode] = ($participants->get($trackCode) ?? collect())
                ->sortBy(fn (array $participant): string => Str::lower($participant['name']))
                ->values();
        }

        return $grouped;
    }

    /** @return array<string, mixed> */
    private function participantData(Event $event, EventParticipant $enrollment): array
    {
        $participant = $enrollment->participant;
        $registrationForm = $enrollment->registrationForm;
        $birthDate = $participant?->birth_date ?? $registrationForm?->birth_date;
        $gender = Str::lower(trim((string) ($participant?->gender ?? '')));
        $isFemale = in_array($gender, ['female', 'perempuan', 'p', 'wanita'], true);
        $assessment = $enrollment->assessments->first();
        $scores = $assessment?->scores ?? [];
        $calculation = $this->kenshiExamService->calculate($enrollment->track_code, $scores);
        $hasAssessment = $assessment !== null && (
            collect($scores)->contains(
                fn (mixed $value, string $key): bool => ! str_starts_with($key, '_') && $value !== null && $value !== ''
            ) || ($scores['_status_override'] ?? 'auto') !== 'auto'
        );

        return [
            'track_code' => $enrollment->track_code,
            'name' => $participant?->name ?? $registrationForm?->full_name ?? 'Peserta',
            'nik' => $participant?->kenshi_id ?? $registrationForm?->kenshi_id_number ?? '-',
            'gender_short' => $isFemale ? 'P' : 'L',
            'gender_english' => $isFemale ? 'Female' : 'Male',
            'age' => $birthDate ? (int) $birthDate->diffInYears($event->start_date ?? now()) : null,
            'birth_date' => $birthDate,
            'dojo' => $participant?->dojo ?? $registrationForm?->dojo_name ?? '',
            'city' => $participant?->origin_city ?? '',
            'province' => $participant?->origin_province ?? '',
            'origin' => collect([
                $participant?->dojo ?? $registrationForm?->dojo_name,
                $participant?->origin_city,
                $participant?->origin_province,
            ])->filter()->unique()->implode(' / '),
            'scores' => $scores,
            'calculation' => $calculation,
            'notes' => $assessment?->notes ?? '',
            'has_assessment' => $hasAssessment,
            'graduation_status' => $hasAssessment
                ? $calculation['status']
                : $this->graduationStatus($enrollment->graduation_status),
        ];
    }

    /**
     * @param  array<string, Collection<int, array<string, mixed>>>  $participantsByTrack
     */
    private function fillTechniqueAssessment(Spreadsheet $spreadsheet, Event $event, array $participantsByTrack): void
    {
        foreach (self::TECHNIQUE_SHEETS as $trackCode => $sheetName) {
            $documentDetails = $this->kenshiExamService->documentDetails($event, $trackCode);
            $sheet = $spreadsheet->getSheetByName($sheetName);
            if ($sheet) {
                $this->fillTechniqueSheet($sheet, $event, $trackCode, $participantsByTrack[$trackCode], $documentDetails);
            }

            $embuSheet = $spreadsheet->getSheetByName($sheetName.' (Hal 2)');
            if ($embuSheet) {
                $this->fillEmbuSheet($embuSheet, $event, $trackCode, $participantsByTrack[$trackCode], $documentDetails);
            }
        }

        foreach (['1 DAN', '1 DAN (Hal 2)'] as $unsupportedSheetName) {
            $unsupportedSheet = $spreadsheet->getSheetByName($unsupportedSheetName);
            if ($unsupportedSheet) {
                $this->clearUnsupportedTechniqueSheet($unsupportedSheet, $event);
            }
        }

        $recapSheet = $spreadsheet->getSheetByName('F-27 Rekap');
        if ($recapSheet) {
            $this->fillTechniqueRecap($recapSheet, $event, $participantsByTrack);
        }

        $spreadsheet->setActiveSheetIndexByName('8 KYU');
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $participants
     * @param  array<string, mixed>  $documentDetails
     */
    private function fillTechniqueSheet(Worksheet $sheet, Event $event, string $trackCode, Collection $participants, array $documentDetails): void
    {
        $sheet->setCellValue('A3', 'Tanggal : '.$this->eventDate($event));
        $this->fillTechniqueExaminerFields($sheet, $documentDetails);
        $participantRows = $this->numberedRows($sheet, 50);
        $config = $this->kenshiExamService->criteriaConfig()[$trackCode];

        foreach ($participantRows as $index => $row) {
            $this->clearCells($sheet, $row, ['B', 'C', 'D', 'E', 'F']);
            $this->clearCells($sheet, $row, $this->columnsBetween('G', $config['grand_total_column']));
            $participant = $participants->get($index);
            if (! $participant) {
                continue;
            }

            $sheet->setCellValue('B'.$row, $participant['name']);
            $sheet->setCellValueExplicit('C'.$row, (string) $participant['nik'], DataType::TYPE_STRING);
            $sheet->setCellValue('D'.$row, $participant['origin']);
            $sheet->setCellValue('E'.$row, $participant['gender_short']);
            $sheet->setCellValue('F'.$row, $participant['age']);

            foreach ($config['groups'] as $group) {
                foreach ($group['criteria'] as $criterion) {
                    if ($criterion['sheet'] !== 'main') {
                        continue;
                    }
                    $value = $participant['scores'][$criterion['key']] ?? null;
                    if ($value !== null && $value !== '') {
                        $sheet->setCellValue($criterion['column'].$row, (float) $value);
                    }
                }

                if ($group['sheet'] === 'main' && $group['subtotal_column'] && $participant['has_assessment']) {
                    $sheet->setCellValue($group['subtotal_column'].$row, $participant['calculation']['group_totals'][$group['key']]);
                }
                if ($group['main_summary_column'] && $participant['has_assessment']) {
                    $sheet->setCellValue($group['main_summary_column'].$row, $participant['calculation']['group_totals'][$group['key']]);
                }
            }

            if ($participant['has_assessment']) {
                if ($config['part_a_column']) {
                    $sheet->setCellValue($config['part_a_column'].$row, $participant['calculation']['part_a_total']);
                }
                if ($config['part_b_column']) {
                    $sheet->setCellValue($config['part_b_column'].$row, $participant['calculation']['part_b_total']);
                }
                $sheet->setCellValue($config['grand_total_column'].$row, $participant['calculation']['practice_total']);
            }
        }
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $participants
     * @param  array<string, mixed>  $documentDetails
     */
    private function fillEmbuSheet(Worksheet $sheet, Event $event, string $trackCode, Collection $participants, array $documentDetails): void
    {
        $sheet->setCellValue('A3', 'Tanggal : '.$this->eventDate($event));
        $this->fillTechniqueExaminerFields($sheet, $documentDetails);
        $participantRows = $this->numberedRows($sheet, 50);
        $config = $this->kenshiExamService->criteriaConfig()[$trackCode];

        foreach ($participantRows as $index => $row) {
            $this->clearCells($sheet, $row, $this->columnsBetween('B', 'O'));
            $sheet->setCellValue('Q'.$row, null);
            $participant = $participants->get($index);
            if (! $participant) {
                continue;
            }

            $sheet->setCellValue('B'.$row, $participant['name']);
            foreach ($config['groups'] as $group) {
                if ($group['sheet'] !== 'embu') {
                    continue;
                }
                foreach ($group['criteria'] as $criterion) {
                    $value = $participant['scores'][$criterion['key']] ?? null;
                    if ($value !== null && $value !== '') {
                        $sheet->setCellValue($criterion['column'].$row, (float) $value);
                    }
                }
                if ($group['subtotal_column'] && $participant['has_assessment']) {
                    $sheet->setCellValue($group['subtotal_column'].$row, $participant['calculation']['group_totals'][$group['key']]);
                }
            }
            if ($participant['has_assessment']) {
                $embuTotal = ($participant['calculation']['group_totals']['kumi_ketepatan'] ?? 0)
                    + ($participant['calculation']['group_totals']['kumi_penampilan'] ?? 0);
                $sheet->setCellValue('O'.$row, $embuTotal);
                $sheet->setCellValue('Q'.$row, $participant['notes']);
            }
        }
    }

    /**
     * @param  array<string, Collection<int, array<string, mixed>>>  $participantsByTrack
     */
    private function fillTechniqueRecap(Worksheet $sheet, Event $event, array $participantsByTrack): void
    {
        foreach (self::RECAP_START_ROWS as $trackCode => $startRow) {
            $documentDetails = $this->kenshiExamService->documentDetails($event, $trackCode);
            for ($offset = 0; $offset < 40; $offset++) {
                $row = $startRow + $offset;
                $this->clearCells($sheet, $row, ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'M', 'N']);

                $participant = $participantsByTrack[$trackCode]->get($offset);
                if (! $participant) {
                    continue;
                }

                $sheet->setCellValue('B'.$row, $participant['name']);
                $sheet->setCellValueExplicit('C'.$row, (string) $participant['nik'], DataType::TYPE_STRING);
                $sheet->setCellValue('D'.$row, $participant['origin']);
                $sheet->setCellValue('E'.$row, $participant['gender_short']);
                $sheet->setCellValue('F'.$row, $participant['age']);
                if ($participant['has_assessment']) {
                    $calculation = $participant['calculation'];
                    $sheet->setCellValue('G'.$row, $calculation['theory_total']);
                    $sheet->setCellValue('I'.$row, $calculation['practice_total']);
                    $sheet->setCellValue('J'.$row, $calculation['total_score']);
                    $sheet->setCellValue('K'.$row, $this->shortStatus($calculation['status']));
                    $sheet->setCellValue('M'.$row, 280);
                    $sheet->setCellValue('N'.$row, $calculation['percentage'] / 100);
                }
            }

            $detailsStartRow = $startRow + 42;
            $sheet->setCellValue('A'.$detailsStartRow, '1. Kegiatan : '.$event->name);
            $sheet->setCellValue('A'.($detailsStartRow + 1), '2. Tempat   : '.$event->place);
            $sheet->setCellValue('A'.($detailsStartRow + 2), '3. Tanggal  : '.$this->eventDate($event));
            $sheet->setCellValue('E'.($detailsStartRow + 3), 'Nama : '.$documentDetails['coordinator_name']);
            $sheet->setCellValue('E'.($detailsStartRow + 4), 'Tingkat : '.$documentDetails['coordinator_rank']);
            $sheet->setCellValue('I'.($detailsStartRow + 3), 'Nama : '.$documentDetails['organizer_representative_name']);
            $sheet->setCellValue('I'.($detailsStartRow + 4), 'Tingkat : '.$documentDetails['organizer_representative_rank']);
        }

        for ($row = 417; $row <= 456; $row++) {
            $this->clearCells($sheet, $row, range('B', 'N'));
        }
        $sheet->setCellValue('A459', '1. Kegiatan : '.$event->name);
        $sheet->setCellValue('A460', '2. Tempat   : '.$event->place);
        $sheet->setCellValue('A461', '3. Tanggal  : '.$this->eventDate($event));
    }

    /**
     * @param  array<string, Collection<int, array<string, mixed>>>  $participantsByTrack
     */
    private function fillScoreTabulation(Spreadsheet $spreadsheet, Event $event, array $participantsByTrack): void
    {
        $template = $spreadsheet->getActiveSheet();
        $generatedSheets = [];

        foreach ($participantsByTrack as $trackCode => $participants) {
            if ($participants->isEmpty()) {
                continue;
            }

            foreach ($participants->chunk(15)->values() as $pageIndex => $pageParticipants) {
                $sheet = clone $template;
                $sheet->setTitle($this->sheetTitle($trackCode, $pageIndex));
                $spreadsheet->addSheet($sheet);
                $this->fillScoreTabulationSheet(
                    $sheet,
                    $event,
                    $trackCode,
                    $pageParticipants,
                    $pageIndex * 15,
                    $this->kenshiExamService->documentDetails($event, $trackCode),
                );
                $generatedSheets[] = $sheet;
            }
        }

        if ($generatedSheets !== []) {
            $spreadsheet->removeSheetByIndex($spreadsheet->getIndex($template));
            $spreadsheet->setActiveSheetIndex(0);
        }
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $participants
     * @param  array<string, mixed>  $documentDetails
     */
    private function fillScoreTabulationSheet(Worksheet $sheet, Event $event, string $trackCode, Collection $participants, int $numberOffset, array $documentDetails): void
    {
        $sheet->setCellValue('A11', 'Menuju '.$this->trackLabel($trackCode));

        for ($row = 15; $row <= 29; $row++) {
            $this->clearCells($sheet, $row, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']);
            $participant = $participants->get($row - 15);
            if (! $participant) {
                continue;
            }

            $sheet->setCellValue('A'.$row, $numberOffset + ($row - 14));
            $sheet->setCellValue('B'.$row, $participant['name']);
            $sheet->setCellValueExplicit('C'.$row, (string) $participant['nik'], DataType::TYPE_STRING);
            $sheet->setCellValue('D'.$row, $participant['origin']);
            if ($participant['has_assessment']) {
                $scores = $participant['scores'];
                $calculation = $participant['calculation'];
                $sheet->setCellValue('E'.$row, $scores['theory_history'] ?? null);
                $sheet->setCellValue('F'.$row, $scores['theory_philosophy'] ?? null);
                $sheet->setCellValue('G'.$row, $calculation['part_a_total']);
                $sheet->setCellValue('H'.$row, $calculation['part_b_total']);
                $sheet->setCellValue('I'.$row, $calculation['total_score']);
                $sheet->setCellValue('J'.$row, $this->shortStatus($calculation['status']));
            }
        }

        $sheet->setCellValue('A32', '1. Kegiatan : '.$event->name);
        $sheet->setCellValue('A34', '2. Tempat   : '.$event->place);
        $sheet->setCellValue('A36', '3. Tanggal  : '.$this->eventDate($event));
        $sheet->setCellValue('E37', 'Nama : '.$documentDetails['coordinator_name']);
        $sheet->setCellValue('E38', 'Tingkat : '.$documentDetails['coordinator_rank']);
        $sheet->setCellValue('H37', 'Nama : '.$documentDetails['organizer_representative_name']);
        $sheet->setCellValue('H38', 'Tingkat : '.$documentDetails['organizer_representative_rank']);
    }

    /**
     * @param  array<string, Collection<int, array<string, mixed>>>  $participantsByTrack
     */
    private function fillResultReport(Spreadsheet $spreadsheet, Event $event, array $participantsByTrack): void
    {
        $template = $spreadsheet->getActiveSheet();
        $generatedSheets = [];

        foreach ($participantsByTrack as $trackCode => $participants) {
            if ($participants->isEmpty()) {
                continue;
            }

            foreach ($participants->chunk(20)->values() as $pageIndex => $pageParticipants) {
                $sheet = clone $template;
                $sheet->setTitle($this->sheetTitle($trackCode, $pageIndex));
                $spreadsheet->addSheet($sheet);
                $this->fillResultReportSheet(
                    $sheet,
                    $event,
                    $trackCode,
                    $pageParticipants,
                    $pageIndex * 20,
                    $this->kenshiExamService->documentDetails($event, $trackCode),
                );
                $generatedSheets[] = $sheet;
            }
        }

        if ($generatedSheets !== []) {
            $spreadsheet->removeSheetByIndex($spreadsheet->getIndex($template));
            $spreadsheet->setActiveSheetIndex(0);
        }
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $participants
     * @param  array<string, mixed>  $documentDetails
     */
    private function fillResultReportSheet(Worksheet $sheet, Event $event, string $trackCode, Collection $participants, int $numberOffset, array $documentDetails): void
    {
        $sheet->setCellValue('D9', $this->trackLabel($trackCode));
        $sheet->setCellValue('D10', $event->place);
        $sheet->setCellValue('H10', $this->eventDate($event));
        $sheet->setCellValue('D11', $documentDetails['mandate_number']);
        $sheet->setCellValue('H11', $this->documentDate($documentDetails['mandate_date']));
        foreach ($documentDetails['examiners'] as $index => $examiner) {
            $row = 12 + $index;
            $sheet->setCellValue('E'.$row, $examiner['name']);
            $sheet->setCellValue('H'.$row, $examiner['certificate_number']);
        }

        for ($row = 17; $row <= 36; $row++) {
            foreach (['A', 'B', 'E', 'F', 'G'] as $column) {
                $sheet->setCellValue($column.$row, null);
            }

            $participant = $participants->get($row - 17);
            if (! $participant) {
                continue;
            }

            $sheet->setCellValue('A'.$row, $numberOffset + ($row - 16));
            $sheet->setCellValue('B'.$row, $participant['name']);
            $sheet->setCellValue('E'.$row, $participant['dojo'] ?: $participant['city']);
            $sheet->setCellValueExplicit('F'.$row, (string) $participant['nik'], DataType::TYPE_STRING);
            $sheet->setCellValue('G'.$row, $participant['graduation_status']);
        }

        $sheet->setCellValue('F38', $event->organizer ?: 'PERKEMI');
        $sheet->setCellValue('F43', 'Nama : '.$documentDetails['organizer_representative_name']);
        $sheet->setCellValue('F44', 'Jabatan : '.$documentDetails['organizer_representative_role']);
    }

    /**
     * @param  array<string, Collection<int, array<string, mixed>>>  $participantsByTrack
     */
    private function fillKyuDanReport(Spreadsheet $spreadsheet, Event $event, array $participantsByTrack): void
    {
        $dataSheet = $spreadsheet->getSheetByName('Data Kyu');
        if (! $dataSheet) {
            throw new \RuntimeException('Sheet Data Kyu tidak ditemukan pada template laporan Kyu-Dan.');
        }

        $dataSheet->setCellValue('C1', $event->name);
        $dataSheet->setCellValue('C2', trim($event->place.', '.$this->eventDateRange($event), ', '));

        for ($row = 6; $row <= $dataSheet->getHighestDataRow(); $row++) {
            $this->clearCells($dataSheet, $row, range('A', 'N'));
        }

        $row = 6;
        $number = 1;
        foreach ($participantsByTrack as $participants) {
            foreach ($participants as $participant) {
                $birthDate = $participant['birth_date'];
                $dataSheet->fromArray([
                    $number,
                    $participant['name'],
                    $participant['nik'],
                    $participant['gender_english'],
                    $participant['age'],
                    $birthDate?->format('Y'),
                    $birthDate?->format('m'),
                    $birthDate?->format('d'),
                    str_replace('KYU-', '', $participant['track_code']).' KYU',
                    $participant['dojo'],
                    $participant['city'],
                    $participant['province'],
                    'approved',
                    $participant['graduation_status'],
                ], null, 'A'.$row);
                $row++;
                $number++;
            }
        }

        $dataDanSheet = $spreadsheet->getSheetByName('Data Dan');
        if ($dataDanSheet) {
            for ($clearRow = 6; $clearRow <= $dataDanSheet->getHighestDataRow(); $clearRow++) {
                $this->clearCells($dataDanSheet, $clearRow, range('A', 'N'));
            }
        }

        $reportSheet = $spreadsheet->getSheetByName('KYU Report');
        if ($reportSheet) {
            $examDate = $event->end_date ?? $event->start_date ?? now();
            $reportSheet->setCellValue('L5', (int) $examDate->format('Y'));
            $reportSheet->setCellValue('Q5', (int) $examDate->format('m'));
            $reportSheet->setCellValue('U5', (int) $examDate->format('d'));
            $chiefExaminer = collect(array_reverse(EventKenshiExamService::TRACK_CODES))
                ->map(fn (string $trackCode): array => $this->kenshiExamService->documentDetails($event, $trackCode)['examiners'][0])
                ->first(fn (array $examiner): bool => $examiner['name'] !== '');
            if ($chiefExaminer) {
                $label = $chiefExaminer['name'];
                if ($chiefExaminer['rank'] !== '') {
                    $label .= ' ('.$chiefExaminer['rank'].')';
                }
                $reportSheet->setCellValue('F65', $label);
            }
            $spreadsheet->setActiveSheetIndex($spreadsheet->getIndex($reportSheet));
        }
    }

    /** @param array<string, mixed> $documentDetails */
    private function fillTechniqueExaminerFields(Worksheet $sheet, array $documentDetails): void
    {
        $nameIndex = 0;
        $rankIndex = 0;

        foreach ($sheet->getCellCollection()->getCoordinates() as $coordinate) {
            $value = preg_replace('/\s+/u', ' ', trim((string) $sheet->getCell($coordinate)->getValue()));
            if (! in_array($value, ['Nama :', 'DAN :'], true)) {
                continue;
            }

            [$column, $row] = Coordinate::coordinateFromString($coordinate);
            $targetColumn = Coordinate::stringFromColumnIndex(Coordinate::columnIndexFromString($column) + 1);
            $index = $value === 'Nama :' ? $nameIndex++ : $rankIndex++;
            $examiner = $documentDetails['examiners'][$index % 3];
            $sheet->setCellValue($targetColumn.$row, $value === 'Nama :' ? $examiner['name'] : $examiner['rank']);
        }
    }

    private function clearUnsupportedTechniqueSheet(Worksheet $sheet, Event $event): void
    {
        $sheet->setCellValue('A3', 'Tanggal : '.$this->eventDate($event));
        foreach ($this->numberedRows($sheet, 50) as $row) {
            $this->clearCells($sheet, $row, $this->columnsBetween('B', $sheet->getHighestDataColumn()));
        }
    }

    private function documentDate(string $date): string
    {
        return $date === '' ? '' : Carbon::parse($date)->format('d-m-Y');
    }

    /** @return array<int, int> */
    private function numberedRows(Worksheet $sheet, int $limit): array
    {
        $rows = [];
        for ($row = 1; $row <= $sheet->getHighestRow(); $row++) {
            $value = $sheet->getCell('A'.$row)->getValue();
            $isInitialNumber = is_numeric($value) && (int) $value >= 1 && (int) $value <= $limit;
            $isSequenceFormula = is_string($value) && preg_match('/^=A\d+\+1$/', $value) === 1;

            if ($isInitialNumber || $isSequenceFormula) {
                $rows[] = $row;
            }

            if (count($rows) === $limit) {
                break;
            }
        }

        return $rows;
    }

    private function graduationStatus(?string $status): string
    {
        return match (Str::upper(str_replace(['-', '_'], ' ', trim((string) $status)))) {
            'LULUS', 'PASSED' => 'LULUS',
            'TIDAK LULUS', 'FAILED' => 'TIDAK LULUS',
            'TIDAK HADIR', 'ABSENT' => 'TIDAK HADIR',
            default => '',
        };
    }

    private function shortStatus(string $status): string
    {
        return match ($status) {
            'LULUS' => 'L',
            'TIDAK LULUS' => 'TL',
            'TIDAK HADIR' => 'TH',
            default => '',
        };
    }

    /** @return array<int, string> */
    private function columnsBetween(string $first, string $last): array
    {
        $columns = [];
        $firstIndex = Coordinate::columnIndexFromString($first);
        $lastIndex = Coordinate::columnIndexFromString($last);

        for ($index = $firstIndex; $index <= $lastIndex; $index++) {
            $columns[] = Coordinate::stringFromColumnIndex($index);
        }

        return $columns;
    }

    /** @param array<int, string> $columns */
    private function clearCells(Worksheet $sheet, int $row, array $columns): void
    {
        foreach ($columns as $column) {
            $sheet->setCellValue($column.$row, null);
        }
    }

    private function trackLabel(string $trackCode): string
    {
        return str_replace('-', ' ', $trackCode);
    }

    private function sheetTitle(string $trackCode, int $pageIndex): string
    {
        $title = $this->trackLabel($trackCode);

        return $pageIndex === 0 ? $title : $title.' ('.($pageIndex + 1).')';
    }

    private function eventDate(Event $event): string
    {
        return ($event->end_date ?? $event->start_date)?->format('d-m-Y') ?? '-';
    }

    private function eventDateRange(Event $event): string
    {
        if ($event->start_date && $event->end_date) {
            return $event->start_date->format('d-m-Y').' s.d. '.$event->end_date->format('d-m-Y');
        }

        return $this->eventDate($event);
    }

    private function temporaryPath(Event $event, string $prefix): string
    {
        $directory = storage_path('app/temp');
        if (! is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        $eventSlug = Str::slug($event->slug ?: $event->name ?: 'event-'.$event->id);

        return $directory.'/'.$prefix.'-'.$eventSlug.'-'.now()->format('Ymd-His').'.xlsx';
    }
}
