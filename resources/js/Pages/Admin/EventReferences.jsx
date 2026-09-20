import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import PageHeader from '../../Components/admin/PageHeader';
import Tabs from '../../Components/admin/Tabs';
import DataTable from '../../Components/ui/DataTable';

export default function EventReferences({ tabs, activeTab, items }) {
    const columns = [
        { header: 'Kode', cell: (item) => <span className="font-mono text-xs text-[#0A3F82]">{item.code || '—'}</span> },
        { header: 'Nama / Isi', cell: (item) => <span className="block max-w-sm break-words font-semibold text-[#112743]">{item.name}</span> },
        { header: 'Keterangan', cell: (item) => <span className="text-[#6B7C93]">{item.detail || '—'}</span> },
        { header: 'Status', cell: (item) => <span className="text-[#6B7C93]">{item.status || '—'}</span> },
        { header: 'Sumber / Penggunaan', cell: (item) => <span className="text-[#6B7C93]">{item.source || '—'}</span> },
    ];

    return (
        <AdminLayout title="Referensi Event">
            <Head title="Referensi Event — Pustaka Penataran" />
            <div className="mx-auto w-full max-w-full space-y-6">
                <PageHeader
                    title="Referensi Event"
                    description="Lihat data master dan data yang dibuat khusus event. Perubahan data event dilakukan dari halaman event terkait."
                    breadcrumbs={[{ label: 'Event', href: '/admin/event' }, { label: 'Referensi Event' }]}
                />

                <Tabs
                    tabs={Object.entries(tabs).map(([key, label]) => ({
                        id: key,
                        label,
                        href: `/admin/referensi-event?tab=${key}`,
                    }))}
                    activeTab={activeTab}
                    ariaLabel="Jenis referensi event"
                />

                <section aria-labelledby="reference-heading">
                    <div className="mb-4 flex items-baseline justify-between gap-3">
                        <h2 id="reference-heading" className="font-display text-xl font-semibold text-[#0A3F82]">{tabs[activeTab]}</h2>
                        <span className="text-sm tabular-nums text-[#6B7C93]">{items.total} data</span>
                    </div>
                    <DataTable
                        columns={columns}
                        data={items.data}
                        pagination={items}
                        ariaLabel={`Daftar ${tabs[activeTab]}`}
                        emptyTitle="Belum Ada Data"
                        emptyDescription="Belum ada data pada bagian referensi ini."
                    />
                </section>
            </div>
        </AdminLayout>
    );
}
