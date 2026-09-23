import React, { useState, useMemo, useEffect } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import PageHeader from '../../../Components/admin/PageHeader';
import Button from '../../../Components/ui/Button';
import Badge from '../../../Components/ui/Badge';
import Modal from '../../../Components/ui/Modal';
import FormField from '../../../Components/ui/FormField';
import Input from '../../../Components/ui/Input';
import Select from '../../../Components/ui/Select';
import Textarea from '../../../Components/ui/Textarea';
import Checkbox from '../../../Components/ui/Checkbox';
import Combobox from '../../../Components/ui/Combobox';
import FileInput from '../../../Components/ui/FileInput';
import AlertDialog from '../../../Components/ui/AlertDialog';
import Tabs from '../../../Components/admin/Tabs';
import StatGrid from '../../../Components/admin/StatGrid';
import TableSurface from '../../../Components/admin/TableSurface';
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    Edit3,
    ExternalLink,
    BookOpen,
    Layers,
    Award,
    CheckCircle,
    UserCheck,
    FileText,
    Shield,
    FileCheck,
    Settings,
    Plus,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
    HelpCircle,
    AlertCircle,
    Eye,
    GraduationCap,
    Grid,
    List,
    Building,
    Check,
    X,
    Sparkles,
    QrCode,
    Printer,
    PlayCircle,
    CheckCircle2,
    Lock,
    Unlock,
    Activity,
    AlertTriangle,
    RotateCcw,
    Save,
    FileSpreadsheet,
    Download,
    Upload,
    FileEdit,
} from 'lucide-react';

export default function Show({
    event,
    modules = [],
    learningModules = [],
    linkedCbtPackages = [],
    availableMasterModules = [],
    availableMasterCbtPackages = [],
    availableQuestionModules = [],
    sessionsByDay = {},
    arrivalSession = null,
    speakers = [],
    rooms = [],
    participants = [],
    availableParticipants = [],
    attendances = [],
    cbtPackages = [],
    examRevisions = [],
    proctoringEvents = [],
    tracks = [],
    sessionTypes = [],
    legends = [],
    publishedMaterials = [],
    stats = {},
    documentNumberLabels = {},
    documentNumberDefaults = {},
    documentNumberOverrides = {},
    registrationForms = [],
}) {
    const isPortalAdmin = usePage().props.auth?.user?.is_admin;
    // Active tab state (Exact 10 Tabs)
    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window === 'undefined') return 'ringkasan';
        const requested = new URLSearchParams(window.location.search).get('tab');
        return ['ringkasan', 'rundown', 'peserta', 'formulir', 'absensi', 'pemateri', 'sertifikat', 'revisi', 'pengawasan', 'legenda', 'dokumen', 'pengaturan', 'ruang', 'modul_cbt', 'materi', 'cbt'].includes(requested) ? requested : 'ringkasan';
    });
    useEffect(() => {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', activeTab);
        window.history.replaceState(window.history.state, '', url);
    }, [activeTab]);
    const [selectedDay, setSelectedDay] = useState(1);
    const [rundownTrackFilter, setRundownTrackFilter] = useState('all');
    const [attendanceSessionFilter, setAttendanceSessionFilter] = useState('all');
    const [credentialSearch, setCredentialSearch] = useState('');
    const [participantSearch, setParticipantSearch] = useState('');
    const [participantTrackFilter, setParticipantTrackFilter] = useState('all');
    const [participantCheckinFilter, setParticipantCheckinFilter] = useState('all');
    const [participantPerPage, setParticipantPerPage] = useState(25);
    const [participantPage, setParticipantPage] = useState(() => {
        if (typeof window === 'undefined') return 1;
        const pageParam = parseInt(new URLSearchParams(window.location.search).get('page'), 10);
        return !isNaN(pageParam) && pageParam > 0 ? pageParam : 1;
    });

    // Formulir Pendaftaran states
    const [formSearch, setFormSearch] = useState('');
    const [formTrackFilter, setFormTrackFilter] = useState('all');
    const [formStatusFilter, setFormStatusFilter] = useState('all');
    const [formPage, setFormPage] = useState(1);
    const [formPerPage, setFormPerPage] = useState(25);
    const [selectedFormForModal, setSelectedFormForModal] = useState(null);
    const [isVerifyingForm, setIsVerifyingForm] = useState(false);
    const [uploadModalParticipant, setUploadModalParticipant] = useState(null);
    const [adminUploadFile, setAdminUploadFile] = useState(null);
    const [adminUploadFormType, setAdminUploadFormType] = useState('PELATIH');
    const [adminUploadPenataranLevel, setAdminUploadPenataranLevel] = useState('Daerah');
    const [adminUploadAutoVerify, setAdminUploadAutoVerify] = useState(true);
    const [adminUploadNotes, setAdminUploadNotes] = useState('');
    const [isAdminUploading, setIsAdminUploading] = useState(false);

    const handleAdminUploadSubmit = (e) => {
        e.preventDefault();
        if (!adminUploadFile) {
            alert('Silakan pilih file formulir terlebih dahulu.');
            return;
        }
        setIsAdminUploading(true);
        const formData = new FormData();
        formData.append('file', adminUploadFile);
        formData.append('participant_id', uploadModalParticipant.participant_id);
        formData.append('form_type', adminUploadFormType);
        formData.append('penataran_level', adminUploadPenataranLevel);
        if (adminUploadAutoVerify) formData.append('verified', '1');
        if (adminUploadNotes) formData.append('notes', adminUploadNotes);

        router.post(route('event.registration-form.admin-upload', event.id), formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAdminUploading(false);
                setUploadModalParticipant(null);
                setAdminUploadFile(null);
                setAdminUploadNotes('');
            },
            onError: () => {
                setIsAdminUploading(false);
            },
        });
    };

    const filteredRegistrationForms = useMemo(() => {
        return registrationForms.filter((rf) => {
            const matchesSearch = !formSearch ||
                rf.participant_name?.toLowerCase().includes(formSearch.toLowerCase()) ||
                rf.kenshi_id_number?.toLowerCase().includes(formSearch.toLowerCase()) ||
                rf.dan_level?.toLowerCase().includes(formSearch.toLowerCase()) ||
                rf.origin_dojo?.toLowerCase().includes(formSearch.toLowerCase());

            const matchesTrack = formTrackFilter === 'all' ||
                rf.track_code?.toLowerCase().includes(formTrackFilter.toLowerCase()) ||
                rf.form_type?.toLowerCase() === formTrackFilter.toLowerCase();

            const matchesStatus = formStatusFilter === 'all' || rf.status === formStatusFilter;

            return matchesSearch && matchesTrack && matchesStatus;
        });
    }, [registrationForms, formSearch, formTrackFilter, formStatusFilter]);

    const totalFormPages = Math.max(1, Math.ceil(filteredRegistrationForms.length / formPerPage));
    const paginatedRegistrationForms = useMemo(() => {
        const start = (formPage - 1) * formPerPage;
        return filteredRegistrationForms.slice(start, start + formPerPage);
    }, [filteredRegistrationForms, formPage, formPerPage]);

    const handleVerifyForm = (formId) => {
        if (!formId) return;
        setIsVerifyingForm(true);
        router.post(`/admin/event/${event.id}/formulir/${formId}/verifikasi`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setIsVerifyingForm(false);
                if (selectedFormForModal) {
                    setSelectedFormForModal((prev) => prev ? { ...prev, status: 'verified', verified_at: new Date().toLocaleDateString('id-ID') } : null);
                }
            },
            onError: () => setIsVerifyingForm(false),
        });
    };

    useEffect(() => {
        if (activeTab === 'peserta') {
            const url = new URL(window.location.href);
            if (participantPage > 1) {
                url.searchParams.set('page', String(participantPage));
            } else {
                url.searchParams.delete('page');
            }
            window.history.replaceState(window.history.state, '', url);
        }
    }, [activeTab, participantPage]);
    const [isGeneratingDocuments, setIsGeneratingDocuments] = useState(false);
    const documentNumberForm = useForm({
        numbers: Object.fromEntries(Object.keys(documentNumberLabels).map((trackCode) => [trackCode, {
            prefix: documentNumberOverrides[trackCode]?.prefix ?? '',
            start: documentNumberOverrides[trackCode]?.start ?? '',
        }])),
    });
    const roomForm = useForm({ name: '' });
    const trackForm = useForm({ code: '', name: '', description: '' });
    const legendForm = useForm({ acronym: '', full_name: '', category: 'istilah', description: '' });
    const requirementForm = useForm({ item: '', mandatory: true });
    const facilityForm = useForm({ name: '', status: 'prepared', notes: '' });
    const speakerForm = useForm({ name: '', type: 'internal', title_degree: '', specialization: '' });

    // Modals
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState(null);
    const [selectedSessionLinks, setSelectedSessionLinks] = useState([]);
    const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);

    useEffect(() => {
        if (!isSessionModalOpen) return;
        setSelectedSessionLinks([
            ...(editingSession?.learning_module_id || editingSession?.event_module_id ? ['master'] : []),
            ...(editingSession?.material_id ? ['collection'] : []),
        ]);
    }, [isSessionModalOpen, editingSession]);
    const [isAddParticipantModalOpen, setIsAddParticipantModalOpen] = useState(false);
    const [participantMode, setParticipantMode] = useState('existing');
    const [editingParticipant, setEditingParticipant] = useState(null);

    // Master Linking Modals
    const [isAttachModuleModalOpen, setIsAttachModuleModalOpen] = useState(false);
    const [isAttachCbtModalOpen, setIsAttachCbtModalOpen] = useState(false);

    // QR Preview Modal
    const [isQrPreviewModalOpen, setIsQrPreviewModalOpen] = useState(false);
    const [previewQrSession, setPreviewQrSession] = useState(null);

    // Attendance Override & Generate Modal
    const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
    const [attendanceResetTarget, setAttendanceResetTarget] = useState(null);
    const [isResettingAttendance, setIsResettingAttendance] = useState(false);
    const [isGenerateAttendanceModalOpen, setIsGenerateAttendanceModalOpen] = useState(false);
    const [isGeneratingAttendance, setIsGeneratingAttendance] = useState(false);
    const [generateTrack, setGenerateTrack] = useState('all');
    const [generateStatus, setGenerateStatus] = useState('present');
    const [generateIncludeArrival, setGenerateIncludeArrival] = useState(true);
    const [generateIncludeDaily, setGenerateIncludeDaily] = useState(true);
    const [generateIncludeSessions, setGenerateIncludeSessions] = useState(true);

    const [attendanceSearch, setAttendanceSearch] = useState('');
    const [attendanceStatusFilter, setAttendanceStatusFilter] = useState('all');
    const [attendancePerPage, setAttendancePerPage] = useState(25);
    const [attendancePage, setAttendancePage] = useState(1);


    // CBT Package Modals
    const [isCbtPackageModalOpen, setIsCbtPackageModalOpen] = useState(false);
    const [editingCbtPackage, setEditingCbtPackage] = useState(null);
    const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
    const [activeCbtPackageForQuestion, setActiveCbtPackageForQuestion] = useState(null);

    // 1. Session Form
    const sessionForm = useForm({
        day_number: 1,
        session_number: 'Sesi 1',
        event_session_type_id: sessionTypes[0]?.id || '',
        session_type_code: '',
        speaker_id: '',
        session_date: event.start_date || '',
        start_time: '',
        end_time: '',
        duration_jp: 2,
        topic: '',
        subtopic: '',
        method: '',
        room: '',
        target_tracks: [],
        module_code: '',
        status: 'scheduled',
        attendance_setting: 'check_in',
        learning_module_id: '',
        event_module_id: '',
        material_id: '',
        cbt_exam_package_id: '',
        requires_attendance_before_cbt: false,
    });

    // Master Linking Forms
    const attachModuleForm = useForm({
        learning_module_id: '',
        participant_path_id: 'all',
        is_required: true,
        sort_order: (learningModules?.length || 0) + 1,
        availability_start_at: '',
        availability_end_at: '',
    });

    const attachCbtForm = useForm({
        cbt_exam_package_id: '',
        participant_path_id: 'all',
        is_required: true,
        sort_order: (linkedCbtPackages?.length || 0) + 1,
        requires_attendance_session_id: '',
        availability_start_at: '',
        availability_end_at: '',
    });

    // 2. Module Form
    const moduleForm = useForm({
        code: '',
        title: '',
        speaker_id: '',
        material_id: '',
        source_type: 'collection',
        source_url: '',
        source_file: null,
        target_tracks: [],
        duration_jp: 2,
        delivery_method: '',
        description: '',
        learning_indicators: '',
        publication_status: 'draft',
    });

    // 3. Participant Forms
    const participantEditForm = useForm({
        rotation_group: 'A1',
        admin_status: 'verified',
        attendance_status: 'present',
        theory_score: '',
        practice_score: '',
        graduation_status: 'graduated',
        certificate_number: '',
        notes: '',
    });

    const participantAddForm = useForm({
        participant_id: '',
        participant_track_id: '',
        rotation_group: 'A1',
        admin_status: 'verified',
    });
    const participantNewForm = useForm({ name: '', email: '', kenshi_id: '', phone: '', origin: '', dojo: '', dan_level: '', participant_track_id: '', rotation_group: 'A1', admin_status: 'verified' });

    // 4. Override Attendance Form
    const overrideForm = useForm({
        event_session_id: '',
        participant_id: '',
        attendance_type: 'check_in',
        status: 'present',
        notes: '',
    });

    // 5. CBT Package Form
    const cbtPackageForm = useForm({
        title: '',
        code: '',
        description: '',
        exam_type: 'theory',
        question_module_id: '',
        duration_minutes: 60,
        passing_score: 75.00,
        attempts_allowed: 1,
        revision_method: 'none',
        revision_deadline: '',
        instructions: 'Pilihlah salah satu jawaban yang paling tepat. Waktu pengerjaan sesuai alokasi durasi.',
        status: 'ready',
        randomize_questions: false,
        randomize_answers: false,
        result_display: 'immediate',
    });

    // 6. Question Form
    const questionForm = useForm({
        question_text: '',
        question_type: 'single_choice',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
        points: 25.00,
        explanation: '',
        category: 'Umum',
    });

    // --- Submissions ---
    const handleSaveSession = (e) => {
        e.preventDefault();
        const payload = {
            ...sessionForm.data,
            speaker_id: sessionForm.data.speaker_id ? parseInt(sessionForm.data.speaker_id, 10) : null,
            learning_module_id: sessionForm.data.learning_module_id ? (String(sessionForm.data.learning_module_id).startsWith('legacy_') ? sessionForm.data.learning_module_id : parseInt(sessionForm.data.learning_module_id, 10)) : null,
            material_id: sessionForm.data.material_id ? parseInt(sessionForm.data.material_id, 10) : null,
            cbt_exam_package_id: sessionForm.data.cbt_exam_package_id ? parseInt(sessionForm.data.cbt_exam_package_id, 10) : null,
            event_session_type_id: sessionForm.data.event_session_type_id ? parseInt(sessionForm.data.event_session_type_id, 10) : null,
        };

        sessionForm.transform(() => payload);

        if (editingSession) {
            sessionForm.put(`/admin/event/${event.id}/sesi/${editingSession.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSessionModalOpen(false);
                    setEditingSession(null);
                },
            });
        } else {
            sessionForm.post(`/admin/event/${event.id}/sesi`, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSessionModalOpen(false);
                    sessionForm.reset();
                },
            });
        }
    };

    const handleDeleteSession = (session) => {
        if (confirm(`Hapus sesi "${session.topic}"?`)) {
            router.delete(`/admin/event/${event.id}/sesi/${session.id}`);
        }
    };

    const handleOpenAttendance = (session) => {
        router.post(`/admin/event/${event.id}/sesi/${session.id}/absensi/buka`, {}, {
            preserveScroll: true,
        });
    };

    const handleCloseAttendance = (session) => {
        router.post(`/admin/event/${event.id}/sesi/${session.id}/absensi/tutup`, {}, {
            preserveScroll: true,
        });
    };

    const handleSaveModule = (e) => {
        e.preventDefault();
        moduleForm.post(`/admin/event/${event.id}/modul`, {
            forceFormData: true,
            onSuccess: () => {
                setIsModuleModalOpen(false);
                moduleForm.reset();
            },
        });
    };

    const handleUpdateParticipant = (e) => {
        e.preventDefault();
        if (!editingParticipant) return;
        participantEditForm.put(`/admin/event/${event.id}/peserta/${editingParticipant.id}`, {
            onSuccess: () => {
                setEditingParticipant(null);
            },
        });
    };

    const handleAddParticipant = (e) => {
        e.preventDefault();
        participantAddForm.post(`/admin/event/${event.id}/peserta`, {
            onSuccess: () => {
                setIsAddParticipantModalOpen(false);
                participantAddForm.reset();
            },
        });
    };

    const handleCreateParticipant = (e) => {
        e.preventDefault();
        participantNewForm.post(`/admin/event/${event.id}/peserta-baru`, {
            onSuccess: () => {
                setIsAddParticipantModalOpen(false);
                participantNewForm.reset();
                setParticipantMode('existing');
            },
        });
    };

    const handleRemoveParticipant = (ep) => {
        if (confirm(`Keluarkan ${ep.name} dari event ini?`)) {
            router.delete(`/admin/event/${event.id}/peserta/${ep.id}`);
        }
    };

    const handleSaveOverride = (e) => {
        e.preventDefault();
        overrideForm.post(`/admin/event/${event.id}/absensi/override`, {
            onSuccess: () => {
                setIsOverrideModalOpen(false);
                overrideForm.reset();
            },
        });
    };

    const handleSaveCbtPackage = (e) => {
        e.preventDefault();
        if (editingCbtPackage) {
            cbtPackageForm.put(`/admin/event/${event.id}/cbt/${editingCbtPackage.id}`, {
                onSuccess: () => {
                    setIsCbtPackageModalOpen(false);
                    setEditingCbtPackage(null);
                },
            });
        } else {
            cbtPackageForm.post(`/admin/event/${event.id}/cbt`, {
                onSuccess: () => {
                    setIsCbtPackageModalOpen(false);
                    cbtPackageForm.reset();
                },
            });
        }
    };

    const handleDeleteCbtPackage = (pkg) => {
        if (confirm(`Hapus paket ujian CBT "${pkg.title}"?`)) {
            router.delete(`/admin/event/${event.id}/cbt/${pkg.id}`);
        }
    };

    const handleSaveQuestion = (e) => {
        e.preventDefault();
        if (!activeCbtPackageForQuestion) return;

        const options = [
            { id: 'A', text: questionForm.data.option_a },
            { id: 'B', text: questionForm.data.option_b },
            { id: 'C', text: questionForm.data.option_c },
            { id: 'D', text: questionForm.data.option_d },
        ];

        router.post(
            `/admin/cbt/${activeCbtPackageForQuestion.id}/soal`,
            {
                question_text: questionForm.data.question_text,
                question_type: questionForm.data.question_type,
                options: options,
                correct_answer: questionForm.data.correct_answer,
                points: questionForm.data.points,
                explanation: questionForm.data.explanation,
                category: questionForm.data.category,
            },
            {
                onSuccess: () => {
                    setIsAddQuestionModalOpen(false);
                    questionForm.reset();
                },
            }
        );
    };

    const openEditSessionModal = (session) => {
        setEditingSession(session);
        const activeModId = session.learning_module_id
            ? session.learning_module_id
            : (session.event_module_id ? 'legacy_' + session.event_module_id : '');

        const matchedSessionType = sessionTypes.find((st) => st.code === session.session_type_code);
        const activeSessionTypeId = session.session_type_code === 'KEHADIRAN_HARIAN'
            ? ''
            : (session.session_type?.id || matchedSessionType?.id || sessionTypes[0]?.id || '');

        const validAttendance = ['none', 'check_in', 'check_in_out'].includes(session.attendance_setting)
            ? session.attendance_setting
            : 'check_in';

        const validStatus = ['scheduled', 'ongoing', 'completed', 'cancelled'].includes(session.status)
            ? session.status
            : 'scheduled';

        sessionForm.clearErrors();
        sessionForm.setData({
            day_number: session.day_number,
            session_number: session.session_number,
            event_session_type_id: activeSessionTypeId,
            session_type_code: session.session_type_code === 'KEHADIRAN_HARIAN' ? 'KEHADIRAN_HARIAN' : (session.session_type_code || ''),
            speaker_id: session.speaker?.id || '',
            session_date: session.session_date || '',
            start_time: session.start_time ? session.start_time.substring(0, 5) : '',
            end_time: session.end_time ? session.end_time.substring(0, 5) : '',
            duration_jp: session.duration_jp ?? 1,
            topic: session.topic || '',
            subtopic: session.subtopic || '',
            method: session.method || '',
            room: session.room || '',
            target_tracks: session.target_tracks || session.track_codes || [],
            module_code: session.module_code || '',
            status: validStatus,
            attendance_setting: validAttendance,
            learning_module_id: activeModId,
            event_module_id: session.event_module_id || '',
            material_id: session.material_id || '',
            cbt_exam_package_id: session.cbt_exam_package_id || '',
            requires_attendance_before_cbt: session.requires_attendance_before_cbt || false,
        });
        setIsSessionModalOpen(true);
    };

    const handleAttachModule = (e) => {
        e.preventDefault();
        attachModuleForm.post(`/admin/event/${event.id}/modul-pembelajaran`, {
            onSuccess: () => {
                setIsAttachModuleModalOpen(false);
                attachModuleForm.reset();
            },
        });
    };

    const handleDetachModule = (moduleItem) => {
        if (confirm(`Lepaskan Modul Pembelajaran "${moduleItem.title}" dari event ini?`)) {
            router.delete(`/admin/event/${event.id}/modul-pembelajaran/${moduleItem.id}`);
        }
    };

    const handleAttachCbt = (e) => {
        e.preventDefault();
        attachCbtForm.post(`/admin/event/${event.id}/cbt-package`, {
            onSuccess: () => {
                setIsAttachCbtModalOpen(false);
                attachCbtForm.reset();
            },
        });
    };

    const handleDetachCbt = (pkg) => {
        if (confirm(`Lepaskan Paket Ujian "${pkg.title}" dari event ini?`)) {
            router.delete(`/admin/event/${event.id}/cbt-package/${pkg.id}`);
        }
    };

    const openEditParticipantModal = (ep) => {
        setEditingParticipant(ep);
        participantEditForm.setData({
            rotation_group: ep.rotation_group || 'A1',
            admin_status: ep.admin_status || 'verified',
            attendance_status: ep.attendance_status || 'present',
            theory_score: ep.theory_score ?? '',
            practice_score: ep.practice_score ?? '',
            graduation_status: ep.graduation_status || 'graduated',
            certificate_number: ep.certificate_number || '',
            notes: ep.notes || '',
        });
    };

    const settingSections = [
        { id: 'ruang', label: 'Ruang' },
        { id: 'modul_cbt', label: 'Modul & CBT' },
        { id: 'materi', label: 'Materi' },
        { id: 'cbt', label: 'Ujian CBT' },
    ];

    const tabs = [
        { id: 'ringkasan', label: 'Informasi', count: null },
        { id: 'rundown', label: 'Rundown & Sesi', count: stats.total_sessions },
        { id: 'peserta', label: 'Peserta', count: stats.total_participants },
        { id: 'formulir', label: 'Formulir Pendaftaran', count: stats.total_registration_forms ?? registrationForms.length },
        { id: 'absensi', label: 'Absensi', count: stats.total_attendances || attendances.length },
        { id: 'pemateri', label: 'Pemateri', count: stats.total_speakers },
        { id: 'sertifikat', label: 'E-Sertifikat & Transkrip', count: (stats.certificate_files_count || 0) + (stats.transcript_files_count || 0) },
        { id: 'revisi', label: 'Revisi Ujian', count: examRevisions.length },
        { id: 'pengawasan', label: 'Pengawasan CBT', count: stats.proctoring_events_count || proctoringEvents.length },
        { id: 'legenda', label: 'Legenda & Singkatan', count: null },
        { id: 'dokumen', label: 'Dokumen & Ketentuan', count: null },
        { id: 'pengaturan', label: 'Pengaturan Event', count: null },
    ];

    // Helper date parsing
    const parseDateOnly = (dateStr) => {
        if (!dateStr) return null;
        const parts = String(dateStr).split(/[-T ]/);
        if (parts.length >= 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                return new Date(year, month, day);
            }
        }
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d;
    };

    const totalDays = useMemo(() => {
        let count = event.total_days || 0;
        if (!count && event.start_date && event.end_date) {
            const s = parseDateOnly(event.start_date);
            const e = parseDateOnly(event.end_date);
            if (s && e) {
                const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                if (diff > 0) count = diff;
            }
        }
        const sessionDayKeys = Object.keys(sessionsByDay || {})
            .map(Number)
            .filter((n) => !isNaN(n) && n > 0);
        const maxSessionDay = sessionDayKeys.length > 0 ? Math.max(...sessionDayKeys) : 1;
        return Math.max(count || 1, maxSessionDay, 1);
    }, [event.total_days, event.start_date, event.end_date, sessionsByDay]);

    const daysList = useMemo(() => {
        return Array.from({ length: totalDays }, (_, i) => i + 1);
    }, [totalDays]);

    const getDayDateObj = (dayNum) => {
        if (!event.start_date) return null;
        const base = parseDateOnly(event.start_date);
        if (!base) return null;
        const d = new Date(base);
        d.setDate(d.getDate() + (dayNum - 1));
        return d;
    };

    const getDayDateInfo = (dayNum) => {
        const d = getDayDateObj(dayNum);
        if (!d) return null;
        return d.toLocaleDateString('id-ID', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
        });
    };

    const getDayIsoDate = (dayNum) => {
        const d = getDayDateObj(dayNum);
        if (!d) return event.start_date || '';
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const activeDayData = sessionsByDay[selectedDay] || { day_number: selectedDay, sessions: [] };

    // Filtered & Paginated attendances for Tab 4
    const filteredAttendances = useMemo(() => {
        return (attendances || []).filter((att) => {
            if (attendanceSessionFilter !== 'all' && String(att.session_id) !== String(attendanceSessionFilter)) {
                return false;
            }
            if (attendanceStatusFilter !== 'all' && att.status !== attendanceStatusFilter) {
                return false;
            }
            if (attendanceSearch.trim()) {
                const q = attendanceSearch.trim().toLowerCase();
                const matchName = (att.participant_name || '').toLowerCase().includes(q);
                const matchTopic = (att.session_topic || '').toLowerCase().includes(q);
                const matchNumber = (att.session_number || '').toLowerCase().includes(q);
                const matchRecordedBy = (att.recorded_by || '').toLowerCase().includes(q);
                const matchNotes = (att.notes || '').toLowerCase().includes(q);
                if (!matchName && !matchTopic && !matchNumber && !matchRecordedBy && !matchNotes) {
                    return false;
                }
            }
            return true;
        });
    }, [attendances, attendanceSessionFilter, attendanceStatusFilter, attendanceSearch]);

    const totalAttendancePages = attendancePerPage === 'all'
        ? 1
        : Math.max(1, Math.ceil(filteredAttendances.length / Number(attendancePerPage)));

    const safeAttendancePage = Math.min(attendancePage, totalAttendancePages);

    const paginatedAttendances = useMemo(() => {
        if (attendancePerPage === 'all') {
            return filteredAttendances;
        }
        const perPageNum = Number(attendancePerPage);
        const start = (safeAttendancePage - 1) * perPageNum;
        return filteredAttendances.slice(start, start + perPageNum);
    }, [filteredAttendances, safeAttendancePage, attendancePerPage]);

    const attendancePageNumbers = useMemo(() => {
        const total = totalAttendancePages;
        const current = safeAttendancePage;
        if (total <= 7) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }
        if (current <= 4) {
            return [1, 2, 3, 4, 5, '...', total];
        }
        if (current >= total - 3) {
            return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
        }
        return [1, '...', current - 1, current, current + 1, '...', total];
    }, [totalAttendancePages, safeAttendancePage]);


    const credentialParticipants = useMemo(() => {
        const query = credentialSearch.trim().toLocaleLowerCase('id-ID');

        if (!query) {
            return participants;
        }

        return participants.filter((participant) => [
            participant.name,
            participant.kenshi_id,
            participant.track_code,
            participant.track_name,
        ].some((value) => String(value || '').toLocaleLowerCase('id-ID').includes(query)));
    }, [credentialSearch, participants]);

    const availableTrackOptions = useMemo(() => {
        const set = new Set();
        (tracks || []).forEach((t) => t.code && set.add(t.code));
        (participants || []).forEach((p) => p.track_code && set.add(p.track_code));
        return Array.from(set).sort();
    }, [tracks, participants]);

    const filteredParticipants = useMemo(() => {
        return (participants || []).filter((p) => {
            if (participantTrackFilter !== 'all' && p.track_code !== participantTrackFilter) {
                return false;
            }
            if (participantCheckinFilter === 'checked_in' && !p.checked_in_at) {
                return false;
            }
            if (participantCheckinFilter === 'not_checked_in' && p.checked_in_at) {
                return false;
            }
            if (participantSearch.trim()) {
                const q = participantSearch.trim().toLowerCase();
                const matchName = (p.name || '').toLowerCase().includes(q);
                const matchKenshiId = (p.kenshi_id || '').toLowerCase().includes(q);
                const matchOrigin = (p.origin || '').toLowerCase().includes(q);
                const matchTrack = (p.track_code || '').toLowerCase().includes(q) || (p.track_name || '').toLowerCase().includes(q);
                const matchDan = (p.dan_roman || '').toLowerCase().includes(q);
                if (!matchName && !matchKenshiId && !matchOrigin && !matchTrack && !matchDan) {
                    return false;
                }
            }
            return true;
        });
    }, [participants, participantSearch, participantTrackFilter, participantCheckinFilter]);

    const totalParticipantPages = participantPerPage === 'all'
        ? 1
        : Math.max(1, Math.ceil(filteredParticipants.length / Number(participantPerPage)));

    const safeParticipantPage = Math.min(participantPage, totalParticipantPages);

    const paginatedParticipants = useMemo(() => {
        if (participantPerPage === 'all') {
            return filteredParticipants;
        }
        const perPageNum = Number(participantPerPage);
        const start = (safeParticipantPage - 1) * perPageNum;
        return filteredParticipants.slice(start, start + perPageNum);
    }, [filteredParticipants, safeParticipantPage, participantPerPage]);

    const participantPageNumbers = useMemo(() => {
        const total = totalParticipantPages;
        const current = safeParticipantPage;
        if (total <= 7) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }
        if (current <= 4) {
            return [1, 2, 3, 4, 5, '...', total];
        }
        if (current >= total - 3) {
            return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
        }
        return [1, '...', current - 1, current, current + 1, '...', total];
    }, [totalParticipantPages, safeParticipantPage]);

    const handleAttendanceReset = () => {
        if (!attendanceResetTarget) return;

        const resetAll = attendanceResetTarget === 'all';
        const url = resetAll
            ? `/admin/event/${event.id}/absensi`
            : attendanceResetTarget.scope === 'participant'
                ? `/admin/event/${event.id}/peserta/${attendanceResetTarget.id}/hasil`
                : `/admin/event/${event.id}/absensi/${attendanceResetTarget.id}`;

        router.delete(url, {
            preserveScroll: true,
            onStart: () => setIsResettingAttendance(true),
            onSuccess: () => setAttendanceResetTarget(null),
            onFinish: () => setIsResettingAttendance(false),
        });
    };

    const handleGenerateAllAttendance = (e) => {
        e?.preventDefault();
        router.post(`/admin/event/${event.id}/absensi/generate`, {
            status: generateStatus,
            method: 'manual_admin',
            target_track: generateTrack,
            include_arrival: generateIncludeArrival,
            include_daily: generateIncludeDaily,
            include_sessions: generateIncludeSessions,
        }, {
            preserveScroll: true,
            onStart: () => setIsGeneratingAttendance(true),
            onFinish: () => {
                setIsGeneratingAttendance(false);
                setIsGenerateAttendanceModalOpen(false);
            },
        });
    };


    return (
        <AdminLayout>
            <Head title={`${event.name} — Detail Penataran`} />

            <div className="space-y-6">
                <PageHeader
                    title={event.name}
                    description={`${event.date_formatted} • ${event.place}`}
                    breadcrumbs={[{ label: 'Event', href: '/admin/event' }, { label: event.name }]}
                    action={
                        <Button as={Link} href={`/admin/event/${event.id}/edit`} size="sm" variant="secondary" icon={Edit3}>Edit Event</Button>
                    }
                />

                {/* Editorial Event Hero Header */}
                <div className="bg-white rounded-2xl border border-[#DCE7F3] shadow-xs overflow-hidden">
                    {/* Top Decorative Banner Strip */}
                    <div className="h-28 sm:h-36 bg-linear-to-r from-[#0E2747] via-[#0A3F82] to-[#0B63CE] relative px-6 py-4 flex items-end">
                        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
                        <div className="relative z-10 flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur-xs border border-white/20">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                {event.status_label}
                            </span>
                            <span className="text-xs text-white/80 font-mono">
                                Penyelenggara: {event.organizer}
                            </span>
                        </div>
                    </div>

                    {/* Main Event Meta Bar */}
                    <div className="p-6 sm:p-8 relative">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="space-y-2 max-w-3xl">
                                <h2 className="font-display font-bold text-xl sm:text-2xl text-[#0E2747] leading-snug">
                                    Informasi Pelaksanaan
                                </h2>
                                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-[#6B7C93]">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-[#0B63CE]" />
                                        <span className="font-medium text-[#112743]">{event.date_formatted}</span>
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-[#0B63CE]" />
                                        <span>{event.place}</span>
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-[#EE9B25]" />
                                        <span>Durasi: {event.duration_days || 'Belum ditetapkan'}</span>
                                    </span>
                                </div>
                            </div>

                        </div>

                        <StatGrid className="mt-6 border-t border-[#DCE7F3] pt-6" items={[
                            { key: 'jp', label: 'Beban Akreditasi', value: `${event.total_effective_jp} JP`, description: `Jadwal fisik: ${event.total_schedule_jp} JP`, icon: BookOpen, tone: 'blue' },
                            { key: 'participants', label: 'Peserta Terdaftar', value: stats.total_participants, description: `${stats.checked_in_participants || 0} check-in • ${stats.verified_participants} terverifikasi`, icon: Users, tone: 'navy' },
                            { key: 'attendance', label: 'Presensi Kehadiran', value: stats.total_attendances || 0, description: `${stats.present_attendances || 0} hadir tepat waktu`, icon: CheckCircle2, tone: 'green' },
                            { key: 'curriculum', label: 'Kurikulum & CBT', value: `${stats.total_modules} Modul • ${stats.cbt_packages_count || 0} CBT`, description: `${stats.total_sessions} sesi rundown (${event.total_days} hari)`, icon: Layers, tone: 'purple' },
                        ]} />
                    </div>

                    <Tabs
                        tabs={tabs}
                        activeTab={settingSections.some((section) => section.id === activeTab) ? 'pengaturan' : activeTab}
                        onChange={setActiveTab}
                        ariaLabel="Bagian detail event"
                        className="border-t bg-[#F8FBFF] px-4"
                    />
                </div>

                {settingSections.some((section) => section.id === activeTab) && <div className="mb-5 flex flex-wrap items-center gap-3 border-b border-[#DCE7F3] pb-4">
                    <button type="button" onClick={() => setActiveTab('pengaturan')} className="inline-flex min-h-11 items-center text-sm font-semibold text-[#0B63CE] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]">← Pengaturan Event</button>
                    <span aria-hidden="true" className="text-[#6B7C93]">/</span>
                    <span className="font-display text-lg font-semibold text-[#0A3F82]">{settingSections.find((section) => section.id === activeTab)?.label}</span>
                </div>}

                {/* TAB 1: RINGKASAN */}
                {activeTab === 'ringkasan' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-xl border border-[#DCE7F3] p-6 shadow-xs space-y-4">
                                <h3 className="font-display font-bold text-sm text-[#0E2747] flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-[#0B63CE]" />
                                    Deskripsi & Konsep Penataran
                                </h3>
                                <p className="text-xs text-[#112743] leading-relaxed">
                                    {event.description || 'Tidak ada deskripsi rinci untuk event ini.'}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#DCE7F3] text-xs">
                                    <div>
                                        <span className="text-[#6B7C93] block text-[11px]">Metode Pembelajaran</span>
                                        <span className="font-semibold text-[#0E2747]">{event.learning_method || 'Belum ditetapkan'}</span>
                                    </div>
                                    <div>
                                        <span className="text-[#6B7C93] block text-[11px]">Durasi 1 Jam Pelajaran (JP)</span>
                                        <span className="font-semibold text-[#0E2747]">{event.jp_duration_minutes} Menit</span>
                                    </div>
                                    <div>
                                        <span className="text-[#6B7C93] block text-[11px]">Ruang Utama</span>
                                        <span className="font-semibold text-[#0E2747]">{event.place}</span>
                                    </div>
                                    <div>
                                        <span className="text-[#6B7C93] block text-[11px]">Penanggung Jawab</span>
                                        <span className="font-semibold text-[#0E2747]">{event.responsible_user?.name || 'Belum ditetapkan'}</span>
                                    </div>
                                    <div>
                                        <span className="text-[#6B7C93] block text-[11px]">Status Publikasi Digital</span>
                                        <span className="font-semibold text-[#20A47A]">{stats.published_modules} Modul Siap Akses</span>
                                    </div>
                                </div>
                            </div>

                            {/* Upcoming / First Day Agenda */}
                            <div className="bg-white rounded-xl border border-[#DCE7F3] p-6 shadow-xs space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-display font-bold text-sm text-[#0E2747] flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-[#EE9B25]" />
                                        Agenda Sesi Hari Pertama (Pembukaan & Pleno)
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedDay(1);
                                            setActiveTab('rundown');
                                        }}
                                        className="text-xs text-[#0B63CE] font-semibold hover:underline flex items-center gap-1"
                                    >
                                        Buka Rundown Lengkap <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {(sessionsByDay[1]?.sessions || []).slice(0, 4).map((s) => (
                                        <div
                                            key={s.id}
                                            className="p-3.5 rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] flex items-start justify-between gap-4"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-[11px] font-bold text-[#0B63CE] bg-[#EAF5FF] px-2 py-0.5 rounded">
                                                        {s.time_slot}
                                                    </span>
                                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${s.session_type?.badge_color || 'bg-slate-100 text-slate-700'}`}>
                                                        {s.session_type?.name || 'Sesi'}
                                                    </span>
                                                    <span className="text-[11px] text-[#6B7C93]">{s.duration_jp} JP</span>
                                                </div>
                                                <div className="font-semibold text-xs text-[#0E2747]">{s.topic}</div>
                                                {s.speaker && (
                                                    <div className="text-[11px] text-[#6B7C93]">
                                                        Pemateri: <span className="text-[#112743] font-medium">{s.speaker.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[11px] font-mono text-[#0A3F82] bg-white px-2 py-1 rounded border border-[#DCE7F3] shrink-0">
                                                {s.room || 'Ruang belum ditetapkan'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Summary Column */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl border border-[#DCE7F3] p-5 shadow-xs space-y-4">
                                <h4 className="font-display font-bold text-xs text-[#0E2747] uppercase tracking-wider">
                                    Distribusi Jalur Peserta
                                </h4>
                                <div className="space-y-2">
                                    {tracks.map((t) => {
                                        const count = participants.filter((p) => p.track_code === t.code).length;
                                        return (
                                            <div key={t.id} className="flex items-center justify-between text-xs py-1 border-b border-[#DCE7F3]/50 last:border-0">
                                                <span className="flex items-center gap-2">
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${t.badge_color}`}>
                                                        {t.code}
                                                    </span>
                                                    <span className="text-[#112743] truncate max-w-[150px]">{t.name}</span>
                                                </span>
                                                <span className="font-mono font-bold text-[#0E2747]">{count} Kenshi</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-[#DCE7F3] p-5 shadow-xs space-y-4">
                                <h4 className="font-display font-bold text-xs text-[#0E2747] uppercase tracking-wider">
                                    Akses Portal Pembelajaran Peserta
                                </h4>
                                <p className="text-xs text-[#6B7C93]">
                                    Peserta mengakses portal mandiri untuk check-in event, scan absensi QR sesi, membaca buku digital, dan mengikuti ujian CBT.
                                </p>
                                <div className="p-3 bg-[#EAF5FF] rounded-lg border border-[#0B63CE]/20 space-y-2">
                                    <div className="text-xs font-semibold text-[#0B63CE]">Link Cepat Peserta:</div>
                                    <div className="font-mono text-[11px] text-[#0A3F82] bg-white p-2 rounded border border-[#DCE7F3] break-all select-all">
                                        /event/{event.slug}/ruang-belajar
                                    </div>
                                    <div className="flex items-center gap-3 pt-1">
                                        <Link
                                            href={`/event/${event.slug}/welcome`}
                                            target="_blank"
                                            className="text-xs font-semibold text-[#0B63CE] hover:underline flex items-center gap-1"
                                        >
                                            <span>3D Welcome Book</span>
                                            <ExternalLink className="w-3 h-3" />
                                        </Link>
                                        <span>•</span>
                                        <Link
                                            href={`/event/${event.slug}/scan`}
                                            target="_blank"
                                            className="text-xs font-semibold text-[#0B63CE] hover:underline flex items-center gap-1"
                                        >
                                            <span>Scan QR Kamera</span>
                                            <ExternalLink className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: RUNDOWN & SESI */}
                {activeTab === 'rundown' && (
                    <div className="space-y-6">
                        {/* Day Selector and Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#DCE7F3]">
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                                {daysList.map((day) => {
                                    const dateInfo = getDayDateInfo(day);
                                    return (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => setSelectedDay(day)}
                                            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 flex flex-col items-center gap-0.5 ${
                                                selectedDay === day
                                                    ? 'bg-[#0E2747] text-white shadow-xs'
                                                    : 'bg-[#F8FBFF] text-[#6B7C93] hover:text-[#0E2747] hover:bg-[#EAF5FF] border border-[#DCE7F3]'
                                            }`}
                                        >
                                            <span className="whitespace-nowrap">Hari ke-{day}</span>
                                            {dateInfo && (
                                                <span
                                                    className={`text-[10px] font-normal whitespace-nowrap ${
                                                        selectedDay === day ? 'text-white/80' : 'text-[#8A9FB4]'
                                                    }`}
                                                >
                                                    {dateInfo}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <a
                                    href={`/admin/event/${event.id}/rundown/export-excel`}
                                    download
                                    className="inline-block"
                                >
                                    <Button
                                        variant="secondary"
                                        icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
                                    >
                                        Export Excel
                                    </Button>
                                </a>
                                <a
                                    href={`/admin/event/${event.id}/absensi/cetak-semua-qr`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block"
                                >
                                    <Button
                                        variant="secondary"
                                        icon={<Printer className="w-4 h-4 text-[#0B63CE]" />}
                                    >
                                        Cetak Semua QR
                                    </Button>
                                </a>
                            {!activeDayData.sessions.some((session) => session.session_type_code === 'KEHADIRAN_HARIAN') && <Button
                                variant="secondary"
                                icon={<QrCode className="w-4 h-4" />}
                                onClick={() => {
                                    setEditingSession(null);
                                    sessionForm.clearErrors();
                                    sessionForm.setData({
                                        day_number: selectedDay,
                                        session_number: `Harian ${selectedDay}`,
                                        event_session_type_id: '',
                                        session_type_code: 'KEHADIRAN_HARIAN',
                                        speaker_id: '',
                                        session_date: getDayIsoDate(selectedDay),
                                        start_time: '00:00',
                                        end_time: '23:59',
                                        duration_jp: 0,
                                        topic: `Kehadiran hari ke-${selectedDay}`,
                                        subtopic: '',
                                        method: '',
                                        room: '',
                                        target_tracks: [],
                                        module_code: '',
                                        status: 'scheduled',
                                        attendance_setting: 'check_in',
                                        learning_module_id: '',
                                        event_module_id: '',
                                        material_id: '',
                                        cbt_exam_package_id: '',
                                        requires_attendance_before_cbt: false,
                                    });
                                    setIsSessionModalOpen(true);
                                }}
                            >Atur QR Harian</Button>}
                            <Button
                                variant="primary"
                                icon={<Plus className="w-4 h-4" />}
                                onClick={() => {
                                    setEditingSession(null);
                                    sessionForm.clearErrors();
                                    sessionForm.setData({
                                        day_number: selectedDay,
                                        session_number: `Sesi ${activeDayData.sessions.filter((session) => session.session_type_code !== 'KEHADIRAN_HARIAN').length + 1}`,
                                        event_session_type_id: sessionTypes[0]?.id || '',
                                        session_type_code: '',
                                        speaker_id: '',
                                        session_date: getDayIsoDate(selectedDay),
                                        start_time: '',
                                        end_time: '',
                                        duration_jp: 2,
                                        topic: '',
                                        subtopic: '',
                                        method: '',
                                        room: '',
                                        target_tracks: [],
                                        module_code: '',
                                        status: 'scheduled',
                                        attendance_setting: 'check_in',
                                        learning_module_id: '',
                                        event_module_id: '',
                                        material_id: '',
                                        cbt_exam_package_id: '',
                                        requires_attendance_before_cbt: false,
                                    });
                                    setIsSessionModalOpen(true);
                                }}
                            >
                                Tambah Sesi Hari {selectedDay}
                            </Button>
                            </div>
                        </div>

                        {/* Sessions Table */}
                        {(() => {
                            const filteredDaySessions = (activeDayData.sessions || []).filter((s) => {
                                if (rundownTrackFilter === 'all') return true;
                                const sTracks = s.target_tracks || s.track_codes || [];
                                if (!sTracks || sTracks.length === 0 || sTracks.length >= 6) return true;
                                return sTracks.includes(rundownTrackFilter);
                            });

                            return (
                                <div className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs overflow-hidden">
                                    <div className="px-6 py-4 border-b border-[#DCE7F3] bg-[#F8FBFF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <h3 className="font-display font-bold text-sm text-[#0E2747]">
                                                Jadwal & Rundown Hari {selectedDay}
                                            </h3>
                                            <span className="text-xs font-medium text-[#6B7C93]">
                                                Total Sesi: {activeDayData.sessions.length} • Total JP:{' '}
                                                <strong className="text-[#0B63CE]">
                                                    {activeDayData.sessions.reduce((acc, s) => acc + s.duration_jp, 0)} JP
                                                </strong>
                                                {rundownTrackFilter !== 'all' && (
                                                    <span className="ml-2 text-amber-700 font-medium">
                                                        (Menampilkan {filteredDaySessions.length} sesi untuk jalur {rundownTrackFilter})
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-[#0E2747] whitespace-nowrap">Filter Jalur Peserta:</span>
                                            <select
                                                value={rundownTrackFilter}
                                                onChange={(e) => setRundownTrackFilter(e.target.value)}
                                                className="text-xs font-medium border border-[#DCE7F3] rounded-lg px-2.5 py-1.5 bg-white text-[#112743] focus:outline-none focus:ring-1 focus:ring-[#0B63CE]"
                                            >
                                                <option value="all">Semua Jalur (Tampilkan Semua)</option>
                                                {tracks.map((t) => (
                                                    <option key={t.id || t.code} value={t.code}>
                                                        {t.code} — {t.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <TableSurface className="shadow-none">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="border-b border-[#DCE7F3] bg-slate-50 text-[#0E2747] font-semibold text-[11px] uppercase tracking-wider">
                                                    <th className="px-4 py-3">Waktu & Sesi</th>
                                                    <th className="px-4 py-3">Jenis Sesi & Jalur</th>
                                                    <th className="px-4 py-3">Topik & Integrasi</th>
                                                    <th className="px-4 py-3">Pemateri / Pengawas</th>
                                                    <th className="px-4 py-3">Ruang</th>
                                                    <th className="px-4 py-3">Status Absensi</th>
                                                    <th className="px-4 py-3 text-right">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#DCE7F3]/60">
                                                {filteredDaySessions.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={7} className="text-center py-10 text-xs text-[#6B7C93]">
                                                            {rundownTrackFilter !== 'all'
                                                                ? `Tidak ada sesi rundown untuk jalur ${rundownTrackFilter} pada Hari ${selectedDay}.`
                                                                : `Belum ada jadwal sesi untuk Hari ${selectedDay}. Klik tombol di atas untuk menambahkan.`}
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredDaySessions.map((s) => (
                                                        <tr key={s.id} className="hover:bg-[#F8FBFF] transition-colors">
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <div className="font-mono font-bold text-[#0B63CE]">{s.time_slot}</div>
                                                                <div className="text-[11px] text-[#6B7C93]">{s.session_number} ({s.duration_jp} JP)</div>
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <div className="flex flex-wrap items-center gap-1">
                                                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${s.session_type?.badge_color || 'bg-slate-100 text-slate-700'}`}>
                                                                        {s.session_type?.name || 'Sesi'}
                                                                    </span>
                                                                    {(() => {
                                                                        const sTracks = s.target_tracks || s.track_codes || [];
                                                                        if (!sTracks || sTracks.length === 0 || sTracks.length >= 6) {
                                                                            return (
                                                                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                                                                                    Semua Jalur
                                                                                </span>
                                                                            );
                                                                        }
                                                                        return sTracks.map((tc) => (
                                                                            <span
                                                                                key={tc}
                                                                                className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200"
                                                                            >
                                                                                {tc}
                                                                            </span>
                                                                        ));
                                                                    })()}
                                                                </div>
                                                                <div className="text-[10px] text-[#6B7C93] mt-0.5">{s.method}</div>
                                                            </td>
                                                    <td className="px-4 py-3 min-w-[220px]">
                                                        <div className="font-semibold text-[#0E2747]">{s.topic}</div>
                                                        {s.subtopic && <div className="text-[11px] text-[#6B7C93] mt-0.5 line-clamp-1">{s.subtopic}</div>}

                                                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                                            {s.material_title && (
                                                                <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                                                                    <BookOpen className="w-3 h-3" />
                                                                    <span>Buku: {s.material_title}</span>
                                                                </span>
                                                            )}
                                                            {s.event_module_title && <span className="inline-flex items-center bg-[#EAF5FF] px-2 py-0.5 text-[10px] font-medium text-[#0A3F82]">Modul: {s.event_module_title}</span>}
                                                            {s.cbt_package_title && (
                                                                <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-purple-50 text-purple-800 px-2 py-0.5 rounded border border-purple-200">
                                                                    <PlayCircle className="w-3 h-3" />
                                                                    <span>CBT: {s.cbt_package_code}</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        {s.speaker ? (
                                                            <div>
                                                                <div className="font-medium text-[#112743]">{s.speaker.name}</div>
                                                                <div className="text-[10px] text-[#6B7C93]">{s.speaker.role_info}</div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[#6B7C93] italic">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap font-medium text-[#112743]">
                                                        {s.room || '-'}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="space-y-1">
                                                            {s.is_attendance_open ? (
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                                        <Unlock className="w-3 h-3" />
                                                                        <span>Dibuka ({s.qr_short_code})</span>
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleCloseAttendance(s)}
                                                                        className="text-[10px] text-rose-600 hover:underline font-semibold"
                                                                    >
                                                                        Tutup
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                                                                        <Lock className="w-3 h-3" />
                                                                        <span>Tutup</span>
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleOpenAttendance(s)}
                                                                        className="text-[10px] text-[#0B63CE] hover:underline font-bold"
                                                                    >
                                                                        Buka
                                                                    </button>
                                                                </div>
                                                            )}
                                                            <div className="text-[10px] text-[#6B7C93] flex items-center gap-2">
                                                                <span>Hadir: {s.attendances_count}</span>
                                                                <span>•</span>
                                                                {s.is_attendance_open ? <a
                                                                    href={`/admin/event/${event.id}/sesi/${s.id}/cetak-qr`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-[#0B63CE] hover:underline flex items-center gap-0.5 focus-visible:outline-2 focus-visible:outline-[#0B63CE]"
                                                                >
                                                                    <Printer className="w-2.5 h-2.5" />
                                                                    <span>Cetak QR</span>
                                                                </a> : <span>QR tersedia setelah absensi dibuka</span>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => openEditSessionModal(s)}
                                                                className="p-1 text-[#6B7C93] hover:text-[#0B63CE] rounded"
                                                                aria-label={`Edit sesi ${s.topic}`}
                                                            >
                                                                <Edit3 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteSession(s)}
                                                                className="p-1 text-[#6B7C93] hover:text-[#DD4D7C] rounded"
                                                                aria-label={`Hapus sesi ${s.topic}`}
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </TableSurface>
                        </div>
                            );
                        })()}
                    </div>
                )}

                {activeTab === 'ruang' && (
                    <section aria-labelledby="room-heading" className="space-y-5">
                        <div className="border-b border-[#DCE7F3] pb-4">
                            <h2 id="room-heading" className="font-display text-xl font-semibold text-[#0A3F82]">Ruang Event</h2>
                            <p className="mt-2 text-sm text-[#6B7C93]">Ruang dipakai pada sesi rundown event ini.</p>
                        </div>
                        <form onSubmit={(submission) => { submission.preventDefault(); roomForm.post(`/admin/event/${event.id}/ruang`, { onSuccess: () => roomForm.reset() }); }} className="flex flex-col gap-3 border border-[#DCE7F3] bg-white p-5 sm:flex-row sm:items-end">
                            <div className="flex-1">
                                <label htmlFor="event-room-name" className="mb-1 block text-sm font-semibold text-[#112743]">Nama ruang</label>
                                <Input id="event-room-name" value={roomForm.data.name} onChange={(change) => roomForm.setData('name', change.target.value)} required maxLength={100} error={roomForm.errors.name} />
                            </div>
                            <Button type="submit" loading={roomForm.processing}>Tambah ruang</Button>
                        </form>
                        {rooms.length === 0 ? <p className="border border-[#DCE7F3] bg-white p-6 text-sm text-[#6B7C93]">Belum ada ruang untuk event ini.</p> : (
                            <TableSurface className="shadow-none">
                                <table className="w-full min-w-[480px] text-left text-sm">
                                    <thead className="bg-[#F8FBFF] text-xs font-semibold uppercase tracking-wide text-[#6B7C93]"><tr><th scope="col" className="px-5 py-3">Nama ruang</th><th scope="col" className="px-5 py-3">Sesi terjadwal</th><th scope="col" className="px-5 py-3 text-right">Aksi</th></tr></thead>
                                    <tbody className="divide-y divide-[#DCE7F3]">
                                        {rooms.map((room) => <tr key={room.id} className="hover:bg-[#F8FBFF]"><th scope="row" className="px-5 py-3 font-semibold text-[#112743]">{room.name}</th><td className="px-5 py-3 text-[#6B7C93]">{room.sessions_count} sesi</td><td className="px-5 py-2 text-right"><button type="button" disabled={room.sessions_count > 0} onClick={() => { if (window.confirm(`Hapus ruang ${room.name}?`)) router.delete(`/admin/event/${event.id}/ruang/${room.id}`); }} className="min-h-11 px-3 text-sm font-semibold text-[#DD4D7C] hover:bg-[#FDE8EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE] disabled:cursor-not-allowed disabled:opacity-50" aria-label={`Hapus ruang ${room.name}`} title={room.sessions_count > 0 ? 'Ruang masih digunakan oleh sesi' : undefined}>Hapus</button></td></tr>)}
                                    </tbody>
                                </table>
                            </TableSurface>
                        )}
                    </section>
                )}

                {/* MODUL & CBT (MASTER) */}
                {activeTab === 'modul_cbt' && (
                    <div className="space-y-6">
                        {/* Header & Overview Card */}
                        <div className="bg-white rounded-xl border border-[#DCE7F3] p-6 shadow-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-[#EAF5FF] text-[#0B63CE]">
                                            <Layers className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-display font-bold text-base text-[#0E2747]">
                                                Hubungan Master Modul Pembelajaran & Paket CBT
                                            </h3>
                                            <p className="text-xs text-[#6B7C93]">
                                                Menghubungkan kurikulum terpusat dan paket evaluasi standar ke event ini tanpa menduplikasi data Koleksi Digital.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button
                                        variant="primary"
                                        icon={<Plus className="w-4 h-4" />}
                                        onClick={() => {
                                            attachModuleForm.reset();
                                            attachModuleForm.setData({
                                                learning_module_id: availableMasterModules[0]?.id || '',
                                                participant_path_id: 'all',
                                                is_required: true,
                                                sort_order: (learningModules?.length || 0) + 1,
                                                availability_start_at: '',
                                                availability_end_at: '',
                                            });
                                            setIsAttachModuleModalOpen(true);
                                        }}
                                    >
                                        Hubungkan Modul
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        icon={<Award className="w-4 h-4 text-purple-600" />}
                                        onClick={() => {
                                            attachCbtForm.reset();
                                            attachCbtForm.setData({
                                                cbt_exam_package_id: availableMasterCbtPackages[0]?.id || '',
                                                participant_path_id: 'all',
                                                is_required: true,
                                                sort_order: (linkedCbtPackages?.length || 0) + 1,
                                                requires_attendance_session_id: '',
                                                availability_start_at: '',
                                                availability_end_at: '',
                                            });
                                            setIsAttachCbtModalOpen(true);
                                        }}
                                    >
                                        Hubungkan Paket CBT
                                    </Button>
                                </div>
                            </div>

                            {/* Summary Chips */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-[#DCE7F3]">
                                <div className="p-3 rounded-lg bg-[#F8FBFF] border border-[#DCE7F3]">
                                    <span className="text-[10px] text-[#6B7C93] uppercase font-bold tracking-wider block">Modul Pembelajaran</span>
                                    <span className="text-lg font-display font-bold text-[#0B63CE]">{learningModules.length} Modul</span>
                                </div>
                                <div className="p-3 rounded-lg bg-[#F8FBFF] border border-[#DCE7F3]">
                                    <span className="text-[10px] text-[#6B7C93] uppercase font-bold tracking-wider block">Total Bobot JP Modul</span>
                                    <span className="text-lg font-display font-bold text-[#20A47A]">
                                        {learningModules.reduce((acc, m) => acc + (m.total_jp || 0), 0)} JP
                                    </span>
                                </div>
                                <div className="p-3 rounded-lg bg-[#F8FBFF] border border-[#DCE7F3]">
                                    <span className="text-[10px] text-[#6B7C93] uppercase font-bold tracking-wider block">Paket CBT Terhubung</span>
                                    <span className="text-lg font-display font-bold text-purple-700">{linkedCbtPackages.length} Paket</span>
                                </div>
                                <div className="p-3 rounded-lg bg-[#F8FBFF] border border-[#DCE7F3]">
                                    <span className="text-[10px] text-[#6B7C93] uppercase font-bold tracking-wider block">Koleksi Terkait</span>
                                    <span className="text-lg font-display font-bold text-[#EE9B25]">
                                        {learningModules.reduce((acc, m) => acc + (m.materials_count || m.materials?.length || 0), 0)} Materi
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 1: Master Modul Pembelajaran */}
                        <div className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs overflow-hidden">
                            <div className="px-6 py-4 border-b border-[#DCE7F3] bg-[#F8FBFF] flex items-center justify-between">
                                <div>
                                    <h4 className="font-display font-bold text-sm text-[#0E2747]">
                                        Modul Pembelajaran Terhubung ke Event
                                    </h4>
                                    <p className="text-[11px] text-[#6B7C93]">
                                        Kurikulum kompetensi dan koleksi digital yang dapat diakses peserta sesuai jalurnya.
                                    </p>
                                </div>
                                <span className="text-xs font-mono font-bold text-[#0B63CE] bg-[#EAF5FF] px-2 py-0.5 rounded">
                                    {learningModules.length} Terpasang
                                </span>
                            </div>

                            {learningModules.length === 0 ? (
                                <div className="p-10 text-center space-y-3">
                                    <div className="w-12 h-12 rounded-full bg-[#EAF5FF] text-[#0B63CE] flex items-center justify-center mx-auto">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <div className="max-w-md mx-auto">
                                        <h5 className="font-bold text-sm text-[#0E2747]">Belum Ada Modul Pembelajaran Terhubung</h5>
                                        <p className="text-xs text-[#6B7C93] mt-1">
                                            Pilih kurikulum dari Master Modul Pembelajaran untuk memberikan materi terstruktur kepada peserta.
                                        </p>
                                    </div>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        icon={<Plus className="w-4 h-4" />}
                                        onClick={() => setIsAttachModuleModalOpen(true)}
                                    >
                                        Hubungkan Modul Pertama
                                    </Button>
                                </div>
                            ) : (
                                <TableSurface className="shadow-none">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b border-[#DCE7F3] bg-[#F8FBFF] text-[#6B7C93] font-bold">
                                                <th className="py-3 px-4 w-12 text-center">Urutan</th>
                                                <th className="py-3 px-4">Modul Pembelajaran</th>
                                                <th className="py-3 px-4">Target Jalur</th>
                                                <th className="py-3 px-4">Sifat</th>
                                                <th className="py-3 px-4">Durasi</th>
                                                <th className="py-3 px-4">Materi Terhubung</th>
                                                <th className="py-3 px-4 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#DCE7F3]">
                                            {learningModules.map((lm) => (
                                                <tr key={lm.id} className="hover:bg-[#F8FBFF]/60 transition-colors">
                                                    <td className="py-3 px-4 text-center font-mono font-bold text-[#6B7C93]">
                                                        #{lm.sort_order || 1}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="space-y-0.5">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-mono text-[10px] font-bold text-[#0B63CE] bg-[#EAF5FF] px-1.5 py-0.5 rounded">
                                                                    {lm.code}
                                                                </span>
                                                                <span className="font-bold text-xs text-[#0E2747]">
                                                                    {lm.title}
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-[#6B7C93] line-clamp-1">
                                                                {lm.category} • Tingkat {lm.level}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                                            {lm.participant_path_id === 'all' || !lm.participant_path_id
                                                                ? 'Semua Jalur'
                                                                : lm.participant_path_id}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span
                                                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                                                lm.is_required
                                                                    ? 'bg-rose-100 text-rose-800'
                                                                    : 'bg-slate-100 text-slate-700'
                                                            }`}
                                                        >
                                                            {lm.is_required ? 'Wajib' : 'Pilihan'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 font-mono font-semibold text-[#0E2747]">
                                                        {lm.total_jp} JP
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="space-y-1">
                                                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0B63CE]">
                                                                <BookOpen className="w-3.5 h-3.5" />
                                                                {lm.materials?.length || lm.materials_count || 0} Koleksi Terhubung
                                                            </span>
                                                            {lm.materials && lm.materials.length > 0 && (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {lm.materials.slice(0, 3).map((mat) => (
                                                                        <span
                                                                            key={mat.id}
                                                                            className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 truncate max-w-[140px]"
                                                                            title={mat.title}
                                                                        >
                                                                            {mat.title}
                                                                        </span>
                                                                    ))}
                                                                    {lm.materials.length > 3 && (
                                                                        <span className="text-[9px] text-[#6B7C93]">
                                                                            +{lm.materials.length - 3} lagi
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDetachModule(lm)}
                                                            className="p-1.5 text-[#6B7C93] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                            title="Lepaskan dari Event"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </TableSurface>
                            )}
                        </div>

                        {/* SECTION 2: Master Paket CBT */}
                        <div className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs overflow-hidden">
                            <div className="px-6 py-4 border-b border-[#DCE7F3] bg-[#F8FBFF] flex items-center justify-between">
                                <div>
                                    <h4 className="font-display font-bold text-sm text-[#0E2747]">
                                        Paket Ujian CBT Terhubung ke Event
                                    </h4>
                                    <p className="text-[11px] text-[#6B7C93]">
                                        Paket ujian standar berbasis Bank Soal yang dialokasikan untuk peserta event ini.
                                    </p>
                                </div>
                                <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                    {linkedCbtPackages.length} Terpasang
                                </span>
                            </div>

                            {linkedCbtPackages.length === 0 ? (
                                <div className="p-10 text-center space-y-3">
                                    <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-100">
                                        <Award className="w-6 h-6" />
                                    </div>
                                    <div className="max-w-md mx-auto">
                                        <h5 className="font-bold text-sm text-[#0E2747]">Belum Ada Paket CBT Terhubung</h5>
                                        <p className="text-xs text-[#6B7C93] mt-1">
                                            Hubungkan paket ujian CBT yang berstatus "Siap Digunakan" atau "Dibuka" untuk sesi evaluasi peserta.
                                        </p>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        icon={<Plus className="w-4 h-4" />}
                                        onClick={() => setIsAttachCbtModalOpen(true)}
                                    >
                                        Hubungkan Paket CBT
                                    </Button>
                                </div>
                            ) : (
                                <TableSurface className="shadow-none">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b border-[#DCE7F3] bg-[#F8FBFF] text-[#6B7C93] font-bold">
                                                <th className="py-3 px-4 w-12 text-center">Urutan</th>
                                                <th className="py-3 px-4">Paket Ujian CBT</th>
                                                <th className="py-3 px-4">Target Jalur</th>
                                                <th className="py-3 px-4">Sifat</th>
                                                <th className="py-3 px-4">Syarat Absensi Sesi</th>
                                                <th className="py-3 px-4">Aturan Ujian</th>
                                                <th className="py-3 px-4">Status</th>
                                                <th className="py-3 px-4 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#DCE7F3]">
                                            {linkedCbtPackages.map((pkg) => (
                                                <tr key={pkg.id} className="hover:bg-[#F8FBFF]/60 transition-colors">
                                                    <td className="py-3 px-4 text-center font-mono font-bold text-[#6B7C93]">
                                                        #{pkg.sort_order || 1}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="space-y-0.5">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-mono text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                                                                    {pkg.code}
                                                                </span>
                                                                <span className="font-bold text-xs text-[#0E2747]">
                                                                    {pkg.title}
                                                                </span>
                                                            </div>
                                                            <span className="text-[10px] text-[#6B7C93]">
                                                                {pkg.exam_type_label || pkg.exam_type}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                                            {pkg.participant_path_id === 'all' || !pkg.participant_path_id
                                                                ? 'Semua Jalur'
                                                                : pkg.participant_path_id}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span
                                                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                                                pkg.is_required
                                                                    ? 'bg-rose-100 text-rose-800'
                                                                    : 'bg-slate-100 text-slate-700'
                                                            }`}
                                                        >
                                                            {pkg.is_required ? 'Wajib' : 'Pilihan'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        {pkg.requires_attendance_session_id ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                                                <Lock className="w-3 h-3 text-amber-600" />
                                                                Wajib Absen Sesi #{pkg.requires_attendance_session_id}
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] text-[#6B7C93]">
                                                                Tidak Ada Syarat
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 font-mono text-[11px] text-[#0E2747]">
                                                        {pkg.duration_minutes} Menit • KKM {pkg.passing_score}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            {pkg.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDetachCbt(pkg)}
                                                            className="p-1.5 text-[#6B7C93] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                            title="Lepaskan dari Event"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </TableSurface>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 4: PESERTA */}
                {activeTab === 'peserta' && (
                    <div className="space-y-6">
                        <section className="rounded-xl border border-[#DCE7F3] bg-white p-4 sm:p-5" aria-labelledby="event-tracks-heading">
                            <h3 id="event-tracks-heading" className="font-display text-base font-semibold text-[#0A3F82]">Jalur peserta event</h3>
                            <p className="mt-1 text-sm text-[#6B7C93]">Jalur master tersedia bersama jalur yang dibuat khusus untuk event ini.</p>
                            {tracks.some((track) => track.event_id === event.id) && (
                                <ul className="mt-4 flex flex-wrap gap-2" aria-label="Jalur khusus event">
                                    {tracks.filter((track) => track.event_id === event.id).map((track) => (
                                        <li key={track.id} className="rounded border border-[#DCE7F3] bg-[#F8FBFF] px-3 py-2 text-sm text-[#112743]">
                                            <strong className="text-[#0A3F82]">{track.code}</strong> · {track.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <form className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)_auto] sm:items-end" onSubmit={(e) => {
                                e.preventDefault();
                                trackForm.post(`/admin/event/${event.id}/jalur`, { onSuccess: () => trackForm.reset() });
                            }}>
                                <FormField label="Kode jalur" error={trackForm.errors.code} required>
                                    <Input value={trackForm.data.code} maxLength={20} onChange={(e) => trackForm.setData('code', e.target.value)} required />
                                </FormField>
                                <FormField label="Nama jalur" error={trackForm.errors.name} required>
                                    <Input value={trackForm.data.name} maxLength={255} onChange={(e) => trackForm.setData('name', e.target.value)} required />
                                </FormField>
                                <Button type="submit" variant="primary" disabled={trackForm.processing}>Tambah jalur</Button>
                            </form>
                        </section>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#DCE7F3]">
                            <div>
                                <h3 className="font-display font-bold text-sm text-[#0E2747]">
                                    Daftar Kenshi Peserta Event
                                </h3>
                                <p className="text-xs text-[#6B7C93]">
                                    Kelola penempatan jalur, kelompok rotasi kelas ganda (A1/A2), verifikasi dokumen, dan kehadiran.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <a
                                    href={`/admin/event/${event.id}/peserta/export-excel`}
                                    download
                                    className="inline-block"
                                >
                                    <Button
                                        variant="secondary"
                                        icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
                                    >
                                        Export Excel (Data & Login)
                                    </Button>
                                </a>
                                <Button
                                    variant="primary"
                                    icon={<Plus className="w-4 h-4" />}
                                    onClick={() => setIsAddParticipantModalOpen(true)}
                                >
                                    Daftarkan Peserta ke Event
                                </Button>
                            </div>
                        </div>

                        {/* Filter & Search Bar */}
                        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#DCE7F3]">
                            <div className="relative flex-1 min-w-[240px]">
                                <Search className="w-4 h-4 text-[#6B7C93] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    value={participantSearch}
                                    onChange={(e) => {
                                        setParticipantSearch(e.target.value);
                                        setParticipantPage(1);
                                    }}
                                    placeholder="Cari kenshi (nama, nomor kenshi, asal dojo, jalur)..."
                                    className="w-full pl-9 pr-8 py-2 border border-[#DCE7F3] rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#0B63CE] text-[#0E2747]"
                                />
                                {participantSearch && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setParticipantSearch('');
                                            setParticipantPage(1);
                                        }}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7C93] hover:text-[#0E2747]"
                                        aria-label="Hapus pencarian"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-[#6B7C93] font-medium">Jalur:</span>
                                    <select
                                        value={participantTrackFilter}
                                        onChange={(e) => {
                                            setParticipantTrackFilter(e.target.value);
                                            setParticipantPage(1);
                                        }}
                                        className="border border-[#DCE7F3] rounded-lg px-2.5 py-1.5 text-xs bg-white text-[#0E2747] focus:outline-none focus:ring-2 focus:ring-[#0B63CE]"
                                    >
                                        <option value="all">Semua Jalur</option>
                                        {availableTrackOptions.map((code) => (
                                            <option key={code} value={code}>{code}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-[#6B7C93] font-medium">Status:</span>
                                    <select
                                        value={participantCheckinFilter}
                                        onChange={(e) => {
                                            setParticipantCheckinFilter(e.target.value);
                                            setParticipantPage(1);
                                        }}
                                        className="border border-[#DCE7F3] rounded-lg px-2.5 py-1.5 text-xs bg-white text-[#0E2747] focus:outline-none focus:ring-2 focus:ring-[#0B63CE]"
                                    >
                                        <option value="all">Semua Presensi</option>
                                        <option value="checked_in">Sudah Check-in</option>
                                        <option value="not_checked_in">Belum Check-in</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-[#6B7C93] font-medium">Baris:</span>
                                    <select
                                        value={participantPerPage}
                                        onChange={(e) => {
                                            setParticipantPerPage(e.target.value === 'all' ? 'all' : Number(e.target.value));
                                            setParticipantPage(1);
                                        }}
                                        className="border border-[#DCE7F3] rounded-lg px-2.5 py-1.5 text-xs bg-white text-[#0E2747] focus:outline-none focus:ring-2 focus:ring-[#0B63CE]"
                                    >
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                        <option value="all">Semua</option>
                                    </select>
                                </div>

                                {(participantSearch || participantTrackFilter !== 'all' || participantCheckinFilter !== 'all') && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setParticipantSearch('');
                                            setParticipantTrackFilter('all');
                                            setParticipantCheckinFilter('all');
                                            setParticipantPage(1);
                                        }}
                                        className="inline-flex items-center gap-1 text-xs text-[#B42355] hover:text-[#DD4D7C] px-2 py-1.5 rounded hover:bg-[#FFF1F5]"
                                    >
                                        <RotateCcw className="w-3 h-3" />
                                        <span>Reset</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs overflow-hidden">
                            <TableSurface className="shadow-none">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-[#DCE7F3] bg-slate-50 text-[#0E2747] font-semibold text-[11px] uppercase tracking-wider">
                                            <th className="px-4 py-3">Nama Kenshi</th>
                                            <th className="px-4 py-3">Jalur & Rotasi</th>
                                            <th className="px-4 py-3">DAN & Asal Dojo</th>
                                            <th className="px-4 py-3">Status Check-in</th>
                                            <th className="px-4 py-3">Administrasi</th>
                                            <th className="px-4 py-3">Nilai Teori</th>
                                            <th className="px-4 py-3">Nilai Praktik</th>
                                            <th className="px-4 py-3 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#DCE7F3]/60">
                                        {paginatedParticipants.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-8 text-center text-xs text-[#6B7C93]">
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <Users className="w-8 h-8 text-slate-300" />
                                                        <p className="font-medium text-[#112743]">Tidak ada data peserta</p>
                                                        <p className="text-[11px] text-[#6B7C93]">
                                                            {participantSearch || participantTrackFilter !== 'all' || participantCheckinFilter !== 'all'
                                                                ? 'Coba sesuaikan kata kunci pencarian atau filter yang dipilih.'
                                                                : 'Belum ada peserta yang terdaftar pada event ini.'}
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedParticipants.map((p) => (
                                                <tr key={p.id} className="hover:bg-[#F8FBFF] transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="font-bold text-[#0E2747]">{p.name}</div>
                                                        <div className="text-[11px] font-mono text-[#6B7C93]">{p.kenshi_id}</div>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.track_badge}`}>
                                                            {p.track_code}
                                                        </span>
                                                        <span className="text-[11px] text-[#6B7C93] block mt-0.5">
                                                            Kelompok {p.rotation_group || 'belum ditetapkan'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="font-medium text-[#112743]">{p.dan_roman}</div>
                                                        <div className="text-[10px] text-[#6B7C93]">{p.origin}</div>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        {p.checked_in_at ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                                <Check className="w-3 h-3" />
                                                                <span>{p.checked_in_at}</span>
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                                                Belum Check-in
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                            p.admin_status === 'verified'
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : 'bg-amber-100 text-amber-800'
                                                        }`}>
                                                            {p.admin_status === 'verified' ? 'Terverifikasi' : p.admin_status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 font-mono font-bold text-[#0E2747]">
                                                        {p.theory_score ?? '-'}
                                                    </td>
                                                    <td className="px-4 py-3 font-mono font-bold text-[#0E2747]">
                                                        {p.practice_score ?? '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => openEditParticipantModal(p)}
                                                                className="inline-flex min-h-11 min-w-11 items-center justify-center text-[#6B7C93] hover:bg-[#EAF5FF] hover:text-[#0B63CE] focus-visible:outline-2 focus-visible:outline-[#0B63CE]"
                                                                aria-label={`Edit peserta ${p.name}`}
                                                            >
                                                                <Edit3 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setAttendanceResetTarget({
                                                                    id: p.id,
                                                                    scope: 'participant',
                                                                    participant_name: p.name,
                                                                })}
                                                                className="inline-flex min-h-11 min-w-11 items-center justify-center text-[#B42355] hover:bg-[#FFF1F5] focus-visible:outline-2 focus-visible:outline-[#0B63CE]"
                                                                aria-label={`Reset seluruh hasil ${p.name}`}
                                                                title="Reset presensi, nilai, ujian, revisi, serta dokumen kelulusan"
                                                            >
                                                                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveParticipant(p)}
                                                                className="inline-flex min-h-11 min-w-11 items-center justify-center text-[#6B7C93] hover:bg-[#FDE8EF] hover:text-[#DD4D7C] focus-visible:outline-2 focus-visible:outline-[#0B63CE]"
                                                                aria-label={`Keluarkan peserta ${p.name}`}
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </TableSurface>

                            {/* Table Pagination Footer */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-[#DCE7F3] bg-[#F8FBFF]/60 text-xs text-[#6B7C93]">
                                <div>
                                    Menampilkan{' '}
                                    <span className="font-semibold text-[#112743]">
                                        {filteredParticipants.length > 0
                                            ? (participantPerPage === 'all' ? 1 : (safeParticipantPage - 1) * Number(participantPerPage) + 1)
                                            : 0}
                                    </span>
                                    –
                                    <span className="font-semibold text-[#112743]">
                                        {participantPerPage === 'all'
                                            ? filteredParticipants.length
                                            : Math.min(safeParticipantPage * Number(participantPerPage), filteredParticipants.length)}
                                    </span>{' '}
                                    dari <span className="font-semibold text-[#112743]">{filteredParticipants.length}</span> peserta
                                    {filteredParticipants.length !== (participants?.length || 0) && (
                                        <span className="ml-1 text-[#6B7C93]">
                                            (total {participants?.length || 0} kenshi)
                                        </span>
                                    )}
                                </div>

                                {totalParticipantPages > 1 && (
                                    <div className="flex items-center gap-1.5 select-none">
                                        <button
                                            type="button"
                                            disabled={safeParticipantPage <= 1}
                                            onClick={() => setParticipantPage((p) => Math.max(1, p - 1))}
                                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium border transition-colors ${
                                                safeParticipantPage <= 1
                                                    ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed'
                                                    : 'border-[#DCE7F3] text-[#0E2747] bg-white hover:bg-[#F8FBFF] hover:border-[#0B63CE]/40 active:bg-slate-100'
                                            }`}
                                            aria-label="Halaman sebelumnya"
                                        >
                                            <ChevronLeft className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">Sebelumnya</span>
                                        </button>

                                        <div className="flex items-center gap-1">
                                            {participantPageNumbers.map((p, idx) =>
                                                p === '...' ? (
                                                    <span key={`ellipsis-${idx}`} className="px-1.5 text-slate-400">
                                                        ...
                                                    </span>
                                                ) : (
                                                    <button
                                                        key={p}
                                                        type="button"
                                                        onClick={() => setParticipantPage(p)}
                                                        className={`min-w-8 h-8 px-2 rounded text-xs font-semibold transition-colors ${
                                                            safeParticipantPage === p
                                                                ? 'bg-[#0B63CE] text-white shadow-xs'
                                                                : 'bg-white border border-[#DCE7F3] text-[#0E2747] hover:bg-slate-50'
                                                        }`}
                                                        aria-current={safeParticipantPage === p ? 'page' : undefined}
                                                    >
                                                        {p}
                                                    </button>
                                                )
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            disabled={safeParticipantPage >= totalParticipantPages}
                                            onClick={() => setParticipantPage((p) => Math.min(totalParticipantPages, p + 1))}
                                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium border transition-colors ${
                                                safeParticipantPage >= totalParticipantPages
                                                    ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed'
                                                    : 'border-[#DCE7F3] text-[#0E2747] bg-white hover:bg-[#F8FBFF] hover:border-[#0B63CE]/40 active:bg-slate-100'
                                            }`}
                                            aria-label="Halaman berikutnya"
                                        >
                                            <span className="hidden sm:inline">Berikutnya</span>
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: FORMULIR PENDAFTARAN PENATARAN */}
                {activeTab === 'formulir' && (
                    <div className="space-y-6">
                        {/* Summary / Stats Cards */}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <div className="rounded-xl border border-[#DCE7F3] bg-white p-4 shadow-xs">
                                <p className="text-xs font-medium text-[#6B7C93]">Total Peserta</p>
                                <p className="mt-1 font-display text-2xl font-bold text-[#0E2747]">
                                    {stats.total_registration_forms ?? registrationForms.length}
                                </p>
                                <p className="mt-1 text-[11px] text-[#6B7C93]">Peserta terdaftar di event</p>
                            </div>
                            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 shadow-xs">
                                <p className="text-xs font-medium text-blue-700">Formulir Masuk</p>
                                <p className="mt-1 font-display text-2xl font-bold text-blue-900">
                                    {stats.submitted_registration_forms ?? registrationForms.filter(f => f.status === 'submitted' || f.status === 'verified').length}
                                </p>
                                <p className="mt-1 text-[11px] text-blue-600">Sudah mengisi formulir</p>
                            </div>
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
                                <p className="text-xs font-medium text-emerald-700">Terverifikasi</p>
                                <p className="mt-1 font-display text-2xl font-bold text-emerald-900">
                                    {stats.verified_registration_forms ?? registrationForms.filter(f => f.status === 'verified').length}
                                </p>
                                <p className="mt-1 text-[11px] text-emerald-600">Disetujui oleh admin</p>
                            </div>
                            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
                                <p className="text-xs font-medium text-amber-700">Belum Mengisi</p>
                                <p className="mt-1 font-display text-2xl font-bold text-amber-900">
                                    {stats.unfilled_registration_forms ?? registrationForms.filter(f => f.status === 'unfilled').length}
                                </p>
                                <p className="mt-1 text-[11px] text-amber-600">Menunggu pengisian peserta</p>
                            </div>
                        </div>

                        {/* Notice if all forms are fresh / unfilled */}
                        {(stats.submitted_registration_forms ?? 0) === 0 && (stats.verified_registration_forms ?? 0) === 0 && (
                            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
                                        <FileCheck className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-blue-950">
                                            Status Formulir Penataran: Bersih (Menunggu Pengisian Mandiri)
                                        </p>
                                        <p className="text-[11px] text-blue-800">
                                            Data formulir telah dikosongkan. Seluruh peserta ({stats.total_registration_forms ?? registrationForms.length} kenshi) berstatus "Belum Mengisi". Begitu kenshi mengirimkan formulir pendaftaran secara mandiri di portal, berkas akan muncul di tabel ini untuk diverifikasi admin PB PERKEMI.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Filter and Search Bar */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#DCE7F3] bg-white p-4 shadow-xs">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7C93]" />
                                <input
                                    type="text"
                                    value={formSearch}
                                    onChange={(e) => {
                                        setFormSearch(e.target.value);
                                        setFormPage(1);
                                    }}
                                    placeholder="Cari nama kenshi, NIK, DAN, atau dojo..."
                                    className="w-full rounded-lg border border-[#DCE7F3] py-2 pl-9 pr-3 text-xs text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <select
                                    value={formTrackFilter}
                                    onChange={(e) => {
                                        setFormTrackFilter(e.target.value);
                                        setFormPage(1);
                                    }}
                                    className="rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] px-3 py-2 text-xs font-medium text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                                >
                                    <option value="all">Semua Jalur / Profesi</option>
                                    <option value="pelatih">Pelatih (Daerah / Nasional)</option>
                                    <option value="penguji">Penguji (Daerah / Nasional)</option>
                                    <option value="wasit">Wasit (Daerah / Nasional)</option>
                                </select>

                                <select
                                    value={formStatusFilter}
                                    onChange={(e) => {
                                        setFormStatusFilter(e.target.value);
                                        setFormPage(1);
                                    }}
                                    className="rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] px-3 py-2 text-xs font-medium text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                                >
                                    <option value="all">Semua Status Formulir</option>
                                    <option value="verified">Terverifikasi</option>
                                    <option value="submitted">Menunggu Verifikasi (Terkirim)</option>
                                    <option value="unfilled">Belum Mengisi</option>
                                </select>

                                <select
                                    value={formPerPage}
                                    onChange={(e) => {
                                        setFormPerPage(Number(e.target.value));
                                        setFormPage(1);
                                    }}
                                    className="rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] px-3 py-2 text-xs font-medium text-[#112743] focus:border-[#0B63CE] focus:outline-none"
                                >
                                    <option value={10}>10 per hal</option>
                                    <option value={25}>25 per hal</option>
                                    <option value={50}>50 per hal</option>
                                    <option value={100}>100 per hal</option>
                                </select>
                            </div>
                        </div>

                        {/* Table of Participant Forms */}
                        <div className="rounded-xl border border-[#DCE7F3] bg-white shadow-xs overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="border-b border-[#DCE7F3] bg-[#F8FBFF] font-semibold text-[#112743]">
                                        <tr>
                                            <th className="py-3 px-4 w-12 text-center">No</th>
                                            <th className="py-3 px-4">Nama Kenshi & NIK</th>
                                            <th className="py-3 px-4">Tingkatan DAN & Asal</th>
                                            <th className="py-3 px-4">Jalur & Tingkat</th>
                                            <th className="py-3 px-4">Status Formulir</th>
                                            <th className="py-3 px-4">Tanggal Pengisian</th>
                                            <th className="py-3 px-4 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#DCE7F3]">
                                        {paginatedRegistrationForms.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-8 text-center text-sm text-[#6B7C93]">
                                                    Tidak ditemukan formulir yang sesuai filter.
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedRegistrationForms.map((rf, idx) => {
                                                const globalIdx = (formPage - 1) * formPerPage + idx + 1;
                                                const hasForm = rf.status !== 'unfilled';

                                                return (
                                                    <tr key={rf.event_participant_id || rf.participant_id} className="hover:bg-[#F8FBFF] transition-colors">
                                                        <td className="py-3 px-4 text-center font-mono text-[#6B7C93]">{globalIdx}</td>
                                                        <td className="py-3 px-4">
                                                            <div className="font-semibold text-[#0E2747]">{rf.participant_name}</div>
                                                            <div className="font-mono text-[11px] text-[#6B7C93]">{rf.kenshi_id_number}</div>
                                                            {rf.file_url && (
                                                                <div className="mt-1">
                                                                    <a
                                                                        href={rf.file_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1 rounded bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                                                                        title="Lihat / Unduh Berkas Scan"
                                                                    >
                                                                        <FileText className="h-3 w-3" />
                                                                        Scan: {rf.file_name || 'Dokumen'} ({rf.file_size_formatted || 'File'})
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className="inline-block rounded bg-[#EAF5FF] px-2 py-0.5 text-[11px] font-bold text-[#0B63CE]">
                                                                {rf.dan_level}
                                                            </span>
                                                            <div className="text-[11px] text-[#6B7C93] mt-0.5">
                                                                {rf.origin_dojo}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="font-semibold text-[#112743]">
                                                                {rf.form_type} ({rf.penataran_level})
                                                            </div>
                                                            <div className="text-[11px] text-[#6B7C93]">{rf.track_name}</div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            {rf.status === 'verified' ? (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
                                                                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                                                    Terverifikasi {rf.submission_mode === 'upload' ? '• Berkas' : ''}
                                                                </span>
                                                            ) : rf.status === 'submitted' ? (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-800 border border-blue-200">
                                                                    <FileCheck className="h-3 w-3 text-blue-600" />
                                                                    Menunggu Verifikasi {rf.submission_mode === 'upload' ? '• Berkas' : ''}
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600 border border-gray-200">
                                                                    Belum Mengisi
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4 text-[#6B7C93]">
                                                            {rf.submitted_at || '-'}
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                                                {hasForm && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setSelectedFormForModal(rf)}
                                                                        className="inline-flex items-center gap-1 rounded-md bg-[#0B63CE] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#0A3F82] transition-colors"
                                                                        title="Lihat formulir Word resmi"
                                                                    >
                                                                        <Eye className="h-3.5 w-3.5" />
                                                                        Lihat
                                                                    </button>
                                                                )}

                                                                {/* Tombol Upload Berkas (Bisa upload berkas scan/PDF langsung) */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setUploadModalParticipant(rf);
                                                                        setAdminUploadFormType(rf.form_type || 'PELATIH');
                                                                        setAdminUploadPenataranLevel(rf.penataran_level || 'Daerah');
                                                                        setAdminUploadFile(null);
                                                                        setAdminUploadNotes('');
                                                                    }}
                                                                    className="inline-flex items-center gap-1 rounded-md bg-purple-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 transition-colors"
                                                                    title="Upload berkas scan formulir PDF/DOCX/JPG untuk kenshi ini"
                                                                >
                                                                    <Upload className="h-3.5 w-3.5" />
                                                                    Upload
                                                                </button>

                                                                {/* Tombol Isi / Edit Data Formulir */}
                                                                <a
                                                                    href={`/event/${event.slug}/formulir-pendaftaran?participant_id=${rf.participant_id}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1 rounded-md border border-[#DCE7F3] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#112743] hover:bg-[#F8FBFF] hover:text-[#0B63CE] transition-colors"
                                                                    title="Isi formulir secara digital atau sesuaikan data-datanya"
                                                                >
                                                                    <FileEdit className="h-3.5 w-3.5 text-[#0B63CE]" />
                                                                    {hasForm ? 'Edit Data' : 'Isi Data'}
                                                                </a>

                                                                {rf.file_url && (
                                                                    <a
                                                                        href={rf.file_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1 rounded-md bg-indigo-50 border border-indigo-200 px-2 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                                                                        title="Lihat / unduh berkas scan dokumen terunggah"
                                                                    >
                                                                        <Download className="h-3.5 w-3.5" />
                                                                        Berkas
                                                                    </a>
                                                                )}

                                                                {rf.print_url && (
                                                                    <a
                                                                        href={rf.print_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1 rounded-md border border-[#DCE7F3] bg-white px-2 py-1.5 text-xs font-medium text-[#112743] hover:bg-[#F8FBFF] hover:text-[#0B63CE] transition-colors"
                                                                        title="Cetak formulir PB PERKEMI"
                                                                    >
                                                                        <Printer className="h-3.5 w-3.5" />
                                                                    </a>
                                                                )}

                                                                {hasForm && rf.status !== 'verified' && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleVerifyForm(rf.id)}
                                                                        disabled={isVerifyingForm}
                                                                        className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                                                                        title="Verifikasi formulir ini"
                                                                    >
                                                                        <Check className="h-3.5 w-3.5" />
                                                                        Verifikasi
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {totalFormPages > 1 && (
                                <div className="flex items-center justify-between border-t border-[#DCE7F3] px-4 py-3 bg-[#F8FBFF]">
                                    <div className="text-xs text-[#6B7C93]">
                                        Menampilkan <span className="font-semibold text-[#112743]">{(formPage - 1) * formPerPage + 1}</span> - <span className="font-semibold text-[#112743]">{Math.min(formPage * formPerPage, filteredRegistrationForms.length)}</span> dari <span className="font-semibold text-[#112743]">{filteredRegistrationForms.length}</span> peserta
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setFormPage((p) => Math.max(1, p - 1))}
                                            disabled={formPage === 1}
                                            className="rounded border border-[#DCE7F3] bg-white p-1 text-[#112743] disabled:opacity-40 hover:bg-gray-50"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        <span className="px-2 text-xs font-medium text-[#112743]">
                                            {formPage} / {totalFormPages}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setFormPage((p) => Math.min(totalFormPages, p + 1))}
                                            disabled={formPage === totalFormPages}
                                            className="rounded border border-[#DCE7F3] bg-white p-1 text-[#112743] disabled:opacity-40 hover:bg-gray-50"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 4: ABSENSI (DEDICATED ATTENDANCE MANAGEMENT) */}
                {activeTab === 'absensi' && (
                    <div className="space-y-6">
                        <section className="border border-[#DCE7F3] bg-white p-5 sm:p-6" aria-labelledby="arrival-heading">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="max-w-2xl">
                                    <h2 id="arrival-heading" className="font-display text-xl font-semibold text-[#0A3F82]">QR kedatangan awal event</h2>
                                    <p className="mt-2 text-sm text-[#6B7C93]">Peserta memindai QR ini sekali saat pertama tiba. Setelah itu, setiap hari memiliki QR kehadiran sendiri dan setiap sesi memiliki QR masuk ruangan yang terpisah.</p>
                                    {arrivalSession && <p className="mt-3 text-sm text-[#112743]">{arrivalSession.attendances_count} peserta tercatat · {arrivalSession.is_attendance_open ? 'Absensi dibuka' : 'Absensi ditutup'}</p>}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {!arrivalSession ? (
                                        <Button type="button" variant="primary" onClick={() => router.post(`/admin/event/${event.id}/kehadiran-awal`)}>Siapkan QR awal</Button>
                                    ) : (
                                        <>
                                            <Button type="button" variant="secondary" onClick={() => router.post(`/admin/event/${event.id}/sesi/${arrivalSession.id}/absensi/${arrivalSession.is_attendance_open ? 'tutup' : 'buka'}`)}>{arrivalSession.is_attendance_open ? 'Tutup absensi' : 'Buka absensi'}</Button>
                                            {arrivalSession.is_attendance_open && <Link href={`/admin/event/${event.id}/sesi/${arrivalSession.id}/cetak-qr`} className="inline-flex min-h-11 items-center border border-[#0B63CE] px-4 text-sm font-semibold text-[#0A3F82] hover:bg-[#EAF5FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE]">Lihat dan cetak QR</Link>}
                                        </>
                                    )}
                                </div>
                            </div>
                        </section>
                        {/* Attendance Top Metrics */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-4 rounded-xl bg-white border border-[#DCE7F3] shadow-xs">
                                <span className="text-[11px] text-[#6B7C93] uppercase font-mono">Total Presensi</span>
                                <div className="text-xl font-bold text-[#0E2747] mt-1">{attendances.length}</div>
                                <span className="text-[10px] text-[#6B7C93]">Tercatat di server</span>
                            </div>
                            <div className="p-4 rounded-xl bg-white border border-[#DCE7F3] shadow-xs">
                                <span className="text-[11px] text-[#6B7C93] uppercase font-mono">Hadir Tepat Waktu</span>
                                <div className="text-xl font-bold text-emerald-600 mt-1">
                                    {attendances.filter((a) => a.status === 'present').length}
                                </div>
                                <span className="text-[10px] text-emerald-700">Verifikasi QR / Short Code</span>
                            </div>
                            <div className="p-4 rounded-xl bg-white border border-[#DCE7F3] shadow-xs">
                                <span className="text-[11px] text-[#6B7C93] uppercase font-mono">Terlambat</span>
                                <div className="text-xl font-bold text-amber-600 mt-1">
                                    {attendances.filter((a) => a.status === 'late').length}
                                </div>
                                <span className="text-[10px] text-amber-700">&gt; 30 menit dari jadwal</span>
                            </div>
                            <div className="p-4 rounded-xl bg-white border border-[#DCE7F3] shadow-xs">
                                <span className="text-[11px] text-[#6B7C93] uppercase font-mono">Override Panitia</span>
                                <div className="text-xl font-bold text-purple-600 mt-1">
                                    {attendances.filter((a) => a.method === 'manual_admin').length}
                                </div>
                                <span className="text-[10px] text-purple-700">Dengan catatan audit</span>
                            </div>
                        </div>

                        {/* Actions Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#DCE7F3]">
                            <div>
                                <h3 className="font-display font-bold text-sm text-[#0E2747]">
                                    Log & Pengelolaan Kehadiran Peserta
                                </h3>
                                <p className="text-xs text-[#6B7C93]">
                                    Pantau presensi QR, catat override manual, atau generate kehadiran lengkap untuk seluruh kenshi.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2 items-center">
                                <Button
                                    variant="secondary"
                                    icon={<Trash2 className="h-4 w-4" />}
                                    disabled={participants.length === 0}
                                    className="border-[#DD4D7C]/40 text-[#B42355] hover:border-[#DD4D7C] hover:bg-[#FFF1F5]"
                                    onClick={() => setAttendanceResetTarget('all')}
                                >
                                    Reset semua hasil
                                </Button>
                                <Button
                                    variant="secondary"
                                    icon={<Edit3 className="w-4 h-4" />}
                                    onClick={() => {
                                        overrideForm.setData({
                                            event_session_id: Object.values(sessionsByDay).flatMap((d) => d.sessions)[0]?.id || '',
                                            participant_id: participants[0]?.participant_id || '',
                                            attendance_type: 'check_in',
                                            status: 'manual_override',
                                            notes: '',
                                        });
                                        setIsOverrideModalOpen(true);
                                    }}
                                >
                                    Override Manual
                                </Button>
                                <a
                                    href={`/admin/event/${event.id}/absensi/cetak-semua-qr`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block"
                                >
                                    <Button
                                        variant="secondary"
                                        icon={<Printer className="w-4 h-4 text-[#0B63CE]" />}
                                    >
                                        Cetak Semua QR Absensi
                                    </Button>
                                </a>
                                <Button
                                    variant="primary"
                                    icon={<Sparkles className="w-4 h-4" />}
                                    disabled={participants.length === 0 || isGeneratingAttendance}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                                    onClick={() => setIsGenerateAttendanceModalOpen(true)}
                                >
                                    Generate Absensi Semua
                                </Button>
                            </div>
                        </div>

                        {/* Filter & Search Bar */}
                        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#DCE7F3]">
                            <div className="relative flex-1 min-w-[240px]">
                                <Search className="w-4 h-4 text-[#6B7C93] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    value={attendanceSearch}
                                    onChange={(e) => {
                                        setAttendanceSearch(e.target.value);
                                        setAttendancePage(1);
                                    }}
                                    placeholder="Cari absensi (nama kenshi, topik sesi, dicatat oleh)..."
                                    className="w-full pl-9 pr-8 py-2 border border-[#DCE7F3] rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#0B63CE] text-[#0E2747]"
                                />
                                {attendanceSearch && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAttendanceSearch('');
                                            setAttendancePage(1);
                                        }}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7C93] hover:text-[#0E2747]"
                                        aria-label="Hapus pencarian"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-[#6B7C93] font-medium">Sesi:</span>
                                    <select
                                        value={attendanceSessionFilter}
                                        onChange={(e) => {
                                            setAttendanceSessionFilter(e.target.value);
                                            setAttendancePage(1);
                                        }}
                                        className="border border-[#DCE7F3] rounded-lg px-2.5 py-1.5 text-xs bg-white text-[#0E2747] focus:outline-none focus:ring-2 focus:ring-[#0B63CE] max-w-[200px] truncate"
                                    >
                                        <option value="all">Semua Sesi ({attendances.length})</option>
                                        {arrivalSession && <option value={arrivalSession.id}>Kedatangan awal</option>}
                                        {Object.values(sessionsByDay).flatMap((d) => d.sessions).map((s) => (
                                            <option key={s.id} value={s.id}>
                                                H{s.day_number} - {s.session_number}: {s.topic}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-[#6B7C93] font-medium">Status:</span>
                                    <select
                                        value={attendanceStatusFilter}
                                        onChange={(e) => {
                                            setAttendanceStatusFilter(e.target.value);
                                            setAttendancePage(1);
                                        }}
                                        className="border border-[#DCE7F3] rounded-lg px-2.5 py-1.5 text-xs bg-white text-[#0E2747] focus:outline-none focus:ring-2 focus:ring-[#0B63CE]"
                                    >
                                        <option value="all">Semua Status</option>
                                        <option value="present">Hadir</option>
                                        <option value="late">Terlambat</option>
                                        <option value="manual_override">Manual Override</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-[#6B7C93] font-medium">Baris:</span>
                                    <select
                                        value={attendancePerPage}
                                        onChange={(e) => {
                                            setAttendancePerPage(e.target.value === 'all' ? 'all' : Number(e.target.value));
                                            setAttendancePage(1);
                                        }}
                                        className="border border-[#DCE7F3] rounded-lg px-2.5 py-1.5 text-xs bg-white text-[#0E2747] focus:outline-none focus:ring-2 focus:ring-[#0B63CE]"
                                    >
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                        <option value="all">Semua</option>
                                    </select>
                                </div>

                                {(attendanceSearch || attendanceSessionFilter !== 'all' || attendanceStatusFilter !== 'all') && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAttendanceSearch('');
                                            setAttendanceSessionFilter('all');
                                            setAttendanceStatusFilter('all');
                                            setAttendancePage(1);
                                        }}
                                        className="inline-flex items-center gap-1 text-xs text-[#B42355] hover:text-[#DD4D7C] px-2 py-1.5 rounded hover:bg-[#FFF1F5]"
                                    >
                                        <RotateCcw className="w-3 h-3" />
                                        <span>Reset</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Attendance Log Table */}
                        <div className="bg-white rounded-xl border border-[#DCE7F3] shadow-xs overflow-hidden">
                            <TableSurface className="shadow-none">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-[#DCE7F3] bg-slate-50 text-[#0E2747] font-semibold text-[11px] uppercase tracking-wider">
                                            <th className="px-4 py-3">Nama Kenshi</th>
                                            <th className="px-4 py-3">Sesi Rundown</th>
                                            <th className="px-4 py-3">Jenis Absensi</th>
                                            <th className="px-4 py-3">Status Kehadiran</th>
                                            <th className="px-4 py-3">Waktu Pencatatan</th>
                                            <th className="px-4 py-3">Metode</th>
                                            <th className="px-4 py-3">Dicatat Oleh / Alasan</th>
                                            <th className="px-4 py-3 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#DCE7F3]/60">
                                        {paginatedAttendances.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="text-center py-10 text-xs text-[#6B7C93]">
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <UserCheck className="w-8 h-8 text-slate-300" />
                                                        <p className="font-medium text-[#112743]">Belum ada catatan absensi</p>
                                                        <p className="text-[11px] text-[#6B7C93]">
                                                            {attendanceSearch || attendanceSessionFilter !== 'all' || attendanceStatusFilter !== 'all'
                                                                ? 'Coba sesuaikan kata kunci pencarian atau filter yang dipilih.'
                                                                : 'Gunakan tombol "Generate Absensi Semua" untuk mencatat kehadiran seluruh peserta secara otomatis.'}
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedAttendances.map((att) => (
                                                <tr key={att.id} className="hover:bg-[#F8FBFF] transition-colors">
                                                    <td className="px-4 py-3 font-bold text-[#0E2747]">
                                                        {att.participant_name}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-semibold text-[#112743]">{att.session_topic}</div>
                                                        <div className="text-[10px] text-[#6B7C93]">Hari {att.day_number} • {att.session_number}</div>
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-[11px] text-[#0A3F82]">
                                                        {att.attendance_type === 'check_in' ? 'Masuk' : 'Keluar'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${att.status_badge}`}>
                                                            {att.status_label}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-[11px] text-[#6B7C93]">
                                                        {att.checked_in_at || '-'}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-[11px]">
                                                        {att.method === 'qr_scan' ? 'Scan QR' : att.method === 'short_code' ? 'Kode Sesi' : 'Manual Admin'}
                                                    </td>
                                                    <td className="px-4 py-3 text-[11px] text-[#6B7C93]">
                                                        <div>Oleh: <strong className="text-[#112743]">{att.recorded_by}</strong></div>
                                                        {att.notes && <div className="italic mt-0.5 text-[10px] text-[#6B7C93]">{att.notes}</div>}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button
                                                            type="button"
                                                            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[#B42355] transition-colors hover:bg-[#FFF1F5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] sm:min-h-9 sm:min-w-9"
                                                            aria-label={`Reset seluruh hasil ${att.participant_name}`}
                                                            title="Reset seluruh hasil peserta ini"
                                                            onClick={() => setAttendanceResetTarget(att)}
                                                        >
                                                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </TableSurface>

                            {/* Table Pagination Footer */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-[#DCE7F3] bg-[#F8FBFF]/60 text-xs text-[#6B7C93]">
                                <div>
                                    Menampilkan{' '}
                                    <span className="font-semibold text-[#112743]">
                                        {filteredAttendances.length > 0
                                            ? (attendancePerPage === 'all' ? 1 : (safeAttendancePage - 1) * Number(attendancePerPage) + 1)
                                            : 0}
                                    </span>
                                    –
                                    <span className="font-semibold text-[#112743]">
                                        {attendancePerPage === 'all'
                                            ? filteredAttendances.length
                                            : Math.min(safeAttendancePage * Number(attendancePerPage), filteredAttendances.length)}
                                    </span>{' '}
                                    dari <span className="font-semibold text-[#112743]">{filteredAttendances.length}</span> absensi
                                    {filteredAttendances.length !== (attendances?.length || 0) && (
                                        <span className="ml-1 text-[#6B7C93]">
                                            (total {attendances?.length || 0} catatan)
                                        </span>
                                    )}
                                </div>

                                {totalAttendancePages > 1 && (
                                    <div className="flex items-center gap-1.5 select-none">
                                        <button
                                            type="button"
                                            disabled={safeAttendancePage <= 1}
                                            onClick={() => setAttendancePage((p) => Math.max(1, p - 1))}
                                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium border transition-colors ${
                                                safeAttendancePage <= 1
                                                    ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed'
                                                    : 'border-[#DCE7F3] text-[#0E2747] bg-white hover:bg-[#F8FBFF] hover:border-[#0B63CE]/40 active:bg-slate-100'
                                            }`}
                                            aria-label="Halaman sebelumnya"
                                        >
                                            <ChevronLeft className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">Sebelumnya</span>
                                        </button>

                                        <div className="flex items-center gap-1">
                                            {attendancePageNumbers.map((p, idx) =>
                                                p === '...' ? (
                                                    <span key={`ellipsis-${idx}`} className="px-1.5 text-slate-400">
                                                        ...
                                                    </span>
                                                ) : (
                                                    <button
                                                        key={p}
                                                        type="button"
                                                        onClick={() => setAttendancePage(p)}
                                                        className={`min-w-8 h-8 px-2 rounded text-xs font-semibold transition-colors ${
                                                            safeAttendancePage === p
                                                                ? 'bg-[#0B63CE] text-white shadow-xs'
                                                                : 'bg-white border border-[#DCE7F3] text-[#0E2747] hover:bg-slate-50'
                                                        }`}
                                                        aria-current={safeAttendancePage === p ? 'page' : undefined}
                                                    >
                                                        {p}
                                                    </button>
                                                )
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            disabled={safeAttendancePage >= totalAttendancePages}
                                            onClick={() => setAttendancePage((p) => Math.min(totalAttendancePages, p + 1))}
                                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium border transition-colors ${
                                                safeAttendancePage >= totalAttendancePages
                                                    ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed'
                                                    : 'border-[#DCE7F3] text-[#0E2747] bg-white hover:bg-[#F8FBFF] hover:border-[#0B63CE]/40 active:bg-slate-100'
                                            }`}
                                            aria-label="Halaman berikutnya"
                                        >
                                            <span className="hidden sm:inline">Berikutnya</span>
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}


                {/* TAB 5: MATERI (MODULES & DIGITAL BOOKS) */}
                {activeTab === 'materi' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#DCE7F3]">
                            <div>
                                <h3 className="font-display font-bold text-sm text-[#0E2747]">
                                    Modul Kurikulum & Koleksi Buku Digital Penataran
                                </h3>
                                <p className="text-xs text-[#6B7C93]">
                                    Modul kurikulum event dan buku digital yang telah dihubungkan.
                                </p>
                            </div>
                            <Button
                                variant="primary"
                                icon={<Plus className="w-4 h-4" />}
                                onClick={() => {
                                    moduleForm.reset();
                                    setIsModuleModalOpen(true);
                                }}
                            >
                                Tambah Modul Kurikulum
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {modules.map((m) => (
                                <div
                                    key={m.id}
                                    className="p-5 rounded-xl bg-white border border-[#DCE7F3] shadow-xs hover:border-[#0B63CE]/50 transition-all flex flex-col justify-between space-y-4 group"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-xs font-bold text-[#0B63CE] bg-[#EAF5FF] px-2 py-0.5 rounded">
                                                {m.code}
                                            </span>
                                            <span className="text-xs font-bold text-[#EE9B25] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                                {m.duration_jp} JP
                                            </span>
                                        </div>

                                        <h3 className="font-bold text-sm text-[#0E2747] group-hover:text-[#0B63CE] transition-colors line-clamp-2">
                                            {m.title}
                                        </h3>

                                        <div className="text-[11px] text-[#6B7C93]">
                                            Instruktur: <span className="font-medium text-[#112743]">{m.speaker?.name || 'Belum ditugaskan'}</span>
                                        </div>

                                        {m.material && (
                                            <div className="p-2.5 rounded-lg bg-[#F8FBFF] border border-[#DCE7F3] text-[11px] space-y-1">
                                                <span className="text-[#6B7C93] block text-[10px]">Buku Digital Terhubung:</span>
                                                <div className="font-semibold text-[#0E2747] truncate">{m.material.title}</div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-3 border-t border-[#DCE7F3] flex items-center justify-between">
                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#0A3F82] bg-[#EAF5FF] px-2 py-0.5 rounded border border-[#DCE7F3]">
                                            {m.publication_status === 'published' ? 'Terbit' : m.publication_status === 'review' ? 'Dalam peninjauan' : 'Draft'}
                                        </span>

                                        {m.source_type === 'uploaded_pdf' && m.has_source_file ? (
                                            <a href={`/admin/event/${event.id}/modul/${m.id}/pdf`} className="inline-flex min-h-11 items-center px-3 text-xs font-semibold text-[#0B63CE] hover:underline focus-visible:outline-2 focus-visible:outline-[#0B63CE]">Unduh PDF</a>
                                        ) : ['external_link', 'video'].includes(m.source_type) && m.source_url ? (
                                            <a href={m.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center px-3 text-xs font-semibold text-[#0B63CE] hover:underline focus-visible:outline-2 focus-visible:outline-[#0B63CE]">Buka sumber</a>
                                        ) : m.material?.slug ? (
                                            <Link
                                                href={`/koleksi/${m.material.slug}/baca`}
                                                target="_blank"
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0B63CE] text-white text-xs font-semibold hover:bg-[#0A3F82] transition-colors shadow-2xs"
                                            >
                                                <BookOpen className="w-3.5 h-3.5" />
                                                <span>Buka di Flipbook</span>
                                            </Link>
                                        ) : <span className="text-xs text-[#6B7C93]">Belum ada sumber materi</span>}
                                    </div>
                                </div>
                            ))}
                            {modules.length === 0 && <p className="text-sm text-[#6B7C93]">Belum ada modul kurikulum untuk event ini.</p>}
                        </div>
                    </div>
                )}

                {/* TAB 6: UJIAN CBT (CBT EXAM PACKAGES & QUESTION BANK) */}
                {activeTab === 'cbt' && (
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
                                    Master Paket Ujian CBT Penataran
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
                )}

                {activeTab === 'pengawasan' && (
                    <div className="space-y-5">
                        <div className="flex flex-col gap-3 rounded-xl border border-[#DCE7F3] bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="font-display text-xl font-semibold text-[#0A3F82]">Pengawasan Ujian CBT</h2>
                                <p className="mt-1 text-xs leading-relaxed text-[#6B7C93]">
                                    Riwayat status kamera dan perpindahan fokus peserta selama percobaan ujian berlangsung.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs">
                                <Badge variant="warning" dot>{proctoringEvents.filter((item) => item.severity === 'warning').length} peringatan</Badge>
                                <Badge variant="danger" dot>{proctoringEvents.filter((item) => item.severity === 'critical').length} kritis</Badge>
                            </div>
                        </div>

                        <TableSurface ariaLabel="Riwayat pengawasan CBT">
                            <table className="min-w-[780px]">
                                <thead>
                                    <tr>
                                        <th>Waktu</th>
                                        <th>Peserta</th>
                                        <th>Paket & Percobaan</th>
                                        <th>Kejadian</th>
                                        <th>Tingkat</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {proctoringEvents.map((item) => (
                                        <tr key={item.id}>
                                            <td className="whitespace-nowrap font-mono text-[11px] text-[#6B7C93]">{item.occurred_at}</td>
                                            <td className="font-semibold text-[#0E2747]">{item.participant_name}</td>
                                            <td>
                                                <span className="block font-semibold text-[#112743]">{item.package_title || 'Paket CBT'}</span>
                                                <span className="font-mono text-[10px] text-[#6B7C93]">{item.package_code || '-'} • Percobaan {item.attempt_number || '-'}</span>
                                            </td>
                                            <td>{item.type_label}</td>
                                            <td>
                                                <Badge
                                                    variant={item.severity === 'critical' ? 'danger' : item.severity === 'warning' ? 'warning' : 'primary'}
                                                    dot
                                                >
                                                    {item.severity === 'critical' ? 'Kritis' : item.severity === 'warning' ? 'Peringatan' : 'Informasi'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                    {proctoringEvents.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="py-10 text-center text-sm text-[#6B7C93]">
                                                Belum ada kejadian pengawasan CBT pada event ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </TableSurface>
                    </div>
                )}

                {/* TAB 7: PEMATERI */}
                {activeTab === 'pemateri' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#DCE7F3]">
                            <div>
                                <h3 className="font-display font-bold text-sm text-[#0E2747]">
                                    Dewan Guru & Instruktur Penataran
                                </h3>
                                <p className="text-xs text-[#6B7C93]">
                                    Pemateri internal PERKEMI dan narasumber eksternal pengampu materi kurikulum.
                                </p>
                            </div>
                            {isPortalAdmin && <Link
                                href="/admin/master/pemateri"
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0B63CE] text-white text-xs font-semibold hover:bg-[#0A3F82]"
                            >
                                <span>Kelola Master Pemateri</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                            </Link>}
                        </div>

                        <form onSubmit={(submission) => { submission.preventDefault(); speakerForm.post(`/admin/event/${event.id}/pemateri`, { onSuccess: () => speakerForm.reset() }); }} className="grid gap-3 border border-[#DCE7F3] bg-white p-5 sm:grid-cols-2">
                            <div><label htmlFor="event-speaker-name" className="mb-1 block text-xs font-semibold text-[#112743]">Nama pemateri</label><Input id="event-speaker-name" value={speakerForm.data.name} onChange={(change) => speakerForm.setData('name', change.target.value)} required error={speakerForm.errors.name} /></div>
                            <div><label htmlFor="event-speaker-type" className="mb-1 block text-xs font-semibold text-[#112743]">Jenis</label><Select id="event-speaker-type" value={speakerForm.data.type} onChange={(change) => speakerForm.setData('type', change.target.value)}><option value="internal">Internal</option><option value="external">Eksternal</option></Select></div>
                            <div><label htmlFor="event-speaker-degree" className="mb-1 block text-xs font-semibold text-[#112743]">Gelar</label><Input id="event-speaker-degree" value={speakerForm.data.title_degree} onChange={(change) => speakerForm.setData('title_degree', change.target.value)} /></div>
                            <div><label htmlFor="event-speaker-expertise" className="mb-1 block text-xs font-semibold text-[#112743]">Keahlian</label><Input id="event-speaker-expertise" value={speakerForm.data.specialization} onChange={(change) => speakerForm.setData('specialization', change.target.value)} /></div>
                            <Button type="submit" loading={speakerForm.processing}>Tambah pemateri</Button>
                        </form>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {speakers.filter((speaker) => speaker.event_id === event.id || speaker.sessions_count > 0 || speaker.modules_count > 0).map((sp) => (
                                <div
                                    key={sp.id}
                                    className="p-5 rounded-xl bg-white border border-[#DCE7F3] shadow-xs flex items-start gap-4"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-[#EAF5FF] text-[#0B63CE] flex items-center justify-center font-bold text-sm shrink-0 border border-[#0B63CE]/20">
                                        {sp.dan_roman ? sp.dan_roman : 'INST'}
                                    </div>
                                    <div className="space-y-1 min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-xs sm:text-sm text-[#0E2747] truncate">
                                                {sp.name}
                                            </h4>
                                            <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                                                sp.type === 'internal'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-emerald-100 text-emerald-800'
                                            }`}>
                                                {sp.type_label}
                                            </span>
                                        </div>
                                        <p className="text-xs text-[#6B7C93]">{sp.role_info}</p>
                                        <div className="pt-2 flex items-center gap-3 text-[11px] text-[#0A3F82] font-mono">
                                            <span>{sp.sessions_count} Sesi Rundown</span>
                                            <span>•</span>
                                            <span>{sp.total_jp} JP Diajarkan</span>
                                        </div>
                                        {sp.event_id === event.id && <button type="button" disabled={sp.sessions_count > 0 || sp.modules_count > 0} onClick={() => router.delete(`/admin/event/${event.id}/pemateri/${sp.id}`)} className="mt-2 min-h-11 px-2 text-xs font-semibold text-[#DD4D7C] hover:bg-[#FDE8EF] focus-visible:outline-2 focus-visible:outline-[#0B63CE] disabled:cursor-not-allowed disabled:opacity-50" aria-label={`Hapus pemateri ${sp.name}`}>Hapus</button>}
                                    </div>
                                </div>
                            ))}
                            {stats.total_speakers === 0 && <p className="text-sm text-[#6B7C93]">Belum ada pemateri untuk event ini.</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'sertifikat' && (
                    <section aria-labelledby="certificate-heading" className="space-y-6">
                        <div className="grid gap-5 border-b border-[#DCE7F3] pb-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.65fr)] lg:items-end">
                            <div className="max-w-3xl">
                                <div className="mb-3 flex items-center gap-3 text-sm font-semibold text-[#0B63CE]">
                                    <span className="h-px w-8 bg-[#0B63CE]" aria-hidden="true" />
                                    Dokumen kelulusan peserta
                                </div>
                                <h2 id="certificate-heading" className="text-balance font-display text-2xl font-semibold text-[#0A3F82] sm:text-3xl">E-Sertifikat & E-Transkrip</h2>
                                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6B7C93]">Kelola PDF final per peserta. Sertifikat memuat pengukuhan, sedangkan transkrip memuat rekap kompetensi dan beban JP. Seluruh berkas disimpan privat.</p>
                                <p className="mt-3 max-w-2xl border-l-2 border-[#0B63CE] bg-[#EAF5FF] px-3 py-2 text-xs leading-5 text-[#112743]">Cukup atur kode surat dan nomor awal. Nomor peserta diurutkan otomatis per jalur; bulan Romawi dan tahun mengikuti tanggal akhir kegiatan. PDF baru memakai A4 lanskap. Tempat/tanggal lahir belum tersimpan dan tetap kosong. Preview tersedia setelah dokumen dibuat.</p>
                            </div>
                            <div className="grid grid-cols-2 border border-[#DCE7F3] bg-white" aria-label="Panduan format dokumen">
                                <div className="border-r border-[#DCE7F3] p-4">
                                    <Award className="size-5 text-[#0B63CE]" aria-hidden="true" />
                                    <p className="mt-3 text-sm font-semibold text-[#0E2747]">E-Sertifikat</p>
                                    <p className="mt-1 text-xs leading-5 text-[#6B7C93]">Pengukuhan, identitas, dan masa berlaku.</p>
                                </div>
                                <div className="p-4">
                                    <FileText className="size-5 text-[#7957D5]" aria-hidden="true" />
                                    <p className="mt-3 text-sm font-semibold text-[#0E2747]">E-Transkrip</p>
                                    <p className="mt-1 text-xs leading-5 text-[#6B7C93]">Modul, fokus kompetensi, dan total JP.</p>
                                </div>
                            </div>
                        </div>

                        <details className="group border border-[#DCE7F3] bg-white">
                            <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 p-4 font-semibold text-[#0E2747] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE] sm:px-5">
                                <span>Pengaturan nomor surat event</span>
                                <span className="text-xs font-normal text-[#6B7C93]">Kosong = default Admin</span>
                            </summary>
                            <form onSubmit={(submitEvent) => { submitEvent.preventDefault(); documentNumberForm.put(`/admin/event/${event.id}/nomor-dokumen`, { preserveScroll: true }); }} className="border-t border-[#DCE7F3] p-4 sm:p-5">
                                <p className="max-w-3xl text-sm leading-6 text-[#6B7C93]">Isi hanya kategori yang perlu berbeda dari default Admin. Nomor urut dihitung per jalur peserta dalam event. Jika ada event lain dengan kode, bulan, dan tahun yang sama, atur nomor awal agar tidak bertabrakan. Nomor dokumen yang sudah terbit tidak diubah.</p>
                                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                                    {Object.entries(documentNumberLabels).map(([trackCode, label]) => (
                                        <fieldset key={trackCode} className="min-w-0 border border-[#DCE7F3] bg-[#F8FBFF] p-4">
                                            <legend className="px-1 text-sm font-semibold text-[#0E2747]">{label} ({trackCode})</legend>
                                            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem]">
                                                <Input
                                                    id={`event-number-${trackCode}-prefix`}
                                                    label="Kode surat khusus"
                                                    value={documentNumberForm.data.numbers[trackCode]?.prefix ?? ''}
                                                    onChange={(change) => documentNumberForm.setData('numbers', { ...documentNumberForm.data.numbers, [trackCode]: { ...documentNumberForm.data.numbers[trackCode], prefix: change.target.value.toUpperCase() } })}
                                                    placeholder={documentNumberDefaults[trackCode]?.prefix || ''}
                                                    error={documentNumberForm.errors[`numbers.${trackCode}.prefix`]}
                                                    maxLength={32}
                                                />
                                                <Input
                                                    id={`event-number-${trackCode}-start`}
                                                    label="Nomor awal khusus"
                                                    type="number"
                                                    min="1"
                                                    max="999999"
                                                    value={documentNumberForm.data.numbers[trackCode]?.start ?? ''}
                                                    onChange={(change) => documentNumberForm.setData('numbers', { ...documentNumberForm.data.numbers, [trackCode]: { ...documentNumberForm.data.numbers[trackCode], start: change.target.value } })}
                                                    placeholder={String(documentNumberDefaults[trackCode]?.start || 1)}
                                                    error={documentNumberForm.errors[`numbers.${trackCode}.start`]}
                                                />
                                            </div>
                                        </fieldset>
                                    ))}
                                </div>
                                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#DCE7F3] pt-4">
                                    {isPortalAdmin ? <Link href="/admin/pengaturan?tab=certificate_numbers" className="inline-flex min-h-11 items-center text-sm font-semibold text-[#0B63CE] hover:underline">Ubah default Admin</Link> : <span className="text-xs text-[#6B7C93]">Default hanya dapat diubah oleh Admin.</span>}
                                    <Button type="submit" icon={Save} loading={documentNumberForm.processing}>Simpan Nomor Event</Button>
                                </div>
                            </form>
                        </details>

                        {participants.length > 0 && (
                            <div className="flex flex-wrap items-center justify-between gap-4 border border-[#BCE0FD] bg-[#EAF5FF] p-4 sm:p-5">
                                <div>
                                    <h3 className="text-sm font-semibold text-[#0E2747]">Generate dokumen otomatis</h3>
                                    <p className="mt-1 max-w-2xl text-xs leading-5 text-[#425973]">Simpan pengaturan nomor event terlebih dahulu. Sertifikat dan e-transkrip yang belum ada akan dibuat berurutan per jalur; PDF serta nomor yang sudah terbit tetap digunakan.</p>
                                </div>
                                <Button
                                    type="button"
                                    icon={Sparkles}
                                    loading={isGeneratingDocuments}
                                    onClick={() => router.post(`/admin/event/${event.id}/dokumen/generate`, {}, {
                                        preserveScroll: true,
                                        onStart: () => setIsGeneratingDocuments(true),
                                        onFinish: () => setIsGeneratingDocuments(false),
                                    })}
                                >
                                    Generate semua yang belum ada
                                </Button>
                            </div>
                        )}

                        <dl className="grid border-y border-[#DCE7F3] bg-white sm:grid-cols-2 xl:grid-cols-4">
                            {[
                                { label: 'Peserta', value: participants.length },
                                { label: 'Sertifikat tersedia', value: stats.certificate_files_count || 0 },
                                { label: 'Transkrip tersedia', value: stats.transcript_files_count || 0 },
                                { label: 'Paket lengkap', value: stats.complete_document_sets_count || 0 },
                            ].map((item, index) => (
                                <div key={item.label} className={`px-5 py-4 ${index < 3 ? 'border-b border-[#DCE7F3] sm:border-b-0 sm:border-r' : ''}`}>
                                    <dt className="text-xs font-medium text-[#6B7C93]">{item.label}</dt>
                                    <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#0E2747]">{item.value}</dd>
                                </div>
                            ))}
                        </dl>

                        {participants.length === 0 ? (
                            <div className="border border-[#DCE7F3] bg-white p-6 sm:p-8">
                                <h3 className="font-display text-lg font-semibold text-[#0E2747]">Belum ada peserta</h3>
                                <p className="mt-2 text-sm leading-6 text-[#6B7C93]">Tambahkan peserta melalui tab Peserta sebelum mengunggah dokumen kelulusan.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="max-w-xl">
                                    <Input
                                        id="credential-participant-search"
                                        type="search"
                                        label="Cari peserta"
                                        name="credential_participant_search"
                                        autoComplete="off"
                                        value={credentialSearch}
                                        onChange={(event) => setCredentialSearch(event.target.value)}
                                        placeholder="Nama, NIK, atau jalur peserta…"
                                        icon={Search}
                                    />
                                </div>

                                {credentialParticipants.length === 0 ? (
                                    <p role="status" className="border border-[#DCE7F3] bg-white p-6 text-sm text-[#6B7C93]">Tidak ada peserta yang cocok dengan pencarian.</p>
                                ) : (
                                    <ul className="divide-y divide-[#DCE7F3] border-y border-[#DCE7F3] bg-white" aria-label="Dokumen kelulusan peserta">
                                        {credentialParticipants.map((participant) => (
                                            <ParticipantCredentialRow key={participant.id} eventId={event.id} participant={participant} />
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </section>
                )}

                {activeTab === 'revisi' && (
                    <section aria-labelledby="revision-heading" className="space-y-5">
                        <div className="border-b border-[#DCE7F3] pb-4">
                            <h2 id="revision-heading" className="font-display text-xl font-semibold text-[#0A3F82]">Cek Revisi Ujian Peserta</h2>
                            <p className="mt-2 text-sm text-[#6B7C93]">Makalah PDF dikirim oleh peserta yang nilainya di bawah KKM pada ujian dengan opsi revisi makalah.</p>
                        </div>
                        {examRevisions.length === 0 ? <p className="border border-[#DCE7F3] bg-white p-6 text-sm text-[#6B7C93]">Belum ada revisi ujian yang dikirim.</p> : (
                            <ul className="divide-y divide-[#DCE7F3] border-y border-[#DCE7F3]">
                                {examRevisions.map((revision) => (
                                    <li key={revision.id} className="grid gap-3 bg-white px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                                        <div>
                                            <p className="font-semibold text-[#0E2747]">{revision.participant_name}</p>
                                            <p className="text-sm text-[#6B7C93]">{revision.package_title} · Nilai {revision.score} · Dikirim {revision.submitted_at}</p>
                                            <p className="mt-1 text-xs font-semibold text-[#0A3F82]">Status: {revision.status === 'accepted' ? 'Diterima' : revision.status === 'rejected' ? 'Perlu perbaikan' : 'Menunggu pemeriksaan'}</p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Link href={`/admin/event/${event.id}/revisi/${revision.id}/baca`} className="inline-flex min-h-11 items-center border border-[#0B63CE] px-3 text-sm font-semibold text-[#0A3F82] hover:bg-[#EAF5FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE]">Baca flipbook</Link>
                                            <a href={revision.download_url} className="inline-flex min-h-11 items-center border border-[#DCE7F3] px-3 text-sm font-semibold text-[#0B63CE] hover:bg-[#EAF5FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE]">Unduh PDF</a>
                                            <button type="button" onClick={() => router.patch(`/admin/event/${event.id}/revisi/${revision.id}`, { revision_status: 'accepted' })} disabled={revision.status === 'accepted'} className="min-h-11 border border-[#20A47A] px-3 text-sm font-semibold text-[#0E2747] hover:bg-[#E8F8F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE] disabled:opacity-50">Terima</button>
                                            <button type="button" onClick={() => router.patch(`/admin/event/${event.id}/revisi/${revision.id}`, { revision_status: 'rejected' })} disabled={revision.status === 'rejected'} className="min-h-11 border border-[#DD4D7C] px-3 text-sm font-semibold text-[#0E2747] hover:bg-[#FDE8EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63CE] disabled:opacity-50">Minta perbaikan</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                )}

                {/* TAB 8: LEGENDA & SINGKATAN */}
                {activeTab === 'legenda' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Master Kode Jalur */}
                        <div className="bg-white rounded-xl border border-[#DCE7F3] p-6 shadow-xs space-y-4">
                            <h3 className="font-display font-bold text-sm text-[#0E2747] uppercase tracking-wider">
                                Master Kode Jalur Kualifikasi Kenshi
                            </h3>
                            <div className="space-y-3">
                                {tracks.map((t) => (
                                    <div key={t.id} className="p-3 rounded-lg bg-[#F8FBFF] border border-[#DCE7F3] flex items-start gap-3">
                                        <span className={`px-2 py-1 rounded text-xs font-mono font-bold shrink-0 ${t.badge_color}`}>
                                            {t.code}
                                        </span>
                                        <div className="space-y-0.5">
                                            <div className="font-bold text-xs text-[#0E2747]">{t.name}</div>
                                            <p className="text-[11px] text-[#6B7C93]">{t.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Glosarium Singkatan */}
                        <div className="bg-white rounded-xl border border-[#DCE7F3] p-6 shadow-xs space-y-4">
                            <h3 className="font-display font-bold text-sm text-[#0E2747] uppercase tracking-wider">
                                Glosarium Singkatan Resmi PERKEMI
                            </h3>
                            <form onSubmit={(submission) => { submission.preventDefault(); legendForm.post(`/admin/event/${event.id}/legenda`, { onSuccess: () => legendForm.reset() }); }} className="grid gap-2 border-b border-[#DCE7F3] pb-4 sm:grid-cols-2">
                                <div><label htmlFor="legend-code" className="mb-1 block text-xs font-semibold text-[#112743]">Singkatan</label><Input id="legend-code" value={legendForm.data.acronym} onChange={(change) => legendForm.setData('acronym', change.target.value)} required maxLength={30} error={legendForm.errors.acronym} /></div>
                                <div><label htmlFor="legend-name" className="mb-1 block text-xs font-semibold text-[#112743]">Arti</label><Input id="legend-name" value={legendForm.data.full_name} onChange={(change) => legendForm.setData('full_name', change.target.value)} required maxLength={255} error={legendForm.errors.full_name} /></div>
                                <div><label htmlFor="legend-category" className="mb-1 block text-xs font-semibold text-[#112743]">Kategori</label><Input id="legend-category" value={legendForm.data.category} onChange={(change) => legendForm.setData('category', change.target.value)} required maxLength={30} error={legendForm.errors.category} /></div>
                                <Button type="submit" loading={legendForm.processing} className="self-end">Tambah singkatan</Button>
                            </form>
                            <div className="divide-y divide-[#DCE7F3]">
                                {legends.map((l) => (
                                    <div key={l.id} className="py-2.5 flex items-start justify-between gap-4">
                                        <div>
                                            <span className="font-mono font-bold text-xs text-[#0B63CE]">{l.acronym}</span>
                                            <div className="text-xs font-medium text-[#112743]">{l.full_name}</div>
                                        </div>
                                        <span className="text-[10px] text-[#6B7C93] bg-slate-100 px-2 py-0.5 rounded font-mono uppercase">
                                            {l.category}
                                        </span>
                                        {l.event_id === event.id && <button type="button" onClick={() => router.delete(`/admin/event/${event.id}/legenda/${l.id}`)} className="min-h-11 px-2 text-xs font-semibold text-[#DD4D7C] hover:bg-[#FDE8EF] focus-visible:outline-2 focus-visible:outline-[#0B63CE]" aria-label={`Hapus singkatan ${l.acronym}`}>Hapus</button>}
                                    </div>
                                ))}
                                {legends.length === 0 && <p className="py-4 text-sm text-[#6B7C93]">Belum ada singkatan untuk event ini.</p>}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'dokumen' && (
                    <section aria-labelledby="event-documents" className="border border-[#DCE7F3] bg-white p-5 sm:p-6">
                        <h2 id="event-documents" className="font-display text-lg font-bold text-[#0E2747]">Dokumen & Ketentuan Event</h2>
                        <div className="mt-5 grid gap-6 md:grid-cols-2">
                            <div>
                                <h3 className="text-sm font-bold text-[#0E2747]">Persyaratan peserta</h3>
                                <form onSubmit={(submission) => { submission.preventDefault(); requirementForm.post(`/admin/event/${event.id}/persyaratan`, { onSuccess: () => requirementForm.reset() }); }} className="mt-3 space-y-2">
                                    <label htmlFor="event-requirement" className="block text-xs font-semibold text-[#112743]">Persyaratan baru</label>
                                    <Input id="event-requirement" value={requirementForm.data.item} onChange={(change) => requirementForm.setData('item', change.target.value)} required maxLength={255} error={requirementForm.errors.item} />
                                    <Checkbox checked={requirementForm.data.mandatory} onChange={(change) => requirementForm.setData('mandatory', change.target.checked)} label="Wajib" />
                                    <Button type="submit" loading={requirementForm.processing}>Tambah persyaratan</Button>
                                </form>
                                {event.requirements_checklist?.length ? (
                                    <ul className="mt-3 divide-y divide-[#DCE7F3] text-sm text-[#112743]">
                                        {event.requirements_checklist.map((item, index) => <li key={index} className="flex items-center justify-between gap-3 py-2"><span>{item.item || item.name || String(item)}{item.mandatory === false && <span className="ml-2 text-xs text-[#6B7C93]">Opsional</span>}</span><button type="button" onClick={() => router.delete(`/admin/event/${event.id}/persyaratan/${index}`)} className="min-h-11 px-2 text-xs font-semibold text-[#DD4D7C] hover:bg-[#FDE8EF] focus-visible:outline-2 focus-visible:outline-[#0B63CE]" aria-label={`Hapus persyaratan ${item.item || item.name}`}>Hapus</button></li>)}
                                    </ul>
                                ) : <p className="mt-3 text-sm text-[#6B7C93]">Belum ada persyaratan yang dicatat.</p>}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-[#0E2747]">Fasilitas yang dicatat</h3>
                                <form onSubmit={(submission) => { submission.preventDefault(); facilityForm.post(`/admin/event/${event.id}/fasilitas`, { onSuccess: () => facilityForm.reset() }); }} className="mt-3 space-y-2">
                                    <label htmlFor="event-facility" className="block text-xs font-semibold text-[#112743]">Fasilitas baru</label>
                                    <Input id="event-facility" value={facilityForm.data.name} onChange={(change) => facilityForm.setData('name', change.target.value)} required maxLength={255} error={facilityForm.errors.name} />
                                    <label htmlFor="event-facility-status" className="block text-xs font-semibold text-[#112743]">Status</label>
                                    <Select id="event-facility-status" value={facilityForm.data.status} onChange={(change) => facilityForm.setData('status', change.target.value)}><option value="prepared">Disiapkan</option><option value="ready">Siap</option><option value="unavailable">Belum tersedia</option></Select>
                                    <Button type="submit" loading={facilityForm.processing}>Tambah fasilitas</Button>
                                </form>
                                {event.facilities_checklist?.length ? (
                                    <ul className="mt-3 divide-y divide-[#DCE7F3] text-sm text-[#112743]">
                                        {event.facilities_checklist.map((item, index) => <li key={index} className="flex items-center justify-between gap-3 py-2"><span>{item.name || item.item || String(item)}{item.status && <span className="ml-2 text-xs text-[#6B7C93]">({item.status})</span>}</span><button type="button" onClick={() => router.delete(`/admin/event/${event.id}/fasilitas/${index}`)} className="min-h-11 px-2 text-xs font-semibold text-[#DD4D7C] hover:bg-[#FDE8EF] focus-visible:outline-2 focus-visible:outline-[#0B63CE]" aria-label={`Hapus fasilitas ${item.name || item.item}`}>Hapus</button></li>)}
                                    </ul>
                                ) : <p className="mt-3 text-sm text-[#6B7C93]">Belum ada fasilitas yang dicatat.</p>}
                            </div>
                        </div>
                    </section>
                )}

                {/* TAB 10: PENGATURAN EVENT */}
                {activeTab === 'pengaturan' && (
                    <div className="bg-white rounded-xl border border-[#DCE7F3] p-6 shadow-xs space-y-6">
                        <div>
                            <h3 className="font-display text-lg font-semibold text-[#0A3F82]">Kelola komponen event</h3>
                            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{settingSections.map((section) => <button key={section.id} type="button" onClick={() => setActiveTab(section.id)} className="min-h-11 border border-[#DCE7F3] bg-[#F8FBFF] px-4 py-3 text-left text-sm font-semibold text-[#112743] hover:border-[#0B63CE] hover:bg-[#EAF5FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]">{section.label} →</button>)}</div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-display font-bold text-sm text-[#0E2747]">
                                Pengaturan Operasional Event Penataran
                            </h3>
                            <p className="text-xs text-[#6B7C93]">
                                Absensi QR per hari dan sesi serta standar kelulusan ujian.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="p-4 rounded-xl bg-[#F8FBFF] border border-[#DCE7F3] space-y-2">
                                <span className="font-bold text-[#0E2747] block">Metode Check-in Event</span>
                                <p className="text-[#6B7C93]">
                                    Peserta memindai QR kehadiran harian sebelum QR sesi. Buat entri Kehadiran Harian pada setiap tanggal rundown dan buka absensinya saat kegiatan dimulai.
                                </p>
                                <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                                    {Object.values(sessionsByDay).filter((day) => day.sessions.some((session) => session.session_type_code === 'KEHADIRAN_HARIAN')).length} hari disiapkan
                                </span>
                            </div>

                            <div className="p-4 rounded-xl bg-[#F8FBFF] border border-[#DCE7F3] space-y-2">
                                <span className="font-bold text-[#0E2747] block">Validasi Absensi QR</span>
                                <p className="text-[#6B7C93]">
                                    QR memuat token acak dan kode singkat. Kode hanya berlaku selama absensi sesi dibuka.
                                </p>
                                <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">
                                    Validasi server aktif
                                </span>
                            </div>

                            <div className="p-4 rounded-xl bg-[#F8FBFF] border border-[#DCE7F3] space-y-2">
                                <span className="font-bold text-[#0E2747] block">KKM per Paket Ujian</span>
                                {cbtPackages.length ? <ul className="space-y-1 text-[#6B7C93]">{cbtPackages.map((pkg) => <li key={pkg.id}>{pkg.title}: {pkg.passing_score}</li>)}</ul> : <p className="text-[#6B7C93]">Belum ada paket ujian untuk event ini.</p>}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[#DCE7F3] flex justify-end">
                            <Link
                                href={`/admin/event/${event.id}/edit`}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B63CE] text-white text-xs font-semibold hover:bg-[#0A3F82]"
                            >
                                <Edit3 className="w-4 h-4" />
                                <span>Ubah Metadata & Pengaturan Lengkap</span>
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL: Tambah / Edit Sesi Rundown */}
            <Modal
                isOpen={isSessionModalOpen}
                onClose={() => setIsSessionModalOpen(false)}
                title={editingSession ? 'Edit Sesi Rundown' : `Tambah Sesi Rundown (Hari ${selectedDay})`}
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsSessionModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" form="session-form" variant="primary" loading={sessionForm.processing}>
                            Simpan Sesi
                        </Button>
                    </>
                }
            >
                <form id="session-form" onSubmit={handleSaveSession} className="space-y-4">
                    {Object.keys(sessionForm.errors).length > 0 && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                            <div className="space-y-1">
                                <p className="font-bold text-rose-900">Periksa kembali data sesi yang diinput:</p>
                                <ul className="list-disc list-inside space-y-0.5 text-rose-700">
                                    {Object.entries(sessionForm.errors).map(([field, msg]) => (
                                        <li key={field}>{msg}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <FormField label="Hari ke-" required error={sessionForm.errors.day_number}>
                            <Select
                                value={sessionForm.data.day_number}
                                onChange={(e) => {
                                    const newDay = parseInt(e.target.value) || 1;
                                    sessionForm.setData((prev) => ({
                                        ...prev,
                                        day_number: newDay,
                                        session_date: getDayIsoDate(newDay),
                                    }));
                                }}
                            >
                                {daysList.map((day) => {
                                    const dateInfo = getDayDateInfo(day);
                                    return (
                                        <option key={day} value={day}>
                                            Hari {day} {dateInfo ? `(${dateInfo})` : ''}
                                        </option>
                                    );
                                })}
                            </Select>
                        </FormField>

                        <FormField label="Nomor Sesi" required error={sessionForm.errors.session_number}>
                            <Input
                                value={sessionForm.data.session_number}
                                onChange={(e) => sessionForm.setData('session_number', e.target.value)}
                                placeholder="Sesi 1"
                                required
                            />
                        </FormField>

                        <FormField label="Durasi (JP)" required error={sessionForm.errors.duration_jp}>
                            <Input
                                type="number"
                                min={sessionForm.data.session_type_code === 'KEHADIRAN_HARIAN' ? '0' : '1'}
                                value={sessionForm.data.duration_jp}
                                onChange={(e) => sessionForm.setData('duration_jp', Number(e.target.value))}
                                disabled={sessionForm.data.session_type_code === 'KEHADIRAN_HARIAN'}
                                required
                            />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Waktu Mulai" required error={sessionForm.errors.start_time}>
                            <Input
                                type="time"
                                value={sessionForm.data.start_time}
                                onChange={(e) => sessionForm.setData('start_time', e.target.value)}
                                required
                            />
                        </FormField>

                        <FormField label="Waktu Selesai" required error={sessionForm.errors.end_time}>
                            <Input
                                type="time"
                                value={sessionForm.data.end_time}
                                onChange={(e) => sessionForm.setData('end_time', e.target.value)}
                                required
                            />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Jenis Sesi" required error={sessionForm.errors.event_session_type_id || sessionForm.errors.session_type_code}>
                            <Select
                                value={sessionForm.data.session_type_code === 'KEHADIRAN_HARIAN' ? 'daily' : sessionForm.data.event_session_type_id}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === 'daily') {
                                        sessionForm.setData((current) => ({
                                            ...current,
                                            event_session_type_id: '',
                                            session_type_code: 'KEHADIRAN_HARIAN',
                                            duration_jp: 0,
                                            attendance_setting: 'check_in',
                                            learning_module_id: '',
                                            event_module_id: '',
                                            material_id: '',
                                            cbt_exam_package_id: '',
                                        }));
                                    } else {
                                        const st = sessionTypes.find((item) => String(item.id) === String(val));
                                        const isCbt = st?.code === 'UJIAN' || st?.code === 'CBT' || st?.name?.toLowerCase().includes('ujian') || st?.name?.toLowerCase().includes('cbt');
                                        sessionForm.setData((current) => ({
                                            ...current,
                                            event_session_type_id: val,
                                            session_type_code: st?.code || '',
                                            duration_jp: current.duration_jp === 0 ? 1 : (current.duration_jp || 1),
                                            attendance_setting: current.attendance_setting || 'check_in',
                                            learning_module_id: isCbt ? '' : current.learning_module_id,
                                            event_module_id: isCbt ? '' : current.event_module_id,
                                            material_id: isCbt ? '' : current.material_id,
                                            cbt_exam_package_id: isCbt ? current.cbt_exam_package_id : '',
                                        }));
                                    }
                                }}
                            >
                                <option value="daily">Kehadiran Harian (QR awal hari)</option>
                                {sessionTypes.map((st) => (
                                    <option key={st.id} value={st.id}>
                                        {st.name}
                                    </option>
                                ))}
                            </Select>
                        </FormField>

                        <FormField label="Pengaturan Absensi" error={sessionForm.errors.attendance_setting}>
                            <Select
                                value={sessionForm.data.attendance_setting}
                                onChange={(e) => sessionForm.setData('attendance_setting', e.target.value)}
                            >
                                <option value="check_in">Absensi Masuk Saja</option>
                                <option value="check_in_out">Absensi Masuk & Keluar</option>
                                <option value="none">Tidak Diperlukan</option>
                            </Select>
                            <p className="mt-1 text-xs text-[#6B7C93]">Sesi yang memuat materi atau ujian wajib memakai absensi masuk.</p>
                        </FormField>
                    </div>

                    <FormField label="Topik / Judul Materi Sesi" required error={sessionForm.errors.topic}>
                        <Input
                            value={sessionForm.data.topic}
                            onChange={(e) => sessionForm.setData('topic', e.target.value)}
                            placeholder="Contoh: Falsafah Shorinji Kempo & Penyeragaman Goho"
                            required
                        />
                    </FormField>

                    {/* Kondisi Berdasarkan Jenis Sesi Sesuai Blueprint Antar-Master */}
                    {(() => {
                        const selectedSessionType = sessionTypes.find((st) => String(st.id) === String(sessionForm.data.event_session_type_id));
                        const stCode = selectedSessionType?.code || '';
                        const stName = selectedSessionType?.name?.toLowerCase() || '';

                        const isMateriType = stCode === 'MATERI' || stCode.startsWith('PAR_') || stName.includes('materi') || stName.includes('paralel') || stName.includes('teori');
                        const isCbtType = stCode === 'UJIAN' || stCode === 'CBT' || stName.includes('ujian') || stName.includes('cbt');
                        const isPraktikType = stCode === 'PRAKTIK' || stName.includes('praktik');
                        const isIstirahatType = stCode === 'ISTIRAHAT' || stName.includes('istirahat') || stName.includes('ishoma');

                        const activeSelectedLearningModule = availableMasterModules.find((lm) => String(lm.id) === String(sessionForm.data.learning_module_id));

                        if (sessionForm.data.session_type_code === 'KEHADIRAN_HARIAN') {
                            return <p className="border border-[#DCE7F3] bg-[#EAF5FF] p-3 text-sm text-[#112743]">QR ini mencatat kehadiran awal hari. Peserta harus memindainya sebelum dapat absen ke sesi lain pada tanggal yang sama.</p>;
                        }

                        if (isIstirahatType) {
                            return (
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#6B7C93]">
                                    Sesi Istirahat & Ishoma tidak memerlukan keterhubungan dengan Modul Pembelajaran maupun Paket CBT.
                                </div>
                            );
                        }

                        if (isCbtType) {
                            return (
                                <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Award className="w-4 h-4 text-purple-700" />
                                        <span className="font-bold text-xs text-[#0E2747]">Konfigurasi Sesi Ujian CBT</span>
                                    </div>
                                    <Combobox
                                        label="Pilih Paket Ujian CBT (Status Siap Digunakan / Dibuka)"
                                        value={sessionForm.data.cbt_exam_package_id}
                                        onChange={(value) => sessionForm.setData('cbt_exam_package_id', value)}
                                        options={availableMasterCbtPackages.map((pkg) => ({ value: pkg.id, label: `[${pkg.code}] ${pkg.title} (${pkg.exam_type_label || pkg.exam_type} - ${pkg.duration_minutes}m - ${pkg.status})` }))}
                                        placeholder="Pilih paket CBT tersedia"
                                        searchPlaceholder="Cari kode atau nama paket CBT…"
                                        error={sessionForm.errors.cbt_exam_package_id}
                                        required
                                    />

                                    <p className="border border-[#DCE7F3] bg-white p-3 text-xs text-[#112743]">Peserta harus absen masuk dengan QR sesi ini sebelum dapat memulai ujian.</p>
                                </div>
                            );
                        }

                        // Materi or Praktik or Pleno
                        return (
                            <div className="space-y-3 p-4 bg-[#F8FBFF] border border-[#DCE7F3] rounded-xl">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-[#0B63CE]" />
                                        <span className="font-bold text-xs text-[#0E2747]">
                                            {isMateriType ? 'Keterhubungan Modul Pembelajaran (Wajib)' : 'Keterhubungan Modul & Materi (Opsional)'}
                                        </span>
                                    </div>
                                    {isMateriType && (
                                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                            Wajib Memilih Modul
                                        </span>
                                    )}
                                </div>

                                <fieldset className="grid gap-2 sm:grid-cols-2">
                                    <legend className="mb-2 text-sm font-semibold text-[#112743]">Pilih jenis keterhubungan</legend>
                                    {[
                                        { value: 'master', label: 'Modul pembelajaran', helperText: 'Kurikulum Diktar & modul event ini' },
                                        { value: 'collection', label: 'Koleksi digital', helperText: 'E-book, video & pustaka PERKEMI' },
                                    ].map((link) => {
                                        const checked = selectedSessionLinks.includes(link.value) || (link.value === 'master' && isMateriType);
                                        return (
                                            <Checkbox
                                                key={link.value}
                                                checked={checked}
                                                disabled={link.value === 'master' && isMateriType}
                                                onChange={(change) => {
                                                    setSelectedSessionLinks((current) => change.target.checked ? [...current, link.value] : current.filter((value) => value !== link.value));
                                                    if (!change.target.checked) {
                                                        sessionForm.setData(link.value === 'master' ? 'learning_module_id' : 'material_id', '');
                                                        if (link.value === 'master') {
                                                            sessionForm.setData('event_module_id', '');
                                                        }
                                                    }
                                                }}
                                                label={link.label}
                                                helperText={link.helperText}
                                                className={`min-h-11 rounded-lg border px-3 py-2 ${checked ? 'border-[#0B63CE] bg-[#EAF5FF]' : 'border-[#DCE7F3] bg-white'}`}
                                            />
                                        );
                                    })}
                                </fieldset>

                                {(selectedSessionLinks.includes('master') || isMateriType) && (
                                    <Combobox
                                        label="Pilih Modul Pembelajaran"
                                        value={sessionForm.data.learning_module_id || ''}
                                        required={isMateriType}
                                        onChange={(modId) => {
                                            const mod = availableMasterModules.find((m) => String(m.id) === String(modId));
                                            sessionForm.setData((prev) => ({
                                                ...prev,
                                                learning_module_id: modId,
                                                topic: prev.topic ? prev.topic : (mod ? mod.title : ''),
                                            }));
                                        }}
                                        options={availableMasterModules.map((module) => ({
                                            value: module.id,
                                            label: `[${module.scope_label || (module.is_master ? 'Master Diktar' : 'Khusus Event')}] [${module.code}] ${module.title} (${module.total_jp} JP - ${module.category || 'Materi'})`
                                        }))}
                                        placeholder="Pilih modul pembelajaran"
                                        searchPlaceholder="Cari kode, nama modul, atau ketik Master / Khusus Event…"
                                        error={sessionForm.errors.learning_module_id}
                                    />
                                )}

                                {selectedSessionLinks.includes('collection') && activeSelectedLearningModule && (
                                    <div className="p-3 rounded-lg bg-white border border-[#DCE7F3] space-y-2">
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="font-semibold text-[#0E2747]">Koleksi Digital dalam Modul Ini:</span>
                                            <span className="text-[#6B7C93]">{activeSelectedLearningModule.materials?.length || 0} Terhubung</span>
                                        </div>

                                        <FormField label="Pilih Materi Koleksi Digital Utama Sesi (Opsional)" error={sessionForm.errors.material_id}>
                                            <Select
                                                value={sessionForm.data.material_id || ''}
                                                onChange={(e) => sessionForm.setData('material_id', e.target.value)}
                                            >
                                                <option value="">-- Buka Seluruh Materi Modul Pembelajaran --</option>
                                                {activeSelectedLearningModule.materials?.map((mat) => (
                                                    <option key={mat.id} value={mat.id}>
                                                        [{mat.type === 'video' ? 'VIDEO' : mat.type === 'book' ? 'E-BOOK' : 'DOKUMEN'}] {mat.title}
                                                    </option>
                                                ))}
                                                {publishedMaterials
                                                    .filter((pm) => !activeSelectedLearningModule.materials?.some((m) => m.id === pm.id))
                                                    .map((mat) => (
                                                        <option key={mat.id} value={mat.id}>
                                                            [Koleksi Luar: {mat.type?.toUpperCase()}] {mat.title}
                                                        </option>
                                                    ))}
                                            </Select>
                                        </FormField>
                                    </div>
                                )}

                                {selectedSessionLinks.includes('collection') && !activeSelectedLearningModule && (
                                    <FormField label="Atau Hubungkan Langsung ke Koleksi Buku Digital" error={sessionForm.errors.material_id}>
                                        <Select
                                            value={sessionForm.data.material_id}
                                            onChange={(e) => sessionForm.setData('material_id', e.target.value)}
                                        >
                                            <option value="">-- Tidak Terhubung ke Buku --</option>
                                            {publishedMaterials.map((mat) => (
                                                <option key={mat.id} value={mat.id}>
                                                    [{mat.code}] {mat.title}
                                                </option>
                                            ))}
                                        </Select>
                                    </FormField>
                                )}
                            </div>
                        );
                    })()}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Pemateri / Instruktur" error={sessionForm.errors.speaker_id}>
                            <Select
                                value={sessionForm.data.speaker_id}
                                onChange={(e) => sessionForm.setData('speaker_id', e.target.value)}
                            >
                                <option value="">-- Pilih Pemateri --</option>
                                {speakers.map((sp) => (
                                    <option key={sp.id} value={sp.id}>
                                        {sp.name} ({sp.type_label})
                                    </option>
                                ))}
                            </Select>
                        </FormField>

                        <FormField label="Ruangan / Lokasi" name="event-session-room" error={sessionForm.errors.room}>
                            <Input
                                id="event-session-room"
                                list="event-room-options"
                                value={sessionForm.data.room}
                                onChange={(e) => sessionForm.setData('room', e.target.value)}
                            />
                            <datalist id="event-room-options">{rooms.map((room) => <option key={room.id} value={room.name} />)}</datalist>
                        </FormField>
                    </div>

                    <FormField label="Jalur Peserta yang Mengikuti Sesi" error={sessionForm.errors.target_tracks}>
                        <div className="space-y-2 p-3.5 bg-slate-50 border border-[#DCE7F3] rounded-xl">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-[#6B7C93]">Pilih jalur peserta yang diwajibkan mengikuti sesi ini:</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => sessionForm.setData('target_tracks', tracks.map((t) => t.code))}
                                        className="text-[#0B63CE] hover:underline font-semibold text-[11px]"
                                    >
                                        Pilih Semua Jalur
                                    </button>
                                    <span className="text-[#DCE7F3]">•</span>
                                    <button
                                        type="button"
                                        onClick={() => sessionForm.setData('target_tracks', [])}
                                        className="text-[#6B7C93] hover:underline text-[11px]"
                                    >
                                        Kosongkan
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                                {tracks.map((t) => {
                                    const selectedTracks = sessionForm.data.target_tracks || [];
                                    const isChecked = selectedTracks.includes(t.code);
                                    return (
                                        <label
                                            key={t.id || t.code}
                                            className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                                                isChecked
                                                    ? 'bg-[#EAF5FF] border-[#0B63CE] text-[#0A3F82] font-semibold'
                                                    : 'bg-white border-[#DCE7F3] text-slate-700 hover:bg-slate-50'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={(e) => {
                                                    const cur = sessionForm.data.target_tracks || [];
                                                    if (e.target.checked) {
                                                        sessionForm.setData('target_tracks', [...cur, t.code]);
                                                    } else {
                                                        sessionForm.setData('target_tracks', cur.filter((c) => c !== t.code));
                                                    }
                                                }}
                                                className="rounded border-[#DCE7F3] text-[#0B63CE] focus:ring-[#0B63CE] w-3.5 h-3.5"
                                            />
                                            <span>{t.code} · {t.name}</span>
                                        </label>
                                    );
                                })}
                            </div>
                            <p className="text-[11px] text-[#6B7C93]">
                                Jika semua jalur dipilih atau dikosongkan, sesi akan berlaku untuk seluruh peserta (Pleno/Umum).
                            </p>
                        </div>
                    </FormField>
                </form>
            </Modal>

            {/* MODAL: Override Kehadiran Manual */}
            <Modal
                isOpen={isOverrideModalOpen}
                onClose={() => setIsOverrideModalOpen(false)}
                title="Override Kehadiran Manual (Admin)"
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsOverrideModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" form="override-form" variant="primary" loading={overrideForm.processing}>
                            Simpan Override
                        </Button>
                    </>
                }
            >
                <form id="override-form" onSubmit={handleSaveOverride} className="space-y-4">
                    <FormField label="Pilih Sesi Rundown" required>
                        <Select
                            value={overrideForm.data.event_session_id}
                            onChange={(e) => overrideForm.setData('event_session_id', e.target.value)}
                            required
                        >
                            <option value="">-- Pilih Sesi --</option>
                            {arrivalSession && <option value={arrivalSession.id}>Kedatangan awal event</option>}
                            {Object.values(sessionsByDay).flatMap((d) => d.sessions).map((s) => (
                                <option key={s.id} value={s.id}>
                                    Hari {s.day_number} - {s.session_number}: {s.topic}
                                </option>
                            ))}
                        </Select>
                    </FormField>

                    <FormField label="Pilih Peserta Kenshi" required>
                        <Select
                            value={overrideForm.data.participant_id}
                            onChange={(e) => overrideForm.setData('participant_id', e.target.value)}
                            required
                        >
                            <option value="">-- Pilih Peserta --</option>
                            {participants.map((p) => (
                                <option key={p.id} value={p.participant_id}>
                                    {p.name} ({p.track_code} - {p.kenshi_id})
                                </option>
                            ))}
                        </Select>
                    </FormField>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Tipe Absensi" required>
                            <Select
                                value={overrideForm.data.attendance_type}
                                onChange={(e) => overrideForm.setData('attendance_type', e.target.value)}
                            >
                                <option value="check_in">Absensi Masuk</option>
                                <option value="check_out">Absensi Keluar</option>
                            </Select>
                        </FormField>

                        <FormField label="Status Kehadiran" required>
                            <Select
                                value={overrideForm.data.status}
                                onChange={(e) => overrideForm.setData('status', e.target.value)}
                            >
                                <option value="present">Hadir Tepat Waktu</option>
                                <option value="late">Hadir Terlambat</option>
                                <option value="excused">Izin / Dispensasi Panitia</option>
                                <option value="manual_override">Override Panitia Khusus</option>
                                <option value="absent">Tidak Hadir</option>
                            </Select>
                        </FormField>
                    </div>

                    <FormField label="Alasan / Catatan Override (Wajib Audit)" required>
                        <Textarea
                            value={overrideForm.data.notes}
                            onChange={(e) => overrideForm.setData('notes', e.target.value)}
                            rows={3}
                            placeholder="Tuliskan alasan panitia melakukan perubahan status kehadiran..."
                            required
                        />
                    </FormField>
                </form>
            </Modal>

            {/* MODAL: Generate Absensi Seluruh Peserta */}
            <Modal
                isOpen={isGenerateAttendanceModalOpen}
                onClose={() => setIsGenerateAttendanceModalOpen(false)}
                title="Generate Absensi Semua Peserta"
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsGenerateAttendanceModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            loading={isGeneratingAttendance}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={handleGenerateAllAttendance}
                        >
                            Generate Absensi Sekarang
                        </Button>
                    </>
                }
            >
                <div className="space-y-4 text-xs text-[#112743]">
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-emerald-800">
                        <div className="flex items-start gap-2.5">
                            <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                            <div>
                                <p className="font-semibold text-emerald-900">Catat Kehadiran Lengkap Otomatis</p>
                                <p className="mt-1 text-[11px] leading-relaxed">
                                    Tindakan ini akan mencatat status presensi hadir secara serentak untuk seluruh kenshi terdaftar 
                                    (<strong>{participants.length} peserta</strong>) pada seluruh sesi penataran yang sesuai dengan jalurnya masing-masing.
                                    Data kehadiran yang sudah ada akan diperbarui tanpa membuat duplikat.
                                </p>
                            </div>
                        </div>
                    </div>

                    <FormField label="Pilih Target Jalur Peserta">
                        <Select
                            value={generateTrack}
                            onChange={(e) => setGenerateTrack(e.target.value)}
                        >
                            <option value="all">Semua Jalur ({participants.length} peserta)</option>
                            {availableTrackOptions.map((code) => {
                                const count = participants.filter((p) => p.track_code === code).length;
                                return (
                                    <option key={code} value={code}>
                                        Jalur {code} ({count} peserta)
                                    </option>
                                );
                            })}
                        </Select>
                    </FormField>

                    <FormField label="Status Kehadiran">
                        <Select
                            value={generateStatus}
                            onChange={(e) => setGenerateStatus(e.target.value)}
                        >
                            <option value="present">Hadir Tepat Waktu (Present)</option>
                            <option value="late">Terlambat (Late)</option>
                            <option value="manual_override">Manual Override</option>
                        </Select>
                    </FormField>

                    <div className="space-y-2 pt-2 border-t border-[#DCE7F3]">
                        <span className="font-semibold text-[#0E2747] block text-[11px] uppercase tracking-wider">
                            Cakupan Sesi yang Digenerate:
                        </span>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={generateIncludeArrival}
                                onChange={(e) => setGenerateIncludeArrival(e.target.checked)}
                                className="rounded border-slate-300 text-[#0B63CE] focus:ring-[#0B63CE]"
                            />
                            <span>Kedatangan awal event (Check-in awal kenshi)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={generateIncludeDaily}
                                onChange={(e) => setGenerateIncludeDaily(e.target.checked)}
                                className="rounded border-slate-300 text-[#0B63CE] focus:ring-[#0B63CE]"
                            />
                            <span>Presensi harian wajib seluruh hari kegiatan</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={generateIncludeSessions}
                                onChange={(e) => setGenerateIncludeSessions(e.target.checked)}
                                className="rounded border-slate-300 text-[#0B63CE] focus:ring-[#0B63CE]"
                            />
                            <span>Sesi materi, kelas paralel & ujian sesuai jalur</span>
                        </label>
                    </div>
                </div>
            </Modal>


            {/* MODAL: Buat / Edit Paket CBT */}
            <Modal
                isOpen={isCbtPackageModalOpen}
                onClose={() => setIsCbtPackageModalOpen(false)}
                title={editingCbtPackage ? 'Edit Paket Ujian CBT' : 'Buat Paket Ujian CBT Baru'}
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsCbtPackageModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" form="cbt-package-form" variant="primary" loading={cbtPackageForm.processing}>
                            Simpan Paket Ujian
                        </Button>
                    </>
                }
            >
                <form id="cbt-package-form" onSubmit={handleSaveCbtPackage} className="space-y-4">
                    <FormField label="Nama Paket Ujian" required>
                        <Input
                            value={cbtPackageForm.data.title}
                            onChange={(e) => cbtPackageForm.setData('title', e.target.value)}
                            placeholder="Contoh: Ujian Teori Kepelatihan Shorinji Kempo 2026"
                            required
                        />
                    </FormField>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Kode Ujian">
                            <Input
                                value={cbtPackageForm.data.code}
                                onChange={(e) => cbtPackageForm.setData('code', e.target.value)}
                                placeholder="CBT-KEMPO-01"
                            />
                        </FormField>

                        <FormField label="Jenis Ujian" required>
                            <Select
                                value={cbtPackageForm.data.exam_type}
                                onChange={(e) => cbtPackageForm.setData('exam_type', e.target.value)}
                            >
                                <option value="theory">Ujian Teori</option>
                                <option value="pre_test">Pre-Test</option>
                                <option value="post_test">Post-Test</option>
                                <option value="module_eval">Evaluasi Modul</option>
                                <option value="remedial">Remedial</option>
                            </Select>
                        </FormField>
                    </div>

                    <FormField label="Ambil soal dari modul soal master" error={cbtPackageForm.errors.question_module_id}>
                        <Select value={cbtPackageForm.data.question_module_id} onChange={(e) => cbtPackageForm.setData('question_module_id', e.target.value)}>
                            <option value="">Buat soal langsung di paket ini</option>
                            {availableQuestionModules.map((module) => <option key={module.id} value={module.id}>{module.code} — {module.title}</option>)}
                        </Select>
                    </FormField>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <FormField label="Durasi (Menit)" required>
                            <Input
                                type="number"
                                min="5"
                                max="300"
                                value={cbtPackageForm.data.duration_minutes}
                                onChange={(e) => cbtPackageForm.setData('duration_minutes', parseInt(e.target.value) || 60)}
                                required
                            />
                        </FormField>

                        <FormField label="Passing Grade" required>
                            <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={cbtPackageForm.data.passing_score}
                                onChange={(e) => cbtPackageForm.setData('passing_score', parseFloat(e.target.value) || 75.00)}
                                required
                            />
                        </FormField>

                        <FormField label="Batas Percobaan" required>
                            <Input
                                type="number"
                                min="1"
                                max="10"
                                value={cbtPackageForm.data.attempts_allowed}
                                onChange={(e) => cbtPackageForm.setData('attempts_allowed', parseInt(e.target.value) || 1)}
                                required
                            />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Revisi jika di bawah KKM" required>
                            <Select value={cbtPackageForm.data.revision_method} onChange={(e) => cbtPackageForm.setData('revision_method', e.target.value)}>
                                <option value="none">Tidak ada revisi</option>
                                <option value="retry">Mulai ulang ujian</option>
                                <option value="paper">Unggah makalah PDF</option>
                            </Select>
                        </FormField>
                        {cbtPackageForm.data.revision_method === 'paper' && <FormField label="Batas unggah makalah" required>
                            <Input type="datetime-local" required value={cbtPackageForm.data.revision_deadline} onChange={(e) => cbtPackageForm.setData('revision_deadline', e.target.value)} />
                        </FormField>}
                    </div>

                    <FormField label="Status Paket" required>
                        <Select
                            value={cbtPackageForm.data.status}
                            onChange={(e) => cbtPackageForm.setData('status', e.target.value)}
                        >
                            <option value="open">Dibuka untuk Peserta</option>
                            <option value="ready">Siap Digunakan (Terjadwal)</option>
                            <option value="draft">Draft (Belum Aktif)</option>
                            <option value="closed">Ditutup</option>
                        </Select>
                    </FormField>

                    <FormField label="Petunjuk Peserta">
                        <Textarea
                            value={cbtPackageForm.data.instructions}
                            onChange={(e) => cbtPackageForm.setData('instructions', e.target.value)}
                            rows={2}
                        />
                    </FormField>
                </form>
            </Modal>

            {/* MODAL: Tambah Soal CBT */}
            <Modal
                isOpen={isAddQuestionModalOpen}
                onClose={() => setIsAddQuestionModalOpen(false)}
                title={`Tambah Soal ke: ${activeCbtPackageForQuestion?.title || 'Paket CBT'}`}
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsAddQuestionModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" form="question-form" variant="primary">
                            Simpan Soal
                        </Button>
                    </>
                }
            >
                <form id="question-form" onSubmit={handleSaveQuestion} className="space-y-4">
                    <FormField label="Pertanyaan Soal" required>
                        <Textarea
                            value={questionForm.data.question_text}
                            onChange={(e) => questionForm.setData('question_text', e.target.value)}
                            rows={3}
                            placeholder="Tuliskan pertanyaan soal ujian..."
                            required
                        />
                    </FormField>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[#0E2747] block uppercase">Pilihan Jawaban</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Input
                                value={questionForm.data.option_a}
                                onChange={(e) => questionForm.setData('option_a', e.target.value)}
                                placeholder="Opsi A"
                                required
                            />
                            <Input
                                value={questionForm.data.option_b}
                                onChange={(e) => questionForm.setData('option_b', e.target.value)}
                                placeholder="Opsi B"
                                required
                            />
                            <Input
                                value={questionForm.data.option_c}
                                onChange={(e) => questionForm.setData('option_c', e.target.value)}
                                placeholder="Opsi C"
                                required
                            />
                            <Input
                                value={questionForm.data.option_d}
                                onChange={(e) => questionForm.setData('option_d', e.target.value)}
                                placeholder="Opsi D"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <FormField label="Kunci Jawaban Benar" required>
                            <Select
                                value={questionForm.data.correct_answer}
                                onChange={(e) => questionForm.setData('correct_answer', e.target.value)}
                            >
                                <option value="A">Pilihan A</option>
                                <option value="B">Pilihan B</option>
                                <option value="C">Pilihan C</option>
                                <option value="D">Pilihan D</option>
                            </Select>
                        </FormField>

                        <FormField label="Bobot Poin" required>
                            <Input
                                type="number"
                                step="1"
                                min="1"
                                value={questionForm.data.points}
                                onChange={(e) => questionForm.setData('points', parseFloat(e.target.value) || 10)}
                                required
                            />
                        </FormField>

                        <FormField label="Kategori / Topik">
                            <Input
                                value={questionForm.data.category}
                                onChange={(e) => questionForm.setData('category', e.target.value)}
                                placeholder="Falsafah / Goho / Juho"
                            />
                        </FormField>
                    </div>

                    <FormField label="Penjelasan Jawaban (Opsional)">
                        <Textarea
                            value={questionForm.data.explanation}
                            onChange={(e) => questionForm.setData('explanation', e.target.value)}
                            rows={2}
                            placeholder="Alasan mengapa kunci jawaban tersebut benar..."
                        />
                    </FormField>
                </form>
            </Modal>

            {/* MODAL: Tambah Modul Pembelajaran */}
            <Modal
                isOpen={isModuleModalOpen}
                onClose={() => setIsModuleModalOpen(false)}
                title="Tambah Modul Kurikulum Penataran"
                size="full"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModuleModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit" form="module-form" variant="primary" loading={moduleForm.processing}>
                            Simpan Modul
                        </Button>
                    </>
                }
            >
                <form id="module-form" onSubmit={handleSaveModule} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Kode Modul" required>
                            <Input
                                value={moduleForm.data.code}
                                onChange={(e) => moduleForm.setData('code', e.target.value)}
                                placeholder="MOD-WAS-02"
                                required
                            />
                        </FormField>

                        <FormField label="Durasi (JP)" required>
                            <Input
                                type="number"
                                min="1"
                                value={moduleForm.data.duration_jp}
                                onChange={(e) => moduleForm.setData('duration_jp', parseInt(e.target.value) || 1)}
                                required
                            />
                        </FormField>
                    </div>

                    <FormField label="Judul Modul" required>
                        <Input
                            value={moduleForm.data.title}
                            onChange={(e) => moduleForm.setData('title', e.target.value)}
                            placeholder="Contoh: Manajemen Perwasitan & Kode Etik Wasit PERKEMI"
                            required
                        />
                    </FormField>

                    <FormField label="Instruktur Pengampu">
                        <Select
                            value={moduleForm.data.speaker_id}
                            onChange={(e) => moduleForm.setData('speaker_id', e.target.value)}
                        >
                            <option value="">-- Pilih Instruktur --</option>
                            {speakers.map((sp) => (
                                <option key={sp.id} value={sp.id}>
                                    {sp.name}
                                </option>
                            ))}
                        </Select>
                    </FormField>

                    <FormField label="Sumber materi">
                        <Select value={moduleForm.data.source_type} onChange={(e) => moduleForm.setData('source_type', e.target.value)}>
                            <option value="collection">Ambil dari koleksi</option>
                            <option value="uploaded_pdf">Unggah PDF baru</option>
                            <option value="external_link">Tautan buku digital</option>
                            <option value="video">Video pembelajaran</option>
                        </Select>
                    </FormField>
                    {moduleForm.data.source_type === 'collection' && <FormField label="Buku digital dari koleksi">
                        <Select value={moduleForm.data.material_id} onChange={(e) => moduleForm.setData('material_id', e.target.value)}>
                            <option value="">Pilih jika diperlukan</option>
                            {publishedMaterials.map((mat) => <option key={mat.id} value={mat.id}>[{mat.code}] {mat.title}</option>)}
                        </Select>
                    </FormField>}
                    {moduleForm.data.source_type === 'uploaded_pdf' && <FileInput id="module-pdf" label="Berkas PDF, maksimal 50 MB" accept="application/pdf" required onChange={(event) => moduleForm.setData('source_file', event.target.files[0] || null)} error={moduleForm.errors.source_file} />}
                    {['external_link', 'video'].includes(moduleForm.data.source_type) && <FormField label={moduleForm.data.source_type === 'video' ? 'URL video YouTube atau Vimeo' : 'URL buku digital HTTPS'} error={moduleForm.errors.source_url}>
                        <Input type="url" required value={moduleForm.data.source_url} onChange={(e) => moduleForm.setData('source_url', e.target.value)} />
                    </FormField>}
                    <FormField label="Metode pembelajaran">
                        <Input value={moduleForm.data.delivery_method} onChange={(e) => moduleForm.setData('delivery_method', e.target.value)} />
                    </FormField>
                    <FormField label="Deskripsi modul">
                        <Textarea value={moduleForm.data.description} onChange={(e) => moduleForm.setData('description', e.target.value)} rows={3} />
                    </FormField>
                    <FormField label="Indikator pembelajaran">
                        <Textarea value={moduleForm.data.learning_indicators} onChange={(e) => moduleForm.setData('learning_indicators', e.target.value)} rows={2} />
                    </FormField>
                    <fieldset className="border-t border-[#DCE7F3] pt-3">
                        <legend className="text-xs font-semibold text-[#112743]">Jalur peserta</legend>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            {tracks.map((track) => <Checkbox key={track.id} checked={moduleForm.data.target_tracks.includes(track.code)} onChange={(event) => moduleForm.setData('target_tracks', event.target.checked ? [...moduleForm.data.target_tracks, track.code] : moduleForm.data.target_tracks.filter((code) => code !== track.code))} label={track.name} />)}
                        </div>
                    </fieldset>
                    <FormField label="Status publikasi">
                        <Select value={moduleForm.data.publication_status} onChange={(e) => moduleForm.setData('publication_status', e.target.value)}>
                            <option value="draft">Draft</option>
                            <option value="review">Dalam peninjauan</option>
                            <option value="published">Terbit</option>
                        </Select>
                    </FormField>
                </form>
            </Modal>

            <Modal
                isOpen={isAddParticipantModalOpen}
                onClose={() => setIsAddParticipantModalOpen(false)}
                title="Daftarkan Peserta ke Event"
                description="Pilih data master atau buat peserta baru, lalu tentukan jalurnya untuk event ini."
                size="xl"
                footer={<><Button variant="secondary" onClick={() => setIsAddParticipantModalOpen(false)}>Batal</Button><Button type="submit" form={participantMode === 'existing' ? 'participant-add-form' : 'participant-new-form'} variant="primary" loading={participantMode === 'existing' ? participantAddForm.processing : participantNewForm.processing} disabled={participantMode === 'existing' && availableParticipants.length === 0}>Daftarkan Peserta</Button></>}
            >
                <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Cara mendaftarkan peserta"><button type="button" onClick={() => setParticipantMode('existing')} aria-pressed={participantMode === 'existing'} className={`min-h-11 border px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-[#0B63CE] ${participantMode === 'existing' ? 'border-[#0B63CE] bg-[#EAF5FF] text-[#0A3F82]' : 'border-[#DCE7F3] text-[#112743] hover:border-[#0B63CE]'}`}>Ambil dari master</button><button type="button" onClick={() => setParticipantMode('new')} aria-pressed={participantMode === 'new'} className={`min-h-11 border px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-[#0B63CE] ${participantMode === 'new' ? 'border-[#0B63CE] bg-[#EAF5FF] text-[#0A3F82]' : 'border-[#DCE7F3] text-[#112743] hover:border-[#0B63CE]'}`}>Buat peserta baru</button></div>
                {participantMode === 'existing' && (availableParticipants.length === 0 ? <p className="border border-[#DCE7F3] bg-[#F8FBFF] p-4 text-sm text-[#6B7C93]">Semua peserta master sudah terdaftar pada event ini, atau data peserta master belum tersedia.</p> : (
                    <form id="participant-add-form" onSubmit={handleAddParticipant} className="space-y-4">
                        <Combobox
                            label="Peserta master"
                            value={participantAddForm.data.participant_id}
                            onChange={(value) => participantAddForm.setData('participant_id', value)}
                            options={availableParticipants.map((participant) => ({ value: participant.id, label: `${participant.name}${participant.kenshi_id_number ? ` · ${participant.kenshi_id_number}` : ''}` }))}
                            placeholder="Pilih peserta"
                            searchPlaceholder="Cari nama atau ID Kenshi…"
                            emptyText="Peserta yang dapat ditambahkan tidak ditemukan."
                            error={participantAddForm.errors.participant_id}
                            required
                        />
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField label="Jalur peserta" error={participantAddForm.errors.participant_track_id} required>
                                <Select value={participantAddForm.data.participant_track_id} onChange={(e) => participantAddForm.setData('participant_track_id', e.target.value)} required>
                                    <option value="">Pilih jalur…</option>
                                    {tracks.map((track) => <option key={track.id} value={track.id}>{track.code} · {track.name}</option>)}
                                </Select>
                            </FormField>
                            <FormField label="Kelompok rotasi" error={participantAddForm.errors.rotation_group}>
                                <Select value={participantAddForm.data.rotation_group} onChange={(e) => participantAddForm.setData('rotation_group', e.target.value)}><option value="A1">A1</option><option value="A2">A2</option></Select>
                            </FormField>
                        </div>
                        <FormField label="Status administrasi" error={participantAddForm.errors.admin_status} required>
                            <Select value={participantAddForm.data.admin_status} onChange={(e) => participantAddForm.setData('admin_status', e.target.value)}><option value="verified">Terverifikasi</option><option value="pending">Menunggu verifikasi</option></Select>
                        </FormField>
                    </form>
                ))}
                {participantMode === 'new' && <form id="participant-new-form" onSubmit={handleCreateParticipant} className="space-y-4">
                    <p className="border-l-2 border-[#0B63CE] bg-[#EAF5FF] px-4 py-3 text-sm text-[#112743]">Jika email sudah memiliki akun Peserta yang belum tertaut, akun tersebut akan dihubungkan otomatis.</p>
                    <div className="grid gap-4 sm:grid-cols-2"><FormField label="Nama peserta" error={participantNewForm.errors.name} required><Input value={participantNewForm.data.name} onChange={(e) => participantNewForm.setData('name', e.target.value)} required /></FormField><FormField label="Email peserta" error={participantNewForm.errors.email} required><Input type="email" value={participantNewForm.data.email} onChange={(e) => participantNewForm.setData('email', e.target.value)} required /></FormField></div>
                    <div className="grid gap-4 sm:grid-cols-2"><FormField label="Nomor Kenshi" error={participantNewForm.errors.kenshi_id}><Input value={participantNewForm.data.kenshi_id} onChange={(e) => participantNewForm.setData('kenshi_id', e.target.value)} /></FormField><FormField label="Telepon" error={participantNewForm.errors.phone}><Input type="tel" value={participantNewForm.data.phone} onChange={(e) => participantNewForm.setData('phone', e.target.value)} /></FormField></div>
                    <div className="grid gap-4 sm:grid-cols-2"><FormField label="Asal provinsi" error={participantNewForm.errors.origin} required><Input value={participantNewForm.data.origin} onChange={(e) => participantNewForm.setData('origin', e.target.value)} required /></FormField><FormField label="Dojo" error={participantNewForm.errors.dojo}><Input value={participantNewForm.data.dojo} onChange={(e) => participantNewForm.setData('dojo', e.target.value)} /></FormField></div>
                    <div className="grid gap-4 sm:grid-cols-2"><FormField label="Tingkat DAN" error={participantNewForm.errors.dan_level}><Input type="number" min="1" max="10" value={participantNewForm.data.dan_level} onChange={(e) => participantNewForm.setData('dan_level', e.target.value)} /></FormField><FormField label="Jalur peserta" error={participantNewForm.errors.participant_track_id} required><Select value={participantNewForm.data.participant_track_id} onChange={(e) => participantNewForm.setData('participant_track_id', e.target.value)} required><option value="">Pilih jalur…</option>{tracks.map((track) => <option key={track.id} value={track.id}>{track.code} · {track.name}</option>)}</Select></FormField></div>
                    <div className="grid gap-4 sm:grid-cols-2"><FormField label="Kelompok rotasi" error={participantNewForm.errors.rotation_group}><Select value={participantNewForm.data.rotation_group} onChange={(e) => participantNewForm.setData('rotation_group', e.target.value)}><option value="A1">A1</option><option value="A2">A2</option></Select></FormField><FormField label="Status administrasi" error={participantNewForm.errors.admin_status} required><Select value={participantNewForm.data.admin_status} onChange={(e) => participantNewForm.setData('admin_status', e.target.value)}><option value="verified">Terverifikasi</option><option value="pending">Menunggu verifikasi</option></Select></FormField></div>
                </form>}
            </Modal>

            {/* MODAL: Edit Peserta Event */}
            <Modal
                isOpen={!!editingParticipant}
                onClose={() => setEditingParticipant(null)}
                title={`Kelola Peserta: ${editingParticipant?.name}`}
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setEditingParticipant(null)}>
                            Batal
                        </Button>
                        <Button type="submit" form="participant-edit-form" variant="primary" loading={participantEditForm.processing}>
                            Simpan Perubahan
                        </Button>
                    </>
                }
            >
                <form id="participant-edit-form" onSubmit={handleUpdateParticipant} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Kelompok Rotasi">
                            <Select
                                value={participantEditForm.data.rotation_group}
                                onChange={(e) => participantEditForm.setData('rotation_group', e.target.value)}
                            >
                                <option value="A1">Kelompok A1</option>
                                <option value="A2">Kelompok A2</option>
                            </Select>
                        </FormField>

                        <FormField label="Status Administrasi">
                            <Select
                                value={participantEditForm.data.admin_status}
                                onChange={(e) => participantEditForm.setData('admin_status', e.target.value)}
                            >
                                <option value="verified">Terverifikasi</option>
                                <option value="pending">Menunggu Verifikasi</option>
                                <option value="rejected">Ditolak</option>
                            </Select>
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Nilai Teori">
                            <Input
                                type="number"
                                step="0.1"
                                value={participantEditForm.data.theory_score}
                                onChange={(e) => participantEditForm.setData('theory_score', e.target.value)}
                                placeholder="0 - 100"
                            />
                        </FormField>

                        <FormField label="Nilai Praktik">
                            <Input
                                type="number"
                                step="0.1"
                                value={participantEditForm.data.practice_score}
                                onChange={(e) => participantEditForm.setData('practice_score', e.target.value)}
                                placeholder="0 - 100"
                            />
                        </FormField>
                    </div>

                    <FormField label="Nomor Sertifikat">
                        <Input
                            value={participantEditForm.data.certificate_number}
                            onChange={(e) => participantEditForm.setData('certificate_number', e.target.value)}
                            placeholder="SK-PWAD-2026-001"
                        />
                    </FormField>
                </form>
            </Modal>

            {/* MODAL: Hubungkan Modul Pembelajaran */}
            <Modal
                isOpen={isAttachModuleModalOpen}
                onClose={() => setIsAttachModuleModalOpen(false)}
                title="Hubungkan Master Modul Pembelajaran ke Event"
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsAttachModuleModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            form="attach-module-form"
                            variant="primary"
                            loading={attachModuleForm.processing}
                        >
                            Hubungkan Modul
                        </Button>
                    </>
                }
            >
                <form id="attach-module-form" onSubmit={handleAttachModule} className="space-y-4">
                    <Combobox
                        label="Pilih Master Modul Pembelajaran"
                        value={attachModuleForm.data.learning_module_id}
                        onChange={(value) => attachModuleForm.setData('learning_module_id', value)}
                        options={availableMasterModules.map((module) => ({ value: module.id, label: `[${module.code}] ${module.title} (${module.total_jp} JP - ${module.category || 'Materi'})` }))}
                        placeholder="Pilih modul pembelajaran"
                        searchPlaceholder="Cari kode atau nama modul…"
                        error={attachModuleForm.errors.learning_module_id}
                        required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Target Jalur Peserta" required>
                            <Select
                                value={attachModuleForm.data.participant_path_id}
                                onChange={(e) => attachModuleForm.setData('participant_path_id', e.target.value)}
                            >
                                <option value="all">Semua Jalur Peserta</option>
                                {tracks.map((t) => (
                                    <option key={t.id} value={t.code}>
                                        {t.name} ({t.code})
                                    </option>
                                ))}
                            </Select>
                        </FormField>

                        <FormField label="Urutan Pembelajaran">
                            <Input
                                type="number"
                                min="1"
                                value={attachModuleForm.data.sort_order}
                                onChange={(e) => attachModuleForm.setData('sort_order', parseInt(e.target.value) || 1)}
                            />
                        </FormField>
                    </div>

                    <div className="rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] p-3">
                        <Checkbox
                            id="module_is_required"
                            checked={attachModuleForm.data.is_required}
                            onChange={(e) => attachModuleForm.setData('is_required', e.target.checked)}
                            label="Modul Wajib"
                            helperText="Peserta wajib menyelesaikan modul ini untuk kelulusan."
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Mulai Tersedia (Opsional)">
                            <Input
                                type="datetime-local"
                                value={attachModuleForm.data.availability_start_at}
                                onChange={(e) => attachModuleForm.setData('availability_start_at', e.target.value)}
                            />
                        </FormField>
                        <FormField label="Batas Akses (Opsional)">
                            <Input
                                type="datetime-local"
                                value={attachModuleForm.data.availability_end_at}
                                onChange={(e) => attachModuleForm.setData('availability_end_at', e.target.value)}
                            />
                        </FormField>
                    </div>
                </form>
            </Modal>

            {/* MODAL: Hubungkan Paket CBT */}
            <Modal
                isOpen={isAttachCbtModalOpen}
                onClose={() => setIsAttachCbtModalOpen(false)}
                title="Hubungkan Master Paket CBT ke Event"
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsAttachCbtModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            form="attach-cbt-form"
                            variant="primary"
                            loading={attachCbtForm.processing}
                        >
                            Hubungkan Paket CBT
                        </Button>
                    </>
                }
            >
                <form id="attach-cbt-form" onSubmit={handleAttachCbt} className="space-y-4">
                    <Combobox
                        label="Pilih Paket Ujian CBT (Siap Digunakan / Dibuka)"
                        value={attachCbtForm.data.cbt_exam_package_id}
                        onChange={(value) => attachCbtForm.setData('cbt_exam_package_id', value)}
                        options={availableMasterCbtPackages.map((pkg) => ({ value: pkg.id, label: `[${pkg.code}] ${pkg.title} (${pkg.exam_type_label || pkg.exam_type} - ${pkg.duration_minutes}m - ${pkg.status})` }))}
                        placeholder="Pilih paket CBT"
                        searchPlaceholder="Cari kode atau nama paket CBT…"
                        error={attachCbtForm.errors.cbt_exam_package_id}
                        required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Target Jalur Peserta" required>
                            <Select
                                value={attachCbtForm.data.participant_path_id}
                                onChange={(e) => attachCbtForm.setData('participant_path_id', e.target.value)}
                            >
                                <option value="all">Semua Jalur Peserta</option>
                                {tracks.map((t) => (
                                    <option key={t.id} value={t.code}>
                                        {t.name} ({t.code})
                                    </option>
                                ))}
                            </Select>
                        </FormField>

                        <FormField label="Urutan Evaluasi">
                            <Input
                                type="number"
                                min="1"
                                value={attachCbtForm.data.sort_order}
                                onChange={(e) => attachCbtForm.setData('sort_order', parseInt(e.target.value) || 1)}
                            />
                        </FormField>
                    </div>

                    <FormField label="Syarat Presensi Sesi Rundown (Opsional)">
                        <Select
                            value={attachCbtForm.data.requires_attendance_session_id}
                            onChange={(e) => attachCbtForm.setData('requires_attendance_session_id', e.target.value)}
                        >
                            <option value="">-- Tanpa Syarat Presensi Sesi (Langsung Terbuka) --</option>
                            {Object.values(sessionsByDay || {})
                                .flatMap((d) => d.sessions || [])
                                .map((s) => (
                                    <option key={s.id} value={s.id}>
                                        Hari {s.day_number} • {s.session_number} — {s.topic}
                                    </option>
                                ))}
                        </Select>
                        <p className="text-[11px] text-[#6B7C93] mt-1">
                            Bila dipilih, tombol "Mulai Ujian" di portal peserta hanya akan aktif bila kenshi telah tercatat hadir pada sesi tersebut.
                        </p>
                    </FormField>

                    <div className="rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] p-3">
                        <Checkbox
                            id="cbt_is_required"
                            checked={attachCbtForm.data.is_required}
                            onChange={(e) => attachCbtForm.setData('is_required', e.target.checked)}
                            label="Ujian Wajib"
                            helperText="Kelulusan peserta bergantung pada nilai paket ujian ini."
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Mulai Tersedia (Opsional)">
                            <Input
                                type="datetime-local"
                                value={attachCbtForm.data.availability_start_at}
                                onChange={(e) => attachCbtForm.setData('availability_start_at', e.target.value)}
                            />
                        </FormField>
                        <FormField label="Batas Akses (Opsional)">
                            <Input
                                type="datetime-local"
                                value={attachCbtForm.data.availability_end_at}
                                onChange={(e) => attachCbtForm.setData('availability_end_at', e.target.value)}
                            />
                        </FormField>
                    </div>
                </form>
            </Modal>

            {/* MODAL: Pratinjau Formulir Word PB PERKEMI */}
            {selectedFormForModal && (
                <Modal
                    isOpen={!!selectedFormForModal}
                    onClose={() => setSelectedFormForModal(null)}
                    title={`Formulir Penataran ${selectedFormForModal.form_type} — ${selectedFormForModal.participant_name}`}
                    size="4xl"
                    footer={
                        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
                            <div className="flex items-center gap-2">
                                {selectedFormForModal.status === 'verified' ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                        Terverifikasi {selectedFormForModal.verified_at ? `(${selectedFormForModal.verified_at})` : ''}
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={isVerifyingForm}
                                        onClick={() => handleVerifyForm(selectedFormForModal.id)}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
                                    >
                                        <Check className="h-4 w-4" />
                                        {isVerifyingForm ? 'Memverifikasi...' : 'Verifikasi & Setujui Formulir'}
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                {selectedFormForModal.print_url && (
                                    <a
                                        href={selectedFormForModal.print_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#0B63CE] bg-[#EAF5FF] px-4 py-2 text-xs font-semibold text-[#0B63CE] hover:bg-[#D5EBFF] transition-colors"
                                    >
                                        <Printer className="h-4 w-4" />
                                        Cetak / Unduh Format PB PERKEMI
                                    </a>
                                )}
                                <Button variant="secondary" onClick={() => setSelectedFormForModal(null)}>
                                    Tutup
                                </Button>
                            </div>
                        </div>
                    }
                >
                    <div className="max-h-[78vh] overflow-y-auto bg-slate-100 p-2 sm:p-5 rounded-lg">
                        {/* Banner Berkas Terunggah (jika ada) */}
                        {selectedFormForModal.file_url && (
                            <div className="mx-auto max-w-[210mm] mb-4 p-4 rounded-xl border border-indigo-200 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                                                Berkas Fisik / Scan
                                            </span>
                                            {selectedFormForModal.file_size_formatted && (
                                                <span className="text-xs text-slate-500">
                                                    ({selectedFormForModal.file_size_formatted})
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-bold text-slate-900 mt-0.5">
                                            {selectedFormForModal.original_file_name || selectedFormForModal.file_name || 'Berkas Formulir Pendaftaran'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={selectedFormForModal.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        Unduh / Buka Dokumen
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Word Sheet Look */}
                        <div className="mx-auto max-w-[210mm] bg-white p-6 sm:p-12 shadow-sm border border-slate-300 text-black font-serif leading-normal text-xs sm:text-sm space-y-5">
                            {/* Kop Surat Resmi PB PERKEMI dengan Logo */}
                            <div className="border-b-2 border-black pb-3 text-center">
                                <div className="flex items-center justify-center gap-3 mb-1">
                                    <img
                                        src="/images/perkemi-logo.png"
                                        alt="Logo PB PERKEMI"
                                        className="h-16 w-16 object-contain"
                                    />
                                    <div className="text-center font-sans">
                                        <div className="text-[12pt] font-black uppercase tracking-wider text-slate-900">
                                            PENGURUS BESAR
                                        </div>
                                        <div className="text-[13.5pt] font-black uppercase tracking-wide text-slate-950">
                                            PERSAUDARAAN SHORINJI KEMPO INDONESIA (PERKEMI)
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Lampiran Tag & Form Title */}
                            <div className="text-center space-y-0.5">
                                <div className="font-bold text-[11pt] tracking-widest uppercase">
                                    {selectedFormForModal.lampiran_label || (
                                        selectedFormForModal.form_type === 'PELATIH'
                                            ? (selectedFormForModal.penataran_level === 'Nasional' ? 'LAMPIRAN-B' : 'LAMPIRAN-A')
                                            : selectedFormForModal.form_type === 'PENGUJI'
                                            ? (selectedFormForModal.penataran_level === 'Nasional' ? 'LAMPIRAN-D' : 'LAMPIRAN-C')
                                            : (selectedFormForModal.penataran_level === 'Nasional' ? 'LAMPIRAN-B' : 'LAMPIRAN-A')
                                    )}
                                </div>
                                <h1 className="font-bold uppercase tracking-wide text-sm sm:text-base">
                                    PERMOHONAN PENATARAN {selectedFormForModal.form_type} {selectedFormForModal.penataran_level?.toUpperCase()}
                                </h1>
                                <p className="text-[9.5pt] italic text-slate-700">
                                    Diisi rangkap 4 (empat) yaitu untuk PB; Pengprov; Pengkab/Pengkot*; Pengdo.
                                </p>
                                <p className="text-[9.5pt] italic text-slate-700">
                                    Harap diketik atau ditulis tangan dengan huruf cetak.
                                </p>
                            </div>

                            {/* Recipient */}
                            <div className="pt-1 text-[11pt]">
                                <div>Kepada Yth.</div>
                                <div className="font-bold">PB PERKEMI</div>
                                <div>di Jakarta.</div>
                            </div>

                            {/* Salutation & Opening */}
                            <div>
                                <p className="font-semibold mb-1">Salam Persaudaraan,</p>
                                <p className="text-justify leading-relaxed">
                                    Dengan ini saya sampaikan permohonan untuk dapat mengikuti ujian{' '}
                                    <strong>Penataran {selectedFormForModal.form_type === 'PELATIH' ? 'Pelatih' : selectedFormForModal.form_type === 'PENGUJI' ? 'Penguji' : 'Wasit'} {selectedFormForModal.penataran_level}</strong>{' '}
                                    yang diselenggarakan oleh PB pada tanggal{' '}
                                    <strong>{selectedFormForModal.start_date || '24 September 2026'}</strong> sampai dengan{' '}
                                    <strong>{selectedFormForModal.end_date || '27 September 2026'}</strong>, di{' '}
                                    <strong>{selectedFormForModal.location || event.place || 'Mojokerto'}</strong>.
                                </p>
                            </div>

                            {/* Biodata List Format DOCX */}
                            <div className="space-y-1 text-xs sm:text-[10.5pt]">
                                <div className="grid grid-cols-[210px_10px_1fr] items-baseline">
                                    <span>N a m a Lengkap</span>
                                    <span>:</span>
                                    <span className="font-bold uppercase border-b border-dotted border-black pb-0.5">
                                        {selectedFormForModal.full_name}
                                    </span>
                                </div>
                                <div className="grid grid-cols-[210px_10px_1fr] items-baseline">
                                    <span>Tempat / Tanggal Lahir</span>
                                    <span>:</span>
                                    <span className="border-b border-dotted border-black pb-0.5">
                                        {selectedFormForModal.birth_place || '-'}, {selectedFormForModal.birth_date || '-'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-[210px_10px_1fr] items-baseline">
                                    <span>Nomor Induk Kenshi (NIK)</span>
                                    <span>:</span>
                                    <span className="font-mono font-bold border-b border-dotted border-black pb-0.5">
                                        {selectedFormForModal.kenshi_id_number}
                                    </span>
                                </div>
                                <div className="grid grid-cols-[210px_10px_1fr] items-baseline">
                                    <span>Tingkatan</span>
                                    <span>:</span>
                                    <span className="font-bold border-b border-dotted border-black pb-0.5">
                                        {selectedFormForModal.dan_level || '1 DAN'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-[210px_10px_1fr] items-baseline">
                                    <span>Alamat rumah / telepon</span>
                                    <span>:</span>
                                    <span className="border-b border-dotted border-black pb-0.5">
                                        {selectedFormForModal.home_address || '-'} / Telp: {selectedFormForModal.phone_number || '-'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-[210px_10px_1fr] items-baseline">
                                    <span>Pekerjaan / sekolah*</span>
                                    <span>:</span>
                                    <span className="border-b border-dotted border-black pb-0.5">
                                        {selectedFormForModal.occupation || '-'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-[210px_10px_1fr] items-baseline">
                                    <span>Alamat pekerjaan / sekolah*</span>
                                    <span>:</span>
                                    <span className="border-b border-dotted border-black pb-0.5">
                                        {selectedFormForModal.occupation_address || '-'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-[210px_10px_1fr] items-baseline">
                                    <span>Telepon pekerjaan / sekolah*</span>
                                    <span>:</span>
                                    <span className="border-b border-dotted border-black pb-0.5">
                                        {selectedFormForModal.occupation_phone || '-'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-[210px_10px_1fr] items-baseline">
                                    <span>Alamat Darurat & Telepon</span>
                                    <span>:</span>
                                    <span className="font-semibold border-b border-dotted border-black pb-0.5">
                                        {selectedFormForModal.emergency_address || '-'} / Telp: {selectedFormForModal.emergency_phone || '-'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-[210px_10px_1fr] items-baseline">
                                    <span>e-mail</span>
                                    <span>:</span>
                                    <span className="border-b border-dotted border-black pb-0.5">
                                        {selectedFormForModal.email || '-'}
                                    </span>
                                </div>
                            </div>

                            {/* Riwayat Piagam Gasnas 1-7 */}
                            <div className="pt-1 text-xs sm:text-[10.5pt]">
                                <div className="font-semibold mb-1">
                                    Piagam Gasnas, Gasnaswil atau Gasprov yang dimiliki:
                                </div>
                                <div className="space-y-0.5 pl-4 font-mono text-[10pt]">
                                    {Array.from({ length: 7 }, (_, i) => {
                                        const r = selectedFormForModal.gasnas_records?.[i] || { nomor: '', tanggal: '' };
                                        return (
                                            <div key={i} className="grid grid-cols-[20px_55px_1fr_55px_1fr] items-baseline gap-1">
                                                <span>{i + 1}.</span>
                                                <span className="font-sans">Nomor:</span>
                                                <span className="border-b border-dotted border-black min-h-[1.2rem] px-1 font-semibold">
                                                    {r.nomor || '-----------------------------'}
                                                </span>
                                                <span className="font-sans text-right">tanggal:</span>
                                                <span className="border-b border-dotted border-black min-h-[1.2rem] px-1 font-sans">
                                                    {r.tanggal || '------------------'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Bagian Sertifikat Berdasarkan Jalur & Level */}
                            {selectedFormForModal.form_type === 'PELATIH' && selectedFormForModal.penataran_level === 'Nasional' && (
                                <div className="pt-1 text-xs sm:text-[10.5pt] space-y-1">
                                    <div className="font-semibold">Sertifikat Kualifikasi yang dimiliki:</div>
                                    <div className="pl-4 space-y-0.5">
                                        <div className="grid grid-cols-[180px_10px_1fr] items-baseline">
                                            <span>Sertifikat Pelatih Daerah</span>
                                            <span>:</span>
                                            <span className="border-b border-dotted border-black">
                                                {selectedFormForModal.certificate_records?.find(c => c.jenis?.toLowerCase().includes('pelatih'))?.nomor
                                                    ? `Nomor: ${selectedFormForModal.certificate_records.find(c => c.jenis?.toLowerCase().includes('pelatih')).nomor}, Tanggal: ${selectedFormForModal.certificate_records.find(c => c.jenis?.toLowerCase().includes('pelatih')).tanggal}`
                                                    : 'Nomor: ---------------------, Tanggal ----------'}
                                            </span>
                                        </div>
                                        <div className="italic text-xs pl-8 text-slate-600">atau</div>
                                        <div className="grid grid-cols-[180px_10px_1fr] items-baseline">
                                            <span>Sertifikat Penguji Daerah</span>
                                            <span>:</span>
                                            <span className="border-b border-dotted border-black">
                                                {selectedFormForModal.certificate_records?.find(c => c.jenis?.toLowerCase().includes('penguji'))?.nomor
                                                    ? `Nomor: ${selectedFormForModal.certificate_records.find(c => c.jenis?.toLowerCase().includes('penguji')).nomor}, Tanggal: ${selectedFormForModal.certificate_records.find(c => c.jenis?.toLowerCase().includes('penguji')).tanggal}`
                                                    : 'Nomor: ---------------------, Tanggal ----------'}
                                            </span>
                                        </div>
                                        <div className="italic text-xs pl-8 text-slate-600">atau</div>
                                        <div className="grid grid-cols-[180px_10px_1fr] items-baseline">
                                            <span>Sertifikat Wasit Daerah</span>
                                            <span>:</span>
                                            <span className="border-b border-dotted border-black">
                                                {selectedFormForModal.certificate_records?.find(c => c.jenis?.toLowerCase().includes('wasit'))?.nomor
                                                    ? `Nomor: ${selectedFormForModal.certificate_records.find(c => c.jenis?.toLowerCase().includes('wasit')).nomor}, Tanggal: ${selectedFormForModal.certificate_records.find(c => c.jenis?.toLowerCase().includes('wasit')).tanggal}`
                                                    : 'Nomor: ---------------------, Tanggal ----------'}
                                            </span>
                                        </div>
                                        <div className="text-xs italic pl-2 pt-0.5">yang dimiliki.</div>
                                    </div>
                                </div>
                            )}

                            {selectedFormForModal.form_type === 'PENGUJI' && (
                                <div className="pt-1 text-xs sm:text-[10.5pt] space-y-1">
                                    <div className="font-semibold">Sertifikat Kualifikasi yang dimiliki:</div>
                                    <div className="pl-4 space-y-0.5">
                                        <div className="grid grid-cols-[180px_10px_1fr] items-baseline">
                                            <span>{selectedFormForModal.penataran_level === 'Nasional' ? 'Sertifikat Penguji Daerah' : 'Sertifikat Pelatih Daerah'}</span>
                                            <span>:</span>
                                            <span className="border-b border-dotted border-black">
                                                {selectedFormForModal.certificate_records?.[0]?.nomor
                                                    ? `Nomor: ${selectedFormForModal.certificate_records[0].nomor}, Tanggal: ${selectedFormForModal.certificate_records[0].tanggal}`
                                                    : 'Nomor: ---------------------, Tanggal ----------'}
                                            </span>
                                        </div>
                                        <div className="text-xs pl-8 font-semibold text-slate-700">
                                            {selectedFormForModal.penataran_level === 'Nasional' ? 'dan' : 'atau'}
                                        </div>
                                        <div className="grid grid-cols-[180px_10px_1fr] items-baseline">
                                            <span>Sertifikat Pelatih Nasional</span>
                                            <span>:</span>
                                            <span className="border-b border-dotted border-black">
                                                {selectedFormForModal.certificate_records?.[1]?.nomor
                                                    ? `Nomor: ${selectedFormForModal.certificate_records[1].nomor}, Tanggal: ${selectedFormForModal.certificate_records[1].tanggal}`
                                                    : 'Nomor: ---------------------, Tanggal ----------'}
                                            </span>
                                        </div>
                                        <div className="text-xs italic pl-2 pt-0.5">yang dimiliki.</div>
                                    </div>
                                </div>
                            )}

                            {selectedFormForModal.form_type === 'WASIT' && (
                                <div className="pt-1 text-xs sm:text-[10.5pt] space-y-1">
                                    <div className="font-semibold">Sertifikat Kualifikasi yang dimiliki:</div>
                                    <div className="pl-4 space-y-0.5">
                                        <div className="grid grid-cols-[180px_10px_1fr] items-baseline">
                                            <span>{selectedFormForModal.penataran_level === 'Nasional' ? 'Sertifikat Wasit Daerah' : 'Sertifikat Penguji Daerah'}</span>
                                            <span>:</span>
                                            <span className="border-b border-dotted border-black">
                                                {selectedFormForModal.certificate_records?.[0]?.nomor
                                                    ? `Nomor: ${selectedFormForModal.certificate_records[0].nomor}, Tanggal: ${selectedFormForModal.certificate_records[0].tanggal}`
                                                    : 'Nomor: ---------------------, Tanggal ----------'}
                                            </span>
                                        </div>
                                        <div className="text-xs pl-8 font-semibold text-slate-700">
                                            {selectedFormForModal.penataran_level === 'Nasional' ? 'dan' : 'atau'}
                                        </div>
                                        <div className="grid grid-cols-[180px_10px_1fr] items-baseline">
                                            <span>Sertifikat Penguji Nasional</span>
                                            <span>:</span>
                                            <span className="border-b border-dotted border-black">
                                                {selectedFormForModal.certificate_records?.[1]?.nomor
                                                    ? `Nomor: ${selectedFormForModal.certificate_records[1].nomor}, Tanggal: ${selectedFormForModal.certificate_records[1].tanggal}`
                                                    : 'Nomor: ---------------------, Tanggal ----------'}
                                            </span>
                                        </div>
                                        <div className="text-xs italic pl-2 pt-0.5">yang dimiliki.</div>
                                    </div>
                                </div>
                            )}

                            {/* Motto */}
                            <div className="pt-2 text-center font-bold italic tracking-wide text-xs sm:text-[11pt]">
                                "Demi Tanah Air, Demi Persaudaraan, Demi Kemanusiaan."
                            </div>

                            {/* Blok Tanda Tangan & Verifikasi (Identik foto referensi) */}
                            <div className="pt-2 grid grid-cols-2 gap-4 items-end">
                                {/* PB PERKEMI Verifikasi (Stempel Box Sesuai Foto User) */}
                                <div className="flex flex-col items-center justify-center text-center p-2 min-h-[130px]">
                                    <div className="text-[12pt] font-sans font-medium text-[#5B6B82] tracking-wide">
                                        PB PERKEMI Verifikasi
                                    </div>
                                    <div className="text-[14pt] font-sans font-bold text-[#0F172A] mt-3 tracking-tight">
                                        {selectedFormForModal.verified_by_name || 'Budi Santoso'}
                                    </div>
                                    {selectedFormForModal.verified_at && (
                                        <div className="text-[9pt] font-sans text-slate-500 mt-1">
                                            Terverifikasi: {selectedFormForModal.verified_at}
                                        </div>
                                    )}
                                </div>

                                {/* Pemohon Signature */}
                                <div className="text-center">
                                    <div>{selectedFormForModal.sign_place || 'Mojokerto'}, {selectedFormForModal.sign_date || '-'}</div>
                                    <div className="font-bold mt-0.5">Pemohon,</div>
                                    <div className="h-16 flex items-center justify-center my-0.5">
                                        {selectedFormForModal.signature_data ? (
                                            <img
                                                src={selectedFormForModal.signature_data}
                                                alt="Tanda Tangan Pemohon"
                                                className="max-h-14 object-contain"
                                            />
                                        ) : (
                                            <span className="text-slate-400 italic text-[11px]">(Tanda Tangan Pemohon)</span>
                                        )}
                                    </div>
                                    <div className="font-bold underline uppercase">
                                        {selectedFormForModal.applicant_name || selectedFormForModal.full_name}
                                    </div>
                                    <div className="text-[10pt] text-slate-700 font-mono">
                                        NIK: {selectedFormForModal.kenshi_id_number}
                                    </div>
                                </div>
                            </div>

                            {/* Footnotes */}
                            <div className="pt-2 border-t border-slate-300 text-[9.5pt] space-y-0.5 text-slate-800">
                                <div>Lampiran : {selectedFormForModal.photo_requirements || '1. 2 Helai Pas Foto(3 x 4)'}</div>
                                <div className="pl-16">2. Uang Penataran Rp. ------------------------------------.</div>
                                <div className="italic text-[9pt] pt-0.5">* Coret yang tidak perlu.</div>
                            </div>

                            {/* Surat Pernyataan dan Pembebasan (Waiver Sesuai DOCX) */}
                            <div className="mt-6 pt-6 border-t-2 border-dashed border-slate-300 space-y-3">
                                <div className="text-center space-y-0.5 mb-3">
                                    <div className="font-bold text-[11pt] tracking-widest uppercase">
                                        {selectedFormForModal.waiver_lampiran_label || (selectedFormForModal.form_type === 'WASIT' ? 'LAMPIRAN-C' : 'LAMPIRAN-E')}
                                    </div>
                                    <h2 className="font-bold text-[12.5pt] uppercase tracking-wide underline underline-offset-4">
                                        SURAT PERNYATAAN DAN PEMBEBASAN
                                    </h2>
                                </div>
                                <p className="font-semibold text-xs">Saya, yang bertanda tangan di bawah ini:</p>
                                <div className="space-y-1 pl-4 text-xs">
                                    <div className="grid grid-cols-[120px_10px_1fr]">
                                        <span>Nama</span>
                                        <span>:</span>
                                        <span className="font-bold uppercase border-b border-dotted border-black">{selectedFormForModal.full_name}</span>
                                    </div>
                                    <div className="grid grid-cols-[120px_10px_1fr]">
                                        <span>Alamat / Telp</span>
                                        <span>:</span>
                                        <span className="border-b border-dotted border-black">{selectedFormForModal.home_address || '-'}, Telp: {selectedFormForModal.phone_number || '-'}</span>
                                    </div>
                                    <div className="grid grid-cols-[120px_10px_1fr]">
                                        <span>NIK / Tingkatan</span>
                                        <span>:</span>
                                        <span className="border-b border-dotted border-black">{selectedFormForModal.kenshi_id_number} / {selectedFormForModal.dan_level || '1 DAN'}</span>
                                    </div>
                                </div>
                                <p className="text-justify text-xs leading-relaxed indent-6">
                                    Dengan ini Saya menyatakan dan menjamin dalam kondisi kesehatan jasmani dan rohani yang baik untuk mengikuti seluruh rangkaian kegiatan Penataran {selectedFormForModal.form_type} di [{selectedFormForModal.location || 'Mojokerto'}], dan sepenuhnya membebaskan PB PERKEMI dan segenap panitia dari segala tuntutan atas cedera yang mungkin terjadi selama kegiatan berlangsung.
                                </p>
                                <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded font-medium text-xs">
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                                    <span>Pernyataan dan pembebasan telah disetujui & ditandatangani oleh pemohon secara digital.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* MODAL: Upload Berkas Formulir Pendaftaran Peserta (Admin) */}
            <Modal
                isOpen={Boolean(uploadModalParticipant)}
                onClose={() => {
                    if (!isAdminUploading) {
                        setUploadModalParticipant(null);
                        setAdminUploadFile(null);
                        setAdminUploadNotes('');
                    }
                }}
                title="Unggah Berkas Formulir Pendaftaran Peserta"
                size="md"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setUploadModalParticipant(null);
                                setAdminUploadFile(null);
                                setAdminUploadNotes('');
                            }}
                            disabled={isAdminUploading}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            form="admin-upload-form"
                            variant="primary"
                            loading={isAdminUploading}
                            disabled={!adminUploadFile || isAdminUploading}
                        >
                            Unggah & Simpan Berkas
                        </Button>
                    </>
                }
            >
                <form id="admin-upload-form" onSubmit={handleAdminUploadSubmit} className="space-y-4">
                    {/* Ringkasan Peserta */}
                    <div className="rounded-xl border border-[#DCE7F3] bg-[#F8FBFF] p-3 text-xs">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7C93] mb-1">
                            Target Kenshi
                        </div>
                        <div className="font-bold text-sm text-[#0E2747]">
                            {uploadModalParticipant?.participant_name}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[#6B7C93] mt-1">
                            <span>No. Kenshi: <strong className="font-mono text-[#0E2747]">{uploadModalParticipant?.kenshi_id_number || '-'}</strong></span>
                            <span>Tingkatan: <strong className="text-[#0E2747]">{uploadModalParticipant?.dan_level || '-'}</strong></span>
                            <span>Dojo: <strong className="text-[#0E2747]">{uploadModalParticipant?.origin_dojo || uploadModalParticipant?.dojo || '-'}</strong></span>
                        </div>
                    </div>

                    {uploadModalParticipant?.file_url && (
                        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-2.5 text-xs text-indigo-900 flex items-center justify-between">
                            <div>
                                <span className="font-semibold">Sudah ada berkas terunggah:</span> {uploadModalParticipant.file_name || uploadModalParticipant.original_file_name || 'Berkas scan'}
                            </div>
                            <a
                                href={uploadModalParticipant.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-indigo-700 underline text-[11px] hover:text-indigo-900"
                            >
                                Lihat File
                            </a>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Kategori Formulir" required>
                            <Select
                                value={adminUploadFormType}
                                onChange={(e) => setAdminUploadFormType(e.target.value)}
                            >
                                <option value="PELATIH">Pelatih</option>
                                <option value="PENGUJI">Penguji</option>
                                <option value="WASIT">Wasit</option>
                            </Select>
                        </FormField>

                        <FormField label="Tingkatan Penataran" required>
                            <Select
                                value={adminUploadPenataranLevel}
                                onChange={(e) => setAdminUploadPenataranLevel(e.target.value)}
                            >
                                <option value="Daerah">Daerah</option>
                                <option value="Nasional">Nasional</option>
                            </Select>
                        </FormField>
                    </div>

                    <FormField
                        label="Pilih File Berkas Formulir (Scan / PDF / Word / Gambar)"
                        helperText="Format yang didukung: PDF, DOC, DOCX, JPG, PNG (Maks. 10MB)"
                        required
                    >
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => setAdminUploadFile(e.target.files?.[0] || null)}
                            className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#0B63CE] hover:file:bg-blue-100 cursor-pointer border border-[#DCE7F3] rounded-lg p-1.5 bg-white"
                        />
                        {adminUploadFile && (
                            <p className="mt-1 text-xs text-emerald-600 font-medium">
                                File terpilih: {adminUploadFile.name} ({(adminUploadFile.size / 1024).toFixed(1)} KB)
                            </p>
                        )}
                    </FormField>

                    <div className="rounded-lg border border-[#DCE7F3] bg-[#F8FBFF] p-3">
                        <Checkbox
                            id="admin_auto_verify_form"
                            checked={adminUploadAutoVerify}
                            onChange={(e) => setAdminUploadAutoVerify(e.target.checked)}
                            label="Langsung tandai status Terverifikasi (Disetujui Admin)"
                            helperText="Jika dicentang, status formulir kenshi langsung Terverifikasi tanpa perlu langkah persetujuan terpisah."
                        />
                    </div>

                    <FormField label="Catatan / Keterangan (Opsional)">
                        <Input
                            type="text"
                            value={adminUploadNotes}
                            onChange={(e) => setAdminUploadNotes(e.target.value)}
                            placeholder="Contoh: Berkas fisik diserahkan saat registrasi ulang atau verifikasi manual"
                        />
                    </FormField>
                </form>
            </Modal>

            <AlertDialog
                isOpen={Boolean(attendanceResetTarget)}
                onClose={() => setAttendanceResetTarget(null)}
                title={attendanceResetTarget === 'all' ? 'Reset seluruh hasil peserta event?' : 'Reset seluruh hasil peserta ini?'}
                description={attendanceResetTarget === 'all'
                    ? 'Semua presensi, percobaan dan jawaban CBT, nilai, pengawasan ujian, revisi, sertifikat, transkrip, serta status kelulusan peserta pada event ini akan dihapus. Data peserta, rundown, materi, dan paket ujian tetap tersedia.'
                    : `Semua presensi, nilai, hasil CBT, revisi, sertifikat, dan transkrip ${attendanceResetTarget?.participant_name || 'peserta'} pada event ini akan dihapus. Peserta harus memulai kembali dari pemindaian QR kedatangan.`}
                confirmText={isResettingAttendance ? 'Mereset...' : 'Reset hasil peserta'}
                cancelText="Batal"
                variant="danger"
                loading={isResettingAttendance}
                onConfirm={handleAttendanceReset}
            />
        </AdminLayout>
    );
}

function ParticipantCredentialRow({ eventId, participant }) {
    const documentVariants = participant.document_variants?.length
        ? participant.document_variants
        : [{ ...participant, track_code: participant.track_code, label: participant.track_name }];

    return (
        <li className="px-4 py-5 [content-visibility:auto] [contain-intrinsic-size:auto_36rem] sm:px-6">
            <div className="grid gap-5 xl:grid-cols-[14rem_minmax(0,1fr)] xl:gap-8">
                <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3 xl:block">
                        <div>
                            <h3 className="break-words font-display text-lg font-semibold text-[#0E2747]">{participant.name}</h3>
                            <p className="mt-1 text-sm text-[#6B7C93]">{participant.kenshi_id && participant.kenshi_id !== '-' ? `NIK ${participant.kenshi_id}` : 'NIK belum dicatat'}</p>
                        </div>
                        <Badge variant="primary" className="shrink-0 xl:mt-3">{participant.track_code}</Badge>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-[#6B7C93]">{participant.track_name}</p>
                </div>

                <div className="space-y-5">
                    {documentVariants.map((variant) => (
                        <div key={variant.track_code}>
                            {documentVariants.length > 1 && (
                                <h4 className="mb-2 text-sm font-semibold text-[#0E2747]">Dokumen {variant.label}</h4>
                            )}
                            <div className="grid gap-4 lg:grid-cols-2">
                                <ParticipantDocumentUpload
                                    eventId={eventId}
                                    participant={participant}
                                    variant={variant}
                                    type="certificate"
                                    title="E-Sertifikat"
                                    description="Berkas pengukuhan peserta"
                                    icon={Award}
                                    number={variant.certificate_number}
                                    suggestedNumber={variant.suggested_certificate_number}
                                    configuredNumber={variant.configured_certificate_number}
                                    downloadUrl={variant.certificate_download_url}
                                    previewUrl={variant.certificate_preview_url}
                                />
                                <ParticipantDocumentUpload
                                    eventId={eventId}
                                    participant={participant}
                                    variant={variant}
                                    type="transcript"
                                    title="E-Transkrip"
                                    description="Rekap kompetensi dan JP"
                                    icon={FileText}
                                    number={variant.transcript_number}
                                    suggestedNumber={variant.suggested_transcript_number}
                                    configuredNumber={variant.configured_transcript_number}
                                    downloadUrl={variant.transcript_download_url}
                                    previewUrl={variant.transcript_preview_url}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </li>
    );
}

function ParticipantDocumentUpload({ eventId, participant, variant, type, title, description, icon: Icon, number, suggestedNumber, configuredNumber, downloadUrl, previewUrl }) {
    const isCertificate = type === 'certificate';
    const fileField = isCertificate ? 'certificate' : 'transcript';
    const numberField = isCertificate ? 'certificate_number' : 'transcript_number';
    const endpoint = isCertificate ? 'sertifikat' : 'transkrip';
    const canGenerate = isCertificate ? variant.can_generate_certificate : variant.can_generate_transcript;
    const generationUnavailableReason = isCertificate
        ? variant.certificate_generation_unavailable_reason
        : variant.transcript_generation_unavailable_reason;
    const documentId = `${type}-${participant.id}-${variant.track_code}`;
    const isLegacyDualPlaceholder = !downloadUrl && /^SK-PWA[DN]-/.test(number || '');
    const initialNumber = (isLegacyDualPlaceholder ? suggestedNumber : number) || suggestedNumber || '';
    const form = useForm({ [fileField]: null, [numberField]: initialNumber, document_track: variant.track_code });
    const generationForm = useForm({ [numberField]: initialNumber, document_track: variant.track_code });
    const [inputKey, setInputKey] = useState(0);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const updateNumber = (value) => {
        form.setData(numberField, value);
        generationForm.setData(numberField, value);
        form.clearErrors(numberField);
        generationForm.clearErrors(numberField);
    };

    const submit = (event) => {
        event.preventDefault();
        form.post(`/admin/event/${eventId}/peserta/${participant.id}/${endpoint}`, {
            forceFormData: true,
            preserveScroll: true,
            onError: (errors) => {
                const invalidField = errors[fileField] ? documentId : `${documentId}-number`;
                requestAnimationFrame(() => document.getElementById(invalidField)?.focus());
            },
            onSuccess: () => {
                form.setData(fileField, null);
                setInputKey((current) => current + 1);
            },
        });
    };

    const generate = () => {
        generationForm.post(`/admin/event/${eventId}/peserta/${participant.id}/${endpoint}/generate`, {
            preserveScroll: true,
            onError: () => {
                requestAnimationFrame(() => document.getElementById(`${documentId}-number`)?.focus());
            },
        });
    };

    const deleteDocument = () => {
        router.delete(`/admin/event/${eventId}/peserta/${participant.id}/${endpoint}?document_track=${encodeURIComponent(variant.track_code)}`, {
            preserveScroll: true,
            onStart: () => setIsDeleting(true),
            onFinish: () => setIsDeleting(false),
            onSuccess: () => setDeleteOpen(false),
        });
    };

    return (
        <section aria-labelledby={`${documentId}-title`} className="border border-[#DCE7F3] bg-[#F8FBFF]/60 p-4">
            <div className="flex items-start justify-between gap-3 border-b border-[#DCE7F3] pb-3">
                <div className="flex min-w-0 items-start gap-3">
                    <span className={`flex size-9 shrink-0 items-center justify-center border bg-white ${isCertificate ? 'border-[#BCE0FD] text-[#0B63CE]' : 'border-[#DDD3FA] text-[#7957D5]'}`}>
                        <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <h5 id={`${documentId}-title`} className="text-sm font-semibold text-[#0E2747]">{title}</h5>
                        <p className="mt-0.5 text-xs text-[#6B7C93]">{description}</p>
                    </div>
                </div>
                <Badge variant={downloadUrl ? 'success' : 'draft'} dot>{downloadUrl ? 'Tersedia' : 'Belum ada'}</Badge>
            </div>

            <div className="py-3 text-xs">
                {downloadUrl ? (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[#6B7C93]">{number ? `Nomor ${number}` : 'Nomor belum dicatat'}</span>
                        <div className="flex flex-wrap items-center gap-4">
                            {previewUrl && <button type="button" onClick={() => setIsPreviewOpen(true)} className="inline-flex min-h-11 items-center gap-1 font-semibold text-[#0B63CE] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]"><Eye className="size-3.5" aria-hidden="true" /> Preview</button>}
                            <a href={downloadUrl} className="inline-flex min-h-11 items-center font-semibold text-[#0B63CE] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]">Unduh PDF</a>
                            <button type="button" onClick={() => setDeleteOpen(true)} className="inline-flex min-h-11 items-center gap-1 font-semibold text-[#B42318] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B42318]">
                                <Trash2 className="size-3.5" aria-hidden="true" /> Hapus PDF
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="leading-5 text-[#6B7C93]">Buat dari template jalur atau unggah PDF final agar dapat diakses peserta.</p>
                )}
            </div>

            <form onSubmit={submit} className="grid gap-3 border-t border-[#DCE7F3] pt-3 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
                <div className="sm:col-span-2 lg:col-span-1 2xl:col-span-2">
                    <Input
                        id={`${documentId}-number`}
                        name={numberField}
                        autoComplete="off"
                        spellCheck={false}
                        label={`Nomor ${isCertificate ? 'sertifikat' : 'transkrip'}`}
                        value={form.data[numberField]}
                        onChange={(event) => updateNumber(event.target.value)}
                        error={form.errors[numberField] || generationForm.errors[numberField]}
                    />
                    <p className="mt-1 text-[11px] leading-4 text-[#6B7C93]">
                        Nomor sesuai pengaturan: <span className="font-semibold text-[#112743]">{configuredNumber || 'Belum tersedia'}</span>. {canGenerate ? 'Periksa sebelum menerbitkan.' : generationUnavailableReason || 'PDF otomatis belum tersedia; gunakan unggah manual.'}
                    </p>
                    {configuredNumber && form.data[numberField] !== configuredNumber && (
                        <button type="button" onClick={() => updateNumber(configuredNumber)} className="mt-2 min-h-11 text-xs font-semibold text-[#0B63CE] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]">Gunakan nomor sesuai pengaturan</button>
                    )}
                </div>
                <FileInput
                    key={inputKey}
                    id={documentId}
                    name={fileField}
                    label="Berkas PDF"
                    accept="application/pdf,.pdf"
                    required
                    helperText="PDF, maksimal 10 MB"
                    onChange={(event) => form.setData(fileField, event.target.files?.[0] || null)}
                    error={form.errors[fileField]}
                />
                <div className="flex flex-col gap-2 sm:self-end">
                    <Button
                        type="button"
                        variant="secondary"
                        icon={Sparkles}
                        loading={generationForm.processing}
                        disabled={!canGenerate || form.processing}
                        onClick={generate}
                    >
                        {downloadUrl ? 'Generate ulang' : 'Generate otomatis'}
                    </Button>
                    <Button type="submit" loading={form.processing} disabled={generationForm.processing}>
                        {downloadUrl ? `Ganti ${title}` : `Unggah ${title}`}
                    </Button>
                </div>
            </form>
            {isPreviewOpen && previewUrl && (
                <Modal
                    isOpen
                    onClose={() => setIsPreviewOpen(false)}
                    title={`Preview ${title} ${participant.name}`}
                    description={`${variant.label} · Nomor ${number || 'belum dicatat'}`}
                    size="full"
                    footer={<a href={downloadUrl} className="inline-flex min-h-11 items-center font-semibold text-[#0B63CE] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B63CE]">Unduh PDF</a>}
                >
                    <iframe
                        src={previewUrl}
                        title={`${title} ${participant.name}`}
                        className="h-[calc(100dvh-13rem)] min-h-80 w-full border border-[#DCE7F3] bg-white"
                    />
                    <p className="mt-2 text-xs text-[#6B7C93]">Jika PDF tidak tampil di perangkat ini, gunakan tombol Unduh PDF.</p>
                </Modal>
            )}
            <AlertDialog
                isOpen={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={deleteDocument}
                title={`Hapus PDF ${title} ${participant.name}?`}
                description={`PDF akan dihapus dan tidak lagi bisa diunduh peserta. Nomor ${isCertificate ? 'sertifikat' : 'transkrip'} tetap tersimpan; Anda dapat mengunggah atau membuat ulang PDF.`}
                confirmText={isDeleting ? 'Menghapus...' : 'Hapus PDF'}
                variant="danger"
                loading={isDeleting}
            />
        </section>
    );
}
