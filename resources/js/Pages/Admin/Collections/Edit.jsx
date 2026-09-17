import React, { useState, useRef } from 'react';
import { useForm, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/admin/PageHeader';
import Input from '../../../Components/ui/Input';
import Textarea from '../../../Components/ui/Textarea';
import Select from '../../../Components/ui/Select';
import Combobox from '../../../Components/ui/Combobox';
import Switch from '../../../Components/ui/Switch';
import Checkbox from '../../../Components/ui/Checkbox';
import Button from '../../../Components/ui/Button';
import FileUpload from '../../../Components/admin/FileUpload';
import FileInfo from '../../../Components/admin/FileInfo';
import AlertDialog from '../../../Components/ui/AlertDialog';
import Badge from '../../../Components/ui/Badge';
import PublicationStatusSelect from '../../../Components/admin/PublicationStatusSelect';
import MaterialSourceSelector from '../../../Components/admin/MaterialSourceSelector';
import ExternalUrlField from '../../../Components/admin/ExternalUrlField';
import VideoUrlField from '../../../Components/admin/VideoUrlField';
import VideoPreview from '../../../Components/admin/VideoPreview';
import {
    ArrowLeft,
    Save,
    ExternalLink,
    Upload,
    Clock,
    FileText,
    History,
    RefreshCw,
    BookOpen,
    AlertCircle,
    CheckCircle2,
    Plus,
    Trash2,
    ListOrdered,
    Target,
    BookOpenCheck,
} from 'lucide-react';

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
                    <div className="flex items-center gap-2">
                        <Link href="/admin/koleksi">
                            <Button variant="secondary" size="sm" icon={ArrowLeft}>
                                Kembali
                            </Button>
                        </Link>
                        {data.source_type === 'uploaded_pdf' && (
                            <a
                                href={`/koleksi/${material.slug}/baca`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button variant="outline" size="sm" icon={ExternalLink}>
                                    Buka Flipbook
                                </Button>
                            </a>
                        )}
                        {data.source_type === 'external_link' && (
                            <a
                                href={data.external_open_mode === 'embed' ? `/koleksi/${material.slug}` : (data.external_url || `/koleksi/${material.slug}`)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button variant="outline" size="sm" icon={ExternalLink}>
                                    {data.external_open_mode === 'embed' ? 'Lihat di Portal' : 'Buka Tautan'}
                                </Button>
                            </a>
                        )}
                        {data.source_type === 'video' && (
                            <a
                                href={`/koleksi/${material.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button variant="outline" size="sm" icon={ExternalLink}>
                                    Lihat Video
                                </Button>
                            </a>
                        )}
                    </div>
                }
            />

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
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
                                        <input
                                            type="text"
                                            value={item.title}
                                            onChange={(e) => updateTocItem(idx, 'title', e.target.value)}
                                            placeholder={`Judul Bab #${idx + 1}`}
                                            className="flex-1 text-xs py-2 px-3 border border-[#DCE7F3] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#0B63CE]"
                                        />
                                        <div className="flex items-center gap-1 shrink-0">
                                            <span className="text-xs text-[#6B7C93]">Hal.</span>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.page}
                                                onChange={(e) => updateTocItem(idx, 'page', Number(e.target.value))}
                                                className="w-16 text-center text-xs py-2 px-2 border border-[#DCE7F3] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#0B63CE]"
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
                                        <input
                                            ref={replaceFileInputRef}
                                            type="file"
                                            accept="application/pdf"
                                            className="sr-only"
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

                                            <div className="border border-[#DCE7F3] rounded-lg overflow-hidden text-xs">
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
                                            </div>
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
                                    {data.audiences.length === 0 ? 'Semua Kenshi' : `${data.audiences.length} Dipilih`}
                                </span>
                            </div>

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
