import React, { useId } from 'react';
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
    searchLabel = 'Cari data',
    showSearch = true,
}) {
    const searchId = useId();

    return (
        <div className={`p-4 bg-white border-b border-[#DCE7F3] flex flex-col md:flex-row md:items-center justify-between gap-3 ${className}`}>
            {showSearch && <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (onSearchSubmit) onSearchSubmit();
                }}
                className="relative flex-1 max-w-md"
                role="search"
            >
                <label htmlFor={searchId} className="sr-only">{searchLabel}</label>
                <Search className="w-4 h-4 text-[#6B7C93] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                    type="text"
                    id={searchId}
                    value={search ?? ''}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="min-h-10 w-full pl-9 pr-9 py-2 text-xs bg-[#F8FBFF] border border-[#DCE7F3] rounded-lg text-[#112743] placeholder-[#6B7C93]/60 focus:bg-white focus:outline-none focus:border-[#0B63CE] focus:ring-2 focus:ring-[#0B63CE]/20 transition-colors motion-reduce:transition-none"
                />
                {search && (
                    <button
                        type="button"
                        onClick={() => {
                            onSearchChange('');
                            if (onSearchSubmit) setTimeout(onSearchSubmit, 10);
                        }}
                        className="absolute right-1 top-1/2 flex min-h-9 min-w-9 -translate-y-1/2 items-center justify-center rounded text-[#6B7C93] hover:bg-[#EAF5FF] hover:text-[#112743] focus-visible:outline-2 focus-visible:outline-[#0B63CE]"
                        aria-label="Bersihkan pencarian"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </form>}

            <div className="flex w-full flex-wrap items-center gap-2.5 md:w-auto md:justify-end">
                {children}

                {hasActiveFilters && onReset && (
                    <button
                        type="button"
                        onClick={onReset}
                        className="inline-flex min-h-10 items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#6B7C93] hover:text-[#DD4D7C] hover:bg-[#FDE8EF]/40 rounded-lg border border-dashed border-[#DCE7F3] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] motion-reduce:transition-none"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset</span>
                    </button>
                )}
            </div>
        </div>
    );
}
