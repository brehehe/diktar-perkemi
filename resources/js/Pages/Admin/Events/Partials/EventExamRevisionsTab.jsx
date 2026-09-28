import { Link, router } from '@inertiajs/react';
import { useEventShow } from './EventShowContext';

export default function EventExamRevisionsTab() {
    const {
        event,
        examRevisions,
    } = useEventShow();

    return (
        <section aria-labelledby="revision-heading" className="space-y-5">
            <div className="border-b border-[#DCE7F3] pb-4">
                <h2 id="revision-heading" className="font-display text-xl font-semibold text-[#0A3F82]">Cek Revisi Ujian Peserta</h2>
                <p className="mt-2 text-sm text-[#6B7C93]">Makalah PDF dikirim oleh peserta yang nilainya di bawah KKM pada ujian dengan opsi revisi makalah.</p>
            </div>
            {examRevisions.length === 0 ? <p className="border border-[#DCE7F3] bg-white p-6 text-sm text-[#6B7C93]">Belum ada revisi ujian yang dikirim.</p> : (
                <ul className="divide-y divide-[#DCE7F3] border-y border-[#DCE7F3]">
                    {examRevisions.map((revision) => (
                        <li key={revision.id} className="grid gap-3 bg-white px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                            <div>
                                <p className="font-semibold text-[#0E2747]">{revision.participant_name}</p>
                                <p className="text-sm text-[#6B7C93]">{revision.package_title} · Nilai {revision.score} · Dikirim {revision.submitted_at}</p>
                                <p className="mt-1 text-xs font-semibold text-[#0A3F82]">Status: {revision.status === 'accepted' ? 'Diterima' : revision.status === 'rejected' ? 'Perlu perbaikan' : 'Menunggu pemeriksaan'}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Link href={`/admin/event/${event.id}/revisi/${revision.id}/baca`} className="inline-flex min-h-11 items-center border border-[#0B63CE] px-3 text-sm font-semibold text-[#0A3F82] hover:bg-[#EAF5FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE]">Baca flipbook</Link>
                                <a href={revision.download_url} className="inline-flex min-h-11 items-center border border-[#DCE7F3] px-3 text-sm font-semibold text-[#0B63CE] hover:bg-[#EAF5FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE]">Unduh PDF</a>
                                <button type="button" onClick={() => router.patch(`/admin/event/${event.id}/revisi/${revision.id}`, { revision_status: 'accepted' })} disabled={revision.status === 'accepted'} className="min-h-11 border border-[#20A47A] px-3 text-sm font-semibold text-[#0E2747] hover:bg-[#E8F8F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE] disabled:opacity-50">Terima</button>
                                <button type="button" onClick={() => router.patch(`/admin/event/${event.id}/revisi/${revision.id}`, { revision_status: 'rejected' })} disabled={revision.status === 'rejected'} className="min-h-11 border border-[#DD4D7C] px-3 text-sm font-semibold text-[#0E2747] hover:bg-[#FDE8EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE] disabled:opacity-50">Minta perbaikan</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
