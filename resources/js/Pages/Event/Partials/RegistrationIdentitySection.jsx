import { User } from 'lucide-react';
import { useRegistrationForm } from './RegistrationFormContext';

export default function RegistrationIdentitySection() {
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
            {/* BAGIAN II: DATA PRIBADI PEMOHON */}
            <div className="rounded-xl border border-[#DCE7F3] bg-white p-6 shadow-xs">
                <div className="mb-5 flex items-center justify-between border-b border-[#DCE7F3] pb-3">
                    <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-[#0B63CE]" />
                        <h2 className="font-display text-base font-bold text-[#0E2747]">
                            II. Data Pribadi Pemohon (Kenshi)
                        </h2>
                    </div>
                    <span className="text-[11px] text-[#6B7C93]">
                        Terhubung dengan SIM PERKEMI
                    </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <label className="block text-xs font-semibold text-[#112743]">
                            Nama Lengkap <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.full_name}
                            onChange={(e) => {
                                const val = e.target.value;
                                setData((prev) => ({
                                    ...prev,
                                    full_name: val,
                                    applicant_name: prev.applicant_name === prev.full_name || !prev.applicant_name ? val : prev.applicant_name,
                                }));
                                if (clientErrors.full_name) {
                                    setClientErrors((prev) => {
                                        const c = { ...prev };
                                        delete c.full_name;
                                        return c;
                                    });
                                }
                            }}
                            className={`mt-1 block w-full rounded-md border ${allErrors.full_name ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-[#DCE7F3] focus:border-[#0B63CE]'} px-3 py-2 text-xs text-[#112743] focus:outline-none`}
                            required
                        />
                        {allErrors.full_name && <p className="mt-1 text-[11px] text-rose-500 font-medium">{allErrors.full_name}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#112743]">
                            Nomor Induk Kenshi (NIK) <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.kenshi_id_number}
                            onChange={(e) => {
                                setData('kenshi_id_number', e.target.value);
                                if (clientErrors.kenshi_id_number) {
                                    setClientErrors((prev) => {
                                        const c = { ...prev };
                                        delete c.kenshi_id_number;
                                        return c;
                                    });
                                }
                            }}
                            className={`mt-1 block w-full rounded-md border ${allErrors.kenshi_id_number ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-[#DCE7F3] focus:border-[#0B63CE]'} bg-[#F8FBFF] px-3 py-2 font-mono text-xs text-[#112743] focus:bg-white focus:outline-none`}
                            required
                        />
                        {allErrors.kenshi_id_number && <p className="mt-1 text-[11px] text-rose-500 font-medium">{allErrors.kenshi_id_number}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#112743]">
                            Tingkatan DAN <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.dan_level}
                            onChange={(e) => {
                                setData('dan_level', e.target.value);
                                if (clientErrors.dan_level) {
                                    setClientErrors((prev) => {
                                        const c = { ...prev };
                                        delete c.dan_level;
                                        return c;
                                    });
                                }
                            }}
                            placeholder="Contoh: 3 DAN"
                            className={`mt-1 block w-full rounded-md border ${allErrors.dan_level ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-[#DCE7F3] focus:border-[#0B63CE]'} px-3 py-2 text-xs text-[#112743] focus:outline-none`}
                            required
                        />
                        {allErrors.dan_level && <p className="mt-1 text-[11px] text-rose-500 font-medium">{allErrors.dan_level}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#112743]">
                            Tempat Lahir <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.birth_place}
                            onChange={(e) => {
                                setData('birth_place', e.target.value);
                                if (clientErrors.birth_place) {
                                    setClientErrors((prev) => {
                                        const c = { ...prev };
                                        delete c.birth_place;
                                        return c;
                                    });
                                }
                            }}
                            placeholder="Kota Kelahiran"
                            className={`mt-1 block w-full rounded-md border ${allErrors.birth_place ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-[#DCE7F3] focus:border-[#0B63CE]'} px-3 py-2 text-xs text-[#112743] focus:outline-none`}
                            required
                        />
                        {allErrors.birth_place && <p className="mt-1 text-[11px] text-rose-500 font-medium">{allErrors.birth_place}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#112743]">
                            Tanggal Lahir <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={data.birth_date}
                            onChange={(e) => {
                                setData('birth_date', e.target.value);
                                if (clientErrors.birth_date) {
                                    setClientErrors((prev) => {
                                        const c = { ...prev };
                                        delete c.birth_date;
                                        return c;
                                    });
                                }
                            }}
                            className={`mt-1 block w-full rounded-md border ${allErrors.birth_date ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-[#DCE7F3] focus:border-[#0B63CE]'} px-3 py-2 text-xs text-[#112743] focus:outline-none`}
                            required
                        />
                        {allErrors.birth_date && <p className="mt-1 text-[11px] text-rose-500 font-medium">{allErrors.birth_date}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#112743]">
                            Nomor Telepon / WhatsApp <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="tel"
                            value={data.phone_number}
                            onChange={(e) => {
                                setData('phone_number', e.target.value);
                                if (clientErrors.phone_number) {
                                    setClientErrors((prev) => {
                                        const c = { ...prev };
                                        delete c.phone_number;
                                        return c;
                                    });
                                }
                            }}
                            placeholder="081234567890"
                            className={`mt-1 block w-full rounded-md border ${allErrors.phone_number ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-[#DCE7F3] focus:border-[#0B63CE]'} px-3 py-2 text-xs text-[#112743] focus:outline-none`}
                            required
                        />
                        {allErrors.phone_number && <p className="mt-1 text-[11px] text-rose-500 font-medium">{allErrors.phone_number}</p>}
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#112743]">
                            Alamat Rumah <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            rows="2"
                            value={data.home_address}
                            onChange={(e) => {
                                setData('home_address', e.target.value);
                                if (clientErrors.home_address) {
                                    setClientErrors((prev) => {
                                        const c = { ...prev };
                                        delete c.home_address;
                                        return c;
                                    });
                                }
                            }}
                            placeholder="Alamat lengkap tempat tinggal pemohon"
                            className={`mt-1 block w-full rounded-md border ${allErrors.home_address ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-[#DCE7F3] focus:border-[#0B63CE]'} px-3 py-2 text-xs text-[#112743] focus:outline-none`}
                            required
                        />
                        {allErrors.home_address && <p className="mt-1 text-[11px] text-rose-500 font-medium">{allErrors.home_address}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#112743]">
                            Email Pemohon
                        </label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="nama@email.com"
                            className="mt-1 block w-full rounded-md border border-[#DCE7F3] px-3 py-2 text-xs text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                        />
                        {errors.email && <p className="mt-1 text-[11px] text-rose-500">{errors.email}</p>}
                    </div>
                </div>
            </div>
        </>
    );
}
