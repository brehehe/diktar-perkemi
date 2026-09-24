import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/admin/PageHeader';
import DataTable from '../../../Components/ui/DataTable';
import TableToolbar from '../../../Components/admin/TableToolbar';
import FilterBar from '../../../Components/admin/FilterBar';
import FilterSelect from '../../../Components/admin/FilterSelect';
import Badge from '../../../Components/ui/Badge';
import Button from '../../../Components/ui/Button';
import DropdownMenu from '../../../Components/ui/DropdownMenu';
import AlertDialog from '../../../Components/ui/AlertDialog';
import {
    Plus,
    MoreVertical,
    Edit3,
    Trash2,
    BookOpen,
    Eye,
    CheckCircle,
    Archive,
    Clock,
    FileText,
    CheckSquare,
} from 'lucide-react';

import MaterialSourceBadge from '../../../Components/portal/MaterialSourceBadge';

export default function Index({
    materials,
    categories = [],
    available_years = [],
    filters = {},
    source_types = [],
    material_types = [],
    status_options = [],
    audiences_list = [],
    sync_peserta_stats = { total: 0, with_peserta: 0 },
}) {
    const [search, setSearch] = useState(filters.q || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedType, setSelectedType] = useState(filters.type || '');
    const [selectedSourceType, setSelectedSourceType] = useState(filters.source_type || '');
    const [selectedYear, setSelectedYear] = useState(filters.year || '');

    // State for Delete Alert Dialog
    const [deletingMaterial, setDeletingMaterial] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // State for Status Change Alert Dialog
    const [statusChangeTarget, setStatusChangeTarget] = useState(null); // { material, newStatus, label }
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // State for Sync Peserta Alert Dialog
    const [isSyncPesertaDialogOpen, setIsSyncPesertaDialogOpen] = useState(false);
    const [isSyncingPeserta, setIsSyncingPeserta] = useState(false);

    const handleSyncPesertaAll = () => {
        setIsSyncingPeserta(true);
        router.post('/admin/koleksi/sync-peserta', {}, {
            preserveScroll: true,
            onFinish: () => {
                setIsSyncingPeserta(false);
                setIsSyncPesertaDialogOpen(false);
            },
        });
    };

    const applyFilters = (customParams = {}) => {
        const params = {
            q: search,
            category: selectedCategory,
            status: selectedStatus,
            type: selectedType,
            source_type: selectedSourceType,
            year: selectedYear,
            ...customParams,
        };

        // Remove empty keys
        Object.keys(params).forEach((key) => {
            if (!params[key]) delete params[key];
        });

        router.get('/admin/koleksi', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearchSubmit = () => {
        applyFilters();
    };

    const handleResetFilters = () => {
        setSearch('');
        setSelectedCategory('');
        setSelectedStatus('');
        setSelectedType('');
        setSelectedSourceType('');
        setSelectedYear('');
        router.get('/admin/koleksi', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const hasActiveFilters = Boolean(
        search || selectedCategory || selectedStatus || selectedType || selectedSourceType || selectedYear
    );

    const handleDelete = () => {
        if (!deletingMaterial) return;
        setIsDeleting(true);
        router.delete(`/admin/koleksi/${deletingMaterial.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeletingMaterial(null);
            },
        });
    };

    const handleStatusUpdate = () => {
        if (!statusChangeTarget) return;
        setIsUpdatingStatus(true);
        router.patch(
            `/admin/koleksi/${statusChangeTarget.material.id}/status`,
            { status: statusChangeTarget.newStatus },
            {
                onFinish: () => {
                    setIsUpdatingStatus(false);
                    setStatusChangeTarget(null);
                },
            }
        );
    };

    const columns = [
        {
            header: 'Materi & Judul',
            cell: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-14 rounded bg-[#EAF5FF] border border-[#DCE7F3] overflow-hidden shrink-0 flex items-center justify-center">
                        {row.cover_path ? (
                            <img
                                src={row.cover_path}
                                alt={row.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <BookOpen className="w-4 h-4 text-[#0B63CE]" />
                        )}
                    </div>
                    <div className="min-w-0 max-w-xs sm:max-w-sm">
                        <div className="flex items-center gap-1.5 mb-1">
                            <MaterialSourceBadge sourceType={row.source_type} />
                            <span className="font-mono text-[#0B63CE] bg-[#EAF5FF] px-1.5 py-0.2 rounded text-[10px]">
                                {row.code}
                            </span>
                        </div>
                        <Link
                            href={`/admin/koleksi/${row.id}/edit`}
                            className="font-semibold text-sm text-[#112743] hover:text-[#0B63CE] transition-colors truncate block"
                        >
                            {row.title}
                        </Link>
                        <div className="flex items-center gap-2 text-[11px] text-[#6B7C93] mt-0.5">
                            <span className="truncate">{row.author || 'PERKEMI'}</span>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: 'Kategori & Jenis',
            cell: (row) => (
                <div className="space-y-1">
                    {row.category ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#112743]">
                            <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: row.category.color }}
                            />
                            <span>{row.category.name}</span>
                        </span>
                    ) : (
                        <span className="text-xs text-[#6B7C93]">-</span>
                    )}
                    <p className="text-[11px] text-[#6B7C93]">
                        {row.type_label} &bull; {row.publication_year || '-'}
                    </p>
                </div>
            ),
        },
        {
            header: 'Sumber & Berkas',
            cell: (row) => {
                if (row.source_type === 'video') {
                    return (
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 rounded bg-[#F3EDFF] text-[#7957D5] font-mono font-bold text-[10px] border border-[#D0BFFF]">
                                    {(row.video_provider || 'VIDEO').toUpperCase()}
                                </span>
                                <span className="text-xs text-[#112743] font-medium">Video Player</span>
                            </div>
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#20A47A] font-medium">
                                <CheckCircle className="w-3 h-3 shrink-0" />
                                <span>Tautan Video Siap</span>
                            </span>
                        </div>
                    );
                }

                if (row.source_type === 'external_link') {
                    return (
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 rounded bg-[#FFF3E6] text-[#EE9B25] font-mono font-bold text-[10px] border border-[#FFD8A8]">
                                    HTTPS
                                </span>
                                <span className="text-xs text-[#112743] font-medium truncate max-w-[120px]" title={row.external_url}>
                                    Tautan Eksternal
                                </span>
                            </div>
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#20A47A] font-medium">
                                <CheckCircle className="w-3 h-3 shrink-0" />
                                <span>Tautan Valid</span>
                            </span>
                        </div>
                    );
                }

                let badgeVariant = 'neutral';
                if (row.file_status === 'ready') badgeVariant = 'success';
                else if (row.file_status === 'needs_update') badgeVariant = 'warning';
                else if (row.file_status === 'missing') badgeVariant = 'danger';

                return (
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-[#FDE8EF] text-[#FA5252] font-mono font-bold text-[10px] border border-[#F8B4C4]">
                                {row.file_format || 'PDF'}
                            </span>
                            <span className="font-mono text-xs text-[#112743] font-semibold">
                                {row.active_version || '-'}
                            </span>
                        </div>
                        <div>
                            <Badge variant={badgeVariant} size="sm">
                                {row.file_status_label || (row.has_file ? 'File Siap' : 'File Belum Diunggah')}
                            </Badge>
                        </div>
                    </div>
                );
            },
        },
        {
            header: 'Status Publikasi',
            cell: (row) => (
                <Badge
                    variant={
                        row.status === 'published' ? 'published' :
                        row.status === 'review' ? 'review' :
                        row.status === 'draft' ? 'draft' : 'archived'
                    }
                    dot
                >
                    {row.status_label}
                </Badge>
            ),
        },
        {
            header: 'Hak Akses Peran',
            cell: (row) => {
                const auds = row.audiences || [];
                if (auds.length === 0) {
                    return (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F1F3F5] text-[#495057]">
                            Semua Kenshi
                        </span>
                    );
                }
                return (
                    <div className="flex flex-wrap gap-1 max-w-[170px]">
                        {auds.map((aud) => (
                            <span
                                key={aud.id}
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                    aud.code === 'participant' || aud.name === 'Peserta'
                                        ? 'bg-[#EBFBEE] text-[#2B8A3E] font-semibold border border-[#D3F9D8]'
                                        : 'bg-[#EAF5FF] text-[#0B63CE] border border-[#DCE7F3]'
                                }`}
                            >
                                {aud.name}
                            </span>
                        ))}
                    </div>
                );
            },
        },
        {
            header: 'Terakhir Diperbarui',
            accessor: 'updated_at',
            className: 'text-xs text-[#6B7C93]',
        },
        {
            header: 'Aksi',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (row) => {
                const actionItems = [
                    {
                        label: row.source_type === 'video'
                            ? 'Lihat halaman video'
                            : row.source_type === 'external_link'
                            ? 'Buka tautan buku'
                            : 'Baca sebagai pembaca',
                        icon: Eye,
                        onClick: () => {
                            if (row.source_type === 'video') {
                                window.open(`/koleksi/${row.slug}`, '_blank');
                            } else if (row.source_type === 'external_link') {
                                window.open(row.external_url || `/koleksi/${row.slug}`, '_blank');
                            } else {
                                window.open(`/koleksi/${row.slug}/baca`, '_blank');
                            }
                        },
                    },
                    {
                        label: 'Edit Materi & Versi',
                        icon: Edit3,
                        onClick: () => router.visit(`/admin/koleksi/${row.id}/edit`),
                    },
                    {
                        divider: true,
                    },
                    {
                        label: 'Terbitkan (Publikasi)',
                        icon: CheckCircle,
                        disabled: row.status === 'published',
                        onClick: () =>
                            setStatusChangeTarget({
                                material: row,
                                newStatus: 'published',
                                label: 'Terbit',
                            }),
                    },
                    {
                        label: 'Tandai Dalam Tinjauan',
                        icon: Clock,
                        disabled: row.status === 'review',
                        onClick: () =>
                            setStatusChangeTarget({
                                material: row,
                                newStatus: 'review',
                                label: 'Dalam Tinjauan',
                            }),
                    },
                    {
                        label: 'Arsipkan Materi',
                        icon: Archive,
                        disabled: row.status === 'archived',
                        onClick: () =>
                            setStatusChangeTarget({
                                material: row,
                                newStatus: 'archived',
                                label: 'Diarsipkan',
                            }),
                    },
                    {
                        divider: true,
                    },
                    {
                        label: 'Hapus Materi',
                        icon: Trash2,
                        variant: 'danger',
                        onClick: () => setDeletingMaterial(row),
                    },
                ];

                return (
                    <DropdownMenu
                        trigger={
                            <button
                                type="button"
                                className="p-1.5 rounded-lg text-[#6B7C93] hover:text-[#112743] hover:bg-[#EAF5FF] transition-colors"
                                aria-label={`Aksi untuk materi ${row.title}`}
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        }
                        items={actionItems}
                        align="right"
                    />
                );
            },
        },
    ];

    return (
        <AdminLayout title="Koleksi Digital">
            <PageHeader
                title="Koleksi Digital"
                description="Kelola buku digital, modul penataran, pedoman teknis, dan bahan ajar pemateri PERKEMI."
                breadcrumbs={[{ label: 'Koleksi' }]}
                action={
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            icon={CheckSquare}
                            onClick={() => setIsSyncPesertaDialogOpen(true)}
                            title="Checklist peran sasaran Peserta ke seluruh materi koleksi"
                        >
                            Checklist Peserta ke Semua
                        </Button>
                        <Button as={Link} href="/admin/koleksi/create" variant="primary" size="sm" icon={Plus}>
                            Tambah Materi
                        </Button>
                    </div>
                }
            />

            {/* Table Container */}
            <div className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs overflow-hidden mb-8">
                <TableToolbar
                    search={search}
                    onSearchChange={setSearch}
                    onSearchSubmit={handleSearchSubmit}
                    searchPlaceholder="Cari judul, kode modul, atau ringkasan..."
                    hasActiveFilters={hasActiveFilters}
                    onReset={handleResetFilters}
                >
                    <FilterBar>
                        <FilterSelect
                            value={selectedCategory}
                            onChange={(value) => {
                                setSelectedCategory(value);
                                applyFilters({ category: value });
                            }}
                            placeholder="Semua Kategori"
                            ariaLabel="Filter kategori materi"
                            options={categories.map((category) => ({ value: category.id, label: category.name }))}
                        />

                        {/* Status Filter */}
                        <FilterSelect
                            value={selectedStatus}
                            onChange={(value) => {
                                setSelectedStatus(value);
                                applyFilters({ status: value });
                            }}
                            placeholder="Semua Status"
                            ariaLabel="Filter status publikasi"
                            options={status_options}
                        />

                        {/* Sumber Materi Filter */}
                        <FilterSelect
                            value={selectedSourceType}
                            onChange={(value) => {
                                setSelectedSourceType(value);
                                applyFilters({ source_type: value });
                            }}
                            placeholder="Semua Sumber"
                            ariaLabel="Filter sumber materi"
                            options={source_types}
                        />

                        {/* Jenis Filter */}
                        <FilterSelect
                            value={selectedType}
                            onChange={(value) => {
                                setSelectedType(value);
                                applyFilters({ type: value });
                            }}
                            placeholder="Semua Jenis"
                            ariaLabel="Filter jenis materi"
                            options={material_types}
                        />

                        {/* Tahun Filter */}
                        <FilterSelect
                            value={selectedYear}
                            onChange={(value) => {
                                setSelectedYear(value);
                                applyFilters({ year: value });
                            }}
                            placeholder="Semua Tahun"
                            ariaLabel="Filter tahun materi"
                            options={available_years.map((year) => ({ value: year, label: year }))}
                        />
                    </FilterBar>
                </TableToolbar>

                <DataTable
                    columns={columns}
                    data={materials.data}
                    pagination={materials}
                    emptyTitle="Belum Ada Materi Koleksi"
                    emptyDescription={
                        hasActiveFilters
                            ? 'Tidak ada materi yang sesuai dengan filter dan kata kunci yang Anda terapkan.'
                            : 'Mulai kelola portal dengan mengunggah buku atau modul penataran perdana.'
                    }
                    actionText={hasActiveFilters ? 'Reset Filter' : 'Tambah Materi'}
                    onEmptyAction={
                        hasActiveFilters
                            ? handleResetFilters
                            : () => router.visit('/admin/koleksi/create')
                    }
                />
            </div>

            {/* Alert Dialog for Deleting Material */}
            <AlertDialog
                isOpen={Boolean(deletingMaterial)}
                onClose={() => setDeletingMaterial(null)}
                onConfirm={handleDelete}
                title="Hapus Materi dari Koleksi?"
                description={`Apakah Anda yakin ingin menghapus materi "${deletingMaterial?.title}"? Berkas sampul dan data terkait akan dihapus secara permanen.`}
                confirmText="Hapus Materi"
                cancelText="Batal"
                variant="danger"
                loading={isDeleting}
            />

            {/* Alert Dialog for Changing Status */}
            <AlertDialog
                isOpen={Boolean(statusChangeTarget)}
                onClose={() => setStatusChangeTarget(null)}
                onConfirm={handleStatusUpdate}
                title="Ubah Status Publikasi?"
                description={`Ubah status materi "${statusChangeTarget?.material?.title}" menjadi "${statusChangeTarget?.label}".`}
                confirmText="Ubah Status"
                cancelText="Batal"
                variant="info"
                loading={isUpdatingStatus}
            />

            {/* Alert Dialog for Syncing Peserta to All Materials */}
            <AlertDialog
                isOpen={isSyncPesertaDialogOpen}
                onClose={() => setIsSyncPesertaDialogOpen(false)}
                onConfirm={handleSyncPesertaAll}
                title="Checklist Hak Akses Peserta ke Seluruh Koleksi?"
                description={`Aksi ini akan memastikan seluruh ${sync_peserta_stats?.total || 'materi'} koleksi buku digital dan modul memiliki peran sasaran 'Peserta'. Seluruh kenshi peserta penataran akan dapat mengakses dan membaca seluruh materi di portal.`}
                confirmText={isSyncingPeserta ? 'Menerapkan...' : 'Ya, Checklist untuk Semua'}
                cancelText="Batal"
                variant="primary"
                loading={isSyncingPeserta}
            />
        </AdminLayout>
    );
}
