import Select from '../../../../Components/ui/Select';
import { Link, router } from '@inertiajs/react';
import Button from '../../../../Components/ui/Button';
import Input from '../../../../Components/ui/Input';
import Checkbox from '../../../../Components/ui/Checkbox';
import FileInput from '../../../../Components/ui/FileInput';
import { Edit3, Award, FileText, Trash2, Search, Filter, Sparkles, Printer, RotateCcw, Save, Download, Upload, FileBadge } from 'lucide-react';
import ParticipantCredentialRow from './ParticipantCredentialRow';
import { useEventShow } from './EventShowContext';

export default function EventCertificatesTab() {
    const {
        event,
        participants,
        stats,
        documentNumberLabels,
        documentNumberDefaults,
        certificateSignatureSettings,
        certificateSignatureDefaults,
        isPortalAdmin,
        credentialSearch,
        setCredentialSearch,
        batchPrintTrack,
        setBatchPrintTrack,
        isGeneratingDocuments,
        setIsGeneratingDocuments,
        documentNumberForm,
        signatureForm,
        signatureMode,
        setSignatureMode,
        signaturePreview,
        setSignaturePreview,
        isDeletingSignature,
        signatureCanvasRef,
        hasDrawnSig,
        startDrawingSig,
        drawSig,
        stopDrawingSig,
        clearSignatureCanvas,
        autoGenerateSignature,
        handleSignatureSubmit,
        handleDeleteSignature,
        setActiveDocumentPreview,
        credentialParticipants,
        batchPrintTrackOptions,
    } = useEventShow();

    return (
        <section aria-labelledby="certificate-heading" className="space-y-6">
            <div className="grid gap-5 border-b border-[#DCE7F3] pb-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.65fr)] lg:items-end">
                <div className="max-w-3xl">
                    <div className="mb-3 flex items-center gap-3 text-sm font-semibold text-[#0B63CE]">
                        <span className="h-px w-8 bg-[#0B63CE]" aria-hidden="true" />
                        Dokumen kelulusan peserta
                    </div>
                    <h2 id="certificate-heading" className="text-balance font-display text-2xl font-semibold text-[#0A3F82] sm:text-3xl">E-Sertifikat & E-Transkrip</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6B7C93]">Kelola PDF final per peserta. Sertifikat memuat pengukuhan, sedangkan transkrip memuat rekap kompetensi dan beban JP. Seluruh berkas disimpan privat.</p>
                    <p className="mt-3 max-w-2xl border-l-2 border-[#0B63CE] bg-[#EAF5FF] px-3 py-2 text-xs leading-5 text-[#112743]">Atur nomor surat dan informasi penandatangan (TTD) event. Tempat/tanggal lahir otomatis diambil dari data peserta, dan masa berlaku sertifikat dihitung 3 tahun dari tanggal generate/terbit. Nomor dokumen diurutkan otomatis per jalur; preview dokumen tersedia setelah dibuat.</p>
                </div>
                <div className="grid grid-cols-2 border border-[#DCE7F3] bg-white" aria-label="Panduan format dokumen">
                    <div className="border-r border-[#DCE7F3] p-4">
                        <Award className="size-5 text-[#0B63CE]" aria-hidden="true" />
                        <p className="mt-3 text-sm font-semibold text-[#0E2747]">E-Sertifikat</p>
                        <p className="mt-1 text-xs leading-5 text-[#6B7C93]">Pengukuhan, identitas, dan masa berlaku.</p>
                    </div>
                    <div className="p-4">
                        <FileText className="size-5 text-[#7957D5]" aria-hidden="true" />
                        <p className="mt-3 text-sm font-semibold text-[#0E2747]">E-Transkrip</p>
                        <p className="mt-1 text-xs leading-5 text-[#6B7C93]">Modul, fokus kompetensi, dan total JP.</p>
                    </div>
                </div>
            </div>

            {/* Pengaturan Penandatangan (TTD) & Tanggal Sertifikat */}
            <details className="group border border-[#DCE7F3] bg-white">
                <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 p-4 font-semibold text-[#0E2747] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] sm:px-5">
                    <div className="flex items-center gap-2">
                        <Edit3 className="size-4 text-[#0B63CE]" aria-hidden="true" />
                        <span>Pengaturan TTD & Tanggal Sertifikat</span>
                    </div>
                    <span className="text-xs font-normal text-[#6B7C93]">Kota, Tanggal Terbit, Organisasi, Jabatan, Nama & TTD Digital</span>
                </summary>
                <form onSubmit={handleSignatureSubmit} className="border-t border-[#DCE7F3] p-4 sm:p-5">
                    <p className="max-w-3xl text-sm leading-6 text-[#6B7C93]">
                        Atur informasi penandatangan pada bagian kanan bawah e-sertifikat. Tanggal generate menentukan tanggal terbit sertifikat dan masa berlaku 3 tahun. Unggah gambar TTD digital (disarankan PNG transparan) untuk disematkan otomatis pada sertifikat.
                    </p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Input
                            id="sig-city"
                            label="Kota"
                            value={signatureForm.data.city}
                            onChange={(e) => signatureForm.setData('city', e.target.value)}
                            placeholder={certificateSignatureDefaults.city || 'Jakarta'}
                            error={signatureForm.errors.city}
                        />
                        <Input
                            id="sig-date"
                            label="Tanggal Generate / Terbit"
                            type="date"
                            value={signatureForm.data.date}
                            onChange={(e) => signatureForm.setData('date', e.target.value)}
                            helperText="Tanggal surat & acuan masa berlaku 3 tahun"
                            error={signatureForm.errors.date}
                        />
                        <Input
                            id="sig-org"
                            label="Organisasi"
                            value={signatureForm.data.organization}
                            onChange={(e) => signatureForm.setData('organization', e.target.value)}
                            placeholder={certificateSignatureDefaults.organization || 'Pengurus Besar PERKEMI'}
                            error={signatureForm.errors.organization}
                        />
                        <Input
                            id="sig-pos"
                            label="Jabatan"
                            value={signatureForm.data.position}
                            onChange={(e) => signatureForm.setData('position', e.target.value)}
                            placeholder={certificateSignatureDefaults.position || 'Ketua Umum,'}
                            error={signatureForm.errors.position}
                        />
                        <div className="sm:col-span-2">
                            <Input
                                id="sig-name"
                                label="Nama Penandatangan"
                                value={signatureForm.data.signer_name}
                                onChange={(e) => signatureForm.setData('signer_name', e.target.value)}
                                placeholder={certificateSignatureDefaults.signer_name || 'Laksdya TNI (Purn) Prof. Dr. Agus Setiadji, S.A.P., M.A.'}
                                error={signatureForm.errors.signer_name}
                            />
                        </div>
                    </div>

                    <div className="mt-4 border border-[#DCE7F3] bg-[#F8FBFF] p-4">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[#112743]">
                                Tanda Tangan Digital (TTD)
                            </label>
                            <div className="inline-flex rounded-md border border-[#DCE7F3] bg-white p-0.5 shadow-2xs">
                                <button
                                    type="button"
                                    onClick={() => setSignatureMode('draw')}
                                    className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                                        signatureMode === 'draw'
                                            ? 'bg-[#0B63CE] text-white shadow-2xs'
                                            : 'text-[#596F88] hover:text-[#112743]'
                                    }`}
                                >
                                    <Edit3 className="size-3.5" aria-hidden="true" />
                                    TTD Langsung (Layar)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSignatureMode('upload')}
                                    className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                                        signatureMode === 'upload'
                                            ? 'bg-[#0B63CE] text-white shadow-2xs'
                                            : 'text-[#596F88] hover:text-[#112743]'
                                    }`}
                                >
                                    <Upload className="size-3.5" aria-hidden="true" />
                                    Upload File Gambar
                                </button>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_16rem] sm:items-start">
                            {signatureMode === 'draw' ? (
                                <div>
                                    <div className="relative">
                                        <canvas
                                            ref={signatureCanvasRef}
                                            width={480}
                                            height={130}
                                            onMouseDown={startDrawingSig}
                                            onMouseMove={drawSig}
                                            onMouseUp={stopDrawingSig}
                                            onMouseLeave={stopDrawingSig}
                                            onTouchStart={startDrawingSig}
                                            onTouchMove={drawSig}
                                            onTouchEnd={stopDrawingSig}
                                            className="w-full touch-none rounded border-2 border-dashed border-[#BCE0FD] bg-white cursor-crosshair shadow-inner"
                                            style={{ height: '130px' }}
                                        />
                                        {!hasDrawnSig && !signatureForm.data.signature_data && (
                                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-[#9AA8BC]">
                                                Gores tanda tangan langsung di sini atau klik Generate
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={clearSignatureCanvas}
                                                className="inline-flex items-center gap-1 rounded border border-[#DCE7F3] bg-white px-2.5 py-1 text-xs font-medium text-[#112743] hover:bg-[#F4F8FD]"
                                            >
                                                <RotateCcw className="size-3 text-[#6B7C93]" aria-hidden="true" />
                                                Bersihkan Canvas
                                            </button>
                                            <button
                                                type="button"
                                                onClick={autoGenerateSignature}
                                                className="inline-flex items-center gap-1 rounded border border-[#BCE0FD] bg-[#F0F6FE] px-2.5 py-1 text-xs font-medium text-[#0B63CE] hover:bg-[#E1EFFE]"
                                            >
                                                <Sparkles className="size-3" aria-hidden="true" />
                                                Generate dari Nama
                                            </button>
                                        </div>
                                        <span className="text-[11px] text-[#6B7C93]">Disimpan transparan</span>
                                    </div>
                                    {signatureForm.errors.signature_data && (
                                        <p className="mt-1 text-xs text-[#DD4D7C]">{signatureForm.errors.signature_data}</p>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <FileInput
                                        id="sig-image"
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            signatureForm.setData('signature_image', file);
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (ev) => setSignaturePreview(ev.target.result);
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        error={signatureForm.errors.signature_image}
                                        helperText="Format PNG transparan disarankan. Maksimal 2MB."
                                    />
                                    <p className="mt-2 text-xs text-[#6B7C93]">
                                        TTD digital akan disematkan di antara Jabatan dan Nama Penandatangan pada sertifikat peserta.
                                    </p>
                                </div>
                            )}

                            {signaturePreview ? (
                                <div className="rounded-lg border border-[#DCE7F3] bg-white p-3 text-center shadow-xs">
                                    <p className="mb-2 text-xs font-semibold text-[#0E2747]">Pratinjau TTD Digital</p>
                                    <div className="flex h-24 items-center justify-center rounded border border-dashed border-[#BCE0FD] bg-[repeating-conic-gradient(#f0f4f8_0%_25%,#ffffff_0%_50%)] bg-[length:16px_16px] p-2">
                                        <img
                                            src={signaturePreview}
                                            alt="Pratinjau TTD"
                                            className="max-h-full max-w-full object-contain"
                                        />
                                    </div>
                                    <div className="mt-2 flex flex-col items-center gap-1">
                                        <span className="text-[11px] font-medium text-[#28A745]">✓ Siap disematkan</span>
                                        {certificateSignatureSettings.signature_path && (
                                            <button
                                                type="button"
                                                onClick={handleDeleteSignature}
                                                disabled={isDeletingSignature}
                                                className="inline-flex items-center gap-1 text-xs text-[#DD4D7C] hover:underline"
                                            >
                                                <Trash2 className="size-3" aria-hidden="true" />
                                                {isDeletingSignature ? 'Menghapus...' : 'Hapus TTD Tersimpan'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-[#DCE7F3] bg-white p-4 text-center text-xs text-[#6B7C93]">
                                    Belum ada TTD digital. Buat langsung atau unggah file.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-[#DCE7F3] pt-4">
                        <Button type="submit" icon={Save} loading={signatureForm.processing}>
                            Simpan Pengaturan TTD
                        </Button>
                    </div>
                </form>
            </details>

            <details className="group border border-[#DCE7F3] bg-white">
                <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 p-4 font-semibold text-[#0E2747] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] sm:px-5">
                    <div className="flex items-center gap-2">
                        <FileBadge className="size-4 text-[#0B63CE]" />
                        <span>Pengaturan nomor surat event (Sertifikat & E-Transkrip)</span>
                    </div>
                    <span className="text-xs font-normal text-[#6B7C93]">Kosong = default Admin</span>
                </summary>
                <form onSubmit={(submitEvent) => { submitEvent.preventDefault(); documentNumberForm.put(`/admin/event/${event.id}/nomor-dokumen`, { preserveScroll: true }); }} className="border-t border-[#DCE7F3]">
                    <div className="p-4 sm:p-5 border-b border-[#DCE7F3] bg-[#F8FBFF]">
                        <p className="max-w-3xl text-sm leading-6 text-[#425973]">
                            Atur kode surat dan nomor awal per jalur peserta. Nomor surat ini digunakan sama persis untuk <strong>Sertifikat</strong> dan <strong>E-Transkrip</strong> peserta tanpa tambahan TR-. Nomor urut otomatis diformat sesuai nomor awal (contoh: <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[#0B63CE] border border-[#DCE7F3]">051/PGJ-DRH/IX/2026</code>). Saat disimpan, nomor seluruh peserta dan berkas PDF sertifikat & transkrip akan otomatis disinkronkan.
                        </p>
                    </div>

                    <div className="p-4 sm:p-5">
                        <div className="mb-3 flex items-center justify-between">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B7C93]">Pengaturan Nomor Sertifikat Per Jalur</h4>
                            <span className="text-xs text-[#6B7C93]">Format: <strong className="font-mono text-[#0E2747]">001/[KODE]/IX/2026</strong> (panjang digit mengikuti nomor awal, misal 056 atau 0056)</span>
                        </div>
                        <div className="grid gap-4 lg:grid-cols-2">
                            {Object.entries(documentNumberLabels).map(([trackCode, label]) => (
                                <fieldset key={trackCode} className="min-w-0 border border-[#DCE7F3] bg-[#F8FBFF] p-4 rounded-lg">
                                    <legend className="px-1 text-sm font-semibold text-[#0E2747]">{label} ({trackCode})</legend>
                                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_9rem]">
                                        <Input
                                            id={`event-cert-${trackCode}-prefix`}
                                            label="Kode surat sertifikat"
                                            value={documentNumberForm.data.numbers[trackCode]?.prefix ?? ''}
                                            onChange={(change) => documentNumberForm.setData('numbers', { ...documentNumberForm.data.numbers, [trackCode]: { ...documentNumberForm.data.numbers[trackCode], prefix: change.target.value.toUpperCase() } })}
                                            placeholder={documentNumberDefaults[trackCode]?.prefix || ''}
                                            error={documentNumberForm.errors[`numbers.${trackCode}.prefix`]}
                                            maxLength={32}
                                        />
                                        <Input
                                            id={`event-cert-${trackCode}-start`}
                                            label="Nomor awal"
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={8}
                                            value={documentNumberForm.data.numbers[trackCode]?.start ?? ''}
                                            onChange={(change) => {
                                                const val = change.target.value.replace(/\D/g, '');
                                                documentNumberForm.setData('numbers', { ...documentNumberForm.data.numbers, [trackCode]: { ...documentNumberForm.data.numbers[trackCode], start: val } });
                                            }}
                                            placeholder={String(documentNumberDefaults[trackCode]?.raw_start || documentNumberDefaults[trackCode]?.start || '001')}
                                            helperText="Bisa diisi 001, 056, 0056, dst."
                                            error={documentNumberForm.errors[`numbers.${trackCode}.start`]}
                                        />
                                    </div>
                                </fieldset>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#DCE7F3] bg-white p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                            <Checkbox
                                checked={documentNumberForm.data.apply_to_participants ?? true}
                                onChange={(e) => documentNumberForm.setData('apply_to_participants', e.target.checked)}
                                label="Otomatis isi & urutkan nomor di data peserta (mengikuti nomor awal & jumlah digit)"
                            />
                            <Checkbox
                                checked={documentNumberForm.data.regenerate_documents ?? true}
                                onChange={(e) => documentNumberForm.setData('regenerate_documents', e.target.checked)}
                                label="Otomatis perbarui berkas PDF sertifikat & e-transkrip"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            {isPortalAdmin && <Link href="/admin/pengaturan?tab=certificate_numbers" className="text-xs font-semibold text-[#0B63CE] hover:underline">Ubah default Admin</Link>}
                            <Button type="submit" icon={Save} loading={documentNumberForm.processing}>Simpan Nomor Event</Button>
                        </div>
                    </div>
                </form>
            </details>

            {participants.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-4 border border-[#BCE0FD] bg-[#EAF5FF] p-4 sm:p-5">
                    <div>
                        <h3 className="text-sm font-semibold text-[#0E2747]">Generate dokumen otomatis</h3>
                        <p className="mt-1 max-w-2xl text-xs leading-5 text-[#425973]">Simpan pengaturan nomor event & TTD terlebih dahulu. Anda dapat membuat berkas yang belum ada atau membuat ulang seluruh sertifikat agar memuat TTD dan tanggal terbit terbaru.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {(stats.certificate_files_count > 0 || stats.transcript_files_count > 0) && (
                            <Button
                                type="button"
                                variant="secondary"
                                icon={RotateCcw}
                                loading={isGeneratingDocuments}
                                onClick={() => {
                                    if (!confirm('Generate ulang semua sertifikat & transkrip agar menggunakan TTD digital, tanggal terbit, dan nomor terbaru (001, 002, dst.)?')) return;
                                    router.post(`/admin/event/${event.id}/dokumen/generate`, { regenerate: true, sync_numbers: true }, {
                                        preserveScroll: true,
                                        onStart: () => setIsGeneratingDocuments(true),
                                        onFinish: () => setIsGeneratingDocuments(false),
                                    });
                                }}
                            >
                                Generate Ulang Semua
                            </Button>
                        )}
                        <Button
                            type="button"
                            icon={Sparkles}
                            loading={isGeneratingDocuments}
                            onClick={() => router.post(`/admin/event/${event.id}/dokumen/generate`, {}, {
                                preserveScroll: true,
                                onStart: () => setIsGeneratingDocuments(true),
                                onFinish: () => setIsGeneratingDocuments(false),
                            })}
                        >
                            Generate yang belum ada
                        </Button>
                    </div>
                </div>
            )}

            {participants.length > 0 && (
                <div className="border border-[#DCE7F3] bg-white p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h3 className="text-sm font-semibold text-[#0E2747] flex items-center gap-2">
                                <Printer className="size-4 text-[#0B63CE]" />
                                <span>Cetak & Unduh Dokumen Sekaligus</span>
                            </h3>
                            <p className="mt-1 max-w-2xl text-xs leading-5 text-[#6B7C93]">Preview dan cetak semua sertifikat atau transkrip peserta dalam satu dokumen PDF multi-halaman sekaligus, atau unduh seluruh berkas PDF dalam satu file ZIP.</p>
                        </div>
                        {/* Filter jalur */}
                        {batchPrintTrackOptions.length > 1 && (
                            <div className="flex items-center gap-2">
                                <label htmlFor="batch-print-track-filter" className="text-xs font-medium text-[#6B7C93] whitespace-nowrap">
                                    Filter Jalur:
                                </label>
                                <Select
                                    id="batch-print-track-filter"
                                    value={batchPrintTrack}
                                    onChange={(e) => setBatchPrintTrack(e.target.value)}
                                    className="rounded-lg border border-[#DCE7F3] bg-white px-3 py-1.5 text-xs font-medium text-[#0E2747] shadow-2xs focus:border-[#0B63CE] focus:outline-none focus:ring-1 focus:ring-[#0B63CE]"
                                >
                                    <option value="all">Semua Jalur ({participants.length} peserta)</option>
                                    {batchPrintTrackOptions.map((opt) => (
                                        <option key={opt.code} value={opt.code}>
                                            {opt.name} ({opt.count} peserta)
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        )}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            icon={Printer}
                            onClick={() => {
                                const track = batchPrintTrack !== 'all' ? `&track=${encodeURIComponent(batchPrintTrack)}` : '';
                                window.open(`/admin/event/${event.id}/dokumen/cetak-semua?type=certificate${track}`, '_blank');
                            }}
                        >
                            {batchPrintTrack === 'all'
                                ? 'Cetak Semua Sertifikat'
                                : `Cetak Sertifikat ${batchPrintTrackOptions.find((o) => o.code === batchPrintTrack)?.name ?? batchPrintTrack} (${batchPrintTrackOptions.find((o) => o.code === batchPrintTrack)?.count ?? 0})`}
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            icon={FileText}
                            onClick={() => {
                                const track = batchPrintTrack !== 'all' ? `&track=${encodeURIComponent(batchPrintTrack)}` : '';
                                window.open(`/admin/event/${event.id}/dokumen/cetak-semua?type=transcript${track}`, '_blank');
                            }}
                        >
                            {batchPrintTrack === 'all'
                                ? 'Cetak Semua Transkrip'
                                : `Cetak Transkrip ${batchPrintTrackOptions.find((o) => o.code === batchPrintTrack)?.name ?? batchPrintTrack} (${batchPrintTrackOptions.find((o) => o.code === batchPrintTrack)?.count ?? 0})`}
                        </Button>
                        <a
                            href={
                                batchPrintTrack === 'all'
                                    ? `/admin/event/${event.id}/dokumen/unduh-zip`
                                    : `/admin/event/${event.id}/dokumen/unduh-zip?track=${encodeURIComponent(batchPrintTrack)}`
                            }
                            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#0B63CE] px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-[#0A3F82] transition-colors"
                        >
                            <Download className="size-4" />
                            <span>
                                {batchPrintTrack === 'all'
                                    ? 'Unduh Semua (.ZIP)'
                                    : `Unduh ${batchPrintTrackOptions.find((o) => o.code === batchPrintTrack)?.name ?? batchPrintTrack} (.ZIP)`}
                            </span>
                        </a>
                    </div>
                </div>
            )}

            <dl className="grid border-y border-[#DCE7F3] bg-white sm:grid-cols-2 xl:grid-cols-4">
                {[
                    { label: 'Peserta', value: participants.length },
                    { label: 'Sertifikat tersedia', value: stats.certificate_files_count || 0 },
                    { label: 'Transkrip tersedia', value: stats.transcript_files_count || 0 },
                    { label: 'Paket lengkap', value: stats.complete_document_sets_count || 0 },
                ].map((item, index) => (
                    <div key={item.label} className={`px-5 py-4 ${index < 3 ? 'border-b border-[#DCE7F3] sm:border-b-0 sm:border-r' : ''}`}>
                        <dt className="text-xs font-medium text-[#6B7C93]">{item.label}</dt>
                        <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#0E2747]">{item.value}</dd>
                    </div>
                ))}
            </dl>

            {participants.length === 0 ? (
                <div className="border border-[#DCE7F3] bg-white p-6 sm:p-8">
                    <h3 className="font-display text-lg font-semibold text-[#0E2747]">Belum ada peserta</h3>
                    <p className="mt-2 text-sm leading-6 text-[#6B7C93]">Tambahkan peserta melalui tab Peserta sebelum mengunggah dokumen kelulusan.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="max-w-xl">
                        <Input
                            id="credential-participant-search"
                            type="search"
                            label="Cari peserta"
                            name="credential_participant_search"
                            autoComplete="off"
                            value={credentialSearch}
                            onChange={(event) => setCredentialSearch(event.target.value)}
                            placeholder="Nama, NIK, atau jalur peserta…"
                            icon={Search}
                        />
                    </div>

                    {credentialParticipants.length === 0 ? (
                        <p role="status" className="border border-[#DCE7F3] bg-white p-6 text-sm text-[#6B7C93]">Tidak ada peserta yang cocok dengan pencarian.</p>
                    ) : (
                        <ul className="divide-y divide-[#DCE7F3] border-y border-[#DCE7F3] bg-white" aria-label="Dokumen kelulusan peserta">
                            {credentialParticipants.map((participant) => (
                                <ParticipantCredentialRow
                                    key={participant.id}
                                    eventId={event.id}
                                    participant={participant}
                                    onOpenPreview={setActiveDocumentPreview}
                                />
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </section>
    );
}
