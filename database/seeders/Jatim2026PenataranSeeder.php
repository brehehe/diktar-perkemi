<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\EventModule;
use App\Models\EventParticipant;
use App\Models\EventRoom;
use App\Models\EventSession;
use App\Models\EventSessionType;
use App\Models\Material;
use App\Models\Participant;
use App\Models\ParticipantTrack;
use App\Models\Speaker;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;

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

            $event = $this->seedEvent();
            $rooms = $this->seedRooms($event);
            $speakers = $this->seedSpeakers($event);
            $modules = $this->seedModules($event, $speakers);

            $this->seedSessions($event, $rooms, $speakers, $modules);
            $this->seedParticipants($event);

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

    private function seedEvent(): Event
    {
        $organizer = User::query()->where('role', 'Penyelenggara')->first() ?? User::query()->where('role', 'Admin')->first();

        return Event::query()->updateOrCreate(
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
     * @param  Collection<string, EventRoom>  $rooms
     * @param  Collection<string, Speaker>  $speakers
     * @param  Collection<string, EventModule>  $modules
     */
    private function seedSessions(Event $event, Collection $rooms, Collection $speakers, Collection $modules): void
    {
        EventSession::query()->where('event_id', $event->id)->delete();

        // 1. Arrival Session (Kamis, 24 Sep)
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

        // 2. Daily Attendance Sessions (Days 1 to 4)
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

        // 3. Rundown Sessions From Excel File
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

            if ($typeClass === '3 KELAS PARALEL') {
                // Option B: Gabungkan 3 kelas paralel menjadi 1 sesi gabungan per slot waktu
                // 1 QR Code tunggal yang berlaku untuk seluruh peserta (Pelatih, Penguji, Wasit)
                $sessionNum = sprintf('SESI-D%02d-%02d', $day, $counter);
                $this->createSessionRecord($event, [
                    'day' => $day,
                    'date' => $date,
                    'session_number' => $sessionNum,
                    'start' => $startTime,
                    'end' => $endTime,
                    'jp' => $this->calculateJp($item['start'], $item['end']),
                    'type' => 'PARALEL',
                    'topic' => sprintf('%s (3 Kelas Paralel)', $title),
                    'subtopic' => $item['pointer'],
                    'method' => '3 Kelas Paralel: Pelatih (Ruang 1), Penguji (Ruang 2), Wasit (Ruang 3)',
                    'room' => $rooms->get('ruang_paralel'),
                    'speaker' => $speakers->get('dewan_guru'),
                    'module' => null,
                    'material' => null,
                    'tracks' => self::ALL_TRACKS,
                    'attendance_open' => true,
                    'qr_token' => sprintf('QR-JTM26-D%d-%02d', $day, $counter),
                    'qr_code' => sprintf('JT%d%02d', $day, $counter),
                ]);
                $counter++;
            } else {
                // Pleno / Break / Operational Session
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
        ]);
    }

    private function calculateJp(string $start, string $end): int
    {
        [$sh, $sm] = explode('.', $start);
        [$eh, $em] = explode('.', $end);

        $startMinutes = ((int) $sh * 60) + (int) $sm;
        $endMinutes = ((int) $eh * 60) + (int) $em;
        $diff = max(0, $endMinutes - $startMinutes);

        return max(1, (int) round($diff / 45));
    }

    private function seedParticipants(Event $event): void
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

        // 2. Ambil seluruh data peserta dari API SIM Perkemi (atau fallback lokal)
        $records = $this->fetchPesertaRecords();

        $trackMap = [
            'Pelatih Daerah' => 'PD',
            'Pelatih Nasional' => 'PN',
            'Penguji Daerah' => 'PED',
            'Penguji Nasional' => 'PEN',
            'Wasit Daerah' => 'WAD',
            'Wasit Nasional' => 'WAN',
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
        $defaultPasswordHash = Hash::make('password');

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
            $gender = trim((string) ($r['peserta_gender'] ?? ''));
            $address = trim((string) ($r['peserta_address'] ?? ''));
            $phone = trim((string) ($r['peserta_phone'] ?? ''));
            if ($phone === '-' || $phone === '') {
                $phone = null;
            }
            $pekerjaan = trim((string) ($r['peserta_pekerjaan'] ?? ''));
            $lastCert = trim((string) ($r['peserta_last_certificate'] ?? ''));
            $lastNoCert = trim((string) ($r['peserta_last_nocertificate'] ?? ''));

            $rawEmail = trim((string) ($r['peserta_email'] ?? ''));
            $email = $this->resolveParticipantEmail($rawEmail, $nik);

            $notesList = array_filter([
                "Sertifikasi Target: {$sertifikasi} ({$trackCode})",
                $birthplace !== '' ? "Tempat Lahir: {$birthplace}" : null,
                $gender !== '' ? "Jenis Kelamin: {$gender}" : null,
                $pekerjaan !== '' ? "Pekerjaan: {$pekerjaan}" : null,
                $address !== '' ? "Alamat: {$address}" : null,
                $lastCert !== '' ? "Sertifikat Sebelumnya: {$lastCert}".($lastNoCert !== '' ? " (No: {$lastNoCert})" : '') : null,
                'Terdaftar via SIM PERKEMI (Penataran Jatim 2026). Lunas iuran PB PERKEMI.',
            ]);
            $notes = implode(' | ', $notesList);

            $user = User::query()->updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'role' => 'Peserta',
                    'password' => $defaultPasswordHash,
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
                    'notes' => $notes,
                    'event_id' => $event->id,
                ]
            );

            if ($participant->trashed()) {
                $participant->restore();
            }

            $trackCounters[$trackCode] = ($trackCounters[$trackCode] ?? 0) + 1;
            $trackIndex = $trackCounters[$trackCode];

            EventParticipant::query()->updateOrCreate(
                [
                    'event_id' => $event->id,
                    'participant_id' => $participant->id,
                ],
                [
                    'track_code' => $trackCode,
                    'rotation_group' => $idx % 2 === 0 ? 'A1' : 'A2',
                    'admin_status' => 'verified',
                    'attendance_status' => 'registered',
                    'attendance_records' => [
                        '2026-09-24' => 'scheduled',
                        '2026-09-25' => 'scheduled',
                        '2026-09-26' => 'scheduled',
                        '2026-09-27' => 'scheduled',
                    ],
                    'has_seen_welcome' => true,
                    'checkin_status' => 'registered',
                    'graduation_status' => 'in_training',
                    'certificate_number' => sprintf('SK-%s-JTM-26%03d', $trackCode, $trackIndex),
                    'transcript_number' => sprintf('TR-%s-JTM-26%03d', $trackCode, $trackIndex),
                ]
            );
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

                $items[] = [
                    'day' => $day,
                    'start' => trim($row[1]),
                    'end' => trim($row[2]),
                    'type_class' => trim($row[3]),
                    'title' => trim($row[4]),
                    'module_codes' => trim($row[5] ?? '-'),
                    'pointer' => trim($row[6] ?? ''),
                    'speakers' => trim($row[7] ?? ''),
                    'participants' => trim($row[8] ?? ''),
                    'room' => trim($row[9] ?? ''),
                    'status_module' => trim($row[10] ?? ''),
                    'notes' => trim($row[11] ?? ''),
                ];
            }

            fclose($handle);
        }

        return $items;
    }
}
