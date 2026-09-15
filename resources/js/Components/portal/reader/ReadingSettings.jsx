import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, BookOpen, FileText, Maximize, Minimize, PanelRightClose, PanelRightOpen } from 'lucide-react';

export default function ReadingSettings({
    zoom = 100,
    onZoomIn,
    onZoomOut,
    onResetZoom,
    viewMode = 'spread', // 'spread' | 'single'
    onToggleViewMode,
    isFullscreen = false,
    onToggleFullscreen,
    isSidebarOpen = true,
    onToggleSidebar,
}) {
    return (
        <div className="space-y-6 text-sm text-[#0E2747]">
            {/* Zoom Controls */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Skala Tampilan (Zoom)
                </label>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onZoomOut}
                        disabled={zoom <= 60}
                        aria-label="Perkecil tampilan buku"
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#DCE7F3] bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>

                    <div className="flex-1 text-center font-semibold py-1.5 px-3 bg-slate-50 border border-[#DCE7F3] rounded-lg text-slate-700 select-none">
                        {zoom}%
                    </div>

                    <button
                        type="button"
                        onClick={onZoomIn}
                        disabled={zoom >= 200}
                        aria-label="Perbesar tampilan buku"
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#DCE7F3] bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        onClick={onResetZoom}
                        aria-label="Reset zoom ke ukuran normal 100%"
                        title="Reset ke 100%"
                        className="px-3 h-9 flex items-center gap-1.5 rounded-lg border border-[#DCE7F3] bg-white hover:bg-slate-50 text-xs font-medium text-slate-600 transition-colors"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Reset</span>
                    </button>
                </div>
            </div>

            {/* View Mode (1 Page vs 2 Pages Spread) */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Tata Letak Halaman
                </label>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => onToggleViewMode('spread')}
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                            viewMode === 'spread'
                                ? 'bg-[#0B63CE] text-white border-[#0B63CE] shadow-sm'
                                : 'bg-white text-slate-700 border-[#DCE7F3] hover:bg-slate-50'
                        }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        <span>Buku Terbuka (2 Hal)</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onToggleViewMode('single')}
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                            viewMode === 'single'
                                ? 'bg-[#0B63CE] text-white border-[#0B63CE] shadow-sm'
                                : 'bg-white text-slate-700 border-[#DCE7F3] hover:bg-slate-50'
                        }`}
                    >
                        <FileText className="w-4 h-4" />
                        <span>Satu Halaman</span>
                    </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                    Mode dua halaman otomatis menyesuaikan di layar desktop lebar.
                </p>
            </div>

            {/* Layout Toggles */}
            <div className="pt-4 border-t border-[#DCE7F3] space-y-2">
                <button
                    type="button"
                    onClick={onToggleFullscreen}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-[#DCE7F3] bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                >
                    <span className="flex items-center gap-2">
                        {isFullscreen ? <Minimize className="w-4 h-4 text-[#0B63CE]" /> : <Maximize className="w-4 h-4 text-slate-500" />}
                        {isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh (Fullscreen)'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">F / Esc</span>
                </button>

                <button
                    type="button"
                    onClick={onToggleSidebar}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-[#DCE7F3] bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                >
                    <span className="flex items-center gap-2">
                        {isSidebarOpen ? <PanelRightClose className="w-4 h-4 text-[#0B63CE]" /> : <PanelRightOpen className="w-4 h-4 text-slate-500" />}
                        {isSidebarOpen ? 'Sembunyikan Panel Samping' : 'Tampilkan Panel Samping'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Ctrl+\</span>
                </button>
            </div>
        </div>
    );
}
