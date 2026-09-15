import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import PortalLayout from '../../../Layouts/PortalLayout';
import CollectionGrid from '../../../Components/portal/CollectionGrid';
import PortalPagination from '../../../Components/portal/PortalPagination';
import EmptyState from '../../../Components/portal/EmptyState';
import {
    Users,
    ChevronRight,
    Home,
    Compass,
    ArrowRight,
    Search,
    SlidersHorizontal,
    CheckCircle2,
    BookMarked,
    Sparkles,
} from 'lucide-react';

export default function Show({
    role_name,
    role_slug,
    description,
    learning_needs,
    color = '#0B63CE',
    materials,
    all_roles = [],
    filters = { q: '', sort: 'latest' },
}) {
    const [searchQuery, setSearchQuery] = useState(filters.q || '');
    const [sortOption, setSortOption] = useState(filters.sort || 'latest');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            `/untuk/${role_slug}`,
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
            `/untuk/${role_slug}`,
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
        router.get(`/untuk/${role_slug}`, {}, { preserveState: true, preserveScroll: true });
    };

    const hasActiveFilters = Boolean(filters.q) || (filters.sort && filters.sort !== 'latest');

    // Role-specific learning path steps tailored for PERKEMI standard
    const learningTracks = {
        peserta: [
            { step: '1', title: 'Fondasi & Etika', desc: 'Pemahaman janji kenshi, etika dojo, dan sejarah dasar Shorinji Kempo.' },
            { step: '2', title: 'Teknik Dasar & Goho', desc: 'Kuis teknik pukulan, tendangan, tangkisan, dan kuda-kuda baku.' },
            { step: '3', title: 'Juho & Embu Dasar', desc: 'Penguasaan kuncian, lemparan, dan sinkronisasi gerakan berpasangan.' },
        ],
        pelatih: [
            { step: '1', title: 'Metodologi Pelatihan', desc: 'Pedoman pengajaran teknik bertingkat dan psikologi pembinaan kenshi.' },
            { step: '2', title: 'Standardisasi Kurikulum', desc: 'Keseragaman kurikulum silabus Kyu Kenshi hingga Yudansha.' },
            { step: '3', title: 'Keselamatan & Fisiologi', desc: 'Pencegahan cedera latihan dan periodisasi program penataran dojo.' },
        ],
        penguji: [
            { step: '1', title: 'Standar Penilaian Mutu', desc: 'Kriteria pengujian kenaikan tingkat kenshi sesuai ketetapan PB PERKEMI.' },
            { step: '2', title: 'Instrumen Ujian Teknis', desc: 'Formulir evaluasi goho, juho, embu, dan ujian tertulis/filsafat.' },
            { step: '3', title: 'Integritas & Sertifikasi', desc: 'Kode etik dewan penguji dan validasi sertifikasi nasional.' },
        ],
        wasit: [
            { step: '1', title: 'Regulasi Pertandingan', desc: 'Aturan resmi WSKO dan amandemen kompetisi nasional PERKEMI.' },
            { step: '2', title: 'Sinyal & Keputusan Wasit', desc: 'Artikulasi isyarat tangan, aba-aba pertandingan, dan penilaian waza.' },
            { step: '3', title: 'Simulasi Kasus & Etika', desc: 'Resolusi sengketa pertandingan dan manajemen tatami yang netral.' },
        ],
        pemateri: [
            { step: '1', title: 'Bahan Tayang Baku', desc: 'Slide presentasi terstandardisasi dan pedoman instruktur nasional.' },
            { step: '2', title: 'Pendalaman Doktrin', desc: 'Referensi filosofi Kongo Zen dan aplikasi dalam kehidupan sehari-hari.' },
            { step: '3', title: 'Evaluasi & Umpan Balik', desc: 'Metode evaluasi hasil pemaparan dan serap materi peserta penataran.' },
        ],
        penyelenggara: [
            { step: '1', title: 'Administrasi Kegiatan', desc: 'Prosedur pengajuan penataran, pendataan peserta, dan legalitas izin.' },
            { step: '2', title: 'Manajemen Sarana Tatami', desc: 'Standardisasi arena pertandingan, dojo penataran, dan akomodasi.' },
            { step: '3', title: 'Pelaporan & Sertifikat', desc: 'Penerbitan nomor registrasi kelulusan dan pelaporan resmi ke PB PERKEMI.' },
        ],
    };

    const currentTrack = learningTracks[role_slug] || [
        { step: '1', title: 'Orientasi Modul', desc: 'Pahami pedoman dan materi dasar kurikulum.' },
        { step: '2', title: 'Praktik Teknis', desc: 'Penerapan modul di dojo atau sesi penataran langsung.' },
        { step: '3', title: 'Evaluasi Kompetensi', desc: 'Penyelesaian instrumen uji untuk verifikasi kompetensi.' },
    ];

    return (
        <PortalLayout title={`Untuk Peran: ${role_name}`}>
            {/* Header Strip */}
            <div className="bg-white border-b border-[#DCE7F3] py-8 sm:py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
                    <nav className="flex items-center gap-2 text-xs text-[#6B7C93]" aria-label="Breadcrumb">
                        <Link href="/" className="hover:text-[#0B63CE] transition-colors flex items-center gap-1">
                            <Home className="w-3.5 h-3.5" />
                            <span>Beranda</span>
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-[#DCE7F3]" />
                        <Link href="/untuk" className="hover:text-[#0B63CE] transition-colors">
                            Untuk Peran Anda
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-[#DCE7F3]" />
                        <span className="font-semibold text-[#112743]">{role_name}</span>
                    </nav>

                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        <div className="space-y-2 max-w-3xl">
                            <div className="flex items-center gap-2">
                                <span
                                    className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-2xs"
                                    style={{ backgroundColor: color }}
                                />
                                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B63CE] flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5" />
                                    Standarisasi Peran PERKEMI
                                </span>
                            </div>
                            <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-[#0E2747] tracking-tight">
                                Materi & Panduan: {role_name}
                            </h1>
                            <p className="text-xs sm:text-sm text-[#4A6482] leading-relaxed pt-1">
                                {description}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <div className="bg-[#EAF5FF] border border-[#BCE0FD] px-4 py-2 rounded-lg text-xs text-[#0A3F82]">
                                Tersedia: <strong className="font-bold text-[#0B63CE] text-sm ml-1">{materials.total ?? 0}</strong> materi
                            </div>
                            <Link
                                href="/koleksi"
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#6B7C93] hover:text-[#0B63CE] hover:bg-slate-50 transition-colors"
                            >
                                <span>Katalog Lengkap</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
                {/* Learning Needs & Short Track Banner */}
                <div className="bg-white rounded-xl border border-[#DCE7F3] p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE7F3]/70">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
                                style={{ backgroundColor: color }}
                            >
                                <Compass className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7C93]">
                                    Kebutuhan Belajar Utama
                                </span>
                                <h3 className="font-serif text-base sm:text-lg font-bold text-[#0E2747]">
                                    {learning_needs}
                                </h3>
                            </div>
                        </div>

                        <span className="text-xs text-[#6B7C93] italic">
                            Kurikulum Resmi PB PERKEMI
                        </span>
                    </div>

                    {/* Brief Learning Path Steps */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#0E2747] flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-[#0B63CE]" />
                            <span>Jalur Belajar Singkat</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                            {currentTrack.map((stepItem) => (
                                <div
                                    key={stepItem.step}
                                    className="p-4 rounded-lg bg-[#F8FBFF] border border-[#DCE7F3] space-y-1.5"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-[#0B63CE] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                            {stepItem.step}
                                        </span>
                                        <h5 className="text-xs font-bold text-[#112743]">
                                            {stepItem.title}
                                        </h5>
                                    </div>
                                    <p className="text-[11px] text-[#4A6482] leading-relaxed pl-7">
                                        {stepItem.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Search & Sort Controls */}
                <div className="bg-white border border-[#DCE7F3] rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                    <form onSubmit={handleSearch} className="w-full sm:max-w-md relative flex items-center">
                        <Search className="w-4 h-4 absolute left-3.5 text-[#6B7C93] pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={`Cari modul untuk ${role_name}...`}
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
                        <div className="flex items-center justify-between">
                            <h3 className="font-serif text-lg font-bold text-[#0E2747] flex items-center gap-2">
                                <BookMarked className="w-4 h-4 text-[#0B63CE]" />
                                <span>Rekomendasi Materi Terkait</span>
                            </h3>
                            <span className="text-xs text-[#6B7C93]">
                                Ditampilkan {materials.data.length} dari {materials.total} materi
                            </span>
                        </div>

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

                {/* Other Roles Navigation Strip */}
                {all_roles && all_roles.length > 0 && (
                    <div className="pt-8 border-t border-[#DCE7F3] space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7C93] flex items-center gap-2">
                                <Users className="w-3.5 h-3.5 text-[#0B63CE]" />
                                <span>Jalur Peran Kenshi Lainnya</span>
                            </h3>
                            <Link
                                href="/untuk"
                                className="text-xs font-semibold text-[#0B63CE] hover:text-[#0A3F82] flex items-center gap-1"
                            >
                                <span>Semua Peran</span>
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            {all_roles.map((r) => (
                                <Link
                                    key={r.slug}
                                    href={`/untuk/${r.slug}`}
                                    className={`px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all shadow-2xs ${
                                        r.slug === role_slug
                                            ? 'bg-[#0B63CE] text-white border-[#0B63CE]'
                                            : 'bg-white border-[#DCE7F3] text-[#112743] hover:border-[#0B63CE] hover:bg-[#EAF5FF] hover:text-[#0B63CE]'
                                    }`}
                                >
                                    <span>{r.name}</span>
                                    <span className="ml-1.5 opacity-75 font-mono text-[10px]">({r.count})</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </PortalLayout>
    );
}
