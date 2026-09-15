import React, { useState, useEffect } from 'react';
import {
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    Bookmark, BookmarkCheck, ZoomIn, ZoomOut, Minus, Plus
} from 'lucide-react';

const ZOOM_PRESETS = [
    { label: '75%', value: 75 },
    { label: '100%', value: 100 },
    { label: '125%', value: 125 },
    { label: '150%', value: 150 },
    { label: '175%', value: 175 },
];

export default function ReaderNavigation({
    currentPage = 1,
    totalPages = 1,
    onPageChange,
    onPrevPage,
    onNextPage,
    isCurrentBookmarked = false,
    onToggleBookmark,
    zoom = 100,
    onZoomIn,
    onZoomOut,
    onResetZoom,
    onSetZoom,
}) {
    const [pageInputValue, setPageInputValue] = useState(String(currentPage));
    const [showZoomMenu, setShowZoomMenu] = useState(false);

    useEffect(() => {
        setPageInputValue(String(currentPage));
    }, [currentPage]);

    // Close zoom menu when clicking outside
    useEffect(() => {
        if (!showZoomMenu) return;
        const handler = (e) => {
            if (!e.target.closest('[data-zoom-menu]')) setShowZoomMenu(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showZoomMenu]);

    const handlePageSubmit = (e) => {
        e.preventDefault();
        const parsed = parseInt(pageInputValue, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
            onPageChange?.(parsed);
        } else {
            setPageInputValue(String(currentPage));
        }
    };

    const handleSliderChange = (e) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val)) onPageChange?.(val);
    };

    const canGoPrev = currentPage > 1;
    const canGoNext = currentPage < totalPages;
    const sliderFill = ((currentPage - 1) / Math.max(1, totalPages - 1)) * 100;

    return (
        <nav
            aria-label="Navigasi Halaman Buku"
            className="w-full bg-white border-t border-slate-200/80 px-2 sm:px-4 py-2 flex items-center gap-2 select-none z-20 shrink-0"
        >
            {/* ── Left: Prev buttons ─────────────────────────────── */}
            <div className="flex items-center gap-1 shrink-0">
                <button
                    type="button"
                    onClick={() => onPageChange?.(1)}
                    disabled={!canGoPrev}
                    aria-label="Ke Halaman Pertama"
                    title="Halaman Pertama"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#0E2747] hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none transition-colors hidden sm:flex"
                >
                    <ChevronsLeft className="w-3.5 h-3.5" />
                </button>

                <button
                    type="button"
                    onClick={onPrevPage}
                    disabled={!canGoPrev}
                    aria-label="Halaman Sebelumnya"
                    className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[#0E2747] text-xs font-medium shadow-xs disabled:opacity-35 disabled:pointer-events-none transition-all active:scale-95"
                >
                    <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                </button>
            </div>

            {/* ── Center: page slider + input ────────────────────── */}
            <div className="flex-1 flex items-center gap-2 sm:gap-3 min-w-0">
                {/* Mobile: page counter only */}
                <div className="sm:hidden flex items-center gap-1.5 w-full justify-center">
                    <form onSubmit={handlePageSubmit} className="flex items-center gap-1">
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={pageInputValue}
                            onChange={(e) => setPageInputValue(e.target.value)}
                            onBlur={handlePageSubmit}
                            aria-label="Nomor halaman"
                            className="w-9 text-center py-1 text-xs font-bold text-[#0E2747] bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#0B63CE]"
                        />
                        <span className="text-[11px] text-slate-400">/ {totalPages}</span>
                    </form>

                    {onToggleBookmark && (
                        <button
                            type="button"
                            onClick={onToggleBookmark}
                            className={`p-1.5 rounded-lg border transition-colors ${
                                isCurrentBookmarked
                                    ? 'bg-[#EAF5FF] text-[#0B63CE] border-[#C8DFFF]'
                                    : 'bg-white text-slate-300 border-slate-200 hover:text-slate-500'
                            }`}
                        >
                            {isCurrentBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                        </button>
                    )}
                </div>

                {/* Desktop: range slider + page input */}
                <div className="hidden sm:flex items-center gap-3 w-full">
                    <input
                        type="range"
                        min={1}
                        max={Math.max(1, totalPages)}
                        value={currentPage}
                        onChange={handleSliderChange}
                        aria-label="Geser untuk memilih halaman"
                        className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, #0B63CE ${sliderFill}%, #E2EBF5 ${sliderFill}%)`,
                            accentColor: '#0B63CE',
                        }}
                    />

                    <form onSubmit={handlePageSubmit} className="flex items-center gap-1 shrink-0">
                        <span className="text-[11px] text-slate-400">Hal.</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={pageInputValue}
                            onChange={(e) => setPageInputValue(e.target.value)}
                            onBlur={handlePageSubmit}
                            aria-label="Ketik nomor halaman"
                            className="w-9 text-center py-1 text-xs font-bold text-[#0E2747] bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#0B63CE]"
                        />
                        <span className="text-[11px] text-slate-400">/ {totalPages}</span>
                    </form>
                </div>
            </div>

            {/* ── Right: zoom controls + bookmark + next ─────────── */}
            <div className="flex items-center gap-1 shrink-0">
                {/* Zoom controls — desktop */}
                <div className="hidden sm:flex items-center gap-0.5 border border-slate-200 rounded-lg overflow-hidden bg-slate-50 shrink-0">
                    <button
                        type="button"
                        onClick={onZoomOut}
                        disabled={zoom <= 60}
                        aria-label="Perkecil"
                        title="Perkecil (−)"
                        className="p-1.5 text-slate-500 hover:text-[#0E2747] hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                        <Minus className="w-3 h-3" />
                    </button>

                    {/* Zoom level button — click to show presets */}
                    <div className="relative" data-zoom-menu>
                        <button
                            type="button"
                            onClick={() => setShowZoomMenu((v) => !v)}
                            aria-label={`Zoom ${zoom}%`}
                            title="Pilih tingkat zoom"
                            className="px-2 py-1 text-[11px] font-bold text-[#0E2747] hover:bg-white min-w-[42px] text-center transition-colors"
                        >
                            {zoom}%
                        </button>

                        {/* Zoom preset dropdown */}
                        {showZoomMenu && (
                            <div
                                data-zoom-menu
                                className="absolute bottom-full right-0 mb-1.5 bg-white border border-slate-200 rounded-xl shadow-xl py-1 w-36 z-50"
                            >
                                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                    Tingkat Zoom
                                </div>
                                {ZOOM_PRESETS.map((preset) => (
                                    <button
                                        key={preset.value}
                                        type="button"
                                        onClick={() => {
                                            onSetZoom?.(preset.value);
                                            setShowZoomMenu(false);
                                        }}
                                        className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors flex items-center justify-between ${
                                            zoom === preset.value
                                                ? 'bg-[#EAF5FF] text-[#0B63CE]'
                                                : 'text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        <span>{preset.label}</span>
                                        {zoom === preset.value && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#0B63CE]" />
                                        )}
                                    </button>
                                ))}
                                <div className="border-t border-slate-100 mt-1 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => { onResetZoom?.(); setShowZoomMenu(false); }}
                                        className="w-full text-left px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50"
                                    >
                                        Reset ke 100%
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onZoomIn}
                        disabled={zoom >= 200}
                        aria-label="Perbesar"
                        title="Perbesar (+)"
                        className="p-1.5 text-slate-500 hover:text-[#0E2747] hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>

                {/* Bookmark button — desktop */}
                {onToggleBookmark && (
                    <button
                        type="button"
                        onClick={onToggleBookmark}
                        aria-label={isCurrentBookmarked ? 'Hapus penanda' : 'Tandai halaman'}
                        title={isCurrentBookmarked ? 'Hapus penanda' : 'Tandai halaman'}
                        className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                            isCurrentBookmarked
                                ? 'bg-[#EAF5FF] text-[#0B63CE] border-[#C8DFFF]'
                                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        {isCurrentBookmarked ? (
                            <><BookmarkCheck className="w-3.5 h-3.5" /><span>Ditandai</span></>
                        ) : (
                            <><Bookmark className="w-3.5 h-3.5 text-slate-300" /><span>Tandai</span></>
                        )}
                    </button>
                )}

                {/* Keyboard shortcut hint */}
                <div className="hidden lg:flex items-center gap-0.5">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-500 font-mono">◀</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-500 font-mono">▶</kbd>
                </div>

                {/* Next button */}
                <button
                    type="button"
                    onClick={onNextPage}
                    disabled={!canGoNext}
                    aria-label="Halaman Berikutnya"
                    className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[#0E2747] text-xs font-medium shadow-xs disabled:opacity-35 disabled:pointer-events-none transition-all active:scale-95"
                >
                    <span className="hidden sm:inline">Berikutnya</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                    type="button"
                    onClick={() => onPageChange?.(totalPages)}
                    disabled={!canGoNext}
                    aria-label="Ke Halaman Terakhir"
                    title="Halaman Terakhir"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#0E2747] hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none transition-colors hidden sm:flex"
                >
                    <ChevronsRight className="w-3.5 h-3.5" />
                </button>
            </div>
        </nav>
    );
}
