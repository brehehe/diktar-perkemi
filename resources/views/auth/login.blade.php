<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Masuk ke Portal — Pustaka Penataran PERKEMI</title>
    <meta name="description" content="Masuk ke portal Pustaka Penataran PERKEMI untuk melanjutkan membaca modul, bahan ajar, dan referensi belajar digital kenshi.">
    <link rel="icon" href="{{ asset('favicon.ico') }}">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

    @vite(['resources/css/app.css'])
</head>
<body class="pp-auth-page">
    <a href="#auth-form" class="skip-link">Lewati ke form masuk</a>

    {{-- Header Ringkas --}}
    <header class="pp-auth-header">
        <a href="{{ route('home') }}" class="pp-auth-brand" aria-label="Pustaka Penataran PERKEMI - Kembali ke Beranda">
            <div class="pp-auth-logo-badge" aria-hidden="true">PP</div>
            <div class="pp-auth-brand-text">
                <h1>Pustaka Penataran</h1>
                <p>Portal Buku Digital PERKEMI</p>
            </div>
        </a>

        <nav class="pp-auth-nav-links" aria-label="Navigasi Autentikasi">
            <a href="{{ route('home') }}" class="pp-auth-back-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                <span>Kembali ke Beranda</span>
            </a>
        </nav>
    </header>

    {{-- Layout Autentikasi Dua Kolom --}}
    <main class="pp-auth-layout">
        {{-- Kolom Kiri: Panel Identitas Portal (Latar Sky #EAF5FF) --}}
        <section class="pp-auth-identity" aria-labelledby="identity-heading">
            <div>
                <span class="pp-auth-tag">DIGITAL LEARNING CENTER</span>
                <h2 id="identity-heading" class="pp-auth-headline">Akses kembali ruang belajar Anda.</h2>
                <p class="pp-auth-desc">
                    Masuk untuk melanjutkan membaca modul, menyimpan materi, dan mengakses koleksi yang sesuai dengan peran Anda di Persaudaraan Shorinji Kempo Indonesia.
                </p>

                {{-- Elemen Editorial: Preview Modul Resmi PERKEMI --}}
                <div class="pp-auth-visual-preview">
                    <div class="pp-auth-visual-cover">
                        <img src="{{ asset('images/cover-2.jpg') }}" alt="Sampul Modul Panduan Penataran PERKEMI" width="80" height="110" loading="eager">
                    </div>
                    <div class="pp-auth-visual-info">
                        <span class="pp-auth-visual-meta">MODUL UTAMA PERKEMI</span>
                        <h4>Panduan Lengkap Penataran Nasional</h4>
                        <p>Akses standar teknik, perwasitan, kepelatihan, dan silabus resmi terpusat.</p>
                    </div>
                </div>
            </div>

            <div class="pp-auth-identity-footer">
                <p class="pp-auth-official-note">
                    PB PERKEMI &copy; {{ date('Y') }} — Pusat Data & Dokumentasi Pembelajaran Kenshi
                </p>
            </div>
        </section>

        {{-- Kolom Kanan: Form Login (Latar Putih) --}}
        <section class="pp-auth-form-column">
            <div class="pp-auth-form-card">
                <div class="pp-auth-form-header">
                    <h2 class="pp-auth-title">Masuk ke Portal</h2>
                    <p class="pp-auth-subtitle">Gunakan akun Pustaka Penataran Anda.</p>
                </div>

                {{-- Alert Flash Notifikasi Sukses / Info --}}
                @if (session('success'))
                    <div class="pp-auth-alert pp-auth-alert-success" role="alert">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>{{ session('success') }}</span>
                    </div>
                @endif

                {{-- Form Login Riil --}}
                <form id="auth-form" method="POST" action="{{ route('login') }}" novalidate>
                    @csrf

                    {{-- Field Email / Username --}}
                    <div class="pp-form-group">
                        <label for="email" class="pp-form-label">Email atau Nama Pengguna</label>
                        <div class="pp-input-wrapper">
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                class="pp-input @error('email') is-invalid @enderror" 
                                value="{{ old('email') }}" 
                                placeholder="nama@email.com" 
                                autocomplete="email" 
                                required
                                @error('email') aria-invalid="true" aria-describedby="email-error" @enderror
                            >
                        </div>
                        @error('email')
                            <p id="email-error" class="pp-form-error" role="alert">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                <span>{{ $message }}</span>
                            </p>
                        @enderror
                    </div>

                    {{-- Field Kata Sandi --}}
                    <div class="pp-form-group">
                        <label for="password" class="pp-form-label">Kata Sandi</label>
                        <div class="pp-input-wrapper">
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                class="pp-input pp-input-with-toggle @error('password') is-invalid @enderror" 
                                placeholder="Masukkan kata sandi Anda" 
                                autocomplete="current-password" 
                                required
                                @error('password') aria-invalid="true" aria-describedby="password-error" @enderror
                            >
                            <button 
                                type="button" 
                                id="toggle-password" 
                                class="pp-password-toggle" 
                                aria-label="Tampilkan kata sandi"
                                aria-pressed="false"
                            >
                                <svg id="eye-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                <svg id="eye-off-icon" class="hidden" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display: none;">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                            </button>
                        </div>
                        @error('password')
                            <p id="password-error" class="pp-form-error" role="alert">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                <span>{{ $message }}</span>
                            </p>
                        @enderror
                    </div>

                    {{-- Checkbox Ingat Saya --}}
                    <div class="pp-checkbox-wrapper">
                        <input type="checkbox" id="remember" name="remember" class="pp-checkbox" {{ old('remember') ? 'checked' : '' }}>
                        <label for="remember" class="pp-checkbox-label">Ingat saya di perangkat ini</label>
                    </div>

                    {{-- Tombol Masuk Portal dengan Loading State --}}
                    <button type="submit" id="btn-submit" class="pp-btn-auth-submit">
                        <span id="btn-text">Masuk Portal</span>
                        <svg id="btn-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin" style="display: none;" aria-hidden="true">
                            <line x1="12" y1="2" x2="12" y2="6"></line>
                            <line x1="12" y1="18" x2="12" y2="22"></line>
                            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                            <line x1="2" y1="12" x2="6" y2="12"></line>
                            <line x1="18" y1="12" x2="22" y2="12"></line>
                            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                        </svg>
                    </button>

                    <div class="pp-auth-form-footer">
                        <span>Belum memiliki akun?</span>
                        <a href="{{ route('register') }}">Daftar sekarang</a>
                    </div>
                </form>
            </div>
        </section>
    </main>

    {{-- Interactive Scripts (Password Toggle & Loading State) --}}
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            // Toggle show/hide password
            const toggleBtn = document.getElementById('toggle-password');
            const passwordInput = document.getElementById('password');
            const eyeIcon = document.getElementById('eye-icon');
            const eyeOffIcon = document.getElementById('eye-off-icon');

            if (toggleBtn && passwordInput) {
                toggleBtn.addEventListener('click', function () {
                    const isPassword = passwordInput.getAttribute('type') === 'password';
                    passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
                    toggleBtn.setAttribute('aria-pressed', isPassword ? 'true' : 'false');
                    toggleBtn.setAttribute('aria-label', isPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi');

                    if (isPassword) {
                        eyeIcon.style.display = 'none';
                        eyeOffIcon.style.display = 'block';
                    } else {
                        eyeIcon.style.display = 'block';
                        eyeOffIcon.style.display = 'none';
                    }
                });
            }

            // Enhanced Form submit: uses fetch with graceful handling for sandboxed iframes & webviews
            const authForm = document.getElementById('auth-form');
            const btnSubmit = document.getElementById('btn-submit');
            const btnText = document.getElementById('btn-text');
            const btnSpinner = document.getElementById('btn-spinner');

            if (authForm && btnSubmit) {
                authForm.addEventListener('submit', async function (e) {
                    e.preventDefault();

                    btnSubmit.disabled = true;
                    if (btnSpinner) btnSpinner.style.display = 'inline-block';
                    if (btnText) btnText.textContent = 'Memproses...';

                    // Remove dynamic alerts
                    const existingAlert = document.getElementById('dynamic-auth-alert');
                    if (existingAlert) existingAlert.remove();

                    try {
                        const formData = new FormData(authForm);
                        const response = await fetch(authForm.action, {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'X-Requested-With': 'XMLHttpRequest',
                            },
                            body: formData,
                        });

                        const data = await response.json();

                        if (response.ok && data.success) {
                            if (btnText) btnText.textContent = 'Berhasil masuk...';
                            const target = data.redirect || '/';
                            // If running in an iframe, try navigating top or local window
                            try {
                                if (window.top && window.top !== window) {
                                    window.top.location.href = target;
                                    return;
                                }
                            } catch (_) {}
                            window.location.href = target;
                        } else {
                            // Validation or credential error
                            btnSubmit.disabled = false;
                            if (btnSpinner) btnSpinner.style.display = 'none';
                            if (btnText) btnText.textContent = 'Masuk Portal';

                            const errorMsg = (data.errors && data.errors.email) 
                                ? data.errors.email[0] 
                                : (data.message || 'Email atau kata sandi tidak sesuai.');

                            const alertDiv = document.createElement('div');
                            alertDiv.id = 'dynamic-auth-alert';
                            alertDiv.className = 'pp-auth-alert pp-auth-alert-error';
                            alertDiv.setAttribute('role', 'alert');
                            alertDiv.innerHTML = `
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                <span>${errorMsg}</span>
                            `;
                            authForm.parentNode.insertBefore(alertDiv, authForm);
                        }
                    } catch (err) {
                        console.warn('Fetch submission error, attempting native submit:', err);
                        authForm.submit();
                    }
                });
            }
        });
    </script>
</body>
</html>
