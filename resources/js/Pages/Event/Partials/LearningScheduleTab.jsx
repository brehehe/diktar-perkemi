import { Link } from '@inertiajs/react';
import Button from '../../../Components/ui/Button';
import { BookOpen, Calendar, Award, CheckCircle2, QrCode, Check, CheckCheck, Loader2, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { useLearningRoom } from './LearningRoomContext';

export default function LearningScheduleTab() {
    const {
        event,
        availableDays,
        setActiveTab,
        selectedDay,
        setSelectedDay,
        expandedSessionId,
        setExpandedSessionId,
        processingSessionId,
        handleDirectAttendance,
        daySessions,
    } = useLearningRoom();

    return (
        <div className="space-y-4">
            {/* Day Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {availableDays.map((day) => (
                    <button
                        key={day.day_number}
                        type="button"
                        onClick={() => setSelectedDay(day.day_number)}
                        aria-pressed={selectedDay === day.day_number}
                        className={`min-h-11 shrink-0 rounded-lg px-4 py-2 text-left text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] motion-reduce:transition-none ${
                            selectedDay === day.day_number
                                ? 'bg-[#0E2747] text-white shadow-xs'
                                : 'bg-white text-[#6B7C93] border border-[#DCE7F3] hover:bg-[#EAF5FF]'
                        }`}
                    >
                        <span className="block">Hari ke-{day.day_number}</span>
                        {day.date_label && <span className="mt-0.5 block text-[10px] font-normal opacity-80">{day.date_label}</span>}
                    </button>
                ))}
            </div>

            {/* Sessions Vertical Timeline List */}
            <div className="space-y-3">
                {daySessions.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-2xl border border-[#DCE7F3] text-xs text-[#6B7C93]">
                        Belum ada sesi yang dijadwalkan pada Hari ke-{selectedDay}.
                    </div>
                ) : (
                    daySessions.map((s) => {
                        const isExpanded = expandedSessionId === s.id;
                        return (
                            <div
                                key={s.id}
                                className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs overflow-hidden transition-all"
                            >
                                <button
                                    type="button"
                                    onClick={() => setExpandedSessionId(isExpanded ? null : s.id)}
                                    aria-expanded={isExpanded}
                                    aria-controls={`session-detail-${s.id}`}
                                    className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-[#F8FBFF] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#0B63CE] motion-reduce:transition-none"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="font-mono text-xs font-bold text-[#0B63CE] bg-[#EAF5FF] px-2 py-1 rounded shrink-0">
                                            {s.time_slot}
                                        </span>
                                        <div className="min-w-0">
                                            <div className="break-words text-xs font-bold text-[#0E2747]">
                                                {s.topic}
                                            </div>
                                            <div className="text-[11px] text-[#6B7C93] flex items-center gap-2 mt-0.5">
                                                <span>{s.session_type_name}</span>
                                                {s.speaker_name && <span>• {s.speaker_name}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {/* Direct 1-Click Attendance Shortcut in Session Header */}
                                        {s.can_shortcut_attend && s.next_attendance_type ? (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDirectAttendance(s, s.next_attendance_type);
                                                }}
                                                disabled={processingSessionId === s.id}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs transition-all active:scale-95 disabled:opacity-50 ${
                                                    s.next_attendance_type === 'check_out'
                                                        ? 'bg-amber-600 hover:bg-amber-700'
                                                        : 'bg-[#0B63CE] hover:bg-[#0A3F82]'
                                                }`}
                                                title={`Klik untuk langsung mencatat absensi ${s.next_attendance_type === 'check_out' ? 'keluar' : 'masuk'}`}
                                            >
                                                {processingSessionId === s.id ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                )}
                                                <span>
                                                    {processingSessionId === s.id
                                                        ? 'Mencatat...'
                                                        : s.next_attendance_type === 'check_out'
                                                        ? 'Absen Keluar'
                                                        : 'Absen Sekarang'}
                                                </span>
                                            </button>
                                        ) : s.attendance_setting === 'check_in_out' && s.has_checked_in && s.has_checked_out ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                                                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                                                <span className="hidden sm:inline">Lengkap</span>
                                            </span>
                                        ) : s.has_attended ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                <span className="hidden sm:inline">Hadir</span>
                                            </span>
                                        ) : s.is_future ? (
                                            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-medium border border-slate-200">
                                                <Calendar className="w-3 h-3 text-slate-400" />
                                                <span>Hari ke-{s.day_number}</span>
                                            </span>
                                        ) : s.is_attendance_open ? (
                                            <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 motion-safe:animate-pulse">
                                                Absen Buka
                                            </span>
                                        ) : null}

                                        {/* Direct CBT Exam Link in header if attended and exam accessible */}
                                        {s.has_attended && s.cbt_package_code && s.cbt_is_accessible && !s.cbt_has_attempt && (
                                            <Link
                                                href={`/event/${event.slug}/cbt/${s.cbt_package_code}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600 text-white text-[11px] font-bold hover:bg-purple-700 shadow-xs transition-all active:scale-95"
                                            >
                                                <Award className="w-3 h-3" />
                                                <span className="hidden sm:inline">Ujian CBT</span>
                                            </Link>
                                        )}

                                        {isExpanded ? (
                                            <ChevronUp className="w-4 h-4 text-[#6B7C93]" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-[#6B7C93]" />
                                        )}
                                    </div>
                                </button>

                                {/* Expandable Session Detail */}
                                {isExpanded && (
                                    <div id={`session-detail-${s.id}`} className="space-y-3 border-t border-[#DCE7F3]/60 bg-[#F8FBFF] px-4 pb-4 pt-1 text-xs">
                                        {s.subtopic && (
                                            <p className="text-[#112743]">{s.subtopic}</p>
                                        )}
                                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[11px] text-[#6B7C93]">
                                                    Ruangan: <strong>{s.room || 'Belum ditetapkan'}</strong>
                                                </span>
                                                {s.attendance_setting === 'check_in_out' && (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                                        Absensi Masuk & Keluar
                                                    </span>
                                                )}
                                                {s.attendance_setting === 'check_in' && (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                                        Absensi Masuk Saja
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                {!s.has_attended && !s.can_access_content && (s.has_exam || s.has_material || s.cbt_package_code || s.material_slug || s.event_material_url) && (
                                                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                                                        <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                                                        <span>Absen sesi untuk membuka {(s.has_exam || s.cbt_package_code || s.session_type_code === 'UJIAN') ? 'ujian CBT' : 'materi'}</span>
                                                    </span>
                                                )}

                                                {/* Direct Shortcut Button inside expanded detail */}
                                                {s.can_shortcut_attend && s.next_attendance_type && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDirectAttendance(s, s.next_attendance_type)}
                                                        disabled={processingSessionId === s.id}
                                                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs transition-all active:scale-95 disabled:opacity-50 ${
                                                            s.next_attendance_type === 'check_out'
                                                                ? 'bg-amber-600 hover:bg-amber-700'
                                                                : 'bg-[#0B63CE] hover:bg-[#0A3F82]'
                                                        }`}
                                                    >
                                                        {processingSessionId === s.id ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                        )}
                                                        <span>
                                                            {processingSessionId === s.id
                                                                ? 'Mencatat...'
                                                                : s.attendance_button_label}
                                                        </span>
                                                    </button>
                                                )}

                                                {/* Alternative Scan QR link */}
                                                {s.is_attendance_open && (!s.has_attended || (s.attendance_setting === 'check_in_out' && !s.has_checked_out)) && (
                                                    <Link
                                                        href={`/event/${event.slug}/scan`}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-[#DCE7F3] text-[#0B63CE] hover:bg-[#EAF5FF] text-xs font-semibold"
                                                        title="Scan QR kode menggunakan kamera"
                                                    >
                                                        <QrCode className="w-3.5 h-3.5" />
                                                        <span>Scan QR</span>
                                                    </Link>
                                                )}

                                                {s.has_checked_in && (
                                                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-medium">
                                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                        <span>Masuk: {s.check_in_time ? s.check_in_time.split(',')[0] : 'Tercatat'}</span>
                                                    </span>
                                                )}

                                                {s.has_checked_out && (
                                                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-medium">
                                                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                                                        <span>Keluar: {s.check_out_time ? s.check_out_time.split(',')[0] : 'Tercatat'}</span>
                                                    </span>
                                                )}

                                                {s.is_future && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-medium border border-slate-200">
                                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>Dibuka pada Hari ke-{s.day_number} ({s.session_date_label})</span>
                                                    </span>
                                                )}
                                                {s.material_slug && (
                                                    <Link
                                                        href={s.material_reader_url || `/koleksi/${s.material_slug}/baca?event=${event.slug}`}
                                                        className="px-3 py-1.5 rounded-lg bg-white border border-[#DCE7F3] text-xs font-semibold text-[#0B63CE] hover:bg-[#EAF5FF]"
                                                    >
                                                        Baca Materi
                                                    </Link>
                                                )}
                                                {!s.material_slug && s.event_material_url && <a href={s.event_material_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center border border-[#DCE7F3] bg-white px-3 text-xs font-semibold text-[#0B63CE] hover:bg-[#EAF5FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]">Buka materi</a>}
                                                {s.cbt_package_code && (
                                                    s.cbt_has_attempt && !s.cbt_is_accessible ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setActiveTab('ujian')}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 hover:bg-slate-200 transition-colors"
                                                            title="Ujian telah selesai dikerjakan dan terkunci"
                                                        >
                                                            <Lock className="w-3.5 h-3.5 text-slate-500" />
                                                            <span>Ujian Selesai{s.cbt_last_score !== null ? ` (${s.cbt_last_score})` : ''}</span>
                                                        </button>
                                                    ) : !s.cbt_is_accessible ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setActiveTab('ujian')}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200 hover:bg-purple-100 transition-colors"
                                                            title={s.cbt_access_denied_reason || 'Ujian Terkunci (Perlu Absensi Sesi)'}
                                                        >
                                                            <Lock className="w-3.5 h-3.5 text-purple-600" />
                                                            <span>Ujian CBT (Perlu Absen)</span>
                                                        </button>
                                                    ) : (
                                                        <Link
                                                            href={`/event/${event.slug}/cbt/${s.cbt_package_code}`}
                                                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 shadow-xs transition-all active:scale-95"
                                                        >
                                                            <Award className="w-3.5 h-3.5" />
                                                            <span>{s.cbt_has_attempt ? 'Ujian Ulang CBT' : 'Ikuti Ujian CBT'}</span>
                                                        </Link>
                                                    )
                                                )}
                                            </div>
                                        </div>

                                        {/* Module Information if linked to a course module */}
                                        {s.module_title && (
                                            <div className="flex items-center gap-2 text-xs text-[#6B7C93] pt-1 border-t border-[#DCE7F3]/40">
                                                <BookOpen className="w-3.5 h-3.5 text-[#0B63CE] shrink-0" />
                                                <span>Modul: <strong className="text-[#0E2747]">{s.module_code ? `${s.module_code} — ` : ''}{s.module_title}</strong></span>
                                                {!s.material_slug && !s.event_material_url && (
                                                    <span className="text-[11px] text-slate-500 italic">• Bahan tatap muka / disiapkan instruktur</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
