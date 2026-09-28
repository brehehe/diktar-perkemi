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

export const DUTY_LABELS = {
    bendahara: 'Bendahara',
    acara: 'Sie Acara',
    dokumentasi: 'Dokumentasi',
};

export const rupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value || 0);

export const dateLabel = (value) =>
    value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`)) : '-';

export function Metric({ label, value, tone = 'blue', helper = null }) {
    const colors = {
        blue: 'border-[#0B63CE]',
        green: 'border-[#20A47A]',
        rose: 'border-[#DD4D7C]',
        navy: 'border-[#0E2747]',
        purple: 'border-[#7957D5]',
    };
    return (
        <div className={`border-l-4 ${colors[tone]} bg-white px-5 py-4`}>
            <p className="text-xs font-medium text-[#6B7C93]">{label}</p>
            <p className="mt-1 font-display text-2xl font-semibold text-[#0E2747]">{value}</p>
            {helper && <p className="mt-1 text-xs text-[#6B7C93]">{helper}</p>}
        </div>
    );
}

export function Empty({ children }) {
    return (
        <div className="border border-dashed border-[#DCE7F3] bg-[#F8FBFF] px-5 py-10 text-center text-sm text-[#6B7C93]">
            {children}
        </div>
    );
}

