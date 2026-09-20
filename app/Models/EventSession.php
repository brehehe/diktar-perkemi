<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'day_number',
        'date',
        'start_time',
        'end_time',
        'session_number',
        'duration_jp',
        'session_type_code',
        'topic',
        'subtopic',
        'method',
        'speaker_id',
        'event_module_id',
        'room',
        'event_room_id',
        'track_codes',
        'status',
        'attendance_setting',
        'is_attendance_open',
        'attendance_open_at',
        'attendance_close_at',
        'qr_token',
        'qr_short_code',
        'material_id',
        'learning_module_id',
        'cbt_exam_package_id',
        'requires_attendance_before_cbt',
    ];

    protected function casts(): array
    {
        return [
            'day_number' => 'integer',
            'duration_jp' => 'integer',
            'date' => 'date',
            'track_codes' => 'array',
            'is_attendance_open' => 'boolean',
            'attendance_open_at' => 'datetime',
            'attendance_close_at' => 'datetime',
            'requires_attendance_before_cbt' => 'boolean',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function eventRoom(): BelongsTo
    {
        return $this->belongsTo(EventRoom::class);
    }

    public function speaker(): BelongsTo
    {
        return $this->belongsTo(Speaker::class);
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(EventModule::class, 'event_module_id');
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }

    public function learningModule(): BelongsTo
    {
        return $this->belongsTo(LearningModule::class, 'learning_module_id');
    }

    public function cbtPackage(): BelongsTo
    {
        return $this->belongsTo(CbtExamPackage::class, 'cbt_exam_package_id');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(EventAttendance::class);
    }

    public function sessionType(): BelongsTo
    {
        return $this->belongsTo(EventSessionType::class, 'session_type_code', 'code');
    }

    public function getTimeSlotAttribute(): string
    {
        if (! $this->start_time || ! $this->end_time) {
            return 'Waktu belum diatur';
        }

        $start = substr($this->start_time, 0, 5);
        $end = substr($this->end_time, 0, 5);

        return "{$start} - {$end}";
    }

    public function getTargetTracksAttribute(): array
    {
        return $this->track_codes ?? [];
    }

    public function getSessionDateAttribute(): ?\DateTimeInterface
    {
        return $this->date;
    }

    public function getModuleCodeAttribute(): ?string
    {
        return $this->module?->code;
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'completed' => 'Selesai',
            'ongoing' => 'Berlangsung',
            'cancelled' => 'Dibatalkan',
            default => 'Terjadwal',
        };
    }

    public function isAttendanceActive(): bool
    {
        return $this->is_attendance_open
            && (! $this->attendance_close_at || now()->lte($this->attendance_close_at));
    }
}
