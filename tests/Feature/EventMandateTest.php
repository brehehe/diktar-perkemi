<?php

use App\Models\Event;
use App\Models\EventMandate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['app.is_prodas' => true]);

    $this->admin = User::factory()->create(['role' => 'Admin']);
    $this->event = Event::query()->create([
        'title' => 'UKT Pengujian Mandat',
        'slug' => 'ukt-pengujian-mandat',
        'description' => 'Event untuk pengujian fitur mandat.',
        'start_date' => '2026-10-03',
        'end_date' => '2026-10-04',
        'location' => 'Surabaya',
        'organizer' => 'PERKEMI',
        'duration_text' => '2 hari',
        'total_effective_jp' => 8,
        'total_schedule_jp' => 10,
        'jp_duration_minutes' => 45,
        'learning_method' => 'Gashuku dan UKT',
        'quota' => 100,
        'status' => 'ongoing',
        'event_type' => 'ukt',
        'responsible_user_id' => $this->admin->id,
    ]);
});

test('event detail exposes mandate information in Prodas mode', function () {
    EventMandate::factory()->create([
        'event_id' => $this->event->id,
        'letter_number' => '109/MDT-PB/X/2026',
        'participant_total' => 65,
        'document_path' => null,
    ]);

    $response = $this->actingAs($this->admin)->get("/admin/event/{$this->event->id}?tab=mandat");

    $response->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Events/Show')
        ->where('mandate.letter_number', '109/MDT-PB/X/2026')
        ->where('mandate.participant_total', 65)
        ->where('mandate.can_update', true)
    );
});

test('admin can save mandate information and upload a private PDF proof', function () {
    Storage::fake('local');

    $response = $this->actingAs($this->admin)->post("/admin/event/{$this->event->id}/mandat", [
        '_method' => 'put',
        'letter_number' => '109/MDT-PB/X/2026',
        'title' => 'Surat Mandat Penguji Pemantapan Teknik & UKT',
        'event_name' => 'Pemantapan Teknik dan UKT Surabaya 2026',
        'source_references' => ['Surat Pengprov Jawa Timur No. 049/JATIM-KU/IX/2026'],
        'issued_place' => 'Jakarta',
        'issued_at' => '2026-10-02',
        'valid_from' => '2026-10-03',
        'valid_until' => '2026-10-04',
        'venue' => 'Lapangan Futsal UBAYA Sport Center',
        'address' => 'Jl. Kaliwaru I No. 31, Surabaya',
        'province' => 'Jawa Timur',
        'exam_scope' => 'Ujian Kenaikan Tingkat menuju KYU VIII sampai KYU II.',
        'participant_total' => 65,
        'examiners' => [
            ['name' => 'Y. Bernard Laisina', 'rank' => 'DAN V'],
        ],
        'provisions' => ['Memenuhi ketentuan administrasi dan teknis ujian.'],
        'participant_summary' => [
            ['level' => 'KYU 8', 'count' => 3],
        ],
        'home_assignments' => [
            ['level' => 'KYU 8', 'questions' => ['Kenapa Anda ingin mempelajari Shorinji Kempo?']],
        ],
        'signatory_name' => 'Prof. Dr. Agus Setiadji',
        'signatory_title' => 'Pengurus Besar PERKEMI',
        'document' => UploadedFile::fake()->createWithContent('mandat-surabaya.pdf', "%PDF-1.4\nmandat pengujian"),
    ]);

    $response->assertRedirect()->assertSessionHasNoErrors();
    $mandate = EventMandate::query()->whereBelongsTo($this->event)->firstOrFail();
    expect($mandate->letter_number)->toBe('109/MDT-PB/X/2026')
        ->and($mandate->participant_total)->toBe(65)
        ->and($mandate->document_disk)->toBe('local')
        ->and($mandate->uploaded_by)->toBe($this->admin->id);
    Storage::disk('local')->assertExists($mandate->document_path);
});

test('mandate proof must be a PDF document', function () {
    Storage::fake('local');

    $response = $this->actingAs($this->admin)->post("/admin/event/{$this->event->id}/mandat", [
        '_method' => 'put',
        'letter_number' => '109/MDT-PB/X/2026',
        'title' => 'Surat Mandat',
        'document' => UploadedFile::fake()->create('mandat.txt', 10, 'text/plain'),
    ]);

    $response->assertSessionHasErrors('document');
    expect(EventMandate::query()->whereBelongsTo($this->event)->exists())->toBeFalse();
    Storage::disk('local')->assertMissing("event-mandates/{$this->event->id}/mandat.txt");
});

test('mandate endpoints are unavailable outside Prodas mode', function () {
    config(['app.is_prodas' => false]);

    $this->actingAs($this->admin)
        ->put("/admin/event/{$this->event->id}/mandat", [
            'letter_number' => '109/MDT-PB/X/2026',
            'title' => 'Surat Mandat',
        ])
        ->assertNotFound();

    $this->actingAs($this->admin)
        ->get("/admin/event/{$this->event->id}/mandat/dokumen")
        ->assertNotFound();

    $this->actingAs($this->admin)
        ->get("/admin/event/{$this->event->id}?tab=mandat")
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Events/Show')
            ->where('mandate', null)
        );

    expect(EventMandate::query()->whereBelongsTo($this->event)->exists())->toBeFalse();
});

test('authorized users can view the seeded mandate PDF through the protected route', function () {
    EventMandate::factory()->create([
        'event_id' => $this->event->id,
        'document_disk' => 'public_path',
        'document_path' => 'pdf/109 MANDAT JATIM - KOTA SURABAYA, 03-04 OKT 2026.pdf',
        'document_original_name' => '109 MANDAT JATIM - KOTA SURABAYA, 03-04 OKT 2026.pdf',
        'document_mime' => 'application/pdf',
    ]);

    $response = $this->actingAs($this->admin)->get("/admin/event/{$this->event->id}/mandat/dokumen");

    $response->assertOk()->assertHeader('content-type', 'application/pdf');
});
