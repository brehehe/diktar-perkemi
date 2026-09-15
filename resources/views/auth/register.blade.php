<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daftar Akun Baru — Pustaka Penataran PERKEMI</title>
    <meta name="description" content="Daftarkan akun kenshi Anda di Pustaka Penataran PERKEMI untuk mengakses materi, buku panduan, dan modul penataran sesuai peran.">
    <link rel="icon" href="{{ asset('favicon.ico') }}">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="pp-auth-page">
    <a href="#register-form" class="skip-link">Lewati ke form pendaftaran</a>

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
            <span class="pp-auth-secondary-link hidden sm:inline">
                Sudah memiliki akun? <a href="{{ route('login') }}"><strong>Masuk</strong></a>
            </span>
        </nav>
    </header>

    {{-- Layout Pendaftaran Dua Kolom --}}
    <main class="pp-auth-layout">
        {{-- Kolom Kiri: Panel Informasi (Latar Sky #EAF5FF) --}}
        <section class="pp-auth-identity" aria-labelledby="register-panel-heading">
            <div>
                <span class="pp-auth-tag">BUAT AKUN</span>
                <h2 id="register-panel-heading" class="pp-auth-headline">Mulai perjalanan belajar Anda.</h2>
                <p class="pp-auth-desc">
                    Daftarkan akun untuk menemukan materi penataran sesuai peran dan kebutuhan Anda di Persaudaraan Shorinji Kempo Indonesia.
                </p>

                {{-- Daftar Manfaat Singkat (Typography & Separator, Bukan Kartu Seragam) --}}
                <div class="pp-auth-benefits" role="list">
                    <div class="pp-auth-benefit-item" role="listitem">
                        <span class="pp-auth-benefit-num" aria-hidden="true">01</span>
                        <div class="pp-auth-benefit-text">
                            <h4>Akses koleksi digital yang terpusat</h4>
                            <p>Satu pintu untuk seluruh modul penataran, kurikulum nasional, petunjuk teknis, dan arsip referensi pembelajaran.</p>
                        </div>
                    </div>

                    <div class="pp-auth-benefit-item" role="listitem">
                        <span class="pp-auth-benefit-num" aria-hidden="true">02</span>
                        <div class="pp-auth-benefit-text">
                            <h4>Materi terkurasi sesuai peran</h4>
                            <p>Modul dikelompokkan secara spesifik bagi Peserta, Pelatih, Penguji, Wasit, Pemateri, maupun Penyelenggara kegiatan.</p>
                        </div>
                    </div>

                    <div class="pp-auth-benefit-item" role="listitem">
                        <span class="pp-auth-benefit-num" aria-hidden="true">03</span>
                        <div class="pp-auth-benefit-text">
                            <h4>Referensi yang mudah ditemukan kembali</h4>
                            <p>Simpan dokumen penting ke rak baca pribadi untuk dipelajari sewaktu-waktu di dojo maupun saat penataran berlangsung.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="pp-auth-identity-footer">
                <p class="pp-auth-official-note">
                    Registrasi terbuka bagi seluruh anggota kenshi dan pengurus PERKEMI se-Indonesia.
                </p>
            </div>
        </section>

        {{-- Kolom Kanan: Form Pendaftaran (Latar Putih) --}}
        <section class="pp-auth-form-column">
            <div class="pp-auth-form-card">
                <div class="pp-auth-form-header">
                    <h2 class="pp-auth-title">Daftar Akun</h2>
                    <p class="pp-auth-subtitle">Lengkapi data berikut untuk membuat akun Anda.</p>
                </div>

                {{-- Form Pendaftaran Riil --}}
                <form id="register-form" method="POST" action="{{ route('register') }}" novalidate>
                    @csrf

                    {{-- Field Nama Lengkap --}}
                    <div class="pp-form-group">
                        <label for="name" class="pp-form-label">Nama Lengkap</label>
                        <div class="pp-input-wrapper">
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                class="pp-input @error('name') is-invalid @enderror" 
                                value="{{ old('name') }}" 
                                placeholder="Contoh: Ryan Santoso" 
                                autocomplete="name" 
                                required
                                @error('name') aria-invalid="true" aria-describedby="name-error" @enderror
                            >
                        </div>
                        @error('name')
                            <p id="name-error" class="pp-form-error" role="alert">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                <span>{{ $message }}</span>
                            </p>
                        @enderror
                    </div>

                    {{-- Field Email --}}
                    <div class="pp-form-group">
                        <label for="email" class="pp-form-label">Alamat Email</label>
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

                    {{-- Field Nomor Telepon / WhatsApp (Opsional pendukung sistem) --}}
                    <div class="pp-form-group">
                        <label for="phone" class="pp-form-label">Nomor Telepon / WhatsApp <span style="font-weight: 400; color: var(--pp-muted); font-size: 0.75rem;">(Opsional)</span></label>
                        <div class="pp-input-wrapper">
                            <input 
                                type="tel" 
                                id="phone" 
                                name="phone" 
                                class="pp-input @error('phone') is-invalid @enderror" 
                                value="{{ old('phone') }}" 
                                placeholder="Contoh: 081234567890" 
                                autocomplete="tel"
                            >
                        </div>
                    </div>

                    {{-- Field Peran Utama --}}
                    <div class="pp-form-group">
                        <label for="role" class="pp-form-label">Peran Utama dalam Kegiatan PERKEMI</label>
                        <div class="pp-input-wrapper">
                            <select 
                                id="role" 
                                name="role" 
                                class="pp-input pp-select @error('role') is-invalid @enderror" 
                                required
                                @error('role') aria-invalid="true" aria-describedby="role-error" @enderror
                            >
                                <option value="" disabled {{ old('role') ? '' : 'selected' }}>Pilih salah satu peran...</option>
                                <option value="Peserta" {{ old('role') === 'Peserta' ? 'selected' : '' }}>Peserta Penataran</option>
                                <option value="Pelatih" {{ old('role') === 'Pelatih' ? 'selected' : '' }}>Pelatih (Sensei / Senpai)</option>
                                <option value="Penguji" {{ old('role') === 'Penguji' ? 'selected' : '' }}>Penguji Kyu & Dan</option>
                                <option value="Wasit" {{ old('role') === 'Wasit' ? 'selected' : '' }}>Wasit & Juri Pertandingan</option>
                                <option value="Pemateri" {{ old('role') === 'Pemateri' ? 'selected' : '' }}>Pemateri / Narasumber</option>
                                <option value="Penyelenggara" {{ old('role') === 'Penyelenggara' ? 'selected' : '' }}>Penyelenggara / Panitia Kegiatan</option>
                            </select>
                        </div>
                        @error('role')
                            <p id="role-error" class="pp-form-error" role="alert">
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
                                placeholder="Minimal 8 karakter" 
                                autocomplete="new-password" 
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
                                <svg id="eye-off-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display: none;">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                            </button>
                        </div>

                        {{-- Indikator Kekuatan Kata Sandi --}}
                        <div class="pp-strength-meter" aria-live="polite">
                            <div class="pp-strength-bars">
                                <div id="bar-1" class="pp-strength-bar"></div>
                                <div id="bar-2" class="pp-strength-bar"></div>
                                <div id="bar-3" class="pp-strength-bar"></div>
                                <div id="bar-4" class="pp-strength-bar"></div>
                            </div>
                            <span id="strength-label" class="pp-strength-text">Kekuatan kata sandi: Masukkan minimal 8 karakter</span>
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

                    {{-- Field Konfirmasi Kata Sandi --}}
                    <div class="pp-form-group">
                        <label for="password_confirmation" class="pp-form-label">Konfirmasi Kata Sandi</label>
                        <div class="pp-input-wrapper">
                            <input 
                                type="password" 
                                id="password_confirmation" 
                                name="password_confirmation" 
                                class="pp-input pp-input-with-toggle" 
                                placeholder="Ulangi kata sandi Anda" 
                                autocomplete="new-password" 
                                required
                            >
                            <button 
                                type="button" 
                                id="toggle-password-confirm" 
                                class="pp-password-toggle" 
                                aria-label="Tampilkan konfirmasi kata sandi"
                                aria-pressed="false"
                            >
                                <svg id="eye-icon-confirm" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                <svg id="eye-off-icon-confirm" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display: none;">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                            </button>
                        </div>
                    </div>

                    {{-- Checkbox Persetujuan Ketentuan & Privasi --}}
                    <div class="pp-checkbox-wrapper">
                        <input 
                            type="checkbox" 
                            id="terms" 
                            name="terms" 
                            class="pp-checkbox @error('terms') is-invalid @enderror" 
                            value="1" 
                            {{ old('terms') ? 'checked' : '' }}
                            required
                            @error('terms') aria-invalid="true" aria-describedby="terms-error" @enderror
                        >
                        <label for="terms" class="pp-checkbox-label">
                            Saya menyetujui <a href="{{ route('home') }}#bantuan" target="_blank">Ketentuan Penggunaan</a> dan <a href="{{ route('home') }}#bantuan" target="_blank">Kebijakan Privasi</a> Pustaka Penataran.
                        </label>
                    </div>
                    @error('terms')
                        <p id="terms-error" class="pp-form-error" role="alert" style="margin-top: -1rem; margin-bottom: 1.25rem;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <span>{{ $message }}</span>
                        </p>
                    @enderror

                    {{-- Tombol Submit Buat Akun --}}
                    <button type="submit" id="btn-submit" class="pp-btn-auth-submit">
                        <span id="btn-text">Buat Akun</span>
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
                        <span>Sudah memiliki akun?</span>
                        <a href="{{ route('login') }}">Masuk Portal</a>
                    </div>
                </form>
            </div>
        </section>
    </main>

    {{-- Interactive Scripts (Password Toggle, Strength Meter, & Loading State) --}}
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            // Helper for toggle password
            function setupPasswordToggle(toggleId, inputId, eyeId, eyeOffId) {
                const toggle = document.getElementById(toggleId);
                const input = document.getElementById(inputId);
                const eye = document.getElementById(eyeId);
                const eyeOff = document.getElementById(eyeOffId);

                if (toggle && input) {
                    toggle.addEventListener('click', function () {
                        const isPassword = input.getAttribute('type') === 'password';
                        input.setAttribute('type', isPassword ? 'text' : 'password');
                        toggle.setAttribute('aria-pressed', isPassword ? 'true' : 'false');
                        toggle.setAttribute('aria-label', isPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi');

                        if (isPassword) {
                            eye.style.display = 'none';
                            eyeOff.style.display = 'block';
                        } else {
                            eye.style.display = 'block';
                            eyeOff.style.display = 'none';
                        }
                    });
                }
            }

            setupPasswordToggle('toggle-password', 'password', 'eye-icon', 'eye-off-icon');
            setupPasswordToggle('toggle-password-confirm', 'password_confirmation', 'eye-icon-confirm', 'eye-off-icon-confirm');

            // Password strength calculator
            const pwdInput = document.getElementById('password');
            const bar1 = document.getElementById('bar-1');
            const bar2 = document.getElementById('bar-2');
            const bar3 = document.getElementById('bar-3');
            const bar4 = document.getElementById('bar-4');
            const strengthLabel = document.getElementById('strength-label');
            const bars = [bar1, bar2, bar3, bar4];

            if (pwdInput && bar1) {
                pwdInput.addEventListener('input', function () {
                    const val = pwdInput.value;
                    let score = 0;

                    if (val.length >= 8) score++;
                    if (val.length >= 12) score++;
                    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
                    if (/[0-9]/.test(val) || /[^A-Za-z0-9]/.test(val)) score++;

                    // Clear bar classes
                    bars.forEach(b => {
                        b.className = 'pp-strength-bar';
                    });

                    if (val.length === 0) {
                        strengthLabel.textContent = 'Kekuatan kata sandi: Masukkan minimal 8 karakter';
                        strengthLabel.style.color = 'var(--pp-muted)';
                        return;
                    }

                    if (score === 1) {
                        bar1.classList.add('weak');
                        strengthLabel.textContent = 'Kekuatan kata sandi: Lemah (minimal 8 karakter)';
                        strengthLabel.style.color = '#FA5252';
                    } else if (score === 2) {
                        bar1.classList.add('medium');
                        bar2.classList.add('medium');
                        strengthLabel.textContent = 'Kekuatan kata sandi: Cukup (tambahkan kombinasi huruf besar/angka)';
                        strengthLabel.style.color = '#FD7E14';
                    } else if (score === 3) {
                        bar1.classList.add('strong');
                        bar2.classList.add('strong');
                        bar3.classList.add('strong');
                        strengthLabel.textContent = 'Kekuatan kata sandi: Kuat';
                        strengthLabel.style.color = '#40C057';
                    } else if (score >= 4) {
                        bar1.classList.add('very-strong');
                        bar2.classList.add('very-strong');
                        bar3.classList.add('very-strong');
                        bar4.classList.add('very-strong');
                        strengthLabel.textContent = 'Kekuatan kata sandi: Sangat Kuat';
                        strengthLabel.style.color = '#12B886';
                    }
                });
            }

            // Form submit loading state
            const regForm = document.getElementById('register-form');
            const btnSubmit = document.getElementById('btn-submit');
            const btnText = document.getElementById('btn-text');
            const btnSpinner = document.getElementById('btn-spinner');

            if (regForm && btnSubmit) {
                regForm.addEventListener('submit', function () {
                    btnSubmit.disabled = true;
                    if (btnSpinner) btnSpinner.style.display = 'inline-block';
                    if (btnText) btnText.textContent = 'Membuat Akun...';
                });
            }
        });
    </script>
</body>
</html>
