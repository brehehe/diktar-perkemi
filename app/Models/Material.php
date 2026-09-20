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
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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
        'source_type',
        'external_url',
        'external_source_name',
        'external_open_mode',
        'video_provider',
        'video_id',
        'video_url',
        'video_allow_portal',
        'access_scope',
        'status',
        'publication_year',
        'language_code',
        'page_count',
        'duration_seconds',
        'is_downloadable',
        'allow_download',
        'is_featured',
        'published_at',
        'reviewed_at',
        'archived_at',
        'created_by',
        'reviewed_by',
        'review_notes',
        'metadata',
        'key_points',
        'learning_objectives',
        'target_roles',
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
            'key_points' => 'array',
            'learning_objectives' => 'array',
            'target_roles' => 'array',
            'is_downloadable' => 'boolean',
            'allow_download' => 'boolean',
            'video_allow_portal' => 'boolean',
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
     * Learning modules that include this digital material.
     */
    public function learningModules(): BelongsToMany
    {
        return $this->belongsToMany(LearningModule::class, 'learning_module_materials')
            ->withPivot('id', 'sort_order', 'is_required', 'instructor_notes', 'estimated_duration_minutes')
            ->withTimestamps();
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
     * Reading progress records for this material.
     */
    public function readingProgress(): HasMany
    {
        return $this->hasMany(ReadingProgress::class);
    }

    /**
     * Bookmarks created for this material.
     */
    public function bookmarks(): HasMany
    {
        return $this->hasMany(Bookmark::class);
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
     * Scope for materials with valid and complete source data.
     */
    public function scopeWithValidSource(Builder $query): Builder
    {
        return $query->where(function (Builder $q) {
            $q->where(function (Builder $pdfQ) {
                $pdfQ->where('source_type', 'uploaded_pdf')
                    ->whereHas('activeFile');
            })->orWhere(function (Builder $linkQ) {
                $linkQ->where('source_type', 'external_link')
                    ->whereNotNull('external_url')
                    ->where('external_url', '!=', '');
            })->orWhere(function (Builder $videoQ) {
                $videoQ->where('source_type', 'video')
                    ->where(function (Builder $vSub) {
                        $vSub->whereNotNull('video_id')->where('video_id', '!=', '')
                            ->orWhere(function (Builder $vuSub) {
                                $vuSub->whereNotNull('video_url')->where('video_url', '!=', '');
                            });
                    });
            });
        });
    }

    /**
     * Check if material has active file attached.
     */
    public function hasActiveFile(): bool
    {
        return $this->activeFile()->exists();
    }

    /**
     * Check if material has valid and complete source.
     */
    public function hasValidSource(): bool
    {
        return match ($this->source_type) {
            'external_link' => ! empty($this->external_url),
            'video' => ! empty($this->video_id) || ! empty($this->video_url),
            default => $this->hasActiveFile(),
        };
    }

    /**
     * Label for source type in Indonesian.
     */
    public function getSourceTypeLabelAttribute(): string
    {
        return match ($this->source_type) {
            'external_link' => 'Buku Digital (Tautan)',
            'video' => 'Video Pembelajaran',
            default => 'E-Book PDF',
        };
    }

    /**
     * CSS badge class for source type.
     */
    public function getSourceBadgeClassAttribute(): string
    {
        return match ($this->source_type) {
            'external_link' => 'bg-[#FFF3E6] text-[#EE9B25] border-[#FFD8A8]',
            'video' => 'bg-[#F3EDFF] text-[#7957D5] border-[#D0BFFF]',
            default => 'bg-[#EAF5FF] text-[#0B63CE] border-[#BCE0FD]',
        };
    }

    /**
     * Normalized safe embed URL for video materials or embeddable links.
     */
    public function getEmbedUrlAttribute(): ?string
    {
        if ($this->source_type === 'video') {
            if ($this->video_provider === 'vimeo' && $this->video_id) {
                return "https://player.vimeo.com/video/{$this->video_id}?dnt=1&app_id=122963";
            }
            if ($this->video_id) {
                return "https://www.youtube-nocookie.com/embed/{$this->video_id}?rel=0&modestbranding=1";
            }
        }

        if ($this->source_type === 'external_link' && $this->external_open_mode === 'embed' && $this->external_url) {
            return static::resolveExternalEmbedUrl($this->external_url, $this);
        }

        return null;
    }

    /**
     * Resolve and optimize third-party digital reader links into embeddable player URLs.
     */
    public static function resolveExternalEmbedUrl(string $url, ?self $material = null): string
    {
        $trimmed = trim($url);

        // Pre-stored embed_url in material metadata
        if ($material && ! empty($material->metadata['embed_url'])) {
            return $material->metadata['embed_url'];
        }

        // 1. Flipsnack player URL
        if (str_contains($trimmed, 'flipsnack.com')) {
            if (str_contains($trimmed, 'player.flipsnack.com')) {
                return $trimmed;
            }

            $cacheKey = 'flipsnack_embed_'.md5($trimmed);

            return Cache::remember($cacheKey, 86400 * 7, function () use ($trimmed) {
                try {
                    $response = Http::timeout(4)->get($trimmed);
                    if ($response->successful() && preg_match('/data-src=[\x22\x27](https:\/\/player\.flipsnack\.com\/[^\x22\x27]+)[\x22\x27]/i', $response->body(), $matches)) {
                        return html_entity_decode($matches[1]);
                    }
                } catch (\Throwable $e) {
                    Log::debug('Flipsnack embed URL could not be resolved; using the original URL.', [
                        'exception' => $e,
                    ]);
                }

                return $trimmed;
            });
        }

        // 2. Google Drive preview
        if (str_contains($trimmed, 'drive.google.com')) {
            if (preg_match('/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/', $trimmed, $m)) {
                return "https://drive.google.com/file/d/{$m[1]}/preview";
            }
            if (preg_match('/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/', $trimmed, $m)) {
                return "https://drive.google.com/file/d/{$m[1]}/preview";
            }
        }

        // 3. Google Docs / Sheets / Slides
        if (str_contains($trimmed, 'docs.google.com')) {
            if (preg_match('/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/', $trimmed, $m)) {
                return "https://docs.google.com/document/d/{$m[1]}/preview";
            }
            if (preg_match('/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/', $trimmed, $m)) {
                return "https://docs.google.com/presentation/d/{$m[1]}/embed";
            }
            if (preg_match('/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/', $trimmed, $m)) {
                return "https://docs.google.com/spreadsheets/d/{$m[1]}/preview";
            }
        }

        // 4. YouTube links pasted as external link
        if (str_contains($trimmed, 'youtube.com') || str_contains($trimmed, 'youtu.be')) {
            if (preg_match('/(?:v=|\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/', $trimmed, $m)) {
                return "https://www.youtube-nocookie.com/embed/{$m[1]}?rel=0&modestbranding=1";
            }
        }

        // 5. Vimeo links pasted as external link
        if (str_contains($trimmed, 'vimeo.com')) {
            if (preg_match('/vimeo\.com\/(\d+)/', $trimmed, $m)) {
                return "https://player.vimeo.com/video/{$m[1]}?dnt=1&app_id=122963";
            }
        }

        return $trimmed;
    }

    /**
     * File status indicator: 'ready', 'missing', 'external'.
     */
    public function getFileStatusAttribute(): string
    {
        if ($this->source_type === 'external_link') {
            return ! empty($this->external_url) ? 'ready' : 'missing';
        }
        if ($this->source_type === 'video') {
            return (! empty($this->video_id) || ! empty($this->video_url)) ? 'ready' : 'missing';
        }

        return $this->hasActiveFile() ? 'ready' : 'missing';
    }

    /**
     * File status label in Indonesian.
     */
    public function getFileStatusLabelAttribute(): string
    {
        if ($this->source_type === 'external_link') {
            return ! empty($this->external_url) ? 'Tautan Siap' : 'Tautan Belum Diisi';
        }
        if ($this->source_type === 'video') {
            return (! empty($this->video_id) || ! empty($this->video_url)) ? 'Video Siap' : 'Video Belum Diisi';
        }

        return $this->hasActiveFile() ? 'File Siap' : 'File Belum Diunggah';
    }
}
