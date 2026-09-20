import React from 'react';
import { CheckCircle2, Target, Users, BookOpenCheck, Info, Sparkles } from 'lucide-react';

export default function KeyPointsPanel({
    summary = '',
    keyPoints = [],
    learningObjectives = [],
    targetAudiences = [],
}) {
    const hasKeyPoints = Array.isArray(keyPoints) && keyPoints.length > 0;
    const hasObjectives = Array.isArray(learningObjectives) && learningObjectives.length > 0;
    const hasAudiences = Array.isArray(targetAudiences) && targetAudiences.length > 0;

    return (
        <div className="space-y-5 text-sm text-[#0E2747]">
            {/* Header */}
            <div className="flex items-start gap-3 pb-4 border-b border-[#EDF2F8]">
                <div className="w-9 h-9 rounded-xl bg-[#EAF5FF] text-[#0B63CE] flex items-center justify-center shrink-0">
                    <BookOpenCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-[#0E2747] leading-snug">Poin Penting Materi</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        Dikurasi oleh tim penataran PB PERKEMI.
                    </p>
                </div>
            </div>

            {/* Summary */}
            {summary && (
                <div className="relative p-4 rounded-xl bg-gradient-to-br from-[#F0F7FF] to-[#EAF5FF] border border-[#C8DFFF]/60">
                    <Sparkles className="absolute top-3 right-3 w-3.5 h-3.5 text-[#0B63CE]/30" />
                    <p className="text-xs leading-relaxed text-slate-700 italic pr-5">
                        "{summary}"
                    </p>
                </div>
            )}

            {/* Key Points */}
            <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                    Pokok Pembahasan Utama
                </h3>

                {hasKeyPoints ? (
                    <ol className="space-y-2">
                        {keyPoints.map((point, idx) => (
                            <li
                                key={idx}
                                className="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#E8F0FB] hover:border-[#0B63CE]/30 hover:bg-[#F7FBFF] transition-colors cursor-default"
                            >
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#0B63CE] text-white text-[10px] font-bold shrink-0 mt-0.5 font-mono">
                                    {idx + 1}
                                </span>
                                <span className="text-xs text-slate-600 leading-relaxed">
                                    {point}
                                </span>
                            </li>
                        ))}
                    </ol>
                ) : (
                    <div className="flex flex-col items-center py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <Info className="w-5 h-5 mb-2 text-slate-300" />
                        <p className="text-slate-400 font-medium text-[11px]">Belum dikonfigurasi admin.</p>
                    </div>
                )}
            </div>

            {/* Learning Objectives */}
            <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                    <Target className="w-3 h-3 text-[#0B63CE]" />
                    <span>Tujuan Pembelajaran</span>
                </h3>

                {hasObjectives ? (
                    <ul className="space-y-2">
                        {learningObjectives.map((obj, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{obj}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-[11px] text-slate-400 px-1">
                        Tujuan pembelajaran belum ditentukan.
                    </p>
                )}
            </div>

            {/* Target Audience */}
            {(hasAudiences || true) && (
                <div className="pt-4 border-t border-[#EDF2F8]">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5 flex items-center gap-1.5">
                        <Users className="w-3 h-3 text-[#0B63CE]" />
                        <span>Materi ini cocok untuk:</span>
                    </h3>

                    {hasAudiences ? (
                        <div className="flex flex-wrap gap-1.5">
                            {targetAudiences.map((aud, idx) => (
                                <span
                                    key={idx}
                                    className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#EAF5FF] text-[#0A4FAF] text-[11px] font-semibold border border-[#C8DFFF]/60"
                                >
                                    {typeof aud === 'string' ? aud : aud.name}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[11px] text-slate-400 px-1">
                            Terbuka untuk seluruh kenshi PERKEMI.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
