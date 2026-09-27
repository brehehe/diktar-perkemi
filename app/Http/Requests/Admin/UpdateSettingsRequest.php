<?php

namespace App\Http\Requests\Admin;

use App\Services\EventDocumentGenerator;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isAdmin();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'settings_group' => ['nullable', 'string', 'in:identity,landing,registration,notification,general,certificate_numbers'],
        ];

        if ($this->input('settings_group') === 'certificate_numbers') {
            foreach (array_keys(EventDocumentGenerator::NUMBER_LABELS) as $trackCode) {
                $rules[EventDocumentGenerator::settingKey($trackCode, 'prefix')] = ['required', 'string', 'max:32', 'regex:/^[A-Z0-9-]+$/'];
                $rules[EventDocumentGenerator::settingKey($trackCode, 'start')] = [
                    'required',
                    'regex:/^0*[1-9]\d*$/',
                    function ($attribute, $value, $fail) {
                        if ((int) $value > 999999) {
                            $fail('Nomor awal tidak boleh lebih dari 999999.');
                        }
                    },
                ];
            }
        }

        return $rules;
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'document_number_*_start.regex' => 'Nomor awal harus berupa angka lebih besar dari 0 (contoh: 001, 056, atau 0056).',
        ];
    }
}
