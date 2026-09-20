<?php

namespace Database\Seeders;

use App\Models\EventRoom;
use App\Models\EventSession;
use Illuminate\Database\Seeder;

class EventRoomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        EventSession::whereNotNull('room')->where('room', '!=', '')
            ->get()->each(function (EventSession $session): void {
                $room = EventRoom::firstOrCreate([
                    'event_id' => $session->event_id,
                    'name' => $session->room,
                ]);
                $session->update(['event_room_id' => $room->id]);
            });
    }
}
