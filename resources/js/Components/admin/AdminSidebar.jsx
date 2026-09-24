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
    Calendar,
    UserCheck,
    GraduationCap,
    Compass,
    Layers,
    FileText,
    BookMarked,
    FileQuestion,
    CheckSquare,
} from 'lucide-react';

export default function AdminSidebar({ isMobile = false, onClose }) {
    const { url, props } = usePage();
    const role = props.auth?.user?.role;
    const isPortalAdmin = props.auth?.user?.is_admin;
    const isDiktar = role === 'Diktar';
    const isPenyelenggara = role === 'Penyelenggara';

    const masterItems = [
        {
            name: 'Modul Pembelajaran',
            href: '/admin/master/modul-pembelajaran',
            icon: BookMarked,
        },
        {
            name: 'Modul Soal',
            href: '/admin/master/modul-soal',
            icon: FileText,
        },
        {
            name: 'Bank Soal',
            href: '/admin/master/bank-soal',
            icon: FileQuestion,
        },
        { name: 'Paket Ujian CBT', href: '/admin/cbt/paket-ujian', icon: CheckSquare },
        {
            name: 'Pemateri',
            href: '/admin/master/pemateri',
            icon: UserCheck,
        },
        {
            name: 'Peserta',
            href: '/admin/master/peserta',
            icon: GraduationCap,
        },
        {
            name: 'Jalur Peserta',
            href: '/admin/master/jalur',
            icon: Compass,
        },
        {
            name: 'Legenda & Singkatan',
            href: '/admin/master/jalur?tab=legenda',
            icon: Layers,
        },
    ];

    let menuGroups = [];

    if (isPortalAdmin) {
        menuGroups = [
            {
                title: 'Menu Utama',
                items: [
                    {
                        name: 'Ringkasan',
                        href: '/admin',
                        icon: LayoutDashboard,
                        exact: true,
                    },
                ],
            },
            {
                title: 'Landing Page & Pustaka',
                items: [
                    {
                        name: 'Koleksi Digital',
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
                ],
            },
            {
                title: 'Event Penataran',
                items: [
                    {
                        name: 'Event Penataran',
                        href: '/admin/event',
                        icon: Calendar,
                    },
                    { name: 'Referensi Event', href: '/admin/referensi-event', icon: Layers },
                ],
            },
            {
                title: 'Master Data & CBT',
                items: masterItems,
            },
            {
                title: 'Sistem & Pengaturan',
                items: [
                    { name: 'Pengguna', href: '/admin/pengguna', icon: Users },
                    { name: 'Hak Akses', href: '/admin/hak-akses', icon: ShieldCheck },
                    { name: 'Master Log', href: '/admin/aktivitas', icon: History },
                    { name: 'Pengaturan Portal', href: '/admin/pengaturan', icon: Settings },
                    { name: 'Bantuan Admin', href: '/admin/bantuan', icon: HelpCircle },
                ],
            },
        ];
    } else if (isDiktar) {
        menuGroups = [
            {
                title: 'Menu Utama',
                items: [
                    {
                        name: 'Ringkasan',
                        href: '/admin',
                        icon: LayoutDashboard,
                        exact: true,
                    },
                ],
            },
            {
                title: 'Event Penataran',
                items: [
                    {
                        name: 'Event Penataran',
                        href: '/admin/event',
                        icon: Calendar,
                    },
                    { name: 'Referensi Event', href: '/admin/referensi-event', icon: Layers },
                ],
            },
            {
                title: 'Master Nasional (Diktar)',
                items: masterItems,
            },
        ];
    } else if (isPenyelenggara) {
        menuGroups = [
            {
                title: 'Menu Utama',
                items: [
                    {
                        name: 'Ringkasan',
                        href: '/admin',
                        icon: LayoutDashboard,
                        exact: true,
                    },
                ],
            },
            {
                title: 'Kegiatan Event',
                items: [
                    {
                        name: 'Event Penataran',
                        href: '/admin/event',
                        icon: Calendar,
                    },
                ],
            },
            {
                title: 'Master Data Event & CBT',
                items: masterItems,
            },
        ];
    } else {
        menuGroups = [
            {
                title: 'Menu Utama',
                items: [
                    { name: 'Ringkasan', href: '/admin', icon: LayoutDashboard, exact: true },
                    { name: 'Event Penataran', href: '/admin/event', icon: Calendar },
                ],
            },
        ];
    }

    let brandAvatar = 'PP';
    let brandTitle = 'Pustaka Penataran';
    let brandSubtitle = `${role || 'Admin'} PERKEMI`;

    if (isDiktar) {
        brandAvatar = 'DK';
        brandTitle = 'Diktar PERKEMI';
        brandSubtitle = 'PB PERKEMI';
    } else if (isPenyelenggara) {
        brandAvatar = 'PE';
        brandTitle = 'Penyelenggara';
        brandSubtitle = 'Panitia Event';
    }

    const isActive = (item) => {
        const [itemPath, itemQuery] = item.href.split('?');
        const [currentPath, currentQuery = ''] = url.split('?');

        if (item.exact) {
            return currentPath === itemPath && (! itemQuery || currentQuery === itemQuery);
        }

        if (itemQuery) {
            return currentPath === itemPath && new URLSearchParams(currentQuery).toString() === new URLSearchParams(itemQuery).toString();
        }

        if (currentPath === '/admin/master/jalur' && itemPath === '/admin/master/jalur') {
            return ! new URLSearchParams(currentQuery).has('tab');
        }

        return currentPath.startsWith(itemPath);
    };

    return (
        <aside className="flex h-full min-h-0 flex-col overflow-hidden border-r border-[#0A3F82]/50 bg-[#0E2747] text-white select-none">
            {/* Top Brand Header */}
            <div className="flex min-h-0 flex-1 flex-col">
                <div className="h-16 px-5 flex items-center justify-between border-b border-[#0A3F82]/60">
                    <Link href="/admin" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-lg bg-[#0B63CE] flex items-center justify-center font-bold text-white shadow-md text-sm group-hover:bg-[#0B63CE]/90 transition-colors">
                            {brandAvatar}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-display font-bold text-sm tracking-wide text-white leading-tight">
                                {brandTitle}
                            </span>
                            <span className="text-[10px] text-[#EAF5FF]/70 tracking-wider uppercase font-mono">
                                {brandSubtitle}
                            </span>
                        </div>
                    </Link>

                    {isMobile && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            aria-label="Tutup menu sidebar"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Navigation Links */}
                <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-3 py-2.5" aria-label="Navigasi Admin">
                    {menuGroups.map((group) => (
                        <div key={group.title} className="space-y-0.5">
                            <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-[#EAF5FF]/40">
                                {group.title}
                            </div>
                            {group.items.map((item) => {
                                const active = isActive(item);
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => isMobile && onClose && onClose()}
                                        className={`
                                            group relative flex ${isMobile ? 'min-h-11' : 'min-h-10'} items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white
                                            ${active
                                                ? 'bg-[#0B63CE] text-white shadow-xs font-semibold'
                                                : 'text-white/70 hover:bg-[#0A3F82]/70 hover:text-white'
                                            }
                                        `}
                                    >
                                        <Icon aria-hidden="true" className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-white/60'}`} />
                                        <span className="truncate">{item.name}</span>

                                        {active && (
                                            <span aria-hidden="true" className="absolute right-2 size-1.5 rounded-full bg-white" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>
            </div>

            {/* Bottom Section */}
            <div className="shrink-0 space-y-3 border-t border-[#0A3F82]/60 p-4">
                <a
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-h-11 items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
