import { router } from '@inertiajs/react';
import Button from '../../../../../Components/ui/Button';
import Modal from '../../../../../Components/ui/Modal';
import AlertDialog from '../../../../../Components/ui/AlertDialog';
import FormField from '../../../../../Components/ui/FormField';
import Input from '../../../../../Components/ui/Input';
import Textarea from '../../../../../Components/ui/Textarea';
import Checkbox from '../../../../../Components/ui/Checkbox';
import TableSurface from '../../../../../Components/admin/TableSurface';
import { CheckCircle2, Search, Filter, SlidersHorizontal } from 'lucide-react';
import { useCbtPackage } from './CbtPackageContext';

export default function CbtPackageDialogs() {
    const {
        pkg,
        availableQuestions,
        questionModules,
        isAddQuestionsModalOpen,
        setIsAddQuestionsModalOpen,
        selectedQuestionIds,
        filterModuleId,
        setFilterModuleId,
        filterStage,
        setFilterStage,
        searchQuery,
        setSearchQuery,
        isEditModalOpen,
        setIsEditModalOpen,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        isDeleting,
        setIsDeleting,
        editForm,
        isQuotaModalOpen,
        setIsQuotaModalOpen,
        quotaForm,
        handleSetQuotaMode,
        handleSetQuotaCount,
        estimatedQuotaTotal,
        handleApplyQuotas,
        handleSaveEdit,
        filteredAvailableQuestions,
        handleSelectAllFiltered,
        handleDeselectAllFiltered,
        selectedBreakdown,
        handleToggleQuestion,
        handleSaveQuestions,
    } = useCbtPackage();

    return (
        <>
            {/* Modal: Pilih Soal Dari Bank Soal */}
            <Modal
                isOpen={isAddQuestionsModalOpen}
                onClose={() => setIsAddQuestionsModalOpen(false)}
                title={`Pilih Butir Soal untuk Paket: ${pkg.title}`}
                maxWidth="4xl"
            >
                <div className="space-y-4 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-[#F8FBFF] border border-[#DCE7F3]">
                        <p className="text-[#6B7C93]">
                            Centang butir soal dari Bank Soal. Anda dapat memfilter dan menggabungkan butir soal dari <strong className="text-[#0E2747]">beberapa modul sekaligus</strong> ke dalam satu paket ujian ini.
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={handleSelectAllFiltered}
                                className="px-2.5 py-1 text-[11px] rounded font-semibold border border-[#DCE7F3] bg-white text-[#0B63CE] hover:bg-blue-50"
                            >
                                Pilih Semua ({filteredAvailableQuestions.length})
                            </button>
                            <button
                                type="button"
                                onClick={handleDeselectAllFiltered}
                                className="px-2.5 py-1 text-[11px] rounded font-semibold border border-[#DCE7F3] bg-white text-slate-700 hover:bg-slate-50"
                            >
                                Hapus Pilihan
                            </button>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari teks soal atau kode..."
                                className="w-full text-xs rounded-lg border border-[#DCE7F3] pl-8 pr-3 py-1.5 focus:border-[#0B63CE] focus:ring-[#0B63CE]"
                            />
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        </div>

                        <select
                            value={filterModuleId}
                            onChange={(e) => setFilterModuleId(e.target.value)}
                            className="w-full text-xs rounded-lg border border-[#DCE7F3] px-3 py-1.5 focus:border-[#0B63CE] focus:ring-[#0B63CE]"
                        >
                            <option value="">Semua Modul ({availableQuestions.length} butir)</option>
                            {questionModules.map((m) => (
                                <option key={m.id} value={m.id}>
                                    [{m.code}] {m.title}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filterStage}
                            onChange={(e) => setFilterStage(e.target.value)}
                            className="w-full text-xs rounded-lg border border-[#DCE7F3] px-3 py-1.5 focus:border-[#0B63CE] focus:ring-[#0B63CE]"
                        >
                            <option value="">Semua Tahap Ujian</option>
                            <option value="pre_test">Pre-Test</option>
                            <option value="quiz">Kuis Formatif</option>
                            <option value="post_test">Post-Test</option>
                        </select>
                    </div>

                    <TableSurface className="max-h-[50vh] overflow-y-auto shadow-none" ariaLabel="Daftar soal yang tersedia">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#F8FBFF] text-[#6B7C93] font-mono text-[10px] uppercase sticky top-0 border-b border-[#DCE7F3] z-10">
                                <tr>
                                    <th className="px-4 py-2 w-10 text-center">Pilih</th>
                                    <th className="px-4 py-2">Kode</th>
                                    <th className="px-4 py-2">Modul Asal</th>
                                    <th className="px-4 py-2">Pertanyaan</th>
                                    <th className="px-4 py-2">Tahap</th>
                                    <th className="px-4 py-2">Kesulitan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#DCE7F3]">
                                {filteredAvailableQuestions.length > 0 ? (
                                    filteredAvailableQuestions.map((q) => {
                                        const isSelected = selectedQuestionIds.includes(q.id);
                                        return (
                                            <tr
                                                key={q.id}
                                                onClick={() => handleToggleQuestion(q.id)}
                                                className={`cursor-pointer transition-colors ${
                                                    isSelected ? 'bg-[#EAF5FF]' : 'hover:bg-slate-50'
                                                }`}
                                            >
                                                <td className="px-4 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onChange={() => handleToggleQuestion(q.id)}
                                                        aria-label={`Pilih soal ${q.code}`}
                                                    />
                                                </td>
                                                <td className="px-4 py-2 font-mono font-bold text-[#0B63CE] whitespace-nowrap">
                                                    {q.code}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    {q.question_module?.code ? (
                                                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[#0B63CE] border border-blue-200 text-[10px] font-mono font-bold">
                                                            {q.question_module.code}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 text-[10px]">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2 font-medium text-[#0E2747] line-clamp-2">
                                                    {q.question_text}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    {q.exam_stage ? (
                                                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                                            {q.exam_stage === 'pre_test' ? 'Pre-Test' : q.exam_stage === 'quiz' ? 'Kuis' : 'Post-Test'}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 text-[10px]">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2 capitalize text-[#6B7C93] whitespace-nowrap">
                                                    {q.difficulty_level}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-[#6B7C93]">
                                            Tidak ada butir soal yang sesuai dengan filter pencarian.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </TableSurface>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#DCE7F3]">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-[#0E2747]">
                                Total: {selectedQuestionIds.length} butir soal dipilih
                            </span>
                            {Object.entries(selectedBreakdown).length > 1 && (
                                <div className="flex flex-wrap items-center gap-1 ml-1">
                                    {Object.entries(selectedBreakdown).map(([code, cnt]) => (
                                        <span key={code} className="px-1.5 py-0.5 rounded bg-blue-50 text-[#0B63CE] border border-blue-200 font-mono text-[10px] font-semibold">
                                            {code}: {cnt}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <Button variant="secondary" onClick={() => setIsAddQuestionsModalOpen(false)}>
                                Batal
                            </Button>
                            <Button onClick={handleSaveQuestions} className="bg-[#0B63CE] text-white">
                                Simpan Pilihan Soal
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Modal: Edit Pengaturan CBT */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={`Edit Pengaturan Paket: ${pkg.title}`}
                maxWidth="2xl"
            >
                <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <FormField label="Kode Paket" error={editForm.errors.code} required>
                            <Input
                                value={editForm.data.code}
                                onChange={(e) => editForm.setData('code', e.target.value)}
                                className="font-mono uppercase"
                                required
                            />
                        </FormField>

                        <div className="sm:col-span-2">
                            <FormField label="Nama Paket Ujian" error={editForm.errors.title} required>
                                <Input
                                    value={editForm.data.title}
                                    onChange={(e) => editForm.setData('title', e.target.value)}
                                    required
                                />
                            </FormField>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <FormField label="Durasi (Menit)" error={editForm.errors.duration_minutes} required>
                            <Input
                                type="number"
                                min="5"
                                max="300"
                                value={editForm.data.duration_minutes}
                                onChange={(e) => editForm.setData('duration_minutes', parseInt(e.target.value, 10))}
                                required
                            />
                        </FormField>

                        <FormField label="Standar Kelulusan (KKM)" error={editForm.errors.passing_score} required>
                            <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={editForm.data.passing_score}
                                onChange={(e) => editForm.setData('passing_score', parseFloat(e.target.value))}
                                required
                            />
                        </FormField>

                        <FormField label="Batas Percobaan" error={editForm.errors.attempts_allowed} required>
                            <Input
                                type="number"
                                min="1"
                                max="10"
                                value={editForm.data.attempts_allowed}
                                onChange={(e) => editForm.setData('attempts_allowed', parseInt(e.target.value, 10))}
                                required
                            />
                        </FormField>
                    </div>

                    {/* Pengaturan Acak Soal & Jawaban */}
                    <div className="rounded-xl border border-[#DCE7F3] bg-[#F8FBFF] p-3 space-y-3">
                        <span className="font-bold text-[#0E2747] text-xs block">
                            Pengaturan Pengacakan Ujian
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-[#DCE7F3] cursor-pointer hover:border-[#0B63CE] transition-colors">
                                <input
                                    type="checkbox"
                                    checked={editForm.data.randomize_questions}
                                    onChange={(e) => editForm.setData('randomize_questions', e.target.checked)}
                                    className="rounded border-[#DCE7F3] text-[#0B63CE] focus:ring-[#0B63CE] mt-0.5"
                                />
                                <div>
                                    <span className="font-bold text-[#0E2747] block text-xs">Acak Urutan Soal</span>
                                    <span className="text-[11px] text-[#6B7C93] block mt-0.5">
                                        Urutan nomor butir soal akan diacak berbeda untuk setiap peserta.
                                    </span>
                                </div>
                            </label>

                            <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border border-[#DCE7F3] cursor-pointer hover:border-[#0B63CE] transition-colors">
                                <input
                                    type="checkbox"
                                    checked={editForm.data.randomize_answers}
                                    onChange={(e) => editForm.setData('randomize_answers', e.target.checked)}
                                    className="rounded border-[#DCE7F3] text-[#0B63CE] focus:ring-[#0B63CE] mt-0.5"
                                />
                                <div>
                                    <span className="font-bold text-[#0E2747] block text-xs">Acak Pilihan Jawaban</span>
                                    <span className="text-[11px] text-[#6B7C93] block mt-0.5">
                                        Urutan opsi pilihan ganda diacak untuk setiap peserta.
                                    </span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <FormField label="Petunjuk / Instruksi Ujian" error={editForm.errors.instructions}>
                        <Textarea
                            rows={3}
                            value={editForm.data.instructions}
                            onChange={(e) => editForm.setData('instructions', e.target.value)}
                        />
                    </FormField>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DCE7F3]">
                        <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={editForm.processing} className="bg-[#0B63CE] text-white">
                            {editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Atur Kuota Soal Per Modul */}
            <Modal
                isOpen={isQuotaModalOpen}
                onClose={() => setIsQuotaModalOpen(false)}
                title="Atur Kuota Soal Per Modul"
                maxWidth="2xl"
            >
                <form onSubmit={handleApplyQuotas} className="space-y-4 text-xs">
                    <div className="p-3 rounded-lg bg-[#F8FBFF] border border-[#DCE7F3] text-xs text-[#0E2747] leading-relaxed">
                        Tentukan apakah tiap modul diambil <strong>seluruh butir soalnya</strong> atau <strong>dibatasi jumlah tertentu</strong> (misal 15 butir dari 40 butir di bank soal). Butir soal yang terpilih akan disinkronkan otomatis ke paket ujian ini.
                    </div>

                    <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                        {(pkg.blueprint_modules || []).map((m) => {
                            const qConfig = quotaForm.data.question_module_quotas?.[m.id] || {
                                mode: m.quota_mode || 'all',
                                count: m.quota_count || m.active_questions_count || 10,
                            };
                            const isCustom = qConfig.mode === 'custom';

                            return (
                                <div
                                    key={m.id}
                                    className="p-3.5 rounded-xl bg-white border border-[#DCE7F3] shadow-2xs space-y-2.5"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="font-mono text-xs font-bold text-[#0B63CE] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 shrink-0">
                                                [{m.code}]
                                            </span>
                                            <span className="font-bold text-xs text-[#0E2747] truncate">
                                                {m.title}
                                            </span>
                                        </div>
                                        <span className="text-[11px] font-medium text-[#6B7C93] bg-slate-100 px-2 py-0.5 rounded shrink-0">
                                            Tersedia: {m.active_questions_count || 0} butir aktif
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 text-xs">
                                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                            <input
                                                type="radio"
                                                name={`modal_quota_mode_${m.id}`}
                                                checked={!isCustom}
                                                onChange={() => handleSetQuotaMode(m.id, 'all')}
                                                className="text-[#0B63CE] focus:ring-[#0B63CE]"
                                            />
                                            <span className="text-[#0E2747] font-medium">
                                                Ambil Semua ({m.active_questions_count || 0} butir)
                                            </span>
                                        </label>

                                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                            <input
                                                type="radio"
                                                name={`modal_quota_mode_${m.id}`}
                                                checked={isCustom}
                                                onChange={() => handleSetQuotaMode(m.id, 'custom')}
                                                className="text-[#0B63CE] focus:ring-[#0B63CE]"
                                            />
                                            <span className="text-[#0E2747] font-medium">
                                                Tentukan Jumlah Soal:
                                            </span>
                                        </label>

                                        {isCustom && (
                                            <div className="inline-flex items-center gap-1.5">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={m.active_questions_count || 999}
                                                    value={qConfig.count || ''}
                                                    onChange={(e) => handleSetQuotaCount(m.id, e.target.value)}
                                                    className="w-20 px-2.5 py-1 text-xs font-bold font-mono text-center rounded border border-[#DCE7F3] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                                                />
                                                <span className="text-[11px] text-[#6B7C93]">butir soal</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#0B63CE]" />
                            <span className="font-bold text-[#0B63CE]">
                                Total Soal yang Akan Dimasukkan: {estimatedQuotaTotal} butir
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                            <span className="text-[#6B7C93]">Metode:</span>
                            <select
                                value={quotaForm.data.selection_method || 'random'}
                                onChange={(e) => quotaForm.setData('selection_method', e.target.value)}
                                className="py-1 px-2.5 text-xs rounded border border-[#DCE7F3] bg-white font-medium text-[#0E2747]"
                            >
                                <option value="random">Acak dari Bank Soal (Rekomendasi)</option>
                                <option value="sequential">Urut Nomor Soal (1..N)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DCE7F3]">
                        <Button type="button" variant="secondary" onClick={() => setIsQuotaModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={quotaForm.processing}
                            className="bg-[#0B63CE] text-white"
                            icon={SlidersHorizontal}
                        >
                            {quotaForm.processing ? 'Menyinkronkan...' : 'Simpan & Tarik Butir Soal'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal Konfirmasi Hapus Paket CBT */}
            <AlertDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => !isDeleting && setIsDeleteDialogOpen(false)}
                title="Hapus Paket Ujian CBT?"
                description={`Apakah Anda yakin ingin menghapus paket ujian "${pkg.title}"? Seluruh butir soal yang diikutsertakan di dalam paket ini akan dihapus.`}
                confirmText={isDeleting ? 'Menghapus...' : 'Hapus Paket'}
                variant="danger"
                loading={isDeleting}
                onConfirm={() => {
                    setIsDeleting(true);
                    router.delete(`/admin/cbt/paket-ujian/${pkg.id}`, {
                        onFinish: () => {
                            setIsDeleting(false);
                            setIsDeleteDialogOpen(false);
                        },
                    });
                }}
            />
        </>
    );
}
