import React from 'react';
import { usePage, router } from '@inertiajs/react';
import { Menu, LogOut, User as UserIcon, Shield } from 'lucide-react';
import DropdownMenu from '../ui/DropdownMenu';

export default function AdminTopbar({ onOpenMobileSidebar }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const handleLogout = () => {
        router.post('/logout');
    };

    const userMenuItems = [
        {
            label: `Masuk sebagai ${user?.role || 'Admin'}`,
            disabled: true,
            icon: Shield,
        },
        {
            divider: true,
        },
        {
            label: 'Keluar Portal',
            onClick: handleLogout,
            icon: LogOut,
            variant: 'danger',
        },
    ];

    return (
        <header className="h-16 bg-white border-b border-[#DCE7F3] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
            {/* Left: Mobile Toggle & Context */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onOpenMobileSidebar}
                    aria-label="Buka menu navigasi"
                    className="md:hidden inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[#6B7C93] hover:text-[#112743] hover:bg-[#EAF5FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <div className="hidden sm:flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#20A47A]" />
                    <span className="text-xs text-[#6B7C93] font-medium">
                        Portal Perkemi Online
                    </span>
                </div>
            </div>

            {/* Right: User Menu */}
            <div className="flex items-center gap-3">
                <DropdownMenu
                    trigger={
                        <button
                            type="button"
                            className="flex min-h-11 items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#F8FBFF] border border-transparent hover:border-[#DCE7F3] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                            aria-label="Menu pengguna"
                        >
                            <div className="w-8 h-8 rounded-full bg-[#EAF5FF] text-[#0B63CE] font-bold flex items-center justify-center text-xs border border-[#0B63CE]/20">
                                {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                            </div>
                            <div className="hidden md:flex flex-col text-left">
                                <span className="text-xs font-semibold text-[#112743] leading-tight">
                                    {user?.name || 'Administrator'}
                                </span>
                                <span className="text-[10px] text-[#6B7C93] leading-tight">
                                    {user?.role || 'Admin'}
                                </span>
                            </div>
                        </button>
                    }
                    items={userMenuItems}
                    align="right"
                />
            </div>
        </header>
    );
}
