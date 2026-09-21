import React from 'react';

export default function Badge({
    children,
    variant = 'default',
    dot = false,
    className = '',
    style,
}) {
    const variants = {
        default: 'bg-[#F1F5F9] text-[#6B7C93] border-[#DCE7F3]',
        primary: 'bg-[#EAF5FF] text-[#0B63CE] border-[#BCE0FD]',
        published: 'bg-[#E8F8F2] text-[#147A5C] border-[#B2EBD6]',
        success: 'bg-[#E8F8F2] text-[#147A5C] border-[#B2EBD6]',
        review: 'bg-[#FEF6E9] text-[#B8710B] border-[#FCDFB2]',
        warning: 'bg-[#FEF6E9] text-[#B8710B] border-[#FCDFB2]',
        draft: 'bg-[#F1F5F9] text-[#6B7C93] border-[#DCE7F3]',
        archived: 'bg-[#FDE8EF] text-[#DD4D7C] border-[#F9B7CE]',
        danger: 'bg-[#FDE8EF] text-[#DD4D7C] border-[#F9B7CE]',
        purple: 'bg-[#F4F0FF] text-[#7957D5] border-[#DDD3FA]',
    };

    const dotColors = {
        default: 'bg-[#6B7C93]',
        primary: 'bg-[#0B63CE]',
        published: 'bg-[#20A47A]',
        success: 'bg-[#20A47A]',
        review: 'bg-[#EE9B25]',
        warning: 'bg-[#EE9B25]',
        draft: 'bg-[#6B7C93]',
        archived: 'bg-[#DD4D7C]',
        danger: 'bg-[#DD4D7C]',
        purple: 'bg-[#7957D5]',
    };

    return (
        <span
            style={style}
            className={`
                inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border
                ${variants[variant] || variants.default}
                ${className}
            `}
        >
            {dot && (
                <span
                    className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.default}`}
                    aria-hidden="true"
                />
            )}
            <span>{children}</span>
        </span>
    );
}
