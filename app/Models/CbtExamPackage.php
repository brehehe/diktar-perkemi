<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CbtExamPackage extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'event_id',
        'title',
        'code',
        'description',
        'exam_type',
        'question_module_id',
        'question_module_ids',
        'question_module_quotas',
        'target_tracks',
        'total_questions',
        'duration_minutes',
        'passing_score',
        'attempts_allowed',
        'revision_method',
        'revision_deadline',
        'start_time',
        'end_time',
        'instructions',
        'status',
        'randomize_questions',
        'randomize_answers',
        'result_display',
    ];

    protected function casts(): array
    {
        return [
            'duration_minutes' => 'integer',
            'passing_score' => 'decimal:2',
            'attempts_allowed' => 'integer',
            'revision_deadline' => 'datetime',
            'total_questions' => 'integer',
            'target_tracks' => 'array',
            'question_module_ids' => 'array',
            'question_module_quotas' => 'array',
            'start_time' => 'datetime',
            'end_time' => 'datetime',
            'randomize_questions' => 'boolean',
            'randomize_answers' => 'boolean',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function questionModule(): BelongsTo
    {
        return $this->belongsTo(QuestionModule::class);
    }

    public function getBlueprintModulesAttribute(): Collection
    {
        $ids = (array) ($this->question_module_ids ?? []);
        if ($this->question_module_id && ! in_array($this->question_module_id, $ids, false)) {
            $ids[] = $this->question_module_id;
        }

        if (empty($ids)) {
            return new Collection;
        }

        $quotas = (array) ($this->question_module_quotas ?? []);

        $modules = QuestionModule::whereIn('id', $ids)
            ->withCount(['questions' => fn ($q) => $q->where('status', 'active')])
            ->get(['id', 'title', 'code', 'category', 'passing_grade']);

        $attachedQuestions = $this->relationLoaded('bankQuestions')
            ? $this->bankQuestions
            : $this->bankQuestions()->get(['question_bank.id']);

        $attachedIds = $attachedQuestions->pluck('id')->all();

        return $modules->map(function ($mod) use ($quotas, $attachedIds) {
            $rawQuota = $quotas[$mod->id] ?? $quotas[(string) $mod->id] ?? null;
            $quotaCount = is_array($rawQuota) ? ($rawQuota['count'] ?? null) : $rawQuota;
            $quotaMode = is_array($rawQuota) ? ($rawQuota['mode'] ?? ($quotaCount ? 'custom' : 'all')) : ($quotaCount ? 'custom' : 'all');

            $selectedCount = empty($attachedIds)
                ? 0
                : $mod->questions()->whereIn('question_bank.id', $attachedIds)->count();

            $mod->active_questions_count = (int) $mod->questions_count;
            $mod->quota_mode = $quotaMode;
            $mod->quota_count = $quotaCount !== null && $quotaCount !== '' ? (int) $quotaCount : null;
            $mod->selected_count = $selectedCount;

            return $mod;
        });
    }

    public function bankQuestions(): BelongsToMany
    {
        return $this->belongsToMany(QuestionBank::class, 'cbt_package_questions', 'cbt_exam_package_id', 'question_id')
            ->withPivot('sort_order', 'points')
            ->withTimestamps()
            ->orderByPivot('sort_order', 'asc');
    }

    public function events(): BelongsToMany
    {
        return $this->belongsToMany(Event::class, 'event_cbt_packages')
            ->withPivot('participant_path_id', 'is_required', 'sort_order', 'availability_start_at', 'availability_end_at', 'requires_attendance_session_id')
            ->withTimestamps();
    }

    public function questions(): HasMany
    {
        return $this->hasMany(CbtQuestion::class)->orderBy('sort_order');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(CbtExamAttempt::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(EventSession::class);
    }

    public function getExamTypeLabelAttribute(): string
    {
        return match ($this->exam_type) {
            'pre_test' => 'Pre-Test',
            'post_test' => 'Post-Test',
            'module_eval' => 'Evaluasi Modul',
            'remedial' => 'Remedial',
            default => 'Ujian Teori',
        };
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'ready' => 'Siap Digunakan',
            'open' => 'Dibuka',
            'closed' => 'Ditutup',
            'archived' => 'Diarsipkan',
            default => 'Draft',
        };
    }

    public function getStatusBadgeAttribute(): string
    {
        return match ($this->status) {
            'open' => 'bg-emerald-100 text-emerald-800 border-emerald-200',
            'ready' => 'bg-blue-100 text-blue-800 border-blue-200',
            'closed' => 'bg-slate-100 text-slate-700 border-slate-200',
            'archived' => 'bg-rose-100 text-rose-800 border-rose-200',
            default => 'bg-amber-100 text-amber-800 border-amber-200',
        };
    }
}
