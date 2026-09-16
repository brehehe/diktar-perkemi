import React from 'react';
import { FileText, ExternalLink, Video } from 'lucide-react';

export default function MaterialSourceBadge({
    sourceType = 'uploaded_pdf',
    className = '',
}) {
    if (sourceType === 'video') {
        return (
            <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#F3EDFF] text-[#7957D5] border border-[#D0BFFF] ${className}`}
            >
                <Video className="w-3 h-3 shrink-0" />
                <span>VIDEO</span>
            </span>
        );
    }

    if (sourceType === 'external_link') {
        return (
            <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#FFF3E6] text-[#EE9B25] border border-[#FFD8A8] ${className}`}
            >
                <ExternalLink className="w-3 h-3 shrink-0" />
                <span>TAUTAN</span>
            </span>
        );
    }

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#EAF5FF] text-[#0B63CE] border border-[#BCE0FD] ${className}`}
        >
            <FileText className="w-3 h-3 shrink-0" />
            <span>PDF</span>
        </span>
    );
}
