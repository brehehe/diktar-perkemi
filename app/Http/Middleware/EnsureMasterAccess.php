<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureMasterAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        if ($user->isAdmin() || in_array($user->role, ['Diktar', 'Penyelenggara', 'Koordinator Acara', 'Koordinator Jadwal'], true)) {
            return $next($request);
        }

        abort(403, 'Akses ditolak. Halaman master data hanya dapat diakses oleh Admin, Diktar, Penyelenggara, atau Koordinator Acara.');
    }
}
