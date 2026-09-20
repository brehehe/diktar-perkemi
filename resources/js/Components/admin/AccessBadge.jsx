import React from 'react';
import { Users, Lock, Globe } from 'lucide-react';

export default function AccessBadge({ audiences = [], isPublic = false, className = '' }) {
    if (isPublic || audiences.length === 0) {
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#EAF5FF] text-[#0B63CE] border border-[#BCE0FD] ${className}`}>
                <Globe className="w-3 h-3 shrink-0" />
                <span>Semua Kenshi</span>
            </span>
        );
    }

    return (
        <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#FFF3E6] text-[#E8590C] border border-[#FFE8CC]">
                <Lock className="w-3 h-3 shrink-0" />
                <span>{audiences.length} Peran</span>
            </span>
        </div>
    );
}
