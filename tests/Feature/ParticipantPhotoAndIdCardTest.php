<?php

use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Participant;
use App\Models\User;
use Database\Seeders\Jatim2026PenataranSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(Jatim2026PenataranSeeder::class);
    $this->event = Event::where('slug', Jatim2026PenataranSeeder::EVENT_SLUG)->firstOrFail();
    $this->admin = User::factory()->create(['role' => 'Admin']);
});

test('admin can upload photo in master peserta and it syncs to linked user and photo_url', function () {
    Storage::fake('public');

    $participant = Participant::where('name', 'like', '%Victor Leonard%')->firstOrFail();
    $user = $participant->user;
    expect($user)->not->toBeNull();

    $photoFile = UploadedFile::fake()->image('kenshi_avatar.jpg', 400, 500);

    $response = $this->actingAs($this->admin)->post("/admin/master/peserta/{$participant->id}", [
        'name' => $participant->name,
        'email' => $participant->email,
        'kenshi_id' => $participant->kenshi_id,
        'dan_level' => $participant->dan_level,
        'origin' => $participant->origin,
        'phone' => $participant->phone,
        'photo' => $photoFile,
    ]);

    $response->assertSessionHasNoErrors();

    $participant->refresh();
    $user->refresh();

    expect($participant->photo_path)->not->toBeNull();
    Storage::disk('public')->assertExists($participant->photo_path);
    expect($participant->photo_url)->toContain('/storage/'.$participant->photo_path);
    expect($user->avatar_path)->toBe($participant->photo_path);
    expect($user->avatar_url)->toBe($participant->photo_url);
});

test('admin can update participant photo from event peserta tab', function () {
    Storage::fake('public');

    $participant = Participant::where('name', 'like', '%Victor Leonard%')->firstOrFail();
    $ep = EventParticipant::where('event_id', $this->event->id)
        ->where('participant_id', $participant->id)->firstOrFail();
    $user = $participant->user;
    expect($user)->not->toBeNull();

    $photoFile = UploadedFile::fake()->image('event_kenshi.png', 300, 400);

    $response = $this->actingAs($this->admin)->post("/admin/event/{$this->event->id}/peserta/{$ep->id}", [
        'track_id' => $ep->track_id,
        'rotation_group' => $ep->rotation_group,
        'admin_status' => $ep->admin_status,
        'photo' => $photoFile,
    ]);

    $response->assertSessionHasNoErrors();

    $participant->refresh();
    $user->refresh();

    expect($participant->photo_path)->not->toBeNull();
    Storage::disk('public')->assertExists($participant->photo_path);
    expect($user->avatar_path)->toBe($participant->photo_path);
});

test('registration form print includes participant photo_url', function () {
    $participant = Participant::where('name', 'like', '%Victor Leonard%')->firstOrFail();
    $participant->update(['photo_path' => 'participants/sample-test.jpg']);
    $user = $participant->user;

    $response = $this->actingAs($user)->get(route('event.registration-form.print', [
        'slug' => $this->event->slug,
        'participantId' => $participant->id,
    ]));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Event/PrintRegistrationForm')
        ->has('participant')
        ->where('participant.photo_url', $participant->photo_url)
    );
});

test('admin can print single and batch ID cards with photo and QR code', function () {
    $ep = EventParticipant::where('event_id', $this->event->id)->firstOrFail();

    // Single ID Card
    $singleResponse = $this->actingAs($this->admin)
        ->get("/admin/event/{$this->event->id}/peserta/{$ep->id}/id-card");

    $singleResponse->assertOk();
    $singleResponse->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Events/PrintIdCard')
        ->has('event')
        ->has('cards', 1)
        ->where('cards.0.id', $ep->id)
        ->has('cards.0.qr_svg')
    );

    // Batch ID Cards
    $batchResponse = $this->actingAs($this->admin)
        ->get("/admin/event/{$this->event->id}/id-card-semua");

    $batchResponse->assertOk();
    $batchResponse->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Events/PrintIdCard')
        ->has('event')
        ->has('cards')
    );
});

test('authenticated participant can access their own event ID card', function () {
    $participant = Participant::where('name', 'like', '%Victor Leonard%')->firstOrFail();
    $user = $participant->user;

    $response = $this->actingAs($user)
        ->get("/event/{$this->event->slug}/id-card");

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Admin/Events/PrintIdCard')
        ->has('event')
        ->has('cards', 1)
        ->where('cards.0.name', $participant->name)
        ->has('cards.0.qr_svg')
    );
});
