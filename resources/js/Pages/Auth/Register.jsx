import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Eye,
    EyeOff,
    AlertCircle,
    Loader2,
    Bookmark,
    Shield,
} from 'lucide-react';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        role: 'Peserta',
        password: '',
        password_confirmation: '',
        terms: false,
    });

    const rolesList = [
        { value: 'Peserta', label: 'Peserta Penataran / Kenshi' },
        { value: 'Pelatih', label: 'Pelatih Perkemi' },
        { value: 'Wasit', label: 'Wasit Pertandingan' },
        { value: 'Penguji', label: 'Penguji Kenaikan Tingkat' },
        { value: 'Pemateri', label: 'Pemateri / Narasumber' },
        { value: 'Penyelenggara', label: 'Penyelenggara Kegiatan' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/register', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FBFF] text-[#112743] font-sans antialiased selection:bg-[#EAF5FF] selection:text-[#0B63CE]">
            <Head title="Daftar Akun Kenshi — Pustaka Penataran PERKEMI" />

            {/* ═══════════════════════════════════════════════════════════
                 KOLOM KIRI: FULL-SCREEN EDITORIAL BRANDING (NAVY #0E2747)
                 ═══════════════════════════════════════════════════════════ */}
            <div className="lg:w-1/2 xl:w-5/12 bg-[#0E2747] text-white p-8 sm:p-12 lg:p-14 flex flex-col justify-between relative overflow-hidden min-h-[420px] lg:min-h-screen">
                {/* Background lighting & textures */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: `
                            radial-gradient(circle at 20% 25%, rgba(11, 99, 206, 0.4) 0%, transparent 60%),
                            radial-gradient(circle at 80% 80%, rgba(10, 63, 130, 0.5) 0%, transparent 65%)
                        `,
                    }}
                />
                <div
                    className="absolute inset-0 opacity-[0.04] pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)',
                        backgroundSize: '28px 28px',
                    }}
                />

                {/* Top: Brand Wordmark */}
                <div className="relative z-10">
                    <Link href="/" className="inline-flex items-center gap-3.5 group">
                        <div className="w-11 h-11 rounded-xl bg-[#0B63CE] text-white flex items-center justify-center font-bold text-base shadow-sm group-hover:bg-[#0A3F82] transition-colors border border-white/10">
                            PP
                        </div>
                        <div className="flex flex-col">
                            <span className="font-serif text-lg font-bold text-white tracking-tight leading-tight group-hover:text-[#62B0FF] transition-colors">
                                Pustaka Penataran
                            </span>
                            <span className="text-[10px] font-semibold text-white/60 tracking-[0.16em] uppercase font-sans">
                                Portal Buku Digital PERKEMI
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Center: Editorial Content */}
                <div className="relative z-10 my-8 lg:my-auto space-y-7 max-w-lg">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-wider text-[#62B0FF] bg-white/5 border border-white/15 backdrop-blur-xs uppercase font-mono">
                        <span className="w-2 h-2 rounded-full bg-[#20A47A] animate-pulse" />
                        BUAT AKUN KENSHI
                    </div>

                    <h1 className="font-serif text-3xl sm:text-4xl lg:text-4.5xl font-bold text-white leading-[1.18] tracking-tight">
                        Bergabung dengan <br />
                        <span className="text-[#62B0FF] italic font-normal">ekosistem belajar</span> resmi.
                    </h1>

                    <p className="text-sm sm:text-base text-white/75 leading-relaxed">
                        Daftarkan akun Anda untuk memperoleh modul standar, bahan ajar pemateri, serta kurikulum penataran terpusat sesuai peran Anda di PERKEMI.
                    </p>

                    {/* Book Showcase Widget */}
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-4 shadow-lg hover:border-white/20 transition-all">
                        <div className="w-16 h-22 rounded-md bg-[#0A3F82] overflow-hidden shrink-0 shadow-md border border-white/10">
                            <img
                                src="/images/cover-2.jpg"
                                alt="Sampul Modul PERKEMI"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#62B0FF] tracking-wider uppercase font-mono">
                                <Bookmark className="w-3 h-3" />
                                <span>AKSES PENUH PERAN</span>
                            </div>
                            <h4 className="font-serif text-sm font-bold text-white line-clamp-1">
                                Standar Nasional Kurikulum PERKEMI
                            </h4>
                            <p className="text-xs text-white/60 line-clamp-2 leading-tight">
                                Terbuka untuk seluruh kenshi, pelatih, wasit, dan penguji di Indonesia.
                            </p>
                        </div>
                    </div>

                    <blockquote className="border-l-2 border-[#0B63CE] pl-3.5 text-xs text-white/60 italic leading-relaxed">
                        &ldquo;Jiko Kakuritsu — Membina diri sendiri agar dapat memberikan manfaat nyata bagi persaudaraan dan sesama.&rdquo;
                    </blockquote>
                </div>

                {/* Bottom: Official Copyright */}
                <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
                    <span>PB PERKEMI &copy; {new Date().getFullYear()}</span>
                    <span>Pusat Data Pembelajaran Kenshi</span>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                 KOLOM KANAN: FORM REGISTRASI FULL HEIGHT
                 ═══════════════════════════════════════════════════════════ */}
            <div className="lg:w-1/2 xl:w-7/12 flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-16 min-h-screen">
                {/* Top Nav */}
                <div className="flex items-center justify-between">
                    <div className="lg:hidden">
                        <Link href="/" className="flex items-center gap-2 font-serif font-bold text-[#0E2747]">
                            <div className="w-7 h-7 rounded-md bg-[#0B63CE] text-white flex items-center justify-center text-xs">PP</div>
                            <span>Pustaka Penataran</span>
                        </Link>
                    </div>
                    <div className="ml-auto">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B7C93] hover:text-[#0B63CE] transition-colors bg-white px-3.5 py-2 rounded-lg border border-[#DCE7F3] shadow-2xs hover:border-[#BCE0FD]"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Kembali ke Beranda</span>
                        </Link>
                    </div>
                </div>

                {/* Center Form */}
                <div className="max-w-md w-full mx-auto my-auto py-8">
                    <div className="bg-white rounded-2xl border border-[#DCE7F3] p-8 sm:p-10 shadow-xs space-y-6">
                        <div className="space-y-1.5">
                            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0E2747] tracking-tight">
                                Daftar Akun
                            </h2>
                            <p className="text-xs sm:text-sm text-[#6B7C93]">
                                Lengkapi data diri untuk membuat akun baru kenshi.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                            {/* Nama Lengkap */}
                            <div className="space-y-1">
                                <label
                                    htmlFor="name"
                                    className="block text-xs font-semibold text-[#112743]"
                                >
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Budi Santoso"
                                    required
                                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white border ${
                                        errors.name ? 'border-[#E03131]' : 'border-[#DCE7F3] focus:border-[#0B63CE] focus:ring-[#0B63CE]'
                                    } focus:outline-none focus:ring-1 transition-all placeholder:text-[#9AA8BC]`}
                                />
                                {errors.name && (
                                    <p className="text-[11px] text-[#E03131]">{errors.name}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-1">
                                <label
                                    htmlFor="email"
                                    className="block text-xs font-semibold text-[#112743]"
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="nama@email.com"
                                    required
                                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white border ${
                                        errors.email ? 'border-[#E03131]' : 'border-[#DCE7F3] focus:border-[#0B63CE] focus:ring-[#0B63CE]'
                                    } focus:outline-none focus:ring-1 transition-all placeholder:text-[#9AA8BC]`}
                                />
                                {errors.email && (
                                    <p className="text-[11px] text-[#E03131]">{errors.email}</p>
                                )}
                            </div>

                            {/* Peran Utama */}
                            <div className="space-y-1">
                                <label
                                    htmlFor="role"
                                    className="block text-xs font-semibold text-[#112743]"
                                >
                                    Peran Utama dalam Kegiatan PERKEMI
                                </label>
                                <select
                                    id="role"
                                    name="role"
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white border border-[#DCE7F3] focus:border-[#0B63CE] focus:ring-[#0B63CE] focus:outline-none focus:ring-1 transition-all text-[#112743]"
                                >
                                    {rolesList.map((r) => (
                                        <option key={r.value} value={r.value}>
                                            {r.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.role && (
                                    <p className="text-[11px] text-[#E03131]">{errors.role}</p>
                                )}
                            </div>

                            {/* Kata Sandi & Konfirmasi */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label
                                        htmlFor="password"
                                        className="block text-xs font-semibold text-[#112743]"
                                    >
                                        Kata Sandi
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="password"
                                            name="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Min. 8 karakter"
                                            required
                                            className={`w-full px-3.5 py-2.5 pr-9 rounded-xl text-xs sm:text-sm bg-white border ${
                                                errors.password ? 'border-[#E03131]' : 'border-[#DCE7F3]'
                                            } focus:outline-none focus:ring-1 focus:ring-[#0B63CE]`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7C93] hover:text-[#112743]"
                                        >
                                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-[11px] text-[#E03131]">{errors.password}</p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label
                                        htmlFor="password_confirmation"
                                        className="block text-xs font-semibold text-[#112743]"
                                    >
                                        Konfirmasi Sandi
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            placeholder="Ulangi sandi"
                                            required
                                            className="w-full px-3.5 py-2.5 pr-9 rounded-xl text-xs sm:text-sm bg-white border border-[#DCE7F3] focus:outline-none focus:ring-1 focus:ring-[#0B63CE]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7C93] hover:text-[#112743]"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Syarat & Ketentuan */}
                            <div className="space-y-1 pt-1">
                                <div className="flex items-start gap-2">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        checked={data.terms}
                                        onChange={(e) => setData('terms', e.target.checked)}
                                        className="w-4 h-4 rounded border-[#DCE7F3] text-[#0B63CE] focus:ring-[#0B63CE] cursor-pointer mt-0.5"
                                    />
                                    <label
                                        htmlFor="terms"
                                        className="text-[11.5px] text-[#4A6482] cursor-pointer leading-tight select-none"
                                    >
                                        Saya menyetujui Ketentuan Penggunaan dan Kebijakan Privasi Pustaka Penataran PERKEMI.
                                    </label>
                                </div>
                                {errors.terms && (
                                    <p className="text-[11px] text-[#E03131]">{errors.terms}</p>
                                )}
                            </div>

                            {/* Tombol Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3 px-4 rounded-xl bg-[#0B63CE] hover:bg-[#0A3F82] text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Mendaftarkan Akun...</span>
                                    </>
                                ) : (
                                    <span>Buat Akun</span>
                                )}
                            </button>

                            {/* Link Login */}
                            <div className="text-center pt-2 text-xs text-[#6B7C93]">
                                Sudah memiliki akun?{' '}
                                <Link
                                    href="/login"
                                    className="font-semibold text-[#0B63CE] hover:underline"
                                >
                                    Masuk sekarang
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="text-center text-xs text-[#6B7C93] pt-4">
                    Pustaka Penataran &copy; {new Date().getFullYear()} PB PERKEMI. Seluruh hak cipta dilindungi.
                </div>
            </div>
        </div>
    );
}
