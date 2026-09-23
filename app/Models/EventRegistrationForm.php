<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class EventRegistrationForm extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'participant_id',
        'event_participant_id',
        'form_type',
        'penataran_level',
        'start_date',
        'end_date',
        'location',
        'full_name',
        'birth_place',
        'birth_date',
        'kenshi_id_number',
        'dan_level',
        'home_address',
        'phone_number',
        'email',
        'occupation',
        'occupation_address',
        'occupation_phone',
        'emergency_address',
        'emergency_phone',
        'gasnas_records',
        'certificate_records',
        'sign_place',
        'sign_date',
        'applicant_name',
        'signature_data',
        'file_path',
        'original_file_name',
        'file_size',
        'submission_mode',
        'waiver_agreed',
        'waiver_signed_at',
        'status',
        'submitted_at',
        'verified_at',
        'verified_by',
        'admin_notes',
    ];

    protected $appends = [
        'file_url',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'birth_date' => 'date',
            'sign_date' => 'date',
            'gasnas_records' => 'array',
            'certificate_records' => 'array',
            'waiver_agreed' => 'boolean',
            'waiver_signed_at' => 'datetime',
            'submitted_at' => 'datetime',
            'verified_at' => 'datetime',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function participant(): BelongsTo
    {
        return $this->belongsTo(Participant::class);
    }

    public function eventParticipant(): BelongsTo
    {
        return $this->belongsTo(EventParticipant::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function getFileUrlAttribute(): ?string
    {
        if (! $this->file_path) {
            return null;
        }

        return Storage::url($this->file_path);
    }

    public function getFileSizeFormattedAttribute(): ?string
    {
        if (! $this->file_size) {
            return null;
        }

        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = (float) $this->file_size;
        $i = 0;
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }

        return round($bytes, 1).' '.$units[$i];
    }
}
