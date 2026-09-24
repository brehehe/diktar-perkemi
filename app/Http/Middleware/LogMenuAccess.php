<?php

namespace App\Http\Middleware;

use App\Models\ActivityLog;
use App\Models\Event;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class LogMenuAccess
{
    /**
     * Map of route names to activity events and labels.
     *
     * @var array<string, array<string, string>>
     */
    private const MENU_ROUTES = [
        'admin.event.index' => [
            'event' => 'menu.event_accessed',
            'menu' => 'Manajemen Event',
            'desc' => 'membuka menu Manajemen Event',
        ],
        'admin.event.show' => [
            'event' => 'event.viewed',
            'menu' => 'Rincian Event',
            'desc' => 'membuka rincian event',
        ],
        'admin.materials.index' => [
            'event' => 'menu.materials_accessed',
            'menu' => 'Koleksi Digital',
            'desc' => 'membuka menu Koleksi Digital',
        ],
        'admin.users.index' => [
            'event' => 'menu.users_accessed',
            'menu' => 'Manajemen Pengguna',
            'desc' => 'membuka menu Manajemen Pengguna',
        ],
        'admin.permissions.index' => [
            'event' => 'menu.permissions_accessed',
            'menu' => 'Hak Akses & Peran',
            'desc' => 'membuka menu Hak Akses & Matriks Peran',
        ],
        'admin.settings.index' => [
            'event' => 'menu.settings_accessed',
            'menu' => 'Pengaturan Portal',
            'desc' => 'membuka menu Pengaturan Portal',
        ],
        'admin.event.references' => [
            'event' => 'menu.event_references_accessed',
            'menu' => 'Referensi Event',
            'desc' => 'membuka menu Referensi Event',
        ],
        'admin.master.pemateri.index' => [
            'event' => 'menu.speakers_accessed',
            'menu' => 'Master Pemateri',
            'desc' => 'membuka menu Data Master Pemateri',
        ],
        'speaker.schedule' => [
            'event' => 'menu.speaker_schedule_accessed',
            'menu' => 'Jadwal Mengajar',
            'desc' => 'membuka portal Jadwal Mengajar Pemateri',
        ],
        'event.mine' => [
            'event' => 'menu.participant_event_accessed',
            'menu' => 'Event Saya',
            'desc' => 'membuka menu Event Saya',
        ],
    ];

    /**
     * Handle an incoming request and log menu access.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only log successful GET requests by authenticated users
        if (! $request->isMethod('GET') || ! Auth::check() || $response->getStatusCode() >= 400) {
            return $response;
        }

        $user = Auth::user();
        if (! $user) {
            return $response;
        }

        $route = $request->route();
        $routeName = $route?->getName();
        if (! $routeName || ! isset(self::MENU_ROUTES[$routeName])) {
            return $response;
        }

        $menuInfo = self::MENU_ROUTES[$routeName];
        $subject = null;
        $subjectId = null;
        $extraProperties = [
            'menu' => $menuInfo['menu'],
            'url' => $request->fullUrl(),
        ];

        // If inspecting a specific event in admin.event.show
        if ($routeName === 'admin.event.show') {
            $eventParam = $route->parameter('event');
            if ($eventParam instanceof Event) {
                $subject = $eventParam;
                $subjectId = $eventParam->id;
                $extraProperties['event_id'] = $eventParam->id;
                $extraProperties['event_title'] = $eventParam->title;
                $extraProperties['description'] = "Pengguna {$user->name} ({$user->role}) membuka rincian event: {$eventParam->title}";
            } elseif (is_numeric($eventParam)) {
                $subjectId = (int) $eventParam;
                $extraProperties['event_id'] = $subjectId;
                $extraProperties['description'] = "Pengguna {$user->name} ({$user->role}) membuka rincian event ID #{$subjectId}";
            }
        }

        if (! isset($extraProperties['description'])) {
            $extraProperties['description'] = "Pengguna {$user->name} ({$user->role}) {$menuInfo['desc']}";
        }

        // Throttle repeated access to the same menu per user to once every 3 minutes
        $cacheKey = 'log_menu_nav_'.$user->id.'_'.$routeName.($subjectId ? '_'.$subjectId : '');
        if (Cache::add($cacheKey, 1, 180)) {
            ActivityLog::record(
                $menuInfo['event'],
                $subject,
                $extraProperties
            );
        }

        return $response;
    }
}
