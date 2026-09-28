import Button from '../../../../Components/ui/Button';
import Modal from '../../../../Components/ui/Modal';
import FormField from '../../../../Components/ui/FormField';
import Input from '../../../../Components/ui/Input';
import Select from '../../../../Components/ui/Select';
import Textarea from '../../../../Components/ui/Textarea';
import { useEventShow } from './EventShowContext';

export default function EventCbtDialogs() {
    const {
        availableQuestionModules,
        isCbtPackageModalOpen,
        setIsCbtPackageModalOpen,
        editingCbtPackage,
        isAddQuestionModalOpen,
        setIsAddQuestionModalOpen,
        activeCbtPackageForQuestion,
        cbtPackageForm,
        questionForm,
        handleSaveCbtPackage,
        handleSaveQuestion,
    } = useEventShow();

    return (
        <>
            {/* MODAL: Buat / Edit Paket CBT */}
            <Modal
                isOpen={isCbtPackageModalOpen}
                onClose={() => setIsCbtPackageModalOpen(false)}
                title={editingCbtPackage ? 'Edit Paket Ujian CBT' : 'Buat Paket Ujian CBT Baru'}
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsCbtPackageModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" form="cbt-package-form" variant="primary" loading={cbtPackageForm.processing}>
                            Simpan Paket Ujian
                        </Button>
                    </>
                }
            >
                <form id="cbt-package-form" onSubmit={handleSaveCbtPackage} className="space-y-4">
                    <FormField label="Nama Paket Ujian" required>
                        <Input
                            value={cbtPackageForm.data.title}
                            onChange={(e) => cbtPackageForm.setData('title', e.target.value)}
                            placeholder="Contoh: Ujian Teori Kepelatihan Shorinji Kempo 2026"
                            required
                        />
                    </FormField>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Kode Ujian">
                            <Input
                                value={cbtPackageForm.data.code}
                                onChange={(e) => cbtPackageForm.setData('code', e.target.value)}
                                placeholder="CBT-KEMPO-01"
                            />
                        </FormField>

                        <FormField label="Jenis Ujian" required>
                            <Select
                                value={cbtPackageForm.data.exam_type}
                                onChange={(e) => cbtPackageForm.setData('exam_type', e.target.value)}
                            >
                                <option value="theory">Ujian Teori</option>
                                <option value="pre_test">Pre-Test</option>
                                <option value="post_test">Post-Test</option>
                                <option value="module_eval">Evaluasi Modul</option>
                                <option value="remedial">Remedial</option>
                            </Select>
                        </FormField>
                    </div>

                    <FormField label="Ambil soal dari modul soal master" error={cbtPackageForm.errors.question_module_id}>
                        <Select value={cbtPackageForm.data.question_module_id} onChange={(e) => cbtPackageForm.setData('question_module_id', e.target.value)}>
                            <option value="">Buat soal langsung di paket ini</option>
                            {availableQuestionModules.map((module) => <option key={module.id} value={module.id}>{module.code} — {module.title}</option>)}
                        </Select>
                    </FormField>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <FormField label="Durasi (Menit)" required>
                            <Input
                                type="number"
                                min="5"
                                max="300"
                                value={cbtPackageForm.data.duration_minutes}
                                onChange={(e) => cbtPackageForm.setData('duration_minutes', parseInt(e.target.value) || 60)}
                                required
                            />
                        </FormField>

                        <FormField label="Passing Grade" required>
                            <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={cbtPackageForm.data.passing_score}
                                onChange={(e) => cbtPackageForm.setData('passing_score', parseFloat(e.target.value) || 75.00)}
                                required
                            />
                        </FormField>

                        <FormField label="Batas Percobaan" required>
                            <Input
                                type="number"
                                min="1"
                                max="10"
                                value={cbtPackageForm.data.attempts_allowed}
                                onChange={(e) => cbtPackageForm.setData('attempts_allowed', parseInt(e.target.value) || 1)}
                                required
                            />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Revisi jika di bawah KKM" required>
                            <Select value={cbtPackageForm.data.revision_method} onChange={(e) => cbtPackageForm.setData('revision_method', e.target.value)}>
                                <option value="none">Tidak ada revisi</option>
                                <option value="retry">Mulai ulang ujian</option>
                                <option value="paper">Unggah makalah PDF</option>
                            </Select>
                        </FormField>
                        {cbtPackageForm.data.revision_method === 'paper' && <FormField label="Batas unggah makalah" required>
                            <Input type="datetime-local" required value={cbtPackageForm.data.revision_deadline} onChange={(e) => cbtPackageForm.setData('revision_deadline', e.target.value)} />
                        </FormField>}
                    </div>

                    <FormField label="Status Paket" required>
                        <Select
                            value={cbtPackageForm.data.status}
                            onChange={(e) => cbtPackageForm.setData('status', e.target.value)}
                        >
                            <option value="open">Dibuka untuk Peserta</option>
                            <option value="ready">Siap Digunakan (Terjadwal)</option>
                            <option value="draft">Draft (Belum Aktif)</option>
                            <option value="closed">Ditutup</option>
                        </Select>
                    </FormField>

                    <FormField label="Petunjuk Peserta">
                        <Textarea
                            value={cbtPackageForm.data.instructions}
                            onChange={(e) => cbtPackageForm.setData('instructions', e.target.value)}
                            rows={2}
                        />
                    </FormField>
                </form>
            </Modal>

            {/* MODAL: Tambah Soal CBT */}
            <Modal
                isOpen={isAddQuestionModalOpen}
                onClose={() => setIsAddQuestionModalOpen(false)}
                title={`Tambah Soal ke: ${activeCbtPackageForQuestion?.title || 'Paket CBT'}`}
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsAddQuestionModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" form="question-form" variant="primary">
                            Simpan Soal
                        </Button>
                    </>
                }
            >
                <form id="question-form" onSubmit={handleSaveQuestion} className="space-y-4">
                    <FormField label="Pertanyaan Soal" required>
                        <Textarea
                            value={questionForm.data.question_text}
                            onChange={(e) => questionForm.setData('question_text', e.target.value)}
                            rows={3}
                            placeholder="Tuliskan pertanyaan soal ujian..."
                            required
                        />
                    </FormField>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[#0E2747] block uppercase">Pilihan Jawaban</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Input
                                value={questionForm.data.option_a}
                                onChange={(e) => questionForm.setData('option_a', e.target.value)}
                                placeholder="Opsi A"
                                required
                            />
                            <Input
                                value={questionForm.data.option_b}
                                onChange={(e) => questionForm.setData('option_b', e.target.value)}
                                placeholder="Opsi B"
                                required
                            />
                            <Input
                                value={questionForm.data.option_c}
                                onChange={(e) => questionForm.setData('option_c', e.target.value)}
                                placeholder="Opsi C"
                                required
                            />
                            <Input
                                value={questionForm.data.option_d}
                                onChange={(e) => questionForm.setData('option_d', e.target.value)}
                                placeholder="Opsi D"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <FormField label="Kunci Jawaban Benar" required>
                            <Select
                                value={questionForm.data.correct_answer}
                                onChange={(e) => questionForm.setData('correct_answer', e.target.value)}
                            >
                                <option value="A">Pilihan A</option>
                                <option value="B">Pilihan B</option>
                                <option value="C">Pilihan C</option>
                                <option value="D">Pilihan D</option>
                            </Select>
                        </FormField>

                        <FormField label="Bobot Poin" required>
                            <Input
                                type="number"
                                step="1"
                                min="1"
                                value={questionForm.data.points}
                                onChange={(e) => questionForm.setData('points', parseFloat(e.target.value) || 10)}
                                required
                            />
                        </FormField>

                        <FormField label="Kategori / Topik">
                            <Input
                                value={questionForm.data.category}
                                onChange={(e) => questionForm.setData('category', e.target.value)}
                                placeholder="Falsafah / Goho / Juho"
                            />
                        </FormField>
                    </div>

                    <FormField label="Penjelasan Jawaban (Opsional)">
                        <Textarea
                            value={questionForm.data.explanation}
                            onChange={(e) => questionForm.setData('explanation', e.target.value)}
                            rows={2}
                            placeholder="Alasan mengapa kunci jawaban tersebut benar..."
                        />
                    </FormField>
                </form>
            </Modal>

        </>
    );
}
