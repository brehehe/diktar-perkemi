<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\EventRegistrationForm;
use App\Models\Participant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventRegistrationFormController extends Controller
{
    /**
     * Determine form type and penataran level from track code.
     *
     * @return array{form_type: string, penataran_level: string, lampiran_label: string}
     */
    public static function resolveFormType(?string $trackCode, ?string $penataranLevel = null): array
    {
        $code = strtoupper((string) $trackCode);
        $level = strtolower((string) $penataranLevel);

        // Penguji: PED, PEN, PGJ, PENGUJI
        if (str_contains($code, 'PGJ') || str_contains($code, 'PENGUJI') || str_contains($code, 'PED') || str_contains($code, 'PEN')) {
            $isNas = $level === 'nasional' || str_contains($code, 'NAS') || str_contains($code, 'PEN');

            return [
                'form_type' => 'PENGUJI',
                'penataran_level' => $isNas ? 'Nasional' : 'Daerah',
                'lampiran_label' => $isNas ? 'LAMPIRAN-D' : 'LAMPIRAN-C',
                'waiver_lampiran_label' => 'LAMPIRAN-E',
                'photo_requirements' => '1. 2 Helai Pas Foto(3 x 4)',
            ];
        }

        // Wasit: WAD, WAN, WST, WASIT
        if (str_contains($code, 'WST') || str_contains($code, 'WASIT') || str_contains($code, 'WAD') || str_contains($code, 'WAN')) {
            $isNas = $level === 'nasional' || str_contains($code, 'NAS') || str_contains($code, 'WAN');

            return [
                'form_type' => 'WASIT',
                'penataran_level' => $isNas ? 'Nasional' : 'Daerah',
                'lampiran_label' => $isNas ? 'LAMPIRAN-B' : 'LAMPIRAN-A',
                'waiver_lampiran_label' => 'LAMPIRAN-C',
                'photo_requirements' => '1. 2 Helai Pas Foto (2 1/2 x 3), 2 Helai Pas Foto(3 x 4)',
            ];
        }

        // Pelatih: PD, PN, PLT, PELATIH (default)
        $isNas = $level === 'nasional' || str_contains($code, 'NAS') || str_contains($code, 'PN');

        return [
            'form_type' => 'PELATIH',
            'penataran_level' => $isNas ? 'Nasional' : 'Daerah',
            'lampiran_label' => $isNas ? 'LAMPIRAN-B' : 'LAMPIRAN-A',
            'waiver_lampiran_label' => 'LAMPIRAN-E',
            'photo_requirements' => '1. 2 Helai Pas Foto(3 x 4)',
        ];
    }

    /**
     * Display the participant's interactive registration form.
     */
    public function show(Request $request, string $slug): Response|RedirectResponse
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        $user = $request->user();

        $participant = $this->resolveParticipant($request, $event);

        if (! $participant && ! $user->isAdmin()) {
            abort(403, 'Anda belum terdaftar sebagai peserta pada kegiatan ini.');
        }

        if (! $participant) {
            abort(403, 'Data peserta tidak ditemukan.');
        }

        $enrollment = EventParticipant::with('track')
            ->where('event_id', $event->id)
            ->where('participant_id', $participant->id)
            ->first();

        // Fetch existing form or build prefilled state
        $existingForm = EventRegistrationForm::where('event_id', $event->id)
            ->where('participant_id', $participant->id)
            ->first();

        $resolved = self::resolveFormType(
            $existingForm?->form_type ?? $enrollment?->track_code,
            $existingForm?->penataran_level
        );

        // Extract extra SIM PERKEMI metadata if stored in notes/profile
        $notes = $participant->notes ?? '';
        $extraData = [];
        if (is_string($notes) && str_starts_with(trim($notes), '{')) {
            $extraData = json_decode($notes, true) ?? [];
        }

        $formData = $existingForm ? [
            'id' => $existingForm->id,
            'form_type' => $existingForm->form_type,
            'penataran_level' => $existingForm->penataran_level,
            'start_date' => $existingForm->start_date?->format('Y-m-d') ?? $event->start_date?->format('Y-m-d'),
            'end_date' => $existingForm->end_date?->format('Y-m-d') ?? $event->end_date?->format('Y-m-d'),
            'location' => $existingForm->location ?? $event->place,
            'full_name' => $existingForm->full_name,
            'birth_place' => $existingForm->birth_place,
            'birth_date' => $existingForm->birth_date?->format('Y-m-d'),
            'kenshi_id_number' => $existingForm->kenshi_id_number,
            'dan_level' => $existingForm->dan_level,
            'home_address' => $existingForm->home_address,
            'phone_number' => $existingForm->phone_number,
            'email' => $existingForm->email,
            'occupation' => $existingForm->occupation,
            'occupation_address' => $existingForm->occupation_address,
            'occupation_phone' => $existingForm->occupation_phone,
            'emergency_address' => $existingForm->emergency_address,
            'emergency_phone' => $existingForm->emergency_phone,
            'gasnas_records' => $existingForm->gasnas_records ?? [],
            'certificate_records' => $existingForm->certificate_records ?? [],
            'sign_place' => $existingForm->sign_place ?? 'Mojokerto',
            'sign_date' => $existingForm->sign_date?->format('Y-m-d') ?? now()->format('Y-m-d'),
            'applicant_name' => $existingForm->applicant_name ?? $existingForm->full_name,
            'signature_data' => $existingForm->signature_data,
            'file_path' => $existingForm->file_path,
            'file_url' => $existingForm->file_url,
            'original_file_name' => $existingForm->original_file_name,
            'file_size_formatted' => $existingForm->file_size_formatted,
            'submission_mode' => $existingForm->submission_mode ?? ($existingForm->file_path ? 'upload' : 'online'),
            'waiver_agreed' => (bool) $existingForm->waiver_agreed,
            'status' => $existingForm->status,
            'submitted_at' => $existingForm->submitted_at?->format('d M Y H:i'),
            'verified_at' => $existingForm->verified_at?->format('d M Y H:i'),
            'verified_by_name' => $existingForm->verifier?->name ?? ($existingForm->status === 'verified' ? 'Budi Santoso' : null),
            'photo_url' => $participant->photo_url,
        ] : [
            'id' => null,
            'form_type' => $resolved['form_type'],
            'penataran_level' => $resolved['penataran_level'],
            'start_date' => $event->start_date?->format('Y-m-d'),
            'end_date' => $event->end_date?->format('Y-m-d'),
            'location' => $event->place,
            'full_name' => $participant->name,
            'birth_place' => $participant->birth_place ?? $extraData['bio_birthplace'] ?? $participant->origin_city ?? '',
            'birth_date' => $participant->birth_date?->format('Y-m-d') ?? $extraData['bio_birthdate'] ?? '',
            'kenshi_id_number' => $participant->kenshi_id_number,
            'dan_level' => $participant->dan_rank ?? '1 DAN',
            'home_address' => $participant->address ?? $extraData['peserta_address'] ?? '',
            'phone_number' => $participant->phone ?? $extraData['peserta_phone'] ?? '',
            'email' => $participant->email,
            'occupation' => $participant->occupation ?? $extraData['peserta_pekerjaan'] ?? '',
            'occupation_address' => '',
            'occupation_phone' => $participant->occupation_phone ?? $extraData['peserta_telepon_pekerjaan'] ?? '',
            'emergency_address' => '',
            'emergency_phone' => '',
            'gasnas_records' => $extraData['peserta_gasnas_records'] ?? [],
            'certificate_records' => ! empty($participant->last_certificate) ? [
                [
                    'jenis' => $participant->last_certificate,
                    'nomor' => $participant->last_certificate_number ?? '',
                    'tanggal' => '2024-12-15',
                ],
            ] : (! empty($extraData['peserta_last_certificate']) ? [
                [
                    'jenis' => $extraData['peserta_last_certificate'],
                    'nomor' => $extraData['peserta_last_nocertificate'] ?? '',
                    'tanggal' => '2024-12-15',
                ],
            ] : []),
            'sign_place' => 'Mojokerto',
            'sign_date' => now()->format('Y-m-d'),
            'applicant_name' => $participant->name,
            'signature_data' => null,
            'file_path' => null,
            'file_url' => null,
            'original_file_name' => null,
            'file_size_formatted' => null,
            'submission_mode' => 'online',
            'waiver_agreed' => true,
            'status' => 'draft',
            'submitted_at' => null,
            'verified_at' => null,
            'verified_by_name' => null,
            'photo_url' => $participant->photo_url,
        ];

        return Inertia::render('Event/RegistrationForm', [
            'event' => [
                'id' => $event->id,
                'name' => $event->name,
                'slug' => $event->slug,
                'start_date' => $event->start_date?->format('d M Y'),
                'end_date' => $event->end_date?->format('d M Y'),
                'place' => $event->place,
                'organizer' => $event->organizer,
            ],
            'participant' => [
                'id' => $participant->id,
                'name' => $participant->name,
                'kenshi_id_number' => $participant->kenshi_id_number,
                'dojo' => $participant->origin_dojo,
                'city' => $participant->origin_city,
                'province' => $participant->origin_province,
                'photo_url' => $participant->photo_url,
                'track_name' => $enrollment?->track?->name ?? $enrollment?->track_code,
            ],
            'form' => $formData,
            'initialData' => $formData,
            'formTypeInfo' => $resolved,
            'lampiranLabel' => $resolved['lampiran_label'],
            'waiverLampiranLabel' => $resolved['waiver_lampiran_label'],
            'photoRequirements' => $resolved['photo_requirements'],
        ]);
    }

    /**
     * Store or update participant registration form.
     */
    public function store(Request $request, string $slug): RedirectResponse
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        $user = $request->user();

        $participant = $this->resolveParticipant($request, $event);

        if (! $participant) {
            abort(403, 'Data peserta tidak ditemukan.');
        }

        $enrollment = EventParticipant::where('event_id', $event->id)
            ->where('participant_id', $participant->id)
            ->first();

        $validated = $request->validate([
            'participant_id' => 'nullable|integer',
            'form_type' => 'required|string|in:PELATIH,PENGUJI,WASIT',
            'penataran_level' => 'required|string|in:Daerah,Nasional',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'location' => 'nullable|string|max:255',
            'full_name' => 'required|string|max:255',
            'birth_place' => 'required|string|max:100',
            'birth_date' => 'required|date',
            'kenshi_id_number' => 'required|string|max:50',
            'dan_level' => 'required|string|max:30',
            'home_address' => 'required|string|max:1000',
            'phone_number' => 'required|string|max:50',
            'email' => 'nullable|email|max:150',
            'occupation' => 'nullable|string|max:150',
            'occupation_address' => 'nullable|string|max:1000',
            'occupation_phone' => 'nullable|string|max:50',
            'emergency_address' => 'nullable|string|max:1000',
            'emergency_phone' => 'required|string|max:50',
            'gasnas_records' => 'nullable|array',
            'gasnas_records.*.nomor' => 'nullable|string|max:100',
            'gasnas_records.*.tanggal' => 'nullable|string|max:50',
            'certificate_records' => 'nullable|array',
            'certificate_records.*.jenis' => 'nullable|string|max:100',
            'certificate_records.*.nomor' => 'nullable|string|max:100',
            'certificate_records.*.tanggal' => 'nullable|string|max:50',
            'sign_place' => 'required|string|max:100',
            'sign_date' => 'required|date',
            'applicant_name' => 'required|string|max:255',
            'signature_data' => 'nullable|string',
            'waiver_agreed' => 'required|accepted',
        ], [
            'full_name.required' => 'Nama lengkap pemohon wajib diisi.',
            'kenshi_id_number.required' => 'Nomor Induk Kenshi (NIK) wajib diisi.',
            'dan_level.required' => 'Tingkatan DAN wajib diisi.',
            'birth_place.required' => 'Tempat lahir wajib diisi.',
            'birth_date.required' => 'Tanggal lahir wajib diisi.',
            'phone_number.required' => 'Nomor telepon / WhatsApp wajib diisi.',
            'home_address.required' => 'Alamat rumah tempat tinggal wajib diisi.',
            'emergency_phone.required' => 'Nomor kontak darurat wajib diisi demi keselamatan kegiatan.',
            'sign_place.required' => 'Kota penandatanganan wajib diisi.',
            'sign_date.required' => 'Tanggal penandatanganan wajib diisi.',
            'applicant_name.required' => 'Nama pemohon penandatangan wajib diisi.',
            'waiver_agreed.required' => 'Anda wajib menyetujui Surat Pernyataan dan Pembebasan.',
            'waiver_agreed.accepted' => 'Anda wajib mencentang persetujuan Surat Pernyataan dan Pembebasan sebelum menyimpan formulir.',
        ]);

        $filteredGasnas = array_values(array_filter($validated['gasnas_records'] ?? [], function ($item) {
            return ! empty($item['nomor']) || ! empty($item['tanggal']);
        }));

        $filteredCertificates = array_values(array_filter($validated['certificate_records'] ?? [], function ($item) {
            return ! empty($item['jenis']) || ! empty($item['nomor']) || ! empty($item['tanggal']);
        }));

        // Generate clean cursive signature SVG if participant did not draw on canvas
        $signatureData = $validated['signature_data'] ?? null;
        if (empty($signatureData)) {
            $name = $validated['applicant_name'] ?? $validated['full_name'] ?? $participant->name;
            $escaped = htmlspecialchars((string) $name);
            $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="80"><text x="10" y="48" font-family="Brush Script MT, cursive, sans-serif" font-size="28" font-style="italic" fill="#0E2747">'.$escaped.'</text></svg>';
            $signatureData = 'data:image/svg+xml;base64,'.base64_encode($svg);
        }

        $formValues = [
            'event_participant_id' => $enrollment?->id,
            'form_type' => $validated['form_type'],
            'penataran_level' => $validated['penataran_level'],
            'start_date' => $validated['start_date'] ?? $event->start_date,
            'end_date' => $validated['end_date'] ?? $event->end_date,
            'location' => $validated['location'] ?? $event->place,
            'full_name' => $validated['full_name'],
            'birth_place' => $validated['birth_place'] ?? null,
            'birth_date' => $validated['birth_date'] ?? null,
            'kenshi_id_number' => $validated['kenshi_id_number'],
            'dan_level' => $validated['dan_level'] ?? null,
            'home_address' => $validated['home_address'] ?? null,
            'phone_number' => $validated['phone_number'] ?? null,
            'email' => $validated['email'] ?? null,
            'occupation' => $validated['occupation'] ?? null,
            'occupation_address' => $validated['occupation_address'] ?? null,
            'occupation_phone' => $validated['occupation_phone'] ?? null,
            'emergency_address' => $validated['emergency_address'] ?? null,
            'emergency_phone' => $validated['emergency_phone'] ?? null,
            'gasnas_records' => $filteredGasnas,
            'certificate_records' => $filteredCertificates,
            'sign_place' => $validated['sign_place'] ?? 'Mojokerto',
            'sign_date' => $validated['sign_date'] ?? now()->format('Y-m-d'),
            'applicant_name' => $validated['applicant_name'] ?? $validated['full_name'],
            'signature_data' => $signatureData,
            'waiver_agreed' => true,
            'waiver_signed_at' => now(),
            'status' => 'submitted',
            'submitted_at' => now(),
        ];

        if ($request->hasFile('file')) {
            $uploadedFile = $request->file('file');
            $cleanName = preg_replace('/[^a-zA-Z0-9_\.-]/', '_', $uploadedFile->getClientOriginalName());
            $fileName = 'form_'.time().'_'.$participant->id.'_'.$cleanName;
            $formValues['file_path'] = $uploadedFile->storeAs('registration_forms', $fileName, 'public');
            $formValues['original_file_name'] = $uploadedFile->getClientOriginalName();
            $formValues['file_size'] = $uploadedFile->getSize();
            $formValues['submission_mode'] = 'both';
        }

        $form = EventRegistrationForm::updateOrCreate(
            [
                'event_id' => $event->id,
                'participant_id' => $participant->id,
            ],
            $formValues
        );

        // Synchronize telephone and email to participant record if updated
        if (! empty($validated['phone_number']) && empty($participant->phone)) {
            $participant->update(['phone' => $validated['phone_number']]);
        }

        if ($user->isAdmin() && $request->filled('participant_id')) {
            return redirect()->route('admin.event.show', ['event' => $event->id, 'tab' => 'formulir'])
                ->with('success', 'Formulir pendaftaran untuk kenshi '.$participant->name.' berhasil disimpan oleh Admin.');
        }

        return redirect()->route('event.registration-form', $event->slug)
            ->with('success', 'Formulir pendaftaran dan surat pernyataan berhasil disimpan dan diserahkan.');
    }

    /**
     * Upload registration form file (PDF/Docx/Scan) for participant or by admin.
     */
    public function upload(Request $request, string $slug): RedirectResponse
    {
        $event = Event::where('slug', $slug)
            ->orWhere('id', is_numeric($slug) ? (int) $slug : null)
            ->firstOrFail();

        $user = $request->user();
        $participantId = $request->input('participant_id');

        $participant = $this->resolveParticipant($request, $event, $participantId ? (int) $participantId : null);

        if (! $participant) {
            abort(403, 'Data peserta tidak ditemukan.');
        }

        $request->validate([
            'file' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
            'form_type' => 'nullable|string|in:PELATIH,PENGUJI,WASIT',
            'penataran_level' => 'nullable|string|in:Daerah,Nasional',
            'verified' => 'nullable|boolean',
            'auto_verify' => 'nullable|boolean',
            'notes' => 'nullable|string|max:500',
        ], [
            'file.required' => 'File formulir pendaftaran wajib dipilih.',
            'file.mimes' => 'Format file yang didukung: PDF, DOC, DOCX, JPG, JPEG, atau PNG.',
            'file.max' => 'Ukuran file maksimal 10 MB.',
        ]);

        $enrollment = EventParticipant::where('event_id', $event->id)
            ->where('participant_id', $participant->id)
            ->first();

        $resolved = self::resolveFormType(
            $request->input('form_type') ?? $enrollment?->track_code,
            $request->input('penataran_level')
        );

        $uploadedFile = $request->file('file');
        $cleanOriginalName = preg_replace('/[^a-zA-Z0-9_\.-]/', '_', $uploadedFile->getClientOriginalName());
        $fileName = 'form_'.time().'_'.$participant->id.'_'.$cleanOriginalName;
        $storedPath = $uploadedFile->storeAs('registration_forms', $fileName, 'public');

        $isVerified = $user->isAdmin() && ($request->boolean('verified') || $request->boolean('auto_verify'));

        EventRegistrationForm::updateOrCreate(
            [
                'event_id' => $event->id,
                'participant_id' => $participant->id,
            ],
            [
                'event_participant_id' => $enrollment?->id,
                'form_type' => $request->input('form_type') ?? $resolved['form_type'],
                'penataran_level' => $request->input('penataran_level') ?? $resolved['penataran_level'],
                'start_date' => $event->start_date,
                'end_date' => $event->end_date,
                'location' => $event->place,
                'full_name' => $participant->name,
                'kenshi_id_number' => $participant->kenshi_id_number,
                'dan_level' => $participant->dan_rank ?? '1 DAN',
                'home_address' => $participant->origin_city ?? '-',
                'phone_number' => $participant->phone ?? '-',
                'emergency_phone' => $participant->emergency_contact_phone ?? $participant->phone ?? '-',
                'sign_place' => 'Mojokerto',
                'sign_date' => now()->format('Y-m-d'),
                'applicant_name' => $participant->name,
                'file_path' => $storedPath,
                'original_file_name' => $uploadedFile->getClientOriginalName(),
                'file_size' => $uploadedFile->getSize(),
                'submission_mode' => 'upload',
                'waiver_agreed' => true,
                'waiver_signed_at' => now(),
                'status' => $isVerified ? 'verified' : 'submitted',
                'submitted_at' => now(),
                'verified_at' => $isVerified ? now() : null,
                'verified_by' => $isVerified ? $user->id : null,
                'admin_notes' => $request->input('notes'),
            ]
        );

        $msg = $isVerified
            ? "Berkas formulir untuk {$participant->name} berhasil diunggah dan langsung diverifikasi."
            : 'Berkas formulir pendaftaran berhasil diunggah.';

        if ($user->isAdmin() && $request->filled('participant_id')) {
            return redirect()->route('admin.event.show', ['event' => $event->id, 'tab' => 'formulir'])
                ->with('success', $msg);
        }

        return back()->with('success', $msg);
    }

    /**
     * Show official printable/formatted registration form and waiver document.
     */
    public function print(Request $request, string $slug, ?int $participantId = null): Response
    {
        $event = Event::where('slug', $slug)->firstOrFail();
        $user = $request->user();

        $participant = $this->resolveParticipant($request, $event, $participantId);

        if (! $participant) {
            abort(403, 'Data peserta tidak ditemukan.');
        }

        $enrollment = EventParticipant::with('track')
            ->where('event_id', $event->id)
            ->where('participant_id', $participant->id)
            ->first();

        $form = EventRegistrationForm::with('verifier')
            ->where('event_id', $event->id)
            ->where('participant_id', $participant->id)
            ->first();

        $resolved = self::resolveFormType(
            $form?->form_type ?? $enrollment?->track_code,
            $form?->penataran_level
        );

        $notes = $participant->notes ?? '';
        $extraData = [];
        if (is_string($notes) && str_starts_with(trim($notes), '{')) {
            $extraData = json_decode($notes, true) ?? [];
        }

        $formData = $form ? [
            'id' => $form->id,
            'form_type' => $form->form_type,
            'penataran_level' => $form->penataran_level,
            'start_date' => $form->start_date?->format('d F Y') ?? $event->start_date?->format('d F Y'),
            'end_date' => $form->end_date?->format('d F Y') ?? $event->end_date?->format('d F Y'),
            'location' => $form->location ?? $event->place,
            'full_name' => $form->full_name,
            'birth_place' => $form->birth_place,
            'birth_date' => $form->birth_date?->format('d F Y'),
            'kenshi_id_number' => $form->kenshi_id_number,
            'dan_level' => $form->dan_level,
            'home_address' => $form->home_address,
            'phone_number' => $form->phone_number,
            'email' => $form->email,
            'occupation' => $form->occupation,
            'occupation_address' => $form->occupation_address,
            'occupation_phone' => $form->occupation_phone,
            'emergency_address' => $form->emergency_address,
            'emergency_phone' => $form->emergency_phone,
            'gasnas_records' => $form->gasnas_records ?? [],
            'certificate_records' => $form->certificate_records ?? [],
            'sign_place' => $form->sign_place ?? 'Mojokerto',
            'sign_date' => $form->sign_date?->format('d F Y') ?? now()->format('d F Y'),
            'applicant_name' => $form->applicant_name ?? $form->full_name,
            'signature_data' => $form->signature_data,
            'waiver_agreed' => (bool) $form->waiver_agreed,
            'status' => $form->status,
            'submitted_at' => $form->submitted_at?->format('d M Y H:i'),
            'verified_at' => $form->verified_at?->format('d M Y H:i'),
            'verified_by_name' => $form->verifier?->name ?? ($form->status === 'verified' ? 'Budi Santoso' : null),
            'photo_url' => $participant->photo_url,
        ] : [
            'id' => null,
            'form_type' => $resolved['form_type'],
            'penataran_level' => $resolved['penataran_level'],
            'start_date' => $event->start_date?->format('d F Y'),
            'end_date' => $event->end_date?->format('d F Y'),
            'location' => $event->place,
            'full_name' => $participant->name,
            'birth_place' => $extraData['bio_birthplace'] ?? $participant->origin_city ?? '',
            'birth_date' => $extraData['bio_birthdate'] ?? '',
            'kenshi_id_number' => $participant->kenshi_id_number,
            'dan_level' => $participant->dan_rank ?? '1 DAN',
            'home_address' => $extraData['peserta_address'] ?? '',
            'phone_number' => $participant->phone ?? $extraData['peserta_phone'] ?? '',
            'email' => $participant->email,
            'occupation' => $extraData['peserta_pekerjaan'] ?? '',
            'occupation_address' => '',
            'occupation_phone' => $extraData['peserta_telepon_pekerjaan'] ?? '',
            'emergency_address' => '',
            'emergency_phone' => '',
            'gasnas_records' => [],
            'certificate_records' => [],
            'sign_place' => 'Mojokerto',
            'sign_date' => now()->format('d F Y'),
            'applicant_name' => $participant->name,
            'signature_data' => null,
            'waiver_agreed' => true,
            'status' => 'draft',
            'submitted_at' => null,
            'verified_at' => null,
            'verified_by_name' => null,
            'photo_url' => $participant->photo_url,
        ];

        return Inertia::render('Event/PrintRegistrationForm', [
            'event' => [
                'id' => $event->id,
                'name' => $event->name,
                'slug' => $event->slug,
                'start_date' => $event->start_date?->format('d F Y'),
                'end_date' => $event->end_date?->format('d F Y'),
                'place' => $event->place,
                'organizer' => $event->organizer,
            ],
            'participant' => [
                'id' => $participant->id,
                'name' => $participant->name,
                'kenshi_id_number' => $participant->kenshi_id_number,
                'dojo' => $participant->origin_dojo,
                'city' => $participant->origin_city,
                'province' => $participant->origin_province,
                'photo_url' => $participant->photo_url,
                'track_name' => $enrollment?->track?->name ?? $enrollment?->track_code,
            ],
            'form' => $formData,
            'lampiranLabel' => $resolved['lampiran_label'],
            'waiverLampiranLabel' => $resolved['waiver_lampiran_label'],
            'photoRequirements' => $resolved['photo_requirements'],
            'canEdit' => $user->id === $participant->user_id,
        ]);
    }

    /**
     * Admin action: verify submitted registration form.
     */
    public function verify(Request $request, Event $event, EventRegistrationForm $form): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $form->update([
            'status' => 'verified',
            'verified_at' => now(),
            'verified_by' => $request->user()->id,
            'admin_notes' => $request->input('admin_notes'),
        ]);

        return back()->with('success', "Formulir pendaftaran untuk {$form->full_name} berhasil diverifikasi.");
    }

    /**
     * Resolve participant for event registration form workflows.
     */
    private function resolveParticipant(Request $request, Event $event, ?int $participantId = null): ?Participant
    {
        $user = $request->user();

        if ($participantId && $user->isAdmin()) {
            return Participant::find($participantId);
        }

        if ($user->isAdmin() && $request->filled('participant_id')) {
            $p = Participant::find($request->input('participant_id'));
            if ($p) {
                return $p;
            }
        }

        $participant = Participant::where('user_id', $user->id)
            ->whereHas('eventParticipants', fn ($q) => $q->where('event_id', $event->id))
            ->first()
            ?? Participant::where('user_id', $user->id)->first()
            ?? Participant::where('email', $user->email)
                ->whereHas('eventParticipants', fn ($q) => $q->where('event_id', $event->id))
                ->first()
            ?? Participant::where('email', $user->email)->first();

        if (! $participant && $user->isAdmin()) {
            $participant = Participant::whereHas('eventParticipants', fn ($q) => $q->where('event_id', $event->id))->first()
                ?? Participant::first();
        }

        return $participant;
    }

    /**
     * Ensure the user is an admin.
     */
    private function authorizeAdmin(Request $request): void
    {
        if (! $request->user() || ! $request->user()->isAdmin()) {
            abort(403, 'Akses khusus administrator.');
        }
    }
}
