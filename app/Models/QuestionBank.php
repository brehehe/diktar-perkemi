<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class QuestionBank extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'question_bank';

    protected $fillable = [
        'event_id',
        'code',
        'question_module_id',
        'question_text',
        'question_type',
        'options',
        'correct_answer',
        'points',
        'difficulty_level',
        'exam_stage',
        'explanation',
        'metadata',
        'material_id',
        'learning_module_id',
        'status',
        'created_by',
    ];

    protected $casts = [
        'options' => 'array',
        'correct_answer' => 'array',
        'metadata' => 'array',
        'points' => 'decimal:2',
    ];

    /**
     * Indonesian label for exam stage.
     */
    public function getExamStageLabelAttribute(): ?string
    {
        return match ($this->exam_stage) {
            'pre_test' => 'Pre-Test',
            'quiz' => 'Kuis',
            'post_test' => 'Post-Test',
            default => $this->exam_stage ? ucfirst($this->exam_stage) : null,
        };
    }

    /**
     * Event this question belongs to (nullable for national/master diktar).
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * The blueprint question module this question belongs to.
     */
    public function questionModule(): BelongsTo
    {
        return $this->belongsTo(QuestionModule::class);
    }

    public function questionModules(): BelongsToMany
    {
        return $this->belongsToMany(QuestionModule::class, 'question_module_questions', 'question_id', 'question_module_id')
            ->withTimestamps();
    }

    /**
     * Linked learning module curriculum (optional).
     */
    public function learningModule(): BelongsTo
    {
        return $this->belongsTo(LearningModule::class);
    }

    /**
     * Linked digital material collection reference (optional).
     */
    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }

    /**
     * CBT packages that include this question.
     */
    public function cbtPackages(): BelongsToMany
    {
        return $this->belongsToMany(CbtExamPackage::class, 'cbt_package_questions', 'question_id', 'cbt_exam_package_id')
            ->withPivot('sort_order', 'points')
            ->withTimestamps();
    }

    /**
     * Creator user.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Indonesian label for question type.
     */
    public function getQuestionTypeLabelAttribute(): string
    {
        return match ($this->question_type) {
            'single_choice' => 'Pilihan Ganda',
            'true_false' => 'Benar / Salah',
            'multiple_choice' => 'Pilihan Majemuk',
            'essay' => 'Esai (Uraian)',
            default => ucfirst($this->question_type),
        };
    }

    /**
     * Indonesian label for difficulty level.
     */
    public function getDifficultyLabelAttribute(): string
    {
        return match ($this->difficulty_level) {
            'basic', 'easy' => 'Dasar',
            'intermediate', 'medium' => 'Menengah',
            'advanced', 'hard' => 'Lanjutan',
            default => ucfirst($this->difficulty_level),
        };
    }

    /**
     * Indonesian label for status.
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
}
