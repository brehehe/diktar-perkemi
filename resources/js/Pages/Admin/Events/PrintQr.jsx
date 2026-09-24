import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Printer, ArrowLeft } from 'lucide-react';
import Button from '../../../Components/ui/Button';

const LOGO_WSKO = '/images/setup/ChatGPT Image 21 Sep 2026, 10.38.25.png';
const LOGO_PERKEMI = '/images/setup/ChatGPT Image 21 Sep 2026, 10.38.27.png';

export default function PrintQr({ event, session, scanUrl, qrSvg }) {
    const handlePrint = () => {
        window.print();
    };

    const isAllTracks = !session.target_tracks || session.target_tracks.length === 0 || session.target_tracks.length >= 6;
    const trackText = isAllTracks
        ? 'Semua Jalur (Pelatih, Penguji, Wasit)'
        : (Array.isArray(session.target_tracks) ? session.target_tracks.join(', ') : session.target_tracks);

    const isArrival = session.session_type_code === 'KEHADIRAN_AWAL';
    const isDaily = session.session_type_code === 'KEHADIRAN_HARIAN';

    const badgeLabel = isArrival
        ? 'QR KEDATANGAN AWAL PESERTA'
        : isDaily
        ? `QR KEHADIRAN HARIAN — HARI KE-${session.day_number}`
        : `QR ABSENSI SESI — HARI KE-${session.day_number}${session.session_number ? ` • SESI ${session.session_number}` : ''}`;

    const badgeColor = { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' };

    const now = new Date();
    const printDate = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const spacedShortCode = session.qr_short_code
        ? session.qr_short_code.split('').join(' ')
        : '';

    return (
        <>
            <Head title={`Cetak Lembar QR — ${session.topic} (${event.name})`} />

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

                    .a4-page {
                        width: 210mm;
                        height: 297mm;
                        page-break-after: avoid;
                        break-after: avoid;
                        page-break-inside: avoid;
                        break-inside: avoid;
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
                        position: relative;
                        box-shadow: none !important;
                        border: none !important;
                    }

                    .qr-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .type-badge-bar { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .track-pill { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .day-pill { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .qr-footer { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .meta-chip { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `}</style>

            <div
                className="min-h-screen bg-slate-200 font-sans antialiased py-8 px-4 print:p-0 print:bg-white"
                style={{ fontFamily: "'Inter', sans-serif" }}
            >
                {/* Screen Toolbar */}
                <div className="no-print max-w-[210mm] mx-auto mb-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/admin/event/${event.id}?tab=rundown`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Kembali ke Rundown Event
                        </Link>
                        <span className="text-slate-300">|</span>
                        <span className="text-xs text-slate-500 font-medium truncate max-w-sm">
                            {event.name}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="primary"
                            icon={<Printer className="w-4 h-4" />}
                            onClick={handlePrint}
                        >
                            Cetak Lembar QR
                        </Button>
                    </div>
                </div>

                {/* Printable A4 Page Container */}
                <div className="max-w-[210mm] mx-auto shadow-xl print:shadow-none">
                    <article
                        className="a4-page bg-white relative"
                        style={{
                            fontFamily: "'Inter', sans-serif",
                            minHeight: '297mm',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {/* ══ HEADER ══ */}
                        <header className="qr-header flex-shrink-0" style={{ background: '#0C1F3D' }}>
                            <div className="flex items-center justify-between px-8 py-4">
                                {/* WSKO */}
                                <div className="flex items-center gap-3">
                                    <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 8, padding: 6 }}>
                                        <img
                                            src={LOGO_WSKO}
                                            alt="WSKO"
                                            style={{ height: 44, width: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                                        />
                                    </div>
                                    <div style={{ color: 'white', lineHeight: 1.3 }}>
                                        <div style={{ fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.65, fontWeight: 500 }}>
                                            World Shorinji Kempo
                                        </div>
                                        <div style={{ fontSize: 11, fontWeight: 700 }}>Organization (WSKO)</div>
                                    </div>
                                </div>

                                {/* Center Event Title */}
                                <div style={{ color: 'white', textAlign: 'center', flex: 1, margin: '0 24px' }}>
                                    <div style={{ fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.6, fontWeight: 500, marginBottom: 2 }}>
                                        Dokumen Resmi Presensi Kegiatan
                                    </div>
                                    <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.02em' }}>
                                        Penataran PB PERKEMI
                                    </div>
                                    <div style={{ fontSize: 9, opacity: 0.65, marginTop: 2, lineHeight: 1.3 }}>
                                        {event.name}
                                    </div>
                                </div>

                                {/* PERKEMI */}
                                <div className="flex items-center gap-3" style={{ flexDirection: 'row-reverse' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 8, padding: 6 }}>
                                        <img
                                            src={LOGO_PERKEMI}
                                            alt="PERKEMI"
                                            style={{ height: 44, width: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                                        />
                                    </div>
                                    <div style={{ color: 'white', textAlign: 'right', lineHeight: 1.3 }}>
                                        <div style={{ fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.65, fontWeight: 500 }}>
                                            Persaudaraan Shorinji Kempo
                                        </div>
                                        <div style={{ fontSize: 11, fontWeight: 700 }}>Indonesia (PERKEMI)</div>
                                    </div>
                                </div>
                            </div>

                            {/* Sub-strip Peach */}
                            <div
                                className="type-badge-bar"
                                style={{
                                    background: badgeColor.bg,
                                    borderTop: `1px solid ${badgeColor.border}`,
                                    textAlign: 'center',
                                    padding: '6px 0',
                                    fontSize: 9.5,
                                    fontWeight: 800,
                                    letterSpacing: '0.18em',
                                    textTransform: 'uppercase',
                                    color: badgeColor.color,
                                }}
                            >
                                {badgeLabel}
                            </div>
                        </header>

                        {/* ══ BODY ══ */}
                        <main
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: '28px 48px 20px',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Badges / Pills */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    marginBottom: 16,
                                    flexWrap: 'wrap',
                                    justifyContent: 'center',
                                }}
                            >
                                <span
                                    className="day-pill"
                                    style={{
                                        background: '#0C1F3D',
                                        color: 'white',
                                        borderRadius: 999,
                                        padding: '5px 14px',
                                        fontSize: 11,
                                        fontWeight: 700,
                                        fontFamily: 'monospace',
                                    }}
                                >
                                    {isArrival
                                        ? 'Registrasi Awal'
                                        : `Hari ke-${session.day_number}${session.session_number ? ` • Sesi ${session.session_number}` : ''}`}
                                </span>
                                <span
                                    className="track-pill"
                                    style={{
                                        background: '#F0FDF4',
                                        color: '#166534',
                                        border: '1px solid #BBF7D0',
                                        borderRadius: 999,
                                        padding: '5px 14px',
                                        fontSize: 11,
                                        fontWeight: 600,
                                    }}
                                >
                                    Jalur: {trackText}
                                </span>
                            </div>

                            {/* Session Topic / Title */}
                            <h1
                                style={{
                                    fontFamily: "'Playfair Display', 'Georgia', serif",
                                    fontWeight: 800,
                                    fontSize: 28,
                                    color: '#0C1F3D',
                                    textAlign: 'center',
                                    lineHeight: 1.25,
                                    maxWidth: 520,
                                    marginBottom: 8,
                                }}
                            >
                                {session.topic}
                            </h1>

                            {session.subtopic && (
                                <p
                                    style={{
                                        fontSize: 13,
                                        color: '#475569',
                                        textAlign: 'center',
                                        maxWidth: 480,
                                        marginBottom: 8,
                                        fontWeight: 500,
                                        lineHeight: 1.5,
                                    }}
                                >
                                    {session.subtopic}
                                </p>
                            )}

                            {/* Center Blue Divider */}
                            <div
                                style={{
                                    width: 48,
                                    height: 3,
                                    background: 'linear-gradient(90deg, #0C1F3D, #2563EB)',
                                    borderRadius: 2,
                                    margin: '10px 0 16px',
                                }}
                            />

                            {/* Meta Chips */}
                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 8,
                                    justifyContent: 'center',
                                    marginBottom: 20,
                                }}
                            >
                                {session.time_slot && (
                                    <span
                                        className="meta-chip"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 5,
                                            background: '#F8FAFF',
                                            border: '1px solid #DBEAFE',
                                            borderRadius: 8,
                                            padding: '6px 12px',
                                            fontSize: 12,
                                            fontWeight: 700,
                                            fontFamily: 'monospace',
                                            color: '#1E3A8A',
                                        }}
                                    >
                                        <ClockIcon /> {session.time_slot} WIB
                                    </span>
                                )}
                                <span
                                    className="meta-chip"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 5,
                                        background: '#F8FAFF',
                                        border: '1px solid #DCF5EA',
                                        borderRadius: 8,
                                        padding: '6px 12px',
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: '#14532D',
                                    }}
                                >
                                    <MapPinIcon /> {session.room || event.place}
                                </span>
                                {session.speaker_name && (
                                    <span
                                        className="meta-chip"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 5,
                                            background: '#FFF5F7',
                                            border: '1px solid #FECDD3',
                                            borderRadius: 8,
                                            padding: '6px 12px',
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: '#9F1239',
                                        }}
                                    >
                                        <UserIcon /> Pemateri: <strong>{session.speaker_name}</strong>
                                    </span>
                                )}
                            </div>

                            {/* Dashed QR Box */}
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '22px 28px',
                                    borderRadius: 20,
                                    border: '2px dashed #BFDBFE',
                                    background: '#F8FBFF',
                                    marginBottom: 20,
                                    width: 'fit-content',
                                    maxWidth: '100%',
                                    marginLeft: 'auto',
                                    marginRight: 'auto',
                                }}
                            >
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
                                    role="img"
                                    aria-label={`QR absensi ${session.topic}`}
                                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                                />
                                <div
                                    style={{
                                        marginTop: 12,
                                        fontSize: 11,
                                        fontWeight: 600,
                                        color: '#1D4ED8',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 6,
                                        textAlign: 'center',
                                    }}
                                >
                                    <QrCodeIcon /> Pindai QR ini dengan smartphone peserta
                                </div>
                            </div>

                            {/* Manual Short Code Box */}
                            <div
                                style={{
                                    background: 'white',
                                    border: '1.5px solid #E2E8F0',
                                    borderRadius: 12,
                                    padding: '12px 20px',
                                    maxWidth: 420,
                                    width: '100%',
                                    textAlign: 'center',
                                }}
                            >
                                <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 4, fontWeight: 500 }}>
                                    Atau masukkan kode sesi secara manual:
                                </div>
                                <div
                                    style={{
                                        fontFamily: 'monospace',
                                        fontSize: 30,
                                        fontWeight: 900,
                                        letterSpacing: '0.25em',
                                        color: '#0C1F3D',
                                    }}
                                >
                                    {spacedShortCode}
                                </div>
                                <div
                                    style={{
                                        fontSize: 10,
                                        color: '#64748B',
                                        marginTop: 4,
                                        fontFamily: 'monospace',
                                        wordBreak: 'break-all',
                                    }}
                                >
                                    {scanUrl}
                                </div>
                            </div>
                        </main>

                        {/* ══ FOOTER ══ */}
                        <footer
                            className="qr-footer flex-shrink-0"
                            style={{
                                background: '#0C1F3D',
                                padding: '10px 32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div
                                    style={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: '50%',
                                        background: '#10B981',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                    }}
                                >
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
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
                                    Hal 1/1
                                </span>
                            </div>
                        </footer>
                    </article>
                </div>
            </div>
        </>
    );
}

function ClockIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}

function MapPinIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    );
}

function UserIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

function QrCodeIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="5" height="5" x="3" y="3" rx="1" />
            <rect width="5" height="5" x="16" y="3" rx="1" />
            <rect width="5" height="5" x="3" y="16" rx="1" />
            <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
            <path d="M21 21v.01" />
            <path d="M12 7v3a2 2 0 0 1-2 2H7" />
            <path d="M3 12h.01" />
            <path d="M12 3h.01" />
            <path d="M12 16v.01" />
            <path d="M16 12h1" />
            <path d="M21 12v.01" />
            <path d="M12 21v-1" />
        </svg>
    );
}
