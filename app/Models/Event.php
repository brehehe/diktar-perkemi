<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Event extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'name',
        'slug',
        'description',
        'start_date',
        'end_date',
        'location',
        'place',
        'organizer',
        'duration_text',
        'duration_days',
        'total_effective_jp',
        'total_schedule_jp',
        'jp_duration_minutes',
        'learning_method',
        'quota',
        'participant_quota',
        'status',
        'banner_path',
        'cover_image',
        'banner_image',
        'rundown_doc_path',
        'access_roles',
        'facilities_checklist',
        'requirements_checklist',
        'responsible_user_id',
        'document_number_settings',
    ];

    protected $appends = [
        'name',
        'place',
        'duration_days',
        'participant_quota',
        'cover_image',
        'banner_image',
        'rundown_document',
        'date_formatted',
        'status_label',
        'status_color',
        'total_days',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'total_effective_jp' => 'integer',
            'total_schedule_jp' => 'integer',
            'jp_duration_minutes' => 'integer',
            'quota' => 'integer',
            'access_roles' => 'array',
            'facilities_checklist' => 'array',
            'requirements_checklist' => 'array',
            'document_number_settings' => 'array',
        ];
    }

    public function modules(): HasMany
    {
        return $this->hasMany(EventModule::class);
    }

    public function responsibleUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsible_user_id');
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(EventSession::class)->orderBy('day_number')->orderBy('start_time');
    }

    public function rooms(): HasMany
    {
        return $this->hasMany(EventRoom::class)->orderBy('name');
    }

    public function legends(): HasMany
    {
        return $this->hasMany(EventLegend::class);
    }

    public function ownedSpeakers(): HasMany
    {
        return $this->hasMany(Speaker::class);
    }

    public function eventParticipants(): HasMany
    {
        return $this->hasMany(EventParticipant::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(EventAttendance::class);
    }

    public function cbtPackages(): HasMany
    {
        return $this->hasMany(CbtExamPackage::class);
    }

    public function learningModules(): BelongsToMany
    {
        return $this->belongsToMany(LearningModule::class, 'event_learning_modules')
            ->withPivot(['id', 'participant_path_id', 'is_required', 'sort_order', 'availability_start_at', 'availability_end_at'])
            ->withTimestamps()
            ->orderByPivot('sort_order', 'asc');
    }

    public function linkedCbtPackages(): BelongsToMany
    {
        return $this->belongsToMany(CbtExamPackage::class, 'event_cbt_packages')
            ->withPivot(['id', 'participant_path_id', 'is_required', 'sort_order', 'availability_start_at', 'availability_end_at', 'requires_attendance_session_id'])
            ->withTimestamps()
            ->orderByPivot('sort_order', 'asc');
    }

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(Participant::class, 'event_participants')
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

    public function getNameAttribute(): ?string
    {
        return $this->title;
    }

    public function setNameAttribute(?string $value): void
    {
        $this->attributes['title'] = $value;
    }

    public function getPlaceAttribute(): ?string
    {
        return $this->location;
    }

    public function setPlaceAttribute(?string $value): void
    {
        $this->attributes['location'] = $value;
    }

    public function getDurationDaysAttribute(): ?string
    {
        return $this->duration_text ?? ($this->start_date && $this->end_date ? $this->total_days.' hari' : null);
    }

    public function setDurationDaysAttribute(?string $value): void
    {
        $this->attributes['duration_text'] = $value;
    }

    public function getParticipantQuotaAttribute(): ?int
    {
        return $this->quota;
    }

    public function setParticipantQuotaAttribute(?int $value): void
    {
        $this->attributes['quota'] = $value ?? 100;
    }

    public function getCoverImageAttribute(): ?string
    {
        return $this->banner_path;
    }

    public function setCoverImageAttribute(?string $value): void
    {
        $this->attributes['banner_path'] = $value;
    }

    public function getBannerImageAttribute(): ?string
    {
        return $this->banner_path;
    }

    public function setBannerImageAttribute(?string $value): void
    {
        $this->attributes['banner_path'] = $value;
    }

    public function getRundownDocumentAttribute(): ?string
    {
        return $this->rundown_doc_path;
    }

    public function setRundownDocumentAttribute(?string $value): void
    {
        $this->attributes['rundown_doc_path'] = $value;
    }

    public function getDateFormattedAttribute(): string
    {
        if ($this->start_date && $this->end_date) {
            return $this->start_date->format('d').'–'.$this->end_date->format('d M Y');
        }

        return '-';
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'open_registration', 'registration_open' => 'Pendaftaran Dibuka',
            'ongoing' => 'Sedang Berlangsung',
            'completed' => 'Selesai',
            'archived' => 'Diarsipkan',
            default => 'Draft',
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'open_registration', 'registration_open' => 'bg-emerald-100 text-emerald-800',
            'ongoing' => 'bg-blue-100 text-blue-800',
            'completed' => 'bg-slate-100 text-slate-700',
            'archived' => 'bg-rose-100 text-rose-800',
            default => 'bg-amber-100 text-amber-800',
        };
    }

    public function getTotalDaysAttribute(): int
    {
        if ($this->start_date && $this->end_date) {
            $days = (int) $this->start_date->diffInDays($this->end_date) + 1;
            if ($days > 0) {
                return $days;
            }
        }

        if (! empty($this->duration_text) && preg_match('/(\d+)/', $this->duration_text, $matches)) {
            return (int) $matches[1];
        }

        return 1;
    }
}
