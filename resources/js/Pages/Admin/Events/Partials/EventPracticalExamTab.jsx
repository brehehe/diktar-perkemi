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
    GraduationCap,
} from 'lucide-react';

import { PracticalExamContext } from './PracticalExamContext';
import PracticalExamMatrix from './PracticalExamMatrix';

export default function EventPracticalExamTab({ event, practicalExamData }) {
    const configs = practicalExamData?.configs || {};
    const participantsByCategory = practicalExamData?.participants_by_category || {
        UJIAN_PD: [],
        UJIAN_PN: [],
        UJIAN_PED: [],
        UJIAN_PEN: [],
        UJIAN_WAD: [],
        UJIAN_WAN: [],
    };
    const initialSettings = practicalExamData?.settings || {};

    const categoryKeys = [
        'UJIAN_PD',
        'UJIAN_PN',
        'UJIAN_PED',
        'UJIAN_PEN',
        'UJIAN_WAD',
        'UJIAN_WAN',
    ];

    // Determine initial active category
    const [activeCategory, setActiveCategory] = useState(() => {
        for (const k of categoryKeys) {
            if (participantsByCategory[k]?.length > 0) return k;
        }
        return 'UJIAN_PD';
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, assessed, unassessed, passed, remedial, failed
    const [isSavingBulk, setIsSavingBulk] = useState(false);
    const [savingRowId, setSavingRowId] = useState(null);
    const [showRubricModal, setShowRubricModal] = useState(false);
    const [saveSuccessNotice, setSaveSuccessNotice] = useState('');

    // Examiner settings per category
    const [examinerSettings, setExaminerSettings] = useState(initialSettings);

    // Participant scores matrix state: { [category]: { [epId]: { scores: {}, notes: '', isDirty: false } } }
    const [matrixState, setMatrixState] = useState(() => {
        const state = {};
        categoryKeys.forEach((cat) => {
            state[cat] = {};
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
        const state = {};
        categoryKeys.forEach((cat) => {
            state[cat] = {};
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
        setExaminerSettings(practicalExamData?.settings || {});
    }, [practicalExamData]);

    const activeConfig = configs[activeCategory] || {};
    const activeParticipants = participantsByCategory[activeCategory] || [];
    const activeCriteria = activeConfig.criteria || [];

    // Helper calculate scores for participant
    const calculateParticipantScore = (epId) => {
        const rowData = matrixState[activeCategory]?.[epId];
        const scores = rowData?.scores || {};
        if (!activeCriteria || activeCriteria.length === 0) {
            return { totalScore: 0, predikat: '-', status: '-', isPassed: false, isFilled: false };
        }

        let totalWeighted = 0;
        let filledCount = 0;

        activeCriteria.forEach((crit) => {
            const val = scores[crit.code];
            if (val !== undefined && val !== null && val !== '') {
                const num = Math.min(5, Math.max(1, Number(val)));
                if (!isNaN(num)) {
                    totalWeighted += (num / 5) * crit.weight;
                    filledCount++;
                }
            }
        });

        const isFilled = filledCount > 0;
        const totalScore = Math.round(totalWeighted * 100) / 100;

        let predikat = 'Perlu Pembinaan';
        if (totalScore >= 90) predikat = 'Sangat Baik';
        else if (totalScore >= 80) predikat = 'Baik';
        else if (totalScore >= 70) predikat = 'Cukup';

        let status = 'BELUM LULUS';
        if (totalScore >= 80) status = 'LULUS';
        else if (totalScore >= 70) status = 'REMEDIAL';

        return {
            totalScore,
            predikat,
            status,
            isPassed: totalScore >= 80,
            isFilled,
        };
    };

    // Filter participants
    const filteredParticipants = useMemo(() => {
        return activeParticipants.filter((p) => {
            // Search filter
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const matchName = p.name?.toLowerCase().includes(query);
                const matchNik = p.nik?.toLowerCase().includes(query) || p.kenshi_id?.toLowerCase().includes(query);
                const matchOrigin = p.origin?.toLowerCase().includes(query);
                if (!matchName && !matchNik && !matchOrigin) return false;
            }

            const calc = calculateParticipantScore(p.event_participant_id);

            // Status filter
            if (statusFilter === 'assessed') return calc.isFilled;
            if (statusFilter === 'unassessed') return !calc.isFilled;
            if (statusFilter === 'passed') return calc.status === 'LULUS';
            if (statusFilter === 'remedial') return calc.status === 'REMEDIAL';
            if (statusFilter === 'failed') return calc.isFilled && calc.status === 'BELUM LULUS';

            return true;
        });
    }, [activeParticipants, searchQuery, statusFilter, matrixState, activeCategory]);

    // Track total dirty rows
    const dirtyRowsCount = useMemo(() => {
        const catState = matrixState[activeCategory] || {};
        return Object.values(catState).filter((row) => row.isDirty).length;
    }, [matrixState, activeCategory]);

    // Handle score change
    const handleScoreChange = (epId, critCode, value) => {
        setMatrixState((prev) => {
            const currentCat = prev[activeCategory] || {};
            const currentRow = currentCat[epId] || { scores: {}, notes: '', isDirty: false };
            const newScores = { ...currentRow.scores };

            if (value === '' || value === null || value === undefined) {
                delete newScores[critCode];
            } else {
                const num = Math.min(5, Math.max(1, Number(value)));
                newScores[critCode] = isNaN(num) ? '' : num;
            }

            return {
                ...prev,
                [activeCategory]: {
                    ...currentCat,
                    [epId]: {
                        ...currentRow,
                        scores: newScores,
                        isDirty: true,
                    },
                },
            };
        });
    };

    // Handle note change
    const handleNoteChange = (epId, note) => {
        setMatrixState((prev) => {
            const currentCat = prev[activeCategory] || {};
            const currentRow = currentCat[epId] || { scores: {}, notes: '', isDirty: false };

            return {
                ...prev,
                [activeCategory]: {
                    ...currentCat,
                    [epId]: {
                        ...currentRow,
                        notes: note,
                        isDirty: true,
                    },
                },
            };
        });
    };

    // Save individual row
    const handleSaveRow = (epId) => {
        const rowData = matrixState[activeCategory]?.[epId];
        if (!rowData) return;

        setSavingRowId(epId);
        const examinerName = examinerSettings[activeCategory]?.examiner_name || '';

        router.post(
            `/admin/event/${event.id}/ujian-praktik`,
            {
                event_participant_id: epId,
                category: activeCategory,
                examiner_name: examinerName,
                scores: rowData.scores,
                notes: rowData.notes,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSavingRowId(null);
                    setMatrixState((prev) => {
                        const currentCat = prev[activeCategory] || {};
                        const currentRow = currentCat[epId] || {};
                        return {
                            ...prev,
                            [activeCategory]: {
                                ...currentCat,
                                [epId]: {
                                    ...currentRow,
                                    isDirty: false,
                                },
                            },
                        };
                    });
                    setSaveSuccessNotice('Nilai berhasil disimpan!');
                    setTimeout(() => setSaveSuccessNotice(''), 3000);
                },
                onError: (err) => {
                    setSavingRowId(null);
                    alert('Gagal menyimpan penilaian: ' + JSON.stringify(err));
                },
            }
        );
    };

    // Save bulk for active category
    const handleSaveBulk = () => {
        const catState = matrixState[activeCategory] || {};
        const examinerName = examinerSettings[activeCategory]?.examiner_name || '';

        const assessments = Object.keys(catState).map((epId) => ({
            event_participant_id: Number(epId),
            scores: catState[epId].scores,
            notes: catState[epId].notes,
        }));

        setIsSavingBulk(true);

        router.post(
            `/admin/event/${event.id}/ujian-praktik/bulk`,
            {
                category: activeCategory,
                examiner_name: examinerName,
                assessments,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSavingBulk(false);
                    setMatrixState((prev) => {
                        const currentCat = prev[activeCategory] || {};
                        const newCat = {};
                        Object.keys(currentCat).forEach((k) => {
                            newCat[k] = { ...currentCat[k], isDirty: false };
                        });
                        return {
                            ...prev,
                            [activeCategory]: newCat,
                        };
                    });
                    setSaveSuccessNotice(`Seluruh nilai ${activeConfig.tab_title} berhasil disimpan!`);
                    setTimeout(() => setSaveSuccessNotice(''), 4000);
                },
                onError: (err) => {
                    setIsSavingBulk(false);
                    alert('Gagal menyimpan nilai massal: ' + JSON.stringify(err));
                },
            }
        );
    };

    // Export Excel
    const handleExportExcel = (catKey = null) => {
        const url = catKey
            ? `/admin/event/${event.id}/ujian-praktik/export-excel?category=${catKey}`
            : `/admin/event/${event.id}/ujian-praktik/export-excel`;
        window.open(url, '_blank');
    };

    // Stats for active category
    const catStats = useMemo(() => {
        let assessed = 0;
        let passed = 0;
        let remedial = 0;
        let failed = 0;

        activeParticipants.forEach((p) => {
            const calc = calculateParticipantScore(p.event_participant_id);
            if (calc.isFilled) {
                assessed++;
                if (calc.status === 'LULUS') passed++;
                else if (calc.status === 'REMEDIAL') remedial++;
                else failed++;
            }
        });

        return {
            total: activeParticipants.length,
            assessed,
            passed,
            remedial,
            failed,
        };
    }, [activeParticipants, matrixState, activeCategory]);

    const matrixContext = {
        activeCategory,
        savingRowId,
        matrixState,
        activeParticipants,
        activeCriteria,
        calculateParticipantScore,
        filteredParticipants,
        handleScoreChange,
        handleNoteChange,
        handleSaveRow,
    };

    return (
        <PracticalExamContext.Provider value={matrixContext}>
        <div className="space-y-6">
            {/* Top Notification Banner */}
            {saveSuccessNotice && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-sm animate-fade-in shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span className="font-medium">{saveSuccessNotice}</span>
                </div>
            )}

            {/* Header Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    Formulir Penilaian Ujian Praktik PERKEMI 2026
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                    Format 1 Lembar Seluruh Peserta Per Kategori • Skala Likert 1–5 terbobot (0–100)
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => setShowRubricModal(true)}
                            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition"
                        >
                            <Info className="w-4 h-4 text-blue-500" />
                            Rubrik & Panduan Skala
                        </button>

                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => handleExportExcel()}
                                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 rounded-xl transition"
                                title="Download formulir Excel lengkap (6 sheet)"
                            >
                                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                                Export Semua Sheet (.xlsx)
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sub-Tabs: 6 Sheets */}
                <div className="mt-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                        {categoryKeys.map((catKey) => {
                            const config = configs[catKey] || {};
                            const count = participantsByCategory[catKey]?.length || 0;
                            const isActive = activeCategory === catKey;

                            return (
                                <button
                                    key={catKey}
                                    type="button"
                                    onClick={() => {
                                        setActiveCategory(catKey);
                                        setSearchQuery('');
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all whitespace-nowrap ${
                                        isActive
                                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <span>{config.tab_title || catKey}</span>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                            isActive
                                                ? 'bg-blue-700/60 text-white'
                                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                        }`}
                                    >
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Active Category Title & Stats Bar */}
                <div className="mt-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                                Sheet: {activeConfig.sheet_name}
                            </span>
                            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm sm:text-base">
                                {activeConfig.title}
                            </h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {activeConfig.subtitle} • Ambang Lulus: Nilai Akhir &ge; 80 (Remedial: 70–79.99)
                        </p>
                    </div>

                    {/* Stats pills */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-xs">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-slate-500">Total:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{catStats.total}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-xs">
                            <Check className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-slate-500">Dinilai:</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">{catStats.assessed}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300">
                            <Award className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Lulus:</span>
                            <span className="font-bold">{catStats.passed}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                            <span>Remedial:</span>
                            <span className="font-bold">{catStats.remedial}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                            <span>Belum Lulus:</span>
                            <span className="font-bold">{catStats.failed}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter and Settings Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Search & Status Filter */}
                    <div className="flex flex-wrap items-center gap-2.5 flex-1">
                        <div className="relative flex-1 min-w-[200px] max-w-md">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari nama, NIK, atau kota..."
                                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-300"
                        >
                            <option value="all">Semua Status ({activeParticipants.length})</option>
                            <option value="assessed">Sudah Dinilai ({catStats.assessed})</option>
                            <option value="unassessed">Belum Dinilai ({catStats.total - catStats.assessed})</option>
                            <option value="passed">Lulus ({catStats.passed})</option>
                            <option value="remedial">Remedial ({catStats.remedial})</option>
                            <option value="failed">Belum Lulus ({catStats.failed})</option>
                        </select>
                    </div>

                    {/* Examiner Settings & Bulk Actions */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Penilai:</span>
                            <input
                                type="text"
                                value={examinerSettings[activeCategory]?.examiner_name || ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setExaminerSettings((prev) => ({
                                        ...prev,
                                        [activeCategory]: {
                                            ...(prev[activeCategory] || {}),
                                            examiner_name: val,
                                        },
                                    }));
                                }}
                                placeholder="Nama Penguji / Penilai"
                                className="text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 dark:text-slate-300 w-48"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => handleExportExcel(activeCategory)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition"
                            title={`Export sheet ${activeConfig.tab_title} saja`}
                        >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                            Sheet Ini
                        </button>

                        <button
                            type="button"
                            onClick={handleSaveBulk}
                            disabled={isSavingBulk}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition shadow-sm ${
                                dirtyRowsCount > 0
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                            }`}
                        >
                            <Save className={`w-4 h-4 ${isSavingBulk ? 'animate-spin' : ''}`} />
                            {isSavingBulk ? 'Menyimpan...' : 'Simpan Semua'}
                            {dirtyRowsCount > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-xs">
                                    {dirtyRowsCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <PracticalExamMatrix />

            {/* Rubric and Scale Guidelines Modal */}
            <Modal
                show={showRubricModal}
                onClose={() => setShowRubricModal(false)}
                title={`Rubrik Penilaian – ${activeConfig.title}`}
                maxWidth="3xl"
            >
                <div className="p-6 space-y-6 text-sm">
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                            Sistem & Pedoman Penilaian Ujian Praktik PERKEMI 2026
                        </h4>
                        <p className="text-slate-500 text-xs">
                            Format formulir 1 lembar untuk seluruh peserta per kategori. Penilaian menggunakan skala Likert 1–5 terbobot menghasilkan nilai akhir 0–100.
                        </p>
                    </div>

                    {/* Scale Table */}
                    <div className="space-y-2">
                        <h5 className="font-semibold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
                            Tabel Skala & Kriteria Penilaian
                        </h5>
                        <div className="overflow-hidden border border-slate-200 dark:border-slate-700 rounded-xl">
                            <table className="w-full text-xs">
                                <thead className="bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                                    <tr>
                                        <th className="p-2 text-center w-14">Skor</th>
                                        <th className="p-2 text-left w-32">Predikat</th>
                                        <th className="p-2 text-left">Deskripsi Standar Kompetensi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    <tr>
                                        <td className="p-2 text-center font-bold text-emerald-600">5</td>
                                        <td className="p-2 font-semibold">Sangat Baik</td>
                                        <td className="p-2 text-slate-600 dark:text-slate-400">Penguasaan sempurna, tanpa ragu, keteladanan tinggi, instruksi sangat jelas & presisi.</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2 text-center font-bold text-blue-600">4</td>
                                        <td className="p-2 font-semibold">Baik</td>
                                        <td className="p-2 text-slate-600 dark:text-slate-400">Penguasaan teknik/prosedur konsisten dan benar, hanya sedikit kekeliruan minor non-kritis.</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2 text-center font-bold text-amber-600">3</td>
                                        <td className="p-2 font-semibold">Cukup</td>
                                        <td className="p-2 text-slate-600 dark:text-slate-400">Memenuhi standar dasar minimal, namun masih memerlukan arahan atau perbaikan teknis.</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2 text-center font-bold text-orange-600">2</td>
                                        <td className="p-2 font-semibold">Kurang</td>
                                        <td className="p-2 text-slate-600 dark:text-slate-400">Sering melakukan kesalahan prinsip gerakan, posisi, atau prosedur standar.</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2 text-center font-bold text-rose-600">1</td>
                                        <td className="p-2 font-semibold">Sangat Kurang</td>
                                        <td className="p-2 text-slate-600 dark:text-slate-400">Tidak menguasai materi ujian sama sekali, membahayakan keselamatan atau melanggar etika.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Criteria Weights for Active Sheet */}
                    <div className="space-y-2">
                        <h5 className="font-semibold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
                            Indikator & Bobot Penilaian ({activeConfig.tab_title})
                        </h5>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {activeCriteria.map((c) => (
                                <div
                                    key={c.code}
                                    className="flex items-start justify-between gap-3 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs"
                                >
                                    <div>
                                        <span className="font-bold text-blue-600 dark:text-blue-400 mr-2">
                                            {c.code}
                                        </span>
                                        <span className="text-slate-700 dark:text-slate-300">
                                            {c.label}
                                        </span>
                                    </div>
                                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 font-bold whitespace-nowrap">
                                        Bobot {c.weight}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Standard Kelulusan */}
                    <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl space-y-1.5 text-xs text-blue-900 dark:text-blue-300">
                        <div className="font-bold">Standar Nilai Akhir & Kelulusan:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="p-2 bg-white/70 dark:bg-slate-900/70 rounded-lg">
                                <span className="font-bold text-emerald-600">Nilai &ge; 80 :</span> LULUS (Predikat Baik / Sangat Baik)
                            </div>
                            <div className="p-2 bg-white/70 dark:bg-slate-900/70 rounded-lg">
                                <span className="font-bold text-amber-600">70 &le; Nilai &lt; 80 :</span> REMEDIAL (Predikat Cukup)
                            </div>
                            <div className="p-2 bg-white/70 dark:bg-slate-900/70 rounded-lg">
                                <span className="font-bold text-rose-600">Nilai &lt; 70 :</span> BELUM LULUS (Perlu Pembinaan)
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="button" variant="secondary" onClick={() => setShowRubricModal(false)}>
                            Tutup
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
        </PracticalExamContext.Provider>
    );
}
