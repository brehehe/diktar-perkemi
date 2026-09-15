<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Pustaka Penataran — Portal Buku Digital PERKEMI. Akses buku digital, modul penataran, bahan ajar, dan referensi pembelajaran PERKEMI dalam satu portal terintegrasi.">
    <meta property="og:title" content="Pustaka Penataran — Portal Buku Digital PERKEMI">
    <meta property="og:description" content="Akses buku digital, modul penataran, dan bahan ajar pemateri dalam satu portal terintegrasi PERKEMI.">
    <meta property="og:type" content="website">
    <meta name="theme-color" content="#0B63CE">
    <title>Pustaka Penataran — Portal Buku Digital PERKEMI</title>
    @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    @else
        <style>body { margin: 0; font-family: sans-serif; background: #F8FBFF; }</style>
    @endif
</head>
<body>

{{-- Skip Link --}}
<a href="#main-content" class="skip-link">Lewati ke konten utama</a>

{{-- ═══════════════════════════════════════════════════════════
     UTILITY BAR
     ═══════════════════════════════════════════════════════════ --}}
<div class="pp-utility-bar" role="banner" aria-label="Informasi portal">
    <div class="pp-container" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
        <span style="color: rgba(234,245,255,0.55); font-size: 0.75rem;">Portal Pembelajaran Digital PERKEMI</span>
        <div style="display: flex; align-items: center; gap: 1.25rem;">
            <a href="#bantuan" id="util-bantuan">Bantuan</a>
            <span aria-hidden="true">·</span>
            @auth
                <span style="color: rgba(234,245,255,0.85); font-size: 0.75rem; font-weight: 500;">
                    Kenshi: {{ Auth::user()->name }} ({{ Auth::user()->role }})
                </span>
            @else
                <a href="{{ route('login') }}" id="util-masuk" style="color: rgba(234,245,255,0.85); font-weight: 500;">Masuk</a>
                <span aria-hidden="true">·</span>
                <a href="{{ route('register') }}" id="util-daftar" style="color: rgba(234,245,255,0.85); font-weight: 500;">Daftar Akun</a>
            @endauth
        </div>
    </div>
</div>

{{-- ═══════════════════════════════════════════════════════════
     HEADER / NAVIGASI
     ═══════════════════════════════════════════════════════════ --}}
<header class="pp-header" id="site-header" role="banner" aria-label="Navigasi utama">
    <div class="pp-container pp-header-inner">

        {{-- Logo --}}
        <a href="#beranda" class="pp-logo" id="site-logo" aria-label="Pustaka Penataran – Beranda">
            <svg class="pp-logo-mark" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect width="32" height="32" fill="#0B63CE" rx="4"/>
                <rect x="7" y="7" width="12" height="18" rx="1.5" stroke="#fff" stroke-width="1.5" fill="none"/>
                <path d="M10 11h6M10 14h6M10 17h4" stroke="rgba(255,255,255,0.6)" stroke-width="1.25" stroke-linecap="round"/>
                <rect x="17" y="9" width="8" height="16" rx="1" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
                <path d="M19 12h4M19 15h4M19 18h2" stroke="rgba(255,255,255,0.5)" stroke-width="1" stroke-linecap="round"/>
            </svg>
            <div class="pp-logo-text">
                <span class="pp-logo-name">Pustaka Penataran</span>
                <span class="pp-logo-sub">Portal Buku Digital PERKEMI</span>
            </div>
        </a>

        {{-- Desktop Nav --}}
        <nav class="pp-nav" aria-label="Menu navigasi">
            <a href="#beranda" class="pp-nav-link active" id="nav-beranda">Beranda</a>
            <div class="pp-nav-item">
                <a href="#koleksi" class="pp-nav-link" id="nav-koleksi">
                    Koleksi
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M4 6l4 4 4-4" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </a>
                <div class="pp-nav-dropdown" role="menu" aria-label="Menu Koleksi">
                    <a href="#koleksi" class="pp-dropdown-link" role="menuitem">Semua Koleksi</a>
                    <a href="#terbaru" class="pp-dropdown-link" role="menuitem">Materi Terbaru</a>
                    <a href="#sorotan" class="pp-dropdown-link" role="menuitem">Materi Terpopuler</a>
                    <a href="#koleksi" class="pp-dropdown-link" role="menuitem">Koleksi Pilihan</a>
                    <a href="#cara-menggunakan" class="pp-dropdown-link" role="menuitem">Panduan Penggunaan</a>
                </div>
            </div>
            <a href="#kategori" class="pp-nav-link" id="nav-kategori">Kategori</a>
            <a href="#peran" class="pp-nav-link" id="nav-peran">Untuk Peran Anda</a>
            <a href="#tentang" class="pp-nav-link" id="nav-tentang">Tentang</a>
            <a href="#bantuan" class="pp-nav-link" id="nav-bantuan">Bantuan</a>
        </nav>

        {{-- Actions --}}
        <div class="pp-header-actions">
            @auth
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    @if (Auth::user()->isAdmin())
                        <a href="{{ route('admin.dashboard') }}" class="btn-primary" style="font-size: 0.8125rem; padding: 0.45rem 0.875rem;">
                            Admin Portal &rarr;
                        </a>
                    @endif
                    <div style="text-align: right; line-height: 1.2;" class="hidden sm:block">
                        <div style="font-size: 0.8125rem; font-weight: 600; color: var(--pp-navy);">{{ Auth::user()->name }}</div>
                        <div style="font-size: 0.6875rem; color: var(--pp-primary); font-family: var(--font-mono); font-weight: 600;">{{ Auth::user()->role }}</div>
                    </div>
                    <form method="POST" action="{{ route('logout') }}" style="display: inline;">
                        @csrf
                        <button type="submit" class="btn-secondary" style="font-size: 0.8125rem; padding: 0.45rem 0.875rem; border: 1px solid var(--pp-border); cursor: pointer;">
                            Keluar
                        </button>
                    </form>
                </div>
            @else
                <a href="{{ route('login') }}" id="nav-masuk-cta" class="btn-primary" style="font-size: 0.8125rem; padding: 0.5rem 1.125rem;">
                    Masuk Portal
                </a>
            @endauth
            <button id="mobile-menu-btn" class="pp-mobile-btn" aria-label="Buka menu navigasi" aria-expanded="false" aria-controls="mobile-menu">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M2 4H14M2 8H14M2 12H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
            </button>
        </div>

    </div>
</header>

{{-- Mobile Backdrop --}}
<div id="mobile-menu-backdrop" class="pp-mobile-backdrop" onclick="closeMobileMenu()" aria-hidden="true"></div>

{{-- Mobile Menu Drawer --}}
<div id="mobile-menu" class="pp-mobile-menu" role="dialog" aria-modal="true" aria-label="Menu mobile">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; padding-bottom: 0.875rem; border-bottom: 1px solid var(--pp-border);">
        <span style="font-family: var(--font-display); font-size: 0.9375rem; font-weight: 700; color: var(--pp-navy);">Menu Portal</span>
        <button type="button" class="pp-mobile-btn" onclick="closeMobileMenu()" aria-label="Tutup menu navigasi">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M3 3L13 13M13 3L3 13" stroke-linecap="round"/></svg>
        </button>
    </div>
    <nav aria-label="Menu navigasi mobile">
        <a href="#beranda" id="mobile-nav-beranda" class="mobile-nav-link active" onclick="closeMobileMenu()">Beranda</a>
        <a href="#koleksi" id="mobile-nav-koleksi" class="mobile-nav-link" onclick="closeMobileMenu()">Koleksi</a>
        <a href="#kategori" id="mobile-nav-kategori" class="mobile-nav-link" onclick="closeMobileMenu()">Kategori</a>
        <a href="#peran" id="mobile-nav-peran" class="mobile-nav-link" onclick="closeMobileMenu()">Untuk Peran Anda</a>
        <a href="#tentang" id="mobile-nav-tentang" class="mobile-nav-link" onclick="closeMobileMenu()">Tentang</a>
        <a href="#bantuan" id="mobile-nav-bantuan" class="mobile-nav-link" onclick="closeMobileMenu()">Bantuan</a>
    </nav>
    <div style="display: flex; flex-direction: column; gap: 0.625rem; margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid var(--pp-border);">
        @auth
            <div style="padding: 0.625rem 0.75rem; background: var(--pp-sky); border-radius: 4px; margin-bottom: 0.25rem;">
                <div style="font-size: 0.875rem; font-weight: 600; color: var(--pp-navy);">{{ Auth::user()->name }}</div>
                <div style="font-size: 0.75rem; color: var(--pp-primary); font-family: var(--font-mono); font-weight: 600;">Peran: {{ Auth::user()->role }}</div>
            </div>
            @if (Auth::user()->isAdmin())
                <a href="{{ route('admin.dashboard') }}" class="btn-primary" style="justify-content: center; margin-bottom: 0.25rem;">Buka Admin Portal &rarr;</a>
            @endif
            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <button type="submit" class="btn-secondary" style="width: 100%; justify-content: center; padding: 0.625rem; border: 1px solid var(--pp-border); cursor: pointer;">Keluar dari Portal</button>
            </form>
        @else
            <a href="{{ route('login') }}" id="mobile-masuk" class="btn-primary" style="justify-content: center;">Masuk Portal</a>
            <a href="{{ route('register') }}" id="mobile-daftar" class="btn-secondary" style="justify-content: center; border: 1px solid var(--pp-border);">Daftar Akun Baru</a>
        @endauth
    </div>
</div>

{{-- ═══════════════════════════════════════════════════════════
     HERO SECTION
     ═══════════════════════════════════════════════════════════ --}}
<main id="main-content">
@if (session('success'))
    <div class="pp-container" style="padding-top: 1.25rem;">
        <div class="pp-auth-alert pp-auth-alert-success" role="alert" style="margin-bottom: 0;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span style="font-weight: 500;">{{ session('success') }}</span>
        </div>
    </div>
@endif
<section id="beranda" class="pp-hero" aria-labelledby="hero-headline">

    <div class="pp-container">
        <div class="pp-hero-grid">

            {{-- Hero Content --}}
            <div>
                <span class="pp-hero-label anim-fade-in" aria-label="Portal tipe: Digital Learning Center">
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M2 3h12v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                        <path d="M5 3V1.5M8 3V1.5M11 3V1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M4.5 7.5h7M4.5 10h5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>
                    </svg>
                    📘 Digital Learning Center
                </span>

                <h1 id="hero-headline" class="pp-heading-xl anim-fade-in-up anim-delay-1" style="margin-bottom: 1.25rem;">
                    Satu Akses,<br>
                    <em style="font-style: italic; color: var(--pp-primary);">Banyak Pengetahuan.</em>
                </h1>

                <p class="pp-body-lg anim-fade-in-up anim-delay-2" style="max-width: 36rem; margin-bottom: 2rem;">
                    Akses buku digital, modul penataran, dan bahan ajar pemateri dalam satu portal terintegrasi. Dirancang untuk mendukung proses belajar, pengembangan kompetensi, dan penyelenggaraan penataran PERKEMI.
                </p>

                <div class="anim-fade-in-up anim-delay-3" style="display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center;">
                    <a href="#koleksi" id="hero-cta-primary" class="btn-primary">
                        Jelajahi Koleksi
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </a>
                    <a href="#cara-menggunakan" id="hero-cta-secondary" class="btn-outline">Cara Menggunakan</a>
                </div>
            </div>

            {{-- Hero Visual — Real 3D Book Stack --}}
            <div class="pp-hero-visual anim-fade-in anim-delay-2" aria-hidden="true">
                <div class="pp-hero-book-stack">
                    {{-- Book 1 (Back) --}}
                    <div class="pp-hero-book-item pp-hero-book-1">
                        <img src="{{ asset('images/cover-3.jpg') }}" alt="Buku Jejak Nusantara" class="book-cover-img" loading="eager">
                        <div class="book-spine-effect"></div>
                    </div>
                    {{-- Book 2 (Middle) --}}
                    <div class="pp-hero-book-item pp-hero-book-2">
                        <img src="{{ asset('images/cover-1.jpg') }}" alt="Modul Rimba Kata" class="book-cover-img" loading="eager">
                        <div class="book-spine-effect"></div>
                    </div>
                    {{-- Book 3 (Front) --}}
                    <div class="pp-hero-book-item pp-hero-book-3">
                        <img src="{{ asset('images/cover-2.jpg') }}" alt="Buku Panduan Penataran PERKEMI" class="book-cover-img" loading="eager">
                        <div class="book-spine-effect"></div>
                    </div>
                    {{-- Surface shadow --}}
                    <div class="pp-hero-surface"></div>
                </div>
            </div>

        </div>
    </div>

    {{-- ═══════════════════════════════════════════════════════════
         5. PENCARIAN KOLEKSI (Bottom of Hero)
         ═══════════════════════════════════════════════════════════ --}}
    <div class="pp-search-panel pp-container anim-fade-in-up anim-delay-4">
        <div style="display: flex; align-items: flex-end; justify-content: space-between; gap: 1.25rem; margin-bottom: 1.25rem; flex-wrap: wrap;">
            <div>
                <span class="pp-eyebrow" style="margin-bottom: 0.375rem;">Pencarian Koleksi</span>
                <h2 style="font-family: var(--font-display); font-size: 1.375rem; font-weight: 700; color: var(--pp-navy); margin: 0; line-height: 1.2;">Temukan materi yang Anda butuhkan.</h2>
            </div>
            <a href="#koleksi" class="pp-role-link" onclick="resetCollectionFilter()" style="margin: 0; font-size: 0.8125rem;">
                Lihat seluruh koleksi
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
        </div>
        <div class="pp-search" role="search" aria-label="Pencarian koleksi pustaka">
            <label for="hero-search" class="sr-only">Cari buku, modul, materi, atau kata kunci</label>
            <input type="search" id="hero-search" name="q" placeholder="Cari buku, modul, materi, atau kata kunci…" autocomplete="off" aria-label="Cari buku, modul, materi, atau kata kunci">
            <button type="button" id="hero-search-btn" aria-label="Mulai pencarian">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M10 10L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                Cari
            </button>
        </div>
        <div class="pp-filter-chips" role="group" aria-label="Filter cepat pencarian">
            <button class="pp-chip active" type="button" id="chip-all" data-filter="all" aria-pressed="true">Semua Materi</button>
            <button class="pp-chip" type="button" id="chip-modul" data-filter="penataran" aria-pressed="false">Modul Penataran</button>
            <button class="pp-chip" type="button" id="chip-bahan" data-filter="bahan" aria-pressed="false">Bahan Ajar</button>
            <button class="pp-chip" type="button" id="chip-wasit" data-filter="perwasitan" aria-pressed="false">Referensi Wasit</button>
            <button class="pp-chip" type="button" id="chip-pelatih" data-filter="kepelatihan" aria-pressed="false">Materi Pelatih</button>
            <button class="pp-chip" type="button" id="chip-penguji" data-filter="pengujian" aria-pressed="false">Pedoman Penguji</button>
        </div>
    </div>

</section>

{{-- ═══════════════════════════════════════════════════════════
     STATS / TRUST BAR
     ═══════════════════════════════════════════════════════════ --}}
<section class="pp-stats-bar" aria-label="Ringkasan statistik portal">
    <div class="pp-container">
        <div class="pp-stats-row reveal">
            <div class="pp-stat-item">
                <div class="pp-stat-number" id="stat-modul">120+</div>
                <div class="pp-stat-label">Modul Tersedia</div>
            </div>
            <div class="pp-stat-item">
                <div class="pp-stat-number" id="stat-materi">340+</div>
                <div class="pp-stat-label">Materi Pembelajaran</div>
            </div>
            <div class="pp-stat-item">
                <div class="pp-stat-number" id="stat-kategori">6</div>
                <div class="pp-stat-label">Kelompok Peran</div>
            </div>
            <div class="pp-stat-item">
                <div class="pp-stat-number" id="stat-akses">Terpusat</div>
                <div class="pp-stat-label">Akses Koleksi</div>
            </div>
        </div>
    </div>
</section>

{{-- ═══════════════════════════════════════════════════════════
     KOLEKSI PILIHAN
     ═══════════════════════════════════════════════════════════ --}}
<section id="koleksi" class="pp-section" aria-labelledby="collection-heading">
    <div class="pp-container">

        <div style="display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem; margin-bottom: 0; flex-wrap: wrap;" class="reveal">
            <div>
                <span class="pp-eyebrow" style="margin-bottom: 0.75rem;">Koleksi Pilihan</span>
                <h2 id="collection-heading" class="pp-heading-lg" style="margin-bottom: 0.625rem;">Koleksi untuk memperkuat pembelajaran.</h2>
                <p class="pp-body" style="margin: 0; max-width: 38rem;">Pilih buku, modul, dan bahan ajar yang sesuai dengan kebutuhan penataran Anda.</p>
            </div>
            <a href="#koleksi" id="lihat-koleksi" class="btn-ghost" style="flex-shrink: 0;" onclick="resetCollectionFilter()">
                Lihat seluruh koleksi
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </a>
        </div>

        <div class="pp-collection-grid">

            {{-- Hero Book --}}
            <a href="#sorotan" id="book-hero-1" class="pp-book-hero reveal reveal-delay-1" data-category="penataran modul" data-title="panduan lengkap penataran perkemi">
                <div class="pp-book-hero-cover">
                    <img src="{{ asset('images/cover-2.jpg') }}" alt="Sampul Panduan Lengkap Penataran PERKEMI" class="book-cover-img" loading="lazy">
                    <div class="book-spine-effect"></div>
                </div>
                <div style="flex: 1; display: flex; flex-direction: column; gap: 0.75rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                        <span class="pp-cat-tag pp-cat-tag-blue">Penataran</span>
                        <span class="pp-cat-tag pp-cat-tag-navy">PDF · 2025</span>
                        <span class="pp-cat-tag pp-cat-tag-green">Akses Terbuka</span>
                    </div>
                    <h3 style="font-family: var(--font-display); font-size: clamp(1.25rem, 2.5vw, 1.875rem); font-weight: 700; color: var(--pp-navy); margin: 0; line-height: 1.15; letter-spacing: -0.01em;">Panduan Lengkap Penataran PERKEMI</h3>
                    <p style="font-size: 0.875rem; color: var(--pp-muted); line-height: 1.65; margin: 0; max-width: 34rem;">Referensi komprehensif bagi peserta, pelatih, dan penyelenggara kegiatan penataran PERKEMI. Memuat prosedur, kriteria penilaian, dan panduan pelaksanaan.</p>
                    <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--pp-border);">
                        <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--pp-muted); letter-spacing: 0.05em; text-transform: uppercase;">Tim Pelatihan PERKEMI</span>
                        <span style="color: var(--pp-border);">·</span>
                        <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--pp-muted); letter-spacing: 0.05em; text-transform: uppercase;">248 halaman</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.875rem; flex-wrap: wrap; margin-top: 0.25rem;">
                        <span class="btn-primary" style="width: fit-content;">
                            Baca Materi
                            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </span>
                        <span style="font-size: 0.8125rem; font-weight: 500; color: var(--pp-muted);">Lihat detail</span>
                    </div>
                </div>
            </a>

            {{-- Supporting Book 1 --}}
            <a href="#sorotan" id="book-card-1" class="pp-book-card reveal reveal-delay-2" data-category="kepelatihan pelatih" data-title="modul materi kepelatihan kempo">
                <div class="pp-book-card-cover">
                    <img src="{{ asset('images/cover-1.jpg') }}" alt="Sampul Modul Materi Kepelatihan Kempo" class="book-cover-img" loading="lazy">
                    <div class="book-spine-effect"></div>
                </div>
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 0.375rem; margin-bottom: 0.5rem; flex-wrap: wrap;">
                        <span class="pp-cat-tag pp-cat-tag-green">Kepelatihan</span>
                        <span class="pp-cat-tag pp-cat-tag-navy">PDF · 2024</span>
                        <span class="pp-cat-tag pp-cat-tag-blue">Akses Pelatih</span>
                    </div>
                    <h3 style="font-family: var(--font-display); font-size: 1rem; font-weight: 600; color: var(--pp-navy); margin: 0 0 0.375rem; line-height: 1.25;">Modul Materi Kepelatihan Kempo</h3>
                    <p style="font-size: 0.8125rem; color: var(--pp-muted); margin: 0 0 0.75rem; line-height: 1.55;">Panduan lengkap teknik dan metodologi kepelatihan kempo untuk pelatih bersertifikat.</p>
                    <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
                        <span style="font-size: 0.8125rem; font-weight: 600; color: var(--pp-primary); display: flex; align-items: center; gap: 0.25rem;">
                            Baca materi
                            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </span>
                        <span style="font-size: 0.75rem; color: var(--pp-muted);">Lihat detail</span>
                    </div>
                </div>
            </a>

            {{-- Supporting Book 2 --}}
            <a href="#sorotan" id="book-card-2" class="pp-book-card reveal reveal-delay-3" data-category="perwasitan wasit" data-title="buku referensi perwasitan kempo">
                <div class="pp-book-card-cover">
                    <img src="{{ asset('images/cover-3.jpg') }}" alt="Sampul Buku Referensi Perwasitan Kempo" class="book-cover-img" loading="lazy">
                    <div class="book-spine-effect"></div>
                </div>
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 0.375rem; margin-bottom: 0.5rem; flex-wrap: wrap;">
                        <span class="pp-cat-tag pp-cat-tag-orange">Perwasitan</span>
                        <span class="pp-cat-tag pp-cat-tag-navy">PDF · 2025</span>
                        <span class="pp-cat-tag pp-cat-tag-blue">Akses Wasit</span>
                    </div>
                    <h3 style="font-family: var(--font-display); font-size: 1rem; font-weight: 600; color: var(--pp-navy); margin: 0 0 0.375rem; line-height: 1.25;">Buku Referensi Perwasitan Kempo</h3>
                    <p style="font-size: 0.8125rem; color: var(--pp-muted); margin: 0 0 0.75rem; line-height: 1.55;">Aturan, prosedur, dan panduan keputusan bagi wasit dalam pertandingan resmi PERKEMI.</p>
                    <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
                        <span style="font-size: 0.8125rem; font-weight: 600; color: var(--pp-primary); display: flex; align-items: center; gap: 0.25rem;">
                            Baca materi
                            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </span>
                        <span style="font-size: 0.75rem; color: var(--pp-muted);">Lihat detail</span>
                    </div>
                </div>
            </a>

            {{-- Supporting Book 3 --}}
            <a href="#sorotan" id="book-card-3" class="pp-book-card reveal reveal-delay-4" data-category="pengujian penguji" data-title="pedoman penguji kyu & dan">
                <div class="pp-book-card-cover">
                    <img src="{{ asset('images/cover-2.jpg') }}" alt="Sampul Pedoman Penguji Kyu & Dan" class="book-cover-img" loading="lazy">
                    <div class="book-spine-effect"></div>
                </div>
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 0.375rem; margin-bottom: 0.5rem; flex-wrap: wrap;">
                        <span class="pp-cat-tag pp-cat-tag-purple">Pengujian</span>
                        <span class="pp-cat-tag pp-cat-tag-navy">PDF · 2024</span>
                        <span class="pp-cat-tag pp-cat-tag-blue">Akses Penguji</span>
                    </div>
                    <h3 style="font-family: var(--font-display); font-size: 1rem; font-weight: 600; color: var(--pp-navy); margin: 0 0 0.375rem; line-height: 1.25;">Pedoman Penguji Kyu & Dan</h3>
                    <p style="font-size: 0.8125rem; color: var(--pp-muted); margin: 0 0 0.75rem; line-height: 1.55;">Panduan komprehensif standar pengujian kyu dan dan bagi penguji resmi PERKEMI.</p>
                    <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
                        <span style="font-size: 0.8125rem; font-weight: 600; color: var(--pp-primary); display: flex; align-items: center; gap: 0.25rem;">
                            Baca materi
                            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </span>
                        <span style="font-size: 0.75rem; color: var(--pp-muted);">Lihat detail</span>
                    </div>
                </div>
            </a>

        </div>

        {{-- Empty State jika filter/pencarian kosong --}}
        <div id="collection-empty" class="pp-empty-state" role="status" aria-live="polite">
            <svg class="pp-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M8 11h6"/>
            </svg>
            <h4 class="pp-empty-title">Materi Tidak Ditemukan</h4>
            <p class="pp-empty-desc">Tidak ada modul atau buku digital yang sesuai dengan kata kunci pencarian atau filter yang Anda pilih. Silakan gunakan kata kunci lain atau setel ulang pilihan.</p>
            <button type="button" class="btn-outline" onclick="resetCollectionFilter()" style="font-size: 0.8125rem; padding: 0.5rem 1.125rem;">
                Setel Ulang Filter
            </button>
        </div>

    </div>
</section>

{{-- ═══════════════════════════════════════════════════════════
     KATEGORI
     ═══════════════════════════════════════════════════════════ --}}
<section id="kategori" style="padding-top: 4.5rem; padding-bottom: 4.5rem; background-color: var(--pp-white); border-top: 1px solid var(--pp-border);" aria-labelledby="kategori-heading">
    <div class="pp-container">
        <div class="reveal">
            <span class="pp-eyebrow" style="margin-bottom: 0.75rem;">Jelajahi Berdasarkan</span>
            <h2 id="kategori-heading" class="pp-heading-lg">Belajar dari kategori<br>yang tepat.</h2>
        </div>
        <div class="pp-category-list reveal" role="list" aria-label="Kategori materi pembelajaran">

            {{-- 1. Penataran --}}
            <a href="#koleksi" id="cat-penataran" class="pp-category-item" style="--cat-accent: #0B63CE;" role="listitem" onclick="filterFromCategory('penataran')">
                <div class="pp-cat-item-top">
                    <div>
                        <h3 class="pp-cat-name">Penataran</h3>
                        <p class="pp-cat-desc">Modul dan panduan kegiatan penataran resmi PERKEMI.</p>
                    </div>
                    <span class="pp-cat-tag pp-cat-tag-blue" style="flex-shrink: 0;">Blue</span>
                </div>
                <div class="pp-cat-item-bottom">
                    <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--pp-muted); text-transform: uppercase; letter-spacing: 0.05em;">42 materi</span>
                    <span class="pp-cat-link-label">
                        Lihat materi
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </span>
                </div>
            </a>

            {{-- 2. Kepelatihan --}}
            <a href="#koleksi" id="cat-kepelatihan" class="pp-category-item" style="--cat-accent: #20A47A;" role="listitem" onclick="filterFromCategory('kepelatihan')">
                <div class="pp-cat-item-top">
                    <div>
                        <h3 class="pp-cat-name">Kepelatihan</h3>
                        <p class="pp-cat-desc">Materi untuk pelatih dan metodologi pembinaan kenshi.</p>
                    </div>
                    <span class="pp-cat-tag pp-cat-tag-green" style="flex-shrink: 0;">Green</span>
                </div>
                <div class="pp-cat-item-bottom">
                    <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--pp-muted); text-transform: uppercase; letter-spacing: 0.05em;">38 materi</span>
                    <span class="pp-cat-link-label">
                        Lihat materi
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </span>
                </div>
            </a>

            {{-- 3. Perwasitan --}}
            <a href="#koleksi" id="cat-perwasitan" class="pp-category-item" style="--cat-accent: #EE9B25;" role="listitem" onclick="filterFromCategory('perwasitan')">
                <div class="pp-cat-item-top">
                    <div>
                        <h3 class="pp-cat-name">Perwasitan</h3>
                        <p class="pp-cat-desc">Referensi aturan, teknik keputusan, dan etika juru adil.</p>
                    </div>
                    <span class="pp-cat-tag pp-cat-tag-orange" style="flex-shrink: 0;">Orange</span>
                </div>
                <div class="pp-cat-item-bottom">
                    <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--pp-muted); text-transform: uppercase; letter-spacing: 0.05em;">24 materi</span>
                    <span class="pp-cat-link-label">
                        Lihat materi
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </span>
                </div>
            </a>

            {{-- 4. Pengujian --}}
            <a href="#koleksi" id="cat-pengujian" class="pp-category-item" style="--cat-accent: #7957D5;" role="listitem" onclick="filterFromCategory('pengujian')">
                <div class="pp-cat-item-top">
                    <div>
                        <h3 class="pp-cat-name">Pengujian</h3>
                        <p class="pp-cat-desc">Pedoman serta bahan evaluasi penguji kyu dan dan.</p>
                    </div>
                    <span class="pp-cat-tag pp-cat-tag-purple" style="flex-shrink: 0;">Purple</span>
                </div>
                <div class="pp-cat-item-bottom">
                    <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--pp-muted); text-transform: uppercase; letter-spacing: 0.05em;">19 materi</span>
                    <span class="pp-cat-link-label">
                        Lihat materi
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </span>
                </div>
            </a>

            {{-- 5. Materi Pemateri --}}
            <a href="#koleksi" id="cat-pemateri" class="pp-category-item" style="--cat-accent: #DD4D7C;" role="listitem" onclick="filterFromCategory('bahan')">
                <div class="pp-cat-item-top">
                    <div>
                        <h3 class="pp-cat-name">Materi Pemateri</h3>
                        <p class="pp-cat-desc">Bahan presentasi, slide kuliah, dan referensi pengajar.</p>
                    </div>
                    <span class="pp-cat-tag pp-cat-tag-rose" style="flex-shrink: 0;">Rose</span>
                </div>
                <div class="pp-cat-item-bottom">
                    <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--pp-muted); text-transform: uppercase; letter-spacing: 0.05em;">31 materi</span>
                    <span class="pp-cat-link-label">
                        Lihat materi
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </span>
                </div>
            </a>

            {{-- 6. Penyelenggaraan --}}
            <a href="#koleksi" id="cat-admin" class="pp-category-item" style="--cat-accent: #0A3F82;" role="listitem" onclick="filterFromCategory('all')">
                <div class="pp-cat-item-top">
                    <div>
                        <h3 class="pp-cat-name">Penyelenggaraan</h3>
                        <p class="pp-cat-desc">Panduan administrasi dan pelaksanaan kegiatan penataran.</p>
                    </div>
                    <span class="pp-cat-tag pp-cat-tag-navy" style="flex-shrink: 0;">Primary Dark</span>
                </div>
                <div class="pp-cat-item-bottom">
                    <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--pp-muted); text-transform: uppercase; letter-spacing: 0.05em;">16 materi</span>
                    <span class="pp-cat-link-label">
                        Lihat materi
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </span>
                </div>
            </a>

        </div>
    </div>
</section>

{{-- ═══════════════════════════════════════════════════════════
     JALUR BELAJAR
     ═══════════════════════════════════════════════════════════ --}}
<section id="jalur-belajar" class="pp-section" aria-labelledby="jalur-heading">
    <div class="pp-container">
        <div class="reveal" style="max-width: 40rem;">
            <span class="pp-eyebrow" style="margin-bottom: 0.75rem;">Jalur Belajar</span>
            <h2 id="jalur-heading" class="pp-heading-lg">Mulai dari jalur<br>belajar Anda.</h2>
        </div>
        <div class="pp-steps-row" role="list" aria-label="Empat langkah menggunakan Pustaka Penataran">

            <div class="pp-step reveal reveal-delay-1" role="listitem">
                <div class="pp-step-number" aria-hidden="true">01</div>
                <div class="pp-step-body">
                    <h3>Pilih Peran</h3>
                    <p>Tentukan peran Anda: peserta, pelatih, wasit, penguji, pemateri, atau penyelenggara.</p>
                </div>
            </div>

            <div class="pp-step reveal reveal-delay-2" role="listitem">
                <div class="pp-step-number" aria-hidden="true">02</div>
                <div class="pp-step-body">
                    <h3>Temukan Materi</h3>
                    <p>Gunakan pencarian atau telusuri kategori untuk menemukan materi yang relevan.</p>
                </div>
            </div>

            <div class="pp-step reveal reveal-delay-3" role="listitem">
                <div class="pp-step-number" aria-hidden="true">03</div>
                <div class="pp-step-body">
                    <h3>Baca atau Unduh</h3>
                    <p>Akses materi langsung di browser atau unduh untuk digunakan secara offline.</p>
                </div>
            </div>

            <div class="pp-step reveal reveal-delay-4" role="listitem">
                <div class="pp-step-number" aria-hidden="true">04</div>
                <div class="pp-step-body">
                    <h3>Terapkan</h3>
                    <p>Gunakan materi dalam kegiatan penataran, latihan, dan pengembangan kompetensi.</p>
                </div>
            </div>

        </div>
    </div>
</section>

{{-- ═══════════════════════════════════════════════════════════
     JELAJAHI BERDASARKAN PERAN
     ═══════════════════════════════════════════════════════════ --}}
<section id="peran" style="padding-top: 4.5rem; padding-bottom: 4.5rem; background-color: var(--pp-white); border-top: 1px solid var(--pp-border);" aria-labelledby="peran-heading">
    <div class="pp-container">
        <div class="reveal">
            <span class="pp-eyebrow" style="margin-bottom: 0.75rem;">Untuk Peran Anda</span>
            <h2 id="peran-heading" class="pp-heading-lg">Materi yang disusun<br>sesuai peran Anda.</h2>
            <p class="pp-body" style="margin-top: 0.5rem; max-width: 38rem;">Pilih peran Anda untuk mendapatkan ringkasan materi rekomendasi, kurikulum relevan, dan panduan kegiatan penataran.</p>
        </div>

        <div class="pp-role-layout reveal reveal-delay-1">
            {{-- Role Tab Selector --}}
            <div class="pp-role-tabs" role="tablist" aria-label="Pilih peran pengguna">
                <button type="button" class="pp-role-tab active" id="tab-peserta" role="tab" aria-selected="true" aria-controls="panel-peserta" onclick="switchRoleTab('peserta')">
                    <span style="display: flex; align-items: center; gap: 0.625rem;">
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="8" cy="6" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>
                        Peserta
                    </span>
                    <span class="pp-cat-tag pp-cat-tag-blue">Dasar</span>
                </button>
                <button type="button" class="pp-role-tab" id="tab-pelatih" role="tab" aria-selected="false" aria-controls="panel-pelatih" onclick="switchRoleTab('pelatih')">
                    <span style="display: flex; align-items: center; gap: 0.625rem;">
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="8" cy="5" r="3"/><path d="M1 15c0-3.9 3.1-7 7-7s7 3.1 7 7"/></svg>
                        Pelatih
                    </span>
                    <span class="pp-cat-tag pp-cat-tag-green">Metode</span>
                </button>
                <button type="button" class="pp-role-tab" id="tab-penguji" role="tab" aria-selected="false" aria-controls="panel-penguji" onclick="switchRoleTab('penguji')">
                    <span style="display: flex; align-items: center; gap: 0.625rem;">
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M8 2l1.5 3 3.5.5-2.5 2.4.6 3.5L8 9.75l-3.1 1.65.6-3.5L3 5.5 6.5 5z"/></svg>
                        Penguji
                    </span>
                    <span class="pp-cat-tag pp-cat-tag-purple">Evaluasi</span>
                </button>
                <button type="button" class="pp-role-tab" id="tab-wasit" role="tab" aria-selected="false" aria-controls="panel-wasit" onclick="switchRoleTab('wasit')">
                    <span style="display: flex; align-items: center; gap: 0.625rem;">
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M8 1L2 4v4c0 3.3 2.7 7 6 7s6-3.7 6-7V4z"/></svg>
                        Wasit
                    </span>
                    <span class="pp-cat-tag pp-cat-tag-orange">Aturan</span>
                </button>
                <button type="button" class="pp-role-tab" id="tab-pemateri" role="tab" aria-selected="false" aria-controls="panel-pemateri" onclick="switchRoleTab('pemateri')">
                    <span style="display: flex; align-items: center; gap: 0.625rem;">
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="1" y="2" width="14" height="10" rx="1.5"/><path d="M5 14h6M8 12v2"/></svg>
                        Pemateri
                    </span>
                    <span class="pp-cat-tag pp-cat-tag-rose">Bahan</span>
                </button>
                <button type="button" class="pp-role-tab" id="tab-penyelenggara" role="tab" aria-selected="false" aria-controls="panel-penyelenggara" onclick="switchRoleTab('penyelenggara')">
                    <span style="display: flex; align-items: center; gap: 0.625rem;">
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M5 1v2M11 1v2M2 7h12"/></svg>
                        Penyelenggara
                    </span>
                    <span class="pp-cat-tag pp-cat-tag-navy">Kelola</span>
                </button>
            </div>

            {{-- Role Panels (Interactive Content) --}}
            <div class="pp-role-panels">

                {{-- Panel 1: Peserta --}}
                <div class="pp-role-panel active" id="panel-peserta" role="tabpanel" aria-labelledby="tab-peserta">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                        <span class="pp-cat-tag pp-cat-tag-blue">Peran Peserta</span>
                        <span class="pp-cat-tag pp-cat-tag-navy">Materi Dasar & Modul</span>
                    </div>
                    <h3 style="font-family: var(--font-display); font-size: 1.375rem; font-weight: 700; color: var(--pp-navy); margin: 0 0 0.5rem;">Kebutuhan Utama: Materi dasar dan modul penataran</h3>
                    <p style="font-size: 0.875rem; color: var(--pp-muted); line-height: 1.65; margin: 0 0 1.5rem;">
                        Bagi kenshi yang mengikuti penataran tingkat daerah maupun nasional, pustaka ini menyajikan silabus dasar, materi kyu/dan, panduan persiapan ujian kenaikan tingkat, serta tata tertib yang wajib dipahami.
                    </p>

                    <div style="display: flex; gap: 1.25rem; background: var(--pp-sky); border: 1px solid var(--pp-border); border-radius: 4px; padding: 1.25rem; margin-bottom: 1.75rem; align-items: center;">
                        <div style="width: 3.75rem; flex-shrink: 0; aspect-ratio: 2/3; border-radius: 3px; overflow: hidden; box-shadow: -2px 4px 10px rgba(14,39,71,0.18);">
                            <img src="{{ asset('images/cover-1.jpg') }}" alt="Modul Dasar Kenshi" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy">
                        </div>
                        <div>
                            <div style="font-family: var(--font-mono); font-size: 0.625rem; color: var(--pp-primary); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.25rem;">Rekomendasi Utama</div>
                            <h4 style="font-size: 0.9375rem; font-weight: 600; color: var(--pp-navy); margin: 0 0 0.25rem;">Modul Persiapan Penataran & Ujian Tingkat</h4>
                            <p style="font-size: 0.8125rem; color: var(--pp-muted); margin: 0; line-height: 1.45;">Buku pegangan wajib berisi teknik dasar, filosofi Shorinji Kempo, dan rubrik kelulusan ujian.</p>
                        </div>
                    </div>

                    <a href="#koleksi" id="cta-peran-peserta" class="btn-primary" onclick="filterFromCategory('penataran')">
                        Lihat materi peserta
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </a>
                </div>

                {{-- Panel 2: Pelatih --}}
                <div class="pp-role-panel" id="panel-pelatih" role="tabpanel" aria-labelledby="tab-pelatih">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                        <span class="pp-cat-tag pp-cat-tag-green">Peran Pelatih</span>
                        <span class="pp-cat-tag pp-cat-tag-navy">Pembinaan & Metodologi</span>
                    </div>
                    <h3 style="font-family: var(--font-display); font-size: 1.375rem; font-weight: 700; color: var(--pp-navy); margin: 0 0 0.5rem;">Kebutuhan Utama: Materi pembinaan dan metodologi</h3>
                    <p style="font-size: 0.875rem; color: var(--pp-muted); line-height: 1.65; margin: 0 0 1.5rem;">
                        Akses modul metodologi kepelatihan modern, periodisasi latihan fisik dan mental kenshi, pencegahan cedera, serta teknik pengajaran standar dojo PERKEMI di seluruh Indonesia.
                    </p>

                    <div style="display: flex; gap: 1.25rem; background: var(--pp-sky); border: 1px solid var(--pp-border); border-radius: 4px; padding: 1.25rem; margin-bottom: 1.75rem; align-items: center;">
                        <div style="width: 3.75rem; flex-shrink: 0; aspect-ratio: 2/3; border-radius: 3px; overflow: hidden; box-shadow: -2px 4px 10px rgba(14,39,71,0.18);">
                            <img src="{{ asset('images/cover-1.jpg') }}" alt="Modul Metodologi Kepelatihan" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy">
                        </div>
                        <div>
                            <div style="font-family: var(--font-mono); font-size: 0.625rem; color: #157a5a; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.25rem;">Rekomendasi Utama</div>
                            <h4 style="font-size: 0.9375rem; font-weight: 600; color: var(--pp-navy); margin: 0 0 0.25rem;">Modul Metodologi Kepelatihan Kempo Bersertifikat</h4>
                            <p style="font-size: 0.8125rem; color: var(--pp-muted); margin: 0; line-height: 1.45;">Panduan terstruktur melatih kenshi dari tingkat dasar hingga atlet berprestasi tinggi.</p>
                        </div>
                    </div>

                    <a href="#koleksi" id="cta-peran-pelatih" class="btn-primary" onclick="filterFromCategory('kepelatihan')">
                        Lihat materi pelatih
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </a>
                </div>

                {{-- Panel 3: Penguji --}}
                <div class="pp-role-panel" id="panel-penguji" role="tabpanel" aria-labelledby="tab-penguji">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                        <span class="pp-cat-tag pp-cat-tag-purple">Peran Penguji</span>
                        <span class="pp-cat-tag pp-cat-tag-navy">Evaluasi & Instrumen</span>
                    </div>
                    <h3 style="font-family: var(--font-display); font-size: 1.375rem; font-weight: 700; color: var(--pp-navy); margin: 0 0 0.5rem;">Kebutuhan Utama: Pedoman evaluasi dan instrumen pengujian</h3>
                    <p style="font-size: 0.875rem; color: var(--pp-muted); line-height: 1.65; margin: 0 0 1.5rem;">
                        Memuat pedoman standar penilaian ujian kenaikan tingkat kyu dan dan, rubrik skor teknis, instrumen evaluasi tertulis, formulir berita acara, dan kode etik tim penguji resmi PERKEMI.
                    </p>

                    <div style="display: flex; gap: 1.25rem; background: var(--pp-sky); border: 1px solid var(--pp-border); border-radius: 4px; padding: 1.25rem; margin-bottom: 1.75rem; align-items: center;">
                        <div style="width: 3.75rem; flex-shrink: 0; aspect-ratio: 2/3; border-radius: 3px; overflow: hidden; box-shadow: -2px 4px 10px rgba(14,39,71,0.18);">
                            <img src="{{ asset('images/cover-2.jpg') }}" alt="Pedoman Penguji Kyu & Dan" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy">
                        </div>
                        <div>
                            <div style="font-family: var(--font-mono); font-size: 0.625rem; color: #5c3db5; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.25rem;">Rekomendasi Utama</div>
                            <h4 style="font-size: 0.9375rem; font-weight: 600; color: var(--pp-navy); margin: 0 0 0.25rem;">Pedoman Standar Penguji Kyu & Dan PERKEMI</h4>
                            <p style="font-size: 0.8125rem; color: var(--pp-muted); margin: 0; line-height: 1.45;">Instrumen penilaian teknis terpadu untuk menjamin objektivitas evaluasi kenshi nasional.</p>
                        </div>
                    </div>

                    <a href="#koleksi" id="cta-peran-penguji" class="btn-primary" onclick="filterFromCategory('pengujian')">
                        Lihat materi penguji
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </a>
                </div>

                {{-- Panel 4: Wasit --}}
                <div class="pp-role-panel" id="panel-wasit" role="tabpanel" aria-labelledby="tab-wasit">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                        <span class="pp-cat-tag pp-cat-tag-orange">Peran Wasit</span>
                        <span class="pp-cat-tag pp-cat-tag-navy">Regulasi & Keputusan</span>
                    </div>
                    <h3 style="font-family: var(--font-display); font-size: 1.375rem; font-weight: 700; color: var(--pp-navy); margin: 0 0 0.5rem;">Kebutuhan Utama: Referensi aturan dan materi perwasitan</h3>
                    <p style="font-size: 0.875rem; color: var(--pp-muted); line-height: 1.65; margin: 0 0 1.5rem;">
                        Dokumen regulasi pertandingan resmi, aturan randori dan embu, interpretasi pelanggaran, isyarat tangan dan peluit, serta studi kasus keputusan perwasitan berstandar internasional.
                    </p>

                    <div style="display: flex; gap: 1.25rem; background: var(--pp-sky); border: 1px solid var(--pp-border); border-radius: 4px; padding: 1.25rem; margin-bottom: 1.75rem; align-items: center;">
                        <div style="width: 3.75rem; flex-shrink: 0; aspect-ratio: 2/3; border-radius: 3px; overflow: hidden; box-shadow: -2px 4px 10px rgba(14,39,71,0.18);">
                            <img src="{{ asset('images/cover-3.jpg') }}" alt="Buku Referensi Perwasitan Kempo" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy">
                        </div>
                        <div>
                            <div style="font-family: var(--font-mono); font-size: 0.625rem; color: #a66a0a; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.25rem;">Rekomendasi Utama</div>
                            <h4 style="font-size: 0.9375rem; font-weight: 600; color: var(--pp-navy); margin: 0 0 0.25rem;">Buku Referensi & Regulasi Perwasitan Kempo</h4>
                            <p style="font-size: 0.8125rem; color: var(--pp-muted); margin: 0; line-height: 1.45;">Aturan lengkap kejuaraan, kode etik juru adil, dan mekanisme penanganan insiden lapangan.</p>
                        </div>
                    </div>

                    <a href="#koleksi" id="cta-peran-wasit" class="btn-primary" onclick="filterFromCategory('perwasitan')">
                        Lihat materi wasit
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </a>
                </div>

                {{-- Panel 5: Pemateri --}}
                <div class="pp-role-panel" id="panel-pemateri" role="tabpanel" aria-labelledby="tab-pemateri">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                        <span class="pp-cat-tag pp-cat-tag-rose">Peran Pemateri</span>
                        <span class="pp-cat-tag pp-cat-tag-navy">Bahan Ajar & Presentasi</span>
                    </div>
                    <h3 style="font-family: var(--font-display); font-size: 1.375rem; font-weight: 700; color: var(--pp-navy); margin: 0 0 0.5rem;">Kebutuhan Utama: Bahan ajar dan referensi presentasi</h3>
                    <p style="font-size: 0.875rem; color: var(--pp-muted); line-height: 1.65; margin: 0 0 1.5rem;">
                        Kumpulan template slide presentasi terstandar, silabus kuliah penataran, handout materi pembelajaran, dan referensi akademik untuk pemateri penataran tingkat daerah dan nasional.
                    </p>

                    <div style="display: flex; gap: 1.25rem; background: var(--pp-sky); border: 1px solid var(--pp-border); border-radius: 4px; padding: 1.25rem; margin-bottom: 1.75rem; align-items: center;">
                        <div style="width: 3.75rem; flex-shrink: 0; aspect-ratio: 2/3; border-radius: 3px; overflow: hidden; box-shadow: -2px 4px 10px rgba(14,39,71,0.18);">
                            <img src="{{ asset('images/cover-2.jpg') }}" alt="Paket Bahan Ajar Pemateri" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy">
                        </div>
                        <div>
                            <div style="font-family: var(--font-mono); font-size: 0.625rem; color: #b83565; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.25rem;">Rekomendasi Utama</div>
                            <h4 style="font-size: 0.9375rem; font-weight: 600; color: var(--pp-navy); margin: 0 0 0.25rem;">Kompilasi Bahan Tayang & Silabus Penataran</h4>
                            <p style="font-size: 0.8125rem; color: var(--pp-muted); margin: 0; line-height: 1.45;">Paket materi presentasi siap guna yang selaras dengan kurikulum nasional PB PERKEMI.</p>
                        </div>
                    </div>

                    <a href="#koleksi" id="cta-peran-pemateri" class="btn-primary" onclick="filterFromCategory('bahan')">
                        Lihat materi pemateri
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </a>
                </div>

                {{-- Panel 6: Penyelenggara --}}
                <div class="pp-role-panel" id="panel-penyelenggara" role="tabpanel" aria-labelledby="tab-penyelenggara">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                        <span class="pp-cat-tag pp-cat-tag-navy">Peran Penyelenggara</span>
                        <span class="pp-cat-tag pp-cat-tag-blue">Teknis & Administrasi</span>
                    </div>
                    <h3 style="font-family: var(--font-display); font-size: 1.375rem; font-weight: 700; color: var(--pp-navy); margin: 0 0 0.5rem;">Kebutuhan Utama: Panduan teknis dan administrasi kegiatan</h3>
                    <p style="font-size: 0.875rem; color: var(--pp-muted); line-height: 1.65; margin: 0 0 1.5rem;">
                        Panduan tata kelola penataran, standard operating procedure (SOP), template surat kepengurusan, formulir pendaftaran, checklist logistik, dan laporan pertanggungjawaban acara.
                    </p>

                    <div style="display: flex; gap: 1.25rem; background: var(--pp-sky); border: 1px solid var(--pp-border); border-radius: 4px; padding: 1.25rem; margin-bottom: 1.75rem; align-items: center;">
                        <div style="width: 3.75rem; flex-shrink: 0; aspect-ratio: 2/3; border-radius: 3px; overflow: hidden; box-shadow: -2px 4px 10px rgba(14,39,71,0.18);">
                            <img src="{{ asset('images/cover-3.jpg') }}" alt="Panduan Administrasi Penataran" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy">
                        </div>
                        <div>
                            <div style="font-family: var(--font-mono); font-size: 0.625rem; color: var(--pp-navy); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.25rem;">Rekomendasi Utama</div>
                            <h4 style="font-size: 0.9375rem; font-weight: 600; color: var(--pp-navy); margin: 0 0 0.25rem;">Panduan Operasional & Template Administrasi Penataran</h4>
                            <p style="font-size: 0.8125rem; color: var(--pp-muted); margin: 0; line-height: 1.45;">Panduan langkah-demi-langkah bagi panitia pelaksana dari pra-kegiatan hingga evaluasi akhir.</p>
                        </div>
                    </div>

                    <a href="#koleksi" id="cta-peran-penyelenggara" class="btn-primary" onclick="filterFromCategory('all')">
                        Lihat materi penyelenggara
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </a>
                </div>

            </div>
        </div>
    </div>
</section>

{{-- ═══════════════════════════════════════════════════════════
     SOROTAN MATERI UTAMA
     ═══════════════════════════════════════════════════════════ --}}
<section class="pp-spotlight pp-section" id="sorotan" aria-labelledby="sorotan-heading">
    <div class="pp-container">
        <div class="pp-spotlight-inner">

            <div class="reveal">
                <div class="pp-spotlight-cover">
                    <img src="{{ asset('images/cover-2.jpg') }}" alt="Sampul Buku Panduan Umum Penataran Nasional PERKEMI" class="book-cover-img" loading="lazy">
                    <div class="book-spine-effect"></div>
                    <div class="book-bookmark-ribbon" aria-hidden="true"></div>
                </div>
            </div>

            <div class="reveal reveal-delay-2">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.25rem;">
                    <span class="pp-cat-tag pp-cat-tag-blue">Penataran Nasional</span>
                    <span class="pp-cat-tag pp-cat-tag-navy">PDF · 2025</span>
                </div>
                <h2 id="sorotan-heading" class="pp-heading-md" style="margin-bottom: 1rem;">Buku Panduan Umum Penataran Nasional PERKEMI</h2>
                <p class="pp-body-lg" style="margin-bottom: 1.5rem;">Referensi resmi dan komprehensif bagi seluruh elemen penataran PERKEMI. Memuat kurikulum nasional, standar kompetensi, prosedur kegiatan, dan panduan pelaksanaan dari persiapan hingga penutupan.</p>

                <div style="display: grid; grid-template-columns: auto auto; gap: 0.5rem 2rem; margin-bottom: 1.75rem; padding: 1.25rem 0; border-top: 1px solid var(--pp-border); border-bottom: 1px solid var(--pp-border);">
                    <div>
                        <div style="font-family: var(--font-mono); font-size: 0.5625rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--pp-muted); margin-bottom: 0.25rem;">Penulis</div>
                        <div style="font-size: 0.875rem; font-weight: 500; color: var(--pp-navy);">Tim Kurikulum PERKEMI</div>
                    </div>
                    <div>
                        <div style="font-family: var(--font-mono); font-size: 0.5625rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--pp-muted); margin-bottom: 0.25rem;">Format</div>
                        <div style="font-size: 0.875rem; font-weight: 500; color: var(--pp-navy);">PDF · 312 halaman</div>
                    </div>
                    <div>
                        <div style="font-family: var(--font-mono); font-size: 0.5625rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--pp-muted); margin-bottom: 0.25rem;">Terbit</div>
                        <div style="font-size: 0.875rem; font-weight: 500; color: var(--pp-navy);">Januari 2025</div>
                    </div>
                    <div>
                        <div style="font-family: var(--font-mono); font-size: 0.5625rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--pp-muted); margin-bottom: 0.25rem;">Untuk</div>
                        <div style="font-size: 0.875rem; font-weight: 500; color: var(--pp-navy);">Semua Peran</div>
                    </div>
                </div>

                <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
                    <a href="#" id="sorotan-baca" class="btn-primary">
                        Baca Materi
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </a>
                    <a href="#" id="sorotan-simpan" class="btn-outline">Simpan ke Koleksi</a>
                </div>
            </div>

        </div>
    </div>
</section>

{{-- ═══════════════════════════════════════════════════════════
     RILIS & PEMBARUAN TERBARU
     ═══════════════════════════════════════════════════════════ --}}
<section id="terbaru" class="pp-section" aria-labelledby="terbaru-heading">
    <div class="pp-container">

        <div style="display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem; flex-wrap: wrap;" class="reveal">
            <div>
                <span class="pp-eyebrow" style="margin-bottom: 0.75rem;">Terbaru</span>
                <h2 id="terbaru-heading" class="pp-heading-lg">Baru ditambahkan<br>ke pustaka.</h2>
            </div>
            <a href="#" id="lihat-semua-pembaruan" class="btn-ghost" style="flex-shrink: 0;">
                Lihat semua pembaruan
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </a>
        </div>

        <div class="pp-updates-list reveal" role="list" aria-label="Daftar materi terbaru yang ditambahkan">

            <a href="#" id="update-1" class="pp-update-row" role="listitem">
                <span class="pp-update-date">14 Sep 2025</span>
                <span class="pp-update-title">Panduan Pelaksanaan Penataran Tingkat Daerah 2025</span>
                <span class="pp-update-type pp-cat-tag-blue">Penataran</span>
            </a>

            <a href="#" id="update-2" class="pp-update-row" role="listitem">
                <span class="pp-update-date">10 Sep 2025</span>
                <span class="pp-update-title">Modul Teknik Dasar Kempo untuk Pelatih Pemula</span>
                <span class="pp-update-type pp-cat-tag-green">Kepelatihan</span>
            </a>

            <a href="#" id="update-3" class="pp-update-row" role="listitem">
                <span class="pp-update-date">5 Sep 2025</span>
                <span class="pp-update-title">Update Regulasi Perwasitan Randori — Edisi Revisi</span>
                <span class="pp-update-type pp-cat-tag-orange">Perwasitan</span>
            </a>

            <a href="#" id="update-4" class="pp-update-row" role="listitem">
                <span class="pp-update-date">1 Sep 2025</span>
                <span class="pp-update-title">Formulir Standar Pengujian Kyu — Template 2025</span>
                <span class="pp-update-type pp-cat-tag-rose">Pengujian</span>
            </a>

            <a href="#" id="update-5" class="pp-update-row" role="listitem">
                <span class="pp-update-date">28 Agu 2025</span>
                <span class="pp-update-title">Slide Presentasi: Metodologi Pengajaran Seni Bela Diri</span>
                <span class="pp-update-type pp-cat-tag-purple">Pemateri</span>
            </a>

            <a href="#" id="update-6" class="pp-update-row" role="listitem">
                <span class="pp-update-date">22 Agu 2025</span>
                <span class="pp-update-title">Checklist Administrasi Penyelenggaraan Penataran Nasional</span>
                <span class="pp-update-type pp-cat-tag-navy">Administrasi</span>
            </a>

        </div>
    </div>
</section>

{{-- ═══════════════════════════════════════════════════════════
     MENGAPA PUSTAKA PENATARAN
     ═══════════════════════════════════════════════════════════ --}}
<section id="tentang" style="padding-top: 4.5rem; padding-bottom: 4.5rem; background-color: var(--pp-white); border-top: 1px solid var(--pp-border);" aria-labelledby="tentang-heading">
    <div class="pp-container">

        {{-- PERKEMI Formal Identity Badge --}}
        <div class="reveal" style="display: flex; align-items: center; gap: 0.875rem; margin-bottom: 1.25rem;">
            <div style="width: 2.25rem; height: 2.25rem; background: var(--pp-navy); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: var(--pp-white); flex-shrink: 0;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                    <path d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z"/>
                    <path d="M12 8v8M8 12h8"/>
                </svg>
            </div>
            <div>
                <span class="pp-eyebrow" style="margin: 0; font-size: 0.625rem; letter-spacing: 0.1em;">Pusat Sumber Belajar Digital</span>
                <div style="font-family: var(--font-display); font-size: 0.875rem; font-weight: 700; color: var(--pp-navy);">Persaudaraan Bela Diri Kempo Indonesia (PERKEMI)</div>
            </div>
        </div>

        <div class="reveal" style="max-width: 44rem; margin-bottom: 2.5rem;">
            <h2 id="tentang-heading" class="pp-heading-lg" style="margin-bottom: 1rem;">Pengetahuan yang terhubung untuk penataran yang lebih baik.</h2>
            <p class="pp-body-lg" style="margin: 0; color: var(--pp-muted);">
                Pustaka Penataran adalah pusat sumber belajar digital resmi PERKEMI. Dibangun untuk menyatukan khazanah literasi bela diri Shorinji Kempo, modul penataran, kurikulum kepelatihan, dan regulasi resmi dalam satu portal terpadu demi peningkatan mutu penataran nasional.
            </p>
        </div>

        {{-- Tiga Nilai Utama --}}
        <div class="pp-values-grid reveal reveal-delay-1" role="list" aria-label="Tiga nilai utama Pustaka Penataran">
            <div class="pp-value-card" role="listitem" style="border-top-color: #0B63CE;">
                <div style="font-family: var(--font-mono); font-size: 0.6875rem; font-weight: 600; color: var(--pp-primary); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.5rem;">Nilai 01</div>
                <h3 class="pp-value-title">Terpusat</h3>
                <p class="pp-value-desc">Materi berada dalam satu akses. Mengintegrasikan seluruh buku digital, modul penataran, dan referensi kurikulum PERKEMI dalam satu pintu yang mudah dijangkau dari mana pun.</p>
            </div>

            <div class="pp-value-card" role="listitem" style="border-top-color: #20A47A;">
                <div style="font-family: var(--font-mono); font-size: 0.6875rem; font-weight: 600; color: #157a5a; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.5rem;">Nilai 02</div>
                <h3 class="pp-value-title">Terarah</h3>
                <p class="pp-value-desc">Materi disusun berdasarkan peran dan kebutuhan. Memastikan setiap kenshi, pelatih, penguji, wasit, pemateri, hingga penyelenggara menemukan materi yang tepat sasaran tanpa distraksi.</p>
            </div>

            <div class="pp-value-card" role="listitem" style="border-top-color: #EE9B25;">
                <div style="font-family: var(--font-mono); font-size: 0.6875rem; font-weight: 600; color: #a66a0a; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.5rem;">Nilai 03</div>
                <h3 class="pp-value-title">Berkelanjutan</h3>
                <p class="pp-value-desc">Koleksi dapat diperbarui sesuai kebutuhan penataran. Dokumen kurikulum, instrumen ujian, dan regulasi pertandingan diselaraskan secara berkesinambungan dengan standar PB PERKEMI.</p>
            </div>
        </div>

        {{-- Blok Editorial: Untuk siapa portal ini dibuat? --}}
        <div class="pp-who-block reveal reveal-delay-2">
            <div style="max-width: 36rem;">
                <span style="font-family: var(--font-mono); font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--pp-primary); display: block; margin-bottom: 0.375rem;">Cakupan Pengguna</span>
                <h3 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; color: var(--pp-navy); margin: 0 0 0.5rem;">Untuk siapa portal ini dibuat?</h3>
                <p style="font-size: 0.875rem; color: var(--pp-muted); line-height: 1.6; margin: 0;">Portal ini secara khusus melayani enam peran kunci dalam ekosistem penataran PERKEMI:</p>
            </div>

            <div class="pp-who-grid" role="list" aria-label="Enam peran pengguna">
                <div class="pp-who-item" role="listitem">
                    <div class="pp-who-role">Peserta</div>
                    <div class="pp-who-desc">Materi dasar & modul persiapan penataran daerah/nasional.</div>
                </div>
                <div class="pp-who-item" role="listitem">
                    <div class="pp-who-role">Pelatih</div>
                    <div class="pp-who-desc">Metodologi kepelatihan dan kurikulum pembinaan kenshi.</div>
                </div>
                <div class="pp-who-item" role="listitem">
                    <div class="pp-who-role">Penguji</div>
                    <div class="pp-who-desc">Pedoman standar evaluasi, rubrik skor, dan instrumen ujian.</div>
                </div>
                <div class="pp-who-item" role="listitem">
                    <div class="pp-who-role">Wasit</div>
                    <div class="pp-who-desc">Regulasi pertandingan resmi dan kode etik perwasitan.</div>
                </div>
                <div class="pp-who-item" role="listitem">
                    <div class="pp-who-role">Pemateri</div>
                    <div class="pp-who-desc">Bahan ajar, slide presentasi, dan silabus pengajaran.</div>
                </div>
                <div class="pp-who-item" role="listitem">
                    <div class="pp-who-role">Penyelenggara</div>
                    <div class="pp-who-desc">Panduan administrasi, SOP, dan tata laksana kegiatan.</div>
                </div>
            </div>
        </div>

    </div>
</section>

{{-- ═══════════════════════════════════════════════════════════
     12. MENGAPA PUSTAKA PENATARAN
     ═══════════════════════════════════════════════════════════ --}}
<section id="mengapa" style="padding-top: 4.5rem; padding-bottom: 4.5rem; background-color: var(--pp-bg); border-top: 1px solid var(--pp-border);" aria-labelledby="mengapa-heading">
    <div class="pp-container">
        <div class="reveal" style="max-width: 40rem;">
            <span class="pp-eyebrow" style="margin-bottom: 0.75rem;">Mengapa Pustaka Penataran</span>
            <h2 id="mengapa-heading" class="pp-heading-lg">Satu ruang belajar untuk penataran yang lebih terarah.</h2>
            <p class="pp-body-lg" style="margin-top: 0.75rem; color: var(--pp-muted);">
                Dirancang khusus sebagai infrastruktur pengetahuan terpadu PERKEMI untuk menjamin konsistensi materi dan kemudahan akses pembelajaran nasional.
            </p>
        </div>

        <div class="pp-why-grid reveal reveal-delay-1" role="list" aria-label="Empat manfaat utama Pustaka Penataran">
            <div class="pp-why-item" role="listitem">
                <div class="pp-why-num" aria-hidden="true">01</div>
                <div>
                    <h3 class="pp-why-title">Materi terpusat dan mudah ditemukan</h3>
                    <p class="pp-why-desc">Seluruh buku digital, modul penataran, dan bahan ajar dikonsolidasikan dalam satu portal terpadu yang dapat dicari dengan cepat dan diperbarui secara berkala.</p>
                </div>
            </div>

            <div class="pp-why-item" role="listitem">
                <div class="pp-why-num" aria-hidden="true">02</div>
                <div>
                    <h3 class="pp-why-title">Referensi yang terorganisir per peran</h3>
                    <p class="pp-why-desc">Struktur kurikulum dipilah secara terarah untuk kenshi peserta, pelatih dojo, penguji kyu/dan, wasit pertandingan, pemateri, hingga panitia pelaksana kegiatan.</p>
                </div>
            </div>

            <div class="pp-why-item" role="listitem">
                <div class="pp-why-num" aria-hidden="true">03</div>
                <div>
                    <h3 class="pp-why-title">Mendukung pembelajaran yang konsisten</h3>
                    <p class="pp-why-desc">Materi yang terstandarisasi dan diverifikasi secara resmi memastikan seluruh kegiatan penataran di Indonesia berjalan dengan referensi yang sama dan akurat.</p>
                </div>
            </div>

            <div class="pp-why-item" role="listitem">
                <div class="pp-why-num" aria-hidden="true">04</div>
                <div>
                    <h3 class="pp-why-title">Akses fleksibel dari berbagai perangkat</h3>
                    <p class="pp-why-desc">Baca langsung di peramban atau unduh berkas resmi PDF untuk digunakan secara offline di dojo — di komputer, tablet, maupun ponsel pintar.</p>
                </div>
            </div>
        </div>
    </div>
</section>

{{-- ═══════════════════════════════════════════════════════════
     13. CARA MENGGUNAKAN PORTAL
     ═══════════════════════════════════════════════════════════ --}}
<section id="cara-menggunakan" class="pp-section" style="background-color: var(--pp-white); border-top: 1px solid var(--pp-border);" aria-labelledby="cara-heading">
    <div class="pp-container">
        <div class="reveal" style="max-width: 36rem; margin-bottom: 0;">
            <span class="pp-eyebrow" style="margin-bottom: 0.75rem;">Cara Menggunakan</span>
            <h2 id="cara-heading" class="pp-heading-lg">Mudah digunakan dari<br>awal hingga selesai.</h2>
        </div>
        <div class="pp-how-grid">

            <div class="pp-how-item reveal reveal-delay-1">
                <div class="pp-how-step">Langkah 01</div>
                <h3 class="pp-how-title">Masuk ke Portal</h3>
                <p class="pp-how-desc">Akses Pustaka Penataran menggunakan akun PERKEMI Anda. Jika belum punya akun, hubungi pengurus atau penyelenggara kegiatan untuk mendapatkan akses.</p>
            </div>

            <div class="pp-how-item reveal reveal-delay-2">
                <div class="pp-how-step">Langkah 02</div>
                <h3 class="pp-how-title">Cari atau Pilih Kategori</h3>
                <p class="pp-how-desc">Gunakan kolom pencarian untuk menemukan materi spesifik, atau telusuri koleksi berdasarkan kategori dan peran yang sesuai kebutuhan Anda.</p>
            </div>

            <div class="pp-how-item reveal reveal-delay-3">
                <div class="pp-how-step">Langkah 03</div>
                <h3 class="pp-how-title">Baca, Simpan, atau Gunakan</h3>
                <p class="pp-how-desc">Baca materi langsung di portal, simpan ke koleksi pribadi Anda, atau unduh dalam format PDF untuk digunakan dalam kegiatan penataran.</p>
            </div>

        </div>

        {{-- Visual Pendukung Antarmuka / Workflow Schematic --}}
        <div class="reveal reveal-delay-2" style="margin-top: 2rem; background: var(--pp-sky); border: 1px solid var(--pp-border); border-radius: 4px; padding: 1.25rem 1.75rem; display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="width: 2.5rem; height: 2.5rem; border-radius: 4px; background: var(--pp-white); color: var(--pp-primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: var(--shadow-sm);">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                </div>
                <div>
                    <div style="font-size: 0.875rem; font-weight: 600; color: var(--pp-navy);">Akses Belajar Mandiri & Kolaboratif</div>
                    <div style="font-size: 0.8125rem; color: var(--pp-muted);">Didukung format dokumen PDF resmi terakreditasi PB PERKEMI</div>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.625rem; flex-wrap: wrap;">
                <span class="pp-cat-tag pp-cat-tag-green">Tersinkronisasi 2025</span>
                <span class="pp-cat-tag pp-cat-tag-blue">Multi-Perangkat</span>
                <span class="pp-cat-tag pp-cat-tag-navy">Offline PDF</span>
            </div>
        </div>
    </div>
</section>

{{-- ═══════════════════════════════════════════════════════════
     FAQ
     ═══════════════════════════════════════════════════════════ --}}
<section id="bantuan" style="padding-top: 4.5rem; padding-bottom: 4.5rem; background-color: var(--pp-white); border-top: 1px solid var(--pp-border);" aria-labelledby="bantuan-heading">
    <div class="pp-container">

        <div class="reveal" style="max-width: 42rem; margin-bottom: 2.5rem;">
            <span class="pp-eyebrow" style="margin-bottom: 0.75rem;">Pusat Bantuan & Panduan</span>
            <h2 id="bantuan-heading" class="pp-heading-lg" style="margin-bottom: 1rem;">Butuh bantuan menggunakan portal?</h2>
            <p class="pp-body-lg" style="margin: 0; color: var(--pp-muted);">
                Temukan panduan langkah demi langkah, jawaban atas pertanyaan umum, dan jalur koordinasi resmi dengan pengurus penataran PERKEMI.
            </p>
        </div>

        {{-- 3 Jalur Bantuan --}}
        <div class="pp-help-channels reveal reveal-delay-1" role="list" aria-label="Tiga jalur bantuan portal">
            <div class="pp-help-card" role="listitem">
                <div class="pp-help-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        <path d="M8 7h8M8 11h6"/>
                    </svg>
                </div>
                <h3 class="pp-help-title">Panduan Memulai</h3>
                <p class="pp-help-desc">Pelajari langkah awal mengakses modul, navigasi filter katalog, pembacaan berkas digital, dan tata cara mengunduh materi penataran.</p>
            </div>

            <div class="pp-help-card" role="listitem">
                <div class="pp-help-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                </div>
                <h3 class="pp-help-title">Pertanyaan Umum</h3>
                <p class="pp-help-desc">Jawaban terperinci mengenai kendala teknis yang kerap ditemui seputar akun, format dokumen, dan ketentuan hak akses materi pembelajaran.</p>
            </div>

            <div class="pp-help-card" role="listitem">
                <div class="pp-help-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                </div>
                <h3 class="pp-help-title">Hubungi Admin</h3>
                <p class="pp-help-desc">Panduan resmi verifikasi keanggotaan kenshi, pembaruan hak akses peran khusus, dan koordinasi administratif dengan sekretariat PERKEMI.</p>
            </div>
        </div>

        {{-- FAQ Accordion (5 Pertanyaan Wajib) --}}
        <div style="margin-top: 3.5rem;">
            <div style="display: flex; align-items: flex-end; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 1.5rem;" class="reveal">
                <div>
                    <span class="pp-eyebrow" style="margin-bottom: 0.5rem;">FAQ</span>
                    <h3 style="font-family: var(--font-display); font-size: 1.375rem; font-weight: 700; color: var(--pp-navy); margin: 0;">Pertanyaan yang sering ditanyakan</h3>
                </div>
                <a href="#bantuan" class="btn-primary" id="cta-buka-bantuan" style="font-size: 0.8125rem; padding: 0.5rem 1.125rem;">
                    Buka Pusat Bantuan
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </a>
            </div>

            <div class="pp-faq-list reveal reveal-delay-1" role="list" aria-label="Pertanyaan yang sering ditanyakan">

                {{-- Q1 --}}
                <div class="pp-faq-item open" role="listitem">
                    <button class="pp-faq-trigger" id="faq-btn-1" aria-expanded="true" aria-controls="faq-content-1">
                        Bagaimana cara masuk ke portal?
                        <svg class="pp-faq-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                            <path d="M8 3v10M3 8h10" stroke-linecap="round"/>
                        </svg>
                    </button>
                    <div class="pp-faq-content" id="faq-content-1" role="region" aria-labelledby="faq-btn-1">
                        Akses ke Pustaka Penataran terhubung langsung dengan basis data resmi kenshi dan pengurus PERKEMI. Saat ini akun diberikan melalui penugasan resmi panitia penataran atau pengurus daerah PERKEMI. Jika Anda adalah peserta atau pemateri terdaftar, gunakan kredensial yang telah didistribusikan oleh sekretariat kegiatan.
                    </div>
                </div>

                {{-- Q2 --}}
                <div class="pp-faq-item" role="listitem">
                    <button class="pp-faq-trigger" id="faq-btn-2" aria-expanded="false" aria-controls="faq-content-2">
                        Bagaimana cara mencari modul?
                        <svg class="pp-faq-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                            <path d="M8 3v10M3 8h10" stroke-linecap="round"/>
                        </svg>
                    </button>
                    <div class="pp-faq-content" id="faq-content-2" role="region" aria-labelledby="faq-btn-2">
                        Anda dapat menggunakan kolom pencarian cepat di bagian atas halaman dengan mengetik judul modul, kata kunci topik, atau peran. Anda juga dapat memilih filter kategori cepat seperti Modul Penataran, Bahan Ajar, Referensi Wasit, Materi Pelatih, atau Pedoman Penguji untuk mempersempit hasil pencarian secara instan.
                    </div>
                </div>

                {{-- Q3 --}}
                <div class="pp-faq-item" role="listitem">
                    <button class="pp-faq-trigger" id="faq-btn-3" aria-expanded="false" aria-controls="faq-content-3">
                        Apakah materi dapat diakses dari ponsel?
                        <svg class="pp-faq-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                            <path d="M8 3v10M3 8h10" stroke-linecap="round"/>
                        </svg>
                    </button>
                    <div class="pp-faq-content" id="faq-content-3" role="region" aria-labelledby="faq-btn-3">
                        Ya, seluruh antarmuka dan berkas materi di Pustaka Penataran dirancang responsif dan kompatibel dengan layar smartphone, tablet, maupun desktop komputer. Anda dapat membaca materi secara langsung melalui browser atau mengunduhnya dalam format PDF untuk dibaca offline saat kegiatan penataran di dojo.
                    </div>
                </div>

                {{-- Q4 --}}
                <div class="pp-faq-item" role="listitem">
                    <button class="pp-faq-trigger" id="faq-btn-4" aria-expanded="false" aria-controls="faq-content-4">
                        Bagaimana jika saya tidak dapat membuka materi?
                        <svg class="pp-faq-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                            <path d="M8 3v10M3 8h10" stroke-linecap="round"/>
                        </svg>
                    </button>
                    <div class="pp-faq-content" id="faq-content-4" role="region" aria-labelledby="faq-btn-4">
                        Pastikan koneksi internet Anda stabil saat memuat dokumen pertama kali dan peramban Anda mendukung pembaca PDF standar. Beberapa materi khusus (seperti instrumen pengujian dan referensi wasit) memiliki status akses terbatas yang hanya dapat dibuka oleh akun dengan peran terkait yang telah diverifikasi oleh pengurus.
                    </div>
                </div>

                {{-- Q5 --}}
                <div class="pp-faq-item" role="listitem">
                    <button class="pp-faq-trigger" id="faq-btn-5" aria-expanded="false" aria-controls="faq-content-5">
                        Kepada siapa saya menghubungi untuk bantuan?
                        <svg class="pp-faq-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                            <path d="M8 3v10M3 8h10" stroke-linecap="round"/>
                        </svg>
                    </button>
                    <div class="pp-faq-content" id="faq-content-5" role="region" aria-labelledby="faq-btn-5">
                        Untuk bantuan administrasi kepesertaan, hubungi panitia pelaksana penataran di wilayah Anda. Untuk verifikasi data keanggotaan kenshi atau permohonan modul kurikulum nasional, koordinasi dilakukan secara berjenjang melalui sekretariat pengurus provinsi atau Pengurus Besar (PB) PERKEMI. Layanan informasi beroperasi sesuai jam kerja resmi sekretariat organisasi.
                    </div>
                </div>

            </div>

            {{-- Note informatif tanpa nomor/email fiktif --}}
            <div class="reveal reveal-delay-2" style="margin-top: 1.5rem; padding: 1rem 1.25rem; background: var(--pp-sky); border: 1px solid var(--pp-border); border-radius: 4px; display: flex; align-items: center; gap: 0.75rem;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--pp-primary)" stroke-width="1.75" style="flex-shrink: 0;" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <p style="font-size: 0.8125rem; color: var(--pp-muted); margin: 0; line-height: 1.5;">
                    <strong style="color: var(--pp-navy);">Catatan Pengguna:</strong> Layanan informasi teknis dan verifikasi akun kenshi dilayani langsung melalui sekretariat penyelenggara penataran PERKEMI selama jam operasional kerja resmi.
                </p>
            </div>
        </div>

    </div>
</section>

{{-- ═══════════════════════════════════════════════════════════
     CTA PENUTUP
     ═══════════════════════════════════════════════════════════ --}}
<section class="pp-cta-section pp-section" aria-labelledby="cta-heading">
    <div class="pp-container" style="position: relative; z-index: 1;">
        <div style="max-width: 48rem; margin: 0 auto; text-align: center;" class="reveal">
            <span style="font-family: var(--font-mono); font-size: 0.6875rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(234,245,255,0.5); display: block; margin-bottom: 1.25rem;">Pustaka Penataran PERKEMI</span>
            <h2 id="cta-heading" class="pp-heading-xl" style="color: var(--pp-white); margin-bottom: 1.25rem;">Mulai belajar dari<br>koleksi yang tepat.</h2>
            <p style="font-size: 1.0625rem; color: rgba(234,245,255,0.65); line-height: 1.7; margin-bottom: 2.5rem; max-width: 36rem; margin-left: auto; margin-right: auto;">
                Akses seluruh koleksi buku, modul penataran, dan bahan ajar PERKEMI dalam satu portal terintegrasi. Tersedia untuk semua peran, kapan saja, di mana saja.
            </p>
            <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 0.875rem;">
                <a href="#koleksi" id="cta-koleksi" class="btn-primary-navy">
                    Buka Koleksi Digital
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </a>
                @auth
                    <a href="#koleksi" id="cta-masuk" class="btn-outline-white">Jelajahi Koleksi</a>
                @else
                    <a href="{{ route('login') }}" id="cta-masuk" class="btn-outline-white">Masuk Portal</a>
                @endauth
            </div>
        </div>
    </div>
</section>

</main>

{{-- ═══════════════════════════════════════════════════════════
     FOOTER
     ═══════════════════════════════════════════════════════════ --}}
<footer class="pp-footer" role="contentinfo" aria-label="Footer Pustaka Penataran">
    <div class="pp-container" style="padding-top: 3.5rem; padding-bottom: 2.5rem;">

        <div class="pp-footer-grid">

            {{-- Identity --}}
            <div>
                <div style="display: flex; align-items: center; gap: 0.625rem; margin-bottom: 1.25rem;">
                    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                        <rect width="32" height="32" fill="#0B63CE" rx="4"/>
                        <rect x="7" y="7" width="12" height="18" rx="1.5" stroke="rgba(255,255,255,0.9)" stroke-width="1.5" fill="none"/>
                        <path d="M10 11h6M10 14h6M10 17h4" stroke="rgba(255,255,255,0.5)" stroke-width="1.25" stroke-linecap="round"/>
                        <rect x="17" y="9" width="8" height="16" rx="1" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
                    </svg>
                    <div>
                        <div style="font-family: var(--font-display); font-size: 1rem; font-weight: 700; color: rgba(234,245,255,0.9); line-height: 1.2;">Pustaka Penataran</div>
                        <div style="font-family: var(--font-mono); font-size: 0.5625rem; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(234,245,255,0.4);">Portal Buku Digital PERKEMI</div>
                    </div>
                </div>
                <p style="font-size: 0.875rem; color: rgba(234,245,255,0.5); line-height: 1.65; max-width: 22rem; margin: 0 0 1.5rem;">
                    Pusat akses digital untuk buku, modul penataran, bahan ajar, dan referensi pembelajaran PERKEMI. Tersedia untuk semua elemen penataran nasional.
                </p>
                <div style="font-family: var(--font-mono); font-size: 0.6875rem; letter-spacing: 0.06em; color: rgba(234,245,255,0.35); text-transform: uppercase;">
                    Persatuan Kempo Indonesia
                </div>
            </div>

            {{-- Portal --}}
            <div>
                <h3 class="pp-footer-heading">Portal</h3>
                <ul class="pp-footer-links">
                    <li><a href="#beranda" id="footer-beranda">Beranda</a></li>
                    <li><a href="#koleksi" id="footer-koleksi-link">Semua Koleksi</a></li>
                    <li><a href="#terbaru" id="footer-terbaru">Materi Terbaru</a></li>
                    <li><a href="#sorotan" id="footer-sorotan">Materi Unggulan</a></li>
                    <li><a href="#jalur-belajar" id="footer-jalur">Jalur Belajar</a></li>
                </ul>
            </div>

            {{-- Koleksi --}}
            <div>
                <h3 class="pp-footer-heading">Koleksi</h3>
                <ul class="pp-footer-links">
                    <li><a href="#koleksi" id="footer-penataran" onclick="filterFromCategory('penataran')">Penataran</a></li>
                    <li><a href="#koleksi" id="footer-kepelatihan" onclick="filterFromCategory('kepelatihan')">Kepelatihan</a></li>
                    <li><a href="#koleksi" id="footer-perwasitan" onclick="filterFromCategory('perwasitan')">Perwasitan</a></li>
                    <li><a href="#koleksi" id="footer-pengujian" onclick="filterFromCategory('pengujian')">Pengujian</a></li>
                    <li><a href="#koleksi" id="footer-pemateri" onclick="filterFromCategory('bahan')">Materi Pemateri</a></li>
                    <li><a href="#koleksi" id="footer-admin" onclick="filterFromCategory('all')">Administrasi</a></li>
                </ul>
            </div>

            {{-- Bantuan & Tentang --}}
            <div>
                <h3 class="pp-footer-heading">Bantuan</h3>
                <ul class="pp-footer-links" style="margin-bottom: 1.5rem;">
                    <li><a href="#cara-menggunakan" id="footer-cara">Cara Menggunakan</a></li>
                    <li><a href="#bantuan" id="footer-faq">Pertanyaan Umum</a></li>
                    <li><a href="#bantuan" id="footer-kontak">Hubungi Admin</a></li>
                </ul>
                <h3 class="pp-footer-heading" style="margin-top: 1.5rem;">Tentang PERKEMI</h3>
                <ul class="pp-footer-links">
                    <li><a href="#tentang" id="footer-perkemi">Tentang Portal</a></li>
                    <li><a href="#peran" id="footer-pengurus">Untuk Peran Anda</a></li>
                </ul>
            </div>

        </div>

        <div class="pp-footer-bottom">
            <p class="pp-footer-copyright">© 2025 PERKEMI. Pustaka Penataran. Hak cipta dilindungi.</p>
            <div class="pp-footer-legal">
                <a href="#" id="footer-privasi">Kebijakan Privasi</a>
                <a href="#" id="footer-ketentuan">Ketentuan Penggunaan</a>
            </div>
        </div>

    </div>
</footer>

{{-- ═══════════════════════════════════════════════════════════
     JAVASCRIPT
     ═══════════════════════════════════════════════════════════ --}}
<script>
(function () {
    'use strict';

    /* Sticky header */
    const header = document.getElementById('site-header');
    const onScroll = () => {
        header.classList.toggle('scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    /* Mobile menu & Backdrop */
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');
    let menuOpen = false;

    function openMobileMenu() {
        menuOpen = true;
        mobileMenu.classList.add('open');
        if (mobileMenuBackdrop) mobileMenuBackdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
        mobileMenuBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 3L13 13M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
        mobileMenuBtn.setAttribute('aria-label', 'Tutup menu navigasi');
    }

    window.closeMobileMenu = function () {
        menuOpen = false;
        mobileMenu.classList.remove('open');
        if (mobileMenuBackdrop) mobileMenuBackdrop.classList.remove('open');
        document.body.style.overflow = '';
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 4H14M2 8H14M2 12H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
        mobileMenuBtn.setAttribute('aria-label', 'Buka menu navigasi');
    };

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function () {
            menuOpen ? closeMobileMenu() : openMobileMenu();
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menuOpen) {
            closeMobileMenu();
            if (mobileMenuBtn) mobileMenuBtn.focus();
        }
    });

    /* Scroll Spy: beranda, koleksi, kategori, peran, tentang, bantuan */
    const spySections = ['beranda', 'koleksi', 'kategori', 'peran', 'tentang', 'bantuan'];
    const navLinks = {
        'beranda': document.getElementById('nav-beranda'),
        'koleksi': document.getElementById('nav-koleksi'),
        'kategori': document.getElementById('nav-kategori'),
        'peran': document.getElementById('nav-peran'),
        'tentang': document.getElementById('nav-tentang'),
        'bantuan': document.getElementById('nav-bantuan')
    };
    const mobileNavLinks = {
        'beranda': document.getElementById('mobile-nav-beranda'),
        'koleksi': document.getElementById('mobile-nav-koleksi'),
        'kategori': document.getElementById('mobile-nav-kategori'),
        'peran': document.getElementById('mobile-nav-peran'),
        'tentang': document.getElementById('mobile-nav-tentang'),
        'bantuan': document.getElementById('mobile-nav-bantuan')
    };

    function updateScrollSpy() {
        const scrollPosition = window.scrollY + 140; // offset for sticky header
        let currentSectionId = 'beranda';

        for (let i = 0; i < spySections.length; i++) {
            const sec = document.getElementById(spySections[i]);
            if (sec) {
                const secTop = sec.offsetTop;
                if (scrollPosition >= secTop) {
                    currentSectionId = spySections[i];
                }
            }
        }

        spySections.forEach(id => {
            const isCurrent = id === currentSectionId;
            if (navLinks[id]) {
                navLinks[id].classList.toggle('active', isCurrent);
            }
            if (mobileNavLinks[id]) {
                mobileNavLinks[id].classList.toggle('active', isCurrent);
            }
        });
    }
    window.addEventListener('scroll', updateScrollSpy, { passive: true });
    updateScrollSpy();

    /* Role Tab Switcher */
    window.switchRoleTab = function (roleId) {
        const tabs = document.querySelectorAll('.pp-role-tab');
        const panels = document.querySelectorAll('.pp-role-panel');

        tabs.forEach(tab => {
            const isTarget = tab.id === 'tab-' + roleId;
            tab.classList.toggle('active', isTarget);
            tab.setAttribute('aria-selected', isTarget ? 'true' : 'false');
        });

        panels.forEach(panel => {
            panel.classList.toggle('active', panel.id === 'panel-' + roleId);
        });
    };

    /* Filter chips & instant search */
    const chips = document.querySelectorAll('.pp-chip');
    const searchInput = document.getElementById('hero-search');
    const searchBtn = document.getElementById('hero-search-btn');
    const collectionCards = document.querySelectorAll('.pp-collection-grid > a');
    const emptyState = document.getElementById('collection-empty');

    function filterCollection(filterVal, query) {
        const q = (query || '').trim().toLowerCase();
        let matchCount = 0;

        collectionCards.forEach(card => {
            const cat = (card.getAttribute('data-category') || '').toLowerCase();
            const title = (card.getAttribute('data-title') || '').toLowerCase();
            const textContent = card.textContent.toLowerCase();

            const matchesCategory = (filterVal === 'all' || !filterVal) || cat.includes(filterVal);
            const matchesQuery = !q || title.includes(q) || textContent.includes(q);

            if (matchesCategory && matchesQuery) {
                card.style.display = '';
                card.style.opacity = '1';
                matchCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (emptyState) {
            emptyState.style.display = matchCount === 0 ? 'block' : 'none';
        }
    }

    chips.forEach(chip => {
        chip.addEventListener('click', function () {
            chips.forEach(c => { c.classList.remove('active'); c.setAttribute('aria-pressed', 'false'); });
            this.classList.add('active');
            this.setAttribute('aria-pressed', 'true');
            const filter = this.getAttribute('data-filter') || 'all';
            const query = searchInput ? searchInput.value : '';
            filterCollection(filter, query);

            const colSec = document.getElementById('koleksi');
            if (colSec && window.scrollY < colSec.offsetTop - 200) {
                colSec.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const activeChip = document.querySelector('.pp-chip.active');
            const filter = activeChip ? activeChip.getAttribute('data-filter') : 'all';
            filterCollection(filter, this.value);
        });

        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const colSec = document.getElementById('koleksi');
                if (colSec) colSec.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', function () {
            const activeChip = document.querySelector('.pp-chip.active');
            const filter = activeChip ? activeChip.getAttribute('data-filter') : 'all';
            filterCollection(filter, searchInput.value);
            const colSec = document.getElementById('koleksi');
            if (colSec) colSec.scrollIntoView({ behavior: 'smooth' });
        });
    }

    /* Category to Collection Bridge */
    window.filterFromCategory = function (catKey) {
        chips.forEach(c => {
            const matches = c.getAttribute('data-filter') === catKey;
            c.classList.toggle('active', matches);
            c.setAttribute('aria-pressed', matches ? 'true' : 'false');
        });
        if (searchInput) searchInput.value = '';
        filterCollection(catKey, '');
        const colSec = document.getElementById('koleksi');
        if (colSec) {
            colSec.scrollIntoView({ behavior: 'smooth' });
        }
    };

    /* Reset Collection Filter */
    window.resetCollectionFilter = function () {
        if (searchInput) searchInput.value = '';
        chips.forEach(c => {
            const isAll = c.getAttribute('data-filter') === 'all';
            c.classList.toggle('active', isAll);
            c.setAttribute('aria-pressed', isAll ? 'true' : 'false');
        });
        filterCollection('all', '');
        const colSec = document.getElementById('koleksi');
        if (colSec) {
            colSec.scrollIntoView({ behavior: 'smooth' });
        }
    };

    /* FAQ accordion */
    const faqItems = document.querySelectorAll('.pp-faq-item');
    faqItems.forEach(item => {
        const trigger = item.querySelector('.pp-faq-trigger');
        if (!trigger) return;
        trigger.addEventListener('click', function () {
            const isOpen = item.classList.contains('open');
            faqItems.forEach(i => {
                i.classList.remove('open');
                const t = i.querySelector('.pp-faq-trigger');
                if (t) t.setAttribute('aria-expanded', 'false');
            });
            if (!isOpen) {
                item.classList.add('open');
                trigger.setAttribute('aria-expanded', 'true');
            }
        });
    });

    /* Scroll reveal via IntersectionObserver */
    const revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
        revealEls.forEach(el => observer.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('visible'));
    }

    /* Respect reduced motion */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        revealEls.forEach(el => el.classList.add('visible'));
    }

}());
</script>

</body>
</html>
