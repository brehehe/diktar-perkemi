import React, { useState, useEffect } from 'react';
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
    User,
    Mail,
    Phone,
    Upload,
    Trash2,
    Printer,
    Info,
    Save,
} from 'lucide-react';
import Button from '../../Components/ui/Button';
import Badge from '../../Components/ui/Badge';
import Toast from '../../Components/ui/Toast';

import { LearningRoomContext } from './Partials/LearningRoomContext';
import LearningOverviewTab from './Partials/LearningOverviewTab';
import LearningScheduleTab from './Partials/LearningScheduleTab';
import LearningMaterialsTab from './Partials/LearningMaterialsTab';
import LearningExamsTab from './Partials/LearningExamsTab';
import LearningGradesTab from './Partials/LearningGradesTab';
import LearningCertificatesTab from './Partials/LearningCertificatesTab';
import LearningAttendanceTab from './Partials/LearningAttendanceTab';
import LearningProfileTab from './Partials/LearningProfileTab';

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

    // Profile form state for self-updating profile
    const profileForm = useForm({
        name: participant?.name || '',
        kenshi_id: participant?.kenshi_id || participant?.kenshi_id_number || '',
        phone: participant?.phone || '',
        origin: participant?.origin || participant?.origin_province || '',
        dojo: participant?.dojo || participant?.origin_dojo || '',
        dan_level: participant?.dan_level || (participant?.dan_rank ? parseInt(participant.dan_rank) : 1),
        birth_place: participant?.birth_place || '',
        birth_date: participant?.birth_date || '',
        gender: participant?.gender || 'Laki-laki',
        address: participant?.address || '',
        occupation: participant?.occupation || '',
        photo: null,
        remove_photo: false,
    });
    const [photoPreview, setPhotoPreview] = useState(participant?.photo_url || null);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileSuccessMsg, setProfileSuccessMsg] = useState(null);

    useEffect(() => {
        if (participant) {
            profileForm.setData((prev) => ({
                ...prev,
                name: participant.name || prev.name,
                kenshi_id: participant.kenshi_id || participant.kenshi_id_number || prev.kenshi_id,
                phone: participant.phone || prev.phone,
                origin: participant.origin || participant.origin_province || prev.origin,
                dojo: participant.dojo || participant.origin_dojo || prev.dojo,
                dan_level: participant.dan_level || prev.dan_level,
                birth_place: participant.birth_place || prev.birth_place,
                birth_date: participant.birth_date || prev.birth_date,
                gender: participant.gender || prev.gender,
                address: participant.address || prev.address,
                occupation: participant.occupation || prev.occupation,
            }));
            if (!profileForm.data.photo) {
                setPhotoPreview(participant.photo_url || null);
            }
        }
    }, [participant?.photo_url, participant?.name, participant?.phone]);

    const handleProfilePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            profileForm.setData((prev) => ({ ...prev, photo: file, remove_photo: false }));
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveProfilePhoto = () => {
        profileForm.setData((prev) => ({ ...prev, photo: null, remove_photo: true }));
        setPhotoPreview(null);
    };

    const handleSubmitProfile = (e) => {
        e.preventDefault();
        setIsSavingProfile(true);
        profileForm.post(`/event/${event.slug}/profil`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsSavingProfile(false);
                setProfileSuccessMsg('Profil kenshi Anda berhasil diperbarui!');
                setTimeout(() => setProfileSuccessMsg(null), 4000);
            },
            onError: () => {
                setIsSavingProfile(false);
            },
        });
    };

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

    const learningRoom = {
        event,
        participant,
        modules,
        cbtPackages,
        myLearningModules,
        myCbtExams,
        attendanceRecords,
        certificate,
        transcript,
        integrityPact,
        gradeSummary,
        availableDays,
        setActiveTab,
        selectedDay,
        setSelectedDay,
        expandedSessionId,
        setExpandedSessionId,
        cbtFilter,
        setCbtFilter,
        categoryFilter,
        setCategoryFilter,
        ujianTypeFilter,
        setUjianTypeFilter,
        expandedHistoryId,
        setExpandedHistoryId,
        processingSessionId,
        profileForm,
        photoPreview,
        isSavingProfile,
        profileSuccessMsg,
        setProfileSuccessMsg,
        handleProfilePhotoChange,
        handleRemoveProfilePhoto,
        handleSubmitProfile,
        handleDirectAttendance,
        daySessions,
    };

    return (
        <LearningRoomContext.Provider value={learningRoom}>
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
                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                        <Link
                            href="/event-saya"
                            aria-label="Kembali ke Event Saya"
                            className="inline-flex min-h-10 sm:min-h-11 items-center justify-center gap-1.5 rounded-lg border border-[#DCE7F3] bg-white px-2.5 py-2 text-xs font-semibold text-[#6B7C93] shadow-xs transition-colors hover:border-[#0B63CE] hover:text-[#0B63CE] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] motion-reduce:transition-none"
                            title="Kembali ke Daftar Event Saya"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span className="text-[11px] hidden md:inline">Event Saya</span>
                        </Link>

                        <a
                            href={`/event/${event.slug}/id-card`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Cetak ID Card Peserta"
                            className="inline-flex min-h-10 sm:min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-[#DCE7F3] bg-white px-2.5 py-2 text-xs font-semibold text-[#0E2747] shadow-xs transition-colors hover:border-[#0B63CE] hover:text-[#0B63CE] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] motion-reduce:transition-none"
                            title="Buka / Cetak Kartu Tanda Peserta (ID Card)"
                        >
                            <CreditCard className="w-3.5 h-3.5 text-[#0B63CE]" />
                            <span className="hidden sm:inline text-[11px]">ID Card</span>
                        </a>

                        <Link
                            href={`/event/${event.slug}/scan`}
                            aria-label="Pindai QR absensi"
                            className="inline-flex min-h-10 sm:min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-[#0B63CE] px-2.5 sm:px-3 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#0A3F82] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] motion-reduce:transition-none"
                        >
                            <Camera className="w-3.5 h-3.5" />
                            <span className="hidden xs:inline text-[11px]">Scan Absensi</span>
                        </Link>

                        <Link
                            href={`/event/${event.slug}/welcome`}
                            aria-label="Buka sambutan event"
                            className="inline-flex min-h-10 sm:min-h-11 items-center justify-center rounded-lg border border-[#DCE7F3] p-2 text-[#6B7C93] transition-colors hover:text-[#0B63CE] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] motion-reduce:transition-none"
                            title="Buka Animasi Buku 3D"
                        >
                            <Sparkles className="w-4 h-4 text-[#EE9B25]" />
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
                        <button
                            type="button"
                            onClick={() => setActiveTab('informasi')}
                            aria-pressed={activeTab === 'informasi'}
                            className={`min-h-11 rounded-md px-3 py-1 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] ${
                                activeTab === 'informasi'
                                    ? 'bg-[#0E2747] text-white shadow-xs'
                                    : 'text-[#6B7C93] hover:text-[#0E2747]'
                            }`}
                        >
                            Informasi & Profil
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
                        <div className="p-3 sm:p-3.5 rounded-xl bg-white border border-[#DCE7F3] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div className="truncate">
                                    <span className="text-[#6B7C93] block text-[11px]">Kelengkapan Administrasi Peserta</span>
                                    <span className="font-semibold text-[#0E2747]">
                                        Formulir Penataran: <strong className="text-emerald-700 font-bold">{participant.registration_form_status === 'verified' ? 'Terverifikasi PB PERKEMI' : 'Sudah Dikirim (Menunggu Verifikasi)'}</strong>
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                <Link
                                    href={`/event/${event.slug}/formulir-pendaftaran`}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#DCE7F3] bg-white text-xs font-semibold text-[#0B63CE] hover:bg-[#EAF5FF] transition-colors"
                                >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Lihat Formulir</span>
                                </Link>
                                <a
                                    href={`/event/${event.slug}/formulir-pendaftaran/cetak`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#DCE7F3] bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Cetak PB PERKEMI</span>
                                </a>
                                <a
                                    href={`/event/${event.slug}/id-card`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0B63CE] text-xs font-semibold text-white hover:bg-[#0A3F82] shadow-2xs transition-colors"
                                >
                                    <CreditCard className="w-3.5 h-3.5" />
                                    <span>Cetak ID Card</span>
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
                {activeTab === 'beranda' && <LearningOverviewTab />}

                {/* 4. TAB RUNDOWN: DAILY TIMELINE ACCORDION */}
                {activeTab === 'rundown' && <LearningScheduleTab />}

                {/* 5. TAB MATERI: MODUL PEMBELAJARAN SAYA */}
                {activeTab === 'materi' && <LearningMaterialsTab />}

                {/* 6. TAB CBT: UJIAN SAYA */}
                {activeTab === 'ujian' && <LearningExamsTab />}

                {/* 6.5. TAB NILAI: CBT GRADE HISTORY & TRANSCRIPT */}
                {activeTab === 'nilai' && <LearningGradesTab />}

                {activeTab === 'sertifikat' && <LearningCertificatesTab />}

                {/* 7. TAB ABSENSI: ATTENDANCE HISTORY */}
                {activeTab === 'absensi' && <LearningAttendanceTab />}

                {/* 8. TAB INFORMASI & PROFIL */}
                {activeTab === 'informasi' && <LearningProfileTab />}
            </main>

            {/* Bottom Footer */}
            <footer className="bg-white border-t border-[#DCE7F3] py-6 text-center text-xs text-[#6B7C93] font-mono">
                <p>Pustaka Penataran • Persaudaraan Bela Diri Kempo Indonesia (PB PERKEMI) © {new Date().getFullYear()}</p>
            </footer>
        </div>
        </LearningRoomContext.Provider>
    );
}
