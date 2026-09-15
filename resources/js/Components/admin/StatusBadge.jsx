import React from 'react';
import Badge from '../ui/Badge';

export default function StatusBadge({ status, label = null, size = 'sm' }) {
    let variant = 'neutral';
    let defaultLabel = status;

    switch (status) {
        case 'published':
            variant = 'published';
            defaultLabel = 'Terbit';
            break;
        case 'review':
            variant = 'review';
            defaultLabel = 'Dalam Tinjauan';
            break;
        case 'draft':
            variant = 'draft';
            defaultLabel = 'Draf';
            break;
        case 'archived':
            variant = 'archived';
            defaultLabel = 'Diarsipkan';
            break;
        default:
            variant = 'neutral';
            break;
    }

    return (
        <Badge variant={variant} size={size} dot>
            {label || defaultLabel}
        </Badge>
    );
}
