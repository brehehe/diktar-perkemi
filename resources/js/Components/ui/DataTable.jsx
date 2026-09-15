import React from 'react';
import Pagination from './Pagination';
import EmptyState from './EmptyState';
import { SkeletonTable } from './Skeleton';

export default function DataTable({
    columns = [],
    data = [],
    pagination,
    loading = false,
    emptyTitle = 'Data Belum Tersedia',
    emptyDescription = 'Tidak ditemukan rekaman yang cocok dengan kriteria pencarian atau filter.',
    onEmptyAction,
    emptyActionText,
    className = '',
}) {
    if (loading) {
        return <SkeletonTable rows={6} cols={columns.length} />;
    }

    return (
        <div className={`w-full bg-white rounded-xl border border-[#DCE7F3] shadow-xs overflow-hidden ${className}`}>
            {/* Table wrapper with responsive horizontal scroll */}
            <div className="overflow-x-auto min-w-full">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-[#DCE7F3] bg-[#F8FBFF]/80 text-[#112743]">
                            {columns.map((col, index) => (
                                <th
                                    key={index}
                                    scope="col"
                                    className={`px-4 py-3 font-semibold uppercase tracking-wider text-[11px] text-[#0E2747] ${col.headerClassName || ''}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DCE7F3]/60 bg-white">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="p-8">
                                    <EmptyState
                                        title={emptyTitle}
                                        description={emptyDescription}
                                        onAction={onEmptyAction}
                                        actionText={emptyActionText}
                                    />
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIndex) => (
                                <tr
                                    key={row.id || rowIndex}
                                    className="hover:bg-[#F8FBFF] transition-colors group"
                                >
                                    {columns.map((col, colIndex) => {
                                        let cellContent;
                                        if (typeof col.cell === 'function') {
                                            cellContent = col.cell(row, rowIndex);
                                        } else if (col.accessor) {
                                            cellContent = row[col.accessor];
                                        } else {
                                            cellContent = null;
                                        }

                                        return (
                                            <td
                                                key={colIndex}
                                                className={`px-4 py-3.5 text-[#112743] align-middle ${col.className || ''}`}
                                            >
                                                {cellContent}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Integrated Pagination */}
            {pagination && (
                <Pagination pagination={pagination} />
            )}
        </div>
    );
}
