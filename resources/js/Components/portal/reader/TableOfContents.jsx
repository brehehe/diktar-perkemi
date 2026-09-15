import React from 'react';
import { ListOrdered, ChevronRight, Bookmark } from 'lucide-react';

export default function TableOfContents({
    items = [],
    currentPage = 1,
    onSelectPage,
}) {
    const hasItems = Array.isArray(items) && items.length > 0;

    if (!hasItems) {
        return (
            <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <ListOrdered className="w-6 h-6" />
                </div>
                <p className="text-sm text-slate-500 font-medium">
                    Daftar isi belum tersedia untuk materi ini.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                    Gunakan slider atau tombol navigasi di bagian bawah untuk berpindah halaman.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
                Daftar Bab & Materi ({items.length})
            </div>

            <nav className="space-y-1" aria-label="Daftar Isi Buku">
                {items.map((item, idx) => {
                    const pageNum = Number(item.page || item.page_number || 1);
                    const isActive = currentPage === pageNum;

                    return (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => onSelectPage?.(pageNum)}
                            className={`w-full group text-left flex items-center justify-between p-3 rounded-xl transition-all ${
                                isActive
                                    ? 'bg-[#EAF5FF] text-[#0B63CE] font-semibold shadow-xs'
                                    : 'hover:bg-slate-50 text-slate-700 font-medium'
                            }`}
                        >
                            <div className="flex items-start gap-2.5 min-w-0 pr-2">
                                <span className={`text-xs font-mono mt-0.5 shrink-0 ${isActive ? 'text-[#0B63CE]' : 'text-slate-400'}`}>
                                    {String(idx + 1).padStart(2, '0')}
                                </span>
                                <span className="text-xs leading-relaxed line-clamp-2">
                                    {item.title}
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                                <span className={`text-[11px] px-2 py-0.5 rounded-md font-mono ${
                                    isActive
                                        ? 'bg-[#0B63CE] text-white'
                                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                                }`}>
                                    Hal. {pageNum}
                                </span>
                                <ChevronRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${
                                    isActive ? 'text-[#0B63CE]' : 'text-slate-300'
                                }`} />
                            </div>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
