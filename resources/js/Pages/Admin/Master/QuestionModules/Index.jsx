import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../../Layouts/AdminLayout';
import PageHeader from '../../../../Components/admin/PageHeader';
import Button from '../../../../Components/ui/Button';
import Badge from '../../../../Components/ui/Badge';
import FilterSelect from '../../../../Components/admin/FilterSelect';
import StatGrid from '../../../../Components/admin/StatGrid';
import TableSurface from '../../../../Components/admin/TableSurface';
import TableToolbar from '../../../../Components/admin/TableToolbar';
import QuestionModuleDialogs from './Partials/QuestionModuleDialogs';
import { FileText, Plus, Edit3, Trash2, Archive, CheckCircle2, Clock, Eye, HelpCircle, Upload, Download } from 'lucide-react';

export default function Index({
    modules,
    tracks = [],
    learningModules = [],
    stats = {},
    filters = {},
    events = [],
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status && filters.status !== 'all' ? filters.status : '');
    const [selectedTrack, setSelectedTrack] = useState(filters.track && filters.track !== 'all' ? filters.track : '');
    const [selectedScope, setSelectedScope] = useState(filters.scope || '');

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [activeModule, setActiveModule] = useState(null);
    const [moduleToDelete, setModuleToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const importForm = useForm({
        file: null,
        event_id: '',
    });

    const form = useForm({
        code: '',
        title: '',
        category: 'Evaluasi Teori',
        description: '',
        track_codes: ['PD', 'PN'],
        tested_competencies: [''],
        assessment_indicators: [''],
        evaluation_purpose: '',
        default_weight: 1.0,
        passing_grade: 75.0,
        status: 'draft',
        learning_module_id: '',
        event_id: '',
    });

    const handleSearch = () => {
        router.get(
            '/admin/master/modul-soal',
            { search: searchTerm, status: selectedStatus, track: selectedTrack, scope: selectedScope },
            { preserveState: true, replace: true }
        );
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedStatus('');
        setSelectedTrack('');
        setSelectedScope('');
        router.get('/admin/master/modul-soal', {}, { preserveState: true, replace: true });
    };

    const openCreateModal = () => {
        form.reset();
        form.setData({
            code: 'MS-' + Math.floor(100 + Math.random() * 900),
            title: '',
            category: 'Evaluasi Teori',
            description: '',
            track_codes: ['PD', 'PN'],
            tested_competencies: [''],
            assessment_indicators: [''],
            evaluation_purpose: '',
            default_weight: 1.0,
            passing_grade: 75.0,
            status: 'active',
            learning_module_id: learningModules[0]?.id || '',
            event_id: '',
        });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (mod) => {
        setActiveModule(mod);
        form.setData({
            code: mod.code,
            title: mod.title,
            category: mod.category || 'Evaluasi Teori',
            description: mod.description || '',
            track_codes: mod.track_codes || [],
            tested_competencies: mod.tested_competencies?.length ? mod.tested_competencies : [''],
            assessment_indicators: mod.assessment_indicators?.length ? mod.assessment_indicators : [''],
            evaluation_purpose: mod.evaluation_purpose || '',
            default_weight: mod.default_weight || 1.0,
            passing_grade: mod.passing_grade || 75.0,
            status: mod.status || 'draft',
            learning_module_id: mod.learning_module_id || '',
            event_id: mod.event_id ? String(mod.event_id) : '',
        });
        setIsEditModalOpen(true);
    };

    const handleSaveCreate = (e) => {
        e.preventDefault();
        form.post('/admin/master/modul-soal', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                form.reset();
            },
        });
    };

    const handleSaveEdit = (e) => {
        e.preventDefault();
        if (!activeModule) return;
        form.put(`/admin/master/modul-soal/${activeModule.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setActiveModule(null);
            },
        });
    };

    const handleArchive = (mod) => {
        if (confirm(`Arsipkan Modul Soal "${mod.title}"? Modul tidak akan dapat dipilih untuk Paket CBT baru.`)) {
            router.patch(`/admin/master/modul-soal/${mod.id}/arsip`);
        }
    };

    const handleDelete = (mod) => {
        setModuleToDelete(mod);
    };

    const toggleTrackCode = (code) => {
        const current = form.data.track_codes || [];
        if (current.includes(code)) {
            form.setData('track_codes', current.filter((c) => c !== code));
        } else {
            form.setData('track_codes', [...current, code]);
        }
    };

    return (
        <AdminLayout title="Master Modul Soal">
            <Head title="Master Modul Soal — Admin PERKEMI" />

            <PageHeader
                title="Master Modul Soal"
                description="Tentukan ruang lingkup evaluasi, indikator kelulusan, dan wadah bank soal per kompetensi."
                breadcrumbs={[{ label: 'Event', href: '/admin/event' }, { label: 'Modul Soal' }]}
                action={
                    <div className="flex flex-wrap items-center gap-2">
                        <a
                            href={`/admin/master/modul-soal/ekspor${selectedScope ? `?scope=${selectedScope}` : ''}`}
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#DCE7F3] bg-white px-3 py-1.5 text-xs font-semibold text-[#0E2747] shadow-2xs hover:bg-[#F8FBFF] hover:border-[#0B63CE]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                        >
                            <Download className="w-3.5 h-3.5 text-[#0B63CE]" />
                            <span>Ekspor CSV</span>
                        </a>
                        <a
                            href="/admin/master/modul-soal/format-kosong"
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#DCE7F3] bg-white px-3 py-1.5 text-xs font-semibold text-[#0E2747] shadow-2xs hover:bg-[#F8FBFF] hover:border-[#0B63CE]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                            download="format-master-bank-soal-perkemi.xlsx"
                        >
                            <Download className="w-3.5 h-3.5 text-[#0B63CE]" />
                            <span>Format Kosong (.xlsx)</span>
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
                            Impor Bank Soal
                        </Button>
                        <Button size="sm" icon={Plus} onClick={openCreateModal}>
                            Tambah Modul Soal
                        </Button>
                    </div>
                }
            />

            <StatGrid className="mb-6" items={[
                { key: 'total', label: 'Total Modul Soal', value: stats.total || 0, description: 'Blueprint evaluasi terdaftar', icon: FileText, tone: 'blue' },
                { key: 'active', label: 'Modul Aktif', value: stats.active || 0, description: 'Dapat digunakan pada CBT', icon: CheckCircle2, tone: 'green' },
                { key: 'draft', label: 'Draft', value: stats.draft || 0, description: 'Dalam tahap perumusan', icon: Clock, tone: 'orange' },
                { key: 'questions', label: 'Total Butir Soal', value: stats.total_questions || 0, description: 'Butir dalam bank soal', icon: HelpCircle, tone: 'purple' },
            ]} />

            <div className="mb-6 overflow-hidden rounded-xl border border-[#DCE7F3] bg-white shadow-xs">
                <TableToolbar
                    search={searchTerm}
                    onSearchChange={setSearchTerm}
                    onSearchSubmit={handleSearch}
                    searchPlaceholder="Cari nama, kode, atau kategori evaluasi…"
                    searchLabel="Cari modul soal"
                    hasActiveFilters={Boolean(searchTerm || selectedTrack || selectedStatus || selectedScope)}
                    onReset={resetFilters}
                >
                    <FilterSelect
                        value={selectedScope}
                        onChange={(value) => {
                            setSelectedScope(value);
                            router.get(
                                '/admin/master/modul-soal',
                                { search: searchTerm, status: selectedStatus, track: selectedTrack, scope: value },
                                { preserveState: true, replace: true }
                            );
                        }}
                        placeholder="Semua Cakupan"
                        ariaLabel="Filter cakupan event atau nasional"
                        options={[
                            { value: 'master', label: 'Master Diktar (Lintas Event)' },
                            ...events.map((ev) => ({
                                value: String(ev.id),
                                label: `Event: ${ev.title}`,
                            })),
                        ]}
                    />
                    <FilterSelect
                        value={selectedTrack}
                        onChange={(value) => {
                            setSelectedTrack(value);
                            router.get('/admin/master/modul-soal', { search: searchTerm, status: selectedStatus, track: value, scope: selectedScope }, { preserveState: true, replace: true });
                        }}
                        placeholder="Semua Jalur"
                        ariaLabel="Filter jalur peserta"
                        options={tracks.map((track) => ({ value: track.code, label: `${track.code} — ${track.name}` }))}
                    />
                    <FilterSelect
                        value={selectedStatus}
                        onChange={(value) => {
                            setSelectedStatus(value);
                            router.get('/admin/master/modul-soal', { search: searchTerm, status: value, track: selectedTrack, scope: selectedScope }, { preserveState: true, replace: true });
                        }}
                        placeholder="Semua Status"
                        ariaLabel="Filter status modul soal"
                        options={[
                            { value: 'active', label: 'Aktif' },
                            { value: 'draft', label: 'Draft' },
                            { value: 'inactive', label: 'Nonaktif' },
                            { value: 'archived', label: 'Diarsipkan' },
                        ]}
                    />
                </TableToolbar>
            </div>

            {/* Table of Question Modules */}
            <TableSurface pagination={modules} ariaLabel="Daftar modul soal">
                <table className="w-full text-left text-xs text-[#112743]">
                        <thead className="bg-[#F8FBFF] text-[#6B7C93] uppercase font-mono text-[10px] tracking-wider border-b border-[#DCE7F3]">
                            <tr>
                                <th className="px-4 py-3">Kode & Modul Soal</th>
                                <th className="px-4 py-3">Modul Belajar Terkait</th>
                                <th className="px-4 py-3">Jalur Peserta</th>
                                <th className="px-4 py-3 text-center">Standar KKM</th>
                                <th className="px-4 py-3 text-center">Bank Soal</th>
                                <th className="px-4 py-3 text-center">Paket CBT</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DCE7F3]">
                            {modules.data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-[#6B7C93]">
                                        <FileText className="w-8 h-8 mx-auto text-[#6B7C93]/40 mb-2" />
                                        <p className="font-semibold text-sm text-[#0E2747]">Belum ada modul soal.</p>
                                        <p className="text-xs text-[#6B7C93] mt-1">
                                            Buat blueprint modul soal untuk menyusun bank soal dan paket ujian CBT.
                                        </p>
                                        <Button onClick={openCreateModal} size="sm" className="mt-3 bg-[#0B63CE] text-white">
                                            Tambah Modul Soal
                                        </Button>
                                    </td>
                                </tr>
                            ) : (
                                modules.data.map((mod) => (
                                    <tr key={mod.id} className="hover:bg-[#F8FBFF]/60 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-[11px] font-bold text-[#7957D5]">
                                                        {mod.code}
                                                    </span>
                                                    {mod.event ? (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                            🎯 {mod.event.title}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                            🌐 Master Diktar
                                                        </span>
                                                    )}
                                                </div>
                                                <Link
                                                    href={`/admin/master/modul-soal/${mod.id}`}
                                                    className="font-bold text-[#0E2747] text-xs hover:text-[#0B63CE] transition-colors mt-0.5"
                                                >
                                                    {mod.title}
                                                </Link>
                                                <span className="text-[10px] text-[#6B7C93] line-clamp-1 max-w-xs mt-0.5">
                                                    {mod.description || 'Tidak ada deskripsi'}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            {mod.learning_module ? (
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-[#0E2747] line-clamp-1">
                                                        {mod.learning_module.title}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-[#6B7C93]">
                                                        {mod.learning_module.code}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic text-[11px]">Belum ditautkan</span>
                                            )}
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1 max-w-xs">
                                                {(mod.track_codes || []).map((tc) => {
                                                    const trk = tracks.find((t) => t.code === tc);
                                                    return (
                                                        <span
                                                            key={tc}
                                                            className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white"
                                                            style={{ backgroundColor: trk?.color || '#7957D5' }}
                                                            title={trk?.name}
                                                        >
                                                            {tc}
                                                        </span>
                                                    );
                                                })}
                                                {(!mod.track_codes || mod.track_codes.length === 0) && (
                                                    <span className="text-[10px] text-[#6B7C93]">Semua Jalur</span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                {mod.passing_grade}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <Link
                                                href={`/admin/master/bank-soal?module_id=${mod.id}`}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-semibold text-xs transition-colors"
                                            >
                                                <span>{mod.questions_count || 0} Soal</span>
                                            </Link>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <span className="font-mono text-xs font-semibold text-[#6B7C93]">
                                                {mod.cbt_packages_count || 0} Paket
                                            </span>
                                        </td>

                                        <td className="px-4 py-3">
                                            <Badge
                                                variant={
                                                    mod.status === 'active'
                                                        ? 'success'
                                                        : mod.status === 'draft'
                                                        ? 'warning'
                                                        : mod.status === 'archived'
                                                        ? 'danger'
                                                        : 'secondary'
                                                }
                                            >
                                                {mod.status_label || mod.status}
                                            </Badge>
                                        </td>

                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={`/admin/master/modul-soal/${mod.id}`}
                                                    className="p-1.5 text-[#6B7C93] hover:text-[#0B63CE] hover:bg-slate-100 rounded-md transition-colors"
                                                    title="Lihat Detail (5 Tab)"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(mod)}
                                                    className="p-1.5 text-[#6B7C93] hover:text-[#0E2747] hover:bg-slate-100 rounded-md transition-colors"
                                                    title="Edit Modul Soal"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>

                                                {mod.status !== 'archived' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleArchive(mod)}
                                                        className="p-1.5 text-[#6B7C93] hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                                                        title="Arsipkan"
                                                    >
                                                        <Archive className="w-4 h-4" />
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(mod)}
                                                    className="p-1.5 text-[#6B7C93] hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                </table>
            </TableSurface>

            <QuestionModuleDialogs
                events={events}
                learningModules={learningModules}
                tracks={tracks}
                isCreateModalOpen={isCreateModalOpen}
                setIsCreateModalOpen={setIsCreateModalOpen}
                isEditModalOpen={isEditModalOpen}
                setIsEditModalOpen={setIsEditModalOpen}
                isImportModalOpen={isImportModalOpen}
                setIsImportModalOpen={setIsImportModalOpen}
                activeModule={activeModule}
                setActiveModule={setActiveModule}
                moduleToDelete={moduleToDelete}
                setModuleToDelete={setModuleToDelete}
                isDeleting={isDeleting}
                setIsDeleting={setIsDeleting}
                importForm={importForm}
                form={form}
                handleSaveCreate={handleSaveCreate}
                handleSaveEdit={handleSaveEdit}
                toggleTrackCode={toggleTrackCode}
            />
        </AdminLayout>
    );
}
