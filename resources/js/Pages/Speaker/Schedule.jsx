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

const LOGO_WSKO = '/images/setup/ChatGPT Image 21 Sep 2026, 10.38.25.png';
const LOGO_PERKEMI = '/images/setup/ChatGPT Image 21 Sep 2026, 10.38.27.png';

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

    return (
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

                {/* 3. Main Roster Content */}
                <main className="no-print max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
                    {/* Filter & Search Bar */}
                    <div className="bg-white rounded-xl border border-[#DCE7F3] p-4 sm:p-5 shadow-xs space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {/* Event Filter Pills */}
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold text-[#0E2747] mr-1 flex items-center gap-1.5">
                                    <Compass className="size-3.5 text-[#0B63CE]" />
                                    Pilih Event Penataran:
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleEventChange('all')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE] ${
                                        selectedEvent === 'all'
                                            ? 'bg-[#0E2747] text-white font-semibold shadow-xs'
                                            : 'bg-[#F8FBFF] border border-[#DCE7F3] text-[#6B7C93] hover:text-[#112743] hover:bg-white'
                                    }`}
                                >
                                    Semua Event ({availableEvents.length})
                                </button>
                                {availableEvents.map((evt) => {
                                    const isSelected = String(selectedEvent) === String(evt.id);
                                    return (
                                        <button
                                            key={evt.id}
                                            type="button"
                                            onClick={() => handleEventChange(evt.id)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE] ${
                                                isSelected
                                                    ? 'bg-[#0E2747] text-white font-semibold shadow-xs'
                                                    : 'bg-[#F8FBFF] border border-[#DCE7F3] text-[#6B7C93] hover:text-[#112743] hover:bg-white'
                                            }`}
                                            title={`${evt.name} · ${evt.date_formatted || ''}`}
                                        >
                                            <span className="truncate max-w-[200px]">{evt.name}</span>
                                            {evt.is_active && (
                                                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                                    isSelected
                                                        ? 'bg-emerald-400 text-slate-900'
                                                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                }`}>
                                                    Aktif
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Search Form */}
                            <form onSubmit={handleSearchSubmit} className="relative min-w-[240px] sm:w-72">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari topik, kode, atau materi..."
                                    className="w-full pl-9 pr-8 py-2 rounded-lg text-xs border border-[#DCE7F3] bg-[#F8FBFF] text-[#112743] placeholder-[#6B7C93] focus:outline-none focus:border-[#0B63CE] focus:bg-white transition-colors focus-visible:ring-2 focus-visible:ring-[#0B63CE]"
                                />
                                <Search className="size-4 text-[#6B7C93] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch('');
                                            updateFilters({ q: '' });
                                        }}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7C93] hover:text-[#112743]"
                                        aria-label="Hapus pencarian"
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                )}
                            </form>
                        </div>

                        {/* Day Filter Tabs & Reset Action */}
                        <div className="pt-3 border-t border-[#DCE7F3]/70 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B7C93] mr-1.5">
                                    Hari Penataran:
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleDayChange('')}
                                    className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
                                        !selectedDay
                                            ? 'bg-[#0B63CE] text-white font-semibold'
                                            : 'bg-[#F8FBFF] text-[#6B7C93] hover:text-[#112743] border border-[#DCE7F3]'
                                    }`}
                                >
                                    Semua Hari
                                </button>
                                {availableDays.map((dayNum) => (
                                    <button
                                        key={dayNum}
                                        type="button"
                                        onClick={() => handleDayChange(dayNum)}
                                        className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
                                            Number(selectedDay) === dayNum
                                                ? 'bg-[#0B63CE] text-white font-semibold'
                                                : 'bg-[#F8FBFF] text-[#6B7C93] hover:text-[#112743] border border-[#DCE7F3]'
                                        }`}
                                    >
                                        Hari ke-{dayNum}
                                    </button>
                                ))}
                            </div>

                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="text-xs text-[#0B63CE] hover:text-[#0A3F82] font-semibold underline underline-offset-2 flex items-center gap-1"
                                >
                                    <X className="size-3" />
                                    Reset Semua Filter
                                </button>
                            )}
                        </div>

                        {/* Supervisor Speaker Filter */}
                        {isSupervisorMode && availableSpeakers.length > 0 && (
                            <div className="pt-3 border-t border-[#DCE7F3]/70 flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold text-[#112743] flex items-center gap-1.5 shrink-0">
                                    <User className="size-3.5 text-[#0B63CE]" />
                                    Filter Pemateri:
                                </span>
                                <select
                                    value={selectedSpeaker}
                                    onChange={(e) => handleSpeakerChange(e.target.value)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#F8FBFF] border border-[#DCE7F3] text-[#112743] focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                                >
                                    <option value="">Semua Pemateri ({availableSpeakers.length} Sensei)</option>
                                    {availableSpeakers.map((sp) => (
                                        <option key={sp.id} value={sp.id}>
                                            {sp.name}
                                        </option>
                                    ))}
                                </select>
                                {selectedSpeaker ? (
                                    <span className="text-xs text-[#0B63CE] bg-[#EAF5FF] px-2 py-0.5 rounded border border-[#BCE0FD]">
                                        Menampilkan jadwal pemateri terpilih
                                    </span>
                                ) : (
                                    <span className="text-[11px] text-[#6B7C93]">
                                        (Sebagai supervisor, Anda dapat melihat seluruh jadwal pengajar)
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Selected Event Details Card Banner */}
                    {currentEvent && (
                        <div className="bg-gradient-to-r from-[#0B63CE]/10 via-[#EAF5FF] to-white rounded-xl border border-[#BCE0FD] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
                            <div className="space-y-1.5 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#0B63CE] bg-white px-2 py-0.5 rounded border border-[#BCE0FD]">
                                        Kegiatan Terpilih
                                    </span>
                                    {currentEvent.is_active && (
                                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                            Event Aktif · Sedang Berlangsung
                                        </span>
                                    )}
                                    <span className="text-xs text-[#6B7C93]">
                                        Status: <strong className="text-[#0E2747]">{currentEvent.status_label || 'Aktif'}</strong>
                                    </span>
                                </div>
                                <h2 className="font-display font-bold text-base sm:text-lg text-[#0E2747] leading-snug">
                                    {currentEvent.name}
                                </h2>
                                <div className="flex flex-wrap items-center gap-3.5 text-xs text-[#6B7C93]">
                                    {currentEvent.date_formatted && (
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="size-3.5 text-[#0B63CE]" />
                                            <span>{currentEvent.date_formatted}</span>
                                        </span>
                                    )}
                                    {currentEvent.location && (
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="size-3.5 text-[#0B63CE]" />
                                            <span>{currentEvent.location}</span>
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                                {canManageSchedule && (
                                    <button
                                        type="button"
                                        onClick={openCreateSessionModal}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-[#20A47A] hover:bg-[#198462] text-white shadow-xs transition-colors"
                                        title="Tambah sesi rundown untuk event ini"
                                    >
                                        <Plus className="size-3.5" />
                                        <span>+ Tambah Sesi</span>
                                    </button>
                                )}

                                <a
                                    href={`/admin/event/${currentEvent.id}/rundown/cetak`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-[#0A3F82] hover:bg-[#0B63CE] text-white shadow-xs transition-colors"
                                    title="Cetak format lembar resmi A4 Landscape rundown kegiatan ini"
                                >
                                    <Printer className="size-3.5 text-white" />
                                    <span>Cetak Format Resmi A4</span>
                                </a>

                                {canManageSchedule && (
                                    <Link
                                        href={`/admin/event/${currentEvent.id}?tab=rundown`}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-[#0E2747] border border-[#DCE7F3] shadow-2xs transition-colors"
                                        title="Buka tab rundown di halaman admin event"
                                    >
                                        <ArrowUpRight className="size-3.5 text-[#6B7C93]" />
                                        <span>Admin Rundown</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Master Roster List */}
                    {sessions.length === 0 ? (
                        <div className="bg-white rounded-xl border border-[#DCE7F3] p-10 text-center shadow-xs">
                            <EmptyState
                                icon={Calendar}
                                title="Tidak Ada Jadwal Mengajar Ditemukan"
                                description={
                                    hasActiveFilters
                                        ? 'Tidak ditemukan jadwal mengajar yang sesuai dengan filter atau kata kunci pencarian Anda.'
                                        : 'Belum ada sesi penataran yang ditugaskan kepada Anda saat ini. Silakan hubungi panitia kegiatan.'
                                }
                                actionText={hasActiveFilters ? 'Reset Filter Pencarian' : undefined}
                                onAction={hasActiveFilters ? handleResetFilters : undefined}
                            />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {groupedSessions.map((group) => (
                                <section
                                    key={group.event_name}
                                    className="bg-white rounded-xl border border-[#DCE7F3] overflow-hidden shadow-xs"
                                >
                                    {/* Event Header Banner (Admin Style) */}
                                    <div className="bg-[#F8FBFF] border-b border-[#DCE7F3] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-[#0E2747] text-white">
                                                    Event Penataran
                                                </span>
                                                <span className="text-xs font-mono text-[#0A3F82] font-semibold">
                                                    {group.event_date}
                                                </span>
                                            </div>
                                            <h2 className="text-base sm:text-lg font-bold text-[#0E2747]">
                                                {group.event_name}
                                            </h2>
                                            {group.event_place && (
                                                <p className="text-xs text-[#6B7C93] flex items-center gap-1.5">
                                                    <MapPin className="size-3.5 text-[#EE9B25]" />
                                                    <span>Lokasi Penyelenggaraan: {group.event_place}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center shrink-0">
                                            <span className="px-3 py-1 rounded bg-white text-[#0E2747] text-xs font-mono font-semibold border border-[#DCE7F3]">
                                                {group.sessions.length} Sesi Terjadwal
                                            </span>
                                            <Link
                                                href={`/admin/rundown?event_id=${group.event_id || selectedEvent || ''}&day=${selectedDay || 1}`}
                                                className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#0A3F82] hover:bg-[#0B63CE] text-white text-xs font-semibold shadow-2xs transition-colors"
                                                title="Buka tampilan penuh di menu Admin Rundown"
                                            >
                                                <span>Buka di Admin Rundown</span>
                                                <ArrowUpRight className="size-3" />
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Sessions Table (Identical to Admin Tab 2 Rundown) */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs border-collapse">
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
                                                {group.sessions.map((session) => (
                                                    <tr key={session.id} className="hover:bg-[#F8FBFF] transition-colors">
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <div className="font-mono font-bold text-[#0B63CE]">{session.time_range}</div>
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                <span className="text-[11px] text-[#6B7C93]">{session.session_number} ({session.duration_jp} JP)</span>
                                                                {session.status === 'delayed' && (
                                                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                                                        Molor
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <div className="flex flex-wrap items-center gap-1">
                                                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                                                    {session.session_type_name || 'Sesi'}
                                                                </span>
                                                                {session.track_codes && session.track_codes.length > 0 ? (
                                                                    session.track_codes.map((tc) => (
                                                                        <span key={tc} className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                                                            {tc}
                                                                        </span>
                                                                    ))
                                                                ) : (
                                                                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                                                                        Semua Jalur
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-[10px] text-[#6B7C93] mt-0.5">{session.method}</div>
                                                        </td>
                                                        <td className="px-4 py-3 min-w-[220px]">
                                                            <div className="font-semibold text-[#0E2747]">{session.topic}</div>
                                                            {session.subtopic && <div className="text-[11px] text-[#6B7C93] mt-0.5 line-clamp-1">{session.subtopic}</div>}

                                                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                                                {session.materials && session.materials.map((mat) => (
                                                                    <a
                                                                        key={mat.id}
                                                                        href={mat.read_url}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="inline-flex items-center gap-1 font-mono text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100 transition-colors"
                                                                        title={`Buka Buku Digital: ${mat.title}`}
                                                                    >
                                                                        <BookOpen className="w-3 h-3" />
                                                                        <span>Buku: {mat.title}</span>
                                                                    </a>
                                                                ))}
                                                                {session.learning_module && (
                                                                    <span className="inline-flex items-center bg-[#EAF5FF] px-2 py-0.5 text-[10px] font-medium text-[#0A3F82] rounded">
                                                                        Modul: [{session.learning_module.code}] {session.learning_module.title}
                                                                    </span>
                                                                )}
                                                                {session.event_module && (
                                                                    <a
                                                                        href={session.event_module.download_url}
                                                                        className="inline-flex items-center bg-[#EAF5FF] px-2 py-0.5 text-[10px] font-medium text-[#0A3F82] rounded hover:underline"
                                                                    >
                                                                        Modul: {session.event_module.title}
                                                                    </a>
                                                                )}
                                                                {session.cbt_package_title && (
                                                                    <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-purple-50 text-purple-800 px-2 py-0.5 rounded border border-purple-200">
                                                                        <Award className="w-3 h-3" />
                                                                        <span>CBT: {session.cbt_package_title}</span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            {session.speaker ? (
                                                                <div>
                                                                    <div className="font-medium text-[#112743]">
                                                                        {session.speaker.full_name || session.speaker.name}
                                                                    </div>
                                                                    <div className="text-[10px] text-[#6B7C93] flex items-center gap-1">
                                                                        {session.speaker.dan_rank && <span>{session.speaker.dan_rank}</span>}
                                                                        {session.is_own_session && (
                                                                            <span className="text-[9px] font-bold px-1 rounded bg-[#20A47A]/15 text-[#20A47A]">
                                                                                Sesi Anda
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-[#6B7C93] italic">-</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap font-medium text-[#112743]">
                                                            {session.room || '-'}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <div className="space-y-1.5">
                                                                {session.is_attendance_open ? (
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                                            <Unlock className="w-3 h-3" />
                                                                            <span>Dibuka ({session.qr_short_code})</span>
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                                                                            <Lock className="w-3 h-3" />
                                                                            <span>Tutup</span>
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-1.5">
                                                                    {session.attendance_setting === 'check_in_out' ? (
                                                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                                                            Masuk & Keluar
                                                                        </span>
                                                                    ) : session.attendance_setting === 'check_in' ? (
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
                                                                    <span>Hadir: <strong>{session.attendances_count ?? 0}</strong></span>
                                                                    {session.is_attendance_open && (
                                                                        <>
                                                                            <span>•</span>
                                                                            <a
                                                                                href={`/admin/event/${session.event_id}/sesi/${session.id}/cetak-qr`}
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
                                                            <div className="flex items-center justify-end gap-1">
                                                                {canManageSchedule && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openRescheduleModal(session)}
                                                                        className="p-1 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded transition-colors"
                                                                        title="Sesuaikan Jadwal (Molor / Geser Waktu)"
                                                                        aria-label={`Sesuaikan jadwal sesi ${session.topic}`}
                                                                    >
                                                                        <Clock className="w-3.5 h-3.5" />
                                                                    </button>
                                                                )}
                                                                {canManageSchedule && (
                                                                    <>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => openEditSessionModal(session)}
                                                                            className="p-1 text-[#6B7C93] hover:text-[#0B63CE] rounded"
                                                                            aria-label={`Edit sesi ${session.topic}`}
                                                                        >
                                                                            <Edit3 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleDeleteSession(session)}
                                                                            className="p-1 text-[#6B7C93] hover:text-[#DD4D7C] rounded"
                                                                            aria-label={`Hapus sesi ${session.topic}`}
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setSelectedSessionForModal(session)}
                                                                    className="p-1 text-[#6B7C93] hover:text-[#0B63CE] rounded"
                                                                    title="Lihat Detail Silabus"
                                                                >
                                                                    <Info className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            ))}
                        </div>
                    )}
                </main>

                {/* 4. Modal Detail Silabus & Sasaran Kompetensi */}
                {selectedSessionForModal && (
                    <Modal
                        isOpen={Boolean(selectedSessionForModal)}
                        onClose={() => setSelectedSessionForModal(null)}
                        title={`Silabus Sesi: ${selectedSessionForModal.topic}`}
                        description={`Hari ${selectedSessionForModal.day_number} • ${selectedSessionForModal.time_range} • ${selectedSessionForModal.room}`}
                        size="xl"
                        footer={
                            <div className="flex items-center justify-between w-full">
                                <span className="text-xs font-mono text-[#6B7C93]">
                                    {selectedSessionForModal.event_name}
                                </span>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setSelectedSessionForModal(null)}
                                >
                                    Tutup
                                </Button>
                            </div>
                        }
                    >
                        <div className="space-y-5 text-sm">
                            {/* Overview Box */}
                            <div className="bg-[#F8FBFF] rounded-lg p-4 border border-[#DCE7F3] space-y-2">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                                    <div>
                                        <span className="text-[#6B7C93] block">Tanggal & Waktu</span>
                                        <span className="font-semibold text-[#112743]">
                                            {selectedSessionForModal.date_formatted}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[#6B7C93] block">Alokasi Waktu</span>
                                        <span className="font-semibold text-[#0B63CE]">
                                            {selectedSessionForModal.duration_jp} Jam Pelajaran (JP)
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[#6B7C93] block">Ruangan / Dojo</span>
                                        <span className="font-semibold text-[#112743]">
                                            {selectedSessionForModal.room}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Subtopic */}
                            {selectedSessionForModal.subtopic && (
                                <div className="space-y-1">
                                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#6B7C93]">
                                        Subtopik Bahasan
                                    </h4>
                                    <p className="text-sm text-[#112743] font-medium">
                                        {selectedSessionForModal.subtopic}
                                    </p>
                                </div>
                            )}

                            {/* Learning Objectives / Sasaran Kompetensi */}
                            {selectedSessionForModal.learning_module?.learning_objectives &&
                                selectedSessionForModal.learning_module.learning_objectives.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-mono uppercase tracking-wider text-[#0A3F82] font-semibold flex items-center gap-1.5">
                                            <Compass className="size-3.5 text-[#0B63CE]" />
                                            <span>Tujuan Pembelajaran Khusus (TPK)</span>
                                        </h4>
                                        <ul className="space-y-1.5 bg-[#F8FBFF] p-3 rounded-lg border border-[#DCE7F3]">
                                            {selectedSessionForModal.learning_module.learning_objectives.map((obj, i) => (
                                                <li key={i} className="text-xs text-[#112743] flex items-start gap-2">
                                                    <Check className="size-3.5 text-[#20A47A] shrink-0 mt-0.5" />
                                                    <span>{obj}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                            {/* Competency Outcomes */}
                            {selectedSessionForModal.learning_module?.competency_outcomes &&
                                selectedSessionForModal.learning_module.competency_outcomes.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-mono uppercase tracking-wider text-[#0A3F82] font-semibold flex items-center gap-1.5">
                                            <Award className="size-3.5 text-[#EE9B25]" />
                                            <span>Standar Kompetensi Akhir</span>
                                        </h4>
                                        <ul className="space-y-1.5 bg-[#F8FBFF] p-3 rounded-lg border border-[#DCE7F3]">
                                            {selectedSessionForModal.learning_module.competency_outcomes.map((comp, i) => (
                                                <li key={i} className="text-xs text-[#112743] flex items-start gap-2">
                                                    <Check className="size-3.5 text-[#0B63CE] shrink-0 mt-0.5" />
                                                    <span>{comp}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                            {/* Materials Attached in Modal */}
                            <div className="space-y-2 pt-2 border-t border-[#DCE7F3]">
                                <h4 className="text-xs font-mono uppercase tracking-wider text-[#6B7C93]">
                                    Dokumen Materi Pembelajaran
                                </h4>
                                {selectedSessionForModal.materials.length > 0 ? (
                                    <div className="space-y-2">
                                        {selectedSessionForModal.materials.map((mat) => (
                                            <div
                                                key={mat.id}
                                                className="flex items-center justify-between p-2.5 bg-white rounded border border-[#DCE7F3] text-xs"
                                            >
                                                <div className="flex items-center gap-2 truncate pr-2">
                                                    <FileText className="size-4 text-[#EE9B25] shrink-0" />
                                                    <span className="font-semibold text-[#112743] truncate">
                                                        {mat.title}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <a
                                                        href={mat.read_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="px-2.5 py-1 rounded bg-[#0B63CE] text-white font-semibold text-xs hover:bg-[#0A3F82] transition-colors"
                                                    >
                                                        Buka Reader
                                                    </a>
                                                    <a
                                                        href={mat.download_url}
                                                        className="px-2 py-1 rounded border border-[#DCE7F3] text-[#112743] text-xs hover:bg-[#F8FBFF] transition-colors"
                                                    >
                                                        Unduh
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-[#6B7C93] italic">
                                        Tidak ada dokumen bahan ajar yang terhubung.
                                    </p>
                                )}
                            </div>
                        </div>
                    </Modal>
                )}

                {/* 4b. Modal Sesuaikan Jadwal / Penanganan Sesi Molor */}
                <Modal
                    isOpen={isRescheduleModalOpen}
                    onClose={() => {
                        setIsRescheduleModalOpen(false);
                        setReschedulingSession(null);
                    }}
                    title={reschedulingSession ? `Sesuaikan Jadwal Sesi (${reschedulingSession.session_number})` : 'Sesuaikan Jadwal'}
                    description={reschedulingSession ? `${reschedulingSession.event_name} • Hari ke-${reschedulingSession.day_number}` : ''}
                    size="md"
                    footer={
                        <div className="flex items-center justify-end gap-2 w-full">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                    setIsRescheduleModalOpen(false);
                                    setReschedulingSession(null);
                                }}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                form="speaker-reschedule-form"
                                variant="primary"
                                size="sm"
                                loading={rescheduleForm.processing}
                            >
                                Simpan Perubahan Jadwal
                            </Button>
                        </div>
                    }
                >
                    {reschedulingSession && (
                        <form id="speaker-reschedule-form" onSubmit={handleSaveReschedule} className="space-y-4">
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1">
                                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                                    <Clock className="size-4 text-amber-700" />
                                    <span>Penanganan Jadwal Molor & Pergeseran Sesi</span>
                                </div>
                                <p className="text-amber-800">
                                    Topik: <strong>{reschedulingSession.topic}</strong>
                                </p>
                            </div>

                            {/* Quick Add Delay Buttons */}
                            <div>
                                <label className="block text-xs font-semibold text-[#112743] mb-1.5">
                                    Tambah Keterlambatan Cepat:
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
                                        <option value="delayed">Molor / Diundur</option>
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

                            {canManageSchedule && (
                                <FormField label="Sensei Pengampu" error={rescheduleForm.errors.speaker_id}>
                                    <Select
                                        value={rescheduleForm.data.speaker_id}
                                        onChange={(e) => rescheduleForm.setData('speaker_id', e.target.value)}
                                    >
                                        <option value="">-- Tetap / Pilih Sensei --</option>
                                        {allSpeakers.map((sp) => (
                                            <option key={sp.id} value={sp.id}>
                                                {sp.name}
                                            </option>
                                        ))}
                                    </Select>
                                </FormField>
                            )}

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

                {/* 4c. Modal Tambah / Edit Sesi Rundown Lengkap */}
                <Modal
                    isOpen={isSessionModalOpen}
                    onClose={() => {
                        setIsSessionModalOpen(false);
                        setEditingSession(null);
                    }}
                    title={editingSession ? 'Edit Sesi Rundown' : 'Tambah Sesi Rundown Baru'}
                    description="Sesuaikan rincian jadwal, materi, ruangan, pengajar, dan sasaran peserta."
                    size="2xl"
                    footer={
                        <div className="flex items-center justify-end gap-2 w-full">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                    setIsSessionModalOpen(false);
                                    setEditingSession(null);
                                }}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                form="speaker-session-form"
                                variant="primary"
                                size="sm"
                                loading={sessionForm.processing}
                            >
                                {editingSession ? 'Simpan Perubahan' : 'Buat Sesi Rundown'}
                            </Button>
                        </div>
                    }
                >
                    <form id="speaker-session-form" onSubmit={handleSaveSession} className="space-y-4">
                        {Object.keys(sessionForm.errors).length > 0 && (
                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                                <AlertCircle className="size-4 shrink-0 text-rose-600 mt-0.5" />
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

                        {!editingSession && availableEvents.length > 1 && (
                            <FormField label="Pilih Kegiatan Penataran" required error={sessionForm.errors.event_id}>
                                <Select
                                    value={sessionForm.data.event_id}
                                    onChange={(e) => sessionForm.setData('event_id', e.target.value)}
                                    required
                                >
                                    {availableEvents.map((evt) => (
                                        <option key={evt.id} value={evt.id}>
                                            {evt.name}
                                        </option>
                                    ))}
                                </Select>
                            </FormField>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <FormField label="Hari ke-" required error={sessionForm.errors.day_number}>
                                <Input
                                    type="number"
                                    min="1"
                                    max="60"
                                    value={sessionForm.data.day_number}
                                    onChange={(e) => sessionForm.setData('day_number', Number(e.target.value))}
                                    required
                                />
                            </FormField>

                            <FormField label="Nomor Sesi" required error={sessionForm.errors.session_number}>
                                <Input
                                    value={sessionForm.data.session_number}
                                    onChange={(e) => sessionForm.setData('session_number', e.target.value)}
                                    placeholder="Contoh: Sesi 1"
                                    required
                                />
                            </FormField>

                            <FormField label="Alokasi JP" required error={sessionForm.errors.duration_jp}>
                                <Input
                                    type="number"
                                    min="0"
                                    value={sessionForm.data.duration_jp}
                                    onChange={(e) => sessionForm.setData('duration_jp', Number(e.target.value))}
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
                            <FormField label="Jenis Sesi" error={sessionForm.errors.event_session_type_id}>
                                <Select
                                    value={sessionForm.data.event_session_type_id}
                                    onChange={(e) => {
                                        const st = allSessionTypes.find((s) => String(s.id) === String(e.target.value));
                                        sessionForm.setData((prev) => ({
                                            ...prev,
                                            event_session_type_id: e.target.value,
                                            session_type_code: st?.code || '',
                                        }));
                                    }}
                                >
                                    <option value="">-- Pilih Jenis Sesi --</option>
                                    {allSessionTypes.map((st) => (
                                        <option key={st.id} value={st.id}>
                                            {st.name} ({st.code})
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

                        <FormField label="Subtopik / Pokok Bahasan" error={sessionForm.errors.subtopic}>
                            <Input
                                value={sessionForm.data.subtopic}
                                onChange={(e) => sessionForm.setData('subtopic', e.target.value)}
                                placeholder="Contoh: Teknik dasar Chudan Tsuki & Uchiuke"
                            />
                        </FormField>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <FormField label="Sensei Pengampu" error={sessionForm.errors.speaker_id}>
                                <Select
                                    value={sessionForm.data.speaker_id}
                                    onChange={(e) => sessionForm.setData('speaker_id', e.target.value)}
                                >
                                    <option value="">-- Pilih Sensei Pengampu --</option>
                                    {allSpeakers.map((sp) => (
                                        <option key={sp.id} value={sp.id}>
                                            {sp.name}
                                        </option>
                                    ))}
                                </Select>
                            </FormField>

                            <FormField label="Ruangan / Lokasi Dojo" error={sessionForm.errors.room}>
                                <Input
                                    value={sessionForm.data.room}
                                    onChange={(e) => sessionForm.setData('room', e.target.value)}
                                    placeholder="Contoh: Dojo Utama / Aula Serbaguna"
                                />
                            </FormField>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <FormField label="Metode Pengajaran" error={sessionForm.errors.method}>
                                <Input
                                    value={sessionForm.data.method}
                                    onChange={(e) => sessionForm.setData('method', e.target.value)}
                                    placeholder="Teori & Praktik"
                                />
                            </FormField>

                            <FormField label="Status Sesi" error={sessionForm.errors.status}>
                                <Select
                                    value={sessionForm.data.status}
                                    onChange={(e) => sessionForm.setData('status', e.target.value)}
                                >
                                    <option value="scheduled">Terjadwal</option>
                                    <option value="ongoing">Sedang Berlangsung</option>
                                    <option value="delayed">Molor / Diundur</option>
                                    <option value="completed">Selesai</option>
                                    <option value="cancelled">Dibatalkan</option>
                                </Select>
                            </FormField>
                        </div>

                        {allTracks.length > 0 && (
                            <FormField label="Sasaran Tingkatan / Jalur Peserta" error={sessionForm.errors.target_tracks}>
                                <div className="space-y-2 p-3 bg-slate-50 border border-[#DCE7F3] rounded-xl text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#6B7C93]">Pilih jalur peserta yang diwajibkan mengikuti sesi ini:</span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => sessionForm.setData('target_tracks', allTracks.map((t) => t.code))}
                                                className="text-[#0B63CE] hover:underline font-semibold"
                                            >
                                                Pilih Semua
                                            </button>
                                            <span className="text-[#DCE7F3]">•</span>
                                            <button
                                                type="button"
                                                onClick={() => sessionForm.setData('target_tracks', [])}
                                                className="text-[#6B7C93] hover:underline"
                                            >
                                                Kosongkan
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                                        {allTracks.map((t) => {
                                            const selectedTracks = sessionForm.data.target_tracks || [];
                                            const isChecked = selectedTracks.includes(t.code);
                                            return (
                                                <label
                                                    key={t.code}
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
                                                        className="rounded border-[#DCE7F3] text-[#0B63CE] focus:ring-[#0B63CE] size-3.5"
                                                    />
                                                    <span>{t.code} · {t.name}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            </FormField>
                        )}
                    </form>
                </Modal>

                {/* 5. Print-Only Official Roster Document */}
                <div className="print-only p-8">
                    {/* PB PERKEMI Official Kop */}
                    <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-4">
                        <div className="w-16 flex justify-center shrink-0">
                            <img src={LOGO_PERKEMI} alt="Logo PB PERKEMI" className="h-14 w-auto object-contain" />
                        </div>
                        <div className="text-center px-4 flex-1 space-y-0.5">
                            <h1 className="text-base font-extrabold uppercase font-sans text-black">
                                Pengurus Besar Persaudaraan Bela Diri Kempo Indonesia
                            </h1>
                            <h2 className="text-xs font-bold uppercase tracking-wider text-black">
                                Departemen Pendidikan, Penataran &amp; Pelatihan (DIKTAR)
                            </h2>
                            <h3 className="text-sm font-black uppercase text-black pt-1 tracking-wider underline">
                                Lembar Jadwal &amp; Roster Sesi Penataran Resmi
                            </h3>
                            <p className="text-[10px] text-gray-700 font-mono">
                                Dicetak pada: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        <div className="w-16 flex justify-center shrink-0">
                            <img src={LOGO_WSKO} alt="Logo WSKO" className="h-14 w-auto object-contain" />
                        </div>
                    </div>

                    {/* Event & Scope Info Strip */}
                    <div className="mb-4 border border-gray-400 p-3 bg-gray-50 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                            <span className="text-[9px] uppercase font-mono text-gray-600 block">Nama Kegiatan:</span>
                            <span className="font-bold text-black">{currentEvent?.name || 'Seluruh Kegiatan Penataran'}</span>
                        </div>
                        <div>
                            <span className="text-[9px] uppercase font-mono text-gray-600 block">Tanggal &amp; Tempat:</span>
                            <span className="font-semibold text-black">{currentEvent?.date_formatted || '-'} · {currentEvent?.location || '-'}</span>
                        </div>
                        <div>
                            <span className="text-[9px] uppercase font-mono text-gray-600 block">Cakupan Hari:</span>
                            <span className="font-bold text-black">{selectedDay ? `Hari ke-${selectedDay}` : 'Seluruh Hari'}</span>
                        </div>
                        <div>
                            <span className="text-[9px] uppercase font-mono text-gray-600 block">Total Sesi:</span>
                            <span className="font-bold text-black">{sessions.length} Sesi Terjadwal</span>
                        </div>
                    </div>

                    {/* Official Table */}
                    <table className="print-table text-xs">
                        <thead>
                            <tr>
                                <th style={{ width: '5%' }}>No</th>
                                <th style={{ width: '12%' }}>Hari & Tanggal</th>
                                <th style={{ width: '13%' }}>Waktu (WIB)</th>
                                <th style={{ width: '12%' }}>Ruangan / Dojo</th>
                                {isSupervisorMode && <th style={{ width: '15%' }}>Sensei Pengampu</th>}
                                <th style={{ width: isSupervisorMode ? '25%' : '30%' }}>Materi / Topik Pelajaran</th>
                                <th style={{ width: '12%' }}>Sasaran Peserta</th>
                                <th style={{ width: '6%' }}>JP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.map((session, idx) => (
                                <tr key={session.id}>
                                    <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                                    <td>
                                        Hari ke-{session.day_number}
                                        <br />
                                        <span style={{ fontSize: '9pt', color: '#555' }}>
                                            {session.raw_date}
                                        </span>
                                    </td>
                                    <td style={{ fontFamily: 'monospace' }}>
                                        {session.time_range}
                                    </td>
                                    <td>{session.room}</td>
                                    {isSupervisorMode && (
                                        <td>
                                            <strong>{session.speaker?.full_name || session.speaker?.name || '-'}</strong>
                                            {session.speaker?.dan_rank && (
                                                <div style={{ fontSize: '8pt', color: '#555' }}>
                                                    {session.speaker.dan_rank}
                                                </div>
                                            )}
                                        </td>
                                    )}
                                    <td>
                                        <strong>{session.topic}</strong>
                                        {session.subtopic && (
                                            <div style={{ fontSize: '9pt', color: '#444' }}>
                                                Subtopik: {session.subtopic}
                                            </div>
                                        )}
                                        {session.learning_module && (
                                            <div style={{ fontSize: '8pt', color: '#666', marginTop: '2px' }}>
                                                Modul: {session.learning_module.code} - {session.learning_module.title}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        {session.track_codes && session.track_codes.length > 0
                                            ? session.track_codes.join(', ')
                                            : 'Semua Peserta'}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>{session.duration_jp}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Official Signature Blocks */}
                    <div className="mt-12 pt-6 grid grid-cols-2 gap-12 text-center text-xs">
                        <div className="space-y-16">
                            <p>Mengetahui &amp; Melaksanakan,<br /><strong>Koordinator Acara / Panitia Penyelenggara</strong></p>
                            <p className="border-t border-black pt-1 font-bold inline-block min-w-[200px]">
                                ( .................................................... )
                            </p>
                        </div>
                        <div className="space-y-16">
                            <p>Disahkan Oleh,<br /><strong>Pengurus Besar PERKEMI / Dewan Guru</strong></p>
                            <p className="border-t border-black pt-1 font-bold inline-block min-w-[200px]">
                                ( .................................................... )
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PortalLayout>
    );
}
