import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Search, Filter, X, RotateCcw } from 'lucide-react';
import Button from '../ui/Button';

export default function CollectionFilters({
    filters = {},
    categories = [],
    availableYears = [],
    materialTypes = [],
}) {
    const [search, setSearch] = useState(filters.q || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
    const [selectedType, setSelectedType] = useState(filters.type || '');
    const [selectedYear, setSelectedYear] = useState(filters.year || '');
    const [selectedSort, setSelectedSort] = useState(filters.sort || 'latest');
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    const applyFilters = (custom = {}) => {
        const params = {
            q: search,
            category: selectedCategory,
            type: selectedType,
            year: selectedYear,
            sort: selectedSort,
            ...custom,
        };

        Object.keys(params).forEach((key) => {
            if (!params[key]) delete params[key];
        });

        router.get('/koleksi', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const handleReset = () => {
        setSearch('');
        setSelectedCategory('');
        setSelectedType('');
        setSelectedYear('');
        setSelectedSort('latest');
        router.get('/koleksi', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const hasActiveFilters = Boolean(
        search || selectedCategory || selectedType || selectedYear || (selectedSort && selectedSort !== 'latest')
    );

    return (
        <div className="space-y-4">
            {/* Top Bar: Search & Mobile Filter Toggle */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-lg">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari judul materi, kode modul, penulis, atau kata kunci..."
                        className="w-full bg-white border border-[#DCE7F3] rounded-xl pl-9 pr-20 py-2.5 text-xs text-[#112743] placeholder-[#6B7C93] focus:outline-none focus:border-[#0B63CE] shadow-2xs"
                    />
                    <Search className="w-4 h-4 text-[#6B7C93] absolute left-3 top-3" />
                    <button
                        type="submit"
                        className="absolute right-1.5 top-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#0B63CE] hover:bg-[#0A3F82] transition-colors"
                    >
                        Cari
                    </button>
                </form>

                {/* Mobile Filter Toggle Button */}
                <div className="flex items-center gap-2 sm:hidden">
                    <button
                        type="button"
                        onClick={() => setMobileFilterOpen(true)}
                        className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-[#DCE7F3] bg-white text-xs font-semibold text-[#112743]"
                    >
                        <Filter className="w-3.5 h-3.5 text-[#0B63CE]" />
                        <span>Filter & Urutkan</span>
                    </button>
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="p-2 rounded-xl border border-[#DCE7F3] bg-white text-[#FA5252]"
                            title="Reset Filter"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Desktop Quick Sort */}
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                    <label className="text-xs text-[#6B7C93] font-medium whitespace-nowrap">
                        Urutkan:
                    </label>
                    <select
                        value={selectedSort}
                        onChange={(e) => {
                            setSelectedSort(e.target.value);
                            applyFilters({ sort: e.target.value });
                        }}
                        className="bg-white border border-[#DCE7F3] rounded-xl px-3 py-2 text-xs text-[#112743] font-medium focus:outline-none focus:border-[#0B63CE] shadow-2xs cursor-pointer"
                    >
                        <option value="latest">Terbaru Diterbitkan</option>
                        <option value="oldest">Terlama</option>
                        <option value="title_asc">Judul (A–Z)</option>
                        <option value="title_desc">Judul (Z–A)</option>
                    </select>
                </div>
            </div>

            {/* Desktop Horizontal Filter Strip */}
            <div className="hidden sm:flex items-center gap-3 flex-wrap p-3 bg-white border border-[#DCE7F3] rounded-xl shadow-2xs">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0E2747] flex items-center gap-1.5 mr-1">
                    <Filter className="w-3.5 h-3.5 text-[#0B63CE]" />
                    Filter:
                </span>

                {/* Category Select */}
                <select
                    value={selectedCategory}
                    onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        applyFilters({ category: e.target.value });
                    }}
                    className="bg-[#F8FBFF] border border-[#DCE7F3] rounded-lg px-2.5 py-1.5 text-xs text-[#112743] focus:outline-none focus:border-[#0B63CE]"
                >
                    <option value="">Semua Kategori</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.slug}>
                            {c.name}
                        </option>
                    ))}
                </select>

                {/* Material Type Select */}
                <select
                    value={selectedType}
                    onChange={(e) => {
                        setSelectedType(e.target.value);
                        applyFilters({ type: e.target.value });
                    }}
                    className="bg-[#F8FBFF] border border-[#DCE7F3] rounded-lg px-2.5 py-1.5 text-xs text-[#112743] focus:outline-none focus:border-[#0B63CE]"
                >
                    <option value="">Semua Jenis Materi</option>
                    {materialTypes.map((t) => (
                        <option key={t.value} value={t.value}>
                            {t.label}
                        </option>
                    ))}
                </select>

                {/* Year Select */}
                <select
                    value={selectedYear}
                    onChange={(e) => {
                        setSelectedYear(e.target.value);
                        applyFilters({ year: e.target.value });
                    }}
                    className="bg-[#F8FBFF] border border-[#DCE7F3] rounded-lg px-2.5 py-1.5 text-xs text-[#112743] focus:outline-none focus:border-[#0B63CE]"
                >
                    <option value="">Semua Tahun</option>
                    {availableYears.map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>

                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={handleReset}
                        className="ml-auto text-xs font-semibold text-[#FA5252] hover:text-[#E03131] inline-flex items-center gap-1 transition-colors px-2 py-1"
                    >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Filter</span>
                    </button>
                )}
            </div>

            {/* Mobile Filter Drawer */}
            {mobileFilterOpen && (
                <div className="fixed inset-0 z-50 flex sm:hidden">
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-xs"
                        onClick={() => setMobileFilterOpen(false)}
                    />
                    <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-5 flex flex-col justify-between z-10">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-[#DCE7F3]">
                                <h3 className="text-sm font-bold text-[#0E2747]">
                                    Filter & Urutan Koleksi
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setMobileFilterOpen(false)}
                                    className="p-1 rounded-md text-[#6B7C93]"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div>
                                    <label className="font-semibold text-[#112743] block mb-1">
                                        Urutkan
                                    </label>
                                    <select
                                        value={selectedSort}
                                        onChange={(e) => setSelectedSort(e.target.value)}
                                        className="w-full bg-[#F8FBFF] border border-[#DCE7F3] rounded-lg p-2"
                                    >
                                        <option value="latest">Terbaru</option>
                                        <option value="oldest">Terlama</option>
                                        <option value="title_asc">Judul A-Z</option>
                                        <option value="title_desc">Judul Z-A</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="font-semibold text-[#112743] block mb-1">
                                        Kategori
                                    </label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full bg-[#F8FBFF] border border-[#DCE7F3] rounded-lg p-2"
                                    >
                                        <option value="">Semua Kategori</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.slug}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="font-semibold text-[#112743] block mb-1">
                                        Jenis Materi
                                    </label>
                                    <select
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                        className="w-full bg-[#F8FBFF] border border-[#DCE7F3] rounded-lg p-2"
                                    >
                                        <option value="">Semua Jenis</option>
                                        {materialTypes.map((t) => (
                                            <option key={t.value} value={t.value}>
                                                {t.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="font-semibold text-[#112743] block mb-1">
                                        Tahun Publikasi
                                    </label>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        className="w-full bg-[#F8FBFF] border border-[#DCE7F3] rounded-lg p-2"
                                    >
                                        <option value="">Semua Tahun</option>
                                        {availableYears.map((y) => (
                                            <option key={y} value={y}>
                                                {y}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[#DCE7F3] space-y-2">
                            <Button
                                variant="primary"
                                size="md"
                                className="w-full"
                                onClick={() => {
                                    setMobileFilterOpen(false);
                                    applyFilters();
                                }}
                            >
                                Terapkan Filter
                            </Button>
                            {hasActiveFilters && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => {
                                        setMobileFilterOpen(false);
                                        handleReset();
                                    }}
                                >
                                    Reset Semua
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
