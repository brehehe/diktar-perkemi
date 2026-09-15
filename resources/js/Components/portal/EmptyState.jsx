import { BookX, RotateCcw } from 'lucide-react';

export default function EmptyState({
    title = 'Materi Belum Ditemukan',
    description = 'Materi belum ditemukan. Coba ubah kata kunci atau filter pencarian Anda.',
    onReset = null,
    className = '',
}) {
    return (
        <div
            className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-xl bg-white border border-[#DCE7F3] shadow-xs max-w-lg mx-auto ${className}`}
        >
            <div className="w-14 h-14 rounded-full bg-[#EAF5FF] text-[#0B63CE] flex items-center justify-center mb-4 border border-[#0B63CE]/20">
                <BookX className="w-7 h-7" />
            </div>

            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#0E2747] mb-2 tracking-tight">
                {title}
            </h3>

            <p className="text-sm text-[#6B7C93] leading-relaxed max-w-sm mb-6">
                {description}
            </p>

            {onReset && (
                <button
                    type="button"
                    onClick={onReset}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-md text-xs font-semibold text-[#0B63CE] bg-[#EAF5FF] hover:bg-[#0B63CE] hover:text-white border border-[#0B63CE]/30 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0B63CE] focus:ring-offset-1"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Atur Ulang Pencarian</span>
                </button>
            )}
        </div>
    );
}
