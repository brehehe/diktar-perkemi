import React, { useId } from 'react';
import Input from './Input';
import Select from './Select';
import Textarea from './Textarea';

export default function FormField({
    label,
    name,
    required = false,
    helperText,
    error,
    children,
    className = '',
}) {
    const generatedId = useId();
    const inputId = name || generatedId;
    const field = React.isValidElement(children) && [Input, Select, Textarea].includes(children.type)
        ? React.cloneElement(children, { id: children.props.id || inputId })
        : children;

    return (
        <div className={`space-y-1.5 ${className}`}>
            {label && (
                <div className="flex items-center justify-between">
                    <label
                        htmlFor={name || (React.isValidElement(children) && [Input, Select, Textarea].includes(children.type) ? children.props.id || inputId : undefined)}
                        className="block text-xs font-semibold text-[#112743]"
                    >
                        {label}
                        {required && <span className="text-[#DD4D7C] ml-1">*</span>}
                    </label>
                </div>
            )}

            {field}

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
