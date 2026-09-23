<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Participant;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    /**
     * Show the application login form.
     */
    public function showLoginForm(): Response|RedirectResponse
    {
        if (Auth::check()) {
            return redirect('/');
        }

        return Inertia::render('Auth/Login');
    }

    /**
     * Handle an authentication attempt.
     *
     * @throws ValidationException
     */
    public function login(LoginRequest $request): RedirectResponse|JsonResponse
    {
        $identifier = $request->string('email')->trim()->toString();
        $userId = $this->resolveUserId($identifier);
        $password = $request->string('password')->toString();
        $remember = $request->boolean('remember');

        $authenticated = false;
        if ($userId !== null) {
            if (Auth::attempt(['id' => $userId, 'password' => $password], $remember)) {
                $authenticated = true;
            } elseif ($this->checkParticipantNikPasswordFallback($userId, $password, $remember)) {
                $authenticated = true;
            }
        }

        if ($authenticated) {
            $request->session()->regenerate();

            $user = Auth::user();
            $intended = session()->pull('url.intended');
            $redirectUrl = $intended;

            if (! $redirectUrl || $redirectUrl === '/' || $redirectUrl === url('/')) {
                if ($user?->role === 'Pemateri') {
                    $redirectUrl = route('speaker.schedule');
                } elseif ($user?->isAdmin() || in_array($user?->role, ['Diktar', 'Penyelenggara'], true)) {
                    $redirectUrl = route('admin.dashboard');
                } elseif ($user?->role === 'Peserta') {
                    $redirectUrl = route('event.mine');
                } else {
                    $redirectUrl = '/';
                }
            }

            if (($request->wantsJson() || $request->ajax()) && ! $request->header('X-Inertia')) {
                return response()->json([
                    'success' => true,
                    'redirect' => $redirectUrl,
                ]);
            }

            return redirect()->to($redirectUrl)->with('success', 'Selamat datang kembali di Pustaka Penataran.');
        }

        if (($request->wantsJson() || $request->ajax()) && ! $request->header('X-Inertia')) {
            return response()->json([
                'message' => 'Email, NIK, atau kata sandi tidak sesuai.',
                'errors' => ['email' => ['Email, NIK, atau kata sandi tidak sesuai.']],
            ], 422);
        }

        throw ValidationException::withMessages([
            'email' => 'Email, NIK, atau kata sandi tidak sesuai.',
        ]);
    }

    private function resolveUserId(string $identifier): ?int
    {
        if (filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
            $userId = User::query()
                ->where('email', $identifier)
                ->value('id');
            if ($userId) {
                return $userId;
            }
        }

        $userId = Participant::query()
            ->whereNotNull('user_id')
            ->where('kenshi_id_number', Str::upper($identifier))
            ->value('user_id');

        if ($userId) {
            return $userId;
        }

        $clean = preg_replace('/[^a-zA-Z0-9]/', '', $identifier);
        if ($clean !== '') {
            $userIdByClean = Participant::query()
                ->whereNotNull('user_id')
                ->whereRaw("REPLACE(REPLACE(REPLACE(kenshi_id_number, '.', ''), '-', ''), ' ', '') = ?", [$clean])
                ->value('user_id');

            if ($userIdByClean) {
                return $userIdByClean;
            }
        }

        return User::query()
            ->where('email', $identifier)
            ->value('id');
    }

    private function checkParticipantNikPasswordFallback(int $userId, string $password, bool $remember): bool
    {
        $participant = Participant::where('user_id', $userId)->first();
        if (! $participant || empty($participant->kenshi_id_number)) {
            return false;
        }

        $cleanPassword = preg_replace('/[^a-zA-Z0-9]/', '', $password);
        $cleanNik = preg_replace('/[^a-zA-Z0-9]/', '', $participant->kenshi_id_number);

        if ($cleanPassword !== '' && ($password === $participant->kenshi_id_number || $cleanPassword === $cleanNik)) {
            $user = User::find($userId);
            if ($user) {
                Auth::login($user, $remember);

                return true;
            }
        }

        return false;
    }

    /**
     * Log the user out of the application.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/')->with('success', 'Anda telah berhasil keluar dari portal.');
    }
}
