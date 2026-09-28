import React, { useState, useMemo } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../../Layouts/AdminLayout';
import PageHeader from '../../../../Components/admin/PageHeader';
import Button from '../../../../Components/ui/Button';
import { CheckCircle2, Lock, PlayCircle, Edit3, SlidersHorizontal } from 'lucide-react';

import { CbtPackageContext } from './Partials/CbtPackageContext';
import CbtPackageDialogs from './Partials/CbtPackageDialogs';
import CbtPackageQuestions from './Partials/CbtPackageQuestions';

export default function Show({
    package: pkg,
    availableQuestions = [],
    tracks = [],
    questionModules = [],
}) {
    const [isAddQuestionsModalOpen, setIsAddQuestionsModalOpen] = useState(false);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState(
        (pkg.bank_questions || []).map((q) => q.id)
    );

    // Table pagination and filter for Selected Questions
    const [selectedPage, setSelectedPage] = useState(1);
    const [selectedPageSize, setSelectedPageSize] = useState(10);
    const [selectedSearch, setSelectedSearch] = useState('');
    const [selectedModuleFilter, setSelectedModuleFilter] = useState('');

    const [filterModuleId, setFilterModuleId] = useState('');
    const [filterStage, setFilterStage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const editForm = useForm({
        title: pkg.title || '',
        code: pkg.code || '',
        description: pkg.description || '',
        exam_type: pkg.exam_type || 'theory_exam',
        duration_minutes: pkg.duration_minutes || 60,
        passing_score: pkg.passing_score || 75.0,
        attempts_allowed: pkg.attempts_allowed || 1,
        randomize_questions: Boolean(pkg.randomize_questions),
        randomize_answers: Boolean(pkg.randomize_answers),
        result_display: pkg.result_display || 'immediate',
        instructions: pkg.instructions || '',
        status: pkg.status || 'draft',
        target_tracks: pkg.target_tracks || ['PD', 'PN'],
    });

    const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);

    const getInitialQuotas = () => {
        const quotas = {};
        (pkg.blueprint_modules || []).forEach((m) => {
            quotas[m.id] = {
                mode: m.quota_mode || (m.quota_count ? 'custom' : 'all'),
                count: m.quota_count || m.active_questions_count || 10,
            };
        });
        return quotas;
    };

    const quotaForm = useForm({
        question_module_quotas: getInitialQuotas(),
        selection_method: 'random',
    });

    const openQuotaModal = () => {
        quotaForm.setData({
            question_module_quotas: getInitialQuotas(),
            selection_method: 'random',
        });
        setIsQuotaModalOpen(true);
    };

    const handleSetQuotaMode = (moduleId, mode) => {
        const quotas = { ...(quotaForm.data.question_module_quotas || {}) };
        const mod = (pkg.blueprint_modules || []).find((m) => m.id === Number(moduleId));
        const prevCount = quotas[moduleId]?.count || (mod?.active_questions_count ? Math.min(20, mod.active_questions_count) : 10);
        quotas[moduleId] = {
            mode,
            count: mode === 'all' ? (mod?.active_questions_count || null) : prevCount,
        };
        quotaForm.setData('question_module_quotas', quotas);
    };

    const handleSetQuotaCount = (moduleId, count) => {
        const quotas = { ...(quotaForm.data.question_module_quotas || {}) };
        quotas[moduleId] = {
            mode: 'custom',
            count: Math.max(1, parseInt(count, 10) || 1),
        };
        quotaForm.setData('question_module_quotas', quotas);
    };

    const estimatedQuotaTotal = useMemo(() => {
        const modules = pkg.blueprint_modules || [];
        const quotas = quotaForm.data.question_module_quotas || {};
        let total = 0;
        for (const m of modules) {
            const qConfig = quotas[m.id];
            if (qConfig?.mode === 'custom' && qConfig.count) {
                total += Math.min(Number(qConfig.count), m.active_questions_count || Number(qConfig.count));
            } else {
                total += m.active_questions_count || 0;
            }
        }
        return total;
    }, [pkg.blueprint_modules, quotaForm.data.question_module_quotas]);

    const handleApplyQuotas = (e) => {
        e.preventDefault();
        if ((pkg.attempts || []).length > 0) {
            alert('Susunan butir soal telah terkunci karena sudah ada peserta yang mengerjakan.');
            return;
        }
        quotaForm.post(`/admin/cbt/paket-ujian/${pkg.id}/tarik-soal-modul`, {
            onSuccess: () => setIsQuotaModalOpen(false),
        });
    };

    // Filtered & Paginated Selected Questions
    const filteredQuestions = useMemo(() => {
        let list = pkg.bank_questions || [];
        if (selectedModuleFilter) {
            list = list.filter(
                (q) =>
                    String(q.question_module_id) === String(selectedModuleFilter) ||
                    String(q.question_module?.id) === String(selectedModuleFilter)
            );
        }
        if (selectedSearch.trim()) {
            const query = selectedSearch.toLowerCase();
            list = list.filter((q) => {
                const matchText = (q.question_text || '').toLowerCase().includes(query);
                const matchCode = (q.code || '').toLowerCase().includes(query);
                return matchText || matchCode;
            });
        }
        return list;
    }, [pkg.bank_questions, selectedModuleFilter, selectedSearch]);

    const totalPages = Math.ceil(filteredQuestions.length / selectedPageSize) || 1;
    const currentPage = Math.min(selectedPage, totalPages);

    const paginatedQuestions = useMemo(() => {
        const start = (currentPage - 1) * selectedPageSize;
        return filteredQuestions.slice(start, start + selectedPageSize);
    }, [filteredQuestions, currentPage, selectedPageSize]);

    const pageNumbers = useMemo(() => {
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    }, [totalPages, currentPage]);

    const handleSaveEdit = (e) => {
        e.preventDefault();
        editForm.put(`/admin/cbt/paket-ujian/${pkg.id}`, {
            onSuccess: () => setIsEditModalOpen(false),
        });
    };

    const hasAttempts = (pkg.attempts || []).length > 0;

    const filteredAvailableQuestions = availableQuestions.filter((q) => {
        if (filterModuleId && String(q.question_module_id) !== String(filterModuleId)) {
            return false;
        }
        if (filterStage && q.exam_stage !== filterStage) {
            return false;
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const matchText = (q.question_text || '').toLowerCase().includes(query);
            const matchCode = (q.code || '').toLowerCase().includes(query);
            if (!matchText && !matchCode) return false;
        }
        return true;
    });

    const handleSelectAllFiltered = () => {
        const filteredIds = filteredAvailableQuestions.map((q) => q.id);
        const next = Array.from(new Set([...selectedQuestionIds, ...filteredIds]));
        setSelectedQuestionIds(next);
    };

    const handleDeselectAllFiltered = () => {
        const filteredIds = new Set(filteredAvailableQuestions.map((q) => q.id));
        const next = selectedQuestionIds.filter((id) => !filteredIds.has(id));
        setSelectedQuestionIds(next);
    };

    const selectedBreakdown = React.useMemo(() => {
        const counts = {};
        for (const id of selectedQuestionIds) {
            const q = availableQuestions.find((item) => item.id === id);
            const modCode = q?.question_module?.code || 'Lainnya';
            counts[modCode] = (counts[modCode] || 0) + 1;
        }
        return counts;
    }, [selectedQuestionIds, availableQuestions]);

    const handleToggleQuestion = (id) => {
        if (hasAttempts) {
            alert('Susunan butir soal telah terkunci karena sudah ada peserta yang mengerjakan.');
            return;
        }
        if (selectedQuestionIds.includes(id)) {
            setSelectedQuestionIds(selectedQuestionIds.filter((qId) => qId !== id));
        } else {
            setSelectedQuestionIds([...selectedQuestionIds, id]);
        }
    };

    const handleSaveQuestions = () => {
        router.post(
            `/admin/cbt/paket-ujian/${pkg.id}/soal`,
            { question_ids: selectedQuestionIds },
            {
                onSuccess: () => setIsAddQuestionsModalOpen(false),
            }
        );
    };

    const handlePullFromModules = () => {
        if (confirm('Tarik dan sinkronkan seluruh butir soal aktif dari modul blueprint yang terhubung ke paket ujian ini?')) {
            router.post(`/admin/cbt/paket-ujian/${pkg.id}/tarik-soal-modul`);
        }
    };

    const handleSetReady = () => {
        router.patch(`/admin/cbt/paket-ujian/${pkg.id}/status`, { status: 'ready' });
    };

    const handleSetOpen = () => {
        router.patch(`/admin/cbt/paket-ujian/${pkg.id}/status`, { status: 'open' });
    };

    const handleSetClosed = () => {
        router.patch(`/admin/cbt/paket-ujian/${pkg.id}/status`, { status: 'closed' });
    };

    const handleDelete = () => {
        setIsDeleteDialogOpen(true);
    };

    const dialogContext = {
        pkg,
        availableQuestions,
        questionModules,
        isAddQuestionsModalOpen,
        setIsAddQuestionsModalOpen,
        selectedQuestionIds,
        filterModuleId,
        setFilterModuleId,
        filterStage,
        setFilterStage,
        searchQuery,
        setSearchQuery,
        isEditModalOpen,
        setIsEditModalOpen,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        isDeleting,
        setIsDeleting,
        editForm,
        isQuotaModalOpen,
        setIsQuotaModalOpen,
        quotaForm,
        handleSetQuotaMode,
        handleSetQuotaCount,
        estimatedQuotaTotal,
        handleApplyQuotas,
        handleSaveEdit,
        filteredAvailableQuestions,
        handleSelectAllFiltered,
        handleDeselectAllFiltered,
        selectedBreakdown,
        handleToggleQuestion,
        handleSaveQuestions,
    };

    return (
        <CbtPackageContext.Provider value={dialogContext}>
        <AdminLayout title={`Paket CBT: ${pkg.title}`}>
            <Head title={`Paket CBT: ${pkg.title} — Admin PERKEMI`} />

            <PageHeader
                title={pkg.title}
                description={`Paket ${pkg.code} • ${pkg.status_label || pkg.status}`}
                breadcrumbs={[
                    { label: 'Event', href: '/admin/event' },
                    { label: 'Paket Ujian', href: '/admin/cbt/paket-ujian' },
                    { label: pkg.title },
                ]}
                action={
                    <div className="flex flex-wrap items-center gap-2">
                        {!hasAttempts && (
                            <>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    icon={Edit3}
                                    onClick={() => setIsEditModalOpen(true)}
                                >
                                    Edit Pengaturan
                                </Button>
                                {(pkg.blueprint_modules?.length > 0 || pkg.question_module) && (
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        icon={SlidersHorizontal}
                                        onClick={openQuotaModal}
                                    >
                                        Atur Kuota Modul
                                    </Button>
                                )}
                            </>
                        )}

                        {pkg.status === 'draft' && (
                            <Button size="sm" icon={CheckCircle2} onClick={handleSetReady}>
                                Validasi & Set Siap Digunakan
                            </Button>
                        )}

                        {pkg.status === 'ready' && (
                            <Button size="sm" icon={PlayCircle} onClick={handleSetOpen}>
                                Buka Ujian (Aktifkan)
                            </Button>
                        )}

                        {pkg.status === 'open' && (
                            <Button size="sm" icon={Lock} onClick={handleSetClosed} variant="secondary">
                                Tutup Ujian
                            </Button>
                        )}
                    </div>
                }
            />

            {/* Lock alert if attempts exist */}
            {hasAttempts && (
                <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900 text-xs">
                    <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold">Susunan Butir Soal Terkunci (Snapshot Active)</p>
                        <p className="mt-0.5 text-amber-800">
                            Paket ujian ini telah memiliki rekaman pengerjaan dari {pkg.attempts.length} peserta. Susunan soal tidak dapat diubah lagi untuk menjaga konsistensi nilai dan keadilan ujian.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <CbtPackageQuestions
                    pkg={pkg}
                    setIsAddQuestionsModalOpen={setIsAddQuestionsModalOpen}
                    setSelectedPage={setSelectedPage}
                    selectedPageSize={selectedPageSize}
                    setSelectedPageSize={setSelectedPageSize}
                    selectedSearch={selectedSearch}
                    setSelectedSearch={setSelectedSearch}
                    selectedModuleFilter={selectedModuleFilter}
                    setSelectedModuleFilter={setSelectedModuleFilter}
                    openQuotaModal={openQuotaModal}
                    filteredQuestions={filteredQuestions}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    paginatedQuestions={paginatedQuestions}
                    pageNumbers={pageNumbers}
                    hasAttempts={hasAttempts}
                />

                {/* Right Col: Configuration & Rules */}
                <div className="space-y-4">
                    <div className="p-5 rounded-xl bg-white border border-[#DCE7F3] shadow-2xs space-y-4 text-xs">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-sm text-[#0E2747] font-display">
                                Aturan & Konfigurasi Ujian
                            </h2>
                            {!hasAttempts && (
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="text-xs font-semibold text-[#0B63CE] hover:underline"
                                >
                                    Ubah
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between py-1 border-b border-slate-100">
                                <span className="text-[#6B7C93]">Jenis Ujian:</span>
                                <span className="font-semibold text-[#0E2747]">{pkg.exam_type_label}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100">
                                <span className="text-[#6B7C93]">Durasi Pengerjaan:</span>
                                <span className="font-bold text-[#0E2747]">{pkg.duration_minutes} Menit</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100">
                                <span className="text-[#6B7C93]">Standar Kelulusan (KKM):</span>
                                <span className="font-bold text-emerald-700">{pkg.passing_score}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100">
                                <span className="text-[#6B7C93]">Batas Percobaan:</span>
                                <span className="font-semibold text-[#0E2747]">{pkg.attempts_allowed}x Percobaan</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100">
                                <span className="text-[#6B7C93]">Acak Soal:</span>
                                <span className="font-semibold text-[#0E2747]">{pkg.randomize_questions ? 'Ya' : 'Tidak'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100">
                                <span className="text-[#6B7C93]">Acak Pilihan:</span>
                                <span className="font-semibold text-[#0E2747]">{pkg.randomize_answers ? 'Ya' : 'Tidak'}</span>
                            </div>
                        </div>

                        <div className="p-3 rounded-lg bg-[#F8FBFF] border border-[#DCE7F3] space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase font-mono text-[#6B7C93] block font-bold">
                                    Modul Blueprint & Kuota
                                </span>
                                {(pkg.blueprint_modules?.length > 0 || pkg.question_module) && !hasAttempts && (
                                    <button
                                        type="button"
                                        onClick={openQuotaModal}
                                        className="text-[11px] font-semibold text-[#0B63CE] hover:underline flex items-center gap-1"
                                    >
                                        <SlidersHorizontal className="w-3 h-3" />
                                        Atur
                                    </button>
                                )}
                            </div>
                            {pkg.blueprint_modules && pkg.blueprint_modules.length > 0 ? (
                                <div className="space-y-2">
                                    {pkg.blueprint_modules.map((m) => (
                                        <div key={m.id} className="p-2.5 rounded-lg bg-white border border-[#DCE7F3] shadow-2xs space-y-1">
                                            <div className="flex items-center justify-between gap-1">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <span className="font-mono text-[10px] font-bold text-[#0B63CE] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 shrink-0">
                                                        {m.code}
                                                    </span>
                                                    <span className="font-bold text-[#0E2747] text-xs truncate" title={m.title}>
                                                        {m.title}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-medium text-[#6B7C93] bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                                                    Bank: {m.active_questions_count ?? 0}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                                                <span className="text-[#6B7C93]">
                                                    Aturan: <strong className="text-[#0E2747]">{m.quota_mode === 'custom' ? `Kustom (${m.quota_count} butir)` : 'Ambil Semua'}</strong>
                                                </span>
                                                <span className="text-[#0B63CE] font-bold text-[11px]">
                                                    {m.selected_count ?? 0} butir aktif
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {!hasAttempts && (
                                        <Button
                                            onClick={openQuotaModal}
                                            size="xs"
                                            variant="secondary"
                                            className="w-full text-xs mt-1"
                                            icon={SlidersHorizontal}
                                        >
                                            Atur Kuota / Sinkronkan Soal
                                        </Button>
                                    )}
                                </div>
                            ) : pkg.question_module ? (
                                <div className="p-2 rounded bg-white border border-[#DCE7F3]">
                                    <p className="font-bold text-[#0E2747] text-xs">
                                        {pkg.question_module.title}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-slate-400 italic text-xs">
                                    Gabungan / Lintas Modul Bebas
                                </p>
                            )}
                        </div>

                        <div>
                            <span className="text-[10px] uppercase font-mono text-[#6B7C93] block mb-1">
                                Instruksi Ujian
                            </span>
                            <p className="text-[11px] text-[#6B7C93] p-2.5 rounded bg-slate-50 border border-slate-200">
                                {pkg.instructions || 'Tidak ada instruksi khusus.'}
                            </p>
                        </div>

                        {!hasAttempts && (
                            <div className="pt-2 border-t border-[#DCE7F3]">
                                <Button onClick={handleDelete} variant="secondary" className="w-full text-rose-600 hover:bg-rose-50 text-xs">
                                    Hapus Paket Ujian
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <CbtPackageDialogs />
        </AdminLayout>
        </CbtPackageContext.Provider>
    );
}
