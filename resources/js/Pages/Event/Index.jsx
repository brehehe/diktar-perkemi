import { Head, Link } from '@inertiajs/react';
import PortalLayout from '../../Layouts/PortalLayout';

export default function Index({ events = [] }) {
    return (
        <PortalLayout>
            <Head title="Event Saya" />
            <div className="mx-auto w-full max-w-full px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                <div className="border-b border-[#DCE7F3] pb-7">
                    <p className="text-sm font-semibold text-[#0B63CE]">Portal peserta</p>
                    <h1 className="mt-2 font-display text-3xl font-bold text-[#0A3F82] sm:text-4xl">Event Saya</h1>
                    <p className="mt-3 max-w-2xl text-base text-[#6B7C93]">Kegiatan penataran yang telah diverifikasi oleh penyelenggara.</p>
                </div>

                {events.length === 0 ? (
                    <div className="mt-8 border border-[#DCE7F3] bg-white p-6 sm:p-8">
                        <h2 className="text-lg font-semibold text-[#112743]">Belum ada event terdaftar</h2>
                        <p className="mt-2 text-sm leading-6 text-[#6B7C93]">Jika Anda sudah didaftarkan, minta penyelenggara memverifikasi pendaftaran dan menghubungkan akun Anda dengan data peserta.</p>
                    </div>
                ) : (
                    <ul className="mt-8 divide-y divide-[#DCE7F3] border-y border-[#DCE7F3]" aria-label="Event yang diikuti">
                        {events.map((event) => (
                            <li key={event.id} className="grid gap-4 py-6 sm:grid-cols-[1fr_auto] sm:items-center">
                                <div>
                                    <p className="text-sm font-medium text-[#0B63CE]">{event.status_label}</p>
                                    <h2 className="mt-1 font-display text-xl font-semibold text-[#0E2747]">{event.name}</h2>
                                    <p className="mt-2 text-sm leading-6 text-[#6B7C93]">{event.date_formatted} · {event.place}</p>
                                    <p className="mt-1 text-sm text-[#112743]">Jalur: {event.track_name}</p>
                                    <p className="mt-1 text-sm text-[#6B7C93]">{event.is_checked_in ? 'Kehadiran awal tercatat' : 'Kehadiran awal belum tercatat'}</p>
                                    {event.certificate_number && <p className="mt-1 text-sm text-[#112743]">Nomor sertifikat: {event.certificate_number}</p>}
                                    {event.certificate_download_url && <a href={event.certificate_download_url} className="mt-2 inline-block text-sm font-semibold text-[#0B63CE] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]">Unduh sertifikat PDF</a>}
                                </div>
                                <Link href={`/event/${event.slug}/ruang-belajar`} className="inline-flex min-h-11 items-center justify-center bg-[#0B63CE] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0A3F82] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]">
                                    Buka ruang belajar
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </PortalLayout>
    );
}
