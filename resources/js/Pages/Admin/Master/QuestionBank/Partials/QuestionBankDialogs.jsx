import { router } from '@inertiajs/react';
import Button from '../../../../../Components/ui/Button';
import Badge from '../../../../../Components/ui/Badge';
import Modal from '../../../../../Components/ui/Modal';
import AlertDialog from '../../../../../Components/ui/AlertDialog';
import FormField from '../../../../../Components/ui/FormField';
import Input from '../../../../../Components/ui/Input';
import Select from '../../../../../Components/ui/Select';
import Textarea from '../../../../../Components/ui/Textarea';
import Checkbox from '../../../../../Components/ui/Checkbox';
import Radio from '../../../../../Components/ui/Radio';
import FileInput from '../../../../../Components/ui/FileInput';
import { HelpCircle, X, Sparkles, Download, FileSpreadsheet } from 'lucide-react';
import { useQuestionBank } from './QuestionBankContext';

export default function QuestionBankDialogs() {
    const {
        questionModules,
        events,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isEditModalOpen,
        setIsEditModalOpen,
        isPreviewModalOpen,
        setIsPreviewModalOpen,
        isImportModalOpen,
        setIsImportModalOpen,
        previewQuestion,
        activeQuestion,
        setActiveQuestion,
        questionToDelete,
        setQuestionToDelete,
        selectedQuestionIds,
        setSelectedQuestionIds,
        isDeleting,
        setIsDeleting,
        isBulkDeleting,
        setIsBulkDeleting,
        isBulkDeleteDialogOpen,
        setIsBulkDeleteDialogOpen,
        importForm,
        form,
        handleSaveCreate,
        handleSaveEdit,
        handleOptionTextChange,
        toggleQuestionModule,
        addOption,
        removeOption,
        setQuestionType,
    } = useQuestionBank();

    return (
        <>
            {/* Modal: Tambah / Edit Butir Soal dengan LIVE PREVIEW */}
            <Modal
                isOpen={isCreateModalOpen || isEditModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                    setActiveQuestion(null);
                }}
                title={isCreateModalOpen ? 'Tambah Butir Soal Baru' : `Edit Butir Soal: ${activeQuestion?.code}`}
                maxWidth="4xl"
            >
                <form onSubmit={isCreateModalOpen ? handleSaveCreate : handleSaveEdit} className="space-y-4">
                    <FormField label="Cakupan (Admin / Event)" error={form.errors.event_id}>
                        <Select
                            value={form.data.event_id || ''}
                            onChange={(e) => form.setData('event_id', e.target.value)}
                            options={[
                                { value: '', label: '🌐 Master Nasional / Diktar (Lintas Event)' },
                                ...events.map((ev) => ({
                                    value: String(ev.id),
                                    label: `🎯 Khusus Event: ${ev.title}`,
                                })),
                            ]}
                        />
                    </FormField>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <FormField label="Kode Soal" error={form.errors.code} required>
                            <Input
                                value={form.data.code}
                                onChange={(e) => form.setData('code', e.target.value)}
                                placeholder="Contoh: BS-001"
                                className="font-mono uppercase"
                                required
                            />
                        </FormField>

                        <fieldset className="sm:col-span-2">
                            <legend className="mb-1.5 text-xs font-semibold text-[#112743]">Modul Soal <span className="text-[#DD4D7C]">*</span></legend>
                            <div className="max-h-40 overflow-y-auto rounded-lg border border-[#DCE7F3] bg-white p-2">
                                {questionModules.map((module) => (
                                    <Checkbox
                                            key={module.id}
                                            checked={form.data.question_module_ids.includes(module.id)}
                                            onChange={() => toggleQuestionModule(module.id)}
                                            label={<><span className="font-mono font-semibold">{module.code}</span> — {module.title}</>}
                                            className="min-h-11 w-full rounded px-2 hover:bg-[#EAF5FF]"
                                    />
                                ))}
                            </div>
                            <p className="mt-1 text-[11px] text-[#6B7C93]">Pilih satu atau beberapa modul. Soal disimpan sekali di Bank Soal.</p>
                            {(form.errors.question_module_ids || form.errors['question_module_ids.0']) && (
                                <p role="alert" className="mt-1 text-xs font-medium text-[#DD4D7C]">{form.errors.question_module_ids || form.errors['question_module_ids.0']}</p>
                            )}
                        </fieldset>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <FormField label="Tipe Soal" error={form.errors.question_type} required>
                            <Select
                                value={form.data.question_type}
                                onChange={(e) => setQuestionType(e.target.value)}
                                placeholder=""
                            >
                                <option value="single_choice">Pilihan Ganda (1 Jawaban Benar)</option>
                                <option value="true_false">Benar / Salah</option>
                                <option value="essay">Esai (Uraian)</option>
                            </Select>
                        </FormField>

                        <FormField label="Tingkat Kesulitan" error={form.errors.difficulty_level} required>
                            <Select
                                value={form.data.difficulty_level}
                                onChange={(e) => form.setData('difficulty_level', e.target.value)}
                                options={[
                                    { value: 'basic', label: 'Dasar (Easy)' },
                                    { value: 'intermediate', label: 'Menengah (Medium)' },
                                    { value: 'advanced', label: 'Lanjutan (Hard)' },
                                ]}
                            />
                        </FormField>

                        <FormField label="Bobot Poin" error={form.errors.points} required>
                            <Input
                                type="number"
                                step="0.5"
                                min="0.5"
                                value={form.data.points}
                                onChange={(e) => form.setData('points', parseFloat(e.target.value))}
                                required
                            />
                        </FormField>
                    </div>

                    <FormField label="Pertanyaan" error={form.errors.question_text} required>
                        <Textarea
                            rows={3}
                            value={form.data.question_text}
                            onChange={(e) => form.setData('question_text', e.target.value)}
                            placeholder="Tuliskan teks pertanyaan secara jelas dan terstruktur..."
                            required
                        />
                    </FormField>

                    {/* Options area for Choice & True/False */}
                    {form.data.question_type !== 'essay' && (
                        <div className="p-4 rounded-xl bg-[#F8FBFF] border border-[#DCE7F3] space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#0E2747]">
                                    Pilihan Jawaban (Tandai Jawaban Benar)
                                </span>
                                {form.data.question_type === 'single_choice' && (
                                    <button
                                        type="button"
                                        onClick={addOption}
                                        className="text-xs font-semibold text-[#0B63CE] hover:underline"
                                    >
                                        + Tambah Pilihan
                                    </button>
                                )}
                            </div>

                            <div className="space-y-2">
                                {form.data.options.map((opt, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <Radio
                                            name="correct_answer_radio"
                                            checked={form.data.correct_answer === opt.key}
                                            onChange={() => form.setData('correct_answer', opt.key)}
                                            title="Tandai sebagai jawaban benar"
                                            aria-label={`Tandai pilihan ${opt.key} sebagai jawaban benar`}
                                        />
                                        <span className="w-6 font-mono font-bold text-xs text-[#0E2747]">
                                            {opt.key}.
                                        </span>
                                        <Input
                                            value={opt.text}
                                            onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                                            placeholder={`Teks pilihan ${opt.key}...`}
                                            className="text-xs"
                                            required
                                        />
                                        {form.data.question_type === 'single_choice' && form.data.options.length > 2 && (
                                            <button
                                                type="button"
                                                onClick={() => removeOption(idx)}
                                                className="p-1 text-rose-500 hover:text-rose-700"
                                                title="Hapus opsi"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Essay notice */}
                    {form.data.question_type === 'essay' && (
                        <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-800 flex items-start gap-2">
                            <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#7957D5]" />
                            <p>
                                <strong>Ketentuan Soal Esai:</strong> Soal esai tidak dinilai otomatis oleh sistem. Lembar jawaban peserta akan berstatus <em>“Menunggu Penilaian”</em> sampai penguji berwenang memberikan nilai.
                            </p>
                        </div>
                    )}

                    <FormField label="Penjelasan Jawaban (Opsional, untuk pembahasan)" error={form.errors.explanation}>
                        <Textarea
                            rows={2}
                            value={form.data.explanation}
                            onChange={(e) => form.setData('explanation', e.target.value)}
                            placeholder="Alasan mengapa jawaban tersebut benar..."
                        />
                    </FormField>

                    {/* LIVE PREVIEW BOX */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#0E2747]">
                            <Sparkles className="w-4 h-4 text-[#EE9B25]" />
                            <span>Live Preview Butir Soal</span>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-[#DCE7F3] text-xs">
                            <p className="font-semibold text-[#0E2747]">
                                {form.data.question_text || 'Teks pertanyaan akan tampil di sini...'}
                            </p>
                            {form.data.question_type !== 'essay' && (
                                <div className="mt-2 space-y-1 pl-2">
                                    {form.data.options.map((opt) => (
                                        <div
                                            key={opt.key}
                                            className={`p-1.5 rounded text-xs flex items-center gap-2 ${
                                                form.data.correct_answer === opt.key
                                                    ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                                                    : 'text-[#6B7C93]'
                                            }`}
                                        >
                                            <span className="font-mono font-bold">{opt.key}.</span>
                                            <span>{opt.text || `Pilihan ${opt.key}`}</span>
                                            {form.data.correct_answer === opt.key && (
                                                <span className="text-[10px] text-emerald-600 ml-auto">(Kunci)</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DCE7F3]">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setIsCreateModalOpen(false);
                                setIsEditModalOpen(false);
                            }}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={form.processing} className="bg-[#0B63CE] text-white">
                            {form.processing ? 'Menyimpan...' : 'Simpan Soal'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Preview Soal */}
            <Modal
                isOpen={isPreviewModalOpen}
                onClose={() => setIsPreviewModalOpen(false)}
                title={`Preview Soal: ${previewQuestion?.code}`}
            >
                {previewQuestion && (
                    <div className="space-y-4 text-xs">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-[#F8FBFF] border border-[#DCE7F3]">
                            <div>
                                <span className="font-mono text-xs font-bold text-[#0B63CE]">
                                    {previewQuestion.code}
                                </span>
                                <span className="text-[#6B7C93] block text-[11px]">
                                    Modul: {previewQuestion.question_modules?.map((module) => module.title).join(', ') || '-'}
                                </span>
                            </div>
                            <Badge variant="secondary">{previewQuestion.difficulty_level}</Badge>
                        </div>

                        <div>
                            <span className="font-bold text-[#0E2747] block mb-1">Pertanyaan:</span>
                            <p className="text-sm font-medium text-[#112743] p-3 rounded-lg bg-slate-50 border border-[#DCE7F3]">
                                {previewQuestion.question_text}
                            </p>
                        </div>

                        {previewQuestion.options && previewQuestion.options.length > 0 && (
                            <div>
                                <span className="font-bold text-[#0E2747] block mb-1">Pilihan Jawaban:</span>
                                <div className="space-y-1.5">
                                    {previewQuestion.options.map((opt) => (
                                        <div
                                            key={opt.key}
                                            className="p-2.5 rounded-lg border border-[#DCE7F3] flex items-center gap-2 bg-white"
                                        >
                                            <span className="font-mono font-bold text-[#0E2747]">{opt.key}.</span>
                                            <span className="text-[#112743]">{opt.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end pt-3 border-t border-[#DCE7F3]">
                            <Button variant="secondary" onClick={() => setIsPreviewModalOpen(false)}>
                                Tutup
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal: Impor Butir Soal */}
            <Modal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                title="Impor Butir Bank Soal (.csv)"
                description="Unggah berkas CSV untuk menambahkan butir pertanyaan secara massal."
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsImportModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            form="question-bank-import-form"
                            disabled={!importForm.data.file || importForm.processing}
                            loading={importForm.processing}
                            className="bg-[#0B63CE] text-white"
                        >
                            {importForm.processing ? 'Mengimpor...' : 'Mulai Impor'}
                        </Button>
                    </>
                }
            >
                <form
                    id="question-bank-import-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        importForm.post('/admin/master/bank-soal/impor', {
                            forceFormData: true,
                            onSuccess: () => {
                                importForm.reset();
                                setIsImportModalOpen(false);
                            },
                        });
                    }}
                    className="space-y-4"
                >
                    <div className="rounded-xl border border-[#DCE7F3] bg-[#F8FBFF] p-4 text-xs text-[#112743] space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-[#0E2747] flex items-center gap-1.5">
                                <FileSpreadsheet className="w-4 h-4 text-[#0B63CE]" />
                                Format Butir Soal CSV
                            </span>
                            <a
                                href="/admin/master/bank-soal/template"
                                className="font-semibold text-[#0B63CE] hover:underline flex items-center gap-1"
                                download="template-bank-soal.csv"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Unduh template (.csv)
                            </a>
                        </div>
                        <p className="text-[#6B7C93] leading-relaxed">
                            Format CSV mendukung kolom: <code>code, question_text, question_type, option_a, option_b, option_c, option_d, correct_answer, points, difficulty_level, explanation, module_code</code>.
                        </p>
                    </div>

                    <FormField label="Target Cakupan Impor" error={importForm.errors.event_id}>
                        <Select
                            value={importForm.data.event_id || ''}
                            onChange={(e) => importForm.setData('event_id', e.target.value)}
                            options={[
                                { value: '', label: '🌐 Master Nasional / Diktar (Lintas Event)' },
                                ...events.map((ev) => ({
                                    value: String(ev.id),
                                    label: `🎯 Khusus Event: ${ev.title}`,
                                })),
                            ]}
                        />
                    </FormField>

                    <FormField label="Tautkan ke Modul Soal Default (Opsional)" error={importForm.errors.question_module_id}>
                        <Select
                            value={importForm.data.question_module_id || ''}
                            onChange={(e) => importForm.setData('question_module_id', e.target.value)}
                            options={[
                                { value: '', label: 'Pilih Modul Soal (jika tidak ada di CSV)' },
                                ...questionModules.map((m) => ({
                                    value: String(m.id),
                                    label: `[${m.code}] ${m.title}`,
                                })),
                            ]}
                        />
                    </FormField>

                    <FileInput
                        id="question-bank-import-file"
                        name="file"
                        label="Pilih Berkas CSV (.csv)"
                        accept=".csv,text/csv"
                        required
                        onChange={(e) => importForm.setData('file', e.target.files?.[0] || null)}
                        error={importForm.errors.file}
                        helperText="Format berkas harus .csv dengan pemisah koma."
                    />
                </form>
            </Modal>

            {/* Modal Konfirmasi Hapus Butir Soal Tunggal */}
            <AlertDialog
                isOpen={Boolean(questionToDelete)}
                onClose={() => !isDeleting && setQuestionToDelete(null)}
                title="Hapus Butir Soal?"
                description={`Apakah Anda yakin ingin menghapus butir soal "${questionToDelete?.code}"? Butir soal akan dihapus dari Bank Soal dan dilepaskan dari seluruh modul terkait.`}
                confirmText={isDeleting ? 'Menghapus...' : 'Hapus Soal'}
                variant="danger"
                loading={isDeleting}
                onConfirm={() => {
                    setIsDeleting(true);
                    router.delete(`/admin/master/bank-soal/${questionToDelete.id}`, {
                        preserveScroll: true,
                        onFinish: () => {
                            setIsDeleting(false);
                            setQuestionToDelete(null);
                        },
                    });
                }}
            />

            {/* Modal Konfirmasi Hapus Massal Butir Soal */}
            <AlertDialog
                isOpen={isBulkDeleteDialogOpen}
                onClose={() => !isBulkDeleting && setIsBulkDeleteDialogOpen(false)}
                title="Hapus Butir Soal Terpilih?"
                description={`Apakah Anda yakin ingin menghapus ${selectedQuestionIds.length} butir soal yang dipilih secara bersamaan? Tindakan ini akan menghapus soal-soal tersebut dari Bank Soal.`}
                confirmText={isBulkDeleting ? 'Menghapus...' : `Hapus ${selectedQuestionIds.length} Soal`}
                variant="danger"
                loading={isBulkDeleting}
                onConfirm={() => {
                    setIsBulkDeleting(true);
                    router.post('/admin/master/bank-soal/hapus-massal', {
                        ids: selectedQuestionIds,
                    }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            setSelectedQuestionIds([]);
                        },
                        onFinish: () => {
                            setIsBulkDeleting(false);
                            setIsBulkDeleteDialogOpen(false);
                        },
                    });
                }}
            />
        </>
    );
}
