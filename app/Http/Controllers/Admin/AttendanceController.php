<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Events\GenerateEventAttendanceAll;
use App\Actions\Events\ResetEventParticipantResults;
use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\EventParticipant;
use App\Models\EventSession;
use App\Services\QrCodeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    /**
     * Open attendance for a session and generate QR token and short code.
     */
    public function open(Request $request, Event $event, EventSession $session): RedirectResponse
    {
        $validated = $request->validate([
            'attendance_setting' => ['nullable', 'in:check_in,check_in_out'],
            'attendance_close_at' => ['nullable', 'date', 'after:now'],
        ]);

        if ($session->attendance_setting === 'none' && empty($validated['attendance_setting'])) {
            return back()->withErrors(['attendance_setting' => 'Aktifkan absensi pada pengaturan sesi sebelum membuka QR.']);
        }

        $qrToken = Str::random(40);
        $shortCodeCandidates = collect(range(1, 10))->map(fn () => strtoupper(Str::random(6)))->unique();
        $activeCodes = EventSession::query()
            ->where('is_attendance_open', true)
            ->whereIn('qr_short_code', $shortCodeCandidates)
            ->pluck('qr_short_code');
        $qrShortCode = $shortCodeCandidates->first(fn (string $candidate) => ! $activeCodes->contains($candidate));
        abort_unless($qrShortCode, 503, 'Kode absensi belum dapat dibuat. Silakan coba kembali.');

        $closeAt = $request->filled('attendance_close_at')
            ? $request->date('attendance_close_at')
            : now()->addHours(in_array($session->session_type_code, ['KEHADIRAN_AWAL', 'KEHADIRAN_HARIAN'], true) ? 12 : 2);

        $session->update([
            'is_attendance_open' => true,
            'attendance_open_at' => now(),
            'attendance_close_at' => $closeAt,
            'qr_token' => $qrToken,
            'qr_short_code' => $qrShortCode,
            'attendance_setting' => $validated['attendance_setting'] ?? $session->attendance_setting ?? 'check_in',
        ]);

        return back()->with('success', "Absensi untuk \"{$session->topic}\" berhasil dibuka. Kode sesi: {$qrShortCode}");
    }

    /**
     * Close attendance for a session.
     */
    public function close(Event $event, EventSession $session): RedirectResponse
    {
        $session->update([
            'is_attendance_open' => false,
            'attendance_close_at' => now(),
        ]);

        return back()->with('success', "Absensi untuk \"{$session->topic}\" telah ditutup.");
    }

    /**
     * Show official printable QR Code page for physical display at the venue/dojo.
     */
    public function printQr(Event $event, mixed $session): Response|RedirectResponse
    {
        if (! ($session instanceof EventSession)) {
            $eventSession = EventSession::where('event_id', $event->id)
                ->where(function ($query) use ($session) {
                    $query->where('id', $session)
                        ->orWhere('session_number', $session)
                        ->orWhere('qr_short_code', $session);
                })
                ->first();

            if (! $eventSession) {
                $fallback = EventSession::where('event_id', $event->id)
                    ->where('is_attendance_open', true)
                    ->first()
                    ?? EventSession::where('event_id', $event->id)->where('session_type_code', 'KEHADIRAN_AWAL')->first()
                    ?? EventSession::where('event_id', $event->id)->first();

                if ($fallback) {
                    return redirect()->route('admin.event.session.attendance.print', [$event->id, $fallback->id]);
                }

                abort(404, 'Sesi tidak ditemukan untuk event ini.');
            }

            $session = $eventSession;
        }

        abort_unless($session->is_attendance_open && $session->qr_token && $session->qr_short_code, 403,
            'Buka absensi terlebih dahulu sebelum mencetak QR.');
        abort_unless($session->isAttendanceActive(), 403,
            'Waktu absensi telah berakhir. Buka kembali absensi untuk membuat QR aktif.');

        $scanUrl = route('event.scan', [
            'slug' => $event->slug,
            'code' => $session->qr_short_code,
        ]);
        $qrSvg = QrCodeService::svg($session->qr_short_code, 320, '#0E2747', '#FFFFFF');

        return Inertia::render('Admin/Events/PrintQr', [
            'event' => [
                'id' => $event->id,
                'name' => $event->name,
                'slug' => $event->slug,
                'date_formatted' => $event->date_formatted,
                'place' => $event->place,
                'organizer' => $event->organizer,
            ],
            'session' => [
                'id' => $session->id,
                'session_number' => $session->session_number,
                'day_number' => $session->day_number,
                'session_type_code' => $session->session_type_code,
                'time_slot' => $session->time_slot,
                'topic' => $session->topic,
                'room' => $session->room,
                'speaker_name' => $session->speaker?->name,
                'qr_short_code' => $session->qr_short_code,
                'attendance_setting' => $session->attendance_setting,
                'is_attendance_open' => $session->is_attendance_open,
                'attendance_open_at' => $session->attendance_open_at?->format('H:i d M Y'),
                'attendance_close_at' => $session->attendance_close_at?->format('H:i d M Y'),
            ],
            'scanUrl' => $scanUrl,
            'qrSvg' => $qrSvg,
        ]);
    }

    /**
     * Show official batch printable QR Codes for all sessions with attendance.
     */
    public function printAllQr(Request $request, Event $event): Response
    {
        // Get all sessions that require attendance
        $sessions = EventSession::query()
            ->where('event_id', $event->id)
            ->where('attendance_setting', '!=', 'disabled')
            ->where('attendance_setting', '!=', 'none')
            ->with(['speaker', 'sessionType'])
            ->orderBy('day_number')
            ->orderBy('start_time')
            ->orderBy('session_number')
            ->get();

        // Ensure every session has a valid qr_short_code and qr_token
        foreach ($sessions as $session) {
            if (! $session->qr_short_code || ! $session->qr_token) {
                $session->update([
                    'qr_short_code' => $session->qr_short_code ?: strtoupper(Str::random(6)),
                    'qr_token' => $session->qr_token ?: Str::random(40),
                ]);
            }
        }

        $sessionsPayload = $sessions->map(function (EventSession $session) use ($event) {
            $scanUrl = route('event.scan', [
                'slug' => $event->slug,
                'code' => $session->qr_short_code,
            ]);

            return [
                'id' => $session->id,
                'session_number' => $session->session_number,
                'day_number' => $session->day_number,
                'session_date' => $session->session_date?->format('d/m/Y'),
                'session_type_code' => $session->session_type_code,
                'session_type_name' => $session->sessionType?->name,
                'time_slot' => $session->time_slot ?: ($session->start_time && $session->end_time ? "{$session->start_time} - {$session->end_time}" : null),
                'topic' => $session->topic,
                'subtopic' => $session->subtopic,
                'room' => $session->room,
                'target_tracks' => $session->target_tracks,
                'speaker_name' => $session->speaker?->name,
                'qr_short_code' => $session->qr_short_code,
                'attendance_setting' => $session->attendance_setting,
                'scanUrl' => $scanUrl,
                'qrSvg' => QrCodeService::svg($session->qr_short_code, 260, '#0E2747', '#FFFFFF'),
            ];
        });

        return Inertia::render('Admin/Events/PrintAllQr', [
            'event' => [
                'id' => $event->id,
                'name' => $event->name,
                'slug' => $event->slug,
                'date_formatted' => $event->date_formatted,
                'place' => $event->place,
                'organizer' => $event->organizer,
            ],
            'sessions' => $sessionsPayload,
        ]);
    }

    /**
     * Perform manual attendance override by an authorized admin.
     */
    public function override(Request $request, Event $event): RedirectResponse
    {
        $validated = $request->validate([
            'event_session_id' => ['required', Rule::exists('event_sessions', 'id')->where('event_id', $event->id)],
            'participant_id' => ['required', Rule::exists('event_participants', 'participant_id')->where('event_id', $event->id)],
            'attendance_type' => 'required|in:check_in,check_out',
            'status' => 'required|in:present,late,excused,absent,manual_override',
            'notes' => 'required|string|min:3',
        ]);

        DB::transaction(function () use ($event, $validated): void {
            $eventParticipant = EventParticipant::query()
                ->where('event_id', $event->id)
                ->where('participant_id', $validated['participant_id'])
                ->lockForUpdate()
                ->firstOrFail();
            $session = EventSession::query()
                ->where('event_id', $event->id)
                ->findOrFail($validated['event_session_id']);
            $attendance = EventAttendance::updateOrCreate(
                [
                    'event_session_id' => $session->id,
                    'participant_id' => $validated['participant_id'],
                    'attendance_type' => $validated['attendance_type'],
                ],
                [
                    'event_id' => $event->id,
                    'status' => $validated['status'],
                    'checked_in_at' => now(),
                    'method' => 'manual_admin',
                    'recorded_by' => Auth::id(),
                    'notes' => $validated['notes'],
                ],
            );

            $records = $eventParticipant->attendance_records ?? [];
            $records["session_{$session->id}"] = [
                'status' => $validated['status'],
                'type' => $validated['attendance_type'],
                'time' => now()->toIso8601String(),
                'by' => Auth::user()?->name ?? 'Admin',
                'reason' => $validated['notes'],
            ];
            $eventParticipant->update([
                'attendance_records' => $records,
                'attendance_status' => 'present',
                ...($session->session_type_code === 'KEHADIRAN_AWAL'
                    && $validated['attendance_type'] === 'check_in'
                    && in_array($validated['status'], ['present', 'late', 'manual_override'], true) ? [
                        'checked_in_at' => $attendance->checked_in_at,
                        'checkin_method' => 'manual_admin',
                        'checkin_status' => 'checked_in',
                    ] : []),
            ]);
        });

        return back()->with('success', 'Status absensi peserta berhasil diperbarui melalui override manual.');
    }

    public function destroy(
        Event $event,
        EventAttendance $attendance,
        ResetEventParticipantResults $resetEventParticipantResults,
    ): RedirectResponse {
        $resetEventParticipantResults->resetParticipant($event, $attendance);

        return back()->with('success', 'Seluruh presensi, nilai, dan hasil ujian peserta berhasil direset.');
    }

    public function destroyParticipantResults(
        Event $event,
        EventParticipant $eventParticipant,
        ResetEventParticipantResults $resetEventParticipantResults,
    ): RedirectResponse {
        $resetEventParticipantResults->resetEnrollment($event, $eventParticipant);

        return back()->with('success', 'Seluruh presensi, nilai, dan hasil ujian peserta berhasil direset.');
    }

    public function destroyAll(Event $event, ResetEventParticipantResults $resetEventParticipantResults): RedirectResponse
    {
        $result = $resetEventParticipantResults->resetAll($event);

        return back()->with(
            'success',
            "Hasil {$result['participant_count']} peserta berhasil direset, termasuk {$result['attendance_count']} presensi dan {$result['attempt_count']} percobaan ujian.",
        );
    }

    public function generateAll(
        Request $request,
        Event $event,
        GenerateEventAttendanceAll $generator,
    ): RedirectResponse {
        $validated = $request->validate([
            'status' => ['nullable', 'string', 'in:present,late,manual_override'],
            'method' => ['nullable', 'string', 'in:manual_admin,qr_scan,short_code'],
            'target_track' => ['nullable', 'string'],
            'include_arrival' => ['nullable', 'boolean'],
            'include_daily' => ['nullable', 'boolean'],
            'include_sessions' => ['nullable', 'boolean'],
        ]);

        $result = $generator->execute($event, $validated);

        return back()->with(
            'success',
            "Berhasil men-generate {$result['attendance_count']} data absensi untuk {$result['participant_count']} peserta pada {$result['session_count']} sesi.",
        );
    }
}
