import React from 'react';

export default function Switch({
    label,
    id,
    name,
    checked = false,
    onChange,
    disabled = false,
    helperText,
    className = '',
}) {
    const inputId = id || name || `switch-${Math.random().toString(36).substring(2, 9)}`;

    return (
        <div className={`flex items-center justify-between gap-4 ${className}`}>
            {(label || helperText) && (
                <div className="flex flex-col">
                    {label && (
                        <label htmlFor={inputId} className="text-sm font-medium text-[#112743] cursor-pointer">
                            {label}
                        </label>
                    )}
                    {helperText && (
                        <p className="text-xs text-[#6B7C93]">{helperText}</p>
                    )}
                </div>
            )}
            <button
                id={inputId}
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                className={`
                    relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0B63CE] focus:ring-offset-2
                    ${checked ? 'bg-[#0B63CE]' : 'bg-[#DCE7F3]'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <span
                    aria-hidden="true"
                    className={`
                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out
                        ${checked ? 'translate-x-5' : 'translate-x-0'}
                    `}
                />
            </button>
        </div>
    );
}
