<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'actor_id',
        'event',
        'subject_type',
        'subject_id',
        'properties',
        'ip_address',
        'user_agent',
        'created_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'properties' => 'array',
            'created_at' => 'datetime',
        ];
    }

    /**
     * The actor (user) who triggered this activity.
     */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    /**
     * Subject polymorphic relation.
     */
    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Record a new activity log entry.
     *
     * @param  array<string, mixed>  $properties
     */
    public static function record(string $event, ?Model $subject = null, array $properties = []): self
    {
        return self::create([
            'actor_id' => auth()->id(),
            'event' => $event,
            'subject_type' => $subject ? get_class($subject) : null,
            'subject_id' => $subject?->getKey(),
            'properties' => $properties,
            'ip_address' => request()->ip(),
            'user_agent' => substr((string) request()->userAgent(), 0, 500),
            'created_at' => now(),
        ]);
    }

    /**
     * Human readable event description in Indonesian.
     */
    public function getEventLabelAttribute(): string
    {
        return match ($this->event) {
            'material.created' => 'Materi Baru Dibuat',
            'material.updated' => 'Materi Diperbarui',
            'material.published' => 'Materi Diterbitkan',
            'material.archived' => 'Materi Diarsipkan',
            'material.deleted' => 'Materi Dihapus',
            'material.viewed' => 'Materi Dibaca',
            'category.created' => 'Kategori Baru Dibuat',
            'category.updated' => 'Kategori Diperbarui',
            'user.role_updated' => 'Peran Pengguna Diubah',
            'user.status_toggled' => 'Status Pengguna Diubah',
            'settings.updated' => 'Pengaturan Portal Diperbarui',
            'permissions.updated' => 'Matriks Hak Akses Diperbarui',
            'event.participant_results.reset' => 'Hasil Peserta Event Direset',
            'event.participant_results.reset_all' => 'Seluruh Hasil Peserta Event Direset',
            default => str_replace(['.', '_'], ' ', ucfirst($this->event)),
        };
    }
}
