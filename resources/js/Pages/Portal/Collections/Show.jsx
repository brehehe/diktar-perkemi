import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import PortalLayout from '../../../Layouts/PortalLayout';
import CollectionGrid from '../../../Components/portal/CollectionGrid';
import CollectionMeta from '../../../Components/portal/CollectionMeta';
import MaterialSourceBadge from '../../../Components/portal/MaterialSourceBadge';
import VideoPlayer from '../../../Components/portal/VideoPlayer';
import VideoMeta from '../../../Components/portal/VideoMeta';
import ExternalMaterialViewer from '../../../Components/portal/ExternalMaterialViewer';
import Button from '../../../Components/ui/Button';
import {
    BookOpen,
    ChevronRight,
    Home,
    User,
    Calendar,
    Download,
    Lock,
    LogIn,
    ShieldAlert,
    ArrowLeft,
    Sparkles,
    Play,
    ExternalLink,
    Video,
    Globe,
} from 'lucide-react';

export default function Show({
    material,
    can_read = true,
    can_download = false,
    reader_url = null,
    download_url = null,
    related_materials = [],
}) {
    const { props } = usePage();
    const user = props.auth?.user;

    const readUrl = reader_url || `/koleksi/${material.slug}/baca`;

    return (
        <PortalLayout title={`${material.title} — Detail Dokumen Digital`}>
            {/* Breadcrumb Strip */}
            <div className="bg-white border-b border-[#DCE7F3]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex items-center gap-1.5 text-xs text-[#6B7C93]" aria-label="Breadcrumb">
                        <Link href="/" className="hover:text-[#0B63CE] transition-colors flex items-center gap-1 font-medium">
                            <Home className="w-3.5 h-3.5" />
                            <span>Beranda</span>
                        </Link>
                        <ChevronRight className="w-3 h-3 text-[#DCE7F3]" />
                        <Link href="/koleksi" className="hover:text-[#0B63CE] transition-colors font-medium">
                            Koleksi Digital
                        </Link>
                        <ChevronRight className="w-3 h-3 text-[#DCE7F3]" />
                        {material.category && (
                            <>
                                <Link
                                    href={`/kategori/${material.category.slug}`}
                                    className="hover:text-[#0B63CE] transition-colors font-medium"
                                >
                                    {material.category.name}
                                </Link>
                                <ChevronRight className="w-3 h-3 text-[#DCE7F3]" />
                            </>
                        )}
                        <span className="font-semibold text-[#112743] truncate max-w-[200px] sm:max-w-sm">
                            {material.title}
                        </span>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* LEFT: Cover & Actions (4 cols) */}
                    <div className="lg:col-span-4 space-y-5">
                        {/* Cover Card with tactile book styling */}
                        <div className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-[#0B63CE] via-[#20A47A] to-[#7957D5]" />

                            <div className="p-7 flex flex-col items-center text-center space-y-6">
                                {/* Book Cover with physical book spine */}
                                <div
                                    className="w-48 h-[272px] sm:w-52 sm:h-[296px] rounded-lg bg-[#EAF5FF] border border-[#DCE7F3] overflow-hidden relative group"
                                    style={{
                                        boxShadow: '6px 10px 28px rgba(11,99,206,0.16), 2px 2px 0 rgba(255,255,255,0.9)',
                                    }}
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/25 via-transparent to-black/5 z-10 pointer-events-none" />
                                    {material.cover_path ? (
                                        <img
                                            src={material.cover_path}
                                            alt={material.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full p-5 flex flex-col justify-between bg-gradient-to-b from-[#EAF5FF] to-white text-center">
                                            <div className="mt-4">
                                                {material.source_type === 'video' ? (
                                                    <div className="w-14 h-14 rounded-2xl bg-[#F3EDFF] text-[#7957D5] border border-[#D0BFFF] flex items-center justify-center mx-auto shadow-xs">
                                                        <Play className="w-7 h-7 fill-current ml-0.5" />
                                                    </div>
                                                ) : material.source_type === 'external_link' ? (
                                                    <div className="w-14 h-14 rounded-2xl bg-[#FFF3E6] text-[#EE9B25] border border-[#FFD8A8] flex items-center justify-center mx-auto shadow-xs">
                                                        <ExternalLink className="w-7 h-7" />
                                                    </div>
                                                ) : (
                                                    <div className="w-14 h-14 rounded-2xl bg-[#EAF5FF] text-[#0B63CE] border border-[#BCE0FD] flex items-center justify-center mx-auto shadow-xs">
                                                        <BookOpen className="w-7 h-7" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <span className="font-serif text-sm font-bold text-[#0E2747] line-clamp-3 leading-snug block">
                                                    {material.title}
                                                </span>
                                                <span className="text-[10px] font-bold text-[#0B63CE] uppercase tracking-widest block">
                                                    PERKEMI
                                                </span>
                                            </div>
                                            <span className="font-mono text-xs text-[#6B7C93]">
                                                {material.code || 'MODUL RESMI'}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Access & Action */}
                                <div className="w-full space-y-3">
                                    {material.source_type === 'video' ? (
                                        <a
                                            href="#video-player-section"
                                            className="block w-full"
                                            onClick={(e) => {
                                                const el = document.getElementById('video-player-section');
                                                if (el) {
                                                    e.preventDefault();
                                                    el.scrollIntoView({ behavior: 'smooth' });
                                                }
                                            }}
                                        >
                                            <Button
                                                variant="primary"
                                                size="lg"
                                                icon={Play}
                                                className="w-full justify-center"
                                            >
                                                Tonton Video
                                            </Button>
                                        </a>
                                    ) : material.source_type === 'external_link' ? (
                                        material.external_open_mode === 'embed' ? (
                                            <div className="space-y-2 w-full">
                                                <a
                                                    href="#external-viewer-section"
                                                    className="block w-full"
                                                    onClick={(e) => {
                                                        const el = document.getElementById('external-viewer-section');
                                                        if (el) {
                                                            e.preventDefault();
                                                            el.scrollIntoView({ behavior: 'smooth' });
                                                        }
                                                    }}
                                                >
                                                    <Button
                                                        variant="primary"
                                                        size="lg"
                                                        icon={BookOpen}
                                                        className="w-full justify-center"
                                                    >
                                                        Baca di Portal
                                                    </Button>
                                                </a>
                                                <a
                                                    href={material.external_url || '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block w-full"
                                                >
                                                    <Button
                                                        variant="secondary"
                                                        size="md"
                                                        icon={ExternalLink}
                                                        className="w-full justify-center"
                                                    >
                                                        Buka Buku di Tab Baru
                                                    </Button>
                                                </a>
                                            </div>
                                        ) : (
                                            <a
                                                href={material.external_url || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block w-full"
                                            >
                                                <Button
                                                    variant="primary"
                                                    size="lg"
                                                    icon={ExternalLink}
                                                    className="w-full justify-center"
                                                >
                                                    Buka Buku Digital
                                                </Button>
                                            </a>
                                        )
                                    ) : can_read ? (
                                        <Link
                                            href={readUrl}
                                            className="block w-full"
                                        >
                                            <Button
                                                variant="primary"
                                                size="lg"
                                                icon={BookOpen}
                                                className="w-full justify-center"
                                            >
                                                Baca E-Book (Flipbook)
                                            </Button>
                                        </Link>
                                    ) : !user ? (
                                        <div className="p-4 bg-[#FFF3E6] border border-[#FFD8A8] rounded-xl text-left space-y-2.5">
                                            <div className="flex items-center gap-2 text-[#EE9B25] font-bold text-xs">
                                                <Lock className="w-4 h-4 text-[#EE9B25]" />
                                                <span className="text-[#112743]">Memerlukan Akun Kenshi</span>
                                            </div>
                                            <p className="text-xs text-[#6B7C93] leading-relaxed">
                                                Materi ini diperuntukkan bagi kenshi dengan hak akses resmi. Silakan masuk ke akun Anda untuk membaca.
                                            </p>
                                            <Link href="/login" className="block">
                                                <Button variant="primary" size="sm" icon={LogIn} className="w-full justify-center">
                                                    Masuk Portal
                                                </Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-[#FDE8EF] border border-[#F8B4C4] rounded-xl text-left space-y-2.5">
                                            <div className="flex items-center gap-2 text-[#DD4D7C] font-bold text-xs">
                                                <ShieldAlert className="w-4 h-4 text-[#DD4D7C]" />
                                                <span className="text-[#112743]">Hak Akses Terbatas</span>
                                            </div>
                                            <p className="text-xs text-[#6B7C93] leading-relaxed">
                                                Akun Anda (<strong className="text-[#112743]">{user.role}</strong>) belum memiliki hak akses membaca materi ini. Silakan hubungi administrator PB PERKEMI.
                                            </p>
                                        </div>
                                    )}

                                    {can_download && download_url && material.source_type === 'uploaded_pdf' && (
                                        <a href={download_url} download className="block w-full">
                                            <Button variant="secondary" size="md" icon={Download} className="w-full justify-center">
                                                Unduh Dokumen PDF
                                            </Button>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Back to catalog */}
                        <Link
                            href="/koleksi"
                            className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B7C93] hover:text-[#0B63CE] transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Kembali ke Katalog Koleksi</span>
                        </Link>
                    </div>

                    {/* RIGHT: Content (8 cols) */}
                    <div className="lg:col-span-8 space-y-7">
                        {/* Title & Header Badges */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 flex-wrap">
                                <MaterialSourceBadge sourceType={material.source_type} />
                                {material.category && (
                                    <Link
                                        href={`/kategori/${material.category.slug}`}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF5FF] text-[#0B63CE] border border-[#0B63CE]/20 hover:bg-[#D5EBFF] transition-colors"
                                    >
                                        <span
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: material.category.color || '#0B63CE' }}
                                        />
                                        {material.category.name}
                                    </Link>
                                )}
                                <span className="font-mono text-xs text-[#0A3F82] bg-[#F8FBFF] border border-[#DCE7F3] px-2.5 py-1 rounded-full">
                                    {material.code || 'DOC-01'}
                                </span>
                                <span className="text-xs font-medium text-[#6B7C93]">
                                    {material.type_label}
                                </span>
                            </div>

                            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#0E2747] leading-tight">
                                {material.title}
                            </h1>

                            <div className="flex items-center gap-3 text-sm text-[#6B7C93] flex-wrap">
                                <span className="flex items-center gap-1.5">
                                    <User className="w-4 h-4 text-[#6B7C93]" />
                                    <span className="font-medium text-[#112743]">{material.author}</span>
                                </span>
                                <span className="text-[#DCE7F3]">•</span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-[#6B7C93]" />
                                    <span>Tahun {material.publication_year || '—'}</span>
                                </span>
                                {material.page_count && material.source_type === 'uploaded_pdf' && (
                                    <>
                                        <span className="text-[#DCE7F3]">•</span>
                                        <span>{material.page_count} Halaman</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Video Player (if video) */}
                        {material.source_type === 'video' && (
                            <div id="video-player-section" className="scroll-mt-6">
                                <VideoPlayer
                                    embedUrl={material.embed_url}
                                    title={material.title}
                                    provider={material.video_provider}
                                />
                            </div>
                        )}

                        {/* External Viewer (if external link) */}
                        {material.source_type === 'external_link' && (
                            <div id="external-viewer-section" className="scroll-mt-6">
                                <ExternalMaterialViewer
                                    url={material.embed_url || material.external_url}
                                    externalUrl={material.external_url}
                                    sourceName={material.external_source_name}
                                    openMode={material.external_open_mode}
                                    title={material.title}
                                />
                            </div>
                        )}

                        {/* Summary Block */}
                        {material.summary && (
                            <div className="bg-white rounded-xl border border-[#DCE7F3] p-6 shadow-xs space-y-2">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6B7C93]">
                                    {material.source_type === 'video' ? 'Ringkasan Video' : 'Ringkasan Materi'}
                                </h3>
                                <p className="text-sm text-[#112743] leading-relaxed">
                                    {material.summary}
                                </p>
                            </div>
                        )}

                        {/* Video Meta (Key points & learning objectives for video) */}
                        {material.source_type === 'video' && (
                            <VideoMeta material={material} />
                        )}

                        {/* Description / Full Syllabus */}
                        {material.description && (
                            <div className="bg-white rounded-xl border border-[#DCE7F3] p-6 shadow-xs space-y-2">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6B7C93]">
                                    Deskripsi Kurikulum & Silabus
                                </h3>
                                <div className="text-sm text-[#4A6482] leading-relaxed whitespace-pre-line">
                                    {material.description}
                                </div>
                            </div>
                        )}

                        {/* CollectionMeta Component */}
                        <CollectionMeta material={material} />
                    </div>
                </div>

                {/* Related Materials Section */}
                {related_materials && related_materials.length > 0 && (
                    <div className="pt-8 border-t-2 border-[#DCE7F3] space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-[11px] font-bold text-[#0B63CE] uppercase tracking-[0.12em] font-mono flex items-center gap-1">
                                    <Sparkles className="w-3.5 h-3.5 text-[#EE9B25]" />
                                    Koleksi Relevan
                                </span>
                                <h3 className="font-serif text-2xl font-bold text-[#0E2747] mt-1">
                                    Materi Terkait dalam Kategori Ini
                                </h3>
                            </div>
                            <Link
                                href="/koleksi"
                                className="text-xs font-semibold text-[#0B63CE] hover:text-[#0A3F82] flex items-center gap-1 transition-colors group"
                            >
                                <span>Lihat Seluruh Koleksi</span>
                                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>

                        <CollectionGrid materials={related_materials} columns="grid-cols-1 sm:grid-cols-3" />
                    </div>
                )}
            </div>
        </PortalLayout>
    );
}
