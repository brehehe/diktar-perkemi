<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\QuestionBank;
use App\Models\QuestionModule;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class QuestionModuleImportService
{
    /**
     * Import a bank soal Excel file into QuestionModules and QuestionBank.
     *
     * @return array{
     *     modules_count: int,
     *     total_questions: int,
     *     pre_test_count: int,
     *     quiz_count: int,
     *     post_test_count: int,
     *     modules_created: array<int, string>,
     * }
     */
    public function import(UploadedFile|string $file, ?int $userId = null, ?int $eventId = null): array
    {
        $filePath = is_string($file) ? $file : $file->getRealPath();

        try {
            $spreadsheet = IOFactory::load($filePath);
        } catch (\Throwable $e) {
            throw ValidationException::withMessages([
                'file' => 'Berkas Excel tidak valid atau rusak: '.$e->getMessage(),
            ]);
        }

        $sheetNames = $spreadsheet->getSheetNames();

        // Must contain at least one question sheet
        $questionSheets = array_values(array_intersect(['PRE-TEST', 'KUIS', 'POST-TEST'], $sheetNames));
        if (empty($questionSheets)) {
            throw ValidationException::withMessages([
                'file' => 'Berkas Excel harus memiliki minimal satu sheet soal: PRE-TEST, KUIS, atau POST-TEST.',
            ]);
        }

        // 1. Extract PETUNJUK
        $petunjukData = $this->parsePetunjukSheet($spreadsheet);

        // 2. Extract REFERENSI
        $referensiData = $this->parseReferensiSheet($spreadsheet);

        // 3. Process all question sheets in a DB transaction
        return DB::transaction(function () use ($spreadsheet, $questionSheets, $petunjukData, $referensiData, $userId, $eventId): array {
            $modulesCache = [];
            $preTestCount = 0;
            $quizCount = 0;
            $postTestCount = 0;
            $totalQuestions = 0;

            $stageMapping = [
                'PRE-TEST' => ['stage' => 'pre_test', 'difficulty' => 'basic'],
                'KUIS' => ['stage' => 'quiz', 'difficulty' => 'intermediate'],
                'POST-TEST' => ['stage' => 'post_test', 'difficulty' => 'advanced'],
            ];

            foreach ($questionSheets as $sheetName) {
                $worksheet = $spreadsheet->getSheetByName($sheetName);
                if (! $worksheet) {
                    continue;
                }

                $config = $stageMapping[$sheetName];
                $questions = $this->parseQuestionWorksheet($worksheet);

                foreach ($questions as $qIndex => $qRow) {
                    $module = $this->resolveQuestionModule(
                        $qRow['topik_soal'],
                        $qRow['prodi'],
                        $config['stage'],
                        $referensiData,
                        $petunjukData,
                        $userId,
                        $eventId,
                        $modulesCache
                    );

                    $difficulty = $this->mapDifficulty($qRow['kategori_soal'], $config['difficulty']);
                    $questionCode = $this->generateQuestionCode($module->code, $config['stage'], $qIndex + 1);

                    $options = [];
                    foreach (['A', 'B', 'C', 'D', 'E'] as $key) {
                        if (isset($qRow['options'][$key]) && $qRow['options'][$key] !== '') {
                            $options[] = [
                                'key' => $key,
                                'text' => $qRow['options'][$key],
                            ];
                        }
                    }

                    if (count($options) < 2) {
                        continue;
                    }

                    $correctAnswer = strtoupper(trim($qRow['jawaban']));
                    if (! in_array($correctAnswer, ['A', 'B', 'C', 'D', 'E'], true)) {
                        $correctAnswer = 'A';
                    }

                    $explanation = null;
                    if (! empty($qRow['materi_soal']) || ! empty($qRow['kategori_materi'])) {
                        $explanation = 'Materi: '.($qRow['materi_soal'] ?? '-').' | Kategori: '.($qRow['kategori_materi'] ?? '-');
                    }

                    $question = QuestionBank::updateOrCreate(
                        [
                            'code' => $questionCode,
                        ],
                        [
                            'event_id' => $eventId,
                            'question_module_id' => $module->id,
                            'question_text' => $qRow['soal'],
                            'question_type' => 'single_choice',
                            'options' => $options,
                            'correct_answer' => $correctAnswer,
                            'points' => 1.0,
                            'difficulty_level' => $difficulty,
                            'exam_stage' => $config['stage'],
                            'explanation' => $explanation,
                            'status' => 'active',
                            'created_by' => $userId,
                            'metadata' => [
                                'prodi' => $qRow['prodi'],
                                'topik_soal' => $qRow['topik_soal'],
                                'kategori_materi' => $qRow['kategori_materi'],
                                'materi_soal' => $qRow['materi_soal'],
                                'tipe_soal' => $qRow['tipe_soal'],
                                'kategori_soal' => $qRow['kategori_soal'],
                                'stage' => $config['stage'],
                            ],
                        ]
                    );

                    $module->questions()->syncWithoutDetaching([$question->id]);

                    $totalQuestions++;
                    if ($config['stage'] === 'pre_test') {
                        $preTestCount++;
                    } elseif ($config['stage'] === 'quiz') {
                        $quizCount++;
                    } elseif ($config['stage'] === 'post_test') {
                        $postTestCount++;
                    }
                }
            }

            ActivityLog::record('question_module.imported', null, [
                'modules_count' => count($modulesCache),
                'total_questions' => $totalQuestions,
                'pre_test_count' => $preTestCount,
                'quiz_count' => $quizCount,
                'post_test_count' => $postTestCount,
            ]);

            return [
                'modules_count' => count($modulesCache),
                'total_questions' => $totalQuestions,
                'pre_test_count' => $preTestCount,
                'quiz_count' => $quizCount,
                'post_test_count' => $postTestCount,
                'modules_created' => array_keys($modulesCache),
            ];
        });
    }

    /**
     * Parse PETUNJUK sheet for document metadata and instructions.
     *
     * @return array{title: string, items: array<string, string>}
     */
    private function parsePetunjukSheet(Spreadsheet $spreadsheet): array
    {
        $sheet = $spreadsheet->getSheetByName('PETUNJUK');
        if (! $sheet) {
            return ['title' => 'Panduan Asesmen Bank Soal PERKEMI', 'items' => []];
        }

        $highestRow = min($sheet->getHighestRow(), 100);
        $title = trim((string) $sheet->getCell('A1')->getValue());
        if (empty($title)) {
            $title = 'Bank Soal PERKEMI 2026';
        }

        $items = [];
        for ($row = 2; $row <= $highestRow; $row++) {
            $key = trim((string) $sheet->getCell('A'.$row)->getValue());
            $val = trim((string) $sheet->getCell('B'.$row)->getValue());
            if ($key !== '' && $val !== '') {
                $items[$key] = $val;
            }
        }

        return [
            'title' => $title,
            'items' => $items,
        ];
    }

    /**
     * Parse REFERENSI sheet for module references and sources.
     *
     * @return array<string, array{title: string, source: string, focus: string}>
     */
    private function parseReferensiSheet(Spreadsheet $spreadsheet): array
    {
        $sheet = $spreadsheet->getSheetByName('REFERENSI');
        if (! $sheet) {
            return [];
        }

        $highestRow = min($sheet->getHighestRow(), 200);
        $result = [];

        // Check headers in row 1
        $colAHeader = strtolower(trim((string) $sheet->getCell('A1')->getValue()));
        $isCodeBased = str_contains($colAHeader, 'kode');

        for ($row = 2; $row <= $highestRow; $row++) {
            $colA = trim((string) $sheet->getCell('A'.$row)->getValue());
            $colB = trim((string) $sheet->getCell('B'.$row)->getValue());
            $colC = trim((string) $sheet->getCell('C'.$row)->getValue());
            $colD = trim((string) $sheet->getCell('D'.$row)->getValue());

            if ($colA === '' && $colB === '') {
                continue;
            }

            if ($isCodeBased && $colA !== '') {
                $result[$colA] = [
                    'code' => $colA,
                    'title' => $colB,
                    'source' => $colC,
                    'focus' => $colD,
                ];
            } else {
                // Group based or general reference
                $key = $colA ?: 'REF-'.$row;
                $result[$key] = [
                    'group' => $colA,
                    'title' => $colB,
                    'source' => $colC,
                    'focus' => $colD,
                ];
            }
        }

        return $result;
    }

    /**
     * Parse a question worksheet (PRE-TEST, KUIS, POST-TEST).
     *
     * @return array<int, array{
     *     prodi: string,
     *     topik_soal: string,
     *     kategori_materi: string,
     *     materi_soal: string,
     *     tipe_soal: string,
     *     kategori_soal: string,
     *     soal: string,
     *     options: array<string, string>,
     *     jawaban: string,
     * }>
     */
    private function parseQuestionWorksheet(Worksheet $sheet): array
    {
        $highestRow = $sheet->getHighestRow();
        $questions = [];

        // Identify column mappings from row 1
        $headerMap = [];
        $colLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
        foreach ($colLetters as $col) {
            $header = strtolower(trim((string) $sheet->getCell($col.'1')->getValue()));
            $headerMap[$header] = $col;
        }

        $colProdi = $headerMap['prodi'] ?? 'A';
        $colTopik = $headerMap['topik soal'] ?? 'B';
        $colKatMateri = $headerMap['kategori materi'] ?? 'C';
        $colMatSoal = $headerMap['materi soal'] ?? 'D';
        $colTipe = $headerMap['tipe soal'] ?? 'E';
        $colKatSoal = $headerMap['kategori soal'] ?? 'F';
        $colSoal = $headerMap['soal'] ?? 'G';
        $colA = $headerMap['a'] ?? 'H';
        $colB = $headerMap['b'] ?? 'I';
        $colC = $headerMap['c'] ?? 'J';
        $colD = $headerMap['d'] ?? 'K';
        $colE = $headerMap['e'] ?? 'L';
        $colJawaban = $headerMap['jawaban'] ?? 'M';

        for ($row = 2; $row <= $highestRow; $row++) {
            $soalText = trim((string) $sheet->getCell($colSoal.$row)->getValue());
            if ($soalText === '') {
                continue;
            }

            // Remove leading question numbering if present (e.g., "1. " or "1) ")
            $cleanedSoal = preg_replace('/^\d+[\.\)]\s*/', '', $soalText);

            $questions[] = [
                'prodi' => trim((string) $sheet->getCell($colProdi.$row)->getValue()),
                'topik_soal' => trim((string) $sheet->getCell($colTopik.$row)->getValue()),
                'kategori_materi' => trim((string) $sheet->getCell($colKatMateri.$row)->getValue()),
                'materi_soal' => trim((string) $sheet->getCell($colMatSoal.$row)->getValue()),
                'tipe_soal' => trim((string) $sheet->getCell($colTipe.$row)->getValue()),
                'kategori_soal' => trim((string) $sheet->getCell($colKatSoal.$row)->getValue()),
                'soal' => $cleanedSoal,
                'options' => [
                    'A' => trim((string) $sheet->getCell($colA.$row)->getValue()),
                    'B' => trim((string) $sheet->getCell($colB.$row)->getValue()),
                    'C' => trim((string) $sheet->getCell($colC.$row)->getValue()),
                    'D' => trim((string) $sheet->getCell($colD.$row)->getValue()),
                    'E' => trim((string) $sheet->getCell($colE.$row)->getValue()),
                ],
                'jawaban' => trim((string) $sheet->getCell($colJawaban.$row)->getValue()),
            ];
        }

        return $questions;
    }

    /**
     * Resolve or create QuestionModule grouped by Program and Exam Stage.
     *
     * Example:
     * - Prodi WAD + Stage pre_test  => "QM-WAD-PRE" ("Pre-Test Wasit Daerah (WAD)")
     * - Prodi WAD + Stage quiz      => "QM-WAD-KUIS" ("Kuis Formatif Wasit Daerah (WAD)")
     * - Prodi WAD + Stage post_test => "QM-WAD-POST" ("Post-Test Wasit Daerah (WAD)")
     *
     * @param  array<string, mixed>  $referensiData
     * @param  array<string, mixed>  $petunjukData
     * @param  array<string, QuestionModule>  $cache
     */
    private function resolveQuestionModule(
        string $topikSoal,
        string $prodi,
        string $stage,
        array $referensiData,
        array $petunjukData,
        ?int $userId,
        ?int $eventId,
        array &$cache
    ): QuestionModule {
        $normalizedProdi = strtoupper(trim($prodi));
        $prodiCode = 'GEN';
        $prodiName = 'Penataran Umum';
        $trackCodes = ['PD', 'PN'];
        $category = 'Evaluasi Teori';

        if (str_contains($normalizedProdi, 'PED + WAD') || (str_contains($topikSoal, 'PED') && str_contains($topikSoal, 'WAD'))) {
            $prodiCode = 'PWAD';
            $prodiName = 'Penguji & Wasit Daerah (PED + WAD)';
            $trackCodes = ['PWAD', 'PED', 'WAD'];
            $category = 'Penguji & Wasit Terintegrasi';
        } elseif (str_contains($normalizedProdi, 'PEN + WAN') || (str_contains($topikSoal, 'PEN') && str_contains($topikSoal, 'WAN'))) {
            $prodiCode = 'PWAN';
            $prodiName = 'Penguji & Wasit Nasional (PEN + WAN)';
            $trackCodes = ['PWAN', 'PEN', 'WAN'];
            $category = 'Penguji & Wasit Terintegrasi';
        } elseif ($normalizedProdi === 'PED' || str_contains($normalizedProdi, 'PENGUJI DAERAH') || str_starts_with($topikSoal, 'PED')) {
            $prodiCode = 'PED';
            $prodiName = 'Penguji Daerah (PED)';
            $trackCodes = ['PED'];
            $category = 'Penguji Daerah';
        } elseif ($normalizedProdi === 'PEN' || str_contains($normalizedProdi, 'PENGUJI NASIONAL') || str_starts_with($topikSoal, 'PEN')) {
            $prodiCode = 'PEN';
            $prodiName = 'Penguji Nasional (PEN)';
            $trackCodes = ['PEN'];
            $category = 'Penguji Nasional';
        } elseif ($normalizedProdi === 'PD' || str_contains($normalizedProdi, 'PELATIH DAERAH') || str_starts_with($topikSoal, 'PD')) {
            $prodiCode = 'PD';
            $prodiName = 'Pelatih Daerah (PD)';
            $trackCodes = ['PD'];
            $category = 'Pelatih Daerah';
        } elseif ($normalizedProdi === 'PN' || str_contains($normalizedProdi, 'PELATIH NASIONAL') || str_starts_with($topikSoal, 'PN')) {
            $prodiCode = 'PN';
            $prodiName = 'Pelatih Nasional (PN)';
            $trackCodes = ['PN'];
            $category = 'Pelatih Nasional';
        } elseif ($normalizedProdi === 'WAD' || str_contains($normalizedProdi, 'WASIT DAERAH') || str_starts_with($topikSoal, 'WAD')) {
            $prodiCode = 'WAD';
            $prodiName = 'Wasit Daerah (WAD)';
            $trackCodes = ['WAD'];
            $category = 'Wasit Daerah';
        } elseif ($normalizedProdi === 'WAN' || str_contains($normalizedProdi, 'WASIT NASIONAL') || str_starts_with($topikSoal, 'WAN')) {
            $prodiCode = 'WAN';
            $prodiName = 'Wasit Nasional (WAN)';
            $trackCodes = ['WAN'];
            $category = 'Wasit Nasional';
        }

        $stageCode = match ($stage) {
            'pre_test' => 'PRE',
            'quiz' => 'KUIS',
            'post_test' => 'POST',
            default => 'EV',
        };

        $stageName = match ($stage) {
            'pre_test' => 'Pre-Test',
            'quiz' => 'Kuis Formatif',
            'post_test' => 'Post-Test',
            default => 'Evaluasi',
        };

        $code = $eventId ? "EV{$eventId}-QM-{$prodiCode}-{$stageCode}" : "QM-{$prodiCode}-{$stageCode}";
        $title = "{$stageName} {$prodiName}";

        if (isset($cache[$code])) {
            return $cache[$code];
        }

        $purpose = match ($stage) {
            'pre_test' => 'Mengukur pemahaman diagnostik awal peserta sebelum materi penataran.',
            'quiz' => 'Mengukur pemahaman formatif materi selama sesi pembelajaran.',
            'post_test' => 'Mengukur evaluasi sumatif akhir dan standar kelulusan kompetensi.',
            default => 'Mengukur ketercapaian standar kompetensi kenshi Shorinji Kempo.',
        };

        $description = "Modul bank soal {$stageName} terpadu untuk jalur {$prodiName} sesuai silabus PERKEMI 2026.";

        $moduleQuery = QuestionModule::where('code', $code);
        if ($eventId) {
            $moduleQuery->where('event_id', $eventId);
        } else {
            $moduleQuery->whereNull('event_id');
        }
        $module = $moduleQuery->first();

        if (! $module) {
            $slugBase = Str::slug($title);
            $slug = $slugBase ?: 'modul-'.strtolower($code);
            if (QuestionModule::where('slug', $slug)->exists()) {
                $slug .= '-'.strtolower(Str::random(4));
            }

            $module = QuestionModule::create([
                'event_id' => $eventId,
                'code' => $code,
                'title' => $title,
                'slug' => $slug,
                'category' => $category,
                'track_codes' => $trackCodes,
                'description' => $description,
                'evaluation_purpose' => $purpose,
                'default_weight' => 1.0,
                'passing_grade' => 75.0,
                'status' => 'active',
                'created_by' => $userId,
                'metadata' => [
                    'stage' => $stage,
                    'prodi' => $prodiCode,
                    'petunjuk' => $petunjukData,
                    'imported_at' => now()->toIso8601String(),
                ],
            ]);
        } else {
            $moduleUpdates = [
                'title' => $title,
                'category' => $category,
                'track_codes' => $trackCodes,
                'description' => $description,
                'evaluation_purpose' => $purpose,
                'status' => 'active',
            ];
            $currentMeta = $module->metadata ?? [];
            $currentMeta['stage'] = $stage;
            $currentMeta['prodi'] = $prodiCode;
            $currentMeta['petunjuk'] = $petunjukData;
            $currentMeta['last_imported_at'] = now()->toIso8601String();
            $moduleUpdates['metadata'] = $currentMeta;

            $module->update($moduleUpdates);
        }

        $cache[$code] = $module;

        return $module;
    }

    /**
     * Determine track codes from Prodi and module code.
     *
     * @return array<int, string>
     */
    private function determineTrackCodes(string $prodi, string $code): array
    {
        $normalizedProdi = strtoupper(trim($prodi));

        if (str_contains($normalizedProdi, 'PED + WAD')) {
            return ['PWAD', 'PED', 'WAD'];
        }

        if (str_contains($normalizedProdi, 'PEN + WAN')) {
            return ['PWAN', 'PEN', 'WAN'];
        }

        if ($normalizedProdi === 'PED' || str_contains($normalizedProdi, 'PENGUJI DAERAH') || str_starts_with($code, 'PED')) {
            return ['PED'];
        }

        if ($normalizedProdi === 'PEN' || str_contains($normalizedProdi, 'PENGUJI NASIONAL') || str_starts_with($code, 'PEN')) {
            return ['PEN'];
        }

        if ($normalizedProdi === 'PD' || str_contains($normalizedProdi, 'PELATIH DAERAH') || str_starts_with($code, 'PD')) {
            return ['PD'];
        }

        if ($normalizedProdi === 'PN' || str_contains($normalizedProdi, 'PELATIH NASIONAL') || str_starts_with($code, 'PN')) {
            return ['PN'];
        }

        if ($normalizedProdi === 'WAD' || str_contains($normalizedProdi, 'WASIT DAERAH') || str_starts_with($code, 'WAD')) {
            return ['WAD'];
        }

        if ($normalizedProdi === 'WAN' || str_contains($normalizedProdi, 'WASIT NASIONAL') || str_starts_with($code, 'WAN')) {
            return ['WAN'];
        }

        return ['PD', 'PN'];
    }

    /**
     * Determine category from track codes.
     *
     * @param  array<int, string>  $trackCodes
     */
    private function determineCategory(array $trackCodes): string
    {
        if (in_array('PWAD', $trackCodes, true) || in_array('PWAN', $trackCodes, true)) {
            return 'Penguji & Wasit Terintegrasi';
        }

        if (in_array('PED', $trackCodes, true)) {
            return 'Penguji Daerah';
        }

        if (in_array('PEN', $trackCodes, true)) {
            return 'Penguji Nasional';
        }

        if (in_array('PD', $trackCodes, true)) {
            return 'Pelatih Daerah';
        }

        if (in_array('PN', $trackCodes, true)) {
            return 'Pelatih Nasional';
        }

        if (in_array('WAD', $trackCodes, true)) {
            return 'Wasit Daerah';
        }

        if (in_array('WAN', $trackCodes, true)) {
            return 'Wasit Nasional';
        }

        return 'Evaluasi Teori';
    }

    /**
     * Map difficulty level based on taxonomy and stage fallback.
     */
    private function mapDifficulty(string $kategoriSoal, string $fallback): string
    {
        $kat = strtolower($kategoriSoal);

        if (str_contains($kat, 'c1') || str_contains($kat, 'c2') || str_contains($kat, 'dasar') || str_contains($kat, 'basic')) {
            return 'basic';
        }

        if (str_contains($kat, 'c3') && ! str_contains($kat, 'c4')) {
            return 'intermediate';
        }

        if (str_contains($kat, 'c4') || str_contains($kat, 'c5') || str_contains($kat, 'c6') || str_contains($kat, 'lanjutan') || str_contains($kat, 'advanced')) {
            return 'advanced';
        }

        return $fallback;
    }

    /**
     * Generate unique question code.
     */
    private function generateQuestionCode(string $moduleCode, string $stage, int $index): string
    {
        $stagePrefix = match ($stage) {
            'pre_test' => 'PRE',
            'quiz' => 'QZ',
            'post_test' => 'POST',
            default => 'EV',
        };

        $cleanMod = Str::slug($moduleCode);

        return strtoupper("SOAL-{$cleanMod}-{$stagePrefix}-".str_pad((string) $index, 3, '0', STR_PAD_LEFT));
    }
}
