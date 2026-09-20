import React, { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/admin/PageHeader';
import Button from '../../../Components/ui/Button';
import Input from '../../../Components/ui/Input';
import AlertDialog from '../../../Components/ui/AlertDialog';
import FileInput from '../../../Components/ui/FileInput';
import { motion } from 'framer-motion';
import {
    Sparkles,
    Upload,
    RotateCcw,
    Save,
    ExternalLink,
    Eye,
    CheckCircle2,
    BookOpen,
    Image as ImageIcon,
    Link as LinkIcon,
} from 'lucide-react';

export default function Index({ hero_books = {}, available_materials = [] }) {
    const [previewImages, setPreviewImages] = useState({
        book_1: hero_books.book_1?.image || '/images/cover-1.jpg',
        book_2: hero_books.book_2?.image || '/images/cover-2.jpg',
        book_3: hero_books.book_3?.image || '/images/cover-3.jpg',
    });

    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
    const [selectedQuickPickTab, setSelectedQuickPickTab] = useState(null); // 'book_1' | 'book_2' | 'book_3' | null

    const { data, setData, post, processing, errors, reset } = useForm({
        book_1_image_file: null,
        book_1_existing_image: hero_books.book_1?.image || '/images/cover-1.jpg',
        book_1_title: hero_books.book_1?.title || 'Buku Modul PERKEMI 1',
        book_1_link: hero_books.book_1?.link || '/koleksi',

        book_2_image_file: null,
        book_2_existing_image: hero_books.book_2?.image || '/images/cover-2.jpg',
        book_2_title: hero_books.book_2?.title || 'Buku Modul PERKEMI 2',
        book_2_link: hero_books.book_2?.link || '/koleksi',

        book_3_image_file: null,
        book_3_existing_image: hero_books.book_3?.image || '/images/cover-3.jpg',
        book_3_title: hero_books.book_3?.title || 'Buku Utama Kurikulum PERKEMI',
        book_3_link: hero_books.book_3?.link || '/koleksi',
    });

    const handleFileChange = (bookKey, file) => {
        if (!file) return;
        setData(`${bookKey}_image_file`, file);
        const objectUrl = URL.createObjectURL(file);
        setPreviewImages((prev) => ({
            ...prev,
            [bookKey]: objectUrl,
        }));
    };

    const handleQuickPick = (bookKey, material) => {
        if (!material?.cover_path) return;
        setData(`${bookKey}_existing_image`, material.cover_path);
        setData(`${bookKey}_image_file`, null);
        setData(`${bookKey}_title`, material.title);
        setData(`${bookKey}_link`, `/koleksi/${material.slug}`);
        setPreviewImages((prev) => ({
            ...prev,
            [bookKey]: material.cover_path,
        }));
        setSelectedQuickPickTab(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/showcase', {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const handleConfirmReset = () => {
        post('/admin/showcase/reset', {
            preserveScroll: true,
            onSuccess: () => {
                setPreviewImages({
                    book_1: '/images/cover-1.jpg',
                    book_2: '/images/cover-2.jpg',
                    book_3: '/images/cover-3.jpg',
                });
                setData({
                    book_1_image_file: null,
                    book_1_existing_image: '/images/cover-1.jpg',
                    book_1_title: 'Buku Modul PERKEMI 1',
                    book_1_link: '/koleksi',

                    book_2_image_file: null,
                    book_2_existing_image: '/images/cover-2.jpg',
                    book_2_title: 'Buku Modul PERKEMI 2',
                    book_2_link: '/koleksi',

                    book_3_image_file: null,
                    book_3_existing_image: '/images/cover-3.jpg',
                    book_3_title: 'Buku Utama Kurikulum PERKEMI',
                    book_3_link: '/koleksi',
                });
                setIsResetDialogOpen(false);
            },
        });
    };

    const bookConfigs = [
        {
            key: 'book_1',
            label: 'Buku 1 (Sisi Kiri)',
            badge: 'Latar Kiri',
            badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            description: 'Tampil di sebelah kiri belakang dengan kemiringan rotasi 3D ke kiri.',
        },
        {
            key: 'book_3',
            label: 'Buku 3 (Sorotan Utama Tengah)',
            badge: 'Kover Utama',
            badgeColor: 'bg-[#EAF5FF] text-[#0B63CE] border-[#BCE0FD]',
            description: 'Tampil paling depan di bagian tengah dengan ukuran paling besar dan efek kilau.',
            isPrimary: true,
        },
        {
            key: 'book_2',
            label: 'Buku 2 (Sisi Kanan)',
            badge: 'Latar Kanan',
            badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
            description: 'Tampil di sebelah kanan belakang dengan kemiringan rotasi 3D ke kanan.',
        },
    ];

    return (
        <AdminLayout title="Showcase Beranda — Gambar Hero 3D">
            <PageHeader
                title="Showcase Beranda"
                description="Kelola 3 gambar kover buku yang ditampilkan pada animasi floating 3D di halaman beranda portal publik."
                breadcrumbs={[{ label: 'Showcase Beranda' }]}
            >
                <div className="flex items-center gap-2.5">
                    <a
                        href="/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-[#BCE0FD] bg-white px-3.5 py-2 text-xs font-semibold text-[#0B63CE] shadow-xs transition-colors hover:bg-[#EAF5FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] sm:min-h-9"
                    >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Beranda</span>
                        <ExternalLink className="w-3 h-3 text-[#0B63CE]/60" />
                    </a>

                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        icon={RotateCcw}
                        onClick={() => setIsResetDialogOpen(true)}
                    >
                        Reset ke Default
                    </Button>
                </div>
            </PageHeader>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* ═══════════════════════════════════════════════════════════
                     1. LIVE 3D PREVIEW BANNER
                     ═══════════════════════════════════════════════════════════ */}
                <div className="bg-white rounded-xl border border-[#DCE7F3] p-6 sm:p-8 shadow-xs relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-6 border-b border-[#DCE7F3]">
                        <div>
                            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#0B63CE] uppercase tracking-wider mb-1">
                                <Sparkles className="w-3.5 h-3.5 text-[#EE9B25]" />
                                <span>Pratinjau Langsung Beranda (Live 3D Preview)</span>
                            </div>
                            <h2 className="text-lg font-bold text-[#0E2747]">
                                Tampilan Buku Hero Floating
                            </h2>
                            <p className="text-xs text-[#6B7C93] mt-0.5">
                                Pratinjau susunan 3 kover buku secara proporsional seperti yang akan dilihat pengunjung di halaman muka.
                            </p>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            icon={Save}
                            disabled={processing}
                        >
                            {processing ? 'Menyimpan…' : 'Simpan Perubahan'}
                        </Button>
                    </div>

                    {/* Interactive 3D Mock Showcase */}
                    <div className="pt-8 pb-4 flex items-center justify-center">
                        <div className="relative w-full max-w-md aspect-[16/11] flex items-center justify-center select-none">
                            {/* Ambient Lighting Glow */}
                            <div className="absolute inset-0 bg-radial from-[#0B63CE]/12 via-[#EAF5FF]/30 to-transparent blur-2xl -z-10 rounded-full scale-110 pointer-events-none" />

                            {/* Book 1 (Left Back) */}
                            <motion.div
                                className="absolute z-10 left-6 sm:left-10 top-6 w-28 sm:w-36 aspect-[1/1.42] rounded-r-md rounded-l-xs overflow-hidden shadow-xl border border-black/10 origin-bottom-left"
                                animate={{ y: [0, -8, 0], rotate: [-10, -8, -10] }}
                                transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/25 via-white/25 to-transparent z-10 pointer-events-none" />
                                <img
                                    src={previewImages.book_1}
                                    alt={data.book_1_title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-1.5 inset-x-1.5 bg-black/60 backdrop-blur-xs text-white text-[9px] px-1.5 py-0.5 rounded text-center truncate font-mono">
                                    Buku 1 (Kiri)
                                </div>
                            </motion.div>

                            {/* Book 2 (Right Back) */}
                            <motion.div
                                className="absolute z-15 right-6 sm:right-10 top-8 w-28 sm:w-36 aspect-[1/1.42] rounded-r-md rounded-l-xs overflow-hidden shadow-2xl border border-black/10 origin-bottom-right"
                                animate={{ y: [0, -10, 0], rotate: [11, 9, 11] }}
                                transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                            >
                                <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/25 via-white/25 to-transparent z-10 pointer-events-none" />
                                <img
                                    src={previewImages.book_2}
                                    alt={data.book_2_title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-1.5 inset-x-1.5 bg-black/60 backdrop-blur-xs text-white text-[9px] px-1.5 py-0.5 rounded text-center truncate font-mono">
                                    Buku 2 (Kanan)
                                </div>
                            </motion.div>

                            {/* Book 3 (Center Hero) */}
                            <motion.div
                                className="relative z-25 w-32 sm:w-44 aspect-[1/1.42] rounded-r-md rounded-l-xs overflow-hidden shadow-[0_22px_45px_-10px_rgba(14,39,71,0.4)] border border-black/15"
                                animate={{ y: [0, -7, 0], rotate: [-1, 1, -1] }}
                                transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
                            >
                                <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/30 via-white/30 to-transparent z-10 pointer-events-none" />
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/15 pointer-events-none z-10" />
                                <img
                                    src={previewImages.book_3}
                                    alt={data.book_3_title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-1.5 inset-x-1.5 bg-[#0B63CE]/90 text-white text-[10px] px-1.5 py-0.5 rounded text-center font-bold truncate">
                                    ⭐ Kover Utama (Tengah)
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════
                     2. THREE BOOK CONFIGURATION CARDS
                     ═══════════════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {bookConfigs.map((cfg) => {
                        const bookKey = cfg.key;
                        const currentImg = previewImages[bookKey];
                        const fileErr = errors[`${bookKey}_image_file`];
                        const titleErr = errors[`${bookKey}_title`];
                        const linkErr = errors[`${bookKey}_link`];

                        return (
                            <div
                                key={bookKey}
                                className={`bg-white rounded-xl border flex flex-col justify-between overflow-hidden shadow-xs transition-shadow hover:shadow-md ${
                                    cfg.isPrimary ? 'border-[#0B63CE]/40 ring-1 ring-[#0B63CE]/20' : 'border-[#DCE7F3]'
                                }`}
                            >
                                {/* Card Header */}
                                <div className="p-5 border-b border-[#DCE7F3] bg-gradient-to-b from-slate-50/70 to-transparent">
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${cfg.badgeColor}`}>
                                            {cfg.badge}
                                        </span>
                                        {cfg.isPrimary && (
                                            <span className="text-[11px] text-[#0B63CE] font-semibold flex items-center gap-1">
                                                <Sparkles className="w-3 h-3 text-[#EE9B25]" /> Prioritas Utama
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-[#0E2747] text-base leading-snug">
                                        {cfg.label}
                                    </h3>
                                    <p className="text-xs text-[#6B7C93] mt-1 leading-relaxed">
                                        {cfg.description}
                                    </p>
                                </div>

                                {/* Card Body: Image Preview & Upload Controls */}
                                <div className="p-5 space-y-4 flex-1">
                                    {/* Current Image & Upload Area */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-semibold text-[#112743]">
                                            Berkas Gambar Kover
                                        </label>
                                        <div className="flex items-center gap-4">
                                            {/* Thumbnail View */}
                                            <div className="w-20 h-28 rounded-md overflow-hidden border border-[#DCE7F3] shadow-xs bg-slate-100 shrink-0 relative group">
                                                <img
                                                    src={currentImg}
                                                    alt={data[`${bookKey}_title`]}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* File Picker Button & Specs */}
                                            <div className="space-y-2 flex-1 min-w-0">
                                                <label htmlFor={`${bookKey}-cover-file`} className="cursor-pointer inline-flex min-h-11 items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#0B63CE] bg-[#EAF5FF] hover:bg-[#BCE0FD]/50 border border-[#BCE0FD] transition-colors motion-reduce:transition-none w-full justify-center focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#0B63CE]">
                                                    <Upload className="w-3.5 h-3.5" />
                                                    <span>Unggah Gambar Baru</span>
                                                    <FileInput
                                                        id={`${bookKey}-cover-file`}
                                                        accept="image/jpeg,image/png,image/jpg,image/webp"
                                                        visuallyHidden
                                                        onChange={(e) => handleFileChange(bookKey, e.target.files?.[0])}
                                                    />
                                                </label>

                                                <p className="text-[11px] text-[#6B7C93] leading-tight">
                                                    Rasio 1:1.4 (cth: 600×850 px). JPG, PNG, atau WEBP. Maks 4MB.
                                                </p>

                                                {/* Quick Pick Toggle from Published Materials */}
                                                {available_materials.length > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedQuickPickTab(selectedQuickPickTab === bookKey ? null : bookKey)}
                                                        className="text-[11px] font-medium text-[#0B63CE] hover:underline flex items-center gap-1"
                                                    >
                                                        <BookOpen className="w-3 h-3" />
                                                        <span>Pilih dari Koleksi Terbit…</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {fileErr && <p className="text-xs text-rose-600 mt-1">{fileErr}</p>}
                                    </div>

                                    {/* Quick Pick Drawer Dropdown */}
                                    {selectedQuickPickTab === bookKey && (
                                        <div className="p-3 bg-[#F8FBFF] rounded-lg border border-[#BCE0FD] space-y-2 animate-in fade-in duration-150">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-bold text-[#0E2747]">
                                                    Pilih Kover Koleksi:
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedQuickPickTab(null)}
                                                    className="text-[10px] text-slate-400 hover:text-slate-600"
                                                >
                                                    Tutup ✕
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
                                                {available_materials.map((m) => (
                                                    <button
                                                        key={m.id}
                                                        type="button"
                                                        onClick={() => handleQuickPick(bookKey, m)}
                                                        className="aspect-[1/1.4] rounded border border-slate-200 overflow-hidden hover:border-[#0B63CE] hover:scale-105 transition-all relative group"
                                                        title={m.title}
                                                    >
                                                        <img src={m.cover_path} alt={m.title} className="w-full h-full object-cover" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Title / Alt Text */}
                                    <div className="space-y-1">
                                        <label className="block text-xs font-semibold text-[#112743]">
                                            Judul Buku / Alt Text
                                        </label>
                                        <Input
                                            value={data[`${bookKey}_title`]}
                                            onChange={(e) => setData(`${bookKey}_title`, e.target.value)}
                                            placeholder="Judul buku untuk deskripsi"
                                            className="text-xs"
                                        />
                                        {titleErr && <p className="text-xs text-rose-600 mt-0.5">{titleErr}</p>}
                                    </div>

                                    {/* Target Link */}
                                    <div className="space-y-1">
                                        <label className="block text-xs font-semibold text-[#112743]">
                                            Tautan Saat Diklik (Opsional)
                                        </label>
                                        <div className="relative">
                                            <Input
                                                value={data[`${bookKey}_link`]}
                                                onChange={(e) => setData(`${bookKey}_link`, e.target.value)}
                                                placeholder="/koleksi atau /koleksi/slug"
                                                className="text-xs pl-7"
                                            />
                                            <LinkIcon className="w-3.5 h-3.5 text-[#6B7C93] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                        {linkErr && <p className="text-xs text-rose-600 mt-0.5">{linkErr}</p>}
                                    </div>
                                </div>

                                {/* Card Footer note */}
                                <div className="px-5 py-3 bg-slate-50 border-t border-[#DCE7F3] text-[11px] text-[#6B7C93] flex items-center justify-between">
                                    <span className="truncate">URL aktif: {data[`${bookKey}_existing_image`]}</span>
                                    {data[`${bookKey}_image_file`] && (
                                        <span className="text-emerald-600 font-bold shrink-0 ml-2">✓ Baru Dipilih</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ═══════════════════════════════════════════════════════════
                     3. BOTTOM SUBMIT BAR
                     ═══════════════════════════════════════════════════════════ */}
                <div className="p-4 bg-white rounded-xl border border-[#DCE7F3] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-center gap-2 text-xs text-[#6B7C93]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Perubahan yang disimpan akan langsung tampak secara otomatis pada halaman depan portal.</span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <Button
                            type="button"
                            variant="secondary"
                            size="md"
                            icon={RotateCcw}
                            onClick={() => setIsResetDialogOpen(true)}
                        >
                            Reset ke Default
                        </Button>

                        <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            icon={Save}
                            disabled={processing}
                        >
                            {processing ? 'Menyimpan Perubahan…' : 'Simpan Semua Perubahan'}
                        </Button>
                    </div>
                </div>
            </form>

            {/* ═══════════════════════════════════════════════════════════
                 RESET CONFIRMATION DIALOG
                 ═══════════════════════════════════════════════════════════ */}
            <AlertDialog
                isOpen={isResetDialogOpen}
                onClose={() => setIsResetDialogOpen(false)}
                onConfirm={handleConfirmReset}
                title="Kembalikan ke Kover Bawaan?"
                description="Semua kover 3 buku pada showcase beranda akan dikembalikan ke gambar kover bawaan PERKEMI (cover-1.jpg, cover-2.jpg, cover-3.jpg)."
                confirmText="Ya, Kembalikan ke Default"
                cancelText="Batal"
                variant="danger"
            />
        </AdminLayout>
    );
}
