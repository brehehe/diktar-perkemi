import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import PortalHeader from '../Components/portal/PortalHeader';
import PortalFooter from '../Components/portal/PortalFooter';
import MobileNavigationDrawer from '../Components/portal/MobileNavigationDrawer';
import Toast from '../Components/ui/Toast';

export default function PortalLayout({ children, title = '' }) {
    const { url, props } = usePage();
    const user = props.auth?.user;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [quickSearch, setQuickSearch] = useState('');

    const pageTitle = title
        ? `${title} — Pustaka Penataran PERKEMI`
        : 'Pustaka Penataran — Portal Buku Digital PERKEMI';

    const navItems = [
        { label: 'Beranda', href: '/', icon: null },
        { label: 'Koleksi', href: '/koleksi', icon: null },
        { label: 'Kategori', href: '/#kategori', icon: null },
        { label: 'Untuk Peran Anda', href: '/#peran', icon: null },
        { label: 'Tentang', href: '/tentang', icon: null },
        { label: 'Bantuan', href: '/bantuan', icon: null },
    ];

    const isNavActive = (href) => {
        if (href.includes('#')) return false;
        if (href === '/') return url === '/';
        return url.startsWith(href);
    };

    const handleQuickSearchSubmit = (e) => {
        e.preventDefault();
        if (quickSearch.trim()) {
            setMobileMenuOpen(false);
            router.visit(`/koleksi?search=${encodeURIComponent(quickSearch.trim())}`);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FBFF] text-[#112743] font-sans antialiased selection:bg-[#EAF5FF] selection:text-[#0B63CE]">
            <Head title={pageTitle} />

            {/* Flash Notifications */}
            {props.flash?.success && (
                <Toast
                    message={props.flash.success}
                    type="success"
                    onClose={() => {}}
                />
            )}
            {props.flash?.error && (
                <Toast
                    message={props.flash.error}
                    type="error"
                    onClose={() => {}}
                />
            )}

            {/* Main Header */}
            <PortalHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />

            {/* Mobile Navigation Drawer */}
            <MobileNavigationDrawer
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
            />

            {/* Page Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Portal Footer */}
            <PortalFooter />
        </div>
    );
}
