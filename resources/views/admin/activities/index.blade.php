@extends('admin.layout')

@section('title', 'Aktivitas Portal')
@section('breadcrumb', 'Aktivitas Portal')

@section('content')
<div class="pp-admin-page-header">
    <div>
        <h1 class="pp-admin-page-title">Aktivitas Portal</h1>
        <p class="pp-admin-page-desc">Audit trail dan catatan riwayat perubahan modul, pengguna, dan konfigurasi sistem.</p>
    </div>
</div>

<div class="pp-admin-card">
    {{-- Filter Bar --}}
    <form method="GET" action="{{ route('admin.activities.index') }}" class="pp-filter-bar">
        <div>
            <select name="event" class="pp-filter-input">
                <option value="">Semua Jenis Aktivitas</option>
                @foreach ($distinctEvents as $ev)
                    <option value="{{ $ev }}" {{ request('event') === $ev ? 'selected' : '' }}>{{ $ev }}</option>
                @endforeach
            </select>
        </div>

        <div>
            <select name="actor_id" class="pp-filter-input">
                <option value="">Semua Aktor</option>
                @foreach ($actors as $actor)
                    <option value="{{ $actor->id }}" {{ request('actor_id') == $actor->id ? 'selected' : '' }}>{{ $actor->name }}</option>
                @endforeach
            </select>
        </div>

        <div>
            <button type="submit" class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.8125rem;">Filter</button>
            @if (request()->hasAny(['event', 'actor_id']))
                <a href="{{ route('admin.activities.index') }}" class="btn-secondary" style="padding: 0.5rem 0.875rem; font-size: 0.8125rem; text-decoration: none; border: 1px solid var(--pp-border);">Reset</a>
            @endif
        </div>
    </form>

    {{-- Tabel Log Aktivitas --}}
    @if ($activities->isEmpty())
        <div style="padding: 3rem; text-align: center; color: var(--pp-muted); font-size: 0.875rem;">
            Tidak ada riwayat aktivitas yang sesuai filter.
        </div>
    @else
        <div class="pp-admin-table-wrapper">
            <table class="pp-admin-table">
                <thead>
                    <tr>
                        <th>Waktu (WIB)</th>
                        <th>Pengguna / Aktor</th>
                        <th>Aktivitas</th>
                        <th>Tipe Objek</th>
                        <th>Alamat IP</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($activities as $act)
                        <tr>
                            <td style="white-space: nowrap;">
                                <div style="font-weight: 500; color: var(--pp-navy); font-size: 0.8125rem;">
                                    {{ $act->created_at ? $act->created_at->format('d M Y, H:i') : '-' }}
                                </div>
                                <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--pp-muted);">
                                    {{ $act->created_at ? $act->created_at->diffForHumans() : '-' }}
                                </span>
                            </td>
                            <td>
                                <strong style="color: var(--pp-navy); font-size: 0.875rem;">{{ $act->actor?->name ?? 'Sistem Otomatis' }}</strong>
                                <div style="font-size: 0.6875rem; color: var(--pp-muted);">{{ $act->actor?->email ?? '-' }}</div>
                            </td>
                            <td>
                                <span class="pp-badge pp-badge-role">{{ $act->event_label }}</span>
                                <code style="display: block; font-family: var(--font-mono); font-size: 0.625rem; color: var(--pp-muted); margin-top: 0.2rem;">{{ $act->event }}</code>
                            </td>
                            <td>
                                <span style="font-size: 0.8125rem; color: var(--pp-text);">
                                    {{ class_basename($act->subject_type ?? 'Sistem') }}
                                    @if ($act->subject_id)
                                        #{{ $act->subject_id }}
                                    @endif
                                </span>
                            </td>
                            <td>
                                <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--pp-muted);">
                                    {{ $act->ip_address ?? '127.0.0.1' }}
                                </span>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        @if ($activities->hasPages())
            <div style="padding: 1rem 1.5rem; border-top: 1px solid var(--pp-border);">
                {{ $activities->links() }}
            </div>
        @endif
    @endif
</div>
@endsection
