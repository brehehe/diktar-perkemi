<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('roles')) {
            Schema::table('roles', function (Blueprint $table) {
                if (! Schema::hasColumn('roles', 'label')) {
                    $table->string('label')->nullable()->after('name');
                }
                if (! Schema::hasColumn('roles', 'description')) {
                    $table->text('description')->nullable()->after('label');
                }
            });

            // Seed initial labels and descriptions for existing roles
            $roleData = [
                'super-admin' => [
                    'label' => 'Super Administrator',
                    'description' => 'Memiliki hak akses penuh untuk seluruh konfigurasi sistem, peran, dan data portal.',
                ],
                'admin' => [
                    'label' => 'Administrator',
                    'description' => 'Administrator umum sistem penataran dan manajemen konten.',
                ],
                'content-admin' => [
                    'label' => 'Admin Konten & Modul',
                    'description' => 'Mengelola kurikulum, materi bacaan digital, dan modul penataran.',
                ],
                'user-admin' => [
                    'label' => 'Admin Pengguna',
                    'description' => 'Mengelola registrasi pengguna, akun admin, dan hak akses staf.',
                ],
                'diktar' => [
                    'label' => 'Diktar (Pendidikan & Penataran)',
                    'description' => 'Pengelola penataran dan kurikulum pendidikan nasional PERKEMI.',
                ],
                'organizer' => [
                    'label' => 'Penyelenggara Kegiatan',
                    'description' => 'Mengelola operasional kegiatan penataran, presensi, dan logistik.',
                ],
                'koordinator-acara' => [
                    'label' => 'Koordinator Acara',
                    'description' => 'Koordinator susunan kegiatan dan rundown penataran.',
                ],
                'bendahara' => [
                    'label' => 'Bendahara',
                    'description' => 'Pengelola arus kas dan keuangan kegiatan penataran.',
                ],
                'sie-acara' => [
                    'label' => 'Sie Acara',
                    'description' => 'Staf pelaksana dan operasional acara di lapangan.',
                ],
                'dokumentasi' => [
                    'label' => 'Dokumentasi',
                    'description' => 'Petugas dokumentasi dan publikasi media kegiatan.',
                ],
                'speaker' => [
                    'label' => 'Pemateri / Narasumber',
                    'description' => 'Pemateri narasumber materi penataran dan evaluasi pemahaman.',
                ],
                'coach' => [
                    'label' => 'Pelatih',
                    'description' => 'Pelatih cabang / dojo untuk pembinaan kenshi.',
                ],
                'examiner' => [
                    'label' => 'Penguji Kyu & Dan',
                    'description' => 'Penguji teknis ujian kenaikan tingkat Kyu dan Dan.',
                ],
                'referee' => [
                    'label' => 'Wasit Pertandingan',
                    'description' => 'Wasit pertandingan Shorinji Kempo.',
                ],
                'reviewer' => [
                    'label' => 'Tim Peninjau / Reviewer',
                    'description' => 'Meninjau dan memvalidasi kelayakan modul serta bank soal materi.',
                ],
                'participant' => [
                    'label' => 'Peserta Penataran',
                    'description' => 'Peserta kenshi yang mengikuti program penataran atau ujian.',
                ],
            ];

            foreach ($roleData as $roleName => $meta) {
                $existing = DB::table('roles')->where('name', $roleName)->first();
                if ($existing) {
                    DB::table('roles')->where('id', $existing->id)->update([
                        'label' => $meta['label'],
                        'description' => $meta['description'],
                        'updated_at' => now(),
                    ]);
                } else {
                    DB::table('roles')->insert([
                        'name' => $roleName,
                        'guard_name' => 'web',
                        'label' => $meta['label'],
                        'description' => $meta['description'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('roles')) {
            Schema::table('roles', function (Blueprint $table) {
                if (Schema::hasColumn('roles', 'description')) {
                    $table->dropColumn('description');
                }
                if (Schema::hasColumn('roles', 'label')) {
                    $table->dropColumn('label');
                }
            });
        }
    }
};
