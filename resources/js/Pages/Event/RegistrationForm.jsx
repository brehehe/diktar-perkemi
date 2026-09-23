import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import PortalLayout from '../../Layouts/PortalLayout';
import {
    FileText,
    Shield,
    Calendar,
    MapPin,
    User,
    Phone,
    Mail,
    Building2,
    Briefcase,
    AlertCircle,
    CheckCircle2,
    Plus,
    Trash2,
    PenTool,
    Printer,
    ArrowLeft,
    Save,
    RotateCcw,
    Award,
    FileCheck,
    Upload,
    Download,
    FileEdit,
    ExternalLink,
} from 'lucide-react';

export default function RegistrationForm({
    event,
    participant,
    formTypeInfo,
    initialData,
    form,
}) {
    const { flash } = usePage().props;
    const [clientErrors, setClientErrors] = useState({});
    const { data, setData, post, processing, errors } = useForm({
        participant_id: participant?.id || null,
        form_type: initialData?.form_type || formTypeInfo?.form_type || 'PELATIH',
        penataran_level: initialData?.penataran_level || formTypeInfo?.penataran_level || 'Daerah',
        start_date: initialData?.start_date || '',
        end_date: initialData?.end_date || '',
        location: initialData?.location || '',
        full_name: initialData?.full_name || participant?.name || '',
        birth_place: initialData?.birth_place || '',
        birth_date: initialData?.birth_date || '',
        kenshi_id_number: initialData?.kenshi_id_number || participant?.kenshi_id_number || '',
        dan_level: initialData?.dan_level || participant?.dan_rank || '1 DAN',
        home_address: initialData?.home_address || '',
        phone_number: initialData?.phone_number || participant?.phone || '',
        email: initialData?.email || participant?.email || '',
        occupation: initialData?.occupation || '',
        occupation_address: initialData?.occupation_address || '',
        occupation_phone: initialData?.occupation_phone || '',
        emergency_address: initialData?.emergency_address || '',
        emergency_phone: initialData?.emergency_phone || '',
        gasnas_records: Array.isArray(initialData?.gasnas_records) && initialData.gasnas_records.some((r) => r && (r.nomor || r.tanggal))
            ? initialData.gasnas_records.filter((r) => r && (r.nomor || r.tanggal))
            : [],
        certificate_records: Array.isArray(initialData?.certificate_records) && initialData.certificate_records.some((r) => r && (r.jenis || r.nomor || r.tanggal))
            ? initialData.certificate_records.filter((r) => r && (r.jenis || r.nomor || r.tanggal))
            : [],
        sign_place: initialData?.sign_place || 'Mojokerto',
        sign_date: initialData?.sign_date || new Date().toISOString().split('T')[0],
        applicant_name: initialData?.applicant_name || participant?.name || '',
        signature_data: initialData?.signature_data || '',
        waiver_agreed: initialData?.waiver_agreed ?? true,
    });

    // Signature Canvas State & Refs
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasNewSignature, setHasNewSignature] = useState(false);

    // Initialize Canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#0E2747';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }, []);

    const getCanvasCoordinates = (e) => {
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
        const { x, y } = getCanvasCoordinates(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
        setHasNewSignature(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const { x, y } = getCanvasCoordinates(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = (e) => {
        if (!isDrawing) return;
        e.preventDefault();
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
        setData('signature_data', '');
        setHasNewSignature(false);
    };

    const generateAutoSignature = () => {
        const name = data.applicant_name || participant?.name || 'Kenshi';
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0E2747';
        ctx.font = 'italic 34px "Brush Script MT", cursive, sans-serif';
        ctx.textBaseline = 'middle';
        ctx.fillText(name, 20, canvas.height / 2);
        const dataUrl = canvas.toDataURL('image/png');
        setData('signature_data', dataUrl);
        setHasNewSignature(true);
    };

    // Dynamic Row Helpers for Gasnas
    const addGasnasRow = () => {
        setData('gasnas_records', [...(data.gasnas_records || []), { nomor: '', tanggal: '' }]);
    };

    const removeGasnasRow = (index) => {
        const updated = (data.gasnas_records || []).filter((_, i) => i !== index);
        setData('gasnas_records', updated);
    };

    const updateGasnasRow = (index, field, value) => {
        const updated = [...(data.gasnas_records || [])];
        updated[index] = { ...updated[index], [field]: value };
        setData('gasnas_records', updated);
    };

    // Dynamic Row Helpers for Certificates
    const addCertificateRow = () => {
        setData('certificate_records', [...(data.certificate_records || []), { jenis: '', nomor: '', tanggal: '' }]);
    };

    const removeCertificateRow = (index) => {
        const updated = (data.certificate_records || []).filter((_, i) => i !== index);
        setData('certificate_records', updated);
    };

    const updateCertificateRow = (index, field, value) => {
        const updated = [...(data.certificate_records || [])];
        updated[index] = { ...updated[index], [field]: value };
        setData('certificate_records', updated);
    };

    const allErrors = { ...errors, ...clientErrors };

    const handleSubmit = (e) => {
        e.preventDefault();

        // 1. Client-side validation check
        const errs = {};
        if (!data.full_name?.trim()) errs.full_name = 'Nama lengkap pemohon wajib diisi.';
        if (!data.kenshi_id_number?.trim()) errs.kenshi_id_number = 'Nomor Induk Kenshi (NIK) wajib diisi.';
        if (!data.dan_level?.trim()) errs.dan_level = 'Tingkatan DAN wajib diisi.';
        if (!data.birth_place?.trim()) errs.birth_place = 'Tempat lahir wajib diisi.';
        if (!data.birth_date) errs.birth_date = 'Tanggal lahir wajib diisi.';
        if (!data.phone_number?.trim()) errs.phone_number = 'Nomor telepon / WhatsApp wajib diisi.';
        if (!data.home_address?.trim()) errs.home_address = 'Alamat rumah tempat tinggal wajib diisi.';
        if (!data.emergency_phone?.trim()) errs.emergency_phone = 'Nomor kontak darurat wajib diisi demi keselamatan kegiatan.';
        if (!data.sign_place?.trim()) errs.sign_place = 'Kota penandatanganan formulir wajib diisi.';
        if (!data.sign_date) errs.sign_date = 'Tanggal penandatanganan formulir wajib diisi.';
        if (!data.applicant_name?.trim()) errs.applicant_name = 'Nama pemohon penandatangan wajib diisi.';
        if (!data.waiver_agreed) errs.waiver_agreed = 'Anda wajib mencentang persetujuan Surat Pernyataan dan Pembebasan sebelum menyimpan formulir.';

        if (Object.keys(errs).length > 0) {
            setClientErrors(errs);
            setTimeout(() => {
                const el = document.getElementById('form-error-banner');
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 50);
            return;
        }

        setClientErrors({});

        // 2. Generate signature fallback if not drawn
        let sigData = data.signature_data;
        if (!sigData && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const name = data.applicant_name || data.full_name || participant?.name || 'Kenshi';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#0E2747';
            ctx.font = 'italic 34px "Brush Script MT", cursive, sans-serif';
            ctx.textBaseline = 'middle';
            ctx.fillText(name, 20, canvas.height / 2);
            sigData = canvas.toDataURL('image/png');
            setData('signature_data', sigData);
        }

        post(`/event/${event.slug}/formulir-pendaftaran`, {
            preserveScroll: true,
            onError: () => {
                setTimeout(() => {
                    const el = document.getElementById('form-error-banner');
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 100);
            },
            onSuccess: () => {
                setTimeout(() => {
                    const el = document.getElementById('form-success-banner');
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 100);
            },
        });
    };

    // Upload Berkas Scan / Fisik State
    const hasUploadedFile = Boolean(initialData?.file_url || form?.file_url);
    const [entryMode, setEntryMode] = useState(
        (initialData?.submission_mode === 'upload' || (hasUploadedFile && !initialData?.full_name)) ? 'upload' : 'online'
    );
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadPenataranLevel, setUploadPenataranLevel] = useState(initialData?.penataran_level || formTypeInfo?.penataran_level || 'Daerah');
    const [uploadFormType, setUploadFormType] = useState(initialData?.form_type || formTypeInfo?.form_type || 'PELATIH');
    const [uploadNotes, setUploadNotes] = useState('');
    const [uploadAgreed, setUploadAgreed] = useState(true);
    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    const handleUploadSubmit = (e) => {
        e.preventDefault();
        if (!uploadFile) {
            setUploadError('Silakan pilih berkas formulir fisik/scan terlebih dahulu.');
            return;
        }
        if (!uploadAgreed) {
            setUploadError('Anda harus menyetujui pernyataan keabsahan dokumen sebelum mengunggah.');
            return;
        }

        setUploadError(null);
        setIsUploadingFile(true);

        const formData = new FormData();
        if (participant?.id) {
            formData.append('participant_id', participant.id);
        }
        formData.append('file', uploadFile);
        formData.append('form_type', uploadFormType);
        formData.append('penataran_level', uploadPenataranLevel);
        if (uploadNotes) {
            formData.append('notes', uploadNotes);
        }

        router.post(`/event/${event.slug}/formulir-pendaftaran/upload`, formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsUploadingFile(false);
                setUploadFile(null);
            },
            onError: (err) => {
                setIsUploadingFile(false);
                setUploadError(typeof err === 'object' ? Object.values(err)[0] : 'Gagal mengunggah berkas.');
            },
        });
    };

    const isSubmitted = initialData?.status === 'submitted' || initialData?.status === 'verified';
    const isVerified = initialData?.status === 'verified';

    return (
        <PortalLayout title={`Formulir Penataran ${formTypeInfo.form_type}`}>
            <Head title={`Formulir Penataran ${formTypeInfo.form_type} — ${event.name}`} />

            <div className="w-full max-w-full px-4 py-6 sm:px-6 lg:px-8">
                {/* Mode Administrator Banner jika admin sedang mengisi untuk peserta */}
                {participant?.is_admin_mode && (
                    <div className="mb-4 rounded-xl border border-purple-200 bg-purple-50 p-4 text-purple-950 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-purple-100 p-2 text-purple-700 shrink-0">
                                <Shield className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                                    Mode Administrator (Pengurus / Panitia Event)
                                </p>
                                <p className="text-xs text-purple-800">
                                    Anda sedang mengisi atau menyesuaikan formulir atas nama kenshi: <strong>{participant.name}</strong> (NIK: {participant.kenshi_id_number || '-'}, Dojo: {participant.dojo || '-'}). Data yang disimpan akan langsung tercatat di sistem.
                                </p>
                            </div>
                        </div>
                        <Link
                            href={`/admin/event/${event.id}?tab=formulir`}
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-purple-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-purple-800 transition shrink-0 shadow-xs"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Kembali ke Tab Formulir Admin
                        </Link>
                    </div>
                )}

                {/* Navigation Back & Status Bar */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#DCE7F3] pb-4">
                    <Link
                        href={participant?.is_admin_mode ? `/admin/event/${event.id}?tab=formulir` : `/event/${event.slug}/ruang-belajar`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B63CE] hover:text-[#0A3F82]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {participant?.is_admin_mode ? 'Kembali ke Panel Admin' : 'Kembali ke Ruang Belajar'}
                    </Link>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {hasUploadedFile && (
                            <a
                                href={initialData?.file_url || form?.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                                title="Buka berkas scan formulir fisik yang sudah terunggah"
                            >
                                <FileText className="h-3.5 w-3.5" />
                                <span>Berkas Scan Terunggah</span>
                                {(initialData?.file_size_formatted || form?.file_size_formatted) && (
                                    <span className="text-[10px] text-indigo-500">
                                        ({initialData?.file_size_formatted || form?.file_size_formatted})
                                    </span>
                                )}
                            </a>
                        )}

                        {isVerified ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                Terverifikasi Admin PB
                            </span>
                        ) : isSubmitted ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 border border-blue-200">
                                <FileCheck className="h-3.5 w-3.5 text-blue-600" />
                                Formulir Terkirim
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
                                <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                                Belum Terkirim (Draft)
                            </span>
                        )}

                        {isSubmitted && (
                            <a
                                href={`/event/${event.slug}/formulir-pendaftaran/cetak`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#0B63CE] bg-white px-3 py-1.5 text-xs font-semibold text-[#0B63CE] hover:bg-[#EAF5FF] transition-colors"
                            >
                                <Printer className="h-3.5 w-3.5" />
                                Cetak Formulir PB
                            </a>
                        )}
                    </div>
                </div>

                {/* Form Official Header Banner */}
                <div className="rounded-xl border border-[#DCE7F3] bg-gradient-to-br from-[#0E2747] via-[#112743] to-[#0A3F82] p-6 text-white shadow-md sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                        <div className="flex items-center gap-4">
                            <img
                                src="/images/perkemi-logo.png"
                                alt="Logo PB PERKEMI"
                                className="h-16 w-16 object-contain rounded-full bg-white p-1 shadow-md shrink-0"
                            />
                            <div className="space-y-1">
                                <span className="inline-block rounded-md bg-[#EE9B25] px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#0E2747]">
                                    {formTypeInfo.lampiran_label}
                                </span>
                                <h1 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
                                    FORMULIR PERMOHONAN MENGIKUTI PENATARAN {formTypeInfo.form_type} {data.penataran_level.toUpperCase()}
                                </h1>
                                <p className="text-xs text-[#DCE7F3] sm:text-sm">
                                    Persaudaraan Shorinji Kempo Indonesia (PB PERKEMI) • {event.name}
                                </p>
                            </div>
                        </div>
                        <div className="shrink-0 rounded-lg bg-white/10 p-3 backdrop-blur-xs text-right hidden sm:block">
                            <p className="text-[11px] text-gray-300">Tempat & Tanggal</p>
                            <p className="text-xs font-semibold text-white">{event.place}</p>
                            <p className="text-[11px] text-gray-300">{event.start_date} – {event.end_date}</p>
                        </div>
                    </div>
                </div>

                {/* PB PERKEMI Verifikasi Block if Verified */}
                {isVerified && (
                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/80 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-emerald-100 p-2.5 text-emerald-700">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-[#5B6B82] uppercase tracking-wider">
                                    PB PERKEMI Verifikasi
                                </p>
                                <p className="text-base font-bold text-[#0F172A]">
                                    {form?.verified_by_name || initialData?.verified_by_name || 'Budi Santoso'}
                                </p>
                                <p className="text-[11px] text-emerald-700">
                                    Formulir telah disetujui & diverifikasi resmi oleh Pengurus Besar PERKEMI.
                                </p>
                            </div>
                        </div>
                        <a
                            href={`/event/${event.slug}/formulir-pendaftaran/cetak`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B63CE] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0A3F82] transition-colors shadow-xs"
                        >
                            <Printer className="h-4 w-4" />
                            Cetak Formulir Resmi (PDF)
                        </a>
                    </div>
                )}

                {/* Banner Status Berhasil Disimpan jika isSubmitted atau ada flash success */}
                {(flash?.success || (isSubmitted && !isVerified)) && (
                    <div id="form-success-banner" className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-emerald-100 p-2 text-emerald-700 shrink-0">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-emerald-900">
                                    {flash?.success || 'Formulir Pendaftaran Berhasil Disimpan & Dikirim'}
                                </p>
                                <p className="text-[11px] text-emerald-700">
                                    Data dan surat pernyataan Anda telah tercatat resmi di sistem PB PERKEMI. Anda dapat mencetak formulir kapan saja.
                                </p>
                            </div>
                        </div>
                        <a
                            href={`/event/${event.slug}/formulir-pendaftaran/cetak`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 transition-colors shadow-xs shrink-0"
                        >
                            <Printer className="h-3.5 w-3.5" />
                            Cetak Formulir PDF
                        </a>
                    </div>
                )}

                {/* Validation Error Banner */}
                {Object.keys(allErrors).length > 0 && (
                    <div id="form-error-banner" className="mt-4 rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-900 shadow-xs">
                        <div className="flex items-center gap-2 mb-2 font-bold text-sm text-rose-800">
                            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                            <span>Mohon periksa dan lengkapi isian formulir berikut:</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-xs text-rose-800 pl-2">
                            {Object.entries(allErrors).map(([field, msg]) => (
                                <li key={field}>
                                    <span className="font-semibold capitalize">{field.replace(/_/g, ' ')}</span>: {msg}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

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
                        <span>1. Isi Formulir Online (Interaktif)</span>
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
                        <span>2. Unggah Berkas Formulir (Scan / PDF / Foto Fisik)</span>
                        {hasUploadedFile && (
                            <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Terunggah
                            </span>
                        )}
                    </button>
                </div>

                {entryMode === 'upload' ? (
                    <div className="mt-6 space-y-6">
                        {/* Banner Penjelasan */}
                        <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-5 shadow-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h3 className="font-bold text-sm text-[#0E2747] flex items-center gap-2">
                                        <Upload className="h-4 w-4 text-[#0B63CE]" />
                                        Pilihan Praktis: Unggah Berkas Fisik / Lembar Hasil Scan
                                    </h3>
                                    <p className="text-xs text-[#5B6B82] leading-relaxed max-w-3xl">
                                        Jika Anda sudah mencetak formulir resmi PB PERKEMI, mengisi dengan tulisan tangan atau huruf cetak, menandatanganinya, dan/atau meminta pengesahan Pengdo/Pengkab/Pengkot, Anda cukup mengunggah hasil scan dokumen (PDF) atau foto lembar formulir tersebut di sini tanpa perlu mengetik ulang seluruh data.
                                    </p>
                                </div>
                                <a
                                    href={`/event/${event.slug}/formulir-pendaftaran/cetak`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-white border border-[#0B63CE] px-3.5 py-2 text-xs font-semibold text-[#0B63CE] hover:bg-blue-50 transition-colors shrink-0 shadow-xs"
                                >
                                    <Download className="h-4 w-4" />
                                    Unduh Format Cetak PB PERKEMI (Blanko)
                                </a>
                            </div>
                        </div>

                        {/* Status Berkas Saat Ini jika sudah ada */}
                        {hasUploadedFile && (
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
                                                {(initialData?.file_size_formatted || form?.file_size_formatted) && (
                                                    <span className="text-xs text-emerald-800">
                                                        ({initialData?.file_size_formatted || form?.file_size_formatted})
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm font-bold text-slate-900 mt-1">
                                                {initialData?.original_file_name || form?.original_file_name || 'Berkas Formulir Pendaftaran Terunggah'}
                                            </p>
                                            <p className="text-xs text-emerald-800 mt-0.5">
                                                Berkas formulir Anda telah tersimpan dan dapat diverifikasi oleh panitia / PB PERKEMI.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <a
                                            href={initialData?.file_url || form?.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm transition"
                                        >
                                            <Download className="h-4 w-4" />
                                            Buka / Unduh Berkas Saya
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Upload Form Card */}
                        <form onSubmit={handleUploadSubmit} className="rounded-xl border border-[#DCE7F3] bg-white p-6 shadow-xs space-y-6">
                            <div className="border-b border-[#DCE7F3] pb-3">
                                <h3 className="font-bold text-sm text-[#0E2747]">
                                    {hasUploadedFile ? 'Perbarui / Unggah Ulang Berkas Formulir' : 'Formulir Unggah Berkas Fisik'}
                                </h3>
                                <p className="text-xs text-[#6B7C93] mt-0.5">
                                    Unggah dokumen formulir dalam format PDF, DOC, DOCX, JPG, atau PNG. Maksimal ukuran berkas 10MB.
                                </p>
                            </div>

                            {uploadError && (
                                <div className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                                    <span>{uploadError}</span>
                                </div>
                            )}

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-semibold text-[#112743]">
                                        Kategori Formulir <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={uploadFormType}
                                        onChange={(e) => setUploadFormType(e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-[#DCE7F3] bg-[#F8FBFF] px-3 py-2 text-xs font-medium text-[#112743] focus:border-[#0B63CE] focus:bg-white focus:outline-none"
                                    >
                                        <option value="PELATIH">Pelatih</option>
                                        <option value="PENGUJI">Penguji</option>
                                        <option value="WASIT">Wasit</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[#112743]">
                                        Tingkat Penataran <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={uploadPenataranLevel}
                                        onChange={(e) => setUploadPenataranLevel(e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-[#DCE7F3] bg-[#F8FBFF] px-3 py-2 text-xs font-medium text-[#112743] focus:border-[#0B63CE] focus:bg-white focus:outline-none"
                                    >
                                        <option value="Daerah">Tingkat Daerah</option>
                                        <option value="Nasional">Tingkat Nasional</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#112743] mb-1">
                                    Pilih Berkas Formulir (Scan / PDF / Foto Dokumen Fisik) <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative rounded-xl border-2 border-dashed border-[#DCE7F3] bg-[#F8FBFF] p-6 text-center hover:border-[#0B63CE] transition-colors">
                                    <Upload className="mx-auto h-10 w-10 text-[#0B63CE] mb-2" />
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        onChange={(e) => {
                                            setUploadFile(e.target.files?.[0] || null);
                                            setUploadError(null);
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <p className="text-xs font-semibold text-[#112743]">
                                        Klik di sini atau seret berkas untuk memilih file
                                    </p>
                                    <p className="text-[11px] text-[#6B7C93] mt-1">
                                        PDF, DOCX, DOC, JPG, atau PNG (Maksimal 10MB)
                                    </p>
                                    {uploadFile && (
                                        <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-800">
                                            <FileCheck className="h-4 w-4 text-emerald-600" />
                                            <span>File Terpilih: <strong>{uploadFile.name}</strong> ({(uploadFile.size / 1024).toFixed(1)} KB)</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#112743] mb-1">
                                    Catatan Tambahan (Opsional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={uploadNotes}
                                    onChange={(e) => setUploadNotes(e.target.value)}
                                    placeholder="Contoh: Formulir sudah bertanda tangan dan berstempel Pengkab/Pengkot."
                                    className="block w-full rounded-md border border-[#DCE7F3] bg-[#F8FBFF] px-3 py-2 text-xs text-[#112743] focus:border-[#0B63CE] focus:bg-white focus:outline-none"
                                />
                            </div>

                            <div className="rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] p-3 text-xs">
                                <label className="flex items-start gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={uploadAgreed}
                                        onChange={(e) => setUploadAgreed(e.target.checked)}
                                        className="mt-0.5 rounded border-[#DCE7F3] text-[#0B63CE] focus:ring-[#0B63CE]"
                                    />
                                    <span className="text-[#112743]">
                                        Saya menyatakan dan menjamin bahwa berkas formulir pendaftaran fisik yang saya unggah adalah sah, lengkap, benar, dan merupakan dokumen permohonan resmi saya untuk mengikuti Penataran di PB PERKEMI.
                                    </span>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <Link
                                    href={participant?.is_admin_mode ? `/admin/event/${event.id}?tab=formulir` : `/event/${event.slug}/ruang-belajar`}
                                    className="rounded-lg border border-[#DCE7F3] bg-white px-5 py-2.5 text-xs font-semibold text-[#112743] hover:bg-[#F8FBFF]"
                                >
                                    Batal
                                </Link>

                                <button
                                    type="submit"
                                    disabled={isUploadingFile || !uploadFile}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0B63CE] px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#0A3F82] disabled:opacity-50 transition"
                                >
                                    <Upload className="h-4 w-4" />
                                    {isUploadingFile ? 'Mengunggah Berkas...' : (hasUploadedFile ? 'Unggah & Perbarui Berkas' : 'Unggah & Simpan Formulir')}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    /* Main Interactive Form Card */
                    <form onSubmit={handleSubmit} className="mt-6 space-y-8">
                        {/* Opsional Beralih ke Unggah Berkas */}
                        <div className="rounded-lg bg-blue-50/70 border border-blue-200 p-3 text-xs text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <span>Sudah mengisi & menandatangani formulir fisik kertas? Anda juga bisa langsung mengunggah scan/PDF nya.</span>
                            <button
                                type="button"
                                onClick={() => setEntryMode('upload')}
                                className="font-bold text-[#0B63CE] hover:underline shrink-0 text-left sm:text-right"
                            >
                                Beralih ke Unggah Berkas &rarr;
                            </button>
                        </div>
                    {/* BAGIAN I: DATA PENATARAN */}
                    <div className="rounded-xl border border-[#DCE7F3] bg-white p-6 shadow-xs">
                        <div className="mb-5 flex items-center gap-2 border-b border-[#DCE7F3] pb-3">
                            <Calendar className="h-5 w-5 text-[#0B63CE]" />
                            <h2 className="font-display text-base font-bold text-[#0E2747]">
                                I. Data Kegiatan Penataran
                            </h2>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <label className="block text-xs font-semibold text-[#112743]">
                                    Tingkat Penataran <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.penataran_level}
                                    onChange={(e) => setData('penataran_level', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-[#DCE7F3] bg-[#F8FBFF] px-3 py-2 text-xs font-medium text-[#112743] focus:border-[#0B63CE] focus:bg-white focus:outline-none"
                                >
                                    <option value="Daerah">Tingkat Daerah</option>
                                    <option value="Nasional">Tingkat Nasional</option>
                                </select>
                                {errors.penataran_level && <p className="mt-1 text-[11px] text-rose-500">{errors.penataran_level}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#112743]">
                                    Tanggal Mulai <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-[#DCE7F3] px-3 py-2 text-xs text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                                />
                                {errors.start_date && <p className="mt-1 text-[11px] text-rose-500">{errors.start_date}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#112743]">
                                    Tanggal Selesai <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-[#DCE7F3] px-3 py-2 text-xs text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                                />
                                {errors.end_date && <p className="mt-1 text-[11px] text-rose-500">{errors.end_date}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#112743]">
                                    Tempat Pelaksanaan <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                    placeholder="Contoh: Gedung Astoria, Kota Mojokerto"
                                    className="mt-1 block w-full rounded-md border border-[#DCE7F3] px-3 py-2 text-xs text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                                />
                                {errors.location && <p className="mt-1 text-[11px] text-rose-500">{errors.location}</p>}
                            </div>
                        </div>
                    </div>

                    {/* BAGIAN II: DATA PRIBADI PEMOHON */}
                    <div className="rounded-xl border border-[#DCE7F3] bg-white p-6 shadow-xs">
                        <div className="mb-5 flex items-center justify-between border-b border-[#DCE7F3] pb-3">
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-[#0B63CE]" />
                                <h2 className="font-display text-base font-bold text-[#0E2747]">
                                    II. Data Pribadi Pemohon (Kenshi)
                                </h2>
                            </div>
                            <span className="text-[11px] text-[#6B7C93]">
                                Terhubung dengan SIM PERKEMI
                            </span>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <label className="block text-xs font-semibold text-[#112743]">
                                    Nama Lengkap <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.full_name}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setData((prev) => ({
                                            ...prev,
                                            full_name: val,
                                            applicant_name: prev.applicant_name === prev.full_name || !prev.applicant_name ? val : prev.applicant_name,
                                        }));
                                        if (clientErrors.full_name) {
                                            setClientErrors((prev) => {
                                                const c = { ...prev };
                                                delete c.full_name;
                                                return c;
                                            });
                                        }
                                    }}
                                    className={`mt-1 block w-full rounded-md border ${allErrors.full_name ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-[#DCE7F3] focus:border-[#0B63CE]'} px-3 py-2 text-xs text-[#112743] focus:outline-none`}
                                    required
                                />
                                {allErrors.full_name && <p className="mt-1 text-[11px] text-rose-500 font-medium">{allErrors.full_name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#112743]">
                                    Nomor Induk Kenshi (NIK) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.kenshi_id_number}
                                    onChange={(e) => {
                                        setData('kenshi_id_number', e.target.value);
                                        if (clientErrors.kenshi_id_number) {
                                            setClientErrors((prev) => {
                                                const c = { ...prev };
                                                delete c.kenshi_id_number;
                                                return c;
                                            });
                                        }
                                    }}
                                    className={`mt-1 block w-full rounded-md border ${allErrors.kenshi_id_number ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-[#DCE7F3] focus:border-[#0B63CE]'} bg-[#F8FBFF] px-3 py-2 font-mono text-xs text-[#112743] focus:bg-white focus:outline-none`}
                                    required
                                />
                                {allErrors.kenshi_id_number && <p className="mt-1 text-[11px] text-rose-500 font-medium">{allErrors.kenshi_id_number}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#112743]">
                                    Tingkatan DAN <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.dan_level}
                                    onChange={(e) => {
                                        setData('dan_level', e.target.value);
                                        if (clientErrors.dan_level) {
                                            setClientErrors((prev) => {
                                                const c = { ...prev };
                                                delete c.dan_level;
                                                return c;
                                            });
                                        }
                                    }}
                                    placeholder="Contoh: 3 DAN"
                                    className={`mt-1 block w-full rounded-md border ${allErrors.dan_level ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-[#DCE7F3] focus:border-[#0B63CE]'} px-3 py-2 text-xs text-[#112743] focus:outline-none`}
                                    required
                                />
                                {allErrors.dan_level && <p className="mt-1 text-[11px] text-rose-500 font-medium">{allErrors.dan_level}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#112743]">
                                    Tempat Lahir <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.birth_place}
                                    onChange={(e) => {
                                        setData('birth_place', e.target.value);
                                        if (clientErrors.birth_place) {
                                            setClientErrors((prev) => {
                                                const c = { ...prev };
                                                delete c.birth_place;
                                                return c;
                                            });
                                        }
                                    }}
                                    placeholder="Kota Kelahiran"
                                    className={`mt-1 block w-full rounded-md border ${allErrors.birth_place ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-[#DCE7F3] focus:border-[#0B63CE]'} px-3 py-2 text-xs text-[#112743] focus:outline-none`}
                                    required
                                />
                                {allErrors.birth_place && <p className="mt-1 text-[11px] text-rose-500 font-medium">{allErrors.birth_place}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#112743]">
                                    Tanggal Lahir <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.birth_date}
                                    onChange={(e) => {
                                        setData('birth_date', e.target.value);
                                        if (clientErrors.birth_date) {
                                            setClientErrors((prev) => {
                                                const c = { ...prev };
                                                delete c.birth_date;
                                                return c;
                                            });
                                        }
                                    }}
                                    className={`mt-1 block w-full rounded-md border ${allErrors.birth_date ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-[#DCE7F3] focus:border-[#0B63CE]'} px-3 py-2 text-xs text-[#112743] focus:outline-none`}
                                    required
                                />
                                {allErrors.birth_date && <p className="mt-1 text-[11px] text-rose-500 font-medium">{allErrors.birth_date}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#112743]">
                                    Nomor Telepon / WhatsApp <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={data.phone_number}
                                    onChange={(e) => {
                                        setData('phone_number', e.target.value);
                                        if (clientErrors.phone_number) {
                                            setClientErrors((prev) => {
                                                const c = { ...prev };
                                                delete c.phone_number;
                                                return c;
                                            });
                                        }
                                    }}
                                    placeholder="081234567890"
                                    className={`mt-1 block w-full rounded-md border ${allErrors.phone_number ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-[#DCE7F3] focus:border-[#0B63CE]'} px-3 py-2 text-xs text-[#112743] focus:outline-none`}
                                    required
                                />
                                {allErrors.phone_number && <p className="mt-1 text-[11px] text-rose-500 font-medium">{allErrors.phone_number}</p>}
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-[#112743]">
                                    Alamat Rumah <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows="2"
                                    value={data.home_address}
                                    onChange={(e) => {
                                        setData('home_address', e.target.value);
                                        if (clientErrors.home_address) {
                                            setClientErrors((prev) => {
                                                const c = { ...prev };
                                                delete c.home_address;
                                                return c;
                                            });
                                        }
                                    }}
                                    placeholder="Alamat lengkap tempat tinggal pemohon"
                                    className={`mt-1 block w-full rounded-md border ${allErrors.home_address ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-[#DCE7F3] focus:border-[#0B63CE]'} px-3 py-2 text-xs text-[#112743] focus:outline-none`}
                                    required
                                />
                                {allErrors.home_address && <p className="mt-1 text-[11px] text-rose-500 font-medium">{allErrors.home_address}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#112743]">
                                    Email Pemohon
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="nama@email.com"
                                    className="mt-1 block w-full rounded-md border border-[#DCE7F3] px-3 py-2 text-xs text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                                />
                                {errors.email && <p className="mt-1 text-[11px] text-rose-500">{errors.email}</p>}
                            </div>
                        </div>
                    </div>

                    {/* BAGIAN III: PEKERJAAN & DARURAT */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        {/* Pekerjaan / Sekolah */}
                        <div className="rounded-xl border border-[#DCE7F3] bg-white p-6 shadow-xs">
                            <div className="mb-4 flex items-center gap-2 border-b border-[#DCE7F3] pb-3">
                                <Briefcase className="h-5 w-5 text-[#0B63CE]" />
                                <h2 className="font-display text-base font-bold text-[#0E2747]">
                                    III. Pekerjaan / Sekolah
                                </h2>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-[#112743]">
                                        Instansi / Perusahaan / Sekolah
                                    </label>
                                    <input
                                        type="text"
                                        value={data.occupation}
                                        onChange={(e) => setData('occupation', e.target.value)}
                                        placeholder="Nama Pekerjaan atau Sekolah"
                                        className="mt-1 block w-full rounded-md border border-[#DCE7F3] px-3 py-2 text-xs text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                                    />
                                    {errors.occupation && <p className="mt-1 text-[11px] text-rose-500">{errors.occupation}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[#112743]">
                                        Alamat Pekerjaan / Sekolah
                                    </label>
                                    <textarea
                                        rows="2"
                                        value={data.occupation_address}
                                        onChange={(e) => setData('occupation_address', e.target.value)}
                                        placeholder="Alamat kantor atau kampus/sekolah"
                                        className="mt-1 block w-full rounded-md border border-[#DCE7F3] px-3 py-2 text-xs text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[#112743]">
                                        Telepon Pekerjaan / Sekolah
                                    </label>
                                    <input
                                        type="tel"
                                        value={data.occupation_phone}
                                        onChange={(e) => setData('occupation_phone', e.target.value)}
                                        placeholder="Nomor telepon instansi / kantor"
                                        className="mt-1 block w-full rounded-md border border-[#DCE7F3] px-3 py-2 text-xs text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Kontak Darurat */}
                        <div className="rounded-xl border border-[#DCE7F3] bg-white p-6 shadow-xs">
                            <div className="mb-4 flex items-center gap-2 border-b border-[#DCE7F3] pb-3">
                                <Phone className="h-5 w-5 text-[#0B63CE]" />
                                <h2 className="font-display text-base font-bold text-[#0E2747]">
                                    IV. Kontak & Alamat Darurat
                                </h2>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-[#112743]">
                                        Nomor Telepon Darurat <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={data.emergency_phone}
                                        onChange={(e) => {
                                            setData('emergency_phone', e.target.value);
                                            if (clientErrors.emergency_phone) {
                                                setClientErrors((prev) => {
                                                    const c = { ...prev };
                                                    delete c.emergency_phone;
                                                    return c;
                                                });
                                            }
                                        }}
                                        placeholder="Nomor kontak keluarga/kerabat terdekat"
                                        className={`mt-1 block w-full rounded-md border ${allErrors.emergency_phone ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-[#DCE7F3] focus:border-[#0B63CE]'} px-3 py-2 text-xs text-[#112743] focus:outline-none`}
                                        required
                                    />
                                    {allErrors.emergency_phone && <p className="mt-1 text-[11px] text-rose-500 font-medium">{allErrors.emergency_phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[#112743]">
                                        Alamat Kontak Darurat
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={data.emergency_address}
                                        onChange={(e) => setData('emergency_address', e.target.value)}
                                        placeholder="Alamat tempat tinggal kontak darurat"
                                        className="mt-1 block w-full rounded-md border border-[#DCE7F3] px-3 py-2 text-xs text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BAGIAN V: RIWAYAT PIAGAM GASNAS / GASNASWIL / GASPROV */}
                    <div className="rounded-xl border border-[#DCE7F3] bg-white p-6 shadow-xs">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#DCE7F3] pb-3">
                            <div className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-[#0B63CE]" />
                                <div>
                                    <h2 className="font-display text-base font-bold text-[#0E2747]">
                                        V. Riwayat Piagam Gasnas / Gasnaswil / Gasprov
                                    </h2>
                                    <p className="text-[11px] text-[#6B7C93]">
                                        Riwayat kepesertaan Gashuku Nasional / Wilayah / Provinsi yang pernah diikuti (opsional).
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={addGasnasRow}
                                className="inline-flex items-center gap-1 rounded-md bg-[#EAF5FF] px-2.5 py-1.5 text-xs font-semibold text-[#0B63CE] hover:bg-[#D5EBFF] transition-colors"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Tambah Baris
                            </button>
                        </div>

                        {(!data.gasnas_records || data.gasnas_records.length === 0) ? (
                            <div className="rounded-xl border border-dashed border-[#DCE7F3] bg-[#F8FBFF] p-6 text-center">
                                <Award className="mx-auto h-8 w-8 text-[#0B63CE]/40 mb-2" />
                                <p className="text-xs font-medium text-[#112743]">
                                    Belum ada riwayat piagam Gasnas / Gasnaswil / Gasprov yang dicatat.
                                </p>
                                <p className="mt-1 text-[11px] text-[#6B7C93]">
                                    Bagian ini bersifat opsional. Klik tombol di bawah jika Anda memiliki piagam sebelumnya.
                                </p>
                                <button
                                    type="button"
                                    onClick={addGasnasRow}
                                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white border border-[#DCE7F3] px-3.5 py-1.5 text-xs font-semibold text-[#0B63CE] shadow-2xs hover:bg-[#EAF5FF] hover:border-[#0B63CE]/40 transition-colors"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Tambah Baris Piagam
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {data.gasnas_records.map((item, index) => (
                                    <div key={index} className="rounded-xl border border-[#DCE7F3] bg-[#F8FBFF] p-4 sm:p-5 shadow-2xs transition-all hover:border-[#0B63CE]/30">
                                        <div className="flex items-center justify-between border-b border-[#DCE7F3] pb-3 mb-3.5">
                                            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#0B63CE]/10 px-2.5 py-1 font-mono text-xs font-bold text-[#0B63CE]">
                                                <Award className="h-3.5 w-3.5" />
                                                Piagam #{index + 1}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeGasnasRow(index)}
                                                className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Hapus Baris
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                            <div className="md:col-span-8">
                                                <label className="block text-xs font-semibold text-[#112743] mb-1">
                                                    Nomor Piagam Gasnas / Gasnaswil / Gasprov
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.nomor}
                                                    onChange={(e) => updateGasnasRow(index, 'nomor', e.target.value)}
                                                    placeholder="Contoh: GASNAS/PB/2023/102"
                                                    className="block w-full rounded-lg border border-[#DCE7F3] bg-white px-3.5 py-2 text-xs text-[#112743] placeholder-[#94A3B8] shadow-2xs focus:border-[#0B63CE] focus:outline-none"
                                                />
                                            </div>
                                            <div className="md:col-span-4">
                                                <label className="block text-xs font-semibold text-[#112743] mb-1">
                                                    Tanggal Piagam
                                                </label>
                                                <input
                                                    type="date"
                                                    value={item.tanggal}
                                                    onChange={(e) => updateGasnasRow(index, 'tanggal', e.target.value)}
                                                    className="block w-full rounded-lg border border-[#DCE7F3] bg-white px-3.5 py-2 text-xs text-[#112743] shadow-2xs focus:border-[#0B63CE] focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* BAGIAN VI: SERTIFIKAT YANG DIMILIKI */}
                    <div className="rounded-xl border border-[#DCE7F3] bg-white p-6 shadow-xs">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#DCE7F3] pb-3">
                            <div className="flex items-center gap-2">
                                <FileCheck className="h-5 w-5 text-[#0B63CE]" />
                                <div>
                                    <h2 className="font-display text-base font-bold text-[#0E2747]">
                                        VI. Sertifikat Pelatih / Penguji / Wasit yang Dimiliki
                                    </h2>
                                    <p className="text-[11px] text-[#6B7C93]">
                                        {data.penataran_level === 'Nasional'
                                            ? 'Wajib bagi penataran tingkat Nasional: Sertifikat Pelatih Daerah, Penguji Daerah, atau Wasit Daerah yang telah dimiliki.'
                                            : 'Sertifikat kepelatihan, pengujian, atau perwasitan yang sudah pernah didapatkan sebelumnya (jika ada).'}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={addCertificateRow}
                                className="inline-flex items-center gap-1 rounded-md bg-[#EAF5FF] px-2.5 py-1.5 text-xs font-semibold text-[#0B63CE] hover:bg-[#D5EBFF] transition-colors"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Tambah Sertifikat
                            </button>
                        </div>

                        {(!data.certificate_records || data.certificate_records.length === 0) ? (
                            <div className="rounded-xl border border-dashed border-[#DCE7F3] bg-[#F8FBFF] p-6 text-center">
                                <FileCheck className="mx-auto h-8 w-8 text-[#0B63CE]/40 mb-2" />
                                <p className="text-xs font-medium text-[#112743]">
                                    Belum ada sertifikat kepelatihan, penguji, atau wasit yang dicatat.
                                </p>
                                <p className="mt-1 text-[11px] text-[#6B7C93]">
                                    {data.penataran_level === 'Nasional'
                                        ? 'Untuk penataran tingkat Nasional, Anda disarankan melampirkan sertifikat Pelatih Daerah / Penguji Daerah / Wasit Daerah.'
                                        : 'Bagian ini bersifat opsional jika Anda sudah memiliki sertifikat sebelumnya.'}
                                </p>
                                <button
                                    type="button"
                                    onClick={addCertificateRow}
                                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white border border-[#DCE7F3] px-3.5 py-1.5 text-xs font-semibold text-[#0B63CE] shadow-2xs hover:bg-[#EAF5FF] hover:border-[#0B63CE]/40 transition-colors"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Tambah Sertifikat
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {data.certificate_records.map((item, index) => (
                                    <div key={index} className="rounded-xl border border-[#DCE7F3] bg-[#F8FBFF] p-4 sm:p-5 shadow-2xs transition-all hover:border-[#0B63CE]/30">
                                        <div className="flex items-center justify-between border-b border-[#DCE7F3] pb-3 mb-3.5">
                                            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#0B63CE]/10 px-2.5 py-1 font-mono text-xs font-bold text-[#0B63CE]">
                                                <FileCheck className="h-3.5 w-3.5" />
                                                Sertifikat #{index + 1}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeCertificateRow(index)}
                                                className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Hapus Sertifikat
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                            <div className="md:col-span-5">
                                                <label className="block text-xs font-semibold text-[#112743] mb-1">
                                                    Jenis Sertifikat
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.jenis}
                                                    onChange={(e) => updateCertificateRow(index, 'jenis', e.target.value)}
                                                    placeholder="Contoh: Pelatih Daerah Jawa Timur"
                                                    className="block w-full rounded-lg border border-[#DCE7F3] bg-white px-3.5 py-2 text-xs text-[#112743] placeholder-[#94A3B8] shadow-2xs focus:border-[#0B63CE] focus:outline-none"
                                                />
                                            </div>
                                            <div className="md:col-span-4">
                                                <label className="block text-xs font-semibold text-[#112743] mb-1">
                                                    Nomor Sertifikat
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.nomor}
                                                    onChange={(e) => updateCertificateRow(index, 'nomor', e.target.value)}
                                                    placeholder="Contoh: 112/SK/PENGPROV/2024"
                                                    className="block w-full rounded-lg border border-[#DCE7F3] bg-white px-3.5 py-2 text-xs text-[#112743] placeholder-[#94A3B8] shadow-2xs focus:border-[#0B63CE] focus:outline-none"
                                                />
                                            </div>
                                            <div className="md:col-span-3">
                                                <label className="block text-xs font-semibold text-[#112743] mb-1">
                                                    Tanggal Sertifikat
                                                </label>
                                                <input
                                                    type="date"
                                                    value={item.tanggal}
                                                    onChange={(e) => updateCertificateRow(index, 'tanggal', e.target.value)}
                                                    className="block w-full rounded-lg border border-[#DCE7F3] bg-white px-3.5 py-2 text-xs text-[#112743] shadow-2xs focus:border-[#0B63CE] focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* BAGIAN VII: SURAT PERNYATAAN DAN PEMBEBASAN (WAIVER) */}
                    <div className="rounded-xl border border-[#DCE7F3] bg-white p-6 shadow-xs">
                        <div className="mb-4 flex items-center gap-2 border-b border-[#DCE7F3] pb-3">
                            <Shield className="h-5 w-5 text-[#0B63CE]" />
                            <h2 className="font-display text-base font-bold text-[#0E2747]">
                                VII. Surat Pernyataan dan Pembebasan
                            </h2>
                        </div>

                        <div className="rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] p-4 text-xs leading-relaxed text-[#112743] space-y-3">
                            <p className="font-semibold text-[#0E2747]">
                                Dengan ini saya menyatakan bahwa:
                            </p>
                            <ol className="list-decimal pl-5 space-y-1.5">
                                <li>
                                    Saya dalam keadaan sehat jasmani dan rohani serta telah memperoleh surat keterangan kesehatan resmi dari dokter yang berwenang.
                                </li>
                                <li>
                                    Saya bersedia mematuhi segala ketentuan, peraturan, dan tata tertib yang berlaku selama mengikuti kegiatan penataran Shorinji Kempo.
                                </li>
                                <li>
                                    Saya menyadari sepenuhnya bahwa olahraga Shorinji Kempo mengandung risiko fisik. Oleh karena itu, saya membebaskan panitia pelaksana, pengurus PERKEMI, serta para instruktur dari segala tuntutan hukum yang timbul akibat kecelakaan atau cedera selama pelaksanaan kegiatan ini.
                                </li>
                                <li>
                                    Seluruh data dan dokumen yang saya berikan adalah benar dan sah. Apabila di kemudian hari terbukti tidak benar, saya bersedia menerima sanksi sesuai ketentuan PB PERKEMI.
                                </li>
                            </ol>

                            <div className={`mt-3 p-3 rounded-lg border transition-all ${allErrors.waiver_agreed ? 'border-rose-400 bg-rose-50/50' : 'border-transparent'}`}>
                                <label className="flex items-start gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.waiver_agreed}
                                        onChange={(e) => {
                                            setData('waiver_agreed', e.target.checked);
                                            if (e.target.checked && clientErrors.waiver_agreed) {
                                                setClientErrors((prev) => {
                                                    const c = { ...prev };
                                                    delete c.waiver_agreed;
                                                    return c;
                                                });
                                            }
                                        }}
                                        className="mt-0.5 h-4 w-4 rounded border-[#DCE7F3] text-[#0B63CE] focus:ring-[#0B63CE]"
                                    />
                                    <span className="text-xs font-semibold text-[#0E2747]">
                                        Saya telah membaca, memahami, dan menyetujui seluruh ketentuan Surat Pernyataan dan Pembebasan di atas. <span className="text-rose-500">*</span>
                                    </span>
                                </label>
                                {allErrors.waiver_agreed && <p className="mt-1 text-xs text-rose-600 font-medium pl-6">{allErrors.waiver_agreed}</p>}
                            </div>
                        </div>
                    </div>

                    {/* BAGIAN VIII: PENANDATANGANAN & TANDA TANGAN DIGITAL */}
                    <div className="rounded-xl border border-[#DCE7F3] bg-white p-6 shadow-xs">
                        <div className="mb-5 flex items-center gap-2 border-b border-[#DCE7F3] pb-3">
                            <PenTool className="h-5 w-5 text-[#0B63CE]" />
                            <h2 className="font-display text-base font-bold text-[#0E2747]">
                                VIII. Tempat, Tanggal & Tanda Tangan Pemohon
                            </h2>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-[#112743]">
                                        Tempat Penandatanganan <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.sign_place}
                                        onChange={(e) => {
                                            setData('sign_place', e.target.value);
                                            if (clientErrors.sign_place) {
                                                setClientErrors((prev) => {
                                                    const c = { ...prev };
                                                    delete c.sign_place;
                                                    return c;
                                                });
                                            }
                                        }}
                                        placeholder="Kota Penandatanganan (misal: Mojokerto)"
                                        className={`mt-1 block w-full rounded-md border ${allErrors.sign_place ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-[#DCE7F3] focus:border-[#0B63CE]'} px-3 py-2 text-xs text-[#112743] focus:outline-none`}
                                        required
                                    />
                                    {allErrors.sign_place && <p className="mt-1 text-[11px] text-rose-500 font-medium">{allErrors.sign_place}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[#112743]">
                                        Tanggal Penandatanganan <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={data.sign_date}
                                        onChange={(e) => {
                                            setData('sign_date', e.target.value);
                                            if (clientErrors.sign_date) {
                                                setClientErrors((prev) => {
                                                    const c = { ...prev };
                                                    delete c.sign_date;
                                                    return c;
                                                });
                                            }
                                        }}
                                        className={`mt-1 block w-full rounded-md border ${allErrors.sign_date ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-[#DCE7F3] focus:border-[#0B63CE]'} px-3 py-2 text-xs text-[#112743] focus:outline-none`}
                                        required
                                    />
                                    {allErrors.sign_date && <p className="mt-1 text-[11px] text-rose-500 font-medium">{allErrors.sign_date}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[#112743]">
                                        Nama Lengkap Pemohon <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.applicant_name}
                                        onChange={(e) => {
                                            setData('applicant_name', e.target.value);
                                            if (clientErrors.applicant_name) {
                                                setClientErrors((prev) => {
                                                    const c = { ...prev };
                                                    delete c.applicant_name;
                                                    return c;
                                                });
                                            }
                                        }}
                                        className={`mt-1 block w-full rounded-md border ${allErrors.applicant_name ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-[#DCE7F3] focus:border-[#0B63CE]'} px-3 py-2 text-xs text-[#112743] focus:outline-none`}
                                        required
                                    />
                                    {allErrors.applicant_name && <p className="mt-1 text-[11px] text-rose-500 font-medium">{allErrors.applicant_name}</p>}
                                </div>
                            </div>

                            {/* Canvas Drawing Signature Pad */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-semibold text-[#112743]">
                                        Goreskan Tanda Tangan Pemohon <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={generateAutoSignature}
                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0B63CE] hover:text-[#0A3F82] bg-[#EAF5FF] px-2 py-0.5 rounded"
                                            title="Buat tanda tangan otomatis berdasarkan nama"
                                        >
                                            <PenTool className="h-3 w-3" />
                                            Tanda Tangan Otomatis
                                        </button>
                                        <button
                                            type="button"
                                            onClick={clearSignature}
                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800"
                                        >
                                            <RotateCcw className="h-3 w-3" />
                                            Bersihkan Pad
                                        </button>
                                    </div>
                                </div>

                                {/* Existing Signature Preview if available */}
                                {data.signature_data && !hasNewSignature && (
                                    <div className="mb-2 rounded-lg border border-dashed border-[#DCE7F3] bg-[#F8FBFF] p-2 text-center">
                                        <p className="text-[10px] text-[#6B7C93] mb-1">Tanda tangan tersimpan:</p>
                                        <img
                                            src={data.signature_data}
                                            alt="Tanda Tangan Pemohon"
                                            className="mx-auto max-h-16 object-contain"
                                        />
                                        <p className="mt-1 text-[10px] text-[#0B63CE]">
                                            Gunakan canvas di bawah jika ingin memperbarui tanda tangan.
                                        </p>
                                    </div>
                                )}

                                <div className="relative touch-none rounded-lg border-2 border-dashed border-[#DCE7F3] bg-white p-1 hover:border-[#0B63CE] transition-colors">
                                    <canvas
                                        ref={canvasRef}
                                        width={480}
                                        height={180}
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                        onTouchStart={startDrawing}
                                        onTouchMove={draw}
                                        onTouchEnd={stopDrawing}
                                        className="w-full h-36 bg-white cursor-crosshair rounded"
                                    />
                                    <div className="pointer-events-none absolute bottom-2 right-2 text-[10px] text-[#6B7C93] opacity-60">
                                        Gambar tanda tangan di sini
                                    </div>
                                </div>
                                {errors.signature_data && <p className="mt-1 text-[11px] text-rose-500">{errors.signature_data}</p>}
                            </div>
                        </div>
                    </div>

                    {/* SUBMIT BUTTON CONTAINER */}
                    <div className="flex flex-wrap items-center justify-end gap-3 rounded-xl border border-[#DCE7F3] bg-white p-4 shadow-xs">
                        <Link
                            href={participant?.is_admin_mode ? `/admin/event/${event.id}?tab=formulir` : `/event/${event.slug}/ruang-belajar`}
                            className="rounded-lg border border-[#DCE7F3] bg-white px-5 py-2.5 text-xs font-semibold text-[#112743] hover:bg-[#F8FBFF]"
                        >
                            Batal
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0B63CE] px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#0A3F82] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            {processing ? 'Menyimpan Formulir...' : 'Simpan & Kirim Formulir Penataran'}
                        </button>
                    </div>
                </form>
            )}
            </div>
        </PortalLayout>
    );
}
