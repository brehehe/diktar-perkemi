<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class LearningModule extends Model
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
        'target_roles',
        'total_jp',
        'level',
        'status',
        'learning_objectives',
        'competency_outcomes',
        'keywords',
        'created_by',
    ];

    protected $casts = [
        'event_id' => 'integer',
        'track_codes' => 'array',
        'target_roles' => 'array',
        'learning_objectives' => 'array',
        'competency_outcomes' => 'array',
        'total_jp' => 'integer',
    ];

    /**
     * Event that owns this module (null if master module created by Diktar/Admin).
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Scope modules available for a specific event (global master modules + event-specific modules).
     */
    public function scopeAvailableForEvent($query, ?int $eventId = null)
    {
        return $query->where(function ($sub) use ($eventId) {
            $sub->whereNull('event_id');
            if ($eventId) {
                $sub->orWhere('event_id', $eventId);
            }
        });
    }

    /**
     * Determine if this is a master module created by Diktar/Admin.
     */
    public function isMaster(): bool
    {
        return $this->event_id === null;
    }

    /**
     * Digital materials linked to this module.
     */
    public function materials(): BelongsToMany
    {
        return $this->belongsToMany(Material::class, 'learning_module_materials')
            ->withPivot('id', 'sort_order', 'is_required', 'instructor_notes', 'estimated_duration_minutes')
            ->withTimestamps()
            ->orderByPivot('sort_order', 'asc');
    }

    /**
     * Question modules / evaluation blueprints linked to this learning module.
     */
    public function questionModules(): HasMany
    {
        return $this->hasMany(QuestionModule::class);
    }

    /**
     * Question bank items referencing this module.
     */
    public function bankQuestions(): HasMany
    {
        return $this->hasMany(QuestionBank::class);
    }

    /**
     * Events using this module.
     */
    public function events(): BelongsToMany
    {
        return $this->belongsToMany(Event::class, 'event_learning_modules')
            ->withPivot('id', 'participant_path_id', 'is_required', 'sort_order', 'availability_start_at', 'availability_end_at')
            ->withTimestamps();
    }

    /**
     * Rundown sessions referencing this module.
     */
    public function sessions(): HasMany
    {
        return $this->hasMany(EventSession::class);
    }

    /**
     * Creator of the module.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Status label in Indonesian.
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
