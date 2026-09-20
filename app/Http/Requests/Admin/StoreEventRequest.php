<?php

namespace App\Http\Requests\Admin;

use App\Models\Event;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('create', Event::class);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'place' => ['required', 'string', 'max:255'],
            'organizer' => ['required', 'string', 'max:255'],
            'responsible_user_id' => ['nullable', Rule::exists('users', 'id')->where('role', 'Penyelenggara')],
            'duration_days' => ['nullable', 'string', 'max:50'],
            'total_effective_jp' => ['required', 'integer', 'min:1'],
            'total_schedule_jp' => ['required', 'integer', 'min:1'],
            'jp_duration_minutes' => ['required', 'integer', 'min:1'],
            'learning_method' => ['nullable', 'string', 'max:255'],
            'participant_quota' => ['required', 'integer', 'min:1'],
            'status' => ['required', 'in:draft,open_registration,ongoing,completed,archived'],
            'cover_image' => ['nullable', 'string'],
            'banner_image' => ['nullable', 'string'],
        ];
    }
}
