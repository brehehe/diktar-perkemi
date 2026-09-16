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
                aria-label="Halaman Sebelumnya"
                title="Halaman Sebelumnya"
                className={[
                    'absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10',
                    'w-9 h-9 sm:w-10 sm:h-10 rounded-full',
                    'border border-[#0E2747]/20 bg-white/70 backdrop-blur-[2px]',
                    'flex items-center justify-center',
                    'text-[#0E2747]/60',
                    'transition-all duration-200',
                    'hover:border-[#0B63CE] hover:text-[#0B63CE] hover:bg-white hover:shadow-md',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE] focus-visible:ring-offset-1',
                    'disabled:opacity-0 disabled:pointer-events-none',
                    'active:scale-95',
                ].join(' ')}
            >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Right arrow — Halaman Berikutnya */}
            <button
                type="button"
                onClick={onNext}
                disabled={!canGoNext}
                aria-label="Halaman Berikutnya"
                title="Halaman Berikutnya"
                className={[
                    'absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10',
                    'w-9 h-9 sm:w-10 sm:h-10 rounded-full',
                    'border border-[#0E2747]/20 bg-white/70 backdrop-blur-[2px]',
                    'flex items-center justify-center',
                    'text-[#0E2747]/60',
                    'transition-all duration-200',
                    'hover:border-[#0B63CE] hover:text-[#0B63CE] hover:bg-white hover:shadow-md',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE] focus-visible:ring-offset-1',
                    'disabled:opacity-0 disabled:pointer-events-none',
                    'active:scale-95',
                ].join(' ')}
            >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
        </>
    );
}
