import React from 'react';
import { router } from '@inertiajs/react';
import { Check, Download, FileSpreadsheet } from 'lucide-react';
import Button from '../../../../../Components/ui/Button';
import Modal from '../../../../../Components/ui/Modal';
import AlertDialog from '../../../../../Components/ui/AlertDialog';
import FormField from '../../../../../Components/ui/FormField';
import Input from '../../../../../Components/ui/Input';
import Select from '../../../../../Components/ui/Select';
import Textarea from '../../../../../Components/ui/Textarea';
import Combobox from '../../../../../Components/ui/Combobox';
import FileInput from '../../../../../Components/ui/FileInput';

export default function QuestionModuleDialogs({
    events,
    learningModules,
    tracks,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isImportModalOpen,
    setIsImportModalOpen,
    activeModule,
    setActiveModule,
    moduleToDelete,
    setModuleToDelete,
    isDeleting,
    setIsDeleting,
    importForm,
    form,
    handleSaveCreate,
    handleSaveEdit,
    toggleTrackCode,
}) {
    return (
        <>
            {/* Modal: Buat / Edit Modul Soal */}
            <Modal
                isOpen={isCreateModalOpen || isEditModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                    setActiveModule(null);
                }}
                title={isCreateModalOpen ? 'Tambah Modul Soal (Blueprint Evaluasi)' : `Edit Modul Soal: ${activeModule?.title}`}
                maxWidth="3xl"
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
                        <FormField label="Kode Modul Soal" error={form.errors.code} required>
                            <Input
                                value={form.data.code}
                                onChange={(e) => form.setData('code', e.target.value)}
                                placeholder="Contoh: MS-KEMPO-01"
                                className="font-mono uppercase"
                                required
                            />
                        </FormField>

                        <div className="sm:col-span-2">
                            <FormField label="Nama Modul Soal" error={form.errors.title} required>
                                <Input
                                    value={form.data.title}
                                    onChange={(e) => form.setData('title', e.target.value)}
                                    placeholder="Contoh: Evaluasi Teknik Kepelatihan Modern"
                                    required
                                />
                            </FormField>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Combobox
                            label="Modul Pembelajaran Terkait (Kurikulum)"
                            value={form.data.learning_module_id}
                            onChange={(value) => form.setData('learning_module_id', value)}
                            options={learningModules.map((module) => ({ value: module.id, label: `[${module.code}] ${module.title}` }))}
                            placeholder="Pilih modul pembelajaran (opsional)"
                            searchPlaceholder="Cari kode atau nama modul…"
                            emptyText="Modul pembelajaran tidak ditemukan."
                            error={form.errors.learning_module_id}
                        />

                        <FormField label="Kategori Evaluasi" error={form.errors.category}>
                            <Input
                                value={form.data.category}
                                onChange={(e) => form.setData('category', e.target.value)}
                                placeholder="Teori, Peraturan, Falsafah..."
                            />
                        </FormField>
                    </div>

                    {/* Target Jalur Peserta */}
                    <div>
                        <label className="block text-xs font-semibold text-[#0E2747] mb-1.5">
                            Target Jalur atau Level Peserta
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {tracks.map((t) => {
                                const checked = (form.data.track_codes || []).includes(t.code);
                                return (
                                    <button
                                        type="button"
                                        key={t.code}
                                        onClick={() => toggleTrackCode(t.code)}
                                        className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${
                                            checked
                                                ? 'border-[#7957D5] bg-purple-50 text-[#0E2747] font-semibold'
                                                : 'border-[#DCE7F3] bg-white text-[#6B7C93] hover:bg-slate-50'
                                        }`}
                                    >
                                        <div
                                            className={`w-4 h-4 rounded flex items-center justify-center text-white text-[10px] ${
                                                checked ? 'bg-[#7957D5]' : 'border border-slate-300'
                                            }`}
                                        >
                                            {checked && <Check className="w-3 h-3 stroke-[3]" />}
                                        </div>
                                        <span className="truncate">{t.code} — {t.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Standar Nilai Kelulusan (KKM)" error={form.errors.passing_grade} required>
                            <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={form.data.passing_grade}
                                onChange={(e) => form.setData('passing_grade', parseFloat(e.target.value))}
                                required
                            />
                        </FormField>

                        <FormField label="Status" error={form.errors.status} required>
                            <Select
                                value={form.data.status}
                                onChange={(e) => form.setData('status', e.target.value)}
                                options={[
                                    { value: 'draft', label: 'Draft' },
                                    { value: 'active', label: 'Aktif (Siap Digunakan)' },
                                    { value: 'inactive', label: 'Nonaktif' },
                                    { value: 'archived', label: 'Diarsipkan' },
                                ]}
                            />
                        </FormField>
                    </div>

                    <FormField label="Deskripsi / Ruang Lingkup Evaluasi" error={form.errors.description}>
                        <Textarea
                            rows={3}
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            placeholder="Deskripsi materi atau kompetensi yang diuji..."
                        />
                    </FormField>

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
                        <Button type="submit" disabled={form.processing} className="bg-[#7957D5] text-white">
                            {form.processing ? 'Menyimpan...' : 'Simpan Modul Soal'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Impor Modul & Bank Soal */}
            <Modal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                title="Impor Bank Soal & Modul Soal (.xlsx)"
                description="Unggah berkas Excel yang memuat sheet PETUNJUK, PRE-TEST, KUIS, POST-TEST, dan REFERENSI."
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsImportModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            form="question-module-import-form"
                            disabled={!importForm.data.file || importForm.processing}
                            loading={importForm.processing}
                            className="bg-[#0B63CE] text-white"
                        >
                            {importForm.processing ? 'Mengimpor Data...' : 'Mulai Impor'}
                        </Button>
                    </>
                }
            >
                <form
                    id="question-module-import-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        importForm.post('/admin/master/modul-soal/impor', {
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
                                Format 5 Sheet Terintegrasi
                            </span>
                            <a
                                href="/admin/master/modul-soal/format-kosong"
                                className="font-semibold text-[#0B63CE] hover:underline flex items-center gap-1"
                                download="format-master-bank-soal-perkemi.xlsx"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Unduh format (.xlsx)
                            </a>
                        </div>
                        <p className="text-[#6B7C93] leading-relaxed">
                            Sistem akan otomatis membaca seluruh butir soal dan membaginya sesuai stage:
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                            <div className="bg-white p-2 rounded-lg border border-[#DCE7F3]">
                                <span className="font-semibold text-[#0E2747] block">PETUNJUK</span>
                                <span className="text-[11px] text-[#6B7C93]">Panduan & Aspek Asesmen</span>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-[#DCE7F3]">
                                <span className="font-semibold text-[#0E2747] block">PRE-TEST</span>
                                <span className="text-[11px] text-[#6B7C93]">Diagnostik (C1–C2)</span>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-[#DCE7F3]">
                                <span className="font-semibold text-[#0E2747] block">KUIS</span>
                                <span className="text-[11px] text-[#6B7C93]">Formatif (C3)</span>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-[#DCE7F3]">
                                <span className="font-semibold text-[#0E2747] block">POST-TEST</span>
                                <span className="text-[11px] text-[#6B7C93]">Sumatif (C3–C4)</span>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-[#DCE7F3]">
                                <span className="font-semibold text-[#0E2747] block">REFERENSI</span>
                                <span className="text-[11px] text-[#6B7C93]">Pemetaan Kode Modul</span>
                            </div>
                        </div>
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

                    <FileInput
                        id="question-module-import-file"
                        name="file"
                        label="Pilih Berkas Excel (.xlsx)"
                        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        required
                        onChange={(e) => importForm.setData('file', e.target.files?.[0] || null)}
                        error={importForm.errors.file}
                        helperText="Maksimal 20MB. Kompatibel dengan berkas Bank Soal PERKEMI 2026."
                    />
                </form>
            </Modal>

            {/* Modal Konfirmasi Hapus Modul Soal */}
            <AlertDialog
                isOpen={Boolean(moduleToDelete)}
                onClose={() => !isDeleting && setModuleToDelete(null)}
                title="Hapus Modul Soal?"
                description={`Apakah Anda yakin ingin menghapus modul soal "${moduleToDelete?.title}"? Butir-butir soal yang terkait dengan modul ini akan tetap tersimpan di Bank Soal namun dilepaskan dari modul ini.`}
                confirmText={isDeleting ? 'Menghapus...' : 'Hapus Modul'}
                variant="danger"
                loading={isDeleting}
                onConfirm={() => {
                    setIsDeleting(true);
                    router.delete(`/admin/master/modul-soal/${moduleToDelete.id}`, {
                        preserveScroll: true,
                        onFinish: () => {
                            setIsDeleting(false);
                            setModuleToDelete(null);
                        },
                    });
                }}
            />
        </>
    );
}
