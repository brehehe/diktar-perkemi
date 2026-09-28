import { useState, useEffect } from 'react';
import { router, useForm } from '@inertiajs/react';
import Button from '../../../../Components/ui/Button';
import Badge from '../../../../Components/ui/Badge';
import Modal from '../../../../Components/ui/Modal';
import Input from '../../../../Components/ui/Input';
import FileInput from '../../../../Components/ui/FileInput';
import AlertDialog from '../../../../Components/ui/AlertDialog';
import { Award, FileText, Trash2, Eye, Sparkles } from 'lucide-react';

export default function ParticipantCredentialRow({ eventId, participant, onOpenPreview }) {
    const documentVariants = participant.document_variants?.length
        ? participant.document_variants
        : [{ ...participant, track_code: participant.track_code, label: participant.track_name }];

    return (
        <li className="px-4 py-5 [content-visibility:auto] [contain-intrinsic-size:auto_36rem] sm:px-6">
            <div className="grid gap-5 xl:grid-cols-[14rem_minmax(0,1fr)] xl:gap-8">
                <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3 xl:block">
                        <div>
                            <h3 className="break-words font-display text-lg font-semibold text-[#0E2747]">{participant.name}</h3>
                            <p className="mt-1 text-sm text-[#6B7C93]">{participant.kenshi_id && participant.kenshi_id !== '-' ? `NIK ${participant.kenshi_id}` : 'NIK belum dicatat'}</p>
                        </div>
                        <Badge variant="primary" className="shrink-0 xl:mt-3">{participant.track_code}</Badge>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-[#6B7C93]">{participant.track_name}</p>
                </div>

                <div className="space-y-5">
                    {documentVariants.map((variant) => (
                        <div key={variant.track_code}>
                            {documentVariants.length > 1 && (
                                <h4 className="mb-2 text-sm font-semibold text-[#0E2747]">Dokumen {variant.label}</h4>
                            )}
                            <div className="grid gap-4 lg:grid-cols-2">
                                <ParticipantDocumentUpload
                                    eventId={eventId}
                                    participant={participant}
                                    variant={variant}
                                    type="certificate"
                                    title="E-Sertifikat"
                                    description="Berkas pengukuhan peserta"
                                    icon={Award}
                                    number={variant.certificate_number}
                                    suggestedNumber={variant.suggested_certificate_number}
                                    configuredNumber={variant.configured_certificate_number}
                                    downloadUrl={variant.certificate_download_url}
                                    previewUrl={variant.certificate_preview_url}
                                    onOpenPreview={onOpenPreview}
                                />
                                <ParticipantDocumentUpload
                                    eventId={eventId}
                                    participant={participant}
                                    variant={variant}
                                    type="transcript"
                                    title="E-Transkrip"
                                    description="Rekap kompetensi dan JP"
                                    icon={FileText}
                                    number={variant.transcript_number}
                                    suggestedNumber={variant.suggested_transcript_number}
                                    configuredNumber={variant.configured_transcript_number}
                                    downloadUrl={variant.transcript_download_url}
                                    previewUrl={variant.transcript_preview_url}
                                    onOpenPreview={onOpenPreview}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </li>
    );
}

function ParticipantDocumentUpload({ eventId, participant, variant, type, title, description, icon: Icon, number, suggestedNumber, configuredNumber, downloadUrl, previewUrl, onOpenPreview }) {
    const isCertificate = type === 'certificate';
    const fileField = isCertificate ? 'certificate' : 'transcript';
    const numberField = isCertificate ? 'certificate_number' : 'transcript_number';
    const endpoint = isCertificate ? 'sertifikat' : 'transkrip';
    const canGenerate = isCertificate ? variant.can_generate_certificate : variant.can_generate_transcript;
    const generationUnavailableReason = isCertificate
        ? variant.certificate_generation_unavailable_reason
        : variant.transcript_generation_unavailable_reason;
    const documentId = `${type}-${participant.id}-${variant.track_code}`;
    const isLegacyDualPlaceholder = !downloadUrl && /^SK-PWA[DN]-/.test(number || '');
    const initialNumber = (isLegacyDualPlaceholder ? suggestedNumber : number) || suggestedNumber || '';
    const form = useForm({ [fileField]: null, [numberField]: initialNumber, document_track: variant.track_code });
    const generationForm = useForm({ [numberField]: initialNumber, document_track: variant.track_code });
    const [inputKey, setInputKey] = useState(0);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const nextNumber = (isLegacyDualPlaceholder ? suggestedNumber : number) || suggestedNumber || '';
        form.setData(numberField, nextNumber);
        generationForm.setData(numberField, nextNumber);
    }, [number, suggestedNumber, isLegacyDualPlaceholder, numberField]);

    const handleOpenPreview = () => {
        if (onOpenPreview) {
            onOpenPreview({
                title,
                participantName: participant.name,
                trackLabel: variant.label,
                number,
                downloadUrl,
                previewUrl,
            });
        } else {
            setIsPreviewOpen(true);
        }
    };

    const updateNumber = (value) => {
        form.setData(numberField, value);
        generationForm.setData(numberField, value);
        form.clearErrors(numberField);
        generationForm.clearErrors(numberField);
    };

    const submit = (event) => {
        event.preventDefault();
        form.post(`/admin/event/${eventId}/peserta/${participant.id}/${endpoint}`, {
            forceFormData: true,
            preserveScroll: true,
            onError: (errors) => {
                const invalidField = errors[fileField] ? documentId : `${documentId}-number`;
                requestAnimationFrame(() => document.getElementById(invalidField)?.focus());
            },
            onSuccess: () => {
                form.setData(fileField, null);
                setInputKey((current) => current + 1);
            },
        });
    };

    const generate = () => {
        generationForm.post(`/admin/event/${eventId}/peserta/${participant.id}/${endpoint}/generate`, {
            preserveScroll: true,
            onError: () => {
                requestAnimationFrame(() => document.getElementById(`${documentId}-number`)?.focus());
            },
        });
    };

    const deleteDocument = () => {
        router.delete(`/admin/event/${eventId}/peserta/${participant.id}/${endpoint}?document_track=${encodeURIComponent(variant.track_code)}`, {
            preserveScroll: true,
            onStart: () => setIsDeleting(true),
            onFinish: () => setIsDeleting(false),
            onSuccess: () => setDeleteOpen(false),
        });
    };

    return (
        <section aria-labelledby={`${documentId}-title`} className="border border-[#DCE7F3] bg-[#F8FBFF]/60 p-4">
            <div className="flex items-start justify-between gap-3 border-b border-[#DCE7F3] pb-3">
                <div className="flex min-w-0 items-start gap-3">
                    <span className={`flex size-9 shrink-0 items-center justify-center border bg-white ${isCertificate ? 'border-[#BCE0FD] text-[#0B63CE]' : 'border-[#DDD3FA] text-[#7957D5]'}`}>
                        <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <h5 id={`${documentId}-title`} className="text-sm font-semibold text-[#0E2747]">{title}</h5>
                        <p className="mt-0.5 text-xs text-[#6B7C93]">{description}</p>
                    </div>
                </div>
                <Badge variant={downloadUrl ? 'success' : 'draft'} dot>{downloadUrl ? 'Tersedia' : 'Belum ada'}</Badge>
            </div>

            <div className="py-3 text-xs">
                {downloadUrl ? (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[#6B7C93]">{number ? `Nomor ${number}` : 'Nomor belum dicatat'}</span>
                        <div className="flex flex-wrap items-center gap-4">
                            {previewUrl && (
                                <button
                                    type="button"
                                    onClick={handleOpenPreview}
                                    className="inline-flex min-h-11 items-center gap-1 font-semibold text-[#0B63CE] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] cursor-pointer"
                                >
                                    <Eye className="size-3.5" aria-hidden="true" /> Preview
                                </button>
                            )}
                            <a href={downloadUrl} className="inline-flex min-h-11 items-center font-semibold text-[#0B63CE] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]">Unduh PDF</a>
                            <button type="button" onClick={() => setDeleteOpen(true)} className="inline-flex min-h-11 items-center gap-1 font-semibold text-[#B42318] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B42318]">
                                <Trash2 className="size-3.5" aria-hidden="true" /> Hapus PDF
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="leading-5 text-[#6B7C93]">Buat dari template jalur atau unggah PDF final agar dapat diakses peserta.</p>
                )}
            </div>

            <form onSubmit={submit} className="grid gap-3 border-t border-[#DCE7F3] pt-3 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
                <div className="sm:col-span-2 lg:col-span-1 2xl:col-span-2">
                    <Input
                        id={`${documentId}-number`}
                        name={numberField}
                        autoComplete="off"
                        spellCheck={false}
                        label={`Nomor ${isCertificate ? 'sertifikat' : 'transkrip'}`}
                        value={form.data[numberField]}
                        onChange={(event) => updateNumber(event.target.value)}
                        error={form.errors[numberField] || generationForm.errors[numberField]}
                    />
                    <p className="mt-1 text-[11px] leading-4 text-[#6B7C93]">
                        Nomor sesuai pengaturan: <span className="font-semibold text-[#112743]">{configuredNumber || 'Belum tersedia'}</span>. {canGenerate ? 'Periksa sebelum menerbitkan.' : generationUnavailableReason || 'PDF otomatis belum tersedia; gunakan unggah manual.'}
                    </p>
                    {configuredNumber && form.data[numberField] !== configuredNumber && (
                        <button type="button" onClick={() => updateNumber(configuredNumber)} className="mt-2 min-h-11 text-xs font-semibold text-[#0B63CE] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]">Gunakan nomor sesuai pengaturan</button>
                    )}
                </div>
                <FileInput
                    key={inputKey}
                    id={documentId}
                    name={fileField}
                    label="Berkas PDF"
                    accept="application/pdf,.pdf"
                    required
                    helperText="PDF, maksimal 10 MB"
                    onChange={(event) => form.setData(fileField, event.target.files?.[0] || null)}
                    error={form.errors[fileField]}
                />
                <div className="flex flex-col gap-2 sm:self-end">
                    <Button
                        type="button"
                        variant="secondary"
                        icon={Sparkles}
                        loading={generationForm.processing}
                        disabled={!canGenerate || form.processing}
                        onClick={generate}
                    >
                        {downloadUrl ? 'Generate ulang' : 'Generate otomatis'}
                    </Button>
                    <Button type="submit" loading={form.processing} disabled={generationForm.processing}>
                        {downloadUrl ? `Ganti ${title}` : `Unggah ${title}`}
                    </Button>
                </div>
            </form>
            {isPreviewOpen && previewUrl && !onOpenPreview && (
                <Modal
                    isOpen
                    onClose={() => setIsPreviewOpen(false)}
                    title={`Preview ${title} ${participant.name}`}
                    description={`${variant.label} · Nomor ${number || 'belum dicatat'}`}
                    size="full"
                    footer={<a href={downloadUrl} className="inline-flex min-h-11 items-center font-semibold text-[#0B63CE] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]">Unduh PDF</a>}
                >
                    <iframe
                        src={previewUrl}
                        title={`${title} ${participant.name}`}
                        className="h-[calc(100dvh-13rem)] min-h-80 w-full border border-[#DCE7F3] bg-white"
                    />
                    <p className="mt-2 text-xs text-[#6B7C93]">Jika PDF tidak tampil di perangkat ini, gunakan tombol Unduh PDF.</p>
                </Modal>
            )}
            <AlertDialog
                isOpen={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={deleteDocument}
                title={`Hapus PDF ${title} ${participant.name}?`}
                description={`PDF akan dihapus dan tidak lagi bisa diunduh peserta. Nomor ${isCertificate ? 'sertifikat' : 'transkrip'} tetap tersimpan; Anda dapat mengunggah atau membuat ulang PDF.`}
                confirmText={isDeleting ? 'Menghapus...' : 'Hapus PDF'}
                variant="danger"
                loading={isDeleting}
            />
        </section>
    );
}
