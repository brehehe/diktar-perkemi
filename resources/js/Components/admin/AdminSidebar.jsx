import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    BookOpen,
    Tags,
    Users,
    ShieldCheck,
    History,
    Settings,
    Sparkles,
    HelpCircle,
    ExternalLink,
    X,
} from 'lucide-react';

export default function AdminSidebar({ isMobile = false, onClose }) {
    const { url } = usePage();

    const navigation = [
        {
            name: 'Ringkasan',
            href: '/admin',
            icon: LayoutDashboard,
            exact: true,
        },
        {
            name: 'Koleksi',
            href: '/admin/koleksi',
            icon: BookOpen,
        },
        {
            name: 'Kategori',
            href: '/admin/kategori',
            icon: Tags,
        },
        {
            name: 'Showcase Beranda',
            href: '/admin/showcase',
            icon: Sparkles,
        },
        {
            name: 'Pengguna',
            href: '/admin/pengguna',
            icon: Users,
        },
        {
            name: 'Hak Akses',
            href: '/admin/hak-akses',
            icon: ShieldCheck,
        },
        {
            name: 'Aktivitas',
            href: '/admin/aktivitas',
            icon: History,
        },
        {
            name: 'Pengaturan Portal',
            href: '/admin/pengaturan',
            icon: Settings,
        },
        {
            name: 'Bantuan Admin',
            href: '/admin/bantuan',
            icon: HelpCircle,
        },
    ];

    const isActive = (item) => {
        if (item.exact) {
            return url === item.href;
        }
        return url.startsWith(item.href);
    };

    return (
        <aside className="h-full flex flex-col justify-between bg-[#0E2747] text-white border-r border-[#0A3F82]/50 select-none">
            {/* Top Brand Header */}
            <div>
                <div className="h-16 px-5 flex items-center justify-between border-b border-[#0A3F82]/60">
                    <Link href="/admin" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-lg bg-[#0B63CE] flex items-center justify-center font-bold text-white shadow-md text-sm group-hover:bg-[#0B63CE]/90 transition-colors">
                            PP
                        </div>
                        <div className="flex flex-col">
                            <span className="font-display font-bold text-sm tracking-wide text-white leading-tight">
                                Pustaka Penataran
                            </span>
                            <span className="text-[10px] text-[#EAF5FF]/70 tracking-wider uppercase font-mono">
                                Admin PERKEMI
                            </span>
                        </div>
                    </Link>

                    {isMobile && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
                            aria-label="Tutup menu sidebar"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Navigation Links */}
                <nav className="p-3 space-y-1" aria-label="Navigasi Admin">
                    <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-[#EAF5FF]/40">
                        Menu Utama
                    </div>

                    {navigation.map((item) => {
                        const active = isActive(item);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => isMobile && onClose && onClose()}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 relative group
                                    ${active
                                        ? 'bg-[#0B63CE] text-white shadow-xs font-semibold'
                                        : 'text-white/70 hover:bg-[#0A3F82]/70 hover:text-white'
                                    }
                                `}
                            >
                                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${active ? 'text-white' : 'text-white/60'}`} />
                                <span className="truncate">{item.name}</span>

                                {active && (
                                    <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Section */}
            <div className="p-4 border-t border-[#0A3F82]/60 space-y-3">
                <a
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs transition-colors border border-white/10"
                >
                    <span className="flex items-center gap-2">
                        <ExternalLink className="w-3.5 h-3.5 text-[#0B63CE]" />
                        <span>Lihat Portal Publik</span>
                    </span>
                    <span className="text-[10px] text-white/40">v1.2</span>
                </a>
            </div>
        </aside>
    );
}
