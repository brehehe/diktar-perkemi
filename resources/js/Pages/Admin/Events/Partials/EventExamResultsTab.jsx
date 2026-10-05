import TableSurface from '../../../../Components/admin/TableSurface';
import Input from '../../../../Components/ui/Input';
import Select from '../../../../Components/ui/Select';
import Button from '../../../../Components/ui/Button';
import CbtCompletionRekapTab from './CbtCompletionRekapTab';
import { Clock, Users, FileCheck, FileSpreadsheet, Trash2, ChevronLeft, ChevronRight, Search, Filter, Eye, X, CheckCircle2, RotateCcw } from 'lucide-react';
import { useEventShow } from './EventShowContext';

export default function EventExamResultsTab() {
    const {
        event,
        tracks,
        stats,
        examAttempts,
        cbtCompletionMatrix,
        cbtCompletionStats,
        cbtSubTab,
        setCbtSubTab,
        examSearch,
        setExamSearch,
        examPackageFilter,
        setExamPackageFilter,
        examTrackFilter,
        setExamTrackFilter,
        examStatusFilter,
        setExamStatusFilter,
        examPage,
        setExamPage,
        examPerPage,
        setExamPerPage,
        filteredExamAttempts,
        totalExamPages,
        paginatedExamAttempts,
        uniqueExamPackages,
        uniqueExamTracks,
        handleOpenAttemptDetail,
        setRestartExamTarget,
        setCompleteExamTarget,
        setDeleteExamTarget,
    } = useEventShow();

    const completedExamAttempts = (examAttempts || []).filter((attempt) => attempt.is_terminal);
    const passedExamAttempts = completedExamAttempts.filter((attempt) => attempt.is_passed);

    return (
        <div className="space-y-6">
            {/* Sub-tab view switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#DCE7F3] pb-4">
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setCbtSubTab('rekap')}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                            cbtSubTab === 'rekap'
                                ? 'bg-[#0B63CE] text-white shadow-xs'
                                : 'bg-white text-[#4A617C] hover:bg-[#F0F5FA] border border-[#DCE7F3]'
                        }`}
                    >
                        <Users className="h-4 w-4" />
                        <span>Rekap Kelengkapan Peserta</span>
                        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                            cbtSubTab === 'rekap' ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#4A617C]'
                        }`}>
                            {cbtCompletionStats?.total_participants ?? (cbtCompletionMatrix?.length || 0)}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setCbtSubTab('riwayat')}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                            cbtSubTab === 'riwayat'
                                ? 'bg-[#0B63CE] text-white shadow-xs'
                                : 'bg-white text-[#4A617C] hover:bg-[#F0F5FA] border border-[#DCE7F3]'
                        }`}
                    >
                        <FileCheck className="h-4 w-4" />
                        <span>Riwayat Percobaan CBT</span>
                        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                            cbtSubTab === 'riwayat' ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#4A617C]'
                        }`}>
                            {stats.total_exam_attempts ?? (examAttempts?.length || 0)}
                        </span>
                    </button>
                </div>
                <div className="flex max-w-full flex-col items-start gap-2 sm:max-w-md sm:items-end">
                    <div className="whitespace-normal text-xs text-[#6B7C93] [overflow-wrap:anywhere] sm:text-right">
                        {cbtSubTab === 'rekap' ? (
                            <span>Status pengerjaan Pre-Test, Kuis, & Post-Test seluruh {cbtCompletionStats?.total_participants ?? 0} peserta</span>
                        ) : (
                            <span>Log pengerjaan CBT ({stats.total_exam_attempts ?? 0} percobaan tersimpan)</span>
                        )}
                    </div>
                    <Button
                        as="a"
                        href={`/admin/event/${event.id}/laporan/export/hasil-ujian-cbt`}
                        download
                        size="sm"
                        variant="secondary"
                        icon={<FileSpreadsheet className="h-4 w-4 text-emerald-600" aria-hidden="true" />}
                    >
                        Export Excel Hasil Ujian
                    </Button>
                </div>
            </div>

            {cbtSubTab === 'rekap' ? (
                <CbtCompletionRekapTab
                    cbtCompletionMatrix={cbtCompletionMatrix}
                    cbtCompletionStats={cbtCompletionStats}
                    tracks={tracks}
                    onViewParticipantAttempts={(participantName) => {
                        setCbtSubTab('riwayat');
                        setExamSearch(participantName);
                        setExamTrackFilter('all');
                        setExamPackageFilter('all');
                        setExamStatusFilter('all');
                        setExamPage(1);
                    }}
                />
            ) : (
                <div className="space-y-6">
                    {/* Summary / Stats Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-[#DCE7F3] bg-white p-4 shadow-xs">
                    <p className="text-xs font-medium text-[#6B7C93]">Total Percobaan Ujian</p>
                    <p className="mt-1 font-display text-2xl font-bold text-[#0E2747]">
                        {stats.total_exam_attempts ?? (examAttempts?.length || 0)}
                    </p>
                    <p className="mt-1 text-[11px] text-[#6B7C93]">Percobaan CBT yang tersimpan</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
                    <p className="text-xs font-medium text-emerald-700">Lulus Ujian</p>
                    <p className="mt-1 font-display text-2xl font-bold text-emerald-900">
                        {stats.passed_exam_attempts ?? passedExamAttempts.length}
                    </p>
                    <p className="mt-1 text-[11px] text-emerald-600">Nilai mencapai passing grade</p>
                </div>
                <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 shadow-xs">
                    <p className="text-xs font-medium text-rose-700">Belum Lulus</p>
                    <p className="mt-1 font-display text-2xl font-bold text-rose-900">
                        {stats.failed_exam_attempts ?? completedExamAttempts.filter((attempt) => !attempt.is_passed).length}
                    </p>
                    <p className="mt-1 text-[11px] text-rose-600">Di bawah batas kelulusan</p>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 shadow-xs">
                    <p className="text-xs font-medium text-blue-700">Tingkat Kelulusan</p>
                    <p className="mt-1 font-display text-2xl font-bold text-blue-900">
                        {completedExamAttempts.length > 0
                            ? Math.round((passedExamAttempts.length / completedExamAttempts.length) * 100)
                            : 0}%
                    </p>
                    <p className="mt-1 text-[11px] text-blue-600">Dari ujian yang sudah selesai</p>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="rounded-xl border border-[#DCE7F3] bg-white p-4 shadow-xs space-y-3">
                {/* Baris 1: Pencarian & Tombol Aksi */}
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative w-full lg:max-w-md">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7C93]" />
                        <Input
                            type="text"
                            aria-label="Cari hasil ujian"
                            value={examSearch}
                            onChange={(e) => {
                                setExamSearch(e.target.value);
                                setExamPage(1);
                            }}
                            placeholder="Cari nama kenshi, NIK, dojo, atau paket ujian..."
                            className="w-full rounded-lg border border-[#DCE7F3] py-2 pl-9 pr-8 text-xs text-[#112743] placeholder:text-[#8898AA] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE] focus:outline-none"
                        />
                        {examSearch && (
                            <button
                                type="button"
                                onClick={() => {
                                    setExamSearch('');
                                    setExamPage(1);
                                }}
                                className="absolute right-2.5 top-2.5 text-[#6B7C93] hover:text-[#112743]"
                                title="Hapus pencarian"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="danger"
                            size="sm"
                            icon={<Trash2 className="h-3.5 w-3.5" />}
                            disabled={filteredExamAttempts.length === 0}
                            onClick={() => setDeleteExamTarget('all')}
                            title="Kosongkan/hapus seluruh hasil ujian CBT (daftar hasil ujian kembali kosong)"
                        >
                            Kosongkan Semua Ujian
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            icon={<RotateCcw className="h-3.5 w-3.5 text-amber-700" />}
                            disabled={filteredExamAttempts.length === 0}
                            className="border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 hover:border-amber-400"
                            onClick={() => setRestartExamTarget('all')}
                            title="Mulai ulang sesi ujian untuk semua peserta pada daftar/filter ini (jawaban tetap tersimpan)"
                        >
                            Mulai Ulang (Simpan Jawaban)
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />}
                            disabled={filteredExamAttempts.length === 0}
                            className="border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 hover:border-emerald-400"
                            onClick={() => setCompleteExamTarget('all')}
                            title="Selesaikan dan nilai otomatis seluruh ujian peserta yang masih berlangsung / belum disubmit"
                        >
                            Selesaikan Semua Ujian
                        </Button>
                    </div>
                </div>

                {/* Baris 2: Filter Dropdowns */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#EEF4FB]">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4A617C] mr-1">
                        <Filter className="h-3.5 w-3.5 text-[#6B7C93]" />
                        <span>Filter:</span>
                    </div>

                    <Select
                        placeholder=""
                        aria-label="Filter paket ujian"
                        value={examPackageFilter}
                        onChange={(e) => {
                            setExamPackageFilter(e.target.value);
                            setExamPage(1);
                        }}
                        className="rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] px-3 py-1.5 text-xs font-medium text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                    >
                        <option value="all">Semua Paket Ujian CBT</option>
                        {uniqueExamPackages.map((pkg) => (
                            <option key={pkg.id} value={pkg.id}>
                                {pkg.title}
                            </option>
                        ))}
                    </Select>

                    <Select
                        placeholder=""
                        aria-label="Filter jalur ujian"
                        value={examTrackFilter}
                        onChange={(e) => {
                            setExamTrackFilter(e.target.value);
                            setExamPage(1);
                        }}
                        className="rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] px-3 py-1.5 text-xs font-medium text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                    >
                        <option value="all">Semua Jalur Peserta</option>
                        {uniqueExamTracks.map((tr) => (
                            <option key={tr.code} value={tr.code}>
                                {tr.name} ({tr.code})
                            </option>
                        ))}
                    </Select>

                    <Select
                        placeholder=""
                        aria-label="Filter status ujian"
                        value={examStatusFilter}
                        onChange={(e) => {
                            setExamStatusFilter(e.target.value);
                            setExamPage(1);
                        }}
                        className="rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] px-3 py-1.5 text-xs font-medium text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                    >
                        <option value="all">Semua Status Kelulusan</option>
                        <option value="passed">Lulus (Memenuhi Batas)</option>
                        <option value="failed">Belum Lulus</option>
                        <option value="in_progress">Sedang Mengerjakan</option>
                    </Select>

                    <Select
                        placeholder=""
                        aria-label="Jumlah hasil ujian per halaman"
                        value={examPerPage}
                        onChange={(e) => {
                            setExamPerPage(Number(e.target.value));
                            setExamPage(1);
                        }}
                        className="rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] px-3 py-1.5 text-xs font-medium text-[#112743] focus:border-[#0B63CE] focus:outline-none ml-auto"
                    >
                        <option value={10}>10 per hal</option>
                        <option value={25}>25 per hal</option>
                        <option value={50}>50 per hal</option>
                        <option value={100}>100 per hal</option>
                    </Select>

                    {(examSearch || examPackageFilter !== 'all' || examTrackFilter !== 'all' || examStatusFilter !== 'all') && (
                        <button
                            type="button"
                            onClick={() => {
                                setExamSearch('');
                                setExamPackageFilter('all');
                                setExamTrackFilter('all');
                                setExamStatusFilter('all');
                                setExamPage(1);
                            }}
                            className="text-xs font-medium text-rose-600 hover:text-rose-700 underline px-1"
                        >
                            Reset Filter
                        </button>
                    )}
                </div>
            </div>

            {/* Table of CBT Exam Attempts */}
            <div className="rounded-xl border border-[#DCE7F3] bg-white shadow-xs overflow-hidden">
                <TableSurface className="rounded-none border-0 shadow-none" ariaLabel="Hasil ujian CBT peserta">
                    <table className="min-w-[1180px] w-full table-auto text-left text-xs">
                        <thead className="border-b border-[#DCE7F3] bg-[#F8FBFF] font-semibold text-[#112743]">
                            <tr>
                                <th className="py-3 px-4 w-12 text-center">No</th>
                                <th className="py-3 px-4">Nama Kenshi & Asal</th>
                                <th className="py-3 px-4">Paket Soal & Tipe</th>
                                <th className="py-3 px-4 text-center">Percobaan</th>
                                <th className="py-3 px-4 text-center">Nilai Terhitung / Batas</th>
                                <th className="py-3 px-4 text-center">Status Kelulusan</th>
                                <th className="py-3 px-4">Waktu & Jawaban</th>
                                <th className="py-3 px-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DCE7F3]">
                            {paginatedExamAttempts.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-8 text-center text-sm text-[#6B7C93]">
                                        Tidak ditemukan hasil ujian CBT yang sesuai filter.
                                    </td>
                                </tr>
                            ) : (
                                paginatedExamAttempts.map((att, idx) => {
                                    const globalIdx = (examPage - 1) * examPerPage + idx + 1;

                                    return (
                                        <tr key={att.id} className="hover:bg-[#F8FBFF] transition-colors">
                                            <td className="py-3 px-4 text-center font-mono text-[#6B7C93]">{globalIdx}</td>
                                            <td className="min-w-52 py-3 px-4 whitespace-normal [overflow-wrap:anywhere]">
                                                <div className="min-w-0 font-semibold text-[#0E2747] flex items-center gap-1.5 flex-wrap">
                                                    <span className="min-w-0 [overflow-wrap:anywhere]">{att.participant_name}</span>
                                                    {att.track_code && att.track_code !== '-' && (
                                                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                                                            {att.track_code}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[11px] text-[#6B7C93] whitespace-normal [overflow-wrap:anywhere]">
                                                    <span className="[overflow-wrap:anywhere]">{att.kenshi_id_number}</span>
                                                    <span>•</span>
                                                    <span className="[overflow-wrap:anywhere]">{att.origin_dojo}</span>
                                                    {att.track_name && att.track_name !== '-' && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-blue-600 font-sans font-medium">{att.track_name}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="min-w-52 py-3 px-4 whitespace-normal [overflow-wrap:anywhere]">
                                                <div className="font-semibold text-[#112743] [overflow-wrap:anywhere]">{att.package_title}</div>
                                                <div className="mt-0.5 text-[11px] text-[#6B7C93] [overflow-wrap:anywhere]">
                                                    {att.package_code} • {att.exam_type_label}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="inline-block font-mono font-bold text-xs tabular-nums text-[#0E2747]">
                                                    #{att.attempt_number}
                                                </span>
                                                {att.duration_minutes !== null && (
                                                    <div className="text-[10px] text-[#6B7C93]">
                                                        {typeof att.duration_minutes === 'number' ? Math.round(att.duration_minutes) : att.duration_minutes} mnt
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <div
                                                    className={`font-display text-lg font-bold tabular-nums ${
                                                        att.score_is_provisional
                                                            ? 'text-blue-700'
                                                            : att.is_passed
                                                                ? 'text-emerald-700'
                                                                : 'text-rose-700'
                                                    }`}
                                                    title={att.score_is_provisional
                                                        ? 'Nilai sementara dihitung dari jawaban yang sudah tersimpan'
                                                        : 'Nilai akhir ujian'}
                                                >
                                                    {Number(att.score ?? 0).toFixed(1)}
                                                </div>
                                                <div className="text-[10px] leading-4 text-[#6B7C93] whitespace-normal">
                                                    {att.score_is_provisional ? 'Sementara' : 'Final'} · Min. {att.passing_score}
                                                </div>
                                                <div className="text-[10px] leading-4 text-[#6B7C93] tabular-nums whitespace-normal">
                                                    {att.total_answered}/{att.total_questions} jawaban dinilai
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {att.is_terminal && att.is_passed ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                                                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                                        LULUS
                                                    </span>
                                                ) : att.is_terminal ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-800 border border-rose-200">
                                                        <X className="h-3 w-3 text-rose-600" />
                                                        BELUM LULUS
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 border border-amber-200">
                                                        <Clock className="h-3 w-3 text-amber-600" />
                                                        SEDANG UJIAN
                                                    </span>
                                                )}
                                            </td>
                                            <td className="min-w-36 py-3 px-4 text-[#6B7C93] whitespace-normal [overflow-wrap:anywhere]">
                                                <div>{att.submitted_at || att.started_at || '-'}</div>
                                                <div className="mt-0.5 text-[10px] leading-4 text-[#6B7C93]">
                                                    {att.submitted_at ? 'Selesai' : 'Mulai'} · {att.total_answered}/{att.total_questions} terjawab
                                                </div>
                                            </td>
                                            <td className="min-w-80 py-3 px-4 text-center">
                                                <div className="flex flex-wrap items-center justify-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenAttemptDetail(att)}
                                                        className="inline-flex items-center gap-1 rounded-md bg-[#0B63CE] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#0A3F82] transition-colors shadow-xs"
                                                        title="Lihat rincian lembar soal dan jawaban peserta"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        Lihat Jawaban
                                                    </button>
                                                    {!att.is_terminal && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setCompleteExamTarget(att)}
                                                            className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-xs"
                                                            title="Selesaikan ujian peserta ini dan hitung nilai berdasarkan jawaban yang sudah diisi"
                                                        >
                                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                                                            Selesaikan
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => setRestartExamTarget(att)}
                                                        className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors shadow-xs"
                                                        title="Mulai ulang ujian peserta ini karena kendala teknis (jawaban tetap tersimpan)"
                                                    >
                                                        <RotateCcw className="h-3.5 w-3.5 text-amber-700" />
                                                        Mulai Ulang
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteExamTarget(att)}
                                                        className="inline-flex items-center gap-1 rounded-md border border-rose-300 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors shadow-xs"
                                                        title="Hapus / kosongkan percobaan ujian peserta ini"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                                                        Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </TableSurface>

                {/* Pagination Controls */}
                {totalExamPages > 1 && (
                    <div className="flex items-center justify-between border-t border-[#DCE7F3] px-4 py-3 bg-[#F8FBFF]">
                        <div className="text-xs text-[#6B7C93]">
                            Menampilkan <span className="font-semibold text-[#112743]">{(examPage - 1) * examPerPage + 1}</span> - <span className="font-semibold text-[#112743]">{Math.min(examPage * examPerPage, filteredExamAttempts.length)}</span> dari <span className="font-semibold text-[#112743]">{filteredExamAttempts.length}</span> percobaan ujian
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setExamPage((p) => Math.max(1, p - 1))}
                                disabled={examPage === 1}
                                className="rounded border border-[#DCE7F3] bg-white p-1 text-[#112743] disabled:opacity-40 hover:bg-gray-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="px-2 text-xs font-medium text-[#112743]">
                                {examPage} / {totalExamPages}
                            </span>
                            <button
                                type="button"
                                onClick={() => setExamPage((p) => Math.min(totalExamPages, p + 1))}
                                disabled={examPage === totalExamPages}
                                className="rounded border border-[#DCE7F3] bg-white p-1 text-[#112743] disabled:opacity-40 hover:bg-gray-50"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
                </div>
            )}
        </div>
    );
}
