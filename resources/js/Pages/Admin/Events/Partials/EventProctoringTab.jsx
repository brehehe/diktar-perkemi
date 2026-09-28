import Badge from '../../../../Components/ui/Badge';
import TableSurface from '../../../../Components/admin/TableSurface';
import { useEventShow } from './EventShowContext';

export default function EventProctoringTab() {
    const {
        event,
        proctoringEvents,
    } = useEventShow();

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 rounded-xl border border-[#DCE7F3] bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="font-display text-xl font-semibold text-[#0A3F82]">Pengawasan Ujian CBT</h2>
                    <p className="mt-1 text-xs leading-relaxed text-[#6B7C93]">
                        Riwayat status kamera dan perpindahan fokus peserta selama percobaan ujian berlangsung.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="warning" dot>{proctoringEvents.filter((item) => item.severity === 'warning').length} peringatan</Badge>
                    <Badge variant="danger" dot>{proctoringEvents.filter((item) => item.severity === 'critical').length} kritis</Badge>
                </div>
            </div>

            <TableSurface ariaLabel="Riwayat pengawasan CBT">
                <table className="min-w-[780px]">
                    <thead>
                        <tr>
                            <th>Waktu</th>
                            <th>Peserta</th>
                            <th>Paket & Percobaan</th>
                            <th>Kejadian</th>
                            <th>Tingkat</th>
                        </tr>
                    </thead>
                    <tbody>
                        {proctoringEvents.map((item) => (
                            <tr key={item.id}>
                                <td className="whitespace-nowrap font-mono text-[11px] text-[#6B7C93]">{item.occurred_at}</td>
                                <td className="font-semibold text-[#0E2747]">{item.participant_name}</td>
                                <td>
                                    <span className="block font-semibold text-[#112743]">{item.package_title || 'Paket CBT'}</span>
                                    <span className="font-mono text-[10px] text-[#6B7C93]">{item.package_code || '-'} • Percobaan {item.attempt_number || '-'}</span>
                                </td>
                                <td>{item.type_label}</td>
                                <td>
                                    <Badge
                                        variant={item.severity === 'critical' ? 'danger' : item.severity === 'warning' ? 'warning' : 'primary'}
                                        dot
                                    >
                                        {item.severity === 'critical' ? 'Kritis' : item.severity === 'warning' ? 'Peringatan' : 'Informasi'}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                        {proctoringEvents.length === 0 && (
                            <tr>
                                <td colSpan="5" className="py-10 text-center text-sm text-[#6B7C93]">
                                    Belum ada kejadian pengawasan CBT pada event ini.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </TableSurface>
        </div>
    );
}
