import { Link } from '@inertiajs/react';
import Button from '../../../../Components/ui/Button';
import { rupiah } from './financeShared';
import { useFinancePage } from './FinancePageContext';

export default function FinanceEventsTab() {
    const {
        eventSummaries,
    } = useFinancePage();

    return (
        <section aria-labelledby="event-summaries-heading" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 id="event-summaries-heading" className="font-display text-lg font-semibold text-[#0A3F82]">
                        Performa Keuangan Tiap Event Penataran
                    </h3>
                    <p className="text-xs text-[#6B7C93]">
                        Perbandingan realisasi anggaran dan pembukuan antar kegiatan yang mencatat keuangan.
                    </p>
                </div>
            </div>

            <div className="overflow-hidden border border-[#DCE7F3] bg-white shadow-2xs">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[780px] text-left text-sm">
                        <thead className="bg-[#EAF5FF] text-[#0A3F82]">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Nama Event</th>
                                <th className="px-4 py-3 font-semibold">Waktu & Tempat</th>
                                <th className="px-4 py-3 font-semibold">Total Pemasukan</th>
                                <th className="px-4 py-3 font-semibold">Total Pengeluaran</th>
                                <th className="px-4 py-3 font-semibold">Saldo Kas</th>
                                <th className="px-4 py-3 font-semibold">Dana Sponsor</th>
                                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DCE7F3]">
                            {eventSummaries.map((ev) => (
                                <tr key={ev.id} className="hover:bg-[#F8FBFF]/60 transition-colors">
                                    <td className="max-w-64 px-4 py-3 font-medium text-[#112743]">
                                        {ev.name}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-[#6B7C93]">
                                        {ev.date} · {ev.location}
                                    </td>
                                    <td className="px-4 py-3 font-semibold tabular-nums text-[#16785B]">
                                        {rupiah(ev.income)}
                                    </td>
                                    <td className="px-4 py-3 font-semibold tabular-nums text-[#B93664]">
                                        {rupiah(ev.expense)}
                                    </td>
                                    <td className={`px-4 py-3 font-semibold tabular-nums ${ev.balance >= 0 ? 'text-[#0E2747]' : 'text-rose-600'}`}>
                                        {rupiah(ev.balance)}
                                    </td>
                                    <td className="px-4 py-3 tabular-nums text-[#7957D5] text-xs font-medium">
                                        {ev.sponsor_amount > 0 ? rupiah(ev.sponsor_amount) : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button
                                            as={Link}
                                            href={`/admin/event/${ev.id}/laporan?bagian=finance`}
                                            size="sm"
                                            variant="outline"
                                        >
                                            Buka Laporan
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
