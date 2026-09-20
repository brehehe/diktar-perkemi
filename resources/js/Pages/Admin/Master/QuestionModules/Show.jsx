import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../../Layouts/AdminLayout';
import PageHeader from '../../../../Components/admin/PageHeader';
import Button from '../../../../Components/ui/Button';
import Badge from '../../../../Components/ui/Badge';
import Tabs from '../../../../Components/admin/Tabs';
import TableSurface from '../../../../Components/admin/TableSurface';
import {
    FileText,
    ArrowLeft,
    BookOpen,
    HelpCircle,
    CheckSquare,
    History,
    Edit3,
    Award,
    CheckCircle2,
    Calendar,
    Users,
    ChevronRight,
    ExternalLink,
    Plus,
    Clock,
    AlertCircle,
    Shield,
    FileSpreadsheet,
} from 'lucide-react';

export default function Show({
    module,
    auditLogs = [],
    tracks = [],
    learningModules = [],
}) {
    // 5 Exact Tabs
    const [activeTab, setActiveTab] = useState('ringkasan');

    const tabs = [
        { id: 'ringkasan', label: '1. Ringkasan', count: null },
        { id: 'indikator', label: '2. Indikator Kompetensi', count: (module.assessment_indicators || []).length },
        { id: 'bank_soal', label: '3. Bank Soal', count: (module.questions || []).length },
        { id: 'paket_cbt', label: '4. Paket CBT yang Menggunakan', count: (module.cbt_packages || []).length },
        { id: 'riwayat', label: '5. Riwayat Perubahan', count: auditLogs.length },
    ];

    return (
        <AdminLayout title={`Modul Soal: ${module.title}`}>
            <Head title={`Modul Soal: ${module.title} — Admin PERKEMI`} />

            <PageHeader
                title={module.title}
                description={`Modul ${module.code} • ${module.status_label || module.status}`}
                breadcrumbs={[
                    { label: 'Event', href: '/admin/event' },
                    { label: 'Modul Soal', href: '/admin/master/modul-soal' },
                    { label: module.title },
                ]}
                action={
                    <Button as={Link} href={`/admin/master/bank-soal?module_id=${module.id}`} size="sm" icon={Plus}>Tambah Butir Soal</Button>
                }
            />

            <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onChange={setActiveTab}
                ariaLabel="Bagian modul soal"
                className="mb-6"
            />

            {/* TAB 1: Ringkasan */}
            {activeTab === 'ringkasan' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-4">
                            <div className="p-5 rounded-xl bg-white border border-[#DCE7F3] shadow-2xs space-y-4">
                                <h2 className="font-bold text-sm text-[#0E2747] font-display flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-[#7957D5]" />
                                    Deskripsi & Ruang Lingkup Evaluasi
                                </h2>
                                <p className="text-xs text-[#112743] leading-relaxed bg-[#F8FBFF] p-4 rounded-lg border border-[#DCE7F3]">
                                    {module.description || 'Tidak ada deskripsi yang disediakan.'}
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <span className="text-[10px] font-mono uppercase text-[#6B7C93] block">
                                            Tujuan Evaluasi
                                        </span>
                                        <p className="text-xs text-[#0E2747] mt-1 font-medium">
                                            {module.evaluation_purpose || 'Mengukur pemahaman standar kompetensi kenshi PERKEMI.'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-mono uppercase text-[#6B7C93] block">
                                            Bobot Default Soal
                                        </span>
                                        <p className="text-xs text-[#0E2747] mt-1 font-bold">
                                            {module.default_weight} Poin / Butir
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Linked Learning Module */}
                            <div className="p-5 rounded-xl bg-white border border-[#DCE7F3] shadow-2xs">
                                <h2 className="font-bold text-sm text-[#0E2747] font-display flex items-center gap-2 mb-3">
                                    <BookOpen className="w-4 h-4 text-[#0B63CE]" />
                                    Modul Pembelajaran Terkait (Kurikulum)
                                </h2>
                                {module.learning_module ? (
                                    <div className="p-4 rounded-lg bg-[#EAF5FF] border border-[#0B63CE]/20 flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] font-mono font-bold text-[#0B63CE] uppercase">
                                                {module.learning_module.code} • {module.learning_module.total_jp} JP
                                            </span>
                                            <h3 className="font-bold text-xs text-[#0E2747] mt-0.5">
                                                {module.learning_module.title}
                                            </h3>
                                            <span className="text-[11px] text-[#6B7C93]">
                                                Kategori: {module.learning_module.category}
                                            </span>
                                        </div>
                                        <Link
                                            href="/admin/master/modul-pembelajaran"
                                            className="px-3 py-1.5 rounded-lg bg-white text-[#0B63CE] text-xs font-semibold border border-[#0B63CE]/30 hover:bg-[#0B63CE] hover:text-white transition-colors shadow-2xs"
                                        >
                                            Buka Modul
                                        </Link>
                                    </div>
                                ) : (
                                    <p className="text-xs text-[#6B7C93] italic bg-slate-50 p-3 rounded-lg border border-[#DCE7F3]">
                                        Modul Soal ini belum ditautkan ke Modul Pembelajaran spesifik.
                                    </p>
                                )}
                            </div>

                            {/* Guidelines from Excel PETUNJUK if available */}
                            {module.metadata?.petunjuk?.items && (
                                <div className="p-5 rounded-xl bg-white border border-[#DCE7F3] shadow-2xs space-y-3">
                                    <h2 className="font-bold text-sm text-[#0E2747] font-display flex items-center gap-2">
                                        <FileSpreadsheet className="w-4 h-4 text-[#0B63CE]" />
                                        {module.metadata.petunjuk.title || 'Pedoman Asesmen (Sheet PETUNJUK)'}
                                    </h2>
                                    <div className="rounded-lg border border-[#DCE7F3] divide-y divide-[#DCE7F3] text-xs overflow-hidden">
                                        {Object.entries(module.metadata.petunjuk.items).map(([key, value]) => (
                                            <div key={key} className="p-3 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 bg-[#F8FBFF]/40 hover:bg-[#F8FBFF]">
                                                <span className="font-semibold text-[#0E2747] sm:w-48 shrink-0">{key}</span>
                                                <span className="text-[#6B7C93] leading-relaxed">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar info */}
                        <div className="space-y-4">
                            <div className="p-5 rounded-xl bg-white border border-[#DCE7F3] shadow-2xs space-y-4">
                                <h2 className="font-bold text-sm text-[#0E2747] font-display">
                                    Standar Kelulusan (KKM)
                                </h2>
                                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                                    <span className="text-3xl font-bold font-display text-emerald-700">
                                        {module.passing_grade}
                                    </span>
                                    <span className="block text-[11px] text-emerald-600 mt-1">
                                        Nilai minimum untuk status LULUS
                                    </span>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-[#DCE7F3]">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-[#6B7C93]">Kategori:</span>
                                        <span className="font-semibold text-[#0E2747]">{module.category}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-[#6B7C93]">Dibuat Oleh:</span>
                                        <span className="font-semibold text-[#0E2747]">{module.creator?.name || 'Administrator'}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-[#6B7C93]">Terakhir Diperbarui:</span>
                                        <span className="font-semibold text-[#0E2747]">{module.updated_at ? module.updated_at.substring(0, 10) : '-'}</span>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-[#DCE7F3]">
                                    <span className="text-[10px] uppercase font-mono text-[#6B7C93] block mb-1.5">
                                        Jalur Peserta yang Berhak
                                    </span>
                                    <div className="flex flex-wrap gap-1">
                                        {(module.track_codes || []).map((tc) => (
                                            <span key={tc} className="px-2 py-0.5 rounded bg-purple-50 text-[#7957D5] border border-purple-200 text-xs font-semibold">
                                                {tc}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: Indikator Kompetensi */}
            {activeTab === 'indikator' && (
                <div className="bg-white p-5 rounded-xl border border-[#DCE7F3] shadow-2xs space-y-6">
                    <div>
                        <h2 className="font-bold text-sm text-[#0E2747] font-display mb-1">
                            Kompetensi yang Diuji & Indikator Penilaian
                        </h2>
                        <p className="text-xs text-[#6B7C93]">
                            Daftar capaian standar yang diukur melalui butir-butir pertanyaan pada Modul Soal ini.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-[#F8FBFF] border border-[#DCE7F3]">
                            <h3 className="font-bold text-xs text-[#0E2747] uppercase font-mono mb-3 flex items-center gap-1.5">
                                <Award className="w-4 h-4 text-[#7957D5]" />
                                Kompetensi yang Diuji
                            </h3>
                            {module.tested_competencies && module.tested_competencies.length > 0 ? (
                                <ul className="space-y-2 text-xs">
                                    {module.tested_competencies.map((comp, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-[#112743]">
                                            <CheckCircle2 className="w-4 h-4 text-[#7957D5] shrink-0 mt-0.5" />
                                            <span>{comp}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs text-[#6B7C93] italic">Belum ada rincian kompetensi.</p>
                            )}
                        </div>

                        <div className="p-4 rounded-xl bg-[#F8FBFF] border border-[#DCE7F3]">
                            <h3 className="font-bold text-xs text-[#0E2747] uppercase font-mono mb-3 flex items-center gap-1.5">
                                <CheckSquare className="w-4 h-4 text-emerald-600" />
                                Indikator Penilaian
                            </h3>
                            {module.assessment_indicators && module.assessment_indicators.length > 0 ? (
                                <ul className="space-y-2 text-xs">
                                    {module.assessment_indicators.map((ind, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-[#112743]">
                                            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                                {idx + 1}
                                            </div>
                                            <span>{ind}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs text-[#6B7C93] italic">Belum ada rincian indikator penilaian.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: Bank Soal */}
            {activeTab === 'bank_soal' && (
                <div className="bg-white rounded-xl border border-[#DCE7F3] overflow-hidden shadow-2xs">
                    <div className="p-4 border-b border-[#DCE7F3] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-bold text-sm text-[#0E2747] font-display">
                                Butir Soal Terdaftar ({module.questions?.length || 0})
                            </h2>
                            <p className="text-xs text-[#6B7C93]">
                                Soal yang siap dikomposisikan ke dalam Paket CBT. Kunci jawaban tidak ditampilkan di tabel ini.
                            </p>
                            <p className="mt-1 text-xs text-[#6B7C93]">
                                Satu soal dapat digunakan di beberapa modul. Hubungkan soal yang sudah ada melalui pilihan modul di Bank Soal.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Link href="/admin/master/bank-soal" className="inline-flex min-h-11 items-center rounded-lg border border-[#DCE7F3] px-3 text-xs font-semibold text-[#0A3F82] hover:bg-[#EAF5FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]">
                                Hubungkan Soal yang Ada
                            </Link>
                            <Link
                                href={`/admin/master/bank-soal?module_id=${module.id}`}
                                className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-[#0B63CE] px-3 text-xs font-semibold text-white hover:bg-[#0A3F82] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Tambah Soal
                            </Link>
                        </div>
                    </div>

                    <TableSurface className="shadow-none">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#F8FBFF] text-[#6B7C93] font-mono text-[10px] uppercase border-b border-[#DCE7F3]">
                                <tr>
                                    <th className="px-4 py-3">Kode</th>
                                    <th className="px-4 py-3">Stage Ujian</th>
                                    <th className="px-4 py-3">Pertanyaan</th>
                                    <th className="px-4 py-3">Tipe & Level</th>
                                    <th className="px-4 py-3">Tingkat Kesulitan</th>
                                    <th className="px-4 py-3 text-center">Poin</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#DCE7F3]">
                                {module.questions && module.questions.length > 0 ? (
                                    module.questions.map((q) => (
                                        <tr key={q.id} className="hover:bg-slate-50/60">
                                            <td className="px-4 py-3 font-mono font-bold text-[#0B63CE]">
                                                {q.code}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {q.exam_stage === 'pre_test' && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                                                        Pre-Test
                                                    </span>
                                                )}
                                                {q.exam_stage === 'quiz' && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                        Kuis
                                                    </span>
                                                )}
                                                {q.exam_stage === 'post_test' && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                                        Post-Test
                                                    </span>
                                                )}
                                                {!q.exam_stage && (
                                                    <span className="text-[#6B7C93] text-xs">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-[#0E2747] line-clamp-2 max-w-md">
                                                    {q.question_text}
                                                </p>
                                                {q.metadata?.materi_soal && (
                                                    <p className="text-[11px] text-[#6B7C93] mt-0.5">
                                                        Materi: {q.metadata.materi_soal}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-1">
                                                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono w-fit">
                                                        {q.question_type}
                                                    </span>
                                                    {q.metadata?.kategori_soal && (
                                                        <span className="text-[10px] font-semibold text-[#0B63CE]">
                                                            {q.metadata.kategori_soal}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="capitalize text-xs font-semibold text-[#6B7C93]">
                                                    {q.difficulty_level}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center font-mono font-bold text-[#0E2747]">
                                                {q.points}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant={q.status === 'active' ? 'success' : 'secondary'}>
                                                    {q.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-[#6B7C93]">
                                            Belum ada butir pertanyaan dalam modul soal ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </TableSurface>
                </div>
            )}

            {/* TAB 4: Paket CBT yang Menggunakan Modul */}
            {activeTab === 'paket_cbt' && (
                <div className="bg-white rounded-xl border border-[#DCE7F3] overflow-hidden shadow-2xs">
                    <div className="p-4 border-b border-[#DCE7F3]">
                        <h2 className="font-bold text-sm text-[#0E2747] font-display">
                            Paket Ujian CBT Terkait ({module.cbt_packages?.length || 0})
                        </h2>
                        <p className="text-xs text-[#6B7C93]">
                            Paket ujian yang mengadopsi butir-butir evaluasi dari modul soal ini.
                        </p>
                    </div>

                    <div className="divide-y divide-[#DCE7F3]">
                        {module.cbt_packages && module.cbt_packages.length > 0 ? (
                            module.cbt_packages.map((pkg) => (
                                <div key={pkg.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-bold text-[#0B63CE]">
                                                {pkg.code}
                                            </span>
                                            <Badge variant={pkg.status === 'open' ? 'success' : 'secondary'}>
                                                {pkg.status}
                                            </Badge>
                                        </div>
                                        <h3 className="font-bold text-xs text-[#0E2747] mt-1">{pkg.title}</h3>
                                        <span className="text-[11px] text-[#6B7C93]">
                                            Durasi: {pkg.duration_minutes} Menit • KKM: {pkg.passing_score}
                                        </span>
                                    </div>
                                    <Link
                                        href={`/admin/cbt/paket-ujian/${pkg.id}`}
                                        className="px-3 py-1.5 rounded-lg bg-[#EAF5FF] text-[#0B63CE] text-xs font-semibold hover:bg-[#0B63CE] hover:text-white transition-colors"
                                    >
                                        Detail Paket
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-xs text-[#6B7C93]">
                                Belum ada Paket CBT yang menggunakan Modul Soal ini.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 5: Riwayat Perubahan */}
            {activeTab === 'riwayat' && (
                <div className="bg-white rounded-xl border border-[#DCE7F3] p-5 shadow-2xs space-y-4">
                    <h2 className="font-bold text-sm text-[#0E2747] font-display flex items-center gap-2">
                        <History className="w-4 h-4 text-[#7957D5]" />
                        Audit Log & Riwayat Perubahan Modul Soal
                    </h2>

                    <div className="divide-y divide-[#DCE7F3]">
                        {auditLogs.length > 0 ? (
                            auditLogs.map((log) => (
                                <div key={log.id} className="py-3 flex items-start justify-between text-xs">
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-[#7957D5] mt-1.5" />
                                        <div>
                                            <p className="font-semibold text-[#0E2747]">{log.description}</p>
                                            <span className="text-[11px] text-[#6B7C93]">
                                                Oleh: {log.actor?.name || 'Sistem'}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-[11px] text-[#6B7C93] font-mono">
                                        {log.created_at ? log.created_at.substring(0, 16) : '-'}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="py-6 text-center text-xs text-[#6B7C93] italic">
                                Belum ada log aktivitas perubahan untuk modul soal ini.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
