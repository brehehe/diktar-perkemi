import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminSidebar from '../Components/admin/AdminSidebar';
import AdminTopbar from '../Components/admin/AdminTopbar';
import Toast from '../Components/ui/Toast';

export default function AdminLayout({ children, title }) {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#F8FBFF] text-[#112743] flex flex-col font-sans">
            {title && <Head title={title} />}

            {/* Global Toast notifications for flash messages */}
            <Toast />

            <div className="flex-1 flex w-full">
                {/* Desktop Sidebar */}
                <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
                    <AdminSidebar />
                </div>

                {/* Mobile Slide-over Drawer Sidebar */}
                {mobileSidebarOpen && (
                    <div className="fixed inset-0 z-50 md:hidden flex" role="dialog" aria-modal="true">
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-[#0E2747]/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
                            onClick={() => setMobileSidebarOpen(false)}
                            aria-hidden="true"
                        />

                        {/* Slide-over panel */}
                        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#0E2747] animate-in slide-in-from-left duration-200 shadow-2xl">
                            <AdminSidebar isMobile onClose={() => setMobileSidebarOpen(false)} />
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="md:pl-64 flex flex-col flex-1 min-w-0">
                    <AdminTopbar onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />

                    <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
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
