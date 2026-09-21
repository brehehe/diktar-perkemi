<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UploadEventTranscriptRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('event'))
            && $this->route('eventParticipant')?->event_id === $this->route('event')?->id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'transcript' => ['required', 'file', 'mimes:pdf', 'max:10240'],
            'transcript_number' => ['nullable', 'string', 'max:100'],
            'document_track' => ['nullable', 'string', 'max:10'],
        ];
    }

    public function messages(): array
    {
        return [
            'transcript.required' => 'Pilih berkas transkrip PDF.',
            'transcript.mimes' => 'Transkrip harus berupa PDF.',
            'transcript.max' => 'Ukuran transkrip maksimal 10 MB.',
        ];
    }
}
