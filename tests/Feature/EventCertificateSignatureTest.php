<?php

use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\User;
use App\Services\EventDocumentGenerator;
use Database\Seeders\EventManagementSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(EventManagementSeeder::class);
    $this->event = Event::firstOrFail();
    $this->admin = User::factory()->create([
        'role' => 'Admin',
    ]);
});

test('admin can view certificate signature settings on event show page', function () {
    $this->actingAs($this->admin)
        ->get("/admin/event/{$this->event->id}?tab=sertifikat")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Events/Show')
            ->has('certificateSignatureSettings')
            ->has('certificateSignatureDefaults')
            ->where('certificateSignatureSettings.city', 'Jakarta')
        );
});

test('admin can update certificate signature settings including uploading digital signature', function () {
    Storage::fake('public');

    $file = UploadedFile::fake()->image('signature.png', 300, 100);

    $this->actingAs($this->admin)
        ->post("/admin/event/{$this->event->id}/pengaturan-ttd", [
            'city' => 'Surabaya',
            'date' => '2026-09-27',
            'organization' => 'Pengprov PERKEMI Jawa Timur',
            'position' => 'Ketua Umum Pengprov,',
            'signer_name' => 'Sensei Bambang Suryono',
            'signature_image' => $file,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->event->refresh();

    expect($this->event->certificate_signature_settings)->not->toBeNull()
        ->and($this->event->certificate_signature_settings['city'])->toBe('Surabaya')
        ->and($this->event->certificate_signature_settings['date'])->toBe('2026-09-27')
        ->and($this->event->certificate_signature_settings['organization'])->toBe('Pengprov PERKEMI Jawa Timur')
        ->and($this->event->certificate_signature_settings['position'])->toBe('Ketua Umum Pengprov,')
        ->and($this->event->certificate_signature_settings['signer_name'])->toBe('Sensei Bambang Suryono')
        ->and($this->event->certificate_signature_settings['signature_path'])->not->toBeEmpty();

    Storage::disk('public')->assertExists($this->event->certificate_signature_settings['signature_path']);
});

test('admin can update certificate signature settings using direct drawn signature data', function () {
    Storage::fake('public');

    // Create 1x1 transparent png base64 data URL
    $fakeBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

    $this->actingAs($this->admin)
        ->post("/admin/event/{$this->event->id}/pengaturan-ttd", [
            'city' => 'Surabaya',
            'date' => '2026-09-27',
            'organization' => 'Pengurus Besar PERKEMI',
            'position' => 'Ketua Umum,',
            'signer_name' => 'Sensei Bambang Suryono',
            'signature_data' => $fakeBase64,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->event->refresh();

    expect($this->event->certificate_signature_settings)->not->toBeNull()
        ->and($this->event->certificate_signature_settings['signature_path'])->not->toBeEmpty();

    Storage::disk('public')->assertExists($this->event->certificate_signature_settings['signature_path']);
});

test('admin can delete digital signature image', function () {
    Storage::fake('public');

    $fakePath = 'event-signatures/'.$this->event->id.'/sample.png';
    Storage::disk('public')->put($fakePath, 'fake-content');

    $this->event->update([
        'certificate_signature_settings' => [
            'city' => 'Surabaya',
            'signature_path' => $fakePath,
        ],
    ]);

    $this->actingAs($this->admin)
        ->delete("/admin/event/{$this->event->id}/pengaturan-ttd/signature")
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->event->refresh();

    expect($this->event->certificate_signature_settings)->not->toHaveKey('signature_path');
    Storage::disk('public')->assertMissing($fakePath);
});

test('generated certificate includes Tempat/Tanggal Lahir, 3-year validity, and signature settings', function () {
    Storage::fake('local');
    Storage::fake('public');

    $this->event->update([
        'certificate_signature_settings' => [
            'city' => 'Surabaya',
            'date' => '2026-09-27',
            'organization' => 'Pengurus Besar PERKEMI',
            'position' => 'Ketua Umum,',
            'signer_name' => 'Laksdya TNI (Purn) Prof. Dr. Agus Setiadji, S.A.P., M.A.',
        ],
    ]);

    $enrollment = EventParticipant::firstOrFail();
    $enrollment->update(['track_code' => 'PED']);
    $enrollment->participant->update([
        'birth_place' => 'Surabaya',
        'birth_date' => '1996-06-05',
    ]);

    $generator = app(EventDocumentGenerator::class);
    $pdf = $generator->generateCertificate($enrollment, 'SK-PED-JTM-2026-001', 'PED');

    expect($pdf)
        ->toStartWith('%PDF-1.4')
        ->toContain('SK-PED-JTM-2026-001')
        ->toContain('Surabaya, 5 Juni 1996')
        ->toContain('27 September')
        ->toContain('Surabaya, 27 September 2026')
        ->toContain('Pengurus Besar PERKEMI')
        ->toContain('Ketua Umum,')
        ->toContain('Agus Setiadji');
});
