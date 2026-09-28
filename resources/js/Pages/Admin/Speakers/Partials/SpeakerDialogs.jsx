import React from 'react';
import { Shield, Sparkles, Download, FileSpreadsheet } from 'lucide-react';
import Button from '../../../../Components/ui/Button';
import Modal from '../../../../Components/ui/Modal';
import FormField from '../../../../Components/ui/FormField';
import Input from '../../../../Components/ui/Input';
import Select from '../../../../Components/ui/Select';
import Textarea from '../../../../Components/ui/Textarea';
import AlertDialog from '../../../../Components/ui/AlertDialog';
import FileInput from '../../../../Components/ui/FileInput';

export default function SpeakerDialogs({
    availableEvents,
    isModalOpen,
    setIsModalOpen,
    isImportModalOpen,
    setIsImportModalOpen,
    editingSpeaker,
    deletingSpeaker,
    setDeletingSpeaker,
    isDeleting,
    importForm,
    form,
    handleSave,
    handleDelete,
}) {
    return (
        <>
            {/* Modal Tambah / Edit Pemateri */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingSpeaker ? `Edit Pemateri: ${editingSpeaker.name}` : 'Tambah Pemateri Baru'}
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" form="speaker-form" variant="primary" loading={form.processing}>
                            {editingSpeaker ? 'Simpan Perubahan' : 'Daftarkan Pemateri'}
                        </Button>
                    </>
                }
            >
                <form id="speaker-form" onSubmit={handleSave} className="space-y-4">
                    <FormField label="Cakupan (Admin / Event)" error={form.errors.event_id}>
                        <Select
                            value={form.data.event_id || ''}
                            onChange={(e) => form.setData('event_id', e.target.value)}
                            options={[
                                { value: '', label: '🌐 Master Nasional / Diktar (Lintas Event)' },
                                ...availableEvents.map((ev) => ({
                                    value: String(ev.id),
                                    label: `🎯 Khusus Event: ${ev.name}`,
                                })),
                            ]}
                        />
                    </FormField>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                            <FormField label="Nama Lengkap" error={form.errors.name} required>
                                <Input
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="Contoh: Hansens"
                                    required
                                />
                            </FormField>
                        </div>

                        <FormField label="Gelar / Suffix" error={form.errors.title_suffix}>
                            <Input
                                value={form.data.title_suffix}
                                onChange={(e) => form.setData('title_suffix', e.target.value)}
                                placeholder="Sp.KO / M.Pd"
                            />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Tipe Pemateri" required>
                            <Select
                                value={form.data.type}
                                onChange={(e) => form.setData('type', e.target.value)}
                            >
                                <option value="internal">Pemateri Internal PERKEMI</option>
                                <option value="external">Pemateri Eksternal (Pakar/Institusi Luar)</option>
                            </Select>
                        </FormField>

                        {form.data.type === 'internal' ? (
                            <FormField label="Tingkat DAN Shorinji Kempo">
                                <Select
                                    value={form.data.dan_level}
                                    onChange={(e) => form.setData('dan_level', parseInt(e.target.value) || '')}
                                >
                                    <option value="">-- Tanpa DAN --</option>
                                    <option value="1">I-DAN</option>
                                    <option value="2">II-DAN</option>
                                    <option value="3">III-DAN</option>
                                    <option value="4">IV-DAN</option>
                                    <option value="5">V-DAN</option>
                                    <option value="6">VI-DAN</option>
                                    <option value="7">VII-DAN</option>
                                    <option value="8">VIII-DAN</option>
                                </Select>
                            </FormField>
                        ) : (
                            <FormField label="Instansi / Organisasi Asal">
                                <Input
                                    value={form.data.institution}
                                    onChange={(e) => form.setData('institution', e.target.value)}
                                    placeholder="Fakultas Ilmu Keolahragaan / RS Orthopedi"
                                />
                            </FormField>
                        )}
                    </div>

                    {form.data.type === 'internal' && (
                        <FormField label="Jabatan di PERKEMI">
                            <Input
                                value={form.data.perkemi_position}
                                onChange={(e) => form.setData('perkemi_position', e.target.value)}
                                placeholder="Dewan Guru PB PERKEMI / Komisi Perwasitan"
                            />
                        </FormField>
                    )}

                    <FormField label="Keahlian Utama" required>
                        <Input
                            value={form.data.primary_expertise}
                            onChange={(e) => form.setData('primary_expertise', e.target.value)}
                            placeholder="Contoh: Sport Injury & Pencegahan Cedera, Perwasitan Shiai, Fisiologi"
                            required
                        />
                    </FormField>

                    <FormField label="Ringkasan Profil & Pengalaman">
                        <Textarea
                            value={form.data.bio}
                            onChange={(e) => form.setData('bio', e.target.value)}
                            rows={3}
                            placeholder="Tuliskan latar belakang singkat pemateri..."
                        />
                    </FormField>

                    {/* Protected internal contact & supervisor privilege */}
                    <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
                        <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-[#EE9B25]" />
                            Kontak & Hak Akses Pengawas (Admin Only)
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <FormField label="Nomor Telepon / WhatsApp Internal">
                                <Input
                                    value={form.data.internal_contact}
                                    onChange={(e) => form.setData('internal_contact', e.target.value)}
                                    placeholder="0812-XXXX-XXXX"
                                />
                            </FormField>
                            <FormField label="Email Kontak / Akun Login" error={form.errors.contact_email}>
                                <Input
                                    type="email"
                                    value={form.data.contact_email}
                                    onChange={(e) => form.setData('contact_email', e.target.value)}
                                    placeholder="pemateri@perkemi.id"
                                />
                            </FormField>
                        </div>
                        <div className="flex items-center gap-2 pt-1 border-t border-amber-200/60">
                            <input
                                type="checkbox"
                                id="master-speaker-is-supervisor"
                                checked={form.data.is_supervisor}
                                onChange={(e) => form.setData('is_supervisor', e.target.checked)}
                                className="rounded border-amber-300 text-[#0B63CE] focus:ring-[#0B63CE]"
                            />
                            <label htmlFor="master-speaker-is-supervisor" className="text-xs font-semibold text-amber-950 flex items-center gap-1.5 cursor-pointer">
                                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                                Tetapkan sebagai Pemateri Supervisor (Dapat memantau & mengakses seluruh jadwal pemateri)
                            </label>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Alert Dialog Hapus */}
            <AlertDialog
                isOpen={Boolean(deletingSpeaker)}
                onClose={() => setDeletingSpeaker(null)}
                title="Hapus Pemateri?"
                description={`Apakah Anda yakin ingin menghapus pemateri "${deletingSpeaker?.name}"?`}
                confirmText={isDeleting ? 'Menghapus...' : 'Hapus Pemateri'}
                cancelText="Batal"
                variant="danger"
                onConfirm={handleDelete}
            />

            {/* Modal: Impor Pemateri */}
            <Modal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                title="Impor Data Pemateri (.csv)"
                description="Unggah berkas CSV untuk menambahkan profil instruktur / pemateri secara massal."
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsImportModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            form="speaker-import-form"
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
                    id="speaker-import-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        importForm.post('/admin/master/pemateri/impor', {
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
                                Format Pemateri CSV
                            </span>
                            <a
                                href="/admin/master/pemateri/template"
                                className="font-semibold text-[#0B63CE] hover:underline flex items-center gap-1"
                                download="template-pemateri.csv"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Unduh template (.csv)
                            </a>
                        </div>
                        <p className="text-[#6B7C93] leading-relaxed">
                            Format CSV mendukung kolom: <code>name, title_suffix, type, dan_level, perkemi_position, institution, primary_expertise, bio, internal_contact</code>.
                        </p>
                    </div>

                    <FormField label="Target Cakupan Impor" error={importForm.errors.event_id}>
                        <Select
                            value={importForm.data.event_id || ''}
                            onChange={(e) => importForm.setData('event_id', e.target.value)}
                            options={[
                                { value: '', label: '🌐 Master Nasional / Diktar (Lintas Event)' },
                                ...availableEvents.map((ev) => ({
                                    value: String(ev.id),
                                    label: `🎯 Khusus Event: ${ev.name}`,
                                })),
                            ]}
                        />
                    </FormField>

                    <FileInput
                        id="speaker-import-file"
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
