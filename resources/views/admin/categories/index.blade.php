@extends('admin.layout')

@section('title', 'Kategori Materi')
@section('breadcrumb', 'Kategori Materi')

@section('content')
<div class="pp-admin-page-header">
    <div>
        <h1 class="pp-admin-page-title">Kategori Materi</h1>
        <p class="pp-admin-page-desc">Kelola taksonomi dan klasifikasi modul penataran PERKEMI.</p>
    </div>
    <div>
        <button type="button" class="btn-primary" onclick="openCreateModal()" style="font-size: 0.875rem; padding: 0.625rem 1.25rem; border: none; cursor: pointer;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Tambah Kategori</span>
        </button>
    </div>
</div>

<div class="pp-admin-card">
    <div class="pp-admin-table-wrapper">
        <table class="pp-admin-table">
            <thead>
                <tr>
                    <th style="width: 40px;">Warna</th>
                    <th>Nama Kategori</th>
                    <th>Slug</th>
                    <th>Deskripsi</th>
                    <th>Jumlah Koleksi</th>
                    <th>Status</th>
                    <th style="text-align: right;">Aksi</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($categories as $cat)
                    <tr>
                        <td>
                            <span style="display: inline-block; width: 1.25rem; height: 1.25rem; border-radius: 4px; background-color: {{ $cat->color ?? '#0B63CE' }}; border: 1px solid rgba(0,0,0,0.1);"></span>
                        </td>
                        <td>
                            <strong style="color: var(--pp-navy);">{{ $cat->name }}</strong>
                        </td>
                        <td>
                            <code style="font-family: var(--font-mono); font-size: 0.75rem; background: var(--pp-sky); padding: 0.15rem 0.35rem; border-radius: 3px; color: var(--pp-primary);">{{ $cat->slug }}</code>
                        </td>
                        <td style="max-width: 280px;">
                            <span style="font-size: 0.8125rem; color: var(--pp-muted);">{{ $cat->description ?? '-' }}</span>
                        </td>
                        <td>
                            <span class="pp-badge pp-badge-role">{{ $cat->materials_count }} materi</span>
                        </td>
                        <td>
                            @if ($cat->is_active)
                                <span class="pp-badge pp-badge-published">Aktif</span>
                            @else
                                <span class="pp-badge pp-badge-draft">Nonaktif</span>
                            @endif
                        </td>
                        <td style="text-align: right;">
                            <div style="display: inline-flex; align-items: center; gap: 0.5rem;">
                                <button type="button" onclick="openEditModal({{ $cat->toJson() }})" style="background: none; border: none; color: var(--pp-primary); padding: 0.25rem; cursor: pointer;" title="Edit Kategori">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                </button>
                                <form method="POST" action="{{ route('admin.categories.destroy', $cat) }}" onsubmit="return confirm('Apakah Anda yakin ingin menghapus kategori \'{{ addslashes($cat->name) }}\'?');" style="display: inline;">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" style="background: none; border: none; color: #FA5252; padding: 0.25rem; cursor: pointer;" title="Hapus Kategori">
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
</div>

{{-- Modal Tambah Kategori --}}
<div id="modal-create-category" style="display: none; position: fixed; inset: 0; background: rgba(14,39,71,0.6); z-index: 99; align-items: center; justify-content: center; padding: 1rem;">
    <div style="background: #fff; border-radius: 8px; max-width: 500px; width: 100%; box-shadow: var(--shadow-lg); overflow: hidden;">
        <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--pp-border); display: flex; align-items: center; justify-content: space-between;">
            <h3 style="font-size: 1.125rem; font-weight: 600; color: var(--pp-navy); margin: 0;">Tambah Kategori Baru</h3>
            <button type="button" onclick="closeCreateModal()" style="background: none; border: none; font-size: 1.25rem; color: var(--pp-muted); cursor: pointer;">&times;</button>
        </div>

        <form method="POST" action="{{ route('admin.categories.store') }}" style="padding: 1.5rem;">
            @csrf

            <div class="pp-form-group">
                <label for="create_name" class="pp-form-label">Nama Kategori <span style="color: #E03131;">*</span></label>
                <input type="text" id="create_name" name="name" class="pp-input" placeholder="Contoh: Modul Penataran Wasit" required>
            </div>

            <div class="pp-form-group">
                <label for="create_description" class="pp-form-label">Deskripsi Kategori</label>
                <textarea id="create_description" name="description" rows="3" class="pp-input" style="height: auto; padding: 0.75rem;" placeholder="Penjelasan singkat materi dalam kategori ini..."></textarea>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="pp-form-group">
                    <label for="create_color" class="pp-form-label">Warna Aksen</label>
                    <input type="color" id="create_color" name="color" value="#0B63CE" style="height: 44px; width: 100%; border: 1px solid var(--pp-border); border-radius: 6px; padding: 2px; cursor: pointer;">
                </div>

                <div class="pp-form-group" style="display: flex; align-items: center; padding-top: 1.5rem;">
                    <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; cursor: pointer;">
                        <input type="checkbox" name="is_active" value="1" checked class="pp-checkbox">
                        <span>Aktifkan Kategori</span>
                    </label>
                </div>
            </div>

            <div style="border-top: 1px solid var(--pp-border); padding-top: 1.25rem; margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem;">
                <button type="button" onclick="closeCreateModal()" class="btn-secondary" style="padding: 0.5rem 1rem; border: 1px solid var(--pp-border);">Batal</button>
                <button type="submit" class="btn-primary" style="padding: 0.5rem 1.25rem;">Simpan Kategori</button>
            </div>
        </form>
    </div>
</div>

{{-- Modal Edit Kategori --}}
<div id="modal-edit-category" style="display: none; position: fixed; inset: 0; background: rgba(14,39,71,0.6); z-index: 99; align-items: center; justify-content: center; padding: 1rem;">
    <div style="background: #fff; border-radius: 8px; max-width: 500px; width: 100%; box-shadow: var(--shadow-lg); overflow: hidden;">
        <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--pp-border); display: flex; align-items: center; justify-content: space-between;">
            <h3 style="font-size: 1.125rem; font-weight: 600; color: var(--pp-navy); margin: 0;">Edit Kategori</h3>
            <button type="button" onclick="closeEditModal()" style="background: none; border: none; font-size: 1.25rem; color: var(--pp-muted); cursor: pointer;">&times;</button>
        </div>

        <form id="form-edit-category" method="POST" action="" style="padding: 1.5rem;">
            @csrf
            @method('PUT')

            <div class="pp-form-group">
                <label for="edit_name" class="pp-form-label">Nama Kategori <span style="color: #E03131;">*</span></label>
                <input type="text" id="edit_name" name="name" class="pp-input" required>
            </div>

            <div class="pp-form-group">
                <label for="edit_description" class="pp-form-label">Deskripsi Kategori</label>
                <textarea id="edit_description" name="description" rows="3" class="pp-input" style="height: auto; padding: 0.75rem;"></textarea>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="pp-form-group">
                    <label for="edit_color" class="pp-form-label">Warna Aksen</label>
                    <input type="color" id="edit_color" name="color" style="height: 44px; width: 100%; border: 1px solid var(--pp-border); border-radius: 6px; padding: 2px; cursor: pointer;">
                </div>

                <div class="pp-form-group" style="display: flex; align-items: center; padding-top: 1.5rem;">
                    <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; cursor: pointer;">
                        <input type="checkbox" id="edit_is_active" name="is_active" value="1" class="pp-checkbox">
                        <span>Aktifkan Kategori</span>
                    </label>
                </div>
            </div>

            <div style="border-top: 1px solid var(--pp-border); padding-top: 1.25rem; margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem;">
                <button type="button" onclick="closeEditModal()" class="btn-secondary" style="padding: 0.5rem 1rem; border: 1px solid var(--pp-border);">Batal</button>
                <button type="submit" class="btn-primary" style="padding: 0.5rem 1.25rem;">Perbarui Kategori</button>
            </div>
        </form>
    </div>
</div>

<script>
    function openCreateModal() {
        const modal = document.getElementById('modal-create-category');
        if (modal) modal.style.display = 'flex';
    }
    function closeCreateModal() {
        const modal = document.getElementById('modal-create-category');
        if (modal) modal.style.display = 'none';
    }

    function openEditModal(category) {
        const modal = document.getElementById('modal-edit-category');
        const form = document.getElementById('form-edit-category');
        if (modal && form) {
            form.action = '/admin/kategori/' + category.id;
            document.getElementById('edit_name').value = category.name || '';
            document.getElementById('edit_description').value = category.description || '';
            document.getElementById('edit_color').value = category.color || '#0B63CE';
            document.getElementById('edit_is_active').checked = !!category.is_active;
            modal.style.display = 'flex';
        }
    }
    function closeEditModal() {
        const modal = document.getElementById('modal-edit-category');
        if (modal) modal.style.display = 'none';
    }
</script>
@endsection
