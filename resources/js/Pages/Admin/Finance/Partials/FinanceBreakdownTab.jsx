import { rupiah, CATEGORY_LABELS } from './financeShared';
import { useFinancePage } from './FinancePageContext';

export default function FinanceBreakdownTab() {
    const {
        categoryBreakdown,
        totals,
    } = useFinancePage();

    return (
        <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Pos Pemasukan */}
                <div className="border border-[#DCE7F3] bg-white p-5 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-[#DCE7F3] pb-3 mb-4">
                        <div>
                            <h3 className="font-display text-base font-semibold text-[#16785B]">
                                Pos Anggaran Pemasukan
                            </h3>
                            <p className="text-xs text-[#6B7C93]">Rincian realisasi penerimaan per mata anggaran</p>
                        </div>
                        <span className="text-xs font-semibold text-[#16785B]">
                            Total: {rupiah(totals.income)}
                        </span>
                    </div>

                    <table className="w-full text-left text-xs">
                        <thead className="bg-[#F8FBFF] text-[#0A3F82]">
                            <tr>
                                <th className="px-3 py-2 font-semibold">Pos Kategori</th>
                                <th className="px-3 py-2 text-center font-semibold">Frekuensi</th>
                                <th className="px-3 py-2 text-right font-semibold">Total Realisasi</th>
                                <th className="px-3 py-2 text-right font-semibold">Porsi (%)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DCE7F3]">
                            {(categoryBreakdown.income || []).length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-6 text-center text-[#6B7C93]">
                                        Belum ada catatan pemasukan
                                    </td>
                                </tr>
                            ) : (
                                (categoryBreakdown.income || []).map((cat) => {
                                    const porsi = totals.income > 0 ? Math.round((cat.total / totals.income) * 100) : 0;
                                    return (
                                        <tr key={cat.category} className="hover:bg-[#F8FBFF]">
                                            <td className="px-3 py-2.5 font-medium text-[#112743]">
                                                {CATEGORY_LABELS[cat.category] || cat.category}
                                            </td>
                                            <td className="px-3 py-2.5 text-center text-[#6B7C93] tabular-nums">
                                                {cat.count} trx
                                            </td>
                                            <td className="px-3 py-2.5 text-right font-semibold text-[#16785B] tabular-nums">
                                                {rupiah(cat.total)}
                                            </td>
                                            <td className="px-3 py-2.5 text-right text-[#6B7C93] tabular-nums font-mono">
                                                {porsi}%
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pos Pengeluaran */}
                <div className="border border-[#DCE7F3] bg-white p-5 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-[#DCE7F3] pb-3 mb-4">
                        <div>
                            <h3 className="font-display text-base font-semibold text-[#B93664]">
                                Pos Anggaran Pengeluaran
                            </h3>
                            <p className="text-xs text-[#6B7C93]">Rincian realisasi belanja operasional kegiatan</p>
                        </div>
                        <span className="text-xs font-semibold text-[#B93664]">
                            Total: {rupiah(totals.expense)}
                        </span>
                    </div>

                    <table className="w-full text-left text-xs">
                        <thead className="bg-[#F8FBFF] text-[#0A3F82]">
                            <tr>
                                <th className="px-3 py-2 font-semibold">Pos Kategori</th>
                                <th className="px-3 py-2 text-center font-semibold">Frekuensi</th>
                                <th className="px-3 py-2 text-right font-semibold">Total Belanja</th>
                                <th className="px-3 py-2 text-right font-semibold">Porsi (%)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DCE7F3]">
                            {(categoryBreakdown.expense || []).length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-6 text-center text-[#6B7C93]">
                                        Belum ada catatan pengeluaran
                                    </td>
                                </tr>
                            ) : (
                                (categoryBreakdown.expense || []).map((cat) => {
                                    const porsi = totals.expense > 0 ? Math.round((cat.total / totals.expense) * 100) : 0;
                                    return (
                                        <tr key={cat.category} className="hover:bg-[#F8FBFF]">
                                            <td className="px-3 py-2.5 font-medium text-[#112743]">
                                                {CATEGORY_LABELS[cat.category] || cat.category}
                                            </td>
                                            <td className="px-3 py-2.5 text-center text-[#6B7C93] tabular-nums">
                                                {cat.count} trx
                                            </td>
                                            <td className="px-3 py-2.5 text-right font-semibold text-[#B93664] tabular-nums">
                                                {rupiah(cat.total)}
                                            </td>
                                            <td className="px-3 py-2.5 text-right text-[#6B7C93] tabular-nums font-mono">
                                                {porsi}%
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Neraca Kas Bersih Box */}
            <div className="rounded-xl border border-[#DCE7F3] bg-white p-6 shadow-2xs">
                <h3 className="font-display text-base font-semibold text-[#0E2747] mb-2">
                    Rekapitulasi Neraca Kas Penataran
                </h3>
                <div className="grid gap-4 sm:grid-cols-3 pt-2">
                    <div className="rounded-lg bg-[#F8FBFF] p-4 border border-[#DCE7F3]">
                        <p className="text-xs text-[#6B7C93] uppercase font-semibold">Total Penerimaan (A)</p>
                        <p className="mt-1 text-xl font-bold text-[#16785B] tabular-nums">{rupiah(totals.income)}</p>
                    </div>
                    <div className="rounded-lg bg-[#F8FBFF] p-4 border border-[#DCE7F3]">
                        <p className="text-xs text-[#6B7C93] uppercase font-semibold">Total Pengeluaran (B)</p>
                        <p className="mt-1 text-xl font-bold text-[#B93664] tabular-nums">{rupiah(totals.expense)}</p>
                    </div>
                    <div className={`rounded-lg p-4 border ${totals.balance >= 0 ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'}`}>
                        <p className="text-xs uppercase font-semibold text-[#6B7C93]">Saldo Bersih (A − B)</p>
                        <p className={`mt-1 text-xl font-bold tabular-nums ${totals.balance >= 0 ? 'text-[#16785B]' : 'text-rose-600'}`}>
                            {rupiah(totals.balance)}
                        </p>
                        <span className="text-[11px] font-medium text-[#6B7C93]">
                            Status: {totals.balance >= 0 ? 'Kondisi Kas Sehat (Surplus)' : 'Defisit Anggaran'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
