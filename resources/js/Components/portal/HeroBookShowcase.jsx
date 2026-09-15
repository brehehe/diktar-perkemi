import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, ShieldCheck } from 'lucide-react';

export default function HeroBookShowcase({ className = '' }) {
    return (
        <div className={`relative w-full max-w-lg mx-auto aspect-[4/3] sm:aspect-[16/12] flex items-center justify-center select-none py-6 ${className}`}>
            {/* Ambient Lighting Glows */}
            <div className="absolute inset-0 bg-radial from-[#0B63CE]/12 via-[#EAF5FF]/30 to-transparent blur-3xl -z-10 rounded-full scale-110 pointer-events-none" />
            <div className="absolute w-64 sm:w-80 h-64 sm:h-80 rounded-full border border-[#0B63CE]/15 -z-10 pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
            <div className="absolute w-80 sm:w-96 h-80 sm:h-96 rounded-full border border-[#DCE7F3]/70 border-dashed -z-10 pointer-events-none" />

            {/* 1. Left / Back Book (cover-1.jpg) */}
            <motion.div
                className="absolute z-10 left-4 sm:left-10 md:left-12 top-6 sm:top-8 w-32 sm:w-40 md:w-44 aspect-[1/1.42] rounded-r-md rounded-l-xs overflow-hidden shadow-xl border border-black/10 origin-bottom-left cursor-pointer"
                animate={{
                    y: [0, -10, 0],
                    rotate: [-10, -7, -10],
                }}
                transition={{
                    duration: 5.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                whileHover={{
                    scale: 1.08,
                    rotate: -4,
                    zIndex: 35,
                    transition: { type: 'spring', stiffness: 350, damping: 25 },
                }}
            >
                {/* Spine ridge highlight */}
                <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/25 via-white/25 to-transparent z-10 pointer-events-none" />
                <img
                    src="/images/cover-1.jpg"
                    alt="Buku Modul PERKEMI 1"
                    className="w-full h-full object-cover"
                    loading="eager"
                />
            </motion.div>

            {/* 2. Right / Back Book (cover-2.jpg) */}
            <motion.div
                className="absolute z-15 right-4 sm:right-10 md:right-12 top-10 sm:top-12 w-32 sm:w-40 md:w-44 aspect-[1/1.42] rounded-r-md rounded-l-xs overflow-hidden shadow-2xl border border-black/10 origin-bottom-right cursor-pointer"
                animate={{
                    y: [0, -13, 0],
                    rotate: [11, 8, 11],
                }}
                transition={{
                    duration: 5.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.6,
                }}
                whileHover={{
                    scale: 1.08,
                    rotate: 4,
                    zIndex: 35,
                    transition: { type: 'spring', stiffness: 350, damping: 25 },
                }}
            >
                {/* Spine ridge highlight */}
                <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/25 via-white/25 to-transparent z-10 pointer-events-none" />
                <img
                    src="/images/cover-2.jpg"
                    alt="Buku Modul PERKEMI 2"
                    className="w-full h-full object-cover"
                    loading="eager"
                />
            </motion.div>

            {/* 3. Center / Front Hero Book (cover-3.jpg) */}
            <motion.div
                className="relative z-25 w-36 sm:w-48 md:w-52 aspect-[1/1.42] rounded-r-md rounded-l-xs overflow-hidden shadow-[0_22px_50px_-12px_rgba(14,39,71,0.38)] border border-black/15 cursor-pointer"
                animate={{
                    y: [0, -8, 0],
                    rotate: [-1.5, 0.5, -1.5],
                }}
                transition={{
                    duration: 4.6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1.2,
                }}
                whileHover={{
                    scale: 1.07,
                    rotate: 0,
                    zIndex: 40,
                    transition: { type: 'spring', stiffness: 350, damping: 25 },
                }}
            >
                {/* Spine ridge highlight */}
                <div className="absolute inset-y-0 left-0 w-3.5 bg-gradient-to-r from-black/30 via-white/30 to-transparent z-10 pointer-events-none" />
                {/* Gloss overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/15 pointer-events-none z-10" />
                <img
                    src="/images/cover-3.jpg"
                    alt="Buku Utama Kurikulum PERKEMI"
                    className="w-full h-full object-cover"
                    loading="eager"
                />
            </motion.div>

            {/* Top Floating Badge */}
            {/* <motion.div
                className="absolute -top-2 sm:top-1 right-2 sm:right-6 z-35 bg-white/95 backdrop-blur-xs border border-[#BCE0FD] text-[#0A3F82] rounded-lg px-3 py-1.5 shadow-sm text-xs font-semibold flex items-center gap-1.5 pointer-events-none"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
            >
                <Sparkles className="w-3.5 h-3.5 text-[#EE9B25]" />
                <span>Kurikulum Resmi PB PERKEMI</span>
            </motion.div> */}

            {/* Bottom Floating Badge */}
            {/* <motion.div
                className="absolute -bottom-2 sm:bottom-2 left-2 sm:left-6 z-35 bg-white/95 backdrop-blur-xs border border-[#DCE7F3] text-[#112743] rounded-lg px-3 py-1.5 shadow-sm text-xs font-semibold flex items-center gap-1.5 pointer-events-none"
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            >
                <ShieldCheck className="w-3.5 h-3.5 text-[#20A47A]" />
                <span>Dokumen Digital Terverifikasi</span>
            </motion.div> */}
        </div>
    );
}
