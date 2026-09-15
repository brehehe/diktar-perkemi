<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
    public function login(Request $request): RedirectResponse|JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ], [
            'email.required' => 'Email atau username wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'password.required' => 'Kata sandi wajib diisi.',
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            if (($request->wantsJson() || $request->ajax()) && ! $request->header('X-Inertia')) {
                return response()->json([
                    'success' => true,
                    'redirect' => session()->pull('url.intended', '/'),
                ]);
            }

            return redirect()->intended('/')->with('success', 'Selamat datang kembali di Pustaka Penataran.');
        }

        if (($request->wantsJson() || $request->ajax()) && ! $request->header('X-Inertia')) {
            return response()->json([
                'message' => 'Email atau kata sandi tidak sesuai.',
                'errors' => ['email' => ['Email atau kata sandi tidak sesuai.']],
            ], 422);
        }

        throw ValidationException::withMessages([
            'email' => 'Email atau kata sandi tidak sesuai.',
        ]);
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
