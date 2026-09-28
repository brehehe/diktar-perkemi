import React from 'react';
import { Trash2, Upload, Download, FileSpreadsheet, Camera } from 'lucide-react';
import Button from '../../../../Components/ui/Button';
import Modal from '../../../../Components/ui/Modal';
import FormField from '../../../../Components/ui/FormField';
import Input from '../../../../Components/ui/Input';
import Select from '../../../../Components/ui/Select';
import Textarea from '../../../../Components/ui/Textarea';
import AlertDialog from '../../../../Components/ui/AlertDialog';
import FileInput from '../../../../Components/ui/FileInput';

export default function ParticipantDialogs({
    availableTracks,
    events,
    isModalOpen,
    setIsModalOpen,
    isImportModalOpen,
    setIsImportModalOpen,
    editingParticipant,
    deletingParticipant,
    setDeletingParticipant,
    isDeleting,
    importForm,
    photoPreview,
    form,
    handlePhotoChange,
    handleRemovePhoto,
    handleSave,
    handleDelete,
}) {
    return (
        <>
            {/* Modal Tambah / Edit Peserta */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingParticipant ? `Edit Kenshi: ${editingParticipant.name}` : 'Daftarkan Kenshi Baru'}
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" form="participant-modal-form" variant="primary" loading={form.processing}>
                            {editingParticipant ? 'Simpan Perubahan' : 'Daftarkan Peserta'}
                        </Button>
                    </>
                }
            >
                <form id="participant-modal-form" onSubmit={handleSave} className="space-y-4">
                    {/* Foto Kenshi Upload */}
                    <div className="p-3.5 rounded-xl border border-[#DCE7F3] bg-[#F8FBFF] flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-full border-2 border-[#0B63CE]/30 bg-white overflow-hidden shadow-xs shrink-0 flex items-center justify-center">
                            {photoPreview ? (
                                <img src={photoPreview} alt="Preview Foto" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-[#6B7C93]">
                                    <Camera className="w-6 h-6 text-[#0B63CE]" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 space-y-1.5">
                            <label className="block text-xs font-bold text-[#0E2747]">
                                Pasfoto Resmi Kenshi
                            </label>
                            <p className="text-[11px] text-[#6B7C93] leading-tight">
                                JPG, PNG, atau WEBP maks. 5MB. Otomatis terhubung ke akun user, ID card & formulir pendaftaran.
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#DCE7F3] text-xs font-semibold text-[#0E2747] hover:bg-slate-50 hover:border-[#0B63CE] cursor-pointer shadow-xs transition-colors">
                                    <Camera className="w-3.5 h-3.5 text-[#0B63CE]" />
                                    <span>{photoPreview ? 'Ganti Foto' : 'Unggah Foto'}</span>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handlePhotoChange}
                                        className="sr-only"
                                    />
                                </label>
                                {photoPreview && (
                                    <button
                                        type="button"
                                        onClick={handleRemovePhoto}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Hapus</span>
                                    </button>
                                )}
                            </div>
                            {form.errors.photo && (
                                <p className="text-xs text-rose-600 font-medium">{form.errors.photo}</p>
                            )}
                        </div>
                    </div>

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

                    <FormField label="Nama Lengkap Kenshi" error={form.errors.name} required>
                        <Input
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            placeholder="Contoh: Budi Santoso"
                            required
                        />
                    </FormField>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Email" error={form.errors.email} required>
                            <Input
                                type="email"
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                                placeholder="budi@perkemi.org"
                                required
                            />
                        </FormField>

                        <FormField label="Nomor Induk Kenshi (NIK)" error={form.errors.kenshi_id}>
                            <Input
                                value={form.data.kenshi_id}
                                onChange={(e) => form.setData('kenshi_id', e.target.value)}
                                placeholder="3501-1994-0012"
                                helperText="NIK bersifat unik dan dapat digunakan untuk login setelah akun portal terhubung."
                            />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Asal Pengprov / Kota" error={form.errors.origin} required>
                            <Input
                                value={form.data.origin}
                                onChange={(e) => form.setData('origin', e.target.value)}
                                placeholder="Jawa Timur / Surabaya"
                                required
                            />
                        </FormField>

                        <FormField label="Nama Dojo Asal" error={form.errors.dojo}>
                            <Input
                                value={form.data.dojo}
                                onChange={(e) => form.setData('dojo', e.target.value)}
                                placeholder="Dojo KONI Jatim"
                            />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Tingkat DAN Saat Ini">
                            <Select
                                value={form.data.dan_level}
                                onChange={(e) => form.setData('dan_level', parseInt(e.target.value) || 1)}
                            >
                                <option value="1">I-DAN</option>
                                <option value="2">II-DAN</option>
                                <option value="3">III-DAN</option>
                                <option value="4">IV-DAN</option>
                                <option value="5">V-DAN</option>
                                <option value="6">VI-DAN</option>
                            </Select>
                        </FormField>

                        <FormField label="Nomor Telepon (Sensitif)" error={form.errors.phone}>
                            <Input
                                value={form.data.phone}
                                onChange={(e) => form.setData('phone', e.target.value)}
                                placeholder="0812-3456-7890"
                            />
                        </FormField>
                    </div>

                    <FormField label="Catatan Tambahan Admin">
                        <Textarea
                            value={form.data.admin_notes}
                            onChange={(e) => form.setData('admin_notes', e.target.value)}
                            rows={2}
                            placeholder="Catatan verifikasi atau riwayat kualifikasi..."
                        />
                    </FormField>
                </form>
            </Modal>

            {/* Alert Dialog Hapus */}
            <AlertDialog
                isOpen={Boolean(deletingParticipant)}
                onClose={() => setDeletingParticipant(null)}
                title="Hapus Kenshi Peserta?"
                description={`Apakah Anda yakin ingin menghapus data kenshi "${deletingParticipant?.name}"?`}
                confirmText={isDeleting ? 'Menghapus...' : 'Hapus Kenshi'}
                cancelText="Batal"
                variant="danger"
                onConfirm={handleDelete}
            />

            {/* Modal: Impor Peserta */}
            <Modal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                title="Impor Data Kenshi Peserta (.csv)"
                description="Unggah berkas CSV untuk mendaftarkan kenshi secara massal."
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsImportModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            form="participant-import-form"
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
                    id="participant-import-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        importForm.post('/admin/master/peserta/impor', {
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
                                Format Peserta CSV
                            </span>
                            <a
                                href="/admin/master/peserta/template"
                                className="font-semibold text-[#0B63CE] hover:underline flex items-center gap-1"
                                download="template-peserta.csv"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Unduh template (.csv)
                            </a>
                        </div>
                        <p className="text-[#6B7C93] leading-relaxed">
                            Format CSV mendukung kolom: <code>name, email, kenshi_id, phone, dan_level, origin, dojo, track_code</code>.
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

                    <FormField label="Pilih Jalur Default (Opsional)" error={importForm.errors.track_code}>
                        <Select
                            value={importForm.data.track_code || ''}
                            onChange={(e) => importForm.setData('track_code', e.target.value)}
                            options={[
                                { value: '', label: 'Gunakan Jalur dari CSV / Default' },
                                ...availableTracks.map((t) => ({
                                    value: t.code,
                                    label: `${t.code} — ${t.name}`,
                                })),
                            ]}
                        />
                    </FormField>

                    <FileInput
                        id="participant-import-file"
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
        </>
    );
}
