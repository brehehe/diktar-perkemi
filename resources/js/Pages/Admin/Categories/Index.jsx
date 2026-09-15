import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/admin/PageHeader';
import DataTable from '../../../Components/ui/DataTable';
import Modal from '../../../Components/ui/Modal';
import AlertDialog from '../../../Components/ui/AlertDialog';
import Button from '../../../Components/ui/Button';
import Input from '../../../Components/ui/Input';
import Textarea from '../../../Components/ui/Textarea';
import Switch from '../../../Components/ui/Switch';
import Badge from '../../../Components/ui/Badge';
import { Plus, Edit3, Trash2, Tags } from 'lucide-react';

const PRESET_COLORS = [
    '#0B63CE', // Primary Blue
    '#20A47A', // Green
    '#EE9B25', // Orange
    '#DD4D7C', // Rose
    '#7957D5', // Purple
    '#0A3F82', // Dark Blue
    '#0E2747', // Navy
    '#475569', // Slate
];

export default function Index({ categories = [] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deletingCategory, setDeletingCategory] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Create form
    const createForm = useForm({
        name: '',
        description: '',
        color: '#0B63CE',
        is_active: true,
    });

    // Edit form
    const editForm = useForm({
        name: '',
        description: '',
        color: '#0B63CE',
        is_active: true,
    });

    const handleOpenCreate = () => {
        createForm.reset();
        createForm.clearErrors();
        setIsCreateOpen(true);
    };

    const handleOpenEdit = (cat) => {
        setEditingCategory(cat);
        editForm.clearErrors();
        editForm.setData({
            name: cat.name,
            description: cat.description || '',
            color: cat.color || '#0B63CE',
            is_active: Boolean(cat.is_active),
        });
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post('/admin/kategori', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editingCategory) return;
        editForm.put(`/admin/kategori/${editingCategory.id}`, {
            onSuccess: () => {
                setEditingCategory(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = () => {
        if (!deletingCategory) return;
        setIsDeleting(true);
        router.delete(`/admin/kategori/${deletingCategory.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeletingCategory(null);
            },
        });
    };

    const columns = [
        {
            header: 'Topik Kategori',
            cell: (row) => (
                <div className="flex items-center gap-3">
                    <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: row.color }}
                    />
                    <div>
                        <span className="font-semibold text-sm text-[#112743] block">
                            {row.name}
                        </span>
                        <span className="text-[11px] text-[#6B7C93] font-mono">
                            /{row.slug}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            header: 'Deskripsi',
            cell: (row) => (
                <p className="text-xs text-[#6B7C93] max-w-md line-clamp-2">
                    {row.description || 'Tidak ada uraian deskripsi.'}
                </p>
            ),
        },
        {
            header: 'Jumlah Materi',
            cell: (row) => (
                <span className="font-semibold text-xs text-[#112743] bg-[#EAF5FF] px-2 py-0.5 rounded-full border border-[#BCE0FD]">
                    {row.materials_count} materi
                </span>
            ),
        },
        {
            header: 'Status',
            cell: (row) => (
                <Badge variant={row.is_active ? 'success' : 'default'} dot>
                    {row.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
            ),
        },
        {
            header: 'Aksi',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (row) => (
                <div className="flex items-center justify-end gap-1.5">
                    <button
                        type="button"
                        onClick={() => handleOpenEdit(row)}
                        className="p-1.5 rounded-lg text-[#6B7C93] hover:text-[#0B63CE] hover:bg-[#EAF5FF] transition-colors"
                        aria-label={`Edit kategori ${row.name}`}
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setDeletingCategory(row)}
                        className="p-1.5 rounded-lg text-[#6B7C93] hover:text-[#FA5252] hover:bg-[#FDE8EF] transition-colors"
                        aria-label={`Hapus kategori ${row.name}`}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout title="Kategori Materi">
            <PageHeader
                title="Kategori Materi"
                description="Kelola taksonomi, pembagian disiplin keilmuan, dan warna pengenal koleksi digital PERKEMI."
                breadcrumbs={[{ label: 'Kategori' }]}
                action={
                    <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenCreate}>
                        Tambah Kategori
                    </Button>
                }
            />

            <DataTable
                columns={columns}
                data={categories}
                emptyTitle="Belum Ada Kategori"
                emptyDescription="Buat kategori pertama untuk mulai mengelompokkan buku dan materi penataran."
                actionText="Tambah Kategori"
                onEmptyAction={handleOpenCreate}
            />

            {/* Create Category Modal */}
            <Modal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Tambah Kategori Baru"
                description="Lengkapi nama kategori, deskripsi materi, dan warna aksen label."
                isProcessing={createForm.processing}
            >
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <Input
                        label="Nama Kategori"
                        name="name"
                        value={createForm.data.name}
                        onChange={(e) => createForm.setData('name', e.target.value)}
                        placeholder="Contoh: Teknik & Standarisasi Gerak"
                        required
                        error={createForm.errors.name}
                    />

                    <Textarea
                        label="Deskripsi Kategori"
                        name="description"
                        value={createForm.data.description}
                        onChange={(e) => createForm.setData('description', e.target.value)}
                        placeholder="Penjelasan ringkas cakupan materi yang tergolong dalam topik ini..."
                        rows={3}
                        error={createForm.errors.description}
                    />

                    {/* Color Picker with presets */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#112743] mb-1.5">
                            Warna Aksen
                        </label>
                        <div className="flex items-center gap-2 mb-2">
                            {PRESET_COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => createForm.setData('color', c)}
                                    className={`w-6 h-6 rounded-full border transition-all ${createForm.data.color === c ? 'ring-2 ring-offset-2 ring-[#0B63CE] scale-110' : 'border-transparent hover:scale-105'}`}
                                    style={{ backgroundColor: c }}
                                    aria-label={`Pilih warna ${c}`}
                                />
                            ))}
                        </div>
                        <Input
                            name="color"
                            value={createForm.data.color}
                            onChange={(e) => createForm.setData('color', e.target.value)}
                            placeholder="#0B63CE"
                            error={createForm.errors.color}
                        />
                    </div>

                    <Switch
                        label="Status Kategori Aktif"
                        helperText="Kategori dapat dipilih saat menambahkan modul baru"
                        checked={createForm.data.is_active}
                        onChange={(val) => createForm.setData('is_active', val)}
                    />

                    <div className="pt-4 border-t border-[#DCE7F3] flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={createForm.processing}
                            onClick={() => setIsCreateOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            loading={createForm.processing}
                        >
                            Simpan Kategori
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Category Modal */}
            <Modal
                isOpen={Boolean(editingCategory)}
                onClose={() => setEditingCategory(null)}
                title="Edit Kategori Materi"
                description={`Perbarui informasi untuk kategori "${editingCategory?.name}".`}
                isProcessing={editForm.processing}
            >
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <Input
                        label="Nama Kategori"
                        name="name"
                        value={editForm.data.name}
                        onChange={(e) => editForm.setData('name', e.target.value)}
                        required
                        error={editForm.errors.name}
                    />

                    <Textarea
                        label="Deskripsi Kategori"
                        name="description"
                        value={editForm.data.description}
                        onChange={(e) => editForm.setData('description', e.target.value)}
                        rows={3}
                        error={editForm.errors.description}
                    />

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#112743] mb-1.5">
                            Warna Aksen
                        </label>
                        <div className="flex items-center gap-2 mb-2">
                            {PRESET_COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => editForm.setData('color', c)}
                                    className={`w-6 h-6 rounded-full border transition-all ${editForm.data.color === c ? 'ring-2 ring-offset-2 ring-[#0B63CE] scale-110' : 'border-transparent hover:scale-105'}`}
                                    style={{ backgroundColor: c }}
                                    aria-label={`Pilih warna ${c}`}
                                />
                            ))}
                        </div>
                        <Input
                            name="color"
                            value={editForm.data.color}
                            onChange={(e) => editForm.setData('color', e.target.value)}
                            error={editForm.errors.color}
                        />
                    </div>

                    <Switch
                        label="Status Kategori Aktif"
                        helperText="Kategori dapat dipilih saat menambahkan modul baru"
                        checked={editForm.data.is_active}
                        onChange={(val) => editForm.setData('is_active', val)}
                    />

                    <div className="pt-4 border-t border-[#DCE7F3] flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={editForm.processing}
                            onClick={() => setEditingCategory(null)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            loading={editForm.processing}
                        >
                            Perbarui Kategori
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Alert Dialog */}
            <AlertDialog
                isOpen={Boolean(deletingCategory)}
                onClose={() => setDeletingCategory(null)}
                onConfirm={handleDelete}
                title="Hapus Kategori Materi?"
                description={
                    deletingCategory?.materials_count > 0
                        ? `PERHATIAN: Kategori "${deletingCategory?.name}" masih memuat ${deletingCategory?.materials_count} materi terkait. Sistem akan menolak penghapusan ini demi integritas data koleksi.`
                        : `Apakah Anda yakin ingin menghapus kategori "${deletingCategory?.name}"? Tindakan ini tidak dapat dibatalkan.`
                }
                confirmText={deletingCategory?.materials_count > 0 ? 'Coba Hapus (Ditolak Sistem)' : 'Hapus Kategori'}
                cancelText="Batal"
                variant="danger"
                loading={isDeleting}
            />
        </AdminLayout>
    );
}
