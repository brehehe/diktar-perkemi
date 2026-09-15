import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    BookOpen,
    Menu,
    User,
    LogOut,
    Shield,
    ChevronDown,
    Search,
} from 'lucide-react';
import Button from '../ui/Button';
import MainNavigation from './MainNavigation';

export default function PortalHeader({ onOpenMobileMenu }) {
    const { url, props } = usePage();
    const user = props.auth?.user;
    const [isScrolled, setIsScrolled] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [quickSearch, setQuickSearch] = useState('');
    const searchRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (searchOpen && searchRef.current) {
            searchRef.current.focus();
        }
    }, [searchOpen]);

    const navItems = [
        { label: 'Beranda', href: '/', exact: true },
        { label: 'Koleksi', href: '/koleksi', exact: false },
        { label: 'Kategori', href: '/#kategori', exact: false, isAnchor: true },
        { label: 'Untuk Peran Anda', href: '/#peran', exact: false, isAnchor: true },
        { label: 'Tentang', href: '/tentang', exact: true },
        { label: 'Bantuan', href: '/bantuan', exact: true },
    ];

    const isActive = (item) => {
        if (item.isAnchor) return false;
        if (item.exact) return url === item.href;
        return url.startsWith(item.href);
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    const handleQuickSearch = (e) => {
        e.preventDefault();
        if (quickSearch.trim()) {
            setSearchOpen(false);
            router.visit(`/koleksi?search=${encodeURIComponent(quickSearch.trim())}`);
        }
    };

    return (
        <>
            {/* Top Utility Bar */}
            <div className="bg-[#0E2747] border-b border-[#1A3860] text-white text-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
                    <div className="flex items-center space-x-2 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#20A47A] shrink-0" aria-hidden="true" />
                        <span className="font-medium tracking-wide text-white/90 text-[11.5px] truncate">
                            Portal Pembelajaran Digital PERKEMI
                        </span>
                    </div>
                    <div className="flex items-center space-x-4 text-[11.5px] text-white/80 shrink-0">
                        <Link
                            href="/bantuan"
                            className="hover:text-white transition-colors flex items-center space-x-1"
                        >
                            <span>Bantuan</span>
                        </Link>
                        {!user && (
                            <>
                                <span className="text-white/30" aria-hidden="true">|</span>
                                <Link
                                    href="/login"
                                    className="font-semibold text-white hover:text-[#62B0FF] transition-colors"
                                >
                                    Masuk
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Sticky Header */}
            <header
                className={`sticky top-0 z-30 transition-all duration-200 ${
                    isScrolled
                        ? 'bg-white/98 backdrop-blur-md shadow-xs border-b border-[#DCE7F3]'
                        : 'bg-white border-b border-[#DCE7F3]'
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
                    {/* Brand Wordmark */}
                    <Link href="/" className="flex items-center gap-3 group shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-[#0B63CE] text-white flex items-center justify-center shadow-xs group-hover:bg-[#0A3F82] transition-colors duration-200">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-serif text-[18px] font-bold tracking-tight text-[#0E2747] leading-tight group-hover:text-[#0B63CE] transition-colors duration-200">
                                Pustaka Penataran
                            </span>
                            <span className="text-[10px] font-semibold text-[#6B7C93] tracking-[0.14em] uppercase leading-tight font-sans">
                                Portal Buku Digital PERKEMI
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center">
                        <MainNavigation />
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Desktop quick search */}
                        <div className="hidden sm:block relative">
                            {searchOpen ? (
                                <form onSubmit={handleQuickSearch} className="flex items-center">
                                    <input
                                        ref={searchRef}
                                        type="text"
                                        value={quickSearch}
                                        onChange={(e) => setQuickSearch(e.target.value)}
                                        onBlur={() => {
                                            if (!quickSearch.trim()) setSearchOpen(false);
                                        }}
                                        placeholder="Cari koleksi..."
                                        className="w-44 lg:w-56 bg-[#F8FBFF] border border-[#DCE7F3] focus:border-[#0B63CE] rounded-lg pl-3 pr-10 py-2 text-xs text-[#112743] placeholder-[#6B7C93] focus:outline-none focus:ring-2 focus:ring-[#0B63CE]/15 transition-all"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#0B63CE]"
                                    >
                                        <Search className="w-4 h-4" />
                                    </button>
                                </form>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setSearchOpen(true)}
                                    className="p-2 rounded-lg text-[#6B7C93] hover:text-[#0B63CE] hover:bg-[#EAF5FF] transition-colors"
                                    aria-label="Buka Pencarian"
                                >
                                    <Search className="w-[18px] h-[18px]" />
                                </button>
                            )}
                        </div>

                        {/* User Actions */}
                        <div className="hidden sm:flex items-center gap-2">
                            {user ? (
                                <div className="flex items-center gap-2">
                                    {user.is_admin && (
                                        <Link href="/admin">
                                            <Button variant="secondary" size="xs" icon={Shield}>
                                                Admin
                                            </Button>
                                        </Link>
                                    )}

                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                            className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg border border-[#DCE7F3] hover:border-[#0B63CE]/50 bg-[#F8FBFF] hover:bg-[#EAF5FF] transition-all text-left"
                                            aria-expanded={userDropdownOpen}
                                        >
                                            <div className="w-7 h-7 rounded-full bg-[#0B63CE] text-white flex items-center justify-center font-bold text-xs shrink-0">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="hidden md:block min-w-0 max-w-[110px]">
                                                <p className="text-xs font-semibold text-[#112743] truncate leading-tight">
                                                    {user.name}
                                                </p>
                                                <p className="text-[10px] text-[#6B7C93] leading-none mt-0.5">
                                                    {user.role}
                                                </p>
                                            </div>
                                            <ChevronDown className={`w-3.5 h-3.5 text-[#6B7C93] transition-transform duration-150 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {userDropdownOpen && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-40"
                                                    onClick={() => setUserDropdownOpen(false)}
                                                />
                                                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-[#DCE7F3] py-1.5 z-50">
                                                    <div className="px-4 py-3 border-b border-[#DCE7F3]">
                                                        <p className="text-xs font-bold text-[#0E2747] truncate">{user.name}</p>
                                                        <p className="text-[11px] text-[#6B7C93] truncate mt-0.5">{user.email}</p>
                                                        <span className="inline-block mt-1.5 text-[10px] font-bold text-[#0B63CE] bg-[#EAF5FF] px-2 py-0.5 rounded border border-[#BCE0FD]">
                                                            {user.role}
                                                        </span>
                                                    </div>

                                                    {user.is_admin && (
                                                        <Link
                                                            href="/admin"
                                                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[#112743] hover:bg-[#EAF5FF] hover:text-[#0B63CE] transition-colors"
                                                            onClick={() => setUserDropdownOpen(false)}
                                                        >
                                                            <Shield className="w-3.5 h-3.5 text-[#0B63CE]" />
                                                            <span>Dashboard Admin</span>
                                                        </Link>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={handleLogout}
                                                        className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[#E8590C] hover:bg-[#FFF3E6] transition-colors"
                                                    >
                                                        <LogOut className="w-3.5 h-3.5" />
                                                        <span>Keluar Portal</span>
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link href="/login">
                                        <Button variant="secondary" size="sm">
                                            Masuk
                                        </Button>
                                    </Link>
                                    <Link href="/register">
                                        <Button variant="primary" size="sm">
                                            Daftar Kenshi
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            type="button"
                            onClick={onOpenMobileMenu}
                            className="lg:hidden p-2 rounded-lg text-[#112743] hover:bg-[#EAF5FF] hover:text-[#0B63CE] transition-colors border border-[#DCE7F3]"
                            aria-label="Buka Menu Navigasi"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>
        </>
    );
}
