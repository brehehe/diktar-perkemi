import React from 'react';
import { Video, ShieldCheck, Play } from 'lucide-react';

export default function VideoPlayer({
    embedUrl,
    title = 'Video Pembelajaran PERKEMI',
    provider = 'youtube',
    className = '',
}) {
    if (!embedUrl) {
        return (
            <div className={`p-8 bg-[#F8FBFF] border border-[#DCE7F3] rounded-2xl flex flex-col items-center justify-center text-center text-[#6B7C93] min-h-[260px] ${className}`}>
                <div className="w-12 h-12 rounded-xl bg-white border border-[#DCE7F3] text-[#9BACC0] flex items-center justify-center mb-3 shadow-xs">
                    <Video className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#112743]">
                    Video Tidak Tersedia
                </h4>
                <p className="text-xs text-[#6B7C93] mt-1 max-w-sm">
                    Tautan video pembelajaran belum dikonfigurasi dengan benar oleh administrator.
                </p>
            </div>
        );
    }

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Player Container */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#0E2747] border border-[#DCE7F3] shadow-lg">
                <iframe
                    src={embedUrl}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full border-0"
                    loading="lazy"
                />
            </div>

            {/* Sub-bar / Security notice */}
            <div className="flex items-center justify-between text-[11px] text-[#6B7C93] px-1">
                <span className="flex items-center gap-1 font-medium text-[#20A47A]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Pemutar Terverifikasi PERKEMI ({provider === 'vimeo' ? 'Vimeo Player' : 'YouTube Privacy-Enhanced'})
                </span>
                <span className="font-mono text-[10px]">
                    1080p HD Supported
                </span>
            </div>
        </div>
    );
}
