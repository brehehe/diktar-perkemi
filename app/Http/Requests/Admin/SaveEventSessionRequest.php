<?php

namespace App\Http\Requests\Admin;

use App\Models\Event;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class SaveEventSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        if (! $user || in_array($user->role, ['Pemateri', 'Peserta'], true)) {
            return false;
        }

        $event = $this->route('event') ?? $this->route('session')?->event;
        if (! $event && $this->input('event_id')) {
            $event = Event::find($this->input('event_id'));
        }

        if ($event) {
            return Gate::allows('update', $event);
        }

        return $user->isAdmin() || in_array($user->role, ['Diktar', 'Penyelenggara', 'Koordinator Acara', 'Koordinator Jadwal'], true);
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

        $merge = [];

        foreach (['speaker_id', 'learning_module_id', 'event_module_id', 'material_id', 'cbt_exam_package_id', 'event_session_type_id'] as $field) {
            if ($this->has($field)) {
                $val = $this->input($field);
                $merge[$field] = ($val === '' || $val === null) ? null : (int) $val;
            }
        }

        if ($this->has('attendance_setting')) {
            $att = $this->input('attendance_setting');
            if ($att === 'mandatory' || ! in_array($att, ['none', 'check_in', 'check_in_out'], true)) {
                $merge['attendance_setting'] = 'check_in';
            }
        }

        if ($this->has('status')) {
            $st = $this->input('status');
            if (! in_array($st, ['scheduled', 'ongoing', 'completed', 'cancelled', 'delayed'], true)) {
                $merge['status'] = 'scheduled';
            }
        }

        if (! empty($merge)) {
            $this->merge($merge);
        }
    }

    public function rules(): array
    {
        $event = $this->route('event') ?? $this->route('session')?->event;
        $eventId = $event?->id ?? $this->input('event_id');

        return [
            'day_number' => ['required', 'integer', 'min:1', 'max:60'],
            'session_number' => ['required', 'string', 'max:50'],
            'event_session_type_id' => ['nullable'],
            'session_type_code' => ['nullable', 'string', 'max:50'],
            'speaker_id' => [
                'nullable',
                Rule::exists('speakers', 'id')->where(function ($query) use ($eventId) {
                    if ($eventId) {
                        return $query->whereNull('event_id')->orWhere('event_id', $eventId);
                    }

                    return $query;
                }),
            ],
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
            'status' => ['required', 'in:scheduled,ongoing,completed,cancelled,delayed'],
            'attendance_setting' => ['nullable', 'in:none,check_in,check_in_out'],
            'material_id' => ['nullable', 'exists:materials,id'],
            'learning_module_id' => ['nullable', 'exists:learning_modules,id'],
            'event_module_id' => [
                'nullable',
                Rule::exists('event_modules', 'id')->where(function ($query) use ($eventId) {
                    if ($eventId) {
                        return $query->where('event_id', $eventId);
                    }

                    return $query;
                }),
            ],
            'cbt_exam_package_id' => ['nullable', 'exists:cbt_exam_packages,id'],
            'requires_attendance_before_cbt' => ['nullable', 'boolean'],
        ];
    }
}
