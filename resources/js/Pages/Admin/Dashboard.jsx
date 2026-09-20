import React from 'react';
import { Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import PageHeader from '../../Components/admin/PageHeader';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import DataTable from '../../Components/ui/DataTable';
import StatGrid from '../../Components/admin/StatGrid';
import {
    BookOpen,
    CheckCircle2,
    Clock,
    Users,
    Plus,
    ArrowRight,
    FileText,
    History,
    Layers,
} from 'lucide-react';

export default function Dashboard({
    metrics,
    pending_reviews = [],
    recent_activities = [],
    recent_materials = [],
    category_distribution = [],
}) {
    const statCards = [
        {
            key: 'materials',
            label: 'Total Koleksi Materi',
            value: metrics?.total_materials ?? 0,
            description: 'Buku, modul, dan dokumen terdaftar',
            icon: BookOpen,
            tone: 'blue',
        },
        {
            key: 'published',
            label: 'Koleksi Terbit',
            value: metrics?.published_materials ?? 0,
            description: 'Dapat diakses oleh kenshi & publik',
            icon: CheckCircle2,
            tone: 'green',
        },
        {
            key: 'review',
            label: 'Perlu Ditinjau',
            value: metrics?.review_materials ?? 0,
            description: 'Draf & pengajuan bahan ajar baru',
            icon: Clock,
            tone: 'orange',
        },
        {
            key: 'users',
            label: 'Pengguna Terdaftar',
            value: metrics?.total_users ?? 0,
            description: 'Kenshi, pelatih, wasit, dan admin',
            icon: Users,
            tone: 'purple',
        },
    ];

    const recentMaterialColumns = [
        {
            header: 'Judul Materi',
            cell: (material) => (
                <div>
                    <div className="max-w-xs truncate font-medium text-[#112743]">{material.title}</div>
                    <div className="text-[10px] text-[#6B7C93]">{material.type_label} • {material.code}</div>
                </div>
            ),
        },
        { header: 'Kategori', cell: (material) => <span className="text-[#6B7C93]">{material.categories?.[0]?.name || '—'}</span> },
        {
            header: 'Status',
            cell: (material) => (
                <Badge variant={material.status === 'published' ? 'published' : material.status === 'review' ? 'review' : material.status === 'draft' ? 'draft' : 'archived'} dot>
                    {material.status_label}
                </Badge>
            ),
        },
        {
            header: 'Aksi',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (material) => <Link href={`/admin/koleksi/${material.id}/edit`} className="font-medium text-[#0B63CE] hover:underline">Edit</Link>,
        },
    ];

    return (
        <AdminLayout title="Ringkasan Portal">
            <PageHeader
                title="Ringkasan Portal"
                description="Statistik komprehensif, alur kurasi materi, dan rekaman audit aktivitas Pustaka Penataran PERKEMI."
                action={
                    <Button as={Link} href="/admin/koleksi/create" variant="primary" size="sm" icon={Plus}>
                        Tambah Materi
                    </Button>
                }
            />

            <StatGrid items={statCards} className="mb-8" />

            {/* 2-Column Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left (2 cols): Pending Reviews + Recent Materials */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Pending Reviews Section */}
                    <div className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs overflow-hidden">
                        <div className="p-4 sm:p-5 border-b border-[#DCE7F3] flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded-md bg-[#FEF6E9] text-[#EE9B25]">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-[#0E2747]">
                                        Materi Perlu Ditinjau & Kurasi
                                    </h2>
                                    <p className="text-[11px] text-[#6B7C93]">
                                        Draf dan materi dalam antrean evaluasi
                                    </p>
                                </div>
                            </div>

                            <Link
                                href="/admin/koleksi?status=review"
                                className="text-xs font-medium text-[#0B63CE] hover:underline flex items-center gap-1"
                            >
                                <span>Lihat Semua</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="divide-y divide-[#DCE7F3]/60">
                            {pending_reviews.length === 0 ? (
                                <div className="p-8 text-center text-xs text-[#6B7C93]">
                                    Tidak ada materi yang memerlukan peninjauan saat ini.
                                </div>
                            ) : (
                                pending_reviews.map((item) => (
                                    <div
                                        key={item.id}
                                        className="p-4 hover:bg-[#F8FBFF] transition-colors flex items-center justify-between gap-4"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant={item.status === 'review' ? 'review' : 'draft'} dot>
                                                    {item.status_label}
                                                </Badge>
                                                {item.category && (
                                                    <span className="text-[11px] text-[#6B7C93] flex items-center gap-1">
                                                        <span
                                                            className="w-1.5 h-1.5 rounded-full"
                                                            style={{ backgroundColor: item.category.color }}
                                                        />
                                                        {item.category.name}
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="text-sm font-semibold text-[#112743] truncate">
                                                {item.title}
                                            </h4>
                                            <div className="flex items-center gap-3 text-[11px] text-[#6B7C93] mt-0.5">
                                                <span>Kode: {item.code}</span>
                                                <span>&bull;</span>
                                                <span>Diperbarui {item.updated_at}</span>
                                            </div>
                                        </div>

                                        <Link href={`/admin/koleksi/${item.id}/edit`}>
                                            <Button variant="secondary" size="sm">
                                                Tinjau
                                            </Button>
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recent Materials */}
                    <div className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs overflow-hidden">
                        <div className="p-4 sm:p-5 border-b border-[#DCE7F3] flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded-md bg-[#EAF5FF] text-[#0B63CE]">
                                    <BookOpen className="w-4 h-4" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-[#0E2747]">
                                        Koleksi Terbaru Ditambahkan
                                    </h2>
                                    <p className="text-[11px] text-[#6B7C93]">
                                        Buku dan modul pembelajaran yang baru diperbarui
                                    </p>
                                </div>
                            </div>

                            <Link
                                href="/admin/koleksi"
                                className="text-xs font-medium text-[#0B63CE] hover:underline flex items-center gap-1"
                            >
                                <span>Kelola Koleksi</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <DataTable
                            columns={recentMaterialColumns}
                            data={recent_materials}
                            ariaLabel="Koleksi terbaru"
                            className="rounded-none border-0 shadow-none"
                            emptyTitle="Belum Ada Koleksi Terbaru"
                            emptyDescription="Belum ada materi terbaru untuk ditampilkan."
                        />
                    </div>
                </div>

                {/* Right (1 col): Category Distribution + Activity Feed */}
                <div className="space-y-6">
                    {/* Category Distribution */}
                    <div className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs p-5">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="p-1.5 rounded-md bg-[#F4F0FF] text-[#7957D5]">
                                <Layers className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-[#0E2747]">
                                    Distribusi Topik
                                </h3>
                                <p className="text-[11px] text-[#6B7C93]">
                                    Jumlah materi per kategori
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {category_distribution.map((cat) => {
                                const maxCount = Math.max(...category_distribution.map(c => c.materials_count), 1);
                                const percentage = Math.round((cat.materials_count / maxCount) * 100);

                                return (
                                    <div key={cat.id} className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-medium text-[#112743] flex items-center gap-1.5">
                                                <span
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: cat.color }}
                                                />
                                                {cat.name}
                                            </span>
                                            <span className="font-mono text-[#6B7C93]">
                                                {cat.materials_count}
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor: cat.color || '#0B63CE',
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#DCE7F3] text-center">
                            <Link
                                href="/admin/kategori"
                                className="text-xs font-medium text-[#0B63CE] hover:underline"
                            >
                                Kelola Kategori &rarr;
                            </Link>
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs p-5">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="p-1.5 rounded-md bg-[#E8F8F2] text-[#20A47A]">
                                <History className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-[#0E2747]">
                                    Aktivitas Terkini
                                </h3>
                                <p className="text-[11px] text-[#6B7C93]">
                                    Audit log sistem terbaru
                                </p>
                            </div>
                        </div>

                        <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#DCE7F3]">
                            {recent_activities.map((act) => (
                                <div key={act.id} className="relative text-xs">
                                    <span className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full border-2 border-white bg-[#0B63CE] shadow-xs" />
                                    <p className="font-medium text-[#112743] leading-snug">
                                        {act.description}
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px] text-[#6B7C93] mt-0.5 font-mono">
                                        <span>{act.actor?.name || 'Sistem'}</span>
                                        <span>&bull;</span>
                                        <span>{act.created_at}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#DCE7F3] text-center">
                            <Link
                                href="/admin/aktivitas"
                                className="text-xs font-medium text-[#0B63CE] hover:underline"
                            >
                                Lihat Seluruh Log &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
