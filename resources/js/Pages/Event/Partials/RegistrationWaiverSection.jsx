import { Shield } from 'lucide-react';
import { useRegistrationForm } from './RegistrationFormContext';

export default function RegistrationWaiverSection() {
    const {
        data,
        setData,
        clientErrors,
        setClientErrors,
        allErrors,
    } = useRegistrationForm();

    return (
        <>
            {/* BAGIAN VII: SURAT PERNYATAAN DAN PEMBEBASAN (WAIVER) */}
            <div className="rounded-xl border border-[#DCE7F3] bg-white p-6 shadow-xs">
                <div className="mb-4 flex items-center gap-2 border-b border-[#DCE7F3] pb-3">
                    <Shield className="h-5 w-5 text-[#0B63CE]" />
                    <h2 className="font-display text-base font-bold text-[#0E2747]">
                        VII. Surat Pernyataan dan Pembebasan
                    </h2>
                </div>

                <div className="rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] p-4 text-xs leading-relaxed text-[#112743] space-y-3">
                    <p className="font-semibold text-[#0E2747]">
                        Dengan ini saya menyatakan bahwa:
                    </p>
                    <ol className="list-decimal pl-5 space-y-1.5">
                        <li>
                            Saya dalam keadaan sehat jasmani dan rohani serta telah memperoleh surat keterangan kesehatan resmi dari dokter yang berwenang.
                        </li>
                        <li>
                            Saya bersedia mematuhi segala ketentuan, peraturan, dan tata tertib yang berlaku selama mengikuti kegiatan penataran Shorinji Kempo.
                        </li>
                        <li>
                            Saya menyadari sepenuhnya bahwa olahraga Shorinji Kempo mengandung risiko fisik. Oleh karena itu, saya membebaskan panitia pelaksana, pengurus PERKEMI, serta para instruktur dari segala tuntutan hukum yang timbul akibat kecelakaan atau cedera selama pelaksanaan kegiatan ini.
                        </li>
                        <li>
                            Seluruh data dan dokumen yang saya berikan adalah benar dan sah. Apabila di kemudian hari terbukti tidak benar, saya bersedia menerima sanksi sesuai ketentuan PB PERKEMI.
                        </li>
                    </ol>

                    <div className={`mt-3 p-3 rounded-lg border transition-all ${allErrors.waiver_agreed ? 'border-rose-400 bg-rose-50/50' : 'border-transparent'}`}>
                        <label className="flex items-start gap-2.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.waiver_agreed}
                                onChange={(e) => {
                                    setData('waiver_agreed', e.target.checked);
                                    if (e.target.checked && clientErrors.waiver_agreed) {
                                        setClientErrors((prev) => {
                                            const c = { ...prev };
                                            delete c.waiver_agreed;
                                            return c;
                                        });
                                    }
                                }}
                                className="mt-0.5 h-4 w-4 rounded border-[#DCE7F3] text-[#0B63CE] focus:ring-[#0B63CE]"
                            />
                            <span className="text-xs font-semibold text-[#0E2747]">
                                Saya telah membaca, memahami, dan menyetujui seluruh ketentuan Surat Pernyataan dan Pembebasan di atas. <span className="text-rose-500">*</span>
                            </span>
                        </label>
                        {allErrors.waiver_agreed && <p className="mt-1 text-xs text-rose-600 font-medium pl-6">{allErrors.waiver_agreed}</p>}
                    </div>
                </div>
            </div>
        </>
    );
}
