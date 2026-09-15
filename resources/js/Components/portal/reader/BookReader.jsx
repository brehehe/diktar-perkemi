import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { router } from '@inertiajs/react';
import {
    BookOpenCheck,
    ListOrdered,
    Bookmark,
    Info,
    Settings,
    ChevronRight,
    ChevronLeft,
    Trash2
} from 'lucide-react';

import ReaderToolbar from './ReaderToolbar';
import ReaderProgress from './ReaderProgress';
import BookViewport from './BookViewport';
import ReaderNavigation from './ReaderNavigation';
import KeyPointsPanel from './KeyPointsPanel';
import TableOfContents from './TableOfContents';
import ReaderDetailsPanel from './ReaderDetailsPanel';
import ReadingSettings from './ReadingSettings';
import ReaderMobileDrawer from './ReaderMobileDrawer';

// Configure Mozilla PDF.js worker locally via Vite asset pipeline
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function BookReader({
    material,
    hasFile = false,
    fileInfo = null,
    fileUrl = null,
    downloadUrl = null,
    canDownload = false,
    lastReadPage = 1,
    initialPage = null,
    bookmarks = [],
    tableOfContents = [],
    keyPoints = [],
    learningObjectives = [],
    targetAudiences = [],
    backUrl = null,
}) {
    const defaultBackUrl = material?.slug ? `/koleksi/${material.slug}` : '/koleksi';
    const resolvedBackUrl = backUrl || defaultBackUrl;

    // PDF Document state
    const [pdfDoc, setPdfDoc] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [totalPages, setTotalPages] = useState(material?.page_count || 1);

    // Reading & view state
    const [currentPage, setCurrentPage] = useState(initialPage || lastReadPage || 1);
    const [zoom, setZoom] = useState(100);
    const [viewMode, setViewMode] = useState('spread'); // 'spread' | 'single'
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
    const [sidebarTab, setSidebarTab] = useState('points'); // 'points' | 'toc' | 'bookmarks' | 'details' | 'settings'

    // Responsive screen width state
    const [isMobile, setIsMobile] = useState(false);

    // Local bookmarks list
    const [localBookmarks, setLocalBookmarks] = useState(bookmarks || []);
    const progressTimeoutRef = useRef(null);
    const containerRef = useRef(null);

    // Sync bookmarks prop if changed
    useEffect(() => {
        setLocalBookmarks(bookmarks || []);
    }, [bookmarks]);

    // Responsive listener
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) {
                setViewMode('single');
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Load PDF Document safely
    const loadPdfDocument = useCallback(async () => {
        if (!hasFile || !fileUrl) {
            setIsLoading(false);
            setLoadError('Berkas buku digital belum diunggah atau tidak ditemukan di penyimpanan portal.');
            return;
        }

        try {
            setIsLoading(true);
            setLoadError(null);

            const loadingTask = pdfjsLib.getDocument({
                url: fileUrl,
                withCredentials: true,
            });

            const doc = await loadingTask.promise;
            setPdfDoc(doc);
            setTotalPages(doc.numPages);
            setIsLoading(false);
        } catch (err) {
            console.error('Failed to load PDF with PDF.js:', err);
            setIsLoading(false);
            setLoadError('Gagal membuka berkas buku digital. Pastikan koneksi Anda lancar dan coba muat ulang.');
        }
    }, [hasFile, fileUrl]);

    useEffect(() => {
        loadPdfDocument();
    }, [loadPdfDocument]);

    // Save Reading Progress with Throttling / Debounce
    const saveReadingProgress = useCallback((page, total) => {
        if (!material?.slug) return;

        if (progressTimeoutRef.current) {
            clearTimeout(progressTimeoutRef.current);
        }

        progressTimeoutRef.current = setTimeout(() => {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            fetch(`/koleksi/${material.slug}/progres`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
                body: JSON.stringify({
                    page: page,
                    total_pages: total,
                }),
            }).catch((err) => {
                // Background progress save failure shouldn't interrupt reader
                console.warn('Progress save ping deferred:', err);
            });
        }, 1200);
    }, [material?.slug]);

    // Page change handler
    const handlePageChange = useCallback((newPage) => {
        const safePage = Math.min(Math.max(1, newPage), totalPages);
        setCurrentPage(safePage);
        saveReadingProgress(safePage, totalPages);
    }, [totalPages, saveReadingProgress]);

    // Next Page Step (two pages in spread, one page in single)
    const handleNextPage = useCallback(() => {
        if (currentPage >= totalPages) return;

        if (viewMode === 'spread' && !isMobile) {
            if (currentPage === 1) {
                handlePageChange(2);
            } else {
                handlePageChange(currentPage + 2);
            }
        } else {
            handlePageChange(currentPage + 1);
        }
    }, [currentPage, totalPages, viewMode, isMobile, handlePageChange]);

    // Previous Page Step
    const handlePrevPage = useCallback(() => {
        if (currentPage <= 1) return;

        if (viewMode === 'spread' && !isMobile) {
            if (currentPage <= 3) {
                handlePageChange(1);
            } else {
                handlePageChange(currentPage - 2);
            }
        } else {
            handlePageChange(currentPage - 1);
        }
    }, [currentPage, viewMode, isMobile, handlePageChange]);

    // Zoom handlers
    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 15, 200));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 15, 60));
    const handleResetZoom = () => setZoom(100);

    // Fullscreen Toggle
    const handleToggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen?.().then(() => {
                setIsFullscreen(true);
            }).catch(() => {
                setIsFullscreen(true);
            });
        } else {
            document.exitFullscreen?.().then(() => {
                setIsFullscreen(false);
            }).catch(() => {
                setIsFullscreen(false);
            });
        }
    };

    useEffect(() => {
        const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, []);

    // Bookmark Toggle for current page
    const isCurrentPageBookmarked = localBookmarks.some((b) => b.page_number === currentPage);

    const handleToggleBookmark = async () => {
        if (!material?.slug) return;

        const existing = localBookmarks.find((b) => b.page_number === currentPage);
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        if (existing) {
            // Remove bookmark
            try {
                const res = await fetch(`/koleksi/${material.slug}/bookmark/${existing.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                        ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                    },
                });
                if (res.ok) {
                    setLocalBookmarks((prev) => prev.filter((b) => b.id !== existing.id));
                }
            } catch (e) {
                console.error('Error deleting bookmark:', e);
            }
        } else {
            // Add bookmark
            try {
                const res = await fetch(`/koleksi/${material.slug}/bookmark`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                    },
                    body: JSON.stringify({
                        page_number: currentPage,
                        title: `Halaman ${currentPage}`,
                    }),
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data?.bookmark) {
                        setLocalBookmarks((prev) => [...prev, data.bookmark].sort((a, b) => a.page_number - b.page_number));
                    }
                }
            } catch (e) {
                console.error('Error saving bookmark:', e);
            }
        }
    };

    const handleDeleteBookmark = async (bookmarkId) => {
        if (!material?.slug) return;
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        try {
            const res = await fetch(`/koleksi/${material.slug}/bookmark/${bookmarkId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
            });
            if (res.ok) {
                setLocalBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
            }
        } catch (e) {
            console.error('Error deleting bookmark:', e);
        }
    };

    // Keyboard navigation listener (left/right, escape)
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ignore if active element is an input, textarea, or contentEditable
            const tag = document.activeElement?.tagName?.toLowerCase();
            if (tag === 'input' || tag === 'textarea' || tag === 'select' || document.activeElement?.isContentEditable) {
                return;
            }

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                handlePrevPage();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                handleNextPage();
            } else if (e.key === 'Escape') {
                if (isMobileDrawerOpen) {
                    setIsMobileDrawerOpen(false);
                } else if (isFullscreen) {
                    document.exitFullscreen?.().catch(() => {});
                }
            } else if (e.key === 'f' || e.key === 'F') {
                e.preventDefault();
                handleToggleFullscreen();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handlePrevPage, handleNextPage, isMobileDrawerOpen, isFullscreen]);

    const sidebarTabs = [
        { id: 'points', label: 'Poin Penting', icon: BookOpenCheck },
        { id: 'toc', label: 'Daftar Isi', icon: ListOrdered },
        { id: 'bookmarks', label: 'Penanda', icon: Bookmark, badge: localBookmarks.length },
        { id: 'details', label: 'Detail', icon: Info },
        { id: 'settings', label: 'Pengaturan', icon: Settings },
    ];

    return (
        <div
            ref={containerRef}
            className="flex flex-col h-screen w-screen bg-[#EDF2F8] overflow-hidden select-none font-sans"
        >
            {/* 1. Header Reader Toolbar */}
            <ReaderToolbar
                title={material?.title}
                coverPath={material?.cover_path}
                category={material?.category}
                currentPage={currentPage}
                totalPages={totalPages}
                canDownload={canDownload}
                downloadUrl={downloadUrl}
                backUrl={resolvedBackUrl}
                isFullscreen={isFullscreen}
                onToggleFullscreen={handleToggleFullscreen}
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
                onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
            />

            {/* 2. Thin Primary Blue Progress Bar */}
            <ReaderProgress
                currentPage={currentPage}
                totalPages={totalPages}
            />

            {/* 3. Main Reading Area (Viewport + Desktop Sidebar) */}
            <div className="flex-1 flex relative overflow-hidden">
                {/* Book Viewport with Canvas Engine */}
                <main className="flex-1 flex flex-col relative h-full overflow-hidden">
                    <BookViewport
                        pdfDoc={pdfDoc}
                        isLoading={isLoading}
                        error={loadError}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        scale={zoom / 100}
                        viewMode={viewMode}
                        isMobile={isMobile}
                        onRetry={loadPdfDocument}
                        backUrl={resolvedBackUrl}
                    />

                    {/* Side-turn buttons: absolute within <main> NOT inside the scroll viewport
                         so they stay centred in the visible area regardless of scroll position */}
                    {!isMobile && pdfDoc && !isLoading && (
                        <>
                            <button
                                type="button"
                                onClick={handlePrevPage}
                                disabled={currentPage <= 1}
                                aria-label="Halaman Sebelumnya"
                                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-slate-600 hover:text-[#0E2747] shadow-md border border-white/60 backdrop-blur-sm flex items-center justify-center disabled:opacity-0 disabled:pointer-events-none transition-all hover:scale-105 active:scale-95"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={handleNextPage}
                                disabled={currentPage >= totalPages}
                                aria-label="Halaman Berikutnya"
                                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-slate-600 hover:text-[#0E2747] shadow-md border border-white/60 backdrop-blur-sm flex items-center justify-center disabled:opacity-0 disabled:pointer-events-none transition-all hover:scale-105 active:scale-95"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </>
                    )}

                    {/* Bottom Navigation Controls */}
                    <ReaderNavigation
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        onPrevPage={handlePrevPage}
                        onNextPage={handleNextPage}
                        isCurrentBookmarked={isCurrentPageBookmarked}
                        onToggleBookmark={handleToggleBookmark}
                        zoom={zoom}
                        onZoomIn={handleZoomIn}
                        onZoomOut={handleZoomOut}
                        onResetZoom={handleResetZoom}
                        onSetZoom={setZoom}
                    />
                </main>

                {/* Desktop Collapsible Right Sidebar */}
                {isSidebarOpen && !isMobile && (
                    <aside
                        aria-label="Panel Samping Informasi Materi"
                        className="w-72 xl:w-80 h-full bg-white border-l border-slate-200/80 flex flex-col shrink-0 z-20"
                    >
                        {/* Sidebar Tabs */}
                        <div className="flex border-b border-slate-200/80 bg-slate-50/80 shrink-0">
                            {sidebarTabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = sidebarTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setSidebarTab(tab.id)}
                                        aria-label={tab.label}
                                        title={tab.label}
                                        className={`flex-1 flex flex-col items-center justify-center py-2 px-1 text-[10px] font-semibold border-b-2 transition-all ${
                                            isActive
                                                ? 'border-[#0B63CE] text-[#0B63CE] bg-white'
                                                : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100/60'
                                        }`}
                                    >
                                        <div className="relative">
                                            <Icon className="w-3.5 h-3.5 mb-0.5" />
                                            {tab.badge > 0 && (
                                                <span className="absolute -top-1 -right-2 min-w-[14px] px-0.5 rounded-full text-[9px] bg-[#0B63CE] text-white leading-[14px] text-center font-mono">
                                                    {tab.badge}
                                                </span>
                                            )}
                                        </div>
                                        <span className="truncate max-w-[56px]">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Sidebar Content Panel */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {sidebarTab === 'points' && (
                                <KeyPointsPanel
                                    summary={material?.summary}
                                    keyPoints={keyPoints}
                                    learningObjectives={learningObjectives}
                                    targetAudiences={targetAudiences}
                                />
                            )}

                            {sidebarTab === 'toc' && (
                                <TableOfContents
                                    items={tableOfContents}
                                    currentPage={currentPage}
                                    onSelectPage={handlePageChange}
                                />
                            )}

                            {sidebarTab === 'bookmarks' && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Penanda Halaman ({localBookmarks.length})</span>
                                        <button
                                            type="button"
                                            onClick={handleToggleBookmark}
                                            className="text-[11px] text-[#0B63CE] hover:underline font-semibold lowercase"
                                        >
                                            {isCurrentPageBookmarked ? 'Hapus Hal. Ini' : '+ Tandai Hal. Ini'}
                                        </button>
                                    </div>

                                    {localBookmarks.length === 0 ? (
                                        <div className="py-12 text-center text-xs text-slate-400">
                                            <Bookmark className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                                            <p className="font-medium text-slate-500">Belum ada penanda halaman.</p>
                                            <p className="mt-1">Gunakan tombol "Tandai Halaman" di navigasi bawah untuk menandai bab atau halaman penting.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {localBookmarks.map((bm) => (
                                                <div
                                                    key={bm.id}
                                                    className="flex items-center justify-between p-3 rounded-xl border border-[#DCE7F3] bg-white shadow-2xs hover:border-[#0B63CE]/40 transition-all"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => handlePageChange(bm.page_number)}
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

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteBookmark(bm.id)}
                                                        aria-label="Hapus penanda"
                                                        title="Hapus penanda"
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-2"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {sidebarTab === 'details' && (
                                <ReaderDetailsPanel
                                    material={material}
                                    fileInfo={fileInfo}
                                    canDownload={canDownload}
                                    downloadUrl={downloadUrl}
                                    backUrl={resolvedBackUrl}
                                />
                            )}

                            {sidebarTab === 'settings' && (
                                <ReadingSettings
                                    zoom={zoom}
                                    onZoomIn={handleZoomIn}
                                    onZoomOut={handleZoomOut}
                                    onResetZoom={handleResetZoom}
                                    viewMode={viewMode}
                                    onToggleViewMode={setViewMode}
                                    isFullscreen={isFullscreen}
                                    onToggleFullscreen={handleToggleFullscreen}
                                    isSidebarOpen={isSidebarOpen}
                                    onToggleSidebar={() => setIsSidebarOpen(false)}
                                />
                            )}
                        </div>
                    </aside>
                )}
            </div>

            {/* 4. Mobile & Tablet Drawer */}
            <ReaderMobileDrawer
                isOpen={isMobileDrawerOpen}
                onClose={() => setIsMobileDrawerOpen(false)}
                material={material}
                fileInfo={fileInfo}
                canDownload={canDownload}
                downloadUrl={downloadUrl}
                backUrl={resolvedBackUrl}
                currentPage={currentPage}
                tableOfContents={tableOfContents}
                keyPoints={keyPoints}
                learningObjectives={learningObjectives}
                targetAudiences={targetAudiences}
                bookmarks={localBookmarks}
                onSelectPage={handlePageChange}
                onDeleteBookmark={handleDeleteBookmark}
                zoom={zoom}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetZoom={handleResetZoom}
                viewMode={viewMode}
                onToggleViewMode={setViewMode}
                isFullscreen={isFullscreen}
                onToggleFullscreen={handleToggleFullscreen}
            />
        </div>
    );
}
