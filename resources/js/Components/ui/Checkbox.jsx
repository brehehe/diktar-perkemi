import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';

const Checkbox = forwardRef(function Checkbox(
    {
        label,
        id,
        name,
        checked = false,
        onChange,
        disabled = false,
        helperText,
        className = '',
        ...props
    },
    ref
) {
    const inputId = id || name || `checkbox-${Math.random().toString(36).substring(2, 9)}`;

    return (
        <label
            htmlFor={inputId}
            className={`inline-flex items-start gap-3 cursor-pointer select-none ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
        >
            <div className="relative flex items-center pt-0.5">
                <input
                    ref={ref}
                    id={inputId}
                    name={name}
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    className="sr-only peer"
                    {...props}
                />
                <div
                    className={`
                        w-4.5 h-4.5 rounded border transition-all duration-150 flex items-center justify-center
                        border-[#DCE7F3] bg-white
                        peer-checked:bg-[#0B63CE] peer-checked:border-[#0B63CE]
                        peer-focus:ring-2 peer-focus:ring-[#0B63CE]/30 peer-focus:ring-offset-1
                        peer-disabled:bg-[#F8FBFF] peer-disabled:border-[#DCE7F3]
                    `}
                >
                    {checked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                </div>
            </div>
            {(label || helperText) && (
                <div className="text-sm">
                    {label && <span className="font-medium text-[#112743]">{label}</span>}
                    {helperText && <p className="text-xs text-[#6B7C93] mt-0.5">{helperText}</p>}
                </div>
            )}
        </label>
    );
});

export default Checkbox;
