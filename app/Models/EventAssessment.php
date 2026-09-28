<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventAssessment extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'event_participant_id',
        'category',
        'examiner_name',
        'examiner_rank',
        'scores',
        'subtotal_dasar',
        'subtotal_pribadi',
        'total_score',
        'is_passed',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'scores' => 'array',
            'subtotal_dasar' => 'decimal:2',
            'subtotal_pribadi' => 'decimal:2',
            'total_score' => 'decimal:2',
            'is_passed' => 'boolean',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function eventParticipant(): BelongsTo
    {
        return $this->belongsTo(EventParticipant::class);
    }
}
