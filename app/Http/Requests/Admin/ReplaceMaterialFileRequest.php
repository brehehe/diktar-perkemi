<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ReplaceMaterialFileRequest extends FormRequest
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
        $maxFileSize = config('pustaka.max_file_size_kb', 51200);

        return [
            'book_file' => ['required', 'file', 'mimes:pdf', "max:{$maxFileSize}"],
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
            'book_file.required' => 'File buku digital pengganti wajib diunggah.',
            'book_file.mimes' => 'Format buku harus berupa PDF.',
            'book_file.max' => 'Ukuran file buku melebihi batas yang diizinkan (maksimal 50 MB).',
        ];
    }
}
