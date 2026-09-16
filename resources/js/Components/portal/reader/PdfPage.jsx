import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function PdfPage({
    pdfDoc,
    pageNumber,
    scale = 1.0,
    isRightSide = false,
    isSingle = false,
    onDimensionsChange,
}) {
    const canvasRef = useRef(null);
    const renderTaskRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        let isCancelled = false;

        if (!pdfDoc || !pageNumber) return;

        const renderPage = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Cancel any pending render task
                if (renderTaskRef.current) {
                    try {
                        renderTaskRef.current.cancel();
                    } catch (e) {
                        // ignore cancelled task exception
                    }
                    renderTaskRef.current = null;
                }

                const page = await pdfDoc.getPage(pageNumber);
                if (isCancelled) return;

                // Calculate HiDPI resolution
                const pixelRatio = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
                // Base viewport at scale (1.0 = native PDF pt to CSS px)
                const baseViewport = page.getViewport({ scale: scale });
                const renderViewport = page.getViewport({ scale: scale * pixelRatio });

                const canvas = canvasRef.current;
                if (!canvas || isCancelled) return;

                const context = canvas.getContext('2d', { alpha: false });
                if (!context) return;

                canvas.width = renderViewport.width;
                canvas.height = renderViewport.height;

                // CSS display size (points to CSS pixels)
                canvas.style.width = `${baseViewport.width}px`;
                canvas.style.height = `${baseViewport.height}px`;

                setDimensions({
                    width: baseViewport.width,
                    height: baseViewport.height,
                });

                onDimensionsChange?.({
                    pageNumber,
                    width: baseViewport.width,
                    height: baseViewport.height,
                });

                const renderContext = {
                    canvasContext: context,
                    viewport: renderViewport,
                };

                const task = page.render(renderContext);
                renderTaskRef.current = task;

                await task.promise;
                if (!isCancelled) {
                    setIsLoading(false);
                }
            } catch (err) {
                if (err?.name !== 'RenderingCancelledException' && !isCancelled) {
                    console.error(`Error rendering page ${pageNumber}:`, err);
                    setError('Gagal memuat halaman.');
                    setIsLoading(false);
                }
            }
        };

        renderPage();

        return () => {
            isCancelled = true;
            if (renderTaskRef.current) {
                try {
                    renderTaskRef.current.cancel();
                } catch (e) {
                    // ignore
                }
            }
        };
    }, [pdfDoc, pageNumber, scale]);

    // Spine gutter effect:
    // Left page: soft shadow on the right edge towards the center seam.
    // Right page: soft shadow on the left edge towards the center seam.
    // Single page: uniform elegant paper shadow.
    const spreadClasses = isSingle
        ? 'rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/80'
        : isRightSide
        ? 'rounded-r-md border-y border-r border-slate-200/80 shadow-[inset_16px_0_20px_-10px_rgba(0,0,0,0.06),4px_6px_20px_rgba(0,0,0,0.08)]'
        : 'rounded-l-md border-y border-l border-slate-200/80 shadow-[inset_-16px_0_20px_-10px_rgba(0,0,0,0.06),-4px_6px_20px_rgba(0,0,0,0.08)]';

    return (
        <div
            className={`relative bg-white flex flex-col items-center justify-center transition-shadow duration-200 overflow-hidden ${spreadClasses}`}
            style={{
                width: dimensions.width ? `${dimensions.width}px` : 'auto',
                height: dimensions.height ? `${dimensions.height}px` : 'auto',
                aspectRatio: !dimensions.width ? '595 / 842' : undefined,
            }}
        >
            {/* Loading Indicator for page */}
            {isLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/90 backdrop-blur-xs">
                    <Loader2 className="w-6 h-6 animate-spin text-[#0B63CE] mb-2" />
                    <span className="text-xs text-slate-500 font-medium">
                        Memuat Halaman {pageNumber}...
                    </span>
                </div>
            )}

            {/* Error Overlay */}
            {error && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-rose-50/90 p-4 text-center">
                    <span className="text-xs text-rose-600 font-semibold">{error}</span>
                </div>
            )}

            {/* Canvas Page Surface */}
            <canvas
                ref={canvasRef}
                className="block max-w-full h-auto bg-white"
            />

            {/* Subtle Page Number Footer inside page margin */}
            <div
                className={`absolute bottom-2 text-[10px] text-slate-400 font-mono select-none pointer-events-none px-4 ${
                    isSingle ? 'right-3' : isRightSide ? 'right-4' : 'left-4'
                }`}
            >
                {pageNumber}
            </div>
        </div>
    );
}
