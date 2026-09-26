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
        $transSettings = [];
        $numbers = $request->validated('numbers') ?? [];
        $transNumbers = $request->validated('transcript_numbers') ?? [];

        foreach (array_keys(EventDocumentGenerator::NUMBER_LABELS) as $trackCode) {
            // Certificate settings
            if (isset($numbers[$trackCode])) {
                $input = $numbers[$trackCode];
                $prefix = trim((string) ($input['prefix'] ?? ''));
                $start = $input['start'] ?? null;

                if ($prefix !== '' || ($start !== null && $start !== '')) {
                    $certSettings[$trackCode] = array_filter([
                        'prefix' => $prefix !== '' ? $prefix : null,
                        'start' => ($start !== null && $start !== '') ? (int) $start : null,
                    ], fn ($value) => $value !== null);
                }
            }

            // Transcript settings
            if (isset($transNumbers[$trackCode])) {
                $tInput = $transNumbers[$trackCode];
                $tPrefix = trim((string) ($tInput['prefix'] ?? ''));
                $tStart = $tInput['start'] ?? null;

                if ($tPrefix !== '' || ($tStart !== null && $tStart !== '')) {
                    $transSettings[$trackCode] = array_filter([
                        'prefix' => $tPrefix !== '' ? $tPrefix : null,
                        'start' => ($tStart !== null && $tStart !== '') ? (int) $tStart : null,
                    ], fn ($value) => $value !== null);
                }
            }
        }

        $allSettings = $certSettings;
        if (! empty($transSettings)) {
            $allSettings['transcript'] = $transSettings;
        }

        $event->update(['document_number_settings' => $allSettings]);

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
            $message .= " Nomor surat {$syncedCount} peserta telah disinkronkan dengan urutan 001, 002, dst.";
        }
        if ($regenerated) {
            $message .= " Berkas PDF {$regenerated['certificate']} sertifikat dan {$regenerated['transcript']} e-transkrip telah otomatis diperbarui.";
        }

        return back()->with('success', $message);
    }
}
