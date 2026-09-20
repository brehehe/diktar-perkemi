@extends('admin.layout')

@section('title', 'Koleksi Digital')
@section('breadcrumb', 'Koleksi Digital')

@section('content')
<div class="pp-admin-page-header">
    <div>
        <h1 class="pp-admin-page-title">Koleksi Digital</h1>
        <p class="pp-admin-page-desc">Kelola seluruh modul penataran, buku panduan, dan bahan ajar PERKEMI.</p>
    </div>
    <div>
        <a href="{{ route('admin.materials.create') }}" class="btn-primary" style="font-size: 0.875rem; padding: 0.625rem 1.25rem;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Tambah Materi</span>
        </a>
    </div>
</div>

<div class="pp-admin-card">
    {{-- Filter Bar --}}
    <form method="GET" action="{{ route('admin.materials.index') }}" class="pp-filter-bar">
        {{-- Search Input --}}
        <div style="flex: 1; min-width: 220px;">
            <input type="text" name="q" value="{{ request('q') }}" class="pp-filter-input" placeholder="Cari judul, kode modul, atau kata kunci..." style="width: 100%;">
        </div>

        {{-- Filter Status --}}
        <div>
            <select name="status" class="pp-filter-input">
                <option value="">Semua Status</option>
                <option value="published" {{ request('status') === 'published' ? 'selected' : '' }}>Terbit</option>
                <option value="review" {{ request('status') === 'review' ? 'selected' : '' }}>Dalam Tinjauan</option>
                <option value="draft" {{ request('status') === 'draft' ? 'selected' : '' }}>Draf</option>
                <option value="archived" {{ request('status') === 'archived' ? 'selected' : '' }}>Diarsipkan</option>
            </select>
        </div>

        {{-- Filter Kategori --}}
        <div>
            <select name="category" class="pp-filter-input">
                <option value="">Semua Kategori</option>
                @foreach ($categories as $cat)
                    <option value="{{ $cat->id }}" {{ request('category') == $cat->id ? 'selected' : '' }}>{{ $cat->name }}</option>
                @endforeach
            </select>
        </div>

        {{-- Filter Jenis --}}
        <div>
            <select name="type" class="pp-filter-input">
                <option value="">Semua Jenis</option>
                <option value="module" {{ request('type') === 'module' ? 'selected' : '' }}>Modul Penataran</option>
                <option value="book" {{ request('type') === 'book' ? 'selected' : '' }}>Buku Referensi</option>
                <option value="speaker_material" {{ request('type') === 'speaker_material' ? 'selected' : '' }}>Bahan Ajar</option>
                <option value="guideline" {{ request('type') === 'guideline' ? 'selected' : '' }}>Pedoman</option>
                <option value="video" {{ request('type') === 'video' ? 'selected' : '' }}>Video</option>
                <option value="document" {{ request('type') === 'document' ? 'selected' : '' }}>Dokumen</option>
            </select>
        </div>

        {{-- Filter Tahun --}}
        @if ($availableYears->isNotEmpty())
            <div>
                <select name="year" class="pp-filter-input">
                    <option value="">Semua Tahun</option>
                    @foreach ($availableYears as $yr)
                        <option value="{{ $yr }}" {{ request('year') == $yr ? 'selected' : '' }}>{{ $yr }}</option>
                    @endforeach
                </select>
            </div>
        @endif

        <div>
            <button type="submit" class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.8125rem;">Filter</button>
            @if (request()->hasAny(['q', 'status', 'category', 'type', 'year']))
                <a href="{{ route('admin.materials.index') }}" class="btn-secondary" style="padding: 0.5rem 0.875rem; font-size: 0.8125rem; text-decoration: none; border: 1px solid var(--pp-border);">Reset</a>
            @endif
        </div>
    </form>

    {{-- Tabel Koleksi --}}
    @if ($materials->isEmpty())
        <div style="padding: 4rem 2rem; text-align: center;">
            <div style="width: 3.5rem; height: 3.5rem; border-radius: 50%; background-color: var(--pp-sky); color: var(--pp-primary); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            </div>
            <h3 style="font-size: 1.125rem; font-weight: 600; color: var(--pp-navy); margin: 0 0 0.5rem;">Tidak ada koleksi ditemukan</h3>
            <p style="font-size: 0.875rem; color: var(--pp-muted); max-width: 24rem; margin: 0 auto 1.5rem;">Coba sesuaikan kata kunci pencarian atau bersihkan filter di atas.</p>
            <a href="{{ route('admin.materials.create') }}" class="btn-primary" style="font-size: 0.875rem; padding: 0.5rem 1rem;">Tambah Materi Baru</a>
        </div>
    @else
        <div class="pp-admin-table-wrapper">
            <table class="pp-admin-table">
                <thead>
                    <tr>
                        <th style="width: 50px;">Sampul</th>
                        <th>Judul & Kode</th>
                        <th>Kategori</th>
                        <th>Jenis</th>
                        <th>Status</th>
                        <th>Tahun</th>
                        <th>Pembaruan Terakhir</th>
                        <th style="text-align: right;">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($materials as $mat)
                        <tr>
                            <td>
                                <div style="width: 36px; height: 50px; border-radius: 3px; overflow: hidden; background-color: var(--pp-sky); box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                    @if ($mat->cover_path)
                                        <img src="{{ asset($mat->cover_path) }}" alt="" style="width: 100%; height: 100%; object-fit: cover;">
                                    @else
                                        <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 0.5625rem; color: var(--pp-muted); font-family: var(--font-mono);">PDF</div>
                                    @endif
                                </div>
                            </td>
                            <td>
                                <a href="{{ route('admin.materials.edit', $mat) }}" style="font-weight: 600; color: var(--pp-navy); text-decoration: none; display: block;" class="hover:underline">
                                    {{ $mat->title }}
                                </a>
                                <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--pp-muted);">{{ $mat->code ?? 'Kode: -' }}</span>
                            </td>
                            <td>
                                <span style="font-size: 0.8125rem;">{{ $mat->categories->first()?->name ?? 'Umum' }}</span>
                            </td>
                            <td>
                                <span style="font-size: 0.75rem; color: var(--pp-muted);">{{ $mat->type_label }}</span>
                            </td>
                            <td>
                                {{-- Quick Status Changer --}}
                                <form method="POST" action="{{ route('admin.materials.status', $mat) }}" style="display: inline;">
                                    @csrf
                                    @method('PATCH')
                                    <select name="status" onchange="this.form.submit()" style="font-size: 0.75rem; font-weight: 600; border-radius: 4px; padding: 0.2rem 0.4rem; border: 1px solid var(--pp-border); cursor: pointer;" class="{{ $mat->status_badge_class }}">
                                        <option value="published" {{ $mat->status === 'published' ? 'selected' : '' }}>Terbit</option>
                                        <option value="review" {{ $mat->status === 'review' ? 'selected' : '' }}>Tinjauan</option>
                                        <option value="draft" {{ $mat->status === 'draft' ? 'selected' : '' }}>Draf</option>
                                        <option value="archived" {{ $mat->status === 'archived' ? 'selected' : '' }}>Arsip</option>
                                    </select>
                                </form>
                            </td>
                            <td>
                                <span style="font-family: var(--font-mono); font-size: 0.8125rem; color: var(--pp-muted);">{{ $mat->publication_year ?? '-' }}</span>
                            </td>
                            <td>
                                <span style="font-size: 0.8125rem; color: var(--pp-muted);">{{ $mat->updated_at ? $mat->updated_at->format('d M Y') : '-' }}</span>
                            </td>
                            <td style="text-align: right;">
                                <div style="display: inline-flex; align-items: center; gap: 0.5rem;">
                                    <a href="{{ route('admin.materials.edit', $mat) }}" style="color: var(--pp-primary); padding: 0.25rem;" title="Edit Materi">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                    </a>
                                    <form method="POST" action="{{ route('admin.materials.destroy', $mat) }}" onsubmit="return confirm('Apakah Anda yakin ingin menghapus materi \'{{ addslashes($mat->title) }}\'?');" style="display: inline;">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" style="background: none; border: none; color: #FA5252; padding: 0.25rem; cursor: pointer;" title="Hapus Materi">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        {{-- Pagination --}}
        @if ($materials->hasPages())
            <div style="padding: 1rem 1.5rem; border-top: 1px solid var(--pp-border);">
                {{ $materials->links() }}
            </div>
        @endif
    @endif
</div>
@endsection
