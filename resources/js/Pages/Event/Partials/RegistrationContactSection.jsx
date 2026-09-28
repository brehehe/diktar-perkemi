import { Phone, Briefcase } from 'lucide-react';
import { useRegistrationForm } from './RegistrationFormContext';

export default function RegistrationContactSection() {
    const {
        data,
        setData,
        errors,
        clientErrors,
        setClientErrors,
        allErrors,
    } = useRegistrationForm();

    return (
        <>
            {/* BAGIAN III: PEKERJAAN & DARURAT */}
            <div className="grid gap-6 sm:grid-cols-2">
                {/* Pekerjaan / Sekolah */}
                <div className="rounded-xl border border-[#DCE7F3] bg-white p-6 shadow-xs">
                    <div className="mb-4 flex items-center gap-2 border-b border-[#DCE7F3] pb-3">
                        <Briefcase className="h-5 w-5 text-[#0B63CE]" />
                        <h2 className="font-display text-base font-bold text-[#0E2747]">
                            III. Pekerjaan / Sekolah
                        </h2>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold text-[#112743]">
                                Instansi / Perusahaan / Sekolah
                            </label>
                            <input
                                type="text"
                                value={data.occupation}
                                onChange={(e) => setData('occupation', e.target.value)}
                                placeholder="Nama Pekerjaan atau Sekolah"
                                className="mt-1 block w-full rounded-md border border-[#DCE7F3] px-3 py-2 text-xs text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                            />
                            {errors.occupation && <p className="mt-1 text-[11px] text-rose-500">{errors.occupation}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#112743]">
                                Alamat Pekerjaan / Sekolah
                            </label>
                            <textarea
                                rows="2"
                                value={data.occupation_address}
                                onChange={(e) => setData('occupation_address', e.target.value)}
                                placeholder="Alamat kantor atau kampus/sekolah"
                                className="mt-1 block w-full rounded-md border border-[#DCE7F3] px-3 py-2 text-xs text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#112743]">
                                Telepon Pekerjaan / Sekolah
                            </label>
                            <input
                                type="tel"
                                value={data.occupation_phone}
                                onChange={(e) => setData('occupation_phone', e.target.value)}
                                placeholder="Nomor telepon instansi / kantor"
                                className="mt-1 block w-full rounded-md border border-[#DCE7F3] px-3 py-2 text-xs text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Kontak Darurat */}
                <div className="rounded-xl border border-[#DCE7F3] bg-white p-6 shadow-xs">
                    <div className="mb-4 flex items-center gap-2 border-b border-[#DCE7F3] pb-3">
                        <Phone className="h-5 w-5 text-[#0B63CE]" />
                        <h2 className="font-display text-base font-bold text-[#0E2747]">
                            IV. Kontak & Alamat Darurat
                        </h2>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold text-[#112743]">
                                Nomor Telepon Darurat <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="tel"
                                value={data.emergency_phone}
                                onChange={(e) => {
                                    setData('emergency_phone', e.target.value);
                                    if (clientErrors.emergency_phone) {
                                        setClientErrors((prev) => {
                                            const c = { ...prev };
                                            delete c.emergency_phone;
                                            return c;
                                        });
                                    }
                                }}
                                placeholder="Nomor kontak keluarga/kerabat terdekat"
                                className={`mt-1 block w-full rounded-md border ${allErrors.emergency_phone ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-[#DCE7F3] focus:border-[#0B63CE]'} px-3 py-2 text-xs text-[#112743] focus:outline-none`}
                                required
                            />
                            {allErrors.emergency_phone && <p className="mt-1 text-[11px] text-rose-500 font-medium">{allErrors.emergency_phone}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#112743]">
                                Alamat Kontak Darurat
                            </label>
                            <textarea
                                rows="3"
                                value={data.emergency_address}
                                onChange={(e) => setData('emergency_address', e.target.value)}
                                placeholder="Alamat tempat tinggal kontak darurat"
                                className="mt-1 block w-full rounded-md border border-[#DCE7F3] px-3 py-2 text-xs text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
