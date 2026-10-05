import React, { useState, useMemo } from 'react';
import { useForm, router } from '@inertiajs/react';
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    Plus,
    Pencil,
    Trash2,
    FileSpreadsheet,
    Printer,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Calculator,
    CheckCircle2,
    AlertCircle,
    Search,
    Shield,
    Calendar,
    Layers,
    Clock,
    FileText,
    Percent,
} from 'lucide-react';
import Button from '../../../../Components/ui/Button';
import Input from '../../../../Components/ui/Input';
import Select from '../../../../Components/ui/Select';
import Textarea from '../../../../Components/ui/Textarea';
import Modal from '../../../../Components/ui/Modal';
import AlertDialog from '../../../../Components/ui/AlertDialog';
import Badge from '../../../../Components/ui/Badge';

const rupiah = (val) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(val || 0);

const BUDGET_CATEGORIES = {
    income: [
        { code: 'registration', name: 'Pendaftaran Peserta' },
        { code: 'grant', name: 'Bantuan / Subsidi Organisasi' },
        { code: 'sponsorship', name: 'Sponsorship & Donatur' },
        { code: 'other', name: 'Pemasukan Lain-lain' },
    ],
    expense: [
        { code: 'venue', name: 'Tempat & Sewa Fasilitas' },
        { code: 'accommodation', name: 'Akomodasi & Penginapan' },
        { code: 'consumption', name: 'Konsumsi & Snack' },
        { code: 'honorarium', name: 'Honorarium Pemateri & Penguji' },
        { code: 'transport', name: 'Transportasi & Tiket' },
        { code: 'printing', name: 'Cetak & ATK' },
        { code: 'equipment', name: 'Perlengkapan, Medali & Plakat' },
        { code: 'documentation', name: 'Dokumentasi & Publikasi' },
        { code: 'medical', name: 'Kesehatan & P3K' },
        { code: 'contingency', name: 'Biaya Tak Terduga' },
        { code: 'other', name: 'Pengeluaran Lain-lain' },
    ],
};

const CATEGORY_NAMES = {
    registration: 'Pendaftaran Peserta',
    grant: 'Bantuan / Subsidi Organisasi',
    sponsorship: 'Sponsorship & Donatur',
    venue: 'Tempat & Sewa Fasilitas',
    accommodation: 'Akomodasi & Penginapan',
    consumption: 'Konsumsi & Snack',
    honorarium: 'Honorarium Pemateri & Penguji',
    transport: 'Transportasi & Tiket',
    printing: 'Cetak & ATK',
    equipment: 'Perlengkapan, Medali & Plakat',
    documentation: 'Dokumentasi & Publikasi',
    medical: 'Kesehatan & P3K',
    contingency: 'Biaya Tak Terduga',
    other: 'Lain-lain',
};

const UNIT_SUGGESTIONS = ['orang', 'hari', 'pax', 'paket', 'kamar', 'kegiatan', 'buah', 'rim', 'set'];

export default function EventRabTab({
    event,
    budgets = [],
    rabAnalysis = null,
    canManageBudget = true,
}) {
    const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'income', 'expense'
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Form handling
    const { data, setData, post, put, processing, errors, reset, clearErrors, transform } = useForm({
        type: 'expense',
        category: 'consumption',
        item_name: '',
        quantity: 1,
        unit: 'paket',
        unit_price: '',
        amount: '',
        notes: '',
        sort_order: 0,
    });

    const openCreateModal = (defaultType = 'expense') => {
        clearErrors();
        setEditingItem(null);
        setData({
            type: defaultType,
            category: defaultType === 'income' ? 'registration' : 'consumption',
            item_name: '',
            quantity: 1,
            unit: 'paket',
            unit_price: '',
            amount: '',
            notes: '',
            sort_order: 0,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        clearErrors();
        setEditingItem(item);
        setData({
            type: item.type,
            category: item.category,
            item_name: item.item_name,
            quantity: item.quantity,
            unit: item.unit || 'paket',
            unit_price: item.unit_price,
            amount: item.amount,
            notes: item.notes || '',
            sort_order: item.sort_order || 0,
        });
        setIsModalOpen(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const computedAmount = Math.round(Number(data.quantity || 0) * Number(data.unit_price || 0));
        transform((currentData) => ({
            ...currentData,
            amount: computedAmount,
        }));

        if (editingItem) {
            put(`/admin/event/${event.id}/rab/${editingItem.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post(`/admin/event/${event.id}/rab`, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        router.delete(`/admin/event/${event.id}/rab/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
            onError: () => setDeleteTarget(null),
            onFinish: () => setDeleteTarget(null),
        });
    };

    // Filtered items
    const filteredBudgets = useMemo(() => {
        return budgets.filter((item) => {
            if (typeFilter !== 'all' && item.type !== typeFilter) {
                return false;
            }
            if (categoryFilter !== 'all' && item.category !== categoryFilter) {
                return false;
            }
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const matchName = item.item_name?.toLowerCase().includes(query);
                const matchCat = (CATEGORY_NAMES[item.category] || item.category_name || '')
                    .toLowerCase()
                    .includes(query);
                const matchNotes = item.notes?.toLowerCase().includes(query);
                if (!matchName && !matchCat && !matchNotes) {
                    return false;
                }
            }
            return true;
        });
    }, [budgets, typeFilter, categoryFilter, searchQuery]);

    // Statistics & Calculations
    const incomeItems = useMemo(() => budgets.filter((b) => b.type === 'income'), [budgets]);
    const expenseItems = useMemo(() => budgets.filter((b) => b.type === 'expense'), [budgets]);

    const totalIncome = rabAnalysis?.total_income ?? incomeItems.reduce((acc, b) => acc + Number(b.amount || 0), 0);
    const totalExpense = rabAnalysis?.total_expense ?? expenseItems.reduce((acc, b) => acc + Number(b.amount || 0), 0);
    const plannedBalance = rabAnalysis?.planned_balance ?? (totalIncome - totalExpense);

    const actualIncome = rabAnalysis?.actual_income ?? 0;
    const actualExpense = rabAnalysis?.actual_expense ?? 0;
    const incomePct = rabAnalysis?.income_achievement_rate ?? (totalIncome > 0 ? Math.round((actualIncome / totalIncome) * 100) : 0);
    const expenseAbsorptionPct = rabAnalysis?.expense_absorption_rate ?? (totalExpense > 0 ? Math.round((actualExpense / totalExpense) * 100) : 0);
    const remainingBudget = rabAnalysis?.remaining_budget ?? Math.max(0, totalExpense - actualExpense);

    // Live subtotal preview in modal
    const modalLiveSubtotal = useMemo(() => {
        const qty = parseFloat(data.quantity) || 0;
        const price = parseInt(data.unit_price, 10) || 0;
        return qty * price;
    }, [data.quantity, data.unit_price]);

    return (
        <section className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE7F3] pb-5">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF5FF] px-2.5 py-0.5 text-xs font-semibold text-[#0B63CE] border border-[#B9DCFF]">
                            <Shield className="size-3.5" aria-hidden="true" />
                            Kluster Perencanaan & Anggaran Biaya (RAB)
                        </span>
                        <span className="text-xs text-[#6B7C93]">•</span>
                        <span className="text-xs font-medium text-[#6B7C93]">
                            Tahun Anggaran {new Date(event.start_date || Date.now()).getFullYear()}
                        </span>
                    </div>
                    <h3 className="mt-2 font-display text-xl sm:text-2xl font-bold text-[#0A3F82]">
                        Rencana Anggaran Biaya (RAB) Kegiatan
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-[#6B7C93] max-w-2xl">
                        Rincian proyeksi pendapatan, pagu belanja operasional penataran, dan komparasi penyerapan anggaran terhadap realisasi kas riil.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        as="a"
                        href={`/admin/event/${event.id}/rab/export`}
                        variant="outline"
                        size="sm"
                        icon={FileSpreadsheet}
                        className="bg-white hover:bg-[#F8FBFF] text-[#0A3F82] border-[#DCE7F3]"
                    >
                        Ekspor Excel
                    </Button>
                    <Button
                        as="a"
                        href={`/admin/event/${event.id}/rab/cetak`}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outline"
                        size="sm"
                        icon={Printer}
                        className="bg-white hover:bg-[#F8FBFF] text-[#0A3F82] border-[#DCE7F3]"
                    >
                        Cetak RAB
                    </Button>
                    {canManageBudget && (
                        <Button
                            type="button"
                            onClick={() => openCreateModal('expense')}
                            size="sm"
                            icon={Plus}
                            className="bg-[#0B63CE] hover:bg-[#0A3F82] text-white shadow-xs"
                        >
                            Tambah Item RAB
                        </Button>
                    )}
                </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total Rencana Pemasukan */}
                <div className="bg-white p-5 rounded-xl border border-[#DCE7F3] shadow-xs relative overflow-hidden transition-all hover:shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7C93]">
                            Rencana Pemasukan
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-[#E8F8F2] flex items-center justify-center text-[#16785B]">
                            <TrendingUp className="size-4.5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="text-xl sm:text-2xl font-bold font-display text-[#16785B]">
                            {rupiah(totalIncome)}
                        </div>
                        <div className="mt-1 flex items-center justify-between text-xs text-[#6B7C93]">
                            <span>{incomeItems.length} pos penerimaan</span>
                            <span className="font-medium text-[#16785B]">
                                Riil: {rupiah(actualIncome)} ({incomePct}%)
                            </span>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#16785B]/20">
                        <div
                            className="h-full bg-[#16785B] transition-all duration-500"
                            style={{ width: `${Math.min(incomePct, 100)}%` }}
                        />
                    </div>
                </div>

                {/* 2. Total Rencana Pengeluaran */}
                <div className="bg-white p-5 rounded-xl border border-[#DCE7F3] shadow-xs relative overflow-hidden transition-all hover:shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7C93]">
                            Rencana Belanja (Pagu)
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-[#FFF0F3] flex items-center justify-center text-[#B93664]">
                            <TrendingDown className="size-4.5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="text-xl sm:text-2xl font-bold font-display text-[#B93664]">
                            {rupiah(totalExpense)}
                        </div>
                        <div className="mt-1 flex items-center justify-between text-xs text-[#6B7C93]">
                            <span>{expenseItems.length} item belanja</span>
                            <span className="font-medium text-[#B93664]">
                                Terserap: {expenseAbsorptionPct}%
                            </span>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#B93664]/20">
                        <div
                            className="h-full bg-[#B93664] transition-all duration-500"
                            style={{ width: `${Math.min(expenseAbsorptionPct, 100)}%` }}
                        />
                    </div>
                </div>

                {/* 3. Estimasi Saldo Bersih */}
                <div className="bg-white p-5 rounded-xl border border-[#DCE7F3] shadow-xs relative overflow-hidden transition-all hover:shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7C93]">
                            Proyeksi Saldo Bersih
                        </span>
                        <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                plannedBalance >= 0 ? 'bg-[#EAF5FF] text-[#0B63CE]' : 'bg-[#FFF0F3] text-[#B93664]'
                            }`}
                        >
                            <Wallet className="size-4.5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div
                            className={`text-xl sm:text-2xl font-bold font-display ${
                                plannedBalance >= 0 ? 'text-[#0A3F82]' : 'text-[#B93664]'
                            }`}
                        >
                            {rupiah(plannedBalance)}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-[#6B7C93]">
                            <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                    plannedBalance >= 0
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                            >
                                {plannedBalance >= 0 ? 'Surplus Anggaran' : 'Defisit Anggaran'}
                            </span>
                            <span>• Sesuai target</span>
                        </div>
                    </div>
                </div>

                {/* 4. Sisa Alokasi Pagu */}
                <div className="bg-white p-5 rounded-xl border border-[#DCE7F3] shadow-xs relative overflow-hidden transition-all hover:shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7C93]">
                            Sisa Pagu Belanja
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                            <Calculator className="size-4.5" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="text-xl sm:text-2xl font-bold font-display text-[#112743]">
                            {rupiah(remainingBudget)}
                        </div>
                        <div className="mt-1 flex items-center justify-between text-xs text-[#6B7C93]">
                            <span>Realisasi Kas: {rupiah(actualExpense)}</span>
                            <span className="font-semibold text-emerald-600">
                                {100 - Math.min(expenseAbsorptionPct, 100)}% sisa
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Komparasi Realisasi Kas Mini Bar */}
            <div className="bg-linear-to-r from-[#F8FBFF] to-[#EAF5FF] border border-[#DCE7F3] rounded-xl p-4 sm:p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#0B63CE]" />
                            <h4 className="text-sm font-bold text-[#0A3F82]">
                                Penyerapan Anggaran Terhadap Realisasi Kas
                            </h4>
                        </div>
                        <p className="text-xs text-[#6B7C93]">
                            Perbandingan langsung antara pagu yang direncanakan di RAB dan arus kas pengeluaran riil bendahara ({rupiah(actualExpense)} tercatat).
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#0B63CE]" />
                            <span className="text-[#6B7C93]">Target RAB: {rupiah(totalExpense)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#16785B]" />
                            <span className="text-[#6B7C93]">Realisasi Kas: {rupiah(actualExpense)}</span>
                        </div>
                        <div className="px-2.5 py-1 rounded-md bg-white border border-[#DCE7F3] text-[#0A3F82] font-semibold">
                            Terserap {expenseAbsorptionPct}%
                        </div>
                    </div>
                </div>

                <div className="mt-3 w-full bg-[#DCE7F3] h-2.5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-linear-to-r from-[#0B63CE] to-[#16785B] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(expenseAbsorptionPct, 100)}%` }}
                    />
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#DCE7F3]">
                {/* Type Switcher Pills */}
                <div className="inline-flex rounded-lg bg-[#F8FBFF] p-1 border border-[#DCE7F3]">
                    <button
                        type="button"
                        onClick={() => {
                            setTypeFilter('all');
                            setCategoryFilter('all');
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                            typeFilter === 'all'
                                ? 'bg-white text-[#0A3F82] shadow-2xs font-bold'
                                : 'text-[#6B7C93] hover:text-[#0A3F82]'
                        }`}
                    >
                        Semua ({budgets.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setTypeFilter('income');
                            setCategoryFilter('all');
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                            typeFilter === 'income'
                                ? 'bg-[#E8F8F2] text-[#16785B] shadow-2xs font-bold'
                                : 'text-[#6B7C93] hover:text-[#16785B]'
                        }`}
                    >
                        <TrendingUp className="size-3" />
                        Pemasukan ({incomeItems.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setTypeFilter('expense');
                            setCategoryFilter('all');
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                            typeFilter === 'expense'
                                ? 'bg-[#FFF0F3] text-[#B93664] shadow-2xs font-bold'
                                : 'text-[#6B7C93] hover:text-[#B93664]'
                        }`}
                    >
                        <TrendingDown className="size-3" />
                        Pengeluaran ({expenseItems.length})
                    </button>
                </div>

                {/* Search & Category Filter */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#6B7C93]" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari uraian anggaran..."
                            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#DCE7F3] rounded-lg focus:outline-hidden focus:border-[#0B63CE] text-[#112743]"
                        />
                    </div>

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="py-1.5 px-3 text-xs bg-white border border-[#DCE7F3] rounded-lg text-[#112743] focus:outline-hidden focus:border-[#0B63CE]"
                    >
                        <option value="all">Semua Kategori</option>
                        {Object.entries(CATEGORY_NAMES).map(([code, name]) => (
                            <option key={code} value={code}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table of Budget Items */}
            <div className="overflow-hidden bg-white border border-[#DCE7F3] rounded-xl shadow-xs">
                {filteredBudgets.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 rounded-full bg-[#EAF5FF] text-[#0B63CE] flex items-center justify-center mx-auto mb-3">
                            <Wallet className="size-6" />
                        </div>
                        <h4 className="text-base font-bold text-[#0A3F82]">Tidak Ada Item Anggaran</h4>
                        <p className="text-xs text-[#6B7C93] mt-1 max-w-sm mx-auto">
                            {searchQuery || categoryFilter !== 'all' || typeFilter !== 'all'
                                ? 'Tidak ada item anggaran yang sesuai dengan kriteria filter Anda.'
                                : 'Belum ada item anggaran RAB yang dibuat untuk kegiatan ini.'}
                        </p>
                        {canManageBudget && (
                            <div className="mt-4 flex justify-center gap-2">
                                <Button
                                    size="sm"
                                    onClick={() => openCreateModal('income')}
                                    variant="outline"
                                    className="text-xs"
                                >
                                    + Tambah Pemasukan
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => openCreateModal('expense')}
                                    className="bg-[#0B63CE] text-white text-xs"
                                >
                                    + Tambah Pengeluaran
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px] text-left text-xs">
                            <thead className="bg-[#EAF5FF] text-[#0A3F82] border-b border-[#DCE7F3]">
                                <tr>
                                    <th className="px-4 py-3.5 font-bold w-12 text-center">No</th>
                                    <th className="px-4 py-3.5 font-bold w-28">Tipe</th>
                                    <th className="px-4 py-3.5 font-bold">Kategori</th>
                                    <th className="px-4 py-3.5 font-bold min-w-[240px]">Uraian Kebutuhan / Sumber Dana</th>
                                    <th className="px-4 py-3.5 font-bold text-center">Volume</th>
                                    <th className="px-4 py-3.5 font-bold text-center">Satuan</th>
                                    <th className="px-4 py-3.5 font-bold text-right">Tarif Satuan</th>
                                    <th className="px-4 py-3.5 font-bold text-right">Total Anggaran</th>
                                    {canManageBudget && (
                                        <th className="px-4 py-3.5 font-bold text-center w-20">Aksi</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#DCE7F3]">
                                {filteredBudgets.map((item, index) => {
                                    const isIncome = item.type === 'income';
                                    return (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-[#F8FBFF]/70 transition-colors"
                                        >
                                            <td className="px-4 py-3.5 text-center text-[#6B7C93] font-medium">
                                                {index + 1}
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                                        isIncome
                                                            ? 'bg-[#E8F8F2] text-[#16785B] border border-[#A7E8CD]'
                                                            : 'bg-[#FFF0F3] text-[#B93664] border border-[#FECDDA]'
                                                    }`}
                                                >
                                                    {isIncome ? (
                                                        <>
                                                            <ArrowUpRight className="size-3" /> Pemasukan
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ArrowDownRight className="size-3" /> Belanja
                                                        </>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                <span className="inline-block px-2 py-0.5 bg-[#F0F4F9] text-[#0A3F82] font-medium rounded text-[11px]">
                                                    {CATEGORY_NAMES[item.category] || item.category_name || item.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="font-semibold text-[#112743]">
                                                    {item.item_name}
                                                </div>
                                                {item.notes && (
                                                    <div className="text-[11px] text-[#6B7C93] mt-0.5">
                                                        {item.notes}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 text-center font-medium text-[#112743]">
                                                {item.quantity}
                                            </td>
                                            <td className="px-4 py-3.5 text-center text-[#6B7C93]">
                                                {item.unit || 'paket'}
                                            </td>
                                            <td className="px-4 py-3.5 text-right font-mono text-[#6B7C93]">
                                                {rupiah(item.unit_price)}
                                            </td>
                                            <td className="px-4 py-3.5 text-right font-mono font-bold">
                                                <span
                                                    className={
                                                        isIncome ? 'text-[#16785B]' : 'text-[#B93664]'
                                                    }
                                                >
                                                    {rupiah(item.amount)}
                                                </span>
                                            </td>
                                            {canManageBudget && (
                                                <td className="px-4 py-3.5 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(item)}
                                                            className="p-1 rounded text-[#6B7C93] hover:text-[#0B63CE] hover:bg-[#EAF5FF] transition-colors"
                                                            title="Edit item anggaran"
                                                        >
                                                            <Pencil className="size-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeleteTarget(item)}
                                                            className="p-1 rounded text-[#6B7C93] hover:text-[#B93664] hover:bg-[#FFF0F3] transition-colors"
                                                            title="Hapus item anggaran"
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                            {/* Table Footer with Summary */}
                            <tfoot className="bg-[#F8FBFF] border-t-2 border-[#DCE7F3] font-bold text-xs text-[#0A3F82]">
                                <tr>
                                    <td colSpan={7} className="px-4 py-3 text-right">
                                        Subtotal Filtered:
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono font-bold text-[#0A3F82]">
                                        {rupiah(
                                            filteredBudgets.reduce(
                                                (acc, b) =>
                                                    b.type === 'income'
                                                        ? acc + Number(b.amount || 0)
                                                        : acc - Number(b.amount || 0),
                                                0
                                            )
                                        )}
                                    </td>
                                    {canManageBudget && <td />}
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Tambah / Edit Item Anggaran */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? 'Edit Item Anggaran (RAB)' : 'Tambah Item Anggaran (RAB)'}
                description="Masukkan rincian kebutuhan anggaran atau sumber pendapatan kegiatan penataran."
                size="lg"
            >
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    {/* Tipe Transaksi (Pemasukan vs Pengeluaran) */}
                    <div>
                        <label className="block text-xs font-bold text-[#0A3F82] mb-1.5">
                            Jenis Anggaran <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setData({
                                        ...data,
                                        type: 'income',
                                        category: 'registration',
                                    });
                                }}
                                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                                    data.type === 'income'
                                        ? 'bg-[#E8F8F2] border-[#16785B] text-[#16785B] shadow-2xs font-bold'
                                        : 'bg-white border-[#DCE7F3] text-[#6B7C93] hover:border-[#16785B]'
                                }`}
                            >
                                <TrendingUp className="size-4" />
                                Rencana Pemasukan
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setData({
                                        ...data,
                                        type: 'expense',
                                        category: 'consumption',
                                    });
                                }}
                                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                                    data.type === 'expense'
                                        ? 'bg-[#FFF0F3] border-[#B93664] text-[#B93664] shadow-2xs font-bold'
                                        : 'bg-white border-[#DCE7F3] text-[#6B7C93] hover:border-[#B93664]'
                                }`}
                            >
                                <TrendingDown className="size-4" />
                                Rencana Pengeluaran (Belanja)
                            </button>
                        </div>
                    </div>

                    {/* Kategori Anggaran */}
                    <div>
                        <label className="block text-xs font-bold text-[#0A3F82] mb-1">
                            Kategori Pos Anggaran <span className="text-rose-500">*</span>
                        </label>
                        <select
                            value={data.category}
                            onChange={(e) => setData('category', e.target.value)}
                            className="w-full text-xs bg-white border border-[#DCE7F3] rounded-lg p-2.5 text-[#112743] focus:outline-hidden focus:border-[#0B63CE]"
                        >
                            {(BUDGET_CATEGORIES[data.type] || BUDGET_CATEGORIES.expense).map((cat) => (
                                <option key={cat.code} value={cat.code}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        {errors.category && (
                            <p className="text-[11px] text-rose-500 mt-1">{errors.category}</p>
                        )}
                    </div>

                    {/* Uraian Kebutuhan */}
                    <div>
                        <label className="block text-xs font-bold text-[#0A3F82] mb-1">
                            Uraian Kebutuhan / Pos Dana <span className="text-rose-500">*</span>
                        </label>
                        <Input
                            type="text"
                            value={data.item_name}
                            onChange={(e) => setData('item_name', e.target.value)}
                            placeholder="Contoh: Konsumsi Peserta & Panitia 4 Hari"
                            className="text-xs"
                            required
                        />
                        {errors.item_name && (
                            <p className="text-[11px] text-rose-500 mt-1">{errors.item_name}</p>
                        )}
                    </div>

                    {/* Volume & Satuan */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-[#0A3F82] mb-1">
                                Volume (Jumlah Kuantitas) <span className="text-rose-500">*</span>
                            </label>
                            <Input
                                type="number"
                                step="any"
                                min="0.01"
                                value={data.quantity}
                                onChange={(e) => setData('quantity', e.target.value)}
                                placeholder="1"
                                className="text-xs"
                                required
                            />
                            {errors.quantity && (
                                <p className="text-[11px] text-rose-500 mt-1">{errors.quantity}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#0A3F82] mb-1">
                                Satuan <span className="text-rose-500">*</span>
                            </label>
                            <Input
                                type="text"
                                value={data.unit}
                                onChange={(e) => setData('unit', e.target.value)}
                                placeholder="paket, orang, hari, pax..."
                                className="text-xs"
                                required
                            />
                            {/* Preset Suggestions */}
                            <div className="flex flex-wrap gap-1 mt-1.5">
                                {UNIT_SUGGESTIONS.map((u) => (
                                    <button
                                        key={u}
                                        type="button"
                                        onClick={() => setData('unit', u)}
                                        className="text-[10px] px-2 py-0.5 bg-[#F0F4F9] text-[#0A3F82] rounded hover:bg-[#DCE7F3] transition-colors"
                                    >
                                        {u}
                                    </button>
                                ))}
                            </div>
                            {errors.unit && (
                                <p className="text-[11px] text-rose-500 mt-1">{errors.unit}</p>
                            )}
                        </div>
                    </div>

                    {/* Harga Satuan & Subtotal Preview */}
                    <div>
                        <label className="block text-xs font-bold text-[#0A3F82] mb-1">
                            Tarif / Harga Satuan (Rp) <span className="text-rose-500">*</span>
                        </label>
                        <Input
                            type="number"
                            min="0"
                            step="1000"
                            value={data.unit_price}
                            onChange={(e) => setData('unit_price', e.target.value)}
                            placeholder="Masukkan nominal harga satuan..."
                            className="text-xs font-mono"
                            required
                        />
                        {data.unit_price && (
                            <div className="text-[11px] text-[#6B7C93] mt-1 font-mono">
                                Terbaca: {rupiah(data.unit_price)} per {data.unit || 'satuan'}
                            </div>
                        )}
                        {errors.unit_price && (
                            <p className="text-[11px] text-rose-500 mt-1">{errors.unit_price}</p>
                        )}
                    </div>

                    {/* Live Subtotal Highlight Box */}
                    <div className="bg-[#F8FBFF] border border-[#B9DCFF] rounded-lg p-3 flex items-center justify-between">
                        <div>
                            <span className="text-xs text-[#6B7C93]">Estimasi Total Anggaran Pos:</span>
                            <div className="text-xs text-[#0A3F82] font-medium">
                                {data.quantity || 1} {data.unit || 'paket'} × {rupiah(data.unit_price || 0)}
                            </div>
                        </div>
                        <div
                            className={`text-lg font-bold font-mono ${
                                data.type === 'income' ? 'text-[#16785B]' : 'text-[#B93664]'
                            }`}
                        >
                            {rupiah(modalLiveSubtotal)}
                        </div>
                    </div>

                    {/* Catatan / Keterangan */}
                    <div>
                        <label className="block text-xs font-bold text-[#0A3F82] mb-1">
                            Catatan / Dasar Asumsi Perhitungan
                        </label>
                        <Textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Catatan tambahan spesifikasi, vendor, atau ketentuan khusus..."
                            rows={2}
                            className="text-xs"
                        />
                        {errors.notes && (
                            <p className="text-[11px] text-rose-500 mt-1">{errors.notes}</p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DCE7F3]">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsModalOpen(false)}
                            disabled={processing}
                            size="sm"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            size="sm"
                            className="bg-[#0B63CE] hover:bg-[#0A3F82] text-white"
                        >
                            {processing ? 'Menyimpan...' : editingItem ? 'Perbarui Anggaran' : 'Simpan ke RAB'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Alert */}
            <AlertDialog
                isOpen={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Hapus Item Anggaran RAB"
                description={`Apakah Anda yakin ingin menghapus "${deleteTarget?.item_name}" (${rupiah(deleteTarget?.amount)}) dari rencana anggaran biaya? Tindakan ini tidak dapat dibatalkan.`}
                confirmLabel="Hapus Item"
                confirmVariant="danger"
            />
        </section>
    );
}
