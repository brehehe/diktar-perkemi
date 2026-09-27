<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Setting;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
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
            'PD' => 'pelatih-daerah-a4.png',
            'WAD' => 'wasit-daerah-a4.png',
            'WAN' => 'wasit-nasional-a4.png',
            'PED' => 'penguji-daerah-a4.png',
            'PEN' => 'penguji-nasional-a4.png',
            'PN' => 'pelatih-nasional-a4.png',
        ],
        'transcript' => [
            'PD' => 'transkrip-background-tanpa-garis.png',
            'WAD' => 'transkrip-background-tanpa-garis.png',
            'WAN' => 'transkrip-background-tanpa-garis.png',
            'PED' => 'transkrip-background-tanpa-garis.png',
            'PEN' => 'transkrip-background-tanpa-garis.png',
            'PN' => 'transkrip-background-tanpa-garis.png',
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

    public const TRANSCRIPT_NUMBER_SUFFIXES = [
        'PD' => 'TR-PLT-DRH',
        'WAD' => 'TR-WST-DRH',
        'WAN' => 'TR-WST-NAS',
        'PED' => 'TR-PGJ-DRH',
        'PEN' => 'TR-PGJ-NAS',
        'PN' => 'TR-PLT-NAS',
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

    public const TRANSCRIPT_NUMBER_LABELS = [
        'PD' => 'E-Transkrip Pelatih Daerah',
        'PN' => 'E-Transkrip Pelatih Nasional',
        'PED' => 'E-Transkrip Penguji Daerah',
        'PEN' => 'E-Transkrip Penguji Nasional',
        'WAD' => 'E-Transkrip Wasit Daerah',
        'WAN' => 'E-Transkrip Wasit Nasional',
    ];

    /**
     * Kurikulum modul & fokus kompetensi resmi PERKEMI untuk transkrip penataran.
     * Sesuai template referensi (PED, PEN, PN, WAD, WAN, PD).
     *
     * @var array<string, array{subtitle: string, total_jp: int, footer_lines: array<int, string>, modules: array<int, array{code: string, title: string, jp: int, fokus: string}>}>
     */
    public const STANDARD_TRACK_MODULES = [
        'PED' => [
            'subtitle' => 'PENATARAN PENGUJI DAERAH',
            'total_jp' => 32,
            'footer_lines' => [
                'Total rancangan Program Penataran Penguji Daerah: 32 JP. Pembagian Teori/Praktik tidak ditampilkan karena sumber modul menetapkan alokasi per modul dalam JP total.',
                'Basis: Modul Penguji Daerah PERKEMI 2026 dan kerangka kompetensi tenaga keolahragaan yang berlaku.',
            ],
            'modules' => [
                [
                    'code' => 'PED-01',
                    'title' => 'Regulasi Ujian, Mandat dan Administrasi',
                    'jp' => 4,
                    'fokus' => 'Alur ujian, mandat PB, eligibility, administrasi peserta, dokumentasi, audit trail dan pelaporan.',
                ],
                [
                    'code' => 'PED-02',
                    'title' => 'Prinsip Assessment Shorinji Kempo',
                    'jp' => 6,
                    'fokus' => 'Penilaian komprehensif ajaran, teknik, perilaku dan sikap; evidence, criteria, decision rules dan feedback.',
                ],
                [
                    'code' => 'PED-03',
                    'title' => 'Kurikulum Kyu–Dan dan Kriteria Teknik',
                    'jp' => 6,
                    'fokus' => 'Kurikulum Kyu/Yudansha, examination contents, Kihon, Hokei, Embu/ Randori dan pemetaan kriteria observabel.',
                ],
                [
                    'code' => 'PED-04',
                    'title' => 'Teknik Observasi, Score Sheet dan Kalibrasi',
                    'jp' => 6,
                    'fokus' => 'Observasi, anchoring, bias, inter-rater reliability, independent scoring, konsensus dan kalibrasi panel.',
                ],
                [
                    'code' => 'PED-05',
                    'title' => 'Simulasi Ujian dan Oral/Administrative Examination',
                    'jp' => 5,
                    'fokus' => 'Candidate briefing, ujian tertulis/lisan, technical assessment, decision conference dan feedback.',
                ],
                [
                    'code' => 'PED-06',
                    'title' => 'Etika Penguji, Konflik Kepentingan dan Laporan',
                    'jp' => 5,
                    'fokus' => 'Impartiality, conflict of interest, confidentiality, appeal awareness, integritas dan laporan hasil.',
                ],
            ],
        ],
        'PEN' => [
            'subtitle' => 'PENATARAN PENGUJI NASIONAL',
            'total_jp' => 40,
            'footer_lines' => [
                'Total rancangan Program Penataran Penguji Nasional: 40 JP. Pembagian Teori/Praktik tidak ditampilkan karena sumber modul menetapkan alokasi per modul dalam JP total.',
                'Basis: Modul Penguji Nasional PERKEMI 2026 dan kerangka kompetensi tenaga keolahragaan yang berlaku.',
            ],
            'modules' => [
                [
                    'code' => 'PEN-01',
                    'title' => 'Governance Ujian dan Tanggung Jawab Penguji Nasional',
                    'jp' => 4,
                    'fokus' => 'Mengelola ujian sesuai kewenangan nasional dan mandat PB.',
                ],
                [
                    'code' => 'PEN-02',
                    'title' => 'Assessment Filosofi, Teknik dan Perilaku Tingkat Lanjut',
                    'jp' => 7,
                    'fokus' => 'Mengintegrasikan kurikulum Yudansha, filosofi dan bukti performa.',
                ],
                [
                    'code' => 'PEN-03',
                    'title' => 'Advanced Technical Standardization & Kyohan',
                    'jp' => 7,
                    'fokus' => 'Kalibrasi teknik lanjutan, prinsip aplikasi dan standar demonstrasi.',
                ],
                [
                    'code' => 'PEN-04',
                    'title' => 'Reliabilitas, Validitas dan Moderasi Nilai',
                    'jp' => 6,
                    'fokus' => 'Mengurangi bias, menyamakan standar, moderasi hasil dan audit score sheet.',
                ],
                [
                    'code' => 'PEN-05',
                    'title' => 'Simulasi Ujian Dan dan Case Conference',
                    'jp' => 8,
                    'fokus' => 'Simulasi panel, wawancara, technical assessment, diskusi keputusan.',
                ],
                [
                    'code' => 'PEN-06',
                    'title' => 'Etika, Dokumentasi, Laporan dan Mentoring',
                    'jp' => 4,
                    'fokus' => 'Menjaga integritas, jejak audit, laporan dan membina Penguji Daerah.',
                ],
                [
                    'code' => 'PEN-07',
                    'title' => 'Praktik Ujian Terintegrasi',
                    'jp' => 4,
                    'fokus' => 'Ujian praktik penguji dari persiapan hingga rekomendasi hasil.',
                ],
            ],
        ],
        'PN' => [
            'subtitle' => 'PENATARAN PELATIH NASIONAL',
            'total_jp' => 52,
            'footer_lines' => [
                'Total JP Program Pengelaran Pelatih Nasional: 52 JP. Pembagian Teori/Praktik tidak ditampilkan karena sumber modul menetapkan alokasi per modul dalam JP total.',
                'Basis: Modul Pelatih Nasional PERKEMI 2026 dan Kerangka Kompetensi Tenaga Keolahragaan yang Berlaku.',
            ],
            'modules' => [
                [
                    'code' => 'PN-01',
                    'title' => 'Kepemimpinan Pelatih Nasional dan Tata Kelola',
                    'jp' => 4,
                    'fokus' => 'Pembinaan lintas wilayah, etika, mandat, koordinasi dan akuntabilitas.',
                ],
                [
                    'code' => 'PN-02',
                    'title' => 'Filosofi Lanjutan, Kepemimpinan dan Gyo',
                    'jp' => 5,
                    'fokus' => 'Pendalaman Yudansha 4-6 Dan, kepemimpinan, pengembangan manusia dan penerapan ajaran.',
                ],
                [
                    'code' => 'PN-03',
                    'title' => 'Kurikulum Yudansha, Kyohan dan Standardisasi Teknik',
                    'jp' => 7,
                    'fokus' => 'Standardisasi teknik dan keterkaitan kurikulum 2nd-6th Dan dengan pengajaran.',
                ],
                [
                    'code' => 'PN-04',
                    'title' => 'Periodisasi, Analisis Performa dan Persiapan Kompetisi',
                    'jp' => 8,
                    'fokus' => 'Program berbasis data, target performa, kompetisi dan evaluasi.',
                ],
                [
                    'code' => 'PN-05',
                    'title' => 'Coach Education, Mentoring dan Pengembangan Pelatih',
                    'jp' => 6,
                    'fokus' => 'Pembinaan Pelatih Daerah, mentoring, feedback, lesson study dan pengembangan berkelanjutan.',
                ],
                [
                    'code' => 'PN-06',
                    'title' => 'K3, Cedera, Pemulihan dan Manajemen Risiko',
                    'jp' => 5,
                    'fokus' => 'Manajemen risiko, koordinasi medis, return-to-training dan keselamatan.',
                ],
                [
                    'code' => 'PN-07',
                    'title' => 'Praktik Kepelatihan Nasional dan Case Conference',
                    'jp' => 9,
                    'fokus' => 'Simulasi lintas dojo/provinsi, microteaching tingkat lanjut dan pemecahan kasus.',
                ],
                [
                    'code' => 'PN-08',
                    'title' => 'Aktualisasi dan Laporan Program',
                    'jp' => 8,
                    'fokus' => 'Rancangan aktualisasi 2-3 bulan, indikator, evidence dan presentasi.',
                ],
            ],
        ],
        'WAD' => [
            'subtitle' => 'PENATARAN WASIT DAERAH',
            'total_jp' => 32,
            'footer_lines' => [
                'Total rancangan Program Penataran Wasit Daerah: 32 JP. Pembagian Teori/Praktik tidak ditampilkan karena sumber modul menetapkan alokasi per modul dalam JP total.',
                'Basis: Modul Wasit Daerah PERKEMI 2026 dan kerangka kompetensi tenaga keolahragaan yang berlaku.',
            ],
            'modules' => [
                [
                    'code' => 'WAD-01',
                    'title' => 'Tata Kelola Kejuaraan, Mandat dan Kewenangan',
                    'jp' => 4,
                    'fokus' => 'Menguasai level kejuaraan, penugasan, mandat dan struktur kerja perwasitan.',
                ],
                [
                    'code' => 'WAD-02',
                    'title' => 'Peraturan Permainan, Pertandingan dan Kejuaraan',
                    'jp' => 8,
                    'fokus' => 'Memahami dan menerapkan peraturan pertandingan PERKEMI yang berlaku; detail angka/sanksi mengikuti regulasi PB terbaru.',
                ],
                [
                    'code' => 'WAD-03',
                    'title' => 'Teknik Perwasitan dan Positioning',
                    'jp' => 8,
                    'fokus' => 'Komunikasi, positioning, observasi, sinyal, teamwork dan decision making.',
                ],
                [
                    'code' => 'WAD-04',
                    'title' => 'Fair Play, Konflik Kepentingan dan Disiplin',
                    'jp' => 4,
                    'fokus' => 'Objektivitas, ketidakberpihakan, konflik kepentingan dan komunikasi keputusan.',
                ],
                [
                    'code' => 'WAD-05',
                    'title' => 'Simulasi Pertandingan dan Video Review',
                    'jp' => 8,
                    'fokus' => 'Praktik memimpin/menilai pertandingan, review video dan kalibrasi.',
                ],
            ],
        ],
        'WAN' => [
            'subtitle' => 'PENATARAN WASIT NASIONAL',
            'total_jp' => 40,
            'footer_lines' => [
                'Total rancangan Program Penataran Wasit Nasional: 40 JP. Pembagian Teori/Praktik tidak ditampilkan karena sumber modul menetapkan alokasi per modul dalam JP total.',
                'Basis: Modul Wasit Nasional PERKEMI 2026 dan kerangka kompetensi tenaga keolahragaan yang berlaku.',
            ],
            'modules' => [
                [
                    'code' => 'WAN-01',
                    'title' => 'Tata Kelola Kejuaraan, Mandat dan Kewenangan Nasional',
                    'jp' => 4,
                    'fokus' => 'Mengelola kewenangan, penugasan dan tata kerja perwasitan pada level nasional.',
                ],
                [
                    'code' => 'WAN-02',
                    'title' => 'Peraturan Permainan, Pertandingan dan Kejuaraan Tingkat Nasional',
                    'jp' => 10,
                    'fokus' => 'Menerapkan peraturan pertandingan/kejuaraan yang berlaku secara konsisten dan akurat.',
                ],
                [
                    'code' => 'WAN-03',
                    'title' => 'Teknik Perwasitan, Positioning dan Decision Making',
                    'jp' => 8,
                    'fokus' => 'Mengembangkan positioning, observasi sinyal, komunikasi panel dan pengambilan keputusan.',
                ],
                [
                    'code' => 'WAN-04',
                    'title' => 'Fair Play, Konflik Kepentingan dan Disiplin Perwasitan',
                    'jp' => 4,
                    'fokus' => 'Menjaga objektivitas, integritas, ketidakberpihakan dan disiplin dalam penugasan.',
                ],
                [
                    'code' => 'WAN-05',
                    'title' => 'Simulasi Pertandingan, Video Review dan Kalibrasi',
                    'jp' => 8,
                    'fokus' => 'Memimpin/menilai simulasi, melakukan video review dan menyamakan standar keputusan.',
                ],
                [
                    'code' => 'WAN-06',
                    'title' => 'Praktik Perwasitan Nasional Terintegrasi',
                    'jp' => 6,
                    'fokus' => 'Praktik terintegrasi dari persiapan, officiating, evaluasi, hingga laporan pertandingan.',
                ],
            ],
        ],
        'PD' => [
            'subtitle' => 'PENATARAN PELATIH DAERAH',
            'total_jp' => 32,
            'footer_lines' => [
                'Total rancangan Program Penataran Pelatih Daerah: 32 JP. Pembagian Teori/Praktik tidak ditampilkan karena sumber modul menetapkan alokasi per modul dalam JP total.',
                'Basis: Modul Pelatih Daerah PERKEMI 2026 dan kerangka kompetensi tenaga keolahragaan yang berlaku.',
            ],
            'modules' => [
                [
                    'code' => 'PD-01',
                    'title' => 'Regulasi, AD/ART, Tata Kelola & Administrasi PB PERKEMI',
                    'jp' => 3,
                    'fokus' => 'Hirarki norma, AD/ART, mandat, kewenangan, organisasi, administrasi, dan etika.',
                ],
                [
                    'code' => 'PD-02',
                    'title' => 'Filosofi, Sejarah, Ajaran & Pendidikan Karakter Shorinji Kempo',
                    'jp' => 3,
                    'fokus' => 'Falsafah, sejarah, nilai persaudaraan, Gyo, Shu-Ha-Ri, karakter, dan integritas.',
                ],
                [
                    'code' => 'PD-03',
                    'title' => 'Kurikulum Kyu-Dan, Kriteria Teknik & Standardisasi WSKO',
                    'jp' => 5,
                    'fokus' => 'Standardisasi teknik Kihon, Hokei, Goho/Juho, dan kriteria penilaian.',
                ],
                [
                    'code' => 'PD-04',
                    'title' => 'Metodologi Kepelatihan & Program Latihan Dojo',
                    'jp' => 5,
                    'fokus' => 'Penyusunan program latihan dojo, periodisasi dasar, dan manajemen latihan.',
                ],
                [
                    'code' => 'PD-05',
                    'title' => 'Praktik Mengajar (Microteaching) & Evaluasi Teknik',
                    'jp' => 5,
                    'fokus' => 'Simulasi mengajar, komunikasi instruksi, koreksi teknik, dan umpan balik.',
                ],
                [
                    'code' => 'PD-06',
                    'title' => 'Sport Science, Fisik, Kebugaran & Psikologi Olahraga',
                    'jp' => 4,
                    'fokus' => 'Kebugaran fisik, stamina, conditioning dasar, dan motivasi atlet dojo.',
                ],
                [
                    'code' => 'PD-07',
                    'title' => 'K3, Cedera, Pertolongan Pertama & Manajemen Risiko',
                    'jp' => 3,
                    'fokus' => 'Pencegahan cedera, pertolongan pertama pada kecelakaan latihan, dan keselamatan.',
                ],
                [
                    'code' => 'PD-08',
                    'title' => 'Praktik Terstruktur, Simulasi Kepelatihan & Portofolio',
                    'jp' => 4,
                    'fokus' => 'Praktik lapangan terstruktur, asesmen kompetensi, dan penyusunan portofolio.',
                ],
            ],
        ],
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

        if ($type === 'transcript' && ! isset(self::STANDARD_TRACK_MODULES[$trackCode])) {
            $moduleCount = $event->modules
                ->filter(fn ($module) => in_array($trackCode, $module->track_codes ?? [], true))
                ->count();

            if ($moduleCount < 1 || $moduleCount > 8) {
                return "Transkrip otomatis jalur {$trackCode} memerlukan 1–8 modul pada event ini. Gunakan unggah PDF manual.";
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

        $certNumField = self::documentField('certificate', 'number', $eventParticipant->track_code, $trackCode);
        $numberField = self::documentField($type, 'number', $eventParticipant->track_code, $trackCode);

        if ($type === 'transcript') {
            if ($eventParticipant->{$certNumField} && ! $this->isLegacyDualPlaceholder($eventParticipant, $eventParticipant->{$certNumField})) {
                return $eventParticipant->{$certNumField};
            }
        }

        if ($eventParticipant->{$numberField} && ! $this->isLegacyDualPlaceholder($eventParticipant, $eventParticipant->{$numberField})) {
            return $eventParticipant->{$numberField};
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
        $settings = $this->effectiveNumberSettings($event, $trackCode, $type);
        $sequence = $settings['start'] + $this->sequenceOffset($event, $eventParticipant, $trackCode);
        $padLength = $settings['pad_length'] ?? 3;
        $formattedSequence = sprintf('%0'.$padLength.'d', $sequence);

        return sprintf(
            '%s/%s/%s/%s',
            $formattedSequence,
            $settings['prefix'],
            self::ROMAN_MONTHS[$issuedAt->month - 1],
            $issuedAt->format('Y')
        );
    }

    /** @return array<string, array{prefix: string, start: int, pad_length: int, raw_start: string}> */
    public function adminNumberSettings(): array
    {
        $saved = $this->savedAdminNumberSettings();
        $settings = [];

        foreach (self::NUMBER_LABELS as $trackCode => $label) {
            $prefix = trim($saved[$this->settingKey($trackCode, 'prefix')] ?? '');
            $rawStart = $saved[$this->settingKey($trackCode, 'start')] ?? null;
            $start = filled($rawStart) ? (int) $rawStart : 1;
            $padLength = filled($rawStart) ? max(3, strlen((string) $rawStart)) : 3;
            $settings[$trackCode] = [
                'prefix' => $prefix !== '' ? $prefix : self::NUMBER_SUFFIXES[$trackCode],
                'start' => max(1, $start),
                'pad_length' => $padLength,
                'raw_start' => filled($rawStart) ? (string) $rawStart : sprintf('%0'.$padLength.'d', max(1, $start)),
            ];
        }

        return $settings;
    }

    /** @return array<string, array{prefix: string, start: int, pad_length: int, raw_start: string}> */
    public function adminTranscriptNumberSettings(?Event $event = null): array
    {
        return $this->adminNumberSettings();
    }

    /** @return array{prefix: string, start: int, pad_length: int, raw_start: string} */
    public function effectiveNumberSettings(Event $event, string $trackCode, string $type = 'certificate'): array
    {
        $defaults = $this->adminNumberSettings()[$trackCode];
        $override = $event->document_number_settings['certificate'][$trackCode]
            ?? $event->document_number_settings[$trackCode]
            ?? [];
        $rawStart = $override['start'] ?? null;
        $start = filled($rawStart) ? (int) $rawStart : $defaults['start'];
        $padLength = filled($rawStart) ? max(3, strlen((string) $rawStart)) : ($defaults['pad_length'] ?? 3);

        return [
            'prefix' => filled($override['prefix'] ?? null) ? trim($override['prefix']) : $defaults['prefix'],
            'start' => $start,
            'pad_length' => $padLength,
            'raw_start' => filled($rawStart) ? (string) $rawStart : sprintf('%0'.$padLength.'d', $start),
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
        $overlays = $this->certificateOverlays($eventParticipant, $certificateNumber, $trackCode);

        return $this->createPdf(
            $this->templatePath('certificate', $trackCode),
            $overlays,
            "Sertifikat {$eventParticipant->participant?->name}"
        );
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function certificateOverlays(EventParticipant $eventParticipant, string $certificateNumber, ?string $documentTrackCode = null): array
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
        // Canvas: 3508 x 2480 px, full page landscape A4 PDF (841.89 x 595.28 pt)
        // Watermark logo on bottom-left: x: [816, 1071], y: [1847, 2157]
        // Top-right corner track badge: x: [2410, 3464], y: [80, 215]

        $overlays = [];

        // --- Header block ---
        // Centered across the full A4 landscape page (center = 1754) with generous clearance below top-right badge
        $headerCenterX = 1754;
        $dark = [0.05, 0.05, 0.05];

        $overlays[] = $this->centeredText('PERSAUDARAAN SHORINJI KEMPO INDONESIA', $headerCenterX, 305, 68, true, $dark);
        $overlays[] = $this->centeredText('(INDONESIA SHORINJI KEMPO FEDERATION)', $headerCenterX, 375, 44, false, $dark);

        // --- Certificate title (centered across full page) ---
        $certTitle = match ($trackCode) {
            'PED' => 'SERTIFIKAT PENGUJI SHORINJI KEMPO DAERAH',
            'PEN' => 'SERTIFIKAT PENGUJI SHORINJI KEMPO NASIONAL',
            'PN' => 'SERTIFIKAT PELATIH SHORINJI KEMPO NASIONAL',
            'PD' => 'SERTIFIKAT PELATIH SHORINJI KEMPO DAERAH',
            'WAD' => 'SERTIFIKAT WASIT SHORINJI KEMPO DAERAH',
            'WAN' => 'SERTIFIKAT WASIT SHORINJI KEMPO NASIONAL',
            default => 'SERTIFIKAT',
        };
        $titleCenterX = 1754;
        $titleY = 515;
        $titleFontSize = 74;
        $overlays[] = $this->centeredText($certTitle, $titleCenterX, $titleY, $titleFontSize, true, $dark);

        // --- Nomor line with flanking gold rules (widened symmetrically) ---
        $nomorY = 625;
        $nomorSize = 52;
        $nomorLabel = 'Nomor :';
        $nomorNum = (string) $certificateNumber;
        $nomorGap = 28;
        $labelWidth = $this->textWidth($nomorLabel, $nomorSize, true);
        $numWidth = $this->textWidth($nomorNum, $nomorSize, false);
        $totalNomorWidth = $labelWidth + $nomorGap + $numWidth;
        $nomorStartX = $titleCenterX - ($totalNomorWidth / 2);
        $nomorEndX = $nomorStartX + $totalNomorWidth;

        // Content margins widened symmetrically: left = 450, right = 3058 (center = 1754)
        $contentLeft = 450;
        $contentRight = 3058;
        $goldColor = [0.85, 0.70, 0.20];
        $overlays[] = $this->coloredRectangle($contentLeft, $nomorY - 14, max(20, $nomorStartX - 42 - $contentLeft), 5.2, $goldColor);
        $overlays[] = $this->coloredRectangle($nomorEndX + 42, $nomorY - 14, max(20, $contentRight - ($nomorEndX + 42)), 5.2, $goldColor);

        // Nomor text (single instance, no duplicates)
        $overlays[] = $this->text($nomorLabel, $nomorStartX, $nomorY, $nomorSize, true, $dark);
        $overlays[] = $this->text($nomorNum, $nomorStartX + $labelWidth + $nomorGap, $nomorY, $nomorSize, false, $dark);

        // --- Body paragraph opening ---
        $overlays[] = $this->text(
            'Pengurus Besar Persaudaraan Shorinji Kempo Indonesia menyatakan bahwa :',
            $contentLeft, 770, 60, false, $dark
        );

        // --- Participant data fields (widened and well-proportioned) ---
        $labelX = 550;
        $colonX = 1400;
        $dataX = 1480;
        $fieldSize = 60;

        $fields = [
            ['Nama Lengkap', 895],
            ['Tingkat', 995],
            ['Nomor Induk Kenshi (NIK)', 1095],
            ['Tempat/Tanggal Lahir', 1195],
            ['Provinsi', 1295],
        ];

        foreach ($fields as [$label, $fieldY]) {
            $overlays[] = $this->text($label, $labelX, $fieldY, $fieldSize, false, $dark);
            $overlays[] = $this->text(':', $colonX, $fieldY, $fieldSize, false, $dark);
        }

        // --- Participant data values ---
        if ($participant?->name) {
            $overlays[] = $this->text(
                $participant->name,
                $dataX, 895,
                62,
                true, $dark
            );
        }

        $danRoman = $this->danRoman($participant?->dan_rank);
        if ($danRoman) {
            $overlays[] = $this->text($danRoman, $dataX, 995, $fieldSize, true, $dark);
            $danWidth = $this->textWidth($danRoman, $fieldSize, true);
            $overlays[] = $this->text('- DAN', $dataX + $danWidth + 32, 995, $fieldSize, false, $dark);
        }

        if ($participant?->kenshi_id_number) {
            $overlays[] = $this->text($participant->kenshi_id_number, $dataX, 1095, $fieldSize, false, $dark);
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
        $overlays[] = $this->text($ttl, $dataX, 1195, $fieldSize, false, $dark);

        $originProvince = trim(explode('/', (string) ($participant?->origin_province ?? ''))[0]);
        if ($originProvince !== '') {
            $overlays[] = $this->text($originProvince, $dataX, 1295, $fieldSize, false, $dark);
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

        $bodySize = 62;
        $bodyY = 1445;
        $lineSpacing = 92;

        // Line 1: Dikukuhkan sebagai [ROLE], [line1End] (justified from contentLeft to contentRight)
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

        // --- Participant photo (pas foto) on the left side of Ketua Umum signature ---
        // Shifted to the right (photoX = 1260) to provide a clean, generous gap from the watermark logo (ends at 1071)
        $photoPath = $participant?->photo_path;
        if ($photoPath && Storage::disk('public')->exists($photoPath)) {
            $fullPhotoPath = Storage::disk('public')->path($photoPath);
            if (is_readable($fullPhotoPath)) {
                $photoW = 280;
                $photoH = 373;
                $photoX = 1260;
                $photoTop = 1800;

                // Gold frame & white matting around photo
                $overlays[] = $this->coloredRectangle($photoX - 4, $photoTop - 4, $photoW + 8, $photoH + 8, [0.85, 0.70, 0.20]);
                $overlays[] = $this->whiteRectangle($photoX - 2, $photoTop - 2, $photoW + 4, $photoH + 4);
                $overlays[] = $this->imageOverlay($fullPhotoPath, $photoX, $photoTop, $photoW, $photoH, true);
            }
        }

        // --- Signature block ---
        // Centered between photo right edge (1540) and right margin (3058)
        $sigCenterX = 2350;
        $sigY = 1825;

        $cityDateLine = "{$sigSettings['city']}, {$sigSettings['date_formatted']}";
        $overlays[] = $this->centeredText($cityDateLine, $sigCenterX, $sigY, 51, false, $dark);

        $orgLine = $sigSettings['organization'];
        $overlays[] = $this->centeredText($orgLine, $sigCenterX, $sigY + 75, 58, true, $dark);

        $posLine = $sigSettings['position'];
        $overlays[] = $this->centeredText($posLine, $sigCenterX, $sigY + 140, 53, false, $dark);

        // Signature image
        if (! empty($sigSettings['signature_path']) && Storage::disk('public')->exists($sigSettings['signature_path'])) {
            $fullSigPath = Storage::disk('public')->path($sigSettings['signature_path']);
            if (is_readable($fullSigPath)) {
                $sigW = 440;
                $sigH = 150;
                $overlays[] = $this->imageOverlay($fullSigPath, $sigCenterX - ($sigW / 2), $sigY + 150, $sigW, $sigH);
            }
        }

        // Signer name (without underline)
        $nameLine = $sigSettings['signer_name'];
        $overlays[] = $this->centeredText($nameLine, $sigCenterX, $sigY + 350, 56, false, $dark);

        return $overlays;
    }

    public function generateTranscript(EventParticipant $eventParticipant, string $transcriptNumber, ?string $documentTrackCode = null): string
    {
        $trackCode = self::resolveDocumentTrack($eventParticipant->track_code, $documentTrackCode);
        $overlays = $this->transcriptOverlays($eventParticipant, $transcriptNumber, $trackCode);

        return $this->createPdf(
            $this->templatePath('transcript', $trackCode),
            $overlays,
            "Transkrip {$eventParticipant->participant?->name}"
        );
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function transcriptOverlays(EventParticipant $eventParticipant, string $transcriptNumber, ?string $documentTrackCode = null): array
    {
        $trackCode = self::resolveDocumentTrack($eventParticipant->track_code, $documentTrackCode);
        $eventParticipant->loadMissing(['participant', 'event']);
        $participant = $eventParticipant->participant;
        $event = $eventParticipant->event;

        $overlays = [];

        // Canvas: 1685 x 1192 px, landscape A4 PDF
        $titleCenterX = 843;
        $dark = [0.05, 0.05, 0.05];

        // === Header block (matching user screenshot) ===
        // PERSAUDARAAN SHORINJI KEMPO INDONESIA
        // (INDONESIA SHORINJI KEMPO FEDERATION)
        // TRANSKRIP KOMPETENSI & REKAPITULASI PROGRAM
        // [SUBTITLE]
        $overlays[] = $this->centeredText('PERSAUDARAAN SHORINJI KEMPO INDONESIA', $titleCenterX, 125, 30, true, $dark);
        $overlays[] = $this->centeredText('(INDONESIA SHORINJI KEMPO FEDERATION)', $titleCenterX, 162, 21, false, $dark);
        $overlays[] = $this->centeredText('TRANSKRIP KOMPETENSI & REKAPITULASI PROGRAM', $titleCenterX, 208, 32, true, $dark);

        $trackData = self::STANDARD_TRACK_MODULES[$trackCode] ?? null;

        if ($trackData) {
            $transcriptSubtitle = $trackData['subtitle'];
            $modules = collect($trackData['modules'])->map(fn ($m) => (object) [
                'code' => $m['code'],
                'title' => $m['title'],
                'jp' => $m['jp'],
                'fokus' => $m['fokus'],
            ]);
            $totalJP = $trackData['total_jp'];
            $footerLines = $trackData['footer_lines'] ?? null;
        } else {
            $transcriptSubtitle = match ($trackCode) {
                'PED' => 'PENATARAN PENGUJI DAERAH',
                'PEN' => 'PENATARAN PENGUJI NASIONAL',
                'PN' => 'PENATARAN PELATIH NASIONAL',
                'PD' => 'PENATARAN PELATIH DAERAH',
                'WAD' => 'PENATARAN WASIT DAERAH',
                'WAN' => 'PENATARAN WASIT NASIONAL',
                default => 'PENATARAN',
            };
            $modules = $event?->modules
                ->filter(fn ($m) => in_array($trackCode, $m->track_codes ?? [], true))
                ->map(fn ($m) => (object) [
                    'code' => $m->code,
                    'title' => $m->title,
                    'jp' => $m->jp,
                    'fokus' => (string) ($m->learning_indicators ?: $m->description ?: 'Kompetensi sesuai modul kegiatan.'),
                ])
                ->values()
                ?? collect();

            if ($modules->isEmpty()) {
                throw new RuntimeException("Tidak ada modul untuk jalur {$trackCode} pada event ini.");
            }
            $totalJP = $modules->sum('jp');
            $footerLines = null;
        }

        $overlays[] = $this->centeredText($transcriptSubtitle, $titleCenterX, 252, 28, true, $dark);

        // Gold divider line (spanning width of the table)
        $tableLeft = 160;
        $tableW = 1365;
        $goldColor = [0.82, 0.65, 0.15];
        $overlays[] = $this->coloredRectangle($tableLeft, 282, $tableW, 2.5, $goldColor);

        // NOTE: No "Nomor :" printed on transcript as requested ("kosongan saja tanpa ada nomor")

        // === Module table (spanning from x=160 to x=1525, width=1365) ===
        $tableTop = 320;
        $headerH = 48;
        $borderColor = [0.15, 0.15, 0.15];

        // Column boundaries: KODE (145), MODUL (490), JP (110), FOKUS (620)
        $colX = [160, 305, 795, 905, 1525];
        $colCenters = [
            160 + (145 / 2), // 232.5
            305 + (490 / 2), // 550.0
            795 + (110 / 2), // 850.0
            905 + (620 / 2), // 1215.0
        ];

        // Header titles (centered in each column)
        $overlays[] = $this->centeredText('KODE', $colCenters[0], $tableTop + 32, 20, true, $dark);
        $overlays[] = $this->centeredText('KOMPETENSI / MODUL', $colCenters[1], $tableTop + 32, 20, true, $dark);
        $overlays[] = $this->centeredText('JP', $colCenters[2], $tableTop + 32, 20, true, $dark);
        $overlays[] = $this->centeredText('FOKUS KOMPETENSI', $colCenters[3], $tableTop + 32, 20, true, $dark);

        // Header bottom border
        $overlays[] = $this->coloredRectangle($tableLeft, $tableTop + $headerH, $tableW, 1.5, $borderColor);

        $count = $modules->count();
        $availableH = 530;
        $rowH = min(88, max(58, (int) ($availableH / max($count, 1))));

        foreach ($modules as $idx => $module) {
            $rowTop = $tableTop + $headerH + ($idx * $rowH);

            // Row bottom border
            $overlays[] = $this->coloredRectangle($tableLeft, $rowTop + $rowH, $tableW, 1.2, $borderColor);

            // Vertical center text baseline
            $centerTextY = $rowTop + (int) ($rowH * 0.58);

            // Col 0: Kode (centered)
            $overlays[] = $this->centeredText((string) $module->code, $colCenters[0], $centerTextY, 18, false, $dark);

            // Col 1: Modul title (left-aligned with padding)
            $titleLines = $this->wrapText((string) $module->title, 46, 2);
            if (count($titleLines) <= 1) {
                $overlays[] = $this->text($titleLines[0] ?? '', $colX[1] + 18, $centerTextY, 17, false, $dark);
            } else {
                $tY0 = $rowTop + (int) ($rowH * 0.38);
                $overlays[] = $this->text($titleLines[0], $colX[1] + 18, $tY0, 16.5, false, $dark);
                $overlays[] = $this->text($titleLines[1], $colX[1] + 18, $tY0 + 23, 16.5, false, $dark);
            }

            // Col 2: JP (centered)
            $overlays[] = $this->centeredText((string) $module->jp, $colCenters[2], $centerTextY, 19, false, $dark);

            // Col 3: Fokus kompetensi (left-aligned with padding)
            $fokusLines = $this->wrapText((string) $module->fokus, 70, 3);
            if (count($fokusLines) <= 1) {
                $overlays[] = $this->text($fokusLines[0] ?? '', $colX[3] + 18, $centerTextY, 15.5, false, $dark);
            } elseif (count($fokusLines) === 2) {
                $fY0 = $rowTop + (int) ($rowH * 0.38);
                $overlays[] = $this->text($fokusLines[0], $colX[3] + 18, $fY0, 15, false, $dark);
                $overlays[] = $this->text($fokusLines[1], $colX[3] + 18, $fY0 + 22, 15, false, $dark);
            } else {
                $fY0 = $rowTop + (int) ($rowH * 0.28);
                $overlays[] = $this->text($fokusLines[0], $colX[3] + 18, $fY0, 14, false, $dark);
                $overlays[] = $this->text($fokusLines[1], $colX[3] + 18, $fY0 + 20, 14, false, $dark);
                $overlays[] = $this->text($fokusLines[2], $colX[3] + 18, $fY0 + 40, 14, false, $dark);
            }
        }

        // Total row
        $totalRowTop = $tableTop + $headerH + ($count * $rowH);
        $totalRowH = 48;

        // Total row bottom border
        $overlays[] = $this->coloredRectangle($tableLeft, $totalRowTop + $totalRowH, $tableW, 1.5, $borderColor);

        // Total text: Centered across Col 0 & Col 1 (x: 160 to 795 -> center = 477.5)
        $overlays[] = $this->centeredText('TOTAL BEBAN PENATARAN', 477.5, $totalRowTop + 32, 20, true, $dark);
        $overlays[] = $this->centeredText((string) $totalJP, $colCenters[2], $totalRowTop + 32, 20, true, $dark);

        // Table outer top border
        $overlays[] = $this->coloredRectangle($tableLeft, $tableTop, $tableW, 1.5, $borderColor);

        // Vertical divider lines for all columns across the whole table
        $totalTableH = $headerH + ($count * $rowH) + $totalRowH;
        foreach ($colX as $cx) {
            $overlays[] = $this->coloredRectangle($cx, $tableTop, 1.5, $totalTableH, $borderColor);
        }

        // Footer note (centered across the canvas, elegant italic matching sample)
        $footerY = $totalRowTop + $totalRowH + 36;
        if ($footerLines && count($footerLines) >= 2) {
            $line1 = $footerLines[0];
            $line2 = $footerLines[1];
        } else {
            $shortSubtitle = ucwords(strtolower(str_replace('PENATARAN ', '', $transcriptSubtitle)));
            $year = $event?->end_date?->format('Y') ?? date('Y');
            $line1 = "Total rancangan Program Penataran {$shortSubtitle}: {$totalJP} JP. Pembagian Teori/Praktik tidak ditampilkan karena sumber modul menetapkan alokasi per modul dalam JP total.";
            $line2 = "Basis: Modul {$shortSubtitle} PERKEMI {$year} dan kerangka kompetensi tenaga keolahragaan yang berlaku.";
        }

        $overlays[] = $this->centeredText($line1, $titleCenterX, $footerY, 15, false, [0.25, 0.25, 0.25], true);
        $overlays[] = $this->centeredText($line2, $titleCenterX, $footerY + 23, 15, false, [0.25, 0.25, 0.25], true);

        return $overlays;
    }

    private function templatePath(string $type, ?string $trackCode): string
    {
        $code = strtoupper((string) $trackCode);

        if ($type === 'certificate') {
            $trackTemplate = match ($code) {
                'PD' => 'pelatih-daerah-a4.png',
                'PN' => 'pelatih-nasional-a4.png',
                'PED' => 'penguji-daerah-a4.png',
                'PEN' => 'penguji-nasional-a4.png',
                'WAD' => 'wasit-daerah-a4.png',
                'WAN' => 'wasit-nasional-a4.png',
                default => 'sertifikat-background-universal.png',
            };

            foreach ([
                resource_path('document-templates/'.self::TEMPLATE_DIR."/{$trackTemplate}"),
                resource_path('document-templates/'.self::TEMPLATE_DIR."/new/{$trackTemplate}"),
            ] as $candidate) {
                if (is_readable($candidate)) {
                    return $candidate;
                }
            }

            $legacyTemplate = match ($code) {
                'PD' => 'pd-certificate-background.png',
                'PN' => 'pn-certificate-background.png',
                'PED' => 'ped-certificate-background.png',
                'PEN' => 'pen-certificate-background.png',
                'WAD' => 'wad-certificate-background.png',
                'WAN' => 'wan-certificate-background.png',
                default => 'sertifikat-background-universal.png',
            };
            $legacyPath = resource_path('document-templates/'.self::TEMPLATE_DIR."/{$legacyTemplate}");
            if (is_readable($legacyPath)) {
                return $legacyPath;
            }
        }

        if ($type === 'transcript') {
            $cleanPath = resource_path('document-templates/'.self::TEMPLATE_DIR.'/transkrip-background-tanpa-garis.png');
            if (is_readable($cleanPath)) {
                return $cleanPath;
            }
        }

        $template = self::TEMPLATES[$type][$code] ?? null;

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
     * @param  iterable<EventParticipant>  $eventParticipants
     */
    public function generateCombinedPdf(iterable $eventParticipants, string $type, string $title): string
    {
        $pages = [];

        foreach ($eventParticipants as $ep) {
            $ep->loadMissing(['participant', 'event']);
            $event = $ep->event;

            foreach (self::documentTracks($ep->track_code) as $docTrack) {
                if (! self::supportsForEvent($event, $type, $docTrack)) {
                    continue;
                }

                $numberField = self::documentField($type, 'number', $ep->track_code, $docTrack);
                $number = $ep->{$numberField} ?: $this->configuredNumber($event, $ep, $type, $docTrack);

                if (! $number) {
                    continue;
                }

                $templatePath = $this->templatePath($type, $docTrack);
                $overlays = $type === 'certificate'
                    ? $this->certificateOverlays($ep, $number, $docTrack)
                    : $this->transcriptOverlays($ep, $number, $docTrack);

                $pages[] = [
                    'templatePath' => $templatePath,
                    'overlays' => $overlays,
                ];
            }
        }

        if (empty($pages)) {
            throw new RuntimeException('Tidak ada dokumen yang dapat dicetak untuk daftar peserta ini.');
        }

        return $this->createMultiPagePdf($pages, $title);
    }

    /**
     * Synchronize event participants' certificate_number & transcript_number with configured sequences (e.g. 001, 002, 003).
     */
    public function syncEventParticipantNumbers(Event $event): int
    {
        $event->loadMissing(['eventParticipants' => fn ($query) => $query->orderBy('id')]);
        $count = 0;

        foreach ($event->eventParticipants as $ep) {
            $ep->setRelation('event', $event);
            $updates = [];

            foreach (self::documentTracks($ep->track_code) as $documentTrack) {
                $certNumField = self::documentField('certificate', 'number', $ep->track_code, $documentTrack);
                $transNumField = self::documentField('transcript', 'number', $ep->track_code, $documentTrack);

                $newNum = $this->configuredNumber($event, $ep, 'certificate', $documentTrack);
                if ($newNum) {
                    if ($ep->{$certNumField} !== $newNum) {
                        $updates[$certNumField] = $newNum;
                    }
                    if ($ep->{$transNumField} !== $newNum) {
                        $updates[$transNumField] = $newNum;
                    }
                }
            }

            if (! empty($updates)) {
                $ep->update($updates);
                $count++;
            }
        }

        return $count;
    }

    /**
     * Regenerate existing or missing document PDFs on disk with latest numbers, signatures, and data.
     *
     * @param  array<int, string>  $types
     * @return array{certificate: int, transcript: int}
     */
    public function regenerateEventDocuments(Event $event, array $types = ['certificate', 'transcript']): array
    {
        $event->loadMissing(['modules', 'eventParticipants' => fn ($q) => $q->with('participant')->orderBy('id')]);
        $sigSettings = $this->effectiveSignatureSettings($event);
        $issuedAt = $sigSettings['parsed_date'] ?? $event->end_date ?? today();
        $counts = ['certificate' => 0, 'transcript' => 0];

        foreach ($event->eventParticipants as $ep) {
            $ep->setRelation('event', $event);

            foreach (self::documentTracks($ep->track_code) as $docTrack) {
                foreach ($types as $type) {
                    if (! self::supportsForEvent($event, $type, $docTrack)) {
                        continue;
                    }

                    $pathField = self::documentField($type, 'file_path', $ep->track_code, $docTrack);
                    $numField = self::documentField($type, 'number', $ep->track_code, $docTrack);
                    $issuedAtField = self::documentField($type, 'issued_at', $ep->track_code, $docTrack);

                    $number = $this->configuredNumber($event, $ep, $type, $docTrack) ?: $ep->{$numField};
                    if (! $number) {
                        continue;
                    }

                    $dir = $type === 'certificate' ? 'event-certificates' : 'event-transcripts';
                    $newPath = "{$dir}/{$event->id}/{$ep->id}/{$docTrack}/".Str::uuid().'.pdf';
                    $oldPath = $ep->{$pathField};

                    try {
                        $pdf = $type === 'certificate'
                            ? $this->generateCertificate($ep, $number, $docTrack)
                            : $this->generateTranscript($ep, $number, $docTrack);

                        Storage::disk('local')->put($newPath, $pdf);

                        if ($oldPath && $oldPath !== $newPath) {
                            Storage::disk('local')->delete($oldPath);
                        }

                        $ep->update([
                            $pathField => $newPath,
                            $numField => $number,
                            $issuedAtField => $issuedAt,
                        ]);

                        $counts[$type]++;
                    } catch (\Throwable $e) {
                        Storage::disk('local')->delete($newPath);
                        report($e);
                    }
                }
            }
        }

        return $counts;
    }

    /**
     * @param  array<int, array{templatePath: string, overlays: array<int, mixed>}>  $pages
     */
    public function createMultiPagePdf(array $pages, string $title): string
    {
        if (empty($pages)) {
            throw new RuntimeException('Daftar halaman kosong.');
        }

        $pageWidth = 841.89;
        $pageHeight = 595.28;

        $objects = [
            1 => '<< /Type /Catalog /Pages 2 0 R >>',
            2 => '', // Updated after all pages are built
            3 => '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>',
            4 => '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold /Encoding /WinAnsiEncoding >>',
            5 => '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Italic /Encoding /WinAnsiEncoding >>',
            6 => '<< /Title ('.$this->pdfText($title).') /Creator (Pustaka Penataran) >>',
        ];

        $nextObjNum = 7;
        $cachedTemplates = [];
        $cachedSignatures = [];
        $kids = [];

        foreach ($pages as $page) {
            $templatePath = $page['templatePath'];
            $overlays = $page['overlays'] ?? [];

            if (! isset($cachedTemplates[$templatePath])) {
                $dimensions = getimagesize($templatePath);
                if ($dimensions === false) {
                    throw new RuntimeException("Template dokumen tidak dapat dibaca: {$templatePath}");
                }

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

                [$w, $h] = $dimensions;
                $tmplObjNum = $nextObjNum++;
                $objects[$tmplObjNum] = "<< /Type /XObject /Subtype /Image /Width {$w} /Height {$h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ".strlen($image)." >>\nstream\n{$image}\nendstream";

                $cachedTemplates[$templatePath] = [
                    'objNum' => $tmplObjNum,
                    'width' => $w,
                    'height' => $h,
                ];
            }

            $tmpl = $cachedTemplates[$templatePath];
            $width = $tmpl['width'];
            $height = $tmpl['height'];
            $scale = min($pageWidth / $width, $pageHeight / $height);
            $offsetX = ($pageWidth - $width * $scale) / 2;
            $offsetY = ($pageHeight - $height * $scale) / 2;

            $content = sprintf("q\n%.6F 0 0 %.6F %.6F %.6F cm\n", $scale, $scale, $offsetX, $offsetY);
            $content .= "q\n{$width} 0 0 {$height} 0 0 cm\n/Im0 Do\nQ\n";

            $pageImageXObjects = [];
            $pageImageStreams = '';
            $imgCount = 0;

            foreach ($overlays as $overlay) {
                if ($overlay['type'] === 'image' && ! empty($overlay['path']) && is_readable($overlay['path'])) {
                    $path = $overlay['path'];
                    $preserveColors = ! empty($overlay['preserve_colors']);

                    if (! $preserveColors && isset($cachedSignatures[$path])) {
                        $cached = $cachedSignatures[$path];
                        $imgCount++;
                        $imName = "/Im{$imgCount}";
                        $pageImageXObjects[$imName] = $cached['objNum'];
                        $pdfY = $height - $overlay['top'] - $overlay['height'];
                        $pageImageStreams .= "q\n{$overlay['width']} 0 0 {$overlay['height']} {$overlay['x']} {$pdfY} cm\n{$imName} Do\nQ\n";

                        continue;
                    }

                    $gd = @imagecreatefromstring((string) file_get_contents($path));
                    if ($gd) {
                        $sw = imagesx($gd);
                        $sh = imagesy($gd);
                        $targetRatio = (float) $overlay['width'] / (float) $overlay['height'];
                        $srcRatio = (float) $sw / (float) $sh;

                        if ($preserveColors && abs($srcRatio - $targetRatio) > 0.05) {
                            if ($srcRatio > $targetRatio) {
                                $cropW = (int) round($sh * $targetRatio);
                                $cropH = $sh;
                                $srcX = (int) round(($sw - $cropW) / 2);
                                $srcY = 0;
                            } else {
                                $cropW = $sw;
                                $cropH = (int) round($sw / $targetRatio);
                                $srcX = 0;
                                $srcY = (int) round(($sh - $cropH) / 2);
                            }

                            $cropped = imagecreatetruecolor($cropW, $cropH);
                            imagealphablending($cropped, false);
                            imagesavealpha($cropped, true);
                            imagecopy($cropped, $gd, 0, 0, $srcX, $srcY, $cropW, $cropH);
                            imagedestroy($gd);
                            $gd = $cropped;
                            $sw = $cropW;
                            $sh = $cropH;
                        }

                        if ($preserveColors) {
                            $maxW = max(360, (int) round($overlay['width'] * 3));
                            $maxH = max(480, (int) round($overlay['height'] * 3));
                            if ($sw > $maxW || $sh > $maxH) {
                                $scale = min($maxW / $sw, $maxH / $sh);
                                $scaledW = (int) max(1, round($sw * $scale));
                                $scaledH = (int) max(1, round($sh * $scale));
                                $scaled = imagecreatetruecolor($scaledW, $scaledH);
                                $white = imagecolorallocate($scaled, 255, 255, 255);
                                imagefilledrectangle($scaled, 0, 0, $scaledW, $scaledH, $white);
                                imagecopyresampled($scaled, $gd, 0, 0, 0, 0, $scaledW, $scaledH, $sw, $sh);
                                imagedestroy($gd);
                                $gd = $scaled;
                                $sw = $scaledW;
                                $sh = $scaledH;
                            } else {
                                $flattened = imagecreatetruecolor($sw, $sh);
                                $white = imagecolorallocate($flattened, 255, 255, 255);
                                imagefilledrectangle($flattened, 0, 0, $sw, $sh, $white);
                                imagecopy($flattened, $gd, 0, 0, 0, 0, $sw, $sh);
                                imagedestroy($gd);
                                $gd = $flattened;
                            }

                            ob_start();
                            imagejpeg($gd, null, 90);
                            $jpegData = (string) ob_get_clean();
                            imagedestroy($gd);

                            $imgObjNum = $nextObjNum++;
                            $objects[$imgObjNum] = "<< /Type /XObject /Subtype /Image /Width {$sw} /Height {$sh} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ".strlen($jpegData)." >>\nstream\n{$jpegData}\nendstream";
                        } else {
                            $maxSigW = max(600, (int) round($overlay['width'] * 3));
                            $maxSigH = max(300, (int) round($overlay['height'] * 3));
                            if ($sw > $maxSigW || $sh > $maxSigH) {
                                $scale = min($maxSigW / $sw, $maxSigH / $sh);
                                $scaledW = (int) max(1, round($sw * $scale));
                                $scaledH = (int) max(1, round($sh * $scale));
                                $scaled = imagecreatetruecolor($scaledW, $scaledH);
                                imagealphablending($scaled, false);
                                imagesavealpha($scaled, true);
                                imagecopyresampled($scaled, $gd, 0, 0, 0, 0, $scaledW, $scaledH, $sw, $sh);
                                imagedestroy($gd);
                                $gd = $scaled;
                                $sw = $scaledW;
                                $sh = $scaledH;
                            }

                            $rgb = '';
                            $alpha = '';
                            $hasAlpha = false;

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
                                        $pixelAlpha = (int) round((127 - $a) * 255 / 127);
                                        $rgb .= chr(0).chr(0).chr(0);
                                        $alpha .= chr($pixelAlpha);
                                    } else {
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
                                $objects[$imgObjNum] = "<< /Type /XObject /Subtype /Image /Width {$sw} /Height {$sh} /ColorSpace /DeviceRGB /BitsPerComponent 8 /SMask {$smaskObjNum} 0 R /Filter /FlateDecode /Length ".strlen($rgbData)." >>\nstream\n{$rgbData}\nendstream";
                                $objects[$smaskObjNum] = "<< /Type /XObject /Subtype /Image /Width {$sw} /Height {$sh} /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode /Length ".strlen($smaskData)." >>\nstream\n{$smaskData}\nendstream";
                            } else {
                                $objects[$imgObjNum] = "<< /Type /XObject /Subtype /Image /Width {$sw} /Height {$sh} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Length ".strlen($rgbData)." >>\nstream\n{$rgbData}\nendstream";
                            }

                            $cachedSignatures[$path] = ['objNum' => $imgObjNum];
                        }

                        $imgCount++;
                        $imName = "/Im{$imgCount}";
                        $pageImageXObjects[$imName] = $imgObjNum;
                        $pdfY = $height - $overlay['top'] - $overlay['height'];
                        $pageImageStreams .= "q\n{$overlay['width']} 0 0 {$overlay['height']} {$overlay['x']} {$pdfY} cm\n{$imName} Do\nQ\n";
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

            $content .= $pageImageStreams."Q\n";

            $xObjectsDict = "/Im0 {$tmpl['objNum']} 0 R";
            foreach ($pageImageXObjects as $name => $objNum) {
                $xObjectsDict .= " {$name} {$objNum} 0 R";
            }

            $contentsObjNum = $nextObjNum++;
            $objects[$contentsObjNum] = '<< /Length '.strlen($content).">> \nstream\n{$content}endstream";

            $pageObjNum = $nextObjNum++;
            $objects[$pageObjNum] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {$pageWidth} {$pageHeight}] /Resources << /XObject << {$xObjectsDict} >> /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents {$contentsObjNum} 0 R >>";

            $kids[] = "{$pageObjNum} 0 R";
        }

        $objects[2] = '<< /Type /Pages /Kids ['.implode(' ', $kids).'] /Count '.count($kids).' >>';

        ksort($objects);

        $pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
        $offsets = [];

        foreach ($objects as $number => $object) {
            $offsets[$number] = strlen($pdf);
            $pdf .= "{$number} 0 obj\n{$object}\nendobj\n";
        }

        $totalObjs = count($objects);
        $xrefOffset = strlen($pdf);
        $pdf .= "xref\n0 ".($totalObjs + 1)."\n";
        $pdf .= "0000000000 65535 f \n";

        for ($num = 1; $num <= $totalObjs; $num++) {
            $pdf .= sprintf("%010d 00000 n \n", $offsets[$num]);
        }

        $pdf .= "trailer\n";
        $pdf .= '<< /Size '.($totalObjs + 1).' /Root 1 0 R /Info 6 0 R >>'."\n";
        $pdf .= "startxref\n{$xrefOffset}\n%%EOF";

        return $pdf;
    }

    /**
     * @param  array<int, array{type: string, x: float, top: float, width?: float, height?: float, text?: string, size?: float, bold?: bool, color?: array<int, float>, path?: string}>  $overlays
     */
    private function createPdf(string $templatePath, array $overlays, string $title): string
    {
        return $this->createMultiPagePdf([
            [
                'templatePath' => $templatePath,
                'overlays' => $overlays,
            ],
        ], $title);
    }

    /** @return array{type: string, path: string, x: float, top: float, width: float, height: float, preserve_colors?: bool} */
    private function imageOverlay(string $path, float $x, float $top, float $width, float $height, bool $preserveColors = false): array
    {
        return compact('path', 'x', 'top', 'width', 'height') + ['type' => 'image', 'preserve_colors' => $preserveColors];
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

        $cleaned = trim((string) preg_replace('/(?:\s*-\s*|\s+)DAN$/iu', '', trim($danRank)));
        $arabicToRoman = [
            '1' => 'I',
            '2' => 'II',
            '3' => 'III',
            '4' => 'IV',
            '5' => 'V',
            '6' => 'VI',
            '7' => 'VII',
            '8' => 'VIII',
        ];

        return $arabicToRoman[$cleaned] ?? $cleaned;
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
        static $romanMetrics = [
            ' ' => 250, '!' => 333, '"' => 408, '#' => 500, '$' => 500, '%' => 833, '&' => 778, '\'' => 333,
            '(' => 333, ')' => 333, '*' => 500, '+' => 564, ',' => 250, '-' => 333, '.' => 250, '/' => 278,
            '0' => 500, '1' => 500, '2' => 500, '3' => 500, '4' => 500, '5' => 500, '6' => 500, '7' => 500, '8' => 500, '9' => 500,
            ':' => 278, ';' => 278, '<' => 564, '=' => 564, '>' => 564, '?' => 444, '@' => 921,
            'A' => 722, 'B' => 667, 'C' => 667, 'D' => 722, 'E' => 611, 'F' => 556, 'G' => 722, 'H' => 722, 'I' => 333, 'J' => 389,
            'K' => 722, 'L' => 611, 'M' => 889, 'N' => 722, 'O' => 722, 'P' => 556, 'Q' => 722, 'R' => 667, 'S' => 556, 'T' => 611,
            'U' => 722, 'V' => 667, 'W' => 944, 'X' => 667, 'Y' => 667, 'Z' => 611,
            '[' => 333, '\\' => 278, ']' => 333, '^' => 469, '_' => 500, '`' => 333,
            'a' => 444, 'b' => 500, 'c' => 444, 'd' => 500, 'e' => 444, 'f' => 278, 'g' => 500, 'h' => 500, 'i' => 278, 'j' => 278,
            'k' => 444, 'l' => 278, 'm' => 778, 'n' => 500, 'o' => 500, 'p' => 500, 'q' => 500, 'r' => 333, 's' => 389, 't' => 278,
            'u' => 500, 'v' => 500, 'w' => 722, 'x' => 500, 'y' => 500, 'z' => 444,
        ];
        static $boldMetrics = [
            ' ' => 250, '!' => 333, '"' => 555, '#' => 500, '$' => 500, '%' => 1000, '&' => 833, '\'' => 333,
            '(' => 333, ')' => 333, '*' => 500, '+' => 570, ',' => 250, '-' => 333, '.' => 250, '/' => 278,
            '0' => 500, '1' => 500, '2' => 500, '3' => 500, '4' => 500, '5' => 500, '6' => 500, '7' => 500, '8' => 500, '9' => 500,
            ':' => 333, ';' => 333, '<' => 570, '=' => 570, '>' => 570, '?' => 500, '@' => 930,
            'A' => 722, 'B' => 667, 'C' => 722, 'D' => 722, 'E' => 667, 'F' => 611, 'G' => 778, 'H' => 778, 'I' => 389, 'J' => 500,
            'K' => 778, 'L' => 667, 'M' => 944, 'N' => 722, 'O' => 778, 'P' => 611, 'Q' => 778, 'R' => 722, 'S' => 556, 'T' => 667,
            'U' => 722, 'V' => 722, 'W' => 1000, 'X' => 722, 'Y' => 722, 'Z' => 667,
            '[' => 333, '\\' => 278, ']' => 333, '^' => 570, '_' => 500, '`' => 333,
            'a' => 500, 'b' => 556, 'c' => 444, 'd' => 556, 'e' => 444, 'f' => 333, 'g' => 500, 'h' => 556, 'i' => 278, 'j' => 333,
            'k' => 556, 'l' => 278, 'm' => 833, 'n' => 556, 'o' => 500, 'p' => 556, 'q' => 556, 'r' => 444, 's' => 389, 't' => 333,
            'u' => 556, 'v' => 500, 'w' => 722, 'x' => 500, 'y' => 500, 'z' => 444,
        ];

        $metrics = $bold ? $boldMetrics : $romanMetrics;
        $totalUnits = 0;
        $len = strlen($text);

        for ($i = 0; $i < $len; $i++) {
            $ch = $text[$i];
            $totalUnits += $metrics[$ch] ?? 500;
        }

        return ($totalUnits / 1000) * $size;
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
