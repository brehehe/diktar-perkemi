<?php

namespace App\Models;

use Database\Factories\CbtProctoringEventFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CbtProctoringEvent extends Model
{
    /** @use HasFactory<CbtProctoringEventFactory> */
    use HasFactory;

    public const TYPES = [
        'camera_started',
        'camera_denied',
        'camera_unavailable',
        'camera_interrupted',
        'tab_hidden',
        'window_blur',
        'navigation_attempt',
        'fullscreen_exit',
        'page_exit_attempt',
    ];

    protected $fillable = [
        'cbt_exam_attempt_id',
        'event_id',
        'participant_id',
        'type',
        'severity',
        'metadata',
        'occurred_at',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'occurred_at' => 'datetime',
        ];
    }

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(CbtExamAttempt::class, 'cbt_exam_attempt_id');
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function participant(): BelongsTo
    {
        return $this->belongsTo(Participant::class);
    }

    public function getTypeLabelAttribute(): string
    {
        return match ($this->type) {
            'camera_started' => 'Kamera aktif',
            'camera_denied' => 'Izin kamera ditolak',
            'camera_unavailable' => 'Kamera tidak tersedia',
            'camera_interrupted' => 'Kamera terputus',
            'tab_hidden' => 'Berpindah tab atau aplikasi',
            'window_blur' => 'Jendela ujian kehilangan fokus',
            'navigation_attempt' => 'Mencoba kembali atau berpindah halaman',
            'fullscreen_exit' => 'Keluar dari mode layar penuh',
            'page_exit_attempt' => 'Mencoba meninggalkan halaman ujian',
            default => 'Kejadian pengawasan',
        };
    }
}
