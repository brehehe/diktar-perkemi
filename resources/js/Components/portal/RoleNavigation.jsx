import React from 'react';
import { Link } from '@inertiajs/react';
import { Users, ArrowRight, Award, Shield, UserCheck, Mic, Calendar, BookmarkCheck } from 'lucide-react';

const roleConfig = {
    peserta: {
        Icon: BookmarkCheck,
        color: '#0B63CE',
        bg: '#EAF5FF',
        border: '#BCE0FD',
    },
    pelatih: {
        Icon: Award,
        color: '#E8590C',
        bg: '#FFF3E6',
        border: '#FFD8A8',
    },
    penguji: {
        Icon: UserCheck,
        color: '#1098AD',
        bg: '#E3FAFC',
        border: '#99E9F2',
    },
    wasit: {
        Icon: Shield,
        color: '#7B5BF0',
        bg: '#F3EDFF',
        border: '#D0BFFF',
    },
    pemateri: {
        Icon: Mic,
        color: '#0E9F6E',
        bg: '#F0FDF4',
        border: '#B2F2BB',
    },
    penyelenggara: {
        Icon: Calendar,
        color: '#0A3F82',
        bg: '#EAF5FF',
        border: '#BCE0FD',
    },
};

const defaultConfig = {
    Icon: Users,
    color: '#6B7C93',
    bg: '#F8FBFF',
    border: '#DCE7F3',
};

export default function RoleNavigation({ roles = [] }) {
    if (!roles || roles.length === 0) return null;

    return (
        <section id="peran" className="space-y-6">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b-2 border-[#DCE7F3] pb-4">
                <div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0B63CE] uppercase tracking-[0.12em] mb-1.5">
                        <Users className="w-3.5 h-3.5" />
                        Jalur Kompetensi
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0E2747]">
                        Materi Khusus Peran Anda
                    </h2>
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                    <Link
                        href="/untuk"
                        className="text-xs font-semibold text-[#0B63CE] hover:text-[#0A3F82] inline-flex items-center gap-1.5 transition-colors group"
                    >
                        <span>Lihat Semua Peran</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-150" />
                    </Link>
                </div>
            </div>

            {/* 2-column grid for more content width per card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {roles.map((role) => {
                    const slug = role.slug || role.code;
                    const config = roleConfig[slug] || defaultConfig;
                    const { Icon, color, bg, border } = config;

                    return (
                        <Link
                            key={role.id}
                            href={`/untuk/${slug}`}
                            className="group bg-white rounded-2xl border border-[#DCE7F3] hover:border-transparent hover:shadow-lg transition-all duration-200 p-5 flex items-start justify-between gap-5 overflow-hidden relative"
                        >
                            {/* Background tint on hover */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                style={{ backgroundColor: `${color}05` }}
                            />

                            <div className="flex items-start gap-4 min-w-0 relative z-10">
                                {/* Icon Container — larger */}
                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-200 border"
                                    style={{
                                        backgroundColor: bg,
                                        borderColor: border,
                                        color: color,
                                    }}
                                >
                                    <Icon className="w-6 h-6" />
                                </div>

                                <div className="min-w-0 pt-0.5">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <h3
                                            className="font-serif text-[15px] font-bold text-[#112743] transition-colors leading-snug"
                                            style={{}}
                                        >
                                            {role.name}
                                        </h3>
                                        <span
                                            className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded"
                                            style={{
                                                backgroundColor: bg,
                                                color: color,
                                                border: `1px solid ${border}`,
                                            }}
                                        >
                                            {role.materials_count} Modul
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#6B7C93] line-clamp-2 leading-relaxed">
                                        {role.description || `Kumpulan bahan ajar dan referensi penataran untuk ${role.name} PERKEMI.`}
                                    </p>
                                </div>
                            </div>

                            <div className="shrink-0 self-center relative z-10">
                                <span
                                    className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#F8FBFF] border border-[#DCE7F3] transition-all duration-200"
                                    style={{}}
                                >
                                    <ArrowRight className="w-4 h-4 text-[#6B7C93] group-hover:text-[#0B63CE] group-hover:translate-x-0.5 transition-all duration-150" />
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
