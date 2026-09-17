import React, { useState, useRef, useEffect } from 'react';
import {
    ExternalLink,
    Globe,
    ShieldCheck,
    AlertCircle,
    BookOpen,
    Maximize2,
    Minimize2,
    RotateCw,
    Info,
} from 'lucide-react';
import Button from '../ui/Button';

export default function ExternalMaterialViewer({
    url,
    externalUrl,
    sourceName = 'Repositori Eksternal Resmi',
    openMode = 'new_tab',
    title = 'Buku Digital',
    className = '',
}) {
    const containerRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    const directUrl = externalUrl || url;

    // Listen to native fullscreen changes (Esc key, browser toggle)
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    };

    const handleReload = () => {
        setReloadKey((prev) => prev + 1);
    };

    if (!url && !directUrl) {
        return (
            <div className={`p-8 bg-[#F8FBFF] border border-[#DCE7F3] rounded-2xl text-center text-[#6B7C93] ${className}`}>
                <AlertCircle className="w-8 h-8 text-[#FA5252] mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#112743]">Tautan Tidak Ditemukan</p>
                <p className="text-xs text-[#6B7C93] mt-1">Tautan buku digital belum dilengkapi oleh administrator.</p>
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {/* 1. Header Info & Direct Access Card */}
            <div className="bg-white border border-[#DCE7F3] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF3E6] text-[#EE9B25] flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                        <Globe className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FFF3E6] text-[#EE9B25] border border-[#FFD8A8]">
                                SUMBER EKSTERNAL
                            </span>
                            <span className="text-xs font-semibold text-[#0E2747]">
                                {sourceName || 'Perpustakaan Digital Terverifikasi'}
                            </span>
                            {openMode === 'embed' && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EAF5FF] text-[#0B63CE] border border-[#BCE0FD]">
                                    Pratinjau Tersemat
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-[#6B7C93] leading-relaxed">
                            Materi ini di-hosting di repositori eksternal resmi. Hak cipta dan akses diatur oleh penyedia konten terkait.
                        </p>
                    </div>
                </div>

                <a
                    href={directUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto shrink-0"
                >
                    <Button
                        variant="primary"
                        size="md"
                        icon={ExternalLink}
                        className="w-full sm:w-auto justify-center"
                    >
                        Buka Buku di Tab Baru
                    </Button>
                </a>
            </div>

            {/* 2. Embedded Reader Frame (When openMode === 'embed') */}
            {openMode === 'embed' && (
                <div
                    ref={containerRef}
                    className={`relative w-full rounded-2xl overflow-hidden bg-[#0E2747] border border-[#DCE7F3] shadow-md flex flex-col transition-all duration-200 ${
                        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-[680px] sm:h-[740px] md:h-[800px]'
                    }`}
                >
                    {/* Top control bar inside embed viewer */}
                    <div className="bg-[#0E2747] text-white px-4 py-2.5 flex items-center justify-between gap-3 border-b border-white/10 shrink-0 select-none">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2 h-2 rounded-full bg-[#20A47A] animate-pulse shrink-0" />
                            <span className="text-xs font-semibold truncate text-white/90">
                                {title}
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                            <button
                                type="button"
                                onClick={handleReload}
                                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                                title="Muat Ulang Pratinjau"
                                aria-label="Muat Ulang Pratinjau"
                            >
                                <RotateCw className="w-4 h-4" />
                            </button>

                            <button
                                type="button"
                                onClick={toggleFullscreen}
                                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                                title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
                                aria-label={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
                            >
                                {isFullscreen ? (
                                    <Minimize2 className="w-4 h-4" />
                                ) : (
                                    <Maximize2 className="w-4 h-4" />
                                )}
                            </button>

                            <a
                                href={directUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#0B63CE] hover:bg-[#0A3F82] text-white transition-colors ml-1"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Tab Baru</span>
                            </a>
                        </div>
                    </div>

                    {/* Iframe Stage */}
                    <div className="relative flex-1 w-full h-full bg-white">
                        <iframe
                            key={reloadKey}
                            src={url || directUrl}
                            title={title}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-read; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                            allowFullScreen
                            loading="eager"
                        />
                    </div>
                </div>
            )}

            {/* 3. Fallback / Helpful Navigation Banner */}
            {openMode === 'embed' && (
                <div className="p-3.5 bg-[#F8FBFF] border border-[#DCE7F3] rounded-xl flex items-center justify-between gap-3 text-xs text-[#6B7C93]">
                    <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-[#0B63CE] shrink-0" />
                        <span>
                            Pratinjau disematkan dari repositori resmi <strong>{sourceName}</strong>. Jika tampilan buku terpotong atau dibatasi peramban, buka langsung melalui tab baru.
                        </span>
                    </div>
                    <a
                        href={directUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 font-semibold text-[#0B63CE] hover:text-[#0A3F82] flex items-center gap-1"
                    >
                        <span>Buka Sumber</span>
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            )}
        </div>
    );
}
