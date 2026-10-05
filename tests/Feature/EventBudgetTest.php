<?php

use App\Models\Event;
use App\Models\EventBudget;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->event = Event::create([
        'title' => 'Penataran Pelatih PERKEMI 2026',
        'slug' => 'penataran-pelatih-perkemi-2026',
        'start_date' => '2026-10-10',
        'end_date' => '2026-10-14',
        'location' => 'Surabaya, Jawa Timur',
        'organizer' => 'Pengprov PERKEMI Jawa Timur',
        'status' => 'ongoing',
    ]);

    $this->admin = User::factory()->create(['role' => 'Admin']);
    $this->bendahara = User::factory()->create(['role' => 'Bendahara']);
    $this->peserta = User::factory()->create(['role' => 'Peserta']);
});

test('admin and bendahara can see rab tab and data on event show page', function () {
    EventBudget::create([
        'event_id' => $this->event->id,
        'created_by' => $this->admin->id,
        'type' => 'income',
        'category' => 'registration',
        'item_name' => 'Kontribusi Peserta 50 Orang',
        'quantity' => 50,
        'unit' => 'orang',
        'unit_price' => 1500000,
        'amount' => 75000000,
        'notes' => '50 kenshi x 1.5jt',
    ]);

    EventBudget::create([
        'event_id' => $this->event->id,
        'created_by' => $this->admin->id,
        'type' => 'expense',
        'category' => 'consumption',
        'item_name' => 'Makan & Snack',
        'quantity' => 200,
        'unit' => 'pax',
        'unit_price' => 50000,
        'amount' => 10000000,
        'notes' => 'Konsumsi 4 hari',
    ]);

    $this->actingAs($this->admin)
        ->get(route('admin.event.show', ['event' => $this->event->id, 'tab' => 'rab']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Events/Show')
            ->has('budgets', 2)
            ->where('stats.total_budgets', 2)
            ->where('rabAnalysis.total_income', 75000000)
            ->where('rabAnalysis.total_expense', 10000000)
            ->where('rabAnalysis.planned_balance', 65000000)
            ->where('rabAnalysis.is_surplus', true));
});

test('user can store a new budget item with auto computed amount', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.event.rab.store', $this->event), [
            'type' => 'expense',
            'category' => 'venue',
            'item_name' => 'Sewa Gedung Dojang & Matras',
            'quantity' => 4,
            'unit' => 'hari',
            'unit_price' => 3500000,
            'notes' => '4 hari sewa gelanggang',
        ])
        ->assertRedirect(route('admin.event.show', ['event' => $this->event->id, 'tab' => 'rab']))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('event_budgets', [
        'event_id' => $this->event->id,
        'type' => 'expense',
        'category' => 'venue',
        'item_name' => 'Sewa Gedung Dojang & Matras',
        'quantity' => 4,
        'unit' => 'hari',
        'unit_price' => 3500000,
        'amount' => 14000000,
    ]);
});

test('user can update an existing budget item', function () {
    $budget = EventBudget::create([
        'event_id' => $this->event->id,
        'created_by' => $this->admin->id,
        'type' => 'expense',
        'category' => 'printing',
        'item_name' => 'Cetak Sertifikat Awal',
        'quantity' => 50,
        'unit' => 'lembar',
        'unit_price' => 20000,
        'amount' => 1000000,
    ]);

    $this->actingAs($this->admin)
        ->put(route('admin.event.rab.update', ['event' => $this->event->id, 'budget' => $budget->id]), [
            'type' => 'expense',
            'category' => 'printing',
            'item_name' => 'Cetak Sertifikat & Transkrip Revisi',
            'quantity' => 60,
            'unit' => 'paket',
            'unit_price' => 25000,
            'notes' => 'Revisi tambahan 10 paket',
        ])
        ->assertRedirect(route('admin.event.show', ['event' => $this->event->id, 'tab' => 'rab']))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('event_budgets', [
        'id' => $budget->id,
        'item_name' => 'Cetak Sertifikat & Transkrip Revisi',
        'quantity' => 60,
        'unit_price' => 25000,
        'amount' => 1500000,
    ]);
});

test('user can delete a budget item', function () {
    $budget = EventBudget::create([
        'event_id' => $this->event->id,
        'created_by' => $this->admin->id,
        'type' => 'income',
        'category' => 'sponsorship',
        'item_name' => 'Sponsor Batal',
        'quantity' => 1,
        'unit' => 'paket',
        'unit_price' => 5000000,
        'amount' => 5000000,
    ]);

    $this->actingAs($this->admin)
        ->delete(route('admin.event.rab.destroy', ['event' => $this->event->id, 'budget' => $budget->id]))
        ->assertRedirect(route('admin.event.show', ['event' => $this->event->id, 'tab' => 'rab']))
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('event_budgets', [
        'id' => $budget->id,
    ]);
});

test('validation rejects invalid budget item submission', function () {
    $this->actingAs($this->admin)
        ->post(route('admin.event.rab.store', $this->event), [
            'type' => 'invalid_type',
            'item_name' => '',
            'unit_price' => -100,
        ])
        ->assertSessionHasErrors(['type', 'category', 'item_name', 'quantity', 'unit_price']);
});

test('user can open printable rab page', function () {
    EventBudget::create([
        'event_id' => $this->event->id,
        'created_by' => $this->admin->id,
        'type' => 'income',
        'category' => 'registration',
        'item_name' => 'Kontribusi Peserta',
        'quantity' => 50,
        'unit' => 'orang',
        'unit_price' => 1500000,
        'amount' => 75000000,
    ]);

    $this->actingAs($this->admin)
        ->get(route('admin.event.rab.print', $this->event))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Events/PrintRab')
            ->where('event.name', $this->event->name)
            ->has('incomes', 1)
            ->where('summary.total_income', 75000000));
});

test('user can export rab to excel', function () {
    EventBudget::create([
        'event_id' => $this->event->id,
        'created_by' => $this->admin->id,
        'type' => 'expense',
        'category' => 'consumption',
        'item_name' => 'Makan Siang',
        'quantity' => 100,
        'unit' => 'pax',
        'unit_price' => 30000,
        'amount' => 3000000,
    ]);

    $response = $this->actingAs($this->admin)
        ->get(route('admin.event.rab.export', $this->event));

    $response->assertOk();
    expect($response->headers->get('content-disposition'))->toContain('.xlsx');
});
