<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Participant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'event_id',
        'user_id',
        'name',
        'kenshi_id_number',
        'kenshi_id',
        'email',
        'phone',
        'origin_province',
        'origin_city',
        'origin',
        'origin_dojo',
        'dojo',
        'dan_rank',
        'dan_level',
        'notes',
        'admin_notes',
    ];

    protected $appends = [
        'kenshi_id',
        'origin',
        'dojo',
        'admin_notes',
        'dan_level',
        'dan_roman',
    ];

    /**
     * Event this participant belongs to (nullable for national/master diktar).
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function eventParticipants(): HasMany
    {
        return $this->hasMany(EventParticipant::class);
    }

    public function latestEventParticipant(): HasOne
    {
        return $this->hasOne(EventParticipant::class)->latestOfMany();
    }

    public function events(): BelongsToMany
    {
        return $this->belongsToMany(Event::class, 'event_participants')
            ->withPivot([
                'id',
                'track_code',
                'rotation_group',
                'admin_status',
                'attendance_status',
                'attendance_records',
                'graduation_status',
                'certificate_number',
                'certificate_issued_at',
                'transcript_number',
                'transcript_issued_at',
                'score_theory',
                'score_practice',
                'evaluation_notes',
                'has_seen_welcome',
            ])
            ->withTimestamps();
    }

    public function getKenshiIdAttribute(): ?string
    {
        return $this->kenshi_id_number;
    }

    public function setKenshiIdAttribute(?string $value): void
    {
        $this->kenshi_id_number = $value;
    }

    public function setKenshiIdNumberAttribute(?string $value): void
    {
        $normalizedValue = trim((string) $value);

        $this->attributes['kenshi_id_number'] = $normalizedValue === ''
            ? null
            : Str::upper($normalizedValue);
    }

    public function getOriginAttribute(): string
    {
        if ($this->origin_province && $this->origin_city) {
            return "{$this->origin_province} / {$this->origin_city}";
        }

        return $this->origin_province ?? $this->origin_city ?? '-';
    }

    public function setOriginAttribute(?string $value): void
    {
        if ($value && str_contains($value, '/')) {
            $parts = explode('/', $value, 2);
            $this->attributes['origin_province'] = trim($parts[0]);
            $this->attributes['origin_city'] = trim($parts[1]);
        } else {
            $this->attributes['origin_province'] = $value;
        }
    }

    public function getDojoAttribute(): ?string
    {
        return $this->origin_dojo;
    }

    public function setDojoAttribute(?string $value): void
    {
        $this->attributes['origin_dojo'] = $value;
    }

    public function getAdminNotesAttribute(): ?string
    {
        return $this->notes;
    }

    public function setAdminNotesAttribute(?string $value): void
    {
        $this->attributes['notes'] = $value;
    }

    public function getDanLevelAttribute(): ?int
    {
        if (! $this->dan_rank) {
            return null;
        }
        if (is_numeric($this->dan_rank)) {
            return (int) $this->dan_rank;
        }
        $map = ['I' => 1, 'II' => 2, 'III' => 3, 'IV' => 4, 'V' => 5, 'VI' => 6, 'VII' => 7, 'VIII' => 8];
        $clean = explode('-', $this->dan_rank)[0];

        return $map[$clean] ?? (int) filter_var($this->dan_rank, FILTER_SANITIZE_NUMBER_INT) ?: null;
    }

    public function setDanLevelAttribute($value): void
    {
        if (empty($value)) {
            $this->attributes['dan_rank'] = null;

            return;
        }
        $map = [1 => 'I-DAN', 2 => 'II-DAN', 3 => 'III-DAN', 4 => 'IV-DAN', 5 => 'V-DAN', 6 => 'VI-DAN', 7 => 'VII-DAN', 8 => 'VIII-DAN'];
        $this->attributes['dan_rank'] = is_numeric($value) ? ($map[(int) $value] ?? "{$value}-DAN") : $value;
    }

    public function getDanRomanAttribute(): ?string
    {
        if (! $this->dan_rank) {
            return null;
        }

        return str_replace('-DAN', '', $this->dan_rank);
    }
}
