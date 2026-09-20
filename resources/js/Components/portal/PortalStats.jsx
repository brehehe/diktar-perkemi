import { BookOpen, FolderTree, Users, Clock } from 'lucide-react';

export default function PortalStats({ stats = {}, className = '' }) {
    const items = [
        {
            value: stats.total_materials ?? 0,
            label: 'Materi Terbit',
            sub: 'Buku & modul aktif',
            icon: BookOpen,
        },
        {
            value: stats.total_categories ?? 0,
            label: 'Kategori Aktif',
            sub: 'Bidang pembinaan resmi',
            icon: FolderTree,
        },
        {
            value: stats.total_roles ?? 6,
            label: 'Kelompok Peran',
            sub: 'Peserta hingga wasit',
            icon: Users,
        },
        {
            value: stats.latest_update || 'Terjadwal',
            label: 'Pembaruan Terakhir',
            sub: 'Kurikulum & regulasi',
            icon: Clock,
            isDate: Boolean(stats.latest_update),
        },
    ];

    return (
        <section
            aria-label="Statistik Koleksi Portal"
            className={`border-y border-[#DCE7F3] bg-white py-5 px-4 sm:px-6 lg:px-8 shadow-xs ${className}`}
        >
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#DCE7F3]">
                    {items.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={idx}
                                className={`flex items-center space-x-3.5 ${
                                    idx === 0
                                        ? 'pb-4 md:pb-0 md:pr-6'
                                        : idx === 1
                                        ? 'pb-4 md:pb-0 md:px-6'
                                        : idx === 2
                                        ? 'pt-4 md:pt-0 md:px-6'
                                        : 'pt-4 md:pt-0 md:pl-6'
                                }`}
                            >
                                <div className="w-10 h-10 rounded-lg bg-[#EAF5FF] text-[#0B63CE] flex items-center justify-center shrink-0 border border-[#0B63CE]/15">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-baseline space-x-1.5">
                                        <span className="font-serif font-bold text-xl lg:text-2xl text-[#0E2747] tracking-tight">
                                            {typeof item.value === 'number'
                                                ? item.value.toLocaleString('id-ID')
                                                : item.value}
                                        </span>
                                    </div>
                                    <p className="text-xs font-semibold text-[#112743] truncate">
                                        {item.label}
                                    </p>
                                    <p className="text-[11px] text-[#6B7C93] truncate hidden sm:block">
                                        {item.sub}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
