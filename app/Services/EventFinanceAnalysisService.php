<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventFinance;
use App\Models\FinanceCategory;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class EventFinanceAnalysisService
{
    /** @return array<string, mixed> */
    public function forEvent(Event $event): array
    {
        return $this->summarize($event->finances()->orderBy('occurred_on')->get());
    }

    /** @param Collection<int, EventFinance> $transactions
     * @return array<string, mixed>
     */
    public function summarize(Collection $transactions): array
    {
        $income = $transactions->where('type', 'income')->sum('amount');
        $expense = $transactions->where('type', 'expense')->sum('amount');
        $sponsor = $transactions->where('type', 'income')->where('category', 'sponsorship')->sum('amount');
        $expenseGroups = $transactions->where('type', 'expense')->groupBy('category')
            ->map(fn (Collection $entries): int => (int) $entries->sum('amount'))
            ->sortDesc();
        $monthly = $transactions->groupBy(fn (EventFinance $entry): string => $entry->occurred_on->format('Y-m'))
            ->map(fn (Collection $entries): array => [
                'income' => (int) $entries->where('type', 'income')->sum('amount'),
                'expense' => (int) $entries->where('type', 'expense')->sum('amount'),
            ])->sortKeys();
        $dominantShare = $expense > 0 ? round($expenseGroups->first() / $expense * 100, 1) : null;
        $accommodationAndConsumption = ($expenseGroups['accommodation'] ?? 0) + ($expenseGroups['consumption'] ?? 0);
        $accommConsumpShare = $expense > 0 ? round($accommodationAndConsumption / $expense * 100, 1) : null;

        $projectedNextBalance = null;
        $projectedNextBalanceText = null;
        $projectionBasis = null;
        $baseBalance = (int) ($income - $expense);

        if ($monthly->count() >= 3) {
            $recentMonths = $monthly->take(-3);
            $averageNet = (int) round($recentMonths->avg(fn (array $period): int => $period['income'] - $period['expense']));
            $recentMonthKeys = $recentMonths->keys();
            $recentExpenses = $transactions->where('type', 'expense')
                ->whereIn('category', ['accommodation', 'consumption', 'printing'])
                ->filter(fn (EventFinance $entry): bool => $recentMonthKeys->contains($entry->occurred_on->format('Y-m')))
                ->sum('amount');
            $averageControllableExpense = $recentExpenses / 3;
            $projectedMin = $baseBalance + $averageNet + (int) round($averageControllableExpense * 0.10);
            $projectedMax = $baseBalance + $averageNet + (int) round($averageControllableExpense * 0.15);
            $projectedNextBalance = $projectedMax;
            $projectedNextBalanceText = 'Rp '.number_format($projectedMin, 0, ',', '.').' – Rp '.number_format($projectedMax, 0, ',', '.');
            $projectionBasis = 'Rata-rata arus kas 3 periode tercatat dengan asumsi penghematan 10–15% untuk akomodasi, konsumsi, dan cetak. Ini simulasi, bukan kepastian.';
        }

        $recommendations = [];
        if (($expenseGroups['printing'] ?? 0) > 0) {
            $recommendations[] = 'Digitalisasi materi untuk mengurangi biaya cetak.';
        }
        if (($expenseGroups['accommodation'] ?? 0) > 0) {
            $recommendations[] = 'Negosiasi akomodasi dengan vendor untuk menekan biaya.';
        }
        if ($sponsor > 0) {
            $recommendations[] = 'Diversifikasi sumber dana dengan menjajaki sponsor sektor pendidikan dan teknologi.';
        }
        if ($transactions->isNotEmpty()) {
            $recommendations[] = 'Gunakan survei digital untuk mengukur kepuasan peserta; data survei belum tersedia di laporan keuangan.';
        }

        $categoryLabels = FinanceCategory::query()->pluck('name', 'code')->all();

        $expenseColors = [
            'accommodation' => '#0B63CE',
            'consumption' => '#20A47A',
            'printing' => '#7957D5',
            'venue' => '#EE9B25',
            'transport' => '#DD4D7C',
            'other' => '#6B7C93',
        ];

        $incomeColors = [
            'sponsorship' => '#7957D5',
            'registration' => '#0B63CE',
            'grant' => '#20A47A',
            'other' => '#6B7C93',
        ];

        $expenseChartData = $expenseGroups->map(fn (int $amount, string $cat): array => [
            'category' => $cat,
            'label' => $categoryLabels[$cat] ?? ucfirst($cat),
            'amount' => $amount,
            'share' => $expense > 0 ? round($amount / $expense * 100, 1) : 0,
            'color' => $expenseColors[$cat] ?? '#0E2747',
        ])->values()->all();

        $incomeGroups = $transactions->where('type', 'income')->groupBy('category')
            ->map(fn (Collection $entries): int => (int) $entries->sum('amount'))
            ->sortDesc();

        $incomeChartData = $incomeGroups->map(fn (int $amount, string $cat): array => [
            'category' => $cat,
            'label' => $categoryLabels[$cat] ?? ucfirst($cat),
            'amount' => $amount,
            'share' => $income > 0 ? round($amount / $income * 100, 1) : 0,
            'color' => $incomeColors[$cat] ?? '#0E2747',
        ])->values()->all();

        $monthlyTrend = $monthly->map(function (array $data, string $key): array {
            $date = Carbon::createFromFormat('Y-m', $key);

            return [
                'key' => $key,
                'label' => $date ? $date->translatedFormat('M Y') : $key,
                'income' => $data['income'],
                'expense' => $data['expense'],
                'net' => $data['income'] - $data['expense'],
            ];
        })->values()->all();

        return [
            'income' => (int) $income,
            'expense' => (int) $expense,
            'balance' => $baseBalance,
            'sponsor_amount' => (int) $sponsor,
            'sponsor_share' => $income > 0 ? round($sponsor / $income * 100, 1) : null,
            'dominant_expense' => $expenseGroups->isEmpty() ? null : [
                'category' => $expenseGroups->keys()->first(),
                'amount' => $expenseGroups->first(),
                'share' => $dominantShare,
            ],
            'accommodation_consumption_share' => $accommConsumpShare,
            'expense_by_category' => $expenseGroups,
            'expense_chart_data' => $expenseChartData,
            'income_chart_data' => $incomeChartData,
            'monthly' => $monthly,
            'monthly_trend' => $monthlyTrend,
            'projected_next_balance' => $projectedNextBalance,
            'projected_next_balance_text' => $projectedNextBalanceText,
            'projection_basis' => $projectionBasis,
            'projection_period_count' => $monthly->count(),
            'recommendations' => $recommendations,
            'transaction_count' => $transactions->count(),
        ];
    }
}
