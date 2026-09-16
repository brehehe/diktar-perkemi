import React from 'react';
import { User, Calendar, Award, CheckCircle2, Target, Video } from 'lucide-react';

export default function VideoMeta({
    material,
    className = '',
}) {
    const keyPoints = Array.isArray(material.key_points) ? material.key_points.filter(Boolean) : [];
    const objectives = Array.isArray(material.learning_objectives) ? material.learning_objectives.filter(Boolean) : [];

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-white border border-[#DCE7F3] rounded-xl shadow-xs text-xs">
                <div className="space-y-0.5">
                    <span className="text-[11px] text-[#6B7C93] flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#9BACC0]" />
                        Pemateri / Instruktur
                    </span>
                    <p className="font-semibold text-[#112743] truncate">
                        {material.author || 'Dewan Guru PERKEMI'}
                    </p>
                </div>

                <div className="space-y-0.5">
                    <span className="text-[11px] text-[#6B7C93] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#9BACC0]" />
                        Tahun Produksi
                    </span>
                    <p className="font-semibold text-[#112743]">
                        {material.publication_year || '—'}
                    </p>
                </div>

                <div className="space-y-0.5 col-span-2 sm:col-span-1">
                    <span className="text-[11px] text-[#6B7C93] flex items-center gap-1">
                        <Video className="w-3.5 h-3.5 text-[#9BACC0]" />
                        Platform Penyiaran
                    </span>
                    <p className="font-semibold text-[#112743] uppercase font-mono text-[11px]">
                        {material.video_provider || 'YouTube'}
                    </p>
                </div>
            </div>

            {/* Key Points */}
            {keyPoints.length > 0 && (
                <div className="bg-white rounded-xl border border-[#DCE7F3] p-5 shadow-xs space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#EBFBEE] text-[#20A47A] flex items-center justify-center shadow-xs">
                            <CheckCircle2 className="w-4 h-4" />
                        </span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#0E2747]">
                            Poin-Poin Penting Pembelajaran
                        </h4>
                    </div>
                    <ul className="space-y-2 text-xs text-[#4A6482]">
                        {keyPoints.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#20A47A] shrink-0 mt-1.5" />
                                <span className="leading-relaxed">{point}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Learning Objectives */}
            {objectives.length > 0 && (
                <div className="bg-white rounded-xl border border-[#DCE7F3] p-5 shadow-xs space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#EAF5FF] text-[#0B63CE] flex items-center justify-center shadow-xs">
                            <Target className="w-4 h-4" />
                        </span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#0E2747]">
                            Target Capaian & Sasaran
                        </h4>
                    </div>
                    <ul className="space-y-2 text-xs text-[#4A6482]">
                        {objectives.map((obj, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0B63CE] shrink-0 mt-1.5" />
                                <span className="leading-relaxed">{obj}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
