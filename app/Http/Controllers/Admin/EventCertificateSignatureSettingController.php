<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateEventCertificateSignatureSettingsRequest;
use App\Models\Event;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class EventCertificateSignatureSettingController extends Controller
{
    public function update(UpdateEventCertificateSignatureSettingsRequest $request, Event $event): RedirectResponse
    {
        $current = $event->certificate_signature_settings ?? [];
        $validated = $request->validated();

        $current['city'] = filled($validated['city'] ?? null) ? trim($validated['city']) : null;
        $current['date'] = filled($validated['date'] ?? null) ? trim($validated['date']) : null;
        $current['organization'] = filled($validated['organization'] ?? null) ? trim($validated['organization']) : null;
        $current['position'] = filled($validated['position'] ?? null) ? trim($validated['position']) : null;
        $current['signer_name'] = filled($validated['signer_name'] ?? null) ? trim($validated['signer_name']) : null;

        if ($request->hasFile('signature_image')) {
            if (! empty($current['signature_path']) && Storage::disk('public')->exists($current['signature_path'])) {
                Storage::disk('public')->delete($current['signature_path']);
            }

            $current['signature_path'] = $request->file('signature_image')->store("event-signatures/{$event->id}", 'public');
        } elseif (! empty($validated['signature_data']) && str_starts_with($validated['signature_data'], 'data:image/')) {
            if (! empty($current['signature_path']) && Storage::disk('public')->exists($current['signature_path'])) {
                Storage::disk('public')->delete($current['signature_path']);
            }

            $data = $validated['signature_data'];
            if (preg_match('/^data:image\/(\w+);base64,/', $data, $matches)) {
                $rawBase64 = substr($data, strpos($data, ',') + 1);
                $ext = strtolower($matches[1]);
                if ($ext === 'jpeg') {
                    $ext = 'jpg';
                }
                $decoded = base64_decode($rawBase64);

                if ($decoded !== false) {
                    $filename = "event-signatures/{$event->id}/sig_".time().".{$ext}";
                    Storage::disk('public')->put($filename, $decoded);
                    $current['signature_path'] = $filename;
                }
            }
        }

        $event->update([
            'certificate_signature_settings' => array_filter($current, fn ($v) => $v !== null),
        ]);

        return back()->with('success', 'Pengaturan penandatangan (TTD) sertifikat berhasil disimpan.');
    }

    public function destroySignature(Event $event): RedirectResponse
    {
        Gate::authorize('update', $event);

        $current = $event->certificate_signature_settings ?? [];

        if (! empty($current['signature_path'])) {
            if (Storage::disk('public')->exists($current['signature_path'])) {
                Storage::disk('public')->delete($current['signature_path']);
            }
            unset($current['signature_path']);
            $event->update([
                'certificate_signature_settings' => array_filter($current, fn ($v) => $v !== null),
            ]);
        }

        return back()->with('success', 'TTD digital berhasil dihapus.');
    }
}
