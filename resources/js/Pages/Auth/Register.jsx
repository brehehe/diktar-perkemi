import React from 'react';
import { useForm } from '@inertiajs/react';
import { Loader2, AlertCircle, Library, BookOpen, Users } from 'lucide-react';
import AuthLayout from '@/Layouts/AuthLayout';
import AuthFormCard from '@/Components/auth/AuthFormCard';
import AuthNotice from '@/Components/auth/AuthNotice';
import AuthFooterLink from '@/Components/auth/AuthFooterLink';
import PasswordInput from '@/Components/ui/PasswordInput';
import PasswordStrength from '@/Components/auth/PasswordStrength';

/* ─────────────────────────────────────────────────────────────────────────
   Register brand panel content
   ───────────────────────────────────────────────────────────────────────── */
const BENEFITS = [
    { Icon: Library,  text: 'Akses koleksi digital modul dan kurikulum yang terpusat.' },
    { Icon: Users,    text: 'Materi yang tersedia sesuai peran Anda di PERKEMI.' },
    { Icon: BookOpen, text: 'Referensi yang mudah ditemukan dan dibaca kapan saja.' },
];

function RegisterBrandContent() {
    return (
        <div className="space-y-0 mt-2 divide-y divide-[#C8DFFF]/60">
            {BENEFITS.map(({ Icon, text }, i) => (
                <div key={i} className="flex items-start gap-3 py-3.5">
                    <div className="mt-0.5 w-6 h-6 rounded-md bg-[#D8EEFF] border border-[#B0CFEF]/60 flex items-center justify-center shrink-0">
                        <Icon className="w-3 h-3 text-[#0B63CE]" />
                    </div>
                    <span className="text-[12.5px] text-[#4A6482] leading-snug">{text}</span>
                </div>
            ))}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   Register Page
   ───────────────────────────────────────────────────────────────────────── */
const ROLES = [
    { value: 'Peserta',       label: 'Peserta Penataran / Kenshi' },
    { value: 'Pelatih',       label: 'Pelatih PERKEMI' },
    { value: 'Penguji',       label: 'Penguji Kenaikan Tingkat' },
    { value: 'Wasit',         label: 'Wasit Pertandingan' },
    { value: 'Pemateri',      label: 'Pemateri / Narasumber' },
    { value: 'Penyelenggara', label: 'Penyelenggara Kegiatan' },
];

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name:                  '',
        email:                 '',
        role:                  'Peserta',
        password:              '',
        password_confirmation: '',
        terms:                 false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/register', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    /* Reusable field error inline */
    const FieldError = ({ msg, id }) =>
        msg ? (
            <p id={id} role="alert" className="mt-1.5 text-[11.5px] text-[#FA5252] font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {msg}
            </p>
        ) : null;

    const inputBase =
        'w-full px-3.5 py-2.5 rounded-lg text-sm text-[#112743] bg-white border ' +
        'placeholder:text-[#B0BEC9] transition-all focus:outline-none focus:ring-2 ';

    const inputClass = (hasError) =>
        inputBase +
        (hasError
            ? 'border-[#FA5252] focus:ring-[#FA5252]/20 focus:border-[#FA5252]'
            : 'border-[#DCE7F3] hover:border-[#A8C4E0] focus:border-[#0B63CE] focus:ring-[#0B63CE]/15');

    const labelClass = 'block text-xs font-semibold text-[#112743] mb-1.5';

    return (
        <AuthLayout
            title="Daftar Akun — Pustaka Penataran PERKEMI"
            badge="📘 DIGITAL LEARNING CENTER"
            headline={<>Mulai perjalanan<br />belajar Anda.</>}
            description="Daftarkan akun untuk menemukan materi penataran sesuai peran dan kebutuhan Anda."
            brandContent={<RegisterBrandContent />}
        >
            <AuthFormCard>
                {/* ── Heading ── */}
                <div className="mb-6">
                    <h2 className="font-serif text-2xl font-bold text-[#0E2747] tracking-tight">
                        Daftar Akun
                    </h2>
                    <p className="mt-1 text-[13px] text-[#6B7C93]">
                        Lengkapi data berikut untuk membuat akun Anda.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>

                    {/* Nama Lengkap */}
                    <div>
                        <label htmlFor="reg-name" className={labelClass}>Nama Lengkap</label>
                        <input
                            type="text"
                            id="reg-name"
                            name="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Contoh: Budi Santoso"
                            autoComplete="name"
                            required
                            aria-invalid={errors.name ? 'true' : 'false'}
                            aria-describedby={errors.name ? 'reg-name-error' : undefined}
                            className={inputClass(errors.name)}
                        />
                        <FieldError msg={errors.name} id="reg-name-error" />
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="reg-email" className={labelClass}>Email</label>
                        <input
                            type="email"
                            id="reg-email"
                            name="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="nama@email.com"
                            autoComplete="email"
                            required
                            aria-invalid={errors.email ? 'true' : 'false'}
                            aria-describedby={errors.email ? 'reg-email-error' : undefined}
                            className={inputClass(errors.email)}
                        />
                        <FieldError msg={errors.email} id="reg-email-error" />
                    </div>

                    {/* Peran */}
                    <div>
                        <label htmlFor="reg-role" className={labelClass}>
                            Peran Utama dalam Kegiatan PERKEMI
                        </label>
                        <select
                            id="reg-role"
                            name="role"
                            value={data.role}
                            onChange={(e) => setData('role', e.target.value)}
                            required
                            aria-invalid={errors.role ? 'true' : 'false'}
                            aria-describedby={errors.role ? 'reg-role-error' : undefined}
                            className={`${inputClass(errors.role)} cursor-pointer`}
                        >
                            {ROLES.map((r) => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                        <FieldError msg={errors.role} id="reg-role-error" />
                    </div>

                    {/* Kata Sandi */}
                    <div>
                        <label htmlFor="reg-password" className={labelClass}>Kata Sandi</label>
                        <PasswordInput
                            id="reg-password"
                            name="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Minimal 8 karakter"
                            autoComplete="new-password"
                            required
                            error={errors.password}
                        />
                        <PasswordStrength password={data.password} />
                    </div>

                    {/* Konfirmasi Kata Sandi */}
                    <div>
                        <label htmlFor="reg-confirm" className={labelClass}>Konfirmasi Kata Sandi</label>
                        <PasswordInput
                            id="reg-confirm"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="Ulangi kata sandi"
                            autoComplete="new-password"
                            required
                            error={errors.password_confirmation}
                        />
                    </div>

                    {/* Terms */}
                    <div className="pt-0.5">
                        <div className="flex items-start gap-2.5">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={data.terms}
                                onChange={(e) => setData('terms', e.target.checked)}
                                required
                                aria-invalid={errors.terms ? 'true' : 'false'}
                                aria-describedby={errors.terms ? 'terms-error' : undefined}
                                className="w-4 h-4 mt-0.5 rounded border-[#DCE7F3] accent-[#0B63CE] cursor-pointer focus:ring-[#0B63CE]"
                            />
                            <label htmlFor="terms" className="text-[12px] text-[#6B7C93] cursor-pointer leading-snug select-none">
                                Saya menyetujui{' '}
                                <span className="font-semibold text-[#0B63CE]">Ketentuan Penggunaan</span>
                                {' '}dan{' '}
                                <span className="font-semibold text-[#0B63CE]">Kebijakan Privasi</span>
                                {' '}Pustaka Penataran PERKEMI.
                            </label>
                        </div>
                        {errors.terms && (
                            <p id="terms-error" role="alert" className="mt-1.5 ml-6 text-[11.5px] text-[#FA5252] font-medium flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 shrink-0" />
                                {errors.terms}
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        id="btn-buat-akun"
                        type="submit"
                        disabled={processing}
                        className="w-full mt-1 py-2.5 px-4 rounded-lg bg-[#0B63CE] hover:bg-[#0A3F82] active:bg-[#0E2747] text-white text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#0B63CE] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        aria-disabled={processing}
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
                </form>

                {/* Footer */}
                <div className="mt-5 pt-5 border-t border-[#EDF2F8]">
                    <AuthFooterLink
                        text="Sudah memiliki akun?"
                        linkText="Masuk Portal"
                        href="/login"
                    />
                </div>
            </AuthFormCard>
        </AuthLayout>
    );
}
