<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'guard_name',
    ];

    /**
     * Permissions granted to this role.
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'role_has_permissions', 'role_id', 'permission_id');
    }

    /**
     * Display label for role in Indonesian.
     */
    public function getLabelAttribute(): string
    {
        return match ($this->name) {
            'super-admin' => 'Super Administrator',
            'content-admin' => 'Admin Konten & Modul',
            'user-admin' => 'Admin Pengguna',
            'reviewer' => 'Tim Peninjau / Reviewer',
            'organizer' => 'Penyelenggara Kegiatan',
            'speaker' => 'Pemateri / Narasumber',
            'coach' => 'Pelatih',
            'examiner' => 'Penguji Kyu & Dan',
            'referee' => 'Wasit Pertandingan',
            'participant' => 'Peserta Penataran',
            default => ucfirst(str_replace('-', ' ', $this->name)),
        };
    }
}
