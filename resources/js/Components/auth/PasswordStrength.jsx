import React, { useMemo } from 'react';

/**
 * PasswordStrength — visual indicator for password strength.
 * Shows 4 bars + a label based on score.
 */
export default function PasswordStrength({ password = '' }) {
    const { score, label, color } = useMemo(() => {
        if (!password) return { score: 0, label: '', color: '' };

        let s = 0;
        if (password.length >= 8) s++;
        if (password.length >= 12) s++;
        if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s++;
        if (/[0-9]/.test(password)) s++;
        if (/[^A-Za-z0-9]/.test(password)) s++;

        // Normalize to 1–4
        const score = Math.min(4, Math.ceil(s / 1.25));

        const map = {
            1: { label: 'Terlalu lemah', color: '#FA5252' },
            2: { label: 'Cukup', color: '#F59F00' },
            3: { label: 'Cukup kuat', color: '#20C997' },
            4: { label: 'Kuat', color: '#1C7ED6' },
        };

        return { score, ...map[score] };
    }, [password]);

    if (!password) return null;

    return (
        <div className="mt-2 space-y-1.5" aria-live="polite" aria-atomic="true">
            {/* Bars */}
            <div className="flex gap-1" role="presentation">
                {[1, 2, 3, 4].map((bar) => (
                    <div
                        key={bar}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                            backgroundColor: score >= bar ? color : '#E9EEF6',
                        }}
                    />
                ))}
            </div>
            {/* Label */}
            <p
                className="text-[11px] font-medium transition-colors"
                style={{ color }}
                aria-label={`Kekuatan kata sandi: ${label}`}
            >
                {label}
            </p>
        </div>
    );
}
