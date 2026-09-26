import React, { useState } from 'react';
import { Head, Link, router, useForm, usePoll } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    MapPin,
    Clock,
    Award,
    ExternalLink,
    ArrowLeft,
    CheckCircle2,
    FileText,
    Sparkles,
    QrCode,
    Camera,
    Shield,
    Check,
    CheckCheck,
    Loader2,
    AlertCircle,
    PlayCircle,
    HelpCircle,
    ChevronDown,
    ChevronUp,
    CheckSquare,
    Lock,
    Layers,
    Video,
    Filter,
    History,
    TrendingUp,
    CreditCard,
} from 'lucide-react';
import Button from '../../Components/ui/Button';
import Badge from '../../Components/ui/Badge';
import Toast from '../../Components/ui/Toast';

export default function LearningRoom({
    event,
    participant,
    activeSession,
    scheduleDays = [],
    sessions = [],
    modules = [],
    cbtPackages = [],
    myLearningModules = [],
    myCbtExams = [],
    attendanceRecords = [],
    certificate = null,
    transcript = null,
    integrityPact = null,
    gradeSummary = null,
}) {
    usePoll(10000, {
        only: [
            'participant',
            'activeSession',
            'sessions',
            'modules',
            'cbtPackages',
            'myLearningModules',
            'myCbtExams',
            'gradeSummary',
            'attendanceRecords',
            'certificate',
            'transcript',
            'integrityPact',
        ],
        preserveScroll: true,
        preserveState: true,
    });

    const availableDays = scheduleDays.length > 0
        ? scheduleDays
        : Array.from(new Set(sessions.map((session) => session.day_number)))
            .sort((a, b) => a - b)
            .map((dayNumber) => ({ day_number: dayNumber, date_label: null }));
    const [activeTab, setActiveTab] = useState('beranda');
    const [selectedDay, setSelectedDay] = useState(activeSession?.day_number || availableDays[0]?.day_number || 1);
    const [expandedSessionId, setExpandedSessionId] = useState(activeSession?.id || null);
    const [cbtFilter, setCbtFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all'); // all, sesi, ujian
    const [ujianTypeFilter, setUjianTypeFilter] = useState('all');
    const [expandedHistoryId, setExpandedHistoryId] = useState(null);
    const [processingSessionId, setProcessingSessionId] = useState(null);

    const handleDirectAttendance = (session, type = 'check_in') => {
        if (!session || processingSessionId) return;
        setProcessingSessionId(session.id);
        router.post(
            `/event/${event.slug}/absensi/catat`,
            {
                session_id: session.id,
                attendance_type: type,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setProcessingSessionId(null),
            }
        );
    };

    // Filter sessions for currently selected day
    const daySessions = sessions.filter((s) => s.day_number === selectedDay);

    return (
        <div className="min-h-screen bg-[#F8FBFF] text-[#112743] flex flex-col justify-between font-sans antialiased">
            <Head title={`Ruang Belajar — ${event.name}`} />
            <Toast />

            {/* Mobile-First Sticky Header */}
            <header className="bg-white border-b border-[#DCE7F3] sticky top-0 z-30 shadow-2xs">
                <div className="mx-auto flex min-h-16 w-full max-w-full items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0E2747] text-xs font-bold text-white shadow-xs">
                            <Shield className="w-4 h-4 text-[#EE9B25]" />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                            <span className="line-clamp-2 font-display text-xs font-bold leading-tight text-[#0E2747] sm:text-sm">
                                {event.name}
                            </span>
                            <span className="truncate font-mono text-[10px] text-[#6B7C93]">
                                Ruang Belajar • {participant.name} ({participant.track_code})
                            </span>
                        </div>
                    </div>

                    {/* Fast Navigation Quick Action */}
                    <div className="flex shrink-0 items-center gap-2">
                        <Link
                            href="/event-saya"
                            aria-label="Kembali ke Event Saya"
                            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-lg border border-[#DCE7F3] bg-white px-2.5 py-2 text-xs font-semibold text-[#6B7C93] shadow-xs transition-colors hover:border-[#0B63CE] hover:text-[#0B63CE] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] motion-reduce:transition-none"
                            title="Kembali ke Daftar Event Saya"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Event Saya</span>
                        </Link>

                        <a
                            href={`/event/${event.slug}/id-card`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Cetak ID Card Peserta"
                            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-[#DCE7F3] bg-white px-2.5 py-2 text-xs font-semibold text-[#0E2747] shadow-xs transition-colors hover:border-[#0B63CE] hover:text-[#0B63CE] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] motion-reduce:transition-none"
                            title="Buka / Cetak Kartu Tanda Peserta (ID Card)"
                        >
                            <CreditCard className="w-3.5 h-3.5 text-[#0B63CE]" />
                            <span className="hidden sm:inline">ID Card</span>
                        </a>

                        <Link
                            href={`/event/${event.slug}/scan`}
                            aria-label="Pindai QR absensi"
                            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-[#0B63CE] px-3 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#0A3F82] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] motion-reduce:transition-none"
                        >
                            <Camera className="w-3.5 h-3.5" />
                            <span className="hidden xs:inline">Scan Absensi</span>
                        </Link>

                        <Link
                            href={`/event/${event.slug}/welcome`}
                            aria-label="Buka sambutan event"
                            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[#DCE7F3] p-2 text-[#6B7C93] transition-colors hover:text-[#0B63CE] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] motion-reduce:transition-none"
                            title="Buka Animasi Buku 3D"
                        >
                            <Sparkles className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {/* Mobile Sub-Navigation Tabs */}
                <div className="overflow-x-auto border-t border-[#DCE7F3] bg-[#F8FBFF] px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto flex min-w-max max-w-full items-center gap-2 py-1.5 [&_button]:min-h-11 [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-2 [&_button]:focus-visible:outline-[#0B63CE] [&_button]:motion-reduce:transition-none">
                        <button
                            type="button"
                            onClick={() => setActiveTab('beranda')}
                            aria-pressed={activeTab === 'beranda'}
                            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                                activeTab === 'beranda'
                                    ? 'bg-[#0E2747] text-white shadow-xs'
                                    : 'text-[#6B7C93] hover:text-[#0E2747]'
                            }`}
                        >
                            Beranda & Sesi Aktif
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('rundown')}
                            aria-pressed={activeTab === 'rundown'}
                            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                                activeTab === 'rundown'
                                    ? 'bg-[#0E2747] text-white shadow-xs'
                                    : 'text-[#6B7C93] hover:text-[#0E2747]'
                            }`}
                        >
                            Rundown & Sesi
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('materi')}
                            aria-pressed={activeTab === 'materi'}
                            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                                activeTab === 'materi'
                                    ? 'bg-[#0E2747] text-white shadow-xs'
                                    : 'text-[#6B7C93] hover:text-[#0E2747]'
                            }`}
                        >
                            Modul Pembelajaran Saya ({myLearningModules?.length || modules.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('ujian')}
                            aria-pressed={activeTab === 'ujian'}
                            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                                activeTab === 'ujian'
                                    ? 'bg-[#0E2747] text-white shadow-xs'
                                    : 'text-[#6B7C93] hover:text-[#0E2747]'
                            }`}
                        >
                            Ujian Saya ({myCbtExams?.length || cbtPackages.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('nilai')}
                            aria-pressed={activeTab === 'nilai'}
                            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                                activeTab === 'nilai'
                                    ? 'bg-[#0E2747] text-white shadow-xs'
                                    : 'text-[#6B7C93] hover:text-[#0E2747]'
                            }`}
                        >
                            Riwayat Nilai ({gradeSummary?.completed_count ?? myCbtExams.filter((e) => e.has_attempt && e.exam_state === 'selesai').length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('absensi')}
                            aria-pressed={activeTab === 'absensi'}
                            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                                activeTab === 'absensi'
                                    ? 'bg-[#0E2747] text-white shadow-xs'
                                    : 'text-[#6B7C93] hover:text-[#0E2747]'
                            }`}
                        >
                            Riwayat Absensi ({attendanceRecords.length})
                        </button>
                        <button type="button" onClick={() => setActiveTab('sertifikat')} aria-pressed={activeTab === 'sertifikat'} className={`min-h-11 rounded-md px-3 py-1 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] ${activeTab === 'sertifikat' ? 'bg-[#0E2747] text-white' : 'text-[#6B7C93] hover:text-[#0E2747]'}`}>
                            Dokumen Kelulusan
                        </button>
                        <Link
                            href={`/event/${event.slug}/formulir-pendaftaran`}
                            className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold text-[#0B63CE] hover:bg-[#EAF5FF] transition-colors"
                        >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Formulir Penataran</span>
                            {participant.has_registration_form ? (
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            ) : (
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                            )}
                        </Link>
                        <Link
                            href={`/event/${event.slug}/pakta-integritas`}
                            className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold text-[#0B63CE] hover:bg-[#EAF5FF] transition-colors"
                        >
                            <Shield className="w-3.5 h-3.5" />
                            <span>Pakta Integritas</span>
                            {participant.has_integrity_pact ? (
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            ) : (
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                            )}
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content Body */}
            <main className="mx-auto w-full max-w-full flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                {!participant.can_access_learning && <p role="status" className="border border-[#DCE7F3] bg-[#EAF5FF] p-4 text-sm text-[#112743]">Materi dan ujian event tersedia setelah kehadiran awal hari dan sesi yang diwajibkan tercatat. Pindai QR dari penyelenggara untuk melanjutkan.</p>}
                {/* 1. STATUS CHECK-IN EVENT BANNER */}
                <section aria-label="Status Check-in Event">
                    {participant.is_checked_in ? (
                        <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2 text-emerald-800">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <div>
                                    <span className="font-bold block">Check-in Event Berhasil</span>
                                    <span className="text-emerald-700 text-[11px]">
                                        Tercatat pada {participant.checked_in_at} WIB. Kehadiran: {participant.attendance_percentage}% ({participant.attended_sessions_count} sesi)
                                    </span>
                                </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] shrink-0">
                                Terverifikasi
                            </span>
                        </div>
                    ) : (
                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="flex items-start gap-2.5 text-amber-900">
                                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold block text-sm">Konfirmasi Kehadiran Event</span>
                                    <span className="text-amber-800 text-xs">
                                        Pindai QR kehadiran dari penyelenggara sebelum memulai aktivitas belajar.
                                    </span>
                                </div>
                            </div>
                            <Link href={`/event/${event.slug}/scan`} className="inline-flex min-h-11 shrink-0 items-center justify-center bg-[#0B63CE] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0A3F82] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]">Scan kehadiran</Link>
                        </div>
                    )}
                </section>

                {/* 1.5. STATUS FORMULIR PENDAFTARAN BANNER */}
                <section aria-label="Status Formulir Penataran">
                    {!participant.has_registration_form ? (
                        <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
                            <div className="flex items-center gap-2.5 text-blue-950">
                                <FileText className="w-5 h-5 text-[#0B63CE] shrink-0" />
                                <div>
                                    <span className="font-bold block text-sm">Formulir Pendaftaran Penataran Wajib Diisi</span>
                                    <span className="text-blue-800 text-xs">
                                        Lengkapi data pemohon, riwayat piagam Gasnas, sertifikat daerah, dan surat pernyataan pembebasan resmi PB PERKEMI.
                                    </span>
                                </div>
                            </div>
                            <Link
                                href={`/event/${event.slug}/formulir-pendaftaran`}
                                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-[#0B63CE] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#0A3F82] shrink-0"
                            >
                                <FileText className="w-3.5 h-3.5" />
                                Isi Formulir Penataran
                            </Link>
                        </div>
                    ) : (
                        <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2 text-slate-700">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>
                                    Formulir Penataran: <strong className="text-slate-900">{participant.registration_form_status === 'verified' ? 'Terverifikasi PB PERKEMI' : 'Sudah Dikirim (Menunggu Verifikasi)'}</strong>
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/event/${event.slug}/formulir-pendaftaran`}
                                    className="font-semibold text-[#0B63CE] hover:underline"
                                >
                                    Lihat Formulir
                                </Link>
                                <span className="text-slate-300">·</span>
                                <a
                                    href={`/event/${event.slug}/formulir-pendaftaran/cetak`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-slate-600 hover:text-slate-900"
                                >
                                    Cetak PB PERKEMI
                                </a>
                                <span className="text-slate-300">·</span>
                                <a
                                    href={`/event/${event.slug}/id-card`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-[#0B63CE] hover:text-[#0A3F82]"
                                >
                                    Cetak ID Card
                                </a>
                            </div>
                        </div>
                    )}
                </section>

                {/* 2. PRIORITY: ACTIVE / ONGOING SESSION CARD */}
                {activeSession && (activeTab === 'beranda' || activeTab === 'rundown') && (
                    <section aria-label="Sesi Berlangsung" className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0E2747] uppercase tracking-wider">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 motion-safe:animate-pulse" />
                                <span>Sesi Sedang Berlangsung / Prioritas</span>
                            </div>
                            <span className="font-mono text-xs text-[#0B63CE] font-semibold bg-[#EAF5FF] px-2 py-0.5 rounded">
                                Hari ke-{activeSession.day_number}
                            </span>
                        </div>

                        <div className="bg-white rounded-2xl border-2 border-[#0B63CE]/30 p-5 sm:p-6 shadow-xs space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs font-bold text-[#0B63CE] bg-[#EAF5FF] px-2 py-0.5 rounded">
                                            {activeSession.time_slot} WIB
                                        </span>
                                        <span className="text-[11px] font-semibold text-[#6B7C93]">
                                            {activeSession.session_number} • {activeSession.session_type_name}
                                        </span>
                                    </div>
                                    <h2 className="font-display font-bold text-lg text-[#0E2747] leading-snug">
                                        {activeSession.topic}
                                    </h2>
                                    {activeSession.subtopic && (
                                        <p className="text-xs text-[#6B7C93]">
                                            {activeSession.subtopic}
                                        </p>
                                    )}
                                </div>

                                <div className="text-right shrink-0">
                                    <span className="font-mono text-xs text-[#0A3F82] font-semibold block">
                                        {activeSession.room || 'Belum ditetapkan'}
                                    </span>
                                    {activeSession.speaker_name && (
                                        <span className="text-[11px] text-[#6B7C93] block">
                                            Pemateri: {activeSession.speaker_name}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Dynamic CTAs according to Session Rules */}
                            <div className="pt-3 border-t border-[#DCE7F3] flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-xs">
                                    {activeSession.attendance_setting === 'check_in_out' && activeSession.has_checked_in && activeSession.has_checked_out ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                                            Masuk & Keluar Tercatat
                                        </span>
                                    ) : activeSession.attendance_setting === 'check_in_out' && activeSession.has_checked_in ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold text-[11px]">
                                            <Check className="w-3.5 h-3.5 text-blue-600" />
                                            Masuk: {activeSession.check_in_time ? activeSession.check_in_time.split(',')[0] : 'Tercatat'} (Perlu Absen Keluar)
                                        </span>
                                    ) : activeSession.has_attended ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                                            Kehadiran Tercatat
                                        </span>
                                    ) : activeSession.is_attendance_open ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800 motion-safe:animate-pulse">
                                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                                            Absensi Sesi Sedang Dibuka!
                                        </span>
                                    ) : (
                                        <span className="text-[11px] text-[#6B7C93]">
                                            Absensi belum dibuka panitia
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {/* Direct 1-Click Attendance Shortcut */}
                                    {activeSession.can_shortcut_attend && activeSession.next_attendance_type && (
                                        <button
                                            type="button"
                                            onClick={() => handleDirectAttendance(activeSession, activeSession.next_attendance_type)}
                                            disabled={processingSessionId === activeSession.id}
                                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-xs active:scale-95 disabled:opacity-50 ${
                                                activeSession.next_attendance_type === 'check_out'
                                                    ? 'bg-amber-600 hover:bg-amber-700'
                                                    : 'bg-emerald-600 hover:bg-emerald-700'
                                            }`}
                                        >
                                            {processingSessionId === activeSession.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <CheckCircle2 className="w-4 h-4" />
                                            )}
                                            <span>
                                                {processingSessionId === activeSession.id
                                                    ? 'Mencatat...'
                                                    : activeSession.attendance_button_label}
                                            </span>
                                        </button>
                                    )}

                                    {/* Attendance QR Scan CTA */}
                                    {activeSession.is_attendance_open && (!activeSession.has_attended || (activeSession.attendance_setting === 'check_in_out' && !activeSession.has_checked_out)) && (
                                        <Link
                                            href={`/event/${event.slug}/scan`}
                                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-[#DCE7F3] text-[#0B63CE] text-xs font-bold hover:bg-[#EAF5FF] transition-colors shadow-2xs"
                                            title="Scan QR dengan Kamera"
                                        >
                                            <QrCode className="w-4 h-4" />
                                            <span>Scan QR</span>
                                        </Link>
                                    )}

                                    {/* Material Reading CTA */}
                                    {activeSession.material_slug && (
                                        <Link
                                            href={activeSession.material_reader_url || `/koleksi/${activeSession.material_slug}/baca?event=${event.slug}`}
                                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EAF5FF] text-[#0B63CE] text-xs font-bold hover:bg-[#DCE7F3] transition-colors"
                                        >
                                            <BookOpen className="w-4 h-4" />
                                            <span>Baca Buku Digital</span>
                                        </Link>
                                    )}
                                    {!activeSession.material_slug && activeSession.event_material_url && (
                                        <a href={activeSession.event_material_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 bg-[#0B63CE] px-4 text-xs font-semibold text-white hover:bg-[#0A3F82] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]">Buka materi sesi</a>
                                    )}

                                    {!activeSession.has_attended && !activeSession.can_access_content && (activeSession.has_material || activeSession.has_exam || activeSession.material_slug || activeSession.event_material_url || activeSession.cbt_package_code) && (
                                        <div className="inline-flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                                            <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                            <span>
                                                Absen pada sesi ini untuk membuka{' '}
                                                {activeSession.has_exam && activeSession.has_material
                                                    ? 'materi dan ujian'
                                                    : activeSession.has_exam
                                                    ? 'ujian CBT'
                                                    : 'materi'}
                                            </span>
                                        </div>
                                    )}

                                    {/* CBT Exam CTA */}
                                    {activeSession.cbt_package_code && (
                                        activeSession.cbt_has_attempt && !activeSession.cbt_is_accessible ? (
                                            <div className="inline-flex flex-wrap items-center gap-2">
                                                {activeSession.cbt_last_score !== null && (
                                                    <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                                                        activeSession.cbt_is_passed
                                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                                                    }`}>
                                                        Nilai: {activeSession.cbt_last_score} ({activeSession.cbt_is_passed ? 'Lulus' : 'Belum Memenuhi'})
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTab('ujian')}
                                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 hover:bg-slate-200 transition-colors shadow-xs"
                                                    title="Ujian telah selesai dikerjakan dan terkunci. Klik untuk melihat riwayat ujian."
                                                >
                                                    <Lock className="w-4 h-4 text-slate-500" />
                                                    <span>Ujian Selesai (Terkunci)</span>
                                                </button>
                                            </div>
                                        ) : !activeSession.cbt_is_accessible ? (
                                            <button
                                                type="button"
                                                disabled
                                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold border border-slate-200 cursor-not-allowed shadow-xs"
                                                title={activeSession.cbt_access_denied_reason || 'Ujian belum dapat diakses'}
                                            >
                                                <Lock className="w-4 h-4 text-slate-400" />
                                                <span>{activeSession.cbt_access_denied_reason || 'Ujian Terkunci'}</span>
                                            </button>
                                        ) : (
                                            <Link
                                                href={`/event/${event.slug}/cbt/${activeSession.cbt_package_code}`}
                                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors shadow-xs"
                                            >
                                                <PlayCircle className="w-4 h-4" />
                                                <span>{activeSession.cbt_has_attempt ? 'Ujian Ulang CBT' : 'Mulai Ujian CBT'}</span>
                                            </Link>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* 3. TAB BERANDA: QUICK OVERVIEW & FEATURED MATERIALS */}
                {activeTab === 'beranda' && (
                    <div className="space-y-6">
                        {/* Event Quick Overview Card */}
                        <div className="bg-white rounded-2xl border border-[#DCE7F3] p-5 sm:p-6 shadow-xs space-y-3">
                            <h3 className="font-display font-bold text-sm text-[#0E2747] uppercase tracking-wider">
                                Ringkasan Kegiatan Penataran
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
                                <div className="p-3 bg-[#F8FBFF] rounded-xl border border-[#DCE7F3]">
                                    <span className="text-[#6B7C93] block text-[10px] uppercase font-mono">Beban Akreditasi</span>
                                    <span className="font-bold text-[#0B63CE] text-base">{event.total_effective_jp} JP</span>
                                    <span className="text-[10px] text-[#6B7C93] block">Kurikulum Nasional</span>
                                </div>
                                <div className="p-3 bg-[#F8FBFF] rounded-xl border border-[#DCE7F3]">
                                    <span className="text-[#6B7C93] block text-[10px] uppercase font-mono">Jalur Peserta</span>
                                    <span className="font-bold text-[#0E2747] text-base">{participant.track_code}</span>
                                    <span className="text-[10px] text-[#6B7C93] block truncate">{participant.track_name}</span>
                                </div>
                                <div className="p-3 bg-[#F8FBFF] rounded-xl border border-[#DCE7F3]">
                                    <span className="text-[#6B7C93] block text-[10px] uppercase font-mono">Rotasi Kelas</span>
                                    <span className="font-bold text-[#7957D5] text-base">Kelompok {participant.rotation_group || 'Belum ditetapkan'}</span>
                                    <span className="text-[10px] text-[#6B7C93] block">Sistem Bergilir</span>
                                </div>
                                <div className="p-3 bg-[#F8FBFF] rounded-xl border border-[#DCE7F3]">
                                    <span className="text-[#6B7C93] block text-[10px] uppercase font-mono">Kehadiran Sesi</span>
                                    <span className="font-bold text-[#20A47A] text-base">{participant.attendance_percentage}%</span>
                                    <span className="text-[10px] text-[#20A47A] block">{participant.attended_sessions_count} Sesi Hadir</span>
                                </div>
                            </div>
                        </div>

                        {/* Modul Pembelajaran Saya - Beranda Showcase */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-display font-bold text-sm text-[#0E2747] flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-[#0B63CE]" />
                                    Modul Pembelajaran Saya ({participant.track_code})
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('materi')}
                                    className="text-xs text-[#0B63CE] font-semibold hover:underline"
                                >
                                    Lihat Semua ({myLearningModules?.length || modules.length}) &rarr;
                                </button>
                            </div>

                            {myLearningModules && myLearningModules.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {myLearningModules.slice(0, 4).map((m) => {
                                        const firstMat = m.materials?.[0];
                                        return (
                                            <div
                                                key={m.id}
                                                className="p-4 rounded-xl bg-white border border-[#DCE7F3] shadow-2xs hover:border-[#0B63CE]/40 transition-all flex flex-col justify-between space-y-3"
                                            >
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center justify-between text-[10px]">
                                                        <span className="font-mono font-bold text-[#0B63CE] bg-[#EAF5FF] px-1.5 py-0.5 rounded">
                                                            {m.code}
                                                        </span>
                                                        <span className="text-[#6B7C93] font-mono">{m.total_jp} JP • {m.category}</span>
                                                    </div>
                                                    <h4 className="font-bold text-xs text-[#0E2747] line-clamp-2">
                                                        {m.title}
                                                    </h4>
                                                    <p className="text-[11px] text-[#6B7C93]">
                                                        {m.materials_count || m.materials?.length || 0} Materi Koleksi Digital
                                                    </p>
                                                </div>

                                                {firstMat ? (
                                                    <a
                                                        href={firstMat.reader_url || `/koleksi/${firstMat.slug}/baca`}
                                                        className={`inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-white text-xs font-semibold transition-colors ${
                                                            firstMat.type === 'video' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-[#0B63CE] hover:bg-[#0A3F82]'
                                                        }`}
                                                    >
                                                        {firstMat.type === 'video' ? <PlayCircle className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                                                        <span>{firstMat.cta_text || (firstMat.type === 'video' ? 'Tonton Video' : 'Baca E-Book')}</span>
                                                    </a>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveTab('materi')}
                                                        className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-[#DCE7F3] text-xs font-semibold text-[#0B63CE] hover:bg-[#F8FBFF]"
                                                    >
                                                        <span>Buka Modul</span>
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {modules.slice(0, 4).map((m) => (
                                        <div
                                            key={m.id}
                                            className="p-4 rounded-xl bg-white border border-[#DCE7F3] shadow-2xs hover:border-[#0B63CE]/40 transition-all flex flex-col justify-between space-y-3"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-[10px]">
                                                    <span className="font-mono font-bold text-[#0B63CE] bg-[#EAF5FF] px-1.5 py-0.5 rounded">
                                                        {m.code}
                                                    </span>
                                                    <span className="text-[#6B7C93] font-mono">{m.duration_jp} JP</span>
                                                </div>
                                                <h4 className="font-bold text-xs text-[#0E2747] line-clamp-2">
                                                    {m.title}
                                                </h4>
                                                <p className="text-[11px] text-[#6B7C93] truncate">
                                                    {m.speaker}
                                                </p>
                                            </div>

                                            <ModuleResourceLink module={m} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Ujian CBT Saya - Beranda Showcase */}
                        {myCbtExams && myCbtExams.length > 0 && (
                            <div className="space-y-3 pt-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h3 className="font-display font-bold text-sm text-[#0E2747] flex items-center gap-2">
                                        <Award className="w-4 h-4 text-purple-600" />
                                        Ujian CBT Saya
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('ujian')}
                                        className="inline-flex min-h-11 items-center whitespace-nowrap text-xs font-semibold text-[#0B63CE] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                                    >
                                        Buka Ujian Saya ({myCbtExams.length}) &rarr;
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {myCbtExams.slice(0, 2).map((pkg) => {
                                        const isAccessible = pkg.is_accessible;
                                        return (
                                            <div
                                                key={pkg.id}
                                                className="flex flex-col items-stretch justify-between gap-3 rounded-xl border border-[#DCE7F3] bg-white p-3.5 text-xs sm:flex-row sm:items-center"
                                            >
                                                <div className="space-y-0.5 min-w-0">
                                                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                                                        <span className="shrink-0 rounded border border-purple-200 bg-purple-50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-purple-700">
                                                            {pkg.code}
                                                        </span>
                                                        <span className="min-w-0 break-words font-bold text-[#0E2747]">
                                                            {pkg.title}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#6B7C93]">
                                                        <span>{pkg.exam_type_label || pkg.exam_type}</span>
                                                        <span>• {pkg.duration_minutes} Menit</span>
                                                        <span>• KKM: {pkg.passing_score}</span>
                                                    </div>
                                                </div>

                                                <div className="shrink-0 self-start sm:self-center flex items-center gap-2">
                                                    {pkg.has_attempt && pkg.last_score !== null && (
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                            pkg.is_passed
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : 'bg-rose-100 text-rose-800'
                                                        }`}>
                                                            {pkg.last_score} ({pkg.is_passed ? 'Lulus' : 'Belum Memenuhi'})
                                                        </span>
                                                    )}
                                                    {isAccessible ? (
                                                        <Link
                                                            href={pkg.exam_url || `/event/${event.slug}/cbt/${pkg.code}`}
                                                            className="inline-flex min-h-11 items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0B63CE] text-white font-bold text-xs hover:bg-[#0A3F82] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                                                        >
                                                            <PlayCircle className="w-3.5 h-3.5" />
                                                            <span>{pkg.has_attempt ? 'Ujian Ulang' : 'Mulai Ujian'}</span>
                                                        </Link>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => setActiveTab('ujian')}
                                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 px-2.5 py-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 border border-slate-200 transition-colors"
                                                        >
                                                            <Lock className="w-3 h-3 text-slate-500" />
                                                            <span>{pkg.has_attempt ? 'Selesai (Terkunci)' : 'Terkunci'}</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 4. TAB RUNDOWN: DAILY TIMELINE ACCORDION */}
                {activeTab === 'rundown' && (
                    <div className="space-y-4">
                        {/* Day Selector Tabs */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            {availableDays.map((day) => (
                                <button
                                    key={day.day_number}
                                    type="button"
                                    onClick={() => setSelectedDay(day.day_number)}
                                    aria-pressed={selectedDay === day.day_number}
                                    className={`min-h-11 shrink-0 rounded-lg px-4 py-2 text-left text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] motion-reduce:transition-none ${
                                        selectedDay === day.day_number
                                            ? 'bg-[#0E2747] text-white shadow-xs'
                                            : 'bg-white text-[#6B7C93] border border-[#DCE7F3] hover:bg-[#EAF5FF]'
                                    }`}
                                >
                                    <span className="block">Hari ke-{day.day_number}</span>
                                    {day.date_label && <span className="mt-0.5 block text-[10px] font-normal opacity-80">{day.date_label}</span>}
                                </button>
                            ))}
                        </div>

                        {/* Sessions Vertical Timeline List */}
                        <div className="space-y-3">
                            {daySessions.length === 0 ? (
                                <div className="p-8 text-center bg-white rounded-2xl border border-[#DCE7F3] text-xs text-[#6B7C93]">
                                    Belum ada sesi yang dijadwalkan pada Hari ke-{selectedDay}.
                                </div>
                            ) : (
                                daySessions.map((s) => {
                                    const isExpanded = expandedSessionId === s.id;
                                    return (
                                        <div
                                            key={s.id}
                                            className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs overflow-hidden transition-all"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => setExpandedSessionId(isExpanded ? null : s.id)}
                                                aria-expanded={isExpanded}
                                                aria-controls={`session-detail-${s.id}`}
                                                className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-[#F8FBFF] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#0B63CE] motion-reduce:transition-none"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <span className="font-mono text-xs font-bold text-[#0B63CE] bg-[#EAF5FF] px-2 py-1 rounded shrink-0">
                                                        {s.time_slot}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <div className="break-words text-xs font-bold text-[#0E2747]">
                                                            {s.topic}
                                                        </div>
                                                        <div className="text-[11px] text-[#6B7C93] flex items-center gap-2 mt-0.5">
                                                            <span>{s.session_type_name}</span>
                                                            {s.speaker_name && <span>• {s.speaker_name}</span>}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    {/* Direct 1-Click Attendance Shortcut in Session Header */}
                                                    {s.can_shortcut_attend && s.next_attendance_type ? (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDirectAttendance(s, s.next_attendance_type);
                                                            }}
                                                            disabled={processingSessionId === s.id}
                                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs transition-all active:scale-95 disabled:opacity-50 ${
                                                                s.next_attendance_type === 'check_out'
                                                                    ? 'bg-amber-600 hover:bg-amber-700'
                                                                    : 'bg-[#0B63CE] hover:bg-[#0A3F82]'
                                                            }`}
                                                            title={`Klik untuk langsung mencatat absensi ${s.next_attendance_type === 'check_out' ? 'keluar' : 'masuk'}`}
                                                        >
                                                            {processingSessionId === s.id ? (
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            ) : (
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                            )}
                                                            <span>
                                                                {processingSessionId === s.id
                                                                    ? 'Mencatat...'
                                                                    : s.next_attendance_type === 'check_out'
                                                                    ? 'Absen Keluar'
                                                                    : 'Absen Sekarang'}
                                                            </span>
                                                        </button>
                                                    ) : s.attendance_setting === 'check_in_out' && s.has_checked_in && s.has_checked_out ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                                                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                                                            <span className="hidden sm:inline">Lengkap</span>
                                                        </span>
                                                    ) : s.has_attended ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                                                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                            <span className="hidden sm:inline">Hadir</span>
                                                        </span>
                                                    ) : s.is_future ? (
                                                        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-medium border border-slate-200">
                                                            <Calendar className="w-3 h-3 text-slate-400" />
                                                            <span>Hari ke-{s.day_number}</span>
                                                        </span>
                                                    ) : s.is_attendance_open ? (
                                                        <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 motion-safe:animate-pulse">
                                                            Absen Buka
                                                        </span>
                                                    ) : null}

                                                    {/* Direct CBT Exam Link in header if attended and exam accessible */}
                                                    {s.has_attended && s.cbt_package_code && s.cbt_is_accessible && !s.cbt_has_attempt && (
                                                        <Link
                                                            href={`/event/${event.slug}/cbt/${s.cbt_package_code}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600 text-white text-[11px] font-bold hover:bg-purple-700 shadow-xs transition-all active:scale-95"
                                                        >
                                                            <Award className="w-3 h-3" />
                                                            <span className="hidden sm:inline">Ujian CBT</span>
                                                        </Link>
                                                    )}

                                                    {isExpanded ? (
                                                        <ChevronUp className="w-4 h-4 text-[#6B7C93]" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4 text-[#6B7C93]" />
                                                    )}
                                                </div>
                                            </button>

                                            {/* Expandable Session Detail */}
                                            {isExpanded && (
                                                <div id={`session-detail-${s.id}`} className="space-y-3 border-t border-[#DCE7F3]/60 bg-[#F8FBFF] px-4 pb-4 pt-1 text-xs">
                                                    {s.subtopic && (
                                                        <p className="text-[#112743]">{s.subtopic}</p>
                                                    )}
                                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[11px] text-[#6B7C93]">
                                                                Ruangan: <strong>{s.room || 'Belum ditetapkan'}</strong>
                                                            </span>
                                                            {s.attendance_setting === 'check_in_out' && (
                                                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                                                    Absensi Masuk & Keluar
                                                                </span>
                                                            )}
                                                            {s.attendance_setting === 'check_in' && (
                                                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                                                    Absensi Masuk Saja
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-2">
                                                            {!s.has_attended && !s.can_access_content && (s.has_exam || s.has_material || s.cbt_package_code || s.material_slug || s.event_material_url) && (
                                                                <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                                                                    <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                                                                    <span>Absen sesi untuk membuka {(s.has_exam || s.cbt_package_code || s.session_type_code === 'UJIAN') ? 'ujian CBT' : 'materi'}</span>
                                                                </span>
                                                            )}

                                                            {/* Direct Shortcut Button inside expanded detail */}
                                                            {s.can_shortcut_attend && s.next_attendance_type && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDirectAttendance(s, s.next_attendance_type)}
                                                                    disabled={processingSessionId === s.id}
                                                                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs transition-all active:scale-95 disabled:opacity-50 ${
                                                                        s.next_attendance_type === 'check_out'
                                                                            ? 'bg-amber-600 hover:bg-amber-700'
                                                                            : 'bg-[#0B63CE] hover:bg-[#0A3F82]'
                                                                    }`}
                                                                >
                                                                    {processingSessionId === s.id ? (
                                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                    ) : (
                                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                                    )}
                                                                    <span>
                                                                        {processingSessionId === s.id
                                                                            ? 'Mencatat...'
                                                                            : s.attendance_button_label}
                                                                    </span>
                                                                </button>
                                                            )}

                                                            {/* Alternative Scan QR link */}
                                                            {s.is_attendance_open && (!s.has_attended || (s.attendance_setting === 'check_in_out' && !s.has_checked_out)) && (
                                                                <Link
                                                                    href={`/event/${event.slug}/scan`}
                                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-[#DCE7F3] text-[#0B63CE] hover:bg-[#EAF5FF] text-xs font-semibold"
                                                                    title="Scan QR kode menggunakan kamera"
                                                                >
                                                                    <QrCode className="w-3.5 h-3.5" />
                                                                    <span>Scan QR</span>
                                                                </Link>
                                                            )}

                                                            {s.has_checked_in && (
                                                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-medium">
                                                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                                    <span>Masuk: {s.check_in_time ? s.check_in_time.split(',')[0] : 'Tercatat'}</span>
                                                                </span>
                                                            )}

                                                            {s.has_checked_out && (
                                                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-medium">
                                                                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                                                                    <span>Keluar: {s.check_out_time ? s.check_out_time.split(',')[0] : 'Tercatat'}</span>
                                                                </span>
                                                            )}

                                                            {s.is_future && (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-medium border border-slate-200">
                                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                                    <span>Dibuka pada Hari ke-{s.day_number} ({s.session_date_label})</span>
                                                                </span>
                                                            )}
                                                            {s.material_slug && (
                                                                <Link
                                                                    href={s.material_reader_url || `/koleksi/${s.material_slug}/baca?event=${event.slug}`}
                                                                    className="px-3 py-1.5 rounded-lg bg-white border border-[#DCE7F3] text-xs font-semibold text-[#0B63CE] hover:bg-[#EAF5FF]"
                                                                >
                                                                    Baca Materi
                                                                </Link>
                                                            )}
                                                            {!s.material_slug && s.event_material_url && <a href={s.event_material_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center border border-[#DCE7F3] bg-white px-3 text-xs font-semibold text-[#0B63CE] hover:bg-[#EAF5FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]">Buka materi</a>}
                                                            {s.cbt_package_code && (
                                                                s.cbt_has_attempt && !s.cbt_is_accessible ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setActiveTab('ujian')}
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 hover:bg-slate-200 transition-colors"
                                                                        title="Ujian telah selesai dikerjakan dan terkunci"
                                                                    >
                                                                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                                                                        <span>Ujian Selesai{s.cbt_last_score !== null ? ` (${s.cbt_last_score})` : ''}</span>
                                                                    </button>
                                                                ) : !s.cbt_is_accessible ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setActiveTab('ujian')}
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200 hover:bg-purple-100 transition-colors"
                                                                        title={s.cbt_access_denied_reason || 'Ujian Terkunci (Perlu Absensi Sesi)'}
                                                                    >
                                                                        <Lock className="w-3.5 h-3.5 text-purple-600" />
                                                                        <span>Ujian CBT (Perlu Absen)</span>
                                                                    </button>
                                                                ) : (
                                                                    <Link
                                                                        href={`/event/${event.slug}/cbt/${s.cbt_package_code}`}
                                                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 shadow-xs transition-all active:scale-95"
                                                                    >
                                                                        <Award className="w-3.5 h-3.5" />
                                                                        <span>{s.cbt_has_attempt ? 'Ujian Ulang CBT' : 'Ikuti Ujian CBT'}</span>
                                                                    </Link>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Module Information if linked to a course module */}
                                                    {s.module_title && (
                                                        <div className="flex items-center gap-2 text-xs text-[#6B7C93] pt-1 border-t border-[#DCE7F3]/40">
                                                            <BookOpen className="w-3.5 h-3.5 text-[#0B63CE] shrink-0" />
                                                            <span>Modul: <strong className="text-[#0E2747]">{s.module_code ? `${s.module_code} — ` : ''}{s.module_title}</strong></span>
                                                            {!s.material_slug && !s.event_material_url && (
                                                                <span className="text-[11px] text-slate-500 italic">• Bahan tatap muka / disiapkan instruktur</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {/* 5. TAB MATERI: MODUL PEMBELAJARAN SAYA */}
                {activeTab === 'materi' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <h3 className="font-display font-bold text-base text-[#0E2747] flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-[#0B63CE]" />
                                    Modul Pembelajaran Saya
                                </h3>
                                <p className="text-xs text-[#6B7C93]">
                                    Kurikulum kompetensi dan koleksi digital yang disesuaikan dengan jalur peserta Anda ({participant.track_name} • {participant.track_code}).
                                </p>
                            </div>
                            <span className="text-xs font-mono font-bold text-[#0B63CE] bg-[#EAF5FF] px-2.5 py-1 rounded-full border border-[#DCE7F3] shrink-0 self-start sm:self-auto">
                                {(myLearningModules && myLearningModules.length > 0 ? myLearningModules.length : modules.length)} Modul Tersedia
                            </span>
                        </div>

                        {myLearningModules && myLearningModules.length > 0 ? (
                            <div className="space-y-4">
                                {myLearningModules.map((lm) => (
                                    <div
                                        key={lm.id}
                                        className="p-5 rounded-2xl bg-white border border-[#DCE7F3] shadow-xs space-y-4 hover:border-[#0B63CE]/40 transition-all"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[#DCE7F3]">
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-mono text-xs font-bold text-[#0B63CE] bg-[#EAF5FF] px-2 py-0.5 rounded">
                                                        {lm.code}
                                                    </span>
                                                    <span className="text-xs font-medium text-[#6B7C93] bg-slate-100 px-2 py-0.5 rounded">
                                                        {lm.category}
                                                    </span>
                                                    <span className="text-xs font-medium text-[#6B7C93]">
                                                        Tingkat {lm.level}
                                                    </span>
                                                    <span
                                                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                                            lm.is_required
                                                                ? 'bg-rose-100 text-rose-800'
                                                                : 'bg-slate-100 text-slate-700'
                                                        }`}
                                                    >
                                                        {lm.is_required ? 'Wajib' : 'Pilihan'}
                                                    </span>
                                                </div>
                                                <h4 className="font-display font-bold text-base text-[#0E2747]">
                                                    {lm.title}
                                                </h4>
                                            </div>
                                            <div className="text-left sm:text-right shrink-0 font-mono text-xs text-[#6B7C93]">
                                                <span className="font-bold text-[#0B63CE] text-sm block">{lm.total_jp} JP</span>
                                                <span className="text-[11px]">{lm.materials?.length || 0} Materi Belajar</span>
                                            </div>
                                        </div>

                                        {/* Competency outcomes badges */}
                                        {lm.competency_outcomes && lm.competency_outcomes.length > 0 && (
                                            <div className="text-xs space-y-1">
                                                <span className="text-[10px] font-bold text-[#6B7C93] uppercase tracking-wider block">
                                                    Target Capaian Kompetensi:
                                                </span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {lm.competency_outcomes.map((cap, cIdx) => (
                                                        <span key={cIdx} className="px-2 py-0.5 rounded bg-blue-50 text-[#0B63CE] text-[11px] font-medium border border-blue-100">
                                                            ✓ {cap}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Connected Digital Materials List */}
                                        <div className="space-y-2 pt-2">
                                            <span className="text-xs font-bold text-[#0E2747] flex items-center gap-1.5">
                                                <Layers className="w-3.5 h-3.5 text-[#0B63CE]" />
                                                Materi & Koleksi Digital Terhubung:
                                            </span>

                                            {lm.materials && lm.materials.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {lm.materials.map((mat) => (
                                                        <div
                                                            key={mat.id}
                                                            className="p-3.5 rounded-xl bg-[#F8FBFF] border border-[#DCE7F3] flex flex-col justify-between space-y-2.5 hover:bg-white hover:border-[#0B63CE]/40 transition-all"
                                                        >
                                                            <div className="space-y-1">
                                                                <div className="flex items-center justify-between text-[10px]">
                                                                    <span className="font-mono font-bold text-[#6B7C93]">
                                                                        Urutan #{mat.sort_order || 1}
                                                                    </span>
                                                                    {mat.estimated_duration_minutes && (
                                                                        <span className="text-[#6B7C93] font-mono">
                                                                            ± {mat.estimated_duration_minutes} Menit
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <h5 className="font-bold text-xs text-[#0E2747] line-clamp-2">
                                                                    {mat.title}
                                                                </h5>
                                                                {mat.instructor_notes && (
                                                                    <p className="text-[11px] text-[#6B7C93] italic line-clamp-2">
                                                                        "{mat.instructor_notes}"
                                                                    </p>
                                                                )}
                                                            </div>

                                                            {mat.is_locked ? (
                                                                <span
                                                                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed"
                                                                    title="Absensi pada sesi materi ini wajib dicatat sebelum membuka materi"
                                                                >
                                                                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                                                                    <span>Perlu Absensi Sesi</span>
                                                                </span>
                                                            ) : (
                                                                <a
                                                                    href={mat.reader_url || `/koleksi/${mat.slug}/baca`}
                                                                    className={`inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold text-white transition-colors ${
                                                                        mat.type === 'video'
                                                                            ? 'bg-purple-600 hover:bg-purple-700'
                                                                            : 'bg-[#0B63CE] hover:bg-[#0A3F82]'
                                                                    }`}
                                                                >
                                                                    {mat.type === 'video' ? (
                                                                        <PlayCircle className="w-3.5 h-3.5" />
                                                                    ) : (
                                                                        <BookOpen className="w-3.5 h-3.5" />
                                                                    )}
                                                                    <span>{mat.cta_text || (mat.type === 'video' ? 'Tonton Video' : 'Baca E-Book')}</span>
                                                                </a>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-[#6B7C93] italic">
                                                    Materi digital dalam modul ini sedang dipersiapkan oleh instruktur penataran.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {modules.map((m) => (
                                    <div
                                        key={m.id}
                                        className="p-5 rounded-2xl bg-white border border-[#DCE7F3] shadow-xs flex flex-col justify-between space-y-4"
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-mono font-bold text-[#0B63CE] bg-[#EAF5FF] px-2 py-0.5 rounded">
                                                    {m.code}
                                                </span>
                                                <span className="font-mono text-[#6B7C93]">{m.duration_jp} JP</span>
                                            </div>
                                            <h4 className="font-bold text-sm text-[#0E2747] leading-snug">
                                                {m.title}
                                            </h4>
                                            <p className="text-xs text-[#6B7C93]">
                                                Instruktur: <strong className="text-[#112743]">{m.speaker}</strong>
                                            </p>
                                        </div>

                                        <div className="pt-3 border-t border-[#DCE7F3] flex items-center justify-between">
                                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                {m.resource_locked ? 'Perlu absensi sesi' : 'Modul event'}
                                            </span>

                                            <ModuleResourceLink module={m} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 6. TAB CBT: UJIAN SAYA */}
                {activeTab === 'ujian' && (
                    <div className="space-y-6">
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-display font-bold text-base text-[#0E2747] flex items-center gap-2">
                                        <Award className="w-5 h-5 text-purple-600" />
                                        Ujian Saya
                                    </h3>
                                    <p className="text-xs text-[#6B7C93]">
                                        Paket ujian CBT penataran untuk jalur {participant.track_name} ({participant.track_code}).
                                    </p>
                                </div>

                                {/* Filter Status */}
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
                                    {[
                                        { id: 'all', label: 'Semua' },
                                        { id: 'tersedia', label: 'Tersedia' },
                                        { id: 'akan_datang', label: 'Akan Datang' },
                                        { id: 'selesai', label: 'Selesai' },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setCbtFilter(tab.id)}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                                                cbtFilter === tab.id
                                                    ? 'bg-[#0E2747] text-white shadow-xs'
                                                    : 'bg-white text-[#6B7C93] border border-[#DCE7F3] hover:bg-[#EAF5FF]'
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Filter Kategori: Sesi | Ujian */}
                            <div className="flex items-center gap-2 border-b border-[#DCE7F3] pb-2">
                                <Filter className="w-3.5 h-3.5 text-[#0B63CE] shrink-0" />
                                <span className="text-[11px] font-bold text-[#0E2747] shrink-0">Kategori:</span>
                                <div className="flex items-center gap-1.5 overflow-x-auto">
                                    {[
                                        { id: 'all', label: 'Semua' },
                                        { id: 'sesi', label: 'Sesi' },
                                        { id: 'ujian', label: 'Ujian' },
                                    ].map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setCategoryFilter(cat.id)}
                                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all shrink-0 ${
                                                categoryFilter === cat.id
                                                    ? 'bg-[#0E2747] text-white shadow-2xs'
                                                    : 'bg-white text-[#6B7C93] border border-[#DCE7F3] hover:bg-[#EAF5FF]'
                                            }`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Filter Jenis Ujian */}
                            <div className="flex items-center gap-2 border-b border-[#DCE7F3] pb-2">
                                <span className="text-[11px] font-semibold text-[#6B7C93] shrink-0">Tipe:</span>
                                <div className="flex items-center gap-1.5 overflow-x-auto">
                                    {[
                                        { id: 'all', label: 'Semua Tipe' },
                                        { id: 'pre_test', label: 'Pre-Test' },
                                        { id: 'module_eval', label: 'Kuis Formatif' },
                                        { id: 'post_test', label: 'Post-Test' },
                                        { id: 'theory', label: 'Ujian Teori' },
                                    ].map((f) => (
                                        <button
                                            key={f.id}
                                            type="button"
                                            onClick={() => setUjianTypeFilter(f.id)}
                                            className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all shrink-0 ${
                                                ujianTypeFilter === f.id
                                                    ? 'bg-purple-700 text-white'
                                                    : 'bg-white text-[#6B7C93] border border-[#DCE7F3] hover:bg-purple-50 hover:text-purple-700'
                                            }`}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* List of Exams */}
                        {(() => {
                            const examsToDisplay = (myCbtExams && myCbtExams.length > 0 ? myCbtExams : cbtPackages)
                                .filter((pkg) => {
                                    const stateOk = cbtFilter === 'all'
                                        || (cbtFilter === 'tersedia' && pkg.exam_state === 'tersedia')
                                        || (cbtFilter === 'akan_datang' && pkg.exam_state === 'akan_datang')
                                        || (cbtFilter === 'selesai' && (pkg.has_attempt || pkg.exam_state === 'selesai'));
                                    const categoryOk = categoryFilter === 'all'
                                        || (categoryFilter === 'sesi' && (pkg.is_session_exam || pkg.exam_type === 'module_eval' || pkg.exam_type === 'kuis'))
                                        || (categoryFilter === 'ujian' && (!pkg.is_session_exam || ['pre_test', 'post_test', 'theory', 'remedial'].includes(pkg.exam_type)));
                                    const typeOk = ujianTypeFilter === 'all' || pkg.exam_type === ujianTypeFilter || (pkg.exam_type_label || '').toLowerCase().includes(ujianTypeFilter);
                                    return stateOk && categoryOk && typeOk;
                                });

                            if (examsToDisplay.length === 0) {
                                return (
                                    <div className="p-10 text-center bg-white rounded-2xl border border-[#DCE7F3] space-y-2">
                                        <Award className="w-8 h-8 text-[#6B7C93] mx-auto opacity-50" />
                                        <h5 className="font-bold text-sm text-[#0E2747]">Tidak Ada Ujian pada Filter Ini</h5>
                                        <p className="text-xs text-[#6B7C93]">
                                            Belum ada paket ujian yang dijadwalkan atau memenuhi filter yang dipilih.
                                        </p>
                                    </div>
                                );
                            }

                            return (
                                <div className="space-y-4">
                                    {examsToDisplay.map((pkg) => {
                                        const isAccessible = pkg.is_accessible !== undefined ? pkg.is_accessible : (pkg.attempts_count < pkg.attempts_allowed);
                                        const deniedReason = pkg.access_denied_reason;

                                        return (
                                            <div
                                                key={pkg.id}
                                                className="p-5 rounded-2xl bg-white border border-[#DCE7F3] shadow-xs space-y-4 hover:border-purple-300 transition-all"
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                                    <div className="space-y-1.5">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                                                {pkg.code}
                                                            </span>
                                                            <span className="text-xs font-medium text-[#6B7C93] bg-slate-100 px-2 py-0.5 rounded">
                                                                {pkg.exam_type_label || pkg.exam_type}
                                                            </span>
                                                            {/* State Badge */}
                                                            {pkg.exam_state === 'tersedia' && !pkg.has_attempt && (
                                                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 motion-safe:animate-pulse" />
                                                                    Sedang Tersedia
                                                                </span>
                                                            )}
                                                            {pkg.exam_state === 'akan_datang' && (
                                                                <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                                                    Akan Datang
                                                                </span>
                                                            )}
                                                            {pkg.exam_state === 'ditutup' && (
                                                                <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                                                    Ujian Ditutup
                                                                </span>
                                                            )}
                                                            {pkg.has_attempt && (
                                                                <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                                                    Sudah Dikerjakan
                                                                </span>
                                                            )}
                                                            {!isAccessible && (
                                                                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                                                                    <Lock className="w-3 h-3 text-slate-500" />
                                                                    Terkunci
                                                                </span>
                                                            )}
                                                        </div>

                                                        <h4 className="font-display font-bold text-base text-[#0E2747]">
                                                            {pkg.title}
                                                        </h4>
                                                        {pkg.description && (
                                                            <p className="text-xs text-[#6B7C93] line-clamp-2">
                                                                {pkg.description}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="text-left sm:text-right text-xs text-[#6B7C93] shrink-0 font-mono space-y-0.5">
                                                        <div>Durasi: <strong className="text-[#0E2747]">{pkg.duration_minutes} Menit</strong></div>
                                                        <div className="text-[11px]">Standar Kelulusan (KKM): <strong className="text-purple-700">{pkg.passing_score}</strong></div>
                                                    </div>
                                                </div>

                                                {/* Access Denied Warning Banner if locked */}
                                                {!isAccessible && deniedReason && (
                                                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                                                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                                        <div>
                                                            <span className="font-bold block">{pkg.has_attempt ? 'Status Ujian:' : 'Ujian Belum Dapat Diakses:'}</span>
                                                            <span>{deniedReason}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Bottom bar with attempts & CTA */}
                                                <div className="pt-3 border-t border-[#DCE7F3] flex flex-wrap items-center justify-between gap-3 text-xs">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[#6B7C93]">
                                                            Percobaan: <strong className="text-[#0E2747]">{pkg.attempts_count || 0}</strong> dari {pkg.attempts_allowed || 1} kali
                                                        </span>

                                                        {pkg.has_attempt && pkg.last_score !== null && (
                                                            <div className="flex items-center gap-2 pl-3 border-l border-[#DCE7F3]">
                                                                <span className="font-bold text-[#0E2747]">
                                                                    Nilai: <span className="text-purple-700 font-mono text-sm">{pkg.last_score}</span>
                                                                </span>
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                                    pkg.is_passed
                                                                        ? 'bg-emerald-100 text-emerald-800'
                                                                        : 'bg-rose-100 text-rose-800'
                                                                }`}>
                                                                    {pkg.is_passed ? 'Lulus' : 'Belum Memenuhi'}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {pkg.attempt_status === 'waiting_review' && (
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                                                Menunggu Penilaian Esai
                                                            </span>
                                                        )}
                                                    </div>

                                                    {isAccessible ? (
                                                        <Link
                                                            href={pkg.exam_url || `/event/${event.slug}/cbt/${pkg.code}`}
                                                            className="inline-flex min-h-11 items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0B63CE] text-white font-bold text-xs hover:bg-[#0A3F82] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                                                        >
                                                            <PlayCircle className="w-4 h-4" />
                                                            <span>{pkg.has_attempt ? 'Ujian Ulang' : 'Mulai Ujian'}</span>
                                                        </Link>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            disabled
                                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-500 font-semibold text-xs cursor-not-allowed border border-slate-200"
                                                        >
                                                            <Lock className="w-3.5 h-3.5" />
                                                            <span>{pkg.has_attempt ? 'Ujian Selesai (Terkunci)' : 'Ujian Terkunci'}</span>
                                                        </button>
                                                    )}
                                                </div>
                                                {pkg.revision_attempt_id && pkg.revision_method === 'paper' && <RevisionPaperForm package={pkg} />}
                                                {pkg.revision_attempt_id && pkg.revision_method === 'retry' && <p className="border-t border-[#DCE7F3] pt-3 text-sm text-[#6B7C93]">Nilai di bawah KKM. Anda dapat mengulang ujian selama kesempatan masih tersedia.</p>}

                                                {/* Riwayat Percobaan Ujian */}
                                                {pkg.attempt_history && pkg.attempt_history.length > 0 && (
                                                    <div className="border-t border-[#DCE7F3] pt-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => setExpandedHistoryId(expandedHistoryId === pkg.id ? null : pkg.id)}
                                                            className="flex items-center gap-1.5 text-xs font-semibold text-[#6B7C93] hover:text-[#0E2747] transition-colors"
                                                        >
                                                            <History className="w-3.5 h-3.5" />
                                                            Riwayat Percobaan ({pkg.attempt_history.length})
                                                            {expandedHistoryId === pkg.id
                                                                ? <ChevronUp className="w-3.5 h-3.5" />
                                                                : <ChevronDown className="w-3.5 h-3.5" />
                                                            }
                                                        </button>
                                                        {expandedHistoryId === pkg.id && (
                                                            <div className="mt-2 rounded-xl border border-[#DCE7F3] overflow-hidden">
                                                                <table className="w-full text-[11px]">
                                                                    <thead className="bg-[#F0F6FF]">
                                                                        <tr>
                                                                            <th className="px-3 py-2 text-left font-bold text-[#0E2747]">#</th>
                                                                            <th className="px-3 py-2 text-left font-bold text-[#0E2747]">Nilai</th>
                                                                            <th className="px-3 py-2 text-left font-bold text-[#0E2747]">Status</th>
                                                                            <th className="px-3 py-2 text-left font-bold text-[#0E2747] hidden sm:table-cell">Selesai</th>
                                                                            <th className="px-3 py-2 text-left font-bold text-[#0E2747] hidden sm:table-cell">Durasi</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-[#DCE7F3]/60">
                                                                        {pkg.attempt_history.map((att) => (
                                                                            <tr key={att.attempt_number} className="hover:bg-[#F8FBFF]">
                                                                                <td className="px-3 py-2 font-mono font-bold text-[#6B7C93]">P-{att.attempt_number}</td>
                                                                                <td className="px-3 py-2">
                                                                                    {att.score !== null
                                                                                        ? <span className="font-mono font-bold text-purple-700">{att.score}</span>
                                                                                        : <span className="text-[#6B7C93]">—</span>
                                                                                    }
                                                                                </td>
                                                                                <td className="px-3 py-2">
                                                                                    {att.is_passed === true && <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Lulus</span>}
                                                                                    {att.is_passed === false && <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">Belum</span>}
                                                                                    {att.is_passed === null && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">Review</span>}
                                                                                </td>
                                                                                <td className="px-3 py-2 text-[#6B7C93] hidden sm:table-cell">{att.finished_at || '—'}</td>
                                                                                <td className="px-3 py-2 text-[#6B7C93] hidden sm:table-cell">
                                                                                    {att.duration_seconds
                                                                                        ? `${Math.floor(att.duration_seconds / 60)}m ${att.duration_seconds % 60}s`
                                                                                        : '—'
                                                                                    }
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </div>
                )}

                {/* 6.5. TAB NILAI: CBT GRADE HISTORY & TRANSCRIPT */}
                {activeTab === 'nilai' && (
                    <div className="space-y-6">
                        {/* Header & Quick Action */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#DCE7F3] shadow-xs">
                            <div>
                                <h3 className="font-display font-bold text-lg text-[#0E2747] flex items-center gap-2">
                                    <Award className="w-5 h-5 text-[#0B63CE]" />
                                    Riwayat Nilai & Hasil Ujian
                                </h3>
                                <p className="text-xs text-[#6B7C93] mt-1">
                                    Transkrip evaluasi CBT dan capaian kompetensi penataran untuk jalur <span className="font-semibold text-[#0E2747]">{participant.track_name} ({participant.track_code})</span>.
                                </p>
                            </div>
                            {transcript?.download_url && (
                                <a
                                    href={transcript.download_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-lg bg-[#0E2747] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0B63CE] transition shadow-xs shrink-0"
                                >
                                    <FileText className="w-3.5 h-3.5 text-[#EE9B25]" />
                                    <span>Unduh E-Transkrip Resmi</span>
                                </a>
                            )}
                        </div>

                        {/* 4 Summary Metric Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            {/* Card 1: Rata-Rata Nilai */}
                            <div className="bg-white p-4 rounded-xl border border-[#DCE7F3] shadow-2xs flex flex-col justify-between">
                                <div className="flex items-center justify-between text-[#6B7C93] text-xs font-medium mb-2">
                                    <span>Rata-Rata Nilai</span>
                                    <TrendingUp className="w-4 h-4 text-[#0B63CE]" />
                                </div>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-2xl sm:text-3xl font-extrabold font-display text-[#0E2747]">
                                        {gradeSummary?.average_score !== null && gradeSummary?.average_score !== undefined
                                            ? Number(gradeSummary.average_score).toFixed(1)
                                            : '-'}
                                    </span>
                                    <span className="text-xs text-[#6B7C93]">/ 100</span>
                                </div>
                                <div className="mt-2 text-[11px] text-[#6B7C93] flex items-center gap-1">
                                    <span>Standar KKM:</span>
                                    <span className="font-bold text-[#0E2747]">≥ 75.0</span>
                                </div>
                            </div>

                            {/* Card 2: Ujian Selesai */}
                            <div className="bg-white p-4 rounded-xl border border-[#DCE7F3] shadow-2xs flex flex-col justify-between">
                                <div className="flex items-center justify-between text-[#6B7C93] text-xs font-medium mb-2">
                                    <span>Ujian Selesai</span>
                                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-2xl sm:text-3xl font-extrabold font-display text-emerald-700">
                                        {gradeSummary?.completed_count ?? 0}
                                    </span>
                                    <span className="text-xs text-[#6B7C93]">
                                        dari {myCbtExams?.length || 0} Ujian
                                    </span>
                                </div>
                                <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${myCbtExams?.length ? Math.min(100, Math.round(((gradeSummary?.completed_count ?? 0) / myCbtExams.length) * 100)) : 0}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Card 3: Kelulusan CBT */}
                            <div className="bg-white p-4 rounded-xl border border-[#DCE7F3] shadow-2xs flex flex-col justify-between">
                                <div className="flex items-center justify-between text-[#6B7C93] text-xs font-medium mb-2">
                                    <span>Kelulusan CBT</span>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl sm:text-3xl font-extrabold font-display text-emerald-600">
                                        {gradeSummary?.passed_count ?? 0}
                                    </span>
                                    <span className="text-xs text-emerald-700 font-semibold">Lulus</span>
                                    {(gradeSummary?.failed_count ?? 0) > 0 && (
                                        <span className="text-xs text-rose-600 font-semibold">
                                            • {gradeSummary.failed_count} Perlu Revisi
                                        </span>
                                    )}
                                </div>
                                <div className="mt-2 text-[11px] text-[#6B7C93]">
                                    {(gradeSummary?.completed_count ?? 0) === 0
                                        ? 'Belum ada ujian diselesaikan'
                                        : (gradeSummary?.failed_count ?? 0) === 0
                                            ? 'Semua ujian lulus standar KKM'
                                            : 'Terdapat ujian yang perlu remedial/revisi'}
                                </div>
                            </div>

                            {/* Card 4: Dokumen & Status */}
                            <div className="bg-white p-4 rounded-xl border border-[#DCE7F3] shadow-2xs flex flex-col justify-between">
                                <div className="flex items-center justify-between text-[#6B7C93] text-xs font-medium mb-2">
                                    <span>Kelengkapan Berkas</span>
                                    <Shield className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        {certificate?.download_url ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                                <CheckCircle2 className="w-3 h-3" /> E-Sertifikat Terbit
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                                <Clock className="w-3 h-3" /> Menunggu Sidang
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('sertifikat')}
                                    className="mt-2 text-[11px] font-bold text-[#0B63CE] hover:underline text-left"
                                >
                                    Lihat Dokumen Kelulusan →
                                </button>
                            </div>
                        </div>

                        {/* Detailed Grades List */}
                        <div className="bg-white rounded-2xl border border-[#DCE7F3] shadow-xs overflow-hidden">
                            <div className="p-4 sm:p-5 border-b border-[#DCE7F3] bg-[#F8FBFF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <History className="w-4 h-4 text-[#0B63CE]" />
                                    <h4 className="font-display font-bold text-sm text-[#0E2747]">
                                        Rincian Nilai per Paket Ujian
                                    </h4>
                                </div>
                                <span className="text-xs text-[#6B7C93] font-mono">
                                    {myCbtExams?.length || 0} Paket Terdaftar di Jalur Anda
                                </span>
                            </div>

                            {(!myCbtExams || myCbtExams.length === 0) ? (
                                <div className="p-10 text-center">
                                    <Award className="w-12 h-12 text-[#CBD5E1] mx-auto mb-3" />
                                    <h5 className="font-display font-bold text-sm text-[#0E2747]">
                                        Tidak Ada Paket Ujian Terdaftar
                                    </h5>
                                    <p className="text-xs text-[#6B7C93] mt-1 max-w-md mx-auto">
                                        Belum ada paket CBT yang dikonfigurasi untuk jalur peserta Anda pada event ini.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-[#E2E8F0]">
                                    {myCbtExams.map((exam) => {
                                        const hasCompleted = exam.has_attempt && exam.exam_state === 'selesai';
                                        const scoreVal = exam.last_score !== null && exam.last_score !== undefined ? Number(exam.last_score) : null;
                                        const isPassed = exam.is_passed;
                                        const attempts = exam.attempt_history || [];
                                        const isExpanded = expandedHistoryId === exam.id;

                                        return (
                                            <div key={exam.id} className="p-4 sm:p-5 hover:bg-[#F8FBFF]/60 transition-colors">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    {/* Left: Info Ujian */}
                                                    <div className="space-y-1.5 flex-1 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-[#EAF5FF] text-[#0B63CE] border border-[#CBDDF2]">
                                                                {exam.code}
                                                            </span>
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-[#475569]">
                                                                {exam.exam_type_label || exam.exam_type}
                                                            </span>
                                                            {hasCompleted ? (
                                                                isPassed ? (
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                                        LULUS
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                                                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                                                        BELUM LULUS
                                                                    </span>
                                                                )
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                                    BELUM DIKERJAKAN
                                                                </span>
                                                            )}
                                                        </div>

                                                        <h5 className="font-display font-bold text-sm sm:text-base text-[#0E2747] leading-snug">
                                                            {exam.title}
                                                        </h5>

                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6B7C93]">
                                                            <span>Passing Score (KKM): <strong className="text-[#0E2747]">{exam.passing_score}</strong></span>
                                                            <span>•</span>
                                                            <span>Batas Percobaan: <strong className="text-[#0E2747]">{exam.attempts_allowed || 1}x</strong></span>
                                                            {exam.last_attempt_at && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>Selesai: <strong className="text-[#0E2747]">{exam.last_attempt_at} WIB</strong></span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Right: Nilai & CTA Action */}
                                                    <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                                                        <div className="text-right">
                                                            <div className="text-[11px] text-[#6B7C93] font-medium">Nilai Akhir</div>
                                                            <div className="flex items-baseline justify-end gap-1">
                                                                <span className={`text-2xl sm:text-3xl font-extrabold font-display ${
                                                                    hasCompleted
                                                                        ? isPassed
                                                                            ? 'text-emerald-700'
                                                                            : 'text-rose-600'
                                                                        : 'text-slate-400'
                                                                }`}>
                                                                    {scoreVal !== null ? scoreVal.toFixed(1) : '-'}
                                                                </span>
                                                                <span className="text-xs text-[#94A3B8]">/ 100</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col items-end gap-1.5">
                                                            {hasCompleted ? (
                                                                attempts.length > 0 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setExpandedHistoryId(isExpanded ? null : exam.id)}
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#DCE7F3] text-[#0E2747] hover:bg-[#F1F5F9] transition shadow-2xs"
                                                                    >
                                                                        <span>Riwayat ({attempts.length})</span>
                                                                        {isExpanded ? (
                                                                            <ChevronUp className="w-3.5 h-3.5 text-[#6B7C93]" />
                                                                        ) : (
                                                                            <ChevronDown className="w-3.5 h-3.5 text-[#6B7C93]" />
                                                                        )}
                                                                    </button>
                                                                )
                                                            ) : (
                                                                exam.is_accessible ? (
                                                                    <Link
                                                                        href={exam.exam_url}
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0B63CE] text-white hover:bg-[#0A3F82] transition shadow-xs"
                                                                    >
                                                                        <span>Kerjakan Ujian</span>
                                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                                    </Link>
                                                                ) : (
                                                                    <span className="text-[11px] text-slate-400 italic">
                                                                        Ujian Terkunci
                                                                    </span>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Accordion: Riwayat Attempt Tiap Percobaan */}
                                                {isExpanded && attempts.length > 0 && (
                                                    <div className="mt-4 pt-3 border-t border-dashed border-slate-200">
                                                        <div className="bg-[#F8FBFF] rounded-xl p-3 border border-[#DCE7F3]">
                                                            <h6 className="text-xs font-bold text-[#0E2747] mb-2 flex items-center gap-1.5">
                                                                <History className="w-3.5 h-3.5 text-[#0B63CE]" />
                                                                <span>Log Percobaan Pengerjaan:</span>
                                                            </h6>
                                                            <div className="overflow-x-auto">
                                                                <table className="w-full text-left text-xs">
                                                                    <thead>
                                                                        <tr className="border-b border-[#CBDDF2] text-[#6B7C93] text-[11px]">
                                                                            <th className="pb-1.5 font-semibold">Percobaan</th>
                                                                            <th className="pb-1.5 font-semibold">Waktu Selesai</th>
                                                                            <th className="pb-1.5 font-semibold">Durasi</th>
                                                                            <th className="pb-1.5 font-semibold text-right">Skor Nilai</th>
                                                                            <th className="pb-1.5 font-semibold text-right">Hasil</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-slate-100">
                                                                        {attempts.map((att, idx) => {
                                                                            const durMins = att.duration_seconds
                                                                                ? `${Math.round(att.duration_seconds / 60)} menit`
                                                                                : '-';
                                                                            return (
                                                                                <tr key={att.attempt_id || idx} className="hover:bg-white/80">
                                                                                    <td className="py-2 font-bold text-[#0E2747]">
                                                                                        Ke-{att.attempt_number || (attempts.length - idx)}
                                                                                    </td>
                                                                                    <td className="py-2 text-[#475569]">
                                                                                        {att.finished_at || '-'}
                                                                                    </td>
                                                                                    <td className="py-2 text-[#64748B]">
                                                                                        {durMins}
                                                                                    </td>
                                                                                    <td className="py-2 font-mono font-bold text-right text-base text-[#0E2747]">
                                                                                        {att.score !== null ? Number(att.score).toFixed(1) : '-'}
                                                                                    </td>
                                                                                    <td className="py-2 text-right">
                                                                                        {att.is_passed ? (
                                                                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                                                                <Check className="w-3 h-3 text-emerald-600" />
                                                                                                Lulus
                                                                                            </span>
                                                                                        ) : (
                                                                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                                                                                <AlertCircle className="w-3 h-3 text-rose-600" />
                                                                                                Belum Lulus
                                                                                            </span>
                                                                                        )}
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        })}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'sertifikat' && (
                    <section aria-labelledby="certificate-title" className="border border-[#DCE7F3] bg-white p-6 sm:p-8">
                        <h2 id="certificate-title" className="font-display text-2xl font-semibold text-[#0A3F82]">Dokumen Kelulusan</h2>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7C93]">E-Sertifikat, E-Transkrip, dan Pakta Integritas resmi PB PERKEMI setelah proses penataran selesai.</p>
                        <div className="mt-5 grid gap-4 md:grid-cols-3">
                            <LearningDocument title="E-Sertifikat" document={certificate} />
                            <LearningDocument title="E-Transkrip" document={transcript} />
                            <section aria-label="Pakta Integritas" className="flex min-h-44 flex-col justify-between border border-[#DCE7F3] bg-[#F8FBFF] p-5">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Shield className="size-4 text-[#0B63CE]" aria-hidden="true" />
                                        <h3 className="text-sm font-semibold text-[#0E2747]">Pakta Integritas</h3>
                                    </div>
                                    <div className="mt-3 space-y-1.5 text-sm leading-snug text-[#6B7C93]">
                                        <p className="text-xs font-medium text-[#112743]">
                                            {integrityPact?.title || 'Pakta Integritas PB PERKEMI'}
                                        </p>
                                        {integrityPact?.has_signed ? (
                                            <p className="text-xs text-emerald-700 flex items-center gap-1 font-semibold">
                                                <CheckCircle2 className="size-3.5 shrink-0" />
                                                Ditandatangani Digital
                                            </p>
                                        ) : (
                                            <p className="text-xs text-amber-700">
                                                Wajib ditandatangani digital untuk kelengkapan administrasi dan legalitas lisensi.
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-col gap-2">
                                    <Link
                                        href={`/event/${event.slug}/pakta-integritas`}
                                        className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#0B63CE] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0A3F82] transition"
                                    >
                                        {integrityPact?.has_signed ? 'Perbarui Tanda Tangan' : 'Tandatangani Digital'}
                                    </Link>
                                    {integrityPact?.has_signed && (
                                        <a
                                            href={`/event/${event.slug}/pakta-integritas/cetak`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#DCE7F3] bg-white px-4 py-2 text-xs font-semibold text-[#0E2747] hover:bg-slate-50 transition"
                                        >
                                            Lihat & Cetak Dokumen Resmi
                                        </a>
                                    )}
                                </div>
                            </section>
                        </div>
                    </section>
                )}

                {/* 7. TAB ABSENSI: ATTENDANCE HISTORY */}
                {activeTab === 'absensi' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-display font-bold text-sm text-[#0E2747]">
                                Riwayat Presensi Sesi Penataran
                            </h3>
                            <span className="text-xs font-mono text-[#0B63CE] font-bold">
                                {attendanceRecords.length} Sesi Tercatat
                            </span>
                        </div>

                        <div className="bg-white rounded-2xl border border-[#DCE7F3] shadow-xs overflow-hidden">
                            {attendanceRecords.length === 0 ? (
                                <div className="p-8 text-center text-xs text-[#6B7C93]">
                                    Belum ada catatan kehadiran sesi. Silakan scan QR code saat sesi rundown dibuka.
                                </div>
                            ) : (
                                <div className="divide-y divide-[#DCE7F3]/60">
                                    {attendanceRecords.map((att) => (
                                        <div key={att.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                                            <div className="space-y-0.5">
                                                <div className="font-bold text-[#0E2747]">
                                                    {att.session_name}
                                                </div>
                                                <div className="text-[11px] text-[#6B7C93]">
                                                    {att.time} • Metode: {att.method === 'qr_scan' ? 'Scan QR' : att.method === 'portal_direct' ? 'Absen Langsung (Portal)' : 'Kode Manual'}
                                                </div>
                                            </div>

                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${att.status_badge}`}>
                                                {att.status_label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Bottom Footer */}
            <footer className="bg-white border-t border-[#DCE7F3] py-6 text-center text-xs text-[#6B7C93] font-mono">
                <p>Pustaka Penataran • Persaudaraan Bela Diri Kempo Indonesia (PB PERKEMI) © {new Date().getFullYear()}</p>
            </footer>
        </div>
    );
}

function LearningDocument({ title, document }) {
    return (
        <section aria-label={title} className="flex min-h-44 flex-col justify-between border border-[#DCE7F3] bg-[#F8FBFF] p-5">
            <div>
                <div className="flex items-center gap-2">
                    <FileText className="size-4 text-[#0B63CE]" aria-hidden="true" />
                    <h3 className="text-sm font-semibold text-[#0E2747]">{title}</h3>
                </div>
                {document?.download_url ? (
                    <div className="mt-3 space-y-1 text-sm leading-6 text-[#6B7C93]">
                        <p>{document.number ? `Nomor ${document.number}` : 'Nomor belum dicatat'}</p>
                        {document.issued_at && <p>Diterbitkan {document.issued_at}</p>}
                    </div>
                ) : (
                    <p className="mt-3 text-sm leading-6 text-[#6B7C93]">Belum tersedia. Penyelenggara akan menerbitkan berkas setelah proses penilaian selesai.</p>
                )}
            </div>
            {document?.download_url && (
                <a href={document.download_url} className="mt-4 inline-flex min-h-11 items-center justify-center bg-[#0B63CE] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0A3F82] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]">
                    Unduh {title} PDF
                </a>
            )}
        </section>
    );
}

function RevisionPaperForm({ package: examPackage }) {
    const form = useForm({ paper: null });
    const canUpload = examPackage.revision_open && !['pending', 'accepted'].includes(examPackage.revision_status);

    const submit = (event) => {
        event.preventDefault();
        form.post(examPackage.revision_upload_url, { forceFormData: true, onSuccess: () => form.reset() });
    };

    return (
        <form onSubmit={submit} className="border-t border-[#DCE7F3] pt-4">
            <h5 className="text-sm font-bold text-[#0E2747]">Revisi makalah PDF</h5>
            {examPackage.revision_deadline && <p className="mt-1 text-xs text-[#6B7C93]">Batas unggah: {examPackage.revision_deadline}</p>}
            {examPackage.revision_status && <p className="mt-1 text-xs font-semibold text-[#0A3F82]">Status: {examPackage.revision_status === 'accepted' ? 'Diterima' : examPackage.revision_status === 'rejected' ? 'Perlu perbaikan' : 'Menunggu pemeriksaan'}</p>}
            {examPackage.revision_reader_url && <Link href={examPackage.revision_reader_url} className="mt-3 inline-flex min-h-11 items-center border border-[#0B63CE] px-4 text-sm font-semibold text-[#0A3F82] hover:bg-[#EAF5FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE]">Baca makalah sebagai flipbook</Link>}
            {canUpload && (
                <div className="mt-3 flex flex-wrap items-end gap-3">
                    <label className="block text-sm font-medium text-[#112743]">Pilih makalah PDF, maksimal 10 MB
                        <input type="file" accept="application/pdf" required onChange={(event) => form.setData('paper', event.target.files[0] || null)} className="mt-1 block w-full max-w-xs text-sm file:mr-3 file:min-h-11 file:border file:border-[#DCE7F3] file:bg-white file:px-3 file:text-[#0B63CE] focus-visible:outline-2 focus-visible:outline-[#0B63CE]" />
                    </label>
                    <button type="submit" disabled={form.processing || !form.data.paper} className="min-h-11 bg-[#0B63CE] px-4 text-sm font-semibold text-white hover:bg-[#0A3F82] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] disabled:cursor-not-allowed disabled:opacity-50">{form.processing ? 'Mengunggah…' : 'Kirim revisi'}</button>
                </div>
            )}
            {form.errors.paper && <p role="alert" className="mt-2 text-sm text-[#B42352]">{form.errors.paper}</p>}
            {!examPackage.revision_open && <p className="mt-2 text-sm text-[#6B7C93]">Batas unggah revisi telah berakhir.</p>}
        </form>
    );
}

function ModuleResourceLink({ module }) {
    if (!module.resource_url) {
        return <span className="text-xs text-[#6B7C93]">{module.resource_locked ? 'Scan QR sesi untuk membuka materi' : 'Materi belum tersedia'}</span>;
    }

    const label = module.source_type === 'video' ? 'Tonton video' : module.source_type === 'uploaded_pdf' ? 'Buka PDF' : 'Buka materi';
    const className = 'inline-flex min-h-11 items-center justify-center bg-[#0B63CE] px-4 text-xs font-semibold text-white hover:bg-[#0A3F82] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]';

    return module.source_type === 'collection'
        ? <Link href={module.resource_url} className={className}>{label}</Link>
        : <a href={module.resource_url} target="_blank" rel="noopener noreferrer" className={className}>{label}</a>;
}
