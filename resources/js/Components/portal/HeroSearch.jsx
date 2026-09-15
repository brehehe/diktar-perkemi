import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import QuickFilter from './QuickFilter';

export default function HeroSearch({ initialQuery = '', className = '', align = 'center' }) {
    const [query, setQuery] = useState(initialQuery);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            router.visit(`/koleksi?search=${encodeURIComponent(query.trim())}`);
        } else {
            router.visit('/koleksi');
        }
    };

    const isLeft = align === 'left';

    return (
        <div className={`w-full ${isLeft ? '' : 'max-w-3xl mx-auto'} space-y-4 ${className}`}>
            {/* Search Input Box */}
            <form
                onSubmit={handleSearch}
                className={`w-full ${isLeft ? '' : 'max-w-2xl mx-auto'} relative flex items-center bg-white rounded-xl shadow-md border border-[#DCE7F3] hover:border-[#0B63CE]/50 focus-within:border-[#0B63CE] focus-within:ring-4 focus-within:ring-[#0B63CE]/15 transition-all duration-200`}
            >
                <div className="pl-4 pr-2 text-[#0B63CE] shrink-0">
                    <Search className="w-5 h-5" />
                </div>

                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Cari buku, modul, materi, atau kata kunci…"
                    className="flex-1 bg-transparent border-0 text-[15px] text-[#112743] placeholder-[#6B7C93] focus:outline-none focus:ring-0 py-3.5"
                />

                <div className="pr-2">
                    <button
                        type="submit"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#0B63CE] hover:bg-[#0A3F82] active:scale-[0.98] transition-all duration-150 shrink-0 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#0B63CE] focus:ring-offset-2"
                    >
                        <span>Cari</span>
                    </button>
                </div>
            </form>

            {/* Quick Filters */}
            <div className={`flex ${isLeft ? 'justify-start' : 'justify-center'}`}>
                <QuickFilter align={align} />
            </div>
        </div>
    );
}
