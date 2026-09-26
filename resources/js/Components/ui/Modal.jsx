import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
    const [mounted, setMounted] = useState(false);
    const modalRef = useRef(null);
    const previousActiveElement = useRef(null);
    const generatedId = useId();
    const titleId = `${generatedId}-title`;
    const descriptionId = `${generatedId}-description`;

    useEffect(() => {
        setMounted(true);
    }, []);

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

    if (!isOpen || (!mounted && typeof document === 'undefined')) return null;

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
        'max-w-5xl': 'max-w-5xl',
        'max-w-6xl': 'max-w-6xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        '6xl': 'max-w-6xl',
        lg: 'max-w-2xl',
        xl: 'max-w-3xl',
        '2xl': 'max-w-4xl',
        full: 'max-w-none',
    };

    const ContainerElement = onSubmit ? 'form' : 'div';

    const modalMarkup = (
        <div
            className={`fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center ${resolvedSize === 'full' ? 'p-0 sm:p-4 md:p-6' : 'p-3 sm:p-6 py-6 sm:py-10'}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descriptionId : undefined}
        >
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-[#0E2747]/75 backdrop-blur-xs motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200 cursor-pointer"
                onClick={() => !isProcessing && onClose()}
            />

            {/* Modal Dialog */}
            <ContainerElement
                ref={modalRef}
                onSubmit={onSubmit}
                className={`
                    relative w-full ${sizes[resolvedSize] || sizes.md} my-auto
                    ${resolvedSize === 'full' ? 'h-full max-h-screen sm:h-[92vh] sm:max-h-[92vh] rounded-none sm:rounded-2xl' : 'max-h-[calc(100vh-3rem)] sm:max-h-[calc(100vh-5rem)] rounded-xl sm:rounded-2xl'}
                    bg-white shadow-2xl border border-[#DCE7F3]
                    flex flex-col z-10 motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-200 overflow-hidden
                `}
            >
                {/* Header - Fixed at top */}
                {(title || onClose) && (
                    <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-[#DCE7F3] flex items-center justify-between gap-3 bg-[#F8FBFF] shrink-0">
                        <div className="min-w-0 flex-1">
                            {title && (
                                <h3 id={titleId} className="text-sm sm:text-base font-bold text-[#112743] truncate">
                                    {title}
                                </h3>
                            )}
                            {description && (
                                <p id={descriptionId} className="text-xs text-[#6B7C93] mt-0.5 line-clamp-2">
                                    {description}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                type="button"
                                disabled={isProcessing}
                                onClick={onClose}
                                aria-label="Tutup dialog"
                                className="inline-flex min-h-9 items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DCE7F3] bg-white text-xs font-semibold text-[#0E2747] hover:bg-[#EAF5FF] hover:border-[#0B63CE] hover:text-[#0B63CE] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] disabled:opacity-40 cursor-pointer shadow-2xs"
                            >
                                <X className="w-4 h-4 text-slate-500" />
                                <span>Tutup</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Content - Scrollable with proper margins */}
                <div className={`overflow-y-auto flex-1 overscroll-contain ${resolvedSize === 'full' ? 'w-full max-w-6xl mx-auto p-3 sm:p-5' : 'px-4 pt-4 pb-6 sm:px-6'}`}>
                    {children}
                </div>

                {/* Optional Footer */}
                {footer && (
                    <div className="px-4 py-3 sm:px-6 border-t border-[#DCE7F3] bg-[#F8FBFF] flex flex-wrap items-center justify-end gap-2.5 shrink-0">
                        {footer}
                    </div>
                )}
            </ContainerElement>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalMarkup, document.body) : modalMarkup;
}
