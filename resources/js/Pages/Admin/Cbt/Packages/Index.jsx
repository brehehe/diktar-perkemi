import React, { useState, useMemo } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../../Layouts/AdminLayout';
import PageHeader from '../../../../Components/admin/PageHeader';
import Button from '../../../../Components/ui/Button';
import Badge from '../../../../Components/ui/Badge';
import Modal from '../../../../Components/ui/Modal';
import AlertDialog from '../../../../Components/ui/AlertDialog';
import FormField from '../../../../Components/ui/FormField';
import Input from '../../../../Components/ui/Input';
import Select from '../../../../Components/ui/Select';
import Textarea from '../../../../Components/ui/Textarea';
import Combobox from '../../../../Components/ui/Combobox';
import Checkbox from '../../../../Components/ui/Checkbox';
import FileInput from '../../../../Components/ui/FileInput';
import FilterSelect from '../../../../Components/admin/FilterSelect';
import StatGrid from '../../../../Components/admin/StatGrid';
import TableSurface from '../../../../Components/admin/TableSurface';
import TableToolbar from '../../../../Components/admin/TableToolbar';
import {
    CheckSquare,
    Plus,
    Edit3,
    Trash2,
    CheckCircle2,
    Clock,
    Award,
    Eye,
    ChevronRight,
    HelpCircle,
    Check,
    X,
    Layers,
    PlayCircle,
    Lock,
    Unlock,
    Users,
    Activity,
    SlidersHorizontal,
    Upload,
    Download,
    FileSpreadsheet,
} from 'lucide-react';

import { CbtPackagesContext } from './Partials/CbtPackagesContext';
import CbtPackagesDialogs from './Partials/CbtPackagesDialogs';

export default function Index({
    packages,
    questionModules = [],
    tracks = [],
    events = [],
    stats = {},
    filters = {},
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedExamType, setSelectedExamType] = useState(filters.exam_type || '');
    const [selectedScope, setSelectedScope] = useState(filters.scope || '');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [packageToDelete, setPackageToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const importForm = useForm({
        file: null,
        event_id: '',
    });

    const form = useForm({
        code: '',
        title: '',
        description: '',
        exam_type: 'theory_exam',
        question_module_id: questionModules[0]?.id || '',
        question_module_ids: questionModules[0]?.id ? [Number(questionModules[0].id)] : [],
        question_module_quotas: {},
        selection_method: 'random',
        auto_sync_module_questions: true,
        target_tracks: ['PD', 'PN'],
        duration_minutes: 60,
        passing_score: 75.0,
        attempts_allowed: 1,
        randomize_questions: true,
        randomize_answers: true,
        result_display: 'immediate',
        instructions: 'Bacalah setiap soal dengan teliti. Pilih satu jawaban yang paling tepat. Waktu ujian akan berjalan otomatis saat tombol Mulai Ujian ditekan.',
        status: 'draft',
        event_id: '',
    });

    const applyFilters = (overrides = {}) => {
        router.get(
            '/admin/cbt/paket-ujian',
            { search: searchTerm, status: selectedStatus, exam_type: selectedExamType, scope: selectedScope, ...overrides },
            { preserveState: true, replace: true }
        );
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedStatus('');
        setSelectedExamType('');
        setSelectedScope('');
        router.get('/admin/cbt/paket-ujian', {}, { preserveState: true, replace: true });
    };

    const openCreateModal = () => {
        form.reset();
        const initialModuleId = questionModules[0]?.id ? Number(questionModules[0].id) : null;
        const initialQuotas = {};
        if (initialModuleId) {
            const firstMod = questionModules.find((m) => m.id === initialModuleId);
            initialQuotas[initialModuleId] = {
                mode: 'all',
                count: firstMod?.questions_count || null,
            };
        }

        form.setData({
            code: 'CBT-' + Math.floor(1000 + Math.random() * 9000),
            title: '',
            description: '',
            exam_type: 'theory_exam',
            question_module_id: initialModuleId || '',
            question_module_ids: initialModuleId ? [initialModuleId] : [],
            question_module_quotas: initialQuotas,
            selection_method: 'random',
            auto_sync_module_questions: true,
            target_tracks: ['PD', 'PN'],
            duration_minutes: 60,
            passing_score: 75.0,
            attempts_allowed: 1,
            randomize_questions: true,
            randomize_answers: true,
            result_display: 'immediate',
            instructions: 'Bacalah setiap soal dengan teliti. Pilih satu jawaban yang paling tepat. Waktu ujian akan berjalan otomatis saat tombol Mulai Ujian ditekan.',
            status: 'draft',
            event_id: '',
        });
        setIsCreateModalOpen(true);
    };

    const handleAddModule = (moduleId) => {
        if (!moduleId) return;
        const numId = Number(moduleId);
        const current = form.data.question_module_ids || [];
        if (!current.includes(numId)) {
            const updated = [...current, numId];
            const mod = questionModules.find((m) => m.id === numId);
            const currentQuotas = { ...(form.data.question_module_quotas || {}) };
            currentQuotas[numId] = {
                mode: 'all',
                count: mod?.questions_count || null,
            };
            form.setData({
                ...form.data,
                question_module_ids: updated,
                question_module_id: updated[0] || '',
                question_module_quotas: currentQuotas,
            });
        }
    };

    const handleRemoveModule = (moduleId) => {
        const numId = Number(moduleId);
        const current = form.data.question_module_ids || [];
        const updated = current.filter((id) => id !== numId);
        const currentQuotas = { ...(form.data.question_module_quotas || {}) };
        delete currentQuotas[numId];
        delete currentQuotas[String(numId)];
        form.setData({
            ...form.data,
            question_module_ids: updated,
            question_module_id: updated[0] || '',
            question_module_quotas: currentQuotas,
        });
    };

    const handleSetModuleQuotaMode = (moduleId, mode) => {
        const quotas = { ...(form.data.question_module_quotas || {}) };
        const mod = questionModules.find((m) => m.id === Number(moduleId));
        const prevCount = quotas[moduleId]?.count || (mod?.questions_count ? Math.min(20, mod.questions_count) : 10);
        quotas[moduleId] = {
            mode,
            count: mode === 'all' ? (mod?.questions_count || null) : prevCount,
        };
        form.setData('question_module_quotas', quotas);
    };

    const handleSetModuleQuotaCount = (moduleId, count) => {
        const quotas = { ...(form.data.question_module_quotas || {}) };
        quotas[moduleId] = {
            mode: 'custom',
            count: Math.max(1, parseInt(count, 10) || 1),
        };
        form.setData('question_module_quotas', quotas);
    };

    const estimatedTotalQuestions = useMemo(() => {
        const ids = form.data.question_module_ids || [];
        const quotas = form.data.question_module_quotas || {};
        let total = 0;
        for (const id of ids) {
            const mod = questionModules.find((m) => m.id === id);
            const qConfig = quotas[id];
            if (qConfig?.mode === 'custom' && qConfig.count) {
                total += Math.min(Number(qConfig.count), mod?.questions_count || Number(qConfig.count));
            } else {
                total += mod?.questions_count || 0;
            }
        }
        return total;
    }, [form.data.question_module_ids, form.data.question_module_quotas, questionModules]);

    const handleSaveCreate = (e) => {
        e.preventDefault();
        form.post('/admin/cbt/paket-ujian', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                form.reset();
            },
        });
    };

    const toggleTrackCode = (code) => {
        const current = form.data.target_tracks || [];
        if (current.includes(code)) {
            form.setData('target_tracks', current.filter((c) => c !== code));
        } else {
            form.setData('target_tracks', [...current, code]);
        }
    };

    const dialogContext = {
        questionModules,
        tracks,
        events,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isImportModalOpen,
        setIsImportModalOpen,
        packageToDelete,
        setPackageToDelete,
        isDeleting,
        setIsDeleting,
        importForm,
        form,
        handleAddModule,
        handleRemoveModule,
        handleSetModuleQuotaMode,
        handleSetModuleQuotaCount,
        estimatedTotalQuestions,
        handleSaveCreate,
        toggleTrackCode,
    };

    return (
        <CbtPackagesContext.Provider value={dialogContext}>
        <AdminLayout title="Paket Ujian CBT">
            <Head title="Master Paket CBT — Admin PERKEMI" />

            <PageHeader
                title="Paket Ujian CBT"
                description="Konfigurasikan paket ujian dari Bank Soal untuk digunakan pada sesi rundown event."
                breadcrumbs={[{ label: 'Event', href: '/admin/event' }, { label: 'Paket Ujian' }]}
                action={
                    <div className="flex flex-wrap items-center gap-2">
                        <a
                            href={`/admin/cbt/paket-ujian/ekspor${selectedScope ? `?scope=${selectedScope}` : ''}`}
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#DCE7F3] bg-white px-3 py-1.5 text-xs font-semibold text-[#0E2747] shadow-2xs hover:bg-[#F8FBFF] hover:border-[#0B63CE]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                        >
                            <Download className="w-3.5 h-3.5 text-[#0B63CE]" />
                            <span>Ekspor CSV</span>
                        </a>
                        <a
                            href="/admin/cbt/paket-ujian/template"
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#DCE7F3] bg-white px-3 py-1.5 text-xs font-semibold text-[#0E2747] shadow-2xs hover:bg-[#F8FBFF] hover:border-[#0B63CE]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                            download="template-paket-cbt.csv"
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
                            Impor Paket
                        </Button>
                        <Button size="sm" icon={Plus} onClick={openCreateModal}>Buat Paket CBT</Button>
                    </div>
                }
            />

            <StatGrid className="mb-6" items={[
                { key: 'total', label: 'Total Paket', value: stats.total || 0, description: 'Paket ujian terdaftar', icon: CheckSquare, tone: 'blue' },
                { key: 'ready', label: 'Siap Digunakan', value: stats.ready || 0, description: 'Paket valid dan terverifikasi', icon: CheckCircle2, tone: 'navy' },
                { key: 'open', label: 'Dibuka / Aktif', value: stats.open || 0, description: 'Dapat dikerjakan peserta', icon: Unlock, tone: 'green' },
                { key: 'attempts', label: 'Total Pengerjaan', value: stats.total_attempts || 0, description: 'Sesi ujian peserta', icon: Activity, tone: 'purple' },
            ]} />

            <div className="mb-6 overflow-hidden rounded-xl border border-[#DCE7F3] bg-white shadow-xs">
                <TableToolbar
                    search={searchTerm}
                    onSearchChange={setSearchTerm}
                    onSearchSubmit={() => applyFilters()}
                    searchPlaceholder="Cari nama atau kode paket CBT…"
                    searchLabel="Cari paket ujian"
                    hasActiveFilters={Boolean(searchTerm || selectedExamType || selectedStatus || selectedScope)}
                    onReset={resetFilters}
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
                            ...events.map((ev) => ({
                                value: String(ev.id),
                                label: `Event: ${ev.title}`,
                            })),
                        ]}
                    />
                    <FilterSelect value={selectedExamType} onChange={(value) => {
                        setSelectedExamType(value);
                        applyFilters({ exam_type: value });
                    }} placeholder="Semua Jenis" ariaLabel="Filter jenis ujian" options={[
                        { value: 'theory_exam', label: 'Ujian Teori' },
                        { value: 'pre_test', label: 'Pre-Test' },
                        { value: 'post_test', label: 'Post-Test' },
                        { value: 'module_eval', label: 'Evaluasi Modul' },
                        { value: 'remedial', label: 'Remedial' },
                    ]} />
                    <FilterSelect value={selectedStatus} onChange={(value) => {
                        setSelectedStatus(value);
                        applyFilters({ status: value });
                    }} placeholder="Semua Status" ariaLabel="Filter status paket ujian" options={[
                        { value: 'ready', label: 'Siap Digunakan' },
                        { value: 'open', label: 'Dibuka' },
                        { value: 'draft', label: 'Draft' },
                        { value: 'closed', label: 'Ditutup' },
                        { value: 'archived', label: 'Diarsipkan' },
                    ]} />
                </TableToolbar>
            </div>

            {/* Table of CBT Packages */}
            <TableSurface pagination={packages} ariaLabel="Daftar paket ujian CBT">
                <table className="w-full text-left text-xs text-[#112743]">
                        <thead className="bg-[#F8FBFF] text-[#6B7C93] uppercase font-mono text-[10px] tracking-wider border-b border-[#DCE7F3]">
                            <tr>
                                <th className="px-4 py-3">Kode & Nama Paket</th>
                                <th className="px-4 py-3">Modul Soal</th>
                                <th className="px-4 py-3">Jenis Ujian</th>
                                <th className="px-4 py-3 text-center">Durasi</th>
                                <th className="px-4 py-3 text-center">KKM</th>
                                <th className="px-4 py-3 text-center">Jml Soal</th>
                                <th className="px-4 py-3 text-center">Pengerjaan</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DCE7F3]">
                            {packages.data.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-12 text-center text-[#6B7C93]">
                                        <CheckSquare className="w-8 h-8 mx-auto text-[#6B7C93]/40 mb-2" />
                                        <p className="font-semibold text-sm text-[#0E2747]">Belum ada paket CBT.</p>
                                        <p className="text-xs text-[#6B7C93] mt-1">
                                            Konfigurasikan paket ujian CBT pertama Anda.
                                        </p>
                                        <Button onClick={openCreateModal} size="sm" className="mt-3 bg-[#0B63CE] text-white">
                                            Buat Paket Sekarang
                                        </Button>
                                    </td>
                                </tr>
                            ) : (
                                packages.data.map((pkg) => (
                                    <tr key={pkg.id} className="hover:bg-[#F8FBFF]/60 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-[11px] font-bold text-[#0B63CE]">
                                                        {pkg.code}
                                                    </span>
                                                    {pkg.event ? (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                            🎯 {pkg.event.title}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                            🌐 Master Diktar
                                                        </span>
                                                    )}
                                                </div>
                                                <Link
                                                    href={`/admin/cbt/paket-ujian/${pkg.id}`}
                                                    className="font-bold text-[#0E2747] text-xs hover:text-[#0B63CE] transition-colors mt-0.5"
                                                >
                                                    {pkg.title}
                                                </Link>
                                                <span className="text-[10px] text-[#6B7C93] line-clamp-1 max-w-xs mt-0.5">
                                                    {pkg.description || 'Tidak ada deskripsi'}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            {pkg.blueprint_modules && pkg.blueprint_modules.length > 0 ? (
                                                <div className="flex flex-wrap gap-1 max-w-xs">
                                                    {pkg.blueprint_modules.map((m) => (
                                                        <span
                                                            key={m.id}
                                                            className="px-1.5 py-0.5 rounded bg-blue-50 text-[#0B63CE] border border-blue-200 text-[10px] font-mono font-semibold"
                                                            title={m.title}
                                                        >
                                                            {m.code}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : pkg.question_module ? (
                                                <span className="font-medium text-[#0E2747] line-clamp-1">
                                                    {pkg.question_module.title}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 italic">Umum / Bebas</span>
                                            )}
                                        </td>

                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700">
                                                {pkg.exam_type_label || pkg.exam_type}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 text-center font-mono">
                                            {pkg.duration_minutes}m
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <span className="font-mono font-bold text-emerald-700">
                                                {pkg.passing_score}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 text-center font-mono font-bold text-[#0B63CE]">
                                            {pkg.bank_questions_count || pkg.total_questions || 0}
                                        </td>

                                        <td className="px-4 py-3 text-center font-mono text-slate-600">
                                            {pkg.attempts_count || 0}
                                        </td>

                                        <td className="px-4 py-3">
                                            <Badge
                                                variant={
                                                    pkg.status === 'open'
                                                        ? 'success'
                                                        : pkg.status === 'ready'
                                                        ? 'primary'
                                                        : pkg.status === 'draft'
                                                        ? 'warning'
                                                        : 'secondary'
                                                }
                                            >
                                                {pkg.status_label || pkg.status}
                                            </Badge>
                                        </td>

                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={`/admin/cbt/paket-ujian/${pkg.id}`}
                                                    className="px-2.5 py-1 rounded bg-[#EAF5FF] text-[#0B63CE] hover:bg-[#0B63CE] hover:text-white text-xs font-semibold transition-colors"
                                                >
                                                    Kelola
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => setPackageToDelete(pkg)}
                                                    className="p-1.5 text-[#6B7C93] hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                                    title="Hapus Paket CBT"
                                                    aria-label={`Hapus paket ujian ${pkg.title}`}
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

            <CbtPackagesDialogs />
        </AdminLayout>
        </CbtPackagesContext.Provider>
    );
}
