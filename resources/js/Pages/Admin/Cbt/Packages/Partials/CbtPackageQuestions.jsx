import React from 'react';
import { CheckSquare, HelpCircle, Users, Plus, X, Search, Filter, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../../../../../Components/ui/Button';
import Badge from '../../../../../Components/ui/Badge';

export default function CbtPackageQuestions({
    pkg,
    setIsAddQuestionsModalOpen,
    setSelectedPage,
    selectedPageSize,
    setSelectedPageSize,
    selectedSearch,
    setSelectedSearch,
    selectedModuleFilter,
    setSelectedModuleFilter,
    openQuotaModal,
    filteredQuestions,
    totalPages,
    currentPage,
    paginatedQuestions,
    pageNumbers,
    hasAttempts,
}) {
    return (
        <>
                {/* Left 2 Cols: Questions in this Package */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-[#DCE7F3] overflow-hidden shadow-2xs">
                        <div className="p-4 border-b border-[#DCE7F3] flex items-center justify-between">
                            <div>
                                <h2 className="font-bold text-sm text-[#0E2747] font-display flex items-center gap-2">
                                    <CheckSquare className="w-4 h-4 text-[#0B63CE]" />
                                    Daftar Butir Soal Terpilih ({pkg.bank_questions?.length || 0})
                                </h2>
                                <p className="text-xs text-[#6B7C93]">
                                    Soal yang akan diujikan kepada peserta penataran.
                                </p>
                            </div>
                            {!hasAttempts && (
                                <div className="flex items-center gap-2">
                                    {(pkg.blueprint_modules?.length > 0 || pkg.question_module) && (
                                        <Button
                                            onClick={openQuotaModal}
                                            size="sm"
                                            variant="secondary"
                                            icon={SlidersHorizontal}
                                        >
                                            Atur Kuota & Tarik Soal
                                        </Button>
                                    )}
                                    <Button
                                        onClick={() => setIsAddQuestionsModalOpen(true)}
                                        size="sm"
                                        className="bg-[#0B63CE] text-white"
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1" />
                                        Pilih Manual
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Search & Filter Bar */}
                        {pkg.bank_questions && pkg.bank_questions.length > 0 && (
                            <div className="p-3 bg-[#F8FBFF] border-b border-[#DCE7F3] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                                <div className="flex flex-1 items-center gap-2">
                                    <div className="relative flex-1 max-w-sm">
                                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={selectedSearch}
                                            onChange={(e) => {
                                                setSelectedSearch(e.target.value);
                                                setSelectedPage(1);
                                            }}
                                            placeholder="Cari kode atau teks butir soal..."
                                            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-[#DCE7F3] bg-white focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE]"
                                        />
                                        {selectedSearch && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedSearch('');
                                                    setSelectedPage(1);
                                                }}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    {pkg.blueprint_modules && pkg.blueprint_modules.length > 1 && (
                                        <select
                                            value={selectedModuleFilter}
                                            onChange={(e) => {
                                                setSelectedModuleFilter(e.target.value);
                                                setSelectedPage(1);
                                            }}
                                            className="py-1.5 px-2.5 text-xs rounded-lg border border-[#DCE7F3] bg-white font-medium text-[#0E2747]"
                                        >
                                            <option value="">Semua Modul ({pkg.bank_questions.length})</option>
                                            {pkg.blueprint_modules.map((m) => (
                                                <option key={m.id} value={m.id}>
                                                    [{m.code}] {m.title}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-auto text-[11px] text-[#6B7C93]">
                                    <span>Tampilkan:</span>
                                    <select
                                        value={selectedPageSize}
                                        onChange={(e) => {
                                            setSelectedPageSize(Number(e.target.value));
                                            setSelectedPage(1);
                                        }}
                                        className="py-1 px-2 text-xs rounded border border-[#DCE7F3] bg-white font-semibold text-[#0E2747]"
                                    >
                                        <option value={10}>10 / hal</option>
                                        <option value={25}>25 / hal</option>
                                        <option value={50}>50 / hal</option>
                                        <option value={100}>100 / hal</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Paginated Questions Table */}
                        {pkg.bank_questions && pkg.bank_questions.length > 0 ? (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="border-b border-[#DCE7F3] bg-[#F8FBFF]/80 text-[#6B7C93] font-semibold text-[11px] uppercase tracking-wider">
                                                <th className="py-2.5 px-3 text-center w-12">No</th>
                                                <th className="py-2.5 px-3 w-28">Kode Soal</th>
                                                <th className="py-2.5 px-3 w-36">Modul Blueprint</th>
                                                <th className="py-2.5 px-3">Teks Butir Soal</th>
                                                <th className="py-2.5 px-3 w-24">Tahap</th>
                                                <th className="py-2.5 px-3 w-28">Tipe / Level</th>
                                                <th className="py-2.5 px-3 text-right w-16">Poin</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#DCE7F3]">
                                            {paginatedQuestions.length > 0 ? (
                                                paginatedQuestions.map((q, idx) => {
                                                    const globalIdx = (currentPage - 1) * selectedPageSize + idx + 1;
                                                    return (
                                                        <tr key={q.id} className="hover:bg-[#F8FBFF]/70 transition-colors">
                                                            <td className="py-2.5 px-3 text-center font-mono text-xs font-bold text-slate-500">
                                                                {globalIdx}
                                                            </td>
                                                            <td className="py-2.5 px-3 font-mono font-bold text-[#0B63CE] whitespace-nowrap">
                                                                {q.code}
                                                            </td>
                                                            <td className="py-2.5 px-3 whitespace-nowrap">
                                                                {q.question_module?.code ? (
                                                                    <span
                                                                        className="px-1.5 py-0.5 rounded bg-blue-50 text-[#0B63CE] border border-blue-200 text-[10px] font-mono font-bold"
                                                                        title={q.question_module.title}
                                                                    >
                                                                        [{q.question_module.code}]
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-slate-400 text-[10px]">-</span>
                                                                )}
                                                            </td>
                                                            <td className="py-2.5 px-3 font-medium text-[#0E2747] leading-relaxed max-w-md">
                                                                <p className="line-clamp-2" title={q.question_text}>
                                                                    {q.question_text}
                                                                </p>
                                                            </td>
                                                            <td className="py-2.5 px-3 whitespace-nowrap">
                                                                {q.exam_stage ? (
                                                                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                                                        {q.exam_stage === 'pre_test'
                                                                            ? 'Pre-Test'
                                                                            : q.exam_stage === 'quiz'
                                                                            ? 'Kuis'
                                                                            : 'Post-Test'}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-slate-400 text-[10px]">-</span>
                                                                )}
                                                            </td>
                                                            <td className="py-2.5 px-3 whitespace-nowrap text-[10px] text-[#6B7C93]">
                                                                <span className="block uppercase font-mono">{q.question_type}</span>
                                                                <span className="capitalize">{q.difficulty_level}</span>
                                                            </td>
                                                            <td className="py-2.5 px-3 font-mono text-xs font-bold text-[#0E2747] text-right whitespace-nowrap">
                                                                {q.points || 1} Poin
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={7} className="py-8 text-center text-xs text-[#6B7C93]">
                                                        Tidak ada butir soal yang sesuai dengan pencarian atau filter modul.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Table Pagination Footer */}
                                <div className="p-3 border-t border-[#DCE7F3] bg-[#F8FBFF]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                    <div className="text-[#6B7C93]">
                                        Menampilkan{' '}
                                        <strong className="text-[#0E2747]">
                                            {filteredQuestions.length > 0 ? (currentPage - 1) * selectedPageSize + 1 : 0}
                                        </strong>{' '}
                                        -{' '}
                                        <strong className="text-[#0E2747]">
                                            {Math.min(currentPage * selectedPageSize, filteredQuestions.length)}
                                        </strong>{' '}
                                        dari <strong className="text-[#0E2747]">{filteredQuestions.length}</strong> butir soal
                                        {filteredQuestions.length !== (pkg.bank_questions?.length || 0) && (
                                            <span className="ml-1 text-[#6B7C93]">
                                                (difilter dari {pkg.bank_questions?.length || 0} butir)
                                            </span>
                                        )}
                                    </div>

                                    {totalPages > 1 && (
                                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                                            <Button
                                                size="xs"
                                                variant="secondary"
                                                disabled={currentPage <= 1}
                                                onClick={() => setSelectedPage((p) => Math.max(1, p - 1))}
                                                className="px-2 text-xs"
                                            >
                                                <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
                                                Sebelumnya
                                            </Button>

                                            <div className="flex items-center gap-1">
                                                {pageNumbers.map((p, idx) =>
                                                    p === '...' ? (
                                                        <span key={`ellipsis-${idx}`} className="px-1 text-slate-400">
                                                            ...
                                                        </span>
                                                    ) : (
                                                        <button
                                                            key={p}
                                                            type="button"
                                                            onClick={() => setSelectedPage(p)}
                                                            className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${
                                                                currentPage === p
                                                                    ? 'bg-[#0B63CE] text-white'
                                                                    : 'bg-white border border-[#DCE7F3] text-[#0E2747] hover:bg-slate-50'
                                                            }`}
                                                        >
                                                            {p}
                                                        </button>
                                                    )
                                                )}
                                            </div>

                                            <Button
                                                size="xs"
                                                variant="secondary"
                                                disabled={currentPage >= totalPages}
                                                onClick={() => setSelectedPage((p) => Math.min(totalPages, p + 1))}
                                                className="px-2 text-xs"
                                            >
                                                Selanjutnya
                                                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="p-12 text-center text-xs text-[#6B7C93]">
                                <HelpCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                                <p className="font-bold text-sm text-[#0E2747]">Paket CBT belum memiliki butir soal.</p>
                                <p className="mt-1">
                                    Tentukan kuota per modul atau pilih secara manual dari bank soal.
                                </p>
                                <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                                    {(pkg.blueprint_modules?.length > 0 || pkg.question_module) && (
                                        <Button
                                            onClick={openQuotaModal}
                                            size="sm"
                                            className="bg-[#0B63CE] text-white"
                                            icon={SlidersHorizontal}
                                        >
                                            Atur Kuota & Tarik Soal dari Modul Blueprint
                                        </Button>
                                    )}
                                    <Button
                                        onClick={() => setIsAddQuestionsModalOpen(true)}
                                        size="sm"
                                        variant="secondary"
                                    >
                                        Pilih Manual dari Bank Soal
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Participant Attempts Summary */}
                    <div className="bg-white rounded-xl border border-[#DCE7F3] overflow-hidden shadow-2xs">
                        <div className="p-4 border-b border-[#DCE7F3]">
                            <h2 className="font-bold text-sm text-[#0E2747] font-display flex items-center gap-2">
                                <Users className="w-4 h-4 text-[#7957D5]" />
                                Rekap Pengerjaan Peserta ({pkg.attempts?.length || 0})
                            </h2>
                        </div>
                        <div className="divide-y divide-[#DCE7F3]">
                            {pkg.attempts && pkg.attempts.length > 0 ? (
                                pkg.attempts.map((att) => (
                                    <div key={att.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                                        <div>
                                            <span className="font-bold text-[#0E2747] block">
                                                {att.participant?.name || 'Kenshi'}
                                            </span>
                                            <span className="text-[10px] text-[#6B7C93]">
                                                {att.participant?.dan_rank || 'Yudansha'} • Selesai: {att.submitted_at ? att.submitted_at.substring(0, 16) : '-'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-sm font-bold text-[#0E2747]">
                                                {att.total_score}
                                            </span>
                                            <Badge variant={att.is_passed ? 'success' : 'danger'}>
                                                {att.is_passed ? 'LULUS' : 'TIDAK LULUS'}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-6 text-center text-xs text-[#6B7C93]">
                                    Belum ada peserta yang mengerjakan paket ujian ini.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

        </>
    );
}
