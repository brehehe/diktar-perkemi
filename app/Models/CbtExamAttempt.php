<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class CbtExamAttempt extends Model
{
    use HasFactory;

    public const TERMINAL_STATUSES = ['submitted', 'timed_out', 'evaluated'];

    protected $fillable = [
        'cbt_exam_package_id',
        'event_id',
        'event_session_id',
        'participant_id',
        'user_id',
        'attempt_number',
        'started_at',
        'submitted_at',
        'status',
        'total_score',
        'is_passed',
        'answers',
        'question_order',
        'option_order',
        'feedback',
        'revision_file_path',
        'revision_status',
        'revision_submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'attempt_number' => 'integer',
            'started_at' => 'datetime',
            'submitted_at' => 'datetime',
            'total_score' => 'decimal:2',
            'revision_submitted_at' => 'datetime',
            'is_passed' => 'boolean',
            'answers' => 'array',
            'question_order' => 'array',
            'option_order' => 'array',
        ];
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(CbtExamPackage::class, 'cbt_exam_package_id');
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function proctoringEvents(): HasMany
    {
        return $this->hasMany(CbtProctoringEvent::class);
    }

    public function expiresAt(CbtExamPackage $package): Carbon
    {
        return $this->started_at->copy()->addMinutes($package->duration_minutes);
    }

    public function remainingSeconds(CbtExamPackage $package): int
    {
        return max(0, $this->expiresAt($package)->getTimestamp() - now()->getTimestamp());
    }

    public function hasExpired(CbtExamPackage $package): bool
    {
        return $this->remainingSeconds($package) === 0;
    }
}
