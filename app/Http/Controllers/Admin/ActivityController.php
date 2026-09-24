<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ActivityController extends Controller
{
    /**
     * Display a listing of system activity logs with search and advanced filters.
     */
    public function index(Request $request): Response
    {
        $query = ActivityLog::query()->with('actor')->latest('created_at');

        // Search keyword across event, actor name/email, ip address, and JSON properties
        if ($request->filled('q')) {
            $search = trim((string) $request->input('q'));
            $isPgsql = DB::connection()->getDriverName() === 'pgsql';
            $operator = $isPgsql ? 'ilike' : 'like';

            $query->where(function ($q) use ($search, $operator, $isPgsql) {
                $q->where('event', $operator, "%{$search}%")
                    ->orWhere('ip_address', $operator, "%{$search}%")
                    ->orWhereHas('actor', fn ($aq) => $aq->where('name', $operator, "%{$search}%")->orWhere('email', $operator, "%{$search}%"));

                if ($isPgsql) {
                    $q->orWhereRaw('CAST(properties AS TEXT) ILIKE ?', ["%{$search}%"]);
                } else {
                    $q->orWhereRaw('CAST(properties AS TEXT) LIKE ?', ["%{$search}%"]);
                }
            });
        }

        // Category filter
        if ($request->filled('category')) {
            $category = $request->input('category');
            match ($category) {
                'auth' => $query->where('event', 'like', 'auth.%'),
                'menu' => $query->where(function ($q) {
                    $q->where('event', 'like', 'menu.%')->orWhere('event', 'like', '%.viewed%');
                }),
                'event' => $query->where(function ($q) {
                    $q->where('event', 'like', 'event.%')->orWhere('event', 'like', 'speaker.%');
                }),
                'material' => $query->where(function ($q) {
                    $q->where('event', 'like', 'material.%')
                        ->orWhere('event', 'like', 'category.%')
                        ->orWhere('event', 'like', 'question_module.%');
                }),
                'system' => $query->where(function ($q) {
                    $q->where('event', 'like', 'user.%')
                        ->orWhere('event', 'like', 'permissions.%')
                        ->orWhere('event', 'like', 'settings.%')
                        ->orWhere('event', 'like', 'showcase.%');
                }),
                default => null,
            };
        }

        // Specific event filter
        if ($request->filled('event')) {
            $query->where('event', $request->input('event'));
        }

        // Actor ID filter
        if ($request->filled('actor_id')) {
            $query->where('actor_id', (int) $request->input('actor_id'));
        }

        // Role filter
        if ($request->filled('role')) {
            $role = $request->input('role');
            $query->whereHas('actor', fn ($q) => $q->where('role', $role));
        }

        // Date range filters
        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->input('start_date'));
        }

        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->input('end_date'));
        }

        $activities = $query->paginate(20)->withQueryString()->through(fn (ActivityLog $a) => [
            'id' => $a->id,
            'event' => $a->event,
            'event_label' => $a->event_label,
            'description' => $a->description,
            'properties' => $a->properties,
            'ip_address' => $a->ip_address,
            'user_agent' => $a->user_agent,
            'created_at' => $a->created_at?->format('d M Y, H:i:s') ?? '-',
            'created_at_relative' => $a->created_at?->diffForHumans() ?? '-',
            'actor' => $a->actor ? [
                'id' => $a->actor->id,
                'name' => $a->actor->name,
                'email' => $a->actor->email,
                'role' => $a->actor->role,
            ] : null,
        ]);

        $actors = User::whereIn('id', ActivityLog::select('actor_id')->whereNotNull('actor_id')->distinct())
            ->orderBy('name')
            ->get(['id', 'name', 'role'])
            ->map(fn ($user) => [
                'id' => $user->id,
                'label' => $user->name.' ('.$user->role.')',
            ]);

        $distinctEvents = ActivityLog::select('event')
            ->distinct()
            ->orderBy('event')
            ->get()
            ->map(function ($item) {
                $dummy = new ActivityLog(['event' => $item->event]);

                return [
                    'value' => $item->event,
                    'label' => $dummy->event_label.' ('.$item->event.')',
                ];
            });

        $categories = [
            ['value' => 'auth', 'label' => 'Autentikasi (Login / Logout)'],
            ['value' => 'menu', 'label' => 'Akses & Navigasi Menu'],
            ['value' => 'event', 'label' => 'Event & Pemateri'],
            ['value' => 'material', 'label' => 'Koleksi & Modul Pelajaran'],
            ['value' => 'system', 'label' => 'Pengguna, Hak Akses & Sistem'],
        ];

        $roles = [
            ['value' => 'Admin', 'label' => 'Admin'],
            ['value' => 'Diktar', 'label' => 'Diktar'],
            ['value' => 'Penyelenggara', 'label' => 'Penyelenggara'],
            ['value' => 'Pemateri', 'label' => 'Pemateri'],
            ['value' => 'Peserta', 'label' => 'Peserta'],
        ];

        return Inertia::render('Admin/Activities/Index', [
            'activities' => $activities,
            'actors' => $actors,
            'events' => $distinctEvents,
            'categories' => $categories,
            'roles' => $roles,
            'filters' => [
                'q' => (string) $request->input('q', ''),
                'category' => (string) $request->input('category', ''),
                'event' => (string) $request->input('event', ''),
                'role' => (string) $request->input('role', ''),
                'actor_id' => (string) $request->input('actor_id', ''),
                'start_date' => (string) $request->input('start_date', ''),
                'end_date' => (string) $request->input('end_date', ''),
            ],
        ]);
    }
}
