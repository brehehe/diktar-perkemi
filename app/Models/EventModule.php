<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventModule extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'code',
        'title',
        'description',
        'jp',
        'track_codes',
        'speaker_id',
        'material_id',
        'fulfillment_method',
        'is_published',
        'learning_indicators',
        'publication_status',
        'source_type',
        'source_url',
        'source_file_path',
    ];

    protected function casts(): array
    {
        return [
            'jp' => 'integer',
            'track_codes' => 'array',
            'is_published' => 'boolean',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function speaker(): BelongsTo
    {
        return $this->belongsTo(Speaker::class);
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(EventSession::class);
    }
}
