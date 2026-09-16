import React, { useRef, useCallback, useEffect, useState } from 'react';
import BookSpread from './BookSpread';
import ReaderLoadingState from './ReaderLoadingState';
import ReaderErrorState from './ReaderErrorState';

const SWIPE_THRESHOLD = 48; // px — minimum horizontal distance to count as a swipe

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
    direction = 1,       // 1 = forward (next), −1 = backward (prev)
    onSwipeLeft,         // called when user swipes left (→ next page)
    onSwipeRight,        // called when user swipes right (→ prev page)
}) {
    const viewportRef = useRef(null);
    const touchStartX = useRef(null);
    const touchStartY = useRef(null);

    // Track whether pdfDoc just appeared (initial reveal vs. navigation flip)
    const [isFirstRender, setIsFirstRender] = useState(true);

    useEffect(() => {
        if (pdfDoc && isFirstRender) {
            // Small timeout so the "initial" class is applied on first render only
            const t = setTimeout(() => setIsFirstRender(false), 600);
            return () => clearTimeout(t);
        }
    }, [pdfDoc, isFirstRender]);

    // ── Touch swipe handlers ─────────────────────────────────────────────────

    const handleTouchStart = useCallback((e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    }, []);

    const handleTouchEnd = useCallback((e) => {
        if (touchStartX.current === null) return;

        const dx = e.changedTouches[0].clientX - touchStartX.current;
        const dy = e.changedTouches[0].clientY - touchStartY.current;

        touchStartX.current = null;
        touchStartY.current = null;

        // Ignore vertical-dominant swipes (scrolling)
        if (Math.abs(dy) > Math.abs(dx)) return;
        if (Math.abs(dx) < SWIPE_THRESHOLD) return;

        if (dx < 0) {
            onSwipeLeft?.();   // swipe left → next page
        } else {
            onSwipeRight?.();  // swipe right → previous page
        }
    }, [onSwipeLeft, onSwipeRight]);

    // ── Determine animation class ────────────────────────────────────────────

    // On initial load we use a gentle reveal; on navigation we use the directional flip.
    // The key={currentPage} on the inner div forces a React re-mount on every page
    // change, which restarts the CSS animation from its `from` keyframe.
    const animationClass = isFirstRender
        ? 'reader-flip-initial'
        : direction > 0
            ? 'reader-flip-forward'
            : 'reader-flip-backward';

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
         *  - Short pages: inner div fills the viewport and centres content ✓
         *  - Tall pages: inner div grows beyond the viewport; scroll starts
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
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
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

            {/* Book pages — inner wrapper with min-h-full for correct scroll behaviour.
                The key on the animated wrapper changes on every page navigation, which
                causes React to unmount the old div and mount a new one. The new div
                starts fresh with the CSS animation applied from its `from` keyframe. */}
            {pdfDoc && !error && (
                <div className="min-h-full min-w-full flex items-center justify-center py-8 px-4 sm:px-14">
                    <div key={currentPage} className={animationClass}>
                        <BookSpread
                            pdfDoc={pdfDoc}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            scale={scale}
                            viewMode={viewMode}
                            isMobile={isMobile}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
