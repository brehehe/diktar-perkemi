import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    BookOpen,
    ArrowLeft,
    Eye,
    EyeOff,
    AlertCircle,
    Loader2,
    CheckCircle2,
    ShieldCheck,
    Bookmark,
} from 'lucide-react';

export default function Login() {
    const { flash } = usePage().props;
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FBFF] text-[#112743] font-sans antialiased selection:bg-[#EAF5FF] selection:text-[#0B63CE]">
            <Head title="Masuk ke Portal — Pustaka Penataran PERKEMI" />

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

                {/* Center: Editorial Content & Book Showcase */}
                <div className="relative z-10 my-8 lg:my-auto space-y-7 max-w-lg">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-wider text-[#62B0FF] bg-white/5 border border-white/15 backdrop-blur-xs uppercase font-mono">
                        <span className="w-2 h-2 rounded-full bg-[#20A47A] animate-pulse" />
                        DIGITAL LEARNING CENTER
                    </div>

                    <h1 className="font-serif text-3xl sm:text-4xl lg:text-4.5xl font-bold text-white leading-[1.18] tracking-tight">
                        Akses kembali <br />
                        <span className="text-[#62B0FF] italic font-normal">ruang belajar</span> Anda.
                    </h1>

                    <p className="text-sm sm:text-base text-white/75 leading-relaxed">
                        Masuk untuk melanjutkan membaca modul penataran, bahan ajar pemateri, serta referensi resmi berjenjang Persaudaraan Shorinji Kempo Indonesia.
                    </p>

                    {/* Book Showcase Widget */}
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-4 shadow-lg hover:border-white/20 transition-all">
                        <div className="w-16 h-22 rounded-md bg-[#0A3F82] overflow-hidden shrink-0 shadow-md border border-white/10">
                            <img
                                src="/images/cover-1.jpg"
                                alt="Sampul Modul Panduan Penataran PERKEMI"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#62B0FF] tracking-wider uppercase font-mono">
                                <Bookmark className="w-3 h-3" />
                                <span>MODUL RESMI PERKEMI</span>
                            </div>
                            <h4 className="font-serif text-sm font-bold text-white line-clamp-1">
                                Panduan Lengkap Penataran Nasional
                            </h4>
                            <p className="text-xs text-white/60 line-clamp-2 leading-tight">
                                Standar teknik goho & juho, perwasitan, kepelatihan, dan silabus terpusat.
                            </p>
                        </div>
                    </div>

                    {/* Falsafah Kempo Quote */}
                    <blockquote className="border-l-2 border-[#0B63CE] pl-3.5 text-xs text-white/60 italic leading-relaxed">
                        &ldquo;Riki Ai Ichinyo — Kekuatan dan kasih sayang senantiasa menyatu dalam setiap langkah pembinaan.&rdquo;
                    </blockquote>
                </div>

                {/* Bottom: Official Copyright */}
                <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
                    <span>PB PERKEMI &copy; {new Date().getFullYear()}</span>
                    <span>Pusat Data Pembelajaran Kenshi</span>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                 KOLOM KANAN: FORM LOGIN FULL HEIGHT
                 ═══════════════════════════════════════════════════════════ */}
            <div className="lg:w-1/2 xl:w-7/12 flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-16 min-h-screen">
                {/* Top Nav: Kembali ke Beranda */}
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

                {/* Center: The Login Form */}
                <div className="max-w-md w-full mx-auto my-auto py-8">
                    <div className="bg-white rounded-2xl border border-[#DCE7F3] p-8 sm:p-10 shadow-xs space-y-6">
                        <div className="space-y-1.5">
                            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0E2747] tracking-tight">
                                Masuk ke Portal
                            </h2>
                            <p className="text-xs sm:text-sm text-[#6B7C93]">
                                Gunakan akun Pustaka Penataran Anda untuk melanjutkan.
                            </p>
                        </div>

                        {/* Flash Success Alert */}
                        {flash?.success && (
                            <div className="p-3.5 rounded-xl bg-[#E8F8F0] border border-[#BDECD2] text-[#1E7E4E] text-xs flex items-center gap-2.5">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>{flash.success}</span>
                            </div>
                        )}

                        {/* Global Error Alert */}
                        {errors.email && (
                            <div className="p-3.5 rounded-xl bg-[#FDE8E8] border border-[#F8B4B4] text-[#C81E1E] text-xs flex items-center gap-2.5">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{errors.email}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4.5" noValidate>
                            {/* Field Email / Username */}
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="email"
                                    className="block text-xs font-semibold text-[#112743]"
                                >
                                    Email atau Nama Pengguna
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="nama@email.com atau admin@perkemi.id"
                                    autoComplete="email"
                                    required
                                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white border ${
                                        errors.email
                                            ? 'border-[#E03131] focus:ring-[#E03131]'
                                            : 'border-[#DCE7F3] focus:border-[#0B63CE] focus:ring-[#0B63CE]'
                                    } focus:outline-none focus:ring-1 transition-all placeholder:text-[#9AA8BC]`}
                                />
                            </div>

                            {/* Field Kata Sandi */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label
                                        htmlFor="password"
                                        className="block text-xs font-semibold text-[#112743]"
                                    >
                                        Kata Sandi
                                    </label>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Masukkan kata sandi Anda"
                                        autoComplete="current-password"
                                        required
                                        className={`w-full px-3.5 py-2.5 pr-10 rounded-xl text-xs sm:text-sm bg-white border ${
                                            errors.password
                                                ? 'border-[#E03131] focus:ring-[#E03131]'
                                                : 'border-[#DCE7F3] focus:border-[#0B63CE] focus:ring-[#0B63CE]'
                                        } focus:outline-none focus:ring-1 transition-all placeholder:text-[#9AA8BC]`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7C93] hover:text-[#112743] transition-colors p-1"
                                        aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-[11px] text-[#E03131] mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        <span>{errors.password}</span>
                                    </p>
                                )}
                            </div>

                            {/* Checkbox Ingat Saya */}
                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-4 h-4 rounded border-[#DCE7F3] text-[#0B63CE] focus:ring-[#0B63CE] cursor-pointer"
                                />
                                <label
                                    htmlFor="remember"
                                    className="text-xs text-[#4A6482] cursor-pointer select-none"
                                >
                                    Ingat saya di perangkat ini
                                </label>
                            </div>

                            {/* Tombol Masuk Portal */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3 px-4 rounded-xl bg-[#0B63CE] hover:bg-[#0A3F82] text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Memproses...</span>
                                    </>
                                ) : (
                                    <span>Masuk Portal</span>
                                )}
                            </button>

                            {/* Link Registrasi */}
                            <div className="text-center pt-3 text-xs text-[#6B7C93]">
                                Belum memiliki akun?{' '}
                                <Link
                                    href="/register"
                                    className="font-semibold text-[#0B63CE] hover:underline"
                                >
                                    Daftar sekarang
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
