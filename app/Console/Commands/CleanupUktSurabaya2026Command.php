<?php

namespace App\Console\Commands;

use App\Models\CbtExamPackage;
use App\Models\CbtQuestion;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\EventRegistrationForm;
use App\Models\EventRoom;
use App\Models\EventSession;
use App\Models\Participant;
use App\Models\ParticipantTrack;
use App\Models\QuestionBank;
use App\Models\QuestionModule;
use App\Models\Speaker;
use App\Models\User;
use Database\Seeders\Surabaya2026UktSeeder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Throwable;

class CleanupUktSurabaya2026Command extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'diktar:cleanup-surabaya-2026 {--force : Eksekusi penghapusan tanpa konfirmasi prompt}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Menghapus bersih seluruh data Event UKT Surabaya 2026 dan semua detailnya (Bank Soal, Modul, Paket CBT, Peserta, Rundown, dsb)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('================================================================');
        $this->info('  CLEANUP TOOL: Gashuku & UKT Kota Surabaya Ke-3 Tahun 2026    ');
        $this->info('================================================================');

        $slug = Surabaya2026UktSeeder::EVENT_SLUG;
        $event = Event::withTrashed()->where('slug', $slug)->first();

        if (! $event) {
            $this->warn("Event dengan slug [{$slug}] tidak ditemukan di database.");

            // Cek apakah ada data orphan yang masih tertinggal
            $orphanPackages = CbtExamPackage::withTrashed()->where('code', 'like', 'CBT-UKT-KYU%-26')->count();
            $orphanModules = QuestionModule::withTrashed()->where('code', 'like', 'MOD-UKT-KYU%')->count();
            $orphanQuestions = QuestionBank::withTrashed()->where('code', 'like', 'QB-UKT-K%')->count();

            if ($orphanPackages === 0 && $orphanModules === 0 && $orphanQuestions === 0) {
                $this->info('Tidak ditemukan data sisa terkait Surabaya UKT 2026. Database sudah bersih.');

                return self::SUCCESS;
            }

            $this->warn("Ditemukan data sisa orphan: {$orphanPackages} Paket CBT, {$orphanModules} Modul Soal, {$orphanQuestions} Bank Soal.");
        }

        $eventId = $event?->id;

        // Hitung rekapan data yang akan dihapus
        $packagesCount = CbtExamPackage::withTrashed()
            ->when($eventId, fn ($q) => $q->where('event_id', $eventId))
            ->orWhere('code', 'like', 'CBT-UKT-KYU%-26')
            ->count();

        $modulesCount = QuestionModule::withTrashed()
            ->when($eventId, fn ($q) => $q->where('event_id', $eventId))
            ->orWhere('code', 'like', 'MOD-UKT-KYU%')
            ->count();

        $questionsCount = QuestionBank::withTrashed()
            ->when($eventId, fn ($q) => $q->where('event_id', $eventId))
            ->orWhere('code', 'like', 'QB-UKT-K%')
            ->count();

        $participantsCount = $eventId ? Participant::withTrashed()->where('event_id', $eventId)->count() : 0;
        $epCount = $eventId ? EventParticipant::where('event_id', $eventId)->count() : 0;
        $formsCount = $eventId ? EventRegistrationForm::where('event_id', $eventId)->count() : 0;
        $sessionsCount = $eventId ? EventSession::where('event_id', $eventId)->count() : 0;
        $roomsCount = $eventId ? EventRoom::where('event_id', $eventId)->count() : 0;
        $speakersCount = $eventId ? Speaker::withTrashed()->where('event_id', $eventId)->count() : 0;
        $tracksCount = $eventId ? ParticipantTrack::where('event_id', $eventId)->count() : 0;

        $userIds = $eventId
            ? Participant::withTrashed()->where('event_id', $eventId)->pluck('user_id')->filter()->unique()
            : collect();
        $usersCount = $userIds->isNotEmpty()
            ? User::whereIn('id', $userIds)->where('role', 'Peserta')->count()
            : 0;

        $this->table(
            ['Komponen Data', 'Jumlah Record'],
            [
                ['Event Utama', $event ? "1 (ID: {$event->id})" : '0'],
                ['Master Peserta (Participant)', (string) $participantsCount],
                ['Pendaftaran Event (EventParticipant)', (string) $epCount],
                ['Formulir Registrasi Kenshi (RegistrationForm)', (string) $formsCount],
                ['Akun User Peserta (Role: Peserta)', (string) $usersCount],
                ['Paket Ujian CBT (CbtExamPackage)', (string) $packagesCount],
                ['Modul Bank Soal (QuestionModule)', (string) $modulesCount],
                ['Butir Soal Bank Soal (QuestionBank)', (string) $questionsCount],
                ['Sesi Rundown Acara (EventSession)', (string) $sessionsCount],
                ['Ruangan Acara (EventRoom)', (string) $roomsCount],
                ['Pembicara / Penguji (Speaker)', (string) $speakersCount],
                ['Jalur Tingkatan Kyu (ParticipantTrack)', (string) $tracksCount],
            ]
        );

        if (! $this->option('force') && ! $this->confirm('Apakah Anda yakin ingin MENGHAPUS BERSIH seluruh data di atas secara PERMANEN?', true)) {
            $this->warn('Pembersihan dibatalkan oleh pengguna.');

            return self::SUCCESS;
        }

        $this->info('Memulai proses pembersihan total...');

        try {
            DB::transaction(function () use ($event, $eventId, $userIds) {
                // 1. Hapus Pendaftaran Peserta & Formulir
                if ($eventId) {
                    $deletedForms = EventRegistrationForm::where('event_id', $eventId)->delete();
                    $deletedEps = EventParticipant::where('event_id', $eventId)->delete();
                    $this->line("- Terhapus {$deletedForms} formulir dan {$deletedEps} relasi peserta event.");
                }

                // 2. Hapus Master Peserta & Akun User khusus peserta UKT
                if ($eventId) {
                    $deletedParticipants = Participant::withTrashed()->where('event_id', $eventId)->forceDelete();
                    $deletedUsers = 0;
                    if ($userIds->isNotEmpty()) {
                        $deletedUsers = User::whereIn('id', $userIds)->where('role', 'Peserta')->delete();
                    }
                    $this->line("- Terhapus {$deletedParticipants} master peserta dan {$deletedUsers} akun user peserta.");
                }

                // 3. Hapus Paket CBT & Relasi Soal CBT
                $packages = CbtExamPackage::withTrashed()
                    ->when($eventId, fn ($q) => $q->where('event_id', $eventId))
                    ->orWhere('code', 'like', 'CBT-UKT-KYU%-26')
                    ->get();

                $pkgIds = $packages->pluck('id');
                if ($pkgIds->isNotEmpty()) {
                    $delCbtQuestions = CbtQuestion::whereIn('cbt_exam_package_id', $pkgIds)->delete();
                    DB::table('cbt_package_questions')->whereIn('cbt_exam_package_id', $pkgIds)->delete();
                    DB::table('event_cbt_packages')->whereIn('cbt_exam_package_id', $pkgIds)->delete();
                    foreach ($packages as $pkg) {
                        $pkg->forceDelete();
                    }
                    $this->line("- Terhapus {$packages->count()} paket CBT dan {$delCbtQuestions} butir soal CBT.");
                }
                if ($eventId) {
                    DB::table('event_cbt_packages')->where('event_id', $eventId)->delete();
                }

                // 4. Hapus Bank Soal & Modul Soal
                $questions = QuestionBank::withTrashed()
                    ->when($eventId, fn ($q) => $q->where('event_id', $eventId))
                    ->orWhere('code', 'like', 'QB-UKT-K%')
                    ->get();

                $qIds = $questions->pluck('id');
                if ($qIds->isNotEmpty()) {
                    DB::table('question_module_questions')->whereIn('question_id', $qIds)->delete();
                    DB::table('cbt_package_questions')->whereIn('question_id', $qIds)->delete();
                    foreach ($questions as $q) {
                        $q->forceDelete();
                    }
                    $this->line("- Terhapus {$questions->count()} butir bank soal.");
                }

                $modules = QuestionModule::withTrashed()
                    ->when($eventId, fn ($q) => $q->where('event_id', $eventId))
                    ->orWhere('code', 'like', 'MOD-UKT-KYU%')
                    ->get();

                $mIds = $modules->pluck('id');
                if ($mIds->isNotEmpty()) {
                    DB::table('question_module_questions')->whereIn('question_module_id', $mIds)->delete();
                    foreach ($modules as $m) {
                        $m->forceDelete();
                    }
                    $this->line("- Terhapus {$modules->count()} modul bank soal.");
                }

                // 5. Hapus Sesi Rundown, Ruangan, Pembicara, dan Jalur Tingkatan
                if ($eventId) {
                    $delSessions = EventSession::where('event_id', $eventId)->delete();
                    $delRooms = EventRoom::where('event_id', $eventId)->delete();
                    $delSpeakers = Speaker::withTrashed()->where('event_id', $eventId)->forceDelete();
                    $delTracks = ParticipantTrack::where('event_id', $eventId)->delete();
                    $this->line("- Terhapus {$delSessions} sesi, {$delRooms} ruangan, {$delSpeakers} pembicara/penguji, dan {$delTracks} track kyu.");
                }

                // 6. Hapus Event Utama
                if ($event) {
                    $event->forceDelete();
                    $this->line("- Event utama ID {$event->id} ({$event->name}) berhasil dihapus permanen.");
                }
            });

            $this->info('================================================================');
            $this->info('  SUKSES: Seluruh data Event UKT Surabaya 2026 berhasil dihapus!');
            $this->info('================================================================');

            return self::SUCCESS;
        } catch (Throwable $e) {
            $this->error('Gagal menghapus data: '.$e->getMessage());
            $this->error($e->getTraceAsString());

            return self::FAILURE;
        }
    }
}
