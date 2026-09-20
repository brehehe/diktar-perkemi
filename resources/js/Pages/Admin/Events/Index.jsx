import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/admin/PageHeader';
import DataTable from '../../../Components/ui/DataTable';
import Badge from '../../../Components/ui/Badge';
import Button from '../../../Components/ui/Button';
import AlertDialog from '../../../Components/ui/AlertDialog';
import FilterSelect from '../../../Components/admin/FilterSelect';
import StatGrid from '../../../Components/admin/StatGrid';
import TableToolbar from '../../../Components/admin/TableToolbar';
import {
    Calendar,
    Plus,
    MapPin,
    Clock,
    Users,
    BookOpen,
    ExternalLink,
    Edit3,
    Trash2,
    ChevronRight,
    Award,
    Sparkles,
} from 'lucide-react';

export default function Index({ events, filters = {}, stats = {}, availableYears = [], canCreateEvent = false, canDeleteEvent = false }) {
    const [search, setSearch] = useState(filters.q || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedYear, setSelectedYear] = useState(filters.year || '');
    const [selectedOrganizer, setSelectedOrganizer] = useState(filters.organizer || '');

    const [deletingEvent, setDeletingEvent] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const applyFilters = (customParams = {}) => {
        const params = {
            q: search,
            status: selectedStatus,
            year: selectedYear,
            organizer: selectedOrganizer,
            ...customParams,
        };

        Object.keys(params).forEach((key) => {
            if (!params[key]) delete params[key];
        });

        router.get('/admin/event', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearchSubmit = () => applyFilters();

    const handleResetFilters = () => {
        setSearch('');
        setSelectedStatus('');
        setSelectedYear('');
        setSelectedOrganizer('');
        router.get('/admin/event', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDeleteConfirm = () => {
        if (!deletingEvent) return;
        setIsDeleting(true);
        router.delete(`/admin/event/${deletingEvent.id}`, {
            onSuccess: () => {
                setIsDeleting(false);
                setDeletingEvent(null);
            },
            onError: () => setIsDeleting(false),
        });
    };

    const columns = [
        {
            header: 'Nama Event & Penataran',
            cell: (row) => (
                <div className="flex items-start gap-3 py-1">
                    <div className="w-12 h-14 rounded-lg bg-[#0E2747] border border-[#DCE7F3] overflow-hidden shrink-0 flex items-center justify-center text-white shadow-xs">
                        {row.cover_image ? (
                            <img
                                src={row.cover_image}
                                alt={row.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Calendar className="w-6 h-6 text-[#0B63CE]" />
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <Link
                            href={`/admin/event/${row.id}`}
                            className="font-semibold text-sm text-[#0E2747] hover:text-[#0B63CE] transition-colors line-clamp-1"
                        >
                            {row.name}
                        </Link>
                        <div className="flex items-center gap-2 text-[11px] text-[#6B7C93] mt-0.5">
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#0B63CE]" />
                                <span className="truncate max-w-[180px]">{row.place}</span>
                            </span>
                            <span>•</span>
                            <span className="font-mono text-[#0A3F82] font-medium">{row.organizer}</span>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: 'Tanggal & Durasi',
            cell: (row) => (
                <div className="flex flex-col text-xs">
                    <span className="font-medium text-[#112743]">{row.date_formatted}</span>
                    <span className="text-[11px] text-[#6B7C93] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-[#EE9B25]" />
                        {row.duration_days || 'Belum ditetapkan'}
                    </span>
                </div>
            ),
        },
        {
            header: 'Beban Jam Pelajaran',
            cell: (row) => (
                <div className="flex flex-col text-xs">
                    <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#0B63CE] bg-[#EAF5FF] px-2 py-0.5 rounded text-xs">
                            {row.total_effective_jp} JP Efektif
                        </span>
                    </div>
                    <span className="text-[11px] text-[#6B7C93] mt-0.5">
                        Total jadwal: <span className="font-mono font-medium text-[#0E2747]">{row.total_schedule_jp} JP</span>
                    </span>
                </div>
            ),
        },
        {
            header: 'Peserta / Kuota',
            cell: (row) => {
                const percentage = row.participant_quota ? Math.min(Math.round((row.participants_count / row.participant_quota) * 100), 100) : 0;
                return (
                    <div className="flex flex-col text-xs min-w-[110px]">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-semibold text-[#0E2747] flex items-center gap-1">
                                <Users className="w-3 h-3 text-[#0B63CE]" />
                                {row.participants_count}
                            </span>
                            <span className="text-[#6B7C93]">{row.participant_quota ? `/ ${row.participant_quota} Kenshi` : 'Kuota belum ditetapkan'}</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#DCE7F3] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#0B63CE] rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                );
            },
        },
        {
            header: 'Status',
            cell: (row) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${row.status_color}`}>
                    {row.status_label}
                </span>
            ),
        },
        {
            header: 'Aksi',
            headerClassName: 'text-right',
            cell: (row) => (
                <div className="flex items-center justify-end gap-1.5">
                    <Link
                        href={`/admin/event/${row.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-[#0B63CE] text-white hover:bg-[#0A3F82] transition-colors shadow-2xs"
                    >
                        <span>Buka Detail</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                        href={`/admin/event/${row.id}/edit`}
                        className="p-1.5 text-[#6B7C93] hover:text-[#0B63CE] hover:bg-[#EAF5FF] rounded-lg transition-colors"
                        title="Edit Informasi Event"
                        aria-label="Edit Informasi Event"
                    >
                        <Edit3 className="w-4 h-4" />
                    </Link>
                    {canDeleteEvent && <button
                        type="button"
                        onClick={() => setDeletingEvent(row)}
                        className="p-1.5 text-[#6B7C93] hover:text-[#DD4D7C] hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Event"
                        aria-label="Hapus Event"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>}
                </div>
            ),
        },
    ];

    return (
        <AdminLayout>
            <Head title="Manajemen Event Penataran PERKEMI" />

            <div className="space-y-6">
                {/* Header Page */}
                <PageHeader
                    title="Event Penataran Shorinji Kempo"
                    description="Kelola seluruh penyelenggaraan workshop, penataran kualifikasi, rundown sesi, pemateri, dan peserta berjenjang PERKEMI."
                    breadcrumbs={[
                        { label: 'Event Penataran' },
                    ]}
                    action={
                        <div className="flex items-center gap-2">
                            {canCreateEvent && <Button as={Link} href="/admin/event/create" size="sm" variant="primary" icon={<Plus className="w-4 h-4" />}>
                                    Tambah Event Baru
                            </Button>}
                        </div>
                    }
                />

                <StatGrid items={[
                    { key: 'total', label: 'Total Event Terdaftar', value: stats.total_events || 0, description: 'Seluruh event pada sistem', icon: Calendar, tone: 'blue' },
                    { key: 'active', label: 'Event Aktif / Dibuka', value: stats.active_events || 0, description: 'Event yang sedang berjalan', icon: Sparkles, tone: 'green' },
                    { key: 'participants', label: 'Total Kenshi Peserta', value: stats.total_participants || 0, description: 'Akumulasi peserta event', icon: Users, tone: 'navy' },
                    { key: 'jp', label: 'Akumulasi JP Efektif', value: `${stats.total_jp_sum || 0} JP`, description: 'Beban belajar seluruh event', icon: Award, tone: 'orange' },
                ]} />

                <div className="overflow-hidden rounded-xl border border-[#DCE7F3] bg-white shadow-xs">
                    <TableToolbar
                        search={search}
                        onSearchChange={setSearch}
                        onSearchSubmit={handleSearchSubmit}
                        searchPlaceholder="Cari nama event, tempat, atau penyelenggara…"
                        searchLabel="Cari event penataran"
                        hasActiveFilters={Boolean(search || selectedStatus || selectedYear || selectedOrganizer)}
                        onReset={handleResetFilters}
                    >
                        <FilterSelect
                            value={selectedStatus}
                            onChange={(value) => {
                                setSelectedStatus(value);
                                applyFilters({ status: value });
                            }}
                            placeholder="Semua Status"
                            ariaLabel="Filter status event"
                            options={[
                                { value: 'draft', label: 'Draft' },
                                { value: 'open_registration', label: 'Pendaftaran Dibuka' },
                                { value: 'ongoing', label: 'Sedang Berlangsung' },
                                { value: 'completed', label: 'Selesai' },
                                { value: 'archived', label: 'Diarsipkan' },
                            ]}
                        />
                        <FilterSelect
                            value={selectedYear}
                            onChange={(value) => {
                                setSelectedYear(value);
                                applyFilters({ year: value });
                            }}
                            placeholder="Semua Tahun"
                            ariaLabel="Filter tahun event"
                            options={availableYears.map((year) => ({ value: year, label: `Tahun ${year}` }))}
                        />
                    </TableToolbar>
                </div>

                {/* Event Table */}
                <DataTable
                    columns={columns}
                    data={events.data}
                    pagination={events}
                    emptyTitle="Belum Ada Event Penataran"
                    emptyDescription="Belum ada data kegiatan workshop atau penataran yang sesuai filter."
                />
            </div>

            {/* Alert Dialog for Event Deletion */}
            <AlertDialog
                isOpen={Boolean(deletingEvent)}
                onClose={() => setDeletingEvent(null)}
                title="Hapus Event Penataran?"
                description={`Apakah Anda yakin ingin menghapus event "${deletingEvent?.name}"? Seluruh data rundown sesi, modul, dan pendaftaran peserta di dalamnya akan ikut dihapus.`}
                confirmText={isDeleting ? 'Menghapus...' : 'Ya, Hapus Event'}
                cancelText="Batal"
                variant="danger"
                onConfirm={handleDeleteConfirm}
            />
        </AdminLayout>
    );
}
