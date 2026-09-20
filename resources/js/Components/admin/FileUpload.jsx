import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';

export default function FileUpload({
    label = 'Sampul Materi',
    name = 'cover_file',
    currentCover,
    onFileSelect,
    error,
    helperText = 'Format JPG, PNG, atau WebP. Ukuran berkas maksimal 2 MB.',
    required = false,
    className = '',
}) {
    const [previewUrl, setPreviewUrl] = useState(currentCover || null);
    const [fileName, setFileName] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleFile = (file) => {
        if (!file) return;
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
        if (onFileSelect) onFileSelect(file);
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
        setPreviewUrl(null);
        setFileName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (onFileSelect) onFileSelect(null);
    };

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#112743] mb-1.5">
                    {label}
                    {required && <span className="text-[#FA5252] ml-1 font-bold" aria-hidden="true">*</span>}
                </label>
            )}

            <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`
                    relative border-2 border-dashed rounded-xl p-4 transition-all duration-150 cursor-pointer text-center
                    flex flex-col items-center justify-center min-h-[160px]
                    ${isDragging ? 'border-[#0B63CE] bg-[#EAF5FF]/60' : 'border-[#DCE7F3] bg-[#F8FBFF] hover:border-[#0B63CE]/50 hover:bg-white'}
                    ${error ? 'border-[#FA5252] bg-[#FDE8EF]/20' : ''}
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    name={name}
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                            handleFile(e.target.files[0]);
                        }
                    }}
                />

                {previewUrl ? (
                    <div className="relative group/preview flex flex-col items-center">
                        <div className="w-24 h-32 rounded-lg overflow-hidden border border-[#DCE7F3] shadow-md bg-white mb-2">
                            <img
                                src={previewUrl}
                                alt="Pratinjau Sampul"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-xs font-medium text-[#112743] max-w-[200px] truncate">
                            {fileName || 'Sampul tersimpan'}
                        </span>
                        <p className="text-[11px] text-[#6B7C93] mt-0.5">
                            Klik atau seret untuk mengganti berkas
                        </p>

                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute -top-2 -right-2 p-1 rounded-full bg-[#FA5252] text-white shadow-md hover:bg-[#E03131] transition-colors"
                            aria-label="Hapus gambar sampul"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-[#EAF5FF] text-[#0B63CE] flex items-center justify-center mb-2 shadow-xs">
                            <UploadCloud className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-semibold text-[#112743]">
                            Pilih gambar sampul atau seret ke sini
                        </p>
                        <p className="text-[11px] text-[#6B7C93] mt-1">
                            JPG, PNG, atau WebP (maks. 2 MB)
                        </p>
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-1.5 text-xs text-[#FA5252] font-medium flex items-center gap-1">
                    <span>{error}</span>
                </p>
            )}
            {!error && helperText && (
                <p className="mt-1.5 text-xs text-[#6B7C93]">
                    {helperText}
                </p>
            )}
        </div>
    );
}
