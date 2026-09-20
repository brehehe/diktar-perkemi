<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\EventRoom;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EventRoom>
 */
class EventRoomFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'event_id' => Event::query()->value('id'),
            'name' => fake()->unique()->words(2, true),
        ];
    }
}
