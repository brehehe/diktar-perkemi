import React from 'react';
import { BookOpen, Loader2 } from 'lucide-react';

export default function ReaderLoadingState({ message = 'Membuka buku digital...' }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[360px] h-full w-full p-8 text-center bg-[#F4F8FC]/80 backdrop-blur-sm select-none">
            <div className="relative mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-lg shadow-[#0B63CE]/10 border border-[#DCE7F3] flex items-center justify-center text-[#0B63CE]">
                    <BookOpen className="w-8 h-8 animate-pulse text-[#0B63CE]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0B63CE] text-white flex items-center justify-center shadow">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                </div>
            </div>

            <h3 className="text-lg font-bold text-[#0E2747] mb-2 font-serif">
                Pustaka Penataran PERKEMI
            </h3>
            <p className="text-sm text-slate-600 max-w-sm">
                {message}
            </p>

            {/* Subtle animated skeleton bar */}
            <div className="w-48 h-1.5 bg-[#DCE7F3] rounded-full mt-5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#0B63CE] to-[#0A3F82] rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" />
            </div>
        </div>
    );
}
