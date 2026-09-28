import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/admin/PageHeader';
import DataTable from '../../../Components/ui/DataTable';
import Button from '../../../Components/ui/Button';
import Modal from '../../../Components/ui/Modal';
import FilterSelect from '../../../Components/admin/FilterSelect';
import StatGrid from '../../../Components/admin/StatGrid';
import TableToolbar from '../../../Components/admin/TableToolbar';
import SpeakerDialogs from './Partials/SpeakerDialogs';
import { UserCheck, Plus, Edit3, Trash2, Shield, Award, Sparkles, Upload, Download } from 'lucide-react';

export default function Index({ speakers, filters = {}, stats = {}, availableEvents = [] }) {
    const [search, setSearch] = useState(filters.q || '');
    const [selectedType, setSelectedType] = useState(filters.type || '');
    const [selectedExpertise, setSelectedExpertise] = useState(filters.expertise || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedEvent, setSelectedEvent] = useState(filters.event_id || '');
    const [selectedScope, setSelectedScope] = useState(filters.scope || '');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editingSpeaker, setEditingSpeaker] = useState(null);

    // Delete state
    const [deletingSpeaker, setDeletingSpeaker] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const importForm = useForm({
        file: null,
        event_id: '',
    });

    const form = useForm({
        name: '',
        title_suffix: '',
        type: 'internal',
        dan_level: 5,
        perkemi_position: 'Dewan Guru PB PERKEMI',
        institution: '',
        primary_expertise: '',
        bio: '',
        internal_contact: '',
        contact_email: '',
        photo_url: '',
        is_active: true,
        is_supervisor: false,
        event_id: '',
    });

    const applyFilters = (customParams = {}) => {
        const params = {
            q: search,
            type: selectedType,
            expertise: selectedExpertise,
            status: selectedStatus,
            event_id: selectedEvent,
            scope: selectedScope,
            ...customParams,
        };

        Object.keys(params).forEach((key) => {
            if (!params[key]) delete params[key];
        });

        router.get('/admin/master/pemateri', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearchSubmit = () => applyFilters();

    const handleReset = () => {
        setSearch('');
        setSelectedType('');
        setSelectedExpertise('');
        setSelectedStatus('');
        setSelectedEvent('');
        setSelectedScope('');
        router.get('/admin/master/pemateri', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const openCreateModal = () => {
        setEditingSpeaker(null);
        form.setData({
            name: '',
            title_suffix: '',
            type: 'internal',
            dan_level: 4,
            perkemi_position: '',
            institution: '',
            primary_expertise: '',
            bio: '',
            internal_contact: '',
            contact_email: '',
            photo_url: '',
            is_active: true,
            is_supervisor: false,
            event_id: '',
        });
        setIsModalOpen(true);
    };

    const openEditModal = (s) => {
        setEditingSpeaker(s);
        form.setData({
            name: s.name || '',
            title_suffix: s.title_suffix || '',
            type: s.type || 'internal',
            dan_level: s.dan_level || '',
            perkemi_position: s.perkemi_position || '',
            institution: s.institution || '',
            primary_expertise: s.primary_expertise || '',
            bio: s.bio || '',
            internal_contact: s.internal_contact || '',
            contact_email: s.contact_email || '',
            photo_url: s.photo_url || '',
            is_active: Boolean(s.is_active),
            is_supervisor: Boolean(s.is_supervisor),
            event_id: s.event_id ? String(s.event_id) : '',
        });
        setIsModalOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (editingSpeaker) {
            form.put(`/admin/master/pemateri/${editingSpeaker.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setEditingSpeaker(null);
                },
            });
        } else {
            form.post('/admin/master/pemateri', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        }
    };

    const handleDelete = () => {
        if (!deletingSpeaker) return;
        setIsDeleting(true);
        router.delete(`/admin/master/pemateri/${deletingSpeaker.id}`, {
            onSuccess: () => {
                setIsDeleting(false);
                setDeletingSpeaker(null);
            },
            onError: () => setIsDeleting(false),
        });
    };

    const columns = [
        {
            header: 'Nama Pemateri & Gelar',
            cell: (row) => (
                <div className="flex items-center gap-3 py-1">
                    <div className="w-10 h-10 rounded-full bg-[#EAF5FF] border border-[#0B63CE]/30 flex items-center justify-center text-[#0B63CE] font-bold text-xs shrink-0">
                        {row.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-semibold text-xs text-[#0E2747] flex items-center gap-1.5">
                            {row.full_name}
                            {row.is_supervisor && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#F59E0B] text-slate-900 border border-amber-300">
                                    <Sparkles className="w-2.5 h-2.5 fill-current" />
                                    Supervisor
                                </span>
                            )}
                        </div>
                        <div className="text-[11px] text-[#6B7C93]">{row.role_info}</div>
                    </div>
                </div>
            ),
        },
        {
            header: 'Tipe',
            cell: (row) => (
                <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.type === 'internal'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                    }`}
                >
                    {row.type_label}
                </span>
            ),
        },
        {
            header: 'Tingkat DAN',
            cell: (row) => (
                <span className="font-mono font-medium text-xs text-[#112743]">
                    {row.dan_roman ? `DAN ${row.dan_roman}` : '-'}
                </span>
            ),
        },
        {
            header: 'Jabatan / Instansi',
            cell: (row) => (
                <div className="text-xs text-[#112743] max-w-[200px] truncate">
                    {row.perkemi_position || row.institution || '-'}
                </div>
            ),
        },
        {
            header: 'Keahlian Utama',
            cell: (row) => (
                <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                    {row.primary_expertise}
                </span>
            ),
        },
        {
            header: 'Modul / Sesi',
            cell: (row) => (
                <div className="text-xs text-[#6B7C93]">
                    <strong className="text-[#0B63CE]">{row.modules_count}</strong> modul •{' '}
                    <strong className="text-[#0E2747]">{row.sessions_count}</strong> sesi
                </div>
            ),
        },
        {
            header: 'Status',
            cell: (row) => (
                <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        row.is_active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                    }`}
                >
                    {row.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
            ),
        },
        {
            header: 'Cakupan / Sumber',
            cell: (row) => row.event_id ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    🎯 {row.event_title || 'Event'}
                </span>
            ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    🌐 Master Diktar
                </span>
            ),
        },
        {
            header: 'Aksi',
            headerClassName: 'text-right',
            cell: (row) => (
                <div className="flex items-center justify-end gap-1.5">
                    {row.event_id && (
                        <Link
                            href={`/admin/event/${row.event_id}`}
                            className="inline-flex items-center text-[11px] font-semibold text-[#0B63CE] hover:underline mr-1"
                        >
                            Event
                        </Link>
                    )}
                    <button
                        type="button"
                        onClick={() => openEditModal(row)}
                        className="p-1.5 text-[#0B63CE] hover:bg-[#EAF5FF] rounded-lg transition-colors"
                        aria-label={`Edit pemateri ${row.name}`}
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setDeletingSpeaker(row)}
                        className="p-1.5 text-[#6B7C93] hover:text-[#DD4D7C] hover:bg-rose-50 rounded-lg transition-colors"
                        aria-label={`Hapus pemateri ${row.name}`}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout>
            <Head title="Master Pemateri & Instruktur" />

            <div className="space-y-6">
                <PageHeader
                    title="Master Pemateri & Instruktur Penataran"
                    description="Kelola profil instruktur internal PERKEMI, dewan guru, dan pakar eksternal (sport science, fisiologi, psikologi olahraga)."
                    breadcrumbs={[
                        { label: 'Event', href: '/admin/event' },
                        { label: 'Pemateri' },
                    ]}
                    action={
                        <div className="flex flex-wrap items-center gap-2">
                            <a
                                href={`/admin/master/pemateri/ekspor${selectedScope ? `?scope=${selectedScope}` : ''}`}
                                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#DCE7F3] bg-white px-3 py-1.5 text-xs font-semibold text-[#0E2747] shadow-2xs hover:bg-[#F8FBFF] hover:border-[#0B63CE]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                            >
                                <Download className="w-3.5 h-3.5 text-[#0B63CE]" />
                                <span>Ekspor CSV</span>
                            </a>
                            <a
                                href="/admin/master/pemateri/template"
                                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#DCE7F3] bg-white px-3 py-1.5 text-xs font-semibold text-[#0E2747] shadow-2xs hover:bg-[#F8FBFF] hover:border-[#0B63CE]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                                download="template-pemateri.csv"
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
                                Impor Pemateri
                            </Button>
                            <Button
                                size="sm"
                                variant="primary"
                                icon={<Plus className="w-4 h-4" />}
                                onClick={openCreateModal}
                            >
                                Tambah Pemateri Baru
                            </Button>
                        </div>
                    }
                />

                <StatGrid items={[
                    { key: 'total', label: 'Total Pemateri', value: stats.total_speakers || 0, description: 'Seluruh profil pemateri', icon: UserCheck, tone: 'blue' },
                    { key: 'internal', label: 'Pemateri Internal PERKEMI', value: stats.internal_count || 0, description: 'Instruktur dari internal organisasi', icon: Award, tone: 'navy' },
                    { key: 'external', label: 'Pakar & Eksternal', value: stats.external_count || 0, description: 'Pemateri dari luar organisasi', icon: Sparkles, tone: 'green' },
                    { key: 'active', label: 'Instruktur Aktif', value: stats.active_count || 0, description: 'Pemateri dengan status aktif', icon: Shield, tone: 'orange' },
                ]} />

                <div className="overflow-hidden rounded-xl border border-[#DCE7F3] bg-white shadow-xs">
                    <TableToolbar
                        search={search}
                        onSearchChange={setSearch}
                        onSearchSubmit={handleSearchSubmit}
                        searchPlaceholder="Cari nama, keahlian, jabatan, atau instansi…"
                        searchLabel="Cari pemateri"
                        hasActiveFilters={Boolean(search || selectedType || selectedExpertise || selectedStatus || selectedEvent || selectedScope)}
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
                            options={[
                                { value: 'master', label: 'Master Diktar (Lintas Event)' },
                                ...availableEvents.map((ev) => ({
                                    value: String(ev.id),
                                    label: `Event: ${ev.name}`,
                                })),
                            ]}
                        />
                        <FilterSelect
                            value={selectedType}
                            onChange={(value) => {
                                setSelectedType(value);
                                applyFilters({ type: value });
                            }}
                            placeholder="Semua Tipe"
                            ariaLabel="Filter tipe pemateri"
                            options={[
                                { value: 'internal', label: 'Pemateri Internal' },
                                { value: 'external', label: 'Pemateri Eksternal' },
                            ]}
                        />
                        <FilterSelect
                            value={selectedStatus}
                            onChange={(value) => {
                                setSelectedStatus(value);
                                applyFilters({ status: value });
                            }}
                            placeholder="Semua Status"
                            ariaLabel="Filter status pemateri"
                            options={[
                                { value: 'active', label: 'Aktif' },
                                { value: 'inactive', label: 'Nonaktif' },
                            ]}
                        />
                        {availableEvents.length > 0 && (
                            <FilterSelect
                                value={selectedEvent}
                                onChange={(value) => {
                                    setSelectedEvent(value);
                                    applyFilters({ event_id: value });
                                }}
                                placeholder="Semua Event"
                                ariaLabel="Filter event pemateri"
                                options={availableEvents.map((event) => ({ value: event.id, label: event.name }))}
                                className="min-w-48"
                            />
                        )}
                    </TableToolbar>
                </div>

                {/* Table */}
                <DataTable
                    columns={columns}
                    data={speakers.data}
                    pagination={speakers}
                    emptyTitle="Belum Ada Data Pemateri"
                    emptyDescription="Tidak ditemukan pemateri yang sesuai kriteria filter."
                />
            </div>

            <SpeakerDialogs
                availableEvents={availableEvents}
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                isImportModalOpen={isImportModalOpen}
                setIsImportModalOpen={setIsImportModalOpen}
                editingSpeaker={editingSpeaker}
                deletingSpeaker={deletingSpeaker}
                setDeletingSpeaker={setDeletingSpeaker}
                isDeleting={isDeleting}
                importForm={importForm}
                form={form}
                handleSave={handleSave}
                handleDelete={handleDelete}
            />
        </AdminLayout>
    );
}
