import { Link, router } from '@inertiajs/react';
import Button from '../../../../Components/ui/Button';
import Input from '../../../../Components/ui/Input';
import Select from '../../../../Components/ui/Select';
import Checkbox from '../../../../Components/ui/Checkbox';
import { ExternalLink, UserCheck, Sparkles, Key } from 'lucide-react';
import { useEventShow } from './EventShowContext';
import { useIsProdas } from '../../../../Utils/isProdas';

export default function EventSpeakersTab() {
    const isProdas = useIsProdas();
    const {
        event,
        speakers,
        stats,
        isPortalAdmin,
        speakerForm,
        setAccountTargetSpeaker,
        speakerAccountForm,
    } = useEventShow();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#DCE7F3]">
                <div>
                    <h3 className="font-display font-bold text-sm text-[#0E2747]">
                        {isProdas ? 'Dewan Guru & Instruktur Kegiatan' : 'Dewan Guru & Instruktur Penataran'}
                    </h3>
                    <p className="text-xs text-[#6B7C93]">
                        Pemateri internal PERKEMI dan narasumber eksternal pengampu materi kurikulum.
                    </p>
                </div>
                {isPortalAdmin && <Link
                    href="/admin/master/pemateri"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0B63CE] text-white text-xs font-semibold hover:bg-[#0A3F82]"
                >
                    <span>Kelola Master Pemateri</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                </Link>}
            </div>

            <form onSubmit={(submission) => { submission.preventDefault(); speakerForm.post(`/admin/event/${event.id}/pemateri`, { onSuccess: () => speakerForm.reset() }); }} className="grid gap-3 border border-[#DCE7F3] bg-white p-5 sm:grid-cols-2">
                <div><label htmlFor="event-speaker-name" className="mb-1 block text-xs font-semibold text-[#112743]">Nama pemateri</label><Input id="event-speaker-name" value={speakerForm.data.name} onChange={(change) => speakerForm.setData('name', change.target.value)} required error={speakerForm.errors.name} /></div>
                <div><label htmlFor="event-speaker-type" className="mb-1 block text-xs font-semibold text-[#112743]">Jenis</label><Select id="event-speaker-type" value={speakerForm.data.type} onChange={(change) => speakerForm.setData('type', change.target.value)}><option value="internal">Internal</option><option value="external">Eksternal</option></Select></div>
                <div><label htmlFor="event-speaker-degree" className="mb-1 block text-xs font-semibold text-[#112743]">Gelar</label><Input id="event-speaker-degree" value={speakerForm.data.title_degree} onChange={(change) => speakerForm.setData('title_degree', change.target.value)} /></div>
                <div><label htmlFor="event-speaker-expertise" className="mb-1 block text-xs font-semibold text-[#112743]">Keahlian</label><Input id="event-speaker-expertise" value={speakerForm.data.specialization} onChange={(change) => speakerForm.setData('specialization', change.target.value)} /></div>
                <div className="sm:col-span-2"><label htmlFor="event-speaker-email" className="mb-1 block text-xs font-semibold text-[#112743]">Email Kontak / Akun Login (opsional)</label><Input id="event-speaker-email" type="email" placeholder="pemateri@perkemi.id" value={speakerForm.data.contact_email} onChange={(change) => speakerForm.setData('contact_email', change.target.value)} /></div>
                <div className="sm:col-span-2 pt-1">
                    <Checkbox
                        id="event-speaker-supervisor"
                        checked={speakerForm.data.is_supervisor}
                        onChange={(e) => speakerForm.setData('is_supervisor', e.target.checked)}
                        label={<><Sparkles className="mr-1 inline-block w-3.5 h-3.5 text-[#F59E0B]" />Tetapkan sebagai Pemateri Supervisor (dapat memantau & mengakses seluruh jadwal pemateri)</>}
                    />
                </div>
                <div className="sm:col-span-2 pt-2">
                    <Button type="submit" loading={speakerForm.processing}>Tambah pemateri</Button>
                </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {speakers.filter((speaker) => speaker.event_id === event.id || speaker.sessions_count > 0 || speaker.modules_count > 0).map((sp) => (
                    <div
                        key={sp.id}
                        className="p-5 rounded-xl bg-white border border-[#DCE7F3] shadow-xs flex flex-col justify-between"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#EAF5FF] text-[#0B63CE] flex items-center justify-center font-bold text-sm shrink-0 border border-[#0B63CE]/20">
                                {sp.dan_roman ? sp.dan_roman : 'INST'}
                            </div>
                            <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex flex-wrap items-center justify-between gap-1.5">
                                    <h4 className="font-bold text-xs sm:text-sm text-[#0E2747] truncate">
                                        {sp.name}
                                    </h4>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                                            sp.type === 'internal'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-emerald-100 text-emerald-800'
                                        }`}>
                                            {sp.type_label}
                                        </span>
                                        {sp.is_supervisor ? (
                                            <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-[#F59E0B] text-slate-900 border border-amber-300 flex items-center gap-1">
                                                <Sparkles className="w-2.5 h-2.5 fill-current" />
                                                Supervisor
                                            </span>
                                        ) : (
                                            <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-600">
                                                Reguler
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs text-[#6B7C93]">{sp.role_info}</p>
                                <div className="pt-1 flex items-center gap-3 text-[11px] text-[#0A3F82] font-mono">
                                    <span>{sp.sessions_count} Sesi Rundown</span>
                                    <span>•</span>
                                    <span>{sp.total_jp} JP Diajarkan</span>
                                </div>
                            </div>
                        </div>

                        {/* Account Management & Supervisor Toggle Area */}
                        <div className="pt-3 mt-3 border-t border-[#DCE7F3] space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5">
                                    <UserCheck className="w-3.5 h-3.5 text-[#0B63CE]" />
                                    {sp.has_account ? (
                                        <span className="text-[#20A47A] font-medium text-[11px] flex items-center gap-1">
                                            Akun: <strong className="font-mono text-[#112743]">{sp.user_email}</strong>
                                        </span>
                                    ) : (
                                        <span className="text-[#6B7C93] text-[11px]">
                                            Belum ada akun login
                                        </span>
                                    )}
                                </div>

                                {sp.event_id === event.id && (
                                    <button
                                        type="button"
                                        disabled={sp.sessions_count > 0 || sp.modules_count > 0}
                                        onClick={() => router.delete(`/admin/event/${event.id}/pemateri/${sp.id}`)}
                                        className="text-[11px] text-[#DD4D7C] hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                                        title="Hapus pemateri dari event ini"
                                    >
                                        Hapus
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        router.patch(`/admin/event/${event.id}/pemateri/${sp.id}/toggle-supervisor`, {}, {
                                            preserveScroll: true,
                                        });
                                    }}
                                    className={`text-[11px] font-semibold px-2.5 py-1 rounded transition-colors ${
                                        sp.is_supervisor
                                            ? 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300'
                                            : 'bg-[#F8FBFF] text-[#0B63CE] hover:bg-[#EAF5FF] border border-[#BCE0FD]'
                                    }`}
                                    title={sp.is_supervisor ? "Cabut wewenang supervisor" : "Jadikan pemateri supervisor untuk melihat semua jadwal"}
                                >
                                    {sp.is_supervisor ? 'Hapus Status Supervisor' : 'Jadikan Supervisor'}
                                </button>

                                {sp.has_account ? (
                                    <Link
                                        href={`/admin/pengguna?q=${encodeURIComponent(sp.user_email || sp.raw_name || sp.name)}`}
                                        className="text-[11px] font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 flex items-center gap-1"
                                        title="Buka panel admin pengguna untuk ubah password"
                                    >
                                        <Key className="w-3 h-3 text-[#0B63CE]" />
                                        Ubah Password di Pengguna
                                    </Link>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAccountTargetSpeaker(sp);
                                            speakerAccountForm.setData({
                                                email: sp.contact_email || sp.user_email || '',
                                                password: 'Pemateri2026!',
                                            });
                                            speakerAccountForm.clearErrors();
                                        }}
                                        className="text-[11px] font-semibold px-2.5 py-1 rounded bg-[#0B63CE] text-white hover:bg-[#0A3F82] flex items-center gap-1 shadow-xs"
                                    >
                                        <Key className="w-3 h-3" />
                                        Buatkan Akun Login
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {stats.total_speakers === 0 && <p className="text-sm text-[#6B7C93]">Belum ada pemateri untuk event ini.</p>}
            </div>
        </div>
    );
}
