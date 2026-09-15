@extends('admin.layout')

@section('title', 'Edit Materi — ' . $material->title)
@section('breadcrumb')
    <a href="{{ route('admin.materials.index') }}" style="color: inherit; text-decoration: none;">Koleksi</a>
    <span class="pp-breadcrumb-separator">/</span>
    <span class="pp-breadcrumb-current">Edit Materi</span>
@endsection

@section('content')
<div class="pp-admin-page-header">
    <div>
        <h1 class="pp-admin-page-title">Edit Materi Digital</h1>
        <p class="pp-admin-page-desc">Perbarui data metadata, status publikasi, dan file modul.</p>
    </div>
    <div>
        <a href="{{ route('admin.materials.index') }}" class="btn-secondary" style="font-size: 0.875rem; padding: 0.625rem 1.25rem; border: 1px solid var(--pp-border); text-decoration: none;">
            &larr; Kembali ke Koleksi
        </a>
    </div>
</div>

<div class="pp-admin-card">
    <div class="pp-admin-card-header">
        <h3 class="pp-admin-card-title">Informasi & Metadata: {{ $material->title }}</h3>
        <span class="pp-badge {{ $material->status_badge_class }}">{{ $material->status_label }}</span>
    </div>

    <form method="POST" action="{{ route('admin.materials.update', $material) }}" enctype="multipart/form-data" style="padding: 1.75rem 2rem;">
        @csrf
        @method('PUT')

        <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem;" class="lg:grid-cols-3">
            {{-- Kolom Kiri & Tengah: Data Teks (2 Kolom) --}}
            <div style="grid-column: span 2;">
                {{-- Judul Materi --}}
                <div class="pp-form-group">
                    <label for="title" class="pp-form-label">Judul Materi / Modul <span style="color: #E03131;">*</span></label>
                    <input type="text" id="title" name="title" value="{{ old('title', $material->title) }}" class="pp-input @error('title') is-invalid @enderror" required>
                    @error('title')
                        <p class="pp-form-error">{{ $message }}</p>
                    @enderror
                </div>

                {{-- Kode & Kategori --}}
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="pp-form-group">
                        <label for="code" class="pp-form-label">Kode Materi (Opsional)</label>
                        <input type="text" id="code" name="code" value="{{ old('code', $material->code) }}" class="pp-input">
                    </div>

                    <div class="pp-form-group">
                        <label for="category_id" class="pp-form-label">Kategori Utama <span style="color: #E03131;">*</span></label>
                        <select id="category_id" name="category_id" class="pp-input pp-select @error('category_id') is-invalid @enderror" required>
                            @foreach ($categories as $cat)
                                <option value="{{ $cat->id }}" {{ old('category_id', $selectedCategoryId) == $cat->id ? 'selected' : '' }}>{{ $cat->name }}</option>
                            @endforeach
                        </select>
                        @error('category_id')
                            <p class="pp-form-error">{{ $message }}</p>
                        @enderror
                    </div>
                </div>

                {{-- Jenis & Tahun Publikasi & Halaman --}}
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                    <div class="pp-form-group">
                        <label for="type" class="pp-form-label">Jenis Materi <span style="color: #E03131;">*</span></label>
                        <select id="type" name="type" class="pp-input pp-select" required>
                            <option value="module" {{ old('type', $material->type) === 'module' ? 'selected' : '' }}>Modul Penataran</option>
                            <option value="book" {{ old('type', $material->type) === 'book' ? 'selected' : '' }}>Buku Referensi</option>
                            <option value="speaker_material" {{ old('type', $material->type) === 'speaker_material' ? 'selected' : '' }}>Bahan Ajar</option>
                            <option value="guideline" {{ old('type', $material->type) === 'guideline' ? 'selected' : '' }}>Pedoman Teknis</option>
                            <option value="video" {{ old('type', $material->type) === 'video' ? 'selected' : '' }}>Video Pembelajaran</option>
                            <option value="document" {{ old('type', $material->type) === 'document' ? 'selected' : '' }}>Dokumen Rubrik</option>
                        </select>
                    </div>

                    <div class="pp-form-group">
                        <label for="publication_year" class="pp-form-label">Tahun Terbit</label>
                        <input type="number" id="publication_year" name="publication_year" value="{{ old('publication_year', $material->publication_year) }}" class="pp-input" min="1970" max="2099">
                    </div>

                    <div class="pp-form-group">
                        <label for="page_count" class="pp-form-label">Jumlah Halaman</label>
                        <input type="number" id="page_count" name="page_count" value="{{ old('page_count', $material->page_count) }}" class="pp-input" min="1">
                    </div>
                </div>

                {{-- Ringkasan --}}
                <div class="pp-form-group">
                    <label for="summary" class="pp-form-label">Ringkasan Singkat</label>
                    <textarea id="summary" name="summary" rows="3" class="pp-input" style="height: auto; padding: 0.75rem 1rem;">{{ old('summary', $material->summary) }}</textarea>
                </div>

                {{-- Deskripsi Lengkap --}}
                <div class="pp-form-group">
                    <label for="description" class="pp-form-label">Deskripsi Lengkap / Silabus</label>
                    <textarea id="description" name="description" rows="5" class="pp-input" style="height: auto; padding: 0.75rem 1rem;">{{ old('description', $material->description) }}</textarea>
                </div>
            </div>

            {{-- Kolom Kanan: Cover, Target Peran, & Status --}}
            <div>
                {{-- Status Publikasi --}}
                <div class="pp-form-group">
                    <label for="status" class="pp-form-label">Status Publikasi <span style="color: #E03131;">*</span></label>
                    <select id="status" name="status" class="pp-input pp-select" required>
                        <option value="draft" {{ old('status', $material->status) === 'draft' ? 'selected' : '' }}>Draf (Penyusunan)</option>
                        <option value="review" {{ old('status', $material->status) === 'review' ? 'selected' : '' }}>Dalam Tinjauan (Kurasi)</option>
                        <option value="published" {{ old('status', $material->status) === 'published' ? 'selected' : '' }}>Terbitkan (Publik)</option>
                        <option value="archived" {{ old('status', $material->status) === 'archived' ? 'selected' : '' }}>Diarsipkan</option>
                    </select>
                </div>

                {{-- Upload Cover & Preview --}}
                <div class="pp-form-group">
                    <label for="cover_file" class="pp-form-label">Sampul Modul</label>
                    @if ($material->cover_path)
                        <div style="margin-bottom: 0.75rem; display: flex; align-items: center; gap: 1rem;">
                            <img src="{{ asset($material->cover_path) }}" alt="Sampul saat ini" style="width: 60px; height: 80px; object-fit: cover; border-radius: 4px; border: 1px solid var(--pp-border);">
                            <span style="font-size: 0.75rem; color: var(--pp-muted);">Sampul aktif terpasang. Unggah berkas baru untuk mengganti.</span>
                        </div>
                    @endif
                    <input type="file" id="cover_file" name="cover_file" accept="image/*" class="pp-input" style="padding: 0.5rem;">
                </div>

                {{-- Target Peran (Audiences) --}}
                <div class="pp-form-group">
                    <label class="pp-form-label">Target Peran Kenshi</label>
                    <div style="background-color: var(--pp-sky); border: 1px solid var(--pp-border); border-radius: 6px; padding: 0.875rem 1rem;">
                        @foreach ($audiences as $aud)
                            <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; margin-bottom: 0.375rem; cursor: pointer;">
                                <input type="checkbox" name="audiences[]" value="{{ $aud->id }}" class="pp-checkbox" {{ in_array($aud->id, old('audiences', $selectedAudiences)) ? 'checked' : '' }}>
                                <span>{{ $aud->name }}</span>
                            </label>
                        @endforeach
                    </div>
                </div>

                {{-- Flag Options --}}
                <div style="border-top: 1px solid var(--pp-border); padding-top: 1rem; margin-top: 1rem;">
                    <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; margin-bottom: 0.625rem; cursor: pointer;">
                        <input type="checkbox" name="is_downloadable" value="1" class="pp-checkbox" {{ old('is_downloadable', $material->is_downloadable) ? 'checked' : '' }}>
                        <span>Dapat Diunduh Dokumen Resmi</span>
                    </label>

                    <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; cursor: pointer;">
                        <input type="checkbox" name="is_featured" value="1" class="pp-checkbox" {{ old('is_featured', $material->is_featured) ? 'checked' : '' }}>
                        <span>Tampilkan di Sorotan Beranda</span>
                    </label>
                </div>
            </div>
        </div>

        {{-- Action Buttons --}}
        <div style="border-top: 1px solid var(--pp-border); padding-top: 1.5rem; margin-top: 2rem; display: flex; justify-content: space-between; align-items: center;">
            <button type="button" onclick="if(confirm('Hapus materi ini?')) document.getElementById('delete-material-form').submit();" style="background: none; border: none; color: #FA5252; font-size: 0.875rem; cursor: pointer; text-decoration: underline;">
                Hapus Materi
            </button>

            <div style="display: flex; gap: 1rem;">
                <a href="{{ route('admin.materials.index') }}" class="btn-secondary" style="padding: 0.625rem 1.25rem; border: 1px solid var(--pp-border); text-decoration: none;">Batal</a>
                <button type="submit" class="btn-primary" style="padding: 0.625rem 1.5rem;">Perbarui Materi</button>
            </div>
        </div>
    </form>

    <form id="delete-material-form" method="POST" action="{{ route('admin.materials.destroy', $material) }}" style="display: none;">
        @csrf
        @method('DELETE')
    </form>
</div>
@endsection
