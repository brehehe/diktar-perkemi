<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventIntegrityPact;
use App\Models\EventParticipant;
use App\Models\EventRegistrationForm;
use App\Models\Participant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class EventIntegrityPactController extends Controller
{
    protected function resolveEvent(Event|string $event): Event
    {
        return $event instanceof Event ? $event : Event::where('slug', $event)->firstOrFail();
    }

    public function show(Request $request, Event|string $event): Response|RedirectResponse
    {
        $event = $this->resolveEvent($event);
        $user = Auth::user();
        if (! $user) {
            return redirect()->route('login');
        }

        $participant = null;
        $isOrganizerOrAdmin = in_array($user->role, ['Admin', 'Penyelenggara', 'Super Admin'], true);

        if ($request->has('participant_id') && $isOrganizerOrAdmin) {
            $participant = Participant::find($request->query('participant_id'));
        }

        if (! $participant) {
            $participant = Participant::where('user_id', $user->id)->first();
        }

        if (! $participant) {
            // Cek apakah email user cocok dengan peserta
            $participant = Participant::where('email', $user->email)->first();
        }

        if (! $participant) {
            return redirect()->route('event.learning', $event->slug)
                ->with('error', 'Data profil peserta Anda tidak ditemukan.');
        }

        $enrollment = EventParticipant::with('track')
            ->where('event_id', $event->id)
            ->where('participant_id', $participant->id)
            ->first();

        $existingPact = EventIntegrityPact::where('event_id', $event->id)
            ->where('participant_id', $participant->id)
            ->first();

        $existingForm = EventRegistrationForm::where('event_id', $event->id)
            ->where('participant_id', $participant->id)
            ->first();

        $trackCode = $enrollment?->track_code ?? 'PD';
        $defaultPactType = self::resolvePactType($trackCode);

        $pactData = $existingPact ? [
            'id' => $existingPact->id,
            'pact_type' => $existingPact->pact_type,
            'track_code' => $existingPact->track_code ?? $trackCode,
            'full_name' => $existingPact->full_name,
            'birth_place' => $existingPact->birth_place,
            'birth_date' => $existingPact->birth_date?->format('Y-m-d'),
            'kenshi_id_number' => $existingPact->kenshi_id_number,
            'dan_level' => $existingPact->dan_level,
            'religion' => $existingPact->religion ?? 'Islam',
            'dojo' => $existingPact->dojo,
            'city' => $existingPact->city,
            'province' => $existingPact->province,
            'certificate_number' => $existingPact->certificate_number,
            'valid_start_date' => $existingPact->valid_start_date?->format('Y-m-d'),
            'valid_end_date' => $existingPact->valid_end_date?->format('Y-m-d'),
            'id_card_address' => $existingPact->id_card_address,
            'current_address' => $existingPact->current_address,
            'management_organization' => $existingPact->management_organization ?? '-',
            'management_position' => $existingPact->management_position ?? '-',
            'sign_place' => $existingPact->sign_place ?? 'Mojokerto',
            'sign_date' => $existingPact->sign_date?->format('Y-m-d') ?? now()->format('Y-m-d'),
            'signature_data' => $existingPact->signature_data,
            'file_path' => $existingPact->file_path,
            'file_url' => $existingPact->file_url,
            'original_file_name' => $existingPact->original_file_name,
            'file_size_formatted' => $existingPact->file_size_formatted,
            'submission_mode' => $existingPact->submission_mode ?? ($existingPact->file_path ? 'upload' : 'online'),
            'signed_at' => $existingPact->signed_at?->format('d M Y H:i'),
            'status' => $existingPact->status,
        ] : [
            'id' => null,
            'pact_type' => $defaultPactType,
            'track_code' => $trackCode,
            'full_name' => $participant->name,
            'birth_place' => $participant->birth_place ?? $existingForm?->birth_place ?? $participant->origin_city ?? '',
            'birth_date' => $participant->birth_date?->format('Y-m-d') ?? $existingForm?->birth_date?->format('Y-m-d') ?? '',
            'kenshi_id_number' => $participant->kenshi_id_number,
            'dan_level' => $participant->dan_rank ?? $existingForm?->dan_level ?? '1 DAN',
            'religion' => 'Islam',
            'dojo' => $participant->origin_dojo ?? '',
            'city' => $participant->origin_city ?? '',
            'province' => $participant->origin_province ?? 'Jawa Timur',
            'certificate_number' => $enrollment?->certificate_number ?? $participant->last_certificate_number ?? '',
            'valid_start_date' => $event->end_date?->format('Y-m-d') ?? now()->format('Y-m-d'),
            'valid_end_date' => ($event->end_date ? $event->end_date->copy()->addYears(4)->format('Y-m-d') : now()->addYears(4)->format('Y-m-d')),
            'id_card_address' => $participant->address ?? $existingForm?->home_address ?? '',
            'current_address' => $participant->address ?? $existingForm?->home_address ?? '',
            'management_organization' => '-',
            'management_position' => '-',
            'sign_place' => 'Mojokerto',
            'sign_date' => now()->format('Y-m-d'),
            'signature_data' => $existingForm?->signature_data, // Otomatis bawa tanda tangan dari form pendaftaran jika ada
            'file_path' => null,
            'file_url' => null,
            'original_file_name' => null,
            'file_size_formatted' => null,
            'submission_mode' => 'online',
            'signed_at' => null,
            'status' => 'draft',
        ];

        return Inertia::render('Event/IntegrityPactForm', [
            'event' => [
                'id' => $event->id,
                'name' => $event->name,
                'slug' => $event->slug,
                'start_date' => $event->start_date?->format('d M Y'),
                'end_date' => $event->end_date?->format('d M Y'),
                'place' => $event->place,
            ],
            'participant' => [
                'id' => $participant->id,
                'name' => $participant->name,
                'kenshi_id_number' => $participant->kenshi_id_number,
                'dan_rank' => $participant->dan_rank,
                'track_code' => $trackCode,
                'track_name' => $enrollment?->track?->name ?? 'Penataran',
                'graduation_status' => $enrollment?->graduation_status ?? 'in_training',
                'certificate_number' => $enrollment?->certificate_number,
            ],
            'pact' => $pactData,
            'pledgePoints' => (new EventIntegrityPact(['pact_type' => $pactData['pact_type']]))->getPledgePoints(),
            'isOrganizerOrAdmin' => $isOrganizerOrAdmin,
        ]);
    }

    public function store(Request $request, Event|string $event): RedirectResponse
    {
        $event = $this->resolveEvent($event);
        $user = Auth::user();
        if (! $user) {
            return redirect()->route('login');
        }

        $participant = Participant::where('user_id', $user->id)->first();
        $isOrganizerOrAdmin = in_array($user->role, ['Admin', 'Penyelenggara', 'Super Admin'], true);

        if ($request->has('participant_id') && $isOrganizerOrAdmin) {
            $participant = Participant::find($request->input('participant_id')) ?? $participant;
        }

        if (! $participant) {
            return back()->withErrors(['error' => 'Peserta tidak ditemukan.']);
        }

        $validated = $request->validate([
            'pact_type' => ['required', 'string', 'in:pelatih,penguji,wasit'],
            'full_name' => ['required', 'string', 'max:255'],
            'birth_place' => ['required', 'string', 'max:255'],
            'birth_date' => ['required', 'date'],
            'kenshi_id_number' => ['required', 'string', 'max:50'],
            'dan_level' => ['required', 'string', 'max:50'],
            'religion' => ['required', 'string', 'max:50'],
            'dojo' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'province' => ['required', 'string', 'max:255'],
            'certificate_number' => ['nullable', 'string', 'max:100'],
            'valid_start_date' => ['nullable', 'date'],
            'valid_end_date' => ['nullable', 'date', 'after_or_equal:valid_start_date'],
            'id_card_address' => ['required', 'string', 'max:1000'],
            'current_address' => ['nullable', 'string', 'max:1000'],
            'management_organization' => ['nullable', 'string', 'max:255'],
            'management_position' => ['nullable', 'string', 'max:255'],
            'sign_place' => ['required', 'string', 'max:100'],
            'sign_date' => ['required', 'date'],
            'signature_data' => ['required', 'string', 'starts_with:data:image/'],
            'agree_pledge' => ['accepted'],
        ], [
            'signature_data.required' => 'Tanda tangan digital wajib digambar pada kotak tanda tangan.',
            'signature_data.starts_with' => 'Format tanda tangan digital tidak valid.',
            'agree_pledge.accepted' => 'Anda wajib menyetujui butir komitmen Pakta Integritas PB PERKEMI.',
            'birth_date.required' => 'Tanggal lahir wajib diisi.',
            'birth_place.required' => 'Tempat lahir wajib diisi.',
            'id_card_address.required' => 'Alamat KTP wajib diisi.',
        ]);

        $enrollment = EventParticipant::where('event_id', $event->id)
            ->where('participant_id', $participant->id)
            ->first();

        $pact = EventIntegrityPact::updateOrCreate(
            [
                'event_id' => $event->id,
                'participant_id' => $participant->id,
                'pact_type' => $validated['pact_type'],
            ],
            [
                'event_participant_id' => $enrollment?->id,
                'track_code' => $enrollment?->track_code ?? 'PD',
                'full_name' => $validated['full_name'],
                'birth_place' => $validated['birth_place'],
                'birth_date' => $validated['birth_date'],
                'kenshi_id_number' => $validated['kenshi_id_number'],
                'dan_level' => $validated['dan_level'],
                'religion' => $validated['religion'],
                'dojo' => $validated['dojo'],
                'city' => $validated['city'],
                'province' => $validated['province'],
                'certificate_number' => $validated['certificate_number'] ?: ($enrollment?->certificate_number ?? null),
                'valid_start_date' => $validated['valid_start_date'] ?: ($event->end_date ?? now()),
                'valid_end_date' => $validated['valid_end_date'] ?: ($event->end_date ? Carbon::parse($event->end_date)->addYears(4) : now()->addYears(4)),
                'id_card_address' => $validated['id_card_address'],
                'current_address' => $validated['current_address'] ?: $validated['id_card_address'],
                'management_organization' => $validated['management_organization'] ?? '-',
                'management_position' => $validated['management_position'] ?? '-',
                'sign_place' => $validated['sign_place'],
                'sign_date' => $validated['sign_date'],
                'signature_data' => $validated['signature_data'],
                'signed_at' => now(),
                'status' => 'signed',
            ]
        );

        // Update profil peserta jika belum lengkap
        $participantUpdates = [];
        if (! $participant->birth_date) {
            $participantUpdates['birth_date'] = $validated['birth_date'];
        }
        if (! $participant->birth_place) {
            $participantUpdates['birth_place'] = $validated['birth_place'];
        }
        if (! $participant->address) {
            $participantUpdates['address'] = $validated['id_card_address'];
        }
        if (! empty($participantUpdates)) {
            $participant->update($participantUpdates);
        }

        return redirect()->route('event.integrity-pact', $event->slug)
            ->with('success', 'Pakta Integritas berhasil ditandatangani secara digital.');
    }

    /**
     * Upload physical signed integrity pact file (PDF/Scan/Photo) for participant or admin.
     */
    public function upload(Request $request, Event|string $event): RedirectResponse
    {
        $event = $this->resolveEvent($event);
        $user = $request->user();
        if (! $user) {
            return redirect()->route('login');
        }

        $participantId = $request->input('participant_id');
        $participant = null;
        $isOrganizerOrAdmin = in_array($user->role, ['Admin', 'Penyelenggara', 'Super Admin'], true);

        if ($participantId && $isOrganizerOrAdmin) {
            $participant = Participant::find((int) $participantId);
        }

        if (! $participant) {
            $participant = Participant::where('user_id', $user->id)->first()
                ?? Participant::where('email', $user->email)->first();
        }

        if (! $participant) {
            return back()->withErrors(['error' => 'Peserta tidak ditemukan.']);
        }

        $request->validate([
            'file' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
            'pact_type' => 'nullable|string|in:pelatih,penguji,wasit',
            'verified' => 'nullable|boolean',
            'auto_verify' => 'nullable|boolean',
            'notes' => 'nullable|string|max:500',
        ], [
            'file.required' => 'File pakta integritas wajib dipilih.',
            'file.mimes' => 'Format file yang didukung: PDF, DOC, DOCX, JPG, JPEG, atau PNG.',
            'file.max' => 'Ukuran file maksimal 10 MB.',
        ]);

        $enrollment = EventParticipant::where('event_id', $event->id)
            ->where('participant_id', $participant->id)
            ->first();

        $trackCode = $enrollment?->track_code ?? 'PD';
        $pactType = $request->input('pact_type') ?? self::resolvePactType($trackCode);

        $uploadedFile = $request->file('file');
        $cleanOriginalName = preg_replace('/[^a-zA-Z0-9_\.-]/', '_', $uploadedFile->getClientOriginalName());
        $fileName = 'pact_'.time().'_'.$participant->id.'_'.$cleanOriginalName;
        $storedPath = $uploadedFile->storeAs('integrity_pacts', $fileName, 'public');

        $isVerified = $isOrganizerOrAdmin && ($request->boolean('verified') || $request->boolean('auto_verify'));

        EventIntegrityPact::updateOrCreate(
            [
                'event_id' => $event->id,
                'participant_id' => $participant->id,
            ],
            [
                'event_participant_id' => $enrollment?->id,
                'pact_type' => $pactType,
                'track_code' => $trackCode,
                'full_name' => $participant->name,
                'birth_place' => $participant->birth_place ?? $participant->origin_city,
                'birth_date' => $participant->birth_date,
                'kenshi_id_number' => $participant->kenshi_id_number,
                'dan_level' => $participant->dan_rank ?? '1 DAN',
                'religion' => 'Islam',
                'dojo' => $participant->origin_dojo ?? '-',
                'city' => $participant->origin_city ?? '-',
                'province' => $participant->origin_province ?? 'Jawa Timur',
                'certificate_number' => $enrollment?->certificate_number ?? $participant->last_certificate_number ?? null,
                'valid_start_date' => $event->end_date ?? now(),
                'valid_end_date' => $event->end_date ? Carbon::parse($event->end_date)->addYears(4) : now()->addYears(4),
                'id_card_address' => $participant->address ?? '-',
                'current_address' => $participant->address ?? '-',
                'sign_place' => 'Mojokerto',
                'sign_date' => now()->format('Y-m-d'),
                'file_path' => $storedPath,
                'original_file_name' => $uploadedFile->getClientOriginalName(),
                'file_size' => $uploadedFile->getSize(),
                'submission_mode' => 'upload',
                'status' => $isVerified ? 'verified' : 'signed',
                'signed_at' => now(),
                'verified_at' => $isVerified ? now() : null,
                'verified_by' => $isVerified ? $user->id : null,
                'admin_notes' => $request->input('notes'),
            ]
        );

        $msg = $isVerified
            ? "Berkas Pakta Integritas untuk {$participant->name} berhasil diunggah dan langsung diverifikasi."
            : 'Berkas Pakta Integritas fisik berhasil diunggah.';

        return back()->with('success', $msg);
    }

    /**
     * Verify an integrity pact by admin.
     */
    public function verify(Request $request, Event|string $event, EventIntegrityPact $pact): RedirectResponse
    {
        $user = $request->user();
        if (! $user || ! in_array($user->role, ['Admin', 'Penyelenggara', 'Super Admin'], true)) {
            abort(403, 'Akses tidak diizinkan.');
        }

        $pact->update([
            'status' => 'verified',
            'verified_at' => now(),
            'verified_by' => $user->id,
            'admin_notes' => $request->input('admin_notes'),
        ]);

        return back()->with('success', "Pakta Integritas untuk {$pact->full_name} berhasil diverifikasi.");
    }

    public function print(Request $request, Event|string $event, ?Participant $participant = null): Response|RedirectResponse
    {
        $event = $this->resolveEvent($event);
        $user = Auth::user();
        if (! $user) {
            return redirect()->route('login');
        }

        $targetParticipant = $participant;
        $isOrganizerOrAdmin = in_array($user->role, ['Admin', 'Penyelenggara', 'Super Admin'], true);

        if (! $targetParticipant && $request->has('participant_id') && $isOrganizerOrAdmin) {
            $targetParticipant = Participant::find($request->query('participant_id'));
        }

        if (! $targetParticipant) {
            $targetParticipant = Participant::where('user_id', $user->id)->first();
        }

        if (! $targetParticipant) {
            return redirect()->route('event.learning', $event->slug)
                ->with('error', 'Peserta tidak ditemukan.');
        }

        $pact = EventIntegrityPact::where('event_id', $event->id)
            ->where('participant_id', $targetParticipant->id)
            ->first();

        $enrollment = EventParticipant::with('track')
            ->where('event_id', $event->id)
            ->where('participant_id', $targetParticipant->id)
            ->first();

        $trackCode = $enrollment?->track_code ?? 'PD';
        $pactType = $pact?->pact_type ?? self::resolvePactType($trackCode);

        $pactInstance = $pact ?? new EventIntegrityPact([
            'pact_type' => $pactType,
            'full_name' => $targetParticipant->name,
            'birth_place' => $targetParticipant->birth_place ?? $targetParticipant->origin_city,
            'birth_date' => $targetParticipant->birth_date,
            'kenshi_id_number' => $targetParticipant->kenshi_id_number,
            'certificate_number' => $enrollment?->certificate_number ?? '-',
            'valid_start_date' => $event->end_date ?? now(),
            'valid_end_date' => $event->end_date ? Carbon::parse($event->end_date)->addYears(4) : now()->addYears(4),
            'id_card_address' => $targetParticipant->address ?? '-',
            'current_address' => $targetParticipant->address ?? '-',
            'dan_level' => $targetParticipant->dan_rank ?? '1 DAN',
            'religion' => 'Islam',
            'dojo' => $targetParticipant->origin_dojo ?? '-',
            'city' => $targetParticipant->origin_city ?? '-',
            'province' => $targetParticipant->origin_province ?? 'Jawa Timur',
            'management_organization' => '-',
            'management_position' => '-',
            'sign_place' => 'Mojokerto',
            'sign_date' => now(),
            'signature_data' => null,
            'signed_at' => null,
            'status' => 'draft',
        ]);

        return Inertia::render('Event/PrintIntegrityPact', [
            'event' => [
                'id' => $event->id,
                'name' => $event->name,
                'slug' => $event->slug,
                'start_date' => $event->start_date?->format('d M Y'),
                'end_date' => $event->end_date?->format('d M Y'),
                'place' => $event->place,
            ],
            'participant' => [
                'id' => $targetParticipant->id,
                'name' => $targetParticipant->name,
                'kenshi_id_number' => $targetParticipant->kenshi_id_number,
                'dan_rank' => $targetParticipant->dan_rank,
                'track_code' => $trackCode,
                'track_name' => $enrollment?->track?->name ?? 'Penataran',
            ],
            'pact' => [
                'id' => $pactInstance->id,
                'pact_type' => $pactInstance->pact_type,
                'pact_title' => $pactInstance->pact_title,
                'role_label' => $pactInstance->role_label,
                'full_name' => $pactInstance->full_name,
                'birth_place' => $pactInstance->birth_place,
                'birth_date' => $pactInstance->birth_date?->format('d F Y') ?? ($pactInstance->birth_date ? Carbon::parse($pactInstance->birth_date)->locale('id')->isoFormat('D MMMM Y') : '-'),
                'kenshi_id_number' => $pactInstance->kenshi_id_number,
                'certificate_number' => $pactInstance->certificate_number ?? '-',
                'valid_start_date' => $pactInstance->valid_start_date?->format('d F Y') ?? '-',
                'valid_end_date' => $pactInstance->valid_end_date?->format('d F Y') ?? '-',
                'id_card_address' => $pactInstance->id_card_address,
                'current_address' => $pactInstance->current_address,
                'dan_level' => $pactInstance->dan_level,
                'religion' => $pactInstance->religion ?? 'Islam',
                'dojo' => $pactInstance->dojo,
                'city' => $pactInstance->city,
                'province' => $pactInstance->province,
                'management_organization' => $pactInstance->management_organization ?? '-',
                'management_position' => $pactInstance->management_position ?? '-',
                'sign_place' => $pactInstance->sign_place ?? 'Mojokerto',
                'sign_date' => $pactInstance->sign_date ? Carbon::parse($pactInstance->sign_date)->locale('id')->isoFormat('D MMMM Y') : now()->locale('id')->isoFormat('D MMMM Y'),
                'signature_data' => $pactInstance->signature_data,
                'signed_at' => $pactInstance->signed_at?->format('d M Y H:i'),
                'status' => $pactInstance->status,
            ],
            'pledgePoints' => $pactInstance->getPledgePoints(),
        ]);
    }

    public static function resolvePactType(?string $code): string
    {
        $code = strtoupper(trim((string) $code));

        if (in_array($code, ['PED', 'PEN', 'PENGUJI'], true) || str_contains($code, 'PENGUJI')) {
            return 'penguji';
        }

        if (in_array($code, ['WAD', 'WAN', 'WASIT'], true) || str_contains($code, 'WASIT')) {
            return 'wasit';
        }

        return 'pelatih';
    }
}
