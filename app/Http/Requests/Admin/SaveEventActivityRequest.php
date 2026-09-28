<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SaveEventActivityRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $event = $this->route('event');
        $kind = $this->input('kind');
        $record = $this->route('eventActivity');

        return $event && in_array($kind, ['realisation', 'documentation'], true)
            && (! $record || ($record->event_id === $event->id && ($this->user()?->can('manageActivity', [$event, $record->kind]) ?? false)))
            && ($this->user()?->can('manageActivity', [$event, $kind]) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'kind' => ['required', 'in:realisation,documentation'],
            'title' => ['required', 'string', 'max:255'],
            'activity_type' => ['required', 'string', 'max:60'],
            'occurred_on' => ['required', 'date'],
            'event_session_id' => ['nullable', 'integer', 'exists:event_sessions,id'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'media' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,mp4,mov,webm', 'max:102400'],
        ];
    }

    public function after(): array
    {
        return [function ($validator): void {
            if ($this->filled('event_session_id') && ! $this->route('event')?->sessions()->whereKey($this->input('event_session_id'))->exists()) {
                $validator->errors()->add('event_session_id', 'Sesi tidak termasuk dalam event ini.');
            }

            if ($this->input('kind') === 'documentation' && ! $this->hasFile('media') && ! $this->route('eventActivity')?->file_path) {
                $validator->errors()->add('media', 'Foto atau video wajib diunggah untuk dokumentasi.');
            }
        }];
    }
}
