import { Plus, Trash2, FileCheck } from 'lucide-react';
import { useRegistrationForm } from './RegistrationFormContext';

export default function RegistrationCertificatesSection() {
    const {
        data,
        addCertificateRow,
        removeCertificateRow,
        updateCertificateRow,
    } = useRegistrationForm();

    return (
        <>
            {/* BAGIAN VI: SERTIFIKAT YANG DIMILIKI */}
            <div className="rounded-xl border border-[#DCE7F3] bg-white p-6 shadow-xs">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#DCE7F3] pb-3">
                    <div className="flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-[#0B63CE]" />
                        <div>
                            <h2 className="font-display text-base font-bold text-[#0E2747]">
                                VI. Sertifikat Pelatih / Penguji / Wasit yang Dimiliki
                            </h2>
                            <p className="text-[11px] text-[#6B7C93]">
                                {data.penataran_level === 'Nasional'
                                    ? 'Wajib bagi penataran tingkat Nasional: Sertifikat Pelatih Daerah, Penguji Daerah, atau Wasit Daerah yang telah dimiliki.'
                                    : 'Sertifikat kepelatihan, pengujian, atau perwasitan yang sudah pernah didapatkan sebelumnya (jika ada).'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={addCertificateRow}
                        className="inline-flex items-center gap-1 rounded-md bg-[#EAF5FF] px-2.5 py-1.5 text-xs font-semibold text-[#0B63CE] hover:bg-[#D5EBFF] transition-colors"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Tambah Sertifikat
                    </button>
                </div>

                {(!data.certificate_records || data.certificate_records.length === 0) ? (
                    <div className="rounded-xl border border-dashed border-[#DCE7F3] bg-[#F8FBFF] p-6 text-center">
                        <FileCheck className="mx-auto h-8 w-8 text-[#0B63CE]/40 mb-2" />
                        <p className="text-xs font-medium text-[#112743]">
                            Belum ada sertifikat kepelatihan, penguji, atau wasit yang dicatat.
                        </p>
                        <p className="mt-1 text-[11px] text-[#6B7C93]">
                            {data.penataran_level === 'Nasional'
                                ? 'Untuk penataran tingkat Nasional, Anda disarankan melampirkan sertifikat Pelatih Daerah / Penguji Daerah / Wasit Daerah.'
                                : 'Bagian ini bersifat opsional jika Anda sudah memiliki sertifikat sebelumnya.'}
                        </p>
                        <button
                            type="button"
                            onClick={addCertificateRow}
                            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white border border-[#DCE7F3] px-3.5 py-1.5 text-xs font-semibold text-[#0B63CE] shadow-2xs hover:bg-[#EAF5FF] hover:border-[#0B63CE]/40 transition-colors"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Tambah Sertifikat
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {data.certificate_records.map((item, index) => (
                            <div key={index} className="rounded-xl border border-[#DCE7F3] bg-[#F8FBFF] p-4 sm:p-5 shadow-2xs transition-all hover:border-[#0B63CE]/30">
                                <div className="flex items-center justify-between border-b border-[#DCE7F3] pb-3 mb-3.5">
                                    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#0B63CE]/10 px-2.5 py-1 font-mono text-xs font-bold text-[#0B63CE]">
                                        <FileCheck className="h-3.5 w-3.5" />
                                        Sertifikat #{index + 1}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeCertificateRow(index)}
                                        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Hapus Sertifikat
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                    <div className="md:col-span-5">
                                        <label className="block text-xs font-semibold text-[#112743] mb-1">
                                            Jenis Sertifikat
                                        </label>
                                        <input
                                            type="text"
                                            value={item.jenis}
                                            onChange={(e) => updateCertificateRow(index, 'jenis', e.target.value)}
                                            placeholder="Contoh: Pelatih Daerah Jawa Timur"
                                            className="block w-full rounded-lg border border-[#DCE7F3] bg-white px-3.5 py-2 text-xs text-[#112743] placeholder-[#94A3B8] shadow-2xs focus:border-[#0B63CE] focus:outline-none"
                                        />
                                    </div>
                                    <div className="md:col-span-4">
                                        <label className="block text-xs font-semibold text-[#112743] mb-1">
                                            Nomor Sertifikat
                                        </label>
                                        <input
                                            type="text"
                                            value={item.nomor}
                                            onChange={(e) => updateCertificateRow(index, 'nomor', e.target.value)}
                                            placeholder="Contoh: 112/SK/PENGPROV/2024"
                                            className="block w-full rounded-lg border border-[#DCE7F3] bg-white px-3.5 py-2 text-xs text-[#112743] placeholder-[#94A3B8] shadow-2xs focus:border-[#0B63CE] focus:outline-none"
                                        />
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="block text-xs font-semibold text-[#112743] mb-1">
                                            Tanggal Sertifikat
                                        </label>
                                        <input
                                            type="date"
                                            value={item.tanggal}
                                            onChange={(e) => updateCertificateRow(index, 'tanggal', e.target.value)}
                                            className="block w-full rounded-lg border border-[#DCE7F3] bg-white px-3.5 py-2 text-xs text-[#112743] shadow-2xs focus:border-[#0B63CE] focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
