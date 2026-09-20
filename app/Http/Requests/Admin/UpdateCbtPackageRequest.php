<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCbtPackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user && ($user->isAdmin() || in_array($user->role, ['Diktar', 'Penyelenggara'], true));
    }

    public function rules(): array
    {
        $package = $this->route('package') ?? $this->route('cbt_package');
        $packageId = is_object($package) ? $package->id : $package;

        return [
            'event_id' => ['nullable', 'integer', 'exists:events,id'],
            'code' => ['required', 'string', 'max:50', Rule::unique('cbt_exam_packages', 'code')->ignore($packageId)],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'exam_type' => ['required', 'string'],
            'question_module_id' => ['nullable', 'exists:question_modules,id'],
            'question_module_ids' => ['nullable', 'array'],
            'question_module_ids.*' => ['exists:question_modules,id'],
            'question_module_quotas' => ['nullable', 'array'],
            'selection_method' => ['nullable', 'string', 'in:random,sequential'],
            'sync_questions' => ['nullable', 'boolean'],
            'target_tracks' => ['nullable', 'array'],
            'target_tracks.*' => ['string', 'max:50'],
            'duration_minutes' => ['required', 'integer', 'min:5', 'max:300'],
            'passing_score' => ['required', 'numeric', 'min:0', 'max:100'],
            'attempts_allowed' => ['required', 'integer', 'min:1', 'max:10'],
            'randomize_questions' => ['nullable', 'boolean'],
            'randomize_answers' => ['nullable', 'boolean'],
            'result_display' => ['required', 'string', 'in:immediate,after_all,hidden'],
            'instructions' => ['nullable', 'string'],
            'status' => ['required', 'string', 'in:draft,ready,open,closed,archived'],
            'question_ids' => ['nullable', 'array'],
            'question_ids.*' => ['exists:question_bank,id'],
        ];
    }
}
