<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Modul Penataran',
                'slug' => 'modul-penataran',
                'description' => 'Kurikulum dan modul resmi untuk setiap jenjang penataran.',
                'icon' => 'BookOpen',
                'color' => '#0B63CE',
                'sort_order' => 10,
                'is_active' => true,
            ],
            [
                'name' => 'Pedoman & Regulasi',
                'slug' => 'pedoman-regulasi',
                'description' => 'Peraturan, pedoman teknis, dan dokumen kebijakan resmi PB PERKEMI.',
                'icon' => 'ShieldCheck',
                'color' => '#0A3F82',
                'sort_order' => 20,
                'is_active' => true,
            ],
            [
                'name' => 'Materi Kepelatihan',
                'slug' => 'materi-kepelatihan',
                'description' => 'Referensi metode latihan fisik, teknik, dan pedagogi kepelatihan kenshi.',
                'icon' => 'Award',
                'color' => '#20A47A',
                'sort_order' => 30,
                'is_active' => true,
            ],
            [
                'name' => 'Materi Pengujian',
                'slug' => 'materi-pengujian',
                'description' => 'Kisi-kisi, rubrik evaluasi, dan bahan uji kenaikan tingkat (Kyu & Dan).',
                'icon' => 'FileCheck',
                'color' => '#DD4D7C',
                'sort_order' => 40,
                'is_active' => true,
            ],
            [
                'name' => 'Perwasitan',
                'slug' => 'perwasitan',
                'description' => 'Standar perwasitan, isyarat lapangan, dan manajemen pertandingan.',
                'icon' => 'Scale',
                'color' => '#EE9B25',
                'sort_order' => 50,
                'is_active' => true,
            ],
            [
                'name' => 'Video Pembelajaran',
                'slug' => 'video-pembelajaran',
                'description' => 'Demonstrasi gerak teknis dan rekaman pembekalan materi penataran.',
                'icon' => 'Video',
                'color' => '#7957D5',
                'sort_order' => 60,
                'is_active' => true,
            ],
        ];

        foreach ($categories as $catData) {
            Category::updateOrCreate(
                ['slug' => $catData['slug']],
                $catData
            );
        }
    }
}
