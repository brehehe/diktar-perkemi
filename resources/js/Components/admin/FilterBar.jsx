import React from 'react';

export default function FilterBar({ children, className = '' }) {
    return (
        <div className={`flex flex-wrap items-center gap-2 text-xs ${className}`}>
            {children}
        </div>
    );
}
