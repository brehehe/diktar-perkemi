import { router } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    ClipboardCheck,
    FileCheck2,
    FileSpreadsheet,
    FileSignature,
    Info,
    Save,
    Search,
    ScrollText,
    Table2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Tabs from '@/Components/admin/Tabs';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';

const modeDetails = {
    technique: {
        title: 'Formulir 27 · Penilaian Teknik',
        description: 'Isi nilai setiap materi teknik sesuai bobot resmi kategori Kyu peserta.',
        document: 'penilaian-teknik',
        icon: ClipboardCheck,
    },
    tabulation: {
        title: 'Formulir 27 · Tabulasi Penilaian',
        description: 'Lengkapi nilai teori. Nilai praktik, total, persentase, dan status dihitung otomatis.',
        document: 'tabulasi-penilaian',
        icon: Table2,
    },
    results: {
        title: 'Formulir 28 · Laporan Hasil Ujian',
        description: 'Periksa hasil otomatis atau tetapkan keputusan khusus untuk peserta.',
        document: 'laporan-hasil',
        icon: FileCheck2,
    },
    report: {
        title: 'Laporan Ujian Kyu–Dan',
        description: 'Rekap akhir peserta berdasarkan kategori dan keputusan hasil ujian.',
        document: 'laporan-kyu-dan',
        icon: ScrollText,
    },
};

function createRows(data) {
    return Object.fromEntries(
        Object.entries(data?.participants_by_category || {}).map(([category, participants]) => [
            category,
            Object.fromEntries(participants.map((participant) => [
                participant.event_participant_id,
                {
                    scores: { ...(participant.scores || {}) },
                    total_score_override: participant.total_score_override ?? '',
                    status_override: participant.status_override || 'auto',
                    notes: participant.notes || '',
                    isDirty: false,
                },
            ])),
        ]),
    );
}

function createDocumentDetails(data) {
    return Object.fromEntries(
        Object.entries(data?.settings || {}).map(([category, details]) => [
            category,
            {
                mandate_number: details?.mandate_number || '',
                mandate_date: details?.mandate_date || '',
                examiners: Array.from({ length: 3 }, (_, index) => ({
                    name: details?.examiners?.[index]?.name || '',
                    rank: details?.examiners?.[index]?.rank || '',
                    certificate_number: details?.examiners?.[index]?.certificate_number || '',
                })),
                coordinator_name: details?.coordinator_name || '',
                coordinator_rank: details?.coordinator_rank || '',
                organizer_representative_name: details?.organizer_representative_name || '',
                organizer_representative_rank: details?.organizer_representative_rank || '',
                organizer_representative_role: details?.organizer_representative_role || '',
                isDirty: false,
            },
        ]),
    );
}

function calculateRow(config, row) {
    const groupTotals = {};
    let isComplete = true;

    for (const group of config.groups) {
        groupTotals[group.key] = group.criteria.reduce((total, criterion) => {
            const value = row.scores?.[criterion.key];
            if (value === '' || value === null || value === undefined) {
                isComplete = false;
                return total;
            }
            return total + Math.min(criterion.max, Math.max(0, Number(value) || 0));
        }, 0);
    }

    let theoryTotal = 0;
    if (config.uses_theory) {
        const theoryHistory = row.scores?.theory_history;
        const theoryPhilosophy = row.scores?.theory_philosophy;
        if ([theoryHistory, theoryPhilosophy].some((value) => value === '' || value === null || value === undefined)) {
            isComplete = false;
        }
        theoryTotal = Math.min(50, Math.max(0, Number(theoryHistory) || 0))
            + Math.min(50, Math.max(0, Number(theoryPhilosophy) || 0));
    }

    const practiceTotal = Object.values(groupTotals).reduce((total, value) => total + value, 0);
    const automaticTotalScore = theoryTotal + practiceTotal;
    const hasTotalOverride = row.total_score_override !== ''
        && row.total_score_override !== null
        && row.total_score_override !== undefined
        && Number.isFinite(Number(row.total_score_override));
    const totalScore = hasTotalOverride
        ? Math.min(config.maximum_total, Math.max(0, Number(row.total_score_override)))
        : automaticTotalScore;
    const percentage = (totalScore / config.maximum_total) * 100;
    const groupsMeetMinimum = config.groups.every((group) => groupTotals[group.key] >= group.max * 0.6);
    const override = row.status_override || 'auto';
    const status = override === 'passed'
        ? 'LULUS'
        : override === 'failed'
          ? 'TIDAK LULUS'
          : override === 'absent'
            ? 'TIDAK HADIR'
            : !isComplete
              ? 'BELUM DINILAI'
              : percentage >= 70 && groupsMeetMinimum
                ? 'LULUS'
                : 'TIDAK LULUS';

    return {
        groupTotals,
        theoryTotal,
        practiceTotal,
        partATotal: config.part_a_groups.reduce((total, key) => total + (groupTotals[key] || 0), 0),
        partBTotal: config.part_b_groups.reduce((total, key) => total + (groupTotals[key] || 0), 0),
        automaticTotalScore,
        totalScore,
        hasTotalOverride,
        percentage,
        status,
        isComplete,
    };
}

function number(value) {
    return Number(value || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 });
}

function StatusBadge({ status }) {
    const styles = {
        LULUS: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        'TIDAK LULUS': 'border-rose-200 bg-rose-50 text-rose-800',
        'TIDAK HADIR': 'border-amber-200 bg-amber-50 text-amber-800',
        'BELUM DINILAI': 'border-slate-200 bg-slate-50 text-slate-600',
    };

    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${styles[status] || styles['BELUM DINILAI']}`}>
            {status}
        </span>
    );
}

export default function EventKenshiExamTab({ event, kenshiExamData, mode }) {
    const detail = modeDetails[mode];
    const Icon = detail.icon;
    const canUpdate = Boolean(kenshiExamData?.can_update);
    const categories = useMemo(
        () => Object.keys(kenshiExamData?.configs || {}).filter(
            (category) => (kenshiExamData?.participants_by_category?.[category] || []).length > 0,
        ),
        [kenshiExamData],
    );
    const [activeCategory, setActiveCategory] = useState(categories[0] || 'KYU-8');
    const [rows, setRows] = useState(() => createRows(kenshiExamData));
    const [documentDetails, setDocumentDetails] = useState(() => createDocumentDetails(kenshiExamData));
    const [search, setSearch] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [notice, setNotice] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const errorRef = useRef(null);

    useEffect(() => {
        setRows(createRows(kenshiExamData));
        setDocumentDetails(createDocumentDetails(kenshiExamData));
    }, [kenshiExamData]);

    useEffect(() => {
        if (!categories.includes(activeCategory) && categories.length > 0) {
            setActiveCategory(categories[0]);
        }
    }, [activeCategory, categories]);

    const hasUnsavedChanges = useMemo(
        () => Object.values(rows).some((categoryRows) => Object.values(categoryRows).some((row) => row.isDirty))
            || Object.values(documentDetails).some((details) => details.isDirty),
        [documentDetails, rows],
    );

    useEffect(() => {
        const warnBeforeUnload = (event) => {
            if (!hasUnsavedChanges) return;
            event.preventDefault();
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', warnBeforeUnload);
        return () => window.removeEventListener('beforeunload', warnBeforeUnload);
    }, [hasUnsavedChanges]);

    const config = kenshiExamData?.configs?.[activeCategory];
    const participants = kenshiExamData?.participants_by_category?.[activeCategory] || [];
    const filteredParticipants = participants.filter((participant) => {
        const query = search.trim().toLocaleLowerCase('id-ID');
        return !query || [participant.name, participant.kenshi_id, participant.dojo, participant.origin]
            .some((value) => String(value || '').toLocaleLowerCase('id-ID').includes(query));
    });
    const dirtyCount = Object.values(rows[activeCategory] || {}).filter((row) => row.isDirty).length;
    const activeDocumentDetails = documentDetails[activeCategory] || createDocumentDetails(kenshiExamData)[activeCategory];
    const hasDocumentChanges = Boolean(activeDocumentDetails?.isDirty);

    const updateRow = (participantId, updater) => {
        setNotice('');
        setErrorMessage('');
        setRows((current) => ({
            ...current,
            [activeCategory]: {
                ...(current[activeCategory] || {}),
                [participantId]: {
                    ...(current[activeCategory]?.[participantId] || {}),
                    ...updater(current[activeCategory]?.[participantId] || {}),
                    isDirty: true,
                },
            },
        }));
    };

    const updateScore = (participantId, key, value) => {
        updateRow(participantId, (row) => ({ scores: { ...(row.scores || {}), [key]: value } }));
    };

    const updateDocumentDetails = (updater) => {
        setNotice('');
        setErrorMessage('');
        setDocumentDetails((current) => ({
            ...current,
            [activeCategory]: {
                ...current[activeCategory],
                ...updater(current[activeCategory]),
                isDirty: true,
            },
        }));
    };

    const saveChanges = (submitEvent) => {
        submitEvent?.preventDefault();
        const changedParticipants = participants.filter(
            (participant) => rows[activeCategory]?.[participant.event_participant_id]?.isDirty,
        );
        if (changedParticipants.length === 0 && !hasDocumentChanges) return;

        setIsSaving(true);
        setErrorMessage('');
        router.post(`/admin/event/${event.id}/ujian-kenshi`, {
            category: activeCategory,
            document_details: activeDocumentDetails,
            assessments: changedParticipants.map((participant) => {
                const row = rows[activeCategory][participant.event_participant_id];
                return {
                    event_participant_id: participant.event_participant_id,
                    scores: row.scores,
                    total_score_override: row.total_score_override,
                    status_override: row.status_override,
                    notes: row.notes,
                };
            }),
        }, {
            preserveScroll: true,
            onSuccess: () => setNotice(changedParticipants.length > 0
                ? `${changedParticipants.length} data peserta dan header dokumen berhasil disimpan.`
                : 'Header dokumen berhasil disimpan.'),
            onError: (errors) => {
                setErrorMessage(Object.values(errors)[0] || 'Data gagal disimpan. Periksa kembali isian.');
                requestAnimationFrame(() => errorRef.current?.focus());
            },
            onFinish: () => setIsSaving(false),
        });
    };

    if (!kenshiExamData || categories.length === 0) {
        return (
            <div className="rounded-2xl border border-[#DCE7F3] bg-white p-8 text-center">
                <Info className="mx-auto size-10 text-[#6B7C93]" aria-hidden="true" />
                <h2 className="mt-3 font-display text-lg font-bold text-[#0E2747]">Belum ada peserta kategori Kyu</h2>
                <p className="mt-1 text-sm text-[#6B7C93]">Tambahkan peserta ke jalur KYU-8 sampai KYU-1 terlebih dahulu.</p>
            </div>
        );
    }

    return (
        <form className="space-y-5" onSubmit={saveChanges}>
            <section className="overflow-hidden rounded-2xl border border-[#DCE7F3] bg-white shadow-xs">
                <div className="flex flex-col gap-4 border-b border-[#DCE7F3] bg-[#F8FBFF] p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF5FF] text-[#0B63CE]">
                            <Icon className="size-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                            <h2 className="font-display text-lg font-bold text-[#0E2747]">{detail.title}</h2>
                            <p className="mt-1 text-sm leading-6 text-[#52657D]">{detail.description}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <a
                            href={`/admin/event/${event.id}/dokumen-ujian-kenshi/${detail.document}`}
                            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#B9CCE1] bg-white px-4 py-2 text-sm font-semibold text-[#0A3F82] hover:border-[#0B63CE] hover:bg-[#EAF5FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                        >
                            <FileSpreadsheet className="size-4" aria-hidden="true" />
                            Unduh Excel
                        </a>
                        {canUpdate && (
                            <Button
                                type="submit"
                                icon={Save}
                                loading={isSaving}
                                disabled={(dirtyCount === 0 && !hasDocumentChanges) || isSaving}
                            >
                                {isSaving ? 'Menyimpan…' : `Simpan${dirtyCount ? ` (${dirtyCount})` : ''}`}
                            </Button>
                        )}
                    </div>
                </div>

                <div className="border-b border-[#DCE7F3] p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <Tabs
                            tabs={categories.map((category) => ({
                                id: category,
                                label: category.replace('-', ' '),
                                count: `${kenshiExamData.stats.categories?.[category]?.assessed || 0}/${kenshiExamData.stats.categories?.[category]?.total || 0}`,
                                panelId: 'kenshi-category-panel',
                            }))}
                            activeTab={activeCategory}
                            onChange={setActiveCategory}
                            ariaLabel="Kategori ujian Kyu"
                            className="min-w-0 flex-1 border-b-0"
                        />
                        <label className="relative block w-full xl:w-80">
                            <span className="sr-only">Cari peserta</span>
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6B7C93]" aria-hidden="true" />
                            <input
                                type="search"
                                name="participant_search"
                                autoComplete="off"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Cari nama, NIK, atau dojo…"
                                className="min-h-11 w-full rounded-xl border border-[#B9CCE1] bg-white py-2 pl-10 pr-3 text-base text-[#112743] placeholder:text-[#6B7C93] focus:border-[#0B63CE] focus:outline-none focus:ring-2 focus:ring-[#0B63CE]/20 md:text-sm"
                            />
                        </label>
                    </div>
                </div>
            </section>

            {notice && (
                <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                    <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
                    {notice}
                </div>
            )}
            {errorMessage && (
                <div ref={errorRef} tabIndex="-1" role="alert" className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 focus:outline-2 focus:outline-offset-2 focus:outline-[#0B63CE]">
                    <AlertCircle className="size-5 shrink-0" aria-hidden="true" />
                    {errorMessage}
                </div>
            )}

            <DocumentHeaderPanel
                event={event}
                category={activeCategory}
                details={activeDocumentDetails}
                updateDetails={updateDocumentDetails}
                canUpdate={canUpdate}
            />

            <div id="kenshi-category-panel" role="tabpanel" aria-label={`Data peserta ${activeCategory.replace('-', ' ')}`}>
            {mode === 'technique' && (
                <TechniquePanel
                    config={config}
                    participants={filteredParticipants}
                    rows={rows[activeCategory] || {}}
                    updateRow={updateRow}
                    updateScore={updateScore}
                    canUpdate={canUpdate}
                />
            )}
            {mode === 'tabulation' && (
                <TabulationPanel
                    config={config}
                    participants={filteredParticipants}
                    rows={rows[activeCategory] || {}}
                    updateScore={updateScore}
                    canUpdate={canUpdate}
                />
            )}
            {mode === 'results' && (
                <ResultsPanel
                    config={config}
                    participants={filteredParticipants}
                    rows={rows[activeCategory] || {}}
                    updateRow={updateRow}
                    canUpdate={canUpdate}
                />
            )}
            {mode === 'report' && (
                <ReportPanel
                    config={config}
                    participants={filteredParticipants}
                    rows={rows[activeCategory] || {}}
                    updateRow={updateRow}
                    canUpdate={canUpdate}
                />
            )}
            {filteredParticipants.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#B9CCE1] bg-white px-5 py-10 text-center text-sm text-[#6B7C93]">
                    Tidak ada peserta yang cocok dengan pencarian.
                </div>
            )}
            </div>
        </form>
    );
}

function DocumentHeaderPanel({ event, category, details, updateDetails, canUpdate }) {
    const updateField = (field, value) => updateDetails(() => ({ [field]: value }));
    const updateExaminer = (index, field, value) => updateDetails((current) => ({
        examiners: current.examiners.map((examiner, examinerIndex) => (
            examinerIndex === index ? { ...examiner, [field]: value } : examiner
        )),
    }));

    return (
        <details className={`group overflow-hidden rounded-xl border bg-white ${details?.isDirty ? 'border-[#EE9B25]' : 'border-[#DCE7F3]'}`}>
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#0B63CE] sm:px-5">
                <span className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF5FF] text-[#0B63CE]">
                        <FileSignature className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                        <span className="block text-sm font-bold text-[#0E2747]">Header dokumen & tim penguji · {category.replace('-', ' ')}</span>
                        <span className="mt-0.5 block text-xs text-[#6B7C93]">Dipakai pada seluruh sheet dan halaman Excel kategori ini.</span>
                    </span>
                </span>
                <span className="shrink-0 text-xs font-semibold text-[#0B63CE] group-open:hidden">Lengkapi</span>
                <span className="hidden shrink-0 text-xs font-semibold text-[#0B63CE] group-open:inline">Tutup</span>
            </summary>
            <div className="space-y-6 border-t border-[#DCE7F3] p-4 sm:p-5">
                <section aria-labelledby="event-document-context">
                    <h3 id="event-document-context" className="text-sm font-bold text-[#0E2747]">Data kegiatan dari event</h3>
                    <p className="mt-1 text-xs leading-5 text-[#6B7C93]">Nilai ini mengikuti data event dan tidak perlu diketik ulang pada setiap sheet.</p>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <Input label="Kegiatan" value={event.name || event.title || ''} readOnly />
                        <Input label="Tempat ujian" value={event.place || event.location || ''} readOnly />
                        <Input label="Tanggal ujian" value={event.date_formatted || ''} readOnly />
                    </div>
                </section>

                <section aria-labelledby="examiner-document-data">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h3 id="examiner-document-data" className="text-sm font-bold text-[#0E2747]">Mandat dan tiga penguji</h3>
                            <p className="mt-1 text-xs leading-5 text-[#6B7C93]">Sesuai header Formulir 27 dan Formulir 28.</p>
                        </div>
                        <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
                            <Input name={`mandate_number_${category}`} autoComplete="off" maxLength="100" label="Nomor mandat" value={details?.mandate_number || ''} disabled={!canUpdate} onChange={(e) => updateField('mandate_number', e.target.value)} />
                            <Input name={`mandate_date_${category}`} autoComplete="off" label="Tanggal mandat" type="date" value={details?.mandate_date || ''} disabled={!canUpdate} onChange={(e) => updateField('mandate_date', e.target.value)} />
                        </div>
                    </div>
                    <div className="mt-4 grid gap-4 xl:grid-cols-3">
                        {(details?.examiners || []).map((examiner, index) => (
                            <fieldset key={index} className="border-l-2 border-[#0B63CE] bg-[#F8FBFF] p-4">
                                <legend className="px-1 text-xs font-bold uppercase tracking-[0.14em] text-[#0A3F82]">Penguji {index + 1}</legend>
                                <div className="mt-2 space-y-3">
                                    <Input name={`examiner_${index + 1}_name_${category}`} autoComplete="off" maxLength="255" label="Nama" value={examiner.name} disabled={!canUpdate} onChange={(e) => updateExaminer(index, 'name', e.target.value)} />
                                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                                        <Input name={`examiner_${index + 1}_rank_${category}`} autoComplete="off" maxLength="100" label="Tingkat / DAN" value={examiner.rank} disabled={!canUpdate} onChange={(e) => updateExaminer(index, 'rank', e.target.value)} />
                                        <Input name={`examiner_${index + 1}_certificate_${category}`} autoComplete="off" maxLength="100" label="No. sertifikat" value={examiner.certificate_number} disabled={!canUpdate} onChange={(e) => updateExaminer(index, 'certificate_number', e.target.value)} />
                                    </div>
                                </div>
                            </fieldset>
                        ))}
                    </div>
                </section>

                <section aria-labelledby="document-signatories">
                    <h3 id="document-signatories" className="text-sm font-bold text-[#0E2747]">Penandatangan rekap</h3>
                    <div className="mt-3 grid gap-5 lg:grid-cols-2">
                        <fieldset className="grid gap-3 border-l-2 border-[#20A47A] pl-4 sm:grid-cols-2">
                            <legend className="col-span-full px-1 text-xs font-bold uppercase tracking-[0.14em] text-[#0E2747]">Koordinator tim penguji</legend>
                            <Input name={`coordinator_name_${category}`} autoComplete="off" maxLength="255" label="Nama" value={details?.coordinator_name || ''} disabled={!canUpdate} onChange={(e) => updateField('coordinator_name', e.target.value)} />
                            <Input name={`coordinator_rank_${category}`} autoComplete="off" maxLength="100" label="Tingkat / DAN" value={details?.coordinator_rank || ''} disabled={!canUpdate} onChange={(e) => updateField('coordinator_rank', e.target.value)} />
                        </fieldset>
                        <fieldset className="grid gap-3 border-l-2 border-[#7957D5] pl-4 sm:grid-cols-2">
                            <legend className="col-span-full px-1 text-xs font-bold uppercase tracking-[0.14em] text-[#0E2747]">PB / Pengprov / Panpel</legend>
                            <Input name={`organizer_name_${category}`} autoComplete="off" maxLength="255" label="Nama" value={details?.organizer_representative_name || ''} disabled={!canUpdate} onChange={(e) => updateField('organizer_representative_name', e.target.value)} />
                            <Input name={`organizer_rank_${category}`} autoComplete="off" maxLength="100" label="Tingkat / DAN" value={details?.organizer_representative_rank || ''} disabled={!canUpdate} onChange={(e) => updateField('organizer_representative_rank', e.target.value)} />
                            <Input name={`organizer_role_${category}`} autoComplete="off" maxLength="150" wrapperClassName="sm:col-span-2" label="Jabatan pada Formulir 28" value={details?.organizer_representative_role || ''} disabled={!canUpdate} onChange={(e) => updateField('organizer_representative_role', e.target.value)} />
                        </fieldset>
                    </div>
                </section>
            </div>
        </details>
    );
}

function TechniquePanel({ config, participants, rows, updateRow, updateScore, canUpdate }) {
    return (
        <div className="space-y-4">
            <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <p>Setiap kelompok teknik minimal 60%. Hasil akhir dinyatakan lulus jika seluruh komponen lengkap dan total mencapai minimal 70%.</p>
            </div>
            {participants.map((participant) => {
                const row = rows[participant.event_participant_id] || { scores: {}, status_override: 'auto', notes: '' };
                const calculation = calculateRow(config, row);
                return (
                    <details key={participant.event_participant_id} className={`group rounded-2xl border bg-white shadow-xs ${row.isDirty ? 'border-amber-300' : 'border-[#DCE7F3]'}`}>
                        <summary className="flex min-h-14 cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]">
                            <div className="min-w-0">
                                <h3 className="font-bold text-[#112743]">{participant.name}</h3>
                                <p className="mt-0.5 text-xs text-[#6B7C93]">{participant.kenshi_id} · {participant.dojo}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold tabular-nums text-[#0A3F82]">{number(calculation.practiceTotal)}/{config.technique_maximum}</span>
                                <StatusBadge status={calculation.status} />
                                <span className="text-xs font-semibold text-[#0B63CE] group-open:hidden">Isi nilai</span>
                                <span className="hidden text-xs font-semibold text-[#0B63CE] group-open:inline">Tutup</span>
                            </div>
                        </summary>
                        <div className="space-y-5 border-t border-[#DCE7F3] p-4 sm:p-5">
                            {config.groups.map((group) => (
                                <fieldset key={group.key} className="space-y-3">
                                    <legend className="flex w-full items-center justify-between text-sm font-bold text-[#0E2747]">
                                        <span>{group.label}</span>
                                        <span className="text-[#0B63CE] tabular-nums">{number(calculation.groupTotals[group.key])}/{group.max}</span>
                                    </legend>
                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {group.criteria.map((criterion) => {
                                            const value = row.scores?.[criterion.key] ?? '';
                                            return (
                                                <label key={criterion.key} className="rounded-xl border border-[#DCE7F3] bg-[#F8FBFF] p-3">
                                                    <span className="block min-h-10 text-xs font-semibold leading-5 text-[#52657D]">{criterion.label}</span>
                                                    <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#0B63CE]">
                                                        {criterion.sheet === 'embu' ? 'Sheet Hal 2' : 'Sheet utama'} · Kolom {criterion.column}
                                                    </span>
                                                    <span className="mt-2 flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            inputMode="decimal"
                                                            name={`score_${participant.event_participant_id}_${criterion.key}`}
                                                            autoComplete="off"
                                                            min="0"
                                                            max={criterion.max}
                                                            step="0.5"
                                                            value={value}
                                                            disabled={!canUpdate}
                                                            onChange={(event) => updateScore(participant.event_participant_id, criterion.key, event.target.value, criterion.max)}
                                                            className="min-h-11 min-w-0 flex-1 rounded-lg border border-[#B9CCE1] bg-white px-3 text-base font-bold tabular-nums text-[#112743] focus:border-[#0B63CE] focus:outline-none focus:ring-2 focus:ring-[#0B63CE]/20 md:text-sm"
                                                        />
                                                        <span className="text-xs font-bold text-[#6B7C93]">/ {criterion.max}</span>
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </fieldset>
                            ))}
                            <label className="block">
                                <span className="text-sm font-bold text-[#0E2747]">Catatan penguji</span>
                                <textarea
                                    rows="2"
                                    name={`notes_${participant.event_participant_id}`}
                                    autoComplete="off"
                                    value={row.notes || ''}
                                    disabled={!canUpdate}
                                    onChange={(event) => updateRow(participant.event_participant_id, () => ({ notes: event.target.value }))}
                                    className="mt-2 w-full rounded-xl border border-[#B9CCE1] px-3 py-2 text-base text-[#112743] focus:border-[#0B63CE] focus:outline-none focus:ring-2 focus:ring-[#0B63CE]/20 md:text-sm"
                                />
                            </label>
                        </div>
                    </details>
                );
            })}
        </div>
    );
}

function TabulationPanel({ config, participants, rows, updateScore, canUpdate }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-[#DCE7F3] bg-white shadow-xs">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] text-sm">
                    <thead className="bg-[#F8FBFF] text-left text-xs uppercase tracking-wide text-[#52657D]">
                        <tr>
                            <th className="px-4 py-3">Peserta</th>
                            <th className="px-3 py-3 text-center">Sejarah & Organisasi <span className="block text-[10px] normal-case tracking-normal text-[#6B7C93]">Kolom E Excel</span></th>
                            <th className="px-3 py-3 text-center">Filosofi & Etika <span className="block text-[10px] normal-case tracking-normal text-[#6B7C93]">Kolom F Excel</span></th>
                            <th className="px-3 py-3 text-center">Praktik A</th>
                            <th className="px-3 py-3 text-center">Praktik B</th>
                            <th className="px-3 py-3 text-center">Total</th>
                            <th className="px-3 py-3 text-center">Hasil</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7EEF6]">
                        {participants.map((participant) => {
                            const row = rows[participant.event_participant_id] || { scores: {}, status_override: 'auto' };
                            const calculation = calculateRow(config, row);
                            return (
                                <tr key={participant.event_participant_id} className={row.isDirty ? 'bg-amber-50/60' : 'hover:bg-[#F8FBFF]'}>
                                    <td className={`sticky left-0 z-10 px-4 py-3 ${row.isDirty ? 'bg-amber-50' : 'bg-white'}`}>
                                        <div className="font-bold text-[#112743]">{participant.name}</div>
                                        <div className="mt-0.5 text-xs text-[#6B7C93]">{participant.kenshi_id} · {participant.dojo}</div>
                                    </td>
                                    {config.uses_theory ? (
                                        <>
                                            <ScoreCell value={row.scores?.theory_history ?? ''} maximum={50} label={`Nilai sejarah ${participant.name}`} disabled={!canUpdate} onChange={(value) => updateScore(participant.event_participant_id, 'theory_history', value, 50)} />
                                            <ScoreCell value={row.scores?.theory_philosophy ?? ''} maximum={50} label={`Nilai filosofi ${participant.name}`} disabled={!canUpdate} onChange={(value) => updateScore(participant.event_participant_id, 'theory_philosophy', value, 50)} />
                                        </>
                                    ) : (
                                        <td colSpan="2" className="px-3 py-3 text-center text-xs font-semibold text-[#6B7C93]">Tidak dipersyaratkan</td>
                                    )}
                                    <td className="px-3 py-3 text-center font-bold tabular-nums text-[#0A3F82]">{number(calculation.partATotal)}</td>
                                    <td className="px-3 py-3 text-center font-bold tabular-nums text-[#0A3F82]">{number(calculation.partBTotal)}</td>
                                    <td className="px-3 py-3 text-center">
                                        <div className="font-extrabold tabular-nums text-[#112743]">{number(calculation.totalScore)}/{config.maximum_total}</div>
                                        <div className="text-xs text-[#6B7C93]">{number(calculation.percentage)}%</div>
                                    </td>
                                    <td className="px-3 py-3 text-center"><StatusBadge status={calculation.status} /></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ScoreCell({ value, maximum, label, onChange, disabled }) {
    return (
        <td className="px-3 py-3 text-center">
            <label>
                <span className="sr-only">{label}</span>
                <input
                    type="number"
                    name={label.toLocaleLowerCase('id-ID').replace(/[^a-z0-9]+/g, '_')}
                    autoComplete="off"
                    inputMode="decimal"
                    min="0"
                    max={maximum}
                    step="0.5"
                    value={value}
                    disabled={disabled}
                    onChange={(event) => onChange(event.target.value)}
                    className="min-h-11 w-20 rounded-lg border border-[#B9CCE1] px-2 text-center text-base font-bold tabular-nums text-[#112743] focus:border-[#0B63CE] focus:outline-none focus:ring-2 focus:ring-[#0B63CE]/20 md:text-sm"
                />
            </label>
        </td>
    );
}

function ManualTotalField({ config, participant, row, automaticTotalScore, updateRow, canUpdate }) {
    const descriptionId = `manual-score-help-${participant.event_participant_id}`;

    return (
        <label className="mx-auto block w-32">
            <span className="sr-only">Nilai akhir manual untuk {participant.name}</span>
            <input
                type="number"
                name={`manual_total_${participant.event_participant_id}`}
                autoComplete="off"
                inputMode="decimal"
                min="0"
                max={config.maximum_total}
                step="0.5"
                value={row.total_score_override ?? ''}
                disabled={!canUpdate}
                aria-describedby={descriptionId}
                placeholder={number(automaticTotalScore)}
                onChange={(event) => updateRow(participant.event_participant_id, () => ({ total_score_override: event.target.value }))}
                className="min-h-11 w-full rounded-lg border border-[#B9CCE1] bg-white px-2 text-center text-base font-bold tabular-nums text-[#112743] placeholder:font-semibold placeholder:text-[#8A9AAF] focus:border-[#0B63CE] focus:outline-none focus:ring-2 focus:ring-[#0B63CE]/20 md:text-sm"
            />
            <span id={descriptionId} className="mt-1 block text-[11px] leading-4 text-[#6B7C93]">
                Kosong = otomatis {number(automaticTotalScore)}
            </span>
        </label>
    );
}

function DecisionSelect({ participant, row, automaticStatus, updateRow, canUpdate }) {
    return (
        <label>
            <span className="sr-only">Keputusan untuk {participant.name}</span>
            <select
                name={`status_${participant.event_participant_id}`}
                autoComplete="off"
                value={row.status_override || 'auto'}
                disabled={!canUpdate}
                onChange={(event) => updateRow(participant.event_participant_id, () => ({ status_override: event.target.value }))}
                className="min-h-11 w-full rounded-xl border border-[#B9CCE1] bg-white px-3 text-base font-semibold text-[#112743] focus:border-[#0B63CE] focus:outline-none focus:ring-2 focus:ring-[#0B63CE]/20 md:text-sm"
            >
                <option value="auto">Otomatis · {automaticStatus}</option>
                <option value="passed">Lulus</option>
                <option value="failed">Tidak Lulus</option>
                <option value="absent">Tidak Hadir</option>
            </select>
        </label>
    );
}

function ResultsPanel({ config, participants, rows, updateRow, canUpdate }) {
    return (
        <div className="space-y-4">
            <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <p>Nilai teknik dan teori tetap dihitung otomatis. Isi nilai akhir manual hanya untuk koreksi resmi; kosongkan kembali untuk memakai hasil otomatis.</p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[#DCE7F3] bg-white shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[920px] text-sm">
                        <thead className="bg-[#F8FBFF] text-left text-xs uppercase tracking-wide text-[#52657D]">
                            <tr>
                                <th className="px-4 py-3">Peserta</th>
                                <th className="px-3 py-3 text-center">Nilai Otomatis</th>
                                <th className="px-3 py-3 text-center">Nilai Akhir Manual</th>
                                <th className="px-3 py-3 text-center">Hasil Otomatis</th>
                                <th className="px-3 py-3">Keputusan Laporan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E7EEF6]">
                            {participants.map((participant) => {
                                const row = rows[participant.event_participant_id] || { scores: {}, total_score_override: '', status_override: 'auto' };
                                const automatic = calculateRow(config, { ...row, total_score_override: '', status_override: 'auto' });
                                const final = calculateRow(config, row);
                                return (
                                    <tr key={participant.event_participant_id} className={row.isDirty ? 'bg-amber-50/60' : 'hover:bg-[#F8FBFF]'}>
                                        <td className={`sticky left-0 z-10 px-4 py-3 ${row.isDirty ? 'bg-amber-50' : 'bg-white'}`}>
                                            <div className="font-bold text-[#112743]">{participant.name}</div>
                                            <div className="mt-0.5 text-xs text-[#6B7C93]">{participant.kenshi_id} · {participant.dojo}</div>
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            <div className="font-extrabold tabular-nums text-[#112743]">{number(automatic.totalScore)}</div>
                                            <div className="text-xs text-[#6B7C93]">{number(automatic.percentage)}%</div>
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            <ManualTotalField config={config} participant={participant} row={row} automaticTotalScore={automatic.totalScore} updateRow={updateRow} canUpdate={canUpdate} />
                                            {final.hasTotalOverride && <span className="mt-1 block text-xs font-bold text-[#0B63CE]">Akhir {number(final.totalScore)} · {number(final.percentage)}%</span>}
                                        </td>
                                        <td className="px-3 py-3 text-center"><StatusBadge status={automatic.status} /></td>
                                        <td className="px-3 py-3">
                                            <DecisionSelect participant={participant} row={row} automaticStatus={calculateRow(config, { ...row, status_override: 'auto' }).status} updateRow={updateRow} canUpdate={canUpdate} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function ReportPanel({ config, participants, rows, updateRow, canUpdate }) {
    return (
        <div className="space-y-4">
            <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <p>Kolom manual dan keputusan di sini tersinkron dengan tab Hasil Ujian. Perubahan akan masuk ke laporan dan file Excel setelah disimpan.</p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[#DCE7F3] bg-white shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1080px] text-sm">
                        <thead className="bg-[#F8FBFF] text-left text-xs uppercase tracking-wide text-[#52657D]">
                            <tr>
                                <th className="px-4 py-3 text-center">No.</th>
                                <th className="px-4 py-3">Nama Kenshi</th>
                                <th className="px-4 py-3">NIK</th>
                                <th className="px-4 py-3">Dojo / Asal</th>
                                <th className="px-4 py-3 text-center">Nilai Otomatis</th>
                                <th className="px-4 py-3 text-center">Nilai Akhir Manual</th>
                                <th className="px-4 py-3 text-center">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E7EEF6]">
                            {participants.map((participant, index) => {
                                const row = rows[participant.event_participant_id] || { scores: {}, total_score_override: '', status_override: 'auto' };
                                const automatic = calculateRow(config, { ...row, total_score_override: '', status_override: 'auto' });
                                const calculation = calculateRow(config, row);
                                return (
                                    <tr key={participant.event_participant_id} className={row.isDirty ? 'bg-amber-50/60' : 'hover:bg-[#F8FBFF]'}>
                                        <td className="px-4 py-3 text-center font-semibold text-[#6B7C93]">{index + 1}</td>
                                        <td className={`sticky left-0 z-10 px-4 py-3 font-bold text-[#112743] ${row.isDirty ? 'bg-amber-50' : 'bg-white'}`}>{participant.name}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-[#52657D]">{participant.kenshi_id}</td>
                                        <td className="px-4 py-3 text-[#52657D]">{participant.dojo}<span className="block text-xs text-[#6B7C93]">{participant.origin}</span></td>
                                        <td className="px-4 py-3 text-center font-extrabold tabular-nums text-[#112743]">{number(automatic.totalScore)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <ManualTotalField config={config} participant={participant} row={row} automaticTotalScore={automatic.totalScore} updateRow={updateRow} canUpdate={canUpdate} />
                                            {calculation.hasTotalOverride && <span className="mt-1 block text-xs font-bold text-[#0B63CE]">Dipakai: {number(calculation.totalScore)}</span>}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <StatusBadge status={calculation.status} />
                                            <div className="mt-2 min-w-48">
                                                <DecisionSelect participant={participant} row={row} automaticStatus={calculateRow(config, { ...row, status_override: 'auto' }).status} updateRow={updateRow} canUpdate={canUpdate} />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
