import React, { useState, useMemo, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Button from '../../../../Components/ui/Button';
import Badge from '../../../../Components/ui/Badge';
import Modal from '../../../../Components/ui/Modal';
import {
    FileSpreadsheet,
    Save,
    Search,
    CheckCircle2,
    XCircle,
    HelpCircle,
    Award,
    Filter,
    AlertCircle,
    Info,
    Check,
    Sparkles,
    User,
    Shield,
    Users,
} from 'lucide-react';

export default function EventAssessmentTab({ event, assessmentData }) {
    const categoriesConfig = assessmentData?.criteria || {};
    const participantsByCategory = assessmentData?.participants_by_category || {
        PELATIH: [],
        PENGUJI: [],
        WASIT: [],
    };
    const initialSettings = assessmentData?.settings || {
        PELATIH: { examiner_name: '', examiner_rank: '' },
        PENGUJI: { examiner_name: '', examiner_rank: '' },
        WASIT: { examiner_name: '', examiner_rank: '' },
    };

    // Determine initial active category
    const [activeCategory, setActiveCategory] = useState(() => {
        if (participantsByCategory.PELATIH?.length > 0) return 'PELATIH';
        if (participantsByCategory.PENGUJI?.length > 0) return 'PENGUJI';
        if (participantsByCategory.WASIT?.length > 0) return 'WASIT';
        return 'PELATIH';
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, assessed, unassessed, passed, failed
    const [isSavingBulk, setIsSavingBulk] = useState(false);
    const [savingRowId, setSavingRowId] = useState(null);
    const [showRubricModal, setShowRubricModal] = useState(false);
    const [saveSuccessNotice, setSaveSuccessNotice] = useState('');

    // Examiner settings per category
    const [examinerSettings, setExaminerSettings] = useState(initialSettings);

    // Participant scores matrix state: { [category]: { [epId]: { scores: {}, notes: '', isDirty: false } } }
    const [matrixState, setMatrixState] = useState(() => {
        const state = { PELATIH: {}, PENGUJI: {}, WASIT: {} };
        ['PELATIH', 'PENGUJI', 'WASIT'].forEach((cat) => {
            const list = participantsByCategory[cat] || [];
            list.forEach((p) => {
                state[cat][p.event_participant_id] = {
                    scores: { ...(p.scores || {}) },
                    notes: p.notes || '',
                    isDirty: false,
                };
            });
        });
        return state;
    });

    // Update state if props change from server
    useEffect(() => {
        const state = { PELATIH: {}, PENGUJI: {}, WASIT: {} };
        ['PELATIH', 'PENGUJI', 'WASIT'].forEach((cat) => {
            const list = participantsByCategory[cat] || [];
            list.forEach((p) => {
                state[cat][p.event_participant_id] = {
                    scores: { ...(p.scores || {}) },
                    notes: p.notes || '',
                    isDirty: false,
                };
            });
        });
        setMatrixState(state);
        setExaminerSettings(assessmentData?.settings || initialSettings);
    }, [assessmentData]);

    const activeConfig = categoriesConfig[activeCategory] || {};
    const activeParticipants = participantsByCategory[activeCategory] || [];

    // Helper calculate scores for participant
    const calculateParticipantScore = (epId) => {
        const rowData = matrixState[activeCategory]?.[epId];
        const scores = rowData?.scores || {};
        if (!activeConfig.groups) {
            return { dasar: 0, pribadi: 0, total: 0, isPassed: false, isFilled: false };
        }

        let dasar = 0;
        let pribadi = 0;
        let hasAnyInput = false;

        const sumCriteria = (list) => {
            let total = 0;
            (list || []).forEach((c) => {
                const val = scores[c.key];
                if (val !== undefined && val !== null && val !== '') {
                    hasAnyInput = true;
                    total += Math.min(Math.max(0, Number(val)), c.max);
                }
            });
            return total;
        };

        dasar += sumCriteria(activeConfig.groups?.dasar_teori?.criteria);
        dasar += sumCriteria(activeConfig.groups?.dasar_praktek?.criteria);
        pribadi += sumCriteria(activeConfig.groups?.pribadi?.criteria);

        const total = dasar + pribadi;
        const minDasar = activeConfig.min_pass_dasar || 70;
        const minPribadi = activeConfig.min_pass_pribadi || 70;
        const isPassed = hasAnyInput && dasar >= minDasar && pribadi >= minPribadi;

        return {
            dasar: Math.round(dasar * 100) / 100,
            pribadi: Math.round(pribadi * 100) / 100,
            total: Math.round(total * 100) / 100,
            isPassed,
            isFilled: hasAnyInput,
        };
    };

    // Filtered participants list
    const filteredParticipants = useMemo(() => {
        return activeParticipants.filter((p) => {
            const rowCalc = calculateParticipantScore(p.event_participant_id);
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchName = (p.name || '').toLowerCase().includes(q);
                const matchKenshi = (p.kenshi_id || '').toLowerCase().includes(q);
                const matchNik = (p.nik || '').toLowerCase().includes(q);
                const matchOrigin = (p.origin || '').toLowerCase().includes(q);
                if (!matchName && !matchKenshi && !matchNik && !matchOrigin) return false;
            }

            if (statusFilter === 'assessed') return rowCalc.isFilled;
            if (statusFilter === 'unassessed') return !rowCalc.isFilled;
            if (statusFilter === 'passed') return rowCalc.isPassed;
            if (statusFilter === 'failed') return rowCalc.isFilled && !rowCalc.isPassed;

            return true;
        });
    }, [activeParticipants, matrixState, activeCategory, searchQuery, statusFilter]);

    // Handle input score change
    const handleScoreChange = (epId, criterionKey, rawValue, maxScore) => {
        let val = rawValue;
        if (val !== '') {
            val = Number(val);
            if (isNaN(val)) val = '';
            else if (val > maxScore) val = maxScore;
            else if (val < 0) val = 0;
        }

        setMatrixState((prev) => ({
            ...prev,
            [activeCategory]: {
                ...prev[activeCategory],
                [epId]: {
                    ...prev[activeCategory]?.[epId],
                    scores: {
                        ...(prev[activeCategory]?.[epId]?.scores || {}),
                        [criterionKey]: val,
                    },
                    isDirty: true,
                },
            },
        }));
    };

    // Handle notes change
    const handleNotesChange = (epId, notes) => {
        setMatrixState((prev) => ({
            ...prev,
            [activeCategory]: {
                ...prev[activeCategory],
                [epId]: {
                    ...prev[activeCategory]?.[epId],
                    notes,
                    isDirty: true,
                },
            },
        }));
    };

    // Quick fill for single participant
    const handleQuickFill = (epId, type = 'pass') => {
        const newScores = {};
        const config = activeConfig;
        if (!config?.groups) return;

        const populate = (list, factor) => {
            (list || []).forEach((c) => {
                newScores[c.key] = Math.round(c.max * factor * 10) / 10;
            });
        };

        const factor = type === 'pass' ? 0.75 : 0.6;
        populate(config.groups.dasar_teori?.criteria, factor);
        populate(config.groups.dasar_praktek?.criteria, factor);
        populate(config.groups.pribadi?.criteria, factor);

        setMatrixState((prev) => ({
            ...prev,
            [activeCategory]: {
                ...prev[activeCategory],
                [epId]: {
                    ...prev[activeCategory]?.[epId],
                    scores: newScores,
                    isDirty: true,
                },
            },
        }));
    };

    // Quick fill for all visible participants in category
    const handleBulkQuickFill = (type = 'pass') => {
        if (!confirm(`Isi otomatis seluruh ${filteredParticipants.length} peserta di kategori ${activeCategory} dengan standar ${type === 'pass' ? 'Lulus (75%)' : 'Remedial (60%)'}?`)) {
            return;
        }

        const config = activeConfig;
        if (!config?.groups) return;

        const factor = type === 'pass' ? 0.75 : 0.6;
        const newCategoryState = { ...(matrixState[activeCategory] || {}) };

        filteredParticipants.forEach((p) => {
            const epId = p.event_participant_id;
            const newScores = {};
            const populate = (list) => {
                (list || []).forEach((c) => {
                    newScores[c.key] = Math.round(c.max * factor * 10) / 10;
                });
            };
            populate(config.groups.dasar_teori?.criteria);
            populate(config.groups.dasar_praktek?.criteria);
            populate(config.groups.pribadi?.criteria);

            newCategoryState[epId] = {
                ...(newCategoryState[epId] || {}),
                scores: newScores,
                isDirty: true,
            };
        });

        setMatrixState((prev) => ({
            ...prev,
            [activeCategory]: newCategoryState,
        }));
    };

    // Save single row
    const handleSaveRow = (p) => {
        const epId = p.event_participant_id;
        const rowData = matrixState[activeCategory]?.[epId];
        if (!rowData) return;

        setSavingRowId(epId);
        const payload = {
            event_participant_id: epId,
            category: activeCategory,
            examiner_name: examinerSettings[activeCategory]?.examiner_name || null,
            examiner_rank: examinerSettings[activeCategory]?.examiner_rank || null,
            scores: rowData.scores,
            notes: rowData.notes,
        };

        router.post(`/admin/event/${event.id}/penilaian`, payload, {
            preserveScroll: true,
            onSuccess: () => {
                setSavingRowId(null);
                setMatrixState((prev) => ({
                    ...prev,
                    [activeCategory]: {
                        ...prev[activeCategory],
                        [epId]: {
                            ...prev[activeCategory]?.[epId],
                            isDirty: false,
                        },
                    },
                }));
                setSaveSuccessNotice(`Penilaian untuk ${p.name} berhasil disimpan.`);
                setTimeout(() => setSaveSuccessNotice(''), 4000);
            },
            onError: () => setSavingRowId(null),
        });
    };

    // Save Bulk / All participants in category
    const handleSaveBulk = () => {
        const categoryData = matrixState[activeCategory] || {};
        const assessments = Object.keys(categoryData).map((epId) => ({
            event_participant_id: Number(epId),
            scores: categoryData[epId].scores,
            notes: categoryData[epId].notes,
        }));

        setIsSavingBulk(true);
        const payload = {
            category: activeCategory,
            examiner_name: examinerSettings[activeCategory]?.examiner_name || '',
            examiner_rank: examinerSettings[activeCategory]?.examiner_rank || '',
            assessments,
        };

        router.post(`/admin/event/${event.id}/penilaian/bulk`, payload, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSavingBulk(false);
                setSaveSuccessNotice(`Seluruh penilaian kategori ${activeCategory} berhasil disimpan.`);
                setTimeout(() => setSaveSuccessNotice(''), 4000);
            },
            onError: () => setIsSavingBulk(false),
        });
    };

    // Export URL
    const exportExcelUrl = `/admin/event/${event.id}/penilaian/export-excel?category=${activeCategory}`;

    // Statistics for active category
    const currentStats = useMemo(() => {
        let assessed = 0;
        let passed = 0;
        let failed = 0;
        activeParticipants.forEach((p) => {
            const calc = calculateParticipantScore(p.event_participant_id);
            if (calc.isFilled) {
                assessed++;
                if (calc.isPassed) passed++;
                else failed++;
            }
        });
        return {
            total: activeParticipants.length,
            assessed,
            unassessed: activeParticipants.length - assessed,
            passed,
            failed,
        };
    }, [activeParticipants, matrixState, activeCategory]);

    const hasDirtyChanges = useMemo(() => {
        const catState = matrixState[activeCategory] || {};
        return Object.values(catState).some((r) => r.isDirty);
    }, [matrixState, activeCategory]);

    return (
        <div className="space-y-5">
            {/* Top Control Panel: Header, Category Pills & Actions */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-[#0B63CE] border border-blue-100">
                                <Award className="w-4 h-4" />
                            </span>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 leading-tight">
                                    Form Penilaian Praktik & Teori
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Tersambung langsung ke jalur peserta masing-masing (Wasit, Penguji, Pelatih) sesuai format form resmi.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowRubricModal(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                        >
                            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                            Rubrik Penilaian
                        </button>

                        <a
                            href={exportExcelUrl}
                            download
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            Export Excel ({activeCategory})
                        </a>

                        <button
                            type="button"
                            onClick={handleSaveBulk}
                            disabled={isSavingBulk}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0B63CE] hover:bg-[#094eb0] disabled:opacity-50 rounded-lg shadow-sm transition"
                        >
                            <Save className="w-4 h-4" />
                            {isSavingBulk ? 'Menyimpan...' : 'Simpan Semua'}
                        </button>
                    </div>
                </div>

                {/* Category Switcher & Stats Strip */}
                <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Category Switcher Tabs */}
                    <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
                        {[
                            { id: 'PELATIH', label: 'Pelatih', icon: '🥋', count: participantsByCategory.PELATIH?.length || 0 },
                            { id: 'PENGUJI', label: 'Penguji', icon: '📋', count: participantsByCategory.PENGUJI?.length || 0 },
                            { id: 'WASIT', label: 'Wasit', icon: '⚖️', count: participantsByCategory.WASIT?.length || 0 },
                        ].map((cat) => {
                            const isActive = activeCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        isActive
                                            ? 'bg-white text-[#0B63CE] shadow-sm font-bold'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                                    }`}
                                >
                                    <span>{cat.icon}</span>
                                    <span>{cat.label}</span>
                                    <span
                                        className={`px-1.5 py-0.2 rounded-full text-[11px] ${
                                            isActive ? 'bg-blue-100 text-[#0B63CE]' : 'bg-slate-200 text-slate-600'
                                        }`}
                                    >
                                        {cat.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Stats Compact Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                            <span>Peserta:</span>
                            <strong className="text-slate-900">{currentStats.total}</strong>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-medium border border-blue-100">
                            <span>Dinilai:</span>
                            <strong className="text-blue-900">{currentStats.assessed}</strong>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-medium border border-emerald-100">
                            <span>Lulus (&ge;70%):</span>
                            <strong className="text-emerald-900">{currentStats.passed}</strong>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-medium border border-amber-100">
                            <span>Belum Lulus:</span>
                            <strong className="text-amber-900">{currentStats.failed}</strong>
                        </span>
                    </div>
                </div>

                {/* Examiner Information & Search Toolbar */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    {/* Nama Penguji */}
                    <div className="md:col-span-4">
                        <div className="relative">
                            <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={examinerSettings[activeCategory]?.examiner_name || ''}
                                onChange={(e) =>
                                    setExaminerSettings((prev) => ({
                                        ...prev,
                                        [activeCategory]: {
                                            ...prev[activeCategory],
                                            examiner_name: e.target.value,
                                        },
                                    }))
                                }
                                placeholder={`Nama Penguji / Asesor (${activeCategory})`}
                                className="w-full text-xs pl-8 pr-2.5 py-1.5 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    {/* Tingkatan Penguji */}
                    <div className="md:col-span-3">
                        <div className="relative">
                            <Shield className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={examinerSettings[activeCategory]?.examiner_rank || ''}
                                onChange={(e) =>
                                    setExaminerSettings((prev) => ({
                                        ...prev,
                                        [activeCategory]: {
                                            ...prev[activeCategory],
                                            examiner_rank: e.target.value,
                                        },
                                    }))
                                }
                                placeholder="Tingkatan Penguji (contoh: VI DAN)"
                                className="w-full text-xs pl-8 pr-2.5 py-1.5 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    {/* Search Peserta */}
                    <div className="md:col-span-3">
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari nama, no kenshi, kota..."
                                className="w-full text-xs pl-8 pr-2.5 py-1.5 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    {/* Quick Bulk Fill */}
                    <div className="md:col-span-2 flex justify-end">
                        <button
                            type="button"
                            onClick={() => handleBulkQuickFill('pass')}
                            className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                            title="Isi otomatis 75% untuk semua peserta kategori ini"
                        >
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            Isi Semua Lulus
                        </button>
                    </div>
                </div>

                {/* Filter tags & Dirty Indicator */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1">
                        <span className="text-slate-500 text-[11px] mr-1">Filter:</span>
                        {[
                            { id: 'all', label: 'Semua' },
                            { id: 'assessed', label: 'Dinilai' },
                            { id: 'unassessed', label: 'Belum' },
                            { id: 'passed', label: 'Lulus' },
                            { id: 'failed', label: 'Tidak Lulus' },
                        ].map((f) => (
                            <button
                                key={f.id}
                                type="button"
                                onClick={() => setStatusFilter(f.id)}
                                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                                    statusFilter === f.id
                                        ? 'bg-blue-600 text-white font-semibold'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {hasDirtyChanges && (
                        <span className="inline-flex items-center gap-1 text-amber-600 font-semibold text-[11px] animate-pulse">
                            <AlertCircle className="w-3.5 h-3.5" /> Ada perubahan nilai yang belum disimpan!
                        </span>
                    )}
                </div>
            </div>

            {/* Success Alert */}
            {saveSuccessNotice && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs animate-fade-in">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{saveSuccessNotice}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setSaveSuccessNotice('')}
                        className="text-emerald-700 hover:text-emerald-900 font-bold"
                    >
                        &times;
                    </button>
                </div>
            )}

            {/* Matrix Scoring Grid Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="max-h-[620px] overflow-auto relative">
                    <table className="w-full border-collapse text-left text-xs">
                        {/* Sticky Clean Light Table Header */}
                        <thead className="sticky top-0 z-30 bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur border-b border-slate-200 dark:border-slate-700 shadow-sm">
                            {/* Tier 1 Header */}
                            <tr className="text-slate-800 dark:text-slate-100 text-center border-b border-slate-200 dark:border-slate-700 divide-x divide-slate-200 dark:divide-slate-700 text-[11px]">
                                <th
                                    rowSpan={3}
                                    className="px-2 py-2.5 w-10 text-center sticky left-0 z-40 bg-slate-100 dark:bg-slate-800 font-bold"
                                >
                                    No
                                </th>
                                <th
                                    rowSpan={3}
                                    className="px-3 py-2.5 w-60 min-w-[220px] max-w-[260px] text-left sticky left-10 z-40 bg-slate-100 dark:bg-slate-800 font-bold shadow-[2px_0_4px_-1px_rgba(0,0,0,0.1)]"
                                >
                                    Peserta
                                </th>

                                {/* Kemampuan Dasar Header */}
                                <th
                                    colSpan={
                                        (activeConfig.groups?.dasar_teori?.criteria?.length || 0) +
                                        (activeConfig.groups?.dasar_praktek?.criteria?.length || 0) +
                                        1
                                    }
                                    className="py-1.5 px-2 bg-blue-100/80 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 font-bold uppercase tracking-wider text-[11px]"
                                >
                                    Kemampuan Dasar (100) &bull; Min. 70
                                </th>

                                {/* Kemampuan Pribadi Header */}
                                <th
                                    colSpan={(activeConfig.groups?.pribadi?.criteria?.length || 0) + 1}
                                    className="py-1.5 px-2 bg-indigo-100/80 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-bold uppercase tracking-wider text-[11px]"
                                >
                                    Kemampuan Pribadi (100) &bull; Min. 70
                                </th>

                                {/* Total & Actions */}
                                <th rowSpan={3} className="px-2 py-2 w-14 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-center">
                                    Total<br />(200)
                                </th>
                                <th rowSpan={3} className="px-2 py-2 w-24 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-center">
                                    Status
                                </th>
                                <th rowSpan={3} className="px-3 py-2 min-w-[130px] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-left">
                                    Catatan
                                </th>
                                <th rowSpan={3} className="px-2 py-2 w-12 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-center sticky right-0 z-40">
                                    Aksi
                                </th>
                            </tr>

                            {/* Tier 2 Header: Sections */}
                            <tr className="text-center border-b border-slate-200 dark:border-slate-700 divide-x divide-slate-200 dark:divide-slate-700 text-[10px]">
                                <th
                                    colSpan={activeConfig.groups?.dasar_teori?.criteria?.length || 0}
                                    className="py-1 px-1 bg-blue-50/90 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-semibold"
                                >
                                    {activeConfig.groups?.dasar_teori?.title || 'Teori'}
                                </th>
                                <th
                                    colSpan={activeConfig.groups?.dasar_praktek?.criteria?.length || 0}
                                    className="py-1 px-1 bg-cyan-50/90 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-300 font-semibold"
                                >
                                    {activeConfig.groups?.dasar_praktek?.title || 'Praktek'}
                                </th>
                                <th rowSpan={2} className="py-1 px-2 bg-blue-100/90 dark:bg-blue-900/60 text-blue-900 dark:text-blue-200 font-bold min-w-[50px]">
                                    Subtotal<br />Dasar
                                </th>

                                <th
                                    colSpan={activeConfig.groups?.pribadi?.criteria?.length || 0}
                                    className="py-1 px-1 bg-indigo-50/90 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 font-semibold"
                                >
                                    {activeConfig.groups?.pribadi?.title || 'Kemampuan Pribadi'}
                                </th>
                                <th rowSpan={2} className="py-1 px-2 bg-indigo-100/90 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 font-bold min-w-[50px]">
                                    Subtotal<br />Pribadi
                                </th>
                            </tr>

                            {/* Tier 3 Header: Individual Criterion columns */}
                            <tr className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-center border-b border-slate-200 dark:border-slate-700 divide-x divide-slate-200 dark:divide-slate-700 text-[10px]">
                                {(activeConfig.groups?.dasar_teori?.criteria || []).map((crit) => (
                                    <th key={crit.key} className="p-1 min-w-[54px] max-w-[70px]" title={crit.label}>
                                        <div className="truncate leading-tight text-[10px] text-blue-700 dark:text-blue-400 font-semibold">{crit.label.split(',')[0]}</div>
                                        <span className="inline-block px-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 text-[9px] font-bold">
                                            max {crit.max}
                                        </span>
                                    </th>
                                ))}

                                {(activeConfig.groups?.dasar_praktek?.criteria || []).map((crit) => (
                                    <th key={crit.key} className="p-1 min-w-[54px] max-w-[70px]" title={crit.label}>
                                        <div className="truncate leading-tight text-[10px] text-cyan-700 dark:text-cyan-400 font-semibold">{crit.label.split(',')[0]}</div>
                                        <span className="inline-block px-1 rounded bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-300 text-[9px] font-bold">
                                            max {crit.max}
                                        </span>
                                    </th>
                                ))}

                                {(activeConfig.groups?.pribadi?.criteria || []).map((crit) => (
                                    <th key={crit.key} className="p-1 min-w-[62px] max-w-[80px]" title={crit.label}>
                                        <div className="truncate leading-tight text-[10px] text-indigo-700 dark:text-indigo-400 font-semibold">{crit.label.split(',')[0]}</div>
                                        <span className="inline-block px-1 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300 text-[9px] font-bold">
                                            max {crit.max}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody className="divide-y divide-slate-200">
                            {filteredParticipants.length === 0 ? (
                                <tr>
                                    <td colSpan={25} className="py-12 text-center text-slate-400 bg-white">
                                        Tidak ada peserta yang cocok dengan filter atau pencarian.
                                    </td>
                                </tr>
                            ) : (
                                filteredParticipants.map((p, index) => {
                                    const epId = p.event_participant_id;
                                    const rowData = matrixState[activeCategory]?.[epId] || { scores: {}, notes: '', isDirty: false };
                                    const calc = calculateParticipantScore(epId);
                                    const isRowSaving = savingRowId === epId;

                                    return (
                                        <tr
                                            key={epId}
                                            className={`divide-x divide-slate-100 transition-colors ${
                                                rowData.isDirty
                                                    ? 'bg-amber-50/50'
                                                    : index % 2 === 0
                                                    ? 'bg-white hover:bg-blue-50/20'
                                                    : 'bg-slate-50/60 hover:bg-blue-50/20'
                                            }`}
                                        >
                                            {/* Column 1: No */}
                                            <td className="px-1.5 py-1.5 text-center font-medium text-slate-500 sticky left-0 z-20 bg-inherit text-[11px]">
                                                {index + 1}
                                            </td>

                                            {/* Column 2: Peserta Profile */}
                                            <td className="px-2.5 py-1.5 sticky left-10 z-20 bg-inherit shadow-[2px_0_4px_-1px_rgba(0,0,0,0.08)] max-w-[240px]">
                                                <div className="font-semibold text-slate-900 text-xs truncate leading-snug" title={p.name}>
                                                    {p.name}
                                                </div>
                                                <div className="text-[10px] text-slate-500 flex items-center gap-1.5 truncate mt-0.5">
                                                    <span className="px-1 py-0.2 rounded font-bold text-[9px] bg-slate-200 text-slate-700">
                                                        {p.track_code}
                                                    </span>
                                                    {p.kenshi_id && p.kenshi_id !== '-' && (
                                                        <span className="font-mono text-slate-600 truncate">{p.kenshi_id}</span>
                                                    )}
                                                    {p.origin && <span className="text-slate-400 truncate">&bull; {p.origin}</span>}
                                                </div>
                                            </td>

                                            {/* Dasar Teori Criterion inputs */}
                                            {(activeConfig.groups?.dasar_teori?.criteria || []).map((crit) => {
                                                const val = rowData.scores?.[crit.key] ?? '';
                                                return (
                                                    <td key={crit.key} className="p-1 text-center bg-blue-50/10">
                                                        <input
                                                            type="number"
                                                            step="0.5"
                                                            min="0"
                                                            max={crit.max}
                                                            value={val}
                                                            onChange={(e) =>
                                                                handleScoreChange(epId, crit.key, e.target.value, crit.max)
                                                            }
                                                            className={`w-12 h-7 text-center font-mono text-xs font-semibold py-0.5 px-0.5 rounded border ${
                                                                val !== ''
                                                                    ? Number(val) >= crit.max * 0.7
                                                                        ? 'border-blue-400 bg-blue-50/80 text-blue-900 font-bold'
                                                                        : 'border-amber-400 bg-amber-50/80 text-amber-900'
                                                                    : 'border-slate-200 bg-white text-slate-700'
                                                            } focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                                                        />
                                                    </td>
                                                );
                                            })}

                                            {/* Dasar Praktek Criterion inputs */}
                                            {(activeConfig.groups?.dasar_praktek?.criteria || []).map((crit) => {
                                                const val = rowData.scores?.[crit.key] ?? '';
                                                return (
                                                    <td key={crit.key} className="p-1 text-center bg-cyan-50/10">
                                                        <input
                                                            type="number"
                                                            step="0.5"
                                                            min="0"
                                                            max={crit.max}
                                                            value={val}
                                                            onChange={(e) =>
                                                                handleScoreChange(epId, crit.key, e.target.value, crit.max)
                                                            }
                                                            className={`w-12 h-7 text-center font-mono text-xs font-semibold py-0.5 px-0.5 rounded border ${
                                                                val !== ''
                                                                    ? Number(val) >= crit.max * 0.7
                                                                        ? 'border-cyan-400 bg-cyan-50/80 text-cyan-900 font-bold'
                                                                        : 'border-amber-400 bg-amber-50/80 text-amber-900'
                                                                    : 'border-slate-200 bg-white text-slate-700'
                                                            } focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500`}
                                                        />
                                                    </td>
                                                );
                                            })}

                                            {/* Subtotal Dasar */}
                                            <td className="px-1.5 py-1 text-center font-bold bg-blue-50/40">
                                                <span
                                                    className={`inline-block font-mono text-xs ${
                                                        calc.isFilled
                                                            ? calc.dasar >= 70
                                                                ? 'text-blue-900 font-extrabold'
                                                                : 'text-amber-800 font-bold'
                                                            : 'text-slate-400'
                                                    }`}
                                                >
                                                    {calc.isFilled ? calc.dasar : '-'}
                                                </span>
                                            </td>

                                            {/* Pribadi Criterion inputs */}
                                            {(activeConfig.groups?.pribadi?.criteria || []).map((crit) => {
                                                const val = rowData.scores?.[crit.key] ?? '';
                                                return (
                                                    <td key={crit.key} className="p-1 text-center bg-indigo-50/10">
                                                        <input
                                                            type="number"
                                                            step="0.5"
                                                            min="0"
                                                            max={crit.max}
                                                            value={val}
                                                            onChange={(e) =>
                                                                handleScoreChange(epId, crit.key, e.target.value, crit.max)
                                                            }
                                                            className={`w-12 h-7 text-center font-mono text-xs font-semibold py-0.5 px-0.5 rounded border ${
                                                                val !== ''
                                                                    ? Number(val) >= crit.max * 0.7
                                                                        ? 'border-indigo-400 bg-indigo-50/80 text-indigo-900 font-bold'
                                                                        : 'border-amber-400 bg-amber-50/80 text-amber-900'
                                                                    : 'border-slate-200 bg-white text-slate-700'
                                                            } focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500`}
                                                        />
                                                    </td>
                                                );
                                            })}

                                            {/* Subtotal Pribadi */}
                                            <td className="px-1.5 py-1 text-center font-bold bg-indigo-50/40">
                                                <span
                                                    className={`inline-block font-mono text-xs ${
                                                        calc.isFilled
                                                            ? calc.pribadi >= 70
                                                                ? 'text-indigo-900 font-extrabold'
                                                                : 'text-amber-800 font-bold'
                                                            : 'text-slate-400'
                                                    }`}
                                                >
                                                    {calc.isFilled ? calc.pribadi : '-'}
                                                </span>
                                            </td>

                                            {/* Grand Total */}
                                            <td className="px-1.5 py-1 text-center font-mono font-extrabold text-slate-900 bg-slate-100/70 text-xs">
                                                {calc.isFilled ? calc.total : '-'}
                                            </td>

                                            {/* Status Kelulusan */}
                                            <td className="px-1.5 py-1 text-center whitespace-nowrap">
                                                {calc.isFilled ? (
                                                    calc.isPassed ? (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                            LULUS
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                                            BELUM LULUS
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 italic">Belum Dinilai</span>
                                                )}
                                            </td>

                                            {/* Catatan Penguji */}
                                            <td className="p-1">
                                                <input
                                                    type="text"
                                                    value={rowData.notes || ''}
                                                    onChange={(e) => handleNotesChange(epId, e.target.value)}
                                                    placeholder="Catatan..."
                                                    className="w-full text-xs h-7 py-0.5 px-2 rounded border border-slate-200 focus:border-blue-500 placeholder:text-slate-300"
                                                />
                                            </td>

                                            {/* Action Save Single */}
                                            <td className="px-1 py-1 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSaveRow(p)}
                                                    disabled={isRowSaving}
                                                    className={`p-1.5 rounded-md transition ${
                                                        rowData.isDirty
                                                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                                    }`}
                                                    title={rowData.isDirty ? 'Simpan nilai peserta ini' : 'Tersimpan'}
                                                >
                                                    {isRowSaving ? (
                                                        <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full" />
                                                    ) : rowData.isDirty ? (
                                                        <Save className="w-3.5 h-3.5" />
                                                    ) : (
                                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 text-slate-600">
                        <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>
                            Syarat Lulus: Kemampuan Dasar &ge; 70 pt dan Kemampuan Pribadi &ge; 70 pt (Total minimal 140/200 pt).
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">
                            Menampilkan {filteredParticipants.length} dari {activeParticipants.length} peserta
                        </span>
                    </div>
                </div>
            </div>

            {/* Rubric Guidance Modal */}
            <Modal
                isOpen={showRubricModal}
                onClose={() => setShowRubricModal(false)}
                title={`Rubrik Penilaian Resmi: ${activeCategory}`}
                maxWidth="2xl"
            >
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-xs">
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 leading-relaxed">
                        <p className="font-semibold text-sm mb-0.5">Ketentuan Kelulusan Sesuai Pedoman Perkemi:</p>
                        <p>
                            Nilai minimal <strong>70%</strong> dari Kemampuan Dasar (100 poin) dan <strong>70%</strong> dari Kemampuan Pribadi (100 poin). Total minimal <strong>140 poin</strong>.
                        </p>
                    </div>

                    {/* Section 1: Kemampuan Dasar */}
                    <div>
                        <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 mb-2">
                            1. Kemampuan Dasar (Maksimal 100 Poin)
                        </h4>

                        <div className="space-y-3">
                            <div>
                                <p className="font-semibold text-blue-800 mb-1">{activeConfig.groups?.dasar_teori?.title}:</p>
                                <ul className="space-y-1.5 pl-3 border-l-2 border-blue-300">
                                    {(activeConfig.groups?.dasar_teori?.criteria || []).map((crit) => (
                                        <li key={crit.key}>
                                            <span className="font-semibold text-slate-800">{crit.label}</span>
                                            <span className="text-slate-500 ml-1 font-bold">(Maks. {crit.max} poin)</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <p className="font-semibold text-cyan-800 mb-1">{activeConfig.groups?.dasar_praktek?.title}:</p>
                                <ul className="space-y-1.5 pl-3 border-l-2 border-cyan-300">
                                    {(activeConfig.groups?.dasar_praktek?.criteria || []).map((crit) => (
                                        <li key={crit.key}>
                                            <span className="font-semibold text-slate-800">{crit.label}</span>
                                            <span className="text-slate-500 ml-1 font-bold">(Maks. {crit.max} poin)</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Kemampuan Pribadi */}
                    <div>
                        <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 mb-2">
                            2. Kemampuan Pribadi (Maksimal 100 Poin)
                        </h4>
                        <ul className="space-y-2 pl-3 border-l-2 border-indigo-300">
                            {(activeConfig.groups?.pribadi?.criteria || []).map((crit) => (
                                <li key={crit.key}>
                                    <div className="font-semibold text-slate-800">
                                        {crit.label} <span className="text-slate-500 font-bold">(Maks. {crit.max} poin)</span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 mt-0.5">
                                        {crit.key === 'pribadi_keterampilan'
                                            ? 'Menguasai semua teknik dan teori sesuai dengan tingkatannya. Mampu menyampaikan materi dengan jelas dan teratur.'
                                            : 'Tidak tegang, postur yang baik, bersuara jelas, keras, tegas dan berwibawa.'}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex justify-end">
                        <Button type="button" variant="secondary" onClick={() => setShowRubricModal(false)}>
                            Tutup
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
