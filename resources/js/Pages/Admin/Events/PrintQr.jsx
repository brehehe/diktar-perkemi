import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Printer, ArrowLeft, Shield, Clock, MapPin, Calendar, QrCode } from 'lucide-react';
import Button from '../../../Components/ui/Button';

export default function PrintQr({ event, session, scanUrl, qrSvg }) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-[#F8FBFF] text-[#112743] font-sans antialiased py-6 sm:py-10 px-4">
            <Head title={`Cetak QR Code — ${session.topic} (${event.name})`} />

            {/* Screen-only Top Navigation Bar */}
            <div className="max-w-2xl mx-auto mb-6 flex items-center justify-between print:hidden">
                <Link
                    href={`/admin/event/${event.id}`}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#0B63CE] hover:text-[#0A3F82] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Detail Event</span>
                </Link>

                <Button
                    variant="primary"
                    icon={<Printer className="w-4 h-4" />}
                    onClick={handlePrint}
                >
                    Cetak Lembar QR
                </Button>
            </div>

            {/* Printable Institutional Card */}
            <main
                role="main"
                className="max-w-2xl mx-auto bg-white rounded-2xl border-2 border-[#DCE7F3] shadow-md print:shadow-none print:border-none print:m-0 print:p-0 p-8 sm:p-12 text-center relative overflow-hidden"
            >
                {/* Official PERKEMI Header */}
                <div className="border-b-2 border-[#0E2747] pb-6 mb-8 flex flex-col items-center">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-[#0E2747] text-white flex items-center justify-center font-bold text-xl shadow-xs">
                            <Shield className="w-7 h-7 text-[#EE9B25]" />
                        </div>
                        <div className="text-left">
                            <div className="font-display font-bold text-lg text-[#0E2747] leading-tight tracking-tight uppercase">
                                PB PERKEMI
                            </div>
                            <div className="text-xs text-[#6B7C93] font-medium tracking-wide">
                                Pustaka Penataran — Portal Pembelajaran & Ujian Digital
                            </div>
                        </div>
                    </div>
                    <div className="text-[11px] font-mono uppercase tracking-widest text-[#0B63CE] font-bold mt-1">
                        {session.session_type_code === 'KEHADIRAN_AWAL' ? 'QR KEDATANGAN AWAL EVENT' : session.session_type_code === 'KEHADIRAN_HARIAN' ? 'QR KEHADIRAN HARIAN' : 'QR ABSENSI SESI'}
                    </div>
                </div>

                {/* Event & Session Title */}
                <div className="space-y-2 mb-6">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF5FF] text-[#0B63CE] border border-[#0B63CE]/20 font-mono">
                        {session.session_type_code === 'KEHADIRAN_AWAL' ? 'Berlaku sekali saat peserta tiba' : `Hari ke-${session.day_number} • ${session.session_number}`}
                    </span>
                    <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#0E2747] leading-snug">
                        {session.topic}
                    </h1>
                    <p className="text-sm text-[#6B7C93] font-medium">
                        {event.name}
                    </p>
                </div>

                {/* Session Meta Chips */}
                <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-[#112743] mb-8">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8FBFF] border border-[#DCE7F3]">
                        <Clock className="w-3.5 h-3.5 text-[#0B63CE]" />
                        <span className="font-mono font-semibold">{session.attendance_open_at || session.time_slot} WIB</span>
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8FBFF] border border-[#DCE7F3]">
                        <MapPin className="w-3.5 h-3.5 text-[#20A47A]" />
                        <span>{session.room || event.place}</span>
                    </span>
                    {session.speaker_name && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8FBFF] border border-[#DCE7F3]">
                            <span>Pemateri: <strong>{session.speaker_name}</strong></span>
                        </span>
                    )}
                </div>

                {/* Big High-Res QR Code */}
                <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-[#F8FBFF] rounded-2xl border-2 border-dashed border-[#0B63CE]/30 max-w-sm mx-auto mb-8 shadow-xs">
                    <div
                        className="w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                        role="img"
                        aria-label={`QR absensi ${session.topic}`}
                        dangerouslySetInnerHTML={{ __html: qrSvg }}
                    />
                    <div className="mt-4 text-xs font-medium text-[#6B7C93] flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-[#0B63CE]" />
                        <span>Pindai QR dengan kamera smartphone peserta</span>
                    </div>
                </div>

                {/* Short Code Fallback Box */}
                <div className="bg-[#EAF5FF] border border-[#0B63CE]/30 rounded-xl p-4 max-w-md mx-auto mb-8">
                    <div className="text-xs text-[#6B7C93] uppercase tracking-wider font-semibold">
                        Kode Sesi Alternatif (Jika Kamera Bermasalah)
                    </div>
                    <div className="font-mono text-3xl sm:text-4xl font-black text-[#0B63CE] tracking-widest my-1.5 select-all">
                        {session.qr_short_code}
                    </div>
                    <p className="text-[11px] text-[#0A3F82]">
                        Ketik kode di atas pada menu <strong>Scan Absensi &rarr; Masukkan Kode Sesi</strong>
                    </p>
                </div>

                {/* Scan Instructions */}
                <div className="text-left text-xs text-[#6B7C93] space-y-1.5 border-t border-[#DCE7F3] pt-6 max-w-md mx-auto">
                    <div className="font-bold text-[#0E2747] uppercase text-[11px] tracking-wider mb-1">
                        Petunjuk Peserta:
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#0E2747] text-white flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">1</span>
                        <span>Masuk ke portal peserta, lalu buka pemindai QR. Alamat scan: <strong className="break-all">{scanUrl}</strong></span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#0E2747] text-white flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">2</span>
                        <span>Arahkan kamera ke QR code di atas, atau masukkan 6 karakter kode sesi alternatif.</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#0E2747] text-white flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">3</span>
                        <span>Masuk dengan akun kenshi Anda dan konfirmasi kehadiran.</span>
                    </div>
                </div>

                {/* Footer Stamp */}
                <div className="mt-8 pt-4 border-t border-[#DCE7F3]/60 text-[10px] text-[#8A9FB4] flex items-center justify-between font-mono">
                    <span>Dokumen Resmi PB PERKEMI</span>
                    <span>Dicetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
            </main>
        </div>
    );
}
