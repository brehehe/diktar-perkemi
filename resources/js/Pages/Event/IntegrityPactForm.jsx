import React, { useRef, useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Shield,
    CheckCircle2,
    AlertCircle,
    FileText,
    ArrowLeft,
    Printer,
    PenTool,
    RotateCcw,
    Award,
    Calendar,
    MapPin,
    UserCheck,
    Save,
    Sparkles,
    Upload,
    Download,
    FileEdit,
    FileCheck,
} from 'lucide-react';

export default function IntegrityPactForm({
    event,
    participant,
    pact,
    pledgePoints = [],
    isOrganizerOrAdmin = false,
}) {
    const [entryMode, setEntryMode] = useState(
        pact.submission_mode === 'upload' || (pact.file_url && !pact.signature_data) ? 'upload' : 'online'
    );
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(!!pact.signature_data);
    const [sameAddress, setSameAddress] = useState(
        !pact.current_address || pact.current_address === pact.id_card_address
    );

    const {
        data: uploadData,
        setData: setUploadData,
        post: postUpload,
        processing: uploadProcessing,
        errors: uploadErrors,
    } = useForm({
        participant_id: participant.id,
        pact_type: pact.pact_type || 'pelatih',
        file: null,
    });

    const handleUploadSubmit = (e) => {
        e.preventDefault();
        postUpload(`/event/${event.slug}/pakta-integritas/upload`, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        participant_id: participant.id,
        pact_type: pact.pact_type || 'pelatih',
        full_name: pact.full_name || participant.name || '',
        birth_place: pact.birth_place || '',
        birth_date: pact.birth_date || '',
        kenshi_id_number: pact.kenshi_id_number || participant.kenshi_id_number || '',
        dan_level: pact.dan_level || participant.dan_rank || '',
        religion: pact.religion || 'Islam',
        dojo: pact.dojo || '',
        city: pact.city || '',
        province: pact.province || 'Jawa Timur',
        certificate_number: pact.certificate_number || participant.certificate_number || '',
        valid_start_date: pact.valid_start_date || '',
        valid_end_date: pact.valid_end_date || '',
        id_card_address: pact.id_card_address || '',
        current_address: pact.current_address || pact.id_card_address || '',
        management_organization: pact.management_organization || '-',
        management_position: pact.management_position || '-',
        sign_place: pact.sign_place || 'Mojokerto',
        sign_date: pact.sign_date || new Date().toISOString().split('T')[0],
        signature_data: pact.signature_data || '',
        agree_pledge: pact.status === 'signed',
    });

    // Inisialisasi Canvas Tanda Tangan
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#0B63CE';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (pact.signature_data) {
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = pact.signature_data;
        }
    }, [pact.signature_data]);

    const getCoordinates = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: (clientX - rect.left) * (canvas.width / rect.width),
            y: (clientY - rect.top) * (canvas.height / rect.height),
        };
    };

    const startDrawing = (e) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const { x, y } = getCoordinates(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
        setHasDrawn(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const { x, y } = getCoordinates(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');
            setData('signature_data', dataUrl);
        }
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
        setData('signature_data', '');
    };

    const autoGenerateSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.font = 'italic 34px "Brush Script MT", "Caveat", "Segoe Script", cursive';
        ctx.fillStyle = '#0B63CE';
        ctx.fillText(data.full_name || participant.name, 30, canvas.height / 2 + 10);

        ctx.beginPath();
        ctx.moveTo(25, canvas.height / 2 + 25);
        ctx.lineTo(canvas.width - 40, canvas.height / 2 + 20);
        ctx.strokeStyle = '#0B63CE';
        ctx.lineWidth = 2;
        ctx.stroke();

        const dataUrl = canvas.toDataURL('image/png');
        setHasDrawn(true);
        setData('signature_data', dataUrl);
    };

    const handleSameAddressChange = (checked) => {
        setSameAddress(checked);
        if (checked) {
            setData('current_address', data.id_card_address);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/event/${event.slug}/pakta-integritas`, {
            preserveScroll: true,
        });
    };

    const pactRoleLabel =
        data.pact_type === 'penguji'
            ? 'Penguji Daerah / Nasional'
            : data.pact_type === 'wasit'
            ? 'Wasit Daerah / Nasional'
            : 'Pelatih Daerah / Nasional';

    return (
        <div className="min-h-screen bg-[#F8FBFF] text-[#112743]">
            <Head title={`Pakta Integritas ${pactRoleLabel} - ${event.name}`} />

            {/* Header Navigation */}
            <header className="sticky top-0 z-30 border-b border-[#DCE7F3] bg-white/95 backdrop-blur-md">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/event/${event.slug}/ruang-belajar`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE7F3] px-3 py-1.5 text-xs font-semibold text-[#6B7C93] transition hover:border-[#0B63CE] hover:text-[#0B63CE]"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Kamar Belajar</span>
                        </Link>
                        <div className="hidden sm:block">
                            <span className="text-xs font-semibold text-[#6B7C93]">{event.name}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {pact.status === 'signed' && (
                            <a
                                href={`/event/${event.slug}/pakta-integritas/cetak`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0E2747] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#0A3F82]"
                            >
                                <Printer className="h-3.5 w-3.5" />
                                <span>Cetak Dokumen Resmi</span>
                            </a>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
                {/* Banner Status */}
                {recentlySuccessful && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 shadow-xs">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <div>
                            <p className="font-bold">Pakta Integritas Berhasil Ditandatangani!</p>
                            <p className="mt-0.5 text-emerald-700">
                                Berkas telah disimpan secara digital. Anda dapat mencetak atau mengunduh salinan resmi ber-materai kapan saja.
                            </p>
                        </div>
                    </div>
                )}

                {Object.keys(errors).length > 0 && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900 shadow-xs">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                        <div>
                            <p className="font-bold">Mohon lengkapi formulir dengan benar:</p>
                            <ul className="mt-1 list-inside list-disc space-y-0.5 text-rose-700">
                                {Object.values(errors).map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Document Container Card */}
                <div className="rounded-2xl border border-[#DCE7F3] bg-white p-6 shadow-sm sm:p-10">
                    {/* Header Identitas Resmi PERKEMI */}
                    <div className="border-b border-[#DCE7F3] pb-6 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B63CE]/10 text-[#0B63CE]">
                            <Shield className="h-7 w-7" />
                        </div>
                        <h1 className="mt-4 font-serif text-2xl font-bold uppercase tracking-wider text-[#0E2747] sm:text-3xl">
                            Pakta Integritas
                        </h1>
                        <p className="mt-1 text-sm font-semibold tracking-wide text-[#0B63CE] uppercase">
                            {pactRoleLabel} Shorinji Kempo
                        </p>
                        <p className="mt-1 text-xs text-[#6B7C93]">
                            Persaudaraan Bela Diri Kempo Indonesia (PB PERKEMI)
                        </p>

                        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF5FF] px-3 py-1 text-[11px] font-bold text-[#0B63CE]">
                                <Award className="h-3 w-3" />
                                {participant.track_name || participant.track_code}
                            </span>
                            {pact.status === 'signed' ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Sudah Ditandatangani ({pact.signed_at})
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-800">
                                    <PenTool className="h-3 w-3" />
                                    Menunggu Tanda Tangan
                                </span>
                            )}
                        </div>
                    </div>

                    {/* SWITCHER METODE PENGISIAN */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-3 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
                        <button
                            type="button"
                            onClick={() => setEntryMode('online')}
                            className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg font-bold text-xs sm:text-sm transition-all ${
                                entryMode === 'online'
                                    ? 'bg-white text-[#0B63CE] shadow-sm border border-slate-200'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                            }`}
                        >
                            <FileEdit className="h-4 w-4" />
                            <span>1. Isi Pakta Integritas Online (Tanda Tangan Digital)</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setEntryMode('upload')}
                            className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg font-bold text-xs sm:text-sm transition-all ${
                                entryMode === 'upload'
                                    ? 'bg-white text-[#0B63CE] shadow-sm border border-slate-200'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                            }`}
                        >
                            <Upload className="h-4 w-4" />
                            <span>2. Unduh Blanko & Unggah Berkas Fisik (Scan / PDF / Foto)</span>
                            {pact.file_url && (
                                <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                    Terunggah
                                </span>
                            )}
                        </button>
                    </div>

                    {entryMode === 'upload' ? (
                        <div className="mt-6 space-y-6">
                            {/* Banner Penjelasan & Tombol Unduh Blanko */}
                            <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-5 shadow-xs">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-sm text-[#0E2747] flex items-center gap-2">
                                            <Upload className="h-4 w-4 text-[#0B63CE]" />
                                            Pilihan Praktis: Unggah Berkas Fisik / Lembar Hasil Scan
                                        </h3>
                                        <p className="text-xs text-[#5B6B82] leading-relaxed max-w-2xl">
                                            Jika Anda ingin menandatangani dokumen fisik bermaterai secara manual, silakan unduh format blanko resmi di samping, tandatangani basah, lalu unggah kembali hasil scan (PDF) atau foto lembar tersebut di sini.
                                        </p>
                                    </div>
                                    <a
                                        href={`/event/${event.slug}/pakta-integritas/cetak`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-white border border-[#0B63CE] px-4 py-2.5 text-xs font-semibold text-[#0B63CE] hover:bg-blue-50 transition-colors shrink-0 shadow-xs"
                                    >
                                        <Download className="h-4 w-4" />
                                        Unduh Format Cetak PB PERKEMI (Blanko/PDF)
                                    </a>
                                </div>
                            </div>

                            {/* Status Berkas Saat Ini jika sudah ada */}
                            {pact.file_url && (
                                <div className="rounded-xl border border-emerald-300 bg-emerald-50/90 p-5 shadow-xs">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3.5">
                                            <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-300">
                                                <FileCheck className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                                                        Berkas Terdaftar
                                                    </span>
                                                    {pact.file_size_formatted && (
                                                        <span className="text-xs text-emerald-800">
                                                            ({pact.file_size_formatted})
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm font-bold text-slate-900 mt-1">
                                                    {pact.original_file_name || 'Berkas Pakta Integritas Terunggah'}
                                                </p>
                                                <p className="text-xs text-emerald-800 mt-0.5">
                                                    Berkas pakta integritas Anda telah tersimpan dan siap diverifikasi oleh Pengurus Besar PERKEMI.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <a
                                                href={pact.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-600 bg-white px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition-colors shadow-xs"
                                            >
                                                <FileText className="h-4 w-4" />
                                                <span>Buka / Pratinjau Berkas</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Upload Form */}
                            <form onSubmit={handleUploadSubmit} className="space-y-6">
                                {/* Kategori Pakta */}
                                <div>
                                    <label className="block text-xs font-bold text-[#0E2747] mb-2">
                                        Kategori Pakta Integritas yang Diunggah <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        {[
                                            { id: 'pelatih', label: 'Pelatih', desc: 'Pelatih Daerah / Nasional (PD / PN)' },
                                            { id: 'penguji', label: 'Penguji', desc: 'Penguji Daerah / Nasional (PED / PEN)' },
                                            { id: 'wasit', label: 'Wasit', desc: 'Wasit Daerah / Nasional (WAD / WAN)' },
                                        ].map((item) => (
                                            <label
                                                key={item.id}
                                                className={`flex cursor-pointer flex-col rounded-xl border p-3.5 transition ${
                                                    uploadData.pact_type === item.id
                                                        ? 'border-[#0B63CE] bg-[#F0F7FF] ring-2 ring-[#0B63CE]/20'
                                                        : 'border-[#DCE7F3] bg-white hover:border-[#6B7C93]'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-bold text-[#0E2747]">{item.label}</span>
                                                    <input
                                                        type="radio"
                                                        name="upload_pact_type"
                                                        value={item.id}
                                                        checked={uploadData.pact_type === item.id}
                                                        onChange={(e) => setUploadData('pact_type', e.target.value)}
                                                        className="h-4 w-4 text-[#0B63CE] focus:ring-[#0B63CE]"
                                                    />
                                                </div>
                                                <span className="mt-1 text-[11px] text-[#6B7C93]">{item.desc}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* File Dropzone */}
                                <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-6 sm:p-8 text-center hover:border-[#0B63CE] hover:bg-blue-50/30 transition-all">
                                    <input
                                        type="file"
                                        id="pact-file-upload"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        onChange={(e) => setUploadData('file', e.target.files[0] || null)}
                                        className="hidden"
                                        required={!pact.file_url}
                                    />
                                    <label htmlFor="pact-file-upload" className="cursor-pointer block space-y-3">
                                        <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 text-[#0B63CE] flex items-center justify-center shadow-xs">
                                            <Upload className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">
                                                {uploadData.file ? uploadData.file.name : 'Pilih Berkas Scan / Foto Pakta Integritas'}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Format berkas: <strong>PDF, DOC, DOCX, JPG, PNG</strong> (Maksimal 10 MB)
                                            </p>
                                        </div>
                                        <div>
                                            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0B63CE] text-white text-xs font-semibold shadow-xs hover:bg-[#0A3F82] transition-colors">
                                                <Upload className="w-3.5 h-3.5" />
                                                {uploadData.file ? 'Ganti File Pilihan' : 'Pilih File dari Komputer/HP'}
                                            </span>
                                        </div>
                                    </label>
                                </div>

                                {uploadErrors.file && (
                                    <p className="text-xs text-rose-600 font-semibold">{uploadErrors.file}</p>
                                )}

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                                    <button
                                        type="submit"
                                        disabled={uploadProcessing || (!uploadData.file && !pact.file_url)}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B63CE] px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#0A3F82] disabled:opacity-50"
                                    >
                                        <Save className="h-4 w-4" />
                                        <span>{uploadProcessing ? 'Mengunggah Berkas…' : 'Unggah & Simpan Berkas Pakta Integritas'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
                        {/* 1. Kategori & Peran Lisensi */}
                        <section aria-labelledby="section-role">
                            <h2 id="section-role" className="flex items-center gap-2 text-sm font-bold text-[#0E2747]">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0B63CE] text-[10px] text-white">
                                    1
                                </span>
                                Kategori Penataran & Lisensi
                            </h2>
                            <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                {[
                                    { id: 'pelatih', label: 'Pelatih', desc: 'Pelatih Daerah / Nasional (PD / PN)' },
                                    { id: 'penguji', label: 'Penguji', desc: 'Penguji Daerah / Nasional (PED / PEN)' },
                                    { id: 'wasit', label: 'Wasit', desc: 'Wasit Daerah / Nasional (WAD / WAN)' },
                                ].map((item) => (
                                    <label
                                        key={item.id}
                                        className={`flex cursor-pointer flex-col rounded-xl border p-3.5 transition ${
                                            data.pact_type === item.id
                                                ? 'border-[#0B63CE] bg-[#F0F7FF] ring-2 ring-[#0B63CE]/20'
                                                : 'border-[#DCE7F3] bg-white hover:border-[#6B7C93]'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-[#0E2747]">{item.label}</span>
                                            <input
                                                type="radio"
                                                name="pact_type"
                                                value={item.id}
                                                checked={data.pact_type === item.id}
                                                onChange={(e) => setData('pact_type', e.target.value)}
                                                className="h-4 w-4 text-[#0B63CE] focus:ring-[#0B63CE]"
                                            />
                                        </div>
                                        <span className="mt-1 text-[11px] text-[#6B7C93]">{item.desc}</span>
                                    </label>
                                ))}
                            </div>
                        </section>

                        {/* 2. Identitas Lengkap Kenshi */}
                        <section aria-labelledby="section-identity">
                            <h2 id="section-identity" className="flex items-center gap-2 text-sm font-bold text-[#0E2747]">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0B63CE] text-[10px] text-white">
                                    2
                                </span>
                                Identitas Kenshi
                            </h2>

                            <div className="mt-3 grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-semibold text-[#0E2747]">
                                        Nama Lengkap Sesuai KTP / SIM PERKEMI <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.full_name}
                                        onChange={(e) => setData('full_name', e.target.value)}
                                        className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[#0E2747]">
                                        Nomor Induk Kenshi (NIK) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.kenshi_id_number}
                                        onChange={(e) => setData('kenshi_id_number', e.target.value)}
                                        className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs font-mono text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[#0E2747]">
                                        Tempat Lahir <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.birth_place}
                                        onChange={(e) => setData('birth_place', e.target.value)}
                                        placeholder="Contoh: Surabaya"
                                        className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[#0E2747]">
                                        Tanggal Lahir <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={data.birth_date}
                                        onChange={(e) => setData('birth_date', e.target.value)}
                                        className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[#0E2747]">
                                        Tingkatan DAN <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.dan_level}
                                        onChange={(e) => setData('dan_level', e.target.value)}
                                        placeholder="Contoh: III (Tiga) DAN"
                                        className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[#0E2747]">
                                        Agama <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.religion}
                                        onChange={(e) => setData('religion', e.target.value)}
                                        className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                                        required
                                    >
                                        <option value="Islam">Islam</option>
                                        <option value="Kristen Protestan">Kristen Protestan</option>
                                        <option value="Katolik">Katolik</option>
                                        <option value="Hindu">Hindu</option>
                                        <option value="Buddha">Buddha</option>
                                        <option value="Khonghucu">Khonghucu</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[#0E2747]">
                                        Asal Dojo <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.dojo}
                                        onChange={(e) => setData('dojo', e.target.value)}
                                        placeholder="Contoh: Perak Surabaya"
                                        className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-[#0E2747]">
                                            Kota / Kab <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.city}
                                            onChange={(e) => setData('city', e.target.value)}
                                            placeholder="Surabaya"
                                            className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[#0E2747]">
                                            Provinsi <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.province}
                                            onChange={(e) => setData('province', e.target.value)}
                                            placeholder="Jawa Timur"
                                            className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 3. Lisensi & Alamat Lengkap */}
                        <section aria-labelledby="section-cert">
                            <h2 id="section-cert" className="flex items-center gap-2 text-sm font-bold text-[#0E2747]">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0B63CE] text-[10px] text-white">
                                    3
                                </span>
                                Data Sertifikat Lisensi & Alamat
                            </h2>

                            <div className="mt-3 space-y-4">
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-[#0E2747]">
                                            Nomor Sertifikat {data.pact_type.toUpperCase()}
                                        </label>
                                        <input
                                            type="text"
                                            value={data.certificate_number}
                                            onChange={(e) => setData('certificate_number', e.target.value)}
                                            placeholder="Contoh: 073/PLT-DRH/XII/2026"
                                            className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs font-mono text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                                        />
                                        <span className="text-[10px] text-[#6B7C93]">Otomatis diisi panitia saat kelulusan</span>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[#0E2747]">
                                            Tanggal Mulai Berlaku
                                        </label>
                                        <input
                                            type="date"
                                            value={data.valid_start_date}
                                            onChange={(e) => setData('valid_start_date', e.target.value)}
                                            className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[#0E2747]">
                                            Tanggal Selesai Berlaku
                                        </label>
                                        <input
                                            type="date"
                                            value={data.valid_end_date}
                                            onChange={(e) => setData('valid_end_date', e.target.value)}
                                            className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[#0E2747]">
                                        Alamat Lengkap Sesuai KTP <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={data.id_card_address}
                                        onChange={(e) => {
                                            setData('id_card_address', e.target.value);
                                            if (sameAddress) setData('current_address', e.target.value);
                                        }}
                                        placeholder="Jl. Teluk Aru Utara No.61 B Surabaya"
                                        className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white p-3 text-xs text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                                        required
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs font-semibold text-[#0E2747]">
                                            Alamat Lengkap Saat Ini / Domisili
                                        </label>
                                        <label className="flex items-center gap-1.5 text-xs text-[#6B7C93] cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={sameAddress}
                                                onChange={(e) => handleSameAddressChange(e.target.checked)}
                                                className="rounded border-[#DCE7F3] text-[#0B63CE] focus:ring-[#0B63CE]"
                                            />
                                            <span>Sama dengan alamat KTP</span>
                                        </label>
                                    </div>
                                    <textarea
                                        rows={2}
                                        value={data.current_address}
                                        onChange={(e) => setData('current_address', e.target.value)}
                                        disabled={sameAddress}
                                        className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white p-3 text-xs text-[#0E2747] disabled:bg-slate-50 disabled:text-slate-500 focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                                    />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-[#0E2747]">
                                            Menjadi Pengurus pada
                                        </label>
                                        <input
                                            type="text"
                                            value={data.management_organization}
                                            onChange={(e) => setData('management_organization', e.target.value)}
                                            placeholder="Contoh: Pengkot Surabaya / Pengprov Jatim / -"
                                            className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[#0E2747]">
                                            Sebagai (Jabatan)
                                        </label>
                                        <input
                                            type="text"
                                            value={data.management_position}
                                            onChange={(e) => setData('management_position', e.target.value)}
                                            placeholder="Contoh: Ketua Bidang Kepelatihan / Anggota / -"
                                            className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 4. Butir Ikrar & Pernyataan Integritas Resmi PB PERKEMI */}
                        <section aria-labelledby="section-pledges" className="rounded-xl border border-[#0B63CE]/20 bg-[#F0F7FF] p-5 sm:p-6">
                            <h2 id="section-pledges" className="flex items-center gap-2 text-sm font-bold text-[#0E2747]">
                                <Shield className="h-4 w-4 text-[#0B63CE]" />
                                Pernyataan & Komitmen Integritas PB PERKEMI
                            </h2>
                            <p className="mt-1 text-xs text-[#6B7C93]">
                                Dengan ini menyatakan secara sadar dan sungguh-sungguh atas hal-hal sebagai berikut:
                            </p>

                            <ol className="mt-4 space-y-3">
                                {pledgePoints.map((point, index) => (
                                    <li key={index} className="flex items-start gap-3 text-xs leading-relaxed text-[#112743]">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0B63CE] text-[10px] font-bold text-white">
                                            {index + 1}
                                        </span>
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ol>

                            <div className="mt-5 rounded-lg border border-[#DCE7F3] bg-white p-3.5 text-xs text-[#6B7C93] leading-relaxed italic">
                                &ldquo;Demikian Pakta Integritas ini saya tanda tangani dengan kesadaran penuh tanpa desakan atau paksaan didalam bentuk yang bagaimanapun dan dari pihak manapun. Apabila saya melakukan pelanggaran dengan sengaja ataupun tanpa sengaja, atas ketentuan dan/atau persyaratan Pakta Integritas ini, tertulis atau tersirat, maka Saya bersedia untuk bertanggung jawab sepenuhnya termasuk untuk mendapatkan sanksi Organisasi sesuai dengan ketentuan yang berlaku.&rdquo;
                            </div>
                        </section>

                        {/* 5. Tanda Tangan Digital & Materai */}
                        <section aria-labelledby="section-signature">
                            <h2 id="section-signature" className="flex items-center gap-2 text-sm font-bold text-[#0E2747]">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0B63CE] text-[10px] text-white">
                                    5
                                </span>
                                Tanda Tangan Digital & Legalisasi
                            </h2>

                            <div className="mt-3 grid gap-6 sm:grid-cols-2">
                                <div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs font-semibold text-[#0E2747]">
                                                Tempat Penandatanganan <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.sign_place}
                                                onChange={(e) => setData('sign_place', e.target.value)}
                                                className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-[#0E2747]">
                                                Tanggal <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={data.sign_date}
                                                onChange={(e) => setData('sign_date', e.target.value)}
                                                className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Preview Kotak Materai Resmi */}
                                    <div className="mt-4 flex items-center gap-4 rounded-xl border border-dashed border-[#DCE7F3] bg-[#F8FBFF] p-4">
                                        <div className="flex h-16 w-24 shrink-0 flex-col items-center justify-center rounded-lg border-2 border-emerald-600 bg-emerald-50 text-center">
                                            <span className="text-[9px] font-black tracking-widest text-emerald-800 uppercase">MATERAI</span>
                                            <span className="text-xs font-black text-emerald-700">Rp 10.000</span>
                                        </div>
                                        <p className="text-[11px] text-[#6B7C93] leading-snug">
                                            Sesuai ketentuan PB PERKEMI, tanda tangan digital Anda akan ditempatkan di atas stempel Materai Rp 10.000 pada salinan cetak resmi.
                                        </p>
                                    </div>

                                    <div className="mt-4">
                                        <label className="flex items-start gap-2.5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={data.agree_pledge}
                                                onChange={(e) => setData('agree_pledge', e.target.checked)}
                                                className="mt-0.5 rounded border-[#DCE7F3] text-[#0B63CE] focus:ring-[#0B63CE]"
                                                required
                                            />
                                            <span className="text-xs text-[#0E2747] leading-relaxed">
                                                Saya menyatakan telah membaca dan menyetujui seluruh butir Pakta Integritas PB PERKEMI di atas dengan penuh kesadaran dan tanggung jawab.
                                            </span>
                                        </label>
                                        {errors.agree_pledge && (
                                            <p className="mt-1 text-xs text-rose-600">{errors.agree_pledge}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Canvas Pad */}
                                <div>
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs font-semibold text-[#0E2747]">
                                            Goreskan Tanda Tangan Digital <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={autoGenerateSignature}
                                                className="inline-flex items-center gap-1 text-[11px] text-[#0B63CE] hover:underline"
                                                title="Buat tanda tangan otomatis dari nama"
                                            >
                                                <Sparkles className="h-3 w-3" />
                                                <span>Buat Rapi</span>
                                            </button>
                                            <span className="text-slate-300">•</span>
                                            <button
                                                type="button"
                                                onClick={clearSignature}
                                                className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:underline"
                                            >
                                                <RotateCcw className="h-3 w-3" />
                                                <span>Hapus</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="relative mt-1 overflow-hidden rounded-xl border border-[#DCE7F3] bg-white shadow-xs touch-none">
                                        <canvas
                                            ref={canvasRef}
                                            width={360}
                                            height={160}
                                            className="h-40 w-full cursor-crosshair bg-white"
                                            onMouseDown={startDrawing}
                                            onMouseMove={draw}
                                            onMouseUp={stopDrawing}
                                            onMouseLeave={stopDrawing}
                                            onTouchStart={startDrawing}
                                            onTouchMove={draw}
                                            onTouchEnd={stopDrawing}
                                        />
                                        {!hasDrawn && (
                                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-slate-300">
                                                Tanda tangani di sini dengan jari / kursor
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-2 text-center text-xs font-bold text-[#0E2747] uppercase tracking-wide">
                                        ({data.full_name || participant.name})
                                    </div>

                                    {errors.signature_data && (
                                        <p className="mt-1 text-xs text-rose-600">{errors.signature_data}</p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Submit Button Bar */}
                        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#DCE7F3] pt-6">
                            <Link
                                href={`/event/${event.slug}/ruang-belajar`}
                                className="inline-flex items-center justify-center rounded-lg border border-[#DCE7F3] bg-white px-4 py-2 text-xs font-semibold text-[#6B7C93] transition hover:bg-slate-50"
                            >
                                Kembali
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B63CE] px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#0A3F82] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] disabled:opacity-50"
                            >
                                <Save className="h-4 w-4" />
                                <span>{processing ? 'Menyimpan…' : 'Simpan & Tandatangani Pakta Integritas'}</span>
                            </button>
                        </div>
                    </form>
                    )}
                </div>
            </main>
        </div>
    );
}
