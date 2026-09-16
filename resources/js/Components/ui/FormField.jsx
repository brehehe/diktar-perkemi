import React from 'react';

export default function FormField({
    label,
    name,
    required = false,
    helperText,
    error,
    children,
    className = '',
}) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            {label && (
                <div className="flex items-center justify-between">
                    <label
                        htmlFor={name}
                        className="block text-xs font-semibold text-[#112743]"
                    >
                        {label}
                        {required && <span className="text-[#DD4D7C] ml-1">*</span>}
                    </label>
                </div>
            )}

            {children}

            {helperText && !error && (
                <p className="text-[11px] text-[#6B7C93] leading-relaxed">
                    {helperText}
                </p>
            )}

            {error && (
                <p className="text-xs text-[#DD4D7C] font-medium flex items-center gap-1 animate-in fade-in duration-200">
                    <span className="inline-block w-1 h-1 rounded-full bg-[#DD4D7C]" />
                    {error}
                </p>
            )}
        </div>
    );
}
