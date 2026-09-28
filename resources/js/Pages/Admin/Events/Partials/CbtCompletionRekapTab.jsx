import React, { useState, useMemo } from 'react';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    X,
    Clock,
    AlertCircle,
    Eye,
    Filter,
    Users,
    FileCheck,
} from 'lucide-react';

export default function CbtCompletionRekapTab({
    cbtCompletionMatrix = [],
    cbtCompletionStats = {},
    tracks = [],
    onViewParticipantAttempts = () => {},
}) {
    const [rekapSearch, setRekapSearch] = useState('');
    const [rekapTrackFilter, setRekapTrackFilter] = useState('all');
    const [rekapStatusFilter, setRekapStatusFilter] = useState('all');
    const [rekapPage, setRekapPage] = useState(1);
    const [rekapPerPage, setRekapPerPage] = useState(25);

    // Extract available tracks for the dropdown
    const availableTracks = useMemo(() => {
        const map = new Map();
        (cbtCompletionMatrix || []).forEach((item) => {
            if (item.track_code && item.track_code !== '-' && !map.has(item.track_code)) {
                map.set(item.track_code, item.track_name && item.track_name !== '-' ? item.track_name : item.track_code);
            }
        });
        (tracks || []).forEach((t) => {
            if (t.code && !map.has(t.code)) {
                map.set(t.code, t.name || t.code);
            }
        });
        return Array.from(map.entries()).map(([code, name]) => ({ code, name }));
    }, [cbtCompletionMatrix, tracks]);

    // Filtering logic
    const filteredMatrix = useMemo(() => {
        return (cbtCompletionMatrix || []).filter((item) => {
            const matchesSearch = !rekapSearch ||
                item.participant_name?.toLowerCase().includes(rekapSearch.toLowerCase()) ||
                item.kenshi_id_number?.toLowerCase().includes(rekapSearch.toLowerCase()) ||
                item.origin_dojo?.toLowerCase().includes(rekapSearch.toLowerCase());

            const matchesTrack = rekapTrackFilter === 'all' ||
                item.track_code === rekapTrackFilter ||
                item.track_name?.toLowerCase() === rekapTrackFilter.toLowerCase();

            let matchesStatus = true;
            if (rekapStatusFilter === 'complete') {
                matchesStatus = item.status === 'complete';
            } else if (rekapStatusFilter === 'incomplete') {
                matchesStatus = item.status === 'incomplete' || item.status === 'none';
            } else if (rekapStatusFilter === 'missing_pre') {
                matchesStatus = !item.pre_test?.has_attempted;
            } else if (rekapStatusFilter === 'missing_quiz') {
                matchesStatus = !item.quiz?.has_attempted;
            } else if (rekapStatusFilter === 'missing_post') {
                matchesStatus = !item.post_test?.has_attempted;
            } else if (rekapStatusFilter === 'none') {
                matchesStatus = item.status === 'none';
            }

            return matchesSearch && matchesTrack && matchesStatus;
        });
    }, [cbtCompletionMatrix, rekapSearch, rekapTrackFilter, rekapStatusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredMatrix.length / rekapPerPage));
    const paginatedMatrix = useMemo(() => {
        const start = (rekapPage - 1) * rekapPerPage;
        return filteredMatrix.slice(start, start + rekapPerPage);
    }, [filteredMatrix, rekapPage, rekapPerPage]);

    const getTrackBadgeClass = (code) => {
        switch (code) {
            case 'PD': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'PN': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'PED': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'PEN': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'WAD': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'WAN': return 'bg-sky-50 text-sky-700 border-sky-200';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    const renderTestCell = (testData, testLabel) => {
        if (!testData || !testData.has_attempted) {
            return (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold">
                    <X className="h-3 w-3 text-rose-600 shrink-0" />
                    <span>Belum</span>
                </div>
            );
        }

        const isSubmitted = testData.status === 'submitted';
        const isPassed = testData.is_passed;

        return (
            <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                    {isSubmitted ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            Selesai
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
                            <Clock className="h-3 w-3 text-amber-600" />
                            Sedang Ujian
                        </span>
                    )}
                    {testData.score !== null && (
                        <span className={`font-mono text-xs font-bold ${isPassed ? 'text-emerald-700' : 'text-slate-800'}`}>
                            {Number(testData.score).toFixed(1)}
                        </span>
                    )}
                    {testData.attempt_count > 1 && (
                        <span className="text-[10px] text-slate-500 font-medium">
                            ({testData.attempt_count}x)
                        </span>
                    )}
                </div>
                {testData.latest_submitted_at && (
                    <div className="text-[10px] text-[#6B7C93]">
                        {testData.latest_submitted_at}
                    </div>
                )}
            </div>
        );
    };

    const renderCompletionBadge = (item) => {
        if (item.status === 'complete') {
            return (
                <div className="space-y-0.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Lengkap (3/3)
                    </span>
                    <p className="text-[10px] text-emerald-600 font-medium">Pre, Kuis & Post tuntas</p>
                </div>
            );
        }
        if (item.status === 'none') {
            return (
                <div className="space-y-0.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold">
                        <X className="h-3.5 w-3.5 text-rose-600" />
                        Belum Ada (0/3)
                    </span>
                    <p className="text-[10px] text-rose-600 font-medium">Belum mencoba tes apa pun</p>
                </div>
            );
        }
        return (
            <div className="space-y-0.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                    Belum Lengkap ({item.completed_count}/3)
                </span>
                <p className="text-[10px] text-amber-700 font-medium">
                    Kurang: {item.missing_list?.join(', ')}
                </p>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Quick Stat Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <div
                    onClick={() => { setRekapStatusFilter('all'); setRekapPage(1); }}
                    className={`cursor-pointer rounded-xl border p-3.5 transition-all shadow-xs ${
                        rekapStatusFilter === 'all'
                            ? 'border-[#0B63CE] ring-2 ring-[#0B63CE]/20 bg-blue-50/30'
                            : 'border-[#DCE7F3] bg-white hover:border-[#0B63CE]/50'
                    }`}
                >
                    <p className="text-[11px] font-medium text-[#6B7C93]">Total Peserta</p>
                    <p className="mt-1 font-display text-xl font-bold text-[#0E2747]">
                        {cbtCompletionStats?.total_participants ?? 0}
                    </p>
                    <p className="mt-1 text-[10px] text-[#6B7C93]">Semua kenshi terdaftar</p>
                </div>

                <div
                    onClick={() => { setRekapStatusFilter('complete'); setRekapPage(1); }}
                    className={`cursor-pointer rounded-xl border p-3.5 transition-all shadow-xs ${
                        rekapStatusFilter === 'complete'
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50'
                            : 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-400'
                    }`}
                >
                    <p className="text-[11px] font-medium text-emerald-800">Lengkap (3/3)</p>
                    <p className="mt-1 font-display text-xl font-bold text-emerald-900">
                        {cbtCompletionStats?.all_completed ?? 0}
                    </p>
                    <p className="mt-1 text-[10px] text-emerald-700">Pre, Kuis & Post tuntas</p>
                </div>

                <div
                    onClick={() => { setRekapStatusFilter('incomplete'); setRekapPage(1); }}
                    className={`cursor-pointer rounded-xl border p-3.5 transition-all shadow-xs ${
                        rekapStatusFilter === 'incomplete'
                            ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50'
                            : 'border-amber-200 bg-amber-50/50 hover:border-amber-400'
                    }`}
                >
                    <p className="text-[11px] font-medium text-amber-800">Belum Lengkap</p>
                    <p className="mt-1 font-display text-xl font-bold text-amber-900">
                        {cbtCompletionStats?.incomplete ?? 0}
                    </p>
                    <p className="mt-1 text-[10px] text-amber-700">Kurang 1 atau lebih tes</p>
                </div>

                <div
                    onClick={() => { setRekapStatusFilter('missing_pre'); setRekapPage(1); }}
                    className={`cursor-pointer rounded-xl border p-3.5 transition-all shadow-xs ${
                        rekapStatusFilter === 'missing_pre'
                            ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50'
                            : 'border-[#DCE7F3] bg-white hover:border-blue-300'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-medium text-[#6B7C93]">Pre-Test</p>
                        {cbtCompletionStats?.pre_test_missing > 0 && (
                            <span className="rounded bg-rose-100 px-1 py-0.5 text-[9px] font-bold text-rose-700">
                                {cbtCompletionStats.pre_test_missing} belum
                            </span>
                        )}
                    </div>
                    <p className="mt-1 font-display text-xl font-bold text-[#0E2747]">
                        {cbtCompletionStats?.pre_test_completed ?? 0}
                        <span className="text-xs font-normal text-[#6B7C93]">/{cbtCompletionStats?.total_participants ?? 0}</span>
                    </p>
                    <p className="mt-1 text-[10px] text-[#6B7C93]">
                        {cbtCompletionStats?.total_participants
                            ? Math.round(((cbtCompletionStats.pre_test_completed ?? 0) / cbtCompletionStats.total_participants) * 100)
                            : 0}% selesai
                    </p>
                </div>

                <div
                    onClick={() => { setRekapStatusFilter('missing_quiz'); setRekapPage(1); }}
                    className={`cursor-pointer rounded-xl border p-3.5 transition-all shadow-xs ${
                        rekapStatusFilter === 'missing_quiz'
                            ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50'
                            : 'border-[#DCE7F3] bg-white hover:border-indigo-300'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-medium text-[#6B7C93]">Kuis Formatif</p>
                        {cbtCompletionStats?.quiz_missing > 0 && (
                            <span className="rounded bg-rose-100 px-1 py-0.5 text-[9px] font-bold text-rose-700">
                                {cbtCompletionStats.quiz_missing} belum
                            </span>
                        )}
                    </div>
                    <p className="mt-1 font-display text-xl font-bold text-[#0E2747]">
                        {cbtCompletionStats?.quiz_completed ?? 0}
                        <span className="text-xs font-normal text-[#6B7C93]">/{cbtCompletionStats?.total_participants ?? 0}</span>
                    </p>
                    <p className="mt-1 text-[10px] text-[#6B7C93]">
                        {cbtCompletionStats?.total_participants
                            ? Math.round(((cbtCompletionStats.quiz_completed ?? 0) / cbtCompletionStats.total_participants) * 100)
                            : 0}% selesai
                    </p>
                </div>

                <div
                    onClick={() => { setRekapStatusFilter('missing_post'); setRekapPage(1); }}
                    className={`cursor-pointer rounded-xl border p-3.5 transition-all shadow-xs ${
                        rekapStatusFilter === 'missing_post'
                            ? 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50'
                            : 'border-[#DCE7F3] bg-white hover:border-purple-300'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-medium text-[#6B7C93]">Post-Test</p>
                        {cbtCompletionStats?.post_test_missing > 0 && (
                            <span className="rounded bg-rose-100 px-1 py-0.5 text-[9px] font-bold text-rose-700">
                                {cbtCompletionStats.post_test_missing} belum
                            </span>
                        )}
                    </div>
                    <p className="mt-1 font-display text-xl font-bold text-[#0E2747]">
                        {cbtCompletionStats?.post_test_completed ?? 0}
                        <span className="text-xs font-normal text-[#6B7C93]">/{cbtCompletionStats?.total_participants ?? 0}</span>
                    </p>
                    <p className="mt-1 text-[10px] text-[#6B7C93]">
                        {cbtCompletionStats?.total_participants
                            ? Math.round(((cbtCompletionStats.post_test_completed ?? 0) / cbtCompletionStats.total_participants) * 100)
                            : 0}% selesai
                    </p>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="rounded-xl border border-[#DCE7F3] bg-white p-4 shadow-xs space-y-3">
                {/* Baris 1: Pencarian & Info Total */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7C93]" />
                        <input
                            type="text"
                            value={rekapSearch}
                            onChange={(e) => {
                                setRekapSearch(e.target.value);
                                setRekapPage(1);
                            }}
                            placeholder="Cari nama kenshi, NIK, atau dojo..."
                            className="w-full rounded-lg border border-[#DCE7F3] py-2 pl-9 pr-8 text-xs text-[#112743] placeholder:text-[#8898AA] focus:border-[#0B63CE] focus:ring-1 focus:ring-[#0B63CE] focus:outline-none"
                        />
                        {rekapSearch && (
                            <button
                                type="button"
                                onClick={() => {
                                    setRekapSearch('');
                                    setRekapPage(1);
                                }}
                                className="absolute right-2.5 top-2.5 text-[#6B7C93] hover:text-[#112743]"
                                title="Hapus pencarian"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="text-xs text-[#6B7C93]">
                        Menampilkan <span className="font-semibold text-[#112743]">{filteredMatrix.length}</span> dari <span className="font-semibold text-[#112743]">{cbtCompletionStats?.total_participants ?? 0}</span> kenshi
                    </div>
                </div>

                {/* Baris 2: Filter Dropdowns */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#EEF4FB]">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4A617C] mr-1">
                        <Filter className="h-3.5 w-3.5 text-[#6B7C93]" />
                        <span>Filter:</span>
                    </div>

                    <select
                        value={rekapTrackFilter}
                        onChange={(e) => {
                            setRekapTrackFilter(e.target.value);
                            setRekapPage(1);
                        }}
                        className="rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] px-3 py-1.5 text-xs font-medium text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                    >
                        <option value="all">Semua Jalur Peserta</option>
                        {availableTracks.map((tr) => (
                            <option key={tr.code} value={tr.code}>
                                {tr.name} ({tr.code})
                            </option>
                        ))}
                    </select>

                    <select
                        value={rekapStatusFilter}
                        onChange={(e) => {
                            setRekapStatusFilter(e.target.value);
                            setRekapPage(1);
                        }}
                        className="rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] px-3 py-1.5 text-xs font-medium text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                    >
                        <option value="all">Semua Status Kelengkapan</option>
                        <option value="complete">Lengkap Semua (3/3) ({cbtCompletionStats?.all_completed ?? 0})</option>
                        <option value="incomplete">Belum Lengkap ({cbtCompletionStats?.incomplete ?? 0})</option>
                        <option value="missing_post">Belum Post-Test ({cbtCompletionStats?.post_test_missing ?? 0})</option>
                        <option value="missing_pre">Belum Pre-Test ({cbtCompletionStats?.pre_test_missing ?? 0})</option>
                        <option value="missing_quiz">Belum Kuis Formatif ({cbtCompletionStats?.quiz_missing ?? 0})</option>
                        <option value="none">Belum Semuanya ({cbtCompletionStats?.none_completed ?? 0})</option>
                    </select>

                    <select
                        value={rekapPerPage}
                        onChange={(e) => {
                            setRekapPerPage(Number(e.target.value));
                            setRekapPage(1);
                        }}
                        className="rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] px-3 py-1.5 text-xs font-medium text-[#112743] focus:border-[#0B63CE] focus:outline-none ml-auto"
                    >
                        <option value={25}>25 per hal</option>
                        <option value={50}>50 per hal</option>
                        <option value={100}>100 per hal</option>
                        <option value={200}>Semua ({cbtCompletionMatrix?.length || 0})</option>
                    </select>

                    {(rekapSearch || rekapTrackFilter !== 'all' || rekapStatusFilter !== 'all') && (
                        <button
                            type="button"
                            onClick={() => {
                                setRekapSearch('');
                                setRekapTrackFilter('all');
                                setRekapStatusFilter('all');
                                setRekapPage(1);
                            }}
                            className="text-xs font-medium text-rose-600 hover:text-rose-700 underline px-1"
                        >
                            Reset Filter
                        </button>
                    )}
                </div>
            </div>

            {/* Table of CBT Completion Status */}
            <div className="rounded-xl border border-[#DCE7F3] bg-white shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-[#DCE7F3] bg-[#F8FBFF] font-semibold text-[#112743]">
                            <tr>
                                <th className="py-3 px-4 w-12 text-center">No</th>
                                <th className="py-3 px-4">Nama Kenshi & Asal</th>
                                <th className="py-3 px-4 text-center">Jalur</th>
                                <th className="py-3 px-4">Pre-Test</th>
                                <th className="py-3 px-4">Kuis Formatif</th>
                                <th className="py-3 px-4">Post-Test / Teori</th>
                                <th className="py-3 px-4">Status Kelengkapan</th>
                                <th className="py-3 px-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DCE7F3]">
                            {paginatedMatrix.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-8 text-center text-sm text-[#6B7C93]">
                                        Tidak ditemukan peserta yang sesuai filter kelengkapan CBT.
                                    </td>
                                </tr>
                            ) : (
                                paginatedMatrix.map((item, idx) => {
                                    const globalIdx = (rekapPage - 1) * rekapPerPage + idx + 1;

                                    return (
                                        <tr key={item.participant_id} className="hover:bg-[#F8FBFF] transition-colors">
                                            <td className="py-3 px-4 text-center font-mono text-[#6B7C93]">{globalIdx}</td>
                                            <td className="py-3 px-4">
                                                <div className="font-semibold text-[#0E2747]">{item.participant_name}</div>
                                                <div className="flex items-center gap-2 font-mono text-[11px] text-[#6B7C93] mt-0.5">
                                                    <span>{item.kenshi_id_number}</span>
                                                    <span>•</span>
                                                    <span>{item.origin_dojo}</span>
                                                    {item.tingkat && item.tingkat !== '-' && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-slate-600 font-sans">{item.tingkat}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${getTrackBadgeClass(item.track_code)}`}>
                                                    {item.track_code}
                                                </span>
                                                <div className="text-[10px] text-[#6B7C93] mt-0.5">
                                                    {item.track_name}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                {renderTestCell(item.pre_test, 'Pre-Test')}
                                            </td>
                                            <td className="py-3 px-4">
                                                {renderTestCell(item.quiz, 'Kuis Formatif')}
                                            </td>
                                            <td className="py-3 px-4">
                                                {renderTestCell(item.post_test, 'Post-Test')}
                                            </td>
                                            <td className="py-3 px-4">
                                                {renderCompletionBadge(item)}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => onViewParticipantAttempts(item.participant_name)}
                                                    className="inline-flex items-center gap-1 rounded-md border border-[#DCE7F3] bg-white px-2.5 py-1.5 text-xs font-medium text-[#0B63CE] hover:bg-[#F0F5FA] transition-colors shadow-xs"
                                                    title="Lihat seluruh log lembar percobaan CBT peserta ini"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    <span>Log CBT</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-[#DCE7F3] px-4 py-3 bg-[#F8FBFF]">
                        <div className="text-xs text-[#6B7C93]">
                            Menampilkan <span className="font-semibold text-[#112743]">{(rekapPage - 1) * rekapPerPage + 1}</span> - <span className="font-semibold text-[#112743]">{Math.min(rekapPage * rekapPerPage, filteredMatrix.length)}</span> dari <span className="font-semibold text-[#112743]">{filteredMatrix.length}</span> peserta
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setRekapPage((p) => Math.max(1, p - 1))}
                                disabled={rekapPage === 1}
                                className="rounded border border-[#DCE7F3] bg-white p-1 text-[#112743] disabled:opacity-40 hover:bg-gray-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="px-2 text-xs font-medium text-[#112743]">
                                {rekapPage} / {totalPages}
                            </span>
                            <button
                                type="button"
                                onClick={() => setRekapPage((p) => Math.min(totalPages, p + 1))}
                                disabled={rekapPage === totalPages}
                                className="rounded border border-[#DCE7F3] bg-white p-1 text-[#112743] disabled:opacity-40 hover:bg-gray-50"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
