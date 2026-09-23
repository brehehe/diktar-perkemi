import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/admin/PageHeader';
import DataTable from '../../../Components/ui/DataTable';
import Badge from '../../../Components/ui/Badge';
import Button from '../../../Components/ui/Button';
import Modal from '../../../Components/ui/Modal';
import FormField from '../../../Components/ui/FormField';
import Input from '../../../Components/ui/Input';
import Select from '../../../Components/ui/Select';
import Textarea from '../../../Components/ui/Textarea';
import AlertDialog from '../../../Components/ui/AlertDialog';
import FileInput from '../../../Components/ui/FileInput';
import FilterSelect from '../../../Components/admin/FilterSelect';
import StatGrid from '../../../Components/admin/StatGrid';
import TableToolbar from '../../../Components/admin/TableToolbar';
import {
    GraduationCap,
    Plus,
    Edit3,
    Trash2,
    Eye,
    Shield,
    Phone,
    Mail,
    Award,
    MapPin,
    Calendar,
    ChevronRight,
    UserCheck,
    CheckCircle,
    Upload,
    Download,
    FileSpreadsheet,
} from 'lucide-react';

export default function Index({ participants, filters = {}, stats = {}, availableTracks = [], events = [] }) {
    const [search, setSearch] = useState(filters.q || '');
    const [selectedDan, setSelectedDan] = useState(filters.dan_level || '');
    const [selectedOrigin, setSelectedOrigin] = useState(filters.origin || '');
    const [selectedTrack, setSelectedTrack] = useState(filters.track_id || '');
    const [selectedScope, setSelectedScope] = useState(filters.scope || '');

    // Modal state for Add/Edit Participant
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editingParticipant, setEditingParticipant] = useState(null);

    // Delete state
    const [deletingParticipant, setDeletingParticipant] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const importForm = useForm({
        file: null,
        event_id: '',
        track_code: '',
    });

    const form = useForm({
        name: '',
        email: '',
        kenshi_id: '',
        phone: '',
        origin: '',
        dojo: '',
        dan_level: 2,
        admin_notes: '',
        event_id: '',
    });

    const applyFilters = (customParams = {}) => {
        const params = {
            q: search,
            dan_level: selectedDan,
            origin: selectedOrigin,
            track_id: selectedTrack,
            scope: selectedScope,
            ...customParams,
        };

        Object.keys(params).forEach((key) => {
            if (!params[key]) delete params[key];
        });

        router.get('/admin/master/peserta', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearchSubmit = () => applyFilters();

    const handleReset = () => {
        setSearch('');
        setSelectedDan('');
        setSelectedOrigin('');
        setSelectedTrack('');
        setSelectedScope('');
        router.get('/admin/master/peserta', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const openCreateModal = () => {
        setEditingParticipant(null);
        form.setData({
            name: '',
            email: '',
            kenshi_id: '',
            phone: '',
            origin: '',
            dojo: '',
            dan_level: 2,
            admin_notes: '',
            event_id: '',
        });
        setIsModalOpen(true);
    };

    const openEditModal = (p) => {
        setEditingParticipant(p);
        form.setData({
            name: p.name || '',
            email: p.email || '',
            kenshi_id: p.kenshi_id || '',
            phone: p.phone || '',
            origin: p.origin || '',
            dojo: p.dojo || '',
            dan_level: p.dan_level || 2,
            admin_notes: p.admin_notes || '',
            event_id: p.event_id ? String(p.event_id) : '',
        });
        setIsModalOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (editingParticipant) {
            form.put(`/admin/master/peserta/${editingParticipant.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setEditingParticipant(null);
                },
            });
        } else {
            form.post('/admin/master/peserta', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        }
    };

    const handleDelete = () => {
        if (!deletingParticipant) return;
        setIsDeleting(true);
        router.delete(`/admin/master/peserta/${deletingParticipant.id}`, {
            onSuccess: () => {
                setIsDeleting(false);
                setDeletingParticipant(null);
            },
            onError: () => setIsDeleting(false),
        });
    };

    const columns = [
        {
            header: 'Nama Kenshi & Kontak',
            cell: (row) => (
                <div className="flex items-center gap-3 py-1">
                    <div className="w-10 h-10 rounded-full bg-[#EAF5FF] border border-[#0B63CE]/30 flex items-center justify-center text-[#0B63CE] font-bold text-xs shrink-0">
                        {row.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/admin/master/peserta/${row.id}`}
                                className="font-semibold text-xs text-[#0E2747] hover:text-[#0B63CE] transition-colors"
                            >
                                {row.name}
                            </Link>
                            {row.event_id ? (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                    🎯 {row.event_title || 'Event'}
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    🌐 Master Diktar
                                </span>
                            )}
                        </div>
                        <div className="text-[11px] text-[#6B7C93] flex items-center gap-2 mt-0.5">
                            <span className="font-mono">{row.kenshi_id || 'ID Kenshi -'}</span>
                            <span>•</span>
                            <span>{row.email}</span>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: 'Tingkat DAN',
            cell: (row) => (
                <span className="font-mono font-bold text-xs text-[#0B63CE] bg-[#EAF5FF] px-2 py-0.5 rounded">
                    DAN {row.dan_roman || '-'}
                </span>
            ),
        },
        {
            header: 'Asal Dojo & Daerah',
            cell: (row) => (
                <div className="text-xs">
                    <div className="font-medium text-[#112743]">{row.origin}</div>
                    <div className="text-[11px] text-[#6B7C93]">{row.dojo || '-'}</div>
                </div>
            ),
        },
        {
            header: 'Sertifikasi & Riwayat',
            cell: (row) => (
                <div className="text-xs space-y-1 max-w-[200px]">
                    {row.target_track ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                🎯 {row.target_track}
                            </span>
                        </div>
                    ) : (
                        <span className="text-[#6B7C93] text-[11px]">-</span>
                    )}
                    {row.certifications_history && row.certifications_history.length > 0 ? (
                        <div className="flex items-center gap-1 flex-wrap">
                            {row.certifications_history.slice(0, 2).map((cert, idx) => (
                                <span
                                    key={idx}
                                    title={`${cert.event_title} (${cert.certificate_number || 'Lulus'})`}
                                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium truncate max-w-[170px]"
                                >
                                    📜 {cert.track_name || cert.track_code}
                                </span>
                            ))}
                            {row.certifications_history.length > 2 && (
                                <span className="text-[10px] text-[#6B7C93] font-medium">
                                    +{row.certifications_history.length - 2}
                                </span>
                            )}
                        </div>
                    ) : null}
                </div>
            ),
        },
        {
            header: 'Akun Portal',
            cell: (row) => (
                <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        row.has_account
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                    }`}
                >
                    {row.has_account ? (
                        <>
                            <CheckCircle className="w-3 h-3" />
                            <span>{row.kenshi_id ? 'Login Email / NIK' : 'Terhubung'}</span>
                        </>
                    ) : (
                        'Belum Ada Akun'
                    )}
                </span>
            ),
        },
        {
            header: 'Event Terakhir',
            cell: (row) => (
                <div className="text-xs text-[#112743] max-w-[180px] truncate">
                    {row.latest_event}
                </div>
            ),
        },
        {
            header: 'Aksi',
            headerClassName: 'text-right',
            cell: (row) => (
                <div className="flex items-center justify-end gap-1.5">
                    <Link
                        href={`/admin/master/peserta/${row.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#EAF5FF] text-[#0B63CE] hover:bg-[#DCE7F3] transition-colors"
                    >
                        <span>8 Tab Detail</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                    <button
                        type="button"
                        onClick={() => openEditModal(row)}
                        className="p-1.5 text-[#6B7C93] hover:text-[#0B63CE] hover:bg-[#EAF5FF] rounded-lg transition-colors"
                        title="Edit Profil"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setDeletingParticipant(row)}
                        className="p-1.5 text-[#6B7C93] hover:text-[#DD4D7C] hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Peserta"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout>
            <Head title="Master Peserta Kenshi Penataran" />

            <div className="space-y-6">
                <PageHeader
                    title="Master Peserta Kenshi Penataran"
                    description="Kelola basis data induk kenshi PERKEMI, riwayat kualifikasi DAN, sinkronisasi akun pengguna, dan riwayat penataran."
                    breadcrumbs={[
                        { label: 'Event', href: '/admin/event' },
                        { label: 'Peserta' },
                    ]}
                    action={
                        <div className="flex flex-wrap items-center gap-2">
                            <a
                                href={`/admin/master/peserta/ekspor${selectedScope ? `?scope=${selectedScope}` : ''}`}
                                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#DCE7F3] bg-white px-3 py-1.5 text-xs font-semibold text-[#0E2747] shadow-2xs hover:bg-[#F8FBFF] hover:border-[#0B63CE]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                            >
                                <Download className="w-3.5 h-3.5 text-[#0B63CE]" />
                                <span>Ekspor CSV</span>
                            </a>
                            <a
                                href="/admin/master/peserta/template"
                                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#DCE7F3] bg-white px-3 py-1.5 text-xs font-semibold text-[#0E2747] shadow-2xs hover:bg-[#F8FBFF] hover:border-[#0B63CE]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                                download="template-peserta.csv"
                            >
                                <Download className="w-3.5 h-3.5 text-[#0B63CE]" />
                                <span>Format CSV</span>
                            </a>
                            <Button
                                size="sm"
                                variant="secondary"
                                icon={Upload}
                                onClick={() => {
                                    importForm.reset();
                                    importForm.clearErrors();
                                    setIsImportModalOpen(true);
                                }}
                            >
                                Impor Peserta
                            </Button>
                            <Button
                                size="sm"
                                variant="primary"
                                icon={<Plus className="w-4 h-4" />}
                                onClick={openCreateModal}
                            >
                                Tambah Kenshi Baru
                            </Button>
                        </div>
                    }
                />

                <StatGrid items={[
                    { key: 'total', label: 'Total Kenshi Terdaftar', value: stats.total_participants || 0, description: 'Peserta pada basis data induk', icon: GraduationCap, tone: 'blue' },
                    { key: 'yudansha', label: 'Yudansha (Pemegang DAN)', value: stats.yudansha_count || 0, description: 'Kenshi dengan tingkat DAN', icon: Award, tone: 'navy' },
                    { key: 'linked', label: 'Akun Portal Terhubung', value: stats.linked_accounts || 0, description: 'Peserta yang memiliki akun', icon: UserCheck, tone: 'green' },
                    { key: 'enrollments', label: 'Total Keikutsertaan Event', value: stats.total_enrollments || 0, description: 'Akumulasi pendaftaran event', icon: Calendar, tone: 'orange' },
                ]} />

                <div className="overflow-hidden rounded-xl border border-[#DCE7F3] bg-white shadow-xs">
                    <TableToolbar
                        search={search}
                        onSearchChange={setSearch}
                        onSearchSubmit={handleSearchSubmit}
                        searchPlaceholder="Cari nama kenshi, nomor kenshi, email, atau dojo…"
                        searchLabel="Cari peserta"
                        hasActiveFilters={Boolean(search || selectedDan || selectedOrigin || selectedTrack || selectedScope)}
                        onReset={handleReset}
                    >
                        <FilterSelect
                            value={selectedScope}
                            onChange={(value) => {
                                setSelectedScope(value);
                                applyFilters({ scope: value });
                            }}
                            placeholder="Semua Cakupan"
                            ariaLabel="Filter cakupan event atau nasional"
                            className="w-full sm:w-48 xl:w-52"
                            options={[
                                { value: 'master', label: 'Master Diktar (Lintas Event)' },
                                ...events.map((ev) => ({
                                    value: String(ev.id),
                                    label: `Event: ${ev.title}`,
                                })),
                            ]}
                        />
                        <FilterSelect
                            value={selectedDan}
                            onChange={(value) => {
                                setSelectedDan(value);
                                applyFilters({ dan_level: value });
                            }}
                            placeholder="Semua Tingkat DAN"
                            ariaLabel="Filter tingkat DAN"
                            className="w-full sm:w-36 xl:w-40"
                            options={[
                                { value: '1', label: 'I-DAN' },
                                { value: '2', label: 'II-DAN' },
                                { value: '3', label: 'III-DAN' },
                                { value: '4', label: 'IV-DAN' },
                                { value: '5', label: 'V-DAN' },
                                { value: '6', label: 'VI-DAN' },
                            ]}
                        />
                        <FilterSelect
                            value={selectedTrack}
                            onChange={(value) => {
                                setSelectedTrack(value);
                                applyFilters({ track_id: value });
                            }}
                            placeholder="Semua Jalur"
                            ariaLabel="Filter jalur peserta"
                            className="w-full sm:w-40 xl:w-44"
                            options={availableTracks.map((track) => ({ value: track.id, label: `${track.code} — ${track.name}` }))}
                        />
                    </TableToolbar>
                </div>

                {/* Table */}
                <DataTable
                    columns={columns}
                    data={participants.data}
                    pagination={participants}
                    emptyTitle="Belum Ada Data Peserta"
                    emptyDescription="Tidak ditemukan data kenshi yang sesuai kriteria filter."
                />
            </div>

            {/* Modal Tambah / Edit Peserta */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingParticipant ? `Edit Kenshi: ${editingParticipant.name}` : 'Daftarkan Kenshi Baru'}
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" form="participant-modal-form" variant="primary" loading={form.processing}>
                            {editingParticipant ? 'Simpan Perubahan' : 'Daftarkan Peserta'}
                        </Button>
                    </>
                }
            >
                <form id="participant-modal-form" onSubmit={handleSave} className="space-y-4">
                    <FormField label="Cakupan (Admin / Event)" error={form.errors.event_id}>
                        <Select
                            value={form.data.event_id || ''}
                            onChange={(e) => form.setData('event_id', e.target.value)}
                            options={[
                                { value: '', label: '🌐 Master Nasional / Diktar (Lintas Event)' },
                                ...events.map((ev) => ({
                                    value: String(ev.id),
                                    label: `🎯 Khusus Event: ${ev.title}`,
                                })),
                            ]}
                        />
                    </FormField>

                    <FormField label="Nama Lengkap Kenshi" error={form.errors.name} required>
                        <Input
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            placeholder="Contoh: Budi Santoso"
                            required
                        />
                    </FormField>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Email" error={form.errors.email} required>
                            <Input
                                type="email"
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                                placeholder="budi@perkemi.org"
                                required
                            />
                        </FormField>

                        <FormField label="Nomor Induk Kenshi (NIK)" error={form.errors.kenshi_id}>
                            <Input
                                value={form.data.kenshi_id}
                                onChange={(e) => form.setData('kenshi_id', e.target.value)}
                                placeholder="3501-1994-0012"
                                helperText="NIK bersifat unik dan dapat digunakan untuk login setelah akun portal terhubung."
                            />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Asal Pengprov / Kota" error={form.errors.origin} required>
                            <Input
                                value={form.data.origin}
                                onChange={(e) => form.setData('origin', e.target.value)}
                                placeholder="Jawa Timur / Surabaya"
                                required
                            />
                        </FormField>

                        <FormField label="Nama Dojo Asal" error={form.errors.dojo}>
                            <Input
                                value={form.data.dojo}
                                onChange={(e) => form.setData('dojo', e.target.value)}
                                placeholder="Dojo KONI Jatim"
                            />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Tingkat DAN Saat Ini">
                            <Select
                                value={form.data.dan_level}
                                onChange={(e) => form.setData('dan_level', parseInt(e.target.value) || 1)}
                            >
                                <option value="1">I-DAN</option>
                                <option value="2">II-DAN</option>
                                <option value="3">III-DAN</option>
                                <option value="4">IV-DAN</option>
                                <option value="5">V-DAN</option>
                                <option value="6">VI-DAN</option>
                            </Select>
                        </FormField>

                        <FormField label="Nomor Telepon (Sensitif)" error={form.errors.phone}>
                            <Input
                                value={form.data.phone}
                                onChange={(e) => form.setData('phone', e.target.value)}
                                placeholder="0812-3456-7890"
                            />
                        </FormField>
                    </div>

                    <FormField label="Catatan Tambahan Admin">
                        <Textarea
                            value={form.data.admin_notes}
                            onChange={(e) => form.setData('admin_notes', e.target.value)}
                            rows={2}
                            placeholder="Catatan verifikasi atau riwayat kualifikasi..."
                        />
                    </FormField>
                </form>
            </Modal>

            {/* Alert Dialog Hapus */}
            <AlertDialog
                isOpen={Boolean(deletingParticipant)}
                onClose={() => setDeletingParticipant(null)}
                title="Hapus Kenshi Peserta?"
                description={`Apakah Anda yakin ingin menghapus data kenshi "${deletingParticipant?.name}"?`}
                confirmText={isDeleting ? 'Menghapus...' : 'Hapus Kenshi'}
                cancelText="Batal"
                variant="danger"
                onConfirm={handleDelete}
            />

            {/* Modal: Impor Peserta */}
            <Modal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                title="Impor Data Kenshi Peserta (.csv)"
                description="Unggah berkas CSV untuk mendaftarkan kenshi secara massal."
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsImportModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            form="participant-import-form"
                            disabled={!importForm.data.file || importForm.processing}
                            loading={importForm.processing}
                            className="bg-[#0B63CE] text-white"
                        >
                            {importForm.processing ? 'Mengimpor...' : 'Mulai Impor'}
                        </Button>
                    </>
                }
            >
                <form
                    id="participant-import-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        importForm.post('/admin/master/peserta/impor', {
                            forceFormData: true,
                            onSuccess: () => {
                                importForm.reset();
                                setIsImportModalOpen(false);
                            },
                        });
                    }}
                    className="space-y-4"
                >
                    <div className="rounded-xl border border-[#DCE7F3] bg-[#F8FBFF] p-4 text-xs text-[#112743] space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-[#0E2747] flex items-center gap-1.5">
                                <FileSpreadsheet className="w-4 h-4 text-[#0B63CE]" />
                                Format Peserta CSV
                            </span>
                            <a
                                href="/admin/master/peserta/template"
                                className="font-semibold text-[#0B63CE] hover:underline flex items-center gap-1"
                                download="template-peserta.csv"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Unduh template (.csv)
                            </a>
                        </div>
                        <p className="text-[#6B7C93] leading-relaxed">
                            Format CSV mendukung kolom: <code>name, email, kenshi_id, phone, dan_level, origin, dojo, track_code</code>.
                        </p>
                    </div>

                    <FormField label="Target Cakupan Impor" error={importForm.errors.event_id}>
                        <Select
                            value={importForm.data.event_id || ''}
                            onChange={(e) => importForm.setData('event_id', e.target.value)}
                            options={[
                                { value: '', label: '🌐 Master Nasional / Diktar (Lintas Event)' },
                                ...events.map((ev) => ({
                                    value: String(ev.id),
                                    label: `🎯 Khusus Event: ${ev.title}`,
                                })),
                            ]}
                        />
                    </FormField>

                    <FormField label="Pilih Jalur Default (Opsional)" error={importForm.errors.track_code}>
                        <Select
                            value={importForm.data.track_code || ''}
                            onChange={(e) => importForm.setData('track_code', e.target.value)}
                            options={[
                                { value: '', label: 'Gunakan Jalur dari CSV / Default' },
                                ...availableTracks.map((t) => ({
                                    value: t.code,
                                    label: `${t.code} — ${t.name}`,
                                })),
                            ]}
                        />
                    </FormField>

                    <FileInput
                        id="participant-import-file"
                        name="file"
                        label="Pilih Berkas CSV (.csv)"
                        accept=".csv,text/csv"
                        required
                        onChange={(e) => importForm.setData('file', e.target.files?.[0] || null)}
                        error={importForm.errors.file}
                        helperText="Format berkas harus .csv dengan pemisah koma."
                    />
                </form>
            </Modal>
        </AdminLayout>
    );
}
