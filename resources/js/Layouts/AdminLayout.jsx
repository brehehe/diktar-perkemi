import React, { useEffect, useRef, useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminSidebar from '../Components/admin/AdminSidebar';
import AdminTopbar from '../Components/admin/AdminTopbar';
import Toast from '../Components/ui/Toast';

export default function AdminLayout({ children, title, header }) {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const mobileSidebarRef = useRef(null);

    useEffect(() => {
        if (!mobileSidebarOpen) return;
        const previousFocus = document.activeElement;
        const sidebar = mobileSidebarRef.current;
        const focusable = () => [...sidebar.querySelectorAll('a[href], button:not([disabled]), input:not([disabled])')];
        focusable()[0]?.focus();
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setMobileSidebarOpen(false);
            if (event.key !== 'Tab') return;
            const elements = focusable();
            if (!elements.length) return;
            const first = elements[0];
            const last = elements[elements.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        };
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleKeyDown);
            previousFocus?.focus?.();
        };
    }, [mobileSidebarOpen]);

    return (
        <div className="min-h-screen bg-[#F8FBFF] text-[#112743] flex flex-col font-sans">
            {title && <Head title={title} />}
            <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:px-4 focus:py-3 focus:text-[#0A3F82] focus:outline-2 focus:outline-[#0B63CE]">Lewati ke konten utama</a>

            {/* Global Toast notifications for flash messages */}
            <Toast />

            <div className="flex-1 flex w-full">
                {/* Desktop Sidebar */}
                <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
                    <AdminSidebar />
                </div>

                {/* Mobile Slide-over Drawer Sidebar */}
                {mobileSidebarOpen && (
                    <div className="fixed inset-0 z-50 md:hidden flex" role="dialog" aria-modal="true" aria-label="Navigasi admin">
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-[#0E2747]/60 transition-opacity animate-in fade-in duration-200 motion-reduce:animate-none"
                            onClick={() => setMobileSidebarOpen(false)}
                            aria-hidden="true"
                        />

                        {/* Slide-over panel */}
                        <div ref={mobileSidebarRef} className="relative flex-1 flex flex-col max-w-xs w-full bg-[#0E2747] animate-in slide-in-from-left duration-200 motion-reduce:animate-none shadow-2xl">
                            <AdminSidebar isMobile onClose={() => setMobileSidebarOpen(false)} />
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="md:pl-64 flex flex-col flex-1 min-w-0">
                    <AdminTopbar onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />

                    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-full flex-1 p-4 sm:p-6 md:p-8">
                        {header && <div className="mb-6">{header}</div>}
                        {children}
                    </main>

                    {/* Footer note */}
                    <footer className="py-4 px-6 border-t border-[#DCE7F3] text-center text-xs text-[#6B7C93] bg-white">
                        Pustaka Penataran &copy; {new Date().getFullYear()} Persaudaraan Shorinji Kempo Indonesia (PERKEMI). Seluruh Hak Cipta Dilindungi.
                    </footer>
                </div>
            </div>
        </div>
    );
}
