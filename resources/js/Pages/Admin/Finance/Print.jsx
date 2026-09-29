import React, { useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Printer, ArrowLeft, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import Button from '../../../Components/ui/Button';

const rupiah = (val) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(val || 0);

const CATEGORY_LABELS = {
    sponsorship: 'Sponsorship',
    registration: 'Pendaftaran Peserta',
    grant: 'Hibah / Bantuan',
    accommodation: 'Akomodasi',
    consumption: 'Konsumsi',
    printing: 'Cetak & ATK',
    venue: 'Tempat / Venue',
    transport: 'Transportasi',
    other: 'Lain-lain',
};

export default function FinancePrint({
    selectedEvent = null,
    transactions = [],
    summary = {},
    filters = {},
    categoryLabels = {},
    printedBy = 'Administrator',
    printDate = '',
}) {
    const handlePrint = () => {
        window.print();
    };

    // Grouping by categories for summary
    const categoryStats = useMemo(() => {
        const income = {};
        const expense = {};

        transactions.forEach((tx) => {
            const cat = tx.category;
            const amt = Number(tx.amount) || 0;
            if (tx.type === 'income') {
                if (!income[cat]) income[cat] = { count: 0, total: 0 };
                income[cat].count += 1;
                income[cat].total += amt;
            } else {
                if (!expense[cat]) expense[cat] = { count: 0, total: 0 };
                expense[cat].count += 1;
                expense[cat].total += amt;
            }
        });

        return { income, expense };
    }, [transactions]);

    // Running balance calculator
    let runningBalance = 0;

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8 text-slate-800 print:bg-white print:p-0 print:text-black">
            <Head title="Cetak Laporan Keuangan — PB PERKEMI" />

            <style>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        background: #fff !important;
                        font-size: 11pt;
                    }
                    @page {
                        size: A4 portrait;
                        margin: 12mm 10mm;
                    }
                    .print-table {
                        border-collapse: collapse !important;
                        width: 100% !important;
                    }
                    .print-table th, .print-table td {
                        border: 1px solid #94a3b8 !important;
                        padding: 4px 6px !important;
                    }
                    .page-break-inside-avoid {
                        page-break-inside: avoid;
                    }
                }
            `}</style>

            {/* Top Toolbar (Hidden on Print) */}
            <div className="no-print mx-auto max-w-4xl mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                    <Button
                        as={Link}
                        href="/admin/keuangan"
                        variant="outline"
                        size="sm"
                        icon={ArrowLeft}
                    >
                        Kembali ke Keuangan
                    </Button>
                    <div>
                        <h1 className="text-sm font-bold text-slate-900">
                            Pratinjau Cetak Dokumen Keuangan
                        </h1>
                        <p className="text-xs text-slate-500">
                            Format standar laporan keuangan pertanggungjawaban PB PERKEMI
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        icon={Printer}
                        onClick={handlePrint}
                    >
                        Cetak Laporan (PDF)
                    </Button>
                </div>
            </div>

            {/* Official Report Document */}
            <div className="mx-auto max-w-4xl bg-white p-8 md:p-12 shadow-md print:shadow-none print:p-0">
                {/* Official Letterhead */}
                <div className="border-b-2 border-slate-900 pb-4 text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-700">
                        PERSATUAN PERSAUDARAAN SHORINJI KEMPO INDONESIA (PB PERKEMI)
                    </p>
                    <h2 className="mt-1 font-serif text-xl md:text-2xl font-black uppercase tracking-wide text-slate-950">
                        LAPORAN PERTANGGUNGJAWABAN KEUANGAN
                    </h2>
                    <p className="mt-1 text-sm font-medium text-slate-700">
                        {selectedEvent
                            ? `Kegiatan: ${selectedEvent.name}`
                            : 'Konsolidasi Seluruh Kegiatan Penataran Shorinji Kempo'}
                    </p>
                    {selectedEvent && (
                        <p className="text-xs text-slate-500">
                            {selectedEvent.date} · {selectedEvent.place} · Penyelenggara: {selectedEvent.organizer}
                        </p>
                    )}
                    <p className="mt-1 text-[11px] text-slate-400">
                        Dicetak pada: {printDate} WIB oleh {printedBy}
                    </p>
                </div>

                {/* Ringkasan Eksekutif (Cards / Box) */}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 page-break-inside-avoid">
                    <div className="rounded border border-emerald-200 bg-emerald-50/60 p-3 text-center print:border-slate-300 print:bg-slate-50">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 print:text-slate-700">
                            Total Pemasukan
                        </span>
                        <p className="mt-1 font-mono text-sm md:text-base font-bold text-emerald-900 print:text-black">
                            {rupiah(summary.income)}
                        </p>
                    </div>
                    <div className="rounded border border-rose-200 bg-rose-50/60 p-3 text-center print:border-slate-300 print:bg-slate-50">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 print:text-slate-700">
                            Total Pengeluaran
                        </span>
                        <p className="mt-1 font-mono text-sm md:text-base font-bold text-rose-900 print:text-black">
                            {rupiah(summary.expense)}
                        </p>
                    </div>
                    <div className="rounded border border-blue-200 bg-blue-50/60 p-3 text-center print:border-slate-300 print:bg-slate-50">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 print:text-slate-700">
                            Saldo Kas Bersih
                        </span>
                        <p className={`mt-1 font-mono text-sm md:text-base font-bold ${summary.balance >= 0 ? 'text-blue-900 print:text-black' : 'text-rose-700'}`}>
                            {rupiah(summary.balance)}
                        </p>
                    </div>
                    <div className="rounded border border-purple-200 bg-purple-50/60 p-3 text-center print:border-slate-300 print:bg-slate-50">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 print:text-slate-700">
                            Penerimaan Sponsor
                        </span>
                        <p className="mt-1 font-mono text-sm md:text-base font-bold text-purple-900 print:text-black">
                            {rupiah(summary.sponsor)}
                        </p>
                    </div>
                </div>

                {/* Rekapitulasi Pos Anggaran (2 Columns) */}
                <div className="mt-6 grid gap-6 sm:grid-cols-2 page-break-inside-avoid">
                    {/* Pemasukan */}
                    <div className="rounded border border-slate-200 print:border-slate-400">
                        <div className="bg-emerald-700 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white print:bg-slate-800">
                            Rincian Pos Pemasukan
                        </div>
                        <table className="w-full text-xs">
                            <tbody className="divide-y divide-slate-100">
                                {Object.keys(categoryStats.income).length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="p-3 text-center text-slate-400">
                                            Tidak ada pemasukan
                                        </td>
                                    </tr>
                                ) : (
                                    Object.entries(categoryStats.income).map(([cat, data]) => (
                                        <tr key={cat} className="hover:bg-slate-50">
                                            <td className="px-3 py-1.5 font-medium text-slate-800">
                                                {categoryLabels[cat] || CATEGORY_LABELS[cat] || cat}
                                            </td>
                                            <td className="px-2 py-1.5 text-right text-slate-500">
                                                {data.count} trx
                                            </td>
                                            <td className="px-3 py-1.5 text-right font-mono font-semibold text-emerald-800 print:text-black">
                                                {rupiah(data.total)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            <tfoot className="border-t border-slate-300 bg-slate-50 font-bold">
                                <tr>
                                    <td className="px-3 py-1.5 text-slate-900">Total Masuk</td>
                                    <td className="px-2 py-1.5 text-right text-slate-600">
                                        {Object.values(categoryStats.income).reduce((a, b) => a + b.count, 0)}
                                    </td>
                                    <td className="px-3 py-1.5 text-right font-mono text-emerald-900 print:text-black">
                                        {rupiah(summary.income)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Pengeluaran */}
                    <div className="rounded border border-slate-200 print:border-slate-400">
                        <div className="bg-rose-700 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white print:bg-slate-800">
                            Rincian Pos Pengeluaran
                        </div>
                        <table className="w-full text-xs">
                            <tbody className="divide-y divide-slate-100">
                                {Object.keys(categoryStats.expense).length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="p-3 text-center text-slate-400">
                                            Tidak ada pengeluaran
                                        </td>
                                    </tr>
                                ) : (
                                    Object.entries(categoryStats.expense).map(([cat, data]) => (
                                        <tr key={cat} className="hover:bg-slate-50">
                                            <td className="px-3 py-1.5 font-medium text-slate-800">
                                                {categoryLabels[cat] || CATEGORY_LABELS[cat] || cat}
                                            </td>
                                            <td className="px-2 py-1.5 text-right text-slate-500">
                                                {data.count} trx
                                            </td>
                                            <td className="px-3 py-1.5 text-right font-mono font-semibold text-rose-800 print:text-black">
                                                {rupiah(data.total)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            <tfoot className="border-t border-slate-300 bg-slate-50 font-bold">
                                <tr>
                                    <td className="px-3 py-1.5 text-slate-900">Total Keluar</td>
                                    <td className="px-2 py-1.5 text-right text-slate-600">
                                        {Object.values(categoryStats.expense).reduce((a, b) => a + b.count, 0)}
                                    </td>
                                    <td className="px-3 py-1.5 text-right font-mono text-rose-900 print:text-black">
                                        {rupiah(summary.expense)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Tabel Jurnal Transaksi / Buku Kas Mutasi */}
                <div className="mt-8">
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-800">
                        Buku Kas & Riwayat Mutasi Transaksi Detail ({transactions.length} Transaksi)
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="print-table w-full text-left text-xs border border-slate-300">
                            <thead className="bg-slate-800 text-white print:bg-slate-200 print:text-black">
                                <tr>
                                    <th className="p-2 text-center w-8">No</th>
                                    <th className="p-2 w-20">Tanggal</th>
                                    {!selectedEvent && <th className="p-2">Event</th>}
                                    <th className="p-2">Pos Kategori</th>
                                    <th className="p-2">Uraian / Keterangan</th>
                                    <th className="p-2 text-right">Debit (Masuk)</th>
                                    <th className="p-2 text-right">Kredit (Keluar)</th>
                                    <th className="p-2 text-right">Saldo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={selectedEvent ? 7 : 8} className="p-6 text-center text-slate-400">
                                            Tidak ada catatan transaksi pada filter ini.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((tx, idx) => {
                                        const debit = tx.type === 'income' ? tx.amount : 0;
                                        const credit = tx.type === 'expense' ? tx.amount : 0;
                                        runningBalance += (debit - credit);

                                        return (
                                            <tr key={tx.id} className="hover:bg-slate-50">
                                                <td className="p-2 text-center text-slate-500 font-mono">
                                                    {idx + 1}
                                                </td>
                                                <td className="p-2 whitespace-nowrap font-mono text-slate-600">
                                                    {tx.occurred_on}
                                                </td>
                                                {!selectedEvent && (
                                                    <td className="p-2 max-w-44 truncate text-slate-800 font-medium">
                                                        {tx.event_name}
                                                    </td>
                                                )}
                                                <td className="p-2 text-slate-700 whitespace-nowrap">
                                                    {tx.category_name || CATEGORY_LABELS[tx.category] || tx.category}
                                                </td>
                                                <td className="p-2 text-slate-800">
                                                    <span>{tx.description}</span>
                                                    {tx.sponsor_name && (
                                                        <span className="block text-[10px] text-purple-700 print:text-slate-600">
                                                            Sponsor: {tx.sponsor_name}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-2 text-right font-mono font-medium text-emerald-800 print:text-black tabular-nums whitespace-nowrap">
                                                    {debit > 0 ? rupiah(debit) : '-'}
                                                </td>
                                                <td className="p-2 text-right font-mono font-medium text-rose-800 print:text-black tabular-nums whitespace-nowrap">
                                                    {credit > 0 ? rupiah(credit) : '-'}
                                                </td>
                                                <td className="p-2 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                                                    {rupiah(runningBalance)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Lembar Pengesahan / Kolom Tanda Tangan */}
                <div className="mt-12 page-break-inside-avoid pt-4">
                    <div className="grid grid-cols-2 gap-8 text-center text-xs">
                        <div>
                            <p className="text-slate-500">Mengetahui,</p>
                            <p className="font-semibold text-slate-800">
                                Pengurus Besar PERKEMI / Bidang Diktar
                            </p>
                            <div className="h-20" />
                            <p className="font-bold underline text-slate-900">
                                ( .................................................... )
                            </p>
                            <p className="text-slate-500">Ketua Bidang Diklat & Penataran</p>
                        </div>
                        <div>
                            <p className="text-slate-500">Dilaporkan Oleh,</p>
                            <p className="font-semibold text-slate-800">
                                Bendahara Panitia Pelaksana
                            </p>
                            <div className="h-20" />
                            <p className="font-bold underline text-slate-900">
                                ( {printedBy} )
                            </p>
                            <p className="text-slate-500">Bendahara Kegiatan Penataran</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
