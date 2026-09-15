<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Admin Dashboard') — Pustaka Penataran PERKEMI</title>
    <link rel="icon" href="{{ asset('favicon.ico') }}">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">

    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="pp-admin-shell">
    <a href="#admin-main-content" class="skip-link">Lewati ke konten utama</a>

    {{-- Mobile Backdrop --}}
    <div id="admin-mobile-backdrop" class="pp-admin-sidebar-backdrop" onclick="toggleAdminSidebar()" aria-hidden="true"></div>

    {{-- Sidebar (Navy #0E2747) --}}
    <aside id="admin-sidebar" class="pp-admin-sidebar" aria-label="Navigasi Admin">
        {{-- Brand --}}
        <div class="pp-admin-brand">
            <a href="{{ route('admin.dashboard') }}" class="pp-admin-brand-info">
                <div class="pp-admin-brand-badge" aria-hidden="true">PP</div>
                <div class="pp-admin-brand-text">
                    <h2>Pustaka Penataran</h2>
                    <span class="pp-admin-tag">ADMIN PORTAL</span>
                </div>
            </a>
            <button type="button" class="lg:hidden" onclick="toggleAdminSidebar()" aria-label="Tutup menu" style="background: none; border: none; color: #fff; cursor: pointer; padding: 0.25rem;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>

        {{-- Navigasi 8 Menu Utama --}}
        <nav class="pp-admin-nav-section">
            <div class="pp-admin-nav-heading">MENU UTAMA</div>

            {{-- 1. Ringkasan --}}
            <a href="{{ route('admin.dashboard') }}" class="pp-admin-nav-item {{ request()->routeIs('admin.dashboard') ? 'active' : '' }}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span>Ringkasan</span>
            </a>

            {{-- 2. Koleksi --}}
            <a href="{{ route('admin.materials.index') }}" class="pp-admin-nav-item {{ request()->routeIs('admin.materials.*') ? 'active' : '' }}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                <span>Koleksi</span>
            </a>

            {{-- 3. Kategori --}}
            <a href="{{ route('admin.categories.index') }}" class="pp-admin-nav-item {{ request()->routeIs('admin.categories.*') ? 'active' : '' }}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
                <span>Kategori</span>
            </a>

            {{-- 4. Pengguna --}}
            <a href="{{ route('admin.users.index') }}" class="pp-admin-nav-item {{ request()->routeIs('admin.users.*') ? 'active' : '' }}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span>Pengguna</span>
            </a>

            {{-- 5. Hak Akses --}}
            <a href="{{ route('admin.permissions.index') }}" class="pp-admin-nav-item {{ request()->routeIs('admin.permissions.*') ? 'active' : '' }}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span>Hak Akses</span>
            </a>

            {{-- 6. Aktivitas --}}
            <a href="{{ route('admin.activities.index') }}" class="pp-admin-nav-item {{ request()->routeIs('admin.activities.*') ? 'active' : '' }}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>Aktivitas</span>
            </a>

            <div class="pp-admin-nav-heading" style="margin-top: 1.5rem;">SISTEM</div>

            {{-- 7. Pengaturan Portal --}}
            <a href="{{ route('admin.settings.index') }}" class="pp-admin-nav-item {{ request()->routeIs('admin.settings.*') ? 'active' : '' }}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                <span>Pengaturan Portal</span>
            </a>

            {{-- 8. Bantuan Admin --}}
            <a href="{{ route('admin.help.index') }}" class="pp-admin-nav-item {{ request()->routeIs('admin.help.*') ? 'active' : '' }}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <span>Bantuan Admin</span>
            </a>
        </nav>

        {{-- Footer Profil Admin & Logout --}}
        <div class="pp-admin-sidebar-footer">
            <div class="pp-admin-profile">
                <div class="pp-admin-profile-info">
                    <div class="pp-admin-profile-name" title="{{ Auth::user()->name }}">{{ Auth::user()->name }}</div>
                    <div class="pp-admin-profile-role">{{ Auth::user()->role }}</div>
                </div>
                <form method="POST" action="{{ route('logout') }}">
                    @csrf
                    <button type="submit" class="pp-admin-nav-item" style="padding: 0.4rem; color: #FA5252; background: none; border: none; cursor: pointer;" title="Keluar dari Portal">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    </button>
                </form>
            </div>
        </div>
    </aside>

    {{-- Main Column --}}
    <div class="pp-admin-main">
        {{-- Topbar --}}
        <header class="pp-admin-topbar">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <button type="button" class="lg:hidden" onclick="toggleAdminSidebar()" aria-label="Buka menu" style="background: none; border: none; color: var(--pp-navy); cursor: pointer; padding: 0.25rem;">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>

                <nav class="pp-breadcrumb" aria-label="Breadcrumb">
                    <span>Admin</span>
                    <span class="pp-breadcrumb-separator">/</span>
                    <span class="pp-breadcrumb-current">@yield('breadcrumb', 'Ringkasan')</span>
                </nav>
            </div>

            <div class="pp-admin-topbar-actions">
                <a href="{{ route('home') }}" target="_blank" class="pp-admin-view-site" title="Buka landing page portal di tab baru">
                    <span>Lihat Portal Publik</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </a>
            </div>
        </header>

        {{-- Content --}}
        <main id="admin-main-content" class="pp-admin-content">
            {{-- Flash Alert Messages --}}
            @if (session('success'))
                <div class="pp-auth-alert pp-auth-alert-success" role="alert">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>{{ session('success') }}</span>
                </div>
            @endif

            @if (session('error'))
                <div class="pp-auth-alert pp-auth-alert-error" role="alert">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <span>{{ session('error') }}</span>
                </div>
            @endif

            @yield('content')
        </main>
    </div>

    {{-- Interactive Scripts --}}
    <script>
        function toggleAdminSidebar() {
            const sidebar = document.getElementById('admin-sidebar');
            const backdrop = document.getElementById('admin-mobile-backdrop');
            if (sidebar && backdrop) {
                sidebar.classList.toggle('open');
                backdrop.classList.toggle('open');
            }
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const sidebar = document.getElementById('admin-sidebar');
                const backdrop = document.getElementById('admin-mobile-backdrop');
                if (sidebar && sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                    backdrop.classList.remove('open');
                }
            }
        });
    </script>
</body>
</html>
