import TableSurface from '@/Components/admin/TableSurface';
import { Clock, Edit3, Trash2, QrCode, Unlock, Lock, BookOpen, PlayCircle, Filter } from 'lucide-react';
import { useRundown } from './RundownContext';

export default function RundownSessionsTable() {
    const {
        event,
        tracks,
        selectedDay,
        rundownTrackFilter,
        setRundownTrackFilter,
        activeDayData,
        openEditSessionModal,
        handleDeleteSession,
        handleOpenAttendance,
        handleCloseAttendance,
        openRescheduleModal,
        filteredDaySessions,
    } = useRundown();

    return (
        <>
            {/* 3. Sessions Table */}
            <div className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-[#DCE7F3] bg-[#F8FBFF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h3 className="font-display font-bold text-sm text-[#0E2747]">
                            Jadwal & Rundown Hari {selectedDay}
                        </h3>
                        <span className="text-xs font-medium text-[#6B7C93]">
                            Total Sesi: {activeDayData.sessions.length} • Total JP:{' '}
                            <strong className="text-[#0B63CE]">
                                {activeDayData.sessions.reduce((acc, s) => acc + (s.duration_jp || 0), 0)} JP
                            </strong>
                            {rundownTrackFilter !== 'all' && (
                                <span className="ml-2 text-amber-700 font-medium">
                                    (Menampilkan {filteredDaySessions.length} sesi untuk jalur {rundownTrackFilter})
                                </span>
                            )}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#0E2747] whitespace-nowrap">Filter Jalur Peserta:</span>
                        <select
                            value={rundownTrackFilter}
                            onChange={(e) => setRundownTrackFilter(e.target.value)}
                            className="text-xs font-medium border border-[#DCE7F3] rounded-lg px-2.5 py-1.5 bg-white text-[#112743] focus:outline-none focus:ring-1 focus:ring-[#0B63CE]"
                        >
                            <option value="all">Semua Jalur (Tampilkan Semua)</option>
                            {tracks.map((t) => (
                                <option key={t.id || t.code} value={t.code}>
                                    {t.code} — {t.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <TableSurface className="shadow-none">
                    <table className="min-w-[1050px] w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b border-[#DCE7F3] bg-slate-50 text-[#0E2747] font-semibold text-[11px] uppercase tracking-wider">
                                <th className="px-4 py-3">Waktu & Sesi</th>
                                <th className="px-4 py-3">Jenis Sesi & Jalur</th>
                                <th className="px-4 py-3">Topik & Integrasi</th>
                                <th className="px-4 py-3">Pemateri / Pengawas</th>
                                <th className="px-4 py-3">Ruang</th>
                                <th className="px-4 py-3">Status Absensi</th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DCE7F3]/60">
                            {filteredDaySessions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-xs text-[#6B7C93]">
                                        {rundownTrackFilter !== 'all'
                                            ? `Tidak ada sesi rundown untuk jalur ${rundownTrackFilter} pada Hari ${selectedDay}.`
                                            : `Belum ada jadwal sesi untuk Hari ${selectedDay}. Klik tombol di atas untuk menambahkan.`}
                                    </td>
                                </tr>
                            ) : (
                                filteredDaySessions.map((s) => (
                                    <tr key={s.id} className="hover:bg-[#F8FBFF] transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="font-mono font-bold text-[#0B63CE]">{s.time_slot}</div>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="text-[11px] text-[#6B7C93]">{s.session_number} ({s.duration_jp} JP)</span>
                                                {s.status === 'delayed' && (
                                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                                        Molor
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex flex-wrap items-center gap-1">
                                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${s.session_type?.badge_color || 'bg-slate-100 text-slate-700'}`}>
                                                    {s.session_type?.name || 'Sesi'}
                                                </span>
                                                {(() => {
                                                    const sTracks = s.target_tracks || s.track_codes || [];
                                                    if (!sTracks || sTracks.length === 0 || sTracks.length >= 6) {
                                                        return (
                                                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                                                                Semua Jalur
                                                            </span>
                                                        );
                                                    }
                                                    return sTracks.map((tc) => (
                                                        <span
                                                            key={tc}
                                                            className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200"
                                                        >
                                                            {tc}
                                                        </span>
                                                    ));
                                                })()}
                                            </div>
                                            <div className="text-[10px] text-[#6B7C93] mt-0.5">{s.method}</div>
                                        </td>
                                        <td className="px-4 py-3 min-w-[220px]">
                                            <div className="font-semibold text-[#0E2747]">{s.topic}</div>
                                            {s.subtopic && <div className="text-[11px] text-[#6B7C93] mt-0.5 line-clamp-1">{s.subtopic}</div>}

                                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                                {s.material_title && (
                                                    <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                                                        <BookOpen className="w-3 h-3" />
                                                        <span>Buku: {s.material_title}</span>
                                                    </span>
                                                )}
                                                {s.event_module_title && <span className="inline-flex items-center bg-[#EAF5FF] px-2 py-0.5 text-[10px] font-medium text-[#0A3F82]">Modul: {s.event_module_title}</span>}
                                                {s.cbt_package_title && (
                                                    <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-purple-50 text-purple-800 px-2 py-0.5 rounded border border-purple-200">
                                                        <PlayCircle className="w-3 h-3" />
                                                        <span>CBT: {s.cbt_package_code}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {s.speaker ? (
                                                <div>
                                                    <div className="font-medium text-[#112743]">{s.speaker.name}</div>
                                                    <div className="text-[10px] text-[#6B7C93]">{s.speaker.role_info}</div>
                                                </div>
                                            ) : (
                                                <span className="text-[#6B7C93] italic">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap font-medium text-[#112743]">
                                            {s.room || '-'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="space-y-1.5">
                                                {s.is_attendance_open ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                            <Unlock className="w-3 h-3" />
                                                            <span>Dibuka ({s.qr_short_code})</span>
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCloseAttendance(s)}
                                                            className="text-[10px] text-rose-600 hover:underline font-semibold"
                                                        >
                                                            Tutup
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                                                            <Lock className="w-3 h-3" />
                                                            <span>Tutup</span>
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenAttendance(s)}
                                                            className="text-[10px] text-[#0B63CE] hover:underline font-bold"
                                                        >
                                                            Buka
                                                        </button>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5">
                                                    {s.attendance_setting === 'check_in_out' ? (
                                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                                            Masuk & Keluar
                                                        </span>
                                                    ) : s.attendance_setting === 'check_in' ? (
                                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                                            Masuk Saja
                                                        </span>
                                                    ) : (
                                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-normal bg-slate-100 text-slate-500 border border-slate-200">
                                                            Tidak Diperlukan
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-[#6B7C93] flex items-center gap-2">
                                                    <span>Hadir: <strong>{s.attendances_count}</strong></span>
                                                    {s.is_attendance_open && (
                                                        <>
                                                            <span>•</span>
                                                            <a
                                                                href={`/admin/event/${event.id}/sesi/${s.id}/cetak-qr`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 font-bold text-xs text-[#0B63CE] bg-[#EAF5FF] hover:bg-[#D5EBFF] border border-[#B8D7FF] px-2 py-0.5 rounded transition-colors shadow-2xs"
                                                                title="Cetak lembar QR absensi sesi ini"
                                                            >
                                                                <QrCode className="w-3.5 h-3.5" />
                                                                <span>Cetak QR</span>
                                                            </a>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {s.is_attendance_open && (
                                                    <a
                                                        href={`/admin/event/${event.id}/sesi/${s.id}/cetak-qr`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 text-[#0B63CE] hover:bg-[#EAF5FF] rounded transition-colors border border-transparent hover:border-[#B8D7FF]"
                                                        title={`Cetak QR Code Sesi ${s.session_number || s.id}`}
                                                        aria-label={`Cetak QR Code sesi ${s.topic}`}
                                                    >
                                                        <QrCode className="w-4 h-4" />
                                                    </a>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => openRescheduleModal(s)}
                                                    className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded transition-colors border border-transparent hover:border-amber-200"
                                                    title="Sesuaikan Jadwal & Pindah Sesi (Hari / Jam)"
                                                    aria-label={`Sesuaikan jadwal sesi ${s.topic}`}
                                                >
                                                    <Clock className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => openEditSessionModal(s)}
                                                    className="p-1.5 text-[#6B7C93] hover:text-[#0B63CE] hover:bg-slate-100 rounded transition-colors"
                                                    title="Edit Detail Sesi Lengkap"
                                                    aria-label={`Edit sesi ${s.topic}`}
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteSession(s)}
                                                    className="p-1.5 text-[#6B7C93] hover:text-[#DD4D7C] hover:bg-rose-50 rounded transition-colors"
                                                    title="Hapus Sesi"
                                                    aria-label={`Hapus sesi ${s.topic}`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </TableSurface>
            </div>
        </>
    );
}
