<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreLearningModuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user && ($user->isAdmin() || in_array($user->role, ['Diktar', 'Penyelenggara'], true));
    }

    public function rules(): array
    {
        return [
            'event_id' => ['nullable', 'integer', 'exists:events,id'],
            'code' => ['required', 'string', 'max:50', 'unique:learning_modules,code'],
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'track_codes' => ['nullable', 'array'],
            'track_codes.*' => ['string', 'max:50'],
            'target_roles' => ['nullable', 'array'],
            'target_roles.*' => ['string', 'max:100'],
            'total_jp' => ['required', 'integer', 'min:1'],
            'level' => ['required', 'string', 'max:50'],
            'status' => ['required', 'string', 'in:draft,active,inactive,archived'],
            'learning_objectives' => ['nullable', 'array'],
            'competency_outcomes' => ['nullable', 'array'],
            'keywords' => ['nullable', 'string', 'max:255'],
            'material_file' => ['nullable', 'file', 'mimes:pdf', 'max:51200'],
            'material_title' => ['nullable', 'string', 'max:255'],
            'materials' => ['nullable', 'array'],
            'materials.*.material_id' => ['required', 'exists:materials,id'],
            'materials.*.sort_order' => ['nullable', 'integer'],
            'materials.*.is_required' => ['nullable', 'boolean'],
            'materials.*.instructor_notes' => ['nullable', 'string'],
            'materials.*.estimated_duration_minutes' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
