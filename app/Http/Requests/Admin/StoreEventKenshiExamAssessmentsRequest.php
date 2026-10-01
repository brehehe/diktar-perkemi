<?php

namespace App\Http\Requests\Admin;

use App\Models\Event;
use App\Services\EventKenshiExamService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class StoreEventKenshiExamAssessmentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        $event = $this->route('event');

        return $event instanceof Event && Gate::allows('update', $event);
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'category' => ['required', 'string', 'in:'.implode(',', EventKenshiExamService::TRACK_CODES)],
            'document_details' => ['nullable', 'array'],
            'document_details.mandate_number' => ['nullable', 'string', 'max:100'],
            'document_details.mandate_date' => ['nullable', 'date'],
            'document_details.examiners' => ['nullable', 'array', 'max:3'],
            'document_details.examiners.*.name' => ['nullable', 'string', 'max:255'],
            'document_details.examiners.*.rank' => ['nullable', 'string', 'max:100'],
            'document_details.examiners.*.certificate_number' => ['nullable', 'string', 'max:100'],
            'document_details.coordinator_name' => ['nullable', 'string', 'max:255'],
            'document_details.coordinator_rank' => ['nullable', 'string', 'max:100'],
            'document_details.organizer_representative_name' => ['nullable', 'string', 'max:255'],
            'document_details.organizer_representative_rank' => ['nullable', 'string', 'max:100'],
            'document_details.organizer_representative_role' => ['nullable', 'string', 'max:150'],
            'assessments' => ['present', 'array', 'max:100'],
            'assessments.*.event_participant_id' => ['required', 'integer', 'distinct', 'exists:event_participants,id'],
            'assessments.*.scores' => ['nullable', 'array'],
            'assessments.*.scores.*' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'assessments.*.total_score_override' => ['nullable', 'numeric', 'min:0', 'max:400'],
            'assessments.*.status_override' => ['nullable', 'string', 'in:auto,passed,failed,absent'],
            'assessments.*.notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'assessments.present' => 'Data peserta harus disertakan.',
            'assessments.*.event_participant_id.distinct' => 'Peserta yang sama tidak boleh dikirim dua kali.',
            'assessments.*.scores.*.numeric' => 'Nilai harus berupa angka.',
            'assessments.*.scores.*.min' => 'Nilai tidak boleh kurang dari 0.',
            'assessments.*.scores.*.max' => 'Nilai tidak boleh lebih dari 100.',
            'assessments.*.total_score_override.numeric' => 'Nilai akhir manual harus berupa angka.',
            'assessments.*.total_score_override.min' => 'Nilai akhir manual tidak boleh kurang dari 0.',
            'assessments.*.total_score_override.max' => 'Nilai akhir manual tidak boleh lebih dari 400.',
            'document_details.mandate_date.date' => 'Tanggal mandat harus berupa tanggal yang valid.',
        ];
    }
}
