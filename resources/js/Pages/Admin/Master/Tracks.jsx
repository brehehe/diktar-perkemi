import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/admin/PageHeader';
import Button from '../../../Components/ui/Button';
import Modal from '../../../Components/ui/Modal';
import FormField from '../../../Components/ui/FormField';
import Input from '../../../Components/ui/Input';
import Select from '../../../Components/ui/Select';
import Textarea from '../../../Components/ui/Textarea';
import AlertDialog from '../../../Components/ui/AlertDialog';
import Checkbox from '../../../Components/ui/Checkbox';
import DataTable from '../../../Components/ui/DataTable';
import FileInput from '../../../Components/ui/FileInput';
import FilterSelect from '../../../Components/admin/FilterSelect';
import TableToolbar from '../../../Components/admin/TableToolbar';
import Tabs from '../../../Components/admin/Tabs';
import {
    Compass,
    Layers,
    Plus,
    Edit3,
    Trash2,
    Award,
    HelpCircle,
    Check,
    Upload,
    Download,
    FileSpreadsheet,
} from 'lucide-react';

export default function Tracks({ tracks = [], legends = [], events = [], filters = {} }) {
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
                    description="Kelola standarisasi kode jalur kualifikasi penataran (Pelatih, Penguji, Wasit) dan glosarium singkatan institusional."
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

            {/* Modal Jalur */}
            <Modal
                isOpen={isTrackModalOpen}
                onClose={() => setIsTrackModalOpen(false)}
                title={editingTrack ? `Edit Jalur: ${editingTrack.code}` : 'Tambah Jalur Kualifikasi'}
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsTrackModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" form="track-form" variant="primary" loading={trackForm.processing}>
                            Simpan Jalur
                        </Button>
                    </>
                }
            >
                <form id="track-form" onSubmit={handleSaveTrack} className="space-y-4">
                    <FormField label="Cakupan (Admin / Event)" error={trackForm.errors.event_id}>
                        <Select
                            value={trackForm.data.event_id || ''}
                            onChange={(e) => trackForm.setData('event_id', e.target.value)}
                            options={[
                                { value: '', label: '🌐 Master Nasional / Diktar (Lintas Event)' },
                                ...events.map((ev) => ({
                                    value: String(ev.id),
                                    label: `🎯 Khusus Event: ${ev.title}`,
                                })),
                            ]}
                        />
                    </FormField>

                    <FormField label="Kode Jalur" error={trackForm.errors.code} required>
                        <Input
                            value={trackForm.data.code}
                            onChange={(e) => trackForm.setData('code', e.target.value.toUpperCase())}
                            placeholder="Contoh: PD, WAN, PWAD"
                            required
                        />
                    </FormField>

                    <FormField label="Nama Lengkap Jalur" error={trackForm.errors.name} required>
                        <Input
                            value={trackForm.data.name}
                            onChange={(e) => trackForm.setData('name', e.target.value)}
                            placeholder="Contoh: Pelatih Daerah"
                            required
                        />
                    </FormField>

                    <FormField label="Deskripsi">
                        <Textarea
                            value={trackForm.data.description}
                            onChange={(e) => trackForm.setData('description', e.target.value)}
                            rows={3}
                        />
                    </FormField>

                    <FormField label="Kelas Warna Badge">
                        <Input
                            value={trackForm.data.badge_color}
                            onChange={(e) => trackForm.setData('badge_color', e.target.value)}
                            placeholder="bg-blue-100 text-blue-800"
                        />
                    </FormField>

                    <Checkbox
                        id="is_dual"
                        checked={trackForm.data.is_dual_track}
                        onChange={(event) => trackForm.setData('is_dual_track', event.target.checked)}
                        label="Kualifikasi Ganda"
                        helperText="Memerlukan rotasi paralel A1 dan A2."
                    />
                </form>
            </Modal>

            {/* Modal Legenda */}
            <Modal
                isOpen={isLegendModalOpen}
                onClose={() => setIsLegendModalOpen(false)}
                title={editingLegend ? `Edit Singkatan: ${editingLegend.code}` : 'Tambah Singkatan Resmi'}
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsLegendModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" form="legend-form" variant="primary" loading={legendForm.processing}>
                            Simpan Singkatan
                        </Button>
                    </>
                }
            >
                <form id="legend-form" onSubmit={handleSaveLegend} className="space-y-4">
                    <FormField label="Cakupan (Admin / Event)" error={legendForm.errors.event_id}>
                        <Select
                            value={legendForm.data.event_id || ''}
                            onChange={(e) => legendForm.setData('event_id', e.target.value)}
                            options={[
                                { value: '', label: '🌐 Master Nasional / Diktar (Lintas Event)' },
                                ...events.map((ev) => ({
                                    value: String(ev.id),
                                    label: `🎯 Khusus Event: ${ev.title}`,
                                })),
                            ]}
                        />
                    </FormField>

                    <FormField label="Singkatan (Kode)" error={legendForm.errors.code} required>
                        <Input
                            value={legendForm.data.code}
                            onChange={(e) => legendForm.setData('code', e.target.value.toUpperCase())}
                            placeholder="Contoh: K3, WSKO"
                            required
                        />
                    </FormField>

                    <FormField label="Kepanjangan / Istilah Lengkap" error={legendForm.errors.term} required>
                        <Input
                            value={legendForm.data.term}
                            onChange={(e) => legendForm.setData('term', e.target.value)}
                            placeholder="Contoh: Kesehatan, Keselamatan, dan Keamanan"
                            required
                        />
                    </FormField>

                    <FormField label="Kategori">
                        <Select
                            value={legendForm.data.category}
                            onChange={(e) => legendForm.setData('category', e.target.value)}
                        >
                            <option value="general">Umum</option>
                            <option value="track">Jalur Peserta</option>
                            <option value="session_type">Jenis Sesi Rundown</option>
                        </Select>
                    </FormField>

                    <FormField label="Keterangan / Definisi">
                        <Textarea
                            value={legendForm.data.description}
                            onChange={(e) => legendForm.setData('description', e.target.value)}
                            rows={3}
                        />
                    </FormField>
                </form>
            </Modal>

            {/* Alert Dialog Hapus Legenda */}
            <AlertDialog
                isOpen={Boolean(deletingLegend)}
                onClose={() => setDeletingLegend(null)}
                title="Hapus Singkatan?"
                description={`Apakah Anda yakin ingin menghapus singkatan "${deletingLegend?.code}"?`}
                confirmText="Hapus"
                cancelText="Batal"
                variant="danger"
                onConfirm={handleDeleteLegend}
            />

            {/* Alert Dialog Hapus Track */}
            <AlertDialog
                isOpen={Boolean(deletingTrack)}
                onClose={() => setDeletingTrack(null)}
                title="Hapus Jalur Peserta?"
                description={`Apakah Anda yakin ingin menghapus jalur "${deletingTrack?.name}" (${deletingTrack?.code})?`}
                confirmText="Hapus"
                cancelText="Batal"
                variant="danger"
                onConfirm={handleDeleteTrack}
            />

            {/* Modal: Impor Jalur */}
            <Modal
                isOpen={isTrackImportModalOpen}
                onClose={() => setIsTrackImportModalOpen(false)}
                title="Impor Jalur Peserta (.csv)"
                description="Unggah berkas CSV untuk menambahkan jalur kualifikasi peserta secara massal."
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsTrackImportModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            form="track-import-form"
                            disabled={!trackImportForm.data.file || trackImportForm.processing}
                            loading={trackImportForm.processing}
                            className="bg-[#0B63CE] text-white"
                        >
                            {trackImportForm.processing ? 'Mengimpor...' : 'Mulai Impor'}
                        </Button>
                    </>
                }
            >
                <form
                    id="track-import-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        trackImportForm.post('/admin/master/jalur/impor', {
                            forceFormData: true,
                            onSuccess: () => {
                                trackImportForm.reset();
                                setIsTrackImportModalOpen(false);
                            },
                        });
                    }}
                    className="space-y-4"
                >
                    <div className="rounded-xl border border-[#DCE7F3] bg-[#F8FBFF] p-4 text-xs text-[#112743] space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-[#0E2747] flex items-center gap-1.5">
                                <FileSpreadsheet className="w-4 h-4 text-[#0B63CE]" />
                                Format Jalur CSV
                            </span>
                            <a
                                href="/admin/master/jalur/template"
                                className="font-semibold text-[#0B63CE] hover:underline flex items-center gap-1"
                                download="template-jalur.csv"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Unduh template (.csv)
                            </a>
                        </div>
                        <p className="text-[#6B7C93] leading-relaxed">
                            Format CSV mendukung kolom: <code>code, name, description, badge_color, is_dual_track</code>.
                        </p>
                    </div>

                    <FormField label="Target Cakupan Impor" error={trackImportForm.errors.event_id}>
                        <Select
                            value={trackImportForm.data.event_id || ''}
                            onChange={(e) => trackImportForm.setData('event_id', e.target.value)}
                            options={[
                                { value: '', label: '🌐 Master Nasional / Diktar (Lintas Event)' },
                                ...events.map((ev) => ({
                                    value: String(ev.id),
                                    label: `🎯 Khusus Event: ${ev.title}`,
                                })),
                            ]}
                        />
                    </FormField>

                    <FileInput
                        id="track-import-file"
                        name="file"
                        label="Pilih Berkas CSV (.csv)"
                        accept=".csv,text/csv"
                        required
                        onChange={(e) => trackImportForm.setData('file', e.target.files?.[0] || null)}
                        error={trackImportForm.errors.file}
                        helperText="Format berkas harus .csv dengan pemisah koma."
                    />
                </form>
            </Modal>

            {/* Modal: Impor Legenda */}
            <Modal
                isOpen={isLegendImportModalOpen}
                onClose={() => setIsLegendImportModalOpen(false)}
                title="Impor Legenda & Singkatan (.csv)"
                description="Unggah berkas CSV untuk menambahkan istilah atau singkatan resmi secara massal."
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsLegendImportModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            form="legend-import-form"
                            disabled={!legendImportForm.data.file || legendImportForm.processing}
                            loading={legendImportForm.processing}
                            className="bg-[#0B63CE] text-white"
                        >
                            {legendImportForm.processing ? 'Mengimpor...' : 'Mulai Impor'}
                        </Button>
                    </>
                }
            >
                <form
                    id="legend-import-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        legendImportForm.post('/admin/master/legenda/impor', {
                            forceFormData: true,
                            onSuccess: () => {
                                legendImportForm.reset();
                                setIsLegendImportModalOpen(false);
                            },
                        });
                    }}
                    className="space-y-4"
                >
                    <div className="rounded-xl border border-[#DCE7F3] bg-[#F8FBFF] p-4 text-xs text-[#112743] space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-[#0E2747] flex items-center gap-1.5">
                                <FileSpreadsheet className="w-4 h-4 text-[#0B63CE]" />
                                Format Singkatan CSV
                            </span>
                            <a
                                href="/admin/master/legenda/template"
                                className="font-semibold text-[#0B63CE] hover:underline flex items-center gap-1"
                                download="template-legenda.csv"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Unduh template (.csv)
                            </a>
                        </div>
                        <p className="text-[#6B7C93] leading-relaxed">
                            Format CSV mendukung kolom: <code>code, term, category, description, badge_color</code>.
                        </p>
                    </div>

                    <FormField label="Target Cakupan Impor" error={legendImportForm.errors.event_id}>
                        <Select
                            value={legendImportForm.data.event_id || ''}
                            onChange={(e) => legendImportForm.setData('event_id', e.target.value)}
                            options={[
                                { value: '', label: '🌐 Master Nasional / Diktar (Lintas Event)' },
                                ...events.map((ev) => ({
                                    value: String(ev.id),
                                    label: `🎯 Khusus Event: ${ev.title}`,
                                })),
                            ]}
                        />
                    </FormField>

                    <FileInput
                        id="legend-import-file"
                        name="file"
                        label="Pilih Berkas CSV (.csv)"
                        accept=".csv,text/csv"
                        required
                        onChange={(e) => legendImportForm.setData('file', e.target.files?.[0] || null)}
                        error={legendImportForm.errors.file}
                        helperText="Format berkas harus .csv dengan pemisah koma."
                    />
                </form>
            </Modal>
        </AdminLayout>
    );
}
