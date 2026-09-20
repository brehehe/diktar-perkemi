import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Clock,
    CheckCircle2,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Send,
    HelpCircle,
    List,
    Shield,
    Check,
    Camera,
    CameraOff,
    ShieldAlert,
    Maximize2,
} from 'lucide-react';
import Button from '../../Components/ui/Button';
import Modal from '../../Components/ui/Modal';

const normalizeSeconds = (value) => Math.max(0, Math.floor(Number(value) || 0));

export default function CbtExam({ event, participant, package: pkg, attempt, questions = [] }) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState(attempt.answers || {});
    const initialRemainingSeconds = normalizeSeconds(attempt.remaining_seconds ?? (pkg.duration_minutes * 60));
    const [remainingSeconds, setRemainingSeconds] = useState(initialRemainingSeconds);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(() => typeof document !== 'undefined' && Boolean(document.fullscreenElement));
    const [cameraStatus, setCameraStatus] = useState('requesting');
    const [incidentCount, setIncidentCount] = useState(attempt.proctoring_events_count || 0);
    const [lastIncident, setLastIncident] = useState(null);
    const videoRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const answersRef = useRef(attempt.answers || {});
    const isSubmittingRef = useRef(false);
    const hasAutoSubmittedRef = useRef(false);
    const monitoringReadyRef = useRef(false);
    const hasEnteredFullscreenRef = useRef(typeof document !== 'undefined' && Boolean(document.fullscreenElement));
    const deadlineMsRef = useRef(Date.now() + (initialRemainingSeconds * 1000));
    const questionCardRef = useRef(null);
    const activeNavButtonRef = useRef(null);

    useEffect(() => {
        answersRef.current = answers;
    }, [answers]);

    const recordProctoringEvent = useCallback(async (type, metadata = {}) => {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        try {
            const response = await fetch(`/event/${event.slug}/cbt/${pkg.code}/pengawasan`, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({ type, metadata }),
            });

            if (response.ok) {
                const payload = await response.json();
                setIncidentCount(payload.incident_count ?? 0);
            }
        } catch {
            // The exam remains usable if the monitoring request is temporarily offline.
        }
    }, [event.slug, pkg.code]);

    const requestExamFullscreen = useCallback(async () => {
        if (document.fullscreenElement) {
            return;
        }

        if (!document.documentElement.requestFullscreen) {
            setLastIncident('Mode layar penuh tidak tersedia pada browser ini. Ujian tetap diawasi.');
            return;
        }

        try {
            await document.documentElement.requestFullscreen();
            hasEnteredFullscreenRef.current = true;
        } catch {
            setLastIncident('Mode layar penuh tidak dapat diaktifkan pada browser ini. Ujian tetap diawasi.');
        }
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            const fullscreenActive = Boolean(document.fullscreenElement);
            setIsFullscreen(fullscreenActive);

            if (
                !fullscreenActive
                && hasEnteredFullscreenRef.current
                && monitoringReadyRef.current
                && !isSubmittingRef.current
            ) {
                setLastIncident('Keluar dari mode layar penuh tercatat sebagai pelanggaran ujian.');
                recordProctoringEvent('fullscreen_exit', { trigger: 'fullscreen_change' });
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, [recordProctoringEvent]);

    useEffect(() => {
        let isCleaningUp = false;

        const startCamera = async () => {
            if (!navigator.mediaDevices?.getUserMedia) {
                setCameraStatus('unavailable');
                setLastIncident('Kamera tidak tersedia pada perangkat atau browser ini.');
                monitoringReadyRef.current = true;
                await recordProctoringEvent('camera_unavailable', { reason: 'media_devices_unavailable' });
                return;
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } },
                    audio: false,
                });
                if (isCleaningUp) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }
                mediaStreamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setCameraStatus('active');
                monitoringReadyRef.current = true;
                await recordProctoringEvent('camera_started');

                stream.getVideoTracks().forEach((track) => {
                    track.addEventListener('ended', () => {
                        if (!isCleaningUp) {
                            setCameraStatus('interrupted');
                            setLastIncident('Kamera terputus selama ujian. Aktifkan kembali izin kamera.');
                            recordProctoringEvent('camera_interrupted', { reason: 'track_ended' });
                        }
                    });
                });
            } catch (error) {
                const denied = error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError';
                setCameraStatus(denied ? 'denied' : 'unavailable');
                setLastIncident(denied
                    ? 'Izin kamera ditolak. Pengawas dapat melihat kejadian ini.'
                    : 'Kamera tidak dapat digunakan pada perangkat ini.');
                monitoringReadyRef.current = true;
                await recordProctoringEvent(denied ? 'camera_denied' : 'camera_unavailable', {
                    reason: error?.name || 'camera_error',
                });
            }
        };

        startCamera();

        return () => {
            isCleaningUp = true;
            monitoringReadyRef.current = false;
            mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        };
    }, [recordProctoringEvent]);

    useEffect(() => {
        let blurTimer;

        const pushHistoryBuffer = () => {
            try {
                for (let i = 0; i < 15; i++) {
                    window.history.pushState({ cbtExamLock: true, bufferIdx: i }, '', window.location.href);
                }
            } catch {
                // Ignore history buffer limits
            }
        };

        const reportNavigationAttempt = (trigger) => {
            if (!monitoringReadyRef.current || isSubmittingRef.current) return;

            setLastIncident('Percobaan meninggalkan halaman ujian diblokir dan dicatat oleh sistem.');
            recordProctoringEvent('navigation_attempt', { trigger });
        };

        const handleVisibilityChange = () => {
            if (monitoringReadyRef.current && document.visibilityState === 'hidden' && !isSubmittingRef.current) {
                setLastIncident('Perpindahan tab atau aplikasi tercatat oleh sistem.');
                recordProctoringEvent('tab_hidden', { visibility_state: 'hidden' });
            }
        };
        const handleWindowBlur = () => {
            blurTimer = window.setTimeout(() => {
                if (monitoringReadyRef.current && document.visibilityState === 'visible' && !isSubmittingRef.current) {
                    setLastIncident('Jendela ujian kehilangan fokus dan telah dicatat.');
                    recordProctoringEvent('window_blur', { visibility_state: 'visible' });
                }
            }, 250);
        };
        const handleBeforeUnload = (eventObject) => {
            if (isSubmittingRef.current || !monitoringReadyRef.current) return;

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const payload = new FormData();
            payload.append('_token', csrfToken || '');
            payload.append('type', 'page_exit_attempt');
            navigator.sendBeacon?.(`/event/${event.slug}/cbt/${pkg.code}/pengawasan`, payload);

            // Do NOT submit exam. Participant must remain on standby in exam until explicit submit or time expires.
            eventObject.preventDefault();
            eventObject.returnValue = 'Ujian sedang berlangsung. Anda harus tetap berada di halaman ujian sampai selesai.';
            return eventObject.returnValue;
        };
        const handlePageHide = () => {
            // Intentionally avoid auto-submitting. Attempt remains in_progress so participant can continue standby.
        };
        const handlePopState = () => {
            if (isSubmittingRef.current) return;

            pushHistoryBuffer();
            try {
                window.history.forward();
            } catch {
                // Browser forward safeguard
            }

            setLastIncident('Tombol kembali dinonaktifkan. Anda harus tetap berada di ruang ujian sampai selesai.');
            reportNavigationAttempt('browser_back');
        };
        const handleKeyDown = (eventObject) => {
            const target = eventObject.target;
            const isEditable = target instanceof HTMLInputElement
                || target instanceof HTMLTextAreaElement
                || target?.isContentEditable;
            const isBackShortcut = (eventObject.key === 'Backspace' && !isEditable)
                || (eventObject.altKey && (eventObject.key === 'ArrowLeft' || eventObject.key === 'Left'))
                || (eventObject.metaKey && (eventObject.key === '[' || eventObject.key === 'ArrowLeft' || eventObject.key === 'Left'))
                || (eventObject.ctrlKey && (eventObject.key === '[' || eventObject.key === 'ArrowLeft' || eventObject.key === 'Left'))
                || eventObject.key === 'BrowserBack';

            if (isBackShortcut) {
                eventObject.preventDefault();
                eventObject.stopPropagation();
                setLastIncident('Tombol pintasan navigasi kembali dinonaktifkan. Anda harus tetap di ruang ujian.');
                reportNavigationAttempt('keyboard_back');
            }
        };
        const handleAuxClick = (eventObject) => {
            if (eventObject.button === 3 || eventObject.button === 4) {
                eventObject.preventDefault();
                eventObject.stopPropagation();
                setLastIncident('Tombol navigasi mouse dinonaktifkan.');
                reportNavigationAttempt('mouse_back');
            }
        };

        pushHistoryBuffer();

        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('keydown', handleKeyDown, true);
        window.addEventListener('mouseup', handleAuxClick, true);
        window.addEventListener('blur', handleWindowBlur);
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('pagehide', handlePageHide);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.clearTimeout(blurTimer);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('keydown', handleKeyDown, true);
            window.removeEventListener('mouseup', handleAuxClick, true);
            window.removeEventListener('blur', handleWindowBlur);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('pagehide', handlePageHide);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [event.slug, pkg.code, recordProctoringEvent]);

    // Keep the visible countdown aligned with the server-provided deadline even
    // when the browser throttles timers in a background tab.
    useEffect(() => {
        const syncRemainingTime = () => {
            const nextRemaining = Math.max(0, Math.ceil((deadlineMsRef.current - Date.now()) / 1000));
            setRemainingSeconds(nextRemaining);
        };

        syncRemainingTime();
        const timer = window.setInterval(syncRemainingTime, 250);

        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        if (remainingSeconds === 0 && !hasAutoSubmittedRef.current) {
            hasAutoSubmittedRef.current = true;
            handleAutoSubmit();
        }
    }, [remainingSeconds]);

    // Scroll active question card into neat view below the header whenever question changes
    useEffect(() => {
        if (questionCardRef.current) {
            const headerElement = document.querySelector('header');
            const headerHeight = headerElement ? headerElement.offsetHeight : 80;
            const cardTop = questionCardRef.current.getBoundingClientRect().top + window.pageYOffset;
            const targetY = Math.max(0, cardTop - headerHeight - 16);
            window.scrollTo({ top: targetY, behavior: 'smooth' });
        }
    }, [currentIdx]);

    // Keep active question number visible inside the sidebar navigator
    useEffect(() => {
        if (activeNavButtonRef.current) {
            activeNavButtonRef.current.scrollIntoView({
                block: 'nearest',
                behavior: 'smooth',
            });
        }
        try {
            window.history.pushState({ cbtExamLock: true }, '', window.location.href);
        } catch {}
    }, [currentIdx]);

    const formattedTime = useMemo(() => {
        const hours = Math.floor(remainingSeconds / 3600);
        const m = Math.floor((remainingSeconds % 3600) / 60);
        const s = remainingSeconds % 60;

        if (hours > 0 || pkg.duration_minutes >= 60) {
            return `${String(hours).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }

        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }, [pkg.duration_minutes, remainingSeconds]);

    const isTimeLow = remainingSeconds < 300; // less than 5 minutes

    const currentQuestion = questions[currentIdx] || null;
    const answeredCount = Object.values(answers).filter((val) => val !== null && val !== undefined && val !== '').length;
    const totalQuestions = questions.length;
    const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

    // Handle answer selection with autosave
    const handleSelectOption = (questionId, optionId) => {
        try {
            window.history.pushState({ cbtExamLock: true }, '', window.location.href);
        } catch {}

        const updated = { ...answers, [String(questionId)]: optionId };
        setAnswers(updated);
        answersRef.current = updated;

        // Autosave to backend
        setIsSaving(true);
        router.post(
            `/event/${event.slug}/cbt/${pkg.code}/jawaban`,
            {
                question_id: questionId,
                answer: optionId,
            },
            {
                preserveScroll: true,
                preserveState: true,
                only: ['attempt'],
                onFinish: () => setIsSaving(false),
            }
        );
    };

    const handleAutoSubmit = () => {
        setLastIncident('Waktu ujian telah habis. Jawaban tersimpan sedang dikumpulkan otomatis.');
        submitExam();
    };

    const submitExam = () => {
        isSubmittingRef.current = true;
        router.post(`/event/${event.slug}/cbt/${pkg.code}/submit`, {
            answers: answersRef.current,
        }, {
            onError: () => {
                isSubmittingRef.current = false;
            },
        });
    };

    return (
        <div className="min-h-screen bg-[#F8FBFF] text-[#112743] flex flex-col justify-between select-none">
            <Head title={`Ujian CBT: ${pkg.title} — ${event.name}`} />

            {/* Focused Sticky Exam Header */}
            <header className="sticky top-0 z-30 bg-[#0E2747] py-3 text-white shadow-md">
                <div className="mx-auto flex w-full max-w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                    <div className="min-w-0 flex-1 space-y-0.5">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#EE9B25] block font-semibold">
                            CBT PENATARAN PERKEMI
                        </span>
                        <h1 className="line-clamp-2 font-display text-sm font-bold leading-tight text-white sm:text-base">
                            {pkg.title}
                        </h1>
                    </div>

                    {/* Timer & Controls */}
                    <div className="flex items-center gap-3 shrink-0">
                        {/* Countdown Badge */}
                        <div
                            role="timer"
                            aria-live={isTimeLow ? 'assertive' : 'off'}
                            aria-label={`Sisa waktu ujian ${formattedTime}`}
                            title="Sisa waktu ujian"
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-bold border transition-colors ${
                                isTimeLow
                                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 motion-safe:animate-pulse'
                                    : 'bg-white/10 border-white/20 text-white'
                            }`}
                        >
                            <Clock className="w-4 h-4" />
                            <span>{formattedTime}</span>
                        </div>

                        {/* Question Drawer Toggle (Mobile) */}
                        <button
                            type="button"
                            onClick={() => setIsNavDrawerOpen(!isNavDrawerOpen)}
                            className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 sm:hidden"
                            title="Buka Navigasi Soal"
                            aria-label="Buka navigasi nomor soal"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Progress Strip */}
                <div className="mx-auto mt-2 w-full max-w-full px-4 sm:px-6 lg:px-8">
                    <div className="w-full bg-white/15 rounded-full h-1.5 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-[#0B63CE] transition-[width] duration-300 motion-reduce:transition-none"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-white/70 mt-1 font-mono">
                        <span>Terjawab: {answeredCount} dari {totalQuestions} soal ({progressPercent}%)</span>
                        {isSaving && <span className="text-emerald-300 flex items-center gap-1"><Check className="w-3 h-3" /> Tersimpan</span>}
                    </div>
                </div>
            </header>

            {/* Main Exam Runner Area */}
            <main className="mx-auto grid w-full max-w-full flex-1 grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-4 lg:px-8">
                <section className="lg:col-span-4 rounded-xl border border-[#DCE7F3] bg-white p-4 shadow-xs" aria-labelledby="exam-monitoring-title">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-[#0E2747]">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    aria-label="Pratinjau kamera peserta"
                                    className={`h-full w-full object-cover ${cameraStatus === 'active' ? 'block' : 'hidden'}`}
                                />
                                {cameraStatus !== 'active' && (
                                    <div className="flex h-full w-full items-center justify-center text-white/80">
                                        <CameraOff className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <h2 id="exam-monitoring-title" className="flex items-center gap-2 text-sm font-bold text-[#0E2747]">
                                    <Camera className="h-4 w-4 shrink-0 text-[#0B63CE]" aria-hidden="true" />
                                    Pengawasan ujian
                                </h2>
                                <p className="mt-1 text-xs leading-relaxed text-[#6B7C93]">
                                    Kamera: <strong className="text-[#112743]">{{ requesting: 'Meminta izin', active: 'Aktif', denied: 'Izin ditolak', unavailable: 'Tidak tersedia', interrupted: 'Terputus' }[cameraStatus]}</strong>
                                    {' '}• {incidentCount} kejadian fokus tercatat
                                </p>
                                <p className="mt-1 text-[11px] leading-relaxed text-[#6B7C93]">
                                    Pratinjau berjalan di perangkat. Sistem menyimpan status kamera dan kejadian fokus, bukan rekaman video.
                                </p>
                            </div>
                        </div>
                        <div className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#EAF5FF] px-3 py-2 text-xs font-semibold text-[#0A3F82]">
                            <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                            Mode ujian aktif
                        </div>
                        <button
                            type="button"
                            onClick={requestExamFullscreen}
                            disabled={isFullscreen}
                            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-[#0B63CE] bg-white px-3 text-xs font-semibold text-[#0B63CE] hover:bg-[#EAF5FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] disabled:cursor-default disabled:border-[#20A47A] disabled:bg-[#20A47A]/10 disabled:text-[#16785B]"
                        >
                            {isFullscreen ? <Check className="h-4 w-4" aria-hidden="true" /> : <Maximize2 className="h-4 w-4" aria-hidden="true" />}
                            {isFullscreen ? 'Layar penuh aktif' : 'Aktifkan layar penuh'}
                        </button>
                    </div>
                    {lastIncident && (
                        <p role="alert" aria-live="assertive" className="mt-3 rounded-lg border border-[#EE9B25]/40 bg-[#EE9B25]/10 px-3 py-2 text-xs text-[#7A4A06]">
                            {lastIncident}
                        </p>
                    )}
                </section>

                {/* Center / Left: Current Question Card */}
                <div className="lg:col-span-3 space-y-6">
                    {currentQuestion ? (
                        <div ref={questionCardRef} className="scroll-mt-28 bg-white rounded-2xl border border-[#DCE7F3] p-6 sm:p-8 shadow-xs space-y-6">
                            {/* Question Meta Bar */}
                            <div className="flex items-center justify-between border-b border-[#DCE7F3] pb-4">
                                <span className="font-mono font-bold text-xs bg-[#EAF5FF] text-[#0B63CE] px-3 py-1 rounded-lg border border-[#0B63CE]/20">
                                    Soal Nomor {currentIdx + 1}
                                </span>
                                <span className="text-xs font-mono text-[#6B7C93]">
                                    Bobot: {currentQuestion.points} Poin
                                </span>
                            </div>

                            {/* Question Text */}
                            <div className="text-sm sm:text-base text-[#0E2747] font-medium leading-relaxed">
                                {currentQuestion.question_text}
                            </div>

                            {/* Options List */}
                            <div className="space-y-3 pt-2">
                                {(currentQuestion.options || []).map((opt, optIdx) => {
                                    const optValue = opt.key ?? opt.id;
                                    const optLabel = opt.label ?? opt.key ?? opt.id ?? String.fromCharCode(65 + optIdx);
                                    const currentAnswer = answers[String(currentQuestion.id)];
                                    const isSelected = Boolean(currentAnswer) && String(currentAnswer) === String(optValue);

                                    return (
                                        <button
                                            key={optValue || optIdx}
                                            type="button"
                                            onClick={() => handleSelectOption(currentQuestion.id, optValue)}
                                            aria-pressed={isSelected}
                                            className={`flex min-h-[48px] w-full items-start gap-3.5 rounded-xl border-2 p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] motion-reduce:transition-none ${
                                                isSelected
                                                    ? 'border-[#0B63CE] bg-[#EAF5FF]/60 text-[#0E2747] shadow-xs'
                                                    : 'border-[#DCE7F3] bg-[#F8FBFF] hover:border-[#0B63CE]/40 text-[#112743]'
                                            }`}
                                        >
                                            <span
                                                className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors ${
                                                    isSelected
                                                        ? 'bg-[#0B63CE] text-white'
                                                        : 'bg-white border border-[#DCE7F3] text-[#6B7C93]'
                                                }`}
                                            >
                                                {optLabel}
                                            </span>
                                            <span className="text-xs sm:text-sm font-normal pt-0.5 leading-snug">
                                                {opt.text}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 text-center bg-white rounded-2xl border border-[#DCE7F3] text-[#6B7C93]">
                            Tidak ada soal tersedia untuk paket ujian ini.
                        </div>
                    )}

                    {/* Bottom Navigation Buttons */}
                    <div className="flex items-center justify-between gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            icon={<ChevronLeft className="w-4 h-4" />}
                            className="whitespace-nowrap"
                            disabled={currentIdx === 0}
                            onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                        >
                            Sebelumnya
                        </Button>

                        <div className="flex items-center gap-2">
                            {currentIdx < totalQuestions - 1 ? (
                                <Button
                                    type="button"
                                    variant="primary"
                                    icon={ChevronRight}
                                    iconPosition="right"
                                    className="whitespace-nowrap"
                                    onClick={() => setCurrentIdx((prev) => Math.min(totalQuestions - 1, prev + 1))}
                                >
                                    Berikutnya
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    variant="primary"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                    icon={<Send className="w-4 h-4" />}
                                    onClick={() => setIsSubmitModalOpen(true)}
                                >
                                    Selesaikan Ujian
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right / Sidebar: Question Number Navigator */}
                <div className="hidden lg:block space-y-4">
                    <div className="bg-white rounded-2xl border border-[#DCE7F3] p-5 shadow-xs space-y-4 sticky top-20">
                        <div className="flex items-center justify-between border-b border-[#DCE7F3] pb-3">
                            <h3 className="font-display font-bold text-xs text-[#0E2747] uppercase tracking-wider">
                                Nomor Soal
                            </h3>
                            <span className="text-[11px] font-mono text-[#6B7C93]">
                                {answeredCount}/{totalQuestions}
                            </span>
                        </div>

                        {/* Scrollable Grid of Question Numbers */}
                        <div className="max-h-[340px] overflow-y-auto pr-1">
                            <div className="grid grid-cols-5 gap-2">
                                {questions.map((q, idx) => {
                                    const ansVal = answers[String(q.id)];
                                    const isAnswered = ansVal !== undefined && ansVal !== null && ansVal !== '';
                                    const isCurrent = currentIdx === idx;

                                    return (
                                        <button
                                            key={q.id}
                                            ref={isCurrent ? activeNavButtonRef : null}
                                            type="button"
                                            onClick={() => setCurrentIdx(idx)}
                                            aria-current={isCurrent ? 'step' : undefined}
                                            className={`h-9 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center relative ${
                                                isCurrent
                                                    ? 'ring-2 ring-[#0B63CE] ring-offset-1 font-black shadow-xs'
                                                    : ''
                                            } ${
                                                isAnswered
                                                    ? 'bg-[#0B63CE] text-white'
                                                    : 'bg-[#F8FBFF] text-[#6B7C93] border border-[#DCE7F3] hover:bg-[#EAF5FF]'
                                            }`}
                                        >
                                            <span>{idx + 1}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="pt-3 border-t border-[#DCE7F3] space-y-2 text-[11px] text-[#6B7C93]">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded bg-[#0B63CE]" />
                                <span>Sudah Dijawab</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded bg-[#F8FBFF] border border-[#DCE7F3]" />
                                <span>Belum Dijawab</span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-center text-xs text-rose-600 hover:bg-rose-50 border-rose-200 mt-2"
                            onClick={() => setIsSubmitModalOpen(true)}
                        >
                            Kumpulkan Ujian Sekarang
                        </Button>
                    </div>
                </div>
            </main>

            {/* Mobile Question Drawer Modal */}
            <Modal
                isOpen={isNavDrawerOpen}
                onClose={() => setIsNavDrawerOpen(false)}
                title="Daftar Nomor Soal Ujian"
                size="sm"
            >
                <div className="max-h-[60vh] overflow-y-auto pr-1">
                    <div className="grid grid-cols-5 gap-2 py-2">
                        {questions.map((q, idx) => {
                            const ansVal = answers[String(q.id)];
                            const isAnswered = ansVal !== undefined && ansVal !== null && ansVal !== '';
                            const isCurrent = currentIdx === idx;

                            return (
                                <button
                                    key={q.id}
                                    type="button"
                                    onClick={() => {
                                        setCurrentIdx(idx);
                                        setIsNavDrawerOpen(false);
                                    }}
                                    aria-current={isCurrent ? 'step' : undefined}
                                    className={`h-11 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center ${
                                        isCurrent ? 'ring-2 ring-[#0B63CE]' : ''
                                    } ${
                                        isAnswered
                                            ? 'bg-[#0B63CE] text-white'
                                            : 'bg-[#F8FBFF] text-[#6B7C93] border border-[#DCE7F3]'
                                    }`}
                                >
                                    <span>{idx + 1}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </Modal>

            {/* Submit Confirmation Dialog */}
            <Modal
                isOpen={isSubmitModalOpen}
                onClose={() => setIsSubmitModalOpen(false)}
                title="Konfirmasi Selesaikan Ujian"
                size="sm"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsSubmitModalOpen(false)}>
                            Periksa Kembali
                        </Button>
                        <Button
                            variant="primary"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={submitExam}
                        >
                            Ya, Kumpulkan Jawaban
                        </Button>
                    </>
                }
            >
                <div className="space-y-3 text-xs text-[#112743]">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-start gap-2.5">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-bold block">Periksa Kelengkapan Jawaban Anda</span>
                            <span>
                                Anda telah menjawab <strong>{answeredCount}</strong> dari total <strong>{totalQuestions}</strong> soal.
                                {answeredCount < totalQuestions && (
                                    <span className="text-rose-600 font-semibold block mt-1">
                                        Masih ada {totalQuestions - answeredCount} soal yang belum Anda jawab!
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                    <p className="text-[#6B7C93]">
                        Setelah Anda mengumpulkan ujian, seluruh jawaban akan dikunci dan dinilai secara otomatis oleh sistem.
                    </p>
                </div>
            </Modal>
        </div>
    );
}
