import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import PortalLayout from '../../../Layouts/PortalLayout';
import EmptyState from '../../../Components/portal/EmptyState';
import {
    Shield,
    Tag,
    ArrowRight,
    BookOpen,
    ShieldCheck,
    Award,
    FileCheck,
    Scale,
    Video,
    Layers,
    Search,
    X,
    Home,
    ChevronRight,
    BookMarked,
    CheckCircle2,
} from 'lucide-react';

/**
 * Resolver for category icons matching PERKEMI domains.
 */
function getCategoryIcon(iconName, slug = '') {
    switch (iconName) {
        case 'Award':
            return Award;
        case 'FileCheck':
            return FileCheck;
        case 'BookOpen':
            return BookOpen;
        case 'ShieldCheck':
            return ShieldCheck;
        case 'Scale':
            return Scale;
        case 'Video':
            return Video;
        default:
            break;
    }

    const s = slug.toLowerCase();
    if (s.includes('latih')) return Award;
    if (s.includes('uji')) return FileCheck;
    if (s.includes('modul') || s.includes('tatar')) return BookOpen;
    if (s.includes('regulasi') || s.includes('pedoman')) return ShieldCheck;
    if (s.includes('wasit')) return Scale;
    if (s.includes('video')) return Video;

    return Layers;
}

/**
 * Resolver for category context, content scope, and format tag.
 */
function getCategoryMeta(slug = '', index = 0, sortOrder = null) {
    const s = slug.toLowerCase();

    // Generate canonical taxonomy code KAT-01 .. KAT-06
    const codeNum = sortOrder ? Math.round(sortOrder / 10) : index + 1;
    const code = `KAT-${String(codeNum).padStart(2, '0')}`;

    if (s.includes('video')) {
        return {
            scope: 'Demonstrasi Teknik & Rekaman Sesi',
            typeLabel: 'Video & Audio Visual',
            typeIcon: Video,
            code,
        };
    }
    if (s.includes('wasit')) {
        return {
            scope: 'Regulasi Pertandingan & Kode Etik Wasit',
            typeLabel: 'Standar & Sinyal Wasit',
            typeIcon: Scale,
            code,
        };
    }
    if (s.includes('uji')) {
        return {
            scope: 'Kisi-kisi & Rubrik Kenaikan Tingkat',
            typeLabel: 'Instrumen Ujian Kenshi',
            typeIcon: FileCheck,
            code,
        };
    }
    if (s.includes('latih')) {
        return {
            scope: 'Metodologi Latihan & Pedagogi Fisik',
            typeLabel: 'Panduan Kepelatihan',
            typeIcon: Award,
            code,
        };
    }
    if (s.includes('regulasi') || s.includes('pedoman')) {
        return {
            scope: 'AD/ART, Peraturan & Keputusan Resmi',
            typeLabel: 'Pedoman & Regulasi Organisasi',
            typeIcon: ShieldCheck,
            code,
        };
    }
    if (s.includes('modul') || s.includes('tatar')) {
        return {
            scope: 'Kurikulum & Silabus Penataran Nasional',
            typeLabel: 'Modul Kurikulum Penataran',
            typeIcon: BookOpen,
            code,
        };
    }

    return {
        scope: 'Arsip Dokumen Kurikulum Resmi',
        typeLabel: 'Dokumen Resmi',
        typeIcon: BookOpen,
        code,
    };
}

export default function CategoriesIndex({
    categories = [],
    total_categories = 0,
    total_materials = 0,
}) {
    const [searchQuery, setSearchQuery] = useState('');

    // Instant client-side search across category title and description
    const filteredCategories = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return categories;
        return categories.filter((cat) => {
            const name = (cat.name || '').toLowerCase();
            const desc = (cat.description || '').toLowerCase();
            return name.includes(q) || desc.includes(q);
        });
    }, [categories, searchQuery]);

    return (
        <PortalLayout title="Kategori Materi">
            <Head>
                <title>Katalog Kategori Materi — Pustaka Penataran PERKEMI</title>
                <meta
                    name="description"
                    content="Seluruh buku pedoman, modul penataran, bahan ajar, dan instrumen pengujian resmi Pengurus Besar Persaudaraan Shorinji Kempo Indonesia (PB PERKEMI)."
                />
            </Head>

            {/* Header Banner - Modern Institutional Editorial */}
            <header className="bg-[#0E2747] text-white border-b-2 border-[#0B63CE] py-12 lg:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Subtle Geometric Texture Overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(#FFFFFF 1px, transparent 1px)`,
                        backgroundSize: '24px 24px',
                    }}
                    aria-hidden="true"
                />

                <div className="max-w-7xl mx-auto relative z-10">
                    {/* Breadcrumb Navigation */}
                    <nav
                        aria-label="Breadcrumb"
                        className="flex items-center gap-2 text-xs text-[#EAF5FF]/70 mb-5"
                    >
                        <Link
                            href="/"
                            className="hover:text-white transition-colors flex items-center gap-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#62B0FF] rounded-xs"
                        >
                            <Home className="w-3.5 h-3.5" />
                            <span>Beranda</span>
                        </Link>
                        <ChevronRight className="w-3 h-3 text-white/30" />
                        <span className="text-white font-medium" aria-current="page">
                            Kategori
                        </span>
                    </nav>

                    <div className="max-w-3xl space-y-3.5">
                        {/* Institutional Badge */}
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-white border border-white/15 text-xs font-semibold">
                            <Tag className="w-3.5 h-3.5 text-[#62B0FF]" />
                            <span>Klasifikasi Kurikulum & Dokumen PERKEMI</span>
                        </div>

                        {/* Title Display */}
                        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15] text-balance">
                            Kategori Modul & Pembelajaran
                        </h1>

                        {/* Subtitle */}
                        <p className="text-sm sm:text-base text-[#EAF5FF]/85 leading-relaxed max-w-2xl">
                            Seluruh buku pedoman, modul penataran, bahan ajar, dan instrumen pengujian PERKEMI
                            dikelompokkan ke dalam kategori bidang resmi untuk mempermudah penelusuran kurikulum dan sertifikasi kenshi.
                        </p>
                    </div>

                    {/* Quick Stats & Institutional Trust Bar */}
                    <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 sm:gap-8 text-xs text-white/75">
                        <div className="flex items-baseline gap-2">
                            <span className="font-serif font-bold text-white text-xl sm:text-2xl">
                                {total_categories}
                            </span>
                            <span>Kategori Kurikulum</span>
                        </div>
                        <span className="text-white/20 hidden sm:inline">•</span>
                        <div className="flex items-baseline gap-2">
                            <span className="font-serif font-bold text-white text-xl sm:text-2xl">
                                {total_materials}
                            </span>
                            <span>Materi & Dokumen Terbit</span>
                        </div>
                        <span className="text-white/20 hidden sm:inline">•</span>
                        <div className="flex items-center gap-1.5 text-white/80">
                            <CheckCircle2 className="w-4 h-4 text-[#20A47A]" />
                            <span>Standar Resmi PB PERKEMI</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
                {/* Instant Filter Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#DCE7F3]">
                    <div className="relative max-w-md w-full">
                        <label htmlFor="category-instant-search" className="sr-only">
                            Cari Kategori Materi
                        </label>
                        <div className="relative">
                            <Search className="w-4 h-4 text-[#6B7C93] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                id="category-instant-search"
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari kategori materi atau topik... (mis. Wasit, Pelatih, Video)"
                                className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm bg-white border border-[#DCE7F3] rounded-lg text-[#112743] placeholder-[#6B7C93]/70 focus:outline-none focus:border-[#0B63CE] focus:ring-2 focus:ring-[#0B63CE]/20 transition-all shadow-2xs"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#6B7C93] hover:text-[#112743] rounded-md transition-colors"
                                    aria-label="Bersihkan pencarian"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#6B7C93] shrink-0">
                        <span className="font-mono">
                            Menampilkan{' '}
                            <strong className="text-[#0E2747] font-semibold">
                                {filteredCategories.length}
                            </strong>{' '}
                            dari {categories.length} kategori
                        </span>
                    </div>
                </div>

                {/* Empty State when no results match search query */}
                {filteredCategories.length === 0 ? (
                    <div className="py-12">
                        <EmptyState
                            title="Kategori Tidak Ditemukan"
                            description={`Tidak ada kategori materi yang sesuai dengan kata kunci "${searchQuery}". Silakan gunakan kata kunci lain atau lihat seluruh koleksi.`}
                            onReset={() => setSearchQuery('')}
                        />
                    </div>
                ) : (
                    /* Category Cards Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCategories.map((cat, index) => {
                            const accentColor = cat.color || '#0B63CE';
                            const IconComponent = getCategoryIcon(cat.icon, cat.slug);
                            const meta = getCategoryMeta(cat.slug, index, cat.sort_order);
                            const TypeIcon = meta.typeIcon;

                            return (
                                <Link
                                    key={cat.id || cat.slug}
                                    href={`/kategori/${cat.slug}`}
                                    className="group bg-white rounded-xl border border-[#DCE7F3] hover:border-[#0B63CE]/50 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE] focus-visible:ring-offset-2 relative"
                                >
                                    {/* Top Inset Accent Line */}
                                    <div
                                        className="h-1 w-full shrink-0 transition-all duration-200 group-hover:h-1.5"
                                        style={{ backgroundColor: accentColor }}
                                    />

                                    <div className="p-6 space-y-4">
                                        {/* Card Top: Icon Badge & Taxonomy Code + Count */}
                                        <div className="flex items-center justify-between">
                                            <div
                                                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105"
                                                style={{
                                                    backgroundColor: `${accentColor}12`,
                                                    borderColor: `${accentColor}25`,
                                                    color: accentColor,
                                                }}
                                            >
                                                <IconComponent className="w-5 h-5" />
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-[11px] font-semibold text-[#6B7C93] tracking-wider uppercase">
                                                    {meta.code}
                                                </span>
                                                <span
                                                    className="font-mono text-xs font-bold px-2.5 py-1 rounded-full border"
                                                    style={{
                                                        backgroundColor: `${accentColor}0e`,
                                                        borderColor: `${accentColor}30`,
                                                        color: accentColor,
                                                    }}
                                                >
                                                    {cat.published_count || 0} Materi
                                                </span>
                                            </div>
                                        </div>

                                        {/* Category Title & Description */}
                                        <div className="space-y-2">
                                            <h2 className="font-serif text-xl font-bold text-[#0E2747] group-hover:text-[#0B63CE] transition-colors leading-snug">
                                                {cat.name}
                                            </h2>

                                            <p className="text-xs text-[#4A6482] leading-relaxed line-clamp-3 min-h-[3.25rem]">
                                                {cat.description}
                                            </p>
                                        </div>

                                        {/* Scope Focus Indicator */}
                                        <div className="pt-2">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F8FBFF] border border-[#DCE7F3] text-[11px] text-[#6B7C93]">
                                                <span
                                                    className="w-1.5 h-1.5 rounded-full shrink-0"
                                                    style={{ backgroundColor: accentColor }}
                                                />
                                                <span className="truncate">{meta.scope}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Footer: Content Type & Action */}
                                    <div className="px-6 py-3.5 bg-[#F8FBFF] border-t border-[#DCE7F3] flex items-center justify-between text-xs transition-colors group-hover:bg-[#F0F7FF]">
                                        <span className="font-medium text-[#4A6482] flex items-center space-x-1.5">
                                            <TypeIcon
                                                className="w-3.5 h-3.5 shrink-0"
                                                style={{ color: accentColor }}
                                            />
                                            <span>{meta.typeLabel}</span>
                                        </span>

                                        <span className="inline-flex items-center space-x-1.5 font-semibold text-[#0B63CE] group-hover:text-[#0A3F82] transition-colors">
                                            <span>Lihat Materi</span>
                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Secondary Cross-link Strip - Atelier Zero Institutional Callout */}
                <aside
                    aria-label="Penelusuran Materi Lanjutan"
                    className="mt-14 p-6 sm:p-8 rounded-xl bg-gradient-to-r from-[#EAF5FF]/80 via-white to-[#F8FBFF] border border-[#DCE7F3] flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                    <div className="space-y-1.5 max-w-2xl">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#0B63CE]">
                            <BookMarked className="w-4 h-4" />
                            <span>Penelusuran Tambahan</span>
                        </div>
                        <h3 className="font-serif text-lg sm:text-xl font-bold text-[#0E2747]">
                            Mencari modul berdasarkan jenjang peran atau seluruh katalog?
                        </h3>
                        <p className="text-xs sm:text-sm text-[#4A6482] leading-relaxed">
                            Anda dapat melihat rekomendasi materi kurikulum yang disesuaikan untuk peran kenshi (Peserta, Pelatih, Penguji, Wasit) atau membuka seluruh katalog buku digital nasional.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <Link
                            href="/untuk"
                            className="px-4 py-2.5 rounded-lg bg-white hover:bg-[#F8FBFF] text-[#0B63CE] border border-[#BCE0FD] text-xs font-semibold shadow-2xs hover:border-[#0B63CE] transition-all inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#0B63CE]"
                        >
                            <span>Katalog Peran Kenshi</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                            href="/koleksi"
                            className="px-4 py-2.5 rounded-lg bg-[#0B63CE] hover:bg-[#0A3F82] text-white text-xs font-semibold shadow-xs transition-all inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#0B63CE] focus:ring-offset-1"
                        >
                            <span>Buka Semua Koleksi</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </aside>
            </main>
        </PortalLayout>
    );
}
