import React from 'react';
import { useForm, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    GraduationCap,
    ShieldCheck,
} from 'lucide-react';
import AuthLayout from '@/Layouts/AuthLayout';
import AuthFormCard from '@/Components/auth/AuthFormCard';
import AuthNotice from '@/Components/auth/AuthNotice';
import AuthFooterLink from '@/Components/auth/AuthFooterLink';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import PasswordInput from '@/Components/ui/PasswordInput';

/* ─────────────────────────────────────────────────────────────────────────
   Brand panel highlights (Modern Institutional Editorial)
   ───────────────────────────────────────────────────────────────────────── */
const HIGHLIGHTS = [
    {
        Icon: BookOpen,
        title: 'Modul & Kurikulum Resmi',
        description: 'Standarisasi materi teknik, perwasitan, dan kurikulum PB PERKEMI terpusat.',
    },
    {
        Icon: GraduationCap,
        title: 'Penataran & Ujian CBT',
        description: 'Akses jadwal kegiatan penataran, ruang belajar, dan asesmen evaluasi digital.',
    },
    {
        Icon: ShieldCheck,
        title: 'Akses Kenshi Terpadu',
        description: 'Masuk dengan alamat email terdaftar atau nomor NIK kenshi yang telah terhubung.',
    },
];

function LoginBrandContent() {
    return (
        <div className="mt-3 space-y-0 divide-y divide-[#C8DFFF]/60">
            {HIGHLIGHTS.map(({ Icon, title, description }, index) => (
                <div key={index} className="flex items-start gap-3 py-3.5">
                    <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border border-[#B0CFEF]/60 bg-[#D8EEFF]">
                        <Icon className="size-3.5 text-[#0B63CE]" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold leading-snug text-[#0E2747]">{title}</p>
                        <p className="mt-0.5 text-[12px] leading-relaxed text-[#4A6482]">{description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   Login Page Component
   ───────────────────────────────────────────────────────────────────────── */
export default function Login() {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (event) => {
        event.preventDefault();

        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title="Masuk ke Portal — Pustaka Penataran PERKEMI"
            badge="📘 DIGITAL LEARNING CENTER"
            headline={<>Akses kembali ruang<br />belajar Anda.</>}
            description="Masuk untuk melanjutkan membaca modul, mengikuti kegiatan penataran, dan mengakses koleksi resmi PB PERKEMI."
            brandContent={<LoginBrandContent />}
        >
            <AuthFormCard>
                {/* ── Heading ── */}
                <div className="mb-6">
                    <div className="mb-2 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#0B63CE]">
                        <span className="size-1.5 rounded-full bg-[#0B63CE]" aria-hidden="true" />
                        <span>Akses Portal</span>
                    </div>
                    <h2 className="font-serif text-2xl font-bold tracking-tight text-[#0E2747] sm:text-3xl">
                        Masuk ke Portal
                    </h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#6B7C93]">
                        Gunakan akun yang telah terdaftar pada Portal Digital DIKTAR PB PERKEMI.
                    </p>
                </div>

                {/* ── Flash Notifications ── */}
                {flash?.success && (
                    <AuthNotice type="success" message={flash.success} className="mb-5" />
                )}
                {flash?.error && (
                    <AuthNotice type="error" message={flash.error} className="mb-5" />
                )}
                {errors.email && (
                    <AuthNotice type="error" message={errors.email} className="mb-5" />
                )}

                {/* ── Login Form ── */}
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <Input
                        type="text"
                        id="login-email"
                        name="email"
                        label="Email atau NIK"
                        value={data.email}
                        onChange={(event) => setData('email', event.target.value)}
                        placeholder="nama@email.com atau NIK"
                        autoComplete="username"
                        spellCheck={false}
                        required
                        error={errors.email}
                        helperText="NIK dapat digunakan setelah data peserta terhubung ke akun portal."
                        className="!min-h-11"
                    />

                    <PasswordInput
                        id="login-password"
                        name="password"
                        label="Kata Sandi"
                        value={data.password}
                        onChange={(event) => setData('password', event.target.value)}
                        placeholder="Masukkan kata sandi"
                        autoComplete="current-password"
                        required
                        error={errors.password}
                        className="!min-h-11"
                    />

                    <div className="flex items-center justify-between pt-1">
                        <label htmlFor="remember" className="flex cursor-pointer select-none items-center gap-2">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={data.remember}
                                onChange={(event) => setData('remember', event.target.checked)}
                                className="size-4 cursor-pointer rounded border-[#DCE7F3] text-[#0B63CE] accent-[#0B63CE] focus:ring-2 focus:ring-[#0B63CE]/20"
                            />
                            <span className="text-xs text-[#6B7C93]">
                                Ingat saya di perangkat ini
                            </span>
                        </label>
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        loading={processing}
                        disabled={processing}
                        icon={ArrowRight}
                        iconPosition="right"
                        aria-busy={processing}
                        className="!min-h-12 w-full font-semibold"
                    >
                        {processing ? 'Memproses…' : 'Masuk Portal'}
                    </Button>
                </form>

                {/* ── Footer Navigation ── */}
                <div className="mt-6 border-t border-[#DCE7F3] pt-5">
                    <AuthFooterLink
                        text="Belum memiliki akun?"
                        linkText="Daftar Kenshi sekarang"
                        href="/register"
                    />
                </div>
            </AuthFormCard>
        </AuthLayout>
    );
}
