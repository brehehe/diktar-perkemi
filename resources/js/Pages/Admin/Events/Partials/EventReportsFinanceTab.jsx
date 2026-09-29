import FinanceCategoryManager from '../../../../Components/admin/FinanceCategoryManager';
import Button from '../../../../Components/ui/Button';
import FinanceInsights from '../../../../Components/admin/FinanceInsights';
import Input from '../../../../Components/ui/Input';
import Select from '../../../../Components/ui/Select';
import FileInput from '../../../../Components/ui/FileInput';
import { FileSpreadsheet, Pencil, Plus, Tags, Trash2, Shield } from 'lucide-react';
import { useState } from 'react';
import { CATEGORY_LABELS, rupiah, dateLabel, Metric, Empty } from './EventReportsPageShared';
import { useEventReportsPage } from './EventReportsPageContext';

export default function EventReportsFinanceTab() {
    const {
        event,
        finances,
        financeAnalysis,
        financeCategories,
        permissions,
        editingFinance,
        setDeleteTarget,
        financeForm,
        resetFinance,
        editFinance,
        submitFinance,
    } = useEventReportsPage();
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const categoryOptions = financeCategories
        .filter((category) => ['both', financeForm.data.type].includes(category.transaction_type))
        .map((category) => ({ value: category.code, label: category.name }));

    const changeTransactionType = (event) => {
        const type = event.target.value;
        const category = financeCategories.find((item) => ['both', type].includes(item.transaction_type))?.code || '';
        financeForm.setData({ ...financeForm.data, type, category, sponsor_name: '' });
    };

    return (
        <section className="space-y-6" aria-labelledby="finance-title">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF5FF] px-2.5 py-0.5 text-xs font-semibold text-[#0B63CE]">
                            <Shield className="size-3.5" aria-hidden="true" />
                            Kluster Bendahara
                        </span>
                    </div>
                    <h2 id="finance-title" className="mt-2 font-display text-2xl font-semibold text-[#0A3F82]">
                        Laporan Keuangan Kegiatan Penataran
                    </h2>
                    <p className="mt-1 text-sm text-[#6B7C93]">
                        Catat pemasukan dan pengeluaran, unggah bukti transaksi, lalu lihat analisis otomatis berdasarkan data yang tercatat.
                    </p>
                </div>
                <Button
                    as="a"
                    href={`/admin/event/${event.id}/laporan/export/keuangan`}
                    variant="outline"
                    icon={FileSpreadsheet}
                >
                    Ekspor Excel Keuangan
                </Button>
            </div>

            {/* Financial Totals */}
            <div className="grid gap-px border border-[#DCE7F3] bg-[#DCE7F3] lg:grid-cols-3">
                <Metric label="Total Pemasukan" value={rupiah(financeAnalysis.income)} tone="green" />
                <Metric label="Total Pengeluaran" value={rupiah(financeAnalysis.expense)} tone="rose" />
                <Metric label="Saldo Kas Tercatat" value={rupiah(financeAnalysis.balance)} tone="navy" />
            </div>

            <FinanceInsights analysis={financeAnalysis} eventId={event.id} />

            {/* Transaction Management: Table & Form */}
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
                <div className="space-y-4">
                    {finances.length === 0 ? (
                        <Empty>
                            Belum ada transaksi. Bendahara dapat mulai mencatat pemasukan, dana sponsor, atau pengeluaran kegiatan.
                        </Empty>
                    ) : (
                        <div className="overflow-x-auto border border-[#DCE7F3] bg-white shadow-2xs">
                            <table className="w-full min-w-[760px] text-left text-sm">
                                <thead className="bg-[#EAF5FF] text-[#0A3F82]">
                                    <tr>
                                        {['Tanggal', 'Uraian & Sponsor', 'Kategori', 'Nominal', 'Bukti / Kwitansi', 'Aksi'].map((head) => (
                                            <th key={head} className="px-4 py-3 font-semibold">{head}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#DCE7F3]">
                                    {finances.map((entry) => (
                                        <tr key={entry.id} className="hover:bg-[#F8FBFF]/60 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap text-xs text-[#6B7C93]">
                                                {dateLabel(entry.occurred_on)}
                                            </td>
                                            <td className="max-w-72 px-4 py-3">
                                                <p className="break-words font-medium text-[#112743]">{entry.description}</p>
                                                {entry.sponsor_name && (
                                                    <p className="text-xs font-semibold text-[#7957D5]">
                                                        Sponsor: {entry.sponsor_name}
                                                    </p>
                                                )}
                                                <p className="text-xs text-[#6B7C93]">{entry.creator_name}</p>
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
                                                {entry.evidence_url ? (
                                                    <a
                                                        href={entry.evidence_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B63CE] hover:underline"
                                                    >
                                                        <FileSpreadsheet className="size-3.5" aria-hidden="true" />
                                                        Unduh Bukti
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-[#6B7C93]">Belum ada</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {permissions.manage_finance && (
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => editFinance(entry)}
                                                            aria-label={`Edit ${entry.description}`}
                                                            className="inline-flex min-h-9 min-w-9 items-center justify-center rounded text-[#0B63CE] hover:bg-[#EAF5FF]"
                                                        >
                                                            <Pencil className="size-4" aria-hidden="true" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeleteTarget({
                                                                url: `/admin/event/${event.id}/laporan/keuangan/${entry.id}`,
                                                                label: entry.description,
                                                            })}
                                                            aria-label={`Hapus ${entry.description}`}
                                                            className="inline-flex min-h-9 min-w-9 items-center justify-center rounded text-[#DD4D7C] hover:bg-rose-50"
                                                        >
                                                            <Trash2 className="size-4" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Form Input Keuangan (Bendahara) */}
                {permissions.manage_finance && (
                    <form
                        onSubmit={submitFinance}
                        className="border border-[#DCE7F3] bg-white p-5 sm:p-6 shadow-2xs self-start"
                    >
                        <div className="flex items-center justify-between border-b border-[#DCE7F3] pb-3">
                            <h3 className="font-display text-lg font-semibold text-[#0E2747]">
                                {editingFinance ? 'Edit Transaksi Keuangan' : 'Catat Transaksi Keuangan'}
                            </h3>
                            <span className="text-xs text-[#6B7C93]">
                                {editingFinance ? 'Perbarui data' : 'Formulir Bendahara'}
                            </span>
                        </div>

                        <div className="mt-4 space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Select
                                    name="type"
                                    label="Jenis Transaksi"
                                    value={financeForm.data.type}
                                    onChange={changeTransactionType}
                                    options={[
                                        { value: 'income', label: 'Pemasukan' },
                                        { value: 'expense', label: 'Pengeluaran' },
                                    ]}
                                    error={financeForm.errors.type}
                                    autoComplete="off"
                                />
                                <Select
                                    name="category"
                                    label="Kategori"
                                    value={financeForm.data.category}
                                    onChange={(e) => financeForm.setData('category', e.target.value)}
                                    options={categoryOptions}
                                    error={financeForm.errors.category}
                                    autoComplete="off"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowCategoryManager(true)}
                                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] px-3 text-xs font-semibold text-[#0B63CE] transition-colors hover:border-[#0B63CE] hover:bg-[#EAF5FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                            >
                                <Tags className="size-4" aria-hidden="true" />
                                Kelola Master Kategori
                            </button>

                            <Input
                                name="description"
                                label="Uraian Transaksi"
                                value={financeForm.data.description}
                                onChange={(e) => financeForm.setData('description', e.target.value)}
                                error={financeForm.errors.description}
                                placeholder="Contoh: Pembayaran akomodasi hotel kenshi"
                                autoComplete="off"
                                required
                            />

                            <div className="grid gap-4 sm:grid-cols-2">
                                <Input
                                    name="amount"
                                    label="Nominal (Rp)"
                                    type="number"
                                    inputMode="numeric"
                                    min="1"
                                    value={financeForm.data.amount}
                                    onChange={(e) => financeForm.setData('amount', e.target.value)}
                                    error={financeForm.errors.amount}
                                    placeholder="Contoh: 1500000"
                                    autoComplete="off"
                                    required
                                />
                                <Input
                                    name="occurred_on"
                                    label="Tanggal Transaksi"
                                    type="date"
                                    value={financeForm.data.occurred_on}
                                    onChange={(e) => financeForm.setData('occurred_on', e.target.value)}
                                    error={financeForm.errors.occurred_on}
                                    autoComplete="off"
                                    required
                                />
                            </div>

                            <Input
                                name="sponsor_name"
                                label="Nama Sponsor / Mitra (Opsional)"
                                value={financeForm.data.sponsor_name}
                                onChange={(e) => financeForm.setData('sponsor_name', e.target.value)}
                                error={financeForm.errors.sponsor_name}
                                helperText="Diisi jika pemasukan berasal dari sponsor atau pihak ketiga."
                                placeholder="Nama perusahaan / lembaga sponsor"
                                autoComplete="organization"
                            />

                            <FileInput
                                name="evidence"
                                label="Upload Bukti Pembayaran / Kwitansi"
                                accept=".pdf,.jpg,.jpeg,.png,.webp"
                                onChange={(e) => financeForm.setData('evidence', e.target.files[0])}
                                error={financeForm.errors.evidence}
                                helperText="Format: PDF, JPG, PNG (maksimal 5MB)."
                            />
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2 border-t border-[#DCE7F3] pt-4">
                            <Button
                                type="submit"
                                loading={financeForm.processing}
                                icon={Plus}
                            >
                                {editingFinance ? 'Simpan Perubahan' : 'Tambah Transaksi'}
                            </Button>
                            {editingFinance && (
                                <Button type="button" variant="secondary" onClick={resetFinance}>
                                    Batal
                                </Button>
                            )}
                        </div>
                    </form>
                )}
            </div>
            <FinanceCategoryManager
                isOpen={showCategoryManager}
                onClose={() => setShowCategoryManager(false)}
                categories={financeCategories}
            />
        </section>
    );
}
