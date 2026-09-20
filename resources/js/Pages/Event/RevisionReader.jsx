import React from 'react';
import { Head } from '@inertiajs/react';
import FlipbookStage from '@/Components/portal/reader/FlipbookStage';

export default function RevisionReader({ title, subtitle, fileUrl, downloadUrl, backUrl }) {
    return (
        <>
            <Head title={`${title} — Pustaka Penataran PERKEMI`} />
            <FlipbookStage
                material={{ title, summary: subtitle }}
                hasFile
                fileUrl={fileUrl}
                downloadUrl={downloadUrl}
                canDownload
                backUrl={backUrl}
                allowBookmarks={false}
                documentLabel="makalah revisi"
            />
        </>
    );
}
