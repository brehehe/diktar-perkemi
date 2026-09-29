<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveFinanceCategoryRequest;
use App\Models\EventStaff;
use App\Models\FinanceCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class FinanceCategoryController extends Controller
{
    public function store(SaveFinanceCategoryRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        FinanceCategory::create([
            'code' => $this->uniqueCode($validated['name']),
            'name' => Str::squish($validated['name']),
            'transaction_type' => $validated['transaction_type'],
            'sort_order' => ((int) FinanceCategory::max('sort_order')) + 10,
        ]);

        return back()->with('success', 'Kategori keuangan berhasil ditambahkan.');
    }

    public function update(SaveFinanceCategoryRequest $request, FinanceCategory $financeCategory): RedirectResponse
    {
        $validated = $request->validated();
        $financeCategory->update([
            'name' => Str::squish($validated['name']),
            'transaction_type' => $validated['transaction_type'],
        ]);

        return back()->with('success', 'Kategori keuangan berhasil diperbarui.');
    }

    public function destroy(Request $request, FinanceCategory $financeCategory): RedirectResponse
    {
        $this->authorizeManager($request);

        if ($financeCategory->finances()->exists()) {
            return back()->with('error', 'Kategori tidak dapat dihapus karena sudah dipakai pada transaksi keuangan.');
        }

        $financeCategory->delete();

        return back()->with('success', 'Kategori keuangan berhasil dihapus.');
    }

    private function authorizeManager(Request $request): void
    {
        $user = $request->user();
        $isAssignedTreasurer = $user->role === 'Bendahara' && EventStaff::query()
            ->where('user_id', $user->id)
            ->where('duty', 'bendahara')
            ->exists();

        abort_unless($user->isAdmin() || $user->role === 'Diktar' || $isAssignedTreasurer, 403);
    }

    private function uniqueCode(string $name): string
    {
        $baseCode = Str::limit(Str::slug($name, '_'), 24, '');
        $baseCode = $baseCode !== '' ? $baseCode : 'kategori';
        $code = $baseCode;
        $suffix = 2;

        while (FinanceCategory::query()->where('code', $code)->exists()) {
            $suffixText = (string) $suffix++;
            $code = Str::limit($baseCode, 23 - strlen($suffixText), '').'_'.$suffixText;
        }

        return $code;
    }
}
