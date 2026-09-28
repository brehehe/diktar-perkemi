<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventActivityRecord extends Model
{
    protected $fillable = ['event_id', 'created_by', 'event_session_id', 'kind', 'title', 'activity_type', 'occurred_on', 'notes', 'file_path', 'file_mime'];

    protected function casts(): array
    {
        return ['occurred_on' => 'date'];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(EventSession::class, 'event_session_id');
    }
}
