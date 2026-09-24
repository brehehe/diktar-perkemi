import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/admin/PageHeader';
import DataTable from '../../../Components/ui/DataTable';
import TableToolbar from '../../../Components/admin/TableToolbar';
import FilterBar from '../../../Components/admin/FilterBar';
import FilterSelect from '../../../Components/admin/FilterSelect';
import Modal from '../../../Components/ui/Modal';
import Badge from '../../../Components/ui/Badge';
import Button from '../../../Components/ui/Button';
import {
    History,
    Eye,
    User,
    Calendar,
    Globe,
    Shield,
    Laptop,
    CheckCircle2,
    Activity,
} from 'lucide-react';

export default function Index({
    activities,
    actors = [],
    events = [],
    categories = [],
    roles = [],
    filters = {},
}) {
    const [search, setSearch] = useState(filters.q || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
    const [selectedEvent, setSelectedEvent] = useState(filters.event || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || '');
    const [selectedActor, setSelectedActor] = useState(filters.actor_id || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [detailActivity, setDetailActivity] = useState(null);

    const applyFilters = (customParams = {}) => {
        const params = {
            q: search,
            category: selectedCategory,
            event: selectedEvent,
            role: selectedRole,
            actor_id: selectedActor,
            start_date: startDate,
            end_date: endDate,
            ...customParams,
        };
        Object.keys(params).forEach((key) => {
            if (!params[key]) delete params[key];
        });
        router.get('/admin/aktivitas', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setSelectedCategory('');
        setSelectedEvent('');
        setSelectedRole('');
        setSelectedActor('');
        setStartDate('');
        setEndDate('');
        router.get('/admin/aktivitas', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const hasActiveFilters = Boolean(
        search ||
        selectedCategory ||
        selectedEvent ||
        selectedRole ||
        selectedActor ||
        startDate ||
        endDate
    );

    const getEventBadge = (event, eventLabel) => {
        const label = eventLabel || event;

        if (event.startsWith('auth.login')) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {label}
                </span>
            );
        }
        if (event.startsWith('auth.logout')) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    {label}
                </span>
            );
        }
        if (event.startsWith('menu.') || event.includes('.viewed')) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Activity className="w-3 h-3 text-indigo-600" />
                    {label}
                </span>
            );
        }

        let variant = 'primary';
        if (event.includes('created') || event.includes('imported')) variant = 'success';
        else if (event.includes('deleted') || event.includes('reset')) variant = 'danger';
        else if (event.includes('updated') || event.includes('status') || event.includes('toggled') || event.includes('password')) variant = 'warning';

        return <Badge variant={variant}>{label}</Badge>;
    };

    const columns = [
        {
            header: 'Waktu Kejadian',
            cell: (row) => (
                <div className="min-w-[130px]">
                    <span className="font-semibold text-xs text-[#112743] block">
                        {row.created_at_relative}
                    </span>
                    <span className="text-[11px] text-[#6B7C93] font-mono">
                        {row.created_at}
                    </span>
                </div>
            ),
        },
        {
            header: 'Aktor Pelaksana',
            cell: (row) => (
                <div className="flex items-center gap-2.5 min-w-[160px]">
                    <div className="w-8 h-8 rounded-full bg-[#EAF5FF] text-[#0B63CE] font-bold flex items-center justify-center text-xs shrink-0 border border-[#BCE0FD]">
                        {row.actor?.name ? row.actor.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div className="min-w-0">
                        <span className="font-semibold text-xs text-[#112743] block truncate max-w-[150px]">
                            {row.actor?.name || 'Sistem Otomatis'}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-medium bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                                {row.actor?.role || 'System'}
                            </span>
                            {row.actor?.email && (
                                <span className="text-[10px] text-[#6B7C93] truncate max-w-[110px]" title={row.actor.email}>
                                    {row.actor.email}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: 'Aksi / Event',
            cell: (row) => (
                <div className="space-y-1">
                    <div>{getEventBadge(row.event, row.event_label)}</div>
                    <span className="text-[10px] font-mono text-[#6B7C93] block truncate max-w-[200px]">
                        {row.event}
                    </span>
                </div>
            ),
        },
        {
            header: 'Uraian Aktivitas & Jaringan',
            cell: (row) => (
                <div className="space-y-1 max-w-md">
                    <p className="text-xs text-[#112743] line-clamp-2 leading-relaxed">
                        {row.description}
                    </p>
                    {row.ip_address && (
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#6B7C93]">
                            <Globe className="w-3 h-3 text-[#94A3B8]" />
                            <span>{row.ip_address}</span>
                        </div>
                    )}
                </div>
            ),
        },
        {
            header: 'Aksi',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (row) => (
                <Button
                    variant="ghost"
                    size="sm"
                    icon={Eye}
                    onClick={() => setDetailActivity(row)}
                >
                    Detail
                </Button>
            ),
        },
    ];

    return (
        <AdminLayout title="Master Audit Log Aktivitas">
            <PageHeader
                title="Master Log Aktivitas & Audit Trail"
                description="Rekaman audit lengkap sistem untuk autentikasi login/logout, navigasi menu event, pembaruan materi, pengguna, dan pengaturan."
                breadcrumbs={[{ label: 'Aktivitas & Master Log' }]}
            />

            <div className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs overflow-hidden mb-8">
                <TableToolbar
                    search={search}
                    onSearchChange={setSearch}
                    onSearchSubmit={() => applyFilters({ q: search })}
                    searchPlaceholder="Cari aktivitas, aktor, IP, atau deskripsi..."
                    showSearch={true}
                    hasActiveFilters={hasActiveFilters}
                    onReset={handleReset}
                >
                    <FilterBar>
                        {/* Kategori Grup Filter */}
                        <FilterSelect
                            value={selectedCategory}
                            onChange={(value) => {
                                setSelectedCategory(value);
                                applyFilters({ category: value });
                            }}
                            placeholder="Semua Kategori Aksi"
                            ariaLabel="Filter kategori aktivitas"
                            options={categories}
                        />

                        {/* Event Filter */}
                        <FilterSelect
                            value={selectedEvent}
                            onChange={(value) => {
                                setSelectedEvent(value);
                                applyFilters({ event: value });
                            }}
                            placeholder="Semua Jenis Aksi"
                            ariaLabel="Filter jenis aktivitas"
                            options={events}
                        />

                        {/* Role Filter */}
                        <FilterSelect
                            value={selectedRole}
                            onChange={(value) => {
                                setSelectedRole(value);
                                applyFilters({ role: value });
                            }}
                            placeholder="Semua Peran"
                            ariaLabel="Filter peran aktor"
                            options={roles}
                        />

                        {/* Actor Filter */}
                        <FilterSelect
                            value={selectedActor}
                            onChange={(value) => {
                                setSelectedActor(value);
                                applyFilters({ actor_id: value });
                            }}
                            placeholder="Semua Aktor"
                            ariaLabel="Filter aktor aktivitas"
                            options={actors.map((actor) => ({ value: actor.id, label: actor.label }))}
                        />

                        {/* Date Range Filter */}
                        <div className="flex items-center gap-1.5 bg-[#F8FBFF] border border-[#DCE7F3] rounded-lg px-2.5 py-1.5 text-xs text-[#112743]">
                            <Calendar className="w-3.5 h-3.5 text-[#6B7C93] shrink-0" />
                            <span className="text-[11px] text-[#6B7C93] font-medium">Dari:</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    applyFilters({ start_date: e.target.value });
                                }}
                                className="bg-transparent border-0 p-0 text-xs text-[#112743] focus:ring-0 focus:outline-none cursor-pointer"
                                aria-label="Filter tanggal mulai"
                            />
                            <span className="text-[11px] text-[#6B7C93] font-medium ml-1">S/d:</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    applyFilters({ end_date: e.target.value });
                                }}
                                className="bg-transparent border-0 p-0 text-xs text-[#112743] focus:ring-0 focus:outline-none cursor-pointer"
                                aria-label="Filter tanggal akhir"
                            />
                        </div>
                    </FilterBar>
                </TableToolbar>

                <DataTable
                    columns={columns}
                    data={activities.data}
                    pagination={activities}
                    emptyTitle="Tidak Ada Rekaman Aktivitas"
                    emptyDescription="Belum ada aktivitas yang cocok dengan pencarian atau filter yang Anda tentukan."
                    actionText="Reset Filter"
                    onEmptyAction={handleReset}
                />
            </div>

            {/* Detail Modal */}
            <Modal
                isOpen={Boolean(detailActivity)}
                onClose={() => setDetailActivity(null)}
                title="Rincian Master Audit Log"
                description={`ID Log #${detailActivity?.id} — ${detailActivity?.created_at}`}
                size="lg"
            >
                <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-[#F8FBFF] border border-[#DCE7F3]">
                        <div>
                            <span className="text-[#6B7C93] block text-[11px]">Aktor:</span>
                            <span className="font-semibold text-[#112743] text-sm">
                                {detailActivity?.actor?.name || 'Sistem Otomatis'}
                            </span>
                            <span className="text-[#6B7C93] block text-[11px] mt-0.5">
                                Peran: <span className="font-medium text-[#112743]">{detailActivity?.actor?.role || 'System'}</span>
                                {detailActivity?.actor?.email && ` • ${detailActivity?.actor?.email}`}
                            </span>
                        </div>
                        <div>
                            <span className="text-[#6B7C93] block text-[11px]">Aksi / Event:</span>
                            <div className="mt-0.5">
                                {detailActivity && getEventBadge(detailActivity.event, detailActivity.event_label)}
                            </div>
                            <span className="font-mono text-[11px] text-[#0B63CE] block mt-1">
                                {detailActivity?.event}
                            </span>
                        </div>
                        <div className="col-span-2 pt-2 border-t border-[#DCE7F3]/60">
                            <span className="text-[#6B7C93] block text-[11px]">Deskripsi Lengkap:</span>
                            <span className="font-medium text-[#112743] block mt-0.5 text-xs leading-relaxed">
                                {detailActivity?.description}
                            </span>
                        </div>
                        <div>
                            <span className="text-[#6B7C93] block text-[11px]">Alamat IP:</span>
                            <span className="font-mono text-xs text-[#112743] flex items-center gap-1.5 mt-0.5">
                                <Globe className="w-3.5 h-3.5 text-[#6B7C93]" />
                                {detailActivity?.ip_address || '-'}
                            </span>
                        </div>
                        <div>
                            <span className="text-[#6B7C93] block text-[11px]">Waktu Presisi:</span>
                            <span className="font-mono text-xs text-[#112743] flex items-center gap-1.5 mt-0.5">
                                <Calendar className="w-3.5 h-3.5 text-[#6B7C93]" />
                                {detailActivity?.created_at} ({detailActivity?.created_at_relative})
                            </span>
                        </div>
                        {detailActivity?.user_agent && (
                            <div className="col-span-2 pt-2 border-t border-[#DCE7F3]/60">
                                <span className="text-[#6B7C93] block text-[11px] mb-1">User Agent / Perangkat:</span>
                                <span className="font-mono text-[11px] text-[#475569] bg-white p-2 rounded border border-[#E2E8F0] block break-all">
                                    {detailActivity.user_agent}
                                </span>
                            </div>
                        )}
                    </div>

                    <div>
                        <h4 className="font-semibold uppercase tracking-wider text-[11px] text-[#6B7C93] mb-1.5">
                            Data Properti Snapshot (JSON)
                        </h4>
                        <pre className="p-3.5 bg-[#0E2747] text-[#EAF5FF] rounded-lg overflow-x-auto text-[11px] font-mono leading-relaxed max-h-60">
                            {JSON.stringify(detailActivity?.properties || {}, null, 2)}
                        </pre>
                    </div>

                    <div className="pt-3 border-t border-[#DCE7F3] flex justify-end">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setDetailActivity(null)}
                        >
                            Tutup
                        </Button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}
