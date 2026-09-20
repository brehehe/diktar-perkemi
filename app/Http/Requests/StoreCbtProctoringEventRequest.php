<?php

namespace App\Http\Requests;

use App\Models\CbtProctoringEvent;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCbtProctoringEventRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', 'string', Rule::in(CbtProctoringEvent::TYPES)],
            'metadata' => ['nullable', 'array'],
            'metadata.reason' => ['nullable', 'string', 'max:120'],
            'metadata.visibility_state' => ['nullable', Rule::in(['visible', 'hidden'])],
            'metadata.trigger' => ['nullable', 'string', 'max:40'],
        ];
    }
}
