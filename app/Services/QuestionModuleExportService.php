<?php

namespace App\Services;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class QuestionModuleExportService
{
    /**
     * Generate and return temporary file path of the blank template.
     */
    public function generateBlankTemplateFile(): string
    {
        $spreadsheet = new Spreadsheet;

        // 1. Sheet PETUNJUK
        $this->buildPetunjukSheet($spreadsheet);

        // 2. Sheet PRE-TEST
        $this->buildQuestionSheet($spreadsheet, 'PRE-TEST', 'Diagnostik', 'C1–C2', 'Basic Knowledge');

        // 3. Sheet KUIS
        $this->buildQuestionSheet($spreadsheet, 'KUIS', 'Formatif', 'C3', 'Application');

        // 4. Sheet POST-TEST
        $this->buildQuestionSheet($spreadsheet, 'POST-TEST', 'Sumatif', 'C3–C4', 'Case Analysis');

        // 5. Sheet REFERENSI
        $this->buildReferensiSheet($spreadsheet);

        // Set active sheet to PETUNJUK
        $spreadsheet->setActiveSheetIndex(0);

        $tempFile = tempnam(sys_get_temp_dir(), 'format_bank_soal_');
        $writer = new Xlsx($spreadsheet);
        $writer->save($tempFile);

        return $tempFile;
    }

    /**
     * Build the PETUNJUK sheet.
     */
    private function buildPetunjukSheet(Spreadsheet $spreadsheet): void
    {
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('PETUNJUK');

        // Title row
        $sheet->setCellValue('A1', 'FORMAT MASTER BANK SOAL & MODUL SOAL — PERKEMI');
        $sheet->mergeCells('A1:B1');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(13)->getColor()->setRGB('0B63CE');

        $guidelines = [
            ['Struktur Berkas', 'Berkas terdiri dari 5 Sheet: PETUNJUK, PRE-TEST, KUIS, POST-TEST, dan REFERENSI.'],
            ['Sheet PRE-TEST', 'Menampung butir soal diagnostik (evaluasi awal, pemahaman dasar / C1–C2).'],
            ['Sheet KUIS', 'Menampung butir soal formatif (evaluasi materi per sesi, tingkat pemahaman aplikasi / C3).'],
            ['Sheet POST-TEST', 'Menampung butir soal sumatif (evaluasi akhir kelulusan, analisis kasus / C3–C4).'],
            ['Sheet REFERENSI', 'Menampung pemetaan kode modul, judul materi, acuan sumber modul, dan fokus kisi-kisi soal.'],
            ['Kolom Prodi', 'Diisi dengan singkatan jalur peserta: PED, PEN, WAD, WAN, atau kombinasi PED + WAD / PEN + WAN.'],
            ['Kolom Topik Soal', 'Diawali dengan kode modul yang sesuai (misal: PED-01 Regulasi Ujian, Mandat dan Administrasi).'],
            ['Kolom Kategori Materi', 'Klasifikasi rumpun materi (misal: Regulasi & Tata Kelola, Kurikulum Teknik, dsb).'],
            ['Kolom Materi Soal', 'Pokok bahasan spesifik yang diuji (misal: Sumber kewenangan ujian).'],
            ['Kolom Tipe Soal', 'Tipe soal kognitif (misal: Understanding, Application, Case Analysis, atau Diagnostik Terintegrasi).'],
            ['Kolom Kategori Soal', 'Tingkat taksonomi Bloom (misal: C1–C2, C3, atau C3–C4).'],
            ['Kolom Soal', 'Teks pernyataan butir soal secara lengkap dan jelas.'],
            ['Kolom Opsi (A–E)', 'Pilihan jawaban untuk opsi A, B, C, D, dan E (pilihan ganda 5 opsi).'],
            ['Kolom Jawaban', 'Kunci jawaban berupa 1 huruf kapital: A, B, C, D, atau E.'],
        ];

        $sheet->setCellValue('A2', 'Parameter / Aspek');
        $sheet->setCellValue('B2', 'Keterangan & Aturan Pengisian');
        $this->applyHeaderStyle($sheet, 'A2:B2');

        $rowNum = 3;
        foreach ($guidelines as $item) {
            $sheet->setCellValue('A'.$rowNum, $item[0]);
            $sheet->setCellValue('B'.$rowNum, $item[1]);
            $sheet->getStyle('A'.$rowNum)->getFont()->setBold(true);
            $sheet->getStyle('A'.$rowNum.':B'.$rowNum)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
            $sheet->getStyle('A'.$rowNum.':B'.$rowNum)->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN)->getColor()->setRGB('DCE7F3');
            $rowNum++;
        }

        $sheet->getColumnDimension('A')->setWidth(26);
        $sheet->getColumnDimension('B')->setWidth(90);
    }

    /**
     * Build Question Sheet (PRE-TEST, KUIS, POST-TEST).
     */
    private function buildQuestionSheet(Spreadsheet $spreadsheet, string $title, string $stageLabel, string $defaultCognitive, string $defaultType): void
    {
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle($title);

        $headers = [
            'Prodi',
            'Topik Soal',
            'Kategori Materi',
            'Materi Soal',
            'Tipe Soal',
            'Kategori Soal',
            'Soal',
            'A',
            'B',
            'C',
            'D',
            'E',
            'Jawaban',
        ];

        $colLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];

        foreach ($headers as $index => $header) {
            $sheet->setCellValue($colLetters[$index].'1', $header);
        }

        $this->applyHeaderStyle($sheet, 'A1:M1');

        // Sample data row for guidance
        $sampleRow = [
            'PED',
            'PED-01 Regulasi Ujian, Mandat dan Administrasi',
            'Regulasi & Tata Kelola',
            'Sumber kewenangan ujian',
            $defaultType,
            $defaultCognitive,
            '1. Contoh pertanyaan evaluasi kompetensi kenshi Shorinji Kempo...',
            'Pilihan jawaban A',
            'Pilihan jawaban B',
            'Pilihan jawaban C',
            'Pilihan jawaban D',
            'Pilihan jawaban E',
            'E',
        ];

        foreach ($sampleRow as $index => $value) {
            $sheet->setCellValue($colLetters[$index].'2', $value);
        }

        $sheet->getStyle('A2:M2')->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN)->getColor()->setRGB('DCE7F3');
        $sheet->getStyle('M2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Column widths
        $sheet->getColumnDimension('A')->setWidth(14);
        $sheet->getColumnDimension('B')->setWidth(35);
        $sheet->getColumnDimension('C')->setWidth(24);
        $sheet->getColumnDimension('D')->setWidth(28);
        $sheet->getColumnDimension('E')->setWidth(20);
        $sheet->getColumnDimension('F')->setWidth(16);
        $sheet->getColumnDimension('G')->setWidth(50);
        $sheet->getColumnDimension('H')->setWidth(35);
        $sheet->getColumnDimension('I')->setWidth(35);
        $sheet->getColumnDimension('J')->setWidth(35);
        $sheet->getColumnDimension('K')->setWidth(35);
        $sheet->getColumnDimension('L')->setWidth(35);
        $sheet->getColumnDimension('M')->setWidth(12);
    }

    /**
     * Build the REFERENSI sheet.
     */
    private function buildReferensiSheet(Spreadsheet $spreadsheet): void
    {
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle('REFERENSI');

        $headers = [
            'Kode',
            'Materi/Modul',
            'Sumber Utama yang Diintegrasikan',
            'Fokus Soal',
        ];

        $colLetters = ['A', 'B', 'C', 'D'];

        foreach ($headers as $index => $header) {
            $sheet->setCellValue($colLetters[$index].'1', $header);
        }

        $this->applyHeaderStyle($sheet, 'A1:D1');

        $sampleModules = [
            [
                'PED-01',
                'Regulasi Ujian, Mandat dan Administrasi',
                'Modul PED; WSKO Guidelines/Qualification System 2025; AD/ART PERKEMI 2026; Permenpora 8/2026',
                'kewenangan, yurisdiksi, administrasi, audit trail, tata kelola',
            ],
            [
                'PED-02',
                'Prinsip Assessment (Penilaian) Shorinji Kempo',
                'Modul PED; WSKO Comprehensive Grading Assessment',
                'blueprint, teknik-ajaran-perilaku, evidence, keputusan, feedback',
            ],
        ];

        $rowNum = 2;
        foreach ($sampleModules as $mod) {
            foreach ($mod as $index => $val) {
                $sheet->setCellValue($colLetters[$index].$rowNum, $val);
            }
            $sheet->getStyle('A'.$rowNum.':D'.$rowNum)->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN)->getColor()->setRGB('DCE7F3');
            $rowNum++;
        }

        $sheet->getColumnDimension('A')->setWidth(14);
        $sheet->getColumnDimension('B')->setWidth(40);
        $sheet->getColumnDimension('C')->setWidth(50);
        $sheet->getColumnDimension('D')->setWidth(50);
    }

    /**
     * Apply standard PERKEMI blue header style.
     */
    private function applyHeaderStyle(Worksheet $sheet, string $range): void
    {
        $sheet->getStyle($range)->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 10,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '0B63CE'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '084C9E'],
                ],
            ],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(26);
    }
}
