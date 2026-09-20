import React, { forwardRef, useId } from 'react';

const Radio = forwardRef(function Radio({ id, label, helperText, className = '', ...props }, ref) {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
        <label htmlFor={inputId} className={`inline-flex cursor-pointer items-start gap-2.5 ${props.disabled ? 'cursor-not-allowed opacity-60' : ''} ${className}`}>
            <input
                ref={ref}
                id={inputId}
                type="radio"
                className="mt-0.5 size-4 shrink-0 accent-[#0B63CE] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                {...props}
            />
            {(label || helperText) && (
                <span>
                    {label && <span className="block text-sm font-medium text-[#112743]">{label}</span>}
                    {helperText && <span className="mt-0.5 block text-xs text-[#6B7C93]">{helperText}</span>}
                </span>
            )}
        </label>
    );
});

export default Radio;
