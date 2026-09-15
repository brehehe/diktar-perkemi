<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'role'])]
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
    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class, 'actor_id');
    }
}
