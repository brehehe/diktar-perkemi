import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Printer,
    ArrowLeft,
    Calendar,
    MapPin,
    Clock,
    Filter,
    Layers,
    User,
    ChevronRight,
    FileSpreadsheet,
} from 'lucide-react';
import Button from '../../../Components/ui/Button';

const LOGO_WSKO = '/images/setup/ChatGPT Image 21 Sep 2026, 10.38.25.png';
const LOGO_PERKEMI = '/images/setup/ChatGPT Image 21 Sep 2026, 10.38.27.png';

export default function PrintRundown({ event, sessions = [] }) {
    const [selectedDay, setSelectedDay] = useState('all');
    const [selectedTrack, setSelectedTrack] = useState('all');
    const [selectedRoom, setSelectedRoom] = useState('all');

    const availableDays = useMemo(() => {
        const days = Array.from(new Set(sessions.map((s) => s.day_number).filter(Boolean)));
        return days.sort((a, b) => a - b);
    }, [sessions]);

    const availableTracks = useMemo(() => {
        const tracks = new Set();
        sessions.forEach((s) => {
            if (Array.isArray(s.target_tracks)) {
                s.target_tracks.forEach((t) => tracks.add(t));
            }
        });
        return Array.from(tracks).sort();
    }, [sessions]);

    const availableRooms = useMemo(() => {
        const rooms = new Set();
        sessions.forEach((s) => {
            if (s.room && s.room !== '-') rooms.add(s.room);
        });
        return Array.from(rooms).sort();
    }, [sessions]);

    const filteredSessions = useMemo(() => {
        return sessions.filter((s) => {
            if (selectedDay !== 'all' && Number(s.day_number) !== Number(selectedDay)) return false;
            if (selectedTrack !== 'all') {
                if (Array.isArray(s.target_tracks) && s.target_tracks.length > 0) {
                    if (!s.target_tracks.includes(selectedTrack) && !s.target_tracks.includes('ALL') && !s.target_tracks.includes('SEMUA')) {
                        return false;
                    }
                }
            }
            if (selectedRoom !== 'all' && s.room !== selectedRoom) return false;
            return true;
        });
    }, [sessions, selectedDay, selectedTrack, selectedRoom]);

    const totalJp = useMemo(() => {
        return filteredSessions.reduce((acc, s) => acc + (Number(s.duration_jp) || 0), 0);
    }, [filteredSessions]);

    const printDate = useMemo(() => {
        return new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }, []);

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <Head title={`Cetak Rundown — ${event.name}`} />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800&display=swap');

                * { box-sizing: border-box; }

                @page {
                    size: A4 landscape;
                    margin: 10mm;
                }

                @media print {
                    html, body {
                        background: #fff !important;
                        color: #000 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        font-size: 9pt;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .print-container {
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .page-break {
                        page-break-after: always;
                    }
                    table {
                        page-break-inside: auto;
                    }
                    tr {
                        page-break-inside: avoid;
                        page-break-after: auto;
                    }
                }

                .print-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .print-table th, .print-table td {
                    border: 1px solid #1e293b;
                    padding: 5px 7px;
                    text-align: left;
                    vertical-align: top;
                }
                .print-table th {
                    background-color: #f1f5f9 !important;
                    font-weight: 700;
                    text-transform: uppercase;
                    font-size: 8pt;
                    letter-spacing: 0.03em;
                }
            `}</style>

            <div className="min-h-screen bg-[#F8FBFF] text-[#0E2747]">
                {/* ── TOP CONTROL BAR (no-print) ── */}
                <div className="no-print sticky top-0 z-50 border-b border-[#DCE7F3] bg-white/95 backdrop-blur-md shadow-xs">
                    <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <Link
                                    href={`/admin/event/${event.id}?tab=rundown`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] text-xs font-semibold text-[#0E2747] hover:bg-[#EAF5FF] transition-colors"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    <span>Kembali ke Rundown</span>
                                </Link>
                                <span className="text-[#DCE7F3]">|</span>
                                <div>
                                    <h1 className="text-xs font-bold text-[#0E2747] leading-tight">
                                        Format Cetak Resmi Rundown & Jadwal
                                    </h1>
                                    <p className="text-[11px] text-[#6B7C93] truncate max-w-md">
                                        {event.name} · {filteredSessions.length} Sesi Terpilih ({totalJp} JP)
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <a
                                    href={`/admin/event/${event.id}/rundown/export-excel`}
                                    download
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
                                >
                                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Export Excel</span>
                                </a>

                                <Button
                                    variant="primary"
                                    icon={<Printer className="w-3.5 h-3.5" />}
                                    onClick={handlePrint}
                                    className="bg-[#0B63CE] hover:bg-[#0A3F82] text-white text-xs font-bold shadow-xs"
                                >
                                    Cetak Sekarang (Print / PDF)
                                </Button>
                            </div>
                        </div>

                        {/* Interactive Filter Pills */}
                        <div className="mt-3 pt-3 border-t border-[#DCE7F3] flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-[#6B7C93] flex items-center gap-1">
                                    <Filter className="w-3 h-3 text-[#0B63CE]" />
                                    Filter Hari:
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setSelectedDay('all')}
                                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                                        selectedDay === 'all'
                                            ? 'bg-[#0E2747] text-white font-semibold'
                                            : 'bg-white border border-[#DCE7F3] text-[#6B7C93] hover:text-[#0E2747]'
                                    }`}
                                >
                                    Semua Hari ({sessions.length})
                                </button>
                                {availableDays.map((d) => (
                                    <button
                                        key={d}
                                        type="button"
                                        onClick={() => setSelectedDay(String(d))}
                                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                                            selectedDay === String(d)
                                                ? 'bg-[#0E2747] text-white font-semibold'
                                                : 'bg-white border border-[#DCE7F3] text-[#6B7C93] hover:text-[#0E2747]'
                                        }`}
                                    >
                                        Hari ke-{d}
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                {availableTracks.length > 0 && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[#6B7C93] font-medium">Jalur:</span>
                                        <select
                                            value={selectedTrack}
                                            onChange={(e) => setSelectedTrack(e.target.value)}
                                            className="px-2 py-1 rounded border border-[#DCE7F3] bg-white text-xs text-[#0E2747] focus:outline-none focus:ring-1 focus:ring-[#0B63CE]"
                                        >
                                            <option value="all">Semua Jalur</option>
                                            {availableTracks.map((t) => (
                                                <option key={t} value={t}>
                                                    Jalur {t}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {availableRooms.length > 0 && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[#6B7C93] font-medium">Ruang:</span>
                                        <select
                                            value={selectedRoom}
                                            onChange={(e) => setSelectedRoom(e.target.value)}
                                            className="px-2 py-1 rounded border border-[#DCE7F3] bg-white text-xs text-[#0E2747] focus:outline-none focus:ring-1 focus:ring-[#0B63CE]"
                                        >
                                            <option value="all">Semua Ruangan</option>
                                            {availableRooms.map((r) => (
                                                <option key={r} value={r}>
                                                    {r}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── OFFICIAL PRINTABLE DOCUMENT SHEET ── */}
                <div className="max-w-[297mm] mx-auto p-4 sm:p-8">
                    <div className="print-container bg-white p-6 sm:p-10 border border-[#DCE7F3] shadow-md rounded-xl print:shadow-none print:border-none print:p-0">
                        {/* ── Official PB PERKEMI Kop Surat ── */}
                        <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-4">
                            <div className="w-20 flex justify-center shrink-0">
                                <img
                                    src={LOGO_PERKEMI}
                                    alt="Logo PB PERKEMI"
                                    className="h-16 w-auto object-contain"
                                />
                            </div>
                            <div className="text-center px-4 flex-1 space-y-0.5">
                                <h1 className="text-sm sm:text-base font-extrabold uppercase tracking-wide font-sans text-black">
                                    Pengurus Besar Persaudaraan Bela Diri Kempo Indonesia
                                </h1>
                                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-black">
                                    Departemen Pendidikan, Penataran &amp; Pelatihan (DIKTAR)
                                </h2>
                                <p className="text-[10px] text-gray-700 font-medium">
                                    Sekretariat PB PERKEMI · Gedung KONI Pusat, Jakarta · Portal Resmi: diktar.smart-perkemi.id
                                </p>
                                <h3 className="text-xs sm:text-sm font-black uppercase text-[#0E2747] pt-1 tracking-widest underline underline-offset-4">
                                    Jadwal &amp; Rundown Resmi Kegiatan Penataran
                                </h3>
                            </div>
                            <div className="w-20 flex justify-center shrink-0">
                                <img
                                    src={LOGO_WSKO}
                                    alt="Logo WSKO"
                                    className="h-16 w-auto object-contain"
                                />
                            </div>
                        </div>

                        {/* ── Event Metadata Strip ── */}
                        <div className="mb-4 bg-slate-50 border border-slate-300 p-3 rounded-lg text-xs grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                                <span className="text-[10px] text-gray-500 uppercase font-mono block">Nama Penataran:</span>
                                <span className="font-bold text-[#0E2747] text-xs leading-snug">{event.name}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-500 uppercase font-mono block">Tanggal &amp; Waktu:</span>
                                <span className="font-semibold text-gray-800">{event.date_formatted} ({event.duration_text || `${event.total_days} hari`})</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-500 uppercase font-mono block">Lokasi / Dojo Penyelenggara:</span>
                                <span className="font-semibold text-gray-800">{event.location || 'Sekretariat PERKEMI'}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-500 uppercase font-mono block">Cakupan Hari:</span>
                                <span className="font-bold text-[#0B63CE]">
                                    {selectedDay === 'all' ? 'Seluruh Roster Jadwal' : `Khusus Hari ke-${selectedDay}`}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-500 uppercase font-mono block">Total Sesi &amp; Beban JP:</span>
                                <span className="font-bold text-gray-800">{filteredSessions.length} Sesi Terjadwal · {totalJp} Jam Pelajaran (JP)</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-500 uppercase font-mono block">Tanggal Dokumen:</span>
                                <span className="font-mono text-gray-700">{printDate}</span>
                            </div>
                        </div>

                        {/* ── Official Rundown Table ── */}
                        {filteredSessions.length > 0 ? (
                            <table className="print-table text-[10px] leading-tight">
                                <thead>
                                    <tr>
                                        <th style={{ width: '3%', textAlign: 'center' }}>No</th>
                                        <th style={{ width: '8%', textAlign: 'center' }}>Hari</th>
                                        <th style={{ width: '11%', textAlign: 'center' }}>Waktu (WIB)</th>
                                        <th style={{ width: '8%' }}>Kode Sesi</th>
                                        <th style={{ width: '28%' }}>Materi / Topik Pelajaran &amp; Silabus</th>
                                        <th style={{ width: '16%' }}>Sensei / Instruktur Pengampu</th>
                                        <th style={{ width: '12%' }}>Ruang / Dojo</th>
                                        <th style={{ width: '10%' }}>Sasaran Jalur</th>
                                        <th style={{ width: '4%', textAlign: 'center' }}>JP</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSessions.map((session, idx) => (
                                        <tr key={session.id}>
                                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{idx + 1}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="font-bold">Hari {session.day_number}</span>
                                                {session.session_date && (
                                                    <div className="text-[8px] text-gray-600 font-mono">
                                                        {session.session_date}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'center', fontFamily: 'monospace', fontWeight: 'bold' }}>
                                                {session.time_range}
                                                {session.status === 'delayed' && (
                                                    <div className="text-[8px] font-sans text-amber-700 font-bold">
                                                        [Jadwal Molor]
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ fontFamily: 'monospace', fontSize: '9px' }}>
                                                <strong>{session.session_number}</strong>
                                                <div className="text-[8px] text-gray-600">{session.session_type_name}</div>
                                            </td>
                                            <td>
                                                <div className="font-bold text-black text-[10px]">{session.topic}</div>
                                                {session.subtopic && (
                                                    <div className="text-[9px] text-gray-700 mt-0.5 leading-snug">
                                                        {session.subtopic}
                                                    </div>
                                                )}
                                                {session.method && (
                                                    <div className="text-[8px] text-gray-500 italic mt-0.5">
                                                        Metode: {session.method}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div className="font-bold text-black">{session.speaker_name}</div>
                                                {session.speaker_dan && (
                                                    <div className="text-[8px] text-gray-600">{session.speaker_dan}</div>
                                                )}
                                            </td>
                                            <td>{session.room}</td>
                                            <td>
                                                {Array.isArray(session.target_tracks) && session.target_tracks.length > 0
                                                    ? session.target_tracks.join(', ')
                                                    : 'Semua Kenshi'}
                                            </td>
                                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                                {session.duration_jp || 0}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                                <p className="text-sm font-semibold text-gray-600">Tidak ada sesi rundown yang cocok dengan filter yang dipilih.</p>
                            </div>
                        )}

                        {/* ── Official Signature Blocks ── */}
                        <div className="mt-8 pt-4 border-t border-gray-300 grid grid-cols-2 gap-8 text-center text-xs">
                            <div className="space-y-16">
                                <p className="leading-snug">
                                    Mengetahui &amp; Melaksanakan,<br />
                                    <strong>Koordinator Acara / Panitia Penyelenggara</strong>
                                </p>
                                <div>
                                    <p className="border-t border-black pt-1 font-bold inline-block min-w-[220px]">
                                        ( .................................................... )
                                    </p>
                                    <p className="text-[10px] text-gray-600">Koordinator Rundown &amp; Jadwal</p>
                                </div>
                            </div>
                            <div className="space-y-16">
                                <p className="leading-snug">
                                    Disahkan Oleh,<br />
                                    <strong>Pengurus Besar PERKEMI / Dewan Guru</strong>
                                </p>
                                <div>
                                    <p className="border-t border-black pt-1 font-bold inline-block min-w-[220px]">
                                        ( .................................................... )
                                    </p>
                                    <p className="text-[10px] text-gray-600">Ketua Bidang Diktar PB PERKEMI</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Notes */}
                        <div className="mt-6 pt-2 border-t border-dotted border-gray-300 text-[9px] text-gray-500 flex justify-between items-center">
                            <span>Lembar Rundown Resmi PB PERKEMI · Berlaku untuk seluruh peserta dan instruktur pengampu</span>
                            <span>Dicetak dari Sistem Diktar PERKEMI pada {printDate}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
