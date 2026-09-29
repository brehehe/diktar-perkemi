import { router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AlertDialog from '../ui/AlertDialog';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import Select from '../ui/Select';

const TYPE_LABELS = {
    income: 'Pemasukan',
    expense: 'Pengeluaran',
    both: 'Pemasukan & Pengeluaran',
};

export default function FinanceCategoryManager({ isOpen, onClose, categories = [] }) {
    const [editingCategory, setEditingCategory] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const form = useForm({ name: '', transaction_type: 'expense' });

    const resetForm = () => {
        setEditingCategory(null);
        form.reset();
        form.clearErrors();
    };

    const handleClose = () => {
        if (form.processing || isDeleting) return;
        resetForm();
        onClose();
    };

    const startEditing = (category) => {
        setEditingCategory(category);
        form.setData({ name: category.name, transaction_type: category.transaction_type });
        form.clearErrors();
    };

    const submit = (event) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: resetForm,
            onError: () => window.setTimeout(() => document.querySelector('[aria-invalid="true"]')?.focus(), 0),
        };

        if (editingCategory) {
            form.put(`/admin/keuangan/kategori/${editingCategory.id}`, options);
            return;
        }

        form.post('/admin/keuangan/kategori', options);
    };

    const destroyCategory = () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        router.delete(`/admin/keuangan/kategori/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={handleClose}
                title="Master Kategori Keuangan"
                description="Tambah, ubah, atau hapus kategori yang belum dipakai oleh transaksi."
                size="lg"
                isProcessing={form.processing || isDeleting}
            >
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
                    <div className="min-w-0">
                        <div className="mb-3 flex items-center gap-2">
                            <Tags className="size-4 text-[#0B63CE]" aria-hidden="true" />
                            <h4 className="font-display text-sm font-semibold text-[#0E2747]">Daftar kategori</h4>
                        </div>

                        <div className="overflow-hidden rounded-xl border border-[#DCE7F3]">
                            {categories.length === 0 ? (
                                <p className="p-5 text-sm text-[#6B7C93]">Belum ada kategori keuangan.</p>
                            ) : (
                                <ul className="divide-y divide-[#DCE7F3]">
                                    {categories.map((category) => (
                                        <li key={category.id} className="flex items-center justify-between gap-3 bg-white px-4 py-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-[#112743]">{category.name}</p>
                                                <p className="mt-0.5 text-xs text-[#6B7C93]">
                                                    {TYPE_LABELS[category.transaction_type]} · {category.transactions_count || 0} transaksi
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => startEditing(category)}
                                                    aria-label={`Edit kategori ${category.name}`}
                                                    className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-[#0B63CE] transition-colors hover:bg-[#EAF5FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                                                >
                                                    <Pencil className="size-4" aria-hidden="true" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteTarget(category)}
                                                    disabled={category.transactions_count > 0}
                                                    aria-label={`Hapus kategori ${category.name}`}
                                                    title={category.transactions_count > 0 ? 'Kategori sudah dipakai dan tidak dapat dihapus' : 'Hapus kategori'}
                                                    className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-[#DD4D7C] transition-colors hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DD4D7C] disabled:cursor-not-allowed disabled:opacity-35"
                                                >
                                                    <Trash2 className="size-4" aria-hidden="true" />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <form onSubmit={submit} className="self-start rounded-xl border border-[#DCE7F3] bg-[#F8FBFF] p-4">
                        <h4 className="font-display text-sm font-semibold text-[#0E2747]">
                            {editingCategory ? 'Edit kategori' : 'Tambah kategori'}
                        </h4>
                        <div className="mt-4 space-y-4">
                            <Input
                                name="finance_category_name"
                                label="Nama Kategori"
                                value={form.data.name}
                                onChange={(event) => form.setData('name', event.target.value)}
                                error={form.errors.name}
                                placeholder="Contoh: Dokumentasi"
                                autoComplete="off"
                                required
                            />
                            <Select
                                name="finance_category_type"
                                label="Berlaku Untuk"
                                value={form.data.transaction_type}
                                onChange={(event) => form.setData('transaction_type', event.target.value)}
                                error={form.errors.transaction_type}
                                options={Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label }))}
                                required
                            />
                        </div>
                        <div className="mt-5 flex flex-wrap gap-2 border-t border-[#DCE7F3] pt-4">
                            <Button type="submit" size="sm" icon={editingCategory ? Pencil : Plus} loading={form.processing}>
                                {editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}
                            </Button>
                            {editingCategory && (
                                <Button type="button" size="sm" variant="secondary" onClick={resetForm}>
                                    Batal Edit
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </Modal>

            <AlertDialog
                isOpen={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={destroyCategory}
                loading={isDeleting}
                title="Hapus Kategori Keuangan?"
                description={`Kategori “${deleteTarget?.name || ''}” akan dihapus dari master kategori.`}
                confirmText="Hapus Kategori"
                cancelText="Batal"
                variant="danger"
            />
        </>
    );
}
