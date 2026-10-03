<?php

namespace Database\Seeders;

use App\Models\CbtExamPackage;
use App\Models\CbtQuestion;
use App\Models\Event;
use App\Models\EventMandate;
use App\Models\EventParticipant;
use App\Models\EventRegistrationForm;
use App\Models\EventRoom;
use App\Models\EventSession;
use App\Models\EventSessionType;
use App\Models\Participant;
use App\Models\ParticipantTrack;
use App\Models\QuestionBank;
use App\Models\QuestionModule;
use App\Models\Speaker;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use PhpOffice\PhpSpreadsheet\IOFactory;

class Surabaya2026UktSeeder extends Seeder
{
    public const EVENT_SLUG = 'gashuku-dan-ujian-kenaikan-tingkat-kota-surabaya-ke-3-tahun-2026';

    public const EVENT_NAME = 'Gashuku & Ujian Kenaikan Tingkat Kota Surabaya Ke-3 Tahun 2026';

    public const EXCEL_BANK_SOAL = 'public/xlsx/Bank_Data_Soal_Kyu_8_sampai_1_200_Soal_Tokuhon60_WSKO40_FINAL.xlsx';

    public const JSON_PARTICIPANTS = 'database/seeders/data/ukt_jatim_sby.json';

    public const JSON_MANDATE_PARTICIPANTS = 'database/seeders/data/ukt_jatim_sby_mandate_participants.json';

    public const MANDATE_PDF = 'public/pdf/109 MANDAT JATIM - KOTA SURABAYA, 03-04 OKT 2026.pdf';

    public function run(): void
    {
        $this->command->info('Memulai Seeder: '.self::EVENT_NAME);

        // 1. Dapatkan atau buat Admin penanggung jawab
        $admin = User::query()->where('role', 'Admin')->first()
            ?? User::query()->updateOrCreate(
                ['email' => 'admin@perkemi.id'],
                [
                    'name' => 'Administrator PB PERKEMI',
                    'password' => Hash::make('password'),
                    'role' => 'Admin',
                    'email_verified_at' => now(),
                ]
            );

        // 2. Pastikan Session Types
        $this->seedSessionTypes();

        // 3. Buat / Update Event Utama UKT Surabaya 2026
        $event = $this->seedEvent($admin);

        // 4. Hubungkan informasi dan bukti Surat Mandat PB PERKEMI
        $this->seedMandate($event);

        // 5. Buat Ruangan Pelaksanaan Event
        $rooms = $this->seedRooms($event);

        // 6. Buat Pembicara / Penguji
        $speakers = $this->seedSpeakers($event);

        // 7. Buat Participant Tracks (KYU 8 sampai KYU 1)
        $tracks = $this->seedParticipantTracks($event);

        // 8. Import Bank Soal dari Excel (8 Modul, 1600 Soal)
        $modules = $this->seedQuestionModulesAndBank($event, $admin);

        // 9. Buat Paket Ujian CBT (8 Paket untuk tiap Kyu, quota default 50 soal)
        $cbtPackages = $this->seedCbtPackages($event, $tracks, $modules);

        // 10. Buat Rundown Sesi Acara (Sabtu 3 Okt & Minggu 4 Okt 2026)
        $this->seedSessions($event, $rooms, $speakers, $cbtPackages);

        // 11. Import 73 Peserta dari SIM Perkemi API Cache
        $this->seedParticipants($event, $tracks);

        $this->command->info('Seeder Selesai! Event, Surat Mandat, Bank Soal (1600 soal), 8 Paket CBT, Rundown, dan 73 Peserta UKT berhasil dipasang.');
    }

    private function seedSessionTypes(): void
    {
        $types = [
            ['code' => 'KEHADIRAN_AWAL', 'name' => 'Registrasi & Kehadiran Awal', 'color' => '#0D9488', 'badge_color' => 'teal'],
            ['code' => 'KEHADIRAN_HARIAN', 'name' => 'Kehadiran Harian', 'color' => '#0284C7', 'badge_color' => 'sky'],
            ['code' => 'PLENO', 'name' => 'Upacara Tradisi & Pleno', 'color' => '#0B63CE', 'badge_color' => 'blue'],
            ['code' => 'PARALEL', 'name' => 'Latihan Teknik / Sesi Pembekalan', 'color' => '#7C3AED', 'badge_color' => 'purple'],
            ['code' => 'UJIAN', 'name' => 'Ujian Tulis Digital CBT & Ujian Teknik', 'color' => '#DC2626', 'badge_color' => 'red'],
            ['code' => 'REFLEKSI', 'name' => 'Evaluasi & Koreksi Teknik', 'color' => '#0E2747', 'badge_color' => 'navy'],
            ['code' => 'PENUTUPAN', 'name' => 'Penutupan Tradisi Shorinji Kempo', 'color' => '#0A3F82', 'badge_color' => 'dark'],
            ['code' => 'OPERASIONAL', 'name' => 'Operasional, Ishoma & Coffee Break', 'color' => '#64748B', 'badge_color' => 'slate'],
        ];

        foreach ($types as $type) {
            EventSessionType::query()->updateOrCreate(['code' => $type['code']], $type);
        }
    }

    private function seedEvent(User $admin): Event
    {
        $event = Event::withTrashed()->updateOrCreate(
            ['slug' => self::EVENT_SLUG],
            [
                'name' => self::EVENT_NAME,
                'title' => self::EVENT_NAME,
                'description' => 'Gashuku & Ujian Kenaikan Tingkat (UKT) Kota Surabaya Ke-3 Tahun 2026 diselenggarakan oleh Pengurus Kota PERKEMI Surabaya. Rangkaian kegiatan meliputi upacara tradisi Shorinji Kempo, pembekalan Tokuhon, latihan teknik terpadu, ujian tulis digital CBT (Tokuhon & WSKO), ujian teknik per-tingkatan kyu, hingga evaluasi dan pengumuman kelulusan resmi.',
                'event_type' => 'ukt',
                'start_date' => Carbon::parse('2026-10-03 00:00:00'),
                'end_date' => Carbon::parse('2026-10-04 23:59:59'),
                'location' => 'Gelanggang Remaja Surabaya, Jl. Bkr Pelajar No.1, Ketabang, Genteng, Kota Surabaya',
                'place' => 'Gelanggang Remaja Surabaya',
                'organizer' => 'Pengurus Kota PERKEMI Surabaya',
                'duration_text' => '2 Hari (03–04 Oktober 2026)',
                'total_effective_jp' => 18,
                'total_schedule_jp' => 20,
                'jp_duration_minutes' => 45,
                'learning_method' => 'Upacara Tradisi, Pembekalan Tokuhon, Latihan Teknik, Ujian Digital CBT, Ujian Teknik, dan Evaluasi Kelulusan',
                'quota' => 200,
                'status' => 'open_registration',
                'access_roles' => ['Peserta', 'Penguji', 'Pelatih', 'Penyelenggara', 'Admin'],
                'responsible_user_id' => $admin->id,
            ]
        );

        if ($event->trashed()) {
            $event->restore();
        }

        return $event;
    }

    private function seedMandate(Event $event): void
    {
        $pdfPath = base_path(self::MANDATE_PDF);

        $mandate = EventMandate::query()->firstOrNew(['event_id' => $event->id]);
        $mandate->fill([
            'letter_number' => '109/MDT-PB/X/2026',
            'title' => 'Surat Mandat Penguji Pemantapan Teknik & UKT',
            'event_name' => 'Pemantapan Teknik dan Ujian Kenaikan Tingkat Kota Surabaya Ke-3 Tahun 2026',
            'source_references' => [
                'Surat PERKEMI Pengurus Provinsi Jawa Timur No. 049/JATIM-KU/IX/2026 tanggal 22 September 2026',
                'Rekomendasi Komisi Diktar PB PERKEMI No. 125/Diktar.PB/IX/2026 tanggal 23 September 2026',
            ],
            'issued_place' => 'Jakarta',
            'issued_at' => Carbon::parse('2026-10-02'),
            'valid_from' => Carbon::parse('2026-10-03'),
            'valid_until' => Carbon::parse('2026-10-04'),
            'venue' => 'Lapangan Futsal UBAYA Sport Center',
            'address' => 'Jl. Kaliwaru I No. 31, Kali Rungkut, Surabaya',
            'province' => 'Jawa Timur',
            'exam_scope' => 'Ujian Kenaikan Tingkat menuju KYU VIII sampai dengan KYU II.',
            'participant_total' => 65,
            'examiners' => [
                ['name' => 'Y. Bernard Laisina', 'rank' => 'DAN V'],
                ['name' => 'Dr. Ihyan Amri, Sp.B.', 'rank' => 'DAN IV'],
                ['name' => 'Maulana Sarip Bathik', 'rank' => 'DAN IV'],
                ['name' => 'Arya Setyanto Wicaksono, S.Si, M.Pd.', 'rank' => 'DAN IV'],
            ],
            'provisions' => [
                'Memenuhi setiap ketentuan administrasi dan teknis ujian yang berlaku.',
                'Setiap kenshi wajib lunas iuran sampai dengan Oktober 2026 untuk mengikuti kegiatan PERKEMI.',
                'Peserta hanya yang tercantum dan telah divalidasi PB PERKEMI; dilarang menambahkan peserta yang belum terdaftar dan divalidasi pengurus.',
                'Hasil ujian wajib dilaporkan melalui F-28, Examination Report WSKO, dan foto kegiatan bertimestamp paling lambat 7 hari kalender setelah pelaksanaan.',
                'Surat mandat hanya berlaku pada tanggal dan tempat yang tercantum.',
                'Mandat dilaksanakan dengan penuh rasa tanggung jawab.',
            ],
            'participant_summary' => [
                ['level' => 'KYU 8', 'count' => 3],
                ['level' => 'KYU 7', 'count' => 2],
                ['level' => 'KYU 6', 'count' => 13],
                ['level' => 'KYU 5', 'count' => 8],
                ['level' => 'KYU 4', 'count' => 10],
                ['level' => 'KYU 3', 'count' => 16],
                ['level' => 'KYU 2', 'count' => 9],
                ['level' => 'KYU 1', 'count' => 4],
            ],
            'participants' => $this->surabayaMandateParticipants(),
            'home_assignments' => $this->surabayaHomeAssignments(),
            'signatory_name' => 'Laksdya TNI (Purn) Prof. Dr. Agus Setiadji, S.A.P, M.A',
            'signatory_title' => 'Pengurus Besar PERKEMI',
        ]);

        if (! filled($mandate->document_path) && file_exists($pdfPath)) {
            $mandate->fill([
                'document_disk' => 'public_path',
                'document_path' => str_replace('public/', '', self::MANDATE_PDF),
                'document_original_name' => basename($pdfPath),
                'document_mime' => 'application/pdf',
                'document_size' => filesize($pdfPath),
            ]);
        }

        $mandate->save();
    }

    /**
     * @return array<int, array{number: int, name: string, nik: string, gender: string, age: string, level: string, dojo: string, branch: string, status: string, notes: string}>
     */
    private function surabayaMandateParticipants(): array
    {
        $payload = json_decode(
            file_get_contents(base_path(self::JSON_MANDATE_PARTICIPANTS)),
            true,
            512,
            JSON_THROW_ON_ERROR,
        );

        return array_map(static function (array $record): array {
            [$number, $name, $nik, $gender, $age, $level, $dojo, $branch] = $record;

            return [
                'number' => $number,
                'name' => $name,
                'nik' => $nik,
                'gender' => $gender,
                'age' => $age,
                'level' => $level,
                'dojo' => $dojo,
                'branch' => $branch,
                'status' => 'approved',
                'notes' => 'Lunas iuran per Okt 2026',
            ];
        }, $payload['records']);
    }

    /**
     * @return array<int, array{level: string, questions: array<int, string>}>
     */
    private function surabayaHomeAssignments(): array
    {
        return [
            ['level' => 'KYU 8', 'questions' => ['Kenapa Anda ingin mempelajari Shorinji Kempo?', 'Sebutkan perilaku dasar seorang Kenshi!']],
            ['level' => 'KYU 7', 'questions' => ['Apa yang menjadi tujuan Doshin So (Kaiso) mendirikan Shorinji Kempo?', 'Bagaimanakah kualitas manusia ideal yang dibangun oleh Shorinji Kempo?']],
            ['level' => 'KYU 6', 'questions' => ['Kenapa Anda ingin mempelajari Shorinji Kempo?', 'Sebutkan perilaku dasar seorang Kenshi!']],
            ['level' => 'KYU 5', 'questions' => ['Apa yang dimaksud dengan kekuatan sejati yang sesungguhnya?', 'Jelaskan Shu shu ko ju (bertahan diutamakan, menyerang kemudian)!']],
            ['level' => 'KYU 4', 'questions' => ['Kenapa Anda belajar Shorinji Kempo?', 'Jelaskan Ken zen ichinyo (kesatuan ken dengan zen)!', 'Jelaskan Kiai, Kisei, dan Kiryoku.']],
            ['level' => 'KYU 3', 'questions' => ['Apa yang menjadi tujuan Doshin So (Kaiso) mendirikan Shorinji Kempo?', 'Jelaskan Fusatsu katsujin!', 'Jelaskan Go ju ittai!']],
            ['level' => 'KYU 2', 'questions' => ['Apa itu Shorinji Kempo?', 'Jelaskan Kumite shutai!', 'Jelaskan lima faktor atau prinsip serangan (atemi)!']],
            ['level' => 'KYU 1', 'questions' => ["Apa itu Ma'ai dan jelaskan jarak untuk menyerang serta bertahan!", 'Jelaskan Riki ai funi!', 'Sebutkan dan jelaskan proses dasar dalam pelatihan!']],
        ];
    }

    /**
     * @return array<string, EventRoom>
     */
    private function seedRooms(Event $event): array
    {
        $rooms = [
            'hall_utama' => 'Gelanggang Remaja Surabaya - Hall Utama',
            'ruang_cbt' => 'Ruang Ujian Digital CBT & Tokuhon',
        ];

        $seeded = [];
        foreach ($rooms as $key => $name) {
            $seeded[$key] = EventRoom::query()->updateOrCreate(
                [
                    'event_id' => $event->id,
                    'name' => $name,
                ],
                [
                    'name' => $name,
                ]
            );
        }

        return $seeded;
    }

    /**
     * @return array<string, Speaker>
     */
    private function seedSpeakers(Event $event): array
    {
        $speakers = [
            'panitia' => [
                'name' => 'PANPEL UKT Surabaya 2026',
                'position' => 'Panitia Pelaksana',
                'organization' => 'Pengkot PERKEMI Surabaya',
                'bio' => 'Panitia Pelaksana Gashuku & Ujian Kenaikan Tingkat Kota Surabaya Ke-3 Tahun 2026.',
            ],
            'penguji_tokuhon' => [
                'name' => 'Dr. Ihyan Amri',
                'title_degree' => 'Sp.B.',
                'dan_rank' => 'IV-DAN',
                'position' => 'Penguji & Pemateri Tokuhon',
                'organization' => 'Pengprov PERKEMI Jawa Timur',
                'bio' => 'Senior Shorinji Kempo, Penguji UKT dan Pemateri Pembekalan Tokuhon Peserta Ujian & Gashuku.',
            ],
            'penguji_bernard' => [
                'name' => 'Y. Bernard Laisina',
                'dan_rank' => 'V-DAN',
                'position' => 'Penguji Mandat PB PERKEMI',
                'organization' => 'PB PERKEMI',
                'bio' => 'Penguji resmi berdasarkan Surat Mandat PB PERKEMI No. 109/MDT-PB/X/2026.',
            ],
            'penguji_maulana' => [
                'name' => 'Maulana Sarip Bathik',
                'dan_rank' => 'IV-DAN',
                'position' => 'Penguji Mandat PB PERKEMI',
                'organization' => 'PB PERKEMI',
                'bio' => 'Penguji resmi berdasarkan Surat Mandat PB PERKEMI No. 109/MDT-PB/X/2026.',
            ],
            'penguji_arya' => [
                'name' => 'Arya Setyanto Wicaksono',
                'title_degree' => 'S.Si, M.Pd.',
                'dan_rank' => 'IV-DAN',
                'position' => 'Penguji Mandat PB PERKEMI',
                'organization' => 'PB PERKEMI',
                'bio' => 'Penguji resmi berdasarkan Surat Mandat PB PERKEMI No. 109/MDT-PB/X/2026.',
            ],
            'tim_penguji' => [
                'name' => 'Tim Dewan Penguji UKT Jatim & Sby',
                'position' => 'Dewan Penguji Daerah & Nasional',
                'organization' => 'Komisi Penguji PERKEMI',
                'bio' => 'Dewan Penguji Tingkat Daerah dan Nasional PERKEMI Jawa Timur & Kota Surabaya.',
            ],
        ];

        $seeded = [];
        foreach ($speakers as $key => $s) {
            $seeded[$key] = Speaker::query()->updateOrCreate(
                ['name' => $s['name']],
                array_merge($s, ['event_id' => $event->id])
            );
        }

        return $seeded;
    }

    /**
     * @return array<string, ParticipantTrack>
     */
    private function seedParticipantTracks(Event $event): array
    {
        $trackConfigs = [
            8 => ['code' => 'KYU-8', 'name' => 'Ujian Ke Tingkat Kyu 8', 'color' => '#10B981'],
            7 => ['code' => 'KYU-7', 'name' => 'Ujian Ke Tingkat Kyu 7', 'color' => '#06B6D4'],
            6 => ['code' => 'KYU-6', 'name' => 'Ujian Ke Tingkat Kyu 6', 'color' => '#0B63CE'],
            5 => ['code' => 'KYU-5', 'name' => 'Ujian Ke Tingkat Kyu 5', 'color' => '#6366F1'],
            4 => ['code' => 'KYU-4', 'name' => 'Ujian Ke Tingkat Kyu 4', 'color' => '#8B5CF6'],
            3 => ['code' => 'KYU-3', 'name' => 'Ujian Ke Tingkat Kyu 3', 'color' => '#D946EF'],
            2 => ['code' => 'KYU-2', 'name' => 'Ujian Ke Tingkat Kyu 2', 'color' => '#F59E0B'],
            1 => ['code' => 'KYU-1', 'name' => 'Ujian Ke Tingkat Kyu 1', 'color' => '#EF4444'],
        ];

        $seeded = [];
        foreach ($trackConfigs as $kyu => $cfg) {
            $seeded[$cfg['code']] = ParticipantTrack::query()->updateOrCreate(
                [
                    'code' => $cfg['code'],
                    'event_id' => $event->id,
                ],
                [
                    'name' => $cfg['name'],
                    'description' => sprintf('Jalur Ujian Kenaikan Tingkat Kyu %d Shorinji Kempo Surabaya 2026', $kyu),
                    'color' => $cfg['color'],
                    'sort_order' => 9 - $kyu,
                    'is_active' => true,
                ]
            );
        }

        return $seeded;
    }

    /**
     * @return array<int, QuestionModule>
     */
    private function seedQuestionModulesAndBank(Event $event, User $admin): array
    {
        $excelPath = base_path(self::EXCEL_BANK_SOAL);
        if (! file_exists($excelPath)) {
            $this->command->error("Berkas Excel Bank Soal tidak ditemukan di: {$excelPath}");

            return [];
        }

        $this->command->info("Membaca Bank Soal dari Excel: {$excelPath}");
        $spreadsheet = IOFactory::load($excelPath);

        $modules = [];

        for ($kyu = 8; $kyu >= 1; $kyu--) {
            $sheetName = "KYU {$kyu}";
            $sheet = $spreadsheet->getSheetByName($sheetName);
            if (! $sheet) {
                $this->command->warn("Sheet {$sheetName} tidak ditemukan.");

                continue;
            }

            $moduleCode = "MOD-UKT-KYU{$kyu}";
            $trackCode = "KYU-{$kyu}";

            $module = QuestionModule::withTrashed()->updateOrCreate(
                ['code' => $moduleCode],
                [
                    'event_id' => $event->id,
                    'title' => "Bank Soal UKT Shorinji Kempo - Kyu {$kyu} (200 Soal)",
                    'slug' => "bank-soal-ukt-kyu-{$kyu}-surabaya-2026",
                    'description' => "Modul Bank Soal Ujian Kenaikan Tingkat (UKT) Shorinji Kempo Kyu {$kyu}. Terdiri dari 200 soal (Tokuhon Indonesia 60% dan WSKO 40%). Diujikan melalui CBT sistem.",
                    'category' => 'Tokuhon & WSKO',
                    'track_codes' => [$trackCode],
                    'tested_competencies' => [
                        'Filosofi & Doktrin Shorinji Kempo (Tokuhon)',
                        'Prinsip Teknik & Peraturan WSKO',
                        'Etika, Disiplin, dan Tradisi Kempo',
                    ],
                    'assessment_indicators' => [
                        'Pemahaman doktrin Seigo / Chito',
                        'Pengetahuan teknik dasar hingga spesifik Kyu',
                        'Aplikasi filosofi kempo dalam kehidupan sehari-hari',
                    ],
                    'evaluation_purpose' => "Standarisasi kelulusan teori UKT Kyu {$kyu} PERKEMI Kota Surabaya 2026.",
                    'default_weight' => 1.00,
                    'passing_grade' => 70.00,
                    'status' => 'active',
                    'created_by' => $admin->id,
                ]
            );

            if ($module->trashed()) {
                $module->restore();
            }

            $modules[$kyu] = $module;

            // Baca 200 baris soal dari sheet
            // Kolom A-M (baris 2 s.d. 201)
            $rows = $sheet->rangeToArray('A2:M201', null, true, true, false);

            $this->command->info(sprintf('Memproses %d butir soal untuk %s...', count($rows), $sheetName));

            $importedCount = 0;
            foreach ($rows as $index => $row) {
                $questionText = trim((string) ($row[6] ?? ''));
                if ($questionText === '') {
                    continue;
                }

                $number = $index + 1;
                $qCode = sprintf('QB-UKT-K%d-%03d', $kyu, $number);

                $options = [];
                if (! empty(trim((string) ($row[7] ?? '')))) {
                    $options[] = ['id' => 'A', 'key' => 'A', 'text' => trim((string) $row[7])];
                }
                if (! empty(trim((string) ($row[8] ?? '')))) {
                    $options[] = ['id' => 'B', 'key' => 'B', 'text' => trim((string) $row[8])];
                }
                if (! empty(trim((string) ($row[9] ?? '')))) {
                    $options[] = ['id' => 'C', 'key' => 'C', 'text' => trim((string) $row[9])];
                }
                if (! empty(trim((string) ($row[10] ?? '')))) {
                    $options[] = ['id' => 'D', 'key' => 'D', 'text' => trim((string) $row[10])];
                }
                if (! empty(trim((string) ($row[11] ?? '')))) {
                    $options[] = ['id' => 'E', 'key' => 'E', 'text' => trim((string) $row[11])];
                }

                $rawAnswer = strtoupper(trim((string) ($row[12] ?? 'A')));
                $correctAnswer = in_array($rawAnswer, ['A', 'B', 'C', 'D', 'E'], true) ? $rawAnswer : 'A';

                $diffStr = strtolower(trim((string) ($row[5] ?? '')));
                $difficulty = str_contains($diffStr, 'mudah') ? 'basic' : (str_contains($diffStr, 'sulit') ? 'advanced' : 'intermediate');

                $qb = QuestionBank::withTrashed()->updateOrCreate(
                    ['code' => $qCode],
                    [
                        'event_id' => $event->id,
                        'question_module_id' => $module->id,
                        'question_text' => $questionText,
                        'question_type' => 'single_choice',
                        'options' => $options,
                        'correct_answer' => $correctAnswer,
                        'points' => 1.00,
                        'difficulty_level' => $difficulty,
                        'exam_stage' => 'post_test',
                        'explanation' => sprintf('Materi: %s • Topik: %s (Kyu %d)', trim((string) ($row[3] ?? '')), trim((string) ($row[1] ?? '')), $kyu),
                        'metadata' => [
                            'prodi' => trim((string) ($row[0] ?? "KYU {$kyu}")),
                            'topic' => trim((string) ($row[1] ?? '')),
                            'category_material' => trim((string) ($row[2] ?? '')),
                            'material' => trim((string) ($row[3] ?? '')),
                            'original_type' => trim((string) ($row[4] ?? '')),
                            'level' => "KYU {$kyu}",
                        ],
                        'status' => 'active',
                        'created_by' => $admin->id,
                    ]
                );

                if ($qb->trashed()) {
                    $qb->restore();
                }

                $qb->questionModules()->sync([$module->id]);
                $importedCount++;
            }

            $this->command->info(sprintf('Sukses mengimpor %d butir soal untuk Modul %s', $importedCount, $moduleCode));
        }

        return $modules;
    }

    /**
     * @param  array<string, ParticipantTrack>  $tracks
     * @param  array<int, QuestionModule>  $modules
     * @return array<int, CbtExamPackage>
     */
    private function seedCbtPackages(Event $event, array $tracks, array $modules): array
    {
        $packages = [];

        for ($kyu = 8; $kyu >= 1; $kyu--) {
            $trackCode = "KYU-{$kyu}";
            $track = $tracks[$trackCode] ?? null;
            $module = $modules[$kyu] ?? null;
            if (! $module) {
                continue;
            }

            $packageCode = "CBT-UKT-KYU{$kyu}-26";
            $title = "Ujian Tulis Digital UKT - Kyu {$kyu} (Surabaya 2026)";

            $package = CbtExamPackage::query()->updateOrCreate(
                ['code' => $packageCode],
                [
                    'event_id' => $event->id,
                    'title' => $title,
                    'description' => "Paket Ujian Kenaikan Tingkat (UKT) Shorinji Kempo Kota Surabaya Ke-3 Tahun 2026 untuk tingkatan Kyu {$kyu}. Bank soal berisi 200 soal (Tokuhon & WSKO). Jumlah soal yang diujikan default 50 butir soal (dapat diubah panitia menjadi 50/60/70 soal dari panel admin blueprint).",
                    'exam_type' => 'theory',
                    'duration_minutes' => 60,
                    'total_questions' => 50,
                    'target_tracks' => [$trackCode],
                    'question_module_id' => $module->id,
                    'question_module_ids' => [$module->id],
                    'question_module_quotas' => [
                        (string) $module->id => [
                            'mode' => 'custom',
                            'count' => 50,
                        ],
                    ],
                    'passing_score' => 70.00,
                    'attempts_allowed' => 1,
                    'status' => 'open',
                    'randomize_questions' => true,
                    'randomize_answers' => false,
                    'result_display' => 'immediate',
                ]
            );

            // Hubungkan butir soal dari QuestionBank
            $bankQuestions = $module->questions()
                ->where('question_bank.status', 'active')
                ->orderBy('question_bank.id')
                ->get();

            $syncData = [];
            foreach ($bankQuestions as $idx => $bq) {
                $syncData[$bq->id] = [
                    'sort_order' => $idx + 1,
                    'points' => 1.00,
                ];
            }
            $package->bankQuestions()->sync($syncData);

            // Sinkronisasi legacy CbtQuestion untuk kompatibilitas pengerjaan ujian runner
            $package->questions()->delete();
            foreach ($bankQuestions as $idx => $bq) {
                $rawAns = $bq->correct_answer;
                $ans = is_array($rawAns) ? ($rawAns[0] ?? 'A') : (string) $rawAns;

                CbtQuestion::create([
                    'cbt_exam_package_id' => $package->id,
                    'question_text' => $bq->question_text,
                    'question_type' => 'single_choice',
                    'options' => $bq->options,
                    'correct_answer' => $ans,
                    'points' => 1.00,
                    'explanation' => $bq->explanation,
                    'sort_order' => $idx + 1,
                    'is_active' => true,
                ]);
            }

            // Hubungkan paket ujian ke event dan track
            $event->linkedCbtPackages()->syncWithoutDetaching([
                $package->id => [
                    'participant_path_id' => $track?->id,
                    'is_required' => true,
                    'sort_order' => 9 - $kyu,
                    'availability_start_at' => Carbon::parse('2026-10-03 15:00:00'),
                    'availability_end_at' => Carbon::parse('2026-10-03 17:00:00'),
                ],
            ]);

            $packages[$kyu] = $package;
        }

        return $packages;
    }

    /**
     * @param  array<string, EventRoom>  $rooms
     * @param  array<string, Speaker>  $speakers
     * @param  array<int, CbtExamPackage>  $cbtPackages
     */
    private function seedSessions(Event $event, array $rooms, array $speakers, array $cbtPackages): void
    {
        // Hapus sesi lama agar idempotent
        EventSession::query()->where('event_id', $event->id)->delete();

        $allTracks = ['KYU-8', 'KYU-7', 'KYU-6', 'KYU-5', 'KYU-4', 'KYU-3', 'KYU-2', 'KYU-1'];
        $hallUtama = $rooms['hall_utama'] ?? null;
        $ruangCbt = $rooms['ruang_cbt'] ?? null;
        $panpel = $speakers['panitia'] ?? null;
        $spIhyan = $speakers['penguji_tokuhon'] ?? null;
        $timPenguji = $speakers['tim_penguji'] ?? null;

        // ════════ HARI 1: SABTU, 03 OKTOBER 2026 ════════
        $day1 = '2026-10-03';

        // 1. 07.00 – 08.00: PERSIAPAN PANITIA DAN REGISTRASI
        $this->createSessionRecord($event, [
            'day' => 1,
            'date' => $day1,
            'session_number' => 'SBY-D1-01',
            'start' => '07:00:00',
            'end' => '08:00:00',
            'jp' => 0,
            'type' => 'KEHADIRAN_AWAL',
            'topic' => 'Persiapan Panitia dan Registrasi Peserta UKT',
            'subtopic' => 'Verifikasi kehadiran peserta, penyerahan formulir fisik/kartu peserta, dan persiapan upacara pembukaan',
            'method' => 'Registrasi & Presensi Mandiri / Scan QR',
            'room' => $hallUtama,
            'speaker' => $panpel,
            'tracks' => $allTracks,
            'attendance_open' => true,
            'qr_token' => 'QR-SBY26-D1-REG',
            'qr_code' => 'SBY26REG',
        ]);

        // 2. 08.00 – 09.30: UPACARA TRADISI SHORINJI KEMPO
        $this->createSessionRecord($event, [
            'day' => 1,
            'date' => $day1,
            'session_number' => 'SBY-D1-02',
            'start' => '08:00:00',
            'end' => '09:30:00',
            'jp' => 2,
            'type' => 'PLENO',
            'topic' => 'Upacara Tradisi Shorinji Kempo & Pembukaan Resmi',
            'subtopic' => "1. Pembukaan\n2. Do'a\n3. Menyanyikan Lagu Kebangsaan 'Indonesia Raya'\n4. Menyanyikan Lagu 'Mars PERKEMI'\n5. Menyanyikan 'Mars PATRIOT'\n6. Sambutan Ketua Pelaksana\n7. Sambutan Ketua Umum PERKEMI Surabaya\n8. Sambutan Ketua KONI / yang Mewakili\n9. Sambutan Ketua Umum PERKEMI Pengprov Jatim\n10. Demonstrasi KEMPO",
            'method' => 'Upacara Tradisi Shorinji Kempo & Protokoler',
            'room' => $hallUtama,
            'speaker' => $panpel,
            'tracks' => $allTracks,
            'attendance_open' => true,
            'qr_token' => 'QR-SBY26-D1-BUKA',
            'qr_code' => 'SBY26BUKA',
        ]);

        // 3. 09.30 – 10.00: COFFEE BREAK
        $this->createSessionRecord($event, [
            'day' => 1,
            'date' => $day1,
            'session_number' => 'SBY-D1-03',
            'start' => '09:30:00',
            'end' => '10:00:00',
            'jp' => 0,
            'type' => 'OPERASIONAL',
            'topic' => 'Coffee Break & Rehat Pagi',
            'subtopic' => 'Rehat pagi peserta dan dewan penguji',
            'method' => 'Rehat & Operasional',
            'room' => $hallUtama,
            'speaker' => $panpel,
            'tracks' => $allTracks,
            'attendance_open' => false,
            'qr_token' => 'QR-SBY26-D1-BRK1',
            'qr_code' => 'SBY26BRK1',
        ]);

        // 4. 10.00 – 11.00: PEMBEKALAN TOKUHAN PESERTA UJIAN DAN GASHUKU (SP IHYAN)
        $this->createSessionRecord($event, [
            'day' => 1,
            'date' => $day1,
            'session_number' => 'SBY-D1-04',
            'start' => '10:00:00',
            'end' => '11:00:00',
            'jp' => 1,
            'type' => 'PLENO',
            'topic' => 'Pembekalan Tokuhon Peserta Ujian dan Gashuku',
            'subtopic' => 'Pemantapan filosofi Shorinji Kempo, doktrin Chito/Seigo, sejarah Kaiso Doshin So, dan etika budo',
            'method' => 'Pemaparan Materi Tokuhon & Diskusi Interaktif',
            'room' => $hallUtama,
            'speaker' => $spIhyan,
            'tracks' => $allTracks,
            'attendance_open' => true,
            'qr_token' => 'QR-SBY26-D1-TOKUHON',
            'qr_code' => 'SBY26TKH',
        ]);

        // 5. 11.00 – 12.00: LATIHAN TEKNIK I
        $this->createSessionRecord($event, [
            'day' => 1,
            'date' => $day1,
            'session_number' => 'SBY-D1-05',
            'start' => '11:00:00',
            'end' => '12:00:00',
            'jp' => 1,
            'type' => 'PARALEL',
            'topic' => 'Latihan Teknik I (Standardisasi Kihon & Juho/Goho Dasar)',
            'subtopic' => 'Pendalaman Kihon, Kamae, Umpoho, dan koreksi teknik goho/juho sesuai kurikulum kyu masing-masing',
            'method' => 'Praktik Lapangan Terbimbing',
            'room' => $hallUtama,
            'speaker' => $timPenguji,
            'tracks' => $allTracks,
            'attendance_open' => true,
            'qr_token' => 'QR-SBY26-D1-TEK1',
            'qr_code' => 'SBY26TK1',
        ]);

        // 6. 12.00 – 13.00: ISHOMA
        $this->createSessionRecord($event, [
            'day' => 1,
            'date' => $day1,
            'session_number' => 'SBY-D1-06',
            'start' => '12:00:00',
            'end' => '13:00:00',
            'jp' => 0,
            'type' => 'OPERASIONAL',
            'topic' => 'ISHOMA (Istirahat, Sholat, Makan Siang)',
            'subtopic' => 'Istirahat dan makan siang seluruh peserta dan dewan juri/penguji',
            'method' => 'Operasional & Ishoma',
            'room' => $hallUtama,
            'speaker' => $panpel,
            'tracks' => $allTracks,
            'attendance_open' => false,
            'qr_token' => 'QR-SBY26-D1-ISHOMA',
            'qr_code' => 'SBY26ISH',
        ]);

        // 7. 13.00 – 14.30: LATIHAN TEKNIK II
        $this->createSessionRecord($event, [
            'day' => 1,
            'date' => $day1,
            'session_number' => 'SBY-D1-07',
            'start' => '13:00:00',
            'end' => '14:30:00',
            'jp' => 2,
            'type' => 'PARALEL',
            'topic' => 'Latihan Teknik II (Simulasi Ujian Teknik Kyu 8 s.d Kyu 1)',
            'subtopic' => 'Simulasi gerakan teknik berpasangan (Kumite Juho & Goho), Embu beregu/pasangan, dan kesiapan ujian',
            'method' => 'Simulasi Lapangan & Pemantapan Pasangan',
            'room' => $hallUtama,
            'speaker' => $timPenguji,
            'tracks' => $allTracks,
            'attendance_open' => true,
            'qr_token' => 'QR-SBY26-D1-TEK2',
            'qr_code' => 'SBY26TK2',
        ]);

        // 8. 14.30 – 15.00: COFFEE BREAK
        $this->createSessionRecord($event, [
            'day' => 1,
            'date' => $day1,
            'session_number' => 'SBY-D1-08',
            'start' => '14:30:00',
            'end' => '15:00:00',
            'jp' => 0,
            'type' => 'OPERASIONAL',
            'topic' => 'Coffee Break & Persiapan Perangkat Ujian CBT',
            'subtopic' => 'Rehat sore dan login peserta ke platform ujian digital CBT UKT',
            'method' => 'Operasional & Persiapan CBT',
            'room' => $hallUtama,
            'speaker' => $panpel,
            'tracks' => $allTracks,
            'attendance_open' => false,
            'qr_token' => 'QR-SBY26-D1-BRK2',
            'qr_code' => 'SBY26BRK2',
        ]);

        // 9. 15.00 – 16.00: UJIAN DIGITAL (PENGUJI)
        // Dibuat per jalur kyu agar terhubung langsung dengan paket CBT masing-masing
        foreach ($allTracks as $tCode) {
            preg_match('/KYU-(\d+)/', $tCode, $m);
            $kNum = (int) ($m[1] ?? 1);
            $pkg = $cbtPackages[$kNum] ?? null;

            $this->createSessionRecord($event, [
                'day' => 1,
                'date' => $day1,
                'session_number' => sprintf('SBY-D1-CBT-K%d', $kNum),
                'start' => '15:00:00',
                'end' => '16:00:00',
                'jp' => 1,
                'type' => 'UJIAN',
                'topic' => sprintf('Ujian Digital CBT - Tingkat Kyu %d', $kNum),
                'subtopic' => sprintf('Ujian tulis berbasis komputer materi Tokuhon & WSKO (50 soal acak dari 200 bank soal Kyu %d)', $kNum),
                'method' => 'Computer Based Test (CBT Online)',
                'room' => $ruangCbt,
                'speaker' => $timPenguji,
                'tracks' => [$tCode],
                'attendance_open' => true,
                'qr_token' => sprintf('QR-SBY26-CBT-K%d', $kNum),
                'qr_code' => sprintf('CBTK%d', $kNum),
                'cbt_package_id' => $pkg?->id,
            ]);
        }

        // ════════ HARI 2: MINGGU, 04 OKTOBER 2026 ════════
        $day2 = '2026-10-04';

        // 10. 06.30 – 07.00: REGISTRASI PESERTA GASHUKU DAN UJIAN
        $this->createSessionRecord($event, [
            'day' => 2,
            'date' => $day2,
            'session_number' => 'SBY-D2-01',
            'start' => '06:30:00',
            'end' => '07:00:00',
            'jp' => 0,
            'type' => 'KEHADIRAN_HARIAN',
            'topic' => 'Registrasi & Presensi Hari Ke-2 (Gashuku & Ujian)',
            'subtopic' => 'Presensi harian wajib sebelum memasuki gelanggang ujian teknik',
            'method' => 'Presensi Harian Mandiri / Scan QR',
            'room' => $hallUtama,
            'speaker' => $panpel,
            'tracks' => $allTracks,
            'attendance_open' => true,
            'qr_token' => 'QR-SBY26-D2-REG',
            'qr_code' => 'SBY26D2REG',
        ]);

        // 11. 07.00 – 08.00: UPACARA TRADISI SHORINJI KEMPO
        $this->createSessionRecord($event, [
            'day' => 2,
            'date' => $day2,
            'session_number' => 'SBY-D2-02',
            'start' => '07:00:00',
            'end' => '08:00:00',
            'jp' => 1,
            'type' => 'PLENO',
            'topic' => 'Upacara Tradisi Shorinji Kempo & Chinkon Gyo',
            'subtopic' => 'Chinkon Gyo, Seiken, pengucapan Dokuhon bersama, dan pengantar pelaksanaan ujian teknik',
            'method' => 'Upacara Tradisi & Chinkon Gyo',
            'room' => $hallUtama,
            'speaker' => $panpel,
            'tracks' => $allTracks,
            'attendance_open' => true,
            'qr_token' => 'QR-SBY26-D2-TRAD',
            'qr_code' => 'SBY26TRAD',
        ]);

        // 12. 08.00 – 09.00: UJIAN TEKNIK
        $this->createSessionRecord($event, [
            'day' => 2,
            'date' => $day2,
            'session_number' => 'SBY-D2-03',
            'start' => '08:00:00',
            'end' => '09:00:00',
            'jp' => 1,
            'type' => 'UJIAN',
            'topic' => 'Ujian Teknik Terpadu (Kyu 8 s.d Kyu 1)',
            'subtopic' => 'Penilaian materi teknik Juho & Goho per-tingkatan oleh Dewan Penguji PERKEMI',
            'method' => 'Asesmen Praktik di Matras Ujian',
            'room' => $hallUtama,
            'speaker' => $timPenguji,
            'tracks' => $allTracks,
            'attendance_open' => true,
            'qr_token' => 'QR-SBY26-D2-UJTEK',
            'qr_code' => 'SBY26UJTEK',
        ]);

        // 13. 09.00 – 09.30: COFFEE BREAK
        $this->createSessionRecord($event, [
            'day' => 2,
            'date' => $day2,
            'session_number' => 'SBY-D2-04',
            'start' => '09:00:00',
            'end' => '09:30:00',
            'jp' => 0,
            'type' => 'OPERASIONAL',
            'topic' => 'Coffee Break & Rehat Pagi Hari ke-2',
            'subtopic' => 'Rehat peserta setelah menyelesaikan ujian teknik',
            'method' => 'Operasional',
            'room' => $hallUtama,
            'speaker' => $panpel,
            'tracks' => $allTracks,
            'attendance_open' => false,
            'qr_token' => 'QR-SBY26-D2-BRK1',
            'qr_code' => 'SBY26D2BRK',
        ]);

        // 14. 09.30 – 11.00: EVALUASI HASIL UJIAN DAN KOREKSI TEKNIK
        $this->createSessionRecord($event, [
            'day' => 2,
            'date' => $day2,
            'session_number' => 'SBY-D2-05',
            'start' => '09:30:00',
            'end' => '11:00:00',
            'jp' => 2,
            'type' => 'REFLEKSI',
            'topic' => 'Evaluasi Hasil Ujian dan Koreksi Teknik',
            'subtopic' => 'Pemberian evaluasi umum dan perbaikan detail gerakan teknik Juho/Goho oleh Dewan Penguji',
            'method' => 'Evaluasi & Refleksi Teknik Kolektif',
            'room' => $hallUtama,
            'speaker' => $timPenguji,
            'tracks' => $allTracks,
            'attendance_open' => true,
            'qr_token' => 'QR-SBY26-D2-EVAL',
            'qr_code' => 'SBY26EVAL',
        ]);

        // 15. 11.00 – 12.00: PENGUMUMAN HASIL UJIAN
        $this->createSessionRecord($event, [
            'day' => 2,
            'date' => $day2,
            'session_number' => 'SBY-D2-06',
            'start' => '11:00:00',
            'end' => '12:00:00',
            'jp' => 1,
            'type' => 'PLENO',
            'topic' => 'Pengumuman Hasil Ujian Kenaikan Tingkat',
            'subtopic' => 'Pengumuman kenshi yang dinyatakan lulus dan penyerahan piagam kelulusan simbolis',
            'method' => 'Sidang Pleno Kelulusan',
            'room' => $hallUtama,
            'speaker' => $timPenguji,
            'tracks' => $allTracks,
            'attendance_open' => true,
            'qr_token' => 'QR-SBY26-D2-PENG',
            'qr_code' => 'SBY26PENG',
        ]);

        // 16. 12.00 – 13.00: PENUTUPAN TRADISI SHORINJI KEMPO
        $this->createSessionRecord($event, [
            'day' => 2,
            'date' => $day2,
            'session_number' => 'SBY-D2-07',
            'start' => '12:00:00',
            'end' => '13:00:00',
            'jp' => 1,
            'type' => 'PENUTUPAN',
            'topic' => 'Penutupan Tradisi Shorinji Kempo & Ramah Tamah',
            'subtopic' => 'Upacara penutupan resmi tradisi Kempo, doa penutup, foto bersama, dan pembagian sertifikat',
            'method' => 'Upacara Penutupan Tradisi Kempo',
            'room' => $hallUtama,
            'speaker' => $panpel,
            'tracks' => $allTracks,
            'attendance_open' => true,
            'qr_token' => 'QR-SBY26-D2-TUTUP',
            'qr_code' => 'SBY26TUTUP',
        ]);
    }

    private function createSessionRecord(Event $event, array $data): EventSession
    {
        return EventSession::query()->create([
            'event_id' => $event->id,
            'day_number' => $data['day'],
            'date' => $data['date'],
            'session_number' => $data['session_number'],
            'start_time' => $data['start'],
            'end_time' => $data['end'],
            'duration_jp' => $data['jp'],
            'session_type_code' => $data['type'],
            'topic' => $data['topic'],
            'subtopic' => $data['subtopic'] ?? null,
            'method' => $data['method'] ?? 'Pemaparan Materi',
            'room' => $data['room']?->name ?? 'Hall Utama',
            'event_room_id' => $data['room']?->id,
            'speaker_id' => $data['speaker']?->id,
            'track_codes' => $data['tracks'] ?? ['KYU-8', 'KYU-7', 'KYU-6', 'KYU-5', 'KYU-4', 'KYU-3', 'KYU-2', 'KYU-1'],
            'status' => 'scheduled',
            'attendance_setting' => $data['attendance_open'] ? 'check_in' : 'disabled',
            'is_attendance_open' => $data['attendance_open'],
            'attendance_open_at' => Carbon::parse($data['date'].' '.$data['start']),
            'attendance_close_at' => Carbon::parse($data['date'].' '.$data['end'])->addHours(2),
            'qr_token' => $data['qr_token'],
            'qr_short_code' => $data['qr_code'],
            'cbt_exam_package_id' => $data['cbt_package_id'] ?? null,
        ]);
    }

    /**
     * @param  array<string, ParticipantTrack>  $tracks
     */
    private function seedParticipants(Event $event, array $tracks): void
    {
        $jsonPath = base_path(self::JSON_PARTICIPANTS);
        if (! file_exists($jsonPath)) {
            $this->command->error("Berkas JSON Peserta tidak ditemukan di: {$jsonPath}");

            return;
        }

        $raw = json_decode(file_get_contents($jsonPath), true);
        $records = $raw['records'] ?? [];
        $total = count($records);

        $this->command->info(sprintf('Memproses %d data peserta UKT dari SIM Perkemi...', $total));

        $counter = 0;
        foreach ($records as $idx => $r) {
            $nik = trim((string) ($r['ujian_nik'] ?? ''));
            $name = trim((string) ($r['ujian_name'] ?? ''));
            if ($nik === '' || $name === '') {
                continue;
            }

            // Target Kyu dari formula SIM Perkemi: Kyu = 11 - ujian_ke_tingkat
            $rawTingkat = (int) ($r['ujian_ke_tingkat'] ?? 6);
            $targetKyuNum = 11 - $rawTingkat;
            if ($targetKyuNum < 1 || $targetKyuNum > 8) {
                $targetKyuNum = 6;
            }
            $targetLevel = "KYU {$targetKyuNum}";
            $trackCode = "KYU-{$targetKyuNum}";
            $track = $tracks[$trackCode] ?? null;

            // Tingkat saat ini (sebelum UKT)
            $currentKyuNum = $targetKyuNum + 1;
            $currentLevel = ($currentKyuNum <= 8) ? "KYU {$currentKyuNum}" : 'KYU 8 (Pemula)';

            // Buat Email unik & valid
            $email = trim((string) ($r['ujian_email'] ?? ''));
            if ($email === '' || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $cleanNik = preg_replace('/[^0-9]/', '', $nik);
                $email = "kenshi.{$cleanNik}@ukt.perkemi-surabaya.id";
            }

            // 1. Akun User (Password adalah NIK peserta)
            $user = User::query()->updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => Hash::make($nik),
                    'role' => 'Peserta',
                    'email_verified_at' => now(),
                ]
            );

            // 2. Data Master Participant
            $participant = Participant::withTrashed()->updateOrCreate(
                ['kenshi_id_number' => $nik],
                [
                    'name' => $name,
                    'user_id' => $user->id,
                    'gender' => strtolower((string) ($r['ujian_gender'] ?? 'male')) === 'female' ? 'female' : 'male',
                    'dan_rank' => $currentLevel,
                    'origin_dojo' => $r['dojo_name'] ?? 'Surabaya Kota',
                    'origin_city' => 'Kota Surabaya',
                    'origin_province' => $r['prov_name'] ?? 'Jawa Timur',
                    'phone' => ! empty(trim((string) ($r['ujian_phone'] ?? ''))) ? trim((string) $r['ujian_phone']) : '081234567890',
                    'email' => $email,
                    'address' => $r['ujian_address'] ?? 'Kota Surabaya',
                    'last_certificate' => $r['ujian_last_certificate'] ?? null,
                    'last_certificate_number' => $r['ujian_last_certificate'] ?? null,
                    'target_certification' => $targetLevel,
                    'simperkemi_data' => $r,
                    'event_id' => $event->id,
                ]
            );

            if ($participant->trashed()) {
                $participant->restore();
            }

            // 3. Pendaftaran di Event (EventParticipant)
            $ep = EventParticipant::query()->updateOrCreate(
                [
                    'event_id' => $event->id,
                    'participant_id' => $participant->id,
                ],
                [
                    'track_code' => $trackCode,
                    'rotation_group' => $idx % 2 === 0 ? 'G1' : 'G2',
                    'admin_status' => 'verified',
                    'attendance_status' => 'attended',
                    'attendance_records' => [
                        '2026-10-03' => 'present',
                        '2026-10-04' => 'present',
                    ],
                    'has_seen_welcome' => true,
                    'checked_in_at' => Carbon::parse('2026-10-03 07:15:00')->addMinutes($idx % 40),
                    'checkin_status' => 'checked_in',
                    'graduation_status' => 'in_progress',
                    'score_theory' => null,
                    'score_practice' => null,
                    'evaluation_notes' => "Peserta UKT Shorinji Kempo Surabaya 2026 tingkat {$targetLevel}.",
                ]
            );

            $rawLastExam = trim((string) ($r['ujian_last_date_exam'] ?? ''));
            $lastExamDate = null;
            if ($rawLastExam !== '' && $rawLastExam !== '0000-00-00' && preg_match('/^\d{4}-\d{2}-\d{2}/', $rawLastExam)) {
                try {
                    $parsed = Carbon::parse($rawLastExam);
                    if ($parsed->year > 1900) {
                        $lastExamDate = $parsed;
                    }
                } catch (\Throwable) {
                    $lastExamDate = null;
                }
            }

            // 4. Formulir Pendaftaran – 24 (Permohonan Ujian Kenshi) Terverifikasi
            EventRegistrationForm::query()->updateOrCreate(
                [
                    'event_id' => $event->id,
                    'participant_id' => $participant->id,
                ],
                [
                    'event_participant_id' => $ep->id,
                    'form_type' => 'KENSHI',
                    'penataran_level' => $targetLevel,
                    'target_level' => $targetLevel,
                    'start_date' => Carbon::parse('2026-10-03'),
                    'end_date' => Carbon::parse('2026-10-04'),
                    'location' => 'Gelanggang Remaja Surabaya',
                    'full_name' => $name,
                    'birth_place' => 'Surabaya',
                    'birth_date' => Carbon::parse('2005-01-01')->addDays($idx * 50),
                    'kenshi_id_number' => $nik,
                    'dan_level' => $currentLevel,
                    'home_address' => $r['ujian_address'] ?? 'Kota Surabaya',
                    'phone_number' => ! empty(trim((string) ($r['ujian_phone'] ?? ''))) ? trim((string) $r['ujian_phone']) : '081234567890',
                    'email' => $email,
                    'occupation' => ! empty(trim((string) ($r['ujian_pekerjaan'] ?? ''))) ? trim((string) $r['ujian_pekerjaan']) : 'Pelajar / Mahasiswa',
                    'occupation_address' => 'Kota Surabaya',
                    'occupation_phone' => '031-8000123',
                    'emergency_address' => 'Surabaya',
                    'emergency_phone' => '081987654321',
                    'last_exam_date' => $lastExamDate,
                    'last_certificate_number' => $r['ujian_last_certificate'] ?? null,
                    'last_certificate_date' => $lastExamDate,
                    'dojo_name' => $r['dojo_name'] ?? 'Surabaya Kota',
                    'dojo_leader_name' => 'Pengurus Dojo '.($r['dojo_name'] ?? 'Surabaya'),
                    'dojo_leader_position' => 'Ketua Dojo',
                    'exam_fee' => 150000,
                    'sign_place' => 'Surabaya',
                    'sign_date' => Carbon::parse('2026-10-03'),
                    'applicant_name' => $name,
                    'status' => 'submitted',
                    'submitted_at' => Carbon::parse('2026-10-02 18:00:00'),
                    'submission_mode' => 'online',
                    'waiver_agreed' => true,
                    'verified_at' => null,
                    'verified_by' => null,
                ]
            );

            $counter++;
        }

        $this->command->info(sprintf('Berhasil mendaftarkan %d kenshi di event UKT Surabaya 2026!', $counter));
    }
}
