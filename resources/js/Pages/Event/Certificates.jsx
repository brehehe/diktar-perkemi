import { Head, Link } from '@inertiajs/react';
import { Award, Download, FileText } from 'lucide-react';
import PortalLayout from '../../Layouts/PortalLayout';

export default function Certificates({ certificates = [] }) {
    return (
        <PortalLayout>
            <Head title="Dokumen Kelulusan Saya" />
            <div className="mx-auto w-full max-w-full px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                <div className="border-b border-[#DCE7F3] pb-7">
                    <p className="text-sm font-semibold text-[#0B63CE]">Portal peserta</p>
                    <h1 className="mt-2 text-balance font-display text-3xl font-bold text-[#0A3F82] sm:text-4xl">Dokumen Kelulusan Saya</h1>
                    <p className="mt-3 max-w-2xl text-base leading-7 text-[#6B7C93]">Unduh E-Sertifikat dan E-Transkrip resmi dari kegiatan penataran yang Anda ikuti.</p>
                </div>
                {certificates.length === 0 ? (
                    <div className="mt-8 border border-[#DCE7F3] bg-white p-6 sm:p-8">
                        <h2 className="font-display text-xl font-semibold text-[#112743]">Belum ada dokumen tersedia</h2>
                        <p className="mt-2 text-sm leading-6 text-[#6B7C93]">Dokumen akan tampil setelah penyelenggara menerbitkan E-Sertifikat atau E-Transkrip untuk Anda.</p>
                        <Link href="/event-saya" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-[#0B63CE] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]">Lihat Event Saya</Link>
                    </div>
                ) : (
                    <ul className="mt-8 divide-y divide-[#DCE7F3] border-y border-[#DCE7F3]" aria-label="Dokumen kelulusan peserta">
                        {certificates.map((certificate) => (
                            <li key={certificate.id} className="grid gap-5 bg-white px-5 py-6 lg:grid-cols-[minmax(0,0.7fr)_minmax(28rem,1.3fr)] lg:items-center lg:px-6">
                                <div className="min-w-0">
                                    <h2 className="font-display text-lg font-semibold text-[#0E2747]">{certificate.event_name}</h2>
                                    <p className="mt-2 text-sm text-[#6B7C93]">{certificate.event_date}</p>
                                    <p className="mt-3 text-xs leading-5 text-[#6B7C93]">Berkas PDF privat dan hanya dapat diunduh melalui akun peserta Anda.</p>
                                </div>
                                <div className="space-y-4">
                                    {(certificate.document_variants?.length ? certificate.document_variants : [{
                                        track_code: 'default',
                                        label: '',
                                        certificate_number: certificate.certificate_number,
                                        certificate_issued_at: certificate.issued_at,
                                        certificate_download_url: certificate.download_url,
                                        transcript_number: certificate.transcript_number,
                                        transcript_issued_at: certificate.transcript_issued_at,
                                        transcript_download_url: certificate.transcript_download_url,
                                    }]).map((variant) => (
                                        <div key={variant.track_code}>
                                            {certificate.document_variants?.length > 1 && (
                                                <h3 className="mb-2 text-sm font-semibold text-[#0E2747]">{variant.label}</h3>
                                            )}
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <DocumentDownload
                                                    icon={Award}
                                                    title={`E-Sertifikat${certificate.document_variants?.length > 1 ? ` ${variant.label}` : ''}`}
                                                    number={variant.certificate_number}
                                                    issuedAt={variant.certificate_issued_at}
                                                    downloadUrl={variant.certificate_download_url}
                                                />
                                                <DocumentDownload
                                                    icon={FileText}
                                                    title={`E-Transkrip${certificate.document_variants?.length > 1 ? ` ${variant.label}` : ''}`}
                                                    number={variant.transcript_number}
                                                    issuedAt={variant.transcript_issued_at}
                                                    downloadUrl={variant.transcript_download_url}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </PortalLayout>
    );
}

function DocumentDownload({ icon: Icon, title, number, issuedAt, downloadUrl }) {
    return (
        <section aria-label={title} className="flex min-h-40 flex-col justify-between border border-[#DCE7F3] bg-[#F8FBFF] p-4">
            <div>
                <div className="flex items-center gap-2">
                    <Icon className="size-4 text-[#0B63CE]" aria-hidden="true" />
                    <h3 className="text-sm font-semibold text-[#0E2747]">{title}</h3>
                </div>
                {downloadUrl ? (
                    <div className="mt-3 space-y-1 text-xs leading-5 text-[#6B7C93]">
                        <p>{number ? `Nomor ${number}` : 'Nomor belum dicatat'}</p>
                        {issuedAt && <p>Diterbitkan {issuedAt}</p>}
                    </div>
                ) : (
                    <p className="mt-3 text-xs leading-5 text-[#6B7C93]">Belum diterbitkan oleh penyelenggara.</p>
                )}
            </div>
            {downloadUrl && (
                <a href={downloadUrl} className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 bg-[#0B63CE] px-4 text-sm font-semibold text-white hover:bg-[#0A3F82] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]">
                    <Download className="size-4" aria-hidden="true" />
                    Unduh PDF
                </a>
            )}
        </section>
    );
}
