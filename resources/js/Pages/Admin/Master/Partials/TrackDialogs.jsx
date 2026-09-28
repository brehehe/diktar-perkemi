import React from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import Button from '../../../../Components/ui/Button';
import Modal from '../../../../Components/ui/Modal';
import FormField from '../../../../Components/ui/FormField';
import Input from '../../../../Components/ui/Input';
import Select from '../../../../Components/ui/Select';
import Textarea from '../../../../Components/ui/Textarea';
import AlertDialog from '../../../../Components/ui/AlertDialog';
import Checkbox from '../../../../Components/ui/Checkbox';
import FileInput from '../../../../Components/ui/FileInput';

export default function TrackDialogs({
    events,
    isTrackModalOpen,
    setIsTrackModalOpen,
    editingTrack,
    isTrackImportModalOpen,
    setIsTrackImportModalOpen,
    isLegendModalOpen,
    setIsLegendModalOpen,
    editingLegend,
    isLegendImportModalOpen,
    setIsLegendImportModalOpen,
    deletingTrack,
    setDeletingTrack,
    deletingLegend,
    setDeletingLegend,
    trackImportForm,
    legendImportForm,
    trackForm,
    legendForm,
    handleSaveTrack,
    handleSaveLegend,
    handleDeleteTrack,
    handleDeleteLegend,
}) {
    return (
        <>
            {/* Modal Jalur */}
            <Modal
                isOpen={isTrackModalOpen}
                onClose={() => setIsTrackModalOpen(false)}
                title={editingTrack ? `Edit Jalur: ${editingTrack.code}` : 'Tambah Jalur Kualifikasi'}
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsTrackModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" form="track-form" variant="primary" loading={trackForm.processing}>
                            Simpan Jalur
                        </Button>
                    </>
                }
            >
                <form id="track-form" onSubmit={handleSaveTrack} className="space-y-4">
                    <FormField label="Cakupan (Admin / Event)" error={trackForm.errors.event_id}>
                        <Select
                            value={trackForm.data.event_id || ''}
                            onChange={(e) => trackForm.setData('event_id', e.target.value)}
                            options={[
                                { value: '', label: '🌐 Master Nasional / Diktar (Lintas Event)' },
                                ...events.map((ev) => ({
                                    value: String(ev.id),
                                    label: `🎯 Khusus Event: ${ev.title}`,
                                })),
                            ]}
                        />
                    </FormField>

                    <FormField label="Kode Jalur" error={trackForm.errors.code} required>
                        <Input
                            value={trackForm.data.code}
                            onChange={(e) => trackForm.setData('code', e.target.value.toUpperCase())}
                            placeholder="Contoh: PD, WAN, PWAD"
                            required
                        />
                    </FormField>

                    <FormField label="Nama Lengkap Jalur" error={trackForm.errors.name} required>
                        <Input
                            value={trackForm.data.name}
                            onChange={(e) => trackForm.setData('name', e.target.value)}
                            placeholder="Contoh: Pelatih Daerah"
                            required
                        />
                    </FormField>

                    <FormField label="Deskripsi">
                        <Textarea
                            value={trackForm.data.description}
                            onChange={(e) => trackForm.setData('description', e.target.value)}
                            rows={3}
                        />
                    </FormField>

                    <FormField label="Kelas Warna Badge">
                        <Input
                            value={trackForm.data.badge_color}
                            onChange={(e) => trackForm.setData('badge_color', e.target.value)}
                            placeholder="bg-blue-100 text-blue-800"
                        />
                    </FormField>

                    <Checkbox
                        id="is_dual"
                        checked={trackForm.data.is_dual_track}
                        onChange={(event) => trackForm.setData('is_dual_track', event.target.checked)}
                        label="Kualifikasi Ganda"
                        helperText="Memerlukan rotasi paralel A1 dan A2."
                    />
                </form>
            </Modal>

            {/* Modal Legenda */}
            <Modal
                isOpen={isLegendModalOpen}
                onClose={() => setIsLegendModalOpen(false)}
                title={editingLegend ? `Edit Singkatan: ${editingLegend.code}` : 'Tambah Singkatan Resmi'}
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsLegendModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" form="legend-form" variant="primary" loading={legendForm.processing}>
                            Simpan Singkatan
                        </Button>
                    </>
                }
            >
                <form id="legend-form" onSubmit={handleSaveLegend} className="space-y-4">
                    <FormField label="Cakupan (Admin / Event)" error={legendForm.errors.event_id}>
                        <Select
                            value={legendForm.data.event_id || ''}
                            onChange={(e) => legendForm.setData('event_id', e.target.value)}
                            options={[
                                { value: '', label: '🌐 Master Nasional / Diktar (Lintas Event)' },
                                ...events.map((ev) => ({
                                    value: String(ev.id),
                                    label: `🎯 Khusus Event: ${ev.title}`,
                                })),
                            ]}
                        />
                    </FormField>

                    <FormField label="Singkatan (Kode)" error={legendForm.errors.code} required>
                        <Input
                            value={legendForm.data.code}
                            onChange={(e) => legendForm.setData('code', e.target.value.toUpperCase())}
                            placeholder="Contoh: K3, WSKO"
                            required
                        />
                    </FormField>

                    <FormField label="Kepanjangan / Istilah Lengkap" error={legendForm.errors.term} required>
                        <Input
                            value={legendForm.data.term}
                            onChange={(e) => legendForm.setData('term', e.target.value)}
                            placeholder="Contoh: Kesehatan, Keselamatan, dan Keamanan"
                            required
                        />
                    </FormField>

                    <FormField label="Kategori">
                        <Select
                            value={legendForm.data.category}
                            onChange={(e) => legendForm.setData('category', e.target.value)}
                        >
                            <option value="general">Umum</option>
                            <option value="track">Jalur Peserta</option>
                            <option value="session_type">Jenis Sesi Rundown</option>
                        </Select>
                    </FormField>

                    <FormField label="Keterangan / Definisi">
                        <Textarea
                            value={legendForm.data.description}
                            onChange={(e) => legendForm.setData('description', e.target.value)}
                            rows={3}
                        />
                    </FormField>
                </form>
            </Modal>

            {/* Alert Dialog Hapus Legenda */}
            <AlertDialog
                isOpen={Boolean(deletingLegend)}
                onClose={() => setDeletingLegend(null)}
                title="Hapus Singkatan?"
                description={`Apakah Anda yakin ingin menghapus singkatan "${deletingLegend?.code}"?`}
                confirmText="Hapus"
                cancelText="Batal"
                variant="danger"
                onConfirm={handleDeleteLegend}
            />

            {/* Alert Dialog Hapus Track */}
            <AlertDialog
                isOpen={Boolean(deletingTrack)}
                onClose={() => setDeletingTrack(null)}
                title="Hapus Jalur Peserta?"
                description={`Apakah Anda yakin ingin menghapus jalur "${deletingTrack?.name}" (${deletingTrack?.code})?`}
                confirmText="Hapus"
                cancelText="Batal"
                variant="danger"
                onConfirm={handleDeleteTrack}
            />

            {/* Modal: Impor Jalur */}
            <Modal
                isOpen={isTrackImportModalOpen}
                onClose={() => setIsTrackImportModalOpen(false)}
                title="Impor Jalur Peserta (.csv)"
                description="Unggah berkas CSV untuk menambahkan jalur kualifikasi peserta secara massal."
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsTrackImportModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            form="track-import-form"
                            disabled={!trackImportForm.data.file || trackImportForm.processing}
                            loading={trackImportForm.processing}
                            className="bg-[#0B63CE] text-white"
                        >
                            {trackImportForm.processing ? 'Mengimpor...' : 'Mulai Impor'}
                        </Button>
                    </>
                }
            >
                <form
                    id="track-import-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        trackImportForm.post('/admin/master/jalur/impor', {
                            forceFormData: true,
                            onSuccess: () => {
                                trackImportForm.reset();
                                setIsTrackImportModalOpen(false);
                            },
                        });
                    }}
                    className="space-y-4"
                >
                    <div className="rounded-xl border border-[#DCE7F3] bg-[#F8FBFF] p-4 text-xs text-[#112743] space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-[#0E2747] flex items-center gap-1.5">
                                <FileSpreadsheet className="w-4 h-4 text-[#0B63CE]" />
                                Format Jalur CSV
                            </span>
                            <a
                                href="/admin/master/jalur/template"
                                className="font-semibold text-[#0B63CE] hover:underline flex items-center gap-1"
                                download="template-jalur.csv"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Unduh template (.csv)
                            </a>
                        </div>
                        <p className="text-[#6B7C93] leading-relaxed">
                            Format CSV mendukung kolom: <code>code, name, description, badge_color, is_dual_track</code>.
                        </p>
                    </div>

                    <FormField label="Target Cakupan Impor" error={trackImportForm.errors.event_id}>
                        <Select
                            value={trackImportForm.data.event_id || ''}
                            onChange={(e) => trackImportForm.setData('event_id', e.target.value)}
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
                        id="track-import-file"
                        name="file"
                        label="Pilih Berkas CSV (.csv)"
                        accept=".csv,text/csv"
                        required
                        onChange={(e) => trackImportForm.setData('file', e.target.files?.[0] || null)}
                        error={trackImportForm.errors.file}
                        helperText="Format berkas harus .csv dengan pemisah koma."
                    />
                </form>
            </Modal>

            {/* Modal: Impor Legenda */}
            <Modal
                isOpen={isLegendImportModalOpen}
                onClose={() => setIsLegendImportModalOpen(false)}
                title="Impor Legenda & Singkatan (.csv)"
                description="Unggah berkas CSV untuk menambahkan istilah atau singkatan resmi secara massal."
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsLegendImportModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            form="legend-import-form"
                            disabled={!legendImportForm.data.file || legendImportForm.processing}
                            loading={legendImportForm.processing}
                            className="bg-[#0B63CE] text-white"
                        >
                            {legendImportForm.processing ? 'Mengimpor...' : 'Mulai Impor'}
                        </Button>
                    </>
                }
            >
                <form
                    id="legend-import-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        legendImportForm.post('/admin/master/legenda/impor', {
                            forceFormData: true,
                            onSuccess: () => {
                                legendImportForm.reset();
                                setIsLegendImportModalOpen(false);
                            },
                        });
                    }}
                    className="space-y-4"
                >
                    <div className="rounded-xl border border-[#DCE7F3] bg-[#F8FBFF] p-4 text-xs text-[#112743] space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-[#0E2747] flex items-center gap-1.5">
                                <FileSpreadsheet className="w-4 h-4 text-[#0B63CE]" />
                                Format Singkatan CSV
                            </span>
                            <a
                                href="/admin/master/legenda/template"
                                className="font-semibold text-[#0B63CE] hover:underline flex items-center gap-1"
                                download="template-legenda.csv"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Unduh template (.csv)
                            </a>
                        </div>
                        <p className="text-[#6B7C93] leading-relaxed">
                            Format CSV mendukung kolom: <code>code, term, category, description, badge_color</code>.
                        </p>
                    </div>

                    <FormField label="Target Cakupan Impor" error={legendImportForm.errors.event_id}>
                        <Select
                            value={legendImportForm.data.event_id || ''}
                            onChange={(e) => legendImportForm.setData('event_id', e.target.value)}
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
                        id="legend-import-file"
                        name="file"
                        label="Pilih Berkas CSV (.csv)"
                        accept=".csv,text/csv"
                        required
                        onChange={(e) => legendImportForm.setData('file', e.target.files?.[0] || null)}
                        error={legendImportForm.errors.file}
                        helperText="Format berkas harus .csv dengan pemisah koma."
                    />
                </form>
            </Modal>
        </>
    );
}
