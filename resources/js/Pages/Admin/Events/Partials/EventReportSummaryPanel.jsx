import EventReportExportCards from '../../../../Components/admin/EventReportExportCards';
import { Metric } from './EventReportsTabShared';
import { useEventReportsTab } from './EventReportsTabContext';

export default function EventReportSummaryPanel() {
    const {
        event,
        outcomesSummary,
        permissions,
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

            <EventReportExportCards eventId={event.id} canViewFinance={permissions.view_finance} />
        </section>
    );
}
