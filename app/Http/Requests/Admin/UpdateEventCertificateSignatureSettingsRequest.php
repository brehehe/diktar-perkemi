<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class UpdateEventCertificateSignatureSettingsRequest extends FormRequest
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
        return [
            'city' => ['nullable', 'string', 'max:100'],
            'date' => ['nullable', 'string', 'max:100'],
            'organization' => ['nullable', 'string', 'max:150'],
            'position' => ['nullable', 'string', 'max:100'],
            'signer_name' => ['nullable', 'string', 'max:150'],
            'signature_image' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:2048'],
            'signature_data' => ['nullable', 'string'],
        ];
    }
}
