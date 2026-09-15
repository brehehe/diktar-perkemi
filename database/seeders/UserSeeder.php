<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Administrator PERKEMI',
                'email' => 'admin@perkemi.id',
                'role' => 'Admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Budi Santoso',
                'email' => 'demo@portal.test',
                'role' => 'Peserta',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Sensei Hartono (Pelatih)',
                'email' => 'pelatih@perkemi.id',
                'role' => 'Pelatih',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Wasit Hendra Pratama',
                'email' => 'wasit@perkemi.id',
                'role' => 'Wasit',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Penguji Susanto',
                'email' => 'penguji@perkemi.id',
                'role' => 'Penguji',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Dr. Aris Sudarsono (Pemateri)',
                'email' => 'pemateri@perkemi.id',
                'role' => 'Pemateri',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Panitia Penataran Nasional',
                'email' => 'penyelenggara@perkemi.id',
                'role' => 'Penyelenggara',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }
    }
}
