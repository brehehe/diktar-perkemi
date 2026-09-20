<?php

namespace App\Models;

use Database\Factories\EventRoomFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventRoom extends Model
{
    /** @use HasFactory<EventRoomFactory> */
    use HasFactory;

    protected $fillable = ['event_id', 'name'];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(EventSession::class);
    }
}
