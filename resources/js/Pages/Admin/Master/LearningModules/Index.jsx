import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../../Layouts/AdminLayout';
import PageHeader from '../../../../Components/admin/PageHeader';
import Button from '../../../../Components/ui/Button';
import Badge from '../../../../Components/ui/Badge';
import Modal from '../../../../Components/ui/Modal';
import FormField from '../../../../Components/ui/FormField';
import Input from '../../../../Components/ui/Input';
import Select from '../../../../Components/ui/Select';
import Textarea from '../../../../Components/ui/Textarea';
import Checkbox from '../../../../Components/ui/Checkbox';
import Combobox from '../../../../Components/ui/Combobox';
import FileInput from '../../../../Components/ui/FileInput';
import FilterSelect from '../../../../Components/admin/FilterSelect';
import StatGrid from '../../../../Components/admin/StatGrid';
import TableSurface from '../../../../Components/admin/TableSurface';
import TableToolbar from '../../../../Components/admin/TableToolbar';
import {
    BookMarked,
    Plus,
    Edit3,
    Trash2,
    Archive,
    ExternalLink,
    BookOpen,
    Layers,
    Calendar,
    CheckCircle2,
    Clock,
    Award,
    Eye,
    ChevronRight,
    ArrowUpDown,
    Check,
    X,
    FileText,
    Link2,
    Upload,
} from 'lucide-react';

import { LearningModuleContext } from './Partials/LearningModuleContext';
import LearningModuleDialogs from './Partials/LearningModuleDialogs';

export default function Index({
    modules,
    tracks = [],
    categories = [],
    materialCategories = [],
    availableMaterials = [],
    events = [],
    stats = {},
    filters = {},
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category && filters.category !== 'all' ? filters.category : '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status && filters.status !== 'all' ? filters.status : '');
    const [selectedTrack, setSelectedTrack] = useState(filters.track && filters.track !== 'all' ? filters.track : '');
    const [selectedScope, setSelectedScope] = useState(filters.scope && filters.scope !== 'all' ? filters.scope : '');

    // Modals state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const importForm = useForm({ file: null });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isManageMaterialsModalOpen, setIsManageMaterialsModalOpen] = useState(false);
    const [materialModalTab, setMaterialModalTab] = useState('upload'); // 'upload' | 'select'
    const [isLinkEventModalOpen, setIsLinkEventModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [activeModule, setActiveModule] = useState(null);
    const [selectedMaterialId, setSelectedMaterialId] = useState('');

    // Form: Create / Edit Module
    const moduleForm = useForm({
        event_id: '',
        code: '',
        title: '',
        category: 'Kurikulum Inti',
        description: '',
        track_codes: [],
        target_roles: ['Pelatih', 'Penguji', 'Wasit'],
        total_jp: 2,
        level: 'Dasar',
        status: 'draft',
        learning_objectives: [''],
        competency_outcomes: [''],
        keywords: '',
        material_file: null,
    });

    // Form: Upload New Material to Module
    const uploadMaterialForm = useForm({
        file: null,
        title: '',
        author: '',
        category_id: materialCategories[0]?.id || '',
        is_required: true,
        estimated_duration_minutes: 45,
        instructor_notes: '',
    });

    // Form: Manage Materials inside Module
    const materialsForm = useForm({
        materials: [],
    });

    // Form: Link to Event
    const linkEventForm = useForm({
        event_id: events[0]?.id || '',
        participant_path_id: '',
        is_required: true,
    });

    const applyFilters = (overrides = {}) => {
        router.get(
            '/admin/master/modul-pembelajaran',
            {
                search: searchTerm,
                category: selectedCategory,
                status: selectedStatus,
                track: selectedTrack,
                scope: selectedScope,
                ...overrides,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedStatus('');
        setSelectedTrack('');
        setSelectedScope('');
        router.get('/admin/master/modul-pembelajaran');
    };

    const openCreateModal = () => {
        moduleForm.reset();
        moduleForm.setData({
            event_id: '',
            code: '',
            title: '',
            category: 'Kurikulum Inti',
            description: '',
            track_codes: ['PD', 'PN'],
            target_roles: ['Pelatih'],
            total_jp: 2,
            level: 'Dasar',
            status: 'active',
            learning_objectives: [''],
            competency_outcomes: [''],
            keywords: '',
        });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (mod) => {
        setActiveModule(mod);
        moduleForm.setData({
            event_id: mod.event_id || '',
            code: mod.code,
            title: mod.title,
            category: mod.category,
            description: mod.description || '',
            track_codes: mod.track_codes || [],
            target_roles: mod.target_roles || [],
            total_jp: mod.total_jp || 2,
            level: mod.level || 'Dasar',
            status: mod.status || 'draft',
            learning_objectives: mod.learning_objectives?.length ? mod.learning_objectives : [''],
            competency_outcomes: mod.competency_outcomes?.length ? mod.competency_outcomes : [''],
            keywords: mod.keywords || '',
        });
        setIsEditModalOpen(true);
    };

    const openManageMaterialsModal = (mod, defaultTab = 'upload') => {
        setActiveModule(mod);
        setMaterialModalTab(defaultTab);
        uploadMaterialForm.reset();
        uploadMaterialForm.setData({
            file: null,
            title: '',
            author: '',
            category_id: materialCategories[0]?.id || '',
            is_required: true,
            estimated_duration_minutes: 45,
            instructor_notes: '',
        });
        const currentMaterials = (mod.materials || []).map((m, idx) => ({
            material_id: m.id,
            title: m.title,
            slug: m.slug,
            type: m.type,
            sort_order: m.pivot?.sort_order || idx + 1,
            is_required: m.pivot?.is_required ?? true,
            instructor_notes: m.pivot?.instructor_notes || '',
            estimated_duration_minutes: m.pivot?.estimated_duration_minutes || 45,
        }));
        materialsForm.setData({ materials: currentMaterials });
        setIsManageMaterialsModalOpen(true);
    };

    const handleUploadMaterial = (e) => {
        e.preventDefault();
        if (!activeModule) return;
        uploadMaterialForm.post(`/admin/master/modul-pembelajaran/${activeModule.id}/upload-materi`, {
            forceFormData: true,
            onSuccess: () => {
                uploadMaterialForm.reset();
                setIsManageMaterialsModalOpen(false);
                setActiveModule(null);
            },
        });
    };

    const openLinkEventModal = (mod) => {
        setActiveModule(mod);
        linkEventForm.setData({
            event_id: events[0]?.id || '',
            participant_path_id: mod.track_codes?.[0] || '',
            is_required: true,
        });
        setIsLinkEventModalOpen(true);
    };

    const openDetailModal = (mod) => {
        setActiveModule(mod);
        setIsDetailModalOpen(true);
    };

    const handleSaveCreate = (e) => {
        e.preventDefault();
        moduleForm.post('/admin/master/modul-pembelajaran', {
            forceFormData: true,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                moduleForm.reset();
            },
        });
    };

    const handleSaveEdit = (e) => {
        e.preventDefault();
        if (!activeModule) return;
        moduleForm.put(`/admin/master/modul-pembelajaran/${activeModule.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setActiveModule(null);
            },
        });
    };

    const handleSaveMaterials = (e) => {
        e.preventDefault();
        if (!activeModule) return;
        materialsForm.put(`/admin/master/modul-pembelajaran/${activeModule.id}/materi`, {
            onSuccess: () => {
                setIsManageMaterialsModalOpen(false);
                setActiveModule(null);
            },
        });
    };

    const handleSaveLinkEvent = (e) => {
        e.preventDefault();
        if (!activeModule) return;
        linkEventForm.post(`/admin/master/modul-pembelajaran/${activeModule.id}/hubungkan-event`, {
            onSuccess: () => {
                setIsLinkEventModalOpen(false);
                setActiveModule(null);
            },
        });
    };

    const handleArchive = (mod) => {
        if (confirm(`Arsipkan modul "${mod.title}"? Modul tidak akan aktif untuk event baru.`)) {
            router.patch(`/admin/master/modul-pembelajaran/${mod.id}/arsip`);
        }
    };

    const handleDelete = (mod) => {
        if (confirm(`Hapus modul "${mod.title}"? Tindakan ini hanya diizinkan jika modul belum digunakan oleh Event atau Rundown.`)) {
            router.delete(`/admin/master/modul-pembelajaran/${mod.id}`);
        }
    };

    // Helper to toggle track codes
    const toggleTrackCode = (code) => {
        const current = moduleForm.data.track_codes || [];
        if (current.includes(code)) {
            moduleForm.setData('track_codes', current.filter((c) => c !== code));
        } else {
            moduleForm.setData('track_codes', [...current, code]);
        }
    };

    // Material list management helpers
    const addMaterialToModule = (material) => {
        const exists = materialsForm.data.materials.some((m) => m.material_id === material.id);
        if (exists) return;

        const nextOrder = materialsForm.data.materials.length + 1;
        materialsForm.setData('materials', [
            ...materialsForm.data.materials,
            {
                material_id: material.id,
                title: material.title,
                type: material.type,
                sort_order: nextOrder,
                is_required: true,
                instructor_notes: '',
                estimated_duration_minutes: 45,
            },
        ]);
    };

    const removeMaterialFromModule = (materialId) => {
        materialsForm.setData(
            'materials',
            materialsForm.data.materials.filter((m) => m.material_id !== materialId)
        );
    };

    const dialogContext = {
        tracks,
        materialCategories,
        availableMaterials,
        events,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isImportModalOpen,
        setIsImportModalOpen,
        importForm,
        isEditModalOpen,
        setIsEditModalOpen,
        isManageMaterialsModalOpen,
        setIsManageMaterialsModalOpen,
        materialModalTab,
        setMaterialModalTab,
        isLinkEventModalOpen,
        setIsLinkEventModalOpen,
        isDetailModalOpen,
        setIsDetailModalOpen,
        activeModule,
        setActiveModule,
        selectedMaterialId,
        setSelectedMaterialId,
        moduleForm,
        uploadMaterialForm,
        materialsForm,
        linkEventForm,
        handleUploadMaterial,
        handleSaveCreate,
        handleSaveEdit,
        handleSaveMaterials,
        handleSaveLinkEvent,
        toggleTrackCode,
        addMaterialToModule,
        removeMaterialFromModule,
    };

    return (
        <LearningModuleContext.Provider value={dialogContext}>
        <AdminLayout title="Master Modul Pembelajaran">
            <Head title="Master Modul Pembelajaran — Admin PERKEMI" />

            <PageHeader
                title="Master Modul Pembelajaran"
                description="Kurikulum standar PERKEMI yang terhubung ke Koleksi Digital dan siap digunakan lintas event."
                breadcrumbs={[{ label: 'Event', href: '/admin/event' }, { label: 'Modul Pembelajaran' }]}
                secondaryAction={<Button size="sm" variant="secondary" onClick={() => setIsImportModalOpen(true)}>Impor CSV</Button>}
                action={<Button size="sm" icon={Plus} onClick={openCreateModal}>Tambah Modul</Button>}
            />

            <StatGrid className="mb-6" items={[
                { key: 'total', label: 'Total Modul', value: stats.total || 0, description: 'Kurikulum pembelajaran terdaftar', icon: BookMarked, tone: 'blue' },
                { key: 'active', label: 'Modul Aktif', value: stats.active || 0, description: 'Siap digunakan pada event', icon: CheckCircle2, tone: 'green' },
                { key: 'draft', label: 'Draft', value: stats.draft || 0, description: 'Dalam tahap penyusunan', icon: Clock, tone: 'orange' },
                { key: 'materials', label: 'Koleksi Terhubung', value: stats.total_materials_linked || 0, description: 'E-book, video, dan dokumen', icon: BookOpen, tone: 'purple' },
            ]} />

            <div className="mb-6 overflow-hidden rounded-xl border border-[#DCE7F3] bg-white shadow-xs">
                <TableToolbar
                    search={searchTerm}
                    onSearchChange={setSearchTerm}
                    onSearchSubmit={() => applyFilters()}
                    searchPlaceholder="Cari nama, kode, atau kata kunci…"
                    searchLabel="Cari modul pembelajaran"
                    hasActiveFilters={Boolean(searchTerm || selectedCategory || selectedTrack || selectedStatus || selectedScope)}
                    onReset={handleResetFilters}
                >
                    <FilterSelect
                        value={selectedScope}
                        onChange={(value) => {
                            setSelectedScope(value);
                            applyFilters({ scope: value });
                        }}
                        placeholder="Semua Cakupan"
                        ariaLabel="Filter cakupan modul"
                        options={[
                            { value: 'master', label: 'Master Diktar (Lintas Event)' },
                            ...events.map((ev) => ({
                                value: String(ev.id),
                                label: `Event: ${ev.title}`,
                            })),
                        ]}
                    />
                    <FilterSelect value={selectedCategory} onChange={(value) => {
                        setSelectedCategory(value);
                        applyFilters({ category: value });
                    }} placeholder="Semua Kategori" ariaLabel="Filter kategori modul" options={categories.map((category) => ({ value: category, label: category }))} />
                    <FilterSelect value={selectedTrack} onChange={(value) => {
                        setSelectedTrack(value);
                        applyFilters({ track: value });
                    }} placeholder="Semua Jalur" ariaLabel="Filter jalur modul" options={tracks.map((track) => ({ value: track.code, label: `${track.code} — ${track.name}` }))} />
                    <FilterSelect value={selectedStatus} onChange={(value) => {
                        setSelectedStatus(value);
                        applyFilters({ status: value });
                    }} placeholder="Semua Status" ariaLabel="Filter status modul" options={[
                        { value: 'active', label: 'Aktif' },
                        { value: 'draft', label: 'Draft' },
                        { value: 'inactive', label: 'Nonaktif' },
                        { value: 'archived', label: 'Diarsipkan' },
                    ]} />
                </TableToolbar>
            </div>

            {/* Table of Learning Modules */}
            <TableSurface pagination={modules} ariaLabel="Daftar modul pembelajaran">
                <table className="w-full text-left text-xs text-[#112743]">
                        <thead className="bg-[#F8FBFF] text-[#6B7C93] uppercase font-mono text-[10px] tracking-wider border-b border-[#DCE7F3]">
                            <tr>
                                <th className="px-4 py-3">Kode & Modul</th>
                                <th className="px-4 py-3">Kategori & Level</th>
                                <th className="px-4 py-3">Jalur Peserta</th>
                                <th className="px-4 py-3 text-center">Total JP</th>
                                <th className="px-4 py-3 text-center">Materi Koleksi</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DCE7F3]">
                            {modules.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-[#6B7C93]">
                                        <BookMarked className="w-8 h-8 mx-auto text-[#6B7C93]/40 mb-2" />
                                        <p className="font-semibold text-sm text-[#0E2747]">Belum ada modul pembelajaran.</p>
                                        <p className="text-xs text-[#6B7C93] mt-1">
                                            Silakan tambahkan modul baru untuk kurikulum penataran PERKEMI.
                                        </p>
                                        <Button onClick={openCreateModal} size="sm" className="mt-3 bg-[#0B63CE] text-white">
                                            Tambah Modul Sekarang
                                        </Button>
                                    </td>
                                </tr>
                            ) : (
                                modules.data.map((mod) => (
                                    <tr key={mod.id} className="hover:bg-[#F8FBFF]/60 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="font-mono text-[11px] font-bold text-[#0B63CE]">
                                                        {mod.code}
                                                    </span>
                                                    {mod.event ? (
                                                        <span
                                                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200"
                                                            title={`Khusus Event: ${mod.event.title}`}
                                                        >
                                                            🎯 Khusus: {mod.event.title.length > 20 ? `${mod.event.title.substring(0, 20)}…` : mod.event.title}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                            🌐 Master Diktar
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="font-bold text-[#0E2747] text-xs hover:text-[#0B63CE] cursor-pointer mt-0.5" onClick={() => openDetailModal(mod)}>
                                                    {mod.title}
                                                </span>
                                                <span className="text-[10px] text-[#6B7C93] line-clamp-1 max-w-xs mt-0.5">
                                                    {mod.description || 'Tidak ada deskripsi'}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium text-[#0E2747]">{mod.category}</span>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 w-fit">
                                                    Level: {mod.level}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1 max-w-xs">
                                                {(mod.track_codes || []).map((tc) => {
                                                    const trk = tracks.find((t) => t.code === tc);
                                                    return (
                                                        <span
                                                            key={tc}
                                                            className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white"
                                                            style={{ backgroundColor: trk?.color || '#0B63CE' }}
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
                                            <span className="font-mono font-bold text-xs text-[#0E2747]">
                                                {mod.total_jp} JP
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <div className="inline-flex items-center justify-center gap-1.5 flex-wrap">
                                                <button
                                                    type="button"
                                                    onClick={() => openManageMaterialsModal(mod, 'select')}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EAF5FF] text-[#0B63CE] hover:bg-[#0B63CE] hover:text-white font-semibold text-xs transition-colors"
                                                    title="Kelola Materi Digital Koleksi"
                                                >
                                                    <BookOpen className="w-3.5 h-3.5" />
                                                    <span>{mod.materials_count || 0} Materi</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => openManageMaterialsModal(mod, 'upload')}
                                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-semibold text-[11px] transition-colors border border-emerald-200"
                                                    title="Unggah Berkas PDF Materi Baru"
                                                >
                                                    <Upload className="w-3 h-3" />
                                                    <span>Unggah</span>
                                                </button>
                                            </div>
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
                                                <button
                                                    type="button"
                                                    onClick={() => openDetailModal(mod)}
                                                    className="p-1.5 text-[#6B7C93] hover:text-[#0B63CE] hover:bg-slate-100 rounded-md transition-colors"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => openManageMaterialsModal(mod, 'upload')}
                                                    className="p-1.5 text-[#6B7C93] hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                                    title="Unggah Materi PDF Baru"
                                                >
                                                    <Upload className="w-4 h-4" />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => openManageMaterialsModal(mod, 'select')}
                                                    className="p-1.5 text-[#6B7C93] hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                                    title="Kelola & Hubungkan Materi Koleksi"
                                                >
                                                    <BookOpen className="w-4 h-4" />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => openLinkEventModal(mod)}
                                                    className="p-1.5 text-[#6B7C93] hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                                    title="Hubungkan ke Event"
                                                >
                                                    <Link2 className="w-4 h-4" />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(mod)}
                                                    className="p-1.5 text-[#6B7C93] hover:text-[#0E2747] hover:bg-slate-100 rounded-md transition-colors"
                                                    title="Edit Modul"
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

            <LearningModuleDialogs />
        </AdminLayout>
        </LearningModuleContext.Provider>
    );
}
