import React from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/admin/PageHeader';
import Badge from '../../../Components/ui/Badge';
import Tabs from '../../../Components/admin/Tabs';

const display = (value) => value === null || value === undefined || value === '' ? '—' : value;

function Detail({ label, value }) {
    return (
        <div className="border-b border-[#DCE7F3] py-3 last:border-b-0 sm:grid sm:grid-cols-[11rem_1fr] sm:gap-4">
            <dt className="text-sm text-[#6B7C93]">{label}</dt>
            <dd className="mt-1 break-words text-sm font-medium text-[#112743] sm:mt-0">{display(value)}</dd>
        </div>
    );
}

export default function Show({ participant, enrolledEvents = [], matchingUser = null }) {
    const { url } = usePage();
    const activeTab = new URLSearchParams(url.split('?')[1] || '').get('tab') === 'event' ? 'event' : 'informasi';
    const baseUrl = `/admin/master/peserta/${participant.id}`;

    return (
        <AdminLayout title={`Peserta — ${participant.name}`}>
            <PageHeader
                title={participant.name}
                description="Data peserta dan riwayat event yang tercatat di portal."
                breadcrumbs={[{ label: 'Peserta', href: '/admin/master/peserta' }, { label: participant.name }]}
            />

            <Tabs
                tabs={[
                    { id: 'informasi', label: 'Informasi', href: baseUrl },
                    { id: 'event', label: 'Event', href: `${baseUrl}?tab=event`, count: enrolledEvents.length },
                ]}
                activeTab={activeTab}
                ariaLabel="Bagian detail peserta"
                className="mb-6"
            />

            {activeTab === 'informasi' ? (
                <div className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
                        <section aria-labelledby="participant-identity" className="border border-[#DCE7F3] bg-white p-5 sm:p-6">
                            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[#DCE7F3]">
                                <div className="w-16 h-16 rounded-full border-2 border-[#0B63CE]/30 bg-[#EAF5FF] overflow-hidden flex items-center justify-center font-bold text-[#0B63CE] text-xl shrink-0 shadow-xs">
                                    {participant.photo_url ? (
                                        <img src={participant.photo_url} alt={participant.name} className="w-full h-full object-cover" />
                                    ) : (
                                        participant.name.substring(0, 2).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <h2 id="participant-identity" className="font-display text-lg font-bold text-[#0E2747]">{participant.name}</h2>
                                    <div className="text-xs text-[#6B7C93] flex items-center gap-2 mt-0.5">
                                        <span className="font-mono font-bold text-[#0B63CE] bg-[#EAF5FF] px-2 py-0.5 rounded">DAN {participant.dan_roman || participant.dan_level}</span>
                                        <span>•</span>
                                        <span>{participant.kenshi_id || 'ID Kenshi -'}</span>
                                    </div>
                                </div>
                            </div>
                            <dl className="mt-3">
                                <Detail label="Nama" value={participant.name} />
                                <Detail label="Email" value={participant.email} />
                                <Detail label="Nomor Induk Kenshi (NIK)" value={participant.kenshi_id} />
                                <Detail label="Telepon" value={participant.phone} />
                                <Detail label="Asal" value={participant.origin} />
                                <Detail label="Dojo" value={participant.dojo} />
                                <Detail label="Tingkat Dan" value={participant.dan_roman || participant.dan_level} />
                                <Detail label="Terdaftar" value={participant.created_at} />
                            </dl>
                        </section>
                        <div className="space-y-6">
                            <section aria-labelledby="participant-account" className="border border-[#DCE7F3] bg-white p-5 sm:p-6">
                                <h2 id="participant-account" className="font-display text-lg font-bold text-[#0E2747]">Akun portal</h2>
                                {participant.user ? (
                                    <dl className="mt-3">
                                        <Detail label="Nama akun" value={participant.user.name} />
                                        <Detail label="Email akun" value={participant.user.email} />
                                        <Detail label="Login & Kata Sandi" value={`${participant.kenshi_id} (NIK)`} />
                                        <Detail label="Peran" value={participant.user.role} />
                                    </dl>
                                ) : (
                                    <div className="mt-3 text-sm leading-relaxed text-[#6B7C93]">
                                        <p>Belum terhubung dengan akun portal. Hubungkan akun agar peserta dapat login menggunakan email atau NIK.</p>
                                        {matchingUser && (
                                            <div className="mt-3">
                                                <p>Akun Peserta dengan email yang sama: <strong className="text-[#112743]">{matchingUser.name}</strong></p>
                                                <button type="button" onClick={() => router.patch(`${baseUrl}/akun`)}
                                                    className="mt-3 min-h-11 border border-[#0B63CE] px-4 py-2 font-semibold text-[#0B63CE] hover:bg-[#EAF5FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE] focus-visible:ring-offset-2">
                                                    Hubungkan akun
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </section>
                            {participant.admin_notes && (
                                <section aria-labelledby="participant-notes" className="border border-[#DCE7F3] bg-white p-5 sm:p-6">
                                    <h2 id="participant-notes" className="font-display text-lg font-bold text-[#0E2747]">Catatan admin</h2>
                                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#112743]">{participant.admin_notes}</p>
                                </section>
                            )}
                        </div>
                    </div>

                    {/* Section Riwayat Sertifikasi */}
                    <section aria-labelledby="participant-certifications" className="border border-[#DCE7F3] bg-white p-5 sm:p-6">
                        <div className="flex items-center justify-between pb-3 border-b border-[#DCE7F3]">
                            <div>
                                <h2 id="participant-certifications" className="font-display text-lg font-bold text-[#0E2747]">
                                    Riwayat Sertifikasi & Kualifikasi
                                </h2>
                                <p className="text-sm text-[#6B7C93] mt-0.5">
                                    Sertifikat dan lisensi kualifikasi yang pernah diikuti kenshi.
                                </p>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#EAF5FF] text-[#0B63CE] border border-[#0B63CE]/20">
                                {participant.certifications_history?.length || 0} Sertifikasi Terdata
                            </span>
                        </div>

                        {participant.certifications_history && participant.certifications_history.length > 0 ? (
                            <div className="grid gap-4 mt-4 sm:grid-cols-2">
                                {participant.certifications_history.map((cert) => (
                                    <div key={cert.id} className="p-4 border border-[#DCE7F3] rounded-lg bg-slate-50/50 hover:bg-white hover:border-[#0B63CE]/40 transition-all">
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="font-bold text-sm text-[#0E2747]">{cert.track_name}</span>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                                {cert.graduation_status === 'passed' ? 'Lulus / Bersertifikat' : cert.graduation_status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-[#6B7C93] mt-1.5 font-medium">{cert.event_title}</p>
                                        <div className="mt-3 pt-2.5 border-t border-[#DCE7F3]/70 grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <span className="text-[#6B7C93] block text-[11px]">No. Sertifikat:</span>
                                                <span className="font-mono font-medium text-[#112743]">{cert.certificate_number || '—'}</span>
                                            </div>
                                            <div>
                                                <span className="text-[#6B7C93] block text-[11px]">Waktu:</span>
                                                <span className="text-[#112743] font-medium">{cert.date_formatted || '—'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-6 text-center text-sm text-[#6B7C93]">
                                Belum ada riwayat sertifikasi sebelumnya yang tercatat di sistem.
                            </div>
                        )}

                        {participant.notes && (
                            <div className="mt-4 pt-4 border-t border-[#DCE7F3]">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6B7C93]">Data SIM PERKEMI & Catatan Tambahan</h3>
                                <div className="mt-2 p-3 bg-blue-50/50 border border-blue-100 rounded text-xs text-[#112743] leading-relaxed">
                                    {participant.notes}
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            ) : (
                <section aria-labelledby="participant-events">
                    <h2 id="participant-events" className="sr-only">Riwayat event peserta</h2>
                    {enrolledEvents.length === 0 ? (
                        <div className="border border-[#DCE7F3] bg-white px-6 py-12 text-center text-sm text-[#6B7C93]">Peserta belum terdaftar dalam event.</div>
                    ) : (
                        <div className="space-y-6">
                            {enrolledEvents.map((event) => (
                                <article key={event.id} className="border border-[#DCE7F3] bg-white">
                                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#DCE7F3] px-5 py-4 sm:px-6">
                                        <div>
                                            <h3 className="font-display text-lg font-bold text-[#0E2747]">
                                                <Link href={`/admin/event/${event.event_id}`} className="rounded-sm hover:text-[#0B63CE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE]">{event.event_name}</Link>
                                            </h3>
                                            <p className="mt-1 text-sm text-[#6B7C93]">{event.date_formatted} · {event.place}</p>
                                        </div>
                                        {event.track && <Badge variant="primary">{event.track.name}</Badge>}
                                    </div>
                                    <div className="grid gap-6 px-5 py-5 sm:px-6 lg:grid-cols-3">
                                        <section aria-label={`Status ${event.event_name}`}>
                                            <h4 className="text-sm font-bold text-[#0E2747]">Keikutsertaan</h4>
                                            <dl className="mt-2">
                                                <Detail label="Administrasi" value={event.admin_status} />
                                                <Detail label="Status kelulusan" value={event.graduation_status} />
                                                <Detail label="Nilai teori" value={event.theory_score} />
                                                <Detail label="Nilai praktik" value={event.practice_score} />
                                                <Detail label="Nilai akhir" value={event.final_grade} />
                                            </dl>
                                        </section>
                                        <section aria-label={`Absensi ${event.event_name}`}>
                                            <h4 className="text-sm font-bold text-[#0E2747]">Absensi</h4>
                                            {event.attendances.length === 0 ? <p className="mt-3 text-sm text-[#6B7C93]">Belum ada absensi tercatat.</p> : (
                                                <ul className="mt-2 divide-y divide-[#DCE7F3]">
                                                    {event.attendances.map((attendance) => (
                                                        <li key={attendance.id} className="py-2 text-sm">
                                                            <p className="font-medium text-[#112743]">{attendance.session_name}</p>
                                                            <p className="mt-0.5 text-[#6B7C93]">{attendance.status_label} · {attendance.checked_in_at}</p>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </section>
                                        <div className="space-y-5">
                                            <section aria-label={`Nilai ujian ${event.event_name}`}>
                                                <h4 className="text-sm font-bold text-[#0E2747]">Ujian</h4>
                                                {event.exam_attempts.length === 0 ? <p className="mt-3 text-sm text-[#6B7C93]">Belum ada ujian tercatat.</p> : (
                                                    <ul className="mt-2 divide-y divide-[#DCE7F3]">
                                                        {event.exam_attempts.map((attempt) => (
                                                            <li key={attempt.id} className="py-2 text-sm">
                                                                <p className="font-medium text-[#112743]">{attempt.package_title} · Percobaan {attempt.attempt_number}</p>
                                                                <p className="mt-0.5 text-[#6B7C93]">{attempt.score === null ? 'Belum dinilai' : `Nilai ${attempt.score}${attempt.passing_score !== null ? ` / KKM ${attempt.passing_score}` : ''}`}</p>
                                                                {attempt.revision_status && <p className="mt-0.5 text-[#0A3F82]">Revisi: {attempt.revision_status === 'accepted' ? 'Diterima' : attempt.revision_status === 'rejected' ? 'Perlu perbaikan' : 'Menunggu pemeriksaan'}</p>}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </section>
                                            <section aria-label={`Sertifikat ${event.event_name}`}>
                                                <h4 className="text-sm font-bold text-[#0E2747]">Dokumen kelulusan</h4>
                                                {event.certificate_download_url ? (
                                                    <div className="mt-2 text-sm">
                                                        {event.certificate_number && <p className="text-[#6B7C93]">Nomor {event.certificate_number}</p>}
                                                        <a href={event.certificate_download_url} className="mt-2 inline-flex min-h-11 items-center font-semibold text-[#0B63CE] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE]">Unduh sertifikat PDF</a>
                                                    </div>
                                                ) : <p className="mt-3 text-sm text-[#6B7C93]">Sertifikat belum diunggah.</p>}
                                                {event.transcript_download_url ? (
                                                    <div className="mt-3 border-t border-[#DCE7F3] pt-3 text-sm">
                                                        {event.transcript_number && <p className="text-[#6B7C93]">Nomor transkrip {event.transcript_number}</p>}
                                                        <a href={event.transcript_download_url} className="mt-2 inline-flex min-h-11 items-center font-semibold text-[#0B63CE] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE]">Unduh transkrip PDF</a>
                                                    </div>
                                                ) : <p className="mt-3 text-sm text-[#6B7C93]">Transkrip belum diunggah.</p>}
                                            </section>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </AdminLayout>
    );
}
