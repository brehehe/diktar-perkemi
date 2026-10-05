<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SaveEventBudgetRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $event = $this->route('event');
        $budget = $this->route('budget');

        return $event
            && (! $budget || $budget->event_id === $event->id)
            && ($this->user()?->can('manageFinance', $event)
                || $this->user()?->isAdmin()
                || in_array($this->user()?->role, ['Diktar', 'Penyelenggara', 'Bendahara']));
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
            'category' => ['required', 'string', 'max:50'],
            'item_name' => ['required', 'string', 'max:255'],
            'quantity' => ['required', 'numeric', 'min:0.01', 'max:999999'],
            'unit' => ['nullable', 'string', 'max:50'],
            'unit_price' => ['required', 'integer', 'min:0', 'max:999999999999'],
            'amount' => ['nullable', 'integer', 'min:0', 'max:999999999999'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ];
    }
}
