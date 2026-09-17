import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import {
    ArrowLeft, ZoomIn, ZoomOut, Maximize, Minimize,
    Download, Layers, ListOrdered, Info,
    ChevronLeft, ChevronRight,
    Bookmark, BookmarkCheck,
} from 'lucide-react';

const ZOOM_PRESETS = [75, 100, 125, 150, 175];

/**
 * FlipbookBottomBar
 * Fixed bottom toolbar. Three zones: left (back + indicator),
 * center (progress slider + page input), right (zoom, panels, fullscreen, download).
 */
export default function FlipbookBottomBar({
    material,
    currentPage = 1,
    totalPages = 1,
    spreadIndicator = '1 / 1',
    zoom = 100,
    canGoPrev = null,
    canGoNext = null,
    onZoomIn,
    onZoomOut,
    onResetZoom,
    onToggleZoom = null,
    onSetZoom,
    onPageChange,
    onPrevPage,
    onNextPage,
    isFullscreen = false,
    onToggleFullscreen,
    canDownload = false,
    downloadUrl = null,
    backUrl = '/koleksi',
    drawerOpen = false,
    onOpenDrawer,
    onCloseDrawer,
    isCurrentBookmarked = false,
    onToggleBookmark,
    viewMode = 'spread',
    onToggleViewMode = null,
    isMobile = false,
}) {
    const [pageInput, setPageInput] = useState(String(currentPage));
    const [sliderValue, setSliderValue] = useState(currentPage);
    const isDraggingRef = useRef(false);
    const [showZoomMenu, setShowZoomMenu] = useState(false);
    const zoomMenuRef = useRef(null);
    const zoomMenuMobileRef = useRef(null);

    useEffect(() => {
        setPageInput(String(currentPage));
        if (!isDraggingRef.current) {
            setSliderValue(currentPage);
        }
    }, [currentPage]);

    useEffect(() => {
        if (!showZoomMenu) return;
        const handler = (e) => {
            if (
                !zoomMenuRef.current?.contains(e.target) &&
                !zoomMenuMobileRef.current?.contains(e.target)
            ) {
                setShowZoomMenu(false);
            }
        };
        document.addEventListener('mousedown', handler);
        document.addEventListener('touchstart', handler);
        return () => {
            document.removeEventListener('mousedown', handler);
            document.removeEventListener('touchstart', handler);
        };
    }, [showZoomMenu]);

    const handleSliderChange = (e) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val)) {
            setSliderValue(val);
            setPageInput(String(val));
            onPageChange?.(val);
        }
    };

    const handlePageSubmit = (e) => {
        e?.preventDefault();
        const n = parseInt(pageInput, 10);
        if (!isNaN(n) && n >= 1 && n <= totalPages) {
            setSliderValue(n);
            onPageChange?.(n);
        } else {
            setPageInput(String(currentPage));
            setSliderValue(currentPage);
        }
    };

    const sliderFill = ((sliderValue - 1) / Math.max(1, totalPages - 1)) * 100;

    /** Reusable icon button */
    const IBtn = ({ label, Icon, onClick, active = false, disabled = false, className = '' }) => (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            title={label}
            className={[
                'flex items-center justify-center rounded-md transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE]',
                'w-7 h-7 sm:w-8 sm:h-8',
                active
                    ? 'bg-[#EAF5FF] text-[#0B63CE]'
                    : 'text-[#0E2747]/55 hover:text-[#0E2747] hover:bg-slate-100',
                disabled ? 'opacity-25 pointer-events-none' : 'cursor-pointer',
                className,
            ].join(' ')}
        >
            <Icon className="w-3.5 h-3.5" />
        </button>
    );

    const toggleDrawer = (panel) => {
        if (drawerOpen === panel) onCloseDrawer?.();
        else onOpenDrawer?.(panel);
    };

    return (
        <nav
            role="toolbar"
            aria-label="Kontrol Baca"
            className="w-full h-11 sm:h-12 bg-white/96 backdrop-blur-sm border-t border-[#DCE7F3] flex items-center gap-1 px-2 sm:px-4 shrink-0 z-30 select-none"
        >
            {/* ── LEFT: Back + Spread Indicator ───────────────────── */}
            <div className="flex items-center gap-1.5 shrink-0">
                <Link
                    href={backUrl}
                    aria-label="Kembali ke Detail Materi"
                    title="Kembali ke Detail Materi"
                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md text-[#0E2747]/50 hover:text-[#0E2747] hover:bg-slate-100 transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                </Link>

                <div className="hidden sm:block h-4 w-px bg-[#DCE7F3]" />

                <span
                    aria-live="polite"
                    aria-label={`Halaman ${spreadIndicator}`}
                    className="hidden sm:block text-[11px] font-mono font-bold text-[#0E2747]/65 tabular-nums whitespace-nowrap"
                >
                    {spreadIndicator}
                </span>
            </div>

            <div className="hidden sm:block h-4 w-px bg-[#DCE7F3] shrink-0" />

            {/* ── CENTER: Slider + Page Input ──────────────────────── */}
            <div className="flex-1 flex items-center gap-1.5 sm:gap-2 min-w-0">
                <button
                    type="button"
                    onClick={onPrevPage}
                    disabled={canGoPrev !== null ? !canGoPrev : currentPage <= 1}
                    aria-label="Halaman Sebelumnya"
                    className="hidden sm:flex w-6 h-6 items-center justify-center rounded text-[#0E2747]/45 hover:text-[#0E2747] disabled:opacity-20 disabled:pointer-events-none transition-colors"
                >
                    <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <input
                    type="range"
                    min={1}
                    max={Math.max(1, totalPages)}
                    value={sliderValue}
                    onMouseDown={() => { isDraggingRef.current = true; }}
                    onTouchStart={() => { isDraggingRef.current = true; }}
                    onMouseUp={() => { isDraggingRef.current = false; }}
                    onTouchEnd={() => { isDraggingRef.current = false; }}
                    onChange={handleSliderChange}
                    aria-label="Geser untuk memilih halaman"
                    className="flex-1 h-[3px] rounded-full appearance-none cursor-pointer min-w-0"
                    style={{
                        background: `linear-gradient(to right, #0B63CE ${sliderFill}%, #DCE7F3 ${sliderFill}%)`,
                        accentColor: '#0B63CE',
                    }}
                />

                <form onSubmit={handlePageSubmit} className="flex items-center gap-0.5 shrink-0">
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={pageInput}
                        onChange={(e) => setPageInput(e.target.value)}
                        onBlur={handlePageSubmit}
                        aria-label="Nomor halaman aktif"
                        className="w-8 text-center text-[11px] font-bold font-mono text-[#0E2747] bg-slate-50 border border-[#DCE7F3] rounded focus:outline-none focus:ring-1 focus:ring-[#0B63CE] py-0.5"
                    />
                    <span className="text-[10px] text-[#0E2747]/45 font-mono">/{totalPages}</span>
                </form>

                <button
                    type="button"
                    onClick={onNextPage}
                    disabled={canGoNext !== null ? !canGoNext : currentPage >= totalPages}
                    aria-label="Halaman Berikutnya"
                    className="hidden sm:flex w-6 h-6 items-center justify-center rounded text-[#0E2747]/45 hover:text-[#0E2747] disabled:opacity-20 disabled:pointer-events-none transition-colors"
                >
                    <ChevronRight className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="hidden sm:block h-4 w-px bg-[#DCE7F3] shrink-0" />

            {/* ── RIGHT: Controls ────────────────────────────────────── */}
            <div className="flex items-center gap-0.5 shrink-0">

                {/* Mobile Zoom Control (visible on < sm screens) */}
                <div className="relative sm:hidden" ref={zoomMenuMobileRef}>
                    <button
                        type="button"
                        onClick={() => setShowZoomMenu(v => !v)}
                        aria-label={`Zoom saat ini ${zoom}%, ketuk untuk opsi zoom`}
                        title="Zoom"
                        className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
                            zoom !== 100
                                ? 'bg-[#EAF5FF] text-[#0B63CE] font-mono text-[10px] font-bold ring-1 ring-[#0B63CE]/30'
                                : 'text-[#0E2747]/55 hover:text-[#0E2747] hover:bg-slate-100'
                        }`}
                    >
                        {zoom === 100 ? (
                            <ZoomIn className="w-3.5 h-3.5" />
                        ) : (
                            <span>{zoom}%</span>
                        )}
                    </button>

                    {showZoomMenu && (
                        <div className="absolute bottom-full right-0 mb-2 bg-white border border-[#DCE7F3] rounded-xl shadow-xl py-1.5 w-36 z-50">
                            <div className="flex items-center justify-between px-2.5 pb-1.5 mb-1 border-b border-[#DCE7F3]">
                                <button
                                    type="button"
                                    onClick={onZoomOut}
                                    disabled={zoom <= 60}
                                    className="p-1 rounded hover:bg-slate-100 text-[#0E2747] disabled:opacity-25 transition-colors"
                                    title="Perkecil"
                                    aria-label="Perkecil"
                                >
                                    <ZoomOut className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-xs font-mono font-bold text-[#0B63CE]">{zoom}%</span>
                                <button
                                    type="button"
                                    onClick={onZoomIn}
                                    disabled={zoom >= 200}
                                    className="p-1 rounded hover:bg-slate-100 text-[#0E2747] disabled:opacity-25 transition-colors"
                                    title="Perbesar"
                                    aria-label="Perbesar"
                                >
                                    <ZoomIn className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            {ZOOM_PRESETS.map(p => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => { onSetZoom?.(p); setShowZoomMenu(false); }}
                                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                                        zoom === p
                                            ? 'bg-[#EAF5FF] text-[#0B63CE] font-semibold'
                                            : 'text-[#112743] hover:bg-slate-50'
                                    }`}
                                >
                                    <span>{p}%</span>
                                    {zoom === p && <span className="w-1.5 h-1.5 rounded-full bg-[#0B63CE]" />}
                                </button>
                            ))}
                            <div className="border-t border-[#DCE7F3] mt-1 pt-1 px-1">
                                <button
                                    type="button"
                                    onClick={() => { onResetZoom?.(); setShowZoomMenu(false); }}
                                    className="w-full text-left px-2 py-1 text-xs text-[#6B7C93] hover:bg-slate-50 rounded"
                                >
                                    Reset 100%
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Desktop Zoom group (visible on sm+ screens) */}
                <div className="hidden sm:flex items-center border border-[#DCE7F3] rounded-md overflow-hidden bg-white">
                    <IBtn label="Perkecil" Icon={ZoomOut} onClick={onZoomOut} disabled={zoom <= 60} />

                    {/* Zoom level picker */}
                    <div className="relative" ref={zoomMenuRef}>
                        <button
                            type="button"
                            onClick={() => setShowZoomMenu(v => !v)}
                            aria-label={`Zoom saat ini ${zoom}%, klik untuk mengubah`}
                            title="Pilih zoom"
                            className="px-1.5 py-1 text-[10px] font-bold font-mono text-[#0E2747] hover:bg-slate-50 min-w-[38px] text-center transition-colors"
                        >
                            {zoom}%
                        </button>

                        {showZoomMenu && (
                            <div className="absolute bottom-full right-0 mb-2 bg-white border border-[#DCE7F3] rounded-xl shadow-xl py-1 w-32 z-50">
                                <p className="px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[#6B7C93] border-b border-[#DCE7F3]">
                                    Zoom
                                </p>
                                {ZOOM_PRESETS.map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => { onSetZoom?.(p); setShowZoomMenu(false); }}
                                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                                            zoom === p
                                                ? 'bg-[#EAF5FF] text-[#0B63CE] font-semibold'
                                                : 'text-[#112743] hover:bg-slate-50'
                                        }`}
                                    >
                                        <span>{p}%</span>
                                        {zoom === p && <span className="w-1.5 h-1.5 rounded-full bg-[#0B63CE]" />}
                                    </button>
                                ))}
                                <div className="border-t border-[#DCE7F3] mt-1 pt-1 px-1">
                                    <button
                                        type="button"
                                        onClick={() => { onSetZoom?.(100); setShowZoomMenu(false); }}
                                        className="w-full text-left px-2 py-1 text-xs text-[#6B7C93] hover:bg-slate-50 rounded"
                                    >
                                        Reset 100%
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <IBtn label="Perbesar" Icon={ZoomIn} onClick={onZoomIn} disabled={zoom >= 200} />
                </div>

                <div className="hidden sm:block h-4 w-px bg-[#DCE7F3] mx-0.5" />

                {/* Bookmark */}
                <IBtn
                    label={isCurrentBookmarked ? 'Hapus Penanda' : 'Tandai Halaman Ini'}
                    Icon={isCurrentBookmarked ? BookmarkCheck : Bookmark}
                    onClick={onToggleBookmark}
                    active={isCurrentBookmarked}
                    className="hidden sm:flex"
                />


                {/* Thumbnail */}
                <IBtn
                    label="Thumbnail Halaman"
                    Icon={Layers}
                    onClick={() => toggleDrawer('thumbnail')}
                    active={drawerOpen === 'thumbnail'}
                />

                {/* Table of Contents */}
                <IBtn
                    label="Daftar Isi"
                    Icon={ListOrdered}
                    onClick={() => toggleDrawer('toc')}
                    active={drawerOpen === 'toc'}
                />

                {/* Detail */}
                <IBtn
                    label="Detail Materi"
                    Icon={Info}
                    onClick={() => toggleDrawer('detail')}
                    active={drawerOpen === 'detail'}
                    className="hidden sm:flex"
                />

                <div className="hidden sm:block h-4 w-px bg-[#DCE7F3] mx-0.5" />

                {/* Fullscreen */}
                <IBtn
                    label={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
                    Icon={isFullscreen ? Minimize : Maximize}
                    onClick={onToggleFullscreen}
                    className="hidden sm:flex"
                />

                {/* Download */}
                {canDownload && downloadUrl && (
                    <a
                        href={downloadUrl}
                        download
                        aria-label="Unduh PDF"
                        title="Unduh PDF"
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md text-[#0E2747]/55 hover:text-[#0B63CE] hover:bg-[#EAF5FF] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE]"
                    >
                        <Download className="w-3.5 h-3.5" />
                    </a>
                )}
            </div>
        </nav>
    );
}
