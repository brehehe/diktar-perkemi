<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreEventParticipantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('update', $this->route('event'));
    }

    public function rules(): array
    {
        $event = $this->route('event');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:participants,email'],
            'kenshi_id' => ['nullable', 'string', 'max:50', Rule::unique('participants', 'kenshi_id_number')],
            'phone' => ['nullable', 'string', 'max:50'],
            'origin' => ['required', 'string', 'max:255'],
            'dojo' => ['nullable', 'string', 'max:255'],
            'dan_level' => ['nullable', 'integer', 'min:1', 'max:10'],
            'participant_track_id' => ['required', Rule::exists('participant_tracks', 'id')->where(fn ($query) => $query->whereNull('event_id')->orWhere('event_id', $event->id))],
            'rotation_group' => ['nullable', 'in:A1,A2'],
            'admin_status' => ['required', 'in:pending,verified'],
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
