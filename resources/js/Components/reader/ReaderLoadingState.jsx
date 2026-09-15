import React from 'react';
import { Loader2, BookOpen } from 'lucide-react';

export default function ReaderLoadingState({ message = 'Memuat dokumen buku digital dari penyimpanan aman...' }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#F8FBFF] text-center min-h-[400px]">
            <div className="relative mb-4">
                <div className="w-16 h-16 rounded-2xl bg-[#EAF5FF] border border-[#BCE0FD] flex items-center justify-center text-[#0B63CE] shadow-xs">
                    <BookOpen className="w-8 h-8" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-xs">
                    <Loader2 className="w-5 h-5 text-[#0B63CE] animate-spin" />
                </div>
            </div>

            <h3 className="text-sm font-bold text-[#112743] mb-1">
                Menyiapkan Pembaca Digital
            </h3>
            <p className="text-xs text-[#6B7C93] max-w-sm leading-relaxed">
                {message}
            </p>
        </div>
    );
}
