import { Head, Link } from '@inertiajs/react';
import PortalLayout from '../../../Layouts/PortalLayout';
import { Tag, ArrowRight, BookOpen, Layers } from 'lucide-react';

export default function CategoriesIndex({
    categories = [],
    total_categories = 0,
    total_materials = 0,
}) {
    return (
        <PortalLayout title="Kategori Materi">
            <Head title="Katalog Kategori Materi — Pustaka Penataran PERKEMI" />

            {/* Header Banner */}
            <div className="bg-[#0E2747] text-white border-b-2 border-[#0B63CE] py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-3xl space-y-3">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-white border border-white/15 text-xs font-semibold">
                            <Tag className="w-3.5 h-3.5 text-[#62B0FF]" />
                            <span>Klasifikasi Kurikulum PERKEMI</span>
                        </div>
                        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                            Kategori Modul & Pembelajaran
                        </h1>
                        <p className="text-sm sm:text-base text-[#EAF5FF]/80 leading-relaxed max-w-2xl">
                            Seluruh buku pedoman, modul penataran, bahan ajar, dan instrumen pengujian PERKEMI
                            dikelompokkan ke dalam kategori bidang resmi untuk mempermudah pencarian dan penelusuran.
                        </p>
                    </div>

                    {/* Quick Stats Pill */}
                    <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-white/70">
                        <div>
                            <span className="font-serif font-bold text-white text-lg mr-1.5">
                                {total_categories}
                            </span>
                            <span>Kategori Aktif</span>
                        </div>
                        <span className="text-white/20">•</span>
                        <div>
                            <span className="font-serif font-bold text-white text-lg mr-1.5">
                                {total_materials}
                            </span>
                            <span>Materi Terbit</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((cat) => {
                        const accentColor = cat.color || '#0B63CE';
                        return (
                            <div
                                key={cat.id || cat.slug}
                                className="bg-white rounded-xl border border-[#DCE7F3] hover:border-[#0B63CE]/50 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group"
                                style={{ borderTop: `4px solid ${accentColor}` }}
                            >
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span
                                            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
                                            style={{
                                                backgroundColor: `${accentColor}15`,
                                                color: accentColor,
                                            }}
                                        >
                                            <Layers className="w-5 h-5" />
                                        </span>

                                        <span
                                            className="font-mono text-xs font-bold px-2.5 py-1 rounded-full border"
                                            style={{
                                                backgroundColor: `${accentColor}10`,
                                                borderColor: `${accentColor}30`,
                                                color: accentColor,
                                            }}
                                        >
                                            {cat.published_count || 0} Materi
                                        </span>
                                    </div>

                                    <div>
                                        <h2 className="font-serif text-xl font-bold text-[#0E2747] group-hover:text-[#0B63CE] transition-colors leading-snug">
                                            <Link href={`/kategori/${cat.slug}`}>
                                                {cat.name}
                                            </Link>
                                        </h2>
                                        <p className="text-xs text-[#6B7C93] mt-2 leading-relaxed line-clamp-3">
                                            {cat.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="px-6 py-3.5 bg-[#F8FBFF] border-t border-[#DCE7F3] flex items-center justify-between">
                                    <span className="text-xs text-[#6B7C93] font-medium flex items-center space-x-1.5">
                                        <BookOpen className="w-3.5 h-3.5 text-[#0B63CE]" />
                                        <span>Dokumen Resmi</span>
                                    </span>

                                    <Link
                                        href={`/kategori/${cat.slug}`}
                                        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#0B63CE] hover:text-[#0A3F82] transition-colors"
                                    >
                                        <span>Lihat Materi</span>
                                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </PortalLayout>
    );
}
