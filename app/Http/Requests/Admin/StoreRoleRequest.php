<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreRoleRequest extends FormRequest
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
        return [
            'name' => ['required', 'string', 'max:50', 'alpha_dash:ascii', Rule::unique('roles', 'name')],
            'label' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'guard_name' => ['nullable', 'string', 'max:50'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Kode identifikasi peran (slug/kode) wajib diisi.',
            'name.alpha_dash' => 'Kode peran hanya boleh berupa huruf kecil, angka, dan tanda hubung.',
            'name.unique' => 'Kode peran ini sudah digunakan oleh peran lain.',
            'name.max' => 'Kode peran maksimal 50 karakter.',
            'label.required' => 'Nama tampilan peran wajib diisi.',
            'label.max' => 'Nama tampilan peran maksimal 100 karakter.',
            'description.max' => 'Deskripsi peran maksimal 500 karakter.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('name')) {
            $this->merge(['name' => Str::slug($this->string('name')->toString())]);
        } elseif ($this->filled('label')) {
            $this->merge(['name' => Str::slug($this->string('label')->toString())]);
        }
    }
}
