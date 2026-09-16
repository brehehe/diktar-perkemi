import React from 'react';
import { ListOrdered, ChevronRight } from 'lucide-react';

/**
 * FlipbookTOCPanel
 * Table of contents from admin-provided metadata.
 * Shows an empty state if no items are available.
 */
export default function FlipbookTOCPanel({
    items = [],
    currentPage = 1,
    onSelectPage,
}) {
    if (!items || items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
                <ListOrdered className="w-8 h-8 text-[#DCE7F3]" />
                <p className="text-sm font-medium text-[#0E2747]/70">
                    Daftar isi belum tersedia
                </p>
                <p className="text-xs text-[#6B7C93]">
                    Daftar isi untuk materi ini belum ditambahkan oleh admin.
                </p>
            </div>
        );
    }

    return (
        <div className="p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7C93] mb-3">
                {items.length} Bab / Bagian
            </p>
            <nav aria-label="Daftar Isi">
                <ul className="space-y-0.5">
                    {items.map((item, idx) => {
                        const isActive = item.page && currentPage >= item.page &&
                            (idx === items.length - 1 || currentPage < items[idx + 1]?.page);
                        const hasChildren = item.children?.length > 0;

                        return (
                            <li key={idx}>
                                <button
                                    type="button"
                                    onClick={() => item.page && onSelectPage?.(item.page)}
                                    disabled={!item.page}
                                    aria-label={`${item.title}${item.page ? `, halaman ${item.page}` : ''}`}
                                    className={[
                                        'w-full text-left flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs transition-all',
                                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE]',
                                        isActive
                                            ? 'bg-[#EAF5FF] text-[#0B63CE] font-semibold'
                                            : 'text-[#112743] hover:bg-slate-50 font-medium',
                                        !item.page ? 'cursor-default opacity-60' : 'cursor-pointer',
                                    ].join(' ')}
                                >
                                    <span className="flex-1 leading-snug">{item.title}</span>
                                    {item.page && (
                                        <span className={`text-[10px] font-mono tabular-nums shrink-0 ${
                                            isActive ? 'text-[#0B63CE]' : 'text-[#6B7C93]'
                                        }`}>
                                            {item.page}
                                        </span>
                                    )}
                                </button>

                                {/* Sub-items (one level deep) */}
                                {hasChildren && (
                                    <ul className="mt-0.5 ml-3 space-y-0.5 border-l border-[#DCE7F3] pl-2">
                                        {item.children.map((child, cidx) => (
                                            <li key={cidx}>
                                                <button
                                                    type="button"
                                                    onClick={() => child.page && onSelectPage?.(child.page)}
                                                    disabled={!child.page}
                                                    className="w-full text-left flex items-center justify-between gap-2 px-2 py-1.5 rounded text-[11px] text-[#6B7C93] hover:text-[#112743] hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0B63CE]"
                                                >
                                                    <span className="flex-1 leading-snug">{child.title}</span>
                                                    {child.page && (
                                                        <span className="text-[10px] font-mono shrink-0">{child.page}</span>
                                                    )}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
}
