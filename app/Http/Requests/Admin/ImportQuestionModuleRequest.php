<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ImportQuestionModuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user && ($user->isAdmin() || in_array($user->role, ['Diktar', 'Penyelenggara'], true));
    }

    public function rules(): array
    {
        return [
            'event_id' => ['nullable', 'integer', 'exists:events,id'],
            'file' => [
                'required',
                'file',
                'mimes:xlsx',
                'max:20480', // 20 MB
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'Silakan pilih berkas Excel (.xlsx) untuk diunggah.',
            'file.file' => 'Berkas yang diunggah tidak valid.',
            'file.mimes' => 'Format berkas harus berupa Excel (.xlsx).',
            'file.max' => 'Ukuran berkas tidak boleh melebihi 20MB.',
        ];
    }
}
