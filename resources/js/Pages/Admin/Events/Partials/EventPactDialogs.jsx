import Button from '../../../../Components/ui/Button';
import Modal from '../../../../Components/ui/Modal';
import FormField from '../../../../Components/ui/FormField';
import Select from '../../../../Components/ui/Select';
import Checkbox from '../../../../Components/ui/Checkbox';
import FileInput from '../../../../Components/ui/FileInput';
import IntegrityPactDocument from '../../../../Components/IntegrityPactDocument';
import { FileText, Check, Printer, CheckCircle2, Download, Upload } from 'lucide-react';
import { useEventShow } from './EventShowContext';
import { useIsProdas } from '../../../../Utils/isProdas';

export default function EventPactDialogs() {
    const isProdas = useIsProdas();
    const {
        selectedPactForModal,
        setSelectedPactForModal,
        isVerifyingPact,
        uploadModalPactParticipant,
        setUploadModalPactParticipant,
        adminUploadPactFile,
        setAdminUploadPactFile,
        adminUploadPactType,
        setAdminUploadPactType,
        adminUploadPactAutoVerify,
        setAdminUploadPactAutoVerify,
        isAdminUploadingPact,
        handleVerifyPact,
        handleAdminPactUploadSubmit,
    } = useEventShow();

    return (
        <>
            {/* MODAL: Preview Pakta Integritas Peserta */}
            {selectedPactForModal && (
                <Modal
                    isOpen={Boolean(selectedPactForModal)}
                    onClose={() => setSelectedPactForModal(null)}
                    title={`Pakta Integritas ${selectedPactForModal.pact_type?.toUpperCase()} — ${selectedPactForModal.participant_name}`}
                    size="2xl"
                    footer={
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                                {selectedPactForModal.status === 'verified' ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                        Terverifikasi {selectedPactForModal.verified_at ? `(${selectedPactForModal.verified_at})` : ''}
                                    </span>
                                ) : (
                                    <Button
                                        variant="primary"
                                        onClick={() => handleVerifyPact(selectedPactForModal.id)}
                                        loading={isVerifyingPact}
                                        icon={Check}
                                    >
                                        Verifikasi Pakta Ini
                                    </Button>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {selectedPactForModal.print_url && (
                                    <a
                                        href={selectedPactForModal.print_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE7F3] bg-white px-3 py-2 text-xs font-semibold text-[#112743] hover:bg-[#F8FBFF] hover:text-[#0B63CE] transition-colors"
                                    >
                                        <Printer className="h-4 w-4" />
                                        Cetak Dokumen
                                    </a>
                                )}
                                <Button variant="secondary" onClick={() => setSelectedPactForModal(null)}>
                                    Tutup
                                </Button>
                            </div>
                        </div>
                    }
                >
                    <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                        {/* Berkas Fisik Terunggah Alert */}
                        {selectedPactForModal.file_url && (
                            <div className="rounded-xl border border-indigo-200 bg-indigo-50/80 p-3.5 flex items-center justify-between gap-3 text-xs text-indigo-950">
                                <div className="flex items-center gap-2.5">
                                    <FileText className="h-5 w-5 text-indigo-700 shrink-0" />
                                    <div>
                                        <div className="font-semibold">
                                            Berkas Fisik Terunggah (Scan/Foto): {selectedPactForModal.file_name || 'Dokumen Pakta'}
                                            {selectedPactForModal.file_size_formatted && (
                                                <span className="font-normal text-indigo-700 ml-1">
                                                    ({selectedPactForModal.file_size_formatted})
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[11px] text-indigo-700">
                                            Peserta atau admin mengunggah dokumen fisik berformat PDF/gambar.
                                        </div>
                                    </div>
                                </div>
                                <a
                                    href={selectedPactForModal.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shrink-0"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    Buka File Asli
                                </a>
                            </div>
                        )}

                        {/* Lembar Format Resmi PB PERKEMI (Identik dengan Cetak) */}
                        <IntegrityPactDocument pact={selectedPactForModal} />
                    </div>
                </Modal>
            )}

            {/* MODAL: Upload Berkas Pakta Integritas (Admin) */}
            <Modal
                isOpen={Boolean(uploadModalPactParticipant)}
                onClose={() => {
                    if (!isAdminUploadingPact) {
                        setUploadModalPactParticipant(null);
                        setAdminUploadPactFile(null);
                    }
                }}
                title="Unggah Berkas Pakta Integritas Kenshi"
                size="md"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setUploadModalPactParticipant(null);
                                setAdminUploadPactFile(null);
                            }}
                            disabled={isAdminUploadingPact}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            form="admin-pact-upload-form"
                            variant="primary"
                            loading={isAdminUploadingPact}
                            disabled={!adminUploadPactFile || isAdminUploadingPact}
                        >
                            Unggah & Simpan Pakta
                        </Button>
                    </>
                }
            >
                <form id="admin-pact-upload-form" onSubmit={handleAdminPactUploadSubmit} className="space-y-4">
                    {/* Ringkasan Peserta */}
                    <div className="rounded-xl border border-[#DCE7F3] bg-[#F8FBFF] p-3 text-xs">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7C93] mb-1">
                            Target Kenshi
                        </div>
                        <div className="font-bold text-sm text-[#0E2747]">
                            {uploadModalPactParticipant?.participant_name}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[#6B7C93] mt-1">
                            <span>No. Kenshi: <strong className="font-mono text-[#0E2747]">{uploadModalPactParticipant?.kenshi_id_number || '-'}</strong></span>
                            <span>Tingkatan: <strong className="text-[#0E2747]">{uploadModalPactParticipant?.dan_level || '-'}</strong></span>
                            <span>Dojo: <strong className="text-[#0E2747]">{uploadModalPactParticipant?.origin_dojo || '-'}</strong></span>
                        </div>
                    </div>

                    {uploadModalPactParticipant?.file_url && (
                        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-2.5 text-xs text-indigo-900 flex items-center justify-between">
                            <div>
                                <span className="font-semibold">Sudah ada berkas terunggah:</span> {uploadModalPactParticipant.file_name || 'Berkas pakta scan'}
                            </div>
                            <a
                                href={uploadModalPactParticipant.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-indigo-700 underline text-[11px] hover:text-indigo-900"
                            >
                                Lihat File
                            </a>
                        </div>
                    )}

                    <FormField label="Kategori Pakta Integritas" required>
                        <Select
                            value={adminUploadPactType}
                            onChange={(e) => setAdminUploadPactType(e.target.value)}
                        >
                            {isProdas ? (
                                <option value="kenshi">Pakta Integritas Kenshi / Peserta</option>
                            ) : (
                                <>
                                    <option value="pelatih">Pakta Integritas Pelatih</option>
                                    <option value="penguji">Pakta Integritas Penguji</option>
                                    <option value="wasit">Pakta Integritas Wasit</option>
                                </>
                            )}
                        </Select>
                    </FormField>

                    <FormField
                        label="Pilih File Berkas Pakta (Scan / PDF / Gambar)"
                        name="admin-pact-file"
                        helperText="Format yang didukung: PDF, DOC, DOCX, JPG, PNG (Maks. 10MB)"
                        required
                    >
                        <FileInput
                            id="admin-pact-file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => setAdminUploadPactFile(e.target.files?.[0] || null)}
                        />
                        {adminUploadPactFile && (
                            <p className="mt-1 text-xs text-emerald-600 font-medium">
                                File terpilih: {adminUploadPactFile.name} ({(adminUploadPactFile.size / 1024).toFixed(1)} KB)
                            </p>
                        )}
                    </FormField>

                    <div className="rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] p-3">
                        <Checkbox
                            id="admin_auto_verify_pact"
                            checked={adminUploadPactAutoVerify}
                            onChange={(e) => setAdminUploadPactAutoVerify(e.target.checked)}
                            label="Langsung tandai status Terverifikasi (Disetujui PB PERKEMI)"
                            helperText="Jika dicentang, berkas pakta kenshi langsung berstatus Terverifikasi."
                        />
                    </div>
                </form>
            </Modal>
        </>
    );
}
