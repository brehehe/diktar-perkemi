import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../../Layouts/AdminLayout';
import PageHeader from '../../../../Components/admin/PageHeader';
import Button from '../../../../Components/ui/Button';
import Badge from '../../../../Components/ui/Badge';
import Modal from '../../../../Components/ui/Modal';
import AlertDialog from '../../../../Components/ui/AlertDialog';
import FormField from '../../../../Components/ui/FormField';
import Input from '../../../../Components/ui/Input';
import Select from '../../../../Components/ui/Select';
import Textarea from '../../../../Components/ui/Textarea';
import Combobox from '../../../../Components/ui/Combobox';
import Checkbox from '../../../../Components/ui/Checkbox';
import Radio from '../../../../Components/ui/Radio';
import FileInput from '../../../../Components/ui/FileInput';
import FilterSelect from '../../../../Components/admin/FilterSelect';
import StatGrid from '../../../../Components/admin/StatGrid';
import TableSurface from '../../../../Components/admin/TableSurface';
import TableToolbar from '../../../../Components/admin/TableToolbar';
import {
    FileQuestion,
    FileText,
    Plus,
    Edit3,
    Trash2,
    CheckCircle2,
    Clock,
    Award,
    Eye,
    ChevronRight,
    HelpCircle,
    Check,
    X,
    Layers,
    BookOpen,
    EyeOff,
    Sparkles,
    Upload,
    Download,
    FileSpreadsheet,
} from 'lucide-react';

import { QuestionBankContext } from './Partials/QuestionBankContext';
import QuestionBankDialogs from './Partials/QuestionBankDialogs';

export default function Index({
    questions,
    questionModules = [],
    learningModules = [],
    materials = [],
    tracks = [],
    stats = {},
    filters = {},
    events = [],
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedModule, setSelectedModule] = useState(filters.module_id && filters.module_id !== 'all' ? filters.module_id : '');
    const [selectedType, setSelectedType] = useState(filters.type && filters.type !== 'all' ? filters.type : '');
    const [selectedDifficulty, setSelectedDifficulty] = useState(filters.difficulty && filters.difficulty !== 'all' ? filters.difficulty : '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status && filters.status !== 'all' ? filters.status : '');
    const [selectedTrack, setSelectedTrack] = useState(filters.track && filters.track !== 'all' ? filters.track : '');
    const [selectedScope, setSelectedScope] = useState(filters.scope || '');

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [previewQuestion, setPreviewQuestion] = useState(null);
    const [activeQuestion, setActiveQuestion] = useState(null);
    const [questionToDelete, setQuestionToDelete] = useState(null);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

    const importForm = useForm({
        file: null,
        event_id: '',
        question_module_id: '',
    });

    // Form
    const form = useForm({
        code: '',
        question_module_ids: questionModules[0] ? [questionModules[0].id] : [],
        question_text: '',
        question_type: 'single_choice', // single_choice, true_false, essay
        options: [
            { key: 'A', text: '' },
            { key: 'B', text: '' },
            { key: 'C', text: '' },
            { key: 'D', text: '' },
        ],
        correct_answer: 'A',
        points: 1.0,
        difficulty_level: 'basic',
        explanation: '',
        learning_module_id: '',
        material_id: '',
        status: 'active',
        event_id: '',
    });

    const applyFilters = (overrides = {}) => {
        router.get(
            '/admin/master/bank-soal',
            {
                search: searchTerm,
                module_id: selectedModule,
                type: selectedType,
                difficulty: selectedDifficulty,
                status: selectedStatus,
                track: selectedTrack,
                scope: selectedScope,
                ...overrides,
            },
            { preserveState: true, replace: true }
        );
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedModule('');
        setSelectedType('');
        setSelectedDifficulty('');
        setSelectedStatus('');
        setSelectedTrack('');
        setSelectedScope('');
        router.get('/admin/master/bank-soal', {}, { preserveState: true, replace: true });
    };

    const openCreateModal = () => {
        form.reset();
        form.setData({
            code: 'BS-' + Math.floor(1000 + Math.random() * 9000),
            question_module_ids: selectedModule ? [Number(selectedModule)] : questionModules[0] ? [questionModules[0].id] : [],
            question_text: '',
            question_type: 'single_choice',
            options: [
                { key: 'A', text: '' },
                { key: 'B', text: '' },
                { key: 'C', text: '' },
                { key: 'D', text: '' },
            ],
            correct_answer: 'A',
            points: 1.0,
            difficulty_level: 'basic',
            explanation: '',
            learning_module_id: '',
            material_id: '',
            status: 'active',
            event_id: '',
        });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (q) => {
        setActiveQuestion(q);
        form.setData({
            code: q.code,
            question_module_ids: q.question_modules?.map((module) => module.id) || [q.question_module_id],
            question_text: q.question_text,
            question_type: q.question_type,
            options: q.options && q.options.length ? q.options : [{ key: 'A', text: '' }, { key: 'B', text: '' }],
            correct_answer: q.correct_answer || 'A',
            points: q.points || 1.0,
            difficulty_level: q.difficulty_level || 'basic',
            explanation: q.explanation || '',
            learning_module_id: q.learning_module_id || '',
            material_id: q.material_id || '',
            status: q.status || 'active',
            event_id: q.event_id ? String(q.event_id) : '',
        });
        setIsEditModalOpen(true);
    };

    const handleSaveCreate = (e) => {
        e.preventDefault();
        form.post('/admin/master/bank-soal', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                form.reset();
            },
        });
    };

    const handleSaveEdit = (e) => {
        e.preventDefault();
        if (!activeQuestion) return;
        form.put(`/admin/master/bank-soal/${activeQuestion.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setActiveQuestion(null);
            },
        });
    };

    const handleDelete = (q) => {
        setQuestionToDelete(q);
    };

    const handleOptionTextChange = (index, text) => {
        const updated = [...form.data.options];
        updated[index].text = text;
        form.setData('options', updated);
    };

    const toggleQuestionModule = (moduleId) => {
        const selectedIds = form.data.question_module_ids;
        form.setData('question_module_ids', selectedIds.includes(moduleId)
            ? selectedIds.filter((id) => id !== moduleId)
            : [...selectedIds, moduleId]);
    };

    const addOption = () => {
        const nextChar = String.fromCharCode(65 + form.data.options.length);
        form.setData('options', [...form.data.options, { key: nextChar, text: '' }]);
    };

    const removeOption = (index) => {
        if (form.data.options.length <= 2) return;
        const updated = form.data.options.filter((_, i) => i !== index);
        // re-key
        const reKeyed = updated.map((opt, i) => ({
            key: String.fromCharCode(65 + i),
            text: opt.text,
        }));
        form.setData('options', reKeyed);
    };

    const setQuestionType = (type) => {
        if (type === 'true_false') {
            form.setData({
                ...form.data,
                question_type: type,
                options: [
                    { key: 'A', text: 'Benar' },
                    { key: 'B', text: 'Salah' },
                ],
                correct_answer: 'A',
            });
        } else if (type === 'essay') {
            form.setData({
                ...form.data,
                question_type: type,
                options: [],
                correct_answer: null,
            });
        } else {
            form.setData({
                ...form.data,
                question_type: 'single_choice',
                options: [
                    { key: 'A', text: '' },
                    { key: 'B', text: '' },
                    { key: 'C', text: '' },
                    { key: 'D', text: '' },
                ],
                correct_answer: 'A',
            });
        }
    };

    const dialogContext = {
        questionModules,
        events,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isEditModalOpen,
        setIsEditModalOpen,
        isPreviewModalOpen,
        setIsPreviewModalOpen,
        isImportModalOpen,
        setIsImportModalOpen,
        previewQuestion,
        activeQuestion,
        setActiveQuestion,
        questionToDelete,
        setQuestionToDelete,
        selectedQuestionIds,
        setSelectedQuestionIds,
        isDeleting,
        setIsDeleting,
        isBulkDeleting,
        setIsBulkDeleting,
        isBulkDeleteDialogOpen,
        setIsBulkDeleteDialogOpen,
        importForm,
        form,
        handleSaveCreate,
        handleSaveEdit,
        handleOptionTextChange,
        toggleQuestionModule,
        addOption,
        removeOption,
        setQuestionType,
    };

    return (
        <QuestionBankContext.Provider value={dialogContext}>
        <AdminLayout title="Master Bank Soal">
            <Head title="Master Bank Soal — Admin PERKEMI" />

            <PageHeader
                title="Master Bank Soal"
                description="Kelola butir soal terstandar yang dapat digunakan di beberapa Modul Soal dan Paket CBT."
                breadcrumbs={[{ label: 'Event', href: '/admin/event' }, { label: 'Bank Soal' }]}
                action={
                    <div className="flex flex-wrap items-center gap-2">
                        <a
                            href={`/admin/master/bank-soal/ekspor${selectedScope ? `?scope=${selectedScope}` : ''}`}
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#DCE7F3] bg-white px-3 py-1.5 text-xs font-semibold text-[#0E2747] shadow-2xs hover:bg-[#F8FBFF] hover:border-[#0B63CE]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                        >
                            <Download className="w-3.5 h-3.5 text-[#0B63CE]" />
                            <span>Ekspor CSV</span>
                        </a>
                        <a
                            href="/admin/master/bank-soal/template"
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#DCE7F3] bg-white px-3 py-1.5 text-xs font-semibold text-[#0E2747] shadow-2xs hover:bg-[#F8FBFF] hover:border-[#0B63CE]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                            download="template-bank-soal.csv"
                        >
                            <Download className="w-3.5 h-3.5 text-[#0B63CE]" />
                            <span>Format CSV</span>
                        </a>
                        <Button
                            size="sm"
                            variant="secondary"
                            icon={Upload}
                            onClick={() => {
                                importForm.reset();
                                importForm.clearErrors();
                                setIsImportModalOpen(true);
                            }}
                        >
                            Impor Soal
                        </Button>
                        <Button size="sm" icon={Plus} onClick={openCreateModal}>
                            Tambah Soal
                        </Button>
                    </div>
                }
            />

            <StatGrid className="mb-6" items={[
                { key: 'total', label: 'Total Bank Soal', value: stats.total || 0, description: 'Butir pertanyaan terdaftar', icon: FileQuestion, tone: 'blue' },
                { key: 'active', label: 'Soal Aktif', value: stats.active || 0, description: 'Butir yang siap diujikan', icon: CheckCircle2, tone: 'green' },
                { key: 'choice', label: 'Pilihan Ganda', value: stats.single_choice || 0, description: 'Soal dengan penilaian otomatis', icon: Check, tone: 'navy' },
                { key: 'essay', label: 'Soal Esai', value: stats.essay || 0, description: 'Soal dengan penilaian manual', icon: FileText, tone: 'purple' },
            ]} />

            <div className="mb-6 overflow-hidden rounded-xl border border-[#DCE7F3] bg-white shadow-xs">
                <TableToolbar
                    search={searchTerm}
                    onSearchChange={setSearchTerm}
                    onSearchSubmit={() => applyFilters()}
                    searchPlaceholder="Cari teks soal atau kode…"
                    searchLabel="Cari bank soal"
                    hasActiveFilters={Boolean(searchTerm || selectedModule || selectedType || selectedDifficulty || selectedStatus || selectedTrack || selectedScope)}
                    onReset={resetFilters}
                >
                    <FilterSelect
                        value={selectedScope}
                        onChange={(value) => {
                            setSelectedScope(value);
                            applyFilters({ scope: value });
                        }}
                        placeholder="Semua Cakupan"
                        ariaLabel="Filter cakupan event atau nasional"
                        options={[
                            { value: 'master', label: 'Master Diktar (Lintas Event)' },
                            ...events.map((ev) => ({
                                value: String(ev.id),
                                label: `Event: ${ev.title}`,
                            })),
                        ]}
                    />
                    <Combobox
                        value={selectedModule}
                        onChange={(value) => {
                            setSelectedModule(value);
                            applyFilters({ module_id: value });
                        }}
                        options={questionModules.map((module) => ({ value: module.id, label: `[${module.code}] ${module.title}` }))}
                        placeholder="Semua Modul Soal"
                        searchPlaceholder="Cari modul soal…"
                        emptyText="Modul soal tidak ditemukan."
                        className="min-w-64 md:w-72"
                    />
                    <FilterSelect value={selectedType} onChange={(value) => {
                        setSelectedType(value);
                        applyFilters({ type: value });
                    }} placeholder="Semua Tipe" ariaLabel="Filter tipe soal" options={[
                        { value: 'single_choice', label: 'Pilihan Ganda' },
                        { value: 'true_false', label: 'Benar / Salah' },
                        { value: 'essay', label: 'Esai' },
                    ]} />
                    <FilterSelect value={selectedDifficulty} onChange={(value) => {
                        setSelectedDifficulty(value);
                        applyFilters({ difficulty: value });
                    }} placeholder="Semua Tingkat" ariaLabel="Filter kesulitan soal" options={[
                        { value: 'basic', label: 'Dasar' },
                        { value: 'intermediate', label: 'Menengah' },
                        { value: 'advanced', label: 'Lanjutan' },
                    ]} />
                    <FilterSelect value={selectedStatus} onChange={(value) => {
                        setSelectedStatus(value);
                        applyFilters({ status: value });
                    }} placeholder="Semua Status" ariaLabel="Filter status soal" options={[
                        { value: 'active', label: 'Aktif' },
                        { value: 'draft', label: 'Draft' },
                        { value: 'inactive', label: 'Nonaktif' },
                    ]} />
                    {tracks.length > 0 && <FilterSelect value={selectedTrack} onChange={(value) => {
                        setSelectedTrack(value);
                        applyFilters({ track: value });
                    }} placeholder="Semua Jalur" ariaLabel="Filter jalur soal" options={tracks.map((track) => ({ value: track.code, label: `${track.code} — ${track.name}` }))} />}
                </TableToolbar>
            </div>

            {/* Bulk Actions Banner */}
            {selectedQuestionIds.length > 0 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 mb-4 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 text-xs font-medium">
                        <span className="font-bold font-mono px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                            {selectedQuestionIds.length}
                        </span>
                        <span>butir soal dipilih</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            size="xs"
                            onClick={() => setSelectedQuestionIds([])}
                        >
                            Batal Pilih
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
                            size="xs"
                            icon={Trash2}
                            onClick={() => setIsBulkDeleteDialogOpen(true)}
                        >
                            Hapus ({selectedQuestionIds.length}) Soal Terpilih
                        </Button>
                    </div>
                </div>
            )}

            {/* Table of Question Bank */}
            <TableSurface pagination={questions} ariaLabel="Daftar bank soal">
                <table className="w-full text-left text-xs text-[#112743]">
                        <thead className="bg-[#F8FBFF] text-[#6B7C93] uppercase font-mono text-[10px] tracking-wider border-b border-[#DCE7F3]">
                            <tr>
                                <th className="px-3 py-3 w-10 text-center">
                                    <input
                                        type="checkbox"
                                        aria-label="Pilih semua soal pada halaman ini"
                                        className="rounded border-[#DCE7F3] text-[#0B63CE] focus:ring-[#0B63CE]/20 cursor-pointer"
                                        checked={questions.data.length > 0 && selectedQuestionIds.length === questions.data.length}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedQuestionIds(questions.data.map((q) => q.id));
                                            } else {
                                                setSelectedQuestionIds([]);
                                            }
                                        }}
                                    />
                                </th>
                                <th className="px-4 py-3">Kode</th>
                                <th className="px-4 py-3">Pertanyaan Ringkas</th>
                                <th className="px-4 py-3">Modul Soal</th>
                                <th className="px-4 py-3">Tipe</th>
                                <th className="px-4 py-3">Kesulitan</th>
                                <th className="px-4 py-3 text-center">Poin</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DCE7F3]">
                            {questions.data.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-12 text-center text-[#6B7C93]">
                                        <FileQuestion className="w-8 h-8 mx-auto text-[#6B7C93]/40 mb-2" />
                                        <p className="font-semibold text-sm text-[#0E2747]">Belum ada butir soal.</p>
                                        <p className="text-xs text-[#6B7C93] mt-1">
                                            Buat butir pertanyaan baru yang terhubung ke Modul Soal.
                                        </p>
                                        <Button onClick={openCreateModal} size="sm" className="mt-3 bg-[#0B63CE] text-white">
                                            Tambah Soal Sekarang
                                        </Button>
                                    </td>
                                </tr>
                            ) : (
                                questions.data.map((q) => (
                                    <tr key={q.id} className="hover:bg-[#F8FBFF]/60 transition-colors">
                                        <td className="px-3 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                aria-label={`Pilih soal ${q.code}`}
                                                className="rounded border-[#DCE7F3] text-[#0B63CE] focus:ring-[#0B63CE]/20 cursor-pointer"
                                                checked={selectedQuestionIds.includes(q.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedQuestionIds([...selectedQuestionIds, q.id]);
                                                    } else {
                                                        setSelectedQuestionIds(selectedQuestionIds.filter((id) => id !== q.id));
                                                    }
                                                }}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="font-mono font-bold text-[#0B63CE]">{q.code}</span>
                                                {q.event ? (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 mt-1 max-w-fit">
                                                        🎯 {q.event.title}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mt-1 max-w-fit">
                                                        🌐 Master Diktar
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-[#0E2747] line-clamp-2 max-w-md">
                                                {q.question_text}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1.5">
                                                {q.question_modules?.map((module) => (
                                                    <span key={module.id} className="inline-block rounded border border-[#DCE7F3] px-2 py-1 font-medium text-[#0E2747]" title={module.title}>
                                                        {module.code} <span className="font-normal">— {module.title}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700">
                                                {q.question_type_label || q.question_type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="capitalize text-xs font-semibold text-[#6B7C93]">
                                                {q.difficulty_label || q.difficulty_level}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center font-mono font-bold text-[#0E2747]">
                                            {q.points}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={q.status === 'active' ? 'success' : 'secondary'}>
                                                {q.status_label || q.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPreviewQuestion(q);
                                                        setIsPreviewModalOpen(true);
                                                    }}
                                                    className="p-1.5 text-[#6B7C93] hover:text-[#0B63CE] hover:bg-slate-100 rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                                                    title="Preview Soal"
                                                    aria-label={`Pratinjau soal ${q.code}`}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(q)}
                                                    className="p-1.5 text-[#6B7C93] hover:text-[#0E2747] hover:bg-slate-100 rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                                                    title="Edit Soal"
                                                    aria-label={`Edit soal ${q.code}`}
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(q)}
                                                    className="p-1.5 text-[#6B7C93] hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"
                                                    title="Hapus"
                                                    aria-label={`Hapus soal ${q.code}`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                </table>
            </TableSurface>

            <QuestionBankDialogs />
        </AdminLayout>
        </QuestionBankContext.Provider>
    );
}
