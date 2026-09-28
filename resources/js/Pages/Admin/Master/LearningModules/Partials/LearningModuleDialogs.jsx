import { Link } from '@inertiajs/react';
import Button from '../../../../../Components/ui/Button';
import Modal from '../../../../../Components/ui/Modal';
import FormField from '../../../../../Components/ui/FormField';
import Input from '../../../../../Components/ui/Input';
import Select from '../../../../../Components/ui/Select';
import Textarea from '../../../../../Components/ui/Textarea';
import Checkbox from '../../../../../Components/ui/Checkbox';
import Combobox from '../../../../../Components/ui/Combobox';
import FileInput from '../../../../../Components/ui/FileInput';
import TableSurface from '../../../../../Components/admin/TableSurface';
import { Plus, ExternalLink, BookOpen, Check, X, Upload } from 'lucide-react';
import { useLearningModule } from './LearningModuleContext';

export default function LearningModuleDialogs() {
    const {
        tracks,
        materialCategories,
        availableMaterials,
        events,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isImportModalOpen,
        setIsImportModalOpen,
        importForm,
        isEditModalOpen,
        setIsEditModalOpen,
        isManageMaterialsModalOpen,
        setIsManageMaterialsModalOpen,
        materialModalTab,
        setMaterialModalTab,
        isLinkEventModalOpen,
        setIsLinkEventModalOpen,
        isDetailModalOpen,
        setIsDetailModalOpen,
        activeModule,
        setActiveModule,
        selectedMaterialId,
        setSelectedMaterialId,
        moduleForm,
        uploadMaterialForm,
        materialsForm,
        linkEventForm,
        handleUploadMaterial,
        handleSaveCreate,
        handleSaveEdit,
        handleSaveMaterials,
        handleSaveLinkEvent,
        toggleTrackCode,
        addMaterialToModule,
        removeMaterialFromModule,
    } = useLearningModule();

    return (
        <>
            <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Impor Modul Pembelajaran" description="Unggah CSV sesuai urutan kolom pada berkas format. Semua baris divalidasi sebelum disimpan." footer={<><Button variant="secondary" onClick={() => setIsImportModalOpen(false)}>Batal</Button><Button type="submit" form="learning-module-import-form" variant="primary" disabled={!importForm.data.file} loading={importForm.processing}>Impor Modul</Button></>}>
                <form id="learning-module-import-form" onSubmit={(event) => { event.preventDefault(); importForm.post('/admin/master/modul-pembelajaran/impor', { forceFormData: true, onSuccess: () => { importForm.reset(); setIsImportModalOpen(false); } }); }} className="space-y-4">
                    <a href="/admin/master/modul-pembelajaran/format-impor" className="inline-flex min-h-11 items-center text-sm font-semibold text-[#0B63CE] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]">Unduh format CSV</a>
                    <FileInput id="learning-module-import-file" name="file" label="Berkas CSV" accept=".csv,text/csv,text/plain" required onChange={(event) => importForm.setData('file', event.target.files?.[0] || null)} error={importForm.errors.file} />
                </form>
            </Modal>

            {/* Modal: Buat / Edit Modul Pembelajaran */}
            <Modal
                isOpen={isCreateModalOpen || isEditModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                    setActiveModule(null);
                }}
                title={isCreateModalOpen ? 'Tambah Modul Pembelajaran' : `Edit Modul: ${activeModule?.title}`}
                size="full"
            >
                <form onSubmit={isCreateModalOpen ? handleSaveCreate : handleSaveEdit} className="space-y-4">
                    <FormField
                        label="Cakupan Modul"
                        description="Pilih apakah modul ini standar Master Diktar (berlaku lintas event) atau khusus event tertentu."
                        error={moduleForm.errors.event_id}
                    >
                        <Select
                            value={moduleForm.data.event_id || ''}
                            onChange={(e) => moduleForm.setData('event_id', e.target.value ? parseInt(e.target.value, 10) : '')}
                            options={[
                                { value: '', label: '🌐 Master Diktar PERKEMI (Lintas Semua Event)' },
                                ...events.map((ev) => ({
                                    value: ev.id,
                                    label: `🎯 Khusus Event: ${ev.title}`,
                                })),
                            ]}
                        />
                    </FormField>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <FormField label="Kode Modul" error={moduleForm.errors.code} required>
                            <Input
                                value={moduleForm.data.code}
                                onChange={(e) => moduleForm.setData('code', e.target.value)}
                                placeholder="Contoh: MOD-KEMPO-01"
                                className="font-mono uppercase"
                                required
                            />
                        </FormField>

                        <div className="sm:col-span-2">
                            <FormField label="Nama Modul Pembelajaran" error={moduleForm.errors.title} required>
                                <Input
                                    value={moduleForm.data.title}
                                    onChange={(e) => moduleForm.setData('title', e.target.value)}
                                    placeholder="Contoh: Metodologi Kepelatihan Tingkat Lanjut"
                                    required
                                />
                            </FormField>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <FormField label="Kategori Materi" error={moduleForm.errors.category} required>
                            <Input
                                value={moduleForm.data.category}
                                onChange={(e) => moduleForm.setData('category', e.target.value)}
                                placeholder="Kurikulum Inti, Perwasitan..."
                                required
                            />
                        </FormField>

                        <FormField label="Tingkat / Level" error={moduleForm.errors.level} required>
                            <Select
                                value={moduleForm.data.level}
                                onChange={(e) => moduleForm.setData('level', e.target.value)}
                                options={[
                                    { value: 'Dasar', label: 'Dasar' },
                                    { value: 'Menengah', label: 'Menengah' },
                                    { value: 'Lanjutan', label: 'Lanjutan' },
                                    { value: 'Spesialis', label: 'Spesialis' },
                                ]}
                            />
                        </FormField>

                        <FormField label="Total JP (Jam Pelajaran)" error={moduleForm.errors.total_jp} required>
                            <Input
                                type="number"
                                min="1"
                                value={moduleForm.data.total_jp}
                                onChange={(e) => moduleForm.setData('total_jp', parseInt(e.target.value, 10))}
                                required
                            />
                        </FormField>
                    </div>

                    {/* Target Jalur Peserta Multi-Check */}
                    <div>
                        <label className="block text-xs font-semibold text-[#0E2747] mb-1.5">
                            Target Jalur Peserta
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {tracks.map((t) => {
                                const checked = (moduleForm.data.track_codes || []).includes(t.code);
                                return (
                                    <button
                                        type="button"
                                        key={t.code}
                                        onClick={() => toggleTrackCode(t.code)}
                                        className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${
                                            checked
                                                ? 'border-[#0B63CE] bg-[#EAF5FF] text-[#0E2747] font-semibold'
                                                : 'border-[#DCE7F3] bg-white text-[#6B7C93] hover:bg-slate-50'
                                        }`}
                                    >
                                        <div
                                            className={`w-4 h-4 rounded flex items-center justify-center text-white text-[10px] ${
                                                checked ? 'bg-[#0B63CE]' : 'border border-slate-300'
                                            }`}
                                        >
                                            {checked && <Check className="w-3 h-3 stroke-[3]" />}
                                        </div>
                                        <span className="truncate">
                                            {t.code} — {t.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <FormField label="Deskripsi Modul" error={moduleForm.errors.description}>
                        <Textarea
                            rows={3}
                            value={moduleForm.data.description}
                            onChange={(e) => moduleForm.setData('description', e.target.value)}
                            placeholder="Penjelasan ruang lingkup materi, referensi filosofi kempo, dan target capaian..."
                        />
                    </FormField>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Kata Kunci (Pencarian)" error={moduleForm.errors.keywords}>
                            <Input
                                value={moduleForm.data.keywords}
                                onChange={(e) => moduleForm.setData('keywords', e.target.value)}
                                placeholder="Gorin, Juho, Goho, Peraturan..."
                            />
                        </FormField>

                        <FormField label="Status Modul" error={moduleForm.errors.status} required>
                            <Select
                                value={moduleForm.data.status}
                                onChange={(e) => moduleForm.setData('status', e.target.value)}
                                options={[
                                    { value: 'draft', label: 'Draft' },
                                    { value: 'active', label: 'Aktif (Siap Digunakan)' },
                                    { value: 'inactive', label: 'Nonaktif' },
                                    { value: 'archived', label: 'Diarsipkan' },
                                ]}
                            />
                        </FormField>
                    </div>

                    {isCreateModalOpen && (
                        <div className="p-3.5 bg-[#F8FBFF] border border-[#DCE7F3] rounded-xl space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0E2747]">
                                <Upload className="w-3.5 h-3.5 text-[#0B63CE]" />
                                <span>Unggah Berkas Materi / Handout PDF (Opsional)</span>
                            </div>
                            <p className="text-[11px] text-[#6B7C93]">
                                Jika modul ini memiliki berkas bahan ajar atau silabus PDF, Anda dapat langsung mengunggahnya sekarang. Sistem otomatis menyimpannya ke Koleksi Digital dan menghubungkannya ke modul ini.
                            </p>
                            <FileInput
                                id="create-module-material-file-input"
                                name="material_file"
                                accept=".pdf,application/pdf"
                                onChange={(e) => moduleForm.setData('material_file', e.target.files?.[0] || null)}
                                error={moduleForm.errors.material_file}
                            />
                        </div>
                    )}

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
                        <Button type="submit" disabled={moduleForm.processing} className="bg-[#0B63CE] text-white">
                            {moduleForm.processing ? 'Menyimpan...' : 'Simpan Modul'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Kelola Materi Koleksi Digital */}
            <Modal
                isOpen={isManageMaterialsModalOpen}
                onClose={() => setIsManageMaterialsModalOpen(false)}
                title={`Kelola & Unggah Materi: ${activeModule?.title || ''}`}
                size="full"
            >
                <div className="space-y-4">
                    {/* Tab Selector */}
                    <div className="flex items-center gap-2 border-b border-[#DCE7F3] pb-3">
                        <button
                            type="button"
                            onClick={() => setMaterialModalTab('upload')}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                                materialModalTab === 'upload'
                                    ? 'bg-[#0B63CE] text-white shadow-xs'
                                    : 'bg-slate-100 text-[#6B7C93] hover:text-[#0E2747] hover:bg-slate-200'
                            }`}
                        >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Unggah Berkas PDF Materi Baru</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setMaterialModalTab('select')}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                                materialModalTab === 'select'
                                    ? 'bg-[#0B63CE] text-white shadow-xs'
                                    : 'bg-slate-100 text-[#6B7C93] hover:text-[#0E2747] hover:bg-slate-200'
                            }`}
                        >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Pilih dari Koleksi Digital PERKEMI</span>
                        </button>
                    </div>

                    {/* Tab 1: Upload New PDF Form */}
                    {materialModalTab === 'upload' && (
                        <form onSubmit={handleUploadMaterial} className="p-4 bg-[#F8FBFF] border border-[#DCE7F3] rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-[#0E2747] flex items-center gap-1.5">
                                    <Upload className="w-4 h-4 text-[#0B63CE]" />
                                    Unggah Berkas Materi Baru (PDF)
                                </h4>
                                <span className="text-[10px] text-[#6B7C93]">Format: PDF (Maksimal 50 MB)</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <FormField label="Pilih Berkas PDF" error={uploadMaterialForm.errors.file} required>
                                    <FileInput
                                        id="upload-material-file-input"
                                        name="file"
                                        accept=".pdf,application/pdf"
                                        required
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            uploadMaterialForm.setData('file', file);
                                            if (file && !uploadMaterialForm.data.title) {
                                                const cleanName = file.name.replace(/\.[^/.]+$/, '');
                                                uploadMaterialForm.setData((prev) => ({
                                                    ...prev,
                                                    file: file,
                                                    title: cleanName,
                                                }));
                                            }
                                        }}
                                    />
                                </FormField>

                                <FormField label="Judul Materi / Handout" error={uploadMaterialForm.errors.title} required>
                                    <Input
                                        value={uploadMaterialForm.data.title}
                                        onChange={(e) => uploadMaterialForm.setData('title', e.target.value)}
                                        placeholder="Contoh: Modul Teknik Dasar Shorinji Kempo"
                                        required
                                    />
                                </FormField>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <FormField label="Penulis / Pengunggah" error={uploadMaterialForm.errors.author}>
                                    <Input
                                        value={uploadMaterialForm.data.author}
                                        onChange={(e) => uploadMaterialForm.setData('author', e.target.value)}
                                        placeholder="PERKEMI / Nama Instruktur"
                                    />
                                </FormField>

                                <FormField label="Kategori Koleksi" error={uploadMaterialForm.errors.category_id}>
                                    <Select
                                        value={uploadMaterialForm.data.category_id}
                                        onChange={(e) => uploadMaterialForm.setData('category_id', e.target.value ? parseInt(e.target.value, 10) : '')}
                                        options={materialCategories.map((c) => ({ value: c.id, label: c.name }))}
                                    />
                                </FormField>

                                <FormField label="Estimasi Durasi Belajar" error={uploadMaterialForm.errors.estimated_duration_minutes}>
                                    <div className="flex items-center gap-1.5">
                                        <Input
                                            type="number"
                                            min="1"
                                            value={uploadMaterialForm.data.estimated_duration_minutes}
                                            onChange={(e) => uploadMaterialForm.setData('estimated_duration_minutes', parseInt(e.target.value, 10) || 45)}
                                        />
                                        <span className="text-xs text-[#6B7C93] whitespace-nowrap">Menit</span>
                                    </div>
                                </FormField>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                                <div className="sm:col-span-8">
                                    <FormField label="Catatan Instruktur (Opsional)" error={uploadMaterialForm.errors.instructor_notes}>
                                        <Input
                                            value={uploadMaterialForm.data.instructor_notes}
                                            onChange={(e) => uploadMaterialForm.setData('instructor_notes', e.target.value)}
                                            placeholder="Catatan halaman penting, bagian yang harus dibaca..."
                                        />
                                    </FormField>
                                </div>
                                <div className="sm:col-span-4 flex items-center justify-between gap-2">
                                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#0E2747]">
                                        <input
                                            type="checkbox"
                                            checked={uploadMaterialForm.data.is_required}
                                            onChange={(e) => uploadMaterialForm.setData('is_required', e.target.checked)}
                                            className="rounded border-slate-300 text-[#0B63CE] focus:ring-[#0B63CE]"
                                        />
                                        <span>Materi Wajib</span>
                                    </label>
                                    <Button
                                        type="submit"
                                        disabled={uploadMaterialForm.processing || !uploadMaterialForm.data.file}
                                        loading={uploadMaterialForm.processing}
                                        className="bg-[#0B63CE] text-white text-xs whitespace-nowrap"
                                    >
                                        <Upload className="w-3.5 h-3.5 mr-1" />
                                        Unggah & Hubungkan
                                    </Button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* Tab 2: Select From Existing Digital Collections */}
                    {materialModalTab === 'select' && (
                        <div className="p-4 bg-[#F8FBFF] border border-[#DCE7F3] rounded-xl space-y-3">
                            <label className="block text-xs font-semibold text-[#0E2747]">
                                Pilih Materi Dari Koleksi Digital PERKEMI
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                <div className="sm:col-span-9">
                                    <Combobox
                                        id="material-picker-select"
                                        value={selectedMaterialId}
                                        onChange={setSelectedMaterialId}
                                        options={availableMaterials.map((material) => ({
                                            value: material.id,
                                            label: `[${material.type.toUpperCase()}] ${material.title} — ${material.author || 'PERKEMI'}`
                                        }))}
                                        placeholder="Pilih e-book, video, atau dokumen"
                                        searchPlaceholder="Cari materi koleksi…"
                                        emptyText="Materi koleksi tidak ditemukan."
                                    />
                                </div>
                                <div className="sm:col-span-3">
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            const val = parseInt(selectedMaterialId, 10);
                                            if (val) {
                                                const found = availableMaterials.find((m) => m.id === val);
                                                if (found) addMaterialToModule(found);
                                                setSelectedMaterialId('');
                                            }
                                        }}
                                        className="w-full bg-[#0E2747] text-white text-xs"
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1" />
                                        Hubungkan Materi
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Table of Connected Materials */}
                    <form onSubmit={handleSaveMaterials} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-[#0E2747]">
                                Materi Terhubung Saat Ini ({materialsForm.data.materials.length} Materi)
                            </h4>
                            <span className="text-[11px] text-[#6B7C93]">
                                Anda dapat mengatur status wajib/pilihan, estimasi durasi, dan catatan instruktur di bawah ini.
                            </span>
                        </div>

                        <TableSurface className="shadow-none" ariaLabel="Materi koleksi yang terhubung">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 text-[#6B7C93] font-mono text-[10px] uppercase border-b border-[#DCE7F3]">
                                    <tr>
                                        <th className="px-3 py-2 w-12 text-center">No</th>
                                        <th className="px-3 py-2">Materi Koleksi Digital</th>
                                        <th className="px-3 py-2 w-28">Status Sesi</th>
                                        <th className="px-3 py-2 w-28">Durasi (Menit)</th>
                                        <th className="px-3 py-2">Catatan Instruktur</th>
                                        <th className="px-3 py-2 w-16 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#DCE7F3]">
                                    {materialsForm.data.materials.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-[#6B7C93]">
                                                Belum ada koleksi digital yang dihubungkan ke modul ini. Silakan gunakan formulir unggah di atas atau pilih dari koleksi.
                                            </td>
                                        </tr>
                                    ) : (
                                        materialsForm.data.materials.map((item, idx) => (
                                            <tr key={item.material_id} className="hover:bg-slate-50/50">
                                                <td className="px-3 py-2 text-center font-mono font-bold text-[#6B7C93]">
                                                    {idx + 1}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-[#0E2747] line-clamp-1">
                                                            {item.title}
                                                        </span>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] text-[#6B7C93] uppercase font-mono">
                                                                Tipe: {item.type}
                                                            </span>
                                                            {item.slug && (
                                                                <a
                                                                    href={`/koleksi/${item.slug}/baca`}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#0B63CE] hover:underline"
                                                                >
                                                                    <span>Buka PDF</span>
                                                                    <ExternalLink className="w-2.5 h-2.5" />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <Select
                                                        value={item.is_required ? '1' : '0'}
                                                        onChange={(e) => {
                                                            const updated = [...materialsForm.data.materials];
                                                            updated[idx].is_required = e.target.value === '1';
                                                            materialsForm.setData('materials', updated);
                                                        }}
                                                        placeholder=""
                                                        className="text-[11px]"
                                                    >
                                                        <option value="1">Wajib</option>
                                                        <option value="0">Pilihan</option>
                                                    </Select>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <Input
                                                        type="number"
                                                        min="5"
                                                        value={item.estimated_duration_minutes || 45}
                                                        onChange={(e) => {
                                                            const updated = [...materialsForm.data.materials];
                                                            updated[idx].estimated_duration_minutes = parseInt(e.target.value, 10);
                                                            materialsForm.setData('materials', updated);
                                                        }}
                                                        className="text-[11px]"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <Input
                                                        type="text"
                                                        value={item.instructor_notes || ''}
                                                        onChange={(e) => {
                                                            const updated = [...materialsForm.data.materials];
                                                            updated[idx].instructor_notes = e.target.value;
                                                            materialsForm.setData('materials', updated);
                                                        }}
                                                        placeholder="Catatan halaman/bab khusus..."
                                                        className="text-[11px]"
                                                    />
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMaterialFromModule(item.material_id)}
                                                        className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50"
                                                        title="Lepaskan dari modul"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </TableSurface>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DCE7F3]">
                            <Button type="button" variant="secondary" onClick={() => setIsManageMaterialsModalOpen(false)}>
                                Tutup
                            </Button>
                            <Button type="submit" disabled={materialsForm.processing} className="bg-[#0B63CE] text-white">
                                {materialsForm.processing ? 'Menyimpan...' : 'Simpan Perubahan Pengaturan'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Modal: Hubungkan Modul ke Event */}
            <Modal
                isOpen={isLinkEventModalOpen}
                onClose={() => setIsLinkEventModalOpen(false)}
                title={`Hubungkan ke Event: ${activeModule?.title}`}
            >
                <form onSubmit={handleSaveLinkEvent} className="space-y-4">
                    <p className="text-xs text-[#6B7C93]">
                        Pilih event yang akan menggunakan modul ini sebagai kurikulum resmi.
                    </p>

                    <Combobox
                        label="Pilih Event Penataran"
                        value={linkEventForm.data.event_id}
                        onChange={(value) => linkEventForm.setData('event_id', value)}
                        options={events.map((event) => ({ value: event.id, label: `${event.title} (${event.start_date ? event.start_date.substring(0, 10) : 'Tanggal belum ditetapkan'})` }))}
                        placeholder="Pilih event penataran"
                        searchPlaceholder="Cari nama event…"
                        error={linkEventForm.errors.event_id}
                        required
                    />

                    <FormField label="Jalur Peserta yang Berhak" error={linkEventForm.errors.participant_path_id}>
                        <Select
                            value={linkEventForm.data.participant_path_id}
                            onChange={(e) => linkEventForm.setData('participant_path_id', e.target.value)}
                            placeholder=""
                        >
                            <option value="">Semua Jalur di Event Ini</option>
                            {tracks.map((t) => (
                                <option key={t.code} value={t.code}>
                                    {t.code} — {t.name}
                                </option>
                            ))}
                        </Select>
                    </FormField>

                    <div className="rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] p-3">
                        <Checkbox
                            id="is_required_chk"
                            checked={linkEventForm.data.is_required}
                            onChange={(e) => linkEventForm.setData('is_required', e.target.checked)}
                            label="Modul Wajib"
                            helperText="Digunakan sebagai prasyarat kelulusan event."
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DCE7F3]">
                        <Button type="button" variant="secondary" onClick={() => setIsLinkEventModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={linkEventForm.processing} className="bg-[#20A47A] text-white">
                            {linkEventForm.processing ? 'Menyimpan...' : 'Hubungkan ke Event'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Detail Lengkap Modul */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title={`Detail Modul: ${activeModule?.title}`}
                size="xl"
            >
                {activeModule && (
                    <div className="space-y-4 text-xs">
                        <div className="flex items-center gap-2">
                            {activeModule.event ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                    🎯 Khusus Event: {activeModule.event.title}
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                                    🌐 Master Diktar PERKEMI (Lintas Semua Event)
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-[#F8FBFF] border border-[#DCE7F3]">
                            <div>
                                <span className="text-[10px] uppercase font-mono text-[#6B7C93] block">Kode Modul</span>
                                <span className="font-bold text-[#0B63CE]">{activeModule.code}</span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-mono text-[#6B7C93] block">Kategori</span>
                                <span className="font-semibold text-[#0E2747]">{activeModule.category}</span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-mono text-[#6B7C93] block">Total JP</span>
                                <span className="font-bold text-[#0E2747]">{activeModule.total_jp} JP</span>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-mono text-[#6B7C93] block">Tingkat Level</span>
                                <span className="font-semibold text-[#0E2747]">{activeModule.level}</span>
                            </div>
                        </div>

                        <div>
                            <span className="font-bold text-[#0E2747] block mb-1">Deskripsi:</span>
                            <p className="text-[#6B7C93] bg-slate-50 p-3 rounded-lg border border-[#DCE7F3]">
                                {activeModule.description || 'Tidak ada deskripsi yang disediakan.'}
                            </p>
                        </div>

                        <div>
                            <span className="font-bold text-[#0E2747] block mb-1">Materi Koleksi Digital Terhubung:</span>
                            {activeModule.materials && activeModule.materials.length > 0 ? (
                                <div className="space-y-2">
                                    {activeModule.materials.map((m, i) => (
                                        <div
                                            key={m.id}
                                            className="flex items-center justify-between p-2.5 rounded-lg border border-[#DCE7F3] bg-white"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="w-5 h-5 rounded-full bg-[#EAF5FF] text-[#0B63CE] text-[10px] font-bold flex items-center justify-center font-mono">
                                                    {i + 1}
                                                </span>
                                                <span className="font-semibold text-[#0E2747]">{m.title}</span>
                                                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                                                    {m.type}
                                                </span>
                                            </div>
                                            <Link
                                                href={`/koleksi/${m.slug}/baca`}
                                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0B63CE] hover:underline"
                                            >
                                                <span>Buka</span>
                                                <ExternalLink className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-400 italic">Belum ada materi koleksi digital yang dihubungkan.</p>
                            )}
                        </div>

                        <div className="flex justify-end pt-3 border-t border-[#DCE7F3]">
                            <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
                                Tutup
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}
