import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import PortalLayout from '../../../Layouts/PortalLayout';
import CollectionGrid from '../../../Components/portal/CollectionGrid';
import PortalPagination from '../../../Components/portal/PortalPagination';
import EmptyState from '../../../Components/portal/EmptyState';
import {
    Layers,
    ChevronRight,
    Home,
    Search,
    SlidersHorizontal,
    ArrowRight,
    BookOpen,
} from 'lucide-react';

export default function Show({
    category,
    materials,
    other_categories = [],
    filters = { q: '', sort: 'latest' },
}) {
    const [searchQuery, setSearchQuery] = useState(filters.q || '');
    const [sortOption, setSortOption] = useState(filters.sort || 'latest');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            `/kategori/${category.slug}`,
            {
                q: searchQuery || undefined,
                sort: sortOption !== 'latest' ? sortOption : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleSortChange = (newSort) => {
        setSortOption(newSort);
        router.get(
            `/kategori/${category.slug}`,
            {
                q: searchQuery || undefined,
                sort: newSort !== 'latest' ? newSort : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setSortOption('latest');
        router.get(`/kategori/${category.slug}`, {}, { preserveState: true, preserveScroll: true });
    };

    const hasActiveFilters = Boolean(filters.q) || (filters.sort && filters.sort !== 'latest');

    return (
        <PortalLayout title={`Kategori: ${category.name}`}>
            {/* Header Strip with Institutional Breadcrumb */}
            <div className="bg-white border-b border-[#DCE7F3] py-8 sm:py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
                    <nav className="flex items-center gap-2 text-xs text-[#6B7C93]" aria-label="Breadcrumb">
                        <Link href="/" className="hover:text-[#0B63CE] transition-colors flex items-center gap-1">
                            <Home className="w-3.5 h-3.5" />
                            <span>Beranda</span>
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-[#DCE7F3]" />
                        <Link href="/kategori" className="hover:text-[#0B63CE] transition-colors">
                            Kategori
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-[#DCE7F3]" />
                        <span className="font-semibold text-[#112743]">{category.name}</span>
                    </nav>

                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        <div className="space-y-2 max-w-3xl">
                            <div className="flex items-center gap-2">
                                <span
                                    className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-2xs"
                                    style={{ backgroundColor: category.color || '#0B63CE' }}
                                />
                                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B63CE]">
                                    Bidang Keilmuan PERKEMI
                                </span>
                            </div>
                            <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-[#0E2747] tracking-tight">
                                {category.name}
                            </h1>
                            {category.description && (
                                <p className="text-xs sm:text-sm text-[#4A6482] leading-relaxed pt-1">
                                    {category.description}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <div className="bg-[#EAF5FF] border border-[#BCE0FD] px-4 py-2 rounded-lg text-xs text-[#0A3F82]">
                                Total Terbit: <strong className="font-bold text-[#0B63CE] text-sm ml-1">{materials.total ?? 0}</strong> dokumen
                            </div>
                            <Link
                                href="/koleksi"
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#6B7C93] hover:text-[#0B63CE] hover:bg-slate-50 transition-colors"
                            >
                                <span>Semua Koleksi</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Catalog Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
                {/* Search & Sort Controls */}
                <div className="bg-white border border-[#DCE7F3] rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                    <form onSubmit={handleSearch} className="w-full sm:max-w-md relative flex items-center">
                        <Search className="w-4 h-4 absolute left-3.5 text-[#6B7C93] pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={`Cari dalam kategori ${category.name}...`}
                            className="w-full pl-9 pr-20 py-2 text-xs sm:text-sm rounded-lg border border-[#DCE7F3] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE] outline-none text-[#112743] placeholder-[#8EA3BA] bg-white transition-all"
                        />
                        <button
                            type="submit"
                            className="absolute right-1.5 px-2.5 py-1 text-xs font-semibold text-white bg-[#0B63CE] hover:bg-[#0A3F82] rounded-md transition-colors"
                        >
                            Cari
                        </button>
                    </form>

                    <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3 text-xs">
                        <div className="flex items-center gap-2 text-[#6B7C93] shrink-0">
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            <span className="font-medium hidden sm:inline">Urutkan:</span>
                        </div>
                        <select
                            value={sortOption}
                            onChange={(e) => handleSortChange(e.target.value)}
                            aria-label="Urutkan dokumen"
                            className="text-xs rounded-lg border border-[#DCE7F3] py-2 px-3 text-[#112743] bg-white focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE] outline-none cursor-pointer"
                        >
                            <option value="latest">Terbaru Terbit</option>
                            <option value="oldest">Terbit Terlama</option>
                            <option value="title_asc">Judul (A - Z)</option>
                            <option value="title_desc">Judul (Z - A)</option>
                        </select>
                    </div>
                </div>

                {/* Materials Grid or Empty State */}
                {materials.data && materials.data.length > 0 ? (
                    <div className="space-y-8">
                        <CollectionGrid
                            materials={materials.data}
                            columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                        />

                        {materials.links && (
                            <div className="pt-4 flex justify-center">
                                <PortalPagination pagination={materials} />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-[#DCE7F3] p-10">
                        <EmptyState
                            title="Materi Belum Ditemukan"
                            description="Materi belum ditemukan. Coba ubah kata kunci atau filter pencarian Anda."
                            onReset={hasActiveFilters ? handleResetFilters : null}
                        />
                    </div>
                )}

                {/* Other Categories Strip */}
                {other_categories && other_categories.length > 0 && (
                    <div className="pt-8 border-t border-[#DCE7F3] space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7C93] flex items-center gap-2">
                                <Layers className="w-3.5 h-3.5 text-[#0B63CE]" />
                                <span>Kategori Bidang Lainnya</span>
                            </h3>
                            <Link
                                href="/kategori"
                                className="text-xs font-semibold text-[#0B63CE] hover:text-[#0A3F82] flex items-center gap-1"
                            >
                                <span>Lihat Semua</span>
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            {other_categories.map((oc) => (
                                <Link
                                    key={oc.id}
                                    href={`/kategori/${oc.slug}`}
                                    className="px-3.5 py-2 rounded-lg bg-white border border-[#DCE7F3] hover:border-[#0B63CE] hover:bg-[#EAF5FF] text-xs font-semibold text-[#112743] hover:text-[#0B63CE] transition-all flex items-center gap-2 shadow-2xs"
                                >
                                    <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: oc.color || '#0B63CE' }}
                                    />
                                    <span>{oc.name}</span>
                                    <span className="text-[10px] text-[#6B7C93] font-mono">({oc.published_count})</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </PortalLayout>
    );
}
