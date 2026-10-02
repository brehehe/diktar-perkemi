import Button from '../../../../Components/ui/Button';
import { Plus, Trash2, List } from 'lucide-react';
import { useEventShow } from './EventShowContext';
import { useIsProdas } from '../../../../Utils/isProdas';

export default function EventCbtTab() {
    const isProdas = useIsProdas();
    const {
        cbtPackages,
        setIsCbtPackageModalOpen,
        setEditingCbtPackage,
        setIsAddQuestionModalOpen,
        setActiveCbtPackageForQuestion,
        cbtPackageForm,
        questionForm,
        handleDeleteCbtPackage,
    } = useEventShow();

    return (
        <div className="space-y-6">
            {/* Top CBT Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-white border border-[#DCE7F3] shadow-xs">
                    <span className="text-[11px] text-[#6B7C93] uppercase font-mono">Paket CBT Aktif</span>
                    <div className="text-xl font-bold text-purple-700 mt-1">{cbtPackages.length}</div>
                    <span className="text-[10px] text-[#6B7C93]">Tersedia untuk peserta</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#DCE7F3] shadow-xs">
                    <span className="text-[11px] text-[#6B7C93] uppercase font-mono">Pengerjaan Ujian</span>
                    <div className="text-xl font-bold text-[#0E2747] mt-1">
                        {cbtPackages.reduce((acc, p) => acc + p.attempts_count, 0)} Kali
                    </div>
                    <span className="text-[10px] text-[#6B7C93]">Total submit peserta</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#DCE7F3] shadow-xs">
                    <span className="text-[11px] text-[#6B7C93] uppercase font-mono">Kelulusan CBT</span>
                    <div className="text-xl font-bold text-emerald-600 mt-1">
                        {cbtPackages.reduce((acc, p) => acc + p.passed_count, 0)} Kenshi
                    </div>
                    <span className="text-[10px] text-emerald-700">&gt; Passing Score</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#DCE7F3] shadow-xs">
                    <span className="text-[11px] text-[#6B7C93] uppercase font-mono">Standar Penilaian</span>
                    <div className="text-xl font-bold text-[#0B63CE] mt-1">Otomatis</div>
                    <span className="text-[10px] text-[#6B7C93]">Skor langsung dikalkulasi</span>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#DCE7F3]">
                <div>
                    <h3 className="font-display font-bold text-sm text-[#0E2747]">
                        {isProdas ? 'Master Paket Ujian CBT' : 'Master Paket Ujian CBT Penataran'}
                    </h3>
                    <p className="text-xs text-[#6B7C93]">
                        Kelola paket soal ujian, batas durasi, passing grade, dan pantau rekap pengerjaan peserta.
                    </p>
                </div>
                <Button
                    variant="primary"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => {
                        setEditingCbtPackage(null);
                        cbtPackageForm.reset();
                        setIsCbtPackageModalOpen(true);
                    }}
                >
                    Buat Paket Ujian CBT
                </Button>
            </div>

            {/* CBT Packages List */}
            <div className="space-y-4">
                {cbtPackages.length === 0 ? (
                    <div className="p-10 text-center bg-white rounded-2xl border border-[#DCE7F3] text-xs text-[#6B7C93]">
                        Belum ada paket ujian CBT. Klik tombol di atas untuk membuat paket ujian baru.
                    </div>
                ) : (
                    cbtPackages.map((pkg) => (
                        <div
                            key={pkg.id}
                            className="bg-white rounded-2xl border border-[#DCE7F3] p-6 shadow-xs space-y-4"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                            {pkg.code}
                                        </span>
                                        <span className="text-xs font-semibold text-[#6B7C93]">
                                            {pkg.exam_type_label}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${pkg.status_badge}`}>
                                            {pkg.status_label}
                                        </span>
                                    </div>
                                    <h4 className="font-display font-bold text-base text-[#0E2747]">
                                        {pkg.title}
                                    </h4>
                                    {pkg.question_module_title && <p className="text-xs text-[#0A3F82]">Modul soal: {pkg.question_module_title}</p>}
                                    {pkg.description && (
                                        <p className="text-xs text-[#6B7C93]">
                                            {pkg.description}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2 shrink-0">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        icon={<Plus className="w-3.5 h-3.5" />}
                                        onClick={() => {
                                            setActiveCbtPackageForQuestion(pkg);
                                            questionForm.reset();
                                            setIsAddQuestionModalOpen(true);
                                        }}
                                    >
                                        Tambah Soal
                                    </Button>

                                    <button
                                        type="button"
                                        onClick={() => handleDeleteCbtPackage(pkg)}
                                        className="p-1.5 text-[#6B7C93] hover:text-rose-600 rounded-lg border border-[#DCE7F3]"
                                        title="Hapus Paket"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Package Config & Metrics Summary */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#DCE7F3] text-xs">
                                <div>
                                    <span className="text-[#6B7C93] block text-[11px]">Durasi Waktu</span>
                                    <span className="font-bold text-[#0E2747]">{pkg.duration_minutes} Menit</span>
                                </div>
                                <div>
                                    <span className="text-[#6B7C93] block text-[11px]">Passing Grade</span>
                                    <span className="font-bold text-[#0B63CE]">{pkg.passing_score}</span>
                                </div>
                                <div>
                                    <span className="text-[#6B7C93] block text-[11px]">Bank Soal</span>
                                    <span className="font-bold text-[#0E2747]">{pkg.questions_count} Pertanyaan</span>
                                </div>
                                <div>
                                    <span className="text-[#6B7C93] block text-[11px]">Rata-rata Nilai</span>
                                    <span className="font-bold text-purple-700">{pkg.avg_score ?? '-'}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
