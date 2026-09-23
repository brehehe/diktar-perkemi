import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Printer,
    ArrowLeft,
    Clock,
    MapPin,
    Calendar,
    QrCode,
    Layers,
    User,
    CheckCircle2,
    ChevronRight,
} from 'lucide-react';
import Button from '../../../Components/ui/Button';

const LOGO_WSKO = '/images/setup/ChatGPT Image 21 Sep 2026, 10.38.25.png';
const LOGO_PERKEMI = '/images/setup/ChatGPT Image 21 Sep 2026, 10.38.27.png';

export default function PrintAllQr({ event, sessions = [] }) {
    const [selectedDay, setSelectedDay] = useState('all');
    const [selectedTrack, setSelectedTrack] = useState('all');
    const [layoutMode, setLayoutMode] = useState('single');

    const availableDays = useMemo(() => {
        const days = Array.from(new Set(sessions.map((s) => s.day_number).filter(Boolean)));
        return days.sort((a, b) => a - b);
    }, [sessions]);

    const availableTracks = useMemo(() => {
        const tracks = new Set();
        sessions.forEach((s) => {
            if (Array.isArray(s.target_tracks)) s.target_tracks.forEach((t) => tracks.add(t));
        });
        return Array.from(tracks).sort();
    }, [sessions]);

    const filteredSessions = useMemo(() => {
        return sessions.filter((s) => {
            if (selectedDay !== 'all' && Number(s.day_number) !== Number(selectedDay)) return false;
            if (selectedTrack !== 'all') {
                if (Array.isArray(s.target_tracks) && s.target_tracks.length > 0) {
                    if (!s.target_tracks.includes(selectedTrack) && !s.target_tracks.includes('ALL') && !s.target_tracks.includes('SEMUA')) return false;
                }
            }
            return true;
        });
    }, [sessions, selectedDay, selectedTrack]);

    return (
        <>
            <Head title={`Cetak Semua QR Absensi — ${event.name}`} />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800&display=swap');

                * { box-sizing: border-box; }

                .qr-code-wrapper {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    margin: 0 auto !important;
                }
                .qr-code-wrapper svg {
                    display: block !important;
                    width: 100% !important;
                    height: 100% !important;
                    max-width: 100% !important;
                    max-height: 100% !important;
                    margin: 0 auto !important;
                }

                @page {
                    size: A4 portrait;
                    margin: 0;
                }

                @media print {
                    html, body {
                        width: 210mm;
                        height: 297mm;
                        margin: 0;
                        padding: 0;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        font-family: 'Inter', sans-serif;
                    }
                    .no-print { display: none !important; }

                    /* Each A4 page wrapper */
                    .a4-page {
                        width: 210mm;
                        height: 297mm;
                        page-break-after: always;
                        break-after: page;
                        page-break-inside: avoid;
                        break-inside: avoid;
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
                        position: relative;
                    }
                    .a4-page:last-child {
                        page-break-after: avoid;
                        break-after: avoid;
                    }

                    /* compact 2-per-page wrapper */
                    .a4-page-compact {
                        width: 210mm;
                        height: 297mm;
                        page-break-after: always;
                        break-after: page;
                        page-break-inside: avoid;
                        break-inside: avoid;
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
                    }
                    .a4-page-compact:last-child {
                        page-break-after: avoid;
                        break-after: avoid;
                    }

                    .qr-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .qr-body-gradient { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .type-badge-bar { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .track-pill { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .day-pill { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .qr-footer { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .meta-chip { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `}</style>

            {/* ── Screen wrapper ── */}
            <div className="min-h-screen bg-slate-200 font-sans antialiased py-8 px-4 print:p-0 print:bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>

                {/* Screen toolbar */}
                <div className="no-print max-w-5xl mx-auto mb-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-md space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                            <Link href={`/admin/event/${event.id}?tab=absensi`}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                                Kembali ke Detail Event
                            </Link>
                            <span className="text-slate-300">|</span>
                            <span className="text-xs text-slate-500 font-medium">{event.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                                {filteredSessions.length} Lembar QR
                            </span>
                            <Button variant="primary" icon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>
                                Cetak Sekarang
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-700 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-blue-500" /> Hari:
                            </span>
                            <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}
                                className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                <option value="all">Semua Hari ({sessions.length} sesi)</option>
                                {availableDays.map((d) => (
                                    <option key={d} value={d}>Hari ke-{d} ({sessions.filter((s) => s.day_number === d).length} sesi)</option>
                                ))}
                            </select>
                        </div>
                        {availableTracks.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-700 flex items-center gap-1">
                                    <Layers className="w-3.5 h-3.5 text-emerald-500" /> Jalur:
                                </span>
                                <select value={selectedTrack} onChange={(e) => setSelectedTrack(e.target.value)}
                                    className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                    <option value="all">Semua Jalur</option>
                                    {availableTracks.map((t) => <option key={t} value={t}>Jalur {t}</option>)}
                                </select>
                            </div>
                        )}
                        <div className="flex items-center gap-2 ml-auto">
                            <span className="font-semibold text-slate-700">Layout:</span>
                            {['single', 'compact'].map((mode) => (
                                <button key={mode} type="button" onClick={() => setLayoutMode(mode)}
                                    className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${layoutMode === mode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200 hover:text-slate-800'}`}>
                                    {mode === 'single' ? '1 QR / A4' : '2 QR / A4'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Preview cards on screen */}
                <div className="max-w-[210mm] mx-auto space-y-6 print:space-y-0 print:max-w-none print:mx-0">
                    {filteredSessions.length === 0 ? (
                        <div className="no-print text-center py-20 bg-white rounded-2xl border border-slate-200">
                            <QrCode className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="font-semibold text-slate-600">Tidak ada sesi sesuai filter</p>
                        </div>
                    ) : layoutMode === 'single' ? (
                        filteredSessions.map((session, index) => (
                            <QrPage key={session.id} session={session} event={event} compact={false}
                                pageNum={index + 1} totalPages={filteredSessions.length} />
                        ))
                    ) : (
                        Array.from({ length: Math.ceil(filteredSessions.length / 2) }, (_, pi) => {
                            const pair = filteredSessions.slice(pi * 2, pi * 2 + 2);
                            const total = Math.ceil(filteredSessions.length / 2);
                            return (
                                <div key={pi} className="a4-page-compact bg-white shadow-xl print:shadow-none">
                                    {pair.map((s, ii) => (
                                        <QrCardCompact key={s.id} session={s} event={event}
                                            isLast={ii === pair.length - 1 && pair.length === 2} />
                                    ))}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
}

/* ─────────────────────────────────────────────
   Full-A4 single page component
───────────────────────────────────────────── */
function QrPage({ session, event, compact, pageNum, totalPages }) {
    const isAllTracks = !session.target_tracks || session.target_tracks.length === 0 || session.target_tracks.length >= 6;
    const trackText = isAllTracks ? 'Semua Jalur (Pelatih, Penguji, Wasit)' : session.target_tracks.join(', ');
    const isArrival = session.session_type_code === 'KEHADIRAN_AWAL';
    const isDaily   = session.session_type_code === 'KEHADIRAN_HARIAN';

    const badgeLabel = isArrival ? 'QR KEDATANGAN AWAL PESERTA'
        : isDaily ? `QR KEHADIRAN HARIAN — HARI KE-${session.day_number}`
        : `QR ABSENSI SESI — HARI KE-${session.day_number}`;

    const badgeColor = isArrival ? { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' }
        : isDaily ? { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' }
        : { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' };

    const now = new Date();
    const printDate = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <article className="a4-page bg-white shadow-xl print:shadow-none" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* ══ HEADER ══ */}
            <header className="qr-header flex-shrink-0" style={{ background: '#0C1F3D' }}>
                {/* Top strip */}
                <div className="flex items-center justify-between px-8 py-4">
                    {/* WSKO */}
                    <div className="flex items-center gap-3">
                        <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 8, padding: 6 }}>
                            <img src={LOGO_WSKO} alt="WSKO" style={{ height: 44, width: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                        </div>
                        <div style={{ color: 'white', lineHeight: 1.3 }}>
                            <div style={{ fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.65, fontWeight: 500 }}>World Shorinji Kempo</div>
                            <div style={{ fontSize: 11, fontWeight: 700 }}>Organization (WSKO)</div>
                        </div>
                    </div>

                    {/* Center */}
                    <div style={{ color: 'white', textAlign: 'center', flex: 1, margin: '0 24px' }}>
                        <div style={{ fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.6, fontWeight: 500, marginBottom: 2 }}>Dokumen Resmi Presensi Kegiatan</div>
                        <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.02em' }}>Penataran PB PERKEMI</div>
                        <div style={{ fontSize: 9, opacity: 0.65, marginTop: 2 }}>{event.name}</div>
                    </div>

                    {/* PERKEMI */}
                    <div className="flex items-center gap-3" style={{ flexDirection: 'row-reverse' }}>
                        <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 8, padding: 6 }}>
                            <img src={LOGO_PERKEMI} alt="PERKEMI" style={{ height: 44, width: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                        </div>
                        <div style={{ color: 'white', textAlign: 'right', lineHeight: 1.3 }}>
                            <div style={{ fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.65, fontWeight: 500 }}>Persaudaraan Shorinji Kempo</div>
                            <div style={{ fontSize: 11, fontWeight: 700 }}>Indonesia (PERKEMI)</div>
                        </div>
                    </div>
                </div>

                {/* Type badge strip */}
                <div className="type-badge-bar" style={{
                    background: badgeColor.bg, borderTop: `1px solid ${badgeColor.border}`,
                    textAlign: 'center', padding: '6px 0',
                    fontSize: 9.5, fontWeight: 800, letterSpacing: '0.18em',
                    textTransform: 'uppercase', color: badgeColor.color,
                }}>
                    {badgeLabel}
                </div>
            </header>

            {/* ══ BODY ══ */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 48px 20px', overflow: 'hidden' }}>

                {/* Day + Track pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <span className="day-pill" style={{
                        background: '#0C1F3D', color: 'white', borderRadius: 999,
                        padding: '5px 14px', fontSize: 11, fontWeight: 700, fontFamily: 'monospace',
                    }}>
                        {isArrival ? 'Registrasi Awal' : `Hari ke-${session.day_number} • ${session.session_number || ''}`}
                    </span>
                    <span className="track-pill" style={{
                        background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0',
                        borderRadius: 999, padding: '5px 14px', fontSize: 11, fontWeight: 600,
                    }}>
                        Jalur: {trackText}
                    </span>
                </div>

                {/* Session Title */}
                <h1 style={{
                    fontFamily: "'Playfair Display', 'Georgia', serif",
                    fontWeight: 800, fontSize: 28, color: '#0C1F3D', textAlign: 'center',
                    lineHeight: 1.25, maxWidth: 520, marginBottom: 8,
                }}>
                    {session.topic}
                </h1>

                {session.subtopic && (
                    <p style={{ fontSize: 13, color: '#475569', textAlign: 'center', maxWidth: 480, marginBottom: 8, fontWeight: 500, lineHeight: 1.5 }}>
                        {session.subtopic}
                    </p>
                )}

                {/* Divider */}
                <div style={{ width: 48, height: 3, background: 'linear-gradient(90deg, #0C1F3D, #2563EB)', borderRadius: 2, margin: '10px 0 16px' }} />

                {/* Meta chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
                    {session.time_slot && (
                        <span className="meta-chip" style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#F8FAFF', border: '1px solid #DBEAFE', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: '#1E3A8A' }}>
                            <ClockIcon /> {session.time_slot} WIB
                        </span>
                    )}
                    <span className="meta-chip" style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#F8FAFF', border: '1px solid #DCF5EA', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, color: '#14532D' }}>
                        <MapPinIcon /> {session.room || event.place}
                    </span>
                    {session.speaker_name && (
                        <span className="meta-chip" style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#FFF5F7', border: '1px solid #FECDD3', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, color: '#9F1239' }}>
                            <UserIcon /> Pemateri: <strong>{session.speaker_name}</strong>
                        </span>
                    )}
                </div>

                {/* QR Code */}
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '22px 28px', borderRadius: 20,
                    border: '2px dashed #BFDBFE', background: '#F8FBFF',
                    marginBottom: 20,
                    width: 'fit-content',
                    maxWidth: '100%',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                }}>
                    <div
                        style={{
                            width: 220,
                            height: 220,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto',
                        }}
                        className="qr-code-wrapper"
                        role="img" aria-label={`QR absensi ${session.topic}`}
                        dangerouslySetInnerHTML={{ __html: session.qrSvg }}
                    />
                    <div style={{ marginTop: 12, fontSize: 11, fontWeight: 600, color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textAlign: 'center' }}>
                        <QrCodeIcon /> Pindai QR ini dengan smartphone peserta
                    </div>
                </div>

                {/* Manual code box */}
                <div style={{
                    background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 12,
                    padding: '12px 20px', maxWidth: 420, width: '100%', textAlign: 'center',
                }}>
                    <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 4, fontWeight: 500 }}>
                        Atau masukkan kode sesi secara manual:
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: 30, fontWeight: 900, letterSpacing: '0.15em', color: '#0C1F3D' }}>
                        {session.qr_short_code}
                    </div>
                    <div style={{ fontSize: 10, color: '#64748B', marginTop: 4, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        {session.scanUrl}
                    </div>
                </div>
            </main>

            {/* ══ FOOTER ══ */}
            <footer className="qr-footer flex-shrink-0" style={{
                background: '#0C1F3D',
                padding: '10px 32px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
                        Dokumen Resmi Presensi · Penataran PB PERKEMI · {event.place}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace' }}>
                        Dicetak: {printDate}
                    </span>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace' }}>
                        ID #{session.id}
                    </span>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace' }}>
                        Hal {pageNum}/{totalPages}
                    </span>
                </div>
            </footer>
        </article>
    );
}

/* ─────────────────────────────────────────────
   Compact half-page card (2 per A4)
───────────────────────────────────────────── */
function QrCardCompact({ session, event, isLast }) {
    const isAllTracks = !session.target_tracks || session.target_tracks.length === 0 || session.target_tracks.length >= 6;
    const trackText = isAllTracks ? 'Semua Jalur' : session.target_tracks.join(', ');
    const isArrival = session.session_type_code === 'KEHADIRAN_AWAL';
    const isDaily   = session.session_type_code === 'KEHADIRAN_HARIAN';

    const badgeLabel = isArrival ? 'QR KEDATANGAN AWAL'
        : isDaily ? `QR KEHADIRAN HARIAN · HARI KE-${session.day_number}`
        : `QR ABSENSI SESI · HARI KE-${session.day_number}`;

    const badgeColor = isArrival ? { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' }
        : isDaily ? { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' }
        : { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' };

    return (
        <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            borderBottom: isLast ? 'none' : '2px dashed #CBD5E1',
            overflow: 'hidden',
        }}>
            {/* Mini header */}
            <div style={{ background: '#0C1F3D', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img src={LOGO_WSKO} alt="WSKO" style={{ height: 28, width: 28, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>WSKO</span>
                </div>
                <div style={{ color: 'white', textAlign: 'center', fontSize: 11, fontWeight: 700 }}>
                    Dokumen Resmi Presensi · Penataran PB PERKEMI
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: 'row-reverse' }}>
                    <img src={LOGO_PERKEMI} alt="PERKEMI" style={{ height: 28, width: 28, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>PERKEMI</span>
                </div>
            </div>

            {/* Badge */}
            <div style={{
                background: badgeColor.bg, borderBottom: `1px solid ${badgeColor.border}`,
                textAlign: 'center', padding: '4px 0', fontSize: 9, fontWeight: 800,
                letterSpacing: '0.15em', textTransform: 'uppercase', color: badgeColor.color,
            }}>
                {badgeLabel}
            </div>

            {/* Content row */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '12px 24px', gap: 20 }}>
                {/* Left: info */}
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                        <span style={{ background: '#0C1F3D', color: 'white', borderRadius: 999, padding: '3px 10px', fontSize: 10, fontWeight: 700, fontFamily: 'monospace' }}>
                            {isArrival ? 'Registrasi Awal' : `Hari ke-${session.day_number} · ${session.session_number || ''}`}
                        </span>
                        <span style={{ background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', borderRadius: 999, padding: '3px 10px', fontSize: 10, fontWeight: 600 }}>
                            {trackText}
                        </span>
                    </div>

                    <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 800, fontSize: 17, color: '#0C1F3D', lineHeight: 1.3, marginBottom: 6 }}>
                        {session.topic}
                    </h2>

                    {session.subtopic && (
                        <p style={{ fontSize: 11, color: '#475569', marginBottom: 10, lineHeight: 1.4 }}>{session.subtopic}</p>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {session.time_slot && (
                            <span style={{ fontSize: 11, color: '#1E3A8A', fontFamily: 'monospace', fontWeight: 700 }}>⏰ {session.time_slot} WIB</span>
                        )}
                        <span style={{ fontSize: 11, color: '#14532D', fontWeight: 600 }}>📍 {session.room || event.place}</span>
                        {session.speaker_name && <span style={{ fontSize: 11, color: '#9F1239' }}>�� {session.speaker_name}</span>}
                    </div>
                </div>

                {/* Right: QR */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, flexShrink: 0 }}>
                    <div style={{ border: '1.5px dashed #BFDBFE', borderRadius: 12, padding: 8, background: '#F8FBFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div
                            style={{ width: 130, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}
                            className="qr-code-wrapper"
                            dangerouslySetInnerHTML={{ __html: session.qrSvg }}
                        />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 900, letterSpacing: '0.15em', color: '#0C1F3D' }}>
                            {session.qr_short_code}
                        </div>
                        <div style={{ fontSize: 9, color: '#94A3B8', fontFamily: 'monospace', wordBreak: 'break-all', maxWidth: 140, textAlign: 'center' }}>
                            {session.scanUrl}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* tiny inline SVG icons to avoid print issues */
function ClockIcon() {
    return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function MapPinIcon() {
    return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}
function UserIcon() {
    return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function QrCodeIcon() {
    return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}
