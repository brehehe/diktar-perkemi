import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/admin/PageHeader';
import {
    HelpCircle,
    BookOpen,
    Shield,
    FileCheck,
    Mail,
    Phone,
    HelpCircle as QuestionIcon,
} from 'lucide-react';

export default function Index() {
    const curationSteps = [
        {
            step: '01',
            title: 'Penerimaan Naskah / Bahan Ajar',
            description: 'Pemateri atau komisi teknis menyerahkan naskah modul atau bahan tayang dalam format dokumen digital.',
        },
        {
            step: '02',
            title: 'Pendaftaran Draf Koleksi',
            description: 'Admin memasukkan metadata, ringkasan silabus, kategori disiplin, dan berkas sampul dengan status "Draf".',
        },
        {
            step: '03',
            title: 'Peninjauan oleh Tim Kurator PERKEMI',
            description: 'Status dinaikkan menjadi "Dalam Tinjauan" untuk dievaluasi kesesuaian teknik, kode etik, dan standarisasi Shorinji Kempo.',
        },
        {
            step: '04',
            title: 'Publikasi Resmi ke Portal',
            description: 'Setelah disetujui, materi diubah statusnya menjadi "Terbit" dan otomatis dapat diakses oleh kenshi sesuai peran yang diizinkan.',
        },
    ];

    const faqs = [
        {
            q: 'Bagaimana cara menambahkan kategori materi baru?',
            a: 'Buka menu Kategori di bilah navigasi kiri, lalu klik tombol "Tambah Kategori". Masukkan nama disiplin, deskripsi, dan pilih warna penanda.',
        },
        {
            q: 'Mengapa sebuah kategori tidak dapat dihapus?',
            a: 'Kategori yang masih memiliki materi terkait dilindungi oleh sistem untuk mencegah hilangnya relasi data buku. Pindahkan atau hapus materi di dalamnya terlebih dahulu.',
        },
        {
            q: 'Siapa yang berwenang mengubah matriks hak akses?',
            a: 'Hanya akun dengan peran "Admin" yang memiliki akses ke menu Hak Akses. Setiap perubahan hak akses akan otomatis tercatat di audit log sistem.',
        },
        {
            q: 'Format sampul apa saja yang didukung saat mengunggah modul?',
            a: 'Sistem mendukung format JPG, PNG, dan WebP dengan ukuran berkas maksimal 2 Megabyte (2 MB). Disarankan menggunakan rasio buku vertikal (3:4 atau 2:3).',
        },
    ];

    return (
        <AdminLayout title="Bantuan & Panduan Admin">
            <PageHeader
                title="Bantuan & Panduan Kurasi"
                description="Pedoman operasional portal, alur standarisasi modul penataran, dan kontak dukungan teknis PB PERKEMI."
                breadcrumbs={[{ label: 'Bantuan Admin' }]}
            />

            <div className="space-y-8 mb-12">
                {/* Curation Workflow */}
                <div className="bg-white rounded-xl border border-[#DCE7F3] p-6 shadow-xs">
                    <div className="flex items-center gap-2.5 mb-6">
                        <div className="p-2 rounded-lg bg-[#EAF5FF] text-[#0B63CE]">
                            <FileCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-[#0E2747]">
                                Alur Kurasi & Publikasi Materi Penataran
                            </h2>
                            <p className="text-xs text-[#6B7C93]">
                                Standar operasional prosedur pengunggahan materi ke Pustaka Penataran
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {curationSteps.map((item, idx) => (
                            <div
                                key={idx}
                                className="p-4 rounded-xl bg-[#F8FBFF] border border-[#DCE7F3] space-y-2 relative group hover:border-[#0B63CE]/40 transition-colors"
                            >
                                <span className="font-display font-bold text-2xl text-[#0B63CE]/30 group-hover:text-[#0B63CE] transition-colors">
                                    {item.step}
                                </span>
                                <h3 className="text-xs font-bold text-[#112743]">
                                    {item.title}
                                </h3>
                                <p className="text-[11px] text-[#6B7C93] leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ & Support Contact */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* FAQ (2 cols) */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-[#DCE7F3] p-6 shadow-xs">
                        <div className="flex items-center gap-2.5 mb-5">
                            <div className="p-2 rounded-lg bg-[#FEF6E9] text-[#EE9B25]">
                                <QuestionIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-[#0E2747]">
                                    Pertanyaan Sering Diajukan (FAQ)
                                </h3>
                                <p className="text-xs text-[#6B7C93]">
                                    Jawaban cepat seputar pengelolaan portal dan pengguna
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {faqs.map((faq, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 rounded-lg border border-[#DCE7F3]/80 bg-[#F8FBFF]/60"
                                >
                                    <h4 className="text-xs font-bold text-[#112743] mb-1">
                                        {faq.q}
                                    </h4>
                                    <p className="text-xs text-[#6B7C93] leading-relaxed">
                                        {faq.a}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Support Box (1 col) */}
                    <div className="bg-[#0E2747] text-white rounded-xl p-6 shadow-md flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="w-10 h-10 rounded-lg bg-[#0B63CE] flex items-center justify-center font-bold text-white shadow-md">
                                PP
                            </div>
                            <div>
                                <h3 className="text-base font-display font-bold">
                                    Dukungan IT & Sekretariat
                                </h3>
                                <p className="text-xs text-[#EAF5FF]/80 mt-1 leading-relaxed">
                                    Memerlukan bantuan teknis sinkronisasi database kenshi atau hak akses khusus? Hubungi tim IT PB PERKEMI.
                                </p>
                            </div>

                            <div className="space-y-3 pt-2 text-xs">
                                <div className="flex items-center gap-2.5 text-white/80">
                                    <Mail className="w-4 h-4 text-[#0B63CE]" />
                                    <span>sekretariat@perkemi.id</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-white/80">
                                    <Phone className="w-4 h-4 text-[#0B63CE]" />
                                    <span>+62 21 5703888</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10 mt-6 text-[11px] text-white/60">
                            Waktu Operasional: Senin &ndash; Jumat, 09.00 &ndash; 17.00 WIB
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
