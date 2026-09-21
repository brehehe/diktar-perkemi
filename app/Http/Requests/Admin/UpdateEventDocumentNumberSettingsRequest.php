<?php

namespace App\Http\Requests\Admin;

use App\Services\EventDocumentGenerator;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class UpdateEventDocumentNumberSettingsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Gate::allows('update', $this->route('event'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = ['numbers' => ['required', 'array:'.implode(',', array_keys(EventDocumentGenerator::NUMBER_LABELS))]];

        foreach (array_keys(EventDocumentGenerator::NUMBER_LABELS) as $trackCode) {
            $rules["numbers.{$trackCode}"] = ['required', 'array:prefix,start'];
            $rules["numbers.{$trackCode}.prefix"] = ['nullable', 'string', 'max:32', 'regex:/^[A-Z0-9-]+$/'];
            $rules["numbers.{$trackCode}.start"] = ['nullable', 'integer', 'min:1', 'max:999999'];
        }

        return $rules;
    }
}
