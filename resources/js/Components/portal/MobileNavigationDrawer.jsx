import { useEffect, useRef } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    X,
    BookOpen,
    Home,
    Layers,
    Tag,
    Users,
    Info,
    HelpCircle,
    LogIn,
    LogOut,
    ChevronRight,
    Shield,
    Award,
    Calendar,
} from 'lucide-react';

export default function MobileNavigationDrawer({ isOpen, onClose }) {
    const { url, props } = usePage();
    const user = props.auth?.user;
    const panelRef = useRef(null);

    // Handle Escape key
    useEffect(() => {
        if (!isOpen) return;
        const previousFocus = document.activeElement;
        const focusable = () => panelRef.current
            ? [...panelRef.current.querySelectorAll('a[href], button:not([disabled])')]
            : [];
        focusable()[0]?.focus();
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
            if (e.key === 'Tab') {
                const elements = focusable();
                if (!elements.length) return;
                const first = elements[0];
                const last = elements[elements.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
            previousFocus?.focus?.();
        };
    }, [isOpen, onClose]);

    const navItems = [
        { label: 'Beranda', href: '/', icon: Home, exact: true },
        { label: 'Koleksi Digital', href: '/koleksi', icon: Layers, matchPrefix: '/koleksi' },
        { label: 'Kategori Materi', href: '/kategori', icon: Tag, matchPrefix: '/kategori' },
        ...(user?.role === 'Pemateri' ? [{ label: 'Jadwal & Materi', href: '/pemateri/jadwal', icon: Calendar, matchPrefix: '/pemateri' }] : []),
        ...(user && user?.role !== 'Pemateri' ? [{ label: 'Event Saya', href: '/event-saya', icon: BookOpen, matchPrefixes: ['/event-saya', '/event/'] }] : []),
        ...(user?.role === 'Peserta' ? [{ label: 'Sertifikat', href: '/sertifikat-saya', icon: Award, exact: true }] : []),
        { label: 'Untuk Peran Anda', href: '/untuk', icon: Users, matchPrefix: '/untuk' },
        { label: 'Tentang Portal', href: '/tentang', icon: Info, exact: true },
        { label: 'Pusat Bantuan', href: '/bantuan', icon: HelpCircle, exact: true },
    ];

    const isActive = (item) => {
        const currentPath = url.split('?')[0];

        if (item.exact) {
            return currentPath === item.href;
        }
        if (item.matchPrefixes) {
            return item.matchPrefixes.some((prefix) => currentPath.startsWith(prefix));
        }
        if (item.matchPrefix) {
            return currentPath.startsWith(item.matchPrefix);
        }
        return currentPath === item.href;
    };

    const handleLogout = (e) => {
        e.preventDefault();
        onClose();
        router.post('/logout');
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 overflow-hidden xl:hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-navigation-title"
        >
            <button
                type="button"
                tabIndex={-1}
                className="fixed inset-0 bg-[#0E2747]/60 motion-reduce:transition-none"
                onClick={onClose}
                aria-label="Tutup menu navigasi"
            />

            {/* Drawer Panel */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                <div ref={panelRef} className="flex w-screen max-w-sm flex-col overscroll-contain border-l border-[#DCE7F3] bg-white shadow-2xl">
                    {/* Header Drawer */}
                    <div className="p-4 bg-[#0E2747] text-white flex items-center justify-between border-b border-[#0A3F82]">
                        <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded bg-[#0B63CE] flex items-center justify-center text-white shadow-sm">
                                <BookOpen className="w-4 h-4" aria-hidden="true" />
                            </div>
                            <div>
                                <span id="mobile-navigation-title" className="font-serif font-bold text-base tracking-tight block text-white">
                                    Pustaka Penataran
                                </span>
                                <span className="text-[10px] text-[#EAF5FF]/80 uppercase tracking-wider block font-sans">
                                    Portal Buku Digital PERKEMI
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex size-11 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none"
                            aria-label="Tutup menu navigasi"
                        >
                            <X className="w-5 h-5" aria-hidden="true" />
                        </button>
                    </div>

                    {/* Navigation Items */}
                    <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                        <div className="px-3 py-1.5 mb-2">
                            <span className="text-[11px] font-semibold text-[#6B7C93] uppercase tracking-wider">
                                Menu Utama
                            </span>
                        </div>

                        {navItems.map((item) => {
                            const active = isActive(item);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onClose}
                                    aria-current={active ? 'page' : undefined}
                                    className={`flex min-h-11 items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] motion-reduce:transition-none ${
                                        active
                                            ? 'bg-[#EAF5FF] text-[#0B63CE] font-semibold'
                                            : 'text-[#112743] hover:bg-[#F8FBFF] hover:text-[#0B63CE]'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <Icon
                                            className={`w-4 h-4 ${
                                                active ? 'text-[#0B63CE]' : 'text-[#6B7C93]'
                                            }`}
                                            aria-hidden="true"
                                        />
                                        <span>{item.label}</span>
                                    </div>
                                    <ChevronRight
                                        className={`w-4 h-4 ${
                                            active ? 'text-[#0B63CE]' : 'text-[#DCE7F3]'
                                        }`}
                                        aria-hidden="true"
                                    />
                                </Link>
                            );
                        })}

                        {/* Quick Role Section */}
                        <div className="pt-5 mt-4 border-t border-[#DCE7F3]/70 px-3">
                            <span className="text-[11px] font-semibold text-[#6B7C93] uppercase tracking-wider block mb-2">
                                Akses Berdasarkan Peran
                            </span>
                            <div className="grid grid-cols-2 gap-1.5">
                                {[
                                    { name: 'Peserta', slug: 'peserta' },
                                    { name: 'Pelatih', slug: 'pelatih' },
                                    { name: 'Penguji', slug: 'penguji' },
                                    { name: 'Wasit', slug: 'wasit' },
                                    { name: 'Pemateri', slug: 'pemateri' },
                                    { name: 'Penyelenggara', slug: 'penyelenggara' },
                                ].map((role) => (
                                    <Link
                                        key={role.slug}
                                        href={`/untuk/${role.slug}`}
                                        onClick={onClose}
                                        className="flex min-h-11 items-center justify-between rounded-md border border-[#DCE7F3] bg-[#F8FBFF] px-2.5 py-2 text-xs text-[#112743] transition-[border-color,color] hover:border-[#0B63CE] hover:text-[#0B63CE] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] motion-reduce:transition-none"
                                    >
                                        <span>{role.name}</span>
                                        <span className="text-[10px] text-[#6B7C93]" aria-hidden="true">→</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer User Account */}
                    <div className="p-4 bg-[#F8FBFF] border-t border-[#DCE7F3]">
                        {user ? (
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <div className="w-9 h-9 rounded-full bg-[#0A3F82] text-white flex items-center justify-center text-sm font-semibold">
                                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-[#112743] truncate">
                                            {user.name}
                                        </p>
                                        <p className="text-xs text-[#6B7C93] truncate">
                                            {user.role || 'Anggota PERKEMI'}
                                        </p>
                                    </div>
                                </div>

                                {user.can_manage_events && (
                                    <Link
                                        href="/admin"
                                        onClick={onClose}
                                        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-[#0B63CE]/20 bg-[#EAF5FF] px-3 py-2 text-xs font-semibold text-[#0A3F82] transition-colors hover:bg-[#0B63CE] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] motion-reduce:transition-none"
                                    >
                                        <Shield className="w-3.5 h-3.5" aria-hidden="true" />
                                        <span>Buka Ringkasan {user.role}</span>
                                    </Link>
                                )}

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] motion-reduce:transition-none"
                                >
                                    <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                                    <span>Keluar dari Akun</span>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Link
                                    href="/login"
                                    onClick={onClose}
                                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[#0B63CE] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0A3F82] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] motion-reduce:transition-none"
                                >
                                    <LogIn className="w-4 h-4" aria-hidden="true" />
                                    <span>Masuk Portal</span>
                                </Link>
                                <p className="text-[11px] text-center text-[#6B7C93]">
                                    Belum memiliki akun?{' '}
                                    <Link
                                        href="/register"
                                        onClick={onClose}
                                        className="rounded-sm font-medium text-[#0B63CE] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                                    >
                                        Daftar di sini
                                    </Link>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
