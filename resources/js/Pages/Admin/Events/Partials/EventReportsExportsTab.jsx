import Button from '../../../../Components/ui/Button';
import { BarChart3, CalendarCheck, Download, FileCheck2, FileSpreadsheet } from 'lucide-react';
import { Metric } from './EventReportsPageShared';
import { useEventReportsPage } from './EventReportsPageContext';

export default function EventReportsExportsTab() {
    const {
        event,
        outcomesSummary,
    } = useEventReportsPage();

    return (
        <section className="space-y-6" aria-labelledby="exports-title">
            <div>
                <h2 id="exports-title" className="font-display text-2xl font-semibold text-[#0A3F82]">
                    Rekap Hasil, Kedisiplinan & Ekspor Excel
                </h2>
                <p className="mt-1 max-w-3xl text-sm text-[#6B7C93]">
                    Ekspor resmi seluruh data kegiatan penataran sesuai format baku PB PERKEMI.
                </p>
            </div>

            {/* On-screen quick metrics */}
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
                    helper={outcomesSummary.total_participants > 0 ? `${Math.round((outcomesSummary.passed_count / outcomesSummary.total_participants) * 100)}% tingkat kelulusan` : null}
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
                    helper="Tercatat pada absensi sesi"
                />
            </div>

            {/* 4 Official Export Cards */}
            <div className="grid gap-px overflow-hidden border border-[#DCE7F3] bg-[#DCE7F3] sm:grid-cols-2 lg:grid-cols-4">
                <article className="flex flex-col bg-white p-6">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-[#0B63CE]">
                        <CalendarCheck className="size-5" aria-hidden="true" />
                    </div>
                    <h3 className="mt-4 font-display text-base font-semibold text-[#0E2747]">
                        1. Absensi per Tahapan
                    </h3>
                    <p className="mt-2 flex-1 text-xs leading-5 text-[#6B7C93]">
                        Laporan lengkap absensi registrasi, kehadiran kelas harian, ujian, sampai seremoni penutupan beserta persentase.
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

                <article className="flex flex-col bg-white p-6">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-[#20A47A]">
                        <BarChart3 className="size-5" aria-hidden="true" />
                    </div>
                    <h3 className="mt-4 font-display text-base font-semibold text-[#0E2747]">
                        2. Capaian & Kedisiplinan
                    </h3>
                    <p className="mt-2 flex-1 text-xs leading-5 text-[#6B7C93]">
                        Laporan hasil nilai CBT terbaik, rata-rata penilaian praktik, status kelulusan, kedisiplinan hadir, dan ketepatan waktu.
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

                <article className="flex flex-col bg-white p-6">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-purple-50 text-[#7957D5]">
                        <FileCheck2 className="size-5" aria-hidden="true" />
                    </div>
                    <h3 className="mt-4 font-display text-base font-semibold text-[#0E2747]">
                        3. Kelengkapan & Riwayat CBT
                    </h3>
                    <p className="mt-2 flex-1 text-xs leading-5 text-[#6B7C93]">
                        Rekap berkas (foto, formulir, pakta integritas, sertifikat) & riwayat seluruh percobaan ujian CBT dalam 2 lembar sheet.
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

                <article className="flex flex-col bg-white p-6">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-amber-50 text-[#EE9B25]">
                        <FileSpreadsheet className="size-5" aria-hidden="true" />
                    </div>
                    <h3 className="mt-4 font-display text-base font-semibold text-[#0E2747]">
                        4. Laporan Keuangan Event
                    </h3>
                    <p className="mt-2 flex-1 text-xs leading-5 text-[#6B7C93]">
                        Daftar rincian pemasukan, pengeluaran per kategori, kontribusi sponsor, nominal terverifikasi, dan kelengkapan bukti.
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
