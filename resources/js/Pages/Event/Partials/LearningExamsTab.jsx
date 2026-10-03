import { Link } from '@inertiajs/react';
import Badge from '../../../Components/ui/Badge';
import { Award, AlertCircle, PlayCircle, ChevronDown, ChevronUp, Lock, Filter, History, CalendarClock, MapPin } from 'lucide-react';
import { RevisionPaperForm } from './LearningRoomShared';
import { useLearningRoom } from './LearningRoomContext';

export default function LearningExamsTab() {
    const {
        event,
        participant,
        cbtPackages,
        myCbtExams,
        cbtFilter,
        setCbtFilter,
        categoryFilter,
        setCategoryFilter,
        ujianTypeFilter,
        setUjianTypeFilter,
        expandedHistoryId,
        setExpandedHistoryId,
    } = useLearningRoom();

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                        <h3 className="font-display font-bold text-base text-[#0E2747] flex items-center gap-2">
                            <Award className="w-5 h-5 text-purple-600" />
                            Ujian Saya
                        </h3>
                        <p className="text-xs text-[#6B7C93]">
                            Ujian CBT dan asesmen sesuai rundown untuk jalur {participant.track_name} ({participant.track_code}).
                        </p>
                    </div>

                    {/* Filter Status */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
                        {[
                            { id: 'all', label: 'Semua' },
                            { id: 'tersedia', label: 'Tersedia' },
                            { id: 'akan_datang', label: 'Akan Datang' },
                            { id: 'selesai', label: 'Selesai' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setCbtFilter(tab.id)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                                    cbtFilter === tab.id
                                        ? 'bg-[#0E2747] text-white shadow-xs'
                                        : 'bg-white text-[#6B7C93] border border-[#DCE7F3] hover:bg-[#EAF5FF]'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filter Kategori: Sesi | Ujian */}
                <div className="flex items-center gap-2 border-b border-[#DCE7F3] pb-2">
                    <Filter className="w-3.5 h-3.5 text-[#0B63CE] shrink-0" />
                    <span className="text-[11px] font-bold text-[#0E2747] shrink-0">Kategori:</span>
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                        {[
                            { id: 'all', label: 'Semua' },
                            { id: 'sesi', label: 'Sesi' },
                            { id: 'ujian', label: 'Ujian' },
                        ].map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setCategoryFilter(cat.id)}
                                className={`px-3 py-1 rounded-md text-xs font-bold transition-all shrink-0 ${
                                    categoryFilter === cat.id
                                        ? 'bg-[#0E2747] text-white shadow-2xs'
                                        : 'bg-white text-[#6B7C93] border border-[#DCE7F3] hover:bg-[#EAF5FF]'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filter Jenis Ujian */}
                <div className="flex items-center gap-2 border-b border-[#DCE7F3] pb-2">
                    <span className="text-[11px] font-semibold text-[#6B7C93] shrink-0">Tipe:</span>
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                        {[
                            { id: 'all', label: 'Semua Tipe' },
                            { id: 'pre_test', label: 'Pre-Test' },
                            { id: 'module_eval', label: 'Kuis Formatif' },
                            { id: 'post_test', label: 'Post-Test' },
                            { id: 'theory', label: 'Ujian Teori' },
                            { id: 'practical', label: 'Ujian Praktik' },
                        ].map((f) => (
                            <button
                                key={f.id}
                                type="button"
                                onClick={() => setUjianTypeFilter(f.id)}
                                className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all shrink-0 ${
                                    ujianTypeFilter === f.id
                                        ? 'bg-purple-700 text-white'
                                        : 'bg-white text-[#6B7C93] border border-[#DCE7F3] hover:bg-purple-50 hover:text-purple-700'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* List of Exams */}
            {(() => {
                const examsToDisplay = (myCbtExams && myCbtExams.length > 0 ? myCbtExams : cbtPackages)
                    .filter((pkg) => {
                        const stateOk = cbtFilter === 'all'
                            || (cbtFilter === 'tersedia' && pkg.exam_state === 'tersedia')
                            || (cbtFilter === 'akan_datang' && pkg.exam_state === 'akan_datang')
                            || (cbtFilter === 'selesai' && (pkg.has_attempt || pkg.exam_state === 'selesai'));
                        const categoryOk = categoryFilter === 'all'
                            || (categoryFilter === 'sesi' && (pkg.is_session_exam || pkg.exam_type === 'module_eval' || pkg.exam_type === 'kuis'))
                            || (categoryFilter === 'ujian' && (pkg.is_rundown_only || !pkg.is_session_exam || ['pre_test', 'post_test', 'theory', 'remedial'].includes(pkg.exam_type)));
                        const typeOk = ujianTypeFilter === 'all' || pkg.exam_type === ujianTypeFilter || (pkg.exam_type_label || '').toLowerCase().includes(ujianTypeFilter);
                        return stateOk && categoryOk && typeOk;
                    });

                if (examsToDisplay.length === 0) {
                    return (
                        <div className="p-10 text-center bg-white rounded-2xl border border-[#DCE7F3] space-y-2">
                            <Award className="w-8 h-8 text-[#6B7C93] mx-auto opacity-50" />
                            <h5 className="font-bold text-sm text-[#0E2747]">Tidak Ada Ujian pada Filter Ini</h5>
                            <p className="text-xs text-[#6B7C93]">
                                Belum ada paket ujian yang dijadwalkan atau memenuhi filter yang dipilih.
                            </p>
                        </div>
                    );
                }

                return (
                    <div className="space-y-4">
                        {examsToDisplay.map((pkg) => {
                            const isRundownOnly = pkg.is_rundown_only === true;
                            const isAccessible = pkg.is_accessible !== undefined ? pkg.is_accessible : (pkg.attempts_count < pkg.attempts_allowed);
                            const deniedReason = pkg.access_denied_reason;

                            return (
                                <div
                                    key={pkg.entry_key || pkg.id}
                                    className="p-5 rounded-2xl bg-white border border-[#DCE7F3] shadow-xs space-y-4 hover:border-purple-300 transition-all"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                        <div className="space-y-1.5">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                                    {pkg.code}
                                                </span>
                                                <span className="text-xs font-medium text-[#6B7C93] bg-slate-100 px-2 py-0.5 rounded">
                                                    {pkg.exam_type_label || pkg.exam_type}
                                                </span>
                                                {/* State Badge */}
                                                {pkg.exam_state === 'tersedia' && !pkg.has_attempt && !isRundownOnly && (
                                                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 motion-safe:animate-pulse" />
                                                        Sedang Tersedia
                                                    </span>
                                                )}
                                                {pkg.exam_state === 'akan_datang' && (
                                                    <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                                        Akan Datang
                                                    </span>
                                                )}
                                                {pkg.exam_state === 'ditutup' && (
                                                    <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                                        Ujian Ditutup
                                                    </span>
                                                )}
                                                {pkg.has_attempt && (
                                                    <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                                        Sudah Dikerjakan
                                                    </span>
                                                )}
                                                {isRundownOnly && (
                                                    <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                                                        <CalendarClock className="w-3 h-3" aria-hidden="true" />
                                                        Sesuai Rundown
                                                    </span>
                                                )}
                                                {!isAccessible && !isRundownOnly && (
                                                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                                                        <Lock className="w-3 h-3 text-slate-500" />
                                                        Terkunci
                                                    </span>
                                                )}
                                            </div>

                                            <h4 className="font-display font-bold text-base text-[#0E2747]">
                                                {pkg.title}
                                            </h4>
                                            {pkg.description && (
                                                <p className="text-xs text-[#6B7C93] line-clamp-2">
                                                    {pkg.description}
                                                </p>
                                            )}
                                        </div>

                                        {isRundownOnly ? (
                                            <div className="text-left sm:text-right text-xs text-[#6B7C93] shrink-0 font-mono space-y-1">
                                                <div className="font-semibold text-[#0E2747]">Hari {pkg.session_day_number} • {pkg.session_date_label}</div>
                                                <div>{pkg.session_time_slot} WIB</div>
                                                {pkg.session_room && <div className="flex items-center sm:justify-end gap-1"><MapPin className="w-3 h-3" aria-hidden="true" />{pkg.session_room}</div>}
                                            </div>
                                        ) : (
                                            <div className="text-left sm:text-right text-xs text-[#6B7C93] shrink-0 font-mono space-y-0.5">
                                                <div>Durasi: <strong className="text-[#0E2747]">{pkg.duration_minutes} Menit</strong></div>
                                                <div className="text-[11px]">Standar Kelulusan (KKM): <strong className="text-purple-700">{pkg.passing_score}</strong></div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Access Denied Warning Banner if locked */}
                                    {!isAccessible && deniedReason && !isRundownOnly && (
                                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-bold block">{pkg.has_attempt ? 'Status Ujian:' : 'Ujian Belum Dapat Diakses:'}</span>
                                                <span>{deniedReason}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Bottom bar with attempts & CTA */}
                                    {isRundownOnly ? (
                                        <div className="pt-3 border-t border-[#DCE7F3] flex flex-wrap items-center justify-between gap-3 text-xs">
                                            <p className="text-[#6B7C93]">Ujian dilaksanakan langsung oleh panitia sesuai jadwal dan ruang pada rundown.</p>
                                            <span className="inline-flex min-h-11 items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-50 text-blue-800 font-bold border border-blue-200">
                                                <CalendarClock className="w-4 h-4" aria-hidden="true" />
                                                <span>Ikuti Sesuai Rundown</span>
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="pt-3 border-t border-[#DCE7F3] flex flex-wrap items-center justify-between gap-3 text-xs">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[#6B7C93]">
                                                    Percobaan: <strong className="text-[#0E2747]">{pkg.attempts_count || 0}</strong> dari {pkg.attempts_allowed || 1} kali
                                                </span>

                                                {pkg.has_attempt && pkg.last_score !== null && (
                                                    <div className="flex items-center gap-2 pl-3 border-l border-[#DCE7F3]">
                                                        <span className="font-bold text-[#0E2747]">
                                                            Nilai: <span className="text-purple-700 font-mono text-sm">{pkg.last_score}</span>
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                            pkg.is_passed
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : 'bg-rose-100 text-rose-800'
                                                        }`}>
                                                            {pkg.is_passed ? 'Lulus' : 'Belum Memenuhi'}
                                                        </span>
                                                    </div>
                                                )}

                                                {pkg.attempt_status === 'waiting_review' && (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                                        Menunggu Penilaian Esai
                                                    </span>
                                                )}
                                            </div>

                                            {isAccessible ? (
                                                <Link
                                                    href={pkg.exam_url || `/event/${event.slug}/cbt/${pkg.code}`}
                                                    className="inline-flex min-h-11 items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0B63CE] text-white font-bold text-xs hover:bg-[#0A3F82] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                                                >
                                                    <PlayCircle className="w-4 h-4" />
                                                    <span>{pkg.has_attempt ? 'Ujian Ulang' : 'Mulai Ujian'}</span>
                                                </Link>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-500 font-semibold text-xs cursor-not-allowed border border-slate-200"
                                                >
                                                    <Lock className="w-3.5 h-3.5" />
                                                    <span>{pkg.has_attempt ? 'Ujian Selesai (Terkunci)' : 'Ujian Terkunci'}</span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    {pkg.revision_attempt_id && pkg.revision_method === 'paper' && <RevisionPaperForm package={pkg} />}
                                    {pkg.revision_attempt_id && pkg.revision_method === 'retry' && <p className="border-t border-[#DCE7F3] pt-3 text-sm text-[#6B7C93]">Nilai di bawah KKM. Anda dapat mengulang ujian selama kesempatan masih tersedia.</p>}

                                    {/* Riwayat Percobaan Ujian */}
                                    {pkg.attempt_history && pkg.attempt_history.length > 0 && (
                                        <div className="border-t border-[#DCE7F3] pt-3">
                                            <button
                                                type="button"
                                                onClick={() => setExpandedHistoryId(expandedHistoryId === pkg.id ? null : pkg.id)}
                                                className="flex items-center gap-1.5 text-xs font-semibold text-[#6B7C93] hover:text-[#0E2747] transition-colors"
                                            >
                                                <History className="w-3.5 h-3.5" />
                                                Riwayat Percobaan ({pkg.attempt_history.length})
                                                {expandedHistoryId === pkg.id
                                                    ? <ChevronUp className="w-3.5 h-3.5" />
                                                    : <ChevronDown className="w-3.5 h-3.5" />
                                                }
                                            </button>
                                            {expandedHistoryId === pkg.id && (
                                                <div className="mt-2 rounded-xl border border-[#DCE7F3] overflow-hidden">
                                                    <table className="w-full text-[11px]">
                                                        <thead className="bg-[#F0F6FF]">
                                                            <tr>
                                                                <th className="px-3 py-2 text-left font-bold text-[#0E2747]">#</th>
                                                                <th className="px-3 py-2 text-left font-bold text-[#0E2747]">Nilai</th>
                                                                <th className="px-3 py-2 text-left font-bold text-[#0E2747]">Status</th>
                                                                <th className="px-3 py-2 text-left font-bold text-[#0E2747] hidden sm:table-cell">Selesai</th>
                                                                <th className="px-3 py-2 text-left font-bold text-[#0E2747] hidden sm:table-cell">Durasi</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-[#DCE7F3]/60">
                                                            {pkg.attempt_history.map((att) => (
                                                                <tr key={att.attempt_number} className="hover:bg-[#F8FBFF]">
                                                                    <td className="px-3 py-2 font-mono font-bold text-[#6B7C93]">P-{att.attempt_number}</td>
                                                                    <td className="px-3 py-2">
                                                                        {att.score !== null
                                                                            ? <span className="font-mono font-bold text-purple-700">{att.score}</span>
                                                                            : <span className="text-[#6B7C93]">—</span>
                                                                        }
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        {att.is_passed === true && <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Lulus</span>}
                                                                        {att.is_passed === false && <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">Belum</span>}
                                                                        {att.is_passed === null && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">Review</span>}
                                                                    </td>
                                                                    <td className="px-3 py-2 text-[#6B7C93] hidden sm:table-cell">{att.finished_at || '—'}</td>
                                                                    <td className="px-3 py-2 text-[#6B7C93] hidden sm:table-cell">
                                                                        {att.duration_seconds
                                                                            ? `${Math.floor(att.duration_seconds / 60)}m ${att.duration_seconds % 60}s`
                                                                            : '—'
                                                                        }
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );
            })()}
        </div>
    );
}
