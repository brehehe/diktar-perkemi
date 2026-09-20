import React from 'react';
import { ArrowLeft, Download, ShieldCheck, FileText, Calendar, User, Tag } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function ReaderDetailsPanel({
    material,
    fileInfo,
    canDownload = false,
    downloadUrl = null,
    backUrl = '/koleksi',
}) {
    if (!material) return null;

    return (
        <div className="space-y-6 text-sm text-[#0E2747]">
            {/* Book Cover Thumbnail with tactile border */}
            <div className="flex justify-center">
                <div className="w-36 aspect-[3/4] rounded-lg overflow-hidden shadow-md shadow-slate-300/50 border border-[#DCE7F3] bg-white relative">
                    {material.cover_path ? (
                        <img
                            src={material.cover_path}
                            alt={material.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-slate-100 text-slate-400">
                            <FileText className="w-8 h-8 mb-1 text-slate-300" />
                            <span className="text-[10px] font-medium leading-tight line-clamp-3">
                                {material.title}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Title & Metadata (Editorial Style) */}
            <div className="text-center space-y-2">
                {material.category && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF5FF] text-[#0B63CE] border border-[#0B63CE]/20">
                        {material.category.name}
                    </span>
                )}
                <h2 className="text-base font-bold text-[#0E2747] font-serif leading-snug">
                    {material.title}
                </h2>
                {material.code && (
                    <div className="text-[11px] font-mono text-slate-400">
                        KODE: {material.code}
                    </div>
                )}
            </div>

            {/* Divider */}
            <div className="border-t border-[#DCE7F3]" />

            {/* Editorial Metadata Lines */}
            <div className="space-y-3.5 text-xs">
                <div className="flex items-start justify-between py-1 border-b border-[#DCE7F3]">
                    <span className="text-slate-500 flex items-center gap-1.5 shrink-0">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Penulis / Pemateri</span>
                    </span>
                    <span className="font-semibold text-slate-800 text-right">
                        {material.author || 'PB PERKEMI'}
                    </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-[#DCE7F3]">
                    <span className="text-slate-500 flex items-center gap-1.5 shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Tahun Publikasi</span>
                    </span>
                    <span className="font-semibold text-slate-800">
                        {material.publication_year || '—'}
                    </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-[#DCE7F3]">
                    <span className="text-slate-500 flex items-center gap-1.5 shrink-0">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>Format Dokumen</span>
                    </span>
                    <span className="font-semibold text-slate-800">
                        PDF Digital {fileInfo?.formatted_size ? `(${fileInfo.formatted_size})` : ''}
                    </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-[#DCE7F3]">
                    <span className="text-slate-500 flex items-center gap-1.5 shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Status Akses</span>
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200">
                        Terverifikasi
                    </span>
                </div>
            </div>

            {/* Summary */}
            {material.summary && (
                <div className="pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Ringkasan Editorial
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-[#DCE7F3]">
                        {material.summary}
                    </p>
                </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-[#DCE7F3] space-y-2.5">
                {canDownload && downloadUrl && (
                    <a
                        href={downloadUrl}
                        download
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B63CE] hover:bg-[#0A3F82] text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh Dokumen PDF</span>
                    </a>
                )}

                <Link
                    href={backUrl}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-[#DCE7F3] text-xs font-medium transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                    <span>Kembali ke Detail Koleksi</span>
                </Link>
            </div>
        </div>
    );
}
