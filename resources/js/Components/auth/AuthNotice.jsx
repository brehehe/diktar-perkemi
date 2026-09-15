import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

const VARIANTS = {
    error:   { bg: '#FFF0F0', border: '#FBBFBF', text: '#C92A2A', Icon: AlertCircle },
    success: { bg: '#EDFAF2', border: '#A3DFBB', text: '#1A7F45', Icon: CheckCircle2 },
    info:    { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8', Icon: Info },
    warning: { bg: '#FFFBEB', border: '#FCD34D', text: '#92400E', Icon: AlertTriangle },
};

/**
 * AuthNotice — alert/banner for auth-page feedback (validation, success, info).
 */
export default function AuthNotice({ type = 'info', message, className = '' }) {
    if (!message) return null;
    const { bg, border, text, Icon } = VARIANTS[type] ?? VARIANTS.info;

    return (
        <div
            role="alert"
            className={`flex items-start gap-2.5 px-4 py-3 rounded-lg border text-[12.5px] font-medium leading-snug ${className}`}
            style={{ backgroundColor: bg, borderColor: border, color: text }}
        >
            <Icon className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{message}</span>
        </div>
    );
}
