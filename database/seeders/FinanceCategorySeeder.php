<?php

namespace Database\Seeders;

use App\Models\FinanceCategory;
use Illuminate\Database\Seeder;

class FinanceCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['code' => 'sponsorship', 'name' => 'Sponsor', 'transaction_type' => 'income', 'sort_order' => 10],
            ['code' => 'registration', 'name' => 'Pendaftaran', 'transaction_type' => 'income', 'sort_order' => 20],
            ['code' => 'grant', 'name' => 'Hibah / Bantuan', 'transaction_type' => 'income', 'sort_order' => 30],
            ['code' => 'accommodation', 'name' => 'Akomodasi', 'transaction_type' => 'expense', 'sort_order' => 40],
            ['code' => 'consumption', 'name' => 'Konsumsi', 'transaction_type' => 'expense', 'sort_order' => 50],
            ['code' => 'printing', 'name' => 'Cetak & ATK', 'transaction_type' => 'expense', 'sort_order' => 60],
            ['code' => 'venue', 'name' => 'Tempat / Venue', 'transaction_type' => 'expense', 'sort_order' => 70],
            ['code' => 'transport', 'name' => 'Transportasi', 'transaction_type' => 'expense', 'sort_order' => 80],
            ['code' => 'other', 'name' => 'Lainnya', 'transaction_type' => 'both', 'sort_order' => 90],
        ];

        foreach ($categories as $category) {
            FinanceCategory::query()->updateOrCreate(['code' => $category['code']], $category);
        }
    }
}
