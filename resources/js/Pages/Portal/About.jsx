import React from 'react';
import { Link } from '@inertiajs/react';
import PortalLayout from '../../Layouts/PortalLayout';
import {
    BookOpen,
    ShieldCheck,
    Compass,
    Sparkles,
    Users,
    GraduationCap,
    Award,
    Scale,
    Presentation,
    ClipboardList,
    Home,
    ChevronRight,
    ArrowRight,
} from 'lucide-react';

export default function About({ stats = {} }) {
    const rolesTarget = [
        {
            name: 'Peserta',
            slug: 'peserta',
            roleDesc: 'Materi dasar dan modul penataran',
            icon: GraduationCap,
            color: '#0B63CE',
        },
        {
            name: 'Pelatih',
            slug: 'pelatih',
            roleDesc: 'Materi pembinaan dan metodologi',
            icon: Award,
            color: '#20A47A',
        },
        {
            name: 'Penguji',
            slug: 'penguji',
            roleDesc: 'Pedoman evaluasi dan instrumen pengujian',
            icon: ShieldCheck,
            color: '#DD4D7C',
        },
        {
            name: 'Wasit',
            slug: 'wasit',
            roleDesc: 'Referensi aturan dan materi perwasitan',
            icon: Scale,
            color: '#EE9B25',
        },
        {
            name: 'Pemateri',
            slug: 'pemateri',
            roleDesc: 'Bahan ajar dan referensi presentasi',
            icon: Presentation,
            color: '#7957D5',
        },
        {
            name: 'Penyelenggara',
            slug: 'penyelenggara',
            roleDesc: 'Panduan teknis dan administrasi kegiatan',
            icon: ClipboardList,
            color: '#0A3F82',
        },
    ];

    return (
        <PortalLayout title="Tentang Pustaka Penataran — Portal Buku Digital PERKEMI">
            {/* Header Strip */}
            <div className="bg-white border-b border-[#DCE7F3] py-10 sm:py-14">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
                    <nav className="flex items-center gap-2 text-xs text-[#6B7C93]" aria-label="Breadcrumb">
                        <Link href="/" className="hover:text-[#0B63CE] transition-colors flex items-center gap-1">
                            <Home className="w-3.5 h-3.5" />
                            <span>Beranda</span>
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-[#DCE7F3]" />
                        <span className="font-semibold text-[#112743]">Tentang</span>
                    </nav>

                    <div className="space-y-3 pt-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B63CE] flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            Pusat Sumber Belajar Digital PERKEMI
                        </span>
                        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#0E2747] tracking-tight leading-[1.15]">
                            Pengetahuan yang terhubung untuk penataran yang lebih baik.
                        </h1>
                        <p className="text-sm sm:text-base text-[#4A6482] leading-relaxed max-w-3xl pt-1">
                            Pustaka Penataran adalah pusat akses digital resmi untuk buku, modul penataran, bahan ajar pemateri, dan dokumen kurikulum Persaudaraan Bela Diri Shorinji Kempo Indonesia (PERKEMI). Dirancang untuk menjamin keseragaman teknik, integritas pengujian, dan transparansi tata kelola penataran di seluruh Indonesia.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content Body */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
                {/* Section 1: Nilai Utama */}
                <section className="space-y-6">
                    <div className="space-y-1">
                        <span className="text-xs font-bold text-[#0B63CE] uppercase tracking-wider">
                            Pilar Fondasi
                        </span>
                        <h2 className="font-serif text-2xl font-bold text-[#0E2747]">
                            Nilai-Nilai Pustaka Penataran
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl border border-[#DCE7F3] p-6 shadow-xs space-y-3">
                            <div className="w-10 h-10 rounded-lg bg-[#EAF5FF] text-[#0B63CE] flex items-center justify-center font-bold">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <h3 className="font-serif text-lg font-bold text-[#0E2747]">
                                Terpusat
                            </h3>
                            <p className="text-xs sm:text-sm text-[#4A6482] leading-relaxed">
                                Seluruh modul dan bahan ajar dihimpun dalam satu platform resmi terpadu dengan nomor pengesahan, riwayat versi, dan kendali mutu terverifikasi langsung oleh Pengurus Besar PERKEMI.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl border border-[#DCE7F3] p-6 shadow-xs space-y-3">
                            <div className="w-10 h-10 rounded-lg bg-[#EAF5FF] text-[#20A47A] flex items-center justify-center font-bold">
                                <Compass className="w-5 h-5" />
                            </div>
                            <h3 className="font-serif text-lg font-bold text-[#0E2747]">
                                Terarah
                            </h3>
                            <p className="text-xs sm:text-sm text-[#4A6482] leading-relaxed">
                                Kurikulum dirancang sistematis berdasarkan peran dan jenjang kenshi. Materi dikelompokkan secara proporsional sesuai kompetensi yang dituntut pada setiap tahapan penataran.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl border border-[#DCE7F3] p-6 shadow-xs space-y-3">
                            <div className="w-10 h-10 rounded-lg bg-[#EAF5FF] text-[#EE9B25] flex items-center justify-center font-bold">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <h3 className="font-serif text-lg font-bold text-[#0E2747]">
                                Berkelanjutan
                            </h3>
                            <p className="text-xs sm:text-sm text-[#4A6482] leading-relaxed">
                                Menjamin pembaruan literatur dan regulasi secara berkesinambungan. Menjembatani dojo di seluruh pelosok negeri dengan perkembangan teknik dan peraturan pertandingan WSKO terkini.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 2: Untuk Siapa Portal Ini Dibuat? */}
                <section className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-[#0B63CE] uppercase tracking-wider">
                                Sasaran Pengguna
                            </span>
                            <h2 className="font-serif text-2xl font-bold text-[#0E2747]">
                                Untuk Siapa Portal Ini Dibuat?
                            </h2>
                        </div>
                        <Link
                            href="/untuk"
                            className="text-xs font-semibold text-[#0B63CE] hover:text-[#0A3F82] flex items-center gap-1"
                        >
                            <span>Eksplorasi Peran Lengkap</span>
                            <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {rolesTarget.map((r) => {
                            const IconComp = r.icon;
                            return (
                                <Link
                                    key={r.slug}
                                    href={`/untuk/${r.slug}`}
                                    className="group p-5 rounded-xl bg-white border border-[#DCE7F3] hover:border-[#0B63CE] hover:shadow-sm transition-all flex items-start gap-3.5"
                                >
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform"
                                        style={{ backgroundColor: r.color }}
                                    >
                                        <IconComp className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-serif text-base font-bold text-[#0E2747] group-hover:text-[#0B63CE] transition-colors">
                                                {r.name}
                                            </h3>
                                            <ArrowRight className="w-3.5 h-3.5 text-[#6B7C93] group-hover:text-[#0B63CE] group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
                                        </div>
                                        <p className="text-xs text-[#4A6482] leading-relaxed">
                                            {r.roleDesc}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                {/* Section 3: Ringkasan Institusional PERKEMI */}
                <section className="bg-white rounded-xl border border-[#DCE7F3] p-8 space-y-6 shadow-xs">
                    <div className="space-y-2 max-w-3xl">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7C93]">
                            Identitas Institusi
                        </span>
                        <h3 className="font-serif text-xl font-bold text-[#0E2747]">
                            Persaudaraan Bela Diri Shorinji Kempo Indonesia (PERKEMI)
                        </h3>
                        <p className="text-xs sm:text-sm text-[#4A6482] leading-relaxed">
                            Didirikan pada tahun 1966, PERKEMI mengemban amanah pembinaan kenshi melalui persaudaraan, pembentukan karakter mulia, dan penguasaan teknik bela diri Shorinji Kempo. Pustaka Penataran merupakan wujud komitmen modernisasi pendidikan dan peningkatan mutu organisasi demi kemajuan olahraga nasional.
                        </p>
                    </div>

                    <div className="pt-4 border-t border-[#DCE7F3] flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-6 text-xs text-[#4A6482]">
                            <div>
                                <span className="font-semibold text-[#112743]">Total Koleksi:</span>{' '}
                                <span className="font-mono text-[#0B63CE] font-bold">{stats.total_materials ?? 0}</span> dokumen
                            </div>
                            <div>
                                <span className="font-semibold text-[#112743]">Kategori:</span>{' '}
                                <span className="font-mono text-[#0B63CE] font-bold">{stats.total_categories ?? 0}</span> bidang
                            </div>
                            <div>
                                <span className="font-semibold text-[#112743]">Peran:</span>{' '}
                                <span className="font-mono text-[#0B63CE] font-bold">{stats.total_roles ?? 0}</span> kelompok
                            </div>
                        </div>

                        <Link
                            href="/koleksi"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#0B63CE] hover:bg-[#0A3F82] transition-colors shadow-2xs"
                        >
                            <span>Jelajahi Koleksi Digital</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </section>
            </div>
        </PortalLayout>
    );
}
