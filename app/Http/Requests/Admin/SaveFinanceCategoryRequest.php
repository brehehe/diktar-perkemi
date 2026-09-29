<?php

namespace App\Http\Requests\Admin;

use App\Models\EventStaff;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class SaveFinanceCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();

        if (! $user) {
            return false;
        }

        return $user->isAdmin()
            || $user->role === 'Diktar'
            || ($user->role === 'Bendahara' && EventStaff::query()
                ->where('user_id', $user->id)
                ->where('duty', 'bendahara')
                ->exists());
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $category = $this->route('financeCategory');

        return [
            'name' => ['required', 'string', 'max:100', Rule::unique('finance_categories', 'name')->ignore($category)],
            'transaction_type' => ['required', Rule::in(['income', 'expense', 'both'])],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            $category = $this->route('financeCategory');
            $transactionType = $this->string('transaction_type')->toString();

            if (! $category || $transactionType === 'both' || $validator->errors()->has('transaction_type')) {
                return;
            }

            if ($category->finances()->where('type', '!=', $transactionType)->exists()) {
                $validator->errors()->add('transaction_type', 'Jenis kategori tidak dapat diubah karena sudah dipakai oleh transaksi dengan jenis berbeda.');
            }
        }];
    }
}
