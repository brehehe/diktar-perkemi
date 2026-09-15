import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/admin/PageHeader';
import DataTable from '../../../Components/ui/DataTable';
import TableToolbar from '../../../Components/admin/TableToolbar';
import FilterBar from '../../../Components/admin/FilterBar';
import Modal from '../../../Components/ui/Modal';
import Badge from '../../../Components/ui/Badge';
import Button from '../../../Components/ui/Button';
import { History, Eye, User, Calendar, ShieldAlert } from 'lucide-react';

export default function Index({
    activities,
    actors = [],
    events = [],
    filters = {},
}) {
    const [selectedEvent, setSelectedEvent] = useState(filters.event || '');
    const [selectedActor, setSelectedActor] = useState(filters.actor_id || '');
    const [detailActivity, setDetailActivity] = useState(null);

    const applyFilters = (customParams = {}) => {
        const params = {
            event: selectedEvent,
            actor_id: selectedActor,
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
        setSelectedEvent('');
        setSelectedActor('');
        router.get('/admin/aktivitas', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getEventBadgeVariant = (event) => {
        if (event.includes('created')) return 'success';
        if (event.includes('deleted')) return 'danger';
        if (event.includes('updated') || event.includes('status')) return 'warning';
        return 'primary';
    };

    const columns = [
        {
            header: 'Waktu Kejadian',
            cell: (row) => (
                <div>
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
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#EAF5FF] text-[#0B63CE] font-bold flex items-center justify-center text-[10px] shrink-0 border border-[#BCE0FD]">
                        {row.actor?.name ? row.actor.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div>
                        <span className="font-semibold text-xs text-[#112743] block truncate max-w-[140px]">
                            {row.actor?.name || 'Sistem Otomatis'}
                        </span>
                        <span className="text-[10px] text-[#6B7C93]">
                            {row.actor?.role || 'System Bot'}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            header: 'Aksi Sistem',
            cell: (row) => (
                <Badge variant={getEventBadgeVariant(row.event)}>
                    {row.event}
                </Badge>
            ),
        },
        {
            header: 'Uraian Aktivitas',
            cell: (row) => (
                <p className="text-xs text-[#112743] max-w-md line-clamp-2">
                    {row.description}
                </p>
            ),
        },
        {
            header: 'Detail',
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
        <AdminLayout title="Audit Log Aktivitas Sistem">
            <PageHeader
                title="Aktivitas & Audit Trail"
                description="Rekaman jejak audit sistem riil tanpa data fiktif untuk seluruh aktivitas pembaruan materi, pengguna, dan pengaturan."
                breadcrumbs={[{ label: 'Aktivitas' }]}
            />

            <div className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs overflow-hidden mb-8">
                <TableToolbar
                    search=""
                    onSearchChange={() => {}}
                    onSearchSubmit={() => {}}
                    hasActiveFilters={Boolean(selectedEvent || selectedActor)}
                    onReset={handleReset}
                >
                    <FilterBar>
                        {/* Event filter */}
                        <select
                            value={selectedEvent}
                            onChange={(e) => {
                                setSelectedEvent(e.target.value);
                                applyFilters({ event: e.target.value });
                            }}
                            className="bg-[#F8FBFF] border border-[#DCE7F3] rounded-lg px-2.5 py-2 text-xs text-[#112743] focus:outline-none focus:border-[#0B63CE]"
                        >
                            <option value="">Semua Jenis Aksi</option>
                            {events.map((e) => (
                                <option key={e.value} value={e.value}>
                                    {e.label}
                                </option>
                            ))}
                        </select>

                        {/* Actor filter */}
                        <select
                            value={selectedActor}
                            onChange={(e) => {
                                setSelectedActor(e.target.value);
                                applyFilters({ actor_id: e.target.value });
                            }}
                            className="bg-[#F8FBFF] border border-[#DCE7F3] rounded-lg px-2.5 py-2 text-xs text-[#112743] focus:outline-none focus:border-[#0B63CE]"
                        >
                            <option value="">Semua Aktor</option>
                            {actors.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.label}
                                </option>
                            ))}
                        </select>
                    </FilterBar>
                </TableToolbar>

                <DataTable
                    columns={columns}
                    data={activities.data}
                    pagination={activities}
                    emptyTitle="Tidak Ada Rekaman Aktivitas"
                    emptyDescription="Belum ada aktivitas yang cocok dengan filter yang Anda tentukan."
                    actionText="Reset Filter"
                    onEmptyAction={handleReset}
                />
            </div>

            {/* Detail Modal */}
            <Modal
                isOpen={Boolean(detailActivity)}
                onClose={() => setDetailActivity(null)}
                title="Rincian Audit Log Aktivitas"
                description={`ID Log #${detailActivity?.id} — ${detailActivity?.created_at}`}
                size="lg"
            >
                <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-[#F8FBFF] border border-[#DCE7F3]">
                        <div>
                            <span className="text-[#6B7C93] block">Aktor:</span>
                            <span className="font-semibold text-[#112743]">
                                {detailActivity?.actor?.name || 'Sistem Otomatis'} ({detailActivity?.actor?.role || 'System'})
                            </span>
                        </div>
                        <div>
                            <span className="text-[#6B7C93] block">Aksi / Event:</span>
                            <span className="font-mono font-semibold text-[#0B63CE]">
                                {detailActivity?.event}
                            </span>
                        </div>
                        <div className="col-span-2">
                            <span className="text-[#6B7C93] block">Deskripsi:</span>
                            <span className="font-medium text-[#112743]">
                                {detailActivity?.description}
                            </span>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold uppercase tracking-wider text-[11px] text-[#6B7C93] mb-1.5">
                            Data Properti Snapshot (JSON)
                        </h4>
                        <pre className="p-3 bg-[#0E2747] text-[#EAF5FF] rounded-lg overflow-x-auto text-[11px] font-mono leading-relaxed">
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
