# DESIGN SYSTEM — PUSTAKA PENATARAN PERKEMI

## 1. Filosofi & Arah Visual

**Arah Visual:** *Modern Institutional Editorial* dengan sentuhan *Atelier Zero*.
Platform ini menggabungkan otoritas dan martabat institusional resmi PERKEMI (Persaudaraan Bela Diri Kempo Indonesia) dengan keanggunan serta disiplin tata letak editorial kontemporer. Karakter visual dibangun melalui:
- **Tipografi Editorial Berwibawa**: Judul menggunakan display serif dengan kontras goresan elegan, dipadukan dengan sans-serif geometris netral untuk teks isi dan monospace presisi untuk label arsip.
- **Grid Asimetris Disiplin**: Menghindari kartu bento seragam, rounded-corner berlebihan, dan komposisi generik AI. Setiap bagian memiliki ritme visual yang unik.
- **Whitespace & Garis Pembatas Halus**: Memberikan ruang bernapas yang lapang, menggunakan garis pembatas tipis (`#DCE7F3`), dan menjaga hierarki informasi tetap jernih.
- **Tekstur Buku Taktil Realistis**: Menggunakan sampul buku beresolusi tinggi dengan bayangan jilid fisik (*spine ridge*), pita pembatas (*bookmark ribbon*), dan efek sudut buku.

---

## 2. Palet Warna Semantik Wajib

| Token Semantik | HEX | Peruntukan & Panduan Penggunaan | Rasio Kontras |
| :--- | :--- | :--- | :--- |
| `--pp-primary` | `#0B63CE` | Primary Blue — Tombol CTA utama, status aktif, tautan, focus ring | Kontras AA pada latar putih |
| `--pp-primary-dark` | `#0A3F82` | Primary Dark — Heading, kontras tinggi, hover CTA primer | > 7:1 (AAA) pada latar putih |
| `--pp-navy` | `#0E2747` | Navy — Teks gelap, footer, kartu sorotan, elemen premium | > 10:1 (AAA) pada latar putih |
| `--pp-sky` | `#EAF5FF` | Sky — Latar hero section dan section lembut | Latar kontras netral |
| `--pp-green` | `#20A47A` | Green — Kategori Kepelatihan atau status sukses | Kontras AA dengan teks putih |
| `--pp-orange` | `#EE9B25` | Orange — Kategori Perwasitan, badge highlight | Aksen selektif |
| `--pp-rose` | `#DD4D7C` | Rose — Kategori Pengujian, aksen tertentu | Aksen selektif |
| `--pp-purple` | `#7957D5` | Purple — Kategori Materi Pemateri | Aksen selektif |
| `--pp-text` | `#112743` | Text — Teks body utama, paragraf | 12:1 (AAA) pada latar `#F8FBFF` |
| `--pp-muted` | `#6B7C93` | Muted — Keterangan sekunder, metadata, tanggal | 4.8:1 (AA) pada latar `#FFFFFF` |
| `--pp-border` | `#DCE7F3` | Border — Garis pembatas tipis, border kartu | Pembatas subtil |
| `--pp-white` | `#FFFFFF` | White — Latar kartu, navbar, accordion aktif | Bidang baca utama |
| `--pp-bg` | `#F8FBFF` | Background body — Latar utama dokumen | Sejuk, nyaman untuk mata |

---

## 3. Tipografi Editorial

- **Headings & Display:** `Playfair Display` (Serif, 600/700/800, Italic) dengan `text-wrap: balance`
- **Body & UI:** `Inter` / `Instrument Sans` (Sans-Serif, 400/500/600) dengan line-height 1.6–1.7
- **Metadata, Tag, & Nomor:** `JetBrains Mono` (Monospace, 500) dengan letter-spacing 0.08em

---

## 4. Struktur 16 Section Landing Page

1. **Top Utility Bar:** Bar tipis di atas header menampilkan status *"Portal Pembelajaran Digital PERKEMI"*, tautan bantuan, dan tombol masuk.
2. **Header & Navigasi:** Logo formal Pustaka Penataran, sub-identitas PERKEMI, navigasi desktop dengan dropdown Koleksi, sticky state, dan CTA Masuk Portal.
3. **Hero Utama:** Label *"📘 Digital Learning Center"*, headline *"Satu Akses, Banyak Pengetahuan"*, subheadline resmi, CTA *"Jelajahi Koleksi"* dan *"Cara Menggunakan"*, serta tumpukan buku 3D taktil.
4. **Statistik & Kepercayaan:** Bar metrik horizontal sederhana dengan garis pemisah: *"120+ Modul Tersedia"*, *"340+ Materi Pembelajaran"*, *"6 Kelompok Peran"*, *"Akses Terpusat"*.
5. **Pencarian Koleksi:** Kolom input pencarian instan dengan judul *"Temukan materi yang Anda butuhkan"*, 6 filter chip, dan tautan *"Lihat seluruh koleksi"*.
6. **Koleksi Pilihan:** Judul *"Pilihan untuk Anda: Koleksi untuk memperkuat pembelajaran"*, 1 hero book berukuran besar dengan metadata lengkap + 3 buku pendukung editorial, status akses tag, dan empty state.
7. **Jelajahi Berdasarkan Kategori:** Grid editorial 6 kategori materi resmi PERKEMI beraksen warna (Blue, Green, Orange, Purple, Rose, Dark) dengan penghitung materi.
8. **Jalur Belajar:** Timeline alur 4 langkah: 01 Pilih Peran $\rightarrow$ 02 Temukan Materi $\rightarrow$ 03 Baca atau Unduh Bahan $\rightarrow$ 04 Terapkan dalam Kegiatan.
9. **Jelajahi Berdasarkan Peran:** Selektor peran interaktif (Peserta, Pelatih, Penguji, Wasit, Pemateri, Penyelenggara) dengan ringkasan kebutuhan utama, modul rekomendasi, dan CTA khusus.
10. **Sorotan Materi Utama:** Modul unggulan nasional dalam latar Sky (`#EAF5FF`) dengan sampul besar, pita pembatas, metadata penerbit, dan CTA *"Baca Materi"*.
11. **Rilis & Pembaruan Terbaru:** Daftar pembaruan tanggal, judul, dan tipe dokumen resmi dengan tautan *"Lihat semua pembaruan"*.
12. **Mengapa Pustaka Penataran:** Empat pilar keunggulan bernomor besar (*01 Materi terpusat*, *02 Referensi terorganisir*, *03 Pembelajaran konsisten*, *04 Akses fleksibel*) dengan garis pembatas tipis tanpa kartu seragam.
13. **Cara Menggunakan Portal:** 3 langkah praktis (*01 Masuk ke Portal*, *02 Cari atau Pilih Kategori*, *03 Baca, Simpan, atau Gunakan*) dilengkapi skematik antarmuka dokumen resmi.
14. **FAQ / Bantuan:** 3 kanal bantuan (*Panduan Memulai*, *Pertanyaan Umum*, *Hubungi Admin*), 5 accordion pertanyaan wajib teraksesibilitas, dan tombol *"Buka Pusat Bantuan"*.
15. **CTA Penutup:** Bidang Navy (`#0E2747`) dengan ajakan bertindak kuat, tombol *"Buka Koleksi Digital"*, dan *"Masuk Portal"*.
16. **Footer:** Identitas PERKEMI, 4 kolom navigasi terstruktur, status legal, hak cipta, dan kepatuhan privasi.

---

## 5. Aksesibilitas & Kualitas Teknis

- **Keyboard Trapping & Esc Key**: Mobile drawer dapat dibuka/tutup dengan tombol, backdrop, tombol Escape, dan fokus keyboard.
- **Scroll Spy & Reduced Motion**: Navigasi sticky otomatis menyorot section aktif dengan garis indikator `#0B63CE`. Pengguna dengan `prefers-reduced-motion` mendapatkan pengalaman statis tanpa animasi transform.
- **Kontras WCAG AA/AAA**: Seluruh elemen teks memenuhi rasio kontras di atas 4.5:1 untuk teks biasa dan di atas 7:1 untuk tajuk gelap pada latar putih.
