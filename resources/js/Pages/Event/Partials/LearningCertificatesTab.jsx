import { Link } from '@inertiajs/react';
import { CheckCircle2, Shield } from 'lucide-react';
import { LearningDocument } from './LearningRoomShared';
import { useLearningRoom } from './LearningRoomContext';

export default function LearningCertificatesTab() {
    const {
        event,
        certificate,
        transcript,
        integrityPact,
    } = useLearningRoom();

    return (
        <section aria-labelledby="certificate-title" className="border border-[#DCE7F3] bg-white p-6 sm:p-8">
            <h2 id="certificate-title" className="font-display text-2xl font-semibold text-[#0A3F82]">Dokumen Kelulusan</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7C93]">E-Sertifikat, E-Transkrip, dan Pakta Integritas resmi PB PERKEMI setelah proses penataran selesai.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
                <LearningDocument title="E-Sertifikat" document={certificate} />
                <LearningDocument title="E-Transkrip" document={transcript} />
                <section aria-label="Pakta Integritas" className="flex min-h-44 flex-col justify-between border border-[#DCE7F3] bg-[#F8FBFF] p-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <Shield className="size-4 text-[#0B63CE]" aria-hidden="true" />
                            <h3 className="text-sm font-semibold text-[#0E2747]">Pakta Integritas</h3>
                        </div>
                        <div className="mt-3 space-y-1.5 text-sm leading-snug text-[#6B7C93]">
                            <p className="text-xs font-medium text-[#112743]">
                                {integrityPact?.title || 'Pakta Integritas PB PERKEMI'}
                            </p>
                            {integrityPact?.has_signed ? (
                                <p className="text-xs text-emerald-700 flex items-center gap-1 font-semibold">
                                    <CheckCircle2 className="size-3.5 shrink-0" />
                                    Ditandatangani Digital
                                </p>
                            ) : (
                                <p className="text-xs text-amber-700">
                                    Wajib ditandatangani digital untuk kelengkapan administrasi dan legalitas lisensi.
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-2">
                        <Link
                            href={`/event/${event.slug}/pakta-integritas`}
                            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#0B63CE] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0A3F82] transition"
                        >
                            {integrityPact?.has_signed ? 'Perbarui Tanda Tangan' : 'Tandatangani Digital'}
                        </Link>
                        {integrityPact?.has_signed && (
                            <a
                                href={`/event/${event.slug}/pakta-integritas/cetak`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#DCE7F3] bg-white px-4 py-2 text-xs font-semibold text-[#0E2747] hover:bg-slate-50 transition"
                            >
                                Lihat & Cetak Dokumen Resmi
                            </a>
                        )}
                    </div>
                </section>
            </div>
        </section>
    );
}
