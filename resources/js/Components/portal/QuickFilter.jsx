import { router } from '@inertiajs/react';
import { BookOpen, Presentation, Scale, Award, FileText } from 'lucide-react';

export default function QuickFilter({ className = '', onSelect = null, align = 'center' }) {
    const filters = [
        {
            label: 'Modul Penataran',
            query: { type: 'module' },
            icon: BookOpen,
            color: '#0B63CE',
        },
        {
            label: 'Bahan Ajar',
            query: { type: 'speaker_material' },
            icon: Presentation,
            color: '#7957D5',
        },
        {
            label: 'Referensi Wasit',
            query: { search: 'wasit' },
            icon: Scale,
            color: '#EE9B25',
        },
        {
            label: 'Materi Pelatih',
            query: { search: 'pelatih' },
            icon: Award,
            color: '#20A47A',
        },
        {
            label: 'Pedoman Penguji',
            query: { search: 'penguji' },
            icon: FileText,
            color: '#DD4D7C',
        },
    ];

    const handleClick = (filter) => {
        if (onSelect) {
            onSelect(filter);
            return;
        }

        const params = new URLSearchParams();
        Object.entries(filter.query).forEach(([key, val]) => {
            if (val) params.set(key, val);
        });

        router.get(`/koleksi?${params.toString()}`);
    };

    const justifyClass = align === 'left' ? 'justify-start' : 'justify-center';

    return (
        <div className={`flex flex-wrap items-center ${justifyClass} gap-2 ${className}`}>
            <span className="text-[11px] font-bold text-[#6B7C93] uppercase tracking-wider shrink-0 mr-1">
                Pencarian Cepat:
            </span>
            {filters.map((f) => {
                const Icon = f.icon;
                return (
                    <button
                        key={f.label}
                        type="button"
                        onClick={() => handleClick(f)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-[#112743] border border-[#DCE7F3] hover:border-[#0B63CE] hover:text-[#0B63CE] hover:bg-[#EAF5FF]/50 shadow-2xs transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0B63CE] focus:ring-offset-1"
                    >
                        <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: f.color }} />
                        <span>{f.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
