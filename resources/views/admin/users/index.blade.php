@extends('admin.layout')

@section('title', 'Pengguna Portal')
@section('breadcrumb', 'Pengguna Portal')

@section('content')
<div class="pp-admin-page-header">
    <div>
        <h1 class="pp-admin-page-title">Pengguna Portal</h1>
        <p class="pp-admin-page-desc">Kelola akun kenshi, penetapan peran, dan hak akses anggota.</p>
    </div>
    <div>
        <button type="button" class="btn-primary" onclick="openCreateUserModal()" style="font-size: 0.875rem; padding: 0.625rem 1.25rem; border: none; cursor: pointer;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Tambah Pengguna</span>
        </button>
    </div>
</div>

<div class="pp-admin-card">
    {{-- Filter Bar --}}
    <form method="GET" action="{{ route('admin.users.index') }}" class="pp-filter-bar">
        <div style="flex: 1; min-width: 240px;">
            <input type="text" name="q" value="{{ request('q') }}" class="pp-filter-input" placeholder="Cari nama atau email pengguna..." style="width: 100%;">
        </div>

        <div>
            <select name="role" class="pp-filter-input">
                <option value="">Semua Peran</option>
                @foreach ($roles as $r)
                    <option value="{{ $r }}" {{ request('role') === $r ? 'selected' : '' }}>{{ $r }}</option>
                @endforeach
            </select>
        </div>

        <div>
            <button type="submit" class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.8125rem;">Filter</button>
            @if (request()->hasAny(['q', 'role']))
                <a href="{{ route('admin.users.index') }}" class="btn-secondary" style="padding: 0.5rem 0.875rem; font-size: 0.8125rem; text-decoration: none; border: 1px solid var(--pp-border);">Reset</a>
            @endif
        </div>
    </form>

    {{-- Tabel Pengguna --}}
    <div class="pp-admin-table-wrapper">
        <table class="pp-admin-table">
            <thead>
                <tr>
                    <th>Nama Pengguna</th>
                    <th>Email</th>
                    <th>Peran Aktif</th>
                    <th>Status Akun</th>
                    <th>Tanggal Terdaftar</th>
                    <th style="text-align: right;">Ubah Peran</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($users as $u)
                    <tr>
                        <td>
                            <strong style="color: var(--pp-navy); font-size: 0.9375rem;">{{ $u->name }}</strong>
                        </td>
                        <td>
                            <span style="font-size: 0.8125rem; color: var(--pp-text);">{{ $u->email }}</span>
                        </td>
                        <td>
                            <span class="pp-badge {{ $u->role === 'Admin' ? 'pp-badge-admin' : 'pp-badge-role' }}">
                                {{ $u->role ?? 'Peserta' }}
                            </span>
                        </td>
                        <td>
                            <span class="pp-badge pp-badge-published">Aktif</span>
                        </td>
                        <td>
                            <span style="font-size: 0.8125rem; color: var(--pp-muted);">{{ $u->created_at ? $u->created_at->format('d M Y') : '-' }}</span>
                        </td>
                        <td style="text-align: right;">
                            <form method="POST" action="{{ route('admin.users.role', $u) }}" style="display: inline-flex; align-items: center; gap: 0.5rem;">
                                @csrf
                                @method('PATCH')
                                <select name="role" onchange="this.form.submit()" style="font-size: 0.75rem; font-weight: 500; border-radius: 4px; padding: 0.25rem 0.5rem; border: 1px solid var(--pp-border); cursor: pointer; background: #fff;">
                                    @foreach ($roles as $r)
                                        <option value="{{ $r }}" {{ $u->role === $r ? 'selected' : '' }}>{{ $r }}</option>
                                    @endforeach
                                </select>
                            </form>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    @if ($users->hasPages())
        <div style="padding: 1rem 1.5rem; border-top: 1px solid var(--pp-border);">
            {{ $users->links() }}
        </div>
    @endif
</div>

{{-- Modal Tambah Pengguna --}}
<div id="modal-create-user" style="display: none; position: fixed; inset: 0; background: rgba(14,39,71,0.6); z-index: 99; align-items: center; justify-content: center; padding: 1rem;">
    <div style="background: #fff; border-radius: 8px; max-width: 480px; width: 100%; box-shadow: var(--shadow-lg); overflow: hidden;">
        <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--pp-border); display: flex; align-items: center; justify-content: space-between;">
            <h3 style="font-size: 1.125rem; font-weight: 600; color: var(--pp-navy); margin: 0;">Tambah Pengguna Baru</h3>
            <button type="button" onclick="closeCreateUserModal()" style="background: none; border: none; font-size: 1.25rem; color: var(--pp-muted); cursor: pointer;">&times;</button>
        </div>

        <form method="POST" action="{{ route('admin.users.store') }}" style="padding: 1.5rem;">
            @csrf

            <div class="pp-form-group">
                <label for="user_name" class="pp-form-label">Nama Lengkap <span style="color: #E03131;">*</span></label>
                <input type="text" id="user_name" name="name" class="pp-input" required placeholder="Contoh: Sensei Hartono">
            </div>

            <div class="pp-form-group">
                <label for="user_email" class="pp-form-label">Alamat Email <span style="color: #E03131;">*</span></label>
                <input type="email" id="user_email" name="email" class="pp-input" required placeholder="nama@perkemi.id">
            </div>

            <div class="pp-form-group">
                <label for="user_role" class="pp-form-label">Peran Pengguna <span style="color: #E03131;">*</span></label>
                <select id="user_role" name="role" class="pp-input pp-select" required>
                    @foreach ($roles as $r)
                        <option value="{{ $r }}">{{ $r }}</option>
                    @endforeach
                </select>
            </div>

            <div class="pp-form-group">
                <label for="user_password" class="pp-form-label">Kata Sandi Awal <span style="color: #E03131;">*</span></label>
                <input type="password" id="user_password" name="password" class="pp-input" required minlength="8" placeholder="Minimal 8 karakter">
            </div>

            <div style="border-top: 1px solid var(--pp-border); padding-top: 1.25rem; margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem;">
                <button type="button" onclick="closeCreateUserModal()" class="btn-secondary" style="padding: 0.5rem 1rem; border: 1px solid var(--pp-border);">Batal</button>
                <button type="submit" class="btn-primary" style="padding: 0.5rem 1.25rem;">Simpan Pengguna</button>
            </div>
        </form>
    </div>
</div>

<script>
    function openCreateUserModal() {
        const modal = document.getElementById('modal-create-user');
        if (modal) modal.style.display = 'flex';
    }
    function closeCreateUserModal() {
        const modal = document.getElementById('modal-create-user');
        if (modal) modal.style.display = 'none';
    }
</script>
@endsection
