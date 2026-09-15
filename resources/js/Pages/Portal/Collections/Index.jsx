import React from 'react';
import { Link, router } from '@inertiajs/react';
import PortalLayout from '../../../Layouts/PortalLayout';
import CollectionFilters from '../../../Components/portal/CollectionFilters';
import CollectionGrid from '../../../Components/portal/CollectionGrid';
import PortalPagination from '../../../Components/portal/PortalPagination';
import EmptyState from '../../../Components/portal/EmptyState';
import { ChevronRight, Home, SlidersHorizontal } from 'lucide-react';

export default function Index({
    materials,
    categories = [],
    available_years = [],
    material_types = [],
    filters = {},
}) {
    const hasActiveFilters = Boolean(
        filters.q || filters.search || filters.category || filters.type || filters.year || (filters.sort && filters.sort !== 'latest')
    );

    const handleReset = () => {
        router.visit('/koleksi');
    };

    return (
        <PortalLayout title="Katalog Koleksi Digital">
            {/* Page Header */}
            <div className="bg-white border-b border-[#DCE7F3]">
                {/* Top accent bar */}
                <div className="h-1 bg-gradient-to-r from-[#0B63CE] via-[#20A47A] to-[#7957D5]" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-1.5 text-xs text-[#6B7C93]" aria-label="Breadcrumb">
                        <Link href="/" className="hover:text-[#0B63CE] transition-colors flex items-center gap-1 font-medium">
                            <Home className="w-3.5 h-3.5" />
                            <span>Beranda</span>
                        </Link>
                        <ChevronRight className="w-3 h-3 text-[#DCE7F3]" />
                        <span className="font-semibold text-[#112743]">Koleksi Digital</span>
                    </nav>

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0E2747] tracking-tight leading-tight">
                                Koleksi Buku & Modul Digital
                            </h1>
                            <p className="text-sm text-[#4A6482] mt-2 max-w-xl leading-relaxed">
                                Seluruh dokumen materi penataran resmi, buku pedoman teknis, dan bahan ajar pemateri yang diterbitkan oleh PB PERKEMI.
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                            <div className="text-right">
                                <span className="text-[11px] text-[#6B7C93] block font-medium">Total tersedia</span>
                                <strong className="text-2xl font-serif font-bold text-[#0B63CE]">
                                    {materials.total || 0}
                                </strong>
                                <span className="text-xs text-[#6B7C93] ml-1">dokumen</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter & Catalog Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Active filter indicator */}
                {hasActiveFilters && (
                    <div className="flex items-center justify-between text-xs text-[#0B63CE] bg-[#EAF5FF] border border-[#0B63CE]/20 rounded-lg px-3.5 py-2.5">
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className="w-4 h-4 shrink-0" />
                            <span>Filter aktif — menampilkan <strong>{materials.total || 0}</strong> dokumen terbit</span>
                        </div>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="font-semibold underline hover:text-[#0A3F82] transition-colors"
                        >
                            Reset Filter
                        </button>
                    </div>
                )}

                {/* Filters */}
                <CollectionFilters
                    filters={filters}
                    categories={categories}
                    availableYears={available_years}
                    materialTypes={material_types}
                />

                {/* Materials Grid or Empty State */}
                {materials.data && materials.data.length > 0 ? (
                    <div className="space-y-8">
                        <CollectionGrid materials={materials.data} />

                        {/* Pagination */}
                        <PortalPagination links={materials.links} />
                    </div>
                ) : (
                    <div className="py-8">
                        <EmptyState
                            title="Materi Belum Ditemukan"
                            description="Materi belum ditemukan. Coba ubah kata kunci atau filter pencarian Anda."
                            onReset={hasActiveFilters ? handleReset : null}
                        />
                    </div>
                )}
            </div>
        </PortalLayout>
    );
}
