import { Save, Info, Check } from 'lucide-react';
import { useAssessment } from './AssessmentContext';

export default function AssessmentMatrix() {
    const {
        activeCategory,
        savingRowId,
        matrixState,
        activeConfig,
        activeParticipants,
        calculateParticipantScore,
        filteredParticipants,
        handleScoreChange,
        handleNotesChange,
        handleSaveRow,
    } = useAssessment();

    return (
        <>
            {/* Matrix Scoring Grid Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="max-h-[620px] overflow-auto relative">
                    <table className="w-full border-collapse text-left text-xs">
                        {/* Sticky Clean Light Table Header */}
                        <thead className="sticky top-0 z-30 bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur border-b border-slate-200 dark:border-slate-700 shadow-sm">
                            {/* Tier 1 Header */}
                            <tr className="text-slate-800 dark:text-slate-100 text-center border-b border-slate-200 dark:border-slate-700 divide-x divide-slate-200 dark:divide-slate-700 text-[11px]">
                                <th
                                    rowSpan={3}
                                    className="px-2 py-2.5 w-10 text-center sticky left-0 z-40 bg-slate-100 dark:bg-slate-800 font-bold"
                                >
                                    No
                                </th>
                                <th
                                    rowSpan={3}
                                    className="px-3 py-2.5 w-60 min-w-[220px] max-w-[260px] text-left sticky left-10 z-40 bg-slate-100 dark:bg-slate-800 font-bold shadow-[2px_0_4px_-1px_rgba(0,0,0,0.1)]"
                                >
                                    Peserta
                                </th>

                                {/* Kemampuan Dasar Header */}
                                <th
                                    colSpan={
                                        (activeConfig.groups?.dasar_teori?.criteria?.length || 0) +
                                        (activeConfig.groups?.dasar_praktek?.criteria?.length || 0) +
                                        1
                                    }
                                    className="py-1.5 px-2 bg-blue-100/80 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 font-bold uppercase tracking-wider text-[11px]"
                                >
                                    Kemampuan Dasar (100) &bull; Min. 70
                                </th>

                                {/* Kemampuan Pribadi Header */}
                                <th
                                    colSpan={(activeConfig.groups?.pribadi?.criteria?.length || 0) + 1}
                                    className="py-1.5 px-2 bg-indigo-100/80 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-bold uppercase tracking-wider text-[11px]"
                                >
                                    Kemampuan Pribadi (100) &bull; Min. 70
                                </th>

                                {/* Total & Actions */}
                                <th rowSpan={3} className="px-2 py-2 w-14 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-center">
                                    Total<br />(200)
                                </th>
                                <th rowSpan={3} className="px-2 py-2 w-24 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-center">
                                    Status
                                </th>
                                <th rowSpan={3} className="px-3 py-2 min-w-[130px] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-left">
                                    Catatan
                                </th>
                                <th rowSpan={3} className="px-2 py-2 w-12 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-center sticky right-0 z-40">
                                    Aksi
                                </th>
                            </tr>

                            {/* Tier 2 Header: Sections */}
                            <tr className="text-center border-b border-slate-200 dark:border-slate-700 divide-x divide-slate-200 dark:divide-slate-700 text-[10px]">
                                <th
                                    colSpan={activeConfig.groups?.dasar_teori?.criteria?.length || 0}
                                    className="py-1 px-1 bg-blue-50/90 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-semibold"
                                >
                                    {activeConfig.groups?.dasar_teori?.title || 'Teori'}
                                </th>
                                <th
                                    colSpan={activeConfig.groups?.dasar_praktek?.criteria?.length || 0}
                                    className="py-1 px-1 bg-cyan-50/90 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-300 font-semibold"
                                >
                                    {activeConfig.groups?.dasar_praktek?.title || 'Praktek'}
                                </th>
                                <th rowSpan={2} className="py-1 px-2 bg-blue-100/90 dark:bg-blue-900/60 text-blue-900 dark:text-blue-200 font-bold min-w-[50px]">
                                    Subtotal<br />Dasar
                                </th>

                                <th
                                    colSpan={activeConfig.groups?.pribadi?.criteria?.length || 0}
                                    className="py-1 px-1 bg-indigo-50/90 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 font-semibold"
                                >
                                    {activeConfig.groups?.pribadi?.title || 'Kemampuan Pribadi'}
                                </th>
                                <th rowSpan={2} className="py-1 px-2 bg-indigo-100/90 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 font-bold min-w-[50px]">
                                    Subtotal<br />Pribadi
                                </th>
                            </tr>

                            {/* Tier 3 Header: Individual Criterion columns */}
                            <tr className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-center border-b border-slate-200 dark:border-slate-700 divide-x divide-slate-200 dark:divide-slate-700 text-[10px]">
                                {(activeConfig.groups?.dasar_teori?.criteria || []).map((crit) => (
                                    <th key={crit.key} className="p-1 min-w-[54px] max-w-[70px]" title={crit.label}>
                                        <div className="truncate leading-tight text-[10px] text-blue-700 dark:text-blue-400 font-semibold">{crit.label.split(',')[0]}</div>
                                        <span className="inline-block px-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 text-[9px] font-bold">
                                            max {crit.max}
                                        </span>
                                    </th>
                                ))}

                                {(activeConfig.groups?.dasar_praktek?.criteria || []).map((crit) => (
                                    <th key={crit.key} className="p-1 min-w-[54px] max-w-[70px]" title={crit.label}>
                                        <div className="truncate leading-tight text-[10px] text-cyan-700 dark:text-cyan-400 font-semibold">{crit.label.split(',')[0]}</div>
                                        <span className="inline-block px-1 rounded bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-300 text-[9px] font-bold">
                                            max {crit.max}
                                        </span>
                                    </th>
                                ))}

                                {(activeConfig.groups?.pribadi?.criteria || []).map((crit) => (
                                    <th key={crit.key} className="p-1 min-w-[62px] max-w-[80px]" title={crit.label}>
                                        <div className="truncate leading-tight text-[10px] text-indigo-700 dark:text-indigo-400 font-semibold">{crit.label.split(',')[0]}</div>
                                        <span className="inline-block px-1 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300 text-[9px] font-bold">
                                            max {crit.max}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody className="divide-y divide-slate-200">
                            {filteredParticipants.length === 0 ? (
                                <tr>
                                    <td colSpan={25} className="py-12 text-center text-slate-400 bg-white">
                                        Tidak ada peserta yang cocok dengan filter atau pencarian.
                                    </td>
                                </tr>
                            ) : (
                                filteredParticipants.map((p, index) => {
                                    const epId = p.event_participant_id;
                                    const rowData = matrixState[activeCategory]?.[epId] || { scores: {}, notes: '', isDirty: false };
                                    const calc = calculateParticipantScore(epId);
                                    const isRowSaving = savingRowId === epId;

                                    return (
                                        <tr
                                            key={epId}
                                            className={`divide-x divide-slate-100 transition-colors ${
                                                rowData.isDirty
                                                    ? 'bg-amber-50/50'
                                                    : index % 2 === 0
                                                    ? 'bg-white hover:bg-blue-50/20'
                                                    : 'bg-slate-50/60 hover:bg-blue-50/20'
                                            }`}
                                        >
                                            {/* Column 1: No */}
                                            <td className="px-1.5 py-1.5 text-center font-medium text-slate-500 sticky left-0 z-20 bg-inherit text-[11px]">
                                                {index + 1}
                                            </td>

                                            {/* Column 2: Peserta Profile */}
                                            <td className="px-2.5 py-1.5 sticky left-10 z-20 bg-inherit shadow-[2px_0_4px_-1px_rgba(0,0,0,0.08)] max-w-[240px]">
                                                <div className="font-semibold text-slate-900 text-xs truncate leading-snug" title={p.name}>
                                                    {p.name}
                                                </div>
                                                <div className="text-[10px] text-slate-500 flex items-center gap-1.5 truncate mt-0.5">
                                                    <span className="px-1 py-0.2 rounded font-bold text-[9px] bg-slate-200 text-slate-700">
                                                        {p.track_code}
                                                    </span>
                                                    {p.kenshi_id && p.kenshi_id !== '-' && (
                                                        <span className="font-mono text-slate-600 truncate">{p.kenshi_id}</span>
                                                    )}
                                                    {p.origin && <span className="text-slate-400 truncate">&bull; {p.origin}</span>}
                                                </div>
                                            </td>

                                            {/* Dasar Teori Criterion inputs */}
                                            {(activeConfig.groups?.dasar_teori?.criteria || []).map((crit) => {
                                                const val = rowData.scores?.[crit.key] ?? '';
                                                return (
                                                    <td key={crit.key} className="p-1 text-center bg-blue-50/10">
                                                        <input
                                                            type="number"
                                                            step="0.5"
                                                            min="0"
                                                            max={crit.max}
                                                            value={val}
                                                            onChange={(e) =>
                                                                handleScoreChange(epId, crit.key, e.target.value, crit.max)
                                                            }
                                                            className={`w-12 h-7 text-center font-mono text-xs font-semibold py-0.5 px-0.5 rounded border ${
                                                                val !== ''
                                                                    ? Number(val) >= crit.max * 0.7
                                                                        ? 'border-blue-400 bg-blue-50/80 text-blue-900 font-bold'
                                                                        : 'border-amber-400 bg-amber-50/80 text-amber-900'
                                                                    : 'border-slate-200 bg-white text-slate-700'
                                                            } focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                                                        />
                                                    </td>
                                                );
                                            })}

                                            {/* Dasar Praktek Criterion inputs */}
                                            {(activeConfig.groups?.dasar_praktek?.criteria || []).map((crit) => {
                                                const val = rowData.scores?.[crit.key] ?? '';
                                                return (
                                                    <td key={crit.key} className="p-1 text-center bg-cyan-50/10">
                                                        <input
                                                            type="number"
                                                            step="0.5"
                                                            min="0"
                                                            max={crit.max}
                                                            value={val}
                                                            onChange={(e) =>
                                                                handleScoreChange(epId, crit.key, e.target.value, crit.max)
                                                            }
                                                            className={`w-12 h-7 text-center font-mono text-xs font-semibold py-0.5 px-0.5 rounded border ${
                                                                val !== ''
                                                                    ? Number(val) >= crit.max * 0.7
                                                                        ? 'border-cyan-400 bg-cyan-50/80 text-cyan-900 font-bold'
                                                                        : 'border-amber-400 bg-amber-50/80 text-amber-900'
                                                                    : 'border-slate-200 bg-white text-slate-700'
                                                            } focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500`}
                                                        />
                                                    </td>
                                                );
                                            })}

                                            {/* Subtotal Dasar */}
                                            <td className="px-1.5 py-1 text-center font-bold bg-blue-50/40">
                                                <span
                                                    className={`inline-block font-mono text-xs ${
                                                        calc.isFilled
                                                            ? calc.dasar >= 70
                                                                ? 'text-blue-900 font-extrabold'
                                                                : 'text-amber-800 font-bold'
                                                            : 'text-slate-400'
                                                    }`}
                                                >
                                                    {calc.isFilled ? calc.dasar : '-'}
                                                </span>
                                            </td>

                                            {/* Pribadi Criterion inputs */}
                                            {(activeConfig.groups?.pribadi?.criteria || []).map((crit) => {
                                                const val = rowData.scores?.[crit.key] ?? '';
                                                return (
                                                    <td key={crit.key} className="p-1 text-center bg-indigo-50/10">
                                                        <input
                                                            type="number"
                                                            step="0.5"
                                                            min="0"
                                                            max={crit.max}
                                                            value={val}
                                                            onChange={(e) =>
                                                                handleScoreChange(epId, crit.key, e.target.value, crit.max)
                                                            }
                                                            className={`w-12 h-7 text-center font-mono text-xs font-semibold py-0.5 px-0.5 rounded border ${
                                                                val !== ''
                                                                    ? Number(val) >= crit.max * 0.7
                                                                        ? 'border-indigo-400 bg-indigo-50/80 text-indigo-900 font-bold'
                                                                        : 'border-amber-400 bg-amber-50/80 text-amber-900'
                                                                    : 'border-slate-200 bg-white text-slate-700'
                                                            } focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500`}
                                                        />
                                                    </td>
                                                );
                                            })}

                                            {/* Subtotal Pribadi */}
                                            <td className="px-1.5 py-1 text-center font-bold bg-indigo-50/40">
                                                <span
                                                    className={`inline-block font-mono text-xs ${
                                                        calc.isFilled
                                                            ? calc.pribadi >= 70
                                                                ? 'text-indigo-900 font-extrabold'
                                                                : 'text-amber-800 font-bold'
                                                            : 'text-slate-400'
                                                    }`}
                                                >
                                                    {calc.isFilled ? calc.pribadi : '-'}
                                                </span>
                                            </td>

                                            {/* Grand Total */}
                                            <td className="px-1.5 py-1 text-center font-mono font-extrabold text-slate-900 bg-slate-100/70 text-xs">
                                                {calc.isFilled ? calc.total : '-'}
                                            </td>

                                            {/* Status Kelulusan */}
                                            <td className="px-1.5 py-1 text-center whitespace-nowrap">
                                                {calc.isFilled ? (
                                                    calc.isPassed ? (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                            LULUS
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                                            BELUM LULUS
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 italic">Belum Dinilai</span>
                                                )}
                                            </td>

                                            {/* Catatan Penguji */}
                                            <td className="p-1">
                                                <input
                                                    type="text"
                                                    value={rowData.notes || ''}
                                                    onChange={(e) => handleNotesChange(epId, e.target.value)}
                                                    placeholder="Catatan..."
                                                    className="w-full text-xs h-7 py-0.5 px-2 rounded border border-slate-200 focus:border-blue-500 placeholder:text-slate-300"
                                                />
                                            </td>

                                            {/* Action Save Single */}
                                            <td className="px-1 py-1 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSaveRow(p)}
                                                    disabled={isRowSaving}
                                                    className={`p-1.5 rounded-md transition ${
                                                        rowData.isDirty
                                                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                                    }`}
                                                    title={rowData.isDirty ? 'Simpan nilai peserta ini' : 'Tersimpan'}
                                                >
                                                    {isRowSaving ? (
                                                        <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full" />
                                                    ) : rowData.isDirty ? (
                                                        <Save className="w-3.5 h-3.5" />
                                                    ) : (
                                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
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

                {/* Table Footer */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 text-slate-600">
                        <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>
                            Syarat Lulus: Kemampuan Dasar &ge; 70 pt dan Kemampuan Pribadi &ge; 70 pt (Total minimal 140/200 pt).
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">
                            Menampilkan {filteredParticipants.length} dari {activeParticipants.length} peserta
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}
