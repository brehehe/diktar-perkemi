import React, { useRef } from 'react';
import BookSpread from './BookSpread';
import ReaderLoadingState from './ReaderLoadingState';
import ReaderErrorState from './ReaderErrorState';

export default function BookViewport({
    pdfDoc,
    isLoading = false,
    error = null,
    currentPage = 1,
    totalPages = 1,
    scale = 1.0,
    viewMode = 'spread',
    isMobile = false,
    onRetry,
    backUrl = '/koleksi',
}) {
    const viewportRef = useRef(null);

    return (
        /**
         * IMPORTANT: Do NOT add `items-center` to this outer div.
         *
         * When `flex items-center` is on an `overflow-auto` container, content
         * that is taller than the container overflows symmetrically above AND
         * below the scroll origin. The top overflow lands at a negative scroll
         * position, which is unreachable — the page appears clipped and the
         * user cannot scroll up to see it.
         *
         * Fix: the outer div is a plain scroll container. The inner wrapper uses
         * `min-h-full flex items-center justify-center` so that:
         *  - Short pages: inner div fills the viewport and centers content ✓
         *  - Tall pages: inner div grows beyond the viewport and scroll starts
         *    from the top, making the whole page reachable ✓
         */
        <div
            ref={viewportRef}
            tabIndex={0}
            aria-label="Area Pembacaan Buku Digital"
            className="flex-1 relative w-full h-full overflow-auto select-none outline-none"
            style={{
                background: 'radial-gradient(ellipse at 60% 40%, #EEF5FF 0%, #E5EDF8 55%, #DAE5F3 100%)',
            }}
        >
            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center">
                    <ReaderLoadingState message="Memuat halaman buku digital..." />
                </div>
            )}

            {/* Error overlay */}
            {error && (
                <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
                    <ReaderErrorState
                        title="Gagal Menampilkan Buku"
                        description={error}
                        onRetry={onRetry}
                        backUrl={backUrl}
                    />
                </div>
            )}

            {/* Book pages — inner wrapper with min-h-full for correct scroll behavior */}
            {pdfDoc && !error && (
                <div className="min-h-full min-w-full flex items-center justify-center py-8 px-4 sm:px-14">
                    <BookSpread
                        pdfDoc={pdfDoc}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        scale={scale}
                        viewMode={viewMode}
                        isMobile={isMobile}
                    />
                </div>
            )}
        </div>
    );
}
