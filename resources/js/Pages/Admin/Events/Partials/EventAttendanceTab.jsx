import Input from '../../../../Components/ui/Input';
import Select from '../../../../Components/ui/Select';
import { Link, router } from '@inertiajs/react';
import Button from '../../../../Components/ui/Button';
import TableSurface from '../../../../Components/admin/TableSurface';
import { Edit3, UserCheck, Trash2, ChevronLeft, ChevronRight, Search, Filter, X, Sparkles, Printer, RotateCcw } from 'lucide-react';
import { useEventShow } from './EventShowContext';

export default function EventAttendanceTab() {
    const {
        event,
        sessionsByDay,
        arrivalSession,
        participants,
        attendances,
        attendanceSessionFilter,
        setAttendanceSessionFilter,
        setIsOverrideModalOpen,
        setAttendanceResetTarget,
        setIsGenerateAttendanceModalOpen,
        isGeneratingAttendance,
        attendanceSearch,
        setAttendanceSearch,
        attendanceStatusFilter,
        setAttendanceStatusFilter,
        attendancePerPage,
        setAttendancePerPage,
        setAttendancePage,
        overrideForm,
        handleOpenEditAttendance,
        filteredAttendances,
        totalAttendancePages,
        safeAttendancePage,
        paginatedAttendances,
        attendancePageNumbers,
    } = useEventShow();

    return (
        <div className="space-y-6">
            <section className="border border-[#DCE7F3] bg-white p-5 sm:p-6" aria-labelledby="arrival-heading">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-2xl">
                        <h2 id="arrival-heading" className="font-display text-xl font-semibold text-[#0A3F82]">QR kedatangan awal event</h2>
                        <p className="mt-2 text-sm text-[#6B7C93]">Peserta memindai QR ini sekali saat pertama tiba. Setelah itu, setiap hari memiliki QR kehadiran sendiri dan setiap sesi memiliki QR masuk ruangan yang terpisah.</p>
                        {arrivalSession && <p className="mt-3 text-sm text-[#112743]">{arrivalSession.attendances_count} peserta tercatat · {arrivalSession.is_attendance_open ? 'Absensi dibuka' : 'Absensi ditutup'}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {!arrivalSession ? (
                            <Button type="button" variant="primary" onClick={() => router.post(`/admin/event/${event.id}/kehadiran-awal`)}>Siapkan QR awal</Button>
                        ) : (
                            <>
                                <Button type="button" variant="secondary" onClick={() => router.post(`/admin/event/${event.id}/sesi/${arrivalSession.id}/absensi/${arrivalSession.is_attendance_open ? 'tutup' : 'buka'}`)}>{arrivalSession.is_attendance_open ? 'Tutup absensi' : 'Buka absensi'}</Button>
                                {arrivalSession.is_attendance_open && <Link href={`/admin/event/${event.id}/sesi/${arrivalSession.id}/cetak-qr`} className="inline-flex min-h-11 items-center border border-[#0B63CE] px-4 text-sm font-semibold text-[#0A3F82] hover:bg-[#EAF5FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE]">Lihat dan cetak QR</Link>}
                            </>
                        )}
                    </div>
                </div>
            </section>
            {/* Attendance Top Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-white border border-[#DCE7F3] shadow-xs">
                    <span className="text-[11px] text-[#6B7C93] uppercase font-mono">Total Presensi</span>
                    <div className="text-xl font-bold text-[#0E2747] mt-1">{attendances.length}</div>
                    <span className="text-[10px] text-[#6B7C93]">Tercatat di server</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#DCE7F3] shadow-xs">
                    <span className="text-[11px] text-[#6B7C93] uppercase font-mono">Hadir Tepat Waktu</span>
                    <div className="text-xl font-bold text-emerald-600 mt-1">
                        {attendances.filter((a) => a.status === 'present').length}
                    </div>
                    <span className="text-[10px] text-emerald-700">Verifikasi QR / Short Code</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#DCE7F3] shadow-xs">
                    <span className="text-[11px] text-[#6B7C93] uppercase font-mono">Terlambat</span>
                    <div className="text-xl font-bold text-amber-600 mt-1">
                        {attendances.filter((a) => a.status === 'late').length}
                    </div>
                    <span className="text-[10px] text-amber-700">&gt; 30 menit dari jadwal</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#DCE7F3] shadow-xs">
                    <span className="text-[11px] text-[#6B7C93] uppercase font-mono">Override Panitia</span>
                    <div className="text-xl font-bold text-purple-600 mt-1">
                        {attendances.filter((a) => a.method === 'manual_admin').length}
                    </div>
                    <span className="text-[10px] text-purple-700">Dengan catatan audit</span>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#DCE7F3]">
                <div>
                    <h3 className="font-display font-bold text-sm text-[#0E2747]">
                        Log & Pengelolaan Kehadiran Peserta
                    </h3>
                    <p className="text-xs text-[#6B7C93]">
                        Pantau presensi QR, catat override manual, atau generate kehadiran lengkap untuk seluruh kenshi.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <Button
                        variant="secondary"
                        icon={<Trash2 className="h-4 w-4" />}
                        disabled={participants.length === 0}
                        className="border-[#DD4D7C]/40 text-[#B42355] hover:border-[#DD4D7C] hover:bg-[#FFF1F5]"
                        onClick={() => setAttendanceResetTarget('all')}
                    >
                        Reset semua hasil
                    </Button>
                    <Button
                        variant="secondary"
                        icon={<Edit3 className="w-4 h-4" />}
                        onClick={() => {
                            overrideForm.setData({
                                event_session_id: Object.values(sessionsByDay).flatMap((d) => d.sessions)[0]?.id || '',
                                participant_id: participants[0]?.participant_id || '',
                                attendance_type: 'check_in',
                                status: 'manual_override',
                                notes: '',
                            });
                            setIsOverrideModalOpen(true);
                        }}
                    >
                        Override Manual
                    </Button>
                    <a
                        href={`/admin/event/${event.id}/absensi/cetak-semua-qr`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block"
                    >
                        <Button
                            variant="secondary"
                            icon={<Printer className="w-4 h-4 text-[#0B63CE]" />}
                        >
                            Cetak Semua QR Absensi
                        </Button>
                    </a>
                    <Button
                        variant="primary"
                        icon={<Sparkles className="w-4 h-4" />}
                        disabled={participants.length === 0 || isGeneratingAttendance}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                        onClick={() => setIsGenerateAttendanceModalOpen(true)}
                    >
                        Generate Absensi Semua
                    </Button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#DCE7F3]">
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="w-4 h-4 text-[#6B7C93] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                        type="text"
                        aria-label="Cari absensi peserta"
                        value={attendanceSearch}
                        onChange={(e) => {
                            setAttendanceSearch(e.target.value);
                            setAttendancePage(1);
                        }}
                        placeholder="Cari absensi (nama kenshi, topik sesi, dicatat oleh)..."
                        className="w-full pl-9 pr-8 py-2 border border-[#DCE7F3] rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#0B63CE] text-[#0E2747]"
                    />
                    {attendanceSearch && (
                        <button
                            type="button"
                            onClick={() => {
                                setAttendanceSearch('');
                                setAttendancePage(1);
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7C93] hover:text-[#0E2747]"
                            aria-label="Hapus pencarian"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-[#6B7C93] font-medium">Sesi:</span>
                        <Select
                            placeholder=""
                            aria-label="Filter sesi absensi"
                            value={attendanceSessionFilter}
                            onChange={(e) => {
                                setAttendanceSessionFilter(e.target.value);
                                setAttendancePage(1);
                            }}
                            className="border border-[#DCE7F3] rounded-lg px-2.5 py-1.5 text-xs bg-white text-[#0E2747] focus:outline-none focus:ring-2 focus:ring-[#0B63CE] max-w-[200px] truncate"
                        >
                            <option value="all">Semua Sesi ({attendances.length})</option>
                            {arrivalSession && <option value={arrivalSession.id}>Kedatangan awal</option>}
                            {Object.values(sessionsByDay).flatMap((d) => d.sessions).map((s) => (
                                <option key={s.id} value={s.id}>
                                    H{s.day_number} - {s.session_number}: {s.topic}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-[#6B7C93] font-medium">Status:</span>
                        <Select
                            placeholder=""
                            aria-label="Filter status absensi"
                            value={attendanceStatusFilter}
                            onChange={(e) => {
                                setAttendanceStatusFilter(e.target.value);
                                setAttendancePage(1);
                            }}
                            className="border border-[#DCE7F3] rounded-lg px-2.5 py-1.5 text-xs bg-white text-[#0E2747] focus:outline-none focus:ring-2 focus:ring-[#0B63CE]"
                        >
                            <option value="all">Semua Status</option>
                            <option value="present">Hadir</option>
                            <option value="late">Terlambat</option>
                            <option value="manual_override">Manual Override</option>
                        </Select>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-[#6B7C93] font-medium">Baris:</span>
                        <Select
                            placeholder=""
                            aria-label="Jumlah absensi per halaman"
                            value={attendancePerPage}
                            onChange={(e) => {
                                setAttendancePerPage(e.target.value === 'all' ? 'all' : Number(e.target.value));
                                setAttendancePage(1);
                            }}
                            className="border border-[#DCE7F3] rounded-lg px-2.5 py-1.5 text-xs bg-white text-[#0E2747] focus:outline-none focus:ring-2 focus:ring-[#0B63CE]"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value="all">Semua</option>
                        </Select>
                    </div>

                    {(attendanceSearch || attendanceSessionFilter !== 'all' || attendanceStatusFilter !== 'all') && (
                        <button
                            type="button"
                            onClick={() => {
                                setAttendanceSearch('');
                                setAttendanceSessionFilter('all');
                                setAttendanceStatusFilter('all');
                                setAttendancePage(1);
                            }}
                            className="inline-flex items-center gap-1 text-xs text-[#B42355] hover:text-[#DD4D7C] px-2 py-1.5 rounded hover:bg-[#FFF1F5]"
                        >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Attendance Log Table */}
            <div className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs overflow-hidden">
                <TableSurface className="shadow-none">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b border-[#DCE7F3] bg-slate-50 text-[#0E2747] font-semibold text-[11px] uppercase tracking-wider">
                                <th className="px-4 py-3">Nama Kenshi</th>
                                <th className="px-4 py-3">Sesi Rundown</th>
                                <th className="px-4 py-3">Jenis Absensi</th>
                                <th className="px-4 py-3">Status Kehadiran</th>
                                <th className="px-4 py-3">Waktu Pencatatan</th>
                                <th className="px-4 py-3">Metode</th>
                                <th className="px-4 py-3">Dicatat Oleh / Alasan</th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DCE7F3]/60">
                            {paginatedAttendances.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-10 text-xs text-[#6B7C93]">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <UserCheck className="w-8 h-8 text-slate-300" />
                                            <p className="font-medium text-[#112743]">Belum ada catatan absensi</p>
                                            <p className="text-[11px] text-[#6B7C93]">
                                                {attendanceSearch || attendanceSessionFilter !== 'all' || attendanceStatusFilter !== 'all'
                                                    ? 'Coba sesuaikan kata kunci pencarian atau filter yang dipilih.'
                                                    : 'Gunakan tombol "Generate Absensi Semua" untuk mencatat kehadiran seluruh peserta secara otomatis.'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedAttendances.map((att) => (
                                    <tr key={att.id} className="hover:bg-[#F8FBFF] transition-colors">
                                        <td className="px-4 py-3 font-bold text-[#0E2747]">
                                            {att.participant_name}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-[#112743]">{att.session_topic}</div>
                                            <div className="text-[10px] text-[#6B7C93]">Hari {att.day_number} • {att.session_number}</div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-[11px] text-[#0A3F82]">
                                            {att.attendance_type === 'check_in' ? 'Masuk' : 'Keluar'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${att.status_badge}`}>
                                                {att.status_label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-[11px] text-[#6B7C93]">
                                            {att.checked_in_at || '-'}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-[11px]">
                                            {att.method === 'qr_scan' ? 'Scan QR' : att.method === 'short_code' ? 'Kode Sesi' : att.method === 'portal_direct' ? 'Portal Ruang Belajar' : 'Manual Admin'}
                                        </td>
                                        <td className="px-4 py-3 text-[11px] text-[#6B7C93]">
                                            <div>Oleh: <strong className="text-[#112743]">{att.recorded_by}</strong></div>
                                            {att.notes && <div className="italic mt-0.5 text-[10px] text-[#6B7C93]">{att.notes}</div>}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    type="button"
                                                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[#0B63CE] transition-colors hover:bg-[#EFF6FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] sm:min-h-9 sm:min-w-9"
                                                    aria-label={`Edit absensi ${att.participant_name}`}
                                                    title="Edit absensi peserta ini"
                                                    onClick={() => handleOpenEditAttendance(att)}
                                                >
                                                    <Edit3 className="h-4 w-4" aria-hidden="true" />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[#B42355] transition-colors hover:bg-[#FFF1F5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] sm:min-h-9 sm:min-w-9"
                                                    aria-label={`Reset seluruh hasil ${att.participant_name}`}
                                                    title="Reset seluruh hasil peserta ini"
                                                    onClick={() => setAttendanceResetTarget(att)}
                                                >
                                                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </TableSurface>

                {/* Table Pagination Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-[#DCE7F3] bg-[#F8FBFF]/60 text-xs text-[#6B7C93]">
                    <div>
                        Menampilkan{' '}
                        <span className="font-semibold text-[#112743]">
                            {filteredAttendances.length > 0
                                ? (attendancePerPage === 'all' ? 1 : (safeAttendancePage - 1) * Number(attendancePerPage) + 1)
                                : 0}
                        </span>
                        –
                        <span className="font-semibold text-[#112743]">
                            {attendancePerPage === 'all'
                                ? filteredAttendances.length
                                : Math.min(safeAttendancePage * Number(attendancePerPage), filteredAttendances.length)}
                        </span>{' '}
                        dari <span className="font-semibold text-[#112743]">{filteredAttendances.length}</span> absensi
                        {filteredAttendances.length !== (attendances?.length || 0) && (
                            <span className="ml-1 text-[#6B7C93]">
                                (total {attendances?.length || 0} catatan)
                            </span>
                        )}
                    </div>

                    {totalAttendancePages > 1 && (
                        <div className="flex items-center gap-1.5 select-none">
                            <button
                                type="button"
                                disabled={safeAttendancePage <= 1}
                                onClick={() => setAttendancePage((p) => Math.max(1, p - 1))}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium border transition-colors ${
                                    safeAttendancePage <= 1
                                        ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed'
                                        : 'border-[#DCE7F3] text-[#0E2747] bg-white hover:bg-[#F8FBFF] hover:border-[#0B63CE]/40 active:bg-slate-100'
                                }`}
                                aria-label="Halaman sebelumnya"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Sebelumnya</span>
                            </button>

                            <div className="flex items-center gap-1">
                                {attendancePageNumbers.map((p, idx) =>
                                    p === '...' ? (
                                        <span key={`ellipsis-${idx}`} className="px-1.5 text-slate-400">
                                            ...
                                        </span>
                                    ) : (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setAttendancePage(p)}
                                            className={`min-w-8 h-8 px-2 rounded text-xs font-semibold transition-colors ${
                                                safeAttendancePage === p
                                                    ? 'bg-[#0B63CE] text-white shadow-xs'
                                                    : 'bg-white border border-[#DCE7F3] text-[#0E2747] hover:bg-slate-50'
                                            }`}
                                            aria-current={safeAttendancePage === p ? 'page' : undefined}
                                        >
                                            {p}
                                        </button>
                                    )
                                )}
                            </div>

                            <button
                                type="button"
                                disabled={safeAttendancePage >= totalAttendancePages}
                                onClick={() => setAttendancePage((p) => Math.min(totalAttendancePages, p + 1))}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium border transition-colors ${
                                    safeAttendancePage >= totalAttendancePages
                                        ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed'
                                        : 'border-[#DCE7F3] text-[#0E2747] bg-white hover:bg-[#F8FBFF] hover:border-[#0B63CE]/40 active:bg-slate-100'
                                }`}
                                aria-label="Halaman berikutnya"
                            >
                                <span className="hidden sm:inline">Berikutnya</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
