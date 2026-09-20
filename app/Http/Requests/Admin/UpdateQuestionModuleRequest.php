<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateQuestionModuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user && ($user->isAdmin() || in_array($user->role, ['Diktar', 'Penyelenggara'], true));
    }

    public function rules(): array
    {
        $module = $this->route('module') ?? $this->route('question_module');
        $moduleId = is_object($module) ? $module->id : $module;

        return [
            'event_id' => ['nullable', 'integer', 'exists:events,id'],
            'code' => ['required', 'string', 'max:50', Rule::unique('question_modules', 'code')->ignore($moduleId)],
            'title' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'track_codes' => ['nullable', 'array'],
            'track_codes.*' => ['string', 'max:50'],
            'tested_competencies' => ['nullable', 'array'],
            'assessment_indicators' => ['nullable', 'array'],
            'evaluation_purpose' => ['nullable', 'string'],
            'default_weight' => ['required', 'numeric', 'min:0.1', 'max:100'],
            'passing_grade' => ['required', 'numeric', 'min:0', 'max:100'],
            'status' => ['required', 'string', 'in:draft,active,inactive,archived'],
            'learning_module_id' => ['nullable', 'exists:learning_modules,id'],
        ];
    }
}
