<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLearningModuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user && ($user->isAdmin() || in_array($user->role, ['Diktar', 'Penyelenggara'], true));
    }

    public function rules(): array
    {
        $moduleId = $this->route('module')?->id ?? $this->route('learning_module')?->id;

        return [
            'event_id' => ['nullable', 'integer', 'exists:events,id'],
            'code' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('learning_modules', 'code')->ignore($moduleId)],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'category' => ['sometimes', 'required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'track_codes' => ['nullable', 'array'],
            'track_codes.*' => ['string', 'max:50'],
            'target_roles' => ['nullable', 'array'],
            'target_roles.*' => ['string', 'max:100'],
            'total_jp' => ['sometimes', 'required', 'integer', 'min:1'],
            'level' => ['sometimes', 'required', 'string', 'max:50'],
            'status' => ['sometimes', 'required', 'string', 'in:draft,active,inactive,archived'],
            'learning_objectives' => ['nullable', 'array'],
            'competency_outcomes' => ['nullable', 'array'],
            'keywords' => ['nullable', 'string', 'max:255'],
            'materials' => ['nullable', 'array'],
            'materials.*.material_id' => ['required', 'exists:materials,id'],
            'materials.*.sort_order' => ['nullable', 'integer'],
            'materials.*.is_required' => ['nullable', 'boolean'],
            'materials.*.instructor_notes' => ['nullable', 'string'],
            'materials.*.estimated_duration_minutes' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
