# Walkthrough: Transformasi Admin Dashboard ke Laravel + React + Inertia SPA

Telah berhasil diselesaikan migrasi dan pengembangan penuh seluruh area **Admin Dashboard Pustaka Penataran** (Portal Buku Digital PERKEMI) menjadi aplikasi Single Page Application (SPA) berbasis **Laravel 12 + React 19 + Inertia.js v2**.

---

## 1. Arsitektur & Fondasi Sistem

```
app/
  Http/
    Controllers/Admin/
      DashboardController.php        -> Inertia::render('Admin/Dashboard')
      MaterialController.php         -> Inertia::render('Admin/Collections/*')
      CategoryController.php         -> Inertia::render('Admin/Categories/Index')
      UserController.php             -> Inertia::render('Admin/Users/Index')
      PermissionController.php       -> Inertia::render('Admin/Permissions/Index')
      ActivityController.php         -> Inertia::render('Admin/Activities/Index')
      SettingController.php          -> Inertia::render('Admin/Settings/Index')
      HelpController.php             -> Inertia::render('Admin/Help/Index')
    Middleware/
      HandleInertiaRequests.php      -> Shared auth.user, flash, portal config
    Requests/Admin/
      StoreMaterialRequest.php       -> Validasi Bahasa Indonesia
      UpdateMaterialRequest.php
      UpdateMaterialStatusRequest.php
      StoreCategoryRequest.php
      UpdateCategoryRequest.php
      StoreUserRequest.php
      UpdateUserRoleRequest.php
      UpdatePermissionsRequest.php
      UpdateSettingsRequest.php
  Policies/
    MaterialPolicy.php               -> Otorisasi model materi
    UserPolicy.php                   -> Otorisasi manajemen pengguna

resources/js/
  Components/
    ui/
      Button.jsx, Input.jsx, Textarea.jsx, PasswordInput.jsx,
      Select.jsx, Combobox.jsx, Checkbox.jsx, Switch.jsx,
      Badge.jsx, Modal.jsx, AlertDialog.jsx, DropdownMenu.jsx,
      Pagination.jsx, DataTable.jsx, EmptyState.jsx,
      Skeleton.jsx, Toast.jsx
    admin/
      PageHeader.jsx, AdminSidebar.jsx, AdminTopbar.jsx,
      TableToolbar.jsx, FilterBar.jsx, ConfirmDialog.jsx,
      FileUpload.jsx
  Layouts/
    AdminLayout.jsx
  Pages/
    Admin/
      Dashboard.jsx
      Collections/ (Index.jsx, Create.jsx, Edit.jsx)
      Categories/ (Index.jsx)
      Users/ (Index.jsx)
      Permissions/ (Index.jsx)
      Activities/ (Index.jsx)
      Settings/ (Index.jsx)
      Help/ (Index.jsx)
```

---

## 2. Reusable UI Components

Seluruh antarmuka admin dibangun menggunakan komponen modular:

| Komponen | Kegunaan & Fitur Utama |
|---|---|
| `Button` | Varian Primary Blue (`#0B63CE`), Secondary, Danger, Ghost; loading spinner bawaan; dukungan ikon. |
| `Input` & `Textarea` | Label terlihat wajib, inline error Bahasa Indonesia, focus ring `#0B63CE`, helper text. |
| `PasswordInput` | Toggle intip kata sandi dengan ikon mata dan `aria-label` aksesibilitas. |
| `Select` | Dropdown native berbingkai rapi untuk pilihan pendek & statis (status, jenis materi, peran). |
| `Combobox` | Dropdown pencarian dinamis, navigasi keyboard (ArrowUp/Down, Enter, Esc), empty state, dan indikator warna metadata. |
| `Checkbox` & `Switch` | Kontrol centang dan toggle accessible dengan styling Tailwind kustom. |
| `Badge` | Label status semantik (Terbit: Hijau `#20A47A`, Tinjauan: Oranye `#EE9B25`, Draf: Abu-abu, Arsip: Rose `#DD4D7C`, Admin: Ungu `#7957D5`). |
| `Modal` | Dialog pop-up dengan focus trap, penutup `Escape`, klik backdrop, dan pengunci saat submit berjalan. |
| `AlertDialog` | Dialog konfirmasi untuk aksi destruktif (hapus materi, hapus kategori, konfirmasi wewenang). |
| `DropdownMenu` | Menu aksi kontekstual baris tabel (*Row Action Menu*) dengan penutup otomatis. |
| `DataTable` | Tabel serbaguna dengan sortir, status badge, empty state terintegrasi, horizontal scroll responsif, dan pagination. |
| `Pagination` | Navigasi halaman Laravel asli dengan query preservation via Inertia `Link`. |
| `Toast` | Notifikasi pop-up feedback sukses/error yang otomatis membaca flash message dari backend. |
| `FileUpload` | Komponen unggah sampul buku dengan drag-and-drop, preview gambar, dan batas 2MB. |

---

## 3. Rincian Modul Halaman Admin

### 1. Ringkasan Portal (`/admin`)
- 4 Kartu Metrik: Total Koleksi (9), Materi Terbit (9), Perlu Ditinjau (0), Pengguna Terdaftar (2).
- Panel Materi Perlu Ditinjau & Kurasi dengan tombol tinjau langsung.
- Tabel Koleksi Terbaru Ditambahkan.
- Progress bar distribusi kategori topik materi.
- Timeline vertikal audit aktivitas terkini.

### 2. Koleksi Digital (`/admin/koleksi`, `/admin/koleksi/create`, `/admin/koleksi/{material}/edit`)
- **Index**: DataTable dengan filter pencarian kata kunci, kategori, status publikasi, jenis materi, dan tahun terbit.
- **Aksi Baris**: Ubah status cepat (Terbit, Tinjauan, Draf, Arsip), Edit Materi, dan Hapus Materi dengan `AlertDialog`.
- **Create & Edit**: Formulir editorial lengkap dengan `useForm`, `Combobox` kategori, `FileUpload` sampul, pemilih checkbox audiens peran sasaran, dan `Switch` dokumen unduhan/unggulan.

### 3. Kategori Materi (`/admin/kategori`)
- DataTable kategori dengan warna aksen visual dan penghitung relasi materi (`materials_count`).
- Modal tambah dan edit kategori tanpa reload halaman.
- Proteksi penghapusan kategori: menolak penghapusan kategori yang masih memiliki materi terkait.

### 4. Pengguna Portal (`/admin/pengguna`)
- DataTable kenshi dengan pencarian nama/email dan filter peran.
- Modal tambah pengguna baru dengan kata sandi aman (min 8 karakter).
- Modal ubah peran kenshi (*quick role switcher*).

### 5. Hak Akses & Peran (`/admin/hak-akses`)
- Matriks interaktif wewenang sistem yang dikelompokkan per modul: *Modul Koleksi Digital*, *Modul Kategori Materi*, *Modul Pengguna Portal*, *Modul Pengaturan Portal*.
- Tombol toggle centang interaktif dan dialog konfirmasi sebelum penyimpanan batch.

### 6. Aktivitas & Audit Trail (`/admin/aktivitas`)
- Menampilkan data audit log nyata dari PostgreSQL.
- Filter berdasarkan jenis event dan aktor pelaksana.
- Modal detail snapshot properti JSON untuk investigasi jejak audit.

### 7. Pengaturan Portal (`/admin/pengaturan`)
- 4 Tab mandiri dengan `useForm`:
  1. *Identitas Portal*: Nama situs, slogan, nama induk organisasi, surel kontak, nomor telepon.
  2. *Tampilan Beranda*: Lencana hero, headline utama, subheadline pengantar.
  3. *Akses & Registrasi*: Toggle pendaftaran mandiri, verifikasi surel, dan mode perawatan portal.
  4. *Notifikasi & Surel*: Konfigurasi server SMTP dan surel pengirim.

### 8. Bantuan & Panduan Admin (`/admin/bantuan`)
- 4 Langkah SOP alur kurasi dan publikasi naskah penataran.
- Pertanyaan Sering Diajukan (FAQ) operasional.
- Kartu kontak sekretariat dan dukungan IT PB PERKEMI.

---

## 4. Hasil Verifikasi & Pengujian

### A. Pengujian Otomatis (Pest Framework)
Seluruh 23 tes fitur dan unit lulus 100%:

```bash
vendor/bin/pest
# {"tool":"pest","result":"passed","tests":23,"passed":23,"assertions":137,"duration_ms":943}
```

Daftar tes yang terverifikasi:
1. `guest cannot access admin dashboard and is redirected to login`
2. `non-admin user cannot access admin dashboard (403 forbidden)`
3. `admin user can view dashboard overview with real metrics via inertia`
4. `admin can view materials collection with search and filters via inertia`
5. `admin can create a new material`
6. `admin can update material status`
7. `admin can delete a material`
8. `admin can create category`
9. `admin cannot delete category with existing materials`
10. `admin can change user role`
11. `admin can view and update permission matrix via inertia`
12. `admin can view activities audit log via inertia`
13. `admin can view and update portal settings via inertia`
14. `admin can view help guide and faq via inertia`
15. + 9 unit/auth tests (`AuthTest`, `ExampleTest`).

### B. Kompilasi Frontend & Aset (Vite)
Kompilasi produksi berjalan lancar tanpa error:

```bash
npm run build
# ✓ 2453 modules transformed.
# ✓ built in 1.36s
```

### C. Pemformatan Kode (Laravel Pint)
Semua file PHP diformat sesuai standar Laravel Boost:

```bash
vendor/bin/pint --format agent
# {"tool":"pint","result":"passed"}
```
