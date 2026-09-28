import React, { useState, useRef } from 'react';
import CollectionEditMainSections from './Partials/CollectionEditMainSections';
import { useForm, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/admin/PageHeader';
import Textarea from '../../../Components/ui/Textarea';
import Switch from '../../../Components/ui/Switch';
import Checkbox from '../../../Components/ui/Checkbox';
import Button from '../../../Components/ui/Button';
import FileUpload from '../../../Components/admin/FileUpload';
import AlertDialog from '../../../Components/ui/AlertDialog';
import PublicationStatusSelect from '../../../Components/admin/PublicationStatusSelect';
import { ArrowLeft, Save, ExternalLink } from 'lucide-react';

function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function Edit({
    material,
    active_file = null,
    file_history = [],
    categories = [],
    audiences = [],
    material_types = [],
    status_options = [],
    max_file_size_mb = 50,
}) {
    const { data, setData, post, processing, errors, transform } = useForm({
        _method: 'PUT',
        title: material.title || '',
        code: material.code || '',
        author: material.author || '',
        category_id: material.category_id || '',
        type: material.type || 'module',
        source_type: material.source_type || 'uploaded_pdf',
        publication_year: material.publication_year || '',
        page_count: material.page_count || '',
        summary: material.summary || '',
        description: material.description || '',
        keywords: material.keywords || '',
        admin_notes: material.admin_notes || '',
        status: material.status || 'draft',
        cover_file: null,
        book_file: null,
        external_url: material.external_url || '',
        external_source_name: material.external_source_name || '',
        external_open_mode: material.external_open_mode || 'new_tab',
        video_url: material.video_url || '',
        video_allow_portal: Boolean(material.video_allow_portal ?? true),
        allow_download: Boolean(material.allow_download || material.is_downloadable),
        is_downloadable: Boolean(material.allow_download || material.is_downloadable),
        is_featured: Boolean(material.is_featured),
        audiences: material.audiences || [],
        key_points: Array.isArray(material.key_points) && material.key_points.length > 0
            ? material.key_points
            : ['', '', ''],
        learning_objectives: Array.isArray(material.learning_objectives) && material.learning_objectives.length > 0
            ? material.learning_objectives
            : ['', ''],
        table_of_contents: Array.isArray(material.table_of_contents) && material.table_of_contents.length > 0
            ? material.table_of_contents
            : [{ title: '', page: 1 }],
    });

    // State for Replace File Flow (PDF)
    const [selectedNewFile, setSelectedNewFile] = useState(null);
    const [replaceError, setReplaceError] = useState('');
    const [showConfirmReplaceModal, setShowConfirmReplaceModal] = useState(false);
    const [isReplacingFile, setIsReplacingFile] = useState(false);
    const replaceFileInputRef = useRef(null);

    const categoryOptions = categories.map((cat) => ({
        id: cat.id,
        value: cat.id,
        label: cat.name,
        color: cat.color,
    }));

    const handleSubmit = (e) => {
        e.preventDefault();
        transform((currentData) => ({
            ...currentData,
            _method: 'PUT',
            is_downloadable: currentData.allow_download,
        }));

        post(`/admin/koleksi/${material.id}`, {
            forceFormData: true,
        });
    };

    const pesertaAudience = audiences.find(
        (a) => a.code === 'participant' || a.name?.toLowerCase() === 'peserta'
    );

    const toggleAudience = (audienceId) => {
        const current = [...data.audiences];
        const index = current.indexOf(audienceId);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(audienceId);
        }
        setData('audiences', current);
    };

    const selectAllAudiences = () => {
        setData('audiences', audiences.map((a) => a.id));
    };

    const clearAllAudiences = () => {
        setData('audiences', []);
    };

    // Key points helpers
    const updateKeyPoint = (index, value) => {
        const next = [...data.key_points];
        next[index] = value;
        setData('key_points', next);
    };

    const addKeyPoint = () => {
        setData('key_points', [...data.key_points, '']);
    };

    const removeKeyPoint = (index) => {
        const next = data.key_points.filter((_, idx) => idx !== index);
        setData('key_points', next.length > 0 ? next : ['']);
    };

    // Learning objectives helpers
    const updateObjective = (index, value) => {
        const next = [...data.learning_objectives];
        next[index] = value;
        setData('learning_objectives', next);
    };

    const addObjective = () => {
        setData('learning_objectives', [...data.learning_objectives, '']);
    };

    const removeObjective = (index) => {
        const next = data.learning_objectives.filter((_, idx) => idx !== index);
        setData('learning_objectives', next.length > 0 ? next : ['']);
    };

    // Table of contents helpers
    const updateTocItem = (index, field, value) => {
        const next = [...data.table_of_contents];
        next[index] = { ...next[index], [field]: value };
        setData('table_of_contents', next);
    };

    const addTocItem = () => {
        const lastPage = data.table_of_contents.length > 0
            ? Number(data.table_of_contents[data.table_of_contents.length - 1].page) + 5
            : 1;
        setData('table_of_contents', [...data.table_of_contents, { title: '', page: lastPage }]);
    };

    const removeTocItem = (index) => {
        const next = data.table_of_contents.filter((_, idx) => idx !== index);
        setData('table_of_contents', next.length > 0 ? next : [{ title: '', page: 1 }]);
    };

    // Replace File Logic
    const handleNewFileSelected = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            setReplaceError('Format berkas harus berupa dokumen PDF (.pdf).');
            return;
        }

        const maxBytes = max_file_size_mb * 1024 * 1024;
        if (file.size > maxBytes) {
            setReplaceError(`Ukuran berkas (${formatBytes(file.size)}) melebihi batas maksimal ${max_file_size_mb} MB.`);
            return;
        }

        setReplaceError('');
        setSelectedNewFile(file);
        setData('book_file', file);
        setShowConfirmReplaceModal(true);
    };

    const confirmReplaceFile = () => {
        if (!selectedNewFile) return;

        setIsReplacingFile(true);
        setReplaceError('');
        router.post(
            `/admin/koleksi/${material.id}/replace-file`,
            { book_file: selectedNewFile },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setShowConfirmReplaceModal(false);
                    setSelectedNewFile(null);
                    setData('book_file', null);
                    if (replaceFileInputRef.current) {
                        replaceFileInputRef.current.value = '';
                    }
                },
                onError: (errs) => {
                    setReplaceError(errs.book_file || 'Gagal memperbarui versi berkas.');
                    setShowConfirmReplaceModal(false);
                },
                onFinish: () => {
                    setIsReplacingFile(false);
                },
            }
        );
    };

    return (
        <AdminLayout title={`Edit: ${material.title}`}>
            <PageHeader
                title="Edit Materi Koleksi"
                description={`Kode: ${material.code || '-'} • Terakhir diperbarui: ${material.updated_at || '-'}`}
                breadcrumbs={[
                    { label: 'Koleksi', href: '/admin/koleksi' },
                    { label: 'Edit Materi' },
                ]}
                action={
                    <div className="flex flex-wrap items-center gap-2">
                        <Button as={Link} href="/admin/koleksi" variant="secondary" size="sm" icon={ArrowLeft}>
                            Kembali
                        </Button>
                        {data.source_type === 'uploaded_pdf' && (
                            <Button
                                as="a"
                                href={`/koleksi/${material.slug}/baca`}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="outline"
                                size="sm"
                                icon={ExternalLink}
                            >
                                Buka Flipbook
                            </Button>
                        )}
                        {data.source_type === 'external_link' && (
                            <Button
                                as="a"
                                href={data.external_open_mode === 'embed' ? `/koleksi/${material.slug}` : (data.external_url || `/koleksi/${material.slug}`)}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="outline"
                                size="sm"
                                icon={ExternalLink}
                            >
                                {data.external_open_mode === 'embed' ? 'Lihat di Portal' : 'Buka Tautan'}
                            </Button>
                        )}
                        {data.source_type === 'video' && (
                            <Button
                                as="a"
                                href={`/koleksi/${material.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="outline"
                                size="sm"
                                icon={ExternalLink}
                            >
                                Lihat Video
                            </Button>
                        )}
                    </div>
                }
            />

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
                <CollectionEditMainSections
                    data={data}
                    setData={setData}
                    errors={errors}
                    material={material}
                    active_file={active_file}
                    file_history={file_history}
                    categoryOptions={categoryOptions}
                    material_types={material_types}
                    selectedNewFile={selectedNewFile}
                    setSelectedNewFile={setSelectedNewFile}
                    replaceError={replaceError}
                    replaceFileInputRef={replaceFileInputRef}
                    handleNewFileSelected={handleNewFileSelected}
                    confirmReplaceFile={confirmReplaceFile}
                    isReplacingFile={isReplacingFile}
                    formatBytes={formatBytes}
                    addKeyPoint={addKeyPoint}
                    removeKeyPoint={removeKeyPoint}
                    updateKeyPoint={updateKeyPoint}
                    addObjective={addObjective}
                    removeObjective={removeObjective}
                    updateObjective={updateObjective}
                    addTocItem={addTocItem}
                    removeTocItem={removeTocItem}
                    updateTocItem={updateTocItem}
                />

                {/* Right Column (1 col): Publication, Cover, & Actions */}
                <div className="space-y-6">
                    {/* Cover Section */}
                    <section className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs p-5 space-y-4">
                        <h2 className="text-sm font-bold text-[#0E2747] border-b border-[#DCE7F3] pb-3">
                            Berkas Sampul (Cover)
                        </h2>

                        <FileUpload
                            name="cover_file"
                            currentCover={material.cover_path}
                            onFileSelect={(file) => setData('cover_file', file)}
                            error={errors.cover_file}
                        />
                    </section>

                    {/* Status & Publication Section */}
                    <section className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs p-5 space-y-5">
                        <h2 className="text-sm font-bold text-[#0E2747] border-b border-[#DCE7F3] pb-3">
                            Status & Akses
                        </h2>

                        <PublicationStatusSelect
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            options={status_options}
                            error={errors.status}
                        />

                        {/* Audience Roles Checkboxes */}
                        <div className="pt-3 border-t border-[#DCE7F3] space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-[#0E2747]">
                                    Hak Akses Peran Sasaran
                                </label>
                                <span className="text-[10px] text-[#6B7C93]">
                                    {data.audiences.length === 0 ? 'Semua Kenshi (Publik)' : `${data.audiences.length} dari ${audiences.length} Dipilih`}
                                </span>
                            </div>

                            {/* Quick Action Buttons */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                <button
                                    type="button"
                                    onClick={selectAllAudiences}
                                    className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#EAF5FF] text-[#0B63CE] hover:bg-[#D5E9FE] transition-colors"
                                >
                                    Checklist Semua
                                </button>
                                {pesertaAudience && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!data.audiences.includes(pesertaAudience.id)) {
                                                toggleAudience(pesertaAudience.id);
                                            }
                                        }}
                                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                                            data.audiences.includes(pesertaAudience.id)
                                                ? 'bg-[#EBFBEE] text-[#2B8A3E] font-semibold'
                                                : 'bg-[#F1F3F5] text-[#495057] hover:bg-[#E9ECEF]'
                                        }`}
                                    >
                                        {data.audiences.includes(pesertaAudience.id) ? '✓ Peserta Aktif' : '+ Checklist Peserta'}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={clearAllAudiences}
                                    className="px-2 py-0.5 rounded text-[11px] font-medium text-[#6B7C93] hover:text-[#FA5252] hover:bg-[#FFF5F5] transition-colors ml-auto"
                                >
                                    Kosongkan
                                </button>
                            </div>

                            <p className="text-[11px] text-[#6B7C93]">
                                Kosongkan pilihan jika materi ditujukan untuk seluruh anggota kenshi PERKEMI, atau centang peran sasaran spesifik.
                            </p>

                            <div className="space-y-2 pt-1 max-h-48 overflow-y-auto pr-1">
                                {audiences.map((aud) => (
                                    <Checkbox
                                        key={aud.id}
                                        id={`audience-${aud.id}`}
                                        label={aud.name}
                                        checked={data.audiences.includes(aud.id)}
                                        onChange={() => toggleAudience(aud.id)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Toggles */}
                        <div className="pt-3 border-t border-[#DCE7F3] space-y-3">
                            <Switch
                                label="Izinkan Unduh Berkas"
                                helperText="Pengguna terotorisasi dapat mengunduh dokumen e-book"
                                checked={data.allow_download}
                                onChange={(val) => {
                                    setData('allow_download', val);
                                    setData('is_downloadable', val);
                                }}
                            />

                            <Switch
                                label="Koleksi Unggulan"
                                helperText="Tampilkan di sorotan utama beranda portal"
                                checked={data.is_featured}
                                onChange={(val) => setData('is_featured', val)}
                            />
                        </div>

                        {/* Admin Notes */}
                        <div className="pt-3 border-t border-[#DCE7F3]">
                            <Textarea
                                label="Catatan Redaksi (Internal)"
                                name="admin_notes"
                                value={data.admin_notes}
                                onChange={(e) => setData('admin_notes', e.target.value)}
                                rows={2}
                                error={errors.admin_notes}
                            />
                        </div>
                    </section>

                    {/* Action Button Card */}
                    <div className="bg-[#EAF5FF] rounded-xl border border-[#BCE0FD] p-5 space-y-2.5">
                        <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            loading={processing}
                            icon={Save}
                            className="w-full justify-center"
                        >
                            Simpan Perubahan
                        </Button>

                        <Link href="/admin/koleksi" className="block">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                disabled={processing}
                                className="w-full justify-center"
                            >
                                Batalkan
                            </Button>
                        </Link>
                    </div>
                </div>
            </form>

            {/* Modal Konfirmasi Ganti Berkas PDF */}
            <AlertDialog
                isOpen={showConfirmReplaceModal}
                open={showConfirmReplaceModal}
                title="Konfirmasi Pembaruan Versi Berkas"
                description={
                    selectedNewFile
                        ? `Anda akan memperbarui berkas menjadi versi ${((active_file?.version || 0) + 1)}.0 dengan berkas baru "${selectedNewFile.name}" (${formatBytes(selectedNewFile.size)}). Versi lama akan tetap tersimpan dalam riwayat.`
                        : ''
                }
                variant="info"
                loading={isReplacingFile}
                confirmText={isReplacingFile ? 'Menyimpan...' : 'Ya, Perbarui Versi'}
                confirmLabel={isReplacingFile ? 'Menyimpan...' : 'Ya, Perbarui Versi'}
                cancelText="Batal"
                cancelLabel="Batal"
                onConfirm={confirmReplaceFile}
                onClose={() => {
                    setShowConfirmReplaceModal(false);
                }}
                onCancel={() => {
                    setShowConfirmReplaceModal(false);
                }}
            />
        </AdminLayout>
    );
}
