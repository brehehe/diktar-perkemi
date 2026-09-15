<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityController extends Controller
{
    /**
     * Display a listing of system activity logs.
     */
    public function index(Request $request): Response
    {
        $query = ActivityLog::query()->with('actor')->latest('created_at');

        if ($request->filled('event')) {
            $query->where('event', $request->input('event'));
        }

        if ($request->filled('actor_id')) {
            $query->where('actor_id', (int) $request->input('actor_id'));
        }

        $activities = $query->paginate(15)->withQueryString()->through(fn (ActivityLog $a) => [
            'id' => $a->id,
            'event' => $a->event,
            'description' => $a->description,
            'properties' => $a->properties,
            'created_at' => $a->created_at?->format('d M Y, H:i:s') ?? '-',
            'created_at_relative' => $a->created_at?->diffForHumans() ?? '-',
            'actor' => $a->actor ? [
                'id' => $a->actor->id,
                'name' => $a->actor->name,
                'role' => $a->actor->role,
            ] : null,
        ]);

        $actors = User::whereIn('id', ActivityLog::select('actor_id')->distinct())
            ->get(['id', 'name', 'role'])
            ->map(fn ($user) => [
                'id' => $user->id,
                'label' => $user->name.' ('.$user->role.')',
            ]);

        $distinctEvents = ActivityLog::select('event')
            ->distinct()
            ->pluck('event')
            ->map(fn ($event) => [
                'value' => $event,
                'label' => $event,
            ]);

        return Inertia::render('Admin/Activities/Index', [
            'activities' => $activities,
            'actors' => $actors,
            'events' => $distinctEvents,
            'filters' => [
                'event' => $request->input('event', ''),
                'actor_id' => $request->input('actor_id', ''),
            ],
        ]);
    }
}
