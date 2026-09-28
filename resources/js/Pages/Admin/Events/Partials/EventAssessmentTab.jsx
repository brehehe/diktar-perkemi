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

import { AssessmentContext } from './AssessmentContext';
import AssessmentMatrix from './AssessmentMatrix';

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

    const matrixContext = {
        activeCategory,
        savingRowId,
        matrixState,
        activeConfig,
        activeParticipants,
        calculateParticipantScore,
        filteredParticipants,
        handleScoreChange,
        handleNotesChange,
        handleSaveRow,
    };

    return (
        <AssessmentContext.Provider value={matrixContext}>
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

            <AssessmentMatrix />

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
        </AssessmentContext.Provider>
    );
}
