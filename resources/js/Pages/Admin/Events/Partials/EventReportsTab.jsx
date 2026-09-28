import React, { useState, useEffect, useMemo } from 'react';
import { useForm, router } from '@inertiajs/react';
import {
    BarChart3,
    CalendarCheck,
    Download,
    FileCheck2,
    FileSpreadsheet,
    Pencil,
    Plus,
    Trash2,
    Users,
    Shield,
    Camera,
    Calendar,
    Wallet,
    TrendingDown,
    PieChart,
} from 'lucide-react';
import Button from '../../../../Components/ui/Button';
import FinanceInsights from '../../../../Components/admin/FinanceInsights';
import Input from '../../../../Components/ui/Input';
import Select from '../../../../Components/ui/Select';
import Textarea from '../../../../Components/ui/Textarea';
import FileInput from '../../../../Components/ui/FileInput';
import AlertDialog from '../../../../Components/ui/AlertDialog';

import { rupiah, CATEGORY_LABELS } from './EventReportsTabShared';
import { EventReportsTabContext } from './EventReportsTabContext';
import EventReportSummaryPanel from './EventReportSummaryPanel';
import EventReportFinancePanel from './EventReportFinancePanel';
import EventReportActivityPanel from './EventReportActivityPanel';
import EventReportStaffPanel from './EventReportStaffPanel';

export default function EventReportsTab({
    event,
    finances = [],
    financeAnalysis = null,
    activities = [],
    staff = [],
    staffCandidates = [],
    sessions = [],
    outcomesSummary = {},
    permissions = {},
    initialSubTab = 'rekap',
    onSubTabChange = null,
}) {
    const subTabs = useMemo(() => [
        { id: 'rekap', label: 'Rekap & Ekspor' },
        ...((permissions?.view_finance || financeAnalysis) ? [{ id: 'finance', label: 'Laporan Keuangan' }] : []),
        { id: 'realisation', label: 'Realisasi Acara' },
        { id: 'documentation', label: 'Dokumentasi Kegiatan' },
        ...(permissions?.manage_staff ? [{ id: 'staff', label: 'Petugas Event' }] : []),
    ], [permissions, financeAnalysis]);

    const [subTab, setSubTab] = useState(initialSubTab || 'rekap');

    useEffect(() => {
        if (initialSubTab) {
            setSubTab(initialSubTab);
        }
    }, [initialSubTab]);

    const handleSelectSubTab = (newSubTab) => {
        setSubTab(newSubTab);
        if (['realisation', 'documentation'].includes(newSubTab)) {
            resetActivity(newSubTab);
        }
        if (onSubTabChange) {
            onSubTabChange(newSubTab);
        }
    };

    const [editingFinance, setEditingFinance] = useState(null);
    const [editingActivity, setEditingActivity] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const financeForm = useForm({
        type: 'expense',
        category: 'consumption',
        description: '',
        sponsor_name: '',
        amount: '',
        occurred_on: '',
        evidence: null,
    });

    const activityForm = useForm({
        kind: 'realisation',
        title: '',
        activity_type: '',
        occurred_on: '',
        event_session_id: '',
        notes: '',
        media: null,
    });

    const staffForm = useForm({
        user_id: '',
        duty: 'bendahara',
    });

    const resetFinance = () => {
        setEditingFinance(null);
        financeForm.reset();
        financeForm.clearErrors();
    };

    const editFinance = (entry) => {
        setEditingFinance(entry);
        financeForm.setData({
            type: entry.type,
            category: entry.category,
            description: entry.description,
            sponsor_name: entry.sponsor_name || '',
            amount: entry.amount,
            occurred_on: entry.occurred_on,
            evidence: null,
        });
    };

    const submitFinance = (e) => {
        e.preventDefault();
        const url = editingFinance
            ? `/admin/event/${event.id}/laporan/keuangan/${editingFinance.id}`
            : `/admin/event/${event.id}/laporan/keuangan`;
        financeForm.post(url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: resetFinance,
        });
    };

    const resetActivity = (kind = activityForm.data.kind) => {
        setEditingActivity(null);
        activityForm.setData({
            kind,
            title: '',
            activity_type: '',
            occurred_on: '',
            event_session_id: '',
            notes: '',
            media: null,
        });
        activityForm.clearErrors();
    };

    const editActivity = (record) => {
        setEditingActivity(record);
        activityForm.setData({
            kind: record.kind,
            title: record.title,
            activity_type: record.activity_type,
            occurred_on: record.occurred_on,
            event_session_id: record.session_id || '',
            notes: record.notes || '',
            media: null,
        });
        setSubTab(record.kind);
    };

    const submitActivity = (e) => {
        e.preventDefault();
        const url = editingActivity
            ? `/admin/event/${event.id}/laporan/kegiatan/${editingActivity.id}`
            : `/admin/event/${event.id}/laporan/kegiatan`;
        activityForm.post(url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => resetActivity(activityForm.data.kind),
        });
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        router.delete(deleteTarget.url, {
            preserveScroll: true,
            onFinish: () => setDeleteTarget(null),
        });
    };

    const activityList = activities.filter((record) => record.kind === subTab);
    const canManageActiveActivity =
        subTab === 'realisation' ? permissions.manage_realisation : permissions.manage_documentation;

    const reportPanel = {
        event,
        finances,
        financeAnalysis,
        staff,
        staffCandidates,
        sessions,
        outcomesSummary,
        permissions,
        subTab,
        editingFinance,
        editingActivity,
        setDeleteTarget,
        financeForm,
        activityForm,
        staffForm,
        resetFinance,
        editFinance,
        submitFinance,
        resetActivity,
        editActivity,
        submitActivity,
        activityList,
        canManageActiveActivity,
    };

    return (
        <EventReportsTabContext.Provider value={reportPanel}>
        <div className="space-y-6">
            {/* Sub-tab Navigation */}
            <div className="flex overflow-x-auto rounded-lg border border-[#DCE7F3] bg-white p-1 shadow-2xs">
                {subTabs.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectSubTab(item.id)}
                        className={`min-h-10 shrink-0 rounded-md px-4 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#0B63CE] ${
                            subTab === item.id
                                ? 'bg-[#0B63CE] text-white shadow-xs'
                                : 'text-[#6B7C93] hover:text-[#112743] hover:bg-[#F8FBFF]'
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {/* 1. REKAP & EKSPOR EXCEL */}
            {subTab === 'rekap' && <EventReportSummaryPanel />}

            {/* 2. LAPORAN KEUANGAN (KLUSTER BENDAHARA) */}
            {subTab === 'finance' && financeAnalysis && <EventReportFinancePanel />}

            {/* 3 & 4. REALISASI ACARA & DOKUMENTASI (KLUSTER SIE ACARA & DOKUMENTASI) */}
            {['realisation', 'documentation'].includes(subTab) && <EventReportActivityPanel />}

            {/* 5. KLUSTER PETUGAS */}
            {subTab === 'staff' && permissions.manage_staff && <EventReportStaffPanel />}

            <AlertDialog
                isOpen={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                title="Hapus data?"
                description={`Data “${deleteTarget?.label || ''}” akan dihapus.`}
                confirmText="Hapus"
                cancelText="Batal"
                variant="danger"
            />
        </div>
        </EventReportsTabContext.Provider>
    );
}
