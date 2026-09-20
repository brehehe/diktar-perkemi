import React, { useMemo } from 'react';
import { Video, Play, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Input from '../ui/Input';
import Checkbox from '../ui/Checkbox';

// Client-side detection helper
function detectProvider(url) {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim().toLowerCase();

    if (trimmed.includes('youtube.com/shorts/')) {
        return { name: 'YouTube Shorts', color: '#DD4D7C', bg: '#FDE8EF' };
    }
    if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
        return { name: 'YouTube', color: '#E03131', bg: '#FFE3E3' };
    }
    if (trimmed.includes('vimeo.com')) {
        return { name: 'Vimeo', color: '#1098AD', bg: '#E3FAFC' };
    }

    return null;
}

export default function VideoUrlField({
    url = '',
    onUrlChange,
    allowPortal = true,
    onAllowPortalChange,
    error,
    className = '',
}) {
    const detected = useMemo(() => detectProvider(url), [url]);

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Guidance banner */}
            <div className="flex items-start gap-3 p-3.5 bg-[#F3EDFF] border border-[#D0BFFF] rounded-xl text-xs text-[#5F3DC4]">
                <Video className="w-4 h-4 text-[#7957D5] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                    <p className="font-semibold text-[#0E2747]">
                        Video Pembelajaran Resmi
                    </p>
                    <p className="text-[11px] text-[#6B7C93] leading-relaxed">
                        Masukkan tautan resmi dari <strong>YouTube</strong>, <strong>YouTube Shorts</strong>, atau <strong>Vimeo</strong>. Sistem akan menormalisasi tautan ke pemutar embed aman tanpa iklan pihak ketiga yang mengganggu.
                    </p>
                </div>
            </div>

            {/* Input URL */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-[#112743]">
                        URL Video Pembelajaran <span className="text-[#FA5252]">*</span>
                    </label>

                    {detected && (
                        <span
                            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border"
                            style={{
                                backgroundColor: detected.bg,
                                color: detected.color,
                                borderColor: `${detected.color}30`,
                            }}
                        >
                            <CheckCircle2 className="w-3 h-3" />
                            Provider Terdeteksi: {detected.name}
                        </span>
                    )}
                </div>

                <Input
                    name="video_url"
                    value={url}
                    onChange={(e) => onUrlChange && onUrlChange(e.target.value)}
                    placeholder="Contoh: https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                    required
                    error={error}
                />
            </div>

            {/* Checkbox Izinkan ditampilkan di portal */}
            <div className="pt-1">
                <Checkbox
                    id="video_allow_portal_checkbox"
                    label="Izinkan video ditampilkan langsung di portal"
                    description="Jika aktif, pemutar video akan tertanam di halaman detail materi kenshi."
                    checked={allowPortal}
                    onChange={(checked) => onAllowPortalChange && onAllowPortalChange(checked)}
                />
            </div>
        </div>
    );
}
