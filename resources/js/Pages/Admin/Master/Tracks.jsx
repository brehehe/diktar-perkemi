import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/admin/PageHeader';
import Button from '../../../Components/ui/Button';
import DataTable from '../../../Components/ui/DataTable';
import FilterSelect from '../../../Components/admin/FilterSelect';
import TableToolbar from '../../../Components/admin/TableToolbar';
import Tabs from '../../../Components/admin/Tabs';
import TrackDialogs from './Partials/TrackDialogs';
import { Compass, Layers, Plus, Edit3, Trash2, Upload, Download } from 'lucide-react';
import { useIsProdas } from '../../../Utils/isProdas';

export default function Tracks({ tracks = [], legends = [], events = [], filters = {} }) {
    const isProdas = useIsProdas();
    const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const [activeTab, setActiveTab] = useState(filters.tab || urlParams.get('tab') || 'jalur');
    const [search, setSearch] = useState(filters.q || '');
    const [selectedScope, setSelectedScope] = useState(filters.scope || '');

    // Modals
    const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
    const [editingTrack, setEditingTrack] = useState(null);
    const [isTrackImportModalOpen, setIsTrackImportModalOpen] = useState(false);

    const [isLegendModalOpen, setIsLegendModalOpen] = useState(false);
    const [editingLegend, setEditingLegend] = useState(null);
    const [isLegendImportModalOpen, setIsLegendImportModalOpen] = useState(false);

    // Delete state
    const [deletingTrack, setDeletingTrack] = useState(null);
    const [deletingLegend, setDeletingLegend] = useState(null);

    const trackImportForm = useForm({
        file: null,
        event_id: '',
    });

    const legendImportForm = useForm({
        file: null,
        event_id: '',
    });

    const trackForm = useForm({
        code: '',
        name: '',
        description: '',
        badge_color: 'bg-blue-100 text-blue-800',
        is_dual_track: false,
        event_id: '',
    });

    const legendForm = useForm({
        category: 'general',
        code: '',
        term: '',
        description: '',
        badge_color: 'bg-slate-100 text-slate-700',
        event_id: '',
    });

    const applyFilters = (overrides = {}) => {
        router.get(
            '/admin/master/jalur',
            {
                tab: activeTab,
                q: search,
                scope: selectedScope,
                ...overrides,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setSelectedScope('');
        router.get('/admin/master/jalur', { tab: activeTab }, { preserveState: true, replace: true });
    };

    const openEditTrack = (t) => {
        setEditingTrack(t);
        trackForm.setData({
            code: t.code,
            name: t.name,
            description: t.description || '',
            badge_color: t.badge_color,
            is_dual_track: Boolean(t.is_dual_track),
            event_id: t.event_id ? String(t.event_id) : '',
        });
        setIsTrackModalOpen(true);
    };

    const handleSaveTrack = (e) => {
        e.preventDefault();
        if (editingTrack) {
            trackForm.put(`/admin/master/jalur/${editingTrack.id}`, {
                onSuccess: () => {
                    setIsTrackModalOpen(false);
                    setEditingTrack(null);
                },
            });
        } else {
            trackForm.post('/admin/master/jalur', {
                onSuccess: () => {
                    setIsTrackModalOpen(false);
                    trackForm.reset();
                },
            });
        }
    };

    const openEditLegend = (l) => {
        setEditingLegend(l);
        legendForm.setData({
            category: l.category || 'general',
            code: l.code,
            term: l.term,
            description: l.description || '',
            badge_color: l.badge_color || 'bg-slate-100 text-slate-700',
            event_id: l.event_id ? String(l.event_id) : '',
        });
        setIsLegendModalOpen(true);
    };

    const handleSaveLegend = (e) => {
        e.preventDefault();
        if (editingLegend) {
            legendForm.put(`/admin/master/legenda/${editingLegend.id}`, {
                onSuccess: () => {
                    setIsLegendModalOpen(false);
                    setEditingLegend(null);
                },
            });
        } else {
            legendForm.post('/admin/master/legenda', {
                onSuccess: () => {
                    setIsLegendModalOpen(false);
                    legendForm.reset();
                },
            });
        }
    };

    const handleDeleteTrack = () => {
        if (!deletingTrack) return;
        router.delete(`/admin/master/jalur/${deletingTrack.id}`, {
            onSuccess: () => setDeletingTrack(null),
        });
    };

    const handleDeleteLegend = () => {
        if (!deletingLegend) return;
        router.delete(`/admin/master/legenda/${deletingLegend.id}`, {
            onSuccess: () => setDeletingLegend(null),
        });
    };

    const trackColumns = [
        {
            header: 'Kode & Jalur',
            cell: (track) => (
                <div>
                    <span className={`inline-flex rounded px-2 py-0.5 font-mono text-xs font-bold ${track.badge_color}`}>{track.code}</span>
                    <p className="mt-1 font-semibold text-[#0E2747]">{track.name}</p>
                </div>
            ),
        },
        { header: 'Deskripsi', cell: (track) => <p className="max-w-md text-[#6B7C93]">{track.description || '—'}</p> },
        {
            header: 'Jenis Kelas',
            cell: (track) => track.is_dual_track
                ? <span className="font-semibold text-[#7957D5]">Kualifikasi Ganda</span>
                : <span className="text-[#6B7C93]">Jalur Tunggal</span>,
        },
        {
            header: 'Cakupan / Sumber',
            cell: (track) => track.event_id ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    🎯 {track.event?.title || 'Event'}
                </span>
            ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    🌐 Master Diktar
                </span>
            ),
        },
        {
            header: 'Aksi',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (track) => (
                <div className="flex justify-end gap-1">
                    {track.event_id && (
                        <Link
                            href={`/admin/event/${track.event_id}`}
                            className="inline-flex items-center text-xs font-semibold text-[#0B63CE] hover:underline mr-1"
                        >
                            Event
                        </Link>
                    )}
                    <Button variant="ghost" size="sm" icon={Edit3} onClick={() => openEditTrack(track)}>
                        Edit
                    </Button>
                    <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setDeletingTrack(track)} className="text-[#DD4D7C]">
                        Hapus
                    </Button>
                </div>
            ),
        },
    ];

    const legendColumns = [
        { header: 'Singkatan', cell: (legend) => <span className="rounded border border-[#BCE0FD] bg-[#EAF5FF] px-2 py-0.5 font-mono font-bold text-[#0B63CE]">{legend.code}</span> },
        { header: 'Istilah Resmi', cell: (legend) => <span className="font-semibold text-[#0E2747]">{legend.term}</span> },
        { header: 'Kategori', cell: (legend) => <span className="capitalize text-[#6B7C93]">{legend.category}</span> },
        { header: 'Keterangan', cell: (legend) => <p className="max-w-sm text-[#6B7C93]">{legend.description || '—'}</p> },
        {
            header: 'Cakupan / Sumber',
            cell: (legend) => legend.event_id ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    🎯 {legend.event?.title || 'Event'}
                </span>
            ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    🌐 Master Diktar
                </span>
            ),
        },
        {
            header: 'Aksi',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (legend) => (
                <div className="flex justify-end gap-1">
                    {legend.event_id && (
                        <Link
                            href={`/admin/event/${legend.event_id}`}
                            className="inline-flex items-center text-xs font-semibold text-[#0B63CE] hover:underline mr-1"
                        >
                            Event
                        </Link>
                    )}
                    <Button variant="ghost" size="sm" icon={Edit3} onClick={() => openEditLegend(legend)}>
                        Edit
                    </Button>
                    <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setDeletingLegend(legend)} className="text-[#DD4D7C]">
                        Hapus
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout>
            <Head title="Master Jalur & Legenda PERKEMI" />

            <div className="space-y-6">
                <PageHeader
                    title="Master Jalur Peserta & Legenda Singkatan"
                    description={isProdas
                        ? 'Kelola standarisasi kode jalur kualifikasi pendidikan dan glosarium singkatan institusional.'
                        : 'Kelola standarisasi kode jalur kualifikasi penataran (Pelatih, Penguji, Wasit) dan glosarium singkatan institusional.'}
                    breadcrumbs={[
                        { label: 'Event', href: '/admin/event' },
                        { label: 'Jalur & Legenda' },
                    ]}
                />

                <Tabs
                    tabs={[
                        { id: 'jalur', label: 'Master Jalur Peserta', icon: Compass, count: tracks.length },
                        { id: 'legenda', label: 'Legenda & Singkatan', icon: Layers, count: legends.length },
                    ]}
                    activeTab={activeTab}
                    onChange={(newTab) => {
                        setActiveTab(newTab);
                        router.get('/admin/master/jalur', { tab: newTab, q: search, scope: selectedScope }, { preserveState: true, replace: true });
                    }}
                    ariaLabel="Master referensi event"
                />

                <div className="overflow-hidden rounded-xl border border-[#DCE7F3] bg-white shadow-xs">
                    <TableToolbar
                        search={search}
                        onSearchChange={setSearch}
                        onSearchSubmit={() => applyFilters()}
                        searchPlaceholder="Cari kode, nama, atau deskripsi…"
                        searchLabel="Cari referensi"
                        hasActiveFilters={Boolean(search || selectedScope)}
                        onReset={handleReset}
                    >
                        <FilterSelect
                            value={selectedScope}
                            onChange={(value) => {
                                setSelectedScope(value);
                                applyFilters({ scope: value });
                            }}
                            placeholder="Semua Cakupan"
                            ariaLabel="Filter cakupan event atau nasional"
                            options={[
                                { value: 'master', label: 'Master Diktar (Lintas Event)' },
                                ...events.map((ev) => ({
                                    value: String(ev.id),
                                    label: `Event: ${ev.title}`,
                                })),
                            ]}
                        />
                    </TableToolbar>
                </div>

                {/* TAB 1: JALUR PESERTA */}
                {activeTab === 'jalur' && (
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs text-[#6B7C93]">
                                Master Jalur Kualifikasi Nasional PB PERKEMI & Khusus Event
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                                <a
                                    href={`/admin/master/jalur/ekspor${selectedScope ? `?scope=${selectedScope}` : ''}`}
                                    className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#DCE7F3] bg-white px-3 py-1.5 text-xs font-semibold text-[#0E2747] shadow-2xs hover:bg-[#F8FBFF] hover:border-[#0B63CE]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                                >
                                    <Download className="w-3.5 h-3.5 text-[#0B63CE]" />
                                    <span>Ekspor CSV</span>
                                </a>
                                <a
                                    href="/admin/master/jalur/template"
                                    className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#DCE7F3] bg-white px-3 py-1.5 text-xs font-semibold text-[#0E2747] shadow-2xs hover:bg-[#F8FBFF] hover:border-[#0B63CE]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                                    download="template-jalur.csv"
                                >
                                    <Download className="w-3.5 h-3.5 text-[#0B63CE]" />
                                    <span>Format CSV</span>
                                </a>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    icon={Upload}
                                    onClick={() => {
                                        trackImportForm.reset();
                                        trackImportForm.clearErrors();
                                        setIsTrackImportModalOpen(true);
                                    }}
                                >
                                    Impor Jalur
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    icon={<Plus className="w-4 h-4" />}
                                    onClick={() => {
                                        setEditingTrack(null);
                                        trackForm.reset();
                                        setIsTrackModalOpen(true);
                                    }}
                                >
                                    Tambah Jalur Baru
                                </Button>
                            </div>
                        </div>

                        <DataTable
                            columns={trackColumns}
                            data={tracks}
                            ariaLabel="Daftar jalur peserta"
                            emptyTitle="Belum Ada Jalur Peserta"
                            emptyDescription="Tambahkan jalur kualifikasi agar dapat digunakan pada event."
                        />
                    </div>
                )}

                {/* TAB 2: LEGENDA & SINGKATAN */}
                {activeTab === 'legenda' && (
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs text-[#6B7C93]">
                                Glosarium Singkatan Resmi (JP, K3, NLP, P3K, AD/ART, WSKO, PB PERKEMI)
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                                <a
                                    href={`/admin/master/legenda/ekspor${selectedScope ? `?scope=${selectedScope}` : ''}`}
                                    className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#DCE7F3] bg-white px-3 py-1.5 text-xs font-semibold text-[#0E2747] shadow-2xs hover:bg-[#F8FBFF] hover:border-[#0B63CE]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                                >
                                    <Download className="w-3.5 h-3.5 text-[#0B63CE]" />
                                    <span>Ekspor CSV</span>
                                </a>
                                <a
                                    href="/admin/master/legenda/template"
                                    className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#DCE7F3] bg-white px-3 py-1.5 text-xs font-semibold text-[#0E2747] shadow-2xs hover:bg-[#F8FBFF] hover:border-[#0B63CE]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                                    download="template-legenda.csv"
                                >
                                    <Download className="w-3.5 h-3.5 text-[#0B63CE]" />
                                    <span>Format CSV</span>
                                </a>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    icon={Upload}
                                    onClick={() => {
                                        legendImportForm.reset();
                                        legendImportForm.clearErrors();
                                        setIsLegendImportModalOpen(true);
                                    }}
                                >
                                    Impor Singkatan
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    icon={<Plus className="w-4 h-4" />}
                                    onClick={() => {
                                        setEditingLegend(null);
                                        legendForm.reset();
                                        setIsLegendModalOpen(true);
                                    }}
                                >
                                    Tambah Singkatan
                                </Button>
                            </div>
                        </div>

                        <DataTable
                            columns={legendColumns}
                            data={legends}
                            ariaLabel="Daftar legenda dan singkatan"
                            emptyTitle="Belum Ada Legenda"
                            emptyDescription="Tambahkan istilah atau singkatan resmi agar dapat digunakan pada event."
                        />
                    </div>
                )}
            </div>

            <TrackDialogs
                events={events}
                isTrackModalOpen={isTrackModalOpen}
                setIsTrackModalOpen={setIsTrackModalOpen}
                editingTrack={editingTrack}
                isTrackImportModalOpen={isTrackImportModalOpen}
                setIsTrackImportModalOpen={setIsTrackImportModalOpen}
                isLegendModalOpen={isLegendModalOpen}
                setIsLegendModalOpen={setIsLegendModalOpen}
                editingLegend={editingLegend}
                isLegendImportModalOpen={isLegendImportModalOpen}
                setIsLegendImportModalOpen={setIsLegendImportModalOpen}
                deletingTrack={deletingTrack}
                setDeletingTrack={setDeletingTrack}
                deletingLegend={deletingLegend}
                setDeletingLegend={setDeletingLegend}
                trackImportForm={trackImportForm}
                legendImportForm={legendImportForm}
                trackForm={trackForm}
                legendForm={legendForm}
                handleSaveTrack={handleSaveTrack}
                handleSaveLegend={handleSaveLegend}
                handleDeleteTrack={handleDeleteTrack}
                handleDeleteLegend={handleDeleteLegend}
            />
        </AdminLayout>
    );
}
