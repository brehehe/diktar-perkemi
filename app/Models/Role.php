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
        'label',
        'description',
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
        if (! empty($this->attributes['label'])) {
            return $this->attributes['label'];
        }

        return match ($this->name) {
            'super-admin' => 'Super Administrator',
            'admin' => 'Administrator',
            'content-admin' => 'Admin Konten & Modul',
            'user-admin' => 'Admin Pengguna',
            'diktar' => 'Diktar (Pendidikan & Penataran)',
            'reviewer' => 'Tim Peninjau / Reviewer',
            'organizer' => 'Penyelenggara Kegiatan',
            'koordinator-acara' => 'Koordinator Acara',
            'bendahara' => 'Bendahara',
            'sie-acara' => 'Sie Acara',
            'dokumentasi' => 'Dokumentasi',
            'speaker' => 'Pemateri / Narasumber',
            'coach' => 'Pelatih',
            'examiner' => 'Penguji Kyu & Dan',
            'referee' => 'Wasit Pertandingan',
            'participant' => 'Peserta Penataran',
            default => ucfirst(str_replace(['-', '_'], ' ', $this->name)),
        };
    }

    /**
     * Role description in Indonesian.
     */
    public function getDescriptionAttribute(): ?string
    {
        if (! empty($this->attributes['description'])) {
            return $this->attributes['description'];
        }

        return match ($this->name) {
            'super-admin' => 'Memiliki hak akses penuh untuk seluruh konfigurasi sistem, peran, dan data portal.',
            'admin' => 'Administrator umum sistem penataran dan manajemen konten.',
            'content-admin' => 'Mengelola kurikulum, materi bacaan digital, dan modul penataran.',
            'user-admin' => 'Mengelola registrasi pengguna, akun admin, dan hak akses staf.',
            'diktar' => 'Pengelola penataran dan kurikulum pendidikan nasional PERKEMI.',
            'organizer' => 'Mengelola operasional kegiatan penataran, presensi, dan logistik.',
            'koordinator-acara' => 'Koordinator susunan kegiatan dan rundown penataran.',
            'bendahara' => 'Pengelola arus kas dan keuangan kegiatan penataran.',
            'sie-acara' => 'Staf pelaksana dan operasional acara di lapangan.',
            'dokumentasi' => 'Petugas dokumentasi dan publikasi media kegiatan.',
            'speaker' => 'Pemateri narasumber materi penataran dan evaluasi pemahaman.',
            'coach' => 'Pelatih cabang / dojo untuk pembinaan kenshi.',
            'examiner' => 'Penguji teknis ujian kenaikan tingkat Kyu dan Dan.',
            'referee' => 'Wasit pertandingan Shorinji Kempo.',
            'reviewer' => 'Meninjau dan memvalidasi kelayakan modul serta bank soal materi.',
            'participant' => 'Peserta kenshi yang mengikuti program penataran atau ujian.',
            default => null,
        };
    }

    /**
     * Check if this role is a protected system role.
     */
    public function isSystemRole(): bool
    {
        return in_array($this->name, [
            'super-admin',
            'admin',
            'content-admin',
            'user-admin',
            'diktar',
            'organizer',
            'speaker',
            'coach',
            'examiner',
            'referee',
            'participant',
        ], true);
    }

    /**
     * Get user count assigned to this role or matching its aliases.
     */
    public function getUsersCount(): int
    {
        $aliasMap = [
            'super-admin' => ['super-admin', 'Super Administrator'],
            'admin' => ['Admin', 'admin', 'Administrator'],
            'content-admin' => ['content-admin', 'Admin Konten & Modul'],
            'user-admin' => ['user-admin', 'Admin Pengguna'],
            'diktar' => ['Diktar', 'diktar'],
            'organizer' => ['Penyelenggara', 'organizer', 'Penyelenggara Kegiatan'],
            'koordinator-acara' => ['Koordinator Acara', 'koordinator-acara'],
            'bendahara' => ['Bendahara', 'bendahara'],
            'sie-acara' => ['Sie Acara', 'sie-acara'],
            'dokumentasi' => ['Dokumentasi', 'dokumentasi'],
            'speaker' => ['Pemateri', 'speaker', 'Pemateri / Narasumber'],
            'coach' => ['Pelatih', 'coach'],
            'examiner' => ['Penguji', 'examiner', 'Penguji Kyu & Dan'],
            'referee' => ['Wasit', 'referee', 'Wasit Pertandingan'],
            'participant' => ['Peserta', 'participant', 'Peserta Penataran'],
        ];

        $aliases = array_unique(array_filter([
            $this->name,
            $this->label,
            ...($aliasMap[$this->name] ?? []),
        ]));

        return User::whereIn('role', $aliases)->count();
    }
}
