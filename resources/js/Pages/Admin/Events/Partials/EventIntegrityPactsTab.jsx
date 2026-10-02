import { usePage } from '@inertiajs/react';
import TableSurface from '../../../../Components/admin/TableSurface';
import Input from '../../../../Components/ui/Input';
import Select from '../../../../Components/ui/Select';
import { FileText, FileCheck, ChevronLeft, ChevronRight, Search, Filter, Eye, Check, Printer, CheckCircle2, Download, Upload, FileEdit } from 'lucide-react';
import { useEventShow } from './EventShowContext';
import { useIsProdas } from '../../../../Utils/isProdas';

export default function EventIntegrityPactsTab() {
    const isProdas = useIsProdas();
    const {
        event,
        stats,
        integrityPacts,
        pactSearch,
        setPactSearch,
        pactTrackFilter,
        setPactTrackFilter,
        pactStatusFilter,
        setPactStatusFilter,
        pactPage,
        setPactPage,
        pactPerPage,
        setPactPerPage,
        setSelectedPactForModal,
        isVerifyingPact,
        setUploadModalPactParticipant,
        setAdminUploadPactFile,
        setAdminUploadPactType,
        filteredIntegrityPacts,
        totalPactPages,
        paginatedIntegrityPacts,
        handleVerifyPact,
    } = useEventShow();

    return (
        <div className="space-y-6">
            {/* Summary / Stats Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-[#DCE7F3] bg-white p-4 shadow-xs">
                    <p className="text-xs font-medium text-[#6B7C93]">Total Peserta</p>
                    <p className="mt-1 font-display text-2xl font-bold text-[#0E2747]">
                        {stats.total_integrity_pacts ?? (integrityPacts?.length || 0)}
                    </p>
                    <p className="mt-1 text-[11px] text-[#6B7C93]">Peserta terdaftar di event</p>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 shadow-xs">
                    <p className="text-xs font-medium text-blue-700">Pakta Masuk</p>
                    <p className="mt-1 font-display text-2xl font-bold text-blue-900">
                        {stats.signed_integrity_pacts ?? (integrityPacts?.filter(p => p.status === 'signed' || p.status === 'verified').length || 0)}
                    </p>
                    <p className="mt-1 text-[11px] text-blue-600">Digital atau berkas fisik</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
                    <p className="text-xs font-medium text-emerald-700">Terverifikasi</p>
                    <p className="mt-1 font-display text-2xl font-bold text-emerald-900">
                        {stats.verified_integrity_pacts ?? (integrityPacts?.filter(p => p.status === 'verified').length || 0)}
                    </p>
                    <p className="mt-1 text-[11px] text-emerald-600">Disetujui admin PB PERKEMI</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
                    <p className="text-xs font-medium text-amber-700">Belum Mengisi</p>
                    <p className="mt-1 font-display text-2xl font-bold text-amber-900">
                        {stats.unfilled_integrity_pacts ?? (integrityPacts?.filter(p => p.status === 'unfilled').length || 0)}
                    </p>
                    <p className="mt-1 text-[11px] text-amber-600">Menunggu pengisian / unggahan</p>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#DCE7F3] bg-white p-4 shadow-xs">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7C93]" />
                    <Input
                        type="text"
                        aria-label="Cari pakta integritas"
                        value={pactSearch}
                        onChange={(e) => {
                            setPactSearch(e.target.value);
                            setPactPage(1);
                        }}
                        placeholder="Cari nama kenshi, NIK, DAN, atau dojo..."
                        className="w-full rounded-lg border border-[#DCE7F3] py-2 pl-9 pr-3 text-xs text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {!isProdas && (
                        <Select
                            placeholder=""
                            aria-label="Filter jalur pakta"
                            value={pactTrackFilter}
                            onChange={(e) => {
                                setPactTrackFilter(e.target.value);
                                pactTrackFilter !== e.target.value && setPactPage(1);
                            }}
                            className="rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] px-3 py-2 text-xs font-medium text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                        >
                            <option value="all">Semua Kategori Pakta</option>
                            <option value="pelatih">Pakta Integritas Pelatih</option>
                            <option value="penguji">Pakta Integritas Penguji</option>
                            <option value="wasit">Pakta Integritas Wasit</option>
                        </Select>
                    )}

                    <Select
                        placeholder=""
                        aria-label="Filter status pakta"
                        value={pactStatusFilter}
                        onChange={(e) => {
                            setPactStatusFilter(e.target.value);
                            setPactPage(1);
                        }}
                        className="rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] px-3 py-2 text-xs font-medium text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                    >
                        <option value="all">Semua Status Pakta</option>
                        <option value="verified">Terverifikasi</option>
                        <option value="signed">Ditandatangani (Menunggu Verifikasi)</option>
                        <option value="uploaded">Berkas Terunggah (Scan/PDF)</option>
                        <option value="unfilled">Belum Mengisi</option>
                    </Select>

                    <Select
                        placeholder=""
                        aria-label="Jumlah pakta per halaman"
                        value={pactPerPage}
                        onChange={(e) => {
                            setPactPerPage(Number(e.target.value));
                            setPactPage(1);
                        }}
                        className="rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] px-3 py-2 text-xs font-medium text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                    >
                        <option value={10}>10 per hal</option>
                        <option value={25}>25 per hal</option>
                        <option value={50}>50 per hal</option>
                        <option value={100}>100 per hal</option>
                    </Select>
                </div>
            </div>

            {/* Table of Participant Integrity Pacts */}
            <div className="rounded-xl border border-[#DCE7F3] bg-white shadow-xs overflow-hidden">
                <TableSurface className="rounded-none border-0 shadow-none" ariaLabel="Pakta integritas peserta">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-[#DCE7F3] bg-[#F8FBFF] font-semibold text-[#112743]">
                            <tr>
                                <th className="py-3 px-4 w-12 text-center">No</th>
                                <th className="py-3 px-4">Nama Kenshi & NIK</th>
                                <th className="py-3 px-4">Tingkatan DAN & Asal</th>
                                <th className="py-3 px-4">Jenis Pakta & Jalur</th>
                                <th className="py-3 px-4">Status & Metode</th>
                                <th className="py-3 px-4">Waktu Tanda Tangan / Unggah</th>
                                <th className="py-3 px-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DCE7F3]">
                            {paginatedIntegrityPacts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-sm text-[#6B7C93]">
                                        Tidak ditemukan pakta integritas yang sesuai filter.
                                    </td>
                                </tr>
                            ) : (
                                paginatedIntegrityPacts.map((pact, idx) => {
                                    const globalIdx = (pactPage - 1) * pactPerPage + idx + 1;
                                    const hasPact = pact.status !== 'unfilled';

                                    return (
                                        <tr key={pact.event_participant_id || pact.participant_id} className="hover:bg-[#F8FBFF] transition-colors">
                                            <td className="py-3 px-4 text-center font-mono text-[#6B7C93]">{globalIdx}</td>
                                            <td className="py-3 px-4">
                                                <div className="font-semibold text-[#0E2747]">{pact.participant_name}</div>
                                                <div className="font-mono text-[11px] text-[#6B7C93]">{pact.kenshi_id_number}</div>
                                                {pact.file_url && (
                                                    <div className="mt-1">
                                                        <a
                                                            href={pact.file_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 rounded bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                                                            title="Lihat Berkas Scan Pakta Integritas"
                                                        >
                                                            <FileText className="h-3 w-3" />
                                                            Berkas: {pact.file_name || 'Dokumen'} ({pact.file_size_formatted || 'File'})
                                                        </a>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="inline-block rounded bg-[#EAF5FF] px-2 py-0.5 text-[11px] font-bold text-[#0B63CE]">
                                                    {pact.dan_level}
                                                </span>
                                                <div className="text-[11px] text-[#6B7C93] mt-0.5">
                                                    {pact.origin_dojo}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-semibold text-[#112743] capitalize">
                                                    Pakta {pact.pact_type}
                                                </div>
                                                <div className="text-[11px] text-[#6B7C93]">{pact.track_name}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                {pact.status === 'verified' ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
                                                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                                        Terverifikasi {pact.submission_mode === 'upload' ? '• Berkas' : '• Digital'}
                                                    </span>
                                                ) : pact.status === 'signed' ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-800 border border-blue-200">
                                                        <FileCheck className="h-3 w-3 text-blue-600" />
                                                        {pact.submission_mode === 'upload' ? 'Berkas Terunggah' : 'Ditandatangani Digital'}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600 border border-gray-200">
                                                        Belum Mengisi
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-[#6B7C93]">
                                                {pact.signed_at || '-'}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                                    {hasPact && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedPactForModal(pact)}
                                                            className="inline-flex items-center gap-1 rounded-md bg-[#0B63CE] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#0A3F82] transition-colors"
                                                            title="Lihat komitmen dan tanda tangan pakta integritas"
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                            Lihat
                                                        </button>
                                                    )}

                                                    {/* Tombol Upload Berkas Fisik (Admin Upload) */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setUploadModalPactParticipant(pact);
                                                            setAdminUploadPactType(pact.pact_type || 'pelatih');
                                                            setAdminUploadPactFile(null);
                                                        }}
                                                        className="inline-flex items-center gap-1 rounded-md bg-purple-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 transition-colors"
                                                        title="Upload berkas scan pakta integritas PDF/JPG untuk kenshi ini"
                                                    >
                                                        <Upload className="h-3.5 w-3.5" />
                                                        Upload
                                                    </button>

                                                    {/* Tombol Isi / Edit Mandiri via Portal */}
                                                    <a
                                                        href={`/event/${event.slug}/pakta-integritas?participant_id=${pact.participant_id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 rounded-md border border-[#DCE7F3] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#112743] hover:bg-[#F8FBFF] hover:text-[#0B63CE] transition-colors"
                                                        title="Isi formulir pakta secara digital"
                                                    >
                                                        <FileEdit className="h-3.5 w-3.5 text-[#0B63CE]" />
                                                        {hasPact ? 'Edit Data' : 'Isi Data'}
                                                    </a>

                                                    {pact.file_url && (
                                                        <a
                                                            href={pact.file_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 rounded-md bg-indigo-50 border border-indigo-200 px-2 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                                                            title="Lihat / unduh berkas scan terunggah"
                                                        >
                                                            <Download className="h-3.5 w-3.5" />
                                                            Berkas
                                                        </a>
                                                    )}

                                                    {pact.print_url && (
                                                        <a
                                                            href={pact.print_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 rounded-md border border-[#DCE7F3] bg-white px-2 py-1.5 text-xs font-medium text-[#112743] hover:bg-[#F8FBFF] hover:text-[#0B63CE] transition-colors"
                                                            title="Cetak format resmi PB PERKEMI"
                                                        >
                                                            <Printer className="h-3.5 w-3.5" />
                                                        </a>
                                                    )}

                                                    {hasPact && pact.status !== 'verified' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleVerifyPact(pact.id)}
                                                            disabled={isVerifyingPact}
                                                            className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                                                            title="Verifikasi pakta integritas ini"
                                                        >
                                                            <Check className="h-3.5 w-3.5" />
                                                            Verifikasi
                                                        </button>
                                                    )}
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
                {totalPactPages > 1 && (
                    <div className="flex items-center justify-between border-t border-[#DCE7F3] px-4 py-3 bg-[#F8FBFF]">
                        <div className="text-xs text-[#6B7C93]">
                            Menampilkan <span className="font-semibold text-[#112743]">{(pactPage - 1) * pactPerPage + 1}</span> - <span className="font-semibold text-[#112743]">{Math.min(pactPage * pactPerPage, filteredIntegrityPacts.length)}</span> dari <span className="font-semibold text-[#112743]">{filteredIntegrityPacts.length}</span> peserta
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setPactPage((p) => Math.max(1, p - 1))}
                                disabled={pactPage === 1}
                                className="rounded border border-[#DCE7F3] bg-white p-1 text-[#112743] disabled:opacity-40 hover:bg-gray-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="px-2 text-xs font-medium text-[#112743]">
                                {pactPage} / {totalPactPages}
                            </span>
                            <button
                                type="button"
                                onClick={() => setPactPage((p) => Math.min(totalPactPages, p + 1))}
                                disabled={pactPage === totalPactPages}
                                className="rounded border border-[#DCE7F3] bg-white p-1 text-[#112743] disabled:opacity-40 hover:bg-gray-50"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
