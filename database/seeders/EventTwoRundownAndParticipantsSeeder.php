<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\EventRoom;
use App\Models\EventSession;
use App\Models\Participant;
use App\Models\Speaker;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use LogicException;

class EventTwoRundownAndParticipantsSeeder extends Seeder
{
    private const EVENT_ID = 2;

    /**
     * @var array<int, string>
     */
    private const ALL_TRACKS = ['PD', 'PN', 'PED', 'PEN', 'WAD', 'WAN', 'PWAD', 'PWAN'];

    public function run(): void
    {
        DB::transaction(function (): void {
            $event = Event::query()->find(self::EVENT_ID);

            if (! $event) {
                throw new LogicException('Event ID 2 tidak ditemukan. Jalankan seeder data event terlebih dahulu.');
            }

            $rooms = $this->seedRooms($event);
            $speakers = $this->seedSpeakers($event);

            $this->seedSessions($event, $rooms, $speakers);
            $this->seedParticipants($event);

            $responsibleUserId = User::query()
                ->where('role', 'Penyelenggara')
                ->orderBy('id')
                ->value('id');

            $event->update([
                'duration_text' => $event->total_days.' hari',
                'total_effective_jp' => $event->sessions()->sum('duration_jp'),
                'total_schedule_jp' => $event->sessions()->sum('duration_jp'),
                'learning_method' => 'Pleno, kelas paralel, praktik dojo, demonstrasi, simulasi, dan evaluasi',
                ...($event->responsible_user_id === null && $responsibleUserId ? [
                    'responsible_user_id' => $responsibleUserId,
                ] : []),
            ]);
        });
    }

    /**
     * @return Collection<string, EventRoom>
     */
    private function seedRooms(Event $event): Collection
    {
        return collect([
            'registration' => 'Area Registrasi UTC',
            'auditorium' => 'Auditorium Utama UTC',
            'dojo' => 'Dojo Utama UTC',
            'class_a' => 'Ruang Kelas A',
            'class_b' => 'Ruang Kelas B',
            'class_c' => 'Ruang Kelas C',
        ])->mapWithKeys(function (string $name, string $key) use ($event): array {
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
            'surya' => ['name' => 'Surya Adinata', 'title_degree' => 'M.Pd.', 'dan_rank' => 'VI-DAN', 'position' => 'Ketua Bidang Pendidikan dan Penataran PB PERKEMI', 'specialization' => 'Kurikulum dan metodologi kepelatihan'],
            'ratna' => ['name' => 'Ratna Wulandari', 'title_degree' => 'M.Or.', 'dan_rank' => 'V-DAN', 'position' => 'Instruktur Nasional PERKEMI', 'specialization' => 'Goho, Juho, dan keselamatan latihan'],
            'bagus' => ['name' => 'Bagus Prabowo', 'title_degree' => 'S.Pd.', 'dan_rank' => 'V-DAN', 'position' => 'Komisi Kepelatihan PB PERKEMI', 'specialization' => 'Periodisasi dan kondisi fisik kenshi'],
            'nugroho' => ['name' => 'Nugroho Santosa', 'title_degree' => null, 'dan_rank' => 'VI-DAN', 'position' => 'Komisi Perwasitan PB PERKEMI', 'specialization' => 'Perwasitan, randori, dan regulasi pertandingan'],
            'laksmi' => ['name' => 'Laksmi Puspitasari', 'title_degree' => 'dr.', 'dan_rank' => 'IV-DAN', 'position' => 'Tim Medis PB PERKEMI', 'specialization' => 'Pencegahan cedera dan pertolongan pertama'],
            'dimas' => ['name' => 'Dimas Kurniawan', 'title_degree' => 'S.Kom.', 'dan_rank' => 'IV-DAN', 'position' => 'Tim Evaluasi Pendidikan PB PERKEMI', 'specialization' => 'Asesmen kompetensi dan evaluasi pembelajaran'],
        ];

        return collect($speakers)->mapWithKeys(function (array $speaker, string $key) use ($event): array {
            $email = "{$key}.event2@perkemi.test";
            $model = Speaker::withTrashed()->updateOrCreate(
                ['event_id' => $event->id, 'contact_email' => $email],
                [
                    ...$speaker,
                    'type' => 'internal',
                    'organization' => 'PB PERKEMI',
                    'bio' => 'Pemateri pada Workshop Kualifikasi Pelatih, Penguji, dan Wasit PERKEMI 2026.',
                    'contact_email' => $email,
                    'is_active' => true,
                ],
            );

            if ($model->trashed()) {
                $model->restore();
            }

            return [$key => $model];
        });
    }

    /**
     * @param  Collection<string, EventRoom>  $rooms
     * @param  Collection<string, Speaker>  $speakers
     */
    private function seedSessions(Event $event, Collection $rooms, Collection $speakers): void
    {
        $startDate = $event->start_date->copy();

        $this->upsertSession($event, $rooms, $speakers, [
            'day' => 1,
            'date' => $startDate,
            'number' => 'Kedatangan',
            'start' => '00:00',
            'end' => '23:59',
            'type' => 'KEHADIRAN_AWAL',
            'topic' => 'Kehadiran awal event',
            'subtopic' => 'Registrasi kedatangan peserta sebelum mengikuti seluruh rangkaian workshop.',
            'room' => 'registration',
            'speaker' => null,
            'tracks' => self::ALL_TRACKS,
            'jp' => 0,
        ]);

        foreach (range(1, $event->total_days) as $dayNumber) {
            $date = $startDate->copy()->addDays($dayNumber - 1);

            $this->upsertSession($event, $rooms, $speakers, [
                'day' => $dayNumber,
                'date' => $date,
                'number' => "Harian {$dayNumber}",
                'start' => '06:00',
                'end' => '10:00',
                'type' => 'KEHADIRAN_HARIAN',
                'topic' => "Kehadiran hari ke-{$dayNumber}",
                'subtopic' => 'Kehadiran harian wajib sebelum peserta membuka materi dan mengikuti sesi pada hari ini.',
                'room' => 'registration',
                'speaker' => null,
                'tracks' => self::ALL_TRACKS,
                'jp' => 0,
            ]);

            foreach ($this->agendaForDay($dayNumber) as $sequence => $agenda) {
                $this->upsertSession($event, $rooms, $speakers, [
                    ...$agenda,
                    'day' => $dayNumber,
                    'date' => $date,
                    'number' => sprintf('D%02d-%02d', $dayNumber, $sequence + 1),
                ]);
            }
        }
    }

    /**
     * @param  Collection<string, EventRoom>  $rooms
     * @param  Collection<string, Speaker>  $speakers
     * @param  array{day: int, date: Carbon, number: string, start: string, end: string, type: string, topic: string, subtopic: string, room: string, speaker: ?string, tracks: array<int, string>, jp: int}  $session
     */
    private function upsertSession(Event $event, Collection $rooms, Collection $speakers, array $session): void
    {
        $room = $rooms->get($session['room']);
        $speaker = $session['speaker'] ? $speakers->get($session['speaker']) : null;
        $shortCode = str_starts_with($session['number'], 'Harian')
            ? sprintf('E2D%03d', $session['day'])
            : ($session['number'] === 'Kedatangan'
                ? 'E2ARR0'
                : sprintf('E2%02d%02d', $session['day'], (int) substr($session['number'], -2)));

        $eventSession = EventSession::query()->firstOrNew([
            'event_id' => $event->id,
            'session_number' => $session['number'],
        ]);

        $eventSession->fill([
            'day_number' => $session['day'],
            'date' => $session['date']->toDateString(),
            'start_time' => $session['start'],
            'end_time' => $session['end'],
            'duration_jp' => $session['jp'],
            'session_type_code' => $session['type'],
            'topic' => $session['topic'],
            'subtopic' => $session['subtopic'],
            'method' => $this->methodForType($session['type']),
            'speaker_id' => $speaker?->id,
            'room' => $room?->name,
            'event_room_id' => $room?->id,
            'track_codes' => $session['tracks'],
        ]);

        if (! $eventSession->exists) {
            $eventSession->fill([
                'status' => 'scheduled',
                'attendance_setting' => 'check_in',
                'requires_attendance_before_cbt' => false,
            ]);
        }

        $eventSession->qr_token ??= substr(hash('sha256', "event-{$event->id}-{$session['number']}-attendance"), 0, 40);
        $eventSession->qr_short_code ??= $shortCode;
        $eventSession->save();
    }

    private function methodForType(string $sessionType): string
    {
        return match ($sessionType) {
            'PRAKTIK' => 'Demonstrasi, praktik berpasangan, dan umpan balik instruktur',
            'PAR_PELATIH', 'PAR_PENGUJI', 'PAR_WASIT', 'PAR_GANDA' => 'Kelas paralel, studi kasus, dan simulasi',
            'REFLEKSI' => 'Refleksi terarah dan diskusi kelompok',
            'PENUTUPAN' => 'Pleno dan upacara penutupan',
            'KEHADIRAN_AWAL', 'KEHADIRAN_HARIAN' => 'Pemindaian QR kehadiran',
            default => 'Pleno interaktif, diskusi, dan tanya jawab',
        };
    }

    /**
     * @return array<int, array{start: string, end: string, type: string, topic: string, subtopic: string, room: string, speaker: ?string, tracks: array<int, string>, jp: int}>
     */
    private function agendaForDay(int $day): array
    {
        return match ($day) {
            1 => [
                $this->agenda('08:00', '09:30', 'PLENO', 'Pembukaan dan orientasi workshop', 'Penjelasan tujuan, tata tertib, alur pembelajaran, dan standar kelulusan.', 'auditorium', 'surya', self::ALL_TRACKS, 2),
                $this->agenda('09:45', '11:15', 'PLENO', 'Nilai dasar dan kode etik instruktur PERKEMI', 'Penerapan nilai Shorinji Kempo dalam pembinaan kenshi dan pengelolaan dojo.', 'auditorium', 'surya', self::ALL_TRACKS, 2),
                $this->agenda('13:00', '15:15', 'PLENO', 'Standarisasi kurikulum penataran nasional', 'Struktur kompetensi pelatih, penguji, dan wasit serta keterhubungan antarjalur.', 'auditorium', 'surya', self::ALL_TRACKS, 3),
                $this->agenda('15:30', '17:00', 'REFLEKSI', 'Pemetaan kompetensi awal peserta', 'Inventarisasi pengalaman, kebutuhan belajar, dan target kompetensi peserta.', 'class_a', 'dimas', self::ALL_TRACKS, 2),
            ],
            2 => [
                $this->agenda('08:00', '10:15', 'PLENO', 'Prinsip pembelajaran orang dewasa', 'Strategi menyampaikan materi teknis kepada peserta dengan latar belakang beragam.', 'auditorium', 'surya', self::ALL_TRACKS, 3),
                $this->agenda('10:30', '12:00', 'PLENO', 'Komunikasi instruksional dan umpan balik', 'Teknik demonstrasi, observasi, koreksi, dan umpan balik yang aman.', 'auditorium', 'ratna', self::ALL_TRACKS, 2),
                $this->agenda('13:30', '15:45', 'PRAKTIK', 'Penyusunan rencana sesi latihan', 'Peserta menyusun tujuan, urutan kegiatan, indikator, dan evaluasi sesi.', 'class_a', 'bagus', self::ALL_TRACKS, 3),
                $this->agenda('16:00', '17:30', 'REFLEKSI', 'Klinik rancangan pembelajaran', 'Ulasan rancangan sesi dan perbaikan berbasis umpan balik sejawat.', 'class_a', 'bagus', self::ALL_TRACKS, 2),
            ],
            3 => [
                $this->agenda('08:00', '10:15', 'PLENO', 'Anatomi gerak dan keselamatan latihan', 'Risiko gerak, pemanasan, pendinginan, serta prinsip latihan aman.', 'auditorium', 'laksmi', self::ALL_TRACKS, 3),
                $this->agenda('10:30', '12:00', 'PRAKTIK', 'Pemeriksaan kesiapan fisik kenshi', 'Observasi kondisi awal dan penyesuaian beban latihan.', 'dojo', 'laksmi', self::ALL_TRACKS, 2),
                $this->agenda('13:30', '15:45', 'PLENO', 'Periodisasi dan kondisi fisik', 'Penyusunan siklus latihan sesuai usia, level, dan kalender kegiatan.', 'auditorium', 'bagus', self::ALL_TRACKS, 3),
                $this->agenda('16:00', '17:30', 'PRAKTIK', 'Simulasi penanganan cedera ringan', 'Pertolongan pertama dan prosedur rujukan pada kegiatan dojo.', 'dojo', 'laksmi', self::ALL_TRACKS, 2),
            ],
            4 => $this->technicalDay('Goho', 'ratna'),
            5 => $this->technicalDay('Juho', 'ratna'),
            6 => [
                $this->agenda('08:00', '10:15', 'PLENO', 'Prinsip Embu dan Randori', 'Tujuan pembinaan, struktur penilaian, dan keselamatan pelaksanaan.', 'auditorium', 'nugroho', self::ALL_TRACKS, 3),
                $this->agenda('10:30', '12:00', 'PRAKTIK', 'Observasi performa Embu', 'Penggunaan indikator teknik, keserasian, semangat, dan ketepatan.', 'dojo', 'nugroho', self::ALL_TRACKS, 2),
                $this->agenda('13:30', '15:45', 'PRAKTIK', 'Simulasi Randori terkendali', 'Pengaturan pasangan, durasi, keselamatan, serta evaluasi pelaksanaan.', 'dojo', 'nugroho', self::ALL_TRACKS, 3),
                $this->agenda('16:00', '17:30', 'REFLEKSI', 'Analisis video praktik', 'Identifikasi momen kunci dan penyusunan rekomendasi perbaikan.', 'auditorium', 'nugroho', self::ALL_TRACKS, 2),
            ],
            7 => [
                $this->agenda('08:00', '10:15', 'PAR_PELATIH', 'Kelas paralel pelatih: program latihan dojo', 'Penyusunan program latihan dan pemantauan perkembangan kenshi.', 'class_a', 'bagus', ['PD', 'PN'], 3),
                $this->agenda('08:00', '10:15', 'PAR_PENGUJI', 'Kelas paralel penguji: standardisasi pengujian', 'Administrasi ujian, rubrik, dan konsistensi keputusan penguji.', 'class_b', 'surya', ['PED', 'PEN', 'PWAD', 'PWAN'], 3),
                $this->agenda('08:00', '10:15', 'PAR_WASIT', 'Kelas paralel wasit: interpretasi peraturan', 'Penerapan regulasi dan komunikasi keputusan pertandingan.', 'class_c', 'nugroho', ['WAD', 'WAN', 'PWAD', 'PWAN'], 3),
                $this->agenda('10:30', '12:00', 'PAR_GANDA', 'Integrasi kompetensi peserta jalur ganda', 'Pengelolaan peran penguji dan wasit secara objektif dan konsisten.', 'class_c', 'nugroho', ['PWAD', 'PWAN'], 2),
                $this->agenda('13:30', '16:30', 'PRAKTIK', 'Simulasi lintas jalur', 'Pelatih, penguji, dan wasit menjalankan studi kasus terpadu.', 'dojo', 'surya', self::ALL_TRACKS, 4),
            ],
            8 => [
                $this->agenda('08:00', '10:15', 'PLENO', 'Asesmen kompetensi berbasis rubrik', 'Penyusunan indikator yang terukur, relevan, dan dapat diamati.', 'auditorium', 'dimas', self::ALL_TRACKS, 3),
                $this->agenda('10:30', '12:00', 'PLENO', 'Objektivitas dan moderasi nilai', 'Kalibrasi penilai dan penanganan perbedaan hasil observasi.', 'auditorium', 'dimas', self::ALL_TRACKS, 2),
                $this->agenda('13:30', '15:45', 'PRAKTIK', 'Lokakarya penyusunan instrumen', 'Pembuatan rubrik untuk teknik, pengajaran, pengujian, dan perwasitan.', 'class_a', 'dimas', self::ALL_TRACKS, 3),
                $this->agenda('16:00', '17:30', 'REFLEKSI', 'Moderasi instrumen antarkelompok', 'Uji keterbacaan dan konsistensi rubrik hasil lokakarya.', 'class_a', 'dimas', self::ALL_TRACKS, 2),
            ],
            9 => [
                $this->agenda('08:00', '10:15', 'PRAKTIK', 'Microteaching putaran pertama', 'Praktik mengajar singkat berdasarkan rencana sesi yang telah disusun.', 'dojo', 'ratna', self::ALL_TRACKS, 3),
                $this->agenda('10:30', '12:00', 'REFLEKSI', 'Umpan balik microteaching pertama', 'Umpan balik instruktur dan sejawat menggunakan rubrik.', 'class_a', 'surya', self::ALL_TRACKS, 2),
                $this->agenda('13:30', '15:45', 'PRAKTIK', 'Microteaching putaran kedua', 'Perbaikan praktik mengajar berdasarkan hasil putaran pertama.', 'dojo', 'bagus', self::ALL_TRACKS, 3),
                $this->agenda('16:00', '17:30', 'REFLEKSI', 'Portofolio dan rencana perbaikan', 'Peserta merangkum eviden kompetensi dan tindak lanjut individu.', 'class_a', 'dimas', self::ALL_TRACKS, 2),
            ],
            10 => [
                $this->agenda('08:00', '10:15', 'PRAKTIK', 'Uji praktik kompetensi tahap pertama', 'Penilaian performa sesuai jalur peserta dan rubrik yang berlaku.', 'dojo', 'surya', self::ALL_TRACKS, 3),
                $this->agenda('10:30', '12:00', 'PRAKTIK', 'Uji praktik kompetensi tahap kedua', 'Rotasi peserta dan penyelesaian penilaian praktik per jalur.', 'dojo', 'ratna', self::ALL_TRACKS, 2),
                $this->agenda('13:30', '15:45', 'PLENO', 'Evaluasi teori dan studi kasus', 'Evaluasi pemahaman kurikulum, keselamatan, asesmen, dan regulasi.', 'auditorium', 'dimas', self::ALL_TRACKS, 3),
                $this->agenda('16:00', '17:30', 'REFLEKSI', 'Klinik tindak lanjut hasil evaluasi', 'Pembahasan area kompetensi yang memerlukan penguatan.', 'class_a', 'dimas', self::ALL_TRACKS, 2),
            ],
            11 => [
                $this->agenda('08:00', '10:15', 'PLENO', 'Presentasi rencana tindak lanjut', 'Peserta mempresentasikan rencana penerapan hasil workshop di daerah.', 'auditorium', 'surya', self::ALL_TRACKS, 3),
                $this->agenda('10:30', '12:00', 'REFLEKSI', 'Evaluasi penyelenggaraan dan refleksi akhir', 'Umpan balik peserta serta refleksi capaian pembelajaran.', 'auditorium', 'dimas', self::ALL_TRACKS, 2),
                $this->agenda('13:30', '15:00', 'PLENO', 'Sidang kelulusan dan pengarahan akhir', 'Rekap hasil, ketentuan tindak lanjut, dan administrasi pascaevent.', 'auditorium', 'surya', self::ALL_TRACKS, 2),
                $this->agenda('15:15', '16:15', 'PENUTUPAN', 'Upacara penutupan workshop', 'Penutupan resmi dan pelepasan peserta.', 'auditorium', 'surya', self::ALL_TRACKS, 1),
            ],
        };
    }

    /**
     * @return array<int, array{start: string, end: string, type: string, topic: string, subtopic: string, room: string, speaker: ?string, tracks: array<int, string>, jp: int}>
     */
    private function technicalDay(string $technique, string $speaker): array
    {
        return [
            $this->agenda('08:00', '10:15', 'PLENO', "Analisis teknik dasar {$technique}", 'Prinsip gerak, jarak, ritme, kontrol, dan keselamatan teknik.', 'auditorium', $speaker, self::ALL_TRACKS, 3),
            $this->agenda('10:30', '12:00', 'PRAKTIK', "Demonstrasi dan koreksi {$technique}", 'Latihan observasi kesalahan serta penyampaian koreksi teknis.', 'dojo', $speaker, self::ALL_TRACKS, 2),
            $this->agenda('13:30', '15:45', 'PRAKTIK', "Praktik mengajar {$technique} berkelompok", 'Microteaching dengan rotasi peran instruktur dan peserta.', 'dojo', $speaker, self::ALL_TRACKS, 3),
            $this->agenda('16:00', '17:30', 'REFLEKSI', "Ulasan praktik {$technique}", 'Refleksi teknik, metode mengajar, dan keselamatan pelaksanaan.', 'class_a', $speaker, self::ALL_TRACKS, 2),
        ];
    }

    /**
     * @param  array<int, string>  $tracks
     * @return array{start: string, end: string, type: string, topic: string, subtopic: string, room: string, speaker: ?string, tracks: array<int, string>, jp: int}
     */
    private function agenda(string $start, string $end, string $type, string $topic, string $subtopic, string $room, ?string $speaker, array $tracks, int $jp): array
    {
        return compact('start', 'end', 'type', 'topic', 'subtopic', 'room', 'speaker', 'tracks', 'jp');
    }

    private function seedParticipants(Event $event): void
    {
        $assignments = [
            'peserta.sep26.01@perkemi.test' => ['PD', 'A1'],
            'budi.santoso@kempo.or.id' => ['PN', 'A1'],
            'citra.dewi@yahoo.com' => ['PED', 'A2'],
            'dian.prasetyo@kempo.id' => ['PEN', 'A2'],
            'eko.prabowo@gmail.com' => ['WAD', 'B1'],
            'faisal.rahman@kempo.or.id' => ['WAN', 'B1'],
            'gunawan.wibisono@gmail.com' => ['PWAD', 'B2'],
            'hesti.maharani@kempo.id' => ['PWAN', 'B2'],
            'made.suardana@kempo.or.id' => ['PD', 'C1'],
            'joko.triyono@gmail.com' => ['PN', 'C1'],
        ];

        $participants = Participant::query()
            ->whereIn('email', array_keys($assignments))
            ->get()
            ->keyBy('email');

        if ($participants->count() !== count($assignments)) {
            throw new LogicException('Data peserta master Event ID 2 belum lengkap. Jalankan EventManagementSeeder terlebih dahulu.');
        }

        $attendanceSchedule = collect(range(0, $event->total_days - 1))
            ->mapWithKeys(fn (int $offset): array => [
                $event->start_date->copy()->addDays($offset)->toDateString() => 'scheduled',
            ])
            ->all();

        foreach ($assignments as $email => [$trackCode, $rotationGroup]) {
            $participant = $participants->get($email);

            EventParticipant::query()->firstOrCreate(
                ['event_id' => $event->id, 'participant_id' => $participant->id],
                [
                    'track_code' => $trackCode,
                    'rotation_group' => $rotationGroup,
                    'admin_status' => 'verified',
                    'attendance_status' => 'absent',
                    'attendance_records' => $attendanceSchedule,
                    'graduation_status' => 'in_training',
                    'score_theory' => null,
                    'score_practice' => null,
                    'evaluation_notes' => null,
                    'has_seen_welcome' => false,
                    'checked_in_at' => null,
                    'checkin_method' => null,
                    'checkin_status' => 'registered',
                    'checkin_notes' => 'Belum melakukan kehadiran awal event.',
                ],
            );
        }
    }
}
