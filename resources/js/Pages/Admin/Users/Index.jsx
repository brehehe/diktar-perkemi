import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/admin/PageHeader';
import DataTable from '../../../Components/ui/DataTable';
import TableToolbar from '../../../Components/admin/TableToolbar';
import FilterBar from '../../../Components/admin/FilterBar';
import Modal from '../../../Components/ui/Modal';
import AlertDialog from '../../../Components/ui/AlertDialog';
import Button from '../../../Components/ui/Button';
import Input from '../../../Components/ui/Input';
import PasswordInput from '../../../Components/ui/PasswordInput';
import Select from '../../../Components/ui/Select';
import Badge from '../../../Components/ui/Badge';
import { Plus, UserCheck, Shield, User, Search, Edit } from 'lucide-react';

export default function Index({
    users,
    roles = [],
    filters = {},
}) {
    const [search, setSearch] = useState(filters.q || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || '');

    // State for Create User Modal
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const createForm = useForm({
        name: '',
        email: '',
        role: 'Peserta',
        password: '',
    });

    // State for Change Role Dialog
    const [roleTargetUser, setRoleTargetUser] = useState(null);
    const roleForm = useForm({
        role: 'Peserta',
    });

    const applyFilters = (customParams = {}) => {
        const params = {
            q: search,
            role: selectedRole,
            ...customParams,
        };
        Object.keys(params).forEach((key) => {
            if (!params[key]) delete params[key];
        });
        router.get('/admin/pengguna', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearchSubmit = () => {
        applyFilters();
    };

    const handleReset = () => {
        setSearch('');
        setSelectedRole('');
        router.get('/admin/pengguna', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleOpenCreate = () => {
        createForm.reset();
        createForm.clearErrors();
        setIsCreateOpen(true);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post('/admin/pengguna', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleOpenRoleModal = (u) => {
        setRoleTargetUser(u);
        roleForm.clearErrors();
        roleForm.setData({ role: u.role });
    };

    const handleRoleSubmit = (e) => {
        e.preventDefault();
        if (!roleTargetUser) return;
        roleForm.patch(`/admin/pengguna/${roleTargetUser.id}/role`, {
            onSuccess: () => {
                setRoleTargetUser(null);
                roleForm.reset();
            },
        });
    };

    const roleBadges = {
        Admin: 'purple',
        Pemateri: 'primary',
        Pelatih: 'published',
        Penguji: 'warning',
        Wasit: 'review',
        Penyelenggara: 'archived',
        Peserta: 'default',
    };

    const columns = [
        {
            header: 'Pengguna Kenshi',
            cell: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#EAF5FF] text-[#0B63CE] font-bold flex items-center justify-center text-xs shrink-0 border border-[#BCE0FD]">
                        {row.name ? row.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                        <span className="font-semibold text-sm text-[#112743] flex items-center gap-2">
                            {row.name}
                            {row.is_self && (
                                <span className="text-[10px] text-[#0B63CE] bg-[#EAF5FF] px-1.5 py-0.2 rounded border border-[#BCE0FD]">
                                    Anda
                                </span>
                            )}
                        </span>
                        <span className="text-xs text-[#6B7C93]">
                            {row.email}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            header: 'Peran Saat Ini',
            cell: (row) => (
                <Badge variant={roleBadges[row.role] || 'default'} dot>
                    {row.role}
                </Badge>
            ),
        },
        {
            header: 'Tanggal Registrasi',
            accessor: 'created_at',
            className: 'font-mono text-xs text-[#6B7C93]',
        },
        {
            header: 'Aksi',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (row) => (
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenRoleModal(row)}
                >
                    Ubah Peran
                </Button>
            ),
        },
    ];

    const roleOptions = roles.map((r) => ({ value: r, label: r }));

    return (
        <AdminLayout title="Kelola Pengguna Portal">
            <PageHeader
                title="Pengguna & Kenshi"
                description="Manajemen akun kenshi, penetapan peran resmi PERKEMI, dan hak akses portal."
                breadcrumbs={[{ label: 'Pengguna' }]}
                action={
                    <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenCreate}>
                        Tambah Pengguna
                    </Button>
                }
            />

            <div className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs overflow-hidden mb-8">
                <TableToolbar
                    search={search}
                    onSearchChange={setSearch}
                    onSearchSubmit={handleSearchSubmit}
                    searchPlaceholder="Cari nama kenshi atau alamat email..."
                    hasActiveFilters={Boolean(search || selectedRole)}
                    onReset={handleReset}
                >
                    <FilterBar>
                        <select
                            value={selectedRole}
                            onChange={(e) => {
                                setSelectedRole(e.target.value);
                                applyFilters({ role: e.target.value });
                            }}
                            className="bg-[#F8FBFF] border border-[#DCE7F3] rounded-lg px-2.5 py-2 text-xs text-[#112743] focus:outline-none focus:border-[#0B63CE]"
                        >
                            <option value="">Semua Peran</option>
                            {roles.map((r) => (
                                <option key={r} value={r}>
                                    {r}
                                </option>
                            ))}
                        </select>
                    </FilterBar>
                </TableToolbar>

                <DataTable
                    columns={columns}
                    data={users.data}
                    pagination={users}
                    emptyTitle="Pengguna Tidak Ditemukan"
                    emptyDescription="Tidak ada pengguna yang cocok dengan kriteria pencarian Anda."
                    actionText="Reset Pencarian"
                    onEmptyAction={handleReset}
                />
            </div>

            {/* Create User Modal */}
            <Modal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Tambah Akun Pengguna Baru"
                description="Daftarkan akun anggota kenshi atau pengurus baru ke dalam sistem Pustaka Penataran."
                isProcessing={createForm.processing}
            >
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <Input
                        label="Nama Lengkap Kenshi"
                        name="name"
                        value={createForm.data.name}
                        onChange={(e) => createForm.setData('name', e.target.value)}
                        placeholder="Contoh: Ryan Santoso, Sp.Pd"
                        required
                        error={createForm.errors.name}
                    />

                    <Input
                        label="Alamat Email"
                        name="email"
                        type="email"
                        value={createForm.data.email}
                        onChange={(e) => createForm.setData('email', e.target.value)}
                        placeholder="kenshi@perkemi.id"
                        required
                        error={createForm.errors.email}
                    />

                    <Select
                        label="Peran Resmi PERKEMI"
                        name="role"
                        value={createForm.data.role}
                        onChange={(e) => createForm.setData('role', e.target.value)}
                        options={roleOptions}
                        required
                        error={createForm.errors.role}
                    />

                    <PasswordInput
                        label="Kata Sandi Awal"
                        name="password"
                        value={createForm.data.password}
                        onChange={(e) => createForm.setData('password', e.target.value)}
                        placeholder="Minimal 8 karakter"
                        required
                        error={createForm.errors.password}
                        helperText="Kata sandi dapat diubah kembali oleh pengguna setelah berhasil masuk."
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
                            Simpan Pengguna
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Change Role Modal */}
            <Modal
                isOpen={Boolean(roleTargetUser)}
                onClose={() => setRoleTargetUser(null)}
                title="Ubah Peran Pengguna"
                description={`Tentukan peran dan wewenang baru untuk kenshi "${roleTargetUser?.name}".`}
                isProcessing={roleForm.processing}
            >
                <form onSubmit={handleRoleSubmit} className="space-y-4">
                    <div className="p-3 rounded-lg bg-[#F8FBFF] border border-[#DCE7F3] text-xs space-y-1">
                        <p><span className="text-[#6B7C93]">Pengguna:</span> <span className="font-semibold text-[#112743]">{roleTargetUser?.name}</span></p>
                        <p><span className="text-[#6B7C93]">Email:</span> <span className="font-mono text-[#112743]">{roleTargetUser?.email}</span></p>
                        <p><span className="text-[#6B7C93]">Peran Saat Ini:</span> <span className="font-semibold text-[#0B63CE]">{roleTargetUser?.role}</span></p>
                    </div>

                    <Select
                        label="Pilih Peran Baru"
                        name="role"
                        value={roleForm.data.role}
                        onChange={(e) => roleForm.setData('role', e.target.value)}
                        options={roleOptions}
                        required
                        error={roleForm.errors.role}
                    />

                    <div className="pt-4 border-t border-[#DCE7F3] flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={roleForm.processing}
                            onClick={() => setRoleTargetUser(null)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            loading={roleForm.processing}
                        >
                            Perbarui Peran
                        </Button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
