import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import QrScanner from 'qr-scanner';
import {
    Camera,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    Key,
    Shield,
    RefreshCw,
} from 'lucide-react';
import Button from '../../Components/ui/Button';
import Input from '../../Components/ui/Input';

function normalizeAttendanceCode(value) {
    return value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 10);
}

export function parseAttendanceQrValue(rawValue, eventSlug) {
    const value = rawValue?.trim();

    if (!value) {
        return null;
    }

    if (/^[A-Za-z0-9]{40}$/.test(value)) {
        return { token: value, shortCode: '' };
    }

    if (/^[A-Za-z0-9]{6,10}$/.test(value)) {
        return { token: '', shortCode: value.toUpperCase() };
    }

    try {
        const scannedUrl = new URL(value, window.location.origin);
        const expectedPath = `/event/${eventSlug}/scan`;

        if (scannedUrl.pathname.replace(/\/$/, '') !== expectedPath) {
            return null;
        }

        const token = scannedUrl.searchParams.get('token')?.trim();
        if (token && /^[A-Za-z0-9]{40}$/.test(token)) {
            return { token, shortCode: '' };
        }

        const shortCode = scannedUrl.searchParams.get('code')?.trim();
        if (shortCode && /^[A-Za-z0-9]{6,10}$/.test(shortCode)) {
            return { token: '', shortCode: shortCode.toUpperCase() };
        }
    } catch {
        return null;
    }

    return null;
}

export default function Scan({ event, participant, prefilledToken, prefilledCode, matchedSession }) {
    const { flash } = usePage().props;
    const [mode, setMode] = useState(prefilledToken || prefilledCode ? 'code' : 'camera');
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [scanNotice, setScanNotice] = useState(prefilledToken || prefilledCode ? 'QR absensi dikenali. Konfirmasi kehadiran Anda.' : null);
    const [scanWarning, setScanWarning] = useState(null);
    const [manualCode, setManualCode] = useState(() => normalizeAttendanceCode(prefilledCode || ''));
    const [imageProcessing, setImageProcessing] = useState(false);
    const videoRef = useRef(null);
    const scannerRef = useRef(null);
    const cameraSessionRef = useRef(0);
    const shortCodeInputRef = useRef(null);
    const imageInputRef = useRef(null);

    const form = useForm({
        token: prefilledToken || '',
        short_code: prefilledCode || '',
        attendance_type: 'check_in',
    });

    const stopCamera = () => {
        cameraSessionRef.current += 1;
        scannerRef.current?.destroy();
        scannerRef.current = null;
        if (videoRef.current) {
            const stream = videoRef.current.srcObject;
            if (stream instanceof MediaStream) {
                stream.getTracks().forEach((track) => track.stop());
            }
            videoRef.current.srcObject = null;
        }
        setCameraActive(false);
    };

    const acceptDecodedValue = (rawValue) => {
        const attendanceValue = parseAttendanceQrValue(rawValue, event.slug);

        if (!attendanceValue) {
            return false;
        }

        scannerRef.current?.stop();
        setCameraActive(false);
        setManualCode(attendanceValue.shortCode);
        form.setData((currentData) => ({
            ...currentData,
            token: attendanceValue.token,
            short_code: attendanceValue.shortCode,
        }));
        setCameraError(null);
        setScanWarning(null);
        setScanNotice('QR berhasil dibaca. Periksa jenis absensi lalu konfirmasi kehadiran.');
        navigator.vibrate?.(120);
        setMode('code');

        return true;
    };

    const cameraErrorMessage = (error) => {
        const errorName = error?.name || '';

        if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
            return 'Izin kamera ditolak. Aktifkan izin kamera untuk situs ini, lalu pilih Coba Lagi.';
        }
        if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
            return 'Kamera tidak ditemukan pada perangkat ini. Gunakan foto QR atau kode sesi.';
        }
        if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
            return 'Kamera sedang digunakan aplikasi lain. Tutup aplikasi kamera lain, lalu coba lagi.';
        }
        if (!window.isSecureContext) {
            return 'Kamera hanya dapat digunakan melalui koneksi HTTPS yang aman.';
        }

        return 'Kamera belum dapat dimulai. Coba lagi, pilih foto QR, atau gunakan kode sesi.';
    };

    const startCamera = async () => {
        const cameraSession = ++cameraSessionRef.current;
        scannerRef.current?.destroy();
        scannerRef.current = null;
        setCameraError(null);
        setScanWarning(null);
        setScanNotice(null);
        setCameraActive(false);

        if (!navigator.mediaDevices?.getUserMedia || !videoRef.current) {
            setCameraError('Kamera tidak didukung pada peramban ini. Gunakan foto QR atau kode sesi.');
            return;
        }

        try {
            const scanner = new QrScanner(
                videoRef.current,
                (result) => {
                    if (cameraSession !== cameraSessionRef.current) {
                        return;
                    }

                    if (!acceptDecodedValue(result.data)) {
                        setScanWarning('QR terbaca, tetapi bukan QR absensi untuk event ini. Arahkan kamera ke QR dari panitia.');
                    }
                },
                {
                    preferredCamera: 'environment',
                    maxScansPerSecond: 10,
                    returnDetailedScanResult: true,
                    onDecodeError: () => {},
                },
            );
            scanner.setInversionMode('both');
            scannerRef.current = scanner;

            await scanner.start();
            if (cameraSession !== cameraSessionRef.current) {
                scanner.destroy();
                return;
            }

            setCameraActive(true);
        } catch (error) {
            if (cameraSession !== cameraSessionRef.current) {
                return;
            }

            scannerRef.current?.destroy();
            scannerRef.current = null;
            setCameraError(cameraErrorMessage(error));
            setCameraActive(false);
        }
    };

    const handleQrImage = async (event) => {
        const file = event.currentTarget.files?.[0];
        event.currentTarget.value = '';

        if (!file) {
            return;
        }

        setImageProcessing(true);
        setCameraError(null);
        try {
            const result = await QrScanner.scanImage(file, {
                returnDetailedScanResult: true,
                alsoTryWithoutScanRegion: true,
            });

            if (!acceptDecodedValue(result.data)) {
                setCameraError('Gambar berisi QR, tetapi bukan QR absensi untuk event ini.');
            }
        } catch {
            setCameraError('QR pada gambar tidak terbaca. Pilih gambar yang lebih tajam atau gunakan kode sesi.');
        } finally {
            setImageProcessing(false);
        }
    };

    useEffect(() => {
        if (mode === 'camera' && !prefilledToken) {
            startCamera();
        } else {
            stopCamera();
        }

        return () => {
            stopCamera();
        };
    }, [mode]);

    const handleSubmitAttendance = (e) => {
        e.preventDefault();
        form.transform((currentData) => ({
            ...currentData,
            short_code: currentData.token ? '' : normalizeAttendanceCode(manualCode),
        }));
        form.post(`/event/${event.slug}/absensi/catat`, {
            onSuccess: () => {
                stopCamera();
            },
        });
    };

    return (
        <div className="min-h-screen bg-[#F8FBFF] text-[#112743] flex flex-col justify-between">
            <Head title={`Scan Absensi — ${event.name}`} />

            {/* Header Sticky */}
            <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#DCE7F3] px-4 py-3">
                <div className="max-w-lg mx-auto flex items-center justify-between">
                    <Link
                        href={`/event/${event.slug}/ruang-belajar`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B63CE] hover:text-[#0A3F82]"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Ruang Belajar</span>
                    </Link>

                    <div className="text-right">
                        <span className="text-[10px] font-mono text-[#6B7C93] block">Peserta</span>
                        <span className="text-xs font-bold text-[#0E2747] truncate max-w-[150px] inline-block">
                            {participant.name}
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-lg w-full mx-auto p-4 sm:p-6 space-y-6">
                {/* Title & Mode Switcher */}
                <div className="text-center space-y-1">
                    <h1 className="font-display font-bold text-xl text-[#0E2747]">
                        {matchedSession?.session_type_code === 'KEHADIRAN_AWAL' ? 'Kehadiran Awal Event' : matchedSession?.session_type_code === 'KEHADIRAN_HARIAN' ? 'Kehadiran Harian' : 'Pencatatan Kehadiran Sesi'}
                    </h1>
                    <p className="text-xs text-[#6B7C93]">
                        {event.name}
                    </p>
                </div>

                {(flash?.error || flash?.info || cameraError || scanWarning || scanNotice) && (
                    <p
                        role="status"
                        aria-live="polite"
                        className={`border p-3 text-sm ${scanNotice ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : scanWarning ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-[#DCE7F3] bg-white text-[#112743]'}`}
                    >
                        {flash?.error || flash?.info || cameraError || scanWarning || scanNotice}
                    </p>
                )}

                {/* Mode Tabs */}
                <div className="grid grid-cols-2 gap-2 bg-[#EAF5FF] p-1.5 rounded-xl border border-[#DCE7F3]">
                    <button
                        type="button"
                        onClick={() => setMode('camera')}
                        className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] ${
                            mode === 'camera'
                                ? 'bg-white text-[#0B63CE] shadow-xs'
                                : 'text-[#6B7C93] hover:text-[#0E2747]'
                        }`}
                    >
                        <Camera className="w-4 h-4" />
                        <span>Scan Kamera</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setMode('code')}
                        className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] ${
                            mode === 'code'
                                ? 'bg-white text-[#0B63CE] shadow-xs'
                                : 'text-[#6B7C93] hover:text-[#0E2747]'
                        }`}
                    >
                        <Key className="w-4 h-4" />
                        <span>Kode Sesi Manual</span>
                    </button>
                </div>

                {/* Attendance Type Selector (Check-in vs Check-out) */}
                <div className="bg-white p-3 rounded-xl border border-[#DCE7F3] shadow-xs flex items-center justify-between">
                    <span className="text-xs font-medium text-[#6B7C93]">Jenis Absensi:</span>
                    <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                            <input
                                type="radio"
                                name="attendance_type"
                                value="check_in"
                                checked={form.data.attendance_type === 'check_in'}
                                onChange={(e) => form.setData('attendance_type', e.target.value)}
                                className="text-[#0B63CE] focus:ring-[#0B63CE]"
                            />
                            <span>Absensi Masuk</span>
                        </label>
                        {matchedSession?.attendance_setting !== 'check_in' && <label className="inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer ml-3">
                            <input
                                type="radio"
                                name="attendance_type"
                                value="check_out"
                                checked={form.data.attendance_type === 'check_out'}
                                onChange={(e) => form.setData('attendance_type', e.target.value)}
                                className="text-[#0B63CE] focus:ring-[#0B63CE]"
                            />
                            <span>Absensi Keluar</span>
                        </label>}
                    </div>
                </div>

                {/* Matched Session Preview (if prefilled from QR link) */}
                {matchedSession && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5 animate-fadeIn">
                        <div className="flex items-center gap-2 font-bold text-emerald-800">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Sesi Dikenali: {matchedSession.topic}</span>
                        </div>
                        <div className="text-emerald-700 flex flex-wrap gap-x-3 gap-y-1">
                            <span>Waktu: <strong>{matchedSession.time_slot}</strong></span>
                            <span>Ruang: <strong>{matchedSession.room || 'Utama'}</strong></span>
                        </div>
                    </div>
                )}

                {/* Camera Scanner Mode */}
                {mode === 'camera' && !prefilledToken && (
                    <div className="bg-white rounded-2xl border border-[#DCE7F3] p-4 shadow-sm space-y-4">
                        <div className="relative aspect-square max-w-[320px] mx-auto bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center">
                            <video
                                ref={videoRef}
                                className="w-full h-full object-cover"
                                autoPlay
                                playsInline
                                muted
                            />

                            {!cameraActive && !cameraError && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950 text-white">
                                    <RefreshCw className="h-7 w-7 animate-spin text-[#EAF5FF] motion-reduce:animate-none" aria-hidden="true" />
                                    <span className="text-xs font-semibold">Menyiapkan kamera…</span>
                                </div>
                            )}

                            {/* Viewfinder Overlay */}
                            <div className="absolute inset-0 border-2 border-dashed border-[#0B63CE]/70 m-8 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                                <div className="flex justify-between">
                                    <div className="w-4 h-4 border-t-2 border-l-2 border-[#0B63CE]" />
                                    <div className="w-4 h-4 border-t-2 border-r-2 border-[#0B63CE]" />
                                </div>
                                <div className="text-center font-mono text-[10px] text-white/80 bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
                                    Arahkan QR Code ke area ini
                                </div>
                                <div className="flex justify-between">
                                    <div className="w-4 h-4 border-b-2 border-l-2 border-[#0B63CE]" />
                                    <div className="w-4 h-4 border-b-2 border-r-2 border-[#0B63CE]" />
                                </div>
                            </div>

                            {cameraError && (
                                <div className="absolute inset-0 bg-slate-900/90 text-white p-6 flex flex-col items-center justify-center text-center space-y-3">
                                    <AlertCircle className="w-8 h-8 text-rose-400" />
                                    <p className="text-xs">{cameraError}</p>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="primary"
                                            onClick={startCamera}
                                        >
                                            Coba Lagi
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => setMode('code')}
                                        >
                                            Gunakan Kode
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            aria-label="Pilih gambar QR absensi"
                            onChange={handleQrImage}
                        />

                        <div className="flex flex-col gap-3 border-t border-[#DCE7F3] pt-3 text-xs text-[#6B7C93] sm:flex-row sm:items-center sm:justify-between">
                            <span>{cameraActive ? 'Kamera aktif — QR diproses di perangkat ini' : 'Pencatatan diverifikasi oleh server'}</span>
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                loading={imageProcessing}
                                onClick={() => imageInputRef.current?.click()}
                            >
                                Pilih Foto QR
                            </Button>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => setMode('code')}
                                className="min-h-11 font-semibold text-[#0B63CE] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                            >
                                Kamera tidak aktif? Ketik kode &rarr;
                            </button>
                        </div>
                    </div>
                )}

                {/* Form: Manual Code / Confirmation */}
                <form onSubmit={handleSubmitAttendance} className="bg-white rounded-2xl border border-[#DCE7F3] p-6 shadow-xs space-y-4">
                    {mode === 'code' || form.data.token ? (
                        <div className="space-y-2">
                            <label htmlFor="attendance-code" className="block text-xs font-bold text-[#0E2747] uppercase tracking-wider">
                                {form.data.token ? 'Token QR terisi' : 'Masukkan Kode Sesi (6 Karakter)'}
                            </label>

                            {form.data.token ? (
                                <Input
                                    id="attendance-code"
                                    name="token"
                                    value={form.data.token}
                                    readOnly
                                    className="bg-slate-50 font-mono text-xs text-[#0B63CE]"
                                />
                            ) : (
                                <Input
                                    ref={shortCodeInputRef}
                                    id="attendance-code"
                                    name="short_code"
                                    defaultValue={manualCode}
                                    onInput={(e) => {
                                        const normalizedCode = normalizeAttendanceCode(e.currentTarget.value);
                                        if (e.currentTarget.value !== normalizedCode) {
                                            e.currentTarget.value = normalizedCode;
                                        }
                                        setManualCode(normalizedCode);
                                        form.setData('short_code', normalizedCode);
                                    }}
                                    placeholder="Contoh: KMP001"
                                    className="font-mono text-lg font-bold text-center tracking-widest uppercase"
                                    maxLength={10}
                                    required
                                    autoComplete="off"
                                    autoCapitalize="characters"
                                    autoCorrect="off"
                                    inputMode="text"
                                    enterKeyHint="done"
                                    spellCheck={false}
                                />
                            )}
                            <p className="text-[11px] text-[#6B7C93]">
                                Kode sesi ditampilkan pada lembar QR code di depan ruangan atau diumumkan oleh panitia penataran.
                            </p>
                        </div>
                    ) : null}

                    {form.errors.token && (
                        <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
                            {form.errors.token}
                        </div>
                    )}
                    {form.errors.short_code && (
                        <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
                            {form.errors.short_code}
                        </div>
                    )}
                    {form.errors.attendance_type && <p role="alert" className="text-sm text-[#9F244D]">{form.errors.attendance_type}</p>}

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full justify-center py-3 text-sm"
                        loading={form.processing}
                        disabled={!form.data.token && !manualCode}
                    >
                        {form.data.attendance_type === 'check_out' ? 'Konfirmasi Absensi Keluar' : 'Konfirmasi Absensi Masuk'}
                    </Button>
                </form>

                {/* Privacy & Validation Notice */}
                <div className="p-4 bg-slate-50 rounded-xl border border-[#DCE7F3] text-[11px] text-[#6B7C93] space-y-1">
                    <div className="font-semibold text-[#0E2747] flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-[#0B63CE]" />
                        <span>Ketentuan Kehadiran Resmi</span>
                    </div>
                    <p>
                        Pindai QR kedatangan awal sekali untuk event, lalu QR harian sebelum QR setiap sesi. Kehadiran ganda pada jenis absensi yang sama tidak diperkenankan.
                    </p>
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="py-4 text-center text-[10px] text-[#8A9FB4] font-mono border-t border-[#DCE7F3]/60 bg-white">
                PERKEMI • Pustaka Penataran &copy; {new Date().getFullYear()}
            </footer>
        </div>
    );
}
