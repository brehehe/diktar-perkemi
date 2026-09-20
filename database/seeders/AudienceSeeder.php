<?php

namespace Database\Seeders;

use App\Models\Audience;
use Illuminate\Database\Seeder;

class AudienceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $audiences = [
            [
                'code' => 'participant',
                'name' => 'Peserta',
                'description' => 'Akses modul dan materi penataran yang Anda ikuti.',
                'is_active' => true,
            ],
            [
                'code' => 'coach',
                'name' => 'Pelatih',
                'description' => 'Materi kepelatihan dan pengembangan performa kenshi.',
                'is_active' => true,
            ],
            [
                'code' => 'examiner',
                'name' => 'Penguji',
                'description' => 'Pedoman, bahan uji, dan evaluasi kompetensi kenshi.',
                'is_active' => true,
            ],
            [
                'code' => 'referee',
                'name' => 'Wasit',
                'description' => 'Peraturan, modul, dan pembahasan perwasitan pertandingan.',
                'is_active' => true,
            ],
            [
                'code' => 'speaker',
                'name' => 'Pemateri',
                'description' => 'Bahan ajar dan referensi untuk menyusun sesi penataran.',
                'is_active' => true,
            ],
            [
                'code' => 'organizer',
                'name' => 'Penyelenggara',
                'description' => 'Dokumen panduan dan administrasi penyelenggaraan kegiatan.',
                'is_active' => true,
            ],
        ];

        foreach ($audiences as $data) {
            Audience::updateOrCreate(
                ['code' => $data['code']],
                $data
            );
        }
    }
}
