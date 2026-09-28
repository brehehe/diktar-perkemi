import { Link } from '@inertiajs/react';
import { BookOpen, Award, PlayCircle, Lock, Video } from 'lucide-react';
import { ModuleResourceLink } from './LearningRoomShared';
import { useLearningRoom } from './LearningRoomContext';

export default function LearningOverviewTab() {
    const {
        event,
        participant,
        modules,
        myLearningModules,
        myCbtExams,
        setActiveTab,
    } = useLearningRoom();

    return (
        <div className="space-y-6">
            {/* Event Quick Overview Card */}
            <div className="bg-white rounded-2xl border border-[#DCE7F3] p-5 sm:p-6 shadow-xs space-y-3">
                <h3 className="font-display font-bold text-sm text-[#0E2747] uppercase tracking-wider">
                    Ringkasan Kegiatan Penataran
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
                    <div className="p-3 bg-[#F8FBFF] rounded-xl border border-[#DCE7F3]">
                        <span className="text-[#6B7C93] block text-[10px] uppercase font-mono">Beban Akreditasi</span>
                        <span className="font-bold text-[#0B63CE] text-base">{event.total_effective_jp} JP</span>
                        <span className="text-[10px] text-[#6B7C93] block">Kurikulum Nasional</span>
                    </div>
                    <div className="p-3 bg-[#F8FBFF] rounded-xl border border-[#DCE7F3]">
                        <span className="text-[#6B7C93] block text-[10px] uppercase font-mono">Jalur Peserta</span>
                        <span className="font-bold text-[#0E2747] text-base">{participant.track_code}</span>
                        <span className="text-[10px] text-[#6B7C93] block truncate">{participant.track_name}</span>
                    </div>
                    <div className="p-3 bg-[#F8FBFF] rounded-xl border border-[#DCE7F3]">
                        <span className="text-[#6B7C93] block text-[10px] uppercase font-mono">Rotasi Kelas</span>
                        <span className="font-bold text-[#7957D5] text-base">Kelompok {participant.rotation_group || 'Belum ditetapkan'}</span>
                        <span className="text-[10px] text-[#6B7C93] block">Sistem Bergilir</span>
                    </div>
                    <div className="p-3 bg-[#F8FBFF] rounded-xl border border-[#DCE7F3]">
                        <span className="text-[#6B7C93] block text-[10px] uppercase font-mono">Kehadiran Sesi</span>
                        <span className="font-bold text-[#20A47A] text-base">{participant.attendance_percentage}%</span>
                        <span className="text-[10px] text-[#20A47A] block">{participant.attended_sessions_count} Sesi Hadir</span>
                    </div>
                </div>
            </div>

            {/* Modul Pembelajaran Saya - Beranda Showcase */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-sm text-[#0E2747] flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#0B63CE]" />
                        Modul Pembelajaran Saya ({participant.track_code})
                    </h3>
                    <button
                        type="button"
                        onClick={() => setActiveTab('materi')}
                        className="text-xs text-[#0B63CE] font-semibold hover:underline"
                    >
                        Lihat Semua ({myLearningModules?.length || modules.length}) &rarr;
                    </button>
                </div>

                {myLearningModules && myLearningModules.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {myLearningModules.slice(0, 4).map((m) => {
                            const firstMat = m.materials?.[0];
                            return (
                                <div
                                    key={m.id}
                                    className="p-4 rounded-xl bg-white border border-[#DCE7F3] shadow-2xs hover:border-[#0B63CE]/40 transition-all flex flex-col justify-between space-y-3"
                                >
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-[10px]">
                                            <span className="font-mono font-bold text-[#0B63CE] bg-[#EAF5FF] px-1.5 py-0.5 rounded">
                                                {m.code}
                                            </span>
                                            <span className="text-[#6B7C93] font-mono">{m.total_jp} JP • {m.category}</span>
                                        </div>
                                        <h4 className="font-bold text-xs text-[#0E2747] line-clamp-2">
                                            {m.title}
                                        </h4>
                                        <p className="text-[11px] text-[#6B7C93]">
                                            {m.materials_count || m.materials?.length || 0} Materi Koleksi Digital
                                        </p>
                                    </div>

                                    {firstMat ? (
                                        <a
                                            href={firstMat.reader_url || `/koleksi/${firstMat.slug}/baca`}
                                            className={`inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-white text-xs font-semibold transition-colors ${
                                                firstMat.type === 'video' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-[#0B63CE] hover:bg-[#0A3F82]'
                                            }`}
                                        >
                                            {firstMat.type === 'video' ? <PlayCircle className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                                            <span>{firstMat.cta_text || (firstMat.type === 'video' ? 'Tonton Video' : 'Baca E-Book')}</span>
                                        </a>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('materi')}
                                            className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-[#DCE7F3] text-xs font-semibold text-[#0B63CE] hover:bg-[#F8FBFF]"
                                        >
                                            <span>Buka Modul</span>
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {modules.slice(0, 4).map((m) => (
                            <div
                                key={m.id}
                                className="p-4 rounded-xl bg-white border border-[#DCE7F3] shadow-2xs hover:border-[#0B63CE]/40 transition-all flex flex-col justify-between space-y-3"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-[10px]">
                                        <span className="font-mono font-bold text-[#0B63CE] bg-[#EAF5FF] px-1.5 py-0.5 rounded">
                                            {m.code}
                                        </span>
                                        <span className="text-[#6B7C93] font-mono">{m.duration_jp} JP</span>
                                    </div>
                                    <h4 className="font-bold text-xs text-[#0E2747] line-clamp-2">
                                        {m.title}
                                    </h4>
                                    <p className="text-[11px] text-[#6B7C93] truncate">
                                        {m.speaker}
                                    </p>
                                </div>

                                <ModuleResourceLink module={m} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Ujian CBT Saya - Beranda Showcase */}
            {myCbtExams && myCbtExams.length > 0 && (
                <div className="space-y-3 pt-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-display font-bold text-sm text-[#0E2747] flex items-center gap-2">
                            <Award className="w-4 h-4 text-purple-600" />
                            Ujian CBT Saya
                        </h3>
                        <button
                            type="button"
                            onClick={() => setActiveTab('ujian')}
                            className="inline-flex min-h-11 items-center whitespace-nowrap text-xs font-semibold text-[#0B63CE] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                        >
                            Buka Ujian Saya ({myCbtExams.length}) &rarr;
                        </button>
                    </div>

                    <div className="space-y-2">
                        {myCbtExams.slice(0, 2).map((pkg) => {
                            const isAccessible = pkg.is_accessible;
                            return (
                                <div
                                    key={pkg.id}
                                    className="flex flex-col items-stretch justify-between gap-3 rounded-xl border border-[#DCE7F3] bg-white p-3.5 text-xs sm:flex-row sm:items-center"
                                >
                                    <div className="space-y-0.5 min-w-0">
                                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                                            <span className="shrink-0 rounded border border-purple-200 bg-purple-50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-purple-700">
                                                {pkg.code}
                                            </span>
                                            <span className="min-w-0 break-words font-bold text-[#0E2747]">
                                                {pkg.title}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#6B7C93]">
                                            <span>{pkg.exam_type_label || pkg.exam_type}</span>
                                            <span>• {pkg.duration_minutes} Menit</span>
                                            <span>• KKM: {pkg.passing_score}</span>
                                        </div>
                                    </div>

                                    <div className="shrink-0 self-start sm:self-center flex items-center gap-2">
                                        {pkg.has_attempt && pkg.last_score !== null && (
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                pkg.is_passed
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-rose-100 text-rose-800'
                                            }`}>
                                                {pkg.last_score} ({pkg.is_passed ? 'Lulus' : 'Belum Memenuhi'})
                                            </span>
                                        )}
                                        {isAccessible ? (
                                            <Link
                                                href={pkg.exam_url || `/event/${event.slug}/cbt/${pkg.code}`}
                                                className="inline-flex min-h-11 items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0B63CE] text-white font-bold text-xs hover:bg-[#0A3F82] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                                            >
                                                <PlayCircle className="w-3.5 h-3.5" />
                                                <span>{pkg.has_attempt ? 'Ujian Ulang' : 'Mulai Ujian'}</span>
                                            </Link>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('ujian')}
                                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 px-2.5 py-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 border border-slate-200 transition-colors"
                                            >
                                                <Lock className="w-3 h-3 text-slate-500" />
                                                <span>{pkg.has_attempt ? 'Selesai (Terkunci)' : 'Terkunci'}</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
