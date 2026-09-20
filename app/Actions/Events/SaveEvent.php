<?php

namespace App\Actions\Events;

use App\Models\Event;
use App\Models\User;
use App\Services\EventAttendanceScheduleService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SaveEvent
{
    public function __construct(
        private readonly EventAttendanceScheduleService $attendanceSchedule,
    ) {}

    /**
     * @param  array<string, mixed>  $validated
     */
    public function handle(array $validated, User $actor, ?Event $event = null): Event
    {
        return DB::transaction(function () use ($validated, $actor, $event): Event {
            $isCreating = $event === null;
            $event ??= new Event;

            $event->fill($this->eventAttributes($validated, $actor, $isCreating))->save();
            $this->attendanceSchedule->ensureDefaultSessions($event);

            return $event->refresh();
        });
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function eventAttributes(array $validated, User $actor, bool $isCreating): array
    {
        $calendarDays = Carbon::parse($validated['start_date'])
            ->diffInDays(Carbon::parse($validated['end_date'])) + 1;

        $attributes = [
            ...$validated,
            'title' => $validated['name'],
            'location' => $validated['place'],
            'duration_text' => $validated['duration_days'] ?? "{$calendarDays} hari",
            'quota' => $validated['participant_quota'],
            'banner_path' => $validated['cover_image'] ?? $validated['banner_image'] ?? null,
        ];

        unset(
            $attributes['name'],
            $attributes['place'],
            $attributes['duration_days'],
            $attributes['participant_quota'],
            $attributes['cover_image'],
            $attributes['banner_image'],
        );
        if (($attributes['learning_method'] ?? null) === null) {
            unset($attributes['learning_method']);
        }

        if ($actor->role === 'Penyelenggara') {
            if ($isCreating) {
                $attributes['responsible_user_id'] = $actor->id;
            } else {
                unset($attributes['responsible_user_id']);
            }
        }

        if ($isCreating) {
            $attributes['slug'] = Str::slug($validated['name']).'-'.Carbon::parse($validated['start_date'])->year;
        }

        return $attributes;
    }
}
