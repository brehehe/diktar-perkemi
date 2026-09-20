<?php

namespace Database\Seeders;

use App\Models\CbtExamPackage;
use App\Models\CbtQuestion;
use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\EventLegend;
use App\Models\EventModule;
use App\Models\EventParticipant;
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

class EventManagementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Participant Tracks (Master Jalur Peserta)
        $tracks = [
            [
                'code' => 'PD',
                'name' => 'Pelatih Daerah',
                'description' => 'Kenshi pemegang lisensi pembinaan dojo dan kompetensi pelatihan tingkat kota/kabupaten/daerah.',
                'color' => '#20A47A',
                'sort_order' => 10,
                'is_active' => true,
            ],
            [
                'code' => 'PN',
                'name' => 'Pelatih Nasional',
                'description' => 'Kenshi kualifikasi kepelatihan tingkat nasional untuk pemusatan latihan daerah (Pelatda) dan nasional (Pelatnas).',
                'color' => '#0B63CE',
                'sort_order' => 20,
                'is_active' => true,
            ],
            [
                'code' => 'PED',
                'name' => 'Penguji Daerah',
                'description' => 'Kenshi penguji resmi berwenang menguji ujian kenaikan tingkat kenshi Kyu 6 sampai Kyu 1.',
                'color' => '#DD4D7C',
                'sort_order' => 30,
                'is_active' => true,
            ],
            [
                'code' => 'PEN',
                'name' => 'Penguji Nasional',
                'description' => 'Dewan penguji bersertifikat nasional untuk pengujian tingkat I Dan sampai III Dan.',
                'color' => '#7957D5',
                'sort_order' => 40,
                'is_active' => true,
            ],
            [
                'code' => 'WAD',
                'name' => 'Wasit Daerah',
                'description' => 'Wasit berlisensi memimpin pertandingan kejuaraan kota/kabupaten dan kejurda Shorinji Kempo.',
                'color' => '#EE9B25',
                'sort_order' => 50,
                'is_active' => true,
            ],
            [
                'code' => 'WAN',
                'name' => 'Wasit Nasional',
                'description' => 'Wasit berlisensi nasional untuk Kejurnas, Pra-PON, dan Pekan Olahraga Nasional (PON).',
                'color' => '#0A3F82',
                'sort_order' => 60,
                'is_active' => true,
            ],
            [
                'code' => 'PWAD',
                'name' => 'Penguji dan Wasit Daerah',
                'description' => 'Peserta kualifikasi ganda Penguji Daerah dan Wasit Daerah dengan sistem rotasi kelas.',
                'color' => '#E56B1A',
                'sort_order' => 70,
                'is_active' => true,
            ],
            [
                'code' => 'PWAN',
                'name' => 'Penguji dan Wasit Nasional',
                'description' => 'Peserta kualifikasi ganda Penguji Nasional dan Wasit Nasional dengan matriks pemenuhan modul.',
                'color' => '#4338CA',
                'sort_order' => 80,
                'is_active' => true,
            ],
        ];

        foreach ($tracks as $t) {
            ParticipantTrack::updateOrCreate(['code' => $t['code']], $t);
        }

        // 2. Event Session Types (Jenis Sesi)
        $sessionTypes = [
            ['code' => 'PLENO', 'name' => 'Pleno Bersama', 'color' => '#0B63CE', 'badge_color' => 'blue'],
            ['code' => 'PAR_PELATIH', 'name' => 'Paralel Pelatih', 'color' => '#20A47A', 'badge_color' => 'green'],
            ['code' => 'PAR_PENGUJI', 'name' => 'Paralel Penguji', 'color' => '#DD4D7C', 'badge_color' => 'rose'],
            ['code' => 'PAR_WASIT', 'name' => 'Paralel Wasit', 'color' => '#EE9B25', 'badge_color' => 'orange'],
            ['code' => 'PAR_GANDA', 'name' => 'Paralel Peserta Ganda', 'color' => '#7957D5', 'badge_color' => 'purple'],
            ['code' => 'UJIAN', 'name' => 'Ujian & Sertifikasi', 'color' => '#DC2626', 'badge_color' => 'red'],
            ['code' => 'REFLEKSI', 'name' => 'Refleksi & Evaluasi', 'color' => '#0E2747', 'badge_color' => 'navy'],
            ['code' => 'PENUTUPAN', 'name' => 'Upacara Penutupan', 'color' => '#0A3F82', 'badge_color' => 'dark'],
        ];

        foreach ($sessionTypes as $st) {
            EventSessionType::updateOrCreate(['code' => $st['code']], $st);
        }

        // 3. Event Legends (Singkatan & Glosarium)
        $legends = [
            ['acronym' => 'JP', 'full_name' => 'Jam Pelajaran', 'category' => 'istilah', 'description' => 'Satuan durasi pembelajaran standar 1 JP = 45 menit.'],
            ['acronym' => 'K3', 'full_name' => 'Kesehatan, Keselamatan, dan Keamanan', 'category' => 'istilah', 'description' => 'Standar keselamatan fisik dan tata ruang penataran kempo.'],
            ['acronym' => 'NLP', 'full_name' => 'Neuro-Linguistic Programming', 'category' => 'istilah', 'description' => 'Pendekatan komunikasi, pengembangan pribadi, dan psikoterapi kenshi.'],
            ['acronym' => 'P3K', 'full_name' => 'Pertolongan Pertama pada Kecelakaan', 'category' => 'istilah', 'description' => 'Prosedur tanggap darurat medis cedera latihan dan pertandingan.'],
            ['acronym' => 'AD/ART', 'full_name' => 'Anggaran Dasar & Anggaran Rumah Tangga', 'category' => 'istilah', 'description' => 'Pedoman hukum konstitusi organisasi Persaudaraan Shorinji Kempo Indonesia.'],
            ['acronym' => 'WSKO', 'full_name' => 'World Shorinji Kempo Organization', 'category' => 'istilah', 'description' => 'Induk organisasi Shorinji Kempo sedunia berpusat di Tadotsu, Jepang.'],
            ['acronym' => 'PB PERKEMI', 'full_name' => 'Pengurus Besar Persaudaraan Bela Diri Kempo Indonesia', 'category' => 'istilah', 'description' => 'Pimpinan nasional induk cabang olahraga Shorinji Kempo di Indonesia.'],
            ['acronym' => 'Gojuho', 'full_name' => 'Metode Teknik Keras', 'category' => 'istilah', 'description' => 'Kaidah pukulan (tsuki), tendangan (keri), dan tangkisan (uke).'],
            ['acronym' => 'Juho', 'full_name' => 'Metode Teknik Lunak', 'category' => 'istilah', 'description' => 'Kaidah lepasan, kuncian persendian, dan bantingan.'],
            ['acronym' => 'Seiho', 'full_name' => 'Metode Pijat Pemulihan', 'category' => 'istilah', 'description' => 'Teknik pemijatan titik meridian untuk menyegarkan dan memulihkan kondisi fisik.'],
        ];

        foreach ($legends as $l) {
            EventLegend::updateOrCreate(['acronym' => $l['acronym']], $l);
        }

        // 4. Speakers (Pemateri Internal & Eksternal)
        $speakers = [
            [
                'name' => 'Drs. Bambang Subekti',
                'title_degree' => 'M.Si.',
                'type' => 'internal',
                'dan_rank' => 'VII DAN',
                'position' => 'Dewan Guru PB PERKEMI',
                'organization' => 'PB PERKEMI',
                'specialization' => 'Filsafat Shorinji Kempo, Etika & Standarisasi Perwasitan',
                'bio' => 'Senior Dewan Guru PB PERKEMI dengan pengalaman lebih dari 40 tahun dalam pembinaan dan perumusan kurikulum nasional.',
                'contact_phone' => '081234567890',
                'contact_email' => 'bambang.subekti@perkemi.or.id',
                'is_active' => true,
            ],
            [
                'name' => 'Ir. Suryadi Pratama',
                'title_degree' => 'M.M.',
                'type' => 'internal',
                'dan_rank' => 'VI DAN',
                'position' => 'Ketua Komisi Kepelatihan PB PERKEMI',
                'organization' => 'PB PERKEMI',
                'specialization' => 'Metodologi Kepelatihan, Periodisasi Latihan & Pedagogi Kenshi',
                'bio' => 'Pelatih Nasional berpengalaman memimpin kontingen Indonesia di kejuaraan WSKO Taikai dan Kejuaraan Dunia.',
                'contact_phone' => '081298765432',
                'contact_email' => 'suryadi.pratama@perkemi.or.id',
                'is_active' => true,
            ],
            [
                'name' => 'Hendra Wijaya',
                'title_degree' => 'S.Pd.',
                'type' => 'internal',
                'dan_rank' => 'VI DAN',
                'position' => 'Ketua Komisi Pengujian PB PERKEMI',
                'organization' => 'PB PERKEMI',
                'specialization' => 'Standarisasi Pengujian Kenaikan Tingkat Kyu & Dan',
                'bio' => 'Penguji resmi nasional, menyusun pedoman rubrik penilaian dan kisi-kisi evaluasi kenshi nasional.',
                'contact_phone' => '081345678901',
                'contact_email' => 'hendra.wijaya@perkemi.or.id',
                'is_active' => true,
            ],
            [
                'name' => 'Maria Ulfah',
                'title_degree' => 'S.E.',
                'type' => 'internal',
                'dan_rank' => 'V DAN',
                'position' => 'Sekretaris Komisi Perwasitan PB PERKEMI',
                'organization' => 'PB PERKEMI',
                'specialization' => 'Manajemen Gelanggang & Kode Etik Wasit Pertandingan',
                'bio' => 'Wasit internasional berlisensi WSKO, berpengalaman memimpin final pertandingan nasional dan internasional.',
                'contact_phone' => '081378901234',
                'contact_email' => 'maria.ulfah@perkemi.or.id',
                'is_active' => true,
            ],
            [
                'name' => 'Dr. dr. Adhitia Nugraha',
                'title_degree' => 'Sp.KO, Subsp.ALK(K)',
                'type' => 'external',
                'dan_rank' => null,
                'position' => null,
                'organization' => 'Perhimpunan Dokter Spesialis Kedokteran Olahraga (PDSKO) / RS Olahraga Nasional',
                'specialization' => 'Sport Injury, Manajemen K3 Penataran & Fisiologi Olahraga',
                'bio' => 'Konsultan kedokteran olahraga nasional, ahli dalam penanganan cepat trauma fisik dan cedera persendian bela diri.',
                'contact_phone' => '08111223344',
                'contact_email' => 'adhitia.nugraha@pdsko.id',
                'is_active' => true,
            ],
            [
                'name' => 'Prof. Dr. Arif Hidayat',
                'title_degree' => 'M.Si., M.Pd.',
                'type' => 'external',
                'dan_rank' => null,
                'position' => null,
                'organization' => 'Fakultas Ilmu Keolahragaan UNESA',
                'specialization' => 'Sport Science, Biomekanika Gerak & Analisis Kinetik Bela Diri',
                'bio' => 'Guru besar sport science dengan riset terapan pada kinetika gerak pukulan dan bantingan atlet bela diri.',
                'contact_phone' => '08112233445',
                'contact_email' => 'arif.hidayat@unesa.ac.id',
                'is_active' => true,
            ],
            [
                'name' => 'Dr. Rina Kusuma Dewi',
                'title_degree' => 'M.Psi., Psikolog',
                'type' => 'external',
                'dan_rank' => null,
                'position' => null,
                'organization' => 'Asosiasi Psikologi Olahraga Indonesia (APOI)',
                'specialization' => 'Psikologi Olahraga, NLP & Mental Toughness Atlet',
                'bio' => 'Psikolog olahraga kontingen nasional, mendampingi atlet dalam penguatan mental dan regulasi emosi saat kompetisi.',
                'contact_phone' => '08113344556',
                'contact_email' => 'rina.kusuma@apoi.id',
                'is_active' => true,
            ],
            [
                'name' => 'Kol. (Purn) Wahyu Triyono',
                'title_degree' => 'M.Tr.Han',
                'type' => 'external',
                'dan_rank' => null,
                'position' => null,
                'organization' => 'Lembaga Ketahanan Kepemimpinan Karakter',
                'specialization' => 'Leadership, Integritas Etika & Kepemimpinan Organisasi Dojo',
                'bio' => 'Pakar pembentukan karakter kepemimpinan dan disiplin institusional berbasis nilai-nilai integritas.',
                'contact_phone' => '08114455667',
                'contact_email' => 'wahyu.triyono@ketahanan.id',
                'is_active' => true,
            ],
        ];

        $speakerModels = [];
        foreach ($speakers as $sp) {
            $speakerModels[$sp['name']] = Speaker::updateOrCreate(['name' => $sp['name']], $sp);
        }

        // 5. Event (Event Penataran 2026)
        $event = Event::updateOrCreate(
            ['slug' => 'workshop-kualifikasi-2026'],
            [
                'title' => 'Workshop Kualifikasi Pelatih, Penguji & Wasit Shorinji Kempo PERKEMI 2026',
                'description' => 'Program terpadu standarisasi kompetensi nasional untuk pelatih, penguji, dan wasit Shorinji Kempo seluruh Indonesia. Menggabungkan kelas pleno materi strategis, kelas paralel bidang keilmuan, serta sistem rotasi kelas khusus peserta kualifikasi ganda (PWAD/PWAN).',
                'start_date' => '2026-09-24',
                'end_date' => '2026-09-27',
                'location' => 'Ubaya Training Center (UTC), Trawas, Mojokerto',
                'organizer' => 'PB PERKEMI',
                'duration_text' => '3,5 hari',
                'total_effective_jp' => 34, // Total JP Efektif
                'total_schedule_jp' => 38, // Total JP Jadwal (termasuk kelas paralel rotasi peserta ganda)
                'jp_duration_minutes' => 45, // 1 JP = 45 menit
                'learning_method' => 'Pleno, paralel, dan rotasi peserta ganda',
                'quota' => 120,
                'status' => 'ongoing',
                'facilities_checklist' => [
                    ['name' => 'Ruang Pleno Utama (Auditorium UTC)', 'status' => 'ready', 'notes' => 'Kapasitas 150 kenshi, sound system, proyektor dual screen'],
                    ['name' => 'Ruang Paralel Pelatih (R. Trawas 1)', 'status' => 'ready', 'notes' => 'Dilengkapi matras dojo untuk drill teknik'],
                    ['name' => 'Ruang Paralel Penguji (R. Trawas 2)', 'status' => 'ready', 'notes' => 'Meja sidang penguji dan perangkat scoring'],
                    ['name' => 'Ruang Paralel Wasit (R. Welirang)', 'status' => 'ready', 'notes' => 'Garis lapangan simulasi dan bendera wasit'],
                    ['name' => 'Ruang Peserta Ganda (R. Penanggungan)', 'status' => 'ready', 'notes' => 'Kelas rotasi sinkronisasi materi PWAD/PWAN'],
                    ['name' => 'Ruang Ujian Teori (Lab Komputer UTC)', 'status' => 'ready', 'notes' => '60 unit terminal CBT terhubung ke server portal'],
                    ['name' => 'Modul & Materi Digital Terenkripsi', 'status' => 'ready', 'notes' => 'Tersedia di portal Pustaka Penataran'],
                    ['name' => 'Dokumentasi & Rekaman Sesi', 'status' => 'ready', 'notes' => 'Tim dokumentasi multimedia PB PERKEMI'],
                    ['name' => 'Pendamping Khusus Peserta Ganda', 'status' => 'ready', 'notes' => '2 instruktur pengawas matriks rotasi'],
                    ['name' => 'Sertifikat & Piagam Akreditasi', 'status' => 'prepared', 'notes' => 'Siap dicetak setelah sidang kelulusan pleno'],
                    ['name' => 'Konsumsi & Akomodasi Peserta', 'status' => 'ready', 'notes' => 'Dikelola manajemen UTC Trawas'],
                ],
                'requirements_checklist' => [
                    ['item' => 'Ijazah DAN terakhir resmi diterbitkan PB PERKEMI', 'mandatory' => true],
                    ['item' => 'Surat Rekomendasi resmi dari Pengurus Provinsi (Pengprov) asal', 'mandatory' => true],
                    ['item' => 'Surat Keterangan Sehat dari dokter (layak aktivitas fisik beladiri)', 'mandatory' => true],
                    ['item' => 'Pakta Integritas kepatuhan kode etik Kenshi dan netralitas perwasitan', 'mandatory' => true],
                    ['item' => 'Memakai Pakaian Dogi lengkap dengan lambang PERKEMI resmi', 'mandatory' => true],
                    ['item' => 'Pasfoto digital resmi berseragam Dogi untuk database sertifikasi', 'mandatory' => true],
                ],
            ]
        );

        // Find some existing material to link if available
        $firstMaterial = Material::published()->first();

        // 6. Event Modules (Modul-modul Penataran)
        $modulesData = [
            [
                'code' => 'MOD-01',
                'title' => 'Kebijakan Nasional & Standarisasi Kurikulum PERKEMI',
                'description' => 'Arah kebijakan pengembangan teknik, standarisasi kurikulum nasional, dan penyelarasan standar WSKO.',
                'jp' => 2,
                'track_codes' => ['PD', 'PN', 'PED', 'PEN', 'WAD', 'WAN', 'PWAD', 'PWAN'],
                'speaker_name' => 'Drs. Bambang Subekti',
                'fulfillment_method' => 'Kelas Pleno Bersama',
            ],
            [
                'code' => 'MOD-02',
                'title' => 'Sport Injury & Manajemen K3 Penataran Kempo',
                'description' => 'Pencegahan cedera akut dan kronis, protokol penanganan pertama (P3K) di dojo dan arena pertandingan.',
                'jp' => 4,
                'track_codes' => ['PD', 'PN', 'PED', 'PEN', 'WAD', 'WAN', 'PWAD', 'PWAN'],
                'speaker_name' => 'Dr. dr. Adhitia Nugraha',
                'fulfillment_method' => 'Kelas Pleno & Simulasi Lapangan',
            ],
            [
                'code' => 'MOD-03',
                'title' => 'Leadership, NLP & Mental Toughness Kenshi',
                'description' => 'Pembangunan karakter kepemimpinan pelatih/wasit, penguatan regulasi emosi kenshi dengan pendekatan NLP.',
                'jp' => 4,
                'track_codes' => ['PD', 'PN', 'PED', 'PEN', 'WAD', 'WAN', 'PWAD', 'PWAN'],
                'speaker_name' => 'Dr. Rina Kusuma Dewi',
                'fulfillment_method' => 'Kelas Pleno & Workshop Interaktif',
            ],
            [
                'code' => 'MOD-PEL-01',
                'title' => 'Metodologi Latihan Fisik & Periodisasi Kepelatihan Kempo',
                'description' => 'Penyusunan program latihan makro, meso, dan mikro, adaptasi fisiologi, dan sport science terapan.',
                'jp' => 6,
                'track_codes' => ['PD', 'PN'],
                'speaker_name' => 'Ir. Suryadi Pratama',
                'fulfillment_method' => 'Kelas Paralel Pelatih',
            ],
            [
                'code' => 'MOD-PENG-01',
                'title' => 'Standarisasi Rubrik & Pengujian Kenaikan Tingkat Kyu & Dan',
                'description' => 'Kriteria objektivitas pengujian Gojuho, Juho, Embu, dan tes tertulis filosofi Shorinji Kempo.',
                'jp' => 6,
                'track_codes' => ['PED', 'PEN', 'PWAD', 'PWAN'],
                'speaker_name' => 'Hendra Wijaya',
                'fulfillment_method' => 'Kelas Paralel Penguji & Rotasi A1',
            ],
            [
                'code' => 'MOD-WAS-01',
                'title' => 'Peraturan Pertandingan Nasional, Isyarat Wasit & Manajemen Gelanggang',
                'description' => 'Bedah aturan pertandingan randori dan embu, isyarat tangan wasit, dan pengambilan keputusan sah.',
                'jp' => 6,
                'track_codes' => ['WAD', 'WAN', 'PWAD', 'PWAN'],
                'speaker_name' => 'Maria Ulfah',
                'fulfillment_method' => 'Kelas Paralel Wasit & Rotasi A2',
            ],
            [
                'code' => 'MOD-GANDA-01',
                'title' => 'Matriks Integrasi Penguji & Wasit Bersertifikat',
                'description' => 'Sinkronisasi standar teknis penilaian embu dan keabsahan teknik randori untuk pemegang lisensi ganda.',
                'jp' => 4,
                'track_codes' => ['PWAD', 'PWAN'],
                'speaker_name' => 'Drs. Bambang Subekti',
                'fulfillment_method' => 'Kelas Khusus Rotasi Sesi A',
            ],
        ];

        $moduleModels = [];
        foreach ($modulesData as $m) {
            $speaker = $speakerModels[$m['speaker_name']] ?? null;
            $moduleModels[$m['code']] = EventModule::updateOrCreate(
                [
                    'event_id' => $event->id,
                    'code' => $m['code'],
                ],
                [
                    'title' => $m['title'],
                    'description' => $m['description'],
                    'jp' => $m['jp'],
                    'track_codes' => $m['track_codes'],
                    'speaker_id' => $speaker?->id,
                    'material_id' => $firstMaterial?->id,
                    'fulfillment_method' => $m['fulfillment_method'],
                    'is_published' => true,
                ]
            );
        }

        // 7. Event Sessions (Rundown Hari 1 s/d Hari 4)
        $sessionsData = [
            // Hari 1: Kamis, 24 September 2026
            [
                'day_number' => 1,
                'date' => '2026-09-24',
                'start_time' => '13:00',
                'end_time' => '14:30',
                'session_number' => 'S-01',
                'duration_jp' => 2,
                'session_type_code' => 'PLENO',
                'topic' => 'Registrasi Ulang, Pembukaan Resmi & Pengarahan Teknis Workshop',
                'subtopic' => 'Upacara pembukaan, sambutan Ketum PB PERKEMI, dan penjelasan tata tertib kegiatan.',
                'method' => 'Pleno Resmi',
                'speaker_name' => 'Drs. Bambang Subekti',
                'module_code' => 'MOD-01',
                'room' => 'Auditorium Utama UTC',
                'track_codes' => ['PD', 'PN', 'PED', 'PEN', 'WAD', 'WAN', 'PWAD', 'PWAN'],
                'status' => 'completed',
            ],
            [
                'day_number' => 1,
                'date' => '2026-09-24',
                'start_time' => '14:45',
                'end_time' => '16:15',
                'session_number' => 'S-02',
                'duration_jp' => 2,
                'session_type_code' => 'PLENO',
                'topic' => 'Kebijakan Nasional & Standarisasi Kurikulum PERKEMI 2026–2030',
                'subtopic' => 'Harmonisasi kurikulum penataran daerah dan pemutakhiran regulasi Dewan Guru PB PERKEMI.',
                'method' => 'Ceramah & Diskusi',
                'speaker_name' => 'Drs. Bambang Subekti',
                'module_code' => 'MOD-01',
                'room' => 'Auditorium Utama UTC',
                'track_codes' => ['PD', 'PN', 'PED', 'PEN', 'WAD', 'WAN', 'PWAD', 'PWAN'],
                'status' => 'completed',
            ],
            [
                'day_number' => 1,
                'date' => '2026-09-24',
                'start_time' => '19:00',
                'end_time' => '20:30',
                'session_number' => 'S-03',
                'duration_jp' => 2,
                'session_type_code' => 'PLENO',
                'topic' => 'Leadership, Etika Kenshi & Integritas Kepemimpinan Dojo',
                'subtopic' => 'Prinsip Riki Ai Funi, Shushu Kouju, dan keteladanan pelatih/penguji/wasit di masyarakat.',
                'method' => 'Interaktif & Studi Kasus',
                'speaker_name' => 'Kol. (Purn) Wahyu Triyono',
                'module_code' => 'MOD-03',
                'room' => 'Auditorium Utama UTC',
                'track_codes' => ['PD', 'PN', 'PED', 'PEN', 'WAD', 'WAN', 'PWAD', 'PWAN'],
                'status' => 'completed',
            ],

            // Hari 2: Jumat, 25 September 2026
            [
                'day_number' => 2,
                'date' => '2026-09-25',
                'start_time' => '08:00',
                'end_time' => '09:30',
                'session_number' => 'S-04',
                'duration_jp' => 2,
                'session_type_code' => 'PLENO',
                'topic' => 'Sport Injury, Fisiologi Latihan & Penanganan Kegawatdaruratan Dojo',
                'subtopic' => 'Identifikasi cedera ligamen, dislokasi persendian, concussion, dan protokol RICE.',
                'method' => 'Presentasi Medis & Simulasi',
                'speaker_name' => 'Dr. dr. Adhitia Nugraha',
                'module_code' => 'MOD-02',
                'room' => 'Auditorium Utama UTC',
                'track_codes' => ['PD', 'PN', 'PED', 'PEN', 'WAD', 'WAN', 'PWAD', 'PWAN'],
                'status' => 'ongoing',
            ],
            [
                'day_number' => 2,
                'date' => '2026-09-25',
                'start_time' => '09:45',
                'end_time' => '11:15',
                'session_number' => 'S-05',
                'duration_jp' => 2,
                'session_type_code' => 'PLENO',
                'topic' => 'Sport Science & Penerapan Biomekanika Gerak Shorinji Kempo',
                'subtopic' => 'Efisiensi tuas tubuh pada Juho dan transfer momentum kinetik pada Gojuho.',
                'method' => 'Analisis Video & Biomekanik',
                'speaker_name' => 'Prof. Dr. Arif Hidayat',
                'module_code' => 'MOD-02',
                'room' => 'Auditorium Utama UTC',
                'track_codes' => ['PD', 'PN', 'PED', 'PEN', 'WAD', 'WAN', 'PWAD', 'PWAN'],
                'status' => 'scheduled',
            ],
            [
                'day_number' => 2,
                'date' => '2026-09-25',
                'start_time' => '13:30',
                'end_time' => '15:00',
                'session_number' => 'S-06A',
                'duration_jp' => 2,
                'session_type_code' => 'PAR_PELATIH',
                'topic' => 'Paralel Pelatih: Penyusunan Periodisasi Program Latihan Fisik Kenshi',
                'subtopic' => 'Struktur makrosiklus persiapan pra-kejuaraan dan pemeliharaan kondisi dojo.',
                'method' => 'Praktik Kelas',
                'speaker_name' => 'Ir. Suryadi Pratama',
                'module_code' => 'MOD-PEL-01',
                'room' => 'Ruang Trawas 1',
                'track_codes' => ['PD', 'PN'],
                'status' => 'scheduled',
            ],
            [
                'day_number' => 2,
                'date' => '2026-09-25',
                'start_time' => '13:30',
                'end_time' => '15:00',
                'session_number' => 'S-06B',
                'duration_jp' => 2,
                'session_type_code' => 'PAR_PENGUJI',
                'topic' => 'Paralel Penguji: Rubrik & Standar Evaluasi Kenaikan Tingkat (Rotasi Kelompok A1)',
                'subtopic' => 'Parameter penilaian presisi gerak Juho dan kedalaman pemahaman filosofis kenshi.',
                'method' => 'Bedah Rubrik',
                'speaker_name' => 'Hendra Wijaya',
                'module_code' => 'MOD-PENG-01',
                'room' => 'Ruang Trawas 2',
                'track_codes' => ['PED', 'PEN', 'PWAD', 'PWAN'],
                'status' => 'scheduled',
            ],
            [
                'day_number' => 2,
                'date' => '2026-09-25',
                'start_time' => '15:15',
                'end_time' => '16:45',
                'session_number' => 'S-07',
                'duration_jp' => 2,
                'session_type_code' => 'PAR_WASIT',
                'topic' => 'Paralel Wasit: Peraturan Pertandingan & Standarisasi Isyarat Juri (Rotasi Kelompok A2)',
                'subtopic' => 'Kategori pelanggaran Hansoku, kriteria Ippon/Waza-ari, dan sinkronisasi fukushin.',
                'method' => 'Drill Isyarat & Simulasi',
                'speaker_name' => 'Maria Ulfah',
                'module_code' => 'MOD-WAS-01',
                'room' => 'Ruang Welirang',
                'track_codes' => ['WAD', 'WAN', 'PWAD', 'PWAN'],
                'status' => 'scheduled',
            ],
            [
                'day_number' => 2,
                'date' => '2026-09-25',
                'start_time' => '19:30',
                'end_time' => '21:00',
                'session_number' => 'S-08',
                'duration_jp' => 2,
                'session_type_code' => 'PAR_GANDA',
                'topic' => 'Sesi Khusus Peserta Ganda: Matriks Integrasi Penguji & Wasit (PWAD & PWAN)',
                'subtopic' => 'Review komparatif modul pengujian dan perwasitan bagi peserta kualifikasi ganda.',
                'method' => 'Tutoring & Konsolidasi',
                'speaker_name' => 'Drs. Bambang Subekti',
                'module_code' => 'MOD-GANDA-01',
                'room' => 'Ruang Penanggungan',
                'track_codes' => ['PWAD', 'PWAN'],
                'status' => 'scheduled',
            ],

            // Hari 3: Sabtu, 26 September 2026
            [
                'day_number' => 3,
                'date' => '2026-09-26',
                'start_time' => '08:00',
                'end_time' => '09:30',
                'session_number' => 'S-09',
                'duration_jp' => 2,
                'session_type_code' => 'PAR_PELATIH',
                'topic' => 'Praktik Lapangan Terpadu: Koreksi Teknik Gojuho & Juho',
                'subtopic' => 'Drill aplikasi teknik kumi embu dan koreksi postur tubuh (kamae) kenshi.',
                'method' => 'Praktik di Matras',
                'speaker_name' => 'Ir. Suryadi Pratama',
                'module_code' => 'MOD-PEL-01',
                'room' => 'Dojo UTC Trawas',
                'track_codes' => ['PD', 'PN'],
                'status' => 'scheduled',
            ],
            [
                'day_number' => 3,
                'date' => '2026-09-26',
                'start_time' => '09:45',
                'end_time' => '11:15',
                'session_number' => 'S-10',
                'duration_jp' => 2,
                'session_type_code' => 'PAR_WASIT',
                'topic' => 'Simulasi Pertandingan Randori & Penilaian Embu Gelanggang',
                'subtopic' => 'Simulasi pertandingan live dengan skenario insiden kontroversial dan protes pelatih.',
                'method' => 'Simulasi Live Match',
                'speaker_name' => 'Maria Ulfah',
                'module_code' => 'MOD-WAS-01',
                'room' => 'Ruang Welirang',
                'track_codes' => ['WAD', 'WAN', 'PWAD', 'PWAN'],
                'status' => 'scheduled',
            ],
            [
                'day_number' => 3,
                'date' => '2026-09-26',
                'start_time' => '13:30',
                'end_time' => '15:00',
                'session_number' => 'S-11',
                'duration_jp' => 2,
                'session_type_code' => 'UJIAN',
                'topic' => 'Ujian Teori Standarisasi Nasional CBT (Computer-Based Test)',
                'subtopic' => 'Ujian 100 butir soal regulasi, filsafat, metodologi, dan studi kasus perwasitan/pengujian.',
                'method' => 'Ujian Komputer Online',
                'speaker_name' => 'Hendra Wijaya',
                'module_code' => 'MOD-01',
                'room' => 'Lab Komputer UTC',
                'track_codes' => ['PD', 'PN', 'PED', 'PEN', 'WAD', 'WAN', 'PWAD', 'PWAN'],
                'status' => 'scheduled',
            ],
            [
                'day_number' => 3,
                'date' => '2026-09-26',
                'start_time' => '15:15',
                'end_time' => '16:45',
                'session_number' => 'S-12',
                'duration_jp' => 2,
                'session_type_code' => 'UJIAN',
                'topic' => 'Ujian Praktik Isyarat Wasit & Sidang Pengujian Tingkat',
                'subtopic' => 'Pengujian langsung kemampuan memimpin pertandingan dan pengujian teknik kenshi.',
                'method' => 'Ujian Praktik Lapangan',
                'speaker_name' => 'Drs. Bambang Subekti',
                'module_code' => 'MOD-01',
                'room' => 'Auditorium Utama UTC',
                'track_codes' => ['PD', 'PN', 'PED', 'PEN', 'WAD', 'WAN', 'PWAD', 'PWAN'],
                'status' => 'scheduled',
            ],

            // Hari 4: Minggu, 27 September 2026
            [
                'day_number' => 4,
                'date' => '2026-09-27',
                'start_time' => '08:00',
                'end_time' => '09:30',
                'session_number' => 'S-13',
                'duration_jp' => 2,
                'session_type_code' => 'REFLEKSI',
                'topic' => 'Sidang Pleno Dewan Guru & Rekapitulasi Kelulusan Kualifikasi',
                'subtopic' => 'Rapat dewan penilai kelulusan dan penyampaian catatan evaluasi peserta penataran.',
                'method' => 'Sidang Tertutup & Pleno',
                'speaker_name' => 'Drs. Bambang Subekti',
                'module_code' => 'MOD-01',
                'room' => 'Auditorium Utama UTC',
                'track_codes' => ['PD', 'PN', 'PED', 'PEN', 'WAD', 'WAN', 'PWAD', 'PWAN'],
                'status' => 'scheduled',
            ],
            [
                'day_number' => 4,
                'date' => '2026-09-27',
                'start_time' => '09:45',
                'end_time' => '11:15',
                'session_number' => 'S-14',
                'duration_jp' => 2,
                'session_type_code' => 'PENUTUPAN',
                'topic' => 'Pengumuman Hasil Kelulusan, Penyerahan Sertifikat & Upacara Penutupan',
                'subtopic' => 'Penyematan tanda kualifikasi resmi PB PERKEMI dan penutupan kegiatan.',
                'method' => 'Upacara Resmi',
                'speaker_name' => 'Drs. Bambang Subekti',
                'module_code' => 'MOD-01',
                'room' => 'Auditorium Utama UTC',
                'track_codes' => ['PD', 'PN', 'PED', 'PEN', 'WAD', 'WAN', 'PWAD', 'PWAN'],
                'status' => 'scheduled',
            ],
        ];

        foreach ($sessionsData as $sd) {
            $speaker = $speakerModels[$sd['speaker_name']] ?? null;
            $module = $moduleModels[$sd['module_code']] ?? null;

            EventSession::updateOrCreate(
                [
                    'event_id' => $event->id,
                    'session_number' => $sd['session_number'],
                ],
                [
                    'day_number' => $sd['day_number'],
                    'date' => $sd['date'],
                    'start_time' => $sd['start_time'],
                    'end_time' => $sd['end_time'],
                    'duration_jp' => $sd['duration_jp'],
                    'session_type_code' => $sd['session_type_code'],
                    'topic' => $sd['topic'],
                    'subtopic' => $sd['subtopic'],
                    'method' => $sd['method'],
                    'speaker_id' => $speaker?->id,
                    'event_module_id' => $module?->id,
                    'room' => $sd['room'],
                    'track_codes' => $sd['track_codes'],
                    'status' => $sd['status'],
                ]
            );
        }

        // 8. Participants & Event Participants
        $firstUser = User::first();

        $participantsData = [
            [
                'name' => 'Agus Setiawan',
                'kenshi_id_number' => 'KNS-3174-00124',
                'email' => 'agus.setiawan@gmail.com',
                'phone' => '081234561001',
                'origin_province' => 'DKI Jakarta',
                'origin_city' => 'Jakarta Timur',
                'origin_dojo' => 'Dojo Gelanggang Rawamangun',
                'dan_rank' => 'III DAN',
                'notes' => 'Calon pelatih dojo prestasi Jakarta Timur.',
                'track_code' => 'PD',
                'rotation_group' => null,
                'admin_status' => 'verified',
                'attendance_status' => 'present',
                'graduation_status' => 'in_training',
                'score_theory' => 88.50,
                'score_practice' => 85.00,
                'certificate_number' => 'SK-PD-2026-001',
            ],
            [
                'name' => 'Budi Santoso',
                'kenshi_id_number' => 'KNS-3273-00418',
                'email' => 'budi.santoso@kempo.or.id',
                'phone' => '081234561002',
                'origin_province' => 'Jawa Barat',
                'origin_city' => 'Kota Bandung',
                'origin_dojo' => 'Dojo ITB Ganesha',
                'dan_rank' => 'IV DAN',
                'notes' => 'Peserta jalur Pelatih Nasional rekomendasi Pengprov Jabar.',
                'track_code' => 'PN',
                'rotation_group' => null,
                'admin_status' => 'verified',
                'attendance_status' => 'present',
                'graduation_status' => 'in_training',
                'score_theory' => 92.00,
                'score_practice' => 90.50,
                'certificate_number' => 'SK-PN-2026-002',
            ],
            [
                'name' => 'Citra Dewi Larasati',
                'kenshi_id_number' => 'KNS-3578-00215',
                'email' => 'citra.dewi@yahoo.com',
                'phone' => '081234561003',
                'origin_province' => 'Jawa Timur',
                'origin_city' => 'Kota Surabaya',
                'origin_dojo' => 'Dojo KONI Jawa Timur',
                'dan_rank' => 'III DAN',
                'notes' => 'Peserta Penguji Daerah aktif pengujian kyu kota Surabaya.',
                'track_code' => 'PED',
                'rotation_group' => null,
                'admin_status' => 'verified',
                'attendance_status' => 'present',
                'graduation_status' => 'in_training',
                'score_theory' => 86.00,
                'score_practice' => 87.00,
                'certificate_number' => 'SK-PED-2026-003',
            ],
            [
                'name' => 'Dian Prasetyo',
                'kenshi_id_number' => 'KNS-3374-00389',
                'email' => 'dian.prasetyo@kempo.id',
                'phone' => '081234561004',
                'origin_province' => 'Jawa Tengah',
                'origin_city' => 'Kota Semarang',
                'origin_dojo' => 'Dojo Tri Lomba Juang',
                'dan_rank' => 'IV DAN',
                'notes' => 'Kandidat Penguji Nasional Jawa Tengah.',
                'track_code' => 'PEN',
                'rotation_group' => null,
                'admin_status' => 'verified',
                'attendance_status' => 'present',
                'graduation_status' => 'in_training',
                'score_theory' => 94.00,
                'score_practice' => 89.00,
                'certificate_number' => 'SK-PEN-2026-004',
            ],
            [
                'name' => 'Eko Prabowo',
                'kenshi_id_number' => 'KNS-5171-00192',
                'email' => 'eko.prabowo@gmail.com',
                'phone' => '081234561005',
                'origin_province' => 'Bali',
                'origin_city' => 'Kota Denpasar',
                'origin_dojo' => 'Dojo GOR Ngurah Rai',
                'dan_rank' => 'III DAN',
                'notes' => 'Wasit Daerah aktif Pengprov Bali.',
                'track_code' => 'WAD',
                'rotation_group' => null,
                'admin_status' => 'verified',
                'attendance_status' => 'present',
                'graduation_status' => 'in_training',
                'score_theory' => 84.50,
                'score_practice' => 88.00,
                'certificate_number' => 'SK-WAD-2026-005',
            ],
            [
                'name' => 'Faisal Rahman',
                'kenshi_id_number' => 'KNS-7371-00543',
                'email' => 'faisal.rahman@kempo.or.id',
                'phone' => '081234561006',
                'origin_province' => 'Sulawesi Selatan',
                'origin_city' => 'Kota Makassar',
                'origin_dojo' => 'Dojo Karebosi',
                'dan_rank' => 'IV DAN',
                'notes' => 'Calon Wasit Nasional perwakilan wilayah timur.',
                'track_code' => 'WAN',
                'rotation_group' => null,
                'admin_status' => 'verified',
                'attendance_status' => 'present',
                'graduation_status' => 'in_training',
                'score_theory' => 91.50,
                'score_practice' => 93.00,
                'certificate_number' => 'SK-WAN-2026-006',
            ],
            [
                'name' => 'Gunawan Wibisono',
                'kenshi_id_number' => 'KNS-3172-00331',
                'email' => 'gunawan.wibisono@gmail.com',
                'phone' => '081234561007',
                'origin_province' => 'DKI Jakarta',
                'origin_city' => 'Jakarta Utara',
                'origin_dojo' => 'Dojo Kelapa Gading',
                'dan_rank' => 'III DAN',
                'notes' => 'Peserta kualifikasi ganda Penguji & Wasit Daerah (Rotasi A1).',
                'track_code' => 'PWAD',
                'rotation_group' => 'A1',
                'admin_status' => 'verified',
                'attendance_status' => 'present',
                'graduation_status' => 'in_training',
                'score_theory' => 89.00,
                'score_practice' => 86.50,
                'certificate_number' => 'SK-PWAD-2026-007',
            ],
            [
                'name' => 'Hesti Maharani',
                'kenshi_id_number' => 'KNS-3271-00278',
                'email' => 'hesti.maharani@kempo.id',
                'phone' => '081234561008',
                'origin_province' => 'Jawa Barat',
                'origin_city' => 'Kota Bogor',
                'origin_dojo' => 'Dojo Pajajaran Bogor',
                'dan_rank' => 'III DAN',
                'notes' => 'Peserta kualifikasi ganda Penguji & Wasit Daerah (Rotasi A2).',
                'track_code' => 'PWAD',
                'rotation_group' => 'A2',
                'admin_status' => 'verified',
                'attendance_status' => 'present',
                'graduation_status' => 'in_training',
                'score_theory' => 87.50,
                'score_practice' => 88.00,
                'certificate_number' => 'SK-PWAD-2026-008',
            ],
            [
                'name' => 'I Made Suardana',
                'kenshi_id_number' => 'KNS-5103-00452',
                'email' => 'made.suardana@kempo.or.id',
                'phone' => '081234561009',
                'origin_province' => 'Bali',
                'origin_city' => 'Kab. Badung',
                'origin_dojo' => 'Dojo Mengwi',
                'dan_rank' => 'IV DAN',
                'notes' => 'Peserta kualifikasi ganda Penguji & Wasit Nasional (Rotasi A1).',
                'track_code' => 'PWAN',
                'rotation_group' => 'A1',
                'admin_status' => 'verified',
                'attendance_status' => 'present',
                'graduation_status' => 'in_training',
                'score_theory' => 93.50,
                'score_practice' => 92.00,
                'certificate_number' => 'SK-PWAN-2026-009',
            ],
            [
                'name' => 'Joko Triyono',
                'kenshi_id_number' => 'KNS-3471-00188',
                'email' => 'joko.triyono@gmail.com',
                'phone' => '081234561010',
                'origin_province' => 'DI Yogyakarta',
                'origin_city' => 'Kota Yogyakarta',
                'origin_dojo' => 'Dojo Kridosono',
                'dan_rank' => 'IV DAN',
                'notes' => 'Peserta kualifikasi ganda Penguji & Wasit Nasional (Rotasi A2).',
                'track_code' => 'PWAN',
                'rotation_group' => 'A2',
                'admin_status' => 'verified',
                'attendance_status' => 'present',
                'graduation_status' => 'in_training',
                'score_theory' => 90.00,
                'score_practice' => 91.00,
                'certificate_number' => 'SK-PWAN-2026-010',
            ],
        ];

        foreach ($participantsData as $index => $pd) {
            $participant = Participant::updateOrCreate(
                ['kenshi_id_number' => $pd['kenshi_id_number']],
                [
                    'user_id' => $index === 0 ? $firstUser?->id : null,
                    'name' => $pd['name'],
                    'email' => $pd['email'],
                    'phone' => $pd['phone'],
                    'origin_province' => $pd['origin_province'],
                    'origin_city' => $pd['origin_city'],
                    'origin_dojo' => $pd['origin_dojo'],
                    'dan_rank' => $pd['dan_rank'],
                    'notes' => $pd['notes'],
                ]
            );

            EventParticipant::updateOrCreate(
                [
                    'event_id' => $event->id,
                    'participant_id' => $participant->id,
                ],
                [
                    'track_code' => $pd['track_code'],
                    'rotation_group' => $pd['rotation_group'],
                    'admin_status' => $pd['admin_status'],
                    'attendance_status' => $pd['attendance_status'],
                    'attendance_records' => [
                        'day_1' => true,
                        'day_2' => true,
                        'day_3' => true,
                        'day_4' => false,
                    ],
                    'graduation_status' => $pd['graduation_status'],
                    'certificate_number' => $pd['certificate_number'],
                    'certificate_issued_at' => '2026-09-27',
                    'score_theory' => $pd['score_theory'],
                    'score_practice' => $pd['score_practice'],
                    'evaluation_notes' => 'Memenuhi kriteria kompetensi dasar penataran nasional.',
                    'has_seen_welcome' => false,
                    'checked_in_at' => $index < 6 ? now()->subHours(4) : null,
                    'checkin_status' => $index < 6 ? 'checked_in' : 'registered',
                    'checkin_method' => $index < 6 ? 'web_portal' : null,
                ]
            );
        }

        // 9. CBT Exam Package (Paket Ujian Teori CBT PERKEMI 2026)
        $cbtPackage = CbtExamPackage::updateOrCreate(
            ['code' => 'CBT-KEMPO-2026'],
            [
                'event_id' => $event->id,
                'title' => 'Ujian Teori Standarisasi Kepelatihan, Pengujian & Perwasitan Shorinji Kempo 2026',
                'description' => 'Evaluasi penguasaan materi Falsafah Kempo (Kongo Zen), Metodologi Kepelatihan, Standar Pengujian Kyu/Dan, dan Regulasi Perwasitan WSKO/PERKEMI.',
                'exam_type' => 'theory',
                'duration_minutes' => 60,
                'passing_score' => 75.00,
                'attempts_allowed' => 2,
                'status' => 'open',
                'instructions' => 'Pilihlah salah satu jawaban yang paling tepat. Waktu pengerjaan adalah 60 menit. Dilarang membuka catatan atau berdiskusi selama ujian berlangsung.',
                'randomize_questions' => false,
                'randomize_answers' => false,
                'result_display' => 'immediate',
            ]
        );

        // Seed CBT Questions
        $questionsData = [
            [
                'question_text' => 'Falsafah dasar Shorinji Kempo berakar dari ajaran Kongo Zen, dengan prinsip utama "Riki Ai Niwa" yang bermakna:',
                'question_type' => 'single_choice',
                'options' => [
                    ['id' => 'A', 'text' => 'Kekuatan tanpa kasih sayang adalah kezaliman, kasih sayang tanpa kekuatan adalah kelemahan.'],
                    ['id' => 'B', 'text' => 'Kemenangan sejati adalah menaklukkan lawan tanpa pertarungan fisik.'],
                    ['id' => 'C', 'text' => 'Ketahanan fisik di atas segala bentuk pembinaan mental kenshi.'],
                    ['id' => 'D', 'text' => 'Ketaatan mutlak terhadap tradisi bela diri masa lalu.'],
                ],
                'correct_answer' => 'A',
                'points' => 25.00,
                'explanation' => 'Prinsip Riki Ai Niwa (Kekuatan dan Kasih Sayang Menyatu) menyatakan bahwa kekuatan tanpa cinta kasih melahirkan tirani, sedangkan cinta kasih tanpa kekuatan tidak berdaya.',
                'category' => 'Falsafah & Tradisi',
            ],
            [
                'question_text' => 'Dalam teknik Shorinji Kempo, pembagian teknik dasar secara garis besar terbagi menjadi dua pilar utama, yaitu:',
                'question_type' => 'single_choice',
                'options' => [
                    ['id' => 'A', 'text' => 'Kata dan Kumite'],
                    ['id' => 'B', 'text' => 'Goho (teknik keras) dan Juho (teknik lunak)'],
                    ['id' => 'C', 'text' => 'Nage dan Kansetsu'],
                    ['id' => 'D', 'text' => 'Embu dan Tandoku'],
                ],
                'correct_answer' => 'B',
                'points' => 25.00,
                'explanation' => 'Shorinji Kempo membagi teknik utamanya ke dalam Goho (pukulan, tendangan, tangkisan) dan Juho (kuncian, lepasan, bantingan).',
                'category' => 'Teknik Dasar',
            ],
            [
                'question_text' => 'Berdasarkan regulasi pertandingan Shorinji Kempo PERKEMI, seorang wasit (Shushin) wajib menghentikan pertarungan randori dengan aba-aba "Yame" apabila:',
                'question_type' => 'single_choice',
                'options' => [
                    ['id' => 'A', 'text' => 'Terjadi pelanggaran aturan keselamatan (Chui/Hansoku) atau serangan telak yang bernilai Waza-ari/Ippon.'],
                    ['id' => 'B', 'text' => 'Penonton memberikan sorakan keras dari tribun dojo.'],
                    ['id' => 'C', 'text' => 'Salah satu pelatih kenshi berdiri di tepi matras tatami.'],
                    ['id' => 'D', 'text' => 'Waktu pertandingan baru berjalan 10 detik.'],
                ],
                'correct_answer' => 'A',
                'points' => 25.00,
                'explanation' => 'Shushin menghentikan pertandingan untuk keselamatan, pemberian nilai waza-ari/ippon, atau penindakan pelanggaran.',
                'category' => 'Perwasitan',
            ],
            [
                'question_text' => 'Ujian kenaikan tingkat kenshi dari Kyu 1 menuju I Dan (Shodan) berwenang diuji oleh:',
                'question_type' => 'single_choice',
                'options' => [
                    ['id' => 'A', 'text' => 'Dewan Penguji bersertifikat Penguji Nasional (PEN) atau tim penguji resmi PB PERKEMI.'],
                    ['id' => 'B', 'text' => 'Pelatih Dojo setempat tanpa surat tugas PB PERKEMI.'],
                    ['id' => 'C', 'text' => 'Wasit Daerah yang sedang bertugas di kejuaraan.'],
                    ['id' => 'D', 'text' => 'Pengurus KONI Kota/Kabupaten setempat.'],
                ],
                'correct_answer' => 'A',
                'points' => 25.00,
                'explanation' => 'Tingkat Yudansha (I Dan ke atas) harus diuji oleh Dewan Penguji Nasional dengan SK resmi PB PERKEMI.',
                'category' => 'Pengujian',
            ],
        ];

        foreach ($questionsData as $idx => $qData) {
            CbtQuestion::updateOrCreate(
                [
                    'cbt_exam_package_id' => $cbtPackage->id,
                    'question_text' => $qData['question_text'],
                ],
                array_merge($qData, ['sort_order' => $idx + 1])
            );
        }

        // 10. Update Active Rundown Sessions & Seed QR Absensi
        $firstMaterial = Material::where('status', 'published')->first();
        $sessions = EventSession::where('event_id', $event->id)->get();

        if ($sessions->isNotEmpty()) {
            // Sesi 1 / Hari 1: Live open attendance
            $firstSession = $sessions->first();
            $firstSession->update([
                'attendance_setting' => 'check_in',
                'is_attendance_open' => true,
                'attendance_open_at' => now()->subHour(),
                'attendance_close_at' => now()->addHours(3),
                'qr_token' => 'KEMPO2026-QR-TOKEN-SESSION-1',
                'qr_short_code' => 'KMP001',
                'material_id' => $firstMaterial?->id,
            ]);

            // Sesi Ujian (Sesi 3 / Hari 3 atau sesi bertipe Ujian): Link to CBT
            $cbtSession = $sessions->firstWhere('session_type_code', 'UJIAN') ?? $sessions->last();
            if ($cbtSession) {
                $cbtSession->update([
                    'cbt_exam_package_id' => $cbtPackage->id,
                    'attendance_setting' => 'check_in',
                    'requires_attendance_before_cbt' => false,
                    'qr_token' => 'KEMPO2026-QR-TOKEN-SESSION-EXAM',
                    'qr_short_code' => 'KMPCBT',
                ]);
            }

            // Seed sample attendances for the first session
            $firstUser = User::first();
            $firstParticipant = Participant::first();

            if ($firstParticipant) {
                EventAttendance::updateOrCreate(
                    [
                        'event_session_id' => $firstSession->id,
                        'participant_id' => $firstParticipant->id,
                        'attendance_type' => 'check_in',
                    ],
                    [
                        'event_id' => $event->id,
                        'status' => 'present',
                        'checked_in_at' => now()->subMinutes(45),
                        'method' => 'qr_scan',
                        'recorded_by' => $firstUser?->id,
                        'notes' => 'Kehadiran terkonfirmasi melalui pemindaian QR code sesi',
                    ]
                );
            }

            // 10. Master Modul Pembelajaran (Kurikulum Nasional PERKEMI)
            $materials = Material::where('status', 'published')->get();

            $modPelatih = LearningModule::updateOrCreate(
                ['code' => 'MOD-PEL-01'],
                [
                    'title' => 'Metodologi Kepelatihan & Periodisasi Shorinji Kempo',
                    'slug' => 'metodologi-kepelatihan-periodisasi-kempo',
                    'description' => 'Panduan terstruktur kurikulum kepelatihan kenshi tingkat daerah dan nasional, mencakup penyusunan program latihan makro/mikro, penyeragaman teknik dasar Goho & Juho, dan keselamatan kenshi.',
                    'category' => 'Kepelatihan',
                    'track_codes' => ['PD', 'PN', 'PWAD', 'PWAN'],
                    'target_roles' => ['Pelatih Daerah', 'Pelatih Nasional'],
                    'total_jp' => 6,
                    'level' => 'Menengah',
                    'status' => 'active',
                    'learning_objectives' => [
                        'Memahami prinsip dasar pedagogi dan metodologi kepelatihan Shorinji Kempo.',
                        'Menyusun periodisasi program latihan kenshi menuju kejuaraan.',
                        'Menguasai penyeragaman teknik dasar (Kihon) Goho dan Juho.',
                    ],
                    'competency_outcomes' => [
                        'Mampu menyusun rencana latihan mingguan dan bulanan.',
                        'Mampu mengoreksi kesalahan posisi kuda-kuda dan titik perkenaan teknik.',
                    ],
                    'keywords' => 'kepelatihan, periodisasi, goho, juho, kempo',
                    'created_by' => $firstUser?->id,
                ]
            );

            // Connect module to existing digital materials
            if ($materials->isNotEmpty()) {
                $syncMaterials = [];
                foreach ($materials->take(2) as $idx => $mat) {
                    $syncMaterials[$mat->id] = [
                        'sort_order' => $idx + 1,
                        'is_required' => true,
                        'instructor_notes' => 'Pelajari bab 1 hingga 3 sebelum memasuki sesi praktik dojo.',
                        'estimated_duration_minutes' => 45,
                    ];
                }
                $modPelatih->materials()->sync($syncMaterials);
            }

            $modWasit = LearningModule::updateOrCreate(
                ['code' => 'MOD-WST-01'],
                [
                    'title' => 'Regulasi Perwasitan & Tata Tertib Pertandingan WSKO/PERKEMI',
                    'slug' => 'regulasi-perwasitan-tata-tertib-pertandingan',
                    'description' => 'Standarisasi kepemimpinan wasit matras (Shushin) dan wasit juri (Fukushin) sesuai amandemen regulasi pertandingan World Shorinji Kempo Organization.',
                    'category' => 'Perwasitan',
                    'track_codes' => ['WAD', 'WAN', 'PWAD', 'PWAN'],
                    'target_roles' => ['Wasit Daerah', 'Wasit Nasional'],
                    'total_jp' => 4,
                    'level' => 'Lanjutan',
                    'status' => 'active',
                    'learning_objectives' => [
                        'Menguasai pasal-pasal pelanggaran dan pemberian peringatan Chui/Hansoku.',
                        'Memahami kriteria sah serangan bernilai Waza-ari dan Ippon.',
                    ],
                    'competency_outcomes' => [
                        'Memimpin pertandingan randori dan embu secara tegas, netral, dan aman.',
                    ],
                    'keywords' => 'perwasitan, shushin, fukushin, randori, wsko',
                    'created_by' => $firstUser?->id,
                ]
            );

            if ($materials->count() >= 2) {
                $syncWasitMaterials = [];
                foreach ($materials->slice(1, 2) as $idx => $mat) {
                    $syncWasitMaterials[$mat->id] = [
                        'sort_order' => $idx + 1,
                        'is_required' => true,
                        'instructor_notes' => 'Baca regulasi nomor pertandingan dan standar matras tatami.',
                        'estimated_duration_minutes' => 30,
                    ];
                }
                $modWasit->materials()->sync($syncWasitMaterials);
            }

            // 11. Master Modul Soal (Blueprint Evaluasi)
            $qmPelatih = QuestionModule::updateOrCreate(
                ['code' => 'QM-PEL-01'],
                [
                    'title' => 'Evaluasi Standarisasi Metodologi Kepelatihan Kempo',
                    'slug' => 'evaluasi-standarisasi-metodologi-kepelatihan-kempo',
                    'description' => 'Blueprint evaluasi kompetensi pedagogi, periodisasi latihan fisik, dan teknik pembinaan kenshi.',
                    'category' => 'Kepelatihan',
                    'track_codes' => ['PD', 'PN', 'PWAD', 'PWAN'],
                    'tested_competencies' => ['Periodisasi Latihan', 'Metodologi Pembinaan', 'Kaidah Keselamatan Latihan'],
                    'assessment_indicators' => ['Penyusunan siklus makro', 'Pencegahan overtraining', 'Koreksi teknik kihon'],
                    'evaluation_purpose' => 'Mengukur kelayakan kenshi untuk mendapatkan sertifikat pelatih resmi PERKEMI.',
                    'default_weight' => 100.00,
                    'passing_grade' => 75.00,
                    'status' => 'active',
                    'learning_module_id' => $modPelatih->id,
                    'created_by' => $firstUser?->id,
                ]
            );

            $qmWasit = QuestionModule::updateOrCreate(
                ['code' => 'QM-WST-01'],
                [
                    'title' => 'Evaluasi Regulasi Perwasitan & Sinyal Wasit',
                    'slug' => 'evaluasi-regulasi-perwasitan-sinyal-wasit',
                    'description' => 'Blueprint evaluasi penguasaan tata tertib pertandingan, sinyal bendera wasit, dan penegakan disiplin matras.',
                    'category' => 'Perwasitan',
                    'track_codes' => ['WAD', 'WAN', 'PWAD', 'PWAN'],
                    'tested_competencies' => ['Sinyal Wasit Matras', 'Penilaian Randori & Embu', 'Penanganan Hansoku'],
                    'assessment_indicators' => ['Ketepatan aba-aba Yame/Hajime', 'Pembedaan Waza-ari dan Ippon', 'Keamanan atlet'],
                    'evaluation_purpose' => 'Sertifikasi kompetensi wasit daerah dan nasional.',
                    'default_weight' => 100.00,
                    'passing_grade' => 75.00,
                    'status' => 'active',
                    'learning_module_id' => $modWasit->id,
                    'created_by' => $firstUser?->id,
                ]
            );

            // 12. Master Bank Soal (QuestionBank)
            $qbQuestions = [
                [
                    'code' => 'SOAL-PEL-001',
                    'question_module_id' => $qmPelatih->id,
                    'learning_module_id' => $modPelatih->id,
                    'question_text' => 'Dalam periodisasi latihan Shorinji Kempo, fase persiapan khusus menitikberatkan pada:',
                    'question_type' => 'single_choice',
                    'options' => [
                        ['id' => 'A', 'text' => 'Pematangan aplikasi teknik Embu berpasangan dan randori terarah.'],
                        ['id' => 'B', 'text' => 'Peningkatan daya tahan aerobik umum tanpa memegang dōgi.'],
                        ['id' => 'C', 'text' => 'Istirahat total dari segala bentuk aktivitas fisik.'],
                        ['id' => 'D', 'text' => 'Pembahasan teori sejarah bela diri semata.'],
                    ],
                    'correct_answer' => 'A',
                    'points' => 25.00,
                    'difficulty_level' => 'intermediate',
                    'explanation' => 'Fase persiapan khusus berfokus pada spesifisitas cabang olahraga, seperti pematangan kombinasi teknik Juho dan Goho.',
                    'status' => 'active',
                    'created_by' => $firstUser?->id,
                ],
                [
                    'code' => 'SOAL-PEL-002',
                    'question_module_id' => $qmPelatih->id,
                    'learning_module_id' => $modPelatih->id,
                    'question_text' => 'Prinsip "Goju Ittai" dalam kepelatihan teknik Shorinji Kempo mengandung arti:',
                    'question_type' => 'single_choice',
                    'options' => [
                        ['id' => 'A', 'text' => 'Teknik keras (Goho) dan teknik lunak (Juho) saling melengkapi dan tak terpisahkan.'],
                        ['id' => 'B', 'text' => 'Kekuatan fisik harus mengalahkan fleksibilitas persendian.'],
                        ['id' => 'C', 'text' => 'Pelatih dan atlet memiliki kedudukan tanpa hierarki dojo.'],
                        ['id' => 'D', 'text' => 'Serangan hanya boleh dilakukan secara keras tanpa tangkisan.'],
                    ],
                    'correct_answer' => 'A',
                    'points' => 25.00,
                    'difficulty_level' => 'basic',
                    'explanation' => 'Goju Ittai adalah integrasi harmonis antara kelembutan Juho dan ketegasan Goho.',
                    'status' => 'active',
                    'created_by' => $firstUser?->id,
                ],
                [
                    'code' => 'SOAL-WST-001',
                    'question_module_id' => $qmWasit->id,
                    'learning_module_id' => $modWasit->id,
                    'question_text' => 'Seorang kenshi melakukan serangan dorongan yang tidak terkontrol hingga lawan keluar garis batas tatami. Tindakan wasit utama (Shushin) adalah:',
                    'question_type' => 'single_choice',
                    'options' => [
                        ['id' => 'A', 'text' => 'Menghentikan pertandingan dengan aba-aba "Yame", mengembalikan posisi ke tengah, dan memberikan peringatan Chui.'],
                        ['id' => 'B', 'text' => 'Mengabaikan kejadian dan melanjutkan pertarungan di luar matras.'],
                        ['id' => 'C', 'text' => 'Langsung memberikan nilai Ippon kepada lawan.'],
                        ['id' => 'D', 'text' => 'Menghentikan seluruh nomor pertandingan hari itu.'],
                    ],
                    'correct_answer' => 'A',
                    'points' => 25.00,
                    'difficulty_level' => 'intermediate',
                    'explanation' => 'Keluar batas arena akibat serangan ilegal atau dorongan tidak sah dikenakan sanksi peringatan teknis oleh Shushin.',
                    'status' => 'active',
                    'created_by' => $firstUser?->id,
                ],
                [
                    'code' => 'SOAL-WST-002',
                    'question_module_id' => $qmWasit->id,
                    'learning_module_id' => $modWasit->id,
                    'question_text' => 'Kriteria sah untuk pemberian nilai Waza-ari pada pertandingan Randori adalah serangan bersih yang memenuhi:',
                    'question_type' => 'single_choice',
                    'options' => [
                        ['id' => 'A', 'text' => 'Kekuatan yang cukup, sasaran sah terarah, zanshin (sikap waspada), dan tidak ada pelanggaran.'],
                        ['id' => 'B', 'text' => 'Suara teriakan kiai paling keras tanpa kontak sasaran.'],
                        ['id' => 'C', 'text' => 'Serangan yang mengenai pelindung wajah secara terlarang.'],
                        ['id' => 'D', 'text' => 'Permintaan dari pelatih di sudut matras.'],
                    ],
                    'correct_answer' => 'A',
                    'points' => 25.00,
                    'difficulty_level' => 'advanced',
                    'explanation' => 'Waza-ari mensyaratkan target perkenaan akurat dengan kuda-kuda kokoh dan kesadaran purna (zanshin).',
                    'status' => 'active',
                    'created_by' => $firstUser?->id,
                ],
            ];

            $savedBankQuestions = [];
            foreach ($qbQuestions as $q) {
                $question = QuestionBank::updateOrCreate(['code' => $q['code']], $q);
                $question->questionModules()->syncWithoutDetaching([$q['question_module_id']]);
                $savedBankQuestions[] = $question;
            }

            // 13. Link CBT Package to Question Module & Bank Questions
            $cbtPackage->update([
                'question_module_id' => $qmWasit->id,
                'target_tracks' => ['PD', 'PN', 'PED', 'PEN', 'WAD', 'WAN', 'PWAD', 'PWAN'],
                'total_questions' => count($savedBankQuestions),
            ]);

            // Sync bank questions to CBT Package
            $cbtPackage->bankQuestions()->sync(
                collect($savedBankQuestions)->pluck('id')->all()
            );

            // 14. Hubungkan Modul Pembelajaran & Paket CBT ke Event
            $event->learningModules()->syncWithoutDetaching([
                $modPelatih->id => [
                    'participant_path_id' => 'all',
                    'is_required' => true,
                    'sort_order' => 1,
                    'availability_start_at' => $event->start_date,
                    'availability_end_at' => $event->end_date,
                ],
                $modWasit->id => [
                    'participant_path_id' => 'all',
                    'is_required' => true,
                    'sort_order' => 2,
                    'availability_start_at' => $event->start_date,
                    'availability_end_at' => $event->end_date,
                ],
            ]);

            $event->linkedCbtPackages()->syncWithoutDetaching([
                $cbtPackage->id => [
                    'participant_path_id' => 'all',
                    'is_required' => true,
                    'sort_order' => 1,
                    'requires_attendance_session_id' => $firstSession->id,
                    'availability_start_at' => $event->start_date,
                    'availability_end_at' => $event->end_date,
                ],
            ]);

            // 15. Update sesi pertama dengan learning_module_id
            $firstSession->update([
                'learning_module_id' => $modPelatih->id,
            ]);
        }

        $this->call(EventRoomSeeder::class);
    }
}
