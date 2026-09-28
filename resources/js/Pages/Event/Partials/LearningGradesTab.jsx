import { Link } from '@inertiajs/react';
import { Clock, Award, ExternalLink, CheckCircle2, FileText, Shield, Check, AlertCircle, ChevronDown, ChevronUp, CheckSquare, History, TrendingUp, Info } from 'lucide-react';
import { useLearningRoom } from './LearningRoomContext';

export default function LearningGradesTab() {
    const {
        event,
        participant,
        myCbtExams,
        certificate,
        transcript,
        gradeSummary,
        setActiveTab,
        expandedHistoryId,
        setExpandedHistoryId,
    } = useLearningRoom();

    return (
        <div className="space-y-6">
            {/* Header & Quick Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#DCE7F3] shadow-xs">
                <div>
                    <h3 className="font-display font-bold text-lg text-[#0E2747] flex items-center gap-2">
                        <Award className="w-5 h-5 text-[#0B63CE]" />
                        Riwayat Nilai & Hasil Ujian
                    </h3>
                    <p className="text-xs text-[#6B7C93] mt-1">
                        Transkrip evaluasi CBT dan capaian kompetensi penataran untuk jalur <span className="font-semibold text-[#0E2747]">{participant.track_name} ({participant.track_code})</span>.
                    </p>
                </div>
                {transcript?.download_url && (
                    <a
                        href={transcript.download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-[#0E2747] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0B63CE] transition shadow-xs shrink-0"
                    >
                        <FileText className="w-3.5 h-3.5 text-[#EE9B25]" />
                        <span>Unduh E-Transkrip Resmi</span>
                    </a>
                )}
            </div>

            {/* 4 Summary Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Card 1: Rata-Rata Nilai */}
                <div className="bg-white p-4 rounded-xl border border-[#DCE7F3] shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[#6B7C93] text-xs font-medium mb-2">
                        <span>Rata-Rata Nilai</span>
                        <TrendingUp className="w-4 h-4 text-[#0B63CE]" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl sm:text-3xl font-extrabold font-display text-[#0E2747]">
                            {gradeSummary?.average_score !== null && gradeSummary?.average_score !== undefined
                                ? Number(gradeSummary.average_score).toFixed(1)
                                : '-'}
                        </span>
                        <span className="text-xs text-[#6B7C93]">/ 100</span>
                    </div>
                    <div className="mt-2 text-[11px] text-[#6B7C93] flex items-center gap-1">
                        <span>Standar KKM:</span>
                        <span className="font-bold text-[#0E2747]">≥ 75.0</span>
                    </div>
                </div>

                {/* Card 2: Ujian Selesai */}
                <div className="bg-white p-4 rounded-xl border border-[#DCE7F3] shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[#6B7C93] text-xs font-medium mb-2">
                        <span>Ujian Selesai</span>
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl sm:text-3xl font-extrabold font-display text-emerald-700">
                            {gradeSummary?.completed_count ?? 0}
                        </span>
                        <span className="text-xs text-[#6B7C93]">
                            dari {myCbtExams?.length || 0} Ujian
                        </span>
                    </div>
                    <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${myCbtExams?.length ? Math.min(100, Math.round(((gradeSummary?.completed_count ?? 0) / myCbtExams.length) * 100)) : 0}%`,
                            }}
                        />
                    </div>
                </div>

                {/* Card 3: Kelulusan CBT */}
                <div className="bg-white p-4 rounded-xl border border-[#DCE7F3] shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[#6B7C93] text-xs font-medium mb-2">
                        <span>Kelulusan CBT</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-extrabold font-display text-emerald-600">
                            {gradeSummary?.passed_count ?? 0}
                        </span>
                        <span className="text-xs text-emerald-700 font-semibold">Lulus</span>
                        {(gradeSummary?.failed_count ?? 0) > 0 && (
                            <span className="text-xs text-rose-600 font-semibold">
                                • {gradeSummary.failed_count} Perlu Revisi
                            </span>
                        )}
                    </div>
                    <div className="mt-2 text-[11px] text-[#6B7C93]">
                        {(gradeSummary?.completed_count ?? 0) === 0
                            ? 'Belum ada ujian diselesaikan'
                            : (gradeSummary?.failed_count ?? 0) === 0
                                ? 'Semua ujian lulus standar KKM'
                                : 'Terdapat ujian yang perlu remedial/revisi'}
                    </div>
                </div>

                {/* Card 4: Dokumen & Status */}
                <div className="bg-white p-4 rounded-xl border border-[#DCE7F3] shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[#6B7C93] text-xs font-medium mb-2">
                        <span>Kelengkapan Berkas</span>
                        <Shield className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            {certificate?.download_url ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3" /> E-Sertifikat Terbit
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                    <Clock className="w-3 h-3" /> Menunggu Sidang
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setActiveTab('sertifikat')}
                        className="mt-2 text-[11px] font-bold text-[#0B63CE] hover:underline text-left"
                    >
                        Lihat Dokumen Kelulusan →
                    </button>
                </div>
            </div>

            {/* Detailed Grades List */}
            <div className="bg-white rounded-2xl border border-[#DCE7F3] shadow-xs overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-[#DCE7F3] bg-[#F8FBFF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-[#0B63CE]" />
                        <h4 className="font-display font-bold text-sm text-[#0E2747]">
                            Rincian Nilai per Paket Ujian
                        </h4>
                    </div>
                    <span className="text-xs text-[#6B7C93] font-mono">
                        {myCbtExams?.length || 0} Paket Terdaftar di Jalur Anda
                    </span>
                </div>

                {(!myCbtExams || myCbtExams.length === 0) ? (
                    <div className="p-10 text-center">
                        <Award className="w-12 h-12 text-[#CBD5E1] mx-auto mb-3" />
                        <h5 className="font-display font-bold text-sm text-[#0E2747]">
                            Tidak Ada Paket Ujian Terdaftar
                        </h5>
                        <p className="text-xs text-[#6B7C93] mt-1 max-w-md mx-auto">
                            Belum ada paket CBT yang dikonfigurasi untuk jalur peserta Anda pada event ini.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-[#E2E8F0]">
                        {myCbtExams.map((exam) => {
                            const hasCompleted = exam.has_attempt && exam.exam_state === 'selesai';
                            const scoreVal = exam.last_score !== null && exam.last_score !== undefined ? Number(exam.last_score) : null;
                            const isPassed = exam.is_passed;
                            const attempts = exam.attempt_history || [];
                            const isExpanded = expandedHistoryId === exam.id;

                            return (
                                <div key={exam.id} className="p-4 sm:p-5 hover:bg-[#F8FBFF]/60 transition-colors">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        {/* Left: Info Ujian */}
                                        <div className="space-y-1.5 flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-[#EAF5FF] text-[#0B63CE] border border-[#CBDDF2]">
                                                    {exam.code}
                                                </span>
                                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-[#475569]">
                                                    {exam.exam_type_label || exam.exam_type}
                                                </span>
                                                {hasCompleted ? (
                                                    isPassed ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                            LULUS
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                                            BELUM LULUS
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                        BELUM DIKERJAKAN
                                                    </span>
                                                )}
                                            </div>

                                            <h5 className="font-display font-bold text-sm sm:text-base text-[#0E2747] leading-snug">
                                                {exam.title}
                                            </h5>

                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6B7C93]">
                                                <span>Passing Score (KKM): <strong className="text-[#0E2747]">{exam.passing_score}</strong></span>
                                                <span>•</span>
                                                <span>Batas Percobaan: <strong className="text-[#0E2747]">{exam.attempts_allowed || 1}x</strong></span>
                                                {exam.last_attempt_at && (
                                                    <>
                                                        <span>•</span>
                                                        <span>Selesai: <strong className="text-[#0E2747]">{exam.last_attempt_at} WIB</strong></span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right: Nilai & CTA Action */}
                                        <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                                            <div className="text-right">
                                                <div className="text-[11px] text-[#6B7C93] font-medium">Nilai Akhir</div>
                                                <div className="flex items-baseline justify-end gap-1">
                                                    <span className={`text-2xl sm:text-3xl font-extrabold font-display ${
                                                        hasCompleted
                                                            ? isPassed
                                                                ? 'text-emerald-700'
                                                                : 'text-rose-600'
                                                            : 'text-slate-400'
                                                    }`}>
                                                        {scoreVal !== null ? scoreVal.toFixed(1) : '-'}
                                                    </span>
                                                    <span className="text-xs text-[#94A3B8]">/ 100</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-1.5">
                                                {hasCompleted ? (
                                                    attempts.length > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setExpandedHistoryId(isExpanded ? null : exam.id)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#DCE7F3] text-[#0E2747] hover:bg-[#F1F5F9] transition shadow-2xs"
                                                        >
                                                            <span>Riwayat ({attempts.length})</span>
                                                            {isExpanded ? (
                                                                <ChevronUp className="w-3.5 h-3.5 text-[#6B7C93]" />
                                                            ) : (
                                                                <ChevronDown className="w-3.5 h-3.5 text-[#6B7C93]" />
                                                            )}
                                                        </button>
                                                    )
                                                ) : (
                                                    exam.is_accessible ? (
                                                        <Link
                                                            href={exam.exam_url}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0B63CE] text-white hover:bg-[#0A3F82] transition shadow-xs"
                                                        >
                                                            <span>Kerjakan Ujian</span>
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </Link>
                                                    ) : (
                                                        <span className="text-[11px] text-slate-400 italic">
                                                            Ujian Terkunci
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Accordion: Riwayat Attempt Tiap Percobaan */}
                                    {isExpanded && attempts.length > 0 && (
                                        <div className="mt-4 pt-3 border-t border-dashed border-slate-200">
                                            <div className="bg-[#F8FBFF] rounded-xl p-3 border border-[#DCE7F3]">
                                                <h6 className="text-xs font-bold text-[#0E2747] mb-2 flex items-center gap-1.5">
                                                    <History className="w-3.5 h-3.5 text-[#0B63CE]" />
                                                    <span>Log Percobaan Pengerjaan:</span>
                                                </h6>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left text-xs">
                                                        <thead>
                                                            <tr className="border-b border-[#CBDDF2] text-[#6B7C93] text-[11px]">
                                                                <th className="pb-1.5 font-semibold">Percobaan</th>
                                                                <th className="pb-1.5 font-semibold">Waktu Selesai</th>
                                                                <th className="pb-1.5 font-semibold">Durasi</th>
                                                                <th className="pb-1.5 font-semibold text-right">Skor Nilai</th>
                                                                <th className="pb-1.5 font-semibold text-right">Hasil</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {attempts.map((att, idx) => {
                                                                const durMins = att.duration_seconds
                                                                    ? `${Math.round(att.duration_seconds / 60)} menit`
                                                                    : '-';
                                                                return (
                                                                    <tr key={att.attempt_id || idx} className="hover:bg-white/80">
                                                                        <td className="py-2 font-bold text-[#0E2747]">
                                                                            Ke-{att.attempt_number || (attempts.length - idx)}
                                                                        </td>
                                                                        <td className="py-2 text-[#475569]">
                                                                            {att.finished_at || '-'}
                                                                        </td>
                                                                        <td className="py-2 text-[#64748B]">
                                                                            {durMins}
                                                                        </td>
                                                                        <td className="py-2 font-mono font-bold text-right text-base text-[#0E2747]">
                                                                            {att.score !== null ? Number(att.score).toFixed(1) : '-'}
                                                                        </td>
                                                                        <td className="py-2 text-right">
                                                                            {att.is_passed ? (
                                                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                                                    <Check className="w-3 h-3 text-emerald-600" />
                                                                                    Lulus
                                                                                </span>
                                                                            ) : (
                                                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                                                                    <AlertCircle className="w-3 h-3 text-rose-600" />
                                                                                    Belum Lulus
                                                                                </span>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
