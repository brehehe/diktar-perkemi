import React from 'react';
import { AlertCircle, RefreshCw, ArrowLeft, ShieldAlert, FileQuestion } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function ReaderErrorState({
    type = 'error',
    title = 'Gagal Memuat Buku Digital',
    description = 'Dokumen tidak dapat dimuat saat ini. Pastikan hak akses akun Anda sesuai dan berkas PDF aktif telah tersedia.',
    onRetry,
    backUrl = '/koleksi',
}) {
    const isAccessDenied = type === 'unauthorized' || title.toLowerCase().includes('izin') || title.toLowerCase().includes('akses');
    const isMissingFile = type === 'missing' || title.toLowerCase().includes('belum diunggah') || title.toLowerCase().includes('tidak ditemukan');

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] h-full w-full p-8 text-center bg-[#F4F8FC]">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-6 shadow-sm">
                {isAccessDenied ? (
                    <ShieldAlert className="w-8 h-8" />
                ) : isMissingFile ? (
                    <FileQuestion className="w-8 h-8" />
                ) : (
                    <AlertCircle className="w-8 h-8" />
                )}
            </div>

            <h3 className="text-xl font-bold text-[#0E2747] mb-2 font-serif">
                {title}
            </h3>

            <p className="text-sm text-slate-600 max-w-md mb-8 leading-relaxed">
                {description}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
                {onRetry && (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B63CE] hover:bg-[#0A3F82] text-white text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0B63CE] focus:ring-offset-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Muat Ulang</span>
                    </button>
                )}

                <Link
                    href={backUrl}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#0E2747] border border-[#DCE7F3] text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0B63CE] focus:ring-offset-2"
                >
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                    <span>Kembali ke Detail Koleksi</span>
                </Link>
            </div>
        </div>
    );
}
