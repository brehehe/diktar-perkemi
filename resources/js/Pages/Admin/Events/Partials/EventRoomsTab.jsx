import { router } from '@inertiajs/react';
import Button from '../../../../Components/ui/Button';
import Input from '../../../../Components/ui/Input';
import TableSurface from '../../../../Components/admin/TableSurface';
import { useEventShow } from './EventShowContext';

export default function EventRoomsTab() {
    const {
        event,
        rooms,
        roomForm,
    } = useEventShow();

    return (
        <section aria-labelledby="room-heading" className="space-y-5">
            <div className="border-b border-[#DCE7F3] pb-4">
                <h2 id="room-heading" className="font-display text-xl font-semibold text-[#0A3F82]">Ruang Event</h2>
                <p className="mt-2 text-sm text-[#6B7C93]">Ruang dipakai pada sesi rundown event ini.</p>
            </div>
            <form onSubmit={(submission) => { submission.preventDefault(); roomForm.post(`/admin/event/${event.id}/ruang`, { onSuccess: () => roomForm.reset() }); }} className="flex flex-col gap-3 border border-[#DCE7F3] bg-white p-5 sm:flex-row sm:items-end">
                <div className="flex-1">
                    <label htmlFor="event-room-name" className="mb-1 block text-sm font-semibold text-[#112743]">Nama ruang</label>
                    <Input id="event-room-name" value={roomForm.data.name} onChange={(change) => roomForm.setData('name', change.target.value)} required maxLength={100} error={roomForm.errors.name} />
                </div>
                <Button type="submit" loading={roomForm.processing}>Tambah ruang</Button>
            </form>
            {rooms.length === 0 ? <p className="border border-[#DCE7F3] bg-white p-6 text-sm text-[#6B7C93]">Belum ada ruang untuk event ini.</p> : (
                <TableSurface className="shadow-none">
                    <table className="w-full min-w-[480px] text-left text-sm">
                        <thead className="bg-[#F8FBFF] text-xs font-semibold uppercase tracking-wide text-[#6B7C93]"><tr><th scope="col" className="px-5 py-3">Nama ruang</th><th scope="col" className="px-5 py-3">Sesi terjadwal</th><th scope="col" className="px-5 py-3 text-right">Aksi</th></tr></thead>
                        <tbody className="divide-y divide-[#DCE7F3]">
                            {rooms.map((room) => <tr key={room.id} className="hover:bg-[#F8FBFF]"><th scope="row" className="px-5 py-3 font-semibold text-[#112743]">{room.name}</th><td className="px-5 py-3 text-[#6B7C93]">{room.sessions_count} sesi</td><td className="px-5 py-2 text-right"><button type="button" disabled={room.sessions_count > 0} onClick={() => { if (window.confirm(`Hapus ruang ${room.name}?`)) router.delete(`/admin/event/${event.id}/ruang/${room.id}`); }} className="min-h-11 px-3 text-sm font-semibold text-[#DD4D7C] hover:bg-[#FDE8EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE] disabled:cursor-not-allowed disabled:opacity-50" aria-label={`Hapus ruang ${room.name}`} title={room.sessions_count > 0 ? 'Ruang masih digunakan oleh sesi' : undefined}>Hapus</button></td></tr>)}
                        </tbody>
                    </table>
                </TableSurface>
            )}
        </section>
    );
}
