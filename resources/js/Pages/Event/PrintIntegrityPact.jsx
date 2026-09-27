import React from 'react';
import { Head } from '@inertiajs/react';
import { Printer, ArrowLeft } from 'lucide-react';
import IntegrityPactDocument from '../../Components/IntegrityPactDocument';

export default function PrintIntegrityPact({
    event,
    participant,
    pact,
}) {
    const handlePrint = () => {
        window.print();
    };

    const rawType = (pact.pact_type || '').toLowerCase();
    const roleLabel = rawType === 'penguji'
        ? 'Penguji'
        : rawType === 'wasit'
            ? 'Wasit'
            : 'Pelatih';

    const documentTitle = `Cetak Pakta Integritas - ${pact.full_name || pact.participant_name || ''}`;

    return (
        <div className="min-h-screen bg-[#F0F2F5] py-4 print:bg-white print:py-0">
            <Head title={documentTitle} />

            {/* Floating Topbar (Hidden on Print) */}
            <header className="no-print mx-auto mb-6 flex max-w-[210mm] items-center justify-between rounded-xl border border-[#DCE7F3] bg-white px-4 py-3 shadow-sm sm:px-6">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE7F3] px-3 py-1.5 text-xs font-semibold text-[#6B7C93] transition hover:bg-slate-50"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Kembali</span>
                    </button>
                    <div>
                        <h2 className="text-xs font-bold text-[#0E2747]">Pratinjau Dokumen Cetak Resmi</h2>
                        <p className="text-[11px] text-[#6B7C93]">Pakta Integritas {roleLabel}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#0B63CE] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#0A3F82]"
                    >
                        <Printer className="h-4 w-4" />
                        <span>Cetak / Simpan PDF</span>
                    </button>
                </div>
            </header>

            {/* A4 Sheet Container */}
            <article className="a4-sheet mx-auto max-w-[210mm] bg-white p-[10mm] md:p-[12mm] text-[#111111] shadow-md print:max-w-none print:p-0 print:shadow-none font-serif leading-relaxed">
                <IntegrityPactDocument pact={pact} isPrint={true} />
            </article>

            {/* Print Styling */}
            <style>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    @page {
                        size: A4 portrait;
                        margin: 10mm 15mm 10mm 15mm;
                    }
                    .a4-sheet {
                        width: 100% !important;
                        max-width: none !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                }
            `}</style>
        </div>
    );
}
