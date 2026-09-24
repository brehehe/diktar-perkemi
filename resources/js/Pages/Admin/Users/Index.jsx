import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/admin/PageHeader';
import DataTable from '../../../Components/ui/DataTable';
import TableToolbar from '../../../Components/admin/TableToolbar';
import FilterBar from '../../../Components/admin/FilterBar';
import FilterSelect from '../../../Components/admin/FilterSelect';
import Modal from '../../../Components/ui/Modal';
import AlertDialog from '../../../Components/ui/AlertDialog';
import Button from '../../../Components/ui/Button';
import Input from '../../../Components/ui/Input';
import PasswordInput from '../../../Components/ui/PasswordInput';
import Select from '../../../Components/ui/Select';
import Badge from '../../../Components/ui/Badge';
import { Plus, UserCheck, Shield, User, Search, Edit, Key, Wand2, ExternalLink, Info } from 'lucide-react';

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
        is_supervisor: false,
        password: '',
    });

    // State for Change Role Dialog
    const [roleTargetUser, setRoleTargetUser] = useState(null);
    const roleForm = useForm({
        role: 'Peserta',
        is_supervisor: false,
    });

    // State for Change Password Dialog
    const [passwordTargetUser, setPasswordTargetUser] = useState(null);
    const passwordForm = useForm({
        password: '',
        password_confirmation: '',
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
        createForm.setData({
            name: '',
            email: '',
            role: 'Peserta',
            is_supervisor: false,
            password: '',
        });
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
        roleForm.setData({
            role: u.role,
            is_supervisor: Boolean(u.is_supervisor),
        });
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

    const handleOpenPasswordModal = (u) => {
        setPasswordTargetUser(u);
        passwordForm.reset();
        passwordForm.clearErrors();
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (!passwordTargetUser) return;
        passwordForm.patch(`/admin/pengguna/${passwordTargetUser.id}/password`, {
            onSuccess: () => {
                setPasswordTargetUser(null);
                passwordForm.reset();
            },
        });
    };

    const handleGenerateRandomPassword = () => {
        const generated = 'Kenshi' + Math.floor(100000 + Math.random() * 900000) + '!';
        passwordForm.setData({
            password: generated,
            password_confirmation: generated,
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
                <div className="space-y-1.5">
                    <Badge variant={roleBadges[row.role] || 'default'} dot>
                        {row.role}
                    </Badge>
                    {row.role === 'Pemateri' && (
                        <div>
                            {row.is_supervisor ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
                                    <Shield className="w-2.5 h-2.5 text-amber-600" />
                                    Supervisor
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
                                    Reguler
                                </span>
                            )}
                        </div>
                    )}
                </div>
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
                <div className="flex items-center justify-end gap-1.5">
                    <Button
                        variant="secondary"
                        size="sm"
                        icon={Key}
                        onClick={() => handleOpenPasswordModal(row)}
                        title="Ubah kata sandi pengguna"
                    >
                        Ubah Password
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenRoleModal(row)}
                    >
                        Ubah Peran
                    </Button>
                </div>
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

            {/* Note Khusus Manajemen Akun & Hak Akses Pemateri Supervisor */}
            <div className="mb-6 rounded-xl border border-amber-200/90 bg-gradient-to-r from-amber-50/90 via-[#FFFDF6] to-blue-50/60 p-4 sm:p-5 shadow-xs">
                <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-amber-100/90 border border-amber-300/80 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Shield className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="space-y-2 text-xs flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="font-bold text-sm text-[#112743] flex items-center gap-2">
                                Catatan Akun & Hak Akses Pemateri Supervisor
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                                    Panduan Alur
                                </span>
                            </h3>
                            <a
                                href="/pemateri/jadwal"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0B63CE] hover:text-[#094ba0] hover:underline"
                            >
                                Buka Portal Jadwal Pemateri
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                        <p className="text-[#334155] leading-relaxed">
                            Alur penetapan status, hak akses pengawasan materi, dan pengelolaan akun login pemateri:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                            <div className="bg-white/90 p-3 rounded-lg border border-amber-200/70 shadow-2xs">
                                <span className="font-bold text-[11px] text-[#112743] block mb-1 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                    1. Pemateri Supervisor
                                </span>
                                <p className="text-[11px] text-[#475569] leading-normal">
                                    Pemateri berstatus <strong>Supervisor</strong> dapat melihat <strong>seluruh jadwal & materi pemateri lain</strong> di portal <code className="text-[#0B63CE] bg-[#F1F5F9] px-1 py-0.5 rounded">/pemateri/jadwal</code>, sedangkan Pemateri Reguler hanya melihat sesi miliknya.
                                </p>
                            </div>

                            <div className="bg-white/90 p-3 rounded-lg border border-blue-200/70 shadow-2xs">
                                <span className="font-bold text-[11px] text-[#112743] block mb-1 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                    2. Buat Akun & Toggle Supervisor
                                </span>
                                <p className="text-[11px] text-[#475569] leading-normal">
                                    Pembuatan akun login pemateri baru dan pengaktifan status Supervisor dilakukan langsung pada <strong>Tab Pemateri di Event</strong> (contoh: <a href="/admin/event/3?tab=pemateri" className="text-[#0B63CE] underline font-medium hover:text-[#094ba0]">/admin/event/3?tab=pemateri</a>).
                                </p>
                            </div>

                            <div className="bg-white/90 p-3 rounded-lg border border-slate-200/80 shadow-2xs">
                                <span className="font-bold text-[11px] text-[#112743] block mb-1 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-slate-500 shrink-0" />
                                    3. Ubah Password Pemateri
                                </span>
                                <p className="text-[11px] text-[#475569] leading-normal">
                                    Admin dapat mereset atau mengubah kata sandi akun login pemateri kapan saja menggunakan tombol <strong>"Ubah Password"</strong> di tabel pengguna pada halaman ini.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
                        <FilterSelect
                            value={selectedRole}
                            onChange={(value) => {
                                setSelectedRole(value);
                                applyFilters({ role: value });
                            }}
                            placeholder="Semua Peran"
                            ariaLabel="Filter peran pengguna"
                            options={roles.map((role) => ({ value: role, label: role }))}
                        />
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

                    {createForm.data.role === 'Pemateri' && (
                        <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/70 space-y-2">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={Boolean(createForm.data.is_supervisor)}
                                    onChange={(e) => createForm.setData('is_supervisor', e.target.checked)}
                                    className="mt-0.5 w-4 h-4 text-[#0B63CE] rounded border-[#DCE7F3] focus:ring-[#0B63CE]"
                                />
                                <div className="text-xs">
                                    <span className="font-bold text-[#112743] flex items-center gap-1.5">
                                        <Shield className="w-3.5 h-3.5 text-amber-600" />
                                        Tetapkan sebagai Pemateri Supervisor
                                    </span>
                                    <p className="text-[11px] text-[#475569] mt-0.5 leading-normal">
                                        Jika dicentang, pemateri ini berstatus <strong>Supervisor</strong> dan dapat melihat jadwal & materi dari pemateri lain di portal <code className="text-[#0B63CE] bg-white/70 px-1 py-0.5 rounded">/pemateri/jadwal</code>.
                                    </p>
                                </div>
                            </label>
                        </div>
                    )}

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

                    {roleForm.data.role === 'Pemateri' && (
                        <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/70 space-y-2">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={Boolean(roleForm.data.is_supervisor)}
                                    onChange={(e) => roleForm.setData('is_supervisor', e.target.checked)}
                                    className="mt-0.5 w-4 h-4 text-[#0B63CE] rounded border-[#DCE7F3] focus:ring-[#0B63CE]"
                                />
                                <div className="text-xs">
                                    <span className="font-bold text-[#112743] flex items-center gap-1.5">
                                        <Shield className="w-3.5 h-3.5 text-amber-600" />
                                        Tetapkan sebagai Pemateri Supervisor
                                    </span>
                                    <p className="text-[11px] text-[#475569] mt-0.5 leading-normal">
                                        Jika dicentang, pemateri ini berstatus <strong>Supervisor</strong> dan dapat melihat seluruh jadwal & materi pengampu lain di portal <code className="text-[#0B63CE] bg-white/70 px-1 py-0.5 rounded">/pemateri/jadwal</code>. Jika tidak dicentang, pemateri hanya melihat jadwal mengajarnya sendiri (Reguler).
                                    </p>
                                </div>
                            </label>
                        </div>
                    )}

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

            {/* Change Password Modal */}
            <Modal
                isOpen={Boolean(passwordTargetUser)}
                onClose={() => setPasswordTargetUser(null)}
                title="Ubah Password Pengguna"
                description={`Atur kata sandi baru untuk akun "${passwordTargetUser?.name}".`}
                isProcessing={passwordForm.processing}
            >
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="p-3 rounded-lg bg-[#F8FBFF] border border-[#DCE7F3] text-xs space-y-1">
                        <p><span className="text-[#6B7C93]">Pengguna:</span> <span className="font-semibold text-[#112743]">{passwordTargetUser?.name}</span></p>
                        <p><span className="text-[#6B7C93]">Email Akun:</span> <span className="font-mono text-[#112743]">{passwordTargetUser?.email}</span></p>
                        <p><span className="text-[#6B7C93]">Peran:</span> <span className="font-semibold text-[#0B63CE]">{passwordTargetUser?.role}</span></p>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            icon={Wand2}
                            onClick={handleGenerateRandomPassword}
                        >
                            Generate Password Acak
                        </Button>
                    </div>

                    <PasswordInput
                        label="Password Baru"
                        name="password"
                        value={passwordForm.data.password}
                        onChange={(e) => passwordForm.setData('password', e.target.value)}
                        placeholder="Minimal 8 karakter"
                        required
                        error={passwordForm.errors.password}
                        helperText="Pastikan kombinasi password kuat dan mudah diingat."
                    />

                    <PasswordInput
                        label="Konfirmasi Password Baru"
                        name="password_confirmation"
                        value={passwordForm.data.password_confirmation}
                        onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                        placeholder="Ulangi password baru"
                        required
                        error={passwordForm.errors.password_confirmation}
                    />

                    <div className="pt-4 border-t border-[#DCE7F3] flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={passwordForm.processing}
                            onClick={() => setPasswordTargetUser(null)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            loading={passwordForm.processing}
                        >
                            Simpan Password Baru
                        </Button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
