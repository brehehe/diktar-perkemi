import React from 'react';
import Button from './Button';

export default function LoadingButton({
    loading = false,
    loadingText = 'Memproses...',
    children,
    disabled = false,
    ...props
}) {
    return (
        <Button
            loading={loading}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? loadingText : children}
        </Button>
    );
}
