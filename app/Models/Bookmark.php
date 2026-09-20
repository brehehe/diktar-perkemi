<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Bookmark extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'material_id',
        'page_number',
        'position_data',
        'note',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'page_number' => 'integer',
            'position_data' => 'array',
        ];
    }

    /**
     * A virtual title attribute derived from page number for API convenience.
     */
    public function getTitleAttribute(): string
    {
        return ! empty($this->position_data['title'])
            ? $this->position_data['title']
            : "Halaman {$this->page_number}";
    }

    /**
     * User who owns the bookmark.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Material bookmarked.
     */
    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }
}
