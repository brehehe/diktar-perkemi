import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    Calendar,
    MapPin,
    Award,
    Sparkles,
    ArrowRight,
    FastForward,
    Shield,
    Users,
    Layers,
    CheckCircle2,
} from 'lucide-react';

export default function Welcome({ event, participant }) {
    const [isOpen, setIsOpen] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [isSmUp, setIsSmUp] = useState(true);

    useEffect(() => {
        // Detect screen width for responsive 3D translation
        const checkWidth = () => {
            setIsSmUp(window.innerWidth >= 640);
        };
        checkWidth();
        window.addEventListener('resize', checkWidth);

        // Detect prefers-reduced-motion
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (mediaQuery.matches) {
            setReducedMotion(true);
            setIsOpen(true);
            return () => window.removeEventListener('resize', checkWidth);
        }

        // Automatic opening sequence after 700ms
        const timer = setTimeout(() => {
            setIsOpen(true);
        }, 700);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', checkWidth);
        };
    }, []);

    const handleSkipAnimation = () => {
        setIsOpen(true);
    };

    const handleEnterLearningRoom = () => {
        router.post(`/event/${event.slug}/welcome/seen`, {
            event_participant_id: participant.event_participant_id,
        });
    };

    return (
        <div className="min-h-screen bg-[#0A1A2F] text-white flex flex-col justify-between items-center px-4 py-3 sm:px-8 sm:py-4 relative overflow-hidden select-none font-sans">
            <Head title={`Selamat Datang, ${participant.name} — ${event.name}`} />

            {/* Subtle Institutional Background Atmosphere */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#0B63CE_0%,transparent_60%)] opacity-20 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

            {/* Top Bar */}
            <header className="w-full max-w-5xl flex items-center justify-between z-20 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#0B63CE] flex items-center justify-center font-bold text-white shadow-lg text-sm border border-white/20">
                        PP
                    </div>
                    <div>
                        <span className="font-display font-bold text-sm tracking-wide text-white block">
                            Pustaka Penataran
                        </span>
                        <span className="text-[10px] text-[#EAF5FF]/70 tracking-widest uppercase font-mono">
                            PB PERKEMI
                        </span>
                    </div>
                </div>

                {!isOpen && !reducedMotion && (
                    <button
                        type="button"
                        onClick={handleSkipAnimation}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition-all border border-white/15 cursor-pointer"
                    >
                        <FastForward className="w-3.5 h-3.5" />
                        <span>Lewati Animasi</span>
                    </button>
                )}
            </header>

            {/* 3D BOOK STAGE CONTAINER */}
            <main className="w-full max-w-5xl my-auto py-2 sm:py-3 flex items-center justify-center z-10">
                <div
                    className="relative w-full max-w-[360px] sm:max-w-[720px] md:max-w-[780px] h-[460px] sm:h-[480px] md:h-[500px] max-h-[calc(100vh-130px)]"
                    style={{ perspective: '2000px' }}
                >
                    {/* BOOK WRAPPER */}
                    <div
                        className="w-full h-full relative transition-all duration-1000 ease-out"
                        style={{
                            transformStyle: 'preserve-3d',
                            transform: isSmUp
                                ? (isOpen ? 'translateX(0%)' : 'translateX(-25%)')
                                : 'none',
                        }}
                    >
                        {/* RIGHT PAGE (UNDERNEATH / INTERIOR PORTAL WELCOME) */}
                        <div className="absolute inset-0 sm:left-1/2 w-full sm:w-1/2 h-full rounded-2xl sm:rounded-l-none sm:rounded-r-2xl bg-linear-to-br from-[#F8FBFF] to-[#EAF5FF] text-[#112743] p-5 sm:p-6 md:p-7 shadow-2xl border border-[#DCE7F3] flex flex-col justify-between z-1 overflow-hidden">
                            {/* Inner Spine Shadow Gradient */}
                            <div className="absolute left-0 top-0 bottom-0 w-8 bg-linear-to-r from-black/15 via-black/5 to-transparent pointer-events-none z-10 hidden sm:block" />

                            {/* Inner Page Top Heading */}
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between pb-2.5 border-b border-[#DCE7F3]">
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#0B63CE] font-bold">
                                        Portal Pembelajaran Digital PERKEMI
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0B63CE]/10 text-[#0B63CE]">
                                        Jalur {participant.track_code}
                                    </span>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                                    transition={{ duration: 0.6, delay: 0.8 }}
                                    className="space-y-1"
                                >
                                    <div className="text-xs font-semibold text-[#0B63CE]">
                                        Selamat Datang,
                                    </div>
                                    <h1 className="font-display font-bold text-lg sm:text-xl md:text-2xl text-[#0E2747] leading-tight">
                                        {participant.name}
                                    </h1>
                                    <p className="text-[11px] text-[#6B7C93] font-medium">
                                        DAN {participant.dan_roman} • {participant.origin} ({participant.dojo})
                                    </p>
                                </motion.div>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={isOpen ? { opacity: 1 } : { opacity: 0 }}
                                    transition={{ duration: 0.6, delay: 1.0 }}
                                    className="text-xs text-[#112743] leading-relaxed"
                                >
                                    Materi penataran dan kurikulum kualifikasi Anda telah siap dipelajari di Pustaka Penataran.
                                </motion.p>
                            </div>

                            {/* Event Badges & Track Info */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={isOpen ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.5, delay: 1.2 }}
                                className="space-y-2 my-1"
                            >
                                <div className="p-2.5 sm:p-3 bg-white/85 backdrop-blur-xs rounded-xl border border-[#DCE7F3] space-y-1">
                                    <div className="font-semibold text-xs text-[#0E2747] line-clamp-1">
                                        {event.name}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-[11px] text-[#6B7C93]">
                                        <div className="flex items-center gap-1.5 truncate">
                                            <Calendar className="w-3.5 h-3.5 text-[#0B63CE] shrink-0" />
                                            <span className="truncate">{event.date_formatted}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 truncate">
                                            <MapPin className="w-3.5 h-3.5 text-[#0B63CE] shrink-0" />
                                            <span className="truncate">{event.place}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="p-2 sm:p-2.5 rounded-lg bg-white border border-[#DCE7F3]">
                                        <span className="text-[10px] text-[#6B7C93] block">Kelompok Rotasi</span>
                                        <span className="font-bold text-[#7957D5] text-xs">
                                            {participant.rotation_group ? `Grup ${participant.rotation_group}` : 'Reguler'}
                                        </span>
                                    </div>
                                    <div className="p-2 sm:p-2.5 rounded-lg bg-white border border-[#DCE7F3]">
                                        <span className="text-[10px] text-[#6B7C93] block">Beban Kurikulum</span>
                                        <span className="font-bold text-[#0B63CE] text-xs">
                                            {event.total_effective_jp} JP ({event.modules_count} Modul)
                                        </span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Main CTA Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                                transition={{ duration: 0.5, delay: 1.4 }}
                            >
                                <button
                                    type="button"
                                    onClick={handleEnterLearningRoom}
                                    className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-[#0B63CE] hover:bg-[#0A3F82] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#0B63CE]/25 transition-all duration-200 group active:scale-[0.99] cursor-pointer"
                                >
                                    <span>Masuk ke Ruang Belajar</span>
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </button>
                            </motion.div>
                        </div>

                        {/* CENTER SPINE CREASE SHADOW */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-1 -ml-0.5 bg-black/30 shadow-[0_0_8px_rgba(0,0,0,0.6)] z-20 pointer-events-none hidden sm:block" />

                        {/* LEFT COVER (3D PAGE TURN FLIP EFFECT) */}
                        <div
                            className="absolute inset-0 sm:left-1/2 w-full sm:w-1/2 h-full z-20 cursor-pointer"
                            style={{
                                transformOrigin: 'left center',
                                transformStyle: 'preserve-3d',
                                transition: reducedMotion ? 'none' : 'transform 1.4s cubic-bezier(0.25, 1, 0.5, 1)',
                                transform: isOpen ? 'rotateY(-180deg)' : 'rotateY(0deg)',
                                pointerEvents: isOpen && !isSmUp ? 'none' : 'auto',
                            }}
                            onClick={() => !isOpen && setIsOpen(true)}
                        >
                            {/* FRONT OF COVER (SHOWN BEFORE OPENING) */}
                            <div
                                className="absolute inset-0 rounded-2xl sm:rounded-l-none sm:rounded-r-2xl bg-linear-to-br from-[#0E2747] via-[#0A3F82] to-[#0E2747] text-white p-6 sm:p-7 md:p-8 border-2 border-[#EE9B25]/50 shadow-2xl flex flex-col justify-between overflow-hidden"
                                style={{
                                    backfaceVisibility: 'hidden',
                                }}
                            >
                                {/* Spine shadow on left edge of closed cover */}
                                <div className="absolute left-0 top-0 bottom-0 w-6 bg-linear-to-r from-black/40 to-transparent pointer-events-none hidden sm:block" />

                                {/* Embossed PERKEMI Emblem & Border */}
                                <div className="absolute inset-3 border border-[#EE9B25]/25 rounded-xl pointer-events-none" />

                                <div className="space-y-3 text-center z-10 pt-2">
                                    <div className="w-14 h-14 mx-auto rounded-full bg-[#EE9B25]/10 border-2 border-[#EE9B25] flex items-center justify-center text-[#EE9B25] shadow-inner">
                                        <Shield className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h2 className="font-display font-bold text-base sm:text-lg text-[#F8FBFF] tracking-wide uppercase">
                                            PERKEMI
                                        </h2>
                                        <p className="text-[10px] text-[#EE9B25] font-mono tracking-widest uppercase mt-0.5">
                                            Persaudaraan Shorinji Kempo Indonesia
                                        </p>
                                    </div>
                                </div>

                                <div className="text-center space-y-1.5 z-10 px-2">
                                    <div className="h-0.5 w-12 bg-[#EE9B25] mx-auto opacity-70" />
                                    <h3 className="font-display font-bold text-sm sm:text-base text-white leading-snug line-clamp-2">
                                        {event.name}
                                    </h3>
                                    <p className="text-[11px] text-[#EAF5FF]/80">
                                        Buku Panduan & Modul Pembelajaran Kualifikasi
                                    </p>
                                </div>

                                <div className="text-center z-10 pb-1">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/15 hover:bg-white/20 text-white border border-white/25 shadow-xs transition-all">
                                        <Sparkles className="w-3.5 h-3.5 text-[#EE9B25]" />
                                        <span>Klik untuk Membuka Buku</span>
                                    </span>
                                </div>
                            </div>

                            {/* BACK OF COVER (INSIDE LEFT PAGE WHEN OPEN) */}
                            <div
                                className="absolute inset-0 rounded-2xl sm:rounded-r-none sm:rounded-l-2xl bg-[#0E2747] text-[#EAF5FF] p-5 sm:p-6 md:p-7 border border-[#0A3F82] shadow-2xl flex flex-col justify-between overflow-hidden"
                                style={{
                                    backfaceVisibility: 'hidden',
                                    transform: 'rotateY(180deg)',
                                }}
                            >
                                {/* Spine shadow on right edge of left page */}
                                <div className="absolute right-0 top-0 bottom-0 w-8 bg-linear-to-l from-black/35 via-black/10 to-transparent pointer-events-none hidden sm:block" />

                                <div className="space-y-3 relative z-10">
                                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#EE9B25] font-bold">
                                        Falsafah & Doktrin PERKEMI
                                    </div>
                                    <blockquote className="text-xs italic text-white/95 leading-relaxed border-l-2 border-[#EE9B25] pl-3 py-1">
                                        &ldquo;Kasih sayang tanpa kekuatan adalah kelemahan. Kekuatan tanpa kasih sayang adalah kezaliman.&rdquo;
                                    </blockquote>
                                    <p className="text-[11px] text-[#EAF5FF]/75 leading-relaxed">
                                        Riki Aiwa - Keselarasan antara kekuatan fisik, kepemimpinan, dan keluhuran budi pekerti.
                                    </p>
                                </div>

                                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5 text-[11px] relative z-10">
                                    <div className="font-semibold text-white">Instruksi Pembelajaran:</div>
                                    <ul className="list-disc list-inside text-white/75 space-y-1 text-[10px]">
                                        <li>Pelajari modul teori sebelum sesi tatami dimulai.</li>
                                        <li>Ikuti rotasi kelas sesuai pembagian grup A1/A2.</li>
                                        <li>Unduh buku digital resmi di Flipbook Reader.</li>
                                    </ul>
                                </div>

                                <div className="text-[10px] font-mono text-white/40 text-center relative z-10">
                                    PB PERKEMI © 2026 • Standar Mutu Penataran
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Footer Information */}
            <footer className="w-full max-w-5xl flex items-center justify-between z-20 text-[11px] text-white/60 pb-1 sm:pb-2 shrink-0">
                <span>Pustaka Penataran Shorinji Kempo PERKEMI</span>
                <span className="font-mono">Versi 2.0 • Modern Institutional</span>
            </footer>
        </div>
    );
}
