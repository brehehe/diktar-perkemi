<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateQuestionBankRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user && ($user->isAdmin() || in_array($user->role, ['Diktar', 'Penyelenggara'], true));
    }

    public function rules(): array
    {
        $question = $this->route('question') ?? $this->route('bank_soal');
        $questionId = is_object($question) ? $question->id : $question;

        return [
            'event_id' => ['nullable', 'integer', 'exists:events,id'],
            'code' => ['required', 'string', 'max:50', Rule::unique('question_bank', 'code')->ignore($questionId)],
            'question_module_ids' => ['required', 'array', 'min:1'],
            'question_module_ids.*' => ['required', 'integer', 'distinct', 'exists:question_modules,id'],
            'question_text' => ['required', 'string'],
            'question_type' => ['required', 'string', 'in:single_choice,true_false,multiple_choice,essay'],
            'options' => ['nullable', 'array'],
            'options.*.key' => ['required_with:options', 'string'],
            'options.*.text' => ['required_with:options', 'string'],
            'correct_answer' => ['nullable'],
            'points' => ['required', 'numeric', 'min:0.1', 'max:100'],
            'difficulty_level' => ['required', 'string', 'in:basic,intermediate,advanced,easy,medium,hard'],
            'explanation' => ['nullable', 'string'],
            'material_id' => ['nullable', 'exists:materials,id'],
            'learning_module_id' => ['nullable', 'exists:learning_modules,id'],
            'status' => ['required', 'string', 'in:draft,active,inactive,archived'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('question_module_ids') && $this->filled('question_module_id')) {
            $this->merge(['question_module_ids' => [$this->input('question_module_id')]]);
        }
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $type = $this->input('question_type');
            $options = $this->input('options', []);
            $correct = $this->input('correct_answer');

            if (in_array($type, ['single_choice', 'true_false', 'multiple_choice'], true)) {
                if (empty($options) || count($options) < 2) {
                    $validator->errors()->add('options', 'Soal pilihan ganda atau benar/salah harus memiliki minimal dua pilihan jawaban.');
                }
                if (empty($correct)) {
                    $validator->errors()->add('correct_answer', 'Kunci jawaban benar harus ditentukan.');
                }
            }
        });
    }
}
