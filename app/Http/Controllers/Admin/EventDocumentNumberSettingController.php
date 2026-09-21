<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateEventDocumentNumberSettingsRequest;
use App\Models\Event;
use App\Services\EventDocumentGenerator;
use Illuminate\Http\RedirectResponse;

class EventDocumentNumberSettingController extends Controller
{
    public function update(UpdateEventDocumentNumberSettingsRequest $request, Event $event): RedirectResponse
    {
        $settings = [];
        $numbers = $request->validated('numbers');

        foreach (array_keys(EventDocumentGenerator::NUMBER_LABELS) as $trackCode) {
            $input = $numbers[$trackCode];
            $prefix = trim((string) ($input['prefix'] ?? ''));
            $start = $input['start'] ?? null;

            if ($prefix !== '' || $start !== null && $start !== '') {
                $settings[$trackCode] = array_filter([
                    'prefix' => $prefix !== '' ? $prefix : null,
                    'start' => $start !== null && $start !== '' ? (int) $start : null,
                ], fn ($value) => $value !== null);
            }
        }

        $event->update(['document_number_settings' => $settings]);

        return back()->with('success', 'Pengaturan nomor sertifikat event berhasil disimpan.');
    }
}
