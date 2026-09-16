import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { BookOpen, Play, RotateCcw, X } from 'lucide-react';
import FlipbookStage from '@/Components/portal/reader/FlipbookStage';

export default function Show({
    material,
    has_file = false,
    file_info = null,
    file_url = null,
    download_url = null,
    can_download = false,
    last_read_page = 1,
    bookmarks = [],
    table_of_contents = [],
    tableOfContents = [],
    key_points = [],
    keyPoints = [],
    learning_objectives = [],
    learningObjectives = [],
    target_audiences = [],
    targetAudiences = [],
    related_materials = [],
    back_url = null,
}) {
    // Normalize snake_case ↔ camelCase from Inertia props
    const effectiveToc       = table_of_contents?.length ? table_of_contents : tableOfContents;
    const effectiveKeyPoints = key_points?.length ? key_points : keyPoints;
    const effectiveObjectives = learning_objectives?.length ? learning_objectives : learningObjectives;
    const effectiveAudiences  = target_audiences?.length ? target_audiences : targetAudiences;

    // Resume from last position
    const [initialPage, setInitialPage] = useState(last_read_page > 1 ? last_read_page : 1);
    const [showResumeBanner, setShowResumeBanner] = useState(last_read_page > 1);

    const handleResume = () => {
        setInitialPage(last_read_page);
        setShowResumeBanner(false);
    };

    const handleStartFromBeginning = () => {
        setInitialPage(1);
        setShowResumeBanner(false);
    };

    return (
        <>
            <Head title={`Baca: ${material?.title || 'Buku Digital'} — Pustaka Penataran PERKEMI`} />

            {/* Resume Banner */}
            {showResumeBanner && (
                <div
                    role="alert"
                    aria-live="polite"
                    className="fixed bottom-14 sm:bottom-14 left-1/2 -translate-x-1/2 z-[60] w-[92%] max-w-lg bg-[#0E2747] text-white p-3.5 rounded-2xl shadow-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300"
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#0B63CE] flex items-center justify-center shrink-0">
                            <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold">
                                Terakhir membaca hingga{' '}
                                <span className="text-[#64B5F6]">Halaman {last_read_page}</span>
                            </p>
                            <p className="text-[11px] text-slate-300">Lanjutkan atau mulai dari awal?</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={handleStartFromBeginning}
                            className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1"
                        >
                            <RotateCcw className="w-3 h-3" />
                            Dari Awal
                        </button>
                        <button
                            type="button"
                            onClick={handleResume}
                            className="px-3 py-1.5 rounded-lg bg-[#0B63CE] hover:bg-[#0A3F82] text-xs font-semibold text-white transition-colors flex items-center gap-1"
                        >
                            <Play className="w-3 h-3 fill-current" />
                            Lanjutkan
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowResumeBanner(false)}
                            aria-label="Tutup notifikasi"
                            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Flipbook Reader */}
            <FlipbookStage
                key={initialPage}
                material={material}
                hasFile={has_file}
                fileInfo={file_info}
                fileUrl={file_url}
                downloadUrl={download_url}
                canDownload={can_download}
                lastReadPage={last_read_page}
                initialPage={initialPage}
                bookmarks={bookmarks}
                tableOfContents={effectiveToc}
                keyPoints={effectiveKeyPoints}
                learningObjectives={effectiveObjectives}
                targetAudiences={effectiveAudiences}
                backUrl={back_url}
            />
        </>
    );
}
