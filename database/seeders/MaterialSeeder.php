<?php

namespace Database\Seeders;

use App\Models\Audience;
use App\Models\Category;
use App\Models\Material;
use App\Models\MaterialFile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class MaterialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('role', 'Admin')->first() ?? User::first();
        $adminId = $admin ? $admin->id : 1;

        $categories = Category::all()->keyBy('slug');
        $audiences = Audience::all()->keyBy('code');

        $materialsData = [
            [
                'title' => 'Modul Wasit Tingkat Nasional',
                'slug' => 'modul-wasit-tingkat-nasional',
                'code' => 'MWTN-2026',
                'isbn' => '978-602-1234-01-1',
                'author' => 'Komisi Perwasitan PB PERKEMI',
                'keywords' => 'wasit, penataran nasional, peraturan, shorinji kempo',
                'admin_notes' => 'Edisi revisi penataran nasional 2026. Standar resmi.',
                'summary' => 'Panduan resmi manajemen pertandingan, interpretasi peraturan, dan pengambilan keputusan untuk wasit tingkat nasional.',
                'description' => "Modul ini disusun sebagai panduan resmi dalam penataran wasit tingkat nasional.\n\nMateri mencakup pemahaman peraturan terbaru, studi kasus, dan implementasi dalam pertandingan.\n\nSetiap bagian menghubungkan prinsip dengan situasi lapangan agar peserta dapat mengambil keputusan secara konsisten, tegas, dan terukur.",
                'cover_path' => '/images/cover-1.jpg',
                'type' => 'module',
                'status' => 'published',
                'publication_year' => 2026,
                'page_count' => 165,
                'duration_seconds' => null,
                'is_downloadable' => true,
                'is_featured' => true,
                'published_at' => now()->subDays(10),
                'primary_category' => 'perwasitan',
                'audiences' => ['participant', 'examiner', 'referee'],
            ],
            [
                'title' => 'Dasar-Dasar Perwasitan',
                'slug' => 'dasar-dasar-perwasitan',
                'code' => 'DDP-2025',
                'isbn' => '978-602-1234-02-8',
                'author' => 'Sensei Subroto & Tim PB PERKEMI',
                'keywords' => 'perwasitan dasar, fukushin, shushin, isyarat',
                'admin_notes' => 'Materi fondasi perwasitan untuk pemula dan wasit daerah.',
                'summary' => 'Pegangan awal untuk memahami posisi, sinyal isyarat, dan etika seorang wasit di arena pertarungan.',
                'description' => 'Referensi ringkas untuk peserta yang sedang membangun fondasi perwasitan, etika tatap muka, dan sinyal bendera wasit.',
                'cover_path' => '/images/cover-2.jpg',
                'type' => 'book',
                'status' => 'published',
                'publication_year' => 2025,
                'page_count' => 112,
                'duration_seconds' => null,
                'is_downloadable' => true,
                'is_featured' => false,
                'published_at' => now()->subDays(25),
                'primary_category' => 'perwasitan',
                'audiences' => ['participant', 'referee'],
            ],
            [
                'title' => 'Teknik Kepelatihan Modern',
                'slug' => 'teknik-kepelatihan-modern',
                'code' => 'TKM-2026',
                'isbn' => '978-602-1234-03-5',
                'author' => 'Dewan Guru PB PERKEMI',
                'keywords' => 'kepelatihan, metodologi, periodisasi, fisik',
                'admin_notes' => 'Kurikulum unggulan penataran pelatih tahun 2026.',
                'summary' => 'Rancangan latihan adaptif yang menghubungkan observasi, umpan balik, dan evaluasi performa kenshi.',
                'description' => 'Bahan ajar metodologi kepelatihan berbasis kebutuhan atlet dan evaluasi berkala untuk meningkatkan capaian prestasi dojo.',
                'cover_path' => '/images/cover-3.jpg',
                'type' => 'speaker_material',
                'status' => 'published',
                'publication_year' => 2026,
                'page_count' => 80,
                'duration_seconds' => null,
                'is_downloadable' => true,
                'is_featured' => true,
                'published_at' => now()->subDays(5),
                'primary_category' => 'materi-kepelatihan',
                'audiences' => ['participant', 'coach', 'speaker'],
            ],
            [
                'title' => 'Peraturan Pertandingan Terbaru',
                'slug' => 'peraturan-pertandingan-terbaru',
                'code' => 'PPT-2026',
                'isbn' => '978-602-1234-04-2',
                'author' => 'Komisi Teknik & Perwasitan PB PERKEMI',
                'keywords' => 'peraturan pertandingan, randori, embu, regulasi',
                'admin_notes' => 'Diadopsi dari WSKO Rulebook edisi mutakhir.',
                'summary' => 'Rangkuman perubahan aturan dan interpretasi resmi untuk musim kompetisi Shorinji Kempo 2026.',
                'description' => 'Dokumen acuan untuk penyelenggara, penguji, dan seluruh perangkat pertandingan kejuaraan nasional maupun daerah.',
                'cover_path' => '/images/cover-1.jpg',
                'type' => 'guideline',
                'status' => 'published',
                'publication_year' => 2026,
                'page_count' => 74,
                'duration_seconds' => null,
                'is_downloadable' => true,
                'is_featured' => true,
                'published_at' => now()->subDays(8),
                'primary_category' => 'pedoman-regulasi',
                'audiences' => ['organizer', 'examiner', 'referee'],
            ],
            [
                'title' => 'Manajemen Penyelenggaraan Penataran',
                'slug' => 'manajemen-penyelenggaraan-penataran',
                'code' => 'MPP-2025',
                'isbn' => '978-602-1234-05-9',
                'author' => 'Bidang Organisasi & Penataran PB PERKEMI',
                'keywords' => 'manajemen, panitia, administrasi, penataran',
                'admin_notes' => 'Pedoman standar operasional panitia pelaksana.',
                'summary' => 'Alur perencanaan, administrasi, pelaksanaan, dan pelaporan kegiatan penataran resmi PERKEMI.',
                'description' => 'Modul operasional untuk memastikan setiap kegiatan berjalan tertib, aman, terstandar, dan terdokumentasi akurat.',
                'cover_path' => '/images/cover-2.jpg',
                'type' => 'module',
                'status' => 'published',
                'publication_year' => 2025,
                'page_count' => 96,
                'duration_seconds' => null,
                'is_downloadable' => true,
                'is_featured' => false,
                'published_at' => now()->subDays(30),
                'primary_category' => 'modul-penataran',
                'audiences' => ['organizer', 'speaker'],
            ],
            [
                'title' => 'Bahan Ajar Metodologi Latihan',
                'slug' => 'bahan-ajar-metodologi-latihan',
                'code' => 'BAML-2025',
                'isbn' => '978-602-1234-06-6',
                'author' => 'Tim Pemateri Penataran PB PERKEMI',
                'keywords' => 'bahan ajar, kurikulum, latihan fisik, kenshi',
                'admin_notes' => 'Digunakan pada sesi kelas penataran pelatih madya.',
                'summary' => 'Bahan tayang dan penjelasan metodologi latihan teknik dasar goho dan juho terstruktur.',
                'description' => 'Bahan ajar bagi pemateri dan pelatih untuk merancang pengalaman belajar kenshi yang efektif dan bertahap.',
                'cover_path' => '/images/cover-3.jpg',
                'type' => 'speaker_material',
                'status' => 'published',
                'publication_year' => 2025,
                'page_count' => 68,
                'duration_seconds' => null,
                'is_downloadable' => true,
                'is_featured' => false,
                'published_at' => now()->subDays(15),
                'primary_category' => 'materi-kepelatihan',
                'audiences' => ['participant', 'coach', 'speaker'],
            ],
            [
                'title' => 'Kode Etik Wasit',
                'slug' => 'kode-etik-wasit',
                'code' => 'KEW-2024',
                'isbn' => '978-602-1234-07-3',
                'author' => 'Dewan Kehormatan PB PERKEMI',
                'keywords' => 'kode etik, wasit, integritas, netralitas',
                'admin_notes' => 'Wajib dipahami sebelum penugasan wasit di kejuaraan resmi.',
                'summary' => 'Prinsip integritas, independensi, komunikasi, dan tanggung jawab etis profesi wasit.',
                'description' => 'Kode etik menjadi landasan perilaku dalam dan di luar arena pertandingan guna menjaga martabat persaudaraan.',
                'cover_path' => '/images/cover-1.jpg',
                'type' => 'book',
                'status' => 'published',
                'publication_year' => 2024,
                'page_count' => 52,
                'duration_seconds' => null,
                'is_downloadable' => true,
                'is_featured' => false,
                'published_at' => now()->subDays(40),
                'primary_category' => 'perwasitan',
                'audiences' => ['participant', 'examiner', 'referee'],
            ],
            [
                'title' => 'Evaluasi dan Ujian Kompetensi',
                'slug' => 'evaluasi-dan-ujian-kompetensi',
                'code' => 'EUK-2024',
                'isbn' => '978-602-1234-08-0',
                'author' => 'Komisi Ujian Kenaikan Tingkat PB PERKEMI',
                'keywords' => 'ujian kenaikan tingkat, evaluasi, kyu kenshi, yudansha',
                'admin_notes' => 'Rubrik penilaian standar nasional ujian kenshi.',
                'summary' => 'Pedoman pelaksanaan evaluasi pengetahuan dan keterampilan kenshi pada ujian kenaikan tingkat.',
                'description' => 'Dokumen bagi penguji untuk menjaga proses penilaian yang objektif, transparan, dan konsisten.',
                'cover_path' => '/images/cover-2.jpg',
                'type' => 'document',
                'status' => 'published',
                'publication_year' => 2024,
                'page_count' => 48,
                'duration_seconds' => null,
                'is_downloadable' => false,
                'is_featured' => false,
                'published_at' => now()->subDays(20),
                'primary_category' => 'materi-pengujian',
                'audiences' => ['participant', 'examiner'],
            ],
            [
                'title' => 'Teknik Dasar Kepelatihan',
                'slug' => 'teknik-dasar-kepelatihan',
                'code' => 'TDK-2026',
                'isbn' => null,
                'author' => 'Pusat Dokumentasi Video PB PERKEMI',
                'keywords' => 'video pembelajaran, pemanasan, chinkon, drill',
                'admin_notes' => 'Rekaman video peraga penataran pelatih tingkat satu.',
                'summary' => 'Demonstrasi penataan sesi latihan dojo dari pemanasan, chinkon-gyo, hingga evaluasi akhir.',
                'description' => 'Video pembelajaran untuk memperjelas urutan kerja, postur kihon, dan komunikasi pelatih.',
                'cover_path' => '/images/cover-3.jpg',
                'type' => 'video',
                'status' => 'published',
                'publication_year' => 2026,
                'page_count' => 36,
                'duration_seconds' => 3600,
                'is_downloadable' => false,
                'is_featured' => false,
                'published_at' => now()->subDays(12),
                'primary_category' => 'video-pembelajaran',
                'audiences' => ['coach', 'participant'],
            ],
            [
                'title' => 'Kurikulum Standar Penataran Pelatih Daerah',
                'slug' => 'kurikulum-standar-penataran-pelatih-daerah',
                'code' => 'KSPPD-2026',
                'isbn' => '978-602-1234-10-3',
                'author' => 'Komisi Kepelatihan PB PERKEMI',
                'keywords' => 'silabus, pelatih daerah, kurikulum, standarisasi',
                'admin_notes' => 'Silabus baku penataran tingkat pengprov / pengcab.',
                'summary' => 'Silabus dan pedoman kurikulum berjenjang bagi penyelenggaraan penataran pelatih tingkat daerah.',
                'description' => 'Menyelaraskan standar kurikulum teknik fisik, mental doktrin, dan pedagogi di seluruh pengurus provinsi se-Indonesia.',
                'cover_path' => '/images/cover-1.jpg',
                'type' => 'module',
                'status' => 'published',
                'publication_year' => 2026,
                'page_count' => 128,
                'duration_seconds' => null,
                'is_downloadable' => true,
                'is_featured' => true,
                'published_at' => now()->subDays(3),
                'primary_category' => 'modul-penataran',
                'audiences' => ['coach', 'organizer', 'speaker'],
                'metadata' => [
                    'key_points' => [
                        'Standar kurikulum sebagai dasar pelaksanaan penataran pelatih daerah.',
                        'Kompetensi yang perlu dicapai oleh peserta penataran.',
                        'Susunan materi, metode pembelajaran, dan evaluasi.',
                        'Peran pelatih dalam menjaga mutu pembinaan.',
                        'Pedoman penerapan kurikulum dalam kegiatan penataran daerah.',
                    ],
                    'learning_objectives' => [
                        'Memahami filosofi, silabus baku, dan standarisasi kepelatihan PERKEMI.',
                        'Mampu menyusun program periodisasi latihan fisik dan teknik kenshi daerah.',
                        'Menjaga konsistensi pembinaan etika budo dan keselamatan latihan.',
                    ],
                    'table_of_contents' => [
                        ['title' => 'Bab I: Pendahuluan & Filosofi Pendidikan Pelatih', 'page' => 1],
                        ['title' => 'Bab II: Standar Kompetensi Pelatih PERKEMI', 'page' => 3],
                        ['title' => 'Bab III: Metodologi Pengajaran Kihon & Waza', 'page' => 5],
                        ['title' => 'Bab IV: Pembinaan Fisik, Mental, dan Budo', 'page' => 8],
                        ['title' => 'Bab V: Manajemen Evaluasi & Ujian Tingkat', 'page' => 10],
                        ['title' => 'Lampiran: Form Rencana Latihan & Penilaian', 'page' => 12],
                    ],
                ],
            ],
            [
                'title' => 'Rubrik Penilaian Embu Beregu & Pasangan',
                'slug' => 'rubrik-penilaian-embu-beregu-dan-pasangan',
                'code' => 'RP-EBP-2026',
                'isbn' => '978-602-1234-11-0',
                'author' => 'Dewan Wasit PB PERKEMI',
                'keywords' => 'rubrik, embu, pasangan, beregu, skor',
                'admin_notes' => 'Lembar penilaian digital dan cetak untuk meja juri.',
                'summary' => 'Tabel parameter penilaian kousei, gihou, dan choushi untuk perlombaan Embu resmi.',
                'description' => 'Menjadi pegangan juri wasit dalam menentukan poin kebenaran teknik, kecepatan, kekompakan, dan penjiwaan budo.',
                'cover_path' => '/images/cover-2.jpg',
                'type' => 'document',
                'status' => 'published',
                'publication_year' => 2026,
                'page_count' => 32,
                'duration_seconds' => null,
                'is_downloadable' => true,
                'is_featured' => false,
                'published_at' => now()->subDays(6),
                'primary_category' => 'materi-pengujian',
                'audiences' => ['examiner', 'referee'],
            ],
            [
                'title' => 'Pedoman Medis & Pencegahan Cedera Kenshi',
                'slug' => 'pedoman-medis-pencegahan-cedera-kenshi',
                'code' => 'PMPC-2025',
                'isbn' => '978-602-1234-12-7',
                'author' => 'Tim Medis PB PERKEMI & dr. Sp.KO',
                'keywords' => 'medis, pertolongan pertama, cedera olahraga, kenshi',
                'admin_notes' => 'Pedoman SOP medis penanganan insiden di dojo dan turnamen.',
                'summary' => 'Prosedur pertolongan pertama dan pencegahan cedera muskuloskeletal saat latihan intensif.',
                'description' => 'Panduan komprehensif bagi pelatih dan tim medis dojo untuk menjaga kebugaran dan keselamatan kenshi.',
                'cover_path' => '/images/cover-3.jpg',
                'type' => 'guideline',
                'status' => 'published',
                'publication_year' => 2025,
                'page_count' => 64,
                'duration_seconds' => null,
                'is_downloadable' => true,
                'is_featured' => false,
                'published_at' => now()->subDays(18),
                'primary_category' => 'pedoman-regulasi',
                'audiences' => ['coach', 'organizer'],
            ],
            [
                'title' => 'Diktat Filosofi Kempo & Doktrin Budo',
                'slug' => 'diktat-filosofi-kempo-dan-doktrin-budo',
                'code' => 'DFK-2026',
                'isbn' => '978-602-1234-13-4',
                'author' => 'Sensei Senior PB PERKEMI',
                'keywords' => 'filosofi, budo, kongo zen, doktrin',
                'admin_notes' => 'Sedang direview oleh Dewan Guru sebelum diterbitkan.',
                'summary' => 'Naskah reflektif pendalaman nilai-nilai persaudaraan, cinta kasih, dan keberanian kenshi.',
                'description' => 'Materi pendalaman karakter kenshi berbasis filosofi Riki Ai Ichinyo dan Jiko Kakuritsu.',
                'cover_path' => '/images/cover-1.jpg',
                'type' => 'book',
                'status' => 'review',
                'publication_year' => 2026,
                'page_count' => 98,
                'duration_seconds' => null,
                'is_downloadable' => false,
                'is_featured' => false,
                'published_at' => null,
                'primary_category' => 'modul-penataran',
                'audiences' => ['participant', 'coach'],
            ],
            [
                'title' => 'Silabus Penataran Wasit Daerah (Konsep Draf)',
                'slug' => 'silabus-penataran-wasit-daerah-konsep-draf',
                'code' => 'SPWD-2026',
                'isbn' => null,
                'author' => 'Tim Penyusun Komisi Perwasitan',
                'keywords' => 'draf, silabus, wasit daerah',
                'admin_notes' => 'Draf internal belum diverifikasi.',
                'summary' => 'Rancangan silabus awa l untuk penyelarasan ujian wasit tingkat kota/kabupaten.',
                'description' => 'Konsep awal materi perwasitan daerah yang masih memerlukan masukan pengprov.',
                'cover_path' => '/images/cover-2.jpg',
                'type' => 'module',
                'status' => 'draft',
                'publication_year' => 2026,
                'page_count' => 45,
                'duration_seconds' => null,
                'is_downloadable' => false,
                'is_featured' => false,
                'published_at' => null,
                'primary_category' => 'perwasitan',
                'audiences' => ['referee'],
            ],
            [
                'title' => 'Arsip Regulasi Pertandingan 2020 (Edisi Lampau)',
                'slug' => 'arsip-regulasi-pertandingan-2020-edisi-lampau',
                'code' => 'ARP-2020',
                'isbn' => null,
                'author' => 'Sekretariat PB PERKEMI',
                'keywords' => 'arsip, regulasi lama, referensi sejarah',
                'admin_notes' => 'Diarsipkan karena telah digantikan oleh Peraturan Pertandingan 2026.',
                'summary' => 'Dokumentasi arsip peraturan pertandingan era PON XX Papua 2021.',
                'description' => 'Arsip historis untuk keperluan studi komparatif peraturan pertandingan PERKEMI masa lalu.',
                'cover_path' => '/images/cover-3.jpg',
                'type' => 'guideline',
                'status' => 'archived',
                'publication_year' => 2020,
                'page_count' => 88,
                'duration_seconds' => null,
                'is_downloadable' => false,
                'is_featured' => false,
                'published_at' => now()->subYears(4),
                'primary_category' => 'pedoman-regulasi',
                'audiences' => ['organizer'],
            ],
        ];

        // Valid minimal PDF content template to ensure file exists and streams cleanly
        $minimalPdfContent = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 58 >>\nstream\nBT /F1 14 Tf 72 720 Td (Pustaka Penataran PERKEMI - Dokumen Resmi) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000206 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n314\n%%EOF\n";

        foreach ($materialsData as $data) {
            $catSlug = $data['primary_category'];
            $audCodes = $data['audiences'];
            unset($data['primary_category'], $data['audiences']);

            $material = Material::updateOrCreate(
                ['slug' => $data['slug']],
                array_merge($data, [
                    'created_by' => $adminId,
                    'reviewed_by' => in_array($data['status'], ['published', 'archived']) ? $adminId : null,
                    'reviewed_at' => in_array($data['status'], ['published', 'archived']) ? now()->subDays(15) : null,
                ])
            );

            // 1. Sync Category (primary)
            if (isset($categories[$catSlug])) {
                $material->categories()->sync([
                    $categories[$catSlug]->id => ['is_primary' => true],
                ]);
            }

            // 2. Sync Audiences
            $audIds = collect($audCodes)
                ->map(fn ($code) => $audiences[$code]->id ?? null)
                ->filter()
                ->toArray();
            $material->audiences()->sync($audIds);

            // 3. Ensure Digital PDF File in Storage & Database
            $relativeDir = "books/{$material->id}";
            $filename = "v1_{$material->slug}.pdf";
            $relativePath = "{$relativeDir}/{$filename}";

            // Ensure directory exists on private disk
            if (! Storage::disk('local')->exists($relativeDir)) {
                Storage::disk('local')->makeDirectory($relativeDir);
            }

            // Generate multi-page PDF content for realistic reader testing
            $pagesCount = min(12, max(6, (int) ($data['page_count'] ? ceil($data['page_count'] / 10) : 12)));
            $generatedPdfContent = $this->generateSamplePdf($data['title'], $pagesCount);

            // Always write the valid multi-page PDF content
            Storage::disk('local')->put($relativePath, $generatedPdfContent);
            $sizeBytes = strlen($generatedPdfContent);

            MaterialFile::updateOrCreate(
                [
                    'material_id' => $material->id,
                    'kind' => 'main',
                ],
                [
                    'disk' => 'local',
                    'path' => $relativePath,
                    'storage_name' => $filename,
                    'original_name' => "{$material->slug}.pdf",
                    'mime_type' => 'application/pdf',
                    'extension' => 'pdf',
                    'size_bytes' => $sizeBytes,
                    'page_count' => $pagesCount,
                    'sort_order' => 0,
                    'version' => 1,
                    'is_active' => true,
                    'uploaded_by' => $adminId,
                ]
            );
        }
    }

    /**
     * Generate valid multi-page PDF binary for testing reader.
     */
    private function generateSamplePdf(string $title, int $numPages = 12): string
    {
        $out = "%PDF-1.4\n";
        $offsets = [];
        $objCount = 2 + ($numPages * 2);

        $offsets[1] = strlen($out);
        $out .= "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";

        $kids = [];
        for ($i = 1; $i <= $numPages; $i++) {
            $pageObjNum = 2 + (($i * 2) - 1);
            $kids[] = "{$pageObjNum} 0 R";
        }
        $kidsStr = implode(' ', $kids);

        $offsets[2] = strlen($out);
        $out .= "2 0 obj\n<< /Type /Pages /Kids [{$kidsStr}] /Count {$numPages} >>\nendobj\n";

        for ($i = 1; $i <= $numPages; $i++) {
            $pageObjNum = 2 + (($i * 2) - 1);
            $contentObjNum = $pageObjNum + 1;

            $offsets[$pageObjNum] = strlen($out);
            $out .= "{$pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> >> >> /Contents {$contentObjNum} 0 R >>\nendobj\n";

            $escapedTitle = addcslashes($title, '()\\');
            $pageText = "BT /F2 18 Tf 72 720 Td ($escapedTitle) Tj ET "
                .'BT /F1 12 Tf 72 680 Td (Pustaka Penataran PERKEMI - Dokumen Resmi Pembinaan Kenshi) Tj ET '
                ."BT /F2 14 Tf 72 640 Td (Halaman {$i} dari {$numPages}) Tj ET "
                .'BT /F1 11 Tf 72 600 Td (Materi berstatus resmi dan dilindungi hak cipta Persaudaraan Shorinji Kempo Indonesia.) Tj ET '
                .'BT /F1 11 Tf 72 570 Td (Gunakan pedoman ini untuk standardisasi kurikulum dan kepelatihan berjenjang di dojo.) Tj ET';

            $len = strlen($pageText);
            $offsets[$contentObjNum] = strlen($out);
            $out .= "{$contentObjNum} 0 obj\n<< /Length {$len} >>\nstream\n{$pageText}\nendstream\nendobj\n";
        }

        $xrefOffset = strlen($out);
        $out .= "xref\n0 ".($objCount + 1)."\n";
        $out .= "0000000000 65535 f \n";
        for ($i = 1; $i <= $objCount; $i++) {
            $out .= sprintf("%010d 00000 n \n", $offsets[$i]);
        }
        $out .= "trailer\n<< /Size ".($objCount + 1)." /Root 1 0 R >>\nstartxref\n{$xrefOffset}\n%%EOF\n";

        return $out;
    }
}
