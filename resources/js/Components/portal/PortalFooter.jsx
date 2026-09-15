import React from 'react';
import { Link } from '@inertiajs/react';
import { BookOpen, ShieldCheck, Mail, MapPin } from 'lucide-react';

export default function PortalFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[#0E2747] text-white border-t border-[#1D3B63] pt-16 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
                    {/* Brand & Organization Column (2 cols on lg) */}
                    <div className="lg:col-span-2 space-y-4">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#0B63CE] text-white flex items-center justify-center shadow-xs">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="font-serif text-lg font-bold tracking-tight text-white block">
                                    Pustaka Penataran
                                </span>
                                <span className="text-[11px] font-semibold text-[#62B0FF] tracking-wider uppercase">
                                    Portal Buku Digital PERKEMI
                                </span>
                            </div>
                        </Link>

                        <p className="text-xs text-white/70 leading-relaxed max-w-sm">
                            Pusat akses digital terpadu untuk buku, modul penataran, pedoman teknis, dan bahan ajar pemateri resmi Pengurus Besar Persatuan Persaudaraan Shorinji Kempo Indonesia (PB PERKEMI).
                        </p>

                        <div className="pt-2 text-xs text-white/60 space-y-2">
                            <div className="flex items-start gap-2">
                                <MapPin className="w-3.5 h-3.5 text-[#62B0FF] shrink-0 mt-0.5" />
                                <span>Pondok Gede, Jakarta Timur / Sekretariat PB PERKEMI</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5 text-[#62B0FF] shrink-0" />
                                <span>pustaka@perkemi.id</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                            Katalog Koleksi
                        </h4>
                        <ul className="space-y-2.5 text-xs text-white/70">
                            <li>
                                <Link href="/koleksi" className="hover:text-white transition-colors">
                                    Semua Koleksi
                                </Link>
                            </li>
                            <li>
                                <Link href="/koleksi?type=module" className="hover:text-white transition-colors">
                                    Modul Penataran
                                </Link>
                            </li>
                            <li>
                                <Link href="/koleksi?type=book" className="hover:text-white transition-colors">
                                    Buku & Monograf
                                </Link>
                            </li>
                            <li>
                                <Link href="/koleksi?type=speaker_material" className="hover:text-white transition-colors">
                                    Bahan Ajar Pemateri
                                </Link>
                            </li>
                            <li>
                                <Link href="/koleksi?type=guideline" className="hover:text-white transition-colors">
                                    Pedoman Teknis
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                            Jalur Peran
                        </h4>
                        <ul className="space-y-2.5 text-xs text-white/70">
                            <li>
                                <Link href="/untuk/peserta" className="hover:text-white transition-colors">
                                    Materi Peserta
                                </Link>
                            </li>
                            <li>
                                <Link href="/untuk/pelatih" className="hover:text-white transition-colors">
                                    Materi Pelatih
                                </Link>
                            </li>
                            <li>
                                <Link href="/untuk/wasit" className="hover:text-white transition-colors">
                                    Referensi Wasit
                                </Link>
                            </li>
                            <li>
                                <Link href="/untuk/penguji" className="hover:text-white transition-colors">
                                    Pedoman Penguji
                                </Link>
                            </li>
                            <li>
                                <Link href="/untuk/penyelenggara" className="hover:text-white transition-colors">
                                    Penyelenggara Kegiatan
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                            Portal & Bantuan
                        </h4>
                        <ul className="space-y-2.5 text-xs text-white/70">
                            <li>
                                <Link href="/tentang" className="hover:text-white transition-colors">
                                    Tentang Pustaka Penataran
                                </Link>
                            </li>
                            <li>
                                <Link href="/bantuan" className="hover:text-white transition-colors">
                                    Panduan & Bantuan
                                </Link>
                            </li>
                            <li>
                                <Link href="/bantuan#faq" className="hover:text-white transition-colors">
                                    Pertanyaan Umum (FAQ)
                                </Link>
                            </li>
                            <li>
                                <Link href="/login" className="hover:text-white transition-colors font-medium text-[#62B0FF]">
                                    Masuk Portal Kenshi
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin" className="hover:text-white transition-colors">
                                    Area Pengelola (Admin)
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Copyright */}
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/50 gap-3">
                    <p>
                        &copy; {currentYear} Persatuan Persaudaraan Shorinji Kempo Indonesia (PERKEMI). Hak cipta dilindungi.
                    </p>
                    <div className="flex items-center gap-4">
                        <span>Standarisasi Kurikulum Nasional</span>
                        <span>&bull;</span>
                        <span>Sistem Baca Digital Terenkripsi</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
