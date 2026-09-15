<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateMaterialRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:100'],
            'author' => ['nullable', 'string', 'max:255'],
            'category_id' => ['required', 'exists:categories,id'],
            'type' => ['required', 'in:module,book,speaker_material,guideline,video,document'],
            'publication_year' => ['nullable', 'integer', 'min:1970', 'max:2099'],
            'page_count' => ['nullable', 'integer', 'min:1'],
            'summary' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'keywords' => ['nullable', 'string', 'max:500'],
            'admin_notes' => ['nullable', 'string'],
            'status' => ['required', 'in:draft,review,published,archived'],
            'cover_file' => ['nullable', 'image', 'max:2048'],
            'book_file' => ['nullable', 'file', 'mimes:pdf', "max:{$maxFileSize}"],
            'is_downloadable' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
            'audiences' => ['nullable', 'array'],
            'audiences.*' => ['exists:audiences,id'],
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
            'title.required' => 'Judul materi wajib diisi.',
            'title.max' => 'Judul materi maksimal 255 karakter.',
            'category_id.required' => 'Pilih kategori utama materi.',
            'category_id.exists' => 'Kategori yang dipilih tidak valid.',
            'type.required' => 'Pilih jenis materi.',
            'type.in' => 'Jenis materi tidak valid.',
            'book_file.mimes' => 'Format buku harus berupa PDF.',
            'book_file.max' => 'Ukuran file buku melebihi batas yang diizinkan (maksimal 50 MB).',
            'cover_file.image' => 'Cover harus berupa file gambar yang valid (JPG, PNG, WebP).',
            'cover_file.max' => 'Ukuran berkas sampul maksimal 2 MB.',
            'status.required' => 'Status publikasi wajib ditentukan.',
            'status.in' => 'Status publikasi tidak valid.',
            'audiences.*.exists' => 'Peran audiens sasaran tidak valid.',
        ];
    }
}
