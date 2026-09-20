import React from 'react';

const toneClasses = {
    blue: 'bg-[#EAF5FF] text-[#0B63CE]',
    green: 'bg-[#E8F7F2] text-[#20A47A]',
    orange: 'bg-[#FFF4E5] text-[#EE9B25]',
    purple: 'bg-[#F2EDFF] text-[#7957D5]',
    rose: 'bg-[#FDE8EF] text-[#DD4D7C]',
    navy: 'bg-[#EEF3F8] text-[#0E2747]',
};

export default function StatGrid({ items = [], className = '' }) {
    if (items.length === 0) {
        return null;
    }

    return (
        <dl className={`grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 ${className}`}>
            {items.map(({ key, label, value, description, icon: Icon, tone = 'blue' }) => (
                <div
                    key={key || label}
                    className="relative min-w-0 rounded-xl border border-[#DCE7F3] bg-white p-5 shadow-xs"
                >
                    <dt className="pr-12 text-xs font-semibold uppercase tracking-[0.08em] text-[#6B7C93]">
                        {label}
                    </dt>
                    {Icon && (
                        <span
                            className={`absolute right-5 top-5 inline-flex size-10 items-center justify-center rounded-lg ${toneClasses[tone] || toneClasses.blue}`}
                            aria-hidden="true"
                        >
                            <Icon className="size-5" />
                        </span>
                    )}
                    <dd className="mt-8 break-words font-serif text-2xl font-bold leading-tight text-[#0E2747] sm:text-3xl">
                        {value}
                    </dd>
                    {description && (
                        <dd className="mt-2 text-sm leading-5 text-[#6B7C93]">
                            {description}
                        </dd>
                    )}
                </div>
            ))}
        </dl>
    );
}
