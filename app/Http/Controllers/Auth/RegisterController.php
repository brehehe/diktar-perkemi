<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    /**
     * Show the application registration form.
     */
    public function showRegistrationForm(): Response|RedirectResponse
    {
        if (Auth::check()) {
            return redirect('/');
        }

        if (Setting::isRegistrationOff()) {
            return redirect()->route('login')->with('info', 'Pendaftaran akun kenshi secara mandiri sedang dinonaktifkan.');
        }

        return Inertia::render('Auth/Register');
    }

    /**
     * Handle a registration request for the application.
     */
    public function register(Request $request): RedirectResponse
    {
        if (Setting::isRegistrationOff()) {
            return redirect()->route('login')->with('error', 'Pendaftaran akun kenshi secara mandiri sedang dinonaktifkan.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', 'string', 'in:Peserta,Pelatih,Penguji,Wasit,Pemateri,Penyelenggara'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'terms' => ['accepted'],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email ini sudah terdaftar.',
            'role.required' => 'Pilih peran Anda.',
            'role.in' => 'Pilih peran Anda.',
            'password.required' => 'Kata sandi wajib diisi.',
            'password.min' => 'Kata sandi minimal terdiri dari 8 karakter.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak sama.',
            'terms.accepted' => 'Anda perlu menyetujui Ketentuan Penggunaan dan Kebijakan Privasi.',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'password' => Hash::make($validated['password']),
        ]);

        Auth::login($user);

        $request->session()->regenerate();

        return redirect('/')->with('success', 'Akun Anda berhasil didaftarkan. Selamat datang di Pustaka Penataran, '.$user->name.'!');
    }
}
