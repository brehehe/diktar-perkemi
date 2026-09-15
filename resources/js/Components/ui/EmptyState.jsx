import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
    icon: Icon = Inbox,
    title = 'Belum Ada Data',
    description = 'Belum ada rekaman yang tersedia untuk ditampilkan.',
    actionText,
    onAction,
    className = '',
}) {
    return (
        <div className={`flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-xl border border-[#DCE7F3] border-dashed ${className}`}>
            <div className="w-12 h-12 rounded-full bg-[#EAF5FF] text-[#0B63CE] flex items-center justify-center mb-3 shadow-xs">
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-[#112743]">
                {title}
            </h3>
            <p className="text-xs text-[#6B7C93] max-w-sm mt-1 mb-4 leading-relaxed">
                {description}
            </p>
            {actionText && onAction && (
                <Button variant="primary" size="sm" onClick={onAction}>
                    {actionText}
                </Button>
            )}
        </div>
    );
}
