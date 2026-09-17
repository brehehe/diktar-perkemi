import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { router } from '@inertiajs/react';

import FlipbookSpread from './FlipbookSpread';
import FlipbookSideArrows from './FlipbookSideArrows';
import FlipbookBottomBar from './FlipbookBottomBar';
import FlipbookDrawer from './FlipbookDrawer';
import ReaderLoadingState from './ReaderLoadingState';
import ReaderErrorState from './ReaderErrorState';

// Configure PDF.js worker via Vite asset pipeline
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function FlipbookStage({
    material,
    hasFile = false,
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
    fileInfo = null,
    backUrl = null,
}) {
    const resolvedBackUrl = backUrl || (material?.slug ? `/koleksi/${material.slug}` : '/koleksi');

    // ── PDF State ────────────────────────────────────────────────────────────
    const [pdfDoc, setPdfDoc] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [totalPages, setTotalPages] = useState(material?.page_count || 1);

    // ── Navigation State ─────────────────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(initialPage || lastReadPage || 1);
    const [direction, setDirection] = useState(0); // 0 = initial, 1 = forward, -1 = backward
    const [viewMode, setViewMode] = useState('spread'); // 'spread' | 'single'
    const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);

    // ── UI State ─────────────────────────────────────────────────────────────
    const [zoom, setZoom] = useState(100);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false); // false | 'thumbnail' | 'toc' | 'detail'

    // ── Local bookmarks ──────────────────────────────────────────────────────
    const [localBookmarks, setLocalBookmarks] = useState(bookmarks || []);

    // ── Viewport Auto-fit Dimensions ─────────────────────────────────────────
    const [baseDimensions, setBaseDimensions] = useState({ width: 595, height: 842 });
    const [stageDimensions, setStageDimensions] = useState({ width: 0, height: 0 });
    const stageRef = useRef(null);
    const containerRef = useRef(null);
    const progressTimeoutRef = useRef(null);
    const touchStartX = useRef(null);
    const touchStartY = useRef(null);

    // Sync bookmarks if prop changes
    useEffect(() => {
        setLocalBookmarks(bookmarks || []);
    }, [bookmarks]);

    // ── Responsive detection ─────────────────────────────────────────────────
    useEffect(() => {
        const check = () => {
            setIsMobile(window.innerWidth < 768);
        };
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // ── PDF loading ──────────────────────────────────────────────────────────
    const loadPdfDocument = useCallback(async () => {
        if (!hasFile || !fileUrl) {
            setIsLoading(false);
            setLoadError('Berkas buku digital belum tersedia untuk materi ini.');
            return;
        }
        try {
            setIsLoading(true);
            setLoadError(null);
            const loadingTask = pdfjsLib.getDocument({ url: fileUrl, withCredentials: true });
            const doc = await loadingTask.promise;
            setPdfDoc(doc);
            setTotalPages(doc.numPages);

            // Measure native page dimensions (points)
            try {
                const firstPage = await doc.getPage(1);
                const unscaled = firstPage.getViewport({ scale: 1.0 });
                setBaseDimensions({ width: unscaled.width, height: unscaled.height });
            } catch (e) {
                // fallback to standard A4 (595x842)
            }

            setIsLoading(false);
        } catch (err) {
            console.error('PDF.js load error:', err);
            setIsLoading(false);
            setLoadError('Gagal membuka berkas buku digital. Coba muat ulang halaman.');
        }
    }, [hasFile, fileUrl]);

    useEffect(() => {
        loadPdfDocument();
    }, [loadPdfDocument]);

    // ── Stage ResizeObserver for auto-fit ────────────────────────────────────
    useEffect(() => {
        if (!stageRef.current) return;
        const updateDimensions = () => {
            if (stageRef.current) {
                setStageDimensions({
                    width: stageRef.current.clientWidth,
                    height: stageRef.current.clientHeight,
                });
            }
        };
        updateDimensions();
        const ro = new ResizeObserver(updateDimensions);
        ro.observe(stageRef.current);
        return () => ro.disconnect();
    }, []);

    // ── Auto-fit scale calculation ───────────────────────────────────────────
    const fitScale = useMemo(() => {
        if (!stageDimensions.width || !stageDimensions.height) return 0.85;

        // Vertical breathing room:
        // Mobile: 24px (12px top, 12px bottom) so single page maximizes screen height
        // Desktop: 56px (28px top, 28px bottom)
        const vertPadding = isMobile ? 24 : 56;
        const availHeight = Math.max(160, stageDimensions.height - vertPadding);

        // Horizontal breathing room:
        // Mobile: 16px (8px each side) so single page fills screen width cleanly (Image 1)
        // Desktop: 160px for side navigation arrows and spread breathing room
        const sideMargins = isMobile ? 16 : 160;
        const availWidth = Math.max(160, stageDimensions.width - sideMargins);

        // Target width: In mobile, display 1 single page; in desktop, display 2-page book spread
        const targetWidth = isMobile ? baseDimensions.width : baseDimensions.width * 2;
        const targetHeight = baseDimensions.height;

        const scaleX = availWidth / targetWidth;
        const scaleY = availHeight / targetHeight;

        // Auto-fit so NEITHER width nor height overflows the viewport at 100%
        return Math.min(scaleX, scaleY);
    }, [stageDimensions, baseDimensions, isMobile]);

    const effectiveScale = fitScale * (zoom / 100);
    const pageWidth = Math.max(140, Math.round(baseDimensions.width * effectiveScale));
    const pageHeight = Math.max(200, Math.round(baseDimensions.height * effectiveScale));

    // ── Reading progress (debounced) ─────────────────────────────────────────
    const saveReadingProgress = useCallback((page, total) => {
        if (!material?.slug) return;
        if (progressTimeoutRef.current) clearTimeout(progressTimeoutRef.current);
        progressTimeoutRef.current = setTimeout(() => {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            fetch(`/koleksi/${material.slug}/progres`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}),
                },
                body: JSON.stringify({ page, total_pages: total }),
            }).catch(() => {});
        }, 1200);
    }, [material?.slug]);

    // ── Page navigation ──────────────────────────────────────────────────────
    const handlePageChange = useCallback((newPage) => {
        const safePage = Math.min(Math.max(1, newPage), totalPages);
        setDirection(safePage >= currentPage ? 1 : -1);
        setCurrentPage(safePage);
        saveReadingProgress(safePage, totalPages);
    }, [totalPages, currentPage, saveReadingProgress]);

    // Compute the left page in spread mode (even page)
    const getSpreadLeftPage = useCallback((page) => {
        if (page === 1) return page;
        return page % 2 === 0 ? page : page - 1;
    }, []);

    const isBackCoverStandalone = totalPages > 1 && totalPages % 2 === 0;

    const canGoPrev = currentPage > 1;
    const canGoNext = (() => {
        if (currentPage >= totalPages) return false;
        if (isMobile) return currentPage < totalPages;
        // If totalPages is odd, the last spread is (totalPages - 1) & totalPages.
        // Once viewing that spread, both are already displayed on screen, so cannot go further next.
        if (!isBackCoverStandalone && totalPages > 1) {
            const leftPage = currentPage % 2 === 0 ? currentPage : currentPage - 1;
            if (leftPage + 1 >= totalPages) return false;
        }
        return currentPage < totalPages;
    })();

    const handleNextPage = useCallback(() => {
        if (!canGoNext) return;
        if (isMobile) {
            handlePageChange(currentPage + 1);
            return;
        }
        if (currentPage === 1) {
            handlePageChange(2);
        } else {
            const leftPage = currentPage % 2 === 0 ? currentPage : currentPage - 1;
            const target = leftPage + 2;
            handlePageChange(Math.min(target, totalPages));
        }
    }, [canGoNext, isMobile, currentPage, totalPages, handlePageChange]);

    const handlePrevPage = useCallback(() => {
        if (!canGoPrev) return;
        if (isMobile) {
            handlePageChange(currentPage - 1);
            return;
        }
        if (isBackCoverStandalone && currentPage === totalPages) {
            handlePageChange(Math.max(1, totalPages - 2));
        } else {
            const leftPage = currentPage % 2 === 0 ? currentPage : currentPage - 1;
            if (leftPage <= 2) {
                handlePageChange(1);
            } else {
                handlePageChange(leftPage - 2);
            }
        }
    }, [canGoPrev, isMobile, currentPage, totalPages, isBackCoverStandalone, handlePageChange]);

    // ── Zoom ─────────────────────────────────────────────────────────────────
    const handleZoomIn  = () => setZoom(z => Math.min(z + 15, 200));
    const handleZoomOut = () => setZoom(z => Math.max(z - 15, 60));
    const handleResetZoom = () => setZoom(100);

    // ── Fullscreen ───────────────────────────────────────────────────────────
    const handleToggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen?.().catch(() => {});
            setIsFullscreen(true);
        } else {
            document.exitFullscreen?.().catch(() => {});
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, []);

    // ── Drawer ───────────────────────────────────────────────────────────────
    const openDrawer  = (panel) => setDrawerOpen(panel);
    const closeDrawer = () => setDrawerOpen(false);

    // ── Touch swipe ──────────────────────────────────────────────────────────
    const SWIPE_THRESHOLD = 40;
    const handleTouchStart = useCallback((e) => {
        // Let st-page-flip handle its own 3D drag physics when touching the book canvas directly
        if (e.target.closest?.('.st-page-flip') || e.target.closest?.('button') || e.target.closest?.('input')) {
            touchStartX.current = null;
            touchStartY.current = null;
            return;
        }
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    }, []);
    const handleTouchEnd = useCallback((e) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        const dy = e.changedTouches[0].clientY - touchStartY.current;
        touchStartX.current = null;
        touchStartY.current = null;
        if (Math.abs(dy) > Math.abs(dx)) return;
        if (Math.abs(dx) < SWIPE_THRESHOLD) return;
        if (dx < 0) handleNextPage();
        else handlePrevPage();
    }, [handleNextPage, handlePrevPage]);

    // ── Keyboard navigation ──────────────────────────────────────────────────
    useEffect(() => {
        const onKeyDown = (e) => {
            const tag = document.activeElement?.tagName?.toLowerCase();
            if (['input', 'textarea', 'select'].includes(tag) || document.activeElement?.isContentEditable) return;
            if (e.key === 'ArrowLeft')  { e.preventDefault(); handlePrevPage(); }
            if (e.key === 'ArrowRight') { e.preventDefault(); handleNextPage(); }
            if (e.key === 'Escape')     { if (drawerOpen) closeDrawer(); else if (isFullscreen) document.exitFullscreen?.(); }
            if (e.key === 'f' || e.key === 'F') { e.preventDefault(); handleToggleFullscreen(); }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [handlePrevPage, handleNextPage, drawerOpen, isFullscreen]);

    // ── Bookmark helpers ─────────────────────────────────────────────────────
    const isCurrentPageBookmarked = localBookmarks.some(b => b.page_number === currentPage);

    const handleToggleBookmark = async () => {
        if (!material?.slug) return;
        const existing = localBookmarks.find(b => b.page_number === currentPage);
        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (existing) {
            const res = await fetch(`/koleksi/${material.slug}/bookmark/${existing.id}`, {
                method: 'DELETE',
                headers: { 'Accept': 'application/json', ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}) },
            });
            if (res.ok) setLocalBookmarks(prev => prev.filter(b => b.id !== existing.id));
        } else {
            const res = await fetch(`/koleksi/${material.slug}/bookmark`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}) },
                body: JSON.stringify({ page_number: currentPage, title: `Halaman ${currentPage}` }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data?.bookmark) setLocalBookmarks(prev => [...prev, data.bookmark].sort((a, b) => a.page_number - b.page_number));
            }
        }
    };

    const handleDeleteBookmark = async (bookmarkId) => {
        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        const res = await fetch(`/koleksi/${material.slug}/bookmark/${bookmarkId}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json', ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}) },
        });
        if (res.ok) setLocalBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
    };

    // ── Spread page indicator ─────────────────────────────────────────────────
    const spreadIndicator = (() => {
        if (isMobile || currentPage === 1 || (isBackCoverStandalone && currentPage === totalPages)) {
            return `${currentPage} / ${totalPages}`;
        }
        const leftPage = getSpreadLeftPage(currentPage);
        const rightPage = leftPage + 1;
        if (rightPage > totalPages) return `${leftPage} / ${totalPages}`;
        return `${leftPage}–${rightPage} / ${totalPages}`;
    })();

    return (
        <div
            ref={containerRef}
            className="flex flex-col w-screen bg-[#F8FBFF] overflow-hidden select-none"
            style={{ height: '100dvh' }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* ── Reader Stage ─────────────────────────────────────────────── */}
            <main
                ref={stageRef}
                className="flex-1 relative flex items-center justify-center overflow-hidden"
                aria-label="Area Baca Buku Digital"
            >
                {/* Background subtle line */}
                <div className="absolute inset-x-0 top-0 h-[1px] bg-[#0B63CE]/10 pointer-events-none" />

                {/* Loading state */}
                {isLoading && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center">
                        <ReaderLoadingState message="Memuat buku digital…" />
                    </div>
                )}

                {/* Error state */}
                {!isLoading && loadError && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
                        <ReaderErrorState
                            title="Gagal Memuat Buku"
                            description={loadError}
                            onRetry={loadPdfDocument}
                            backUrl={resolvedBackUrl}
                        />
                    </div>
                )}

                {/* Side navigation arrows */}
                {pdfDoc && !loadError && (
                    <FlipbookSideArrows
                        currentPage={currentPage}
                        totalPages={totalPages}
                        canGoPrev={canGoPrev}
                        canGoNext={canGoNext}
                        onPrev={handlePrevPage}
                        onNext={handleNextPage}
                        isMobile={isMobile}
                    />
                )}

                {/* Main flipbook spread */}
                {pdfDoc && !loadError && (
                    <div className="w-full h-full overflow-hidden flex items-center justify-center"
                         style={{ scrollbarWidth: 'none' }}>
                        <div className={`min-h-full min-w-full flex items-center justify-center ${isMobile ? 'p-1' : 'py-4 px-4 sm:px-14'}`}>
                            <FlipbookSpread
                                pdfDoc={pdfDoc}
                                currentPage={currentPage}
                                totalPages={totalPages}
                                scale={effectiveScale}
                                pageWidth={pageWidth}
                                pageHeight={pageHeight}
                                viewMode={viewMode}
                                isMobile={isMobile}
                                direction={direction}
                                onPageChange={handlePageChange}
                                onPrev={handlePrevPage}
                                onNext={handleNextPage}
                                canGoPrev={canGoPrev}
                                canGoNext={canGoNext}
                            />
                        </div>
                    </div>
                )}
            </main>

            {/* ── Bottom Toolbar ───────────────────────────────────────────── */}
            <FlipbookBottomBar
                material={material}
                currentPage={currentPage}
                totalPages={totalPages}
                spreadIndicator={spreadIndicator}
                canGoPrev={canGoPrev}
                canGoNext={canGoNext}
                zoom={zoom}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetZoom={handleResetZoom}
                onSetZoom={setZoom}
                onPageChange={handlePageChange}
                onPrevPage={handlePrevPage}
                onNextPage={handleNextPage}
                isFullscreen={isFullscreen}
                onToggleFullscreen={handleToggleFullscreen}
                canDownload={canDownload}
                downloadUrl={downloadUrl}
                backUrl={resolvedBackUrl}
                drawerOpen={drawerOpen}
                onOpenDrawer={openDrawer}
                onCloseDrawer={closeDrawer}
                isCurrentBookmarked={isCurrentPageBookmarked}
                onToggleBookmark={handleToggleBookmark}
                viewMode={viewMode}
                onToggleViewMode={setViewMode}
                isMobile={isMobile}
            />

            {/* ── Drawer (Thumbnail / TOC / Detail) ───────────────────────── */}
            <FlipbookDrawer
                isOpen={!!drawerOpen}
                panel={drawerOpen}
                onClose={closeDrawer}
                pdfDoc={pdfDoc}
                currentPage={currentPage}
                totalPages={totalPages}
                tableOfContents={tableOfContents}
                keyPoints={keyPoints}
                learningObjectives={learningObjectives}
                targetAudiences={targetAudiences}
                material={material}
                fileInfo={fileInfo}
                canDownload={canDownload}
                downloadUrl={downloadUrl}
                backUrl={resolvedBackUrl}
                bookmarks={localBookmarks}
                onSelectPage={handlePageChange}
                onDeleteBookmark={handleDeleteBookmark}
            />
        </div>
    );
}
