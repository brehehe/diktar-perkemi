import React from 'react';
import { X, BookOpen, Calendar, FileText, User, Download, ExternalLink, Sparkles, Layers } from 'lucide-react';
import { Link } from '@inertiajs/react';
import Badge from '../ui/Badge';

export default function ReaderSidebar({
    isOpen,
    onClose,
    material,
    fileInfo,
    canDownload = false,
    downloadUrl = null,
    relatedMaterials = [],
}) {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop for mobile */}
            <div
                onClick={onClose}
                className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-xs transition-opacity"
                aria-hidden="true"
            />

            {/* Sidebar / Drawer Container */}
            <aside
                className={`
                    fixed lg:static top-0 right-0 h-full w-[340px] sm:w-[380px] bg-white border-l border-[#DCE7F3]
                    z-40 flex flex-col shrink-0 shadow-xl lg:shadow-none overflow-hidden transition-transform duration-200
                `}
            >
                {/* Drawer Header */}
                <div className="h-16 px-5 border-b border-[#DCE7F3] flex items-center justify-between bg-[#F8FBFF] shrink-0">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#0B63CE]" />
                        <h2 className="text-xs font-bold uppercase tracking-wider text-[#0E2747]">
                            Detail & Referensi Materi
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-[#6B7C93] hover:text-[#112743] hover:bg-white border border-transparent hover:border-[#DCE7F3] transition-colors"
                        aria-label="Tutup Panel Detail"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Drawer Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {/* Cover & Title Card */}
                    <div className="flex gap-4 items-start">
                        <div className="w-20 h-28 rounded-lg bg-[#EAF5FF] border border-[#DCE7F3] overflow-hidden shrink-0 shadow-sm flex items-center justify-center">
                            {material.cover_path ? (
                                <img
                                    src={material.cover_path}
                                    alt={material.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="p-2 text-center">
                                    <BookOpen className="w-6 h-6 text-[#0B63CE] mx-auto mb-1" />
                                    <span className="text-[9px] font-bold text-[#0B63CE] uppercase tracking-wider">
                                        PERKEMI
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <span className="inline-block font-mono text-[10px] text-[#0B63CE] bg-[#EAF5FF] px-2 py-0.5 rounded font-semibold border border-[#BCE0FD] mb-1.5">
                                {material.code || 'MODUL RESMI'}
                            </span>
                            <h3 className="text-sm font-bold text-[#112743] leading-snug">
                                {material.title}
                            </h3>
                            <p className="text-xs text-[#6B7C93] mt-1 flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-[#0B63CE] shrink-0" />
                                <span className="truncate">{material.author || 'Pengurus Besar PERKEMI'}</span>
                            </p>
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-3 p-3 bg-[#F8FBFF] rounded-xl border border-[#DCE7F3] text-xs">
                        <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B7C93] block">
                                Kategori
                            </span>
                            <span className="font-semibold text-[#112743] mt-0.5 block truncate">
                                {material.category?.name || 'Umum'}
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B7C93] block">
                                Jenis Dokumen
                            </span>
                            <span className="font-semibold text-[#112743] mt-0.5 block truncate">
                                {material.type_label || 'Buku Digital'}
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B7C93] block">
                                Tahun Terbit
                            </span>
                            <span className="font-semibold text-[#112743] mt-0.5 block">
                                {material.publication_year || '-'}
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B7C93] block">
                                Format & Ukuran
                            </span>
                            <span className="font-semibold text-[#112743] mt-0.5 block truncate">
                                PDF {fileInfo?.formatted_size ? `(${fileInfo.formatted_size})` : ''}
                            </span>
                        </div>
                    </div>

                    {/* Download Button (Strict Authorization Check) */}
                    {canDownload && downloadUrl ? (
                        <div className="p-4 bg-[#EAF5FF] border border-[#BCE0FD] rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#0A3F82]">
                                    Unduhan Diizinkan
                                </span>
                                <Badge variant="success" size="sm">Akses Penuh</Badge>
                            </div>
                            <p className="text-[11px] text-[#4A6482] leading-relaxed">
                                Anda memiliki izin untuk mengunduh salinan berkas ini ke perangkat lokal.
                            </p>
                            <a
                                href={downloadUrl}
                                download
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#0B63CE] hover:bg-[#0A3F82] rounded-lg transition-colors shadow-xs"
                            >
                                <Download className="w-4 h-4" />
                                <span>Unduh Dokumen PDF</span>
                            </a>
                        </div>
                    ) : (
                        <div className="p-3 bg-[#F8FBFF] border border-[#DCE7F3] rounded-xl text-[11px] text-[#6B7C93] leading-relaxed">
                            <p className="font-medium text-[#112743] mb-0.5">Mode Baca Aman (Read-Only)</p>
                            Materi ini disajikan untuk dibaca langsung melalui reader portal resmi PERKEMI.
                        </div>
                    )}

                    {/* Summary Section */}
                    {material.summary && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#112743]">
                                Ringkasan Materi
                            </h4>
                            <p className="text-xs text-[#4A6482] leading-relaxed bg-[#F8FBFF] p-3 rounded-lg border border-[#DCE7F3]/60">
                                {material.summary}
                            </p>
                        </div>
                    )}

                    {/* Related Materials */}
                    {relatedMaterials.length > 0 && (
                        <div className="space-y-3 pt-3 border-t border-[#DCE7F3]">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#112743] flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-[#0B63CE]" />
                                <span>Materi Terkait</span>
                            </h4>

                            <div className="space-y-2.5">
                                {relatedMaterials.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/koleksi/${item.slug}/baca`}
                                        className="flex items-center gap-3 p-2.5 rounded-lg border border-[#DCE7F3] hover:border-[#0B63CE] hover:bg-[#EAF5FF]/40 transition-colors group"
                                    >
                                        <div className="w-8 h-11 bg-white border border-[#DCE7F3] rounded overflow-hidden shrink-0 flex items-center justify-center">
                                            {item.cover_path ? (
                                                <img
                                                    src={item.cover_path}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <FileText className="w-4 h-4 text-[#0B63CE]" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-semibold text-[#112743] group-hover:text-[#0B63CE] transition-colors truncate">
                                                {item.title}
                                            </p>
                                            <p className="text-[11px] text-[#6B7C93]">
                                                {item.type_label} &bull; {item.publication_year || '-'}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
