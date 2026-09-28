import { Link } from '@inertiajs/react';
import { AlertCircle, FileCheck, Upload, Download } from 'lucide-react';
import { useRegistrationForm } from './RegistrationFormContext';

export default function RegistrationUploadPanel() {
    const {
        event,
        participant,
        initialData,
        form,
        data,
        hasUploadedFile,
        uploadFile,
        setUploadFile,
        uploadPenataranLevel,
        setUploadPenataranLevel,
        uploadFormType,
        setUploadFormType,
        uploadNotes,
        setUploadNotes,
        uploadAgreed,
        setUploadAgreed,
        isUploadingFile,
        uploadError,
        setUploadError,
        handleUploadSubmit,
    } = useRegistrationForm();

    return (
        <>
            <div className="mt-6 space-y-6">
                {/* Banner Penjelasan */}
                <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h3 className="font-bold text-sm text-[#0E2747] flex items-center gap-2">
                                <Upload className="h-4 w-4 text-[#0B63CE]" />
                                Pilihan Praktis: Unggah Berkas Fisik / Lembar Hasil Scan
                            </h3>
                            <p className="text-xs text-[#5B6B82] leading-relaxed max-w-3xl">
                                Jika Anda sudah mencetak formulir resmi PB PERKEMI, mengisi dengan tulisan tangan atau huruf cetak, menandatanganinya, dan/atau meminta pengesahan Pengdo/Pengkab/Pengkot, Anda cukup mengunggah hasil scan dokumen (PDF) atau foto lembar formulir tersebut di sini tanpa perlu mengetik ulang seluruh data.
                            </p>
                        </div>
                        <a
                            href={`/event/${event.slug}/formulir-pendaftaran/cetak`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white border border-[#0B63CE] px-3.5 py-2 text-xs font-semibold text-[#0B63CE] hover:bg-blue-50 transition-colors shrink-0 shadow-xs"
                        >
                            <Download className="h-4 w-4" />
                            Unduh Format Cetak PB PERKEMI (Blanko)
                        </a>
                    </div>
                </div>

                {/* Status Berkas Saat Ini jika sudah ada */}
                {hasUploadedFile && (
                    <div className="rounded-xl border border-emerald-300 bg-emerald-50/90 p-5 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                                <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-300">
                                    <FileCheck className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                                            Berkas Terdaftar
                                        </span>
                                        {(initialData?.file_size_formatted || form?.file_size_formatted) && (
                                            <span className="text-xs text-emerald-800">
                                                ({initialData?.file_size_formatted || form?.file_size_formatted})
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm font-bold text-slate-900 mt-1">
                                        {initialData?.original_file_name || form?.original_file_name || 'Berkas Formulir Pendaftaran Terunggah'}
                                    </p>
                                    <p className="text-xs text-emerald-800 mt-0.5">
                                        Berkas formulir Anda telah tersimpan dan dapat diverifikasi oleh panitia / PB PERKEMI.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <a
                                    href={initialData?.file_url || form?.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm transition"
                                >
                                    <Download className="h-4 w-4" />
                                    Buka / Unduh Berkas Saya
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Upload Form Card */}
                <form onSubmit={handleUploadSubmit} className="rounded-xl border border-[#DCE7F3] bg-white p-6 shadow-xs space-y-6">
                    <div className="border-b border-[#DCE7F3] pb-3">
                        <h3 className="font-bold text-sm text-[#0E2747]">
                            {hasUploadedFile ? 'Perbarui / Unggah Ulang Berkas Formulir' : 'Formulir Unggah Berkas Fisik'}
                        </h3>
                        <p className="text-xs text-[#6B7C93] mt-0.5">
                            Unggah dokumen formulir dalam format PDF, DOC, DOCX, JPG, atau PNG. Maksimal ukuran berkas 10MB.
                        </p>
                    </div>

                    {uploadError && (
                        <div className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                            <span>{uploadError}</span>
                        </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-xs font-semibold text-[#112743]">
                                Kategori Formulir <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={uploadFormType}
                                onChange={(e) => setUploadFormType(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-[#DCE7F3] bg-[#F8FBFF] px-3 py-2 text-xs font-medium text-[#112743] focus:border-[#0B63CE] focus:bg-white focus:outline-none"
                            >
                                <option value="PELATIH">Pelatih</option>
                                <option value="PENGUJI">Penguji</option>
                                <option value="WASIT">Wasit</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#112743]">
                                Tingkat Penataran <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={uploadPenataranLevel}
                                onChange={(e) => setUploadPenataranLevel(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-[#DCE7F3] bg-[#F8FBFF] px-3 py-2 text-xs font-medium text-[#112743] focus:border-[#0B63CE] focus:bg-white focus:outline-none"
                            >
                                <option value="Daerah">Tingkat Daerah</option>
                                <option value="Nasional">Tingkat Nasional</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#112743] mb-1">
                            Pilih Berkas Formulir (Scan / PDF / Foto Dokumen Fisik) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative rounded-xl border-2 border-dashed border-[#DCE7F3] bg-[#F8FBFF] p-6 text-center hover:border-[#0B63CE] transition-colors">
                            <Upload className="mx-auto h-10 w-10 text-[#0B63CE] mb-2" />
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                    setUploadFile(e.target.files?.[0] || null);
                                    setUploadError(null);
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <p className="text-xs font-semibold text-[#112743]">
                                Klik di sini atau seret berkas untuk memilih file
                            </p>
                            <p className="text-[11px] text-[#6B7C93] mt-1">
                                PDF, DOCX, DOC, JPG, atau PNG (Maksimal 10MB)
                            </p>
                            {uploadFile && (
                                <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-800">
                                    <FileCheck className="h-4 w-4 text-emerald-600" />
                                    <span>File Terpilih: <strong>{uploadFile.name}</strong> ({(uploadFile.size / 1024).toFixed(1)} KB)</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#112743] mb-1">
                            Catatan Tambahan (Opsional)
                        </label>
                        <textarea
                            rows={2}
                            value={uploadNotes}
                            onChange={(e) => setUploadNotes(e.target.value)}
                            placeholder="Contoh: Formulir sudah bertanda tangan dan berstempel Pengkab/Pengkot."
                            className="block w-full rounded-md border border-[#DCE7F3] bg-[#F8FBFF] px-3 py-2 text-xs text-[#112743] focus:border-[#0B63CE] focus:bg-white focus:outline-none"
                        />
                    </div>

                    <div className="rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] p-3 text-xs">
                        <label className="flex items-start gap-2.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={uploadAgreed}
                                onChange={(e) => setUploadAgreed(e.target.checked)}
                                className="mt-0.5 rounded border-[#DCE7F3] text-[#0B63CE] focus:ring-[#0B63CE]"
                            />
                            <span className="text-[#112743]">
                                Saya menyatakan dan menjamin bahwa berkas formulir pendaftaran fisik yang saya unggah adalah sah, lengkap, benar, dan merupakan dokumen permohonan resmi saya untuk mengikuti Penataran di PB PERKEMI.
                            </span>
                        </label>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Link
                            href={participant?.is_admin_mode ? `/admin/event/${event.id}?tab=formulir` : `/event/${event.slug}/ruang-belajar`}
                            className="rounded-lg border border-[#DCE7F3] bg-white px-5 py-2.5 text-xs font-semibold text-[#112743] hover:bg-[#F8FBFF]"
                        >
                            Batal
                        </Link>

                        <button
                            type="submit"
                            disabled={isUploadingFile || !uploadFile}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0B63CE] px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#0A3F82] disabled:opacity-50 transition"
                        >
                            <Upload className="h-4 w-4" />
                            {isUploadingFile ? 'Mengunggah Berkas...' : (hasUploadedFile ? 'Unggah & Perbarui Berkas' : 'Unggah & Simpan Formulir')}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
