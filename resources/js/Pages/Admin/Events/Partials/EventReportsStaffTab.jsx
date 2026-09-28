import Button from '../../../../Components/ui/Button';
import Select from '../../../../Components/ui/Select';
import { Trash2, Users } from 'lucide-react';
import { DUTY_LABELS, Empty } from './EventReportsPageShared';
import { useEventReportsPage } from './EventReportsPageContext';

export default function EventReportsStaffTab() {
    const {
        event,
        staff,
        staffCandidates,
        setDeleteTarget,
        staffForm,
        focusFirstError,
    } = useEventReportsPage();

    return (
        <section className="space-y-5" aria-labelledby="staff-title">
            <div>
                <h2 id="staff-title" className="font-display text-2xl font-semibold text-[#0A3F82]">
                    Penugasan Kluster Petugas Event
                </h2>
                <p className="mt-1 text-sm text-[#6B7C93]">
                    Tetapkan user bertugas untuk mengelola kluster: Bendahara (keuangan & bukti), Sie Acara (realisasi), dan Dokumentasi (foto & video).
                </p>
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    staffForm.post(`/admin/event/${event.id}/laporan/petugas`, {
                        preserveScroll: true,
                        onSuccess: () => staffForm.reset(),
                        onError: focusFirstError,
                    });
                }}
                className="grid gap-4 border border-[#DCE7F3] bg-white p-5 sm:grid-cols-[1fr_260px_auto] sm:items-end shadow-2xs"
            >
                <Select
                    name="user_id"
                    label="Pilih Pengguna"
                    value={staffForm.data.user_id}
                    onChange={(e) => staffForm.setData('user_id', e.target.value)}
                    options={staffCandidates.map((user) => ({
                        value: user.id,
                        label: `${user.name} (${user.role}) - ${user.email}`,
                    }))}
                    error={staffForm.errors.user_id}
                    autoComplete="off"
                    required
                />
                <Select
                    name="duty"
                    label="Kluster Tugas"
                    value={staffForm.data.duty}
                    onChange={(e) => staffForm.setData('duty', e.target.value)}
                    options={Object.entries(DUTY_LABELS).map(([value, label]) => ({
                        value,
                        label,
                    }))}
                    error={staffForm.errors.duty}
                    autoComplete="off"
                />
                <Button type="submit" loading={staffForm.processing} icon={Users}>
                    Tetapkan Petugas
                </Button>
            </form>

            {staff.length === 0 ? (
                <Empty>Belum ada petugas khusus yang ditetapkan untuk kegiatan event ini.</Empty>
            ) : (
                <div className="divide-y divide-[#DCE7F3] border border-[#DCE7F3] bg-white shadow-2xs">
                    {staff.map((assignment) => (
                        <div
                            key={assignment.id}
                            className="flex items-center justify-between gap-4 px-5 py-4"
                        >
                            <div className="min-w-0">
                                <p className="break-words font-semibold text-[#112743]">
                                    {assignment.user.name}
                                </p>
                                <p className="break-words text-xs text-[#6B7C93]">
                                    {DUTY_LABELS[assignment.duty]} · {assignment.user.email}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDeleteTarget({
                                    url: `/admin/event/${event.id}/laporan/petugas/${assignment.id}`,
                                    label: `${assignment.user.name} sebagai ${DUTY_LABELS[assignment.duty]}`,
                                })}
                                aria-label={`Hapus penugasan ${assignment.user.name}`}
                                className="inline-flex min-h-9 min-w-9 shrink-0 items-center justify-center text-[#DD4D7C] hover:bg-rose-50"
                            >
                                <Trash2 className="size-4" aria-hidden="true" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
