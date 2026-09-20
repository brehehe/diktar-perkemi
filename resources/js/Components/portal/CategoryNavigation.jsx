import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

export default function CategoryNavigation({ categories = [] }) {
    if (!categories || categories.length === 0) return null;

    return (
        <section id="kategori" className="space-y-6">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#DCE7F3] pb-4">
                <div className="space-y-1">
                    <span className="text-[11px] font-bold text-[#0B63CE] uppercase tracking-[0.14em]">
                        Klasifikasi Kurikulum
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0E2747] tracking-tight">
                        Telusuri Berdasarkan Kategori
                    </h2>
                </div>
                <Link
                    href="/kategori"
                    className="text-xs font-semibold text-[#0B63CE] hover:text-[#0A3F82] inline-flex items-center gap-1.5 transition-colors group shrink-0"
                >
                    <span>Lihat Semua Kategori</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-150" />
                </Link>
            </div>

            {/* Editorial Category Grid: 3 columns with breathing room */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {categories.map((cat) => {
                    const accentColor = cat.color || '#0B63CE';
                    return (
                        <Link
                            key={cat.id || cat.slug}
                            href={`/kategori/${cat.slug}`}
                            className="group relative bg-white rounded-xl border border-[#DCE7F3] hover:border-[#0B63CE]/50 hover:shadow-xs transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between text-left overflow-hidden"
                        >
                            {/* Subtle Left Accent Line */}
                            <div
                                className="absolute left-0 top-0 bottom-0 w-1 group-hover:w-1.5 transition-all duration-200"
                                style={{ backgroundColor: accentColor }}
                            />

                            <div className="space-y-2.5 pl-1.5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="w-2 h-2 rounded-full shrink-0"
                                            style={{ backgroundColor: accentColor }}
                                            aria-hidden="true"
                                        />
                                        <span className="font-mono text-[11px] text-[#6B7C93] font-medium">
                                            {cat.published_count} Dokumen Terbit
                                        </span>
                                    </div>

                                    <div className="w-7 h-7 rounded-lg bg-[#F8FBFF] group-hover:bg-[#EAF5FF] text-[#6B7C93] group-hover:text-[#0B63CE] border border-[#DCE7F3] group-hover:border-[#BCE0FD] flex items-center justify-center shrink-0 transition-colors">
                                        <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-150" />
                                    </div>
                                </div>

                                <h3 className="font-serif text-base sm:text-lg font-bold text-[#0E2747] group-hover:text-[#0B63CE] transition-colors leading-snug">
                                    {cat.name}
                                </h3>

                                {cat.description && (
                                    <p className="text-xs text-[#6B7C93] group-hover:text-[#4A6482] leading-relaxed line-clamp-2 pt-0.5">
                                        {cat.description}
                                    </p>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
