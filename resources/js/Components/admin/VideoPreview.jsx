import React, { useMemo } from 'react';
import { Play, Video, AlertCircle } from 'lucide-react';

function getEmbedUrl(url) {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();

    // YouTube Shorts
    const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,15})/);
    if (shortsMatch && shortsMatch[1]) {
        return `https://www.youtube-nocookie.com/embed/${shortsMatch[1]}?rel=0&modestbranding=1`;
    }

    // Standard YouTube
    const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,15})/);
    if (ytMatch && ytMatch[1]) {
        return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
    }

    // Vimeo
    const vimeoMatch = trimmed.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/);
    if (vimeoMatch && vimeoMatch[1]) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}?dnt=1&app_id=122963`;
    }

    return null;
}

export default function VideoPreview({
    url = '',
    title = 'Pratinjau Video',
    className = '',
}) {
    const embedUrl = useMemo(() => getEmbedUrl(url), [url]);

    if (!embedUrl) {
        return (
            <div className={`p-8 bg-[#F8FBFF] border-2 border-dashed border-[#DCE7F3] rounded-2xl flex flex-col items-center justify-center text-center text-[#6B7C93] min-h-[220px] ${className}`}>
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#DCE7F3] text-[#9BACC0] flex items-center justify-center mb-2.5 shadow-xs">
                    <Video className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-[#112743]">
                    Pratinjau Video Pembelajaran
                </p>
                <p className="text-[11px] text-[#6B7C93] mt-1 max-w-xs">
                    Masukkan tautan video YouTube, YouTube Shorts, atau Vimeo di atas untuk melihat tampilan pemutar.
                </p>
            </div>
        );
    }

    return (
        <div className={`space-y-2 ${className}`}>
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0E2747] uppercase tracking-wider flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 text-[#20A47A] fill-current" />
                    Pratinjau Pemutar Video
                </span>
                <span className="text-[10px] font-mono text-[#6B7C93] bg-white border border-[#DCE7F3] px-2 py-0.5 rounded-md">
                    16:9 Responsive
                </span>
            </div>

            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-[#DCE7F3] shadow-md">
                <iframe
                    src={embedUrl}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full border-0"
                    loading="lazy"
                />
            </div>
        </div>
    );
}
