# Prompt Induk Pustaka Penataran

Kerjakan halaman ini di dalam proyek **Pustaka Penataran — Portal Buku Digital PERKEMI** menggunakan **Laravel + React + Inertia**.

Sebelum mengubah kode, baca `AGENTS.md`, `DESIGN.md`, `inputs.json`, struktur route, controller, model, halaman Inertia, komponen reusable, autentikasi, authorization, serta aset yang tersedia.

Gunakan komponen dan pola yang sudah ada di proyek terlebih dahulu. Jangan membuat route, data, statistik, permission, atau interaksi palsu.

## Aturan teknis

* Laravel menangani route, controller, database, validasi, authorization, storage, dan proses backend.
* React + Inertia menangani halaman, layout, komponen, form, state UI, dan navigasi.
* Jangan membuat REST API terpisah bila Inertia sudah digunakan.
* Gunakan `Link`, `router`, dan `useForm` dari Inertia sesuai kebutuhan.
* Gunakan Form Request, Policy, atau Gate Laravel untuk aksi yang membutuhkan validasi atau permission.
* Gunakan data nyata dari backend; jangan gunakan data dummy yang terlihat seperti data produksi.

## Workflow wajib

1. Gunakan `create-design-md` bila design system perlu diperbarui.
2. Gunakan `ui-ux-pro-max` untuk pola UX, typography, layout, responsivitas, dan hierarchy.
3. Gunakan `frontend-design` untuk implementasi React + Inertia.
4. Gunakan `baseline-ui` untuk merapikan spacing, state, dan komponen.
5. Gunakan `impeccable` untuk critique dan polish akhir.
6. Gunakan `web-design-guidelines` untuk audit accessibility, navigation, form, interaction, motion, dan performance.
7. Gunakan Framer Motion hanya untuk animasi yang menjelaskan perubahan state atau hierarchy; hindari animasi dekoratif berlebihan.

## Design system Pustaka Penataran

Gunakan warna berikut secara konsisten:

* Primary Blue `#0B63CE` untuk CTA utama, link, progress, dan focus state.
* Primary Dark `#0A3F82` untuk heading dan kontras.
* Navy `#0E2747` untuk teks gelap dan elemen premium.
* Sky `#EAF5FF` untuk section lembut.
* Green `#20A47A`, Orange `#EE9B25`, Rose `#DD4D7C`, dan Purple `#7957D5` hanya untuk status atau kategori.
* Text `#112743`.
* Muted `#6B7C93`.
* Border `#DCE7F3`.
* Background `#F8FBFF`.

Gunakan gaya **Modern Institutional Editorial** dengan sentuhan **Atelier Zero**: formal, tenang, modern, lapang, dan mudah dipindai.

Hindari:

* Gradient berlebihan.
* Glassmorphism.
* Kartu bento seragam.
* Sudut terlalu bulat.
* Ikon dekoratif tanpa fungsi.
* Tampilan dashboard SaaS atau template AI generik.
* Placeholder yang tidak diperlukan.

## Referensi visual

Jika ada gambar referensi, gunakan sebagai acuan **layout, hierarchy, dan pengalaman pengguna**, bukan untuk menyalin merek, logo, teks, atau UI layanan pihak ketiga.

Sesuaikan seluruh warna, typography, komponen, dan identitas visual dengan Pustaka Penataran.

## Ketentuan responsif dan aksesibilitas

* Desktop: hierarchy jelas, container lebar, dan whitespace cukup.
* Tablet: sederhanakan grid sesuai ruang.
* Mobile: prioritaskan konten utama, target sentuh nyaman, dan drawer untuk navigasi atau panel sekunder.
* Semua kontrol harus dapat digunakan dengan keyboard.
* Semua tombol ikon memiliki `aria-label` atau tooltip.
* Gunakan focus ring Primary Blue.
* Hormati `prefers-reduced-motion`.
* Sediakan loading, empty, error, hover, focus, active, dan disabled state sesuai kebutuhan halaman.

## Verifikasi akhir

1. Uji route dan navigasi halaman.
2. Uji data dari Laravel.
3. Uji validasi dan permission bila ada form atau aksi.
4. Uji desktop, tablet, dan mobile.
5. Uji keyboard navigation serta accessibility.
6. Pastikan halaman konsisten dengan komponen dan design system Pustaka Penataran.
7. Pastikan tidak ada UI palsu, data dummy produksi, atau interaksi yang tidak berfungsi.

## Detail kebutuhan halaman

[TULIS DETAIL KHUSUS HALAMAN DI SINI]
