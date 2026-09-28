import { BookOpen, PlayCircle, Lock, Layers, Video } from 'lucide-react';
import { ModuleResourceLink } from './LearningRoomShared';
import { useLearningRoom } from './LearningRoomContext';

export default function LearningMaterialsTab() {
    const {
        event,
        participant,
        modules,
        myLearningModules,
    } = useLearningRoom();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <h3 className="font-display font-bold text-base text-[#0E2747] flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#0B63CE]" />
                        Modul Pembelajaran Saya
                    </h3>
                    <p className="text-xs text-[#6B7C93]">
                        Kurikulum kompetensi dan koleksi digital yang disesuaikan dengan jalur peserta Anda ({participant.track_name} • {participant.track_code}).
                    </p>
                </div>
                <span className="text-xs font-mono font-bold text-[#0B63CE] bg-[#EAF5FF] px-2.5 py-1 rounded-full border border-[#DCE7F3] shrink-0 self-start sm:self-auto">
                    {(myLearningModules && myLearningModules.length > 0 ? myLearningModules.length : modules.length)} Modul Tersedia
                </span>
            </div>

            {myLearningModules && myLearningModules.length > 0 ? (
                <div className="space-y-4">
                    {myLearningModules.map((lm) => (
                        <div
                            key={lm.id}
                            className="p-5 rounded-2xl bg-white border border-[#DCE7F3] shadow-xs space-y-4 hover:border-[#0B63CE]/40 transition-all"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[#DCE7F3]">
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-mono text-xs font-bold text-[#0B63CE] bg-[#EAF5FF] px-2 py-0.5 rounded">
                                            {lm.code}
                                        </span>
                                        <span className="text-xs font-medium text-[#6B7C93] bg-slate-100 px-2 py-0.5 rounded">
                                            {lm.category}
                                        </span>
                                        <span className="text-xs font-medium text-[#6B7C93]">
                                            Tingkat {lm.level}
                                        </span>
                                        <span
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                                lm.is_required
                                                    ? 'bg-rose-100 text-rose-800'
                                                    : 'bg-slate-100 text-slate-700'
                                            }`}
                                        >
                                            {lm.is_required ? 'Wajib' : 'Pilihan'}
                                        </span>
                                    </div>
                                    <h4 className="font-display font-bold text-base text-[#0E2747]">
                                        {lm.title}
                                    </h4>
                                </div>
                                <div className="text-left sm:text-right shrink-0 font-mono text-xs text-[#6B7C93]">
                                    <span className="font-bold text-[#0B63CE] text-sm block">{lm.total_jp} JP</span>
                                    <span className="text-[11px]">{lm.materials?.length || 0} Materi Belajar</span>
                                </div>
                            </div>

                            {/* Competency outcomes badges */}
                            {lm.competency_outcomes && lm.competency_outcomes.length > 0 && (
                                <div className="text-xs space-y-1">
                                    <span className="text-[10px] font-bold text-[#6B7C93] uppercase tracking-wider block">
                                        Target Capaian Kompetensi:
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {lm.competency_outcomes.map((cap, cIdx) => (
                                            <span key={cIdx} className="px-2 py-0.5 rounded bg-blue-50 text-[#0B63CE] text-[11px] font-medium border border-blue-100">
                                                ✓ {cap}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Connected Digital Materials List */}
                            <div className="space-y-2 pt-2">
                                <span className="text-xs font-bold text-[#0E2747] flex items-center gap-1.5">
                                    <Layers className="w-3.5 h-3.5 text-[#0B63CE]" />
                                    Materi & Koleksi Digital Terhubung:
                                </span>

                                {lm.materials && lm.materials.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {lm.materials.map((mat) => (
                                            <div
                                                key={mat.id}
                                                className="p-3.5 rounded-xl bg-[#F8FBFF] border border-[#DCE7F3] flex flex-col justify-between space-y-2.5 hover:bg-white hover:border-[#0B63CE]/40 transition-all"
                                            >
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between text-[10px]">
                                                        <span className="font-mono font-bold text-[#6B7C93]">
                                                            Urutan #{mat.sort_order || 1}
                                                        </span>
                                                        {mat.estimated_duration_minutes && (
                                                            <span className="text-[#6B7C93] font-mono">
                                                                ± {mat.estimated_duration_minutes} Menit
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h5 className="font-bold text-xs text-[#0E2747] line-clamp-2">
                                                        {mat.title}
                                                    </h5>
                                                    {mat.instructor_notes && (
                                                        <p className="text-[11px] text-[#6B7C93] italic line-clamp-2">
                                                            "{mat.instructor_notes}"
                                                        </p>
                                                    )}
                                                </div>

                                                {mat.is_locked ? (
                                                    <span
                                                        className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed"
                                                        title="Absensi pada sesi materi ini wajib dicatat sebelum membuka materi"
                                                    >
                                                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>Perlu Absensi Sesi</span>
                                                    </span>
                                                ) : (
                                                    <a
                                                        href={mat.reader_url || `/koleksi/${mat.slug}/baca`}
                                                        className={`inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold text-white transition-colors ${
                                                            mat.type === 'video'
                                                                ? 'bg-purple-600 hover:bg-purple-700'
                                                                : 'bg-[#0B63CE] hover:bg-[#0A3F82]'
                                                        }`}
                                                    >
                                                        {mat.type === 'video' ? (
                                                            <PlayCircle className="w-3.5 h-3.5" />
                                                        ) : (
                                                            <BookOpen className="w-3.5 h-3.5" />
                                                        )}
                                                        <span>{mat.cta_text || (mat.type === 'video' ? 'Tonton Video' : 'Baca E-Book')}</span>
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-[#6B7C93] italic">
                                        Materi digital dalam modul ini sedang dipersiapkan oleh instruktur penataran.
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {modules.map((m) => (
                        <div
                            key={m.id}
                            className="p-5 rounded-2xl bg-white border border-[#DCE7F3] shadow-xs flex flex-col justify-between space-y-4"
                        >
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-mono font-bold text-[#0B63CE] bg-[#EAF5FF] px-2 py-0.5 rounded">
                                        {m.code}
                                    </span>
                                    <span className="font-mono text-[#6B7C93]">{m.duration_jp} JP</span>
                                </div>
                                <h4 className="font-bold text-sm text-[#0E2747] leading-snug">
                                    {m.title}
                                </h4>
                                <p className="text-xs text-[#6B7C93]">
                                    Instruktur: <strong className="text-[#112743]">{m.speaker}</strong>
                                </p>
                            </div>

                            <div className="pt-3 border-t border-[#DCE7F3] flex items-center justify-between">
                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    {m.resource_locked ? 'Perlu absensi sesi' : 'Modul event'}
                                </span>

                                <ModuleResourceLink module={m} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
