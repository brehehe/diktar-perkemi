import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

const THUMBNAIL_SCALE = 0.18; // Render at 18% of full scale for thumbnails
const BATCH_SIZE = 12;        // Render N thumbnails at a time via IntersectionObserver

/**
 * ThumbnailItem — renders a single PDF page as a small preview.
 * Uses IntersectionObserver (via ref) so thumbnails only render when visible.
 */
function ThumbnailItem({ pdfDoc, pageNumber, isActive, onSelect }) {
    const canvasRef = useRef(null);
    const wrapperRef = useRef(null);
    const [rendered, setRendered] = useState(false);
    const [loading, setLoading] = useState(false);

    const renderPage = useCallback(async () => {
        if (!pdfDoc || !canvasRef.current || rendered || loading) return;
        setLoading(true);
        try {
            const page = await pdfDoc.getPage(pageNumber);
            const pixelRatio = window.devicePixelRatio || 1;
            const baseVp = page.getViewport({ scale: THUMBNAIL_SCALE });
            const renderVp = page.getViewport({ scale: THUMBNAIL_SCALE * pixelRatio });
            const canvas = canvasRef.current;
            canvas.width  = renderVp.width;
            canvas.height = renderVp.height;
            canvas.style.width  = `${baseVp.width}px`;
            canvas.style.height = `${baseVp.height}px`;
            const ctx = canvas.getContext('2d', { alpha: false });
            const task = page.render({ canvasContext: ctx, viewport: renderVp });
            await task.promise;
            setRendered(true);
        } catch (e) {
            if (e?.name !== 'RenderingCancelledException') {
                console.warn(`Thumbnail ${pageNumber} error:`, e);
            }
        } finally {
            setLoading(false);
        }
    }, [pdfDoc, pageNumber, rendered, loading]);

    // Lazy render: observe visibility
    useEffect(() => {
        if (!wrapperRef.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) renderPage(); },
            { threshold: 0.1, rootMargin: '80px' }
        );
        observer.observe(wrapperRef.current);
        return () => observer.disconnect();
    }, [renderPage]);

    return (
        <button
            ref={wrapperRef}
            type="button"
            onClick={() => onSelect(pageNumber)}
            aria-label={`Buka halaman ${pageNumber}`}
            aria-pressed={isActive}
            className={[
                'group flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE]',
                isActive
                    ? 'bg-[#EAF5FF] ring-2 ring-[#0B63CE]'
                    : 'hover:bg-slate-50',
            ].join(' ')}
        >
            {/* Canvas container */}
            <div className="relative bg-white rounded border border-[#DCE7F3] overflow-hidden shadow-sm"
                 style={{ minWidth: 56, minHeight: 80 }}>
                {loading && !rendered && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                        <Loader2 className="w-3 h-3 animate-spin text-[#0B63CE]" />
                    </div>
                )}
                <canvas ref={canvasRef} className="block max-w-full" />
            </div>

            {/* Page number */}
            <span className={`text-[9px] font-mono font-bold tabular-nums ${
                isActive ? 'text-[#0B63CE]' : 'text-[#6B7C93]'
            }`}>
                {pageNumber}
            </span>
        </button>
    );
}

/**
 * FlipbookThumbnailPanel
 * Lazy-rendered grid of PDF page thumbnails.
 */
export default function FlipbookThumbnailPanel({
    pdfDoc,
    totalPages = 1,
    currentPage = 1,
    onSelectPage,
}) {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    if (!pdfDoc) {
        return (
            <div className="flex items-center justify-center h-40 text-xs text-[#6B7C93]">
                Dokumen belum tersedia.
            </div>
        );
    }

    return (
        <div className="p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7C93] mb-3">
                {totalPages} Halaman
            </p>
            <div className="grid grid-cols-3 gap-2">
                {pages.map(page => (
                    <ThumbnailItem
                        key={page}
                        pdfDoc={pdfDoc}
                        pageNumber={page}
                        isActive={page === currentPage}
                        onSelect={onSelectPage}
                    />
                ))}
            </div>
        </div>
    );
}
