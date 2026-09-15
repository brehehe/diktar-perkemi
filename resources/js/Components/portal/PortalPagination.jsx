import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PortalPagination({ links = [], className = '' }) {
    if (!links || links.length <= 3) {
        return null; // No need to render pagination for a single page
    }

    const cleanLabel = (label) => {
        if (!label) return '';
        return label
            .replace('&laquo; Previous', '')
            .replace('Previous', '')
            .replace('Next &raquo;', '')
            .replace('Next', '')
            .trim();
    };

    return (
        <nav
            aria-label="Navigasi Halaman Katalog"
            className={`flex items-center justify-center space-x-1.5 py-6 ${className}`}
        >
            {links.map((link, idx) => {
                const isPrevious = idx === 0;
                const isNext = idx === links.length - 1;
                const label = cleanLabel(link.label);

                if (!link.url) {
                    return (
                        <span
                            key={idx}
                            aria-disabled="true"
                            className="inline-flex items-center justify-center min-w-[36px] h-9 px-3 text-xs font-medium text-[#6B7C93]/50 bg-white border border-[#DCE7F3]/70 rounded-md cursor-not-allowed select-none"
                        >
                            {isPrevious ? (
                                <ChevronLeft className="w-4 h-4" />
                            ) : isNext ? (
                                <ChevronRight className="w-4 h-4" />
                            ) : (
                                label || '...'
                            )}
                        </span>
                    );
                }

                return (
                    <Link
                        key={idx}
                        href={link.url}
                        preserveScroll
                        aria-current={link.active ? 'page' : undefined}
                        className={`inline-flex items-center justify-center min-w-[36px] h-9 px-3 text-xs font-semibold rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-[#0B63CE] focus:ring-offset-1 ${
                            link.active
                                ? 'bg-[#0B63CE] border-[#0B63CE] text-white shadow-xs'
                                : 'bg-white border-[#DCE7F3] text-[#112743] hover:bg-[#EAF5FF] hover:text-[#0B63CE] hover:border-[#0B63CE]/30'
                        }`}
                    >
                        {isPrevious ? (
                            <span className="flex items-center space-x-1">
                                <ChevronLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">Sebelumnya</span>
                            </span>
                        ) : isNext ? (
                            <span className="flex items-center space-x-1">
                                <span className="hidden sm:inline">Berikutnya</span>
                                <ChevronRight className="w-4 h-4" />
                            </span>
                        ) : (
                            label
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
