import EventPactDialogs from './EventPactDialogs';
import Button from '../../../../Components/ui/Button';
import Modal from '../../../../Components/ui/Modal';
import FormField from '../../../../Components/ui/FormField';
import Input from '../../../../Components/ui/Input';
import Select from '../../../../Components/ui/Select';
import Checkbox from '../../../../Components/ui/Checkbox';
import FileInput from '../../../../Components/ui/FileInput';
import { FileText, List, Check, Printer, CheckCircle2, Download, Upload } from 'lucide-react';
import { useEventShow } from './EventShowContext';

export default function EventRegistrationDialogs() {
    const {
        event,
        selectedFormForModal,
        setSelectedFormForModal,
        isVerifyingForm,
        uploadModalParticipant,
        setUploadModalParticipant,
        adminUploadFile,
        setAdminUploadFile,
        adminUploadFormType,
        setAdminUploadFormType,
        adminUploadPenataranLevel,
        setAdminUploadPenataranLevel,
        adminUploadAutoVerify,
        setAdminUploadAutoVerify,
        adminUploadNotes,
        setAdminUploadNotes,
        isAdminUploading,
        handleAdminUploadSubmit,
        handleVerifyForm,
        selectedPactForModal,
        setSelectedPactForModal,
        isVerifyingPact,
        uploadModalPactParticipant,
        setUploadModalPactParticipant,
        adminUploadPactFile,
        setAdminUploadPactFile,
        adminUploadPactType,
        setAdminUploadPactType,
        adminUploadPactAutoVerify,
        setAdminUploadPactAutoVerify,
        isAdminUploadingPact,
        handleVerifyPact,
        handleAdminPactUploadSubmit,
    } = useEventShow();

    return (
        <>
            {/* MODAL: Pratinjau Formulir Word PB PERKEMI */}
            {selectedFormForModal && (
                <Modal
                    isOpen={!!selectedFormForModal}
                    onClose={() => setSelectedFormForModal(null)}
                    title={selectedFormForModal.is_kenshi ? `Formulir – 24 (Permohonan Ujian Kenshi) — ${selectedFormForModal.participant_name}` : `Formulir Penataran ${selectedFormForModal.form_type} — ${selectedFormForModal.participant_name}`}
                    size="4xl"
                    footer={
                        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
                            <div className="flex items-center gap-2">
                                {selectedFormForModal.status === 'verified' ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                        Terverifikasi {selectedFormForModal.verified_at ? `(${selectedFormForModal.verified_at})` : ''}
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={isVerifyingForm}
                                        onClick={() => handleVerifyForm(selectedFormForModal.id)}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
                                    >
                                        <Check className="h-4 w-4" />
                                        {isVerifyingForm ? 'Memverifikasi...' : 'Verifikasi & Setujui Formulir'}
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                {selectedFormForModal.print_url && (
                                    <a
                                        href={selectedFormForModal.print_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#0B63CE] bg-[#EAF5FF] px-4 py-2 text-xs font-semibold text-[#0B63CE] hover:bg-[#D5EBFF] transition-colors"
                                    >
                                        <Printer className="h-4 w-4" />
                                        {selectedFormForModal.is_kenshi ? 'Cetak Formulir – 24' : 'Cetak / Unduh Format PB PERKEMI'}
                                    </a>
                                )}
                                <Button variant="secondary" onClick={() => setSelectedFormForModal(null)}>
                                    Tutup
                                </Button>
                            </div>
                        </div>
                    }
                >
                    <div className="max-h-[78vh] overflow-y-auto bg-slate-100 p-2 sm:p-5 rounded-lg">
                        {/* Banner Berkas Terunggah (jika ada) */}
                        {selectedFormForModal.file_url && (
                            <div className="mx-auto max-w-[210mm] mb-4 p-4 rounded-xl border border-indigo-200 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                                                Berkas Fisik / Scan
                                            </span>
                                            {selectedFormForModal.file_size_formatted && (
                                                <span className="text-xs text-slate-500">
                                                    ({selectedFormForModal.file_size_formatted})
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-bold text-slate-900 mt-0.5">
                                            {selectedFormForModal.original_file_name || selectedFormForModal.file_name || 'Berkas Formulir Pendaftaran'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={selectedFormForModal.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        Unduh / Buka Dokumen
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Word Sheet Look */}
                        <div className="mx-auto max-w-[210mm] bg-white p-6 sm:p-12 shadow-sm border border-slate-300 text-black font-serif leading-normal text-xs sm:text-sm space-y-5">
                            {selectedFormForModal.is_kenshi ? (
                                /* ════════ FORMULIR – 24 (PERMOHONAN UJIAN KENSHI) ════════ */
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between font-serif text-[11pt] font-semibold border-b border-black pb-2">
                                        <span>Formulir – 24</span>
                                        <span className="font-mono text-sm tracking-wider">09906000</span>
                                    </div>

                                    <div className="text-center pt-2 pb-1">
                                        <h1 className="font-bold text-[13pt] uppercase tracking-wide">
                                            PERMOHONAN UJIAN KENSHI
                                        </h1>
                                    </div>

                                    <div className="pt-1">
                                        <div className="text-[10.5pt] space-y-0.5 leading-snug">
                                            <div>Kepada :</div>
                                            <div className="font-bold">Yth. PB. PERKEMI</div>
                                            <div>Pusdiklat Kempo “Sidharta A. Martoredjo”</div>
                                            <div>Pondok Gede – Bekasi</div>
                                        </div>
                                    </div>

                                    <div className="text-[10.5pt] space-y-1 pt-1">
                                        <p>Bersama ini saya mengajukan permohonan untuk menempuh Ujian Kenaikan Tingkat Menjadi :</p>
                                        <div className="text-center py-1">
                                            <span className="inline-block px-5 py-0.5 border-2 border-black font-bold text-[12pt] tracking-wider uppercase">
                                                {selectedFormForModal.target_level || selectedFormForModal.penataran_level || 'KYU ........ / DAN ........ *'}
                                            </span>
                                        </div>
                                        <p>Sebagai bahan pertimbangan, bersama ini saya lampirkan :</p>
                                    </div>

                                    <div className="space-y-1 text-xs sm:text-[10pt] pt-1">
                                        <div className="grid grid-cols-[230px_10px_1fr] items-baseline">
                                            <span>1. Nama Lengkap</span>
                                            <span>:</span>
                                            <span className="font-bold uppercase border-b border-dotted border-black pb-0.5">{selectedFormForModal.full_name}</span>
                                        </div>
                                        <div className="grid grid-cols-[230px_10px_1fr] items-baseline">
                                            <span>2. Tempat & Tgl Lahir</span>
                                            <span>:</span>
                                            <span className="border-b border-dotted border-black pb-0.5">{selectedFormForModal.birth_place || '-'}, {selectedFormForModal.birth_date || '-'}</span>
                                        </div>
                                        <div className="grid grid-cols-[230px_10px_1fr] items-baseline">
                                            <span>3. NIK</span>
                                            <span>:</span>
                                            <span className="font-mono font-bold border-b border-dotted border-black pb-0.5">{selectedFormForModal.kenshi_id_number}</span>
                                        </div>
                                        <div className="grid grid-cols-[230px_10px_1fr] items-baseline">
                                            <span>4. Alamat Rumah / Telp</span>
                                            <span>:</span>
                                            <span className="border-b border-dotted border-black pb-0.5">{selectedFormForModal.home_address || '-'} / Telp: {selectedFormForModal.phone_number || '-'}</span>
                                        </div>
                                        <div className="grid grid-cols-[230px_10px_1fr] items-baseline">
                                            <span>5. Alamat Email</span>
                                            <span>:</span>
                                            <span className="border-b border-dotted border-black pb-0.5">{selectedFormForModal.email || '-'}</span>
                                        </div>
                                        <div className="grid grid-cols-[230px_10px_1fr] items-baseline">
                                            <span>6. Pekerjaan / Sekolah</span>
                                            <span>:</span>
                                            <span className="border-b border-dotted border-black pb-0.5">{selectedFormForModal.occupation || '-'}</span>
                                        </div>
                                        <div className="grid grid-cols-[230px_10px_1fr] items-baseline">
                                            <span>7. Alamat Pekerjaan / Telp</span>
                                            <span>:</span>
                                            <span className="border-b border-dotted border-black pb-0.5">{selectedFormForModal.occupation_address || '-'} / Telp: {selectedFormForModal.occupation_phone || '-'}</span>
                                        </div>
                                        <div className="grid grid-cols-[230px_10px_1fr] items-baseline">
                                            <span>8. Alamat Keadaan Darurat / Telp</span>
                                            <span>:</span>
                                            <span className="border-b border-dotted border-black pb-0.5">{selectedFormForModal.emergency_address || '-'} / Telp: {selectedFormForModal.emergency_phone || '-'}</span>
                                        </div>
                                        <div className="grid grid-cols-[230px_10px_1fr] items-baseline">
                                            <span>9. Tanggal Ujian Terakhir</span>
                                            <span>:</span>
                                            <span className="border-b border-dotted border-black pb-0.5">{selectedFormForModal.last_exam_date || '-'}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="grid grid-cols-[230px_10px_1fr] items-baseline">
                                                <span>10. Sertifikat Tingkat Tertinggi</span>
                                                <span>:</span>
                                                <span></span>
                                            </div>
                                            <div className="grid grid-cols-[230px_10px_1fr] items-baseline pl-4">
                                                <span className="italic">Nomor</span>
                                                <span>:</span>
                                                <span className="border-b border-dotted border-black pb-0.5">{selectedFormForModal.last_certificate_number || '-'}</span>
                                            </div>
                                            <div className="grid grid-cols-[230px_10px_1fr] items-baseline pl-4">
                                                <span className="italic">Tanggal</span>
                                                <span>:</span>
                                                <span className="border-b border-dotted border-black pb-0.5">{selectedFormForModal.last_certificate_date || '-'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 grid grid-cols-2 gap-6 items-start">
                                        <div>
                                            <div className="font-semibold text-xs">Mengetahui :</div>
                                            <div className="text-xs">Pengurus Dojo (Pengdo) <span className="font-bold">{selectedFormForModal.dojo_name || selectedFormForModal.origin_dojo || 'Surabaya'}</span></div>
                                            <div className="h-12 flex items-center"></div>
                                            <div className="space-y-0.5 text-xs">
                                                <div>Nama : <span className="font-bold underline">{selectedFormForModal.dojo_leader_name || '...........................................'}</span></div>
                                                <div>Jabatan : <span>{selectedFormForModal.dojo_leader_position || 'Ketua Dojo'}</span></div>
                                            </div>
                                        </div>

                                        <div className="text-right text-xs">
                                            <div>{selectedFormForModal.sign_place || 'Surabaya'}, {selectedFormForModal.sign_date || '03 Oktober 2026'}</div>
                                            <div className="font-semibold">Pemohon,</div>
                                            <div className="h-12 flex items-center justify-end">
                                                {selectedFormForModal.signature_data ? (
                                                    <img
                                                        src={selectedFormForModal.signature_data}
                                                        alt="Tanda Tangan"
                                                        className="max-h-12 max-w-[150px] object-contain"
                                                    />
                                                ) : (
                                                    <div className="text-[10px] text-slate-400 italic">(Tanda Tangan)</div>
                                                )}
                                            </div>
                                            <div className="font-bold underline uppercase">( {selectedFormForModal.applicant_name || selectedFormForModal.full_name} )</div>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-slate-300 text-[9pt] space-y-0.5 text-slate-700">
                                        <div className="italic">* Coret yang tidak perlu</div>
                                        <div className="grid grid-cols-[70px_1fr]">
                                            <span className="font-semibold">Lampiran :</span>
                                            <div className="space-y-0.5">
                                                <div>1. 2 helai Pas Foto (2.5 x 3) untuk Kyu</div>
                                                <div>2. 2 helai Pas Foto (3 x 4) untuk Dan</div>
                                                <div>3. Uang Ujian Rp. {selectedFormForModal.exam_fee ? Number(selectedFormForModal.exam_fee).toLocaleString('id-ID') : '...........................................'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                            {/* Kop Surat Resmi PB PERKEMI dengan Logo */}
                            <div className="border-b-2 border-black pb-3 text-center">
                                <div className="flex items-center justify-center gap-3 mb-1">
                                    <img
                                        src="/images/perkemi-logo.png"
                                        alt="Logo PB PERKEMI"
                                        className="h-16 w-16 object-contain"
                                    />
                                    <div className="text-center font-sans">
                                        <div className="text-[12pt] font-black uppercase tracking-wider text-slate-900">
                                            PENGURUS BESAR
                                        </div>
                                        <div className="text-[13.5pt] font-black uppercase tracking-wide text-slate-950">
                                            PERSAUDARAAN SHORINJI KEMPO INDONESIA (PERKEMI)
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Lampiran Tag & Form Title */}
                            <div className="text-center space-y-0.5">
                                <div className="font-bold text-[11pt] tracking-widest uppercase">
                                    {selectedFormForModal.lampiran_label || (
                                        selectedFormForModal.form_type === 'PELATIH'
                                            ? (selectedFormForModal.penataran_level === 'Nasional' ? 'LAMPIRAN-B' : 'LAMPIRAN-A')
                                            : selectedFormForModal.form_type === 'PENGUJI'
                                            ? (selectedFormForModal.penataran_level === 'Nasional' ? 'LAMPIRAN-D' : 'LAMPIRAN-C')
                                            : (selectedFormForModal.penataran_level === 'Nasional' ? 'LAMPIRAN-B' : 'LAMPIRAN-A')
                                    )}
                                </div>
                                <h1 className="font-bold uppercase tracking-wide text-sm sm:text-base">
                                    PERMOHONAN PENATARAN {selectedFormForModal.form_type} {selectedFormForModal.penataran_level?.toUpperCase()}
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

                            {/* Salutation & Opening */}
                            <div>
                                <p className="font-semibold mb-1">Salam Persaudaraan,</p>
                                <p className="text-justify leading-relaxed">
                                    Dengan ini saya sampaikan permohonan untuk dapat mengikuti ujian{' '}
                                    <strong>Penataran {selectedFormForModal.form_type === 'PELATIH' ? 'Pelatih' : selectedFormForModal.form_type === 'PENGUJI' ? 'Penguji' : 'Wasit'} {selectedFormForModal.penataran_level}</strong>{' '}
                                    yang diselenggarakan oleh PB pada tanggal{' '}
                                    <strong>{selectedFormForModal.start_date || '24 September 2026'}</strong> sampai dengan{' '}
                                    <strong>{selectedFormForModal.end_date || '27 September 2026'}</strong>, di{' '}
                                    <strong>{selectedFormForModal.location || event.place || 'Mojokerto'}</strong>.
                                </p>
                            </div>

                            {/* Biodata List Format DOCX */}
                            <div className="space-y-1 text-xs sm:text-[10.5pt]">
                                <div className="grid grid-cols-[210px_10px_1fr] items-baseline">
                                    <span>N a m a Lengkap</span>
                                    <span>:</span>
                                    <span className="font-bold uppercase border-b border-dotted border-black pb-0.5">
                                        {selectedFormForModal.full_name}
                                    </span>
                                </div>
                                <div className="grid grid-cols-[210px_10px_1fr] items-baseline">
                                    <span>Tempat / Tanggal Lahir</span>
                                    <span>:</span>
                                    <span className="border-b border-dotted border-black pb-0.5">
                                        {selectedFormForModal.birth_place || '-'}, {selectedFormForModal.birth_date || '-'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-[210px_10px_1fr] items-baseline">
                                    <span>Nomor Induk Kenshi (NIK)</span>
                                    <span>:</span>
                                    <span className="font-mono font-bold border-b border-dotted border-black pb-0.5">
                                        {selectedFormForModal.kenshi_id_number}
                                    </span>
                                </div>
                                <div className="grid grid-cols-[210px_10px_1fr] items-baseline">
                                    <span>Tingkatan</span>
                                    <span>:</span>
                                    <span className="font-bold border-b border-dotted border-black pb-0.5">
                                        {selectedFormForModal.dan_level || '1 DAN'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-[210px_10px_1fr] items-baseline">
                                    <span>Alamat rumah / telepon</span>
                                    <span>:</span>
                                    <span className="border-b border-dotted border-black pb-0.5">
                                        {selectedFormForModal.home_address || '-'} / Telp: {selectedFormForModal.phone_number || '-'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-[210px_10px_1fr] items-baseline">
                                    <span>Pekerjaan / sekolah*</span>
                                    <span>:</span>
                                    <span className="border-b border-dotted border-black pb-0.5">
                                        {selectedFormForModal.occupation || '-'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-[210px_10px_1fr] items-baseline">
                                    <span>Alamat pekerjaan / sekolah*</span>
                                    <span>:</span>
                                    <span className="border-b border-dotted border-black pb-0.5">
                                        {selectedFormForModal.occupation_address || '-'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-[210px_10px_1fr] items-baseline">
                                    <span>Telepon pekerjaan / sekolah*</span>
                                    <span>:</span>
                                    <span className="border-b border-dotted border-black pb-0.5">
                                        {selectedFormForModal.occupation_phone || '-'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-[210px_10px_1fr] items-baseline">
                                    <span>Alamat Darurat & Telepon</span>
                                    <span>:</span>
                                    <span className="font-semibold border-b border-dotted border-black pb-0.5">
                                        {selectedFormForModal.emergency_address || '-'} / Telp: {selectedFormForModal.emergency_phone || '-'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-[210px_10px_1fr] items-baseline">
                                    <span>e-mail</span>
                                    <span>:</span>
                                    <span className="border-b border-dotted border-black pb-0.5">
                                        {selectedFormForModal.email || '-'}
                                    </span>
                                </div>
                            </div>

                            {/* Riwayat Piagam Gasnas 1-7 */}
                            <div className="pt-1 text-xs sm:text-[10.5pt]">
                                <div className="font-semibold mb-1">
                                    Piagam Gasnas, Gasnaswil atau Gasprov yang dimiliki:
                                </div>
                                <div className="space-y-0.5 pl-4 font-mono text-[10pt]">
                                    {Array.from({ length: 7 }, (_, i) => {
                                        const r = selectedFormForModal.gasnas_records?.[i] || { nomor: '', tanggal: '' };
                                        return (
                                            <div key={i} className="grid grid-cols-[20px_55px_1fr_55px_1fr] items-baseline gap-1">
                                                <span>{i + 1}.</span>
                                                <span className="font-sans">Nomor:</span>
                                                <span className="border-b border-dotted border-black min-h-[1.2rem] px-1 font-semibold">
                                                    {r.nomor || '-----------------------------'}
                                                </span>
                                                <span className="font-sans text-right">tanggal:</span>
                                                <span className="border-b border-dotted border-black min-h-[1.2rem] px-1 font-sans">
                                                    {r.tanggal || '------------------'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Bagian Sertifikat Berdasarkan Jalur & Level */}
                            {selectedFormForModal.form_type === 'PELATIH' && selectedFormForModal.penataran_level === 'Nasional' && (
                                <div className="pt-1 text-xs sm:text-[10.5pt] space-y-1">
                                    <div className="font-semibold">Sertifikat Kualifikasi yang dimiliki:</div>
                                    <div className="pl-4 space-y-0.5">
                                        <div className="grid grid-cols-[180px_10px_1fr] items-baseline">
                                            <span>Sertifikat Pelatih Daerah</span>
                                            <span>:</span>
                                            <span className="border-b border-dotted border-black">
                                                {selectedFormForModal.certificate_records?.find(c => c.jenis?.toLowerCase().includes('pelatih'))?.nomor
                                                    ? `Nomor: ${selectedFormForModal.certificate_records.find(c => c.jenis?.toLowerCase().includes('pelatih')).nomor}, Tanggal: ${selectedFormForModal.certificate_records.find(c => c.jenis?.toLowerCase().includes('pelatih')).tanggal}`
                                                    : 'Nomor: ---------------------, Tanggal ----------'}
                                            </span>
                                        </div>
                                        <div className="italic text-xs pl-8 text-slate-600">atau</div>
                                        <div className="grid grid-cols-[180px_10px_1fr] items-baseline">
                                            <span>Sertifikat Penguji Daerah</span>
                                            <span>:</span>
                                            <span className="border-b border-dotted border-black">
                                                {selectedFormForModal.certificate_records?.find(c => c.jenis?.toLowerCase().includes('penguji'))?.nomor
                                                    ? `Nomor: ${selectedFormForModal.certificate_records.find(c => c.jenis?.toLowerCase().includes('penguji')).nomor}, Tanggal: ${selectedFormForModal.certificate_records.find(c => c.jenis?.toLowerCase().includes('penguji')).tanggal}`
                                                    : 'Nomor: ---------------------, Tanggal ----------'}
                                            </span>
                                        </div>
                                        <div className="italic text-xs pl-8 text-slate-600">atau</div>
                                        <div className="grid grid-cols-[180px_10px_1fr] items-baseline">
                                            <span>Sertifikat Wasit Daerah</span>
                                            <span>:</span>
                                            <span className="border-b border-dotted border-black">
                                                {selectedFormForModal.certificate_records?.find(c => c.jenis?.toLowerCase().includes('wasit'))?.nomor
                                                    ? `Nomor: ${selectedFormForModal.certificate_records.find(c => c.jenis?.toLowerCase().includes('wasit')).nomor}, Tanggal: ${selectedFormForModal.certificate_records.find(c => c.jenis?.toLowerCase().includes('wasit')).tanggal}`
                                                    : 'Nomor: ---------------------, Tanggal ----------'}
                                            </span>
                                        </div>
                                        <div className="text-xs italic pl-2 pt-0.5">yang dimiliki.</div>
                                    </div>
                                </div>
                            )}

                            {selectedFormForModal.form_type === 'PENGUJI' && (
                                <div className="pt-1 text-xs sm:text-[10.5pt] space-y-1">
                                    <div className="font-semibold">Sertifikat Kualifikasi yang dimiliki:</div>
                                    <div className="pl-4 space-y-0.5">
                                        <div className="grid grid-cols-[180px_10px_1fr] items-baseline">
                                            <span>{selectedFormForModal.penataran_level === 'Nasional' ? 'Sertifikat Penguji Daerah' : 'Sertifikat Pelatih Daerah'}</span>
                                            <span>:</span>
                                            <span className="border-b border-dotted border-black">
                                                {selectedFormForModal.certificate_records?.[0]?.nomor
                                                    ? `Nomor: ${selectedFormForModal.certificate_records[0].nomor}, Tanggal: ${selectedFormForModal.certificate_records[0].tanggal}`
                                                    : 'Nomor: ---------------------, Tanggal ----------'}
                                            </span>
                                        </div>
                                        <div className="text-xs pl-8 font-semibold text-slate-700">
                                            {selectedFormForModal.penataran_level === 'Nasional' ? 'dan' : 'atau'}
                                        </div>
                                        <div className="grid grid-cols-[180px_10px_1fr] items-baseline">
                                            <span>Sertifikat Pelatih Nasional</span>
                                            <span>:</span>
                                            <span className="border-b border-dotted border-black">
                                                {selectedFormForModal.certificate_records?.[1]?.nomor
                                                    ? `Nomor: ${selectedFormForModal.certificate_records[1].nomor}, Tanggal: ${selectedFormForModal.certificate_records[1].tanggal}`
                                                    : 'Nomor: ---------------------, Tanggal ----------'}
                                            </span>
                                        </div>
                                        <div className="text-xs italic pl-2 pt-0.5">yang dimiliki.</div>
                                    </div>
                                </div>
                            )}

                            {selectedFormForModal.form_type === 'WASIT' && (
                                <div className="pt-1 text-xs sm:text-[10.5pt] space-y-1">
                                    <div className="font-semibold">Sertifikat Kualifikasi yang dimiliki:</div>
                                    <div className="pl-4 space-y-0.5">
                                        <div className="grid grid-cols-[180px_10px_1fr] items-baseline">
                                            <span>{selectedFormForModal.penataran_level === 'Nasional' ? 'Sertifikat Wasit Daerah' : 'Sertifikat Penguji Daerah'}</span>
                                            <span>:</span>
                                            <span className="border-b border-dotted border-black">
                                                {selectedFormForModal.certificate_records?.[0]?.nomor
                                                    ? `Nomor: ${selectedFormForModal.certificate_records[0].nomor}, Tanggal: ${selectedFormForModal.certificate_records[0].tanggal}`
                                                    : 'Nomor: ---------------------, Tanggal ----------'}
                                            </span>
                                        </div>
                                        <div className="text-xs pl-8 font-semibold text-slate-700">
                                            {selectedFormForModal.penataran_level === 'Nasional' ? 'dan' : 'atau'}
                                        </div>
                                        <div className="grid grid-cols-[180px_10px_1fr] items-baseline">
                                            <span>Sertifikat Penguji Nasional</span>
                                            <span>:</span>
                                            <span className="border-b border-dotted border-black">
                                                {selectedFormForModal.certificate_records?.[1]?.nomor
                                                    ? `Nomor: ${selectedFormForModal.certificate_records[1].nomor}, Tanggal: ${selectedFormForModal.certificate_records[1].tanggal}`
                                                    : 'Nomor: ---------------------, Tanggal ----------'}
                                            </span>
                                        </div>
                                        <div className="text-xs italic pl-2 pt-0.5">yang dimiliki.</div>
                                    </div>
                                </div>
                            )}

                            {/* Motto */}
                            <div className="pt-2 text-center font-bold italic tracking-wide text-xs sm:text-[11pt]">
                                "Demi Tanah Air, Demi Persaudaraan, Demi Kemanusiaan."
                            </div>

                            {/* Blok Tanda Tangan & Verifikasi (Identik foto referensi) */}
                            <div className="pt-2 grid grid-cols-2 gap-4 items-end">
                                {/* PB PERKEMI Verifikasi (Stempel Box Sesuai Foto User) */}
                                <div className="flex flex-col items-center justify-center text-center p-2 min-h-[130px]">
                                    <div className="text-[12pt] font-sans font-medium text-[#5B6B82] tracking-wide">
                                        PB PERKEMI Verifikasi
                                    </div>
                                    <div className="text-[14pt] font-sans font-bold text-[#0F172A] mt-3 tracking-tight">
                                        {selectedFormForModal.verified_by_name || 'Budi Santoso'}
                                    </div>
                                    {selectedFormForModal.verified_at && (
                                        <div className="text-[9pt] font-sans text-slate-500 mt-1">
                                            Terverifikasi: {selectedFormForModal.verified_at}
                                        </div>
                                    )}
                                </div>

                                {/* Pemohon Signature */}
                                <div className="text-center">
                                    <div>{selectedFormForModal.sign_place || 'Mojokerto'}, {selectedFormForModal.sign_date || '-'}</div>
                                    <div className="font-bold mt-0.5">Pemohon,</div>
                                    <div className="h-16 flex items-center justify-center my-0.5">
                                        {selectedFormForModal.signature_data ? (
                                            <img
                                                src={selectedFormForModal.signature_data}
                                                alt="Tanda Tangan Pemohon"
                                                className="max-h-14 object-contain"
                                            />
                                        ) : (
                                            <span className="text-slate-400 italic text-[11px]">(Tanda Tangan Pemohon)</span>
                                        )}
                                    </div>
                                    <div className="font-bold underline uppercase">
                                        {selectedFormForModal.applicant_name || selectedFormForModal.full_name}
                                    </div>
                                    <div className="text-[10pt] text-slate-700 font-mono">
                                        NIK: {selectedFormForModal.kenshi_id_number}
                                    </div>
                                </div>
                            </div>

                            {/* Footnotes */}
                            <div className="pt-2 border-t border-slate-300 text-[9.5pt] space-y-0.5 text-slate-800">
                                <div>Lampiran : {selectedFormForModal.photo_requirements || '1. 2 Helai Pas Foto(3 x 4)'}</div>
                                <div className="pl-16">2. Uang Penataran Rp. ------------------------------------.</div>
                                <div className="italic text-[9pt] pt-0.5">* Coret yang tidak perlu.</div>
                            </div>

                            {/* Surat Pernyataan dan Pembebasan (Waiver Sesuai DOCX) */}
                            <div className="mt-6 pt-6 border-t-2 border-dashed border-slate-300 space-y-3">
                                <div className="text-center space-y-0.5 mb-3">
                                    <div className="font-bold text-[11pt] tracking-widest uppercase">
                                        {selectedFormForModal.waiver_lampiran_label || (selectedFormForModal.form_type === 'WASIT' ? 'LAMPIRAN-C' : 'LAMPIRAN-E')}
                                    </div>
                                    <h2 className="font-bold text-[12.5pt] uppercase tracking-wide underline underline-offset-4">
                                        SURAT PERNYATAAN DAN PEMBEBASAN
                                    </h2>
                                </div>
                                <p className="font-semibold text-xs">Saya, yang bertanda tangan di bawah ini:</p>
                                <div className="space-y-1 pl-4 text-xs">
                                    <div className="grid grid-cols-[120px_10px_1fr]">
                                        <span>Nama</span>
                                        <span>:</span>
                                        <span className="font-bold uppercase border-b border-dotted border-black">{selectedFormForModal.full_name}</span>
                                    </div>
                                    <div className="grid grid-cols-[120px_10px_1fr]">
                                        <span>Alamat / Telp</span>
                                        <span>:</span>
                                        <span className="border-b border-dotted border-black">{selectedFormForModal.home_address || '-'}, Telp: {selectedFormForModal.phone_number || '-'}</span>
                                    </div>
                                    <div className="grid grid-cols-[120px_10px_1fr]">
                                        <span>NIK / Tingkatan</span>
                                        <span>:</span>
                                        <span className="border-b border-dotted border-black">{selectedFormForModal.kenshi_id_number} / {selectedFormForModal.dan_level || '1 DAN'}</span>
                                    </div>
                                </div>
                                <p className="text-justify text-xs leading-relaxed indent-6">
                                    Dengan ini Saya menyatakan dan menjamin dalam kondisi kesehatan jasmani dan rohani yang baik untuk mengikuti seluruh rangkaian kegiatan Penataran {selectedFormForModal.form_type} di [{selectedFormForModal.location || 'Mojokerto'}], dan sepenuhnya membebaskan PB PERKEMI dan segenap panitia dari segala tuntutan atas cedera yang mungkin terjadi selama kegiatan berlangsung.
                                </p>
                                <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded font-medium text-xs">
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                                    <span>Pernyataan dan pembebasan telah disetujui & ditandatangani oleh pemohon secara digital.</span>
                                </div>
                            </div>
                            </>
                            )}
                        </div>
                    </div>
                </Modal>
            )}

            {/* MODAL: Upload Berkas Formulir Pendaftaran Peserta (Admin) */}
            <Modal
                isOpen={Boolean(uploadModalParticipant)}
                onClose={() => {
                    if (!isAdminUploading) {
                        setUploadModalParticipant(null);
                        setAdminUploadFile(null);
                        setAdminUploadNotes('');
                    }
                }}
                title="Unggah Berkas Formulir Pendaftaran Peserta"
                size="md"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setUploadModalParticipant(null);
                                setAdminUploadFile(null);
                                setAdminUploadNotes('');
                            }}
                            disabled={isAdminUploading}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            form="admin-upload-form"
                            variant="primary"
                            loading={isAdminUploading}
                            disabled={!adminUploadFile || isAdminUploading}
                        >
                            Unggah & Simpan Berkas
                        </Button>
                    </>
                }
            >
                <form id="admin-upload-form" onSubmit={handleAdminUploadSubmit} className="space-y-4">
                    {/* Ringkasan Peserta */}
                    <div className="rounded-xl border border-[#DCE7F3] bg-[#F8FBFF] p-3 text-xs">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7C93] mb-1">
                            Target Kenshi
                        </div>
                        <div className="font-bold text-sm text-[#0E2747]">
                            {uploadModalParticipant?.participant_name}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[#6B7C93] mt-1">
                            <span>No. Kenshi: <strong className="font-mono text-[#0E2747]">{uploadModalParticipant?.kenshi_id_number || '-'}</strong></span>
                            <span>Tingkatan: <strong className="text-[#0E2747]">{uploadModalParticipant?.dan_level || '-'}</strong></span>
                            <span>Dojo: <strong className="text-[#0E2747]">{uploadModalParticipant?.origin_dojo || uploadModalParticipant?.dojo || '-'}</strong></span>
                        </div>
                    </div>

                    {uploadModalParticipant?.file_url && (
                        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-2.5 text-xs text-indigo-900 flex items-center justify-between">
                            <div>
                                <span className="font-semibold">Sudah ada berkas terunggah:</span> {uploadModalParticipant.file_name || uploadModalParticipant.original_file_name || 'Berkas scan'}
                            </div>
                            <a
                                href={uploadModalParticipant.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-indigo-700 underline text-[11px] hover:text-indigo-900"
                            >
                                Lihat File
                            </a>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Kategori Formulir" required>
                            <Select
                                value={adminUploadFormType}
                                onChange={(e) => setAdminUploadFormType(e.target.value)}
                            >
                                <option value="PELATIH">Pelatih</option>
                                <option value="PENGUJI">Penguji</option>
                                <option value="WASIT">Wasit</option>
                            </Select>
                        </FormField>

                        <FormField label="Tingkatan Penataran" required>
                            <Select
                                value={adminUploadPenataranLevel}
                                onChange={(e) => setAdminUploadPenataranLevel(e.target.value)}
                            >
                                <option value="Daerah">Daerah</option>
                                <option value="Nasional">Nasional</option>
                            </Select>
                        </FormField>
                    </div>

                    <FormField
                        label="Pilih File Berkas Formulir (Scan / PDF / Word / Gambar)"
                        name="admin-registration-file"
                        helperText="Format yang didukung: PDF, DOC, DOCX, JPG, PNG (Maks. 10MB)"
                        required
                    >
                        <FileInput
                            id="admin-registration-file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => setAdminUploadFile(e.target.files?.[0] || null)}
                        />
                        {adminUploadFile && (
                            <p className="mt-1 text-xs text-emerald-600 font-medium">
                                File terpilih: {adminUploadFile.name} ({(adminUploadFile.size / 1024).toFixed(1)} KB)
                            </p>
                        )}
                    </FormField>

                    <div className="rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] p-3">
                        <Checkbox
                            id="admin_auto_verify_form"
                            checked={adminUploadAutoVerify}
                            onChange={(e) => setAdminUploadAutoVerify(e.target.checked)}
                            label="Langsung tandai status Terverifikasi (Disetujui Admin)"
                            helperText="Jika dicentang, status formulir kenshi langsung Terverifikasi tanpa perlu langkah persetujuan terpisah."
                        />
                    </div>

                    <FormField label="Catatan / Keterangan (Opsional)">
                        <Input
                            type="text"
                            value={adminUploadNotes}
                            onChange={(e) => setAdminUploadNotes(e.target.value)}
                            placeholder="Contoh: Berkas fisik diserahkan saat registrasi ulang atau verifikasi manual"
                        />
                    </FormField>
                </form>
            </Modal>

            <EventPactDialogs />
        </>
    );
}
