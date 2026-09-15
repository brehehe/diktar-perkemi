import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput = forwardRef(function PasswordInput(
    {
        label,
        id,
        name,
        value,
        onChange,
        error,
        helperText,
        required = false,
        disabled = false,
        placeholder = '••••••••',
        className = '',
        ...props
    },
    ref
) {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || name || `password-${Math.random().toString(36).substring(2, 9)}`;

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
                <input
                    ref={ref}
                    id={inputId}
                    name={name}
                    type={showPassword ? 'text' : 'password'}
                    value={value ?? ''}
                    onChange={onChange}
                    disabled={disabled}
                    placeholder={placeholder}
                    required={required}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
                    className={`
                        w-full rounded-lg bg-white border text-sm text-[#112743] placeholder-[#6B7C93]/60 pl-3.5 pr-10 py-2 transition-all duration-150
                        ${error ? 'border-[#FA5252] focus:border-[#FA5252] focus:ring-[#FA5252]/20' : 'border-[#DCE7F3] hover:border-[#0B63CE]/50 focus:border-[#0B63CE] focus:ring-[#0B63CE]/20'}
                        focus:outline-none focus:ring-3
                        disabled:bg-[#F8FBFF] disabled:text-[#6B7C93] disabled:cursor-not-allowed
                        ${className}
                    `}
                    {...props}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={disabled}
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6B7C93] hover:text-[#112743] focus:outline-none"
                >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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

export default PasswordInput;
