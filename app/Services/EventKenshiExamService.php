<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventAssessment;
use App\Models\EventParticipant;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EventKenshiExamService
{
    public const ASSESSMENT_CATEGORY = 'KENSHI_UKT';

    /** @var array<int, string> */
    public const TRACK_CODES = ['KYU-8', 'KYU-7', 'KYU-6', 'KYU-5', 'KYU-4', 'KYU-3', 'KYU-2', 'KYU-1'];

    public function supportsEvent(Event $event): bool
    {
        return $event->isUkt()
            || $event->eventParticipants()->whereIn('track_code', self::TRACK_CODES)->exists();
    }

    /** @return array<string, array<string, mixed>> */
    public function criteriaConfig(): array
    {
        return [
            'KYU-8' => $this->kyuEightConfig(),
            'KYU-7' => $this->kyuSevenConfig(),
            'KYU-6' => $this->kyuSixConfig(),
            'KYU-5' => $this->kyuFiveConfig(),
            'KYU-4' => $this->kyuFourConfig(),
            'KYU-3' => $this->advancedConfig('KYU 3'),
            'KYU-2' => $this->advancedConfig('KYU 2'),
            'KYU-1' => $this->advancedConfig('KYU 1'),
        ];
    }

    /** @return array<string, mixed> */
    public function eventData(Event $event): array
    {
        $configs = $this->criteriaConfig();
        $participants = EventParticipant::query()
            ->whereBelongsTo($event)
            ->whereIn('track_code', self::TRACK_CODES)
            ->with([
                'participant',
                'registrationForm',
                'assessments' => fn ($query) => $query->where('category', self::ASSESSMENT_CATEGORY),
            ])
            ->orderBy('track_code')
            ->orderBy('id')
            ->get();

        $byCategory = [];
        $categoryStats = [];
        $totalAssessed = 0;

        foreach (self::TRACK_CODES as $trackCode) {
            $byCategory[$trackCode] = [];
            $categoryStats[$trackCode] = ['total' => 0, 'assessed' => 0, 'passed' => 0];
        }

        foreach ($participants as $enrollment) {
            $trackCode = $enrollment->track_code;
            $assessment = $enrollment->assessments->first();
            $scores = $assessment?->scores ?? [];
            $calculation = $this->calculate($trackCode, $scores);
            $isAssessed = $assessment !== null && $this->hasEnteredScores($trackCode, $scores);

            if ($isAssessed) {
                $totalAssessed++;
                $categoryStats[$trackCode]['assessed']++;
                if ($calculation['status'] === 'LULUS') {
                    $categoryStats[$trackCode]['passed']++;
                }
            }

            $categoryStats[$trackCode]['total']++;
            $participant = $enrollment->participant;
            $registrationForm = $enrollment->registrationForm;

            $byCategory[$trackCode][] = [
                'event_participant_id' => $enrollment->id,
                'participant_id' => $enrollment->participant_id,
                'track_code' => $trackCode,
                'name' => $participant?->name ?? $registrationForm?->full_name ?? 'Peserta',
                'kenshi_id' => $participant?->kenshi_id ?? $registrationForm?->kenshi_id_number ?? '-',
                'dojo' => $participant?->dojo ?? $registrationForm?->dojo_name ?? '-',
                'origin' => collect([$participant?->origin_city, $participant?->origin_province])->filter()->implode(' / '),
                'scores' => $this->onlyInputScores($trackCode, $scores),
                'total_score_override' => $scores['_total_score_override'] ?? null,
                'status_override' => $scores['_status_override'] ?? 'auto',
                'notes' => $assessment?->notes ?? '',
                'is_assessed' => $isAssessed,
                ...$calculation,
            ];
        }

        foreach ($byCategory as $trackCode => $items) {
            usort($items, fn (array $left, array $right): int => strnatcasecmp($left['name'], $right['name']));
            $byCategory[$trackCode] = $items;
        }

        $settings = [];
        foreach (self::TRACK_CODES as $trackCode) {
            $settings[$trackCode] = $this->documentDetails($event, $trackCode);
        }

        return [
            'configs' => $configs,
            'participants_by_category' => $byCategory,
            'settings' => $settings,
            'stats' => [
                'total_participants' => $participants->count(),
                'total_assessed' => $totalAssessed,
                'categories' => $categoryStats,
            ],
        ];
    }

    /** @return array<string, mixed> */
    public function documentDetails(Event $event, string $trackCode): array
    {
        $stored = $event->assessment_settings['kenshi_exam'][$trackCode] ?? [];

        return $this->normalizeDocumentDetails(is_array($stored) ? $stored : []);
    }

    /**
     * @param  array<string, mixed>  $scores
     * @return array<string, mixed>
     */
    public function calculate(string $trackCode, array $scores): array
    {
        $config = $this->criteriaConfig()[$trackCode] ?? null;
        if (! $config) {
            throw new \InvalidArgumentException("Kategori kenshi tidak didukung: {$trackCode}");
        }

        $groupTotals = [];
        $allRequiredScoresFilled = true;

        foreach ($config['groups'] as $group) {
            $groupTotal = 0.0;
            foreach ($group['criteria'] as $criterion) {
                $value = $scores[$criterion['key']] ?? null;
                if ($value === null || $value === '') {
                    $allRequiredScoresFilled = false;

                    continue;
                }
                $groupTotal += min((float) $criterion['max'], max(0, (float) $value));
            }
            $groupTotals[$group['key']] = round($groupTotal, 2);
        }

        $theoryHistory = $config['uses_theory'] ? $this->numericScore($scores['theory_history'] ?? null, 50) : 0.0;
        $theoryPhilosophy = $config['uses_theory'] ? $this->numericScore($scores['theory_philosophy'] ?? null, 50) : 0.0;
        if ($config['uses_theory'] && (($scores['theory_history'] ?? '') === '' || ($scores['theory_philosophy'] ?? '') === '')) {
            $allRequiredScoresFilled = false;
        }

        $theoryTotal = round($theoryHistory + $theoryPhilosophy, 2);
        $practiceTotal = round(array_sum($groupTotals), 2);
        $automaticTotal = round($theoryTotal + $practiceTotal, 2);
        $hasTotalOverride = array_key_exists('_total_score_override', $scores)
            && $scores['_total_score_override'] !== ''
            && $scores['_total_score_override'] !== null
            && is_numeric($scores['_total_score_override']);
        $total = $hasTotalOverride
            ? round($this->numericScore($scores['_total_score_override'], (float) $config['maximum_total']), 2)
            : $automaticTotal;
        $percentage = round(($total / (float) $config['maximum_total']) * 100, 2);
        $groupsMeetMinimum = collect($config['groups'])->every(
            fn (array $group): bool => ($groupTotals[$group['key']] ?? 0) >= ((float) $group['max'] * 0.6)
        );
        $statusOverride = $scores['_status_override'] ?? 'auto';

        $status = match ($statusOverride) {
            'passed' => 'LULUS',
            'failed' => 'TIDAK LULUS',
            'absent' => 'TIDAK HADIR',
            default => ! $allRequiredScoresFilled
                ? 'BELUM DINILAI'
                : ($percentage >= 70 && $groupsMeetMinimum ? 'LULUS' : 'TIDAK LULUS'),
        };

        $partA = collect($config['part_a_groups'])->sum(fn (string $key): float => (float) ($groupTotals[$key] ?? 0));
        $partB = collect($config['part_b_groups'])->sum(fn (string $key): float => (float) ($groupTotals[$key] ?? 0));

        return [
            'group_totals' => $groupTotals,
            'theory_total' => $theoryTotal,
            'practice_total' => $practiceTotal,
            'part_a_total' => round($partA, 2),
            'part_b_total' => round($partB, 2),
            'automatic_total_score' => $automaticTotal,
            'total_score' => $total,
            'has_total_override' => $hasTotalOverride,
            'percentage' => $percentage,
            'status' => $status,
            'is_passed' => $status === 'LULUS',
            'is_complete' => $allRequiredScoresFilled,
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array{saved_count: int, category: string}
     */
    public function saveBulk(Event $event, array $payload): array
    {
        $trackCode = (string) $payload['category'];
        $config = $this->criteriaConfig()[$trackCode] ?? null;
        if (! $config) {
            throw ValidationException::withMessages(['category' => 'Kategori Kyu tidak valid.']);
        }

        $items = collect($payload['assessments'] ?? []);
        $participantIds = $items->pluck('event_participant_id')->map(fn ($id): int => (int) $id)->unique()->values();
        $participants = EventParticipant::query()
            ->whereBelongsTo($event)
            ->where('track_code', $trackCode)
            ->whereIn('id', $participantIds)
            ->get()
            ->keyBy('id');

        if ($participants->count() !== $participantIds->count()) {
            throw ValidationException::withMessages([
                'assessments' => 'Terdapat peserta yang bukan anggota event atau kategori ini.',
            ]);
        }

        $currentDetails = $this->documentDetails($event, $trackCode);
        $submittedDetails = is_array($payload['document_details'] ?? null) ? $payload['document_details'] : [];
        $documentDetails = $this->normalizeDocumentDetails($submittedDetails, $currentDetails);
        $primaryExaminer = $documentDetails['examiners'][0];
        $examinerName = $primaryExaminer['name'];
        $examinerRank = $primaryExaminer['rank'];

        DB::transaction(function () use ($event, $trackCode, $items, $participants, $documentDetails, $examinerName, $examinerRank, $config): void {
            $settings = $event->assessment_settings ?? [];
            $settings['kenshi_exam'][$trackCode] = $documentDetails;
            $event->update(['assessment_settings' => $settings]);

            foreach ($items as $itemIndex => $item) {
                $participant = $participants->get((int) $item['event_participant_id']);
                $scores = $this->validatedScores($trackCode, is_array($item['scores'] ?? null) ? $item['scores'] : []);
                $totalScoreOverride = $item['total_score_override'] ?? null;
                if ($totalScoreOverride !== null && $totalScoreOverride !== '') {
                    if (! is_numeric($totalScoreOverride) || (float) $totalScoreOverride < 0 || (float) $totalScoreOverride > (float) $config['maximum_total']) {
                        throw ValidationException::withMessages([
                            "assessments.{$itemIndex}.total_score_override" => "Nilai akhir manual harus antara 0 dan {$config['maximum_total']}.",
                        ]);
                    }

                    $scores['_total_score_override'] = round((float) $totalScoreOverride, 2);
                }
                $statusOverride = (string) ($item['status_override'] ?? 'auto');
                $scores['_status_override'] = in_array($statusOverride, ['auto', 'passed', 'failed', 'absent'], true)
                    ? $statusOverride
                    : 'auto';

                $calculation = $this->calculate($trackCode, $scores);
                $scores['_status'] = $calculation['status'];
                $scores['_group_totals'] = $calculation['group_totals'];
                $scores['_theory_total'] = $calculation['theory_total'];
                $scores['_practice_total'] = $calculation['practice_total'];
                $scores['_percentage'] = $calculation['percentage'];

                EventAssessment::updateOrCreate(
                    [
                        'event_participant_id' => $participant->id,
                        'category' => self::ASSESSMENT_CATEGORY,
                    ],
                    [
                        'event_id' => $event->id,
                        'examiner_name' => $examinerName ?: null,
                        'examiner_rank' => $examinerRank ?: null,
                        'scores' => $scores,
                        'subtotal_dasar' => $calculation['theory_total'],
                        'subtotal_pribadi' => $calculation['practice_total'],
                        'total_score' => $calculation['total_score'],
                        'is_passed' => $calculation['is_passed'],
                        'notes' => $item['notes'] ?? null,
                    ],
                );

                $participant->update([
                    'score_theory' => $config['uses_theory'] ? $calculation['theory_total'] : null,
                    'score_practice' => round(($calculation['practice_total'] / $config['technique_maximum']) * 100, 2),
                    'graduation_status' => match ($calculation['status']) {
                        'LULUS' => 'passed',
                        'TIDAK LULUS' => 'failed',
                        default => 'in_training',
                    },
                ]);
            }
        });

        return ['saved_count' => $items->count(), 'category' => $trackCode];
    }

    /**
     * @param  array<string, mixed>  $details
     * @param  array<string, mixed>  $fallback
     * @return array<string, mixed>
     */
    private function normalizeDocumentDetails(array $details, array $fallback = []): array
    {
        $fallbackExaminers = is_array($fallback['examiners'] ?? null) ? $fallback['examiners'] : [];
        $submittedExaminers = is_array($details['examiners'] ?? null) ? $details['examiners'] : [];
        $examiners = [];

        for ($index = 0; $index < 3; $index++) {
            $submitted = is_array($submittedExaminers[$index] ?? null) ? $submittedExaminers[$index] : [];
            $existing = is_array($fallbackExaminers[$index] ?? null) ? $fallbackExaminers[$index] : [];
            $examiners[] = [
                'name' => trim((string) ($submitted['name'] ?? $existing['name'] ?? ($index === 0 ? $details['examiner_name'] ?? '' : ''))),
                'rank' => trim((string) ($submitted['rank'] ?? $existing['rank'] ?? ($index === 0 ? $details['examiner_rank'] ?? '' : ''))),
                'certificate_number' => trim((string) ($submitted['certificate_number'] ?? $existing['certificate_number'] ?? '')),
            ];
        }

        $field = static fn (string $key): string => trim((string) ($details[$key] ?? $fallback[$key] ?? ''));

        return [
            'mandate_number' => $field('mandate_number'),
            'mandate_date' => $field('mandate_date'),
            'examiners' => $examiners,
            'coordinator_name' => $field('coordinator_name'),
            'coordinator_rank' => $field('coordinator_rank'),
            'organizer_representative_name' => $field('organizer_representative_name'),
            'organizer_representative_rank' => $field('organizer_representative_rank'),
            'organizer_representative_role' => $field('organizer_representative_role'),
        ];
    }

    /** @return array<string, mixed> */
    private function kyuEightConfig(): array
    {
        return $this->standardConfig('KYU 8', 'V', [
            $this->group('teknik_1', 'Teknik I', 'K', [
                $this->criterion('etika_tata_krama', 'Etika & Tata Krama', 40, 'G'),
                $this->criterion('tai_gamae', 'Tai Gamae', 20, 'H'),
                $this->criterion('tai_sabaki', 'Tai Sabaki', 20, 'I'),
                $this->criterion('umpo_ho', 'Umpo Ho', 20, 'J'),
            ]),
            $this->group('teknik_2', 'Teknik II', 'Q', [
                $this->criterion('teknik_menyerang', 'Teknik Menyerang', 20, 'L'),
                $this->criterion('teknik_bertahan', 'Teknik Bertahan', 20, 'M'),
                $this->criterion('bertahan_bergerak', 'Bertahan dengan Bergerak', 10, 'N'),
                $this->criterion('do_zuki_do_geri', 'Do Zuki, Do Geri', 10, 'O'),
                $this->criterion('ken_tandoku', 'Ken (Tandoku)', 40, 'P'),
            ]),
            $this->group('hokei', 'Hokei So Tai', 'U', [
                $this->criterion('uchi_uke_zuki_ura', 'Uchi Uke Zuki (Ura)', 30, 'R'),
                $this->criterion('kote_nuki', 'Kote Nuki', 30, 'S'),
                $this->criterion('tenchi_ken_1_tandoku', 'Tenchi Ken Dai Ikkei (Tandoku)', 40, 'T'),
            ]),
        ]);
    }

    /** @return array<string, mixed> */
    private function kyuSevenConfig(): array
    {
        return $this->standardConfig('KYU 7', 'Y', [
            $this->group('teknik_1', 'Teknik I', 'L', [
                $this->criterion('etika_tata_krama', 'Etika & Tata Krama', 60, 'G'),
                $this->criterion('tai_gamae', 'Tai Gamae', 10, 'H'),
                $this->criterion('tai_sabaki', 'Tai Sabaki', 10, 'I'),
                $this->criterion('umpo_ho', 'Umpo Ho', 10, 'J'),
                $this->criterion('ukemi', 'Ukemi', 10, 'K'),
            ]),
            $this->group('teknik_2', 'Teknik II', 'R', [
                $this->criterion('teknik_menyerang', 'Teknik Menyerang', 20, 'M'),
                $this->criterion('teknik_bertahan', 'Teknik Bertahan', 20, 'N'),
                $this->criterion('bertahan_bergerak', 'Bertahan dengan Bergerak', 10, 'O'),
                $this->criterion('do_zuki_do_geri', 'Do Zuki, Do Geri', 10, 'P'),
                $this->criterion('ken_tandoku', 'Ken (Tandoku)', 40, 'Q'),
            ]),
            $this->group('hokei', 'Hokei So Tai', 'X', [
                $this->criterion('uwa_uke_zuki_omote', 'Uwa Uke Zuki (Omote)', 20, 'S'),
                $this->criterion('uchi_uke_zuki_ura', 'Uchi Uke Zuki (Ura)', 20, 'T'),
                $this->criterion('kote_nuki', 'Kote Nuki', 20, 'U'),
                $this->criterion('ryuo_ken_1_tandoku', 'Ryuo Ken Dai Ikkei (Tandoku)', 40, 'V'),
            ]),
        ]);
    }

    /** @return array<string, mixed> */
    private function kyuSixConfig(): array
    {
        return $this->standardConfig('KYU 6', 'Z', [
            $this->group('teknik_1', 'Teknik I', 'L', [
                $this->criterion('etika_tata_krama', 'Etika & Tata Krama', 60, 'G'),
                $this->criterion('tai_gamae', 'Tai Gamae', 10, 'H'),
                $this->criterion('tai_sabaki', 'Tai Sabaki', 10, 'I'),
                $this->criterion('umpo_ho', 'Umpo Ho', 10, 'J'),
                $this->criterion('ukemi', 'Ukemi', 10, 'K'),
            ]),
            $this->group('teknik_2', 'Teknik II', 'S', [
                $this->criterion('teknik_menyerang', 'Teknik Menyerang', 20, 'M'),
                $this->criterion('teknik_bertahan', 'Teknik Bertahan', 20, 'N'),
                $this->criterion('bertahan_bergerak', 'Bertahan dengan Bergerak', 10, 'O'),
                $this->criterion('do_zuki_do_geri', 'Do Zuki, Do Geri', 10, 'P'),
                $this->criterion('tenchi_ken_1_tandoku', 'Tenchi Ken Dai Ikkei (Tandoku)', 20, 'Q'),
                $this->criterion('ryuo_ken_1_tandoku', 'Ryuo Ken Dai Ikkei (Tandoku)', 20, 'R'),
            ]),
            $this->group('hokei', 'Hokei So Tai', 'Y', [
                $this->criterion('ryusui_geri_ushiro', 'Ryusui Geri (Ushiro)', 20, 'T'),
                $this->criterion('uchi_uke_zuki_ura', 'Uchi Uke Zuki (Ura)', 20, 'U'),
                $this->criterion('tenshin_geri', 'Tenshin Geri', 20, 'V'),
                $this->criterion('uwa_uke_zuki_omote', 'Uwa Uke Zuki (Omote)', 20, 'W'),
                $this->criterion('kote_nuki', 'Kote Nuki', 20, 'X'),
            ]),
        ]);
    }

    /** @return array<string, mixed> */
    private function kyuFiveConfig(): array
    {
        return $this->standardConfig('KYU 5', 'AG', [
            $this->group('teknik_1', 'Teknik I', 'L', [
                $this->criterion('etika_tata_krama', 'Etika & Tata Krama', 20, 'G'),
                $this->criterion('tai_gamae', 'Tai Gamae', 20, 'H'),
                $this->criterion('tai_sabaki', 'Tai Sabaki', 20, 'I'),
                $this->criterion('umpo_ho', 'Umpo Ho', 20, 'J'),
                $this->criterion('ukemi', 'Ukemi', 20, 'K'),
            ]),
            $this->group('teknik_2', 'Teknik II', 'U', [
                $this->criterion('teknik_menyerang_1', 'Teknik Menyerang 1', 10, 'M'),
                $this->criterion('teknik_menyerang_2', 'Teknik Menyerang 2', 10, 'N'),
                $this->criterion('teknik_bertahan', 'Teknik Bertahan', 10, 'O'),
                $this->criterion('bertahan_bergerak', 'Bertahan dengan Bergerak', 10, 'P'),
                $this->criterion('do_zuki_do_geri', 'Do Zuki, Do Geri', 10, 'Q'),
                $this->criterion('tenchi_ken_1_tandoku', 'Tenchi Ken Dai Ikkei (Tandoku)', 20, 'R'),
                $this->criterion('ryuo_ken_1_tandoku', 'Ryuo Ken Dai Ikkei (Tandoku)', 20, 'S'),
                $this->criterion('giwa_ken_1_tandoku', 'Giwa Ken Dai Ikkei (Tandoku)', 10, 'T'),
            ]),
            $this->group('hokei', 'Hokei So Tai', 'AF', [
                $this->criterion('tenchi_ken_1_pasangan', 'Tenchi Ken Dai Ikkei (Pasangan)', 10, 'V'),
                $this->criterion('ryuo_ken_1_pasangan', 'Ryuo Ken Dai Ikkei (Pasangan)', 10, 'W'),
                $this->criterion('ryusui_geri_mae', 'Ryusui Geri (Mae)', 10, 'X'),
                $this->criterion('uwa_uke_zuki_ura', 'Uwa Uke Zuki (Ura)', 10, 'Y'),
                $this->criterion('uwa_uke_geri', 'Uwa Uke Geri (Omote/Ura)', 10, 'Z'),
                $this->criterion('shita_uke_geri', 'Shita Uke Geri', 10, 'AA'),
                $this->criterion('shita_uke_jun_geri', 'Shita Uke Jun Geri', 10, 'AB'),
                $this->criterion('katate_yori_nuki', 'Katate Yori Nuki', 10, 'AC'),
                $this->criterion('maki_nuki_katate', 'Maki Nuki (Katate)', 10, 'AD'),
                $this->criterion('gyaku_gote_mae_yubi', 'Gyaku Gote – Mae Yubi Gatame', 10, 'AE'),
            ]),
        ]);
    }

    /** @return array<string, mixed> */
    private function kyuFourConfig(): array
    {
        return $this->standardConfig('KYU 4', 'AI', [
            $this->group('teknik_1', 'Teknik I', 'L', [
                $this->criterion('etika_tata_krama', 'Etika & Tata Krama', 20, 'G'),
                $this->criterion('tai_gamae', 'Tai Gamae', 20, 'H'),
                $this->criterion('tai_sabaki', 'Tai Sabaki', 20, 'I'),
                $this->criterion('umpo_ho', 'Umpo Ho', 20, 'J'),
                $this->criterion('ukemi', 'Ukemi', 20, 'K'),
            ]),
            $this->group('teknik_2', 'Teknik II', 'W', [
                $this->criterion('teknik_menyerang_1', 'Teknik Menyerang 1', 10, 'M'),
                $this->criterion('teknik_menyerang_2', 'Teknik Menyerang 2', 10, 'N'),
                $this->criterion('teknik_bertahan', 'Teknik Bertahan', 10, 'O'),
                $this->criterion('bertahan_bergerak', 'Bertahan dengan Bergerak', 10, 'P'),
                $this->criterion('bertahan_menyerang_bergerak', 'Bertahan & Menyerang Bergerak', 10, 'Q'),
                $this->criterion('tenchi_ken_1_2_tandoku', 'Tenchi Ken I & II (Tandoku)', 10, 'R'),
                $this->criterion('tenchi_ken_1_pasangan', 'Tenchi Ken I (Pasangan)', 10, 'S'),
                $this->criterion('ryuo_ken_1_tandoku', 'Ryuo Ken I (Tandoku)', 10, 'T'),
                $this->criterion('ryuo_ken_1_pasangan', 'Ryuo Ken I (Pasangan)', 10, 'U'),
                $this->criterion('giwa_ken_1_tandoku', 'Giwa Ken I (Tandoku)', 10, 'V'),
            ]),
            $this->group('hokei', 'Hokei So Tai', 'AH', [
                $this->criterion('soto_uke_zuki', 'Soto Uke Zuki (Ura/Omote)', 10, 'X'),
                $this->criterion('soto_uke_geri', 'Soto Uke Geri (Ura/Omote)', 10, 'Y'),
                $this->criterion('uchi_age_zuki', 'Uchi Age Zuki (Ura/Omote)', 10, 'Z'),
                $this->criterion('uchi_age_geri', 'Uchi Age Geri (Ura/Omote)', 10, 'AA'),
                $this->criterion('tsuki_nuki_soto', 'Tsuki Nuki (Soto)', 10, 'AB'),
                $this->criterion('tsuki_nuki_uchi', 'Tsuki Nuki (Uchi)', 10, 'AC'),
                $this->criterion('kiri_nuki_soto', 'Kiri Nuki (Soto)', 10, 'AD'),
                $this->criterion('kiri_nuki_uchi', 'Kiri Nuki (Uchi)', 10, 'AE'),
                $this->criterion('katate_okuri_gote', 'Katate Okuri Gote – Okuri Gatame', 10, 'AF'),
                $this->criterion('okuri_maki_tembin', 'Okuri Maki Tembin', 10, 'AG'),
            ]),
        ]);
    }

    /** @param array<int, array<string, mixed>> $groups */
    private function standardConfig(string $label, string $grandTotalColumn, array $groups): array
    {
        return [
            'label' => $label,
            'uses_theory' => true,
            'theory_maximum' => 100,
            'technique_maximum' => 300,
            'maximum_total' => 400,
            'groups' => $groups,
            'part_a_groups' => ['teknik_1', 'teknik_2'],
            'part_b_groups' => ['hokei'],
            'part_a_column' => null,
            'part_b_column' => null,
            'grand_total_column' => $grandTotalColumn,
        ];
    }

    /** @return array<string, mixed> */
    private function advancedConfig(string $label): array
    {
        $goho = [];
        $juho = [];
        $accuracy = [];
        $appearance = [];

        foreach (range(1, 5) as $number) {
            $goho[] = $this->criterion("goho_{$number}", "Goho {$number}", 10, chr(77 + $number));
            $juho[] = $this->criterion("juho_{$number}", "Juho {$number}", 10, chr(82 + $number));
        }
        foreach (range(1, 6) as $number) {
            $accuracy[] = $this->criterion("embu_ketepatan_{$number}", "Ketepatan {$number}", 10, chr(66 + $number), 'embu');
        }
        foreach (range(1, 4) as $number) {
            $appearance[] = $this->criterion("embu_penampilan_{$number}", "Penampilan {$number}", 10, chr(73 + $number), 'embu');
        }

        return [
            'label' => $label,
            'uses_theory' => false,
            'theory_maximum' => 0,
            'technique_maximum' => 400,
            'maximum_total' => 400,
            'groups' => [
                $this->group('teknik_dasar', 'Teknik Dasar', null, [
                    $this->criterion('dasar_tai', 'Tai Gamae, Tai Sabaki & Umpo Ho', 10, 'G'),
                    $this->criterion('dasar_ukemi', 'Ukemi', 10, 'H'),
                    $this->criterion('dasar_menyerang', 'Teknik Menyerang', 10, 'I'),
                    $this->criterion('dasar_bertahan', 'Teknik Bertahan', 10, 'J'),
                    $this->criterion('dasar_bergerak', 'Bertahan & Menyerang Bergerak', 10, 'K'),
                    $this->criterion('dasar_ken_tandoku', 'Ken (Tandoku)', 40, 'L'),
                    $this->criterion('dasar_ken_sotai', 'Ken (So Tai)', 10, 'M'),
                ]),
                $this->group('teknik_pilihan', 'Teknik Pilihan', null, [...$goho, ...$juho]),
                $this->group('kumi_ketepatan', 'Kumi Embu · Ketepatan', 'I', $accuracy, 'embu', 'X'),
                $this->group('kumi_penampilan', 'Kumi Embu · Penampilan', 'N', $appearance, 'embu', 'Y'),
                $this->group('penerapan', 'Penerapan Teknik', 'AD', [
                    $this->criterion('penerapan_goho', 'Penerapan Goho', 50, 'AB'),
                    $this->criterion('penerapan_juho', 'Penerapan Juho', 50, 'AC'),
                ]),
            ],
            'part_a_groups' => ['teknik_dasar', 'teknik_pilihan', 'kumi_ketepatan', 'kumi_penampilan'],
            'part_b_groups' => ['penerapan'],
            'part_a_column' => 'Z',
            'part_b_column' => 'AD',
            'grand_total_column' => 'AE',
        ];
    }

    /** @param array<int, array<string, mixed>> $criteria */
    private function group(
        string $key,
        string $label,
        ?string $subtotalColumn,
        array $criteria,
        string $sheet = 'main',
        ?string $mainSummaryColumn = null,
    ): array {
        return [
            'key' => $key,
            'label' => $label,
            'max' => array_sum(array_column($criteria, 'max')),
            'subtotal_column' => $subtotalColumn,
            'sheet' => $sheet,
            'main_summary_column' => $mainSummaryColumn,
            'criteria' => $criteria,
        ];
    }

    /** @return array<string, mixed> */
    private function criterion(string $key, string $label, float $max, string $column, string $sheet = 'main'): array
    {
        return compact('key', 'label', 'max', 'column', 'sheet');
    }

    private function numericScore(mixed $value, float $maximum): float
    {
        if ($value === null || $value === '' || ! is_numeric($value)) {
            return 0.0;
        }

        return min($maximum, max(0, (float) $value));
    }

    /** @param array<string, mixed> $scores */
    private function hasEnteredScores(string $trackCode, array $scores): bool
    {
        return collect($this->inputKeys($trackCode))->contains(
            fn (string $key): bool => array_key_exists($key, $scores) && $scores[$key] !== '' && $scores[$key] !== null
        ) || (array_key_exists('_total_score_override', $scores) && $scores['_total_score_override'] !== '' && $scores['_total_score_override'] !== null)
            || ($scores['_status_override'] ?? 'auto') !== 'auto';
    }

    /** @param array<string, mixed> $scores */
    private function onlyInputScores(string $trackCode, array $scores): array
    {
        return collect($this->inputKeys($trackCode))
            ->filter(fn (string $key): bool => array_key_exists($key, $scores))
            ->mapWithKeys(fn (string $key): array => [$key => $scores[$key]])
            ->all();
    }

    /** @param array<string, mixed> $scores */
    private function validatedScores(string $trackCode, array $scores): array
    {
        $config = $this->criteriaConfig()[$trackCode];
        $maximums = [];
        if ($config['uses_theory']) {
            $maximums['theory_history'] = 50;
            $maximums['theory_philosophy'] = 50;
        }
        foreach ($config['groups'] as $group) {
            foreach ($group['criteria'] as $criterion) {
                $maximums[$criterion['key']] = $criterion['max'];
            }
        }

        $validated = [];
        foreach ($maximums as $key => $maximum) {
            $value = $scores[$key] ?? null;
            if ($value === null || $value === '') {
                continue;
            }
            if (! is_numeric($value) || (float) $value < 0 || (float) $value > (float) $maximum) {
                throw ValidationException::withMessages([
                    "scores.{$key}" => "Nilai {$key} harus antara 0 dan {$maximum}.",
                ]);
            }
            $validated[$key] = round((float) $value, 2);
        }

        return $validated;
    }

    /** @return array<int, string> */
    private function inputKeys(string $trackCode): array
    {
        $config = $this->criteriaConfig()[$trackCode] ?? null;
        if (! $config) {
            return [];
        }

        $keys = $config['uses_theory'] ? ['theory_history', 'theory_philosophy'] : [];
        foreach ($config['groups'] as $group) {
            foreach ($group['criteria'] as $criterion) {
                $keys[] = $criterion['key'];
            }
        }

        return $keys;
    }
}
