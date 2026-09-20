import React from 'react';
import { AlertTriangle, ArrowLeft, RefreshCw, Lock } from 'lucide-react';
import { Link } from '@inertiajs/react';
import Button from '../ui/Button';

export default function ReaderErrorState({
    title = 'Berkas Tidak Dapat Dibuka',
    description = 'Terjadi kendala saat memuat berkas buku digital atau Anda belum memiliki hak akses yang sesuai.',
    isUnauthorized = false,
    onRetry = null,
    backUrl = '/admin/koleksi',
}) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#F8FBFF] text-center min-h-[400px]">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-xs ${
                isUnauthorized
                    ? 'bg-[#FFF3E6] border border-[#FFE8CC] text-[#E8590C]'
                    : 'bg-[#FDE8EF] border border-[#F8B4C4] text-[#FA5252]'
            }`}>
                {isUnauthorized ? (
                    <Lock className="w-8 h-8" />
                ) : (
                    <AlertTriangle className="w-8 h-8" />
                )}
            </div>

            <h3 className="text-base font-bold text-[#112743] mb-2">
                {title}
            </h3>

            <p className="text-xs text-[#6B7C93] max-w-md leading-relaxed mb-6">
                {description}
            </p>

            <div className="flex items-center gap-3">
                {onRetry && (
                    <Button
                        variant="secondary"
                        size="sm"
                        icon={RefreshCw}
                        onClick={onRetry}
                    >
                        Coba Muat Ulang
                    </Button>
                )}

                <Link href={backUrl}>
                    <Button
                        variant="primary"
                        size="sm"
                        icon={ArrowLeft}
                    >
                        Kembali ke Koleksi
                    </Button>
                </Link>
            </div>
        </div>
    );
}
