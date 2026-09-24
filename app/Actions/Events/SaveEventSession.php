<?php

namespace App\Actions\Events;

use App\Models\Event;
use App\Models\EventSession;
use App\Models\EventSessionType;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SaveEventSession
{
    /**
     * @param  array<string, mixed>  $validated
     */
    public function handle(Event $event, array $validated, ?EventSession $session = null): EventSession
    {
        abort_if($session?->session_type_code === 'KEHADIRAN_AWAL', 403);
        abort_if($session && $session->event_id !== $event->id, 404);

        return DB::transaction(function () use ($event, $validated, $session): EventSession {
            $sessionTypeCode = $this->sessionTypeCode($validated, $session);
            abort_if($sessionTypeCode === 'KEHADIRAN_AWAL', 403);
            $this->validateBusinessRules($event, $validated, $sessionTypeCode, $session);

            $data = $this->sessionAttributes($event, $validated, $sessionTypeCode, $session);
            if ($data['room']) {
                $data['event_room_id'] = $event->rooms()->firstOrCreate(['name' => $data['room']])->id;
            } elseif ($session) {
                $data['event_room_id'] = null;
            }

            if (! empty($data['cbt_exam_package_id'])) {
                $event->linkedCbtPackages()->syncWithoutDetaching([
                    $data['cbt_exam_package_id'] => [
                        'is_required' => true,
                        'sort_order' => $event->linkedCbtPackages()->count() + 1,
                    ],
                ]);
            }

            if (! empty($data['learning_module_id'])) {
                $event->learningModules()->syncWithoutDetaching([
                    $data['learning_module_id'] => [
                        'is_required' => true,
                        'sort_order' => $event->learningModules()->count() + 1,
                    ],
                ]);
            }

            if ($session) {
                $session->update($data);

                return $session->refresh();
            }

            return $event->sessions()->create($data);
        });
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    private function sessionTypeCode(array $validated, ?EventSession $session): string
    {
        if (! empty($validated['event_session_type_id'])) {
            return EventSessionType::query()->find($validated['event_session_type_id'])?->code
                ?? $session?->session_type_code
                ?? 'PLENO';
        }

        return $validated['session_type_code'] ?? $session?->session_type_code ?? 'PLENO';
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    private function validateBusinessRules(
        Event $event,
        array $validated,
        string $sessionTypeCode,
        ?EventSession $session,
    ): void {
        if ($validated['day_number'] > $event->total_days) {
            throw ValidationException::withMessages([
                'day_number' => 'Hari sesi berada di luar rentang tanggal event.',
            ]);
        }

        if ($sessionTypeCode !== 'KEHADIRAN_HARIAN' && $validated['duration_jp'] < 1) {
            throw ValidationException::withMessages([
                'duration_jp' => 'Sesi pembelajaran harus memiliki sedikitnya 1 JP.',
            ]);
        }

        if (in_array($sessionTypeCode, ['UJIAN', 'CBT'], true)
            && empty($validated['cbt_exam_package_id'])
            && empty($session?->cbt_exam_package_id)) {
            throw ValidationException::withMessages([
                'cbt_exam_package_id' => 'Paket ujian CBT wajib dipilih untuk sesi ujian CBT.',
            ]);
        }

        $dailySessionExists = $event->sessions()
            ->when($session, fn ($query) => $query->where('id', '!=', $session->id))
            ->where('day_number', $validated['day_number'])
            ->where('session_type_code', 'KEHADIRAN_HARIAN')
            ->exists();
        if ($sessionTypeCode === 'KEHADIRAN_HARIAN' && $dailySessionExists) {
            throw ValidationException::withMessages([
                'session_type_code' => 'Absensi harian untuk tanggal ini sudah dibuat.',
            ]);
        }
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function sessionAttributes(
        Event $event,
        array $validated,
        string $sessionTypeCode,
        ?EventSession $session,
    ): array {
        $isCbt = in_array($sessionTypeCode, ['UJIAN', 'CBT'], true);
        $isDaily = $sessionTypeCode === 'KEHADIRAN_HARIAN';

        $speakerId = ! empty($validated['speaker_id']) ? (int) $validated['speaker_id'] : null;
        $cbtPackageId = ! empty($validated['cbt_exam_package_id']) ? (int) $validated['cbt_exam_package_id'] : null;
        $learningModuleId = ! empty($validated['learning_module_id']) ? (int) $validated['learning_module_id'] : null;
        $eventModuleId = ! empty($validated['event_module_id']) ? (int) $validated['event_module_id'] : null;
        $materialId = ! empty($validated['material_id']) ? (int) $validated['material_id'] : null;

        $data = [
            'day_number' => $validated['day_number'],
            'session_number' => $validated['session_number'],
            'session_type_code' => $sessionTypeCode,
            'speaker_id' => $speakerId,
            'date' => $validated['session_date'] ?? $validated['date'] ?? $session?->date ?? $event->start_date,
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'duration_jp' => $validated['duration_jp'],
            'topic' => $validated['topic'],
            'subtopic' => $validated['subtopic'] ?? null,
            'method' => $validated['method'] ?? $session?->method ?? 'Pleno',
            'room' => trim((string) ($validated['room'] ?? $session?->room ?? '')) ?: null,
            'track_codes' => $validated['target_tracks'] ?? $validated['track_codes'] ?? $session?->track_codes ?? [],
            'status' => $validated['status'] ?? $session?->status ?? 'scheduled',
            'attendance_setting' => $validated['attendance_setting'] ?? $session?->attendance_setting ?? 'check_in',
            'material_id' => ($isCbt || $isDaily) ? null : (array_key_exists('material_id', $validated) ? $materialId : $session?->material_id),
            'learning_module_id' => ($isCbt || $isDaily) ? null : (array_key_exists('learning_module_id', $validated) ? $learningModuleId : $session?->learning_module_id),
            'event_module_id' => ($isCbt || $isDaily) ? null : (array_key_exists('event_module_id', $validated) ? $eventModuleId : $session?->event_module_id),
            'cbt_exam_package_id' => $isDaily ? null : ($isCbt ? $cbtPackageId : (array_key_exists('cbt_exam_package_id', $validated) ? $cbtPackageId : $session?->cbt_exam_package_id)),
            'requires_attendance_before_cbt' => array_key_exists('requires_attendance_before_cbt', $validated)
                ? (bool) $validated['requires_attendance_before_cbt']
                : (($isCbt || ! empty($cbtPackageId)) ? true : ($session?->requires_attendance_before_cbt ?? false)),
        ];

        if ($isDaily) {
            $data['duration_jp'] = 0;
            $data['date'] = $event->start_date->copy()->addDays($validated['day_number'] - 1);
            $data['attendance_setting'] = 'check_in';
            $data['material_id'] = null;
            $data['learning_module_id'] = null;
            $data['event_module_id'] = null;
            $data['cbt_exam_package_id'] = null;
            $data['requires_attendance_before_cbt'] = false;
        }

        if ($data['attendance_setting'] === 'none'
            && ($data['material_id'] || $data['learning_module_id'] || $data['event_module_id'] || $data['cbt_exam_package_id'])) {
            throw ValidationException::withMessages([
                'attendance_setting' => 'Sesi dengan materi atau ujian wajib menggunakan absensi masuk.',
            ]);
        }

        return $data;
    }
}
