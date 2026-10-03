<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('event_mandates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('letter_number', 100);
            $table->string('title')->default('Surat Mandat');
            $table->text('event_name')->nullable();
            $table->json('source_references')->nullable();
            $table->string('issued_place', 100)->nullable();
            $table->date('issued_at')->nullable();
            $table->date('valid_from')->nullable();
            $table->date('valid_until')->nullable();
            $table->string('venue')->nullable();
            $table->text('address')->nullable();
            $table->string('province', 100)->nullable();
            $table->text('exam_scope')->nullable();
            $table->unsignedSmallInteger('participant_total')->nullable();
            $table->json('examiners')->nullable();
            $table->json('provisions')->nullable();
            $table->json('participant_summary')->nullable();
            $table->json('home_assignments')->nullable();
            $table->string('signatory_name')->nullable();
            $table->string('signatory_title')->nullable();
            $table->string('document_disk', 30)->default('local');
            $table->string('document_path')->nullable();
            $table->string('document_original_name')->nullable();
            $table->string('document_mime', 100)->nullable();
            $table->unsignedBigInteger('document_size')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        $eventId = DB::table('events')
            ->where('slug', 'gashuku-dan-ujian-kenaikan-tingkat-kota-surabaya-ke-3-tahun-2026')
            ->value('id');

        if ($eventId !== null) {
            $now = now();
            $mandateDocument = 'pdf/109 MANDAT JATIM - KOTA SURABAYA, 03-04 OKT 2026.pdf';
            $mandateDocumentPath = public_path($mandateDocument);

            DB::table('event_mandates')->updateOrInsert(
                ['event_id' => $eventId],
                [
                    'letter_number' => '109/MDT-PB/X/2026',
                    'title' => 'Surat Mandat Penguji Pemantapan Teknik & UKT',
                    'event_name' => 'Pemantapan Teknik dan Ujian Kenaikan Tingkat Kota Surabaya Ke-3 Tahun 2026',
                    'source_references' => json_encode([
                        'Surat PERKEMI Pengurus Provinsi Jawa Timur No. 049/JATIM-KU/IX/2026 tanggal 22 September 2026',
                        'Rekomendasi Komisi Diktar PB PERKEMI No. 125/Diktar.PB/IX/2026 tanggal 23 September 2026',
                    ], JSON_THROW_ON_ERROR),
                    'issued_place' => 'Jakarta',
                    'issued_at' => '2026-10-02',
                    'valid_from' => '2026-10-03',
                    'valid_until' => '2026-10-04',
                    'venue' => 'Lapangan Futsal UBAYA Sport Center',
                    'address' => 'Jl. Kaliwaru I No. 31, Kali Rungkut, Surabaya',
                    'province' => 'Jawa Timur',
                    'exam_scope' => 'Ujian Kenaikan Tingkat menuju KYU VIII sampai dengan KYU II.',
                    'participant_total' => 65,
                    'examiners' => json_encode([
                        ['name' => 'Y. Bernard Laisina', 'rank' => 'DAN V'],
                        ['name' => 'Dr. Ihyan Amri, Sp.B.', 'rank' => 'DAN IV'],
                        ['name' => 'Maulana Sarip Bathik', 'rank' => 'DAN IV'],
                        ['name' => 'Arya Setyanto Wicaksono, S.Si, M.Pd.', 'rank' => 'DAN IV'],
                    ], JSON_THROW_ON_ERROR),
                    'provisions' => json_encode([
                        'Memenuhi setiap ketentuan administrasi dan teknis ujian yang berlaku.',
                        'Setiap kenshi wajib lunas iuran sampai dengan Oktober 2026 untuk mengikuti kegiatan PERKEMI.',
                        'Peserta hanya yang tercantum dan telah divalidasi PB PERKEMI; dilarang menambahkan peserta yang belum terdaftar dan divalidasi pengurus.',
                        'Hasil ujian wajib dilaporkan melalui F-28, Examination Report WSKO, dan foto kegiatan bertimestamp paling lambat 7 hari kalender setelah pelaksanaan.',
                        'Surat mandat hanya berlaku pada tanggal dan tempat yang tercantum.',
                        'Mandat dilaksanakan dengan penuh rasa tanggung jawab.',
                    ], JSON_THROW_ON_ERROR),
                    'participant_summary' => json_encode([
                        ['level' => 'KYU 8', 'count' => 3],
                        ['level' => 'KYU 7', 'count' => 2],
                        ['level' => 'KYU 6', 'count' => 13],
                        ['level' => 'KYU 5', 'count' => 8],
                        ['level' => 'KYU 4', 'count' => 10],
                        ['level' => 'KYU 3', 'count' => 16],
                        ['level' => 'KYU 2', 'count' => 9],
                        ['level' => 'KYU 1', 'count' => 4],
                    ], JSON_THROW_ON_ERROR),
                    'home_assignments' => json_encode($this->surabayaHomeAssignments(), JSON_THROW_ON_ERROR),
                    'signatory_name' => 'Laksdya TNI (Purn) Prof. Dr. Agus Setiadji, S.A.P, M.A',
                    'signatory_title' => 'Pengurus Besar PERKEMI',
                    'document_disk' => file_exists($mandateDocumentPath) ? 'public_path' : 'local',
                    'document_path' => file_exists($mandateDocumentPath) ? $mandateDocument : null,
                    'document_original_name' => file_exists($mandateDocumentPath) ? basename($mandateDocumentPath) : null,
                    'document_mime' => file_exists($mandateDocumentPath) ? 'application/pdf' : null,
                    'document_size' => file_exists($mandateDocumentPath) ? filesize($mandateDocumentPath) : null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
            );

            $examiners = [
                ['name' => 'Y. Bernard Laisina', 'title_degree' => null, 'dan_rank' => 'V-DAN'],
                ['name' => 'Dr. Ihyan Amri', 'title_degree' => 'Sp.B.', 'dan_rank' => 'IV-DAN'],
                ['name' => 'Maulana Sarip Bathik', 'title_degree' => null, 'dan_rank' => 'IV-DAN'],
                ['name' => 'Arya Setyanto Wicaksono', 'title_degree' => 'S.Si, M.Pd.', 'dan_rank' => 'IV-DAN'],
            ];

            foreach ($examiners as $examiner) {
                $existingExaminerId = DB::table('speakers')->where('name', $examiner['name'])->value('id');
                $attributes = [
                    ...$examiner,
                    'event_id' => $eventId,
                    'position' => 'Penguji Mandat PB PERKEMI',
                    'organization' => 'PB PERKEMI',
                    'bio' => 'Penguji resmi berdasarkan Surat Mandat PB PERKEMI No. 109/MDT-PB/X/2026.',
                    'updated_at' => $now,
                ];

                if ($existingExaminerId) {
                    DB::table('speakers')->where('id', $existingExaminerId)->update($attributes);
                } else {
                    DB::table('speakers')->insert([
                        ...$attributes,
                        'created_at' => $now,
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_mandates');
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
};
