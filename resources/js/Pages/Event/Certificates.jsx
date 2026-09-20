import { Head, Link } from '@inertiajs/react';
import PortalLayout from '../../Layouts/PortalLayout';

export default function Certificates({ certificates = [] }) {
    return (
        <PortalLayout>
            <Head title="Sertifikat Saya" />
            <div className="mx-auto w-full max-w-full px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                <div className="border-b border-[#DCE7F3] pb-7">
                    <p className="text-sm font-semibold text-[#0B63CE]">Portal peserta</p>
                    <h1 className="mt-2 font-display text-3xl font-bold text-[#0A3F82] sm:text-4xl">Sertifikat Saya</h1>
                    <p className="mt-3 max-w-2xl text-base text-[#6B7C93]">Sertifikat PDF yang sudah diunggah untuk event yang Anda ikuti.</p>
                </div>
                {certificates.length === 0 ? (
                    <div className="mt-8 border border-[#DCE7F3] bg-white p-6 sm:p-8">
                        <h2 className="text-lg font-semibold text-[#112743]">Belum ada sertifikat</h2>
                        <p className="mt-2 text-sm leading-6 text-[#6B7C93]">Sertifikat akan tampil setelah penyelenggara mengunggah berkas untuk Anda.</p>
                        <Link href="/event-saya" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-[#0B63CE] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]">Lihat Event Saya</Link>
                    </div>
                ) : (
                    <ul className="mt-8 divide-y divide-[#DCE7F3] border-y border-[#DCE7F3]" aria-label="Sertifikat peserta">
                        {certificates.map((certificate) => (
                            <li key={certificate.id} className="grid gap-4 bg-white px-5 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
                                <div>
                                    <h2 className="font-display text-lg font-semibold text-[#0E2747]">{certificate.event_name}</h2>
                                    <p className="mt-1 text-sm text-[#6B7C93]">{certificate.event_date}</p>
                                    {certificate.certificate_number && <p className="mt-1 text-sm text-[#112743]">Nomor: {certificate.certificate_number}</p>}
                                    {certificate.issued_at && <p className="mt-1 text-sm text-[#6B7C93]">Diterbitkan: {certificate.issued_at}</p>}
                                </div>
                                <a href={certificate.download_url} className="inline-flex min-h-11 items-center justify-center bg-[#0B63CE] px-4 text-sm font-semibold text-white hover:bg-[#0A3F82] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]">Unduh PDF</a>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </PortalLayout>
    );
}
