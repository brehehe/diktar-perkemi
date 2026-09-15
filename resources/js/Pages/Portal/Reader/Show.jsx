import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { BookOpen, Play, RotateCcw, X } from 'lucide-react';
import BookReader from '@/Components/portal/reader/BookReader';

export default function Show({
    material,
    has_file = false,
    file_info = null,
    file_url = null,
    download_url = null,
    can_download = false,
    last_read_page = 1,
    bookmarks = [],
    tableOfContents = [],
    table_of_contents = [],
    keyPoints = [],
    key_points = [],
    learningObjectives = [],
    learning_objectives = [],
    targetAudiences = [],
    target_audiences = [],
    related_materials = [],
    back_url = null,
}) {
    // Normalize props (snake_case vs camelCase)
    const effectiveToc = table_of_contents?.length ? table_of_contents : tableOfContents;
    const effectiveKeyPoints = key_points?.length ? key_points : keyPoints;
    const effectiveObjectives = learning_objectives?.length ? learning_objectives : learningObjectives;
    const effectiveAudiences = target_audiences?.length ? target_audiences : targetAudiences;

    // Resume banner state
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

            {/* Resume Prompt Toast / Banner if previous progress exists */}
            {showResumeBanner && (
                <div
                    role="alert"
                    aria-live="polite"
                    className="fixed bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg bg-[#0E2747] text-white p-4 rounded-2xl shadow-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300"
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#0B63CE] text-white flex items-center justify-center shrink-0 shadow-sm">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">
                                Terakhir Anda membaca hingga <span className="text-[#64B5F6]">Halaman {last_read_page}</span>.
                            </p>
                            <p className="text-[11px] text-slate-300">
                                Apakah ingin melanjutkan atau mulai dari halaman pertama?
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                        <button
                            type="button"
                            onClick={handleStartFromBeginning}
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1"
                        >
                            <RotateCcw className="w-3 h-3" />
                            <span>Dari Awal</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleResume}
                            className="px-3.5 py-1.5 rounded-xl bg-[#0B63CE] hover:bg-[#0A3F82] text-xs font-semibold text-white shadow-sm transition-colors flex items-center gap-1"
                        >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Lanjutkan</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowResumeBanner(false)}
                            aria-label="Tutup notifikasi"
                            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Custom Interactive PDF Reader */}
            <BookReader
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
