import { Download, FileSpreadsheet } from 'lucide-react';
import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

const rupiah = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

const formatCell = (value, header) => {
    if (header === 'Nominal' && typeof value === 'number') return rupiah.format(value);
    return value ?? '-';
};

export default function ReportPreviewModal({ isOpen, onClose, report, loading, error, exportUrl }) {
    const [activeSheet, setActiveSheet] = useState(0);

    useEffect(() => {
        setActiveSheet(0);
    }, [report?.key]);

    const sheet = report?.sheets?.[activeSheet];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={report?.title || 'Preview Laporan'}
            description={report ? `Data yang sama dengan ekspor Excel · Dibuat ${report.generated_at}` : 'Memuat data laporan dari sumber ekspor Excel.'}
            size="full"
            footer={
                <>
                    <Button type="button" variant="secondary" onClick={onClose}>Tutup</Button>
                    {exportUrl && (
                        <Button as="a" href={exportUrl} icon={Download}>Ekspor Excel</Button>
                    )}
                </>
            }
        >
            {loading ? (
                <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-[#6B7C93]" role="status">
                    <span className="size-8 animate-spin rounded-full border-3 border-[#DCE7F3] border-t-[#0B63CE]" aria-hidden="true" />
                    <p className="text-sm font-medium">Menyiapkan preview laporan…</p>
                </div>
            ) : error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800" role="alert">
                    {error}
                </div>
            ) : sheet ? (
                <div className="space-y-4">
                    {report.sheets.length > 1 && (
                        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Sheet laporan">
                            {report.sheets.map((item, index) => (
                                <button
                                    key={item.name}
                                    type="button"
                                    role="tab"
                                    aria-selected={activeSheet === index}
                                    onClick={() => setActiveSheet(index)}
                                    className={`min-h-10 rounded-lg border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] ${activeSheet === index ? 'border-[#0B63CE] bg-[#EAF5FF] text-[#0B63CE]' : 'border-[#DCE7F3] bg-white text-[#6B7C93] hover:text-[#112743]'}`}
                                >
                                    {item.name}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <FileSpreadsheet className="size-5 text-[#0B63CE]" aria-hidden="true" />
                            <h4 className="font-display text-base font-semibold text-[#0E2747]">{sheet.name}</h4>
                        </div>
                        <span className="rounded-full bg-[#F0F5FA] px-3 py-1 text-xs font-semibold text-[#6B7C93]">
                            {sheet.rows.length} baris
                        </span>
                    </div>

                    <div className="max-h-[62vh] overflow-auto rounded-xl border border-[#DCE7F3] bg-white">
                        <table className="min-w-max w-full border-collapse text-left text-xs">
                            <thead className="sticky top-0 z-10 bg-[#0E2747] text-white shadow-sm">
                                <tr>
                                    {sheet.headers.map((header) => (
                                        <th key={header} scope="col" className="whitespace-nowrap border-r border-white/15 px-3 py-3 font-semibold last:border-r-0">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#DCE7F3]">
                                {sheet.rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={sheet.headers.length} className="px-4 py-12 text-center text-sm text-[#6B7C93]">
                                            Belum ada data pada sheet ini.
                                        </td>
                                    </tr>
                                ) : sheet.rows.map((row, rowIndex) => (
                                    <tr key={`${sheet.name}-${rowIndex}`} className="odd:bg-white even:bg-[#F8FBFF] hover:bg-[#EAF5FF]/60">
                                        {row.map((value, cellIndex) => (
                                            <td key={`${rowIndex}-${cellIndex}`} className="max-w-72 whitespace-nowrap px-3 py-2.5 text-[#112743]">
                                                {formatCell(value, sheet.headers[cellIndex])}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : null}
        </Modal>
    );
}
