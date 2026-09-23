import React from 'react';
import Select from '../ui/Select';

export default function FilterSelect({
    value,
    onChange,
    options = [],
    placeholder = 'Semua',
    ariaLabel,
    className = 'w-full sm:w-auto sm:min-w-36 sm:max-w-56',
    ...props
}) {
    return (
        <Select
            value={value}
            onChange={(event) => onChange(event.target.value)}
            options={options}
            placeholder={placeholder}
            aria-label={ariaLabel || placeholder}
            className="h-10 min-h-10 py-2 text-xs truncate"
            wrapperClassName={`min-w-0 ${className}`}
            {...props}
        />
    );
}
