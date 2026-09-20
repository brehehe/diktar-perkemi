<?php

use App\Models\CbtExamAttempt;
use App\Models\CbtExamPackage;
use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\QuestionBank;
use App\Models\User;
use Database\Seeders\FullCbtEventSeptember2026Seeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('full September CBT seeder builds the complete two day event scenario', function () {
    $this->seed(FullCbtEventSeptember2026Seeder::class);

    $event = Event::where('slug', 'penataran-cbt-terpadu-september-2026')->firstOrFail();
    $pretest = CbtExamPackage::where('code', 'CBT-SEP26-PRE')->firstOrFail();
    $finalExam = CbtExamPackage::where('code', 'CBT-SEP26-FINAL')->firstOrFail();
    $sharedQuestion = QuestionBank::where('code', 'QB-SEP26-001')->firstOrFail();

    expect($event->start_date->toDateString())->toBe('2026-09-19')
        ->and($event->end_date->toDateString())->toBe('2026-09-20')
        ->and($event->responsibleUser?->role)->toBe('Penyelenggara')
        ->and($event->rooms()->count())->toBe(3)
        ->and($event->modules()->count())->toBe(3)
        ->and($event->learningModules()->count())->toBe(2)
        ->and($event->sessions()->whereNotIn('session_type_code', ['KEHADIRAN_AWAL', 'KEHADIRAN_HARIAN'])->count())->toBe(6)
        ->and($event->sessions()->where('session_type_code', 'KEHADIRAN_HARIAN')->count())->toBe(2)
        ->and($event->eventParticipants()->count())->toBe(12)
        ->and($event->cbtPackages()->count())->toBe(2)
        ->and($pretest->bankQuestions()->count())->toBe(5)
        ->and($finalExam->bankQuestions()->count())->toBe(10)
        ->and($sharedQuestion->questionModules()->count())->toBe(2)
        ->and(CbtExamAttempt::where('cbt_exam_package_id', $pretest->id)->count())->toBe(8)
        ->and(EventAttendance::where('event_id', $event->id)->count())->toBe(0)
        ->and($event->eventParticipants()->whereNotNull('checked_in_at')->count())->toBe(0)
        ->and($event->eventParticipants()->where('checkin_status', '!=', 'registered')->count())->toBe(0)
        ->and($event->sessions()->where('is_attendance_open', true)->whereNotNull('attendance_close_at')->count())->toBe(0)
        ->and(EventAttendance::where('event_id', $event->id)->whereHas('session', fn ($query) => $query->whereDate('date', '2026-09-20'))->count())->toBe(0)
        ->and(User::where('email', 'admin@perkemi.id')->value('role'))->toBe('Admin')
        ->and(User::where('email', 'diktar.sep2026@perkemi.id')->value('role'))->toBe('Diktar')
        ->and(User::where('email', 'penyelenggara.sep2026@perkemi.id')->value('role'))->toBe('Penyelenggara')
        ->and(User::where('email', 'peserta.sep26.01@perkemi.test')->value('role'))->toBe('Peserta');
});

test('full September CBT seeder is idempotent and visible in admin event pages', function () {
    $this->seed(FullCbtEventSeptember2026Seeder::class);
    $this->seed(FullCbtEventSeptember2026Seeder::class);

    $event = Event::where('slug', 'penataran-cbt-terpadu-september-2026')->firstOrFail();
    $admin = User::where('email', 'admin@perkemi.id')->firstOrFail();

    expect(Event::where('slug', $event->slug)->count())->toBe(1)
        ->and($event->eventParticipants()->count())->toBe(12)
        ->and($event->sessions()->count())->toBe(9)
        ->and($event->attendances()->count())->toBe(0)
        ->and($event->eventParticipants()->whereNotNull('checked_in_at')->count())->toBe(0);

    $this->actingAs($admin)->get('/admin/event')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Events/Index')
            ->where('events.data', fn ($events) => collect($events)->contains('slug', $event->slug))
        );

    $this->actingAs($admin)->get("/admin/event/{$event->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Events/Show')
            ->where('event.start_date', '2026-09-19')
            ->where('event.end_date', '2026-09-20')
            ->where('stats.total_participants', 12)
            ->where('stats.total_modules', 3)
            ->where('stats.total_sessions', 6)
            ->where('stats.cbt_packages_count', 2)
            ->where('stats.cbt_attempts_count', 8)
            ->has('sessionsByDay', 2)
            ->has('participants', 12)
            ->has('rooms', 3)
        );
});
