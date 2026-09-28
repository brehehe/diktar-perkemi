import { Link, useForm } from '@inertiajs/react';
import { FileText } from 'lucide-react';

export function LearningDocument({ title, document }) {
    return (
        <section aria-label={title} className="flex min-h-44 flex-col justify-between border border-[#DCE7F3] bg-[#F8FBFF] p-5">
            <div>
                <div className="flex items-center gap-2">
                    <FileText className="size-4 text-[#0B63CE]" aria-hidden="true" />
                    <h3 className="text-sm font-semibold text-[#0E2747]">{title}</h3>
                </div>
                {document?.download_url ? (
                    <div className="mt-3 space-y-1 text-sm leading-6 text-[#6B7C93]">
                        <p>{document.number ? `Nomor ${document.number}` : 'Nomor belum dicatat'}</p>
                        {document.issued_at && <p>Diterbitkan {document.issued_at}</p>}
                    </div>
                ) : (
                    <p className="mt-3 text-sm leading-6 text-[#6B7C93]">Belum tersedia. Penyelenggara akan menerbitkan berkas setelah proses penilaian selesai.</p>
                )}
            </div>
            {document?.download_url && (
                <a href={document.download_url} className="mt-4 inline-flex min-h-11 items-center justify-center bg-[#0B63CE] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0A3F82] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]">
                    Unduh {title} PDF
                </a>
            )}
        </section>
    );
}

export function RevisionPaperForm({ package: examPackage }) {
    const form = useForm({ paper: null });
    const canUpload = examPackage.revision_open && !['pending', 'accepted'].includes(examPackage.revision_status);

    const submit = (event) => {
        event.preventDefault();
        form.post(examPackage.revision_upload_url, { forceFormData: true, onSuccess: () => form.reset() });
    };

    return (
        <form onSubmit={submit} className="border-t border-[#DCE7F3] pt-4">
            <h5 className="text-sm font-bold text-[#0E2747]">Revisi makalah PDF</h5>
            {examPackage.revision_deadline && <p className="mt-1 text-xs text-[#6B7C93]">Batas unggah: {examPackage.revision_deadline}</p>}
            {examPackage.revision_status && <p className="mt-1 text-xs font-semibold text-[#0A3F82]">Status: {examPackage.revision_status === 'accepted' ? 'Diterima' : examPackage.revision_status === 'rejected' ? 'Perlu perbaikan' : 'Menunggu pemeriksaan'}</p>}
            {examPackage.revision_reader_url && <Link href={examPackage.revision_reader_url} className="mt-3 inline-flex min-h-11 items-center border border-[#0B63CE] px-4 text-sm font-semibold text-[#0A3F82] hover:bg-[#EAF5FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE]">Baca makalah sebagai flipbook</Link>}
            {canUpload && (
                <div className="mt-3 flex flex-wrap items-end gap-3">
                    <label className="block text-sm font-medium text-[#112743]">Pilih makalah PDF, maksimal 10 MB
                        <input type="file" accept="application/pdf" required onChange={(event) => form.setData('paper', event.target.files[0] || null)} className="mt-1 block w-full max-w-xs text-sm file:mr-3 file:min-h-11 file:border file:border-[#DCE7F3] file:bg-white file:px-3 file:text-[#0B63CE] focus-visible:outline-2 focus-visible:outline-[#0B63CE]" />
                    </label>
                    <button type="submit" disabled={form.processing || !form.data.paper} className="min-h-11 bg-[#0B63CE] px-4 text-sm font-semibold text-white hover:bg-[#0A3F82] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] disabled:cursor-not-allowed disabled:opacity-50">{form.processing ? 'Mengunggah…' : 'Kirim revisi'}</button>
                </div>
            )}
            {form.errors.paper && <p role="alert" className="mt-2 text-sm text-[#B42352]">{form.errors.paper}</p>}
            {!examPackage.revision_open && <p className="mt-2 text-sm text-[#6B7C93]">Batas unggah revisi telah berakhir.</p>}
        </form>
    );
}

export function ModuleResourceLink({ module }) {
    if (!module.resource_url) {
        return <span className="text-xs text-[#6B7C93]">{module.resource_locked ? 'Scan QR sesi untuk membuka materi' : 'Materi belum tersedia'}</span>;
    }

    const label = module.source_type === 'video' ? 'Tonton video' : module.source_type === 'uploaded_pdf' ? 'Buka PDF' : 'Buka materi';
    const className = 'inline-flex min-h-11 items-center justify-center bg-[#0B63CE] px-4 text-xs font-semibold text-white hover:bg-[#0A3F82] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]';

    return module.source_type === 'collection'
        ? <Link href={module.resource_url} className={className}>{label}</Link>
        : <a href={module.resource_url} target="_blank" rel="noopener noreferrer" className={className}>{label}</a>;
}
