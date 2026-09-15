@extends('admin.layout')

@section('title', 'Pengaturan Portal')
@section('breadcrumb', 'Pengaturan Portal')

@section('content')
<div class="pp-admin-page-header">
    <div>
        <h1 class="pp-admin-page-title">Pengaturan Portal</h1>
        <p class="pp-admin-page-desc">Konfigurasi identitas, registrasi, tampilan, dan operasional Pustaka Penataran PERKEMI.</p>
    </div>
</div>

<div class="pp-admin-card">
    {{-- Tabs --}}
    <div class="pp-tabs" style="padding: 0 1.5rem; background-color: #FAFBFD;">
        <button type="button" class="pp-tab-btn active" onclick="switchTab('tab-identity', this)">1. Identitas Portal</button>
        <button type="button" class="pp-tab-btn" onclick="switchTab('tab-appearance', this)">2. Tampilan Beranda</button>
        <button type="button" class="pp-tab-btn" onclick="switchTab('tab-access', this)">3. Akses & Registrasi</button>
        <button type="button" class="pp-tab-btn" onclick="switchTab('tab-notifications', this)">4. Notifikasi</button>
    </div>

    {{-- Form Tab 1: Identitas Portal --}}
    <div id="tab-identity" class="pp-tab-content" style="padding: 1.5rem 2rem;">
        <form method="POST" action="{{ route('admin.settings.update') }}">
            @csrf
            @method('PUT')
            <input type="hidden" name="settings_group" value="identity">

            <div style="max-width: 640px;">
                <div class="pp-form-group">
                    <label for="portal_name" class="pp-form-label">Nama Portal</label>
                    <input type="text" id="portal_name" name="portal_name" value="{{ old('portal_name', $settings['portal_name'] ?? 'Pustaka Penataran') }}" class="pp-input" required>
                </div>

                <div class="pp-form-group">
                    <label for="portal_subtitle" class="pp-form-label">Sub-Identitas</label>
                    <input type="text" id="portal_subtitle" name="portal_subtitle" value="{{ old('portal_subtitle', $settings['portal_subtitle'] ?? 'Portal Buku Digital PERKEMI') }}" class="pp-input" required>
                </div>

                <div class="pp-form-group">
                    <label for="portal_description" class="pp-form-label">Deskripsi Portal</label>
                    <textarea id="portal_description" name="portal_description" rows="3" class="pp-input" style="height: auto; padding: 0.75rem;">{{ old('portal_description', $settings['portal_description'] ?? '') }}</textarea>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="pp-form-group">
                        <label for="contact_email" class="pp-form-label">Email Sekretariat</label>
                        <input type="email" id="contact_email" name="contact_email" value="{{ old('contact_email', $settings['contact_email'] ?? 'sekretariat@perkemi.id') }}" class="pp-input">
                    </div>

                    <div class="pp-form-group">
                        <label for="contact_phone" class="pp-form-label">Nomor Telepon</label>
                        <input type="text" id="contact_phone" name="contact_phone" value="{{ old('contact_phone', $settings['contact_phone'] ?? '+62 21 5732145') }}" class="pp-input">
                    </div>
                </div>

                <div class="pp-form-group">
                    <label for="footer_copyright" class="pp-form-label">Teks Hak Cipta Footer</label>
                    <input type="text" id="footer_copyright" name="footer_copyright" value="{{ old('footer_copyright', $settings['footer_copyright'] ?? 'Pengurus Besar Persaudaraan Shorinji Kempo Indonesia (PB PERKEMI)') }}" class="pp-input">
                </div>

                <div style="border-top: 1px solid var(--pp-border); padding-top: 1.5rem; margin-top: 1.5rem;">
                    <button type="submit" class="btn-primary" style="padding: 0.625rem 1.5rem;">Simpan Identitas Portal</button>
                </div>
            </div>
        </form>
    </div>

    {{-- Form Tab 2: Tampilan Beranda --}}
    <div id="tab-appearance" class="pp-tab-content" style="display: none; padding: 1.5rem 2rem;">
        <form method="POST" action="{{ route('admin.settings.update') }}">
            @csrf
            @method('PUT')
            <input type="hidden" name="settings_group" value="appearance">

            <div style="max-width: 640px;">
                <div class="pp-form-group">
                    <label for="hero_badge" class="pp-form-label">Label Hero Badge</label>
                    <input type="text" id="hero_badge" name="hero_badge" value="{{ old('hero_badge', $settings['hero_badge'] ?? '📘 Digital Learning Center') }}" class="pp-input">
                </div>

                <div class="pp-form-group">
                    <label for="hero_headline" class="pp-form-label">Headline Utama Landing Page</label>
                    <input type="text" id="hero_headline" name="hero_headline" value="{{ old('hero_headline', $settings['hero_headline'] ?? 'Satu Akses, Banyak Pengetahuan') }}" class="pp-input">
                </div>

                <div class="pp-form-group">
                    <label for="hero_subheadline" class="pp-form-label">Subheadline Deskripsi</label>
                    <textarea id="hero_subheadline" name="hero_subheadline" rows="3" class="pp-input" style="height: auto; padding: 0.75rem;">{{ old('hero_subheadline', $settings['hero_subheadline'] ?? '') }}</textarea>
                </div>

                <div style="border-top: 1px solid var(--pp-border); padding-top: 1.5rem; margin-top: 1.5rem;">
                    <button type="submit" class="btn-primary" style="padding: 0.625rem 1.5rem;">Simpan Pengaturan Tampilan</button>
                </div>
            </div>
        </form>
    </div>

    {{-- Form Tab 3: Akses & Registrasi --}}
    <div id="tab-access" class="pp-tab-content" style="display: none; padding: 1.5rem 2rem;">
        <form method="POST" action="{{ route('admin.settings.update') }}">
            @csrf
            @method('PUT')
            <input type="hidden" name="settings_group" value="access">

            <div style="max-width: 640px;">
                <div class="pp-form-group">
                    <label class="pp-form-label">Status Pendaftaran Akun Publik</label>
                    <div style="display: flex; gap: 1.5rem; margin-top: 0.5rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.875rem;">
                            <input type="radio" name="registration_open" value="1" {{ ($settings['registration_open'] ?? '1') === '1' ? 'checked' : '' }}>
                            <span>Pendaftaran Terbuka (Publik dapat mendaftar)</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.875rem;">
                            <input type="radio" name="registration_open" value="0" {{ ($settings['registration_open'] ?? '1') === '0' ? 'checked' : '' }}>
                            <span>Pendaftaran Ditutup (Hanya admin)</span>
                        </label>
                    </div>
                </div>

                <div class="pp-form-group" style="margin-top: 1.5rem;">
                    <label for="default_role" class="pp-form-label">Peran Default Pendaftar Baru</label>
                    <select id="default_role" name="default_role" class="pp-input pp-select">
                        <option value="Peserta" {{ ($settings['default_role'] ?? 'Peserta') === 'Peserta' ? 'selected' : '' }}>Peserta Penataran</option>
                        <option value="Pelatih" {{ ($settings['default_role'] ?? 'Peserta') === 'Pelatih' ? 'selected' : '' }}>Pelatih</option>
                        <option value="Penguji" {{ ($settings['default_role'] ?? 'Peserta') === 'Penguji' ? 'selected' : '' }}>Penguji</option>
                        <option value="Wasit" {{ ($settings['default_role'] ?? 'Peserta') === 'Wasit' ? 'selected' : '' }}>Wasit</option>
                    </select>
                </div>

                <div style="border-top: 1px solid var(--pp-border); padding-top: 1.5rem; margin-top: 1.5rem;">
                    <button type="submit" class="btn-primary" style="padding: 0.625rem 1.5rem;">Simpan Pengaturan Akses</button>
                </div>
            </div>
        </form>
    </div>

    {{-- Form Tab 4: Notifikasi --}}
    <div id="tab-notifications" class="pp-tab-content" style="display: none; padding: 1.5rem 2rem;">
        <form method="POST" action="{{ route('admin.settings.update') }}">
            @csrf
            @method('PUT')
            <input type="hidden" name="settings_group" value="notification">

            <div style="max-width: 640px;">
                <div class="pp-form-group">
                    <label style="display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer;">
                        <input type="checkbox" name="notify_new_material" value="1" class="pp-checkbox" {{ ($settings['notify_new_material'] ?? '1') === '1' ? 'checked' : '' }}>
                        <div>
                            <strong style="display: block; color: var(--pp-navy); font-size: 0.875rem;">Notifikasi Modul Baru</strong>
                            <span style="font-size: 0.8125rem; color: var(--pp-muted);">Kirimkan notifikasi ke dasbor kenshi ketika materi baru sesuai perannya diterbitkan.</span>
                        </div>
                    </label>
                </div>

                <div style="border-top: 1px solid var(--pp-border); padding-top: 1.5rem; margin-top: 1.5rem;">
                    <button type="submit" class="btn-primary" style="padding: 0.625rem 1.5rem;">Simpan Pengaturan Notifikasi</button>
                </div>
            </div>
        </form>
    </div>
</div>

<script>
    function switchTab(tabId, buttonElement) {
        document.querySelectorAll('.pp-tab-content').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.pp-tab-btn').forEach(btn => btn.classList.remove('active'));

        const targetTab = document.getElementById(tabId);
        if (targetTab) targetTab.style.display = 'block';
        if (buttonElement) buttonElement.classList.add('active');
    }
</script>
@endsection
