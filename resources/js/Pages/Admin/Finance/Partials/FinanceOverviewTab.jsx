import FinanceInsights from '../../../../Components/admin/FinanceInsights';
import { BarChart3, PieChart } from 'lucide-react';
import { DonutChart, CashFlowMonthlyChart } from './FinanceCharts';
import { useFinancePage } from './FinancePageContext';

export default function FinanceOverviewTab() {
    const {
        analysis,
        overallAnalysis,
        activeEventId,
        currentAnalysis,
    } = useFinancePage();

    return (
        <div className="space-y-6">
            <FinanceInsights analysis={currentAnalysis} eventId={activeEventId} overallAnalysis={overallAnalysis} />

            {/* VISUAL CHARTS SECTION (2 COLUMNS: ARUS KAS BULANAN & DONUT DISTRIBUSI PENGELUARAN) */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left: Monthly Trend Bar Chart (2 cols) */}
                <div className="border border-[#DCE7F3] bg-white p-6 shadow-2xs lg:col-span-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DCE7F3] pb-4">
                        <div>
                            <h3 className="font-display text-base font-semibold text-[#0E2747]">
                                Tren Arus Kas Bulanan Kegiatan
                            </h3>
                            <p className="text-xs text-[#6B7C93]">
                                Perbandingan penerimaan vs pengeluaran dan surplus bersih per periode.
                            </p>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded bg-[#EAF5FF] px-2 py-0.5 text-[11px] font-semibold text-[#0B63CE]">
                            <BarChart3 className="size-3" aria-hidden="true" />
                            Bar Chart
                        </span>
                    </div>
                    <div className="mt-4">
                        <CashFlowMonthlyChart trend={currentAnalysis.monthly_trend || currentAnalysis.cash_flow_trend || []} />
                    </div>
                </div>

                {/* Right: Donut Chart Distribusi Pengeluaran (1 col) */}
                <div className="border border-[#DCE7F3] bg-white p-6 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-[#DCE7F3] pb-4">
                        <div>
                            <h3 className="font-display text-base font-semibold text-[#0E2747]">
                                Pos Pengeluaran
                            </h3>
                            <p className="text-xs text-[#6B7C93]">
                                Distribusi porsi biaya kegiatan
                            </p>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded bg-[#EAF5FF] px-2 py-0.5 text-[11px] font-semibold text-[#0B63CE]">
                            <PieChart className="size-3" aria-hidden="true" />
                            Donut Chart
                        </span>
                    </div>
                    <div className="mt-4">
                        <DonutChart
                            data={currentAnalysis.expense_chart_data || []}
                            total={currentAnalysis.expense}
                            title="Pengeluaran"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
