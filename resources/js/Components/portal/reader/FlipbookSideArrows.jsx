import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * FlipbookSideArrows
 * Absolute-positioned navigation arrows centered vertically on the left
 * and right sides of the reader stage. They sit outside the book area
 * and never cover the PDF pages.
 */
export default function FlipbookSideArrows({
    currentPage = 1,
    totalPages = 1,
    canGoPrev: propCanGoPrev = null,
    canGoNext: propCanGoNext = null,
    onPrev,
    onNext,
    isMobile = false,
}) {
    const canGoPrev = propCanGoPrev !== null ? propCanGoPrev : currentPage > 1;
    const canGoNext = propCanGoNext !== null ? propCanGoNext : currentPage < totalPages;

    return (
        <>
            {/* Left arrow — Halaman Sebelumnya */}
            <button
                type="button"
                onClick={onPrev}
                disabled={!canGoPrev}
                aria-label="Halaman Sebelumnya (Panah Kiri)"
                title="Halaman Sebelumnya"
                className={[
                    'absolute left-1.5 sm:left-4 top-1/2 -translate-y-1/2 z-30',
                    'w-10 h-10 sm:w-11 sm:h-11 rounded-full',
                    'border border-[#0B63CE]/15 bg-white/75 sm:bg-white/50 backdrop-blur-md shadow-sm',
                    'flex items-center justify-center cursor-pointer',
                    'text-[#0E2747]/75',
                    'opacity-65 hover:opacity-100',
                    'transition-all duration-150',
                    'hover:border-[#0B63CE]/50 hover:text-[#0B63CE] hover:bg-white hover:shadow-md hover:scale-105',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE] focus-visible:ring-offset-2',
                    'disabled:opacity-0 disabled:pointer-events-none',
                    'active:scale-90 active:bg-[#EAF5FF] active:text-[#0B63CE]',
                ].join(' ')}
            >
                <ChevronLeft className="w-5 h-5 sm:w-5 sm:h-5" />
            </button>

            {/* Right arrow — Halaman Berikutnya */}
            <button
                type="button"
                onClick={onNext}
                disabled={!canGoNext}
                aria-label="Halaman Berikutnya (Panah Kanan)"
                title="Halaman Berikutnya"
                className={[
                    'absolute right-1.5 sm:right-4 top-1/2 -translate-y-1/2 z-30',
                    'w-10 h-10 sm:w-11 sm:h-11 rounded-full',
                    'border border-[#0B63CE]/15 bg-white/75 sm:bg-white/50 backdrop-blur-md shadow-sm',
                    'flex items-center justify-center cursor-pointer',
                    'text-[#0E2747]/75',
                    'opacity-65 hover:opacity-100',
                    'transition-all duration-150',
                    'hover:border-[#0B63CE]/50 hover:text-[#0B63CE] hover:bg-white hover:shadow-md hover:scale-105',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE] focus-visible:ring-offset-2',
                    'disabled:opacity-0 disabled:pointer-events-none',
                    'active:scale-90 active:bg-[#EAF5FF] active:text-[#0B63CE]',
                ].join(' ')}
            >
                <ChevronRight className="w-5 h-5 sm:w-5 sm:h-5" />
            </button>
        </>
    );
}
