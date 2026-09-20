import React from 'react';
import Select from '../ui/Select';

export default function PublicationStatusSelect({
    value,
    onChange,
    options = [
        { value: 'draft', label: 'Draf' },
        { value: 'review', label: 'Dalam Tinjauan' },
        { value: 'published', label: 'Terbit' },
        { value: 'archived', label: 'Diarsipkan' },
    ],
    error,
    helperText = null,
    className = '',
}) {
    return (
        <div className={className}>
            <Select
                label="Status Publikasi"
                name="status"
                value={value}
                onChange={onChange}
                options={options}
                required
                error={error}
            />
            {helperText && (
                <p className="mt-1.5 text-xs text-[#6B7C93]">
                    {helperText}
                </p>
            )}
            {value === 'published' && (
                <p className="mt-1.5 text-xs text-[#2B8A3E] bg-[#EBFBEE] border border-[#D3F9D8] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                    <span>Materi berstatus <strong>Terbit</strong> akan dapat diakses oleh kenshi sesuai peran yang diizinkan.</span>
                </p>
            )}
        </div>
    );
}
