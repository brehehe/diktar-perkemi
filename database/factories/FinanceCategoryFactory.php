<?php

namespace Database\Factories;

use App\Models\FinanceCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<FinanceCategory>
 */
class FinanceCategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'code' => Str::slug($name, '_'),
            'name' => Str::title($name),
            'transaction_type' => fake()->randomElement(['income', 'expense', 'both']),
            'sort_order' => fake()->numberBetween(100, 900),
        ];
    }
}
