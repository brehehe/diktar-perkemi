import React from 'react';
import { ListOrdered, ChevronRight } from 'lucide-react';

/**
 * FlipbookTOCPanel
 * Table of contents from admin-provided metadata.
 * Shows an empty state if no items are available.
 */
const parsePageNum = (p) => {
    if (typeof p === "number") return p;
    if (!p) return null;
    const match = String(p).match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
};

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
                        const pageNum = parsePageNum(item.page);
                        const nextPageNum = items[idx + 1] ? parsePageNum(items[idx + 1].page) : null;
                        const isActive = pageNum && currentPage >= pageNum &&
                            (idx === items.length - 1 || (nextPageNum && currentPage < nextPageNum));
                        const hasChildren = item.children?.length > 0;

                        return (
                            <li key={idx}>
                                <button
                                    type="button"
                                    onClick={() => pageNum && onSelectPage?.(pageNum)}
                                    disabled={!pageNum}
                                    aria-label={`${item.title}${pageNum ? `, halaman ${pageNum}` : ''}`}
                                    className={[
                                        'w-full text-left flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs transition-all',
                                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE]',
                                        isActive
                                            ? 'bg-[#EAF5FF] text-[#0B63CE] font-semibold'
                                            : 'text-[#112743] hover:bg-slate-50 font-medium',
                                        !pageNum ? 'cursor-default opacity-60' : 'cursor-pointer',
                                    ].join(' ')}
                                >
                                    <span className="flex-1 leading-snug">{item.title}</span>
                                    {pageNum && (
                                        <span className={`text-[10px] font-mono tabular-nums shrink-0 ${
                                            isActive ? 'text-[#0B63CE]' : 'text-[#6B7C93]'
                                        }`}>
                                            {pageNum}
                                        </span>
                                    )}
                                </button>

                                {/* Sub-items (one level deep) */}
                                {hasChildren && (
                                    <ul className="mt-0.5 ml-3 space-y-0.5 border-l border-[#DCE7F3] pl-2">
                                        {item.children.map((child, cidx) => {
                                            const childPageNum = parsePageNum(child.page);
                                            return (
                                            <li key={cidx}>
                                                <button
                                                    type="button"
                                                    onClick={() => childPageNum && onSelectPage?.(childPageNum)}
                                                    disabled={!childPageNum}
                                                    className="w-full text-left flex items-center justify-between gap-2 px-2 py-1.5 rounded text-[11px] text-[#6B7C93] hover:text-[#112743] hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0B63CE]"
                                                >
                                                    <span className="flex-1 leading-snug">{child.title}</span>
                                                    {child.page && (
                                                        <span className="text-[10px] font-mono shrink-0">{child.page}</span>
                                                    )}
                                                </button>
                                            </li>
                                            );
                                        })}
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
