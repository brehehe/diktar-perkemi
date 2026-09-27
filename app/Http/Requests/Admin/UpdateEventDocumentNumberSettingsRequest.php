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
        $rules = [
            'numbers' => ['required', 'array:'.implode(',', array_keys(EventDocumentGenerator::NUMBER_LABELS))],
            'transcript_numbers' => ['nullable', 'array'],
            'apply_to_participants' => ['nullable', 'boolean'],
            'regenerate_documents' => ['nullable', 'boolean'],
        ];

        foreach (array_keys(EventDocumentGenerator::NUMBER_LABELS) as $trackCode) {
            $rules["numbers.{$trackCode}"] = ['required', 'array:prefix,start'];
            $rules["numbers.{$trackCode}.prefix"] = ['nullable', 'string', 'max:32', 'regex:/^[A-Z0-9-]+$/'];
            $rules["numbers.{$trackCode}.start"] = ['nullable', 'regex:/^0*[1-9]\d*$/', function ($attribute, $value, $fail) {
                if ((int) $value > 999999) {
                    $fail('Nomor awal tidak boleh lebih dari 999999.');
                }
            }];

            $rules["transcript_numbers.{$trackCode}"] = ['nullable', 'array:prefix,start'];
            $rules["transcript_numbers.{$trackCode}.prefix"] = ['nullable', 'string', 'max:32', 'regex:/^[A-Z0-9-]+$/'];
            $rules["transcript_numbers.{$trackCode}.start"] = ['nullable', 'regex:/^0*[1-9]\d*$/', function ($attribute, $value, $fail) {
                if ((int) $value > 999999) {
                    $fail('Nomor awal tidak boleh lebih dari 999999.');
                }
            }];
        }

        return $rules;
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'numbers.*.start.regex' => 'Nomor awal harus berupa angka lebih besar dari 0 (contoh: 001, 056, atau 0056).',
            'transcript_numbers.*.start.regex' => 'Nomor awal harus berupa angka lebih besar dari 0 (contoh: 001, 056, atau 0056).',
        ];
    }
}
