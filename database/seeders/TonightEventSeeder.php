<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\EventModule;
use App\Models\EventParticipant;
use App\Models\EventRoom;
use App\Models\EventSession;
use App\Models\Material;
use App\Models\Participant;
use App\Models\Speaker;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class TonightEventSeeder extends Seeder
{
    public const EVENT_SLUG = 'penataran-malam-ini';

    /**
     * Run the database seeds for tonight's event scenario.
     */
    public function run(): void
    {
        DB::transaction(function (): void {
            $today = Carbon::today();

            // 1. Staff / Penyelenggara
            $organizer = User::updateOrCreate(
                ['email' => 'penyelenggara.malam@perkemi.id'],
                [
                    'name' => 'Panitia Sesi Malam Ini',
                    'role' => 'Penyelenggara',
                    'password' => Hash::make('password'),
                ],
            );

            // 2. Pemateri
            $speaker = Speaker::first() ?? Speaker::create([
                'name' => 'Drs. Bambang Subekti',
                'title_degree' => 'M.Si.',
                'type' => 'internal',
                'dan_rank' => 'VII DAN',
                'position' => 'Dewan Guru PB PERKEMI',
                'organization' => 'PB PERKEMI',
                'specialization' => 'Standarisasi Teknik & Budo Kempo',
                'contact_email' => 'bambang.subekti@perkemi.or.id',
                'is_active' => true,
            ]);

            // 3. Event Malam Ini
            $event = Event::updateOrCreate(
                ['slug' => self::EVENT_SLUG],
                [
                    'title' => 'Penataran Khusus Kenshi — Sesi Malam Ini',
                    'description' => 'Sesi penataran dan pendalaman kurikulum kenshi khusus malam ini lengkap dengan absensi QR presensi dan materi digital terpusat.',
                    'start_date' => $today,
                    'end_date' => $today,
                    'location' => 'Dojo Utama & Zoom Daring Pusdiklat PERKEMI',
                    'organizer' => 'PB PERKEMI — Komisi Pelatihan & Penataran',
                    'duration_text' => '1 Hari (Sesi Malam 19.00 - 22.30 WIB)',
                    'total_effective_jp' => 4,
                    'total_schedule_jp' => 4,
                    'jp_duration_minutes' => 45,
                    'learning_method' => 'hybrid',
                    'quota' => 50,
                    'status' => 'published',
                    'access_roles' => ['Peserta', 'Pelatih', 'Penguji', 'Wasit', 'Pemateri', 'Penyelenggara'],
                    'responsible_user_id' => $organizer->id,
                ],
            );

            // 4. Ruangan
            $room = EventRoom::updateOrCreate(
                ['event_id' => $event->id, 'name' => 'Dojo Utama Pusdiklat'],
                []
            );

            // 5. Materi Modul Event
            $publishedMaterial = Material::where('status', 'published')->first();

            // Minimal valid PDF binary string
            $dummyPdfContent = "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF\n";
            $pdfPath = "events/{$event->id}/petunjuk-teknis-malam.pdf";
            Storage::disk('local')->put($pdfPath, $dummyPdfContent);

            $module1 = EventModule::updateOrCreate(
                ['event_id' => $event->id, 'code' => 'MODUL-MLM-01'],
                [
                    'title' => 'Diktat Kurikulum & Standarisasi Teknik Malam Ini',
                    'description' => 'Materi pokok kurikulum pelatihan teknik Shorinji Kempo sesi malam ini.',
                    'jp' => 2,
                    'track_codes' => ['PD', 'PN', 'WAD', 'PWAN'],
                    'speaker_id' => $speaker->id,
                    'material_id' => $publishedMaterial?->id,
                    'fulfillment_method' => 'Menghadiri sesi dan membaca modul.',
                    'is_published' => true,
                    'learning_indicators' => 'Peserta memahami standarisasi teknik dan silabus resmi.',
                    'publication_status' => 'published',
                    'source_type' => $publishedMaterial ? 'collection' : 'event',
                ],
            );

            $module2 = EventModule::updateOrCreate(
                ['event_id' => $event->id, 'code' => 'PANDUAN-MLM-02'],
                [
                    'title' => 'Petunjuk Teknis & Tata Tertib Sesi Malam',
                    'description' => 'Panduan operasional kehadiran dan tata tertib sesi malam ini.',
                    'jp' => 1,
                    'track_codes' => ['PD', 'PN', 'WAD', 'PWAN'],
                    'is_published' => true,
                    'learning_indicators' => 'Peserta mematuhi tata tertib dan prosedur presensi.',
                    'publication_status' => 'published',
                    'source_type' => 'uploaded_pdf',
                    'source_file_path' => $pdfPath,
                ],
            );

            // 6. Sesi Kegiatan & Absensi Malam Ini
            $session1 = EventSession::updateOrCreate(
                ['event_id' => $event->id, 'session_number' => 1],
                [
                    'day_number' => 1,
                    'date' => $today,
                    'start_time' => '19:00:00',
                    'end_time' => '20:00:00',
                    'duration_jp' => 1,
                    'session_type_code' => 'KEHADIRAN_AWAL',
                    'topic' => 'Presensi Kedatangan & Registrasi Sesi Malam',
                    'subtopic' => 'Verifikasi kehadiran awal seluruh kenshi peserta malam ini',
                    'method' => 'Presensi Mandiri / Scan QR',
                    'room' => $room->name,
                    'event_room_id' => $room->id,
                    'track_codes' => ['PD', 'PN', 'WAD', 'PWAN'],
                    'status' => 'ongoing',
                    'attendance_setting' => 'check_in',
                    'is_attendance_open' => true,
                    'attendance_open_at' => now()->subHours(2),
                    'attendance_close_at' => now()->addHours(6),
                    'qr_token' => 'QR-MALAM-AWAL-2026',
                    'qr_short_code' => 'MALAM01',
                ],
            );

            $session2 = EventSession::updateOrCreate(
                ['event_id' => $event->id, 'session_number' => 2],
                [
                    'day_number' => 1,
                    'date' => $today,
                    'start_time' => '20:00:00',
                    'end_time' => '21:30:00',
                    'duration_jp' => 2,
                    'session_type_code' => 'PLENO',
                    'topic' => 'Pendalaman Materi & Standarisasi Kurikulum PERKEMI',
                    'subtopic' => 'Teknik Goho, Juho, dan Etika Tradisi Shorinji Kempo',
                    'method' => 'Pemaparan & Demonstrasi Teknik',
                    'speaker_id' => $speaker->id,
                    'event_module_id' => $module1->id,
                    'material_id' => $publishedMaterial?->id,
                    'room' => $room->name,
                    'event_room_id' => $room->id,
                    'track_codes' => ['PD', 'PN', 'WAD', 'PWAN'],
                    'status' => 'ongoing',
                    'attendance_setting' => 'check_in',
                    'is_attendance_open' => true,
                    'attendance_open_at' => now()->subHours(2),
                    'attendance_close_at' => now()->addHours(6),
                    'qr_token' => 'QR-MALAM-MATERI-2026',
                    'qr_short_code' => 'MALAM02',
                ],
            );

            $session3 = EventSession::updateOrCreate(
                ['event_id' => $event->id, 'session_number' => 3],
                [
                    'day_number' => 1,
                    'date' => $today,
                    'start_time' => '21:30:00',
                    'end_time' => '22:30:00',
                    'duration_jp' => 1,
                    'session_type_code' => 'REFLEKSI',
                    'topic' => 'Refleksi Teknik & Presensi Penutup Malam',
                    'subtopic' => 'Tanya jawab dan konfirmasi kehadiran akhir sesi',
                    'method' => 'Diskusi & Evaluasi',
                    'room' => $room->name,
                    'event_room_id' => $room->id,
                    'track_codes' => ['PD', 'PN', 'WAD', 'PWAN'],
                    'status' => 'scheduled',
                    'attendance_setting' => 'check_in',
                    'is_attendance_open' => true,
                    'attendance_open_at' => now()->subHours(2),
                    'attendance_close_at' => now()->addHours(6),
                    'qr_token' => 'QR-MALAM-PENUTUP-2026',
                    'qr_short_code' => 'MALAM03',
                ],
            );

            // 7. Peserta 1: Belum Absen (Siap Coba Scan QR / Masukkan Kode)
            $userTester1 = User::updateOrCreate(
                ['email' => 'tester.malam@perkemi.id'],
                [
                    'name' => 'Kenshi Tester Malam',
                    'role' => 'Peserta',
                    'password' => Hash::make('password'),
                ],
            );

            $participantTester1 = Participant::updateOrCreate(
                ['email' => 'tester.malam@perkemi.id'],
                [
                    'user_id' => $userTester1->id,
                    'name' => 'Kenshi Tester Malam',
                    'kenshi_id_number' => 'TEST-MALAM-01',
                    'phone' => '081234567801',
                    'origin_province' => 'DKI Jakarta',
                    'origin_city' => 'Jakarta Selatan',
                    'origin_dojo' => 'Dojo Senayan',
                    'dan_rank' => 'II-DAN',
                    'notes' => 'Akun simulasi untuk pengecekan absensi.',
                ],
            );

            EventParticipant::updateOrCreate(
                [
                    'event_id' => $event->id,
                    'participant_id' => $participantTester1->id,
                ],
                [
                    'track_code' => 'PD',
                    'admin_status' => 'verified',
                    'has_seen_welcome' => true,
                    'checked_in_at' => null,
                    'checkin_status' => 'registered',
                ],
            );

            // 8. Peserta 2: Sudah Hadir Awal (Siap Akses Ruang Belajar Langsung)
            $userTester2 = User::updateOrCreate(
                ['email' => 'hadir.malam@perkemi.id'],
                [
                    'name' => 'Kenshi Pratama (Sudah Hadir Awal)',
                    'role' => 'Peserta',
                    'password' => Hash::make('password'),
                ],
            );

            $participantTester2 = Participant::updateOrCreate(
                ['email' => 'hadir.malam@perkemi.id'],
                [
                    'user_id' => $userTester2->id,
                    'name' => 'Kenshi Pratama (Sudah Hadir Awal)',
                    'kenshi_id_number' => 'TEST-MALAM-02',
                    'phone' => '081234567802',
                    'origin_province' => 'Jawa Barat',
                    'origin_city' => 'Bandung',
                    'origin_dojo' => 'Dojo Dago',
                    'dan_rank' => 'III-DAN',
                    'notes' => 'Akun simulasi pengecekan materi (status: sudah hadir check-in awal).',
                ],
            );

            $enrollmentTester2 = EventParticipant::updateOrCreate(
                [
                    'event_id' => $event->id,
                    'participant_id' => $participantTester2->id,
                ],
                [
                    'track_code' => 'PN',
                    'admin_status' => 'verified',
                    'has_seen_welcome' => true,
                    'checked_in_at' => now(),
                    'checkin_method' => 'qr_scan',
                    'checkin_status' => 'checked_in',
                ],
            );

            // Catat kehadiran awal untuk Peserta 2 pada Sesi 1
            EventAttendance::updateOrCreate(
                [
                    'event_id' => $event->id,
                    'event_session_id' => $session1->id,
                    'participant_id' => $participantTester2->id,
                ],
                [
                    'attendance_type' => 'check_in',
                    'status' => 'present',
                    'checked_in_at' => now()->subMinutes(30),
                    'method' => 'qr_scan',
                    'recorded_by' => $organizer->id,
                    'notes' => 'Presensi kedatangan awal otomatis oleh sistem seeder.',
                ],
            );
        });
    }
}
