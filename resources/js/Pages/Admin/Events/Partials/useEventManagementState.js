import { useState, useEffect } from 'react';
import { router, useForm } from '@inertiajs/react';

export default function useEventManagementState({ event, sessionTypes, selectedDay, setSelectedDay, learningModules, linkedCbtPackages }) {
    const roomForm = useForm({ name: '' });
    const trackForm = useForm({ code: '', name: '', description: '' });
    const legendForm = useForm({ acronym: '', full_name: '', category: 'istilah', description: '' });
    const requirementForm = useForm({ item: '', mandatory: true });
    const facilityForm = useForm({ name: '', status: 'prepared', notes: '' });
    const speakerForm = useForm({
        name: '',
        type: 'internal',
        title_degree: '',
        specialization: '',
        contact_email: '',
        is_supervisor: false,
    });
    const [accountTargetSpeaker, setAccountTargetSpeaker] = useState(null);
    const speakerAccountForm = useForm({
        email: '',
        password: 'Pemateri2026!',
    });

    // Modals
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState(null);
    const [selectedSessionLinks, setSelectedSessionLinks] = useState([]);
    const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
    const [editingModule, setEditingModule] = useState(null);

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
    const [editingParticipantPhotoPreview, setEditingParticipantPhotoPreview] = useState(null);

    // Master Linking Modals
    const [isAttachModuleModalOpen, setIsAttachModuleModalOpen] = useState(false);
    const [isAttachCbtModalOpen, setIsAttachCbtModalOpen] = useState(false);

    // QR Preview Modal
    const [isQrPreviewModalOpen, setIsQrPreviewModalOpen] = useState(false);
    const [previewQrSession, setPreviewQrSession] = useState(null);

    // Document Preview Modal (E-Sertifikat & E-Transkrip)
    const [activeDocumentPreview, setActiveDocumentPreview] = useState(null);

    // Attendance Override & Generate Modal
    const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
    const [isEditAttendanceModalOpen, setIsEditAttendanceModalOpen] = useState(false);
    const [editingAttendance, setEditingAttendance] = useState(null);
    const [attendanceResetTarget, setAttendanceResetTarget] = useState(null);
    const [isResettingAttendance, setIsResettingAttendance] = useState(false);
    const [isGenerateAttendanceModalOpen, setIsGenerateAttendanceModalOpen] = useState(false);
    const [isGeneratingAttendance, setIsGeneratingAttendance] = useState(false);
    const [generateTrack, setGenerateTrack] = useState('all');
    const [generateStatus, setGenerateStatus] = useState('present');
    const [generateIncludeArrival, setGenerateIncludeArrival] = useState(true);
    const [generateIncludeDaily, setGenerateIncludeDaily] = useState(true);
    const [generateIncludeSessions, setGenerateIncludeSessions] = useState(true);
    const [generateDay, setGenerateDay] = useState('all');

    const [attendanceSearch, setAttendanceSearch] = useState('');
    const [attendanceStatusFilter, setAttendanceStatusFilter] = useState('all');
    const [attendancePerPage, setAttendancePerPage] = useState(25);
    const [attendancePage, setAttendancePage] = useState(1);

    // CBT Attempt Restart, Complete & Delete State
    const [restartExamTarget, setRestartExamTarget] = useState(null);
    const [isRestartingExam, setIsRestartingExam] = useState(false);
    const [completeExamTarget, setCompleteExamTarget] = useState(null);
    const [isCompletingExam, setIsCompletingExam] = useState(false);
    const [deleteExamTarget, setDeleteExamTarget] = useState(null);
    const [isDeletingExam, setIsDeletingExam] = useState(false);

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
        requires_attendance_before_cbt: true,
        is_hidden: false,
    });

    // 1b. Reschedule / Molor Form
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
    const [reschedulingSession, setReschedulingSession] = useState(null);
    const rescheduleForm = useForm({
        day_number: selectedDay || 1,
        start_time: '',
        end_time: '',
        shift_minutes: 0,
        shift_subsequent_sessions: true,
        status: 'scheduled',
        speaker_id: '',
        room: '',
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
        photo: null,
        remove_photo: false,
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
    const editAttendanceForm = useForm({
        status: 'present',
        attendance_type: 'check_in',
        checked_in_at: '',
        method: 'manual_admin',
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
        router.post(`/admin/event/${event.id}/sesi/${session.id}/absensi/buka`, {
            attendance_setting: session.attendance_setting === 'check_in_out' ? 'check_in_out' : 'check_in',
        }, {
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
        if (editingModule) {
            moduleForm.transform((data) => ({
                ...data,
                _method: 'PUT',
            })).post(`/admin/event/${event.id}/modul/${editingModule.id}`, {
                forceFormData: true,
                onSuccess: () => {
                    setIsModuleModalOpen(false);
                    setEditingModule(null);
                    moduleForm.reset();
                },
            });
        } else {
            moduleForm.transform((data) => ({
                ...data,
                _method: 'POST',
            })).post(`/admin/event/${event.id}/modul`, {
                forceFormData: true,
                onSuccess: () => {
                    setIsModuleModalOpen(false);
                    moduleForm.reset();
                },
            });
        }
    };

    const openEditModuleModal = (m) => {
        setEditingModule(m);
        moduleForm.clearErrors();
        moduleForm.setData({
            code: m.code || '',
            title: m.title || '',
            speaker_id: m.speaker?.id || '',
            material_id: m.material?.id || '',
            source_type: m.source_type || 'collection',
            source_url: m.source_url || '',
            source_file: null,
            target_tracks: m.target_tracks || [],
            duration_jp: m.duration_jp || 2,
            delivery_method: m.delivery_method || '',
            description: m.description || '',
            learning_indicators: m.learning_indicators || '',
            publication_status: m.publication_status || 'draft',
        });
        setIsModuleModalOpen(true);
    };

    const handleDeleteModule = (m) => {
        if (confirm(`Hapus modul kurikulum "${m.title}" (${m.code}) dari event ini?`)) {
            router.delete(`/admin/event/${event.id}/modul/${m.id}`, {
                preserveScroll: true,
            });
        }
    };

    const handleParticipantPhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            participantEditForm.setData((prev) => ({ ...prev, photo: file, remove_photo: false }));
            setEditingParticipantPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleParticipantRemovePhoto = () => {
        participantEditForm.setData((prev) => ({ ...prev, photo: null, remove_photo: true }));
        setEditingParticipantPhotoPreview(null);
    };

    const handleUpdateParticipant = (e) => {
        e.preventDefault();
        if (!editingParticipant) return;
        participantEditForm.post(`/admin/event/${event.id}/peserta/${editingParticipant.id}`, {
            forceFormData: true,
            onSuccess: () => {
                setEditingParticipant(null);
                setEditingParticipantPhotoPreview(null);
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

    const handleOpenEditAttendance = (att) => {
        setEditingAttendance(att);
        editAttendanceForm.setData({
            status: att.status || 'present',
            attendance_type: att.attendance_type || 'check_in',
            checked_in_at: att.checked_in_at_raw || '',
            method: att.method || 'manual_admin',
            notes: att.notes || '',
        });
        setIsEditAttendanceModalOpen(true);
    };

    const handleSaveEditAttendance = (e) => {
        e.preventDefault();
        if (!editingAttendance) return;
        editAttendanceForm.put(`/admin/event/${event.id}/absensi/${editingAttendance.id}`, {
            onSuccess: () => {
                setIsEditAttendanceModalOpen(false);
                setEditingAttendance(null);
                editAttendanceForm.reset();
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

        const validStatus = ['scheduled', 'ongoing', 'completed', 'cancelled', 'delayed'].includes(session.status)
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
            requires_attendance_before_cbt: session.requires_attendance_before_cbt !== undefined ? Boolean(session.requires_attendance_before_cbt) : true,
            is_hidden: Boolean(session.is_hidden),
        });
        setIsSessionModalOpen(true);
    };

    const handleToggleHidden = (session) => {
        router.patch(`/admin/event/${event.id}/sesi/${session.id}/toggle-hidden`, {}, {
            preserveScroll: true,
        });
    };

    const openRescheduleModal = (session) => {
        setReschedulingSession(session);
        rescheduleForm.clearErrors();
        rescheduleForm.setData({
            day_number: session.day_number || selectedDay,
            start_time: session.start_time ? session.start_time.substring(0, 5) : '',
            end_time: session.end_time ? session.end_time.substring(0, 5) : '',
            shift_minutes: 0,
            shift_subsequent_sessions: true,
            status: session.status || 'scheduled',
            speaker_id: session.speaker?.id || session.speaker_id || '',
            room: session.room || '',
        });
        setIsRescheduleModalOpen(true);
    };

    const handleQuickShift = (mins) => {
        const curEnd = rescheduleForm.data.end_time;
        if (!curEnd) return;
        const [h, m] = curEnd.split(':').map(Number);
        const date = new Date();
        date.setHours(h, m + mins, 0, 0);
        const newH = String(date.getHours()).padStart(2, '0');
        const newM = String(date.getMinutes()).padStart(2, '0');
        const newEnd = `${newH}:${newM}`;

        rescheduleForm.setData((prev) => ({
            ...prev,
            end_time: newEnd,
            shift_minutes: (prev.shift_minutes || 0) + mins,
            status: 'delayed',
        }));
    };

    const handleSaveReschedule = (e) => {
        e.preventDefault();
        if (!reschedulingSession) return;
        const targetDay = Number(rescheduleForm.data.day_number);
        rescheduleForm.post(`/admin/event/${event.id}/sesi/${reschedulingSession.id}/reschedule`, {
            preserveScroll: true,
            onSuccess: () => {
                if (targetDay && targetDay !== selectedDay) {
                    setSelectedDay(targetDay);
                }
                setIsRescheduleModalOpen(false);
                setReschedulingSession(null);
            },
        });
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
        setEditingParticipantPhotoPreview(ep.photo_url || null);
        participantEditForm.setData({
            rotation_group: ep.rotation_group || 'A1',
            admin_status: ep.admin_status || 'verified',
            attendance_status: ep.attendance_status || 'present',
            theory_score: ep.theory_score ?? '',
            practice_score: ep.practice_score ?? '',
            graduation_status: ep.graduation_status || 'graduated',
            certificate_number: ep.certificate_number || '',
            notes: ep.notes || '',
            photo: null,
            remove_photo: false,
        });
    };

    return {
        roomForm,
        trackForm,
        legendForm,
        requirementForm,
        facilityForm,
        speakerForm,
        accountTargetSpeaker,
        setAccountTargetSpeaker,
        speakerAccountForm,
        isSessionModalOpen,
        setIsSessionModalOpen,
        editingSession,
        setEditingSession,
        selectedSessionLinks,
        setSelectedSessionLinks,
        isModuleModalOpen,
        setIsModuleModalOpen,
        editingModule,
        setEditingModule,
        isAddParticipantModalOpen,
        setIsAddParticipantModalOpen,
        participantMode,
        setParticipantMode,
        editingParticipant,
        setEditingParticipant,
        editingParticipantPhotoPreview,
        isAttachModuleModalOpen,
        setIsAttachModuleModalOpen,
        isAttachCbtModalOpen,
        setIsAttachCbtModalOpen,
        activeDocumentPreview,
        setActiveDocumentPreview,
        isOverrideModalOpen,
        setIsOverrideModalOpen,
        isEditAttendanceModalOpen,
        setIsEditAttendanceModalOpen,
        editingAttendance,
        setEditingAttendance,
        attendanceResetTarget,
        setAttendanceResetTarget,
        isResettingAttendance,
        setIsResettingAttendance,
        isGenerateAttendanceModalOpen,
        setIsGenerateAttendanceModalOpen,
        isGeneratingAttendance,
        setIsGeneratingAttendance,
        generateTrack,
        setGenerateTrack,
        generateStatus,
        setGenerateStatus,
        generateIncludeArrival,
        setGenerateIncludeArrival,
        generateIncludeDaily,
        setGenerateIncludeDaily,
        generateIncludeSessions,
        setGenerateIncludeSessions,
        generateDay,
        setGenerateDay,
        attendanceSearch,
        setAttendanceSearch,
        attendanceStatusFilter,
        setAttendanceStatusFilter,
        attendancePerPage,
        setAttendancePerPage,
        attendancePage,
        setAttendancePage,
        restartExamTarget,
        setRestartExamTarget,
        isRestartingExam,
        setIsRestartingExam,
        completeExamTarget,
        setCompleteExamTarget,
        isCompletingExam,
        setIsCompletingExam,
        deleteExamTarget,
        setDeleteExamTarget,
        isDeletingExam,
        setIsDeletingExam,
        isCbtPackageModalOpen,
        setIsCbtPackageModalOpen,
        editingCbtPackage,
        setEditingCbtPackage,
        isAddQuestionModalOpen,
        setIsAddQuestionModalOpen,
        activeCbtPackageForQuestion,
        setActiveCbtPackageForQuestion,
        sessionForm,
        isRescheduleModalOpen,
        setIsRescheduleModalOpen,
        reschedulingSession,
        setReschedulingSession,
        rescheduleForm,
        attachModuleForm,
        attachCbtForm,
        moduleForm,
        participantEditForm,
        participantAddForm,
        participantNewForm,
        overrideForm,
        editAttendanceForm,
        cbtPackageForm,
        questionForm,
        handleSaveSession,
        handleDeleteSession,
        handleOpenAttendance,
        handleCloseAttendance,
        handleSaveModule,
        openEditModuleModal,
        handleDeleteModule,
        handleParticipantPhotoChange,
        handleParticipantRemovePhoto,
        handleUpdateParticipant,
        handleAddParticipant,
        handleCreateParticipant,
        handleRemoveParticipant,
        handleSaveOverride,
        handleOpenEditAttendance,
        handleSaveEditAttendance,
        handleSaveCbtPackage,
        handleDeleteCbtPackage,
        handleSaveQuestion,
        openEditSessionModal,
        handleToggleHidden,
        openRescheduleModal,
        handleQuickShift,
        handleSaveReschedule,
        handleAttachModule,
        handleDetachModule,
        handleAttachCbt,
        handleDetachCbt,
        openEditParticipantModal,
    };
}
