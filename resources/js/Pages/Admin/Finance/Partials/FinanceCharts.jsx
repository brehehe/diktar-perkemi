import { useState } from 'react';
import { rupiah } from './financeShared';

// Reusable Donut Chart Component using SVG
export function DonutChart({ data = [], total = 0, title = 'Distribusi' }) {
    const [hovered, setHovered] = useState(null);
    const size = 180;
    const strokeWidth = 26;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    let accumulatedAngle = 0;

    if (!data.length || total === 0) {
        return (
            <div className="flex h-44 items-center justify-center text-xs text-[#6B7C93]">
                Belum ada data distribusi
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center">
                <svg width={size} height={size} className="-rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke="#F0F5FA"
                        strokeWidth={strokeWidth}
                    />
                    {data.map((item, index) => {
                        const ratio = item.amount / total;
                        const strokeDasharray = `${ratio * circumference} ${circumference}`;
                        const strokeDashoffset = -accumulatedAngle * circumference;
                        accumulatedAngle += ratio;

                        return (
                            <circle
                                key={item.category || index}
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="transparent"
                                stroke={item.color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="butt"
                                className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                                onMouseEnter={() => setHovered(item)}
                                onMouseLeave={() => setHovered(null)}
                            />
                        );
                    })}
                </svg>
                <div className="absolute text-center">
                    <p className="text-[10px] uppercase font-mono tracking-wider text-[#6B7C93]">
                        {hovered ? hovered.label : title}
                    </p>
                    <p className="font-display text-sm font-bold text-[#0E2747]">
                        {hovered ? `${hovered.share}%` : rupiah(total)}
                    </p>
                </div>
            </div>

            {/* Legend list */}
            <div className="mt-4 w-full space-y-1.5">
                {data.map((item) => (
                    <div
                        key={item.category}
                        className="flex items-center justify-between text-xs transition-colors hover:bg-[#F8FBFF] px-2 py-1 rounded"
                    >
                        <div className="flex items-center gap-2">
                            <span
                                className="size-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: item.color }}
                                aria-hidden="true"
                            />
                            <span className="font-medium text-[#112743]">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2 tabular-nums">
                            <span className="font-semibold text-[#0E2747]">{rupiah(item.amount)}</span>
                            <span className="text-[#6B7C93] text-[11px] w-10 text-right">({item.share}%)</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Reusable Monthly Cash Flow Bar & Net Trend Chart
export function CashFlowMonthlyChart({ trend = [] }) {
    const [activeIdx, setActiveIdx] = useState(null);

    if (!trend.length) {
        return (
            <div className="flex h-56 items-center justify-center border border-dashed border-[#DCE7F3] bg-[#F8FBFF] text-xs text-[#6B7C93]">
                Belum ada data arus kas bulanan yang tercatat.
            </div>
        );
    }

    const maxVal = Math.max(...trend.map((t) => Math.max(t.income, t.expense, Math.abs(t.net))), 1);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                        <span className="size-3 rounded-xs bg-[#20A47A]" />
                        <span className="font-medium text-[#112743]">Pemasukan</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="size-3 rounded-xs bg-[#DD4D7C]" />
                        <span className="font-medium text-[#112743]">Pengeluaran</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="size-3 rounded-xs bg-[#0B63CE]" />
                        <span className="font-medium text-[#112743]">Surplus Bersih</span>
                    </div>
                </div>
                <span className="text-[11px] text-[#6B7C93] font-mono">
                    {trend.length} Periode Tercatat
                </span>
            </div>

            <div className="relative h-56 w-full pt-4">
                {/* Background Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                    <div className="border-b border-[#0E2747]" />
                    <div className="border-b border-[#0E2747]" />
                    <div className="border-b border-[#0E2747]" />
                </div>

                <div className="relative flex h-full items-end justify-around gap-2 sm:gap-6">
                    {trend.map((item, idx) => {
                        const incomeHeight = Math.max(4, (item.income / maxVal) * 160);
                        const expenseHeight = Math.max(4, (item.expense / maxVal) * 160);

                        return (
                            <div
                                key={item.key || idx}
                                className="group relative flex flex-1 flex-col items-center justify-end h-full"
                                onMouseEnter={() => setActiveIdx(idx)}
                                onMouseLeave={() => setActiveIdx(null)}
                            >
                                {/* Tooltip */}
                                {activeIdx === idx && (
                                    <div className="absolute -top-14 z-20 whitespace-nowrap rounded-md bg-[#0E2747] px-3 py-1.5 text-[11px] text-white shadow-lg pointer-events-none">
                                        <p className="font-semibold">{item.label}</p>
                                        <p className="text-emerald-300">Masuk: {rupiah(item.income)}</p>
                                        <p className="text-rose-300">Keluar: {rupiah(item.expense)}</p>
                                        <p className="text-blue-300">Net: {rupiah(item.net)}</p>
                                    </div>
                                )}

                                {/* Bars container */}
                                <div className="flex w-full items-end justify-center gap-1 sm:gap-2">
                                    <div
                                        style={{ height: `${incomeHeight}px` }}
                                        className="w-full max-w-6 rounded-t-xs bg-[#20A47A] transition-all group-hover:brightness-110"
                                        title={`Pemasukan: ${rupiah(item.income)}`}
                                    />
                                    <div
                                        style={{ height: `${expenseHeight}px` }}
                                        className="w-full max-w-6 rounded-t-xs bg-[#DD4D7C] transition-all group-hover:brightness-110"
                                        title={`Pengeluaran: ${rupiah(item.expense)}`}
                                    />
                                </div>

                                <span className="mt-2 text-[10px] font-mono text-[#6B7C93] truncate max-w-16">
                                    {item.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

