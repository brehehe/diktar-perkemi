<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class EventIntegrityPact extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'participant_id',
        'event_participant_id',
        'pact_type',
        'track_code',
        'full_name',
        'birth_place',
        'birth_date',
        'kenshi_id_number',
        'dan_level',
        'religion',
        'dojo',
        'city',
        'province',
        'certificate_number',
        'valid_start_date',
        'valid_end_date',
        'id_card_address',
        'current_address',
        'management_organization',
        'management_position',
        'sign_place',
        'sign_date',
        'signature_data',
        'file_path',
        'original_file_name',
        'file_size',
        'submission_mode',
        'signed_at',
        'status',
        'verified_by',
        'verified_at',
        'admin_notes',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'valid_start_date' => 'date',
        'valid_end_date' => 'date',
        'sign_date' => 'date',
        'signed_at' => 'datetime',
        'verified_at' => 'datetime',
    ];

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

    public function getPactTitleAttribute(): string
    {
        return match (strtolower($this->pact_type ?? '')) {
            'pelatih' => 'PAKTA INTEGRITAS PELATIH',
            'penguji' => 'PAKTA INTEGRITAS PENGUJI',
            'wasit' => 'PAKTA INTEGRITAS WASIT',
            default => 'PAKTA INTEGRITAS',
        };
    }

    public function getRoleLabelAttribute(): string
    {
        return match (strtolower($this->pact_type ?? '')) {
            'pelatih' => 'Pelatih Daerah / Nasional',
            'penguji' => 'Penguji Daerah / Nasional',
            'wasit' => 'Wasit Daerah / Nasional',
            default => 'Kenshi Shorinji Kempo',
        };
    }

    /**
     * @return array<int, string>
     */
    public function getPledgePoints(): array
    {
        $roleSpecificPledge = match (strtolower($this->pact_type ?? '')) {
            'penguji' => 'Akan melaksanakan tugas sebagai Penguji Daerah / Nasional dengan penuh rasa tanggung jawab dan dedikasi yang tinggi sesuai Janji dan Ikrar Kenshi;',
            'wasit' => 'Akan melaksanakan tugas sebagai Wasit Daerah / Nasional dengan penuh rasa tanggung jawab, jujur, adil dan dedikasi yang tinggi sesuai Janji dan Ikrar Kenshi;',
            default => 'Akan melaksanakan tugas sebagai Pelatih Daerah / Nasional dengan penuh rasa tanggung jawab dan dedikasi yang tinggi sesuai Janji dan Ikrar Kenshi;',
        };

        return [
            'Akan mematuhi setiap ketentuan yang berlaku didalam Anggaran Dasar dan Anggaran Rumah Tangga Persaudaraan Shorinji Kempo Indonesia (AD – ART PERKEMI), Peraturan dan Kebijakan PB Perkemi yang berlaku, yang terkait dengan kewajiban keanggotaan organisasi, Kepatuhan pada hakiki dan tujuan Motto, falsafah Shorinji Kempo dan nilai-nilai luhur Persaudaraan; Persyaratan, Tugas dan Kewajiban Jabatan;',
            $roleSpecificPledge,
            'Akan menjaga nama baik organisasi dengan berperilaku yang baik didalam maupun diluar lingkungan Perkemi dan menjadi contoh bagi masyarakat;',
            'Tetap aktif melatih di Dojo dengan tanpa menuntut upah atau honorarium;',
            'Akan terus melakukan introspeksi, meningkatkan pengetahuan dan keterampilan baik bidang organisasi, pengetahuan dan teknik Shorinji Kempo agar dapat mengamalkannya dengan baik dan benar.',
        ];
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
