import EventReportExportCards from '../../../../Components/admin/EventReportExportCards';
import { Metric } from './EventReportsPageShared';
import { useEventReportsPage } from './EventReportsPageContext';
import { useIsProdas } from '../../../../Utils/isProdas';

export default function EventReportsExportsTab() {
    const isProdas = useIsProdas();
    const {
        event,
        outcomesSummary,
        permissions,
    } = useEventReportsPage();

    return (
        <section className="space-y-6" aria-labelledby="exports-title">
            <div>
                <h2 id="exports-title" className="font-display text-2xl font-semibold text-[#0A3F82]">
                    Rekap Hasil, Kedisiplinan & Ekspor Excel
                </h2>
                <p className="mt-1 max-w-3xl text-sm text-[#6B7C93]">
                    {isProdas
                        ? 'Ekspor resmi seluruh data kegiatan Gashuku & UKT sesuai format baku PB PERKEMI.'
                        : 'Ekspor resmi seluruh data kegiatan penataran sesuai format baku PB PERKEMI.'}
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

            <EventReportExportCards eventId={event.id} canViewFinance={permissions.view_finance} />
        </section>
    );
}
