import React from 'react';
import { FileText, ExternalLink, Video, CheckCircle2 } from 'lucide-react';

const sources = [
    {
        id: 'uploaded_pdf',
        name: 'Upload File PDF',
        tag: 'E-Book / Modul',
        description: 'Unggah berkas PDF dokumen resmi ke penyimpanan privat terenkripsi PERKEMI.',
        icon: FileText,
        color: '#0B63CE',
        badgeBg: '#EAF5FF',
        borderActive: 'border-[#0B63CE]',
        bgActive: 'bg-[#EAF5FF]/50',
    },
    {
        id: 'external_link',
        name: 'Tautan Buku Digital',
        tag: 'Eksternal Resmi',
        description: 'Tautkan buku digital dari repositori daring atau perpustakaan digital eksternal resmi.',
        icon: ExternalLink,
        color: '#EE9B25',
        badgeBg: '#FFF3E6',
        borderActive: 'border-[#EE9B25]',
        bgActive: 'bg-[#FFF3E6]/40',
    },
    {
        id: 'video',
        name: 'Video Pembelajaran',
        tag: 'YouTube / Vimeo',
        description: 'Materi rekaman pembelajaran atau demonstrasi teknik resmi PERKEMI.',
        icon: Video,
        color: '#7957D5',
        badgeBg: '#F3EDFF',
        borderActive: 'border-[#7957D5]',
        bgActive: 'bg-[#F3EDFF]/40',
    },
];

export default function MaterialSourceSelector({
    value = 'uploaded_pdf',
    onChange,
    error,
    disabled = false,
}) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <label className="block text-xs font-bold text-[#0E2747] uppercase tracking-wider">
                        Pilih Sumber Materi
                    </label>
                    <p className="text-xs text-[#6B7C93] mt-0.5">
                        Tentukan bagaimana pembaca mengakses materi pembelajaran ini.
                    </p>
                </div>
                {error && (
                    <span className="text-xs text-[#FA5252] font-semibold">{error}</span>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {sources.map((item) => {
                    const isSelected = value === item.id;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            type="button"
                            disabled={disabled}
                            onClick={() => onChange && onChange(item.id)}
                            className={`
                                relative p-4 rounded-xl text-left border-2 transition-all duration-200 flex flex-col justify-between
                                cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#0B63CE] focus:ring-offset-1
                                ${isSelected
                                    ? `${item.borderActive} ${item.bgActive} shadow-sm`
                                    : 'border-[#DCE7F3] bg-white hover:border-[#BCE0FD] hover:bg-[#F8FBFF]'
                                }
                                ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
                            `}
                        >
                            <div className="space-y-2.5">
                                <div className="flex items-start justify-between">
                                    <div
                                        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                                        style={{
                                            backgroundColor: isSelected ? item.color : '#F0F4F8',
                                            color: isSelected ? '#FFFFFF' : item.color,
                                        }}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </div>

                                    {isSelected ? (
                                        <CheckCircle2
                                            className="w-5 h-5"
                                            style={{ color: item.color }}
                                        />
                                    ) : (
                                        <div className="w-4 h-4 rounded-full border-2 border-[#DCE7F3] group-hover:border-[#9BACC0]" />
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <h4 className="font-semibold text-sm text-[#0E2747]">
                                            {item.name}
                                        </h4>
                                    </div>
                                    <p className="text-xs text-[#6B7C93] mt-1 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-3 mt-3 border-t border-[#DCE7F3]/60 flex items-center justify-between">
                                <span
                                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border"
                                    style={{
                                        backgroundColor: item.badgeBg,
                                        color: item.color,
                                        borderColor: `${item.color}30`,
                                    }}
                                >
                                    {item.tag}
                                </span>
                                <span className="text-[11px] font-medium text-[#0B63CE] opacity-0 group-hover:opacity-100 transition-opacity">
                                    {isSelected ? 'Terpilih' : 'Pilih'}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
