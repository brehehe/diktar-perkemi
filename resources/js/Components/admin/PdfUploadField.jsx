import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, RefreshCw, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Checkbox from '../ui/Checkbox';
import Button from '../ui/Button';

function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function PdfUploadField({
    selectedFile,
    onFileSelect,
    allowDownload = true,
    onAllowDownloadChange,
    error,
    maxSizeMb = 50,
    progress = null,
    existingFileName = null,
    existingFileSize = null,
    existingVersion = null,
    className = '',
}) {
    const [isDragging, setIsDragging] = useState(false);
    const [localError, setLocalError] = useState('');
    const fileInputRef = useRef(null);

    const handleFile = (file) => {
        if (!file) return;
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            setLocalError('Format berkas harus berupa dokumen PDF (.pdf)');
            return;
        }
        if (file.size > maxSizeMb * 1024 * 1024) {
            setLocalError(`Ukuran berkas melebihi batas maksimal ${maxSizeMb} MB`);
            return;
        }
        setLocalError('');
        if (onFileSelect) {
            onFileSelect(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        setLocalError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (onFileSelect) {
            onFileSelect(null);
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Private Storage Notice Banner */}
            <div className="flex items-start gap-3 p-3.5 bg-[#F8FBFF] border border-[#DCE7F3] rounded-xl text-xs text-[#4A6482]">
                <ShieldCheck className="w-4 h-4 text-[#0B63CE] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                    <p className="font-semibold text-[#0E2747]">
                        Penyimpanan Privat Terenkripsi PERKEMI
                    </p>
                    <p className="text-[11px] text-[#6B7C93] leading-relaxed">
                        Dokumen PDF disimpan di direktori privat server dan tidak dapat diakses langsung melalui URL publik. Akses hanya diberikan setelah verifikasi hak akses kenshi oleh sistem.
                    </p>
                </div>
            </div>

            {/* Dropzone Container */}
            <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`
                    relative border-2 border-dashed rounded-2xl p-6 transition-all duration-200 cursor-pointer text-center
                    flex flex-col items-center justify-center min-h-[190px]
                    ${isDragging ? 'border-[#0B63CE] bg-[#EAF5FF]/80' : 'border-[#DCE7F3] bg-white hover:border-[#0B63CE]/50 hover:bg-[#F8FBFF]'}
                    ${(error || localError) ? 'border-[#FA5252] bg-[#FDE8EF]/20' : ''}
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                    onClick={(e) => {
                        e.stopPropagation();
                        e.target.value = '';
                    }}
                    onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                            handleFile(e.target.files[0]);
                        }
                    }}
                />

                {selectedFile ? (
                    <div className="flex flex-col items-center space-y-3 w-full max-w-md">
                        <div className="w-12 h-12 rounded-xl bg-[#EAF5FF] text-[#0B63CE] flex items-center justify-center shadow-xs">
                            <FileText className="w-6 h-6" />
                        </div>

                        <div className="space-y-1 w-full text-center">
                            <p className="text-sm font-bold text-[#0E2747] truncate">
                                {selectedFile.name}
                            </p>
                            <p className="text-xs text-[#6B7C93] font-mono">
                                {formatBytes(selectedFile.size)} • Siap Disimpan
                            </p>
                        </div>

                        {progress !== null && (
                            <div className="w-full space-y-1.5 pt-1">
                                <div className="flex justify-between text-[11px] font-mono text-[#0B63CE]">
                                    <span>Mengunggah berkas...</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-[#EAF5FF] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#0B63CE] transition-all duration-200"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2 pt-1">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                icon={RefreshCw}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    fileInputRef.current?.click();
                                }}
                            >
                                Ganti Berkas PDF
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                icon={X}
                                onClick={handleRemove}
                            >
                                Batalkan
                            </Button>
                        </div>
                    </div>
                ) : existingFileName ? (
                    <div className="flex flex-col items-center space-y-3 w-full max-w-md">
                        <div className="w-12 h-12 rounded-xl bg-[#EBFBEE] text-[#2B8A3E] flex items-center justify-center shadow-xs">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>

                        <div className="space-y-1 w-full text-center">
                            <p className="text-sm font-bold text-[#0E2747] truncate">
                                {existingFileName}
                            </p>
                            <p className="text-xs text-[#6B7C93] font-mono">
                                Versi {existingVersion || '1.0'} {existingFileSize ? `• ${existingFileSize}` : ''} • Berkas Aktif
                            </p>
                        </div>

                        <p className="text-xs text-[#0B63CE] font-medium">
                            Klik atau seret untuk mengganti berkas PDF baru
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center space-y-2.5">
                        <div className="w-12 h-12 rounded-2xl bg-[#EAF5FF] text-[#0B63CE] flex items-center justify-center shadow-xs">
                            <UploadCloud className="w-6 h-6" />
                        </div>

                        <div>
                            <p className="text-sm font-bold text-[#0E2747]">
                                Pilih berkas PDF atau seret ke sini
                            </p>
                            <p className="text-xs text-[#6B7C93] mt-1">
                                Dokumen PDF resmi (Maksimal {maxSizeMb} MB)
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="mt-1"
                        >
                            Pilih File PDF
                        </Button>
                    </div>
                )}
            </div>

            {(error || localError) && (
                <p className="text-xs text-[#FA5252] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FA5252]" />
                    {error || localError}
                </p>
            )}

            {/* Checkbox: Izinkan Pembaca Mengunduh E-Book */}
            <div className="pt-2">
                <Checkbox
                    id="allow_download_checkbox"
                    label="Izinkan pembaca mengunduh e-book"
                    description="Jika diaktifkan, kenshi yang memiliki izin dapat mengunduh berkas PDF dokumen secara utuh."
                    checked={allowDownload}
                    onChange={(checked) => onAllowDownloadChange && onAllowDownloadChange(checked)}
                />
            </div>
        </div>
    );
}
