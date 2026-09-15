import React from 'react';
import PdfPage from './PdfPage';

export default function BookSpread({
    pdfDoc,
    currentPage = 1,
    totalPages = 1,
    scale = 1.0,
    viewMode = 'spread', // 'spread' | 'single'
    isMobile = false,
}) {
    if (!pdfDoc) return null;

    // Rules for Spread vs Single:
    // 1. If user forces single-page mode or on mobile/small screen: single page.
    // 2. Page 1 (Cover) is always displayed alone in the center.
    // 3. If currentPage is an odd page that exceeds totalPages when paired, or single last page.
    const isCover = currentPage === 1;
    const forceSingle = isMobile || viewMode === 'single' || isCover;

    if (forceSingle) {
        return (
            <div className="flex items-center justify-center p-4 sm:p-6 transition-all duration-300">
                <PdfPage
                    pdfDoc={pdfDoc}
                    pageNumber={currentPage}
                    scale={scale}
                    isSingle={true}
                />
            </div>
        );
    }

    // Spread Mode (Two-page open book):
    // Left page is always even, Right page is odd:
    // e.g. pages 2 & 3, pages 4 & 5, pages 6 & 7, etc.
    const leftPageNumber = currentPage % 2 === 0 ? currentPage : currentPage - 1;
    const rightPageNumber = leftPageNumber + 1;
    const hasRightPage = rightPageNumber <= totalPages;

    if (!hasRightPage) {
        // Last odd page rendered single centered
        return (
            <div className="flex items-center justify-center p-4 sm:p-6 transition-all duration-300">
                <PdfPage
                    pdfDoc={pdfDoc}
                    pageNumber={leftPageNumber}
                    scale={scale}
                    isSingle={true}
                />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-3 sm:p-6 transition-all duration-300">
            {/* Open Book Container with dual page spread and tactile spine gutter */}
            <div className="inline-flex items-center shadow-xl shadow-[#0E2747]/10 rounded-lg overflow-hidden bg-white">
                {/* Left Page (Even) */}
                <PdfPage
                    pdfDoc={pdfDoc}
                    pageNumber={leftPageNumber}
                    scale={scale}
                    isRightSide={false}
                    isSingle={false}
                />

                {/* Tactile Book Spine Seam & Gutter */}
                <div
                    className="w-[2px] self-stretch bg-gradient-to-r from-[#CAD6E2] via-[#B8C9DC] to-[#CAD6E2] z-10 shrink-0 relative"
                    aria-hidden="true"
                >
                    {/* Spine highlight seam line */}
                    <div className="absolute inset-y-0 left-0 w-[1px] bg-white/40" />
                </div>

                {/* Right Page (Odd) */}
                <PdfPage
                    pdfDoc={pdfDoc}
                    pageNumber={rightPageNumber}
                    scale={scale}
                    isRightSide={true}
                    isSingle={false}
                />
            </div>
        </div>
    );
}
