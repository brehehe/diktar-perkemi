import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import PortalHeader from '../Components/portal/PortalHeader';
import PortalFooter from '../Components/portal/PortalFooter';
import MobileNavigationDrawer from '../Components/portal/MobileNavigationDrawer';
import Toast from '../Components/ui/Toast';

export default function PortalLayout({ children, title = '' }) {
    const { props } = usePage();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const pageTitle = title
        ? `${title} — Pustaka Penataran PERKEMI`
        : 'Pustaka Penataran — Portal Buku Digital PERKEMI';

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FBFF] text-[#112743] font-sans antialiased selection:bg-[#EAF5FF] selection:text-[#0B63CE]">
            <Head title={pageTitle} />

            <a href="#portal-main-content" className="skip-link">
                Lewati ke konten utama
            </a>

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
            {props.flash?.info && (
                <Toast
                    message={props.flash.info}
                    type="info"
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
            <main id="portal-main-content" tabIndex={-1} className="flex-1 scroll-mt-20">
                {children}
            </main>

            {/* Portal Footer */}
            <PortalFooter />
        </div>
    );
}
