import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Info, AlertOctagon } from 'lucide-react';
import Button from './Button';

export default function AlertDialog({
    isOpen,
    open,
    onClose,
    onCancel,
    onOpenChange,
    onConfirm,
    title = 'Konfirmasi Tindakan',
    description,
    confirmText,
    confirmLabel,
    cancelText,
    cancelLabel,
    variant = 'danger',
    loading = false,
}) {
    const dialogRef = useRef(null);
    const cancelButtonRef = useRef(null);
    const previousActiveElement = useRef(null);

    const isShown = Boolean(isOpen ?? open);
    const resolvedConfirmText = confirmText || confirmLabel || 'Lanjutkan';
    const resolvedCancelText = cancelText || cancelLabel || 'Batal';

    const handleClose = () => {
        if (loading) return;
        if (onClose) onClose();
        if (onCancel) onCancel();
        if (onOpenChange) onOpenChange(false);
    };

    useEffect(() => {
        if (isShown) {
            previousActiveElement.current = document.activeElement;
            document.body.style.overflow = 'hidden';
            setTimeout(() => cancelButtonRef.current?.focus(), 50);
        } else {
            document.body.style.overflow = '';
            if (previousActiveElement.current) {
                previousActiveElement.current.focus();
            }
        }
    }, [isShown]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isShown && !loading) {
                e.preventDefault();
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isShown, loading]);

    if (!isShown) return null;

    const iconMap = {
        danger: <AlertTriangle className="w-5 h-5 text-[#FA5252]" />,
        warning: <AlertOctagon className="w-5 h-5 text-[#EE9B25]" />,
        info: <Info className="w-5 h-5 text-[#0B63CE]" />,
    };

    const iconBgMap = {
        danger: 'bg-[#FDE8EF]',
        warning: 'bg-[#FEF6E9]',
        info: 'bg-[#EAF5FF]',
    };

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <div
                className="fixed inset-0 bg-[#0E2747]/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
                onClick={handleClose}
            />

            <div
                ref={dialogRef}
                className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#DCE7F3] overflow-hidden z-10 p-6 animate-in zoom-in-95 duration-200"
            >
                <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-full shrink-0 ${iconBgMap[variant] || iconBgMap.danger}`}>
                        {iconMap[variant] || iconMap.danger}
                    </div>
                    <div className="flex-1">
                        <h3 id="alert-dialog-title" className="text-base font-bold text-[#112743]">
                            {title}
                        </h3>
                        {description && (
                            <p id="alert-dialog-description" className="text-xs text-[#6B7C93] mt-2 leading-relaxed">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-[#DCE7F3]/60">
                    <Button
                        ref={cancelButtonRef}
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={loading}
                        onClick={handleClose}
                    >
                        {resolvedCancelText}
                    </Button>
                    <Button
                        type="button"
                        variant={variant === 'danger' ? 'danger' : 'primary'}
                        size="sm"
                        loading={loading}
                        onClick={onConfirm}
                    >
                        {resolvedConfirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}
