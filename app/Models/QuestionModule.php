<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class QuestionModule extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'event_id',
        'code',
        'title',
        'slug',
        'description',
        'category',
        'track_codes',
        'tested_competencies',
        'assessment_indicators',
        'evaluation_purpose',
        'default_weight',
        'passing_grade',
        'status',
        'learning_module_id',
        'created_by',
        'metadata',
    ];

    protected $casts = [
        'track_codes' => 'array',
        'tested_competencies' => 'array',
        'assessment_indicators' => 'array',
        'metadata' => 'array',
        'default_weight' => 'decimal:2',
        'passing_grade' => 'decimal:2',
    ];

    /**
     * Event this question module belongs to (nullable for national/master diktar).
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Scope modules available for a specific event (or master national).
     */
    public function scopeAvailableForEvent($query, ?int $eventId = null)
    {
        if ($eventId) {
            return $query->where(function ($q) use ($eventId) {
                $q->whereNull('event_id')->orWhere('event_id', $eventId);
            });
        }

        return $query->whereNull('event_id');
    }

    /**
     * Learning module linked as curriculum counterpart.
     */
    public function learningModule(): BelongsTo
    {
        return $this->belongsTo(LearningModule::class);
    }

    /**
     * Questions in bank belonging to this question module.
     */
    public function questions(): BelongsToMany
    {
        return $this->belongsToMany(QuestionBank::class, 'question_module_questions', 'question_module_id', 'question_id')
            ->withTimestamps();
    }

    /**
     * CBT packages that utilize this question module.
     */
    public function cbtPackages(): HasMany
    {
        return $this->hasMany(CbtExamPackage::class);
    }

    /**
     * Creator user.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Indonesian status label.
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'active' => 'Aktif',
            'draft' => 'Draft',
            'inactive' => 'Nonaktif',
            'archived' => 'Diarsipkan',
            default => ucfirst($this->status),
        };
    }

    /**
     * Badge CSS class for status.
     */
    public function getStatusBadgeAttribute(): string
    {
        return match ($this->status) {
            'active' => 'bg-emerald-50 text-emerald-700 border-emerald-200',
            'draft' => 'bg-amber-50 text-amber-700 border-amber-200',
            'inactive' => 'bg-slate-100 text-slate-600 border-slate-200',
            'archived' => 'bg-rose-50 text-rose-700 border-rose-200',
            default => 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
}
