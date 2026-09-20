import React from 'react';

export default function ReaderProgress({ currentPage = 1, totalPages = 1 }) {
    const safeTotal = Math.max(1, totalPages || 1);
    const safeCurrent = Math.min(Math.max(1, currentPage || 1), safeTotal);
    const percentage = Math.min(100, Math.max(0, Math.round((safeCurrent / safeTotal) * 100)));

    return (
        <div
            className="w-full h-1 bg-[#DCE7F3]/70 relative overflow-hidden"
            role="progressbar"
            aria-valuenow={safeCurrent}
            aria-valuemin={1}
            aria-valuemax={safeTotal}
            aria-label={`Progres membaca: halaman ${safeCurrent} dari ${safeTotal} (${percentage}%)`}
        >
            <div
                className="h-full bg-gradient-to-r from-[#0B63CE] to-[#257DE0] transition-all duration-300 ease-out"
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
}
