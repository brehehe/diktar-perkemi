<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class SaveEventSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('update', $this->route('event'));
    }

    protected function prepareForValidation(): void
    {
        $learningModuleId = $this->input('learning_module_id');
        if (is_string($learningModuleId) && str_starts_with($learningModuleId, 'legacy_')) {
            $this->merge([
                'event_module_id' => (int) str_replace('legacy_', '', $learningModuleId),
                'learning_module_id' => null,
            ]);
        }
    }

    public function rules(): array
    {
        $event = $this->route('event');

        return [
            'day_number' => ['required', 'integer', 'min:1', 'max:60'],
            'session_number' => ['required', 'string', 'max:50'],
            'event_session_type_id' => ['nullable'],
            'session_type_code' => ['nullable', 'string', 'max:50'],
            'speaker_id' => ['nullable', Rule::exists('speakers', 'id')->where(fn ($query) => $query->whereNull('event_id')->orWhere('event_id', $event->id))],
            'session_date' => ['nullable', 'date'],
            'date' => ['nullable', 'date'],
            'start_time' => ['required', 'string'],
            'end_time' => ['required', 'string'],
            'duration_jp' => ['required', 'integer', 'min:0'],
            'topic' => ['required', 'string', 'max:255'],
            'subtopic' => ['nullable', 'string'],
            'method' => ['nullable', 'string', 'max:100'],
            'room' => ['nullable', 'string', 'max:100'],
            'target_tracks' => ['nullable', 'array'],
            'target_tracks.*' => ['string', 'exists:participant_tracks,code'],
            'track_codes' => ['nullable', 'array'],
            'track_codes.*' => ['string', 'exists:participant_tracks,code'],
            'module_code' => ['nullable', 'string', 'max:50'],
            'status' => ['required', 'in:scheduled,ongoing,completed,cancelled'],
            'attendance_setting' => ['nullable', 'in:none,check_in,check_in_out'],
            'material_id' => ['nullable', 'exists:materials,id'],
            'learning_module_id' => ['nullable', 'exists:learning_modules,id'],
            'event_module_id' => ['nullable', Rule::exists('event_modules', 'id')->where('event_id', $event->id)],
            'cbt_exam_package_id' => ['nullable', 'exists:cbt_exam_packages,id'],
            'requires_attendance_before_cbt' => ['nullable', 'boolean'],
        ];
    }
}
