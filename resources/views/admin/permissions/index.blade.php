@extends('admin.layout')

@section('title', 'Hak Akses & Peran')
@section('breadcrumb', 'Hak Akses')

@section('content')
<div class="pp-admin-page-header">
    <div>
        <h1 class="pp-admin-page-title">Hak Akses & Peran</h1>
        <p class="pp-admin-page-desc">Atur matriks izin dan wewenang setiap peran kenshi terhadap koleksi dan fungsi portal.</p>
    </div>
</div>

<div class="pp-admin-card">
    <div class="pp-admin-card-header">
        <h3 class="pp-admin-card-title">Matriks Izin Akses Peran</h3>
        <span style="font-size: 0.8125rem; color: var(--pp-muted);">Centang kotak untuk memberikan izin wewenang pada peran terkait.</span>
    </div>

    <form method="POST" action="{{ route('admin.permissions.update') }}">
        @csrf
        @method('PUT')

        <div class="pp-admin-table-wrapper">
            <table class="pp-admin-table">
                <thead>
                    <tr>
                        <th style="min-width: 180px; position: sticky; left: 0; background: #F8FBFF; z-index: 10;">Peran Kenshi</th>
                        @foreach ($permissions as $perm)
                            <th style="text-align: center; min-width: 110px;" title="{{ $perm->name }}">
                                <span style="display: block; font-size: 0.75rem;">{{ $perm->label }}</span>
                                <code style="font-size: 0.625rem; font-family: var(--font-mono); color: var(--pp-muted); font-weight: 400;">{{ $perm->name }}</code>
                            </th>
                        @endforeach
                    </tr>
                </thead>
                <tbody>
                    @foreach ($roles as $role)
                        <tr>
                            <td style="position: sticky; left: 0; background: #fff; z-index: 10; border-right: 1px solid var(--pp-border);">
                                <div style="font-weight: 600; color: var(--pp-navy);">{{ $role->label }}</div>
                                <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--pp-muted);">{{ $role->name }}</span>
                            </td>
                            @foreach ($permissions as $perm)
                                @php
                                    $hasPermission = $role->permissions->contains('id', $perm->id);
                                @endphp
                                <td style="text-align: center;">
                                    <input 
                                        type="checkbox" 
                                        name="matrix[{{ $role->id }}][{{ $perm->id }}]" 
                                        value="1" 
                                        class="pp-checkbox" 
                                        {{ $hasPermission ? 'checked' : '' }}
                                        {{ $role->name === 'super-admin' ? 'disabled checked' : '' }}
                                    >
                                    @if ($role->name === 'super-admin')
                                        <input type="hidden" name="matrix[{{ $role->id }}][{{ $perm->id }}]" value="1">
                                    @endif
                                </td>
                            @endforeach
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div style="padding: 1.25rem 1.5rem; border-top: 1px solid var(--pp-border); display: flex; justify-content: space-between; align-items: center; background-color: #FAFBFD;">
            <p style="font-size: 0.8125rem; color: var(--pp-muted); margin: 0;">
                Catatan: Peran <strong>Super Administrator</strong> secara otomatis memiliki seluruh hak akses sistem.
            </p>
            <button type="submit" class="btn-primary" style="padding: 0.625rem 1.5rem;">
                Simpan Perubahan Matriks
            </button>
        </div>
    </form>
</div>
@endsection
