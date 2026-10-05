import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Printer, ArrowLeft, Shield, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import Button from '../../../Components/ui/Button';

const rupiah = (val) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(val || 0);

export default function PrintRab({
    event,
    incomes = [],
    expenses = [],
    summary = {},
    printedBy = 'Administrator',
    printDate = '',
}) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-100 p-4 sm:p-8 font-sans text-slate-900 print:bg-white print:p-0">
            <Head title={`Cetak RAB — ${event.name}`} />

            <style>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        background: #fff !important;
                        font-size: 10pt;
                    }
                    @page {
                        size: A4 portrait;
                        margin: 12mm 12mm 15mm 12mm;
                    }
                    .print-table {
                        border-collapse: collapse !important;
                        width: 100% !important;
                    }
                    .print-table th, .print-table td {
                        border: 1px solid #475569 !important;
                        padding: 4px 6px !important;
                    }
                    .page-break-inside-avoid {
                        page-break-inside: avoid;
                    }
                }
            `}</style>

            {/* Top Toolbar (Hidden on Print) */}
            <div className="no-print mx-auto max-w-4xl mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-xs border border-slate-200">
                <div className="flex items-center gap-3">
                    <Button
                        as={Link}
                        href={`/admin/event/${event.id}?tab=rab`}
                        variant="outline"
                        size="sm"
                        icon={ArrowLeft}
                    >
                        Kembali ke Detail Event
                    </Button>
                    <div>
                        <h1 className="text-sm font-bold text-slate-900">
                            Pratinjau Cetak Rencana Anggaran Biaya (RAB)
                        </h1>
                        <p className="text-xs text-slate-500">
                            Format resmi dokumen anggaran kegiatan Persaudaraan Shorinji Kempo Indonesia
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
                        className="bg-[#0B63CE] text-white hover:bg-[#0A3F82]"
                    >
                        Cetak Dokumen (Ctrl+P)
                    </Button>
                </div>
            </div>

            {/* Printable Document Paper */}
            <div className="mx-auto max-w-4xl bg-white p-8 sm:p-12 shadow-sm rounded-lg print:shadow-none print:p-0 border border-slate-200 print:border-none">
                {/* Official Letterhead (Kop Surat) */}
                <div className="border-b-2 border-slate-900 pb-3 mb-6">
                    <div className="text-center space-y-1">
                        <h2 className="text-lg sm:text-xl font-bold tracking-wider text-slate-950 uppercase font-serif">
                            PERSAUDARAAN SHORINJI KEMPO INDONESIA
                        </h2>
                        <h3 className="text-sm sm:text-base font-bold text-[#0B63CE] uppercase tracking-wide">
                            PENGURUS BESAR (PB. PERKEMI) / PANITIA PELAKSANA
                        </h3>
                        <p className="text-[11px] text-slate-600 max-w-xl mx-auto">
                            Sekretariat: Pondok Gede, Jakarta Timur / Tempat Pelaksanaan: {event.place}
                        </p>
                    </div>
                    {/* Double Divider Line */}
                    <div className="mt-3 border-t border-slate-900 pt-0.5" />
                </div>

                {/* Document Title */}
                <div className="text-center my-6">
                    <h3 className="text-base sm:text-lg font-bold text-slate-950 uppercase tracking-wide underline underline-offset-4">
                        RENCANA ANGGARAN BIAYA (RAB)
                    </h3>
                    <p className="text-xs font-semibold text-slate-700 mt-1 uppercase">
                        {event.name}
                    </p>
                </div>

                {/* Metadata Box */}
                <div className="mb-6 rounded-md border border-slate-300 bg-slate-50/50 p-3 text-xs">
                    <div className="grid grid-cols-2 gap-y-1.5 sm:grid-cols-4">
                        <div>
                            <span className="text-slate-500 block text-[10px] uppercase">Kegiatan</span>
                            <span className="font-semibold text-slate-800">{event.name}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block text-[10px] uppercase">Waktu Pelaksanaan</span>
                            <span className="font-semibold text-slate-800">{event.date_formatted}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block text-[10px] uppercase">Tempat / Lokasi</span>
                            <span className="font-semibold text-slate-800">{event.place}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block text-[10px] uppercase">Penyelenggara</span>
                            <span className="font-semibold text-slate-800">{event.organizer}</span>
                        </div>
                    </div>
                </div>

                {/* SECTION 1: RENCANA PEMASUKAN */}
                <div className="mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        I. Rencana Penerimaan / Pemasukan Dana
                    </h4>
                    <table className="print-table w-full text-left text-xs border border-slate-400">
                        <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-400">
                            <tr>
                                <th className="px-2 py-1.5 w-8 text-center border-r border-slate-400">No</th>
                                <th className="px-2 py-1.5 border-r border-slate-400">Kategori</th>
                                <th className="px-2 py-1.5 border-r border-slate-400">Uraian Sumber Dana</th>
                                <th className="px-2 py-1.5 w-16 text-center border-r border-slate-400">Vol</th>
                                <th className="px-2 py-1.5 w-16 text-center border-r border-slate-400">Satuan</th>
                                <th className="px-2 py-1.5 w-28 text-right border-r border-slate-400">Tarif Satuan</th>
                                <th className="px-2 py-1.5 w-32 text-right border-r border-slate-400">Jumlah (Rp)</th>
                                <th className="px-2 py-1.5">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-300">
                            {incomes.map((item, index) => (
                                <tr key={item.id || index} className="border-b border-slate-300">
                                    <td className="px-2 py-1.5 text-center text-slate-600 border-r border-slate-300 font-mono">
                                        {index + 1}
                                    </td>
                                    <td className="px-2 py-1.5 border-r border-slate-300 font-medium">
                                        {item.category_name}
                                    </td>
                                    <td className="px-2 py-1.5 border-r border-slate-300 font-semibold text-slate-900">
                                        {item.item_name}
                                    </td>
                                    <td className="px-2 py-1.5 text-center border-r border-slate-300">
                                        {item.quantity}
                                    </td>
                                    <td className="px-2 py-1.5 text-center border-r border-slate-300 text-slate-600">
                                        {item.unit || 'paket'}
                                    </td>
                                    <td className="px-2 py-1.5 text-right font-mono border-r border-slate-300">
                                        {rupiah(item.unit_price)}
                                    </td>
                                    <td className="px-2 py-1.5 text-right font-mono font-bold text-slate-900 border-r border-slate-300">
                                        {rupiah(item.amount)}
                                    </td>
                                    <td className="px-2 py-1.5 text-[11px] text-slate-600">
                                        {item.notes || '-'}
                                    </td>
                                </tr>
                            ))}
                            {incomes.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-3 text-center text-slate-500 italic">
                                        Tidak ada rincian pemasukan anggaran yang tercatat.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-400">
                            <tr>
                                <td colSpan={6} className="px-2 py-1.5 text-right border-r border-slate-400">
                                    TOTAL RENCANA PEMASUKAN:
                                </td>
                                <td className="px-2 py-1.5 text-right font-mono font-bold text-emerald-800 border-r border-slate-400">
                                    {rupiah(summary.total_income || 0)}
                                </td>
                                <td />
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* SECTION 2: RENCANA PENGELUARAN */}
                <div className="mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-600" />
                        II. Rencana Pengeluaran / Belanja Kegiatan
                    </h4>
                    <table className="print-table w-full text-left text-xs border border-slate-400">
                        <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-400">
                            <tr>
                                <th className="px-2 py-1.5 w-8 text-center border-r border-slate-400">No</th>
                                <th className="px-2 py-1.5 border-r border-slate-400">Kategori</th>
                                <th className="px-2 py-1.5 border-r border-slate-400">Uraian Kebutuhan Belanja</th>
                                <th className="px-2 py-1.5 w-16 text-center border-r border-slate-400">Vol</th>
                                <th className="px-2 py-1.5 w-16 text-center border-r border-slate-400">Satuan</th>
                                <th className="px-2 py-1.5 w-28 text-right border-r border-slate-400">Tarif Satuan</th>
                                <th className="px-2 py-1.5 w-32 text-right border-r border-slate-400">Jumlah (Rp)</th>
                                <th className="px-2 py-1.5">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-300">
                            {expenses.map((item, index) => (
                                <tr key={item.id || index} className="border-b border-slate-300">
                                    <td className="px-2 py-1.5 text-center text-slate-600 border-r border-slate-300 font-mono">
                                        {index + 1}
                                    </td>
                                    <td className="px-2 py-1.5 border-r border-slate-300 font-medium">
                                        {item.category_name}
                                    </td>
                                    <td className="px-2 py-1.5 border-r border-slate-300 font-semibold text-slate-900">
                                        {item.item_name}
                                    </td>
                                    <td className="px-2 py-1.5 text-center border-r border-slate-300">
                                        {item.quantity}
                                    </td>
                                    <td className="px-2 py-1.5 text-center border-r border-slate-300 text-slate-600">
                                        {item.unit || 'paket'}
                                    </td>
                                    <td className="px-2 py-1.5 text-right font-mono border-r border-slate-300">
                                        {rupiah(item.unit_price)}
                                    </td>
                                    <td className="px-2 py-1.5 text-right font-mono font-bold text-slate-900 border-r border-slate-300">
                                        {rupiah(item.amount)}
                                    </td>
                                    <td className="px-2 py-1.5 text-[11px] text-slate-600">
                                        {item.notes || '-'}
                                    </td>
                                </tr>
                            ))}
                            {expenses.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-3 text-center text-slate-500 italic">
                                        Tidak ada rincian belanja anggaran yang tercatat.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-400">
                            <tr>
                                <td colSpan={6} className="px-2 py-1.5 text-right border-r border-slate-400">
                                    TOTAL RENCANA PENGELUARAN:
                                </td>
                                <td className="px-2 py-1.5 text-right font-mono font-bold text-rose-800 border-r border-slate-400">
                                    {rupiah(summary.total_expense || 0)}
                                </td>
                                <td />
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* REKAPITULASI & ESTIMASI SALDO */}
                <div className="page-break-inside-avoid my-6 rounded-md border border-slate-300 p-4 bg-slate-50/70">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                        Rekapitulasi Anggaran & Estimasi Saldo Kas
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-2.5 rounded bg-white border border-slate-200">
                            <span className="text-[10px] text-slate-500 uppercase block">Total Rencana Penerimaan</span>
                            <span className="text-sm font-bold font-mono text-emerald-700">
                                {rupiah(summary.total_income || 0)}
                            </span>
                        </div>
                        <div className="p-2.5 rounded bg-white border border-slate-200">
                            <span className="text-[10px] text-slate-500 uppercase block">Total Pagu Pengeluaran</span>
                            <span className="text-sm font-bold font-mono text-rose-700">
                                {rupiah(summary.total_expense || 0)}
                            </span>
                        </div>
                        <div className="p-2.5 rounded bg-white border border-slate-200">
                            <span className="text-[10px] text-slate-500 uppercase block">
                                Estimasi Surplus / (Defisit)
                            </span>
                            <span
                                className={`text-sm font-bold font-mono ${
                                    (summary.planned_balance || 0) >= 0 ? 'text-[#0A3F82]' : 'text-rose-700'
                                }`}
                            >
                                {rupiah(summary.planned_balance || 0)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* SIGNATURE BLOCK */}
                <div className="page-break-inside-avoid mt-10 pt-4 border-t border-slate-200 text-xs text-slate-800">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <span>Ditetapkan di: </span>
                            <span className="font-semibold">{event.place?.split(',')[0] || 'Tempat Pelaksanaan'}</span>
                        </div>
                        <div>
                            <span>Tanggal: </span>
                            <span className="font-semibold">{printDate}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 text-center">
                        <div>
                            <p className="font-semibold text-slate-700 mb-16">Mengetahui,<br />Ketua Panitia Pelaksana</p>
                            <div className="border-b border-slate-900 w-48 mx-auto" />
                            <p className="text-[11px] text-slate-600 mt-1">Nama Lengkap & Gelar</p>
                        </div>

                        <div>
                            <p className="font-semibold text-slate-700 mb-16">Dibuat Oleh,<br />Bendahara Kegiatan</p>
                            <div className="border-b border-slate-900 w-48 mx-auto" />
                            <p className="text-[11px] text-slate-600 mt-1">Nama Lengkap & Gelar</p>
                        </div>
                    </div>

                    <div className="mt-8 text-center text-[10px] text-slate-400">
                        Dokumen ini dicetak otomatis dari Sistem Informasi Penataran Diktar Perkemi pada {printDate} oleh {printedBy}.
                    </div>
                </div>
            </div>
        </div>
    );
}
