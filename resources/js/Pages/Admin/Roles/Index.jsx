import React, { useState } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/admin/PageHeader';
import StatGrid from '../../../Components/admin/StatGrid';
import TableToolbar from '../../../Components/admin/TableToolbar';
import DataTable from '../../../Components/ui/DataTable';
import Modal from '../../../Components/ui/Modal';
import AlertDialog from '../../../Components/ui/AlertDialog';
import Button from '../../../Components/ui/Button';
import Input from '../../../Components/ui/Input';
import Textarea from '../../../Components/ui/Textarea';
import Badge from '../../../Components/ui/Badge';
import {
    Plus,
    Edit3,
    Trash2,
    Shield,
    ShieldCheck,
    Users,
    KeyRound,
    Lock,
    ExternalLink,
    AlertCircle,
    Info,
} from 'lucide-react';

export default function Index({
    roles = [],
    metrics = {},
    filters = {},
}) {
    const [search, setSearch] = useState(filters.q || '');

    // State for Create Role Modal
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const createForm = useForm({
        name: '',
        label: '',
        description: '',
    });

    // State for Edit Role Modal
    const [editingRole, setEditingRole] = useState(null);
    const editForm = useForm({
        name: '',
        label: '',
        description: '',
    });

    // State for Delete Role Dialog
    const [deletingRole, setDeletingRole] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const applySearch = (value = search) => {
        const params = {};
        if (value && value.trim()) {
            params.q = value.trim();
        }
        router.get('/admin/role', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        router.get('/admin/role', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleOpenCreate = () => {
        createForm.reset();
        createForm.clearErrors();
        setIsCreateOpen(true);
    };

    const handleCreateLabelChange = (val) => {
        createForm.setData((prev) => {
            const currentAutoSlug = prev.label
                ? prev.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                : '';
            const shouldUpdateSlug = !prev.name || prev.name === currentAutoSlug;
            const newSlug = shouldUpdateSlug
                ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                : prev.name;

            return {
                ...prev,
                label: val,
                name: newSlug,
            };
        });
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post('/admin/role', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleOpenEdit = (role) => {
        setEditingRole(role);
        editForm.clearErrors();
        editForm.setData({
            name: role.name,
            label: role.label,
            description: role.description || '',
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editingRole) return;
        editForm.put(`/admin/role/${editingRole.id}`, {
            onSuccess: () => {
                setEditingRole(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = () => {
        if (!deletingRole) return;
        setIsDeleting(true);
        router.delete(`/admin/role/${deletingRole.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeletingRole(null);
            },
        });
    };

    const statItems = [
        {
            label: 'Total Peran',
            value: metrics.total_roles ?? roles.length,
            description: 'Peran terdaftar dalam sistem',
            icon: Shield,
            tone: 'blue',
        },
        {
            label: 'Peran Sistem',
            value: metrics.system_roles ?? 0,
            description: 'Peran baku dengan proteksi inti',
            icon: Lock,
            tone: 'navy',
        },
        {
            label: 'Peran Kustom',
            value: metrics.custom_roles ?? 0,
            description: 'Peran tambahan buatan admin',
            icon: Users,
            tone: 'purple',
        },
        {
            label: 'Hak Akses Modul',
            value: metrics.total_permissions ?? 0,
            description: 'Izin modul diatur pada matriks',
            icon: KeyRound,
            tone: 'orange',
        },
    ];

    const columns = [
        {
            header: 'Peran & Identifikasi',
            cell: (row) => (
                <div className="flex items-start gap-3 py-1">
                    <span
                        className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center ${
                            row.is_system
                                ? 'bg-[#EEF3F8] text-[#0E2747] border border-[#DCE7F3]'
                                : 'bg-[#F2EDFF] text-[#7957D5] border border-[#E0D4FC]'
                        }`}
                        title={row.is_system ? 'Peran Baku Sistem' : 'Peran Kustom'}
                    >
                        <Shield className="w-4 h-4" />
                    </span>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-[#112743]">
                                {row.label}
                            </span>
                            <Badge
                                variant={row.is_system ? 'default' : 'purple'}
                                size="sm"
                            >
                                {row.is_system ? 'Sistem' : 'Kustom'}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <code className="text-[11px] text-[#6B7C93] font-mono bg-[#F8FBFF] px-1.5 py-0.5 rounded border border-[#DCE7F3]">
                                slug: {row.name}
                            </code>
                            <span className="text-[11px] text-[#8C9BAE]">
                                • Guard: {row.guard_name || 'web'}
                            </span>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: 'Deskripsi & Cakupan Tugas',
            cell: (row) => (
                <p className="text-xs text-[#6B7C93] max-w-sm line-clamp-2 leading-relaxed">
                    {row.description || (
                        <span className="italic text-[#A0AEC0]">Belum ada deskripsi tugas peran.</span>
                    )}
                </p>
            ),
        },
        {
            header: 'Pengguna',
            cell: (row) => (
                <div>
                    {row.users_count > 0 ? (
                        <Link
                            href={`/admin/pengguna?role=${encodeURIComponent(row.label)}`}
                            className="inline-flex items-center gap-1.5 font-medium text-xs text-[#0B63CE] bg-[#EAF5FF] hover:bg-[#D8EDFE] px-2.5 py-1 rounded-full border border-[#BCE0FD] transition-colors"
                            title="Klik untuk melihat daftar pengguna dengan peran ini"
                        >
                            <Users className="w-3.5 h-3.5" />
                            <span>{row.users_count} Pengguna</span>
                        </Link>
                    ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-[#8C9BAE] px-2 py-0.5">
                            0 Pengguna
                        </span>
                    )}
                </div>
            ),
        },
        {
            header: 'Hak Akses Modul',
            cell: (row) => (
                <div>
                    <Link
                        href="/admin/hak-akses"
                        className="inline-flex items-center gap-1.5 font-medium text-xs text-[#20A47A] bg-[#E8F7F2] hover:bg-[#D2F2E7] px-2.5 py-1 rounded-full border border-[#A7E8D3] transition-colors"
                        title="Buka Matriks Hak Akses"
                    >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{row.permissions_count} Izin</span>
                    </Link>
                </div>
            ),
        },
        {
            header: 'Aksi',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (row) => {
                const canDelete = !row.is_system && row.users_count === 0;
                let deleteDisabledReason = '';
                if (row.is_system) {
                    deleteDisabledReason = 'Peran bawaan sistem dilindungi dan tidak dapat dihapus.';
                } else if (row.users_count > 0) {
                    deleteDisabledReason = `Peran masih digunakan oleh ${row.users_count} pengguna aktif.`;
                }

                return (
                    <div className="flex items-center justify-end gap-1">
                        <Link
                            href="/admin/hak-akses"
                            className="p-1.5 rounded-lg text-[#6B7C93] hover:text-[#20A47A] hover:bg-[#E8F7F2] transition-colors"
                            title="Atur Hak Akses pada Matriks"
                            aria-label={`Atur hak akses untuk ${row.label}`}
                        >
                            <ShieldCheck className="w-4 h-4" />
                        </Link>
                        <button
                            type="button"
                            onClick={() => handleOpenEdit(row)}
                            className="p-1.5 rounded-lg text-[#6B7C93] hover:text-[#0B63CE] hover:bg-[#EAF5FF] transition-colors"
                            title={`Edit peran ${row.label}`}
                            aria-label={`Edit peran ${row.label}`}
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setDeletingRole(row)}
                            disabled={!canDelete}
                            className={`p-1.5 rounded-lg transition-colors ${
                                canDelete
                                    ? 'text-[#6B7C93] hover:text-[#FA5252] hover:bg-[#FDE8EF]'
                                    : 'text-[#DCE7F3] cursor-not-allowed opacity-40'
                            }`}
                            title={canDelete ? `Hapus peran ${row.label}` : deleteDisabledReason}
                            aria-label={`Hapus peran ${row.label}`}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                );
            },
        },
    ];

    return (
        <AdminLayout title="Master Role (Peran Pengguna)">
            <PageHeader
                title="Master Role (Peran)"
                description="Kelola tingkatan peran kenshi, wewenang akses modul, dan profil otorisasi dalam sistem portal PERKEMI."
                breadcrumbs={[{ label: 'Master Role' }]}
                action={
                    <div className="flex items-center gap-2">
                        <Link href="/admin/hak-akses">
                            <Button
                                variant="secondary"
                                size="sm"
                                icon={ShieldCheck}
                            >
                                Matriks Hak Akses
                            </Button>
                        </Link>
                        <Button
                            variant="primary"
                            size="sm"
                            icon={Plus}
                            onClick={handleOpenCreate}
                        >
                            Tambah Peran
                        </Button>
                    </div>
                }
            />

            <StatGrid items={statItems} className="mb-6" />

            {/* Quick Info Box */}
            <div className="bg-[#F8FBFF] border border-[#DCE7F3] rounded-xl p-4 mb-6 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EAF5FF] text-[#0B63CE] flex items-center justify-center shrink-0 mt-0.5">
                    <Info className="w-4 h-4" />
                </div>
                <div className="text-xs text-[#475569] leading-relaxed">
                    <span className="font-semibold text-[#112743]">Struktur Peran & Hak Akses: </span>
                    Setiap peran merepresentasikan identitas pengguna (seperti <em>Super Administrator, Pemateri, Wasit, Pelatih, Peserta</em>). 
                    Untuk mengonfigurasi fitur dan menu apa saja yang dapat diakses oleh masing-masing peran, buka halaman{' '}
                    <Link href="/admin/hak-akses" className="text-[#0B63CE] font-semibold underline underline-offset-2 hover:text-[#0A3F82]">
                        Hak Akses & Wewenang
                    </Link>.
                </div>
            </div>

            <div className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs overflow-hidden">
                <TableToolbar
                    search={search}
                    onSearchChange={setSearch}
                    onSearchSubmit={() => applySearch(search)}
                    searchPlaceholder="Cari nama peran, slug, atau deskripsi..."
                    onReset={handleReset}
                    hasActiveFilters={Boolean(filters.q)}
                />

                <DataTable
                    columns={columns}
                    data={roles}
                    emptyTitle="Tidak Ada Peran Ditemukan"
                    emptyDescription={
                        filters.q
                            ? `Tidak ada peran yang cocok dengan kata kunci "${filters.q}". Coba kata kunci lain.`
                            : 'Belum ada data peran yang tersimpan dalam sistem.'
                    }
                    actionText="Tambah Peran Baru"
                    onEmptyAction={handleOpenCreate}
                />
            </div>

            {/* Modal Tambah Peran */}
            <Modal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Tambah Peran Baru"
                description="Buat tingkatan peran pengguna baru untuk penugasan akun dan otorisasi modul."
                isProcessing={createForm.processing}
            >
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div>
                        <Input
                            label="Nama Tampilan Peran"
                            placeholder="Contoh: Petugas IT / Operator Cabang"
                            value={createForm.data.label}
                            onChange={(e) => handleCreateLabelChange(e.target.value)}
                            error={createForm.errors.label}
                            required
                        />
                        <span className="text-[11px] text-[#6B7C93] mt-1 block">
                            Nama yang akan ditampilkan pada label antarmuka dan pilihan akun pengguna.
                        </span>
                    </div>

                    <div>
                        <Input
                            label="Kode Identifikasi (Slug/Code)"
                            placeholder="Contoh: petugas-it"
                            value={createForm.data.name}
                            onChange={(e) => createForm.setData('name', e.target.value)}
                            error={createForm.errors.name}
                            required
                        />
                        <span className="text-[11px] text-[#6B7C93] mt-1 block">
                            Format huruf kecil, angka, dan tanda hubung (-). Digunakan sebagai kunci wewenang sistem.
                        </span>
                    </div>

                    <div>
                        <Textarea
                            label="Deskripsi & Tanggung Jawab"
                            placeholder="Jelaskan peran tugas dan wewenang pengguna peran ini..."
                            value={createForm.data.description}
                            onChange={(e) => createForm.setData('description', e.target.value)}
                            error={createForm.errors.description}
                            rows={3}
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#DCE7F3]">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsCreateOpen(false)}
                            disabled={createForm.processing}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={createForm.processing}
                        >
                            Simpan Peran
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal Edit Peran */}
            <Modal
                isOpen={Boolean(editingRole)}
                onClose={() => setEditingRole(null)}
                title={editingRole ? `Edit Peran: ${editingRole.label}` : 'Edit Peran'}
                description="Perbarui informasi nama tampilan atau deskripsi tugas peran."
                isProcessing={editForm.processing}
            >
                {editingRole && (
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div>
                            <Input
                                label="Nama Tampilan Peran"
                                value={editForm.data.label}
                                onChange={(e) => editForm.setData('label', e.target.value)}
                                error={editForm.errors.label}
                                required
                            />
                        </div>

                        <div>
                            <Input
                                label="Kode Identifikasi (Slug/Code)"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                error={editForm.errors.name}
                                disabled={editingRole.is_system}
                                required
                            />
                            {editingRole.is_system ? (
                                <span className="text-[11px] text-[#EE9B25] flex items-center gap-1 mt-1 font-medium">
                                    <Lock className="w-3 h-3" />
                                    Kode identifikasi peran baku sistem dilindungi dan tidak dapat diubah.
                                </span>
                            ) : (
                                <span className="text-[11px] text-[#6B7C93] mt-1 block">
                                    Format huruf kecil, angka, dan tanda hubung (-).
                                </span>
                            )}
                        </div>

                        <div>
                            <Textarea
                                label="Deskripsi & Tanggung Jawab"
                                value={editForm.data.description}
                                onChange={(e) => editForm.setData('description', e.target.value)}
                                error={editForm.errors.description}
                                rows={3}
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#DCE7F3]">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setEditingRole(null)}
                                disabled={editForm.processing}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                loading={editForm.processing}
                            >
                                Simpan Perubahan
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Alert Dialog Hapus Peran */}
            <AlertDialog
                isOpen={Boolean(deletingRole)}
                onClose={() => setDeletingRole(null)}
                onConfirm={handleDelete}
                title="Hapus Peran Pengguna?"
                description={
                    deletingRole ? (
                        <span>
                            Apakah Anda yakin ingin menghapus peran{' '}
                            <strong>"{deletingRole.label}"</strong>? Tindakan ini akan menghapus konfigurasi peran beserta relasi izinnya secara permanen.
                        </span>
                    ) : (
                        ''
                    )
                }
                confirmText="Hapus Peran"
                confirmVariant="danger"
                isProcessing={isDeleting}
            />
        </AdminLayout>
    );
}
