<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ParticipantTrack extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'event_id',
        'name',
        'description',
        'color',
        'sort_order',
        'is_active',
        'badge_color',
        'is_dual_track',
    ];

    protected $appends = [
        'badge_color',
        'is_dual_track',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function eventParticipants(): HasMany
    {
        return $this->hasMany(EventParticipant::class, 'track_code', 'code');
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function getBadgeColorAttribute(): string
    {
        return $this->color ?? 'bg-blue-100 text-blue-800';
    }

    public function setBadgeColorAttribute(?string $value): void
    {
        $this->attributes['color'] = $value;
    }

    public function getIsDualTrackAttribute(): bool
    {
        return in_array($this->code, ['PWAD', 'PWAN']);
    }

    public function setIsDualTrackAttribute($value): void
    {
        // virtual attribute
    }
}
