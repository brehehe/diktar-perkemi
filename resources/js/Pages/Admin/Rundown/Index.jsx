import React, { useState, useMemo } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Calendar,
    Clock,
    Plus,
    Edit3,
    Trash2,
    FileSpreadsheet,
    Printer,
    QrCode,
    Sparkles,
    Unlock,
    Lock,
    BookOpen,
    PlayCircle,
    Award,
    AlertCircle,
    MapPin,
    ExternalLink,
    ChevronRight,
    Layers,
    Filter,
} from 'lucide-react';
import Button from '@/Components/ui/Button';
import Modal from '@/Components/ui/Modal';
import FormField from '@/Components/ui/FormField';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import Textarea from '@/Components/ui/Textarea';
import Combobox from '@/Components/ui/Combobox';
import Checkbox from '@/Components/ui/Checkbox';
import TableSurface from '@/Components/admin/TableSurface';

import { RundownContext } from './Partials/RundownContext';
import RundownSessionsTable from './Partials/RundownSessionsTable';
import RundownDialogs from './Partials/RundownDialogs';
import { useIsProdas } from '@/Utils/isProdas';

export default function RundownIndex({
    event,
    availableEvents = [],
    selectedEventId,
    activeEventId,
    initialDay = 1,
    sessionsByDay = {},
    sessionTypes = [],
    speakers = [],
    rooms = [],
    tracks = [],
    publishedMaterials = [],
    availableMasterModules = [],
    availableMasterCbtPackages = [],
    arrivalSession,
    auth,
}) {
    const isProdas = useIsProdas();
    const currentEventId = selectedEventId || event?.id;

    // Day selection state
    const [selectedDay, setSelectedDay] = useState(initialDay || 1);
    const [rundownTrackFilter, setRundownTrackFilter] = useState('all');

    // Modals
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState(null);
    const [selectedSessionLinks, setSelectedSessionLinks] = useState(['master']);

    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
    const [reschedulingSession, setReschedulingSession] = useState(null);

    const [isGenerateAttendanceModalOpen, setIsGenerateAttendanceModalOpen] = useState(false);
    const [isGeneratingAttendance, setIsGeneratingAttendance] = useState(false);
    const [generateDay, setGenerateDay] = useState(String(initialDay || 1));
    const [generateTrack, setGenerateTrack] = useState('all');
    const [generateStatus, setGenerateStatus] = useState('present');
    const [generateIncludeArrival, setGenerateIncludeArrival] = useState(false);
    const [generateIncludeDaily, setGenerateIncludeDaily] = useState(true);
    const [generateIncludeSessions, setGenerateIncludeSessions] = useState(true);

    // Days list
    const totalDays = useMemo(() => {
        const raw = event?.total_days ?? event?.duration_days ?? event?.duration_text;
        let count = 0;
        if (typeof raw === 'number' && raw > 0) {
            count = raw;
        } else if (typeof raw === 'string') {
            const match = raw.match(/\d+/);
            if (match) count = parseInt(match[0], 10);
        }

        const sessionDayKeys = Object.keys(sessionsByDay || {})
            .map(Number)
            .filter((n) => !isNaN(n) && n > 0);
        const maxDayFromSessions = sessionDayKeys.length > 0 ? Math.max(...sessionDayKeys) : 0;

        return Math.max(count || 0, maxDayFromSessions, 1) || 4;
    }, [event, sessionsByDay]);

    const daysList = useMemo(() => {
        const count = totalDays || 4;
        return Array.from({ length: count }, (_, i) => i + 1);
    }, [totalDays]);

    const activeDayData = useMemo(() => {
        const d = sessionsByDay[selectedDay] || sessionsByDay[String(selectedDay)];
        if (d) return d;
        return {
            day_number: selectedDay,
            sessions: [],
        };
    }, [sessionsByDay, selectedDay]);

    // Forms
    const sessionForm = useForm({
        day_number: selectedDay,
        session_number: '',
        event_session_type_id: '',
        session_type_code: '',
        speaker_id: '',
        session_date: '',
        start_time: '',
        end_time: '',
        duration_jp: 2,
        topic: '',
        subtopic: '',
        method: '',
        room: '',
        target_tracks: [],
        module_code: '',
        status: 'scheduled',
        attendance_setting: 'check_in',
        learning_module_id: '',
        event_module_id: '',
        material_id: '',
        cbt_exam_package_id: '',
        requires_attendance_before_cbt: true,
    });

    const rescheduleForm = useForm({
        day_number: selectedDay,
        start_time: '',
        end_time: '',
        shift_minutes: 0,
        shift_subsequent_sessions: true,
        status: 'delayed',
        speaker_id: '',
        room: '',
    });

    const getDayIsoDate = (dayNum) => {
        if (!event?.start_date) return '';
        const base = new Date(event.start_date);
        base.setDate(base.getDate() + (dayNum - 1));
        return base.toISOString().slice(0, 10);
    };

    const getDayDateInfo = (dayNum) => {
        if (!event?.start_date) return '';
        try {
            const base = new Date(event.start_date);
            base.setDate(base.getDate() + (dayNum - 1));
            return base.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch {
            return '';
        }
    };

    const handleEventChange = (newEventId) => {
        router.get('/admin/rundown', { event_id: newEventId, day: 1 }, {
            preserveState: false,
            preserveScroll: false,
        });
    };

    const handleDayChange = (dayNum) => {
        setSelectedDay(dayNum);
        setGenerateDay(String(dayNum));
        try {
            const url = new URL(window.location.href);
            url.searchParams.set('day', dayNum);
            window.history.replaceState({}, '', url.toString());
        } catch {
            // ignore
        }
    };

    // Session Modal Handlers
    const openAddSessionModal = () => {
        setEditingSession(null);
        sessionForm.clearErrors();
        sessionForm.setData({
            day_number: selectedDay,
            session_number: `Sesi ${activeDayData.sessions.filter((s) => s.session_type_code !== 'KEHADIRAN_HARIAN').length + 1}`,
            event_session_type_id: sessionTypes[0]?.id || '',
            session_type_code: sessionTypes[0]?.code || '',
            speaker_id: '',
            session_date: getDayIsoDate(selectedDay),
            start_time: '',
            end_time: '',
            duration_jp: 2,
            topic: '',
            subtopic: '',
            method: 'Teori & Praktik',
            room: rooms[0]?.name || '',
            target_tracks: [],
            module_code: '',
            status: 'scheduled',
            attendance_setting: 'check_in',
            learning_module_id: '',
            event_module_id: '',
            material_id: '',
            cbt_exam_package_id: '',
            requires_attendance_before_cbt: true,
        });
        setSelectedSessionLinks(['master']);
        setIsSessionModalOpen(true);
    };

    const openEditSessionModal = (session) => {
        setEditingSession(session);
        sessionForm.clearErrors();

        let activeModId = session.learning_module_id || '';
        if (!activeModId && session.event_module_id) {
            activeModId = `legacy_${session.event_module_id}`;
        }

        const validSessionType = sessionTypes.find(
            (st) => String(st.id) === String(session.session_type?.id || session.event_session_type_id)
        );
        const activeSessionTypeId = validSessionType ? validSessionType.id : (sessionTypes[0]?.id || '');

        sessionForm.setData({
            day_number: session.day_number,
            session_number: session.session_number,
            event_session_type_id: activeSessionTypeId,
            session_type_code: session.session_type_code === 'KEHADIRAN_HARIAN' ? 'KEHADIRAN_HARIAN' : (session.session_type_code || ''),
            speaker_id: session.speaker?.id || '',
            session_date: session.session_date || '',
            start_time: session.start_time ? session.start_time.substring(0, 5) : '',
            end_time: session.end_time ? session.end_time.substring(0, 5) : '',
            duration_jp: session.duration_jp ?? 1,
            topic: session.topic || '',
            subtopic: session.subtopic || '',
            method: session.method || '',
            room: session.room || '',
            target_tracks: session.target_tracks || session.track_codes || [],
            module_code: session.module_code || '',
            status: session.status || 'scheduled',
            attendance_setting: session.attendance_setting || 'check_in',
            learning_module_id: activeModId,
            event_module_id: session.event_module_id || '',
            material_id: session.material_id || '',
            cbt_exam_package_id: session.cbt_exam_package_id || '',
            requires_attendance_before_cbt: session.requires_attendance_before_cbt !== undefined ? Boolean(session.requires_attendance_before_cbt) : true,
        });

        const activeLinks = [];
        if (activeModId) activeLinks.push('master');
        if (session.material_id) activeLinks.push('collection');
        setSelectedSessionLinks(activeLinks.length > 0 ? activeLinks : ['master']);

        setIsSessionModalOpen(true);
    };

    const handleSaveSession = (e) => {
        e.preventDefault();
        if (!event) return;

        const payload = {
            ...sessionForm.data,
            speaker_id: sessionForm.data.speaker_id ? parseInt(sessionForm.data.speaker_id, 10) : null,
            learning_module_id: sessionForm.data.learning_module_id ? (String(sessionForm.data.learning_module_id).startsWith('legacy_') ? sessionForm.data.learning_module_id : parseInt(sessionForm.data.learning_module_id, 10)) : null,
            material_id: sessionForm.data.material_id ? parseInt(sessionForm.data.material_id, 10) : null,
            cbt_exam_package_id: sessionForm.data.cbt_exam_package_id ? parseInt(sessionForm.data.cbt_exam_package_id, 10) : null,
            event_session_type_id: sessionForm.data.event_session_type_id ? parseInt(sessionForm.data.event_session_type_id, 10) : null,
        };

        sessionForm.transform(() => payload);

        if (editingSession) {
            sessionForm.put(`/admin/event/${event.id}/sesi/${editingSession.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSessionModalOpen(false);
                    setEditingSession(null);
                },
            });
        } else {
            sessionForm.post(`/admin/event/${event.id}/sesi`, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSessionModalOpen(false);
                    sessionForm.reset();
                },
            });
        }
    };

    const handleDeleteSession = (session) => {
        if (!event) return;
        if (confirm(`Hapus sesi "${session.topic}"? Tindakan ini tidak dapat dibatalkan.`)) {
            router.delete(`/admin/event/${event.id}/sesi/${session.id}`, {
                preserveScroll: true,
            });
        }
    };

    const handleOpenAttendance = (session) => {
        if (!event) return;
        router.post(`/admin/event/${event.id}/sesi/${session.id}/absensi/buka`, {
            attendance_setting: session.attendance_setting === 'check_in_out' ? 'check_in_out' : 'check_in',
        }, {
            preserveScroll: true,
        });
    };

    const handleCloseAttendance = (session) => {
        if (!event) return;
        router.post(`/admin/event/${event.id}/sesi/${session.id}/absensi/tutup`, {}, {
            preserveScroll: true,
        });
    };

    // Reschedule Handlers
    const openRescheduleModal = (session) => {
        setReschedulingSession(session);
        rescheduleForm.clearErrors();
        rescheduleForm.setData({
            day_number: session.day_number || selectedDay,
            start_time: session.start_time ? session.start_time.substring(0, 5) : '',
            end_time: session.end_time ? session.end_time.substring(0, 5) : '',
            shift_minutes: 0,
            shift_subsequent_sessions: true,
            status: session.status || 'scheduled',
            speaker_id: session.speaker?.id || session.speaker_id || '',
            room: session.room || '',
        });
        setIsRescheduleModalOpen(true);
    };

    const handleQuickShift = (mins) => {
        const curEnd = rescheduleForm.data.end_time;
        if (!curEnd) return;
        const [h, m] = curEnd.split(':').map(Number);
        const date = new Date();
        date.setHours(h, m + mins, 0, 0);
        const newH = String(date.getHours()).padStart(2, '0');
        const newM = String(date.getMinutes()).padStart(2, '0');
        const newEnd = `${newH}:${newM}`;

        rescheduleForm.setData((prev) => ({
            ...prev,
            end_time: newEnd,
            shift_minutes: (prev.shift_minutes || 0) + mins,
            status: 'delayed',
        }));
    };

    const handleSaveReschedule = (e) => {
        e.preventDefault();
        if (!event || !reschedulingSession) return;
        const targetDay = Number(rescheduleForm.data.day_number);
        rescheduleForm.post(`/admin/event/${event.id}/sesi/${reschedulingSession.id}/reschedule`, {
            preserveScroll: true,
            onSuccess: () => {
                if (targetDay && targetDay !== selectedDay) {
                    handleDayChange(targetDay);
                }
                setIsRescheduleModalOpen(false);
                setReschedulingSession(null);
            },
        });
    };

    // Generate All Attendance
    const handleGenerateAllAttendance = (e) => {
        e?.preventDefault();
        if (!event) return;
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

    if (!event) {
        return (
            <AdminLayout>
                <Head title="Rundown & Jadwal Event" />
                <div className="bg-white rounded-xl border border-[#DCE7F3] p-12 text-center max-w-xl mx-auto my-12">
                    <Calendar className="w-12 h-12 text-[#6B7C93] mx-auto mb-4" />
                    <h2 className="text-lg font-bold text-[#0E2747]">Tidak Ada Event Ditemukan</h2>
                    <p className="text-sm text-[#6B7C93] mt-2">
                        {isProdas
                            ? 'Belum ada data event Gashuku & UKT yang tersedia di sistem. Buat event Gashuku & UKT terlebih dahulu.'
                            : 'Belum ada data event penataran yang tersedia di sistem. Buat event penataran terlebih dahulu.'}
                    </p>
                    <div className="mt-6">
                        <Link href="/admin/event/create">
                            <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
                                Tambah Event Baru
                            </Button>
                        </Link>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    const filteredDaySessions = (activeDayData.sessions || []).filter((s) => {
        if (rundownTrackFilter === 'all') return true;
        const sTracks = s.target_tracks || s.track_codes || [];
        if (!sTracks || sTracks.length === 0 || sTracks.length >= 6) return true;
        return sTracks.includes(rundownTrackFilter);
    });

    const isCurrentEventActive = Boolean(
        event.id === activeEventId ||
        event.status === 'ongoing'
    );

    const rundownContext = {
        event,
        sessionTypes,
        speakers,
        rooms,
        tracks,
        publishedMaterials,
        availableMasterModules,
        availableMasterCbtPackages,
        selectedDay,
        rundownTrackFilter,
        setRundownTrackFilter,
        isSessionModalOpen,
        setIsSessionModalOpen,
        editingSession,
        selectedSessionLinks,
        setSelectedSessionLinks,
        isRescheduleModalOpen,
        setIsRescheduleModalOpen,
        reschedulingSession,
        setReschedulingSession,
        isGenerateAttendanceModalOpen,
        setIsGenerateAttendanceModalOpen,
        isGeneratingAttendance,
        generateDay,
        setGenerateDay,
        generateTrack,
        setGenerateTrack,
        generateStatus,
        setGenerateStatus,
        generateIncludeArrival,
        setGenerateIncludeArrival,
        generateIncludeDaily,
        setGenerateIncludeDaily,
        generateIncludeSessions,
        setGenerateIncludeSessions,
        totalDays,
        daysList,
        activeDayData,
        sessionForm,
        rescheduleForm,
        getDayIsoDate,
        getDayDateInfo,
        openEditSessionModal,
        handleSaveSession,
        handleDeleteSession,
        handleOpenAttendance,
        handleCloseAttendance,
        openRescheduleModal,
        handleQuickShift,
        handleSaveReschedule,
        handleGenerateAllAttendance,
        filteredDaySessions,
    };

    return (
        <RundownContext.Provider value={rundownContext}>
        <AdminLayout>
            <Head title={`Rundown & Jadwal — ${event.title || event.name || 'Event'}`} />

            <div className="space-y-6">
                {/* 1. Header & Event Filter Card */}
                <div className="bg-white rounded-xl border border-[#DCE7F3] p-5 shadow-xs">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EAF5FF] text-[#0A3F82] border border-[#BCE0FD]">
                                    <Clock className="w-3 h-3 text-[#0B63CE]" />
                                    <span>Manajemen Rundown Terpusat</span>
                                </span>
                                {isCurrentEventActive && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Event Aktif
                                    </span>
                                )}
                            </div>
                            <h1 className="font-display font-bold text-xl sm:text-2xl text-[#0E2747]">
                                Rundown & Jadwal Penataran
                            </h1>
                            <p className="text-xs text-[#6B7C93]">
                                Kelola susunan jadwal sesi harian, absensi QR kenshi, dan penanganan pemateri molor untuk setiap event.
                            </p>
                        </div>

                        {/* Event Selector Control */}
                        <div className="w-full lg:w-96 bg-[#F8FBFF] p-3 rounded-xl border border-[#DCE7F3] space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <label htmlFor="event-filter-select" className="font-bold text-[#0E2747] flex items-center gap-1.5">
                                    <Filter className="w-3.5 h-3.5 text-[#0B63CE]" />
                                    <span>{isProdas ? 'Pilih Event Gashuku & UKT:' : 'Pilih Event Penataran:'}</span>
                                </label>
                                <span className="text-[11px] text-[#6B7C93]">{availableEvents.length} Event</span>
                            </div>
                            <select
                                id="event-filter-select"
                                value={currentEventId}
                                onChange={(e) => handleEventChange(e.target.value)}
                                className="w-full text-xs font-semibold border border-[#DCE7F3] rounded-lg px-3 py-2 bg-white text-[#112743] focus:outline-none focus:ring-2 focus:ring-[#0B63CE] shadow-2xs"
                            >
                                {availableEvents.map((ev) => (
                                    <option key={ev.id} value={ev.id}>
                                        {ev.is_active ? '⭐ [AKTIF] ' : ''}
                                        {ev.title || ev.name} ({ev.start_date || '-'})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Event Metadata Banner */}
                    <div className="mt-4 pt-4 border-t border-[#DCE7F3]/70 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-4 text-[#6B7C93]">
                            <span className="font-bold text-[#0E2747] text-sm">
                                {event.title || event.name}
                            </span>
                            <span className="text-[#DCE7F3]">|</span>
                            <span className="flex items-center gap-1 text-[#112743]">
                                <Calendar className="w-3.5 h-3.5 text-[#0B63CE]" />
                                <span>{getDayDateInfo(1)} s.d. {getDayDateInfo(totalDays)} ({totalDays} Hari)</span>
                            </span>
                            {event.location && (
                                <>
                                    <span className="text-[#DCE7F3]">|</span>
                                    <span className="flex items-center gap-1 text-[#112743]">
                                        <MapPin className="w-3.5 h-3.5 text-[#EE9B25]" />
                                        <span>{event.location}</span>
                                    </span>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Link
                                href={`/admin/event/${event.id}?tab=rundown`}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B63CE] hover:underline"
                            >
                                <span>Detail Event Tab Rundown</span>
                                <ExternalLink className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 2A. Day Selector Navigation Bar */}
                <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#DCE7F3] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                        <span className="text-xs font-bold text-[#0E2747] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-[#0B63CE]" />
                            Pilih Hari:
                        </span>
                        {daysList.map((day) => {
                            const dateInfo = getDayDateInfo(day);
                            const daySessions = sessionsByDay[day]?.sessions || sessionsByDay[String(day)]?.sessions || [];
                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => handleDayChange(day)}
                                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                                        selectedDay === day
                                            ? 'bg-[#0E2747] text-white shadow-xs ring-2 ring-[#0E2747]/20'
                                            : 'bg-[#F8FBFF] text-[#475569] hover:text-[#0E2747] hover:bg-[#EAF5FF] border border-[#DCE7F3]'
                                    }`}
                                >
                                    <div className="flex flex-col items-start text-left">
                                        <div className="flex items-center gap-1.5">
                                            <span>Hari ke-{day}</span>
                                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                                selectedDay === day ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                                            }`}>
                                                {daySessions.length} Sesi
                                            </span>
                                        </div>
                                        {dateInfo && (
                                            <span className={`text-[10px] font-normal ${selectedDay === day ? 'text-white/80' : 'text-[#8A9FB4]'}`}>
                                                {dateInfo}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={selectedDay <= 1}
                            onClick={() => handleDayChange(selectedDay - 1)}
                            className="text-xs font-semibold"
                        >
                            ← Hari Sebelumnya
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={selectedDay >= daysList.length}
                            onClick={() => handleDayChange(selectedDay + 1)}
                            className="text-xs font-semibold"
                        >
                            Hari Berikutnya →
                        </Button>
                    </div>
                </div>

                {/* 2B. Actions Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-[#DCE7F3] shadow-xs">
                    <div className="flex flex-wrap items-center gap-2">
                        <a
                            href={`/admin/event/${event.id}/rundown/export-excel`}
                            download
                            className="inline-block"
                        >
                            <Button
                                variant="secondary"
                                icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
                            >
                                Export Excel
                            </Button>
                        </a>
                        <a
                            href={`/admin/event/${event.id}/rundown/cetak`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block"
                        >
                            <Button
                                variant="secondary"
                                icon={<Printer className="w-4 h-4 text-[#0A3F82]" />}
                            >
                                Cetak Rundown
                            </Button>
                        </a>
                        <a
                            href={`/admin/event/${event.id}/absensi/cetak-semua-qr`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block"
                        >
                            <Button
                                variant="secondary"
                                icon={<Printer className="w-4 h-4 text-[#0B63CE]" />}
                            >
                                Cetak Semua QR
                            </Button>
                        </a>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="secondary"
                            icon={<Sparkles className="w-4 h-4 text-emerald-600" />}
                            onClick={() => {
                                setGenerateDay(String(selectedDay));
                                setIsGenerateAttendanceModalOpen(true);
                            }}
                        >
                            Set Hadir Semua (Hari {selectedDay})
                        </Button>
                        {!activeDayData.sessions.some((session) => session.session_type_code === 'KEHADIRAN_HARIAN') && (
                            <Button
                                variant="secondary"
                                icon={<QrCode className="w-4 h-4" />}
                                onClick={() => {
                                    setEditingSession(null);
                                    sessionForm.clearErrors();
                                    sessionForm.setData({
                                        day_number: selectedDay,
                                        session_number: `Harian ${selectedDay}`,
                                        event_session_type_id: '',
                                        session_type_code: 'KEHADIRAN_HARIAN',
                                        speaker_id: '',
                                        session_date: getDayIsoDate(selectedDay),
                                        start_time: '00:00',
                                        end_time: '23:59',
                                        duration_jp: 0,
                                        topic: `Kehadiran hari ke-${selectedDay}`,
                                        subtopic: '',
                                        method: '',
                                        room: '',
                                        target_tracks: [],
                                        module_code: '',
                                        status: 'scheduled',
                                        attendance_setting: 'check_in',
                                        learning_module_id: '',
                                        event_module_id: '',
                                        material_id: '',
                                        cbt_exam_package_id: '',
                                        requires_attendance_before_cbt: false,
                                    });
                                    setIsSessionModalOpen(true);
                                }}
                            >
                                Atur QR Harian
                            </Button>
                        )}
                        <Button
                            variant="primary"
                            icon={<Plus className="w-4 h-4" />}
                            onClick={openAddSessionModal}
                        >
                            Tambah Sesi Hari {selectedDay}
                        </Button>
                    </div>
                </div>

                <RundownSessionsTable />
            </div>

            <RundownDialogs />
        </AdminLayout>
        </RundownContext.Provider>
    );
}
