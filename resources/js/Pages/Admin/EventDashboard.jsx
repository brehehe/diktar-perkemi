import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import PageHeader from '../../Components/admin/PageHeader';
import Button from '../../Components/ui/Button';
import DataTable from '../../Components/ui/DataTable';
import StatGrid from '../../Components/admin/StatGrid';
import { Calendar, CalendarCheck, Users } from 'lucide-react';

export default function EventDashboard({ role, stats, events = [] }) {
    return (
        <AdminLayout title={`Ringkasan ${role}`}>
            <Head title={`Ringkasan ${role}`} />
            <div className="space-y-8">
                <PageHeader
                    title="Ringkasan Event"
                    description={role === 'Penyelenggara' ? 'Pantau event yang menjadi tanggung jawab Anda.' : 'Pantau seluruh event penataran PERKEMI.'}
                    breadcrumbs={[{ label: 'Ringkasan' }]}
                    action={
                        <Button as={Link} href="/admin/event" size="sm" icon={Calendar}>Lihat Event</Button>
                    }
                />

                <StatGrid
                    className="xl:grid-cols-3"
                    items={[
                        { key: 'events', label: 'Total Event', value: stats.events, description: 'Event dalam cakupan akses Anda', icon: Calendar, tone: 'blue' },
                        { key: 'active', label: 'Event Aktif', value: stats.active_events, description: 'Event yang sedang berjalan', icon: CalendarCheck, tone: 'green' },
                        { key: 'participants', label: 'Pendaftaran Peserta', value: stats.participants, description: 'Akumulasi peserta event', icon: Users, tone: 'purple' },
                    ]}
                />

                <section aria-labelledby="event-list-heading">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h2 id="event-list-heading" className="font-display text-xl font-semibold text-[#0A3F82]">Event terbaru</h2>
                        <Link href="/admin/event" className="text-sm font-semibold text-[#0B63CE] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]">Lihat semua event</Link>
                    </div>
                    <DataTable
                        className="mt-5"
                        ariaLabel="Event terbaru"
                        data={events}
                        emptyTitle="Belum Ada Event"
                        emptyDescription="Belum ada event dalam cakupan Anda."
                        columns={[
                            {
                                header: 'Event',
                                cell: (event) => (
                                    <div className="min-w-56">
                                        <p className="text-xs font-semibold text-[#0B63CE]">{event.status_label}</p>
                                        <p className="mt-1 text-sm font-semibold text-[#112743]">{event.name}</p>
                                    </div>
                                ),
                            },
                            { header: 'Tanggal & Tempat', cell: (event) => <span className="whitespace-nowrap">{event.date_formatted}<br /><span className="text-[#6B7C93]">{event.place}</span></span> },
                            { header: 'Sesi', cell: (event) => event.sessions_count },
                            { header: 'Peserta', cell: (event) => event.participants_count },
                            { header: 'Aksi', headerClassName: 'text-right', className: 'text-right', cell: (event) => <Button as={Link} href={`/admin/event/${event.id}`} variant="outline" size="sm">Buka detail</Button> },
                        ]}
                    />
                </section>
            </div>
        </AdminLayout>
    );
}
