import React from 'react';
import { Link } from '@inertiajs/react';
import { BookOpen, User, Calendar, FileText, ArrowUpRight, Play, Video, ExternalLink } from 'lucide-react';
import MaterialSourceBadge from './MaterialSourceBadge';

// Map type to muted badge styling
const typeColors = {
    module: { bg: '#EAF5FF', text: '#0B63CE', border: '#BCE0FD' },
    book: { bg: '#F0FDF4', text: '#2B8A3E', border: '#B2F2BB' },
    speaker_material: { bg: '#FFF3E6', text: '#E8590C', border: '#FFD8A8' },
    guideline: { bg: '#F3EDFF', text: '#7B5BF0', border: '#D0BFFF' },
    reference: { bg: '#E3FAFC', text: '#1098AD', border: '#99E9F2' },
};

export default function CollectionCard({ material, className = '' }) {
    const typeStyle = typeColors[material.type] || { bg: '#F8FBFF', text: '#6B7C93', border: '#DCE7F3' };

    const ctaLabel = material.cta_label || (
        material.source_type === 'video' ? 'Tonton Video' :
        material.source_type === 'external_link' ? 'Buka Buku Digital' :
        'Baca E-Book'
    );

    const ctaHref = material.source_type === 'uploaded_pdf'
        ? `/koleksi/${material.slug}/baca`
        : `/koleksi/${material.slug}`;

    return (
        <div
            className={`group bg-white rounded-2xl border border-[#DCE7F3] hover:border-[#0B63CE]/50 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col ${className}`}
        >
            {/* Top Cover Area */}
            <div className="relative h-52 bg-gradient-to-b from-[#EAF5FF]/70 to-[#F8FBFF] border-b border-[#DCE7F3] flex items-center justify-center overflow-hidden">
                {/* Subtle dot grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #0B63CE 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                    }}
                />

                {/* Book Cover with realistic book shadow */}
                <div className="relative w-28 h-40 rounded-lg overflow-hidden border border-[#DCE7F3]/80 group-hover:scale-[1.03] transition-transform duration-300 z-10"
                    style={{ boxShadow: '3px 3px 12px rgba(11,99,206,0.12), 1px 1px 0 rgba(255,255,255,0.8)' }}
                >
                    {material.cover_path ? (
                        <img
                            src={material.cover_path}
                            alt={material.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col justify-between bg-gradient-to-b from-[#EAF5FF] to-white p-3 text-center">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto shadow-sm ${
                                material.source_type === 'video'
                                    ? 'bg-[#7957D5] text-white'
                                    : material.source_type === 'external_link'
                                    ? 'bg-[#EE9B25] text-white'
                                    : 'bg-[#0B63CE] text-white'
                            }`}>
                                {material.source_type === 'video' ? (
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                ) : material.source_type === 'external_link' ? (
                                    <ExternalLink className="w-3.5 h-3.5" />
                                ) : (
                                    <BookOpen className="w-3.5 h-3.5" />
                                )}
                            </div>
                            <div className="space-y-1">
                                <span className="font-serif text-[10px] font-bold text-[#0E2747] line-clamp-3 leading-tight block">
                                    {material.title}
                                </span>
                                <span className="text-[8px] uppercase tracking-widest text-[#0B63CE] font-bold">
                                    PERKEMI
                                </span>
                            </div>
                            <span className="text-[8px] font-mono text-[#9BACC0]">
                                {material.code || 'MODUL'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Category Pill — top right */}
                {material.category && (
                    <div className="absolute top-3 right-3 z-10">
                        <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
                            style={{
                                backgroundColor: `${material.category.color || '#0B63CE'}14`,
                                borderColor: `${material.category.color || '#0B63CE'}30`,
                                color: material.category.color || '#0B63CE',
                            }}
                        >
                            <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: material.category.color || '#0B63CE' }}
                            />
                            {material.category.name}
                        </span>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                    {/* Meta info row */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {material.code && (
                            <span className="font-mono text-[10px] font-bold text-[#0B63CE] bg-[#EAF5FF] px-1.5 py-0.5 rounded border border-[#BCE0FD]">
                                {material.code}
                            </span>
                        )}
                        <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded border"
                            style={{
                                backgroundColor: typeStyle.bg,
                                color: typeStyle.text,
                                borderColor: typeStyle.border,
                            }}
                        >
                            {material.type_label}
                        </span>
                        {material.publication_year && (
                            <span className="text-[11px] text-[#9BACC0] font-medium">
                                {material.publication_year}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-[15px] font-bold text-[#112743] group-hover:text-[#0B63CE] transition-colors line-clamp-2 leading-snug">
                        <Link href={`/koleksi/${material.slug}`}>
                            {material.title}
                        </Link>
                    </h3>

                    {/* Author */}
                    <p className="text-xs text-[#6B7C93] flex items-center gap-1.5 truncate">
                        <User className="w-3.5 h-3.5 text-[#9BACC0] shrink-0" />
                        <span className="truncate">{material.author}</span>
                    </p>

                    {/* Summary */}
                    {material.summary && (
                        <p className="text-xs text-[#6B7C93] line-clamp-2 leading-relaxed">
                            {material.summary}
                        </p>
                    )}
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-[#DCE7F3] flex items-center justify-between gap-2">
                    <MaterialSourceBadge sourceType={material.source_type} />

                    <Link
                        href={ctaHref}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EAF5FF] hover:bg-[#0B63CE] text-xs font-semibold text-[#0B63CE] hover:text-white transition-all duration-150 group/cta"
                    >
                        {material.source_type === 'video' ? (
                            <Play className="w-3 h-3 fill-current" />
                        ) : material.source_type === 'external_link' ? (
                            <ExternalLink className="w-3 h-3" />
                        ) : (
                            <BookOpen className="w-3 h-3" />
                        )}
                        <span>{ctaLabel}</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
