import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
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
} from 'lucide-react';
import Button from '@/Components/ui/Button';
import Modal from '@/Components/ui/Modal';
import EmptyState from '@/Components/ui/EmptyState';

export default function Schedule({
    speaker,
    sessions = [],
    stats = {},
    availableEvents = [],
    availableDays = [],
    filters = {},
}) {
    const [search, setSearch] = useState(filters.q || '');
    const [selectedEvent, setSelectedEvent] = useState(filters.event_id || '');
    const [selectedDay, setSelectedDay] = useState(filters.day || '');
    const [selectedSessionForModal, setSelectedSessionForModal] = useState(null);

    // Filter submissions
    const updateFilters = (newFilters) => {
        const merged = {
            event_id: selectedEvent || undefined,
            day: selectedDay || undefined,
            q: search || undefined,
            ...newFilters,
        };

        // Clean undefined or empty string values
        Object.keys(merged).forEach((key) => {
            if (merged[key] === '' || merged[key] === undefined || merged[key] === null) {
                delete merged[key];
            }
        });

        router.get(route('speaker.schedule'), merged, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleEventChange = (eventId) => {
        setSelectedEvent(eventId);
        updateFilters({ event_id: eventId, day: '' });
        setSelectedDay('');
    };

    const handleDayChange = (dayNum) => {
        setSelectedDay(dayNum);
        updateFilters({ day: dayNum });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        updateFilters({ q: search });
    };

    const handleResetFilters = () => {
        setSearch('');
        setSelectedEvent('');
        setSelectedDay('');
        router.get(route('speaker.schedule'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePrintRoster = () => {
        window.print();
    };

    const hasActiveFilters = Boolean(search || selectedEvent || selectedDay);

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
                                <span className="text-xs font-semibold text-[#112743] mr-1 flex items-center gap-1.5">
                                    <Filter className="size-3.5 text-[#0B63CE]" />
                                    Pilih Event:
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleEventChange('')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE] ${
                                        !selectedEvent
                                            ? 'bg-[#0E2747] text-white font-semibold'
                                            : 'bg-[#F8FBFF] border border-[#DCE7F3] text-[#6B7C93] hover:text-[#112743] hover:bg-white'
                                    }`}
                                >
                                    Semua Event ({stats.total_events || 0})
                                </button>
                                {availableEvents.map((evt) => (
                                    <button
                                        key={evt.id}
                                        type="button"
                                        onClick={() => handleEventChange(evt.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all truncate max-w-[220px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE] ${
                                            Number(selectedEvent) === evt.id
                                                ? 'bg-[#0E2747] text-white font-semibold'
                                                : 'bg-[#F8FBFF] border border-[#DCE7F3] text-[#6B7C93] hover:text-[#112743] hover:bg-white'
                                        }`}
                                        title={evt.name}
                                    >
                                        {evt.name}
                                    </button>
                                ))}
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
                    </div>

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
                                    {/* Event Header Banner */}
                                    <div className="bg-[#EAF5FF] border-b border-[#DCE7F3] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-[#0E2747] text-white">
                                                    Event Penataran
                                                </span>
                                                <span className="text-xs font-mono text-[#0A3F82] font-semibold">
                                                    {group.event_date}
                                                </span>
                                            </div>
                                            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#0E2747]">
                                                {group.event_name}
                                            </h2>
                                            {group.event_place && (
                                                <p className="text-xs text-[#6B7C93] flex items-center gap-1.5">
                                                    <MapPin className="size-3.5 text-[#0B63CE]" />
                                                    <span>Lokasi Penyelenggaraan: {group.event_place}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                                            <span className="px-3 py-1 rounded bg-white text-[#0E2747] text-xs font-mono font-semibold border border-[#DCE7F3]">
                                                {group.sessions.length} Sesi Terjadwal
                                            </span>
                                        </div>
                                    </div>

                                    {/* Sessions Ledger Rows */}
                                    <div className="divide-y divide-[#DCE7F3]/70">
                                        {group.sessions.map((session) => (
                                            <article
                                                key={session.id}
                                                className="p-5 sm:p-6 hover:bg-[#F8FBFF]/60 transition-colors"
                                            >
                                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                                                    {/* Left: Time, Day, & Location */}
                                                    <div className="lg:w-72 shrink-0 space-y-2">
                                                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                                            <span className="px-2 py-0.5 rounded bg-[#0E2747] text-white font-mono font-bold text-[11px]">
                                                                Hari {session.day_number}
                                                            </span>
                                                            <span className="px-2 py-0.5 rounded bg-[#EAF5FF] text-[#0B63CE] font-mono font-semibold text-[11px] border border-[#BCE0FD]">
                                                                {session.duration_jp} JP
                                                            </span>
                                                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-mono">
                                                                {session.session_type_name || 'SESI'}
                                                            </span>
                                                        </div>

                                                        <div className="space-y-0.5">
                                                            <div className="text-sm font-mono font-bold text-[#112743] flex items-center gap-1.5">
                                                                <Clock className="size-3.5 text-[#0B63CE]" />
                                                                <span>{session.time_range}</span>
                                                            </div>
                                                            <p className="text-xs text-[#6B7C93]">
                                                                {session.date_formatted}
                                                            </p>
                                                        </div>

                                                        <div className="text-xs text-[#112743] font-medium flex items-center gap-1.5 pt-1">
                                                            <MapPin className="size-3.5 text-[#EE9B25] shrink-0" />
                                                            <span className="truncate">{session.room}</span>
                                                        </div>

                                                        <div className="text-[11px] text-[#6B7C93] flex items-center gap-1">
                                                            <span className="font-semibold text-slate-600">Metode:</span>
                                                            <span>{session.method}</span>
                                                        </div>
                                                    </div>

                                                    {/* Middle: Topic, Subtopic, Track Codes & Module */}
                                                    <div className="flex-1 min-w-0 space-y-3">
                                                        <div className="space-y-1">
                                                            <h3 className="text-base sm:text-lg font-bold text-[#112743] leading-snug">
                                                                {session.topic}
                                                            </h3>
                                                            {session.subtopic && (
                                                                <p className="text-xs sm:text-sm text-[#6B7C93] leading-relaxed">
                                                                    Subtopik: {session.subtopic}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Target Peserta / Track Codes */}
                                                        {session.track_codes && session.track_codes.length > 0 && (
                                                            <div className="flex flex-wrap items-center gap-1.5">
                                                                <span className="text-[11px] font-mono text-[#6B7C93]">
                                                                    Sasaran Peserta:
                                                                </span>
                                                                {session.track_codes.map((code) => (
                                                                    <span
                                                                        key={code}
                                                                        className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#EAF5FF] text-[#0A3F82] border border-[#BCE0FD]"
                                                                    >
                                                                        {code}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Learning Module Card */}
                                                        {session.learning_module && (
                                                            <div className="bg-[#F8FBFF] rounded-lg p-3 border border-[#DCE7F3] space-y-1.5">
                                                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-mono font-bold text-[#0B63CE] text-[11px]">
                                                                            {session.learning_module.code}
                                                                        </span>
                                                                        <span className="text-[#6B7C93]">|</span>
                                                                        <span className="font-semibold text-[#112743] text-xs">
                                                                            {session.learning_module.title}
                                                                        </span>
                                                                    </div>
                                                                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#7957D5]/10 text-[#7957D5]">
                                                                        {session.learning_module.category}
                                                                    </span>
                                                                </div>
                                                                {session.learning_module.description && (
                                                                    <p className="text-xs text-[#6B7C93] line-clamp-2">
                                                                        {session.learning_module.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div>
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedSessionForModal(session)}
                                                                className="inline-flex items-center gap-1.5 text-xs text-[#0B63CE] hover:text-[#0A3F82] font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE]"
                                                            >
                                                                <Info className="size-3.5" />
                                                                <span>Lihat Rincian Silabus & Sasaran Kompetensi</span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Right: Materials & Action Buttons */}
                                                    <div className="lg:w-80 shrink-0 bg-[#F8FBFF] rounded-lg border border-[#DCE7F3] p-3.5 space-y-3">
                                                        <div className="flex items-center justify-between border-b border-[#DCE7F3] pb-2">
                                                            <span className="text-xs font-bold text-[#112743] flex items-center gap-1.5">
                                                                <BookOpen className="size-3.5 text-[#0B63CE]" />
                                                                <span>Bahan Ajar & Viewer</span>
                                                            </span>
                                                            <span className="text-[11px] font-mono text-[#6B7C93]">
                                                                {session.materials.length + (session.event_module ? 1 : 0)} Berkas
                                                            </span>
                                                        </div>

                                                        {session.materials.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {session.materials.map((mat) => (
                                                                    <div
                                                                        key={mat.id}
                                                                        className="p-2 bg-white rounded border border-[#DCE7F3] text-xs space-y-2"
                                                                    >
                                                                        <div className="flex items-start gap-2">
                                                                            <FileText className="size-4 text-[#EE9B25] shrink-0 mt-0.5" />
                                                                            <div className="min-w-0 flex-1">
                                                                                <p className="font-semibold text-[#112743] leading-snug line-clamp-2" title={mat.title}>
                                                                                    {mat.title}
                                                                                </p>
                                                                                <span className="text-[10px] text-[#6B7C93] block mt-0.5">
                                                                                    {mat.category_name}
                                                                                </span>
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex items-center gap-1.5 pt-1">
                                                                            <a
                                                                                href={mat.read_url}
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold bg-[#0B63CE] hover:bg-[#0A3F82] text-white transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE]"
                                                                            >
                                                                                <BookOpen className="size-3" />
                                                                                <span>Buka Buku Digital</span>
                                                                            </a>
                                                                            <a
                                                                                href={mat.download_url}
                                                                                className="inline-flex items-center justify-center p-1.5 rounded border border-[#DCE7F3] text-[#112743] hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE]"
                                                                                title="Unduh Berkas PDF Resmi"
                                                                                aria-label={`Unduh ${mat.title}`}
                                                                            >
                                                                                <Download className="size-3.5 text-[#6B7C93]" />
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : session.event_module ? (
                                                            <div className="p-2.5 bg-white rounded border border-[#DCE7F3] text-xs space-y-2">
                                                                <div className="flex items-center gap-2">
                                                                    <FileText className="size-4 text-[#0B63CE] shrink-0" />
                                                                    <span className="font-semibold text-[#112743] truncate">
                                                                        {session.event_module.title}
                                                                    </span>
                                                                </div>
                                                                <a
                                                                    href={session.event_module.download_url}
                                                                    className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold bg-[#0B63CE] hover:bg-[#0A3F82] text-white transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE]"
                                                                >
                                                                    <Download className="size-3" />
                                                                    <span>Unduh Modul PDF</span>
                                                                </a>
                                                            </div>
                                                        ) : (
                                                            <div className="py-2 text-center text-xs text-[#6B7C93] italic">
                                                                Belum ada dokumen bahan ajar yang diunggah untuk sesi ini.
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </article>
                                        ))}
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

                {/* 5. Print-Only Official Roster Document */}
                <div className="print-only p-8">
                    {/* PB PERKEMI Official Kop */}
                    <div className="border-b-2 border-black pb-4 mb-6 text-center space-y-1">
                        <h1 className="text-xl font-serif font-bold uppercase tracking-wider">
                            Persaudaraan Bela Diri Kempo Indonesia (PB PERKEMI)
                        </h1>
                        <h2 className="text-sm font-sans font-semibold tracking-wide uppercase">
                            Pustaka Penataran Nasional — Lembar Jadwal Mengajar Pemateri
                        </h2>
                        <p className="text-xs font-mono text-gray-700">
                            Dicetak pada: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    {/* Speaker Info Table */}
                    <div className="mb-6 border border-gray-400 p-4 space-y-1.5 text-xs">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="font-semibold block">Nama Pemateri / Instruktur:</span>
                                <span className="font-bold text-sm">{speaker?.full_name || '-'}</span>
                            </div>
                            <div>
                                <span className="font-semibold block">Tingkatan DAN / Gelar:</span>
                                <span className="font-bold text-sm">{speaker?.dan_rank || '-'}</span>
                            </div>
                            <div>
                                <span className="font-semibold block">Jabatan / Afiliasi:</span>
                                <span>{speaker?.position || '-'} {speaker?.organization ? `(${speaker.organization})` : ''}</span>
                            </div>
                            <div>
                                <span className="font-semibold block">Bidang Keahlian:</span>
                                <span>{speaker?.specialization || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Official Table */}
                    <table className="print-table text-xs">
                        <thead>
                            <tr>
                                <th style={{ width: '5%' }}>No</th>
                                <th style={{ width: '12%' }}>Hari & Tanggal</th>
                                <th style={{ width: '15%' }}>Waktu (WIB)</th>
                                <th style={{ width: '15%' }}>Ruangan / Dojo</th>
                                <th style={{ width: '30%' }}>Materi / Topik Pelajaran</th>
                                <th style={{ width: '15%' }}>Sasaran Peserta</th>
                                <th style={{ width: '8%' }}>JP</th>
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
                            <p>Mengetahui,<br /><strong>Ketua Panitia Penataran</strong></p>
                            <p className="border-t border-black pt-1 font-bold inline-block min-w-[200px]">
                                ( .................................................... )
                            </p>
                        </div>
                        <div className="space-y-16">
                            <p>Pemateri / Instruktur,<br /><strong>PB PERKEMI</strong></p>
                            <p className="border-t border-black pt-1 font-bold inline-block min-w-[200px]">
                                ( {speaker?.name || 'Sensei Pemateri'} )
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PortalLayout>
    );
}
