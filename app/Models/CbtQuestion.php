<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CbtQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'cbt_exam_package_id',
        'question_text',
        'question_type',
        'options',
        'correct_answer',
        'points',
        'explanation',
        'category',
        'material_id',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'correct_answer' => 'array',
            'points' => 'decimal:2',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(CbtExamPackage::class, 'cbt_exam_package_id');
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }

    public function getQuestionTypeLabelAttribute(): string
    {
        return match ($this->question_type) {
            'multiple_choice' => 'Pilihan Ganda Kompleks',
            'boolean' => 'Benar / Salah',
            'essay' => 'Esai / Uraian',
            default => 'Pilihan Ganda Tunggal',
        };
    }
}
