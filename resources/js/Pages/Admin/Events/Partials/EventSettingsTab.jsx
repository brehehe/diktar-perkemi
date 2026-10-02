import { Link, usePage } from '@inertiajs/react';
import { Edit3, Check } from 'lucide-react';
import { useEventShow } from './EventShowContext';
import { useIsProdas } from '../../../../Utils/isProdas';

export default function EventSettingsTab() {
    const isProdas = useIsProdas();
    const {
        event,
        sessionsByDay,
        cbtPackages,
        setActiveTab,
        settingSections,
    } = useEventShow();

    return (
        <div className="bg-white rounded-xl border border-[#DCE7F3] p-6 shadow-xs space-y-6">
            <div>
                <h3 className="font-display text-lg font-semibold text-[#0A3F82]">Kelola komponen event</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{settingSections.map((section) => <button key={section.id} type="button" onClick={() => setActiveTab(section.id)} className="min-h-11 border border-[#DCE7F3] bg-[#F8FBFF] px-4 py-3 text-left text-sm font-semibold text-[#112743] hover:border-[#0B63CE] hover:bg-[#EAF5FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]">{section.label} →</button>)}</div>
            </div>
            <div className="space-y-1">
                <h3 className="font-display font-bold text-sm text-[#0E2747]">
                    {isProdas ? 'Pengaturan Operasional Event Gashuku & UKT' : 'Pengaturan Operasional Event Penataran'}
                </h3>
                <p className="text-xs text-[#6B7C93]">
                    Absensi QR per hari dan sesi serta standar kelulusan ujian.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#F8FBFF] border border-[#DCE7F3] space-y-2">
                    <span className="font-bold text-[#0E2747] block">Metode Check-in Event</span>
                    <p className="text-[#6B7C93]">
                        Peserta memindai QR kehadiran harian sebelum QR sesi. Buat entri Kehadiran Harian pada setiap tanggal rundown dan buka absensinya saat kegiatan dimulai.
                    </p>
                    <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                        {Object.values(sessionsByDay).filter((day) => day.sessions.some((session) => session.session_type_code === 'KEHADIRAN_HARIAN')).length} hari disiapkan
                    </span>
                </div>

                <div className="p-4 rounded-xl bg-[#F8FBFF] border border-[#DCE7F3] space-y-2">
                    <span className="font-bold text-[#0E2747] block">Validasi Absensi QR</span>
                    <p className="text-[#6B7C93]">
                        QR memuat token acak dan kode singkat. Kode hanya berlaku selama absensi sesi dibuka.
                    </p>
                    <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">
                        Validasi server aktif
                    </span>
                </div>

                <div className="p-4 rounded-xl bg-[#F8FBFF] border border-[#DCE7F3] space-y-2">
                    <span className="font-bold text-[#0E2747] block">KKM per Paket Ujian</span>
                    {cbtPackages.length ? <ul className="space-y-1 text-[#6B7C93]">{cbtPackages.map((pkg) => <li key={pkg.id}>{pkg.title}: {pkg.passing_score}</li>)}</ul> : <p className="text-[#6B7C93]">Belum ada paket ujian untuk event ini.</p>}
                </div>
            </div>

            <div className="pt-4 border-t border-[#DCE7F3] flex justify-end">
                <Link
                    href={`/admin/event/${event.id}/edit`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B63CE] text-white text-xs font-semibold hover:bg-[#0A3F82]"
                >
                    <Edit3 className="w-4 h-4" />
                    <span>Ubah Metadata & Pengaturan Lengkap</span>
                </Link>
            </div>
        </div>
    );
}
