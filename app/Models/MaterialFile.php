<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class MaterialFile extends Model
{
    use HasFactory, SoftDeletes;

    protected static function booted(): void
    {
        static::creating(function (MaterialFile $file) {
            if (empty($file->checksum_sha256)) {
                $file->checksum_sha256 = hash('sha256', $file->path.$file->size_bytes);
            }
        });
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'material_id',
        'kind',
        'disk',
        'path',
        'storage_name',
        'original_name',
        'mime_type',
        'size_bytes',
        'version',
        'extension',
        'checksum_sha256',
        'page_count',
        'sort_order',
        'is_active',
        'uploaded_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'size_bytes' => 'integer',
            'version' => 'integer',
            'page_count' => 'integer',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * The material this file belongs to.
     */
    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }

    /**
     * The user who uploaded this file.
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Human readable file size in KB or MB.
     */
    public function getFormattedSizeAttribute(): string
    {
        $bytes = (int) $this->size_bytes;
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2, ',', '.').' MB';
        }
        if ($bytes >= 1024) {
            return number_format($bytes / 1024, 0, ',', '.').' KB';
        }

        return $bytes.' B';
    }
}
