import TableSurface from '../../../../Components/admin/TableSurface';
import Input from '../../../../Components/ui/Input';
import Select from '../../../../Components/ui/Select';
import { FileText, FileCheck, ChevronLeft, ChevronRight, Search, Filter, Eye, Check, Printer, CheckCircle2, Download, Upload, FileEdit } from 'lucide-react';
import { useEventShow } from './EventShowContext';

export default function EventRegistrationFormsTab() {
    const {
        event,
        stats,
        registrationForms,
        formSearch,
        setFormSearch,
        formTrackFilter,
        setFormTrackFilter,
        formStatusFilter,
        setFormStatusFilter,
        formPage,
        setFormPage,
        formPerPage,
        setFormPerPage,
        setSelectedFormForModal,
        isVerifyingForm,
        setUploadModalParticipant,
        setAdminUploadFile,
        setAdminUploadFormType,
        setAdminUploadPenataranLevel,
        setAdminUploadNotes,
        filteredRegistrationForms,
        totalFormPages,
        paginatedRegistrationForms,
        handleVerifyForm,
    } = useEventShow();

    const isUkt = event?.event_type === 'ukt';

    return (
        <div className="space-y-6">
            {/* Summary / Stats Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-[#DCE7F3] bg-white p-4 shadow-xs">
                    <p className="text-xs font-medium text-[#6B7C93]">Total Peserta</p>
                    <p className="mt-1 font-display text-2xl font-bold text-[#0E2747]">
                        {stats.total_registration_forms ?? registrationForms.length}
                    </p>
                    <p className="mt-1 text-[11px] text-[#6B7C93]">Peserta terdaftar di event</p>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 shadow-xs">
                    <p className="text-xs font-medium text-blue-700">Formulir Masuk</p>
                    <p className="mt-1 font-display text-2xl font-bold text-blue-900">
                        {stats.submitted_registration_forms ?? registrationForms.filter(f => f.status === 'submitted' || f.status === 'verified').length}
                    </p>
                    <p className="mt-1 text-[11px] text-blue-600">Sudah mengisi formulir</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
                    <p className="text-xs font-medium text-emerald-700">Terverifikasi</p>
                    <p className="mt-1 font-display text-2xl font-bold text-emerald-900">
                        {stats.verified_registration_forms ?? registrationForms.filter(f => f.status === 'verified').length}
                    </p>
                    <p className="mt-1 text-[11px] text-emerald-600">Disetujui oleh admin</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
                    <p className="text-xs font-medium text-amber-700">Belum Mengisi</p>
                    <p className="mt-1 font-display text-2xl font-bold text-amber-900">
                        {stats.unfilled_registration_forms ?? registrationForms.filter(f => f.status === 'unfilled').length}
                    </p>
                    <p className="mt-1 text-[11px] text-amber-600">Menunggu pengisian peserta</p>
                </div>
            </div>

            {/* Notice if all forms are fresh / unfilled */}
            {(stats.submitted_registration_forms ?? 0) === 0 && (stats.verified_registration_forms ?? 0) === 0 && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
                            <FileCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-blue-950">
                                {isUkt ? 'Status Formulir UKT (Formulir – 24): Bersih' : 'Status Formulir Penataran: Bersih (Menunggu Pengisian Mandiri)'}
                            </p>
                            <p className="text-[11px] text-blue-800">
                                {isUkt
                                    ? `Seluruh peserta UKT (${stats.total_registration_forms ?? registrationForms.length} kenshi) berstatus "Belum Mengisi". Peserta dapat mengisi Formulir – 24 secara digital di ruang belajar atau mengunggah berkas scan.`
                                    : `Data formulir telah dikosongkan. Seluruh peserta (${stats.total_registration_forms ?? registrationForms.length} kenshi) berstatus "Belum Mengisi". Begitu kenshi mengirimkan formulir pendaftaran secara mandiri di portal, berkas akan muncul di tabel ini untuk diverifikasi admin PB PERKEMI.`}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter and Search Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#DCE7F3] bg-white p-4 shadow-xs">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7C93]" />
                    <Input
                        type="text"
                        aria-label="Cari formulir pendaftaran"
                        value={formSearch}
                        onChange={(e) => {
                            setFormSearch(e.target.value);
                            setFormPage(1);
                        }}
                        placeholder="Cari nama kenshi, NIK, DAN, atau dojo..."
                        className="w-full rounded-lg border border-[#DCE7F3] py-2 pl-9 pr-3 text-xs text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Select
                        placeholder=""
                        aria-label="Filter jalur formulir"
                        value={formTrackFilter}
                        onChange={(e) => {
                            setFormTrackFilter(e.target.value);
                            setFormPage(1);
                        }}
                        className="rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] px-3 py-2 text-xs font-medium text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                    >
                        {isUkt ? (
                            <>
                                <option value="all">Semua Tingkatan UKT (Kyu)</option>
                                <option value="kyu 8">Kyu 8</option>
                                <option value="kyu 7">Kyu 7</option>
                                <option value="kyu 6">Kyu 6</option>
                                <option value="kyu 5">Kyu 5</option>
                                <option value="kyu 4">Kyu 4</option>
                                <option value="kyu 3">Kyu 3</option>
                                <option value="kyu 2">Kyu 2</option>
                                <option value="kyu 1">Kyu 1</option>
                            </>
                        ) : (
                            <>
                                <option value="all">Semua Jalur / Profesi</option>
                                <option value="pelatih">Pelatih (Daerah / Nasional)</option>
                                <option value="penguji">Penguji (Daerah / Nasional)</option>
                                <option value="wasit">Wasit (Daerah / Nasional)</option>
                            </>
                        )}
                    </Select>

                    <Select
                        placeholder=""
                        aria-label="Filter status formulir"
                        value={formStatusFilter}
                        onChange={(e) => {
                            setFormStatusFilter(e.target.value);
                            setFormPage(1);
                        }}
                        className="rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] px-3 py-2 text-xs font-medium text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                    >
                        <option value="all">Semua Status Formulir</option>
                        <option value="verified">Terverifikasi</option>
                        <option value="submitted">Menunggu Verifikasi (Terkirim)</option>
                        <option value="unfilled">Belum Mengisi</option>
                    </Select>

                    <Select
                        placeholder=""
                        aria-label="Jumlah formulir per halaman"
                        value={formPerPage}
                        onChange={(e) => {
                            setFormPerPage(Number(e.target.value));
                            setFormPage(1);
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

            {/* Table of Participant Forms */}
            <div className="rounded-xl border border-[#DCE7F3] bg-white shadow-xs overflow-hidden">
                <TableSurface className="rounded-none border-0 shadow-none" ariaLabel="Formulir pendaftaran peserta">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-[#DCE7F3] bg-[#F8FBFF] font-semibold text-[#112743]">
                            <tr>
                                <th className="py-3 px-4 w-12 text-center">No</th>
                                <th className="py-3 px-4">Nama Kenshi & NIK</th>
                                <th className="py-3 px-4">{isUkt ? 'Tingkatan Saat Ini & Dojo' : 'Tingkatan DAN & Asal'}</th>
                                <th className="py-3 px-4">{isUkt ? 'Ujian Ke Tingkat (Target)' : 'Jalur & Tingkat'}</th>
                                <th className="py-3 px-4">{isUkt ? 'Status Formulir – 24' : 'Status Formulir'}</th>
                                <th className="py-3 px-4">Tanggal Pengisian</th>
                                <th className="py-3 px-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DCE7F3]">
                            {paginatedRegistrationForms.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-sm text-[#6B7C93]">
                                        Tidak ditemukan formulir yang sesuai filter.
                                    </td>
                                </tr>
                            ) : (
                                paginatedRegistrationForms.map((rf, idx) => {
                                    const globalIdx = (formPage - 1) * formPerPage + idx + 1;
                                    const hasForm = rf.status !== 'unfilled';

                                    return (
                                        <tr key={rf.event_participant_id || rf.participant_id} className="hover:bg-[#F8FBFF] transition-colors">
                                            <td className="py-3 px-4 text-center font-mono text-[#6B7C93]">{globalIdx}</td>
                                            <td className="py-3 px-4">
                                                <div className="font-semibold text-[#0E2747]">{rf.participant_name}</div>
                                                <div className="font-mono text-[11px] text-[#6B7C93]">{rf.kenshi_id_number}</div>
                                                {rf.file_url && (
                                                    <div className="mt-1">
                                                        <a
                                                            href={rf.file_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 rounded bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                                                            title="Lihat / Unduh Berkas Scan"
                                                        >
                                                            <FileText className="h-3 w-3" />
                                                            Scan: {rf.file_name || 'Dokumen'} ({rf.file_size_formatted || 'File'})
                                                        </a>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="inline-block rounded bg-[#EAF5FF] px-2 py-0.5 text-[11px] font-bold text-[#0B63CE]">
                                                    {rf.dan_level}
                                                </span>
                                                <div className="text-[11px] text-[#6B7C93] mt-0.5">
                                                    {rf.origin_dojo}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                {isUkt ? (
                                                    <div>
                                                        <span className="inline-block rounded bg-purple-50 border border-purple-200 px-2 py-0.5 text-[11px] font-bold text-purple-700">
                                                            {rf.target_level || rf.penataran_level || rf.track_name || 'UKT'}
                                                        </span>
                                                        <div className="text-[11px] text-[#6B7C93] mt-0.5 font-mono">{rf.track_code}</div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div className="font-semibold text-[#112743]">
                                                            {rf.form_type} ({rf.penataran_level})
                                                        </div>
                                                        <div className="text-[11px] text-[#6B7C93]">{rf.track_name}</div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                {rf.status === 'verified' ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
                                                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                                        Terverifikasi {rf.submission_mode === 'upload' ? '• Berkas' : ''}
                                                    </span>
                                                ) : rf.status === 'submitted' ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-800 border border-blue-200">
                                                        <FileCheck className="h-3 w-3 text-blue-600" />
                                                        Menunggu Verifikasi {rf.submission_mode === 'upload' ? '• Berkas' : ''}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600 border border-gray-200">
                                                        Belum Mengisi
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-[#6B7C93]">
                                                {rf.submitted_at || '-'}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                                    {hasForm && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedFormForModal(rf)}
                                                            className="inline-flex items-center gap-1 rounded-md bg-[#0B63CE] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#0A3F82] transition-colors"
                                                            title="Lihat formulir Word resmi"
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                            Lihat
                                                        </button>
                                                    )}

                                                    {/* Tombol Upload Berkas (Bisa upload berkas scan/PDF langsung) */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setUploadModalParticipant(rf);
                                                            setAdminUploadFormType(rf.form_type || 'PELATIH');
                                                            setAdminUploadPenataranLevel(rf.penataran_level || 'Daerah');
                                                            setAdminUploadFile(null);
                                                            setAdminUploadNotes('');
                                                        }}
                                                        className="inline-flex items-center gap-1 rounded-md bg-purple-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 transition-colors"
                                                        title="Upload berkas scan formulir PDF/DOCX/JPG untuk kenshi ini"
                                                    >
                                                        <Upload className="h-3.5 w-3.5" />
                                                        Upload
                                                    </button>

                                                    {/* Tombol Isi / Edit Data Formulir */}
                                                    <a
                                                        href={`/event/${event.slug}/formulir-pendaftaran?participant_id=${rf.participant_id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 rounded-md border border-[#DCE7F3] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#112743] hover:bg-[#F8FBFF] hover:text-[#0B63CE] transition-colors"
                                                        title="Isi formulir secara digital atau sesuaikan data-datanya"
                                                    >
                                                        <FileEdit className="h-3.5 w-3.5 text-[#0B63CE]" />
                                                        {hasForm ? 'Edit Data' : 'Isi Data'}
                                                    </a>

                                                    {rf.file_url && (
                                                        <a
                                                            href={rf.file_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 rounded-md bg-indigo-50 border border-indigo-200 px-2 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                                                            title="Lihat / unduh berkas scan dokumen terunggah"
                                                        >
                                                            <Download className="h-3.5 w-3.5" />
                                                            Berkas
                                                        </a>
                                                    )}

                                                    {rf.print_url && (
                                                        <a
                                                            href={rf.print_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 rounded-md border border-[#DCE7F3] bg-white px-2 py-1.5 text-xs font-medium text-[#112743] hover:bg-[#F8FBFF] hover:text-[#0B63CE] transition-colors"
                                                            title="Cetak formulir PB PERKEMI"
                                                        >
                                                            <Printer className="h-3.5 w-3.5" />
                                                        </a>
                                                    )}

                                                    {hasForm && rf.status !== 'verified' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleVerifyForm(rf.id)}
                                                            disabled={isVerifyingForm}
                                                            className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                                                            title="Verifikasi formulir ini"
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
                {totalFormPages > 1 && (
                    <div className="flex items-center justify-between border-t border-[#DCE7F3] px-4 py-3 bg-[#F8FBFF]">
                        <div className="text-xs text-[#6B7C93]">
                            Menampilkan <span className="font-semibold text-[#112743]">{(formPage - 1) * formPerPage + 1}</span> - <span className="font-semibold text-[#112743]">{Math.min(formPage * formPerPage, filteredRegistrationForms.length)}</span> dari <span className="font-semibold text-[#112743]">{filteredRegistrationForms.length}</span> peserta
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setFormPage((p) => Math.max(1, p - 1))}
                                disabled={formPage === 1}
                                className="rounded border border-[#DCE7F3] bg-white p-1 text-[#112743] disabled:opacity-40 hover:bg-gray-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="px-2 text-xs font-medium text-[#112743]">
                                {formPage} / {totalFormPages}
                            </span>
                            <button
                                type="button"
                                onClick={() => setFormPage((p) => Math.min(totalFormPages, p + 1))}
                                disabled={formPage === totalFormPages}
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
