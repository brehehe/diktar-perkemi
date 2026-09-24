import React, { useState, useMemo } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
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
                        Belum ada data event penataran yang tersedia di sistem. Buat event penataran terlebih dahulu.
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

    return (
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
                                    <span>Pilih Event Penataran:</span>
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

                {/* 3. Sessions Table */}
                <div className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#DCE7F3] bg-[#F8FBFF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h3 className="font-display font-bold text-sm text-[#0E2747]">
                                Jadwal & Rundown Hari {selectedDay}
                            </h3>
                            <span className="text-xs font-medium text-[#6B7C93]">
                                Total Sesi: {activeDayData.sessions.length} • Total JP:{' '}
                                <strong className="text-[#0B63CE]">
                                    {activeDayData.sessions.reduce((acc, s) => acc + (s.duration_jp || 0), 0)} JP
                                </strong>
                                {rundownTrackFilter !== 'all' && (
                                    <span className="ml-2 text-amber-700 font-medium">
                                        (Menampilkan {filteredDaySessions.length} sesi untuk jalur {rundownTrackFilter})
                                    </span>
                                )}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#0E2747] whitespace-nowrap">Filter Jalur Peserta:</span>
                            <select
                                value={rundownTrackFilter}
                                onChange={(e) => setRundownTrackFilter(e.target.value)}
                                className="text-xs font-medium border border-[#DCE7F3] rounded-lg px-2.5 py-1.5 bg-white text-[#112743] focus:outline-none focus:ring-1 focus:ring-[#0B63CE]"
                            >
                                <option value="all">Semua Jalur (Tampilkan Semua)</option>
                                {tracks.map((t) => (
                                    <option key={t.id || t.code} value={t.code}>
                                        {t.code} — {t.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <TableSurface className="shadow-none">
                        <table className="min-w-[1050px] w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-[#DCE7F3] bg-slate-50 text-[#0E2747] font-semibold text-[11px] uppercase tracking-wider">
                                    <th className="px-4 py-3">Waktu & Sesi</th>
                                    <th className="px-4 py-3">Jenis Sesi & Jalur</th>
                                    <th className="px-4 py-3">Topik & Integrasi</th>
                                    <th className="px-4 py-3">Pemateri / Pengawas</th>
                                    <th className="px-4 py-3">Ruang</th>
                                    <th className="px-4 py-3">Status Absensi</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#DCE7F3]/60">
                                {filteredDaySessions.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-10 text-xs text-[#6B7C93]">
                                            {rundownTrackFilter !== 'all'
                                                ? `Tidak ada sesi rundown untuk jalur ${rundownTrackFilter} pada Hari ${selectedDay}.`
                                                : `Belum ada jadwal sesi untuk Hari ${selectedDay}. Klik tombol di atas untuk menambahkan.`}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDaySessions.map((s) => (
                                        <tr key={s.id} className="hover:bg-[#F8FBFF] transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="font-mono font-bold text-[#0B63CE]">{s.time_slot}</div>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-[11px] text-[#6B7C93]">{s.session_number} ({s.duration_jp} JP)</span>
                                                    {s.status === 'delayed' && (
                                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                                            Molor
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex flex-wrap items-center gap-1">
                                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${s.session_type?.badge_color || 'bg-slate-100 text-slate-700'}`}>
                                                        {s.session_type?.name || 'Sesi'}
                                                    </span>
                                                    {(() => {
                                                        const sTracks = s.target_tracks || s.track_codes || [];
                                                        if (!sTracks || sTracks.length === 0 || sTracks.length >= 6) {
                                                            return (
                                                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                                                                    Semua Jalur
                                                                </span>
                                                            );
                                                        }
                                                        return sTracks.map((tc) => (
                                                            <span
                                                                key={tc}
                                                                className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200"
                                                            >
                                                                {tc}
                                                            </span>
                                                        ));
                                                    })()}
                                                </div>
                                                <div className="text-[10px] text-[#6B7C93] mt-0.5">{s.method}</div>
                                            </td>
                                            <td className="px-4 py-3 min-w-[220px]">
                                                <div className="font-semibold text-[#0E2747]">{s.topic}</div>
                                                {s.subtopic && <div className="text-[11px] text-[#6B7C93] mt-0.5 line-clamp-1">{s.subtopic}</div>}

                                                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                                    {s.material_title && (
                                                        <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                                                            <BookOpen className="w-3 h-3" />
                                                            <span>Buku: {s.material_title}</span>
                                                        </span>
                                                    )}
                                                    {s.event_module_title && <span className="inline-flex items-center bg-[#EAF5FF] px-2 py-0.5 text-[10px] font-medium text-[#0A3F82]">Modul: {s.event_module_title}</span>}
                                                    {s.cbt_package_title && (
                                                        <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-purple-50 text-purple-800 px-2 py-0.5 rounded border border-purple-200">
                                                            <PlayCircle className="w-3 h-3" />
                                                            <span>CBT: {s.cbt_package_code}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {s.speaker ? (
                                                    <div>
                                                        <div className="font-medium text-[#112743]">{s.speaker.name}</div>
                                                        <div className="text-[10px] text-[#6B7C93]">{s.speaker.role_info}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-[#6B7C93] italic">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap font-medium text-[#112743]">
                                                {s.room || '-'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="space-y-1.5">
                                                    {s.is_attendance_open ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                                <Unlock className="w-3 h-3" />
                                                                <span>Dibuka ({s.qr_short_code})</span>
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCloseAttendance(s)}
                                                                className="text-[10px] text-rose-600 hover:underline font-semibold"
                                                            >
                                                                Tutup
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                                                                <Lock className="w-3 h-3" />
                                                                <span>Tutup</span>
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenAttendance(s)}
                                                                className="text-[10px] text-[#0B63CE] hover:underline font-bold"
                                                            >
                                                                Buka
                                                            </button>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1.5">
                                                        {s.attendance_setting === 'check_in_out' ? (
                                                            <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                                                Masuk & Keluar
                                                            </span>
                                                        ) : s.attendance_setting === 'check_in' ? (
                                                            <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                                                Masuk Saja
                                                            </span>
                                                        ) : (
                                                            <span className="px-1.5 py-0.2 rounded text-[9px] font-normal bg-slate-100 text-slate-500 border border-slate-200">
                                                                Tidak Diperlukan
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-[#6B7C93] flex items-center gap-2">
                                                        <span>Hadir: <strong>{s.attendances_count}</strong></span>
                                                        {s.is_attendance_open && (
                                                            <>
                                                                <span>•</span>
                                                                <a
                                                                    href={`/admin/event/${event.id}/sesi/${s.id}/cetak-qr`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1 font-bold text-xs text-[#0B63CE] bg-[#EAF5FF] hover:bg-[#D5EBFF] border border-[#B8D7FF] px-2 py-0.5 rounded transition-colors shadow-2xs"
                                                                    title="Cetak lembar QR absensi sesi ini"
                                                                >
                                                                    <QrCode className="w-3.5 h-3.5" />
                                                                    <span>Cetak QR</span>
                                                                </a>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {s.is_attendance_open && (
                                                        <a
                                                            href={`/admin/event/${event.id}/sesi/${s.id}/cetak-qr`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 text-[#0B63CE] hover:bg-[#EAF5FF] rounded transition-colors border border-transparent hover:border-[#B8D7FF]"
                                                            title={`Cetak QR Code Sesi ${s.session_number || s.id}`}
                                                            aria-label={`Cetak QR Code sesi ${s.topic}`}
                                                        >
                                                            <QrCode className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => openRescheduleModal(s)}
                                                        className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded transition-colors border border-transparent hover:border-amber-200"
                                                        title="Sesuaikan Jadwal & Pindah Sesi (Hari / Jam)"
                                                        aria-label={`Sesuaikan jadwal sesi ${s.topic}`}
                                                    >
                                                        <Clock className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditSessionModal(s)}
                                                        className="p-1.5 text-[#6B7C93] hover:text-[#0B63CE] hover:bg-slate-100 rounded transition-colors"
                                                        title="Edit Detail Sesi Lengkap"
                                                        aria-label={`Edit sesi ${s.topic}`}
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteSession(s)}
                                                        className="p-1.5 text-[#6B7C93] hover:text-[#DD4D7C] hover:bg-rose-50 rounded transition-colors"
                                                        title="Hapus Sesi"
                                                        aria-label={`Hapus sesi ${s.topic}`}
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
                </div>
            </div>

            {/* MODAL 1: Tambah / Edit Sesi Rundown */}
            <Modal
                isOpen={isSessionModalOpen}
                onClose={() => setIsSessionModalOpen(false)}
                title={editingSession ? 'Edit Sesi Rundown' : `Tambah Sesi Rundown (Hari ${selectedDay})`}
                size="2xl"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsSessionModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" form="session-form" variant="primary" loading={sessionForm.processing}>
                            Simpan Sesi
                        </Button>
                    </>
                }
            >
                <form id="session-form" onSubmit={handleSaveSession} className="space-y-4">
                    {Object.keys(sessionForm.errors).length > 0 && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                            <div className="space-y-1">
                                <p className="font-bold text-rose-900">Periksa kembali data sesi yang diinput:</p>
                                <ul className="list-disc list-inside space-y-0.5 text-rose-700">
                                    {Object.entries(sessionForm.errors).map(([field, msg]) => (
                                        <li key={field}>{msg}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <FormField label="Hari ke-" required error={sessionForm.errors.day_number}>
                            <Select
                                value={sessionForm.data.day_number}
                                onChange={(e) => {
                                    const newDay = parseInt(e.target.value) || 1;
                                    sessionForm.setData((prev) => ({
                                        ...prev,
                                        day_number: newDay,
                                        session_date: getDayIsoDate(newDay),
                                    }));
                                }}
                            >
                                {daysList.map((day) => {
                                    const dateInfo = getDayDateInfo(day);
                                    return (
                                        <option key={day} value={day}>
                                            Hari {day} {dateInfo ? `(${dateInfo})` : ''}
                                        </option>
                                    );
                                })}
                            </Select>
                        </FormField>

                        <FormField label="Nomor Sesi" required error={sessionForm.errors.session_number}>
                            <Input
                                value={sessionForm.data.session_number}
                                onChange={(e) => sessionForm.setData('session_number', e.target.value)}
                                placeholder="Sesi 1"
                                required
                            />
                        </FormField>

                        <FormField label="Durasi (JP)" required error={sessionForm.errors.duration_jp}>
                            <Input
                                type="number"
                                min={sessionForm.data.session_type_code === 'KEHADIRAN_HARIAN' ? '0' : '1'}
                                value={sessionForm.data.duration_jp}
                                onChange={(e) => sessionForm.setData('duration_jp', Number(e.target.value))}
                                disabled={sessionForm.data.session_type_code === 'KEHADIRAN_HARIAN'}
                                required
                            />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Waktu Mulai" required error={sessionForm.errors.start_time}>
                            <Input
                                type="time"
                                value={sessionForm.data.start_time}
                                onChange={(e) => sessionForm.setData('start_time', e.target.value)}
                                required
                            />
                        </FormField>

                        <FormField label="Waktu Selesai" required error={sessionForm.errors.end_time}>
                            <Input
                                type="time"
                                value={sessionForm.data.end_time}
                                onChange={(e) => sessionForm.setData('end_time', e.target.value)}
                                required
                            />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Jenis Sesi" required error={sessionForm.errors.event_session_type_id || sessionForm.errors.session_type_code}>
                            <Select
                                value={sessionForm.data.session_type_code === 'KEHADIRAN_HARIAN' ? 'daily' : sessionForm.data.event_session_type_id}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === 'daily') {
                                        sessionForm.setData((current) => ({
                                            ...current,
                                            event_session_type_id: '',
                                            session_type_code: 'KEHADIRAN_HARIAN',
                                            duration_jp: 0,
                                            attendance_setting: 'check_in',
                                            learning_module_id: '',
                                            event_module_id: '',
                                            material_id: '',
                                            cbt_exam_package_id: '',
                                        }));
                                    } else {
                                        const st = sessionTypes.find((item) => String(item.id) === String(val));
                                        const isCbt = st?.code === 'UJIAN' || st?.code === 'CBT' || st?.name?.toLowerCase().includes('ujian') || st?.name?.toLowerCase().includes('cbt');
                                        sessionForm.setData((current) => ({
                                            ...current,
                                            event_session_type_id: val,
                                            session_type_code: st?.code || '',
                                            duration_jp: current.duration_jp === 0 ? 1 : (current.duration_jp || 1),
                                            attendance_setting: current.attendance_setting || 'check_in',
                                            learning_module_id: isCbt ? '' : current.learning_module_id,
                                            event_module_id: isCbt ? '' : current.event_module_id,
                                            material_id: isCbt ? '' : current.material_id,
                                            cbt_exam_package_id: isCbt ? current.cbt_exam_package_id : '',
                                            requires_attendance_before_cbt: isCbt ? true : current.requires_attendance_before_cbt,
                                        }));
                                    }
                                }}
                            >
                                <option value="daily">Kehadiran Harian (QR awal hari)</option>
                                {sessionTypes.map((st) => (
                                    <option key={st.id} value={st.id}>
                                        {st.name}
                                    </option>
                                ))}
                            </Select>
                        </FormField>

                        <FormField label="Pengaturan Absensi" error={sessionForm.errors.attendance_setting}>
                            <Select
                                value={sessionForm.data.attendance_setting}
                                onChange={(e) => sessionForm.setData('attendance_setting', e.target.value)}
                            >
                                <option value="check_in">Absensi Masuk Saja</option>
                                <option value="check_in_out">Absensi Masuk & Keluar</option>
                                <option value="none">Tidak Diperlukan</option>
                            </Select>
                            <p className="mt-1 text-xs text-[#6B7C93]">Sesi yang memuat materi atau ujian wajib memakai absensi masuk.</p>
                        </FormField>
                    </div>

                    <FormField label="Topik / Judul Materi Sesi" required error={sessionForm.errors.topic}>
                        <Input
                            value={sessionForm.data.topic}
                            onChange={(e) => sessionForm.setData('topic', e.target.value)}
                            placeholder="Contoh: Falsafah Shorinji Kempo & Penyeragaman Goho"
                            required
                        />
                    </FormField>

                    {/* Conditional Relations */}
                    {(() => {
                        const selectedSessionType = sessionTypes.find((st) => String(st.id) === String(sessionForm.data.event_session_type_id));
                        const stCode = selectedSessionType?.code || '';
                        const stName = selectedSessionType?.name?.toLowerCase() || '';

                        const isMateriType = stCode === 'MATERI' || stCode.startsWith('PAR_') || stName.includes('materi') || stName.includes('paralel') || stName.includes('teori');
                        const isCbtType = stCode === 'UJIAN' || stCode === 'CBT' || stName.includes('ujian') || stName.includes('cbt');
                        const isIstirahatType = stCode === 'ISTIRAHAT' || stName.includes('istirahat') || stName.includes('ishoma');

                        const activeSelectedLearningModule = availableMasterModules.find((lm) => String(lm.id) === String(sessionForm.data.learning_module_id));

                        if (sessionForm.data.session_type_code === 'KEHADIRAN_HARIAN') {
                            return <p className="border border-[#DCE7F3] bg-[#EAF5FF] p-3 text-sm text-[#112743]">QR ini mencatat kehadiran awal hari. Peserta harus memindainya sebelum dapat absen ke sesi lain pada tanggal yang sama.</p>;
                        }

                        if (isIstirahatType) {
                            return (
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#6B7C93]">
                                    Sesi Istirahat & Ishoma tidak memerlukan keterhubungan dengan Modul Pembelajaran maupun Paket CBT.
                                </div>
                            );
                        }

                        if (isCbtType) {
                            return (
                                <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Award className="w-4 h-4 text-purple-700" />
                                        <span className="font-bold text-xs text-[#0E2747]">Konfigurasi Sesi Ujian CBT</span>
                                    </div>
                                    <Combobox
                                        label="Pilih Paket Ujian CBT (Status Siap Digunakan / Dibuka)"
                                        value={sessionForm.data.cbt_exam_package_id}
                                        onChange={(value) => sessionForm.setData('cbt_exam_package_id', value)}
                                        options={availableMasterCbtPackages.map((pkg) => ({ value: pkg.id, label: `[${pkg.code}] ${pkg.title} (${pkg.exam_type_label || pkg.exam_type} - ${pkg.duration_minutes}m - ${pkg.status})` }))}
                                        placeholder="Pilih paket CBT tersedia"
                                        searchPlaceholder="Cari kode atau nama paket CBT…"
                                        error={sessionForm.errors.cbt_exam_package_id}
                                        required
                                    />

                                    <Checkbox
                                        checked={Boolean(sessionForm.data.requires_attendance_before_cbt)}
                                        onChange={(e) => sessionForm.setData('requires_attendance_before_cbt', e.target.checked)}
                                        label="Wajibkan absensi masuk sesi sebelum peserta dapat memulai ujian CBT"
                                        helperText="Peserta harus tercatat hadir (scan QR / manual override) pada sesi ini sebelum tombol ujian dapat dibuka."
                                        className="min-h-11 rounded-lg border border-[#DCE7F3] bg-white p-3"
                                    />
                                </div>
                            );
                        }

                        // Materi or Praktik or Pleno
                        return (
                            <div className="space-y-3 p-4 bg-[#F8FBFF] border border-[#DCE7F3] rounded-xl">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-[#0B63CE]" />
                                        <span className="font-bold text-xs text-[#0E2747]">
                                            {isMateriType ? 'Keterhubungan Modul Pembelajaran (Wajib)' : 'Keterhubungan Modul & Materi (Opsional)'}
                                        </span>
                                    </div>
                                    {isMateriType && (
                                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                            Wajib Memilih Modul
                                        </span>
                                    )}
                                </div>

                                <fieldset className="grid gap-2 sm:grid-cols-2">
                                    <legend className="mb-2 text-sm font-semibold text-[#112743]">Pilih jenis keterhubungan</legend>
                                    {[
                                        { value: 'master', label: 'Modul pembelajaran', helperText: 'Kurikulum Diktar & modul event ini' },
                                        { value: 'collection', label: 'Koleksi digital', helperText: 'E-book, video & pustaka PERKEMI' },
                                    ].map((link) => {
                                        const checked = selectedSessionLinks.includes(link.value) || (link.value === 'master' && isMateriType);
                                        return (
                                            <Checkbox
                                                key={link.value}
                                                checked={checked}
                                                disabled={link.value === 'master' && isMateriType}
                                                onChange={(change) => {
                                                    setSelectedSessionLinks((current) => change.target.checked ? [...current, link.value] : current.filter((value) => value !== link.value));
                                                    if (!change.target.checked) {
                                                        sessionForm.setData(link.value === 'master' ? 'learning_module_id' : 'material_id', '');
                                                        if (link.value === 'master') {
                                                            sessionForm.setData('event_module_id', '');
                                                        }
                                                    }
                                                }}
                                                label={link.label}
                                                helperText={link.helperText}
                                                className={`min-h-11 rounded-lg border px-3 py-2 ${checked ? 'border-[#0B63CE] bg-[#EAF5FF]' : 'border-[#DCE7F3] bg-white'}`}
                                            />
                                        );
                                    })}
                                </fieldset>

                                {(selectedSessionLinks.includes('master') || isMateriType) && (
                                    <Combobox
                                        label="Pilih Modul Pembelajaran"
                                        value={sessionForm.data.learning_module_id || ''}
                                        required={isMateriType}
                                        onChange={(modId) => {
                                            const mod = availableMasterModules.find((m) => String(m.id) === String(modId));
                                            sessionForm.setData((prev) => ({
                                                ...prev,
                                                learning_module_id: modId,
                                                topic: prev.topic ? prev.topic : (mod ? mod.title : ''),
                                            }));
                                        }}
                                        options={availableMasterModules.map((module) => ({
                                            value: module.id,
                                            label: `[${module.scope_label || (module.is_master ? 'Master Diktar' : 'Khusus Event')}] [${module.code}] ${module.title} (${module.total_jp} JP - ${module.category || 'Materi'})`
                                        }))}
                                        placeholder="Pilih modul pembelajaran"
                                        searchPlaceholder="Cari kode, nama modul, atau ketik Master / Khusus Event…"
                                        error={sessionForm.errors.learning_module_id}
                                    />
                                )}

                                {selectedSessionLinks.includes('collection') && activeSelectedLearningModule && (
                                    <div className="p-3 rounded-lg bg-white border border-[#DCE7F3] space-y-2">
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="font-semibold text-[#0E2747]">Koleksi Digital dalam Modul Ini:</span>
                                            <span className="text-[#6B7C93]">{activeSelectedLearningModule.materials?.length || 0} Terhubung</span>
                                        </div>

                                        <FormField label="Pilih Materi Koleksi Digital Utama Sesi (Opsional)" error={sessionForm.errors.material_id}>
                                            <Select
                                                value={sessionForm.data.material_id || ''}
                                                onChange={(e) => sessionForm.setData('material_id', e.target.value)}
                                            >
                                                <option value="">-- Buka Seluruh Materi Modul Pembelajaran --</option>
                                                {activeSelectedLearningModule.materials?.map((mat) => (
                                                    <option key={mat.id} value={mat.id}>
                                                        [{mat.type === 'video' ? 'VIDEO' : mat.type === 'book' ? 'E-BOOK' : 'DOKUMEN'}] {mat.title}
                                                    </option>
                                                ))}
                                                {publishedMaterials
                                                    .filter((pm) => !activeSelectedLearningModule.materials?.some((m) => m.id === pm.id))
                                                    .map((mat) => (
                                                        <option key={mat.id} value={mat.id}>
                                                            [Koleksi Luar: {mat.type?.toUpperCase()}] {mat.title}
                                                        </option>
                                                    ))}
                                            </Select>
                                        </FormField>
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Pemateri / Instruktur" error={sessionForm.errors.speaker_id}>
                            <Select
                                value={sessionForm.data.speaker_id}
                                onChange={(e) => sessionForm.setData('speaker_id', e.target.value)}
                            >
                                <option value="">-- Pilih Pemateri --</option>
                                {speakers.map((sp) => (
                                    <option key={sp.id} value={sp.id}>
                                        {sp.name} ({sp.type_label})
                                    </option>
                                ))}
                            </Select>
                        </FormField>

                        <FormField label="Ruangan / Lokasi" error={sessionForm.errors.room}>
                            <Input
                                list="rundown-room-options"
                                value={sessionForm.data.room}
                                onChange={(e) => sessionForm.setData('room', e.target.value)}
                                placeholder="Contoh: Dojo Utama"
                            />
                            <datalist id="rundown-room-options">
                                {rooms.map((room) => <option key={room.id} value={room.name} />)}
                            </datalist>
                        </FormField>
                    </div>

                    <FormField label="Jalur Peserta yang Mengikuti Sesi" error={sessionForm.errors.target_tracks}>
                        <div className="space-y-2 p-3.5 bg-slate-50 border border-[#DCE7F3] rounded-xl">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-[#6B7C93]">Pilih jalur peserta yang diwajibkan mengikuti sesi ini:</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => sessionForm.setData('target_tracks', tracks.map((t) => t.code))}
                                        className="text-[#0B63CE] hover:underline font-semibold text-[11px]"
                                    >
                                        Pilih Semua Jalur
                                    </button>
                                    <span className="text-[#DCE7F3]">•</span>
                                    <button
                                        type="button"
                                        onClick={() => sessionForm.setData('target_tracks', [])}
                                        className="text-[#6B7C93] hover:underline text-[11px]"
                                    >
                                        Kosongkan
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                                {tracks.map((t) => {
                                    const selectedTracks = sessionForm.data.target_tracks || [];
                                    const isChecked = selectedTracks.includes(t.code);
                                    return (
                                        <label
                                            key={t.id || t.code}
                                            className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                                                isChecked
                                                    ? 'bg-[#EAF5FF] border-[#0B63CE] text-[#0A3F82] font-semibold'
                                                    : 'bg-white border-[#DCE7F3] text-slate-700 hover:bg-slate-50'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={(e) => {
                                                    const cur = sessionForm.data.target_tracks || [];
                                                    if (e.target.checked) {
                                                        sessionForm.setData('target_tracks', [...cur, t.code]);
                                                    } else {
                                                        sessionForm.setData('target_tracks', cur.filter((c) => c !== t.code));
                                                    }
                                                }}
                                                className="rounded border-[#DCE7F3] text-[#0B63CE] focus:ring-[#0B63CE] w-3.5 h-3.5"
                                            />
                                            <span>{t.code} · {t.name}</span>
                                        </label>
                                    );
                                })}
                            </div>
                            <p className="text-[11px] text-[#6B7C93]">
                                Jika semua jalur dipilih atau dikosongkan, sesi akan berlaku untuk seluruh peserta (Pleno/Umum).
                            </p>
                        </div>
                    </FormField>
                </form>
            </Modal>

            {/* MODAL 2: Sesuaikan Jadwal / Penanganan Molor */}
            <Modal
                isOpen={isRescheduleModalOpen}
                onClose={() => {
                    setIsRescheduleModalOpen(false);
                    setReschedulingSession(null);
                }}
                title={reschedulingSession ? `Sesuaikan Jadwal & Pindah Sesi (${reschedulingSession.session_number})` : 'Sesuaikan Jadwal & Pindah Sesi'}
                size="md"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setIsRescheduleModalOpen(false);
                                setReschedulingSession(null);
                            }}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            form="reschedule-session-form"
                            variant="primary"
                            loading={rescheduleForm.processing}
                        >
                            Simpan Perubahan Jadwal
                        </Button>
                    </>
                }
            >
                {reschedulingSession && (
                    <form id="reschedule-session-form" onSubmit={handleSaveReschedule} className="space-y-4">
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1">
                            <div className="font-bold text-amber-900 flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-amber-700" />
                                <span>Penyesuaian Jadwal & Pemindahan Sesi</span>
                            </div>
                            <p className="text-amber-800">
                                Sesi: <strong>{reschedulingSession.topic}</strong> (Hari ke-{reschedulingSession.day_number})
                            </p>
                        </div>

                        {/* Pindah ke Hari */}
                        <FormField label="Pindah ke Hari (Jadwal Hari)" error={rescheduleForm.errors.day_number}>
                            <Select
                                value={rescheduleForm.data.day_number}
                                onChange={(e) => rescheduleForm.setData('day_number', Number(e.target.value))}
                            >
                                {daysList.map((d) => (
                                    <option key={d} value={d}>
                                        Hari ke-{d} {getDayDateInfo(d) ? `(${getDayDateInfo(d)})` : ''}
                                    </option>
                                ))}
                            </Select>
                        </FormField>

                        {/* Quick Add Delay Buttons */}
                        <div>
                            <label className="block text-xs font-semibold text-[#112743] mb-1.5">
                                Tambah Waktu Keterlambatan (Molor):
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {[15, 30, 45, 60].map((mins) => (
                                    <button
                                        key={mins}
                                        type="button"
                                        onClick={() => handleQuickShift(mins)}
                                        className="py-1.5 px-2 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs text-center transition-colors shadow-2xs"
                                    >
                                        +{mins} menit
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <FormField label="Waktu Mulai" required error={rescheduleForm.errors.start_time}>
                                <Input
                                    type="time"
                                    value={rescheduleForm.data.start_time}
                                    onChange={(e) => rescheduleForm.setData('start_time', e.target.value)}
                                    required
                                />
                            </FormField>
                            <FormField label="Waktu Selesai" required error={rescheduleForm.errors.end_time}>
                                <Input
                                    type="time"
                                    value={rescheduleForm.data.end_time}
                                    onChange={(e) => rescheduleForm.setData('end_time', e.target.value)}
                                    required
                                />
                            </FormField>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <FormField label="Status Sesi" required error={rescheduleForm.errors.status}>
                                <Select
                                    value={rescheduleForm.data.status}
                                    onChange={(e) => rescheduleForm.setData('status', e.target.value)}
                                >
                                    <option value="scheduled">Terjadwal</option>
                                    <option value="ongoing">Sedang Berlangsung</option>
                                    <option value="delayed">Molor / Mundur</option>
                                    <option value="completed">Selesai</option>
                                    <option value="cancelled">Dibatalkan</option>
                                </Select>
                            </FormField>

                            <FormField label="Ruangan / Dojo" error={rescheduleForm.errors.room}>
                                <Input
                                    value={rescheduleForm.data.room}
                                    onChange={(e) => rescheduleForm.setData('room', e.target.value)}
                                    placeholder="Contoh: Dojo Utama"
                                />
                            </FormField>
                        </div>

                        <FormField label="Pemateri Pengampu" error={rescheduleForm.errors.speaker_id}>
                            <Select
                                value={rescheduleForm.data.speaker_id}
                                onChange={(e) => rescheduleForm.setData('speaker_id', e.target.value)}
                            >
                                <option value="">-- Tetap / Pilih Pemateri --</option>
                                {speakers.map((sp) => (
                                    <option key={sp.id} value={sp.id}>
                                        {sp.name} ({sp.type_label})
                                    </option>
                                ))}
                            </Select>
                        </FormField>

                        <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg">
                            <label className="flex items-start gap-2.5 text-xs text-sky-950 font-medium cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rescheduleForm.data.shift_subsequent_sessions}
                                    onChange={(e) => rescheduleForm.setData('shift_subsequent_sessions', e.target.checked)}
                                    className="mt-0.5 rounded border-sky-300 text-[#0B63CE] focus:ring-[#0B63CE]"
                                />
                                <span>
                                    <strong>Mundurkan otomatis sesi-sesi berikutnya</strong> pada Hari {reschedulingSession.day_number} sebanyak selisih waktu keterlambatan agar seluruh jadwal berikutnya tetap sinkron.
                                </span>
                            </label>
                        </div>
                    </form>
                )}
            </Modal>

            {/* MODAL 3: Generate Absensi Seluruh Peserta */}
            <Modal
                isOpen={isGenerateAttendanceModalOpen}
                onClose={() => setIsGenerateAttendanceModalOpen(false)}
                title="Generate Presensi Seluruh Peserta"
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsGenerateAttendanceModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            loading={isGeneratingAttendance}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={handleGenerateAllAttendance}
                        >
                            Generate Presensi Sekarang
                        </Button>
                    </>
                }
            >
                <div className="space-y-4 text-xs text-[#112743]">
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-emerald-800">
                        <div className="flex items-start gap-2.5">
                            <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                            <div>
                                <p className="font-semibold text-emerald-900">Catat Kehadiran Lengkap Otomatis</p>
                                <p className="mt-1 text-[11px] leading-relaxed">
                                    Tindakan ini akan mencatat status presensi hadir secara serentak untuk seluruh kenshi terdaftar pada sesi yang dibuka.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <FormField label="Pilih Hari">
                            <Select value={generateDay} onChange={(e) => setGenerateDay(e.target.value)}>
                                <option value="all">Semua Hari (1 s.d {totalDays})</option>
                                {daysList.map((d) => (
                                    <option key={d} value={String(d)}>
                                        Hari ke-{d} ({getDayDateInfo(d)})
                                    </option>
                                ))}
                            </Select>
                        </FormField>

                        <FormField label="Target Jalur Peserta">
                            <Select value={generateTrack} onChange={(e) => setGenerateTrack(e.target.value)}>
                                <option value="all">Semua Jalur Kenshi</option>
                                {tracks.map((t) => (
                                    <option key={t.id || t.code} value={t.code}>
                                        {t.code} — {t.name}
                                    </option>
                                ))}
                            </Select>
                        </FormField>
                    </div>

                    <FormField label="Status Kehadiran yang Disimpan">
                        <Select value={generateStatus} onChange={(e) => setGenerateStatus(e.target.value)}>
                            <option value="present">Hadir Tepat Waktu (Present)</option>
                            <option value="late">Hadir Terlambat (Late)</option>
                            <option value="excused">Izin Panitia (Excused)</option>
                        </Select>
                    </FormField>

                    <div className="space-y-2 p-3 bg-slate-50 border border-[#DCE7F3] rounded-lg">
                        <span className="font-semibold text-[#0E2747] block mb-1">Cakupan Sesi:</span>
                        <Checkbox
                            checked={generateIncludeSessions}
                            onChange={(e) => setGenerateIncludeSessions(e.target.checked)}
                            label="Seluruh Sesi Rundown Hari Ini"
                            helperText="Presensi tercatat otomatis untuk setiap sesi aktif sesuai jalur kenshi."
                        />
                        <Checkbox
                            checked={generateIncludeDaily}
                            onChange={(e) => setGenerateIncludeDaily(e.target.checked)}
                            label="Presensi Kehadiran Harian"
                            helperText="Sesi kehadiran awal hari (check-in harian)."
                        />
                        <Checkbox
                            checked={generateIncludeArrival}
                            onChange={(e) => setGenerateIncludeArrival(e.target.checked)}
                            label="Presensi Kedatangan Awal Event"
                            helperText="Check-in awal kedatangan peserta di lokasi kegiatan."
                        />
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}
