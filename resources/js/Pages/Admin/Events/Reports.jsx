import React, { useEffect, useMemo, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
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
    FileText,
    CheckCircle2,
    Clock,
} from 'lucide-react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/admin/PageHeader';
import Button from '../../../Components/ui/Button';
import FinanceInsights from '../../../Components/admin/FinanceInsights';
import Input from '../../../Components/ui/Input';
import Select from '../../../Components/ui/Select';
import Textarea from '../../../Components/ui/Textarea';
import FileInput from '../../../Components/ui/FileInput';
import AlertDialog from '../../../Components/ui/AlertDialog';

import { rupiah, CATEGORY_LABELS } from './Partials/EventReportsPageShared';
import { EventReportsPageContext } from './Partials/EventReportsPageContext';
import EventReportsExportsTab from './Partials/EventReportsExportsTab';
import EventReportsFinanceTab from './Partials/EventReportsFinanceTab';
import EventReportsActivityTab from './Partials/EventReportsActivityTab';
import EventReportsStaffTab from './Partials/EventReportsStaffTab';

export default function Reports({
    event,
    finances = [],
    financeAnalysis,
    activities = [],
    staff = [],
    staffCandidates = [],
    sessions = [],
    outcomesSummary = {},
    permissions = {},
}) {
    const tabs = useMemo(() => [
        { id: 'exports', label: 'Rekap & Ekspor Excel' },
        ...(permissions.view_finance ? [{ id: 'finance', label: 'Laporan Keuangan' }] : []),
        { id: 'realisation', label: 'Realisasi Acara' },
        { id: 'documentation', label: 'Dokumentasi Kegiatan' },
        ...(permissions.manage_staff ? [{ id: 'staff', label: 'Kluster Petugas' }] : []),
    ], [permissions]);

    const [activeTab, setActiveTab] = useState(() => {
        const requestedTab = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('bagian');
        return tabs.some((tab) => tab.id === requestedTab) ? requestedTab : (tabs[0]?.id || 'exports');
    });

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

    useEffect(() => {
        const hasUnsavedChanges = financeForm.isDirty || activityForm.isDirty || staffForm.isDirty;
        const warnBeforeLeaving = (e) => {
            if (!hasUnsavedChanges) return;
            e.preventDefault();
            e.returnValue = '';
        };

        window.addEventListener('beforeunload', warnBeforeLeaving);
        return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
    }, [activityForm.isDirty, financeForm.isDirty, staffForm.isDirty]);

    const focusFirstError = () => window.setTimeout(() => document.querySelector('[aria-invalid="true"]')?.focus(), 0);

    const selectTab = (tabId) => {
        setActiveTab(tabId);
        const url = new URL(window.location.href);
        url.searchParams.set('bagian', tabId);
        window.history.replaceState({}, '', url);

        if (['realisation', 'documentation'].includes(tabId)) {
            resetActivity(tabId);
        }
    };

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
            onError: focusFirstError,
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
        setActiveTab(record.kind);
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
            onError: focusFirstError,
        });
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        router.delete(deleteTarget.url, {
            preserveScroll: true,
            onFinish: () => setDeleteTarget(null),
        });
    };

    const activityList = activities.filter((record) => record.kind === activeTab);
    const canManageActiveActivity =
        activeTab === 'realisation' ? permissions.manage_realisation : permissions.manage_documentation;

    const reportPage = {
        event,
        finances,
        financeAnalysis,
        staff,
        staffCandidates,
        sessions,
        outcomesSummary,
        permissions,
        activeTab,
        editingFinance,
        editingActivity,
        setDeleteTarget,
        financeForm,
        activityForm,
        staffForm,
        focusFirstError,
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
        <AdminLayout>
            <EventReportsPageContext.Provider value={reportPage}>
            <Head title={`Pusat Laporan — ${event.name}`} />
            <div className="space-y-6">
                <PageHeader
                    title="Pusat Laporan & Keuangan Event"
                    description={`${event.name} · ${event.date_formatted} · ${event.place}`}
                    breadcrumbs={[
                        { label: 'Event', href: '/admin/event' },
                        { label: event.name, href: permissions.manage_staff ? `/admin/event/${event.id}` : undefined },
                        { label: 'Laporan' },
                    ]}
                    action={
                        <div className="flex flex-wrap gap-2">
                            {permissions.manage_staff && (
                                <Button as={Link} href={`/admin/event/${event.id}`} variant="secondary">
                                    Detail Event
                                </Button>
                            )}
                            <Button as={Link} href="/admin/keuangan" variant="outline">
                                Master Keuangan
                            </Button>
                        </div>
                    }
                />

                {/* Sub-navigation tabs */}
                <div className="border-y border-[#DCE7F3] bg-white px-2">
                    <nav aria-label="Bagian laporan event" className="flex overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                aria-pressed={activeTab === tab.id}
                                onClick={() => selectTab(tab.id)}
                                className={`min-h-12 shrink-0 border-b-2 px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-[#0B63CE] text-[#0B63CE]'
                                        : 'border-transparent text-[#6B7C93] hover:text-[#112743]'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* TAB 1: REKAP & EKSPOR EXCEL */}
                {activeTab === 'exports' && <EventReportsExportsTab />}

                {/* TAB 2: LAPORAN KEUANGAN & AI DATA MINING (KLUSTER BENDAHARA) */}
                {activeTab === 'finance' && financeAnalysis && <EventReportsFinanceTab />}

                {/* TAB 3 & 4: REALISASI ACARA & DOKUMENTASI (KLUSTER SIE ACARA & DOKUMENTASI) */}
                {['realisation', 'documentation'].includes(activeTab) && <EventReportsActivityTab />}

                {/* TAB 5: KLUSTER PETUGAS (PENUGASAN BENDAHARA, ACARA, DOKUMENTASI) */}
                {activeTab === 'staff' && permissions.manage_staff && <EventReportsStaffTab />}
            </div>

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
            </EventReportsPageContext.Provider>
        </AdminLayout>
    );
}
