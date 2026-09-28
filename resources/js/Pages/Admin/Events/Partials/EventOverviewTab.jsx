import { Link } from '@inertiajs/react';
import { Clock, ExternalLink, FileText, ChevronRight } from 'lucide-react';
import { useEventShow } from './EventShowContext';

export default function EventOverviewTab() {
    const {
        event,
        sessionsByDay,
        participants,
        tracks,
        stats,
        setActiveTab,
        setSelectedDay,
    } = useEventShow();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl border border-[#DCE7F3] p-6 shadow-xs space-y-4">
                    <h3 className="font-display font-bold text-sm text-[#0E2747] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#0B63CE]" />
                        Deskripsi & Konsep Penataran
                    </h3>
                    <p className="text-xs text-[#112743] leading-relaxed">
                        {event.description || 'Tidak ada deskripsi rinci untuk event ini.'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#DCE7F3] text-xs">
                        <div>
                            <span className="text-[#6B7C93] block text-[11px]">Metode Pembelajaran</span>
                            <span className="font-semibold text-[#0E2747]">{event.learning_method || 'Belum ditetapkan'}</span>
                        </div>
                        <div>
                            <span className="text-[#6B7C93] block text-[11px]">Durasi 1 Jam Pelajaran (JP)</span>
                            <span className="font-semibold text-[#0E2747]">{event.jp_duration_minutes} Menit</span>
                        </div>
                        <div>
                            <span className="text-[#6B7C93] block text-[11px]">Ruang Utama</span>
                            <span className="font-semibold text-[#0E2747]">{event.place}</span>
                        </div>
                        <div>
                            <span className="text-[#6B7C93] block text-[11px]">Penanggung Jawab</span>
                            <span className="font-semibold text-[#0E2747]">{event.responsible_user?.name || 'Belum ditetapkan'}</span>
                        </div>
                        <div>
                            <span className="text-[#6B7C93] block text-[11px]">Status Publikasi Digital</span>
                            <span className="font-semibold text-[#20A47A]">{stats.published_modules} Modul Siap Akses</span>
                        </div>
                    </div>
                </div>

                {/* Upcoming / First Day Agenda */}
                <div className="bg-white rounded-xl border border-[#DCE7F3] p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-display font-bold text-sm text-[#0E2747] flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#EE9B25]" />
                            Agenda Sesi Hari Pertama (Pembukaan & Pleno)
                        </h3>
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedDay(1);
                                setActiveTab('rundown');
                            }}
                            className="text-xs text-[#0B63CE] font-semibold hover:underline flex items-center gap-1"
                        >
                            Buka Rundown Lengkap <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {(sessionsByDay[1]?.sessions || []).slice(0, 4).map((s) => (
                            <div
                                key={s.id}
                                className="p-3.5 rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] flex items-start justify-between gap-4"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-[11px] font-bold text-[#0B63CE] bg-[#EAF5FF] px-2 py-0.5 rounded">
                                            {s.time_slot}
                                        </span>
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${s.session_type?.badge_color || 'bg-slate-100 text-slate-700'}`}>
                                            {s.session_type?.name || 'Sesi'}
                                        </span>
                                        <span className="text-[11px] text-[#6B7C93]">{s.duration_jp} JP</span>
                                    </div>
                                    <div className="font-semibold text-xs text-[#0E2747]">{s.topic}</div>
                                    {s.speaker && (
                                        <div className="text-[11px] text-[#6B7C93]">
                                            Pemateri: <span className="text-[#112743] font-medium">{s.speaker.name}</span>
                                        </div>
                                    )}
                                </div>
                                <span className="text-[11px] font-mono text-[#0A3F82] bg-white px-2 py-1 rounded border border-[#DCE7F3] shrink-0">
                                    {s.room || 'Ruang belum ditetapkan'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Summary Column */}
            <div className="space-y-6">
                <div className="bg-white rounded-xl border border-[#DCE7F3] p-5 shadow-xs space-y-4">
                    <h4 className="font-display font-bold text-xs text-[#0E2747] uppercase tracking-wider">
                        Distribusi Jalur Peserta
                    </h4>
                    <div className="space-y-2">
                        {tracks.map((t) => {
                            const count = participants.filter((p) => p.track_code === t.code).length;
                            return (
                                <div key={t.id} className="flex items-center justify-between text-xs py-1 border-b border-[#DCE7F3]/50 last:border-0">
                                    <span className="flex items-center gap-2">
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${t.badge_color}`}>
                                            {t.code}
                                        </span>
                                        <span className="text-[#112743] truncate max-w-[150px]">{t.name}</span>
                                    </span>
                                    <span className="font-mono font-bold text-[#0E2747]">{count} Kenshi</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-[#DCE7F3] p-5 shadow-xs space-y-4">
                    <h4 className="font-display font-bold text-xs text-[#0E2747] uppercase tracking-wider">
                        Akses Portal Pembelajaran Peserta
                    </h4>
                    <p className="text-xs text-[#6B7C93]">
                        Peserta mengakses portal mandiri untuk check-in event, scan absensi QR sesi, membaca buku digital, dan mengikuti ujian CBT.
                    </p>
                    <div className="p-3 bg-[#EAF5FF] rounded-lg border border-[#0B63CE]/20 space-y-2">
                        <div className="text-xs font-semibold text-[#0B63CE]">Link Cepat Peserta:</div>
                        <div className="font-mono text-[11px] text-[#0A3F82] bg-white p-2 rounded border border-[#DCE7F3] break-all select-all">
                            /event/{event.slug}/ruang-belajar
                        </div>
                        <div className="flex items-center gap-3 pt-1">
                            <Link
                                href={`/event/${event.slug}/welcome`}
                                target="_blank"
                                className="text-xs font-semibold text-[#0B63CE] hover:underline flex items-center gap-1"
                            >
                                <span>3D Welcome Book</span>
                                <ExternalLink className="w-3 h-3" />
                            </Link>
                            <span>•</span>
                            <Link
                                href={`/event/${event.slug}/scan`}
                                target="_blank"
                                className="text-xs font-semibold text-[#0B63CE] hover:underline flex items-center gap-1"
                            >
                                <span>Scan QR Kamera</span>
                                <ExternalLink className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
