import React, { useId } from 'react';

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
    const generatedId = useId();
    const inputId = id || name || generatedId;

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
                    relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] motion-reduce:transition-none
                    ${checked ? 'bg-[#0B63CE]' : 'bg-[#DCE7F3]'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <span
                    aria-hidden="true"
                    className={`
                        pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out motion-reduce:transition-none
                        ${checked ? 'translate-x-5' : 'translate-x-0'}
                    `}
                />
            </button>
        </div>
    );
}
