import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    size = 'md',
    isProcessing = false,
}) {
    const modalRef = useRef(null);
    const previousActiveElement = useRef(null);

    useEffect(() => {
        if (isOpen) {
            previousActiveElement.current = document.activeElement;
            document.body.style.overflow = 'hidden';

            // Focus first interactive element in modal
            const timer = setTimeout(() => {
                const focusable = modalRef.current?.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (focusable && focusable.length > 0) {
                    focusable[0].focus();
                }
            }, 50);

            return () => clearTimeout(timer);
        } else {
            document.body.style.overflow = '';
            if (previousActiveElement.current) {
                previousActiveElement.current.focus();
            }
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen && !isProcessing) {
                e.preventDefault();
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isProcessing, onClose]);

    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-3xl',
        '2xl': 'max-w-4xl',
    };

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            aria-describedby={description ? 'modal-description' : undefined}
        >
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-[#0E2747]/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
                onClick={() => !isProcessing && onClose()}
            />

            {/* Modal Dialog */}
            <div
                ref={modalRef}
                className={`
                    relative w-full ${sizes[size] || sizes.md} bg-white rounded-xl shadow-2xl border border-[#DCE7F3]
                    overflow-hidden z-10 transition-all transform animate-in zoom-in-95 duration-200
                `}
            >
                {/* Header */}
                {(title || onClose) && (
                    <div className="px-6 py-4 border-b border-[#DCE7F3] flex items-start justify-between gap-4 bg-[#F8FBFF]/60">
                        <div>
                            {title && (
                                <h3 id="modal-title" className="text-base font-bold text-[#112743]">
                                    {title}
                                </h3>
                            )}
                            {description && (
                                <p id="modal-description" className="text-xs text-[#6B7C93] mt-0.5">
                                    {description}
                                </p>
                            )}
                        </div>
                        <button
                            type="button"
                            disabled={isProcessing}
                            onClick={onClose}
                            aria-label="Tutup dialog"
                            className="text-[#6B7C93] hover:text-[#112743] hover:bg-[#EAF5FF] p-1.5 rounded-lg transition-colors disabled:opacity-40"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="px-6 py-5">
                    {children}
                </div>
            </div>
        </div>
    );
}
