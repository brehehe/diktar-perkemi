import React from 'react';
import { Link } from '@inertiajs/react';
import { Clock, ArrowRight, BookOpen } from 'lucide-react';
import Button from '../ui/Button';

export default function LatestCollectionList({ materials = [] }) {
    if (!materials || materials.length === 0) return null;

    return (
        <section className="space-y-6">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b-2 border-[#DCE7F3] pb-4">
                <div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0B63CE] uppercase tracking-[0.12em] mb-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Pembaruan Dokumen
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0E2747]">
                        Koleksi Terbaru Diterbitkan
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

            {/* List Container */}
            <div className="bg-white rounded-2xl border border-[#DCE7F3] divide-y divide-[#DCE7F3] overflow-hidden shadow-xs">
                {materials.map((item, index) => (
                    <div
                        key={item.id}
                        className="relative p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8FBFF] transition-colors duration-150 group"
                    >
                        {/* Left accent line on hover */}
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#0B63CE] opacity-0 group-hover:opacity-100 transition-opacity duration-150 rounded-l-2xl" />

                        <div className="flex items-center gap-4 min-w-0">
                            {/* Index number */}
                            <span className="font-mono text-[11px] font-bold text-[#DCE7F3] shrink-0 w-5 text-right select-none hidden sm:block">
                                {String(index + 1).padStart(2, '0')}
                            </span>

                            {/* Thumbnail — larger */}
                            <div
                                className="w-12 h-[68px] rounded-lg bg-[#EAF5FF] border border-[#DCE7F3] overflow-hidden shrink-0 flex items-center justify-center group-hover:scale-[1.03] transition-transform duration-200"
                                style={{ boxShadow: '2px 3px 8px rgba(11,99,206,0.09)' }}
                            >
                                {item.cover_path ? (
                                    <img
                                        src={item.cover_path}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <BookOpen className="w-4 h-4 text-[#0B63CE]" />
                                )}
                            </div>

                            <div className="min-w-0 space-y-1">
                                <div className="flex items-center gap-2 text-[11px] flex-wrap">
                                    <span className="font-semibold text-[#0B63CE]">
                                        {item.published_at || 'Baru Rilis'}
                                    </span>
                                    {item.category && (
                                        <>
                                            <span className="text-[#DCE7F3]">·</span>
                                            <span
                                                className="inline-flex items-center gap-1 font-semibold"
                                                style={{ color: item.category.color || '#0B63CE' }}
                                            >
                                                <span
                                                    className="w-1.5 h-1.5 rounded-full"
                                                    style={{ backgroundColor: item.category.color || '#0B63CE' }}
                                                />
                                                {item.category.name}
                                            </span>
                                        </>
                                    )}
                                    <span className="text-[#DCE7F3]">·</span>
                                    <span className="font-mono text-[10px] font-bold text-[#9BACC0] tracking-wider">PDF</span>
                                </div>

                                <h3 className="font-serif text-sm sm:text-[15px] font-bold text-[#112743] group-hover:text-[#0B63CE] transition-colors line-clamp-1">
                                    <Link href={`/koleksi/${item.slug}`}>
                                        {item.title}
                                    </Link>
                                </h3>

                                <p className="text-xs text-[#9BACC0] truncate">
                                    {item.author} · {item.type_label}
                                </p>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pl-9 sm:pl-0">
                            <Link href={`/koleksi/${item.slug}`}>
                                <Button variant="secondary" size="xs">
                                    Detail
                                </Button>
                            </Link>
                            <Link href={`/koleksi/${item.slug}/baca`}>
                                <Button variant="primary" size="xs" icon={BookOpen}>
                                    Baca
                                </Button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
