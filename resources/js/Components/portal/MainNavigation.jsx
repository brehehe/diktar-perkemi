import { Link, usePage } from '@inertiajs/react';

export default function MainNavigation({ className = '' }) {
    const { url, props } = usePage();

    const navItems = [
        { label: 'Beranda', href: '/', exact: true },
        { label: 'Koleksi', href: '/koleksi', matchPrefix: '/koleksi' },
        { label: 'Kategori', href: '/kategori', matchPrefix: '/kategori' },
        ...(props.auth?.user?.role === 'Pemateri' ? [{ label: 'Jadwal & Materi', href: '/pemateri/jadwal', matchPrefix: '/pemateri' }] : []),
        ...(props.auth?.user && props.auth?.user?.role !== 'Pemateri' ? [{ label: 'Event Saya', href: '/event-saya', matchPrefixes: ['/event-saya', '/event/'] }] : []),
        ...(props.auth?.user?.role === 'Peserta' ? [{ label: 'Dokumen', href: '/sertifikat-saya', exact: true }] : []),
        { label: 'Untuk Peran Anda', href: '/untuk', matchPrefix: '/untuk' },
        { label: 'Tentang', href: '/tentang', exact: true },
        { label: 'Bantuan', href: '/bantuan', exact: true },
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

    return (
        <nav
            aria-label="Navigasi Utama Portal"
            className={`flex min-w-0 items-center justify-center gap-0.5 2xl:gap-1 ${className}`}
        >
            {navItems.map((item) => {
                const active = isActive(item);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={`relative shrink-0 whitespace-nowrap rounded-sm px-2.5 py-2.5 text-[13px] font-medium tracking-normal transition-[background-color,color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] motion-reduce:transition-none 2xl:px-3 2xl:text-[13.5px] ${
                            active
                                ? 'text-[#0B63CE] font-semibold'
                                : 'text-[#112743]/80 hover:text-[#0B63CE] hover:bg-[#F8FBFF]'
                        }`}
                    >
                        {item.label}
                        {active && (
                            <span
                                className="absolute bottom-0.5 left-2.5 right-2.5 h-0.5 rounded-full bg-[#0B63CE] 2xl:left-3 2xl:right-3"
                                aria-hidden="true"
                            />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
