import React, { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(function Select(
    {
        label,
        id,
        name,
        value,
        onChange,
        options = [],
        placeholder = 'Pilih opsi...',
        children,
        error,
        helperText,
        required = false,
        disabled = false,
        className = '',
        wrapperClassName = '',
        ...props
    },
    ref
) {
    const generatedId = useId();
    const inputId = id || name || generatedId;

    return (
        <div className={`w-full min-w-0 ${wrapperClassName}`}>
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-xs font-semibold uppercase tracking-wider text-[#112743] mb-1.5"
                >
                    {label}
                    {required && <span className="text-[#FA5252] ml-1 font-bold" aria-hidden="true">*</span>}
                </label>
            )}
            <div className="relative min-w-0">
                <select
                    ref={ref}
                    id={inputId}
                    name={name}
                    value={value ?? ''}
                    onChange={onChange}
                    disabled={disabled}
                    required={required}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
                    className={`
                        ${className.includes('min-h-') ? '' : 'min-h-11'} w-full max-w-full truncate appearance-none rounded-lg bg-white border text-sm text-[#112743] pl-3.5 pr-10 py-2 transition-colors duration-150 cursor-pointer motion-reduce:transition-none
                        ${error ? 'border-[#FA5252] focus:border-[#FA5252] focus:ring-[#FA5252]/20' : 'border-[#DCE7F3] hover:border-[#0B63CE]/50 focus:border-[#0B63CE] focus:ring-[#0B63CE]/20'}
                        focus:outline-none focus:ring-3
                        disabled:bg-[#F8FBFF] disabled:text-[#6B7C93] disabled:cursor-not-allowed
                        ${className}
                    `}
                    {...props}
                >
                    {children ? (
                        <>
                            {placeholder && <option value="">{placeholder}</option>}
                            {children}
                        </>
                    ) : (
                        <>
                            {placeholder && <option value="">{placeholder}</option>}
                            {options.map((option) => {
                                const optValue = typeof option === 'object' ? option.value : option;
                                const optLabel = typeof option === 'object' ? option.label : option;
                                return (
                                    <option key={String(optValue)} value={optValue}>
                                        {optLabel}
                                    </option>
                                );
                            })}
                        </>
                    )}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#6B7C93]">
                    <ChevronDown className="w-4 h-4" />
                </div>
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

export default Select;
