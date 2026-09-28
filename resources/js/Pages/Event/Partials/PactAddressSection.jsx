import { useIntegrityPact } from './IntegrityPactContext';

export default function PactAddressSection() {
    const {
        data,
        setData,
        sameAddress,
        handleSameAddressChange,
    } = useIntegrityPact();

    return (
        <>
            {/* 3. Lisensi & Alamat Lengkap */}
            <section aria-labelledby="section-cert">
                <h2 id="section-cert" className="flex items-center gap-2 text-sm font-bold text-[#0E2747]">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0B63CE] text-[10px] text-white">
                        3
                    </span>
                    Data Sertifikat Lisensi & Alamat
                </h2>

                <div className="mt-3 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <label className="block text-xs font-semibold text-[#0E2747]">
                                Nomor Sertifikat {data.pact_type.toUpperCase()}
                            </label>
                            <input
                                type="text"
                                value={data.certificate_number}
                                onChange={(e) => setData('certificate_number', e.target.value)}
                                placeholder="Contoh: 073/PLT-DRH/XII/2026"
                                className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs font-mono text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                            />
                            <span className="text-[10px] text-[#6B7C93]">Otomatis diisi panitia saat kelulusan</span>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-[#0E2747]">
                                Tanggal Mulai Berlaku
                            </label>
                            <input
                                type="date"
                                value={data.valid_start_date}
                                onChange={(e) => setData('valid_start_date', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-[#0E2747]">
                                Tanggal Selesai Berlaku
                            </label>
                            <input
                                type="date"
                                value={data.valid_end_date}
                                onChange={(e) => setData('valid_end_date', e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#0E2747]">
                            Alamat Lengkap Sesuai KTP <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            rows={2}
                            value={data.id_card_address}
                            onChange={(e) => {
                                setData('id_card_address', e.target.value);
                                if (sameAddress) setData('current_address', e.target.value);
                            }}
                            placeholder="Jl. Teluk Aru Utara No.61 B Surabaya"
                            className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white p-3 text-xs text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                            required
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label className="block text-xs font-semibold text-[#0E2747]">
                                Alamat Lengkap Saat Ini / Domisili
                            </label>
                            <label className="flex items-center gap-1.5 text-xs text-[#6B7C93] cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={sameAddress}
                                    onChange={(e) => handleSameAddressChange(e.target.checked)}
                                    className="rounded border-[#DCE7F3] text-[#0B63CE] focus:ring-[#0B63CE]"
                                />
                                <span>Sama dengan alamat KTP</span>
                            </label>
                        </div>
                        <textarea
                            rows={2}
                            value={data.current_address}
                            onChange={(e) => setData('current_address', e.target.value)}
                            disabled={sameAddress}
                            className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white p-3 text-xs text-[#0E2747] disabled:bg-slate-50 disabled:text-slate-500 focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-xs font-semibold text-[#0E2747]">
                                Menjadi Pengurus pada
                            </label>
                            <input
                                type="text"
                                value={data.management_organization}
                                onChange={(e) => setData('management_organization', e.target.value)}
                                placeholder="Contoh: Pengkot Surabaya / Pengprov Jatim / -"
                                className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-[#0E2747]">
                                Sebagai (Jabatan)
                            </label>
                            <input
                                type="text"
                                value={data.management_position}
                                onChange={(e) => setData('management_position', e.target.value)}
                                placeholder="Contoh: Ketua Bidang Kepelatihan / Anggota / -"
                                className="mt-1 block w-full rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs text-[#0E2747] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
