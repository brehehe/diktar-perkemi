import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
    children,
    type = 'button',
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    className = '',
    icon: Icon,
    iconPosition = 'left',
    ...props
}) {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B63CE] focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variants = {
        primary: 'bg-[#0B63CE] text-white hover:bg-[#0A3F82] shadow-sm shadow-[#0B63CE]/20 active:bg-[#0E2747]',
        secondary: 'bg-white text-[#112743] border border-[#DCE7F3] hover:bg-[#F8FBFF] hover:border-[#0B63CE]/40 shadow-xs active:bg-[#EAF5FF]/40',
        danger: 'bg-[#FA5252] text-white hover:bg-[#E03131] shadow-sm shadow-[#FA5252]/20 active:bg-[#C92A2A]',
        destructive: 'bg-[#FA5252] text-white hover:bg-[#E03131] shadow-sm shadow-[#FA5252]/20 active:bg-[#C92A2A]',
        outline: 'bg-transparent text-[#0B63CE] border border-[#0B63CE] hover:bg-[#EAF5FF] active:bg-[#EAF5FF]/80',
        ghost: 'bg-transparent text-[#6B7C93] hover:text-[#0B63CE] hover:bg-[#EAF5FF]/60 active:bg-[#EAF5FF]',
        link: 'bg-transparent text-[#0B63CE] underline-offset-4 hover:underline p-0 h-auto font-normal',
    };

    const sizes = {
        sm: 'text-xs px-2.5 py-1.5 gap-1.5 min-h-[32px]',
        md: 'text-sm px-4 py-2 gap-2 min-h-[38px]',
        lg: 'text-base px-5 py-2.5 gap-2.5 min-h-[44px]',
    };

    return (
        <button
            type={type}
            disabled={disabled || loading}
            className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
            {...props}
        >
            {loading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
            {!loading && Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
            <span>{children}</span>
            {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </button>
    );
}
