import React, { useState } from 'react';
import { ExternalLink, Globe, ShieldCheck, AlertCircle, BookOpen } from 'lucide-react';
import Button from '../ui/Button';

export default function ExternalMaterialViewer({
    url,
    sourceName = 'Repositori Eksternal Resmi',
    openMode = 'new_tab',
    title = 'Buku Digital',
    className = '',
}) {
    const [iframeFailed, setIframeFailed] = useState(false);

    if (!url) {
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
            {/* Header info panel */}
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
                        </div>
                        <p className="text-xs text-[#6B7C93] leading-relaxed">
                            Materi ini di-hosting di repositori eksternal resmi. Hak cipta dan akses diatur oleh penyedia konten terkait.
                        </p>
                    </div>
                </div>

                <a
                    href={url}
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

            {/* If embed mode and not failed, display iframe */}
            {openMode === 'embed' && (
                <div className="space-y-2">
                    <div className="relative w-full h-[640px] rounded-2xl overflow-hidden bg-white border border-[#DCE7F3] shadow-md">
                        <iframe
                            src={url}
                            title={title}
                            className="w-full h-full border-0"
                            loading="lazy"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                            onError={() => setIframeFailed(true)}
                        />
                    </div>
                    <p className="text-[11px] text-[#6B7C93] text-center">
                        Bila dokumen terpotong atau diblokir oleh kebijakan keamanan situs sumber, silakan gunakan tombol <strong>Buka Buku di Tab Baru</strong>.
                    </p>
                </div>
            )}
        </div>
    );
}
