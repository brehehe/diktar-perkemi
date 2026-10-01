import React from 'react';
import { useContext } from 'react';
import { Award, Calendar, FileText, Building2, UserCheck, DollarSign } from 'lucide-react';
import { RegistrationFormContext } from './RegistrationFormContext';

export default function RegistrationKenshiSection() {
    const { data, setData, allErrors } = useContext(RegistrationFormContext);

    const kyuOptions = [
        'KYU 8',
        'KYU 7',
        'KYU 6',
        'KYU 5',
        'KYU 4',
        'KYU 3',
        'KYU 2',
        'KYU 1',
        '1 DAN',
        '2 DAN',
        '3 DAN',
    ];

    return (
        <section className="space-y-6">
            {/* Bagian 1: Permohonan Ujian Kenaikan Tingkat */}
            <div className="rounded-xl border border-[#DCE7F3] bg-white p-6 shadow-xs sm:p-7">
                <div className="flex items-center gap-3 border-b border-[#DCE7F3] pb-4 mb-5">
                    <div className="rounded-lg bg-blue-50 p-2 text-[#0B63CE]">
                        <Award className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="font-display text-base font-bold text-[#0E2747]">
                            Permohonan Ujian Kenaikan Tingkat (UKT)
                        </h2>
                        <p className="text-xs text-[#5B6B82]">
                            Tentukan tingkatan KYU atau DAN yang dituju sesuai permohonan resmi Formulir – 24.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                        <label className="block text-xs font-semibold text-[#112743] mb-1.5">
                            Menempuh Ujian Kenaikan Tingkat Menjadi <span className="text-rose-500">*</span>
                        </label>
                        <select
                            value={data.target_level || ''}
                            onChange={(e) => setData('target_level', e.target.value)}
                            className={`w-full rounded-lg border px-3.5 py-2.5 text-xs font-semibold text-[#112743] focus:border-[#0B63CE] focus:outline-none ${
                                allErrors?.target_level ? 'border-rose-400 bg-rose-50/50' : 'border-[#DCE7F3] bg-white'
                            }`}
                        >
                            <option value="">-- Pilih Tingkatan Target --</option>
                            {kyuOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                        {allErrors?.target_level && (
                            <p className="mt-1 text-[11px] text-rose-500">{allErrors.target_level}</p>
                        )}
                        <p className="mt-1 text-[11px] text-[#6B7C93]">
                            Sesuai permohonan UKT PB PERKEMI.
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#112743] mb-1.5">
                            Biaya Ujian (Opsional / Ditentukan Panitia)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-2.5 text-xs font-semibold text-[#6B7C93]">
                                Rp
                            </span>
                            <input
                                type="number"
                                value={data.exam_fee || ''}
                                onChange={(e) => setData('exam_fee', e.target.value)}
                                placeholder="Contoh: 150000"
                                className="w-full rounded-lg border border-[#DCE7F3] bg-white pl-10 pr-3.5 py-2.5 text-xs text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                            />
                        </div>
                        <p className="mt-1 text-[11px] text-[#6B7C93]">
                            Diisi jika ada rincian uang ujian pada lampiran formulir.
                        </p>
                    </div>
                </div>
            </div>

            {/* Bagian 2: Riwayat Ujian Terakhir & Sertifikat Tertinggi */}
            <div className="rounded-xl border border-[#DCE7F3] bg-white p-6 shadow-xs sm:p-7">
                <div className="flex items-center gap-3 border-b border-[#DCE7F3] pb-4 mb-5">
                    <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="font-display text-base font-bold text-[#0E2747]">
                            Riwayat Ujian Terakhir & Sertifikat Tertinggi yang Dimiliki
                        </h2>
                        <p className="text-xs text-[#5B6B82]">
                            Data ujian sebelumnya dan nomor sertifikat yang saat ini disandang kenshi.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div>
                        <label className="block text-xs font-semibold text-[#112743] mb-1.5">
                            Tanggal Ujian Terakhir
                        </label>
                        <input
                            type="date"
                            value={data.last_exam_date || ''}
                            onChange={(e) => setData('last_exam_date', e.target.value)}
                            className="w-full rounded-lg border border-[#DCE7F3] bg-white px-3.5 py-2.5 text-xs text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                        />
                        <p className="mt-1 text-[11px] text-[#6B7C93]">
                            Tanggal ketika lulus ujian kyu/dan sebelumnya.
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#112743] mb-1.5">
                            Nomor Sertifikat Tertinggi
                        </label>
                        <input
                            type="text"
                            value={data.last_certificate_number || ''}
                            onChange={(e) => setData('last_certificate_number', e.target.value)}
                            placeholder="Nomor piagam/sertifikat terakhir"
                            className="w-full rounded-lg border border-[#DCE7F3] bg-white px-3.5 py-2.5 text-xs text-[#112743] focus:border-[#0B63CE] focus:outline-none font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#112743] mb-1.5">
                            Tanggal Sertifikat Tertinggi
                        </label>
                        <input
                            type="date"
                            value={data.last_certificate_date || ''}
                            onChange={(e) => setData('last_certificate_date', e.target.value)}
                            className="w-full rounded-lg border border-[#DCE7F3] bg-white px-3.5 py-2.5 text-xs text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Bagian 3: Mengetahui Pengurus Dojo (Pengdo) */}
            <div className="rounded-xl border border-[#DCE7F3] bg-white p-6 shadow-xs sm:p-7">
                <div className="flex items-center gap-3 border-b border-[#DCE7F3] pb-4 mb-5">
                    <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="font-display text-base font-bold text-[#0E2747]">
                            Mengetahui: Pengurus Dojo (Pengdo)
                        </h2>
                        <p className="text-xs text-[#5B6B82]">
                            Pengurus dojo asal kenshi yang merekomendasikan dan mengetahui permohonan ujian.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div>
                        <label className="block text-xs font-semibold text-[#112743] mb-1.5">
                            Nama Dojo (Pengdo) <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.dojo_name || ''}
                            onChange={(e) => setData('dojo_name', e.target.value)}
                            placeholder="Contoh: Dojo Surabaya Barat"
                            className="w-full rounded-lg border border-[#DCE7F3] bg-white px-3.5 py-2.5 text-xs text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#112743] mb-1.5">
                            Nama Pengurus Dojo <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.dojo_leader_name || ''}
                            onChange={(e) => setData('dojo_leader_name', e.target.value)}
                            placeholder="Nama Ketua / Pelatih Dojo"
                            className="w-full rounded-lg border border-[#DCE7F3] bg-white px-3.5 py-2.5 text-xs text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#112743] mb-1.5">
                            Jabatan Pengurus Dojo
                        </label>
                        <input
                            type="text"
                            value={data.dojo_leader_position || ''}
                            onChange={(e) => setData('dojo_leader_position', e.target.value)}
                            placeholder="Contoh: Ketua Pengurus Dojo"
                            className="w-full rounded-lg border border-[#DCE7F3] bg-white px-3.5 py-2.5 text-xs text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                        />
                    </div>
                </div>

                {/* Info Catatan Lampiran */}
                <div className="mt-5 rounded-lg bg-slate-50 border border-slate-200 p-4 text-xs text-slate-700">
                    <p className="font-semibold text-slate-900 mb-1">Catatan Persyaratan Lampiran Formulir – 24:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                        <li>2 (dua) helai Pas Foto ukuran <strong>2.5 x 3 cm</strong> untuk tingkat Kyu</li>
                        <li>2 (dua) helai Pas Foto ukuran <strong>3 x 4 cm</strong> untuk tingkat Dan</li>
                        <li>Membayar uang ujian sesuai ketentuan panitia pelaksana</li>
                    </ul>
                </div>
            </div>
        </section>
    );
}
