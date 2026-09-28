import { useIntegrityPact } from './IntegrityPactContext';

export default function PactIdentitySection() {
    const {
        data,
        setData,
    } = useIntegrityPact();

    return (
        <>
            {/* 2. Identitas Lengkap Kenshi */}
            <section aria-labelledby="section-identity">
                <h2 id="section-identity" className="flex items-center gap-2 text-sm font-bold text-[#0E2747]">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0B63CE] text-[10px] text-white">
                        2
                    </span>
                    Identitas Kenshi
                </h2>

                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-xs font-semibold text-[#0E2747]">
                            Nama Lengkap Sesuai KTP / SIM PERKEMI <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.full_name}
                            onChange={(e) => setData('full_name', e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#0E2747]">
                            Nomor Induk Kenshi (NIK) <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.kenshi_id_number}
                            onChange={(e) => setData('kenshi_id_number', e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs font-mono text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#0E2747]">
                            Tempat Lahir <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.birth_place}
                            onChange={(e) => setData('birth_place', e.target.value)}
                            placeholder="Contoh: Surabaya"
                            className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#0E2747]">
                            Tanggal Lahir <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={data.birth_date}
                            onChange={(e) => setData('birth_date', e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#0E2747]">
                            Tingkatan DAN <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.dan_level}
                            onChange={(e) => setData('dan_level', e.target.value)}
                            placeholder="Contoh: III (Tiga) DAN"
                            className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#0E2747]">
                            Agama <span className="text-rose-500">*</span>
                        </label>
                        <select
                            value={data.religion}
                            onChange={(e) => setData('religion', e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                            required
                        >
                            <option value="Islam">Islam</option>
                            <option value="Kristen Protestan">Kristen Protestan</option>
                            <option value="Katolik">Katolik</option>
                            <option value="Hindu">Hindu</option>
                            <option value="Buddha">Buddha</option>
                            <option value="Khonghucu">Khonghucu</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#0E2747]">
                            Asal Dojo <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.dojo}
                            onChange={(e) => setData('dojo', e.target.value)}
                            placeholder="Contoh: Perak Surabaya"
                            className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs font-semibold text-[#0E2747]">
                                Kota / Kab <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.city}
                                onChange={(e) => setData('city', e.target.value)}
                                placeholder="Surabaya"
                                className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-[#0E2747]">
                                Provinsi <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.province}
                                onChange={(e) => setData('province', e.target.value)}
                                placeholder="Jawa Timur"
                                className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                                required
                            />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
