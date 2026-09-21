<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveParticipantRequest;
use App\Models\CbtExamAttempt;
use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\EventParticipant;
use App\Models\Participant;
use App\Models\ParticipantTrack;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ParticipantController extends Controller
{
    /**
     * Display a listing of participants with search and filters.
     */
    public function index(Request $request): Response
    {
        $query = Participant::query()
            ->with(['user', 'event:id,title', 'latestEventParticipant.event', 'latestEventParticipant.track'])
            ->withCount('eventParticipants');

        if ($request->filled('q')) {
            $search = trim((string) $request->input('q'));
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('kenshi_id_number', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%")
                    ->orWhere('origin_province', 'ilike', "%{$search}%")
                    ->orWhere('origin_city', 'ilike', "%{$search}%")
                    ->orWhere('origin_dojo', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('dan_level')) {
            $danVal = (int) $request->input('dan_level');
            $danMap = [1 => 'I-DAN', 2 => 'II-DAN', 3 => 'III-DAN', 4 => 'IV-DAN', 5 => 'V-DAN', 6 => 'VI-DAN', 7 => 'VII-DAN', 8 => 'VIII-DAN'];
            $targetDan = $danMap[$danVal] ?? "{$danVal}-DAN";
            $query->where('dan_rank', 'ilike', "%{$targetDan}%");
        }

        if ($request->filled('origin')) {
            $originSearch = trim((string) $request->input('origin'));
            $query->where(function ($oq) use ($originSearch) {
                $oq->where('origin_province', 'ilike', "%{$originSearch}%")
                    ->orWhere('origin_city', 'ilike', "%{$originSearch}%")
                    ->orWhere('origin_dojo', 'ilike', "%{$originSearch}%");
            });
        }

        if ($request->filled('track_id')) {
            $trackId = (int) $request->input('track_id');
            $trackCode = ParticipantTrack::find($trackId)?->code;
            if ($trackCode) {
                $query->whereHas('eventParticipants', fn ($epq) => $epq->where('track_code', $trackCode));
            }
        }

        if ($request->filled('scope') && $request->input('scope') !== 'all') {
            $scope = $request->input('scope');
            if ($scope === 'master') {
                $query->whereNull('event_id');
            } elseif (is_numeric($scope)) {
                $query->where('event_id', (int) $scope);
            }
        }

        $participants = $query->orderBy('name')->paginate(10)->withQueryString()->through(fn (Participant $p) => [
            'id' => $p->id,
            'event_id' => $p->event_id,
            'event_title' => $p->event?->title,
            'name' => $p->name,
            'email' => $p->email,
            'kenshi_id' => $p->kenshi_id,
            'phone' => $p->phone,
            'dan_level' => $p->dan_level,
            'dan_roman' => $p->dan_roman,
            'origin' => $p->origin,
            'dojo' => $p->dojo,
            'has_account' => $p->user_id !== null,
            'user' => $p->user ? [
                'id' => $p->user->id,
                'name' => $p->user->name,
                'email' => $p->user->email,
                'role' => $p->user->role,
            ] : null,
            'events_count' => $p->event_participants_count,
            'latest_event' => $p->latestEventParticipant?->event?->name ?? 'Belum ada',
            'latest_track' => $p->latestEventParticipant?->track?->code ?? '-',
            'created_at' => $p->created_at?->format('d M Y'),
        ]);

        $participantStats = Participant::query()->selectRaw(
            'COUNT(*) as total_participants,
             SUM(CASE WHEN user_id IS NOT NULL THEN 1 ELSE 0 END) as linked_accounts,
             SUM(CASE WHEN dan_rank IS NOT NULL THEN 1 ELSE 0 END) as yudansha_count',
        )->firstOrFail();
        $stats = [
            'total_participants' => (int) $participantStats->total_participants,
            'linked_accounts' => (int) $participantStats->linked_accounts,
            'yudansha_count' => (int) $participantStats->yudansha_count,
            'total_enrollments' => EventParticipant::count(),
        ];

        $tracks = ParticipantTrack::orderBy('id')->get(['id', 'code', 'name']);
        $events = Event::select('id', 'title', 'slug', 'start_date')->latest('start_date')->get();

        return Inertia::render('Admin/Participants/Index', [
            'participants' => $participants,
            'filters' => $request->only(['q', 'dan_level', 'origin', 'track_id', 'scope']),
            'stats' => $stats,
            'availableTracks' => $tracks,
            'events' => $events,
        ]);
    }

    /**
     * Display participant identity and event records.
     */
    public function show(Participant $participant): Response
    {
        $participant->load([
            'user',
            'eventParticipants.event.sessions',
            'eventParticipants.event.modules',
            'eventParticipants.track',
        ]);

        $attendancesByEvent = EventAttendance::where('participant_id', $participant->id)
            ->with('session')->orderByDesc('checked_in_at')->get()->groupBy('event_id');
        $attemptsByEvent = CbtExamAttempt::where('participant_id', $participant->id)
            ->with('package')->orderByDesc('submitted_at')->get()->groupBy('event_id');

        // Map events attended
        $enrolledEvents = $participant->eventParticipants->map(fn (EventParticipant $ep) => [
            'id' => $ep->id,
            'event_id' => $ep->event_id,
            'event_name' => $ep->event?->name ?? '-',
            'date_formatted' => $ep->event?->date_formatted ?? '-',
            'place' => $ep->event?->place ?? '-',
            'track' => $ep->track ? [
                'id' => $ep->track->id,
                'code' => $ep->track->code,
                'name' => $ep->track->name,
                'is_dual_track' => $ep->track->is_dual_track,
                'badge_color' => $ep->track->badge_color,
            ] : null,
            'rotation_group' => $ep->rotation_group,
            'admin_status' => $ep->admin_status,
            'attendance_status' => $ep->attendance_status,
            'attendance_by_day' => $ep->attendance_by_day ?? [],
            'theory_score' => $ep->theory_score,
            'practice_score' => $ep->practice_score,
            'final_grade' => $ep->final_grade,
            'graduation_status' => $ep->graduation_status,
            'certificate_number' => $ep->certificate_number,
            'certificate_issued_at' => $ep->certificate_issued_at?->format('d M Y'),
            'certificate_download_url' => $ep->certificate_file_path
                ? route('admin.event.certificate.download', [$ep->event_id, $ep->id]) : null,
            'transcript_number' => $ep->transcript_number,
            'transcript_issued_at' => $ep->transcript_issued_at?->format('d M Y'),
            'transcript_download_url' => $ep->transcript_file_path
                ? route('admin.event.transcript.download', [$ep->event_id, $ep->id]) : null,
            'attendances' => ($attendancesByEvent->get($ep->event_id) ?? collect())->map(fn (EventAttendance $attendance) => [
                'id' => $attendance->id,
                'session_name' => $attendance->session?->topic ?? 'Sesi dihapus',
                'day_number' => $attendance->session?->day_number,
                'attendance_type' => $attendance->attendance_type,
                'status_label' => $attendance->status_label,
                'checked_in_at' => $attendance->checked_in_at?->format('d M Y, H:i'),
            ])->values(),
            'exam_attempts' => ($attemptsByEvent->get($ep->event_id) ?? collect())->map(fn (CbtExamAttempt $attempt) => [
                'id' => $attempt->id,
                'package_title' => $attempt->package?->title ?? 'Paket ujian dihapus',
                'attempt_number' => $attempt->attempt_number,
                'status' => $attempt->status,
                'score' => $attempt->total_score !== null ? (float) $attempt->total_score : null,
                'passing_score' => $attempt->package?->passing_score !== null ? (float) $attempt->package->passing_score : null,
                'is_passed' => $attempt->is_passed,
                'revision_status' => $attempt->revision_status,
                'submitted_at' => $attempt->submitted_at?->format('d M Y, H:i'),
            ])->values(),
            'notes' => $ep->notes,
            'event_status' => $ep->event?->status ?? 'completed',
            'modules_count' => $ep->event?->modules?->count() ?? 0,
            'sessions_count' => $ep->event?->sessions?->count() ?? 0,
        ]);

        return Inertia::render('Admin/Participants/Show', [
            'matchingUser' => ! $participant->user_id && $participant->email
                ? User::where('email', $participant->email)
                    ->where('role', 'Peserta')
                    ->whereDoesntHave('participants')
                    ->first(['id', 'name', 'email']) : null,
            'participant' => [
                'id' => $participant->id,
                'name' => $participant->name,
                'email' => $participant->email,
                'kenshi_id' => $participant->kenshi_id,
                'phone' => $participant->phone,
                'origin' => $participant->origin,
                'dojo' => $participant->dojo,
                'dan_level' => $participant->dan_level,
                'dan_roman' => $participant->dan_roman,
                'documents' => $participant->documents ?? [],
                'admin_notes' => $participant->admin_notes,
                'created_at' => $participant->created_at?->format('d M Y'),
                'user' => $participant->user ? [
                    'id' => $participant->user->id,
                    'name' => $participant->user->name,
                    'email' => $participant->user->email,
                    'role' => $participant->user->role,
                ] : null,
            ],
            'enrolledEvents' => $enrolledEvents,
        ]);
    }

    /**
     * Store a newly created participant.
     */
    public function store(SaveParticipantRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        DB::transaction(function () use ($validated, $request): void {
            $participantData = $this->participantAttributes($validated);
            $user = User::query()
                ->where('email', $validated['email'])
                ->where('role', 'Peserta')
                ->whereDoesntHave('participants')
                ->lockForUpdate()
                ->first();
            if ($user) {
                $participantData['user_id'] = $user->id;
            }

            $participant = Participant::create($participantData);

            if (! empty($validated['event_id'])) {
                $trackCode = $request->input('track_code', 'PD');
                EventParticipant::firstOrCreate(
                    [
                        'event_id' => (int) $validated['event_id'],
                        'participant_id' => $participant->id,
                    ],
                    [
                        'track_code' => $trackCode,
                        'admin_status' => 'verified',
                        'attendance_status' => 'present',
                        'graduation_status' => 'in_training',
                    ]
                );
            }
        });

        return back()->with('success', 'Peserta berhasil ditambahkan.');
    }

    /**
     * Update the specified participant.
     */
    public function update(SaveParticipantRequest $request, Participant $participant): RedirectResponse
    {
        $validated = $request->validated();
        DB::transaction(function () use ($participant, $validated, $request): void {
            $participant->update($this->participantAttributes($validated));

            if (! empty($validated['event_id'])) {
                $trackCode = $request->input('track_code', 'PD');
                EventParticipant::firstOrCreate(
                    [
                        'event_id' => (int) $validated['event_id'],
                        'participant_id' => $participant->id,
                    ],
                    [
                        'track_code' => $trackCode,
                        'admin_status' => 'verified',
                        'attendance_status' => 'present',
                        'graduation_status' => 'in_training',
                    ]
                );
            }
        });

        return back()->with('success', 'Data peserta berhasil diperbarui.');
    }

    public function linkAccount(Participant $participant): RedirectResponse
    {
        if ($participant->user_id || ! $participant->email) {
            return back()->withErrors(['account' => 'Peserta ini sudah terhubung atau belum memiliki email.']);
        }

        $user = User::where('email', $participant->email)
            ->where('role', 'Peserta')
            ->whereDoesntHave('participants')
            ->first();

        if (! $user) {
            return back()->withErrors(['account' => 'Tidak ada akun Peserta yang tersedia dengan email yang sama.']);
        }

        $participant->update(['user_id' => $user->id]);

        return back()->with('success', 'Akun portal berhasil dihubungkan dengan peserta.');
    }

    /**
     * Delete the specified participant.
     */
    public function destroy(Participant $participant): RedirectResponse
    {
        $participant->delete();

        return redirect()->route('admin.master.peserta.index')
            ->with('success', 'Peserta berhasil dihapus.');
    }

    /**
     * Download CSV template for participant import.
     */
    public function downloadTemplate(): StreamedResponse
    {
        return response()->streamDownload(function (): void {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['kenshi_id', 'name', 'email', 'phone', 'dan_level', 'origin', 'dojo', 'track_code', 'admin_notes']);
            fputcsv($out, ['KNS-001234', 'Kenshi Pratama', 'kenshi.pratama@example.com', '08123456789', '2', 'DKI Jakarta', 'Dojo Cempaka Putih', 'PD', 'Peserta Pelatih Daerah']);
            fclose($out);
        }, 'format-peserta.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * Import participants from CSV.
     */
    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:10240'],
            'event_id' => ['nullable', 'integer', 'exists:events,id'],
            'track_code' => ['nullable', 'string', 'max:20'],
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');
        $targetEventId = $request->filled('event_id') ? (int) $request->input('event_id') : null;
        $defaultTrackCode = $request->input('track_code', 'PD');

        try {
            $headers = fgetcsv($handle, 0, ',', '"', '');
            if (! is_array($headers)) {
                return back()->withErrors(['file' => 'Berkas CSV kosong.']);
            }
            $headers = array_map(fn ($h) => trim(str_replace("\xEF\xBB\xBF", '', $h)), $headers);

            $count = 0;
            DB::transaction(function () use ($handle, $headers, &$count, $targetEventId, $defaultTrackCode): void {
                while (($values = fgetcsv($handle, 0, ',', '"', '')) !== false) {
                    if ($values === [null] || empty(array_filter($values))) {
                        continue;
                    }
                    $row = array_combine($headers, array_map('trim', $values));
                    if (! isset($row['name']) || empty($row['name']) || ! isset($row['email']) || empty($row['email'])) {
                        continue;
                    }

                    $danLevel = ! empty($row['dan_level']) ? (int) $row['dan_level'] : null;
                    $danRank = $danLevel ? "{$danLevel}-DAN" : null;

                    $user = User::where('email', $row['email'])
                        ->where('role', 'Peserta')
                        ->whereDoesntHave('participants')
                        ->first();

                    $participant = Participant::updateOrCreate(
                        ['email' => $row['email']],
                        [
                            'event_id' => $targetEventId,
                            'user_id' => $user?->id,
                            'name' => $row['name'],
                            'kenshi_id_number' => $row['kenshi_id'] ?? null,
                            'phone' => $row['phone'] ?? null,
                            'origin_province' => $row['origin'] ?? 'Indonesia',
                            'origin_dojo' => $row['dojo'] ?? null,
                            'dan_rank' => $danRank,
                            'notes' => $row['admin_notes'] ?? null,
                        ]
                    );

                    if ($targetEventId) {
                        $track = ! empty($row['track_code']) ? $row['track_code'] : $defaultTrackCode;
                        EventParticipant::firstOrCreate(
                            [
                                'event_id' => $targetEventId,
                                'participant_id' => $participant->id,
                            ],
                            [
                                'track_code' => $track,
                                'admin_status' => 'verified',
                                'attendance_status' => 'present',
                                'graduation_status' => 'in_training',
                            ]
                        );
                    }

                    $count++;
                }
            });

            $scopeLabel = $targetEventId ? 'khusus event' : 'Master Diktar';

            return back()->with('success', "{$count} data peserta {$scopeLabel} berhasil diimpor.");
        } finally {
            fclose($handle);
        }
    }

    /**
     * Export participants to CSV based on active filters.
     */
    public function export(Request $request): StreamedResponse
    {
        $query = Participant::query()->with(['event:id,title', 'latestEventParticipant.track']);

        if ($request->filled('q')) {
            $search = trim((string) $request->input('q'));
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('kenshi_id_number', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%")
                    ->orWhere('origin_province', 'ilike', "%{$search}%")
                    ->orWhere('origin_city', 'ilike', "%{$search}%")
                    ->orWhere('origin_dojo', 'ilike', "%{$search}%");
            });
        }
        if ($request->filled('origin')) {
            $originSearch = trim((string) $request->input('origin'));
            $query->where(function ($oq) use ($originSearch) {
                $oq->where('origin_province', 'ilike', "%{$originSearch}%")
                    ->orWhere('origin_city', 'ilike', "%{$originSearch}%")
                    ->orWhere('origin_dojo', 'ilike', "%{$originSearch}%");
            });
        }
        if ($request->filled('scope') && $request->input('scope') !== 'all') {
            $scope = $request->input('scope');
            if ($scope === 'master') {
                $query->whereNull('event_id');
            } elseif (is_numeric($scope)) {
                $query->where('event_id', (int) $scope);
            }
        }

        $participants = $query->orderBy('name')->get();

        return response()->streamDownload(function () use ($participants): void {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['No Kenshi', 'Nama Lengkap', 'Email', 'No Telepon', 'Tingkatan DAN', 'Asal Daerah', 'Dojo', 'Cakupan', 'Jalur Terakhir']);
            foreach ($participants as $p) {
                fputcsv($out, [
                    $p->kenshi_id ?? '-',
                    $p->name,
                    $p->email,
                    $p->phone ?? '-',
                    $p->dan_roman ?? '-',
                    $p->origin ?? '-',
                    $p->dojo ?? '-',
                    $p->event ? "Event: {$p->event->title}" : 'Master Diktar (Lintas Event)',
                    $p->latestEventParticipant?->track?->code ?? '-',
                ]);
            }
            fclose($out);
        }, 'master-peserta-'.date('Ymd-His').'.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function participantAttributes(array $validated): array
    {
        return [
            'event_id' => $validated['event_id'] ?? null,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'kenshi_id_number' => $validated['kenshi_id'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'origin_province' => $validated['origin'],
            'origin_dojo' => $validated['dojo'] ?? null,
            'dan_rank' => ! empty($validated['dan_level']) ? "{$validated['dan_level']}-DAN" : null,
            'notes' => $validated['admin_notes'] ?? null,
        ];
    }
}
