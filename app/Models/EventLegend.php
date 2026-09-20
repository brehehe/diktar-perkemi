<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventLegend extends Model
{
    use HasFactory;

    protected $fillable = [
        'acronym',
        'full_name',
        'category',
        'description',
        'code',
        'term',
        'badge_color',
        'event_id',
    ];

    protected $appends = [
        'code',
        'term',
        'badge_color',
    ];

    public function getCodeAttribute(): ?string
    {
        return $this->acronym;
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function setCodeAttribute(?string $value): void
    {
        $this->attributes['acronym'] = $value;
    }

    public function getTermAttribute(): ?string
    {
        return $this->full_name;
    }

    public function setTermAttribute(?string $value): void
    {
        $this->attributes['full_name'] = $value;
    }

    public function getBadgeColorAttribute(): string
    {
        return $this->attributes['badge_color'] ?? 'bg-slate-100 text-slate-700';
    }

    public function setBadgeColorAttribute(?string $value): void
    {
        // virtual accessor
    }
}
