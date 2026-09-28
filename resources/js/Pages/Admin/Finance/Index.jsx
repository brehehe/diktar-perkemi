import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    BarChart3,
    TrendingDown,
    TrendingUp,
    Wallet,
    Target,
    ArrowUpRight,
    FileSpreadsheet,
    PieChart,
    Download,
    Plus,
    X,
    Receipt,
    Trash2,
    Printer,
    Search,
    RefreshCw,
    FileText,
    Filter,
} from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import FinanceInsights from '../../../Components/admin/FinanceInsights';
import PageHeader from '../../../Components/admin/PageHeader';
import Button from '../../../Components/ui/Button';
import Pagination from '../../../Components/ui/Pagination';
import Select from '../../../Components/ui/Select';
import Modal from '../../../Components/ui/Modal';
import AlertDialog from '../../../Components/ui/AlertDialog';
import Input from '../../../Components/ui/Input';
import Textarea from '../../../Components/ui/Textarea';
import FileInput from '../../../Components/ui/FileInput';

import AddTransactionModal from './Partials/AddTransactionModal';
import { rupiah, CATEGORY_LABELS } from './Partials/financeShared';
import { FinancePageContext } from './Partials/FinancePageContext';
import FinanceOverviewTab from './Partials/FinanceOverviewTab';
import FinanceJournalTab from './Partials/FinanceJournalTab';
import FinanceBreakdownTab from './Partials/FinanceBreakdownTab';
import FinanceEventsTab from './Partials/FinanceEventsTab';

export default function Index({
    transactions = {},
    analysis = {},
    overallAnalysis = null,
    eventSummaries = [],
    categoryBreakdown = { income: [], expense: [] },
    filteredTotals = null,
    events = [],
    filters = {},
    canCreateTransaction = false,
}) {
    const entries = transactions.data || [];
    const activeEventId = filters.event || '';
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'journal' | 'breakdown' | 'events'
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Filter local state
    const [filterForm, setFilterForm] = useState({
        event: filters.event || '',
        type: filters.type || '',
        category: filters.category || '',
        search: filters.search || '',
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
    });

    const applyFilter = (newOverrides = {}) => {
        const query = { ...filterForm, ...newOverrides };
        const cleaned = {};
        Object.entries(query).forEach(([k, v]) => {
            if (v !== '' && v !== null && v !== undefined) {
                cleaned[k] = v;
            }
        });
        router.get('/admin/keuangan', cleaned, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        setFilterForm({
            event: '',
            type: '',
            category: '',
            search: '',
            start_date: '',
            end_date: '',
        });
        router.get('/admin/keuangan', {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        router.delete(`/admin/keuangan/transaksi/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteTarget(null);
                setIsDeleting(false);
            },
            onError: () => setIsDeleting(false),
            onFinish: () => setIsDeleting(false),
        });
    };

    // Query strings for export and print
    const activeQueryParams = new URLSearchParams(
        Object.entries(filters || {}).filter(([_, v]) => v !== null && v !== '' && v !== undefined)
    ).toString();
    const exportUrl = `/admin/keuangan/export${activeQueryParams ? `?${activeQueryParams}` : ''}`;
    const printUrl = `/admin/keuangan/cetak${activeQueryParams ? `?${activeQueryParams}` : ''}`;

    const currentAnalysis = analysis || {};
    const totals = filteredTotals || {
        income: currentAnalysis.income || 0,
        expense: currentAnalysis.expense || 0,
        balance: currentAnalysis.balance || 0,
        sponsor: currentAnalysis.sponsor_amount || 0,
        count: transactions.total || 0,
    };

    const hasActiveFilters = Boolean(
        filters.event || filters.type || filters.category || filters.search || filters.start_date || filters.end_date
    );

    const financePage = {
        transactions,
        analysis,
        overallAnalysis,
        eventSummaries,
        categoryBreakdown,
        events,
        canCreateTransaction,
        entries,
        activeEventId,
        setShowAddModal,
        setDeleteTarget,
        filterForm,
        setFilterForm,
        applyFilter,
        resetFilters,
        currentAnalysis,
        totals,
        hasActiveFilters,
    };

    return (
        <AdminLayout>
            <FinancePageContext.Provider value={financePage}>
            <Head title="Master Keuangan & Analisis Penataran" />
            <div className="space-y-6">
                <PageHeader
                    title="Master Keuangan & Analisis Penataran"
                    description="Pantau transaksi, arus kas, pola pengeluaran, pos neraca kegiatan, dan ekspor dokumen pertanggungjawaban PB PERKEMI."
                    breadcrumbs={[{ label: 'Event', href: '/admin/event' }, { label: 'Master Keuangan' }]}
                    action={
                        <div className="flex flex-wrap items-center gap-2">
                            {canCreateTransaction && (
                                <Button
                                    type="button"
                                    variant="primary"
                                    icon={Plus}
                                    onClick={() => setShowAddModal(true)}
                                    id="btn-tambah-transaksi"
                                >
                                    Tambah Transaksi
                                </Button>
                            )}
                            <Button
                                as="a"
                                href={printUrl}
                                target="_blank"
                                rel="noreferrer"
                                variant="outline"
                                icon={Printer}
                                title="Buka pratinjau cetak dan ekspor ke PDF dokumen resmi"
                            >
                                Cetak Laporan (PDF)
                            </Button>
                            <Button
                                as="a"
                                href={exportUrl}
                                variant="outline"
                                icon={Download}
                                title="Unduh workbook Excel komprehensif 3-sheet"
                            >
                                Ekspor Excel Master
                            </Button>
                            {activeEventId ? (
                                <Button
                                    as={Link}
                                    href={`/admin/event/${activeEventId}/laporan?bagian=finance`}
                                    variant="secondary"
                                    icon={ArrowUpRight}
                                >
                                    Kelola Event Terpilih
                                </Button>
                            ) : null}
                        </div>
                    }
                />

                {/* Sub-Nav Tab Navigation */}
                <div className="border-b border-[#DCE7F3] bg-white px-2 shadow-2xs">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs Laporan Keuangan">
                        <button
                            type="button"
                            onClick={() => setActiveTab('overview')}
                            className={`flex items-center gap-2 border-b-2 py-3.5 text-sm font-semibold transition-colors ${
                                activeTab === 'overview'
                                    ? 'border-[#0B63CE] text-[#0B63CE]'
                                    : 'border-transparent text-[#6B7C93] hover:border-[#DCE7F3] hover:text-[#112743]'
                            }`}
                        >
                            <BarChart3 className="size-4" aria-hidden="true" />
                            Ikhtisar & Analisis
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('journal')}
                            className={`flex items-center gap-2 border-b-2 py-3.5 text-sm font-semibold transition-colors ${
                                activeTab === 'journal'
                                    ? 'border-[#0B63CE] text-[#0B63CE]'
                                    : 'border-transparent text-[#6B7C93] hover:border-[#DCE7F3] hover:text-[#112743]'
                            }`}
                        >
                            <Receipt className="size-4" aria-hidden="true" />
                            Buku Kas & Transaksi
                            <span className="ml-1 rounded-full bg-[#EAF5FF] px-2 py-0.5 text-[11px] font-bold text-[#0B63CE]">
                                {transactions.total || 0}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('breakdown')}
                            className={`flex items-center gap-2 border-b-2 py-3.5 text-sm font-semibold transition-colors ${
                                activeTab === 'breakdown'
                                    ? 'border-[#0B63CE] text-[#0B63CE]'
                                    : 'border-transparent text-[#6B7C93] hover:border-[#DCE7F3] hover:text-[#112743]'
                            }`}
                        >
                            <FileText className="size-4" aria-hidden="true" />
                            Pos Anggaran & Neraca
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('events')}
                            className={`flex items-center gap-2 border-b-2 py-3.5 text-sm font-semibold transition-colors ${
                                activeTab === 'events'
                                    ? 'border-[#0B63CE] text-[#0B63CE]'
                                    : 'border-transparent text-[#6B7C93] hover:border-[#DCE7F3] hover:text-[#112743]'
                            }`}
                        >
                            <Target className="size-4" aria-hidden="true" />
                            Kinerja Tiap Event
                            <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                                {eventSummaries.length}
                            </span>
                        </button>
                    </nav>
                </div>

                {/* Top Metrics Cards */}
                <div className="grid gap-px border border-[#DCE7F3] bg-[#DCE7F3] sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-white p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7C93]">
                                Total Pemasukan
                            </span>
                            <span className="flex size-7 items-center justify-center rounded-full bg-emerald-50 text-[#20A47A]">
                                <TrendingUp className="size-4" aria-hidden="true" />
                            </span>
                        </div>
                        <p className="mt-3 font-display text-2xl font-bold tabular-nums text-[#16785B]">
                            {rupiah(totals.income)}
                        </p>
                        <p className="mt-1 text-xs text-[#6B7C93]">
                            Sponsor, pendaftaran, dan hibah
                        </p>
                    </div>

                    <div className="bg-white p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7C93]">
                                Total Pengeluaran
                            </span>
                            <span className="flex size-7 items-center justify-center rounded-full bg-rose-50 text-[#DD4D7C]">
                                <TrendingDown className="size-4" aria-hidden="true" />
                            </span>
                        </div>
                        <p className="mt-3 font-display text-2xl font-bold tabular-nums text-[#B93664]">
                            {rupiah(totals.expense)}
                        </p>
                        <p className="mt-1 text-xs text-[#6B7C93]">
                            Akomodasi, konsumsi, venue & ATK
                        </p>
                    </div>

                    <div className="bg-white p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7C93]">
                                Saldo Kas Bersih
                            </span>
                            <span className="flex size-7 items-center justify-center rounded-full bg-blue-50 text-[#0B63CE]">
                                <Wallet className="size-4" aria-hidden="true" />
                            </span>
                        </div>
                        <p className={`mt-3 font-display text-2xl font-bold tabular-nums ${totals.balance >= 0 ? 'text-[#0E2747]' : 'text-rose-600'}`}>
                            {rupiah(totals.balance)}
                        </p>
                        <p className="mt-1 text-xs text-[#6B7C93]">
                            {totals.balance >= 0 ? 'Surplus kas tersedia setelah seluruh realisasi' : 'Defisit kas kegiatan'}
                        </p>
                    </div>

                    <div className="bg-white p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7C93]">
                                Realisasi Sponsor
                            </span>
                            <span className="flex size-7 items-center justify-center rounded-full bg-purple-50 text-[#7957D5]">
                                <Target className="size-4" aria-hidden="true" />
                            </span>
                        </div>
                        <p className="mt-3 font-display text-2xl font-bold tabular-nums text-[#7957D5]">
                            {rupiah(totals.sponsor)}
                        </p>
                        <p className="mt-1 text-xs text-[#6B7C93]">
                            {totals.income > 0 ? `${Math.round((totals.sponsor / totals.income) * 100)}% dari total dana` : 'Belum tercatat dana sponsor'}
                        </p>
                    </div>
                </div>

                {/* ─── TAB 1: IKHTISAR & ANALISIS ─── */}
                {activeTab === 'overview' && <FinanceOverviewTab />}

                {/* ─── TAB 2: BUKU KAS & MUTASI TRANSAKSI ─── */}
                {activeTab === 'journal' && <FinanceJournalTab />}

                {/* ─── TAB 3: POS ANGGARAN & NERACA ─── */}
                {activeTab === 'breakdown' && <FinanceBreakdownTab />}

                {/* ─── TAB 4: KINERJA TIAP EVENT ─── */}
                {activeTab === 'events' && <FinanceEventsTab />}
            </div>

            {/* Add Transaction Modal */}
            <AddTransactionModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                events={events}
            />

            {/* Delete Transaction Confirmation Dialog */}
            <AlertDialog
                isOpen={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                loading={isDeleting}
                title="Hapus Transaksi Keuangan?"
                description={`Transaksi "${deleteTarget?.description || ''}" sebesar ${rupiah(deleteTarget?.amount)} (${CATEGORY_LABELS[deleteTarget?.category] || deleteTarget?.category || ''}) pada kegiatan "${deleteTarget?.event_name || ''}" akan dihapus permanen.`}
                confirmText="Hapus Transaksi"
                cancelText="Batal"
                variant="danger"
            />
            </FinancePageContext.Provider>
        </AdminLayout>
    );
}
