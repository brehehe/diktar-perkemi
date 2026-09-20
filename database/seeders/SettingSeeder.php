<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            ['key' => 'portal_name', 'value' => 'Pustaka Penataran', 'group' => 'general'],
            ['key' => 'portal_subtitle', 'value' => 'Portal Buku Digital PERKEMI', 'group' => 'general'],
            ['key' => 'portal_description', 'value' => 'Pusat akses digital resmi untuk buku, modul penataran, dan referensi pembelajaran PERKEMI.', 'group' => 'general'],
            ['key' => 'contact_email', 'value' => 'sekretariat@perkemi.id', 'group' => 'contact'],
            ['key' => 'contact_phone', 'value' => '+62 21 5732145', 'group' => 'contact'],
            ['key' => 'footer_copyright', 'value' => 'Pengurus Besar Persaudaraan Shorinji Kempo Indonesia (PB PERKEMI)', 'group' => 'general'],
            ['key' => 'hero_badge', 'value' => '📘 Digital Learning Center', 'group' => 'appearance'],
            ['key' => 'hero_headline', 'value' => 'Satu Akses, Banyak Pengetahuan', 'group' => 'appearance'],
            ['key' => 'hero_subheadline', 'value' => 'Akses buku digital, modul penataran, dan bahan ajar pemateri dalam satu portal terintegrasi.', 'group' => 'appearance'],
            ['key' => 'registration_open', 'value' => '1', 'group' => 'auth'],
            ['key' => 'default_role', 'value' => 'Peserta', 'group' => 'auth'],
            ['key' => 'notify_new_material', 'value' => '1', 'group' => 'notification'],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                ['value' => $setting['value'], 'group' => $setting['group']]
            );
        }
    }
}
