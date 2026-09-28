import { useIntegrityPact } from './IntegrityPactContext';

export default function PactRoleSection() {
    const {
        data,
        setData,
    } = useIntegrityPact();

    return (
        <>
            {/* 1. Kategori & Peran Lisensi */}
            <section aria-labelledby="section-role">
                <h2 id="section-role" className="flex items-center gap-2 text-sm font-bold text-[#0E2747]">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0B63CE] text-[10px] text-white">
                        1
                    </span>
                    Kategori Penataran & Lisensi
                </h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {[
                        { id: 'pelatih', label: 'Pelatih', desc: 'Pelatih Daerah / Nasional (PD / PN)' },
                        { id: 'penguji', label: 'Penguji', desc: 'Penguji Daerah / Nasional (PED / PEN)' },
                        { id: 'wasit', label: 'Wasit', desc: 'Wasit Daerah / Nasional (WAD / WAN)' },
                    ].map((item) => (
                        <label
                            key={item.id}
                            className={`flex cursor-pointer flex-col rounded-xl border p-3.5 transition ${
                                data.pact_type === item.id
                                    ? 'border-[#0B63CE] bg-[#F0F7FF] ring-2 ring-[#0B63CE]/20'
                                    : 'border-[#DCE7F3] bg-white hover:border-[#6B7C93]'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-[#0E2747]">{item.label}</span>
                                <input
                                    type="radio"
                                    name="pact_type"
                                    value={item.id}
                                    checked={data.pact_type === item.id}
                                    onChange={(e) => setData('pact_type', e.target.value)}
                                    className="h-4 w-4 text-[#0B63CE] focus:ring-[#0B63CE]"
                                />
                            </div>
                            <span className="mt-1 text-[11px] text-[#6B7C93]">{item.desc}</span>
                        </label>
                    ))}
                </div>
            </section>
        </>
    );
}
