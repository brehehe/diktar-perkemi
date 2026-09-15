import React, { useState, useRef } from 'react';
import { UploadCloud, FileUp, AlertCircle } from 'lucide-react';
import FileInfo from './FileInfo';

function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function BookFileUpload({
    selectedFile,
    onFileSelect,
    error,
    maxSizeMb = 50,
    progress = null,
    className = '',
}) {
    const [isDragging, setIsDragging] = useState(false);
    const [localError, setLocalError] = useState('');
    const inputRef = useRef(null);

    const handleFile = (file) => {
        if (!file) return;
        setLocalError('');

        // Validate PDF type
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            setLocalError('Format berkas harus berupa dokumen PDF (.pdf).');
            return;
        }

        // Validate max size (in bytes)
        const maxBytes = maxSizeMb * 1024 * 1024;
        if (file.size > maxBytes) {
            setLocalError(`Ukuran berkas melebihi batas maksimum ${maxSizeMb} MB.`);
            return;
        }

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

    const handleRemove = () => {
        if (inputRef.current) inputRef.current.value = '';
        setLocalError('');
        if (onFileSelect) onFileSelect(null);
    };

    const displayError = error || localError;

    return (
        <div className={`w-full ${className}`}>
            <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                        handleFile(e.target.files[0]);
                    }
                }}
            />

            {selectedFile ? (
                <div className="space-y-3">
                    <FileInfo
                        fileName={selectedFile.name}
                        fileSize={formatBytes(selectedFile.size)}
                        fileFormat="PDF"
                        status="ready"
                        onChangeFile={() => inputRef.current?.click()}
                        onRemoveFile={handleRemove}
                    />

                    {progress !== null && progress < 100 && (
                        <div className="space-y-1.5 p-3 bg-[#F8FBFF] rounded-lg border border-[#DCE7F3]">
                            <div className="flex justify-between text-xs text-[#112743] font-medium">
                                <span>Mengunggah berkas...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-[#DCE7F3] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#0B63CE] rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`
                        relative border-2 border-dashed rounded-xl p-8 transition-all duration-150 cursor-pointer text-center
                        flex flex-col items-center justify-center min-h-[190px]
                        ${isDragging ? 'border-[#0B63CE] bg-[#EAF5FF]' : 'border-[#DCE7F3] bg-[#F8FBFF] hover:border-[#0B63CE]/60 hover:bg-white'}
                        ${displayError ? 'border-[#FA5252] bg-[#FDE8EF]/20' : ''}
                    `}
                >
                    <div className="w-12 h-12 rounded-full bg-[#EAF5FF] text-[#0B63CE] flex items-center justify-center mb-3 shadow-xs">
                        <UploadCloud className="w-6 h-6" />
                    </div>

                    <p className="text-sm font-semibold text-[#112743]">
                        Seret & letakkan berkas PDF buku di sini
                    </p>
                    <p className="text-xs text-[#6B7C93] mt-1 max-w-sm">
                        Dokumen digital wajib dalam format <span className="font-semibold text-[#112743]">PDF</span> dengan ukuran maksimal <span className="font-semibold text-[#112743]">{maxSizeMb} MB</span>.
                    </p>

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            inputRef.current?.click();
                        }}
                        className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#0B63CE] hover:bg-[#0A3F82] rounded-lg shadow-xs transition-colors"
                    >
                        <FileUp className="w-3.5 h-3.5" />
                        <span>Pilih File PDF</span>
                    </button>
                </div>
            )}

            {displayError && (
                <div className="mt-2 text-xs text-[#FA5252] font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{displayError}</span>
                </div>
            )}
        </div>
    );
}
