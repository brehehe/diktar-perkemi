<?php

namespace App\Models;

use Database\Factories\EventMandateFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventMandate extends Model
{
    /** @use HasFactory<EventMandateFactory> */
    use HasFactory;

    protected $fillable = [
        'event_id',
        'letter_number',
        'title',
        'event_name',
        'source_references',
        'issued_place',
        'issued_at',
        'valid_from',
        'valid_until',
        'venue',
        'address',
        'province',
        'exam_scope',
        'participant_total',
        'examiners',
        'provisions',
        'participant_summary',
        'home_assignments',
        'signatory_name',
        'signatory_title',
        'document_disk',
        'document_path',
        'document_original_name',
        'document_mime',
        'document_size',
        'uploaded_by',
    ];

    protected function casts(): array
    {
        return [
            'source_references' => 'array',
            'issued_at' => 'date',
            'valid_from' => 'date',
            'valid_until' => 'date',
            'participant_total' => 'integer',
            'examiners' => 'array',
            'provisions' => 'array',
            'participant_summary' => 'array',
            'home_assignments' => 'array',
            'document_size' => 'integer',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
