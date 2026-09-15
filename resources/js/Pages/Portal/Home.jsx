import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import PortalLayout from '../../Layouts/PortalLayout';
import HeroSearch from '../../Components/portal/HeroSearch';
import HeroBookShowcase from '../../Components/portal/HeroBookShowcase';
import FeaturedCollection from '../../Components/portal/FeaturedCollection';
import CategoryNavigation from '../../Components/portal/CategoryNavigation';
import LatestCollectionList from '../../Components/portal/LatestCollectionList';
import RoleNavigation from '../../Components/portal/RoleNavigation';
import PortalStats from '../../Components/portal/PortalStats';
import Button from '../../Components/ui/Button';
import {
    BookOpen,
    ArrowRight,
    LogIn,
    Compass,
    ShieldCheck,
    Layers,
    Users,
} from 'lucide-react';

export default function Home({
    stats = {},
    featured_materials = [],
    categories = [],
    latest_materials = [],
    roles = [],
}) {
    const { props } = usePage();
    const user = props.auth?.user;

    return (
        <PortalLayout title="Portal Buku Digital PERKEMI — Satu Akses, Banyak Pengetahuan">
            {/* ═══════════════════════════════════════════════════════════
                 1. HERO SECTION (SPLIT 2-KOLOM DENGAN 3D BOOKS SHOWCASE)
                 ═══════════════════════════════════════════════════════════ */}
            <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 border-b border-[#DCE7F3]">
                {/* Background: subtle radial gradients & grid */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
                            radial-gradient(circle at 15% 50%, #EAF5FF 0%, transparent 55%),
                            radial-gradient(circle at 85% 30%, #EAF5FF 0%, transparent 60%)
                        `,
                        backgroundColor: '#ffffff',
                    }}
                />
                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #0B63CE 1.5px, transparent 1.5px)',
                        backgroundSize: '32px 32px',
                    }}
                />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-12 items-center">
                        {/* Kiri: Informasi, Headline, Search, & CTA */}
                        <div className="lg:col-span-7 space-y-6 text-left">
                            {/* Authority Badge */}
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-[#BCE0FD] bg-white shadow-xs">
                                <span className="font-bold text-[#0B63CE]">📘 DIGITAL LEARNING CENTER</span>
                            </div>

                            {/* Main Headline */}
                            <div className="space-y-3">
                                <h1 className="font-serif text-3xl sm:text-4xl lg:text-[3.25rem] xl:text-[3.6rem] font-bold text-[#0E2747] tracking-tight leading-[1.12]">
                                    Satu Akses,{' '}
                                    <span className="relative inline-block">
                                        <span className="text-[#0B63CE]">Banyak Pengetahuan</span>
                                        <svg
                                            className="absolute -bottom-1 left-0 w-full"
                                            height="4"
                                            viewBox="0 0 300 4"
                                            preserveAspectRatio="none"
                                            fill="none"
                                        >
                                            <path
                                                d="M0 2 Q150 0 300 2"
                                                stroke="#0B63CE"
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                                opacity="0.35"
                                            />
                                        </svg>
                                    </span>
                                </h1>

                                {/* Subheadline */}
                                <p className="text-sm sm:text-base text-[#4A6482] max-w-xl leading-relaxed">
                                    Akses buku digital, modul penataran, dan bahan ajar pemateri dalam satu portal terintegrasi.
                                    Dirancang untuk mendukung proses belajar, pengembangan kompetensi, dan penyelenggaraan penataran PERKEMI.
                                </p>
                            </div>

                            {/* Search Component with Left Alignment */}
                            <div className="pt-1 pb-1">
                                <HeroSearch align="left" />
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                <Link href="/koleksi">
                                    <Button variant="primary" size="lg" icon={ArrowRight}>
                                        Jelajahi Koleksi
                                    </Button>
                                </Link>
                                <a href="#cara-menggunakan">
                                    <Button variant="secondary" size="lg">
                                        Cara Menggunakan
                                    </Button>
                                </a>
                            </div>
                        </div>

                        {/* Kanan: 3D Floating Book Showcase dengan Framer Motion */}
                        <div className="lg:col-span-5 flex items-center justify-center lg:justify-end">
                            <HeroBookShowcase />
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                 2. STATISTIK PORTAL
                 ═══════════════════════════════════════════════════════════ */}
            <PortalStats stats={stats} />

            {/* ═══════════════════════════════════════════════════════════
                 MAIN CONTENT SECTIONS
                 ═══════════════════════════════════════════════════════════ */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
                {/* 3. KOLEKSI UNGGULAN */}
                <FeaturedCollection materials={featured_materials} />

                {/* 4. KATEGORI MATERI */}
                <CategoryNavigation categories={categories} />

                {/* 5. KOLEKSI TERBARU */}
                <LatestCollectionList materials={latest_materials} />

                {/* 6. MATERI BERDASARKAN PERAN */}
                <RoleNavigation roles={roles} />

                {/* 7. CARA MENGGUNAKAN PORTAL */}
                <section id="cara-menggunakan" className="scroll-mt-24">
                    <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0B63CE] uppercase tracking-[0.12em]">
                            <Compass className="w-3.5 h-3.5" />
                            Panduan Pembaca
                        </span>
                        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0E2747]">
                            Tiga Langkah Mengakses Materi
                        </h2>
                        <p className="text-sm text-[#6B7C93] leading-relaxed">
                            Dirancang untuk kenyamanan membaca mandiri maupun kebutuhan penataran tatap muka.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                step: '01',
                                title: 'Masuk ke Portal',
                                desc: 'Gunakan akun kenshi Anda untuk mengaktifkan izin membaca materi sesuai tingkatan dan peran yang ditugaskan di PB PERKEMI.',
                                color: '#0B63CE',
                                bg: '#EAF5FF',
                                border: '#BCE0FD',
                            },
                            {
                                step: '02',
                                title: 'Cari atau Pilih Materi',
                                desc: 'Gunakan fitur pencarian cepat, filter kategori bidang, atau telusuri modul berdasarkan peran seperti Wasit, Pelatih, atau Penguji.',
                                color: '#0E9F6E',
                                bg: '#F0FDF4',
                                border: '#B2F2BB',
                            },
                            {
                                step: '03',
                                title: 'Baca atau Gunakan Materi',
                                desc: 'Buka materi dan buku digital langsung melalui peramban atau gunakan dokumen sesuai kebutuhan penataran Anda.',
                                color: '#7B5BF0',
                                bg: '#F3EDFF',
                                border: '#D0BFFF',
                            },
                        ].map((item) => (
                            <div
                                key={item.step}
                                className="bg-white rounded-2xl border border-[#DCE7F3] p-6 shadow-xs hover:shadow-md transition-shadow duration-200 relative overflow-hidden"
                            >
                                {/* Step number background */}
                                <span
                                    className="absolute top-4 right-4 font-serif text-6xl font-extrabold leading-none select-none opacity-[0.06]"
                                    style={{ color: item.color }}
                                >
                                    {item.step}
                                </span>

                                <div
                                    className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold border mb-4"
                                    style={{
                                        backgroundColor: item.bg,
                                        borderColor: item.border,
                                        color: item.color,
                                    }}
                                >
                                    {item.step}
                                </div>

                                <h3 className="font-serif text-base font-bold text-[#0E2747] mb-2">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-[#4A6482] leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                 8. CLOSING CTA BANNER (Navy)
                 ═══════════════════════════════════════════════════════════ */}
            <section className="relative bg-[#0E2747] text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-t border-[#1D3B63]">
                {/* Subtle dot pattern */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #62B0FF 1.5px, transparent 1.5px)',
                        backgroundSize: '28px 28px',
                    }}
                />
                {/* Gradient glow */}
                <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[600px] h-[300px] bg-[#0B63CE]/20 rounded-full blur-3xl" />

                <div className="relative z-10 max-w-4xl mx-auto text-center space-y-7">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 text-[#62B0FF] border border-white/15">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Pusat Belajar Shorinji Kempo Indonesia
                    </span>

                    <h2 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                        Mulai belajar dari<br className="hidden sm:inline" /> koleksi yang tepat.
                    </h2>

                    <p className="text-sm sm:text-base text-white/65 max-w-xl mx-auto leading-relaxed">
                        Akses modul penataran nasional, standardisasi teknik Goho & Juho,
                        serta pedoman perwasitan yang selalu diperbarui secara resmi.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <Link href="/koleksi">
                            <Button variant="primary" size="lg" icon={ArrowRight}>
                                Buka Koleksi Digital
                            </Button>
                        </Link>
                        {!user && (
                            <Link href="/login">
                                <Button variant="secondary" size="lg" icon={LogIn}>
                                    Masuk Portal
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* Trust signals */}
                    <div className="flex items-center justify-center gap-6 pt-4 text-[11px] text-white/40 font-medium">
                        <span className="flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5" />
                            Standar Kurikulum Nasional
                        </span>
                        <span className="text-white/20">·</span>
                        <span className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Storage Terenkripsi
                        </span>
                        <span className="text-white/20">·</span>
                        <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            Hak Akses Berbasis Peran
                        </span>
                    </div>
                </div>
            </section>
        </PortalLayout>
    );
}
