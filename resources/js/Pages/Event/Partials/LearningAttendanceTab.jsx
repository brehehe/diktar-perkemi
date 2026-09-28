import { useLearningRoom } from './LearningRoomContext';

export default function LearningAttendanceTab() {
    const {
        attendanceRecords,
    } = useLearningRoom();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-[#0E2747]">
                    Riwayat Presensi Sesi Penataran
                </h3>
                <span className="text-xs font-mono text-[#0B63CE] font-bold">
                    {attendanceRecords.length} Sesi Tercatat
                </span>
            </div>

            <div className="bg-white rounded-2xl border border-[#DCE7F3] shadow-xs overflow-hidden">
                {attendanceRecords.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#6B7C93]">
                        Belum ada catatan kehadiran sesi. Silakan scan QR code saat sesi rundown dibuka.
                    </div>
                ) : (
                    <div className="divide-y divide-[#DCE7F3]/60">
                        {attendanceRecords.map((att) => (
                            <div key={att.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                                <div className="space-y-0.5">
                                    <div className="font-bold text-[#0E2747]">
                                        {att.session_name}
                                    </div>
                                    <div className="text-[11px] text-[#6B7C93]">
                                        {att.time} • Metode: {att.method === 'qr_scan' ? 'Scan QR' : att.method === 'portal_direct' ? 'Absen Langsung (Portal)' : 'Kode Manual'}
                                    </div>
                                </div>

                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${att.status_badge}`}>
                                    {att.status_label}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
