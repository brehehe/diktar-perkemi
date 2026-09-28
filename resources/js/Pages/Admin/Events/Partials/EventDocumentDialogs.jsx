import Button from '../../../../Components/ui/Button';
import Modal from '../../../../Components/ui/Modal';
import Input from '../../../../Components/ui/Input';
import AlertDialog from '../../../../Components/ui/AlertDialog';
import { ExternalLink, HelpCircle, Check, X, CheckCircle2, Download } from 'lucide-react';
import { useEventShow } from './EventShowContext';

export default function EventDocumentDialogs() {
    const {
        event,
        examPackageFilter,
        selectedAttemptForDetail,
        setSelectedAttemptForDetail,
        isDetailModalOpen,
        setIsDetailModalOpen,
        isLoadingDetail,
        attemptDetailData,
        setAttemptDetailData,
        accountTargetSpeaker,
        setAccountTargetSpeaker,
        speakerAccountForm,
        activeDocumentPreview,
        setActiveDocumentPreview,
        attendanceResetTarget,
        setAttendanceResetTarget,
        isResettingAttendance,
        restartExamTarget,
        setRestartExamTarget,
        isRestartingExam,
        completeExamTarget,
        setCompleteExamTarget,
        isCompletingExam,
        deleteExamTarget,
        setDeleteExamTarget,
        isDeletingExam,
        handleAttendanceReset,
        handleRestartExam,
        handleCompleteExam,
        handleDeleteExam,
    } = useEventShow();

    return (
        <>
            {/* MODAL: Detail Jawaban Ujian CBT */}
            {isDetailModalOpen && (
                <Modal
                    isOpen={isDetailModalOpen}
                    onClose={() => {
                        setIsDetailModalOpen(false);
                        setSelectedAttemptForDetail(null);
                        setAttemptDetailData(null);
                    }}
                    title={`Rincian Jawaban Ujian CBT — ${selectedAttemptForDetail?.participant_name || 'Kenshi'}`}
                    description={`${selectedAttemptForDetail?.package_title || 'Paket Ujian'} (Percobaan #${selectedAttemptForDetail?.attempt_number || 1})`}
                    size="3xl"
                    footer={
                        <div className="flex items-center justify-between w-full">
                            <div className="text-xs text-[#6B7C93]">
                                {attemptDetailData?.summary && (
                                    <span>
                                        Total: <strong className="text-[#0E2747]">{attemptDetailData.summary.total_questions}</strong> soal •
                                        Benar: <strong className="text-emerald-700">{attemptDetailData.summary.correct_count}</strong> •
                                        Salah: <strong className="text-rose-700">{attemptDetailData.summary.incorrect_count}</strong>
                                    </span>
                                )}
                            </div>
                            <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
                                Tutup
                            </Button>
                        </div>
                    }
                >
                    <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                        {isLoadingDetail ? (
                            <div className="py-16 text-center text-sm text-[#6B7C93] flex flex-col items-center justify-center gap-2">
                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0B63CE] border-t-transparent" />
                                <span>Memuat lembar soal dan rincian jawaban...</span>
                            </div>
                        ) : !attemptDetailData ? (
                            <div className="py-12 text-center text-sm text-[#6B7C93]">
                                Data lembar jawaban tidak tersedia.
                            </div>
                        ) : (
                            <>
                                {/* Banner Score Summary */}
                                <div className="rounded-xl border border-[#DCE7F3] bg-gradient-to-r from-[#F8FBFF] to-white p-4 shadow-xs">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`flex flex-col items-center justify-center rounded-xl p-3 px-5 border ${attemptDetailData.attempt.is_passed ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'}`}>
                                                <span className="text-[11px] font-semibold uppercase tracking-wider">Nilai Akhir</span>
                                                <span className="font-display text-3xl font-black">
                                                    {(attemptDetailData.attempt.score ?? attemptDetailData.attempt.total_score ?? attemptDetailData.summary?.score ?? 0).toFixed(1)}
                                                </span>
                                                <span className="text-[10px] text-[#6B7C93]">
                                                    Passing: {attemptDetailData.attempt.passing_score}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${attemptDetailData.attempt.is_passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                                        {attemptDetailData.attempt.is_passed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                                                        {attemptDetailData.attempt.is_passed ? 'LULUS UJIAN' : 'BELUM MEMENUHI KELULUSAN'}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-[#0E2747] font-semibold mt-1">
                                                    {attemptDetailData.attempt.participant_name || attemptDetailData.participant?.name || 'Peserta'} ({attemptDetailData.attempt.kenshi_id_number || attemptDetailData.participant?.kenshi_id_number || '-'})
                                                </div>
                                                <div className="text-[11px] text-[#6B7C93]">
                                                    Diselesaikan pada: {attemptDetailData.attempt.submitted_at || '-'} • Durasi: {typeof attemptDetailData.attempt.duration_minutes === 'number' ? Math.round(attemptDetailData.attempt.duration_minutes) : (attemptDetailData.attempt.duration_minutes || '-')} menit
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                            <div className="bg-white border border-[#DCE7F3] rounded-lg p-2 shadow-2xs">
                                                <div className="text-[#6B7C93] text-[10px]">Benar</div>
                                                <div className="font-bold text-emerald-700 text-base">{attemptDetailData.summary.correct_count}</div>
                                            </div>
                                            <div className="bg-white border border-[#DCE7F3] rounded-lg p-2 shadow-2xs">
                                                <div className="text-[#6B7C93] text-[10px]">Salah</div>
                                                <div className="font-bold text-rose-700 text-base">{attemptDetailData.summary.incorrect_count ?? attemptDetailData.summary.wrong_count ?? 0}</div>
                                            </div>
                                            <div className="bg-white border border-[#DCE7F3] rounded-lg p-2 shadow-2xs">
                                                <div className="text-[#6B7C93] text-[10px]">Akurasi</div>
                                                <div className="font-bold text-[#0B63CE] text-base">{attemptDetailData.summary.percentage ?? attemptDetailData.summary.score ?? 0}%</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Questions Breakdown */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7C93]">
                                        Daftar Butir Soal & Pilihan Jawaban ({attemptDetailData.questions?.length || 0})
                                    </h4>

                                    {attemptDetailData.questions?.map((q) => {
                                        return (
                                            <div
                                                key={q.id}
                                                className={`rounded-xl border p-4 shadow-xs transition-all ${q.is_correct ? 'border-emerald-200 bg-white' : 'border-rose-200 bg-white'}`}
                                            >
                                                {/* Header per question */}
                                                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#DCE7F3] text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold font-mono text-[#0E2747] text-sm">
                                                            #{q.number}
                                                        </span>
                                                        {q.is_correct ? (
                                                            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-300">
                                                                <Check className="h-3 w-3" />
                                                                BENAR
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-800 border border-rose-300">
                                                                <X className="h-3 w-3" />
                                                                {q.user_answer ? 'SALAH' : 'TIDAK DIJAWAB'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="font-semibold text-xs text-[#6B7C93]">
                                                        Poin: <span className={q.is_correct ? 'text-emerald-700 font-bold' : 'text-slate-600'}>{q.earned_points}</span> / {q.points}
                                                    </div>
                                                </div>

                                                {/* Question text */}
                                                <div className="text-xs font-medium text-[#0E2747] mb-3 leading-relaxed">
                                                    {q.question_text}
                                                </div>

                                                {/* Options list */}
                                                <div className="space-y-1.5">
                                                    {q.options?.map((opt) => {
                                                        const isUserSelection = String(opt.key) === String(q.user_answer);
                                                        const isCorrectKey = String(opt.key) === String(q.correct_answer);

                                                        let optionClass = 'border-[#DCE7F3] bg-[#F8FBFF] text-[#112743]';
                                                        if (isCorrectKey && isUserSelection) {
                                                            optionClass = 'border-emerald-400 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-400';
                                                        } else if (isCorrectKey && !isUserSelection) {
                                                            optionClass = 'border-emerald-400 bg-emerald-50/60 text-emerald-900 font-medium';
                                                        } else if (isUserSelection && !isCorrectKey) {
                                                            optionClass = 'border-rose-400 bg-rose-50 text-rose-950 font-semibold ring-1 ring-rose-400';
                                                        }

                                                        return (
                                                            <div
                                                                key={opt.key}
                                                                className={`rounded-lg border p-2 text-xs flex items-center justify-between gap-3 ${optionClass}`}
                                                            >
                                                                <div className="flex items-center gap-2.5">
                                                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white border border-current text-[11px] font-bold">
                                                                        {opt.key}
                                                                    </span>
                                                                    <span>{opt.text}</span>
                                                                </div>

                                                                <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
                                                                    {isUserSelection && (
                                                                        <span className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-bold ${q.is_correct ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'}`}>
                                                                            Jawaban Kenshi
                                                                        </span>
                                                                    )}
                                                                    {isCorrectKey && (
                                                                        <span className="inline-flex items-center gap-0.5 rounded bg-emerald-600 px-1.5 py-0.5 font-bold text-white">
                                                                            <Check className="h-3 w-3" />
                                                                            Kunci Benar
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Explanation */}
                                                {q.explanation && (
                                                    <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50/70 p-2.5 text-[11px] text-blue-900">
                                                        <div className="font-semibold text-blue-950 flex items-center gap-1 mb-0.5">
                                                            <HelpCircle className="h-3.5 w-3.5 text-blue-700" />
                                                            Pembahasan / Penjelasan:
                                                        </div>
                                                        <p className="text-blue-800 leading-relaxed">{q.explanation}</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </Modal>
            )}

            <AlertDialog
                isOpen={Boolean(attendanceResetTarget)}
                onClose={() => setAttendanceResetTarget(null)}
                title={attendanceResetTarget === 'all' ? 'Reset seluruh hasil peserta event?' : 'Reset seluruh hasil peserta ini?'}
                description={attendanceResetTarget === 'all'
                    ? 'Semua presensi, percobaan dan jawaban CBT, nilai, pengawasan ujian, revisi, sertifikat, transkrip, serta status kelulusan peserta pada event ini akan dihapus. Data peserta, rundown, materi, dan paket ujian tetap tersedia.'
                    : `Semua presensi, nilai, hasil CBT, revisi, sertifikat, dan transkrip ${attendanceResetTarget?.participant_name || 'peserta'} pada event ini akan dihapus. Peserta harus memulai kembali dari pemindaian QR kedatangan.`}
                confirmText={isResettingAttendance ? 'Mereset...' : 'Reset hasil peserta'}
                cancelText="Batal"
                variant="danger"
                loading={isResettingAttendance}
                onConfirm={handleAttendanceReset}
            />

            <AlertDialog
                isOpen={Boolean(restartExamTarget)}
                onClose={() => setRestartExamTarget(null)}
                title={restartExamTarget === 'all' ? 'Mulai Ulang Seluruh Ujian CBT?' : 'Mulai Ulang Ujian Peserta Ini?'}
                description={restartExamTarget === 'all'
                    ? `Sesi seluruh percobaan ujian CBT ${examPackageFilter !== 'all' ? 'pada paket terpilih' : 'pada event ini'} akan dibuka kembali agar peserta dapat melanjutkan pengerjaan (misal jika ada kendala teknis/jaringan). Jawaban yang sudah tersimpan TIDAK akan dihapus, dan durasi waktu pengerjaan akan diperbarui.`
                    : `Sesi ujian untuk ${restartExamTarget?.participant_name || 'peserta ini'} (${restartExamTarget?.package_title || 'Ujian CBT'}) akan dibuka kembali. Jawaban yang sudah diisi sebelumnya TIDAK akan dihapus, dan peserta dapat langsung melanjutkan atau memeriksa jawaban dengan durasi waktu baru.`}
                confirmText={isRestartingExam ? 'Memproses...' : 'Mulai Ulang Ujian'}
                cancelText="Batal"
                variant="warning"
                loading={isRestartingExam}
                onConfirm={handleRestartExam}
            />

            <AlertDialog
                isOpen={Boolean(completeExamTarget)}
                onClose={() => setCompleteExamTarget(null)}
                title={completeExamTarget === 'all' ? 'Selesaikan Semua Ujian yang Sedang Berlangsung?' : 'Selesaikan Ujian Peserta Ini?'}
                description={completeExamTarget === 'all'
                    ? `Seluruh sesi ujian peserta yang masih berlangsung (status sedang ujian / belum submit) ${examPackageFilter !== 'all' ? 'pada paket terpilih' : 'pada event ini'} akan otomatis diselesaikan dan dinilai berdasarkan jawaban yang telah mereka isi.`
                    : `Sesi ujian untuk ${completeExamTarget?.participant_name || 'peserta ini'} (${completeExamTarget?.package_title || 'Ujian CBT'}) akan diselesaikan dan skor kelulusan akan dihitung berdasarkan jawaban yang sudah tersimpan.`}
                confirmText={isCompletingExam ? 'Memproses...' : 'Selesaikan Sekarang'}
                cancelText="Batal"
                variant="primary"
                loading={isCompletingExam}
                onConfirm={handleCompleteExam}
            />

            <AlertDialog
                isOpen={Boolean(deleteExamTarget)}
                onClose={() => setDeleteExamTarget(null)}
                title={deleteExamTarget === 'all' ? 'Kosongkan Seluruh Hasil Ujian CBT?' : 'Hapus Percobaan Ujian Ini?'}
                description={deleteExamTarget === 'all'
                    ? `Seluruh catatan percobaan ujian CBT ${examPackageFilter !== 'all' ? 'pada paket terpilih' : 'pada event ini'} akan dihapus permanen dari sistem sehingga daftar hasil ujian kembali kosong. Peserta dapat memulai ujian dari awal kembali.`
                    : `Percobaan ujian #${deleteExamTarget?.attempt_number} untuk ${deleteExamTarget?.participant_name || 'peserta ini'} (${deleteExamTarget?.package_title || 'Ujian CBT'}) akan dihapus permanen dari sistem.`}
                confirmText={isDeletingExam ? 'Menghapus...' : 'Hapus & Kosongkan'}
                cancelText="Batal"
                variant="danger"
                loading={isDeletingExam}
                onConfirm={handleDeleteExam}
            />

            {/* Modal Buatkan Akun Login Pemateri */}
            <Modal
                isOpen={Boolean(accountTargetSpeaker)}
                onClose={() => setAccountTargetSpeaker(null)}
                title="Buatkan Akun Login Pemateri"
                description={`Buat atau hubungkan akun portal untuk Sensei "${accountTargetSpeaker?.name}".`}
                isProcessing={speakerAccountForm.processing}
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!accountTargetSpeaker) return;
                        speakerAccountForm.post(`/admin/event/${event.id}/pemateri/${accountTargetSpeaker.id}/buat-akun`, {
                            onSuccess: () => {
                                setAccountTargetSpeaker(null);
                                speakerAccountForm.reset();
                            },
                        });
                    }}
                    className="space-y-4"
                >
                    <div className="p-3 rounded-lg bg-[#F8FBFF] border border-[#DCE7F3] text-xs space-y-1">
                        <p><span className="text-[#6B7C93]">Nama Pemateri:</span> <strong className="text-[#112743]">{accountTargetSpeaker?.name}</strong></p>
                        <p><span className="text-[#6B7C93]">Peran Akun:</span> <span className="text-[#0B63CE] font-bold">Pemateri</span></p>
                        <p><span className="text-[#6B7C93]">Status:</span> <span className="font-semibold text-amber-700">{accountTargetSpeaker?.is_supervisor ? 'Pemateri Supervisor (Akses Seluruh Jadwal)' : 'Pemateri Reguler'}</span></p>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold text-[#112743]">Alamat Email Login</label>
                        <Input
                            type="email"
                            value={speakerAccountForm.data.email}
                            onChange={(e) => speakerAccountForm.setData('email', e.target.value)}
                            placeholder="pemateri@perkemi.id"
                            required
                            error={speakerAccountForm.errors.email}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold text-[#112743]">Kata Sandi Awal</label>
                        <Input
                            type="text"
                            value={speakerAccountForm.data.password}
                            onChange={(e) => speakerAccountForm.setData('password', e.target.value)}
                            placeholder="Minimal 8 karakter"
                            required
                            error={speakerAccountForm.errors.password}
                            helperText="Password dapat diubah kapan saja melalui menu Pengguna atau oleh pemateri sendiri."
                        />
                    </div>

                    <div className="pt-4 border-t border-[#DCE7F3] flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={speakerAccountForm.processing}
                            onClick={() => setAccountTargetSpeaker(null)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            loading={speakerAccountForm.processing}
                        >
                            Simpan & Aktifkan Akun
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* MODAL: Preview E-Sertifikat & E-Transkrip Peserta */}
            {activeDocumentPreview && (
                <Modal
                    isOpen
                    onClose={() => setActiveDocumentPreview(null)}
                    title={`Preview ${activeDocumentPreview.title} — ${activeDocumentPreview.participantName}`}
                    description={`${activeDocumentPreview.trackLabel} · Nomor: ${activeDocumentPreview.number || 'Belum dicatat'}`}
                    size="full"
                    footer={
                        <div className="flex flex-wrap items-center justify-between w-full gap-3">
                            <span className="text-xs text-[#6B7C93]">
                                Nomor: <strong className="text-[#0E2747]">{activeDocumentPreview.number || 'Belum dicatat'}</strong>
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                                <a
                                    href={activeDocumentPreview.previewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs font-semibold text-[#0E2747] hover:border-[#0B63CE] hover:text-[#0B63CE] transition-colors"
                                >
                                    <ExternalLink className="size-3.5" />
                                    <span>Buka di Tab Baru</span>
                                </a>
                                {activeDocumentPreview.downloadUrl && (
                                    <a
                                        href={activeDocumentPreview.downloadUrl}
                                        className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-[#0B63CE] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0A3F82] transition-colors shadow-2xs"
                                    >
                                        <Download className="size-3.5" />
                                        <span>Unduh PDF</span>
                                    </a>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setActiveDocumentPreview(null)}
                                    className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                    <X className="size-3.5" />
                                    <span>Tutup</span>
                                </button>
                            </div>
                        </div>
                    }
                >
                    <div className="h-[calc(100vh-14rem)] min-h-[500px] w-full bg-slate-100 rounded-xl overflow-hidden border border-[#DCE7F3]">
                        <iframe
                            src={activeDocumentPreview.previewUrl}
                            title={`${activeDocumentPreview.title} ${activeDocumentPreview.participantName}`}
                            className="w-full h-full border-0"
                        />
                    </div>
                    <p className="mt-2 text-xs text-[#6B7C93] text-center">
                        Gunakan tombol Buka di Tab Baru atau Unduh PDF jika browser Anda tidak menampilkan PDF secara langsung.
                    </p>
                </Modal>
            )}
        </>
    );
}
