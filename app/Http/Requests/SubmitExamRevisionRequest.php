<?php

namespace App\Http\Requests;

use App\Models\EventParticipant;
use App\Models\Participant;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SubmitExamRevisionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $attempt = $this->route('attempt');
        $participant = Participant::where('user_id', $this->user()?->id)->first();

        return (bool) ($participant
            && $attempt?->participant_id === $participant->id
            && $attempt?->event?->slug === $this->route('slug')
            && EventParticipant::where('event_id', $attempt->event_id)
                ->where('participant_id', $participant->id)
                ->where('admin_status', 'verified')->exists());
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'paper' => ['required', 'file', 'mimes:pdf', 'max:10240'],
        ];
    }
}
