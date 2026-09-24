<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Speaker extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'title_degree',
        'type', // internal, external
        'dan_rank',
        'position',
        'organization',
        'specialization',
        'bio',
        'avatar_path',
        'contact_phone',
        'contact_email',
        'is_active',
        'is_supervisor',
        'event_id',
    ];

    protected $appends = [
        'full_name',
        'full_name_with_title',
        'title_suffix',
        'perkemi_position',
        'institution',
        'primary_expertise',
        'internal_contact',
        'photo_url',
        'dan_level',
        'dan_roman',
        'type_label',
        'role_info',
        'is_supervisor_label',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_supervisor' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(EventSession::class, 'speaker_id');
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function modules(): HasMany
    {
        return $this->hasMany(EventModule::class, 'speaker_id');
    }

    /**
     * Display full name with degrees.
     */
    public function getFullNameAttribute(): string
    {
        return $this->title_degree ? "{$this->name}, {$this->title_degree}" : $this->name;
    }

    public function getFullNameWithTitleAttribute(): string
    {
        return $this->getFullNameAttribute();
    }

    public function getTitleSuffixAttribute(): ?string
    {
        return $this->title_degree;
    }

    public function setTitleSuffixAttribute(?string $value): void
    {
        $this->attributes['title_degree'] = $value;
    }

    public function getPerkemiPositionAttribute(): ?string
    {
        return $this->position;
    }

    public function setPerkemiPositionAttribute(?string $value): void
    {
        $this->attributes['position'] = $value;
    }

    public function getInstitutionAttribute(): ?string
    {
        return $this->organization;
    }

    public function setInstitutionAttribute(?string $value): void
    {
        $this->attributes['organization'] = $value;
    }

    public function getPrimaryExpertiseAttribute(): ?string
    {
        return $this->specialization;
    }

    public function setPrimaryExpertiseAttribute(?string $value): void
    {
        $this->attributes['specialization'] = $value;
    }

    public function getInternalContactAttribute(): ?string
    {
        return $this->contact_phone ?? $this->contact_email;
    }

    public function setInternalContactAttribute(?string $value): void
    {
        $this->attributes['contact_phone'] = $value;
    }

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->avatar_path;
    }

    public function setPhotoUrlAttribute(?string $value): void
    {
        $this->attributes['avatar_path'] = $value;
    }

    public function getDanLevelAttribute(): ?int
    {
        if (! $this->dan_rank) {
            return null;
        }
        if (is_numeric($this->dan_rank)) {
            return (int) $this->dan_rank;
        }
        $map = ['I' => 1, 'II' => 2, 'III' => 3, 'IV' => 4, 'V' => 5, 'VI' => 6, 'VII' => 7, 'VIII' => 8];
        $clean = explode('-', $this->dan_rank)[0];

        return $map[$clean] ?? (int) filter_var($this->dan_rank, FILTER_SANITIZE_NUMBER_INT) ?: null;
    }

    public function setDanLevelAttribute($value): void
    {
        if (empty($value)) {
            $this->attributes['dan_rank'] = null;

            return;
        }
        $map = [1 => 'I-DAN', 2 => 'II-DAN', 3 => 'III-DAN', 4 => 'IV-DAN', 5 => 'V-DAN', 6 => 'VI-DAN', 7 => 'VII-DAN', 8 => 'VIII-DAN'];
        $this->attributes['dan_rank'] = is_numeric($value) ? ($map[(int) $value] ?? "{$value}-DAN") : $value;
    }

    public function getDanRomanAttribute(): ?string
    {
        if (! $this->dan_rank) {
            return null;
        }

        return str_replace('-DAN', '', $this->dan_rank);
    }

    public function getTypeLabelAttribute(): string
    {
        return $this->type === 'internal' ? 'Pemateri Internal' : 'Pemateri Eksternal';
    }

    public function getRoleInfoAttribute(): string
    {
        if ($this->type === 'internal') {
            return $this->position ? "{$this->position} • DAN {$this->dan_roman}" : ($this->dan_roman ? "DAN {$this->dan_roman}" : 'Instruktur PERKEMI');
        }

        return $this->organization ?? 'Pakar Eksternal';
    }

    public function getIsSupervisorLabelAttribute(): string
    {
        return $this->is_supervisor ? 'Supervisor' : 'Reguler';
    }
}
