import React from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    GraduationCap,
    ShieldCheck,
    Sprout,
    Users,
} from 'lucide-react';
import AuthNotice from '@/Components/auth/AuthNotice';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import PasswordInput from '@/Components/ui/PasswordInput';

const portalPillars = [
    { label: 'Pendidikan', description: 'Membangun dasar', icon: GraduationCap },
    { label: 'Penataran', description: 'Memperdalam kualitas', icon: BookOpen },
    { label: 'Pembinaan', description: 'Menguatkan karakter', icon: Users },
    { label: 'Pengabdian', description: 'Untuk masyarakat', icon: Sprout },
];

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
        <div className="relative min-h-[100dvh] w-full overflow-x-hidden bg-[#0E2747] font-sans text-white selection:bg-[#EAF5FF] selection:text-[#0A3F82]">
            <Head title="Selamat Datang — Portal Digital DIKTAR PB PERKEMI">
                <meta name="theme-color" content="#0E2747" />
                <meta
                    name="description"
                    content="Masuk ke Portal Digital DIKTAR PB PERKEMI untuk mengakses koleksi, materi penataran, event, dan ruang belajar Anda."
                />
            </Head>

            <a href="#form-masuk" className="skip-link">
                Lewati ke formulir masuk
            </a>

            <img
                src="/images/auth/perkemi-login-gateway.webp"
                alt=""
                aria-hidden="true"
                width="1920"
                height="1081"
                fetchPriority="high"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-[58%_center] lg:object-center"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-[#06182F]/72" />

            <div className="relative z-10 flex min-h-[100dvh] flex-col">
                <header className="border-b border-white/15 bg-[#0E2747]/95">
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#0B63CE] shadow-md shadow-black/20 sm:size-12">
                                <BookOpen className="size-6" aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                                <p className="truncate font-serif text-lg font-bold leading-tight sm:text-xl">
                                    Pustaka Penataran
                                </p>
                                <p className="truncate font-mono text-[9px] uppercase tracking-[0.18em] text-[#B8C6D9] sm:text-[10px]">
                                    Portal Digital DIKTAR PB PERKEMI
                                </p>
                            </div>
                        </div>

                        <div className="hidden items-center gap-2 border-l border-white/20 pl-5 text-xs font-medium text-[#DCE7F3] sm:flex">
                            <ShieldCheck className="size-4 text-[#20A47A]" aria-hidden="true" />
                            Akses akun terdaftar
                        </div>
                    </div>
                </header>

                <main className="mx-auto grid min-w-0 w-full max-w-7xl flex-1 items-center gap-x-12 gap-y-8 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)] lg:px-10 lg:py-12 xl:gap-x-20">
                    <section aria-labelledby="welcome-title" className="min-w-0 max-w-3xl self-center">
                        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9FD0FF] sm:text-xs">
                            Selamat Datang
                        </p>
                        <div className="mt-4 h-px w-16 bg-[#0B63CE]" aria-hidden="true" />
                        <h1
                            id="welcome-title"
                            className="mt-5 max-w-3xl text-balance font-serif text-[clamp(2.75rem,5vw,4.75rem)] font-bold leading-[0.98] tracking-[-0.04em] text-white drop-shadow-[0_3px_18px_rgba(0,0,0,0.65)]"
                        >
                            Portal Digital DIKTAR
                            <span className="mt-2 block text-[#C8E5FF]">PB PERKEMI</span>
                        </h1>
                        <p className="mt-6 max-w-2xl break-words text-pretty text-sm leading-7 text-[#DCE7F3] sm:text-base sm:leading-8">
                            Akses resmi untuk koleksi pembelajaran, kegiatan penataran, dan pengembangan kompetensi Kenshi Indonesia.
                        </p>
                    </section>

                    <section
                        id="form-masuk"
                        aria-labelledby="login-heading"
                        className="min-w-0 max-w-full w-full scroll-mt-5 self-center rounded-xl border border-[#DCE7F3] border-t-4 border-t-[#0B63CE] bg-white p-5 text-[#112743] shadow-2xl shadow-black/35 sm:p-7 lg:justify-self-end"
                    >
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0B63CE]">
                            Akses Portal
                        </p>
                        <h2 id="login-heading" className="mt-2 break-words text-balance font-serif text-2xl font-bold text-[#0E2747] sm:text-3xl">
                            Masuk ke ruang belajar Anda
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-[#6B7C93]">
                            Gunakan akun yang telah terdaftar pada Portal Digital DIKTAR.
                        </p>

                        {flash?.success && (
                            <AuthNotice type="success" message={flash.success} className="mt-5" />
                        )}
                        <form onSubmit={handleSubmit} className="mt-6 min-w-0 space-y-4" noValidate>
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
                                className="!min-h-12"
                                wrapperClassName="min-w-0"
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
                                className="!min-h-12"
                            />

                            <label htmlFor="remember" className="flex w-fit cursor-pointer select-none items-center gap-2.5 py-1 text-sm text-[#6B7C93]">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={data.remember}
                                    onChange={(event) => setData('remember', event.target.checked)}
                                    className="size-4 cursor-pointer rounded border-[#DCE7F3] accent-[#0B63CE] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                                />
                                Ingat saya di perangkat ini
                            </label>

                            <Button
                                type="submit"
                                size="lg"
                                loading={processing}
                                disabled={processing}
                                icon={ArrowRight}
                                iconPosition="right"
                                aria-busy={processing}
                                className="!min-h-12 w-full"
                            >
                                {processing ? 'Memproses…' : 'Masuk Portal'}
                            </Button>
                        </form>

                        <div className="mt-6 border-t border-[#DCE7F3] pt-5 text-center text-sm text-[#6B7C93]">
                            Belum memiliki akun?{' '}
                            <Link
                                href="/register"
                                className="font-semibold text-[#0B63CE] underline decoration-transparent underline-offset-4 transition-colors hover:text-[#0A3F82] hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B63CE] motion-reduce:transition-none"
                            >
                                Daftar sekarang
                            </Link>
                        </div>
                    </section>

                    <section
                        aria-label="Pilar Portal Digital DIKTAR"
                        className="grid border-y border-white/20 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-4"
                    >
                        {portalPillars.map(({ label, description, icon: Icon }, index) => (
                            <div
                                key={label}
                                className={`flex items-center gap-3 py-4 sm:px-5 lg:px-6 ${
                                    index > 0 ? 'border-t border-white/15 sm:border-t-0' : ''
                                } ${index % 2 === 1 ? 'sm:border-l' : ''} ${index > 1 ? 'sm:border-t lg:border-t-0' : ''} ${
                                    index > 0 ? 'lg:border-l' : ''
                                }`}
                            >
                                <Icon className="size-5 shrink-0 text-[#9FD0FF]" strokeWidth={1.7} aria-hidden="true" />
                                <div className="min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-white">{label}</p>
                                    <p className="mt-0.5 text-xs text-[#B8C6D9]">{description}</p>
                                </div>
                            </div>
                        ))}
                    </section>
                </main>

                <footer className="border-t border-white/15 bg-[#0E2747]/95 px-5 py-3 text-center text-[10px] text-[#9FB0C5] sm:text-xs">
                    &copy; {new Date().getFullYear()} PB PERKEMI · Portal Digital DIKTAR · Seluruh hak cipta dilindungi
                </footer>
            </div>
        </div>
    );
}
