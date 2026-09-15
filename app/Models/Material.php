<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Material extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'slug',
        'code',
        'isbn',
        'author',
        'keywords',
        'admin_notes',
        'summary',
        'description',
        'cover_path',
        'type',
        'status',
        'publication_year',
        'language_code',
        'page_count',
        'duration_seconds',
        'is_downloadable',
        'is_featured',
        'published_at',
        'reviewed_at',
        'archived_at',
        'created_by',
        'reviewed_by',
        'review_notes',
        'metadata',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'is_downloadable' => 'boolean',
            'is_featured' => 'boolean',
            'published_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'archived_at' => 'datetime',
        ];
    }

    /**
     * Categories associated with this material.
     */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'category_material')->withPivot('is_primary');
    }

    /**
     * The user who created this material.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * The user who reviewed this material.
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Files/attachments attached to this material.
     */
    public function files(): HasMany
    {
        return $this->hasMany(MaterialFile::class)->orderByDesc('version');
    }

    /**
     * The active primary digital book file for this material.
     */
    public function activeFile(): HasOne
    {
        return $this->hasOne(MaterialFile::class)->where('is_active', true)->latestOfMany();
    }

    /**
     * Audiences (roles) targeted by this material.
     */
    public function audiences(): BelongsToMany
    {
        return $this->belongsToMany(Audience::class, 'audience_material');
    }

    /**
     * Scope for published materials.
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope for materials pending review.
     */
    public function scopeInReview(Builder $query): Builder
    {
        return $query->where('status', 'review');
    }

    /**
     * Scope for draft materials.
     */
    public function scopeDraft(Builder $query): Builder
    {
        return $query->where('status', 'draft');
    }

    /**
     * Scope for archived materials.
     */
    public function scopeArchived(Builder $query): Builder
    {
        return $query->where('status', 'archived');
    }

    /**
     * Helper for human readable status in Indonesian.
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'published' => 'Terbit',
            'review' => 'Dalam Tinjauan',
            'archived' => 'Diarsipkan',
            default => 'Draf',
        };
    }

    /**
     * Helper for badge style class.
     */
    public function getStatusBadgeClassAttribute(): string
    {
        return match ($this->status) {
            'published' => 'pp-badge-published',
            'review' => 'pp-badge-review',
            'archived' => 'pp-badge-archived',
            default => 'pp-badge-draft',
        };
    }

    /**
     * Helper for type label in Indonesian.
     */
    public function getTypeLabelAttribute(): string
    {
        return match ($this->type) {
            'module' => 'Modul Penataran',
            'book' => 'Buku Referensi',
            'speaker_material' => 'Bahan Ajar',
            'guideline' => 'Pedoman Teknis',
            'video' => 'Video Pembelajaran',
            'document' => 'Dokumen / Rubrik',
            default => ucfirst(str_replace('_', ' ', $this->type ?? 'Materi')),
        };
    }

    /**
     * Check if material has active file attached.
     */
    public function hasActiveFile(): bool
    {
        return $this->activeFile()->exists();
    }

    /**
     * File status indicator: 'ready', 'missing'.
     */
    public function getFileStatusAttribute(): string
    {
        return $this->hasActiveFile() ? 'ready' : 'missing';
    }

    /**
     * File status label in Indonesian.
     */
    public function getFileStatusLabelAttribute(): string
    {
        return $this->hasActiveFile() ? 'File Siap' : 'File Belum Diunggah';
    }
}
