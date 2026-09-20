import React from 'react';
import { ArrowLeft, BookOpen, ZoomIn, ZoomOut, Maximize2, Minimize2, PanelRight, Download } from 'lucide-react';
import { Link } from '@inertiajs/react';
import StatusBadge from '../admin/StatusBadge';

export default function ReaderToolbar({
    title,
    author,
    category,
    status = 'published',
    zoom = 100,
    onZoomIn,
    onZoomOut,
    isFullscreen = false,
    onToggleFullscreen,
    isSidebarOpen = true,
    onToggleSidebar,
    canDownload = false,
    downloadUrl = null,
    backUrl = '/admin/koleksi',
}) {
    return (
        <header className="h-16 bg-[#0E2747] text-white px-4 sm:px-6 flex items-center justify-between border-b border-[#1A3860] shrink-0 z-20 shadow-sm">
            {/* Left section: Back button & Title */}
            <div className="flex items-center gap-3 min-w-0">
                <Link
                    href={backUrl}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 transition-all shrink-0"
                    title="Kembali ke Koleksi"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Kembali</span>
                </Link>

                <div className="h-6 w-px bg-white/15 hidden sm:block shrink-0" />

                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h1 className="text-sm font-bold text-white truncate max-w-[200px] md:max-w-md lg:max-w-lg" title={title}>
                            {title}
                        </h1>
                        {status && status !== 'published' && (
                            <span className="hidden md:inline-block">
                                <StatusBadge status={status} size="sm" />
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-white/70 truncate">
                        {category && (
                            <span className="inline-flex items-center gap-1 text-[#62B0FF] font-medium">
                                <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: category.color || '#0B63CE' }}
                                />
                                {category.name}
                            </span>
                        )}
                        {category && author && <span>&bull;</span>}
                        {author && <span>{author}</span>}
                    </div>
                </div>
            </div>

            {/* Right section: Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Zoom Controls */}
                <div className="hidden sm:flex items-center bg-white/10 rounded-lg p-0.5 border border-white/10">
                    <button
                        type="button"
                        onClick={onZoomOut}
                        disabled={zoom <= 50}
                        className="p-1.5 rounded-md hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-transparent text-white transition-colors"
                        title="Perkecil (-)"
                        aria-label="Perkecil"
                    >
                        <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-mono px-2 text-white/90 select-none min-w-[45px] text-center">
                        {zoom}%
                    </span>
                    <button
                        type="button"
                        onClick={onZoomIn}
                        disabled={zoom >= 200}
                        className="p-1.5 rounded-md hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-transparent text-white transition-colors"
                        title="Perbesar (+)"
                        aria-label="Perbesar"
                    >
                        <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Download Button (Only if authorized) */}
                {canDownload && downloadUrl && (
                    <a
                        href={downloadUrl}
                        download
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0B63CE] hover:bg-[#0A3F82] rounded-lg transition-colors shadow-xs"
                        title="Unduh Berkas PDF Resmi"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Unduh PDF</span>
                    </a>
                )}

                {/* Fullscreen Button */}
                <button
                    type="button"
                    onClick={onToggleFullscreen}
                    className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                    title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
                    aria-label="Layar Penuh"
                >
                    {isFullscreen ? (
                        <Minimize2 className="w-4 h-4" />
                    ) : (
                        <Maximize2 className="w-4 h-4" />
                    )}
                </button>

                {/* Toggle Detail Sidebar Button */}
                <button
                    type="button"
                    onClick={onToggleSidebar}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                        isSidebarOpen
                            ? 'bg-[#0B63CE] text-white border-[#0B63CE]'
                            : 'bg-white/10 text-white/90 hover:bg-white/15 border-white/10'
                    }`}
                    title="Detail Materi"
                    aria-label="Detail Materi"
                >
                    <PanelRight className="w-4 h-4" />
                    <span className="hidden sm:inline">Detail</span>
                </button>
            </div>
        </header>
    );
}
