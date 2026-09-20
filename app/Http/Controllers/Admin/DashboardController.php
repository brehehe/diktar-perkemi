<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\CbtExamAttempt;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Material;
use App\Models\Participant;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the administrative overview dashboard.
     */
    public function index(): Response|RedirectResponse
    {
        $participant = Participant::where('user_id', auth()->id())->first();
        if ($participant) {
            $activeAttempt = CbtExamAttempt::query()
                ->with(['package', 'event'])
                ->where('participant_id', $participant->id)
                ->where('status', 'in_progress')
                ->first();

            if ($activeAttempt && $activeAttempt->package && $activeAttempt->event && ! $activeAttempt->hasExpired($activeAttempt->package)) {
                return redirect()->route('event.cbt.exam', [$activeAttempt->event->slug, $activeAttempt->package->code]);
            }
        }

        if (! auth()->user()->isAdmin()) {
            $events = Event::query()->when(
                auth()->user()->role === 'Penyelenggara',
                fn ($query) => $query->where('responsible_user_id', auth()->id())
            );

            $eventStats = (clone $events)->selectRaw(
                "COUNT(*) as total_events,
                 SUM(CASE WHEN status IN ('ongoing', 'open_registration') THEN 1 ELSE 0 END) as active_events",
            )->firstOrFail();

            return Inertia::render('Admin/EventDashboard', [
                'role' => auth()->user()->role,
                'stats' => [
                    'events' => (int) $eventStats->total_events,
                    'active_events' => (int) $eventStats->active_events,
                    'participants' => EventParticipant::whereIn('event_id', (clone $events)->select('id'))->count(),
                ],
                'events' => (clone $events)->withCount([
                    'sessions as sessions_count' => fn ($query) => $query->whereNotIn('session_type_code', ['KEHADIRAN_AWAL', 'KEHADIRAN_HARIAN']),
                    'eventParticipants',
                ])
                    ->orderByDesc('start_date')->limit(8)->get()
                    ->map(fn (Event $event) => [
                        'id' => $event->id,
                        'name' => $event->name,
                        'date_formatted' => $event->date_formatted,
                        'place' => $event->place,
                        'status_label' => $event->status_label,
                        'sessions_count' => $event->sessions_count,
                        'participants_count' => $event->event_participants_count,
                    ]),
            ]);
        }

        $materialStats = Material::query()->selectRaw(
            "COUNT(*) as total_materials,
             SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published_materials,
             SUM(CASE WHEN status IN ('review', 'draft') THEN 1 ELSE 0 END) as review_materials",
        )->firstOrFail();
        $totalUsers = User::count();

        $pendingReviews = Material::whereIn('status', ['review', 'draft'])
            ->with(['categories', 'creator'])
            ->latest('updated_at')
            ->take(5)
            ->get()
            ->map(fn (Material $m) => [
                'id' => $m->id,
                'title' => $m->title,
                'code' => $m->code,
                'status' => $m->status,
                'status_label' => $m->status_label,
                'type' => $m->type,
                'type_label' => $m->type_label,
                'category' => $m->categories->first() ? [
                    'id' => $m->categories->first()->id,
                    'name' => $m->categories->first()->name,
                    'color' => $m->categories->first()->color,
                ] : null,
                'updated_at' => $m->updated_at?->diffForHumans() ?? '-',
            ]);

        $recentActivities = ActivityLog::with('actor')
            ->latest('created_at')
            ->take(6)
            ->get()
            ->map(fn (ActivityLog $a) => [
                'id' => $a->id,
                'event' => $a->event,
                'description' => $a->description,
                'created_at' => $a->created_at?->diffForHumans() ?? '-',
                'actor' => $a->actor ? [
                    'id' => $a->actor->id,
                    'name' => $a->actor->name,
                    'role' => $a->actor->role,
                ] : null,
            ]);

        $recentMaterials = Material::with('categories')
            ->latest('updated_at')
            ->take(6)
            ->get()
            ->map(fn (Material $m) => [
                'id' => $m->id,
                'title' => $m->title,
                'code' => $m->code,
                'type' => $m->type,
                'type_label' => $m->type_label,
                'status' => $m->status,
                'status_label' => $m->status_label,
                'categories' => $m->categories->map(fn ($c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                    'color' => $c->color,
                ]),
                'updated_at' => $m->updated_at?->format('d M Y') ?? '-',
            ]);

        $categoryDistribution = Category::withCount('materials')
            ->orderByDesc('materials_count')
            ->take(6)
            ->get()
            ->map(fn (Category $c) => [
                'id' => $c->id,
                'name' => $c->name,
                'color' => $c->color,
                'materials_count' => $c->materials_count,
            ]);

        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'total_materials' => (int) $materialStats->total_materials,
                'published_materials' => (int) $materialStats->published_materials,
                'review_materials' => (int) $materialStats->review_materials,
                'total_users' => $totalUsers,
            ],
            'pending_reviews' => $pendingReviews,
            'recent_activities' => $recentActivities,
            'recent_materials' => $recentMaterials,
            'category_distribution' => $categoryDistribution,
        ]);
    }
}
