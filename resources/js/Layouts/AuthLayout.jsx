import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthBrandPanel from '@/Components/auth/AuthBrandPanel';
import Toast from '@/Components/ui/Toast';

/**
 * AuthLayout — shared two-column layout for all authentication pages.
 *
 * Desktop: Left = AuthBrandPanel (Sky #EAF5FF), Right = form slot (white bg).
 * Mobile: brand strip on top, form below.
 *
 * Props:
 *  title          — <Head> page title
 *  badge          — small label in brand panel (default: "📘 DIGITAL LEARNING CENTER")
 *  headline       — main heading in brand panel (JSX or string)
 *  description    — body text in brand panel
 *  brandContent   — optional extra slot inside brand panel (features list, cover card, etc.)
 */
export default function AuthLayout({
    title,
    badge,
    headline,
    description,
    brandContent,
    children,
}) {
    const { props } = usePage();
    const flash = props.flash ?? {};

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FBFF] text-[#112743] font-sans antialiased selection:bg-[#EAF5FF] selection:text-[#0B63CE]">
            {title && <Head title={title} />}

            {/* Global flash toasts */}
            {flash.success && <Toast message={flash.success} type="success" onClose={() => {}} />}
            {flash.error   && <Toast message={flash.error}   type="error"   onClose={() => {}} />}

            {/* ─── LEFT: Brand panel (Sky #EAF5FF) ─────────────────────── */}
            <div className="hidden lg:flex lg:w-[44%] xl:w-2/5 flex-col">
                <AuthBrandPanel badge={badge} headline={headline} description={description}>
                    {brandContent}
                </AuthBrandPanel>
            </div>

            {/* ─── RIGHT: Form area (white) ─────────────────────────────── */}
            <div className="flex-1 flex flex-col min-h-screen bg-white">
                {/* Mobile top bar — simplified brand strip */}
                <div className="lg:hidden bg-[#EAF5FF] border-b border-[#DCE7F3] px-5 py-4 flex items-center justify-between">
                    <a href="/" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 rounded-lg bg-[#0B63CE] text-white flex items-center justify-center font-serif font-bold text-sm">
                            PP
                        </div>
                        <div>
                            <div className="text-sm font-bold text-[#0E2747] font-serif leading-tight">
                                Pustaka Penataran
                            </div>
                            {description && (
                                <div className="text-[10px] text-[#6B7C93] font-sans leading-none mt-0.5 hidden sm:block">
                                    Portal Buku Digital PERKEMI
                                </div>
                            )}
                        </div>
                    </a>
                    <a
                        href="/"
                        className="text-[12px] font-medium text-[#6B7C93] hover:text-[#0B63CE] transition-colors flex items-center gap-1"
                    >
                        ← Beranda
                    </a>
                </div>

                {/* Form slot — centered vertically */}
                <div className="flex-1 flex items-center justify-center px-5 sm:px-10 py-10 lg:py-14">
                    <div className="w-full max-w-[430px]">
                        {children}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 pb-6 text-center text-[11px] text-[#9AA8BC]">
                    Pustaka Penataran &copy; {new Date().getFullYear()} PB PERKEMI. Seluruh hak cipta dilindungi.
                </div>
            </div>
        </div>
    );
}
