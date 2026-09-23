import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Printer, ArrowLeft, Shield } from 'lucide-react';

export default function PrintIntegrityPact({
    event,
    participant,
    pact,
    pledgePoints = [],
}) {
    const handlePrint = () => {
        window.print();
    };

    const certTitleLabel =
        pact.pact_type === 'penguji'
            ? 'Nomor Sertifikat Penguji'
            : pact.pact_type === 'wasit'
            ? 'Nomor Sertifikat Wasit'
            : 'Nomor Sertifikat Pelatih';

    return (
        <div className="min-h-screen bg-[#F0F2F5] py-4 print:bg-white print:py-0">
            <Head title={`Cetak Pakta Integritas - ${pact.full_name}`} />

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
                        <p className="text-[11px] text-[#6B7C93]">Pakta Integritas {pact.role_label}</p>
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
            <article className="a4-sheet mx-auto max-w-[210mm] bg-white p-[18mm] text-[#111111] shadow-md print:max-w-none print:p-0 print:shadow-none font-serif leading-relaxed">
                {/* Header Title */}
                <div className="text-center pb-4">
                    <h1 className="text-xl font-bold uppercase tracking-wider underline underline-offset-4">
                        PAKTA INTEGRITAS
                    </h1>
                </div>

                {/* Body Intro */}
                <p className="mt-4 text-[13px] leading-relaxed">
                    Saya yang bertanda tangan di bawah ini:
                </p>

                {/* Field List (Dotted line table layout matching docx) */}
                <div className="mt-2 space-y-1.5 text-[12.5px] leading-snug">
                    <div className="flex items-baseline">
                        <span className="w-56 shrink-0 font-medium">Nama Lengkap</span>
                        <span className="mr-2">:</span>
                        <span className="flex-1 font-bold">{pact.full_name}</span>
                    </div>

                    <div className="flex items-baseline">
                        <span className="w-56 shrink-0 font-medium">Tempat/Tanggal Lahir</span>
                        <span className="mr-2">:</span>
                        <span className="flex-1">
                            {pact.birth_place ? `${pact.birth_place}, ` : ''}{pact.birth_date}
                        </span>
                    </div>

                    <div className="flex items-baseline">
                        <span className="w-56 shrink-0 font-medium">Nomor Induk Kenshi</span>
                        <span className="mr-2">:</span>
                        <span className="flex-1 font-mono font-medium">{pact.kenshi_id_number}</span>
                    </div>

                    <div className="flex items-baseline">
                        <span className="w-56 shrink-0 font-medium">{certTitleLabel}</span>
                        <span className="mr-2">:</span>
                        <span className="flex-1 font-mono">{pact.certificate_number || '........................................................'}</span>
                    </div>

                    <div className="flex items-baseline">
                        <span className="w-56 shrink-0 font-medium">Tanggal Berlaku Sertifikat</span>
                        <span className="mr-2">:</span>
                        <span className="flex-1">
                            {pact.valid_start_date || '..........'} sd {pact.valid_end_date || '..........'}
                        </span>
                    </div>

                    <div className="flex items-start">
                        <span className="w-56 shrink-0 font-medium pt-0.5">Alamat lengkap sesuai KTP</span>
                        <span className="mr-2 pt-0.5">:</span>
                        <span className="flex-1 leading-snug">{pact.id_card_address || '-'}</span>
                    </div>

                    <div className="flex items-start">
                        <span className="w-56 shrink-0 font-medium pt-0.5">Alamat lengkap saat ini</span>
                        <span className="mr-2 pt-0.5">:</span>
                        <span className="flex-1 leading-snug">{pact.current_address || pact.id_card_address || '-'}</span>
                    </div>

                    <div className="flex items-baseline">
                        <span className="w-56 shrink-0 font-medium">Tingkatan</span>
                        <span className="mr-2">:</span>
                        <span className="flex-1 font-semibold">{pact.dan_level}</span>
                    </div>

                    <div className="flex items-baseline">
                        <span className="w-56 shrink-0 font-medium">Agama</span>
                        <span className="mr-2">:</span>
                        <span className="flex-1">{pact.religion || 'Islam'}</span>
                    </div>

                    <div className="flex items-baseline">
                        <span className="w-56 shrink-0 font-medium">Dojo</span>
                        <span className="mr-2">:</span>
                        <span className="flex-1">{pact.dojo || '-'}</span>
                    </div>

                    <div className="flex items-baseline">
                        <span className="w-56 shrink-0 font-medium">Kota</span>
                        <span className="mr-2">:</span>
                        <span className="flex-1">{pact.city || '-'}</span>
                    </div>

                    <div className="flex items-baseline">
                        <span className="w-56 shrink-0 font-medium">Provinsi</span>
                        <span className="mr-2">:</span>
                        <span className="flex-1">{pact.province || 'Jawa Timur'}</span>
                    </div>

                    <div className="flex items-baseline">
                        <span className="w-56 shrink-0 font-medium">Menjadi Pengurus pada</span>
                        <span className="mr-2">:</span>
                        <span className="flex-1">
                            {pact.management_organization || '-'}
                            <span className="mx-2 font-medium">sebagai</span>
                            {pact.management_position || '-'}
                        </span>
                    </div>
                </div>

                {/* Pernyataan Intro */}
                <p className="mt-4 text-[12.5px] leading-relaxed">
                    dengan ini menyatakan secara sadar dan sungguh-sungguh atas hal-hal sebagai berikut:
                </p>

                {/* 5 Butir Poin Komitmen Resmi DOCX */}
                <ol className="mt-2 list-outside list-decimal space-y-1.5 pl-6 text-[12px] leading-relaxed text-justify">
                    {pledgePoints.map((point, index) => (
                        <li key={index} className="pl-1">
                            {point}
                        </li>
                    ))}
                </ol>

                {/* Paragraf Penutup */}
                <p className="mt-3.5 text-[12px] leading-relaxed text-justify">
                    Demikian Pakta Integritas ini saya ditandatangani dengan kesadaran penuh tanpa desakan atau paksaan didalam bentuk yang bagaimanapun dan dari pihak manapun. Saya melakukan pelanggaran dengan sengaja ataupun tanpa sengaja, atas ketentuan dan/atau persyaratan Pakta Integritas ini, tertulis atau tersirat, maka Saya bersedia untuk bertanggung jawab sepenuhnya termasuk untuk mendapatkan sanksi Organisasi sesuai dengan ketentuan yang berlaku.
                </p>

                {/* Bagian Tanda Tangan & Materai */}
                <div className="mt-6 flex justify-end">
                    <div className="w-64 text-center text-[12.5px]">
                        <p>
                            {pact.sign_place}, {pact.sign_date}
                        </p>
                        <p className="mt-0.5">Yang menyatakan,</p>

                        {/* Kotak Materai Rp 10.000 + Overlay TTD Digital */}
                        <div className="relative mx-auto my-2 flex h-28 w-44 items-center justify-center">
                            {/* Kotak Materai 10.000 */}
                            <div className="absolute inset-0 m-auto flex h-14 w-28 flex-col items-center justify-center rounded border border-dashed border-emerald-600 bg-emerald-50/70 text-center">
                                <span className="text-[8px] font-black tracking-widest text-emerald-800 uppercase">
                                    MATERAI
                                </span>
                                <span className="text-[10px] font-black text-emerald-700">
                                    Rp. 10.000
                                </span>
                            </div>

                            {/* Tanda Tangan Digital Overlay */}
                            {pact.signature_data ? (
                                <img
                                    src={pact.signature_data}
                                    alt="Tanda Tangan Digital"
                                    className="relative z-10 max-h-24 max-w-full object-contain"
                                />
                            ) : (
                                <div className="relative z-10 text-[10px] text-slate-400 italic">
                                    (Belum Ditandatangani)
                                </div>
                            )}
                        </div>

                        {/* Nama Terang Huruf Besar */}
                        <p className="font-bold underline underline-offset-2 uppercase">
                            ({pact.full_name})
                        </p>
                    </div>
                </div>
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
                        margin: 15mm 18mm 15mm 18mm;
                    }
                    .a4-sheet {
                        width: 100% !important;
                        max-width: none !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
