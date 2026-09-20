import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
    as: Component = 'button',
    children,
    type = 'button',
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    className = '',
    icon: Icon,
    iconPosition = 'left',
    onClick,
    ...props
}) {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] disabled:cursor-not-allowed disabled:opacity-60 select-none active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100';

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
        sm: 'min-h-11 gap-1.5 px-3 py-2 text-xs sm:min-h-9',
        md: 'text-sm px-4 py-2 gap-2 min-h-[38px]',
        lg: 'text-base px-5 py-2.5 gap-2.5 min-h-[44px]',
    };

    const renderIcon = (iconItem) => {
        if (!iconItem) return null;
        if (React.isValidElement(iconItem)) {
            return iconItem;
        }
        const IconComponent = iconItem;
        return <IconComponent className="w-4 h-4 shrink-0" aria-hidden="true" />;
    };

    const isNativeButton = Component === 'button';
    const isDisabled = disabled || loading;

    return (
        <Component
            {...(isNativeButton
                ? { type, disabled: isDisabled }
                : { 'aria-disabled': isDisabled || undefined, tabIndex: isDisabled ? -1 : undefined })}
            onClick={(event) => {
                if (isDisabled) {
                    event.preventDefault();
                    return;
                }
                onClick?.(event);
            }}
            className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
            {...props}
        >
            {loading && <Loader2 className="w-4 h-4 animate-spin text-current motion-reduce:animate-none" aria-hidden="true" />}
            {!loading && Icon && iconPosition === 'left' && renderIcon(Icon)}
            <span>{children}</span>
            {!loading && Icon && iconPosition === 'right' && renderIcon(Icon)}
        </Component>
    );
}
