import { useEffect } from 'react';
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
    User,
    ChevronRight,
    Shield,
} from 'lucide-react';

export default function MobileNavigationDrawer({ isOpen, onClose }) {
    const { url, props } = usePage();
    const user = props.auth?.user;

    // Handle Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    const navItems = [
        { label: 'Beranda', href: '/', icon: Home, exact: true },
        { label: 'Koleksi Digital', href: '/koleksi', icon: Layers, matchPrefix: '/koleksi' },
        { label: 'Kategori Materi', href: '/kategori', icon: Tag, matchPrefix: '/kategori' },
        { label: 'Untuk Peran Anda', href: '/untuk', icon: Users, matchPrefix: '/untuk' },
        { label: 'Tentang Portal', href: '/tentang', icon: Info, exact: true },
        { label: 'Pusat Bantuan', href: '/bantuan', icon: HelpCircle, exact: true },
    ];

    const isActive = (item) => {
        if (item.exact) {
            return url === item.href;
        }
        if (item.matchPrefix) {
            return url.startsWith(item.matchPrefix);
        }
        return url === item.href;
    };

    const handleLogout = (e) => {
        e.preventDefault();
        onClose();
        router.post('/logout');
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 overflow-hidden lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu Navigasi Mobile"
        >
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-[#0E2747]/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer Panel */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                <div className="w-screen max-w-sm bg-white shadow-2xl flex flex-col border-l border-[#DCE7F3]">
                    {/* Header Drawer */}
                    <div className="p-4 bg-[#0E2747] text-white flex items-center justify-between border-b border-[#0A3F82]">
                        <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded bg-[#0B63CE] flex items-center justify-center text-white shadow-sm">
                                <BookOpen className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="font-serif font-bold text-base tracking-tight block text-white">
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
                            className="p-1.5 rounded-md text-white/80 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white transition"
                            aria-label="Tutup menu navigasi"
                        >
                            <X className="w-5 h-5" />
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
                                    className={`flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
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
                                        />
                                        <span>{item.label}</span>
                                    </div>
                                    <ChevronRight
                                        className={`w-4 h-4 ${
                                            active ? 'text-[#0B63CE]' : 'text-[#DCE7F3]'
                                        }`}
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
                                        className="text-xs px-2.5 py-1.5 rounded bg-[#F8FBFF] border border-[#DCE7F3] text-[#112743] hover:border-[#0B63CE] hover:text-[#0B63CE] transition-colors flex items-center justify-between"
                                    >
                                        <span>{role.name}</span>
                                        <span className="text-[10px] text-[#6B7C93]">→</span>
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

                                {user.role === 'Admin' && (
                                    <Link
                                        href="/admin"
                                        onClick={onClose}
                                        className="w-full flex items-center justify-center space-x-2 py-2 px-3 text-xs font-semibold rounded bg-[#EAF5FF] text-[#0A3F82] border border-[#0B63CE]/20 hover:bg-[#0B63CE] hover:text-white transition"
                                    >
                                        <Shield className="w-3.5 h-3.5" />
                                        <span>Buka Admin Dashboard</span>
                                    </Link>
                                )}

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center space-x-2 py-2 px-3 text-xs font-medium rounded text-red-600 bg-red-50 hover:bg-red-100 transition"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    <span>Keluar dari Akun</span>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Link
                                    href="/login"
                                    onClick={onClose}
                                    className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-md text-sm font-semibold text-white bg-[#0B63CE] hover:bg-[#0A3F82] shadow-sm transition"
                                >
                                    <LogIn className="w-4 h-4" />
                                    <span>Masuk Portal</span>
                                </Link>
                                <p className="text-[11px] text-center text-[#6B7C93]">
                                    Belum memiliki akun?{' '}
                                    <Link
                                        href="/register"
                                        onClick={onClose}
                                        className="text-[#0B63CE] font-medium hover:underline"
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
