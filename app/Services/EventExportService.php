<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\EventSession;
use App\Models\ParticipantTrack;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class EventExportService
{
    /**
     * Export event rundown to styled Excel (.xlsx).
     */
    public function exportRundown(Event $event): BinaryFileResponse
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Rundown Kegiatan');

        // Document Metadata
        $spreadsheet->getProperties()
            ->setCreator('PB PERKEMI - Pustaka Penataran')
            ->setTitle("Rundown {$event->name}")
            ->setSubject('Rundown dan Jadwal Sesi Kegiatan');

        // Title Block
        $sheet->setCellValue('A1', 'PERSATUAN PERSAUDARAAN SHORINJI KEMPO INDONESIA (PB PERKEMI)');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(11)->getColor()->setRGB('0E2747');

        $sheet->setCellValue('A2', 'RUNDOWN & JADWAL SESI KEGIATAN');
        $sheet->getStyle('A2')->getFont()->setBold(true)->setSize(14)->getColor()->setRGB('0B63CE');

        $sheet->setCellValue('A3', $event->name);
        $sheet->getStyle('A3')->getFont()->setBold(true)->setSize(12)->getColor()->setRGB('0E2747');

        $sheet->setCellValue('A4', "Tanggal: {$event->date_formatted}   |   Tempat: {$event->place}   |   Penyelenggara: {$event->organizer}");
        $sheet->getStyle('A4')->getFont()->setSize(10)->getColor()->setRGB('4A6482');

        $sheet->setCellValue('A5', 'Waktu Unduh: '.now()->translatedFormat('d F Y, H:i').' WIB');
        $sheet->getStyle('A5')->getFont()->setSize(9)->setItalic(true)->getColor()->setRGB('6B7C93');

        // Table Headers (Row 7)
        $headers = [
            'A7' => 'No',
            'B7' => 'Hari Ke',
            'C7' => 'Tanggal',
            'D7' => 'Waktu (WIB)',
            'E7' => 'No. Sesi',
            'F7' => 'Topik / Materi Sesi',
            'G7' => 'Subtopik / Rincian',
            'H7' => 'Target Jalur',
            'I7' => 'Ruangan / Dojo',
            'J7' => 'Pemateri / Instruktur',
            'K7' => 'Tipe Sesi',
            'L7' => 'Mode Absensi',
            'M7' => 'Kode QR Sesi',
        ];

        foreach ($headers as $cell => $text) {
            $sheet->setCellValue($cell, $text);
        }

        $this->applyHeaderStyle($sheet, 'A7:M7', '0E2747');

        // Sessions Query
        $sessions = EventSession::query()
            ->where('event_id', $event->id)
            ->with(['speaker', 'sessionType'])
            ->orderBy('day_number')
            ->orderBy('start_time')
            ->orderBy('session_number')
            ->get();

        $row = 8;
        $no = 1;

        foreach ($sessions as $session) {
            $targetTracks = ! empty($session->target_tracks) ? implode(', ', (array) $session->target_tracks) : 'Semua Jalur';
            $sessionDate = $session->session_date ? $session->session_date->format('d/m/Y') : '-';
            $timeSlot = $session->time_slot ?: ($session->start_time && $session->end_time ? "{$session->start_time} - {$session->end_time}" : '-');

            $sheet->setCellValue("A{$row}", $no++);
            $sheet->setCellValue("B{$row}", "Hari ke-{$session->day_number}");
            $sheet->setCellValue("C{$row}", $sessionDate);
            $sheet->setCellValue("D{$row}", $timeSlot);
            $sheet->setCellValue("E{$row}", $session->session_number ?: '-');
            $sheet->setCellValue("F{$row}", $session->topic);
            $sheet->setCellValue("G{$row}", $session->subtopic ?: '-');
            $sheet->setCellValue("H{$row}", $targetTracks);
            $sheet->setCellValue("I{$row}", $session->room ?: '-');
            $sheet->setCellValue("J{$row}", $session->speaker?->name ?: '-');
            $sheet->setCellValue("K{$row}", $session->session_type_code ?: ($session->sessionType?->name ?: '-'));
            $sheet->setCellValue("L{$row}", match ($session->attendance_setting) {
                'check_in' => 'Check-in Saja',
                'check_in_out' => 'Check-in & Out',
                'disabled' => 'Non-aktif (Disabled)',
                'none' => 'Tanpa Absensi',
                default => $session->attendance_setting ?? '-'
            });
            $sheet->setCellValue("M{$row}", $session->qr_short_code ?: '-');

            // Alignment
            $sheet->getStyle("A{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("B{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("C{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("D{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("E{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("H{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("L{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("M{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            // Alternating zebra stripe
            if ($row % 2 === 1) {
                $sheet->getStyle("A{$row}:M{$row}")->getFill()
                    ->setFillType(Fill::FILL_SOLID)
                    ->getStartColor()->setRGB('F8FBFF');
            }

            // Grid borders
            $sheet->getStyle("A{$row}:M{$row}")->getBorders()->getAllBorders()
                ->setBorderStyle(Border::BORDER_THIN)->getColor()->setRGB('DCE7F3');

            $row++;
        }

        // Auto width for all columns
        foreach (range('A', 'M') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $safeName = Str::slug($event->name);
        $filename = "Rundown_{$safeName}_".now()->format('Ymd_His').'.xlsx';
        $tempPath = tempnam(sys_get_temp_dir(), 'rundown_').'.xlsx';

        $writer = new Xlsx($spreadsheet);
        $writer->save($tempPath);

        return response()->download($tempPath, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])->deleteFileAfterSend(true);
    }

    /**
     * Export event participants along with portal login credentials to Excel (.xlsx).
     */
    public function exportParticipants(Event $event): BinaryFileResponse
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Peserta & Akun Login');

        $tracksMap = ParticipantTrack::all()->pluck('name', 'code')->toArray();

        // Document Metadata
        $spreadsheet->getProperties()
            ->setCreator('PB PERKEMI - Pustaka Penataran')
            ->setTitle("Peserta & Kredensial Login {$event->name}")
            ->setSubject('Data Peserta dan Akun Login');

        // Title Block
        $sheet->setCellValue('A1', 'PERSATUAN PERSAUDARAAN SHORINJI KEMPO INDONESIA (PB PERKEMI)');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(11)->getColor()->setRGB('0E2747');

        $sheet->setCellValue('A2', 'DATA PESERTA & KREDENSIAL LOGIN PORTAL DIKTAR');
        $sheet->getStyle('A2')->getFont()->setBold(true)->setSize(14)->getColor()->setRGB('0B63CE');

        $sheet->setCellValue('A3', $event->name);
        $sheet->getStyle('A3')->getFont()->setBold(true)->setSize(12)->getColor()->setRGB('0E2747');

        $sheet->setCellValue('A4', "Tanggal: {$event->date_formatted}   |   Tempat: {$event->place}   |   Penyelenggara: {$event->organizer}");
        $sheet->getStyle('A4')->getFont()->setSize(10)->getColor()->setRGB('4A6482');

        $sheet->setCellValue('A5', 'PANDUAN LOGIN: Peserta membuka URL: https://diktar.smart-perkemi.id/login lalu masuk menggunakan Email ATAU NIK, dengan Password Default: password');
        $sheet->getStyle('A5')->getFont()->setSize(9)->setBold(true)->getColor()->setRGB('0B63CE');

        // Table Headers (Row 7)
        $headers = [
            'A7' => 'No',
            'B7' => 'Nama Lengkap Kenshi',
            'C7' => 'Nomor Induk Kenshi (NIK)',
            'D7' => 'Tingkatan (DAN)',
            'E7' => 'Kode Jalur',
            'F7' => 'Nama Jalur Sertifikasi',
            'G7' => 'Asal Kota / Kabupaten',
            'H7' => 'Asal Pengprov',
            'I7' => 'Asal Dojo',
            'J7' => 'No. Telepon / WhatsApp',
            'K7' => 'Status Check-in',
            'L7' => 'Status Kehadiran',
            'M7' => 'Status Kelulusan',
            'N7' => 'URL Login Portal',
            'O7' => 'ID Login (Email / NIK)',
            'P7' => 'Password Default',
            'Q7' => 'Catatan Pendaftaran',
        ];

        foreach ($headers as $cell => $text) {
            $sheet->setCellValue($cell, $text);
        }

        // Apply general header style
        $this->applyHeaderStyle($sheet, 'A7:M7', '0E2747');
        // Apply special highlighted header style for Login Credentials columns (N..P)
        $this->applyHeaderStyle($sheet, 'N7:P7', '0B63CE');
        $this->applyHeaderStyle($sheet, 'Q7:Q7', '0E2747');

        // Participants Query
        $participants = EventParticipant::query()
            ->where('event_id', $event->id)
            ->with(['participant.user'])
            ->get();

        $row = 8;
        $no = 1;
        $loginUrl = url('/login');

        foreach ($participants as $ep) {
            $p = $ep->participant;
            $user = $p?->user;
            $nik = $p?->kenshi_id_number ?: '-';
            $email = $user?->email ?: ($p?->email ?: '-');
            $trackName = $tracksMap[$ep->track_code] ?? $ep->track_code ?? '-';

            $sheet->setCellValue("A{$row}", $no++);
            $sheet->setCellValue("B{$row}", $p?->name ?: '-');
            $sheet->setCellValueExplicit("C{$row}", (string) $nik, DataType::TYPE_STRING);
            $sheet->setCellValue("D{$row}", $p?->dan_rank ?: ($p?->dan_level ? "DAN {$p->dan_level}" : '-'));
            $sheet->setCellValue("E{$row}", $ep->track_code ?: '-');
            $sheet->setCellValue("F{$row}", $trackName);
            $sheet->setCellValue("G{$row}", $p?->origin_city ?: '-');
            $sheet->setCellValue("H{$row}", $p?->origin_province ?: '-');
            $sheet->setCellValue("I{$row}", $p?->origin_dojo ?: '-');
            $sheet->setCellValueExplicit("J{$row}", (string) ($p?->phone ?: '-'), DataType::TYPE_STRING);
            $sheet->setCellValue("K{$row}", $ep->checkin_status === 'checked_in' ? 'Checked-In' : 'Terdaftar');
            $sheet->setCellValue("L{$row}", $ep->attendance_status ?: '-');
            $sheet->setCellValue("M{$row}", $ep->graduation_status ?: 'Dalam Proses');

            // Login Credential Columns (N, O, P)
            $sheet->setCellValue("N{$row}", $loginUrl);
            $sheet->setCellValue("O{$row}", $email !== '-' ? $email : $nik);
            $sheet->setCellValue("P{$row}", 'password');
            $sheet->setCellValue("Q{$row}", $p?->notes ?: '-');

            // Alignment
            $sheet->getStyle("A{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("C{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("D{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("E{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("J{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("K{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("L{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("M{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("N{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("P{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            // Highlight login credentials background subtly
            $sheet->getStyle("N{$row}:P{$row}")->getFill()
                ->setFillType(Fill::FILL_SOLID)
                ->getStartColor()->setRGB('EAF5FF');

            // Zebra stripe for other columns
            if ($row % 2 === 1) {
                $sheet->getStyle("A{$row}:M{$row}")->getFill()
                    ->setFillType(Fill::FILL_SOLID)
                    ->getStartColor()->setRGB('F8FBFF');
                $sheet->getStyle("Q{$row}")->getFill()
                    ->setFillType(Fill::FILL_SOLID)
                    ->getStartColor()->setRGB('F8FBFF');
            }

            // Grid borders
            $sheet->getStyle("A{$row}:Q{$row}")->getBorders()->getAllBorders()
                ->setBorderStyle(Border::BORDER_THIN)->getColor()->setRGB('DCE7F3');

            $row++;
        }

        // Auto width for all columns
        foreach (range('A', 'Q') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $safeName = Str::slug($event->name);
        $filename = "Peserta_dan_Login_{$safeName}_".now()->format('Ymd_His').'.xlsx';
        $tempPath = tempnam(sys_get_temp_dir(), 'peserta_').'.xlsx';

        $writer = new Xlsx($spreadsheet);
        $writer->save($tempPath);

        return response()->download($tempPath, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])->deleteFileAfterSend(true);
    }

    /**
     * Apply header styling.
     */
    private function applyHeaderStyle(Worksheet $sheet, string $range, string $hexBgColor = '0E2747'): void
    {
        $sheet->getStyle($range)->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 10,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => $hexBgColor],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
                'wrapText' => true,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'DCE7F3'],
                ],
            ],
        ]);
        $sheet->getRowDimension(7)->setRowHeight(28);
    }
}
