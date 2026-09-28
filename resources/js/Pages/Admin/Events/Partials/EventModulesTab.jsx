import Button from '../../../../Components/ui/Button';
import TableSurface from '../../../../Components/admin/TableSurface';
import { BookOpen, Layers, Award, Plus, Trash2, Lock } from 'lucide-react';
import { useEventShow } from './EventShowContext';

export default function EventModulesTab() {
    const {
        event,
        learningModules,
        linkedCbtPackages,
        availableMasterModules,
        availableMasterCbtPackages,
        setIsAttachModuleModalOpen,
        setIsAttachCbtModalOpen,
        attachModuleForm,
        attachCbtForm,
        handleDetachModule,
        handleDetachCbt,
    } = useEventShow();

    return (
        <div className="space-y-6">
            {/* Header & Overview Card */}
            <div className="bg-white rounded-xl border border-[#DCE7F3] p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-[#EAF5FF] text-[#0B63CE]">
                                <Layers className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-display font-bold text-base text-[#0E2747]">
                                    Hubungan Master Modul Pembelajaran & Paket CBT
                                </h3>
                                <p className="text-xs text-[#6B7C93]">
                                    Menghubungkan kurikulum terpusat dan paket evaluasi standar ke event ini tanpa menduplikasi data Koleksi Digital.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            variant="primary"
                            icon={<Plus className="w-4 h-4" />}
                            onClick={() => {
                                attachModuleForm.reset();
                                attachModuleForm.setData({
                                    learning_module_id: availableMasterModules[0]?.id || '',
                                    participant_path_id: 'all',
                                    is_required: true,
                                    sort_order: (learningModules?.length || 0) + 1,
                                    availability_start_at: '',
                                    availability_end_at: '',
                                });
                                setIsAttachModuleModalOpen(true);
                            }}
                        >
                            Hubungkan Modul
                        </Button>
                        <Button
                            variant="secondary"
                            icon={<Award className="w-4 h-4 text-purple-600" />}
                            onClick={() => {
                                attachCbtForm.reset();
                                attachCbtForm.setData({
                                    cbt_exam_package_id: availableMasterCbtPackages[0]?.id || '',
                                    participant_path_id: 'all',
                                    is_required: true,
                                    sort_order: (linkedCbtPackages?.length || 0) + 1,
                                    requires_attendance_session_id: '',
                                    availability_start_at: '',
                                    availability_end_at: '',
                                });
                                setIsAttachCbtModalOpen(true);
                            }}
                        >
                            Hubungkan Paket CBT
                        </Button>
                    </div>
                </div>

                {/* Summary Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-[#DCE7F3]">
                    <div className="p-3 rounded-lg bg-[#F8FBFF] border border-[#DCE7F3]">
                        <span className="text-[10px] text-[#6B7C93] uppercase font-bold tracking-wider block">Modul Pembelajaran</span>
                        <span className="text-lg font-display font-bold text-[#0B63CE]">{learningModules.length} Modul</span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#F8FBFF] border border-[#DCE7F3]">
                        <span className="text-[10px] text-[#6B7C93] uppercase font-bold tracking-wider block">Total Bobot JP Modul</span>
                        <span className="text-lg font-display font-bold text-[#20A47A]">
                            {learningModules.reduce((acc, m) => acc + (m.total_jp || 0), 0)} JP
                        </span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#F8FBFF] border border-[#DCE7F3]">
                        <span className="text-[10px] text-[#6B7C93] uppercase font-bold tracking-wider block">Paket CBT Terhubung</span>
                        <span className="text-lg font-display font-bold text-purple-700">{linkedCbtPackages.length} Paket</span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#F8FBFF] border border-[#DCE7F3]">
                        <span className="text-[10px] text-[#6B7C93] uppercase font-bold tracking-wider block">Koleksi Terkait</span>
                        <span className="text-lg font-display font-bold text-[#EE9B25]">
                            {learningModules.reduce((acc, m) => acc + (m.materials_count || m.materials?.length || 0), 0)} Materi
                        </span>
                    </div>
                </div>
            </div>

            {/* SECTION 1: Master Modul Pembelajaran */}
            <div className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-[#DCE7F3] bg-[#F8FBFF] flex items-center justify-between">
                    <div>
                        <h4 className="font-display font-bold text-sm text-[#0E2747]">
                            Modul Pembelajaran Terhubung ke Event
                        </h4>
                        <p className="text-[11px] text-[#6B7C93]">
                            Kurikulum kompetensi dan koleksi digital yang dapat diakses peserta sesuai jalurnya.
                        </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#0B63CE] bg-[#EAF5FF] px-2 py-0.5 rounded">
                        {learningModules.length} Terpasang
                    </span>
                </div>

                {learningModules.length === 0 ? (
                    <div className="p-10 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-[#EAF5FF] text-[#0B63CE] flex items-center justify-center mx-auto">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div className="max-w-md mx-auto">
                            <h5 className="font-bold text-sm text-[#0E2747]">Belum Ada Modul Pembelajaran Terhubung</h5>
                            <p className="text-xs text-[#6B7C93] mt-1">
                                Pilih kurikulum dari Master Modul Pembelajaran untuk memberikan materi terstruktur kepada peserta.
                            </p>
                        </div>
                        <Button
                            variant="primary"
                            size="sm"
                            icon={<Plus className="w-4 h-4" />}
                            onClick={() => setIsAttachModuleModalOpen(true)}
                        >
                            Hubungkan Modul Pertama
                        </Button>
                    </div>
                ) : (
                    <TableSurface className="shadow-none">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-[#DCE7F3] bg-[#F8FBFF] text-[#6B7C93] font-bold">
                                    <th className="py-3 px-4 w-12 text-center">Urutan</th>
                                    <th className="py-3 px-4">Modul Pembelajaran</th>
                                    <th className="py-3 px-4">Target Jalur</th>
                                    <th className="py-3 px-4">Sifat</th>
                                    <th className="py-3 px-4">Durasi</th>
                                    <th className="py-3 px-4">Materi Terhubung</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#DCE7F3]">
                                {learningModules.map((lm) => (
                                    <tr key={lm.id} className="hover:bg-[#F8FBFF]/60 transition-colors">
                                        <td className="py-3 px-4 text-center font-mono font-bold text-[#6B7C93]">
                                            #{lm.sort_order || 1}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-mono text-[10px] font-bold text-[#0B63CE] bg-[#EAF5FF] px-1.5 py-0.5 rounded">
                                                        {lm.code}
                                                    </span>
                                                    <span className="font-bold text-xs text-[#0E2747]">
                                                        {lm.title}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-[#6B7C93] line-clamp-1">
                                                    {lm.category} • Tingkat {lm.level}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                                {lm.participant_path_id === 'all' || !lm.participant_path_id
                                                    ? 'Semua Jalur'
                                                    : lm.participant_path_id}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                                    lm.is_required
                                                        ? 'bg-rose-100 text-rose-800'
                                                        : 'bg-slate-100 text-slate-700'
                                                }`}
                                            >
                                                {lm.is_required ? 'Wajib' : 'Pilihan'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 font-mono font-semibold text-[#0E2747]">
                                            {lm.total_jp} JP
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="space-y-1">
                                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0B63CE]">
                                                    <BookOpen className="w-3.5 h-3.5" />
                                                    {lm.materials?.length || lm.materials_count || 0} Koleksi Terhubung
                                                </span>
                                                {lm.materials && lm.materials.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {lm.materials.slice(0, 3).map((mat) => (
                                                            <span
                                                                key={mat.id}
                                                                className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 truncate max-w-[140px]"
                                                                title={mat.title}
                                                            >
                                                                {mat.title}
                                                            </span>
                                                        ))}
                                                        {lm.materials.length > 3 && (
                                                            <span className="text-[9px] text-[#6B7C93]">
                                                                +{lm.materials.length - 3} lagi
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => handleDetachModule(lm)}
                                                className="p-1.5 text-[#6B7C93] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                title="Lepaskan dari Event"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </TableSurface>
                )}
            </div>

            {/* SECTION 2: Master Paket CBT */}
            <div className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-[#DCE7F3] bg-[#F8FBFF] flex items-center justify-between">
                    <div>
                        <h4 className="font-display font-bold text-sm text-[#0E2747]">
                            Paket Ujian CBT Terhubung ke Event
                        </h4>
                        <p className="text-[11px] text-[#6B7C93]">
                            Paket ujian standar berbasis Bank Soal yang dialokasikan untuk peserta event ini.
                        </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {linkedCbtPackages.length} Terpasang
                    </span>
                </div>

                {linkedCbtPackages.length === 0 ? (
                    <div className="p-10 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-100">
                            <Award className="w-6 h-6" />
                        </div>
                        <div className="max-w-md mx-auto">
                            <h5 className="font-bold text-sm text-[#0E2747]">Belum Ada Paket CBT Terhubung</h5>
                            <p className="text-xs text-[#6B7C93] mt-1">
                                Hubungkan paket ujian CBT yang berstatus "Siap Digunakan" atau "Dibuka" untuk sesi evaluasi peserta.
                            </p>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            icon={<Plus className="w-4 h-4" />}
                            onClick={() => setIsAttachCbtModalOpen(true)}
                        >
                            Hubungkan Paket CBT
                        </Button>
                    </div>
                ) : (
                    <TableSurface className="shadow-none">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-[#DCE7F3] bg-[#F8FBFF] text-[#6B7C93] font-bold">
                                    <th className="py-3 px-4 w-12 text-center">Urutan</th>
                                    <th className="py-3 px-4">Paket Ujian CBT</th>
                                    <th className="py-3 px-4">Target Jalur</th>
                                    <th className="py-3 px-4">Sifat</th>
                                    <th className="py-3 px-4">Syarat Absensi Sesi</th>
                                    <th className="py-3 px-4">Aturan Ujian</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#DCE7F3]">
                                {linkedCbtPackages.map((pkg) => (
                                    <tr key={pkg.id} className="hover:bg-[#F8FBFF]/60 transition-colors">
                                        <td className="py-3 px-4 text-center font-mono font-bold text-[#6B7C93]">
                                            #{pkg.sort_order || 1}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-mono text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                                                        {pkg.code}
                                                    </span>
                                                    <span className="font-bold text-xs text-[#0E2747]">
                                                        {pkg.title}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-[#6B7C93]">
                                                    {pkg.exam_type_label || pkg.exam_type}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                                {pkg.participant_path_id === 'all' || !pkg.participant_path_id
                                                    ? 'Semua Jalur'
                                                    : pkg.participant_path_id}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                                    pkg.is_required
                                                        ? 'bg-rose-100 text-rose-800'
                                                        : 'bg-slate-100 text-slate-700'
                                                }`}
                                            >
                                                {pkg.is_required ? 'Wajib' : 'Pilihan'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            {pkg.requires_attendance_session_id ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                                    <Lock className="w-3 h-3 text-amber-600" />
                                                    Wajib Absen Sesi #{pkg.requires_attendance_session_id}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-[#6B7C93]">
                                                    Tidak Ada Syarat
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-[11px] text-[#0E2747]">
                                            {pkg.duration_minutes} Menit • KKM {pkg.passing_score}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                {pkg.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => handleDetachCbt(pkg)}
                                                className="p-1.5 text-[#6B7C93] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                title="Lepaskan dari Event"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </TableSurface>
                )}
            </div>
        </div>
    );
}
