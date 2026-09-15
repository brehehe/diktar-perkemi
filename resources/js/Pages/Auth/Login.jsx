import React from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Loader2, BookMarked } from 'lucide-react';
import AuthLayout from '@/Layouts/AuthLayout';
import AuthFormCard from '@/Components/auth/AuthFormCard';
import AuthNotice from '@/Components/auth/AuthNotice';
import AuthFooterLink from '@/Components/auth/AuthFooterLink';
import PasswordInput from '@/Components/ui/PasswordInput';

/* ─────────────────────────────────────────────────────────────────────────
   Login cover card — shown inside the AuthBrandPanel left column
   ───────────────────────────────────────────────────────────────────────── */
function LoginBrandContent() {
    return (
        <div className="space-y-5 mt-2">
            {/* Feature list (editorial separator style) */}
            <div className="space-y-0 divide-y divide-[#C8DFFF]/60">
                {[
                    'Lanjutkan membaca modul penataran dari halaman terakhir.',
                    'Simpan materi dan anotasi sesuai peran Anda.',
                    'Akses koleksi resmi Persaudaraan Shorinji Kempo Indonesia.',
                ].map((text, i) => (
                    <div key={i} className="flex items-start gap-3 py-3">
                        <span className="mt-0.5 text-[#0B63CE] text-[11px] font-mono font-bold shrink-0">
                            0{i + 1}
                        </span>
                        <span className="text-[12.5px] text-[#4A6482] leading-snug">{text}</span>
                    </div>
                ))}
            </div>

            {/* Cover preview */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-lg bg-white/70 border border-[#C8DFFF]/60 backdrop-blur-sm">
                <div className="w-11 h-14 rounded-md overflow-hidden shrink-0 border border-[#B0CFEF]/60 shadow-sm bg-[#DCE7F3]">
                    <img
                        src="/images/cover-1.jpg"
                        alt="Sampul Modul PERKEMI"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                </div>
                <div className="min-w-0">
                    <div className="text-[9.5px] font-bold text-[#0B63CE] tracking-widest uppercase mb-0.5 font-mono flex items-center gap-1">
                        <BookMarked className="w-2.5 h-2.5" />
                        MODUL RESMI
                    </div>
                    <p className="text-xs font-semibold text-[#0E2747] line-clamp-1 font-serif">
                        Panduan Lengkap Penataran Nasional
                    </p>
                    <p className="text-[11px] text-[#6B7C93] line-clamp-2 leading-snug mt-0.5">
                        Standar teknik goho & juho, perwasitan, kepelatihan, dan silabus terpusat.
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   Login Page
   ───────────────────────────────────────────────────────────────────────── */
export default function Login() {
    const { flash } = usePage().props;

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

    const inputBase =
        'w-full px-3.5 py-2.5 rounded-lg text-sm text-[#112743] bg-white border ' +
        'placeholder:text-[#B0BEC9] transition-all focus:outline-none focus:ring-2 ';

    const inputClass = (hasError) =>
        inputBase +
        (hasError
            ? 'border-[#FA5252] focus:ring-[#FA5252]/20 focus:border-[#FA5252]'
            : 'border-[#DCE7F3] hover:border-[#A8C4E0] focus:border-[#0B63CE] focus:ring-[#0B63CE]/15');

    return (
        <AuthLayout
            title="Masuk ke Portal — Pustaka Penataran PERKEMI"
            badge="📘 DIGITAL LEARNING CENTER"
            headline={<>Akses kembali ruang<br />belajar Anda.</>}
            description="Masuk untuk melanjutkan membaca modul, menyimpan materi, dan mengakses koleksi yang sesuai dengan peran Anda."
            brandContent={<LoginBrandContent />}
        >
            <AuthFormCard>
                {/* ── Heading ── */}
                <div className="mb-6">
                    <h2 className="font-serif text-2xl font-bold text-[#0E2747] tracking-tight">
                        Masuk ke Portal
                    </h2>
                    <p className="mt-1 text-[13px] text-[#6B7C93]">
                        Gunakan akun Pustaka Penataran Anda.
                    </p>
                </div>

                {/* ── Flash success ── */}
                {flash?.success && (
                    <AuthNotice type="success" message={flash.success} className="mb-5" />
                )}

                {/* ── Login error banner ── */}
                {errors.email && (
                    <AuthNotice type="error" message={errors.email} className="mb-5" />
                )}

                {/* ── Form ── */}
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>

                    {/* Email */}
                    <div>
                        <label htmlFor="login-email" className="block text-xs font-semibold text-[#112743] mb-1.5">
                            Email
                        </label>
                        <input
                            type="email"
                            id="login-email"
                            name="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="nama@email.com"
                            autoComplete="email"
                            required
                            aria-invalid={errors.email ? 'true' : 'false'}
                            aria-describedby="login-email-error"
                            className={inputClass(errors.email)}
                        />
                    </div>

                    {/* Kata Sandi */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label htmlFor="login-password" className="text-xs font-semibold text-[#112743]">
                                Kata Sandi
                            </label>
                        </div>
                        <PasswordInput
                            id="login-password"
                            name="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                            error={errors.password}
                        />
                    </div>

                    {/* Remember me */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="w-4 h-4 rounded border-[#DCE7F3] text-[#0B63CE] focus:ring-[#0B63CE] cursor-pointer accent-[#0B63CE]"
                        />
                        <label htmlFor="remember" className="text-[12.5px] text-[#6B7C93] cursor-pointer select-none">
                            Ingat saya di perangkat ini
                        </label>
                    </div>

                    {/* Submit */}
                    <button
                        id="btn-masuk-portal"
                        type="submit"
                        disabled={processing}
                        className="w-full mt-1.5 py-2.5 px-4 rounded-lg bg-[#0B63CE] hover:bg-[#0A3F82] active:bg-[#0E2747] text-white text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#0B63CE] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        aria-disabled={processing}
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
                </form>

                {/* ── Footer link ── */}
                <div className="mt-5 pt-5 border-t border-[#EDF2F8]">
                    <AuthFooterLink
                        text="Belum memiliki akun?"
                        linkText="Daftar sekarang"
                        href="/register"
                    />
                </div>
            </AuthFormCard>
        </AuthLayout>
    );
}
