import React from 'react';

const typeStyles = {
    module: { label: 'Modul Penataran', bg: '#EAF5FF', text: '#0B63CE', border: '#BCE0FD' },
    book: { label: 'Buku & Monograf', bg: '#F0FDF4', text: '#2B8A3E', border: '#B2F2BB' },
    speaker_material: { label: 'Bahan Ajar Pemateri', bg: '#FFF3E6', text: '#E8590C', border: '#FFD8A8' },
    guideline: { label: 'Pedoman Teknis', bg: '#F3EDFF', text: '#7B5BF0', border: '#D0BFFF' },
    video: { label: 'Materi Video', bg: '#F8F0FC', text: '#AE3EC9', border: '#EEBEFA' },
    document: { label: 'Dokumen / SK', bg: '#F1F3F5', text: '#495057', border: '#CED4DA' },
    ebook: { label: 'E-Book Digital', bg: '#EAF5FF', text: '#0B63CE', border: '#BCE0FD' },
    reference: { label: 'Referensi', bg: '#E3FAFC', text: '#1098AD', border: '#99E9F2' },
};

export default function MaterialTypeBadge({ type = 'module', label, className = '' }) {
    const style = typeStyles[type] || {
        label: label || type,
        bg: '#F8FBFF',
        text: '#6B7C93',
        border: '#DCE7F3',
    };

    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${className}`}
            style={{
                backgroundColor: style.bg,
                color: style.text,
                borderColor: style.border,
            }}
        >
            {label || style.label}
        </span>
    );
}
