<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

#[Fillable(['name', 'email', 'password', 'role', 'avatar_path'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Check if user has administrative privileges.
     */
    public function isAdmin(): bool
    {
        return in_array($this->role, ['Admin', 'super-admin', 'content-admin', 'user-admin'], true);
    }

    public function isSpeaker(): bool
    {
        return $this->role === 'Pemateri';
    }

    public function isCoordinator(): bool
    {
        return in_array($this->role, ['Koordinator Acara', 'Koordinator Jadwal'], true);
    }

    public function speaker(): HasOne
    {
        return $this->hasOne(Speaker::class);
    }

    public function speakers(): HasMany
    {
        return $this->hasMany(Speaker::class);
    }

    /**
     * Materials created by this user.
     */
    public function materials()
    {
        return $this->hasMany(Material::class, 'created_by');
    }

    /**
     * Activity logs by this user.
     */
    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class, 'actor_id');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(Participant::class);
    }

    public function participant(): HasOne
    {
        return $this->hasOne(Participant::class);
    }

    public function getAvatarUrlAttribute(): ?string
    {
        if ($this->avatar_path) {
            if (Str::startsWith($this->avatar_path, ['http://', 'https://', '/'])) {
                return $this->avatar_path;
            }

            return Storage::disk('public')->url($this->avatar_path);
        }

        return $this->participant?->photo_url;
    }

    /**
     * Reading progress records for this user.
     */
    public function readingProgress(): HasMany
    {
        return $this->hasMany(ReadingProgress::class);
    }

    /**
     * Bookmarks saved by this user.
     */
    public function bookmarks(): HasMany
    {
        return $this->hasMany(Bookmark::class);
    }
}
