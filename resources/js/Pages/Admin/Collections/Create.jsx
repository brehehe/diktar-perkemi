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
import BookFileUpload from '../../../Components/admin/BookFileUpload';
import PublicationStatusSelect from '../../../Components/admin/PublicationStatusSelect';
import { ArrowLeft, Save, Send, CheckCircle, BookOpen, Layers, ShieldCheck, Image as ImageIcon } from 'lucide-react';

export default function Create({
    categories = [],
    audiences = [],
    material_types = [],
    status_options = [],
    max_file_size_mb = 50,
}) {
    const { data, setData, post, processing, errors, progress } = useForm({
        title: '',
        code: '',
        author: 'Pengurus Besar PERKEMI',
        category_id: '',
        type: 'module',
        publication_year: new Date().getFullYear(),
        page_count: '',
        summary: '',
        description: '',
        keywords: '',
        admin_notes: '',
        status: 'draft',
        book_file: null,
        cover_file: null,
        is_downloadable: true,
        is_featured: false,
        audiences: [],
    });

    const [uploadProgress, setUploadProgress] = useState(null);

    const categoryOptions = categories.map((cat) => ({
        id: cat.id,
        value: cat.id,
        label: cat.name,
        color: cat.color,
    }));

    const handleSubmit = (targetStatus = null) => {
        const payload = { ...data };
        if (targetStatus) {
            payload.status = targetStatus;
            setData('status', targetStatus);
        }

        post('/admin/koleksi', {
            data: payload,
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

    return (
        <AdminLayout title="Tambah Materi Koleksi">
            <PageHeader
                title="Tambah Materi Baru"
                description="Lengkapi informasi editorial, berkas PDF buku digital, berkas sampul, dan hak akses pembaca."
                breadcrumbs={[
                    { label: 'Koleksi', href: '/admin/koleksi' },
                    { label: 'Tambah Materi' },
                ]}
                action={
                    <Link href="/admin/koleksi">
                        <Button variant="secondary" size="sm" icon={ArrowLeft}>
                            Kembali
                        </Button>
                    </Link>
                }
            />

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16"
            >
                {/* Left & Middle Column: Main Editorial Sections (2 cols) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* SECTION 1: Informasi Materi */}
                    <section className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs p-6 space-y-5">
                        <div className="border-b border-[#DCE7F3] pb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[#EAF5FF] text-[#0B63CE] text-xs font-bold flex items-center justify-center">
                                    1
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
                            placeholder="Contoh: Modul Penataran Pelatih Tingkat I — Standarisasi Goho & Juho"
                            required
                            error={errors.title}
                        />

                        <Textarea
                            label="Ringkasan Singkat (Abstrak)"
                            name="summary"
                            value={data.summary}
                            onChange={(e) => setData('summary', e.target.value)}
                            placeholder="Tuliskan intisari buku/modul dalam 2-3 kalimat untuk pratinjau katalog..."
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

                        <Textarea
                            label="Deskripsi Lengkap & Silabus (Opsional)"
                            name="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Uraikan latar belakang penyusunan materi, silabus bab, dan instruksi pembelajaran..."
                            rows={4}
                            error={errors.description}
                        />
                    </section>

                    {/* SECTION 2: Berkas Buku Digital */}
                    <section className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs p-6 space-y-4">
                        <div className="border-b border-[#DCE7F3] pb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[#EAF5FF] text-[#0B63CE] text-xs font-bold flex items-center justify-center">
                                    2
                                </span>
                                <h2 className="text-sm font-bold text-[#0E2747]">
                                    Berkas Buku Digital
                                </h2>
                            </div>
                            <span className="text-[11px] text-[#FA5252] font-semibold">* Wajib Diunggah</span>
                        </div>

                        <p className="text-xs text-[#6B7C93] leading-relaxed">
                            Berkas digital disimpan pada <strong>penyimpanan privat terenkripsi</strong>. Pengguna hanya dapat membaca melalui reader aman setelah hak akses dan status publikasi terverifikasi oleh server.
                        </p>

                        <BookFileUpload
                            selectedFile={data.book_file}
                            onFileSelect={(file) => setData('book_file', file)}
                            error={errors.book_file}
                            maxSizeMb={max_file_size_mb}
                            progress={uploadProgress}
                        />
                    </section>
                </div>

                {/* Right Column: Cover & Access / Publication (1 col) */}
                <div className="space-y-6">
                    {/* SECTION 3: Cover dan Tampilan */}
                    <section className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs p-5 space-y-4">
                        <div className="border-b border-[#DCE7F3] pb-3 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#EAF5FF] text-[#0B63CE] text-xs font-bold flex items-center justify-center">
                                3
                            </span>
                            <h2 className="text-sm font-bold text-[#0E2747]">
                                Cover dan Tampilan
                            </h2>
                        </div>

                        <FileUpload
                            name="cover_file"
                            label="Unggah Sampul Materi"
                            onFileSelect={(file) => setData('cover_file', file)}
                            error={errors.cover_file}
                            helperText="Format JPG, PNG, atau WebP. Maks 2 MB."
                        />

                        {/* Visual Proportion & Fallback Note */}
                        {!data.cover_file && (
                            <div className="p-3 bg-[#F8FBFF] border border-[#DCE7F3] rounded-lg text-[11px] text-[#6B7C93] flex items-center gap-2.5">
                                <BookOpen className="w-4 h-4 text-[#0B63CE] shrink-0" />
                                <span>Bila sampul tidak diunggah, sistem akan menggunakan kartu sampul tipografis resmi PERKEMI.</span>
                            </div>
                        )}
                    </section>

                    {/* SECTION 4: Akses dan Publikasi */}
                    <section className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs p-5 space-y-5">
                        <div className="border-b border-[#DCE7F3] pb-3 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#EAF5FF] text-[#0B63CE] text-xs font-bold flex items-center justify-center">
                                4
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
                                    {data.audiences.length === 0 ? 'Semua Kenshi' : `${data.audiences.length} Dipilih`}
                                </span>
                            </div>
                            <p className="text-[11px] text-[#6B7C93]">
                                Kosongkan pilihan jika materi ditujukan untuk seluruh anggota kenshi PERKEMI.
                            </p>

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

                        {/* Features Toggles */}
                        <div className="pt-3 border-t border-[#DCE7F3] space-y-3">
                            <Switch
                                label="Izinkan Pengunduhan Berkas"
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
                                placeholder="Catatan redaksi, versi dokumen, atau instruksi internal..."
                                rows={2}
                                error={errors.admin_notes}
                            />
                        </div>
                    </section>

                    {/* Form Action Buttons */}
                    <div className="bg-[#EAF5FF] rounded-xl border border-[#BCE0FD] p-5 space-y-2.5">
                        <Button
                            type="button"
                            variant="primary"
                            size="md"
                            loading={processing}
                            icon={Save}
                            className="w-full"
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
                            className="w-full"
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
                            className="w-full text-[#2B8A3E] border-[#2B8A3E]/40 hover:bg-[#EBFBEE]"
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
                                className="w-full"
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
