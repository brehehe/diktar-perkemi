import React, { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
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
import PublicationStatusSelect from '../../../Components/admin/PublicationStatusSelect';
import MaterialSourceSelector from '../../../Components/admin/MaterialSourceSelector';
import PdfUploadField from '../../../Components/admin/PdfUploadField';
import ExternalUrlField from '../../../Components/admin/ExternalUrlField';
import VideoUrlField from '../../../Components/admin/VideoUrlField';
import VideoPreview from '../../../Components/admin/VideoPreview';
import {
    ArrowLeft,
    Save,
    Send,
    CheckCircle,
    BookOpen,
    Layers,
    Plus,
    Trash2,
    Target,
    BookOpenCheck,
} from 'lucide-react';

export default function Create({
    categories = [],
    audiences = [],
    material_types = [],
    status_options = [],
    max_file_size_mb = 50,
}) {
    const pesertaAudience = audiences.find(
        (a) => a.code === 'participant' || a.name?.toLowerCase() === 'peserta'
    );

    const { data, setData, post, processing, errors, transform } = useForm({
        title: '',
        code: '',
        author: 'Pengurus Besar PERKEMI',
        category_id: '',
        type: 'module',
        source_type: 'uploaded_pdf',
        publication_year: new Date().getFullYear(),
        page_count: '',
        summary: '',
        description: '',
        keywords: '',
        admin_notes: '',
        status: 'draft',
        book_file: null,
        cover_file: null,
        external_url: '',
        external_source_name: '',
        external_open_mode: 'new_tab',
        video_url: '',
        video_allow_portal: true,
        allow_download: true,
        is_downloadable: true,
        is_featured: false,
        audiences: pesertaAudience ? [pesertaAudience.id] : [],
        key_points: ['', '', ''],
        learning_objectives: ['', ''],
    });

    const [uploadProgress, setUploadProgress] = useState(null);

    const categoryOptions = categories.map((cat) => ({
        id: cat.id,
        value: cat.id,
        label: cat.name,
        color: cat.color,
    }));

    const handleSubmit = (targetStatus = null) => {
        transform((currentData) => ({
            ...currentData,
            status: targetStatus || currentData.status,
            is_downloadable: currentData.allow_download,
        }));

        post('/admin/koleksi', {
            forceFormData: true,
            onProgress: (p) => {
                if (p && p.percentage) {
                    setUploadProgress(p.percentage);
                }
            },
            onFinish: () => {
                setUploadProgress(null);
            },
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

    const selectAllAudiences = () => {
        setData('audiences', audiences.map((a) => a.id));
    };

    const clearAllAudiences = () => {
        setData('audiences', []);
    };

    // Key points helpers
    const handleKeyPointChange = (index, value) => {
        const updated = [...data.key_points];
        updated[index] = value;
        setData('key_points', updated);
    };

    const addKeyPoint = () => {
        setData('key_points', [...data.key_points, '']);
    };

    const removeKeyPoint = (index) => {
        const updated = data.key_points.filter((_, i) => i !== index);
        setData('key_points', updated.length > 0 ? updated : ['']);
    };

    // Learning objectives helpers
    const handleObjectiveChange = (index, value) => {
        const updated = [...data.learning_objectives];
        updated[index] = value;
        setData('learning_objectives', updated);
    };

    const addObjective = () => {
        setData('learning_objectives', [...data.learning_objectives, '']);
    };

    const removeObjective = (index) => {
        const updated = data.learning_objectives.filter((_, i) => i !== index);
        setData('learning_objectives', updated.length > 0 ? updated : ['']);
    };

    return (
        <AdminLayout title="Tambah Materi Koleksi">
            <PageHeader
                title="Tambah Materi Baru"
                description="Lengkapi informasi materi, pilih jenis sumber (PDF, tautan buku, atau video), dan atur hak publikasi."
                breadcrumbs={[
                    { label: 'Koleksi', href: '/admin/koleksi' },
                    { label: 'Tambah Materi' },
                ]}
                action={
                    <Button as={Link} href="/admin/koleksi" variant="secondary" size="sm" icon={ArrowLeft}>
                        Kembali
                    </Button>
                }
            />

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16"
            >
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
                            placeholder="Contoh: Kurikulum Standar Penataran Pelatih Daerah — Tingkat I"
                            required
                            error={errors.title}
                        />

                        <Textarea
                            label="Ringkasan Singkat (Abstrak)"
                            name="summary"
                            value={data.summary}
                            onChange={(e) => setData('summary', e.target.value)}
                            placeholder="Tuliskan intisari materi dalam 2-3 kalimat untuk pratinjau katalog..."
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
                                placeholder="Contoh: Pengurus Besar PERKEMI"
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
                                placeholder="Auto jika dikosongkan"
                                error={errors.code}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Kata Kunci (Tag Pencarian)"
                                name="keywords"
                                value={data.keywords}
                                onChange={(e) => setData('keywords', e.target.value)}
                                placeholder="Contoh: goho, juho, penataran 2026, wasit"
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
                                placeholder="Contoh: 148"
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
                                {data.key_points.map((point, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Input
                                            value={point}
                                            onChange={(e) => handleKeyPointChange(index, e.target.value)}
                                            placeholder={`Poin penting #${index + 1}`}
                                            className="flex-1"
                                        />
                                        {data.key_points.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeKeyPoint(index)}
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
                                {data.learning_objectives.map((obj, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Input
                                            value={obj}
                                            onChange={(e) => handleObjectiveChange(index, e.target.value)}
                                            placeholder={`Target capaian #${index + 1}`}
                                            className="flex-1"
                                        />
                                        {data.learning_objectives.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeObjective(index)}
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
                            label="Deskripsi Lengkap & Silabus (Opsional)"
                            name="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Uraikan latar belakang materi, silabus bab, rubrik penilaian, atau petunjuk teknis..."
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

                        {/* Visual Source Selector */}
                        <MaterialSourceSelector
                            value={data.source_type}
                            onChange={(source) => setData('source_type', source)}
                            error={errors.source_type}
                        />

                        {/* Dynamic Field Display depending on selected source */}
                        <div className="pt-2">
                            {data.source_type === 'uploaded_pdf' && (
                                <PdfUploadField
                                    selectedFile={data.book_file}
                                    onFileSelect={(file) => setData('book_file', file)}
                                    allowDownload={data.allow_download}
                                    onAllowDownloadChange={(val) => setData('allow_download', val)}
                                    error={errors.book_file}
                                    maxSizeMb={max_file_size_mb}
                                    progress={uploadProgress}
                                />
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

                {/* Right Column (1 col): Cover & Publication */}
                <div className="space-y-6">
                    {/* SECTION C1: Cover Materi */}
                    <section className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs p-5 space-y-4">
                        <div className="border-b border-[#DCE7F3] pb-3 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#EAF5FF] text-[#0B63CE] text-xs font-bold flex items-center justify-center">
                                C1
                            </span>
                            <h2 className="text-sm font-bold text-[#0E2747]">
                                Sampul Materi
                            </h2>
                        </div>

                        <FileUpload
                            name="cover_file"
                            label="Unggah Sampul Materi"
                            onFileSelect={(file) => setData('cover_file', file)}
                            error={errors.cover_file}
                            helperText="Format JPG, PNG, atau WebP. Maks 2 MB."
                        />

                        {!data.cover_file && (
                            <div className="p-3 bg-[#F8FBFF] border border-[#DCE7F3] rounded-lg text-[11px] text-[#6B7C93] flex items-center gap-2.5">
                                <BookOpen className="w-4 h-4 text-[#0B63CE] shrink-0" />
                                <span>Bila sampul tidak diunggah, kartu tipografis resmi PERKEMI akan digunakan otomatis.</span>
                            </div>
                        )}
                    </section>

                    {/* SECTION C2: Akses dan Publikasi */}
                    <section className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs p-5 space-y-5">
                        <div className="border-b border-[#DCE7F3] pb-3 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#EAF5FF] text-[#0B63CE] text-xs font-bold flex items-center justify-center">
                                C2
                            </span>
                            <h2 className="text-sm font-bold text-[#0E2747]">
                                Akses dan Publikasi
                            </h2>
                        </div>

                        <PublicationStatusSelect
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            options={status_options}
                            error={errors.status}
                        />

                        {data.status === 'published' && (
                            <div className="p-2.5 bg-[#EBFBEE] border border-[#D3F9D8] rounded-lg text-xs text-[#2B8A3E]">
                                <strong>Tanggal Terbit:</strong> Hari ini ({new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })})
                            </div>
                        )}

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

                        {/* Featured Switch */}
                        <div className="pt-3 border-t border-[#DCE7F3] space-y-3">
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
                                placeholder="Catatan internal pengurus..."
                                rows={2}
                                error={errors.admin_notes}
                            />
                        </div>
                    </section>

                    {/* Action Buttons Panel */}
                    <div className="bg-[#EAF5FF] rounded-xl border border-[#BCE0FD] p-5 space-y-2.5">
                        <Button
                            type="button"
                            variant="primary"
                            size="md"
                            loading={processing}
                            icon={Save}
                            className="w-full justify-center"
                            onClick={() => handleSubmit('draft')}
                        >
                            Simpan sebagai Draf
                        </Button>

                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            loading={processing}
                            icon={Send}
                            className="w-full justify-center"
                            onClick={() => handleSubmit('review')}
                        >
                            Kirim untuk Ditinjau
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            loading={processing}
                            icon={CheckCircle}
                            className="w-full justify-center text-[#2B8A3E] border-[#2B8A3E]/40 hover:bg-[#EBFBEE]"
                            onClick={() => handleSubmit('published')}
                        >
                            Terbitkan Sekarang
                        </Button>

                        <Link href="/admin/koleksi" className="block pt-1">
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
        </AdminLayout>
    );
}
