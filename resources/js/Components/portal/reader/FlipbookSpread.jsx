import React, { useEffect, useRef, useState, useCallback, useMemo, forwardRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { motion } from 'framer-motion';
import PdfPage from './PdfPage';

/**
 * FlipPage — Individual Page for StPageFlip
 * Uses soft paper physics throughout for realistic 3D paper bending and corner peeling.
 */
const FlipPage = forwardRef(({
    pageNumber,
    pdfDoc,
    scale,
    pageWidth,
    pageHeight,
    currentPage,
}, ref) => {
    const [hasRendered, setHasRendered] = useState(false);
    const isNearActive = Math.abs(pageNumber - currentPage) <= 4;

    useEffect(() => {
        if (isNearActive && !hasRendered) {
            setHasRendered(true);
        }
    }, [isNearActive, hasRendered]);

    return (
        <div
            ref={ref}
            className="st-page bg-white select-none overflow-hidden relative shadow-xl ring-1 ring-black/5 soft-page"
            data-density="soft"
            style={{
                width: `${pageWidth}px`,
                height: `${pageHeight}px`,
                backgroundColor: '#FFFFFF',
            }}
        >
            {hasRendered || isNearActive ? (
                <PdfPage
                    pdfDoc={pdfDoc}
                    pageNumber={pageNumber}
                    scale={scale}
                    isSingle={true}
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-white text-slate-300">
                    <span className="text-[11px] font-mono">Halaman {pageNumber}</span>
                </div>
            )}

            {/* Subtle paper grain / edge lighting */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    boxShadow: 'inset 0 0 12px rgba(0,0,0,0.035)',
                }}
            />
        </div>
    );
});
FlipPage.displayName = 'FlipPage';

/**
 * FlipbookSpread — Realtime 3D FlipBook Experience
 *
 * 1. Permanently 2-Page Spread Book: The reader always displays in authentic 2-page book spread mode.
 * 2. Odd-page handling: If the PDF has an odd number of pages (e.g. 5 pages), the final spread
 *    displays Page 4 and Page 5 together as 2 pages without being separated by blank endpapers.
 * 3. Soft Paper Physics: All pages use soft 3D paper bending and curling.
 * 4. Dynamic Centering:
 *    - Front cover (Page 1) is smoothly shifted left to sit precisely in the center of the screen.
 *    - Back cover (only when totalPages is even, e.g. 6) is smoothly shifted right to sit in the center.
 *    - All 2-page spreads remain centered at shift = 0.
 */
export default function FlipbookSpread({
    pdfDoc,
    currentPage = 1,
    totalPages = 1,
    scale = 1.0,
    pageWidth = 480,
    pageHeight = 680,
    isMobile = false,
    viewMode = 'spread',
    direction = 0,
    onPageChange,
    onPrev,
    onNext,
    canGoPrev = true,
    canGoNext = true,
    zoom = 100,
    onToggleZoom = null,
}) {
    const flipBookRef = useRef(null);
    const isInternalFlip = useRef(false);
    const isExternalSync = useRef(false);
    const syncTimeoutRef = useRef(null);

    // Double-click / double-tap detection to toggle zoom without turning pages
    const lastClickRef = useRef({ time: 0, x: 0, y: 0 });
    const lastTapRef = useRef({ time: 0, x: 0, y: 0 });
    const touchStartRef = useRef({ time: 0, x: 0, y: 0, isDrag: false });
    const lastTouchTimeRef = useRef(0);
    const lastToggleRef = useRef(0);

    const triggerToggleZoom = useCallback((clientX, clientY) => {
        const now = Date.now();
        if (now - lastToggleRef.current < 650) return;
        lastToggleRef.current = now;
        onToggleZoom?.({ clientX, clientY });
    }, [onToggleZoom]);

    const handleTouchStart = useCallback((e) => {
        lastTouchTimeRef.current = Date.now();
        if (e.touches?.length === 1) {
            const touch = e.touches[0];
            touchStartRef.current = {
                time: Date.now(),
                x: touch.clientX,
                y: touch.clientY,
                isDrag: false,
            };
        }
    }, []);

    const handleTouchMove = useCallback((e) => {
        if (e.touches?.length === 1) {
            const touch = e.touches[0];
            const moveDist = Math.hypot(
                touch.clientX - touchStartRef.current.x,
                touch.clientY - touchStartRef.current.y
            );
            if (moveDist > 10) {
                touchStartRef.current.isDrag = true;
            }
        }
    }, []);

    const handleTouchEnd = useCallback((e) => {
        lastTouchTimeRef.current = Date.now();
        if (touchStartRef.current.isDrag) return;
        if (e.changedTouches?.length !== 1) return;

        const touch = e.changedTouches[0];
        const now = Date.now();
        const duration = now - touchStartRef.current.time;
        if (duration > 320) return; // Held too long, not a tap

        const timeDiff = now - lastTapRef.current.time;
        const dist = Math.hypot(
            touch.clientX - lastTapRef.current.x,
            touch.clientY - lastTapRef.current.y
        );

        if (timeDiff > 40 && timeDiff < 360 && dist < 35) {
            lastTapRef.current = { time: 0, x: 0, y: 0 };
            triggerToggleZoom(touch.clientX, touch.clientY);
        } else {
            lastTapRef.current = { time: now, x: touch.clientX, y: touch.clientY };
        }
    }, [triggerToggleZoom]);

    const handleMouseUp = useCallback((e) => {
        // Ignore synthetic mouseup event generated by mobile touch
        if (Date.now() - lastTouchTimeRef.current < 800) return;
        if (e.button !== 0) return;
        if (e.target.closest?.('button, a, input, select')) return;

        const now = Date.now();
        const timeDiff = now - lastClickRef.current.time;
        const dist = Math.hypot(
            e.clientX - lastClickRef.current.x,
            e.clientY - lastClickRef.current.y
        );

        if (timeDiff > 40 && timeDiff < 360 && dist < 25) {
            lastClickRef.current = { time: 0, x: 0, y: 0 };
            triggerToggleZoom(e.clientX, e.clientY);
        } else {
            lastClickRef.current = { time: now, x: e.clientX, y: e.clientY };
        }
    }, [triggerToggleZoom]);

    const handleDoubleClick = useCallback((e) => {
        e.preventDefault();
        // Ignore synthetic dblclick event generated by mobile touch
        if (Date.now() - lastTouchTimeRef.current < 800) return;
        triggerToggleZoom(e.clientX, e.clientY);
    }, [triggerToggleZoom]);

    // Array of page numbers 1..totalPages
    const pageNumbers = useMemo(
        () => Array.from({ length: totalPages }, (_, i) => i + 1),
        [totalPages]
    );

    // If totalPages is even, the last page stands alone as a back cover.
    // If totalPages is odd, the last spread has 2 pages (e.g. 4 & 5 together, no separation).
    const isBackCoverStandalone = totalPages > 1 && totalPages % 2 === 0;

    // Enforce soft paper physics on all pages so page 1 and the last page never use drawHard
    const enforceSoftPages = useCallback(() => {
        const pageFlip = flipBookRef.current?.pageFlip?.();
        if (!pageFlip) return;
        try {
            const pageCollection = pageFlip.getPageCollection();
            const pages = pageCollection?.getPages?.() || [];
            pages.forEach((page) => {
                if (!page) return;
                page.setDensity('soft');
                page.setDrawingDensity('soft');

                if (!page.__softEnforced) {
                    page.__softEnforced = true;
                    page.setDensity = function () {
                        this.createdDensity = 'soft';
                        this.nowDrawingDensity = 'soft';
                    };
                    page.setDrawingDensity = function () {
                        this.nowDrawingDensity = 'soft';
                    };
                }
            });
        } catch (e) {
            // Ignore
        }
    }, []);

    // Handle flip event from react-pageflip (drag corner or click flip)
    const handleFlip = useCallback((e) => {
        enforceSoftPages();
        if (isExternalSync.current) {
            return;
        }
        const newPageNum = e.data + 1; // 0-indexed to 1-indexed page
        isInternalFlip.current = true;
        onPageChange?.(newPageNum);
        setTimeout(() => {
            isInternalFlip.current = false;
            enforceSoftPages();
        }, 120);
    }, [onPageChange, enforceSoftPages]);

    const handleInit = useCallback(() => {
        enforceSoftPages();
        const pageFlip = flipBookRef.current?.pageFlip?.();
        if (pageFlip && isMobile) {
            try {
                if (pageFlip.getRender?.()?.getOrientation?.() !== 'portrait') {
                    pageFlip.updateOrientation?.('portrait');
                }
            } catch (e) {}
        }
    }, [enforceSoftPages, isMobile]);

    const handleChangeState = useCallback(() => {
        enforceSoftPages();
    }, [enforceSoftPages]);

    // External page navigation sync (from arrows, toolbar slider, TOC, thumbnails)
    useEffect(() => {
        if (isInternalFlip.current) return;
        const pageFlip = flipBookRef.current?.pageFlip?.();
        if (!pageFlip) return;

        try {
            enforceSoftPages();

            // If an animation is still in progress from rapid clicks, finish it immediately
            // so internal PageFlip state finishes updating before starting the next flip
            if (pageFlip.getState?.() !== 'read') {
                pageFlip.getRender?.()?.finishAnimation?.();
                enforceSoftPages();
            }

            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
                syncTimeoutRef.current = null;
            }

            const pageCollection = pageFlip.getPageCollection?.();
            const targetIndex = Math.max(0, Math.min(currentPage - 1, totalPages - 1));

            if (pageCollection) {
                const currentSpread = pageCollection.getCurrentSpreadIndex();
                const targetSpread = pageCollection.getSpreadIndexByPage(targetIndex);

                if (targetSpread !== null) {
                    if (currentSpread !== targetSpread) {
                        isExternalSync.current = true;

                        if (targetSpread === currentSpread + 1) {
                            pageFlip.flipNext();
                            syncTimeoutRef.current = setTimeout(() => {
                                isExternalSync.current = false;
                                enforceSoftPages();
                                if (pageFlip.getCurrentPageIndex?.() !== targetIndex) {
                                    pageFlip.turnToPage?.(targetIndex);
                                }
                            }, 440);
                        } else if (targetSpread === currentSpread - 1) {
                            // In portrait mode, page-flip's internal flipPrev() passes hardcoded x: 10,
                            // which fails isPointOnCorners() when disableFlipByClick is true because
                            // rect.left is negative in portrait mode.
                            // Passing rect.left + 10 ensures the coordinate is on the top-left corner.
                            const rect = pageFlip.getRender?.()?.getRect?.();
                            const flipController = pageFlip.flipController;
                            if (isMobile && rect && flipController?.flip) {
                                flipController.flip({
                                    x: rect.left + 10,
                                    y: 1,
                                });
                            } else {
                                pageFlip.flipPrev();
                            }

                            syncTimeoutRef.current = setTimeout(() => {
                                isExternalSync.current = false;
                                enforceSoftPages();
                                // Guaranteed fallback: ensure internal page index matches targetIndex
                                if (pageFlip.getCurrentPageIndex?.() !== targetIndex) {
                                    pageFlip.turnToPage?.(targetIndex);
                                }
                            }, 440);
                        } else {
                            // Multi-page jump (from slider, thumbnail, TOC, input)
                            pageFlip.turnToPage(targetIndex);
                            syncTimeoutRef.current = setTimeout(() => {
                                isExternalSync.current = false;
                                enforceSoftPages();
                            }, 120);
                        }
                    } else if (pageFlip.getCurrentPageIndex?.() !== targetIndex) {
                        // Resync if spread matches but page index differs
                        pageFlip.turnToPage(targetIndex);
                    }
                }
            } else {
                const currentFlipIndex = pageFlip.getCurrentPageIndex();
                if (currentFlipIndex !== targetIndex) {
                    isExternalSync.current = true;
                    pageFlip.turnToPage(targetIndex);
                    syncTimeoutRef.current = setTimeout(() => {
                        isExternalSync.current = false;
                        enforceSoftPages();
                    }, 120);
                }
            }
        } catch (err) {
            isExternalSync.current = false;
        }

        return () => {
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
        };
    }, [currentPage, totalPages, isMobile, enforceSoftPages]);

    // Ensure soft density is locked whenever dimensions or pages change
    useEffect(() => {
        enforceSoftPages();
        const timer = setTimeout(enforceSoftPages, 60);
        return () => clearTimeout(timer);
    }, [enforceSoftPages, totalPages, pageWidth]);

    if (!pdfDoc || totalPages < 1) return null;

    // Centering shift:
    // - On mobile: 0 (single page portrait is automatically centered by StPageFlip)
    // - Page 1 (Front Cover on desktop): sits in right slot -> shift left by pageWidth/2 to align center
    // - Even totalPages last page: sits in left slot -> shift right by pageWidth/2 to align center
    // - All 2-page spreads (including 4 & 5 when totalPages is odd): shift 0 (centered)
    const shiftX = useMemo(() => {
        if (isMobile || totalPages <= 1) return 0;
        if (currentPage === 1) {
            return -Math.round(pageWidth / 2);
        }
        if (isBackCoverStandalone && currentPage === totalPages) {
            return Math.round(pageWidth / 2);
        }
        return 0;
    }, [isMobile, totalPages, currentPage, pageWidth, isBackCoverStandalone]);

    const isSingleVisible = isMobile || totalPages <= 1 || currentPage === 1 || (isBackCoverStandalone && currentPage === totalPages);

    return (
        <motion.div
            initial={{ scale: 0.94, opacity: 0, rotateX: 6, y: 8 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex items-center justify-center select-none"
            style={{
                perspective: 2400,
                transformStyle: 'preserve-3d',
            }}
        >
            {/* Ambient desk drop shadow underneath the active book area */}
            <div
                className="absolute -bottom-5 pointer-events-none transition-all duration-500 ease-out"
                style={{
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: isSingleVisible ? `${Math.round(pageWidth * 0.95)}px` : `${Math.round(pageWidth * 1.9)}px`,
                    height: '26px',
                    background: 'radial-gradient(ellipse at center, rgba(14,39,71,0.22) 0%, rgba(14,39,71,0.06) 60%, transparent 80%)',
                    filter: 'blur(10px)',
                }}
                aria-hidden="true"
            />

            {/* Realtime Interactive 3D FlipBook with dynamic centering translation */}
            <div
                className={`relative overflow-visible ${zoom > 100 ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
                style={{
                    width: isMobile ? `${pageWidth}px` : `${pageWidth * 2}px`,
                    maxWidth: isMobile ? `${pageWidth}px` : `${pageWidth * 2}px`,
                    height: `${pageHeight}px`,
                    margin: '0 auto',
                    transform: `translate3d(${shiftX}px, 0, 0)`,
                    transition: 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
                    touchAction: zoom > 100 ? 'pan-x pan-y' : 'manipulation',
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseUp={handleMouseUp}
                onDoubleClick={handleDoubleClick}
            >
                <HTMLFlipBook
                    key={`flipbook-${isMobile ? 'portrait' : 'landscape'}-${pageWidth}-${pageHeight}`}
                    ref={flipBookRef}
                    width={pageWidth}
                    height={pageHeight}
                    size="fixed"
                    minWidth={pageWidth}
                    maxWidth={isMobile ? pageWidth : pageWidth * 2}
                    minHeight={pageHeight}
                    maxHeight={pageHeight}
                    autoSize={false}
                    showCover={!isMobile}
                    drawShadow={true}
                    maxShadowOpacity={0.6}
                    flippingTime={400}
                    usePortrait={isMobile}
                    startPage={Math.max(0, Math.min(currentPage - 1, totalPages - 1))}
                    onFlip={handleFlip}
                    onChangeState={handleChangeState}
                    onInit={handleInit}
                    className="st-page-flip"
                    style={{
                        margin: '0 auto',
                        background: 'transparent',
                        width: isMobile ? `${pageWidth}px` : `${pageWidth * 2}px`,
                        maxWidth: isMobile ? `${pageWidth}px` : `${pageWidth * 2}px`,
                    }}
                    showPageCorners={true}
                    useMouseEvents={zoom <= 100}
                    swipeDistance={20}
                    clickEventForward={true}
                    disableFlipByClick={true}
                >
                    {pageNumbers.map((num) => (
                        <FlipPage
                            key={`page-${num}`}
                            pageNumber={num}
                            pdfDoc={pdfDoc}
                            scale={scale}
                            pageWidth={pageWidth}
                            pageHeight={pageHeight}
                            currentPage={currentPage}
                        />
                    ))}
                </HTMLFlipBook>
            </div>
        </motion.div>
    );
}
