import React, { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/admin/PageHeader';
import DataTable from '../../../Components/ui/DataTable';
import Button from '../../../Components/ui/Button';
import Modal from '../../../Components/ui/Modal';
import FilterSelect from '../../../Components/admin/FilterSelect';
import StatGrid from '../../../Components/admin/StatGrid';
import TableToolbar from '../../../Components/admin/TableToolbar';
import ParticipantDialogs from './Partials/ParticipantDialogs';
import { GraduationCap, Plus, Edit3, Trash2, Award, Calendar, ChevronRight, UserCheck, CheckCircle, Upload, Download } from 'lucide-react';
import { useIsProdas } from '../../../Utils/isProdas';

export default function Index({ participants, filters = {}, stats = {}, availableTracks = [], events = [] }) {
    const isProdas = useIsProdas();
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

    const [photoPreview, setPhotoPreview] = useState(null);

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
        photo: null,
        remove_photo: false,
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
        setPhotoPreview(null);
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
            photo: null,
            remove_photo: false,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (p) => {
        setEditingParticipant(p);
        setPhotoPreview(p.photo_url || null);
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
            photo: null,
            remove_photo: false,
        });
        setIsModalOpen(true);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData((prev) => ({ ...prev, photo: file, remove_photo: false }));
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleRemovePhoto = () => {
        form.setData((prev) => ({ ...prev, photo: null, remove_photo: true }));
        setPhotoPreview(null);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (editingParticipant) {
            form.post(`/admin/master/peserta/${editingParticipant.id}`, {
                forceFormData: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    setEditingParticipant(null);
                    setPhotoPreview(null);
                },
            });
        } else {
            form.post('/admin/master/peserta', {
                forceFormData: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                    setPhotoPreview(null);
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
                    <div className="w-10 h-10 rounded-full bg-[#EAF5FF] border border-[#0B63CE]/30 flex items-center justify-center text-[#0B63CE] font-bold text-xs shrink-0 overflow-hidden shadow-xs">
                        {row.photo_url ? (
                            <img src={row.photo_url} alt={row.name} className="w-full h-full object-cover" />
                        ) : (
                            row.name.substring(0, 2).toUpperCase()
                        )}
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
            header: isProdas ? 'Riwayat Gashuku & UKT' : 'Sertifikasi & Riwayat',
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

            <ParticipantDialogs
                availableTracks={availableTracks}
                events={events}
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                isImportModalOpen={isImportModalOpen}
                setIsImportModalOpen={setIsImportModalOpen}
                editingParticipant={editingParticipant}
                deletingParticipant={deletingParticipant}
                setDeletingParticipant={setDeletingParticipant}
                isDeleting={isDeleting}
                importForm={importForm}
                photoPreview={photoPreview}
                form={form}
                handlePhotoChange={handlePhotoChange}
                handleRemovePhoto={handleRemovePhoto}
                handleSave={handleSave}
                handleDelete={handleDelete}
            />
        </AdminLayout>
    );
}
