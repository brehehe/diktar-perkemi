@extends('admin.layout')

@section('title', 'Ringkasan Portal')
@section('breadcrumb', 'Ringkasan Portal')

@section('content')
<div class="pp-admin-page-header">
    <div>
        <h1 class="pp-admin-page-title">Ringkasan Portal</h1>
        <p class="pp-admin-page-desc">Pantau koleksi, pengguna, dan aktivitas terbaru Pustaka Penataran.</p>
    </div>
    <div>
        <a href="{{ route('admin.materials.create') }}" class="btn-primary" style="font-size: 0.875rem; padding: 0.625rem 1.25rem;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Tambah Materi</span>
        </a>
    </div>
</div>

{{-- 4 Metrik Ringkas Berbasis Data Nyata --}}
<div class="pp-admin-stat-grid">
    <div class="pp-admin-stat-card">
        <span class="pp-admin-stat-label">Total Koleksi</span>
        <div class="pp-admin-stat-number">{{ $totalMaterials }}</div>
        <span class="pp-admin-stat-sub">Modul, buku & bahan ajar</span>
    </div>

    <div class="pp-admin-stat-card">
        <span class="pp-admin-stat-label">Materi Terbit</span>
        <div class="pp-admin-stat-number" style="color: #2B8A3E;">{{ $publishedMaterials }}</div>
        <span class="pp-admin-stat-sub">Dapat diakses publik</span>
    </div>

    <div class="pp-admin-stat-card">
        <span class="pp-admin-stat-label">Dalam Tinjauan / Draf</span>
        <div class="pp-admin-stat-number" style="color: #D9480F;">{{ $reviewMaterials }}</div>
        <span class="pp-admin-stat-sub">Menunggu kurasi publikasi</span>
    </div>

    <div class="pp-admin-stat-card">
        <span class="pp-admin-stat-label">Pengguna Aktif</span>
        <div class="pp-admin-stat-number" style="color: var(--pp-primary);">{{ $totalUsers }}</div>
        <span class="pp-admin-stat-sub">Kenshi terdaftar di portal</span>
    </div>
</div>

{{-- Split Grid: Perlu Ditinjau & Aktivitas Terbaru --}}
<div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem; margin-bottom: 2rem;" class="lg:grid-cols-2">
    {{-- Panel Perlu Ditinjau --}}
    <div class="pp-admin-card" style="margin-bottom: 0;">
        <div class="pp-admin-card-header">
            <h3 class="pp-admin-card-title">Perlu Ditinjau & Draf</h3>
            <span class="pp-badge pp-badge-review">{{ $pendingReviews->count() }} Menunggu</span>
        </div>

        @if ($pendingReviews->isEmpty())
            <div style="padding: 2.5rem; text-align: center; color: var(--pp-muted); font-size: 0.875rem;">
                Semua materi telah ditinjau dan terbit. Tidak ada draf tertunda.
            </div>
        @else
            <div class="pp-admin-table-wrapper">
                <table class="pp-admin-table">
                    <thead>
                        <tr>
                            <th>Judul Materi</th>
                            <th>Kategori</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($pendingReviews as $item)
                            <tr>
                                <td>
                                    <div style="font-weight: 600; color: var(--pp-navy);">{{ $item->title }}</div>
                                    <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--pp-muted);">{{ $item->code ?? 'Kode: -' }}</span>
                                </td>
                                <td>
                                    <span style="font-size: 0.8125rem;">{{ $item->categories->first()?->name ?? 'Umum' }}</span>
                                </td>
                                <td>
                                    <span class="pp-badge {{ $item->status_badge_class }}">{{ $item->status_label }}</span>
                                </td>
                                <td>
                                    <a href="{{ route('admin.materials.edit', $item) }}" style="font-size: 0.8125rem; color: var(--pp-primary); font-weight: 600; text-decoration: none;">Tinjau &rarr;</a>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif
    </div>

    {{-- Panel Aktivitas Terbaru (Audit Trail Vertikal) --}}
    <div class="pp-admin-card" style="margin-bottom: 0;">
        <div class="pp-admin-card-header">
            <h3 class="pp-admin-card-title">Aktivitas Terbaru</h3>
            <a href="{{ route('admin.activities.index') }}" style="font-size: 0.8125rem; color: var(--pp-primary); font-weight: 500; text-decoration: none;">Lihat Semua &rarr;</a>
        </div>

        @if ($recentActivities->isEmpty())
            <div style="padding: 2.5rem; text-align: center; color: var(--pp-muted); font-size: 0.875rem;">
                Belum ada aktivitas yang tercatat.
            </div>
        @else
            <div style="padding: 1rem 1.25rem;">
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    @foreach ($recentActivities as $act)
                        <div style="display: flex; align-items: flex-start; gap: 0.75rem; border-bottom: 1px solid rgba(220,231,243,0.5); padding-bottom: 0.75rem;">
                            <div style="width: 2rem; height: 2rem; border-radius: 50%; background-color: var(--pp-sky); color: var(--pp-primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-size: 0.8125rem; color: var(--pp-navy);">
                                    <strong>{{ $act->actor?->name ?? 'Sistem' }}</strong>: {{ $act->event_label }}
                                </div>
                                <div style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--pp-muted);">
                                    {{ $act->created_at ? $act->created_at->diffForHumans() : '-' }}
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        @endif
    </div>
</div>

{{-- Koleksi Terbaru & Distribusi Kategori --}}
<div class="pp-admin-card">
    <div class="pp-admin-card-header">
        <h3 class="pp-admin-card-title">Koleksi Terbaru</h3>
        <a href="{{ route('admin.materials.index') }}" style="font-size: 0.8125rem; color: var(--pp-primary); font-weight: 500; text-decoration: none;">Lihat Semua Koleksi &rarr;</a>
    </div>

    <div class="pp-admin-table-wrapper">
        <table class="pp-admin-table">
            <thead>
                <tr>
                    <th>Sampul</th>
                    <th>Judul Materi</th>
                    <th>Kategori</th>
                    <th>Jenis</th>
                    <th>Status</th>
                    <th>Pembaruan Terakhir</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($recentMaterials as $mat)
                    <tr>
                        <td style="width: 54px;">
                            <div style="width: 40px; height: 56px; border-radius: 3px; overflow: hidden; background-color: var(--pp-sky); box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                @if ($mat->cover_path)
                                    <img src="{{ asset($mat->cover_path) }}" alt="" style="width: 100%; height: 100%; object-fit: cover;">
                                @else
                                    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 0.625rem; color: var(--pp-muted); font-family: var(--font-mono);">DOC</div>
                                @endif
                            </div>
                        </td>
                        <td>
                            <div style="font-weight: 600; color: var(--pp-navy);">{{ $mat->title }}</div>
                            <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--pp-muted);">{{ $mat->code ?? 'Kode: -' }}</span>
                        </td>
                        <td>
                            <span style="font-size: 0.8125rem;">{{ $mat->categories->first()?->name ?? 'Umum' }}</span>
                        </td>
                        <td>
                            <span style="font-size: 0.75rem; color: var(--pp-muted);">{{ $mat->type_label }}</span>
                        </td>
                        <td>
                            <span class="pp-badge {{ $mat->status_badge_class }}">{{ $mat->status_label }}</span>
                        </td>
                        <td>
                            <span style="font-size: 0.8125rem; color: var(--pp-muted);">{{ $mat->updated_at ? $mat->updated_at->format('d M Y') : '-' }}</span>
                        </td>
                        <td>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <a href="{{ route('admin.materials.edit', $mat) }}" class="pp-btn-action" title="Edit Materi" style="color: var(--pp-primary);">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                </a>
                            </div>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</div>
@endsection
