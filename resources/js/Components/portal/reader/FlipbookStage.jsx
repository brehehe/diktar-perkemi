import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

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
    backLabel = 'Kembali ke detail koleksi',
    allowBookmarks = true,
    documentLabel = 'buku digital',
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
    const scrollContainerRef = useRef(null);
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
            setLoadError(`Berkas ${documentLabel} belum tersedia.`);
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
            setLoadError(`Gagal membuka berkas ${documentLabel}. Coba muat ulang halaman.`);
        }
    }, [hasFile, fileUrl, documentLabel]);

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

    const basePageWidth = Math.max(140, Math.round(baseDimensions.width * fitScale));
    const basePageHeight = Math.max(200, Math.round(baseDimensions.height * fitScale));
    const zoomFactor = zoom / 100;
    const bookWidth = isMobile ? basePageWidth : basePageWidth * 2;
    const scaledWidth = Math.round(bookWidth * zoomFactor);
    const scaledHeight = Math.round(basePageHeight * zoomFactor);

    // Margins:
    // When zoom <= 100, centers book with 0 overflow.
    // When zoom > 100, gives comfortable margins so edges are never cut off in scroll space.
    const padX = zoom > 100 ? (isMobile ? 20 : 48) : 0;
    const padY = zoom > 100 ? (isMobile ? 28 : 48) : 0;
    const horizontalMargin = Math.max(padX, Math.round((stageDimensions.width - scaledWidth) / 2));
    const verticalMargin = Math.max(padY, Math.round((stageDimensions.height - scaledHeight) / 2));

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
        setCurrentPage((curr) => {
            if (curr !== safePage) {
                setDirection(safePage >= curr ? 1 : -1);
            }
            return safePage;
        });
        saveReadingProgress(safePage, totalPages);
    }, [totalPages, saveReadingProgress]);

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
        setCurrentPage((curr) => {
            if (curr >= totalPages) return curr;
            if (isMobile) {
                const next = Math.min(curr + 1, totalPages);
                setDirection(1);
                saveReadingProgress(next, totalPages);
                return next;
            }
            if (curr === 1) {
                setDirection(1);
                saveReadingProgress(2, totalPages);
                return 2;
            }
            const leftPage = curr % 2 === 0 ? curr : curr - 1;
            if (!isBackCoverStandalone && totalPages > 1 && leftPage + 1 >= totalPages) {
                return curr;
            }
            const target = leftPage + 2;
            const next = Math.min(target, totalPages);
            setDirection(1);
            saveReadingProgress(next, totalPages);
            return next;
        });
    }, [isMobile, totalPages, isBackCoverStandalone, saveReadingProgress]);

    const handlePrevPage = useCallback(() => {
        setCurrentPage((curr) => {
            if (curr <= 1) return curr;
            if (isMobile) {
                const prev = Math.max(1, curr - 1);
                setDirection(-1);
                saveReadingProgress(prev, totalPages);
                return prev;
            }
            if (isBackCoverStandalone && curr === totalPages) {
                const prev = Math.max(1, totalPages - 2);
                setDirection(-1);
                saveReadingProgress(prev, totalPages);
                return prev;
            }
            const leftPage = curr % 2 === 0 ? curr : curr - 1;
            const prev = leftPage <= 2 ? 1 : leftPage - 2;
            setDirection(-1);
            saveReadingProgress(prev, totalPages);
            return prev;
        });
    }, [isMobile, totalPages, isBackCoverStandalone, saveReadingProgress]);

    // ── Zoom ─────────────────────────────────────────────────────────────────
    const handleZoomIn  = () => setZoom(z => Math.min(z + 15, 200));
    const handleZoomOut = () => setZoom(z => Math.max(z - 15, 60));
    const handleResetZoom = useCallback(() => {
        setZoom(100);
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
        }
    }, []);

    const lastToggleTimeRef = useRef(0);

    const handleToggleZoom = useCallback(({ clientX, clientY } = {}) => {
        const now = Date.now();
        // Prevent rapid double-trigger within 600ms (e.g. from simultaneous touch/mouse/dblclick on mobile)
        if (now - lastToggleTimeRef.current < 600) {
            return;
        }
        lastToggleTimeRef.current = now;

        setZoom((prevZoom) => {
            if (prevZoom <= 100) {
                // Zoom in to 160% and center on click target if coordinates exist
                setTimeout(() => {
                    if (!scrollContainerRef.current) return;
                    const el = scrollContainerRef.current;
                    const maxScrollX = el.scrollWidth - el.clientWidth;
                    const maxScrollY = el.scrollHeight - el.clientHeight;

                    if (clientX !== undefined && clientY !== undefined) {
                        const rect = el.getBoundingClientRect();
                        const relX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
                        const relY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
                        const targetX = Math.max(0, maxScrollX * relX);
                        const targetY = Math.max(0, maxScrollY * relY);
                        el.scrollTo({ left: targetX, top: targetY, behavior: 'smooth' });
                    } else {
                        el.scrollTo({
                            left: Math.max(0, maxScrollX / 2),
                            top: Math.max(0, maxScrollY / 2),
                            behavior: 'smooth',
                        });
                    }
                }, 60);
                return 160;
            } else {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
                }
                return 100;
            }
        });
    }, []);

    // ── Panning when zoom > 100 ──────────────────────────────────────────────
    const isPanningRef = useRef(false);
    const panStartRef = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

    const handleMouseDownPan = useCallback((e) => {
        if (zoom <= 100) return;
        if (e.button !== 0) return;
        if (e.target.closest?.('button, a, input, select')) return;

        isPanningRef.current = true;
        const container = scrollContainerRef.current;
        panStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            scrollLeft: container ? container.scrollLeft : 0,
            scrollTop: container ? container.scrollTop : 0,
        };
    }, [zoom]);

    const handleMouseMovePan = useCallback((e) => {
        if (!isPanningRef.current || zoom <= 100) return;
        const container = scrollContainerRef.current;
        if (!container) return;

        const dx = e.clientX - panStartRef.current.x;
        const dy = e.clientY - panStartRef.current.y;
        container.scrollLeft = panStartRef.current.scrollLeft - dx;
        container.scrollTop = panStartRef.current.scrollTop - dy;
    }, [zoom]);

    const handleMouseUpPan = useCallback(() => {
        isPanningRef.current = false;
    }, []);

    useEffect(() => {
        const onGlobalMouseUp = () => {
            isPanningRef.current = false;
        };
        window.addEventListener('mouseup', onGlobalMouseUp);
        return () => window.removeEventListener('mouseup', onGlobalMouseUp);
    }, []);

    // ── Wheel / Pinch to Zoom (Ctrl+Wheel or Trackpad Pinch) ──────────────────
    useEffect(() => {
        const stageEl = stageRef.current;
        if (!stageEl) return;

        const onWheel = (e) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                if (e.deltaY < 0) {
                    setZoom(z => Math.min(z + 10, 200));
                } else if (e.deltaY > 0) {
                    setZoom(z => Math.max(z - 10, 60));
                }
            }
        };

        stageEl.addEventListener('wheel', onWheel, { passive: false });
        return () => stageEl.removeEventListener('wheel', onWheel);
    }, []);

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
        if (zoom > 100) return;
        // Let st-page-flip handle its own 3D drag physics when touching the book canvas directly
        if (e.target.closest?.('.st-page-flip') || e.target.closest?.('button') || e.target.closest?.('input')) {
            touchStartX.current = null;
            touchStartY.current = null;
            return;
        }
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    }, [zoom]);
    const handleTouchEnd = useCallback((e) => {
        if (zoom > 100) return;
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        const dy = e.changedTouches[0].clientY - touchStartY.current;
        touchStartX.current = null;
        touchStartY.current = null;
        if (Math.abs(dy) > Math.abs(dx)) return;
        if (Math.abs(dx) < SWIPE_THRESHOLD) return;
        if (dx < 0) handleNextPage();
        else handlePrevPage();
    }, [zoom, handleNextPage, handlePrevPage]);

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
            <header className="flex h-12 shrink-0 items-center gap-2 border-b border-[#DCE7F3] bg-white px-2 md:hidden">
                <Link
                    href={resolvedBackUrl}
                    aria-label={backLabel}
                    title={backLabel}
                    className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md px-2.5 text-sm font-semibold text-[#0A3F82] transition-colors hover:bg-[#EAF5FF] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#0B63CE] motion-reduce:transition-none"
                >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    <span>Kembali</span>
                </Link>

                <span className="h-5 w-px shrink-0 bg-[#DCE7F3]" aria-hidden="true" />

                <p className="min-w-0 truncate pr-2 text-xs font-medium text-[#112743]">
                    {material?.title || 'Buku Digital'}
                </p>
            </header>

            {/* ── Reader Stage ─────────────────────────────────────────────── */}
            <main
                ref={stageRef}
                className="flex-1 relative flex items-center justify-center overflow-hidden"
                aria-label={`Area baca ${documentLabel}`}
            >
                {/* Background subtle line */}
                <div className="absolute inset-x-0 top-0 h-[1px] bg-[#0B63CE]/10 pointer-events-none" />

                {/* Loading state */}
                {isLoading && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center">
                        <ReaderLoadingState message={`Memuat ${documentLabel}…`} />
                    </div>
                )}

                {/* Error state */}
                {!isLoading && loadError && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
                        <ReaderErrorState
                            title={`Gagal memuat ${documentLabel}`}
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

                {/* Floating zoom indicator & reset pill (Concise, single-line / sebaris) */}
                {zoom > 100 && (
                    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30 bg-[#0E2747]/90 backdrop-blur-md text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap pointer-events-auto border border-white/15 animate-in fade-in zoom-in-95 duration-200 select-none">
                        <span className="font-mono font-bold text-[#60A5FA] text-[11px] whitespace-nowrap">{zoom}%</span>
                        <span className="text-white/30 text-[10px] select-none">•</span>
                        <span className="text-[11px] text-white/80 whitespace-nowrap hidden sm:inline">Klik 2x / geser untuk membaca</span>
                        <span className="text-[10.5px] text-white/80 whitespace-nowrap sm:hidden">Geser untuk baca</span>
                        <button
                            type="button"
                            onClick={handleResetZoom}
                            className="ml-0.5 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors cursor-pointer whitespace-nowrap"
                            title="Kembalikan ke ukuran normal (100%)"
                        >
                            Reset
                        </button>
                    </div>
                )}

                {/* Main flipbook spread */}
                {pdfDoc && !loadError && (
                    <div
                        ref={scrollContainerRef}
                        className={`w-full h-full ${
                            zoom > 100
                                ? 'overflow-auto cursor-grab active:cursor-grabbing reader-zoomed'
                                : 'overflow-hidden flex items-center justify-center'
                        }`}
                        style={{
                            scrollbarWidth: 'thin',
                            WebkitOverflowScrolling: 'touch',
                            touchAction: zoom > 100 ? 'pan-x pan-y' : 'manipulation',
                        }}
                        onMouseDown={handleMouseDownPan}
                        onMouseMove={handleMouseMovePan}
                        onMouseUp={handleMouseUpPan}
                    >
                        <div
                            className="transition-all duration-200 ease-out"
                            style={{
                                width: `${scaledWidth}px`,
                                height: `${scaledHeight}px`,
                                margin: `${verticalMargin}px ${horizontalMargin}px`,
                                minWidth: `${scaledWidth}px`,
                                minHeight: `${scaledHeight}px`,
                                flexShrink: 0,
                                position: 'relative',
                            }}
                        >
                            <div
                                style={{
                                    width: `${bookWidth}px`,
                                    height: `${basePageHeight}px`,
                                    transform: `scale(${zoomFactor})`,
                                    transformOrigin: 'top left',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                }}
                            >
                                <FlipbookSpread
                                    pdfDoc={pdfDoc}
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    scale={fitScale}
                                    pageWidth={basePageWidth}
                                    pageHeight={basePageHeight}
                                    viewMode={viewMode}
                                    isMobile={isMobile}
                                    direction={direction}
                                    onPageChange={handlePageChange}
                                    onPrev={handlePrevPage}
                                    onNext={handleNextPage}
                                    canGoPrev={canGoPrev}
                                    canGoNext={canGoNext}
                                    zoom={zoom}
                                    onToggleZoom={handleToggleZoom}
                                />
                            </div>
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
                onToggleZoom={handleToggleZoom}
                onSetZoom={setZoom}
                onPageChange={handlePageChange}
                onPrevPage={handlePrevPage}
                onNextPage={handleNextPage}
                isFullscreen={isFullscreen}
                onToggleFullscreen={handleToggleFullscreen}
                canDownload={canDownload}
                downloadUrl={downloadUrl}
                backUrl={resolvedBackUrl}
                backLabel={backLabel}
                drawerOpen={drawerOpen}
                onOpenDrawer={openDrawer}
                onCloseDrawer={closeDrawer}
                isCurrentBookmarked={isCurrentPageBookmarked}
                onToggleBookmark={handleToggleBookmark}
                allowBookmarks={allowBookmarks}
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
