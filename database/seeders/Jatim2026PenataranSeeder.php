<?php

namespace Database\Seeders;

use App\Http\Controllers\EventIntegrityPactController;
use App\Models\CbtExamPackage;
use App\Models\CbtQuestion;
use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\EventIntegrityPact;
use App\Models\EventModule;
use App\Models\EventParticipant;
use App\Models\EventRegistrationForm;
use App\Models\EventRoom;
use App\Models\EventSession;
use App\Models\EventSessionType;
use App\Models\Material;
use App\Models\Participant;
use App\Models\ParticipantTrack;
use App\Models\QuestionBank;
use App\Models\QuestionModule;
use App\Models\Speaker;
use App\Models\User;
use App\Services\QuestionModuleImportService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class Jatim2026PenataranSeeder extends Seeder
{
    public const EVENT_SLUG = 'penataran-pelatih-penguji-wasit-daerah-dan-nasional-provinsi-jawa-timur-2026-2026';

    public const API_PESERTA_URL = 'https://simperkemi.or.id/kempo_sim/wapi/api/get_peserta_event_simperkemi.php';

    public const CSV_RUNDOWN_PATH = __DIR__.'/csvs/rundown.csv';

    public const CSV_REFERENCE_PATH = __DIR__.'/csvs/referensicode.csv';

    /**
     * @var array<int, string>
     */
    private const ALL_TRACKS = ['PD', 'PN', 'PED', 'PEN', 'WAD', 'WAN'];

    public function run(): void
    {
        DB::transaction(function (): void {
            $this->seedParticipantTracks();
            $this->seedSessionTypes();

            $organizer = User::query()->where('role', 'Penyelenggara')->first()
                ?? User::query()->where('role', 'Admin')->first()
                ?? User::query()->first()
                ?? User::query()->create([
                    'name' => 'Panitia Pelaksana Penataran 2026',
                    'email' => 'panitia@jatim.perkemi.id',
                    'role' => 'Penyelenggara',
                    'password' => Hash::make('password'),
                ]);

            $event = $this->seedEvent($organizer);
            $pastEvents = $this->seedPastEvents($organizer);

            $rooms = $this->seedRooms($event);
            $speakers = $this->seedSpeakers($event);
            $modules = $this->seedModules($event, $speakers);
            $cbtPackages = $this->seedCbtPackages($event, $organizer);

            $this->seedSessions($event, $rooms, $speakers, $modules, $cbtPackages);
            $this->seedParticipants($event, $pastEvents);

            $totalEffectiveJp = (int) $event->sessions()
                ->whereNotIn('session_type_code', ['KEHADIRAN_AWAL', 'KEHADIRAN_HARIAN', 'OPERASIONAL'])
                ->sum('duration_jp');

            $totalScheduleJp = (int) $event->sessions()->sum('duration_jp');

            $event->update([
                'total_effective_jp' => $totalEffectiveJp > 0 ? $totalEffectiveJp : 42,
                'total_schedule_jp' => $totalScheduleJp > 0 ? $totalScheduleJp : 46,
            ]);
        });
    }

    private function seedParticipantTracks(): void
    {
        $refCodes = $this->getReferenceCodes();

        $tracks = [
            [
                'code' => 'PD',
                'name' => $refCodes['PD'] ?? 'Pelatih Daerah',
                'description' => 'Kenshi pemegang lisensi pembinaan dojo dan kompetensi pelatihan tingkat kota/kabupaten/daerah.',
                'color' => '#20A47A',
                'sort_order' => 10,
                'is_active' => true,
            ],
            [
                'code' => 'PN',
                'name' => $refCodes['PN'] ?? 'Pelatih Nasional',
                'description' => 'Kenshi kualifikasi kepelatihan tingkat nasional untuk pembinaan atlet daerah (Pelatda) dan nasional (Pelatnas).',
                'color' => '#0B63CE',
                'sort_order' => 20,
                'is_active' => true,
            ],
            [
                'code' => 'PED',
                'name' => $refCodes['PED'] ?? 'Penguji Daerah',
                'description' => 'Kenshi penguji resmi berwenang menguji ujian kenaikan tingkat kenshi Kyu 6 sampai Kyu 1.',
                'color' => '#DD4D7C',
                'sort_order' => 30,
                'is_active' => true,
            ],
            [
                'code' => 'PEN',
                'name' => $refCodes['PEN'] ?? 'Penguji Nasional',
                'description' => 'Dewan penguji bersertifikat nasional untuk pengujian tingkat I Dan sampai III Dan.',
                'color' => '#7957D5',
                'sort_order' => 40,
                'is_active' => true,
            ],
            [
                'code' => 'WAD',
                'name' => $refCodes['WAD'] ?? 'Wasit Daerah',
                'description' => 'Wasit berlisensi memimpin pertandingan kejuaraan kota/kabupaten dan kejurda Shorinji Kempo.',
                'color' => '#EE9B25',
                'sort_order' => 50,
                'is_active' => true,
            ],
            [
                'code' => 'WAN',
                'name' => $refCodes['WAN'] ?? 'Wasit Nasional',
                'description' => 'Wasit berlisensi nasional untuk Kejurnas, Babak Kualifikasi PON, dan PON.',
                'color' => '#0A3F82',
                'sort_order' => 60,
                'is_active' => true,
            ],
        ];

        foreach ($tracks as $track) {
            ParticipantTrack::query()->updateOrCreate(['code' => $track['code']], $track);
        }
    }

    /**
     * @return array<string, string>
     */
    private function getReferenceCodes(): array
    {
        $path = self::CSV_REFERENCE_PATH;
        if (! file_exists($path)) {
            return [];
        }

        $codes = [];
        if (($handle = fopen($path, 'r')) !== false) {
            fgetcsv($handle); // skip header
            while (($row = fgetcsv($handle)) !== false) {
                if (! empty($row[0])) {
                    $codes[trim($row[0])] = trim($row[1] ?? '');
                }
            }
            fclose($handle);
        }

        return $codes;
    }

    private function seedSessionTypes(): void
    {
        $types = [
            ['code' => 'PLENO', 'name' => 'Pleno Bersama', 'color' => '#0B63CE', 'badge_color' => 'blue'],
            ['code' => 'PARALEL', 'name' => 'Kelas Paralel (3 Kelas)', 'color' => '#7C3AED', 'badge_color' => 'purple'],
            ['code' => 'PAR_PELATIH', 'name' => 'Paralel Pelatih', 'color' => '#20A47A', 'badge_color' => 'green'],
            ['code' => 'PAR_PENGUJI', 'name' => 'Paralel Penguji', 'color' => '#DD4D7C', 'badge_color' => 'rose'],
            ['code' => 'PAR_WASIT', 'name' => 'Paralel Wasit', 'color' => '#EE9B25', 'badge_color' => 'orange'],
            ['code' => 'UJIAN', 'name' => 'Ujian & Asesmen Portofolio', 'color' => '#DC2626', 'badge_color' => 'red'],
            ['code' => 'REFLEKSI', 'name' => 'Refleksi & Evaluasi', 'color' => '#0E2747', 'badge_color' => 'navy'],
            ['code' => 'PENUTUPAN', 'name' => 'Upacara Penutupan', 'color' => '#0A3F82', 'badge_color' => 'dark'],
            ['code' => 'KEHADIRAN_AWAL', 'name' => 'Registrasi & Kehadiran Awal', 'color' => '#0D9488', 'badge_color' => 'teal'],
            ['code' => 'KEHADIRAN_HARIAN', 'name' => 'Kehadiran Harian', 'color' => '#0284C7', 'badge_color' => 'sky'],
            ['code' => 'OPERASIONAL', 'name' => 'Operasional & Ishoma', 'color' => '#64748B', 'badge_color' => 'slate'],
        ];

        foreach ($types as $type) {
            EventSessionType::query()->updateOrCreate(['code' => $type['code']], $type);
        }
    }

    private function seedEvent(?User $organizer = null): Event
    {
        $organizer = $organizer ?? User::query()->where('role', 'Penyelenggara')->first() ?? User::query()->where('role', 'Admin')->first();

        $event = Event::withTrashed()->updateOrCreate(
            ['slug' => self::EVENT_SLUG],
            [
                'title' => 'Penataran Pelatih, Penguji, Wasit Daerah dan Nasional Provinsi Jawa Timur 2026',
                'description' => 'Penataran Terpadu Pelatih, Penguji, dan Wasit Tingkat Daerah dan Nasional PERKEMI Jawa Timur 2026. Diselenggarakan berdasar Surat Persetujuan PB PERKEMI No. 235/PB-SJ/IX/2026 di Ubaya Training Center (UTC) Trawas Mojokerto, memadukan standarisasi kurikulum WSKO, pleno kepemimpinan & sport science, kelas paralel 3 ruang profesi, hingga asesmen uji kompetensi terintegrasi.',
                'start_date' => Carbon::parse('2026-09-24 00:00:00'),
                'end_date' => Carbon::parse('2026-09-27 23:59:59'),
                'location' => 'Ubaya Training Center (UTC), Trawas, Kabupaten Mojokerto, Jawa Timur',
                'organizer' => 'Pengurus Provinsi PERKEMI Jawa Timur & PB PERKEMI',
                'duration_text' => '4 Hari (24–27 September 2026)',
                'total_effective_jp' => 42,
                'total_schedule_jp' => 46,
                'jp_duration_minutes' => 45,
                'learning_method' => 'Pleno, kelas paralel 3 ruang profesi, demonstrasi teknik, simulasi wasit/penguji, dan asesmen uji kompetensi',
                'quota' => 120,
                'status' => 'open_registration',
                'access_roles' => ['Peserta', 'Pelatih', 'Penguji', 'Wasit', 'Pemateri', 'Penyelenggara'],
                'responsible_user_id' => $organizer?->id,
                'document_number_settings' => [
                    'PD' => ['prefix' => 'SK-PD-JTM-2026', 'start' => 1],
                    'PN' => ['prefix' => 'SK-PN-JTM-2026', 'start' => 1],
                    'PED' => ['prefix' => 'SK-PED-JTM-2026', 'start' => 1],
                    'PEN' => ['prefix' => 'SK-PEN-JTM-2026', 'start' => 1],
                    'WAD' => ['prefix' => 'SK-WAD-JTM-2026', 'start' => 1],
                    'WAN' => ['prefix' => 'SK-WAN-JTM-2026', 'start' => 1],
                ],
            ]
        );

        if ($event->trashed()) {
            $event->restore();
        }

        return $event;
    }

    /**
     * @return Collection<string, Event>
     */
    private function seedPastEvents(User $organizer): Collection
    {
        $pastEventsConfig = [
            'PD' => [
                'slug' => 'penataran-pelatih-daerah-2024',
                'title' => 'Penataran Pelatih Daerah PERKEMI Jawa Timur 2024',
                'description' => 'Penataran Standardisasi Kompetensi Kepelatihan Tingkat Daerah PERKEMI Jawa Timur 2024.',
                'start_date' => Carbon::parse('2024-12-10 08:00:00'),
                'end_date' => Carbon::parse('2024-12-13 18:00:00'),
                'location' => 'Dojo Pengprov PERKEMI Jawa Timur, Surabaya',
                'organizer' => 'Pengurus Provinsi PERKEMI Jawa Timur',
                'duration_text' => '4 Hari (10–13 Desember 2024)',
                'status' => 'completed',
            ],
            'WAD' => [
                'slug' => 'penataran-wasit-daerah-2025',
                'title' => 'Penataran Wasit Daerah PERKEMI Jawa Timur 2025',
                'description' => 'Penataran dan Penyegaran Wasit Daerah PERKEMI Jawa Timur untuk Kejurda dan Kejuaraan Daerah.',
                'start_date' => Carbon::parse('2025-10-20 08:00:00'),
                'end_date' => Carbon::parse('2025-10-23 18:00:00'),
                'location' => 'GOR Kertajaya Surabaya, Jawa Timur',
                'organizer' => 'Pengurus Provinsi PERKEMI Jawa Timur',
                'duration_text' => '4 Hari (20–23 Oktober 2025)',
                'status' => 'completed',
            ],
            'PED' => [
                'slug' => 'penataran-penguji-daerah-2025',
                'title' => 'Penataran Penguji Daerah PERKEMI Jawa Timur 2025',
                'description' => 'Penataran dan Standardisasi Dewan Penguji Daerah Ujian Kenaikan Tingkat Kyu 6–Kyu 1.',
                'start_date' => Carbon::parse('2025-10-15 08:00:00'),
                'end_date' => Carbon::parse('2025-10-18 18:00:00'),
                'location' => 'Ubaya Training Center (UTC), Trawas Mojokerto',
                'organizer' => 'Pengurus Provinsi PERKEMI Jawa Timur',
                'duration_text' => '4 Hari (15–18 Oktober 2025)',
                'status' => 'completed',
            ],
            'PN' => [
                'slug' => 'penataran-pelatih-nasional-2024',
                'title' => 'Penataran Pelatih Nasional PB PERKEMI 2024',
                'description' => 'Penataran Terpadu Pelatih Tingkat Nasional PB PERKEMI dalam Rangka Standardisasi Pembinaan Atlet Pelatda dan Pelatnas.',
                'start_date' => Carbon::parse('2024-12-18 08:00:00'),
                'end_date' => Carbon::parse('2024-12-22 18:00:00'),
                'location' => 'Pusdiklat Shorinji Kempo PB PERKEMI, Pondok Gede, Jakarta Timur',
                'organizer' => 'Pengurus Besar Persaudaraan Shorinji Kempo Indonesia (PB PERKEMI)',
                'duration_text' => '5 Hari (18–22 Desember 2024)',
                'status' => 'completed',
            ],
            'PEN' => [
                'slug' => 'penataran-penguji-nasional-2025',
                'title' => 'Penataran Penguji Nasional PB PERKEMI 2025',
                'description' => 'Penataran Dewan Penguji Bersertifikat Nasional untuk Pengujian UKT Dan PB PERKEMI.',
                'start_date' => Carbon::parse('2025-12-10 08:00:00'),
                'end_date' => Carbon::parse('2025-12-14 18:00:00'),
                'location' => 'Pusdiklat Shorinji Kempo PB PERKEMI, Jakarta',
                'organizer' => 'PB PERKEMI',
                'duration_text' => '5 Hari (10–14 Desember 2025)',
                'status' => 'completed',
            ],
            'WAN' => [
                'slug' => 'penataran-wasit-nasional-2025',
                'title' => 'Penataran Wasit Nasional PB PERKEMI 2025',
                'description' => 'Penataran dan Sertifikasi Wasit Nasional untuk Kejurnas, Babak Kualifikasi PON, dan PON.',
                'start_date' => Carbon::parse('2025-12-15 08:00:00'),
                'end_date' => Carbon::parse('2025-12-19 18:00:00'),
                'location' => 'Pusdiklat Shorinji Kempo PB PERKEMI, Jakarta',
                'organizer' => 'PB PERKEMI',
                'duration_text' => '5 Hari (15–19 Desember 2025)',
                'status' => 'completed',
            ],
        ];

        return collect($pastEventsConfig)->mapWithKeys(function (array $data, string $key) use ($organizer): array {
            $event = Event::withTrashed()->updateOrCreate(
                ['slug' => $data['slug']],
                [
                    ...$data,
                    'total_effective_jp' => 40,
                    'total_schedule_jp' => 44,
                    'jp_duration_minutes' => 45,
                    'learning_method' => 'Pleno & Kelas Praktik',
                    'quota' => 100,
                    'access_roles' => ['Peserta', 'Pelatih', 'Penguji', 'Wasit', 'Pemateri', 'Penyelenggara'],
                    'responsible_user_id' => $organizer->id,
                ]
            );

            if ($event->trashed()) {
                $event->restore();
            }

            return [$key => $event];
        });
    }

    /**
     * @return Collection<string, EventRoom>
     */
    private function seedRooms(Event $event): Collection
    {
        $roomsData = [
            'mf_hall' => 'MF Hall (Sesi Pleno)',
            'ruang_paralel' => 'Ruang 1 | 2 | 3 (Kelas Paralel)',
            'ruang_1' => 'Ruang 1 (Pelatih PD/PN)',
            'ruang_2' => 'Ruang 2 (Penguji PED/PEN)',
            'ruang_3' => 'Ruang 3 (Wasit WAD/WAN)',
            'registration' => 'Sekretariat Panitia & Registrasi',
            'dining' => 'Ruang Makan / Masjid',
        ];

        return collect($roomsData)->mapWithKeys(function (string $name, string $key) use ($event): array {
            $room = EventRoom::query()->firstOrCreate([
                'event_id' => $event->id,
                'name' => $name,
            ]);

            return [$key => $room];
        });
    }

    /**
     * @return Collection<string, Speaker>
     */
    private function seedSpeakers(Event $event): Collection
    {
        $speakers = [
            'ketum' => [
                'name' => 'Laksdya TNI (Purn.) Prof. Dr. Agus Setiadji, S.A.P., M.A.',
                'title_degree' => 'Prof. Dr. S.A.P., M.A.',
                'type' => 'internal',
                'dan_rank' => 'VII DAN',
                'position' => 'Ketua Umum PB PERKEMI',
                'organization' => 'PB PERKEMI',
                'specialization' => 'Filosofi, Sejarah, Ajaran & Pendidikan Karakter Shorinji Kempo',
                'bio' => 'Ketua Umum Pengurus Besar Persaudaraan Shorinji Kempo Indonesia.',
                'contact_email' => 'ketum@perkemi.org',
            ],
            'sekjen' => [
                'name' => 'Kolonel Laut (Purn.) Ir. Doddy W. Laksono, M.M.T.',
                'title_degree' => 'Ir., M.M.T.',
                'type' => 'internal',
                'dan_rank' => 'VI DAN',
                'position' => 'Sekretaris Jenderal PB PERKEMI',
                'organization' => 'PB PERKEMI',
                'specialization' => 'Regulasi, AD/ART, Tata Kelola & Administrasi PB PERKEMI',
                'bio' => 'Sekretaris Jenderal PB PERKEMI penandatangan Surat Persetujuan No. 235/PB-SJ/IX/2026.',
                'contact_email' => 'sekjen@perkemi.org',
            ],
            'wartoyo' => [
                'name' => 'SS. Wartoyo',
                'title_degree' => null,
                'type' => 'internal',
                'dan_rank' => 'VII DAN',
                'position' => 'Dewan Guru & Instruktur Pelatih PB PERKEMI',
                'organization' => 'PB PERKEMI',
                'specialization' => 'Kurikulum WSKO, Standardisasi Teknik & Metodologi Kepelatihan',
                'bio' => 'Sensei Senior Pembina Kepelatihan Nasional PB PERKEMI.',
                'contact_email' => 'wartoyo@perkemi.or.id',
            ],
            'yudi' => [
                'name' => 'SS. Yudi Siswantoro',
                'title_degree' => null,
                'type' => 'internal',
                'dan_rank' => 'VII DAN',
                'position' => 'Dewan Guru & Instruktur Penguji PB PERKEMI',
                'organization' => 'PB PERKEMI',
                'specialization' => 'Standardisasi Pengujian UKT, Rubrik Penilaian & Observasi Score Sheet',
                'bio' => 'Sensei Senior Pembina Penguji Nasional PB PERKEMI.',
                'contact_email' => 'yudi.siswantoro@perkemi.or.id',
            ],
            'andreas' => [
                'name' => 'SS. Andreas Sohliem',
                'title_degree' => null,
                'type' => 'internal',
                'dan_rank' => 'VII DAN',
                'position' => 'Dewan Guru & Instruktur Wasit PB PERKEMI',
                'organization' => 'PB PERKEMI',
                'specialization' => 'Peraturan Pertandingan, Positioning Wasit, Decision Management & Video Review',
                'bio' => 'Sensei Senior Pembina Perwasitan Nasional dan Internasional WSKO.',
                'contact_email' => 'andreas.sohliem@perkemi.or.id',
            ],
            'amirul' => [
                'name' => 'R. Amirul Rasyied Yulianto, S.Psi., M.Si., Psikolog',
                'title_degree' => 'S.Psi., M.Si., Psikolog',
                'type' => 'external',
                'dan_rank' => null,
                'position' => 'Pakar Psikologi Mental Juara & Hipnoterapi Olahraga',
                'organization' => 'Asosiasi Psikologi Keolahragaan',
                'specialization' => 'Quantum Mind for Champions, Mental Toughness, Self-Mastery & Decision Under Pressure',
                'bio' => 'Psikolog olahraga nasional berfokus pada peak performance dan psychological coaching.',
                'contact_email' => 'amirul.rasyied@psikologi-kempo.test',
            ],
            'andri' => [
                'name' => 'Andri Suyoko, S.Pd., M.Kes.',
                'title_degree' => 'S.Pd., M.Kes.',
                'type' => 'external',
                'dan_rank' => null,
                'position' => 'Konsultan Sport Science & Kondisi Fisik',
                'organization' => 'Fakultas Ilmu Keolahragaan',
                'specialization' => 'Sport Science, Fisik, Kebugaran, Stamina, Endurance & Gizi-Hidrasi',
                'bio' => 'Spesialis sport science dan monitoring kesiapan fisik atlet berprestasi tinggi.',
                'contact_email' => 'andri.suyoko@sportscience.test',
            ],
            'gede' => [
                'name' => 'dr. Gede Chandra Purnama Yudha, Sp.OT (K)',
                'title_degree' => 'dr., Sp.OT (K)',
                'type' => 'external',
                'dan_rank' => null,
                'position' => 'Spesialis Orthopaedi & Traumatologi Konsultan',
                'organization' => 'Tim Medis & Rumah Sakit Olahraga',
                'specialization' => 'Kesehatan, Keselamatan, Penanganan Cedera Bela Diri, Pertolongan Pertama & Manajemen Risiko',
                'bio' => 'Dokter spesialis bedah ortopedi konsultan cedera olahraga.',
                'contact_email' => 'gede.chandra@medis-kempo.test',
            ],
            'christina' => [
                'name' => 'Prof. Dr. Dra. apt. Christina Avanti, M.Si.',
                'title_degree' => 'Prof. Dr. Dra. apt., M.Si.',
                'type' => 'external',
                'dan_rank' => null,
                'position' => 'Guru Besar & Wakil Rektor Universitas Surabaya (UBAYA)',
                'organization' => 'Universitas Surabaya (UBAYA)',
                'specialization' => 'Leadership Berbasis Integritas, Etika Profesional, Fairness & Mentoring',
                'bio' => 'Guru besar kepemimpinan dan etika dari Universitas Surabaya.',
                'contact_email' => 'christina.avanti@ubaya.ac.id',
            ],
            'sukadiono' => [
                'name' => 'Prof. Dr. dr. H. Sukadiono, M.M.',
                'title_degree' => 'Prof. Dr. dr. H., M.M.',
                'type' => 'external',
                'dan_rank' => null,
                'position' => 'Rektor Universitas Muhammadiyah Surabaya / Pakar Fisiologi Kedokteran',
                'organization' => 'Universitas Muhammadiyah Surabaya',
                'specialization' => 'Fisiologi Olahraga, Sistem Energi, Fatigue & Recovery Monitoring',
                'bio' => 'Pakar kedokteran olahraga dan fisiologi latihan fisik.',
                'contact_email' => 'sukadiono@um-surabaya.ac.id',
            ],
            'suryanto' => [
                'name' => 'Prof. Dr. Suryanto, M.Si., Psikolog',
                'title_degree' => 'Prof. Dr., M.Si., Psikolog',
                'type' => 'external',
                'dan_rank' => null,
                'position' => 'Guru Besar Psikologi Sosial & Keolahragaan UNAIR',
                'organization' => 'Universitas Airlangga (UNAIR)',
                'specialization' => 'Psikologi Sosial Olahraga, Dinamika Kelompok, Bias & Fairness Keputusan',
                'bio' => 'Pakar psikologi sosial dan kepemimpinan olahraga.',
                'contact_email' => 'suryanto@psikologi.unair.ac.id',
            ],
            'dewan_guru' => [
                'name' => 'Tim Dewan Guru & Instruktur (SS. Wartoyo | SS. Yudi S. | SS. Andreas S.)',
                'title_degree' => null,
                'type' => 'internal',
                'dan_rank' => 'VII DAN',
                'position' => 'Dewan Guru & Instruktur PB PERKEMI',
                'organization' => 'PB PERKEMI',
                'specialization' => 'Pelatih, Penguji & Wasit (3 Kelas Paralel)',
                'bio' => 'Tim instruktur Dewan Guru PB PERKEMI pengampu materi dan pendalaman silabus kelas paralel.',
                'contact_email' => 'dewan.guru.paralel@perkemi.org',
            ],
            'panitia' => [
                'name' => 'Panitia & Tim Akademik PERKEMI Jatim',
                'title_degree' => null,
                'type' => 'internal',
                'dan_rank' => 'V DAN',
                'position' => 'Panitia Pelaksana Penataran PERKEMI Jatim 2026',
                'organization' => 'Pengprov PERKEMI Jawa Timur',
                'specialization' => 'Operasional, Verifikasi Administrasi, Presensi & Evaluasi Akademik',
                'bio' => 'Tim Panitia Pelaksana dan Bidang Akademik Pengprov PERKEMI Jawa Timur.',
                'contact_email' => 'panitia.jatim2026@perkemi.org',
            ],
        ];

        return collect($speakers)->mapWithKeys(function (array $speaker, string $key) use ($event): array {
            $model = Speaker::withTrashed()->updateOrCreate(
                ['contact_email' => $speaker['contact_email']],
                [
                    ...$speaker,
                    'event_id' => $event->id,
                    'is_active' => true,
                ]
            );

            if ($model->trashed()) {
                $model->restore();
            }

            return [$key => $model];
        });
    }

    /**
     * @param  Collection<string, Speaker>  $speakers
     * @return Collection<string, EventModule>
     */
    private function seedModules(Event $event, Collection $speakers): Collection
    {
        $materialMap = [
            'pelatih_daerah' => Material::query()->where('title', 'like', '%Pelatih Daerah%')->where('title', 'like', '%Modul%')->first(),
            'pelatih_nasional' => Material::query()->where('title', 'like', '%Pelatih Nasional%')->where('title', 'like', '%Modul%')->first(),
            'wasit_daerah' => Material::query()->where('title', 'like', '%Wasit Daerah%')->where('title', 'like', '%Modul%')->first(),
            'penguji' => Material::query()->where('title', 'like', '%Penguji Daerah dan Nasional%')->first(),
            'wasit_bahan_ajar' => Material::query()->where('title', 'like', '%Wasit Daerah dan Nasional%')->where('title', 'like', '%Bahan Ajar%')->first(),
            'metodologi' => Material::query()->where('title', 'like', '%Metodologi Kepelatihan%')->first(),
            'ukt' => Material::query()->where('title', 'like', '%Standarisasi Teknik & Evaluasi%')->first(),
            'tokuhon' => Material::query()->where('title', 'like', '%Tokuhon%')->first(),
            'praktek_pelatih' => Material::query()->where('title', 'like', '%Kompetensi Dan Sikap Pelatih Nasional%')->first(),
            'praktek_wasit' => Material::query()->where('title', 'like', '%Praktek Penataran Wasit%')->first(),
            'kyu_kenshi' => Material::query()->where('title', 'like', '%Kyu Kenshi%')->first(),
            'regulasi' => Material::query()->where('title', 'like', '%Regulasi Nasional%')->first(),
        ];

        $modules = [
            'filosofi' => [
                'code' => 'JTM-MOD-01',
                'title' => 'Filosofi, Sejarah, Ajaran & Pendidikan Karakter Shorinji Kempo',
                'description' => 'Falsafah Budo Kempo, nilai persaudaraan, Gyo, Gi-Jutsu-Ryaku, Shu-Ha-Ri, serta integritas moral kenshi.',
                'jp' => 3,
                'track_codes' => self::ALL_TRACKS,
                'speaker' => 'ketum',
                'material' => $materialMap['tokuhon'],
            ],
            'kurikulum' => [
                'code' => 'JTM-MOD-02',
                'title' => 'Kurikulum Standarisasi Teknik WSKO / Goho & Juho',
                'description' => 'Standardisasi teknik Kihon, Hokei, Goho, Juho dan kaidah pembelajaran teknik WSKO/Kyohan.',
                'jp' => 3,
                'track_codes' => self::ALL_TRACKS,
                'speaker' => 'wartoyo',
                'material' => $materialMap['kyu_kenshi'],
            ],
            'blok_pelatih' => [
                'code' => 'JTM-MOD-03',
                'title' => 'Blok Metodologi Kepelatihan & Program Latihan Dojo',
                'description' => 'Didaktik metodik, microteaching kepelatihan, periodisasi program latihan dan pembinaan atlet tangguh.',
                'jp' => 6,
                'track_codes' => ['PD', 'PN'],
                'speaker' => 'wartoyo',
                'material' => $materialMap['metodologi'] ?? $materialMap['pelatih_daerah'],
            ],
            'blok_penguji' => [
                'code' => 'JTM-MOD-04',
                'title' => 'Blok Standardisasi Pengujian UKT & Rubrik Penilaian',
                'description' => 'Blueprint evaluasi, rubrik observasi score sheet UKT Kyu/Dan, moderasi dan kalibrasi penilaian.',
                'jp' => 6,
                'track_codes' => ['PED', 'PEN'],
                'speaker' => 'yudi',
                'material' => $materialMap['ukt'] ?? $materialMap['penguji'],
            ],
            'blok_wasit' => [
                'code' => 'JTM-MOD-05',
                'title' => 'Blok Regulasi Perwasitan, Gelanggang & Decision Management',
                'description' => 'Rules interpretation, positioning di gelanggang, decision management, dan video review pertandingan.',
                'jp' => 6,
                'track_codes' => ['WAD', 'WAN'],
                'speaker' => 'andreas',
                'material' => $materialMap['wasit_bahan_ajar'] ?? $materialMap['wasit_daerah'],
            ],
            'regulasi' => [
                'code' => 'JTM-MOD-06',
                'title' => 'Regulasi, AD/ART, Tata Kelola & Administrasi PB PERKEMI',
                'description' => 'Hierarki norma hukum PERKEMI, mandat organisasi, administrasi kejuaraan, dan ketaatan konstitusi.',
                'jp' => 3,
                'track_codes' => self::ALL_TRACKS,
                'speaker' => 'sekjen',
                'material' => $materialMap['regulasi'],
            ],
        ];

        return collect($modules)->mapWithKeys(function (array $mod, string $key) use ($event, $speakers): array {
            $speaker = isset($mod['speaker']) ? $speakers->get($mod['speaker']) : null;
            $material = $mod['material'] ?? null;

            $model = EventModule::query()->updateOrCreate(
                ['event_id' => $event->id, 'code' => $mod['code']],
                [
                    'title' => $mod['title'],
                    'description' => $mod['description'],
                    'jp' => $mod['jp'],
                    'track_codes' => $mod['track_codes'],
                    'speaker_id' => $speaker?->id,
                    'material_id' => $material?->id,
                    'fulfillment_method' => 'Menghadiri kelas, pendalaman materi, dan menyelesaikan penugasan portofolio.',
                    'is_published' => true,
                    'learning_indicators' => 'Penguasaan materi teori dan praktik sesuai standardisasi nasional PB PERKEMI.',
                    'publication_status' => 'published',
                    'source_type' => $material ? 'collection' : 'event',
                ]
            );

            return [$key => $model];
        });
    }

    /**
     * @return array<string, CbtExamPackage>
     */
    private function seedCbtPackages(Event $event, ?User $organizer = null): array
    {
        // 1. Import Soal dari 4 File Excel ke Master Modul & Bank Soal
        $pelatihExcel = file_exists(public_path('xlsx/Bank_Soal_PD_PN_PERKEMI_2026.xlsx'))
            ? public_path('xlsx/Bank_Soal_PD_PN_PERKEMI_2026.xlsx')
            : public_path('xlsx/Bank_Soal_PreTest_PD30_Kuis20_PostTest50_PN50_Kuis30_PostTest80_PERKEMI_2026_REVISI_JAWABAN_HURUF (1).xlsx');

        $excelFiles = [
            public_path('xlsx/Bank_Soal_WAD_WAN_PERKEMI_2026.xlsx'),
            public_path('xlsx/Bank_Soal_PED_PEN_PERKEMI_2026_TERINTEGRASI.xlsx'),
            $pelatihExcel,
            public_path('xlsx/Bank_Soal_Gabungan_Penguji_Wasit_PERKEMI_2026.xlsx'),
        ];

        $importService = new QuestionModuleImportService;
        foreach ($excelFiles as $excelPath) {
            if (file_exists($excelPath)) {
                try {
                    $importService->import($excelPath, $organizer?->id, null);
                } catch (\Throwable $e) {
                    // Berkas telah diproses atau format modul sudah terbentuk
                }
            }
        }

        // 2. Pastikan penamaan, status aktif, dan metadata modul soal terpisah sesuai jalur peserta (WAD, WAN, PED, PEN, PD, PN)
        $explicitModuleTitles = [
            'QM-WAD-PRE' => ['title' => 'Pre-Test Wasit Daerah (WAD)', 'tracks' => ['WAD'], 'cat' => 'Wasit Daerah'],
            'QM-WAN-PRE' => ['title' => 'Pre-Test Wasit Nasional (WAN)', 'tracks' => ['WAN'], 'cat' => 'Wasit Nasional'],
            'QM-WAD-KUIS' => ['title' => 'Kuis Formatif Wasit Daerah (WAD)', 'tracks' => ['WAD'], 'cat' => 'Wasit Daerah'],
            'QM-WAN-KUIS' => ['title' => 'Kuis Formatif Wasit Nasional (WAN)', 'tracks' => ['WAN'], 'cat' => 'Wasit Nasional'],
            'QM-WAD-POST' => ['title' => 'Post-Test Wasit Daerah (WAD)', 'tracks' => ['WAD'], 'cat' => 'Wasit Daerah'],
            'QM-WAN-POST' => ['title' => 'Post-Test Wasit Nasional (WAN)', 'tracks' => ['WAN'], 'cat' => 'Wasit Nasional'],
            'QM-PED-PRE' => ['title' => 'Pre-Test Penguji Daerah (PED)', 'tracks' => ['PED'], 'cat' => 'Penguji Daerah'],
            'QM-PEN-PRE' => ['title' => 'Pre-Test Penguji Nasional (PEN)', 'tracks' => ['PEN'], 'cat' => 'Penguji Nasional'],
            'QM-PED-KUIS' => ['title' => 'Kuis Formatif Penguji Daerah (PED)', 'tracks' => ['PED'], 'cat' => 'Penguji Daerah'],
            'QM-PEN-KUIS' => ['title' => 'Kuis Formatif Penguji Nasional (PEN)', 'tracks' => ['PEN'], 'cat' => 'Penguji Nasional'],
            'QM-PED-POST' => ['title' => 'Post-Test Penguji Daerah (PED)', 'tracks' => ['PED'], 'cat' => 'Penguji Daerah'],
            'QM-PEN-POST' => ['title' => 'Post-Test Penguji Nasional (PEN)', 'tracks' => ['PEN'], 'cat' => 'Penguji Nasional'],
            'QM-PD-PRE' => ['title' => 'Pre-Test Pelatih Daerah (PD)', 'tracks' => ['PD'], 'cat' => 'Pelatih Daerah'],
            'QM-PN-PRE' => ['title' => 'Pre-Test Pelatih Nasional (PN)', 'tracks' => ['PN'], 'cat' => 'Pelatih Nasional'],
            'QM-PD-KUIS' => ['title' => 'Kuis Formatif Pelatih Daerah (PD)', 'tracks' => ['PD'], 'cat' => 'Pelatih Daerah'],
            'QM-PN-KUIS' => ['title' => 'Kuis Formatif Pelatih Nasional (PN)', 'tracks' => ['PN'], 'cat' => 'Pelatih Nasional'],
            'QM-PD-POST' => ['title' => 'Post-Test Pelatih Daerah (PD)', 'tracks' => ['PD'], 'cat' => 'Pelatih Daerah'],
            'QM-PN-POST' => ['title' => 'Post-Test Pelatih Nasional (PN)', 'tracks' => ['PN'], 'cat' => 'Pelatih Nasional'],
        ];

        foreach ($explicitModuleTitles as $mCode => $mMeta) {
            QuestionModule::query()->where('code', $mCode)->update([
                'title' => $mMeta['title'],
                'track_codes' => $mMeta['tracks'],
                'category' => $mMeta['cat'],
                'status' => 'active',
            ]);
        }

        // 4. Konfigurasi 18 Paket Ujian CBT Berdasarkan Jalur & Durasi Resmi
        $packagesConfig = [
            // --- 1. PRE-TEST DAERAH (30 MENIT) ---
            'CBT-PRE-WAD-26' => [
                'title' => 'Pre-Test Penataran Wasit Daerah (WAD) PERKEMI 2026',
                'description' => 'Evaluasi diagnostik awal materi perwasitan tingkat daerah, peraturan pertandingan WSKO, dan keselamatan kenshi.',
                'exam_type' => 'pre_test',
                'duration_minutes' => 30,
                'target_tracks' => ['WAD'],
                'module_code' => 'QM-WAD-PRE',
                'passing_score' => 70.00,
                'attempts_allowed' => 1,
            ],
            'CBT-PRE-PED-26' => [
                'title' => 'Pre-Test Penataran Penguji Daerah (PED) PERKEMI 2026',
                'description' => 'Evaluasi diagnostik awal materi standardisasi pengujian UKT Kyu 6 - Kyu 1, score sheet, dan rubrik evaluasi teknik.',
                'exam_type' => 'pre_test',
                'duration_minutes' => 30,
                'target_tracks' => ['PED'],
                'module_code' => 'QM-PED-PRE',
                'passing_score' => 70.00,
                'attempts_allowed' => 1,
            ],
            'CBT-PRE-PD-26' => [
                'title' => 'Pre-Test Penataran Pelatih Daerah (PD) PERKEMI 2026',
                'description' => 'Evaluasi diagnostik awal metodologi kepelatihan dojo, kurikulum silabus dasar WSKO, dan prinsip Shu-Ha-Ri.',
                'exam_type' => 'pre_test',
                'duration_minutes' => 30,
                'target_tracks' => ['PD'],
                'module_code' => 'QM-PD-PRE',
                'passing_score' => 70.00,
                'attempts_allowed' => 1,
            ],

            // --- 2. PRE-TEST NASIONAL (45 MENIT) ---
            'CBT-PRE-WAN-26' => [
                'title' => 'Pre-Test Penataran Wasit Nasional (WAN) PERKEMI 2026',
                'description' => 'Evaluasi diagnostik awal regulasi pertandingan nasional/internasional WSKO, positioning gelanggang, dan manajemen insiden.',
                'exam_type' => 'pre_test',
                'duration_minutes' => 45,
                'target_tracks' => ['WAN'],
                'module_code' => 'QM-WAN-PRE',
                'passing_score' => 75.00,
                'attempts_allowed' => 1,
            ],
            'CBT-PRE-PEN-26' => [
                'title' => 'Pre-Test Penataran Penguji Nasional (PEN) PERKEMI 2026',
                'description' => 'Evaluasi diagnostik awal pengujian tingkat Yudansha (I Dan - III Dan), kalibrasi objektivitas penilaian, dan etika dewan penguji.',
                'exam_type' => 'pre_test',
                'duration_minutes' => 45,
                'target_tracks' => ['PEN'],
                'module_code' => 'QM-PEN-PRE',
                'passing_score' => 75.00,
                'attempts_allowed' => 1,
            ],
            'CBT-PRE-PN-26' => [
                'title' => 'Pre-Test Penataran Pelatih Nasional (PN) PERKEMI 2026',
                'description' => 'Evaluasi diagnostik awal sport science kepelatihan, periodisasi latihan atlet Pelatda/Pelatnas, dan standarisasi teknik tingkat tinggi.',
                'exam_type' => 'pre_test',
                'duration_minutes' => 45,
                'target_tracks' => ['PN'],
                'module_code' => 'QM-PN-PRE',
                'passing_score' => 75.00,
                'attempts_allowed' => 1,
            ],

            // --- 3. KUIS FORMATIF (60 MENIT) ---
            'CBT-QUIZ-WAD-26' => [
                'title' => 'Kuis Formatif Wasit Daerah (WAD) PERKEMI 2026',
                'description' => 'Kuis pemahaman cepat materi sinyal wasit, istilah perwasitan jepang, dan batas gelanggang.',
                'exam_type' => 'module_eval',
                'duration_minutes' => 60,
                'target_tracks' => ['WAD'],
                'module_code' => 'QM-WAD-KUIS',
                'passing_score' => 75.00,
                'attempts_allowed' => 2,
            ],
            'CBT-QUIZ-WAN-26' => [
                'title' => 'Kuis Formatif Wasit Nasional (WAN) PERKEMI 2026',
                'description' => 'Kuis pemahaman cepat studi kasus pertandingan Kumi Embu & Randori tingkat nasional.',
                'exam_type' => 'module_eval',
                'duration_minutes' => 60,
                'target_tracks' => ['WAN'],
                'module_code' => 'QM-WAN-KUIS',
                'passing_score' => 75.00,
                'attempts_allowed' => 2,
            ],
            'CBT-QUIZ-PED-26' => [
                'title' => 'Kuis Formatif Penguji Daerah (PED) PERKEMI 2026',
                'description' => 'Kuis pemahaman rubrik pengujian Kyu Kenshi dan kalibrasi score sheet.',
                'exam_type' => 'module_eval',
                'duration_minutes' => 60,
                'target_tracks' => ['PED'],
                'module_code' => 'QM-PED-KUIS',
                'passing_score' => 75.00,
                'attempts_allowed' => 2,
            ],
            'CBT-QUIZ-PEN-26' => [
                'title' => 'Kuis Formatif Penguji Nasional (PEN) PERKEMI 2026',
                'description' => 'Kuis pemahaman rubrik pengujian Yudansha tingkat Dan dan moderasi dewan penguji.',
                'exam_type' => 'module_eval',
                'duration_minutes' => 60,
                'target_tracks' => ['PEN'],
                'module_code' => 'QM-PEN-KUIS',
                'passing_score' => 75.00,
                'attempts_allowed' => 2,
            ],
            'CBT-QUIZ-PD-26' => [
                'title' => 'Kuis Formatif Pelatih Daerah (PD) PERKEMI 2026',
                'description' => 'Kuis pemahaman materi didaktik metodik dasar dan keselamatan latihan kenshi pemula.',
                'exam_type' => 'module_eval',
                'duration_minutes' => 60,
                'target_tracks' => ['PD'],
                'module_code' => 'QM-PD-KUIS',
                'passing_score' => 75.00,
                'attempts_allowed' => 2,
            ],
            'CBT-QUIZ-PN-26' => [
                'title' => 'Kuis Formatif Pelatih Nasional (PN) PERKEMI 2026',
                'description' => 'Kuis pemahaman materi periodisasi latihan fisik, nutrisi, dan pemulihan atlet.',
                'exam_type' => 'module_eval',
                'duration_minutes' => 60,
                'target_tracks' => ['PN'],
                'module_code' => 'QM-PN-KUIS',
                'passing_score' => 75.00,
                'attempts_allowed' => 2,
            ],

            // --- 4. POST-TEST DAERAH (60 MENIT) ---
            'CBT-POST-WAD-26' => [
                'title' => 'Post-Test & Ujian Teori Wasit Daerah (WAD) PERKEMI 2026',
                'description' => 'Evaluasi kelulusan teori perwasitan tingkat daerah, analisis pelanggaran, dan pengambilan keputusan adil.',
                'exam_type' => 'post_test',
                'duration_minutes' => 60,
                'target_tracks' => ['WAD'],
                'module_code' => 'QM-WAD-POST',
                'passing_score' => 75.00,
                'attempts_allowed' => 1,
            ],
            'CBT-POST-PED-26' => [
                'title' => 'Post-Test & Ujian Teori Penguji Daerah (PED) PERKEMI 2026',
                'description' => 'Evaluasi kelulusan teori pengujian tingkat daerah, standar baku teknik WSKO, dan etika penguji.',
                'exam_type' => 'post_test',
                'duration_minutes' => 60,
                'target_tracks' => ['PED'],
                'module_code' => 'QM-PED-POST',
                'passing_score' => 75.00,
                'attempts_allowed' => 1,
            ],
            'CBT-POST-PD-26' => [
                'title' => 'Post-Test & Ujian Teori Pelatih Daerah (PD) PERKEMI 2026',
                'description' => 'Evaluasi kelulusan teori kepelatihan tingkat daerah, penyusunan rencana latihan dojo, dan pembinaan kenshi.',
                'exam_type' => 'post_test',
                'duration_minutes' => 60,
                'target_tracks' => ['PD'],
                'module_code' => 'QM-PD-POST',
                'passing_score' => 75.00,
                'attempts_allowed' => 1,
            ],

            // --- 5. POST-TEST NASIONAL (90 MENIT) ---
            'CBT-POST-WAN-26' => [
                'title' => 'Post-Test & Ujian Teori Wasit Nasional (WAN) PERKEMI 2026',
                'description' => 'Evaluasi komprehensif teori perwasitan tingkat nasional, regulasi internasional WSKO, dan studi kasus video perwasitan.',
                'exam_type' => 'post_test',
                'duration_minutes' => 90,
                'target_tracks' => ['WAN'],
                'module_code' => 'QM-WAN-POST',
                'passing_score' => 80.00,
                'attempts_allowed' => 1,
            ],
            'CBT-POST-PEN-26' => [
                'title' => 'Post-Test & Ujian Teori Penguji Nasional (PEN) PERKEMI 2026',
                'description' => 'Evaluasi komprehensif teori pengujian tingkat nasional, rubrik pengujian Dan, dan blueprint asesmen kompetensi.',
                'exam_type' => 'post_test',
                'duration_minutes' => 90,
                'target_tracks' => ['PEN'],
                'module_code' => 'QM-PEN-POST',
                'passing_score' => 80.00,
                'attempts_allowed' => 1,
            ],
            'CBT-POST-PN-26' => [
                'title' => 'Post-Test & Ujian Teori Pelatih Nasional (PN) PERKEMI 2026',
                'description' => 'Evaluasi komprehensif teori kepelatihan tingkat nasional, metodologi latihan atlet elit, sport science, dan integritas Budo.',
                'exam_type' => 'post_test',
                'duration_minutes' => 90,
                'target_tracks' => ['PN'],
                'module_code' => 'QM-PN-POST',
                'passing_score' => 80.00,
                'attempts_allowed' => 1,
            ],

            // --- 6. STANDARISASI TEORI TERPADU (KOMPREHENSIF) ---
            'CBT-JTM26-PLT' => [
                'title' => 'Ujian Teori Standarisasi Kepelatihan Shorinji Kempo 2026',
                'description' => 'Evaluasi kompetensi teori kepelatihan, didaktik metodik, standarisasi silabus WSKO, dan program latihan dojo.',
                'exam_type' => 'theory',
                'duration_minutes' => 60,
                'target_tracks' => ['PD', 'PN'],
                'module_code' => 'QM-PD-POST',
                'passing_score' => 75.00,
                'attempts_allowed' => 2,
            ],
            'CBT-JTM26-PGJ' => [
                'title' => 'Ujian Teori Standarisasi Pengujian UKT Shorinji Kempo 2026',
                'description' => 'Evaluasi kompetensi penguji UKT Kyu/Dan, rubrik observasi score sheet, objektivitas penilaian, dan etika penguji.',
                'exam_type' => 'theory',
                'duration_minutes' => 60,
                'target_tracks' => ['PED', 'PEN'],
                'module_code' => 'QM-PED-POST',
                'passing_score' => 75.00,
                'attempts_allowed' => 2,
            ],
            'CBT-JTM26-WST' => [
                'title' => 'Ujian Teori Regulasi & Perwasitan Shorinji Kempo 2026',
                'description' => 'Evaluasi peraturan pertandingan Tandoku Embu, Kumi Embu, Randori, positioning wasit, dan pengambilan keputusan adil.',
                'exam_type' => 'theory',
                'duration_minutes' => 60,
                'target_tracks' => ['WAD', 'WAN'],
                'module_code' => 'QM-WAD-POST',
                'passing_score' => 75.00,
                'attempts_allowed' => 2,
            ],
        ];

        $seeded = [];
        $sortOrder = 1;

        foreach ($packagesConfig as $code => $cfg) {
            $module = QuestionModule::where('code', $cfg['module_code'])->first();
            $moduleId = $module?->id;

            $package = CbtExamPackage::query()->updateOrCreate(
                ['code' => $code],
                [
                    'event_id' => $event->id,
                    'title' => $cfg['title'],
                    'description' => $cfg['description'],
                    'exam_type' => $cfg['exam_type'],
                    'duration_minutes' => $cfg['duration_minutes'],
                    'target_tracks' => $cfg['target_tracks'],
                    'question_module_id' => $moduleId,
                    'question_module_ids' => $moduleId ? [$moduleId] : [],
                    'passing_score' => $cfg['passing_score'],
                    'attempts_allowed' => $cfg['attempts_allowed'],
                    'status' => 'open',
                    'randomize_questions' => false,
                    'randomize_answers' => false,
                    'result_display' => 'immediate',
                ]
            );

            // Hubungkan butir soal dari QuestionBank
            if ($module) {
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

                // Sinkronisasi tabel legacy CbtQuestion untuk kompatibilitas pengerjaan
                $package->questions()->delete();
                foreach ($bankQuestions as $idx => $bq) {
                    $formattedOptions = [];
                    foreach ($bq->options as $opt) {
                        $formattedOptions[] = [
                            'id' => $opt['key'] ?? $opt['id'] ?? 'A',
                            'text' => $opt['text'] ?? '',
                        ];
                    }

                    $package->questions()->create([
                        'sort_order' => $idx + 1,
                        'question_text' => $bq->question_text,
                        'question_type' => 'single_choice',
                        'options' => $formattedOptions,
                        'correct_answer' => $bq->correct_answer,
                        'points' => 1.00,
                        'explanation' => $bq->explanation,
                        'is_active' => true,
                    ]);
                }

                $package->update([
                    'total_questions' => count($syncData),
                    'status' => 'open',
                ]);
            }

            // Kaitkan ke Event CBT Packages
            foreach ($cfg['target_tracks'] as $trackCode) {
                DB::table('event_cbt_packages')->updateOrInsert(
                    [
                        'event_id' => $event->id,
                        'cbt_exam_package_id' => $package->id,
                        'participant_path_id' => $trackCode,
                    ],
                    [
                        'is_required' => true,
                        'sort_order' => $sortOrder++,
                        'availability_start_at' => $event->start_date,
                        'availability_end_at' => $event->end_date,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }

            $seeded[$code] = $package;
        }

        // Alias untuk kompatibilitas sesi & test
        $seeded['PLT'] = $seeded['CBT-POST-PD-26'] ?? reset($seeded);
        $seeded['PGJ'] = $seeded['CBT-POST-PED-26'] ?? reset($seeded);
        $seeded['WST'] = $seeded['CBT-POST-WAD-26'] ?? reset($seeded);

        return $seeded;
    }

    /**
     * Seed modul dan butir bank soal khusus Jalur Pelatih (PD & PN) dari Bank Soal Excel.
     */
    private function seedPelatihModulesAndQuestions(?User $organizer = null): void
    {
        $pelatihMappings = [
            'QM-PD-PRE' => [
                'title' => 'Pre-Test Pelatih Daerah (PD)',
                'category' => 'Pelatih Daerah',
                'stage' => 'pre_test',
                'track_codes' => ['PD'],
            ],
            'QM-PN-PRE' => [
                'title' => 'Pre-Test Pelatih Nasional (PN)',
                'category' => 'Pelatih Nasional',
                'stage' => 'pre_test',
                'track_codes' => ['PN'],
            ],
            'QM-PD-KUIS' => [
                'title' => 'Kuis Formatif Pelatih Daerah (PD)',
                'category' => 'Pelatih Daerah',
                'stage' => 'quiz',
                'track_codes' => ['PD'],
            ],
            'QM-PN-KUIS' => [
                'title' => 'Kuis Formatif Pelatih Nasional (PN)',
                'category' => 'Pelatih Nasional',
                'stage' => 'quiz',
                'track_codes' => ['PN'],
            ],
            'QM-PD-POST' => [
                'title' => 'Post-Test Pelatih Daerah (PD)',
                'category' => 'Pelatih Daerah',
                'stage' => 'post_test',
                'track_codes' => ['PD'],
            ],
            'QM-PN-POST' => [
                'title' => 'Post-Test Pelatih Nasional (PN)',
                'category' => 'Pelatih Nasional',
                'stage' => 'post_test',
                'track_codes' => ['PN'],
            ],
        ];

        foreach ($pelatihMappings as $code => $modData) {
            $slugBase = Str::slug($modData['title']);
            QuestionModule::query()->where('code', $code)->update([
                'title' => $modData['title'],
                'slug' => $slugBase,
                'category' => $modData['category'],
                'track_codes' => $modData['track_codes'],
                'status' => 'active',
            ]);
        }
    }

    /**
     * @param  Collection<string, EventRoom>  $rooms
     * @param  Collection<string, Speaker>  $speakers
     * @param  Collection<string, EventModule>  $modules
     * @param  array<string, CbtExamPackage>  $cbtPackages
     */
    private function seedSessions(Event $event, Collection $rooms, Collection $speakers, Collection $modules, array $cbtPackages): void
    {
        EventSession::query()->where('event_id', $event->id)->delete();

        // 1. Sesi Kehadiran Awal (Registrasi Kedatangan Kamis 24 Sep)
        $this->createSessionRecord($event, [
            'day' => 1,
            'date' => '2026-09-24',
            'session_number' => 'SESI-ARR-01',
            'start' => '08:00:00',
            'end' => '12:00:00',
            'jp' => 0,
            'type' => 'KEHADIRAN_AWAL',
            'topic' => 'Registrasi Kedatangan & Presensi Awal Peserta',
            'subtopic' => 'Verifikasi administrasi, kartu anggota PB PERKEMI, pembagian ID card dan kit penataran',
            'method' => 'Presensi Mandiri / Scan QR Registrasi',
            'room' => $rooms->get('registration'),
            'speaker' => $speakers->get('panitia'),
            'tracks' => self::ALL_TRACKS,
            'attendance_open' => true,
            'qr_token' => 'QR-JTM26-ARR-2026',
            'qr_code' => 'JTM26ARR',
        ]);

        // 2. Sesi Presensi Harian (Hari 1 s.d. 4)
        $dates = [1 => '2026-09-24', 2 => '2026-09-25', 3 => '2026-09-26', 4 => '2026-09-27'];
        foreach ($dates as $day => $dStr) {
            $this->createSessionRecord($event, [
                'day' => $day,
                'date' => $dStr,
                'session_number' => sprintf('SESI-HARIAN-D%d', $day),
                'start' => '06:00:00',
                'end' => '08:00:00',
                'jp' => 0,
                'type' => 'KEHADIRAN_HARIAN',
                'topic' => sprintf('Presensi Harian Hari ke-%d', $day),
                'subtopic' => sprintf('Presensi wajib sebelum mengikuti seluruh rangkaian jadwal hari ke-%d', $day),
                'method' => 'Presensi Harian / Scan QR',
                'room' => $rooms->get('registration'),
                'speaker' => $speakers->get('panitia'),
                'tracks' => self::ALL_TRACKS,
                'attendance_open' => true,
                'qr_token' => sprintf('QR-JTM26-D%d-HARIAN', $day),
                'qr_code' => sprintf('HARIAN%d', $day),
            ]);
        }

        // 3. Seluruh Sesi Berdasarkan Rundown Resmi
        $rundown = $this->getRundownData();
        $counter = 1;

        foreach ($rundown as $item) {
            $day = $item['day'];
            $date = $dates[$day];
            $startTime = str_replace('.', ':', $item['start']).':00';
            $endTime = str_replace('.', ':', $item['end']).':00';
            $typeClass = $item['type_class'];
            $title = $item['title'];
            $notes = $item['notes'] ?? '';

            // --- A. UJIAN PRE-TEST (Kamis, 24 Sep 14.00) Dipisah per Jalur ---
            if ($title === 'PRE TEST') {
                $examTracks = [
                    'PD' => ['name' => 'Pelatih Daerah (PD)', 'dur' => 30, 'room' => $rooms->get('ruang_1'), 'pkg' => 'CBT-PRE-PD-26', 'end' => '14:30:00', 'jp' => 1],
                    'PN' => ['name' => 'Pelatih Nasional (PN)', 'dur' => 45, 'room' => $rooms->get('ruang_1'), 'pkg' => 'CBT-PRE-PN-26', 'end' => '14:45:00', 'jp' => 1],
                    'PED' => ['name' => 'Penguji Daerah (PED)', 'dur' => 30, 'room' => $rooms->get('ruang_2'), 'pkg' => 'CBT-PRE-PED-26', 'end' => '14:30:00', 'jp' => 1],
                    'PEN' => ['name' => 'Penguji Nasional (PEN)', 'dur' => 45, 'room' => $rooms->get('ruang_2'), 'pkg' => 'CBT-PRE-PEN-26', 'end' => '14:45:00', 'jp' => 1],
                    'WAD' => ['name' => 'Wasit Daerah (WAD)', 'dur' => 30, 'room' => $rooms->get('ruang_3'), 'pkg' => 'CBT-PRE-WAD-26', 'end' => '14:30:00', 'jp' => 1],
                    'WAN' => ['name' => 'Wasit Nasional (WAN)', 'dur' => 45, 'room' => $rooms->get('ruang_3'), 'pkg' => 'CBT-PRE-WAN-26', 'end' => '14:45:00', 'jp' => 1],
                ];

                foreach ($examTracks as $tCode => $tCfg) {
                    $pkgModel = $cbtPackages[$tCfg['pkg']] ?? null;
                    $this->createSessionRecord($event, [
                        'day' => $day,
                        'date' => $date,
                        'session_number' => sprintf('SESI-D%02d-%02d-PRE-%s', $day, $counter, $tCode),
                        'start' => $startTime,
                        'end' => $tCfg['end'],
                        'jp' => $tCfg['jp'],
                        'type' => 'UJIAN',
                        'topic' => sprintf('Pre-Test Penataran — %s (%d Menit)', $tCfg['name'], $tCfg['dur']),
                        'subtopic' => sprintf('Evaluasi diagnostik awal materi penataran jalur %s', $tCfg['name']),
                        'method' => 'CBT Online / Asesmen Mandiri',
                        'room' => $tCfg['room'],
                        'speaker' => $speakers->get('panitia'),
                        'tracks' => [$tCode],
                        'attendance_open' => true,
                        'qr_token' => sprintf('QR-JTM26-D%d-PRE-%s', $day, $tCode),
                        'qr_code' => sprintf('PRE%s', $tCode),
                        'cbt_package_id' => $pkgModel?->id,
                    ]);
                }
                $counter++;

                continue;
            }

            // --- B. KUIS FORMATIF (Jumat, 25 Sep 18.15) Dipisah per Jalur ---
            if ($title === 'KUIS MATERI' || $typeClass === 'KUIS') {
                $quizTracks = [
                    'PD' => ['name' => 'Pelatih Daerah (PD)', 'room' => $rooms->get('ruang_1'), 'pkg' => 'CBT-QUIZ-PD-26'],
                    'PN' => ['name' => 'Pelatih Nasional (PN)', 'room' => $rooms->get('ruang_1'), 'pkg' => 'CBT-QUIZ-PN-26'],
                    'PED' => ['name' => 'Penguji Daerah (PED)', 'room' => $rooms->get('ruang_2'), 'pkg' => 'CBT-QUIZ-PED-26'],
                    'PEN' => ['name' => 'Penguji Nasional (PEN)', 'room' => $rooms->get('ruang_2'), 'pkg' => 'CBT-QUIZ-PEN-26'],
                    'WAD' => ['name' => 'Wasit Daerah (WAD)', 'room' => $rooms->get('ruang_3'), 'pkg' => 'CBT-QUIZ-WAD-26'],
                    'WAN' => ['name' => 'Wasit Nasional (WAN)', 'room' => $rooms->get('ruang_3'), 'pkg' => 'CBT-QUIZ-WAN-26'],
                ];

                foreach ($quizTracks as $tCode => $tCfg) {
                    $pkgModel = $cbtPackages[$tCfg['pkg']] ?? null;
                    $this->createSessionRecord($event, [
                        'day' => $day,
                        'date' => $date,
                        'session_number' => sprintf('SESI-D%02d-%02d-QUIZ-%s', $day, $counter, $tCode),
                        'start' => $startTime,
                        'end' => '19:15:00',
                        'jp' => 1,
                        'type' => 'UJIAN',
                        'topic' => sprintf('Kuis Formatif Materi — %s (60 Menit)', $tCfg['name']),
                        'subtopic' => sprintf('Kuis pemahaman formatif materi penataran jalur %s', $tCfg['name']),
                        'method' => 'CBT Online Formatif',
                        'room' => $tCfg['room'],
                        'speaker' => $speakers->get('panitia'),
                        'tracks' => [$tCode],
                        'attendance_open' => true,
                        'qr_token' => sprintf('QR-JTM26-D%d-QUIZ-%s', $day, $tCode),
                        'qr_code' => sprintf('QZ%s', $tCode),
                        'cbt_package_id' => $pkgModel?->id,
                    ]);
                }
                $counter++;

                continue;
            }

            // --- C. POST-TEST & UJIAN TEORI (Sabtu, 26 Sep 19.45) Dipisah per Jalur ---
            if ($title === 'POST TEST' || $typeClass === 'POST TEST') {
                $postTracks = [
                    'PD' => ['name' => 'Pelatih Daerah (PD)', 'dur' => 60, 'room' => $rooms->get('ruang_1'), 'pkg' => 'CBT-POST-PD-26', 'end' => '20:45:00', 'jp' => 1],
                    'PN' => ['name' => 'Pelatih Nasional (PN)', 'dur' => 90, 'room' => $rooms->get('ruang_1'), 'pkg' => 'CBT-POST-PN-26', 'end' => '21:15:00', 'jp' => 2],
                    'PED' => ['name' => 'Penguji Daerah (PED)', 'dur' => 60, 'room' => $rooms->get('ruang_2'), 'pkg' => 'CBT-POST-PED-26', 'end' => '20:45:00', 'jp' => 1],
                    'PEN' => ['name' => 'Penguji Nasional (PEN)', 'dur' => 90, 'room' => $rooms->get('ruang_2'), 'pkg' => 'CBT-POST-PEN-26', 'end' => '21:15:00', 'jp' => 2],
                    'WAD' => ['name' => 'Wasit Daerah (WAD)', 'dur' => 60, 'room' => $rooms->get('ruang_3'), 'pkg' => 'CBT-POST-WAD-26', 'end' => '20:45:00', 'jp' => 1],
                    'WAN' => ['name' => 'Wasit Nasional (WAN)', 'dur' => 90, 'room' => $rooms->get('ruang_3'), 'pkg' => 'CBT-POST-WAN-26', 'end' => '21:15:00', 'jp' => 2],
                ];

                foreach ($postTracks as $tCode => $tCfg) {
                    $pkgModel = $cbtPackages[$tCfg['pkg']] ?? null;
                    $this->createSessionRecord($event, [
                        'day' => $day,
                        'date' => $date,
                        'session_number' => sprintf('SESI-D%02d-%02d-POST-%s', $day, $counter, $tCode),
                        'start' => $startTime,
                        'end' => $tCfg['end'],
                        'jp' => $tCfg['jp'],
                        'type' => 'UJIAN',
                        'topic' => sprintf('Post-Test & Ujian Teori — %s (%d Menit)', $tCfg['name'], $tCfg['dur']),
                        'subtopic' => sprintf('Evaluasi sumatif kelulusan teori penataran jalur %s', $tCfg['name']),
                        'method' => 'CBT Online Sumatif',
                        'room' => $tCfg['room'],
                        'speaker' => $speakers->get('panitia'),
                        'tracks' => [$tCode],
                        'attendance_open' => true,
                        'qr_token' => sprintf('QR-JTM26-D%d-POST-%s', $day, $tCode),
                        'qr_code' => sprintf('PST%s', $tCode),
                        'cbt_package_id' => $pkgModel?->id,
                    ]);
                }
                $counter++;

                continue;
            }

            // --- D. 3 KELAS PARALEL (3 Ruang Terpisah: Pelatih, Penguji, Wasit) ---
            if ($typeClass === '3 KELAS PARALEL') {
                $pointers = array_map('trim', explode('|', $item['pointer']));
                $pltPointer = $pointers[0] ?? $item['pointer'];
                $pgjPointer = $pointers[1] ?? $item['pointer'];
                $wstPointer = $pointers[2] ?? $item['pointer'];

                $isUjian = str_contains($title, 'UJIAN') || str_contains($title, 'ASESMEN');
                $jp = $this->calculateJp($item['start'], $item['end']);

                // 1. Ruang 1 - Pelatih (PD / PN)
                $this->createSessionRecord($event, [
                    'day' => $day,
                    'date' => $date,
                    'session_number' => sprintf('SESI-D%02d-%02d-PLT', $day, $counter),
                    'start' => $startTime,
                    'end' => $endTime,
                    'jp' => $jp,
                    'type' => $isUjian ? 'UJIAN' : 'PAR_PELATIH',
                    'topic' => sprintf('%s — Kelas Pelatih (PD/PN)', $title),
                    'subtopic' => $pltPointer,
                    'method' => 'Kelas Paralel Pelatih (Ruang 1): Metodologi kepelatihan dojo dan standardisasi teknik WSKO',
                    'room' => $rooms->get('ruang_1'),
                    'speaker' => $speakers->get('wartoyo'),
                    'module' => $modules->get('blok_pelatih'),
                    'material' => $modules->get('blok_pelatih')?->material,
                    'tracks' => ['PD', 'PN'],
                    'attendance_open' => true,
                    'qr_token' => sprintf('QR-JTM26-D%d-%02d-PLT', $day, $counter),
                    'qr_code' => sprintf('JT%d%02dP', $day, $counter),
                    'cbt_package_id' => $isUjian ? ($cbtPackages['CBT-JTM26-PLT']?->id ?? $cbtPackages['PLT']?->id ?? null) : null,
                ]);

                // 2. Ruang 2 - Penguji (PED / PEN)
                $this->createSessionRecord($event, [
                    'day' => $day,
                    'date' => $date,
                    'session_number' => sprintf('SESI-D%02d-%02d-PGJ', $day, $counter),
                    'start' => $startTime,
                    'end' => $endTime,
                    'jp' => $jp,
                    'type' => $isUjian ? 'UJIAN' : 'PAR_PENGUJI',
                    'topic' => sprintf('%s — Kelas Penguji (PED/PEN)', $title),
                    'subtopic' => $pgjPointer,
                    'method' => 'Kelas Paralel Penguji (Ruang 2): Standardisasi pengujian UKT, rubrik penilaian, dan kalibrasi score sheet',
                    'room' => $rooms->get('ruang_2'),
                    'speaker' => $speakers->get('yudi'),
                    'module' => $modules->get('blok_penguji'),
                    'material' => $modules->get('blok_penguji')?->material,
                    'tracks' => ['PED', 'PEN'],
                    'attendance_open' => true,
                    'qr_token' => sprintf('QR-JTM26-D%d-%02d-PGJ', $day, $counter),
                    'qr_code' => sprintf('JT%d%02dJ', $day, $counter),
                    'cbt_package_id' => $isUjian ? ($cbtPackages['CBT-JTM26-PGJ']?->id ?? $cbtPackages['PGJ']?->id ?? null) : null,
                ]);

                // 3. Ruang 3 - Wasit (WAD / WAN)
                $this->createSessionRecord($event, [
                    'day' => $day,
                    'date' => $date,
                    'session_number' => sprintf('SESI-D%02d-%02d-WST', $day, $counter),
                    'start' => $startTime,
                    'end' => $endTime,
                    'jp' => $jp,
                    'type' => $isUjian ? 'UJIAN' : 'PAR_WASIT',
                    'topic' => sprintf('%s — Kelas Wasit (WAD/WAN)', $title),
                    'subtopic' => $wstPointer,
                    'method' => 'Kelas Paralel Wasit (Ruang 3): Regulasi pertandingan, positioning gelanggang, decision management, dan video review',
                    'room' => $rooms->get('ruang_3'),
                    'speaker' => $speakers->get('andreas'),
                    'module' => $modules->get('blok_wasit'),
                    'material' => $modules->get('blok_wasit')?->material,
                    'tracks' => ['WAD', 'WAN'],
                    'attendance_open' => true,
                    'qr_token' => sprintf('QR-JTM26-D%d-%02d-WST', $day, $counter),
                    'qr_code' => sprintf('JT%d%02dW', $day, $counter),
                    'cbt_package_id' => $isUjian ? ($cbtPackages['CBT-JTM26-WST']?->id ?? $cbtPackages['WST']?->id ?? null) : null,
                ]);

                $counter++;

                continue;
            }

            // --- E. Sesi Pleno / Ishoma / Operasional ---
            $isOperational = in_array($title, ['MAKAN PAGI', 'ISHOMA', 'COFFEE BREAK', 'REGISTRASI PESERTA'], true);
            $typeCode = match (true) {
                $isOperational => 'OPERASIONAL',
                str_contains($title, 'REFLEKSI') => 'REFLEKSI',
                str_contains($title, 'PENUTUPAN') => 'PENUTUPAN',
                str_contains($title, 'UJIAN') || str_contains($title, 'ASESMEN') => 'UJIAN',
                default => 'PLENO',
            };

            $room = match ($item['room']) {
                'MF Hall' => $rooms->get('mf_hall'),
                'Sekretariat' => $rooms->get('registration'),
                'Ruang Makan / Masjid', 'Ruang Makan' => $rooms->get('dining'),
                default => $rooms->get('mf_hall'),
            };

            $speaker = match (true) {
                str_contains($item['speakers'], 'Agus Setiadji') => $speakers->get('ketum'),
                str_contains($item['speakers'], 'Doddy W') => $speakers->get('sekjen'),
                str_contains($item['speakers'], 'Amirul Rasyied') => $speakers->get('amirul'),
                str_contains($item['speakers'], 'Andri Suyoko') => $speakers->get('andri'),
                str_contains($item['speakers'], 'Gede Chandra') => $speakers->get('gede'),
                str_contains($item['speakers'], 'Christina Avanti') => $speakers->get('christina'),
                str_contains($item['speakers'], 'Sukadiono') => $speakers->get('sukadiono'),
                str_contains($item['speakers'], 'Suryanto') => $speakers->get('suryanto'),
                str_contains($item['speakers'], 'Wartoyo') => $speakers->get('wartoyo'),
                default => $speakers->get('panitia'),
            };

            $module = match (true) {
                str_contains($title, 'FILOSOFI') => $modules->get('filosofi'),
                str_contains($title, 'KURIKULUM') => $modules->get('kurikulum'),
                str_contains($title, 'REGULASI') => $modules->get('regulasi'),
                default => null,
            };

            $sessionNum = sprintf('SESI-D%02d-%02d', $day, $counter);
            $this->createSessionRecord($event, [
                'day' => $day,
                'date' => $date,
                'session_number' => $sessionNum,
                'start' => $startTime,
                'end' => $endTime,
                'jp' => $isOperational ? 0 : $this->calculateJp($item['start'], $item['end']),
                'type' => $typeCode,
                'topic' => $title,
                'subtopic' => $item['pointer'],
                'method' => $isOperational ? 'Operasional / Ishoma' : 'Pemaparan Materi Pleno & Tanya Jawab',
                'room' => $room,
                'speaker' => $speaker,
                'module' => $module,
                'material' => $module?->material,
                'tracks' => self::ALL_TRACKS,
                'attendance_open' => ! $isOperational,
                'qr_token' => sprintf('QR-JTM26-D%d-%02d', $day, $counter),
                'qr_code' => sprintf('JT%d%02d', $day, $counter),
            ]);

            $counter++;
        }
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
            'room' => $data['room']?->name ?? 'MF Hall',
            'event_room_id' => $data['room']?->id,
            'speaker_id' => $data['speaker']?->id,
            'event_module_id' => $data['module']?->id ?? null,
            'material_id' => $data['material']?->id ?? null,
            'track_codes' => $data['tracks'] ?? self::ALL_TRACKS,
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

    private function calculateJp(string $start, string $end): int
    {
        $start = trim(str_replace([' ', '–'], ['', '-'], $start));
        $end = trim(str_replace([' ', '–'], ['', '-'], $end));

        if (! str_contains($start, '.') || ! str_contains($end, '.')) {
            return 1;
        }

        [$sh, $sm] = explode('.', $start);
        [$eh, $em] = explode('.', $end);

        $startMinutes = ((int) $sh * 60) + (int) $sm;
        $endMinutes = ((int) $eh * 60) + (int) $em;
        $diff = max(0, $endMinutes - $startMinutes);

        return max(1, (int) round($diff / 45));
    }

    /**
     * @param  Collection<string, Event>  $pastEvents
     */
    private function seedParticipants(Event $event, Collection $pastEvents): void
    {
        // 1. Bersihkan data dummy penataran lama jika ada (KNS-JTM-26%)
        $dummyParticipants = Participant::withTrashed()
            ->where('kenshi_id_number', 'like', 'KNS-JTM-26%')
            ->get();

        foreach ($dummyParticipants as $dummy) {
            EventParticipant::query()
                ->where('event_id', $event->id)
                ->where('participant_id', $dummy->id)
                ->delete();

            $userId = $dummy->user_id;
            $dummy->forceDelete();
            if ($userId) {
                User::query()
                    ->where('id', $userId)
                    ->where('email', 'like', '%@jatim.perkemi.id')
                    ->delete();
            }
        }

        // 2. Reset seluruh data operasional event penataran utama
        // Seluruh data absensi, verifikasi, hasil CBT, formulir, dan pakta integritas dikosongkan agar siap diproses pada hari pelaksanaan
        DB::table('event_attendances')->where('event_id', $event->id)->delete();
        DB::table('cbt_proctoring_events')->where('event_id', $event->id)->delete();
        DB::table('cbt_exam_attempts')->where('event_id', $event->id)->delete();
        DB::table('event_registration_forms')->where('event_id', $event->id)->delete();
        DB::table('event_integrity_pacts')->where('event_id', $event->id)->delete();

        // 3. Ambil seluruh data peserta dari API SIM Perkemi (atau fallback lokal)
        $records = $this->fetchPesertaRecords();

        $trackMap = [
            'Pelatih Daerah' => 'PD',
            'Pelatih Nasional' => 'PN',
            'Penguji Daerah' => 'PED',
            'Penguji Nasional' => 'PEN',
            'Wasit Daerah' => 'WAD',
            'Wasit Nasional' => 'WAN',
        ];

        $lastCertTrackMap = [
            'Pelatih Daerah' => 'PD',
            'Pelatih Nasional' => 'PN',
            'Penguji Daerah' => 'PED',
            'Penguji Nasional' => 'PEN',
            'Wasit Daerah' => 'WAD',
            'Wasit Nasional' => 'WAN',
            'Asisten Pelatih' => 'PD',
        ];

        $danMap = [
            '1 DAN' => 'I-DAN',
            '2 DAN' => 'II-DAN',
            '3 DAN' => 'III-DAN',
            '4 DAN' => 'IV-DAN',
            '5 DAN' => 'V-DAN',
            '6 DAN' => 'VI-DAN',
            '7 DAN' => 'VII-DAN',
            '8 DAN' => 'VIII-DAN',
        ];

        $trackCounters = [];
        $cbtPackagesByCode = CbtExamPackage::where('event_id', $event->id)->get()->keyBy('code');
        $sessions = $event->sessions()->get();
        $sessionsByNumber = $sessions->keyBy('session_number');

        foreach ($records as $idx => $r) {
            $nik = trim((string) ($r['peserta_nik'] ?? ''));
            if ($nik === '') {
                continue;
            }

            $name = trim((string) ($r['peserta_name'] ?? ''));
            $nikLevel = trim((string) ($r['nik_level'] ?? ''));
            $danRank = $danMap[$nikLevel] ?? (str_contains($nikLevel, 'DAN') ? str_replace(' ', '-', $nikLevel) : 'I-DAN');

            $sertifikasi = trim((string) ($r['peserta_sertifikasi'] ?? ''));
            $trackCode = $trackMap[$sertifikasi] ?? 'PD';

            $dojo = trim((string) ($r['dojo_name'] ?? ''));
            $city = trim((string) ($r['branch_name'] ?? ''));
            $province = trim((string) ($r['prov_name'] ?? ''));
            $birthplace = trim((string) ($r['bio_birthplace'] ?? ''));
            $birthdate = trim((string) ($r['bio_birthdate'] ?? ''));
            $gender = trim((string) ($r['peserta_gender'] ?? ''));
            $address = trim((string) ($r['peserta_address'] ?? ''));
            $phone = trim((string) ($r['peserta_phone'] ?? ''));
            if ($phone === '-' || $phone === '') {
                $phone = null;
            }
            $pekerjaan = trim((string) ($r['peserta_pekerjaan'] ?? ''));
            $telpPekerjaan = trim((string) ($r['peserta_telepon_pekerjaan'] ?? ''));
            $lastCert = trim((string) ($r['peserta_last_certificate'] ?? ''));
            $lastNoCert = trim((string) ($r['peserta_last_nocertificate'] ?? ''));

            $rawEmail = trim((string) ($r['peserta_email'] ?? ''));
            $email = $this->resolveParticipantEmail($rawEmail, $nik);

            $adminNotes = "Target: {$sertifikasi} ({$trackCode})".($lastCert !== '' ? " | Riwayat: {$lastCert} (No: {$lastNoCert})" : '');

            // Password peserta disamakan dengan peserta_nik (sesuai instruksi user)
            $user = User::query()->updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'role' => 'Peserta',
                    'password' => Hash::make($nik),
                ]
            );

            $participant = Participant::withTrashed()->updateOrCreate(
                ['kenshi_id_number' => $nik],
                [
                    'user_id' => $user->id,
                    'name' => $name,
                    'email' => $email,
                    'phone' => $phone,
                    'origin_province' => $province,
                    'origin_city' => $city,
                    'origin_dojo' => $dojo,
                    'dan_rank' => $danRank,
                    'birth_place' => $birthplace !== '' ? $birthplace : null,
                    'birth_date' => $birthdate !== '' ? $birthdate : null,
                    'gender' => $gender !== '' ? $gender : null,
                    'address' => $address !== '' ? $address : null,
                    'occupation' => $pekerjaan !== '' ? $pekerjaan : null,
                    'occupation_phone' => $telpPekerjaan !== '' ? $telpPekerjaan : null,
                    'last_certificate' => $lastCert !== '' ? $lastCert : null,
                    'last_certificate_number' => $lastNoCert !== '' ? $lastNoCert : null,
                    'target_certification' => $sertifikasi !== '' ? $sertifikasi : null,
                    'simperkemi_data' => $r,
                    'notes' => json_encode($r, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                    'admin_notes' => $adminNotes,
                    'event_id' => $event->id,
                ]
            );

            if ($participant->trashed()) {
                $participant->restore();
            }

            $trackCounters[$trackCode] = ($trackCounters[$trackCode] ?? 0) + 1;
            $trackOrder = $trackCounters[$trackCode];

            // Nilai evaluasi teori dan praktik realistis (di atas passing grade)
            $theoryScore = round(84.0 + (($idx % 11) * 1.1), 1);
            $practiceScore = round(86.0 + (($idx % 9) * 1.2), 1);
            $certNumber = sprintf('SK-%s-JTM-2026-%03d', $trackCode, $trackOrder);
            $transNumber = sprintf('TR-%s-JTM-2026-%03d', $trackCode, $trackOrder);

            // Pendaftaran di Event Utama (Penataran Jatim 2026) disinkronkan dengan rundown acara dan kelulusan
            $ep = EventParticipant::query()->updateOrCreate(
                [
                    'event_id' => $event->id,
                    'participant_id' => $participant->id,
                ],
                [
                    'track_code' => $trackCode,
                    'rotation_group' => $idx % 2 === 0 ? 'A1' : 'A2',
                    'admin_status' => 'verified',
                    'attendance_status' => 'attended',
                    'attendance_records' => [
                        '2026-09-24' => 'present',
                        '2026-09-25' => 'present',
                        '2026-09-26' => 'present',
                        '2026-09-27' => 'present',
                    ],
                    'has_seen_welcome' => true,
                    'checked_in_at' => Carbon::parse('2026-09-24 08:30:00')->addMinutes($idx % 60),
                    'checkin_status' => 'checked_in',
                    'graduation_status' => 'graduated',
                    'certificate_number' => $certNumber,
                    'transcript_number' => $transNumber,
                    'certificate_file_path' => null,
                    'transcript_file_path' => null,
                    'certificate_issued_at' => Carbon::parse('2026-09-27 13:30:00'),
                    'transcript_issued_at' => Carbon::parse('2026-09-27 13:30:00'),
                    'score_theory' => $theoryScore,
                    'score_practice' => $practiceScore,
                    'evaluation_notes' => "Lulus evaluasi standarisasi kompetensi {$trackCode} PERKEMI 2026 dengan predikat Sangat Baik.",
                ]
            );

            // Formulir pendaftaran terisi dan terverifikasi sesuai profil peserta
            $formType = match ($trackCode) {
                'PD', 'PN' => 'PELATIH',
                'PED', 'PEN' => 'PENGUJI',
                'WAD', 'WAN' => 'WASIT',
                default => 'PELATIH',
            };
            $penataranLevel = in_array($trackCode, ['PN', 'PEN', 'WAN'], true) ? 'Nasional' : 'Daerah';

            EventRegistrationForm::query()->updateOrCreate(
                [
                    'event_id' => $event->id,
                    'participant_id' => $participant->id,
                ],
                [
                    'event_participant_id' => $ep->id,
                    'form_type' => $formType,
                    'penataran_level' => $penataranLevel,
                    'start_date' => '2026-09-24',
                    'end_date' => '2026-09-27',
                    'location' => 'Ubaya Training Center (UTC), Trawas, Mojokerto',
                    'full_name' => $name,
                    'birth_place' => $birthplace !== '' ? $birthplace : $city,
                    'birth_date' => $birthdate !== '' ? $birthdate : null,
                    'kenshi_id_number' => $nik,
                    'dan_level' => $danRank,
                    'home_address' => $address !== '' ? $address : "Dojo {$dojo}, {$city}",
                    'phone_number' => $phone ?: '081234567890',
                    'email' => $email,
                    'occupation' => $pekerjaan !== '' ? $pekerjaan : 'Wiraswasta',
                    'occupation_address' => "Dojo {$dojo}, {$city}",
                    'occupation_phone' => $telpPekerjaan !== '' ? $telpPekerjaan : null,
                    'emergency_address' => $address !== '' ? $address : "Dojo {$dojo}, {$city}",
                    'emergency_phone' => $phone ?: '081234567890',
                    'sign_place' => 'Mojokerto',
                    'sign_date' => '2026-09-24',
                    'applicant_name' => $name,
                    'signature_data' => null,
                    'waiver_agreed' => true,
                    'waiver_signed_at' => Carbon::parse('2026-09-23 14:00:00'),
                    'status' => 'verified',
                    'submitted_at' => Carbon::parse('2026-09-23 14:00:00'),
                    'verified_at' => Carbon::parse('2026-09-24 09:00:00'),
                    'verified_by' => $event->responsible_user_id,
                    'admin_notes' => 'Dokumen kenshi terverifikasi sah dan lengkap oleh panitia.',
                ]
            );

            // Pakta Integritas Resmi PB PERKEMI ditandatangani digital
            EventIntegrityPact::query()->updateOrCreate(
                [
                    'event_id' => $event->id,
                    'participant_id' => $participant->id,
                    'pact_type' => EventIntegrityPactController::resolvePactType($trackCode),
                ],
                [
                    'event_participant_id' => $ep->id,
                    'track_code' => $trackCode,
                    'full_name' => $name,
                    'birth_place' => $birthplace !== '' ? $birthplace : $city,
                    'birth_date' => $birthdate !== '' ? $birthdate : '1990-01-01',
                    'kenshi_id_number' => $nik,
                    'dan_level' => $danRank,
                    'religion' => 'Islam',
                    'dojo' => $dojo,
                    'city' => $city,
                    'province' => $province,
                    'certificate_number' => $certNumber,
                    'valid_start_date' => Carbon::parse('2026-09-27'),
                    'valid_end_date' => Carbon::parse('2030-09-27'),
                    'id_card_address' => $address !== '' ? $address : "Dojo {$dojo}, {$city}",
                    'current_address' => $address !== '' ? $address : "Dojo {$dojo}, {$city}",
                    'management_organization' => $city ? "Pengcab {$city}" : 'Pengprov Jawa Timur',
                    'management_position' => match ($trackCode) {
                        'PD', 'PN' => 'Pelatih Dojo',
                        'PED', 'PEN' => 'Dewan Penguji',
                        'WAD', 'WAN' => 'Wasit Pertandingan',
                        default => 'Kenshi',
                    },
                    'sign_place' => 'Mojokerto',
                    'sign_date' => Carbon::parse('2026-09-27'),
                    'signature_data' => null,
                    'signed_at' => null,
                    'status' => 'draft',
                ]
            );

            // Presensi Sesi Kedatangan & Sesi Harian D1-D4
            $attendanceSchedule = [
                'SESI-ARR-01' => '2026-09-24 08:30:00',
                'SESI-HARIAN-D1' => '2026-09-24 08:35:00',
                'SESI-HARIAN-D2' => '2026-09-25 06:45:00',
                'SESI-HARIAN-D3' => '2026-09-26 06:40:00',
                'SESI-HARIAN-D4' => '2026-09-27 06:35:00',
            ];
            foreach ($attendanceSchedule as $sessNum => $attTime) {
                $attSess = $sessionsByNumber->get($sessNum);
                if ($attSess) {
                    EventAttendance::query()->updateOrCreate(
                        [
                            'event_id' => $event->id,
                            'event_session_id' => $attSess->id,
                            'participant_id' => $participant->id,
                        ],
                        [
                            'attendance_type' => 'check_in',
                            'status' => 'present',
                            'checked_in_at' => Carbon::parse($attTime)->addSeconds(($idx * 13) % 900),
                            'method' => 'qr_scan',
                            'recorded_by' => $event->responsible_user_id,
                        ]
                    );
                }
            }

            // Jika peserta memiliki riwayat sertifikasi sebelumnya, catat riwayat keikutsertaan event lampau
            if ($lastCert !== '') {
                $pastTrackCode = $lastCertTrackMap[$lastCert] ?? null;
                if ($pastTrackCode && $pastEvents->has($pastTrackCode)) {
                    $pastEvent = $pastEvents->get($pastTrackCode);
                    $pastEp = EventParticipant::query()->updateOrCreate(
                        [
                            'event_id' => $pastEvent->id,
                            'participant_id' => $participant->id,
                        ],
                        [
                            'track_code' => $pastTrackCode,
                            'rotation_group' => 'A1',
                            'admin_status' => 'verified',
                            'attendance_status' => 'attended',
                            'attendance_records' => [
                                $pastEvent->start_date->toDateString() => 'present',
                                $pastEvent->end_date->toDateString() => 'present',
                            ],
                            'has_seen_welcome' => true,
                            'checkin_status' => 'attended',
                            'graduation_status' => 'passed',
                            'certificate_number' => $lastNoCert !== '' ? $lastNoCert : sprintf('SK-%s-PREV-%04d', $pastTrackCode, $participant->id),
                            'certificate_issued_at' => $pastEvent->end_date,
                            'score_theory' => 88.5,
                            'score_practice' => 90.0,
                            'evaluation_notes' => sprintf('Lulus sertifikasi %s pada %s', $lastCert, $pastEvent->title),
                        ]
                    );

                    // Buat juga data Pakta Integritas bertanda tangan digital resmi untuk sertifikasi lampau ini
                    EventIntegrityPact::query()->updateOrCreate(
                        [
                            'event_id' => $pastEvent->id,
                            'participant_id' => $participant->id,
                            'pact_type' => EventIntegrityPactController::resolvePactType($pastTrackCode),
                        ],
                        [
                            'event_participant_id' => $pastEp->id,
                            'track_code' => $pastTrackCode,
                            'full_name' => $name,
                            'birth_place' => $birthplace !== '' ? $birthplace : $city,
                            'birth_date' => $birthdate !== '' ? $birthdate : '1990-01-01',
                            'kenshi_id_number' => $nik,
                            'dan_level' => $danRank,
                            'religion' => 'Islam',
                            'dojo' => $dojo,
                            'city' => $city,
                            'province' => $province,
                            'certificate_number' => $lastNoCert !== '' ? $lastNoCert : sprintf('SK-%s-PREV-%04d', $pastTrackCode, $participant->id),
                            'valid_start_date' => $pastEvent->end_date,
                            'valid_end_date' => Carbon::parse($pastEvent->end_date)->addYears(4),
                            'id_card_address' => $address !== '' ? $address : "Dojo {$dojo}, {$city}",
                            'current_address' => $address !== '' ? $address : "Dojo {$dojo}, {$city}",
                            'sign_place' => $city ?: 'Surabaya',
                            'sign_date' => $pastEvent->end_date,
                            'signature_data' => $this->generateSampleSignature($name),
                            'signed_at' => $pastEvent->end_date,
                            'status' => 'signed',
                        ]
                    );
                }
            }

            // Daftarkan juga ke event penataran-malam-ini jika ada di database
            $tonightEvent = Event::where('slug', 'penataran-malam-ini')->first();
            if ($tonightEvent) {
                EventParticipant::query()->updateOrCreate(
                    [
                        'event_id' => $tonightEvent->id,
                        'participant_id' => $participant->id,
                    ],
                    [
                        'track_code' => $trackCode,
                        'rotation_group' => $idx % 2 === 0 ? 'A1' : 'A2',
                        'admin_status' => 'pending',
                        'has_seen_welcome' => false,
                        'checkin_status' => 'registered',
                    ]
                );
            }
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function fetchPesertaRecords(): array
    {
        $localPath = __DIR__.'/data/simperkemi_peserta_jatim2026.json';

        try {
            $response = Http::timeout(15)->withoutVerifying()->get(self::API_PESERTA_URL);
            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['records']) && is_array($data['records']) && count($data['records']) > 0) {
                    if (is_dir(dirname($localPath))) {
                        file_put_contents($localPath, $response->body());
                    }

                    return $data['records'];
                }
            }
        } catch (\Throwable) {
            // Abaikan kegagalan jaringan dan beralih ke fallback file lokal
        }

        if (file_exists($localPath)) {
            $data = json_decode((string) file_get_contents($localPath), true);
            if (isset($data['records']) && is_array($data['records'])) {
                return $data['records'];
            }
        }

        return [];
    }

    private function resolveParticipantEmail(string $rawEmail, string $nik): string
    {
        $nikClean = strtolower((string) preg_replace('/[^a-zA-Z0-9]/', '', $nik));

        if ($rawEmail !== '' && $rawEmail !== '-') {
            $candidates = array_map('trim', explode(',', $rawEmail));
            foreach ($candidates as $cand) {
                if (filter_var($cand, FILTER_VALIDATE_EMAIL)) {
                    return strtolower($cand);
                }
            }
        }

        return "kenshi.{$nikClean}@jatim.perkemi.id";
    }

    /**
     * @return array<int, array{day: int, start: string, end: string, type_class: string, title: string, module_codes: string, pointer: string, speakers: string, participants: string, room: string, status_module: string, notes: string}>
     */
    private function getRundownData(): array
    {
        $csvPath = self::CSV_RUNDOWN_PATH;
        if (! file_exists($csvPath)) {
            return [];
        }

        $dayMap = [
            'Kamis, 24 September 2026' => 1,
            'Jumat, 25 September 2026' => 2,
            'Sabtu, 26 September 2026' => 3,
            'Minggu, 27 September 2026' => 4,
        ];

        $items = [];
        if (($handle = fopen($csvPath, 'r')) !== false) {
            fgetcsv($handle); // Lewati baris header

            while (($row = fgetcsv($handle)) !== false) {
                if (count($row) < 5) {
                    continue;
                }

                $dayStr = trim($row[0]);
                $day = $dayMap[$dayStr] ?? match (true) {
                    str_contains($dayStr, '24') => 1,
                    str_contains($dayStr, '25') => 2,
                    str_contains($dayStr, '26') => 3,
                    str_contains($dayStr, '27') => 4,
                    default => 1,
                };

                $waktu = trim($row[1]);
                $waktuParts = explode('-', str_replace([' ', '–'], ['', '-'], $waktu));
                $start = $waktuParts[0] ?? '08.00';
                $end = $waktuParts[1] ?? '09.00';

                $items[] = [
                    'day' => $day,
                    'start' => $start,
                    'end' => $end,
                    'type_class' => trim($row[2]),
                    'title' => trim($row[3]),
                    'module_codes' => trim($row[4] ?? '-'),
                    'pointer' => trim($row[5] ?? ''),
                    'speakers' => trim($row[6] ?? ''),
                    'participants' => trim($row[7] ?? ''),
                    'room' => trim($row[8] ?? ''),
                    'status_module' => trim($row[9] ?? ''),
                    'notes' => trim($row[10] ?? ''),
                ];
            }

            fclose($handle);
        }

        return $items;
    }

    private function generateSampleSignature(string $name): string
    {
        if (! extension_loaded('gd')) {
            return 'data:image/svg+xml;base64,'.base64_encode(
                '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100"><path d="M 20 60 Q 80 10 140 60 T 260 50" stroke="#0B63CE" stroke-width="3" fill="none"/></svg>'
            );
        }

        $im = imagecreatetruecolor(320, 100);
        imagesavealpha($im, true);
        $transparent = imagecolorallocatealpha($im, 0, 0, 0, 127);
        imagefill($im, 0, 0, $transparent);
        $blue = imagecolorallocate($im, 10, 63, 130);

        imagesetthickness($im, 3);
        $pts = [
            [25, 65], [60, 25], [95, 75], [130, 35], [165, 65],
            [195, 40], [225, 70], [255, 45], [285, 60],
        ];
        for ($i = 0; $i < count($pts) - 1; $i++) {
            imageline($im, $pts[$i][0], $pts[$i][1], $pts[$i + 1][0], $pts[$i + 1][1], $blue);
        }
        imageline($im, 20, 80, 290, 75, $blue);

        ob_start();
        imagepng($im);
        $data = ob_get_clean();
        imagedestroy($im);

        return 'data:image/png;base64,'.base64_encode((string) $data);
    }
}
