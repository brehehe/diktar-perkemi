import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    size = 'md',
    maxWidth,
    isProcessing = false,
    onSubmit,
}) {
    const modalRef = useRef(null);
    const previousActiveElement = useRef(null);
    const generatedId = useId();
    const titleId = `${generatedId}-title`;
    const descriptionId = `${generatedId}-description`;

    useEffect(() => {
        if (!isOpen) return;

        previousActiveElement.current = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const timer = setTimeout(() => {
            const focusable = modalRef.current?.querySelectorAll(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            focusable?.[0]?.focus();
        }, 50);

        return () => {
            clearTimeout(timer);
            document.body.style.overflow = previousOverflow;
            previousActiveElement.current?.focus?.();
        };
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen && !isProcessing) {
                e.preventDefault();
                onClose();
            }
            if (e.key === 'Tab' && isOpen) {
                const focusable = [...(modalRef.current?.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])') || [])];
                if (focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isProcessing, onClose]);

    if (!isOpen) return null;

    const resolvedSize = maxWidth || size;
    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-xl',
        'max-w-md': 'max-w-md',
        'max-w-lg': 'max-w-lg',
        'max-w-xl': 'max-w-xl',
        'max-w-2xl': 'max-w-2xl',
        'max-w-3xl': 'max-w-3xl',
        'max-w-4xl': 'max-w-4xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        lg: 'max-w-2xl',
        xl: 'max-w-3xl',
        '2xl': 'max-w-4xl',
        full: 'max-w-none',
    };

    const ContainerElement = onSubmit ? 'form' : 'div';

    return (
        <div
                className={`fixed inset-0 z-50 overflow-y-auto flex items-center justify-center ${resolvedSize === 'full' ? 'p-0' : 'p-4 sm:p-6 py-8 sm:py-12'}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descriptionId : undefined}
        >
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-[#0E2747]/60 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
                onClick={() => !isProcessing && onClose()}
            />

            {/* Modal Dialog */}
            <ContainerElement
                ref={modalRef}
                onSubmit={onSubmit}
                className={`
                    relative w-full ${sizes[resolvedSize] || sizes.md} my-auto
                    ${resolvedSize === 'full' ? 'h-dvh max-h-dvh rounded-none pb-[env(safe-area-inset-bottom)]' : 'max-h-[calc(100vh-5rem)] sm:max-h-[calc(100vh-6rem)] rounded-xl'}
                    bg-white shadow-2xl border border-[#DCE7F3]
                    flex flex-col z-10 motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-200 overflow-hidden
                `}
            >
                {/* Header - Fixed at top */}
                {(title || onClose) && (
                    <div className="px-6 py-4 border-b border-[#DCE7F3] flex items-center justify-between gap-4 bg-[#F8FBFF] shrink-0">
                        <div className="min-w-0 flex-1">
                            {title && (
                                <h3 id={titleId} className="text-base font-bold text-[#112743] truncate">
                                    {title}
                                </h3>
                            )}
                            {description && (
                                <p id={descriptionId} className="text-xs text-[#6B7C93] mt-0.5 line-clamp-2">
                                    {description}
                                </p>
                            )}
                        </div>
                        <button
                            type="button"
                            disabled={isProcessing}
                            onClick={onClose}
                            aria-label="Tutup dialog"
                            className="min-h-11 min-w-11 text-[#6B7C93] hover:text-[#112743] hover:bg-[#EAF5FF] p-1.5 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] disabled:opacity-40 shrink-0 cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Content - Scrollable with proper margins */}
                <div className={`px-4 pt-5 pb-6 sm:px-6 overflow-y-auto flex-1 overscroll-contain ${resolvedSize === 'full' ? 'w-full max-w-5xl mx-auto' : ''}`}>
                    {children}
                </div>

                {/* Optional Footer */}
                {footer && (
                    <div className="px-4 py-3.5 sm:px-6 border-t border-[#DCE7F3] bg-[#F8FBFF] flex flex-wrap items-center justify-end gap-2.5 shrink-0">
                        {footer}
                    </div>
                )}
            </ContainerElement>
        </div>
    );
}
