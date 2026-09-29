import { BarChart3, CalendarCheck, Download, Eye, FileCheck2, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';
import Button from '../ui/Button';
import ReportPreviewModal from './ReportPreviewModal';

const reportDefinitions = [
    {
        key: 'attendance',
        title: '1. Absensi per Tahapan',
        description: 'Rekap kehadiran registrasi, kelas harian, ujian, penutupan, dan persentase hadir.',
        exportPath: 'absensi',
        icon: CalendarCheck,
        iconClass: 'bg-blue-50 text-[#0B63CE]',
    },
    {
        key: 'outcomes',
        title: '2. Hasil & Kedisiplinan',
        description: 'Nilai CBT terbaik, rerata praktik, kelulusan, kehadiran, dan catatan kedisiplinan.',
        exportPath: 'capaian',
        icon: BarChart3,
        iconClass: 'bg-emerald-50 text-[#20A47A]',
    },
    {
        key: 'completeness',
        title: '3. Kelengkapan & CBT',
        description: 'Kelengkapan berkas peserta dan seluruh riwayat percobaan CBT dalam dua sheet.',
        exportPath: 'kelengkapan-cbt',
        icon: FileCheck2,
        iconClass: 'bg-purple-50 text-[#7957D5]',
    },
    {
        key: 'finance',
        title: '4. Laporan Keuangan',
        description: 'Rincian pemasukan, pengeluaran, kategori, sponsor, nominal, dan bukti transaksi.',
        exportPath: 'keuangan',
        icon: FileSpreadsheet,
        iconClass: 'bg-amber-50 text-[#EE9B25]',
    },
];

export default function EventReportExportCards({ eventId, canViewFinance = false }) {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [preview, setPreview] = useState(null);
    const [previewKey, setPreviewKey] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const openPreview = async (definition) => {
        setPreviewKey(definition.key);
        setPreview(null);
        setError(null);
        setLoading(true);
        setIsPreviewOpen(true);

        try {
            const response = await fetch(`/admin/event/${eventId}/laporan/preview/${definition.key}`, {
                credentials: 'same-origin',
                headers: { Accept: 'application/json' },
            });
            if (!response.ok) throw new Error('Preview laporan belum dapat dimuat. Silakan coba lagi.');
            setPreview(await response.json());
        } catch (requestError) {
            setError(requestError.message || 'Preview laporan belum dapat dimuat.');
        } finally {
            setLoading(false);
        }
    };

    const activeDefinition = reportDefinitions.find((item) => item.key === previewKey);
    const activeExportUrl = activeDefinition
        ? `/admin/event/${eventId}/laporan/export/${activeDefinition.exportPath}`
        : null;

    return (
        <>
            <div className={`grid gap-px overflow-hidden border border-[#DCE7F3] bg-[#DCE7F3] sm:grid-cols-2 ${canViewFinance ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
                {reportDefinitions.filter((definition) => definition.key !== 'finance' || canViewFinance).map((definition) => {
                    const Icon = definition.icon;
                    const exportUrl = `/admin/event/${eventId}/laporan/export/${definition.exportPath}`;

                    return (
                        <article key={definition.key} className="flex flex-col bg-white p-5 sm:p-6">
                            <div className={`flex size-10 items-center justify-center rounded-lg ${definition.iconClass}`}>
                                <Icon className="size-5" aria-hidden="true" />
                            </div>
                            <h4 className="mt-4 font-display text-base font-semibold text-[#0E2747]">{definition.title}</h4>
                            <p className="mt-2 flex-1 text-xs leading-5 text-[#6B7C93]">{definition.description}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <Button type="button" size="sm" variant="secondary" icon={Eye} onClick={() => openPreview(definition)}>
                                    Preview
                                </Button>
                                <Button as="a" href={exportUrl} size="sm" variant="outline" icon={Download}>
                                    Ekspor Excel
                                </Button>
                            </div>
                        </article>
                    );
                })}
            </div>

            <ReportPreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                report={preview}
                loading={loading}
                error={error}
                exportUrl={activeExportUrl}
            />
        </>
    );
}
