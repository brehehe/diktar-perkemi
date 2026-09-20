import CollectionCard from './CollectionCard';
import EmptyState from './EmptyState';

export default function CollectionGrid({
    materials = [],
    columns = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    className = '',
    emptyTitle = 'Materi Belum Ditemukan',
    emptyDescription = 'Coba ubah kata kunci atau sesuaikan filter pencarian Anda untuk menemukan koleksi.',
    onResetFilters = null,
}) {
    const list = Array.isArray(materials) ? materials : (materials?.data || []);

    if (list.length === 0) {
        return (
            <div className="py-12">
                <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    onReset={onResetFilters}
                />
            </div>
        );
    }

    return (
        <div className={`grid ${columns} gap-6 ${className}`}>
            {list.map((item) => (
                <CollectionCard key={item.id || item.slug} material={item} />
            ))}
        </div>
    );
}
