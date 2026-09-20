import React from 'react';
import { Link } from '@inertiajs/react';
import {
    BookOpen, User, Calendar, Tag, Download, ArrowLeft,
    Bookmark, BookmarkCheck, Trash2, Target, Users, Lightbulb,
} from 'lucide-react';

function Section({ title, children }) {
    return (
        <div className="py-3 border-b border-[#DCE7F3] last:border-b-0">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#6B7C93] mb-2">{title}</p>
            {children}
        </div>
    );
}

/**
 * FlipbookDetailPanel
 * Material detail, key points, learning objectives, bookmarks.
 * All metadata comes from admin input (no auto-generated summaries).
 */
export default function FlipbookDetailPanel({
    material = null,
    fileInfo = null,
    keyPoints = [],
    learningObjectives = [],
    targetAudiences = [],
    canDownload = false,
    downloadUrl = null,
    backUrl = '/koleksi',
    bookmarks = [],
    currentPage = 1,
    onSelectPage,
    onDeleteBookmark,
}) {
    const isCurrentBookmarked = bookmarks.some(b => b.page_number === currentPage);

    return (
        <div className="p-4 space-y-0">
            {/* Back link */}
            <Link
                href={backUrl}
                className="flex items-center gap-1.5 text-xs font-medium text-[#0B63CE] hover:text-[#0A3F82] mb-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE] rounded"
            >
                <ArrowLeft className="w-3 h-3" />
                Kembali ke Detail Materi
            </Link>

            {/* Cover + Title */}
            <Section title="Materi">
                <div className="flex gap-3">
                    {material?.cover_path ? (
                        <img
                            src={material.cover_path}
                            alt={material.title}
                            className="w-12 h-16 object-cover rounded-sm shadow-sm border border-[#DCE7F3] shrink-0"
                        />
                    ) : (
                        <div className="w-12 h-16 rounded-sm bg-[#EAF5FF] border border-[#DCE7F3] flex items-center justify-center shrink-0">
                            <BookOpen className="w-4 h-4 text-[#0B63CE]" />
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#0E2747] leading-snug mb-1">
                            {material?.title || 'Materi'}
                        </p>
                        {material?.author && (
                            <p className="text-xs text-[#6B7C93] flex items-center gap-1">
                                <User className="w-3 h-3 shrink-0" />
                                <span className="truncate">{material.author}</span>
                            </p>
                        )}
                        {material?.publication_year && (
                            <p className="text-xs text-[#6B7C93] flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3 shrink-0" />
                                {material.publication_year}
                            </p>
                        )}
                        {material?.category && (
                            <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#EAF5FF] text-[#0B63CE]">
                                <Tag className="w-2.5 h-2.5" />
                                {material.category.name}
                            </span>
                        )}
                    </div>
                </div>
            </Section>

            {/* Summary */}
            {material?.summary && (
                <Section title="Ringkasan">
                    <p className="text-xs text-[#6B7C93] leading-relaxed">{material.summary}</p>
                </Section>
            )}

            {/* Key Points — from admin metadata only */}
            {keyPoints?.length > 0 && (
                <Section title="Poin Penting">
                    <ul className="space-y-1.5">
                        {keyPoints.map((pt, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-[#112743]">
                                <Lightbulb className="w-3 h-3 shrink-0 mt-0.5 text-[#EE9B25]" />
                                <span className="leading-snug">{typeof pt === 'string' ? pt : pt.text || pt.point || JSON.stringify(pt)}</span>
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            {/* Learning Objectives */}
            {learningObjectives?.length > 0 && (
                <Section title="Tujuan Pembelajaran">
                    <ul className="space-y-1.5">
                        {learningObjectives.map((obj, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-[#112743]">
                                <Target className="w-3 h-3 shrink-0 mt-0.5 text-[#0B63CE]" />
                                <span className="leading-snug">{typeof obj === 'string' ? obj : obj.text || obj.objective || JSON.stringify(obj)}</span>
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            {/* Target Audiences */}
            {targetAudiences?.length > 0 && (
                <Section title="Sasaran Pembaca">
                    <div className="flex flex-wrap gap-1.5">
                        {targetAudiences.map((aud, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-[#0E2747]">
                                <Users className="w-2.5 h-2.5" />
                                {aud.name || aud}
                            </span>
                        ))}
                    </div>
                </Section>
            )}

            {/* Bookmarks */}
            {bookmarks.length > 0 && (
                <Section title={`Penanda Halaman (${bookmarks.length})`}>
                    <ul className="space-y-1.5">
                        {bookmarks.map(bm => (
                            <li key={bm.id} className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => onSelectPage?.(bm.page_number)}
                                    className="flex-1 flex items-center gap-2 text-left hover:bg-slate-50 rounded px-1.5 py-1 transition-colors"
                                >
                                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-[#EAF5FF] text-[#0B63CE] rounded">
                                        Hal.{bm.page_number}
                                    </span>
                                    <span className="text-xs text-[#112743] truncate">
                                        {bm.title || `Halaman ${bm.page_number}`}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDeleteBookmark?.(bm.id)}
                                    aria-label="Hapus penanda"
                                    className="w-6 h-6 flex items-center justify-center text-[#6B7C93] hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            {/* File info + Download */}
            <Section title="Berkas">
                <div className="space-y-2">
                    {fileInfo && (
                        <div className="text-xs text-[#6B7C93] space-y-0.5">
                            <p>{fileInfo.original_name}</p>
                            <p className="font-mono">{fileInfo.formatted_size} · v{fileInfo.version}</p>
                        </div>
                    )}
                    {canDownload && downloadUrl && (
                        <a
                            href={downloadUrl}
                            download
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B63CE] text-white text-xs font-semibold hover:bg-[#0A3F82] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE] focus-visible:ring-offset-1"
                        >
                            <Download className="w-3 h-3" />
                            Unduh PDF
                        </a>
                    )}
                </div>
            </Section>
        </div>
    );
}
