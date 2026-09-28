<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventAssessment;
use App\Models\EventParticipant;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;

class EventAssessmentService
{
    public const CATEGORY_PELATIH = 'PELATIH';

    public const CATEGORY_PENGUJI = 'PENGUJI';

    public const CATEGORY_WASIT = 'WASIT';

    /**
     * Get criteria configuration for all categories.
     *
     * @return array<string, array<string, mixed>>
     */
    public function getCriteriaConfig(): array
    {
        return [
            self::CATEGORY_PELATIH => [
                'title' => 'Form Penilaian Pelatih',
                'template_file' => 'public/xlsx/FORM PENILAIAN JADI PELATIH.xlsx',
                'start_row' => 15,
                'default_capacity' => 16,
                'cutoff_row' => 31,
                'min_pass_dasar' => 70,
                'min_pass_pribadi' => 70,
                'min_pass_total' => 140,
                'groups' => [
                    'dasar_teori' => [
                        'title' => 'Kemampuan Dasar - Teori (50)',
                        'max' => 50,
                        'criteria' => [
                            ['key' => 'teori_sejarah', 'label' => 'Pengetahuan Sejarah Shorinji Kempo', 'max' => 10, 'col' => 'D'],
                            ['key' => 'teori_administrasi', 'label' => 'Pengetahuan Administrasi, Pendirian Dojo, Penerimaan Anggota baru', 'max' => 10, 'col' => 'E'],
                            ['key' => 'teori_kepelatihan', 'label' => 'Pengetahuan Kepelatihan', 'max' => 20, 'col' => 'F'],
                            ['key' => 'teori_tokuhon', 'label' => 'Pengetahuan Tokuhon', 'max' => 10, 'col' => 'G'],
                        ],
                    ],
                    'dasar_praktek' => [
                        'title' => 'Kemampuan Dasar - Praktek (50)',
                        'max' => 50,
                        'criteria' => [
                            ['key' => 'praktek_gerakan_dasar', 'label' => 'Melatih Gerakan Dasar, Umpoho, Ukemi, Tai sabaki, Ashi Sabaki', 'max' => 10, 'col' => 'H'],
                            ['key' => 'praktek_goho_kihon', 'label' => 'Melatih Goho, Kihon', 'max' => 10, 'col' => 'I'],
                            ['key' => 'praktek_juho', 'label' => 'Melatih Juho, Tandoku, dan pasangan', 'max' => 10, 'col' => 'J'],
                            ['key' => 'praktek_ken_berpasangan', 'label' => 'Melatih Ken Berpasangan', 'max' => 10, 'col' => 'K'],
                            ['key' => 'praktek_kumi_embu', 'label' => 'Melatih Kumi Embu', 'max' => 10, 'col' => 'L'],
                        ],
                    ],
                    'pribadi' => [
                        'title' => 'Kemampuan Pribadi (100)',
                        'max' => 100,
                        'criteria' => [
                            ['key' => 'pribadi_keterampilan', 'label' => 'Keterampilan Melatih', 'max' => 60, 'col' => 'N'],
                            ['key' => 'pribadi_ekspresi_sikap', 'label' => 'Ekspresi dan sikap dlm melatih', 'max' => 40, 'col' => 'O'],
                        ],
                    ],
                ],
                'columns' => [
                    'dasar_subtotal_col' => 'M',
                    'pribadi_subtotal_col' => 'P',
                    'total_col' => 'Q',
                ],
            ],
            self::CATEGORY_PENGUJI => [
                'title' => 'Form Penilaian Penguji',
                'template_file' => 'public/xlsx/FORM PENILAIAN JADI PENGUJI.xlsx',
                'start_row' => 15,
                'default_capacity' => 15,
                'cutoff_row' => 30,
                'min_pass_dasar' => 70,
                'min_pass_pribadi' => 70,
                'min_pass_total' => 140,
                'groups' => [
                    'dasar_teori' => [
                        'title' => 'Kemampuan Dasar - Teori (50)',
                        'max' => 50,
                        'criteria' => [
                            ['key' => 'teori_sejarah', 'label' => 'Pengetahuan Sejarah Shorinji Kempo', 'max' => 10, 'col' => 'D'],
                            ['key' => 'teori_administrasi', 'label' => 'Pengetahuan Administrasi, Pendirian Dojo, Penerimaan Anggota baru', 'max' => 10, 'col' => 'E'],
                            ['key' => 'teori_menguji', 'label' => 'Pengetahuan Menguji', 'max' => 10, 'col' => 'F'],
                            ['key' => 'teori_tokuhon', 'label' => 'Pengetahuan/penguasaan Tokuhon', 'max' => 20, 'col' => 'G'],
                        ],
                    ],
                    'dasar_praktek' => [
                        'title' => 'Kemampuan Dasar - Praktek (50)',
                        'max' => 50,
                        'criteria' => [
                            ['key' => 'praktek_gerakan_dasar', 'label' => 'Melatih Gerakan Dasar, Umpoho, Ukemi, Tai Sabaki, Ashi Sabaki', 'max' => 10, 'col' => 'H'],
                            ['key' => 'praktek_goho_kihon', 'label' => 'Menguji Goho, Kihon', 'max' => 10, 'col' => 'I'],
                            ['key' => 'praktek_juho', 'label' => 'Menguji Juho, Tandoku dan pasangan', 'max' => 10, 'col' => 'J'],
                            ['key' => 'praktek_ken_berpasangan', 'label' => 'Menguji Ken Berpasangan', 'max' => 10, 'col' => 'K'],
                            ['key' => 'praktek_kumi_embu', 'label' => 'Menguji Kumi Embu', 'max' => 10, 'col' => 'L'],
                        ],
                    ],
                    'pribadi' => [
                        'title' => 'Kemampuan Pribadi (100)',
                        'max' => 100,
                        'criteria' => [
                            ['key' => 'pribadi_keterampilan', 'label' => 'Keterampilan Menguji', 'max' => 60, 'col' => 'N'],
                            ['key' => 'pribadi_ekspresi_sikap', 'label' => 'Ekspresi dan sikap dlm menguji', 'max' => 40, 'col' => 'O'],
                        ],
                    ],
                ],
                'columns' => [
                    'dasar_subtotal_col' => 'M',
                    'pribadi_subtotal_col' => 'P',
                    'total_col' => 'Q',
                ],
            ],
            self::CATEGORY_WASIT => [
                'title' => 'Form Penilaian Wasit',
                'template_file' => 'public/xlsx/FORM PENILAIAN JADI WASIT.xlsx',
                'start_row' => 16,
                'default_capacity' => 14,
                'cutoff_row' => 30,
                'min_pass_dasar' => 70,
                'min_pass_pribadi' => 70,
                'min_pass_total' => 140,
                'groups' => [
                    'dasar_teori' => [
                        'title' => 'Kemampuan Dasar - Teori (40)',
                        'max' => 40,
                        'criteria' => [
                            ['key' => 'teori_administrasi', 'label' => 'Pengetahuan Administrasi Pertandingan', 'max' => 10, 'col' => 'D'],
                            ['key' => 'teori_peraturan', 'label' => 'Pengetahuan Peraturan Pertandingan', 'max' => 10, 'col' => 'E'],
                            ['key' => 'teori_tata_cara', 'label' => 'Pengetahuan Tata Cara Mewasiti', 'max' => 10, 'col' => 'F'],
                            ['key' => 'teori_tokuhon', 'label' => 'Pengetahuan/penguasaan Tokuhon', 'max' => 10, 'col' => 'G'],
                        ],
                    ],
                    'dasar_praktek' => [
                        'title' => 'Kemampuan Dasar - Praktek (60)',
                        'max' => 60,
                        'criteria' => [
                            ['key' => 'praktek_kepemimpinan', 'label' => 'Kepemimpinan', 'max' => 10, 'col' => 'H'],
                            ['key' => 'praktek_kewibawaan', 'label' => 'Kewibawaan / sikap / ketegasan', 'max' => 10, 'col' => 'I'],
                            ['key' => 'praktek_randori', 'label' => 'Mewasiti Pertandingan Randori', 'max' => 20, 'col' => 'J'],
                            ['key' => 'praktek_embu', 'label' => 'Mewasiti Pertandingan Embu', 'max' => 20, 'col' => 'K'],
                        ],
                    ],
                    'pribadi' => [
                        'title' => 'Kemampuan Pribadi (100)',
                        'max' => 100,
                        'criteria' => [
                            ['key' => 'pribadi_keterampilan', 'label' => 'Keterampilan Mewasiti', 'max' => 60, 'col' => 'M'],
                            ['key' => 'pribadi_ekspresi_sikap', 'label' => 'Ekspresi dan sikap dlm mewasiti', 'max' => 40, 'col' => 'N'],
                        ],
                    ],
                ],
                'columns' => [
                    'dasar_subtotal_col' => 'L',
                    'pribadi_subtotal_col' => 'O',
                    'total_col' => 'P',
                ],
            ],
        ];
    }

    /**
     * Determine categories for a given track code and optional registration form type.
     *
     * @return array<string>
     */
    public function getCategoriesForParticipant(?string $trackCode, ?string $formType = null): array
    {
        $categories = [];

        if ($formType) {
            $normalizedForm = strtoupper(trim($formType));
            if ($normalizedForm === self::CATEGORY_PELATIH) {
                $categories[] = self::CATEGORY_PELATIH;
            } elseif ($normalizedForm === self::CATEGORY_PENGUJI) {
                $categories[] = self::CATEGORY_PENGUJI;
            } elseif ($normalizedForm === self::CATEGORY_WASIT) {
                $categories[] = self::CATEGORY_WASIT;
            }
        }

        $code = strtoupper(trim((string) $trackCode));
        if (in_array($code, ['PD', 'PN'])) {
            $categories[] = self::CATEGORY_PELATIH;
        } elseif (in_array($code, ['PED', 'PEN'])) {
            $categories[] = self::CATEGORY_PENGUJI;
        } elseif (in_array($code, ['WAD', 'WAN'])) {
            $categories[] = self::CATEGORY_WASIT;
        } elseif ($code === 'PWAD' || $code === 'PWAN') {
            $categories[] = self::CATEGORY_PENGUJI;
            $categories[] = self::CATEGORY_WASIT;
        }

        return array_values(array_unique($categories));
    }

    /**
     * Get assessment data grouped by category for an event.
     *
     * @return array<string, mixed>
     */
    public function getEventAssessmentData(Event $event): array
    {
        $criteria = $this->getCriteriaConfig();
        $settings = $event->assessment_settings ?? [];

        // Load participants with existing assessments and profile info
        $participants = EventParticipant::where('event_id', $event->id)
            ->with(['participant.user', 'track', 'registrationForm', 'assessments'])
            ->orderBy('id')
            ->get();

        $byCategory = [
            self::CATEGORY_PELATIH => [],
            self::CATEGORY_PENGUJI => [],
            self::CATEGORY_WASIT => [],
        ];

        $stats = [
            'total_participants' => $participants->count(),
            'total_assessed' => 0,
            'categories' => [
                self::CATEGORY_PELATIH => ['total' => 0, 'assessed' => 0, 'passed' => 0, 'failed' => 0],
                self::CATEGORY_PENGUJI => ['total' => 0, 'assessed' => 0, 'passed' => 0, 'failed' => 0],
                self::CATEGORY_WASIT => ['total' => 0, 'assessed' => 0, 'passed' => 0, 'failed' => 0],
            ],
        ];

        $assessedParticipantIds = [];

        foreach ($participants as $ep) {
            $formType = $ep->registrationForm?->form_type;
            $matchedCategories = $this->getCategoriesForParticipant($ep->track_code, $formType);

            foreach ($matchedCategories as $cat) {
                if (! isset($byCategory[$cat])) {
                    continue;
                }

                $assessment = $ep->assessments->firstWhere('category', $cat);
                $isAssessed = $assessment !== null && $assessment->scores !== null && count($assessment->scores) > 0;

                if ($isAssessed) {
                    $assessedParticipantIds[$ep->id] = true;
                    $stats['categories'][$cat]['assessed']++;
                    if ($assessment->is_passed) {
                        $stats['categories'][$cat]['passed']++;
                    } else {
                        $stats['categories'][$cat]['failed']++;
                    }
                }
                $stats['categories'][$cat]['total']++;

                $rawOrigin = $ep->participant?->origin_city
                    ?? $ep->registrationForm?->pengkab_pengkot
                    ?? $ep->participant?->origin
                    ?? '';

                $originParts = array_unique(array_filter(array_map('trim', explode('/', (string) $rawOrigin))));
                $origin = implode(' / ', array_slice($originParts, 0, 2));

                $nik = $ep->registrationForm?->nik
                    ?? $ep->participant?->nik
                    ?? $ep->participant?->kenshi_id
                    ?? '';

                $byCategory[$cat][] = [
                    'event_participant_id' => $ep->id,
                    'participant_id' => $ep->participant_id,
                    'name' => $ep->participant?->name ?? 'Peserta',
                    'kenshi_id' => $ep->participant?->kenshi_id ?? '-',
                    'nik' => $nik,
                    'origin' => $origin,
                    'dan_level' => $ep->participant?->dan_level,
                    'dan_roman' => $ep->participant?->dan_roman ?? '-',
                    'track_code' => $ep->track_code ?? '-',
                    'track_name' => $ep->track?->name ?? '-',
                    'photo_url' => $ep->participant?->photo_url,
                    'theory_score' => $ep->theory_score,
                    'practice_score' => $ep->practice_score,
                    'assessment_id' => $assessment?->id,
                    'scores' => $assessment?->scores ?? [],
                    'subtotal_dasar' => $assessment ? (float) $assessment->subtotal_dasar : 0,
                    'subtotal_pribadi' => $assessment ? (float) $assessment->subtotal_pribadi : 0,
                    'total_score' => $assessment ? (float) $assessment->total_score : 0,
                    'is_passed' => $assessment ? (bool) $assessment->is_passed : false,
                    'notes' => $assessment?->notes ?? '',
                    'examiner_name' => $assessment?->examiner_name ?? ($settings[$cat]['examiner_name'] ?? ''),
                    'examiner_rank' => $assessment?->examiner_rank ?? ($settings[$cat]['examiner_rank'] ?? ''),
                ];
            }
        }

        $stats['total_assessed'] = count($assessedParticipantIds);

        return [
            'criteria' => $criteria,
            'participants_by_category' => $byCategory,
            'settings' => [
                self::CATEGORY_PELATIH => [
                    'examiner_name' => $settings[self::CATEGORY_PELATIH]['examiner_name'] ?? '',
                    'examiner_rank' => $settings[self::CATEGORY_PELATIH]['examiner_rank'] ?? '',
                ],
                self::CATEGORY_PENGUJI => [
                    'examiner_name' => $settings[self::CATEGORY_PENGUJI]['examiner_name'] ?? '',
                    'examiner_rank' => $settings[self::CATEGORY_PENGUJI]['examiner_rank'] ?? '',
                ],
                self::CATEGORY_WASIT => [
                    'examiner_name' => $settings[self::CATEGORY_WASIT]['examiner_name'] ?? '',
                    'examiner_rank' => $settings[self::CATEGORY_WASIT]['examiner_rank'] ?? '',
                ],
            ],
            'stats' => $stats,
        ];
    }

    /**
     * Calculate subtotals and total from score criteria.
     *
     * @param  array<string, mixed>  $scores
     * @return array{subtotal_dasar: float, subtotal_pribadi: float, total_score: float, is_passed: bool}
     */
    public function calculateScore(string $category, array $scores): array
    {
        $config = $this->getCriteriaConfig()[$category] ?? null;
        if (! $config) {
            return ['subtotal_dasar' => 0, 'subtotal_pribadi' => 0, 'total_score' => 0, 'is_passed' => false];
        }

        $subtotalDasar = 0.0;
        $subtotalPribadi = 0.0;

        foreach ($config['groups']['dasar_teori']['criteria'] as $item) {
            $key = $item['key'];
            $val = isset($scores[$key]) && is_numeric($scores[$key]) ? (float) $scores[$key] : 0.0;
            $subtotalDasar += min(max(0, $val), $item['max']);
        }

        foreach ($config['groups']['dasar_praktek']['criteria'] as $item) {
            $key = $item['key'];
            $val = isset($scores[$key]) && is_numeric($scores[$key]) ? (float) $scores[$key] : 0.0;
            $subtotalDasar += min(max(0, $val), $item['max']);
        }

        foreach ($config['groups']['pribadi']['criteria'] as $item) {
            $key = $item['key'];
            $val = isset($scores[$key]) && is_numeric($scores[$key]) ? (float) $scores[$key] : 0.0;
            $subtotalPribadi += min(max(0, $val), $item['max']);
        }

        $totalScore = $subtotalDasar + $subtotalPribadi;
        $isPassed = ($subtotalDasar >= $config['min_pass_dasar']) && ($subtotalPribadi >= $config['min_pass_pribadi']);

        return [
            'subtotal_dasar' => round($subtotalDasar, 2),
            'subtotal_pribadi' => round($subtotalPribadi, 2),
            'total_score' => round($totalScore, 2),
            'is_passed' => $isPassed,
        ];
    }

    /**
     * Save an assessment for a participant and synchronize practice score.
     *
     * @param  array<string, mixed>  $data
     */
    public function saveAssessment(Event $event, array $data): EventAssessment
    {
        $ep = EventParticipant::where('event_id', $event->id)
            ->where('id', $data['event_participant_id'])
            ->firstOrFail();

        $category = strtoupper(trim($data['category']));
        $scores = is_array($data['scores'] ?? null) ? $data['scores'] : [];
        $calculated = $this->calculateScore($category, $scores);

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
                'subtotal_dasar' => $calculated['subtotal_dasar'],
                'subtotal_pribadi' => $calculated['subtotal_pribadi'],
                'total_score' => $calculated['total_score'],
                'is_passed' => $calculated['is_passed'],
                'notes' => $data['notes'] ?? null,
            ]
        );

        // Update score_practice on event_participant (scale out of 100)
        // total_score is out of 200, so total_score / 2 gives 0-100 score
        $practiceScore = round($calculated['total_score'] / 2, 2);
        $updateFields = ['score_practice' => $practiceScore];

        if ($assessment->notes) {
            $updateFields['evaluation_notes'] = $assessment->notes;
        }

        $ep->update($updateFields);

        return $assessment;
    }

    /**
     * Save bulk assessments and update event examiner settings.
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function saveBulkAssessments(Event $event, array $payload): array
    {
        $category = strtoupper(trim($payload['category']));
        $examinerName = trim((string) ($payload['examiner_name'] ?? ''));
        $examinerRank = trim((string) ($payload['examiner_rank'] ?? ''));

        // Update event settings
        $settings = $event->assessment_settings ?? [];
        $settings[$category] = [
            'examiner_name' => $examinerName,
            'examiner_rank' => $examinerRank,
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
            if (! empty($examinerRank)) {
                $item['examiner_rank'] = $examinerRank;
            }

            $this->saveAssessment($event, $item);
            $savedCount++;
        }

        return [
            'success' => true,
            'saved_count' => $savedCount,
            'category' => $category,
        ];
    }

    /**
     * Export assessment to Excel matching the exact official template.
     */
    public function exportExcel(Event $event, string $category): string
    {
        $category = strtoupper(trim($category));
        $config = $this->getCriteriaConfig()[$category] ?? null;
        if (! $config) {
            throw new \InvalidArgumentException("Kategori penilaian tidak valid: {$category}");
        }

        $templatePath = base_path($config['template_file']);
        if (! file_exists($templatePath)) {
            throw new \RuntimeException("Template excel tidak ditemukan di {$templatePath}");
        }

        $spreadsheet = IOFactory::load($templatePath);
        $sheet = $spreadsheet->getActiveSheet();

        $eventData = $this->getEventAssessmentData($event);
        $participants = $eventData['participants_by_category'][$category] ?? [];
        $examinerName = $eventData['settings'][$category]['examiner_name'] ?? '';
        $examinerRank = $eventData['settings'][$category]['examiner_rank'] ?? '';

        // Fill examiner information in header
        if ($category === self::CATEGORY_PELATIH || $category === self::CATEGORY_PENGUJI) {
            if (! empty($examinerName)) {
                $sheet->setCellValue('N2', 'Penguji : '.$examinerName);
            }
            if (! empty($examinerRank)) {
                $sheet->setCellValue('S2', 'Tingkatan : '.$examinerRank);
            }
        } elseif ($category === self::CATEGORY_WASIT) {
            if (! empty($examinerName)) {
                $sheet->setCellValue('M3', 'Penguji : '.$examinerName);
            }
            if (! empty($examinerRank)) {
                $sheet->setCellValue('M4', 'Tingkatan : '.$examinerRank);
            }
        }

        $startRow = $config['start_row'];
        $capacity = $config['default_capacity'];
        $cutoffRow = $config['cutoff_row'];
        $count = count($participants);

        // If more participants than default template capacity, insert rows before cutoff note
        if ($count > $capacity) {
            $extraRows = $count - $capacity;
            $sheet->insertNewRowBefore($cutoffRow, $extraRows);
        }

        $r = $startRow;
        $no = 1;

        foreach ($participants as $p) {
            $sheet->setCellValue('B'.$r, $no);

            // Format Name & NIK/Kab/Prov
            $nameStr = $p['name'];
            $subInfo = [];
            if (! empty($p['kenshi_id']) && $p['kenshi_id'] !== '-') {
                $subInfo[] = $p['kenshi_id'];
            } elseif (! empty($p['nik'])) {
                $subInfo[] = $p['nik'];
            }
            if (! empty($p['origin'])) {
                $subInfo[] = $p['origin'];
            }
            $fullCell = $nameStr.(! empty($subInfo) ? "\n".implode(' / ', $subInfo) : '');
            $sheet->setCellValue('C'.$r, $fullCell);
            $sheet->getStyle('C'.$r)->getAlignment()->setWrapText(true);

            $scores = $p['scores'] ?? [];

            // Fill individual criteria scores
            foreach ($config['groups'] as $groupKey => $group) {
                foreach ($group['criteria'] as $crit) {
                    $key = $crit['key'];
                    $col = $crit['col'];
                    $val = isset($scores[$key]) && is_numeric($scores[$key]) ? (float) $scores[$key] : null;
                    if ($val !== null) {
                        $sheet->setCellValue($col.$r, $val);
                    }
                }
            }

            // Fill subtotal and total formulas
            if ($category === self::CATEGORY_PELATIH || $category === self::CATEGORY_PENGUJI) {
                $sheet->setCellValue('M'.$r, "=SUM(D{$r}:L{$r})");
                $sheet->setCellValue('P'.$r, "=SUM(N{$r}:O{$r})");
                $sheet->setCellValue('Q'.$r, "=M{$r}+P{$r}");
                $endCol = 'Q';
            } else { // WASIT
                $sheet->setCellValue('L'.$r, "=SUM(D{$r}:K{$r})");
                $sheet->setCellValue('O'.$r, "=SUM(M{$r}:N{$r})");
                $sheet->setCellValue('P'.$r, "=L{$r}+O{$r}");
                $endCol = 'P';
            }

            // Apply borders and alignment for the participant row
            $sheet->getStyle("B{$r}:{$endCol}{$r}")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
            $sheet->getStyle("B{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("D{$r}:{$endCol}{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $r++;
            $no++;
        }

        $tmpDir = storage_path('app/temp');
        if (! is_dir($tmpDir)) {
            mkdir($tmpDir, 0755, true);
        }

        $safeSlug = preg_replace('/[^A-Za-z0-9_\-]/', '_', $event->slug ?: 'event_'.$event->id);
        $filename = "FORM_PENILAIAN_{$category}_{$safeSlug}.xlsx";
        $filePath = $tmpDir.'/'.$filename;

        $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
        $writer->save($filePath);

        return $filePath;
    }
}
