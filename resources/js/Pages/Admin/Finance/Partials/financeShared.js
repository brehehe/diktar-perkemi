export const rupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value || 0);

export const dateLabel = (value) =>
    value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`)) : '-';

export const CATEGORY_LABELS = {
    sponsorship: 'Sponsor',
    registration: 'Pendaftaran',
    grant: 'Hibah',
    accommodation: 'Akomodasi',
    consumption: 'Konsumsi',
    printing: 'Cetak',
    venue: 'Tempat',
    transport: 'Transportasi',
    other: 'Lainnya',
};

export const INCOME_CATEGORIES = [
    { value: 'sponsorship', label: 'Sponsor' },
    { value: 'registration', label: 'Pendaftaran' },
    { value: 'grant', label: 'Hibah / Bantuan' },
    { value: 'other', label: 'Lainnya' },
];

export const EXPENSE_CATEGORIES = [
    { value: 'accommodation', label: 'Akomodasi' },
    { value: 'consumption', label: 'Konsumsi' },
    { value: 'printing', label: 'Cetak & ATK' },
    { value: 'venue', label: 'Tempat / Venue' },
    { value: 'transport', label: 'Transportasi' },
    { value: 'other', label: 'Lainnya' },
];

