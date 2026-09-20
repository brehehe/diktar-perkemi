import React from 'react';
import Pagination from '../ui/Pagination';

export default function TableSurface({ children, pagination, className = '', ariaLabel }) {
    const table = React.isValidElement(children)
        ? React.cloneElement(children, {
            'aria-label': children.props['aria-label'] || ariaLabel,
            className: `w-full border-collapse text-left text-xs ${children.props.className || ''}`,
        })
        : children;

    return (
        <div className={`overflow-hidden rounded-xl border border-[#DCE7F3] bg-white shadow-xs ${className}`}>
            <div className="overflow-x-auto [&_thead]:border-b [&_thead]:border-[#DCE7F3] [&_thead]:bg-[#F8FBFF]/80 [&_th]:px-4 [&_th]:py-3 [&_th]:text-[11px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-[#0E2747] [&_tbody]:divide-y [&_tbody]:divide-[#DCE7F3]/60 [&_td]:px-4 [&_td]:py-3.5 [&_td]:align-middle [&_td]:text-[#112743] [&_tbody_tr]:transition-colors [&_tbody_tr]:motion-reduce:transition-none [&_tbody_tr:hover]:bg-[#F8FBFF]">
                {table}
            </div>
            {pagination && <Pagination pagination={pagination} />}
        </div>
    );
}
