<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class EventParticipant extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'participant_id',
        'track_code',
        'rotation_group',
        'admin_status',
        'attendance_status',
        'attendance_records',
        'graduation_status',
        'certificate_number',
        'certificate_file_path',
        'certificate_issued_at',
        'transcript_number',
        'transcript_file_path',
        'transcript_issued_at',
        'secondary_certificate_number',
        'secondary_certificate_file_path',
        'secondary_certificate_issued_at',
        'secondary_transcript_number',
        'secondary_transcript_file_path',
        'secondary_transcript_issued_at',
        'score_theory',
        'score_practice',
        'evaluation_notes',
        'has_seen_welcome',
        'checked_in_at',
        'checkin_method',
        'checkin_status',
        'checkin_notes',
    ];

    protected function casts(): array
    {
        return [
            'attendance_records' => 'array',
            'certificate_issued_at' => 'date',
            'transcript_issued_at' => 'date',
            'secondary_certificate_issued_at' => 'date',
            'secondary_transcript_issued_at' => 'date',
            'score_theory' => 'decimal:2',
            'score_practice' => 'decimal:2',
            'has_seen_welcome' => 'boolean',
            'checked_in_at' => 'datetime',
        ];
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(EventAttendance::class, 'participant_id', 'participant_id');
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function participant(): BelongsTo
    {
        return $this->belongsTo(Participant::class);
    }

    public function track(): BelongsTo
    {
        return $this->belongsTo(ParticipantTrack::class, 'track_code', 'code');
    }

    public function registrationForm(): HasOne
    {
        return $this->hasOne(EventRegistrationForm::class, 'participant_id', 'participant_id')
            ->where('event_id', $this->event_id);
    }

    public function integrityPact(): HasOne
    {
        return $this->hasOne(EventIntegrityPact::class, 'participant_id', 'participant_id')
            ->where('event_id', $this->event_id);
    }

    public function getTheoryScoreAttribute(): ?float
    {
        return $this->score_theory ? (float) $this->score_theory : null;
    }

    public function getPracticeScoreAttribute(): ?float
    {
        return $this->score_practice ? (float) $this->score_practice : null;
    }

    public function getAttendanceByDayAttribute(): array
    {
        return $this->attendance_records ?? [];
    }

    public function getNotesAttribute(): ?string
    {
        return $this->evaluation_notes;
    }

    public function getFinalGradeAttribute(): ?string
    {
        if ($this->score_theory !== null && $this->score_practice !== null) {
            $avg = ($this->score_theory * 0.4) + ($this->score_practice * 0.6);
            if ($avg >= 85) {
                return 'A';
            }
            if ($avg >= 75) {
                return 'B';
            }
            if ($avg >= 60) {
                return 'C';
            }

            return 'D';
        }

        return null;
    }

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->participant?->photo_url;
    }
}
