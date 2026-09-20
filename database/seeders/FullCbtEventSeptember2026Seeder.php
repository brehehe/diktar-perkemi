<?php

namespace Database\Seeders;

use App\Models\CbtExamAttempt;
use App\Models\CbtExamPackage;
use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\EventLegend;
use App\Models\EventModule;
use App\Models\EventParticipant;
use App\Models\EventRoom;
use App\Models\EventSession;
use App\Models\EventSessionType;
use App\Models\LearningModule;
use App\Models\Material;
use App\Models\Participant;
use App\Models\ParticipantTrack;
use App\Models\QuestionBank;
use App\Models\QuestionModule;
use App\Models\Speaker;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class FullCbtEventSeptember2026Seeder extends Seeder
{
    private const EVENT_SLUG = 'penataran-cbt-terpadu-september-2026';

    private const TIMEZONE = 'Asia/Jakarta';

    /**
     * Seed a complete two-day event scenario for 19-20 September 2026.
     */
    public function run(): void
    {
        DB::transaction(function (): void {
            [$admin, $organizer] = $this->seedStaffUsers();
            $this->seedReferenceData();

            $event = $this->seedEvent($organizer);
            $rooms = $this->seedRooms($event);
            $speakers = $this->seedSpeakers($event);
            $this->seedLegends($event);

            $learningModules = $this->seedLearningModules($admin);
            $questionModules = $this->seedQuestionModules($admin, $learningModules);
            $questions = $this->seedQuestionBank($admin, $learningModules, $questionModules);
            $packages = $this->seedCbtPackages($event, $questionModules, $questions);
            $eventModules = $this->seedEventModules($event, $speakers);
            $sessions = $this->seedSessions(
                $event,
                $rooms,
                $speakers,
                $eventModules,
                $learningModules,
                $packages,
            );

            $this->linkCurriculumToEvent($event, $learningModules, $packages, $sessions);
            $participants = $this->seedParticipants($event);
            $this->clearAttendance($event);
            $this->seedCbtAttempts($event, $participants, $packages, $sessions, $questions);
        });
    }

    /**
     * @return array{0: User, 1: User}
     */
    private function seedStaffUsers(): array
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@perkemi.id'],
            [
                'name' => 'Administrator PERKEMI',
                'role' => 'Admin',
                'password' => Hash::make('password'),
            ],
        );

        $organizer = User::firstOrCreate(
            ['email' => 'penyelenggara.sep2026@perkemi.id'],
            [
                'name' => 'Panitia Penataran September 2026',
                'role' => 'Penyelenggara',
                'password' => Hash::make('password'),
            ],
        );

        User::firstOrCreate(
            ['email' => 'diktar.sep2026@perkemi.id'],
            [
                'name' => 'Diktar PERKEMI September 2026',
                'role' => 'Diktar',
                'password' => Hash::make('password'),
            ],
        );

        User::firstOrCreate(
            ['email' => 'pemateri@perkemi.id'],
            [
                'name' => 'Sensei Rahmat Pranoto, S.Pd.',
                'role' => 'Pemateri',
                'password' => Hash::make('password'),
            ],
        );

        return [$admin, $organizer];
    }

    private function seedReferenceData(): void
    {
        $tracks = [
            ['code' => 'PD', 'name' => 'Pelatih Daerah', 'description' => 'Jalur sertifikasi pelatih tingkat daerah.', 'color' => '#20A47A', 'sort_order' => 10],
            ['code' => 'PN', 'name' => 'Pelatih Nasional', 'description' => 'Jalur sertifikasi pelatih tingkat nasional.', 'color' => '#0B63CE', 'sort_order' => 20],
            ['code' => 'WAD', 'name' => 'Wasit Daerah', 'description' => 'Jalur sertifikasi wasit tingkat daerah.', 'color' => '#EE9B25', 'sort_order' => 30],
            ['code' => 'PWAN', 'name' => 'Penguji dan Wasit Nasional', 'description' => 'Jalur kompetensi ganda penguji dan wasit nasional.', 'color' => '#7957D5', 'sort_order' => 40],
        ];

        foreach ($tracks as $track) {
            ParticipantTrack::updateOrCreate(
                ['code' => $track['code']],
                [...$track, 'is_active' => true],
            );
        }

        $sessionTypes = [
            ['code' => 'PLENO', 'name' => 'Pleno Bersama', 'color' => '#0B63CE', 'badge_color' => 'blue'],
            ['code' => 'PRAKTIK', 'name' => 'Praktik Dojo', 'color' => '#20A47A', 'badge_color' => 'green'],
            ['code' => 'UJIAN', 'name' => 'Ujian CBT', 'color' => '#7957D5', 'badge_color' => 'purple'],
            ['code' => 'REFLEKSI', 'name' => 'Refleksi dan Evaluasi', 'color' => '#0E2747', 'badge_color' => 'navy'],
        ];

        foreach ($sessionTypes as $sessionType) {
            EventSessionType::updateOrCreate(
                ['code' => $sessionType['code']],
                [...$sessionType, 'is_active' => true],
            );
        }
    }

    private function seedEvent(User $organizer): Event
    {
        $event = Event::withTrashed()->updateOrCreate(
            ['slug' => self::EVENT_SLUG],
            [
                'title' => 'Penataran dan CBT Terpadu PERKEMI September 2026',
                'description' => 'Simulasi operasional lengkap penataran dua hari dengan kehadiran awal, absensi harian, absensi setiap sesi, materi terkunci oleh kehadiran, serta evaluasi CBT.',
                'start_date' => '2026-09-19',
                'end_date' => '2026-09-20',
                'location' => 'Pusdiklat PB PERKEMI, Jakarta',
                'organizer' => 'PB PERKEMI',
                'duration_text' => '2 hari',
                'total_effective_jp' => 12,
                'total_schedule_jp' => 14,
                'jp_duration_minutes' => 45,
                'learning_method' => 'Pleno, praktik dojo, belajar mandiri, dan CBT',
                'quota' => 40,
                'status' => 'ongoing',
                'access_roles' => ['Pelatih', 'Penguji', 'Wasit', 'Peserta'],
                'facilities_checklist' => [
                    ['label' => 'Ruang pleno berpendingin udara', 'checked' => true],
                    ['label' => 'Dojo dan matras praktik', 'checked' => true],
                    ['label' => 'Laboratorium CBT dan jaringan internet', 'checked' => true],
                    ['label' => 'Pos kesehatan dan kotak P3K', 'checked' => true],
                ],
                'requirements_checklist' => [
                    ['label' => 'Membawa kartu anggota PERKEMI', 'checked' => true],
                    ['label' => 'Mengenakan dogi lengkap pada sesi praktik', 'checked' => true],
                    ['label' => 'Memindai QR kehadiran awal dan setiap sesi', 'checked' => true],
                    ['label' => 'Mencapai nilai minimum sesuai paket CBT', 'checked' => true],
                ],
                'responsible_user_id' => $organizer->id,
            ],
        );

        if ($event->trashed()) {
            $event->restore();
        }

        return $event;
    }

    /**
     * @return Collection<string, EventRoom>
     */
    private function seedRooms(Event $event): Collection
    {
        return collect([
            'pleno' => 'Auditorium Utama',
            'dojo' => 'Dojo Praktik',
            'cbt' => 'Laboratorium CBT',
        ])->mapWithKeys(function (string $name, string $key) use ($event): array {
            $room = EventRoom::updateOrCreate(
                ['event_id' => $event->id, 'name' => $name],
                [],
            );

            return [$key => $room];
        });
    }

    /**
     * @return Collection<string, Speaker>
     */
    private function seedSpeakers(Event $event): Collection
    {
        $speakers = [
            'rahmat' => [
                'name' => 'Rahmat Pranoto',
                'title_degree' => 'S.Pd.',
                'dan_rank' => 'VI-DAN',
                'position' => 'Ketua Komisi Kepelatihan PB PERKEMI',
                'specialization' => 'Metodologi kepelatihan dan keselamatan latihan',
            ],
            'maya' => [
                'name' => 'Maya Kusumawardani',
                'title_degree' => 'M.Or.',
                'dan_rank' => 'V-DAN',
                'position' => 'Instruktur Nasional PB PERKEMI',
                'specialization' => 'Teknik dasar Goho dan Juho',
            ],
            'arief' => [
                'name' => 'Arief Nugroho',
                'title_degree' => 'S.Kom.',
                'dan_rank' => 'IV-DAN',
                'position' => 'Koordinator CBT PB PERKEMI',
                'specialization' => 'Asesmen digital dan administrasi CBT',
            ],
        ];

        $pemateriUser = User::where('email', 'pemateri@perkemi.id')->first();

        return collect($speakers)->mapWithKeys(function (array $speaker, string $key) use ($event, $pemateriUser): array {
            $email = $key === 'rahmat' ? 'pemateri@perkemi.id' : "{$key}.sep2026@perkemi.id";
            $userId = $key === 'rahmat' ? $pemateriUser?->id : null;

            $model = Speaker::withTrashed()->updateOrCreate(
                ['event_id' => $event->id, 'contact_email' => $email],
                [
                    ...$speaker,
                    'user_id' => $userId,
                    'type' => 'internal',
                    'organization' => 'PB PERKEMI',
                    'bio' => 'Pemateri penugasan khusus Penataran dan CBT Terpadu September 2026.',
                    'is_active' => true,
                ],
            );
            if ($model->trashed()) {
                $model->restore();
            }

            return [$key => $model];
        });
    }

    private function seedLegends(Event $event): void
    {
        $legends = [
            ['acronym' => 'JP', 'full_name' => 'Jam Pelajaran', 'category' => 'istilah', 'description' => 'Satuan pembelajaran, satu JP berlangsung selama 45 menit.'],
            ['acronym' => 'CBT', 'full_name' => 'Computer Based Test', 'category' => 'istilah', 'description' => 'Ujian yang dikerjakan secara digital melalui portal.'],
            ['acronym' => 'KKM', 'full_name' => 'Kriteria Ketuntasan Minimal', 'category' => 'istilah', 'description' => 'Nilai minimum yang harus dicapai peserta.'],
            ['acronym' => 'QR', 'full_name' => 'Quick Response Code', 'category' => 'absensi', 'description' => 'Kode kehadiran yang berbeda untuk kedatangan, harian, dan sesi.'],
            ['acronym' => 'RICE', 'full_name' => 'Rest, Ice, Compression, Elevation', 'category' => 'materi', 'description' => 'Penanganan awal cedera olahraga ringan.'],
        ];

        foreach ($legends as $legend) {
            EventLegend::updateOrCreate(
                ['event_id' => $event->id, 'acronym' => $legend['acronym']],
                $legend,
            );
        }
    }

    /**
     * @return Collection<string, LearningModule>
     */
    private function seedLearningModules(User $admin): Collection
    {
        $modules = [
            'dasar' => [
                'code' => 'LM-SEP26-DASAR',
                'title' => 'Fondasi Penataran dan Keselamatan Latihan',
                'slug' => 'fondasi-penataran-keselamatan-september-2026',
                'description' => 'Orientasi penataran, etika dojo, keselamatan latihan, dan prosedur kehadiran.',
                'category' => 'Kepelatihan',
                'total_jp' => 4,
                'level' => 'Dasar',
                'learning_objectives' => ['Memahami tata tertib penataran.', 'Menerapkan prosedur keselamatan latihan.'],
                'competency_outcomes' => ['Mampu mengikuti kegiatan dengan tertib dan aman.'],
                'keywords' => 'orientasi, keselamatan, etika dojo',
            ],
            'teknik' => [
                'code' => 'LM-SEP26-TEKNIK',
                'title' => 'Standarisasi Teknik Goho dan Juho',
                'slug' => 'standarisasi-goho-juho-september-2026',
                'description' => 'Pendalaman teknik dasar, koreksi pasangan, dan simulasi penerapan terukur.',
                'category' => 'Teknik Kempo',
                'total_jp' => 6,
                'level' => 'Menengah',
                'learning_objectives' => ['Menjelaskan prinsip Goju Ittai.', 'Mempraktikkan teknik sesuai standar.'],
                'competency_outcomes' => ['Mampu mengenali dan memperbaiki kesalahan teknik dasar.'],
                'keywords' => 'goho, juho, goju ittai, teknik',
            ],
        ];

        $saved = collect($modules)->mapWithKeys(function (array $module, string $key) use ($admin): array {
            $model = LearningModule::withTrashed()->updateOrCreate(
                ['code' => $module['code']],
                [
                    ...$module,
                    'track_codes' => ['PD', 'PN', 'WAD', 'PWAN'],
                    'target_roles' => ['Pelatih', 'Wasit', 'Penguji'],
                    'status' => 'active',
                    'created_by' => $admin->id,
                ],
            );
            if ($model->trashed()) {
                $model->restore();
            }

            return [$key => $model];
        });

        $materials = Material::query()->where('status', 'published')->orderBy('id')->take(2)->get();
        foreach ($saved as $module) {
            $module->materials()->sync(
                $materials->mapWithKeys(fn (Material $material, int $index): array => [
                    $material->id => [
                        'sort_order' => $index + 1,
                        'is_required' => true,
                        'instructor_notes' => 'Pelajari materi sebelum mengikuti sesi terkait.',
                        'estimated_duration_minutes' => 30,
                    ],
                ])->all(),
            );
        }

        return $saved;
    }

    /**
     * @param  Collection<string, LearningModule>  $learningModules
     * @return Collection<string, QuestionModule>
     */
    private function seedQuestionModules(User $admin, Collection $learningModules): Collection
    {
        $modules = [
            'dasar' => [
                'code' => 'QM-SEP26-DASAR',
                'title' => 'Evaluasi Dasar Penataran September 2026',
                'slug' => 'evaluasi-dasar-penataran-september-2026',
                'description' => 'Blueprint pre-test orientasi, keselamatan, dan pengetahuan dasar.',
                'category' => 'Dasar Penataran',
                'tested_competencies' => ['Etika dojo', 'Keselamatan latihan', 'Administrasi penataran'],
                'assessment_indicators' => ['Ketepatan prosedur', 'Pemahaman konsep dasar'],
                'evaluation_purpose' => 'Memetakan kesiapan awal peserta.',
                'passing_grade' => 70,
                'learning_module_id' => $learningModules['dasar']->id,
            ],
            'akhir' => [
                'code' => 'QM-SEP26-AKHIR',
                'title' => 'Evaluasi Akhir Kompetensi September 2026',
                'slug' => 'evaluasi-akhir-kompetensi-september-2026',
                'description' => 'Blueprint ujian akhir yang menggabungkan keselamatan dan teknik.',
                'category' => 'Evaluasi Akhir',
                'tested_competencies' => ['Keselamatan latihan', 'Goho', 'Juho', 'Goju Ittai'],
                'assessment_indicators' => ['Analisis situasi', 'Ketepatan prinsip teknik'],
                'evaluation_purpose' => 'Menentukan ketuntasan kompetensi peserta.',
                'passing_grade' => 75,
                'learning_module_id' => $learningModules['teknik']->id,
            ],
        ];

        return collect($modules)->mapWithKeys(function (array $module, string $key) use ($admin): array {
            $model = QuestionModule::withTrashed()->updateOrCreate(
                ['code' => $module['code']],
                [
                    ...$module,
                    'track_codes' => ['PD', 'PN', 'WAD', 'PWAN'],
                    'default_weight' => 100,
                    'status' => 'active',
                    'created_by' => $admin->id,
                ],
            );
            if ($model->trashed()) {
                $model->restore();
            }

            return [$key => $model];
        });
    }

    /**
     * @param  Collection<string, LearningModule>  $learningModules
     * @param  Collection<string, QuestionModule>  $questionModules
     * @return Collection<int, QuestionBank>
     */
    private function seedQuestionBank(User $admin, Collection $learningModules, Collection $questionModules): Collection
    {
        $questions = [
            ['Bagaimana peserta membuka akses materi pada hari kegiatan?', 'Memindai QR kehadiran harian dan QR sesi terkait', 'Cukup masuk ke akun portal', 'Meminta panitia membuka semua materi', 'Mengisi nilai ujian terlebih dahulu', 'Kehadiran yang sah menjadi prasyarat akses materi dan ujian.'],
            ['Apa fungsi utama pemanasan sebelum praktik Kempo?', 'Menyiapkan tubuh dan mengurangi risiko cedera', 'Menambah durasi kegiatan', 'Menggantikan latihan inti', 'Menentukan kelompok peserta', 'Pemanasan meningkatkan kesiapan fisik dan rentang gerak.'],
            ['Saat peserta mengalami cedera ringan, tindakan awal yang tepat adalah:', 'Menerapkan prinsip RICE dan melapor kepada petugas', 'Melanjutkan latihan agar tubuh tetap hangat', 'Memberi obat tanpa pemeriksaan', 'Meninggalkan lokasi tanpa laporan', 'RICE merupakan prosedur awal untuk cedera olahraga ringan.'],
            ['Makna Goju Ittai dalam Shorinji Kempo adalah:', 'Teknik keras dan lunak menyatu serta saling melengkapi', 'Teknik keras selalu lebih utama', 'Teknik lunak hanya untuk pemula', 'Latihan dilakukan tanpa pasangan', 'Goho dan Juho dipahami sebagai kesatuan.'],
            ['Sikap yang benar saat melakukan koreksi kepada pasangan adalah:', 'Memberi umpan balik spesifik dengan tetap menjaga keselamatan', 'Meningkatkan tenaga tanpa memberi aba-aba', 'Mengabaikan batas kemampuan pasangan', 'Mengubah teknik tanpa panduan instruktur', 'Koreksi harus jelas, aman, dan berada dalam panduan instruktur.'],
            ['Kapan peserta boleh mulai mengerjakan CBT sesi?', 'Setelah kehadiran sesi terkonfirmasi dan waktu ujian dibuka', 'Kapan saja setelah terdaftar', 'Sebelum hadir di lokasi', 'Setelah sertifikat diterbitkan', 'CBT terikat pada jadwal dan prasyarat absensi sesi.'],
            ['Apa tujuan zanshin setelah melakukan teknik?', 'Menjaga kesadaran dan kesiapan setelah gerakan', 'Mengakhiri latihan secepatnya', 'Memberi kesempatan lawan menyerang bebas', 'Mengabaikan posisi tubuh', 'Zanshin menjaga kewaspadaan setelah eksekusi teknik.'],
            ['Dalam latihan berpasangan, intensitas teknik harus:', 'Disesuaikan dengan instruksi dan kemampuan pasangan', 'Selalu maksimal', 'Ditentukan peserta yang lebih senior saja', 'Tidak perlu disepakati', 'Kontrol intensitas merupakan bagian dari keselamatan latihan.'],
            ['Jika nilai ujian di bawah KKM dan paket memakai revisi makalah, peserta harus:', 'Mengunggah dokumen revisi sebelum tenggat yang ditentukan', 'Mengubah nilai secara mandiri', 'Mengabaikan hasil ujian', 'Meminta peserta lain mengerjakan ulang', 'Metode dan tenggat revisi mengikuti pengaturan paket ujian.'],
            ['Data absensi sesi yang sah mencatat:', 'Peserta, sesi, waktu, status, dan metode kehadiran', 'Hanya nama event', 'Hanya nilai CBT', 'Hanya nama pemateri', 'Catatan kehadiran harus dapat ditelusuri sampai peserta dan sesi.'],
        ];

        return collect($questions)->map(function (array $question, int $index) use ($admin, $learningModules, $questionModules): QuestionBank {
            $primaryModule = $index < 5 ? $questionModules['dasar'] : $questionModules['akhir'];
            $learningModule = $index < 5 ? $learningModules['dasar'] : $learningModules['teknik'];
            $number = $index + 1;
            $model = QuestionBank::withTrashed()->updateOrCreate(
                ['code' => sprintf('QB-SEP26-%03d', $number)],
                [
                    'question_module_id' => $primaryModule->id,
                    'question_text' => $question[0],
                    'question_type' => 'single_choice',
                    'options' => [
                        ['id' => 'A', 'text' => $question[1]],
                        ['id' => 'B', 'text' => $question[2]],
                        ['id' => 'C', 'text' => $question[3]],
                        ['id' => 'D', 'text' => $question[4]],
                    ],
                    'correct_answer' => 'A',
                    'points' => 10,
                    'difficulty_level' => $index % 3 === 0 ? 'intermediate' : 'basic',
                    'explanation' => $question[5],
                    'learning_module_id' => $learningModule->id,
                    'status' => 'active',
                    'created_by' => $admin->id,
                ],
            );
            if ($model->trashed()) {
                $model->restore();
            }

            $moduleIds = $index < 3
                ? [$questionModules['dasar']->id, $questionModules['akhir']->id]
                : [$primaryModule->id];
            $model->questionModules()->sync($moduleIds);

            return $model;
        });
    }

    /**
     * @param  Collection<string, QuestionModule>  $questionModules
     * @param  Collection<int, QuestionBank>  $questions
     * @return Collection<string, CbtExamPackage>
     */
    private function seedCbtPackages(Event $event, Collection $questionModules, Collection $questions): Collection
    {
        $packages = collect([
            'pretest' => [
                'code' => 'CBT-SEP26-PRE',
                'title' => 'Pre-Test Penataran September 2026',
                'description' => 'Pemetaan kesiapan awal peserta sebelum sesi praktik.',
                'exam_type' => 'pre_test',
                'question_module_id' => $questionModules['dasar']->id,
                'total_questions' => 5,
                'duration_minutes' => 30,
                'passing_score' => 70,
                'attempts_allowed' => 2,
                'revision_method' => 'retry',
                'revision_deadline' => Carbon::parse('2026-09-20 09:00', self::TIMEZONE),
                'start_time' => Carbon::parse('2026-09-19 13:00', self::TIMEZONE),
                'end_time' => Carbon::parse('2026-09-19 17:00', self::TIMEZONE),
                'instructions' => 'Pastikan absensi sesi telah terkonfirmasi. Pilih satu jawaban paling tepat.',
                'status' => 'open',
                'question_ids' => $questions->take(5)->pluck('id')->all(),
            ],
            'final' => [
                'code' => 'CBT-SEP26-FINAL',
                'title' => 'Ujian Akhir Kompetensi September 2026',
                'description' => 'Evaluasi akhir keselamatan dan standarisasi teknik peserta.',
                'exam_type' => 'theory',
                'question_module_id' => $questionModules['akhir']->id,
                'total_questions' => 10,
                'duration_minutes' => 60,
                'passing_score' => 75,
                'attempts_allowed' => 1,
                'revision_method' => 'paper',
                'revision_deadline' => Carbon::parse('2026-09-23 23:59', self::TIMEZONE),
                'start_time' => Carbon::parse('2026-09-20 13:00', self::TIMEZONE),
                'end_time' => Carbon::parse('2026-09-20 16:00', self::TIMEZONE),
                'instructions' => 'Ujian hanya dapat dibuka setelah peserta melakukan absensi harian dan absensi sesi ujian.',
                'status' => 'ready',
                'question_ids' => $questions->pluck('id')->all(),
            ],
        ])->mapWithKeys(function (array $package, string $key) use ($event): array {
            $questionIds = $package['question_ids'];
            unset($package['question_ids']);

            $model = CbtExamPackage::withTrashed()->updateOrCreate(
                ['code' => $package['code']],
                [
                    ...$package,
                    'event_id' => $event->id,
                    'target_tracks' => ['PD', 'PN', 'WAD', 'PWAN'],
                    'randomize_questions' => false,
                    'randomize_answers' => false,
                    'result_display' => 'immediate',
                ],
            );
            if ($model->trashed()) {
                $model->restore();
            }

            $model->bankQuestions()->sync(
                collect($questionIds)->mapWithKeys(fn (int $id, int $index): array => [
                    $id => ['sort_order' => $index + 1, 'points' => 10],
                ])->all(),
            );

            return [$key => $model];
        });

        return $packages;
    }

    /**
     * @param  Collection<string, Speaker>  $speakers
     * @return Collection<string, EventModule>
     */
    private function seedEventModules(Event $event, Collection $speakers): Collection
    {
        $materials = Material::query()->where('status', 'published')->orderBy('id')->take(3)->get();
        $modules = [
            'orientasi' => ['EV-SEP26-01', 'Orientasi dan Keselamatan Penataran', 2, $speakers['rahmat']->id, 0],
            'teknik' => ['EV-SEP26-02', 'Standarisasi Goho dan Juho', 6, $speakers['maya']->id, 1],
            'evaluasi' => ['EV-SEP26-03', 'Evaluasi Kompetensi dan CBT', 4, $speakers['arief']->id, 2],
        ];

        return collect($modules)->mapWithKeys(function (array $module, string $key) use ($event, $materials): array {
            $model = EventModule::updateOrCreate(
                ['event_id' => $event->id, 'code' => $module[0]],
                [
                    'title' => $module[1],
                    'description' => 'Modul operasional Penataran dan CBT Terpadu September 2026.',
                    'jp' => $module[2],
                    'track_codes' => ['PD', 'PN', 'WAD', 'PWAN'],
                    'speaker_id' => $module[3],
                    'material_id' => $materials->get($module[4])?->id,
                    'fulfillment_method' => 'Kehadiran sesi dan penyelesaian aktivitas pembelajaran.',
                    'is_published' => true,
                    'learning_indicators' => 'Peserta memahami materi dan mampu menerapkannya pada simulasi.',
                    'publication_status' => 'published',
                    'source_type' => $materials->get($module[4]) ? 'collection' : 'event',
                ],
            );

            return [$key => $model];
        });
    }

    /**
     * @param  Collection<string, EventRoom>  $rooms
     * @param  Collection<string, Speaker>  $speakers
     * @param  Collection<string, EventModule>  $eventModules
     * @param  Collection<string, LearningModule>  $learningModules
     * @param  Collection<string, CbtExamPackage>  $packages
     * @return Collection<string, EventSession>
     */
    private function seedSessions(Event $event, Collection $rooms, Collection $speakers, Collection $eventModules, Collection $learningModules, Collection $packages): Collection
    {
        $sessions = [
            'arrival' => ['2026-09-19', 1, '00:00', '23:59', 'Kedatangan', 'KEHADIRAN_AWAL', 'Kehadiran awal event', 'scheduled', null, null, null, null, 'SEPARR', true],
            'daily1' => ['2026-09-19', 1, '06:00', '10:00', 'Harian 1', 'KEHADIRAN_HARIAN', 'Kehadiran hari ke-1', 'scheduled', null, null, null, null, 'SEPD01', true],
            'opening' => ['2026-09-19', 1, '08:00', '09:30', 'S-01', 'PLENO', 'Pembukaan dan orientasi penataran', 'completed', 'pleno', 'rahmat', 'orientasi', 'dasar', 'SEPS01', true],
            'safety' => ['2026-09-19', 1, '09:45', '11:15', 'S-02', 'PLENO', 'Keselamatan latihan dan etika dojo', 'completed', 'pleno', 'rahmat', 'orientasi', 'dasar', 'SEPS02', true],
            'pretest' => ['2026-09-19', 1, '13:00', '14:00', 'S-03', 'UJIAN', 'Pre-Test kesiapan peserta', 'completed', 'cbt', 'arief', 'evaluasi', 'dasar', 'SEPPRE', true],
            'practice' => ['2026-09-19', 1, '14:15', '17:15', 'S-04', 'PRAKTIK', 'Praktik standarisasi Goho dan Juho', 'completed', 'dojo', 'maya', 'teknik', 'teknik', 'SEPS04', true],
            'daily2' => ['2026-09-20', 2, '06:00', '10:00', 'Harian 2', 'KEHADIRAN_HARIAN', 'Kehadiran hari ke-2', 'scheduled', null, null, null, null, 'SEPD02', false],
            'simulation' => ['2026-09-20', 2, '08:00', '11:00', 'S-05', 'PRAKTIK', 'Simulasi penerapan dan koreksi teknik', 'scheduled', 'dojo', 'maya', 'teknik', 'teknik', 'SEPS05', false],
            'final' => ['2026-09-20', 2, '13:00', '14:30', 'S-06', 'UJIAN', 'Ujian akhir kompetensi CBT', 'scheduled', 'cbt', 'arief', 'evaluasi', 'teknik', 'SEPFNL', false],
        ];

        return collect($sessions)->mapWithKeys(function (array $session, string $key) use ($event, $rooms, $speakers, $eventModules, $learningModules, $packages): array {
            $isAttendanceOpen = $session[13];
            $model = EventSession::updateOrCreate(
                ['event_id' => $event->id, 'session_number' => $session[4]],
                [
                    'date' => $session[0],
                    'day_number' => $session[1],
                    'start_time' => $session[2],
                    'end_time' => $session[3],
                    'duration_jp' => in_array($session[5], ['KEHADIRAN_AWAL', 'KEHADIRAN_HARIAN'], true) ? 0 : max(1, (int) round($this->minutesBetween($session[2], $session[3]) / 45)),
                    'session_type_code' => $session[5],
                    'topic' => $session[6],
                    'subtopic' => 'Bagian dari rangkaian Penataran dan CBT Terpadu September 2026.',
                    'method' => $session[5] === 'UJIAN' ? 'CBT mandiri terpantau' : 'Tatap muka dan praktik',
                    'status' => $session[7],
                    'event_room_id' => $session[8] ? $rooms[$session[8]]->id : null,
                    'room' => $session[8] ? $rooms[$session[8]]->name : 'Area registrasi',
                    'speaker_id' => $session[9] ? $speakers[$session[9]]->id : null,
                    'event_module_id' => $session[10] ? $eventModules[$session[10]]->id : null,
                    'learning_module_id' => $session[11] ? $learningModules[$session[11]]->id : null,
                    'track_codes' => ['PD', 'PN', 'WAD', 'PWAN'],
                    'attendance_setting' => 'check_in',
                    'is_attendance_open' => $isAttendanceOpen,
                    'attendance_open_at' => $isAttendanceOpen ? Carbon::parse("{$session[0]} {$session[2]}", self::TIMEZONE)->subMinutes(30) : null,
                    'attendance_close_at' => null,
                    'qr_token' => "PP-SEP2026-{$session[12]}-QR-TOKEN",
                    'qr_short_code' => $session[12],
                    'cbt_exam_package_id' => match ($key) {
                        'pretest' => $packages['pretest']->id,
                        'final' => $packages['final']->id,
                        default => null,
                    },
                    'requires_attendance_before_cbt' => $session[5] === 'UJIAN',
                ],
            );

            return [$key => $model];
        });
    }

    private function minutesBetween(string $start, string $end): int
    {
        return (int) Carbon::createFromFormat('H:i', $start)->diffInMinutes(Carbon::createFromFormat('H:i', $end));
    }

    /**
     * @param  Collection<string, LearningModule>  $learningModules
     * @param  Collection<string, CbtExamPackage>  $packages
     * @param  Collection<string, EventSession>  $sessions
     */
    private function linkCurriculumToEvent(Event $event, Collection $learningModules, Collection $packages, Collection $sessions): void
    {
        $event->learningModules()->sync(
            $learningModules->values()->mapWithKeys(fn (LearningModule $module, int $index): array => [
                $module->id => [
                    'participant_path_id' => 'all',
                    'is_required' => true,
                    'sort_order' => $index + 1,
                    'availability_start_at' => Carbon::parse('2026-09-19 06:00', self::TIMEZONE),
                    'availability_end_at' => Carbon::parse('2026-09-20 18:00', self::TIMEZONE),
                ],
            ])->all(),
        );

        $event->linkedCbtPackages()->sync([
            $packages['pretest']->id => [
                'participant_path_id' => 'all',
                'is_required' => true,
                'sort_order' => 1,
                'availability_start_at' => $packages['pretest']->start_time,
                'availability_end_at' => $packages['pretest']->end_time,
                'requires_attendance_session_id' => $sessions['pretest']->id,
            ],
            $packages['final']->id => [
                'participant_path_id' => 'all',
                'is_required' => true,
                'sort_order' => 2,
                'availability_start_at' => $packages['final']->start_time,
                'availability_end_at' => $packages['final']->end_time,
                'requires_attendance_session_id' => $sessions['final']->id,
            ],
        ]);
    }

    /**
     * @return Collection<int, array{participant: Participant, user: User, eventParticipant: EventParticipant}>
     */
    private function seedParticipants(Event $event): Collection
    {
        $people = [
            ['Agus Setiawan', 'DKI Jakarta', 'Jakarta Timur', 'Dojo Rawamangun', 'III-DAN', 'PD'],
            ['Budi Santoso', 'Jawa Barat', 'Bandung', 'Dojo Pajajaran', 'IV-DAN', 'PN'],
            ['Citra Dewi Larasati', 'Jawa Timur', 'Surabaya', 'Dojo Surabaya', 'III-DAN', 'WAD'],
            ['Dian Prasetyo', 'Jawa Tengah', 'Semarang', 'Dojo Semarang', 'IV-DAN', 'PWAN'],
            ['Eko Prabowo', 'Bali', 'Denpasar', 'Dojo Denpasar', 'III-DAN', 'PD'],
            ['Faisal Rahman', 'Sulawesi Selatan', 'Makassar', 'Dojo Makassar', 'IV-DAN', 'PN'],
            ['Gunawan Wibisono', 'DKI Jakarta', 'Jakarta Utara', 'Dojo Kelapa Gading', 'III-DAN', 'WAD'],
            ['Hesti Maharani', 'Jawa Barat', 'Bogor', 'Dojo Bogor', 'III-DAN', 'PWAN'],
            ['I Made Suardana', 'Bali', 'Badung', 'Dojo Badung', 'IV-DAN', 'PD'],
            ['Joko Triyono', 'DI Yogyakarta', 'Yogyakarta', 'Dojo Yogyakarta', 'III-DAN', 'PN'],
            ['Kartika Sari', 'Banten', 'Tangerang', 'Dojo Tangerang', 'III-DAN', 'WAD'],
            ['Lukman Hakim', 'Sumatera Barat', 'Padang', 'Dojo Padang', 'IV-DAN', 'PWAN'],
        ];

        return collect($people)->map(function (array $person, int $index) use ($event): array {
            $number = $index + 1;
            $email = sprintf('peserta.sep26.%02d@perkemi.test', $number);
            $user = User::updateOrCreate(
                ['email' => $email],
                ['name' => $person[0], 'role' => 'Peserta', 'password' => Hash::make('password')],
            );
            $participant = Participant::withTrashed()->updateOrCreate(
                ['email' => $email],
                [
                    'user_id' => $user->id,
                    'name' => $person[0],
                    'kenshi_id_number' => sprintf('KNS-SEP26-%03d', $number),
                    'phone' => sprintf('08129026%04d', $number),
                    'origin_province' => $person[1],
                    'origin_city' => $person[2],
                    'origin_dojo' => $person[3],
                    'dan_rank' => $person[4],
                    'notes' => 'Peserta simulasi operasional Penataran September 2026.',
                ],
            );
            if ($participant->trashed()) {
                $participant->restore();
            }

            $hasPretestScore = $index < 6;
            $eventParticipant = EventParticipant::updateOrCreate(
                ['event_id' => $event->id, 'participant_id' => $participant->id],
                [
                    'track_code' => $person[5],
                    'rotation_group' => $index % 2 === 0 ? 'A1' : 'A2',
                    'admin_status' => 'verified',
                    'attendance_status' => 'absent',
                    'attendance_records' => [
                        '2026-09-19' => 'scheduled',
                        '2026-09-20' => 'scheduled',
                    ],
                    'graduation_status' => 'in_training',
                    'score_theory' => $hasPretestScore ? [88, 82, 78, 92, 68, 64][$index] : null,
                    'score_practice' => $index < 6 ? [86, 90, 84, 92, 80, 78][$index] : null,
                    'evaluation_notes' => $index >= 4 && $index < 6 ? 'Perlu menindaklanjuti hasil pre-test sesuai metode revisi paket.' : null,
                    'has_seen_welcome' => false,
                    'checked_in_at' => null,
                    'checkin_method' => null,
                    'checkin_status' => 'registered',
                    'checkin_notes' => 'Belum melakukan kehadiran awal.',
                ],
            );

            return compact('participant', 'user', 'eventParticipant');
        });
    }

    private function clearAttendance(Event $event): void
    {
        EventAttendance::query()->where('event_id', $event->id)->delete();
    }

    /**
     * @param  Collection<int, array{participant: Participant, user: User, eventParticipant: EventParticipant}>  $participants
     * @param  Collection<string, CbtExamPackage>  $packages
     * @param  Collection<string, EventSession>  $sessions
     * @param  Collection<int, QuestionBank>  $questions
     */
    private function seedCbtAttempts(Event $event, Collection $participants, Collection $packages, Collection $sessions, Collection $questions): void
    {
        $scores = [88, 82, 78, 92, 68, 64, null, 50];

        foreach ($participants->take(8) as $index => $record) {
            $score = $scores[$index];
            $status = match ($index) {
                6 => 'in_progress',
                7 => 'timed_out',
                default => 'submitted',
            };
            $startedAt = Carbon::parse('2026-09-19 13:08', self::TIMEZONE)->addMinutes($index * 2);

            CbtExamAttempt::updateOrCreate(
                [
                    'cbt_exam_package_id' => $packages['pretest']->id,
                    'participant_id' => $record['participant']->id,
                    'attempt_number' => 1,
                ],
                [
                    'event_id' => $event->id,
                    'event_session_id' => $sessions['pretest']->id,
                    'user_id' => $record['user']->id,
                    'started_at' => $startedAt,
                    'submitted_at' => in_array($status, ['submitted', 'timed_out'], true) ? $startedAt->copy()->addMinutes(24) : null,
                    'status' => $status,
                    'total_score' => $score,
                    'is_passed' => $score !== null ? $score >= 70 : null,
                    'answers' => $questions->take(5)->mapWithKeys(fn (QuestionBank $question, int $questionIndex): array => [
                        (string) $question->id => $questionIndex === 4 && $index >= 4 ? 'B' : 'A',
                    ])->all(),
                    'feedback' => $score === null
                        ? 'Pengerjaan masih berlangsung.'
                        : ($score >= 70 ? 'Kompetensi awal memenuhi batas ketuntasan.' : 'Nilai di bawah KKM. Peserta dapat mengulang sesuai pengaturan paket.'),
                    'revision_status' => $score !== null && $score < 70 ? 'required' : null,
                ],
            );
        }
    }
}
