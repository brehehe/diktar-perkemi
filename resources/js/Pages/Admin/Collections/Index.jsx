import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/admin/PageHeader';
import DataTable from '../../../Components/ui/DataTable';
import TableToolbar from '../../../Components/admin/TableToolbar';
import FilterBar from '../../../Components/admin/FilterBar';
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
} from 'lucide-react';

export default function Index({
    materials,
    categories = [],
    available_years = [],
    filters = {},
    material_types = [],
    status_options = [],
}) {
    const [search, setSearch] = useState(filters.q || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedType, setSelectedType] = useState(filters.type || '');
    const [selectedYear, setSelectedYear] = useState(filters.year || '');

    // State for Delete Alert Dialog
    const [deletingMaterial, setDeletingMaterial] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // State for Status Change Alert Dialog
    const [statusChangeTarget, setStatusChangeTarget] = useState(null); // { material, newStatus, label }
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const applyFilters = (customParams = {}) => {
        const params = {
            q: search,
            category: selectedCategory,
            status: selectedStatus,
            type: selectedType,
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
        setSelectedYear('');
        router.get('/admin/koleksi', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const hasActiveFilters = Boolean(
        search || selectedCategory || selectedStatus || selectedType || selectedYear
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
                        <Link
                            href={`/admin/koleksi/${row.id}/edit`}
                            className="font-semibold text-sm text-[#112743] hover:text-[#0B63CE] transition-colors truncate block"
                        >
                            {row.title}
                        </Link>
                        <div className="flex items-center gap-2 text-[11px] text-[#6B7C93] mt-0.5">
                            <span className="font-mono text-[#0B63CE] bg-[#EAF5FF] px-1.5 py-0.2 rounded text-[10px]">
                                {row.code}
                            </span>
                            <span>&bull;</span>
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
            header: 'Berkas & Versi',
            cell: (row) => {
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
                        label: 'Baca sebagai pembaca',
                        icon: Eye,
                        onClick: () => window.open(`/koleksi/${row.slug}/baca`, '_blank'),
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
                    <Link href="/admin/koleksi/create">
                        <Button variant="primary" size="sm" icon={Plus}>
                            Tambah Materi
                        </Button>
                    </Link>
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
                        {/* Kategori Filter */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                applyFilters({ category: e.target.value });
                            }}
                            className="bg-[#F8FBFF] border border-[#DCE7F3] rounded-lg px-2.5 py-2 text-xs text-[#112743] focus:outline-none focus:border-[#0B63CE]"
                        >
                            <option value="">Semua Kategori</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>

                        {/* Status Filter */}
                        <select
                            value={selectedStatus}
                            onChange={(e) => {
                                setSelectedStatus(e.target.value);
                                applyFilters({ status: e.target.value });
                            }}
                            className="bg-[#F8FBFF] border border-[#DCE7F3] rounded-lg px-2.5 py-2 text-xs text-[#112743] focus:outline-none focus:border-[#0B63CE]"
                        >
                            <option value="">Semua Status</option>
                            {status_options.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>

                        {/* Jenis Filter */}
                        <select
                            value={selectedType}
                            onChange={(e) => {
                                setSelectedType(e.target.value);
                                applyFilters({ type: e.target.value });
                            }}
                            className="bg-[#F8FBFF] border border-[#DCE7F3] rounded-lg px-2.5 py-2 text-xs text-[#112743] focus:outline-none focus:border-[#0B63CE]"
                        >
                            <option value="">Semua Jenis</option>
                            {material_types.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>

                        {/* Tahun Filter */}
                        <select
                            value={selectedYear}
                            onChange={(e) => {
                                setSelectedYear(e.target.value);
                                applyFilters({ year: e.target.value });
                            }}
                            className="bg-[#F8FBFF] border border-[#DCE7F3] rounded-lg px-2.5 py-2 text-xs text-[#112743] focus:outline-none focus:border-[#0B63CE]"
                        >
                            <option value="">Semua Tahun</option>
                            {available_years.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
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
        </AdminLayout>
    );
}
