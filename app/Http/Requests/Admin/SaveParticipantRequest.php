<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class SaveParticipantRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user && ($user->isAdmin() || in_array($user->role, ['Diktar', 'Penyelenggara'], true));
    }

    public function rules(): array
    {
        $participant = $this->route('participant');

        return [
            'event_id' => ['nullable', 'integer', 'exists:events,id'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('participants', 'email')->ignore($participant)],
            'kenshi_id' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('participants', 'kenshi_id_number')->ignore($participant),
            ],
            'phone' => ['nullable', 'string', 'max:50'],
            'origin' => ['required', 'string', 'max:255'],
            'dojo' => ['nullable', 'string', 'max:255'],
            'dan_level' => ['nullable', 'integer', 'min:1', 'max:10'],
            'admin_notes' => ['nullable', 'string'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
            'remove_photo' => ['nullable', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $kenshiId = trim((string) $this->input('kenshi_id'));

        $this->merge([
            'kenshi_id' => $kenshiId === '' ? null : Str::upper($kenshiId),
        ]);
    }
}
