@extends('admin.layout')

@section('title', 'Tambah Materi Baru')
@section('breadcrumb')
    <a href="{{ route('admin.materials.index') }}" style="color: inherit; text-decoration: none;">Koleksi</a>
    <span class="pp-breadcrumb-separator">/</span>
    <span class="pp-breadcrumb-current">Tambah Materi</span>
@endsection

@section('content')
<div class="pp-admin-page-header">
    <div>
        <h1 class="pp-admin-page-title">Tambah Materi Baru</h1>
        <p class="pp-admin-page-desc">Lengkapi metadata untuk menambahkan buku digital atau modul penataran.</p>
    </div>
    <div>
        <a href="{{ route('admin.materials.index') }}" class="btn-secondary" style="font-size: 0.875rem; padding: 0.625rem 1.25rem; border: 1px solid var(--pp-border); text-decoration: none;">
            &larr; Kembali ke Koleksi
        </a>
    </div>
</div>

<div class="pp-admin-card">
    <div class="pp-admin-card-header">
        <h3 class="pp-admin-card-title">Informasi & Metadata Modul</h3>
    </div>

    <form method="POST" action="{{ route('admin.materials.store') }}" enctype="multipart/form-data" style="padding: 1.75rem 2rem;">
        @csrf

        <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem;" class="lg:grid-cols-3">
            {{-- Kolom Kiri & Tengah: Data Teks (2 Kolom) --}}
            <div style="grid-column: span 2;">
                {{-- Judul Materi --}}
                <div class="pp-form-group">
                    <label for="title" class="pp-form-label">Judul Materi / Modul <span style="color: #E03131;">*</span></label>
                    <input type="text" id="title" name="title" value="{{ old('title') }}" class="pp-input @error('title') is-invalid @enderror" placeholder="Contoh: Modul Wasit Tingkat Nasional 2026" required>
                    @error('title')
                        <p class="pp-form-error">{{ $message }}</p>
                    @enderror
                </div>

                {{-- Kode & Kategori --}}
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="pp-form-group">
                        <label for="code" class="pp-form-label">Kode Materi (Opsional)</label>
                        <input type="text" id="code" name="code" value="{{ old('code') }}" class="pp-input" placeholder="Contoh: MWTN-2026">
                    </div>

                    <div class="pp-form-group">
                        <label for="category_id" class="pp-form-label">Kategori Utama <span style="color: #E03131;">*</span></label>
                        <select id="category_id" name="category_id" class="pp-input pp-select @error('category_id') is-invalid @enderror" required>
                            <option value="" disabled {{ old('category_id') ? '' : 'selected' }}>Pilih Kategori...</option>
                            @foreach ($categories as $cat)
                                <option value="{{ $cat->id }}" {{ old('category_id') == $cat->id ? 'selected' : '' }}>{{ $cat->name }}</option>
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
                            <option value="module" {{ old('type') === 'module' ? 'selected' : '' }}>Modul Penataran</option>
                            <option value="book" {{ old('type') === 'book' ? 'selected' : '' }}>Buku Referensi</option>
                            <option value="speaker_material" {{ old('type') === 'speaker_material' ? 'selected' : '' }}>Bahan Ajar</option>
                            <option value="guideline" {{ old('type') === 'guideline' ? 'selected' : '' }}>Pedoman Teknis</option>
                            <option value="video" {{ old('type') === 'video' ? 'selected' : '' }}>Video Pembelajaran</option>
                            <option value="document" {{ old('type') === 'document' ? 'selected' : '' }}>Dokumen Rubrik</option>
                        </select>
                    </div>

                    <div class="pp-form-group">
                        <label for="publication_year" class="pp-form-label">Tahun Terbit</label>
                        <input type="number" id="publication_year" name="publication_year" value="{{ old('publication_year', date('Y')) }}" class="pp-input" min="1970" max="2099">
                    </div>

                    <div class="pp-form-group">
                        <label for="page_count" class="pp-form-label">Jumlah Halaman</label>
                        <input type="number" id="page_count" name="page_count" value="{{ old('page_count') }}" class="pp-input" placeholder="Contoh: 120" min="1">
                    </div>
                </div>

                {{-- Ringkasan --}}
                <div class="pp-form-group">
                    <label for="summary" class="pp-form-label">Ringkasan Singkat</label>
                    <textarea id="summary" name="summary" rows="3" class="pp-input" style="height: auto; padding: 0.75rem 1rem;" placeholder="Deskripsi singkat 1-2 kalimat untuk ditampilkan pada kartu katalog...">{{ old('summary') }}</textarea>
                </div>

                {{-- Deskripsi Lengkap --}}
                <div class="pp-form-group">
                    <label for="description" class="pp-form-label">Deskripsi Lengkap / Silabus</label>
                    <textarea id="description" name="description" rows="5" class="pp-input" style="height: auto; padding: 0.75rem 1rem;" placeholder="Rincian isi modul, silabus pembelajaran, atau prasyarat materi...">{{ old('description') }}</textarea>
                </div>
            </div>

            {{-- Kolom Kanan: Cover, Target Peran, & Status --}}
            <div>
                {{-- Status Publikasi --}}
                <div class="pp-form-group">
                    <label for="status" class="pp-form-label">Status Publikasi <span style="color: #E03131;">*</span></label>
                    <select id="status" name="status" class="pp-input pp-select" required>
                        <option value="draft" {{ old('status') === 'draft' ? 'selected' : '' }}>Draf (Penyusunan)</option>
                        <option value="review" {{ old('status') === 'review' ? 'selected' : '' }}>Dalam Tinjauan (Kurasi)</option>
                        <option value="published" {{ old('status') === 'published' ? 'selected' : '' }}>Terbitkan Langsung</option>
                        <option value="archived" {{ old('status') === 'archived' ? 'selected' : '' }}>Diarsipkan</option>
                    </select>
                </div>

                {{-- Upload Cover --}}
                <div class="pp-form-group">
                    <label for="cover_file" class="pp-form-label">Unggah Sampul Modul (JPG, PNG)</label>
                    <input type="file" id="cover_file" name="cover_file" accept="image/*" class="pp-input" style="padding: 0.5rem;">
                    <span style="font-size: 0.75rem; color: var(--pp-muted); display: block; margin-top: 0.25rem;">Rekomendasi rasio 3:4 (contoh: 600x800px).</span>
                </div>

                {{-- Target Peran (Audiences) --}}
                <div class="pp-form-group">
                    <label class="pp-form-label">Target Peran Kenshi</label>
                    <div style="background-color: var(--pp-sky); border: 1px solid var(--pp-border); border-radius: 6px; padding: 0.875rem 1rem;">
                        @foreach ($audiences as $aud)
                            <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; margin-bottom: 0.375rem; cursor: pointer;">
                                <input type="checkbox" name="audiences[]" value="{{ $aud->id }}" class="pp-checkbox" {{ is_array(old('audiences')) && in_array($aud->id, old('audiences')) ? 'checked' : '' }}>
                                <span>{{ $aud->name }}</span>
                            </label>
                        @endforeach
                    </div>
                </div>

                {{-- Flag Options --}}
                <div style="border-top: 1px solid var(--pp-border); padding-top: 1rem; margin-top: 1rem;">
                    <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; margin-bottom: 0.625rem; cursor: pointer;">
                        <input type="checkbox" name="is_downloadable" value="1" class="pp-checkbox" {{ old('is_downloadable') ? 'checked' : '' }}>
                        <span>Dapat Diunduh Dokumen Resmi</span>
                    </label>

                    <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; cursor: pointer;">
                        <input type="checkbox" name="is_featured" value="1" class="pp-checkbox" {{ old('is_featured') ? 'checked' : '' }}>
                        <span>Tampilkan di Sorotan Beranda</span>
                    </label>
                </div>
            </div>
        </div>

        {{-- Action Buttons --}}
        <div style="border-top: 1px solid var(--pp-border); padding-top: 1.5rem; margin-top: 2rem; display: flex; justify-content: flex-end; gap: 1rem;">
            <a href="{{ route('admin.materials.index') }}" class="btn-secondary" style="padding: 0.625rem 1.25rem; border: 1px solid var(--pp-border); text-decoration: none;">Batal</a>
            <button type="submit" class="btn-primary" style="padding: 0.625rem 1.5rem;">Simpan Materi</button>
        </div>
    </form>
</div>
@endsection
