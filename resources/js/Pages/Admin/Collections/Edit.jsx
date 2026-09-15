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
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        title: material.title || '',
        code: material.code || '',
        author: material.author || '',
        category_id: material.category_id || '',
        type: material.type || 'module',
        publication_year: material.publication_year || '',
        page_count: material.page_count || '',
        summary: material.summary || '',
        description: material.description || '',
        keywords: material.keywords || '',
        admin_notes: material.admin_notes || '',
        status: material.status || 'draft',
        cover_file: null,
        is_downloadable: Boolean(material.is_downloadable),
        is_featured: Boolean(material.is_featured),
        audiences: material.audiences || [],
        key_points: Array.isArray(material.key_points) && material.key_points.length > 0
            ? material.key_points
            : ['', '', ''],
        learning_objectives: Array.isArray(material.learning_objectives) && material.learning_objectives.length > 0
            ? material.learning_objectives
            : [''],
        table_of_contents: Array.isArray(material.table_of_contents) && material.table_of_contents.length > 0
            ? material.table_of_contents
            : [{ title: '', page: 1 }],
    });

    // State for Replace File Flow
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

    // Key points helpers (3 to 6 points)
    const updateKeyPoint = (index, value) => {
        const next = [...data.key_points];
        next[index] = value;
        setData('key_points', next);
    };

    const addKeyPoint = () => {
        if (data.key_points.length < 6) {
            setData('key_points', [...data.key_points, '']);
        }
    };

    const removeKeyPoint = (index) => {
        const next = data.key_points.filter((_, i) => i !== index);
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
        const next = data.learning_objectives.filter((_, i) => i !== index);
        setData('learning_objectives', next.length > 0 ? next : ['']);
    };

    // Table of contents helpers
    const updateTocItem = (index, field, value) => {
        const next = [...data.table_of_contents];
        next[index] = { ...next[index], [field]: value };
        setData('table_of_contents', next);
    };

    const addTocItem = () => {
        const lastPage = data.table_of_contents[data.table_of_contents.length - 1]?.page || 1;
        setData('table_of_contents', [...data.table_of_contents, { title: '', page: Number(lastPage) + 1 }]);
    };

    const removeTocItem = (index) => {
        const next = data.table_of_contents.filter((_, i) => i !== index);
        setData('table_of_contents', next.length > 0 ? next : [{ title: '', page: 1 }]);
    };

    const handleNewFileSelected = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setReplaceError('');

        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            setReplaceError('Format berkas harus berupa dokumen PDF (.pdf).');
            return;
        }

        const maxBytes = max_file_size_mb * 1024 * 1024;
        if (file.size > maxBytes) {
            setReplaceError(`Ukuran berkas melebihi batas maksimum ${max_file_size_mb} MB.`);
            return;
        }

        setSelectedNewFile(file);
        setShowConfirmReplaceModal(true);
    };

    const executeFileReplacement = () => {
        if (!selectedNewFile) return;

        setIsReplacingFile(true);
        router.post(
            `/admin/koleksi/${material.id}/replace-file`,
            { book_file: selectedNewFile },
            {
                forceFormData: true,
                onFinish: () => {
                    setIsReplacingFile(false);
                    setShowConfirmReplaceModal(false);
                    setSelectedNewFile(null);
                    if (replaceFileInputRef.current) {
                        replaceFileInputRef.current.value = '';
                    }
                },
            }
        );
    };

    return (
        <AdminLayout title={`Edit: ${material.title}`}>
            <PageHeader
                title="Perbarui Materi Koleksi"
                description={`Ubah metadata bibliografi, kelola riwayat versi berkas digital, atau atur publikasi "${material.title}".`}
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
                        <a
                            href={`/koleksi/${material.slug}/baca`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button variant="outline" size="sm" icon={ExternalLink}>
                                Buka Reader
                            </Button>
                        </a>
                    </div>
                }
            />

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
                {/* Left & Middle Column (2 cols) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* SECTION: Riwayat File dan Versi (Prompt Highlight) */}
                    <section className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs p-6 space-y-5">
                        <div className="border-b border-[#DCE7F3] pb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-[#0B63CE]" />
                                <h2 className="text-sm font-bold text-[#0E2747]">
                                    Riwayat Berkas & Manajemen Versi
                                </h2>
                            </div>
                            <input
                                ref={replaceFileInputRef}
                                type="file"
                                accept="application/pdf"
                                className="sr-only"
                                onChange={handleNewFileSelected}
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                icon={RefreshCw}
                                onClick={() => replaceFileInputRef.current?.click()}
                            >
                                Ganti File (Unggah Versi Baru)
                            </Button>
                        </div>

                        {replaceError && (
                            <div className="p-3 bg-[#FDE8EF] border border-[#F8B4C4] rounded-lg text-xs text-[#FA5252] flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{replaceError}</span>
                            </div>
                        )}

                        {/* Active File Display */}
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7C93] block mb-2">
                                Berkas Aktif Saat Ini
                            </span>
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
                                    <span>Belum ada berkas PDF aktif yang diunggah untuk materi ini.</span>
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
                        </div>

                        {/* Version History Table */}
                        {file_history.length > 0 && (
                            <div className="pt-3 border-t border-[#DCE7F3]">
                                <div className="flex items-center gap-2 mb-3">
                                    <History className="w-4 h-4 text-[#6B7C93]" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#112743]">
                                        Daftar Riwayat Versi ({file_history.length})
                                    </h3>
                                </div>

                                <div className="border border-[#DCE7F3] rounded-lg overflow-hidden text-xs">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-[#F8FBFF] border-b border-[#DCE7F3] text-[11px] font-semibold text-[#6B7C93] uppercase">
                                                <th className="py-2.5 px-3">Versi</th>
                                                <th className="py-2.5 px-3">Nama Berkas</th>
                                                <th className="py-2.5 px-3">Ukuran</th>
                                                <th className="py-2.5 px-3">Pengunggah</th>
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
                                                        {hist.uploader_name}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-[#6B7C93]">
                                                        {hist.uploaded_at}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right">
                                                        {hist.is_active ? (
                                                            <Badge variant="success" size="sm" dot>
                                                                Aktif
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-[11px] text-[#6B7C93]">Arsip</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* SECTION: Informasi Utama Materi */}
                    <section className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs p-6 space-y-5">
                        <h2 className="text-sm font-bold text-[#0E2747] border-b border-[#DCE7F3] pb-3">
                            Informasi Materi & Bibliografi
                        </h2>

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
                                placeholder="Pilih topik kategori..."
                                required
                                error={errors.category_id}
                            />

                            <Select
                                label="Jenis Materi"
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
                                helperText="Pisahkan dengan tanda koma"
                                error={errors.keywords}
                            />

                            <Input
                                label="Jumlah Halaman"
                                name="page_count"
                                type="number"
                                min="1"
                                value={data.page_count}
                                onChange={(e) => setData('page_count', e.target.value)}
                                error={errors.page_count}
                            />
                        </div>

                        <Textarea
                            label="Deskripsi Lengkap & Silabus"
                            name="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={5}
                            error={errors.description}
                        />
                    </section>

                    {/* SECTION: Metadata Reader (Poin Penting, Tujuan Pembelajaran, Daftar Isi) */}
                    <section className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs p-6 space-y-6">
                        <div className="border-b border-[#DCE7F3] pb-3">
                            <h2 className="text-sm font-bold text-[#0E2747] flex items-center gap-2">
                                <BookOpenCheck className="w-4 h-4 text-[#0B63CE]" />
                                <span>Pengaturan Interaktif Reader Digital</span>
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">
                                Kelola poin penting kurikulum, sasaran capaian kompetensi, dan daftar isi navigasi halaman buku.
                            </p>
                        </div>

                        {/* 1. Poin Penting Materi (3 - 6 poin) */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-[#0E2747] uppercase tracking-wider">
                                    Poin Penting Materi (3 - 6 Poin)
                                </label>
                                {data.key_points.length < 6 && (
                                    <button
                                        type="button"
                                        onClick={addKeyPoint}
                                        className="text-xs text-[#0B63CE] hover:text-[#0A3F82] font-semibold inline-flex items-center gap-1"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Tambah Poin</span>
                                    </button>
                                )}
                            </div>

                            <div className="space-y-2">
                                {data.key_points.map((pt, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span className="w-6 text-center text-xs font-mono font-bold text-slate-400">
                                            {idx + 1}.
                                        </span>
                                        <input
                                            type="text"
                                            value={pt}
                                            onChange={(e) => updateKeyPoint(idx, e.target.value)}
                                            placeholder={`Poin pembahasan ${idx + 1}...`}
                                            className="flex-1 text-xs py-2 px-3 border border-[#DCE7F3] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#0B63CE]"
                                        />
                                        {data.key_points.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeKeyPoint(idx)}
                                                aria-label="Hapus poin"
                                                className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. Tujuan Pembelajaran */}
                        <div className="pt-4 border-t border-[#DCE7F3] space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-[#0E2747] uppercase tracking-wider flex items-center gap-1.5">
                                    <Target className="w-3.5 h-3.5 text-[#0B63CE]" />
                                    <span>Tujuan Pembelajaran</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={addObjective}
                                    className="text-xs text-[#0B63CE] hover:text-[#0A3F82] font-semibold inline-flex items-center gap-1"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Tambah Tujuan</span>
                                </button>
                            </div>

                            <div className="space-y-2">
                                {data.learning_objectives.map((obj, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[#0B63CE] ml-2 shrink-0" />
                                        <input
                                            type="text"
                                            value={obj}
                                            onChange={(e) => updateObjective(idx, e.target.value)}
                                            placeholder={`Target kompetensi ${idx + 1}...`}
                                            className="flex-1 text-xs py-2 px-3 border border-[#DCE7F3] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#0B63CE]"
                                        />
                                        {data.learning_objectives.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeObjective(idx)}
                                                aria-label="Hapus tujuan"
                                                className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. Daftar Isi Manual */}
                        <div className="pt-4 border-t border-[#DCE7F3] space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-[#0E2747] uppercase tracking-wider flex items-center gap-1.5">
                                    <ListOrdered className="w-3.5 h-3.5 text-[#0B63CE]" />
                                    <span>Daftar Isi Manual (Bab & Halaman)</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={addTocItem}
                                    className="text-xs text-[#0B63CE] hover:text-[#0A3F82] font-semibold inline-flex items-center gap-1"
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
                                            placeholder="Judul Bab / Pokok Bahasan..."
                                            className="flex-1 text-xs py-2 px-3 border border-[#DCE7F3] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#0B63CE]"
                                        />
                                        <div className="flex items-center gap-1 shrink-0">
                                            <span className="text-xs text-slate-400">Hal.</span>
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
                                                aria-label="Hapus bab"
                                                className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Publication, Cover, & Action (1 col) */}
                <div className="space-y-6">
                    {/* Publication & Status Card */}
                    <section className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs p-5 space-y-5">
                        <h2 className="text-sm font-bold text-[#0E2747] border-b border-[#DCE7F3] pb-3">
                            Status & Publikasi
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

                            <div className="space-y-2 pt-1">
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
                                helperText="Pengguna terotorisasi dapat mengunduh dokumen PDF"
                                checked={data.is_downloadable}
                                onChange={(val) => setData('is_downloadable', val)}
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
                                label="Catatan Admin (Internal)"
                                name="admin_notes"
                                value={data.admin_notes}
                                onChange={(e) => setData('admin_notes', e.target.value)}
                                rows={2}
                                error={errors.admin_notes}
                            />
                        </div>
                    </section>

                    {/* Cover Upload Card */}
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

                    {/* Action Card */}
                    <div className="bg-[#EAF5FF] rounded-xl border border-[#BCE0FD] p-5 space-y-2.5">
                        <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            loading={processing}
                            icon={Save}
                            className="w-full"
                        >
                            Simpan Perubahan
                        </Button>

                        <Link href="/admin/koleksi" className="block">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                disabled={processing}
                                className="w-full"
                            >
                                Batalkan
                            </Button>
                        </Link>
                    </div>
                </div>
            </form>

            {/* Alert Dialog for File Replacement */}
            <AlertDialog
                isOpen={showConfirmReplaceModal}
                onClose={() => {
                    setShowConfirmReplaceModal(false);
                    setSelectedNewFile(null);
                    if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
                }}
                onConfirm={executeFileReplacement}
                title="Ganti Berkas Buku Digital?"
                description={`Anda akan mengunggah berkas "${selectedNewFile?.name}" (${selectedNewFile ? formatBytes(selectedNewFile.size) : ''}) sebagai versi berikutnya. Berkas baru akan menjadi versi aktif yang dapat diakses oleh pembaca.`}
                confirmText="Konfirmasi & Unggah Versi Baru"
                cancelText="Batalkan"
                variant="info"
                loading={isReplacingFile}
            />
        </AdminLayout>
    );
}
