<?php

namespace App\Http\Middleware;

use App\Models\CbtExamPackage;
use App\Models\Event;
use App\Models\EventAttendance;
use App\Models\EventLegend;
use App\Models\EventModule;
use App\Models\EventParticipant;
use App\Models\EventRoom;
use App\Models\EventSession;
use App\Models\LearningModule;
use App\Models\Speaker;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\Response;

class EnsureEventAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $event = $request->route('event');
        $routeName = $request->route()?->getName();

        if ($routeName === 'admin.cbt.question.store' && $request->route('package') instanceof CbtExamPackage) {
            $packageEvent = $request->route('package')->event;
            if ($packageEvent) {
                Gate::authorize('update', $packageEvent);
            } else {
                abort_unless($request->user()->isAdmin(), 403);
            }

            return $next($request);
        }

        if (! $event instanceof Event) {
            Gate::authorize(in_array($routeName, ['admin.event.create', 'admin.event.store'], true) ? 'create' : 'viewAny', Event::class);

            return $next($request);
        }

        $ability = $routeName === 'admin.event.destroy' ? 'delete' : ($request->isMethod('GET') ? 'view' : 'update');
        Gate::authorize($ability, $event);

        if ($request->route('session') instanceof EventSession) {
            abort_unless($request->route('session')->event_id === $event->id, 404);
        }

        if ($request->route('eventParticipant') instanceof EventParticipant) {
            abort_unless($request->route('eventParticipant')->event_id === $event->id, 404);
        }

        if ($request->route('attendance') instanceof EventAttendance) {
            abort_unless($request->route('attendance')->event_id === $event->id, 404);
        }

        foreach (['room' => EventRoom::class, 'legend' => EventLegend::class, 'speaker' => Speaker::class, 'module' => EventModule::class] as $parameter => $modelClass) {
            $resource = $request->route($parameter);
            if ($resource instanceof $modelClass) {
                abort_unless($resource->event_id === $event->id, 404);
            }
        }

        if ($request->route('package') instanceof CbtExamPackage) {
            $package = $request->route('package');
            abort_unless($package->event_id === $event->id || $event->linkedCbtPackages()->whereKey($package->id)->exists(), 404);
        }

        if ($request->route('module') instanceof LearningModule) {
            abort_unless($event->learningModules()->whereKey($request->route('module')->id)->exists(), 404);
        }

        if ($routeName === 'admin.event.update' && $request->user()->role === 'Penyelenggara'
            && $request->filled('responsible_user_id')
            && (int) $request->input('responsible_user_id') !== $event->responsible_user_id) {
            abort(403, 'Penanggung jawab event hanya dapat diubah oleh Admin atau Diktar.');
        }

        return $next($request);
    }
}
