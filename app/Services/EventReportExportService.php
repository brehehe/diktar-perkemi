<?php

namespace App\Services;

use App\Actions\Events\CalculateCbtExamAttemptScore;
use App\Models\CbtExamAttempt;
use App\Models\Event;
use App\Models\EventFinance;
use App\Models\EventParticipant;
use App\Models\FinanceCategory;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class EventReportExportService
{
    public function __construct(private readonly CalculateCbtExamAttemptScore $calculateCbtExamAttemptScore) {}

    public function attendance(Event $event): BinaryFileResponse
    {
        $report = $this->attendanceData($event);
        $reportSheet = $report['sheets'][0];
        $sheet = $this->workbook($event, $report['title'], $reportSheet['name'])->getActiveSheet();
        $this->headers($sheet, $reportSheet['headers']);

        foreach ($reportSheet['rows'] as $index => $values) {
            $excelRow = $index + 8;
            $this->writeRow($sheet, $excelRow, $values);
            $sheet->setCellValueExplicit("C{$excelRow}", (string) $values[2], DataType::TYPE_STRING);
        }

        return $this->download($sheet->getParent(), $event, 'laporan-absensi');
    }

    public function outcomes(Event $event): BinaryFileResponse
    {
        $report = $this->outcomesData($event);
        $reportSheet = $report['sheets'][0];
        $sheet = $this->workbook($event, $report['title'], $reportSheet['name'])->getActiveSheet();
        $this->headers($sheet, $reportSheet['headers']);

        foreach ($reportSheet['rows'] as $index => $values) {
            $this->writeRow($sheet, $index + 8, $values);
        }

        return $this->download($sheet->getParent(), $event, 'laporan-capaian-kedisiplinan');
    }

    public function completenessAndAttempts(Event $event): BinaryFileResponse
    {
        $report = $this->completenessData($event);
        $primaryReportSheet = $report['sheets'][0];
        $spreadsheet = $this->workbook($event, $report['title'], $primaryReportSheet['name']);
        $sheet = $spreadsheet->getActiveSheet();
        $this->headers($sheet, $primaryReportSheet['headers']);

        foreach ($primaryReportSheet['rows'] as $index => $values) {
            $this->writeRow($sheet, $index + 8, $values);
        }

        $attemptReportSheet = $report['sheets'][1];
        $attemptSheet = $spreadsheet->createSheet();
        $attemptSheet->setTitle($attemptReportSheet['name']);
        $this->documentHeading($attemptSheet, $event, $attemptReportSheet['title']);
        $this->headers($attemptSheet, $attemptReportSheet['headers']);
        foreach ($attemptReportSheet['rows'] as $index => $values) {
            $this->writeRow($attemptSheet, $index + 8, $values);
        }

        return $this->download($spreadsheet, $event, 'rekap-kelengkapan-dan-cbt');
    }

    public function examAttempts(Event $event): BinaryFileResponse
    {
        $report = $this->examAttemptsData($event);
        $reportSheet = $report['sheets'][0];
        $sheet = $this->workbook($event, $report['title'], $reportSheet['name'])->getActiveSheet();
        $this->headers($sheet, $reportSheet['headers']);

        foreach ($reportSheet['rows'] as $index => $values) {
            $this->writeRow($sheet, $index + 8, $values);
            $sheet->setCellValueExplicit('C'.($index + 8), (string) $values[2], DataType::TYPE_STRING);
        }

        return $this->download($sheet->getParent(), $event, 'hasil-ujian-cbt');
    }

    public function finances(Event $event): BinaryFileResponse
    {
        $report = $this->financeData($event);
        $reportSheet = $report['sheets'][0];
        $sheet = $this->workbook($event, $report['title'], $reportSheet['name'])->getActiveSheet();
        $this->headers($sheet, $reportSheet['headers']);
        foreach ($reportSheet['rows'] as $index => $values) {
            $this->writeRow($sheet, $index + 8, $values);
            $sheet->getStyle('G'.($index + 8))->getNumberFormat()->setFormatCode('[$Rp-id-ID] #,##0');
        }

        return $this->download($sheet->getParent(), $event, 'laporan-keuangan');
    }

    /** @return array<string, mixed> */
    public function preview(Event $event, string $report): array
    {
        $data = match ($report) {
            'attendance' => $this->attendanceData($event),
            'outcomes' => $this->outcomesData($event),
            'completeness' => $this->completenessData($event),
            'finance' => $this->financeData($event),
            default => abort(404),
        };

        return [
            'key' => $report,
            'title' => $data['title'],
            'generated_at' => now()->translatedFormat('d F Y, H:i'),
            'sheets' => $data['sheets'],
        ];
    }

    /** @return array{title: string, sheets: array<int, array{name: string, headers: array<int, string>, rows: array<int, array<int, mixed>>}>} */
    private function attendanceData(Event $event): array
    {
        $event->load([
            'sessions:id,event_id,topic,session_type_code,date',
            'eventParticipants.participant:id,name,kenshi_id_number,origin_province,origin_city',
            'eventParticipants.registrationForm:id,event_id,participant_id,status',
            'attendances:id,event_id,event_session_id,participant_id,status,checked_in_at',
        ]);
        $sessions = $event->sessions;
        $attendances = $event->attendances->groupBy('participant_id');
        $rows = [];

        foreach ($event->eventParticipants as $index => $enrollment) {
            $participantAttendances = $attendances->get($enrollment->participant_id, collect());
            $presentSessionIds = $participantAttendances->whereIn('status', ['present', 'late', 'manual_override'])->pluck('event_session_id')->filter()->unique();
            $rows[] = [
                $index + 1,
                $enrollment->participant?->name ?? '-',
                $enrollment->participant?->kenshi_id_number ?? '-',
                $this->registrationStatus($enrollment),
                $this->stageAttendance($sessions, $presentSessionIds, ['KEHADIRAN_HARIAN'], true),
                $this->stageAttendance($sessions, $presentSessionIds, ['UJIAN']),
                $this->stageAttendance($sessions, $presentSessionIds, ['PENUTUPAN']),
                $presentSessionIds->count(),
                $sessions->count(),
                $sessions->count() > 0 ? round($presentSessionIds->count() / $sessions->count() * 100, 1).'%' : '0%',
            ];
        }

        return [
            'title' => 'LAPORAN ABSENSI TAHAPAN EVENT',
            'sheets' => [[
                'name' => 'Absensi',
                'headers' => ['No', 'Nama Peserta', 'NIK', 'Registrasi', 'Kehadiran Kelas', 'Ujian', 'Penutupan', 'Total Hadir', 'Total Sesi', 'Persentase'],
                'rows' => $rows,
            ]],
        ];
    }

    /** @return array{title: string, sheets: array<int, array{name: string, headers: array<int, string>, rows: array<int, array<int, mixed>>}>} */
    private function outcomesData(Event $event): array
    {
        $event->load([
            'eventParticipants.participant:id,name,kenshi_id_number',
            'eventParticipants.assessments:id,event_participant_id,total_score,is_passed',
            'attendances:id,event_id,event_session_id,participant_id,status',
            'sessions:id,event_id,session_type_code',
        ]);
        $attempts = CbtExamAttempt::query()->where('event_id', $event->id)->get()->groupBy('participant_id');
        $present = $event->attendances->whereIn('status', ['present', 'late', 'manual_override'])->groupBy('participant_id');
        $rows = [];

        foreach ($event->eventParticipants as $index => $enrollment) {
            $participantAttempts = $attempts->get($enrollment->participant_id, collect());
            $participantPresence = $present->get($enrollment->participant_id, collect());
            $attendanceTotal = max(1, $event->sessions->count());
            $attendanceRate = round($participantPresence->pluck('event_session_id')->filter()->unique()->count() / $attendanceTotal * 100, 1);
            $lateCount = $participantPresence->where('status', 'late')->count();
            $practiceAverage = $enrollment->assessments->count() > 0 ? round((float) $enrollment->assessments->avg('total_score'), 1) : null;
            $rows[] = [
                $index + 1,
                $enrollment->participant?->name ?? '-',
                $enrollment->participant?->kenshi_id_number ?? '-',
                $enrollment->track_code ?? '-',
                $participantAttempts->max('total_score') ?? '-',
                $participantAttempts->count(),
                $practiceAverage ?? '-',
                "{$attendanceRate}%",
                $lateCount === 0 ? 'Tepat waktu' : "{$lateCount} kali terlambat",
                $enrollment->graduation_status ?? 'Belum ditetapkan',
                $enrollment->evaluation_notes ?? '-',
            ];
        }

        return [
            'title' => 'LAPORAN HASIL, CAPAIAN & KEDISIPLINAN',
            'sheets' => [[
                'name' => 'Capaian',
                'headers' => ['No', 'Nama Peserta', 'NIK', 'Jalur', 'Nilai CBT Terbaik', 'Percobaan CBT', 'Rerata Praktik', 'Kehadiran', 'Kedisiplinan', 'Kelulusan', 'Catatan'],
                'rows' => $rows,
            ]],
        ];
    }

    /** @return array{title: string, sheets: array<int, array{name: string, title?: string, headers: array<int, string>, rows: array<int, array<int, mixed>>}>} */
    private function completenessData(Event $event): array
    {
        $event->load([
            'eventParticipants.participant:id,name,kenshi_id_number,photo_path',
            'eventParticipants.registrationForm:id,event_id,participant_id,status,file_path',
            'eventParticipants.integrityPact:id,event_id,participant_id,status',
        ]);
        $completenessRows = [];

        foreach ($event->eventParticipants as $index => $enrollment) {
            $completenessRows[] = [
                $index + 1,
                $enrollment->participant?->name ?? '-',
                $enrollment->participant?->kenshi_id_number ?? '-',
                $enrollment->participant?->photo_path ? 'Ada' : 'Belum ada',
                $enrollment->registrationForm?->status ?? 'Belum diisi',
                $enrollment->integrityPact?->status ?? ($enrollment->integrityPact ? 'Ada' : 'Belum ada'),
                $enrollment->admin_status ?? '-',
                $enrollment->checked_in_at ? 'Sudah' : 'Belum',
                ($enrollment->certificate_file_path || $enrollment->secondary_certificate_file_path) ? 'Tersedia' : 'Belum tersedia',
                ($enrollment->transcript_file_path || $enrollment->secondary_transcript_file_path) ? 'Tersedia' : 'Belum tersedia',
            ];
        }

        $attemptReportSheet = $this->examAttemptsData($event)['sheets'][0];

        return [
            'title' => 'REKAP KELENGKAPAN PESERTA & CBT',
            'sheets' => [
                [
                    'name' => 'Kelengkapan',
                    'headers' => ['No', 'Nama Peserta', 'NIK', 'Foto', 'Formulir', 'Pakta Integritas', 'Status Admin', 'Check-in', 'Sertifikat', 'Transkrip'],
                    'rows' => $completenessRows,
                ],
                $attemptReportSheet,
            ],
        ];
    }

    /** @return array{title: string, sheets: array<int, array{name: string, title?: string, headers: array<int, string>, rows: array<int, array<int, mixed>>}>} */
    private function examAttemptsData(Event $event): array
    {
        $enrollments = $event->eventParticipants()
            ->with('track:id,code,name')
            ->get()
            ->keyBy('participant_id');

        $attemptRows = CbtExamAttempt::query()
            ->where('event_id', $event->id)
            ->with([
                'participant',
                'package.questions',
                'package.bankQuestions',
            ])
            ->orderBy('participant_id')
            ->orderBy('attempt_number')
            ->get()
            ->values()
            ->map(function (CbtExamAttempt $attempt, int $index) use ($enrollments): array {
                $score = $this->calculateCbtExamAttemptScore->handle($attempt);
                $enrollment = $enrollments->get($attempt->participant_id);
                $statusLabel = match ($attempt->status) {
                    'submitted', 'completed' => 'Selesai',
                    'timed_out' => 'Waktu habis',
                    'evaluated' => 'Sudah dinilai',
                    default => 'Sedang ujian',
                };
                $resultLabel = $score['is_terminal']
                    ? ($attempt->is_passed ? 'Lulus' : 'Belum lulus')
                    : 'Sedang ujian';

                return [
                    $index + 1,
                    $attempt->participant?->name ?? '-',
                    $attempt->participant?->kenshi_id_number ?? '-',
                    $attempt->participant?->origin_dojo ?? '-',
                    $enrollment?->track_code ?? $enrollment?->track?->code ?? '-',
                    $attempt->package?->title ?? '-',
                    $attempt->package?->code ?? '-',
                    $attempt->package?->exam_type_label ?? 'Ujian',
                    $attempt->attempt_number,
                    $statusLabel,
                    $score['score_is_provisional'] ? 'Sementara' : 'Final',
                    $score['score'],
                    (float) ($attempt->package?->passing_score ?? 70),
                    $resultLabel,
                    $score['total_answered'],
                    $score['total_questions'],
                    $attempt->started_at?->format('d/m/Y H:i') ?? '-',
                    $attempt->submitted_at?->format('d/m/Y H:i') ?? '-',
                ];
            })->all();

        return [
            'title' => 'HASIL UJIAN CBT',
            'sheets' => [[
                'name' => 'Riwayat CBT',
                'title' => 'RIWAYAT PERCOBAAN CBT',
                'headers' => ['No', 'Nama Peserta', 'NIK', 'Asal Dojo', 'Jalur', 'Paket', 'Kode Paket', 'Tipe', 'Percobaan', 'Status', 'Jenis Nilai', 'Nilai', 'Batas Lulus', 'Hasil', 'Jawaban Terisi', 'Jumlah Soal', 'Mulai', 'Selesai'],
                'rows' => $attemptRows,
            ]],
        ];
    }

    /** @return array{title: string, sheets: array<int, array{name: string, headers: array<int, string>, rows: array<int, array<int, mixed>>}>} */
    private function financeData(Event $event): array
    {
        $rows = $event->finances()
            ->with(['creator:id,name', 'categoryMaster:id,code,name'])
            ->orderBy('occurred_on')
            ->orderBy('id')
            ->get()
            ->values()
            ->map(fn (EventFinance $entry, int $index) => [
                $index + 1,
                $entry->occurred_on->format('d/m/Y'),
                $entry->type === 'income' ? 'Pemasukan' : 'Pengeluaran',
                $entry->categoryMaster?->name ?? $entry->category,
                $entry->description,
                $entry->sponsor_name ?? '-',
                $entry->amount,
                $entry->evidence_path ? 'Ada' : 'Belum ada',
                $entry->creator?->name ?? '-',
            ])->all();

        return [
            'title' => 'LAPORAN KEUANGAN KEGIATAN',
            'sheets' => [[
                'name' => 'Keuangan',
                'headers' => ['No', 'Tanggal', 'Jenis', 'Kategori', 'Uraian', 'Sponsor', 'Nominal', 'Bukti', 'Dicatat oleh'],
                'rows' => $rows,
            ]],
        ];
    }

    /** @param  array<int, int>|null  $allowedEventIds */
    public function masterFinances(?int $eventId = null, ?array $allowedEventIds = null, array $filters = []): BinaryFileResponse
    {
        $type = $filters['type'] ?? null;
        $category = $filters['category'] ?? null;
        $startDate = $filters['start_date'] ?? null;
        $endDate = $filters['end_date'] ?? null;
        $search = $filters['search'] ?? null;

        $query = EventFinance::query()
            ->with(['event:id,title,slug,start_date,location', 'creator:id,name'])
            ->when($allowedEventIds !== null, fn ($q) => $q->whereIn('event_id', $allowedEventIds))
            ->when($eventId, fn ($q) => $q->where('event_id', $eventId))
            ->when($type, fn ($q) => $q->where('type', $type))
            ->when($category, fn ($q) => $q->where('category', $category))
            ->when($startDate, fn ($q) => $q->whereDate('occurred_on', '>=', $startDate))
            ->when($endDate, fn ($q) => $q->whereDate('occurred_on', '<=', $endDate))
            ->when($search, fn ($q) => $q->where(fn ($sq) => $sq->where('description', 'like', "%{$search}%")->orWhere('sponsor_name', 'like', "%{$search}%")))
            ->orderBy('occurred_on')
            ->orderBy('id');

        $transactions = $query->get();
        $spreadsheet = new Spreadsheet;
        $spreadsheet->getProperties()->setCreator('PB PERKEMI - Pustaka Penataran')->setTitle('Master Laporan Keuangan Penataran');

        $categoryLabels = FinanceCategory::query()->pluck('name', 'code')->all();

        $totalIncome = (int) $transactions->where('type', 'income')->sum('amount');
        $totalExpense = (int) $transactions->where('type', 'expense')->sum('amount');
        $netBalance = $totalIncome - $totalExpense;
        $totalSponsor = (int) $transactions->where('type', 'income')->where('category', 'sponsorship')->sum('amount');

        // ─── SHEET 1: RINGKASAN & POS NERACA ───
        $sheet1 = $spreadsheet->getActiveSheet();
        $sheet1->setTitle('Ringkasan & Neraca');

        $sheet1->setCellValue('A1', 'PERSATUAN PERSAUDARAAN SHORINJI KEMPO INDONESIA (PB PERKEMI)');
        $sheet1->setCellValue('A2', 'LAPORAN KEUANGAN & NERACA ARUS KAS KEGIATAN PENATARAN');
        $sheet1->setCellValue('A3', $eventId ? 'Kegiatan: '.($transactions->first()?->event?->name ?? 'Event Terpilih') : 'Seluruh Portofolio Kegiatan Penataran');
        $sheet1->setCellValue('A4', 'Periode: '.($startDate ? date('d/m/Y', strtotime($startDate)) : 'Awal').' s/d '.($endDate ? date('d/m/Y', strtotime($endDate)) : 'Sekarang').' | Waktu Ekspor: '.now()->translatedFormat('d F Y, H:i').' WIB');

        $sheet1->getStyle('A1:A3')->getFont()->setBold(true)->getColor()->setRGB('0E2747');
        $sheet1->getStyle('A2')->getFont()->setSize(13)->getColor()->setRGB('0B63CE');
        $sheet1->getStyle('A4')->getFont()->getColor()->setRGB('6B7C93');

        $sheet1->setCellValue('A6', 'RINGKASAN EKSEKUTIF KAS');
        $sheet1->getStyle('A6')->getFont()->setBold(true)->getColor()->setRGB('0E2747');

        $sheet1->setCellValue('A7', 'Total Penerimaan / Pemasukan:');
        $sheet1->setCellValue('B7', $totalIncome);
        $sheet1->setCellValue('A8', 'Total Pengeluaran / Biaya:');
        $sheet1->setCellValue('B8', $totalExpense);
        $sheet1->setCellValue('A9', 'Saldo Kas Bersih (Surplus / Defisit):');
        $sheet1->setCellValue('B9', $netBalance);
        $sheet1->setCellValue('A10', 'Total Dana Sponsor:');
        $sheet1->setCellValue('B10', $totalSponsor);
        $sheet1->setCellValue('A11', 'Jumlah Transaksi:');
        $sheet1->setCellValue('B11', $transactions->count().' transaksi');

        $sheet1->getStyle('B7:B10')->getNumberFormat()->setFormatCode('[$Rp-id-ID] #,##0');
        $sheet1->getStyle('A7:A11')->getFont()->setBold(true);
        $sheet1->getStyle('B7:B10')->getFont()->setBold(true);
        $sheet1->getStyle('B9')->getFont()->getColor()->setRGB($netBalance >= 0 ? '16785B' : 'B93664');

        // Pos Pemasukan
        $sheet1->setCellValue('A13', 'POS ANGGARAN PEMASUKAN');
        $sheet1->getStyle('A13')->getFont()->setBold(true)->getColor()->setRGB('16785B');
        $sheet1->setCellValue('A14', 'Kategori');
        $sheet1->setCellValue('B14', 'Jumlah Transaksi');
        $sheet1->setCellValue('C14', 'Total Nominal');
        $sheet1->setCellValue('D14', 'Porsi (%)');
        $sheet1->getStyle('A14:D14')->getFont()->setBold(true)->getColor()->setRGB('FFFFFF');
        $sheet1->getStyle('A14:D14')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('16785B');

        $incomeGroups = $transactions->where('type', 'income')->groupBy('category');
        $row = 15;
        foreach ($incomeGroups as $cat => $items) {
            $catSum = (int) $items->sum('amount');
            $pct = $totalIncome > 0 ? round(($catSum / $totalIncome) * 100, 1) : 0;
            $sheet1->setCellValue("A{$row}", $categoryLabels[$cat] ?? ucfirst($cat));
            $sheet1->setCellValue("B{$row}", $items->count());
            $sheet1->setCellValue("C{$row}", $catSum);
            $sheet1->setCellValue("D{$row}", "{$pct}%");
            $sheet1->getStyle("C{$row}")->getNumberFormat()->setFormatCode('[$Rp-id-ID] #,##0');
            $row++;
        }
        $sheet1->setCellValue("A{$row}", 'TOTAL PEMASUKAN');
        $sheet1->setCellValue("B{$row}", $transactions->where('type', 'income')->count());
        $sheet1->setCellValue("C{$row}", $totalIncome);
        $sheet1->setCellValue("D{$row}", '100%');
        $sheet1->getStyle("A{$row}:D{$row}")->getFont()->setBold(true);
        $sheet1->getStyle("C{$row}")->getNumberFormat()->setFormatCode('[$Rp-id-ID] #,##0');
        $sheet1->getStyle("A{$row}:D{$row}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('EAF5FF');

        // Pos Pengeluaran
        $row += 2;
        $sheet1->setCellValue("A{$row}", 'POS ANGGARAN PENGELUARAN');
        $sheet1->getStyle("A{$row}")->getFont()->setBold(true)->getColor()->setRGB('B93664');
        $row++;
        $sheet1->setCellValue("A{$row}", 'Kategori');
        $sheet1->setCellValue("B{$row}", 'Jumlah Transaksi');
        $sheet1->setCellValue("C{$row}", 'Total Nominal');
        $sheet1->setCellValue("D{$row}", 'Porsi (%)');
        $sheet1->getStyle("A{$row}:D{$row}")->getFont()->setBold(true)->getColor()->setRGB('FFFFFF');
        $sheet1->getStyle("A{$row}:D{$row}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('B93664');

        $expenseGroups = $transactions->where('type', 'expense')->groupBy('category');
        $row++;
        foreach ($expenseGroups as $cat => $items) {
            $catSum = (int) $items->sum('amount');
            $pct = $totalExpense > 0 ? round(($catSum / $totalExpense) * 100, 1) : 0;
            $sheet1->setCellValue("A{$row}", $categoryLabels[$cat] ?? ucfirst($cat));
            $sheet1->setCellValue("B{$row}", $items->count());
            $sheet1->setCellValue("C{$row}", $catSum);
            $sheet1->setCellValue("D{$row}", "{$pct}%");
            $sheet1->getStyle("C{$row}")->getNumberFormat()->setFormatCode('[$Rp-id-ID] #,##0');
            $row++;
        }
        $sheet1->setCellValue("A{$row}", 'TOTAL PENGELUARAN');
        $sheet1->setCellValue("B{$row}", $transactions->where('type', 'expense')->count());
        $sheet1->setCellValue("C{$row}", $totalExpense);
        $sheet1->setCellValue("D{$row}", '100%');
        $sheet1->getStyle("A{$row}:D{$row}")->getFont()->setBold(true);
        $sheet1->getStyle("C{$row}")->getNumberFormat()->setFormatCode('[$Rp-id-ID] #,##0');
        $sheet1->getStyle("A{$row}:D{$row}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('FFF0F3');

        $sheet1->getColumnDimension('A')->setWidth(30);
        $sheet1->getColumnDimension('B')->setWidth(18);
        $sheet1->getColumnDimension('C')->setWidth(24);
        $sheet1->getColumnDimension('D')->setWidth(15);

        // ─── SHEET 2: REKAPITULASI PER EVENT ───
        $sheet2 = $spreadsheet->createSheet();
        $sheet2->setTitle('Rekap per Event');
        $sheet2->setCellValue('A1', 'PERSATUAN PERSAUDARAAN SHORINJI KEMPO INDONESIA (PB PERKEMI)');
        $sheet2->setCellValue('A2', 'REKAPITULASI KINERJA KEUANGAN PER EVENT PENATARAN');
        $sheet2->setCellValue('A3', 'Waktu Ekspor: '.now()->translatedFormat('d F Y, H:i').' WIB');
        $sheet2->getStyle('A1:A2')->getFont()->setBold(true)->getColor()->setRGB('0E2747');
        $sheet2->getStyle('A2')->getFont()->setSize(12)->getColor()->setRGB('0B63CE');

        $eventHeaders = ['No', 'Nama Kegiatan Event', 'Pemasukan', 'Pengeluaran', 'Saldo Kas', 'Dana Sponsor', 'Jml Transaksi'];
        foreach ($eventHeaders as $idx => $eh) {
            $sheet2->setCellValue([$idx + 1, 5], $eh);
            $sheet2->getColumnDimensionByColumn($idx + 1)->setAutoSize(true);
        }
        $sheet2->getStyle('A5:G5')->getFont()->setBold(true)->getColor()->setRGB('FFFFFF');
        $sheet2->getStyle('A5:G5')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('0E2747');

        $eventGrouped = $transactions->groupBy('event_id');
        $eRow = 6;
        $no = 1;
        foreach ($eventGrouped as $evId => $evTransactions) {
            $evName = $evTransactions->first()?->event?->name ?? "Event #{$evId}";
            $eInc = (int) $evTransactions->where('type', 'income')->sum('amount');
            $eExp = (int) $evTransactions->where('type', 'expense')->sum('amount');
            $eBal = $eInc - $eExp;
            $eSpon = (int) $evTransactions->where('type', 'income')->where('category', 'sponsorship')->sum('amount');

            $sheet2->setCellValue("A{$eRow}", $no++);
            $sheet2->setCellValue("B{$eRow}", $evName);
            $sheet2->setCellValue("C{$eRow}", $eInc);
            $sheet2->setCellValue("D{$eRow}", $eExp);
            $sheet2->setCellValue("E{$eRow}", $eBal);
            $sheet2->setCellValue("F{$eRow}", $eSpon);
            $sheet2->setCellValue("G{$eRow}", $evTransactions->count());

            $sheet2->getStyle("C{$eRow}:F{$eRow}")->getNumberFormat()->setFormatCode('[$Rp-id-ID] #,##0');
            $sheet2->getStyle("A{$eRow}:G{$eRow}")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN)->getColor()->setRGB('DCE7F3');
            $eRow++;
        }

        // ─── SHEET 3: JURNAL BUKU KAS TRANSAKSI DETAIL ───
        $sheet3 = $spreadsheet->createSheet();
        $sheet3->setTitle('Buku Kas Transaksi');
        $sheet3->setCellValue('A1', 'PERSATUAN PERSAUDARAAN SHORINJI KEMPO INDONESIA (PB PERKEMI)');
        $sheet3->setCellValue('A2', 'JURNAL BUKU KAS & MUTASI TRANSAKSI DETAIL');
        $sheet3->setCellValue('A3', 'Waktu Ekspor: '.now()->translatedFormat('d F Y, H:i').' WIB');
        $sheet3->getStyle('A1:A2')->getFont()->setBold(true)->getColor()->setRGB('0E2747');
        $sheet3->getStyle('A2')->getFont()->setSize(12)->getColor()->setRGB('0B63CE');

        $headers = ['No', 'Event', 'Tanggal', 'Jenis', 'Kategori', 'Uraian', 'Sponsor', 'Penerimaan (Debit)', 'Pengeluaran (Kredit)', 'Saldo Berjalan', 'Bukti Nota', 'Dicatat Oleh'];
        foreach ($headers as $index => $header) {
            $sheet3->setCellValue([$index + 1, 5], $header);
            $sheet3->getColumnDimensionByColumn($index + 1)->setAutoSize(true);
        }
        $sheet3->getStyle('A5:L5')->getFont()->setBold(true)->getColor()->setRGB('FFFFFF');
        $sheet3->getStyle('A5:L5')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('0E2747');
        $sheet3->freezePane('A6');
        $sheet3->setAutoFilter('A5:L5');

        $runningBalance = 0;
        foreach ($transactions as $index => $entry) {
            $rowNum = $index + 6;
            $debit = $entry->type === 'income' ? $entry->amount : 0;
            $kredit = $entry->type === 'expense' ? $entry->amount : 0;
            $runningBalance += ($debit - $kredit);

            $this->writeRow($sheet3, $rowNum, [
                $index + 1,
                $entry->event?->name ?? '-',
                $entry->occurred_on->format('d/m/Y'),
                $entry->type === 'income' ? 'Pemasukan' : 'Pengeluaran',
                $categoryLabels[$entry->category] ?? ucfirst($entry->category),
                $entry->description,
                $entry->sponsor_name ?? '-',
                $debit > 0 ? $debit : '-',
                $kredit > 0 ? $kredit : '-',
                $runningBalance,
                $entry->evidence_path ? 'Ada Lampiran' : 'Tidak Ada',
                $entry->creator?->name ?? '-',
            ]);
            $sheet3->getStyle("H{$rowNum}:J{$rowNum}")->getNumberFormat()->setFormatCode('[$Rp-id-ID] #,##0');
        }

        $spreadsheet->setActiveSheetIndex(0);

        $path = tempnam(sys_get_temp_dir(), 'master_finance_').'.xlsx';
        (new Xlsx($spreadsheet))->save($path);
        $spreadsheet->disconnectWorksheets();
        $filename = 'master-laporan-keuangan-'.now()->format('Ymd-His').'.xlsx';

        return response()->download($path, $filename, ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])->deleteFileAfterSend(true);
    }

    private function workbook(Event $event, string $title, string $sheetTitle): Spreadsheet
    {
        $spreadsheet = new Spreadsheet;
        $spreadsheet->getProperties()->setCreator('PB PERKEMI - Pustaka Penataran')->setTitle("{$title} — {$event->name}");
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle($sheetTitle);
        $this->documentHeading($sheet, $event, $title);

        return $spreadsheet;
    }

    private function documentHeading(Worksheet $sheet, Event $event, string $title): void
    {
        $sheet->setCellValue('A1', 'PERSATUAN PERSAUDARAAN SHORINJI KEMPO INDONESIA (PB PERKEMI)');
        $sheet->setCellValue('A2', $title);
        $sheet->setCellValue('A3', $event->name);
        $sheet->setCellValue('A4', "{$event->date_formatted} | {$event->place} | {$event->organizer}");
        $sheet->setCellValue('A5', 'Waktu ekspor: '.now()->translatedFormat('d F Y, H:i').' WIB');
        $sheet->getStyle('A1:A3')->getFont()->setBold(true)->getColor()->setRGB('0E2747');
        $sheet->getStyle('A2')->getFont()->setSize(14)->getColor()->setRGB('0B63CE');
        $sheet->getStyle('A4:A5')->getFont()->getColor()->setRGB('6B7C93');
    }

    /** @param array<int, string> $headers */
    private function headers(Worksheet $sheet, array $headers): void
    {
        foreach ($headers as $index => $header) {
            $sheet->setCellValue([$index + 1, 7], $header);
            $sheet->getColumnDimensionByColumn($index + 1)->setAutoSize(true);
        }
        $last = $sheet->getHighestColumn(7);
        $sheet->getStyle("A7:{$last}7")->getFont()->setBold(true)->getColor()->setRGB('FFFFFF');
        $sheet->getStyle("A7:{$last}7")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('0E2747');
        $sheet->getStyle("A7:{$last}7")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->freezePane('A8');
        $sheet->setAutoFilter("A7:{$last}7");
    }

    /** @param array<int, mixed> $values */
    private function writeRow(Worksheet $sheet, int $row, array $values): void
    {
        foreach ($values as $index => $value) {
            $sheet->setCellValue([$index + 1, $row], $value);
        }
        $last = $sheet->getHighestColumn($row);
        $sheet->getStyle("A{$row}:{$last}{$row}")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN)->getColor()->setRGB('DCE7F3');
        if ($row % 2 === 1) {
            $sheet->getStyle("A{$row}:{$last}{$row}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('F8FBFF');
        }
    }

    private function registrationStatus(EventParticipant $enrollment): string
    {
        if ($enrollment->registrationForm?->status === 'verified') {
            return 'Terverifikasi';
        }

        return $enrollment->checked_in_at ? 'Check-in' : ($enrollment->registrationForm?->status ?? 'Belum');
    }

    /** @param Collection<int, mixed> $sessions
     * @param  Collection<int, int>  $presentSessionIds
     * @param  array<int, string>  $codes
     */
    private function stageAttendance(Collection $sessions, Collection $presentSessionIds, array $codes, bool $excludeStages = false): string
    {
        $stage = $sessions->filter(function ($session) use ($codes, $excludeStages) {
            $code = (string) ($session->session_type_code ?? '');
            $topic = strtolower((string) ($session->topic ?? ''));
            $isExam = $code === 'UJIAN' || str_contains($topic, 'ujian') || ! empty($session->cbt_exam_package_id);
            $isClosing = $code === 'PENUTUPAN' || str_contains($topic, 'penutupan');
            $isArrival = $code === 'KEHADIRAN_AWAL' || str_contains($topic, 'kedatangan');

            if ($excludeStages) {
                return ! $isArrival && ! $isExam && ! $isClosing;
            }

            if (in_array('UJIAN', $codes, true)) {
                return $isExam;
            }
            if (in_array('PENUTUPAN', $codes, true)) {
                return $isClosing;
            }

            return in_array($code, $codes, true);
        });

        if ($stage->isEmpty()) {
            return 'Tidak ada sesi';
        }
        $present = $stage->whereIn('id', $presentSessionIds)->count();

        return "{$present}/{$stage->count()}";
    }

    private function download(Spreadsheet $spreadsheet, Event $event, string $prefix): BinaryFileResponse
    {
        $path = tempnam(sys_get_temp_dir(), 'event_report_').'.xlsx';
        (new Xlsx($spreadsheet))->save($path);
        $spreadsheet->disconnectWorksheets();
        $filename = $prefix.'-'.Str::slug($event->name).'-'.now()->format('Ymd-His').'.xlsx';

        return response()->download($path, $filename, ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])->deleteFileAfterSend(true);
    }
}
