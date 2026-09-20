import React from 'react';
import AlertDialog from '../ui/AlertDialog';

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = 'Konfirmasi Hapus Data',
    description = 'Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin melanjutkan?',
    confirmText = 'Hapus',
    cancelText = 'Batal',
    variant = 'danger',
    loading = false,
}) {
    return (
        <AlertDialog
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title={title}
            description={description}
            confirmText={confirmText}
            cancelText={cancelText}
            variant={variant}
            loading={loading}
        />
    );
}
