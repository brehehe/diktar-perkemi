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
     * Human readable description of the activity.
     */
    public function getDescriptionAttribute(): string
    {
        if (! empty($this->properties['description'])) {
            return (string) $this->properties['description'];
        }

        $actorName = $this->actor?->name ?? 'Sistem';
        $eventLabel = $this->event_label;

        return "{$eventLabel} oleh {$actorName}";
    }

    /**
     * Human readable event label in Indonesian.
     */
    public function getEventLabelAttribute(): string
    {
        return match ($this->event) {
            'auth.login' => 'Pengguna Masuk (Login)',
            'auth.logout' => 'Pengguna Keluar (Logout)',
            'menu.event_accessed' => 'Akses Menu Event',
            'event.viewed' => 'Akses Rincian Event',
            'menu.materials_accessed' => 'Akses Menu Koleksi Digital',
            'menu.users_accessed' => 'Akses Menu Pengguna',
            'menu.permissions_accessed' => 'Akses Menu Hak Akses',
            'menu.settings_accessed' => 'Akses Menu Pengaturan',
            'menu.event_references_accessed' => 'Akses Menu Referensi Event',
            'menu.speakers_accessed' => 'Akses Menu Pemateri',
            'menu.speaker_schedule_accessed' => 'Akses Jadwal Mengajar Pemateri',
            'menu.participant_event_accessed' => 'Akses Menu Event Peserta',
            'user.created' => 'Pengguna Baru Dibuat',
            'user.role_updated' => 'Peran Pengguna Diubah',
            'user.password_updated' => 'Kata Sandi Pengguna Diubah',
            'user.status_toggled' => 'Status Pengguna Diubah',
            'speaker.supervisor_toggled' => 'Status Supervisor Pemateri Diubah',
            'speaker.account_provisioned' => 'Akun Login Pemateri Dibuat',
            'material.created' => 'Materi Baru Dibuat',
            'material.updated' => 'Materi Diperbarui',
            'material.published' => 'Materi Diterbitkan',
            'material.archived' => 'Materi Diarsipkan',
            'material.deleted' => 'Materi Dihapus',
            'material.file_replaced' => 'Berkas Materi Diganti',
            'material.status_updated' => 'Status Materi Diperbarui',
            'material.sync_peserta_audience' => 'Sinkronisasi Akses Peserta Materi',
            'material.read' => 'Materi Dibaca',
            'material.download' => 'Materi Diunduh',
            'category.created' => 'Kategori Baru Dibuat',
            'category.updated' => 'Kategori Diperbarui',
            'category.deleted' => 'Kategori Dihapus',
            'question_module.created' => 'Modul Soal Dibuat',
            'question_module.updated' => 'Modul Soal Diperbarui',
            'question_module.deleted' => 'Modul Soal Dihapus',
            'question_module.imported' => 'Modul Soal Diimpor',
            'showcase.updated' => 'Showcase Beranda Diperbarui',
            'showcase.reset' => 'Showcase Beranda Direset',
            'settings.updated' => 'Pengaturan Portal Diperbarui',
            'permissions.updated' => 'Matriks Hak Akses Diperbarui',
            'event.participant_results.reset' => 'Hasil Peserta Event Direset',
            'event.participant_results.reset_all' => 'Seluruh Hasil Peserta Event Direset',
            default => str_replace(['.', '_'], ' ', ucfirst($this->event)),
        };
    }
}
