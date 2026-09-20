<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventAttendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'event_session_id',
        'participant_id',
        'attendance_type',
        'status',
        'checked_in_at',
        'checked_out_at',
        'method',
        'recorded_by',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'checked_in_at' => 'datetime',
            'checked_out_at' => 'datetime',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(EventSession::class, 'event_session_id');
    }

    public function participant(): BelongsTo
    {
        return $this->belongsTo(Participant::class);
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function getStatusBadgeAttribute(): string
    {
        return match ($this->status) {
            'present' => 'bg-emerald-100 text-emerald-800 border-emerald-200',
            'late' => 'bg-amber-100 text-amber-800 border-amber-200',
            'excused' => 'bg-blue-100 text-blue-800 border-blue-200',
            'manual_override' => 'bg-purple-100 text-purple-800 border-purple-200',
            default => 'bg-rose-100 text-rose-800 border-rose-200',
        };
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'present' => 'Hadir Tepat Waktu',
            'late' => 'Hadir Terlambat',
            'excused' => 'Izin / Dispensasi',
            'manual_override' => 'Override Panitia',
            default => 'Tidak Hadir',
        };
    }
}
