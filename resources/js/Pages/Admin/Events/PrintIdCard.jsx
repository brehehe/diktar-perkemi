import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Printer, ArrowLeft, Shield, QrCode } from 'lucide-react';
import Button from '../../../Components/ui/Button';

const LOGO_WSKO = '/images/setup/ChatGPT Image 21 Sep 2026, 10.38.25.png';
const LOGO_PERKEMI = '/images/setup/ChatGPT Image 21 Sep 2026, 10.38.27.png';

export default function PrintIdCard({ event, cards = [], single = false }) {
    const handlePrint = () => {
        window.print();
    };

    const firstCard = cards[0];
    const pageTitle = single && firstCard
        ? `ID Card — ${firstCard.name} (${event.name})`
        : `Cetak ID Card Peserta — ${event.name}`;

    return (
        <>
            <Head title={pageTitle} />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

                * { box-sizing: border-box; }

                body {
                    background-color: #F1F5F9;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }

                .id-card-wrapper {
                    width: 86mm;
                    height: 128mm;
                    background: #FFFFFF;
                    border: 1px solid #CBD5E1;
                    border-radius: 6mm;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    page-break-inside: avoid;
                    break-inside: avoid;
                }

                .qr-container svg {
                    width: 100% !important;
                    height: 100% !important;
                    display: block;
                }

                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 8mm;
                    }
                    body {
                        background: #FFFFFF !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .print-grid {
                        display: grid !important;
                        grid-template-columns: repeat(2, 86mm) !important;
                        gap: 10mm !important;
                        justify-content: center !important;
                    }
                    .id-card-wrapper {
                        box-shadow: none !important;
                        border: 1px dashed #94A3B8 !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                }
            `}</style>

            {/* Screen Toolbar */}
            <div className="no-print max-w-4xl mx-auto my-6 px-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/admin/event/${event.id}?tab=peserta`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Kembali ke Daftar Peserta
                        </Link>
                        <span className="text-slate-300">|</span>
                        <span className="text-xs text-slate-500 font-medium">
                            {event.title || event.name} • {cards.length} ID Card
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="primary"
                            icon={<Printer className="w-4 h-4" />}
                            size="sm"
                            onClick={handlePrint}
                        >
                            Cetak ID Card ({cards.length})
                        </Button>
                    </div>
                </div>
            </div>

            {/* ID Cards Rendering Grid */}
            <main className="max-w-4xl mx-auto pb-16 px-4">
                <div className="print-grid flex flex-wrap justify-center gap-8">
                    {cards.map((card) => (
                        <div key={card.id} className="id-card-wrapper shrink-0 text-slate-900">
                            {/* Card Top: Lanyard Slot Hole Guide */}
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20">
                                <div className="w-9 h-2.5 rounded-full border border-slate-300 bg-slate-100 flex items-center justify-center opacity-60">
                                    <div className="w-4 h-1 rounded-full bg-slate-300"></div>
                                </div>
                            </div>

                            {/* Card Header Background & Brand */}
                            <div className="bg-gradient-to-b from-[#0E2747] to-[#123661] text-white pt-6 pb-4 px-4 text-center relative overflow-hidden">
                                {/* Subtle Background Badge Motif */}
                                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/5 pointer-events-none"></div>

                                <div className="flex items-center justify-between gap-2 px-1 mb-2">
                                    <img
                                        src={LOGO_WSKO}
                                        alt="WSKO"
                                        className="h-8 w-8 object-contain drop-shadow-sm brightness-110"
                                    />
                                    <div className="text-center flex-1">
                                        <div className="text-[7.5pt] font-black uppercase tracking-widest text-amber-400">
                                            PB PERKEMI
                                        </div>
                                        <div className="text-[6.5pt] font-semibold text-slate-200 uppercase tracking-tight line-clamp-1">
                                            {event.title || event.name}
                                        </div>
                                    </div>
                                    <img
                                        src={LOGO_PERKEMI}
                                        alt="PERKEMI"
                                        className="h-8 w-8 object-contain drop-shadow-sm brightness-110"
                                    />
                                </div>

                                {/* Track Banner */}
                                <div className="inline-block mt-0.5">
                                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[8pt] font-extrabold uppercase tracking-wide bg-amber-400 text-slate-950 shadow-xs">
                                        <Shield className="w-3 h-3 text-slate-950" />
                                        {card.track_name || card.track_code}
                                    </span>
                                </div>
                            </div>

                            {/* Card Body: Photo & Identity */}
                            <div className="px-4 py-3 flex-1 flex flex-col items-center justify-between text-center">
                                {/* Photo Container */}
                                <div className="relative my-1">
                                    <div className="w-24 h-28 rounded-lg border-2 border-[#0E2747] overflow-hidden bg-slate-100 shadow-md flex items-center justify-center">
                                        {card.photo_url ? (
                                            <img
                                                src={card.photo_url}
                                                alt={card.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-[#0E2747]">
                                                <span className="font-extrabold text-xl">
                                                    {card.name.substring(0, 2).toUpperCase()}
                                                </span>
                                                <span className="text-[7pt] text-slate-400 mt-1 uppercase font-semibold">
                                                    Tanpa Foto
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* DAN Badge Tag */}
                                    {card.dan_roman && (
                                        <div className="absolute -bottom-2 -right-2 bg-[#0E2747] text-amber-300 font-extrabold text-[7.5pt] px-2 py-0.5 rounded-md shadow-xs border border-white">
                                            DAN {card.dan_roman}
                                        </div>
                                    )}
                                </div>

                                {/* Participant Details */}
                                <div className="w-full mt-1.5">
                                    <h2 className="text-[11pt] font-black uppercase text-[#0E2747] tracking-tight leading-tight line-clamp-2">
                                        {card.name}
                                    </h2>
                                    <div className="text-[8pt] font-mono font-bold text-slate-600 mt-0.5">
                                        {card.kenshi_id || 'KNS-000000'}
                                    </div>
                                    <div className="text-[7.5pt] text-slate-500 font-medium truncate mt-0.5">
                                        {card.dojo ? `${card.dojo} • ` : ''}{card.origin}
                                    </div>
                                </div>

                                {/* QR Code & Rotation Group */}
                                <div className="w-full pt-2 flex items-center justify-between gap-3 border-t border-slate-100 mt-2">
                                    <div className="text-left">
                                        <div className="text-[6.5pt] font-semibold uppercase text-slate-400">
                                            Kelompok
                                        </div>
                                        <div className="text-[9pt] font-extrabold text-[#0E2747]">
                                            {card.rotation_group ? `Grup ${card.rotation_group}` : 'Reguler'}
                                        </div>
                                        <div className="text-[6.5pt] text-slate-400">
                                            {event.place || 'Jawa Timur'}
                                        </div>
                                    </div>

                                    <div className="qr-container w-14 h-14 bg-white p-1 rounded-md border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
                                        {card.qr_svg ? (
                                            <div
                                                dangerouslySetInnerHTML={{ __html: card.qr_svg }}
                                                className="w-full h-full flex items-center justify-center"
                                            />
                                        ) : (
                                            <QrCode className="w-8 h-8 text-slate-400" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer Bar */}
                            <div className="bg-slate-900 text-slate-300 py-1.5 px-4 text-center text-[6pt] font-medium tracking-wider uppercase border-t border-slate-800">
                                PERSAUDARAAN SHORINJI KEMPO INDONESIA
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </>
    );
}
