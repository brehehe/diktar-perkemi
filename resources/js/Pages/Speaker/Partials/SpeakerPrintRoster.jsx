import { Info } from 'lucide-react';
import { useSpeakerSchedule } from './SpeakerScheduleContext';
const LOGO_WSKO = '/images/setup/ChatGPT Image 21 Sep 2026, 10.38.25.png';
const LOGO_PERKEMI = '/images/setup/ChatGPT Image 21 Sep 2026, 10.38.27.png';

export default function SpeakerPrintRoster() {
    const {
        speaker,
        isSupervisorMode,
        sessions,
        currentEvent,
        selectedDay,
    } = useSpeakerSchedule();

    return (
        <>
        {/* 5. Print-Only Official Roster Document */}
        <div className="print-only p-8">
            {/* PB PERKEMI Official Kop */}
            <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-4">
                <div className="w-16 flex justify-center shrink-0">
                    <img src={LOGO_PERKEMI} alt="Logo PB PERKEMI" className="h-14 w-auto object-contain" />
                </div>
                <div className="text-center px-4 flex-1 space-y-0.5">
                    <h1 className="text-base font-extrabold uppercase font-sans text-black">
                        Pengurus Besar Persaudaraan Bela Diri Kempo Indonesia
                    </h1>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-black">
                        Departemen Pendidikan, Penataran &amp; Pelatihan (DIKTAR)
                    </h2>
                    <h3 className="text-sm font-black uppercase text-black pt-1 tracking-wider underline">
                        Lembar Jadwal &amp; Roster Sesi Penataran Resmi
                    </h3>
                    <p className="text-[10px] text-gray-700 font-mono">
                        Dicetak pada: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="w-16 flex justify-center shrink-0">
                    <img src={LOGO_WSKO} alt="Logo WSKO" className="h-14 w-auto object-contain" />
                </div>
            </div>

            {/* Event & Scope Info Strip */}
            <div className="mb-4 border border-gray-400 p-3 bg-gray-50 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                    <span className="text-[9px] uppercase font-mono text-gray-600 block">Nama Kegiatan:</span>
                    <span className="font-bold text-black">{currentEvent?.name || 'Seluruh Kegiatan Penataran'}</span>
                </div>
                <div>
                    <span className="text-[9px] uppercase font-mono text-gray-600 block">Tanggal &amp; Tempat:</span>
                    <span className="font-semibold text-black">{currentEvent?.date_formatted || '-'} · {currentEvent?.location || '-'}</span>
                </div>
                <div>
                    <span className="text-[9px] uppercase font-mono text-gray-600 block">Cakupan Hari:</span>
                    <span className="font-bold text-black">{selectedDay ? `Hari ke-${selectedDay}` : 'Seluruh Hari'}</span>
                </div>
                <div>
                    <span className="text-[9px] uppercase font-mono text-gray-600 block">Total Sesi:</span>
                    <span className="font-bold text-black">{sessions.length} Sesi Terjadwal</span>
                </div>
            </div>

            {/* Official Table */}
            <table className="print-table text-xs">
                <thead>
                    <tr>
                        <th style={{ width: '5%' }}>No</th>
                        <th style={{ width: '12%' }}>Hari & Tanggal</th>
                        <th style={{ width: '13%' }}>Waktu (WIB)</th>
                        <th style={{ width: '12%' }}>Ruangan / Dojo</th>
                        {isSupervisorMode && <th style={{ width: '15%' }}>Sensei Pengampu</th>}
                        <th style={{ width: isSupervisorMode ? '25%' : '30%' }}>Materi / Topik Pelajaran</th>
                        <th style={{ width: '12%' }}>Sasaran Peserta</th>
                        <th style={{ width: '6%' }}>JP</th>
                    </tr>
                </thead>
                <tbody>
                    {sessions.map((session, idx) => (
                        <tr key={session.id}>
                            <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                            <td>
                                Hari ke-{session.day_number}
                                <br />
                                <span style={{ fontSize: '9pt', color: '#555' }}>
                                    {session.raw_date}
                                </span>
                            </td>
                            <td style={{ fontFamily: 'monospace' }}>
                                {session.time_range}
                            </td>
                            <td>{session.room}</td>
                            {isSupervisorMode && (
                                <td>
                                    <strong>{session.speaker?.full_name || session.speaker?.name || '-'}</strong>
                                    {session.speaker?.dan_rank && (
                                        <div style={{ fontSize: '8pt', color: '#555' }}>
                                            {session.speaker.dan_rank}
                                        </div>
                                    )}
                                </td>
                            )}
                            <td>
                                <strong>{session.topic}</strong>
                                {session.subtopic && (
                                    <div style={{ fontSize: '9pt', color: '#444' }}>
                                        Subtopik: {session.subtopic}
                                    </div>
                                )}
                                {session.learning_module && (
                                    <div style={{ fontSize: '8pt', color: '#666', marginTop: '2px' }}>
                                        Modul: {session.learning_module.code} - {session.learning_module.title}
                                    </div>
                                )}
                            </td>
                            <td>
                                {session.track_codes && session.track_codes.length > 0
                                    ? session.track_codes.join(', ')
                                    : 'Semua Peserta'}
                            </td>
                            <td style={{ textAlign: 'center' }}>{session.duration_jp}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Official Signature Blocks */}
            <div className="mt-12 pt-6 grid grid-cols-2 gap-12 text-center text-xs">
                <div className="space-y-16">
                    <p>Mengetahui &amp; Melaksanakan,<br /><strong>Koordinator Acara / Panitia Penyelenggara</strong></p>
                    <p className="border-t border-black pt-1 font-bold inline-block min-w-[200px]">
                        ( .................................................... )
                    </p>
                </div>
                <div className="space-y-16">
                    <p>Disahkan Oleh,<br /><strong>Pengurus Besar PERKEMI / Dewan Guru</strong></p>
                    <p className="border-t border-black pt-1 font-bold inline-block min-w-[200px]">
                        ( .................................................... )
                    </p>
                </div>
            </div>
        </div>
        </>
    );
}
