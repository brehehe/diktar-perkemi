import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ pagination, className = '' }) {
    if (!pagination || pagination.total === 0) return null;

    const {
        current_page,
        from = 0,
        to = 0,
        total = 0,
        links = [],
        prev_page_url,
        next_page_url,
    } = pagination;

    // If there's only 1 page and less than or equal to per_page items, only show info or nothing if 0
    const hasMultiplePages = links.length > 3;

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 border-t border-[#DCE7F3] bg-white text-xs text-[#6B7C93] select-none ${className}`}>
            {/* Range info */}
            <div>
                Menampilkan <span className="font-semibold text-[#112743]">{from ?? 0}</span>–<span className="font-semibold text-[#112743]">{to ?? 0}</span> dari <span className="font-semibold text-[#112743]">{total}</span> data
            </div>

            {/* Pagination Controls */}
            {hasMultiplePages && (
                <div className="flex items-center gap-1">
                    {/* Previous Button */}
                    {prev_page_url ? (
                        <Link
                            href={prev_page_url}
                            preserveState
                            preserveScroll
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-[#DCE7F3] text-[#112743] hover:bg-[#F8FBFF] hover:border-[#0B63CE]/40 transition-colors"
                            aria-label="Halaman sebelumnya"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Sebelumnya</span>
                        </Link>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-[#DCE7F3]/40 text-[#6B7C93]/40 cursor-not-allowed">
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Sebelumnya</span>
                        </span>
                    )}

                    {/* Numeric Links */}
                    <div className="hidden sm:flex items-center gap-1">
                        {links.slice(1, -1).map((link, idx) => {
                            if (!link.url) {
                                return (
                                    <span
                                        key={idx}
                                        className="px-2.5 py-1.5 text-xs text-[#6B7C93]"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            }

                            return (
                                <Link
                                    key={idx}
                                    href={link.url}
                                    preserveState
                                    preserveScroll
                                    className={`
                                        min-w-[32px] h-8 flex items-center justify-center rounded-md border text-xs font-medium transition-colors
                                        ${link.active ? 'bg-[#0B63CE] border-[#0B63CE] text-white shadow-xs' : 'border-[#DCE7F3] text-[#112743] hover:bg-[#F8FBFF] hover:border-[#0B63CE]/40'}
                                    `}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            );
                        })}
                    </div>

                    {/* Compact mobile current indicator */}
                    <div className="sm:hidden px-2 font-medium text-[#112743]">
                        {current_page} / {pagination.last_page}
                    </div>

                    {/* Next Button */}
                    {next_page_url ? (
                        <Link
                            href={next_page_url}
                            preserveState
                            preserveScroll
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-[#DCE7F3] text-[#112743] hover:bg-[#F8FBFF] hover:border-[#0B63CE]/40 transition-colors"
                            aria-label="Halaman berikutnya"
                        >
                            <span className="hidden sm:inline">Berikutnya</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-[#DCE7F3]/40 text-[#6B7C93]/40 cursor-not-allowed">
                            <span className="hidden sm:inline">Berikutnya</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
