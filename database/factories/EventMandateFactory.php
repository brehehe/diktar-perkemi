<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\EventMandate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EventMandate>
 */
class EventMandateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'event_id' => fn (): int => Event::query()->firstOrFail()->id,
            'letter_number' => fake()->unique()->numerify('###/MDT-PB/X/2026'),
            'title' => 'Surat Mandat Penguji',
            'event_name' => fake()->sentence(6),
            'source_references' => [fake()->sentence()],
            'issued_place' => 'Jakarta',
            'issued_at' => fake()->dateTimeBetween('-1 month', 'now'),
            'valid_from' => fake()->dateTimeBetween('now', '+1 month'),
            'valid_until' => fake()->dateTimeBetween('+1 month', '+2 months'),
            'venue' => fake()->company(),
            'address' => fake()->address(),
            'province' => fake()->state(),
            'exam_scope' => 'Ujian Kenaikan Tingkat Kenshi.',
            'participant_total' => fake()->numberBetween(10, 100),
            'examiners' => [
                ['name' => fake()->name(), 'rank' => 'DAN IV'],
            ],
            'provisions' => [fake()->sentence()],
            'participant_summary' => [
                ['level' => 'KYU 1', 'count' => 10],
            ],
            'home_assignments' => [
                ['level' => 'KYU 1', 'questions' => [fake()->sentence()]],
            ],
            'signatory_name' => fake()->name(),
            'signatory_title' => 'Pengurus Besar PERKEMI',
            'document_disk' => 'local',
        ];
    }
}
