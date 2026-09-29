import { Link } from '@inertiajs/react';
import Button from '../../../../Components/ui/Button';
import Pagination from '../../../../Components/ui/Pagination';
import { FileSpreadsheet, Plus, Receipt, Trash2, Search, RefreshCw, Filter } from 'lucide-react';
import { rupiah, dateLabel, CATEGORY_LABELS } from './financeShared';
import { useFinancePage } from './FinancePageContext';

export default function FinanceJournalTab() {
    const {
        transactions,
        events,
        canCreateTransaction,
        entries,
        setShowAddModal,
        setDeleteTarget,
        filterForm,
        setFilterForm,
        applyFilter,
        resetFilters,
        totals,
        hasActiveFilters,
        financeCategories,
    } = useFinancePage();

    const filteredCategories = financeCategories.filter((category) => (
        !filterForm.type || category.transaction_type === 'both' || category.transaction_type === filterForm.type
    ));

    return (
        <div className="space-y-4">
            {/* Filter Bar Panel */}
            <div className="rounded-xl border border-[#DCE7F3] bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#DCE7F3] pb-3 mb-3">
                    <div className="flex items-center gap-2">
                        <Filter className="size-4 text-[#0B63CE]" aria-hidden="true" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#112743]">
                            Penyaringan Mutasi Transaksi
                        </span>
                    </div>
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-800 transition-colors"
                        >
                            <RefreshCw className="size-3" aria-hidden="true" />
                            Reset Filter
                        </button>
                    )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Event */}
                    <div>
                        <label htmlFor="filter-event" className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#6B7C93]">
                            Kegiatan Event
                        </label>
                        <select
                            id="filter-event"
                            value={filterForm.event}
                            onChange={(e) => {
                                const v = e.target.value;
                                setFilterForm((prev) => ({ ...prev, event: v }));
                                applyFilter({ event: v });
                            }}
                            className="min-h-9 w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-1.5 text-xs text-[#112743] focus:border-[#0B63CE] focus:outline-none focus:ring-2 focus:ring-[#0B63CE]/20"
                        >
                            <option value="">Semua Kegiatan Event</option>
                            {events.map((ev) => (
                                <option key={ev.id} value={ev.id}>{ev.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Jenis Transaksi */}
                    <div>
                        <label htmlFor="filter-type" className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#6B7C93]">
                            Jenis Mutasi
                        </label>
                        <select
                            id="filter-type"
                            value={filterForm.type}
                            onChange={(e) => {
                                const v = e.target.value;
                                setFilterForm((prev) => ({ ...prev, type: v, category: '' }));
                                applyFilter({ type: v, category: '' });
                            }}
                            className="min-h-9 w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-1.5 text-xs text-[#112743] focus:border-[#0B63CE] focus:outline-none focus:ring-2 focus:ring-[#0B63CE]/20"
                        >
                            <option value="">Semua Jenis (Masuk & Keluar)</option>
                            <option value="income">Pemasukan (+)</option>
                            <option value="expense">Pengeluaran (−)</option>
                        </select>
                    </div>

                    {/* Kategori */}
                    <div>
                        <label htmlFor="filter-cat" className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#6B7C93]">
                            Pos Kategori
                        </label>
                        <select
                            id="filter-cat"
                            value={filterForm.category}
                            onChange={(e) => {
                                const v = e.target.value;
                                setFilterForm((prev) => ({ ...prev, category: v }));
                                applyFilter({ category: v });
                            }}
                            className="min-h-9 w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-1.5 text-xs text-[#112743] focus:border-[#0B63CE] focus:outline-none focus:ring-2 focus:ring-[#0B63CE]/20"
                        >
                            <option value="">Semua Kategori</option>
                            {filteredCategories.map((category) => (
                                <option key={category.id} value={category.code}>{category.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Pencarian Kata Kunci */}
                    <div>
                        <label htmlFor="filter-search" className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#6B7C93]">
                            Cari Uraian / Sponsor
                        </label>
                        <div className="relative">
                            <input
                                id="filter-search"
                                type="text"
                                value={filterForm.search}
                                onChange={(e) => setFilterForm((prev) => ({ ...prev, search: e.target.value }))}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') applyFilter({ search: filterForm.search });
                                }}
                                placeholder="Tekan Enter untuk cari…"
                                className="min-h-9 w-full rounded-lg border border-[#DCE7F3] bg-white pl-8 pr-3 py-1.5 text-xs text-[#112743] focus:border-[#0B63CE] focus:outline-none focus:ring-2 focus:ring-[#0B63CE]/20"
                            />
                            <Search className="pointer-events-none absolute left-2.5 top-2.5 size-3.5 text-[#6B7C93]" aria-hidden="true" />
                        </div>
                    </div>
                </div>

                {/* Rentang Tanggal */}
                <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-[#F0F5FA] pt-3 text-xs">
                    <span className="text-[11px] font-semibold text-[#6B7C93] uppercase tracking-wider">
                        Rentang Tanggal:
                    </span>
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={filterForm.start_date}
                            onChange={(e) => setFilterForm((prev) => ({ ...prev, start_date: e.target.value }))}
                            className="rounded border border-[#DCE7F3] bg-white px-2 py-1 text-xs text-[#112743]"
                        />
                        <span className="text-[#6B7C93]">s/d</span>
                        <input
                            type="date"
                            value={filterForm.end_date}
                            onChange={(e) => setFilterForm((prev) => ({ ...prev, end_date: e.target.value }))}
                            className="rounded border border-[#DCE7F3] bg-white px-2 py-1 text-xs text-[#112743]"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => applyFilter({ start_date: filterForm.start_date, end_date: filterForm.end_date, search: filterForm.search })}
                        >
                            Terapkan Tanggal
                        </Button>
                    </div>
                </div>
            </div>

            {/* Summary Bar Hasil Filter */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-[#EAF5FF]/70 px-4 py-2.5 border border-[#BDE0FE]">
                <div className="flex flex-wrap items-center gap-6 text-xs">
                    <div>
                        <span className="text-[#6B7C93]">Masuk:</span>{' '}
                        <span className="font-semibold text-[#16785B] tabular-nums">{rupiah(totals.income)}</span>
                    </div>
                    <div>
                        <span className="text-[#6B7C93]">Keluar:</span>{' '}
                        <span className="font-semibold text-[#B93664] tabular-nums">{rupiah(totals.expense)}</span>
                    </div>
                    <div>
                        <span className="text-[#6B7C93]">Saldo:</span>{' '}
                        <span className={`font-bold tabular-nums ${totals.balance >= 0 ? 'text-[#0E2747]' : 'text-rose-600'}`}>
                            {rupiah(totals.balance)}
                        </span>
                    </div>
                </div>
                <span className="text-xs font-medium text-[#0A3F82]">
                    Menampilkan {entries.length} dari {transactions.total || 0} transaksi
                </span>
            </div>

            {/* Tabel Transaksi */}
            {entries.length === 0 ? (
                <div className="border border-dashed border-[#DCE7F3] bg-[#F8FBFF] p-12 text-center">
                    <Receipt className="mx-auto size-8 text-[#6B7C93]/60 mb-2" aria-hidden="true" />
                    <p className="text-sm font-semibold text-[#112743]">Belum ada transaksi pada cakupan ini</p>
                    <p className="mt-1 text-xs text-[#6B7C93]">Coba ubah filter di atas atau catat transaksi keuangan baru.</p>
                    {canCreateTransaction && (
                        <button
                            type="button"
                            onClick={() => setShowAddModal(true)}
                            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B63CE] hover:text-[#0A3F82] focus-visible:outline-2 focus-visible:outline-[#0B63CE] transition-colors"
                        >
                            <Plus className="size-4" aria-hidden="true" />
                            Catat transaksi sekarang
                        </button>
                    )}
                </div>
            ) : (
                <div className="overflow-hidden border border-[#DCE7F3] bg-white shadow-2xs">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left text-sm">
                            <thead className="bg-[#EAF5FF] text-[#0A3F82]">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Event</th>
                                    <th className="px-4 py-3 font-semibold">Tanggal</th>
                                    <th className="px-4 py-3 font-semibold">Uraian & Keterangan</th>
                                    <th className="px-4 py-3 font-semibold">Pos Kategori</th>
                                    <th className="px-4 py-3 font-semibold">Nominal</th>
                                    <th className="px-4 py-3 font-semibold">Bukti Kwitansi</th>
                                    <th className="px-4 py-3 font-semibold">Pencatat</th>
                                    <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#DCE7F3]">
                                {entries.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-[#F8FBFF]/60 transition-colors">
                                        <td className="max-w-56 px-4 py-3">
                                            <p className="font-medium text-[#112743] line-clamp-2">
                                                {entry.event_name}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-[#6B7C93] font-mono">
                                            {dateLabel(entry.occurred_on)}
                                        </td>
                                        <td className="max-w-64 px-4 py-3">
                                            <p className="break-words text-[#112743]">{entry.description}</p>
                                            {entry.sponsor_name && (
                                                <span className="mt-0.5 inline-block text-[11px] font-medium text-[#7957D5]">
                                                    Sponsor: {entry.sponsor_name}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="inline-flex rounded-full bg-[#EAF5FF] px-2.5 py-0.5 text-xs font-medium text-[#0A3F82]">
                                                {entry.category_name || CATEGORY_LABELS[entry.category] || entry.category}
                                            </span>
                                        </td>
                                        <td className={`px-4 py-3 font-semibold tabular-nums whitespace-nowrap ${entry.type === 'income' ? 'text-[#16785B]' : 'text-[#B93664]'}`}>
                                            {entry.type === 'income' ? '+' : '−'}
                                            {rupiah(entry.amount)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {entry.has_evidence && entry.evidence_url ? (
                                                <a
                                                    href={entry.evidence_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 rounded bg-[#F0F5FA] px-2 py-1 text-xs font-semibold text-[#0B63CE] hover:bg-[#EAF5FF] hover:underline"
                                                    title="Unduh Bukti Dokumen"
                                                >
                                                    <FileSpreadsheet className="size-3.5" aria-hidden="true" />
                                                    Lihat Bukti
                                                </a>
                                            ) : (
                                                <span className="text-xs text-[#6B7C93]">—</span>
                                            )}
                                        </td>
                                        <td className="max-w-40 px-4 py-3 text-xs text-[#6B7C93] truncate">
                                            {entry.creator_name || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button
                                                    as={Link}
                                                    href={`/admin/event/${entry.event_id}/laporan?bagian=finance`}
                                                    size="xs"
                                                    variant="outline"
                                                >
                                                    Laporan
                                                </Button>

                                                {canCreateTransaction && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteTarget(entry)}
                                                        aria-label={`Hapus transaksi ${entry.description}`}
                                                        title="Hapus transaksi"
                                                        className="inline-flex min-h-7 min-w-7 items-center justify-center rounded text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                                                    >
                                                        <Trash2 className="size-3.5" aria-hidden="true" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination pagination={transactions} />
                </div>
            )}
        </div>
    );
}
