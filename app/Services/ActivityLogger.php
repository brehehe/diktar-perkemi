<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class ActivityLogger
{
    protected ?string $logName = null;

    protected ?Model $causedBy = null;

    protected ?Model $performedOn = null;

    protected array $properties = [];

    /**
     * Set the log name / event category.
     */
    public function useLog(?string $logName): self
    {
        $this->logName = $logName;

        return $this;
    }

    /**
     * Set the causer / actor model.
     */
    public function causedBy(?Model $user): self
    {
        $this->causedBy = $user;

        return $this;
    }

    /**
     * Set the subject model.
     */
    public function performedOn(?Model $subject): self
    {
        $this->performedOn = $subject;

        return $this;
    }

    /**
     * Attach custom snapshot properties.
     *
     * @param  array<string, mixed>  $properties
     */
    public function withProperties(array $properties): self
    {
        $this->properties = array_merge($this->properties, $properties);

        return $this;
    }

    /**
     * Save the activity log entry.
     */
    public function log(string $description): ActivityLog
    {
        $event = $this->logName ?: 'activity.custom';
        $properties = $this->properties;
        if (! isset($properties['description'])) {
            $properties['description'] = $description;
        }

        $actorId = $this->causedBy ? $this->causedBy->getKey() : Auth::id();

        return ActivityLog::create([
            'actor_id' => $actorId,
            'event' => $event,
            'subject_type' => $this->performedOn ? get_class($this->performedOn) : null,
            'subject_id' => $this->performedOn?->getKey(),
            'properties' => $properties,
            'ip_address' => request()->ip(),
            'user_agent' => substr((string) request()->userAgent(), 0, 500),
            'created_at' => now(),
        ]);
    }
}
