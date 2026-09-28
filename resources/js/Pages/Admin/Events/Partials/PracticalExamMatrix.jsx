import Button from '../../../../Components/ui/Button';
import { Save, Check } from 'lucide-react';
import { usePracticalExam } from './PracticalExamContext';

export default function PracticalExamMatrix() {
    const {
        activeCategory,
        savingRowId,
        matrixState,
        activeParticipants,
        activeCriteria,
        calculateParticipantScore,
        filteredParticipants,
        handleScoreChange,
        handleNoteChange,
        handleSaveRow,
    } = usePracticalExam();

    return (
        <>
            {/* Assessment Grid Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto max-h-[720px] scrollbar-thin">
                    <table className="w-full text-left border-collapse text-xs">
                        {/* Sticky Clean Light Table Header */}
                        <thead className="sticky top-0 z-30 bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur border-b border-slate-200 dark:border-slate-700 shadow-sm">
                            <tr className="text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700 divide-x divide-slate-200 dark:divide-slate-700 text-xs">
                                <th className="p-2.5 text-center w-10 sticky left-0 z-40 bg-slate-50 dark:bg-slate-800">
                                    No
                                </th>
                                <th className="p-2.5 min-w-[110px] text-left">
                                    NIK / ID
                                </th>
                                <th className="p-2.5 min-w-[180px] text-left">
                                    Nama Peserta
                                </th>
                                <th className="p-2.5 text-center w-16">
                                    Tingkat
                                </th>
                                <th className="p-2.5 text-center w-10">
                                    L/P
                                </th>

                                {/* Dynamic Criteria Columns */}
                                {activeCriteria.map((crit) => (
                                    <th
                                        key={crit.code}
                                        className="p-2 text-center min-w-[70px] cursor-help bg-white/70 dark:bg-slate-800/60 hover:bg-blue-50/60 dark:hover:bg-blue-950/40 transition-colors"
                                        title={`${crit.code} (${crit.weight}%): ${crit.label}`}
                                    >
                                        <div className="text-[11px] font-extrabold text-blue-700 dark:text-blue-400">
                                            {crit.code}
                                        </div>
                                        <div className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">
                                            {crit.weight}%
                                        </div>
                                    </th>
                                ))}

                                <th className="p-2.5 text-center min-w-[85px] bg-blue-50/60 dark:bg-blue-950/30 text-blue-900 dark:text-blue-300">
                                    Nilai Akhir
                                </th>
                                <th className="p-2.5 text-center min-w-[95px]">
                                    Predikat
                                </th>
                                <th className="p-2.5 text-center min-w-[95px]">
                                    Status
                                </th>
                                <th className="p-2.5 min-w-[140px] text-left">
                                    Catatan
                                </th>
                                <th className="p-2.5 text-center w-16 sticky right-0 z-40 bg-slate-50 dark:bg-slate-800">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredParticipants.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={10 + activeCriteria.length}
                                        className="p-8 text-center text-slate-400 text-sm"
                                    >
                                        Tidak ada peserta yang sesuai kriteria pencarian/filter.
                                    </td>
                                </tr>
                            ) : (
                                filteredParticipants.map((p, index) => {
                                    const epId = p.event_participant_id;
                                    const rowData = matrixState[activeCategory]?.[epId] || {
                                        scores: {},
                                        notes: '',
                                        isDirty: false,
                                    };
                                    const calc = calculateParticipantScore(epId);
                                    const isRowSaving = savingRowId === epId;

                                    return (
                                        <tr
                                            key={epId}
                                            className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                                                rowData.isDirty ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''
                                            }`}
                                        >
                                            <td className="p-2.5 text-center font-medium text-slate-500 border-r border-slate-200/60 dark:border-slate-800">
                                                {index + 1}
                                            </td>
                                            <td className="p-2.5 font-mono text-[11px] text-slate-600 dark:text-slate-400 border-r border-slate-200/60 dark:border-slate-800">
                                                {p.nik}
                                            </td>
                                            <td className="p-2.5 border-r border-slate-200/60 dark:border-slate-800">
                                                <div className="font-semibold text-slate-900 dark:text-white leading-tight">
                                                    {p.name}
                                                </div>
                                                {p.origin && (
                                                    <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]" title={p.origin}>
                                                        {p.origin}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-2.5 text-center font-medium text-slate-700 dark:text-slate-300 border-r border-slate-200/60 dark:border-slate-800 whitespace-nowrap">
                                                {p.tingkat}
                                            </td>
                                            <td className="p-2.5 text-center font-semibold text-slate-600 dark:text-slate-400 border-r border-slate-200/60 dark:border-slate-800">
                                                <span
                                                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${
                                                        p.gender === 'P'
                                                            ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
                                                            : 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                                                    }`}
                                                >
                                                    {p.gender}
                                                </span>
                                            </td>

                                            {/* Score Input Cells */}
                                            {activeCriteria.map((crit) => {
                                                const scoreVal = rowData.scores[crit.code] ?? '';
                                                return (
                                                    <td
                                                        key={crit.code}
                                                        className="p-1.5 text-center border-r border-slate-200/60 dark:border-slate-800"
                                                    >
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="5"
                                                            step="0.5"
                                                            value={scoreVal}
                                                            onChange={(e) => handleScoreChange(epId, crit.code, e.target.value)}
                                                            className={`w-12 py-1 px-1 text-center font-semibold rounded-lg text-xs border transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                                scoreVal >= 4
                                                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold'
                                                                    : scoreVal === 3
                                                                    ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
                                                                    : scoreVal !== ''
                                                                    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                                                                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                                            }`}
                                                            placeholder="1-5"
                                                            title={`${crit.code}: ${crit.label}`}
                                                        />
                                                    </td>
                                                );
                                            })}

                                            {/* Nilai Akhir */}
                                            <td className="p-2.5 text-center font-bold border-r border-slate-200/60 dark:border-slate-800 bg-blue-50/30 dark:bg-blue-950/10">
                                                {calc.isFilled ? (
                                                    <span
                                                        className={`text-xs sm:text-sm font-extrabold ${
                                                            calc.totalScore >= 80
                                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                                : calc.totalScore >= 70
                                                                ? 'text-amber-600 dark:text-amber-400'
                                                                : 'text-rose-600 dark:text-rose-400'
                                                        }`}
                                                    >
                                                        {calc.totalScore.toFixed(2)}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300 dark:text-slate-600">-</span>
                                                )}
                                            </td>

                                            {/* Predikat */}
                                            <td className="p-2.5 text-center border-r border-slate-200/60 dark:border-slate-800">
                                                {calc.isFilled ? (
                                                    <span
                                                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                            calc.predikat === 'Sangat Baik'
                                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300'
                                                                : calc.predikat === 'Baik'
                                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                                                                : calc.predikat === 'Cukup'
                                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                                                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                                                        }`}
                                                    >
                                                        {calc.predikat}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300 dark:text-slate-600">-</span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="p-2.5 text-center border-r border-slate-200/60 dark:border-slate-800">
                                                {calc.isFilled ? (
                                                    <span
                                                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                                            calc.status === 'LULUS'
                                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                                                : calc.status === 'REMEDIAL'
                                                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                                        }`}
                                                    >
                                                        {calc.status}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300 dark:text-slate-600">-</span>
                                                )}
                                            </td>

                                            {/* Catatan */}
                                            <td className="p-1.5 border-r border-slate-200/60 dark:border-slate-800">
                                                <input
                                                    type="text"
                                                    value={rowData.notes || ''}
                                                    onChange={(e) => handleNoteChange(epId, e.target.value)}
                                                    placeholder="Catatan..."
                                                    className="w-full text-xs bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-slate-300 dark:focus:border-slate-700 rounded-lg px-2 py-1 transition focus:outline-none"
                                                />
                                            </td>

                                            {/* Action Save Button */}
                                            <td className="p-2 text-center sticky right-0 bg-white/95 dark:bg-slate-900/95 z-10 shadow-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSaveRow(epId)}
                                                    disabled={isRowSaving}
                                                    className={`p-1.5 rounded-lg transition ${
                                                        rowData.isDirty
                                                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                                                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                    }`}
                                                    title={rowData.isDirty ? 'Simpan perubahan' : 'Sudah tersimpan'}
                                                >
                                                    {isRowSaving ? (
                                                        <Save className="w-4 h-4 animate-spin text-blue-500" />
                                                    ) : rowData.isDirty ? (
                                                        <Save className="w-4 h-4" />
                                                    ) : (
                                                        <Check className="w-4 h-4 text-emerald-500" />
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer notes */}
                <div className="p-4 bg-slate-50/60 dark:bg-slate-800/40 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Skala Likert:</span>
                        <span>5 = Sangat Baik</span>
                        <span>4 = Baik</span>
                        <span>3 = Cukup</span>
                        <span>2 = Kurang</span>
                        <span>1 = Sangat Kurang</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <span>Menampilkan {filteredParticipants.length} dari {activeParticipants.length} peserta</span>
                    </div>
                </div>
            </div>
        </>
    );
}
