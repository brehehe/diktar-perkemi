import { router } from '@inertiajs/react';
import Button from '../../../../Components/ui/Button';
import Input from '../../../../Components/ui/Input';
import Select from '../../../../Components/ui/Select';
import Checkbox from '../../../../Components/ui/Checkbox';
import { useEventShow } from './EventShowContext';

export default function EventDocumentsTab() {
    const {
        event,
        requirementForm,
        facilityForm,
    } = useEventShow();

    return (
        <section aria-labelledby="event-documents" className="border border-[#DCE7F3] bg-white p-5 sm:p-6">
            <h2 id="event-documents" className="font-display text-lg font-bold text-[#0E2747]">Dokumen & Ketentuan Event</h2>
            <div className="mt-5 grid gap-6 md:grid-cols-2">
                <div>
                    <h3 className="text-sm font-bold text-[#0E2747]">Persyaratan peserta</h3>
                    <form onSubmit={(submission) => { submission.preventDefault(); requirementForm.post(`/admin/event/${event.id}/persyaratan`, { onSuccess: () => requirementForm.reset() }); }} className="mt-3 space-y-2">
                        <label htmlFor="event-requirement" className="block text-xs font-semibold text-[#112743]">Persyaratan baru</label>
                        <Input id="event-requirement" value={requirementForm.data.item} onChange={(change) => requirementForm.setData('item', change.target.value)} required maxLength={255} error={requirementForm.errors.item} />
                        <Checkbox checked={requirementForm.data.mandatory} onChange={(change) => requirementForm.setData('mandatory', change.target.checked)} label="Wajib" />
                        <Button type="submit" loading={requirementForm.processing}>Tambah persyaratan</Button>
                    </form>
                    {event.requirements_checklist?.length ? (
                        <ul className="mt-3 divide-y divide-[#DCE7F3] text-sm text-[#112743]">
                            {event.requirements_checklist.map((item, index) => <li key={index} className="flex items-center justify-between gap-3 py-2"><span>{item.item || item.name || String(item)}{item.mandatory === false && <span className="ml-2 text-xs text-[#6B7C93]">Opsional</span>}</span><button type="button" onClick={() => router.delete(`/admin/event/${event.id}/persyaratan/${index}`)} className="min-h-11 px-2 text-xs font-semibold text-[#DD4D7C] hover:bg-[#FDE8EF] focus-visible:outline-2 focus-visible:outline-[#0B63CE]" aria-label={`Hapus persyaratan ${item.item || item.name}`}>Hapus</button></li>)}
                        </ul>
                    ) : <p className="mt-3 text-sm text-[#6B7C93]">Belum ada persyaratan yang dicatat.</p>}
                </div>
                <div>
                    <h3 className="text-sm font-bold text-[#0E2747]">Fasilitas yang dicatat</h3>
                    <form onSubmit={(submission) => { submission.preventDefault(); facilityForm.post(`/admin/event/${event.id}/fasilitas`, { onSuccess: () => facilityForm.reset() }); }} className="mt-3 space-y-2">
                        <label htmlFor="event-facility" className="block text-xs font-semibold text-[#112743]">Fasilitas baru</label>
                        <Input id="event-facility" value={facilityForm.data.name} onChange={(change) => facilityForm.setData('name', change.target.value)} required maxLength={255} error={facilityForm.errors.name} />
                        <label htmlFor="event-facility-status" className="block text-xs font-semibold text-[#112743]">Status</label>
                        <Select id="event-facility-status" value={facilityForm.data.status} onChange={(change) => facilityForm.setData('status', change.target.value)}><option value="prepared">Disiapkan</option><option value="ready">Siap</option><option value="unavailable">Belum tersedia</option></Select>
                        <Button type="submit" loading={facilityForm.processing}>Tambah fasilitas</Button>
                    </form>
                    {event.facilities_checklist?.length ? (
                        <ul className="mt-3 divide-y divide-[#DCE7F3] text-sm text-[#112743]">
                            {event.facilities_checklist.map((item, index) => <li key={index} className="flex items-center justify-between gap-3 py-2"><span>{item.name || item.item || String(item)}{item.status && <span className="ml-2 text-xs text-[#6B7C93]">({item.status})</span>}</span><button type="button" onClick={() => router.delete(`/admin/event/${event.id}/fasilitas/${index}`)} className="min-h-11 px-2 text-xs font-semibold text-[#DD4D7C] hover:bg-[#FDE8EF] focus-visible:outline-2 focus-visible:outline-[#0B63CE]" aria-label={`Hapus fasilitas ${item.name || item.item}`}>Hapus</button></li>)}
                        </ul>
                    ) : <p className="mt-3 text-sm text-[#6B7C93]">Belum ada fasilitas yang dicatat.</p>}
                </div>
            </div>
        </section>
    );
}
