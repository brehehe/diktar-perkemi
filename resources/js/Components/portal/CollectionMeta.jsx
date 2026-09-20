import {
    Tag,
    Hash,
    User,
    Calendar,
    FileText,
    HardDrive,
    GitBranch,
    Shield,
    Sparkles,
} from 'lucide-react';

export default function CollectionMeta({ material = {}, className = '' }) {
    const metaRows = [
        {
            icon: Tag,
            label: 'Kategori Utama',
            value: material.category?.name || 'Umum',
            color: material.category?.color || '#0B63CE',
        },
        {
            icon: Hash,
            label: 'Kode Koleksi',
            value: material.code || 'PERKEMI-DOC',
            isMono: true,
        },
        {
            icon: User,
            label: 'Penyusun / Pemateri',
            value: material.author || 'Pengurus Besar PERKEMI',
        },
        {
            icon: Calendar,
            label: 'Tahun Publikasi',
            value: material.publication_year ? `${material.publication_year}` : 'Resmi',
        },
        {
            icon: FileText,
            label: 'Format & Halaman',
            value: `${material.type_label || 'Buku Digital'} • ${
                material.page_count ? `${material.page_count} Hal` : 'Dokumen PDF'
            }`,
        },
        {
            icon: HardDrive,
            label: 'Ukuran Berkas',
            value: material.active_file?.formatted_size || material.file_size || 'Standar PDF',
        },
        {
            icon: GitBranch,
            label: 'Versi Terbitan',
            value: material.active_file?.version ? `v${material.active_file.version}.0` : 'v1.0 (Aktif)',
            isMono: true,
        },
    ];

    const audiences = material.audiences || [];
    const keywords = material.keywords
        ? material.keywords.split(',').map((k) => k.trim()).filter(Boolean)
        : [];

    return (
        <div
            className={`bg-white border border-[#DCE7F3] rounded-lg p-5 lg:p-6 shadow-xs ${className}`}
        >
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6B7C93] mb-4 flex items-center space-x-2">
                <Shield className="w-3.5 h-3.5 text-[#0B63CE]" />
                <span>Metadata Dokumen Resmi</span>
            </h2>

            {/* Grid Metadata */}
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6 text-sm border-b border-[#DCE7F3] pb-5">
                {metaRows.map((row, idx) => {
                    const Icon = row.icon;
                    return (
                        <div key={idx} className="flex items-start space-x-2.5">
                            <Icon className="w-4 h-4 text-[#6B7C93] mt-0.5 shrink-0" />
                            <div className="min-w-0 flex-1">
                                <dt className="text-[11.5px] font-medium text-[#6B7C93]">
                                    {row.label}
                                </dt>
                                <dd
                                    className={`text-sm text-[#112743] font-medium truncate ${
                                        row.isMono ? 'font-mono text-xs text-[#0A3F82]' : ''
                                    }`}
                                >
                                    {row.value}
                                </dd>
                            </div>
                        </div>
                    );
                })}
            </dl>

            {/* Audience Roles */}
            <div className="pt-4 border-b border-[#DCE7F3] pb-4">
                <span className="text-[11.5px] font-medium text-[#6B7C93] block mb-2">
                    Peruntukan Akses Kenshi:
                </span>
                {audiences.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                        {audiences.map((aud) => (
                            <span
                                key={aud.id || aud.code}
                                className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-[#EAF5FF] text-[#0A3F82] border border-[#0B63CE]/20"
                            >
                                {aud.name}
                            </span>
                        ))}
                    </div>
                ) : (
                    <span className="text-xs text-[#112743] font-medium">
                        Terbuka untuk seluruh kenshi terdaftar
                    </span>
                )}
            </div>

            {/* Keywords */}
            {keywords.length > 0 && (
                <div className="pt-4">
                    <span className="text-[11.5px] font-medium text-[#6B7C93] block mb-2 flex items-center space-x-1.5">
                        <Sparkles className="w-3 h-3 text-[#EE9B25]" />
                        <span>Kata Kunci Pengindeksan:</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                        {keywords.map((kw, i) => (
                            <span
                                key={i}
                                className="inline-block px-2 py-0.5 rounded text-[11px] font-mono bg-[#F8FBFF] text-[#6B7C93] border border-[#DCE7F3]"
                            >
                                #{kw}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
