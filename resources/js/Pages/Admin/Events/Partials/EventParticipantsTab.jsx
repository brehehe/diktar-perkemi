import Select from '../../../../Components/ui/Select';
import Button from '../../../../Components/ui/Button';
import FormField from '../../../../Components/ui/FormField';
import Input from '../../../../Components/ui/Input';
import TableSurface from '../../../../Components/admin/TableSurface';
import { Users, Edit3, Plus, Trash2, ChevronLeft, ChevronRight, Search, Filter, Check, X, RotateCcw, FileSpreadsheet, CreditCard } from 'lucide-react';
import { useEventShow } from './EventShowContext';

export default function EventParticipantsTab() {
    const {
        event,
        participants,
        tracks,
        participantSearch,
        setParticipantSearch,
        participantTrackFilter,
        setParticipantTrackFilter,
        participantCheckinFilter,
        setParticipantCheckinFilter,
        participantPerPage,
        setParticipantPerPage,
        setParticipantPage,
        trackForm,
        setIsAddParticipantModalOpen,
        setAttendanceResetTarget,
        handleRemoveParticipant,
        openEditParticipantModal,
        availableTrackOptions,
        filteredParticipants,
        totalParticipantPages,
        safeParticipantPage,
        paginatedParticipants,
        participantPageNumbers,
    } = useEventShow();

    return (
        <div className="space-y-6">
            <section className="rounded-xl border border-[#DCE7F3] bg-white p-4 sm:p-5" aria-labelledby="event-tracks-heading">
                <h3 id="event-tracks-heading" className="font-display text-base font-semibold text-[#0A3F82]">Jalur peserta event</h3>
                <p className="mt-1 text-sm text-[#6B7C93]">Jalur master tersedia bersama jalur yang dibuat khusus untuk event ini.</p>
                {tracks.some((track) => track.event_id === event.id) && (
                    <ul className="mt-4 flex flex-wrap gap-2" aria-label="Jalur khusus event">
                        {tracks.filter((track) => track.event_id === event.id).map((track) => (
                            <li key={track.id} className="rounded border border-[#DCE7F3] bg-[#F8FBFF] px-3 py-2 text-sm text-[#112743]">
                                <strong className="text-[#0A3F82]">{track.code}</strong> · {track.name}
                            </li>
                        ))}
                    </ul>
                )}
                <form className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)_auto] sm:items-end" onSubmit={(e) => {
                    e.preventDefault();
                    trackForm.post(`/admin/event/${event.id}/jalur`, { onSuccess: () => trackForm.reset() });
                }}>
                    <FormField label="Kode jalur" error={trackForm.errors.code} required>
                        <Input value={trackForm.data.code} maxLength={20} onChange={(e) => trackForm.setData('code', e.target.value)} required />
                    </FormField>
                    <FormField label="Nama jalur" error={trackForm.errors.name} required>
                        <Input value={trackForm.data.name} maxLength={255} onChange={(e) => trackForm.setData('name', e.target.value)} required />
                    </FormField>
                    <Button type="submit" variant="primary" disabled={trackForm.processing}>Tambah jalur</Button>
                </form>
            </section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#DCE7F3]">
                <div>
                    <h3 className="font-display font-bold text-sm text-[#0E2747]">
                        Daftar Kenshi Peserta Event
                    </h3>
                    <p className="text-xs text-[#6B7C93]">
                        Kelola penempatan jalur, kelompok rotasi kelas ganda (A1/A2), verifikasi dokumen, dan kehadiran.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <a
                        href={`/admin/event/${event.id}/peserta/export-excel`}
                        download
                        className="inline-block"
                    >
                        <Button
                            variant="secondary"
                            icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
                        >
                            Export Excel (Data & Login)
                        </Button>
                    </a>
                    <a
                        href={`/admin/event/${event.id}/id-card-semua`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button
                            variant="secondary"
                            icon={<CreditCard className="w-4 h-4" />}
                            disabled={participants.length === 0}
                            title="Cetak kartu tanda peserta (ID Card) resmi seluruh peserta"
                        >
                            Cetak Semua ID Card
                        </Button>
                    </a>
                    <Button
                        variant="danger"
                        icon={<Trash2 className="w-4 h-4" />}
                        disabled={participants.length === 0}
                        onClick={() => setAttendanceResetTarget('all')}
                        title="Reset seluruh hasil presensi, ujian, sertifikat, dan transkrip semua peserta"
                    >
                        Reset Seluruh Hasil Peserta
                    </Button>
                    <Button
                        variant="primary"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() => setIsAddParticipantModalOpen(true)}
                    >
                        Daftarkan Peserta ke Event
                    </Button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#DCE7F3]">
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="w-4 h-4 text-[#6B7C93] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                        type="text"
                        aria-label="Cari peserta event"
                        value={participantSearch}
                        onChange={(e) => {
                            setParticipantSearch(e.target.value);
                            setParticipantPage(1);
                        }}
                        placeholder="Cari kenshi (nama, nomor kenshi, asal dojo, jalur)..."
                        className="w-full pl-9 pr-8 py-2 border border-[#DCE7F3] rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#0B63CE] text-[#0E2747]"
                    />
                    {participantSearch && (
                        <button
                            type="button"
                            onClick={() => {
                                setParticipantSearch('');
                                setParticipantPage(1);
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
                        <span className="text-xs text-[#6B7C93] font-medium">Jalur:</span>
                        <Select
                            placeholder=""
                            aria-label="Filter jalur peserta"
                            value={participantTrackFilter}
                            onChange={(e) => {
                                setParticipantTrackFilter(e.target.value);
                                setParticipantPage(1);
                            }}
                            className="border border-[#DCE7F3] rounded-lg px-2.5 py-1.5 text-xs bg-white text-[#0E2747] focus:outline-none focus:ring-2 focus:ring-[#0B63CE]"
                        >
                            <option value="all">Semua Jalur</option>
                            {availableTrackOptions.map((code) => (
                                <option key={code} value={code}>{code}</option>
                            ))}
                        </Select>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-[#6B7C93] font-medium">Status:</span>
                        <Select
                            placeholder=""
                            aria-label="Filter status presensi"
                            value={participantCheckinFilter}
                            onChange={(e) => {
                                setParticipantCheckinFilter(e.target.value);
                                setParticipantPage(1);
                            }}
                            className="border border-[#DCE7F3] rounded-lg px-2.5 py-1.5 text-xs bg-white text-[#0E2747] focus:outline-none focus:ring-2 focus:ring-[#0B63CE]"
                        >
                            <option value="all">Semua Presensi</option>
                            <option value="checked_in">Sudah Check-in</option>
                            <option value="not_checked_in">Belum Check-in</option>
                        </Select>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-[#6B7C93] font-medium">Baris:</span>
                        <Select
                            placeholder=""
                            aria-label="Jumlah peserta per halaman"
                            value={participantPerPage}
                            onChange={(e) => {
                                setParticipantPerPage(e.target.value === 'all' ? 'all' : Number(e.target.value));
                                setParticipantPage(1);
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

                    {(participantSearch || participantTrackFilter !== 'all' || participantCheckinFilter !== 'all') && (
                        <button
                            type="button"
                            onClick={() => {
                                setParticipantSearch('');
                                setParticipantTrackFilter('all');
                                setParticipantCheckinFilter('all');
                                setParticipantPage(1);
                            }}
                            className="inline-flex items-center gap-1 text-xs text-[#B42355] hover:text-[#DD4D7C] px-2 py-1.5 rounded hover:bg-[#FFF1F5]"
                        >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs overflow-hidden">
                <TableSurface className="shadow-none">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b border-[#DCE7F3] bg-slate-50 text-[#0E2747] font-semibold text-[11px] uppercase tracking-wider">
                                <th className="px-4 py-3">Nama Kenshi</th>
                                <th className="px-4 py-3">Jalur & Rotasi</th>
                                <th className="px-4 py-3">DAN & Asal Dojo</th>
                                <th className="px-4 py-3">Status Check-in</th>
                                <th className="px-4 py-3">Administrasi</th>
                                <th className="px-4 py-3">Nilai Teori</th>
                                <th className="px-4 py-3">Nilai Praktik</th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DCE7F3]/60">
                            {paginatedParticipants.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-xs text-[#6B7C93]">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Users className="w-8 h-8 text-slate-300" />
                                            <p className="font-medium text-[#112743]">Tidak ada data peserta</p>
                                            <p className="text-[11px] text-[#6B7C93]">
                                                {participantSearch || participantTrackFilter !== 'all' || participantCheckinFilter !== 'all'
                                                    ? 'Coba sesuaikan kata kunci pencarian atau filter yang dipilih.'
                                                    : 'Belum ada peserta yang terdaftar pada event ini.'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedParticipants.map((p) => (
                                    <tr key={p.id} className="hover:bg-[#F8FBFF] transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-[#EAF5FF] border border-[#0B63CE]/30 flex items-center justify-center text-[#0B63CE] font-bold text-xs shrink-0 overflow-hidden shadow-xs">
                                                    {p.photo_url ? (
                                                        <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        p.name?.substring(0, 2).toUpperCase() || 'KS'
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-[#0E2747]">{p.name}</div>
                                                    <div className="text-[11px] font-mono text-[#6B7C93]">{p.kenshi_id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.track_badge}`}>
                                                {p.track_code}
                                            </span>
                                            <span className="text-[11px] text-[#6B7C93] block mt-0.5">
                                                Kelompok {p.rotation_group || 'belum ditetapkan'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="font-medium text-[#112743]">{p.dan_roman}</div>
                                            <div className="text-[10px] text-[#6B7C93]">{p.origin}</div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {p.checked_in_at ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                    <Check className="w-3 h-3" />
                                                    <span>{p.checked_in_at}</span>
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                                    Belum Check-in
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                p.admin_status === 'verified'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {p.admin_status === 'verified' ? 'Terverifikasi' : p.admin_status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-mono font-bold text-[#0E2747]">
                                            {p.theory_score ?? '-'}
                                        </td>
                                        <td className="px-4 py-3 font-mono font-bold text-[#0E2747]">
                                            {p.practice_score ?? '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1">
                                                <a
                                                    href={`/admin/event/${event.id}/peserta/${p.id}/id-card`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex min-h-11 min-w-11 items-center justify-center text-[#6B7C93] hover:bg-[#EAF5FF] hover:text-[#0B63CE] focus-visible:outline-2 focus-visible:outline-[#0B63CE]"
                                                    aria-label={`ID Card peserta ${p.name}`}
                                                    title={`Cetak ID Card ${p.name}`}
                                                >
                                                    <CreditCard className="w-3.5 h-3.5" />
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => openEditParticipantModal(p)}
                                                    className="inline-flex min-h-11 min-w-11 items-center justify-center text-[#6B7C93] hover:bg-[#EAF5FF] hover:text-[#0B63CE] focus-visible:outline-2 focus-visible:outline-[#0B63CE]"
                                                    aria-label={`Edit peserta ${p.name}`}
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setAttendanceResetTarget({
                                                        id: p.id,
                                                        scope: 'participant',
                                                        participant_name: p.name,
                                                    })}
                                                    className="inline-flex min-h-11 min-w-11 items-center justify-center text-[#B42355] hover:bg-[#FFF1F5] focus-visible:outline-2 focus-visible:outline-[#0B63CE]"
                                                    aria-label={`Reset seluruh hasil ${p.name}`}
                                                    title="Reset presensi, nilai, ujian, revisi, serta dokumen kelulusan"
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveParticipant(p)}
                                                    className="inline-flex min-h-11 min-w-11 items-center justify-center text-[#6B7C93] hover:bg-[#FDE8EF] hover:text-[#DD4D7C] focus-visible:outline-2 focus-visible:outline-[#0B63CE]"
                                                    aria-label={`Keluarkan peserta ${p.name}`}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
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
                            {filteredParticipants.length > 0
                                ? (participantPerPage === 'all' ? 1 : (safeParticipantPage - 1) * Number(participantPerPage) + 1)
                                : 0}
                        </span>
                        –
                        <span className="font-semibold text-[#112743]">
                            {participantPerPage === 'all'
                                ? filteredParticipants.length
                                : Math.min(safeParticipantPage * Number(participantPerPage), filteredParticipants.length)}
                        </span>{' '}
                        dari <span className="font-semibold text-[#112743]">{filteredParticipants.length}</span> peserta
                        {filteredParticipants.length !== (participants?.length || 0) && (
                            <span className="ml-1 text-[#6B7C93]">
                                (total {participants?.length || 0} kenshi)
                            </span>
                        )}
                    </div>

                    {totalParticipantPages > 1 && (
                        <div className="flex items-center gap-1.5 select-none">
                            <button
                                type="button"
                                disabled={safeParticipantPage <= 1}
                                onClick={() => setParticipantPage((p) => Math.max(1, p - 1))}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium border transition-colors ${
                                    safeParticipantPage <= 1
                                        ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed'
                                        : 'border-[#DCE7F3] text-[#0E2747] bg-white hover:bg-[#F8FBFF] hover:border-[#0B63CE]/40 active:bg-slate-100'
                                }`}
                                aria-label="Halaman sebelumnya"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Sebelumnya</span>
                            </button>

                            <div className="flex items-center gap-1">
                                {participantPageNumbers.map((p, idx) =>
                                    p === '...' ? (
                                        <span key={`ellipsis-${idx}`} className="px-1.5 text-slate-400">
                                            ...
                                        </span>
                                    ) : (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setParticipantPage(p)}
                                            className={`min-w-8 h-8 px-2 rounded text-xs font-semibold transition-colors ${
                                                safeParticipantPage === p
                                                    ? 'bg-[#0B63CE] text-white shadow-xs'
                                                    : 'bg-white border border-[#DCE7F3] text-[#0E2747] hover:bg-slate-50'
                                            }`}
                                            aria-current={safeParticipantPage === p ? 'page' : undefined}
                                        >
                                            {p}
                                        </button>
                                    )
                                )}
                            </div>

                            <button
                                type="button"
                                disabled={safeParticipantPage >= totalParticipantPages}
                                onClick={() => setParticipantPage((p) => Math.min(totalParticipantPages, p + 1))}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium border transition-colors ${
                                    safeParticipantPage >= totalParticipantPages
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
