import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/admin/PageHeader';
import Button from '../../../Components/ui/Button';
import Tabs from '../../../Components/admin/Tabs';
import StatGrid from '../../../Components/admin/StatGrid';
import EventAssessmentTab from './Partials/EventAssessmentTab';
import EventPracticalExamTab from './Partials/EventPracticalExamTab';
import EventKenshiExamTab from './Partials/EventKenshiExamTab';
import EventReportsTab from './Partials/EventReportsTab';
import EventOverviewTab from './Partials/EventOverviewTab';
import EventScheduleTab from './Partials/EventScheduleTab';
import EventRoomsTab from './Partials/EventRoomsTab';
import EventModulesTab from './Partials/EventModulesTab';
import EventParticipantsTab from './Partials/EventParticipantsTab';
import EventRegistrationFormsTab from './Partials/EventRegistrationFormsTab';
import EventIntegrityPactsTab from './Partials/EventIntegrityPactsTab';
import EventExamResultsTab from './Partials/EventExamResultsTab';
import EventAttendanceTab from './Partials/EventAttendanceTab';
import EventMaterialsTab from './Partials/EventMaterialsTab';
import EventCbtTab from './Partials/EventCbtTab';
import EventProctoringTab from './Partials/EventProctoringTab';
import EventSpeakersTab from './Partials/EventSpeakersTab';
import EventCertificatesTab from './Partials/EventCertificatesTab';
import EventExamRevisionsTab from './Partials/EventExamRevisionsTab';
import EventLegendsTab from './Partials/EventLegendsTab';
import EventDocumentsTab from './Partials/EventDocumentsTab';
import EventSettingsTab from './Partials/EventSettingsTab';
import EventShowDialogs from './Partials/EventShowDialogs';
import { EventShowContext } from './Partials/EventShowContext';
import useEventShowState from './Partials/useEventShowState';
import { Calendar, Clock, MapPin, Users, Edit3, BookOpen, Layers, CheckCircle2, FileSpreadsheet } from 'lucide-react';

export default function Show(props) {
    const {
        event,
        stats = {},
        assessmentData = null,
        practicalExamData = null,
        kenshiExamData = null,
        finances = [],
        financeAnalysis = null,
        financeCategories = [],
        activities = [],
        staff = [],
        staffCandidates = [],
        reportPermissions = {},
        outcomesSummary = {},
        reportSessions = [],
    } = props;
    const { activeTab, setActiveTab, settingSections, tabs, showContext } = useEventShowState(props);

    return (
        <AdminLayout>
            <EventShowContext.Provider value={showContext}>
                <Head title={`${event.name} — Detail Penataran`} />

                <div className="space-y-6">
                    <PageHeader
                        title={event.name}
                        description={`${event.date_formatted} • ${event.place}`}
                        breadcrumbs={[{ label: 'Event', href: '/admin/event' }, { label: event.name }]}
                        action={
                            <div className="flex flex-wrap gap-2">
                                <Button as={Link} href={`/admin/event/${event.id}/laporan`} size="sm" variant="outline" icon={FileSpreadsheet}>Laporan & Keuangan</Button>
                                <Button as={Link} href={`/admin/event/${event.id}/edit`} size="sm" variant="secondary" icon={Edit3}>Edit Event</Button>
                            </div>
                        }
                    />

                    {/* Editorial Event Hero Header */}
                    <div className="bg-white rounded-2xl border border-[#DCE7F3] shadow-xs overflow-hidden">
                        {/* Top Decorative Banner Strip */}
                        <div className="h-28 sm:h-36 bg-linear-to-r from-[#0E2747] via-[#0A3F82] to-[#0B63CE] relative px-6 py-4 flex items-end">
                            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
                            <div className="relative z-10 flex items-center gap-3">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur-xs border border-white/20">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    {event.status_label}
                                </span>
                                <span className="text-xs text-white/80 font-mono">
                                    Penyelenggara: {event.organizer}
                                </span>
                            </div>
                        </div>

                        {/* Main Event Meta Bar */}
                        <div className="p-6 sm:p-8 relative">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="space-y-2 max-w-3xl">
                                    <h2 className="font-display font-bold text-xl sm:text-2xl text-[#0E2747] leading-snug">
                                        Informasi Pelaksanaan
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-[#6B7C93]">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4 text-[#0B63CE]" />
                                            <span className="font-medium text-[#112743]">{event.date_formatted}</span>
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4 text-[#0B63CE]" />
                                            <span>{event.place}</span>
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4 text-[#EE9B25]" />
                                            <span>Durasi: {event.duration_days || 'Belum ditetapkan'}</span>
                                        </span>
                                    </div>
                                </div>

                            </div>

                            <StatGrid className="mt-6 border-t border-[#DCE7F3] pt-6" items={[
                                { key: 'jp', label: 'Beban Akreditasi', value: `${event.total_effective_jp} JP`, description: `Jadwal fisik: ${event.total_schedule_jp} JP`, icon: BookOpen, tone: 'blue' },
                                { key: 'participants', label: 'Peserta Terdaftar', value: stats.total_participants, description: `${stats.checked_in_participants || 0} check-in • ${stats.verified_participants} terverifikasi`, icon: Users, tone: 'navy' },
                                { key: 'attendance', label: 'Presensi Kehadiran', value: stats.total_attendances || 0, description: `${stats.present_attendances || 0} hadir tepat waktu`, icon: CheckCircle2, tone: 'green' },
                                { key: 'curriculum', label: 'Kurikulum & CBT', value: `${stats.total_modules} Modul • ${stats.cbt_packages_count || 0} CBT`, description: `${stats.total_sessions} sesi rundown (${event.total_days} hari)`, icon: Layers, tone: 'purple' },
                            ]} />
                        </div>

                        <Tabs
                            tabs={tabs}
                            activeTab={settingSections.some((section) => section.id === activeTab) ? 'pengaturan' : activeTab}
                            onChange={setActiveTab}
                            ariaLabel="Bagian detail event"
                            className="border-t bg-[#F8FBFF] px-4"
                        />
                    </div>

                    {settingSections.some((section) => section.id === activeTab) && <div className="mb-5 flex flex-wrap items-center gap-3 border-b border-[#DCE7F3] pb-4">
                        <button type="button" onClick={() => setActiveTab('pengaturan')} className="inline-flex min-h-11 items-center text-sm font-semibold text-[#0B63CE] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]">← Pengaturan Event</button>
                        <span aria-hidden="true" className="text-[#6B7C93]">/</span>
                        <span className="font-display text-lg font-semibold text-[#0A3F82]">{settingSections.find((section) => section.id === activeTab)?.label}</span>
                    </div>}

                    {/* TAB 1: RINGKASAN */}
                    {activeTab === 'ringkasan' && <EventOverviewTab />}

                    {/* TAB 2: RUNDOWN & SESI */}
                    {activeTab === 'rundown' && <EventScheduleTab />}

                    {activeTab === 'ruang' && <EventRoomsTab />}

                    {/* MODUL & CBT (MASTER) */}
                    {activeTab === 'modul_cbt' && <EventModulesTab />}

                    {/* TAB 4: PESERTA */}
                    {activeTab === 'peserta' && <EventParticipantsTab />}

                    {/* TAB: FORMULIR PENDAFTARAN PENATARAN */}
                    {activeTab === 'formulir' && <EventRegistrationFormsTab />}

                    {/* TAB: PAKTA INTEGRITAS PESERTA */}
                    {activeTab === 'pakta' && <EventIntegrityPactsTab />}

                    {/* TAB: HASIL UJIAN CBT & RINCIAN JAWABAN */}
                    {activeTab === 'hasil-ujian' && <EventExamResultsTab />}

                    {/* TAB: PENILAIAN PRAKTIK & TEORI (WASIT, PENGUJI, PELATIH) */}
                    {activeTab === 'penilaian' && (
                        <EventAssessmentTab event={event} assessmentData={assessmentData} />
                    )}

                    {/* TAB: UJIAN PRAKTIK (1 LEMBAR SELURUH PESERTA - 6 JALUR) */}
                    {activeTab === 'ujian-praktik' && (
                        <EventPracticalExamTab event={event} practicalExamData={practicalExamData} />
                    )}

                    {activeTab === 'kenshi-penilaian' && (
                        <EventKenshiExamTab event={event} kenshiExamData={kenshiExamData} mode="technique" />
                    )}

                    {activeTab === 'kenshi-tabulasi' && (
                        <EventKenshiExamTab event={event} kenshiExamData={kenshiExamData} mode="tabulation" />
                    )}

                    {activeTab === 'kenshi-hasil' && (
                        <EventKenshiExamTab event={event} kenshiExamData={kenshiExamData} mode="results" />
                    )}

                    {activeTab === 'kenshi-laporan' && (
                        <EventKenshiExamTab event={event} kenshiExamData={kenshiExamData} mode="report" />
                    )}

                    {/* TAB 4: ABSENSI (DEDICATED ATTENDANCE MANAGEMENT) */}
                    {activeTab === 'absensi' && <EventAttendanceTab />}


                    {/* TAB 5: MATERI (MODULES & DIGITAL BOOKS) */}
                    {activeTab === 'materi' && <EventMaterialsTab />}

                    {/* TAB 6: UJIAN CBT (CBT EXAM PACKAGES & QUESTION BANK) */}
                    {activeTab === 'cbt' && <EventCbtTab />}

                    {activeTab === 'pengawasan' && <EventProctoringTab />}

                    {/* TAB 7: PEMATERI */}
                    {activeTab === 'pemateri' && <EventSpeakersTab />}

                    {activeTab === 'sertifikat' && <EventCertificatesTab />}

                    {activeTab === 'revisi' && <EventExamRevisionsTab />}

                    {/* TAB 8: LEGENDA & SINGKATAN */}
                    {activeTab === 'legenda' && <EventLegendsTab />}

                    {activeTab === 'dokumen' && <EventDocumentsTab />}

                    {/* TAB 10: PENGATURAN EVENT */}
                    {activeTab === 'pengaturan' && <EventSettingsTab />}

                    {/* TABS: LAPORAN (KEUANGAN, DOKUMENTASI, REALISASI, PETUGAS, REKAP & EKSPOR) */}
                    {['keuangan', 'dokumentasi', 'realisasi', 'petugas', 'rekap-laporan', 'laporan'].includes(activeTab) && (
                        <EventReportsTab
                            event={event}
                            finances={finances}
                            financeAnalysis={financeAnalysis}
                            financeCategories={financeCategories}
                            activities={activities}
                            staff={staff}
                            staffCandidates={staffCandidates}
                            sessions={reportSessions || []}
                            outcomesSummary={outcomesSummary}
                            permissions={reportPermissions}
                            initialSubTab={
                                activeTab === 'keuangan'
                                    ? 'finance'
                                    : activeTab === 'dokumentasi'
                                      ? 'documentation'
                                      : activeTab === 'realisasi'
                                        ? 'realisation'
                                        : activeTab === 'petugas'
                                          ? 'staff'
                                          : 'rekap'
                            }
                            onSubTabChange={(newSubTab) => {
                                const tabMap = {
                                    finance: 'keuangan',
                                    documentation: 'dokumentasi',
                                    realisation: 'realisasi',
                                    staff: 'petugas',
                                    rekap: 'rekap-laporan',
                                };
                                if (tabMap[newSubTab]) {
                                    setActiveTab(tabMap[newSubTab]);
                                }
                            }}
                        />
                    )}
                </div>

                <EventShowDialogs />
            </EventShowContext.Provider>
        </AdminLayout>
    );
}
