@extends('admin.layout')

@section('title', 'Bantuan Admin')
@section('breadcrumb', 'Bantuan Admin')

@section('content')
<div class="pp-admin-page-header">
    <div>
        <h1 class="pp-admin-page-title">Bantuan & Panduan Administrator</h1>
        <p class="pp-admin-page-desc">Petunjuk operasional kurasi materi, manajemen kenshi, dan FAQ teknis portal.</p>
    </div>
</div>

<div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem;" class="lg:grid-cols-3">
    {{-- Kolom Kiri & Tengah: Panduan Operasional (2 Kolom) --}}
    <div style="grid-column: span 2; display: flex; flex-direction: column; gap: 1.5rem;">
        {{-- Panduan 1: Kurasi Modul --}}
        <div class="pp-admin-card" style="margin-bottom: 0;">
            <div class="pp-admin-card-header">
                <h3 class="pp-admin-card-title">1. Alur Publikasi & Kurasi Modul</h3>
            </div>
            <div style="padding: 1.5rem; font-size: 0.875rem; color: var(--pp-text); line-height: 1.6;">
                <ol style="padding-left: 1.25rem; margin: 0; display: flex; flex-direction: column; gap: 0.75rem;">
                    <li>
                        <strong>Penyusunan Draf (Draf):</strong> Modul baru dibuat oleh tim materi atau pemateri dengan status <em>Draf</em>. Pada status ini, modul hanya dapat dilihat oleh administrator dan pembuatnya.
                    </li>
                    <li>
                        <strong>Pengajuan Tinjauan (Dalam Tinjauan):</strong> Setelah isi naskah dan metadata lengkap, ubah status menjadi <em>Dalam Tinjauan</em> agar tim peninjau / Dewan Guru dapat memeriksa kesesuaian kurikulum nasional.
                    </li>
                    <li>
                        <strong>Penerbitan Resmi (Terbit):</strong> Administrator menetapkan status <em>Terbit</em>. Modul secara otomatis muncul di katalog publik dan dapat diakses kenshi sesuai peran sasarannya.
                    </li>
                    <li>
                        <strong>Pengarsipan (Diarsipkan):</strong> Modul versi lama yang telah digantikan oleh silabus baru dapat diarsipkan agar tidak muncul di pencarian utama namun tetap tersimpan dalam basis data sejarah.
                    </li>
                </ol>
            </div>
        </div>

        {{-- Panduan 2: Hak Akses --}}
        <div class="pp-admin-card" style="margin-bottom: 0;">
            <div class="pp-admin-card-header">
                <h3 class="pp-admin-card-title">2. Manajemen Peran & Hak Akses Kenshi</h3>
            </div>
            <div style="padding: 1.5rem; font-size: 0.875rem; color: var(--pp-text); line-height: 1.6;">
                <p style="margin-top: 0;">
                    Pustaka Penataran membedakan izin akses berdasarkan peran resmi PERKEMI:
                </p>
                <ul style="padding-left: 1.25rem; margin-bottom: 0; display: flex; flex-direction: column; gap: 0.5rem;">
                    <li><strong>Peserta:</strong> Akses modul persiapan, materi teori dasar, dan silabus ujian kyu/dan.</li>
                    <li><strong>Pelatih:</strong> Kurikulum kepelatihan, metodologi teknik, dan materi pembinaan dojo.</li>
                    <li><strong>Penguji:</strong> Rubrik pengujian kyu/dan, lembar penilaian standar, dan panduan penguji resmi.</li>
                    <li><strong>Wasit:</strong> Buku peraturan pertandingan, kode etik, dan panduan perwasitan Shorinji Kempo.</li>
                    <li><strong>Pemateri:</strong> Paket bahan ajar presentasi dan kurikulum bahan ajar nasional.</li>
                    <li><strong>Administrator:</strong> Akses penuh ke dashboard pengelolaan modul, pengguna, dan audit log.</li>
                </ul>
            </div>
        </div>

        {{-- FAQ Administrasi --}}
        <div class="pp-admin-card" style="margin-bottom: 0;">
            <div class="pp-admin-card-header">
                <h3 class="pp-admin-card-title">Pertanyaan Umum (FAQ)</h3>
            </div>
            <div style="padding: 1.5rem; font-size: 0.875rem; color: var(--pp-text); line-height: 1.6; display: flex; flex-direction: column; gap: 1rem;">
                <div>
                    <h4 style="font-size: 0.9375rem; font-weight: 600; color: var(--pp-navy); margin: 0 0 0.25rem;">Mengapa kategori tidak dapat dihapus?</h4>
                    <p style="margin: 0; color: var(--pp-muted);">Kategori yang masih memiliki materi terkait dilindungi dari penghapusan demi integritas data. Anda harus memindahkan materi ke kategori lain atau menghapus materinya terlebih dahulu.</p>
                </div>
                <div>
                    <h4 style="font-size: 0.9375rem; font-weight: 600; color: var(--pp-navy); margin: 0 0 0.25rem;">Bagaimana jika pengguna lupa kata sandi?</h4>
                    <p style="margin: 0; color: var(--pp-muted);">Admin dapat memverifikasi identitas kenshi bersangkutan melalui kontak resmi sekretariat, lalu memperbarui akun melalui manajemen pengguna.</p>
                </div>
            </div>
        </div>
    </div>

    {{-- Kolom Kanan: Info Dukungan Teknis --}}
    <div>
        <div class="pp-admin-card" style="background-color: var(--pp-sky); border-color: rgba(11,99,206,0.2);">
            <div class="pp-admin-card-header" style="background-color: transparent;">
                <h3 class="pp-admin-card-title" style="color: var(--pp-navy);">Kontak Dukungan IT</h3>
            </div>
            <div style="padding: 1.25rem; font-size: 0.875rem; color: var(--pp-navy); line-height: 1.6;">
                <p style="margin-top: 0;">
                    Jika Anda mengalami kendala teknis atau membutuhkan perubahan arsitektur data, hubungi tim IT PB PERKEMI:
                </p>
                <div style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.8125rem;">
                    <div><strong>Email:</strong> it-support@perkemi.id</div>
                    <div><strong>Telepon:</strong> (021) 5732145 ext. 104</div>
                    <div><strong>Jam Layanan:</strong> Senin – Jumat, 09.00 – 17.00 WIB</div>
                </div>
            </div>
        </div>

        <div class="pp-admin-card">
            <div class="pp-admin-card-header">
                <h3 class="pp-admin-card-title">Pintasan Cepat</h3>
            </div>
            <div style="padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.875rem;">
                <a href="{{ route('admin.materials.create') }}" style="color: var(--pp-primary); font-weight: 500; text-decoration: none;">&rarr; Unggah Modul Baru</a>
                <a href="{{ route('admin.users.index') }}" style="color: var(--pp-primary); font-weight: 500; text-decoration: none;">&rarr; Kelola Pengguna</a>
                <a href="{{ route('admin.settings.index') }}" style="color: var(--pp-primary); font-weight: 500; text-decoration: none;">&rarr; Buka Pengaturan Portal</a>
            </div>
        </div>
    </div>
</div>
@endsection
