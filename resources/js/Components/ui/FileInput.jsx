import React, { forwardRef, useId } from 'react';

const FileInput = forwardRef(function FileInput({
    label,
    id,
    name,
    accept,
    onChange,
    error,
    helperText,
    required = false,
    disabled = false,
    visuallyHidden = false,
    className = '',
    ...props
}, ref) {
    const generatedId = useId();
    const inputId = id || name || generatedId;

    if (visuallyHidden) {
        return (
            <input
                ref={ref}
                id={inputId}
                name={name}
                type="file"
                accept={accept}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className="sr-only"
                {...props}
            />
        );
    }

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={inputId} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#112743]">
                    {label}
                    {required && <span className="ml-1 font-bold text-[#DD4D7C]" aria-hidden="true">*</span>}
                </label>
            )}
            <input
                ref={ref}
                id={inputId}
                name={name}
                type="file"
                accept={accept}
                onChange={onChange}
                required={required}
                disabled={disabled}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
                className={`block min-h-11 w-full rounded-lg border border-[#DCE7F3] bg-white text-sm text-[#112743] file:mr-3 file:min-h-11 file:border-0 file:border-r file:border-[#DCE7F3] file:bg-[#EAF5FF] file:px-4 file:text-sm file:font-semibold file:text-[#0B63CE] hover:border-[#0B63CE]/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] disabled:cursor-not-allowed disabled:bg-[#F8FBFF] disabled:opacity-60 ${className}`}
                {...props}
            />
            {error && <p id={`${inputId}-error`} role="alert" className="mt-1.5 text-xs font-medium text-[#DD4D7C]">{error}</p>}
            {!error && helperText && <p id={`${inputId}-helper`} className="mt-1.5 text-xs text-[#6B7C93]">{helperText}</p>}
        </div>
    );
});

export default FileInput;
