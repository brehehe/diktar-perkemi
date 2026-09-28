import { Calendar } from 'lucide-react';
import { useRegistrationForm } from './RegistrationFormContext';

export default function RegistrationEventSection() {
    const {
        data,
        setData,
        errors,
    } = useRegistrationForm();

    return (
        <>
            {/* BAGIAN I: DATA PENATARAN */}
            <div className="rounded-xl border border-[#DCE7F3] bg-white p-6 shadow-xs">
                <div className="mb-5 flex items-center gap-2 border-b border-[#DCE7F3] pb-3">
                    <Calendar className="h-5 w-5 text-[#0B63CE]" />
                    <h2 className="font-display text-base font-bold text-[#0E2747]">
                        I. Data Kegiatan Penataran
                    </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <label className="block text-xs font-semibold text-[#112743]">
                            Tingkat Penataran <span className="text-rose-500">*</span>
                        </label>
                        <select
                            value={data.penataran_level}
                            onChange={(e) => setData('penataran_level', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-[#DCE7F3] bg-[#F8FBFF] px-3 py-2 text-xs font-medium text-[#112743] focus:border-[#0B63CE] focus:bg-white focus:outline-none"
                        >
                            <option value="Daerah">Tingkat Daerah</option>
                            <option value="Nasional">Tingkat Nasional</option>
                        </select>
                        {errors.penataran_level && <p className="mt-1 text-[11px] text-rose-500">{errors.penataran_level}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#112743]">
                            Tanggal Mulai <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={data.start_date}
                            onChange={(e) => setData('start_date', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-[#DCE7F3] px-3 py-2 text-xs text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                        />
                        {errors.start_date && <p className="mt-1 text-[11px] text-rose-500">{errors.start_date}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#112743]">
                            Tanggal Selesai <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={data.end_date}
                            onChange={(e) => setData('end_date', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-[#DCE7F3] px-3 py-2 text-xs text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                        />
                        {errors.end_date && <p className="mt-1 text-[11px] text-rose-500">{errors.end_date}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#112743]">
                            Tempat Pelaksanaan <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.location}
                            onChange={(e) => setData('location', e.target.value)}
                            placeholder="Contoh: Gedung Astoria, Kota Mojokerto"
                            className="mt-1 block w-full rounded-md border border-[#DCE7F3] px-3 py-2 text-xs text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                        />
                        {errors.location && <p className="mt-1 text-[11px] text-rose-500">{errors.location}</p>}
                    </div>
                </div>
            </div>
        </>
    );
}
