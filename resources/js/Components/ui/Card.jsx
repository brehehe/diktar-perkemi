import React from 'react';

export function CardHeader({ title, description, action, className = '' }) {
    return (
        <div className={`flex flex-col gap-3 border-b border-[#DCE7F3] px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5 ${className}`}>
            <div className="min-w-0">
                {title && <h2 className="font-display text-lg font-semibold text-[#0E2747]">{title}</h2>}
                {description && <p className="mt-1 text-sm leading-5 text-[#6B7C93]">{description}</p>}
            </div>
            {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
        </div>
    );
}

export function CardContent({ children, className = '' }) {
    return <div className={`p-4 sm:p-5 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
    return (
        <div className={`flex flex-wrap items-center justify-end gap-2 border-t border-[#DCE7F3] bg-[#F8FBFF] px-4 py-3.5 sm:px-5 ${className}`}>
            {children}
        </div>
    );
}

export default function Card({ children, className = '', as: Component = 'section', ...props }) {
    return (
        <Component
            className={`overflow-hidden rounded-xl border border-[#DCE7F3] bg-white shadow-xs ${className}`}
            {...props}
        >
            {children}
        </Component>
    );
}
