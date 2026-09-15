import React from 'react';

export function Skeleton({ className = '' }) {
    return (
        <div className={`animate-pulse bg-[#DCE7F3]/60 rounded ${className}`} />
    );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
    return (
        <div className="w-full bg-white rounded-xl border border-[#DCE7F3] overflow-hidden p-4 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#DCE7F3]">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-8 w-24" />
            </div>
            <div className="space-y-3">
                {Array.from({ length: rows }).map((_, r) => (
                    <div key={r} className="flex gap-4 items-center py-2 border-b border-[#DCE7F3]/40 last:border-0">
                        {Array.from({ length: cols }).map((_, c) => (
                            <Skeleton
                                key={c}
                                className={`h-4 ${c === 0 ? 'w-1/3' : c === 1 ? 'w-1/4' : 'w-1/6'}`}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Skeleton;
