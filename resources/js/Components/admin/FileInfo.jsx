import React from 'react';
import { FileText, CheckCircle2, RefreshCw, Trash2, ExternalLink } from 'lucide-react';
import Badge from '../ui/Badge';

export default function FileInfo({
    fileName,
    fileSize,
    fileFormat = 'PDF',
    version = null,
    uploadedAt = null,
    uploaderName = null,
    status = 'ready', // 'ready' | 'pending' | 'needs_update'
    onChangeFile = null,
    onRemoveFile = null,
    onViewFile = null,
    className = '',
}) {
    return (
        <div
            className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border border-[#DCE7F3] rounded-xl shadow-2xs gap-4 transition-all ${className}`}
        >
            <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-11 h-12 rounded-lg bg-[#FDE8EF] border border-[#F8B4C4] flex flex-col items-center justify-center shrink-0 shadow-2xs">
                    <FileText className="w-5 h-5 text-[#FA5252]" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#FA5252] leading-none mt-0.5">
                        {fileFormat}
                    </span>
                </div>

                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs sm:text-sm font-semibold text-[#112743] truncate max-w-xs md:max-w-md" title={fileName}>
                            {fileName}
                        </p>
                        {version && (
                            <span className="font-mono text-[10px] font-bold text-[#0B63CE] bg-[#EAF5FF] border border-[#BCE0FD] px-1.5 py-0.5 rounded">
                                v{version}.0
                            </span>
                        )}
                        <Badge variant={status === 'ready' ? 'success' : 'warning'} size="sm">
                            {status === 'ready' ? 'Berkas Siap' : 'Perlu Diperbarui'}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#6B7C93] mt-1 flex-wrap">
                        {fileSize && (
                            <span className="font-medium text-[#112743]">
                                {fileSize}
                            </span>
                        )}
                        {fileSize && (uploadedAt || uploaderName) && <span>&bull;</span>}
                        {uploadedAt && <span>Diunggah {uploadedAt}</span>}
                        {uploaderName && <span>oleh {uploaderName}</span>}
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {onViewFile && (
                    <button
                        type="button"
                        onClick={onViewFile}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#0B63CE] bg-[#EAF5FF] hover:bg-[#D5EBFF] rounded-lg transition-colors border border-[#BCE0FD]"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Buka</span>
                    </button>
                )}

                {onChangeFile && (
                    <button
                        type="button"
                        onClick={onChangeFile}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#112743] bg-[#F8FBFF] hover:bg-[#EAF5FF] rounded-lg transition-colors border border-[#DCE7F3]"
                    >
                        <RefreshCw className="w-3.5 h-3.5 text-[#6B7C93]" />
                        <span>Ganti File</span>
                    </button>
                )}

                {onRemoveFile && (
                    <button
                        type="button"
                        onClick={onRemoveFile}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#FA5252] hover:bg-[#FDE8EF] rounded-lg transition-colors border border-transparent hover:border-[#F8B4C4]"
                        aria-label="Hapus pilihan berkas"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                    </button>
                )}
            </div>
        </div>
    );
}
