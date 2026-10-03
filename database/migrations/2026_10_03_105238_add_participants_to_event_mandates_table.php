<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('event_mandates', function (Blueprint $table) {
            $table->json('participants')->nullable()->after('participant_summary');
        });

        $eventId = DB::table('events')
            ->where('slug', 'gashuku-dan-ujian-kenaikan-tingkat-kota-surabaya-ke-3-tahun-2026')
            ->value('id');

        if ($eventId !== null) {
            DB::table('event_mandates')
                ->where('event_id', $eventId)
                ->update([
                    'participant_total' => 65,
                    'participants' => json_encode($this->surabayaMandateParticipants(), JSON_THROW_ON_ERROR),
                    'updated_at' => now(),
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_mandates', function (Blueprint $table) {
            $table->dropColumn('participants');
        });
    }

    /**
     * @return array<int, array{number: int, name: string, nik: string, gender: string, age: string, level: string, dojo: string, branch: string, status: string, notes: string}>
     */
    private function surabayaMandateParticipants(): array
    {
        $payload = json_decode(
            file_get_contents(database_path('seeders/data/ukt_jatim_sby_mandate_participants.json')),
            true,
            512,
            JSON_THROW_ON_ERROR,
        );

        return array_map(static function (array $record): array {
            [$number, $name, $nik, $gender, $age, $level, $dojo, $branch] = $record;

            return [
                'number' => $number,
                'name' => $name,
                'nik' => $nik,
                'gender' => $gender,
                'age' => $age,
                'level' => $level,
                'dojo' => $dojo,
                'branch' => $branch,
                'status' => 'approved',
                'notes' => 'Lunas iuran per Okt 2026',
            ];
        }, $payload['records']);
    }
};
