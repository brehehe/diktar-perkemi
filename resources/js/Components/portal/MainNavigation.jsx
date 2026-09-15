import { Link, usePage } from '@inertiajs/react';

export default function MainNavigation({ className = '' }) {
    const { url } = usePage();

    const navItems = [
        { label: 'Beranda', href: '/', exact: true },
        { label: 'Koleksi', href: '/koleksi', matchPrefix: '/koleksi' },
        { label: 'Kategori', href: '/kategori', matchPrefix: '/kategori' },
        { label: 'Untuk Peran Anda', href: '/untuk', matchPrefix: '/untuk' },
        { label: 'Tentang', href: '/tentang', exact: true },
        { label: 'Bantuan', href: '/bantuan', exact: true },
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

    return (
        <nav
            aria-label="Navigasi Utama Portal"
            className={`flex items-center space-x-1 lg:space-x-2 ${className}`}
        >
            {navItems.map((item) => {
                const active = isActive(item);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={`relative px-3 py-2 text-[13.5px] font-medium tracking-normal transition-all duration-150 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#0B63CE] focus:ring-offset-2 ${
                            active
                                ? 'text-[#0B63CE] font-semibold'
                                : 'text-[#112743]/80 hover:text-[#0B63CE] hover:bg-[#F8FBFF]'
                        }`}
                    >
                        {item.label}
                        {active && (
                            <span
                                className="absolute bottom-0 left-3 right-3 h-[2.5px] bg-[#0B63CE] rounded-full"
                                aria-hidden="true"
                            />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
