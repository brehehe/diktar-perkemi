import React from 'react';
import { ChevronLeft, ChevronRight, Send, List, Check, Camera, CameraOff, ShieldAlert, Maximize2 } from 'lucide-react';
import Button from '../../../Components/ui/Button';

export default function CbtExamRunner({
    questions,
    currentIdx,
    setCurrentIdx,
    answers,
    setIsSubmitModalOpen,
    isFullscreen,
    cameraStatus,
    incidentCount,
    lastIncident,
    videoRef,
    questionCardRef,
    activeNavButtonRef,
    requestExamFullscreen,
    currentQuestion,
    answeredCount,
    totalQuestions,
    handleSelectOption,
}) {
    return (
        <>
            {/* Main Exam Runner Area */}
            <main className="mx-auto grid w-full max-w-full flex-1 grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-4 lg:px-8">
                <section className="lg:col-span-4 rounded-xl border border-[#DCE7F3] bg-white p-4 shadow-xs" aria-labelledby="exam-monitoring-title">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-[#0E2747]">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    aria-label="Pratinjau kamera peserta"
                                    className={`h-full w-full object-cover ${cameraStatus === 'active' ? 'block' : 'hidden'}`}
                                />
                                {cameraStatus !== 'active' && (
                                    <div className="flex h-full w-full items-center justify-center text-white/80">
                                        <CameraOff className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <h2 id="exam-monitoring-title" className="flex items-center gap-2 text-sm font-bold text-[#0E2747]">
                                    <Camera className="h-4 w-4 shrink-0 text-[#0B63CE]" aria-hidden="true" />
                                    Pengawasan ujian
                                </h2>
                                <p className="mt-1 text-xs leading-relaxed text-[#6B7C93]">
                                    Kamera: <strong className="text-[#112743]">{{ requesting: 'Meminta izin', active: 'Aktif', denied: 'Izin ditolak', unavailable: 'Tidak tersedia', interrupted: 'Terputus' }[cameraStatus]}</strong>
                                    {' '}• {incidentCount} kejadian fokus tercatat
                                </p>
                                <p className="mt-1 text-[11px] leading-relaxed text-[#6B7C93]">
                                    Pratinjau berjalan di perangkat. Sistem menyimpan status kamera dan kejadian fokus, bukan rekaman video.
                                </p>
                            </div>
                        </div>
                        <div className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#EAF5FF] px-3 py-2 text-xs font-semibold text-[#0A3F82]">
                            <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                            Mode ujian aktif
                        </div>
                        <button
                            type="button"
                            onClick={requestExamFullscreen}
                            disabled={isFullscreen}
                            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-[#0B63CE] bg-white px-3 text-xs font-semibold text-[#0B63CE] hover:bg-[#EAF5FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] disabled:cursor-default disabled:border-[#20A47A] disabled:bg-[#20A47A]/10 disabled:text-[#16785B]"
                        >
                            {isFullscreen ? <Check className="h-4 w-4" aria-hidden="true" /> : <Maximize2 className="h-4 w-4" aria-hidden="true" />}
                            {isFullscreen ? 'Layar penuh aktif' : 'Aktifkan layar penuh'}
                        </button>
                    </div>
                    {lastIncident && (
                        <p role="alert" aria-live="assertive" className="mt-3 rounded-lg border border-[#EE9B25]/40 bg-[#EE9B25]/10 px-3 py-2 text-xs text-[#7A4A06]">
                            {lastIncident}
                        </p>
                    )}
                </section>

                {/* Center / Left: Current Question Card */}
                <div className="lg:col-span-3 space-y-6">
                    {currentQuestion ? (
                        <div ref={questionCardRef} className="scroll-mt-28 bg-white rounded-2xl border border-[#DCE7F3] p-6 sm:p-8 shadow-xs space-y-6">
                            {/* Question Meta Bar */}
                            <div className="flex items-center justify-between border-b border-[#DCE7F3] pb-4">
                                <span className="font-mono font-bold text-xs bg-[#EAF5FF] text-[#0B63CE] px-3 py-1 rounded-lg border border-[#0B63CE]/20">
                                    Soal Nomor {currentIdx + 1}
                                </span>
                                <span className="text-xs font-mono text-[#6B7C93]">
                                    Bobot: {currentQuestion.points} Poin
                                </span>
                            </div>

                            {/* Question Text */}
                            <div className="text-sm sm:text-base text-[#0E2747] font-medium leading-relaxed">
                                {currentQuestion.question_text}
                            </div>

                            {/* Options List */}
                            <div className="space-y-3 pt-2">
                                {(currentQuestion.options || []).map((opt, optIdx) => {
                                    const optValue = opt.key ?? opt.id;
                                    const optLabel = opt.label ?? opt.key ?? opt.id ?? String.fromCharCode(65 + optIdx);
                                    const currentAnswer = answers[String(currentQuestion.id)];
                                    const isSelected = Boolean(currentAnswer) && String(currentAnswer) === String(optValue);

                                    return (
                                        <button
                                            key={optValue || optIdx}
                                            type="button"
                                            onClick={() => handleSelectOption(currentQuestion.id, optValue)}
                                            aria-pressed={isSelected}
                                            className={`flex min-h-[48px] w-full items-start gap-3.5 rounded-xl border-2 p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] motion-reduce:transition-none ${
                                                isSelected
                                                    ? 'border-[#0B63CE] bg-[#EAF5FF]/60 text-[#0E2747] shadow-xs'
                                                    : 'border-[#DCE7F3] bg-[#F8FBFF] hover:border-[#0B63CE]/40 text-[#112743]'
                                            }`}
                                        >
                                            <span
                                                className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors ${
                                                    isSelected
                                                        ? 'bg-[#0B63CE] text-white'
                                                        : 'bg-white border border-[#DCE7F3] text-[#6B7C93]'
                                                }`}
                                            >
                                                {optLabel}
                                            </span>
                                            <span className="text-xs sm:text-sm font-normal pt-0.5 leading-snug">
                                                {opt.text}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 text-center bg-white rounded-2xl border border-[#DCE7F3] text-[#6B7C93]">
                            Tidak ada soal tersedia untuk paket ujian ini.
                        </div>
                    )}

                    {/* Bottom Navigation Buttons */}
                    <div className="flex items-center justify-between gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            icon={<ChevronLeft className="w-4 h-4" />}
                            className="whitespace-nowrap"
                            disabled={currentIdx === 0}
                            onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                        >
                            Sebelumnya
                        </Button>

                        <div className="flex items-center gap-2">
                            {currentIdx < totalQuestions - 1 ? (
                                <Button
                                    type="button"
                                    variant="primary"
                                    icon={ChevronRight}
                                    iconPosition="right"
                                    className="whitespace-nowrap"
                                    onClick={() => setCurrentIdx((prev) => Math.min(totalQuestions - 1, prev + 1))}
                                >
                                    Berikutnya
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    variant="primary"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                    icon={<Send className="w-4 h-4" />}
                                    onClick={() => setIsSubmitModalOpen(true)}
                                >
                                    Selesaikan Ujian
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right / Sidebar: Question Number Navigator */}
                <div className="hidden lg:block space-y-4">
                    <div className="bg-white rounded-2xl border border-[#DCE7F3] p-5 shadow-xs space-y-4 sticky top-20">
                        <div className="flex items-center justify-between border-b border-[#DCE7F3] pb-3">
                            <h3 className="font-display font-bold text-xs text-[#0E2747] uppercase tracking-wider">
                                Nomor Soal
                            </h3>
                            <span className="text-[11px] font-mono text-[#6B7C93]">
                                {answeredCount}/{totalQuestions}
                            </span>
                        </div>

                        {/* Scrollable Grid of Question Numbers */}
                        <div className="max-h-[340px] overflow-y-auto pr-1">
                            <div className="grid grid-cols-5 gap-2">
                                {questions.map((q, idx) => {
                                    const ansVal = answers[String(q.id)];
                                    const isAnswered = ansVal !== undefined && ansVal !== null && ansVal !== '';
                                    const isCurrent = currentIdx === idx;

                                    return (
                                        <button
                                            key={q.id}
                                            ref={isCurrent ? activeNavButtonRef : null}
                                            type="button"
                                            onClick={() => setCurrentIdx(idx)}
                                            aria-current={isCurrent ? 'step' : undefined}
                                            className={`h-9 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center relative ${
                                                isCurrent
                                                    ? 'ring-2 ring-[#0B63CE] ring-offset-1 font-black shadow-xs'
                                                    : ''
                                            } ${
                                                isAnswered
                                                    ? 'bg-[#0B63CE] text-white'
                                                    : 'bg-[#F8FBFF] text-[#6B7C93] border border-[#DCE7F3] hover:bg-[#EAF5FF]'
                                            }`}
                                        >
                                            <span>{idx + 1}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="pt-3 border-t border-[#DCE7F3] space-y-2 text-[11px] text-[#6B7C93]">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded bg-[#0B63CE]" />
                                <span>Sudah Dijawab</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded bg-[#F8FBFF] border border-[#DCE7F3]" />
                                <span>Belum Dijawab</span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-center text-xs text-rose-600 hover:bg-rose-50 border-rose-200 mt-2"
                            onClick={() => setIsSubmitModalOpen(true)}
                        >
                            Kumpulkan Ujian Sekarang
                        </Button>
                    </div>
                </div>
            </main>

        </>
    );
}
