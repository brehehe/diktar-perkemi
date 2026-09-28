import Button from '../../../../Components/ui/Button';
import Input from '../../../../Components/ui/Input';
import Select from '../../../../Components/ui/Select';
import Textarea from '../../../../Components/ui/Textarea';
import FileInput from '../../../../Components/ui/FileInput';
import { Pencil, Plus, Trash2, Camera, Calendar } from 'lucide-react';
import { dateLabel, Empty } from './EventReportsTabShared';
import { useEventReportsTab } from './EventReportsTabContext';

export default function EventReportActivityPanel() {
    const {
        event,
        sessions,
        subTab,
        editingActivity,
        setDeleteTarget,
        activityForm,
        resetActivity,
        editActivity,
        submitActivity,
        activityList,
        canManageActiveActivity,
    } = useEventReportsTab();

    return (
        <section className="space-y-5">
            <div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF5FF] px-2.5 py-0.5 text-xs font-semibold text-[#0B63CE]">
                        {subTab === 'realisation' ? (
                            <>
                                <Calendar className="size-3.5" aria-hidden="true" />
                                Kluster Sie Acara
                            </>
                        ) : (
                            <>
                                <Camera className="size-3.5" aria-hidden="true" />
                                Kluster Dokumentasi
                            </>
                        )}
                    </span>
                </div>
                <h3 className="mt-2 font-display text-xl font-semibold text-[#0A3F82]">
                    {subTab === 'realisation' ? 'Realisasi Acara Penataran' : 'Dokumentasi Foto & Video Kegiatan'}
                </h3>
                <p className="mt-1 text-xs text-[#6B7C93]">
                    {subTab === 'realisation'
                        ? 'Catat pelaksanaan aktual acara, evaluasi rundown, dan kendala lapangan.'
                        : 'Input nama & jenis kegiatan serta upload foto dan video bukti kegiatan penataran.'}
                </p>
            </div>

            {canManageActiveActivity && (
                <form
                    onSubmit={submitActivity}
                    className="border border-[#DCE7F3] bg-white p-5 shadow-2xs"
                >
                    <h4 className="font-display text-base font-semibold text-[#0E2747]">
                        {editingActivity
                            ? 'Edit Catatan'
                            : (subTab === 'realisation' ? 'Input Realisasi Acara' : 'Upload Dokumentasi Kegiatan')}
                    </h4>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <Input
                            name="title"
                            label="Nama Kegiatan"
                            value={activityForm.data.title}
                            onChange={(e) => activityForm.setData('title', e.target.value)}
                            error={activityForm.errors.title}
                            placeholder="Contoh: Sesi Pembukaan & Janji Kenshi"
                            autoComplete="off"
                            required
                        />
                        <Input
                            name="activity_type"
                            label="Jenis Kegiatan"
                            value={activityForm.data.activity_type}
                            onChange={(e) => activityForm.setData('activity_type', e.target.value)}
                            error={activityForm.errors.activity_type}
                            placeholder="Contoh: Seremoni, Teori, Ujian"
                            autoComplete="off"
                            required
                        />
                        <Input
                            name="activity_occurred_on"
                            label="Tanggal Pelaksanaan"
                            type="date"
                            value={activityForm.data.occurred_on}
                            onChange={(e) => activityForm.setData('occurred_on', e.target.value)}
                            error={activityForm.errors.occurred_on}
                            autoComplete="off"
                            required
                        />
                        <Select
                            name="event_session_id"
                            label="Hubungkan ke Sesi Rundown (Opsional)"
                            value={activityForm.data.event_session_id}
                            onChange={(e) => activityForm.setData('event_session_id', e.target.value)}
                            placeholder="Tidak Dihubungkan"
                            options={sessions.map((session) => ({
                                value: session.id,
                                label: session.topic || `Sesi #${session.id}`,
                            }))}
                            error={activityForm.errors.event_session_id}
                            autoComplete="off"
                        />
                        <div className="sm:col-span-2">
                            <Textarea
                                name="notes"
                                label="Catatan Pelaksanaan"
                                value={activityForm.data.notes}
                                onChange={(e) => activityForm.setData('notes', e.target.value)}
                                error={activityForm.errors.notes}
                                rows={3}
                                placeholder="Catatan pelaksanaan, kehadiran pemateri, kendala lapangan..."
                                autoComplete="off"
                            />
                        </div>
                        {subTab === 'documentation' && (
                            <div className="sm:col-span-2">
                                <FileInput
                                    name="media"
                                    label="Upload Foto atau Video Kegiatan"
                                    accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
                                    onChange={(e) => activityForm.setData('media', e.target.files[0])}
                                    error={activityForm.errors.media}
                                    required={!editingActivity}
                                    helperText="Format: JPG, PNG, WEBP, MP4 (maksimal 100 MB)."
                                />
                            </div>
                        )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <Button type="submit" size="sm" loading={activityForm.processing} icon={Plus}>
                            {editingActivity ? 'Simpan Perubahan' : 'Simpan Data'}
                        </Button>
                        {editingActivity && (
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => resetActivity(subTab)}
                            >
                                Batal
                            </Button>
                        )}
                    </div>
                </form>
            )}

            {activityList.length === 0 ? (
                <Empty>
                    Belum ada catatan {subTab === 'realisation' ? 'realisasi acara' : 'dokumentasi foto/video'}.
                </Empty>
            ) : (
                <div className="grid gap-px border border-[#DCE7F3] bg-[#DCE7F3] md:grid-cols-2">
                    {activityList.map((record) => (
                        <article key={record.id} className="min-w-0 bg-white p-5">
                            {record.media_url && (
                                record.media_type?.startsWith('video/') ? (
                                    <video
                                        controls
                                        preload="metadata"
                                        aria-label={`Video dokumentasi ${record.title}`}
                                        className="mb-4 aspect-video w-full rounded-md bg-[#0E2747]"
                                    >
                                        <source src={record.media_url} type={record.media_type} />
                                    </video>
                                ) : (
                                    <img
                                        src={record.media_url}
                                        alt={`Dokumentasi ${record.title}`}
                                        width="960"
                                        height="540"
                                        loading="lazy"
                                        className="mb-4 aspect-video w-full rounded-md object-cover"
                                    />
                                )
                            )}
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="break-words text-xs font-semibold text-[#0B63CE]">
                                        {record.activity_type} · {dateLabel(record.occurred_on)}
                                    </p>
                                    <h4 className="mt-1 break-words font-display text-base font-semibold text-[#0E2747]">
                                        {record.title}
                                    </h4>
                                </div>
                                {canManageActiveActivity && (
                                    <div className="flex shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => editActivity(record)}
                                            aria-label={`Edit ${record.title}`}
                                            className="inline-flex min-h-8 min-w-8 items-center justify-center text-[#0B63CE] hover:bg-[#EAF5FF]"
                                        >
                                            <Pencil className="size-3.5" aria-hidden="true" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDeleteTarget({
                                                url: `/admin/event/${event.id}/laporan/kegiatan/${record.id}`,
                                                label: record.title,
                                            })}
                                            aria-label={`Hapus ${record.title}`}
                                            className="inline-flex min-h-8 min-w-8 items-center justify-center text-[#DD4D7C] hover:bg-rose-50"
                                        >
                                            <Trash2 className="size-3.5" aria-hidden="true" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            {record.session_title && (
                                <p className="mt-2 break-words text-xs font-medium text-[#6B7C93]">
                                    Sesi: {record.session_title}
                                </p>
                            )}
                            {record.notes && (
                                <p className="mt-2 break-words text-xs leading-relaxed text-[#4A6482]">
                                    {record.notes}
                                </p>
                            )}
                            <p className="mt-3 break-words text-xs text-[#6B7C93]">
                                Dicatat oleh {record.creator_name || '-'}
                            </p>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
