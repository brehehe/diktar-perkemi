import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Printer, ArrowLeft, Edit3, CheckCircle2 } from 'lucide-react';
import Button from '../../Components/ui/Button';

const LOGO_PERKEMI = '/images/perkemi-logo.png';

export default function PrintRegistrationForm({
    event,
    participant,
    form,
    lampiranLabel = 'LAMPIRAN-A',
    waiverLampiranLabel = 'LAMPIRAN-E',
    photoRequirements = '1. 2 Helai Pas Foto(3 x 4)',
    canEdit = false,
}) {
    const handlePrint = () => {
        window.print();
    };

    const isNasional = form.penataran_level === 'Nasional';
    const formType = form.form_type || 'PELATIH'; // PELATIH, PENGUJI, WASIT
    const formTitle = `PERMOHONAN PENATARAN ${formType} ${isNasional ? 'NASIONAL' : 'DAERAH'}`;
    const waiverTitle = `SURAT PERNYATAAN DAN PEMBEBASAN`;

    // Render Piagam Gasnas rows (up to 7 rows as in DOCX)
    const gasnasList = Array.isArray(form.gasnas_records) ? form.gasnas_records : [];
    const gasnasRows = Array.from({ length: 7 }, (_, i) => gasnasList[i] || { nomor: '', tanggal: '' });

    // Render Certificate rows based on Jalur & Level per DOCX
    const certList = Array.isArray(form.certificate_records) ? form.certificate_records : [];

    // Verifier Name
    const verifierName = form.verified_by_name || (form.status === 'verified' ? 'Budi Santoso' : null);

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased py-6 px-4 print:p-0 print:bg-white">
            <Head title={`Formulir Pendaftaran ${formType} — ${form.full_name}`} />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&family=Inter:wght@400;500;600;700;800&display=swap');

                @page {
                    size: A4 portrait;
                    margin: 12mm 18mm 12mm 18mm;
                }

                @media print {
                    html, body {
                        background: white !important;
                        font-family: 'Times New Roman', Times, serif !important;
                        color: black !important;
                        font-size: 10.5pt;
                        line-height: 1.3;
                    }
                    .no-print { display: none !important; }
                    .page-break {
                        page-break-before: always;
                        break-before: page;
                    }
                    .doc-sheet {
                        box-shadow: none !important;
                        border: none !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        max-width: 100% !important;
                    }
                }
            `}</style>

            {/* Screen toolbar */}
            <div className="no-print max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <Link
                        href={`/event/${event.slug}/ruang-belajar`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Ruang Belajar
                    </Link>
                    <span className="text-slate-300">|</span>
                    <span className="text-xs text-slate-500 font-medium">
                        {form.full_name} • {formType} {form.penataran_level}
                    </span>
                    {form.status === 'verified' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi PB PERKEMI
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {canEdit && (
                        <Link href={`/event/${event.slug}/formulir-pendaftaran`}>
                            <Button variant="secondary" icon={<Edit3 className="w-4 h-4" />} size="sm">
                                Edit Formulir
                            </Button>
                        </Link>
                    )}
                    <Button variant="primary" icon={<Printer className="w-4 h-4" />} size="sm" onClick={handlePrint}>
                        Cetak Formulir (PDF)
                    </Button>
                </div>
            </div>

            {/* Document sheet */}
            <div className="doc-sheet max-w-4xl mx-auto bg-white p-8 sm:p-14 rounded-2xl border border-slate-200 shadow-md font-serif text-[11pt] leading-normal text-black">

                {/* ════════ PAGE 1: SURAT PERMOHONAN PENATARAN ════════ */}
                <article className="space-y-4">
                    {/* Header Kop Surat dengan Logo PERKEMI */}
                    <header className="border-b-2 border-black pb-3 text-center">
                        <div className="flex items-center justify-center gap-4 mb-2">
                            <img
                                src={LOGO_PERKEMI}
                                alt="Logo PB PERKEMI"
                                className="h-16 w-16 object-contain"
                            />
                            <div className="text-center font-sans">
                                <div className="text-[12pt] font-black uppercase tracking-wider text-slate-900">
                                    PENGURUS BESAR
                                </div>
                                <div className="text-[14pt] font-black uppercase tracking-wide text-slate-950">
                                    PERSAUDARAAN SHORINJI KEMPO INDONESIA (PERKEMI)
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Lampiran Tag & Form Title (Identik format DOCX) */}
                    <div className="text-center space-y-0.5 pt-1">
                        <div className="font-bold text-[11.5pt] tracking-widest uppercase">
                            {lampiranLabel}
                        </div>
                        <h1 className="font-bold text-[13pt] uppercase tracking-wide">
                            {formTitle}
                        </h1>
                        <p className="text-[9.5pt] italic text-slate-700">
                            Diisi rangkap 4 (empat) yaitu untuk PB; Pengprov; Pengkab/Pengkot*; Pengdo.
                        </p>
                        <p className="text-[9.5pt] italic text-slate-700">
                            Harap diketik atau ditulis tangan dengan huruf cetak.
                        </p>
                    </div>

                    {/* Recipient */}
                    <div className="pt-1 text-[11pt]">
                        <div>Kepada Yth.</div>
                        <div className="font-bold">PB PERKEMI</div>
                        <div>di Jakarta.</div>
                    </div>

                    {/* Salutation & Opening Paragraph */}
                    <div className="text-[11pt]">
                        <p className="font-semibold mb-1">Salam Persaudaraan,</p>
                        <p className="text-justify leading-relaxed">
                            Dengan ini saya sampaikan permohonan untuk dapat mengikuti ujian{' '}
                            <strong>Penataran {formType === 'PELATIH' ? 'Pelatih' : formType === 'PENGUJI' ? 'Penguji' : 'Wasit'} {form.penataran_level}</strong>{' '}
                            yang akan diselenggarakan oleh PB pada tanggal{' '}
                            <strong>{form.start_date || '24 September 2026'}</strong> sampai dengan{' '}
                            <strong>{form.end_date || '27 September 2026'}</strong>, di{' '}
                            <strong>{form.location || event.place || 'Mojokerto'}</strong>.
                        </p>
                    </div>

                    {/* Biodata List (Format Dotted / Underline persis DOCX) */}
                    <div className="space-y-1 text-[10.5pt]">
                        <div className="grid grid-cols-[230px_12px_1fr] items-baseline">
                            <span>N a m a Lengkap</span>
                            <span>:</span>
                            <span className="font-bold uppercase tracking-wide border-b border-dotted border-black pb-0.5">
                                {form.full_name}
                            </span>
                        </div>
                        <div className="grid grid-cols-[230px_12px_1fr] items-baseline">
                            <span>Tempat / Tanggal Lahir</span>
                            <span>:</span>
                            <span className="border-b border-dotted border-black pb-0.5">
                                {form.birth_place || '-'}, {form.birth_date || '-'}
                            </span>
                        </div>
                        <div className="grid grid-cols-[230px_12px_1fr] items-baseline">
                            <span>Nomor Induk Kenshi (NIK)</span>
                            <span>:</span>
                            <span className="font-mono font-bold border-b border-dotted border-black pb-0.5">
                                {form.kenshi_id_number}
                            </span>
                        </div>
                        <div className="grid grid-cols-[230px_12px_1fr] items-baseline">
                            <span>Tingkatan</span>
                            <span>:</span>
                            <span className="font-bold border-b border-dotted border-black pb-0.5">
                                {form.dan_level || '1 DAN'}
                            </span>
                        </div>
                        <div className="grid grid-cols-[230px_12px_1fr] items-baseline">
                            <span>Alamat rumah / telepon</span>
                            <span>:</span>
                            <span className="border-b border-dotted border-black pb-0.5">
                                {form.home_address || '-'} / Telp: {form.phone_number || '-'}
                            </span>
                        </div>
                        <div className="grid grid-cols-[230px_12px_1fr] items-baseline">
                            <span>Pekerjaan / sekolah*</span>
                            <span>:</span>
                            <span className="border-b border-dotted border-black pb-0.5">
                                {form.occupation || '-'}
                            </span>
                        </div>
                        <div className="grid grid-cols-[230px_12px_1fr] items-baseline">
                            <span>Alamat pekerjaan / sekolah*</span>
                            <span>:</span>
                            <span className="border-b border-dotted border-black pb-0.5">
                                {form.occupation_address || '-'}
                            </span>
                        </div>
                        <div className="grid grid-cols-[230px_12px_1fr] items-baseline">
                            <span>Telepon pekerjaan / sekolah*</span>
                            <span>:</span>
                            <span className="border-b border-dotted border-black pb-0.5">
                                {form.occupation_phone || '-'}
                            </span>
                        </div>
                        <div className="grid grid-cols-[230px_12px_1fr] items-baseline">
                            <span>Alamat Darurat & Telepon</span>
                            <span>:</span>
                            <span className="font-semibold border-b border-dotted border-black pb-0.5">
                                {form.emergency_address || '-'} / Telp: {form.emergency_phone || '-'}
                            </span>
                        </div>
                        <div className="grid grid-cols-[230px_12px_1fr] items-baseline">
                            <span>e-mail</span>
                            <span>:</span>
                            <span className="border-b border-dotted border-black pb-0.5">
                                {form.email || '-'}
                            </span>
                        </div>
                    </div>

                    {/* Piagam Gasnas, Gasnaswil atau Gasprov yang dimiliki (1-7 Baris persis DOCX) */}
                    <div className="pt-1 text-[10.5pt]">
                        <div className="font-semibold mb-1">
                            Piagam Gasnas, Gasnaswil atau Gasprov yang dimiliki:
                        </div>
                        <div className="space-y-0.5 pl-4 font-mono text-[10pt]">
                            {gasnasRows.map((row, idx) => (
                                <div key={idx} className="grid grid-cols-[24px_65px_1fr_65px_1fr] items-baseline gap-1">
                                    <span>{idx + 1}.</span>
                                    <span className="font-sans">Nomor:</span>
                                    <span className="border-b border-dotted border-black min-h-[1.2rem] px-1 font-semibold">
                                        {row.nomor || ''}
                                    </span>
                                    <span className="font-sans text-right">tanggal:</span>
                                    <span className="border-b border-dotted border-black min-h-[1.2rem] px-1 font-sans">
                                        {row.tanggal || ''}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bagian Sertifikat Khusus Sesuai Jalur Peserta (DOCX Sesuai Jalur) */}
                    {formType === 'PELATIH' && isNasional && (
                        <div className="pt-1 text-[10.5pt] space-y-1">
                            <div className="font-semibold">Sertifikat Kualifikasi yang dimiliki:</div>
                            <div className="pl-4 space-y-0.5">
                                <div className="grid grid-cols-[200px_10px_1fr] items-baseline">
                                    <span>Sertifikat Pelatih Daerah</span>
                                    <span>:</span>
                                    <span className="border-b border-dotted border-black">
                                        {certList.find(c => c.jenis?.toLowerCase().includes('pelatih'))?.nomor
                                            ? `Nomor: ${certList.find(c => c.jenis?.toLowerCase().includes('pelatih'))?.nomor}, Tanggal: ${certList.find(c => c.jenis?.toLowerCase().includes('pelatih'))?.tanggal}`
                                            : 'Nomor:\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0, Tanggal:\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'
                                        }
                                    </span>
                                </div>
                                <div className="italic text-xs pl-8 text-slate-600">atau</div>
                                <div className="grid grid-cols-[200px_10px_1fr] items-baseline">
                                    <span>Sertifikat Penguji Daerah</span>
                                    <span>:</span>
                                    <span className="border-b border-dotted border-black">
                                        {certList.find(c => c.jenis?.toLowerCase().includes('penguji'))?.nomor
                                            ? `Nomor: ${certList.find(c => c.jenis?.toLowerCase().includes('penguji'))?.nomor}, Tanggal: ${certList.find(c => c.jenis?.toLowerCase().includes('penguji'))?.tanggal}`
                                            : 'Nomor:\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0, Tanggal:\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'
                                        }
                                    </span>
                                </div>
                                <div className="italic text-xs pl-8 text-slate-600">atau</div>
                                <div className="grid grid-cols-[200px_10px_1fr] items-baseline">
                                    <span>Sertifikat Wasit Daerah</span>
                                    <span>:</span>
                                    <span className="border-b border-dotted border-black">
                                        {certList.find(c => c.jenis?.toLowerCase().includes('wasit'))?.nomor
                                            ? `Nomor: ${certList.find(c => c.jenis?.toLowerCase().includes('wasit'))?.nomor}, Tanggal: ${certList.find(c => c.jenis?.toLowerCase().includes('wasit'))?.tanggal}`
                                            : 'Nomor:\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0, Tanggal:\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'
                                        }
                                    </span>
                                </div>
                                <div className="text-xs italic pl-2 pt-0.5">yang dimiliki.</div>
                            </div>
                        </div>
                    )}

                    {formType === 'PENGUJI' && !isNasional && (
                        <div className="pt-1 text-[10.5pt] space-y-1">
                            <div className="font-semibold">Sertifikat Kualifikasi yang dimiliki:</div>
                            <div className="pl-4 space-y-0.5">
                                <div className="grid grid-cols-[200px_10px_1fr] items-baseline">
                                    <span>Sertifikat Pelatih Daerah</span>
                                    <span>:</span>
                                    <span className="border-b border-dotted border-black">
                                        {certList.find(c => c.jenis?.toLowerCase().includes('pelatih'))?.nomor
                                            ? `Nomor: ${certList.find(c => c.jenis?.toLowerCase().includes('pelatih'))?.nomor}, Tanggal: ${certList.find(c => c.jenis?.toLowerCase().includes('pelatih'))?.tanggal}`
                                            : 'Nomor: ---------------------, Tanggal ----------'}
                                    </span>
                                </div>
                                <div className="italic text-xs pl-8 text-slate-600">atau</div>
                                <div className="grid grid-cols-[200px_10px_1fr] items-baseline">
                                    <span>Sertifikat Pelatih Nasional</span>
                                    <span>:</span>
                                    <span className="border-b border-dotted border-black">
                                        {certList.find(c => c.jenis?.toLowerCase().includes('nasional'))?.nomor
                                            ? `Nomor: ${certList.find(c => c.jenis?.toLowerCase().includes('nasional'))?.nomor}, Tanggal: ${certList.find(c => c.jenis?.toLowerCase().includes('nasional'))?.tanggal}`
                                            : 'Nomor: ---------------------, Tanggal ----------'}
                                    </span>
                                </div>
                                <div className="text-xs italic pl-2 pt-0.5">yang dimiliki.</div>
                            </div>
                        </div>
                    )}

                    {formType === 'PENGUJI' && isNasional && (
                        <div className="pt-1 text-[10.5pt] space-y-1">
                            <div className="font-semibold">Sertifikat Kualifikasi yang dimiliki:</div>
                            <div className="pl-4 space-y-0.5">
                                <div className="grid grid-cols-[200px_10px_1fr] items-baseline">
                                    <span>Sertifikat Penguji Daerah</span>
                                    <span>:</span>
                                    <span className="border-b border-dotted border-black">
                                        {certList.find(c => c.jenis?.toLowerCase().includes('penguji'))?.nomor
                                            ? `Nomor: ${certList.find(c => c.jenis?.toLowerCase().includes('penguji'))?.nomor}, Tanggal: ${certList.find(c => c.jenis?.toLowerCase().includes('penguji'))?.tanggal}`
                                            : 'Nomor: ---------------------, Tanggal ----------'}
                                    </span>
                                </div>
                                <div className="font-bold text-xs pl-8 text-slate-800">dan</div>
                                <div className="grid grid-cols-[200px_10px_1fr] items-baseline">
                                    <span>Sertifikat Pelatih Nasional</span>
                                    <span>:</span>
                                    <span className="border-b border-dotted border-black">
                                        {certList.find(c => c.jenis?.toLowerCase().includes('pelatih'))?.nomor
                                            ? `Nomor: ${certList.find(c => c.jenis?.toLowerCase().includes('pelatih'))?.nomor}, Tanggal: ${certList.find(c => c.jenis?.toLowerCase().includes('pelatih'))?.tanggal}`
                                            : 'Nomor: ---------------------, Tanggal ----------'}
                                    </span>
                                </div>
                                <div className="text-xs italic pl-2 pt-0.5">yang dimiliki.</div>
                            </div>
                        </div>
                    )}

                    {formType === 'WASIT' && !isNasional && (
                        <div className="pt-1 text-[10.5pt] space-y-1">
                            <div className="font-semibold">Sertifikat Kualifikasi yang dimiliki:</div>
                            <div className="pl-4 space-y-0.5">
                                <div className="grid grid-cols-[200px_10px_1fr] items-baseline">
                                    <span>Sertifikat Penguji Daerah</span>
                                    <span>:</span>
                                    <span className="border-b border-dotted border-black">
                                        {certList.find(c => c.jenis?.toLowerCase().includes('penguji'))?.nomor
                                            ? `Nomor: ${certList.find(c => c.jenis?.toLowerCase().includes('penguji'))?.nomor}, Tanggal: ${certList.find(c => c.jenis?.toLowerCase().includes('penguji'))?.tanggal}`
                                            : 'Nomor: ---------------------, Tanggal ----------'}
                                    </span>
                                </div>
                                <div className="italic text-xs pl-8 text-slate-600">atau</div>
                                <div className="grid grid-cols-[200px_10px_1fr] items-baseline">
                                    <span>Sertifikat Penguji Nasional</span>
                                    <span>:</span>
                                    <span className="border-b border-dotted border-black">
                                        {certList.find(c => c.jenis?.toLowerCase().includes('nasional'))?.nomor
                                            ? `Nomor: ${certList.find(c => c.jenis?.toLowerCase().includes('nasional'))?.nomor}, Tanggal: ${certList.find(c => c.jenis?.toLowerCase().includes('nasional'))?.tanggal}`
                                            : 'Nomor: ---------------------, Tanggal ----------'}
                                    </span>
                                </div>
                                <div className="text-xs italic pl-2 pt-0.5">yang dimiliki.</div>
                            </div>
                        </div>
                    )}

                    {formType === 'WASIT' && isNasional && (
                        <div className="pt-1 text-[10.5pt] space-y-1">
                            <div className="font-semibold">Sertifikat Kualifikasi yang dimiliki:</div>
                            <div className="pl-4 space-y-0.5">
                                <div className="grid grid-cols-[200px_10px_1fr] items-baseline">
                                    <span>Sertifikat Wasit Daerah</span>
                                    <span>:</span>
                                    <span className="border-b border-dotted border-black">
                                        {certList.find(c => c.jenis?.toLowerCase().includes('wasit'))?.nomor
                                            ? `Nomor: ${certList.find(c => c.jenis?.toLowerCase().includes('wasit'))?.nomor}, Tanggal: ${certList.find(c => c.jenis?.toLowerCase().includes('wasit'))?.tanggal}`
                                            : 'Nomor: ---------------------, Tanggal ----------'}
                                    </span>
                                </div>
                                <div className="font-bold text-xs pl-8 text-slate-800">dan</div>
                                <div className="grid grid-cols-[200px_10px_1fr] items-baseline">
                                    <span>Sertifikat Penguji Nasional</span>
                                    <span>:</span>
                                    <span className="border-b border-dotted border-black">
                                        {certList.find(c => c.jenis?.toLowerCase().includes('penguji'))?.nomor
                                            ? `Nomor: ${certList.find(c => c.jenis?.toLowerCase().includes('penguji'))?.nomor}, Tanggal: ${certList.find(c => c.jenis?.toLowerCase().includes('penguji'))?.tanggal}`
                                            : 'Nomor: ---------------------, Tanggal ----------'}
                                    </span>
                                </div>
                                <div className="text-xs italic pl-2 pt-0.5">yang dimiliki.</div>
                            </div>
                        </div>
                    )}

                    {/* Slogan Resmi PERKEMI */}
                    <div className="pt-2 text-center font-bold italic tracking-wide text-[11pt]">
                        "Demi Tanah Air, Demi Persaudaraan, Demi Kemanusiaan."
                    </div>

                    {/* Blok Tanda Tangan & Verifikasi (Identik foto referensi pengguna) */}
                    <div className="pt-2 grid grid-cols-2 gap-4 items-end">
                        {/* Kolom Kiri: PB PERKEMI Verifikasi (Sesuai Foto User) */}
                        <div className="flex flex-col items-center justify-center text-center p-2 rounded min-h-[140px]">
                            {verifierName ? (
                                <div className="space-y-3">
                                    <div className="text-[12pt] font-sans font-medium text-[#5B6B82] tracking-wide">
                                        PB PERKEMI Verifikasi
                                    </div>
                                    <div className="text-[14pt] font-sans font-bold text-[#0F172A] tracking-tight">
                                        {verifierName}
                                    </div>
                                    {form.verified_at && (
                                        <div className="text-[9pt] font-sans text-slate-500">
                                            {form.verified_at}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="border border-dashed border-slate-300 rounded-lg p-3 text-center text-slate-400 font-sans text-xs w-full max-w-[240px]">
                                    <div className="text-[#5B6B82] font-medium text-[11pt] mb-1">
                                        PB PERKEMI Verifikasi
                                    </div>
                                    <div className="text-[9pt] italic">
                                        (Menunggu Verifikasi Admin)
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Kolom Kanan: Tanda Tangan Pemohon */}
                        <div className="text-center">
                            <div>{form.sign_place || 'Mojokerto'}, {form.sign_date || '24 September 2026'}</div>
                            <div className="font-bold mt-0.5">Pemohon,</div>
                            <div className="h-20 flex items-center justify-center my-0.5">
                                {form.signature_data ? (
                                    <img
                                        src={form.signature_data}
                                        alt="Tanda Tangan Pemohon"
                                        className="max-h-16 max-w-[180px] object-contain"
                                    />
                                ) : (
                                    <div className="text-xs text-slate-400 italic">
                                        (Tanda Tangan Pemohon)
                                    </div>
                                )}
                            </div>
                            <div className="font-bold underline uppercase">
                                {form.applicant_name || form.full_name}
                            </div>
                            <div className="text-[10pt] text-slate-700 font-mono">
                                NIK: {form.kenshi_id_number}
                            </div>
                        </div>
                    </div>

                    {/* Footer Persyaratan Lampiran & Catatan Kaki */}
                    <div className="pt-2 border-t border-slate-300 text-[9.5pt] space-y-0.5 text-slate-800">
                        <div>Lampiran : {photoRequirements}</div>
                        <div className="pl-16">2. Uang Penataran Rp. ------------------------------------.</div>
                        <div className="italic text-[9pt] pt-0.5">* Coret yang tidak perlu.</div>
                    </div>
                </article>

                {/* ════════ PAGE 2: SURAT PERNYATAAN DAN PEMBEBASAN ════════ */}
                <div className="page-break my-10 border-t-2 border-dashed border-slate-300 pt-8 print:border-none print:pt-0 print:my-0 space-y-4">
                    {/* Header Surat Pernyataan */}
                    <div className="text-center space-y-1 mb-6">
                        <div className="font-bold text-[11.5pt] tracking-widest uppercase">
                            {waiverLampiranLabel}
                        </div>
                        <h2 className="font-bold text-[13.5pt] uppercase tracking-wide underline underline-offset-4">
                            {waiverTitle}
                        </h2>
                    </div>

                    {/* Identitas Pembuat Pernyataan */}
                    <p className="font-semibold text-[11pt]">
                        Saya, yang bertanda tangan di bawah ini:
                    </p>
                    <div className="space-y-1 pl-4 text-[10.5pt]">
                        <div className="grid grid-cols-[140px_10px_1fr] items-baseline">
                            <span>Nama</span>
                            <span>:</span>
                            <span className="font-bold uppercase border-b border-dotted border-black pb-0.5">
                                {form.full_name}
                            </span>
                        </div>
                        <div className="grid grid-cols-[140px_10px_1fr] items-baseline">
                            <span>Alamat</span>
                            <span>:</span>
                            <span className="border-b border-dotted border-black pb-0.5">
                                {form.home_address || '-'}, Nomor Telepon: {form.phone_number || '-'}
                            </span>
                        </div>
                        <div className="grid grid-cols-[140px_10px_1fr] items-baseline">
                            <span>NIK / Tingkatan</span>
                            <span>:</span>
                            <span className="border-b border-dotted border-black pb-0.5">
                                {form.kenshi_id_number} / Tingkatan: {form.dan_level || '1 DAN'}
                            </span>
                        </div>
                        <div className="grid grid-cols-[140px_10px_1fr] items-baseline">
                            <span>Dojo / Daerah</span>
                            <span>:</span>
                            <span className="border-b border-dotted border-black pb-0.5">
                                Dojo: {participant.dojo || '-'}, Kabupaten/Kota*: {participant.city || '-'}, Provinsi: {participant.province || '-'}
                            </span>
                        </div>
                    </div>

                    {/* Teks Hukum Pernyataan (Persis Teks DOCX PB PERKEMI) */}
                    <div className="space-y-2.5 text-justify text-[10.5pt] leading-relaxed pt-2">
                        <p className="font-semibold">Dengan ini menyatakan hal-hal sebagai berikut :</p>

                        <p className="indent-8">
                            Saya mengerti dan memahami sepenuhnya, salah satu persyaratan wajib untuk dapat mengikuti Penataran {formType === 'PELATIH' ? 'Pelatih' : formType === 'PENGUJI' ? 'Penguji' : 'Wasit'} [Tahun 2026] yang diselenggarakan oleh PB di [{form.location || event.place || 'Mojokerto'}] (“Penataran”) yang Saya ikuti adalah, Saya harus berada di dalam kondisi kesehatan yang baik, dan sebelumnya wajib melakukan pemeriksaan kesehatan pada Dokter dan mendapat surat keterangan dari Dokter itu yang menyatakan Saya berada di dalam kondisi kesehatan yang baik.
                        </p>

                        <p className="indent-8">
                            Dengan ini Saya menyatakan dan menjamin telah melakukan pemeriksaan kesehatan itu, dan sekarang ini Saya berada di dalam kondisi kesehatan, jasmani dan rohani, yang baik, dan hal ini dikuatkan oleh Dokter yang telah saya temui dan melakukan pemeriksaan kesehatan Saya sebagaimana mestinya.
                        </p>

                        <p className="indent-8">
                            Saya menyadari dan memahami sepenuhnya bahwa di dalam mengikuti Penataran dan acara-acaranya, memerlukan kondisi jasmani dan rohani yang sehat, dan kegiatan-kegiatan tersebut sebagai hakikat dari kegiatan ilmu bela diri Shorinji Kempo, mungkin saja menimbulkan suatu akibat yang dapat mencederai diri saya, terlebih lagi apabila keadaan kesehatan saya tidak atau kurang baik dan karenanya tidak menunjang kesertaan saya pada Penataran dan setiap acara Penataran.
                        </p>

                        <p className="indent-8">
                            Dengan penuh kesadaran dengan ini saya menyatakan dan sepenuhnya membebaskan PB dan/atau setiap anggotanya dan/atau siapapun juga yang mewakili atau bertindak untuk dan atas nama PB dan/atau MG Perkemi dan/atau setiap anggotanya, dari segala macam tuntutan dan/atau gugatan dan/atau gantirugi, baik sekarang maupun dimasa yang akan datang, atas setiap cedera atau akibat yang terjadi atas diri Saya selama mengikuti Penataran dan setiap acaranya.
                        </p>

                        <p className="indent-8">
                            Surat Pernyataan dan Pembebasan ini saya buat dan tandatangani dalam keadaan sehat jasmani maupun rohani serta tanpa paksaan berupa apapun juga dan tidak akan dapat dicabut/dibatalkan karena alasan apapun juga.
                        </p>
                    </div>

                    {/* Tanda Tangan Surat Pernyataan */}
                    <div className="pt-4 grid grid-cols-2 gap-4 items-end">
                        <div className="flex flex-col items-center justify-center text-center p-2">
                            {verifierName && (
                                <div className="space-y-2">
                                    <div className="text-[11pt] font-sans font-medium text-[#5B6B82] tracking-wide">
                                        PB PERKEMI Verifikasi
                                    </div>
                                    <div className="text-[13pt] font-sans font-bold text-[#0F172A]">
                                        {verifierName}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="text-center">
                            <div>{form.sign_place || 'Mojokerto'}, {form.sign_date || '24 September 2026'}</div>
                            <div className="font-bold mt-1">Yang bertandatangan,</div>
                            <div className="h-20 flex items-center justify-center my-0.5">
                                {form.signature_data ? (
                                    <img
                                        src={form.signature_data}
                                        alt="Tanda Tangan Pemohon"
                                        className="max-h-16 max-w-[180px] object-contain"
                                    />
                                ) : (
                                    <div className="text-xs text-slate-400 italic">
                                        (Tanda Tangan Pemohon)
                                    </div>
                                )}
                            </div>
                            <div className="font-bold underline uppercase">
                                {form.applicant_name || form.full_name}
                            </div>
                            <div className="text-[10pt] text-slate-700 font-mono">
                                NIK: {form.kenshi_id_number}
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 text-[9pt] italic text-slate-600">
                        * Coret yang tidak perlu.
                    </div>
                </div>
            </div>
        </div>
    );
}
