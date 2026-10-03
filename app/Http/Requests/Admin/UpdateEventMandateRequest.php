<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class UpdateEventMandateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Gate::allows('update', $this->route('event'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'letter_number' => ['required', 'string', 'max:100'],
            'title' => ['required', 'string', 'max:255'],
            'event_name' => ['nullable', 'string', 'max:1000'],
            'source_references' => ['nullable', 'array', 'max:10'],
            'source_references.*' => ['required', 'string', 'max:1000'],
            'issued_place' => ['nullable', 'string', 'max:100'],
            'issued_at' => ['nullable', 'date'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after_or_equal:valid_from'],
            'venue' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:1000'],
            'province' => ['nullable', 'string', 'max:100'],
            'exam_scope' => ['nullable', 'string', 'max:2000'],
            'participant_total' => ['nullable', 'integer', 'min:0', 'max:65535'],
            'examiners' => ['nullable', 'array', 'max:20'],
            'examiners.*.name' => ['required', 'string', 'max:255'],
            'examiners.*.rank' => ['nullable', 'string', 'max:50'],
            'provisions' => ['nullable', 'array', 'max:30'],
            'provisions.*' => ['required', 'string', 'max:2000'],
            'participant_summary' => ['nullable', 'array', 'max:20'],
            'participant_summary.*.level' => ['required', 'string', 'max:50'],
            'participant_summary.*.count' => ['required', 'integer', 'min:0', 'max:65535'],
            'participants' => ['nullable', 'array', 'max:1000'],
            'participants.*.number' => ['required', 'integer', 'min:1', 'max:65535'],
            'participants.*.name' => ['required', 'string', 'max:255'],
            'participants.*.nik' => ['required', 'string', 'max:50'],
            'participants.*.gender' => ['nullable', 'string', 'max:20'],
            'participants.*.age' => ['nullable', 'numeric', 'min:0', 'max:150'],
            'participants.*.level' => ['nullable', 'string', 'max:50'],
            'participants.*.dojo' => ['nullable', 'string', 'max:255'],
            'participants.*.branch' => ['nullable', 'string', 'max:255'],
            'participants.*.status' => ['nullable', 'string', 'max:30'],
            'participants.*.notes' => ['nullable', 'string', 'max:1000'],
            'home_assignments' => ['nullable', 'array', 'max:20'],
            'home_assignments.*.level' => ['required', 'string', 'max:50'],
            'home_assignments.*.questions' => ['required', 'array', 'max:20'],
            'home_assignments.*.questions.*' => ['required', 'string', 'max:2000'],
            'signatory_name' => ['nullable', 'string', 'max:255'],
            'signatory_title' => ['nullable', 'string', 'max:255'],
            'document' => ['nullable', 'file', 'mimes:pdf', 'extensions:pdf', 'max:20480'],
        ];
    }
}
