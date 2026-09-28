import React from 'react';
import Input from '../../../../Components/ui/Input';
import Textarea from '../../../../Components/ui/Textarea';
import Select from '../../../../Components/ui/Select';
import Combobox from '../../../../Components/ui/Combobox';
import Button from '../../../../Components/ui/Button';
import FileInfo from '../../../../Components/admin/FileInfo';
import Badge from '../../../../Components/ui/Badge';
import MaterialSourceSelector from '../../../../Components/admin/MaterialSourceSelector';
import ExternalUrlField from '../../../../Components/admin/ExternalUrlField';
import VideoUrlField from '../../../../Components/admin/VideoUrlField';
import VideoPreview from '../../../../Components/admin/VideoPreview';
import TableSurface from '../../../../Components/admin/TableSurface';
import FileInput from '../../../../Components/ui/FileInput';
import {
    AlertCircle, BookOpenCheck, CheckCircle2, FileText, History,
    ListOrdered, Plus, RefreshCw, Target, Trash2,
} from 'lucide-react';

export default function CollectionEditMainSections({
    data,
    setData,
    errors,
    material,
    active_file,
    file_history,
    categoryOptions,
    material_types,
    selectedNewFile,
    setSelectedNewFile,
    replaceError,
    replaceFileInputRef,
    handleNewFileSelected,
    confirmReplaceFile,
    isReplacingFile,
    formatBytes,
    addKeyPoint,
    removeKeyPoint,
    updateKeyPoint,
    addObjective,
    removeObjective,
    updateObjective,
    addTocItem,
    removeTocItem,
    updateTocItem,
}) {
    return (
        <>
                {/* Left & Middle Column (2 cols): Main Sections */}
                <div className="lg:col-span-2 space-y-6">
                    {/* SECTION A: Informasi Materi */}
                    <section className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs p-6 space-y-5">
                        <div className="border-b border-[#DCE7F3] pb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[#EAF5FF] text-[#0B63CE] text-xs font-bold flex items-center justify-center">
                                    A
                                </span>
                                <h2 className="text-sm font-bold text-[#0E2747]">
                                    Informasi Materi & Bibliografi
                                </h2>
                            </div>
                            <span className="text-[11px] text-[#6B7C93]">* Wajib diisi</span>
                        </div>

                        <Input
                            label="Judul Materi"
                            name="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            required
                            error={errors.title}
                        />

                        <Textarea
                            label="Ringkasan Singkat (Abstrak)"
                            name="summary"
                            value={data.summary}
                            onChange={(e) => setData('summary', e.target.value)}
                            rows={3}
                            error={errors.summary}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Combobox
                                label="Kategori Materi"
                                value={data.category_id}
                                onChange={(val) => setData('category_id', val)}
                                options={categoryOptions}
                                required
                                error={errors.category_id}
                            />

                            <Select
                                label="Jenis Format Materi"
                                name="type"
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                options={material_types}
                                required
                                error={errors.type}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Input
                                label="Penulis / Pemateri"
                                name="author"
                                value={data.author}
                                onChange={(e) => setData('author', e.target.value)}
                                error={errors.author}
                            />

                            <Input
                                label="Tahun Publikasi"
                                name="publication_year"
                                type="number"
                                min="1970"
                                max="2099"
                                value={data.publication_year}
                                onChange={(e) => setData('publication_year', e.target.value)}
                                error={errors.publication_year}
                            />

                            <Input
                                label="Kode Registrasi / Modul"
                                name="code"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                error={errors.code}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Kata Kunci (Tag Pencarian)"
                                name="keywords"
                                value={data.keywords}
                                onChange={(e) => setData('keywords', e.target.value)}
                                helperText="Pisahkan kata kunci dengan tanda koma"
                                error={errors.keywords}
                            />

                            <Input
                                label="Jumlah Halaman (Opsional)"
                                name="page_count"
                                type="number"
                                min="1"
                                value={data.page_count}
                                onChange={(e) => setData('page_count', e.target.value)}
                                error={errors.page_count}
                            />
                        </div>

                        {/* Poin Penting Materi */}
                        <div className="pt-2 border-t border-[#DCE7F3] space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-[#0E2747] flex items-center gap-1.5">
                                    <BookOpenCheck className="w-4 h-4 text-[#20A47A]" />
                                    Poin Penting Materi
                                </label>
                                <button
                                    type="button"
                                    onClick={addKeyPoint}
                                    className="text-xs font-semibold text-[#0B63CE] hover:text-[#0A3F82] flex items-center gap-1"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Tambah Poin</span>
                                </button>
                            </div>

                            <div className="space-y-2">
                                {data.key_points.map((point, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <Input
                                            value={point}
                                            onChange={(e) => updateKeyPoint(idx, e.target.value)}
                                            placeholder={`Poin penting #${idx + 1}`}
                                            className="flex-1"
                                        />
                                        {data.key_points.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeKeyPoint(idx)}
                                                className="p-2 text-[#6B7C93] hover:text-[#FA5252] rounded-lg hover:bg-[#FDE8EF]/40 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tujuan Pembelajaran */}
                        <div className="pt-2 border-t border-[#DCE7F3] space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-[#0E2747] flex items-center gap-1.5">
                                    <Target className="w-4 h-4 text-[#0B63CE]" />
                                    Tujuan Pembelajaran
                                </label>
                                <button
                                    type="button"
                                    onClick={addObjective}
                                    className="text-xs font-semibold text-[#0B63CE] hover:text-[#0A3F82] flex items-center gap-1"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Tambah Tujuan</span>
                                </button>
                            </div>

                            <div className="space-y-2">
                                {data.learning_objectives.map((obj, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <Input
                                            value={obj}
                                            onChange={(e) => updateObjective(idx, e.target.value)}
                                            placeholder={`Target capaian #${idx + 1}`}
                                            className="flex-1"
                                        />
                                        {data.learning_objectives.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeObjective(idx)}
                                                className="p-2 text-[#6B7C93] hover:text-[#FA5252] rounded-lg hover:bg-[#FDE8EF]/40 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Daftar Isi Bab */}
                        <div className="pt-2 border-t border-[#DCE7F3] space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-[#0E2747] flex items-center gap-1.5">
                                    <ListOrdered className="w-4 h-4 text-[#7957D5]" />
                                    Daftar Isi & Struktur Bab
                                </label>
                                <button
                                    type="button"
                                    onClick={addTocItem}
                                    className="text-xs font-semibold text-[#0B63CE] hover:text-[#0A3F82] flex items-center gap-1"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Tambah Bab</span>
                                </button>
                            </div>

                            <div className="space-y-2">
                                {data.table_of_contents.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <Input
                                            value={item.title}
                                            onChange={(e) => updateTocItem(idx, 'title', e.target.value)}
                                            placeholder={`Judul Bab #${idx + 1}`}
                                            wrapperClassName="flex-1"
                                            className="min-h-9 py-2 text-xs"
                                            aria-label={`Judul bab ${idx + 1}`}
                                        />
                                        <div className="flex items-center gap-1 shrink-0">
                                            <span className="text-xs text-[#6B7C93]">Hal.</span>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.page}
                                                onChange={(e) => updateTocItem(idx, 'page', Number(e.target.value))}
                                                wrapperClassName="w-16"
                                                className="min-h-9 px-2 py-2 text-center text-xs"
                                                aria-label={`Halaman bab ${idx + 1}`}
                                            />
                                        </div>
                                        {data.table_of_contents.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeTocItem(idx)}
                                                className="p-2 text-[#6B7C93] hover:text-[#FA5252] rounded-lg hover:bg-[#FDE8EF]/40 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Textarea
                            label="Deskripsi Lengkap & Silabus"
                            name="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={4}
                            error={errors.description}
                        />
                    </section>

                    {/* SECTION B: Sumber Materi */}
                    <section className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs p-6 space-y-5">
                        <div className="border-b border-[#DCE7F3] pb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[#EAF5FF] text-[#0B63CE] text-xs font-bold flex items-center justify-center">
                                    B
                                </span>
                                <h2 className="text-sm font-bold text-[#0E2747]">
                                    Sumber Materi Pembelajaran
                                </h2>
                            </div>
                            <span className="text-[11px] text-[#FA5252] font-semibold">* Wajib Dipilih</span>
                        </div>

                        {/* Source Selector */}
                        <MaterialSourceSelector
                            value={data.source_type}
                            onChange={(source) => setData('source_type', source)}
                            error={errors.source_type}
                        />

                        {/* Source Content Panel */}
                        <div className="pt-2">
                            {data.source_type === 'uploaded_pdf' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between pb-2 border-b border-[#DCE7F3]">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-[#0B63CE]" />
                                            <h3 className="text-xs font-bold text-[#0E2747] uppercase tracking-wider">
                                                Berkas PDF Aktif & Versi
                                            </h3>
                                        </div>
                                        <FileInput
                                            ref={replaceFileInputRef}
                                            accept="application/pdf"
                                            visuallyHidden
                                            onClick={(e) => {
                                                e.target.value = '';
                                            }}
                                            onChange={handleNewFileSelected}
                                        />
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            icon={RefreshCw}
                                            onClick={() => replaceFileInputRef.current?.click()}
                                        >
                                            Ganti File (Versi Baru)
                                        </Button>
                                    </div>

                                    {replaceError && (
                                        <div className="p-3 bg-[#FDE8EF] border border-[#F8B4C4] rounded-lg text-xs text-[#FA5252] flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            <span>{replaceError}</span>
                                        </div>
                                    )}

                                    {selectedNewFile && (
                                        <div className="p-4 bg-[#EAF5FF] border-2 border-[#0B63CE]/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
                                            <div className="flex items-start sm:items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-lg bg-[#0B63CE] text-white flex items-center justify-center shrink-0 shadow-xs">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="text-xs sm:text-sm font-bold text-[#0E2747] truncate" title={selectedNewFile.name}>
                                                            {selectedNewFile.name}
                                                        </p>
                                                        <Badge variant="primary" size="sm">
                                                            Siap Versi v{((active_file?.version || 0) + 1)}.0
                                                        </Badge>
                                                    </div>
                                                    <p className="text-[11px] text-[#6B7C93] mt-0.5">
                                                        {formatBytes(selectedNewFile.size)} • Klik "Perbarui Versi Sekarang" untuk langsung menerapkan versi baru, atau simpan bersama formulir.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                                <Button
                                                    type="button"
                                                    variant="primary"
                                                    size="sm"
                                                    loading={isReplacingFile}
                                                    icon={RefreshCw}
                                                    onClick={confirmReplaceFile}
                                                >
                                                    Perbarui Versi Sekarang
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    disabled={isReplacingFile}
                                                    onClick={() => {
                                                        setSelectedNewFile(null);
                                                        setData('book_file', null);
                                                        if (replaceFileInputRef.current) {
                                                            replaceFileInputRef.current.value = '';
                                                        }
                                                    }}
                                                >
                                                    Batal
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {active_file ? (
                                        <FileInfo
                                            fileName={active_file.original_name}
                                            fileSize={active_file.formatted_size}
                                            fileFormat="PDF"
                                            version={active_file.version}
                                            uploadedAt={active_file.uploaded_at}
                                            uploaderName={active_file.uploader_name}
                                            status="ready"
                                            onChangeFile={() => replaceFileInputRef.current?.click()}
                                            onViewFile={() => window.open(`/koleksi/${material.slug}/baca`, '_blank')}
                                        />
                                    ) : (
                                        <div className="p-4 bg-[#FFF3E6] border border-[#FFE8CC] rounded-xl text-xs text-[#E8590C] flex items-center justify-between">
                                            <span>Belum ada berkas PDF yang diunggah.</span>
                                            <Button
                                                type="button"
                                                variant="primary"
                                                size="xs"
                                                onClick={() => replaceFileInputRef.current?.click()}
                                            >
                                                Unggah Sekarang
                                            </Button>
                                        </div>
                                    )}

                                    {/* Version History Table */}
                                    {file_history.length > 0 && (
                                        <div className="pt-3 border-t border-[#DCE7F3] space-y-2.5">
                                            <div className="flex items-center gap-2">
                                                <History className="w-3.5 h-3.5 text-[#6B7C93]" />
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-[#112743]">
                                                    Riwayat Versi Berkas ({file_history.length})
                                                </h4>
                                            </div>

                                            <TableSurface className="rounded-lg shadow-none" ariaLabel="Riwayat versi berkas">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="bg-[#F8FBFF] border-b border-[#DCE7F3] text-[11px] font-semibold text-[#6B7C93] uppercase">
                                                            <th className="py-2.5 px-3">Versi</th>
                                                            <th className="py-2.5 px-3">Nama Berkas</th>
                                                            <th className="py-2.5 px-3">Ukuran</th>
                                                            <th className="py-2.5 px-3">Waktu Unggah</th>
                                                            <th className="py-2.5 px-3 text-right">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-[#DCE7F3]">
                                                        {file_history.map((hist) => (
                                                            <tr
                                                                key={hist.id}
                                                                className={hist.is_active ? 'bg-[#EAF5FF]/40 font-medium' : 'hover:bg-[#F8FBFF]'}
                                                            >
                                                                <td className="py-2.5 px-3 font-mono text-[#0B63CE] font-bold">
                                                                    v{hist.version}.0
                                                                </td>
                                                                <td className="py-2.5 px-3 text-[#112743] max-w-xs truncate" title={hist.original_name}>
                                                                    {hist.original_name}
                                                                </td>
                                                                <td className="py-2.5 px-3 text-[#6B7C93]">
                                                                    {hist.formatted_size}
                                                                </td>
                                                                <td className="py-2.5 px-3 text-[#6B7C93]">
                                                                    {hist.uploaded_at}
                                                                </td>
                                                                <td className="py-2.5 px-3 text-right">
                                                                    {hist.is_active ? (
                                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2B8A3E] bg-[#EBFBEE] border border-[#D3F9D8] px-2 py-0.5 rounded-full">
                                                                            <CheckCircle2 className="w-3 h-3" />
                                                                            Aktif
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-[10px] font-medium text-[#868E96] bg-[#F1F3F5] px-2 py-0.5 rounded-full">
                                                                            Arsip
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </TableSurface>
                                        </div>
                                    )}
                                </div>
                            )}

                            {data.source_type === 'external_link' && (
                                <ExternalUrlField
                                    url={data.external_url}
                                    onUrlChange={(val) => setData('external_url', val)}
                                    sourceName={data.external_source_name}
                                    onSourceNameChange={(val) => setData('external_source_name', val)}
                                    openMode={data.external_open_mode}
                                    onOpenModeChange={(val) => setData('external_open_mode', val)}
                                    error={errors.external_url}
                                />
                            )}

                            {data.source_type === 'video' && (
                                <div className="space-y-5">
                                    <VideoUrlField
                                        url={data.video_url}
                                        onUrlChange={(val) => setData('video_url', val)}
                                        allowPortal={data.video_allow_portal}
                                        onAllowPortalChange={(val) => setData('video_allow_portal', val)}
                                        error={errors.video_url}
                                    />

                                    <VideoPreview
                                        url={data.video_url}
                                        title={data.title || 'Pratinjau Video'}
                                    />
                                </div>
                            )}
                        </div>
                    </section>
                </div>

        </>
    );
}
