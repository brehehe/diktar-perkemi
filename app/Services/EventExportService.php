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
            'N7' => 'Paket Ujian CBT',
        ];

        foreach ($headers as $cell => $text) {
            $sheet->setCellValue($cell, $text);
        }

        $this->applyHeaderStyle($sheet, 'A7:N7', '0E2747');

        // Sessions Query
        $sessions = EventSession::query()
            ->where('event_id', $event->id)
            ->with(['speaker', 'sessionType', 'cbtPackage'])
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
            $cbtInfo = $session->cbtPackage ? "{$session->cbtPackage->code} — {$session->cbtPackage->title}" : '-';

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
            $sheet->setCellValue("N{$row}", $cbtInfo);

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
                $sheet->getStyle("A{$row}:N{$row}")->getFill()
                    ->setFillType(Fill::FILL_SOLID)
                    ->getStartColor()->setRGB('F8FBFF');
            }

            // Grid borders
            $sheet->getStyle("A{$row}:N{$row}")->getBorders()->getAllBorders()
                ->setBorderStyle(Border::BORDER_THIN)->getColor()->setRGB('DCE7F3');

            $row++;
        }

        // Auto width for all columns
        foreach (range('A', 'N') as $col) {
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

        $sheet->setCellValue('A5', 'PANDUAN LOGIN: Akses URL: '.url('/login').' | ID Login: Email atau NIK | Password Default: NIK Kenshi masing-masing (format: XX.X.XX.XX.XX.XXX)');
        $sheet->getStyle('A5')->getFont()->setSize(9)->setBold(true)->getColor()->setRGB('0B63CE');

        // Table Headers (Row 7)
        $headers = [
            'A7' => 'No',
            'B7' => 'Nama Lengkap Kenshi',
            'C7' => 'Nomor Induk Kenshi (NIK)',
            'D7' => 'Tempat Lahir',
            'E7' => 'Tanggal Lahir',
            'F7' => 'Jenis Kelamin',
            'G7' => 'Tingkatan (DAN)',
            'H7' => 'Kode Jalur',
            'I7' => 'Nama Jalur Sertifikasi',
            'J7' => 'Target Sertifikasi',
            'K7' => 'Sertifikasi Terakhir',
            'L7' => 'No. Sertifikasi Terakhir',
            'M7' => 'Pekerjaan',
            'N7' => 'Alamat Lengkap',
            'O7' => 'Asal Kota / Kabupaten',
            'P7' => 'Asal Pengprov',
            'Q7' => 'Asal Dojo',
            'R7' => 'No. Telepon / WhatsApp',
            'S7' => 'Pakta Integritas',
            'T7' => 'Status Check-in',
            'U7' => 'Status Kehadiran',
            'V7' => 'Status Kelulusan',
            'W7' => 'URL Login Portal',
            'X7' => 'ID Login (Email / NIK)',
            'Y7' => 'Password Login (NIK)',
            'Z7' => 'Catatan Pendaftaran',
        ];

        foreach ($headers as $cell => $text) {
            $sheet->setCellValue($cell, $text);
        }

        // Apply general header style
        $this->applyHeaderStyle($sheet, 'A7:V7', '0E2747');
        // Apply special highlighted header style for Login Credentials columns (W..Y)
        $this->applyHeaderStyle($sheet, 'W7:Y7', '0B63CE');
        $this->applyHeaderStyle($sheet, 'Z7:Z7', '0E2747');

        // Participants Query
        $participants = EventParticipant::query()
            ->where('event_id', $event->id)
            ->with(['participant.user', 'participant.latestIntegrityPact'])
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
            $pact = $p?->latestIntegrityPact;
            $pactStatus = $pact ? 'Sudah Ditandatangani' : 'Belum Ditandatangani';

            $sheet->setCellValue("A{$row}", $no++);
            $sheet->setCellValue("B{$row}", $p?->name ?: '-');
            $sheet->setCellValueExplicit("C{$row}", (string) $nik, DataType::TYPE_STRING);
            $sheet->setCellValue("D{$row}", $p?->birth_place ?: '-');
            $sheet->setCellValue("E{$row}", $p?->birth_date ? $p->birth_date->format('d/m/Y') : '-');
            $sheet->setCellValue("F{$row}", $p?->gender ?: '-');
            $sheet->setCellValue("G{$row}", $p?->dan_rank ?: ($p?->dan_level ? "DAN {$p->dan_level}" : '-'));
            $sheet->setCellValue("H{$row}", $ep->track_code ?: '-');
            $sheet->setCellValue("I{$row}", $trackName);
            $sheet->setCellValue("J{$row}", $p?->target_certification ?: '-');
            $sheet->setCellValue("K{$row}", $p?->last_certificate ?: '-');
            $sheet->setCellValueExplicit("L{$row}", (string) ($p?->last_certificate_number ?: '-'), DataType::TYPE_STRING);
            $sheet->setCellValue("M{$row}", $p?->occupation ?: '-');
            $sheet->setCellValue("N{$row}", $p?->address ?: '-');
            $sheet->setCellValue("O{$row}", $p?->origin_city ?: '-');
            $sheet->setCellValue("P{$row}", $p?->origin_province ?: '-');
            $sheet->setCellValue("Q{$row}", $p?->origin_dojo ?: '-');
            $sheet->setCellValueExplicit("R{$row}", (string) ($p?->phone ?: '-'), DataType::TYPE_STRING);
            $sheet->setCellValue("S{$row}", $pactStatus);
            $sheet->setCellValue("T{$row}", $ep->checkin_status === 'checked_in' ? 'Checked-In' : 'Terdaftar');
            $sheet->setCellValue("U{$row}", $ep->attendance_status ?: '-');
            $sheet->setCellValue("V{$row}", $ep->graduation_status ?: 'Dalam Proses');

            // Login Credential Columns (W, X, Y)
            $sheet->setCellValue("W{$row}", $loginUrl);
            $sheet->setCellValue("X{$row}", $email !== '-' ? $email : $nik);
            $sheet->setCellValueExplicit("Y{$row}", (string) $nik, DataType::TYPE_STRING);
            $sheet->setCellValue("Z{$row}", $p?->notes ?: '-');

            // Alignment
            $sheet->getStyle("A{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("C{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("E{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("F{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("G{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("H{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("R{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("S{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("T{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("U{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("V{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("W{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("Y{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            // Highlight login credentials background subtly
            $sheet->getStyle("W{$row}:Y{$row}")->getFill()
                ->setFillType(Fill::FILL_SOLID)
                ->getStartColor()->setRGB('EAF5FF');

            // Zebra stripe for other columns
            if ($row % 2 === 1) {
                $sheet->getStyle("A{$row}:V{$row}")->getFill()
                    ->setFillType(Fill::FILL_SOLID)
                    ->getStartColor()->setRGB('F8FBFF');
                $sheet->getStyle("Z{$row}")->getFill()
                    ->setFillType(Fill::FILL_SOLID)
                    ->getStartColor()->setRGB('F8FBFF');
            }

            // Grid borders
            $sheet->getStyle("A{$row}:Z{$row}")->getBorders()->getAllBorders()
                ->setBorderStyle(Border::BORDER_THIN)->getColor()->setRGB('DCE7F3');

            $row++;
        }

        // Auto width for all columns (A to Z)
        foreach (range('A', 'Z') as $col) {
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
