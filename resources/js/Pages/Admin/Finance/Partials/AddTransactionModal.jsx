import { useForm } from '@inertiajs/react';
import { Receipt } from 'lucide-react';
import Modal from '../../../../Components/ui/Modal';
import Button from '../../../../Components/ui/Button';
import Select from '../../../../Components/ui/Select';
import Input from '../../../../Components/ui/Input';
import Textarea from '../../../../Components/ui/Textarea';
import FileInput from '../../../../Components/ui/FileInput';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from './financeShared';

// ─── Add Transaction Modal ───────────────────────────────────────────────────
export default function AddTransactionModal({ isOpen, onClose, events = [] }) {
    const form = useForm({
        event_id: '',
        type: 'expense',
        category: 'consumption',
        description: '',
        sponsor_name: '',
        amount: '',
        occurred_on: new Date().toISOString().slice(0, 10),
        evidence: null,
    });

    const categoryOptions = form.data.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    const handleTypeChange = (e) => {
        const newType = e.target.value;
        const defaultCat = newType === 'income' ? 'sponsorship' : 'consumption';
        form.setData({ ...form.data, type: newType, category: defaultCat, sponsor_name: '' });
    };

    const handleCategoryChange = (e) => {
        form.setData({ ...form.data, category: e.target.value, sponsor_name: '' });
    };

    const handleClose = () => {
        if (!form.processing) {
            form.reset();
            form.clearErrors();
            onClose();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post('/admin/keuangan/transaksi', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                form.clearErrors();
                onClose();
            },
            onError: () => {
                window.setTimeout(() => document.querySelector('[aria-invalid="true"]')?.focus(), 0);
            },
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Tambah Transaksi Keuangan"
            description="Catat transaksi pemasukan atau pengeluaran untuk kegiatan penataran yang terpilih."
            size="md"
            isProcessing={form.processing}
            onSubmit={handleSubmit}
            footer={
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={form.processing}
                        className="px-4 py-2 text-sm font-medium text-[#6B7C93] hover:text-[#112743] disabled:opacity-50 transition-colors focus-visible:outline-2 focus-visible:outline-[#0B63CE]"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#0B63CE] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0A3F82] disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                    >
                        {form.processing ? (
                            <>
                                <span className="inline-block size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
                                Menyimpan…
                            </>
                        ) : (
                            <>
                                <Receipt className="size-4" aria-hidden="true" />
                                Simpan Transaksi
                            </>
                        )}
                    </button>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Event selector */}
                <div>
                    <label htmlFor="modal-event-id" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#112743]">
                        Kegiatan / Event <span className="text-[#FA5252] font-bold" aria-hidden="true">*</span>
                    </label>
                    <select
                        id="modal-event-id"
                        name="event_id"
                        value={form.data.event_id}
                        onChange={(e) => form.setData('event_id', e.target.value)}
                        required
                        disabled={form.processing}
                        aria-invalid={form.errors.event_id ? 'true' : 'false'}
                        className={`min-h-11 w-full appearance-none rounded-lg border bg-white px-3.5 py-2 text-sm text-[#112743] transition-colors focus:outline-none focus:ring-3 disabled:bg-[#F8FBFF] disabled:cursor-not-allowed ${form.errors.event_id ? 'border-[#FA5252] focus:border-[#FA5252] focus:ring-[#FA5252]/20' : 'border-[#DCE7F3] hover:border-[#0B63CE]/50 focus:border-[#0B63CE] focus:ring-[#0B63CE]/20'}`}
                    >
                        <option value="">— Pilih kegiatan event —</option>
                        {events.map((ev) => (
                            <option key={ev.id} value={ev.id}>{ev.name}</option>
                        ))}
                    </select>
                    {form.errors.event_id && (
                        <p className="mt-1 text-xs font-medium text-[#DD4D7C]">{form.errors.event_id}</p>
                    )}
                </div>

                {/* Type + Category (2 cols) */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="modal-type" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#112743]">
                            Jenis Transaksi <span className="text-[#FA5252] font-bold" aria-hidden="true">*</span>
                        </label>
                        <select
                            id="modal-type"
                            name="type"
                            value={form.data.type}
                            onChange={handleTypeChange}
                            disabled={form.processing}
                            aria-invalid={form.errors.type ? 'true' : 'false'}
                            className={`min-h-11 w-full appearance-none rounded-lg border bg-white px-3.5 py-2 text-sm text-[#112743] transition-colors focus:outline-none focus:ring-3 disabled:bg-[#F8FBFF] disabled:cursor-not-allowed ${form.errors.type ? 'border-[#FA5252] focus:border-[#FA5252] focus:ring-[#FA5252]/20' : 'border-[#DCE7F3] hover:border-[#0B63CE]/50 focus:border-[#0B63CE] focus:ring-[#0B63CE]/20'}`}
                        >
                            <option value="income">Pemasukan</option>
                            <option value="expense">Pengeluaran</option>
                        </select>
                        {form.errors.type && (
                            <p className="mt-1 text-xs font-medium text-[#DD4D7C]">{form.errors.type}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="modal-category" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#112743]">
                            Kategori <span className="text-[#FA5252] font-bold" aria-hidden="true">*</span>
                        </label>
                        <select
                            id="modal-category"
                            name="category"
                            value={form.data.category}
                            onChange={handleCategoryChange}
                            disabled={form.processing}
                            aria-invalid={form.errors.category ? 'true' : 'false'}
                            className={`min-h-11 w-full appearance-none rounded-lg border bg-white px-3.5 py-2 text-sm text-[#112743] transition-colors focus:outline-none focus:ring-3 disabled:bg-[#F8FBFF] disabled:cursor-not-allowed ${form.errors.category ? 'border-[#FA5252] focus:border-[#FA5252] focus:ring-[#FA5252]/20' : 'border-[#DCE7F3] hover:border-[#0B63CE]/50 focus:border-[#0B63CE] focus:ring-[#0B63CE]/20'}`}
                        >
                            {categoryOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        {form.errors.category && (
                            <p className="mt-1 text-xs font-medium text-[#DD4D7C]">{form.errors.category}</p>
                        )}
                    </div>
                </div>

                {/* Sponsor name — only when category=sponsorship */}
                {form.data.category === 'sponsorship' && (
                    <Input
                        label="Nama Sponsor"
                        name="sponsor_name"
                        id="modal-sponsor-name"
                        value={form.data.sponsor_name}
                        onChange={(e) => form.setData('sponsor_name', e.target.value)}
                        placeholder="Nama perusahaan / instansi sponsor"
                        required
                        disabled={form.processing}
                        error={form.errors.sponsor_name}
                    />
                )}

                {/* Description */}
                <div>
                    <label htmlFor="modal-description" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#112743]">
                        Uraian Transaksi <span className="text-[#FA5252] font-bold" aria-hidden="true">*</span>
                    </label>
                    <textarea
                        id="modal-description"
                        name="description"
                        rows={2}
                        value={form.data.description}
                        onChange={(e) => form.setData('description', e.target.value)}
                        placeholder="Keterangan singkat transaksi ini…"
                        required
                        disabled={form.processing}
                        aria-invalid={form.errors.description ? 'true' : 'false'}
                        className={`min-h-[4.5rem] w-full resize-y rounded-lg border bg-white px-3.5 py-2 text-sm text-[#112743] placeholder-[#6B7C93]/60 transition-colors focus:outline-none focus:ring-3 disabled:bg-[#F8FBFF] disabled:cursor-not-allowed ${form.errors.description ? 'border-[#FA5252] focus:border-[#FA5252] focus:ring-[#FA5252]/20' : 'border-[#DCE7F3] hover:border-[#0B63CE]/50 focus:border-[#0B63CE] focus:ring-[#0B63CE]/20'}`}
                    />
                    {form.errors.description && (
                        <p className="mt-1 text-xs font-medium text-[#DD4D7C]">{form.errors.description}</p>
                    )}
                </div>

                {/* Amount + Date (2 cols) */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="modal-amount" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#112743]">
                            Nominal (Rp) <span className="text-[#FA5252] font-bold" aria-hidden="true">*</span>
                        </label>
                        <input
                            id="modal-amount"
                            name="amount"
                            type="number"
                            min="1"
                            step="1"
                            value={form.data.amount}
                            onChange={(e) => form.setData('amount', e.target.value)}
                            placeholder="Contoh: 500000"
                            required
                            disabled={form.processing}
                            aria-invalid={form.errors.amount ? 'true' : 'false'}
                            className={`min-h-11 w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-[#112743] placeholder-[#6B7C93]/60 transition-colors focus:outline-none focus:ring-3 disabled:bg-[#F8FBFF] disabled:cursor-not-allowed ${form.errors.amount ? 'border-[#FA5252] focus:border-[#FA5252] focus:ring-[#FA5252]/20' : 'border-[#DCE7F3] hover:border-[#0B63CE]/50 focus:border-[#0B63CE] focus:ring-[#0B63CE]/20'}`}
                        />
                        {form.errors.amount && (
                            <p className="mt-1 text-xs font-medium text-[#DD4D7C]">{form.errors.amount}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="modal-occurred-on" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#112743]">
                            Tanggal Transaksi <span className="text-[#FA5252] font-bold" aria-hidden="true">*</span>
                        </label>
                        <input
                            id="modal-occurred-on"
                            name="occurred_on"
                            type="date"
                            value={form.data.occurred_on}
                            onChange={(e) => form.setData('occurred_on', e.target.value)}
                            required
                            disabled={form.processing}
                            aria-invalid={form.errors.occurred_on ? 'true' : 'false'}
                            className={`min-h-11 w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-[#112743] transition-colors focus:outline-none focus:ring-3 disabled:bg-[#F8FBFF] disabled:cursor-not-allowed ${form.errors.occurred_on ? 'border-[#FA5252] focus:border-[#FA5252] focus:ring-[#FA5252]/20' : 'border-[#DCE7F3] hover:border-[#0B63CE]/50 focus:border-[#0B63CE] focus:ring-[#0B63CE]/20'}`}
                        />
                        {form.errors.occurred_on && (
                            <p className="mt-1 text-xs font-medium text-[#DD4D7C]">{form.errors.occurred_on}</p>
                        )}
                    </div>
                </div>

                {/* Evidence upload */}
                <FileInput
                    label="Bukti Transaksi (opsional)"
                    name="evidence"
                    id="modal-evidence"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => form.setData('evidence', e.target.files[0] || null)}
                    helperText="PDF, JPG, PNG, atau WebP. Maks. 10 MB."
                    disabled={form.processing}
                    error={form.errors.evidence}
                />
            </div>
        </Modal>
    );
}
