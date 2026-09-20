import { useEffect, useRef, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    ChevronDown,
    LogOut,
    Menu,
    Search,
    Shield,
    X,
} from 'lucide-react';
import Button from '../ui/Button';
import MainNavigation from './MainNavigation';

export default function PortalHeader({ onOpenMobileMenu }) {
    const { props } = usePage();
    const user = props.auth?.user;
    const [isScrolled, setIsScrolled] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [quickSearch, setQuickSearch] = useState('');
    const searchInputRef = useRef(null);
    const searchPanelRef = useRef(null);
    const searchTriggerRef = useRef(null);
    const userMenuRef = useRef(null);
    const userMenuTriggerRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (searchOpen) {
            searchInputRef.current?.focus();
        }
    }, [searchOpen]);

    useEffect(() => {
        const handlePointerDown = (event) => {
            if (searchOpen && !searchPanelRef.current?.contains(event.target)) {
                setSearchOpen(false);
            }

            if (userDropdownOpen && !userMenuRef.current?.contains(event.target)) {
                setUserDropdownOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key !== 'Escape') return;

            if (userDropdownOpen) {
                setUserDropdownOpen(false);
                userMenuTriggerRef.current?.focus();
                return;
            }

            if (searchOpen) {
                setSearchOpen(false);
                searchTriggerRef.current?.focus();
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [searchOpen, userDropdownOpen]);

    const handleLogout = () => {
        setUserDropdownOpen(false);
        router.post('/logout');
    };

    const handleQuickSearch = (event) => {
        event.preventDefault();
        const query = quickSearch.trim();

        if (!query) return;

        setSearchOpen(false);
        router.visit(`/koleksi?search=${encodeURIComponent(query)}`);
    };

    const toggleSearch = () => {
        setUserDropdownOpen(false);
        setSearchOpen((isOpen) => !isOpen);
    };

    const toggleUserMenu = () => {
        setSearchOpen(false);
        setUserDropdownOpen((isOpen) => !isOpen);
    };

    return (
        <>
            <div className="border-b border-[#1A3860] bg-[#0E2747] text-white">
                <div className="mx-auto flex min-h-9 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex min-w-0 items-center gap-2">
                        <span className="size-1.5 shrink-0 rounded-full bg-[#20A47A]" aria-hidden="true" />
                        <span className="truncate text-[11.5px] font-medium tracking-wide text-white/90 sm:text-xs">
                            Portal Pembelajaran Digital PERKEMI
                        </span>
                    </div>

                    <div className="flex shrink-0 items-center gap-3 text-xs text-white/80">
                        <Link
                            href="/bantuan"
                            className="inline-flex min-h-9 items-center rounded-sm px-1 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none"
                        >
                            Bantuan
                        </Link>
                        {!user && (
                            <>
                                <span className="text-white/30" aria-hidden="true">|</span>
                                <Link
                                    href="/login"
                                    className="inline-flex min-h-9 items-center rounded-sm px-1 font-semibold text-white transition-colors hover:text-[#8BC5FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none"
                                >
                                    Masuk
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <header
                className={`sticky top-0 z-30 border-b border-[#DCE7F3] bg-white transition-[box-shadow] duration-200 motion-reduce:transition-none ${
                    isScrolled ? 'shadow-[0_2px_12px_rgba(14,39,71,0.08)]' : 'shadow-none'
                }`}
            >
                <div className="mx-auto flex h-[72px] max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:gap-5 lg:px-8">
                    <Link
                        href="/"
                        aria-label="Pustaka Penataran, kembali ke beranda"
                        className="group flex min-w-0 shrink-0 items-center gap-2.5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B63CE] sm:gap-3"
                    >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#0B63CE] text-white shadow-sm transition-colors duration-150 group-hover:bg-[#0A3F82] motion-reduce:transition-none">
                            <BookOpen className="size-5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                            <span className="block truncate font-serif text-[17px] font-bold leading-tight tracking-tight text-[#0E2747] transition-colors duration-150 group-hover:text-[#0B63CE] motion-reduce:transition-none sm:text-lg">
                                Pustaka Penataran
                            </span>
                            <span className="hidden truncate text-[10px] font-semibold uppercase leading-tight tracking-[0.14em] text-[#6B7C93] sm:block">
                                Portal Buku Digital PERKEMI
                            </span>
                        </span>
                    </Link>

                    <div className="hidden min-w-0 flex-1 items-center justify-center xl:flex">
                        <MainNavigation className="w-full" />
                    </div>

                    <div className="ml-auto flex shrink-0 items-center gap-2">
                        <div ref={searchPanelRef} className="relative hidden xl:block">
                            <button
                                ref={searchTriggerRef}
                                type="button"
                                onClick={toggleSearch}
                                className="inline-flex size-10 items-center justify-center rounded-md text-[#6B7C93] transition-colors hover:bg-[#EAF5FF] hover:text-[#0B63CE] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] motion-reduce:transition-none"
                                aria-label={searchOpen ? 'Tutup pencarian' : 'Buka pencarian koleksi'}
                                aria-expanded={searchOpen}
                                aria-controls="portal-search-panel"
                            >
                                {searchOpen ? <X className="size-[18px]" aria-hidden="true" /> : <Search className="size-[18px]" aria-hidden="true" />}
                            </button>

                            {searchOpen && (
                                <div
                                    id="portal-search-panel"
                                    className="absolute right-0 top-full z-50 mt-3 w-80 rounded-lg border border-[#DCE7F3] bg-white p-4 shadow-[0_12px_32px_rgba(14,39,71,0.14)]"
                                >
                                    <form role="search" onSubmit={handleQuickSearch}>
                                        <label htmlFor="portal-quick-search" className="mb-2 block text-xs font-semibold text-[#112743]">
                                            Cari koleksi digital
                                        </label>
                                        <div className="relative">
                                            <input
                                                ref={searchInputRef}
                                                id="portal-quick-search"
                                                name="search"
                                                type="search"
                                                value={quickSearch}
                                                onChange={(event) => setQuickSearch(event.target.value)}
                                                placeholder="Judul, kode, atau kata kunci…"
                                                autoComplete="off"
                                                className="min-h-11 w-full rounded-md border border-[#DCE7F3] bg-[#F8FBFF] py-2 pl-3 pr-12 text-sm text-[#112743] placeholder:text-[#6B7C93] focus:border-[#0B63CE] focus:outline-none focus:ring-2 focus:ring-[#0B63CE]/20"
                                            />
                                            <button
                                                type="submit"
                                                className="absolute right-1 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-md bg-[#0B63CE] text-white transition-colors hover:bg-[#0A3F82] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] motion-reduce:transition-none"
                                                aria-label="Cari koleksi"
                                            >
                                                <Search className="size-4" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>

                        <div className="hidden items-center gap-2 md:flex">
                            {user ? (
                                <>
                                    {user.can_manage_events && (
                                        <Button
                                            as={Link}
                                            href="/admin"
                                            variant="secondary"
                                            size="sm"
                                            icon={Shield}
                                            className="hidden whitespace-nowrap min-[1360px]:inline-flex"
                                        >
                                            Ringkasan
                                        </Button>
                                    )}

                                    {user.role === 'Pemateri' && (
                                        <Button
                                            as={Link}
                                            href="/pemateri/jadwal"
                                            variant="secondary"
                                            size="sm"
                                            icon={Calendar}
                                            className="hidden whitespace-nowrap min-[1360px]:inline-flex"
                                        >
                                            Jadwal Mengajar
                                        </Button>
                                    )}

                                    <div ref={userMenuRef} className="relative">
                                        <button
                                            ref={userMenuTriggerRef}
                                            type="button"
                                            onClick={toggleUserMenu}
                                            className="flex min-h-10 items-center gap-2 rounded-md border border-[#DCE7F3] bg-[#F8FBFF] px-2 py-1.5 text-left transition-[background-color,border-color] hover:border-[#0B63CE]/50 hover:bg-[#EAF5FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] motion-reduce:transition-none"
                                            aria-label={`Buka menu akun ${user.name}`}
                                            aria-haspopup="true"
                                            aria-expanded={userDropdownOpen}
                                            aria-controls="portal-user-menu"
                                            title={user.name}
                                        >
                                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#0B63CE] text-xs font-bold text-white">
                                                {user.name?.charAt(0).toUpperCase() || 'U'}
                                            </span>
                                            <span className="hidden min-w-0 max-w-[132px] lg:block">
                                                <span className="block truncate text-xs font-semibold leading-tight text-[#112743]">
                                                    {user.name}
                                                </span>
                                                <span className="mt-0.5 block truncate text-[10px] leading-none text-[#6B7C93]">
                                                    {user.role || 'Anggota PERKEMI'}
                                                </span>
                                            </span>
                                            <ChevronDown
                                                className={`size-3.5 shrink-0 text-[#6B7C93] transition-transform duration-150 motion-reduce:transition-none ${userDropdownOpen ? 'rotate-180' : ''}`}
                                                aria-hidden="true"
                                            />
                                        </button>

                                        {userDropdownOpen && (
                                            <div
                                                id="portal-user-menu"
                                                className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-lg border border-[#DCE7F3] bg-white shadow-[0_12px_32px_rgba(14,39,71,0.14)]"
                                            >
                                                <div className="border-b border-[#DCE7F3] px-4 py-3">
                                                    <p className="truncate text-sm font-semibold text-[#0E2747]">{user.name}</p>
                                                    <p className="mt-0.5 truncate text-xs text-[#6B7C93]">{user.email}</p>
                                                    <span className="mt-2 inline-flex rounded-sm border border-[#BCE0FD] bg-[#EAF5FF] px-2 py-0.5 text-[10px] font-semibold text-[#0B63CE]">
                                                        {user.role || 'Anggota PERKEMI'}
                                                    </span>
                                                </div>

                                                {user.can_manage_events && (
                                                    <Link
                                                        href="/admin"
                                                        className="flex min-h-11 items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[#112743] transition-colors hover:bg-[#EAF5FF] hover:text-[#0B63CE] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#0B63CE] motion-reduce:transition-none"
                                                        onClick={() => setUserDropdownOpen(false)}
                                                    >
                                                        <Shield className="size-3.5 text-[#0B63CE]" aria-hidden="true" />
                                                        <span>Ringkasan {user.role}</span>
                                                    </Link>
                                                )}

                                                {user.role === 'Pemateri' && (
                                                    <Link
                                                        href="/pemateri/jadwal"
                                                        className="flex min-h-11 items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[#112743] transition-colors hover:bg-[#EAF5FF] hover:text-[#0B63CE] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#0B63CE] motion-reduce:transition-none"
                                                        onClick={() => setUserDropdownOpen(false)}
                                                    >
                                                        <Calendar className="size-3.5 text-[#0B63CE]" aria-hidden="true" />
                                                        <span>Jadwal & Materi Mengajar</span>
                                                    </Link>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={handleLogout}
                                                    className="flex min-h-11 w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-semibold text-[#C2410C] transition-colors hover:bg-[#FFF3E6] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#0B63CE] motion-reduce:transition-none"
                                                >
                                                    <LogOut className="size-3.5" aria-hidden="true" />
                                                    <span>Keluar Portal</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Button as={Link} href="/login" variant="secondary" size="sm">
                                        Masuk
                                    </Button>
                                    <Button as={Link} href="/register" variant="primary" size="sm">
                                        Daftar Kenshi
                                    </Button>
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={onOpenMobileMenu}
                            className="inline-flex size-11 items-center justify-center rounded-md border border-[#DCE7F3] text-[#112743] transition-colors hover:bg-[#EAF5FF] hover:text-[#0B63CE] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] motion-reduce:transition-none xl:hidden"
                            aria-label="Buka menu navigasi"
                            aria-haspopup="dialog"
                        >
                            <Menu className="size-5" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </header>
        </>
    );
}
