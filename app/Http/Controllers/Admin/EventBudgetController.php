<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveEventBudgetRequest;
use App\Models\Event;
use App\Models\EventBudget;
use App\Services\AdminEventDetailService;
use App\Services\EventReportExportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class EventBudgetController extends Controller
{
    /**
     * Store a newly created budget item for the event.
     */
    public function store(SaveEventBudgetRequest $request, Event $event): RedirectResponse
    {
        $validated = $request->validated();
        $quantity = (float) $validated['quantity'];
        $unitPrice = (int) $validated['unit_price'];
        $amount = (int) ($validated['amount'] ?? round($quantity * $unitPrice));

        if ($amount <= 0 && $quantity > 0 && $unitPrice > 0) {
            $amount = (int) round($quantity * $unitPrice);
        }

        $event->budgets()->create([
            'created_by' => $request->user()->id,
            'type' => $validated['type'],
            'category' => $validated['category'],
            'item_name' => $validated['item_name'],
            'quantity' => $quantity,
            'unit' => $validated['unit'] ?? 'paket',
            'unit_price' => $unitPrice,
            'amount' => $amount,
            'notes' => $validated['notes'] ?? null,
            'sort_order' => (int) ($validated['sort_order'] ?? 0),
        ]);

        return redirect()->route('admin.event.show', ['event' => $event->id, 'tab' => 'rab'])
            ->with('success', 'Item anggaran RAB berhasil ditambahkan.');
    }

    /**
     * Update the specified budget item.
     */
    public function update(SaveEventBudgetRequest $request, Event $event, EventBudget $budget): RedirectResponse
    {
        abort_unless($budget->event_id === $event->id, 404);

        $validated = $request->validated();
        $quantity = (float) $validated['quantity'];
        $unitPrice = (int) $validated['unit_price'];
        $amount = (int) ($validated['amount'] ?? round($quantity * $unitPrice));

        if ($amount <= 0 && $quantity > 0 && $unitPrice > 0) {
            $amount = (int) round($quantity * $unitPrice);
        }

        $budget->update([
            'type' => $validated['type'],
            'category' => $validated['category'],
            'item_name' => $validated['item_name'],
            'quantity' => $quantity,
            'unit' => $validated['unit'] ?? 'paket',
            'unit_price' => $unitPrice,
            'amount' => $amount,
            'notes' => $validated['notes'] ?? null,
            'sort_order' => (int) ($validated['sort_order'] ?? $budget->sort_order),
        ]);

        return redirect()->route('admin.event.show', ['event' => $event->id, 'tab' => 'rab'])
            ->with('success', 'Item anggaran RAB berhasil diperbarui.');
    }

    /**
     * Remove the specified budget item.
     */
    public function destroy(Request $request, Event $event, EventBudget $budget): RedirectResponse
    {
        abort_unless($budget->event_id === $event->id, 404);

        $canManage = $request->user()->can('manageFinance', $event)
            || $request->user()->isAdmin()
            || in_array($request->user()->role, ['Diktar', 'Penyelenggara', 'Bendahara']);

        abort_unless($canManage, 403, 'Anda tidak memiliki hak akses untuk menghapus item anggaran.');

        $budget->delete();

        return redirect()->route('admin.event.show', ['event' => $event->id, 'tab' => 'rab'])
            ->with('success', 'Item anggaran RAB berhasil dihapus.');
    }

    /**
     * Export the RAB spreadsheet to Excel.
     */
    public function export(Event $event, EventReportExportService $exporter): BinaryFileResponse
    {
        return $exporter->rab($event);
    }

    /**
     * Show the printable version of the RAB.
     */
    public function print(Request $request, Event $event): Response
    {
        $budgets = $event->budgets()
            ->with('creator:id,name')
            ->orderBy('type')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $budgetIncome = (int) $budgets->where('type', 'income')->sum('amount');
        $budgetExpense = (int) $budgets->where('type', 'expense')->sum('amount');
        $budgetBalance = $budgetIncome - $budgetExpense;

        $actualIncome = (int) $event->finances()->where('type', 'income')->sum('amount');
        $actualExpense = (int) $event->finances()->where('type', 'expense')->sum('amount');
        $actualBalance = $actualIncome - $actualExpense;

        $incomeAchievementRate = $budgetIncome > 0 ? round(($actualIncome / $budgetIncome) * 100, 1) : 0;
        $expenseAbsorptionRate = $budgetExpense > 0 ? round(($actualExpense / $budgetExpense) * 100, 1) : 0;

        $incomes = $budgets->where('type', 'income')->map(fn (EventBudget $b) => [
            'id' => $b->id,
            'category' => $b->category,
            'category_name' => AdminEventDetailService::budgetCategoryName($b->category),
            'item_name' => $b->item_name,
            'quantity' => (float) $b->quantity,
            'unit' => $b->unit,
            'unit_price' => (int) $b->unit_price,
            'amount' => (int) $b->amount,
            'notes' => $b->notes,
        ])->values()->all();

        $expenses = $budgets->where('type', 'expense')->map(fn (EventBudget $b) => [
            'id' => $b->id,
            'category' => $b->category,
            'category_name' => AdminEventDetailService::budgetCategoryName($b->category),
            'item_name' => $b->item_name,
            'quantity' => (float) $b->quantity,
            'unit' => $b->unit,
            'unit_price' => (int) $b->unit_price,
            'amount' => (int) $b->amount,
            'notes' => $b->notes,
        ])->values()->all();

        return Inertia::render('Admin/Events/PrintRab', [
            'event' => [
                'id' => $event->id,
                'name' => $event->name,
                'date_formatted' => $event->date_formatted,
                'place' => $event->place,
                'organizer' => $event->organizer,
                'status_label' => $event->status_label,
            ],
            'incomes' => $incomes,
            'expenses' => $expenses,
            'summary' => [
                'total_income' => $budgetIncome,
                'total_expense' => $budgetExpense,
                'planned_balance' => $budgetBalance,
                'actual_income' => $actualIncome,
                'actual_expense' => $actualExpense,
                'actual_balance' => $actualBalance,
                'income_achievement_rate' => $incomeAchievementRate,
                'expense_absorption_rate' => $expenseAbsorptionRate,
            ],
            'printedBy' => $request->user()?->name ?? 'Administrator',
            'printDate' => now()->translatedFormat('d F Y'),
        ]);
    }
}
