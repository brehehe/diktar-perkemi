import React from 'react';
import { ArrowLeft, Download, Maximize, Minimize, PanelRight, Menu, BookOpen } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function ReaderToolbar({
    title,
    coverPath,
    category,
    currentPage = 1,
    totalPages = 1,
    canDownload = false,
    downloadUrl = null,
    backUrl = '/koleksi',
    isFullscreen = false,
    onToggleFullscreen,
    isSidebarOpen = false,
    onToggleSidebar,
    onOpenMobileDrawer,
}) {
    return (
        <header className="h-12 sm:h-14 w-full bg-white border-b border-slate-200/80 px-3 sm:px-5 flex items-center justify-between shrink-0 z-30 select-none">
            {/* Left: Back + Book Identity */}
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <Link
                    href={backUrl}
                    aria-label="Kembali ke Detail Koleksi"
                    title="Kembali ke Detail Koleksi"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-[#0E2747] hover:bg-slate-100 transition-colors text-xs font-medium shrink-0"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Kembali ke Detail</span>
                </Link>

                <div className="h-4 w-px bg-slate-200 hidden sm:block shrink-0" />

                {/* Book identity */}
                <div className="flex items-center gap-2 min-w-0">
                    {coverPath ? (
                        <div className="w-6 h-8 rounded overflow-hidden border border-slate-200/80 shrink-0 hidden sm:block shadow-sm">
                            <img src={coverPath} alt={title} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-6 h-8 rounded bg-[#EAF5FF] border border-[#C8DFFF] items-center justify-center shrink-0 hidden sm:flex">
                            <BookOpen className="w-3.5 h-3.5 text-[#0B63CE]" />
                        </div>
                    )}

                    <div className="min-w-0">
                        <h1 className="text-xs font-semibold text-[#0E2747] truncate max-w-[160px] sm:max-w-xs md:max-w-sm leading-snug">
                            {title}
                        </h1>
                        {category && (
                            <span className="hidden lg:inline-flex text-[10px] text-slate-400 font-medium">
                                {category.name}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Center: page indicator pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200/80 text-[11px] font-semibold text-slate-600 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Hal. {currentPage} dari {totalPages}</span>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-1 shrink-0">
                {canDownload && downloadUrl && (
                    <a
                        href={downloadUrl}
                        download
                        aria-label="Unduh Dokumen PDF"
                        title="Unduh PDF"
                        className="p-2 rounded-lg text-slate-500 hover:text-[#0B63CE] hover:bg-[#EAF5FF] transition-colors hidden sm:flex items-center gap-1.5 text-xs font-medium border border-transparent hover:border-[#C8DFFF]"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden xl:inline text-xs">Unduh PDF</span>
                    </a>
                )}

                <button
                    type="button"
                    onClick={onToggleFullscreen}
                    aria-label={isFullscreen ? 'Keluar dari layar penuh' : 'Layar penuh'}
                    title={isFullscreen ? 'Keluar Fullscreen (Esc)' : 'Layar Penuh (F)'}
                    className="p-2 rounded-lg text-slate-400 hover:text-[#0E2747] hover:bg-slate-100 transition-colors hidden sm:flex"
                >
                    {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
                </button>

                <button
                    type="button"
                    onClick={onToggleSidebar}
                    aria-label={isSidebarOpen ? 'Tutup panel samping' : 'Buka panel samping'}
                    title="Panel Informasi"
                    className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        isSidebarOpen
                            ? 'bg-[#EAF5FF] text-[#0B63CE] border-[#C8DFFF]'
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                >
                    <PanelRight className="w-3.5 h-3.5" />
                    <span>Panel Informasi</span>
                </button>

                <button
                    type="button"
                    onClick={onOpenMobileDrawer}
                    aria-label="Buka Menu"
                    className="lg:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0E2747] transition-colors flex items-center"
                >
                    <Menu className="w-4 h-4" />
                </button>
            </div>
        </header>
    );
}
