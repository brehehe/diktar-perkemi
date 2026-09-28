import Button from '../../../../Components/ui/Button';
import { BarChart3, CalendarCheck, Download, FileCheck2, FileSpreadsheet } from 'lucide-react';
import { Metric } from './EventReportsTabShared';
import { useEventReportsTab } from './EventReportsTabContext';

export default function EventReportSummaryPanel() {
    const {
        event,
        outcomesSummary,
    } = useEventReportsTab();

    return (
        <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 className="font-display text-xl font-semibold text-[#0A3F82]">
                        Rekap Capaian, Kedisiplinan & Ekspor Excel
                    </h3>
                    <p className="mt-1 text-xs text-[#6B7C93]">
                        Ekspor berkas resmi langsung dari database kegiatan untuk keperluan arsip nasional PB PERKEMI.
                    </p>
                </div>
            </div>

            {/* Metrik On-Screen */}
            <div className="grid gap-px border border-[#DCE7F3] bg-[#DCE7F3] sm:grid-cols-2 lg:grid-cols-4">
                <Metric
                    label="Peserta Terdaftar"
                    value={`${outcomesSummary.total_participants || 0} Kenshi`}
                    tone="blue"
                />
                <Metric
                    label="Peserta Lulus"
                    value={`${outcomesSummary.passed_count || 0} Kenshi`}
                    tone="green"
                    helper={outcomesSummary.total_participants > 0 ? `${Math.round((outcomesSummary.passed_count / outcomesSummary.total_participants) * 100)}% kelulusan` : null}
                />
                <Metric
                    label="Total Kehadiran"
                    value={`${outcomesSummary.total_attendances || 0} Sesi`}
                    tone="navy"
                />
                <Metric
                    label="Catatan Keterlambatan"
                    value={`${outcomesSummary.late_count || 0} Kali`}
                    tone="rose"
                    helper="Tercatat pada absensi harian"
                />
            </div>

            {/* 4 Kartu Ekspor */}
            <div className="grid gap-px overflow-hidden border border-[#DCE7F3] bg-[#DCE7F3] sm:grid-cols-2 lg:grid-cols-4">
                <article className="flex flex-col bg-white p-5">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-[#0B63CE]">
                        <CalendarCheck className="size-5" aria-hidden="true" />
                    </div>
                    <h4 className="mt-3 font-display text-base font-semibold text-[#0E2747]">
                        1. Absensi per Tahapan
                    </h4>
                    <p className="mt-2 flex-1 text-xs leading-5 text-[#6B7C93]">
                        Rekap kehadiran registrasi awal, kelas harian, ujian, sampai seremoni penutupan.
                    </p>
                    <Button
                        as="a"
                        href={`/admin/event/${event.id}/laporan/export/absensi`}
                        className="mt-4 self-start"
                        size="sm"
                        variant="outline"
                        icon={Download}
                    >
                        Ekspor Excel
                    </Button>
                </article>

                <article className="flex flex-col bg-white p-5">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-[#20A47A]">
                        <BarChart3 className="size-5" aria-hidden="true" />
                    </div>
                    <h4 className="mt-3 font-display text-base font-semibold text-[#0E2747]">
                        2. Hasil & Kedisiplinan
                    </h4>
                    <p className="mt-2 flex-1 text-xs leading-5 text-[#6B7C93]">
                        Nilai CBT tertinggi, rerata ujian praktik, kelulusan, dan catatan kedisiplinan hadir.
                    </p>
                    <Button
                        as="a"
                        href={`/admin/event/${event.id}/laporan/export/capaian`}
                        className="mt-4 self-start"
                        size="sm"
                        variant="outline"
                        icon={Download}
                    >
                        Ekspor Excel
                    </Button>
                </article>

                <article className="flex flex-col bg-white p-5">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-purple-50 text-[#7957D5]">
                        <FileCheck2 className="size-5" aria-hidden="true" />
                    </div>
                    <h4 className="mt-3 font-display text-base font-semibold text-[#0E2747]">
                        3. Kelengkapan & CBT
                    </h4>
                    <p className="mt-2 flex-1 text-xs leading-5 text-[#6B7C93]">
                        Berkas peserta (foto, formulir, pakta) & riwayat seluruh percobaan CBT (2 sheet).
                    </p>
                    <Button
                        as="a"
                        href={`/admin/event/${event.id}/laporan/export/kelengkapan-cbt`}
                        className="mt-4 self-start"
                        size="sm"
                        variant="outline"
                        icon={Download}
                    >
                        Ekspor Excel
                    </Button>
                </article>

                <article className="flex flex-col bg-white p-5">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-amber-50 text-[#EE9B25]">
                        <FileSpreadsheet className="size-5" aria-hidden="true" />
                    </div>
                    <h4 className="mt-3 font-display text-base font-semibold text-[#0E2747]">
                        4. Laporan Keuangan
                    </h4>
                    <p className="mt-2 flex-1 text-xs leading-5 text-[#6B7C93]">
                        Pemasukan, pengeluaran, dana sponsor, bukti transfer, dan kwitansi penerimaan.
                    </p>
                    <Button
                        as="a"
                        href={`/admin/event/${event.id}/laporan/export/keuangan`}
                        className="mt-4 self-start"
                        size="sm"
                        variant="outline"
                        icon={Download}
                    >
                        Ekspor Excel
                    </Button>
                </article>
            </div>
        </section>
    );
}
