import React from 'react';

/**
 * AuthFormCard — white card container for auth forms.
 * Spacing lapang, border tipis, shadow lembut, sudut moderat.
 */
export default function AuthFormCard({ children, className = '' }) {
    return (
        <div
            className={`bg-white border border-[#DCE7F3] rounded-xl shadow-[0_2px_16px_rgba(11,99,206,0.06)] px-7 py-8 sm:px-9 sm:py-10 ${className}`}
        >
            {children}
        </div>
    );
}
