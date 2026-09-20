import React, { useState, useMemo } from 'react';
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
import TableSurface from '../../../../Components/admin/TableSurface';
import {
    CheckSquare,
    ArrowLeft,
    CheckCircle2,
    Clock,
    Award,
    HelpCircle,
    Users,
    AlertCircle,
    Plus,
    X,
    Lock,
    Unlock,
    PlayCircle,
    FileText,
    Check,
    Shield,
    Search,
    Filter,
    Layers,
    Edit3,
    Settings,
    SlidersHorizontal,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

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
        if (confirm(`Hapus paket ujian "${pkg.title}"?`)) {
            router.delete(`/admin/cbt/paket-ujian/${pkg.id}`);
        }
    };

    return (
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
                {/* Left 2 Cols: Questions in this Package */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-[#DCE7F3] overflow-hidden shadow-2xs">
                        <div className="p-4 border-b border-[#DCE7F3] flex items-center justify-between">
                            <div>
                                <h2 className="font-bold text-sm text-[#0E2747] font-display flex items-center gap-2">
                                    <CheckSquare className="w-4 h-4 text-[#0B63CE]" />
                                    Daftar Butir Soal Terpilih ({pkg.bank_questions?.length || 0})
                                </h2>
                                <p className="text-xs text-[#6B7C93]">
                                    Soal yang akan diujikan kepada peserta penataran.
                                </p>
                            </div>
                            {!hasAttempts && (
                                <div className="flex items-center gap-2">
                                    {(pkg.blueprint_modules?.length > 0 || pkg.question_module) && (
                                        <Button
                                            onClick={openQuotaModal}
                                            size="sm"
                                            variant="secondary"
                                            icon={SlidersHorizontal}
                                        >
                                            Atur Kuota & Tarik Soal
                                        </Button>
                                    )}
                                    <Button
                                        onClick={() => setIsAddQuestionsModalOpen(true)}
                                        size="sm"
                                        className="bg-[#0B63CE] text-white"
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1" />
                                        Pilih Manual
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Search & Filter Bar */}
                        {pkg.bank_questions && pkg.bank_questions.length > 0 && (
                            <div className="p-3 bg-[#F8FBFF] border-b border-[#DCE7F3] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                                <div className="flex flex-1 items-center gap-2">
                                    <div className="relative flex-1 max-w-sm">
                                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={selectedSearch}
                                            onChange={(e) => {
                                                setSelectedSearch(e.target.value);
                                                setSelectedPage(1);
                                            }}
                                            placeholder="Cari kode atau teks butir soal..."
                                            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-[#DCE7F3] bg-white focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                                        />
                                        {selectedSearch && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedSearch('');
                                                    setSelectedPage(1);
                                                }}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    {pkg.blueprint_modules && pkg.blueprint_modules.length > 1 && (
                                        <select
                                            value={selectedModuleFilter}
                                            onChange={(e) => {
                                                setSelectedModuleFilter(e.target.value);
                                                setSelectedPage(1);
                                            }}
                                            className="py-1.5 px-2.5 text-xs rounded-lg border border-[#DCE7F3] bg-white font-medium text-[#0E2747]"
                                        >
                                            <option value="">Semua Modul ({pkg.bank_questions.length})</option>
                                            {pkg.blueprint_modules.map((m) => (
                                                <option key={m.id} value={m.id}>
                                                    [{m.code}] {m.title}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-auto text-[11px] text-[#6B7C93]">
                                    <span>Tampilkan:</span>
                                    <select
                                        value={selectedPageSize}
                                        onChange={(e) => {
                                            setSelectedPageSize(Number(e.target.value));
                                            setSelectedPage(1);
                                        }}
                                        className="py-1 px-2 text-xs rounded border border-[#DCE7F3] bg-white font-semibold text-[#0E2747]"
                                    >
                                        <option value={10}>10 / hal</option>
                                        <option value={25}>25 / hal</option>
                                        <option value={50}>50 / hal</option>
                                        <option value={100}>100 / hal</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Paginated Questions Table */}
                        {pkg.bank_questions && pkg.bank_questions.length > 0 ? (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-[#DCE7F3] bg-[#F8FBFF]/80 text-[#6B7C93] font-semibold text-[11px] uppercase tracking-wider">
                                                <th className="py-2.5 px-3 text-center w-12">No</th>
                                                <th className="py-2.5 px-3 w-28">Kode Soal</th>
                                                <th className="py-2.5 px-3 w-36">Modul Blueprint</th>
                                                <th className="py-2.5 px-3">Teks Butir Soal</th>
                                                <th className="py-2.5 px-3 w-24">Tahap</th>
                                                <th className="py-2.5 px-3 w-28">Tipe / Level</th>
                                                <th className="py-2.5 px-3 text-right w-16">Poin</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#DCE7F3]">
                                            {paginatedQuestions.length > 0 ? (
                                                paginatedQuestions.map((q, idx) => {
                                                    const globalIdx = (currentPage - 1) * selectedPageSize + idx + 1;
                                                    return (
                                                        <tr key={q.id} className="hover:bg-[#F8FBFF]/70 transition-colors">
                                                            <td className="py-2.5 px-3 text-center font-mono text-xs font-bold text-slate-500">
                                                                {globalIdx}
                                                            </td>
                                                            <td className="py-2.5 px-3 font-mono font-bold text-[#0B63CE] whitespace-nowrap">
                                                                {q.code}
                                                            </td>
                                                            <td className="py-2.5 px-3 whitespace-nowrap">
                                                                {q.question_module?.code ? (
                                                                    <span
                                                                        className="px-1.5 py-0.5 rounded bg-blue-50 text-[#0B63CE] border border-blue-200 text-[10px] font-mono font-bold"
                                                                        title={q.question_module.title}
                                                                    >
                                                                        [{q.question_module.code}]
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-slate-400 text-[10px]">-</span>
                                                                )}
                                                            </td>
                                                            <td className="py-2.5 px-3 font-medium text-[#0E2747] leading-relaxed max-w-md">
                                                                <p className="line-clamp-2" title={q.question_text}>
                                                                    {q.question_text}
                                                                </p>
                                                            </td>
                                                            <td className="py-2.5 px-3 whitespace-nowrap">
                                                                {q.exam_stage ? (
                                                                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                                                        {q.exam_stage === 'pre_test'
                                                                            ? 'Pre-Test'
                                                                            : q.exam_stage === 'quiz'
                                                                            ? 'Kuis'
                                                                            : 'Post-Test'}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-slate-400 text-[10px]">-</span>
                                                                )}
                                                            </td>
                                                            <td className="py-2.5 px-3 whitespace-nowrap text-[10px] text-[#6B7C93]">
                                                                <span className="block uppercase font-mono">{q.question_type}</span>
                                                                <span className="capitalize">{q.difficulty_level}</span>
                                                            </td>
                                                            <td className="py-2.5 px-3 font-mono text-xs font-bold text-[#0E2747] text-right whitespace-nowrap">
                                                                {q.points || 1} Poin
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={7} className="py-8 text-center text-xs text-[#6B7C93]">
                                                        Tidak ada butir soal yang sesuai dengan pencarian atau filter modul.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Table Pagination Footer */}
                                <div className="p-3 border-t border-[#DCE7F3] bg-[#F8FBFF]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                    <div className="text-[#6B7C93]">
                                        Menampilkan{' '}
                                        <strong className="text-[#0E2747]">
                                            {filteredQuestions.length > 0 ? (currentPage - 1) * selectedPageSize + 1 : 0}
                                        </strong>{' '}
                                        -{' '}
                                        <strong className="text-[#0E2747]">
                                            {Math.min(currentPage * selectedPageSize, filteredQuestions.length)}
                                        </strong>{' '}
                                        dari <strong className="text-[#0E2747]">{filteredQuestions.length}</strong> butir soal
                                        {filteredQuestions.length !== (pkg.bank_questions?.length || 0) && (
                                            <span className="ml-1 text-[#6B7C93]">
                                                (difilter dari {pkg.bank_questions?.length || 0} butir)
                                            </span>
                                        )}
                                    </div>

                                    {totalPages > 1 && (
                                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                                            <Button
                                                size="xs"
                                                variant="secondary"
                                                disabled={currentPage <= 1}
                                                onClick={() => setSelectedPage((p) => Math.max(1, p - 1))}
                                                className="px-2 text-xs"
                                            >
                                                <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
                                                Sebelumnya
                                            </Button>

                                            <div className="flex items-center gap-1">
                                                {pageNumbers.map((p, idx) =>
                                                    p === '...' ? (
                                                        <span key={`ellipsis-${idx}`} className="px-1 text-slate-400">
                                                            ...
                                                        </span>
                                                    ) : (
                                                        <button
                                                            key={p}
                                                            type="button"
                                                            onClick={() => setSelectedPage(p)}
                                                            className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${
                                                                currentPage === p
                                                                    ? 'bg-[#0B63CE] text-white'
                                                                    : 'bg-white border border-[#DCE7F3] text-[#0E2747] hover:bg-slate-50'
                                                            }`}
                                                        >
                                                            {p}
                                                        </button>
                                                    )
                                                )}
                                            </div>

                                            <Button
                                                size="xs"
                                                variant="secondary"
                                                disabled={currentPage >= totalPages}
                                                onClick={() => setSelectedPage((p) => Math.min(totalPages, p + 1))}
                                                className="px-2 text-xs"
                                            >
                                                Selanjutnya
                                                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="p-12 text-center text-xs text-[#6B7C93]">
                                <HelpCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                                <p className="font-bold text-sm text-[#0E2747]">Paket CBT belum memiliki butir soal.</p>
                                <p className="mt-1">
                                    Tentukan kuota per modul atau pilih secara manual dari bank soal.
                                </p>
                                <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                                    {(pkg.blueprint_modules?.length > 0 || pkg.question_module) && (
                                        <Button
                                            onClick={openQuotaModal}
                                            size="sm"
                                            className="bg-[#0B63CE] text-white"
                                            icon={SlidersHorizontal}
                                        >
                                            Atur Kuota & Tarik Soal dari Modul Blueprint
                                        </Button>
                                    )}
                                    <Button
                                        onClick={() => setIsAddQuestionsModalOpen(true)}
                                        size="sm"
                                        variant="secondary"
                                    >
                                        Pilih Manual dari Bank Soal
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Participant Attempts Summary */}
                    <div className="bg-white rounded-xl border border-[#DCE7F3] overflow-hidden shadow-2xs">
                        <div className="p-4 border-b border-[#DCE7F3]">
                            <h2 className="font-bold text-sm text-[#0E2747] font-display flex items-center gap-2">
                                <Users className="w-4 h-4 text-[#7957D5]" />
                                Rekap Pengerjaan Peserta ({pkg.attempts?.length || 0})
                            </h2>
                        </div>
                        <div className="divide-y divide-[#DCE7F3]">
                            {pkg.attempts && pkg.attempts.length > 0 ? (
                                pkg.attempts.map((att) => (
                                    <div key={att.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                                        <div>
                                            <span className="font-bold text-[#0E2747] block">
                                                {att.participant?.name || 'Kenshi'}
                                            </span>
                                            <span className="text-[10px] text-[#6B7C93]">
                                                {att.participant?.dan_rank || 'Yudansha'} • Selesai: {att.submitted_at ? att.submitted_at.substring(0, 16) : '-'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-sm font-bold text-[#0E2747]">
                                                {att.total_score}
                                            </span>
                                            <Badge variant={att.is_passed ? 'success' : 'danger'}>
                                                {att.is_passed ? 'LULUS' : 'TIDAK LULUS'}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-6 text-center text-xs text-[#6B7C93]">
                                    Belum ada peserta yang mengerjakan paket ujian ini.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

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

            {/* Modal: Pilih Soal Dari Bank Soal */}
            <Modal
                isOpen={isAddQuestionsModalOpen}
                onClose={() => setIsAddQuestionsModalOpen(false)}
                title={`Pilih Butir Soal untuk Paket: ${pkg.title}`}
                maxWidth="4xl"
            >
                <div className="space-y-4 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-[#F8FBFF] border border-[#DCE7F3]">
                        <p className="text-[#6B7C93]">
                            Centang butir soal dari Bank Soal. Anda dapat memfilter dan menggabungkan butir soal dari <strong className="text-[#0E2747]">beberapa modul sekaligus</strong> ke dalam satu paket ujian ini.
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={handleSelectAllFiltered}
                                className="px-2.5 py-1 text-[11px] rounded font-semibold border border-[#DCE7F3] bg-white text-[#0B63CE] hover:bg-blue-50"
                            >
                                Pilih Semua ({filteredAvailableQuestions.length})
                            </button>
                            <button
                                type="button"
                                onClick={handleDeselectAllFiltered}
                                className="px-2.5 py-1 text-[11px] rounded font-semibold border border-[#DCE7F3] bg-white text-slate-700 hover:bg-slate-50"
                            >
                                Hapus Pilihan
                            </button>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari teks soal atau kode..."
                                className="w-full text-xs rounded-lg border border-[#DCE7F3] pl-8 pr-3 py-1.5 focus:border-[#0B63CE] focus:ring-[#0B63CE]"
                            />
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        </div>

                        <select
                            value={filterModuleId}
                            onChange={(e) => setFilterModuleId(e.target.value)}
                            className="w-full text-xs rounded-lg border border-[#DCE7F3] px-3 py-1.5 focus:border-[#0B63CE] focus:ring-[#0B63CE]"
                        >
                            <option value="">Semua Modul ({availableQuestions.length} butir)</option>
                            {questionModules.map((m) => (
                                <option key={m.id} value={m.id}>
                                    [{m.code}] {m.title}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filterStage}
                            onChange={(e) => setFilterStage(e.target.value)}
                            className="w-full text-xs rounded-lg border border-[#DCE7F3] px-3 py-1.5 focus:border-[#0B63CE] focus:ring-[#0B63CE]"
                        >
                            <option value="">Semua Tahap Ujian</option>
                            <option value="pre_test">Pre-Test</option>
                            <option value="quiz">Kuis Formatif</option>
                            <option value="post_test">Post-Test</option>
                        </select>
                    </div>

                    <TableSurface className="max-h-[50vh] overflow-y-auto shadow-none" ariaLabel="Daftar soal yang tersedia">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#F8FBFF] text-[#6B7C93] font-mono text-[10px] uppercase sticky top-0 border-b border-[#DCE7F3] z-10">
                                <tr>
                                    <th className="px-4 py-2 w-10 text-center">Pilih</th>
                                    <th className="px-4 py-2">Kode</th>
                                    <th className="px-4 py-2">Modul Asal</th>
                                    <th className="px-4 py-2">Pertanyaan</th>
                                    <th className="px-4 py-2">Tahap</th>
                                    <th className="px-4 py-2">Kesulitan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#DCE7F3]">
                                {filteredAvailableQuestions.length > 0 ? (
                                    filteredAvailableQuestions.map((q) => {
                                        const isSelected = selectedQuestionIds.includes(q.id);
                                        return (
                                            <tr
                                                key={q.id}
                                                onClick={() => handleToggleQuestion(q.id)}
                                                className={`cursor-pointer transition-colors ${
                                                    isSelected ? 'bg-[#EAF5FF]' : 'hover:bg-slate-50'
                                                }`}
                                            >
                                                <td className="px-4 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onChange={() => handleToggleQuestion(q.id)}
                                                        aria-label={`Pilih soal ${q.code}`}
                                                    />
                                                </td>
                                                <td className="px-4 py-2 font-mono font-bold text-[#0B63CE] whitespace-nowrap">
                                                    {q.code}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    {q.question_module?.code ? (
                                                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[#0B63CE] border border-blue-200 text-[10px] font-mono font-bold">
                                                            {q.question_module.code}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 text-[10px]">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2 font-medium text-[#0E2747] line-clamp-2">
                                                    {q.question_text}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    {q.exam_stage ? (
                                                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                                            {q.exam_stage === 'pre_test' ? 'Pre-Test' : q.exam_stage === 'quiz' ? 'Kuis' : 'Post-Test'}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 text-[10px]">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2 capitalize text-[#6B7C93] whitespace-nowrap">
                                                    {q.difficulty_level}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-[#6B7C93]">
                                            Tidak ada butir soal yang sesuai dengan filter pencarian.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </TableSurface>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#DCE7F3]">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-[#0E2747]">
                                Total: {selectedQuestionIds.length} butir soal dipilih
                            </span>
                            {Object.entries(selectedBreakdown).length > 1 && (
                                <div className="flex flex-wrap items-center gap-1 ml-1">
                                    {Object.entries(selectedBreakdown).map(([code, cnt]) => (
                                        <span key={code} className="px-1.5 py-0.5 rounded bg-blue-50 text-[#0B63CE] border border-blue-200 font-mono text-[10px] font-semibold">
                                            {code}: {cnt}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <Button variant="secondary" onClick={() => setIsAddQuestionsModalOpen(false)}>
                                Batal
                            </Button>
                            <Button onClick={handleSaveQuestions} className="bg-[#0B63CE] text-white">
                                Simpan Pilihan Soal
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Modal: Edit Pengaturan CBT */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={`Edit Pengaturan Paket: ${pkg.title}`}
                maxWidth="2xl"
            >
                <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <FormField label="Kode Paket" error={editForm.errors.code} required>
                            <Input
                                value={editForm.data.code}
                                onChange={(e) => editForm.setData('code', e.target.value)}
                                className="font-mono uppercase"
                                required
                            />
                        </FormField>

                        <div className="sm:col-span-2">
                            <FormField label="Nama Paket Ujian" error={editForm.errors.title} required>
                                <Input
                                    value={editForm.data.title}
                                    onChange={(e) => editForm.setData('title', e.target.value)}
                                    required
                                />
                            </FormField>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <FormField label="Durasi (Menit)" error={editForm.errors.duration_minutes} required>
                            <Input
                                type="number"
                                min="5"
                                max="300"
                                value={editForm.data.duration_minutes}
                                onChange={(e) => editForm.setData('duration_minutes', parseInt(e.target.value, 10))}
                                required
                            />
                        </FormField>

                        <FormField label="Standar Kelulusan (KKM)" error={editForm.errors.passing_score} required>
                            <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={editForm.data.passing_score}
                                onChange={(e) => editForm.setData('passing_score', parseFloat(e.target.value))}
                                required
                            />
                        </FormField>

                        <FormField label="Batas Percobaan" error={editForm.errors.attempts_allowed} required>
                            <Input
                                type="number"
                                min="1"
                                max="10"
                                value={editForm.data.attempts_allowed}
                                onChange={(e) => editForm.setData('attempts_allowed', parseInt(e.target.value, 10))}
                                required
                            />
                        </FormField>
                    </div>

                    {/* Pengaturan Acak Soal & Jawaban */}
                    <div className="rounded-xl border border-[#DCE7F3] bg-[#F8FBFF] p-3 space-y-3">
                        <span className="font-bold text-[#0E2747] text-xs block">
                            Pengaturan Pengacakan Ujian
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-[#DCE7F3] cursor-pointer hover:border-[#0B63CE] transition-colors">
                                <input
                                    type="checkbox"
                                    checked={editForm.data.randomize_questions}
                                    onChange={(e) => editForm.setData('randomize_questions', e.target.checked)}
                                    className="rounded border-[#DCE7F3] text-[#0B63CE] focus:ring-[#0B63CE] mt-0.5"
                                />
                                <div>
                                    <span className="font-bold text-[#0E2747] block text-xs">Acak Urutan Soal</span>
                                    <span className="text-[11px] text-[#6B7C93] block mt-0.5">
                                        Urutan nomor butir soal akan diacak berbeda untuk setiap peserta.
                                    </span>
                                </div>
                            </label>

                            <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-[#DCE7F3] cursor-pointer hover:border-[#0B63CE] transition-colors">
                                <input
                                    type="checkbox"
                                    checked={editForm.data.randomize_answers}
                                    onChange={(e) => editForm.setData('randomize_answers', e.target.checked)}
                                    className="rounded border-[#DCE7F3] text-[#0B63CE] focus:ring-[#0B63CE] mt-0.5"
                                />
                                <div>
                                    <span className="font-bold text-[#0E2747] block text-xs">Acak Pilihan Jawaban</span>
                                    <span className="text-[11px] text-[#6B7C93] block mt-0.5">
                                        Urutan opsi pilihan ganda diacak untuk setiap peserta.
                                    </span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <FormField label="Petunjuk / Instruksi Ujian" error={editForm.errors.instructions}>
                        <Textarea
                            rows={3}
                            value={editForm.data.instructions}
                            onChange={(e) => editForm.setData('instructions', e.target.value)}
                        />
                    </FormField>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DCE7F3]">
                        <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={editForm.processing} className="bg-[#0B63CE] text-white">
                            {editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Atur Kuota Soal Per Modul */}
            <Modal
                isOpen={isQuotaModalOpen}
                onClose={() => setIsQuotaModalOpen(false)}
                title="Atur Kuota Soal Per Modul"
                maxWidth="2xl"
            >
                <form onSubmit={handleApplyQuotas} className="space-y-4 text-xs">
                    <div className="p-3 rounded-lg bg-[#F8FBFF] border border-[#DCE7F3] text-xs text-[#0E2747] leading-relaxed">
                        Tentukan apakah tiap modul diambil <strong>seluruh butir soalnya</strong> atau <strong>dibatasi jumlah tertentu</strong> (misal 15 butir dari 40 butir di bank soal). Butir soal yang terpilih akan disinkronkan otomatis ke paket ujian ini.
                    </div>

                    <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                        {(pkg.blueprint_modules || []).map((m) => {
                            const qConfig = quotaForm.data.question_module_quotas?.[m.id] || {
                                mode: m.quota_mode || 'all',
                                count: m.quota_count || m.active_questions_count || 10,
                            };
                            const isCustom = qConfig.mode === 'custom';

                            return (
                                <div
                                    key={m.id}
                                    className="p-3.5 rounded-xl bg-white border border-[#DCE7F3] shadow-2xs space-y-2.5"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="font-mono text-xs font-bold text-[#0B63CE] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 shrink-0">
                                                [{m.code}]
                                            </span>
                                            <span className="font-bold text-xs text-[#0E2747] truncate">
                                                {m.title}
                                            </span>
                                        </div>
                                        <span className="text-[11px] font-medium text-[#6B7C93] bg-slate-100 px-2 py-0.5 rounded shrink-0">
                                            Tersedia: {m.active_questions_count || 0} butir aktif
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 text-xs">
                                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                            <input
                                                type="radio"
                                                name={`modal_quota_mode_${m.id}`}
                                                checked={!isCustom}
                                                onChange={() => handleSetQuotaMode(m.id, 'all')}
                                                className="text-[#0B63CE] focus:ring-[#0B63CE]"
                                            />
                                            <span className="text-[#0E2747] font-medium">
                                                Ambil Semua ({m.active_questions_count || 0} butir)
                                            </span>
                                        </label>

                                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                            <input
                                                type="radio"
                                                name={`modal_quota_mode_${m.id}`}
                                                checked={isCustom}
                                                onChange={() => handleSetQuotaMode(m.id, 'custom')}
                                                className="text-[#0B63CE] focus:ring-[#0B63CE]"
                                            />
                                            <span className="text-[#0E2747] font-medium">
                                                Tentukan Jumlah Soal:
                                            </span>
                                        </label>

                                        {isCustom && (
                                            <div className="inline-flex items-center gap-1.5">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={m.active_questions_count || 999}
                                                    value={qConfig.count || ''}
                                                    onChange={(e) => handleSetQuotaCount(m.id, e.target.value)}
                                                    className="w-20 px-2.5 py-1 text-xs font-bold font-mono text-center rounded border border-[#DCE7F3] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                                                />
                                                <span className="text-[11px] text-[#6B7C93]">butir soal</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#0B63CE]" />
                            <span className="font-bold text-[#0B63CE]">
                                Total Soal yang Akan Dimasukkan: {estimatedQuotaTotal} butir
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                            <span className="text-[#6B7C93]">Metode:</span>
                            <select
                                value={quotaForm.data.selection_method || 'random'}
                                onChange={(e) => quotaForm.setData('selection_method', e.target.value)}
                                className="py-1 px-2.5 text-xs rounded border border-[#DCE7F3] bg-white font-medium text-[#0E2747]"
                            >
                                <option value="random">Acak dari Bank Soal (Rekomendasi)</option>
                                <option value="sequential">Urut Nomor Soal (1..N)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DCE7F3]">
                        <Button type="button" variant="secondary" onClick={() => setIsQuotaModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={quotaForm.processing}
                            className="bg-[#0B63CE] text-white"
                            icon={SlidersHorizontal}
                        >
                            {quotaForm.processing ? 'Menyinkronkan...' : 'Simpan & Tarik Butir Soal'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
