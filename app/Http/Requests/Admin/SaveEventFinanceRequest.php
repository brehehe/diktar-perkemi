<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SaveEventFinanceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $event = $this->route('event');
        $finance = $this->route('finance');

        return $event
            && (! $finance || $finance->event_id === $event->id)
            && ($this->user()?->can('manageFinance', $event) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', 'in:income,expense'],
            'category' => ['required', 'in:sponsorship,registration,grant,accommodation,consumption,printing,venue,transport,other'],
            'description' => ['required', 'string', 'max:255'],
            'sponsor_name' => ['nullable', 'string', 'max:255', 'required_if:category,sponsorship'],
            'amount' => ['required', 'integer', 'min:1', 'max:999999999999'],
            'occurred_on' => ['required', 'date'],
            'evidence' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:10240'],
        ];
    }

    public function after(): array
    {
        return [function ($validator): void {
            $income = ['sponsorship', 'registration', 'grant'];
            $type = $this->input('type');
            $category = $this->input('category');
            if ($type && $category && $category !== 'other'
                && (($type === 'income') !== in_array($category, $income, true))) {
                $validator->errors()->add('category', 'Kategori tidak sesuai dengan jenis transaksi.');
            }
        }];
    }
}
