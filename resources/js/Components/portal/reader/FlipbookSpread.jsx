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
    onPageChange,
    onPrev,
    onNext,
    canGoPrev = true,
    canGoNext = true,
}) {
    const flipBookRef = useRef(null);
    const isInternalFlip = useRef(false);

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
    }, [enforceSoftPages]);

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
            const currentFlipIndex = pageFlip.getCurrentPageIndex();
            const targetIndex = Math.max(0, Math.min(currentPage - 1, totalPages - 1));
            if (currentFlipIndex !== targetIndex) {
                pageFlip.flip(targetIndex);
            }
        } catch (err) {
            // Ignore temporary animation busy state
        }
    }, [currentPage, totalPages, enforceSoftPages]);

    // Ensure soft density is locked whenever dimensions or pages change
    useEffect(() => {
        enforceSoftPages();
        const timer = setTimeout(enforceSoftPages, 60);
        return () => clearTimeout(timer);
    }, [enforceSoftPages, totalPages, pageWidth]);

    if (!pdfDoc || totalPages < 1) return null;

    // Centering shift:
    // - Page 1 (Front Cover): sits in right slot -> shift left by pageWidth/2 to align center
    // - Even totalPages last page: sits in left slot -> shift right by pageWidth/2 to align center
    // - All 2-page spreads (including 4 & 5 when totalPages is odd): shift 0 (centered)
    const shiftX = useMemo(() => {
        if (totalPages <= 1) return 0;
        if (currentPage === 1) {
            return -Math.round(pageWidth / 2);
        }
        if (isBackCoverStandalone && currentPage === totalPages) {
            return Math.round(pageWidth / 2);
        }
        return 0;
    }, [totalPages, currentPage, pageWidth, isBackCoverStandalone]);

    const isSingleVisible = totalPages <= 1 || currentPage === 1 || (isBackCoverStandalone && currentPage === totalPages);

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
                className="relative overflow-visible"
                style={{
                    transform: `translate3d(${shiftX}px, 0, 0)`,
                    transition: 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
                    willChange: 'transform',
                }}
            >
                <HTMLFlipBook
                    key={`flipbook-${pageWidth}-${pageHeight}-landscape`}
                    ref={flipBookRef}
                    width={pageWidth}
                    height={pageHeight}
                    size="fixed"
                    minWidth={200}
                    maxWidth={1600}
                    minHeight={280}
                    maxHeight={1800}
                    showCover={true}
                    drawShadow={true}
                    maxShadowOpacity={0.6}
                    flippingTime={650}
                    usePortrait={false}
                    startPage={Math.max(0, Math.min(currentPage - 1, totalPages - 1))}
                    onFlip={handleFlip}
                    onChangeState={handleChangeState}
                    onInit={handleInit}
                    className="st-page-flip"
                    style={{ margin: '0 auto', background: 'transparent' }}
                    showPageCorners={true}
                    useMouseEvents={true}
                    swipeDistance={25}
                    clickEventForward={true}
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
