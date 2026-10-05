import { useState, useMemo, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import useEventReviewState from './useEventReviewState';
import useEventDocumentState from './useEventDocumentState';
import useEventManagementState from './useEventManagementState';
import { useIsProdas } from '../../../../Utils/isProdas';

export default function useEventShowState({
    event,
    modules = [],
    learningModules = [],
    linkedCbtPackages = [],
    availableMasterModules = [],
    availableMasterCbtPackages = [],
    availableQuestionModules = [],
    sessionsByDay = {},
    arrivalSession = null,
    speakers = [],
    rooms = [],
    participants = [],
    availableParticipants = [],
    attendances = [],
    cbtPackages = [],
    examRevisions = [],
    proctoringEvents = [],
    tracks = [],
    sessionTypes = [],
    legends = [],
    publishedMaterials = [],
    stats = {},
    documentNumberLabels = {},
    documentNumberDefaults = {},
    documentNumberOverrides = {},
    transcriptNumberLabels = {},
    transcriptNumberDefaults = {},
    transcriptNumberOverrides = {},
    certificateSignatureSettings = {},
    certificateSignatureDefaults = {},
    registrationForms = [],
    integrityPacts = [],
    examAttempts = [],
    cbtCompletionMatrix = [],
    cbtCompletionStats = {},
    assessmentData = null,
    practicalExamData = null,
    kenshiExamData = null,
    finances = [],
    financeAnalysis = null,
    budgets = [],
    rabAnalysis = null,
    canManageBudget = false,
    activities = [],
    staff = [],
    staffCandidates = [],
    reportPermissions = {},
    outcomesSummary = {},
    reportSessions = [],
    mandate = null,
}) {
    const isPortalAdmin = usePage().props.auth?.user?.is_admin;
    const isProdas = useIsProdas();
    // Active tab state
    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window === 'undefined') return 'ringkasan';
        const requested = new URLSearchParams(window.location.search).get('tab');
        if (requested === 'laporan') return 'rekap-laporan';
        if (requested === 'finance') return 'keuangan';
        if (requested === 'documentation') return 'dokumentasi';
        if (requested === 'staff') return 'petugas';
        if (requested === 'rab' || requested === 'anggaran') return 'rab';
        const availableTabs = [
            'ringkasan',
            'rundown',
            'peserta',
            'formulir',
            'pakta',
            'hasil-ujian',
            'penilaian',
            'ujian-praktik',
            'kenshi-penilaian',
            'kenshi-tabulasi',
            'kenshi-hasil',
            'kenshi-laporan',
            'absensi',
            'rab',
            'keuangan',
            'dokumentasi',
            'realisasi',
            'petugas',
            'rekap-laporan',
            'pemateri',
            'sertifikat',
            'revisi',
            'pengawasan',
            'legenda',
            'dokumen',
            'pengaturan',
            'ruang',
            'modul_cbt',
            'materi',
            'cbt',
        ];

        if (isProdas) {
            availableTabs.push('mandat');
        }

        return availableTabs.includes(requested) ? requested : 'ringkasan';
    });
    useEffect(() => {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', activeTab);
        window.history.replaceState(window.history.state, '', url);
    }, [activeTab]);
    const [selectedDay, setSelectedDay] = useState(1);
    const [rundownTrackFilter, setRundownTrackFilter] = useState('all');
    const [attendanceSessionFilter, setAttendanceSessionFilter] = useState('all');
    const [credentialSearch, setCredentialSearch] = useState('');
    const [participantSearch, setParticipantSearch] = useState('');
    const [participantTrackFilter, setParticipantTrackFilter] = useState('all');
    const [participantCheckinFilter, setParticipantCheckinFilter] = useState('all');
    const [batchPrintTrack, setBatchPrintTrack] = useState('all');
    const [participantPerPage, setParticipantPerPage] = useState(25);
    const [participantPage, setParticipantPage] = useState(() => {
        if (typeof window === 'undefined') return 1;
        const pageParam = parseInt(new URLSearchParams(window.location.search).get('page'), 10);
        return !isNaN(pageParam) && pageParam > 0 ? pageParam : 1;
    });

    const reviewState = useEventReviewState({ event, registrationForms, integrityPacts, examAttempts, cbtCompletionMatrix, tracks });
    const { examPackageFilter } = reviewState;
    useEffect(() => {
        if (activeTab === 'peserta') {
            const url = new URL(window.location.href);
            if (participantPage > 1) {
                url.searchParams.set('page', String(participantPage));
            } else {
                url.searchParams.delete('page');
            }
            window.history.replaceState(window.history.state, '', url);
        }
    }, [activeTab, participantPage]);
    const documentState = useEventDocumentState({ event, documentNumberLabels, documentNumberOverrides, certificateSignatureSettings, certificateSignatureDefaults });
    const managementState = useEventManagementState({ event, sessionTypes, selectedDay, setSelectedDay, learningModules, linkedCbtPackages });
    const {
        attendanceResetTarget,
        setAttendanceResetTarget,
        setIsResettingAttendance,
        setIsGenerateAttendanceModalOpen,
        setIsGeneratingAttendance,
        generateTrack,
        generateStatus,
        generateIncludeArrival,
        generateIncludeDaily,
        generateIncludeSessions,
        generateDay,
        attendanceSearch,
        attendanceStatusFilter,
        attendancePerPage,
        attendancePage,
        restartExamTarget,
        setRestartExamTarget,
        setIsRestartingExam,
        completeExamTarget,
        setCompleteExamTarget,
        setIsCompletingExam,
        deleteExamTarget,
        setDeleteExamTarget,
        setIsDeletingExam,
    } = managementState;
    const settingSections = [
        { id: 'ruang', label: 'Ruang' },
        { id: 'modul_cbt', label: 'Modul & CBT' },
        { id: 'materi', label: 'Materi' },
        { id: 'cbt', label: 'Ujian CBT' },
    ];
    const isKenshiExamEvent = isProdas
        || ['ukt', 'kenshi'].includes(event.event_type)
        || tracks.some((track) => track.code?.startsWith('KYU-'));

    const tabs = [
        { id: 'ringkasan', label: 'Informasi', count: null },
        ...(isProdas ? [{ id: 'mandat', label: 'Mandat', count: mandate?.document_url ? 1 : null }] : []),
        { id: 'rundown', label: 'Rundown & Sesi', count: stats.total_sessions },
        { id: 'peserta', label: 'Peserta', count: stats.total_participants },
        { id: 'formulir', label: 'Formulir Pendaftaran', count: stats.total_registration_forms ?? registrationForms.length },
        { id: 'pakta', label: 'Pakta Integritas', count: stats.total_integrity_pacts ?? (integrityPacts?.length || 0) },
        { id: 'hasil-ujian', label: 'Hasil Ujian CBT', count: stats.total_exam_attempts ?? (examAttempts?.length || 0) },
        ...(!isProdas ? [
            { id: 'penilaian', label: 'Penilaian Form Praktik', count: stats.total_assessments ?? (assessmentData?.stats?.total_assessed || 0) },
            { id: 'ujian-praktik', label: 'Ujian Praktik (1 Lembar)', count: stats.total_practical_exams ?? (practicalExamData?.stats?.total_assessed || 0) },
        ] : []),
        ...(isKenshiExamEvent ? [
            { id: 'kenshi-penilaian', label: 'Penilaian Teknik Kenshi', count: kenshiExamData?.stats?.total_assessed || 0 },
            { id: 'kenshi-tabulasi', label: 'Tabulasi Nilai Kenshi', count: kenshiExamData?.stats?.total_participants || 0 },
            { id: 'kenshi-hasil', label: 'Hasil Ujian Kenshi', count: kenshiExamData?.stats?.total_assessed || 0 },
            { id: 'kenshi-laporan', label: 'Laporan Kyu–Dan', count: kenshiExamData?.stats?.total_participants || 0 },
        ] : []),
        { id: 'absensi', label: 'Absensi', count: stats.total_attendances || attendances.length },
        { id: 'rab', label: 'RAB Anggaran', count: stats.total_budgets ?? budgets?.length },
        { id: 'keuangan', label: 'Keuangan', count: stats.total_finances ?? finances?.length },
        { id: 'dokumentasi', label: 'Event Dokumentasi', count: stats.total_documentations },
        { id: 'realisasi', label: isProdas ? 'Realisasi Acara Gashuku & UKT' : 'Realisasi Acara', count: stats.total_realisations },
        { id: 'petugas', label: 'Penugasan Kluster Petugas', count: stats.total_staff },
        { id: 'rekap-laporan', label: 'Rekap & Ekspor Laporan', count: null },
        { id: 'pemateri', label: 'Pemateri', count: stats.total_speakers },
        { id: 'sertifikat', label: 'E-Sertifikat & Transkrip', count: (stats.certificate_files_count || 0) + (stats.transcript_files_count || 0) },
        { id: 'revisi', label: 'Revisi Ujian', count: examRevisions.length },
        { id: 'pengawasan', label: 'Pengawasan CBT', count: stats.proctoring_events_count || proctoringEvents.length },
        { id: 'legenda', label: 'Legenda & Singkatan', count: null },
        { id: 'dokumen', label: 'Dokumen & Ketentuan', count: null },
        { id: 'pengaturan', label: 'Pengaturan Event', count: null },
    ];

    // Helper date parsing
    const parseDateOnly = (dateStr) => {
        if (!dateStr) return null;
        const parts = String(dateStr).split(/[-T ]/);
        if (parts.length >= 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                return new Date(year, month, day);
            }
        }
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d;
    };

    const totalDays = useMemo(() => {
        let count = event.total_days || 0;
        if (!count && event.start_date && event.end_date) {
            const s = parseDateOnly(event.start_date);
            const e = parseDateOnly(event.end_date);
            if (s && e) {
                const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                if (diff > 0) count = diff;
            }
        }
        const sessionDayKeys = Object.keys(sessionsByDay || {})
            .map(Number)
            .filter((n) => !isNaN(n) && n > 0);
        const maxSessionDay = sessionDayKeys.length > 0 ? Math.max(...sessionDayKeys) : 1;
        return Math.max(count || 1, maxSessionDay, 1);
    }, [event.total_days, event.start_date, event.end_date, sessionsByDay]);

    const daysList = useMemo(() => {
        return Array.from({ length: totalDays }, (_, i) => i + 1);
    }, [totalDays]);

    const getDayDateObj = (dayNum) => {
        if (!event.start_date) return null;
        const base = parseDateOnly(event.start_date);
        if (!base) return null;
        const d = new Date(base);
        d.setDate(d.getDate() + (dayNum - 1));
        return d;
    };

    const getDayDateInfo = (dayNum) => {
        const d = getDayDateObj(dayNum);
        if (!d) return null;
        return d.toLocaleDateString('id-ID', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
        });
    };

    const getDayIsoDate = (dayNum) => {
        const d = getDayDateObj(dayNum);
        if (!d) return event.start_date || '';
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const activeDayData = sessionsByDay[selectedDay] || { day_number: selectedDay, sessions: [] };

    // Filtered & Paginated attendances for Tab 4
    const filteredAttendances = useMemo(() => {
        return (attendances || []).filter((att) => {
            if (attendanceSessionFilter !== 'all' && String(att.session_id) !== String(attendanceSessionFilter)) {
                return false;
            }
            if (attendanceStatusFilter !== 'all' && att.status !== attendanceStatusFilter) {
                return false;
            }
            if (attendanceSearch.trim()) {
                const q = attendanceSearch.trim().toLowerCase();
                const matchName = (att.participant_name || '').toLowerCase().includes(q);
                const matchTopic = (att.session_topic || '').toLowerCase().includes(q);
                const matchNumber = (att.session_number || '').toLowerCase().includes(q);
                const matchRecordedBy = (att.recorded_by || '').toLowerCase().includes(q);
                const matchNotes = (att.notes || '').toLowerCase().includes(q);
                if (!matchName && !matchTopic && !matchNumber && !matchRecordedBy && !matchNotes) {
                    return false;
                }
            }
            return true;
        });
    }, [attendances, attendanceSessionFilter, attendanceStatusFilter, attendanceSearch]);

    const totalAttendancePages = attendancePerPage === 'all'
        ? 1
        : Math.max(1, Math.ceil(filteredAttendances.length / Number(attendancePerPage)));

    const safeAttendancePage = Math.min(attendancePage, totalAttendancePages);

    const paginatedAttendances = useMemo(() => {
        if (attendancePerPage === 'all') {
            return filteredAttendances;
        }
        const perPageNum = Number(attendancePerPage);
        const start = (safeAttendancePage - 1) * perPageNum;
        return filteredAttendances.slice(start, start + perPageNum);
    }, [filteredAttendances, safeAttendancePage, attendancePerPage]);

    const attendancePageNumbers = useMemo(() => {
        const total = totalAttendancePages;
        const current = safeAttendancePage;
        if (total <= 7) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }
        if (current <= 4) {
            return [1, 2, 3, 4, 5, '...', total];
        }
        if (current >= total - 3) {
            return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
        }
        return [1, '...', current - 1, current, current + 1, '...', total];
    }, [totalAttendancePages, safeAttendancePage]);


    const credentialParticipants = useMemo(() => {
        const query = credentialSearch.trim().toLocaleLowerCase('id-ID');

        if (!query) {
            return participants;
        }

        return participants.filter((participant) => [
            participant.name,
            participant.kenshi_id,
            participant.track_code,
            participant.track_name,
        ].some((value) => String(value || '').toLocaleLowerCase('id-ID').includes(query)));
    }, [credentialSearch, participants]);

    const availableTrackOptions = useMemo(() => {
        const set = new Set();
        (tracks || []).forEach((t) => t.code && set.add(t.code));
        (participants || []).forEach((p) => p.track_code && set.add(p.track_code));
        return Array.from(set).sort();
    }, [tracks, participants]);

    const batchPrintTrackOptions = useMemo(() => {
        return availableTrackOptions
            .map((code) => {
                const count = (participants || []).filter((p) => p.track_code === code).length;
                const name =
                    (tracks || []).find((t) => t.code === code)?.name ||
                    (participants || []).find((p) => p.track_code === code)?.track_name ||
                    code;
                return { code, name, count };
            })
            .filter((item) => item.count > 0);
    }, [availableTrackOptions, tracks, participants]);

    const filteredParticipants = useMemo(() => {
        return (participants || []).filter((p) => {
            if (participantTrackFilter !== 'all' && p.track_code !== participantTrackFilter) {
                return false;
            }
            if (participantCheckinFilter === 'checked_in' && !p.checked_in_at) {
                return false;
            }
            if (participantCheckinFilter === 'not_checked_in' && p.checked_in_at) {
                return false;
            }
            if (participantSearch.trim()) {
                const q = participantSearch.trim().toLowerCase();
                const matchName = (p.name || '').toLowerCase().includes(q);
                const matchKenshiId = (p.kenshi_id || '').toLowerCase().includes(q);
                const matchOrigin = (p.origin || '').toLowerCase().includes(q);
                const matchTrack = (p.track_code || '').toLowerCase().includes(q) || (p.track_name || '').toLowerCase().includes(q);
                const matchDan = (p.dan_roman || '').toLowerCase().includes(q);
                if (!matchName && !matchKenshiId && !matchOrigin && !matchTrack && !matchDan) {
                    return false;
                }
            }
            return true;
        });
    }, [participants, participantSearch, participantTrackFilter, participantCheckinFilter]);

    const totalParticipantPages = participantPerPage === 'all'
        ? 1
        : Math.max(1, Math.ceil(filteredParticipants.length / Number(participantPerPage)));

    const safeParticipantPage = Math.min(participantPage, totalParticipantPages);

    const paginatedParticipants = useMemo(() => {
        if (participantPerPage === 'all') {
            return filteredParticipants;
        }
        const perPageNum = Number(participantPerPage);
        const start = (safeParticipantPage - 1) * perPageNum;
        return filteredParticipants.slice(start, start + perPageNum);
    }, [filteredParticipants, safeParticipantPage, participantPerPage]);

    const participantPageNumbers = useMemo(() => {
        const total = totalParticipantPages;
        const current = safeParticipantPage;
        if (total <= 7) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }
        if (current <= 4) {
            return [1, 2, 3, 4, 5, '...', total];
        }
        if (current >= total - 3) {
            return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
        }
        return [1, '...', current - 1, current, current + 1, '...', total];
    }, [totalParticipantPages, safeParticipantPage]);

    const handleAttendanceReset = () => {
        if (!attendanceResetTarget) return;

        const resetAll = attendanceResetTarget === 'all';
        const url = resetAll
            ? `/admin/event/${event.id}/absensi`
            : attendanceResetTarget.scope === 'participant'
                ? `/admin/event/${event.id}/peserta/${attendanceResetTarget.id}/hasil`
                : `/admin/event/${event.id}/absensi/${attendanceResetTarget.id}`;

        router.delete(url, {
            preserveScroll: true,
            onStart: () => setIsResettingAttendance(true),
            onSuccess: () => setAttendanceResetTarget(null),
            onFinish: () => setIsResettingAttendance(false),
        });
    };

    const handleRestartExam = () => {
        if (!restartExamTarget) return;

        const isAll = restartExamTarget === 'all';
        const url = isAll
            ? `/admin/event/${event.id}/cbt-attempts/mulai-ulang-semua`
            : `/admin/event/${event.id}/cbt-attempts/${restartExamTarget.id}/mulai-ulang`;

        router.post(
            url,
            isAll && examPackageFilter !== 'all' ? { package_id: examPackageFilter } : {},
            {
                preserveScroll: true,
                onStart: () => setIsRestartingExam(true),
                onSuccess: () => setRestartExamTarget(null),
                onFinish: () => setIsRestartingExam(false),
            }
        );
    };

    const handleCompleteExam = () => {
        if (!completeExamTarget) return;

        const isAll = completeExamTarget === 'all';
        const url = isAll
            ? `/admin/event/${event.id}/cbt-attempts/selesaikan-semua`
            : `/admin/event/${event.id}/cbt-attempts/${completeExamTarget.id}/selesaikan`;

        router.post(
            url,
            isAll && examPackageFilter !== 'all' ? { package_id: examPackageFilter } : {},
            {
                preserveScroll: true,
                onStart: () => setIsCompletingExam(true),
                onSuccess: () => setCompleteExamTarget(null),
                onFinish: () => setIsCompletingExam(false),
            }
        );
    };

    const handleDeleteExam = () => {
        if (!deleteExamTarget) return;

        const isAll = deleteExamTarget === 'all';
        const url = isAll
            ? `/admin/event/${event.id}/cbt-attempts`
            : `/admin/event/${event.id}/cbt-attempts/${deleteExamTarget.id}`;

        router.delete(url, {
            data: isAll && examPackageFilter !== 'all' ? { package_id: examPackageFilter } : {},
            preserveScroll: true,
            onStart: () => setIsDeletingExam(true),
            onSuccess: () => setDeleteExamTarget(null),
            onFinish: () => setIsDeletingExam(false),
        });
    };

    const handleGenerateAllAttendance = (e) => {
        e?.preventDefault();
        router.post(`/admin/event/${event.id}/absensi/generate`, {
            status: generateStatus,
            method: 'manual_admin',
            target_track: generateTrack,
            include_arrival: generateIncludeArrival,
            include_daily: generateIncludeDaily,
            include_sessions: generateIncludeSessions,
            day_number: generateDay,
        }, {
            preserveScroll: true,
            onStart: () => setIsGeneratingAttendance(true),
            onFinish: () => {
                setIsGeneratingAttendance(false);
                setIsGenerateAttendanceModalOpen(false);
            },
        });
    };


    const showContext = {
        event,
        modules,
        learningModules,
        linkedCbtPackages,
        availableMasterModules,
        availableMasterCbtPackages,
        availableQuestionModules,
        sessionsByDay,
        arrivalSession,
        speakers,
        rooms,
        participants,
        availableParticipants,
        attendances,
        cbtPackages,
        examRevisions,
        proctoringEvents,
        tracks,
        sessionTypes,
        legends,
        publishedMaterials,
        mandate,
        stats,
        documentNumberLabels,
        documentNumberDefaults,
        certificateSignatureSettings,
        certificateSignatureDefaults,
        registrationForms,
        integrityPacts,
        examAttempts,
        cbtCompletionMatrix,
        cbtCompletionStats,
        isPortalAdmin,
        setActiveTab,
        selectedDay,
        setSelectedDay,
        rundownTrackFilter,
        setRundownTrackFilter,
        attendanceSessionFilter,
        setAttendanceSessionFilter,
        credentialSearch,
        setCredentialSearch,
        participantSearch,
        setParticipantSearch,
        participantTrackFilter,
        setParticipantTrackFilter,
        participantCheckinFilter,
        setParticipantCheckinFilter,
        batchPrintTrack,
        setBatchPrintTrack,
        participantPerPage,
        setParticipantPerPage,
        setParticipantPage,
        ...reviewState,
        ...documentState,
        ...managementState,
        settingSections,
        daysList,
        getDayDateObj,
        getDayDateInfo,
        getDayIsoDate,
        activeDayData,
        filteredAttendances,
        totalAttendancePages,
        safeAttendancePage,
        paginatedAttendances,
        attendancePageNumbers,
        credentialParticipants,
        availableTrackOptions,
        batchPrintTrackOptions,
        filteredParticipants,
        totalParticipantPages,
        safeParticipantPage,
        paginatedParticipants,
        participantPageNumbers,
        handleAttendanceReset,
        handleRestartExam,
        handleCompleteExam,
        handleDeleteExam,
        handleGenerateAllAttendance,
    };

    return { activeTab, setActiveTab, settingSections, tabs, showContext };
}
