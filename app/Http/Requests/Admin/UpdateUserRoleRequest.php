<?php

namespace App\Http\Requests\Admin;

use App\Models\Role;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRoleRequest extends FormRequest
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
        $validRoles = array_values(array_unique(array_filter(array_merge(
            ['Peserta', 'Pelatih', 'Penguji', 'Wasit', 'Pemateri', 'Penyelenggara', 'Bendahara', 'Sie Acara', 'Dokumentasi', 'Diktar', 'Admin', 'Koordinator Acara'],
            Role::pluck('label')->all(),
            Role::pluck('name')->all(),
        ))));

        return [
            'role' => ['required', 'string', 'in:'.implode(',', $validRoles)],
            'is_supervisor' => ['nullable', 'boolean'],
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
            'role.required' => 'Pilih peran pengguna.',
            'role.in' => 'Peran pengguna yang dipilih tidak valid.',
        ];
    }
}
