import React, { useId } from 'react';

export default function RadioGroup({
    label,
    name,
    value,
    onChange,
    options = [],
    required = false,
    disabled = false,
    error,
    helperText,
    className = '',
}) {
    const generatedId = useId();
    const groupId = name || generatedId;

    return (
        <fieldset className={`w-full ${className}`} disabled={disabled} aria-describedby={error ? `${groupId}-error` : helperText ? `${groupId}-helper` : undefined}>
            {label && (
                <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#112743]">
                    {label}
                    {required && <span className="ml-1 font-bold text-[#DD4D7C]" aria-hidden="true">*</span>}
                </legend>
            )}
            <div className="grid gap-2 sm:grid-cols-2">
                {options.map((option) => {
                    const optionValue = typeof option === 'object' ? option.value : option;
                    const optionLabel = typeof option === 'object' ? option.label : option;
                    const optionDescription = typeof option === 'object' ? option.description : undefined;
                    const optionId = `${groupId}-${String(optionValue).replace(/[^a-zA-Z0-9_-]/g, '-')}`;

                    return (
                        <label
                            key={String(optionValue)}
                            htmlFor={optionId}
                            className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors motion-reduce:transition-none ${
                                String(value) === String(optionValue)
                                    ? 'border-[#0B63CE] bg-[#EAF5FF]/60'
                                    : 'border-[#DCE7F3] bg-white hover:border-[#0B63CE]/50'
                            } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
                        >
                            <input
                                id={optionId}
                                type="radio"
                                name={name}
                                value={optionValue}
                                checked={String(value) === String(optionValue)}
                                onChange={() => onChange(optionValue)}
                                required={required}
                                className="mt-0.5 size-4 shrink-0 accent-[#0B63CE] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                            />
                            <span className="min-w-0">
                                <span className="block text-sm font-medium text-[#112743]">{optionLabel}</span>
                                {optionDescription && <span className="mt-0.5 block text-xs leading-5 text-[#6B7C93]">{optionDescription}</span>}
                            </span>
                        </label>
                    );
                })}
            </div>
            {error && <p id={`${groupId}-error`} role="alert" className="mt-1.5 text-xs font-medium text-[#DD4D7C]">{error}</p>}
            {!error && helperText && <p id={`${groupId}-helper`} className="mt-1.5 text-xs text-[#6B7C93]">{helperText}</p>}
        </fieldset>
    );
}
