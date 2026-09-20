import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import PortalLayout from '../../Layouts/PortalLayout';
import {
    HelpCircle,
    ChevronDown,
    ChevronUp,
    Search,
    BookOpen,
    LogIn,
    Smartphone,
    AlertCircle,
    Home,
    ChevronRight,
    ArrowRight,
    Building2,
    CheckCircle2,
} from 'lucide-react';

export default function Help() {
    const [openFaq, setOpenFaq] = useState(0);

    const faqs = [
        {
            id: 'faq-1',
            question: 'Bagaimana cara masuk ke portal?',
            answer: 'Klik tautan "Masuk Portal" yang terletak pada bilah utilitas atas atau tombol "Masuk" pada sudut kanan atas navigasi. Masukkan alamat email terdaftar dan kata sandi akun kenshi Anda. Jika Anda peserta penataran baru yang belum memiliki akun, daftarkan diri melalui menu "Daftar" atau koordinasikan dengan panitia penataran terkait.',
        },
        {
            id: 'faq-2',
            question: 'Bagaimana cara mencari modul?',
            answer: 'Anda dapat menggunakan bilah pencarian pada halaman Beranda atau halaman Koleksi dengan mengetikkan kata kunci judul materi, nama penulis/pemateri, atau kode modul. Anda juga dapat menyaring materi berdasarkan Kategori (Penataran, Kepelatihan, Perwasitan, dll.), Jenis Dokumen, Tahun Publikasi, atau langsung memilih menu "Untuk Peran Anda".',
        },
        {
            id: 'faq-3',
            question: 'Apakah materi dapat dibaca dari ponsel?',
            answer: 'Ya, seluruh portal Pustaka Penataran dan Reader Buku Digital dirancang responsif. Dokumen PDF dapat dibaca dengan nyaman melalui browser pada ponsel pintar, tablet, maupun laptop/desktop tanpa memerlukan instalasi aplikasi tambahan.',
        },
        {
            id: 'faq-4',
            question: 'Bagaimana jika saya tidak dapat membuka materi?',
            answer: 'Beberapa dokumen kurikulum dan pedoman ujian dibatasi sesuai hak akses peran kenshi (misalnya khusus Pelatih, Wasit Berlisensi, atau Penguji). Pastikan Anda telah masuk ke portal. Jika status akun Anda belum memiliki izin membaca materi tersebut, hubungi panitia kegiatan penataran atau administrator untuk penyesuaian peran akun Anda.',
        },
        {
            id: 'faq-5',
            question: 'Kepada siapa saya menghubungi untuk bantuan?',
            answer: 'Bantuan teknis dan administrasi akun dapat dikoordinasikan langsung melalui Sekretariat Panitia Penataran pada saat kegiatan penataran berlangsung, atau melalui pengurus bidang penataran di pengurus kota/provinsi (Pengkot/Pengprov) dan Pengurus Besar PERKEMI.',
        },
    ];

    const guideSteps = [
        {
            step: '01',
            title: 'Panduan Memulai',
            desc: 'Kunjungi portal dan masuk menggunakan akun kenshi Anda untuk membuka seluruh hak akses kurikulum yang sesuai dengan peran penataran aktif.',
            icon: LogIn,
        },
        {
            step: '02',
            title: 'Cara Mencari Materi',
            desc: 'Gunakan fitur pencarian cerdas di Beranda atau katalog Koleksi, manfaatkan filter kategori, tahun rilis, dan jalur peran untuk menemukan modul tepat sasaran.',
            icon: Search,
        },
        {
            step: '03',
            title: 'Cara Membuka Buku Digital',
            desc: 'Buka halaman detail materi lalu tekan "Baca Sekarang di Reader". Dokumen PDF akan disajikan secara interaktif lengkap dengan fitur zoom, navigasi cepat, dan layar penuh.',
            icon: BookOpen,
        },
    ];

    return (
        <PortalLayout title="Bantuan — Pustaka Penataran PERKEMI">
            {/* Header Strip */}
            <div className="bg-white border-b border-[#DCE7F3] py-10 sm:py-14">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
                    <nav className="flex items-center gap-2 text-xs text-[#6B7C93]" aria-label="Breadcrumb">
                        <Link href="/" className="hover:text-[#0B63CE] transition-colors flex items-center gap-1">
                            <Home className="w-3.5 h-3.5" />
                            <span>Beranda</span>
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-[#DCE7F3]" />
                        <span className="font-semibold text-[#112743]">Bantuan</span>
                    </nav>

                    <div className="space-y-3 pt-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B63CE] flex items-center gap-1.5">
                            <HelpCircle className="w-3.5 h-3.5" />
                            Pusat Panduan & Dukungan Pengguna
                        </span>
                        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#0E2747] tracking-tight leading-[1.15]">
                            Butuh bantuan menggunakan portal?
                        </h1>
                        <p className="text-sm sm:text-base text-[#4A6482] leading-relaxed max-w-3xl pt-1">
                            Temukan panduan praktis penggunaan portal buku digital, cara menavigasi katalog materi, petunjuk reader interaktif, dan jawaban atas pertanyaan umum seputar akses dokumen PERKEMI.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content Body */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
                {/* Section 1: Panduan Langkah Memulai & Membaca */}
                <section className="space-y-6">
                    <div className="space-y-1">
                        <span className="text-xs font-bold text-[#0B63CE] uppercase tracking-wider">
                            Alur Penggunaan
                        </span>
                        <h2 className="font-serif text-2xl font-bold text-[#0E2747]">
                            Tiga Langkah Memulai di Portal
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {guideSteps.map((g) => {
                            const IconComp = g.icon;
                            return (
                                <div
                                    key={g.step}
                                    className="bg-white rounded-xl border border-[#DCE7F3] p-6 shadow-xs space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="w-10 h-10 rounded-lg bg-[#EAF5FF] text-[#0B63CE] flex items-center justify-center font-bold">
                                            <IconComp className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-mono font-bold text-[#6B7C93]">
                                            {g.step}
                                        </span>
                                    </div>
                                    <h3 className="font-serif text-base font-bold text-[#0E2747]">
                                        {g.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-[#4A6482] leading-relaxed">
                                        {g.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Section 2: FAQ Accordion */}
                <section id="faq" className="space-y-6 scroll-mt-24">
                    <div className="space-y-1">
                        <span className="text-xs font-bold text-[#0B63CE] uppercase tracking-wider">
                            Tanya Jawab
                        </span>
                        <h2 className="font-serif text-2xl font-bold text-[#0E2747]">
                            Pertanyaan Umum (FAQ)
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {faqs.map((faq, index) => {
                            const isOpen = openFaq === index;
                            return (
                                <div
                                    key={faq.id}
                                    className="bg-white rounded-xl border border-[#DCE7F3] overflow-hidden shadow-2xs transition-all"
                                >
                                    <button
                                        type="button"
                                        onClick={() => setOpenFaq(isOpen ? -1 : index)}
                                        className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-[#F8FBFF] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE]"
                                        aria-expanded={isOpen}
                                        aria-controls={`faq-answer-${index}`}
                                        id={`faq-question-${index}`}
                                    >
                                        <span className="font-serif text-sm sm:text-base font-bold text-[#112743]">
                                            {faq.question}
                                        </span>
                                        <span className="shrink-0 text-[#0B63CE]">
                                            {isOpen ? (
                                                <ChevronUp className="w-4 h-4" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4" />
                                            )}
                                        </span>
                                    </button>

                                    {isOpen && (
                                        <div
                                            id={`faq-answer-${index}`}
                                            role="region"
                                            aria-labelledby={`faq-question-${index}`}
                                            className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#4A6482] leading-relaxed border-t border-[#DCE7F3]/70 bg-[#F8FBFF]/50"
                                        >
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Section 3: Jalur Bantuan Nyata */}
                <section className="bg-white rounded-xl border border-[#DCE7F3] p-6 sm:p-8 space-y-4 shadow-xs">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#EAF5FF] text-[#0B63CE] flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-serif text-lg font-bold text-[#0E2747]">
                                Jalur Bantuan Resmi Penataran
                            </h3>
                            <p className="text-xs sm:text-sm text-[#4A6482] leading-relaxed">
                                Untuk kendala verifikasi kenshi, izin akses materi penataran berlisensi, atau pelaporan kendala teknis dokumen, Anda dapat berkonsultasi langsung dengan Panitia Sekretariat Penataran pada saat agenda kegiatan penataran berlangsung, atau melalui bagian administrasi Pengurus Besar PERKEMI.
                            </p>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-[#DCE7F3]/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <span className="text-xs text-[#6B7C93] italic">
                            Diselenggarakan di bawah koordinasi Komisi Pembinaan & Penataran PB PERKEMI
                        </span>
                        <Link
                            href="/koleksi"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#0B63CE] hover:bg-[#0A3F82] transition-colors shadow-2xs"
                        >
                            <span>Mulai Jelajahi Koleksi</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </section>
            </div>
        </PortalLayout>
    );
}
