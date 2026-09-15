<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Permission extends Model
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
     * Roles with this permission.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_has_permissions', 'permission_id', 'role_id');
    }

    /**
     * Indonesian readable label.
     */
    public function getLabelAttribute(): string
    {
        return match ($this->name) {
            'dashboard.view' => 'Lihat Ringkasan Dashboard',
            'materials.view' => 'Melihat & Membaca Modul',
            'materials.create' => 'Menambah Materi Baru',
            'materials.update' => 'Mengubah & Menyunting Materi',
            'materials.review' => 'Meninjau & Memeriksa Modul',
            'materials.publish' => 'Menerbitkan Modul',
            'materials.archive' => 'Mengarsipkan Modul',
            'materials.delete' => 'Menghapus Materi',
            'materials.restore' => 'Memulihkan Materi',
            'users.view' => 'Melihat Data Pengguna',
            'users.update' => 'Mengubah Data & Peran Pengguna',
            'users.suspend' => 'Menonaktifkan Akun Pengguna',
            'roles.manage' => 'Mengatur Hak Akses & Peran',
            'reports.view' => 'Melihat Laporan Statistik',
            'reports.export' => 'Ekspor Laporan Data',
            'settings.manage' => 'Mengatur Pengaturan Portal',
            default => $this->name,
        };
    }
}
