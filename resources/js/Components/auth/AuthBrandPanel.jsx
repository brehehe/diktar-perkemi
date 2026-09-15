import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft, BookMarked } from 'lucide-react';

/**
 * AuthBrandPanel — editorial left panel for all auth pages.
 *
 * Background: Sky #EAF5FF (light), NOT dark navy.
 * Typography: Navy #0E2747 for headings, Muted #6B7C93 for body.
 * Visual tone: calm, institutional, editorial — not SaaS marketing.
 */
export default function AuthBrandPanel({
    badge = '📘 DIGITAL LEARNING CENTER',
    headline,
    description,
    children,  // Optional extra content (features, cover card, quote)
}) {
    return (
        <div className="flex flex-col h-full min-h-full bg-[#EAF5FF] px-8 sm:px-12 lg:px-14 pt-10 pb-8 relative overflow-hidden">
            {/* Subtle geometric accent lines */}
            <div
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                    backgroundImage: `
                        linear-gradient(135deg, #C8DFFF 0%, transparent 50%),
                        radial-gradient(ellipse at 100% 0%, #D8EEFF 0%, transparent 60%)
                    `,
                }}
            />
            {/* Subtle grid texture */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.07]"
                style={{
                    backgroundImage: 'linear-gradient(#0B63CE 1px, transparent 1px), linear-gradient(90deg, #0B63CE 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            />

            {/* Top: wordmark */}
            <div className="relative z-10 shrink-0">
                <Link href="/" className="inline-flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-[#0B63CE] text-white flex items-center justify-center font-serif font-bold text-sm shadow-md group-hover:bg-[#0A3F82] transition-colors">
                        PP
                    </div>
                    <div className="flex flex-col">
                        <span className="font-serif text-base font-bold text-[#0E2747] tracking-tight leading-tight group-hover:text-[#0B63CE] transition-colors">
                            Pustaka Penataran
                        </span>
                        <span className="text-[9.5px] font-semibold text-[#6B7C93] tracking-[0.18em] uppercase font-sans">
                            Portal Buku Digital PERKEMI
                        </span>
                    </div>
                </Link>
            </div>

            {/* Middle: editorial content */}
            <div className="relative z-10 flex-1 flex flex-col justify-center py-10 space-y-5 max-w-sm">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 w-fit text-[10.5px] font-bold tracking-widest text-[#0B63CE] uppercase font-mono">
                    <span>{badge}</span>
                </div>

                {/* Thin divider rule */}
                <div className="w-8 h-[2px] bg-[#0B63CE] rounded-full" />

                {/* Headline */}
                {headline && (
                    <h1 className="font-serif text-[1.75rem] sm:text-3xl font-bold text-[#0E2747] leading-[1.22] tracking-tight">
                        {headline}
                    </h1>
                )}

                {/* Description */}
                {description && (
                    <p className="text-[13.5px] text-[#4A6482] leading-relaxed">
                        {description}
                    </p>
                )}

                {/* Extra slot — features, cover card, quote */}
                {children}
            </div>

            {/* Bottom: back link */}
            <div className="relative z-10 shrink-0">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B7C93] hover:text-[#0B63CE] transition-colors group"
                >
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    Kembali ke Beranda
                </Link>
            </div>
        </div>
    );
}
