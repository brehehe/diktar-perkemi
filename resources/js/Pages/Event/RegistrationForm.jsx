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

import { RegistrationFormContext } from './Partials/RegistrationFormContext';
import RegistrationUploadPanel from './Partials/RegistrationUploadPanel';
import RegistrationEventSection from './Partials/RegistrationEventSection';
import RegistrationIdentitySection from './Partials/RegistrationIdentitySection';
import RegistrationContactSection from './Partials/RegistrationContactSection';
import RegistrationAwardsSection from './Partials/RegistrationAwardsSection';
import RegistrationCertificatesSection from './Partials/RegistrationCertificatesSection';
import RegistrationWaiverSection from './Partials/RegistrationWaiverSection';
import RegistrationSignatureSection from './Partials/RegistrationSignatureSection';

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

    const registrationContext = {
        event,
        participant,
        initialData,
        form,
        data,
        setData,
        errors,
        clientErrors,
        setClientErrors,
        canvasRef,
        hasNewSignature,
        startDrawing,
        draw,
        stopDrawing,
        clearSignature,
        generateAutoSignature,
        addGasnasRow,
        removeGasnasRow,
        updateGasnasRow,
        addCertificateRow,
        removeCertificateRow,
        updateCertificateRow,
        allErrors,
        hasUploadedFile,
        uploadFile,
        setUploadFile,
        uploadPenataranLevel,
        setUploadPenataranLevel,
        uploadFormType,
        setUploadFormType,
        uploadNotes,
        setUploadNotes,
        uploadAgreed,
        setUploadAgreed,
        isUploadingFile,
        uploadError,
        setUploadError,
        handleUploadSubmit,
    };

    return (
        <RegistrationFormContext.Provider value={registrationContext}>
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
                    <RegistrationUploadPanel />
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
                    <RegistrationEventSection />

                    <RegistrationIdentitySection />

                    <RegistrationContactSection />

                    <RegistrationAwardsSection />

                    <RegistrationCertificatesSection />

                    <RegistrationWaiverSection />

                    <RegistrationSignatureSection />

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
        </RegistrationFormContext.Provider>
    );
}
