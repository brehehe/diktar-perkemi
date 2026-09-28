import { router } from '@inertiajs/react';
import Button from '../../../../Components/ui/Button';
import Input from '../../../../Components/ui/Input';
import { useEventShow } from './EventShowContext';

export default function EventLegendsTab() {
    const {
        event,
        tracks,
        legends,
        legendForm,
    } = useEventShow();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Master Kode Jalur */}
            <div className="bg-white rounded-xl border border-[#DCE7F3] p-6 shadow-xs space-y-4">
                <h3 className="font-display font-bold text-sm text-[#0E2747] uppercase tracking-wider">
                    Master Kode Jalur Kualifikasi Kenshi
                </h3>
                <div className="space-y-3">
                    {tracks.map((t) => (
                        <div key={t.id} className="p-3 rounded-lg bg-[#F8FBFF] border border-[#DCE7F3] flex items-start gap-3">
                            <span className={`px-2 py-1 rounded text-xs font-mono font-bold shrink-0 ${t.badge_color}`}>
                                {t.code}
                            </span>
                            <div className="space-y-0.5">
                                <div className="font-bold text-xs text-[#0E2747]">{t.name}</div>
                                <p className="text-[11px] text-[#6B7C93]">{t.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Glosarium Singkatan */}
            <div className="bg-white rounded-xl border border-[#DCE7F3] p-6 shadow-xs space-y-4">
                <h3 className="font-display font-bold text-sm text-[#0E2747] uppercase tracking-wider">
                    Glosarium Singkatan Resmi PERKEMI
                </h3>
                <form onSubmit={(submission) => { submission.preventDefault(); legendForm.post(`/admin/event/${event.id}/legenda`, { onSuccess: () => legendForm.reset() }); }} className="grid gap-2 border-b border-[#DCE7F3] pb-4 sm:grid-cols-2">
                    <div><label htmlFor="legend-code" className="mb-1 block text-xs font-semibold text-[#112743]">Singkatan</label><Input id="legend-code" value={legendForm.data.acronym} onChange={(change) => legendForm.setData('acronym', change.target.value)} required maxLength={30} error={legendForm.errors.acronym} /></div>
                    <div><label htmlFor="legend-name" className="mb-1 block text-xs font-semibold text-[#112743]">Arti</label><Input id="legend-name" value={legendForm.data.full_name} onChange={(change) => legendForm.setData('full_name', change.target.value)} required maxLength={255} error={legendForm.errors.full_name} /></div>
                    <div><label htmlFor="legend-category" className="mb-1 block text-xs font-semibold text-[#112743]">Kategori</label><Input id="legend-category" value={legendForm.data.category} onChange={(change) => legendForm.setData('category', change.target.value)} required maxLength={30} error={legendForm.errors.category} /></div>
                    <Button type="submit" loading={legendForm.processing} className="self-end">Tambah singkatan</Button>
                </form>
                <div className="divide-y divide-[#DCE7F3]">
                    {legends.map((l) => (
                        <div key={l.id} className="py-2.5 flex items-start justify-between gap-4">
                            <div>
                                <span className="font-mono font-bold text-xs text-[#0B63CE]">{l.acronym}</span>
                                <div className="text-xs font-medium text-[#112743]">{l.full_name}</div>
                            </div>
                            <span className="text-[10px] text-[#6B7C93] bg-slate-100 px-2 py-0.5 rounded font-mono uppercase">
                                {l.category}
                            </span>
                            {l.event_id === event.id && <button type="button" onClick={() => router.delete(`/admin/event/${event.id}/legenda/${l.id}`)} className="min-h-11 px-2 text-xs font-semibold text-[#DD4D7C] hover:bg-[#FDE8EF] focus-visible:outline-2 focus-visible:outline-[#0B63CE]" aria-label={`Hapus singkatan ${l.acronym}`}>Hapus</button>}
                        </div>
                    ))}
                    {legends.length === 0 && <p className="py-4 text-sm text-[#6B7C93]">Belum ada singkatan untuk event ini.</p>}
                </div>
            </div>
        </div>
    );
}
