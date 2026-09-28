import React, { useState, useMemo } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import PortalLayout from '@/Layouts/PortalLayout';
import {
    Calendar,
    Clock,
    MapPin,
    BookOpen,
    Download,
    FileText,
    Award,
    Search,
    User,
    CheckCircle2,
    Filter,
    Printer,
    ArrowUpRight,
    Sparkles,
    Shield,
    X,
    Info,
    ChevronRight,
    Compass,
    Check,
    Plus,
    Edit3,
    Trash2,
    AlertCircle,
    AlertTriangle,
    Lock,
    Unlock,
    QrCode,
} from 'lucide-react';
import Button from '@/Components/ui/Button';
import Modal from '@/Components/ui/Modal';
import EmptyState from '@/Components/ui/EmptyState';
import FormField from '@/Components/ui/FormField';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';


import { SpeakerScheduleContext } from './Partials/SpeakerScheduleContext';
import SpeakerRoster from './Partials/SpeakerRoster';
import SpeakerScheduleDialogs from './Partials/SpeakerScheduleDialogs';
import SpeakerPrintRoster from './Partials/SpeakerPrintRoster';

export default function Schedule({
    speaker,
    isSupervisorMode = false,
    canManageSchedule = false,
    sessions = [],
    stats = {},
    availableEvents = [],
    availableDays = [],
    availableSpeakers = [],
    allSpeakers = [],
    allRooms = [],
    allTracks = [],
    allSessionTypes = [],
    filters = {},
    activeEventId = null,
    currentEvent = null,
}) {
    const [search, setSearch] = useState(filters.q || '');
    const [selectedEvent, setSelectedEvent] = useState(
        filters.event_id !== undefined && filters.event_id !== ''
            ? filters.event_id
            : (activeEventId ? String(activeEventId) : '')
    );
    const [selectedDay, setSelectedDay] = useState(filters.day || '');
    const [selectedSpeaker, setSelectedSpeaker] = useState(filters.speaker_id || '');
    const [selectedSessionForModal, setSelectedSessionForModal] = useState(null);

    // Reschedule / Molor Modal state & form
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
    const [reschedulingSession, setReschedulingSession] = useState(null);
    const rescheduleForm = useForm({
        start_time: '',
        end_time: '',
        shift_minutes: 0,
        shift_subsequent_sessions: true,
        status: 'scheduled',
        speaker_id: '',
        room: '',
    });

    const openRescheduleModal = (session) => {
        setReschedulingSession(session);
        rescheduleForm.clearErrors();
        rescheduleForm.setData({
            start_time: session.start_time || '',
            end_time: session.end_time || '',
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
        if (!reschedulingSession) return;
        rescheduleForm.post(`/pemateri/sesi/${reschedulingSession.id}/reschedule`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsRescheduleModalOpen(false);
                setReschedulingSession(null);
            },
        });
    };

    // Full Session Add/Edit Modal state & form
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState(null);

    const defaultEventId = availableEvents[0]?.id || '';
    const sessionForm = useForm({
        event_id: defaultEventId,
        day_number: 1,
        session_number: 'Sesi 1',
        event_session_type_id: allSessionTypes[0]?.id || '',
        session_type_code: allSessionTypes[0]?.code || '',
        speaker_id: speaker?.id || '',
        start_time: '08:00',
        end_time: '09:30',
        duration_jp: 2,
        topic: '',
        subtopic: '',
        method: 'Teori & Praktik',
        room: allRooms[0] || 'Dojo Utama',
        target_tracks: [],
        attendance_setting: 'check_in',
        status: 'scheduled',
    });

    const openCreateSessionModal = () => {
        setEditingSession(null);
        sessionForm.clearErrors();
        sessionForm.setData({
            event_id: (selectedEvent && selectedEvent !== 'all') ? Number(selectedEvent) : (activeEventId || availableEvents[0]?.id || ''),
            day_number: selectedDay ? Number(selectedDay) : 1,
            session_number: `Sesi ${(sessions.length % 10) + 1}`,
            event_session_type_id: allSessionTypes[0]?.id || '',
            session_type_code: allSessionTypes[0]?.code || '',
            speaker_id: selectedSpeaker || speaker?.id || '',
            start_time: '08:00',
            end_time: '09:30',
            duration_jp: 2,
            topic: '',
            subtopic: '',
            method: 'Teori & Praktik',
            room: allRooms[0] || 'Dojo Utama',
            target_tracks: allTracks.map((t) => t.code),
            attendance_setting: 'check_in',
            status: 'scheduled',
        });
        setIsSessionModalOpen(true);
    };

    const openEditSessionModal = (session) => {
        setEditingSession(session);
        sessionForm.clearErrors();
        sessionForm.setData({
            event_id: session.event_id,
            day_number: session.day_number,
            session_number: session.session_number,
            event_session_type_id: session.event_session_type_id || '',
            session_type_code: session.session_type_code || '',
            speaker_id: session.speaker_id || session.speaker?.id || '',
            start_time: session.start_time || '',
            end_time: session.end_time || '',
            duration_jp: session.duration_jp ?? 1,
            topic: session.topic || '',
            subtopic: session.subtopic || '',
            method: session.method || 'Teori & Praktik',
            room: session.room || '',
            target_tracks: session.target_tracks || session.track_codes || [],
            attendance_setting: session.attendance_setting || 'check_in',
            status: session.status || 'scheduled',
        });
        setIsSessionModalOpen(true);
    };

    const handleSaveSession = (e) => {
        e.preventDefault();
        if (editingSession) {
            sessionForm.put(`/pemateri/sesi/${editingSession.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSessionModalOpen(false);
                    setEditingSession(null);
                },
            });
        } else {
            sessionForm.post(`/pemateri/event/${sessionForm.data.event_id}/sesi`, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSessionModalOpen(false);
                },
            });
        }
    };

    const handleDeleteSession = (session) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus sesi "${session.topic}"? Tindakan ini tidak dapat dibatalkan.`)) {
            return;
        }
        router.delete(`/pemateri/sesi/${session.id}`, {
            preserveScroll: true,
        });
    };

    // Filter submissions
    const updateFilters = (newFilters) => {
        const merged = {
            event_id: selectedEvent || undefined,
            day: selectedDay || undefined,
            speaker_id: selectedSpeaker || undefined,
            q: search || undefined,
            ...newFilters,
        };

        // Clean undefined or empty string values
        Object.keys(merged).forEach((key) => {
            if (merged[key] === '' || merged[key] === undefined || merged[key] === null) {
                delete merged[key];
            }
        });

        router.get('/pemateri/jadwal', merged, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleEventChange = (eventId) => {
        const val = String(eventId);
        setSelectedEvent(val);
        setSelectedDay('');
        setSelectedSpeaker('');
        updateFilters({ event_id: val, day: '', speaker_id: '' });
    };

    const handleDayChange = (dayNum) => {
        setSelectedDay(dayNum);
        updateFilters({ day: dayNum });
    };

    const handleSpeakerChange = (speakerId) => {
        setSelectedSpeaker(speakerId);
        updateFilters({ speaker_id: speakerId });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        updateFilters({ q: search });
    };

    const handleResetFilters = () => {
        setSearch('');
        setSelectedEvent('');
        setSelectedDay('');
        setSelectedSpeaker('');
        router.get('/pemateri/jadwal', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePrintRoster = () => {
        window.print();
    };

    const hasActiveFilters = Boolean(search || selectedEvent || selectedDay || selectedSpeaker);

    // Group sessions by Event for structured roster layout
    const groupedSessions = useMemo(() => {
        const groups = {};
        sessions.forEach((s) => {
            const eventKey = s.event_name || 'Penataran PB PERKEMI';
            if (!groups[eventKey]) {
                groups[eventKey] = {
                    event_id: s.event_id,
                    event_name: s.event_name,
                    event_place: s.event_place,
                    event_date: s.event_date,
                    sessions: [],
                };
            }
            groups[eventKey].sessions.push(s);
        });
        return Object.values(groups);
    }, [sessions]);

    const scheduleContext = {
        speaker,
        isSupervisorMode,
        canManageSchedule,
        sessions,
        availableEvents,
        availableDays,
        availableSpeakers,
        allSpeakers,
        allTracks,
        allSessionTypes,
        currentEvent,
        search,
        setSearch,
        selectedEvent,
        selectedDay,
        selectedSpeaker,
        selectedSessionForModal,
        setSelectedSessionForModal,
        isRescheduleModalOpen,
        setIsRescheduleModalOpen,
        reschedulingSession,
        setReschedulingSession,
        rescheduleForm,
        openRescheduleModal,
        handleQuickShift,
        handleSaveReschedule,
        isSessionModalOpen,
        setIsSessionModalOpen,
        editingSession,
        setEditingSession,
        sessionForm,
        openCreateSessionModal,
        openEditSessionModal,
        handleSaveSession,
        handleDeleteSession,
        updateFilters,
        handleEventChange,
        handleDayChange,
        handleSpeakerChange,
        handleSearchSubmit,
        handleResetFilters,
        hasActiveFilters,
        groupedSessions,
    };

    return (
        <SpeakerScheduleContext.Provider value={scheduleContext}>
        <PortalLayout title="Jadwal & Materi Mengajar Pemateri">
            <Head title="Jadwal & Materi Mengajar — Portal Pemateri PERKEMI" />

            {/* Print Stylesheet */}
            <style>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    .print-only {
                        display: block !important;
                    }
                    body {
                        background: #ffffff !important;
                        color: #000000 !important;
                        font-size: 11pt !important;
                    }
                    #portal-main-content {
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .print-table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    .print-table th, .print-table td {
                        border: 1px solid #999999;
                        padding: 6px 8px;
                        text-align: left;
                    }
                    .print-table th {
                        background-color: #f0f0f0 !important;
                        font-weight: bold;
                    }
                }
                @media screen {
                    .print-only {
                        display: none !important;
                    }
                }
            `}</style>

            <div className="bg-[#F8FBFF] min-h-screen pb-20">
                {/* 1. Dossier Header (Modern Institutional Editorial) */}
                <header className="no-print bg-[#0E2747] text-white border-b border-[#0A3F82] pt-7 pb-10 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Breadcrumbs & Badge */}
                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[#EAF5FF]/70">
                                <Link
                                    href="/"
                                    className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0B63CE]"
                                >
                                    Beranda Pustaka
                                </Link>
                                <ChevronRight className="size-3.5 opacity-50" />
                                <span className="text-white font-medium">Portal Pemateri</span>
                                <ChevronRight className="size-3.5 opacity-50" />
                                <span className="text-[#EAF5FF]/90 font-mono tracking-wide">Jadwal & Bahan Ajar</span>
                            </nav>

                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#0A3F82] border border-[#0B63CE]/40 text-[#EAF5FF] text-[11px] font-mono uppercase tracking-wider">
                                <Shield className="size-3 text-[#20A47A]" />
                                Korps Pemateri & Dewan Guru PB PERKEMI
                            </div>
                        </div>

                        {/* Sensei Identity Dossier */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-1">
                            <div className="flex items-start gap-4 sm:gap-5">
                                <div className="size-16 sm:size-20 rounded-lg bg-[#0A3F82] border border-[#0B63CE]/50 flex items-center justify-center text-white shrink-0 shadow-sm">
                                    <span className="font-serif font-bold text-2xl sm:text-3xl text-white tracking-tight">
                                        {speaker?.name ? speaker.name.charAt(0).toUpperCase() : 'P'}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                                            {speaker?.full_name || 'Sensei Pemateri'}
                                        </h1>
                                        {speaker?.dan_rank && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#EAF5FF] text-[#0E2747] border border-[#DCE7F3]">
                                                {speaker.dan_rank}
                                            </span>
                                        )}
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-[#20A47A] text-white">
                                            <CheckCircle2 className="size-3" />
                                            {speaker?.type_label || 'Pemateri Resmi'}
                                        </span>
                                        {speaker?.is_supervisor ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold bg-[#F59E0B] text-slate-900 border border-amber-300 shadow-xs">
                                                <Sparkles className="size-3.5 fill-current text-slate-900" />
                                                Pemateri Supervisor
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#0A3F82] text-[#EAF5FF] border border-[#0B63CE]/40">
                                                Pemateri Reguler
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm text-[#EAF5FF]/80 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                                        {speaker?.position && (
                                            <span className="font-medium text-white">{speaker.position}</span>
                                        )}
                                        {speaker?.organization && (
                                            <>
                                                <span className="text-[#EAF5FF]/40">•</span>
                                                <span>{speaker.organization}</span>
                                            </>
                                        )}
                                        {speaker?.specialization && (
                                            <>
                                                <span className="text-[#EAF5FF]/40">•</span>
                                                <span className="text-[#EAF5FF]/90 font-medium">
                                                    Keahlian: {speaker.specialization}
                                                </span>
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Quick Action Buttons */}
                            <div className="flex flex-wrap items-center gap-3 self-start lg:self-center shrink-0">
                                {canManageSchedule && (
                                    <button
                                        type="button"
                                        onClick={openCreateSessionModal}
                                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold bg-[#20A47A] hover:bg-[#198462] text-white shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20A47A]"
                                        title="Tambah sesi rundown penataran baru"
                                    >
                                        <Plus className="size-3.5" />
                                        <span>Tambah Sesi Rundown</span>
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={handlePrintRoster}
                                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium bg-[#0A3F82] hover:bg-[#0B63CE] text-white border border-[#0B63CE]/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE]"
                                    title="Cetak lembar roster jadwal mengajar resmi"
                                >
                                    <Printer className="size-3.5 text-[#EAF5FF]" />
                                    <span>Cetak Lembar Jadwal</span>
                                </button>

                                <Link
                                    href="/koleksi"
                                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium bg-white hover:bg-[#EAF5FF] text-[#0E2747] border border-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE]"
                                >
                                    <BookOpen className="size-3.5 text-[#0B63CE]" />
                                    <span>Pustaka Digital</span>
                                    <ArrowUpRight className="size-3 text-[#6B7C93]" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>

                {/* 2. Editorial Metric Strip (Clean Hairline Dividers, Atelier Zero touch) */}
                <div className="no-print max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5">
                    <div className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#DCE7F3] overflow-hidden">
                        {/* Metric 1 */}
                        <div className="p-4 sm:p-5">
                            <span className="text-xs font-mono uppercase tracking-wider text-[#6B7C93] block">
                                Sesi Mengajar
                            </span>
                            <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-2xl sm:text-3xl font-serif font-bold text-[#112743]">
                                    {stats.total_sessions || 0}
                                </span>
                                <span className="text-xs text-[#6B7C93]">sesi terjadwal</span>
                            </div>
                        </div>

                        {/* Metric 2 */}
                        <div className="p-4 sm:p-5">
                            <span className="text-xs font-mono uppercase tracking-wider text-[#6B7C93] block">
                                Beban Jam Pelajaran
                            </span>
                            <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-2xl sm:text-3xl font-serif font-bold text-[#0B63CE]">
                                    {stats.total_jp || 0}
                                </span>
                                <span className="text-xs text-[#6B7C93]">JP efektif</span>
                            </div>
                        </div>

                        {/* Metric 3 */}
                        <div className="p-4 sm:p-5">
                            <span className="text-xs font-mono uppercase tracking-wider text-[#6B7C93] block">
                                Event Penataran
                            </span>
                            <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-2xl sm:text-3xl font-serif font-bold text-[#112743]">
                                    {stats.total_events || 0}
                                </span>
                                <span className="text-xs text-[#6B7C93]">kegiatan penugasan</span>
                            </div>
                        </div>

                        {/* Metric 4 */}
                        <div className="p-4 sm:p-5">
                            <span className="text-xs font-mono uppercase tracking-wider text-[#6B7C93] block">
                                Bahan Ajar & Modul
                            </span>
                            <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-2xl sm:text-3xl font-serif font-bold text-[#20A47A]">
                                    {stats.total_materials || 0}
                                </span>
                                <span className="text-xs text-[#6B7C93]">dokumen digital</span>
                            </div>
                        </div>
                    </div>
                </div>

                <SpeakerRoster />

                <SpeakerScheduleDialogs />

                <SpeakerPrintRoster />
            </div>
        </PortalLayout>
        </SpeakerScheduleContext.Provider>
    );
}
