import { Head, Link } from '@inertiajs/react';
import PortalLayout from '../../../Layouts/PortalLayout';
import {
    Users,
    ArrowRight,
    Award,
    Shield,
    UserCheck,
    Mic,
    Calendar,
    BookmarkCheck,
    BookOpen,
} from 'lucide-react';

const roleIcons = {
    peserta: BookmarkCheck,
    pelatih: Award,
    penguji: UserCheck,
    wasit: Shield,
    pemateri: Mic,
    penyelenggara: Calendar,
};

export default function RolesIndex({ roles = [], total_roles = 6 }) {
    return (
        <PortalLayout title="Untuk Peran Anda">
            <Head title="Katalog Berdasarkan Peran — Pustaka Penataran PERKEMI" />

            {/* Header Banner */}
            <div className="bg-[#0E2747] text-white border-b-2 border-[#0B63CE] py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-3xl space-y-3">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-white border border-white/15 text-xs font-semibold">
                            <Users className="w-3.5 h-3.5 text-[#62B0FF]" />
                            <span>Jalur Belajar & Kompetensi Kenshi</span>
                        </div>
                        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                            Materi Berdasarkan Peran Anda
                        </h1>
                        <p className="text-sm sm:text-base text-[#EAF5FF]/80 leading-relaxed max-w-2xl">
                            Temukan kurikulum, pedoman teknis, bahan ajar, dan instrumen evaluasi yang dirancang khusus
                            untuk mendukung tanggung jawab dan pengembangan kenshi di setiap jenjang penataran.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
                {/* Roles Table / Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roles.map((r) => {
                        const Icon = roleIcons[r.slug] || Users;
                        const roleColor = r.color || '#0B63CE';

                        return (
                            <div
                                key={r.id || r.slug}
                                className="bg-white rounded-xl border border-[#DCE7F3] hover:border-[#0B63CE]/50 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group"
                                style={{ borderTop: `4px solid ${roleColor}` }}
                            >
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
                                            style={{
                                                backgroundColor: `${roleColor}15`,
                                                borderColor: `${roleColor}30`,
                                                color: roleColor,
                                            }}
                                        >
                                            <Icon className="w-6 h-6" />
                                        </div>

                                        <span
                                            className="font-mono text-xs font-bold px-2.5 py-1 rounded-full border"
                                            style={{
                                                backgroundColor: `${roleColor}10`,
                                                borderColor: `${roleColor}30`,
                                                color: roleColor,
                                            }}
                                        >
                                            {r.materials_count || 0} Materi
                                        </span>
                                    </div>

                                    <div>
                                        <h2 className="font-serif text-xl font-bold text-[#0E2747] group-hover:text-[#0B63CE] transition-colors leading-snug">
                                            <Link href={`/untuk/${r.slug}`}>
                                                {r.name}
                                            </Link>
                                        </h2>

                                        {/* Kebutuhan Utama Badge */}
                                        <div className="mt-2.5 p-3 rounded-lg bg-[#F8FBFF] border border-[#DCE7F3]">
                                            <span className="text-[10.5px] font-semibold text-[#6B7C93] uppercase tracking-wider block mb-1">
                                                Fokus Kebutuhan Belajar:
                                            </span>
                                            <p className="text-xs font-semibold text-[#0E2747] leading-snug">
                                                {r.learning_needs}
                                            </p>
                                        </div>

                                        <p className="text-xs text-[#6B7C93] mt-3 leading-relaxed line-clamp-2">
                                            {r.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="px-6 py-3.5 bg-[#F8FBFF] border-t border-[#DCE7F3] flex items-center justify-between">
                                    <span className="text-xs text-[#6B7C93] font-medium flex items-center space-x-1.5">
                                        <BookOpen className="w-3.5 h-3.5 text-[#0B63CE]" />
                                        <span>Kurikulum Resmi</span>
                                    </span>

                                    <Link
                                        href={`/untuk/${r.slug}`}
                                        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#0B63CE] hover:text-[#0A3F82] transition-colors"
                                    >
                                        <span>Buka Jalur Peran</span>
                                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </PortalLayout>
    );
}
