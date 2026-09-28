<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventAssessment;
use App\Models\EventParticipant;
use PhpOffice\PhpSpreadsheet\IOFactory;

class EventPracticalExamService
{
    public const CATEGORY_PD = 'UJIAN_PD';

    public const CATEGORY_PN = 'UJIAN_PN';

    public const CATEGORY_PED = 'UJIAN_PED';

    public const CATEGORY_PEN = 'UJIAN_PEN';

    public const CATEGORY_WAD = 'UJIAN_WAD';

    public const CATEGORY_WAN = 'UJIAN_WAN';

    /**
     * Get criteria configuration for all 6 sheets/categories.
     *
     * @return array<string, array<string, mixed>>
     */
    public function getCriteriaConfig(): array
    {
        return [
            self::CATEGORY_PD => [
                'track_code' => 'PD',
                'category_key' => self::CATEGORY_PD,
                'tab_title' => 'Pelatih Daerah',
                'sheet_name' => 'Pelatih Daerah',
                'title' => 'FORMULIR PENILAIAN UJIAN PRAKTIK – PELATIH DAERAH',
                'subtitle' => 'Satu Lembar Isian Seluruh Peserta • Penataran PERKEMI 2026',
                'start_row' => 7,
                'total_col' => 'N',
                'predikat_col' => 'O',
                'status_col' => 'P',
                'notes_col' => 'Q',
                'criteria' => [
                    ['code' => 'PD-01', 'col' => 'F', 'weight' => 10, 'label' => 'Persiapan sesi: tujuan latihan, materi, urutan, alokasi waktu dan kesiapan sarana'],
                    ['code' => 'PD-02', 'col' => 'G', 'weight' => 15, 'label' => 'Demonstrasi kihon/hokei: ketepatan bentuk, kamae, taisabaki, umpoho dan ritme'],
                    ['code' => 'PD-03', 'col' => 'H', 'weight' => 15, 'label' => 'Penjelasan prinsip teknik Goho–Juho secara benar dan mudah dipahami'],
                    ['code' => 'PD-04', 'col' => 'I', 'weight' => 15, 'label' => 'Metodologi mengajar: progresi, koreksi, drill dan pengelolaan kelompok'],
                    ['code' => 'PD-05', 'col' => 'J', 'weight' => 15, 'label' => 'Keselamatan latihan: pemanasan, kontrol pasangan, jarak, intensitas, ukemi dan pencegahan cedera'],
                    ['code' => 'PD-06', 'col' => 'K', 'weight' => 10, 'label' => 'Observasi dan koreksi kesalahan teknik peserta'],
                    ['code' => 'PD-07', 'col' => 'L', 'weight' => 10, 'label' => 'Etika, disiplin, reiho, keteladanan dan komunikasi instruksional'],
                    ['code' => 'PD-08', 'col' => 'M', 'weight' => 10, 'label' => 'Evaluasi sesi dan pemberian umpan balik'],
                ],
            ],
            self::CATEGORY_PN => [
                'track_code' => 'PN',
                'category_key' => self::CATEGORY_PN,
                'tab_title' => 'Pelatih Nasional',
                'sheet_name' => 'Pelatih Nasional',
                'title' => 'FORMULIR PENILAIAN UJIAN PRAKTIK – PELATIH NASIONAL',
                'subtitle' => 'Satu Lembar Isian Seluruh Peserta • Penataran PERKEMI 2026',
                'start_row' => 7,
                'total_col' => 'N',
                'predikat_col' => 'O',
                'status_col' => 'P',
                'notes_col' => 'Q',
                'criteria' => [
                    ['code' => 'PN-01', 'col' => 'F', 'weight' => 12, 'label' => 'Perencanaan program latihan periodik berbasis tujuan, tingkat kenshi dan kebutuhan performa'],
                    ['code' => 'PN-02', 'col' => 'G', 'weight' => 15, 'label' => 'Penguasaan dan demonstrasi teknik lanjutan serta prinsip Goho–Juho/Hokei'],
                    ['code' => 'PN-03', 'col' => 'H', 'weight' => 13, 'label' => 'Analisis biomekanik/taktis kesalahan teknik dan koreksi tingkat lanjut'],
                    ['code' => 'PN-04', 'col' => 'I', 'weight' => 12, 'label' => 'Metodologi pembelajaran tingkat lanjut dan diferensiasi peserta'],
                    ['code' => 'PN-05', 'col' => 'J', 'weight' => 13, 'label' => 'Perancangan intensitas, beban, pemulihan dan keselamatan latihan'],
                    ['code' => 'PN-06', 'col' => 'K', 'weight' => 12, 'label' => 'Pembinaan pelatih/kenshi dan coaching feedback berbasis observasi'],
                    ['code' => 'PN-07', 'col' => 'L', 'weight' => 10, 'label' => 'Integrasi filosofi, etika, reiho dan tujuan pendidikan Shorinji Kempo'],
                    ['code' => 'PN-08', 'col' => 'M', 'weight' => 13, 'label' => 'Evaluasi performa dan keputusan program tindak lanjut'],
                ],
            ],
            self::CATEGORY_PED => [
                'track_code' => 'PED',
                'category_key' => self::CATEGORY_PED,
                'tab_title' => 'Penguji Daerah',
                'sheet_name' => 'Penguji Daerah',
                'title' => 'FORMULIR PENILAIAN UJIAN PRAKTIK – PENGUJI DAERAH',
                'subtitle' => 'Satu Lembar Isian Seluruh Peserta • Penataran PERKEMI 2026',
                'start_row' => 7,
                'total_col' => 'M',
                'predikat_col' => 'N',
                'status_col' => 'O',
                'notes_col' => 'P',
                'criteria' => [
                    ['code' => 'PgD-01', 'col' => 'F', 'weight' => 10, 'label' => 'Verifikasi kesiapan ujian, identitas/tingkatan dan prosedur pelaksanaan'],
                    ['code' => 'PgD-02', 'col' => 'G', 'weight' => 20, 'label' => 'Penguasaan kurikulum/teknik yang diuji sesuai tingkat kewenangan'],
                    ['code' => 'PgD-03', 'col' => 'H', 'weight' => 20, 'label' => 'Ketepatan observasi kihon, hokei, Goho–Juho, ukemi dan unsur teknis terkait'],
                    ['code' => 'PgD-04', 'col' => 'I', 'weight' => 15, 'label' => 'Objektivitas penggunaan kriteria dan konsistensi pemberian nilai'],
                    ['code' => 'PgD-05', 'col' => 'J', 'weight' => 15, 'label' => 'Identifikasi kesalahan kritis dan justifikasi penilaian'],
                    ['code' => 'PgD-06', 'col' => 'K', 'weight' => 10, 'label' => 'Ketertiban administrasi, pencatatan hasil dan ketepatan prosedur'],
                    ['code' => 'PgD-07', 'col' => 'L', 'weight' => 10, 'label' => 'Etika, independensi, komunikasi dan keselamatan selama pengujian'],
                ],
            ],
            self::CATEGORY_PEN => [
                'track_code' => 'PEN',
                'category_key' => self::CATEGORY_PEN,
                'tab_title' => 'Penguji Nasional',
                'sheet_name' => 'Penguji Nasional',
                'title' => 'FORMULIR PENILAIAN UJIAN PRAKTIK – PENGUJI NASIONAL',
                'subtitle' => 'Satu Lembar Isian Seluruh Peserta • Penataran PERKEMI 2026',
                'start_row' => 7,
                'total_col' => 'M',
                'predikat_col' => 'N',
                'status_col' => 'O',
                'notes_col' => 'P',
                'criteria' => [
                    ['code' => 'PgN-01', 'col' => 'F', 'weight' => 12, 'label' => 'Penguasaan sistem kualifikasi, kewenangan, prosedur dan tata kelola ujian'],
                    ['code' => 'PgN-02', 'col' => 'G', 'weight' => 20, 'label' => 'Penguasaan kurikulum teknik tingkat lanjut sesuai lingkup pengujian'],
                    ['code' => 'PgN-03', 'col' => 'H', 'weight' => 18, 'label' => 'Ketajaman observasi dan analisis kualitas teknik/kesalahan fundamental'],
                    ['code' => 'PgN-04', 'col' => 'I', 'weight' => 15, 'label' => 'Standardisasi, objektivitas dan konsistensi antar-penguji'],
                    ['code' => 'PgN-05', 'col' => 'J', 'weight' => 15, 'label' => 'Memimpin panel, moderasi perbedaan penilaian dan justifikasi'],
                    ['code' => 'PgN-06', 'col' => 'K', 'weight' => 10, 'label' => 'Administrasi, validasi hasil, dokumentasi dan akuntabilitas keputusan'],
                    ['code' => 'PgN-07', 'col' => 'L', 'weight' => 10, 'label' => 'Integritas, independensi, etika, reiho dan keselamatan'],
                ],
            ],
            self::CATEGORY_WAD => [
                'track_code' => 'WAD',
                'category_key' => self::CATEGORY_WAD,
                'tab_title' => 'Wasit Daerah',
                'sheet_name' => 'Wasit Daerah',
                'title' => 'FORMULIR PENILAIAN UJIAN PRAKTIK – WASIT DAERAH',
                'subtitle' => 'Satu Lembar Isian Seluruh Peserta • Penataran PERKEMI 2026',
                'start_row' => 7,
                'total_col' => 'M',
                'predikat_col' => 'N',
                'status_col' => 'O',
                'notes_col' => 'P',
                'criteria' => [
                    ['code' => 'WD-01', 'col' => 'F', 'weight' => 10, 'label' => 'Persiapan pertandingan/arena, pemeriksaan keselamatan dan kesiapan perangkat'],
                    ['code' => 'WD-02', 'col' => 'G', 'weight' => 20, 'label' => 'Penguasaan aturan dan prosedur pertandingan/penilaian yang berlaku'],
                    ['code' => 'WD-03', 'col' => 'H', 'weight' => 15, 'label' => 'Posisi, pergerakan, fokus visual dan penguasaan area'],
                    ['code' => 'WD-04', 'col' => 'I', 'weight' => 20, 'label' => 'Ketepatan pengamatan kejadian/teknik dan pengambilan keputusan'],
                    ['code' => 'WD-05', 'col' => 'J', 'weight' => 15, 'label' => 'Kecepatan, ketegasan dan konsistensi sinyal/komunikasi keputusan'],
                    ['code' => 'WD-06', 'col' => 'K', 'weight' => 10, 'label' => 'Objektivitas, netralitas dan pengendalian situasi'],
                    ['code' => 'WD-07', 'col' => 'L', 'weight' => 10, 'label' => 'Administrasi hasil, koordinasi perangkat dan evaluasi pascapertandingan'],
                ],
            ],
            self::CATEGORY_WAN => [
                'track_code' => 'WAN',
                'category_key' => self::CATEGORY_WAN,
                'tab_title' => 'Wasit Nasional',
                'sheet_name' => 'Wasit Nasional',
                'title' => 'FORMULIR PENILAIAN UJIAN PRAKTIK – WASIT NASIONAL',
                'subtitle' => 'Satu Lembar Isian Seluruh Peserta • Penataran PERKEMI 2026',
                'start_row' => 7,
                'total_col' => 'M',
                'predikat_col' => 'N',
                'status_col' => 'O',
                'notes_col' => 'P',
                'criteria' => [
                    ['code' => 'WN-01', 'col' => 'F', 'weight' => 20, 'label' => 'Penguasaan mendalam regulasi, interpretasi kasus dan prosedur pertandingan'],
                    ['code' => 'WN-02', 'col' => 'G', 'weight' => 15, 'label' => 'Antisipasi, positioning dan kontrol area pada situasi kompleks'],
                    ['code' => 'WN-03', 'col' => 'H', 'weight' => 20, 'label' => 'Akurasi keputusan pada kejadian cepat/kompleks dan konsistensi standar'],
                    ['code' => 'WN-04', 'col' => 'I', 'weight' => 15, 'label' => 'Manajemen pertandingan, komunikasi panel dan penanganan perbedaan keputusan'],
                    ['code' => 'WN-05', 'col' => 'J', 'weight' => 10, 'label' => 'Keselamatan atlet, penghentian tindakan berbahaya dan manajemen insiden'],
                    ['code' => 'WN-06', 'col' => 'K', 'weight' => 10, 'label' => 'Objektivitas, integritas, ketegasan, etika dan pengendalian emosi'],
                    ['code' => 'WN-07', 'col' => 'L', 'weight' => 10, 'label' => 'Administrasi, dokumentasi, evaluasi dan justifikasi keputusan'],
                ],
            ],
        ];
    }

    /**
     * Map a track code to practical exam categories.
     *
     * @return array<string>
     */
    public function getCategoriesForTrack(?string $trackCode): array
    {
        $code = strtoupper(trim((string) $trackCode));
        $map = [
            'PD' => [self::CATEGORY_PD],
            'PN' => [self::CATEGORY_PN],
            'PED' => [self::CATEGORY_PED],
            'PEN' => [self::CATEGORY_PEN],
            'WAD' => [self::CATEGORY_WAD],
            'WAN' => [self::CATEGORY_WAN],
            'PWAD' => [self::CATEGORY_PED, self::CATEGORY_WAD],
            'PWAN' => [self::CATEGORY_PEN, self::CATEGORY_WAN],
        ];

        return $map[$code] ?? [];
    }

    /**
     * Calculate score, predicate, and status based on 1-5 scale and criteria weights.
     *
     * @param  array<string, mixed>  $scores
     * @return array{total_score: float, predikat: string, status: string, is_passed: bool, is_filled: bool}
     */
    public function calculateScore(string $category, array $scores): array
    {
        $config = $this->getCriteriaConfig()[$category] ?? null;
        if (! $config) {
            return [
                'total_score' => 0.0,
                'predikat' => 'Perlu Pembinaan',
                'status' => 'BELUM LULUS',
                'is_passed' => false,
                'is_filled' => false,
            ];
        }

        $criteria = $config['criteria'];
        $criteriaCount = count($criteria);
        $filledCount = 0;
        $totalWeighted = 0.0;

        foreach ($criteria as $item) {
            $code = $item['code'];
            $weight = (float) $item['weight'];

            if (isset($scores[$code]) && $scores[$code] !== '' && is_numeric($scores[$code])) {
                $val = min(5, max(1, (float) $scores[$code]));
                $totalWeighted += ($val / 5.0) * $weight;
                $filledCount++;
            }
        }

        $isFilled = ($filledCount > 0);
        $totalScore = round($totalWeighted, 2);

        // Calculate predikat
        if ($totalScore >= 90) {
            $predikat = 'Sangat Baik';
        } elseif ($totalScore >= 80) {
            $predikat = 'Baik';
        } elseif ($totalScore >= 70) {
            $predikat = 'Cukup';
        } else {
            $predikat = 'Perlu Pembinaan';
        }

        // Calculate status
        if ($totalScore >= 80) {
            $status = 'LULUS';
        } elseif ($totalScore >= 70) {
            $status = 'REMEDIAL';
        } else {
            $status = 'BELUM LULUS';
        }

        return [
            'total_score' => $totalScore,
            'predikat' => $predikat,
            'status' => $status,
            'is_passed' => $totalScore >= 80,
            'is_filled' => $isFilled,
        ];
    }

    /**
     * Get practical exam data grouped by the 6 sheets for an event.
     *
     * @return array<string, mixed>
     */
    public function getEventPracticalExamData(Event $event): array
    {
        $configs = $this->getCriteriaConfig();
        $storedSettings = $event->assessment_settings['practical_exam'] ?? [];

        $participants = EventParticipant::where('event_id', $event->id)
            ->with(['participant.user', 'track', 'registrationForm', 'assessments'])
            ->orderBy('id')
            ->get();

        $byCategory = [];
        $stats = [
            'total_participants' => 0,
            'total_assessed' => 0,
            'categories' => [],
        ];

        foreach (array_keys($configs) as $catKey) {
            $byCategory[$catKey] = [];
            $stats['categories'][$catKey] = [
                'total' => 0,
                'assessed' => 0,
                'passed' => 0,
                'remedial' => 0,
                'failed' => 0,
            ];
        }

        $assessedParticipantIds = [];

        foreach ($participants as $ep) {
            $trackCode = $ep->track_code ?? ($ep->track?->code ?? '');
            $matchedCategories = $this->getCategoriesForTrack($trackCode);

            foreach ($matchedCategories as $catKey) {
                if (! isset($byCategory[$catKey])) {
                    continue;
                }

                $assessment = $ep->assessments->firstWhere('category', $catKey);
                $scores = $assessment?->scores ?? [];
                $isAssessed = ! empty($scores);

                $calc = $this->calculateScore($catKey, $scores);

                if ($isAssessed) {
                    $assessedParticipantIds[$ep->id] = true;
                    $stats['categories'][$catKey]['assessed']++;

                    if ($calc['status'] === 'LULUS') {
                        $stats['categories'][$catKey]['passed']++;
                    } elseif ($calc['status'] === 'REMEDIAL') {
                        $stats['categories'][$catKey]['remedial']++;
                    } else {
                        $stats['categories'][$catKey]['failed']++;
                    }
                }
                $stats['categories'][$catKey]['total']++;

                // Format origin
                $rawOrigin = $ep->participant?->origin_city
                    ?? $ep->registrationForm?->pengkab_pengkot
                    ?? $ep->participant?->origin
                    ?? '';
                $originParts = array_unique(array_filter(array_map('trim', explode('/', (string) $rawOrigin))));
                $origin = implode(' / ', array_slice($originParts, 0, 2));

                // Tingkat formatting (e.g. "3 DAN")
                $danLevel = $ep->participant?->dan_level
                    ?? $ep->registrationForm?->tingkatan_dan
                    ?? $ep->participant?->dan_roman
                    ?? '';
                $tingkat = $danLevel ? ($danLevel.' DAN') : '-';
                if (str_contains(strtoupper($danLevel), 'DAN')) {
                    $tingkat = $danLevel;
                }

                // Gender (L/P)
                $rawGender = strtoupper(trim((string) ($ep->participant?->gender ?? $ep->registrationForm?->gender ?? '')));
                $gender = 'L';
                if ($rawGender === 'FEMALE' || $rawGender === 'P' || $rawGender === 'PEREMPUAN') {
                    $gender = 'P';
                }

                $nik = $ep->participant?->kenshi_id
                    ?: ($ep->registrationForm?->nik ?: ($ep->participant?->nik ?: '-'));

                $byCategory[$catKey][] = [
                    'event_participant_id' => $ep->id,
                    'participant_id' => $ep->participant_id,
                    'name' => $ep->participant?->name ?? 'Peserta',
                    'kenshi_id' => $ep->participant?->kenshi_id ?? '-',
                    'nik' => $nik,
                    'origin' => $origin,
                    'tingkat' => $tingkat,
                    'gender' => $gender,
                    'dan_level' => $ep->participant?->dan_level,
                    'track_code' => $ep->track_code ?? '-',
                    'track_name' => $ep->track?->name ?? '-',
                    'photo_url' => $ep->participant?->photo_url,
                    'assessment_id' => $assessment?->id,
                    'scores' => $scores,
                    'total_score' => $isAssessed ? (float) $assessment->total_score : 0,
                    'predikat' => $isAssessed ? ($scores['_predikat'] ?? $calc['predikat']) : '-',
                    'status' => $isAssessed ? ($scores['_status'] ?? $calc['status']) : '-',
                    'is_passed' => $isAssessed ? (bool) $assessment->is_passed : false,
                    'notes' => $assessment?->notes ?? '',
                    'examiner_name' => $assessment?->examiner_name ?? ($storedSettings[$catKey]['examiner_name'] ?? ''),
                ];
            }
        }

        $stats['total_participants'] = $participants->count();
        $stats['total_assessed'] = count($assessedParticipantIds);

        return [
            'configs' => $configs,
            'participants_by_category' => $byCategory,
            'settings' => $storedSettings,
            'stats' => $stats,
        ];
    }

    /**
     * Save single participant assessment.
     *
     * @param  array<string, mixed>  $data
     */
    public function saveAssessment(Event $event, array $data): EventAssessment
    {
        $ep = EventParticipant::where('event_id', $event->id)
            ->where('id', $data['event_participant_id'])
            ->firstOrFail();

        $category = strtoupper(trim((string) $data['category']));
        $scores = is_array($data['scores'] ?? null) ? $data['scores'] : [];
        $calculated = $this->calculateScore($category, $scores);

        // Store predicate and status inside scores JSON for fast retrieval
        $scores['_predikat'] = $calculated['predikat'];
        $scores['_status'] = $calculated['status'];

        $assessment = EventAssessment::updateOrCreate(
            [
                'event_participant_id' => $ep->id,
                'category' => $category,
            ],
            [
                'event_id' => $event->id,
                'examiner_name' => $data['examiner_name'] ?? null,
                'examiner_rank' => $data['examiner_rank'] ?? null,
                'scores' => $scores,
                'subtotal_dasar' => 0,
                'subtotal_pribadi' => 0,
                'total_score' => $calculated['total_score'],
                'is_passed' => $calculated['is_passed'],
                'notes' => $data['notes'] ?? null,
            ]
        );

        return $assessment;
    }

    /**
     * Save bulk assessments for a category.
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function saveBulkAssessments(Event $event, array $payload): array
    {
        $category = strtoupper(trim((string) $payload['category']));
        $examinerName = trim((string) ($payload['examiner_name'] ?? ''));

        // Update event settings
        $settings = $event->assessment_settings ?? [];
        if (! isset($settings['practical_exam'])) {
            $settings['practical_exam'] = [];
        }
        $settings['practical_exam'][$category] = [
            'examiner_name' => $examinerName,
        ];
        $event->update(['assessment_settings' => $settings]);

        $items = $payload['assessments'] ?? [];
        $savedCount = 0;

        foreach ($items as $item) {
            if (! isset($item['event_participant_id'])) {
                continue;
            }

            $item['category'] = $category;
            if (! empty($examinerName)) {
                $item['examiner_name'] = $examinerName;
            }

            $this->saveAssessment($event, $item);
            $savedCount++;
        }

        return [
            'category' => $category,
            'saved_count' => $savedCount,
        ];
    }

    /**
     * Export the 6 sheets practical exam workbook populated with scores.
     */
    public function exportExcel(Event $event, ?string $targetCategory = null): string
    {
        $templatePath = public_path('xlsx/Formulir_Penilaian_Ujian_Praktik_PERKEMI_2026_1_Lembar_Semua_Peserta_Per_Kategori.xlsx');
        if (! file_exists($templatePath)) {
            throw new \RuntimeException('File template ujian praktik tidak ditemukan di '.$templatePath);
        }

        $reader = IOFactory::createReaderForFile($templatePath);
        $spreadsheet = $reader->load($templatePath);

        $examData = $this->getEventPracticalExamData($event);
        $configs = $this->getCriteriaConfig();

        $categoriesToProcess = array_keys($configs);
        if ($targetCategory && isset($configs[$targetCategory])) {
            $categoriesToProcess = [$targetCategory];
        }

        foreach ($categoriesToProcess as $catKey) {
            $config = $configs[$catKey];
            $sheetName = $config['sheet_name'];
            $sheet = $spreadsheet->getSheetByName($sheetName);

            if (! $sheet) {
                continue;
            }

            $participants = $examData['participants_by_category'][$catKey] ?? [];
            $examinerName = $examData['settings'][$catKey]['examiner_name'] ?? '';

            // Map existing template rows by NIK/Name for perfect in-place filling
            $highestRow = $sheet->getHighestRow();
            $existingRows = [];
            for ($r = 7; $r <= $highestRow; $r++) {
                $cellNik = trim((string) $sheet->getCell('B'.$r)->getValue());
                $cellName = trim((string) $sheet->getCell('C'.$r)->getValue());
                if (! empty($cellNik)) {
                    $existingRows['nik_'.$cellNik] = $r;
                }
                if (! empty($cellName)) {
                    $existingRows['name_'.strtolower($cellName)] = $r;
                }
            }

            $currentRow = 7;
            $no = 1;

            foreach ($participants as $p) {
                // Find matching row or use currentRow
                $matchedRow = $existingRows['nik_'.$p['nik']]
                    ?? $existingRows['name_'.strtolower($p['name'])]
                    ?? null;

                $targetRow = $matchedRow ?: $currentRow;

                // Set participant details
                $sheet->setCellValue('A'.$targetRow, $no);
                $sheet->setCellValue('B'.$targetRow, $p['nik']);
                $sheet->setCellValue('C'.$targetRow, $p['name']);
                $sheet->setCellValue('D'.$targetRow, $p['tingkat']);
                $sheet->setCellValue('E'.$targetRow, $p['gender']);

                // Fill criteria scores
                $scores = $p['scores'] ?? [];
                foreach ($config['criteria'] as $crit) {
                    $col = $crit['col'];
                    $code = $crit['code'];
                    if (isset($scores[$code]) && $scores[$code] !== '' && is_numeric($scores[$code])) {
                        $sheet->setCellValue($col.$targetRow, (float) $scores[$code]);
                    }
                }

                // Fill notes
                if (! empty($p['notes'])) {
                    $sheet->setCellValue($config['notes_col'].$targetRow, $p['notes']);
                }

                $currentRow = max($currentRow, $targetRow + 1);
                $no++;
            }

            // Fill examiner in footer if available
            if (! empty($examinerName)) {
                // Find signature row (search for Penilai:)
                for ($r = $highestRow - 5; $r <= $highestRow; $r++) {
                    $valN = (string) $sheet->getCell($config['total_col'].$r)->getValue();
                    $valM = (string) $sheet->getCell('M'.$r)->getValue();
                    if (str_contains($valN, 'Penilai:')) {
                        $sheet->setCellValue($config['total_col'].$r, 'Penilai: '.$examinerName.'   Tanda Tangan: ____________________');
                        break;
                    } elseif (str_contains($valM, 'Penilai:')) {
                        $sheet->setCellValue('M'.$r, 'Penilai: '.$examinerName.'   Tanda Tangan: ____________________');
                        break;
                    }
                }
            }
        }

        $tmpDir = storage_path('app/temp');
        if (! is_dir($tmpDir)) {
            mkdir($tmpDir, 0755, true);
        }

        $safeSlug = preg_replace('/[^A-Za-z0-9_\-]/', '_', $event->slug ?: 'event_'.$event->id);
        $filename = "FORMULIR_UJIAN_PRAKTIK_PERKEMI_{$safeSlug}.xlsx";
        $filePath = $tmpDir.'/'.$filename;

        $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
        $writer->setPreCalculateFormulas(false); // Preserve original formulas in Excel
        $writer->save($filePath);

        return $filePath;
    }
}
