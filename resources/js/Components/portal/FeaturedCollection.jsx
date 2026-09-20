import React from 'react';
import { Link } from '@inertiajs/react';
import { BookOpen, User, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import Button from '../ui/Button';

export default function FeaturedCollection({ materials = [] }) {
    if (!materials || materials.length === 0) return null;

    const primaryItem = materials[0];
    const secondaryItems = materials.slice(1, 4);
    const isPrimaryFeatured = Boolean(primaryItem.is_featured);

    return (
        <section aria-labelledby="featured-heading" className="space-y-6">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b-2 border-[#DCE7F3] pb-4">
                <div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0B63CE] uppercase tracking-[0.12em] mb-1.5 font-mono">
                        <Sparkles className="w-3.5 h-3.5 text-[#EE9B25]" />
                        {isPrimaryFeatured ? 'Koleksi Unggulan PERKEMI' : 'Pilihan Terbaru'}
                    </span>
                    <h2 id="featured-heading" className="font-serif text-2xl sm:text-3xl font-bold text-[#0E2747] tracking-tight">
                        Materi Pilihan Kurikulum
                    </h2>
                </div>
                <Link
                    href="/koleksi"
                    className="text-xs font-semibold text-[#0B63CE] hover:text-[#0A3F82] inline-flex items-center gap-1.5 transition-colors group shrink-0"
                >
                    <span>Lihat Seluruh Koleksi</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-150" />
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* Primary Large Editorial Card */}
                {primaryItem && (
                    <div
                        className="lg:col-span-7 bg-[#F8FBFF] rounded-xl border border-[#DCE7F3] hover:border-[#0B63CE]/50 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden group flex flex-col justify-between"
                        style={{ borderLeft: '4px solid #0B63CE' }}
                    >
                        <div className="p-6 sm:p-8 flex flex-col h-full justify-between">
                            <div className="space-y-5">
                                {/* Top badges */}
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    {/* <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#0E2747] text-white">
                                        <Sparkles className="w-3 h-3 text-[#EE9B25]" />
                                        {isPrimaryFeatured ? 'Sorotan Utama' : 'Pilihan Terbaru'}
                                    </span> */}
                                    {primaryItem.category && (
                                        <span className="text-xs font-semibold text-[#112743] flex items-center gap-1.5">
                                            <span
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: primaryItem.category.color || '#0B63CE' }}
                                            />
                                            {primaryItem.category.name}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-6 items-start">
                                    {/* Book Cover */}
                                    <div
                                        className="w-36 h-52 sm:w-40 sm:h-56 rounded-lg bg-[#EAF5FF] border border-[#DCE7F3] overflow-hidden shrink-0 group-hover:scale-[1.02] transition-transform duration-300 relative"
                                        style={{ boxShadow: '4px 8px 20px rgba(11,99,206,0.15), 1px 1px 0 rgba(255,255,255,0.9)' }}
                                    >
                                        <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-black/20 via-transparent to-black/5 z-10 pointer-events-none" />
                                        {primaryItem.cover_path ? (
                                            <img
                                                src={primaryItem.cover_path}
                                                alt={primaryItem.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full p-4 flex flex-col justify-between bg-gradient-to-b from-[#EAF5FF] to-white text-center">
                                                <BookOpen className="w-8 h-8 text-[#0B63CE] mx-auto mt-2" />
                                                <span className="font-serif text-xs font-bold text-[#0E2747] line-clamp-3 leading-snug">
                                                    {primaryItem.title}
                                                </span>
                                                <span className="text-[10px] font-mono text-[#0B63CE] font-bold tracking-wider">
                                                    {primaryItem.code || 'MODUL'}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-3 min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-mono text-[11px] font-bold text-[#0B63CE] bg-[#EAF5FF] px-2 py-0.5 rounded border border-[#0B63CE]/20">
                                                {primaryItem.code || 'DOC-01'}
                                            </span>
                                            <span className="text-[11px] text-[#6B7C93] font-medium">
                                                {primaryItem.type_label || 'Buku / Modul'}
                                            </span>
                                        </div>

                                        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0E2747] leading-snug group-hover:text-[#0B63CE] transition-colors">
                                            <Link href={`/koleksi/${primaryItem.slug}`}>
                                                {primaryItem.title}
                                            </Link>
                                        </h3>

                                        <p className="text-xs text-[#6B7C93] flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5 text-[#6B7C93]" />
                                            <span className="font-medium text-[#112743]">{primaryItem.author}</span>
                                            {primaryItem.publication_year && (
                                                <>
                                                    <span className="text-[#DCE7F3]">•</span>
                                                    <Calendar className="w-3.5 h-3.5 text-[#6B7C93]" />
                                                    <span>Tahun {primaryItem.publication_year}</span>
                                                </>
                                            )}
                                        </p>

                                        {primaryItem.summary && (
                                            <p className="text-sm text-[#4A6482] leading-relaxed line-clamp-3">
                                                {primaryItem.summary}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-5 mt-5 border-t border-[#DCE7F3] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-xs font-bold text-[#0A3F82] bg-white px-2 py-1 rounded border border-[#DCE7F3]">
                                        Format: {primaryItem.file_format || (primaryItem.source_type === 'video' ? 'VIDEO' : primaryItem.source_type === 'external_link' ? 'LINK' : 'PDF')}
                                    </span>
                                    {primaryItem.page_count && (
                                        <span className="text-xs text-[#6B7C93]">
                                            {primaryItem.page_count} Halaman
                                        </span>
                                    )}
                                </div>

                                <Link href={`/koleksi/${primaryItem.slug}`}>
                                    <Button variant="primary" size="sm" icon={ArrowRight}>
                                        Lihat Detail
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Secondary Items (3 supporting items) */}
                <div className="lg:col-span-5 flex flex-col gap-3.5 justify-between">
                    {secondaryItems.map((item) => (
                        <div
                            key={item.id || item.slug}
                            className="bg-white rounded-xl border border-[#DCE7F3] hover:border-[#0B63CE]/50 shadow-xs hover:shadow-sm transition-all duration-200 p-4 flex items-center gap-4 group"
                        >
                            {/* Thumbnail with tactile spine */}
                            <div
                                className="w-16 h-24 rounded-md bg-[#EAF5FF] border border-[#DCE7F3] overflow-hidden shrink-0 flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-200 relative"
                                style={{ boxShadow: '2px 4px 10px rgba(11,99,206,0.1)' }}
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black/15 z-10 pointer-events-none" />
                                {item.cover_path ? (
                                    <img
                                        src={item.cover_path}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <BookOpen className="w-5 h-5 text-[#0B63CE]" />
                                )}
                            </div>

                            <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex items-center gap-1.5 text-[11px] text-[#6B7C93] flex-wrap">
                                    {item.category && (
                                        <span className="font-semibold text-[#112743] flex items-center gap-1">
                                            <span
                                                className="w-1.5 h-1.5 rounded-full"
                                                style={{ backgroundColor: item.category.color || '#0B63CE' }}
                                            />
                                            {item.category.name}
                                        </span>
                                    )}
                                    <span className="text-[#DCE7F3]">•</span>
                                    <span>Tahun {item.publication_year || '—'}</span>
                                    <span className="text-[#DCE7F3]">•</span>
                                    <span className="font-mono text-[10px] font-semibold text-[#0A3F82]">
                                        {item.file_format || (item.source_type === 'video' ? 'VIDEO' : item.source_type === 'external_link' ? 'LINK' : 'PDF')}
                                    </span>
                                </div>

                                <h4 className="font-serif text-sm font-bold text-[#112743] group-hover:text-[#0B63CE] transition-colors line-clamp-2 leading-snug">
                                    <Link href={`/koleksi/${item.slug}`}>
                                        {item.title}
                                    </Link>
                                </h4>

                                <p className="text-xs text-[#6B7C93] truncate">
                                    {item.author}
                                </p>

                                <div className="pt-1">
                                    <Link
                                        href={`/koleksi/${item.slug}`}
                                        className="inline-flex items-center space-x-1 text-xs font-semibold text-[#0B63CE] hover:text-[#0A3F82] transition-colors"
                                    >
                                        <span>Lihat Detail</span>
                                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
