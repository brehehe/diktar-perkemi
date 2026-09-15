import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';

export default function TableToolbar({
    search,
    onSearchChange,
    onSearchSubmit,
    searchPlaceholder = 'Cari berdasarkan kata kunci...',
    onReset,
    hasActiveFilters = false,
    children,
    className = '',
}) {
    return (
        <div className={`p-4 bg-white border-b border-[#DCE7F3] flex flex-col md:flex-row md:items-center justify-between gap-3 ${className}`}>
            {/* Search Box */}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (onSearchSubmit) onSearchSubmit();
                }}
                className="relative flex-1 max-w-md"
            >
                <Search className="w-4 h-4 text-[#6B7C93] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                    type="text"
                    value={search ?? ''}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full pl-9 pr-8 py-2 text-xs bg-[#F8FBFF] border border-[#DCE7F3] rounded-lg text-[#112743] placeholder-[#6B7C93]/60 focus:bg-white focus:outline-none focus:border-[#0B63CE] focus:ring-2 focus:ring-[#0B63CE]/20 transition-all"
                />
                {search && (
                    <button
                        type="button"
                        onClick={() => {
                            onSearchChange('');
                            if (onSearchSubmit) setTimeout(onSearchSubmit, 10);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7C93] hover:text-[#112743] p-0.5 rounded"
                        aria-label="Bersihkan pencarian"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </form>

            {/* Filter controls & Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
                {children}

                {hasActiveFilters && onReset && (
                    <button
                        type="button"
                        onClick={onReset}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#6B7C93] hover:text-[#FA5252] hover:bg-[#FDE8EF]/40 rounded-lg border border-dashed border-[#DCE7F3] transition-colors"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset</span>
                    </button>
                )}
            </div>
        </div>
    );
}
