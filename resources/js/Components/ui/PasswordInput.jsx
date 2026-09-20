import React, { useId, useState, forwardRef } from 'react';
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
    const generatedId = useId();
    const inputId = id || name || generatedId;

    return (
        <div className="min-w-0 w-full">
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
                        min-h-11 w-full rounded-lg bg-white border text-sm text-[#112743] placeholder-[#6B7C93]/60 pl-3.5 pr-12 py-2 transition-colors duration-150 motion-reduce:transition-none
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
                    className="absolute inset-y-0 right-0 flex min-w-11 items-center justify-center text-[#6B7C93] hover:text-[#112743] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#0B63CE]"
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
