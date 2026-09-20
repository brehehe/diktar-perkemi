import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import FlipbookThumbnailPanel from './FlipbookThumbnailPanel';
import FlipbookTOCPanel from './FlipbookTOCPanel';
import FlipbookDetailPanel from './FlipbookDetailPanel';

const PANEL_TITLES = {
    thumbnail: 'Thumbnail Halaman',
    toc: 'Daftar Isi',
    detail: 'Detail Materi',
};

/**
 * FlipbookDrawer
 * Slide-in panel from the left. Uses Framer Motion for the panel transition
 * (not the page flip — as per project constraint). Panels:
 * - 'thumbnail': lazy thumbnail grid
 * - 'toc': table of contents
 * - 'detail': material details
 */
export default function FlipbookDrawer({
    isOpen = false,
    panel = null,
    onClose,
    pdfDoc = null,
    currentPage = 1,
    totalPages = 1,
    tableOfContents = [],
    keyPoints = [],
    learningObjectives = [],
    targetAudiences = [],
    material = null,
    fileInfo = null,
    canDownload = false,
    downloadUrl = null,
    backUrl = '/koleksi',
    bookmarks = [],
    onSelectPage,
    onDeleteBookmark,
}) {
    const closeRef = useRef(null);

    // Focus trap: focus the close button when drawer opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => closeRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSelectPage = (page) => {
        const num = typeof page === "number" ? page : parseInt(page, 10);
        if (!isNaN(num) && num >= 1) {
            onSelectPage?.(num);
            onClose?.();
        }
    };

    return (
        <>
            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="drawer-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-[#0E2747]/20"
                        aria-hidden="true"
                    />
                )}
            </AnimatePresence>

            {/* Drawer panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.aside
                        key={`drawer-${panel}`}
                        initial={{ x: '-100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '-100%', opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 38 }}
                        className="fixed left-0 top-0 bottom-0 z-50 w-72 sm:w-80 bg-white border-r border-[#DCE7F3] shadow-xl flex flex-col"
                        role="dialog"
                        aria-modal="true"
                        aria-label={PANEL_TITLES[panel] || 'Panel'}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[#DCE7F3] shrink-0">
                            <h2 className="text-sm font-semibold text-[#0E2747]">
                                {PANEL_TITLES[panel] || 'Panel'}
                            </h2>
                            <button
                                ref={closeRef}
                                type="button"
                                onClick={onClose}
                                aria-label="Tutup panel"
                                className="w-7 h-7 flex items-center justify-center rounded-md text-[#6B7C93] hover:text-[#0E2747] hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE]"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Panel content */}
                        <div className="flex-1 overflow-y-auto">
                            {panel === 'thumbnail' && (
                                <FlipbookThumbnailPanel
                                    pdfDoc={pdfDoc}
                                    totalPages={totalPages}
                                    currentPage={currentPage}
                                    onSelectPage={handleSelectPage}
                                />
                            )}
                            {panel === 'toc' && (
                                <FlipbookTOCPanel
                                    items={tableOfContents}
                                    currentPage={currentPage}
                                    onSelectPage={handleSelectPage}
                                />
                            )}
                            {panel === 'detail' && (
                                <FlipbookDetailPanel
                                    material={material}
                                    fileInfo={fileInfo}
                                    keyPoints={keyPoints}
                                    learningObjectives={learningObjectives}
                                    targetAudiences={targetAudiences}
                                    canDownload={canDownload}
                                    downloadUrl={downloadUrl}
                                    backUrl={backUrl}
                                    bookmarks={bookmarks}
                                    currentPage={currentPage}
                                    onSelectPage={handleSelectPage}
                                    onDeleteBookmark={onDeleteBookmark}
                                />
                            )}
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    );
}
