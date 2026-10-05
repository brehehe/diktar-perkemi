<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\EventBudget;
use App\Models\User;
use Illuminate\Database\Seeder;

class EventBudgetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $event = Event::find(3) ?? Event::first();

        if (! $event) {
            return;
        }

        $admin = User::where('role', 'Admin')->first() ?? User::first();
        $adminId = $admin?->id;

        // Clean existing budgets for this event before seeding
        EventBudget::where('event_id', $event->id)->delete();

        // $items = [
        //     // PEMASUKAN (INCOME)
        //     [
        //         'type' => 'income',
        //         'category' => 'registration',
        //         'item_name' => 'Kontribusi Pendaftaran Peserta Penataran',
        //         'quantity' => 50,
        //         'unit' => 'orang',
        //         'unit_price' => 1500000,
        //         'amount' => 75000000,
        //         'notes' => 'Kontribusi kepesertaan penataran pelatih, wasit & penguji tingkat daerah & nasional (50 peserta terdaftar)',
        //         'sort_order' => 1,
        //     ],
        //     [
        //         'type' => 'income',
        //         'category' => 'grant',
        //         'item_name' => 'Bantuan Operasional Penataran Pengprov PERKEMI Jatim',
        //         'quantity' => 1,
        //         'unit' => 'paket',
        //         'unit_price' => 25000000,
        //         'amount' => 25000000,
        //         'notes' => 'Alokasi dana pembinaan dan penyelenggaraan dari Pengprov PERKEMI Jawa Timur TA 2026',
        //         'sort_order' => 2,
        //     ],
        //     [
        //         'type' => 'income',
        //         'category' => 'grant',
        //         'item_name' => 'Subsidi Kegiatan PB PERKEMI',
        //         'quantity' => 1,
        //         'unit' => 'paket',
        //         'unit_price' => 15000000,
        //         'amount' => 15000000,
        //         'notes' => 'Subsidi dukungan akreditasi pelatih & wasit nasional dari PB PERKEMI',
        //         'sort_order' => 3,
        //     ],
        //     [
        //         'type' => 'income',
        //         'category' => 'sponsorship',
        //         'item_name' => 'Sponsorship & Kemitraan Mitra Olahraga',
        //         'quantity' => 1,
        //         'unit' => 'paket',
        //         'unit_price' => 10000000,
        //         'amount' => 10000000,
        //         'notes' => 'Dukungan sponsor apparel, peralatan matras dan mitra perbankan daerah',
        //         'sort_order' => 4,
        //     ],

        //     // PENGELUARAN (EXPENSE)
        //     [
        //         'type' => 'expense',
        //         'category' => 'venue',
        //         'item_name' => 'Sewa Gedung Dojang & Fasilitas Pelaksanaan',
        //         'quantity' => 4,
        //         'unit' => 'hari',
        //         'unit_price' => 3500000,
        //         'amount' => 14000000,
        //         'notes' => 'Sewa aula dojang utama, fasilitas sound system, pendingin dan 2 gelanggang matras pertandingan',
        //         'sort_order' => 10,
        //     ],
        //     [
        //         'type' => 'expense',
        //         'category' => 'accommodation',
        //         'item_name' => 'Akomodasi Hotel Pemateri & Tim Penguji PB PERKEMI',
        //         'quantity' => 32,
        //         'unit' => 'kamar/malam',
        //         'unit_price' => 650000,
        //         'amount' => 20800000,
        //         'notes' => '8 kamar x 4 malam untuk Dewan Guru, Tim Penguji Nasional dan Instruktur PB PERKEMI',
        //         'sort_order' => 11,
        //     ],
        //     [
        //         'type' => 'expense',
        //         'category' => 'consumption',
        //         'item_name' => 'Konsumsi Peserta, Penguji & Panitia (Makan Utama)',
        //         'quantity' => 280,
        //         'unit' => 'pax',
        //         'unit_price' => 120000,
        //         'amount' => 33600000,
        //         'notes' => 'Makan siang & malam peserta 50 orang + 20 penguji/panitia selama 4 hari kegiatan',
        //         'sort_order' => 12,
        //     ],
        //     [
        //         'type' => 'expense',
        //         'category' => 'consumption',
        //         'item_name' => 'Snack Box & Coffee Break Harian',
        //         'quantity' => 280,
        //         'unit' => 'pax',
        //         'unit_price' => 35000,
        //         'amount' => 9800000,
        //         'notes' => 'Coffee break pagi & sore untuk seluruh peserta, narasumber dan panitia',
        //         'sort_order' => 13,
        //     ],
        //     [
        //         'type' => 'expense',
        //         'category' => 'honorarium',
        //         'item_name' => 'Honorarium Tim Pemateri & Penguji Nasional',
        //         'quantity' => 6,
        //         'unit' => 'orang',
        //         'unit_price' => 300000,
        //         'amount' => 18000000,
        //         'notes' => 'Honorarium pengajaran modul kurikulum, evaluasi CBT dan pengujian praktik tatap muka',
        //         'sort_order' => 14,
        //     ],
        //     [
        //         'type' => 'expense',
        //         'category' => 'transport',
        //         'item_name' => 'Tiket Transportasi PP & Mobilitas Instruktur PB PERKEMI',
        //         'quantity' => 6,
        //         'unit' => 'orang',
        //         'unit_price' => 1800000,
        //         'amount' => 10800000,
        //         'notes' => 'Tiket pesawat / kereta Jakarta-Surabaya PP dan akomodasi penjemputan bandara',
        //         'sort_order' => 15,
        //     ],
        //     [
        //         'type' => 'expense',
        //         'category' => 'printing',
        //         'item_name' => 'Pengadaan Modul Materi, Diktat & Perlengkapan ATK',
        //         'quantity' => 60,
        //         'unit' => 'paket',
        //         'unit_price' => 85000,
        //         'amount' => 5100000,
        //         'notes' => 'Cetak jilid buku kurikulum, blocknote, map dokumen, pulpen dan tas souvenir peserta',
        //         'sort_order' => 16,
        //     ],
        //     [
        //         'type' => 'expense',
        //         'category' => 'printing',
        //         'item_name' => 'Cetak ID Card Peserta, E-Sertifikat & Transkrip Kelulusan',
        //         'quantity' => 60,
        //         'unit' => 'paket',
        //         'unit_price' => 60000,
        //         'amount' => 3600000,
        //         'notes' => 'ID card laminasi tali PERKEMI, sertifikat kelulusan cetak timbul dan transkrip nilai resmi',
        //         'sort_order' => 17,
        //     ],
        //     [
        //         'type' => 'expense',
        //         'category' => 'equipment',
        //         'item_name' => 'Medali, Plakat & Cenderamata Nara Sumber',
        //         'quantity' => 10,
        //         'unit' => 'buah',
        //         'unit_price' => 250000,
        //         'amount' => 2500000,
        //         'notes' => 'Plakat kayu akrilik kenang-kenangan untuk Dewan Guru dan pemateri',
        //         'sort_order' => 18,
        //     ],
        //     [
        //         'type' => 'expense',
        //         'category' => 'documentation',
        //         'item_name' => 'Backdrop Panggung, Spanduk & Dokumentasi Video',
        //         'quantity' => 1,
        //         'unit' => 'paket',
        //         'unit_price' => 4500000,
        //         'amount' => 4500000,
        //         'notes' => 'Backdrop panggung utama 4x8m, banner selamat datang, roll banner dan peliputan video',
        //         'sort_order' => 19,
        //     ],
        //     [
        //         'type' => 'expense',
        //         'category' => 'medical',
        //         'item_name' => 'Tim Paramedis & Obat-obatan P3K Lapangan',
        //         'quantity' => 4,
        //         'unit' => 'hari',
        //         'unit_price' => 500000,
        //         'amount' => 2000000,
        //         'notes' => 'Kesiapan tim medis siaga dan perlengkapan P3K selama sesi praktik randori & embu',
        //         'sort_order' => 20,
        //     ],
        //     [
        //         'type' => 'expense',
        //         'category' => 'contingency',
        //         'item_name' => 'Biaya Tak Terduga / Cadangan Darurat',
        //         'quantity' => 1,
        //         'unit' => 'paket',
        //         'unit_price' => 3000000,
        //         'amount' => 3000000,
        //         'notes' => 'Dana cadangan kontinjensi kebutuhan operasional mendadak lapangan',
        //         'sort_order' => 21,
        //     ],
        // ];

        // foreach ($items as $data) {
        //     $data['event_id'] = $event->id;
        //     $data['created_by'] = $adminId;
        //     EventBudget::create($data);
        // }
    }
}
