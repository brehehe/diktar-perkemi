import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import ReaderToolbar from '../../Components/reader/ReaderToolbar';
import ReaderSidebar from '../../Components/reader/ReaderSidebar';
import ReaderLoadingState from '../../Components/reader/ReaderLoadingState';
import ReaderErrorState from '../../Components/reader/ReaderErrorState';

export default function Show({
    material,
    has_file = false,
    file_info = null,
    file_url = null,
    download_url = null,
    can_download = false,
    related_materials = [],
    back_url = null,
}) {
    const defaultBackUrl = material?.slug ? `/koleksi/${material.slug}` : '/koleksi';
    const resolvedBackUrl = back_url || defaultBackUrl;

    const [zoom, setZoom] = useState(100);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const containerRef = useRef(null);

    // Toggle fullscreen on the whole reader container
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

    // Listen to native fullscreen changes
    useEffect(() => {
        const onFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, []);

    // Keyboard shortcuts: +/- for zoom, Esc for fullscreen
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.key === '+' || e.key === '=') && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                setZoom((prev) => Math.min(prev + 15, 200));
            } else if ((e.key === '-' || e.key === '_') && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                setZoom((prev) => Math.max(prev - 15, 50));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 15, 200));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 15, 50));

    // Construct secured PDF stream URL with view parameters
    const pdfViewUrl = file_url ? `${file_url}#toolbar=1&navpanes=1&zoom=${zoom}` : null;

    return (
        <div
            ref={containerRef}
            className="flex flex-col h-screen w-screen bg-[#112743] overflow-hidden select-none"
        >
            <Head title={`Baca: ${material.title} — Pustaka Penataran PERKEMI`} />

            {/* Top Reader Header & Toolbar */}
            <ReaderToolbar
                title={material.title}
                author={material.author}
                category={material.category}
                status={material.status}
                zoom={zoom}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                isFullscreen={isFullscreen}
                onToggleFullscreen={handleToggleFullscreen}
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
                canDownload={can_download}
                downloadUrl={download_url}
                backUrl={resolvedBackUrl}
            />

            {/* Main Reading Canvas & Sidebar */}
            <div className="flex-1 flex relative overflow-hidden bg-[#0A1A2F]">
                {/* Reading Canvas */}
                <main className="flex-1 flex flex-col relative h-full overflow-hidden bg-[#525659]">
                    {!has_file ? (
                        <ReaderErrorState
                            title="Berkas Belum Diunggah"
                            description="Dokumen buku digital untuk materi ini belum tersedia di penyimpanan privat portal."
                            backUrl={resolvedBackUrl}
                        />
                    ) : loadError ? (
                        <ReaderErrorState
                            title="Gagal Memuat Dokumen PDF"
                            description="Terjadi kendala saat membaca berkas digital. Pastikan koneksi aman dan coba muat ulang."
                            onRetry={() => {
                                setLoadError(false);
                                setIsLoading(true);
                            }}
                            backUrl={resolvedBackUrl}
                        />
                    ) : (
                        <div className="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center">
                            {isLoading && (
                                <div className="absolute inset-0 z-10">
                                    <ReaderLoadingState message={`Membuka berkas "${file_info?.original_name || 'Buku Digital'}"...`} />
                                </div>
                            )}

                            {/* Sandboxed Secure PDF Embed */}
                            <iframe
                                key={`${pdfViewUrl}-${zoom}`}
                                src={pdfViewUrl}
                                title={material.title}
                                className="w-full h-full border-0 bg-[#323639]"
                                onLoad={() => setIsLoading(false)}
                                onError={() => {
                                    setIsLoading(false);
                                    setLoadError(true);
                                }}
                            />
                        </div>
                    )}
                </main>

                {/* Right Metadata & Reference Drawer */}
                <ReaderSidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    material={material}
                    fileInfo={file_info}
                    canDownload={can_download}
                    downloadUrl={download_url}
                    relatedMaterials={related_materials}
                />
            </div>
        </div>
    );
}
