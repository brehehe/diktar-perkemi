<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\Material;
use App\Models\User;
use Illuminate\Database\Seeder;

class ActivityLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('role', 'Admin')->first() ?? User::first();
        $adminId = $admin ? $admin->id : 1;

        $materials = Material::take(5)->get();

        $logs = [
            [
                'actor_id' => $adminId,
                'event' => 'settings.updated',
                'subject_type' => null,
                'subject_id' => null,
                'properties' => ['message' => 'Pengaturan portal Pustaka Penataran diinisialisasi'],
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                'created_at' => now()->subDays(10),
            ],
            [
                'actor_id' => $adminId,
                'event' => 'permissions.updated',
                'subject_type' => null,
                'subject_id' => null,
                'properties' => ['message' => 'Matriks hak akses dan peran PERKEMI diperbarui'],
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                'created_at' => now()->subDays(9),
            ],
        ];

        foreach ($materials as $idx => $m) {
            $logs[] = [
                'actor_id' => $adminId,
                'event' => 'material.created',
                'subject_type' => Material::class,
                'subject_id' => $m->id,
                'properties' => ['title' => $m->title, 'code' => $m->code],
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                'created_at' => now()->subDays(8 - $idx),
            ];
            $logs[] = [
                'actor_id' => $adminId,
                'event' => 'material.published',
                'subject_type' => Material::class,
                'subject_id' => $m->id,
                'properties' => ['title' => $m->title, 'status' => 'published'],
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                'created_at' => now()->subDays(7 - $idx),
            ];
        }

        foreach ($logs as $log) {
            ActivityLog::create($log);
        }
    }
}
