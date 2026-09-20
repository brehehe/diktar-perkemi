import React, { useState, useEffect } from 'react';
import { X, Info, BookOpenCheck, ListOrdered, Bookmark, Settings, Trash2 } from 'lucide-react';
import ReaderDetailsPanel from './ReaderDetailsPanel';
import KeyPointsPanel from './KeyPointsPanel';
import TableOfContents from './TableOfContents';
import ReadingSettings from './ReadingSettings';

export default function ReaderMobileDrawer({
    isOpen = false,
    onClose,
    material,
    fileInfo,
    canDownload = false,
    downloadUrl = null,
    backUrl = '/koleksi',
    currentPage = 1,
    tableOfContents = [],
    keyPoints = [],
    learningObjectives = [],
    targetAudiences = [],
    bookmarks = [],
    onSelectPage,
    onDeleteBookmark,
    zoom = 100,
    onZoomIn,
    onZoomOut,
    onResetZoom,
    viewMode = 'spread',
    onToggleViewMode,
    isFullscreen = false,
    onToggleFullscreen,
}) {
    const [activeTab, setActiveTab] = useState('points'); // 'points' | 'toc' | 'bookmarks' | 'details' | 'settings'

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose?.();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const tabs = [
        { id: 'points', label: 'Poin Penting', icon: BookOpenCheck },
        { id: 'toc', label: 'Daftar Isi', icon: ListOrdered },
        { id: 'bookmarks', label: 'Penanda', icon: Bookmark, badge: bookmarks.length },
        { id: 'details', label: 'Detail', icon: Info },
        { id: 'settings', label: 'Pengaturan', icon: Settings },
    ];

    return (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-200"
                aria-hidden="true"
            />

            {/* Slide-over Drawer / Sheet */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Informasi dan Navigasi Buku"
                className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200 ease-out"
            >
                {/* Header with Title and Close */}
                <div className="flex items-center justify-between p-4 border-b border-[#DCE7F3] bg-slate-50/70">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span className="text-sm font-bold text-[#0E2747] font-serif truncate">
                            {material?.title || 'Informasi Buku'}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup panel"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0B63CE]"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-[#DCE7F3] bg-white overflow-x-auto no-scrollbar shrink-0">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                                    isActive
                                        ? 'border-[#0B63CE] text-[#0B63CE] bg-[#EAF5FF]/30'
                                        : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                <span>{tab.label}</span>
                                {tab.badge > 0 && (
                                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-[#0B63CE] text-white">
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    {activeTab === 'points' && (
                        <KeyPointsPanel
                            summary={material?.summary}
                            keyPoints={keyPoints}
                            learningObjectives={learningObjectives}
                            targetAudiences={targetAudiences}
                        />
                    )}

                    {activeTab === 'toc' && (
                        <TableOfContents
                            items={tableOfContents}
                            currentPage={currentPage}
                            onSelectPage={(page) => {
                                onSelectPage?.(page);
                                onClose?.();
                            }}
                        />
                    )}

                    {activeTab === 'bookmarks' && (
                        <div className="space-y-3">
                            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                Penanda Halaman Tersimpan ({bookmarks.length})
                            </div>

                            {bookmarks.length === 0 ? (
                                <div className="py-12 text-center text-xs text-slate-400">
                                    <Bookmark className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                                    <p className="font-medium text-slate-500">Belum ada penanda halaman.</p>
                                    <p className="mt-1">Gunakan tombol "Tandai Halaman" di navigasi bawah untuk menyimpan halaman penting.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {bookmarks.map((bm) => (
                                        <div
                                            key={bm.id}
                                            className="flex items-center justify-between p-3 rounded-xl border border-[#DCE7F3] bg-white shadow-2xs hover:border-[#0B63CE]/30"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    onSelectPage?.(bm.page_number);
                                                    onClose?.();
                                                }}
                                                className="flex items-center gap-2.5 text-left flex-1 min-w-0"
                                            >
                                                <span className="px-2 py-0.5 rounded bg-[#EAF5FF] text-[#0B63CE] text-xs font-bold font-mono">
                                                    Hal. {bm.page_number}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-xs font-semibold text-slate-800 truncate">
                                                        {bm.title || `Halaman ${bm.page_number}`}
                                                    </div>
                                                    {bm.note && (
                                                        <div className="text-[11px] text-slate-500 truncate">
                                                            {bm.note}
                                                        </div>
                                                    )}
                                                </div>
                                            </button>

                                            {onDeleteBookmark && (
                                                <button
                                                    type="button"
                                                    onClick={() => onDeleteBookmark(bm.id)}
                                                    aria-label="Hapus penanda"
                                                    title="Hapus penanda"
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-2"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'details' && (
                        <ReaderDetailsPanel
                            material={material}
                            fileInfo={fileInfo}
                            canDownload={canDownload}
                            downloadUrl={downloadUrl}
                            backUrl={backUrl}
                        />
                    )}

                    {activeTab === 'settings' && (
                        <ReadingSettings
                            zoom={zoom}
                            onZoomIn={onZoomIn}
                            onZoomOut={onZoomOut}
                            onResetZoom={onResetZoom}
                            viewMode={viewMode}
                            onToggleViewMode={onToggleViewMode}
                            isFullscreen={isFullscreen}
                            onToggleFullscreen={onToggleFullscreen}
                            isSidebarOpen={true}
                            onToggleSidebar={onClose}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
