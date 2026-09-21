<?php

namespace App\Http\Requests\Admin;

use App\Services\EventDocumentGenerator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class GenerateEventCertificateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('event'))
            && $this->route('eventParticipant')?->event_id === $this->route('event')?->id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'certificate_number' => ['nullable', 'string', 'max:100'],
            'document_track' => ['nullable', 'string', 'max:10'],
        ];
    }

    /**
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $trackCode = EventDocumentGenerator::resolveDocumentTrack(
                    $this->route('eventParticipant')?->track_code,
                    is_string($this->input('document_track')) ? $this->input('document_track') : null
                );
                $event = $this->route('event');

                if (! $event || ! EventDocumentGenerator::supportsForEvent($event, 'certificate', $trackCode)) {
                    $validator->errors()->add(
                        'certificate_number',
                        'Template sertifikat otomatis belum tersedia untuk jalur atau tanggal event ini. Gunakan unggah PDF manual.'
                    );
                }
            },
        ];
    }

    public function messages(): array
    {
        return [
            'certificate_number.max' => 'Nomor sertifikat maksimal 100 karakter.',
        ];
    }
}
