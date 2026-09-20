<?php

namespace Database\Factories;

use App\Models\CbtProctoringEvent;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CbtProctoringEvent>
 */
class CbtProctoringEventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'type' => fake()->randomElement(['tab_hidden', 'window_blur', 'camera_denied']),
            'severity' => 'warning',
            'metadata' => null,
            'occurred_at' => now(),
        ];
    }
}
