import React, { forwardRef } from 'react';

const Input = forwardRef(function Input(
    {
        label,
        id,
        name,
        type = 'text',
        value,
        onChange,
        error,
        helperText,
        required = false,
        disabled = false,
        readOnly = false,
        placeholder = '',
        className = '',
        icon: Icon,
        ...props
    },
    ref
) {
    const inputId = id || name || `input-${Math.random().toString(36).substring(2, 9)}`;

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-xs font-semibold uppercase tracking-wider text-[#112743] mb-1.5"
                >
                    {label}
                    {required && <span className="text-[#FA5252] ml-1 font-bold" aria-hidden="true">*</span>}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6B7C93]">
                        <Icon className="w-4 h-4" />
                    </div>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    name={name}
                    type={type}
                    value={value ?? ''}
                    onChange={onChange}
                    disabled={disabled}
                    readOnly={readOnly}
                    placeholder={placeholder}
                    required={required}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
                    className={`
                        w-full rounded-lg bg-white border text-sm text-[#112743] placeholder-[#6B7C93]/60 transition-all duration-150
                        ${Icon ? 'pl-9 pr-3.5 py-2' : 'px-3.5 py-2'}
                        ${error ? 'border-[#FA5252] focus:border-[#FA5252] focus:ring-[#FA5252]/20' : 'border-[#DCE7F3] hover:border-[#0B63CE]/50 focus:border-[#0B63CE] focus:ring-[#0B63CE]/20'}
                        focus:outline-none focus:ring-3
                        disabled:bg-[#F8FBFF] disabled:text-[#6B7C93] disabled:cursor-not-allowed disabled:border-[#DCE7F3]
                        read-only:bg-[#F8FBFF] read-only:cursor-default
                        ${className}
                    `}
                    {...props}
                />
            </div>
            {error && (
                <p id={`${inputId}-error`} className="mt-1.5 text-xs text-[#FA5252] font-medium flex items-center gap-1">
                    <span>{error}</span>
                </p>
            )}
            {!error && helperText && (
                <p id={`${inputId}-helper`} className="mt-1.5 text-xs text-[#6B7C93]">
                    {helperText}
                </p>
            )}
        </div>
    );
});

export default Input;
