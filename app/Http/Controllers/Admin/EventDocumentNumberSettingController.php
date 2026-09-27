<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateEventDocumentNumberSettingsRequest;
use App\Models\Event;
use App\Services\EventDocumentGenerator;
use Illuminate\Http\RedirectResponse;

class EventDocumentNumberSettingController extends Controller
{
    public function update(
        UpdateEventDocumentNumberSettingsRequest $request,
        Event $event,
        EventDocumentGenerator $generator
    ): RedirectResponse {
        $certSettings = [];
        $numbers = $request->validated('numbers') ?? [];

        foreach (array_keys(EventDocumentGenerator::NUMBER_LABELS) as $trackCode) {
            if (isset($numbers[$trackCode])) {
                $input = $numbers[$trackCode];
                $prefix = trim((string) ($input['prefix'] ?? ''));
                $start = isset($input['start']) ? trim((string) $input['start']) : null;

                if ($prefix !== '' || ($start !== null && $start !== '')) {
                    $certSettings[$trackCode] = array_filter([
                        'prefix' => $prefix !== '' ? $prefix : null,
                        'start' => ($start !== null && $start !== '')
                            ? (str_starts_with($start, '0') ? $start : (int) $start)
                            : null,
                    ], fn ($value) => $value !== null);
                }
            }
        }

        $event->update(['document_number_settings' => $certSettings]);

        $syncedCount = 0;
        if ($request->boolean('apply_to_participants')) {
            $syncedCount = $generator->syncEventParticipantNumbers($event);
        }

        $regenerated = null;
        if ($request->boolean('regenerate_documents')) {
            $regenerated = $generator->regenerateEventDocuments($event);
        }

        $message = 'Pengaturan nomor surat event berhasil disimpan.';
        if ($syncedCount > 0) {
            $message .= " Nomor surat {$syncedCount} peserta telah disinkronkan dengan urutan nomor terbaru.";
        }
        if ($regenerated) {
            $message .= " Berkas PDF {$regenerated['certificate']} sertifikat dan {$regenerated['transcript']} e-transkrip telah otomatis diperbarui.";
        }

        return back()->with('success', $message);
    }
}
